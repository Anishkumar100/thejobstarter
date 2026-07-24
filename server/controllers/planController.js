import Plan from '../models/Plan.js';
import BatchPlan from '../models/BatchPlan.js';
import Batch from '../models/Batch.js';
import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import OsLesson from '../models/OsLesson.js';
import OsSubtopic from '../models/OsSubtopic.js';
import OsProblem from '../models/OsProblem.js';
import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { getPlanProgress } from '../services/planProgressService.js';

/*
 * Map of subject → { Lesson, Subtopic, Problem } models
 * Mirrors the pattern in progressService.js
 */
const SUBJECT_MODELS = {
  dsa: { lesson: DsaLesson, subtopic: Subtopic, problem: Problem },
  dbms: { lesson: DbmsLesson, subtopic: DbmsSubtopic, problem: DbmsProblem },
  os: { lesson: OsLesson, subtopic: OsSubtopic, problem: OsProblem },
  programming: { lesson: ProgrammingLesson, subtopic: ProgrammingSubtopic, problem: ProgrammingProblem }
};

/* ─────────────────────────────────────────────── */
/*  PLAN CRUD  — Admin                            */
/* ─────────────────────────────────────────────── */

/*
 * GET /api/plans
 * List plans with optional center filter, status filter, search
 */
export async function getPlans(req, res) {
  try {
    console.log('[PLAN] Fetching plans with query:', req.query);
    const { center, status, search, subject, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const query = {};
    if (center) query.coachingCenter = center;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (subject) query['items.subject'] = subject;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const plans = await Plan.find(query)
      .populate('coachingCenter', 'name')
      .populate('createdBy', 'displayName username email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await Plan.countDocuments(query);

    console.log('[PLAN] Plans fetched:', total);
    res.json({ data: plans, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[PLAN] Error fetching plans:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/plans/:id
 * Fetch a single plan by ID
 */
export async function getPlanById(req, res) {
  try {
    console.log('[PLAN] Fetching plan by ID:', req.params.id);
    const plan = await Plan.findById(req.params.id)
      .populate('coachingCenter', 'name')
      .populate('createdBy', 'displayName username');
    if (!plan) {
      console.log('[PLAN] Plan not found:', req.params.id);
      return res.status(404).json({ error: 'Plan not found' });
    }
    console.log('[PLAN] Plan fetched:', plan.name);
    res.json({ data: plan });
  } catch (error) {
    console.error('[PLAN] Error fetching plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/plans
 * Create a new plan
 */
export async function createPlan(req, res) {
  try {
    console.log('[PLAN] Creating plan...');
    const { coachingCenter, name, description, durationDays, items } = req.body;

    if (!coachingCenter || !name || !durationDays) {
      return res.status(400).json({ error: 'coachingCenter, name, and durationDays are required' });
    }

    /* Look up the MongoDB user by Clerk ID */
    const user = await User.findOne({ clerkId: req.userId }).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = await Plan.create({
      coachingCenter,
      name,
      description: description || '',
      durationDays,
      status: 'draft',
      createdBy: user._id,
      items: items || []
    });

    console.log('[PLAN] Plan created:', plan.name);
    res.status(201).json({ data: plan });
  } catch (error) {
    console.error('[PLAN] Error creating plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/plans/:id
 * Update a plan
 */
export async function updatePlan(req, res) {
  try {
    console.log('[PLAN] Updating plan:', req.params.id);
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      console.log('[PLAN] Plan not found:', req.params.id);
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, description, durationDays, status, items } = req.body;
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (durationDays !== undefined) plan.durationDays = durationDays;
    if (status !== undefined) plan.status = status;
    if (items !== undefined) plan.items = items;

    await plan.save();

    console.log('[PLAN] Plan updated:', plan.name);
    res.json({ data: plan });
  } catch (error) {
    console.error('[PLAN] Error updating plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/plans/:id
 * Delete a plan — retires associated BatchPlans (sets to 'completed')
 * Does NOT cascade delete BatchPlans — existing schedules remain intact
 */
export async function deletePlan(req, res) {
  try {
    console.log('[PLAN] Deleting plan:', req.params.id);
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      console.log('[PLAN] Plan not found:', req.params.id);
      return res.status(404).json({ error: 'Plan not found' });
    }

    /* Retire all active BatchPlans referencing this plan */
    await BatchPlan.updateMany(
      { plan: plan._id, status: 'active' },
      { status: 'completed' }
    );

    await Plan.findByIdAndDelete(req.params.id);

    console.log('[PLAN] Plan deleted:', plan.name);
    res.json({ data: { message: 'Plan deleted successfully' } });
  } catch (error) {
    console.error('[PLAN] Error deleting plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ─────────────────────────────────────────────── */
/*  COORDINATOR-PLAN CRUD — scoped to own center    */
/* ─────────────────────────────────────────────── */

/*
 * GET /api/coordinator/plans
 * List plans scoped to the coordinator's center
 */
export async function getCoordinatorPlans(req, res) {
  try {
    console.log('[PLAN] Fetching coordinator plans for center:', req.coordinatorCenterId);
    const { status, search, subject, dateFrom, dateTo } = req.query;
    const query = { coachingCenter: req.coordinatorCenterId };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (subject) query['items.subject'] = subject;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const plans = await Plan.find(query)
      .populate('createdBy', 'displayName username email')
      .sort({ createdAt: -1 });

    console.log('[PLAN] Coordinator plans fetched:', plans.length);
    res.json({ data: plans });
  } catch (error) {
    console.error('[PLAN] Error fetching coordinator plans:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/coordinator/plans
 * Create a plan for the coordinator's own center
 */
export async function createCoordinatorPlan(req, res) {
  try {
    console.log('[PLAN] Coordinator creating plan for center:', req.coordinatorCenterId);
    const { name, description, durationDays, items } = req.body;

    if (!name || !durationDays) {
      return res.status(400).json({ error: 'name and durationDays are required' });
    }

    /* Look up the MongoDB user by Clerk ID */
    const user = await User.findOne({ clerkId: req.userId }).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = await Plan.create({
      coachingCenter: req.coordinatorCenterId,
      name,
      description: description || '',
      durationDays,
      status: 'draft',
      createdBy: user._id,
      items: items || []
    });

    console.log('[PLAN] Coordinator plan created:', plan.name);
    res.status(201).json({ data: plan });
  } catch (error) {
    console.error('[PLAN] Error creating coordinator plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/coordinator/plans/:id
 * Update a plan (scoped to own center)
 */
export async function updateCoordinatorPlan(req, res) {
  try {
    console.log('[PLAN] Coordinator updating plan:', req.params.id);
    const plan = await Plan.findOne({ _id: req.params.id, coachingCenter: req.coordinatorCenterId });
    if (!plan) {
      console.log('[PLAN] Plan not found or not in your center:', req.params.id);
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, description, durationDays, status, items } = req.body;
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (durationDays !== undefined) plan.durationDays = durationDays;
    if (status !== undefined) plan.status = status;
    if (items !== undefined) plan.items = items;

    await plan.save();
    console.log('[PLAN] Coordinator plan updated:', plan.name);
    res.json({ data: plan });
  } catch (error) {
    console.error('[PLAN] Error updating coordinator plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/plans/:id
 * Fetch a single plan (scoped to own center)
 */
export async function getCoordinatorPlanById(req, res) {
  try {
    console.log('[PLAN] Coordinator fetching plan:', req.params.id);
    const plan = await Plan.findOne({ _id: req.params.id, coachingCenter: req.coordinatorCenterId })
      .populate('createdBy', 'displayName username');
    if (!plan) {
      console.log('[PLAN] Plan not found or not in your center:', req.params.id);
      return res.status(404).json({ error: 'Plan not found' });
    }
    console.log('[PLAN] Coordinator plan fetched:', plan.name);
    res.json({ data: plan });
  } catch (error) {
    console.error('[PLAN] Error fetching coordinator plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/coordinator/plans/:id
 * Delete a plan (scoped to own center)
 */
export async function deleteCoordinatorPlan(req, res) {
  try {
    console.log('[PLAN] Coordinator deleting plan:', req.params.id);
    const plan = await Plan.findOne({ _id: req.params.id, coachingCenter: req.coordinatorCenterId });
    if (!plan) {
      console.log('[PLAN] Plan not found or not in your center:', req.params.id);
      return res.status(404).json({ error: 'Plan not found' });
    }

    await BatchPlan.updateMany(
      { plan: plan._id, status: 'active' },
      { status: 'completed' }
    );

    await Plan.findByIdAndDelete(req.params.id);
    console.log('[PLAN] Coordinator plan deleted:', plan.name);
    res.json({ data: { message: 'Plan deleted successfully' } });
  } catch (error) {
    console.error('[PLAN] Error deleting coordinator plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ─────────────────────────────────────────────── */
/*  HIERARCHY — Lesson > Subtopic > Problem tree   */
/* ─────────────────────────────────────────────── */

/*
 * GET /api/plans/hierarchy?subject=dsa
 * Returns the lesson > subtopic > problem tree for the content browser
 */
export async function getContentHierarchy(req, res) {
  try {
    const { subject } = req.query;
    if (!subject || !SUBJECT_MODELS[subject]) {
      return res.status(400).json({ error: 'Invalid or missing subject. Must be: dsa, dbms, os, programming' });
    }

    console.log('[PLAN] Fetching hierarchy for subject:', subject);
    const models = SUBJECT_MODELS[subject];

    /* Fetch all lessons for this subject */
    const lessons = await models.lesson.find({}).select('title slug').sort({ order: 1, title: 1 }).lean();
    const lessonSlugs = lessons.map(l => l.slug);

    /* Fetch all subtopics for these lessons */
    const subtopics = await models.subtopic.find({ lessonSlug: { $in: lessonSlugs } })
      .select('title slug lessonSlug')
      .sort({ order: 1, title: 1 })
      .lean();

    const subtopicSlugs = subtopics.map(s => s.slug);

    /* Fetch all problems for these subtopics */
    const problems = await models.problem.find({ subtopicSlug: { $in: subtopicSlugs } })
      .select('title slug subtopicSlug difficulty')
      .sort({ title: 1 })
      .lean();

    /* Build the tree */
    const problemMap = {};
    for (const p of problems) {
      if (!problemMap[p.subtopicSlug]) problemMap[p.subtopicSlug] = [];
      problemMap[p.subtopicSlug].push({ _id: p._id, title: p.title, slug: p.slug, difficulty: p.difficulty });
    }

    const subtopicMap = {};
    for (const s of subtopics) {
      subtopicMap[s.lessonSlug] = subtopicMap[s.lessonSlug] || [];
      subtopicMap[s.lessonSlug].push({
        _id: s._id,
        title: s.title,
        slug: s.slug,
        problems: problemMap[s.slug] || []
      });
    }

    const tree = lessons.map(l => ({
      _id: l._id,
      title: l.title,
      slug: l.slug,
      subtopics: subtopicMap[l.slug] || []
    }));

    console.log('[PLAN] Hierarchy fetched for', subject, ':', tree.length, 'lessons');
    res.json({ data: tree });
  } catch (error) {
    console.error('[PLAN] Error fetching hierarchy:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/plans/content-search
 * Search content across a subject. Accepts: subject, type (lesson/subtopic/problem), q (query)
 * Returns flat array of matching items with their subject and type info
 */
export async function searchContent(req, res) {
  try {
    const { subject, type, q } = req.query;
    console.log('[PLAN] Content search:', { subject, type, q });

    if (!subject || !SUBJECT_MODELS[subject]) {
      return res.status(400).json({ error: 'Invalid or missing subject' });
    }

    const models = SUBJECT_MODELS[subject];
    const searchRegex = q ? { $regex: q, $options: 'i' } : null;
    const results = [];

    if (!type || type === 'lesson') {
      const query = searchRegex ? { title: searchRegex } : {};
      const lessons = await models.lesson.find(query).select('title slug').limit(20).lean();
      for (const l of lessons) {
        results.push({ _id: l._id, title: l.title, slug: l.slug, subject, type: 'lesson' });
      }
    }

    if (!type || type === 'subtopic') {
      const query = searchRegex ? { title: searchRegex } : {};
      const subtopics = await models.subtopic.find(query).select('title slug').limit(20).lean();
      for (const s of subtopics) {
        results.push({ _id: s._id, title: s.title, slug: s.slug, subject, type: 'subtopic' });
      }
    }

    if (!type || type === 'problem') {
      const query = searchRegex ? { title: searchRegex } : {};
      const problems = await models.problem.find(query).select('title slug difficulty').limit(20).lean();
      for (const p of problems) {
        results.push({ _id: p._id, title: p.title, slug: p.slug, subject, type: 'problem', difficulty: p.difficulty });
      }
    }

    console.log('[PLAN] Content search results:', results.length);
    res.json({ data: results });
  } catch (error) {
    console.error('[PLAN] Content search error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ─────────────────────────────────────────────── */
/*  BATCH PLAN ASSIGNMENT                          */
/* ─────────────────────────────────────────────── */

/*
 * POST /api/batches/:id/assign-plan
 * Assign a plan to a batch with a start date
 * If batch already has an active plan, marks it as 'completed'
 */
export async function assignPlanToBatch(req, res) {
  try {
    const { id } = req.params;
    const { planId, startDate } = req.body;

    console.log('[PLAN] Assigning plan to batch:', { batchId: id, planId, startDate });

    if (!planId || !startDate) {
      return res.status(400).json({ error: 'planId and startDate are required' });
    }

    /* Verify batch exists */
    const batch = await Batch.findById(id);
    if (!batch) {
      console.log('[PLAN] Batch not found:', id);
      return res.status(404).json({ error: 'Batch not found' });
    }

    /* Verify plan exists */
    const plan = await Plan.findById(planId);
    if (!plan) {
      console.log('[PLAN] Plan not found:', planId);
      return res.status(404).json({ error: 'Plan not found' });
    }

    /* Retire any existing active plan for this batch */
    await BatchPlan.updateMany(
      { batch: id, status: 'active' },
      { status: 'completed' }
    );

    /* Create the new BatchPlan */
    const batchPlan = await BatchPlan.create({
      batch: id,
      plan: planId,
      startDate: new Date(startDate),
      status: 'active'
    });

    const populated = await BatchPlan.findById(batchPlan._id)
      .populate('plan', 'name durationDays status')
      .populate('batch', 'name');

    console.log('[PLAN] Plan assigned to batch:', populated.batch?.name, '→', populated.plan?.name);
    res.status(201).json({ data: populated });
  } catch (error) {
    console.error('[PLAN] Error assigning plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/batches/:id/unassign-plan
 * Remove the active plan from a batch (sets to 'completed')
 */
export async function unassignPlanFromBatch(req, res) {
  try {
    const { id } = req.params;
    console.log('[PLAN] Unassigning plan from batch:', id);

    const batchPlan = await BatchPlan.findOneAndUpdate(
      { batch: id, status: 'active' },
      { status: 'completed' },
      { new: true }
    );

    if (!batchPlan) {
      console.log('[PLAN] No active plan found for batch:', id);
      return res.status(404).json({ error: 'No active plan found for this batch' });
    }

    console.log('[PLAN] Plan unassigned from batch:', id);
    res.json({ data: { message: 'Plan unassigned successfully' } });
  } catch (error) {
    console.error('[PLAN] Error unassigning plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/batches/:id/active-plan
 * Fetch the active plan for a batch (if any), with day computation
 * Returns: { batchPlan, plan, currentDay, totalDays }
 */
export async function getActivePlanForBatch(req, res) {
  try {
    const { id } = req.params;
    console.log('[PLAN] Fetching active plan for batch:', id);

    const batchPlan = await BatchPlan.findOne({ batch: id, status: 'active' })
      .populate('plan');

    if (!batchPlan) {
      console.log('[PLAN] No active plan for batch:', id);
      return res.json({ data: null });
    }

    /* Compute current day based on start date */
    const startDate = new Date(batchPlan.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    const diffMs = today - startDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const currentDay = Math.max(0, Math.min(diffDays + 1, batchPlan.plan.durationDays));

    console.log('[PLAN] Active plan:', batchPlan.plan?.name, 'day', currentDay, 'of', batchPlan.plan.durationDays);
    res.json({
      data: {
        batchPlan,
        plan: batchPlan.plan,
        currentDay,
        totalDays: batchPlan.plan.durationDays,
        startDate: batchPlan.startDate
      }
    });
  } catch (error) {
    console.error('[PLAN] Error fetching active plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/batches/progress
 * Returns all batches with their active plan info for the coordinator dashboard
 * Used by the redesigned coordinator home page to show batch progress cards
 */
export async function getBatchesWithPlans(req, res) {
  try {
    console.log('[PLAN] Fetching batches with plans for center:', req.coordinatorCenterId);

    /* Get all batches for this center */
    const batches = await Batch.find({ coachingCenter: req.coordinatorCenterId, status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    /* Get active plans for all batches */
    const batchIds = batches.map(b => b._id);
    const activePlans = await BatchPlan.find({ batch: { $in: batchIds }, status: 'active' })
      .populate('plan', 'name durationDays status')
      .lean();

    /* Build a map of batchId → plan info */
    const planMap = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const bp of activePlans) {
      const startDate = new Date(bp.startDate);
      startDate.setHours(0, 0, 0, 0);
      const diffMs = now - startDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const currentDay = Math.max(0, Math.min(diffDays + 1, bp.plan?.durationDays || 0));
      const totalDays = bp.plan?.durationDays || 0;

      /* Determine if behind schedule: plan has been running >= 3 days but less than 40% of duration elapsed */
      const elapsedPct = totalDays > 0 ? (currentDay / totalDays) * 100 : 0;
      const behind = currentDay >= 3 && elapsedPct > 0 && elapsedPct < 40;

      planMap[bp.batch.toString()] = {
        batchPlanId: bp._id,
        planId: bp.plan?._id,
        planName: bp.plan?.name || 'Unknown Plan',
        totalDays,
        currentDay,
        startDate: bp.startDate,
        status: bp.status,
        behind
      };
    }

    /* Count students per batch */
    const studentCounts = {};
    for (const id of batchIds) {
      studentCounts[id.toString()] = await User.countDocuments({ batch: id });
    }

    const result = batches.map(b => ({
      _id: b._id,
      name: b.name,
      code: b.code,
      status: b.status,
      studentCount: studentCounts[b._id.toString()] || 0,
      expectedStudents: b.expectedStudents,
      plan: planMap[b._id.toString()] || null
    }));

    console.log('[PLAN] Batches with plans:', result.length);
    res.json({ data: result });
  } catch (error) {
    console.error('[PLAN] Error fetching batches with plans:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coaching-centers/:id/plans
 * Fetch plans scoped to a coaching center (populated with creator info)
 */
export async function getCenterPlans(req, res) {
  try {
    console.log('[PLAN] Fetching plans for center:', req.params.id);
    const plans = await Plan.find({ coachingCenter: req.params.id })
      .populate('createdBy', 'displayName username email')
      .sort({ createdAt: -1 });

    console.log('[PLAN] Center plans fetched:', plans.length);
    res.json({ data: plans });
  } catch (error) {
    console.error('[PLAN] Error fetching center plans:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/plans/:id/assignments
 * Returns list of batches this plan is currently assigned to (active BatchPlan).
 * Used by AdminPlanList and AdminCoachingCenterDetail to show plan-to-batch linkage.
 */
export async function getPlanAssignments(req, res) {
  try {
    console.log('[PLAN] Fetching assignments for plan:', req.params.id);
    const batchPlans = await BatchPlan.find({ plan: req.params.id, status: 'active' })
      .populate('batch', 'name code status')
      .populate('plan', 'name durationDays')
      .sort({ startDate: -1 })
      .lean();

    const result = batchPlans.map(bp => ({
      batchPlanId: bp._id,
      batch: bp.batch,
      plan: bp.plan,
      startDate: bp.startDate,
      status: bp.status
    }));

    console.log('[PLAN] Plan assignments:', result.length);
    res.json({ data: result });
  } catch (error) {
    console.error('[PLAN] Error fetching plan assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/plans/:id/assignments
 * Same as above but scoped to coordinator's center.
 */
export async function getCoordinatorPlanAssignments(req, res) {
  try {
    console.log('[PLAN] Fetching coordinator plan assignments for plan:', req.params.id);
    const batchPlans = await BatchPlan.find({ plan: req.params.id, status: 'active' })
      .populate('batch', 'name code status')
      .populate('plan', 'name durationDays')
      .sort({ startDate: -1 })
      .lean();

    /* Filter to only batches in coordinator's center */
    const result = [];
    for (const bp of batchPlans) {
      if (bp.batch && bp.batch._id) {
        const batch = await Batch.findById(bp.batch._id).select('coachingCenter').lean();
        if (batch && batch.coachingCenter &&
            (batch.coachingCenter._id || batch.coachingCenter).toString() === req.coordinatorCenterId.toString()) {
          result.push({
            batchPlanId: bp._id,
            batch: bp.batch,
            plan: bp.plan,
            startDate: bp.startDate,
            status: bp.status
          });
        }
      }
    }

    console.log('[PLAN] Coordinator plan assignments:', result.length);
    res.json({ data: result });
  } catch (error) {
    console.error('[PLAN] Error fetching coordinator plan assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coaching-centers/:id/plan-assignments
 * Returns all plans with their active batch assignments for a center.
 * Used by AdminCoachingCenterDetail to show which plans are assigned to which batches.
 */
export async function getCenterPlansWithAssignments(req, res) {
  try {
    console.log('[PLAN] Fetching plans with assignments for center:', req.params.id);

    const [plans, batches] = await Promise.all([
      Plan.find({ coachingCenter: req.params.id })
        .populate('createdBy', 'displayName username email')
        .sort({ createdAt: -1 })
        .lean(),
      Batch.find({ coachingCenter: req.params.id })
        .select('_id name code status')
        .lean()
    ]);

    const batchIds = batches.map(b => b._id);
    const activeBatchPlans = await BatchPlan.find({ batch: { $in: batchIds }, status: 'active' })
      .populate('batch', 'name code')
      .populate('plan', 'name')
      .lean();

    /* Build map: planId → batch assignments */
    const assignmentMap = {};
    for (const bp of activeBatchPlans) {
      const pid = bp.plan?._id?.toString();
      if (!pid) continue;
      if (!assignmentMap[pid]) assignmentMap[pid] = [];
      assignmentMap[pid].push({
        batchPlanId: bp._id,
        batch: bp.batch,
        startDate: bp.startDate
      });
    }

    const plansWithAssignments = plans.map(p => ({
      ...p,
      assignedBatches: assignmentMap[p._id.toString()] || []
    }));

    console.log('[PLAN] Center plans with assignments:', plansWithAssignments.length);
    res.json({ data: plansWithAssignments });
  } catch (error) {
    console.error('[PLAN] Error fetching plans with assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/plans/:planId/day-progress/:batchId/:userId
 * Returns day-by-day breakdown of a user's progress against a plan.
 * Used by CoordinatorStudentDetail and UserProfile for rich plan tracking.
 */
export async function getDayProgressBreakdown(req, res) {
  try {
    const { planId, batchId, userId } = req.params;
    console.log('[PLAN] Day progress breakdown:', { planId, batchId, userId });

    const plan = await Plan.findById(planId).lean();
    if (!plan || !plan.items) return res.status(404).json({ error: 'Plan not found' });

    const batchPlan = await BatchPlan.findOne({ batch: batchId, plan: planId, status: 'active' }).lean();
    if (!batchPlan) return res.json({ data: null });

    const startDate = new Date(batchPlan.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    const currentDayOffset = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    /* Group items by day */
    const dayGroups = {};
    for (const item of plan.items) {
      if (!dayGroups[item.dayOffset]) dayGroups[item.dayOffset] = [];
      dayGroups[item.dayOffset].push(item);
    }

    /* Get completed items for this user */
    const progressDocs = await Progress.find({
      user: userId,
      $or: plan.items.map(item => ({
        subject: item.subject,
        targetType: item.targetType,
        targetSlug: item.targetSlug
      }))
    }).select('subject targetType targetSlug').lean();

    const completedSet = new Set(
      progressDocs.map(d => `${d.subject}:${d.targetType}:${d.targetSlug}`)
    );

    /* Build day-by-day breakdown with per-item details */
    const days = [];
    let totalItemsAssigned = 0;
    let totalItemsCompleted = 0;
    for (let d = 1; d <= Math.max(plan.durationDays, currentDayOffset); d++) {
      const items = dayGroups[d] || [];
      const itemsWithStatus = items.map(item => {
        const done = completedSet.has(`${item.subject}:${item.targetType}:${item.targetSlug}`);
        return {
          dayOffset: item.dayOffset,
          subject: item.subject,
          targetType: item.targetType,
          targetTitle: item.targetTitle || item.targetSlug,
          targetSlug: item.targetSlug,
          instruction: item.instruction || '',
          subtopicTitle: item.subtopicTitle || '',
          lessonTitle: item.lessonTitle || '',
          completed: done
        };
      });
      const completedCount = itemsWithStatus.filter(i => i.completed).length;
      if (d <= currentDayOffset) {
        totalItemsAssigned += items.length;
        totalItemsCompleted += completedCount;
      }
      days.push({
        day: d,
        itemsCount: items.length,
        completedCount,
        completedPct: items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
        isCurrent: d === currentDayOffset,
        isFuture: d > currentDayOffset,
        isPast: d < currentDayOffset,
        items: itemsWithStatus
      });
    }

    console.log('[PLAN] Day breakdown built:', days.length, 'days, completed:', totalItemsCompleted, '/', totalItemsAssigned);
    res.json({
      data: {
        planName: plan.name,
        planDescription: plan.description || '',
        durationDays: plan.durationDays,
        currentDayOffset,
        startDate: batchPlan.startDate,
        totalItemsAssigned,
        totalItemsCompleted,
        overallPct: totalItemsAssigned > 0 ? Math.round((totalItemsCompleted / totalItemsAssigned) * 100) : 0,
        days
      }
    });
  } catch (error) {
    console.error('[PLAN] Error fetching day breakdown:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/coordinator/batches/:id/students-with-progress
 * Fetch all students in a batch with per-student plan progress.
 * Used by coordinator batch detail to show Plan Pace column.
 * Sorts students by pace (behind first).
 */
export async function getBatchStudentsWithProgress(req, res) {
  try {
    console.log('[PLAN] Fetching students with progress for batch:', req.params.id);
    const { id } = req.params;

    /* Find the batch */
    const batch = await Batch.findById(id).lean();
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    /* Get all students in this batch */
    const students = await User.find({ batch: id })
      .select('-password -clerkId -following -followers')
      .populate('batch', 'name status')
      .populate('courseOffering', 'name')
      .sort({ displayName: 1 })
      .lean();

    /* Compute plan progress for each student */
    const studentsWithProgress = await Promise.all(students.map(async (student) => {
      const planProgress = await getPlanProgress(student._id, id);
      return { ...student, planProgress };
    }));

    /* Sort: behind first, then on-track, then ahead/just-started/none */
    const paceOrder = { behind: 0, 'on-track': 1, ahead: 2, 'just-started': 3 };
    studentsWithProgress.sort((a, b) => {
      const aOrder = a.planProgress ? (paceOrder[a.planProgress.paceStatus] ?? 4) : 4;
      const bOrder = b.planProgress ? (paceOrder[b.planProgress.paceStatus] ?? 4) : 4;
      return aOrder - bOrder;
    });

    console.log('[PLAN] Batch students with progress:', studentsWithProgress.length);
    res.json({ data: studentsWithProgress, batch });
  } catch (error) {
    console.error('[PLAN] Error fetching batch students with progress:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/plans/:planId/day-progress/:batchId
 * Returns aggregated day-by-day progress for all students in a batch.
 * Groups plan items by day, then counts how many students completed each item.
 */
export async function getBatchDayProgress(req, res) {
  try {
    const { planId, batchId } = req.params;
    console.log('[PLAN] Batch day progress breakdown:', { planId, batchId });

    const plan = await Plan.findById(planId).lean();
    if (!plan || !plan.items) return res.status(404).json({ error: 'Plan not found' });

    const batchPlan = await BatchPlan.findOne({ batch: batchId, plan: planId, status: 'active' }).lean();
    if (!batchPlan) return res.json({ data: null });

    const startDate = new Date(batchPlan.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    const currentDayOffset = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    /* Group items by day */
    const dayGroups = {};
    for (const item of plan.items) {
      if (!dayGroups[item.dayOffset]) dayGroups[item.dayOffset] = [];
      dayGroups[item.dayOffset].push(item);
    }

    /* Get all students in this batch */
    const students = await User.find({ batch: batchId }).select('_id').lean();
    const studentIds = students.map(s => s._id);
    const studentCount = studentIds.length;

    if (studentCount === 0) {
      return res.json({
        data: {
          planName: plan.name,
          durationDays: plan.durationDays,
          currentDayOffset,
          startDate: batchPlan.startDate,
          studentCount: 0,
          days: []
        }
      });
    }

    /* Fetch all progress documents for these students matching any plan item */
    const allItemCriteria = plan.items.map(item => ({
      subject: item.subject,
      targetType: item.targetType,
      targetSlug: item.targetSlug
    }));
    const allProgress = await Progress.find({
      user: { $in: studentIds },
      $or: allItemCriteria
    }).select('user subject targetType targetSlug').lean();

    /* Build a per-user set of completed item keys */
    const userItemMap = {};
    for (const p of allProgress) {
      if (!userItemMap[p.user]) userItemMap[p.user] = new Set();
      userItemMap[p.user].add(`${p.subject}:${p.targetType}:${p.targetSlug}`);
    }

    /* Build day-by-day aggregated breakdown with per-student info */
    const days = [];
    for (let d = 1; d <= Math.max(plan.durationDays, currentDayOffset); d++) {
      const items = dayGroups[d] || [];
      if (items.length === 0) {
      days.push({
        day: d, itemsCount: 0, totalCompletions: 0,
        avgCompletionPct: 0, studentCount,
        completedAllIds: [], partialIds: [], noneIds: studentIds.map(s => s.toString()),
        items: [],
        isCurrent: d === currentDayOffset,
        isFuture: d > currentDayOffset,
        isPast: d < currentDayOffset
      });
        continue;
      }

      let totalCompletions = 0;
      const completedAll = [];
      const partial = [];
      const none = [];

      for (const sid of studentIds) {
        let studentCompleted = 0;
        for (const item of items) {
          const itemKey = `${item.subject}:${item.targetType}:${item.targetSlug}`;
          if (userItemMap[sid]?.has(itemKey)) {
            studentCompleted++;
            totalCompletions++;
          }
        }
        if (studentCompleted === items.length) {
          completedAll.push(sid.toString());
        } else if (studentCompleted > 0) {
          partial.push(sid.toString());
        } else {
          none.push(sid.toString());
        }
      }

      const maxPossible = items.length * studentCount;
      const avgCompletionPct = maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0;

      days.push({
        day: d,
        itemsCount: items.length,
        totalCompletions,
        studentCount,
        avgCompletionPct,
        completedAllIds: completedAll,
        partialIds: partial,
        noneIds: none,
        items: items.map(item => ({
          subject: item.subject,
          targetType: item.targetType,
          targetTitle: item.targetTitle,
          targetSlug: item.targetSlug,
          instruction: item.instruction || '',
          subtopicTitle: item.subtopicTitle || '',
          lessonTitle: item.lessonTitle || ''
        })),
        isCurrent: d === currentDayOffset,
        isFuture: d > currentDayOffset,
        isPast: d < currentDayOffset
      });
    }

    console.log('[PLAN] Batch day breakdown built:', days.length, 'days, students:', studentCount);
    res.json({
      data: {
        planName: plan.name,
        durationDays: plan.durationDays,
        currentDayOffset,
        startDate: batchPlan.startDate,
        studentCount,
        days
      }
    });
  } catch (error) {
    console.error('[PLAN] Error fetching batch day breakdown:', error.message);
    res.status(500).json({ error: error.message });
  }
}
