import Problem from '../models/Problem.js';
import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import { clearCache } from '../middleware/cache.js';

/* ===================== LESSONS ===================== */

/*
 * GET /api/dsa/lessons
 * Fetch all DSA lessons, optionally filtered by category, each with problem count
 */
export async function getLessons(req, res) {
  try {
    console.log('[DSA] Fetching lessons with filters:', req.query);
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;
    const lessons = await DsaLesson.find(query).sort({ order: 1, title: 1 });
    console.log('[DSA] Lessons fetched:', lessons.length);
    res.json({ data: lessons });
  } catch (error) {
    console.error('[DSA] Error fetching lessons:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/dsa/lessons/:slug
 * Fetch a single lesson with its problems
 */
export async function getLessonBySlug(req, res) {
  try {
    console.log('[DSA] Fetching lesson by slug:', req.params.slug);
    const lesson = await DsaLesson.findOne({ slug: req.params.slug });
    if (!lesson) {
      console.log('[DSA] Lesson not found:', req.params.slug);
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const problems = await Problem.find({ lessonSlug: req.params.slug }).sort({ createdAt: -1 });
    console.log('[DSA] Lesson fetched:', lesson.title, 'with', problems.length, 'problems');
    res.json({ data: { ...lesson.toObject(), problems } });
  } catch (error) {
    console.error('[DSA] Error fetching lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dsa/lessons
 * Admin: Create a new lesson
 */
export async function createLesson(req, res) {
  try {
    console.log('[DSA] Creating lesson:', req.body.title);
    const lesson = await DsaLesson.create(req.body);
    clearCache();
    console.log('[DSA] Lesson created:', lesson._id);
    res.status(201).json({ data: lesson });
  } catch (error) {
    console.error('[DSA] Error creating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/dsa/lessons/:id
 * Admin: Update a lesson
 */
export async function updateLesson(req, res) {
  try {
    console.log('[DSA] Updating lesson:', req.params.id);
    const lesson = await DsaLesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[DSA] Lesson updated:', lesson._id);
    res.json({ data: lesson });
  } catch (error) {
    console.error('[DSA] Error updating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/dsa/lessons/:id
 * Admin: Delete a lesson
 */
export async function deleteLesson(req, res) {
  try {
    console.log('[DSA] Deleting lesson:', req.params.id);
    const lesson = await DsaLesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[DSA] Lesson deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DSA] Error deleting lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PROBLEMS ===================== */

/*
 * GET /api/dsa/problems
 * Fetch problems with optional filters: lesson, difficulty, company, topic, search, page
 */
export async function getProblems(req, res) {
  try {
    console.log('[DSA] Fetching problems with filters:', req.query);
    const { lesson, subtopic, difficulty, company, topic, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (lesson) query.lessonSlug = lesson;
    if (subtopic) query.subtopicSlug = subtopic;
    if (difficulty) query.difficulty = difficulty;
    if (company) query.companies = company;
    if (topic) query.topics = topic;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const problems = await Problem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Problem.countDocuments(query);

    console.log('[DSA] Problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[DSA] Error fetching problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/dsa/problems/:slug
 * Fetch single problem by slug, increment view count
 */
export async function getProblemBySlug(req, res) {
  try {
    console.log('[DSA] Fetching problem by slug:', req.params.slug);
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      console.log('[DSA] Problem not found:', req.params.slug);
      return res.status(404).json({ error: 'Problem not found' });
    }
    await Problem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    const lesson = await DsaLesson.findOne({ slug: problem.lessonSlug });
    const subtopic = problem.subtopicSlug ? await Subtopic.findOne({ slug: problem.subtopicSlug }) : null;
    console.log('[DSA] Problem fetched:', problem.title);
    res.json({ data: { ...problem.toObject(), lesson, subtopic } });
  } catch (error) {
    console.error('[DSA] Error fetching problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/dsa/problems
 * Admin: Create a new problem
 */
export async function createProblem(req, res) {
  try {
    console.log('[DSA] Creating problem:', req.body.title);
    const problem = await Problem.create(req.body);
    await DsaLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: 1 } });
    clearCache();
    console.log('[DSA] Problem created:', problem._id);
    res.status(201).json({ data: problem });
  } catch (error) {
    console.error('[DSA] Error creating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * PUT /api/dsa/problems/:id
 * Admin: Update a problem
 */
export async function updateProblem(req, res) {
  try {
    console.log('[DSA] Updating problem:', req.params.id);
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    clearCache();
    console.log('[DSA] Problem updated:', problem._id);
    res.json({ data: problem });
  } catch (error) {
    console.error('[DSA] Error updating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

/*
 * DELETE /api/dsa/problems/:id
 * Admin: Delete a problem
 */
export async function deleteProblem(req, res) {
  try {
    console.log('[DSA] Deleting problem:', req.params.id);
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    await DsaLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: -1 } });
    clearCache();
    console.log('[DSA] Problem deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DSA] Error deleting problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}
