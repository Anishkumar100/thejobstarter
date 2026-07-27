import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const lesson = await DsaLesson.findOne({ slug: 'arrays' }).lean();
  console.log('Lesson:', lesson?.title, '| problemCount:', lesson?.problemCount, '| order:', lesson?.order, '| category:', lesson?.category);

  const subs = await Subtopic.find({ lessonSlug: 'arrays' }).sort({ order: 1 }).lean();
  console.log('Subtopics (' + subs.length + '):');
  subs.forEach(s => console.log('  -', s.title, '(order', s.order + ')'));

  const probs = await Problem.find({ lessonSlug: 'arrays' }).lean();
  console.log('Problems (' + probs.length + '):');
  for (const p of probs) {
    const q = await Quiz.findOne({ problemId: p._id, problemModel: 'Problem' }).lean();
    console.log('  -', p.title, '[' + p.difficulty + ']', '| Quiz:', q ? q.questions.length + ' questions' : 'MISSING!');
  }

  console.log('\nAll OK!');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
