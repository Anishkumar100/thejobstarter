/*
 * Center Roster Service — Shared data access for Phase 5 (admin) and
 * Phase 8 (coordinator). No Express req/res in this file — pure async
 * functions that return data, called by controllers that layer auth on top.
 *
 * Phase 6 extended this to attach per-subject completion stats to each
 * student via the shared progressService.
 *
 * Phase 12 extended this to include batch info and add getBatchRoster().
 */
import User from '../models/User.js';
import CoachingCenter from '../models/CoachingCenter.js';
import Batch from '../models/Batch.js';
import { getProgressSummariesForUsers, getLastActivityForUsers } from './progressService.js';
import { computeNeedsAttention, syncNeedsAttentionNotifications } from './needsAttentionService.js';

/*
 * getCenterRoster(centerId)
 * Returns { center, students, totalStudents } for a given coaching center.
 * Each student includes a `progress` field with per-subject completion stats.
 * Throws if the center doesn't exist — caller is responsible for
 * authorization (checking the caller is admin or the center's coordinator).
 */
export async function getCenterRoster(centerId) {
  console.log('[ROSTER] Fetching roster for center:', centerId);

  const center = await CoachingCenter.findById(centerId).lean();
  if (!center) {
    console.log('[ROSTER] Center not found:', centerId);
    const err = new Error('Coaching center not found');
    err.statusCode = 404;
    throw err;
  }

  const students = await User.find({ coachingCenter: centerId })
    .select('displayName username avatar email college year coachingCenterJoinedAt joinDate batch courseOffering')
    .populate('batch', 'name')
    .populate('courseOffering', 'name')
    .sort({ coachingCenterJoinedAt: -1 })
    .lean();

  const totalStudents = students.length;

  /* Attach per-subject progress summaries for each student */
  const userIds = students.map(s => s._id);
  const summaries = await getProgressSummariesForUsers(userIds);
  const studentsWithProgress = students.map(s => ({
    ...s,
    progress: summaries.get(s._id.toString()) || null
  }));

  /* Attach last-activity timestamps and compute needs-attention flags */
  const lastActivityMap = await getLastActivityForUsers(userIds);
  computeNeedsAttention(studentsWithProgress, lastActivityMap);
  /* Fire-and-forget notification sync — don't block the response */
  syncNeedsAttentionNotifications(studentsWithProgress).catch(err =>
    console.error('[ROSTER] Notification sync error:', err.message)
  );

  console.log('[ROSTER] Center:', center.name, '| Students:', totalStudents);

  return {
    center,
    students: studentsWithProgress,
    totalStudents
  };
}

/*
 * getBatchRoster(batchId)
 * Returns { batch, students, totalStudents } for a given batch.
 * Each student includes a `progress` field — reuses getProgressSummariesForUsers.
 */
export async function getBatchRoster(batchId) {
  console.log('[ROSTER] Fetching roster for batch:', batchId);

  const batch = await Batch.findById(batchId).populate('coachingCenter', 'name code').lean();
  if (!batch) {
    console.log('[ROSTER] Batch not found:', batchId);
    const err = new Error('Batch not found');
    err.statusCode = 404;
    throw err;
  }

  const students = await User.find({ batch: batchId })
    .select('displayName username avatar email college year coachingCenterJoinedAt joinDate batch courseOffering')
    .populate('batch', 'name')
    .populate('courseOffering', 'name')
    .sort({ coachingCenterJoinedAt: -1 })
    .lean();

  const totalStudents = students.length;

  /* Attach per-subject progress summaries for each student */
  const userIds = students.map(s => s._id);
  const summaries = await getProgressSummariesForUsers(userIds);
  const studentsWithProgress = students.map(s => ({
    ...s,
    progress: summaries.get(s._id.toString()) || null
  }));

  /* Attach last-activity timestamps and compute needs-attention flags */
  const lastActivityMap = await getLastActivityForUsers(userIds);
  computeNeedsAttention(studentsWithProgress, lastActivityMap);
  /* Fire-and-forget notification sync */
  syncNeedsAttentionNotifications(studentsWithProgress).catch(err =>
    console.error('[ROSTER] Notification sync error:', err.message)
  );

  console.log('[ROSTER] Batch:', batch.name, '| Students:', totalStudents);

  return {
    batch,
    students: studentsWithProgress,
    totalStudents
  };
}
