/*
 * clearOrphanedBatch.js
 *
 * One-time cleanup script: finds all users who have `batch` or `courseOffering`
 * set but no `coachingCenter` (i.e., they were removed from a center but their
 * batch/courseOffering fields weren't cleared due to the old bug).
 *
 * Run: node scripts/clearOrphanedBatch.js
 */
import mongoose from 'mongoose';
import User from '../models/User.js';

async function main() {
  /* Connect to MongoDB */
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
  await mongoose.connect(uri);
  console.log('[CLEANUP] Connected to MongoDB');

  /* Find users with batch or courseOffering but no coachingCenter */
  const orphaned = await User.find({
    coachingCenter: null,
    $or: [
      { batch: { $ne: null } },
      { courseOffering: { $ne: null } }
    ]
  }).select('username displayName batch courseOffering coachingCenter');

  console.log('[CLEANUP] Found', orphaned.length, 'orphaned user(s):');
  orphaned.forEach(u => {
    console.log('  -', u.username || u.displayName || u._id, '| batch:', u.batch, '| courseOffering:', u.courseOffering);
  });

  /* Clear batch and courseOffering for all matched users */
  const result = await User.updateMany(
    {
      coachingCenter: null,
      $or: [
        { batch: { $ne: null } },
        { courseOffering: { $ne: null } }
      ]
    },
    {
      $set: { batch: null, courseOffering: null }
    }
  );

  console.log('[CLEANUP] Cleared batch/courseOffering for', result.modifiedCount, 'user(s)');
  console.log('[CLEANUP] Done.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('[CLEANUP] Error:', err.message);
  process.exit(1);
});
