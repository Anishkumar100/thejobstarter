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
import { getProgressSummary, deriveStatus } from '../services/progressService.js';


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
    const { page = 1, limit = 50, _id } = req.query;
    const query = {};
    if (_id) query._id = _id;
    const skip = (page - 1) * limit;
    const users = await User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments();
    console.log('[ADMIN] Users fetched:', total);
    res.json({ data: users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[ADMIN] Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/admin/users/export
 * Admin: Export all users with their progress data as CSV.
 */
export async function exportUsersCsv(req, res) {
  try {
    console.log('[ADMIN] CSV export all users requested');
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    const rows = [];

    /* ── Header ── */
    rows.push(['SECTION: ALL USERS EXPORT']);
    rows.push(['']);
    rows.push([
      'Username', 'Display Name', 'Email', 'College', 'Year',
      'Joined Platform', 'Linked Centre',
      'DSA Lessons', 'DSA Subtopics', 'DSA Problems', 'DSA Overall %', 'DSA Quiz Avg',
      'DBMS Lessons', 'DBMS Subtopics', 'DBMS Problems', 'DBMS Overall %', 'DBMS Quiz Avg',
      'OS Lessons', 'OS Subtopics', 'OS Problems', 'OS Overall %', 'OS Quiz Avg',
      'Overall Completed', 'Overall Total', 'Overall %',
      'Status'
    ]);

    for (const u of users) {
      const progress = await getProgressSummary(u._id).catch(() => null);
      const p = progress || {};
      const subjects = ['dsa', 'dbms', 'os'];
      let totalCompleted = 0, totalItems = 0;
      let quizTaken = 0, quizScoreSum = 0;

      const row = [
        u.username || '',
        u.displayName || '',
        u.email || '',
        u.college || '',
        u.year || '',
        u.joinDate ? new Date(u.joinDate).toISOString().split('T')[0] : '',
        u.coachingCenter ? u.coachingCenter.toString() : ''
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
      rows.push(row);
    }

    rows.push(['']);
    rows.push(['Generated on', new Date().toISOString()]);
    rows.push(['TheJobStarter — TheWebytes Admin Export']);

    /* Build CSV string */
    const csv = rows.map(r => r.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell === null || cell === undefined ? '' : String(cell);
    }).join(',')).join('\r\n');

    const filename = `all_users_progress_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log('[ADMIN] CSV export sent:', filename, '| users:', users.length);
  } catch (error) {
    console.error('[ADMIN] Error exporting users CSV:', error.message);
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
 * PUT /api/admin/users/:id
 * Admin: Update any user by ID (bypasses ownership check)
 */
export async function updateUser(req, res) {
  try {
    console.log('[ADMIN] Updating user:', req.params.id);
    const { displayName, username, email, bio, college, year, avatar, skills, links, coordinatorFor } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (displayName !== undefined) user.displayName = displayName;
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (year !== undefined) user.year = year;
    if (avatar !== undefined) user.avatar = avatar;
    if (skills !== undefined) user.skills = skills;
    if (coordinatorFor !== undefined) user.coordinatorFor = coordinatorFor || null;
    if (links !== undefined) {
      if (!Array.isArray(links)) {
        const linkArray = [];
        if (links.leetcode) linkArray.push({ platform: 'leetcode', url: links.leetcode, label: 'LeetCode' });
        if (links.github) linkArray.push({ platform: 'github', url: links.github, label: 'GitHub' });
        if (links.linkedin) linkArray.push({ platform: 'linkedin', url: links.linkedin, label: 'LinkedIn' });
        if (links.website) linkArray.push({ platform: 'website', url: links.website, label: 'Website' });
        user.externalLinks = linkArray;
      } else {
        user.externalLinks = links;
      }
    }

    await user.save();
    console.log('[ADMIN] User updated:', user._id);
    res.json({ data: user });
  } catch (error) {
    console.error('[ADMIN] Error updating user:', error.message);
    res.status(400).json({ error: error.message });
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
