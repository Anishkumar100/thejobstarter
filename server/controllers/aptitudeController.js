import AptitudeLesson from '../models/AptitudeLesson.js';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';
import AptitudeProblem from '../models/AptitudeProblem.js';
import { clearCache } from '../middleware/cache.js';
import { resolveUser, canAccessSubject, hasAdminAccess, getLockedLessons, isLessonFree } from '../utils/accessControl.js';

/* ===================== LESSONS ===================== */

export async function getLessons(req, res) {
  try {
    console.log('[APTITUDE] Fetching lessons...');
    const lessons = await AptitudeLesson.find().sort({ order: 1, title: 1 }).lean();
    const user = await resolveUser(req);
    const enriched = getLockedLessons(lessons, user);
    console.log('[APTITUDE] Lessons fetched:', enriched.length);
    res.json({ data: enriched });
  } catch (error) {
    console.error('[APTITUDE] Error fetching lessons:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getLessonBySlug(req, res) {
  try {
    console.log('[APTITUDE] Fetching lesson by slug:', req.params.slug);
    const lesson = await AptitudeLesson.findOne({ slug: req.params.slug }).lean();
    if (!lesson) {
      console.log('[APTITUDE] Lesson not found:', req.params.slug);
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const user = await resolveUser(req);
    const allLessons = await AptitudeLesson.find().sort({ order: 1 }).lean();
    const free = isLessonFree(lesson.slug, allLessons);
    if (!free && !canAccessSubject(user)) {
      console.log('[APTITUDE] Lesson locked:', lesson.title);
      return res.json({ data: { ...lesson, locked: true, problems: [], subtopics: [] } });
    }
    const problems = await AptitudeProblem.find({ lessonSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    console.log('[APTITUDE] Lesson fetched:', lesson.title, 'with', problems.length, 'problems');
    res.json({ data: { ...lesson, locked: false, problems } });
  } catch (error) {
    console.error('[APTITUDE] Error fetching lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createLesson(req, res) {
  try {
    console.log('[APTITUDE] Creating lesson:', req.body.title);
    const lesson = await AptitudeLesson.create(req.body);
    clearCache();
    console.log('[APTITUDE] Lesson created:', lesson._id);
    res.status(201).json({ data: lesson });
  } catch (error) {
    console.error('[APTITUDE] Error creating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateLesson(req, res) {
  try {
    console.log('[APTITUDE] Updating lesson:', req.params.id);
    const lesson = await AptitudeLesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[APTITUDE] Lesson updated:', lesson._id);
    res.json({ data: lesson });
  } catch (error) {
    console.error('[APTITUDE] Error updating lesson:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteLesson(req, res) {
  try {
    console.log('[APTITUDE] Deleting lesson:', req.params.id);
    const lesson = await AptitudeLesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    clearCache();
    console.log('[APTITUDE] Lesson deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[APTITUDE] Error deleting lesson:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== SUBTOPICS ===================== */

export async function getSubtopics(req, res) {
  try {
    console.log('[APTITUDE] Fetching subtopics with filters:', req.query);
    const { lesson } = req.query;
    const user = await resolveUser(req);

    /* No lesson filter — admin/paid "all subtopics" view (gated by access) */
    if (!lesson) {
      if (!(await hasAdminAccess(req, user))) {
        console.log('[APTITUDE] Subtopics blocked — lesson query param required for free users');
        return res.status(400).json({ error: 'lesson query param required' });
      }
      const allSubtopics = await AptitudeSubtopic.find().sort({ order: 1, title: 1 }).lean();
      console.log('[APTITUDE] All subtopics fetched:', allSubtopics.length);
      return res.json({ data: allSubtopics });
    }

    const allLessons = await AptitudeLesson.find().sort({ order: 1 }).lean();
    if (!isLessonFree(lesson, allLessons) && !canAccessSubject(user)) {
      console.log('[APTITUDE] Subtopics blocked — lesson locked:', lesson);
      return res.json({ data: [], locked: true });
    }
    const subtopics = await AptitudeSubtopic.find({ lessonSlug: lesson }).sort({ order: 1, title: 1 }).lean();
    console.log('[APTITUDE] Subtopics fetched:', subtopics.length);
    res.json({ data: subtopics });
  } catch (error) {
    console.error('[APTITUDE] Error fetching subtopics:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getSubtopicBySlug(req, res) {
  try {
    console.log('[APTITUDE] Fetching subtopic by slug:', req.params.slug);
    const subtopic = await AptitudeSubtopic.findOne({ slug: req.params.slug }).lean();
    if (!subtopic) {
      console.log('[APTITUDE] Subtopic not found:', req.params.slug);
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    const lesson = await AptitudeLesson.findOne({ slug: subtopic.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await AptitudeLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[APTITUDE] Subtopic blocked — lesson locked:', subtopic.title);
        return res.json({ data: { ...subtopic, locked: true, problems: [] } });
      }
    }
    const problems = await AptitudeProblem.find({ subtopicSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    console.log('[APTITUDE] Subtopic fetched:', subtopic.title, 'with', problems.length, 'problems');
    res.json({ data: { ...subtopic, locked: false, problems } });
  } catch (error) {
    console.error('[APTITUDE] Error fetching subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createSubtopic(req, res) {
  try {
    console.log('[APTITUDE] Creating subtopic:', req.body.title);
    const subtopic = await AptitudeSubtopic.create(req.body);
    clearCache();
    console.log('[APTITUDE] Subtopic created:', subtopic._id);
    res.status(201).json({ data: subtopic });
  } catch (error) {
    console.error('[APTITUDE] Error creating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateSubtopic(req, res) {
  try {
    console.log('[APTITUDE] Updating subtopic:', req.params.id);
    const subtopic = await AptitudeSubtopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[APTITUDE] Subtopic updated:', subtopic._id);
    res.json({ data: subtopic });
  } catch (error) {
    console.error('[APTITUDE] Error updating subtopic:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteSubtopic(req, res) {
  try {
    console.log('[APTITUDE] Deleting subtopic:', req.params.id);
    const subtopic = await AptitudeSubtopic.findByIdAndDelete(req.params.id);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    clearCache();
    console.log('[APTITUDE] Subtopic deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[APTITUDE] Error deleting subtopic:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getSubtopicProblems(req, res) {
  try {
    console.log('[APTITUDE] Fetching problems for subtopic:', req.params.slug);
    const { difficulty, page = 1, limit = 20 } = req.query;
    const subtopic = await AptitudeSubtopic.findOne({ slug: req.params.slug }).lean();
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    const lesson = await AptitudeLesson.findOne({ slug: subtopic.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await AptitudeLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[APTITUDE] Subtopic problems blocked — lesson locked:', subtopic.lessonSlug);
        return res.json({ data: [], total: 0, page: Number(page), totalPages: 0 });
      }
    }
    const query = { subtopicSlug: req.params.slug };
    if (difficulty) query.difficulty = difficulty;
    const skip = (page - 1) * limit;
    const problems = await AptitudeProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean();
    const total = await AptitudeProblem.countDocuments(query);
    console.log('[APTITUDE] Subtopic problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[APTITUDE] Error fetching subtopic problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PROBLEMS ===================== */

export async function getProblems(req, res) {
  try {
    console.log('[APTITUDE] Fetching problems with filters:', req.query);
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
      const allLessons = await AptitudeLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson, allLessons) && !canAccessSubject(user)) {
        console.log('[APTITUDE] Problems blocked — lesson locked:', lesson);
        return res.json({ data: [], total: 0, page: Number(page), totalPages: 0 });
      }
    }

    const skip = (page - 1) * limit;
    const problems = await AptitudeProblem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean();
    const total = await AptitudeProblem.countDocuments(query);

    console.log('[APTITUDE] Problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[APTITUDE] Error fetching problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getProblemBySlug(req, res) {
  try {
    console.log('[APTITUDE] Fetching problem by slug:', req.params.slug);
    const problem = await AptitudeProblem.findOne({ slug: req.params.slug }).lean();
    if (!problem) {
      console.log('[APTITUDE] Problem not found:', req.params.slug);
      return res.status(404).json({ error: 'Problem not found' });
    }
    const lesson = await AptitudeLesson.findOne({ slug: problem.lessonSlug }).lean();
    if (lesson) {
      const user = await resolveUser(req);
      const allLessons = await AptitudeLesson.find().sort({ order: 1 }).lean();
      if (!isLessonFree(lesson.slug, allLessons) && !canAccessSubject(user)) {
        console.log('[APTITUDE] Problem blocked — lesson locked:', problem.title);
        return res.json({ data: { ...problem, locked: true, lesson, subtopic: null } });
      }
    }
    await AptitudeProblem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    const subtopic = problem.subtopicSlug ? await AptitudeSubtopic.findOne({ slug: problem.subtopicSlug }).lean() : null;
    console.log('[APTITUDE] Problem fetched:', problem.title);
    res.json({ data: { ...problem, lesson, subtopic } });
  } catch (error) {
    console.error('[APTITUDE] Error fetching problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function createProblem(req, res) {
  try {
    console.log('[APTITUDE] Creating problem:', req.body.title);
    const problem = await AptitudeProblem.create(req.body);
    await AptitudeLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: 1 } });
    clearCache();
    console.log('[APTITUDE] Problem created:', problem._id);
    res.status(201).json({ data: problem });
  } catch (error) {
    console.error('[APTITUDE] Error creating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function updateProblem(req, res) {
  try {
    console.log('[APTITUDE] Updating problem:', req.params.id);
    const problem = await AptitudeProblem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    clearCache();
    console.log('[APTITUDE] Problem updated:', problem._id);
    res.json({ data: problem });
  } catch (error) {
    console.error('[APTITUDE] Error updating problem:', error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function deleteProblem(req, res) {
  try {
    console.log('[APTITUDE] Deleting problem:', req.params.id);
    const problem = await AptitudeProblem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    await AptitudeLesson.findOneAndUpdate({ slug: problem.lessonSlug }, { $inc: { problemCount: -1 } });
    clearCache();
    console.log('[APTITUDE] Problem deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[APTITUDE] Error deleting problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}
