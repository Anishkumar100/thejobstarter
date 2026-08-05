/*
 * OS Controller — mirrors dbmsController.js for the full OS lesson → subtopic → problem hierarchy
 * OS problems have NO codeBlocks (conceptual only)
 */
import OsLesson from '../models/OsLesson.js';
import OsSubtopic from '../models/OsSubtopic.js';
import OsProblem from '../models/OsProblem.js';
import { clearCache } from '../middleware/cache.js';
import { resolveUser, canAccessSubject, hasAdminAccess, getLockedLessons, isLessonFree } from '../utils/accessControl.js';

/* ===================== LESSONS ===================== */

/*
 * GET /api/os/lessons
 * Fetch all OS lessons sorted by order, with locked flags
 */
export async function getLessons(req, res) {
  try {
    console.log('[OS] Fetching lessons...');
    const lessons = await OsLesson.find().sort({ order: 1, title: 1 }).lean();
    const user = await resolveUser(req);
    const enriched = getLockedLessons(lessons, user);
    console.log('[OS] Lessons fetched:', enriched.length);
    res.json({ data: enriched });
  } catch (error) {
    console.error('[OS] Error fetching lessons:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/os/lessons/:slug
 * Fetch a single OS lesson with its problems, gated by access
 */
export async function getLessonBySlug(req, res) {
  try {
    console.log('[OS] Fetching lesson by slug:', req.params.slug);
    const lesson = await OsLesson.findOne({ slug: req.params.slug }).lean();
    if (!lesson) {
      console.log('[OS] Lesson not found:', req.params.slug);
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const user = await resolveUser(req);
    const allLessons = await OsLesson.find().sort({ order: 1 }).lean();
    const free = isLessonFree(lesson.slug, allLessons);
    if (!free && !canAccessSubject(user)) {
      console.log('[OS] Lesson locked:', lesson.title);
      return res.json({ data: { ...lesson, locked: true, problems: [], subtopics: [] } });
    }
    const problems = await OsProblem.find({ lessonSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    console.log('[OS] Lesson fetched:', lesson.title, 'with', problems.length, 'problems');
    res.json({ data: { ...lesson, locked: false, problems } });
  } catch (error) {
    console.error('[OS] Error fetching lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/os/lessons
 * Admin: Create a new OS lesson
 */
export async function createLesson(req, res) {
  try {
    console.log('[OS] Creating lesson:', req.body.title);
    const lesson = await OsLesson.create(req.body);
    clearCache();
    console.log('[OS] Lesson created:', lesson._id);
    res.status(201).json({ data: lesson });
  } catch (error) {
    console.error('[OS] Error creating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/os/lessons/:id
 * Admin: Update an OS lesson
 */
export async function updateLesson(req, res) {
  try {
    console.log('[OS] Updating lesson:', req.params.id);
    const lesson = await OsLesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[OS] Lesson updated:', lesson._id);
    res.json({ data: lesson });
  } catch (error) {
    console.error('[OS] Error updating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/os/lessons/:id
 * Admin: Delete an OS lesson
 */
export async function deleteLesson(req, res) {
  try {
    console.log('[OS] Deleting lesson:', req.params.id);
    const lesson = await OsLesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[OS] Lesson deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[OS] Error deleting lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== SUBTOPICS ===================== */

/*
 * GET /api/os/subtopics?lesson=slug
 * Fetch subtopics, optionally filtered by lesson. Gated by parent lesson access.
 */
export async function getSubtopics(req, res) {
  try {
    console.log('[OS] Fetching subtopics with filters:', req.query);
    const { lesson } = req.query;
    const user = await resolveUser(req);

    /* No lesson filter — admin/paid "all subtopics" view (gated by access) */
    if (!lesson) {
      if (!(await hasAdminAccess(req, user))) {
        console.log('[OS] Subtopics blocked — lesson query param required for free users');
        return res.status(400).json({ error: 'lesson query param required' });
      }
      const allSubtopics = await OsSubtopic.find().sort({ order: 1, title: 1 }).lean();
      console.log('[OS] All subtopics fetched:', allSubtopics.length);
      return res.json({ data: allSubtopics });
    }

    const allLessons = await OsLesson.find().sort({ order: 1 }).lean();
    if (!isLessonFree(lesson, allLessons) && !canAccessSubject(user)) {
      console.log('[OS] Subtopics blocked — lesson locked:', lesson);
      return res.json({ data: [], locked: true });
    }
    const subtopics = await OsSubtopic.find({ lessonSlug: lesson }).sort({ order: 1, title: 1 }).lean();
    console.log('[OS] Subtopics fetched:', subtopics.length);
    res.json({ data: subtopics });
  } catch (error) {
    console.error('[OS] Error fetching subtopics:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/os/subtopics/:slug
 * Fetch a single OS subtopic with its problems, gated by parent lesson access.
 */
export async function getSubtopicBySlug(req, res) {
  try {
    console.log('[OS] Fetching subtopic by slug:', req.params.slug);
    const subtopic = await OsSubtopic.findOne({ slug: req.params.slug }).lean();
    if (!subtopic) {
      console.log('[OS] Subtopic not found:', req.params.slug);
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    const lesson = await OsLesson.findOne({ slug: subtopic.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await OsLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[OS] Subtopic blocked — lesson locked:', subtopic.title);
        return res.json({ data: { ...subtopic, locked: true, problems: [] } });
      }
    }
    const problems = await OsProblem.find({ subtopicSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    console.log('[OS] Subtopic fetched:', subtopic.title, 'with', problems.length, 'problems');
    res.json({ data: { ...subtopic, locked: false, problems } });
  } catch (error) {
    console.error('[OS] Error fetching subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/os/subtopics
 * Admin: Create a new OS subtopic
 */
export async function createSubtopic(req, res) {
  try {
    console.log('[OS] Creating subtopic:', req.body.title);
    const subtopic = await OsSubtopic.create(req.body);
    clearCache();
    console.log('[OS] Subtopic created:', subtopic._id);
    res.status(201).json({ data: subtopic });
  } catch (error) {
    console.error('[OS] Error creating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/os/subtopics/:id
 * Admin: Update an OS subtopic
 */
export async function updateSubtopic(req, res) {
  try {
    console.log('[OS] Updating subtopic:', req.params.id);
    const subtopic = await OsSubtopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[OS] Subtopic updated:', subtopic._id);
    res.json({ data: subtopic });
  } catch (error) {
    console.error('[OS] Error updating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/os/subtopics/:id
 * Admin: Delete an OS subtopic
 */
export async function deleteSubtopic(req, res) {
  try {
    console.log('[OS] Deleting subtopic:', req.params.id);
    const subtopic = await OsSubtopic.findByIdAndDelete(req.params.id);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[OS] Subtopic deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[OS] Error deleting subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/os/subtopics/:slug/problems
 * Fetch problems belonging to a specific OS subtopic, gated by parent lesson access.
 */
export async function getSubtopicProblems(req, res) {
  try {
    console.log('[OS] Fetching problems for subtopic:', req.params.slug);
    const { difficulty, page = 1, limit = 20 } = req.query;
    const subtopic = await OsSubtopic.findOne({ slug: req.params.slug }).lean();
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    const lesson = await OsLesson.findOne({ slug: subtopic.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await OsLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[OS] Subtopic problems blocked — lesson locked:', subtopic.lessonSlug);
        return res.json({ data: [], total: 0, page: Number(page), totalPages: 0 });
      }
    }
    const query = { subtopicSlug: req.params.slug };
    if (difficulty) query.difficulty = difficulty;
    const skip = (page - 1) * limit;
    const problems = await OsProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean();
    const total = await OsProblem.countDocuments(query);
    console.log('[OS] Subtopic problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[OS] Error fetching subtopic problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PROBLEMS ===================== */

/*
 * GET /api/os/problems
 * Fetch all OS problems with filters, gated by lesson access.
 */
export async function getProblems(req, res) {
  try {
    console.log('[OS] Fetching problems with filters:', req.query);
    const { lesson, subtopic, difficulty, company, topic, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (lesson) query.lessonSlug = lesson;
    if (subtopic) query.subtopicSlug = subtopic;
    if (difficulty) query.difficulty = difficulty;
    if (company) query.companies = company;
    if (topic) query.topics = topic;
    if (search) query.title = { $regex: search, $options: 'i' };

    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await OsLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson, allLessons) && !canAccessSubject(user)) {
        console.log('[OS] Problems blocked — lesson locked:', lesson);
        return res.json({ data: [], total: 0, page: Number(page), totalPages: 0 });
      }
    }

    const skip = (page - 1) * limit;
    const problems = await OsProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean();
    const total = await OsProblem.countDocuments(query);

    console.log('[OS] Problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[OS] Error fetching problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/os/problems/:slug
 * Fetch a single OS problem by slug, increment view count, gated by lesson access.
 */
export async function getProblemBySlug(req, res) {
  try {
    console.log('[OS] Fetching problem by slug:', req.params.slug);
    const problem = await OsProblem.findOne({ slug: req.params.slug }).lean();
    if (!problem) {
      console.log('[OS] Problem not found:', req.params.slug);
      return res.status(404).json({ error: 'Problem not found' });
    }
    const lesson = await OsLesson.findOne({ slug: problem.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await OsLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[OS] Problem blocked — lesson locked:', problem.title);
        return res.json({ data: { ...problem, locked: true, lesson, subtopic: null } });
      }
    }
    await OsProblem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    const subtopic = problem.subtopicSlug ? await OsSubtopic.findOne({ slug: problem.subtopicSlug }).lean() : null;
    console.log('[OS] Problem fetched:', problem.title);
    res.json({ data: { ...problem, lesson, subtopic } });
  } catch (error) {
    console.error('[OS] Error fetching problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/os/problems
 * Admin: Create a new OS problem (no codeBlocks field)
 */
export async function createProblem(req, res) {
  try {
    console.log('[OS] Creating problem:', req.body.title);
    const problem = await OsProblem.create(req.body);
    await OsLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: 1 } });
    clearCache();
    console.log('[OS] Problem created:', problem._id);
    res.status(201).json({ data: problem });
  } catch (error) {
    console.error('[OS] Error creating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/os/problems/:id
 * Admin: Update an OS problem
 */
export async function updateProblem(req, res) {
  try {
    console.log('[OS] Updating problem:', req.params.id);
    const problem = await OsProblem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    clearCache();
    console.log('[OS] Problem updated:', problem._id);
    res.json({ data: problem });
  } catch (error) {
    console.error('[OS] Error updating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/os/problems/:id
 * Admin: Delete an OS problem
 */
export async function deleteProblem(req, res) {
  try {
    console.log('[OS] Deleting problem:', req.params.id);
    const problem = await OsProblem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    await OsLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: -1 } });
    clearCache();
    console.log('[OS] Problem deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[OS] Error deleting problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}
