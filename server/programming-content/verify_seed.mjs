import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import Quiz from '../models/Quiz.js';

/* Lesson slug to verify — pass as first arg, e.g. `node programming-content/verify_seed.mjs variables-data-types-operators` */
const lessonSlug = process.argv[2] || 'variables-data-types-operators';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[VERIFY] Connected to MongoDB\n');

  const lesson = await ProgrammingLesson.findOne({ slug: lessonSlug }).lean();
  console.log('Lesson:', lesson?.title, '| problemCount:', lesson?.problemCount, '| order:', lesson?.order, '| category:', lesson?.category);

  const subs = await ProgrammingSubtopic.find({ lessonSlug: lessonSlug }).sort({ order: 1 }).lean();
  console.log('Subtopics (' + subs.length + '):');
  subs.forEach(s => console.log('  -', s.title, '(order', s.order + ')'));

  const probs = await ProgrammingProblem.find({ lessonSlug: lessonSlug }).lean();
  console.log('Problems (' + probs.length + '):');
  for (const p of probs) {
    const q = await Quiz.findOne({ problemId: p._id, problemModel: 'ProgrammingProblem' }).lean();
    console.log('  -', p.title, '[' + p.difficulty + ']', '| Quiz:', q ? q.questions.length + ' questions' : 'MISSING!');
  }

  console.log('\nAll OK!');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
