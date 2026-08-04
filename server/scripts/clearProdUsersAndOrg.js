/*
 * clearProdUsersAndOrg.js
 *
 * One-time production cleanup script.
 * Removes ALL:
 *   - users, coaching centers, plans, assignments
 *   - and every document that references them (verified orphan-safety map):
 *     batches, course offerings, batch plans, assignment submissions,
 *     progress, quiz attempts, notifications, messages, bookmarks,
 *     payment transactions, and Q&A questions + answers.
 *
 * Learning content & config are NEVER touched:
 *   dsalessons, dbmslessons, oslessons, programminglessons,
 *   subtopics, dbmssubtopics, ossubtopics, programmingsubtopics,
 *   problems, dbmsproblems, osproblems, programmingproblems,
 *   articles, blogposts, quizzes, dsametas, dbmsmetas/osmetas
 *   (+ legacy dbmsmeta/osmeta), languages, cheatsheets, testimonials,
 *   topics, newsletters, siteconfigs, progressmessages, promocodes.
 *
 * DANGER: Destructive and irreversible. It wipes WHATEVER database
 * MONGODB_URI points to — make sure that env var targets the correct
 * environment (production) before running.
 *
 * Usage: cd server && node --import dotenv/config scripts/clearProdUsersAndOrg.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/* ---- The 16 collections to wipe (children first, then parents) ---- */
const COLLECTIONS_TO_CLEAR = [
  /* Assignment submissions reference assignments + students */
  'assignmentsubmissions',
  /* Batch plans reference batches + plans */
  'batchplans',
  /* Course offerings + batches reference coaching centers */
  'courseofferings',
  'batches',
  /* Orphaned user-scoped data */
  'progresses',
  'quizattempts',
  'notifications',
  'messages',
  'bookmarks',
  'paymenttransactions',
  'answers',
  'questions',
  /* The four explicitly requested collections */
  'plans',
  'assignments',
  'coachingcenters',
  'users'
];

async function clearProdUsersAndOrg() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
  console.log('[CLEANUP] Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log('[CLEANUP] Connected to database:', db.databaseName);

  /* ---- STEP 1: Report what is about to be deleted (read-only counts) ---- */
  console.log('\n[CLEANUP] Collections to be cleared:');
  let totalBefore = 0;
  for (const name of COLLECTIONS_TO_CLEAR) {
    const count = await db.collection(name).countDocuments({});
    totalBefore += count;
    console.log(`  - ${name}: ${count} doc(s)`);
  }
  console.log(`[CLEANUP] Total documents to delete: ${totalBefore}`);

  /* ---- STEP 2: Delete each collection ---- */
  console.log('\n[CLEANUP] Deleting...');
  let totalDeleted = 0;
  for (const name of COLLECTIONS_TO_CLEAR) {
    const result = await db.collection(name).deleteMany({});
    totalDeleted += result.deletedCount;
    console.log(`[CLEANUP] Deleted ${result.deletedCount} from ${name}`);
  }

  /* ---- STEP 3: Final summary ---- */
  console.log('\n[CLEANUP] === SUMMARY ===');
  console.log(`[CLEANUP] Docs before: ${totalBefore}`);
  console.log(`[CLEANUP] Docs deleted: ${totalDeleted}`);
  console.log('[CLEANUP] Learning content & config collections were untouched.');
  console.log('[CLEANUP] Done.');

  await mongoose.disconnect();
  process.exit(0);
}

clearProdUsersAndOrg().catch(err => {
  console.error('[CLEANUP] Fatal error:', err.message);
  process.exit(1);
});
