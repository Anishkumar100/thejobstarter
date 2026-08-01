import fs from 'fs';

/* ── Source file: pass as first arg (e.g. `node server/programming-content/generate_seed.mjs present.md`), default next.md ──
 * NOTE: run from the PROJECT ROOT (paths are server/programming-content/...).
 * The emitted seed_<lesson>.mjs is then run from server/ (node programming-content/seed_<lesson>.mjs). */
const sourceFile = process.argv[2] || 'next.md';

/* ── Parse source markdown JSON blocks ── */
const md = fs.readFileSync(`server/programming-content/${sourceFile}`, 'utf8');
const lines = md.split('\n');
const blocks = [];
let cur = null;
for (const ln of lines) {
  if (ln.trim() === '```json') { cur = []; continue; }
  if (cur !== null && ln.trim() === '```') { blocks.push(cur.join('\n')); cur = null; continue; }
  if (cur !== null) cur.push(ln);
}

/* ── Header counts: "## Subtopics (N)" and "## Problems (M)" ── */
const subMatch = md.match(/## Subtopics \((\d+)\)/);
const probMatch = md.match(/## Problems \((\d+)\)/);
const subCount = subMatch ? Number(subMatch[1]) : 0;
const probCount = probMatch ? Number(probMatch[1]) : 0;
const expected = 1 + subCount + probCount * 2; // lesson + subtopics + (problem, quiz) pairs
if (blocks.length !== expected) {
  console.error(`Expected ${expected} JSON blocks (1 lesson + ${subCount} subtopics + ${probCount} problem/quiz pairs), got ${blocks.length}`);
  process.exit(1);
}

/* ── Distribute blocks: lesson first, then subtopics, then interleaved problem/quiz ── */
const parsed = blocks.map(b => JSON.parse(b));
const lesson = parsed[0];
const subtopics = parsed.slice(1, 1 + subCount);
const pairs = parsed.slice(1 + subCount);
const problems = [];
const quizzes = [];
for (let i = 0; i < probCount; i++) {
  problems.push(pairs[i * 2]);
  quizzes.push(pairs[i * 2 + 1]);
}

/* ── JS emitter: JSON.stringify yields valid JS literals for strings AND arrays/objects ── */
const js = v => JSON.stringify(v);

/* ── Build object-literal sources for arrays ── */
const subEntries = subtopics.map(sub => `{
      slug: ${js(sub.slug)}, lessonSlug: ${js(sub.lessonSlug)}, order: ${sub.order},
      title: ${js(sub.title)},
      description: ${js(sub.description)},
      explanation: ${js(sub.explanation)},
      image: ${js(sub.image)}, youtubeUrl: ${js(sub.youtubeUrl)}, pdfUrl: ${js(sub.pdfUrl)}, pptxUrl: ${js(sub.pptxUrl)}
    }`);

const probEntries = problems.map(prob => `{
      slug: ${js(prob.slug)}, lessonSlug: ${js(prob.lessonSlug)}, subtopicSlug: ${js(prob.subtopicSlug)},
      title: ${js(prob.title)}, difficulty: ${js(prob.difficulty)},
      topics: ${js(prob.topics)},
      companies: ${js(prob.companies)},
      problemStatement: ${js(prob.problemStatement)},
      examples: ${js(prob.examples)},
      constraints: ${js(prob.constraints)},
      approach: ${js(prob.approach)},
      codeBlocks: ${js(prob.codeBlocks)},
      timeComplexity: ${js(prob.timeComplexity)}, spaceComplexity: ${js(prob.spaceComplexity)},
      youtubeUrl: ${js(prob.youtubeUrl)}, pdfUrl: ${js(prob.pdfUrl)}, pptxUrl: ${js(prob.pptxUrl)}, media: ${js(prob.media)}
    }`);

const quizEntries = problems.map((prob, i) => `{
      slug: ${js(prob.slug)},
      questions: ${js(quizzes[i].questions)}
    }`);

const out = [];
const push = s => out.push(s);

/* NOTE: the emitted seed code below uses string concatenation (no template literals) for
   runtime values, so there is no `${}` escaping hazard inside this generator template. */
push(`/*
 * Seed ${lesson.title} lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node programming-content/seed_${lesson.slug}.mjs
 * NOTE: Generated from programming-content/${sourceFile} — do not hand-edit; regenerate via generate_seed.mjs ${sourceFile} after updating ${sourceFile}.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import Quiz from '../models/Quiz.js';

/* ─── Helpers ─── */
async function upsert(Model, query, data, label) {
  const result = await Model.findOneAndUpdate(query, data, { upsert: true, new: true });
  console.log('[SEED] ' + label + ': ' + (result ? 'upserted' : 'failed') + ' (' + JSON.stringify(query) + ')');
  return result;
}

async function upsertQuiz(problemId, problemModel, questions) {
  const result = await Quiz.findOneAndUpdate(
    { problemId, problemModel },
    { problemId, problemModel, questions },
    { upsert: true, new: true }
  );
  console.log('[SEED] Quiz for ' + problemModel + ' ' + problemId + ': upserted (' + questions.length + ' questions)');
  return result;
}

/* ─── Connect ─── */
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected to MongoDB\\n');

  /* ─── 1. Lesson ─── */
  console.log('=== LESSON ===');
  const lesson = await upsert(ProgrammingLesson,
    { slug: ${js(lesson.slug)} },
    {
      title: ${js(lesson.title)},
      slug: ${js(lesson.slug)},
      category: ${js(lesson.category)},
      description: ${js(lesson.description)},
      image: ${js(lesson.image)},
      icon: ${js(lesson.icon)},
      order: ${lesson.order},
      difficulty: ${js(lesson.difficulty)},
      problemCount: ${lesson.problemCount}
    },
    'Lesson "${lesson.title}"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\\n=== SUBTOPICS ===');

  const subtopics = [
${subEntries.join(',\n')}
  ];

  for (const sub of subtopics) {
    await upsert(ProgrammingSubtopic, { slug: sub.slug }, sub, 'Subtopic "' + sub.title + '"');
  }

  /* ─── 3. Problems ─── */
  console.log('\\n=== PROBLEMS ===');

  const problems = [
${probEntries.join(',\n')}
  ];

  const createdProblems = [];
  for (const prob of problems) {
    const created = await upsert(ProgrammingProblem, { slug: prob.slug }, prob, 'Problem "' + prob.title + '"');
    createdProblems.push(created);
  }

  /* ─── 4. Quizzes ─── */
  console.log('\\n=== QUIZZES ===');

  const quizzes = [
${quizEntries.join(',\n')}
  ];

  for (const q of quizzes) {
    const problemDoc = createdProblems.find(p => p.slug === q.slug);
    if (problemDoc) {
      await upsertQuiz(problemDoc._id, 'ProgrammingProblem', q.questions);
    } else {
      console.error('[SEED] Problem "' + q.slug + '" not found in created problems — skipping quiz');
    }
  }

  /* ─── Done ─── */
  console.log('\\n[SEED] ${lesson.title} lesson seeded successfully!');
  console.log('  Lesson:    1 (${lesson.title})');
  console.log('  Subtopics: ' + subtopics.length + ' (' + subtopics.map(s => s.title).join(', ') + ')');
  console.log('  Problems:  ' + problems.length + ' (' + problems.map(p => p.title).join(', ') + ')');
  console.log('  Quizzes:   ' + quizzes.length);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
`);

fs.writeFileSync(`server/programming-content/seed_${lesson.slug}.mjs`, out.join('\n'), 'utf8');
console.log(`Generated seed_${lesson.slug}.mjs —`, out.join('\n').length, 'chars');
