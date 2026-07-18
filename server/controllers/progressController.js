/*
 * Progress Controller — Mark items complete, fetch summary
 */
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Subtopic from '../models/Subtopic.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import OsSubtopic from '../models/OsSubtopic.js';
import Problem from '../models/Problem.js';
import DbmsProblem from '../models/DbmsProblem.js';
import OsProblem from '../models/OsProblem.js';
import { getProgressSummary, cascadeProgressCompletion } from '../services/progressService.js';

/*
 * POST /api/progress
 * User: Mark a lesson/subtopic/problem as complete for the authenticated user.
 * Body: { subject, targetType, targetSlug }
 * Idempotent: duplicate submissions are silently accepted (upsert).
 */
export async function markComplete(req, res) {
  try {
    console.log('[PROGRESS] Marking complete:', req.body);
    const { subject, targetType, targetSlug } = req.body;

    if (!subject || !targetType || !targetSlug) {
      return res.status(400).json({ error: 'subject, targetType, and targetSlug are required' });
    }
    if (!['dsa', 'dbms', 'os'].includes(subject)) {
      return res.status(400).json({ error: 'Invalid subject. Must be dsa, dbms, or os' });
    }
    if (!['lesson', 'subtopic', 'problem'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType. Must be lesson, subtopic, or problem' });
    }
    /* Problems can only be completed via quiz submission, not manual markComplete */
    if (targetType === 'problem') {
      return res.status(403).json({ error: 'Problems can only be completed by submitting the attached quiz' });
    }

    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    /* Upsert — duplicate is a no-op */
    await Progress.findOneAndUpdate(
      { user: user._id, subject, targetType, targetSlug },
      { user: user._id, subject, targetType, targetSlug, completedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log('[PROGRESS] Marked complete:', subject, targetType, targetSlug);

    /* Cascade: when a subtopic is manually completed, check if the lesson is now done */
    if (targetType === 'subtopic') {
      const SUBTOPIC_MODELS = { dsa: Subtopic, dbms: DbmsSubtopic, os: OsSubtopic };
      const SubModel = SUBTOpic_MODELS[subject];
      if (SubModel) {
        const subDoc = await SubModel.findOne({ slug: targetSlug }).select('lessonSlug');
        if (subDoc?.lessonSlug) {
          cascadeProgressCompletion(user._id, subject, subDoc.lessonSlug, targetSlug).catch(err => {
            console.error('[CASCADE] Error during subtopic cascade:', err.message);
          });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[PROGRESS] Error marking complete:', error.message);
    if (error.code === 11000) {
      /* Duplicate key — already marked, that's fine */
      return res.json({ success: true });
    }
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/progress/summary
 * User: Get per-subject completed/total counts for the authenticated user.
 */
export async function getSummary(req, res) {
  try {
    console.log('[PROGRESS] Fetching summary for user:', req.userId);
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const summary = await getProgressSummary(user._id);
    res.json({ data: summary });
  } catch (error) {
    console.error('[PROGRESS] Error fetching summary:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/progress/daily
 * User: Returns count of items completed today by the authenticated user.
 */
export async function getDailyCount(req, res) {
  try {
    console.log('[PROGRESS] Fetching daily count for user:', req.userId);
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await Progress.countDocuments({
      user: user._id,
      completedAt: { $gte: startOfDay }
    });

    console.log('[PROGRESS] Daily count:', count);
    res.json({ data: { count } });
  } catch (error) {
    console.error('[PROGRESS] Error fetching daily count:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/progress/admin/:userId/daily
 * Admin: Get daily completed count for any user (by their MongoDB _id).
 */
export async function getAdminUserDailyCount(req, res) {
  try {
    const rawId = req.params.userId;
    console.log('[PROGRESS] Admin fetching daily count for user:', rawId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    /* Ensure ObjectId for countDocuments (though Mongoose usually auto-casts) */
    const userId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
    const count = await Progress.countDocuments({
      user: userId,
      completedAt: { $gte: startOfDay }
    });

    res.json({ data: { count } });
  } catch (error) {
    console.error('[PROGRESS] Error fetching admin daily count:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/progress/admin/:userId/summary
 * Admin: Get the progress summary for any user (by their MongoDB _id).
 */
export async function getAdminUserSummary(req, res) {
  try {
    const rawId = req.params.userId;
    console.log('[PROGRESS] Admin fetching summary for user:', rawId, 'type:', typeof rawId);
    /* Convert string userId to ObjectId so aggregate $match works */
    const userId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
    console.log('[PROGRESS] Using userId:', userId, 'type:', typeof userId);
    const summary = await getProgressSummary(userId);
    console.log('[PROGRESS] Admin summary result for user:', rawId, '->', JSON.stringify(summary));
    res.json({ data: summary });
  } catch (error) {
    console.error('[PROGRESS] Error fetching admin user summary:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/progress/check-completed
 * User: Check if a specific item is marked complete for the authenticated user.
 * Query: subject, targetType, targetSlug
 * Returns: { completed: true/false }
 */
export async function checkCompleted(req, res) {
  try {
    const { subject, targetType, targetSlug } = req.query;
    if (!subject || !targetType || !targetSlug) {
      return res.status(400).json({ error: 'subject, targetType, and targetSlug query params are required' });
    }
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await Progress.findOne({ user: user._id, subject, targetType, targetSlug });
    if (existing) return res.json({ completed: true });

    /* Auto-complete subtopics that have zero problems (pure theory subtopics) */
    if (targetType === 'subtopic') {
      const SubModel = { dsa: Subtopic, dbms: DbmsSubtopic, os: OsSubtopic }[subject];
      const ProbModel = { dsa: Problem, dbms: DbmsProblem, os: OsProblem }[subject];
      if (SubModel && ProbModel) {
        const sub = await SubModel.findOne({ slug: targetSlug }).select('lessonSlug');
        if (sub) {
          const problemCount = await ProbModel.countDocuments({ subtopicSlug: targetSlug, lessonSlug: sub.lessonSlug });
          if (problemCount === 0) {
            await Progress.findOneAndUpdate(
              { user: user._id, subject, targetType, targetSlug },
              { user: user._id, subject, targetType, targetSlug, completedAt: new Date() },
              { upsert: true }
            );
            /* Cascade to lesson if all subtopics are now done */
            cascadeProgressCompletion(user._id, subject, sub.lessonSlug, targetSlug).catch(() => {});
            return res.json({ completed: true });
          }
        }
      }
    }

    res.json({ completed: false });
  } catch (error) {
    console.error('[PROGRESS] Error checking completed:', error.message);
    res.status(500).json({ error: error.message });
  }
}
