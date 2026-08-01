/*
 * reset_programming.mjs
 * Careful reset for /programming content.
 *
 * WARNING: This deletes ALL programming content:
 *   - ProgrammingMeta (categories/topics/companies)
 *   - ProgrammingLesson, ProgrammingSubtopic, ProgrammingProblem
 *   - Quiz docs where problemModel === 'ProgrammingProblem'
 *   - QuizAttempt docs referencing those quizzes
 *
 * It does NOT touch DSA / DBMS / OS content, user accounts, progress, or plans.
 * After clearing, it seeds the 7 categories from programming-content-map.md
 * into ProgrammingMeta so the admin UI and lesson dropdowns work.
 *
 * Usage (REQUIRED confirmation):
 *   cd server && node programming-content/reset_programming.mjs --yes
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import ProgrammingMeta from '../models/ProgrammingMeta.js';
import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

/* ─── Safety guard: require explicit confirmation ─── */
if (!process.argv.includes('--yes')) {
  console.error('✋ Aborting: you must pass --yes to run this destructive reset.');
  console.error('   e.g. node programming-content/reset_programming.mjs --yes');
  process.exit(1);
}

/* ─── The 7 categories from programming-content-map.md ─── */
const MAP_CATEGORIES = [
  { type: 'category', value: 'programming-foundations', label: 'Programming Foundations', order: 1 },
  { type: 'category', value: 'oops', label: 'OOPs', order: 2 },
  { type: 'category', value: 'data-handling-collections', label: 'Data Handling & Collections', order: 3 },
  { type: 'category', value: 'error-handling-file-io', label: 'Error Handling & File I/O', order: 4 },
  { type: 'category', value: 'advanced-language-concepts', label: 'Advanced Language Concepts', order: 5 },
  { type: 'category', value: 'memory-performance-concurrency', label: 'Memory, Performance & Concurrency', order: 6 },
  { type: 'category', value: 'software-design-best-practices', label: 'Software Design & Best Practices', order: 7 }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[RESET-PROG] Connected to MongoDB');

  /* ── STEP 1: ProgrammingMeta (categories) ── */
  const metaDeleted = await ProgrammingMeta.deleteMany({});
  console.log(`[RESET-PROG] Deleted ${metaDeleted.deletedCount} ProgrammingMeta entries`);

  /* ── STEP 2: Lessons / Subtopics / Problems ── */
  const lessonsDeleted = await ProgrammingLesson.deleteMany({});
  console.log(`[RESET-PROG] Deleted ${lessonsDeleted.deletedCount} ProgrammingLesson docs`);

  const subsDeleted = await ProgrammingSubtopic.deleteMany({});
  console.log(`[RESET-PROG] Deleted ${subsDeleted.deletedCount} ProgrammingSubtopic docs`);

  const probsDeleted = await ProgrammingProblem.deleteMany({});
  console.log(`[RESET-PROG] Deleted ${probsDeleted.deletedCount} ProgrammingProblem docs`);

  /* ── STEP 3: Programming quizzes + their attempts (scoped by problemModel) ── */
  const progQuizzes = await Quiz.find({ problemModel: 'ProgrammingProblem' }).select('_id').lean();
  const quizIds = progQuizzes.map(q => q._id);
  console.log(`[RESET-PROG] Found ${quizIds.length} programming quizzes`);

  if (quizIds.length > 0) {
    const attemptsDeleted = await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
    console.log(`[RESET-PROG] Deleted ${attemptsDeleted.deletedCount} quiz attempts for programming quizzes`);

    const quizzesDeleted = await Quiz.deleteMany({ problemModel: 'ProgrammingProblem' });
    console.log(`[RESET-PROG] Deleted ${quizzesDeleted.deletedCount} programming quizzes`);
  }

  /* ── STEP 4: Seed the map categories into ProgrammingMeta ── */
  console.log('\n[RESET-PROG] Seeding ProgrammingMeta categories from programming-content-map.md...');
  for (const cat of MAP_CATEGORIES) {
    await ProgrammingMeta.findOneAndUpdate(
      { type: cat.type, value: cat.value },
      cat,
      { upsert: true, new: true }
    );
  }
  const seeded = await ProgrammingMeta.countDocuments();
  console.log(`[RESET-PROG] ProgrammingMeta now has ${seeded} entries`);

  console.log('\n[RESET-PROG] Reset complete. Programming content cleared; categories seeded.');
  console.log('[RESET-PROG] Next step: run the lesson seed, e.g.');
  console.log('   node programming-content/seed_variables-data-types-operators.mjs');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('[RESET-PROG] Fatal error:', err);
  process.exit(1);
});
