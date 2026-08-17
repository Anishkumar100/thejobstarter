/*
 * Faculty-only middleware — modeled on coordinatorOnly.js
 *
 * Faculty status is MONGO-ONLY (never a Clerk role). This middleware:
 *   1. Looks up the User doc by Clerk sub (req.userId from requireAuth)
 *   2. Rejects unless User.isFaculty === true
 *   3. Allows an empty facultyBatches array (empty-scope faculty — every
 *      /api/faculty/* handler must return empty data, never crash)
 *   4. Resolves the single center from the assigned batches and rejects
 *      if the batches disagree on center (should never happen — enforced
 *      at assignment time)
 *   5. Blocks access when the resolved center is suspended (mirrors the
 *      suspended-center check in coordinatorOnly.js)
 *
 * On success, injects:
 *   req.facultyBatchIds  — array of batch ObjectIds (cast)
 *   req.facultyCenterId  — the single coaching center ObjectId
 *
 * Handlers must NEVER trust :batchId / :studentId params — they must check
 * membership against req.facultyBatchIds (per rule 4 of the codebase).
 */
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import CoachingCenter from '../models/CoachingCenter.js';
import mongoose from 'mongoose';

export async function requireFaculty(req, res, next) {
  try {
    console.log('[AUTH] Checking faculty status for user:', req.userId);

    /* Faculty status lives in Mongo — Clerk publicMetadata is never consulted */
    const user = await User.findOne({ clerkId: req.userId }).select('isFaculty facultyBatches').lean();
    if (!user || !user.isFaculty) {
      console.log('[AUTH] User is not a faculty member:', req.userId);
      return res.status(403).json({ error: 'Faculty access required' });
    }

    /* Cast batch ids to ObjectIds — string ids silently mismatch in queries */
    const facultyBatchIds = (user.facultyBatches || []).map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    }).filter(Boolean);

    /* Empty scope is allowed — dashboards/stats must return empty data */
    req.facultyBatchIds = facultyBatchIds;
    req.facultyCenterId = null;

    if (facultyBatchIds.length === 0) {
      console.log('[AUTH] Faculty verified with no assigned batches:', req.userId);
      return next();
    }

    /* Resolve the single center from the assigned batches */
    const batches = await Batch.find({ _id: { $in: facultyBatchIds } })
      .select('coachingCenter')
      .lean();

    const centers = [...new Set(batches.map(b => b.coachingCenter?.toString()).filter(Boolean))];
    if (centers.length > 1) {
      /* Batches from different centers — data integrity error, block */
      console.error('[AUTH] Faculty batches span multiple centers:', req.userId, centers);
      return res.status(403).json({ error: 'Faculty scope spans multiple centers' });
    }
    if (centers.length === 0) {
      /* All assigned batches were deleted — treat as empty scope */
      console.log('[AUTH] Faculty batches all missing (deleted?):', req.userId);
      return next();
    }

    req.facultyCenterId = new mongoose.Types.ObjectId(centers[0]);

    /* Suspended center check — mirror coordinatorOnly.js behavior */
    const center = await CoachingCenter.findById(req.facultyCenterId).select('status').lean();
    if (center && center.status === 'suspended') {
      console.log('[AUTH] Faculty center is suspended — blocking access:', req.userId);
      return res.status(403).json({ error: 'Your centre\'s services have been suspended. Please contact support.' });
    }

    console.log('[AUTH] Faculty verified for center:', req.facultyCenterId, '| batches:', facultyBatchIds.length);
    next();
  } catch (error) {
    console.error('[AUTH] Faculty check error:', error.message);
    res.status(403).json({ error: 'Faculty access required' });
  }
}

export default requireFaculty;