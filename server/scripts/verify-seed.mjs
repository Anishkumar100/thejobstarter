import 'dotenv/config';
import mongoose from 'mongoose';
import Lesson from '../models/AptitudeLesson.js';
import Subtopic from '../models/AptitudeSubtopic.js';
import Problem from '../models/AptitudeProblem.js';
import Meta from '../models/AptitudeMeta.js';

await mongoose.connect(process.env.MONGODB_URI);

const lessons = await Lesson.find().lean();
const subs = await Subtopic.find().lean();
const problems = await Problem.find().lean();
const meta = await Meta.find().lean();

const issues = [];
const lessonBySlug = Object.fromEntries(lessons.map(l => [l.slug, l]));
const subBySlug = Object.fromEntries(subs.map(s => [s.slug, s]));

/* Unique slugs across all collections */
const allSlugs = [...lessons, ...subs, ...problems].map(d => d.slug);
const dups = allSlugs.filter((s, i) => allSlugs.indexOf(s) !== i);
if (dups.length) issues.push('DUP SLUGS: ' + [...new Set(dups)].join(','));

/* Every subtopic points to an existing lesson */
for (const s of subs) {
  if (!lessonBySlug[s.lessonSlug]) issues.push(`subtopic ${s.slug} -> missing lesson ${s.lessonSlug}`);
}

/* Every problem points to an existing lesson + subtopic */
for (const p of problems) {
  if (!lessonBySlug[p.lessonSlug]) issues.push(`problem ${p.slug} -> missing lesson ${p.lessonSlug}`);
  if (p.subtopicSlug && !subBySlug[p.subtopicSlug]) issues.push(`problem ${p.slug} -> missing subtopic ${p.subtopicSlug}`);
  if (!p.solution || !p.problemStatement) issues.push(`problem ${p.slug}: missing statement/solution`);
}

/* lesson.problemCount matches actual problem count */
for (const l of lessons) {
  const actual = problems.filter(p => p.lessonSlug === l.slug).length;
  if (actual !== l.problemCount) issues.push(`${l.slug}: problemCount ${l.problemCount} != actual ${actual}`);
}

/* Each subtopic's problems belong to the same lesson */
for (const s of subs) {
  const mismatches = problems.filter(p => p.subtopicSlug === s.slug && p.lessonSlug !== s.lessonSlug);
  for (const p of mismatches) issues.push(`problem ${p.slug} lesson ${p.lessonSlug} != subtopic ${s.slug} lesson ${s.lessonSlug}`);
}

/* Categories consistency */
const cats = [...new Set(meta.filter(m => m.type === 'category').map(m => m.value))];
const lessonCats = [...new Set(lessons.map(l => l.category))];
for (const c of lessonCats) if (!cats.includes(c)) issues.push(`category ${c} missing from meta`);
for (const c of cats) if (!lessonCats.includes(c)) issues.push(`meta category ${c} has no lesson`);

console.log('lessons:', lessons.length, '| subtopics:', subs.length, '| problems:', problems.length, '| meta:', meta.length);
console.log('meta categories:', cats.join(', '));
console.log('lesson categories:', lessonCats.join(', '));
console.log(issues.length ? 'ISSUES:\n' + issues.join('\n') : 'ALL INTEGRITY CHECKS PASSED');

await mongoose.disconnect();
