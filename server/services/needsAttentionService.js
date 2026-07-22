/*
 * Needs Attention Service — Phase 13
 * Computes whether each student in a cohort needs attention based on:
 *   1. Inactivity (no activity in 9+ days)
 *   2. Bottom 15% of cohort by overall completion
 *   3. Quiz average below 50%
 *
 * Also syncs needs_attention notifications for students (auto-create/resolve).
 */
import Notification from '../models/Notification.js';

/* Number of days without activity before flagging */
const INACTIVITY_DAYS = 9;

/*
 * computeNeedsAttention(students, lastActivityMap)
 * students: array with a .progress field per student (from getProgressSummariesForUsers)
 * lastActivityMap: Map<userId, Date> from getLastActivityForUsers
 *
 * Mutates each student object in-place adding:
 *   needsAttention: boolean
 *   attentionReasons: string[]
 *
 * Also returns the same array for chaining.
 */
export function computeNeedsAttention(students, lastActivityMap) {
  console.log('[ATTENTION] Computing needs-attention for', students.length, 'students');

  if (students.length === 0) return students;

  const now = new Date();

  /* ── Compute overall completion % for each student ── */
  const completionData = students.map(s => {
    const p = s.progress || {};
    let total = 0, completed = 0;
    for (const sub of ['dsa', 'dbms', 'os', 'programming']) {
      const subData = p[sub];
      if (subData && subData.overall) {
        total += subData.overall.total;
        completed += subData.overall.completed;
      }
    }
    const pct = total > 0 ? completed / total : 0;
    return { userId: s._id.toString(), pct, completed, total };
  });

  /* ── Compute bottom 15% threshold ── */
  const sortedPcts = completionData.map(d => d.pct).sort((a, b) => a - b);
  const bottomThreshold = sortedPcts.length > 0
    ? sortedPcts[Math.max(0, Math.ceil(sortedPcts.length * 0.15) - 1)]
    : 0;
  const actuallyBottom = new Set(
    completionData.filter(d => d.total > 0 && d.pct <= bottomThreshold).map(d => d.userId)
  );
  /* Students with zero total items are not flagged as bottom 15% — they simply haven't started */

  /* ── Check each student ── */
  for (const student of students) {
    const reasons = [];
    const p = student.progress || {};
    const userId = student._id.toString();

    /* Check 1: Inactivity */
    const lastActive = lastActivityMap.get(userId);
    if (!lastActive) {
      reasons.push('Never started');
    } else {
      const daysSince = Math.floor((now - new Date(lastActive)) / (1000 * 60 * 60 * 24));
      if (daysSince >= INACTIVITY_DAYS) {
        reasons.push(`Inactive ${daysSince} days`);
      }
    }

    /* Check 2: Bottom 15% of cohort */
    if (actuallyBottom.has(userId)) {
      reasons.push('Bottom 15% of batch/centre');
    }

    /* Check 3: Quiz average below 50% */
    let totalQuizScore = 0, totalQuizTaken = 0;
    for (const sub of ['dsa', 'dbms', 'os', 'programming']) {
      const q = p[sub]?.quizzes;
      if (q && q.quizzesTaken > 0) {
        totalQuizScore += (q.avgScore || 0) * q.quizzesTaken;
        totalQuizTaken += q.quizzesTaken;
      }
    }
    const overallQuizAvg = totalQuizTaken > 0 ? Math.round(totalQuizScore / totalQuizTaken) : null;
    if (overallQuizAvg !== null && overallQuizAvg < 50) {
      reasons.push(`Quiz avg ${overallQuizAvg}%`);
    }

    student.needsAttention = reasons.length > 0;
    student.attentionReasons = reasons;
  }

  const flaggedCount = students.filter(s => s.needsAttention).length;
  console.log('[ATTENTION] Flagged', flaggedCount, 'students');
  return students;
}

/*
 * syncNeedsAttentionNotifications(students)
 * After computeNeedsAttention has run:
 *   - For each student with needsAttention === true, create an unread
 *     needs_attention notification if one doesn't already exist.
 *   - For each student with needsAttention === false, mark any existing
 *     unread needs_attention notification as read.
 *
 * This follows the same pattern as checkAndNotifyProfileIncomplete
 * in userController.js — auto-create on flag, auto-resolve on clear.
 */
export async function syncNeedsAttentionNotifications(students) {
  console.log('[ATTENTION] Syncing notifications for', students.length, 'students');

  for (const student of students) {
    try {
      if (student.needsAttention) {
        /* Create notification if no unread one exists */
        const existing = await Notification.findOne({
          user: student._id,
          type: 'needs_attention',
          read: false
        });
        if (!existing) {
          await Notification.create({
            user: student._id,
            type: 'needs_attention',
            read: false,
            attentionReasons: student.attentionReasons
          });
          console.log('[ATTENTION] Created notification for user:', student._id, 'reasons:', student.attentionReasons);
        }
      } else {
        /* Mark any existing unread needs_attention notifications as resolved */
        const result = await Notification.updateMany(
          { user: student._id, type: 'needs_attention', read: false },
          { read: true }
        );
        if (result.modifiedCount > 0) {
          console.log('[ATTENTION] Resolved notification for user:', student._id);
        }
      }
    } catch (error) {
      console.error('[ATTENTION] Error syncing notification for user:', student._id, error.message);
    }
  }
}
