import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import { clearCache } from '../middleware/cache.js';
import { resolveUser, canAccessSubject, getLockedLessons, isLessonFree } from '../utils/accessControl.js';

/* ===================== LESSONS ===================== */

export async function getLessons(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching lessons...');
    const lessons = await ProgrammingLesson.find().sort({ order: 1, title: 1 }).lean();
    const user = await resolveUser(req);
    const enriched = getLockedLessons(lessons, user);
    console.log('[PROGRAMMING] Lessons fetched:', enriched.length);
    res.json({ data: enriched });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching lessons:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getLessonBySlug(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching lesson by slug:', req.params.slug);
    const lesson = await ProgrammingLesson.findOne({ slug: req.params.slug }).lean();
    if (!lesson) {
      console.log('[PROGRAMMING] Lesson not found:', req.params.slug);
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const user = await resolveUser(req);
    const allLessons = await ProgrammingLesson.find().sort({ order: 1 }).lean();
    const free = isLessonFree(lesson.slug, allLessons);
    if (!free && !canAccessSubject(user)) {
      console.log('[PROGRAMMING] Lesson locked:', lesson.title);
      return res.json({ data: { ...lesson, locked: true, problems: [], subtopics: [] } });
    }
    const problems = await ProgrammingProblem.find({ lessonSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    console.log('[PROGRAMMING] Lesson fetched:', lesson.title, 'with', problems.length, 'problems');
    res.json({ data: { ...lesson, locked: false, problems } });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createLesson(req, res) {
  try {
    console.log('[PROGRAMMING] Creating lesson:', req.body.title);
    const lesson = await ProgrammingLesson.create(req.body);
    clearCache();
    console.log('[PROGRAMMING] Lesson created:', lesson._id);
    res.status(201).json({ data: lesson });
  } catch (error) {
    console.error('[PROGRAMMING] Error creating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateLesson(req, res) {
  try {
    console.log('[PROGRAMMING] Updating lesson:', req.params.id);
    const lesson = await ProgrammingLesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[PROGRAMMING] Lesson updated:', lesson._id);
    res.json({ data: lesson });
  } catch (error) {
    console.error('[PROGRAMMING] Error updating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteLesson(req, res) {
  try {
    console.log('[PROGRAMMING] Deleting lesson:', req.params.id);
    const lesson = await ProgrammingLesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[PROGRAMMING] Lesson deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[PROGRAMMING] Error deleting lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== SUBTOPICS ===================== */

export async function getSubtopics(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching subtopics with filters:', req.query);
    const { lesson } = req.query;
    if (!lesson) return res.status(400).json({ error: 'lesson query param required' });
    const user = await resolveUser(req);
    const allLessons = await ProgrammingLesson.find().sort({ order: 1 }).lean();
    if (!isLessonFree(lesson, allLessons) && !canAccessSubject(user)) {
      console.log('[PROGRAMMING] Subtopics blocked — lesson locked:', lesson);
      return res.json({ data: [], locked: true });
    }
    const subtopics = await ProgrammingSubtopic.find({ lessonSlug: lesson }).sort({ order: 1, title: 1 }).lean();
    console.log('[PROGRAMMING] Subtopics fetched:', subtopics.length);
    res.json({ data: subtopics });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching subtopics:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getSubtopicBySlug(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching subtopic by slug:', req.params.slug);
    const subtopic = await ProgrammingSubtopic.findOne({ slug: req.params.slug }).lean();
    if (!subtopic) {
      console.log('[PROGRAMMING] Subtopic not found:', req.params.slug);
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    const lesson = await ProgrammingLesson.findOne({ slug: subtopic.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await ProgrammingLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[PROGRAMMING] Subtopic blocked — lesson locked:', subtopic.title);
        return res.json({ data: { ...subtopic, locked: true, problems: [] } });
      }
    }
    const problems = await ProgrammingProblem.find({ subtopicSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    console.log('[PROGRAMMING] Subtopic fetched:', subtopic.title, 'with', problems.length, 'problems');
    res.json({ data: { ...subtopic, locked: false, problems } });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createSubtopic(req, res) {
  try {
    console.log('[PROGRAMMING] Creating subtopic:', req.body.title);
    const subtopic = await ProgrammingSubtopic.create(req.body);
    clearCache();
    console.log('[PROGRAMMING] Subtopic created:', subtopic._id);
    res.status(201).json({ data: subtopic });
  } catch (error) {
    console.error('[PROGRAMMING] Error creating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateSubtopic(req, res) {
  try {
    console.log('[PROGRAMMING] Updating subtopic:', req.params.id);
    const subtopic = await ProgrammingSubtopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[PROGRAMMING] Subtopic updated:', subtopic._id);
    res.json({ data: subtopic });
  } catch (error) {
    console.error('[PROGRAMMING] Error updating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteSubtopic(req, res) {
  try {
    console.log('[PROGRAMMING] Deleting subtopic:', req.params.id);
    const subtopic = await ProgrammingSubtopic.findByIdAndDelete(req.params.id);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[PROGRAMMING] Subtopic deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[PROGRAMMING] Error deleting subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getSubtopicProblems(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching problems for subtopic:', req.params.slug);
    const { difficulty, page = 1, limit = 20 } = req.query;
    const subtopic = await ProgrammingSubtopic.findOne({ slug: req.params.slug }).lean();
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    const lesson = await ProgrammingLesson.findOne({ slug: subtopic.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await ProgrammingLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[PROGRAMMING] Subtopic problems blocked — lesson locked:', subtopic.lessonSlug);
        return res.json({ data: [], total: 0, page: Number(page), totalPages: 0 });
      }
    }
    const query = { subtopicSlug: req.params.slug };
    if (difficulty) query.difficulty = difficulty;
    const skip = (page - 1) * limit;
    const problems = await ProgrammingProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean();
    const total = await ProgrammingProblem.countDocuments(query);
    console.log('[PROGRAMMING] Subtopic problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching subtopic problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PROBLEMS ===================== */

export async function getProblems(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching problems with filters:', req.query);
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
      const allLessons = await ProgrammingLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson, allLessons) && !canAccessSubject(user)) {
        console.log('[PROGRAMMING] Problems blocked — lesson locked:', lesson);
        return res.json({ data: [], total: 0, page: Number(page), totalPages: 0 });
      }
    }

    const skip = (page - 1) * limit;
    const problems = await ProgrammingProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean();
    const total = await ProgrammingProblem.countDocuments(query);

    console.log('[PROGRAMMING] Problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getProblemBySlug(req, res) {
  try {
    console.log('[PROGRAMMING] Fetching problem by slug:', req.params.slug);
    const problem = await ProgrammingProblem.findOne({ slug: req.params.slug }).lean();
    if (!problem) {
      console.log('[PROGRAMMING] Problem not found:', req.params.slug);
      return res.status(404).json({ error: 'Problem not found' });
    }
    const lesson = await ProgrammingLesson.findOne({ slug: problem.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await ProgrammingLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[PROGRAMMING] Problem blocked — lesson locked:', problem.title);
        return res.json({ data: { ...problem, locked: true, lesson, subtopic: null } });
      }
    }
    await ProgrammingProblem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    const subtopic = problem.subtopicSlug ? await ProgrammingSubtopic.findOne({ slug: problem.subtopicSlug }).lean() : null;
    console.log('[PROGRAMMING] Problem fetched:', problem.title);
    res.json({ data: { ...problem, lesson, subtopic } });
  } catch (error) {
    console.error('[PROGRAMMING] Error fetching problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createProblem(req, res) {
  try {
    console.log('[PROGRAMMING] Creating problem:', req.body.title);
    const problem = await ProgrammingProblem.create(req.body);
    await ProgrammingLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: 1 } });
    clearCache();
    console.log('[PROGRAMMING] Problem created:', problem._id);
    res.status(201).json({ data: problem });
  } catch (error) {
    console.error('[PROGRAMMING] Error creating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateProblem(req, res) {
  try {
    console.log('[PROGRAMMING] Updating problem:', req.params.id);
    const problem = await ProgrammingProblem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    clearCache();
    console.log('[PROGRAMMING] Problem updated:', problem._id);
    res.json({ data: problem });
  } catch (error) {
    console.error('[PROGRAMMING] Error updating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteProblem(req, res) {
  try {
    console.log('[PROGRAMMING] Deleting problem:', req.params.id);
    const problem = await ProgrammingProblem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    await ProgrammingLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: -1 } });
    clearCache();
    console.log('[PROGRAMMING] Problem deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[PROGRAMMING] Error deleting problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}
