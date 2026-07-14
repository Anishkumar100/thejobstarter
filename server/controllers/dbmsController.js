import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import { clearCache } from '../middleware/cache.js';

/* ===================== LESSONS ===================== */

export async function getLessons(req, res) {
  try {
    console.log('[DBMS] Fetching lessons...');
    const lessons = await DbmsLesson.find().sort({ order: 1, title: 1 });
    console.log('[DBMS] Lessons fetched:', lessons.length);
    res.json({ data: lessons });
  } catch (error) {
    console.error('[DBMS] Error fetching lessons:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getLessonBySlug(req, res) {
  try {
    console.log('[DBMS] Fetching lesson by slug:', req.params.slug);
    const lesson = await DbmsLesson.findOne({ slug: req.params.slug });
    if (!lesson) {
      console.log('[DBMS] Lesson not found:', req.params.slug);
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const problems = await DbmsProblem.find({ lessonSlug: req.params.slug }).sort({ createdAt: -1 });
    console.log('[DBMS] Lesson fetched:', lesson.title, 'with', problems.length, 'problems');
    res.json({ data: { ...lesson.toObject(), problems } });
  } catch (error) {
    console.error('[DBMS] Error fetching lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createLesson(req, res) {
  try {
    console.log('[DBMS] Creating lesson:', req.body.title);
    const lesson = await DbmsLesson.create(req.body);
    clearCache();
    console.log('[DBMS] Lesson created:', lesson._id);
    res.status(201).json({ data: lesson });
  } catch (error) {
    console.error('[DBMS] Error creating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateLesson(req, res) {
  try {
    console.log('[DBMS] Updating lesson:', req.params.id);
    const lesson = await DbmsLesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[DBMS] Lesson updated:', lesson._id);
    res.json({ data: lesson });
  } catch (error) {
    console.error('[DBMS] Error updating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteLesson(req, res) {
  try {
    console.log('[DBMS] Deleting lesson:', req.params.id);
    const lesson = await DbmsLesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[DBMS] Lesson deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DBMS] Error deleting lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== SUBTOPICS ===================== */

export async function getSubtopics(req, res) {
  try {
    console.log('[DBMS] Fetching subtopics with filters:', req.query);
    const { lesson } = req.query;
    const query = {};
    if (lesson) query.lessonSlug = lesson;
    const subtopics = await DbmsSubtopic.find(query).sort({ order: 1, title: 1 });
    console.log('[DBMS] Subtopics fetched:', subtopics.length);
    res.json({ data: subtopics });
  } catch (error) {
    console.error('[DBMS] Error fetching subtopics:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getSubtopicBySlug(req, res) {
  try {
    console.log('[DBMS] Fetching subtopic by slug:', req.params.slug);
    const subtopic = await DbmsSubtopic.findOne({ slug: req.params.slug });
    if (!subtopic) {
      console.log('[DBMS] Subtopic not found:', req.params.slug);
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    const problems = await DbmsProblem.find({ subtopicSlug: req.params.slug }).sort({ createdAt: -1 });
    console.log('[DBMS] Subtopic fetched:', subtopic.title, 'with', problems.length, 'problems');
    res.json({ data: { ...subtopic.toObject(), problems } });
  } catch (error) {
    console.error('[DBMS] Error fetching subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createSubtopic(req, res) {
  try {
    console.log('[DBMS] Creating subtopic:', req.body.title);
    const subtopic = await DbmsSubtopic.create(req.body);
    clearCache();
    console.log('[DBMS] Subtopic created:', subtopic._id);
    res.status(201).json({ data: subtopic });
  } catch (error) {
    console.error('[DBMS] Error creating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateSubtopic(req, res) {
  try {
    console.log('[DBMS] Updating subtopic:', req.params.id);
    const subtopic = await DbmsSubtopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[DBMS] Subtopic updated:', subtopic._id);
    res.json({ data: subtopic });
  } catch (error) {
    console.error('[DBMS] Error updating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteSubtopic(req, res) {
  try {
    console.log('[DBMS] Deleting subtopic:', req.params.id);
    const subtopic = await DbmsSubtopic.findByIdAndDelete(req.params.id);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[DBMS] Subtopic deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DBMS] Error deleting subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getSubtopicProblems(req, res) {
  try {
    console.log('[DBMS] Fetching problems for subtopic:', req.params.slug);
    const { difficulty, page = 1, limit = 20 } = req.query;
    const query = { subtopicSlug: req.params.slug };
    if (difficulty) query.difficulty = difficulty;
    const skip = (page - 1) * limit;
    const problems = await DbmsProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await DbmsProblem.countDocuments(query);
    console.log('[DBMS] Subtopic problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[DBMS] Error fetching subtopic problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PROBLEMS ===================== */

export async function getProblems(req, res) {
  try {
    console.log('[DBMS] Fetching problems with filters:', req.query);
    const { lesson, subtopic, difficulty, company, topic, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (lesson) query.lessonSlug = lesson;
    if (subtopic) query.subtopicSlug = subtopic;
    if (difficulty) query.difficulty = difficulty;
    if (company) query.companies = company;
    if (topic) query.topics = topic;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const problems = await DbmsProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await DbmsProblem.countDocuments(query);

    console.log('[DBMS] Problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[DBMS] Error fetching problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getProblemBySlug(req, res) {
  try {
    console.log('[DBMS] Fetching problem by slug:', req.params.slug);
    const problem = await DbmsProblem.findOne({ slug: req.params.slug });
    if (!problem) {
      console.log('[DBMS] Problem not found:', req.params.slug);
      return res.status(404).json({ error: 'Problem not found' });
    }
    await DbmsProblem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    const lesson = await DbmsLesson.findOne({ slug: problem.lessonSlug });
    const subtopic = problem.subtopicSlug ? await DbmsSubtopic.findOne({ slug: problem.subtopicSlug }) : null;
    console.log('[DBMS] Problem fetched:', problem.title);
    res.json({ data: { ...problem.toObject(), lesson, subtopic } });
  } catch (error) {
    console.error('[DBMS] Error fetching problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createProblem(req, res) {
  try {
    console.log('[DBMS] Creating problem:', req.body.title);
    const problem = await DbmsProblem.create(req.body);
    await DbmsLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: 1 } });
    clearCache();
    console.log('[DBMS] Problem created:', problem._id);
    res.status(201).json({ data: problem });
  } catch (error) {
    console.error('[DBMS] Error creating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateProblem(req, res) {
  try {
    console.log('[DBMS] Updating problem:', req.params.id);
    const problem = await DbmsProblem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    clearCache();
    console.log('[DBMS] Problem updated:', problem._id);
    res.json({ data: problem });
  } catch (error) {
    console.error('[DBMS] Error updating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteProblem(req, res) {
  try {
    console.log('[DBMS] Deleting problem:', req.params.id);
    const problem = await DbmsProblem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    await DbmsLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: -1 } });
    clearCache();
    console.log('[DBMS] Problem deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DBMS] Error deleting problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}
