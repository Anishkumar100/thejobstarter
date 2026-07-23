/*
 * Progress Service — Shared helper for computing per-user completion summaries.
 * Used by:
 *   - progressController (GET /api/progress/summary)
 *   - centerRosterService (per-student stats in admin/coordinator views)
 *
 * Totals are computed live via countDocuments() on the content models.
 * Do not cache or persist these totals — they must reflect admin additions immediately.
 */
import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import User from '../models/User.js';
import { getPlanProgress } from './planProgressService.js';
import OsLesson from '../models/OsLesson.js';
import OsSubtopic from '../models/OsSubtopic.js';
import OsProblem from '../models/OsProblem.js';
import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';

/* Map of subject → { Lesson, Subtopic, Problem } models for live totals */
const SUBJECT_MODELS = {
  dsa: { lesson: DsaLesson, subtopic: Subtopic, problem: Problem },
  dbms: { lesson: DbmsLesson, subtopic: DbmsSubtopic, problem: DbmsProblem },
  os: { lesson: OsLesson, subtopic: OsSubtopic, problem: OsProblem },
  programming: { lesson: ProgrammingLesson, subtopic: ProgrammingSubtopic, problem: ProgrammingProblem }
};

/*
 * getSubjectTotals(subject)
 * Returns { lessons: n, subtopics: n, problems: n } for one subject.
 * Always live — queries countDocuments on the content models every time.
 */
async function getSubjectTotals(subject) {
  const models = SUBJECT_MODELS[subject];
  if (!models) throw new Error(`Unknown subject: ${subject}`);
  const [lessons, subtopics, problems] = await Promise.all([
    models.lesson.countDocuments({}),
    models.subtopic.countDocuments({}),
    models.problem.countDocuments({})
  ]);
  console.log(`[PROGRESS] Subject totals for ${subject}: lessons=${lessons}, subtopics=${subtopics}, problems=${problems}`);
  return { lessons, subtopics, problems };
}

/*
 * getCompletedCounts(userId, subject)
 * Returns { lessons: n, subtopics: n, problems: n } completed for one user + subject.
 */
async function getCompletedCounts(userId, subject) {
  console.log(`[PROGRESS] getCompletedCounts called with userId:`, userId, 'type:', typeof userId, 'subject:', subject);
  /* Ensure userId is an ObjectId for aggregate $match to work correctly */
  const userObjectId = typeof userId === 'string' && userId.length === 24
    ? new mongoose.Types.ObjectId(userId)
    : userId;
  console.log(`[PROGRESS] Using userObjectId:`, userObjectId, 'type:', typeof userObjectId);
  const pipeline = [
    { $match: { user: userObjectId, subject } },
    { $group: { _id: '$targetType', count: { $sum: 1 } } }
  ];
  const results = await Progress.aggregate(pipeline);
  console.log(`[PROGRESS] Aggregate results for ${subject}:`, JSON.stringify(results));
  const counts = { lessons: 0, subtopics: 0, problems: 0 };
  for (const r of results) {
    if (r._id === 'lesson') counts.lessons = r.count;
    else if (r._id === 'subtopic') counts.subtopics = r.count;
    else if (r._id === 'problem') counts.problems = r.count;
  }
  return counts;
}

/*
 * Map problemModel → subject
 */
const MODEL_TO_SUBJECT = { Problem: 'dsa', DbmsProblem: 'dbms', OsProblem: 'os', ProgrammingProblem: 'programming' };

/*
 * getQuizStats(userId)
 * Returns per-subject quiz stats for a single user.
 * Shape: { dsa: { quizzesTaken, avgScore }, dbms: {...}, os: {...} }
 */
async function getQuizStats(userId) {
  console.log('[PROGRESS] Fetching quiz stats for user:', userId);

  const stats = { dsa: { quizzesTaken: 0, avgScore: 0 }, dbms: { quizzesTaken: 0, avgScore: 0 }, os: { quizzesTaken: 0, avgScore: 0 }, programming: { quizzesTaken: 0, avgScore: 0 } };

  /* Aggregate attempts joined with quiz to get problemModel/subject */
  const results = await QuizAttempt.aggregate([
    { $match: { user: userId } },
    { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quiz' } },
    { $unwind: { path: '$quiz', preserveNullAndEmptyArrays: false } },
    { $group: { _id: '$quiz.problemModel', count: { $sum: 1 }, avgScore: { $avg: '$score' } } }
  ]);

  for (const r of results) {
    const subject = MODEL_TO_SUBJECT[r._id];
    if (subject && stats[subject]) {
      stats[subject].quizzesTaken = r.count;
      stats[subject].avgScore = Math.round(r.avgScore);
    }
  }

  console.log('[PROGRESS] Quiz stats:', JSON.stringify(stats));
  return stats;
}

/*
 * getProgressSummary(userId)
 * Returns per-subject completed/total counts for a single user.
 * Shape:
 *   { dsa: { lessons: { completed, total }, subtopics: {...}, problems: {...}, overall: { completed, total }, quizzes: { taken, avgScore } },
 *     dbms: { ... }, os: { ... } }
 */
/*
 * cascadeProgressCompletion(userId, subject, lessonSlug, subtopicSlug)
 * After a problem is completed via quiz, cascade completion up the hierarchy:
 *   1. If all problems in this subtopic are done → mark subtopic complete
 *   2. If all subtopics in this lesson are done → mark lesson complete
 * Subtopics with zero problems auto-count toward lesson completion.
 * Exported for use by quizController and subtopic page controllers.
 */
/*
 * deriveStatus(statusData)
 * Small pure function that assigns a status string per student.
 * Based on completion percentage and quiz average.
 * Thresholds as named constants for easy tuning.
 */
const STATUS_THRESHOLDS = {
  EXPLORE_LESSONS: 30,
  QUIZ_WARNING: 50
};

export function deriveStatus({ completionPct, quizAvgPct }) {
  if (completionPct < STATUS_THRESHOLDS.EXPLORE_LESSONS) return 'Explore more lessons';
  if (quizAvgPct !== null && quizAvgPct < STATUS_THRESHOLDS.QUIZ_WARNING) return 'Solve more problems';
  return 'On track';
}

export async function cascadeProgressCompletion(userId, subject, lessonSlug, subtopicSlug) {
  const models = SUBJECT_MODELS[subject];
  if (!models || !lessonSlug) return;

  console.log(`[CASCADE] Checking cascade for user=${userId} subject=${subject} lesson=${lessonSlug} subtopic=${subtopicSlug}`);

  /* 1. Check subtopic-level completion if this problem belongs to a subtopic */
  if (subtopicSlug) {
    const allProblems = await models.problem.find({ subtopicSlug, lessonSlug }).select('slug');
    const allSlugs = allProblems.map(p => p.slug);
    if (allSlugs.length > 0) {
      const completedCount = await Progress.countDocuments({
        user: userId, subject, targetType: 'problem', targetSlug: { $in: allSlugs }
      });
      if (completedCount >= allSlugs.length) {
        console.log(`[CASCADE] All ${allSlugs.length} problems done in subtopic ${subtopicSlug} → marking subtopic complete`);
        await Progress.findOneAndUpdate(
          { user: userId, subject, targetType: 'subtopic', targetSlug: subtopicSlug },
          { user: userId, subject, targetType: 'subtopic', targetSlug: subtopicSlug, completedAt: new Date() },
          { upsert: true, new: true }
        );
      } else {
        /* Not all problems done yet — stop cascading */
        console.log(`[CASCADE] Only ${completedCount}/${allSlugs.length} problems done in subtopic ${subtopicSlug} — not cascading`);
        return;
      }
    }
  }

  /* 2. Check lesson-level completion */
  const allSubtopics = await models.subtopic.find({ lessonSlug }).select('slug');
  if (allSubtopics.length === 0) return;

  /* For each subtopic in this lesson, determine if it is "done" */
  const subtopicStatuses = await Promise.all(allSubtopics.map(async sub => {
    const problemCount = await models.problem.countDocuments({ subtopicSlug: sub.slug, lessonSlug });
    if (problemCount === 0) {
      /* Subtopic with zero problems — auto-counts as complete */
      return true;
    }
    const done = await Progress.countDocuments({
      user: userId, subject, targetType: 'subtopic', targetSlug: sub.slug
    });
    return done > 0;
  }));

  const allComplete = subtopicStatuses.every(Boolean);
  if (allComplete) {
    console.log(`[CASCADE] All ${allSubtopics.length} subtopics done in lesson ${lessonSlug} → marking lesson complete`);
    await Progress.findOneAndUpdate(
      { user: userId, subject, targetType: 'lesson', targetSlug: lessonSlug },
      { user: userId, subject, targetType: 'lesson', targetSlug: lessonSlug, completedAt: new Date() },
      { upsert: true, new: true }
    );
  } else {
    console.log(`[CASCADE] Not all subtopics complete in lesson ${lessonSlug} — not cascading to lesson`);
  }
}

export async function getProgressSummary(userId) {
  console.log('[PROGRESS] Computing summary for user:', userId, 'type:', typeof userId);
  const summary = {};

  const subjects = ['dsa', 'dbms', 'os', 'programming'];

  /* Look up user's batch for plan progress */
  const userLookup = await User.findById(userId).select('batch').lean();
  const batchId = userLookup?.batch || null;

  const [quizStats, planProgress] = await Promise.all([
    getQuizStats(userId),
    getPlanProgress(userId, batchId)
  ]);

  summary.planProgress = planProgress;

  for (const subject of subjects) {
    const [totals, completed] = await Promise.all([
      getSubjectTotals(subject),
      getCompletedCounts(userId, subject)
    ]);

    console.log(`[PROGRESS] Subject ${subject}: totals=`, JSON.stringify(totals), 'completed=', JSON.stringify(completed));

    const subjectTotal = totals.lessons + totals.subtopics + totals.problems;
    const subjectCompleted = completed.lessons + completed.subtopics + completed.problems;

    summary[subject] = {
      lessons: { completed: completed.lessons, total: totals.lessons },
      subtopics: { completed: completed.subtopics, total: totals.subtopics },
      problems: { completed: completed.problems, total: totals.problems },
      overall: { completed: subjectCompleted, total: subjectTotal },
      quizzes: quizStats[subject] || { quizzesTaken: 0, avgScore: 0 }
    };
  }

  console.log('[PROGRESS] Summary computed for user:', userId);
  return summary;
}

/*
 * getProgressSummariesForUsers(userIds)
 * Batch version: returns a Map of userId → summary for multiple users.
 * Used by centerRosterService to avoid N+1 queries.
 */
export async function getProgressSummariesForUsers(userIds) {
  console.log('[PROGRESS] Computing batch summaries for', userIds.length, 'users');
  if (userIds.length === 0) return new Map();

  const result = new Map();
  await Promise.all(userIds.map(async (userId) => {
    try {
      const summary = await getProgressSummary(userId);
      result.set(userId.toString(), summary);
    } catch (err) {
      console.error('[PROGRESS] Error computing summary for user:', userId, err.message);
      result.set(userId.toString(), null);
    }
  }));

  console.log('[PROGRESS] Batch summaries computed');
  return result;
}

/*
 * getLastActivityForUsers(userIds)
 * Batch query: returns a Map of userId → lastActivity Date.
 * Computes the max of each user's latest Progress.completedAt and latest QuizAttempt.attemptedAt.
 * Used by needsAttentionService to detect inactivity.
 */
export async function getLastActivityForUsers(userIds) {
  console.log('[PROGRESS] Fetching last activity for', userIds.length, 'users');
  if (userIds.length === 0) return new Map();

  const result = new Map();
  userIds.forEach(id => result.set(id.toString(), null));

  /* Get max completedAt from Progress per user */
  const progressActivity = await Progress.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: '$user', lastActivity: { $max: '$completedAt' } } }
  ]);

  for (const row of progressActivity) {
    result.set(row._id.toString(), row.lastActivity);
  }

  /* Get max attemptedAt from QuizAttempt per user */
  const quizActivity = await QuizAttempt.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: '$user', lastAttempt: { $max: '$attemptedAt' } } }
  ]);

  for (const row of quizActivity) {
    const key = row._id.toString();
    const existing = result.get(key);
    /* Take the later of the two dates */
    if (!existing || row.lastAttempt > existing) {
      result.set(key, row.lastAttempt);
    }
  }

  console.log('[PROGRESS] Last activity fetched for', result.size, 'users');
  return result;
}
