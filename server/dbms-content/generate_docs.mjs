/*
 * generate_docs.mjs — DBMS version
 * Generates one Markdown learning document (NN-slug.md) per DBMS lesson
 * from the seeded arrays in seedDbmsContent.js.
 *
 * Matching the lesson-1 template exactly:
 *   - `# X. Lesson` block: overview quote + category/difficulty/problems
 *   - `## X.N Subtopic` sections fed from subtopic.explanation (level-2
 *     headings demoted to level 3, deeper headings left untouched)
 *   - `# X. Problems` section with meta table, statement, examples,
 *     constraints, bold-snippet approach, and code blocks from codeBlocks
 *
 * Usage:  node dbms-content/generate_docs.mjs   (run from server/)
 * Output: dbms-content/NN-slug.md (one file per lesson, overwritten)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbmsLessons, dbmsSubtopics, dbmsProblems, dbmsMetaData } from '../seeds/seedDbmsContent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/*
 * Demote only level-2 headings one level (## → ###), leaving deeper
 * headings untouched. Mirrors how the hand-written lesson-1 doc sits
 * nested under `## X.Y <Subtopic>`.
 */
function demoteHeadings(markdown) {
  return markdown.split('\n').map((line) => {
    const m = line.match(/^(\#{2}) (.*)$/);
    if (m) return `### ${m[2]}`;
    return line;
  }).join('\n');
}

/*
 * Convert every heading in approach text into a bold snippet line
 * (## X → **X**) exactly like the original lesson-1 problem sections.
 */
function boldifyApproach(markdown) {
  return markdown.split('\n').map((line) => {
    const m = line.match(/^(\#{1,6}) (.*)$/);
    if (m) return `**${m[2]}**`;
    return line;
  }).join('\n');
}

/* Title-case a company slug: "amazon" → "Amazon", "google" → "Google" */
const companyLabel = (c) => c.split(/[\s_-]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/* Table-cell safety: collapse newlines so cells stay on one line */
const cell = (s) => String(s ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|');

/*
 * Render a single problem block:
 * meta table, statement, examples table, constraints, approach, code
 */
function renderProblem(problem, sub, number) {
  const out = [];
  out.push(`## ${number} ${problem.title}`);
  out.push('');
  out.push('| | |');
  out.push('|---|---|');
  out.push(`| **Difficulty** | ${problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)} |`);
  out.push(`| **Subtopic** | ${sub.title} |`);
  out.push(`| **Companies** | ${problem.companies.map(companyLabel).join(', ')} |`);
  out.push('');
  out.push('### Problem Statement');
  out.push('');
  out.push(problem.problemStatement);
  out.push('');
  out.push('### Examples');
  out.push('');
  out.push('| Input | Output | Explanation |');
  out.push('|---|---|---|');
  for (const ex of problem.examples) {
    out.push(`| ${cell(ex.input)} | ${cell(ex.output)} | ${cell(ex.explanation)} |`);
  }
  out.push('');
  out.push('### Constraints');
  out.push('');
  for (const c of problem.constraints) out.push(`- ${c}`);
  out.push('');
  out.push('### Approach');
  out.push('');
  out.push(boldifyApproach(problem.approach));
  out.push('');
  if (problem.codeBlocks?.length) {
    out.push('### Code');
    out.push('');
    for (const block of problem.codeBlocks) {
      out.push(`\`\`\`${block.language}`);
      out.push(block.code.trim());
      out.push('```');
      out.push('');
    }
  }
  return out.join('\n');
}

/* Hand-tuned intro lines for lesson 1 (kept verbatim from the original doc) */
const INTRO_OVERRIDES = {
  'introduction-to-dbms': 'Master why a DBMS beats a raw file system, the three-schema architecture that keeps users and storage decoupled, and the data-model family tree from relational tables to network and hierarchical trees.'
};

/*
 * Render a complete lesson document
 */
function renderLesson(lesson) {
  const lessonNumber = String(lesson.order + 1);
  const subtopics = dbmsSubtopics
    .filter((s) => s.lessonSlug === lesson.slug)
    .sort((a, b) => a.order - b.order);
  const problems = dbmsProblems
    .filter((p) => p.lessonSlug === lesson.slug);
  const problemsNumber = String(lesson.order + 2);
  const cat = dbmsMetaData.find((m) => m.type === 'category' && m.value === lesson.category);

  const introLine = INTRO_OVERRIDES[lesson.slug]
    || `Master ${subtopics.map((s) => s.title.toLowerCase()).join(', ')}, with exam-style problems and fully worked solutions.`;

  const parts = [];
  parts.push(`# DBMS Learning Document — ${lesson.title}`);
  parts.push('');
  parts.push(`> A comprehensive, student-friendly guide to ${lesson.title} — the foundation every DBMS course stands on.`);
  parts.push(`> ${introLine}`);
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push(`# ${lessonNumber}. ${lesson.title}`);
  parts.push('');
  parts.push(`> **Lesson Overview:** ${lesson.description}`);
  parts.push(`> - **Category:** ${cat ? cat.label : lesson.category}`);
  parts.push(`> - **Difficulty:** ${lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}`);
  parts.push(`> - **Problems:** ${problems.length}`);
  parts.push('');
  parts.push('---');

  // Subtopic sections (0-based order → 1-based numbering)
  subtopics.forEach((sub, i) => {
    parts.push('');
    parts.push(`## ${lessonNumber}.${i + 1} ${sub.title}`);
    parts.push('');
    parts.push(demoteHeadings(sub.explanation));
  });

  // Problems section
  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push(`# ${problemsNumber}. Problems`);
  problems.forEach((problem, i) => {
    const sub = dbmsSubtopics.find((s) => s.slug === problem.subtopicSlug);
    parts.push('');
    parts.push(renderProblem(problem, sub, `${problemsNumber}.${i + 1}`));
  });

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/* Write one file per lesson: 01-slug.md, 02-slug.md, ... */
let wrote = 0;
for (const lesson of dbmsLessons.sort((a, b) => a.order - b.order)) {
  const content = renderLesson(lesson);
  const num = String(lesson.order + 1).padStart(2, '0');
  const file = path.join(__dirname, `${num}-${lesson.slug}.md`);
  fs.writeFileSync(file, content, 'utf8');
  wrote++;
  console.log(`[DOC-DBMS] Wrote ${num}-${lesson.slug}.md (${content.length} chars)`);
}
console.log(`[DOC-DBMS] Done — ${wrote} docs generated`);