/*
 * Faculty Controller — All endpoints are scoped to the faculty member's
 * own batches via req.facultyBatchIds (set by requireFaculty middleware).
 *
 * Faculty status is Mongo-only (never a Clerk role). A faculty member is a
 * regular student of a center who also teaches the batches assigned to them.
 *
 * Per rule 4: handlers NEVER trust :batchId / :studentId params directly —
 * every id is validated against req.facultyBatchIds first.
 *
 * Empty-scope rule: a faculty member with no assigned batches gets empty
 * data from every list/stats/export endpoint (no 403, no dead end).
 * Create/assign operations with no scope return 400 — you can't create
 * content without a center.
 *
 * Archived batches: viewable, but new plans/assignments and plan
 * assignments are blocked on them (mirrors the intent of coordinator flows).
 */
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import CoachingCenter from '../models/CoachingCenter.js';
import Plan from '../models/Plan.js';
import BatchPlan from '../models/BatchPlan.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Notification from '../models/Notification.js';
import Progress from '../models/Progress.js';
import { getProgressSummariesForUsers, getLastActivityForUsers, getProgressSummary, deriveStatus } from '../services/progressService.js';
import { computeNeedsAttention, syncNeedsAttentionNotifications } from '../services/needsAttentionService.js';
import { getPlanDayOffset } from '../utils/planDay.js';

/* ────────────────────────────────────────────── */
/*  HELPERS                                       */
/* ────────────────────────────────────────────── */

/*
 * getFacultyRoster(batchIds)
 * Returns { center, students, totalStudents } for the faculty member's batches.
 * Mirrors getCenterRoster/getBatchRoster from centerRosterService but scoped
 * to a set of batch ids — each student includes the `progress` summary and
 * needs-attention flags.
 */
async function getFacultyRoster(batchIds) {
  /* Students only — faculty (teachers) assigned to these batches are NOT
     students. Without this, promoted teachers (including the logged-in
     faculty member themselves) appear in every roster, count and export. */
  const students = await User.find({ batch: { $in: batchIds }, isFaculty: { $ne: true } })
    .select('displayName username avatar email college year coachingCenterJoinedAt joinDate batch courseOffering isFaculty')
    .populate('batch', 'name')
    .populate('courseOffering', 'name')
    .sort({ coachingCenterJoinedAt: -1 })
    .lean();

  /* Attach per-subject progress summaries */
  const userIds = students.map(s => s._id);
  const summaries = await getProgressSummariesForUsers(userIds);
  const studentsWithProgress = students.map(s => ({
    ...s,
    progress: summaries.get(s._id.toString()) || null
  }));

  /* Attach last-activity and needs-attention flags */
  const lastActivityMap = await getLastActivityForUsers(userIds);
  computeNeedsAttention(studentsWithProgress, lastActivityMap);
  syncNeedsAttentionNotifications(studentsWithProgress).catch(err =>
    console.error('[FACULTY] Notification sync error:', err.message)
  );

  return {
    center: null, /* faculty scope spans batches, not a single center — stats endpoints read the center separately */
    students: studentsWithProgress,
    totalStudents: students.length
  };
}

/* ────────────────────────────────────────────── */
/*  BATCHES (view only)                           */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/batches
 * List the faculty member's own batches with student counts and the
 * active plan info (mirror of getBatchesWithPlans, filtered to scope).
 */
export async function getFacultyBatches(req, res) {
  try {
    console.log('[FACULTY] Fetching own batches:', req.facultyBatchIds.length);

    if (req.facultyBatchIds.length === 0) {
      return res.json({ data: [] });
    }

    const batches = await Batch.find({ _id: { $in: req.facultyBatchIds } })
      .populate('courseOffering', 'name')
      .sort({ createdAt: -1 })
      .lean();

    /* Active plans for these batches */
    const activePlans = await BatchPlan.find({ batch: { $in: req.facultyBatchIds }, status: 'active' })
      .populate('plan', 'name durationDays status')
      .lean();

    const planMap = {};
    for (const bp of activePlans) {
      const currentDay = Math.max(0, Math.min(getPlanDayOffset(bp.startDate), bp.plan?.durationDays || 0));
      const totalDays = bp.plan?.durationDays || 0;
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

    const studentCounts = {};
    for (const id of req.facultyBatchIds) {
      /* Students only — faculty (teachers) assigned to the batch are not counted */
      studentCounts[id.toString()] = await User.countDocuments({ batch: id, isFaculty: { $ne: true } });
    }

    const result = await Promise.all(batches.map(async b => {
      /* Teachers assigned to this batch (faculty whose scope includes it) —
         same enrichment as the coordinator batch list, so the faculty UI can
         mention the teaching team on each batch card/detail page */
      const teachers = req.facultyCenterId
        ? await User.find({ coachingCenter: req.facultyCenterId, isFaculty: true, facultyBatches: b._id })
            .select('displayName username avatar _id')
            .lean()
        : [];
      return {
        _id: b._id,
        name: b.name,
        code: b.code,
        status: b.status,
        courseOffering: b.courseOffering,
        studentCount: studentCounts[b._id.toString()] || 0,
        expectedStudents: b.expectedStudents,
        teachers,
        plan: planMap[b._id.toString()] || null
      };
    }));

    console.log('[FACULTY] Batches fetched:', result.length);
    res.json({ data: result });
  } catch (error) {
    console.error('[FACULTY] Error fetching batches:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/batches/:id
 * Single own-batch detail — 403 unless the batch is in scope.
 */
export async function getFacultyBatchById(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Fetching batch:', id);

    if (!req.facultyBatchIds.some(bid => bid.toString() === id)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    const batch = await Batch.findById(id)
      .populate('coachingCenter', 'name')
      .populate('courseOffering', 'name')
      .lean();
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    /* Students only (faculty are teachers, not students) + teachers assigned to
       this batch — same enriched shape the coordinator batch detail receives */
    const studentCount = await User.countDocuments({ batch: id, isFaculty: { $ne: true } });
    const teachers = req.facultyCenterId
      ? await User.find({ coachingCenter: req.facultyCenterId, isFaculty: true, facultyBatches: id })
          .select('displayName username avatar _id')
          .lean()
      : [];

    res.json({ data: { ...batch, studentCount, teachers } });
  } catch (error) {
    console.error('[FACULTY] Error fetching batch:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/batches/progress
 * Per-batch day-by-day plan progress (mirror of the coordinator
 * batches-with-plans endpoint, filtered to own batches).
 */
export async function getFacultyBatchesProgress(req, res) {
  try {
    console.log('[FACULTY] Fetching batch progress for scope:', req.facultyBatchIds.length);

    if (req.facultyBatchIds.length === 0) {
      return res.json({ data: [] });
    }

    const batches = await Batch.find({ _id: { $in: req.facultyBatchIds } })
      .sort({ createdAt: -1 })
      .lean();

    const batchIds = batches.map(b => b._id);
    const activePlans = await BatchPlan.find({ batch: { $in: batchIds }, status: 'active' })
      .populate('plan', 'name durationDays status')
      .lean();

    const planMap = {};
    for (const bp of activePlans) {
      const currentDay = Math.max(0, Math.min(getPlanDayOffset(bp.startDate), bp.plan?.durationDays || 0));
      const totalDays = bp.plan?.durationDays || 0;
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

    const studentCounts = {};
    for (const id of batchIds) {
      /* Students only — faculty (teachers) assigned to the batch are not counted */
      studentCounts[id.toString()] = await User.countDocuments({ batch: id, isFaculty: { $ne: true } });
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

    console.log('[FACULTY] Batch progress fetched:', result.length);
    res.json({ data: result });
  } catch (error) {
    console.error('[FACULTY] Error fetching batch progress:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  STUDENTS (view + export only — no edits)      */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/students?batchId=&search=
 * Roster of students whose batch is in the faculty scope.
 */
export async function getFacultyStudents(req, res) {
  try {
    console.log('[FACULTY] Fetching students for scope:', req.facultyBatchIds.length);

    if (req.facultyBatchIds.length === 0) {
      return res.json({ data: { students: [], totalStudents: 0 } });
    }

    const { batchId, search } = req.query;
    /* Students only — faculty (teachers) are never part of the student roster.
       Promoted teachers (incl. the logged-in faculty member) are excluded. */
    const query = { batch: { $in: req.facultyBatchIds }, isFaculty: { $ne: true } };

    /* Optional batch filter must still be inside the scope */
    if (batchId) {
      if (!req.facultyBatchIds.some(bid => bid.toString() === batchId)) {
        return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
      }
      query.batch = batchId;
    }
    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('displayName username avatar email college year coachingCenterJoinedAt joinDate batch courseOffering isFaculty')
      .populate('batch', 'name')
      .sort({ coachingCenterJoinedAt: -1 })
      .lean();

    /* Attach progress summaries */
    const userIds = students.map(s => s._id);
    const summaries = await getProgressSummariesForUsers(userIds);
    const enriched = students.map(s => ({
      ...s,
      progress: summaries.get(s._id.toString()) || null
    }));

    /* Attach needs-attention flags (same enrichment as the coordinator roster,
       so the faculty dashboard/general-stats can flag inactive/bottom students) */
    const lastActivityMap = await getLastActivityForUsers(userIds);
    computeNeedsAttention(enriched, lastActivityMap);
    syncNeedsAttentionNotifications(enriched).catch(err =>
      console.error('[FACULTY] Notification sync error:', err.message)
    );

    console.log('[FACULTY] Students fetched:', enriched.length);
    res.json({ data: { students: enriched, totalStudents: enriched.length } });
  } catch (error) {
    console.error('[FACULTY] Error fetching students:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/students/:id
 * Individual performance drill-down — 403 unless the student's batch is in scope.
 */
export async function getFacultyStudentById(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Fetching student detail:', id);

    const student = await User.findById(id)
      .select('-followers -following')
      .populate('coachingCenter', 'name logo')
      .populate('batch', 'name')
      .populate('courseOffering', 'name')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    /* Scope check: the student must belong to one of my batches */
    if (!student.batch?._id || !req.facultyBatchIds.some(bid => bid.toString() === student.batch._id.toString())) {
      console.log('[FACULTY] Student', id, 'not in faculty scope');
      return res.status(403).json({ error: 'Access denied — student is not in your batches' });
    }

    const progress = await getProgressSummary(student._id);

    console.log('[FACULTY] Student detail fetched:', student.displayName || student.username);
    res.json({ data: { ...student, progress } });
  } catch (error) {
    console.error('[FACULTY] Error fetching student detail:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  DASHBOARD / STATS                             */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/stats
 * Coordinator-style aggregate scoped to own batches: totalStudents,
 * active plans, behind count, completion % and quiz stats. Zeros when
 * no batches assigned.
 */
export async function getFacultyStats(req, res) {
  try {
    console.log('[FACULTY] Fetching stats for scope:', req.facultyBatchIds.length);

    if (req.facultyBatchIds.length === 0) {
      return res.json({
        data: {
          center: null,
          totalStudents: 0,
          studentsWithQuizzes: 0,
          activePlans: 0,
          behindCount: 0,
          aggregate: { lessons: { completed: 0, total: 0 }, subtopics: { completed: 0, total: 0 }, problems: { completed: 0, total: 0 }, overall: { completed: 0, total: 0, percentage: 0 } },
          quizzes: { totalTaken: 0, averageScore: null }
        }
      });
    }

    const roster = await getFacultyRoster(req.facultyBatchIds);
    const students = roster.students;

    let totalLessons = 0, completedLessons = 0;
    let totalSubtopics = 0, completedSubtopics = 0;
    let totalProblems = 0, completedProblems = 0;
    let totalQuizTaken = 0, totalQuizScoreSum = 0, studentsWithQuizzes = 0;

    for (const student of students) {
      const p = student.progress;
      if (!p) continue;

      for (const subject of ['dsa', 'dbms', 'os', 'programming', 'aptitude']) {
        const s = p[subject];
        if (!s) continue;

        totalLessons += s.lessons.total;
        completedLessons += s.lessons.completed;
        totalSubtopics += s.subtopics.total;
        completedSubtopics += s.subtopics.completed;
        totalProblems += s.problems.total;
        completedProblems += s.problems.completed;

        if (s.quizzes && s.quizzes.quizzesTaken > 0) {
          totalQuizTaken += s.quizzes.quizzesTaken;
          totalQuizScoreSum += s.quizzes.avgScore * s.quizzes.quizzesTaken;
          studentsWithQuizzes++;
        }
      }
    }

    const totalItems = totalLessons + totalSubtopics + totalProblems;
    const completedItems = completedLessons + completedSubtopics + completedProblems;
    const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const avgQuizScore = totalQuizTaken > 0 ? Math.round(totalQuizScoreSum / totalQuizTaken) : null;

    /* Plan stats for the scope */
    const activeBatchPlans = await BatchPlan.find({ batch: { $in: req.facultyBatchIds }, status: 'active' })
      .populate('plan', 'durationDays')
      .lean();
    let behindCount = 0;
    for (const bp of activeBatchPlans) {
      const currentDay = Math.max(0, Math.min(getPlanDayOffset(bp.startDate), bp.plan?.durationDays || 0));
      const elapsedPct = bp.plan?.durationDays > 0 ? (currentDay / bp.plan.durationDays) * 100 : 0;
      if (currentDay >= 3 && elapsedPct > 0 && elapsedPct < 40) behindCount++;
    }

    console.log('[FACULTY] Stats computed:', { totalStudents: roster.totalStudents, behindCount });

    /* Center branding for the faculty sidebar — populated doc, not just the id */
    const center = req.facultyCenterId
      ? await CoachingCenter.findById(req.facultyCenterId).lean()
      : null;

    res.json({
      data: {
        center,
        totalStudents: roster.totalStudents,
        studentsWithQuizzes,
        activePlans: activeBatchPlans.length,
        behindCount,
        aggregate: {
          lessons: { completed: completedLessons, total: totalLessons },
          subtopics: { completed: completedSubtopics, total: totalSubtopics },
          problems: { completed: completedProblems, total: totalProblems },
          overall: { completed: completedItems, total: totalItems, percentage: overallPct }
        },
        quizzes: { totalTaken: totalQuizTaken, averageScore: avgQuizScore }
      }
    });
  } catch (error) {
    console.error('[FACULTY] Error fetching stats:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  CSV EXPORT                                   */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/export
 * CSV export of student progress — clone of exportCoordinatorCsv,
 * filtered to the faculty member's own batches (excludes everyone outside scope).
 */
export async function exportFacultyCsv(req, res) {
  try {
    console.log('[FACULTY] CSV export requested for scope:', req.facultyBatchIds.length);

    if (req.facultyBatchIds.length === 0) {
      return res.status(400).json({ error: 'No batches assigned — nothing to export' });
    }

    const roster = await getFacultyRoster(req.facultyBatchIds);
    const students = roster.students;

    const rows = [];
    rows.push(['SECTION: FACULTY EXPORT']);
    rows.push(['Generated for batches:', req.facultyBatchIds.join(', ')]);
    rows.push(['']);

    rows.push(['SECTION: STUDENT PROGRESS']);
    rows.push([
      'Username', 'Display Name', 'Email', 'College', 'Year',
      'Joined Centre', 'Batch',
      'DSA Lessons', 'DSA Subtopics', 'DSA Problems', 'DSA Overall %', 'DSA Quiz Avg',
      'DBMS Lessons', 'DBMS Subtopics', 'DBMS Problems', 'DBMS Overall %', 'DBMS Quiz Avg',
      'OS Lessons', 'OS Subtopics', 'OS Problems', 'OS Overall %', 'OS Quiz Avg',
      'PROG Lessons', 'PROG Subtopics', 'PROG Problems', 'PROG Overall %', 'PROG Quiz Avg',
      'APT Lessons', 'APT Subtopics', 'APT Problems', 'APT Overall %', 'APT Quiz Avg',
      'Overall Completed', 'Overall Total', 'Overall %',
      'Status', 'Needs Attention', 'Attention Reasons'
    ]);

    for (const s of students) {
      const p = s.progress || {};
      const subjects = ['dsa', 'dbms', 'os', 'programming', 'aptitude'];
      let totalCompleted = 0, totalItems = 0;
      let quizTaken = 0, quizScoreSum = 0;
      const row = [
        s.username || '',
        s.displayName || '',
        s.email || '',
        s.college || '',
        s.year || '',
        s.coachingCenterJoinedAt ? new Date(s.coachingCenterJoinedAt).toISOString().split('T')[0] : '',
        s.batch?.name || ''
      ];

      for (const sub of subjects) {
        const d = p[sub];
        if (d) {
          const subPct = d.overall.total > 0 ? Math.round((d.overall.completed / d.overall.total) * 100) : 0;
          row.push(d.lessons.completed, d.lessons.total);
          row.push(d.subtopics.completed, d.subtopics.total);
          row.push(d.problems.completed, d.problems.total);
          row.push(`${subPct}%`);
          row.push(`${d.quizzes?.avgScore || 0}%`);
          totalCompleted += d.overall.completed;
          totalItems += d.overall.total;
          if (d.quizzes) {
            quizTaken += d.quizzes.quizzesTaken;
            quizScoreSum += (d.quizzes.avgScore || 0) * (d.quizzes.quizzesTaken || 0);
          }
        } else {
          row.push(0, 0, 0, 0, 0, 0, '0%', '0%');
        }
      }

      const overallPct = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
      const overallQuizAvg = quizTaken > 0 ? Math.round(quizScoreSum / quizTaken) : null;
      const status = overallPct > 0 ? deriveStatus({ completionPct: overallPct, quizAvgPct: overallQuizAvg }) : 'Not started';

      row.push(totalCompleted, totalItems, `${overallPct}%`, status);
      row.push(s.needsAttention ? 'Yes' : 'No');
      row.push(s.attentionReasons ? s.attentionReasons.join('; ') : '');
      rows.push(row);
    }

    rows.push(['']);
    rows.push(['Generated on', new Date().toISOString()]);
    rows.push(['Exported by faculty member']);

    const csv = rows.map(r => r.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell === null || cell === undefined ? '' : String(cell);
    }).join(',')).join('\r\n');

    const filename = `faculty_student_progress_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log('[FACULTY] CSV export sent:', filename, '| students:', students.length);
  } catch (error) {
    console.error('[FACULTY] Error exporting CSV:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  PLANS                                        */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/plans
 * Plans of the faculty's center (matching coordinator visibility).
 */
export async function getFacultyPlans(req, res) {
  try {
    console.log('[FACULTY] Fetching plans for center:', req.facultyCenterId);

    if (!req.facultyCenterId) {
      return res.json({ data: [] });
    }

    const { status, search, subject } = req.query;
    const query = { coachingCenter: req.facultyCenterId };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (subject) query['items.subject'] = subject;

    const plans = await Plan.find(query)
      .populate('createdBy', 'displayName username email')
      .sort({ createdAt: -1 });

    console.log('[FACULTY] Plans fetched:', plans.length);
    res.json({ data: plans });
  } catch (error) {
    console.error('[FACULTY] Error fetching plans:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/plans/:id
 * Single plan of the faculty's center.
 */
export async function getFacultyPlanById(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Fetching plan:', id);

    if (!req.facultyCenterId) {
      return res.status(403).json({ error: 'No batches assigned' });
    }

    const plan = await Plan.findOne({ _id: id, coachingCenter: req.facultyCenterId })
      .populate('createdBy', 'displayName username');
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ data: plan });
  } catch (error) {
    console.error('[FACULTY] Error fetching plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/plans/:id/assignments
 * Active batch assignments for a plan, filtered to the faculty's own
 * batches (mirror of getPlanAssignments, scoped like the coordinator's).
 */
export async function getFacultyPlanAssignments(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Fetching plan assignments for plan:', id);

    const batchPlans = await BatchPlan.find({ plan: id, status: 'active' })
      .populate('batch', 'name code status')
      .populate('plan', 'name durationDays')
      .sort({ startDate: -1 })
      .lean();

    /* Keep only assignments whose batch is in the faculty scope */
    const result = batchPlans.filter(bp =>
      bp.batch && bp.batch._id &&
      req.facultyBatchIds.some(bid => bid.toString() === bp.batch._id.toString())
    ).map(bp => ({
      batchPlanId: bp._id,
      batch: bp.batch,
      plan: bp.plan,
      startDate: bp.startDate,
      status: bp.status
    }));

    console.log('[FACULTY] Plan assignments:', result.length);
    res.json({ data: result });
  } catch (error) {
    console.error('[FACULTY] Error fetching plan assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/faculty/plans
 * Create a plan for the faculty's own center (requires at least one
 * assigned batch — the center is derived from the scope).
 */
export async function createFacultyPlan(req, res) {
  try {
    console.log('[FACULTY] Creating plan for center:', req.facultyCenterId);

    if (!req.facultyCenterId) {
      return res.status(400).json({ error: 'You need at least one assigned batch to create plans' });
    }

    const { name, description, durationDays, items, status, batchId } = req.body;

    if (!name || !durationDays) {
      return res.status(400).json({ error: 'name and durationDays are required' });
    }

    /* Optional batchId must be inside the faculty scope */
    if (batchId && !req.facultyBatchIds.some(bid => bid.toString() === batchId)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    const user = await User.findOne({ clerkId: req.userId }).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = await Plan.create({
      coachingCenter: req.facultyCenterId,
      name,
      description: description || '',
      durationDays,
      status: status || 'draft',
      createdBy: user._id,
      items: items || []
    });

    console.log('[FACULTY] Plan created:', plan.name, '| status:', plan.status);
    res.status(201).json({ data: plan });
  } catch (error) {
    console.error('[FACULTY] Error creating plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/faculty/plans/:id
 * Update a plan (scoped to the faculty's own center).
 */
export async function updateFacultyPlan(req, res) {
  try {
    console.log('[FACULTY] Updating plan:', req.params.id);

    if (!req.facultyCenterId) {
      return res.status(403).json({ error: 'No batches assigned' });
    }

    const plan = await Plan.findOne({ _id: req.params.id, coachingCenter: req.facultyCenterId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, description, durationDays, status, items } = req.body;
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (durationDays !== undefined) plan.durationDays = durationDays;
    if (status !== undefined) plan.status = status;
    if (items !== undefined) plan.items = items;

    await plan.save();
    console.log('[FACULTY] Plan updated:', plan.name);
    res.json({ data: plan });
  } catch (error) {
    console.error('[FACULTY] Error updating plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/faculty/plans/:id
 * Delete a plan (scoped to the faculty's own center).
 */
export async function deleteFacultyPlan(req, res) {
  try {
    console.log('[FACULTY] Deleting plan:', req.params.id);

    if (!req.facultyCenterId) {
      return res.status(403).json({ error: 'No batches assigned' });
    }

    const plan = await Plan.findOne({ _id: req.params.id, coachingCenter: req.facultyCenterId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    await BatchPlan.updateMany(
      { plan: plan._id, status: 'active' },
      { status: 'completed' }
    );

    await Plan.findByIdAndDelete(req.params.id);
    console.log('[FACULTY] Plan deleted:', plan.name);
    res.json({ data: { message: 'Plan deleted successfully' } });
  } catch (error) {
    console.error('[FACULTY] Error deleting plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/faculty/batches/:id/assign-plan
 * Assign a plan to one of the faculty's own batches.
 * Blocks archived batches and out-of-scope ids.
 */
export async function assignFacultyPlanToBatch(req, res) {
  try {
    const { id } = req.params;
    const { planId, startDate } = req.body;

    console.log('[FACULTY] Assigning plan to batch:', { batchId: id, planId, startDate });

    if (!planId || !startDate) {
      return res.status(400).json({ error: 'planId and startDate are required' });
    }

    /* Batch must be in the faculty scope */
    if (!req.facultyBatchIds.some(bid => bid.toString() === id)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    const batch = await Batch.findById(id).select('coachingCenter status name').lean();
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    if (batch.status !== 'active') {
      return res.status(400).json({ error: 'Cannot assign a plan to an archived batch' });
    }

    /* Plan must belong to the same center */
    if (!req.facultyCenterId) {
      return res.status(403).json({ error: 'No batches assigned' });
    }
    const plan = await Plan.findById(planId).select('coachingCenter name').lean();
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (plan.coachingCenter.toString() !== req.facultyCenterId.toString()) {
      return res.status(403).json({ error: 'Access denied — plan not in your centre' });
    }

    /* Retire any existing active plan for this batch */
    await BatchPlan.updateMany(
      { batch: id, status: 'active' },
      { status: 'completed' }
    );

    const batchPlan = await BatchPlan.create({
      batch: id,
      plan: planId,
      startDate: new Date(startDate),
      status: 'active'
    });

    const populated = await BatchPlan.findById(batchPlan._id)
      .populate('plan', 'name durationDays status')
      .populate('batch', 'name');

    console.log('[FACULTY] Plan assigned to batch:', populated.batch?.name, '→', populated.plan?.name);
    res.status(201).json({ data: populated });
  } catch (error) {
    console.error('[FACULTY] Error assigning plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/faculty/batches/:id/unassign-plan
 * Remove the active plan from one of the faculty's own batches.
 */
export async function unassignFacultyPlanFromBatch(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Unassigning plan from batch:', id);

    /* Batch must be in the faculty scope */
    if (!req.facultyBatchIds.some(bid => bid.toString() === id)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    const batch = await Batch.findById(id).select('coachingCenter').lean();
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const batchPlan = await BatchPlan.findOne({ batch: id, status: 'active' })
      .populate('plan', 'coachingCenter')
      .lean();

    if (!batchPlan) {
      return res.status(404).json({ error: 'No active plan found for this batch' });
    }

    if (!req.facultyCenterId || (batchPlan.plan && batch.coachingCenter.toString() !== batchPlan.plan.coachingCenter.toString())) {
      return res.status(400).json({ error: 'Plan and batch belong to different centres' });
    }

    await BatchPlan.findOneAndUpdate(
      { batch: id, status: 'active' },
      { status: 'completed' }
    );

    console.log('[FACULTY] Plan unassigned from batch:', id);
    res.json({ data: { message: 'Plan unassigned successfully' } });
  } catch (error) {
    console.error('[FACULTY] Error unassigning plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  PLAN PROGRESS (day-by-day, batch-scoped)      */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/batches/:id/active-plan
 * Active plan for one of the faculty's own batches (mirror of the admin/
 * coordinator endpoint — faculty is not a Clerk role, so the batch-scope
 * check replaces the role check).
 * Returns { batchPlan, plan, currentDay, totalDays, startDate, status }.
 */
export async function getFacultyActivePlanForBatch(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Fetching active plan for batch:', id);

    /* Scope check — batch must be assigned to this faculty member */
    if (!req.facultyBatchIds.some(bid => bid.toString() === id)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    let batchPlan = await BatchPlan.findOne({ batch: id, status: 'active' })
      .populate('plan');

    if (!batchPlan) {
      /* Fallback: return most recent plan (may be completed) so day-grid etc. still work */
      batchPlan = await BatchPlan.findOne({ batch: id })
        .sort({ startDate: -1 })
        .populate('plan');
    }

    if (!batchPlan) {
      console.log('[FACULTY] No plan found for batch:', id);
      return res.json({ data: null });
    }

    /* IST-normalised current day so a UTC server doesn't report the previous day */
    const startDate = new Date(batchPlan.startDate);
    const rawDay = getPlanDayOffset(startDate);

    /* Plan has ended — mark completed and return final info (same as the admin flow) */
    if (rawDay > batchPlan.plan.durationDays) {
      console.log('[FACULTY] Plan has ended for batch:', id, '— marking as completed');
      await BatchPlan.findByIdAndUpdate(batchPlan._id, { status: 'completed' });
      return res.json({
        data: {
          batchPlan: { ...batchPlan.toObject(), status: 'completed' },
          plan: batchPlan.plan,
          currentDay: batchPlan.plan.durationDays,
          totalDays: batchPlan.plan.durationDays,
          startDate: batchPlan.startDate,
          status: 'completed'
        }
      });
    }

    const currentDay = Math.max(0, rawDay);

    console.log('[FACULTY] Active plan:', batchPlan.plan?.name, 'day', currentDay, 'of', batchPlan.plan.durationDays);
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
    console.error('[FACULTY] Error fetching active plan:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/batches/:batchId/day-progress/:planId
 * Day-by-day batch progress breakdown for one of the faculty's own batches
 * (mirror of the admin/coordinator endpoint — scope check replaces role check).
 * Returns { planName, durationDays, currentDayOffset, startDate, studentCount, days }.
 */
export async function getFacultyBatchDayProgress(req, res) {
  try {
    const { planId, batchId } = req.params;
    console.log('[FACULTY] Batch day progress breakdown:', { planId, batchId });

    /* Scope check — batch must be assigned to this faculty member */
    if (!req.facultyBatchIds.some(bid => bid.toString() === batchId)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    const plan = await Plan.findById(planId).lean();
    if (!plan || !plan.items) return res.status(404).json({ error: 'Plan not found' });

    /* Plan scope check — the plan must belong to the faculty member's own centre.
       Without this, a faculty member could read another centre's plan content by
       passing a foreign planId alongside one of their own (scoped) batchIds. */
    if (req.facultyCenterId && plan.coachingCenter?.toString() !== req.facultyCenterId.toString()) {
      return res.status(403).json({ error: 'Access denied — plan not in your centre' });
    }

    /* Prefer the ACTIVE BatchPlan, else fall back to the latest startDate — same pattern
       as the admin endpoint so re-assigned plans don't read a stale startDate */
    let batchPlan = await BatchPlan.findOne({ batch: batchId, plan: planId, status: 'active' }).lean();
    if (!batchPlan) batchPlan = await BatchPlan.findOne({ batch: batchId, plan: planId }).sort({ startDate: -1, createdAt: -1 }).lean();
    if (!batchPlan) return res.json({ data: null });

    /* IST-normalised current day so a UTC server doesn't report the previous day */
    const currentDayOffset = getPlanDayOffset(batchPlan.startDate);

    /* Group items by day */
    const dayGroups = {};
    for (const item of plan.items) {
      if (!dayGroups[item.dayOffset]) dayGroups[item.dayOffset] = [];
      dayGroups[item.dayOffset].push(item);
    }

    /* Get all students in this batch — teachers (incl. the logged-in faculty
       member) are excluded so they never show up in the day breakdowns */
    const students = await User.find({ batch: batchId, isFaculty: { $ne: true } }).select('_id').lean();
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

    /* Cap currentDayOffset at plan duration so completed plans don't show extra empty days */
    const cappedOffset = Math.min(currentDayOffset, plan.durationDays);

    /* Build day-by-day aggregated breakdown with per-student info */
    const days = [];
    for (let d = 1; d <= plan.durationDays; d++) {
      const items = dayGroups[d] || [];
      if (items.length === 0) {
        days.push({
          day: d, itemsCount: 0, totalCompletions: 0,
          avgCompletionPct: 0, studentCount,
          completedAllIds: [], partialIds: [], noneIds: studentIds.map(s => s.toString()),
          items: [],
          isCurrent: d === cappedOffset,
          isFuture: d > cappedOffset,
          isPast: d < cappedOffset
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
        isCurrent: d === cappedOffset,
        isFuture: d > cappedOffset,
        isPast: d < cappedOffset
      });
    }

    console.log('[FACULTY] Batch day breakdown built:', days.length, 'days, students:', studentCount);
    res.json({
      data: {
        planName: plan.name,
        durationDays: plan.durationDays,
        currentDayOffset: cappedOffset,
        startDate: batchPlan.startDate,
        studentCount,
        days
      }
    });
  } catch (error) {
    console.error('[FACULTY] Error fetching batch day progress:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ────────────────────────────────────────────── */
/*  ASSIGNMENTS (full CRUD + grading, scoped)     */
/* ────────────────────────────────────────────── */

/*
 * GET /api/faculty/assignments?batchId=&status=
 * List assignments whose batch is in the faculty scope.
 */
export async function getFacultyAssignments(req, res) {
  try {
    console.log('[FACULTY] Fetching assignments for scope:', req.facultyBatchIds.length);

    if (req.facultyBatchIds.length === 0) {
      return res.json({ data: [] });
    }

    const { batchId, status } = req.query;
    const query = { batch: { $in: req.facultyBatchIds } };

    if (batchId) {
      if (!req.facultyBatchIds.some(bid => bid.toString() === batchId)) {
        return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
      }
      query.batch = batchId;
    }
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(assignments.map(async a => {
      const totalSubmissions = await AssignmentSubmission.countDocuments({ assignment: a._id });
      const approvedCount = await AssignmentSubmission.countDocuments({ assignment: a._id, status: 'approved' });
      const pendingCount = await AssignmentSubmission.countDocuments({ assignment: a._id, status: 'submitted' });
      const totalStudents = a.batch?._id
        ? await User.countDocuments({ batch: a.batch._id })
        : 0;
      return {
        ...a,
        _submissionStats: { total: totalSubmissions, approved: approvedCount, pending: pendingCount, totalStudents }
      };
    }));

    console.log('[FACULTY] Assignments fetched:', enriched.length);
    res.json({ data: enriched });
  } catch (error) {
    console.error('[FACULTY] Error fetching assignments:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/faculty/assignments/:id
 * Single assignment with submissions + not-submitted list.
 * 403 unless the assignment's batch is in scope.
 */
export async function getFacultyAssignmentById(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Fetching assignment:', id);

    const assignment = await Assignment.findById(id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    /* Scope check: assignment batch must be mine */
    if (!assignment.batch?._id || !req.facultyBatchIds.some(bid => bid.toString() === assignment.batch._id.toString())) {
      return res.status(403).json({ error: 'Access denied — assignment not in your batches' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: id })
      .populate('student', 'displayName username avatar email college')
      .sort({ submittedAt: -1 })
      .lean();

    let notSubmitted = [];
    if (assignment.batch?._id) {
      const batchStudents = await User.find({ batch: assignment.batch._id })
        .select('displayName username avatar email college _id')
        .lean();
      const submittedStudentIds = new Set(submissions.map(s => s.student._id.toString()));
      notSubmitted = batchStudents.filter(s => !submittedStudentIds.has(s._id.toString()));
    }

    console.log('[FACULTY] Assignment fetched:', assignment.title, '- submissions:', submissions.length);
    res.json({ data: { ...assignment, submissions, notSubmitted } });
  } catch (error) {
    console.error('[FACULTY] Error fetching assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/faculty/assignments
 * Create an assignment for one of the faculty's own batches.
 * Sends assignment_created notifications when status is active (mirror of
 * the coordinator flow — the actor role stamp stays 'user' since faculty
 * is not a Clerk role; acceptable and documented in faculty-feature.md).
 */
export async function createFacultyAssignment(req, res) {
  try {
    const { title, instructions, attachmentLink, batchId, startDate, endDate, status } = req.body;

    console.log('[FACULTY] Creating assignment for batch:', batchId);

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, start date, and end date are required' });
    }

    /* Batch must be in the faculty scope */
    if (!batchId || !req.facultyBatchIds.some(bid => bid.toString() === batchId)) {
      return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
    }

    const batch = await Batch.findById(batchId).select('coachingCenter status').lean();
    if (!batch) {
      return res.status(400).json({ error: 'Batch not found' });
    }
    if (batch.status !== 'active') {
      return res.status(400).json({ error: 'Cannot create an assignment for an archived batch' });
    }

    const facultyUser = await User.findOne({ clerkId: req.userId });
    if (!facultyUser) {
      return res.status(404).json({ error: 'Faculty user not found' });
    }

    const assignment = await Assignment.create({
      title,
      instructions: instructions || '',
      attachmentLink: attachmentLink || '',
      batch: batchId,
      coachingCenter: batch.coachingCenter,
      createdBy: facultyUser._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'draft'
    });

    /* Notify all students in the batch when the assignment goes live */
    if (assignment.status === 'active') {
      const students = await User.find({ batch: batchId });
      const center = await CoachingCenter.findById(batch.coachingCenter).select('name logo').lean();

      const notifications = students.map(s => ({
        user: s._id,
        from: facultyUser._id,
        type: 'assignment_created',
        title: `New Assignment`,
        message: `"${assignment.title}" — Complete it before ${new Date(assignment.endDate).toLocaleDateString()} at 11:59 PM.`,
        link: `/assignments/${assignment._id}`,
        centerName: center?.name || '',
        centerLogo: center?.logo || '',
        read: false
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log('[FACULTY] Notifications sent to', notifications.length, 'students');
      }
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    console.log('[FACULTY] Assignment created:', populated.title);
    res.status(201).json({ data: populated });
  } catch (error) {
    console.error('[FACULTY] Error creating assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/faculty/assignments/:id
 * Update an assignment (batch must be in scope, like the coordinator flow).
 */
export async function updateFacultyAssignment(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Updating assignment:', id);

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (!assignment.batch || !req.facultyBatchIds.some(bid => bid.toString() === assignment.batch.toString())) {
      return res.status(403).json({ error: 'Access denied — assignment not in your batches' });
    }

    const allowedFields = ['title', 'instructions', 'attachmentLink', 'startDate', 'endDate', 'status'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          assignment[field] = new Date(req.body[field]);
        } else {
          assignment[field] = req.body[field];
        }
      }
    }

    /* Batch change: only allowed to another in-scope batch */
    if (req.body.batchId !== undefined) {
      const batchId = req.body.batchId;
      if (batchId) {
        if (!req.facultyBatchIds.some(bid => bid.toString() === batchId)) {
          return res.status(403).json({ error: 'Access denied — batch not assigned to you' });
        }
        const batch = await Batch.findById(batchId).select('coachingCenter').lean();
        if (!batch) return res.status(400).json({ error: 'Batch not found' });
        assignment.batch = batchId;
        assignment.coachingCenter = batch.coachingCenter;
      } else {
        /* Faculty cannot clear the batch — assignments must stay batch-scoped */
        return res.status(400).json({ error: 'Faculty assignments must belong to a batch' });
      }
    }

    await assignment.save();

    /* Notify on activation if not already notified (mirror of coordinator flow) */
    if (req.body.status === 'active' && assignment.status === 'active' && assignment.batch) {
      const existingNotifs = await Notification.countDocuments({
        type: 'assignment_created',
        link: `/assignments/${assignment._id}`
      });
      if (existingNotifs === 0) {
        const facultyUser = await User.findOne({ clerkId: req.userId });
        const center = await CoachingCenter.findById(assignment.coachingCenter).select('name logo').lean();
        const students = await User.find({ batch: assignment.batch });
        const notifications = students.map(s => ({
          user: s._id,
          from: facultyUser?._id,
          type: 'assignment_created',
          title: `New Assignment`,
          message: `"${assignment.title}" — Complete it before ${new Date(assignment.endDate).toLocaleDateString()} at 11:59 PM.`,
          link: `/assignments/${assignment._id}`,
          centerName: center?.name || '',
          centerLogo: center?.logo || '',
          read: false
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    }

    const populated = await Assignment.findById(assignment._id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    console.log('[FACULTY] Assignment updated:', id);
    res.json({ data: populated });
  } catch (error) {
    console.error('[FACULTY] Error updating assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/faculty/assignments/:id
 * Delete an assignment + its submissions (batch must be in scope).
 */
export async function deleteFacultyAssignment(req, res) {
  try {
    const { id } = req.params;
    console.log('[FACULTY] Deleting assignment:', id);

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (!assignment.batch || !req.facultyBatchIds.some(bid => bid.toString() === assignment.batch.toString())) {
      return res.status(403).json({ error: 'Access denied — assignment not in your batches' });
    }

    await AssignmentSubmission.deleteMany({ assignment: id });
    await Assignment.findByIdAndDelete(id);

    console.log('[FACULTY] Assignment deleted:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('[FACULTY] Error deleting assignment:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/faculty/assignments/:id/bulk-grade
 * Grade ALL submissions of an in-scope assignment (approve/reject).
 */
export async function bulkGradeFacultySubmissions(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    console.log('[FACULTY] Bulk grading assignment:', id, '->', status);

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (!assignment.batch || !req.facultyBatchIds.some(bid => bid.toString() === assignment.batch.toString())) {
      return res.status(403).json({ error: 'Access denied — assignment not in your batches' });
    }

    const facultyUser = await User.findOne({ clerkId: req.userId });

    const result = await AssignmentSubmission.updateMany(
      { assignment: id, status: 'submitted' },
      { $set: { status, feedback: feedback || '' } }
    );

    console.log('[FACULTY] Bulk graded:', result.modifiedCount, 'submissions');

    const center = await CoachingCenter.findById(assignment.coachingCenter).select('name logo').lean();

    const affectedSubmissions = await AssignmentSubmission.find({ assignment: id, status }).populate('student', '_id').lean();
    const notifType = status === 'approved' ? 'assignment_approved' : 'assignment_rejected';
    const notifications = affectedSubmissions.map(sub => ({
      user: sub.student._id,
      from: facultyUser?._id || undefined,
      type: notifType,
      title: `Assignment ${status}: ${assignment.title}`,
      message: feedback
        ? `Your submission for "${assignment.title}" has been ${status}. Feedback: ${feedback}`
        : `Your submission for "${assignment.title}" has been ${status}.`,
      link: `/assignments/${assignment._id}`,
      centerName: center?.name || '',
      centerLogo: center?.logo || '',
      read: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log('[FACULTY] Bulk notifications sent:', notifications.length);
    }

    const populated = await Assignment.findById(id)
      .populate('batch', 'name code')
      .populate('createdBy', 'displayName username')
      .lean();

    const submissions = await AssignmentSubmission.find({ assignment: id })
      .populate('student', 'displayName username avatar email college')
      .sort({ submittedAt: -1 })
      .lean();

    let notSubmitted = [];
    if (populated.batch?._id) {
      const batchStudents = await User.find({ batch: populated.batch._id })
        .select('displayName username avatar email college _id')
        .lean();
      const submittedIds = new Set(submissions.map(s => s.student._id.toString()));
      notSubmitted = batchStudents.filter(s => !submittedIds.has(s._id.toString()));
    }

    res.json({ data: { ...populated, submissions, notSubmitted }, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('[FACULTY] Error bulk grading:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/faculty/assignments/:id/submissions/:submissionId
 * Grade a single submission (approve/reject + feedback + notifications).
 * Same IDOR guard as the coordinator flow — the submission must belong
 * to the assignment being graded, and the assignment's batch must be in scope.
 */
export async function gradeFacultySubmission(req, res) {
  try {
    const { id, submissionId } = req.params;
    const { status, feedback } = req.body;

    console.log('[FACULTY] Grading submission:', submissionId, '->', status);

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (!assignment.batch || !req.facultyBatchIds.some(bid => bid.toString() === assignment.batch.toString())) {
      return res.status(403).json({ error: 'Access denied — assignment not in your batches' });
    }

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    /* IDOR guard: the submission must belong to THIS assignment */
    if (submission.assignment.toString() !== id) {
      return res.status(400).json({ error: 'Submission does not belong to this assignment' });
    }

    if (status) submission.status = status;
    if (feedback !== undefined) submission.feedback = feedback;
    await submission.save();

    const facultyUser = await User.findOne({ clerkId: req.userId });

    if (status && ['approved', 'rejected'].includes(status) && submission.student) {
      const notifType = status === 'approved' ? 'assignment_approved' : 'assignment_rejected';
      const studentId = submission.student._id || submission.student;

      const center = await CoachingCenter.findById(assignment.coachingCenter).select('name logo').lean();

      await Notification.create({
        user: studentId,
        from: facultyUser?._id || undefined,
        type: notifType,
        title: `Assignment ${status}: ${assignment.title}`,
        message: feedback
          ? `Your submission for "${assignment.title}" has been ${status}. Feedback: ${feedback}`
          : `Your submission for "${assignment.title}" has been ${status}.`,
        link: `/assignments/${assignment._id}`,
        centerName: center?.name || '',
        centerLogo: center?.logo || '',
        read: false
      });
      console.log('[FACULTY] Grade notification sent to student:', studentId);
    }

    console.log('[FACULTY] Submission graded:', submissionId);
    res.json({ data: submission });
  } catch (error) {
    console.error('[FACULTY] Error grading submission:', error.message);
    res.status(500).json({ error: error.message });
  }
}