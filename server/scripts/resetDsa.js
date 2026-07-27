/*
 * Pre-launch reset script for /dsa content.
 * DANGER: Destructive — deletes all DSA lessons, subtopics, problems,
 * quizzes, quiz attempts, ALL user progress, and ALL plans.
 *
 * Usage: cd server && node scripts/resetDsa.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetDsa() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[RESET] Connected to MongoDB');

  const db = mongoose.connection.db;
  const collections = {};

  /* Load all relevant collections */
  for (const name of ['dsalessons', 'subtopics', 'problems', 'quizzes', 'quizattempts', 'progresses', 'plans', 'batchplans']) {
    collections[name] = db.collection(name);
  }

  /* ---- STEP 1: Delete all DSA lessons ---- */
  const lessonsDeleted = (await collections.dsalessons.deleteMany({})).deletedCount;
  console.log(`[RESET] Deleted ${lessonsDeleted} DSA lessons`);

  /* ---- STEP 2: Delete all subtopics (DSA-only model) ---- */
  const subtopicsDeleted = (await collections.subtopics.deleteMany({})).deletedCount;
  console.log(`[RESET] Deleted ${subtopicsDeleted} subtopics`);

  /* ---- STEP 3: Delete all problems (DSA-only model) ---- */
  const problemsDeleted = (await collections.problems.deleteMany({})).deletedCount;
  console.log(`[RESET] Deleted ${problemsDeleted} DSA problems`);

  /* ---- STEP 4: Delete all DSA quizzes (problemModel === 'Problem') ---- */
  const dsaQuizzes = await collections.quizzes.find({ problemModel: 'Problem' }).project({ _id: 1 }).toArray();
  const dsaQuizIds = dsaQuizzes.map(q => q._id);
  console.log(`[RESET] Found ${dsaQuizIds.length} DSA quizzes`);

  if (dsaQuizIds.length > 0) {
    /* Delete quiz attempts for those quizzes first */
    const attemptsDeleted = (await collections.quizattempts.deleteMany({ quiz: { $in: dsaQuizIds } })).deletedCount;
    console.log(`[RESET] Deleted ${attemptsDeleted} DSA quiz attempts`);

    /* Then delete the quizzes */
    const quizzesDeleted = (await collections.quizzes.deleteMany({ _id: { $in: dsaQuizIds } })).deletedCount;
    console.log(`[RESET] Deleted ${quizzesDeleted} DSA quizzes`);
  }

  /* ---- STEP 5: Delete ALL user progress (complete reset) ---- */
  const progressDeleted = (await collections.progresses.deleteMany({})).deletedCount;
  console.log(`[RESET] Deleted ${progressDeleted} total progress records`);

  /* ---- STEP 6: Delete ALL plans and batch plans ---- */
  const plansDeleted = (await collections.plans.deleteMany({})).deletedCount;
  console.log(`[RESET] Deleted ${plansDeleted} plans`);

  const batchPlansDeleted = (await collections.batchplans.deleteMany({})).deletedCount;
  console.log(`[RESET] Deleted ${batchPlansDeleted} batch plans`);

  console.log('[RESET] DSA reset complete. All progress and plans cleared.');
  await mongoose.disconnect();
}

resetDsa().catch(err => {
  console.error('[RESET] Fatal error:', err);
  process.exit(1);
});
