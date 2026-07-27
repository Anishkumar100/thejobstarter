import mongoose from 'mongoose';
import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const lines = [];

  const push = s => lines.push(s);

  const lesson = await DsaLesson.findOne({ slug: 'introduction-to-dsa' }).lean();
  const subs = await Subtopic.find({ lessonSlug: 'introduction-to-dsa' }).sort({ order: 1 }).lean();
  const probs = await Problem.find({ lessonSlug: 'introduction-to-dsa' }).lean();

  push('# Present DSA Content — 2026-07-27\n');

  push('## Category\n');
  push('- Order: 0');
  push('- Name: Fundamentals: Arrays & Strings');
  push('- Slug: `fundamentals-arrays-strings`\n');

  /* ── LESSON ── */
  push('## Lesson\n');
  push('```json');
  push(JSON.stringify({
    title: lesson.title,
    slug: lesson.slug,
    category: lesson.category,
    description: lesson.description,
    image: lesson.image,
    icon: lesson.icon,
    order: lesson.order,
    difficulty: lesson.difficulty,
    problemCount: lesson.problemCount
  }, null, 2));
  push('```\n');

  /* ── SUBTOPICS ── */
  push(`## Subtopics (${subs.length})\n`);
  for (const s of subs) {
    const isTheory = !probs.find(p => String(p.subtopicSlug) === String(s.slug));
    push(`### ${s.title}${isTheory ? ' (theory only)' : ''}\n`);
    push('```json');
    push(JSON.stringify({
      title: s.title,
      slug: s.slug,
      lessonSlug: s.lessonSlug,
      order: s.order,
      description: s.description,
      explanation: s.explanation,
      image: s.image,
      youtubeUrl: s.youtubeUrl,
      pdfUrl: s.pdfUrl,
      pptxUrl: s.pptxUrl
    }, null, 2));
    push('```\n');
  }

  /* ── PROBLEMS ── */
  push(`## Problems (${probs.length})\n`);
  for (const p of probs) {
    push(`### ${p.title}\n`);
    push('```json');
    const out = {
      title: p.title,
      slug: p.slug,
      lessonSlug: p.lessonSlug,
      subtopicSlug: p.subtopicSlug,
      difficulty: p.difficulty,
      topics: p.topics,
      companies: p.companies,
      problemStatement: p.problemStatement,
      examples: p.examples,
      constraints: p.constraints,
      approach: p.approach,
      codeBlocks: p.codeBlocks,
      timeComplexity: p.timeComplexity,
      spaceComplexity: p.spaceComplexity,
      youtubeUrl: p.youtubeUrl,
      pdfUrl: p.pdfUrl,
      pptxUrl: p.pptxUrl,
      media: p.media
    };
    push(JSON.stringify(out, null, 2));
    push('```\n');

    /* QUIZ for this problem */
    const quiz = await Quiz.findOne({ problemId: p._id, problemModel: 'Problem' }).lean();
    if (quiz) {
      push(`**Quiz — 5 MCQs**\n`);
      push('```json');
      push(JSON.stringify({
        questions: quiz.questions.map(q => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex
        }))
      }, null, 2));
      push('```\n');
    }
  }

  push('---\n');
  push('## Summary\n\n');
  push(`| Entity | Count |\n|---|---|\n`);
  push(`| Categories | 1 of 7 |\n`);
  push(`| Lessons | 1 of 19 |\n`);
  push(`| Subtopics | ${subs.length} of 34 |\n`);
  push(`| Problems | ${probs.length} of 33 |\n`);
  push(`| Quizzes | 3 of 33 |\n`);

  fs.writeFileSync('dsa-content/present.md', lines.join('\n'), 'utf8');
  console.log('Wrote present.md successfully. Length:', (lines.join('\n').length), 'chars');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
