import Problem from '../models/Problem.js';
import DsaLesson from '../models/DsaLesson.js';
import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import AptitudeLesson from '../models/AptitudeLesson.js';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';
import AptitudeProblem from '../models/AptitudeProblem.js';
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
import Plan from '../models/Plan.js';
import BatchPlan from '../models/BatchPlan.js';
import Batch from '../models/Batch.js';
import Progress from '../models/Progress.js';
import CoachingCenter from '../models/CoachingCenter.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import PromoCode from '../models/PromoCode.js';
import { getProgressSummary, deriveStatus } from '../services/progressService.js';
import { getSubscriptionSettings } from './siteConfigController.js';


/*
 * GET /api/admin/stats
 * Admin: Get dashboard statistics across all collections
 */
export async function getStats(req, res) {
  try {
    console.log('[ADMIN] Fetching dashboard stats...');
    const [
      problems, lessons, dbmsLessons, dbmsSubtopics, dbmsProblems, dbmsMeta, os, blog, users, questions, languages, cheatsheets, newsletter, topics, subtopics, programmingLessons, programmingSubtopics, programmingProblems, aptitudeLessons, aptitudeSubtopics, aptitudeProblems
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
      Subtopic.countDocuments(),
      ProgrammingLesson.countDocuments(),
      ProgrammingSubtopic.countDocuments(),
      ProgrammingProblem.countDocuments(),
      AptitudeLesson.countDocuments(),
      AptitudeSubtopic.countDocuments(),
      AptitudeProblem.countDocuments()
    ]);

    console.log('[ADMIN] Stats fetched');
    res.json({
      data: { problems, lessons, dbmsLessons, dbmsSubtopics, dbmsProblems, dbmsMeta, os, blog, users, questions, languages, cheatsheets, newsletter, topics, subtopics, programmingLessons, programmingSubtopics, programmingProblems, aptitudeLessons, aptitudeSubtopics, aptitudeProblems }
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
    const { page = 1, limit = 50, _id, coachingCenter, role } = req.query;
    const query = {};
    if (_id) query._id = _id;
    if (coachingCenter === 'none') {
      query.coachingCenter = null;
    } else if (coachingCenter) {
      query.coachingCenter = coachingCenter;
    }
    if (role === 'coordinator') {
      query.coordinatorFor = { $ne: null };
    } else if (role === 'student') {
      query.coordinatorFor = null;
    }
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .populate('coachingCenter', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
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
      'PROG Lessons', 'PROG Subtopics', 'PROG Problems', 'PROG Overall %', 'PROG Quiz Avg',
      'APT Lessons', 'APT Subtopics', 'APT Problems', 'APT Overall %', 'APT Quiz Avg',
      'Overall Completed', 'Overall Total', 'Overall %',
      'Status'
    ]);

    for (const u of users) {
      const progress = await getProgressSummary(u._id).catch(() => null);
      const p = progress || {};
      const subjects = ['dsa', 'dbms', 'os', 'programming', 'aptitude'];
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

/*
 * GET /api/admin/batch-plan-stats
 * Returns summary stats about batches and plans across all centers.
 * Used by AdminDashboard to show the Batches & Plans section.
 */
export async function getBatchPlanStats(req, res) {
  try {
    console.log('[ADMIN] Fetching batch/plan stats...');

    const [
      activePlans, activeBatchPlans, allBatches, totalStudents,
      totalCenters, totalPlansAll, totalBatches
    ] = await Promise.all([
      Plan.countDocuments({ status: 'published' }),
      BatchPlan.countDocuments({ status: 'active' }),
      Batch.find({ status: 'active' }).populate('coachingCenter', 'name').sort({ createdAt: -1 }).limit(20).lean(),
      User.countDocuments({}),
      CoachingCenter.countDocuments({}),
      Plan.countDocuments({}),
      Batch.countDocuments({})
    ]);

    /* Count students that belong to centers (have a batch assigned) */
    const centerStudents = await User.countDocuments({ batch: { $ne: null } });

    /* Compute behind status for each batch — count batches with at least one behind student */
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let behindCount = 0;
    const behindBatchIds = new Set();
    const batchPlans = await BatchPlan.find({ status: 'active' }).populate('plan', 'name durationDays items').lean();
    const planMap = {};
    for (const bp of batchPlans) {
      if (!bp.plan || !bp.plan.items) continue;
      const batchId = bp.batch.toString();
      const startDate = new Date(bp.startDate);
      startDate.setHours(0, 0, 0, 0);
      const currentDay = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const pct = bp.plan.durationDays > 0 ? Math.round((currentDay / bp.plan.durationDays) * 100) : 0;
      planMap[batchId] = {
        planName: bp.plan.name,
        currentDay,
        totalDays: bp.plan.durationDays,
        pct,
        startDate: bp.startDate
      };

      /* Get expected items up to current day */
      const expectedItems = bp.plan.items.filter(item => item.dayOffset <= currentDay);
      if (expectedItems.length === 0) continue;

      /* Get all enrolled students for this batch */
      const students = await User.find({ batch: batchId }).select('_id').lean();
      if (students.length === 0) continue;

      /* Fetch all progress docs for these students matching expected items */
      const studentIds = students.map(s => s._id);
      const allProgress = await Progress.find({
        user: { $in: studentIds },
        $or: expectedItems.map(item => ({
          subject: item.subject,
          targetType: item.targetType,
          targetSlug: item.targetSlug
        }))
      }).select('user').lean();

      /* Count completions per student */
      const completionCounts = {};
      for (const p of allProgress) {
        const uid = p.user.toString();
        completionCounts[uid] = (completionCounts[uid] || 0) + 1;
      }

      /* Batch is behind if any student has < 60% completion (paceStatus === 'behind') */
      for (const student of students) {
        const completed = completionCounts[student._id.toString()] || 0;
        const ratio = completed / expectedItems.length;
        if (ratio < 0.6) {
          behindCount++;
          behindBatchIds.add(batchId);
          break;
        }
      }
    }

    const recentBatches = allBatches.map(b => ({
      _id: b._id,
      name: b.name,
      code: b.code,
      centerName: b.coachingCenter?.name || 'Unknown',
      plan: planMap[b._id.toString()] || null,
      studentCount: 0,
      behind: behindBatchIds.has(b._id.toString())
    }));

    console.log('[ADMIN] Batch/plan stats:', { activePlans, activeBatchPlans, behindCount, totalCenters, totalPlansAll, totalBatches });
    res.json({ data: { activePlans, activeBatchPlans, behindCount, recentBatches, totalStudents, totalCenters, totalPlansAll, totalBatches, centerStudents } });
  } catch (error) {
    console.error('[ADMIN] Error fetching batch/plan stats:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PAYMENT ADMIN ===================== */

/*
 * GET /api/admin/payments/stats
 * Admin: Aggregate payment and subscription statistics.
 * Returns counts of active/canceled/expired users, total revenue, and
 * revenue for the current month.
 */
export async function getPaymentStats(req, res) {
  try {
    console.log('[ADMIN] Fetching payment stats...');

    const [
      activeSubscriptions,
      canceledSubscriptions,
      totalTransactions,
      successfulTransactions,
      totalRevenue,
      monthlyTransactions
    ] = await Promise.all([
      /* Count users with active subscription */
      User.countDocuments({ 'subscription.status': 'active' }),
      /* Count users with canceled subscription */
      User.countDocuments({ 'subscription.status': 'canceled' }),
      /* Count all payment transactions */
      PaymentTransaction.countDocuments(),
      /* Count successful transactions */
      PaymentTransaction.countDocuments({ status: 'success' }),
      /* Sum all successful transaction amounts */
      PaymentTransaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      /* Count transactions this month */
      PaymentTransaction.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const subConfig = await getSubscriptionSettings();

    console.log('[ADMIN] Payment stats:', { activeSubscriptions, canceledSubscriptions, totalTransactions, revenue });
    res.json({
      data: {
        activeSubscriptions,
        canceledSubscriptions,
        totalTransactions,
        successfulTransactions,
        totalRevenue: revenue,
        monthlyTransactions,
        currentPrice: subConfig.price,
        durationDays: subConfig.durationDays
      }
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching payment stats:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/admin/payments/subscriptions
 * Admin: List all users with subscription data, sorted by most recent.
 * Supports pagination and status filtering.
 */
export async function getAllSubscriptions(req, res) {
  try {
    console.log('[ADMIN] Fetching all subscriptions...');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const { status } = req.query;

    /*
     * Base filters:
     *   - Exclude center-enrolled students (they get access via their centre, not via subscription)
     *   - Exclude coordinators (they manage centres, not subscribers)
     *   - Every user always has subscription.status (default: 'free');
     *     'free' means never subscribed, any other status means they have or had a subscription
     */
    const query = {
      coachingCenter: null,
      coordinatorFor: null
    };
    if (status) {
      query['subscription.status'] = status;
    } else {
      /* Default: show only users who actually subscribed (status != 'free') */
      query['subscription.status'] = { $ne: 'free' };
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('username displayName email avatar subscription')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments(query);
    const statusCounts = status ? {} : await Promise.all([
      User.countDocuments({ 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.status': 'canceled' }),
      User.countDocuments({ 'subscription.status': 'expired' }),
      User.countDocuments({ 'subscription.status': 'past_due' }),
      User.countDocuments({ 'subscription.status': 'free' })
    ]);

    console.log('[ADMIN] Subscriptions fetched:', total, '| status filter:', status || 'none');
    res.json({
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      breakdown: status ? undefined : {
        active: statusCounts[0],
        canceled: statusCounts[1],
        expired: statusCounts[2],
        pastDue: statusCounts[3],
        free: statusCounts[4]
      }
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching subscriptions:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/admin/payments/subscriptions/:userId/activate
 * Admin: Manually activate a user's subscription.
 * Used for coaching center students that get access via their center,
 * or for manual override by support.
 * Creates a PaymentTransaction audit record.
 */
export async function activateSubscription(req, res) {
  try {
    console.log('[ADMIN] Activating subscription for user:', req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { months } = req.body;
    const monthsNum = parseInt(months, 10);
    if (!monthsNum || monthsNum < 1) {
      return res.status(400).json({ error: 'months is required and must be at least 1' });
    }

    const now = new Date();
    const subConfig = await getSubscriptionSettings();
    const periodEnd = new Date(now.getTime() + subConfig.durationDays * monthsNum * 24 * 60 * 60 * 1000);

    user.subscription.status = 'active';
    user.subscription.currentPeriodStart = now;
    user.subscription.currentPeriodEnd = periodEnd;
    await user.save();

    await PaymentTransaction.create({
      user: user._id,
      type: 'admin_activated',
      amount: 0,
      currency: 'INR',
      status: 'success',
      metadata: { activatedBy: req.userId, reason: `Manual admin activation for ${monthsNum} month(s)`, months: monthsNum }
    });

    console.log('[ADMIN] Subscription activated for user:', user._id, '| months:', monthsNum, '| periodEnd:', periodEnd);
    res.json({ data: { message: 'Subscription activated', currentPeriodEnd: periodEnd, months: monthsNum } });
  } catch (error) {
    console.error('[ADMIN] Error activating subscription:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/admin/payments/subscriptions/:userId/deactivate
 * Admin: Manually deactivate a user's subscription.
 * Sets status to 'expired' immediately (not 'canceled' — 'canceled' means
 * user still has access until period end).
 * Creates a PaymentTransaction audit record.
 */
export async function deactivateSubscription(req, res) {
  try {
    console.log('[ADMIN] Deactivating subscription for user:', req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.subscription.status = 'expired';
    user.subscription.currentPeriodStart = null;
    user.subscription.currentPeriodEnd = null;
    await user.save();

    await PaymentTransaction.create({
      user: user._id,
      type: 'admin_deactivated',
      amount: 0,
      currency: 'INR',
      status: 'success',
      metadata: { deactivatedBy: req.userId, reason: 'Manual admin deactivation' }
    });

    console.log('[ADMIN] Subscription deactivated for user:', user._id);
    res.json({ data: { message: 'Subscription deactivated' } });
  } catch (error) {
    console.error('[ADMIN] Error deactivating subscription:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/admin/payments/subscriptions/:userId/cancel
 * Admin: Cancel a user's subscription.
 * Sets status to 'canceled' — user keeps access until currentPeriodEnd,
 * but no more charges/future renewals.
 * Creates a PaymentTransaction audit record.
 */
export async function cancelSubscription(req, res) {
  try {
    console.log('[ADMIN] Canceling subscription for user:', req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscription?.status !== 'active') {
      return res.status(400).json({ error: 'User does not have an active subscription' });
    }

    user.subscription.status = 'canceled';
    await user.save();

    await PaymentTransaction.create({
      user: user._id,
      type: 'subscription_canceled',
      amount: 0,
      currency: 'INR',
      status: 'success',
      metadata: { canceledBy: req.userId, reason: 'Manual admin cancellation', accessUntil: user.subscription.currentPeriodEnd }
    });

    console.log('[ADMIN] Subscription canceled for user:', user._id, '| access until:', user.subscription.currentPeriodEnd);
    res.json({ data: { message: 'Subscription canceled', accessUntil: user.subscription.currentPeriodEnd } });
  } catch (error) {
    console.error('[ADMIN] Error canceling subscription:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/admin/payments/transactions
 * Admin: List all payment transactions with user details.
 * Supports pagination and type/status filtering.
 */
export async function getTransactionHistory(req, res) {
  try {
    console.log('[ADMIN] Fetching transaction history...');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const transactions = await PaymentTransaction.find(query)
      .populate('user', 'username displayName email avatar')
      .populate('promoCode', 'code type')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await PaymentTransaction.countDocuments(query);

    console.log('[ADMIN] Transactions fetched:', total);
    res.json({ data: transactions, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[ADMIN] Error fetching transactions:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/* ===================== PROMO CODE CRUD ===================== */

/*
 * GET /api/admin/promos
 * Admin: List all promo codes with pagination.
 */
export async function getPromoCodes(req, res) {
  try {
    console.log('[ADMIN] Fetching promo codes...');
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const promos = await PromoCode.find({})
      .populate('createdBy', 'username displayName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();
    const total = await PromoCode.countDocuments({});
    console.log('[ADMIN] Promo codes fetched:', total);
    res.json({ data: promos, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[ADMIN] Error fetching promo codes:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/admin/promos
 * Admin: Create a new promo code.
 * The code is automatically uppercased before saving.
 */
export async function createPromoCode(req, res) {
  try {
    console.log('[ADMIN] Creating promo code...');
    const { code, type, value, maxUses, expiresAt, description } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ error: 'code, type, and value are required' });
    }

    if (!['free_month', 'discount_percent', 'discount_fixed'].includes(type)) {
      return res.status(400).json({ error: 'Invalid promo type. Must be free_month, discount_percent, or discount_fixed' });
    }

    /* Validate value is a positive number */
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) {
      return res.status(400).json({ error: 'Value must be a positive number' });
    }

    if (type === 'discount_percent' && (numericValue < 1 || numericValue > 100)) {
      return res.status(400).json({ error: 'Discount percent must be between 1 and 100' });
    }

    if (type === 'discount_fixed' && numericValue < 1) {
      return res.status(400).json({ error: 'Fixed discount must be at least ₹1' });
    }

    /* Check for duplicate code */
    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: 'A promo code with this code already exists' });
    }

    /* Look up the admin user's MongoDB _id (req.userId is Clerk session ID) */
    const adminUser = await User.findOne({ clerkId: req.userId }).select('_id').lean();
    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      type,
      value: numericValue,
      maxUses: maxUses || null,
      expiresAt: expiresAt || null,
      description: description || '',
      createdBy: adminUser?._id || null
    });

    console.log('[ADMIN] Promo code created:', promo.code, '| type:', type, '| value:', numericValue);
    res.status(201).json({ data: promo });
  } catch (error) {
    console.error('[ADMIN] Error creating promo code:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * PUT /api/admin/promos/:id
 * Admin: Update an existing promo code.
 * Fields that are not provided remain unchanged.
 */
export async function updatePromoCode(req, res) {
  try {
    console.log('[ADMIN] Updating promo code:', req.params.id);
    const { type, value, maxUses, expiresAt, active, description } = req.body;
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    if (type !== undefined) {
      if (!['free_month', 'discount_percent', 'discount_fixed'].includes(type)) {
        return res.status(400).json({ error: 'Invalid promo type' });
      }
      promo.type = type;
    }
    if (value !== undefined) {
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < 0) {
        return res.status(400).json({ error: 'Value must be a positive number' });
      }
      if (promo.type === 'discount_percent' && (numericValue < 1 || numericValue > 100)) {
        return res.status(400).json({ error: 'Discount percent must be between 1 and 100' });
      }
      promo.value = numericValue;
    }
    if (maxUses !== undefined) promo.maxUses = maxUses;
    if (expiresAt !== undefined) promo.expiresAt = expiresAt;
    if (active !== undefined) promo.active = active;
    if (description !== undefined) promo.description = description;

    /* Code should not be changed after creation — too risky for active promos */

    await promo.save();
    console.log('[ADMIN] Promo code updated:', promo.code);
    res.json({ data: promo });
  } catch (error) {
    console.error('[ADMIN] Error updating promo code:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * DELETE /api/admin/promos/:id
 * Admin: Delete a promo code permanently.
 */
export async function deletePromoCode(req, res) {
  try {
    console.log('[ADMIN] Deleting promo code:', req.params.id);
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ error: 'Promo code not found' });
    }
    console.log('[ADMIN] Promo code deleted:', promo.code);
    res.json({ success: true });
  } catch (error) {
    console.error('[ADMIN] Error deleting promo code:', error.message);
    res.status(500).json({ error: error.message });
  }
}
