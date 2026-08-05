import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import DbmsMeta from '../models/DbmsMeta.js';
import Quiz from '../models/Quiz.js';

/* Lesson slug to verify — pass as first arg, e.g. `node dbms-content/verify_seed.mjs introduction-to-dbms` */
const lessonSlug = process.argv[2] || 'introduction-to-dbms';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[VERIFY] Connected to MongoDB\n');

  const lesson = await DbmsLesson.findOne({ slug: lessonSlug }).lean();
  console.log('Lesson:', lesson?.title, '| problemCount:', lesson?.problemCount, '| order:', lesson?.order, '| category:', lesson?.category);

  const subs = await DbmsSubtopic.find({ lessonSlug: lessonSlug }).sort({ order: 1 }).lean();
  console.log('Subtopics (' + subs.length + '):');
  subs.forEach(s => console.log('  -', s.title, '(order', s.order + ')'));

  const probs = await DbmsProblem.find({ lessonSlug: lessonSlug }).lean();
  console.log('Problems (' + probs.length + '):');
  for (const p of probs) {
    const q = await Quiz.findOne({ problemId: p._id, problemModel: 'DbmsProblem' }).lean();
    console.log('  -', p.title, '[' + p.difficulty + ']', '| Quiz:', q ? q.questions.length + ' questions' : 'MISSING!');
  }

  const meta = await DbmsMeta.find({}).lean();
  console.log('\nMeta (' + meta.length + '):');
  console.log('  Categories:', meta.filter(m => m.type === 'category').length, '| Topics:', meta.filter(m => m.type === 'topic').length, '| Companies:', meta.filter(m => m.type === 'company').length);

  console.log('\nAll OK!');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });