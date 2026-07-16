import Problem from '../models/Problem.js';
import DsaLesson from '../models/DsaLesson.js';
import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import Article from '../models/Article.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Language from '../models/Language.js';
import Cheatsheet from '../models/Cheatsheet.js';
import Newsletter from '../models/Newsletter.js';
import Topic from '../models/Topic.js';
import Subtopic from '../models/Subtopic.js';
import DbmsMeta from '../models/DbmsMeta.js';


/*
 * GET /api/admin/stats
 * Admin: Get dashboard statistics across all collections
 */
export async function getStats(req, res) {
  try {
    console.log('[ADMIN] Fetching dashboard stats...');
    const [
      problems, lessons, dbmsLessons, dbmsSubtopics, dbmsProblems, dbmsMeta, os, blog, users, questions, languages, cheatsheets, newsletter, topics, subtopics
    ] = await Promise.all([
      Problem.countDocuments(),
      DsaLesson.countDocuments(),
      DbmsLesson.countDocuments(),
      DbmsSubtopic.countDocuments(),
      DbmsProblem.countDocuments(),
      DbmsMeta.countDocuments(),
      Article.countDocuments({ category: 'os' }),
      BlogPost.countDocuments(),
      User.countDocuments(),
      Question.countDocuments(),
      Language.countDocuments(),
      Cheatsheet.countDocuments(),
      Newsletter.countDocuments(),
      Topic.countDocuments(),
      Subtopic.countDocuments()
    ]);

    console.log('[ADMIN] Stats fetched');
    res.json({
      data: { problems, lessons, dbmsLessons, dbmsSubtopics, dbmsProblems, dbmsMeta, os, blog, users, questions, languages, cheatsheets, newsletter, topics, subtopics }
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching stats:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/public-stats
 * Public: Get aggregated stats for the homepage
 */
export async function getPublicStats(req, res) {
  try {
    console.log('[PUBLIC] Fetching homepage stats...');
    const [problems, dbms, os, users, questions] = await Promise.all([
      Problem.countDocuments(),
      DbmsProblem.countDocuments(),
      Article.countDocuments({ category: 'os' }),
      User.countDocuments(),
      Question.countDocuments()
    ]);

    console.log('[PUBLIC] Stats fetched');
    res.json({
      data: {
        problems,
        articles: dbms + os,
        users,
        questions
      }
    });
  } catch (error) {
    console.error('[PUBLIC] Error fetching stats:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/admin/users
 * Admin: Get all users with pagination
 */
export async function getAllUsers(req, res) {
  try {
    console.log('[ADMIN] Fetching all users...');
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments();
    console.log('[ADMIN] Users fetched:', total);
    res.json({ data: users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[ADMIN] Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/admin/seed
 * Admin: Seed all collections from mock data files
 * Uses the shared runSeed() from seeds/seed.js (DB must already be connected)
 */
export async function seedDatabase(req, res) {
  try {
    /* Dynamic import — only loads seed.js + mock data when this endpoint is hit */
    const { runSeed } = await import('../seeds/seed.js');
    console.log('[ADMIN] Starting database seed...');
    const summary = await runSeed();
    console.log('[ADMIN] Database seeded successfully');
    res.json({ success: true, message: 'Database seeded with mock data', data: summary });
  } catch (error) {
    console.error('[ADMIN] Error seeding database:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/admin/users/:id
 * Admin: Delete a user by ID
 */
export async function deleteUser(req, res) {
  try {
    console.log('[ADMIN] Deleting user:', req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log('[ADMIN] User deleted:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[ADMIN] Error deleting user:', error.message);
    res.status(500).json({ error: error.message });
  }
}