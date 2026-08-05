/*
 * seedAptitudeContent.js
 * Seeds Aptitude lessons, subtopics, problems, quizzes, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems (1 problem per subtopic) → Quiz (1 per problem)
 * Source of content: server/aptitude-content/ (one numbered markdown doc per
 * lesson, e.g. 01-number-systems-hcf-lcm.md, 03-percentages.md — PDF-ready).
 * Lesson seeded so far: 28 of 28
 *
 * NOTE: Unlike seedPhaseContent.js this script ONLY touches the four
 * Aptitude collections plus Quiz documents for AptitudeProblem — it never
 * clears other subjects' content and it never clears Progress/QuizAttempt
 * (student data must survive).
 *
 * Usage:
 *   node server/seeds/seedAptitudeContent.js
 *   (requires MONGODB_URI in env, defaults to localhost)
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO ADD NEW CONTENT
 *
 * Fill the four arrays below. Every entry MUST match its Mongoose model:
 *
 * LESSON (AptitudeLesson)
 *   { title, slug, category, description, icon, order, difficulty, problemCount }
 *   - category: filter value shown on /aptitude — should match a category
 *     entry in aptitudeMetaData below (e.g. 'quantitative').
 *   - problemCount is IGNORED at insert time — the runner recounts it
 *     from the actual problems after seeding.
 *
 * SUBTOPIC (AptitudeSubtopic)
 *   { title, slug, description, explanation, lessonSlug, order }
 *   - explanation: RICH Markdown (headings, tables, code fences, ✅/❌ lists)
 *     rendered on the subtopic detail page. Mirror the matching section of
 *     the lesson's doc file (server/aptitude-content/NN-lesson-slug.md) so web
 *     and PDF stay in sync.
 *   - optional: image, youtubeUrl, pdfUrl, pptxUrl
 *   - lessonSlug MUST equal the slug of an existing lesson above.
 *
 * PROBLEM (AptitudeProblem)
 *   { title, slug, lessonSlug, subtopicSlug, difficulty, topics,
 *     companies, problemStatement, solution }
 *   - difficulty: 'easy' | 'medium' | 'hard'
 *   - solution: RICH Markdown (steps, tables, answer + check + trap)
 *     rendered on AptitudeDetail. Mirror the matching problem section of
 *     the lesson's doc file (server/aptitude-content/NN-lesson-slug.md).
 *   - optional: media[], youtubeUrl, pdfUrl, pptxUrl
 *   - subtopicSlug MUST equal the slug of an existing subtopic above.
 *
 * QUIZ (Quiz — attached to problems, one quiz per problem)
 *   { problemSlug, questions: [{ text, options, correctIndex }] }
 *   - problemSlug must equal the slug of a problem above; the runner
 *     converts it to the problem's ObjectId + problemModel 'AptitudeProblem'.
 *   - options: 2 to 6 strings; correctIndex: index of the correct option
 *     (0-based). NEVER list correctIndex to students — it is internal.
 *
 * META (AptitudeMeta)
 *   { type, value, label, order }  — type: 'category' | 'topic' | 'company'
 *   - Categories drive the filter pills on /aptitude.
 *   - (type + value) pair must be unique.
 * ─────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import AptitudeLesson from '../models/AptitudeLesson.js';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';
import AptitudeProblem from '../models/AptitudeProblem.js';
import AptitudeMeta from '../models/AptitudeMeta.js';
import Quiz from '../models/Quiz.js';

/* ================================================================
 * Aptitude Lessons
 * ================================================================ */

const aptitudeLessons = [
  {
    title: 'Number Systems & HCF-LCM',
    slug: 'number-systems-hcf-lcm',
    category: 'quantitative',
    description: 'The foundation of all quantitative aptitude — divisibility rules, number properties, and the two great workhorses HCF and LCM.',
    icon: 'Calculator',
    order: 1,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Simplification & Approximation',
    slug: 'simplification-approximation',
    category: 'quantitative',
    description: 'The speed layer of every quantitative paper — BODMAS, mental-math shortcuts, and knowing when "good enough" is exactly right.',
    icon: 'Zap',
    order: 2,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Percentages',
    slug: 'percentages',
    category: 'quantitative',
    description: 'The language of "out of a hundred" — conversions, the swap trick, and the multiplier method that tames successive changes.',
    icon: 'Percent',
    order: 3,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Profit, Loss & Discount',
    slug: 'profit-loss-discount',
    category: 'quantitative',
    description: 'The shopkeeper\'s mathematics — the golden chain from marked price to discount to selling price, and the golden rule that profit% is always on cost price.',
    icon: 'TrendingUp',
    order: 4,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Ratio, Proportion & Averages',
    slug: 'ratio-proportion-averages',
    category: 'quantitative',
    description: 'The mathematics of sharing — "for every a, there are b" ratios, equal-ratio proportions, and the Total = Average × Count trick that cracks every averages question.',
    icon: 'Scales',
    order: 5,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Time, Speed & Distance',
    slug: 'time-speed-distance',
    category: 'quantitative',
    description: 'The road-trip chapter — the magic triangle Distance = Speed × Time, the gap-closing magic of relative speed, boats fighting rivers, and trains that must pull their whole body through.',
    icon: 'Gauge',
    order: 6,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Time & Work',
    slug: 'time-work',
    category: 'quantitative',
    description: 'The mathematics of getting things done — turn days into daily fractions, add the rates of people who work together, and watch how a leak fights every pipe that tries to fill the tank.',
    icon: 'Timer',
    order: 7,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Simple & Compound Interest',
    slug: 'simple-compound-interest',
    category: 'quantitative',
    description: 'The money chapter — rent for using someone\'s money. Simple interest charges it on the original sum forever; compound interest rolls it over like a snowball.',
    icon: 'Landmark',
    order: 8,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Permutations, Combinations & Probability',
    slug: 'permutations-combinations-probability',
    category: 'quantitative',
    description: 'The counting chapter — one question decides everything: does order matter? Arrange with factorials, choose with combinations, and finish with favourable ÷ total.',
    icon: 'Dices',
    order: 9,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Algebra, Equations & Mensuration',
    slug: 'algebra-equations-mensuration',
    category: 'quantitative',
    description: 'Two superpowers — turn a story into an equation and let x answer it, then measure the world: fence around (perimeter), carpet on (area), water inside (volume).',
    icon: 'Sigma',
    order: 10,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Puzzles & Syllogisms',
    slug: 'puzzles-syllogisms',
    category: 'logical',
    description: 'The brain-training chapter — arrange people with clue-following logic, and judge statements with Venn circles: what definitely follows and what never does.',
    icon: 'Puzzle',
    order: 11,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Blood Relations & Direction Sense',
    slug: 'blood-relations-direction',
    category: 'logical',
    description: 'The family-tree chapter — one link at a time, never reversed — and the compass chapter: draw the arrows, spot the 3-4-5 triple, name the diagonal.',
    icon: 'Users',
    order: 12,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Coding-Decoding & Number Series',
    slug: 'coding-decoding-number-series',
    category: 'logical',
    description: 'The code-breaker chapter — find the one rule behind the code (shift, reverse, sum) — and the pattern chapter: differences first, verify on two terms, then predict.',
    icon: 'Binary',
    order: 13,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Analogies & Odd One Out',
    slug: 'analogies-odd-one-out',
    category: 'logical',
    description: 'The relationship chapter — name the bond between the complete pair and copy it — and the spy chapter: find the rule that unites three, and the fourth is the intruder.',
    icon: 'ArrowLeftRight',
    order: 14,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Seating Arrangements',
    slug: 'seating-arrangements',
    category: 'logical',
    description: 'The chair chapter — build the row seat by seat with definite clues first, and place the anchor on the circle: facing the centre, left is clockwise and right is anticlockwise.',
    icon: 'Armchair',
    order: 15,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Statement-Conclusion & Critical Reasoning',
    slug: 'statement-conclusion-critical-reasoning',
    category: 'logical',
    description: 'The judge chapter — for assumptions run the Collapse Test (does the statement fall apart without the belief?), and for conclusions the Three-Gate Test: statement-only facts, full force for MUST.',
    icon: 'Scale',
    order: 16,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Clocks & Calendars',
    slug: 'clocks-calendars',
    category: 'logical',
    description: 'The time-and-dates chapter — two speeds for the clock (6° a minute, 0.5° a minute) and one formula for the angle; odd days for the calendar, and the century rule: leap only on divisibility by 400.',
    icon: 'Clock',
    order: 17,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Input-Output & Logical Sequences',
    slug: 'input-output-logical-sequences',
    category: 'logical',
    description: 'The machine chapter — one rule, one element per step, lock each placed number — and the timeline chapter: first event and last event first, the middle fills itself.',
    icon: 'Workflow',
    order: 18,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Verbal Ability Essentials',
    slug: 'verbal-ability-essentials',
    category: 'verbal',
    description: 'The grammar-start chapter — the Job Test for parts of speech (what does the word DO?) and the Agreement Rule: singular subject, singular verb, and each/every/either/neither are always singular.',
    icon: 'BookOpen',
    order: 19,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Sentence Correction & Grammar',
    slug: 'sentence-correction-grammar',
    category: 'verbal',
    description: 'The sentence hospital — diagnose the true subject and prescribe the verb pulse (a number of = plural, the number of = singular) — and the Verb Thermometer: yesterday is past, since/for is perfect, and articles match the SOUND not the letter.',
    icon: 'PenLine',
    order: 20,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Vocabulary',
    slug: 'vocabulary',
    category: 'verbal',
    description: 'The word-power chapter — Clue-Lock for synonyms (define it in your words, test each option in the sentence, lock the twin), root-decoding for free words — and one-word substitution with the reverse-verify test: idioms are situation codes, never literal translations.',
    icon: 'BookMarked',
    order: 21,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Reading Comprehension',
    slug: 'reading-comprehension',
    category: 'verbal',
    description: 'The passage chapter — Two-Pass Method (scan the topic map, then hunt the exact line) and Locate-Line-Cite; inferences ride on sentences: supported, not stated, not contradicted.',
    icon: 'FileText',
    order: 22,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Para Jumbles & Sentence Completion',
    slug: 'para-jumbles-sentence-completion',
    category: 'verbal',
    description: 'The rebuild chapter — Anchor-Hunt for jumbles (new-subject sentences open, pronoun sentences answer their noun, However contrasts) — and the Double-Clue Method for blanks: signal words set the meaning, grammar sets the form.',
    icon: 'ListOrdered',
    order: 23,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Cloze Test',
    slug: 'cloze-test',
    category: 'verbal',
    description: 'The cheese-repair chapter — every blank has one job (meaning, grammar, or connection), ripple-check the neighbours, pre-fill your word before reading options — and context casting: the scene sets the feeling, the form filter casts the word.',
    icon: 'ScanText',
    order: 24,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Tables & Bar Graphs',
    slug: 'tables-bar-graphs',
    category: 'data-interpretation',
    description: 'The data-vision chapter — Cell-Eyes for tables (read the column headings, then read-sum-percentage, and increase % is on the OLD value) — and Bar-Eye for graphs: axis and scale first, heights by eye, numbers on paper for sums.',
    icon: 'BarChart3',
    order: 25,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Pie Charts & Line Graphs',
    slug: 'pie-charts-line-graphs',
    category: 'data-interpretation',
    description: 'The visual-story chapter — the 1% Key for pies (a pie is always 100% of ONE total, and 3.6° = 1%) and the Point-Read + Trend-Eye pair for line graphs (points are exact values, the line\'s direction is the story).',
    icon: 'PieChart',
    order: 26,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Data Sufficiency',
    slug: 'data-sufficiency',
    category: 'data-interpretation',
    description: 'The data-triage chapter — the Five-Code Answer Grid (A: I alone · B: II alone · C: each alone · D: together · E: never) plus the Sufficiency Test: is the answer Unique, Complete, Clean?',
    icon: 'Gauge',
    order: 27,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Mixed & Caselet DI',
    slug: 'mixed-caselet-di',
    category: 'data-interpretation',
    description: 'The extraction-finished chapter — the Case-Builder Method for caselets (extract → grid → fill the rest = total − named parts → unit) and the Chart-Bridge Method for mixed graphs (a pie is the inside story of one bar — never cross years).',
    icon: 'LayoutDashboard',
    order: 28,
    difficulty: 'easy',
    problemCount: 2
  }
];

/* ================================================================
 * Aptitude Subtopics
 * Explanation strings mirror the matching sections of
 * the lesson's doc file (server/aptitude-content/NN-lesson-slug.md) (kept in sync for PDF generation).
 * ================================================================ */

const aptitudeSubtopics = [
  /* Number Systems & HCF-LCM */
  {
    title: 'Divisibility Rules & Number Properties',
    slug: 'divisibility-rules-number-properties',
    description: 'Quick mental checks to know when one number divides another — starting with the magical sum-of-digits rule for 3 and 9.',
    explanation: `### Why Divisibility Rules Matter

A **divisibility rule** is a quick mental check that tells you whether one number divides another **exactly** — without doing the long division. In an exam, saving two minutes on every number-based question is the difference between finishing and not finishing.

Example: Is 7,29,846 divisible by 3? Instead of dividing, you add the digits: 7 + 2 + 9 + 8 + 4 + 6 = 36. Since 36 is a multiple of 3, the number is divisible by 3. Done — no division needed.

### The Complete Rules Table (Memorise This)

| Divisible by | Rule | Example |
|---|---|---|
| 2 | Last digit is even (0, 2, 4, 6, 8) | 348 → last digit 8 is even ✓ |
| 3 | **Sum of digits is a multiple of 3** | 729 → 7+2+9 = 18 ✓ |
| 4 | Last TWO digits form a multiple of 4 | 5,316 → 16 is a multiple of 4 ✓ |
| 5 | Last digit is 0 or 5 | 415 ✓ |
| 6 | Even **AND** sum of digits is a multiple of 3 | 342 → even and 3+4+2 = 9 ✓ |
| 8 | Last THREE digits form a multiple of 8 | 71,208 → 208 is a multiple of 8 ✓ |
| 9 | **Sum of digits is a multiple of 9** | 1,836 → 1+8+3+6 = 18 ✓ |
| 10 | Last digit is 0 | 750 ✓ |
| 11 | (Sum of digits in odd positions) − (sum in even positions) is 0 or a multiple of 11 | 9,251 → (9+5) − (2+1) = 11 ✓ |

**How to read the table:** the rules for 3 and 9 use the WHOLE number (its digit sum). The rules for 2, 5, 10 use only the LAST digit. The rules for 4 and 8 use the last two/three digits. Never mix them up.

### Why the Sum-of-Digits Rule for 3 and 9 Actually Works

This is the one rule every student asks "but why?" — and understanding it means you'll never forget it.

The secret: **10, 100, 1000, ... all leave a remainder of 1 when divided by 9.**

- 10 = 9 + 1 → remainder 1
- 100 = 99 + 1 → remainder 1
- 1000 = 999 + 1 → remainder 1

Now take any number, say 5,862:

\`\`\`
5862 = 5×1000 + 8×100 + 6×10 + 2
     = 5×(999+1) + 8×(99+1) + 6×(9+1) + 2
     = (5×999 + 8×99 + 6×9)  +  (5 + 8 + 6 + 2)
       └──── all multiples of 9 ────┘   └── the digit sum!
\`\`\`

The first bracket is always a multiple of 9. So the whole number is a multiple of 9 **exactly when the digit sum is**. And since every multiple of 9 is also a multiple of 3, the digit sum rules out both — for free.

### Worked Examples

**Example 1 — Check 5862 for divisibility by 3 and 9:**
1. Sum the digits: 5 + 8 + 6 + 2 = **21**
2. 21 is a multiple of 3 → 5862 is divisible by 3 (5862 ÷ 3 = 1954 exactly ✓)
3. 21 is NOT a multiple of 9 → 5862 is NOT divisible by 9

**Example 2 — Which of 12345, 9876, 11111 is divisible by 9?**
- 12345 → 1+2+3+4+5 = 15 → not a multiple of 9 ✗
- 9876 → 9+8+7+6 = 30 → not a multiple of 9 ✗
- 11111 → 1+1+1+1+1 = 5 → not a multiple of 9 ✗
- None! (12345 is divisible by 3 though — 15 is a multiple of 3.)

**Example 3 — Find the smallest digit A so that 5A2 is divisible by 3:**
1. Digit sum: 5 + A + 2 = 7 + A
2. Need 7 + A to be a multiple of 3: A = 2 gives 9 ✓ (A = 5 gives 12, A = 8 gives 15)
3. **Smallest A = 2**

**Example 4 — Using rule 11:** Is 13,024 divisible by 11?
1. Odd positions (1st, 3rd, 5th): 1 + 0 + 4 = 5; Even positions (2nd, 4th): 3 + 2 = 5
2. Difference: 5 − 5 = 0 → divisible by 11 ✓ (13,024 ÷ 11 = 1,184 ✓)

### Number Properties — the Vocabulary You Need

| Property | Meaning | Examples |
|---|---|---|
| Even / Odd | Divisible by 2 / not divisible by 2 | 4, 18 even · 7, 23 odd |
| Prime | Exactly TWO factors: 1 and itself | 2, 3, 5, 7, 11, 13 |
| Composite | More than two factors | 4, 6, 9, 12, 15 |
| Perfect square | A number × itself | 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 |
| Perfect cube | A number × itself × itself | 1, 8, 27, 64, 125 |
| Coprime (relatively prime) | HCF is 1 | (4, 9), (8, 15), (21, 25) |
| Factor / divisor | Divides the number exactly | factors of 12: 1, 2, 3, 4, 6, 12 |
| Multiple | Number × a whole number | multiples of 4: 4, 8, 12, 16, ... |

**Three facts worth remembering:**
1. **2 is the only even prime** — every other even number has at least three factors (1, 2, itself).
2. **1 is neither prime nor composite** — it has exactly one factor.
3. The smallest composite number is **4**.

### Divisibility + Number Properties Combo Questions

These combine both ideas — exam favourites:

**Q: How many two-digit numbers are divisible by both 3 and 5?**
1. Divisible by 3 and 5 = divisible by LCM(3, 5) = 15.
2. Two-digit multiples of 15: 15, 30, 45, 60, 75, 90 → **6 numbers**.

**Q: A number is divisible by 6. Which of these must also divide it?**
1. Divisible by 6 = divisible by 2 AND by 3 (LCM again).
2. So 2 and 3 must divide it. But 6 = 2×3, so 6 dividing the number does NOT force 18 or 12 to divide it (e.g. 30 is divisible by 6 but not by 18).

### Common Traps

❌ **"Divisible by 3 means divisible by 9"** — WRONG. 21 is divisible by 3 but not by 9. The digit sum decides: multiple of 9 only if digit sum is a multiple of 9.
❌ **Using the last digit for 3/9** — the last digit only works for 2 and 5.
❌ **Divisible by 6 = just checking even** — must ALSO check the digit sum is a multiple of 3. 14 is even but not divisible by 6.
❌ **Forgetting 2 is prime** — it's the only even prime; don't call primes "all odd".
❌ **Divisible by 4 uses the last TWO digits** — not the last digit (that's 2) and not the sum of digits.

### Quick Self-Test (answers at the bottom)

1. Which of these is NOT divisible by 3? (a) 231  (b) 1,002  (c) 7,891  (d) 12,345
2. The sum of digits of a number is 27. Which is definitely true? (a) divisible by 3 only  (b) divisible by 3 and 9  (c) divisible by 9 only
3. Smallest digit A so that 5A2 is divisible by 3? (a) 1  (b) 2  (c) 3  (d) 4
4. Which number is divisible by 11? (a) 1,276  (b) 13,024  (c) 2,461
5. A number is divisible by 6. It must also be divisible by — (a) 12  (b) 18  (c) 3  (d) 9

**Answers:** 1→c (digit sum 25), 2→b (27 is a multiple of 9), 3→b (7+2=9), 4→b (odd 1+0+4=5, even 3+2=5, diff 0), 5→c (6 = 2×3, so 2 and 3 divide it).

### Key Takeaway

For 3 and 9, **sum the digits and check the multiple**. For 2, 5, 10 check the **last digit**. For 4 and 8 check the **last two/three digits**. And remember: 9's rule implies 3's rule — but never the other way around.`,
    lessonSlug: 'number-systems-hcf-lcm',
    order: 1
  },
  {
    title: 'HCF & LCM',
    slug: 'hcf-lcm',
    description: 'The Highest Common Factor and the Least Common Multiple — and the golden formula that connects them.',
    explanation: `### What is HCF?

The **Highest Common Factor** (HCF) of two or more numbers is the **largest** number that divides each of them exactly.

- Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24
- Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36
- Common factors: 1, 2, 3, 4, 6, 12 → **HCF = 12**

### What is LCM?

The **Least Common Multiple** (LCM) of two or more numbers is the **smallest** number that each of them divides exactly.

- Multiples of 24: 24, 48, 72, 96, ...
- Multiples of 36: 36, 72, 108, ...
- First common multiple: **LCM = 72**

**The analogy that sticks:**
Imagine groups of students forming rows. HCF asks: *what is the biggest row size that lets every group form complete rows?* LCM asks: *what is the fewest total students such that every group can be split exactly?* Same numbers, opposite questions.

### Method 1 — Prime Factorisation (Always Works)

1. Break each number into its prime factors.
2. **HCF:** for each prime, take the SMALLEST exponent that appears anywhere.
3. **LCM:** for each prime, take the LARGEST exponent that appears anywhere.

**Worked example — HCF and LCM of 24 and 36:**

\`\`\`
24 = 2 × 2 × 2 × 3 = 2³ × 3
36 = 2 × 2 × 3 × 3 = 2² × 3²

HCF:  2² × 3  =  4 × 3  = 12    (smallest exponents)
LCM:  2³ × 3² =  8 × 9  = 72    (largest exponents)
\`\`\`

**Verification:** 12 × 72 = 864 = 24 × 36 ✓ — the golden relation (below) confirms both answers.

### Method 2 — Division Method for HCF (Fast for Two Numbers)

1. Divide the larger number by the smaller one.
2. Now divide the divisor by the remainder.
3. Repeat until the remainder is 0 — the LAST divisor is the HCF.

**Worked example — HCF of 84 and 120:**

\`\`\`
120 ÷ 84 → remainder 36
84 ÷ 36 → remainder 12
36 ÷ 12 → remainder 0   →  HCF = 12
\`\`\`

### The Golden Relation (Memorise This)

> **For two numbers A and B:  HCF × LCM = A × B**

The moment you know any three of the four values, the fourth is one division away. This single formula solves more exam problems than any other trick in this chapter.

**Why it works (simple intuition):** the LCM of A and B is the product of all prime factors with maximum exponents; the HCF is the same primes with minimum exponents. Multiplying them multiplies each prime's exponents: max + min = the exponents in A × B. So LCM × HCF is exactly A × B.

### The Three Classic Exam Patterns

**Pattern 1 — Ratio + HCF: two numbers are in ratio a : b with HCF h.**
The actual numbers are **h×a and h×b**.

Example: Two numbers are in the ratio 3 : 4 and their HCF is 6.
→ Numbers are 3×6 = 18 and 4×6 = 24. Check: HCF(18, 24) = 6 ✓

**Pattern 2 — Same remainder: find the largest number dividing several numbers leaving the same remainder r.**
**Subtract r from each number first, then take the HCF of the results.**

Example: Find the largest number that divides 94, 70 and 52 leaving remainder 4 each time.
→ 94−4 = 90, 70−4 = 66, 52−4 = 48 → HCF(90, 66, 48) = 6. Check: 94÷6 leaves 4 ✓

**Pattern 3 — Smallest number divisible by several numbers = LCM.**
Example: The smallest number divisible by 4, 6 and 8 → LCM(4, 6, 8) = 24.

**Bonus pattern — ringing bells / running laps:** three bells ring at 4, 6 and 8 minutes. They ring together again after LCM(4, 6, 8) = **24 minutes**.

### Common Traps

❌ **Using HCF × LCM = A × B for three or more numbers** — the golden relation works ONLY for two numbers. With A, B, C you cannot use it.
❌ **HCF of numbers in ratio problems:** forgetting to multiply the ratio terms by the HCF to get the actual numbers.
❌ **LCM vs HCF swapped:** "largest number that divides ..." = HCF; "smallest number divisible by ..." = LCM. Read the question's direction.
❌ **Same-remainder problems:** forgetting to subtract the remainder from EVERY number before taking HCF.
❌ **Exponent confusion:** HCF takes the smallest exponent, LCM takes the largest — it's easy to flip them. Write "HCF = small, LCM = big" at the top of your rough sheet.

### Quick Self-Test (answers at the bottom)

1. HCF of 42 and 56? (a) 7  (b) 14  (c) 21  (d) 28
2. LCM of 12 and 18? (a) 24  (b) 36  (c) 54  (d) 72
3. HCF of two numbers is 6, LCM is 72. One number is 18. The other is? (a) 12  (b) 24  (c) 36  (d) 48
4. Two numbers are in ratio 3 : 4 with HCF 5. The numbers are? (a) 15, 20  (b) 3, 4  (c) 12, 16  (d) 5, 20
5. The largest number dividing 94, 70, 52 leaving remainder 4 each time? (a) 4  (b) 6  (c) 8  (d) 12

**Answers:** 1→b (42 = 2×3×7, 56 = 2³×7 → 2×7 = 14), 2→b (12 = 2²×3, 18 = 2×3² → 2²×3² = 36), 3→b (6×72 = 432, 432 ÷ 18 = 24), 4→a (3×5, 4×5), 5→b (90, 66, 48 → HCF 6).

### Key Takeaway

**HCF = biggest common divisor (take smallest exponents). LCM = smallest common multiple (take largest exponents).** For exactly two numbers, HCF × LCM = A × B — use it to find the fourth value from any three. Direction decides the method: "largest dividing" → HCF, "smallest divisible" → LCM.`,
    lessonSlug: 'number-systems-hcf-lcm',
    order: 2
  },
  /* Simplification & Approximation */
  {
    title: 'BODMAS & Simplification',
    slug: 'bodmas-simplification',
    description: 'The one rule that decides everything — brackets, order, division, multiplication, addition, subtraction — and how to apply it without being tricked.',
    explanation: `### The One Rule That Decides Everything

An expression like \`6 + 4 × 5 − 2\` has two possible answers depending on what you do first:

- Do addition first: (6 + 4) × 5 − 2 = 50 − 2 = 48 ❌
- Do multiplication first: 6 + 20 − 2 = **24** ✅

Same numbers, same symbols — different answers. The **BODMAS** rule is the universally agreed order that makes arithmetic a science, not an argument:

| Letter | Operation | Example |
|---|---|---|
| **B** | Brackets (solve from innermost to outermost) | (2 + 3)² → 5² |
| **O** | Order (powers and roots, "of" means ×) | 2³, √49, ½ of 8 |
| **D** | Division | 18 ÷ 3 |
| **M** | Multiplication | 6 × 2 |
| **A** | Addition | 7 + 9 |
| **S** | Subtraction | 15 − 4 |

**Fun mnemonic:** *Big Oranges Do Make Amazing Samosas* — B, O, D, M, A, S.

### The Three Rules Inside BODMAS

**Rule 1 — Brackets are solved from the INSIDE out.**
An expression may contain round ( ), curly { } and square [ ] brackets. Solve the innermost bracket completely (using BODMAS inside it) before touching anything outside it.

**Rule 2 — Division and Multiplication are SAME priority — go left to right.**
18 ÷ 3 × 2 = (18 ÷ 3) × 2 = 6 × 2 = **12**. Do NOT "multiply first because M comes after D": D and M are a single level, decided by whichever appears first when scanning left to right. Same for A and S: 20 − 5 + 3 = (20 − 5) + 3 = **18**, not 20 − 8.

**Rule 3 — "Of" is multiplication in disguise.**
"½ of 16" means ½ × 16 = 8. In expressions like \`3 + ½ of 16 − 4\`, the "of" is solved with the O/M level: 3 + 8 − 4 = 7.

### Worked Example — Full BODMAS Run

Simplify: \`12 + 6 × 2 − 18 ÷ 3 + (4 + 2 × 3)\`

\`\`\`
Step 0:  12 + 6 × 2 − 18 ÷ 3 + (4 + 2 × 3)
Step 1:  Brackets first — inside them, × before +:
         (4 + 2 × 3) = 4 + 6 = 10
Step 2:  Now the expression is:  12 + 6 × 2 − 18 ÷ 3 + 10
Step 3:  Division & multiplication, left to right:
         6 × 2 = 12       18 ÷ 3 = 6
Step 4:  Addition & subtraction, left to right:
         12 + 12 − 6 + 10 = 24 − 6 + 10 = 18 + 10 = 28
Answer:  28 ✓
\`\`\`

### Bracket Depth — Innermost First

Simplify: \`25 − [12 + (7 − 4)] × 2\`

\`\`\`
Step 1:  Innermost (7 − 4) = 3
Step 2:  [12 + 3] = 15
Step 3:  25 − 15 × 2 = 25 − 30 = -5
Answer:  -5 ✓   (multiplication before subtraction — always)
\`\`\`

### Powers and Roots ("O") in Expressions

\`(3 + 2)² − √(25) + 2³\`

\`\`\`
Step 1:  Bracket: (3 + 2)² = 5² = 25
Step 2:  O:  √25 = 5, and 2³ = 8
Step 3:  25 − 5 + 8 = 28
Answer:  28 ✓
\`\`\`

### Quick Mental Powers (Memorise the Squares)

| Square | Value | | Square | Value |
|---|---|---|---|---|
| 11² | 121 | | 16² | 256 |
| 12² | 144 | | 17² | 289 |
| 13² | 169 | | 18² | 324 |
| 14² | 196 | | 19² | 361 |
| 15² | 225 | | 20² | 400 |

Cubes worth remembering: 2³=8, 3³=27, 4³=64, 5³=125, 6³=216, 10³=1000.

### Common Traps

❌ **"Division before multiplication because D comes before M"** — WRONG. They share one priority level; go left to right.
❌ **"Addition before subtraction"** — same trap. Left to right.
❌ **Solving brackets but forgetting to keep their value**: \`(4 + 2 × 3)\` must become a single number (10) before the outside math starts.
❌ **Treating "of" as +**: "½ of 16" is ×, never +.
❌ **Skipping steps in your head on two-mark questions** — the whole point of BODMAS questions is to catch careless students.

### Quick Self-Test (answers at the bottom)

1. 6 + 4 × 5 − 2 = ? (a) 48  (b) 24  (c) 30  (d) 40
2. 18 ÷ 3 × 2 = ? (a) 12  (b) 3  (c) 8  (d) 27
3. 100 ÷ 4 × 5 = ? (a) 5  (b) 80  (c) 125  (d) 500
4. In \`25 − 6 × 3 + (8 − 5)²\`, which operation happens FIRST? (a) 25 − 6  (b) 6 × 3  (c) 8 − 5  (d) 3 + 8
5. Simplify: \`3 + ½ of 16 − 4\` (a) 6  (b) 7  (c) 11  (d) 15

**Answers:** 1→b (6 + 20 − 2 = 24), 2→a (18÷3=6, 6×2=12), 3→c (100÷4=25, 25×5=125), 4→c (brackets first), 5→b (3 + 8 − 4 = 7).

### Key Takeaway

BODMAS is non-negotiable: **Brackets → Order → (÷ and × left to right) → (+ and − left to right)**. Write each step on paper, and never let "D before M" superstition rob you of easy marks.`,
    lessonSlug: 'simplification-approximation',
    order: 1
  },
  {
    title: 'Approximation Techniques',
    slug: 'approximation-techniques',
    description: 'Exactness is expensive — round to convenient numbers, use percent-fraction shortcuts, and let rounding errors cancel each other.',
    explanation: `### The Idea: Exactness Is Expensive

In exam questions with **answer options far apart**, you almost never need the exact answer — you need the closest one. Approximation trades a tiny bit of precision for a huge gain in speed. A question that takes 60 seconds exactly takes 10 seconds approximately.

**The golden rule of approximation:** only round if the options are comfortably far apart. If options are close (49, 50, 51), calculate carefully; if they're 45, 50, 55 — round freely.

### Technique 1 — Round to the Nearest Convenient Number

Replace awkward numbers with round ones close by:

| Awkward | Round to | Why |
|---|---|---|
| 899 | 900 | 1 away, clean multiples |
| 1,195 | 1,200 | 5 away, 12 and 15 both divide 1,200 |
| 79.7 | 80 | clean tens |
| 12.4 | 12 | clean dozen |

**Example:** 37% of 899 ≈ 37% of 900 = 0.37 × 900 = **333**. (Exact: 332.63 — error is 0.37!)

### Technique 2 — Percent → Fraction Equivalents (The Speed Table)

| Percent | Fraction | Percent | Fraction |
|---|---|---|---|
| 10% | 1/10 | 33⅓% | 1/3 |
| 12.5% | 1/8 | 37.5% | 3/8 |
| 20% | 1/5 | 40% | 2/5 |
| 25% | 1/4 | 60% | 3/5 |
| 30% | 3/10 | 66⅔% | 2/3 |

**Example:** 25% of 720 = 720 ÷ 4 = **180** — no multiplication needed.

### Technique 3 — Compatible Numbers in Division

When dividing, round the top and bottom so the bottom divides the top cleanly:

**Example:** (36% of 1195 + 41% of 795) ÷ 14 ≈ ?

\`\`\`
36% of 1195 ≈ 36% of 1200 = 432
41% of 795  ≈ 41% of 800  = 328
Sum ≈ 432 + 328 = 760
760 ÷ 14 = 54.28 → ≈ 54
\`\`\`

(Exact answer: 54.01 — the estimate nails it.)

### Technique 4 — Two-Digit Multiply Cheats

- **Square ending in 5:** 35² = 3 × 4, then "25" → 1225. 65² → 6×7 = 42, then 25 → 4225.
- **×11:** 53 × 11 → split 5 and 3, insert their sum: 5 (5+3) 3 = 583.
- **×25:** multiply by 100, divide by 4. 68 × 25 = 6800 ÷ 4 = 1700.

### Worked Example — A Full Speed Round

Estimate: \`(31% of 899 + 19% of 620) − 200\`

\`\`\`
31% of 899 ≈ 31% of 900 = 279
19% of 620 ≈ 20% of 600 = 120        (both rounded, one up one down — errors cancel)
279 + 120 − 200 = 199 → ≈ 200
\`\`\`

(Exact: 278.69 + 117.8 − 200 = 196.49 — error of 3.5 on a 200 scale; options at 180/200/220 → 200 ✓)

**Pro tip — round one number up and the other down.** When two values get rounded, deliberately round one up and one down so the errors partially cancel instead of stacking.

### Common Traps

❌ **Rounding when options are close together** (49, 50, 51) — an error of 1 flips the answer.
❌ **Rounding only one side:** (31% of 899 + 19% of 620) — rounding both numbers UP stacks the error.
❌ **Approximating in the wrong direction on ratios** — always ask: does my rounding make the answer bigger or smaller?
❌ **Forgetting the fraction table** — 12.5%, 25%, 33⅓% appear constantly; converting to fractions is 10× faster than multiplying decimals.

### Quick Self-Test (answers at the bottom)

1. 31% of 900 ≈ ? (a) 270  (b) 279  (c) 290  (d) 300
2. 499 × 0.6 ≈ ? (a) 280  (b) 290  (c) 300  (d) 310
3. 27.9 × 3.1 ≈ ? (a) 75  (b) 84  (c) 90  (d) 100
4. Which of these is 33⅓% of 240? (a) 60  (b) 80  (c) 90  (d) 120
5. Estimate: (24% of 1249) ÷ 10 ≈ ? (a) 25  (b) 30  (c) 35  (d) 40

**Answers:** 1→b (0.31 × 900 = 279), 2→c (500 × 0.6 = 300), 3→b (28 × 3 = 84), 4→b (240 ÷ 3 = 80), 5→b (25% of 1250 = 312.5, ÷10 = 31.25 → 30).

### Key Takeaway

Approximation is a speed skill, not a guessing game: **round to convenient numbers, lean on percent→fraction shortcuts, cancel rounding errors by rounding one side up and the other down, and only round when the options are far apart.** Exactness is expensive — spend it only when you must.`,
    lessonSlug: 'simplification-approximation',
    order: 2
  },
  /* Percentages */
  {
    title: 'Percentage Basics & Conversions',
    slug: 'percentage-basics-conversions',
    description: 'Percent means "out of a hundred" — convert between percent, fraction and decimal, and master the swap trick for instant mental math.',
    explanation: `### What "Percent" Actually Means

The word "percent" comes from **per centum** — Latin for *out of a hundred*. So 45% is nothing more than the fraction **45/100**. That's the whole secret:

> A percent is just a fraction with denominator 100, wearing a disguise.

**The pizza-of-100 analogy:** imagine a pizza sliced into exactly 100 identical pieces. "45%" means you get 45 of those pieces. "100%" means the whole pizza. "0%" means nothing. Every percentage question is really asking: *how many of the 100 slices do I get?*

### Conversion: Percent ↔ Fraction ↔ Decimal

Percent, fraction and decimal are three languages saying the same thing. Learn to translate instantly:

| Percent | Fraction | Decimal | | Percent | Fraction | Decimal |
|---|---|---|---|---|---|---|
| 10% | 1/10 | 0.10 | | 50% | 1/2 | 0.50 |
| 12.5% | 1/8 | 0.125 | | 60% | 3/5 | 0.60 |
| 20% | 1/5 | 0.20 | | 66⅔% | 2/3 | 0.666… |
| 25% | 1/4 | 0.25 | | 75% | 3/4 | 0.75 |
| 33⅓% | 1/3 | 0.333… | | 80% | 4/5 | 0.80 |
| 40% | 2/5 | 0.40 | | 90% | 9/10 | 0.90 |

**Rules of translation:**
- Percent → fraction: put it over 100 and simplify. 45% = 45/100 = 9/20.
- Fraction → percent: multiply by 100. 3/8 → (3/8) × 100 = 37.5%.
- Decimal → percent: shift the decimal point two places right. 0.07 → 7%.
- Percent → decimal: shift two places left. 12.5% → 0.125.

### The Swap Trick (Memorise This — It's Gold)

Here's a beautiful symmetry most students never notice:

> **x% of y = y% of x**

Because "x% of y" is (x/100) × y, and "y% of x" is (y/100) × x — and multiplication doesn't care about order.

**Example:** 37% of 50 = 50% of 37 = half of 37 = **18.5**. Done in your head in two seconds.

**Example:** 16% of 25 = 25% of 16 = a quarter of 16 = **4**.

Whenever one of the two numbers is friendly (100, 50, 25, 10, 20, 5), swap and watch the question collapse.

### "x% of y" — The One Operation

"25% of 720" = 0.25 × 720 = 720 ÷ 4 = **180**. Choose the friendliest form: percentage as fraction, decimal, or division — whichever makes the mental math easiest.

### Percentage Change — The Exact Formula

> **Percentage change = (Change ÷ Original value) × 100**

- Change = New value − Original value (positive → increase, negative → decrease)
- The denominator is ALWAYS the original value — never the new one

**Worked example — marks going up:**
A student's marks rise from 320 to 400.

\`\`\`
Change = 400 − 320 = 80
% change = (80 ÷ 320) × 100 = 25% increase
\`\`\`

**Worked example — prices going down:**
A phone drops from ₹15,000 to ₹12,000.

\`\`\`
Change = 12,000 − 15,000 = −3,000
% change = (3000 ÷ 15000) × 100 = 20% decrease
\`\`\`

### Reverse Percentage — Finding the Original

"If a price increased by 25% and is now ₹500, what was it before?" — the classic trap question.

\`\`\`
Original × 1.25 = 500
Original = 500 ÷ 1.25 = ₹400
\`\`\`

**Trap:** never subtract 25% of the final price (500 − 125 = 375 ❌). The 25% was on the original, not on the current price.

### Common Traps

❌ **Using the NEW value as the base** — percentage change is always on the ORIGINAL. Going 80 → 100 is a 25% increase, not a 20% one.
❌ **Adding/subtracting percentages of different bases** — 50% of a pizza plus 50% of a different pizza is not "100% of one pizza".
❌ **Reverse questions:** forgetting to DIVIDE by the multiplier instead of subtracting the percentage.
❌ **Misplacing the decimal** when converting — 12.5% is 0.125, not 1.25.

### Quick Self-Test (answers at the bottom)

1. 37% of 50 = ? (a) 18.5  (b) 185  (c) 15.5  (d) 3.7
2. 25% of 720 = ? (a) 180  (b) 90  (c) 200  (d) 360
3. A number rises from 80 to 100. Percentage increase? (a) 20%  (b) 25%  (c) 80%  (d) 125%
4. 1/8 as a percentage? (a) 12.5%  (b) 8%  (c) 80%  (d) 0.8%
5. A price rose 25% to ₹500. Original price? (a) ₹375  (b) ₹400  (c) ₹425  (d) ₹450

**Answers:** 1→a (swap: 50% of 37 = 18.5), 2→a (720 ÷ 4 = 180), 3→b (20/80 = 25%), 4→a (1/8 × 100 = 12.5%), 5→b (500 ÷ 1.25 = 400).

### Key Takeaway

Percent = "out of a hundred" = a fraction in disguise. Convert with the three-language table, use the **swap trick** when one number is friendly, and always compute percentage change against the **original** value. Reverse problems? Divide by the multiplier, never subtract.`,
    lessonSlug: 'percentages',
    order: 1
  },
  {
    title: 'Successive Percentage Change',
    slug: 'successive-percentage-change',
    description: 'Never add percentages again — multiply the multipliers, and discover why "up 10%, down 10%" is always a hidden loss.',
    explanation: `### The Most Dangerous Sentence in Aptitude

"Price increases by 10%, then by another 10%."

Natural (wrong) instinct: 10 + 10 = 20%. ❌

Actual answer: **21%.** ✅ The second 10% applies to the ALREADY-INCREASED price — a bigger number — so it's worth more. This is the single most commonly lost mark in the whole aptitude section.

### The Multiplier Method (The Only Method You Need)

Every percentage change is a multiplication:

| Change | Multiply by |
|---|---|
| +10% | × 1.10 |
| −20% | × 0.80 |
| +25% | × 1.25 |
| −10% | × 0.90 |
| +p% | × (1 + p/100) |
| −p% | × (1 − p/100) |

Two successive changes = two multiplications, in sequence:

**Worked example — 10% up, then 10% up on ₹100:**

\`\`\`
Start:   100
After 1st:  100 × 1.10 = 110
After 2nd:  110 × 1.10 = 121
Net change: 121 − 100 = 21 → +21%
\`\`\`

The order of the changes doesn't matter — 1.10 × 1.10 is the same either way.

### The Combined Formula (For Speed)

For two successive changes of +a% and +b%:

> **Net change % = a + b + (a × b)/100**

(Use negative numbers for decreases. −20% → b = −20.)

Check the example above: 10 + 10 + (100/100) = 21% ✓

### The Reversal Rule — Always a Loss

What happens with +10% then −10%?

\`\`\`
Multiplier: 1.10 × 0.90 = 0.99
Net: −1% — a LOSS, not "no change"
\`\`\`

**Rule:** an increase of a% followed by a decrease of a% is ALWAYS a net loss of (a²/100)%. The bigger the percentage, the bigger the hidden loss:

| Up then down | Net result |
|---|---|
| +10% then −10% | −1% |
| +20% then −20% | −4% |
| +25% then −25% | −6.25% |
| +50% then −50% | −25% |

Why? The increase makes the number bigger, so the same percentage decrease removes MORE than the increase added. Percentages of different-sized bases — always.

### The Magical Cancellation: +25% then −20%

\`\`\`
Multiplier: 1.25 × 0.80 = 1.00
Net: NO CHANGE!
\`\`\`

These pairs (25%/20%, 20%/16⅔%, 50%/33⅓%) cancel perfectly because one is the fraction inverse of the other: 1.25 = 5/4 and 0.80 = 4/5. Look out for them — they turn three-line problems into one-line answers.

### Real-Life Application — Discounts and GST

A shirt marked ₹800 gets a 20% festival discount, then 5% GST is added on the discounted price:

\`\`\`
Discount:  800 × 0.80 = 640
GST:       640 × 1.05 = 672
Final price: ₹672   (NOT 800 × 0.85 = 680 ❌)
\`\`\`

The 5% applies to the discounted price, not the marked price. Two different bases, two different multipliers.

### Common Traps

❌ **Adding percentages:** 10% + 10% ≠ 20%. Multiply the multipliers.
❌ **"Up 10% then down 10% = no change"** — it's a 1% loss, always.
❌ **Applying the second change to the original price** — the second change always acts on the CURRENT value.
❌ **Forgetting a discount then tax/discount sequence** — every step is its own multiplication on the running total.
❌ **Using the formula with the wrong sign** — a decrease enters as a NEGATIVE number: 20% up then 10% down = 20 + (−10) + (20 × −10)/100 = 10 − 2 = 8% up.

### Quick Self-Test (answers at the bottom)

1. A price rises 10% then another 10%. Net increase? (a) 20%  (b) 21%  (c) 19%  (d) 10%
2. Up 10% then down 10%. Net? (a) No change  (b) 1% increase  (c) 1% decrease  (d) 10% decrease
3. Up 20% then down 20%. Final price vs original? (a) Same  (b) 4% more  (c) 4% less  (d) 20% less
4. Up 25% then down 20%. Net effect? (a) No change  (b) 5% increase  (c) 5% decrease  (d) 25% decrease
5. An item is discounted 20%, then 5% GST added on the discounted price. Final vs original? (a) 15% less  (b) 16% less  (c) 15% more  (d) 1% more

**Answers:** 1→b (10+10+1 = 21%), 2→c (1.10 × 0.90 = 0.99 → −1%), 3→c (1.2 × 0.8 = 0.96 → −4%), 4→a (1.25 × 0.8 = 1.0), 5→b (0.80 × 1.05 = 0.84 → −16%).

### Key Takeaway

Never add percentages — **multiply the multipliers.** +p% is ×(1 + p/100), −p% is ×(1 − p/100), and each change acts on the running total. Equal up-then-down changes always lose (a²/100)% — and watch for inverse-fraction pairs like +25%/−20% that cancel to no change.`,
    lessonSlug: 'percentages',
    order: 2
  },
  /* Profit, Loss & Discount */
  {
    title: 'Profit & Loss Basics',
    slug: 'profit-loss-basics',
    description: 'Cost price, selling price, and the golden rule that profit% is always measured on cost — with the base-100 trick that makes it instant.',
    explanation: `### The Shopkeeper Is a Mathematician in Disguise

Walk into any shop: the owner bought goods at one price, sells at another, and the difference is how they survive. That's literally the whole chapter. Meet the two prices that matter:

| Term | Meaning | Example |
|---|---|---|
| **Cost Price (CP)** | What the shopkeeper paid to buy the item | ₹80 |
| **Selling Price (SP)** | What the customer actually pays | ₹100 |

- SP > CP → the shopkeeper made a **profit**: Profit = SP − CP = ₹20
- SP < CP → the shopkeeper took a **loss**: Loss = CP − SP
- SP = CP → no profit, no loss

### The Three Formulas That Do Everything

\`\`\`
Profit  = SP − CP                (when SP > CP)
Loss    = CP − SP                (when CP > SP)

Profit % = (Profit ÷ CP) × 100
Loss %   = (Loss ÷ CP) × 100
\`\`\`

**THE golden rule: profit and loss percentages are ALWAYS on the Cost Price** — never on the selling price. Bought for 80, sold for 100:

\`\`\`
Profit = 100 − 80 = 20
Profit % = (20 ÷ 80) × 100 = 25%
\`\`\`

### The Base-100 Trick (The Exam Shortcut)

Percentage problems love round numbers. So just **assume the CP is ₹100** and everything becomes instant:

> Selling at a profit of p% → SP = CP × (1 + p/100)
> Selling at a loss of l% → SP = CP × (1 − l/100)

| Scenario | Multiplier on CP |
|---|---|
| +20% profit | × 1.20 |
| +25% profit | × 1.25 (= × 5/4) |
| +12.5% profit | × 1.125 (= × 9/8) |
| −10% loss | × 0.90 |
| −20% loss | × 0.80 |

**Fraction speed-ups (memorise):** profit 25% → ×5/4 · profit 33⅓% → ×4/3 · profit 50% → ×3/2 · loss 20% → ×4/5 · loss 25% → ×3/4.

**Reverse example — "sold for ₹96 at a 20% profit, find the CP":**

\`\`\`
CP × 1.20 = 96
CP = 96 ÷ 1.20 = ₹80
\`\`\`

Reverse questions are just division: to go back, divide by the multiplier instead of subtracting the percentage.

### Worked Examples

**Example 1 — Simple profit %:** Bought for ₹400, sold for ₹500. Profit = 100 → Profit % = 100/400 × 100 = **25%**.

**Example 2 — Loss %:** Bought for ₹250, sold for ₹200. Loss = 50 → Loss % = 50/250 × 100 = **20% loss**.

**Example 3 — SP from CP:** Bought for ₹300, sold at 15% profit → SP = 300 × 1.15 = **₹345**.

**Example 4 — CP from SP:** Sold at ₹552 after a 20% profit → CP = 552 ÷ 1.20 = **₹460**.

### Common Traps

❌ **Profit% on SP instead of CP** — the number one mistake in the chapter. "Bought 80, sold 100" is 25% profit (on 80), not 20% (on 100).
❌ **Subtracting the percentage in reverse problems** — if SP is given and profit% is 20%, CP = SP ÷ 1.20, never SP − 20% of SP.
❌ **Confusing "profit of ₹20" with "profit of 20%"** — one is an amount, one is a percentage. Read the question's words.
❌ **Loss problems:** loss% is (loss ÷ CP) — same base rule as profit.

### Quick Self-Test (answers at the bottom)

1. Bought ₹500, sold ₹600. Profit %? (a) 20%  (b) 25%  (c) 16.67%  (d) 100%
2. Sold at 25% profit for ₹250. CP? (a) ₹200  (b) ₹187.50  (c) ₹225  (d) ₹175
3. Bought ₹400, sold ₹350. Outcome? (a) Profit 12.5%  (b) Loss 12.5%  (c) Loss 50%  (d) Profit 50%
4. Profit percentage is ALWAYS calculated on — (a) SP  (b) CP  (c) MP  (d) Discount
5. Bought ₹300, sold at 15% profit. SP? (a) ₹330  (b) ₹345  (c) ₹315  (d) ₹350

**Answers:** 1→a (100/500 = 20%), 2→a (250 ÷ 1.25 = 200), 3→b (50/400 = 12.5% loss), 4→b, 5→b (300 × 1.15 = 345).

### Key Takeaway

Profit/Loss % always uses **Cost Price** as the base. SP = CP × (1 + p/100) or CP × (1 − l/100), and to find the CP from the SP, **divide by the multiplier**. Think "CP = 100" and the whole chapter becomes mental arithmetic.`,
    lessonSlug: 'profit-loss-discount',
    order: 1
  },
  {
    title: 'Discount & Marked Price',
    slug: 'discount-marked-price',
    description: 'The festival sale story — sticker prices, discounts on marked price, and the golden chain that connects a sale to the shopkeeper\'s profit.',
    explanation: `### The Festival Sale Story

Every item in a shop has a **Marked Price (MP)** — the sticker price — and a **discount** the shopkeeper can offer. The customer never pays the sticker price during a sale; they pay:

> **SP = MP × (1 − d/100)**

**Example:** a ₹1,000 shirt with 20% off → SP = 1000 × 0.80 = **₹800**.

**Why shopkeepers do this?** The sticker price is usually set ABOVE the cost price. A shopkeeper might buy at ₹600, mark at ₹1,000 (so discounts still leave a profit), then run a "20% off" sale that keeps him profitable. Discounts are a marketing game played on top of the profit game.

### The Golden Chain — Where Everything Connects

\`\`\`
Marked Price  →  (apply discount %)  →  Selling Price  →  (compare with CP)  →  Profit or Loss
\`\`\`

- Discount% is measured on the **Marked Price**
- Profit% is measured on the **Cost Price**
- The two bases are different — mixing them is the chapter's deadliest trap

### Worked Example — Full Chain

A shopkeeper marks a shirt 25% above cost and then allows a 10% discount. Find his profit%.

\`\`\`
Step 1 — Base method: let CP = 100
Step 2 — Marked price: 100 × 1.25 = 125
Step 3 — Discount 10% on MP: SP = 125 × 0.90 = 112.50
Step 4 — Profit = 112.50 − 100 = 12.50 → Profit % = 12.5%
\`\`\`

**Fast ratio view:** CP × (5/4) × (9/10) = CP × 45/40 = CP × 1.125 → **12.5% profit**. The two multipliers chain exactly like successive percentages.

### Finding the MP from the Discounted Price

"A shirt is sold for ₹680 after a 15% discount. What was its marked price?"

\`\`\`
MP × 0.85 = 680
MP = 680 ÷ 0.85 = ₹800
\`\`\`

Reverse discount = divide by the multiplier — exactly like reverse profit.

### Two Successive Discounts

Two discounts of 10% each are NOT 20% off:

\`\`\`
1000 × 0.90 × 0.90 = ₹810  →  effective discount = 19%
\`\`\`

(Formula: 10 + 10 − (10 × 10)/100 = 19% — the same successive-change formula you learned in Percentages. That chapter pays off everywhere!)

### Common Traps

❌ **Discount% on CP instead of MP** — the sticker price is the base for discounts.
❌ **"20% discount then 10% discount = 30%"** — multiply the multipliers: 0.80 × 0.90 = 0.72 → 28% off.
❌ **Computing profit% on the marked price** — profit is only measured after the customer's actual payment (SP) vs the shopkeeper's cost (CP).
❌ **Mixing ₹ amounts and percentages** — "discount of ₹20" and "discount of 20%" are different things; the first is a flat amount.

### Quick Self-Test (answers at the bottom)

1. MP = 800, discount 10%. SP? (a) ₹720  (b) ₹800  (c) ₹880  (d) ₹80
2. Sold for ₹400 after a 20% discount. MP? (a) ₹480  (b) ₹500  (c) ₹520  (d) ₹450
3. Two successive discounts of 10% each on MP ₹1,000. Final SP? (a) ₹800  (b) ₹810  (c) ₹900  (d) ₹790
4. Discount is ALWAYS calculated on — (a) CP  (b) SP  (c) MP  (d) Profit
5. A shopkeeper marks 25% above CP and gives 10% discount. Profit %? (a) 15%  (b) 12.5%  (c) 13.5%  (d) 10%

**Answers:** 1→a (800 × 0.90 = 720), 2→b (400 ÷ 0.80 = 500), 3→b (1000 × 0.81 = 810), 4→c, 5→b (1.25 × 0.90 = 1.125).

### Key Takeaway

The golden chain: **MP → discount → SP → compare with CP → profit/loss.** Discount% on MP, profit% on CP — two bases, never mix. Successive discounts are just percentage multipliers chained together, and reverse problems are always "divide by the multiplier".`,
    lessonSlug: 'profit-loss-discount',
    order: 2
  },
  /* Ratio, Proportion & Averages */
  {
    title: 'Ratio & Proportion',
    slug: 'ratio-proportion-basics',
    description: 'The "for every a, there are b" pattern — what ratios mean, why units must match, and how equal ratios scale the world.',
    explanation: `### What Is a Ratio? (Read This First)

A ratio compares two quantities of the **same kind**. The notation **a : b** (read "a to b") means:

> For every **a** of the first thing, there are **b** of the second thing.

**Example — a fruit basket** with 6 apples and 4 oranges:

\`\`\`
Apples : Oranges = 6 : 4  →  simplify (÷2)  →  3 : 2
\`\`\`

"3 : 2" means: for every **3 apples**, there are **2 oranges**. If someone hands you a basket with 3 apples, expect 2 oranges in the same basket. That's the whole idea — a ratio is a **pattern**, not a count.

**Important:** a ratio has NO units. "3 : 2" could be 3 apples and 2 oranges, or 300 apples and 200 oranges — the pattern is the same.

### Two Rules Before Anything Else

**Rule 1 — Same unit or nothing.** You can only compare things measured the same way. 500 g : 2 kg is wrong as it stands — convert first:

\`\`\`
500 g : 2 kg = 500 g : 2000 g = 500 : 2000 → 1 : 4
\`\`\`

**Rule 2 — Always simplify.** A ratio in its simplest form has no common factor above 1. 6 : 4 → 3 : 2. 12 : 18 → 2 : 3 (divide both by 6). Never leave a ratio "unreduced" — it costs marks.

### Equivalent Ratios — The Recipe of Ratios

Multiply (or divide) **both** numbers by the same thing and the ratio doesn't change:

\`\`\`
2 : 3  =  4 : 6  =  6 : 9  =  20 : 30
\`\`\`

All four say the same thing. This is exactly how a recipe scales: 2 cups flour : 3 cups sugar, doubled → 4 : 6. Same taste, twice the cake.

### Proportion — When Two Ratios Are Equal

> **A proportion says: this ratio equals that ratio.**
> \`a : b = c : d\` — read as "a is to b as c is to d".

**Example:** \`2 : 3 = 4 : 6\` is a proportion, because both simplify to the same pattern.

The **cross-multiplication test** checks equality instantly:

\`\`\`
a : b = c : d  ⟺  a × d = b × c
\`\`\`

For 2 : 3 = 4 : 6: 2 × 6 = 12 and 3 × 4 = 12 ✓ — equal, so it's a true proportion.

**Why you care:** proportions let you find a missing number. If \`2 : 3 = x : 9\`, then \`2 × 9 = 3 × x\` → \`x = 6\`.

### The "For Every..." Method (Solve Proportions by Feel)

\`2 : 3 = x : 9\` — think: the second number went from 3 to 9, so it got **tripled** (×3). Do the same to the first number: 2 × 3 = **6**. Done. Match the multiplier, and you never need to memorise the formula.

### Direct & Inverse Proportion — The Two Personalities

Real things change together in two ways. Learn to spot them by the question's behaviour:

| Question type | Behaviour | Example |
|---|---|---|
| **Direct proportion** | More → more. One rises, the other rises. The ratio stays constant. | More pens → more cost. More hours → more distance. |
| **Inverse proportion** | More → less. One rises, the other falls. The product stays constant. | More workers → less time. Faster speed → less time. |

**The one-line test:** ask yourself *"if I double it, what happens?"*
- Doubling the pens doubles the cost → **direct** → multiply both by the same factor.
- Doubling the workers halves the time → **inverse** → multiply one by 2, divide the other by 2.

**Direct example — "4 pens cost ₹120. What do 10 pens cost?"**

\`\`\`
4 pens  →  ₹120
1 pen   →  ₹30        (divide by 4)
10 pens →  ₹300       (multiply by 10)
\`\`\`

**Inverse example — "2 workers build a wall in 12 days. How long for 4 workers?"**

\`\`\`
2 workers → 12 days
1 worker  → 24 days    (double the time — less help!)
4 workers → 6 days     (four times the help → quarter the time)
\`\`\`

Check: 2 × 12 = 24 and 4 × 6 = 24 — same product ✓. That's the inverse signature.

### Common Traps

❌ **Comparing different units** — 500 g : 2 kg becomes 1 : 4 only after converting grams to grams.
❌ **Leaving a ratio unsimplified** — "6 : 4" is not wrong but is never the answer they want.
❌ **Reversing the order** — "girls to boys" is 15 : 20, not 20 : 15. Read which one comes FIRST in the question.
❌ **Adding ratios as numbers** — dividing ₹400 in ratio 3 : 5 means 3 parts + 5 parts = 8 parts, NOT adding 3 + 5 to "spend ₹8".
❌ **Treating inverse problems like direct ones** — more workers = less time, never more.

### Quick Self-Test (answers at the bottom)

1. Simplify 12 : 18. (a) 2 : 3  (b) 3 : 2  (c) 2 : 1  (d) 3 : 1
2. Express 500 g : 2 kg in simplest form. (a) 1 : 4  (b) 500 : 2  (c) 1 : 2  (d) 2 : 1
3. ₹400 is divided in the ratio 3 : 5. The larger share is — (a) ₹150  (b) ₹250  (c) ₹200  (d) ₹300
4. A ratio can only compare two quantities that are in the — (a) same unit  (b) different units  (c) same currency  (d) no specific unit
5. If 4 pens cost ₹120, how much do 10 pens cost? (a) ₹300  (b) ₹250  (c) ₹480  (d) ₹360

**Answers:** 1→a (÷6), 2→a (2000 g → 1 : 4), 3→b (₹400 ÷ 8 parts = ₹50, larger share 5 × 50 = 250), 4→a, 5→a (120 ÷ 4 = 30 per pen; 30 × 10 = 300).

### Key Takeaway

A ratio is a **pattern** ("for every a, there are b"), simplified to its smallest whole-number form, comparing **same units**. A proportion is two equal ratios — scale by matching multipliers or cross-multiply. Direct proportion: both rise together. Inverse proportion: product is constant, one rises as the other falls.`,
    lessonSlug: 'ratio-proportion-averages',
    order: 1
  },
  {
    title: 'Averages & Mixtures',
    slug: 'averages-mixtures',
    description: 'The one equation — Total = Average × Count — and the replacement trick that turns every "someone left, someone joined" question into a one-liner.',
    explanation: `### The One Equation That Does Everything

Everyone knows "average = total ÷ count". But flip it — **the total is the real hero**:

> **Total = Average × Count**

If the average of 5 numbers is 40, the total is **200** — you can now work with the total and never touch the individual numbers. Nearly every averages question is a "total" question in disguise.

**Example — finding a missing number:** The average of 4 numbers is 25; three of them are 20, 30, 25. Find the fourth.

\`\`\`
Total (from average) = 4 × 25 = 100
Known three          = 20 + 30 + 25 = 75
Fourth number        = 100 − 75 = 25
\`\`\`

### The Replacement Trick (The Favourite Exam Pattern)

"When a member leaves and another joins, what's the new average?" — one idea: **the replacement only changes the total by the difference.**

**Example — the weight room:** The average weight of 5 students is 40 kg. One student weighing 50 kg leaves, and a new student weighing 45 kg joins. New average?

\`\`\`
Step 1 — Old total:     5 × 40 = 200 kg
Step 2 — Net change:    −50 + 45 = −5 kg
Step 3 — New total:     200 − 5 = 195 kg
Step 4 — New average:   195 ÷ 5 = 39 kg
\`\`\`

**The one-line shortcut:** a net change of −5 kg spread over 5 people = average drops by 1 kg → 39 kg. The change "spreads itself" evenly across the group.

### Averages of Mixed Groups (Weighted Average)

Two batches are merged. 20 students average 60 marks; 30 students average 70 marks. The combined average is NOT 65 — the bigger batch pulls harder. Compute with totals:

\`\`\`
Combined total = (20 × 60) + (30 × 70) = 1200 + 2100 = 3300
Combined count = 20 + 30 = 50
Combined average = 3300 ÷ 50 = 66
\`\`\`

66 is closer to 70 than to 60 — the 30-student batch "weighs" more. That's why it's called a **weighted average**.

### Mixtures — Weighted Averages in Disguise

Mixing two quantities is the same math: total value ÷ total amount.

**Example — the tea stall:** A shopkeeper mixes 5 kg of tea at ₹200/kg with 5 kg of tea at ₹300/kg. Cost of 1 kg of the mixture?

\`\`\`
Total cost   = (5 × 200) + (5 × 300) = 1000 + 1500 = ₹2500
Total amount = 5 + 5 = 10 kg
Mixture cost = 2500 ÷ 10 = ₹250 per kg
\`\`\`

Equal amounts → plain average (₹250). Unequal amounts → weighted average, bigger amount wins the pull.

### Common Traps

❌ **Forgetting the total** — "average of 5 is 40" is useless until you write 5 × 40 = 200. Always convert to totals first.
❌ **Averaging averages** — combining a 60-average batch of 20 with a 70-average batch of 30 is NOT (60+70)/2 = 65. Use totals.
❌ **Wrong sign on replacement** — a student who LEAVES removes their weight (subtract), a joiner adds theirs. Mixing up the sign flips the answer.
❌ **Dividing by the wrong count** — after a replacement, the count stays 5 (someone left, someone joined). Only the total changes.

### Quick Self-Test (answers at the bottom)

1. The average of 4 numbers is 25. What is their total? (a) 100  (b) 25  (c) 75  (d) 125
2. The average of 10 students' marks is 80. One student scoring 70 leaves and a new student scoring 90 joins. New average? (a) 81  (b) 82  (c) 80  (d) 84
3. The average weight of 5 students is 40 kg. A student leaves and the total weight falls by 10 kg. New average? (a) 39  (b) 38  (c) 41  (d) 40
4. The average of the first five natural numbers (1, 2, 3, 4, 5) is — (a) 3  (b) 2.5  (c) 3.5  (d) 5
5. A batch of 20 students averages 60 marks; a batch of 30 students averages 70. Combined average? (a) 65  (b) 66  (c) 67  (d) 64

**Answers:** 1→a (4 × 25), 2→b (net +20 over 10 people → +2 → 82), 3→b (−10 over 5 → −2 → 38), 4→a (15 ÷ 5 = 3), 5→b (3300 ÷ 50 = 66).

### Key Takeaway

Average = total ÷ count, but the workhorse is **Total = Average × Count**. Replacements only change the total by the net difference, spread evenly across the group. Mixed groups and mixtures are weighted averages — work with totals, and the "heavier" group pulls the result its way.`,
    lessonSlug: 'ratio-proportion-averages',
    order: 2
  },
  /* Time, Speed & Distance */
  {
    title: 'Basic TSD & Relative Speed',
    slug: 'basic-tsd-relative-speed',
    description: 'The magic triangle Distance = Speed × Time, the 36 km/h = 10 m/s unit anchor, and how fast the gap between two movers shrinks.',
    explanation: `### The Magic Triangle

Every question in this chapter lives inside ONE relationship:

> **Distance = Speed × Time** (D = S × T)

From it you can pull any piece:

\`\`\`
Distance = Speed × Time
Speed    = Distance ÷ Time
Time     = Distance ÷ Speed
\`\`\`

**Example — the road trip:** a car drives at 60 km/h for 3 hours. Distance = 60 × 3 = **180 km**. That's it — the whole formula is multiplication.

### The Unit Trap (Learn This First)

You cannot mix "km per hour" with "metres per second" — the numbers must speak the same language before you multiply.

| Convert | Method | Example |
|---|---|---|
| km/h → m/s | × 5/18 | 36 km/h = 36 × 5/18 = **10 m/s** |
| m/s → km/h | × 18/5 | 20 m/s = 20 × 18/5 = **72 km/h** |

**Memory anchor:** 36 km/h = 10 m/s is the pair to remember — everything else scales from it. 54 km/h = 15 m/s, 72 km/h = 20 m/s. If the problem mixes units, convert BEFORE doing anything else.

### Relative Speed — When Two Things Move at Once

This is the heart of the chapter. **Relative speed = how fast the gap between two movers is changing.**

**Case 1 — Moving TOWARD each other (opposite directions): speeds ADD.**

Two friends start from towns 100 km apart and cycle toward each other at 30 and 20 km/h. Every hour, the gap shrinks by 30 + 20 = **50 km** (both are closing it). Time to meet = 100 ÷ 50 = **2 hours**.

> **Time to meet = Distance between them ÷ (Sum of speeds)**

**Case 2 — Moving in the SAME direction (one chasing): speeds SUBTRACT.**

A car at 80 km/h chases a car at 60 km/h that is 40 km ahead. Every hour, the faster car gains 80 − 60 = **20 km** on the gap. Time to catch = 40 ÷ 20 = **2 hours**.

> **Time to catch = Gap ÷ (Difference of speeds)**

**The one-line rule:** opposite directions → add the speeds (they cooperate to close the gap). Same direction → subtract (only the difference matters).

### Worked Examples

**Example 1 — opposite directions:** Riya and Kabir are 150 km apart and ride toward each other at 20 and 30 km/h.

\`\`\`
Relative speed = 20 + 30 = 50 km/h
Time to meet   = 150 ÷ 50 = 3 hours
\`\`\`

Check: Riya covers 20 × 3 = 60 km, Kabir covers 30 × 3 = 90 km. 60 + 90 = 150 ✓.

**Example 2 — same direction:** a train at 90 km/h chases a scooter at 60 km/h that is 15 km ahead.

\`\`\`
Relative speed = 90 − 60 = 30 km/h
Time to catch  = 15 ÷ 30 = 0.5 hours = 30 minutes
\`\`\`

Check: in 30 min the train covers 45 km, the scooter 30 km — gap of 15 km closed ✓.

### Common Traps

❌ **Mixing units** — 54 km/h meets "300 m" and someone divides without converting. Convert first, always.
❌ **Adding speeds in the same direction** — chasers don't cooperate; only the difference closes the gap.
❌ **Forgetting to convert minutes to hours** — 30 minutes is 0.5 hours, not 30 hours.
❌ **Using the full distance for a chase** — in a same-direction chase, use the GAP, not the total road.

### Quick Self-Test (answers at the bottom)

1. A car travels 180 km in 3 hours. Its speed? (a) 60 km/h  (b) 54 km/h  (c) 90 km/h  (d) 45 km/h
2. Convert 36 km/h into m/s. (a) 10 m/s  (b) 12 m/s  (c) 8 m/s  (d) 15 m/s
3. Two cyclists 120 km apart ride toward each other at 25 and 35 km/h. When do they meet? (a) 3 hours  (b) 2 hours  (c) 1.5 hours  (d) 4 hours
4. A car at 80 km/h chases another at 60 km/h, 40 km ahead. Time to catch? (a) 2 hours  (b) 1 hour  (c) 4 hours  (d) 0.5 hours
5. How long does a 90 km trip take at 30 km/h? (a) 2 hours  (b) 3 hours  (c) 4 hours  (d) 1.5 hours

**Answers:** 1→a (180 ÷ 3), 2→a (36 × 5/18 = 10), 3→b (120 ÷ 60 = 2), 4→a (40 ÷ 20 = 2), 5→b (90 ÷ 30 = 3).

### Key Takeaway

D = S × T does everything. Convert units before any arithmetic (36 km/h = 10 m/s is your anchor). When two movers work TOGETHER against the gap (opposite directions) add speeds; when one chases the other (same direction) subtract. The gap and the closing speed decide the meeting time.`,
    lessonSlug: 'time-speed-distance',
    order: 1
  },
  {
    title: 'Boats, Streams & Trains',
    slug: 'boats-streams-trains',
    description: 'The river that helps or fights a boat, and the train that must pull its whole body through a platform — distance problems with a smarter distance.',
    explanation: `### Boats & Streams — The River, Friend or Enemy

A boat has its own speed in **still water** (no river). Add a river and everything changes: the current either **helps** the boat or **fights** it.

\`\`\`
Downstream (with the river) →  boat + stream   (the river pushes)
Upstream   (against the river) →  boat − stream   (the river pulls back)
\`\`\`

**Example — boat 15 km/h in still water, stream 5 km/h:**

\`\`\`
Downstream speed = 15 + 5 = 20 km/h
Upstream speed   = 15 − 5 = 10 km/h
\`\`\`

The difference is huge: the river doubles the effort upstream. If the stream is faster than the boat, the boat can't go upstream at all — the river wins.

**Derived classics (just in case):**

\`\`\`
Boat speed = (Downstream + Upstream) ÷ 2
Stream speed = (Downstream − Upstream) ÷ 2
\`\`\`

### Trains — The Whole Body Problem

A train is not a point. When a train "crosses" something, **the whole train must get through** — the nose enters first, and the tail must clear the exit.

\`\`\`
Distance to cross a platform  = Train length + Platform length
Distance to cross a person    = Train length only
\`\`\`

**Example — train 150 m long at 15 m/s crosses a platform 100 m long:**

\`\`\`
Total distance = 150 + 100 = 250 m
Time = 250 ÷ 15 = 16⅔ seconds
\`\`\`

**Why the platform adds?** The tail starts 150 m behind the nose. For the tail to reach the platform's far end, the nose must travel its own length PLUS the platform. A standing person (width ~0) adds nothing — the tail only needs to pass the person's position.

**Speed unit warning:** trains in aptitude questions usually give km/h but lengths in metres — convert the speed to m/s (× 5/18) first, then the division is clean.

### Worked Examples

**Example 1 — boat:** a boat takes 2 hours to cover 40 km downstream. Still-water speed? Stream = 5 km/h.

\`\`\`
Downstream speed = 40 ÷ 2 = 20 km/h
Boat speed = Downstream − Stream = 20 − 5 = 15 km/h
\`\`\`

**Example 2 — train:** a 120 m train at 72 km/h crosses a person. Time?

\`\`\`
Speed = 72 × 5/18 = 20 m/s
Distance = 120 m (person adds nothing)
Time = 120 ÷ 20 = 6 seconds
\`\`\`

### Common Traps

❌ **Forgetting the train's own length** — crossing a 100 m platform with a 150 m train needs 250 m, not 100 m. The tail must leave too.
❌ **Adding the platform for a person** — a standing person has negligible width; use only the train's length.
❌ **Mixing up downstream/upstream signs** — the stream ADDS when it helps (downstream) and SUBTRACTS when it fights (upstream).
❌ **Skipping the km/h → m/s conversion** — a "150 m" distance with a "54 km/h" speed only works after converting speed.

### Quick Self-Test (answers at the bottom)

1. A boat's still-water speed is 15 km/h; the stream flows at 5 km/h. Downstream speed? (a) 20 km/h  (b) 10 km/h  (c) 15 km/h  (d) 25 km/h
2. Same boat: upstream speed? (a) 20 km/h  (b) 10 km/h  (c) 15 km/h  (d) 5 km/h
3. A 150 m train crosses a 150 m platform at 20 m/s. Time taken? (a) 15 seconds  (b) 7.5 seconds  (c) 10 seconds  (d) 30 seconds
4. The time for a train to cross a standing person depends on — (a) the train's length only  (b) the platform's length only  (c) the sum of both  (d) the difference of both
5. Convert 54 km/h into m/s. (a) 18 m/s  (b) 15 m/s  (c) 12 m/s  (d) 10 m/s

**Answers:** 1→a (15 + 5), 2→b (15 − 5), 3→a (300 ÷ 20 = 15), 4→a, 5→b (54 × 5/18 = 15).

### Key Takeaway

Boats: downstream = boat + stream, upstream = boat − stream. Trains: add the platform to the train's length — the tail must clear the far end — and convert speed to m/s first. These two stories are just D = S × T with a smarter distance.`,
    lessonSlug: 'time-speed-distance',
    order: 2
  },
  /* Time & Work */
  {
    title: 'Work & Efficiency',
    slug: 'work-efficiency',
    description: 'The "1 job = 1 unit" trick — turn days into daily fractions, add them for teamwork, and flip the times to get efficiency ratios.',
    explanation: `### The One Idea That Solves Everything: "1 Job = 1 Unit"

A **piece of work** — painting a wall, packing boxes, digging a field — is always treated as **ONE unit of work**.

Now the golden move: if someone can complete 1 unit of work in \`d\` days, then in **one day** they complete:

> **Daily work = 1 ÷ d**  (read: "one over the number of days")

**Example:** A can paint the wall in 10 days → A paints **1/10 of the wall per day**. In 5 days, A paints 5 × 1/10 = 1/2 of the wall. Simple, and everything else is built on this.

| Person | Days alone | Work per day | In 4 days |
|---|---|---|---|
| A | 10 days | 1/10 | 4/10 = 2/5 |
| B | 15 days | 1/15 | 4/15 |
| A + B | ? | 1/10 + 1/15 = 1/6 | 4/6 = 2/3 |

### Working Together — Add the Daily Fractions

If A and B work together, they both add progress **every day**. So:

> **Combined daily work = (A's daily work) + (B's daily work)**
> **Days together = 1 ÷ Combined daily work**

**Worked example — A takes 10 days, B takes 15 days, together?**

\`\`\`
A's daily work  = 1/10
B's daily work  = 1/15
Combined        = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6
Days together   = 1 ÷ (1/6) = 6 days
\`\`\`

Two people together are ALWAYS faster than either alone — the combined days (6) is less than both 10 and 15. If your answer is ever bigger than both individual times, you made a mistake.

### The LCM Method — The Exam Shortcut (Learn This!)

Fractions like 1/12 and 1/18 are annoying. The LCM method replaces them with whole numbers:

1. Take the **LCM of all the days** — call it the total work in "units".
2. **One day's work of each person = LCM ÷ their days.**
3. **Days together = Total units ÷ Units done per day together.**

**Worked example — A takes 12 days, B takes 18 days, together?**

\`\`\`
Step 1:  LCM(12, 18) = 36 units of total work
Step 2:  A does 36 ÷ 12 = 3 units/day
         B does 36 ÷ 18 = 2 units/day
Step 3:  Together = 3 + 2 = 5 units/day
Step 4:  Days = 36 ÷ 5 = 7.2 days (7⅕ days)
\`\`\`

No fractions anywhere — just 36, 3, 2, 5. This is the method to use in the exam. (Check: 1/12 + 1/18 = 5/36, so days = 36/5 ✓ same answer.)

### Finding One Person's Time When You Know the Combined Time

Sometimes you're given the combined time and one person's time, and asked for the other's:

> **B's daily work = Combined daily work − A's daily work**
> **B's days = 1 ÷ B's daily work**

**Worked example — A and B together finish in 4 days; A alone takes 12 days. B alone?**

\`\`\`
Combined daily work = 1/4
A's daily work      = 1/12
B's daily work      = 1/4 − 1/12 = 3/12 − 1/12 = 2/12 = 1/6
B's days            = 1 ÷ (1/6) = 6 days
\`\`\`

B alone takes 6 days — faster than A, because B contributes more of the combined speed. Makes sense.

### Efficiency — How Fast Each Person Works

**Efficiency is the amount of work done per day** (that's the "daily work" fraction we've been using, or the units/day in the LCM method).

The key relation to remember:

> **Time and efficiency are INVERSELY proportional.** If A takes half the time B takes, A is twice as efficient.

If A takes \`a\` days and B takes \`b\` days, then:

> **A : B efficiency = b : a**  (flip the times!)

**Worked example — A takes 9 days, B takes 12 days. Efficiency ratio?**

\`\`\`
A : B efficiency = 12 : 9 = 4 : 3
\`\`\`

A is 4/3 times as efficient as B. ✓ (Check with LCM(9,12)=36: A does 4/day, B does 3/day — exactly 4 : 3.)

**When money is shared** (wages for a completed job), it is split **in the ratio of efficiencies** — the person who contributed more work gets more money.

### Working Together with People Joining / Leaving

A classic twist: one person starts, another joins mid-way, or someone leaves before the end.

**Worked example — A alone can finish in 20 days. After A works for 8 days, B joins. Together they finish the rest in 6 more days. B alone would take how many days?**

\`\`\`
Step 1:  A's daily work = 1/20
Step 2:  In 8 days A does 8 × 1/20 = 8/20 = 2/5 of the work
Step 3:  Remaining = 1 − 2/5 = 3/5, done in 6 days by A + B
Step 4:  Combined daily work = (3/5) ÷ 6 = 3/30 = 1/10
Step 5:  B's daily work = 1/10 − 1/20 = 1/20
Step 6:  B alone = 20 days
\`\`\`

Whenever work happens in stages, handle the stages one at a time: work done = daily work × days, and subtract completed work from 1 unit.

### The "A Does X Days, Then B Finishes" Family

These are the most common exam variations. The universal tool is the same:

> **Work done = Daily work × Days worked**  … and total work always adds up to **1**.

**Type 1 — Different start times:** A starts, B joins later.
**Type 2 — One quits early:** A works every day, B leaves after some days.
**Type 3 — Alternate days:** A works day 1, B works day 2, repeat. (Work in 2-day pairs, then handle leftovers.)

**Example — alternate days:** A takes 10 days alone, B takes 15 days alone. If they work on alternate days starting with A, when is the work done?

\`\`\`
LCM(10, 15) = 30 units.  A does 3/day, B does 2/day.
2-day pair: A then B → 3 + 2 = 5 units every 2 days.
After 5 pairs (10 days): 25 units done, 5 units left.
Day 11 (A): +3 → 28 units, 2 left.
Day 12 (B): +2 → 30 units DONE.
Total = 12 days.
\`\`\`

Pair the days first — it keeps the bookkeeping clean.

### Common Traps

❌ **Adding the days directly** — "A takes 10, B takes 15, together 10 + 15 = 25" is WRONG. People working together are *faster*, so the answer must be *less* than each individual time. Always add the *fractions* (or use LCM units), never the days.
❌ **Forgetting to flip in efficiency questions** — A takes 9 days, B takes 12 days → efficiency A:B = 12:9, NOT 9:12. Flip the times.
❌ **Subtracting the wrong way in "find the other person"** — B's daily work = combined − A's. If the subtraction gives a negative number, the data is impossible (together they can't be slower than A alone).
❌ **Ignoring "of the remaining work"** — when a fraction is completed first, subtract it from 1 unit *before* computing the rest. Answering with "days for the whole job" when only part remains is the #1 mark-loser.
❌ **Rounding 36/5 to 7 in an exam** — 7.2 days means 7 full days plus 1/5 of a day. In multiple-choice questions the options will distinguish 7.2 from 7 — be exact.

### Quick Self-Test (answers at the bottom)

1. A can do a job in 6 days, B in 8 days. Together they take — (a) 14 days  (b) 3 3/7 days  (c) 7 days  (d) 4 days
2. A and B together finish in 4 days; A alone takes 12 days. B alone takes — (a) 6 days  (b) 8 days  (c) 9 days  (d) 16 days
3. A takes 9 days, B takes 12 days. A : B efficiency = ? (a) 9 : 12  (b) 4 : 3  (c) 3 : 4  (d) 12 : 9
4. A does 2/5 of a job in 4 days. The whole job takes A — (a) 8 days  (b) 10 days  (c) 12 days  (d) 20 days
5. Three people A, B, C take 6, 8, 12 days respectively. All three together take — (a) 2 days  (b) 2 2/3 days  (c) 3 days  (d) 4 1/3 days

**Answers:** 1→b (LCM 24 → 4+3=7/day → 24/7 = 3 3/7), 2→a (1/4 − 1/12 = 1/6 → 6 days), 3→b (flip: 12 : 9 = 4 : 3), 4→b (2/5 in 4 days → 1/5 per 2 days → 5/5 in 10 days), 5→b (LCM 24 → 4+3+2=9/day → 24/9 = 2 2/3).

### Key Takeaway

**Turn days into daily fractions (or LCM units), add them for people working together, subtract for finding a single person, and always keep the total work = 1 unit.** Efficiency is the inverse of time — flip the ratio. Work in stages, subtract what's done, and never add days directly.`,
    lessonSlug: 'time-work',
    order: 1
  },
  {
    title: 'Pipes & Cisterns',
    slug: 'pipes-cisterns',
    description: 'The same chapter in a plumbing costume — filling pipes add, leaks and emptying pipes subtract, and a net rate of zero means the tank never fills.',
    explanation: `### The Same Chapter in Disguise

Pipes & Cisterns is **Time & Work wearing a plumbing costume**. A pipe filling a tank is a worker doing *positive* work. A leak (or an emptying pipe) is a worker doing *negative* work — undoing progress.

| Time & Work | Pipes & Cisterns |
|---|---|
| Person completes 1 job in \`d\` days | Pipe fills 1 tank in \`d\` hours |
| Daily work = 1/d | Fill rate = 1/d per hour |
| Two people add their work | Two filling pipes add their rates |
| Someone quits / slows down | A leak or outlet pipe *subtracts* |

So every formula from Work & Efficiency transfers directly — just swap "days" for "hours" and "people" for "pipes".

### The Golden Rule: Filling is +, Emptying is −

> **Net rate = (sum of filling rates) − (sum of emptying rates)**
> **Time to fill = 1 ÷ Net rate**

**The bucket analogy:** imagine a bucket with a tap pouring water in and a hole leaking water out. The water level rises only at the speed of (tap − hole). If the hole drains faster than the tap pours, the bucket never fills — it empties!

**Worked example — pipe fills in 6 hours, leak empties the full tank in 12 hours. Time to fill with both open?**

\`\`\`
Fill rate   = 1/6 of the tank per hour
Leak rate   = 1/12 of the tank per hour  (it empties a FULL tank in 12 h)
Net rate    = 1/6 − 1/12 = 2/12 − 1/12 = 1/12 per hour
Time to fill = 1 ÷ (1/12) = 12 hours
\`\`\`

The leak halves the effective speed, so the tank takes twice as long (12 h instead of 6 h). Always sensible: a leak can only slow a fill down, never speed it up.

### The LCM Method Works Here Too

Same trick as Work & Efficiency — use the LCM of the times as the tank size in litres:

**Worked example — pipe A fills in 4 hours, pipe B fills in 6 hours. Both open, time to fill?**

\`\`\`
Step 1:  LCM(4, 6) = 12 litres (call the tank 12 L)
Step 2:  A fills 12 ÷ 4 = 3 L/h
         B fills 12 ÷ 6 = 2 L/h
Step 3:  Together = 3 + 2 = 5 L/h
Step 4:  Time = 12 ÷ 5 = 2.4 hours
\`\`\`

Check with fractions: 1/4 + 1/6 = 5/12 → time = 12/5 = 2.4 h ✓

### Mixed Fill and Empty Pipes

When a pipe fills and another empties simultaneously, the **emptying rate still subtracts**:

**Worked example — pipe A fills in 5 hours, pipe B empties in 10 hours. Tank starts empty, both opened. Fill time?**

\`\`\`
A's fill rate  = 1/5 per hour
B's drain rate = 1/10 per hour
Net rate       = 1/5 − 1/10 = 2/10 − 1/10 = 1/10 per hour
Time to fill   = 10 hours
\`\`\`

The emptying pipe works at half the speed of the filling pipe, so it doubles the fill time. If the emptying pipe were faster (say it empties in 4 hours while the fill pipe takes 5), the net rate would be 1/5 − 1/4 = −1/20 — **negative** — and the tank would never fill.

### The "Leak Empties a Full Tank in X" Trap

Pay attention to what the leak time refers to: a leak that **empties a full tank in 12 hours** drains 1/12 of a tank per hour. That's the absolute rate we subtract. Some questions instead give "the leak alone would empty the tank in 12 hours **if the filling pipe were closed**" — same thing, same 1/12 per hour. What you must never do is treat the leak as *positive* work. A leak is always subtracted.

### Filling a Partially-Filled Tank

**Worked example — a tank is 1/3 full. A pipe fills it in 6 hours. How long to fill the remaining 2/3?**

\`\`\`
Fill rate = 1/6 per hour
Remaining = 1 − 1/3 = 2/3 of the tank
Time = (2/3) ÷ (1/6) = (2/3) × 6 = 4 hours
\`\`\`

Only the *remaining* fraction matters — the pipe doesn't need to re-do the water that's already there.

### Common Traps

❌ **Adding the leak instead of subtracting** — a leak *undoes* work. 1/6 + 1/12 gives a wrong (faster) answer; the correct net is 1/6 − 1/12. When in doubt, ask: "does this pipe make the water level go up or down?"
❌ **Treating "empties in 12 h" as a fill rate** — an emptying pipe is always negative, even though its number looks like a normal time.
❌ **Using the full tank when it's part-filled** — compute the fill time for the *remaining* fraction only.
❌ **Forgetting that a leak can prevent filling entirely** — if the net rate is zero or negative, the tank never fills; some options are "never", and that's a real answer.
❌ **Mixing units** — if the fill time is in hours and the leak time in minutes, convert first. Rates must share one unit.

### Quick Self-Test (answers at the bottom)

1. A pipe fills a tank in 6 hours; a leak empties it in 12 hours. With both open, the fill time is — (a) 4 h  (b) 6 h  (c) 12 h  (d) 18 h
2. Pipe A fills in 4 h, pipe B fills in 6 h. Both open, fill time? (a) 2.4 h  (b) 2.5 h  (c) 3 h  (d) 5 h
3. A fills in 10 h, a leak empties in 15 h. Both open, fill time? (a) 15 h  (b) 20 h  (c) 30 h  (d) 25 h
4. A fills in 5 h, B empties in 10 h. Tank empty, both open. Result? (a) Fills in 5 h  (b) Fills in 10 h  (c) Fills in 15 h  (d) Never fills
5. A tank is 1/3 full. A pipe fills it in 6 h. Time to fill the rest? (a) 2 h  (b) 4 h  (c) 6 h  (d) 9 h

**Answers:** 1→c (1/6 − 1/12 = 1/12 → 12 h), 2→a (LCM 12 → 3+2=5 L/h → 12/5 = 2.4 h), 3→c (1/10 − 1/15 = 1/30 → 30 h), 4→b (1/5 − 1/10 = 1/10 → 10 h), 5→b ((2/3) ÷ (1/6) = 4 h).

### Key Takeaway

**Pipes & Cisterns is Work & Efficiency with signs: filling pipes add, emptying pipes and leaks subtract.** Net rate = fills − empties, and time = 1 ÷ net rate. Use the LCM trick for whole-number speed, only fill the *remaining* fraction, and remember a net rate of zero or negative means the tank never fills.`,
    lessonSlug: 'time-work',
    order: 2
  },
  /* Simple & Compound Interest */
  {
    title: 'Simple Interest',
    slug: 'simple-interest',
    description: 'The rent for using money, charged on the original principal every year — the straight-line growth of SI = (P × R × T) ÷ 100.',
    explanation: `### The Bank's Vocabulary (Four Words, One Story)

Every interest question uses exactly four ideas:

| Word | Meaning | Example |
|---|---|---|
| **Principal (P)** | The original money borrowed or deposited | ₹5,000 |
| **Rate (R)** | The yearly rent, as a percentage of the principal | 8% per annum |
| **Time (T)** | How long the money is used, measured in YEARS | 3 years |
| **Interest (SI)** | The total rent paid for using the money | ₹1,200 |

**The core idea:** the bank charges **8% of the principal** every single year. Year 1 → ₹400. Year 2 → ₹400. Year 3 → ₹400. The rent never changes, because it is always computed on the original ₹5,000 — never on the growing balance.

### The Formula (One Formula, Three Letters)

> **SI = (P × R × T) ÷ 100**

And the final amount you pay back:

> **Amount (A) = P + SI**

**Example — ₹5,000 at 8% for 3 years:**

\`\`\`
SI = (5000 × 8 × 3) ÷ 100
   = 120000 ÷ 100
   = ₹1,200

Amount = 5000 + 1200 = ₹6,200
\`\`\`

**Why ÷ 100?** R is a percentage (out of 100), so P × R × T gives the answer in "percentage units" — dividing by 100 converts it back to rupees.

### The Time Conversion Table (Get This Right First)

The formula wants T in **years**. Exam questions love hiding the time in other units:

| Given time | Convert to years | Example |
|---|---|---|
| 1 year | 1 | — |
| 6 months | 0.5 | 1/2 year |
| 18 months | 1.5 | 1½ years |
| 2 years 4 months | 2 + 4/12 | 2⅓ years |
| 73 days | 73 ÷ 365 | 1/5 year |
| 146 days | 146 ÷ 365 | 2/5 year |

**Memory anchor:** months → divide by 12. Days → divide by 365 (unless the question says a 360-day year).

### The Rate Multiplier Table (Read SI the Fast Way)

SI per year = P × (R/100). So the yearly rent is instantly:

| Rate (R) | Yearly interest on ₹1,000 | Yearly interest on ₹5,000 |
|---|---|---|
| 5% | ₹50 | ₹250 |
| 8% | ₹80 | ₹400 |
| 10% | ₹100 | ₹500 |
| 12% | ₹120 | ₹600 |
| 15% | ₹150 | ₹750 |

Look how linear it is: every year adds the SAME amount. That straight-line growth is the fingerprint of simple interest.

### The Five Ways to Use One Formula

SI = P×R×T/100 has four letters — any three give you the fourth. The table shows each case:

| You know | You want | Formula | Example |
|---|---|---|---|
| P, R, T | SI | (P×R×T)/100 | ₹5,000 @ 8% × 3 yr → ₹1,200 |
| P, R, T | Amount | P + SI | ₹5,000 → ₹6,200 |
| P, T, SI | R | (SI × 100)/(P×T) | SI ₹1,200, P ₹5,000, T 3 → R = 8% |
| P, R, SI | T | (SI × 100)/(P×R) | SI ₹1,200, P ₹5,000, R 8 → T = 3 yr |
| R, T, SI | P | (SI × 100)/(R×T) | SI ₹1,200, R 8, T 3 → P = ₹5,000 |

**Example — finding the rate:** a sum of ₹4,000 earns ₹800 in 2 years. Rate?

\`\`\`
R = (800 × 100) ÷ (4000 × 2) = 80000 ÷ 8000 = 10%
\`\`\`

Check: 10% of 4,000 = 400 per year × 2 years = 800 ✓.

### The Year-by-Year Picture (Why It's "Simple")

Follow ₹1,000 at 10% simple interest, year after year:

| Year | Balance at start | Interest that year (10% of P) | Balance at end |
|---|---|---|---|
| 1 | ₹1,000 | ₹100 | ₹1,100 |
| 2 | ₹1,100 | ₹100 | ₹1,200 |
| 3 | ₹1,200 | ₹100 | ₹1,300 |
| 4 | ₹1,300 | ₹100 | ₹1,400 |

The interest column is frozen at ₹100 forever — always 10% of the ORIGINAL ₹1,000. Every year is identical. (Keep this table in your head; the compound table next is its evil twin.)

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Time not in years | 6 months used as "6" | Divide months by 12 |
| Rate as a decimal | "8" used as 0.08 in the ÷100 formula | Either use 8 with ÷100, or 0.08 without |
| Adding rent to the wrong base | Computing 8% of the new balance | SI is ALWAYS on the original P |
| Confusing SI and Amount | Reporting ₹1,200 instead of ₹6,200 | Read "interest" vs "amount" in the question |

### Quick Self-Test (answers at the bottom)

1. Simple interest on ₹5,000 at 8% per annum for 3 years? (a) ₹1,200  (b) ₹1,500  (c) ₹1,000  (d) ₹1,800
2. Simple interest on ₹2,000 at 5% per annum for 2 years? (a) ₹100  (b) ₹200  (c) ₹300  (d) ₹400
3. A sum becomes ₹1,100 after 1 year at 10% simple interest. The principal was — (a) ₹1,000  (b) ₹990  (c) ₹1,100  (d) ₹900
4. In simple interest, the interest earned each year is — (a) the same every year  (b) increasing every year  (c) decreasing every year  (d) zero after the first year
5. The amount on ₹4,000 at 5% per annum for 2 years (simple) is — (a) ₹4,400  (b) ₹4,200  (c) ₹4,000  (d) ₹4,500

**Answers:** 1→a (5000×8×3/100 = 1200), 2→b (2000×5×2/100 = 200), 3→a (1100 ÷ 1.10), 4→a, 5→a (SI 400 + P 4000).

### Key Takeaway

SI = (P × R × T) ÷ 100, with time in years and R as the plain number. The interest is the same every year because it is always a slice of the original principal. Master the "five ways" table and any SI question is a one-line substitution.`,
    lessonSlug: 'simple-compound-interest',
    order: 1
  },
  {
    title: 'Compound Interest',
    slug: 'compound-interest',
    description: 'The snowball — interest on interest. Amount = P × (1 + R/100)^T, and the CI − SI difference that exams love.',
    explanation: `### The Snowball Story

Compound interest is interest on interest. Every year, the bank charges the rate on **whatever you currently owe** — and since you owe more each year, the rent itself grows. It's a snowball: the bigger it gets, the faster it grows.

**Example — ₹1,000 at 10% for 2 years:**

\`\`\`
Year 1:  1000 × 1.10 = 1100      (interest ₹100)
Year 2:  1100 × 1.10 = 1210      (interest ₹110 — on ₹1,100, not ₹1,000!)

CI = 1210 − 1000 = ₹210
\`\`\`

The second year earns ₹110 instead of ₹100 — the extra ₹10 is "interest on interest." Tiny at first, enormous over decades.

### The Formula

> **Amount = P × (1 + R/100)^T**
> **CI = Amount − P**

**Why (1 + R/100)?** One year at 10% multiplies the money by 1.10 — that's your multiplier from the Percentages chapter, reused here. Two years multiplies twice: 1.10 × 1.10 = 1.21. The exponent just counts how many years the snowball rolls.

### The Year-by-Year Picture (Compare with the SI Table!)

The same ₹1,000 at 10%, now compounded:

| Year | Balance at start | Interest that year (10% of balance) | Balance at end |
|---|---|---|---|
| 1 | ₹1,000 | ₹100 | ₹1,100 |
| 2 | ₹1,100 | ₹110 | ₹1,210 |
| 3 | ₹1,210 | ₹121 | ₹1,331 |
| 4 | ₹1,331 | ₹133.10 | ₹1,464.10 |

Compare with the simple table above — same money, same rate, same years. The interest column here climbs: 100, 110, 121, 133.10. That climbing column is the entire difference between the two chapters.

### SI vs CI — The Head-to-Head Table

| Year | Balance with SI (10%) | Balance with CI (10%) | Who is ahead? |
|---|---|---|---|
| 1 | ₹1,100 | ₹1,100 | Tie |
| 2 | ₹1,200 | ₹1,210 | CI by ₹10 |
| 3 | ₹1,300 | ₹1,331 | CI by ₹31 |
| 4 | ₹1,400 | ₹1,464.10 | CI by ₹64.10 |

Year 1 is a tie — interest hasn't had anything to roll over yet. From year 2 on, CI pulls ahead, and the gap widens every year. That gap is the **CI − SI difference**, the most asked question in this chapter.

### The CI − SI Difference Formulas (The Exam's Favourite)

| Time | CI − SI (with P and R) | Example: P = 10,000, R = 10% |
|---|---|---|
| 2 years | P × (R/100)² | 10000 × 0.1² = **₹100** |
| 3 years | P × (R/100)² × (3 + R/100) | 10000 × 0.01 × 3.1 = **₹310** |

**2-year check with ₹10,000 at 10%:**

\`\`\`
CI = 10000 × 1.21 − 10000 = 12100 − 10000 = ₹2,100
SI = (10000 × 10 × 2) / 100 = ₹2,000
Difference = ₹100 ✓
\`\`\`

The formula P × (R/100)² is the 10-second version — it's literally "the interest on the first year's interest."

### The Multiplier Table (Memorise These Three Rows)

| Rate | 1-year multiplier | 2-year multiplier | 3-year multiplier |
|---|---|---|---|
| 5% | 1.05 | 1.1025 | 1.1576 |
| 10% | 1.10 | 1.21 | 1.331 |
| 20% | 1.20 | 1.44 | 1.728 |

A 2-year question at 10% is then just: Amount = P × **1.21**. No exponent needed — the table did the work.

### Compounding More Often Than Yearly

| Frequency | Adjust the rate | Adjust the time | Formula |
|---|---|---|---|
| Yearly | R | T | P × (1 + R/100)^T |
| Half-yearly | R/2 | 2T | P × (1 + R/200)^(2T) |
| Quarterly | R/4 | 4T | P × (1 + R/400)^(4T) |

**Example — ₹5,000 at 10% compounded half-yearly for 1 year:**

\`\`\`
Amount = 5000 × (1 + 0.05)² = 5000 × 1.1025 = ₹5,512.50
CI = ₹512.50 (more than the yearly ₹500 — frequent compounding earns more)
\`\`\`

### Worked Examples

**Example 1 — plain CI:** CI on ₹8,000 at 10% for 2 years?

\`\`\`
Amount = 8000 × 1.21 = ₹9,680
CI = 9680 − 8000 = ₹1,680
\`\`\`

Check: year 1 interest 800, year 2 interest 880 → total 1,680 ✓.

**Example 2 — difference:** CI − SI on ₹12,000 at 20% for 2 years?

\`\`\`
Formula: P × (R/100)² = 12000 × 0.04 = ₹480
Check: CI = 12000 × 1.44 − 12000 = 17280 − 12000 = 5280
      SI = 12000 × 0.2 × 2 = 4800
      Difference = 5280 − 4800 = 480 ✓
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Adding the rate years | "10% for 2 years = 20%" | Multiply multipliers: 1.1 × 1.1 = 1.21 |
| Computing CI like SI | Same interest both years | Year 2 interest is on year 2's opening balance |
| Forgetting to subtract P | Reporting Amount as CI | CI = Amount − P, always |
| Half-yearly confusion | Halving time instead of rate | Half-yearly: rate ÷ 2 AND time × 2 |
| Using the 2-year formula for 3 years | Wrong difference | 3 years: P(R/100)²(3 + R/100) |

### Quick Self-Test (answers at the bottom)

1. Compound interest on ₹10,000 at 10% per annum for 2 years? (a) ₹2,100  (b) ₹2,000  (c) ₹1,210  (d) ₹1,000
2. Compound interest on ₹5,000 at 20% per annum for 2 years? (a) ₹2,400  (b) ₹2,200  (c) ₹2,000  (d) ₹1,800
3. The difference between CI and SI on ₹10,000 at 10% per annum for 2 years? (a) ₹200  (b) ₹100  (c) ₹1,000  (d) ₹210
4. For the same principal, rate and time (more than 1 year), compound interest is — (a) always more than SI  (b) always less than SI  (c) equal to SI  (d) equal to half of SI
5. On ₹1,000 at 10% compounded yearly, the interest earned in the SECOND year is — (a) ₹110  (b) ₹100  (c) ₹121  (d) ₹210

**Answers:** 1→a (12100 − 10000), 2→b (5000 × 1.44 − 5000 = 2200), 3→b (10000 × 0.1² = 100), 4→a, 5→a (10% of the year-2 opening balance 1,100).

### Key Takeaway

Compound interest is the snowball: Amount = P × (1 + R/100)^T, and every year's interest is the rate times THAT year's balance. After year 1, CI beats SI, and the difference for 2 years is exactly P × (R/100)². Memorise the multiplier table, halve the rate and double the time for half-yearly, and the chapter writes itself.`,
    lessonSlug: 'simple-compound-interest',
    order: 2
  },
  /* Permutations, Combinations & Probability */
  {
    title: 'Permutations & Combinations',
    slug: 'permutations-combinations',
    description: 'Counting fast — multiply the choices, and divide when order doesn\'t matter. Arranging books, picking teams, and words with repeated letters.',
    explanation: `### What This Chapter Is About

Counting — fast. How many ways can 3 books be arranged on a shelf? How many ways can a team of 2 be picked from 4 friends? Instead of writing every option down, we multiply. Two rules do everything:

1. **Choices multiply.**
2. **When order doesn't matter, divide by the shuffles.**

### Rule 1: Choices Multiply

You are picking a shirt AND pants. 3 shirts, 2 pants. Every shirt works with every pants:

| Shirts | Pants | Outfits |
|---|---|---|
| 3 | × 2 | = 6 |
| 4 | × 3 | = 12 |
| 2 | × 2 | = 4 |

Multiply the choices at every step. That's the whole engine of this chapter — every formula below is just this rule in a costume.

### Rule 2: Factorial — "Multiply n Down to 1"

**3! (read "three factorial") = 3 × 2 × 1 = 6.** The exclamation mark means: multiply every number from n down to 1.

What does it count? **Arranging things where order matters.**

**Example — 3 friends (A, B, C) stand in a queue:**

| Position | Choices left | Why |
|---|---|---|
| 1st | 3 | any of the 3 friends |
| 2nd | 2 | one is already first |
| 3rd | 1 | only one remains |
| **Total** | **3 × 2 × 1 = 6** | six different queues |

| n | n! | Easy way to think |
|---|---|---|
| 1! | 1 | 1 thing, 1 way |
| 2! | 2 | 2 books: 2 orders |
| 3! | 6 | 3 friends: 6 queues |
| 4! | 24 | 4 books: 24 shelves |
| 5! | 120 | 5 letters: 120 words |

### Arranging = Fill the Slots, Each Time One Less Choice

**Example — 4 different books on a shelf:**

\`\`\`
4 × 3 × 2 × 1 = 24 ways
\`\`\`

**Example — arrange only 2 of the 4 books:**

\`\`\`
First slot:  4 books to choose from
Second slot: 3 books left
Total:       4 × 3 = 12 ways
\`\`\`

That's all a "permutation" is — filling slots where order matters, with one fewer choice each step. The fancy formula (nPr) is just this idea written longhand; you never need it if you multiply the slots.

### Choosing = Arrange First, Then Undo the Shuffling

Picking a team of 3 from 5 friends. Now the order does NOT matter — team (A, B, C) is the same team as (B, C, A).

**Step 1 — pretend order matters:** 5 × 4 × 3 = 60 ways.

**Step 2 — notice the problem:** the same 3 people were counted many times. The team A, B, C also appeared as A, C, B, as B, A, C… a team of 3 can be shuffled 3 × 2 × 1 = 6 ways. So every team was counted 6 times.

**Step 3 — undo the shuffling:** 60 ÷ 6 = **10 teams**.

| You want | Order matters? | What to do | Answer |
|---|---|---|---|
| Arrange 4 books | Yes | 4 × 3 × 2 × 1 | 24 |
| Arrange 2 of 4 books | Yes | 4 × 3 | 12 |
| Pick 3 from 5 | No | (5 × 4 × 3) ÷ (3 × 2 × 1) | 10 |
| Pick 2 from 4 | No | (4 × 3) ÷ (2 × 1) | 6 |

### The Repeats Trick (Words)

All different letters → just multiply. Repeated letters → **divide by their shuffles**.

**Example — "BOOK":** 4 letters, so 4! = 24. But the two O's are the same letter — swapping them makes no new word. Divide by 2! (the O's shuffles): 24 ÷ 2 = **12**.

| Word | Letters | The trick | Answer |
|---|---|---|---|
| CAT | 3 different | 3! | 6 |
| BOOK | 4, two O's | 4! ÷ 2! | 12 |
| LEVEL | 5, L and E each twice | 5! ÷ (2! × 2!) | 30 |
| BANANA | 6, A three times, N twice | 6! ÷ (3! × 2!) | 60 |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Order? | Team counted 6 times | If swapping changes nothing → divide by the shuffles |
| Repeated letters | "BOOK" answered 24 | Divide by the repeats' factorial |
| Zero factorial | 0! called "0" | 0! = 1 — just remember it |

### Quick Self-Test (answers at the bottom)

1. The value of 5! is — (a) 120  (b) 60  (c) 100  (d) 24
2. In how many ways can 3 different books be arranged on a shelf? (a) 3  (b) 6  (c) 9  (d) 12
3. How many ways to choose 2 students from a group of 4? (a) 12  (b) 8  (c) 6  (d) 4
4. The number of arrangements of the letters of "BOOK" is — (a) 12  (b) 24  (c) 8  (d) 6
5. How many arrangements of 4 different letters? (a) 12  (b) 16  (c) 24  (d) 8

**Answers:** 1→a, 2→b (3 × 2 × 1), 3→c ((4 × 3) ÷ (2 × 1) = 6), 4→a (24 ÷ 2), 5→c (4!).

### Key Takeaway

Multiply the choices. Arrange = multiply the slots down (4 × 3 × 2 × 1). Choose = multiply, then divide by the shuffles. Same letters = divide by their shuffles too. Ask one question first: **does order matter?**`,
    lessonSlug: 'permutations-combinations-probability',
    order: 1
  },
  {
    title: 'Basic Probability',
    slug: 'basic-probability',
    description: 'Good outcomes ÷ all outcomes — one fraction runs the whole subject, over three worlds: coins, dice and cards.',
    explanation: `### The One-Line Idea

> **Probability = the good outcomes ÷ all the outcomes.**

**Example — toss a coin:** all outcomes = 2 (heads, tails). Good outcomes = 1 (heads). Probability of heads = **1 ÷ 2 = 1/2**.

That's it. Every probability question is just this fraction — count the good ones, count everything, divide.

### What the Number Means (The Dial)

A probability is always between 0 and 1:

| Value | What it means | Example |
|---|---|---|
| 0 | Never happens | Rolling a 7 on a normal die |
| 1/4 | Happens sometimes | Drawing a face card |
| 1/2 | Half the time | Heads in a toss |
| 3/4 | Happens most times | NOT drawing a face card |
| 1 | Always happens | The sun rising tomorrow |

### The Three Worlds (Know These Counts)

| World | All outcomes | Memory |
|---|---|---|
| Coin | 2 | heads, tails |
| Die | 6 | 1, 2, 3, 4, 5, 6 |
| Deck of cards | 52 | 4 suits × 13 cards |

**Die questions:**

| Question | Good outcomes | Probability |
|---|---|---|
| Roll a 3 | 1 | 1/6 |
| Roll an even number | 3 (2, 4, 6) | 3/6 = 1/2 |
| Roll 5 or 6 | 2 | 2/6 = 1/3 |

**Card questions:**

| Question | Good outcomes | Probability |
|---|---|---|
| Draw a king | 4 (one per suit) | 4/52 = 1/13 |
| Draw a heart | 13 | 13/52 = 1/4 |
| Draw a red card | 26 | 26/52 = 1/2 |

### The Recipe (Always 4 Steps)

\`\`\`
Step 1 — All outcomes:    coin 2, die 6, deck 52
Step 2 — Good outcomes:   read the question carefully
Step 3 — Divide:          good ÷ all
Step 4 — Simplify:        cut the fraction down
\`\`\`

**Example — probability of a king:**

\`\`\`
All outcomes = 52
Good outcomes = 4 kings
P = 4 ÷ 52 = 1/13
\`\`\`

### The "Not" Shortcut

The opposite of an event is easy: **P(not) = 1 − P**.

If drawing a face card has probability 1/4, then NOT drawing one has probability 1 − 1/4 = **3/4**. No counting needed — just take what's left.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Not simplifying | Answer left as 4/52 | Cut it down: 1/13 |
| Counting wrong good ones | Kings counted as 1 | 4 kings, one per suit |
| Probability above 1 | "Good" bigger than "all" | Impossible — recount |

### Quick Self-Test (answers at the bottom)

1. The probability of heads in a coin toss? (a) 1/2  (b) 1  (c) 1/4  (d) 2/3
2. A die is rolled. Probability of getting a 3? (a) 1/6  (b) 1/3  (c) 1/2  (d) 1/4
3. A card is drawn from 52. Probability of a king? (a) 1/52  (b) 1/13  (c) 1/26  (d) 1/4
4. Probability of NOT getting heads in a coin toss? (a) 1/4  (b) 1/2  (c) 0  (d) 2/3
5. Probability of an even number on a die? (a) 1/6  (b) 1/3  (c) 1/2  (d) 2/3

**Answers:** 1→a, 2→a, 3→b (4 ÷ 52), 4→b (1 − 1/2), 5→c (3 ÷ 6).

### Key Takeaway

Probability = good outcomes ÷ all outcomes, always between 0 and 1. Count the world (coin 2, die 6, deck 52), count the good ones, divide and simplify. For "not" questions, use 1 − P.`,
    lessonSlug: 'permutations-combinations-probability',
    order: 2
  },
  /* Algebra, Equations & Mensuration */
  {
    title: 'Linear & Quadratic Equations',
    slug: 'linear-quadratic-equations',
    description: 'The balanced scale — translate the story with the word table, solve in three steps, and build a now/then table for ages problems.',
    explanation: `### What Is an Equation? (The Simple Idea)

An equation says: **the two sides balance, like a weighing scale.** The unknown number is called **x**.

**Example — "twice a number plus 5 equals 21":**

\`\`\`
2x + 5 = 21
\`\`\`

The scale: whatever is on the left weighs the same as the right. To find x, we do the same thing to both sides until x stands alone.

### The Story → Math Translator (Memorise These)

Most of algebra is just translating English into math:

| English | Math |
|---|---|
| a number | x |
| is / equals | = |
| twice / double | × 2 |
| more than / added to | + |
| less than / subtracted from | − |
| sum of | + |
| times / multiplied by | × |
| divided by | ÷ |
| 5 years ago | − 5 |
| in 3 years | + 3 |

**Example — translate "a number less than 4 is 11":** x − 4 = 11.

### Solving a Linear Equation — The 3 Steps

\`\`\`
Step 1 — Simplify both sides    (add or subtract the loose numbers)
Step 2 — Move x's to one side   (keep the balance — do the same to both)
Step 3 — Divide to free x
\`\`\`

**Example — 2x + 5 = 21:**

\`\`\`
Step 1:  2x + 5 − 5 = 21 − 5   →  2x = 16
Step 2:  2x ÷ 2 = 16 ÷ 2       →  x = 8
\`\`\`

**Check:** 2 × 8 + 5 = 16 + 5 = 21 ✓. Always check — it takes 5 seconds and catches most mistakes.

### Ages Problems — The Table Trick

Ages problems are just equations with a twist: everyone ages together. The trick is a **now vs then table**.

**Example — "A father is 3 times as old as his son. In 12 years, he will be twice as old."**

| Person | Age now | Age in 12 years |
|---|---|---|
| Son | x | x + 12 |
| Father | 3x | 3x + 12 |

**The story gives the equation:** in 12 years, father = twice son:

\`\`\`
3x + 12 = 2(x + 12)
3x + 12 = 2x + 24
3x − 2x = 24 − 12
x = 12
\`\`\`

**Answer:** son is **12**, father is 3 × 12 = **36**.

**Check the table again:** in 12 years son = 24, father = 48. Is 48 = 2 × 24? Yes ✓.

### Quadratic Equations (Just the Simple Ones)

A quadratic has x² — "a number times itself." In aptitude tests you rarely need the formula; the questions are designed so **guessing works**:

**Example — "The square of a number is 81":**

\`\`\`
x² = 81
x = 9   (since 9 × 9 = 81)
\`\`\`

**Example — "The product of two consecutive numbers is 30":**

\`\`\`
x(x + 1) = 30 → x = 5 and x + 1 = 6   (5 × 6 = 30 ✓)
\`\`\`

Just ask: what pair of consecutive numbers multiply to 30? 5 and 6. No formula needed.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting the check | Wrong x accepted | Put x back in the sentence |
| Adding ages twice | Father's "in 12 years" as 3x only | Add 12 to BOTH people |
| Minus sign slip | x − 4 = 11 written as 4 − x | "less than" — the number comes FIRST |
| Not simplifying first | 2x + 5 = 21 attacked in one jump | Step 1: balance the loose numbers |

### Quick Self-Test (answers at the bottom)

1. Solve 2x + 5 = 21. (a) 8  (b) 10  (c) 13  (d) 16
2. Twice a number plus 3 equals 15. The number is — (a) 12  (b) 9  (c) 6  (d) 5
3. A father is 3 times as old as his son. In 12 years he will be twice as old. The son is now — (a) 15  (b) 12  (c) 9  (d) 18
4. If x² = 81, the positive value of x is — (a) 9  (b) 18  (c) 81  (d) 3
5. "A number minus 4 equals 11" written as an equation is — (a) x − 4 = 11  (b) 4 − x = 11  (c) x + 4 = 11  (d) 4x = 11

**Answers:** 1→a (16 ÷ 2), 2→c (12 ÷ 2), 3→b (see the table trick), 4→a, 5→a.

### Key Takeaway

An equation is a balanced scale. Translate the story with the word table, solve in 3 steps (simplify → move → divide), and always check. For ages, build a now/then table — everyone ages together. Simple quadratics? Guess the pair.`,
    lessonSlug: 'algebra-equations-mensuration',
    order: 1
  },
  {
    title: 'Mensuration (Area, Perimeter & Volume)',
    slug: 'mensuration-basics',
    description: 'Fence around (perimeter), carpet on (area), water inside (volume) — three small formula tables and a cancel-happy π = 22/7.',
    explanation: `### The Three Questions (Know What You're Measuring)

| Question | What it measures | Unit |
|---|---|---|
| **Perimeter** | The fence AROUND a shape | m (one dimension) |
| **Area** | The carpet ON a shape | m² (two dimensions) |
| **Volume** | The water INSIDE a shape | m³ (three dimensions) |

A garden: the fence is perimeter (metres), the lawn is area (square metres), and if it were a tank, the water is volume (cubic metres).

### The Formula Table (2D — Perimeter and Area)

| Shape | Perimeter | Area |
|---|---|---|
| Square (side a) | 4a | a × a = a² |
| Rectangle (length l, breadth b) | 2(l + b) | l × b |
| Triangle (base b, height h) | sum of 3 sides | ½ × b × h |
| Circle (radius r) | 2πr | πr² |

**Examples:**

\`\`\`
Square side 6 m:   Perimeter = 4 × 6 = 24 m,  Area = 6 × 6 = 36 m²
Rectangle 5 × 8 m: Perimeter = 2(5+8) = 26 m, Area = 5 × 8 = 40 m²
Triangle b 8, h 5: Area = ½ × 8 × 5 = 20 m²
\`\`\`

### The Formula Table (3D — Volume)

| Shape | Volume |
|---|---|
| Cube (side a) | a³ |
| Cuboid (l, b, h) | l × b × h |
| Cylinder (radius r, height h) | πr²h |

**Example — cuboid 2 × 3 × 4 m:** Volume = 2 × 3 × 4 = **24 m³**.

### π — Just Use 22/7

π (pi) is a number, about 3.14. In aptitude tests, use **22/7** when the radius is a multiple of 7 — it cancels beautifully:

\`\`\`
Cylinder r = 7 cm, h = 10 cm:
V = πr²h = 22/7 × 7 × 7 × 10
         = 22 × 7 × 10      (the 7s cancel)
         = 1,540 cm³
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Mixing area and perimeter | Fence measured in m² | Fence is perimeter (m), carpet is area (m²) |
| Wrong units in the answer | Volume written as m² | Volume is always m³ / cm³ |
| Forgetting ½ in a triangle | Base × height only | Triangle area = ½ × b × h |
| Radius vs diameter | Using 14 for r = 7 | Read: r is HALF the diameter |

### Quick Self-Test (answers at the bottom)

1. The perimeter of a square with side 6 m is — (a) 24 m  (b) 36 m  (c) 12 m  (d) 48 m
2. The area of a rectangle 5 m × 8 m is — (a) 26 m²  (b) 40 m²  (c) 13 m²  (d) 80 m²
3. The volume of a cuboid 2 m × 3 m × 4 m is — (a) 9 m³  (b) 14 m³  (c) 24 m³  (d) 48 m³
4. The volume of a cylinder with r = 7 cm, h = 10 cm (π = 22/7) is — (a) 1,540 cm³  (b) 220 cm³  (c) 154 cm³  (d) 1,540 cm²
5. The area of a triangle with base 8 m and height 5 m is — (a) 40 m²  (b) 20 m²  (c) 13 m²  (d) 80 m²

**Answers:** 1→a (4 × 6), 2→b (5 × 8), 3→c (2 × 3 × 4), 4→a (22 × 7 × 10), 5→b (½ × 8 × 5).

### Key Takeaway

Perimeter = fence (m), area = carpet (m²), volume = water (m³). Three shapes of each: square/rectangle/triangle/circle for 2D, cube/cuboid/cylinder for 3D. Use π = 22/7 and cancel — a multiple-of-7 radius is a gift.`,
    lessonSlug: 'algebra-equations-mensuration',
    order: 2
  },
  /* Puzzles & Syllogisms */
  {
    title: 'Logical Puzzles (Seating Arrangements)',
    slug: 'logical-puzzles',
    description: 'Draw the seats, start with the most definite clue, and let the remaining chairs force the layout — no guessing needed.',
    explanation: `### The Setup

Five chairs in a row, five friends, and clues like "R sits in the middle" or "T sits at the right end." Your job: place everyone. It's like a crossword — you fill the definite squares first.

**Draw the seats before anything else:**

\`\`\`
Seat:  1    2    3    4    5
       _    _    _    _    _
\`\`\`

### The Clue Dictionary (Know Each Clue's Meaning)

| Clue | What it means |
|---|---|
| X sits in the middle | X is at seat 3 of 5 |
| X sits at the right end | X is at the last seat |
| X sits at the left end | X is at the first seat |
| X sits immediately to the left of Y | No one between X and Y, X on the left |
| X sits immediately right of Y | No one between them, X on the right |
| X and Y sit together | They are neighbours (either order) |
| X is not at an end | X is a middle seat |

**The two golden habits:**
1. **Start with the most definite clue** — "in the middle" beats "somewhere to the left."
2. **Update the seats as you go** — cross off filled seats; the remaining friends fit into the remaining chairs.

### Worked Example — Five Friends in a Row

**Clues:** R sits in the middle. T sits at the right end. P sits immediately to the left of Q.

**Step 1 — the definite clues:**

\`\`\`
Seat:  1    2    3    4    5
       _    _    R    _    T
\`\`\`

**Step 2 — find P and Q.** They must be adjacent, with P left of Q. The free seats are 1, 2 and 4. Adjacent free pairs: only (1, 2) — (2, 3) has R, (3, 4) has R, (4, 5) has T.

**Step 3 — place them:**

\`\`\`
Seat:  1    2    3    4    5
       P    Q    R    S    T
\`\`\`

S takes the last free seat. **The arrangement is forced** — no guessing was needed.

### The Power of "Definitely"

The whole game is finding what MUST be true:

| Clue | Definite? |
|---|---|
| "P sits somewhere left of Q" | Not definite — many layouts possible |
| "P sits immediately left of Q" | Definite — the pair occupies two fixed seats |
| "T sits at the right end" | Definite — locks seat 5 |

If a clue gives you a definite position, place it. If not, note it and keep going — later clues usually decide.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Guessing early | Wrong layout, wrong answers | Only fill seats the clues force |
| Ignoring "immediately" | P and Q separated | "Immediately" = neighbours, no gap |
| Forgetting to redraw | Mistakes pile up | Draw seats once, fill as clues arrive |
| Answering "cannot say" too fast | Missing the forced seat | If one seat is left for one person, that's an answer |

### Quick Self-Test (answers at the bottom)

1. In the row above, who sits at the left end? (a) P  (b) Q  (c) T  (d) Cannot be determined
2. C sits in the middle of 5 seats and D sits at the left end. Which seats are definitely occupied? (a) 1 and 3  (b) 2 and 4  (c) 3 and 5  (d) 1 and 5
3. In a row of 4 seats, A sits immediately left of B. How many positions can the pair (A, B) take? (a) 4  (b) 3  (c) 2  (d) 1
4. The best first step in a seating puzzle is — (a) guessing the arrangement  (b) starting with the most definite clue  (c) reading only the last clue  (d) ignoring the middle seats
5. In the worked example, who sits between R and T? (a) P  (b) Q  (c) S  (d) Nobody

**Answers:** 1→a (P Q R S T), 2→a, 3→b (pairs 1-2, 2-3, 3-4), 4→b, 5→c.

### Key Takeaway

Draw the seats, start with the most definite clue, place forced people, and let the remaining seats decide the rest. "Immediately" means neighbours. No guessing — the clues always force the layout in easy puzzles.`,
    lessonSlug: 'puzzles-syllogisms',
    order: 1
  },
  {
    title: 'Syllogisms',
    slug: 'syllogisms',
    description: 'Two statements, Venn circles, and the golden rule — "All A are B" never becomes "All B are A." Only conclusions true in every drawing follow.',
    explanation: `### The Game

Two statements (premises), then conclusions. You decide: does the conclusion **definitely follow**? If the conclusion could be false in some situation, it does NOT follow — even if it sounds reasonable.

### The Three Statement Types

| Statement | Picture (Venn) | Example |
|---|---|---|
| **All A are B** | A's circle inside B's circle | All dogs are animals |
| **Some A are B** | A and B circles overlap | Some students are athletes |
| **No A are B** | Two separate circles | No cat is a fish |

Draw the circles — the picture answers the question.

### The Conversion Rules (The Heart of the Chapter)

A statement can sometimes be "flipped." The table shows which flips are safe:

| You have | Valid flip | Invalid flip |
|---|---|---|
| All A are B | Some B are A ✓ | All B are A ✗ |
| Some A are B | Some B are A ✓ | All A are B ✗ |
| No A are B | No B are A ✓ | Some A are B ✗ |

**The one rule to never break:** **"All A are B" NEVER becomes "All B are A."** All dogs are animals, but certainly not all animals are dogs.

### The Chain Rule

When statement 1 ends where statement 2 begins, chain them:

**Example — "All cats are mammals. All mammals are animals."**

\`\`\`
Cats → Mammals → Animals
\`\`\`

"All cats are animals" **follows** — the chain is continuous. Chains like this are the most common safe conclusion in exams.

### Definite vs Possible (The Exam's Favourite Trick)

| Conclusion | Truth status |
|---|---|
| All cats are animals (from the chain) | **Definite — follows** |
| Some animals are cats (flip of the chain) | **Definite — follows** |
| All animals are cats | False — never reverse "all" |
| Some mammals are not cats | Possible but NOT definite |

A conclusion must be true in **every possible drawing**. "Some mammals are not cats" could be true, but it could also be false (what if every mammal were a cat?). Possible ≠ definite.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reversing "all" | "All animals are cats" accepted | "All A are B" never flips to "All B are A" |
| Accepting "possible" | "Some mammals are not cats" marked true | Only accept what every drawing shows |
| Skipping the picture | Circles not drawn | Draw the Venn — it decides |
| Mixing up "some" | Some A are B read as all A are B | "Some" = at least one, nothing more |

### Quick Self-Test (answers at the bottom)

1. All dogs are animals. Which conclusion follows? (a) All animals are dogs  (b) Some animals are dogs  (c) No dogs are animals  (d) Dogs are not animals
2. All cats are mammals and all mammals are animals. Does "all cats are animals" follow? (a) Yes  (b) No  (c) Only some cats  (d) Cannot say
3. Which is a valid flip of "All A are B"? (a) Some B are A  (b) All B are A  (c) No B are A  (d) Some A are not B
4. From "Some A are B", which definitely follows? (a) All A are B  (b) No B are A  (c) Some B are A  (d) Some B are not A
5. All apples are fruits. Which statement is definitely false? (a) Some fruits are apples  (b) All apples are fruits  (c) All fruits are apples  (d) None of these

**Answers:** 1→b, 2→a (chain), 3→a, 4→c, 5→c.

### Key Takeaway

Draw the Venn circles. "All A are B" means A's circle is inside B's — flip it safely to "Some B are A," but NEVER to "All B are A." Chain statements that connect. And only conclusions true in every drawing count as following.`,
    lessonSlug: 'puzzles-syllogisms',
    order: 2
  },
  /* Blood Relations & Direction Sense */
  {
    title: 'Blood Relations',
    slug: 'blood-relations',
    description: 'Chains of small links — build the family tree one arrow at a time, use pronouns as gender clues, and never reverse the chain direction.',
    explanation: `### The Simple Idea

Every relation is a chain of small links: father, mother, brother, sister, son, daughter. Questions describe a person through a chain, and you connect the links. You never need to memorize the whole family tree of the world — just **build the chain in the question**.

### The Relation Dictionary (The Only Table You Need)

| Link | Relation |
|---|---|
| Father's father / mother's father | Grandfather |
| Father's mother / mother's mother | Grandmother |
| Father's brother | Uncle |
| Father's sister / mother's sister | Aunt |
| Mother's brother | Uncle (mama) |
| Brother's son / sister's son | Nephew |
| Brother's daughter / sister's daughter | Niece |
| Son's son / daughter's son | Grandson |
| Son's daughter / daughter's daughter | Granddaughter |
| Son's wife / daughter's husband | Daughter-in-law / Son-in-law |
| Husband's brother / wife's brother | Brother-in-law |

### The Two Golden Rules

**Rule 1 — Follow the chain step by step.** Don't jump to the answer; write each link.

**Example — "He is the son of my father's only son"** (Riya speaking, Riya is a girl):

\`\`\`
Step 1: my father's only son → my BROTHER (Riya's father has one son: her brother)
Step 2: son of my brother → my NEPHEW
\`\`\`

**Rule 2 — Use pronouns as gender clues.** "He said" tells you the person is male; "her" tells you female. If a question says "my father's only son" and the speaker is a girl, that son is her brother (not herself!).

**The reversal trick:** "father's brother" is an uncle, but "brother's father" is your father — the chain direction matters. Read every link left to right, exactly as written.

### Worked Example — The Photo Question

**Question:** "Pointing to a man, Riya said, 'He is the son of my mother's only daughter.' How is the man related to Riya?"

\`\`\`
Step 1: my mother's only daughter → Riya HERSELF (only one daughter!)
Step 2: son of Riya → her SON
\`\`\`

The answer: the man is Riya's **son**. The trap was real — "only daughter" is not "only son"; it's the speaker herself.

### The Mini Tree Method (For Confusing Ones)

Draw boxes: \`[Speaker] → [link] → [link]\`. Each arrow is one word of the question. When the chain ends, the last box is your answer. Slow and steady beats fast and wrong.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Ignoring gender pronouns | "He" treated as female | Every pronoun is a clue — mark it |
| Reversing the chain | "Brother's father" answered "uncle" | Read left to right, one link at a time |
| "Only son" panic | Son thought to be the speaker | "Only son" = the father's sole male child |
| Guessing the whole tree | Wrong relation | One link per arrow, nothing more |

### Quick Self-Test (answers at the bottom)

1. Your father's brother is your — (a) uncle  (b) grandfather  (c) brother  (d) cousin
2. Your mother's mother is your — (a) aunt  (b) grandmother  (c) sister  (d) mother
3. Your brother's son is your — (a) nephew  (b) niece  (c) son  (d) cousin
4. A girl says "He is my father's only son." The person is her — (a) brother  (b) uncle  (c) father  (d) cousin
5. Your son's daughter is your — (a) granddaughter  (b) niece  (c) daughter  (d) sister

**Answers:** 1→a, 2→b, 3→a, 4→a (her brother), 5→a.

### Key Takeaway

Blood relations = chains of small links. Build the chain one arrow at a time, use pronouns as gender clues, and never reverse the direction of a link. Draw a mini tree when it gets crowded — pictures never lie.`,
    lessonSlug: 'blood-relations-direction',
    order: 1
  },
  {
    title: 'Direction Sense',
    slug: 'direction-sense',
    description: 'Draw the compass and the walk — the turning table fixes left/right, opposite legs cancel, and 3-4-5 triples give the distance.',
    explanation: `### The Compass (Draw It First)

Every direction question starts with the same picture:

\`\`\`
            N
            |
     W —— start —— E
            |
            S
\`\`\`

Four main directions (N, S, E, W) and four diagonals (NE, NW, SE, SW). Any answer like "3 km north then 4 km east" is just two arrows on this picture.

### The Turning Table (Know Your Left From Your Right)

When you face a direction, your turns are fixed:

| Facing | Left turn → | Right turn → | Opposite |
|---|---|---|---|
| North | West | East | South |
| South | East | West | North |
| East | North | South | West |
| West | South | North | East |

**Memory anchor:** facing north, your left hand is west and your right hand is east — like a real map. Turn the picture with you, don't rotate the question.

### The Path Method (Draw, Don't Calculate)

**Example — "3 km north, turn right, 4 km":**

\`\`\`
Start → 3 km North (arrow up)
Right turn → facing East → 4 km (arrow right)
\`\`\`

\`\`\`
           4 km east →
Start ↑ 3 km north
\`\`\`

Two arrows at a right angle. The straight-line distance back to the start is the **hypotenuse** — and aptitude loves the 3-4-5 triple:

\`\`\`
3² + 4² = 5²  →  distance = 5 km
\`\`\`

**Direction:** the walk went north then east → the final point is to the **North-East** of the start.

### The Pythagorean Triple Table (Memorise)

| Legs | Hypotenuse |
|---|---|
| 3, 4 | 5 |
| 6, 8 | 10 |
| 5, 12 | 13 |
| 9, 12 | 15 |

Any right-angle walk with these legs gives a clean whole-number distance.

### Worked Example — The Full Question

**Question:** Rohan walks 2 km south, turns left, walks 2 km, turns left again, walks 2 km. Where is he relative to the start?

\`\`\`
Start → 2 km South
Left turn (facing south → east) → 2 km East
Left turn (facing east → north) → 2 km North
\`\`\`

2 south + 2 north cancel → net displacement is just **2 km East** of the start. ✓

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Turning the wrong way | Right turn treated as left | Use the turning table, not intuition |
| Forgetting opposite turns | North then south assumed far | Opposite walks cancel — subtract them |
| Using the sum as distance | 3 + 4 = 7 km | Straight-line is the hypotenuse, not the sum |
| Skipping the picture | Directions tangled | Draw every arrow before answering |

### Quick Self-Test (answers at the bottom)

1. Facing north, your right hand points — (a) east  (b) west  (c) north  (d) south
2. Facing south, a left turn makes you face — (a) west  (b) east  (c) north  (d) south
3. Walking 3 km north then 4 km east, the straight-line distance from the start is — (a) 7 km  (b) 5 km  (c) 1 km  (d) 12 km
4. In question 3, the direction from the start is — (a) north-east  (b) south-west  (c) north-west  (d) south-east
5. Facing west, a right turn makes you face — (a) north  (b) south  (c) east  (d) west

**Answers:** 1→a, 2→b, 3→b (3-4-5), 4→a, 5→a.

### Key Takeaway

Draw the compass and the walk. Left/right turns come from the turning table. Opposite legs cancel, and straight-line distance is the hypotenuse — spot the 3-4-5 triple and the answer falls out. Direction = the net of all your arrows, named by the compass.`,
    lessonSlug: 'blood-relations-direction',
    order: 2
  },
  /* Coding-Decoding & Number Series */
  {
    title: 'Coding-Decoding',
    slug: 'coding-decoding',
    description: 'Find the one rule behind the code — shift by a constant, reverse the alphabet, or sum the positions — then apply it letter by letter.',
    explanation: `### The Simple Idea

A code is a **rule applied consistently**. The question gives you one example ("CAT is written as DBU") — you find the rule from that example, then apply the same rule to the target word. There is no magic; every code is one of a handful of standard tricks.

### The Letter Position Table (The Only Table You Need)

| Letter | Position | Letter | Position | Letter | Position | Letter | Position |
|---|---|---|---|---|---|---|---|
| A | 1 | H | 8 | O | 15 | V | 22 |
| B | 2 | I | 9 | P | 16 | W | 23 |
| C | 3 | J | 10 | Q | 17 | X | 24 |
| D | 4 | K | 11 | R | 18 | Y | 25 |
| E | 5 | L | 12 | S | 19 | Z | 26 |
| F | 6 | M | 13 | T | 20 | | |
| G | 7 | N | 14 | U | 21 | | |

**Memory anchor:** E = 5, M = 13, T = 20, Z = 26. Four anchors let you count to any letter quickly.

### The Code-Maker's Toolbox (Standard Rules)

| Trick | What it does | Example |
|---|---|---|
| Shift by a constant | Each letter moves +k or −k positions | CAT → DBU (+1 each) |
| Reverse alphabet | A↔Z, B↔Y, C↔X (positions add to 27) | ZEBRA → AYAQZ |
| Reverse the word | Write the word backwards | DOG → GOD |
| Mix vowels & consonants | Vowels shift one way, consonants another | CAP → DBQ (vowels +1, consonants +1) |
| Sum of positions | Add positions; code is a number | CAT = 3 + 1 + 20 = 24 |

**First question to ask yourself: is the code letters or numbers?** If letters → shift/reverse. If numbers → positions/sums.

### Worked Example 1 — Shift by a Constant

**Question:** In a certain code, CAT is written as DBU. How is DOG written?

\`\`\`
Step 1: C → D  (+1)     A → B  (+1)     T → U  (+1)
Step 2: the rule is "+1 on every letter"
Step 3: apply the rule: D → E, O → P, G → H
Step 4: DOG = EPH
\`\`\`

The answer: **EPH**.

### Worked Example 2 — Reverse Alphabet

**Question:** In a certain code, ZEBRA is written as AYAQZ. How is SUN written?

\`\`\`
Step 1: Z → A (reverse pair), E → Y, B → A, R → Q, A → Z
Step 2: rule = reverse alphabet (A↔Z, B↔Y, C↔X, ...)
Step 3: S → H   U → F   N → M
Step 4: SUN = HFM
\`\`\`

**Reverse-pair trick:** a letter and its reverse always add to 27 (Z + A = 26 + 1 = 27, B + Y = 2 + 25 = 27). If two letters sum to 27, they are reverse pairs.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Skipping the given example | Applying the wrong rule | The rule always comes from the sample |
| Shifting backwards | +1 read as −1 | Check the sample direction once |
| Forgetting reverse pairs sum to 27 | Guessing pairs | Use the 27 rule to verify |
| Mixing positions | A read as 0 instead of 1 | A = 1, always |
| Vowels only | Changing consonants too | Recheck the rule on every letter type |

### Quick Self-Test (answers at the bottom)

1. If CAT is written as DBU, how is RAT written? — (a) SBU  (b) QZS  (c) SAU  (d) RBT
2. A letter and its reverse alphabet partner always sum to — (a) 25  (b) 26  (c) 27  (d) 13
3. Letter position of M is — (a) 12  (b) 13  (c) 14  (d) 11
4. If DOG is written as GOD, how is CAT written? — (a) TAC  (b) CTA  (c) ACT  (d) TCA
5. If AB = 1 + 2 = 3 (sum of positions), then CD = — (a) 7  (b) 8  (c) 9  (d) 10

**Answers:** 1→a, 2→c, 3→b, 4→a, 5→a (C = 3, D = 4, sum = 7).

### Key Takeaway

Every code obeys one consistent rule. Find the rule from the sample (shift, reverse alphabet, reverse word, sum of positions), then apply it letter by letter. The 27-rule verifies reverse pairs, and A = 1, never 0.`,
    lessonSlug: 'coding-decoding-number-series',
    order: 1
  },
  {
    title: 'Number Series',
    slug: 'number-series',
    description: 'Differences first — constant or growing, ratio or squares — then verify the pattern on two known terms before predicting the next.',
    explanation: `### The Simple Idea

Every sequence hides one pattern that turns each number into the next. Find the pattern on the **first few terms**, verify it on the **next terms**, then predict the answer. If the first guess fails, try the next pattern family.

### The Pattern Family Table (Check Differences First)

| Family | Pattern | Example |
|---|---|---|
| Constant difference | Add (or subtract) the same number | 2, 5, 8, 11 → +3 |
| Constant ratio | Multiply (or divide) by the same number | 3, 6, 12, 24 → ×2 |
| Alternating | Two patterns on odd and even positions | 2, 5, 3, 7, 4, 9 → +1, +2 |
| Growing difference | Difference itself grows (+2, +3, +4...) | 2, 5, 10, 17 → +3, +5, +7 |
| Squares / cubes | Perfect squares or cubes with a tweak | 1, 4, 9, 16 → n² |
| Prime numbers | The primes in order | 2, 3, 5, 7, 11 → next 13 |
| Difference of differences | Second difference is constant | 1, 4, 10, 19 → +3, +6, +9 (+3 each) |

**The first move is always: write down the differences.** If the differences are constant → constant difference. If the differences grow steadily → growing difference. If nothing → try ratio, squares, or alternating.

### Worked Example 1 — Constant Ratio

**Question:** What comes next: 2, 4, 8, 16, ?

\`\`\`
Step 1: 4 ÷ 2 = 2    8 ÷ 4 = 2    16 ÷ 8 = 2
Step 2: pattern = multiply by 2
Step 3: 16 × 2 = 32
\`\`\`

The answer: **32**.

### Worked Example 2 — Growing Difference

**Question:** What comes next: 2, 5, 10, 17, ?

\`\`\`
Step 1: differences = +3, +5, +7
Step 2: the differences themselves grow by +2
Step 3: next difference = +9
Step 4: 17 + 9 = 26
\`\`\`

The answer: **26**. Never answer 25 (which "feels" like squares) — the differences tell the real story.

### The Verification Habit (Always Do This)

Once you have a pattern, check it on **two consecutive terms you already know**. If the pattern explains term 2 from term 1 AND term 3 from term 2, you can trust it. A pattern that only works once is a guess.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Guessing squares without checking differences | 2, 5, 10, 17 answered 25 | Differences +3, +5, +7 say +9 → 26 |
| Skipping the differences step | Jumping to a wild pattern | Differences first, always |
| Stopping after one match | Pattern fits once only | Verify on two known terms |
| Forgetting alternation | Two patterns hidden in one list | Check odd and even positions separately |
| Ratio before difference | ×2 assumed on 2, 4, 6 | Differences (+2) beat ratio here |

### Quick Self-Test (answers at the bottom)

1. Next term: 3, 6, 12, 24 — (a) 36  (b) 48  (c) 40  (d) 30
2. Next term: 1, 4, 9, 16 — (a) 20  (b) 24  (c) 25  (d) 23
3. Next term: 5, 8, 11, 14 — (a) 17  (b) 16  (c) 18  (d) 15
4. Next term: 100, 90, 81, 73 — (a) 65  (b) 66  (c) 67  (d) 64
5. Next term: 1, 2, 4, 8 — (a) 12  (b) 14  (c) 16  (d) 10

**Answers:** 1→b, 2→c, 3→a, 4→b (−10, −9, −8 → −7 → 66), 5→c.

### Key Takeaway

Write the differences first — they reveal most patterns instantly. If the differences are constant, that's the pattern; if they grow steadily, continue their growth. Verify any pattern on two known terms before predicting, and check odd/even positions when the sequence seems to dance between two rules.`,
    lessonSlug: 'coding-decoding-number-series',
    order: 2
  },
  /* Analogies & Odd One Out */
  {
    title: 'Analogies',
    slug: 'analogies',
    description: 'Name the relationship between the complete pair in one sentence, then copy it — worker to place, tool to action, number rules tested on the first pair first.',
    explanation: `### The Simple Idea

An analogy is a matching game: **A : B :: C : ?** means "A is to B, as C is to ?". The relationship between A and B must be **exactly the same** as the relationship between C and the answer. Nothing more, nothing less.

> **The Golden Rule: name the relationship first.** If you can say it in one sentence ("a doctor works in a hospital"), the answer falls out by itself. If you can't name the relationship, you can't answer the question.

### The Relationship Dictionary (The Only Table You Need)

| Type | Relationship | Example |
|---|---|---|
| Worker → Place | Where the worker works | Doctor : Hospital |
| Worker → Tool | What the worker uses | Farmer : Plough |
| Tool → Action | What the tool does | Pen : Write |
| Part → Whole | A piece of the bigger thing | Page : Book |
| Whole → Part | The bigger thing containing pieces | Book : Page |
| Cause → Effect | One makes the other happen | Rain : Flood |
| Category → Member | One is a type of the other | Fruit : Mango |
| Product → Material | What it is made from | Table : Wood |
| Synonym | Same meaning | Happy : Joyful |
| Antonym | Opposite meaning | Hot : Cold |
| Degree | Same quality, different amount | Whisper : Shout |
| Number rule | A fixed calculation | 2 : 6 (×3) |

### Worked Example 1 — Worker to Place

**Question:** Doctor : Hospital :: Teacher : ?

\`\`\`
Step 1: name the relationship — a doctor WORKS IN a hospital
Step 2: a teacher works in a school
Step 3: the answer is SCHOOL
\`\`\`

### Worked Example 2 — Number Analogy

**Question:** 2 : 6 :: 5 : ?

\`\`\`
Step 1: test a calculation on the FIRST pair — 2 × 3 = 6
Step 2: apply the same rule — 5 × 3 = 15
Step 3: the answer is 15
\`\`\`

> **The Number Rule Checklist (in order):** try × / ÷ first, then + / −, then squares, then squares ± 1. The first rule that works on the first pair is the rule you copy. Never skip straight to a fancy rule when a simple one fits.

### The Mirror Check (Order Can Flip)

Sometimes the question flips the order: **Hospital : Doctor :: School : ?**. The relationship is still "works in" — it just faces the other way. The answer is still a worker who works in a school: **Teacher**.

\`\`\`
A : B  =  C : ?      →  relationship faces the same way
B : A  =  C : ?      →  relationship flips, but it is the SAME relationship
\`\`\`

Direction matters for part/whole (Page : Book ≠ Book : Page), but the relationship name stays identical.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Jumping straight to an answer | Matching words instead of relationships | Name the relationship in one sentence first |
| Picking related-but-wrong | "Teacher : Students" is related, not the pattern | The pattern is worker → place; keep it exact |
| Reversing the direction | Page : Book answered as Book : Page | Check which side each word sits on |
| Fancy number rules | Guessing squares when the rule is ×3 | Test your rule on the first pair before applying |

### Quick Self-Test (answers at the bottom)

1. Pen : Write :: Knife : ? — (a) Cut  (b) Cook  (c) Eat  (d) Sharp
2. Bird : Sky :: Fish : ? — (a) Water  (b) Land  (c) Tree  (d) Nest
3. 2 : 6 :: 5 : ? — (a) 10  (b) 15  (c) 25  (d) 30
4. Happy : Joyful :: Sad : ? — (a) Angry  (b) Unhappy  (c) Tired  (d) Brave
5. Hospital : Doctor :: School : ? — (a) Student  (b) Teacher  (c) Book  (d) Class

**Answers:** 1→a, 2→a, 3→b, 4→b, 5→b.

### Key Takeaway

Analogies are relationship-copying games. Name the relationship between the complete pair in one sentence, then apply it to the incomplete pair. Watch the direction (A : B faces the same way as C : ?), and always test number rules on the first pair before you trust them.`,
    lessonSlug: 'analogies-odd-one-out',
    order: 1
  },
  {
    title: 'Odd One Out',
    slug: 'odd-one-out',
    description: 'Think in threes — the rule belongs to three items, the fourth breaks it; when two properties fight, pick the one that leaves three brothers behind.',
    explanation: `### The Simple Idea

One item breaks the rule. Find the **common property** shared by the others, and the item that does not have it is the answer. The odd one out is never decided alone — the other three define the rule.

> **The Golden Rule: think in threes.** If you can say why THREE items belong together, the fourth is your answer. A rule that only fits two items is not a rule yet.

### The Three-Step Search

\`\`\`
Step 1: find a property shared by THREE items
Step 2: check the fourth item — does it have the property?
Step 3: if it does NOT, the fourth is the odd one out
\`\`\`

### The Property Families (What to Look For)

| Group type | Look for | Example |
|---|---|---|
| Words | Category, use, or quality | Apple, Mango, Banana, Carrot → Carrot is a vegetable |
| Numbers | Prime, even, square, multiple | 4, 9, 16, 25, 31 → 31 is not a square |
| Letters | Vowel, consonant, position | A, E, I, O, H → H is not a vowel |
| Places | City, country, state | Delhi, Mumbai, India, Chennai → India is a country |
| Mixed | The quality that unites 3 | (any category that fits exactly three) |

### Worked Example 1 — Words

**Question:** Which is the odd one out — Apple, Mango, Banana, Carrot?

\`\`\`
Step 1: Apple, Mango, Banana are all FRUITS
Step 2: Carrot is a vegetable
Step 3: CARROT is the odd one out ✓
\`\`\`

### Worked Example 2 — Numbers

**Question:** Which is the odd one out — 4, 9, 16, 25, 31?

\`\`\`
Step 1: 4, 9, 16, 25 are perfect squares (2², 3², 4², 5²)
Step 2: 31 is not a perfect square
Step 3: 31 is the odd one out ✓
\`\`\`

### The Double-Property Trap (When Two Answers Fight)

Sometimes two items look odd. Take **2, 3, 5, 7, 9** — 2 is the only even number, but 9 is the only non-prime. Two candidates, one correct answer.

\`\`\`
Candidate A: 2 — the only even number
Candidate B: 9 — the only non-prime number

Tiebreaker: which property leaves THREE identical items?
2, 3, 5, 7 are all PRIMES → 9 breaks the rule → answer is 9
\`\`\`

> **The tiebreaker rule:** when two properties conflict, prefer the one that unites exactly three items. The odd one out must leave three brothers behind.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Stopping at the first property | Two answers become possible | Look for the property that unites three exactly |
| Judging the item alone | Choosing by the odd item's looks | The other three items define the rule |
| Number intuition | Calling 31 "just an odd number" | Test squares, primes, multiples before deciding |
| Forcing a rule | A rule that only fits two items | If it does not fit three, it is the wrong rule |
| Ignoring categories | Mixing cities and countries | Name the category out loud first |

### Quick Self-Test (answers at the bottom)

1. Odd one out: Apple, Mango, Banana, Carrot — (a) Apple  (b) Mango  (c) Banana  (d) Carrot
2. Odd one out: 4, 9, 16, 25, 31 — (a) 4  (b) 9  (c) 25  (d) 31
3. Odd one out: 2, 3, 5, 7, 9 — (a) 2  (b) 3  (c) 5  (d) 9
4. Odd one out: A, E, I, O, H — (a) A  (b) E  (c) O  (d) H
5. Odd one out: Delhi, Mumbai, India, Chennai — (a) Delhi  (b) Mumbai  (c) India  (d) Chennai

**Answers:** 1→d, 2→d, 3→d, 4→d, 5→c (the other three are cities; India is a country).

### Key Takeaway

Odd one out is a group decision: three items own the rule, the fourth breaks it. Name the property that fits exactly three items, verify the fourth fails it, and when two properties compete, pick the one that leaves three brothers behind.`,
    lessonSlug: 'analogies-odd-one-out',
    order: 2
  },
  {
    title: 'Linear Arrangement',
    slug: 'linear-arrangement',
    description: 'Draw the row before you read the clues — place extreme-end and middle seats first, neighbour clues second, and let the leftover take the empty seat.',
    explanation: `### The Simple Idea

A row is a line of seats: \`___ ___ ___ ___ ___\`. Every clue places someone into one of those seats. The trick is the **order of placing** — put the definite clues down first, then the relative ones, and verify at the end.

> **The Golden Rule: draw the row before you read the clues.** The row is the picture the clues paint into. Without the picture, every clue is a guess.

### The Seat-Drawing Tool

Draw one blank per person before reading the question:

\`\`\`
seat 1    seat 2    seat 3    seat 4    seat 5
  ___      ___      ___      ___      ___
\`\`\`

### The Clue Dictionary (Know Every Phrase)

| Clue | Meaning | Example |
|---|---|---|
| "at the extreme left" | The very first seat | A at seat 1 |
| "at the extreme right" | The very last seat | B at seat 5 |
| "immediately to the right of" | Next seat over, one step | C immediately right of A → A C |
| "immediately to the left of" | Next seat over, the other way | D immediately left of B → D B |
| "sits between X and Y" | One seat with both as neighbours | E between C and D → C E D |
| "at one of the ends" | Seat 1 or seat 5 (not yet known) | A at an end |

### The Two-Step Placement Order

\`\`\`
Step 1: place the DEFINITE clues — extreme ends and middle first
Step 2: place the IMMEDIATE-NEIGHBOUR clues next — one step at a time
Step 3: verify — read every clue against the finished row
\`\`\`

### Worked Example — Five Friends in a Row

**Question:** Five friends — A, B, C, D, E — sit in a row facing north. A sits at the extreme left. C sits immediately to the right of A. B sits at the extreme right. D sits immediately to the left of B. Who sits in the middle?

\`\`\`
Step 1 — draw the five seats:
seat 1    seat 2    seat 3    seat 4    seat 5
  ___      ___      ___      ___      ___

Step 2 — place the definite clues:
A at extreme left → seat 1 = A
B at extreme right → seat 5 = B

Step 3 — place the neighbour clues:
C immediately right of A → seat 2 = C
D immediately left of B → seat 4 = D

Step 4 — the leftover seat:
seat 3 = E

Final row:  A  C  E  D  B
\`\`\`

**Verify:** A at left ✓ · C right of A ✓ · B at right ✓ · D left of B ✓. The answer: **E** sits in the middle.

### The Verification Habit (Always Do This)

Read every clue back against the finished row, one at a time. If one clue fails, the row is wrong — and it is faster to redraw than to argue with the paper.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reading "right of" as your right, not the row's | Mirror-image rows | Everyone faces the same way — fix the direction once |
| Placing relative clues first | Blank seats everywhere | Extremes and middle first, always |
| Skipping the drawing | Clues tangled in the head | One blank per person, every time |
| Forgetting the leftover | The unused name | After placing all clues, the empty seat belongs to the leftover |
| Not verifying | One clue quietly violated | Read every clue against the final row |

### Quick Self-Test (answers at the bottom)

1. In a row of 5, X sits 3rd from the left. Position from the right is — (a) 2nd  (b) 3rd  (c) 4th  (d) 1st
2. Five friends in a row: A extreme left, C immediately right of A, B extreme right, D immediately left of B. The middle seat belongs to — (a) A  (b) C  (c) E  (d) D
3. In a row of 7, X sits 4th from the left. How many people sit to X's right? — (a) 2  (b) 3  (c) 4  (d) 5
4. "A sits between B and C" — a possible left-to-right order is — (a) B A C  (b) A B C  (c) C B A  (d) B C A
5. In a row of 5, if D sits immediately left of B and B is in the middle, D is at — (a) seat 1  (b) seat 2  (c) seat 3  (d) seat 4

**Answers:** 1→b (5 − 3 + 1 = 3rd), 2→c, 3→b (7 − 4 = 3), 4→a, 5→b (B in seat 3, D one seat left → seat 2).

### Key Takeaway

Draw the row first, one blank per person. Place extreme-end and middle clues first, neighbour clues second, then give the leftover seat to the unused name. Finish by reading every clue against the row — a row that passes all clues cannot be wrong.`,
    lessonSlug: 'seating-arrangements',
    order: 1
  },
  {
    title: 'Circular Arrangement',
    slug: 'circular-arrangement',
    description: 'Place the anchor person first — the one with the "opposite" clue — then attach everyone else: facing the centre, left is clockwise and right is anticlockwise.',
    explanation: `### The Simple Idea

Same game, round table. The circle has no "left end" or "right end", so every clue is about **who is next to whom** — and which direction counts as left or right depends on which way everyone faces.

> **The Golden Rule: place the anchor first.** The person with the most clues — or the "sits opposite" clue — anchors the circle. Everything else is attached to the anchor, one person at a time.

### The Facing Rule (The Only Table You Need)

Everyone faces the centre unless the question says otherwise.

| Facing the centre | Direction | Memory anchor |
|---|---|---|
| Immediate LEFT | Clockwise | Face the centre — your left hand sweeps clockwise |
| Immediate RIGHT | Anticlockwise | Face the centre — your right hand sweeps anticlockwise |

\`\`\`
Facing the centre (looking in):
  left  = clockwise
  right = anticlockwise
\`\`\`

### The Circle-Drawing Tool

Draw the seats around a clock face — it gives every seat a name:

\`\`\`
        seat 1 (12)
      /           \
 seat 6 (10)      seat 2 (2)
      \           /
        seat 5 (8)
        /       \
   seat 4 (6)  seat 3 (4)
\`\`\`

Use "opposite" clues to anchor: seat 1 faces seat 4, seat 2 faces seat 5, seat 3 faces seat 6.

### Worked Example — Six Friends Around the Table

**Question:** Six friends — A, B, C, D, E, F — sit around a circular table facing the centre. A sits opposite D. B sits to the immediate right of A. C sits to the immediate left of A. E sits opposite C. Who sits opposite F?

\`\`\`
Step 1 — anchor with the opposite clue:
A at seat 1 (12) → D at seat 4 (6)

Step 2 — attach the neighbours of A:
B immediate RIGHT of A → right is anticlockwise → seat 6 (10)
C immediate LEFT of A → left is clockwise → seat 2 (2)

Step 3 — attach E to the next opposite clue:
E sits opposite C (seat 2) → E at seat 5 (8)

Step 4 — the leftover seat:
seat 3 (4) = F

Final circle (clockwise):  A(12)  C(2)  F(4)  D(6)  E(8)  B(10)
\`\`\`

**Verify:** A opposite D ✓ · B right of A ✓ · C left of A ✓ · E opposite C ✓. The answer: F sits at seat 3, and the seat opposite seat 3 is **seat 6 = B**. So **B sits opposite F**.

### The Anchor Person Trick

When a clue says "X sits opposite Y", place X first — it instantly splits the circle into two known halves. Opposite clues are the most powerful; use them before any neighbour clue.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Mixing up left/right directions | Left treated as anticlockwise | Facing the centre: left = clockwise, right = anticlockwise |
| Ignoring the facing direction | "Right of" flipped | Check whether they face the centre or face outside |
| Attaching before anchoring | Circle floats with no fixed point | Place the opposite-clue person first |
| Counting the answer person | "Between X and Y" includes X and Y | Count the seats between them, not them |
| Drawing a row for a circle | Ends exist where they don't | Circles have no ends — only neighbours |

### Quick Self-Test (answers at the bottom)

1. Six friends around a table facing the centre: A opposite D, B right of A, C left of A, E opposite C. Who sits opposite F? — (a) A  (b) B  (c) C  (d) E
2. Facing the centre of a circular table, a person's LEFT is — (a) clockwise  (b) anticlockwise  (c) opposite  (d) depends on the seat
3. In a circular arrangement of 6 facing the centre, how many people sit between X and the person opposite X? — (a) 1  (b) 2  (c) 3  (d) 4
4. In a 5-person circle, if X is second to the left of Y, how many people sit between them on the short side? — (a) 0  (b) 1  (c) 2  (d) 3
5. Facing the centre, moving anticlockwise from a person means moving to their — (a) left  (b) right  (c) opposite  (d) same seat

**Answers:** 1→b, 2→a, 3→b (2 on each side of the opposite pair), 4→b, 5→b.

### Key Takeaway

Place the anchor person first — the one with the opposite clue. Attach everyone else one at a time: facing the centre, left is clockwise and right is anticlockwise. Use the leftover seat for the unused name, then verify every clue against the finished circle.`,
    lessonSlug: 'seating-arrangements',
    order: 2
  },
  {
    title: 'Statement & Assumption',
    slug: 'statement-assumption',
    description: 'Run the Collapse Test — remove the belief; if the statement falls apart, it is the assumption. Stated facts are never assumptions.',
    explanation: `### The Simple Idea

An assumption is the **hidden belief a statement hangs on**. The statement never writes it down — but if the belief is false, the statement stops making sense.

> **The Golden Rule: an assumption is the missing bolt.** The statement is a shelf; the assumption is the bolt holding it to the wall. No bolt, no shelf. No assumption, no statement.

### The Two-Gate Test

\`\`\`
Gate 1 — The Collapse Test:
  remove the belief from the statement's logic.
  Does the statement collapse (become pointless)?  → it IS an assumption

Gate 2 — The Written Test:
  is the belief already written in the statement?
  YES → NOT an assumption (it's stated, not assumed)
\`\`\`

### Worked Example — The Festival Sale

**Question:** Statement: "The company has decided to reduce the price of its products during the festival season."

Which is the most valid assumption — (a) Sales increase during the festival season, (b) Reducing price always reduces profit, (c) The festival season ends soon, (d) The company's products are of poor quality?

\`\`\`
Gate 1 — Collapse Test on each option:

(a) Sales increase during festivals?
    Remove it: why would anyone cut prices for festivals?
    The statement collapses → (a) IS an assumption ✓

(b) Reducing price always reduces profit?
    Remove it: the statement still makes sense.
    And it is not needed → reject

(c) The festival season ends soon?
    Removing it changes nothing → reject

(d) Products are of poor quality?
    Not needed for the price-cut logic → reject
\`\`\`

**Answer: (a)** — the decision to cut festival prices only makes sense if the company believes festivals boost sales.

### The Belief Checklist (What to Look For)

| Type of belief | Statement hint | Example assumption |
|---|---|---|
| Demand exists | Any announcement of a service | "Students will use the free Wi-Fi" |
| People will respond | Campaigns, drives, warnings | "People will come to get vaccinated" |
| The action is possible | Plans, deadlines, rules | "Students have projects to submit" |
| The timing matters | "By the 10th", "during the season" | "The deadline can be met" |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Picking a stated fact | "But the statement says it!" | Stated facts are not assumptions — check Gate 2 |
| Picking general knowledge | True beliefs that aren't needed | Truth ≠ assumption; the statement must NEED it |
| Picking wild beliefs | Dramatic but irrelevant | Run every option through the Collapse Test |
| Rejecting small assumptions | "Obviously" | Obviousness is the point — assumptions are quiet |

### Quick Self-Test (answers at the bottom)

1. Statement: "The college will provide free Wi-Fi to all hostel students." Valid assumption — (a) Hostel students need internet  (b) The college already provided free Wi-Fi  (c) Hostel students own cars  (d) Wi-Fi is banned in hostels
2. Statement: "The government has announced free bus travel for senior citizens." Valid assumption — (a) Senior citizens will use public buses  (b) Buses run only at night  (c) Senior citizens own cars  (d) Other passengers will object
3. Statement: "Please deposit the fee by the 10th of this month." Valid assumption — (a) Students have fee dues to pay  (b) The 10th is a holiday  (c) Fees are refundable  (d) Only online payment is accepted
4. Statement: "The principal has announced that students must submit their projects by Friday." Valid assumption — (a) Students were assigned projects  (b) Friday is a holiday  (c) Projects are graded  (d) The school will close
5. Statement: "The company reduced prices during the festival season." The Collapse Test asks — (a) Does the statement fall apart without the belief?  (b) Is the belief written in the statement?  (c) Is the belief true?  (d) Is the belief popular?

**Answers:** 1→a, 2→a, 3→a, 4→a, 5→a (Gate 2 is a separate test — Gate 1 is the collapse).

### Key Takeaway

An assumption is the unspoken belief without which the statement collapses. Run every option through the Collapse Test — remove it and see if the statement still makes sense. Stated facts are never assumptions.`,
    lessonSlug: 'statement-conclusion-critical-reasoning',
    order: 1
  },
  {
    title: 'Statement & Conclusion',
    slug: 'statement-conclusion',
    description: 'Run the Three-Gate Test — statement-only facts, full force for "must" conclusions, and nothing added beyond the statement\'s echo.',
    explanation: `### The Simple Idea

A conclusion is an ending the **statement alone forces to be true**. If the statement is true, the conclusion must be true — no outside facts, no guesses, no "everyone knows" reasoning.

> **The Golden Rule: the statement is the only witness.** Outside knowledge is the defence lawyer's job, not yours. If the statement doesn't force it, it doesn't follow.

### The Three-Gate Test

\`\`\`
Gate 1 — The Statement-Only Gate:
  does the conclusion use ONLY facts from the statement?

Gate 2 — The Force Gate:
  strong words ("must", "all", "definitely") need FULL force —
  the statement must guarantee the conclusion, not suggest it

Gate 3 — The Echo Gate:
  does the conclusion re-say the statement's information
  without adding new facts?
\`\`\`

### Force-Word Dictionary

| Word in the conclusion | What it demands | Example |
|---|---|---|
| MUST / DEFINITELY | Total force — the statement guarantees it | "Ravi receives a scholarship" (guaranteed) |
| CAN / POSSIBLY | Only consistency — it may be true | "Ravi might be the topper" (possible) |
| ALL | Every member, no exceptions | "All 90%+ scorers get scholarships" |
| SOME | At least one member | "Some students receive scholarships" |

### Worked Example — The Scholarship Rule

**Question:** Statement: "All students who score above 90% receive a scholarship. Ravi scored 92%."

Which conclusion follows — (a) Ravi receives a scholarship, (b) All students receive scholarships, (c) Ravi is the class topper, (d) Ravi failed?

\`\`\`
Gate 1 — Statement-Only:
(a) Uses "Ravi scored 92%" + "90%+ gets a scholarship" → passes ✓
(b) "All students" — the statement only covers 90%+ scorers → fails
(c) "Topper" — no rank information in the statement → fails
(d) "Failed" — contradicts the stated 92% → fails

Gate 2 — Force:
(a) "Ravi receives a scholarship" is GUARANTEED: 92 > 90 → full force ✓

Gate 3 — Echo:
(a) re-says the rule applied to Ravi, adds nothing new ✓
\`\`\`

**Answer: (a)** — Ravi receives a scholarship. The statement forces it.

### The "More Than" Mirror

"Delhi has **more** traffic jams than Mumbai" forces one mirror conclusion: "Mumbai has **fewer** traffic jams than Delhi". It does NOT force "Mumbai has no traffic jams" or "Delhi is bigger".

\`\`\`
Delhi > Mumbai (traffic jams)
  forces:  Mumbai < Delhi ✓
  not:     Mumbai = 0 jams ✗
  not:     Delhi is bigger ✗ (outside information)
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Bringing outside knowledge | "Everyone knows Delhi is bigger" | The statement is the only witness |
| Confusing possible with certain | "He might be the topper" | MUST needs full force; possibly is not follows |
| Over-reading "all" | "All students" when the rule covers only 90%+ | Respect the rule's limits exactly |
| Mirroring too far | "Mumbai has no jams" from "Delhi has more" | Mirror only the comparison, nothing else |
| Choosing "obvious" endings | Plausible but unforced | If the statement doesn't force it, it doesn't follow |

### Quick Self-Test (answers at the bottom)

1. Statement: "All students who score above 90% receive a scholarship. Ravi scored 92%." Which follows? — (a) Ravi receives a scholarship  (b) All students receive scholarships  (c) Ravi is the topper  (d) Ravi failed
2. Statement: "Only students with at least 75% attendance can sit for the exam." Conclusions: (1) Students below 75% attendance cannot sit for the exam  (2) All students have 75% attendance. — (a) Only 1 follows  (b) Only 2 follows  (c) Both follow  (d) Neither follows
3. Statement: "Delhi has more traffic jams than Mumbai." Which follows? — (a) Mumbai has fewer traffic jams than Delhi  (b) Mumbai has no traffic jams  (c) Delhi is bigger than Mumbai  (d) Flyovers solve traffic jams
4. Statement: "The cricket match will start at 4 PM." Conclusions: (1) The match was scheduled for 4 PM  (2) The match will end by 8 PM. — (a) Only 1 follows  (b) Only 2 follows  (c) Both follow  (d) Neither follows
5. A conclusion with the word "MUST" needs — (a) Total force from the statement  (b) Only a hint  (c) Outside knowledge  (d) A guess

**Answers:** 1→a, 2→a, 3→a, 4→a, 5→a.

### Key Takeaway

A conclusion follows only when the statement forces it — no outside facts, no maybe. Run each option through the Three-Gate Test: statement-only facts, full force for "must" conclusions, and nothing added beyond the statement's echo.`,
    lessonSlug: 'statement-conclusion-critical-reasoning',
    order: 2
  },
  {
    title: 'Clocks',
    slug: 'clocks',
    description: 'Two speeds — 6° per minute for the minute hand, 0.5° for the hour — one formula |30H − 5.5M|, and always take the smaller angle.',
    explanation: `### The Simple Idea

The clock face is a 360° circle. The minute hand races, the hour hand crawls — and the angle between them at any time comes from one formula.

> **The Golden Rule: never compare the hands, compare the angles.** Find where each hand points on the 360° circle, then subtract. The hands themselves are a distraction.

### The Two Speeds (The Only Numbers You Need)

| Hand | One full round | Speed per minute | Memory anchor |
|---|---|---|---|
| Minute hand | 360° in 60 min | **6° per minute** | 360 ÷ 60 = 6 |
| Hour hand | 360° in 12 hours | **0.5° per minute** | 30° per hour, 30 ÷ 60 = 0.5 |

The hour hand is not parked at an hour mark — at 3:30 it sits **halfway** between 3 and 4.

### The Angle Formula

\`\`\`
Angle = | 30H − 5.5M |
       H = hour (12-hour clock), M = minutes

If the angle is more than 180°, use 360 − angle (the smaller angle)
\`\`\`

Why 5.5? The minute hand gains 6° on the hour hand's 0.5° every minute — a relative speed of 5.5° per minute.

### Worked Example — The 3:30 Angle

**Question:** Find the angle between the hour and minute hands at 3:30.

\`\`\`
Step 1 — where is the hour hand?
3 hours × 30° = 90°, plus half an hour × 0.5° per min = 15°
Hour hand at: 90 + 15 = 105°

Step 2 — where is the minute hand?
30 minutes × 6° = 180°

Step 3 — the angle between them:
180 − 105 = 75°

The angle at 3:30 is 75°
\`\`\`

### The Three Famous Meetings

| Event | How often | Formula |
|---|---|---|
| Hands coincide | Every 65 5/11 minutes | They overlap 11 times in 12 hours |
| Hands at 180° (straight line) | 11 times in 12 hours | Opposite each other |
| Hands at 90° (right angle) | 22 times in 12 hours | Twice every hour, almost |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting the hour hand moves | 3:30 treated as 90° | Add 0.5° per minute to the hour hand |
| Reporting the big angle | 285° at 3:30 | If angle > 180°, use 360 − angle |
| Using 24-hour time | 15:30 confused with 3:30 | Convert to 12-hour clock first |
| Mixing the speeds | 0.5° given to the minute hand | Minute = 6°, hour = 0.5° — never swap |

### Quick Self-Test (answers at the bottom)

1. Angle between the hands at 3:30 — (a) 90°  (b) 75°  (c) 105°  (d) 60°
2. Angle between the hands at 6:00 — (a) 0°  (b) 90°  (c) 45°  (d) 180°
3. Angle between the hands at 9:00 — (a) 90°  (b) 60°  (c) 30°  (d) 270°
4. The minute hand moves how many degrees in 1 minute? — (a) 30°  (b) 0.5°  (c) 6°  (d) 60°
5. The hour hand moves how many degrees in 1 minute? — (a) 6°  (b) 0.5°  (c) 30°  (d) 1°

**Answers:** 1→b, 2→d, 3→a, 4→c, 5→b.

### Key Takeaway

Every clock question is angle maths: hour hand at 30H + 0.5M degrees, minute hand at 6M degrees. Subtract, and if the result exceeds 180°, take the smaller angle — the hands always make two angles, and the question wants the smaller one.`,
    lessonSlug: 'clocks-calendars',
    order: 1
  },
  {
    title: 'Calendars',
    slug: 'calendars',
    description: 'Count the odd days — 1 per ordinary year, 2 per leap year — from Monday 1 January 1900, and let the remainder name the weekday.',
    explanation: `### The Simple Idea

An ordinary year has 52 weeks plus **one extra day**. That extra day is why the same date moves one weekday forward every year — and two weekdays after a leap year. Count those extra days and you can name any date in history.

> **The Golden Rule: only the leftover days matter.** Every complete week changes nothing. Find the odd days, divide by 7, and the remainder is your weekday shift.

### The Odd-Day Dictionary

| Year type | Odd days | Why |
|---|---|---|
| Ordinary year | 1 | 365 = 52 weeks + 1 |
| Leap year | 2 | 366 = 52 weeks + 2 |
| 100 years | 5 | (76 × 1) + (24 × 2) = 124 → 124 mod 7 = 5 |
| 400 years | 0 | The whole 400-year cycle repeats |

**The century rule:** a century year (1900, 2000) is a leap year ONLY if divisible by 400. So 2000 was a leap year; 1900 was not.

### The Four-Step Odd-Day Count

\`\`\`
Step 1: fix the anchor — 1 January 1900 was a MONDAY
Step 2: count the years from the anchor to the target year,
        adding 1 odd day per ordinary year and 2 per leap year
Step 3: add the odd days from 1 Jan to the target date in the target year
Step 4: total mod 7 → that many weekdays after Monday
        (0 = Monday, 1 = Tuesday ... 6 = Sunday)
\`\`\`

### Worked Example — Republic Day 1950

**Question:** What day of the week was 26 January 1950?

\`\`\`
Step 1 — years from 1900 to 1949 = 50 years:
leap years among them (1904 to 1948) = 12
odd days = 50 + 12 = 62 → 62 mod 7 = 6

Step 2 — days in 1950 up to 26 January:
25 days → 25 mod 7 = 4

Step 3 — total shift:
6 + 4 = 10 → 10 mod 7 = 3

Step 4 — 3 weekdays after Monday:
Tuesday, Wednesday, THURSDAY

26 January 1950 was a Thursday ✓
\`\`\`

### The Leap-Count Shortcut

From 1900 to any year Y (Y ≤ 2099):

\`\`\`
leaps = (Y − 1904) ÷ 4 rounded down + 1   (when Y ≥ 1904)
ordinary years = (Y − 1900) − leaps
\`\`\`

Only use it when the span is long — for short spans, list the leap years.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Counting the anchor year | 1900 counted as a leap year | 1900 is not divisible by 400 → ordinary |
| Forgetting Feb 29 | The leap day itself | Leap years add 2 odd days, not 1 |
| Using 365 for everything | Every year treated alike | Check divisibility by 4 and 400 |
| Mixing up mod-7 direction | Adding instead of the remainder | Only the remainder matters — 62 → 6 |
| Double counting the target day | Counting 26 Jan as a full day | Days after 1 Jan: date − 1 |

### Quick Self-Test (answers at the bottom)

1. Day of the week on 26 January 1950 — (a) Wednesday  (b) Friday  (c) Thursday  (d) Saturday
2. Odd days in a leap year — (a) 1  (b) 2  (c) 0  (d) 3
3. Day of the week on 15 August 1947 — (a) Saturday  (b) Friday  (c) Thursday  (d) Monday
4. Which of these is a leap year? — (a) 1900  (b) 1800  (c) 2100  (d) 2000
5. Odd days in 100 ordinary years — (a) 5  (b) 1  (c) 2  (d) 6

**Answers:** 1→c, 2→b, 3→b, 4→d, 5→a.

### Key Takeaway

Calendars are a count of leftovers: 1 odd day per ordinary year, 2 per leap year, century years leap only on divisibility by 400. From the Monday of 1 January 1900, shift by the total remainder and the weekday names itself.`,
    lessonSlug: 'clocks-calendars',
    order: 2
  },
  {
    title: 'Input-Output Reasoning',
    slug: 'input-output',
    description: 'One rule, one element per step — lock each placed number and trace the rest; the last element always lands for free.',
    explanation: `### The Simple Idea

A machine takes an input — numbers, words, or both — and rearranges it in steps. Every step follows **exactly one rule**, and the machine moves **exactly one element** per step. Find the rule from the first two steps, and every later step predicts itself.

> **The Golden Rule: one rule, one element, one step.** The machine is not chaotic — it is the most patient sorter in the world. It moves a single item to its final place, then repeats.

### The Machine Rulebook (Common Patterns)

| Pattern | What the machine does | Example |
|---|---|---|
| Ascending | Smallest number first, one per step | 42 17 85 → 17 42 85 |
| Descending | Biggest number first, one per step | 42 17 85 → 85 42 17 |
| Alphabetical | A-word first (or last), one per step | Cat Dog Ant → Ant Cat Dog |
| Mixed | Two rules at once (e.g. numbers descending, words alphabetically) | Words and numbers each move on their own track |

### The Trace Method

\`\`\`
Step 1: read steps 1 and 2 — identify WHICH element moved and WHERE it went
Step 2: that element is now "locked" — never moves again
Step 3: trace the remaining steps in your head, locking one element each time
Step 4: for "after N steps" questions, count the locked elements
\`\`\`

### Worked Example — The Sorting Machine

**Question:** Input: \`42 17 85 23 56\`. A machine rearranges the numbers in ascending order, moving exactly one number per step.

\`\`\`
Input :  42  17  85  23  56
Step 1 : 17  42  85  23  56      (17 — the smallest — locks at the front)
Step 2 : 17  23  42  85  56      (23 locks in seat 2)
Step 3 : 17  23  42  56  85      (56 locks in seat 4)
Step 4 : 17  23  42  56  85      (85 is already in place — machine stops)
\`\`\`

**After Step 2 the input is: \`17 23 42 85 56\`.** The machine finishes in 3 working steps (Step 4 changes nothing).

### The "Already-Placed" Trap

Sometimes an element is already in its final seat — the machine skips it. \`85 17 42 23 56\` needs only 3 moves to become \`17 23 42 56 85\`: 17 to front, 23 to seat 2, 56 to seat 4. The last number always lands for free.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Moving two elements at once | "17 and 23 both go" | One element per step — count them |
| Rearranging everything | Rewriting the whole input each step | Lock one element; the rest stay put |
| Wrong direction | Ascending done as descending | Name the rule out loud first |
| Counting the final step twice | 3 moves reported as 4 | The machine stops when sorted |

### Quick Self-Test (answers at the bottom)

1. Input \`42 17 85 23 56\`, ascending one per step. After Step 2 — (a) 17 23 42 85 56  (b) 17 42 85 23 56  (c) 17 23 85 42 56  (d) 23 17 42 85 56
2. Input \`15 08 23 09 45\`, descending one per step. After Step 1 — (a) 45 15 08 23 09  (b) 08 15 23 09 45  (c) 15 08 23 09 45  (d) 45 08 23 09 15
3. How many working steps to sort \`42 17 85 23 56\` ascending? — (a) 2  (b) 3  (c) 4  (d) 5
4. How many elements does the machine move per step? — (a) 1  (b) 2  (c) 3  (d) all of them
5. Input \`85 17 42 23 56\` ascending — the element already in place is — (a) 17  (b) 42  (c) 85  (d) 23

**Answers:** 1→a, 2→a, 3→b, 4→a, 5→c.

### Key Takeaway

Input-Output machines move one element per step under one rule. Lock each moved element in place, trace the rest in your head, and count the working steps — the last element always lands for free.`,
    lessonSlug: 'input-output-logical-sequences',
    order: 1
  },
  {
    title: 'Logical Sequence of Events',
    slug: 'logical-sequence',
    description: 'Build the timeline from the ends — first event and last event first, the middle fills itself, and the story test decides.',
    explanation: `### The Simple Idea

Events in a question are listed out of order; your job is the natural timeline. Every process has a **first event** (nothing comes before it) and a **last event** (nothing comes after it) — find those two, and the middle orders itself.

> **The Golden Rule: the sandwich is made from the outside in.** Lock the first and last events first. The middle can only arrange itself one way.

### The Sandwich Method

\`\`\`
Step 1: find the FIRST event — nothing can happen before it
        (you cannot be interviewed before you apply)
Step 2: find the LAST event — nothing can happen after it
        (the offer letter is not the end; joining is)
Step 3: the middle events order themselves between the two ends
Step 4: read the full sequence aloud — it must sound like a story
\`\`\`

### Worked Example — The Job Process

**Question:** Arrange in a logical order — 1. Application  2. Offer letter  3. Interview  4. Joining  5. Shortlisting

\`\`\`
Step 1 — the FIRST event:
nothing precedes Application → 1 first

Step 2 — the LAST event:
nothing follows Joining → 4 last

Step 3 — the middle:
Shortlisting follows the application
Interview follows shortlisting
Offer letter follows the interview

Step 4 — the story:
Application → Shortlisting → Interview → Offer letter → Joining

Order: 1, 5, 3, 2, 4
\`\`\`

### The Timeline Toolkit (Common Life Cycles)

| Domain | First event | Middle | Last event |
|---|---|---|---|
| Job process | Application | Shortlisting → Interview → Offer | Joining |
| Buying a house | Searching | Loan approval → Agreement → Registration | Moving in |
| Cooking | Buying ingredients | Mixing → Baking | Serving |
| Exam day | Admit card | Exam → Results | Counselling |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Starting mid-process | Interview placed first | Nothing precedes Application — check every "first" |
| Ending early | Offer treated as the end | Joining, not the offer, closes the process |
| Jumping ahead | Interview before shortlisting | Read each pair: can B happen before A? |
| Ignoring the story test | Technically ordered, reads oddly | Read it aloud — stories don't skip chapters |

### Quick Self-Test (answers at the bottom)

1. Logical order of: 1. Application  2. Offer  3. Interview  4. Joining  5. Shortlisting — (a) 1, 5, 3, 2, 4  (b) 1, 3, 5, 2, 4  (c) 5, 1, 3, 2, 4  (d) 1, 5, 2, 3, 4
2. Logical order of: 1. Bake  2. Buy flour  3. Eat  4. Mix  5. Serve — (a) 2, 4, 1, 5, 3  (b) 4, 2, 1, 5, 3  (c) 2, 1, 4, 5, 3  (d) 2, 4, 5, 1, 3
3. In a job process, the FIRST event is — (a) Interview  (b) Application  (c) Offer  (d) Joining
4. In a job process, the LAST event is — (a) Application  (b) Shortlisting  (c) Offer  (d) Joining
5. The Sandwich Method says — (a) Find the first and last events first  (b) Order the middle first  (c) Pick any event to start  (d) Skip the story test

**Answers:** 1→a, 2→a, 3→b, 4→d, 5→a.

### Key Takeaway

Logical sequences are timelines rebuilt from the ends: first event and last event first, middle fills itself, story test last. If the sequence doesn't read like a story, it isn't the answer.`,
    lessonSlug: 'input-output-logical-sequences',
    order: 2
  },
  {
    title: 'Parts of Speech & Basics',
    slug: 'parts-of-speech',
    description: 'Eight jobs, one Job Test — what does the word DO in this sentence? Names, acts, or describes; the sentence always decides.',
    explanation: `### The Simple Idea

Every word in a sentence has a job. Eight jobs exist, and the same word can change jobs in different sentences — "run" is a verb in "I run daily" but a noun in "a morning run". Your job: read the sentence, not the word.

> **The Golden Rule: the sentence decides the job.** A word is not a noun forever. Ask what it DOES in this sentence — that is the answer.

### The Eight Jobs (One Sentence Holds Them All)

"Ah! The beautiful girl quickly jumped over the fence."

| Word | Part of speech | Its job |
|---|---|---|
| Ah! | Interjection | Sudden feeling |
| The | Article | Points at a noun |
| beautiful | Adjective | Describes the noun |
| girl | Noun | Names the person |
| quickly | Adverb | Describes the verb |
| jumped | Verb | The action |
| over | Preposition | Links to the fence |
| fence | Noun | Names the thing |

### The Job Test (The Only Question You Need)

\`\`\`
What does the word DO in this sentence?

NAMES a person, place, thing, idea  → NOUN
Shows ACTION or state                → VERB
DESCRIBES a noun                     → ADJECTIVE
DESCRIBES a verb                     → ADVERB
Shows position/time/link (in, on, at, over) → PREPOSITION
Links two ideas (and, but, because)  → CONJUNCTION
Points at a noun (the, a, an)        → ARTICLE
Emotion or call-out (wow, hey)       → INTERJECTION
\`\`\`

### Worked Example — The Fox Sentence

**Question:** In "The quick brown fox jumps over the lazy dog", what part of speech is the word "jumps"?

\`\`\`
The Job Test — what does "jumps" DO?
The fox JUMPS → it is the action of the sentence.

"jumps" is a VERB ✓
\`\`\`

Quick scan of the whole sentence:

| Word | Job | Word | Job |
|---|---|---|---|
| The | Article | jumps | Verb |
| quick | Adjective | over | Preposition |
| brown | Adjective | the | Article |
| fox | Noun | lazy | Adjective |
| — | — | dog | Noun |

### The Swap Test (Words Change Jobs)

The same word in different sentences:

\`\`\`
"Run quickly!"          → run = VERB (command)
"I take a morning run"  → run = NOUN (the thing)
"a run-down building"   → run = ADJECTIVE (describes building)
\`\`\`

When two jobs are possible, the sentence always decides.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Memorising word lists | "Jump is always a verb" | The sentence decides — use the Job Test |
| Confusing adjective/adverb | "Quickly describes the fox" | Quickly describes the JUMP (a verb) → adverb |
| Missing the article | "The is not a word" | The, a, an are articles — a part of speech |
| Naming only 5 parts | "Noun verb adjective..." | Eight jobs: NPV AAP CI |

### Quick Self-Test (answers at the bottom)

1. In "The quick brown fox jumps over the lazy dog", "jumps" is — (a) Noun  (b) Verb  (c) Adjective  (d) Adverb
2. In the same sentence, "lazy" is — (a) Adjective  (b) Adverb  (c) Verb  (d) Preposition
3. In the same sentence, "over" is — (a) Conjunction  (b) Adverb  (c) Preposition  (d) Article
4. How many parts of speech are there in English? — (a) 5  (b) 6  (c) 7  (d) 8
5. In "I take a morning run", "run" is — (a) Verb  (b) Noun  (c) Adjective  (d) Adverb

**Answers:** 1→b, 2→a, 3→c, 4→d, 5→b.

### Key Takeaway

Parts of speech are jobs, not identities. Ask what the word does in THIS sentence — names (noun), acts (verb), describes a noun (adjective), describes a verb (adverb) — and the sentence always decides.`,
    lessonSlug: 'verbal-ability-essentials',
    order: 1
  },
  {
    title: 'Common Grammar Rules',
    slug: 'common-grammar-rules',
    description: 'The Agreement Rule — singular subject, singular verb; ignore "of the..." phrases; each/every/either/neither are always singular.',
    explanation: `### The Simple Idea

English sentences obey rules, and the most tested one is **agreement**: a singular subject needs a singular verb, a plural subject needs a plural verb. One broken agreement is enough to fail a sentence.

> **The Golden Rule: singular subject, singular verb.** "He don't" is wrong because "he" is singular but "don't" is plural. Match the verb to the subject, not to whatever sits nearest it.

### The Agreement Rulebook

| Rule | Example (correct) | Wrong version |
|---|---|---|
| Singular subject → singular verb | He **doesn't** like coffee | He don't like coffee |
| Plural subject → plural verb | The books **are** on the table | The books is on the table |
| Each / Every / Either / Neither → singular | **Each** of the students **has** submitted | Each of the students have submitted |
| Neither ... nor → verb agrees with the NEAREST subject | Neither the teacher nor the students **were** there | Neither the teacher nor the students was there |
| Collective noun as one unit → singular | The team **is** playing well | The team are playing well |
| "There is/are" → verb follows the noun after it | There **are** many books | There is many books |

### The Nearest-Noun Rule

For "either...or" and "neither...nor", the verb agrees with the subject **closest to it**:

\`\`\`
Neither the teacher nor the students WERE there   (students → plural ✓)
Either the students or the teacher IS coming      (teacher → singular ✓)
\`\`\`

### Worked Example — The Violation Hunt

**Question:** "Each of the students have submitted their assignments." Which rule does this sentence violate?

\`\`\`
Step 1 — find the subject:
"Each of the students" → the subject is EACH, not students

Step 2 — apply the rule:
Each → singular → needs the singular verb HAS

Step 3 — the violation:
"Each ... have" breaks subject-verb agreement
Correct: "Each of the students HAS submitted their assignments"
\`\`\`

### The One-Pass Check (For Any Sentence)

\`\`\`
1. Find the true subject (ignore "of the...", "among the..." phrases)
2. Name it: singular or plural?
3. Check the verb matches — if not, the sentence is violated
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Trusting the nearest noun | "students have" sounds fine | The subject is "each" — the "of the students" phrase is a distraction |
| Missing "each/every" | Treated as ordinary plurals | Each, every, either, neither are ALWAYS singular |
| "There is" with plurals | "There is many books" | After "there is/are", the noun decides: there ARE books |
| Collective nouns | "The team are" | One unit → singular: the team IS |
| Tense drift | Past and present mixed | Keep one tense for the whole sentence |

### Quick Self-Test (answers at the bottom)

1. "Each of the students have submitted their assignments" violates — (a) Subject-verb agreement  (b) Tense consistency  (c) Preposition rule  (d) Nothing
2. Correct version: "Neither of the answers are correct" — (a) Neither of the answers is correct  (b) Neither of the answer is correct  (c) No error  (d) Neither of the answers were correct
3. Correct version: "There is many books on the table" — (a) There are many books on the table  (b) There is many book on the table  (c) No error  (d) There were many book on the table
4. Which sentence is correct? — (a) He don't like coffee  (b) He doesn't likes coffee  (c) He doesn't like coffee  (d) He not like coffee
5. "Neither the teacher nor the students ___ there" — (a) was  (b) were  (c) is  (d) has

**Answers:** 1→a, 2→a, 3→a, 4→c, 5→b (nearest noun "students" is plural).

### Key Takeaway

Agreement is the most tested grammar rule: singular subject, singular verb. Ignore the "of the..." phrases, remember each/every/either/neither are always singular, let the noun after "there is/are" decide, and match "neither...nor" to the nearest subject.`,
    lessonSlug: 'verbal-ability-essentials',
    order: 2
  },
  {
    title: 'Subject-Verb Agreement',
    slug: 'subject-verb-agreement',
    description: 'The Sentence Hospital — find the true subject (the patient), check the verb\'s pulse, prescribe the cure; a number of = plural, the number of = singular.',
    explanation: `### The Simple Idea

Every sentence is a patient arriving at the hospital. The subject is the patient's name, the verb is the heartbeat. **One patient, one heartbeat.** If the patient is singular, the heartbeat must be singular — a plural heartbeat on a singular patient is a cardiac emergency.

> **The Golden Rule: the subject is the patient, the "of the..." phrase is just the waiting room.** "A number of students" — the patient is the NUMBER, not the students.

### The Diagnosis Method

\`\`\`
┌─────────────────────────────────────────────┐
│  STEP 1  Find the patient (the true subject) │
│           ignore "of the...", "among the..."  │
├─────────────────────────────────────────────┤
│  STEP 2  Check the pulse (the verb)          │
│           singular patient → singular verb    │
├─────────────────────────────────────────────┤
│  STEP 3  Diagnose — pulse mismatch?           │
│           YES → agreement violation → cure    │
└─────────────────────────────────────────────┘
\`\`\`

### The Infection List (The Subjects That Fool Everyone)

| Infected subject | Looks | Actually | Correct verb |
|---|---|---|---|
| Each / Every / Either / Neither | plural-ish | **singular** | has / is |
| Everyone / Someone / Nobody | many people | **singular** | wants / is |
| The team / The jury (one unit) | many members | **singular** | plays / decides |
| A number of students | singular | **plural** | are |
| The number of students | plural-ish | **singular** | is |
| Five kilometers / ₹500 (one amount) | plural | **singular** | is |
| Neither X nor Y | two people | **the nearest one** | decides the verb |

### The X-Ray Table (Wrong → Right)

| Wrong (broken heartbeat) | Right (cured) |
|---|---|
| A number of students **is** late today | A number of students **are** late today |
| The number of students **are** rising | The number of students **is** rising |
| Each of the boys **have** a book | Each of the boys **has** a book |
| Five kilometers **are** a long walk | Five kilometers **is** a long walk |
| The team **are** playing well | The team **is** playing well |
| Nobody **were** present | Nobody **was** present |

### Worked Example — Emergency Surgery

**Question:** "A number of students is late to class today." Correct the sentence.

\`\`\`
Step 1 — find the patient:
"A number of students" → the patient is NUMBER

Step 2 — check the pulse:
Number... is the patient singular? NO —
"A number of" means MANY → plural heartbeat needed

Step 3 — prescribe:
"A number of students ARE late to class today" ✓
\`\`\`

> **Interviewer whisper:** "A number of" vs "The number of" is the most repeated trick in campus aptitude papers. A number of = many (plural). The number of = the count (singular). Learn these two and you own a free mark.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Trusting the nearest noun | "students is" sounds wrong, so you pick "are"... but with "the number of" the answer flips | Name the TRUE subject before touching the verb |
| Treating everyone/someone as plural | "Everyone are here" | Everyone, someone, nobody are ALWAYS singular |
| Measuring words | "Five kilometers are" | One amount → singular: "is a long walk" |
| Splitting the team | "The team are" | One unit → singular |
| Forgetting either/or | Verb matched to the far subject | Neither...nor / either...or → nearest subject wins |

### Quick Self-Test (answers at the bottom)

1. "A number of students ___ late today" — (a) is  (b) are  (c) was  (d) be
2. "The number of students ___ rising" — (a) are  (b) were  (c) is  (d) have been
3. "Each of the boys ___ a book" — (a) have  (b) had  (c) has  (d) are having
4. "Five kilometers ___ a long walk" — (a) are  (b) is  (c) were  (d) have
5. "Nobody ___ present at the meeting" — (a) were  (b) are  (c) was  (d) have

**Answers:** 1→b, 2→c, 3→c, 4→b, 5→c.

### Key Takeaway

Sentence correction is diagnosis: find the true subject, check the verb's pulse, prescribe. The waiting-room phrases ("of the...") never decide the verb — and "a number of" (plural) and "the number of" (singular) are the classic ambush pair.`,
    lessonSlug: 'sentence-correction-grammar',
    order: 1
  },
  {
    title: 'Tenses & Articles',
    slug: 'tenses-articles',
    description: 'The Verb Thermometer — the verb\'s clock must match the sentence\'s calendar: yesterday is past, since/for is perfect; articles match the SOUND, not the letter.',
    explanation: `### The Simple Idea

Verbs carry a clock: past, present, future. Sentences carry a calendar: signal words like "yesterday", "now", "tomorrow". **The verb's clock must match the sentence's calendar** — a broken match is a tense error.

> **The Golden Rule: let the signal word set the temperature.** "Yesterday" always beats your memory — if the calendar says past, the verb must sweat past tense.

### The Verb Thermometer

\`\`\`
FUTURE  →  will + verb      tomorrow, next week, soon
PRESENT →  verb(s), is/are  now, these days, every day
PERFECT →  has/have + verb  since 2019, for 3 years
PAST    →  verb + ed / was  yesterday, last week, ago
\`\`\`

The Perfect zone is the sneaky one — "since/for" demand \`has/have + past participle\` (have lived), while a finished time like "yesterday" demands the plain past (visited).

### The Signal-Word Clock

| Signal word | Zone | Example |
|---|---|---|
| yesterday / last week / ago | Past | She **visited** the museum yesterday |
| since 2019 / for 3 years | Present perfect | They **have lived** here since 2019 |
| now / these days / every day | Present | He **plays** chess every day |
| tomorrow / next week / soon | Future | We **will go** to Jaipur next week |

### Worked Example 1 — The Tense Fix

**Question:** "She has visited the museum yesterday." Correct the tense.

\`\`\`
Step 1 — read the calendar:
"yesterday" → PAST zone

Step 2 — read the verb's clock:
"has visited" → present perfect (since/for zone)

Step 3 — mismatch! Prescribe the past:
"She VISITED the museum yesterday" ✓
\`\`\`

### The Article Rules (a / an / the / nothing)

| Rule | Example | Memory anchor |
|---|---|---|
| a — before a consonant SOUND | a university, a cat | U says "yu" → consonant sound |
| an — before a vowel SOUND | an elephant, an hour | H is silent in "hour" → vowel sound |
| the — a specific, known thing | the museum, the sun | Only one / already mentioned |
| no article — general plurals | Students love holidays | No "the", no "a", just the plural |

### Worked Example 2 — The Article Fix

**Question:** "I saw a elephant at the zoo." Correct it.

\`\`\`
Step 1 — say the next word out loud:
elephant → starts with the SOUND "e" (vowel)

Step 2 — vowel sound → "an":
"I saw AN elephant at the zoo" ✓
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Spelling, not sound | "a university" rejected because u is a vowel | The SOUND decides: "yu" → a |
| The silent H | "a hour" | Hour sounds like "our" → an hour |
| Since/for + past | "I lived here since 2019" | Since/for demand have lived |
| Finished time + perfect | "has visited yesterday" | Yesterday is closed → visited |
| Mixing zones mid-sentence | "She went and then she goes" | One calendar per sentence |

### Quick Self-Test (answers at the bottom)

1. "She ___ to the museum yesterday" — (a) has visited  (b) visited  (c) visits  (d) is visiting
2. "They ___ here since 2019" — (a) lived  (b) have lived  (c) live  (d) are living
3. "I saw ___ elephant at the zoo" — (a) a  (b) an  (c) the  (d) no article
4. "We ___ to Jaipur next week" — (a) went  (b) go  (c) will go  (d) have gone
5. "He is ___ honest man" — (a) a  (b) an  (c) the  (d) no article

**Answers:** 1→b, 2→b, 3→b, 4→c, 5→b (honest — silent h, vowel sound).

### Key Takeaway

Tenses match the calendar: yesterday = past, since/for = perfect, tomorrow = future. Articles match the SOUND, not the letter — an hour, a university. Read the sentence's clock and sound before you choose anything.`,
    lessonSlug: 'sentence-correction-grammar',
    order: 2
  },
  {
    title: 'Synonyms & Antonyms',
    slug: 'synonyms-antonyms',
    description: 'Twins and mirrors — define the word in YOUR words before reading the options, run the Replacement Test in the sentence, and root-decode the unknowns.',
    explanation: `### The Simple Idea

A **synonym** is a twin — a different word, same meaning (candid = frank). An **antonym** is a mirror — a word with the opposite meaning (candid = secretive). The exam never asks "do you know the word" — it asks **can you catch the shade of meaning** that the other three options miss.

> **The Golden Rule: define the word in YOUR words BEFORE you look at the options.** The moment you read the options, the wrong ones start whispering. Lock your own definition first — then the options behave.

### The Clue-Lock Method (3 Steps)

\`\`\`
┌──────────────────────────────────────────────┐
│  STEP 1  DEFINE — say the word's meaning      │
│           in your own words. Write it down.    │
├──────────────────────────────────────────────┤
│  STEP 2  TEST — put each option inside        │
│           the word's original sentence         │
│           (The Replacement Test)               │
├──────────────────────────────────────────────┤
│  STEP 3  LOCK — the option that survives      │
│           the sentence is the twin             │
└──────────────────────────────────────────────┘
\`\`\`

### The Replacement Test (The Sentence Is the Judge)

**Question:** The manager was **candid** about the project delays. Best synonym for "candid"?

\`\`\`
Step 1 — define in your own words:
candid = honest, straight-talking, no hiding

Step 2 — replace candid with each option in the SENTENCE:
"The manager was SECRETIVE about the delays"  → opposite meaning ✗
"The manager was FRANK about the delays"      → same meaning ✓
"The manager was RUDE about the delays"       → different meaning ✗
"The manager was VAGUE about the delays"      → different meaning ✗

Step 3 — lock it:
FRANK is candid's twin ✓
\`\`\`

### The Root Decoder (One Root = Many Free Words)

Learn the roots and whole families come free:

\`\`\`
bene   = good      → benevolent, benefit, benign
mal    = bad       → malevolent, malice, malignant
pre    = before    → predict, precede, precaution
post   = after     → postpone, postscript, postwar
anti   = against   → antidote, antisocial, antipathy
pro    = forward   → progress, promote, project
mono   = one       → monopoly, monotone, monologue
multi  = many      → multiply, multilingual, multimillion
\`\`\`

> **Root power:** "malevolent" without the root is a mystery; with "mal = bad" it is *wishing bad* — the antonym of benevolent. Two roots, two free answers.

### The Negative-Prefix Family (Antonyms by Prefix)

| Prefix | Meaning | Example pair |
|---|---|---|
| un- | not | happy → unhappy |
| in- | not | capable → incapable |
| im- | not (before m/p) | possible → impossible |
| ir- | not (before r) | regular → irregular |
| il- | not (before l) | legal → illegal |
| dis- | not / apart | honest → dishonest |
| non- | not | stop → non-stop |

### The Placement Word Gym (Words That Actually Appear)

| Word | Meaning | Synonym | Antonym |
|---|---|---|---|
| candid | straight-talking | frank, forthright | secretive |
| abundant | plenty | plentiful | scarce, meager |
| diligent | hardworking | industrious | lazy, careless |
| genuine | real, sincere | authentic | fake, counterfeit |
| lucid | clear, easy to follow | clear, coherent | vague, obscure |
| robust | strong, sturdy | sturdy, tough | fragile, weak |
| zealous | full of passion | fervent, eager | indifferent, apathetic |
| taciturn | quiet, speaks little | reserved, reticent | talkative, garrulous |
| wary | cautious, suspicious | cautious | careless, reckless |
| pristine | spotless, original | immaculate | dirty, polluted |

### The Reverse-Answer Trick (Antonyms)

When the question asks for an ANTONYM and you only remember the meaning, write the meaning's opposite first, then hunt:

\`\`\`
Question: antonym of "diligent"?
Your definition: hardworking → opposite: lazy
Scan options: lazy → present → lock it
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Picking the "feels-related" word | Rude picked for candid because both sound blunt | Run the Replacement Test in the sentence |
| Sound-alike traps | "compliment" for "complement" | Homophones need spelling-level care — say both aloud |
| Antonym answers in synonym questions | Secretive offered for candid | Check direction first: twin or mirror? |
| Unknown word panic | Guessing the longest option | Root-decode it: bene/mal/pre/post |
| First-option bias | Always option (a) | Test ALL four options in the sentence |

### Quick Self-Test (answers at the bottom)

1. Best synonym of "candid" — (a) Secretive  (b) Frank  (c) Rude  (d) Vague
2. Best antonym of "abundant" — (a) Plentiful  (b) Enough  (c) Meager  (d) Lively
3. Best synonym of "diligent" — (a) Lazy  (b) Careless  (c) Slow  (d) Hardworking
4. Best antonym of "genuine" — (a) Fake  (b) Real  (c) Honest  (d) True
5. "mal" in "malevolent" means — (a) Good  (b) Bad  (c) Before  (d) Many

**Answers:** 1→b, 2→c, 3→d, 4→a, 5→b.

### Key Takeaway

Synonyms are twins, antonyms are mirrors — and the sentence is the judge. Define the word in your own words first, replace each option into the original sentence, and lock the one that survives. Roots (bene, mal, pre, anti) turn unknown words into free answers.`,
    lessonSlug: 'vocabulary',
    order: 1
  },
  {
    title: 'One-Word Substitution & Idioms',
    slug: 'one-word-substitution-idioms',
    description: 'Meaning-First method — say the phrase as one word in your head, match, reverse-verify; idioms are situation codes — never translate the words.',
    explanation: `### The Simple Idea

**One-word substitution (OWS)** is the reverse of synonyms: instead of one word → many options, you get a **phrase → one word**. **Idioms** are phrases whose meaning can never be guessed word by word — "once in a blue moon" has nothing to do with moons.

> **The Golden Rule: think the word BEFORE you read the options.** For OWS, your brain already knows the word — the options just confirm it. For idioms, never translate; translate the SITUATION instead.

### The Meaning-First Method (OWS)

\`\`\`
┌─────────────────────────────────────────────┐
│  STEP 1  READ the phrase and SAY it as       │
│           one word in your head              │
├─────────────────────────────────────────────┤
│  STEP 2  MATCH your word to the options      │
├─────────────────────────────────────────────┤
│  STEP 3  VERIFY — reverse the substitution:  │
│           does the option expand back into   │
│           the phrase naturally?              │
└─────────────────────────────────────────────┘
\`\`\`

### Worked Example — The Polyglot

**Question:** "A person who speaks many languages" — one word?

\`\`\`
Step 1 — say it as one word: polyglot (poly = many, glot = tongue)
Step 2 — match: options contain polyglot ✓
Step 3 — reverse-verify: a polyglot = a person who speaks
         many languages ✓

Answer: POLYGLOT
\`\`\`

### The OWS Treasure Chest (10 Classic Pairs)

| Phrase | One word | Memory hook |
|---|---|---|
| One who speaks many languages | Polyglot | poly = many |
| One who can't read or write | Illiterate | literate = can read |
| One who writes books | Author | — |
| One who is present everywhere | Omnipresent | omni = all |
| One who never makes mistakes | Infallible | in + fallible |
| One who loves mankind | Philanthropist | phil = love, anthrop = human |
| A place where weapons are kept | Arsenal | — |
| The study of birds | Ornithology | ornitho = bird |
| One who eats human flesh | Cannibal | — |
| Government by one person | Autocracy | auto = self |

### The Idiom Detective (Never Translate Word by Word)

An idiom is a code. Your job is to decode the SITUATION, not the words:

| Idiom | Real meaning | The scene it paints |
|---|---|---|
| A piece of cake | Very easy | Cake is effortless to eat |
| Break the ice | Start a conversation | Silence is ice — break it |
| Once in a blue moon | Very rarely | Blue moons are rare |
| Hit the nail on the head | Be exactly right | The nail goes in perfectly |
| Cost an arm and a leg | Very expensive | You'd pay body parts |
| Under the weather | Feeling ill | Sailing through bad weather |
| In hot water | In trouble | Boiling = danger |
| The ball is in your court | Your turn to act | Tennis: the ball waits for you |
| Call it a day | Stop working | The day's work is done |
| Barking up the wrong tree | Wrong approach | A dog chasing the wrong tree |

> **Interviewer whisper:** idiom questions never test the literal words — a question about "blue moon" wants RARELY, not astronomy. When an option looks like the literal translation, it is always the trap.

### Worked Example — The Blue Moon

**Question:** "My cousin visits us once in a blue moon." What does the idiom mean?

\`\`\`
Step 1 — refuse the literal: this has nothing to do with moons
Step 2 — decode the scene: a blue moon is an extremely rare event
Step 3 — the meaning: my cousin visits VERY RARELY

Answer: very rarely
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Literal translation | "Blue moon = at night" | Idioms describe situations, not words |
| Half-remembering OWS | "Polyglot = one who writes" | Reverse-verify: expand the word back into the phrase |
| Confusing near-pairs | Omniscient vs omnipresent | Knows all ≠ everywhere — check the root |
| Picking the English-looking word | "Orator" for polyglot | Orator speaks WELL — polyglot speaks MANY |
| Skipping the phrase | Answering from the first word | Read the FULL phrase — "one who loves mankind" is not "author" |

### Quick Self-Test (answers at the bottom)

1. One word for "a person who speaks many languages" — (a) Polyglot  (b) Orator  (c) Scholar  (d) Linguist
2. "Once in a blue moon" means — (a) Every day  (b) Very rarely  (c) At night  (d) In winter
3. "The new phone cost an arm and a leg" — the phone was — (a) Cheap  (b) Free  (c) Very expensive  (d) Medium priced
4. One word for "a place where weapons are kept" — (a) Canteen  (b) Arsenal  (c) Auditorium  (d) Library
5. "Barking up the wrong tree" means — (a) Following the wrong approach  (b) A dog in a park  (c) Making noise  (d) Climbing trees

**Answers:** 1→a, 2→b, 3→c, 4→b, 5→a.

### Key Takeaway

One-word substitution is thinking-first: say the phrase as one word in your head, match, then reverse-verify. Idioms are situation codes — never translate the words, decode the scene, and treat any literal option as the trap.`,
    lessonSlug: 'vocabulary',
    order: 2
  },
  {
    title: 'Passage Analysis',
    slug: 'passage-analysis',
    description: 'Two-Pass Method — the 30-second scan of first sentences builds the topic map, then hunt the exact line and cite the rephrased option; details are never the main idea.',
    explanation: `### The Simple Idea

The passage is the answer key — every fact question's answer is written inside it. You are not tested on what you know about the topic; you are tested on **whether you can find the line and rephrase it**.

> **The Golden Rule: never answer from your head. Answer from the passage.** Outside knowledge is not an option — if the passage doesn't say it, it isn't the answer.

### The Two-Pass Method

\`\`\`
┌──────────────────────────────────────────────────┐
│  PASS 1 — THE 30-SECOND SCAN                      │
│  Read ONLY the first sentence of each paragraph.  │
│  That is the topic map of the whole passage.       │
├──────────────────────────────────────────────────┤
│  PASS 2 — THE HUNT                                │
│  Read the question, then hunt the passage for     │
│  the exact spot it points to. Read that spot      │
│  carefully — the rest is scenery.                  │
└──────────────────────────────────────────────────┘
\`\`\`

### The Topic-Map Trick

The first sentence of a paragraph is its **promise**. One scan of the promises tells you where every answer lives:

| Paragraph | First sentence (the promise) | Answers living here |
|---|---|---|
| Para 1 | "India's renewable energy capacity has grown rapidly..." | Growth numbers, fast facts |
| Para 2 | "Solar power leads the expansion..." | Which source grew fastest |
| Para 3 | "Wind energy grew more slowly..." | Wind's problems |
| Para 4 | "Grid stability, not generation, is now the biggest challenge." | The main challenge |

### The Locate-Line-Cite Method (LLC)

\`\`\`
LOCATE  → which paragraph's promise matches the question?
LINE    → find the exact sentence that answers it
CITE    → pick the option that REPHRASES that sentence
\`\`\`

### Worked Example — The Energy Passage

**Passage:** "India's renewable energy capacity has grown rapidly over the past decade. Solar power leads the expansion, with capacity rising from under 3 GW in 2014 to over 60 GW by 2023. Wind energy grew more slowly, hampered by land acquisition delays. Experts argue that grid stability, not generation, is now the biggest challenge."

**Question 1:** Which energy source grew fastest?

\`\`\`
SCAN: the promise of para 2 is "Solar power leads the expansion"
LINE: "Solar power leads the expansion..."
CITE: SOLAR ✓
\`\`\`

**Question 2:** What do experts say is now the biggest challenge?

\`\`\`
SCAN: the promise of para 4 mentions "the biggest challenge"
LINE: "grid stability, not generation, is now the biggest challenge"
CITE: GRID STABILITY ✓
\`\`\`

**Question 3:** What is the main idea of the passage?

\`\`\`
Main idea = the whole passage in one sentence:
"India's renewable energy is growing fast but faces new challenges"
(Solar's numbers are a DETAIL — not the main idea)
\`\`\`

### The Rephrase Test (How to Spot the Right Option)

The correct option **rephrases** the passage's words. The wrong options do one of three crimes:

| Crime | Example | Verdict |
|---|---|---|
| Not mentioned | "Hydro power is declining" | The passage never speaks of hydro → ✗ |
| Outside knowledge | "Coal is cheaper than solar" | True in the world, absent in the passage → ✗ |
| Half-true | "Solar grew, so wind fell" | The passage says wind grew SLOWLY, not that it fell → ✗ |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Answering from memory | "Everyone knows..." | The passage is the only witness |
| Detail vs main idea | Picking solar's numbers for a main-idea question | Main idea = the whole passage in one sentence |
| Extreme words | "Only", "never", "always" options | The passage rarely says only/never — treat them as alarms |
| Skimming past numbers | 3 GW vs 60 GW mixed up | The Hunt: go back to the LINE and cite it |
| Reversed comparisons | "Wind grew faster" for "solar leads" | Read the comparison exactly as written |

### Quick Self-Test (answers at the bottom)

**Passage:** "India's renewable energy capacity has grown rapidly over the past decade. Solar power leads the expansion, with capacity rising from under 3 GW in 2014 to over 60 GW by 2023. Wind energy grew more slowly, hampered by land acquisition delays. Experts argue that grid stability, not generation, is now the biggest challenge."

1. Which energy source grew the fastest? — (a) Solar  (b) Wind  (c) Hydro  (d) Nuclear
2. What do experts say is now the biggest challenge? — (a) Generation  (b) Grid stability  (c) Land acquisition  (d) Funding
3. Wind energy grew more slowly because of — (a) Funding  (b) Land acquisition delays  (c) Low demand  (d) Poor technology
4. The main idea of the passage is — (a) Solar grew from 3 GW to 60 GW  (b) India's renewable energy is growing fast but faces new challenges  (c) Wind energy is better than solar  (d) India has no renewable energy
5. Which statement is NOT mentioned in the passage? — (a) Solar leads the expansion  (b) Wind faced land delays  (c) Hydro power is declining  (d) Grid stability is the biggest challenge

**Answers:** 1→a, 2→b, 3→b, 4→b, 5→c.

### Key Takeaway

The passage holds every answer. Scan the first sentences to build the topic map, hunt the exact line each question points to, and cite the option that rephrases it. Details (solar's numbers) are never the main idea (the whole passage in one sentence).`,
    lessonSlug: 'reading-comprehension',
    order: 1
  },
  {
    title: 'Inference-Based Questions',
    slug: 'inference-questions',
    description: 'Three-Gate Test — supported by a sentence, not stated outright, not contradicted; an inference rides on a sentence, never on your story.',
    explanation: `### The Simple Idea

An **inference** is the conclusion the passage POINTS AT but never writes down. The passage is a trail of footprints; the inference is the walker. The correct inference is **supported** by the text — but written nowhere in it.

> **The Golden Rule: an inference rides on a sentence.** Every correct inference has a passage sentence underneath it. If you cannot point to the supporting sentence, the inference is a guess.

### The Three-Gate Test

\`\`\`
┌──────────────────────────────────────────────────┐
│  GATE 1  SUPPORTED?                               │
│  Is there a passage sentence that IMPLIES it?     │
│  No sentence → reject (outside knowledge)         │
├──────────────────────────────────────────────────┤
│  GATE 2  NOT-STATED?                              │
│  Is it written outright in the passage?           │
│  YES → that is a FACT, not an inference → reject  │
├──────────────────────────────────────────────────┤
│  GATE 3  NOT-CONTRADICTED?                        │
│  Does the passage argue the OPPOSITE?             │
│  YES → reject                                     │
└──────────────────────────────────────────────────┘
\`\`\`

### The Inference Triangle

\`\`\`
   FACT (written in passage)
       │
       ▼
   HINT (what the fact quietly suggests)
       │
       ▼
   INFERENCE (the supported but unwritten conclusion)
\`\`\`

### Worked Example — The Riya Case

**Passage:** "Despite spending more hours studying than most students, Riya consistently scores lower than her classmates on exams. Her teachers have noted she rarely finishes the paper on time."

**Question:** What can be inferred about Riya?

\`\`\`
Gate 1 — SUPPORTED?
Passage sentence: "she rarely finishes the paper on time"
Implies: her problem may be related to time management ✓

Gate 2 — NOT-STATED?
The passage never SAYS "time management" → not a fact ✓

Gate 3 — NOT-CONTRADICTED?
The passage agrees (slow finish → time pressure) ✓

INFERENCE: Riya may struggle with time management ✓
\`\`\`

**Not the answer:** "Riya is lazy" — the passage says she studies MORE hours (contradicted). "Riya doesn't study" — contradicted. "Riya should study harder" — the passage says studying more hasn't worked.

### Strong vs Weak Inferences

| Strength | What it needs | Example |
|---|---|---|
| STRONG (safe) | The passage forces it | Riya's finishing problems → time management |
| WEAK (risky) | Only possible, unforced | Riya's family has money problems |

Exams test the strong ones — if an inference needs a story you invented, reject it.

### The Inference Do-List

\`\`\`
✓ Point to the supporting sentence
✓ Check it is not written word for word
✓ Check the passage doesn't argue the opposite
✗ Never add your own story
✗ Never pick the option that repeats the passage
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Picking a restated fact | A sentence copied from the passage | Gate 2: stated facts are facts, not inferences |
| Importing life experience | "Riya must be distracted by her phone" | No sentence supports it → reject |
| Over-reading | "Riya will fail the exam" | Extreme conclusions need extreme support |
| Contradicting the passage | "Riya is lazy" when she studies most | Gate 3 — the passage argues the opposite |
| The story test | "It COULD be true" | Could ≠ supported — find the sentence |

### Quick Self-Test (answers at the bottom)

**Passage:** "Despite spending more hours studying than most students, Riya consistently scores lower than her classmates on exams. Her teachers have noted she rarely finishes the paper on time."

1. What can be inferred about Riya? — (a) She may struggle with time management  (b) She is lazy  (c) She doesn't study  (d) Her teachers are unfair
2. Why is "Riya is lazy" NOT a valid inference? — (a) The passage says she studies the most hours  (b) It is stated in the passage  (c) It is too short  (d) It uses extreme words
3. An inference that merely repeats the passage is actually — (a) A fact  (b) An inference  (c) A guess  (d) A trap that is correct
4. Gate 1 of the Three-Gate Test asks — (a) Is it supported by a sentence?  (b) Is it true in real life?  (c) Is it long enough?  (d) Does it rhyme?
5. A strong inference — (a) Is forced by the passage  (b) Needs my imagination  (c) Contradicts the passage  (d) Uses outside facts

**Answers:** 1→a, 2→a, 3→a, 4→a, 5→a.

### Key Takeaway

Inferences live between the lines but ride on sentences. Run every option through the Three-Gate Test — supported, not stated outright, not contradicted — and never add your own story. When the option repeats the passage, it is a fact wearing an inference's clothes.`,
    lessonSlug: 'reading-comprehension',
    order: 2
  },
  {
    title: 'Para Jumbles',
    slug: 'para-jumbles',
    description: 'Anchor-Hunt Method — new-subject sentences open, pronoun sentences answer their noun, However contrasts, Therefore concludes; rule out the impossible and chain the rest.',
    explanation: `### The Simple Idea

A jumbled paragraph is a disassembled machine. Two parts do the assembly work: the **anchor** (the sentence that opens — it needs no introduction) and the **connectors** (words that glue each sentence to its neighbour). You never guess the whole order; you only find the anchor, then snap each chain link.

> **The Golden Rule: the anchor comes first, and the connectors are the chain.** A sentence starting with "However" cannot open a paragraph. A sentence starting with "This" cannot stand alone. Rule out the impossible, and the possible orders itself.

### The Anchor-Hunt Method

\`\`\`
┌──────────────────────────────────────────────────┐
│  STEP 1  FIND THE ANCHOR (the opening sentence)   │
│  ✓ introduces a NEW subject or a proper noun      │
│  ✓ no pronoun pointing back (it, this, they)       │
│  ✓ no connector starting (However, But, Also)      │
├──────────────────────────────────────────────────┤
│  STEP 2  CHAIN the rest with pronoun + connector  │
│  "It/This/They" → must follow the sentence that    │
│  introduced the noun                              │
├──────────────────────────────────────────────────┤
│  STEP 3  VERIFY — read the full chain aloud       │
│  It must read like one smooth paragraph           │
└──────────────────────────────────────────────────┘
\`\`\`

### The Connector Dictionary (Words That Glue Sentences)

| Connector | Its job | What it must follow |
|---|---|---|
| However / But / Yet | Contrast | A sentence with the OPPOSITE idea |
| Also / Moreover / Furthermore | Addition | A related idea on the same track |
| This / These / It / They | Points BACK | The sentence that introduced the noun |
| Therefore / So / Hence | Conclusion | The reason chain — sits near the end |
| Because / Since | Reason | Usually sits BEFORE the result |

### The Pronoun-Chain Rule

A sentence starting with "it", "this", or "they" is a **reply** — it answers a noun introduced earlier:

\`\`\`
"...the internet..."   (the noun appears here)
"It connects computers across the globe."   (the reply follows)
\`\`\`

### Worked Example — The Internet Paragraph

**Question:** Arrange into a paragraph — 1. "This has made communication faster than ever before."  2. "The internet began as a small research network in the 1960s."  3. "However, access is still unequal across the world."  4. "Today, billions of people use it daily."  5. "It connects computers across the globe."

\`\`\`
Step 1 — FIND THE ANCHOR:

1 starts with "This"   → points back → cannot open ✗
2 introduces the internet with a date → THE ANCHOR ✓
3 starts with "However" → contrast → cannot open ✗
4 starts with "Today" but has "it" → needs the noun ✗
5 starts with "It" → needs the noun ✗

Step 2 — CHAIN:

2 "...the internet..."  → introduced the noun
5 "It connects computers" → the reply → follows 2 ✓
4 "Today, billions use it daily" → time jumps to today → follows 5 ✓
1 "This has made communication faster" → "This" = today's daily use → follows 4 ✓
3 "However, access is still unequal" → contrast to the success → LAST ✓

Step 3 — VERIFY (read it aloud):

"The internet began as a small research network in the 1960s.
 It connects computers across the globe. Today, billions of
 people use it daily. This has made communication faster than
 ever before. However, access is still unequal across the world."

ORDER: 2, 5, 4, 1, 3 ✓
\`\`\`

### The Time-Line Trick

Paragraphs often walk a timeline. Spot the time markers and the chain builds itself:

\`\`\`
1960s (began) → Today (billions use it) → Now (faster) → However (unequal)
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Opening with a connector | "However" placed first | However/But/Also can never open a paragraph |
| Opening with a pronoun | "It connects computers" first | It/This/They need the noun first |
| Checking only pairs | 2→5 works, but 5→4 fails later | Verify the WHOLE chain aloud |
| Forgetting time markers | Modern sentence placed before the 1960s one | Hunt for dates and time words |
| Ignoring the conclusion | "Therefore" placed mid-way | Conclusion connectors sit near the end |

### Quick Self-Test (answers at the bottom)

1. Arrange: 1. "This has made communication faster."  2. "The internet began as a research network in the 1960s."  3. "However, access is still unequal."  4. "Today, billions use it daily."  5. "It connects computers across the globe." — (a) 2, 5, 4, 1, 3  (b) 2, 4, 5, 1, 3  (c) 3, 2, 5, 4, 1  (d) 1, 2, 5, 4, 3
2. Which sentence can NEVER open a paragraph? — (a) One starting with "It"  (b) One with a proper noun  (c) A short sentence  (d) One with a date
3. A sentence starting with "However" — (a) Continues the same idea  (b) Contrasts with the previous sentence  (c) Introduces the topic  (d) Is always first
4. The best opening sentence among these — (a) "This has changed everything."  (b) "The internet began as a small research network in the 1960s."  (c) "However, access is unequal."  (d) "It connects computers."
5. "Therefore" sentences usually sit — (a) Near the end  (b) At the very start  (c) Anywhere  (d) Never

**Answers:** 1→a, 2→a, 3→b, 4→b, 5→a.

### Key Takeaway

Para jumbles rebuild from the anchor: a new-subject sentence opens, pronoun sentences answer their noun, contrast connectors follow the opposite idea, and conclusion connectors sit near the end. Rule out the impossible, chain the rest, and read the whole thing aloud before you commit.`,
    lessonSlug: 'para-jumbles-sentence-completion',
    order: 1
  },
  {
    title: 'Sentence Completion',
    slug: 'sentence-completion',
    description: 'Double-Clue Method — signal words set the meaning direction (but/despite flip it), grammar sets the form (adjective or adverb); predict in your words before you peek.',
    explanation: `### The Simple Idea

One blank, four options. The sentence already contains the answer — **signal words** tell you whether the blank should mean "same as" or "opposite to" the rest, and the **grammar** tells you what form the word must take.

> **The Golden Rule: predict before you peek.** Read the sentence, decide in YOUR words what the blank must mean — then look at the options. Options that survive your prediction AND the grammar check are the answer.

### The Double-Clue Method

\`\`\`
┌──────────────────────────────────────────────────┐
│  CLUE 1 — MEANING:                               │
│  read the sentence, predict the blank's meaning   │
│  in your own words                               │
├──────────────────────────────────────────────────┤
│  CLUE 2 — GRAMMAR:                               │
│  what form must the word take?                   │
│  "He was ___" → adjective                        │
│  "He ran ___" → adverb                           │
│  "To ___" → verb                                 │
├──────────────────────────────────────────────────┤
│  MATCH: options that fit both clues win           │
└──────────────────────────────────────────────────┘
\`\`\`

### The Signal-Word Dictionary (Meaning Clues)

| Signal word | What the blank should be | Example |
|---|---|---|
| but / however / despite | The OPPOSITE of the rest | "Despite the rain, the match continued ___" → uninterrupted |
| and / also / as well | The SAME direction | "She is smart and ___" → hardworking |
| because / since / therefore | A cause or result | "He studied hard, so he was ___" → confident |
| so that | A purpose | "He spoke loudly so that all ___" → heard |
| winning / celebrating | The emotional direction | "Elated after winning" |

### Worked Example — The Champion Team

**Question:** "The team was ___ after winning the championship, celebrating late into the night."

\`\`\`
Clue 1 — MEANING:
"after winning" + "celebrating" → the blank means HAPPY, excited

Clue 2 — GRAMMAR:
"The team was ___" → an ADJECTIVE is needed

Match:
(a) elated     → happy ✓ meaning, ✓ adjective → SURVIVES
(b) dejected   → sad — opposite of celebrating ✗
(c) indifferent → uncaring — why celebrate? ✗
(d) confused   → no reason to celebrate ✗

Answer: ELATED ✓
\`\`\`

### Worked Example 2 — The Form Test

**Question:** "She spoke ___ so that everyone could hear her."

\`\`\`
Clue 1 — MEANING: the blank describes HOW she spoke
Clue 2 — GRAMMAR: "spoke ___" → an ADVERB is needed

(a) loud    → adjective ("a loud voice") ✗
(b) loudly  → adverb ✓ → SURVIVES
(c) louder  → comparative, needs a "than" ✗
(d) loudness → noun ✗

Answer: LOUDLY ✓
\`\`\`

### The Elimination Order (Fastest Path)

\`\`\`
1. Kill the wrong-meaning options first (signal words decide)
2. Kill the wrong-form options next (grammar decides)
3. The survivor is the answer — usually one option survives both
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Ignoring signal words | "Despite" ignored, happy word chosen for a sad blank | but/despite flip the meaning |
| Wrong word form | "loud" chosen for "spoke ___" | Ask: adjective or adverb slot? |
| Half-fitting synonyms | A close-but-not-exact word | The signal word demands exact direction |
| Answering from the first half | Reading only up to the blank | The second half often holds the clue ("celebrating late...") |
| Skipping the prediction | Options dictate the choice | Predict in YOUR words before looking |

### Quick Self-Test (answers at the bottom)

1. "The team was ___ after winning the championship, celebrating late into the night." — (a) Elated  (b) Dejected  (c) Indifferent  (d) Confused
2. "Despite the heavy rain, the match continued ___." — (a) Interrupted  (b) Uninterrupted  (c) Cancelled  (d) Postponed
3. "She spoke ___ so that everyone could hear her." — (a) loud  (b) loudly  (c) louder  (d) loudness
4. "___ the traffic, we reached the airport on time." — (a) Because  (b) Despite  (c) Although  (d) Since
5. "He studied hard, ___ he was confident in the exam." — (a) but  (b) so  (c) despite  (d) although

**Answers:** 1→a, 2→b, 3→b, 4→b, 5→b.

### Key Takeaway

Every blank has two clues: the signal word decides the MEANING direction (same or opposite), and the sentence structure decides the FORM (adjective, adverb, verb). Predict in your own words, then let the options fight for the slot — the one that survives both clues wins.`,
    lessonSlug: 'para-jumbles-sentence-completion',
    order: 2
  },
  {
    title: 'Cloze Test Basics',
    slug: 'cloze-test-basics',
    description: 'Swiss-Cheese Method — every hole has one job: meaning, grammar, or connection; ripple-check the neighbours and pre-fill your word before reading options.',
    explanation: `### The Simple Idea

Think of the passage as a slab of Swiss cheese — the story is the cheese, and the blanks are the holes. Your job is not to guess words; it is to **repair the holes so the story flows** again. Every hole has exactly ONE job, and the passage itself tells you what that job is.

> **The Golden Rule: every blank is a checkpoint with a single job.** Meaning checkpoint → the words around it decide. Grammar checkpoint → the sentence structure decides. Connection checkpoint → the link words (not only...but also) decide.

### The Three Checkpoints (Every Blank Is One of These)

\`\`\`
┌──────────────────────────────────────────────────┐
│  CHECKPOINT 1 — MEANING                           │
│  The sentence's story decides                     │
│  "...students ___ for exams" → appear (sit)       │
├──────────────────────────────────────────────────┤
│  CHECKPOINT 2 — GRAMMAR                           │
│  The structure decides the word form              │
│  "prepare ___" → adverb → regularly               │
├──────────────────────────────────────────────────┤
│  CHECKPOINT 3 — CONNECTION                        │
│  A fixed phrase decides the link word             │
│  "not only X ___ also Y" → but                    │
└──────────────────────────────────────────────────┘
\`\`\`

### The Swiss-Cheese Method (3 Steps Per Hole)

\`\`\`
STEP 1  THE RIPPLE CHECK — read the sentence BEFORE
        the hole AND the sentence AFTER it. The story
        ripples across holes; never patch in isolation.

STEP 2  THE PRE-FILL — cover the options. Patch the
        hole with YOUR word. (Your brain already knows
        the story — it only needs a moment to speak.)

STEP 3  THE COMPARE — now read the options. One of
        them matches your patch. If two look close,
        the checkpoint job (meaning/grammar/connection)
        breaks the tie.
\`\`\`

### Worked Example — The Exam Passage

**Passage:** "Every year, thousands of students ___ (1) for competitive exams. Those who prepare ___ (2) are more likely to succeed. However, success depends not only on hard work ___ (3) on smart planning."

\`\`\`
HOLE 1: "students ___ for competitive exams"
Ripple: students + exams → they SIT/APPEAR for them
Pre-fill: appear
Checkpoint: MEANING ✓

HOLE 2: "prepare ___ are more likely"
Ripple: how do they prepare? → regularly
Pre-fill: regularly
Checkpoint: GRAMMAR — "prepare" needs an ADVERB ✓

HOLE 3: "not only hard work ___ on smart planning"
Ripple: the fixed phrase "not only... but also"
Pre-fill: but
Checkpoint: CONNECTION ✓

Answer: appear, regularly, but
\`\`\`

### The Ripple Check (Why Neighbours Matter)

A cloze hole is never alone. The sentence before it sets the scene; the sentence after it confirms the result:

\`\`\`
"Every year, thousands of students ___ for competitive exams."
(before) "Every year, thousands..." → a recurring event → present tense
(after)  "Those who prepare regularly are more likely to succeed" → advice mode

The ripple says: PRESENT TENSE + a verb of participating → APPEAR
\`\`\`

### The Tie-Break (When Two Options Both Fit)

When two options survive the meaning check, the checkpoint job decides:

\`\`\`
"prepared ___" with options regularly / regular:
Both could start a sentence — but "prepare" is a verb,
and verbs take ADVERBS. → regularly wins on grammar ✓
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Patching holes in isolation | Each blank answered alone | The Ripple Check — read both neighbours |
| Reading options first | The wrong options pollute the hole | Pre-Fill your own word first, then compare |
| Ignoring fixed phrases | "not only... but also" broken into "and" | Connection checkpoints are memorised pairs |
| Wrong word form | "regular" for "prepare ___" | Grammar checkpoint: verb → adverb |
| Repeating words | Using a word already in the passage | The story wants variety — and the options know it |

### Quick Self-Test (answers at the bottom)

**Passage:** "Every year, thousands of students ___ for competitive exams. Those who prepare ___ are more likely to succeed. However, success depends not only on hard work ___ on smart planning."

1. Blank 1 — (a) look  (b) appear  (c) wait  (d) listen
2. Blank 2 — (a) regular  (b) regularity  (c) regularly  (d) more regular
3. Blank 3 — (a) and  (b) or  (c) so  (d) but
4. The Ripple Check says — (a) Read the sentences before and after the hole  (b) Read only the hole  (c) Skip the passage  (d) Read the options first
5. "Not only X ___ also Y" is a — (a) Grammar checkpoint  (b) Connection checkpoint  (c) Meaning checkpoint  (d) None

**Answers:** 1→b, 2→c, 3→d, 4→a, 5→b.

### Key Takeaway

Cloze tests are cheese repair: every hole has one job — meaning, grammar, or connection. Do the Ripple Check around each hole, pre-fill your own word before reading options, and let the checkpoint break ties. The story was always whole; you are only putting it back together.`,
    lessonSlug: 'cloze-test',
    order: 1
  },
  {
    title: 'Context-Based Word Choice',
    slug: 'context-word-choice',
    description: 'The sentence is a photograph — find the scene (the strongest clue word), name the feeling, audition the options, and run the form filter before casting.',
    explanation: `### The Simple Idea

One sentence, one blank, one choice: the best word for THIS context. Unlike cloze basics, there is no fixed phrase — the sentence's **situation** is the only clue. A word can be correct English and still be the wrong answer, because context asks: *what word fits THIS scene?*

> **The Golden Rule: the sentence is a photograph — the blank must fit the picture.** "He walked into the room" says nothing. "He walked ___ into the room" needs the scene to choose: timidly, proudly, or angrily?

### The Scene-Setter Method

\`\`\`
┌──────────────────────────────────────────────────┐
│  STEP 1  FIND THE SCENE — the strongest clue      │
│  word in the sentence. It is usually an action,   │
│  an emotion, or a detail (testing, celebrating)   │
├──────────────────────────────────────────────────┤
│  STEP 2  NAME THE FEELING — what does the scene   │
│  say the blank must mean? (careful? tired?)       │
├──────────────────────────────────────────────────┤
│  STEP 3  AUDITION THE OPTIONS — the one whose     │
│  meaning matches the feeling, in the right form,  │
│  gets the part                                    │
└──────────────────────────────────────────────────┘
\`\`\`

### Worked Example — The Meticulous Scientist

**Question:** "The scientist was known for her ___ approach, testing every theory before accepting it." (a) Careless  (b) Meticulous  (c) Hasty  (d) Casual

\`\`\`
Step 1 — FIND THE SCENE:
"testing every theory before accepting it" → a CAREFUL, thorough habit

Step 2 — NAME THE FEELING:
the blank must mean careful, thorough

Step 3 — AUDITION:
(a) Careless  → the opposite of the scene ✗
(b) Meticulous → careful, thorough ✓ → WINS THE PART
(c) Hasty     → rushed — the scene says the opposite ✗
(d) Casual    → relaxed — testing everything is not casual ✗

Answer: METICULOUS ✓
\`\`\`

### The Opposite-Audition (Trap Defender)

When the scene is positive, the options will offer you the exact negative:

\`\`\`
Scene: "testing every theory" (positive, careful)
Trap:  careless / hasty (negative words in the same family)
Defence: name the feeling first (careful) → negatives die instantly
\`\`\`

### The Form Filter (Last Check Before the Part Is Won)

Two survivors in meaning? Run the form filter:

\`\`\`
"known for her ___ approach" → "approach" is a NOUN
→ the blank must be an ADJECTIVE
(adverb or noun options die here)
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reading only half the sentence | The clue word is in the second half | The scene often lives after the comma |
| Choosing correct-but-wrong | "Careful" vs the scene demanding "meticulous" | The scene sets the exact shade, not just direction |
| Falling for opposites | Hasty auditioned for a careful scene | Name the feeling FIRST — opposites die instantly |
| Ignoring the form | Noun chosen for an adjective slot | Run the form filter before celebrating |
| Picking the longest word | "Extraordinary" for every blank | Length is not meaning — the scene decides |

### Quick Self-Test (answers at the bottom)

1. "The scientist was known for her ___ approach, testing every theory before accepting it." — (a) Careless  (b) Meticulous  (c) Hasty  (d) Casual
2. "The coach was ___ with the team's performance, demanding more practice." — (a) Satisfied  (b) Proud  (c) Dissatisfied  (d) Relaxed
3. "The river flowed ___ through the valley." — (a) gently  (b) gentle  (c) gentler  (d) gentleness
4. "She was ___ after the long journey, so she slept immediately." — (a) Energetic  (b) Fresh  (c) Exhausted  (d) Restless
5. The scene-setter method asks you to — (a) Find the strongest clue word first  (b) Read the options first  (c) Pick the longest word  (d) Skip the sentence

**Answers:** 1→b, 2→c, 3→a, 4→c, 5→a.

### Key Takeaway

Context-based choice is casting: the sentence is the script, the clue word sets the scene, and the blank must audition with the right meaning AND the right form. Name the feeling before the options arrive — and the scene always wins over the dictionary.`,
    lessonSlug: 'cloze-test',
    order: 2
  },
  {
    title: 'Tabular Data Interpretation',
    slug: 'tabular-data-interpretation',
    description: 'Cell-Eyes Method — read the column headings before any number, then read, sum, or percentage; increase % is always on the OLD value.',
    explanation: `### The Simple Idea

A table is a filing cabinet: rows are categories, columns are measures. The exam gives you a small section and asks three kinds of questions — **read** a cell, **compare** two rows, or **compute** total/percentage. There is no hidden data; every answer is sitting in a cell.

> **The Golden Rule: the columns are the vocabulary — read them first.** Never touch a number before you know what the row and column headings mean. A table read with wrong headings is a wrong answer, however accurate the arithmetic.

### The Three Question Types (Every Table Question Is One of These)

\`\`\`
┌──────────────────────────────────────────────────┐
│  TYPE 1 — DIRECT READ                            │
│  "Which region was highest in Q2?"               │
│  → find the cell, name it                        │
├──────────────────────────────────────────────────┤
│  TYPE 2 — SUM OR AVERAGE                         │
│  "Total sales in Q1?" → add the row              │
├──────────────────────────────────────────────────┤
│  TYPE 3 — PERCENTAGE CHANGE                      │
│  "North's increase from Q1 to Q2?"               │
│  → (new − old) ÷ old × 100                      │
│  → the base is ALWAYS the OLD value              │
└──────────────────────────────────────────────────┘
\`\`\`

### The Cell-Eyes Method

\`\`\`
STEP 1  READ THE ANATOMY — rows and columns:
        rows = regions, columns = quarters

STEP 2  LOCATE what the question asks:
        "total Q1" → the whole Q1 COLUMN

STEP 3  COMPUTE with discipline:
        add, subtract, or divide — no rounding
        until the final step

STEP 4  SANITY-CHECK the unit (lakhs? thousands?)
        and the base (increase is on the old number)
\`\`\`

### Worked Example — The Sales Table

**Table: Quarterly Sales (in lakhs)**

| Region | Q1 | Q2 | Q3 |
|---|---|---|---|
| North | 120 | 150 | 140 |
| West | 80 | 100 | 120 |
| South | 90 | 110 | 95 |

**Question 1 (Direct read):** Which region had the highest sales in Q2?

\`\`\`
Locate the Q2 column: North 150, West 100, South 110
Highest → NORTH (150) ✓
\`\`\`

**Question 2 (Sum):** What were the total sales in Q1?

\`\`\`
Add the Q1 column: 120 + 80 + 90 = 290 lakhs
\`\`\`

**Question 3 (Percentage change):** By what percentage did North's sales rise from Q1 to Q2?

\`\`\`
New = 150, Old = 120
Increase = (150 − 120) ÷ 120 × 100 = 30 ÷ 120 × 100 = 25%

NORTH rose by 25% ✓
\`\`\`

### The Percentage-Base Trap

Increase percentage is ALWAYS calculated on the OLD value:

\`\`\`
150 vs 120 → rise of 30 → 30/120 = 25%  ✓
(Not 30/150 = 20% — that is the decrease from the new value)
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reading the wrong column | Q2 answers from Q3 numbers | Match the quarter column before reading |
| Wrong percentage base | Dividing by the new value | Increase % = rise ÷ OLD × 100 |
| Ignoring units | 290 lakhs read as 290 rupees | Annex the unit from the table's heading |
| Rounding early | Percentages off by decimals | Round only the final answer |
| Summing the wrong direction | Adding a row when the question wants a column | "Total in Q1" = the Q1 COLUMN |

### Quick Self-Test (answers at the bottom)

**Table: Quarterly Sales (in lakhs)**

| Region | Q1 | Q2 | Q3 |
|---|---|---|---|
| North | 120 | 150 | 140 |
| West | 80 | 100 | 120 |
| South | 90 | 110 | 95 |

1. Which region had the highest sales in Q2? — (a) North  (b) West  (c) South  (d) All equal
2. Total sales in Q1? — (a) 220  (b) 290  (c) 300  (d) 310
3. North's percentage increase from Q1 to Q2? — (a) 20%  (b) 15%  (c) 30%  (d) 25%
4. Total sales in Q3? — (a) 345  (b) 350  (c) 355  (d) 360
5. Increase percentage is calculated on — (a) The new value  (b) The old value  (c) The difference  (d) The average

**Answers:** 1→a, 2→b, 3→d, 4→c, 5→b.

### Key Takeaway

Tables are filing cabinets: read the column headings before any number, then classify the question — read, sum, or percentage. For percentage change, the base is always the old value, and the unit is always written in the table's title.`,
    lessonSlug: 'tables-bar-graphs',
    order: 1
  },
  {
    title: 'Bar Graph Interpretation',
    slug: 'bar-graph-interpretation',
    description: 'Bar-Eye Method — axis and scale first, heights by eye, numbers on paper for sums; grouped bars come with a legend you must read.',
    explanation: `### The Simple Idea

A bar graph is a table drawn as buildings — the **height of the bar IS the number**. Direct reads and comparisons are done by eye against the gridlines; only sum and percentage questions need precise arithmetic.

> **The Golden Rule: read the axis before you read the bars.** The horizontal axis names the categories, the vertical axis sets the scale — every bar's height means nothing until you know what one tick equals.

### The Bar-Eye Method

\`\`\`
STEP 1  AXIS CHECK — what do the bars represent?
        horizontal = category, vertical = value + unit

STEP 2  SCALE CHECK — what does one gridline equal?
        10? 20? 100? (misread this and every bar lies)

STEP 3  READ by height, COMPUTE by tick:
        direct questions → eye the tallest bar
        sums/percentages → write the numbers, then add/divide
\`\`\`

### Worked Example — The Monthly Sales Bars

**Bar Graph: Sales (in thousands) — Jan 50, Feb 70, Mar 90.**

\`\`\`
  Sales (thousands)
   90 ┤                        ██
   80 ┤                 ██
   70 ┤                 ██
   60 ┤          ██     ██
   50 ┤          ██     ██
   40 ┤          ██     ██
   30 ┤     ██   ██     ██
   20 ┤     ██   ██     ██
   10 ┤     ██   ██     ██
    0 ┼────────────────────────
              Jan  Feb   Mar
\`\`\`

**Question 1 (Direct read):** Which month had the highest sales?

\`\`\`
Tallest bar → MAR (90) ✓
\`\`\`

**Question 2 (Compare):** What is the difference between the highest and lowest months?

\`\`\`
Highest = Mar 90, Lowest = Jan 50
Difference = 90 − 50 = 40 thousand ✓
\`\`\`

**Question 3 (Sum):** What were Jan and Mar combined?

\`\`\`
50 + 90 = 140 thousand ✓
\`\`\`

### The Grouped-Bar Twist (Two Bars Per Label)

Sometimes each label carries TWO bars — one per product or year. When bars are grouped, always read the **legend** (the key) to know which colour is which product. "The highest bar" is meaningless until the colour is named.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Misreading the scale | A bar at 70 read as 7 | One tick can be 10; count the ticks |
| Ignoring units | Thousands read as units | The axis title carries the unit |
| Eye-only precision | "Seems like 140" for a sum | Write the numbers down, then add |
| Forgetting the legend | Product A colour read as B | Read the key before any grouped bar |
| Comparing wrong labels | Feb compared to Dec | Match the label under each bar |

### Quick Self-Test (answers at the bottom)

**Bar Graph: Monthly sales — Jan 50, Feb 70, Mar 90 (thousands).**

1. Which month had the highest sales? — (a) Jan  (b) Feb  (c) Mar  (d) All equal
2. Difference between the highest and lowest months? — (a) 20  (b) 30  (c) 40  (d) 50
3. Jan and Mar combined? — (a) 120  (b) 130  (c) 140  (d) 150
4. Difference between Feb and Jan? — (a) 20  (b) 10  (c) 30  (d) 40
5. Before reading grouped bars you must check — (a) The legend  (b) The date  (c) The title only  (d) Nothing

**Answers:** 1→c, 2→c, 3→c, 4→a, 5→a.

### Key Takeaway

Bar graphs are buildings of data: read the axis for categories and units, read the scale for the value of one tick, then read heights by eye. Sums and percentages still need the numbers written down — and grouped bars always come with a legend you must read first.`,
    lessonSlug: 'tables-bar-graphs',
    order: 2
  },
  {
    title: 'Pie Chart Interpretation',
    slug: 'pie-chart-interpretation',
    description: 'The 1% Key — a pie is always 100% of ONE total; slice value = slice % × total, angle 3.6° = 1%, and the Three PACs guide every question.',
    explanation: `### The Simple Idea

A pie is exactly 100% — one total, split into slices. Every question about a pie is one of three moves: **read** a slice's percentage, **compute** a slice's value (its % of the total), or **compare** two slices. Once you know the total, every slice becomes arithmetic.

> **The Golden Rule: the pie is always 100%, and every slice is a piece of the SAME total.** Ask one question before touching any number: what is the total the pie is describing? If the question hands you the angle instead of the percentage, turn the angle into a percentage first — 3.6° = 1%.

### The Degree ↔ Percent Ladder (Memorise These Four)

| Angle | Percent | What it looks like |
|---|---|---|
| 180° | 50% | Half the pie |
| 90° | 25% | A quarter of the pie |
| 36° | 10% | A thin slice |
| 3.6° | 1% | The unit — every other angle counts from here |

### The 1% Key (The Slice-Size Machine)

\`\`\`
SLICE VALUE   =  slice percentage  ×  TOTAL
SLICE ANGLE   =  slice percentage  ×  3.6°  (no total needed)
SLICE PERCENT =  slice angle  ÷  3.6°
\`\`\`

### The Three PACs (Pie Answer Categories)

\`\`\`
┌──────────────────────────────────────────────────┐
│  PAC 1 — READ A PERCENTAGE                       │
│  "What % went to Salaries?" → read the label     │
├──────────────────────────────────────────────────┤
│  PAC 2 — COMPUTE A VALUE                         │
│  "How much on Rent?" → % × total                │
├──────────────────────────────────────────────────┤
│  PAC 3 — COMPARE SLICES                          │
│  "Rent + Marketing put together?" → add the %s   │
└──────────────────────────────────────────────────┘
\`\`\`

### Worked Example — The Expense Pie

**Pie Chart: Annual Company Expenses — Total ₹5 crore**

\`\`\`
        Salaries   ▓▓▓▓▓▓▓▓▓▓  40%
        Rent       ▓▓▓▓▓       20%
        Travel     ▓▓▓         10%
        Marketing  ▓▓▓▓▓▓▓     30%
\`\`\`

**Question 1 (PAC 1 — read):** What percentage went to Salaries?

\`\`\`
Read the label: 40% ✓
\`\`\`

**Question 2 (PAC 2 — compute):** How much money went to Salaries?

\`\`\`
Slice value = 40% × ₹5 crore = ₹2 crore ✓
\`\`\`

**Question 3 (PAC 3 — compare):** Rent and Marketing combined?

\`\`\`
Rent 20% + Marketing 30% = 50% of ₹5 crore = ₹2.5 crore ✓
\`\`\`

**Question 4 (Angle):** If the Travel slice is 10%, what is its angle?

\`\`\`
Angle = 10% × 3.6° = 36° ✓
\`\`\`

### The Angle Ambush

Some pies label slices by **degrees** instead of percentages:

\`\`\`
Travel = 36°  →  36 ÷ 3.6 = 10%
To get the VALUE: first convert angle → percent → × total
(36° ÷ 3.6) × ₹5 crore = 10% × ₹5 crore = ₹0.5 crore
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting the total | 40% treated as ₹40 | % is never an amount — % × total is |
| Angle used as percent | 36° treated as 36% | Convert first: angle ÷ 3.6 |
| Adding the wrong slices | Rent counted twice | List the slices you're combining before adding |
| The broken pie | Slices not adding to 100% | A valid pie always sums to 100% — check it |
| Wrong total | Applying % to last year's number | The pie describes ONE total — find it first |

### Quick Self-Test (answers at the bottom)

**Pie Chart (Total ₹5 crore): Salaries 40%, Rent 20%, Travel 10%, Marketing 30%.**

1. Percentage spent on Salaries — (a) 30%  (b) 40%  (c) 20%  (d) 50%
2. Amount spent on Salaries — (a) ₹1 crore  (b) ₹2 crore  (c) ₹3 crore  (d) ₹4 crore
3. Rent and Marketing combined — (a) ₹2 crore  (b) ₹1.5 crore  (c) ₹2.5 crore  (d) ₹3 crore
4. Angle of the Travel slice (10%) — (a) 36°  (b) 90°  (c) 18°  (d) 72°
5. "Salaries 0.4 crore" — the error here is — (a) % used as an amount  (b) Wrong slice  (c) 0.4 is right  (d) Angle not converted

**Answers:** 1→b, 2→b, 3→c, 4→a, 5→a.

### Key Takeaway

A pie is 100% and one total. Read the percentage from the label, compute the amount with % × total, compare by adding slices — and when a slice arrives as an angle, convert it through the 1% key (3.6° = 1%) before anything else.`,
    lessonSlug: 'pie-charts-line-graphs',
    order: 1
  },
  {
    title: 'Line Graph Interpretation',
    slug: 'line-graph-interpretation',
    description: 'Point-Read + Trend-Eye — points are exact values read down to the axis; the line\'s direction is the trend; (new − old) ÷ old for % change.',
    explanation: `### The Simple Idea

A line graph is a journey: the horizontal axis is time, the vertical axis is the value, and each **point** is an exact reading on that day. The **line's direction between points** is the trend — rising, falling, or flat.

> **The Golden Rule: points hold the numbers, the line holds the story.** For "what was the value" questions, land on the point and read down to the axis. For "what happened" questions, watch the direction of the line — the steepness and the sign tell the whole tale.

### The Trend Language (Describe the Line, Not the Points)

| The line does this | Trend word | Example |
|---|---|---|
| Goes up | Rising | 40 → 60 |
| Goes down | Falling | 60 → 50 |
| Stays level | Flat / constant | 50 → 50 |
| Jumps around | Fluctuating | 40 → 60 → 50 → 80 |

### The Point-Read + Trend-Eye Method

\`\`\`
STEP 1  IDENTIFY the axes: time has the trends, values live
              on the vertical axis

STEP 2  READ the exact points when the question asks for a VALUE:
              "sales in Feb" → the Feb point → its height

STEP 3  WATCH the direction when the question asks for a TREND:
              between two months the line either rises or falls

STEP 4  COMPUTE % change with (new − old) ÷ old × 100
\`\`\`

### Worked Example — The Five-Month Sales Line

**Line Graph: Monthly Sales (in thousands)**

\`\`\`
     80 ┤                            •(Apr 80)
     70 ┤                    •(May 70)
     60 ┤            •(Feb 60)       /
     50 ┤      •(Jan 40)   /  •(Mar 50)
     40 ┤       /         /  /
     30 ┤      /  •       / /        (up-down-up-down trail)
     20 ┤     /   •      ...
     10 ┤    /    •     ...
      0 ────────────────────────────────
           Jan   Feb   Mar   Apr   May
\`\`\`

Values: Jan 40, Feb 60, Mar 50, Apr 80, May 70.

**Question 1 (Point-read):** What were the sales in April?

\`\`\`
Land on the Apr point → read down to the axis → 80 thousand ✓
\`\`\`

**Question 2 (Trend):** Describe the trend from February to March.

\`\`\`
From Feb (60) to Mar (50) the line FALLS → sales fell by 10 ✓
\`\`\`

**Question 3 (% change):** By what percentage did sales rise from Jan to Feb?

\`\`\`
New = 60, Old = 40
Increase % = (60 − 40) ÷ 40 × 100 = 20 ÷ 40 × 100 = 50% ✓
\`\`\`

**Question 4 (Total):** What were the total sales across the five months?

\`\`\`
40 + 60 + 50 + 80 + 70 = 300 thousand ✓
\`\`\`

### The Highest-Point vs Biggest-Jump Trap

These are NOT the same question:

\`\`\`
Highest POINT  → Apr (80) — the tallest point
Biggest JUMP   → the steepest rise between two neighbours

Jan→Feb rose 20, Mar→Apr rose 30 → biggest jump is Mar→Apr,
even though Apr is already the highest point.
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reading between points | Point at 60 read as 70 | Only the dots are actual values |
| Describing the whole line | Answering "fluctuating" for a single segment | Name the trend BETWEEN the two months asked |
| % change base | Dividing by the new value | (new − old) ÷ OLD |
| Jump vs height | Highest point called the biggest jump | Steepest SEGMENT, not tallest point |
| Upside-down axes | Time read as value | Time is horizontal, values are vertical |

### Quick Self-Test (answers at the bottom)

**Line Graph: Monthly sales (thousands) — Jan 40, Feb 60, Mar 50, Apr 80, May 70.**

1. Sales in the highest month — (a) 40  (b) 60  (c) 80  (d) 70
2. Trend from February to March — (a) Rose  (b) Fell  (c) Stayed flat  (d) Fluctuated
3. Percentage increase from Jan to Feb — (a) 40%  (b) 50%  (c) 20%  (d) 33%
4. Total sales across the five months — (a) 280  (b) 290  (c) 300  (d) 310
5. The "biggest jump" means — (a) The steepest rise between two points  (b) The tallest point  (c) The last point  (d) The first point

**Answers:** 1→c, 2→b, 3→b, 4→c, 5→a.

### Key Takeaway

Line graphs are journeys: points are exact values, the line between them is the trend. Read down to the axis for values, describe the direction for trends, use (new − old) ÷ old for percentages — and never confuse the tallest point with the biggest jump.`,
    lessonSlug: 'pie-charts-line-graphs',
    order: 2
  },
  {
    title: 'Data Sufficiency Basics',
    slug: 'data-sufficiency-basics',
    description: 'The Five-Code Answer Grid and the Sufficiency Test — Unique, Complete, Clean; sufficiency is about uniqueness, not solvability.',
    explanation: `### The Simple Idea

Every data sufficiency question has the same anatomy — a question, and two statements labelled I and II. **You never have to solve for the answer; you only have to say whether the data can produce one.** Enough = exactly one clean answer. Not enough = more than one possible answer, or none at all.

> **The Golden Rule: sufficiency is about UNIQUENESS, not solvability.** A question is "sufficient" only when the data forces one and exactly one answer. If two different numbers both fit the facts, the data is insufficient every time.

### The Five-Code Answer Grid (Memorise This)

Every question ends with the same five options. Learn the codes in one order — I-first, then II, then combined:

\`\`\`
(A)  Statement I ALONE is sufficient,
     Statement II alone is NOT

(B)  Statement II ALONE is sufficient,
     Statement I alone is NOT

(C)  EACH statement ALONE is sufficient

(D)  BOTH statements TOGETHER are needed

(E)  Even TOGETHER, the statements are
     NOT sufficient
\`\`\`

### The Sufficiency Test (Three Questions for Every Answer)

Ask these three questions of any "answer" you believe the data gives:

\`\`\`
┌──────────────────────────────────────────────────────┐
│  1. UNIQUE — does the data force exactly ONE         │
│     answer? (no second possibility lurking)          │
├──────────────────────────────────────────────────────┤
│  2. COMPLETE — does the data use everything needed,  │
│     or is a known quantity still missing?            │
├──────────────────────────────────────────────────────┤
│  3. CLEAN — am I assuming facts that were not        │
│     stated? (positivity? integers?)                  │
└──────────────────────────────────────────────────────┘
\`\`\`

### The Triage Order (Test Statements One at a Time)

\`\`\`
STEP 1  TEST I ALONE — can it force a unique answer?
              YES → lean A or C, then check II alone
              NO  → set it aside, move to II

STEP 2  TEST II ALONE — same question for II

STEP 3  IF NEITHER alone → COMBINE both and re-test
        uniqueness on the merged facts

STEP 4  NAME the code from the Five-Code Grid
\`\`\`

### Worked Example 1 — How Old Is Rani?

**Question:** How old is Rani?
- **I.** Rani is twice as old as her son.
- **II.** Her son is 10 years old.

\`\`\`
STEP 1  I ALONE: "twice as old" — infinite ages fit
        (son 5 → Rani 10, son 8 → Rani 16...)  →  NOT alone

STEP 2  II ALONE: "son is 10" — still infinite Rani
        ages (she could be any age with a 10-year-old!)
        →  NOT alone

STEP 3  COMBINE: son = 10, Rani = 2 × 10 = 20
        → exactly ONE age  ✓ UNIQUE ✓ COMPLETE ✓ CLEAN ✓

STEP 4  CODE: both statements together are needed → (D)
\`\`\`

**Why this is tricky:** statement II looks powerful on its own, but it is only about the son — Rani's age stays unknown until I joins it. Sufficiency is about the QUESTION's variable, not just any number in the data.

### Worked Example 2 — Find the Value of x

**Question:** What is the value of x?
- **I.** x + y = 15
- **II.** y = 7

\`\`\`
I ALONE: one equation, two unknowns → infinite pairs → NO
II ALONE: y = 7 says nothing about x → NO
COMBINE: x + 7 = 15 → x = 8 → exactly one ✓ → (D)
\`\`\`

**The two-variables-one-equation trap lives here:** a single equation with two letters never produces a unique answer — you need a second independent fact.

### Worked Example 3 — Is N Even?

**Question:** Is the number N even?
- **I.** N is divisible by 6.
- **II.** N > 100.

\`\`\`
I ALONE: divisible by 6 means divisible by 2 → N is
        ALWAYS even → YES, uniquely → sufficient

II ALONE: N > 100 — a number over 100 can be even or
        odd → NOT sufficient

CODE: statement I alone is sufficient → (A)
\`\`\`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Solving instead of deciding | A correct arithmetic answer to the wrong question | The task is to pick a CODE, not an answer |
| The silent assumption | Assuming N is an integer when not stated | Run the CLEAN check before trusting |
| One equation, two unknowns | "x + y = 15" called enough | One equation with two letters = not unique |
| Irrelevant extras | "N > 100" added to a divisibility question | Extra true data is not automatically useful |
| 0 and 1 special cases | Forgetting 0 is even, 1 is odd | Test the boundary, not just the middle |

### Quick Self-Test (answers at the bottom)

Use the codes: (A) I alone · (B) II alone · (C) each alone · (D) together · (E) never.

1. **What is x?** I. x + y = 15. II. y = 7. — (a) A  (b) B  (c) C  (d) D  (e) E
2. **Is N even?** I. N is divisible by 6. II. N > 100. — (a) A  (b) B  (c) C  (d) D  (e) E
3. **How old is Rani?** I. Twice her son's age. II. Son is 10. — (a) A  (b) B  (c) C  (d) D  (e) E
4. **What is the unit digit of p?** I. p is a multiple of 5. II. p is odd. — (a) A  (b) B  (c) C  (d) D  (e) E
5. A question is "sufficient" only when the data gives — (a) a long answer  (b) exactly one answer  (c) the biggest answer  (d) any answer at all

**Answers:** 1→d, 2→a, 3→d, 4→d (unit digit 0 or 5 from I; odd from II → together → 5 uniquely), 5→b.

### Key Takeaway

Data sufficiency is data triage — test statement I alone, then II alone, then the combination, and grade the result against the five-code grid. Sufficient means exactly one clean, unassumed answer, and the biggest sufficiency killers are assumptions and two-variable equations.`,
    lessonSlug: 'data-sufficiency',
    order: 1
  },
  {
    title: 'Two-Statement Analysis',
    slug: 'two-statement-analysis',
    description: 'The exam ritual — test I alone, test II alone, combine only when both fail, re-test the combined survivors for uniqueness, then name the code.',
    explanation: `### The Simple Idea

This is the "exam version" of sufficiency — the question comes with exactly two labelled statements, I and II, and the answer is one of the five codes. **The skill is a ritual: test I, test II, combine if needed, name the code.** When both statements look strong, the winner is decided by uniqueness.

> **The Golden Rule: combination is a last resort, and it must be tested for uniqueness like everything else.** Two statements together can still fail to be enough — "both are about the same unknowns in a circle" is the classic hidden failure.

### The Recursive Flow (Same Every Time)

\`\`\`
STEP 1  TEST I ALONE        → sufficient? → note it (A-target or C)
STEP 2  TEST II ALONE       → sufficient? → note it (B-target or C)
STEP 3  IF both alone fail  → COMBINE the facts
STEP 4  RE-TEST uniqueness  → if still 2+ answers → (E)
\`\`\`

### The Five-Code Quick Table

| What I alone does | What II alone does | Correct code |
|---|---|---|
| Sufficient | Not sufficient | **(A)** |
| Not sufficient | Sufficient | **(B)** |
| Sufficient | Sufficient | **(C)** |
| Not sufficient | Not sufficient, but together they are | **(D)** |
| Not sufficient | Not sufficient, and together they still fail | **(E)** |

### Worked Example 1 — Find the Two-Digit Number (The Combined-Failure)

**Question:** What is the two-digit number?
- **I.** The sum of its digits is 9.
- **II.** The number is divisible by 5.

\`\`\`
STEP 1  I ALONE: digits sum to 9 → 18, 27, 36, 45, 54,
        63, 72, 81, 90 → NINE candidates → NOT alone

STEP 2  II ALONE: divisible by 5 → 10, 15, 20, ..., 95
        → MANY candidates → NOT alone

STEP 3  COMBINE: divisible by 5 → unit digit 0 or 5.
        Sum of digits 9:
            unit 0 → tens 9 → 90
            unit 5 → tens 4 → 45
        TWO candidates survive: 45 and 90!

STEP 4  RE-TEST uniqueness: two valid numbers → FAILS
        CODE: even together, insufficient → (E)
\`\`\`

**The lesson:** a combination is not automatically sufficient. Whenever the survivors are few but plural, the code is E.

### Worked Example 2 — Priya's Age (The Clean Combination)

**Question:** What is Priya's age?
- **I.** Priya is 5 years older than her brother.
- **II.** The sum of their ages is 35.

\`\`\`
STEP 1  I ALONE: P = B + 5 → infinite B-ages → NOT alone
STEP 2  II ALONE: P + B = 35 → still two unknowns → NOT alone
STEP 3  COMBINE: P = B + 5 and P + B = 35

        B + 5 + B = 35 → 2B = 30 → B = 15, P = 20

STEP 4  Exactly one age → CODE: together are needed → (D)
\`\`\`

### Worked Example 3 — The Same-Fact Trick

**Question:** What is the value of k?
- **I.** k + 3 = 11
- **II.** k = 12 − 4

\`\`\`
STEP 1  I ALONE: k = 8 → sufficient
STEP 2  II ALONE: k = 8 → sufficient (different words,
        same fact!)
STEP 3  CODE: each alone is sufficient → (C)
\`\`\`

**The Same-Fact Trick:** when I and II are the same relationship restated, they cannot combine to make the answer stronger. Restating a fact (C) is not the same as adding a fact (D).

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Combining early | Combining when I alone already suffices | Test I alone BEFORE combining |
| The restate trap | Calling the same fact "together" | Same relation twice = (C) at best, never a stronger code |
| Un-checked combination | Declaring (D) without listing survivors | List every surviving answer before choosing (D) vs (E) |
| Last-digit blindness | Forgetting 90 for "divisible by 5" | Unit 0 is a valid divisor case |
| Answer-driven solving | Trying to find the number, not the code | The question asks WHICH DATA, not the value |

### Quick Self-Test (answers at the bottom)

Use the codes: (A) I alone · (B) II alone · (C) each alone · (D) together · (E) never.

1. **Two-digit number?** I. Digit sum is 9. II. Divisible by 5. — (a) A  (b) B  (c) C  (d) D  (e) E
2. **What is Priya's age?** I. 5 years older than brother. II. Sum of ages is 35. — (a) A  (b) B  (c) C  (d) D  (e) E
3. **Value of k?** I. k + 3 = 11. II. k = 12 − 4. — (a) A  (b) B  (c) C  (d) D  (e) E
4. **Value of p?** I. p + q = 12. II. q = 4. — (a) A  (b) B  (c) C  (d) D  (e) E
5. Two statements together produce two surviving answers — the code is — (a) C  (b) D  (c) E  (d) A

**Answers:** 1→e, 2→d, 3→c, 4→d, 5→c.

### Key Takeaway

Two-statement analysis is a fixed ritual — test I alone, test II alone, combine only if both fail, then re-test the combination for uniqueness before naming a code. Combinations can fail, restated facts never strengthen — and the correct code comes from the survivors you can list, not the answer you can compute.`,
    lessonSlug: 'data-sufficiency',
    order: 2
  },
  {
    title: 'Caselet-Based DI',
    slug: 'caselet-based-di',
    description: 'The Case-Builder Method — a caselet is a paragraph hiding a table: extract every actor and number, build the grid, fill "rest = total − named parts", then answer.',
    explanation: `### The Simple Idea

A caselet is a paragraph that is secretly a table. All the numbers you need are sitting in the sentences — the challenge is **extraction and organisation**, not arithmetic. Read it like a detective: underline each actor (salaries? books? sports?) and each number, then arrange them into rows and columns. Once the grid exists, the questions are normal table questions.

> **The Golden Rule: build the grid before you attempt one answer.** Every question is answered from the complete picture; answering from the raw paragraph is how the "rest" quantities get missed.

### The Case-Builder Method

\`\`\`
STEP 1  EXTRACT — read the paragraph and collect:
             EVERY actor (category) named
             EVERY number attached to an actor

STEP 2  GRID — lay the actors out as rows,
             fill in each number that was named,
             leave "rest / remaining" as an empty cell

STEP 3  FILL THE GAPS — "rest" = total − (all named parts).
             Compute the empty cells first.

STEP 4  NAME THE UNIT — crores? rupees? % of whom?
             Attach it to every answer.
\`\`\`

### The Unsaid-Total Rule

A caselet usually starts with one big number — the TOTAL. Everything after it is a slice:

\`\`\`
When a sentence says "₹20,000 to books, and the rest to sports":
     REST = TOTAL  −  (every named slice so far)
Not rest = just ₹20,000, and not rest = an eyeball guess.
\`\`\`

### Worked Example — The School Budget Caselet

**Caselet:** A school's monthly budget is **₹1,00,000**. **40%** goes to teachers' salaries, **₹20,000** goes to books, and the **rest** goes to sports. Half of the sports money is spent on **cricket equipment**.

**Step 1 — Extract the actors and numbers:**

\`\`\`
ACTORS: salaries, books, sports (→ cricket equipment)
TOTAL: ₹1,00,000
NUMBERS: 40% → salaries; ₹20,000 → books;
         rest → sports; half of sports → cricket
\`\`\`

**Step 2 — Build the grid:**

| Item | Amount |
|---|---|
| Salaries (40%) | ₹40,000 |
| Books | ₹20,000 |
| Sports (the rest) | ? |
| Cricket equipment (½ ≈ sports) | ? |
| **Total** | **₹1,00,000** |

**Step 3 — Fill the gaps:**

\`\`\`
Sports = 1,00,000 − 40,000 − 20,000 = ₹40,000
Cricket equipment = half of sports = ₹20,000
\`\`\`

**Step 4 — Answer the questions:**

\`\`\`
Q1  How much on salaries?      → ₹40,000
Q2  How much on sports?        → ₹40,000
Q3  How much on cricket?       → ₹20,000
Q4  Books as a percentage?     → 20,000/1,00,000 = 20%
\`\`\`

### The Half-of-the-Rest Curse

Watch which number "half" attaches to:

\`\`\`
"Half the sports money"    → ½ × sports (₹20,000) ✓
"Half the total budget"    → ½ × 1,00,000 (₹50,000) — DIFFERENT!
"Half of books"            → ½ × 20,000 (₹10,000) — DIFFERENT!
\`\`\`

The sentence names its own base every time — read it twice.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Skimming the total | Using 40% on the wrong base | The first line carries the total — tag it |
| Missing the "rest" | Filling sports as ₹20,000 | rest = total − all named parts |
| Wrong half-base | Halving the total instead of sports | Read WHICH quantity "half of" attaches to |
| Overlap double-count | Counting only-both twice | A caselet's groups rarely overlap — trust the sentence |
| Unit drift | Crore answers in rupees | Name the unit once, attach it everywhere |

### Quick Self-Test (answers at the bottom)

**Caselet:** Monthly budget ₹1,00,000. Salaries 40%, books ₹20,000, rest = sports. Half the sports money = cricket equipment.

1. Amount on teachers' salaries — (a) ₹30,000  (b) ₹50,000  (c) ₹40,000  (d) ₹20,000
2. Amount on sports — (a) ₹60,000  (b) ₹40,000  (c) ₹30,000  (d) ₹50,000
3. Amount on cricket equipment — (a) ₹20,000  (b) ₹10,000  (c) ₹30,000  (d) ₹40,000
4. Books as a percentage of the budget — (a) 25%  (b) 15%  (c) 10%  (d) 20%
5. "The rest" always means — (a) the largest slice alone  (b) total minus the named parts  (c) books  (d) half the total

**Answers:** 1→c, 2→b, 3→a, 4→d, 5→b.

### Key Takeaway

A caselet is a paragraph hiding a table. Extract every actor and number, build the grid, fill the "rest" as total minus the named parts, and only then answer. The arithmetic is never the problem — the extraction is.`,
    lessonSlug: 'mixed-caselet-di',
    order: 1
  },
  {
    title: 'Mixed Graph DI',
    slug: 'mixed-graph-di',
    description: 'The Chart-Bridge Method — two charts share one quantity; a pie is the inside story of one bar. Read scope, find the link, transfer %, never cross years.',
    explanation: `### The Simple Idea

Mixed-graph DI shows **two charts together** — a bar graph of total sales per year plus a pie chart of export percentages, or two line graphs for two products. The charts are not separate puzzles; they **share one quantity**. The trick of every question is to find the link and carry the number across the bridge.

> **The Golden Rule: one chart's 100% is usually another chart's bar.** The pie is often the *inside* story of a single bar. Read the link sentence ("in 2022", "out of total sales") before touching any arithmetic.

### The Chart-Bridge Method

\`\`\`
STEP 1  SCOPE — what does each chart show?
         bar = totals by year · pie = % split within ONE year

STEP 2  LINK — find the shared quantity:
         "exports in 2022" → pie's 100% = the 2022 bar

STEP 3  TRANSFER — read from chart A (the bar),
         apply chart B's % on THAT value only

STEP 4  NEVER CROSS YEARS — each pie belongs to its own bar;
         2022's % on 2021's total is always wrong
\`\`\`

### The Bridge Diagram

\`\`\`
        BAR GRAPH (crores per year)          PIE (export % within a year)
                                           ┌────────────────────────┐
   2021 ▓▓▓▓ 500  ──┐                     │  Exports 25%  ▓▓▓       │
   2022 ▓▓▓▓▓▓ 800  ─┴── THE BRIDGE ──→   │  Domestic 75%  ░░░     │
                                            └────────────────────────┘
       "exports in 2022" = 25% of the 2022 BAR (800), never 2021.

Exports 2022 = 25% × 800 = 200 crore
Domestic 2022 = 75% × 800 = 600 crore
\`\`\`

### Worked Example — Sales Bar + Export Pie

**Chart 1 (Bar):** Company sales — 2021 = ₹500 crore, 2022 = ₹800 crore.
**Chart 2 (Pie):** 2022 split — Exports 25%, Domestic 75%.

**Question 1 (Transfer):** What were exports in 2022?

\`\`\`
The pie belongs to 2022 → its 100% is 800 crore
Exports = 25% × 800 = ₹200 crore ✓
\`\`\`

**Question 2 (Same year):** What were domestic sales in 2022?

\`\`\`
Domestic = 75% × 800 = ₹600 crore ✓
\`\`\`

**Question 3 (Second chart snapshot):** The pie also showed that in 2021 exports were 20%.

\`\`\`
Exports 2021 = 20% × 500 = ₹100 crore
     (% of the 2021 bar, not 2022's bar)
\`\`\`

**Question 4 (Combined total):** Total exports across both years?

\`\`\`
2021 exports (100) + 2022 exports (200) = ₹300 crore ✓
\`\`\`

### The Cross-Year Fraction Trap

The pie is per-year. Mixing years corrupts the transfer:

\`\`\`
Exports 2022 = 25% × 800 = 200   ✓ (same year)
25% × 500 (2021's bar) = 125      ✗ — wrong year, wrong base
\`\`\`

Every percentage must multiply **the bar of the year it is drawn from**. If the question says exports rose from 20% to 25%, compute both separately, then compare.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| The cross-year fraction | 2022's % on 2021's bar | Match the % to its own year's bar |
| Ignoring the link sentence | Pie treated as a free-standing total | The pie's 100% IS one bar of the other chart |
| Double-counting the bridge | Exports counted inside total AND separately | Pick ONE flow: bar → apply % → that's the answer |
| Legend blindness | Domestic read as exports | Read the pie's labels before the pie |
| Unit drift | Crore answers mixed with lakh | The axis title sets the unit — keep it |

### Quick Self-Test (answers at the bottom)

**Bar:** Sales 2021 = ₹500 crore, 2022 = ₹800 crore. **Pie:** 2022 exports 25% (domestic 75%); 2021 exports 20%.

1. Exports in 2022 — (a) ₹200 crore  (b) ₹150 crore  (c) ₹250 crore  (d) ₹100 crore
2. Domestic sales in 2022 — (a) ₹550 crore  (b) ₹700 crore  (c) ₹600 crore  (d) ₹500 crore
3. Exports in 2021 — (a) ₹150 crore  (b) ₹80 crore  (c) ₹120 crore  (d) ₹100 crore
4. Total exports across both years — (a) ₹300 crore  (b) ₹250 crore  (c) ₹350 crore  (d) ₹400 crore
5. A pie chart in mixed DI is 100% of — (a) both bars  (b) the smaller bar  (c) one bar of its year  (d) the total of everything

**Answers:** 1→a, 2→c, 3→d, 4→a, 5→c.

### Key Takeaway

Mixed-graph DI connects two charts through one shared quantity — a pie is the inside story of a single bar. Read the scope, find the link, transfer the percentage onto the correct year's bar, and never let a fraction cross years. Structure beats speed every time.`,
    lessonSlug: 'mixed-caselet-di',
    order: 2
  }
];

/* ================================================================
 * Aptitude Problems
 * Solution strings mirror the matching problem sections of
 * the lesson's doc file (server/aptitude-content/NN-lesson-slug.md) (kept in sync for PDF generation).
 * ================================================================ */

const aptitudeProblems = [
  {
    title: 'Find Sum of Digits Divisible by 3',
    slug: 'sum-of-digits-divisible-by-3',
    lessonSlug: 'number-systems-hcf-lcm',
    subtopicSlug: 'divisibility-rules-number-properties',
    difficulty: 'easy',
    topics: ['Divisibility', 'Number Properties'],
    companies: ['Infosys', 'TCS'],
    problemStatement: 'Find the sum of the digits of 5862. Using the divisibility rules, determine whether 5862 is divisible by 3 and whether it is divisible by 9. Show the rule you use for each.',
    solution: `### Step-by-Step Solution

**Step 1 — Add the digits:**

\`\`\`
5862 → 5 + 8 + 6 + 2 = 21
\`\`\`

**Step 2 — Check divisibility by 3:**

> Rule: a number is divisible by 3 if the SUM of its digits is a multiple of 3.

21 is a multiple of 3 (21 = 3 × 7) → **5862 is divisible by 3**.
Quick check: 5862 ÷ 3 = 1954 exactly ✓

**Step 3 — Check divisibility by 9:**

> Rule: a number is divisible by 9 if the SUM of its digits is a multiple of 9.

21 is NOT a multiple of 9 → **5862 is NOT divisible by 9**.

### Answer

| Question | Answer |
|---|---|
| Sum of digits | **21** |
| Divisible by 3? | **Yes** |
| Divisible by 9? | **No** |

### Why the Rule Works (One Line)

10, 100, 1000, ... each leave a remainder of 1 when divided by 9, so a number and its digit sum always share the same remainder on division by 9 — the digit sum decides both 3 and 9 for free.

### Trap to Remember

Divisible by 9 ⟹ divisible by 3, but divisible by 3 does NOT imply divisible by 9. Here 21 is a multiple of 3 only — if the digit sum had been 27, both would have been true.`,
    media: []
  },
  {
    title: 'Find HCF and LCM of Two Numbers',
    slug: 'find-hcf-lcm-two-numbers',
    lessonSlug: 'number-systems-hcf-lcm',
    subtopicSlug: 'hcf-lcm',
    difficulty: 'easy',
    topics: ['HCF', 'LCM'],
    companies: ['TCS', 'Wipro'],
    problemStatement: 'Find the HCF and LCM of 24 and 36 using the prime factorisation method, and verify your answers using the golden relation HCF × LCM = A × B.',
    solution: `### Step-by-Step Solution

**Step 1 — Prime factorise both numbers:**

\`\`\`
24 = 2 × 2 × 2 × 3 = 2³ × 3
36 = 2 × 2 × 3 × 3 = 2² × 3²
\`\`\`

**Step 2 — HCF (smallest exponent of each prime):**

- 2 appears as 2³ and 2² → take 2²
- 3 appears as 3¹ and 3² → take 3¹

HCF = 2² × 3 = 4 × 3 = **12**

**Step 3 — LCM (largest exponent of each prime):**

- 2 appears as 2³ and 2² → take 2³
- 3 appears as 3¹ and 3² → take 3²

LCM = 2³ × 3² = 8 × 9 = **72**

**Step 4 — Verify with the golden relation:**

\`\`\`
HCF × LCM = 12 × 72 = 864
A × B     = 24 × 36 = 864
\`\`\`

Both sides match → the answers are correct. ✓

### Answer

| Question | Answer |
|---|---|
| HCF | **12** |
| LCM | **72** |
| Verification | 12 × 72 = 864 = 24 × 36 ✓ |

### Trap to Remember

The golden relation HCF × LCM = A × B works ONLY for two numbers. For three numbers, HCF(A, B, C) × LCM(A, B, C) is NOT equal to A × B × C — the product rule breaks down.`,
    media: []
  },
  {
    title: 'Simplify a Complex Expression',
    slug: 'simplify-complex-expression',
    lessonSlug: 'simplification-approximation',
    subtopicSlug: 'bodmas-simplification',
    difficulty: 'easy',
    topics: ['Simplification', 'BODMAS'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Simplify the following expression using BODMAS, showing each step: 12 + 6 × 2 − 18 ÷ 3 + (4 + 2 × 3)',
    solution: `### Step-by-Step Solution

**Step 1 — Solve the bracket first (B), and inside it, multiplication before addition (M before A):**

\`\`\`
(4 + 2 × 3) = 4 + 6 = 10
\`\`\`

**Step 2 — Rewrite the expression with the bracket resolved:**

\`\`\`
12 + 6 × 2 − 18 ÷ 3 + 10
\`\`\`

**Step 3 — Division and multiplication, left to right (D then M):**

\`\`\`
6 × 2  = 12
18 ÷ 3 = 6
\`\`\`

**Step 4 — Addition and subtraction, left to right (A then S):**

\`\`\`
12 + 12 − 6 + 10
 = 24 − 6 + 10
 = 18 + 10
 = 28
\`\`\`

### Answer

| Step | Result |
|---|---|
| Bracket | (4 + 2 × 3) = 10 |
| Final value | **28** |

### Trap to Remember

The bracket contains its own multiplication: \`4 + 2 × 3\` is 4 + 6 = 10 — NOT (4 + 2) × 3 = 18. BODMAS applies inside brackets too.`,
    media: []
  },
  {
    title: 'Approximate the Value of an Expression',
    slug: 'approximate-expression-value',
    lessonSlug: 'simplification-approximation',
    subtopicSlug: 'approximation-techniques',
    difficulty: 'easy',
    topics: ['Approximation'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Estimate the value of the expression (36% of 1195 + 41% of 795) ÷ 14 to the nearest whole number, and choose the closest option: (a) 50  (b) 54  (c) 58  (d) 62',
    solution: `### Step-by-Step Solution

**Step 1 — Round each number to a convenient neighbour:**

\`\`\`
1195 → 1200     (1200 × 36% is clean)
 795 →  800     (800 × 41% is clean)
\`\`\`

**Step 2 — Compute each percentage:**

\`\`\`
36% of 1200 = 0.36 × 1200 = 432
41% of  800 = 0.41 ×  800 = 328
\`\`\`

**Step 3 — Add, then divide:**

\`\`\`
432 + 328 = 760
760 ÷ 14 = 54.28 → ≈ 54
\`\`\`

**Step 4 — Compare with options:**

\`\`\`
(a) 50   (b) 54   (c) 58   (d) 62   →  closest is 54
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Approximate value | **54** |
| Option | **(b) 54** |
| Exact check | (0.36×1195 + 0.41×795) ÷ 14 = 756.15 ÷ 14 = 54.01 ✓ |

### Why Rounding This Way Is Safe

1195 rounded UP by 5 and 795 rounded UP by 5 — both estimates run high, yet the final error is just 0.27 on the whole expression. Even when errors stack, a 54.28 estimate vs a 54.01 exact answer means option (b) is picked with complete confidence — and in a fraction of the time.

### Trap to Remember

If the options had been 53, 54, 55, the rounding shortcut would be too risky — with options a whole number apart, round as much as you like.`,
    media: []
  },
  {
    title: 'Calculate Percentage Change',
    slug: 'calculate-percentage-change',
    lessonSlug: 'percentages',
    subtopicSlug: 'percentage-basics-conversions',
    difficulty: 'easy',
    topics: ['Percentages'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'A student\'s test marks increased from 320 to 400. Find the percentage increase in the marks.',
    solution: `### Step-by-Step Solution

**Step 1 — Find the change:**

\`\`\`
Change = New − Original = 400 − 320 = 80
\`\`\`

**Step 2 — Apply the percentage change formula (base = ORIGINAL):**

\`\`\`
% change = (Change ÷ Original) × 100
         = (80 ÷ 320) × 100
         = 0.25 × 100
         = 25%
\`\`\`

**Step 3 — Sense check:** 25% of 320 = 320 ÷ 4 = 80 ✓ — the increase is exactly a quarter of the original.

### Answer

| Question | Answer |
|---|---|
| Change in marks | 80 |
| Percentage increase | **25%** |
| Check | 320 × 1.25 = 400 ✓ |

### Trap to Remember

The base is 320 (the ORIGINAL marks), never 400. Computing 80/400 = 20% is the classic wrong answer — percentage change always anchors to the starting value.`,
    media: []
  },
  {
    title: 'Find Net Percentage Change',
    slug: 'find-net-percentage-change',
    lessonSlug: 'percentages',
    subtopicSlug: 'successive-percentage-change',
    difficulty: 'easy',
    topics: ['Percentages', 'Successive Change'],
    companies: ['Amazon', 'Flipkart'],
    problemStatement: 'The price of an item first increases by 20% and then decreases by 10%. Find the net percentage change in the price.',
    solution: `### Step-by-Step Solution

**Step 1 — Convert each change to a multiplier:**

\`\`\`
+20%  →  × 1.20
−10%  →  × 0.90
\`\`\`

**Step 2 — Multiply the multipliers:**

\`\`\`
1.20 × 0.90 = 1.08
\`\`\`

**Step 3 — Interpret the result:**

A multiplier of 1.08 means the final price is 108% of the original → **net increase of 8%**.

**Verification with a base price of ₹100:**

\`\`\`
Start:   100
+20%:    100 × 1.20 = 120
−10%:    120 × 0.90 = 108
Net:     108 − 100 = 8 → +8% ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Net change | **+8% (increase)** |
| Multiplier | 1.20 × 0.90 = 1.08 |
| Check with ₹100 | 100 → 120 → 108 ✓ |

### Trap to Remember

The answer is NOT "20 − 10 = 10%". The 10% decrease acts on the INCREASED price (120), so it removes ₹12 — not ₹10. Every successive change is a multiplication on the running total, never an addition on the original.`,
    media: []
  },
  {
    title: 'Calculate Profit Percentage',
    slug: 'calculate-profit-percentage',
    lessonSlug: 'profit-loss-discount',
    subtopicSlug: 'profit-loss-basics',
    difficulty: 'easy',
    topics: ['Profit & Loss'],
    companies: ['Wipro', 'TCS'],
    problemStatement: 'A shopkeeper buys a pen for ₹80 and sells it for ₹100. Find his profit percentage.',
    solution: `### Step-by-Step Solution

**Step 1 — Find the profit (in rupees):**

\`\`\`
Profit = SP − CP = 100 − 80 = ₹20
\`\`\`

**Step 2 — Apply the profit percentage formula (base = CP):**

\`\`\`
Profit % = (Profit ÷ CP) × 100
         = (20 ÷ 80) × 100
         = 0.25 × 100
         = 25%
\`\`\`

**Step 3 — Sense check:** 25% of 80 = 80 ÷ 4 = 20 ✓ — the profit is exactly a quarter of the cost price.

### Answer

| Question | Answer |
|---|---|
| Profit | ₹20 |
| Profit percentage | **25%** |
| Check | 80 × 1.25 = 100 ✓ |

### Trap to Remember

The base is 80 (the COST price), never 100. Computing 20/100 = 20% is the classic wrong answer — profit percentage always anchors to what the shopkeeper PAID, not what he received.`,
    media: []
  },
  {
    title: 'Find Selling Price After Discount',
    slug: 'find-selling-price-after-discount',
    lessonSlug: 'profit-loss-discount',
    subtopicSlug: 'discount-marked-price',
    difficulty: 'easy',
    topics: ['Profit & Loss', 'Discount'],
    companies: ['Flipkart', 'Amazon'],
    problemStatement: 'A shopkeeper marks a shirt at ₹1,200 and offers a 15% festival discount. Find the selling price the customer pays.',
    solution: `### Step-by-Step Solution

**Step 1 — Convert the discount to a multiplier:**

\`\`\`
−15%  →  × 0.85
\`\`\`

**Step 2 — Apply it to the MARKED price (the discount's base):**

\`\`\`
SP = MP × (1 − d/100)
   = 1200 × 0.85
   = ₹1,020
\`\`\`

**Step 3 — Check with the subtraction method:**

\`\`\`
Discount amount = 15% of 1200 = 0.15 × 1200 = ₹180
SP = 1200 − 180 = ₹1,020 ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Discount amount | ₹180 |
| Selling price | **₹1,020** |
| Check | 1200 × 0.85 = 1020 ✓ |

### Trap to Remember

The 15% is cut from the MARKED price (₹1,200), not the cost price. If the shirt had cost ₹800, the discount of ₹180 would still come off ₹1,200 — discount and profit simply live on different bases.`,
    media: []
  },
  {
    title: 'Divide an Amount in a Given Ratio',
    slug: 'divide-amount-in-given-ratio',
    lessonSlug: 'ratio-proportion-averages',
    subtopicSlug: 'ratio-proportion-basics',
    difficulty: 'easy',
    topics: ['Ratio & Proportion'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Divide ₹1,000 between two friends, Aman and Bhavna, in the ratio 2 : 3. Find each one\'s share.',
    solution: `### Step-by-Step Solution

**Step 1 — Count the total parts:**

\`\`\`
Aman gets 2 parts, Bhavna gets 3 parts
Total parts = 2 + 3 = 5 parts
\`\`\`

**Step 2 — Find the value of ONE part:**

\`\`\`
1 part = Total amount ÷ Total parts
       = 1000 ÷ 5
       = ₹200
\`\`\`

**Step 3 — Multiply the parts by one part's value:**

\`\`\`
Aman's share   = 2 × 200 = ₹400
Bhavna's share = 3 × 200 = ₹600
\`\`\`

**Step 4 — Verify:**

\`\`\`
Sum:  400 + 600 = ₹1,000 ✓  (the whole amount is shared)
Ratio: 400 : 600 = 4 : 6 = 2 : 3 ✓  (simplify by 200 — the pattern holds)
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Value of one part | ₹200 |
| Aman's share (2 parts) | **₹400** |
| Bhavna's share (3 parts) | **₹600** |
| Check | ₹400 + ₹600 = ₹1,000 ✓ |

### Trap to Remember

The larger ratio number does NOT mean the larger share by itself — it means more PARTS. And always add the parts (2 + 3 = 5) before dividing the money. A classic wrong answer is "2 × 100 = 200 and 3 × 100 = 300" from dividing by 10 — the money is shared across 5 parts, not 2, not 3, and not 10.`,
    media: []
  },
  {
    title: 'Find Average After Replacement',
    slug: 'find-average-after-replacement',
    lessonSlug: 'ratio-proportion-averages',
    subtopicSlug: 'averages-mixtures',
    difficulty: 'easy',
    topics: ['Averages', 'Mixtures'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'The average weight of 5 students is 40 kg. One student weighing 50 kg leaves the group, and a new student weighing 45 kg joins. Find the new average weight of the group.',
    solution: `### Step-by-Step Solution

**Step 1 — Find the old total (this is the key move):**

\`\`\`
Total = Average × Count = 5 × 40 = 200 kg
\`\`\`

**Step 2 — Apply the replacement (only the total changes):**

\`\`\`
Old total:    200 kg
Student leaves:  −50 kg
New student joins: +45 kg
New total:    200 − 50 + 45 = 195 kg
\`\`\`

**Step 3 — Divide by the same count (still 5 students):**

\`\`\`
New average = 195 ÷ 5 = 39 kg
\`\`\`

**Step 4 — Verify with the shortcut:**

\`\`\`
Net change = −50 + 45 = −5 kg, spread over 5 students
Average drops by −5 ÷ 5 = −1 kg → 40 − 1 = 39 kg ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Old total | 200 kg |
| New total | 195 kg |
| New average | **39 kg** |
| Check | −1 kg per student × 5 = −5 kg total ✓ |

### Trap to Remember

The number of students does NOT change — one leaves, one joins, so we still divide by 5. The only thing that changes is the total. And the departing student is SUBTRACTED at their full weight (50), not at the average (40) — a student heavier than average leaves a bigger hole in the total.`,
    media: []
  },
  {
    title: 'Find Time to Meet (Opposite Directions)',
    slug: 'find-time-to-meet-opposite-directions',
    lessonSlug: 'time-speed-distance',
    subtopicSlug: 'basic-tsd-relative-speed',
    difficulty: 'easy',
    topics: ['Time, Speed & Distance', 'Relative Speed'],
    companies: ['Infosys', 'TCS'],
    problemStatement: 'Two friends, Riya and Kabir, start at the same time from two towns 150 km apart and cycle toward each other. Riya cycles at 20 km/h and Kabir at 30 km/h. How long will they take to meet?',
    solution: `### Step-by-Step Solution

**Step 1 — Find the relative speed (opposite directions → ADD):**

\`\`\`
Relative speed = 20 + 30 = 50 km/h
\`\`\`

Every hour, the gap between them shrinks by 50 km — both are riding into each other's side of the road.

**Step 2 — Divide the gap by the closing speed:**

\`\`\`
Time to meet = Distance ÷ Relative speed
             = 150 ÷ 50
             = 3 hours
\`\`\`

**Step 3 — Verify by adding their individual distances:**

\`\`\`
Riya covers:   20 × 3 = 60 km
Kabir covers:  30 × 3 = 90 km
Total:         60 + 90 = 150 km ✓  (exactly the gap between the towns)
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Relative speed | 50 km/h |
| Time to meet | **3 hours** |
| Check | 60 km + 90 km = 150 km ✓ |

### Trap to Remember

Do NOT use the average speed (25 km/h) — they are closing the gap with BOTH speeds at once. And never subtract here: they move in opposite directions, so the speeds cooperate. Subtract is only for chases.`,
    media: []
  },
  {
    title: 'Train Crossing a Platform',
    slug: 'train-crossing-a-platform',
    lessonSlug: 'time-speed-distance',
    subtopicSlug: 'boats-streams-trains',
    difficulty: 'easy',
    topics: ['Time, Speed & Distance', 'Trains'],
    companies: ['Accenture', 'Wipro'],
    problemStatement: 'A train 150 m long is running at 54 km/h. How long will it take to cross a platform 100 m long?',
    solution: `### Step-by-Step Solution

**Step 1 — Convert the speed to m/s (lengths are in metres):**

\`\`\`
54 km/h = 54 × 5/18 = 15 m/s
\`\`\`

**Step 2 — Find the total distance (the whole body must get through):**

\`\`\`
Distance = Train length + Platform length
         = 150 + 100
         = 250 m
\`\`\`

**Step 3 — Apply D = S × T:**

\`\`\`
Time = Distance ÷ Speed
     = 250 ÷ 15
     = 16.67 seconds (16⅔ s)
\`\`\`

**Step 4 — Verify the conversion:**

\`\`\`
15 m/s × 16⅔ s = 15 × 50/3 = 250 m ✓  (speed × time = distance)
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Speed | 15 m/s |
| Total distance | 250 m |
| Time taken | **16⅔ seconds** |
| Check | 15 × 16⅔ = 250 m ✓ |

### Trap to Remember

The train must pull its WHOLE body through the platform — the 150 m tail starts behind the nose, so 250 m must be covered, not 100 m. And the km/h speed must be converted to m/s before dividing; mixing 54 with 250 directly gives nonsense.`,
    media: []
  },
  {
    title: 'Days to Complete Work Together',
    slug: 'days-complete-work-together',
    lessonSlug: 'time-work',
    subtopicSlug: 'work-efficiency',
    difficulty: 'easy',
    topics: ['Time & Work', 'Efficiency'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together, in how many days will they finish the work?',
    solution: `### Step-by-Step Solution

**Step 1 — Pick the total work (LCM method):**

\`\`\`
LCM(12, 18) = 36 units of work
\`\`\`

**Step 2 — Find each person's daily output:**

\`\`\`
A's daily work = 36 ÷ 12 = 3 units/day
B's daily work = 36 ÷ 18 = 2 units/day
\`\`\`

**Step 3 — Combined daily output:**

\`\`\`
A + B = 3 + 2 = 5 units/day
\`\`\`

**Step 4 — Days to finish together:**

\`\`\`
Days = 36 ÷ 5 = 7.2 days = 7⅕ days
\`\`\`

**Cross-check with fractions (same answer, different path):**

\`\`\`
1/12 + 1/18 = 3/36 + 2/36 = 5/36
Days = 1 ÷ (5/36) = 36/5 = 7.2 ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Total work (LCM of 12, 18) | **36 units** |
| A's daily work | 3 units |
| B's daily work | 2 units |
| Combined daily work | 5 units |
| **Days to finish together** | **7.2 days (7⅕ days)** |

### Why This Works (One Line)

People working together add their *daily fractions* (or units) — never their days — because every day, both of them push the work forward at the same time.

### Trap to Remember

Never answer 12 + 18 = 30 days. Two workers together are always faster than each worker alone, so the combined time (7.2) must be smaller than both 12 and 18. If your answer is larger than either individual time, you added the days instead of the rates.`,
    media: []
  },
  {
    title: 'Time to Fill a Tank with a Leak',
    slug: 'time-fill-tank-leak',
    lessonSlug: 'time-work',
    subtopicSlug: 'pipes-cisterns',
    difficulty: 'easy',
    topics: ['Pipes & Cisterns', 'Leak'],
    companies: ['Accenture', 'Wipro'],
    problemStatement: 'A pipe can fill a tank in 6 hours. A leak at the bottom of the tank can empty the full tank in 12 hours. If the tank is initially empty and the filling pipe is opened with the leak left open, how long will it take to fill the tank?',
    solution: `### Step-by-Step Solution

**Step 1 — Fill rate of the pipe:**

\`\`\`
Pipe fills 1 full tank in 6 h → fill rate = 1/6 of the tank per hour
\`\`\`

**Step 2 — Leak rate:**

\`\`\`
Leak empties 1 full tank in 12 h → leak rate = 1/12 of the tank per hour
\`\`\`

**Step 3 — Net rate (filling − emptying):**

\`\`\`
Net rate = 1/6 − 1/12 = 2/12 − 1/12 = 1/12 of the tank per hour
\`\`\`

**Step 4 — Time to fill:**

\`\`\`
Time = 1 ÷ (1/12) = 12 hours
\`\`\`

**Sanity check:** the leak drains water at half the speed the pipe pours it in, so the tank fills at half speed — 12 hours instead of 6. A leak can only slow a fill down, and here it exactly doubles the time. ✓

### Answer

| Question | Answer |
|---|---|
| Fill rate | 1/6 tank per hour |
| Leak rate | 1/12 tank per hour |
| Net rate | 1/12 tank per hour |
| **Time to fill with leak open** | **12 hours** |

### Why This Works (One Line)

A filling pipe is positive work and a leak is negative work, so the tank rises at the speed of (fill rate − leak rate), and time = 1 ÷ net rate.

### Trap to Remember

The leak is *subtracted*, never added — 1/6 + 1/12 = 1/4 would wrongly give 4 hours. Also, the leak's "empties in 12 h" refers to a full tank, which is exactly the absolute rate to subtract: 1/12 per hour. Get the sign right and the chapter is easy.`,
    media: []
  },
  {
    title: 'Calculate SI for a Given Principal',
    slug: 'calculate-si-for-given-principal',
    lessonSlug: 'simple-compound-interest',
    subtopicSlug: 'simple-interest',
    difficulty: 'easy',
    topics: ['Simple Interest'],
    companies: ['TCS', 'Wipro'],
    problemStatement: 'Find the simple interest on ₹5,000 at 8% per annum for 3 years. Also find the total amount to be repaid.',
    solution: `### Step-by-Step Solution

**Step 1 — Write down what you know:**

\`\`\`
P = ₹5,000   R = 8%   T = 3 years
\`\`\`

**Step 2 — Apply the SI formula:**

\`\`\`
SI = (P × R × T) ÷ 100
   = (5000 × 8 × 3) ÷ 100
   = 120000 ÷ 100
   = ₹1,200
\`\`\`

**Step 3 — Find the amount (principal + interest):**

\`\`\`
Amount = P + SI = 5000 + 1200 = ₹6,200
\`\`\`

**Step 4 — Verify year by year:**

\`\`\`
Year 1: 8% of 5000 = ₹400
Year 2: 8% of 5000 = ₹400
Year 3: 8% of 5000 = ₹400
Total:  3 × 400 = ₹1,200 ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Interest per year | ₹400 |
| Simple interest (3 years) | **₹1,200** |
| Amount to be repaid | **₹6,200** |
| Check | 3 × 400 = 1,200 ✓ |

### Trap to Remember

Every year's interest is on the ORIGINAL ₹5,000 — never on the growing balance (that would be compound interest). And read the question: "interest" wants ₹1,200, "amount" wants ₹6,200. Missing the difference loses the mark.`,
    media: []
  },
  {
    title: 'Calculate CI–SI Difference',
    slug: 'calculate-ci-si-difference',
    lessonSlug: 'simple-compound-interest',
    subtopicSlug: 'compound-interest',
    difficulty: 'easy',
    topics: ['Compound Interest'],
    companies: ['Infosys', 'Accenture'],
    problemStatement: 'Find the difference between the compound interest and the simple interest on ₹10,000 at 10% per annum for 2 years.',
    solution: `### Step-by-Step Solution

**Step 1 — Compute the simple interest:**

\`\`\`
SI = (10000 × 10 × 2) ÷ 100 = ₹2,000
\`\`\`

**Step 2 — Compute the compound interest:**

\`\`\`
Amount = P × (1 + R/100)² = 10000 × 1.1 × 1.1 = 10000 × 1.21 = ₹12,100
CI = 12100 − 10000 = ₹2,100
\`\`\`

**Step 3 — Find the difference:**

\`\`\`
CI − SI = 2100 − 2000 = ₹100
\`\`\`

**Step 4 — Verify with the shortcut formula:**

\`\`\`
CI − SI = P × (R/100)² = 10000 × (10/100)² = 10000 × 0.01 = ₹100 ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Simple interest | ₹2,000 |
| Compound interest | ₹2,100 |
| Difference | **₹100** |
| Check | 10000 × 0.1² = 100 ✓ |

### Trap to Remember

The difference is NOT the whole extra ₹100 being charged twice — it is exactly the interest earned on the first year's ₹1,000 of interest (10% of 1,000 = ₹100). For 2 years that's always P × (R/100)². For 3 years, remember the longer version: P × (R/100)² × (3 + R/100).`,
    media: []
  },
  {
    title: 'Arrange Letters of a Word',
    slug: 'arrange-letters-of-a-word',
    lessonSlug: 'permutations-combinations-probability',
    subtopicSlug: 'permutations-combinations',
    difficulty: 'easy',
    topics: ['Permutations', 'Combinations'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'How many different ways can the letters of the word "BOOK" be arranged?',
    solution: `### Step-by-Step Solution

**Step 1 — Arrange the 4 letters like they were all different:**

\`\`\`
4 × 3 × 2 × 1 = 24
\`\`\`

**Step 2 — Spot the problem:** the two O's are the same letter. Swapping them makes no new word — every arrangement above was counted twice (once with each O first).

**Step 3 — Divide by the repeats' shuffles:**

\`\`\`
24 ÷ 2! = 24 ÷ 2 = 12
\`\`\`

**Step 4 — Verify with blocks:**

\`\`\`
Treat "OO" as one block X → arrange B, X, K → 3! = 6 ways
O's separated → 12 − 6 = 6 ways
Total = 6 + 6 = 12 ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| All 4 letters arranged | 24 |
| The O's shuffles | 2 |
| Distinct arrangements | **12** (24 ÷ 2) |
| Check | 6 (blocked) + 6 (separated) = 12 ✓ |

### Trap to Remember

Don't answer 4! = 24 — the two O's are the same letter, so divide by 2!. Same rule for any word: divide by each repeated letter's factorial.`,
    media: []
  },
  {
    title: 'Probability of Drawing a Card',
    slug: 'probability-of-drawing-a-card',
    lessonSlug: 'permutations-combinations-probability',
    subtopicSlug: 'basic-probability',
    difficulty: 'easy',
    topics: ['Probability'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'A card is drawn at random from a well-shuffled deck of 52 cards. What is the probability that the card is a king?',
    solution: `### Step-by-Step Solution

**Step 1 — Count all outcomes:**

\`\`\`
A full deck = 52 cards
\`\`\`

**Step 2 — Count the good outcomes:**

\`\`\`
Kings = 4 (one king in each suit: hearts, diamonds, clubs, spades)
\`\`\`

**Step 3 — Divide:**

\`\`\`
P(king) = 4 ÷ 52 = 1/13
\`\`\`

**Step 4 — Check:**

\`\`\`
4 × 13 = 52 ✓ — one king in every 13 cards, which matches the deck (4 suits of 13).
\`\`\`

### Answer

| Question | Answer |
|---|---|
| All cards | 52 |
| Good cards (kings) | 4 |
| Probability | **1/13** |
| Check | 4 × 13 = 52 ✓ |

### Trap to Remember

Don't leave 4/52 — simplify to 1/13. And don't answer 1/52 — that's only the ace of spades (one specific card). "A king" means any of the 4 kings.`,
    media: []
  },
  {
    title: 'Solve an Ages Problem',
    slug: 'solve-an-ages-problem',
    lessonSlug: 'algebra-equations-mensuration',
    subtopicSlug: 'linear-quadratic-equations',
    difficulty: 'easy',
    topics: ['Linear Equations', 'Ages'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'A father is 3 times as old as his son. In 12 years, the father will be exactly twice as old as his son. Find their present ages.',
    solution: `### Step-by-Step Solution

**Step 1 — Build the now/then table:**

| Person | Age now | Age in 12 years |
|---|---|---|
| Son | x | x + 12 |
| Father | 3x | 3x + 12 |

**Step 2 — Turn the story into an equation:**

"In 12 years, father = twice son":

\`\`\`
3x + 12 = 2(x + 12)
\`\`\`

**Step 3 — Solve:**

\`\`\`
3x + 12 = 2x + 24
3x − 2x = 24 − 12
x = 12
\`\`\`

**Step 4 — Check with the table:**

\`\`\`
Son now = 12 → in 12 years = 24
Father now = 36 → in 12 years = 48
Is 48 = 2 × 24? Yes ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Son's age now | **12 years** |
| Father's age now | **36 years** (3 × 12) |
| In 12 years | Son 24, Father 48 |
| Check | 48 = 2 × 24 ✓ |

### Trap to Remember

Add 12 to BOTH ages — many students add it only to the father and get a wrong equation. And always check the final answer against the words of the question, not just the algebra.`,
    media: []
  },
  {
    title: 'Find Volume of a Cylinder',
    slug: 'find-volume-of-a-cylinder',
    lessonSlug: 'algebra-equations-mensuration',
    subtopicSlug: 'mensuration-basics',
    difficulty: 'easy',
    topics: ['Mensuration', 'Volume'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Find the volume of a cylinder with radius 7 cm and height 10 cm. (Take π = 22/7.)',
    solution: `### Step-by-Step Solution

**Step 1 — Write the formula:**

\`\`\`
Volume = πr²h
\`\`\`

**Step 2 — Plug in the values (r = 7, h = 10):**

\`\`\`
V = 22/7 × 7² × 10
  = 22/7 × 49 × 10
\`\`\`

**Step 3 — Cancel the 7s:**

\`\`\`
V = 22 × 7 × 10
  = 154 × 10
  = 1,540 cm³
\`\`\`

**Step 4 — Check in steps:**

\`\`\`
r² = 7 × 7 = 49
πr² = 22/7 × 49 = 22 × 7 = 154 cm²  (the circle's area — makes sense)
Volume = 154 × 10 = 1,540 cm³ ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Formula | πr²h |
| πr² (circle area) | 154 cm² |
| Volume | **1,540 cm³** |
| Check | 154 × 10 = 1,540 ✓ |

### Trap to Remember

Volume is cubic — cm³, never cm² (that's the circle's area, which is just one slice of the cylinder). And when the radius is a multiple of 7, use π = 22/7 so the fraction cancels instead of fighting you.`,
    media: []
  },
  {
    title: 'Solve a Seating Puzzle',
    slug: 'solve-a-seating-puzzle',
    lessonSlug: 'puzzles-syllogisms',
    subtopicSlug: 'logical-puzzles',
    difficulty: 'easy',
    topics: ['Logical Puzzles', 'Seating Arrangement'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Five friends P, Q, R, S, T sit in a row of five seats facing north. R sits in the middle. T sits at the right end. P sits immediately to the left of Q. Who sits at the left end? Who sits between R and T?',
    solution: `### Step-by-Step Solution

**Step 1 — Draw the seats and place the definite clues:**

\`\`\`
Seat:  1    2    3    4    5
       _    _    R    _    T
\`\`\`

**Step 2 — Find the only possible spot for the pair (P, Q):**

They must be neighbours with P on the left. Free seats: 1, 2, 4. Only (1, 2) is an adjacent free pair:

\`\`\`
Seat:  1    2    3    4    5
       P    Q    R    _    T
\`\`\`

**Step 3 — S takes the last seat:**

\`\`\`
Seat:  1    2    3    4    5
       P    Q    R    S    T
\`\`\`

**Step 4 — Verify every clue:**

\`\`\`
R middle (seat 3)? ✓    T right end (seat 5)? ✓
P immediately left of Q (1 then 2)? ✓    All five placed? ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Left end | **P** |
| Between R and T | **S** |
| Full row | P, Q, R, S, T |
| Check | Every clue verified ✓ |

### Trap to Remember

Don't guess — the pair (P, Q) had only ONE possible spot once R and T were placed. Start with the definite clues and the arrangement builds itself. Also note "immediately to the left" means neighbours: P and Q touch.`,
    media: []
  },
  {
    title: 'Determine the Valid Conclusion',
    slug: 'determine-valid-conclusion',
    lessonSlug: 'puzzles-syllogisms',
    subtopicSlug: 'syllogisms',
    difficulty: 'easy',
    topics: ['Syllogisms'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Statements: All cats are mammals. All mammals are animals. Conclusions: (1) All cats are animals. (2) Some animals are cats. (3) All animals are cats. Which conclusions follow?',
    solution: `### Step-by-Step Solution

**Step 1 — Draw the circles:**

\`\`\`
Cats' circle sits inside Mammals' circle, which sits inside Animals' circle.
\`\`\`

**Step 2 — Test conclusion (1):** all cats are animals — the chain:

\`\`\`
Cats → Mammals → Animals
\`\`\`

Continuous chain → **follows** ✓

**Step 3 — Test conclusion (2):** some animals are cats — safe flip of (1):

"All cats are animals" flips safely to "Some animals are cats" → **follows** ✓

**Step 4 — Test conclusion (3):** all animals are cats — reversing "all":

The animals' circle is bigger; cats are only a part of it → **does not follow** ✗

### Answer

| Conclusion | Verdict |
|---|---|
| (1) All cats are animals | **Follows** ✓ (chain) |
| (2) Some animals are cats | **Follows** ✓ (safe flip) |
| (3) All animals are cats | **Does not follow** ✗ (never reverse "all") |
| Final answer | (1) and (2) |

### Trap to Remember

The classic exam trap is conclusion (3) — it sounds mirror-symmetric but reverses the direction of "all." If the circles show animals bigger than cats, "all animals are cats" can't be true, while "some animals are cats" definitely is.`,
    media: []
  },
  {
    title: 'Identify the Family Relation',
    slug: 'identify-family-relation',
    lessonSlug: 'blood-relations-direction',
    subtopicSlug: 'blood-relations',
    difficulty: 'easy',
    topics: ['Blood Relations'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Pointing to a man, Riya said, "He is the son of my father\'s only son." How is the man related to Riya?',
    solution: `### Step-by-Step Solution

**Step 1 — Break the chain at "my father's only son":**

Riya's father has one son — and since Riya is a girl (she says "my"), that son is **Riya's brother**.

**Step 2 — Continue the chain: "son of [my brother]":**

The man is the son of Riya's brother.

**Step 3 — Read the relation:**

| Chain link | Person |
|---|---|
| my father | Riya's father |
| father's only son | Riya's brother |
| brother's son | Riya's **nephew** |

### Answer

| Question | Answer |
|---|---|
| Father's only son | Riya's brother |
| That son's son | **Riya's nephew** |
| Relation | The man is Riya's **nephew** |

### Trap to Remember

The "only son" is the brother, NOT Riya — Riya is the daughter. And don't stop one link early: "son of my father's only son" is two links (father → brother → nephew), and the question tests whether you walk both.`,
    media: []
  },
  {
    title: 'Find Final Direction and Distance',
    slug: 'find-final-direction-distance',
    lessonSlug: 'blood-relations-direction',
    subtopicSlug: 'direction-sense',
    difficulty: 'easy',
    topics: ['Direction Sense'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Rohan walks 3 km north, then turns right and walks 4 km. How far is he from his starting point, and in which direction?',
    solution: `### Step-by-Step Solution

**Step 1 — Draw the path:**

\`\`\`
Step 1: 3 km North   (arrow up)
Step 2: right turn from north → facing East → 4 km (arrow right)
\`\`\`

**Step 2 — Recognise the right-angle triangle:**

The two legs are 3 km and 4 km at a right angle. The straight-line distance is the hypotenuse — the classic 3-4-5 triple:

\`\`\`
3² + 4² = 9 + 16 = 25 = 5²
Distance = 5 km
\`\`\`

**Step 3 — Find the direction:**

The walk went north and then east → the final point is **North-East** of the start.

**Step 4 — Verify with the picture:**

\`\`\`
          4 km East
Start ↑ 3 km North
\`\`\`

The hypotenuse leans north-east, and it is clearly shorter than 3 + 4 = 7 km ✓.

### Answer

| Question | Answer |
|---|---|
| North leg | 3 km |
| East leg | 4 km |
| Straight-line distance | **5 km** |
| Direction | **North-East** |

### Trap to Remember

Never answer 7 km (3 + 4) — the straight-line distance is the hypotenuse, always shorter than the walked path. And the direction is North-East, not North or East: the start lies diagonally back, between the two arrows.`,
    media: []
  },
  {
    title: 'Decode the Given Pattern',
    slug: 'decode-given-pattern',
    lessonSlug: 'coding-decoding-number-series',
    subtopicSlug: 'coding-decoding',
    difficulty: 'easy',
    topics: ['Coding-Decoding'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'In a certain code, CAT is written as DBU. How is DOG written in that code?',
    solution: `### Step-by-Step Solution

**Step 1 — Find the rule from the sample:**

| Letter | Code | Change |
|---|---|---|
| C | D | +1 |
| A | B | +1 |
| T | U | +1 |

The rule is **"+1 on every letter"** — the entire alphabet shifts one step forward.

**Step 2 — Apply the rule to the target word:**

| Letter | +1 → |
|---|---|
| D | E |
| O | P |
| G | H |

**Step 3 — Read the code:**

DOG → EPH.

### Answer

| Question | Answer |
|---|---|
| Rule in the sample | Every letter +1 |
| D + 1 | E |
| O + 1 | P |
| G + 1 | H |
| Code of DOG | **EPH** |

### Trap to Remember

Don't leap to a pattern you've seen before — the rule always comes from the sample given in the question. Here the sample says "+1", and "O + 1 = P" (not Q): go letter by letter, one step each.`,
    media: []
  },
  {
    title: 'Find the Missing Term',
    slug: 'find-missing-term',
    lessonSlug: 'coding-decoding-number-series',
    subtopicSlug: 'number-series',
    difficulty: 'easy',
    topics: ['Number Series'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Find the missing term in the series: 2, 5, 10, 17, ?, 37.',
    solution: `### Step-by-Step Solution

**Step 1 — Write down the differences:**

\`\`\`
2 → 5  = +3
5 → 10 = +5
10 → 17 = +7
17 → ?   = +9   (the differences grow by +2 each time)
? → 37  = +11  (check: +9 → +11 also grows by +2 ✓)
\`\`\`

**Step 2 — Continue the growth:**

The differences are 3, 5, 7 — each is +2 bigger than the last. The next two are **9** and **11**.

**Step 3 — Fill the gap:**

17 + 9 = **26**  and  26 + 11 = 37 ✓

**Step 4 — Verify with the second known term:**

The +11 from 26 to 37 matches the growing pattern, so 26 is correct.

### Answer

| Question | Answer |
|---|---|
| Differences | +3, +5, +7, +9, +11 |
| Missing term | **26** |
| Full series | 2, 5, 10, 17, 26, 37 |

### Trap to Remember

The sequence smells like squares (2, 5, 10, 17 are n² + 1) — but the differences (3, 5, 7, 9, 11) give 26, not 25. Trust the differences, not the vibe: they reveal the pattern and verify it on the final 37.`,
    media: []
  },
  {
    title: 'Complete the Analogy',
    slug: 'complete-the-analogy',
    lessonSlug: 'analogies-odd-one-out',
    subtopicSlug: 'analogies',
    difficulty: 'easy',
    topics: ['Analogies'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Doctor : Hospital :: Teacher : ?',
    solution: `### Step-by-Step Solution

**Step 1 — Name the relationship of the complete pair:**

A doctor WORKS IN a hospital. The relationship is **worker → place**.

| Pair | Relationship |
|---|---|
| Doctor : Hospital | Worker → workplace |

**Step 2 — Apply the same relationship to the incomplete pair:**

A teacher works in a **school**.

**Step 3 — Verify the direction:**

The pattern faces the same way in both pairs: worker first, place second ✓.

### Answer

| Question | Answer |
|---|---|
| Relationship | Worker works in a place |
| Doctor works in | Hospital |
| Teacher works in | **School** |

### Trap to Remember

"Teacher : Students" feels related but breaks the pattern — the question asks for the PLACE a teacher works, not the people they teach. Name the relationship first, and the answer stops being a guess.`,
    media: []
  },
  {
    title: 'Find the Odd One Out',
    slug: 'find-the-odd-one-out',
    lessonSlug: 'analogies-odd-one-out',
    subtopicSlug: 'odd-one-out',
    difficulty: 'easy',
    topics: ['Odd One Out'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Which is the odd one out: 4, 9, 16, 25, 31?',
    solution: `### Step-by-Step Solution

**Step 1 — Find the property shared by THREE items:**

4, 9, 16, 25 are all perfect squares:

\`\`\`
4  = 2²
9  = 3²
16 = 4²
25 = 5²
\`\`\`

**Step 2 — Test the fourth item:**

31 is not a perfect square.

**Step 3 — Declare the odd one out:**

31 breaks the rule → **31** is the answer.

### Answer

| Question | Answer |
|---|---|
| Squares in the group | 4, 9, 16, 25 (2² to 5²) |
| Non-square | **31** |
| Odd one out | **31** |

### Trap to Remember

Don't answer "31 is odd, so it's odd one out" — the real rule is the squares. And don't pick 25 ("different gap"): the rule must fit exactly three items (4, 9, 16, 25) and leave the fourth (31) as the intruder.`,
    media: []
  },
  {
    title: 'Arrange People in a Row',
    slug: 'arrange-people-in-a-row',
    lessonSlug: 'seating-arrangements',
    subtopicSlug: 'linear-arrangement',
    difficulty: 'easy',
    topics: ['Seating Arrangement', 'Linear Arrangement'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Five friends — A, B, C, D, E — sit in a row facing north. A sits at the extreme left. C sits immediately to the right of A. B sits at the extreme right. D sits immediately to the left of B. Who sits in the middle?',
    solution: `### Step-by-Step Solution

**Step 1 — Draw the five seats:**

\`\`\`
seat 1    seat 2    seat 3    seat 4    seat 5
  ___      ___      ___      ___      ___
\`\`\`

**Step 2 — Place the definite clues:**

\`\`\`
A at extreme left → seat 1 = A
B at extreme right → seat 5 = B
\`\`\`

**Step 3 — Place the neighbour clues:**

\`\`\`
C immediately right of A → seat 2 = C
D immediately left of B → seat 4 = D
\`\`\`

**Step 4 — The leftover seat:**

\`\`\`
seat 3 = E

Final row:  A  C  E  D  B
\`\`\`

**Verify:** A at left ✓ · C right of A ✓ · B at right ✓ · D left of B ✓.

### Answer

| Question | Answer |
|---|---|
| Extreme left | A |
| Extreme right | B |
| Middle seat (seat 3) | **E** |

### Trap to Remember

Don't answer D — D is "immediately left of B", which places D at seat 4, not the middle. And don't guess from the leftover before placing the neighbour clues; the definite clues (A, B) always go in first, the neighbours (C, D) second, and the leftover (E) last.`,
    media: []
  },
  {
    title: 'Arrange People Around a Table',
    slug: 'arrange-people-around-a-table',
    lessonSlug: 'seating-arrangements',
    subtopicSlug: 'circular-arrangement',
    difficulty: 'easy',
    topics: ['Seating Arrangement', 'Circular Arrangement'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Six friends — A, B, C, D, E, F — sit around a circular table facing the centre. A sits opposite D. B sits to the immediate right of A. C sits to the immediate left of A. E sits opposite C. Who sits opposite F?',
    solution: `### Step-by-Step Solution

**Step 1 — Anchor with the opposite clue:**

\`\`\`
A at seat 1 (12) → D at seat 4 (6)
\`\`\`

**Step 2 — Attach the neighbours of A (facing the centre: left = clockwise, right = anticlockwise):**

\`\`\`
B immediate RIGHT of A → anticlockwise → seat 6 (10)
C immediate LEFT of A → clockwise → seat 2 (2)
\`\`\`

**Step 3 — Attach E to the next opposite clue:**

\`\`\`
E sits opposite C (seat 2) → E at seat 5 (8)
\`\`\`

**Step 4 — The leftover seat:**

\`\`\`
seat 3 (4) = F

Final circle (clockwise):  A(12)  C(2)  F(4)  D(6)  E(8)  B(10)
\`\`\`

**Verify:** A opposite D ✓ · B right of A ✓ · C left of A ✓ · E opposite C ✓.

### Answer

| Question | Answer |
|---|---|
| F sits at | seat 3 |
| Seat opposite seat 3 | seat 6 |
| Person opposite F | **B** |

### Trap to Remember

Swap "left = anticlockwise" and the whole circle mirrors — C and B trade seats and the answer breaks. Anchor A with the opposite clue first; the facing-centre rule (left is clockwise) decides every neighbour after that.`,
    media: []
  },
  {
    title: 'Identify the Valid Assumption',
    slug: 'identify-valid-assumption',
    lessonSlug: 'statement-conclusion-critical-reasoning',
    subtopicSlug: 'statement-assumption',
    difficulty: 'easy',
    topics: ['Statement & Assumption'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Statement: "The company has decided to reduce the price of its products during the festival season." Which of the following is the most valid assumption — (a) Sales increase during the festival season, (b) Reducing price always reduces profit, (c) The festival season ends soon, (d) The company\'s products are of poor quality?',
    solution: `### Step-by-Step Solution

**Step 1 — Run the Collapse Test on every option:**

\`\`\`
(a) Sales increase during festivals?
    Remove it: why would anyone cut prices for festivals?
    The statement collapses → IS an assumption ✓

(b) Reducing price always reduces profit?
    Remove it: the statement still makes sense → reject

(c) The festival season ends soon?
    Removing it changes nothing → reject

(d) Products are of poor quality?
    Not needed for the price-cut logic → reject
\`\`\`

**Step 2 — Check Gate 2 (The Written Test):**

None of the four options is written in the statement, so no option is disqualified as a stated fact.

### Answer

| Option | Verdict | Why |
|---|---|---|
| (a) Sales increase during festivals | **Assumption** | Statement collapses without it |
| (b) Reducing price reduces profit | Not an assumption | Statement works without it |
| (c) Festival season ends soon | Not an assumption | Irrelevant to the decision |
| (d) Products are poor quality | Not an assumption | Never needed |

### Trap to Remember

(b) sounds "business-smart" but the statement does not NEED it — the price cut is a festival decision, not a profit lecture. An assumption is only the belief whose removal collapses the statement.`,
    media: []
  },
  {
    title: 'Determine Which Conclusion Follows',
    slug: 'determine-which-conclusion-follows',
    lessonSlug: 'statement-conclusion-critical-reasoning',
    subtopicSlug: 'statement-conclusion',
    difficulty: 'easy',
    topics: ['Statement & Conclusion'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Statement: "All students who score above 90% receive a scholarship. Ravi scored 92%." Which of the following conclusions follows — (a) Ravi receives a scholarship, (b) All students receive scholarships, (c) Ravi is the class topper, (d) Ravi failed?',
    solution: `### Step-by-Step Solution

**Step 1 — Run the Three-Gate Test on every option:**

\`\`\`
Gate 1 — Statement-Only:
(a) Uses "Ravi scored 92%" + "90%+ gets a scholarship" → passes ✓
(b) "All students" — the rule covers only 90%+ scorers → fails
(c) "Topper" — no rank info in the statement → fails
(d) "Failed" — contradicts the stated 92% → fails

Gate 2 — Force:
(a) GUARANTEED: 92 > 90 → full force ✓

Gate 3 — Echo:
(a) re-says the rule applied to Ravi, adds nothing new ✓
\`\`\`

**Step 2 — Declare the conclusion:**

Only (a) survives all three gates.

### Answer

| Option | Verdict | Why |
|---|---|---|
| (a) Ravi receives a scholarship | **Follows** | Forced by the rule + Ravi's score |
| (b) All students receive scholarships | Does not follow | Rule covers only 90%+ scorers |
| (c) Ravi is the class topper | Does not follow | No rank information |
| (d) Ravi failed | Does not follow | Contradicts the statement |

### Trap to Remember

(c) might be true in reality — but the statement contains no rank data, and conclusions need the statement to FORCE them. And "MUST" conclusions demand full force: 92 > 90 is a guarantee, so (a) is certain, not merely possible.`,
    media: []
  },
  {
    title: 'Find the Angle Between Hands',
    slug: 'find-angle-between-hands',
    lessonSlug: 'clocks-calendars',
    subtopicSlug: 'clocks',
    difficulty: 'easy',
    topics: ['Clocks'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Find the angle between the hour hand and the minute hand of a clock at 3:30.',
    solution: `### Step-by-Step Solution

**Step 1 — Where is the hour hand?**

\`\`\`
3 hours × 30° = 90°
plus half an hour × 0.5° per minute = 15°
Hour hand at: 90 + 15 = 105°
\`\`\`

**Step 2 — Where is the minute hand?**

\`\`\`
30 minutes × 6° = 180°
\`\`\`

**Step 3 — The angle between them:**

\`\`\`
180 − 105 = 75°
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Hour hand position | 105° |
| Minute hand position | 180° |
| Angle at 3:30 | **75°** |

### Trap to Remember

Don't answer 90° — the hour hand is not parked on the 3 at 3:30, it has walked halfway to the 4 (15° extra). And don't report 285°: the hands make two angles, and the question wants the smaller one (75°).`,
    media: []
  },
  {
    title: 'Find the Day of the Week',
    slug: 'find-day-of-the-week',
    lessonSlug: 'clocks-calendars',
    subtopicSlug: 'calendars',
    difficulty: 'easy',
    topics: ['Calendars'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'What day of the week was 26 January 1950? (1 January 1900 was a Monday.)',
    solution: `### Step-by-Step Solution

**Step 1 — Count the years from 1900 to 1949:**

\`\`\`
Years from 1900 to 1949 = 50 years
Leap years among them (1904 to 1948) = 12
Odd days = 50 + 12 = 62 → 62 mod 7 = 6
\`\`\`

**Step 2 — Count the days of 1950 up to 26 January:**

\`\`\`
25 days after 1 January → 25 mod 7 = 4
\`\`\`

**Step 3 — Total shift:**

\`\`\`
6 + 4 = 10 → 10 mod 7 = 3
\`\`\`

**Step 4 — Name the weekday:**

\`\`\`
3 weekdays after Monday: Tuesday, Wednesday, THURSDAY
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Years 1900–1949 odd days | 62 → 6 |
| Days to 26 Jan | 25 → 4 |
| Total shift | 10 mod 7 = 3 |
| Day of the week | **Thursday** |

### Trap to Remember

1900 is NOT a leap year (century years leap only on divisibility by 400) — counting it as leap adds a phantom odd day. And only the remainder matters: 62 becomes 6, never 62 weekdays.`,
    media: []
  },
  {
    title: 'Trace Machine Input-Output Steps',
    slug: 'trace-machine-input-output-steps',
    lessonSlug: 'input-output-logical-sequences',
    subtopicSlug: 'input-output',
    difficulty: 'easy',
    topics: ['Input-Output', 'Logical Sequence'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Input: 42 17 85 23 56. A machine rearranges the numbers in ascending order, moving exactly one number per step. What is the input after Step 2?',
    solution: `### Step-by-Step Solution

**Step 1 — Identify the rule and the first move:**

The machine sorts ascending — the smallest number goes to the front first.

\`\`\`
Input :  42  17  85  23  56
Step 1 : 17  42  85  23  56      (17 locks at the front)
\`\`\`

**Step 2 — Trace Step 2:**

\`\`\`
Step 2 : 17  23  42  85  56      (23 locks in seat 2)
\`\`\`

**Step 3 — Verify the rule stays consistent:**

The remaining numbers (42, 85, 56) keep their relative order — only one element moved.

### Answer

| Question | Answer |
|---|---|
| Rule | Ascending, one number per step |
| After Step 1 | 17 42 85 23 56 |
| After Step 2 | **17 23 42 85 56** |

### Trap to Remember

Don't rewrite the whole input each step — 85 and 56 don't move until their turn. And don't move 23 and 17 together: one element per step, always.`,
    media: []
  },
  {
    title: 'Arrange Events in Logical Order',
    slug: 'arrange-events-in-logical-order',
    lessonSlug: 'input-output-logical-sequences',
    subtopicSlug: 'logical-sequence',
    difficulty: 'easy',
    topics: ['Logical Sequence', 'Ordering'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Arrange the following in a logical order: 1. Application  2. Offer letter  3. Interview  4. Joining  5. Shortlisting',
    solution: `### Step-by-Step Solution

**Step 1 — Find the FIRST event:**

\`\`\`
Nothing precedes Application → 1 first
\`\`\`

**Step 2 — Find the LAST event:**

\`\`\`
Nothing follows Joining → 4 last
\`\`\`

**Step 3 — Order the middle:**

\`\`\`
Shortlisting follows the application
Interview follows shortlisting
Offer letter follows the interview
\`\`\`

**Step 4 — The story test:**

\`\`\`
Application → Shortlisting → Interview → Offer letter → Joining
Order: 1, 5, 3, 2, 4
\`\`\`

### Answer

| Position | Event |
|---|---|
| 1st | Application |
| 2nd | Shortlisting |
| 3rd | Interview |
| 4th | Offer letter |
| 5th | Joining |
| **Correct order** | **1, 5, 3, 2, 4** |

### Trap to Remember

The offer letter is NOT the end of the process — joining is. And interview cannot come before shortlisting: the story test (read it aloud) catches every skipped chapter.`,
    media: []
  },
  {
    title: 'Identify the Part of Speech',
    slug: 'identify-the-part-of-speech',
    lessonSlug: 'verbal-ability-essentials',
    subtopicSlug: 'parts-of-speech',
    difficulty: 'easy',
    topics: ['Parts of Speech', 'Grammar Basics'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'In the sentence "The quick brown fox jumps over the lazy dog", what part of speech is the word "jumps"?',
    solution: `### Step-by-Step Solution

**Step 1 — Run the Job Test:**

What does "jumps" DO in this sentence? The fox JUMPS — it is the action.

**Step 2 — Match the job to the part of speech:**

\`\`\`
Action or state → VERB
\`\`\`

**Step 3 — Verify with the rest of the sentence:**

\`\`\`
The (article) quick (adjective) brown (adjective) fox (noun)
jumps (VERB) over (preposition) the (article) lazy (adjective) dog (noun)
\`\`\`

### Answer

| Question | Answer |
|---|---|
| The word "jumps" | A VERB |
| The action of the sentence | The fox jumps |

### Trap to Remember

Don't classify "jumps" by how it looks — the sentence decides the job. And "over" is not an adverb here: it links the verb to the dog, which makes it a preposition.`,
    media: []
  },
  {
    title: 'Identify the Grammar Rule Violation',
    slug: 'identify-grammar-rule-violation',
    lessonSlug: 'verbal-ability-essentials',
    subtopicSlug: 'common-grammar-rules',
    difficulty: 'easy',
    topics: ['Grammar Rules', 'Subject-Verb Agreement'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: '"Each of the students have submitted their assignments." Which grammar rule does this sentence violate?',
    solution: `### Step-by-Step Solution

**Step 1 — Find the true subject:**

\`\`\`
"Each of the students" → the subject is EACH, not students
The "of the students" phrase is a distraction
\`\`\`

**Step 2 — Apply the agreement rule:**

\`\`\`
Each → singular → needs the singular verb HAS
\`\`\`

**Step 3 — Name the violation:**

\`\`\`
"Each ... have" breaks SUBJECT-VERB AGREEMENT
Correct: "Each of the students HAS submitted their assignments"
\`\`\`

### Answer

| Question | Answer |
|---|---|
| True subject | Each (singular) |
| Wrong verb | have (plural) |
| Correct verb | has |
| Rule violated | **Subject-verb agreement** |

### Trap to Remember

"students have" sounds right because students is plural — but the subject is "each", and each, every, either, and neither are ALWAYS singular. Trust the subject, not the nearest noun.`,
    media: []
  },
  {
    title: 'Correct the Sentence',
    slug: 'correct-the-sentence',
    lessonSlug: 'sentence-correction-grammar',
    subtopicSlug: 'subject-verb-agreement',
    difficulty: 'easy',
    topics: ['Subject-Verb Agreement', 'Sentence Correction'],
    companies: ['TCS', 'Infosys'],
    problemStatement: '"A number of students is late to class today." Correct the sentence.',
    solution: `### Step-by-Step Solution

**Step 1 — Find the patient (the true subject):**

\`\`\`
"A number of students" → the patient is NUMBER
The "of students" phrase is the waiting room — ignore it
\`\`\`

**Step 2 — Check the pulse (is the patient singular or plural?):**

\`\`\`
"A number of" means MANY → the patient is PLURAL
\`\`\`

**Step 3 — Prescribe the cure:**

\`\`\`
Plural patient → plural verb → ARE
"A number of students ARE late to class today" ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| True subject | A number (means many → plural) |
| Wrong verb | is (singular) |
| Correct verb | **are** |
| Corrected sentence | "A number of students **are** late to class today" |

### Trap to Remember

This is the classic "a number of" ambush — if the sentence said "The number of students is rising", the answer would flip to "is". "A number of" = many (plural); "the number of" = the count (singular).`,
    media: []
  },
  {
    title: 'Choose the Correct Tense',
    slug: 'choose-the-correct-tense',
    lessonSlug: 'sentence-correction-grammar',
    subtopicSlug: 'tenses-articles',
    difficulty: 'easy',
    topics: ['Tenses', 'Articles'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Fill in the blank: "She ___ to the museum yesterday." (a) has visited  (b) visited  (c) visits  (d) is visiting',
    solution: `### Step-by-Step Solution

**Step 1 — Read the calendar (the signal word):**

\`\`\`
"yesterday" → PAST zone
\`\`\`

**Step 2 — Check each verb's clock:**

\`\`\`
(a) has visited → present perfect → needs since/for → REJECT
(b) visited    → simple past → matches "yesterday" ✓
(c) visits     → present → "every day" zone → REJECT
(d) is visiting → present continuous → "right now" zone → REJECT
\`\`\`

**Step 3 — Prescribe:**

\`\`\`
"She VISITED the museum yesterday" ✓
\`\`\`

### Answer

| Option | Zone | Verdict |
|---|---|---|
| (a) has visited | Present perfect | Wrong calendar |
| (b) **visited** | Simple past | **Matches "yesterday"** |
| (c) visits | Present | Wrong calendar |
| (d) is visiting | Present continuous | Wrong calendar |

### Trap to Remember

"has visited" is a tempting trap — it is a real verb form, but the present perfect only lives in the since/for zone. A closed time like "yesterday" always demands the plain past.`,
    media: []
  },
  {
    title: 'Choose the Correct Synonym',
    slug: 'choose-the-correct-synonym',
    lessonSlug: 'vocabulary',
    subtopicSlug: 'synonyms-antonyms',
    difficulty: 'easy',
    topics: ['Synonyms', 'Vocabulary'],
    companies: ['TCS', 'Infosys'],
    problemStatement: '"The manager was candid about the project delays." What is the best synonym for the word "candid"? (a) Secretive  (b) Frank  (c) Rude  (d) Vague',
    solution: `### Step-by-Step Solution

**Step 1 — Define "candid" in your own words (before reading the options):**

\`\`\`
candid = honest, straight-talking, no hiding
\`\`\`

**Step 2 — Run the Replacement Test — put each option in the sentence:**

\`\`\`
"The manager was SECRETIVE about the delays"  → opposite meaning ✗
"The manager was FRANK about the delays"      → same meaning ✓
"The manager was RUDE about the delays"       → different meaning ✗
"The manager was VAGUE about the delays"      → different meaning ✗
\`\`\`

**Step 3 — Lock the twin:**

FRANK survives the sentence — it is candid's synonym.

### Answer

| Option | Verdict | Why |
|---|---|---|
| (a) Secretive | ✗ | The opposite of candid |
| (b) **Frank** | **✓** | Same meaning: straight-talking |
| (c) Rude | ✗ | Feels blunt, but a different meaning |
| (d) Vague | ✗ | Opposite of clear, direct |

### Trap to Remember

"Rude" is the feels-related trap — candid and rude both sound blunt, but candid is about HONESTY, not manners. And never answer before defining the word in your own words; the options only whisper after that.`,
    media: []
  },
  {
    title: 'Identify the One-Word Substitute',
    slug: 'identify-one-word-substitute',
    lessonSlug: 'vocabulary',
    subtopicSlug: 'one-word-substitution-idioms',
    difficulty: 'easy',
    topics: ['One-Word Substitution', 'Vocabulary'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Identify the one-word substitute for: "a person who speaks many languages". (a) Polyglot  (b) Orator  (c) Scholar  (d) Linguist',
    solution: `### Step-by-Step Solution

**Step 1 — Say the phrase as one word in your head:**

\`\`\`
polyglot — poly = many, glot = tongue
\`\`\`

**Step 2 — Match to the options:**

\`\`\`
(a) Polyglot → person who speaks MANY languages ✓
(b) Orator   → person who speaks WELL (not many) ✗
(c) Scholar  → person who studies ✗
(d) Linguist → person who studies language ✗
\`\`\`

**Step 3 — Reverse-verify:**

\`\`\`
A polyglot = a person who speaks many languages ✓
\`\`\`

### Answer

| Option | Verdict | Why |
|---|---|---|
| (a) **Polyglot** | **✓** | Speaks many languages |
| (b) Orator | ✗ | Speaks well, not many |
| (c) Scholar | ✗ | Studies |
| (d) Linguist | ✗ | Studies language |

### Trap to Remember

"Orator" is the classic trap — it is also a language person, but the word is about speaking SKILL, not speaking MANY tongues. Reverse-verify every choice: expand the option back into the phrase and see if it reads naturally.`,
    media: []
  },
  {
    title: 'Answer Questions on a Short Passage',
    slug: 'answer-questions-on-passage',
    lessonSlug: 'reading-comprehension',
    subtopicSlug: 'passage-analysis',
    difficulty: 'easy',
    topics: ['Reading Comprehension', 'Passage Analysis'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Passage: "India\'s renewable energy capacity has grown rapidly over the past decade. Solar power leads the expansion, with capacity rising from under 3 GW in 2014 to over 60 GW by 2023. Wind energy grew more slowly, hampered by land acquisition delays. Experts argue that grid stability, not generation, is now the biggest challenge." Question: What is the main idea of the passage?',
    solution: `### Step-by-Step Solution

**Step 1 — Build the topic map (first sentence of each paragraph):**

\`\`\`
Para 1: renewable capacity has grown rapidly
Para 2: solar leads the expansion
Para 3: wind grew more slowly
Para 4: grid stability is the biggest challenge
\`\`\`

**Step 2 — Ask the main-idea question:**

The main idea = the WHOLE passage in one sentence — not any single detail.

**Step 3 — Compare the candidate answers:**

\`\`\`
"Solar grew from 3 GW to 60 GW" → a DETAIL, not the whole idea ✗
"India's renewable energy is growing fast but faces new
 challenges" → covers growth AND the grid-stability challenge ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| The passage is about | India's renewable energy |
| The two halves of the story | Growth (fast) + Challenge (grid stability) |
| Main idea | **India's renewable energy is growing fast but faces new challenges** |

### Trap to Remember

Main-idea questions punish detail-picking: solar's numbers are true but small — the main idea must fit the ENTIRE passage, growth and challenge together. The passage is the witness; a correct answer rephrases all of it.`,
    media: []
  },
  {
    title: 'Identify the Correct Inference',
    slug: 'identify-the-correct-inference',
    lessonSlug: 'reading-comprehension',
    subtopicSlug: 'inference-questions',
    difficulty: 'easy',
    topics: ['Reading Comprehension', 'Inference'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Passage: "Despite spending more hours studying than most students, Riya consistently scores lower than her classmates on exams. Her teachers have noted she rarely finishes the paper on time." What can be inferred about Riya?',
    solution: `### Step-by-Step Solution

**Step 1 — Run Gate 1 (Supported?):**

\`\`\`
Passage sentence: "she rarely finishes the paper on time"
Implies: her problem may be related to time management ✓
\`\`\`

**Step 2 — Run Gate 2 (Not-stated?):**

\`\`\`
The passage never says "time management" → not a stated fact ✓
\`\`\`

**Step 3 — Run Gate 3 (Not-contradicted?):**

\`\`\`
The passage agrees (slow finish → time pressure) ✓
\`\`\`

**Step 4 — Reject the impostors:**

\`\`\`
"Riya is lazy" → she studies the MOST hours (contradicted) ✗
"Riya doesn't study" → contradicted ✗
"Riya should study harder" → studying more hasn't worked ✗
\`\`\`

### Answer

| Gate | Verdict |
|---|---|
| Supported? | Yes — "rarely finishes the paper on time" |
| Not stated? | Yes — the passage never says it |
| Not contradicted? | Yes — the passage agrees |
| **Inference** | **Riya may struggle with time management** |

### Trap to Remember

"Riya is lazy" is the classic trap — it contradicts the passage's own words (she studies the most). Every inference needs a supporting sentence, must not be written outright, and must not be contradicted. A fact copied from the passage is not an inference either.`,
    media: []
  },
  {
    title: 'Rearrange Sentences into a Paragraph',
    slug: 'rearrange-sentences-into-paragraph',
    lessonSlug: 'para-jumbles-sentence-completion',
    subtopicSlug: 'para-jumbles',
    difficulty: 'easy',
    topics: ['Para Jumbles', 'Sentence Ordering'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Arrange into a logical paragraph: 1. "This has made communication faster than ever before."  2. "The internet began as a small research network in the 1960s."  3. "However, access is still unequal across the world."  4. "Today, billions of people use it daily."  5. "It connects computers across the globe."',
    solution: `### Step-by-Step Solution

**Step 1 — Find the anchor (the opening sentence):**

\`\`\`
1 starts with "This"   → points back → cannot open ✗
2 introduces the internet with a date → THE ANCHOR ✓
3 starts with "However" → contrast → cannot open ✗
4 has "it" → needs the noun first ✗
5 starts with "It" → needs the noun first ✗
\`\`\`

**Step 2 — Chain the rest (pronoun + connector clues):**

\`\`\`
2 "...the internet..."  → introduces the noun
5 "It connects computers" → the reply → follows 2 ✓
4 "Today, billions use it daily" → time jumps to today → follows 5 ✓
1 "This has made communication faster" → "This" = today's use → follows 4 ✓
3 "However, access is still unequal" → contrast → LAST ✓
\`\`\`

**Step 3 — Verify by reading the full chain aloud.**

### Answer

| Position | Sentence |
|---|---|
| 1st | 2 — The internet began as a research network in the 1960s |
| 2nd | 5 — It connects computers across the globe |
| 3rd | 4 — Today, billions of people use it daily |
| 4th | 1 — This has made communication faster |
| 5th | 3 — However, access is still unequal |
| **Correct order** | **2, 5, 4, 1, 3** |

### Trap to Remember

"However" is the loudest trap — it looks like a strong opening, but it is a contrast connector that must follow an opposite idea. And "It connects computers" cannot stand alone: the pronoun "It" needs the noun "internet" to arrive first.`,
    media: []
  },
  {
    title: 'Fill in the Blank Appropriately',
    slug: 'fill-in-the-blank',
    lessonSlug: 'para-jumbles-sentence-completion',
    subtopicSlug: 'sentence-completion',
    difficulty: 'easy',
    topics: ['Sentence Completion'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: '"The team was ___ after winning the championship, celebrating late into the night." (a) Elated  (b) Dejected  (c) Indifferent  (d) Confused',
    solution: `### Step-by-Step Solution

**Step 1 — Predict the meaning (before reading the options):**

\`\`\`
"after winning" + "celebrating" → the blank means HAPPY, excited
\`\`\`

**Step 2 — Check the grammar form:**

\`\`\`
"The team was ___" → an ADJECTIVE is needed
\`\`\`

**Step 3 — Match the options:**

\`\`\`
(a) elated     → happy ✓ meaning, ✓ adjective → SURVIVES
(b) dejected   → sad — opposite of celebrating ✗
(c) indifferent → uncaring — why celebrate? ✗
(d) confused   → no reason to celebrate ✗
\`\`\`

### Answer

| Option | Meaning check | Form check | Verdict |
|---|---|---|---|
| (a) **Elated** | Happy ✓ | Adjective ✓ | **Answer** |
| (b) Dejected | Sad — opposite ✗ | — | Reject |
| (c) Indifferent | Uncaring ✗ | — | Reject |
| (d) Confused | No cause ✗ | — | Reject |

### Trap to Remember

Read past the blank — the clue lives in the second half: "celebrating late into the night" forces a HAPPY word. And "The team was ___" needs an adjective, so a noun or adverb option dies on the grammar check even if it rhymes with the meaning.`,
    media: []
  },
  {
    title: 'Fill Multiple Blanks in a Passage',
    slug: 'fill-multiple-blanks-in-passage',
    lessonSlug: 'cloze-test',
    subtopicSlug: 'cloze-test-basics',
    difficulty: 'easy',
    topics: ['Cloze Test', 'Fill in the Blanks'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Passage: "Every year, thousands of students ___ (1) for competitive exams. Those who prepare ___ (2) are more likely to succeed. However, success depends not only on hard work ___ (3) on smart planning." Fill the three blanks.',
    solution: `### Step-by-Step Solution

**Step 1 — Hole 1 (Meaning checkpoint):**

\`\`\`
"students ___ for competitive exams"
Ripple: students + exams → they SIT/APPEAR for them
Pre-fill: appear ✓
\`\`\`

**Step 2 — Hole 2 (Grammar checkpoint):**

\`\`\`
"prepare ___ are more likely"
Pre-fill: regularly
"prepare" is a verb → verbs take ADVERBS
regularly (adverb) ✓
\`\`\`

**Step 3 — Hole 3 (Connection checkpoint):**

\`\`\`
"not only hard work ___ on smart planning"
Fixed phrase: "not only ... but also"
Pre-fill: but ✓
\`\`\`

### Answer

| Blank | Checkpoint | Answer |
|---|---|---|
| 1 — students ___ for exams | Meaning | **appear** |
| 2 — prepare ___ | Grammar (adverb) | **regularly** |
| 3 — not only ... ___ also | Connection (fixed phrase) | **but** |

### Trap to Remember

Each hole has ONE job — don't answer hole 3 with "and" (the fixed phrase "not only... but also" demands "but"), and don't patch hole 2 with "regular": "prepare" is a verb, and verbs take adverbs. Ripple-check every hole before patching.`,
    media: []
  },
  {
    title: 'Choose the Best Word for Context',
    slug: 'choose-best-word-for-context',
    lessonSlug: 'cloze-test',
    subtopicSlug: 'context-word-choice',
    difficulty: 'easy',
    topics: ['Cloze Test', 'Context Word Choice'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: '"The scientist was known for her ___ approach, testing every theory before accepting it." (a) Careless  (b) Meticulous  (c) Hasty  (d) Casual',
    solution: `### Step-by-Step Solution

**Step 1 — Find the scene (the strongest clue word):**

\`\`\`
"testing every theory before accepting it" → a CAREFUL, thorough habit
\`\`\`

**Step 2 — Name the feeling:**

\`\`\`
The blank must mean careful, thorough
\`\`\`

**Step 3 — Audition the options:**

\`\`\`
(a) Careless  → the opposite of the scene ✗
(b) Meticulous → careful, thorough ✓ → WINS THE PART
(c) Hasty     → rushed — the scene says the opposite ✗
(d) Casual    → relaxed — testing everything is not casual ✗
\`\`\`

**Step 4 — Run the form filter:**

\`\`\`
"___ approach" → "approach" is a noun → the blank is an ADJECTIVE
Meticulous (adjective) ✓
\`\`\`

### Answer

| Option | Meaning | Form | Verdict |
|---|---|---|---|
| (a) Careless | Opposite of scene | — | ✗ |
| (b) **Meticulous** | Careful, thorough ✓ | Adjective ✓ | **Answer** |
| (c) Hasty | Rushed — opposite | — | ✗ |
| (d) Casual | Relaxed — wrong shade | — | ✗ |

### Trap to Remember

Careless and hasty are the opposite-audition traps — the scene is careful, and the options hand you the exact negatives to tempt you. Name the feeling BEFORE reading the options, then let the form filter (noun "approach" → adjective) close the case.`,
    media: []
  },
  {
    title: 'Answer Questions from a Table',
    slug: 'answer-questions-from-table',
    lessonSlug: 'tables-bar-graphs',
    subtopicSlug: 'tabular-data-interpretation',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Tables'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Table: Quarterly Sales (in lakhs) — North: Q1 120, Q2 150, Q3 140; West: Q1 80, Q2 100, Q3 120; South: Q1 90, Q2 110, Q3 95. What were the TOTAL sales in Q1 across all regions?',
    solution: `### Step-by-Step Solution

**Step 1 — Identify the question type:**

\`\`\`
"Total sales in Q1" → SUM type — add the whole Q1 column
\`\`\`

**Step 2 — Read the Q1 column:**

\`\`\`
North: 120
West:   80
South:  90
\`\`\`

**Step 3 — Add:**

\`\`\`
120 + 80 + 90 = 290
\`\`\`

**Step 4 — Annex the unit:**

The table title says "in lakhs" → 290 lakhs.

### Answer

| Question | Answer |
|---|---|
| Q1 sales — North | 120 |
| Q1 sales — West | 80 |
| Q1 sales — South | 90 |
| Total Q1 | **290 lakhs** |

### Trap to Remember

"Total in Q1" means the Q1 COLUMN, not the North row — summing 120 + 150 + 140 (North's whole row) gives a wrong 410. And never drop the unit: the answer is 290 lakhs, not 290.`,
    media: []
  },
  {
    title: 'Compare Values from a Bar Graph',
    slug: 'compare-values-from-bar-graph',
    lessonSlug: 'tables-bar-graphs',
    subtopicSlug: 'bar-graph-interpretation',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Bar Graphs'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Bar Graph "Monthly Sales" (in thousands) shows: Jan = 50, Feb = 70, Mar = 90. What is the difference between the HIGHEST and LOWEST monthly sales?',
    solution: `### Step-by-Step Solution

**Step 1 — Read the axis and scale:**

\`\`\`
Horizontal = months, Vertical = sales (in thousands)
\`\`\`

**Step 2 — Identify the highest and lowest bars:**

\`\`\`
Highest = Mar (90)
Lowest  = Jan (50)
\`\`\`

**Step 3 — Subtract:**

\`\`\`
90 − 50 = 40 thousand
\`\`\`

**Step 4 — Annex the unit:**

The axis title says "thousands" → 40 thousand.

### Answer

| Question | Answer |
|---|---|
| Highest month | Mar (90) |
| Lowest month | Jan (50) |
| Difference | **40 thousand** |

### Trap to Remember

Eye-estimating "seems like 35" is the classic bar-graph mistake — the scale ticks (+10) give exact heights of 50 and 90, so the difference is exactly 40. When the question asks "difference", write the numbers down and subtract; never guess from the drawing.`,
    media: []
  },
  {
    title: 'Calculate Percentage from a Pie Chart',
    slug: 'calculate-percentage-from-a-pie-chart',
    lessonSlug: 'pie-charts-line-graphs',
    subtopicSlug: 'pie-chart-interpretation',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Pie Charts'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Pie Chart "Annual Company Expenses" (Total ₹5 crore): Salaries 40%, Rent 20%, Travel 10%, Marketing 30%. What is the AMOUNT spent on Salaries?',
    solution: `### Step-by-Step Solution

**Step 1 — Identify the question type:**

\`\`\`
"Amount spent on Salaries" → PAC 2 — COMPUTE a slice value
\`\`\`

**Step 2 — Read the slice percentage:**

\`\`\`
Salaries = 40% (read straight from the label)
\`\`\`

**Step 3 — Apply the 1% Key:**

\`\`\`
Slice value = slice % × total
            = 40% × ₹5 crore
            = 0.40 × ₹5 crore
            = ₹2 crore
\`\`\`

**Step 4 — Sanity-check the slice size:**

\`\`\`
40% is the biggest slice → its value (₹2 crore)
should be the biggest chunk of ₹5 crore ✓
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Salaries (label) | 40% |
| Total expenses | ₹5 crore |
| Amount on Salaries | **₹2 crore** |

### Trap to Remember

The percentage is never the answer to an "amount" question — "Salaries 0.4 crore" happens when 40% is used as if it were a value. Every amount must be % × total. And if the slice arrives as an angle (say 36° for Travel), convert it through the 1% key first: 36 ÷ 3.6 = 10%, then × total.`,
    media: []
  },
  {
    title: 'Find the Trend from a Line Graph',
    slug: 'find-trend-from-a-line-graph',
    lessonSlug: 'pie-charts-line-graphs',
    subtopicSlug: 'line-graph-interpretation',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Line Graphs'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Line Graph "Monthly Sales" (in thousands): Jan 40, Feb 60, Mar 50, Apr 80, May 70. Describe the TREND from February to March.',
    solution: `### Step-by-Step Solution

**Step 1 — Identify the question type:**

\`\`\`
"Describe the trend" → TREND question — watch the line's
direction, not the point values
\`\`\`

**Step 2 — Find the two points:**

\`\`\`
February → 60 thousand
March    → 50 thousand
\`\`\`

**Step 3 — Watch the direction between them:**

\`\`\`
60 → 50 is a FALL of 10 thousand
\`\`\`

**Step 4 — Name the trend with the Trend Language:**

\`\`\`
The line goes down between Feb and Mar → FALLING / sales fell
\`\`\`

### Answer

| Question | Answer |
|---|---|
| Sales in February | 60 thousand |
| Sales in March | 50 thousand |
| Direction | Fell (down by 10) |
| Trend | **Sales fell from Feb to Mar** |

### Trap to Remember

The whole five-month line fluctuates (up, down, up, down), but the question asks only about the Feb→Mar segment — describing the overall picture is the classic mistake. Name the trend BETWEEN the two points asked, nothing else.`,
    media: []
  },
  {
    title: 'Determine if Data is Sufficient',
    slug: 'determine-if-data-is-sufficient',
    lessonSlug: 'data-sufficiency',
    subtopicSlug: 'data-sufficiency-basics',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Data Sufficiency'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Question: How old is Rani? Statement I: Rani is twice as old as her son. Statement II: Her son is 10 years old. Determine which combination of data is needed — I alone, II alone, each alone, together, or never.',
    solution: `### Step-by-Step Solution

**Step 1 — Test Statement I alone:**

\`\`\`
"Twice as old as her son" → infinite son-ages fit:
   son 5 → Rani 10, son 8 → Rani 16, son 12 → Rani 24...
→ NOT sufficient alone
\`\`\`

**Step 2 — Test Statement II alone:**

\`\`\`
"The son is 10" talks only about the son.
Rani could be 30, 40, 50... → still NOT sufficient alone
\`\`\`

**Step 3 — Combine both statements:**

\`\`\`
Rani = 2 × son's age
Rani = 2 × 10 = 20

Exactly ONE age → UNIQUE ✓ COMPLETE ✓ CLEAN ✓
\`\`\`

**Step 4 — Name the Five-Code Grid answer:**

\`\`\`
Both together are needed → (D)
\`\`\`

### Answer

| Check | Result |
|---|---|
| Statement I alone | Not sufficient |
| Statement II alone | Not sufficient |
| Combined | **Sufficient — Rani is 20** |
| Code | **Both statements together** |

### Trap to Remember

Statement II ("the son is 10") *looks* powerful but is about the son, not Rani — Rani is still any age. Sufficiency answers the QUESTION's variable: only the combination pins Rani to exactly 20.`,
    media: []
  },
  {
    title: 'Evaluate Combined Statements',
    slug: 'evaluate-combined-statements',
    lessonSlug: 'data-sufficiency',
    subtopicSlug: 'two-statement-analysis',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Data Sufficiency'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Question: Find the two-digit number. Statement I: The sum of its digits is 9. Statement II: The number is divisible by 5. Evaluate whether BOTH statements together give a UNIQUE answer.',
    solution: `### Step-by-Step Solution

**Step 1 — Test Statement I alone:**

\`\`\`
Digits sum to 9 → 18, 27, 36, 45, 54, 63, 72, 81, 90
→ NINE candidates → NOT sufficient alone
\`\`\`

**Step 2 — Test Statement II alone:**

\`\`\`
Divisible by 5 → 10, 15, 20, ..., 95 → many candidates
→ NOT sufficient alone
\`\`\`

**Step 3 — Combine and list the survivors:**

\`\`\`
Divisible by 5 → unit digit is 0 or 5.
Digit sum = 9:
   unit 0 → tens 9 → the number 90
   unit 5 → tens 4 → the number 45
→ TWO candidates survive
\`\`\`

**Step 4 — Re-test uniqueness:**

\`\`\`
45 and 90 BOTH fit ✓ → the combined data is still ambiguous
→ even together, NOT sufficient → code (E)
\`\`\`

### Answer

| Check | Result |
|---|---|
| Statement I alone | 9 candidates — insufficient |
| Statement II alone | Many candidates — insufficient |
| Combined survivors | **45 and 90** |
| Unique answer? | **No — two numbers fit** |
| Code | **Even together, insufficient** |

### Trap to Remember

A combination is not automatically sufficient — the survivors were narrowed to two, not one. When a combo leaves 45 *and* 90, the answer is code (E): never confuse "almost enough" with "unique".`,
    media: []
  },
  {
    title: 'Solve a Caselet Data Set',
    slug: 'solve-a-caselet-data-set',
    lessonSlug: 'mixed-caselet-di',
    subtopicSlug: 'caselet-based-di',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Caselet'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Caselet: A school\'s monthly budget is ₹1,00,000. 40% goes to teachers\' salaries, ₹20,000 goes to books, and the rest goes to sports. Half of the sports money is spent on cricket equipment. How much is spent on cricket equipment?',
    solution: `### Step-by-Step Solution

**Step 1 — Extract the actors and numbers:**

\`\`\`
ACTORS: salaries, books, sports → cricket equipment
TOTAL: ₹1,00,000
NUMBERS: 40% → salaries; ₹20,000 → books;
         rest → sports; half of sports → cricket
\`\`\`

**Step 2 — Build the grid:**

\`\`\`
Salaries (40% of 1,00,000) = ₹40,000   ▓▓▓▓
Books                       = ₹20,000   ▓▓
Sports (the rest)           = ?
Cricket (half of sports)    = ?
TOTAL                       = ₹1,00,000
\`\`\`

**Step 3 — Fill the gaps (rest rule first):**

\`\`\`
Sports = total − all named parts
       = 1,00,000 − 40,000 − 20,000
       = ₹40,000
\`\`\`

**Step 4 — Answer the question (half-of-the-rest):**

\`\`\`
Cricket equipment = half of sports = 40,000 ÷ 2
                  = ₹20,000 ✓
\`\`\`

### Answer

| Item | Amount |
|---|---|
| Salaries (40%) | ₹40,000 |
| Books | ₹20,000 |
| Sports (the rest) | ₹40,000 |
| Cricket equipment | **₹20,000** |

### Trap to Remember

"Half of the sports money" halves the sports figure (₹40,000 → ₹20,000), NOT the total budget — halving ₹1,00,000 gives a wrong ₹50,000. Read which quantity every fraction attaches to: the sentence names its own base.`,
    media: []
  },
  {
    title: 'Answer Questions from Combined Graphs',
    slug: 'answer-questions-from-combined-graphs',
    lessonSlug: 'mixed-caselet-di',
    subtopicSlug: 'mixed-graph-di',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Mixed Graphs'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'Bar Graph: Company sales — 2021 = ₹500 crore, 2022 = ₹800 crore. Pie Chart (2022): Exports 25%, Domestic 75%. What was the EXPORT value in 2022?',
    solution: `### Step-by-Step Solution

**Step 1 — Read the scope of each chart:**

\`\`\`
Bar = TOTAL sales per year (crores)
Pie = % split of sales WITHIN one year (2022)
\`\`\`

**Step 2 — Find the bridge (link sentence):**

\`\`\`
Pie is labelled "2022" → its 100% IS the 2022 bar
(the shared quantity = the 2022 total of 800 crore)
\`\`\`

**Step 3 — Transfer across the bridge:**

\`\`\`
Exports 2022 = 25% × 800 crore = 0.25 × 800 = 200 crore
\`\`\`

**Step 4 — Sanity-check the unit:**

\`\`\`
The bar axis reads crores → answer is ₹200 crore, never 200
(no unit) and never 25% (the % is not the amount)
\`\`\`

### Answer

| Check | Result |
|---|---|
| 2022 total (bar) | ₹800 crore |
| Export share (pie) | 25% |
| Export value | **₹200 crore** |
| Domestic value | ₹600 crore |

### Trap to Remember

The pie belongs to 2022, so its percentage multiplies the 2022 bar — 25% × 800 = 200. Using 2021's 500 (25% × 500 = 125) is the cross-year fraction trap: each year's pie multiplies only its own bar.`,
    media: []
  }
];

/* ================================================================
 * Aptitude Quizzes — one quiz per problem.
 * problemSlug is converted to the problem's ObjectId + problemModel
 * by the runner. correctIndex is 0-based and NEVER sent to students.
 * ================================================================ */

const aptitudeQuizzes = [
  {
    problemSlug: 'sum-of-digits-divisible-by-3',
    questions: [
      {
        text: 'The sum of the digits of a number is 27. Which of the following is definitely true about the number?',
        options: [
          'It is divisible by 3 but not by 9',
          'It is divisible by both 3 and 9',
          'It is divisible by 9 but not by 3',
          'It is not divisible by either 3 or 9'
        ],
        correctIndex: 1
      },
      {
        text: 'Using the divisibility rule of 3, which of these numbers is NOT divisible by 3?',
        options: ['243', '12345', '1002', '7891'],
        correctIndex: 3
      },
      {
        text: 'The three-digit number 5A2 is divisible by 3. What is the SMALLEST possible value of the digit A?',
        options: ['1', '2', '3', '4'],
        correctIndex: 1
      },
      {
        text: 'A number is divisible by 9 exactly when —',
        options: [
          'its last digit is 0 or 5',
          'it is an even number',
          'the sum of its digits is a multiple of 9',
          'its last two digits form a multiple of 9'
        ],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'find-hcf-lcm-two-numbers',
    questions: [
      {
        text: 'The HCF of two numbers is 6 and their LCM is 72. If one of the numbers is 18, what is the other number?',
        options: ['12', '24', '36', '48'],
        correctIndex: 1
      },
      {
        text: 'Find the HCF of 42 and 56.',
        options: ['7', '14', '21', '28'],
        correctIndex: 1
      },
      {
        text: 'The HCF of two numbers is 12 and their product is 4320. What is their LCM?',
        options: ['120', '180', '360', '720'],
        correctIndex: 2
      },
      {
        text: 'Three bells ring at intervals of 4, 6 and 8 minutes. After how many minutes will they all ring together again?',
        options: ['12', '18', '24', '48'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'simplify-complex-expression',
    questions: [
      {
        text: 'What is the value of 6 + 4 × 5 − 2?',
        options: ['48', '24', '30', '40'],
        correctIndex: 1
      },
      {
        text: 'What is the value of 18 ÷ 3 × 2?',
        options: ['12', '3', '8', '27'],
        correctIndex: 0
      },
      {
        text: 'What is the value of 100 ÷ 4 × 5?',
        options: ['5', '80', '125', '500'],
        correctIndex: 2
      },
      {
        text: 'In the expression 25 − 6 × 3 + (8 − 5)², which operation is performed FIRST?',
        options: ['25 − 6', '6 × 3', '8 − 5', '3 + 8'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'approximate-expression-value',
    questions: [
      {
        text: 'What is 31% of 900?',
        options: ['270', '279', '290', '300'],
        correctIndex: 1
      },
      {
        text: 'Estimate 499 × 0.6 to the nearest ten.',
        options: ['280', '290', '300', '310'],
        correctIndex: 2
      },
      {
        text: 'Estimate 27.9 × 3.1.',
        options: ['75', '84', '90', '100'],
        correctIndex: 1
      },
      {
        text: 'When is rounding to convenient numbers SAFEST for an approximation?',
        options: [
          'When the answer options are far apart',
          'When the answer options are very close together',
          'When the numbers are already small',
          'Only when the expression has no percentages'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'calculate-percentage-change',
    questions: [
      {
        text: 'What is 37% of 50?',
        options: ['18.5', '185', '15.5', '3.7'],
        correctIndex: 0
      },
      {
        text: 'What is 25% of 720?',
        options: ['180', '90', '200', '360'],
        correctIndex: 0
      },
      {
        text: 'A number rises from 80 to 100. What is the percentage increase?',
        options: ['20%', '25%', '80%', '125%'],
        correctIndex: 1
      },
      {
        text: 'What is 1/8 expressed as a percentage?',
        options: ['12.5%', '8%', '80%', '0.8%'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-net-percentage-change',
    questions: [
      {
        text: 'A price rises 10% and then rises another 10%. The net increase is —',
        options: ['20%', '21%', '19%', '10%'],
        correctIndex: 1
      },
      {
        text: 'A value is increased by 10% and then decreased by 10%. The net effect is —',
        options: ['No change', '1% increase', '1% decrease', '10% decrease'],
        correctIndex: 2
      },
      {
        text: 'A price rises 20% and then falls 20%. Compared to the original, the final price is —',
        options: ['The same', '4% more', '4% less', '20% less'],
        correctIndex: 2
      },
      {
        text: 'A product increases by 25% and then decreases by 20%. The net effect is —',
        options: ['No change', '5% increase', '5% decrease', '25% decrease'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'calculate-profit-percentage',
    questions: [
      {
        text: 'An item is bought for ₹500 and sold for ₹600. The profit percentage is —',
        options: ['20%', '25%', '16.67%', '100%'],
        correctIndex: 0
      },
      {
        text: 'An item is sold at a 25% profit for ₹250. The cost price was —',
        options: ['₹200', '₹187.50', '₹225', '₹175'],
        correctIndex: 0
      },
      {
        text: 'An item is bought for ₹400 and sold for ₹350. The outcome is —',
        options: ['Profit of 12.5%', 'Loss of 12.5%', 'Loss of 50%', 'Profit of 50%'],
        correctIndex: 1
      },
      {
        text: 'Profit percentage is ALWAYS calculated on —',
        options: ['Selling price', 'Cost price', 'Marked price', 'Discount'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'find-selling-price-after-discount',
    questions: [
      {
        text: 'An item marked at ₹800 is sold at a 10% discount. The selling price is —',
        options: ['₹720', '₹800', '₹880', '₹80'],
        correctIndex: 0
      },
      {
        text: 'An item is sold for ₹400 after a 20% discount. Its marked price was —',
        options: ['₹480', '₹500', '₹520', '₹450'],
        correctIndex: 1
      },
      {
        text: 'Two successive discounts of 10% each are applied to an item marked ₹1,000. The final selling price is —',
        options: ['₹800', '₹810', '₹900', '₹790'],
        correctIndex: 1
      },
      {
        text: 'Discount is ALWAYS calculated on —',
        options: ['Cost price', 'Selling price', 'Marked price', 'Profit'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'divide-amount-in-given-ratio',
    questions: [
      {
        text: 'Simplify the ratio 12 : 18.',
        options: ['2 : 3', '3 : 2', '2 : 1', '3 : 1'],
        correctIndex: 0
      },
      {
        text: 'Express 500 g : 2 kg in its simplest form.',
        options: ['1 : 4', '500 : 2', '1 : 2', '2 : 1'],
        correctIndex: 0
      },
      {
        text: '₹400 is divided between two people in the ratio 3 : 5. The larger share is —',
        options: ['₹150', '₹250', '₹200', '₹300'],
        correctIndex: 1
      },
      {
        text: 'A ratio can only compare two quantities that are in the —',
        options: ['Same unit', 'Different units', 'Same currency', 'No specific unit'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-average-after-replacement',
    questions: [
      {
        text: 'The average of 4 numbers is 25. What is their total?',
        options: ['100', '25', '75', '125'],
        correctIndex: 0
      },
      {
        text: 'The average of 10 students\' marks is 80. One student scoring 70 leaves and a new student scoring 90 joins. The new average is —',
        options: ['81', '82', '80', '84'],
        correctIndex: 1
      },
      {
        text: 'The average weight of 5 students is 40 kg. A student leaves and the total weight falls by 10 kg. The new average is —',
        options: ['39', '38', '41', '40'],
        correctIndex: 1
      },
      {
        text: 'The average of the first five natural numbers (1, 2, 3, 4, 5) is —',
        options: ['3', '2.5', '3.5', '5'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-time-to-meet-opposite-directions',
    questions: [
      {
        text: 'A car travels 180 km in 3 hours. Its speed is —',
        options: ['60 km/h', '54 km/h', '90 km/h', '45 km/h'],
        correctIndex: 0
      },
      {
        text: 'Convert 36 km/h into m/s.',
        options: ['10 m/s', '12 m/s', '8 m/s', '15 m/s'],
        correctIndex: 0
      },
      {
        text: 'Two cyclists 120 km apart ride toward each other at 25 km/h and 35 km/h. When will they meet?',
        options: ['3 hours', '2 hours', '1.5 hours', '4 hours'],
        correctIndex: 1
      },
      {
        text: 'A car at 80 km/h chases another car at 60 km/h that is 40 km ahead. How long to catch up?',
        options: ['2 hours', '1 hour', '4 hours', '0.5 hours'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'train-crossing-a-platform',
    questions: [
      {
        text: 'A boat\'s still-water speed is 15 km/h and the stream flows at 5 km/h. Its downstream speed is —',
        options: ['20 km/h', '10 km/h', '15 km/h', '25 km/h'],
        correctIndex: 0
      },
      {
        text: 'The same boat\'s upstream speed is —',
        options: ['20 km/h', '10 km/h', '15 km/h', '5 km/h'],
        correctIndex: 1
      },
      {
        text: 'A 150 m train crosses a 150 m platform at 20 m/s. The time taken is —',
        options: ['15 seconds', '7.5 seconds', '10 seconds', '30 seconds'],
        correctIndex: 0
      },
      {
        text: 'The time for a train to cross a standing person depends on —',
        options: ['The train\'s length only', 'The platform\'s length only', 'The sum of both', 'The difference of both'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'days-complete-work-together',
    questions: [
      {
        text: 'A can do a job in 6 days and B in 8 days. Working together, how many days will they take?',
        options: ['14 days', '3 3/7 days', '7 days', '4 days'],
        correctIndex: 1
      },
      {
        text: 'A and B together finish a piece of work in 4 days. If A alone takes 12 days, how long does B alone take?',
        options: ['6 days', '8 days', '9 days', '16 days'],
        correctIndex: 0
      },
      {
        text: 'The efficiency ratio of A to B is 3 : 2. Working together they finish in 12 days. How many days would A alone take?',
        options: ['16 days', '20 days', '24 days', '30 days'],
        correctIndex: 1
      },
      {
        text: 'A, B and C take 6, 8 and 12 days respectively to finish a job alone. All three working together take —',
        options: ['2 2/3 days', '3 days', '4 days', '4 1/3 days'],
        correctIndex: 0
      },
      {
        text: 'A and B together finish a job in 12 days. If A alone takes 18 days, how long does B alone take?',
        options: ['24 days', '30 days', '36 days', '48 days'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'time-fill-tank-leak',
    questions: [
      {
        text: 'A pipe fills a tank in 6 hours and a leak empties it in 12 hours. With both open, how long does the tank take to fill?',
        options: ['4 hours', '6 hours', '12 hours', '18 hours'],
        correctIndex: 2
      },
      {
        text: 'Pipe A fills a tank in 4 hours and pipe B fills it in 6 hours. Both opened together, the tank fills in —',
        options: ['2.4 hours', '2.5 hours', '3 hours', '5 hours'],
        correctIndex: 0
      },
      {
        text: 'A pipe fills a tank in 10 hours while a leak empties the full tank in 15 hours. With both open, the fill time is —',
        options: ['15 hours', '20 hours', '30 hours', '25 hours'],
        correctIndex: 2
      },
      {
        text: 'A pipe fills a tank in 5 hours and an outlet pipe empties it in 10 hours. The tank starts empty and both are opened. What happens?',
        options: ['Fills in 5 hours', 'Fills in 10 hours', 'Fills in 15 hours', 'Never fills'],
        correctIndex: 1
      },
      {
        text: 'A tap fills a tank in 12 minutes and another tap empties it in 20 minutes. With both open, the tank fills in —',
        options: ['24 minutes', '30 minutes', '32 minutes', '40 minutes'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'calculate-si-for-given-principal',
    questions: [
      {
        text: 'The simple interest on ₹5,000 at 8% per annum for 3 years is —',
        options: ['₹1,200', '₹1,500', '₹1,000', '₹1,800'],
        correctIndex: 0
      },
      {
        text: 'The simple interest on ₹2,000 at 5% per annum for 2 years is —',
        options: ['₹100', '₹200', '₹300', '₹400'],
        correctIndex: 1
      },
      {
        text: 'A sum becomes ₹1,100 after 1 year at 10% simple interest. The principal was —',
        options: ['₹1,000', '₹990', '₹1,100', '₹900'],
        correctIndex: 0
      },
      {
        text: 'In simple interest, the interest earned each year is —',
        options: ['The same every year', 'Increasing every year', 'Decreasing every year', 'Zero after the first year'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'calculate-ci-si-difference',
    questions: [
      {
        text: 'The compound interest on ₹10,000 at 10% per annum for 2 years is —',
        options: ['₹2,100', '₹2,000', '₹1,210', '₹1,000'],
        correctIndex: 0
      },
      {
        text: 'The compound interest on ₹5,000 at 20% per annum for 2 years is —',
        options: ['₹2,400', '₹2,200', '₹2,000', '₹1,800'],
        correctIndex: 1
      },
      {
        text: 'The difference between CI and SI on ₹10,000 at 10% per annum for 2 years is —',
        options: ['₹200', '₹100', '₹1,000', '₹210'],
        correctIndex: 1
      },
      {
        text: 'For the same principal, rate and time (more than 1 year), compound interest is —',
        options: ['Always more than SI', 'Always less than SI', 'Equal to SI', 'Equal to half of SI'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'arrange-letters-of-a-word',
    questions: [
      {
        text: 'The value of 5! (5 factorial) is —',
        options: ['120', '60', '100', '24'],
        correctIndex: 0
      },
      {
        text: 'In how many ways can 3 different books be arranged on a shelf?',
        options: ['3', '6', '9', '12'],
        correctIndex: 1
      },
      {
        text: 'How many ways are there to choose 2 students from a group of 4?',
        options: ['12', '8', '6', '4'],
        correctIndex: 2
      },
      {
        text: 'The number of distinct arrangements of the letters of "BOOK" is —',
        options: ['12', '24', '8', '6'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'probability-of-drawing-a-card',
    questions: [
      {
        text: 'The probability of heads in a coin toss is —',
        options: ['1/2', '1', '1/4', '2/3'],
        correctIndex: 0
      },
      {
        text: 'A die is rolled. The probability of getting a 3 is —',
        options: ['1/6', '1/3', '1/2', '1/4'],
        correctIndex: 0
      },
      {
        text: 'A card is drawn from a deck of 52. The probability that it is a king is —',
        options: ['1/52', '1/13', '1/26', '1/4'],
        correctIndex: 1
      },
      {
        text: 'The probability of NOT getting heads in a coin toss is —',
        options: ['1/4', '1/2', '0', '2/3'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'solve-an-ages-problem',
    questions: [
      {
        text: 'Solve: 2x + 5 = 21. What is x?',
        options: ['8', '10', '13', '16'],
        correctIndex: 0
      },
      {
        text: 'Twice a number plus 3 equals 15. The number is —',
        options: ['12', '9', '6', '5'],
        correctIndex: 2
      },
      {
        text: 'A father is 3 times as old as his son. In 12 years he will be twice as old. The son is now —',
        options: ['15', '12', '9', '18'],
        correctIndex: 1
      },
      {
        text: 'If x² = 81, the positive value of x is —',
        options: ['9', '18', '81', '3'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-volume-of-a-cylinder',
    questions: [
      {
        text: 'The perimeter of a square with side 6 m is —',
        options: ['24 m', '36 m', '12 m', '48 m'],
        correctIndex: 0
      },
      {
        text: 'The area of a rectangle 5 m × 8 m is —',
        options: ['26 m²', '40 m²', '13 m²', '80 m²'],
        correctIndex: 1
      },
      {
        text: 'The volume of a cuboid 2 m × 3 m × 4 m is —',
        options: ['9 m³', '14 m³', '24 m³', '48 m³'],
        correctIndex: 2
      },
      {
        text: 'The volume of a cylinder with r = 7 cm, h = 10 cm (π = 22/7) is —',
        options: ['1,540 cm³', '220 cm³', '154 cm³', '1,540 cm²'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'solve-a-seating-puzzle',
    questions: [
      {
        text: 'In the row P, Q, R, S, T (R in the middle, T at the right end, P immediately left of Q), who sits at the left end?',
        options: ['P', 'Q', 'T', 'Cannot be determined'],
        correctIndex: 0
      },
      {
        text: 'C sits in the middle of 5 seats and D sits at the left end. Which seats are definitely occupied?',
        options: ['Seats 1 and 3', 'Seats 2 and 4', 'Seats 3 and 5', 'Seats 1 and 5'],
        correctIndex: 0
      },
      {
        text: 'In a row of 4 seats, A sits immediately to the left of B. How many positions can the pair (A, B) take?',
        options: ['4', '3', '2', '1'],
        correctIndex: 1
      },
      {
        text: 'The best first step in a seating puzzle is to —',
        options: ['Guess the arrangement', 'Start with the most definite clue', 'Only read the last clue', 'Ignore the middle seats'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'determine-valid-conclusion',
    questions: [
      {
        text: 'Given "All dogs are animals", which conclusion follows?',
        options: ['All animals are dogs', 'Some animals are dogs', 'No dogs are animals', 'Dogs are not animals'],
        correctIndex: 1
      },
      {
        text: 'All cats are mammals and all mammals are animals. Does "all cats are animals" follow?',
        options: ['Yes, it follows', 'No, it does not follow', 'Only some cats are animals', 'Cannot say'],
        correctIndex: 0
      },
      {
        text: 'Which is a valid flip of "All A are B"?',
        options: ['Some B are A', 'All B are A', 'No B are A', 'Some A are not B'],
        correctIndex: 0
      },
      {
        text: 'From "Some A are B", which statement definitely follows?',
        options: ['All A are B', 'No B are A', 'Some B are A', 'Some B are not A'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'identify-family-relation',
    questions: [
      {
        text: 'Your father\'s brother is your —',
        options: ['Uncle', 'Grandfather', 'Brother', 'Cousin'],
        correctIndex: 0
      },
      {
        text: 'Your mother\'s mother is your —',
        options: ['Aunt', 'Grandmother', 'Sister', 'Mother'],
        correctIndex: 1
      },
      {
        text: 'Your brother\'s son is your —',
        options: ['Nephew', 'Niece', 'Son', 'Cousin'],
        correctIndex: 0
      },
      {
        text: 'A girl says "He is my father\'s only son." The person is her —',
        options: ['Brother', 'Uncle', 'Father', 'Cousin'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-final-direction-distance',
    questions: [
      {
        text: 'Facing north, your right hand points to —',
        options: ['East', 'West', 'North', 'South'],
        correctIndex: 0
      },
      {
        text: 'Facing south, a left turn makes you face —',
        options: ['West', 'East', 'North', 'South'],
        correctIndex: 1
      },
      {
        text: 'Walking 3 km north then 4 km east, the straight-line distance from the start is —',
        options: ['7 km', '5 km', '1 km', '12 km'],
        correctIndex: 1
      },
      {
        text: 'After walking 3 km north then 4 km east, the direction from the start is —',
        options: ['North-East', 'South-West', 'North-West', 'South-East'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'decode-given-pattern',
    questions: [
      {
        text: 'If CAT is coded as DBU, how is RAT coded?',
        options: ['SBU', 'QZS', 'SAU', 'RBT'],
        correctIndex: 0
      },
      {
        text: 'A letter and its reverse alphabet partner always sum to —',
        options: ['25', '26', '27', '13'],
        correctIndex: 2
      },
      {
        text: 'The letter position of M is —',
        options: ['12', '13', '14', '11'],
        correctIndex: 1
      },
      {
        text: 'If AB = 1 + 2 = 3 (sum of positions), then CD = —',
        options: ['7', '8', '9', '10'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-missing-term',
    questions: [
      {
        text: 'Next term: 3, 6, 12, 24 —',
        options: ['36', '48', '40', '30'],
        correctIndex: 1
      },
      {
        text: 'Next term: 1, 4, 9, 16 —',
        options: ['20', '24', '25', '23'],
        correctIndex: 2
      },
      {
        text: 'Missing term: 2, 5, 10, 17, ?, 37 —',
        options: ['24', '25', '26', '28'],
        correctIndex: 2
      },
      {
        text: 'Next term: 100, 90, 81, 73 —',
        options: ['65', '66', '67', '64'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'complete-the-analogy',
    questions: [
      {
        text: 'Pen : Write :: Knife : ?',
        options: ['Cut', 'Cook', 'Eat', 'Sharp'],
        correctIndex: 0
      },
      {
        text: 'Bird : Sky :: Fish : ?',
        options: ['Water', 'Land', 'Tree', 'Nest'],
        correctIndex: 0
      },
      {
        text: '2 : 6 :: 5 : ?',
        options: ['10', '15', '25', '30'],
        correctIndex: 1
      },
      {
        text: 'Hospital : Doctor :: School : ?',
        options: ['Student', 'Teacher', 'Book', 'Class'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'find-the-odd-one-out',
    questions: [
      {
        text: 'Odd one out: Apple, Mango, Banana, Carrot',
        options: ['Apple', 'Mango', 'Banana', 'Carrot'],
        correctIndex: 3
      },
      {
        text: 'Odd one out: 4, 9, 16, 25, 31',
        options: ['4', '9', '25', '31'],
        correctIndex: 3
      },
      {
        text: 'Odd one out: 2, 3, 5, 7, 9',
        options: ['2', '3', '5', '9'],
        correctIndex: 3
      },
      {
        text: 'Odd one out: Delhi, Mumbai, India, Chennai',
        options: ['Delhi', 'Mumbai', 'India', 'Chennai'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'arrange-people-in-a-row',
    questions: [
      {
        text: 'In a row of 5, X sits 3rd from the left. Position from the right is —',
        options: ['2nd', '3rd', '4th', '1st'],
        correctIndex: 1
      },
      {
        text: 'Five friends sit in a row: A extreme left, C immediately right of A, B extreme right, D immediately left of B. The middle seat belongs to —',
        options: ['A', 'C', 'E', 'D'],
        correctIndex: 2
      },
      {
        text: 'In a row of 7, X sits 4th from the left. How many people sit to X\'s right?',
        options: ['2', '3', '4', '5'],
        correctIndex: 1
      },
      {
        text: '"A sits between B and C" — a possible left-to-right order is —',
        options: ['B A C', 'A B C', 'C B A', 'B C A'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'arrange-people-around-a-table',
    questions: [
      {
        text: 'Six friends around a table facing the centre: A opposite D, B right of A, C left of A, E opposite C. Who sits opposite F?',
        options: ['A', 'B', 'C', 'E'],
        correctIndex: 1
      },
      {
        text: 'Facing the centre of a circular table, a person\'s LEFT is —',
        options: ['clockwise', 'anticlockwise', 'opposite', 'depends on the seat'],
        correctIndex: 0
      },
      {
        text: 'In a circular arrangement of 6 facing the centre, how many people sit between X and the person opposite X?',
        options: ['1', '2', '3', '4'],
        correctIndex: 1
      },
      {
        text: 'In a 5-person circle, if X is second to the left of Y, how many people sit between them on the short side?',
        options: ['0', '1', '2', '3'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'identify-valid-assumption',
    questions: [
      {
        text: 'Statement: "The college will provide free Wi-Fi to all hostel students." Valid assumption —',
        options: [
          'Hostel students own cars',
          'Hostel students need internet',
          'The college already provided free Wi-Fi',
          'Wi-Fi is banned in hostels'
        ],
        correctIndex: 1
      },
      {
        text: 'Statement: "The government has announced free bus travel for senior citizens." Valid assumption —',
        options: [
          'Buses run only at night',
          'Other passengers will object',
          'Senior citizens will use public buses',
          'Senior citizens own cars'
        ],
        correctIndex: 2
      },
      {
        text: 'Statement: "Please deposit the fee by the 10th of this month." Valid assumption —',
        options: ['Fees are refundable', 'The 10th is a holiday', 'Only online payment is accepted', 'Students have fee dues to pay'],
        correctIndex: 3
      },
      {
        text: 'Statement: "The principal has announced that students must submit their projects by Friday." Valid assumption —',
        options: ['Students were assigned projects', 'Friday is a holiday', 'Projects are graded', 'The school will close'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'determine-which-conclusion-follows',
    questions: [
      {
        text: 'Statement: "All students who score above 90% receive a scholarship. Ravi scored 92%." Which conclusion follows?',
        options: ['All students receive scholarships', 'Ravi is the class topper', 'Ravi receives a scholarship', 'Ravi failed'],
        correctIndex: 2
      },
      {
        text: 'Statement: "Only students with at least 75% attendance can sit for the exam." Conclusions: (1) Students below 75% attendance cannot sit for the exam (2) All students have 75% attendance.',
        options: ['Only 1 follows', 'Only 2 follows', 'Both follow', 'Neither follows'],
        correctIndex: 0
      },
      {
        text: 'Statement: "Delhi has more traffic jams than Mumbai." Which conclusion follows?',
        options: [
          'Mumbai has no traffic jams',
          'Mumbai has fewer traffic jams than Delhi',
          'Delhi is bigger than Mumbai',
          'Flyovers solve traffic jams'
        ],
        correctIndex: 1
      },
      {
        text: 'Statement: "The cricket match will start at 4 PM." Conclusions: (1) The match was scheduled for 4 PM (2) The match will end by 8 PM.',
        options: ['Only 1 follows', 'Only 2 follows', 'Both follow', 'Neither follows'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-angle-between-hands',
    questions: [
      {
        text: 'Angle between the hour and minute hands at 3:30 —',
        options: ['90°', '75°', '105°', '60°'],
        correctIndex: 1
      },
      {
        text: 'Angle between the hour and minute hands at 6:00 —',
        options: ['0°', '90°', '45°', '180°'],
        correctIndex: 3
      },
      {
        text: 'Angle between the hour and minute hands at 9:00 —',
        options: ['90°', '60°', '30°', '270°'],
        correctIndex: 0
      },
      {
        text: 'The minute hand moves how many degrees in 1 minute?',
        options: ['30°', '0.5°', '6°', '60°'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'find-day-of-the-week',
    questions: [
      {
        text: 'Day of the week on 26 January 1950 (1 January 1900 was a Monday) —',
        options: ['Wednesday', 'Friday', 'Thursday', 'Saturday'],
        correctIndex: 2
      },
      {
        text: 'Odd days in a leap year —',
        options: ['1', '2', '0', '3'],
        correctIndex: 1
      },
      {
        text: 'Day of the week on 15 August 1947 (1 January 1900 was a Monday) —',
        options: ['Saturday', 'Friday', 'Thursday', 'Monday'],
        correctIndex: 1
      },
      {
        text: 'Which of these is a leap year?',
        options: ['1900', '1800', '2100', '2000'],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'trace-machine-input-output-steps',
    questions: [
      {
        text: 'Input: 42 17 85 23 56, ascending one number per step. The input after Step 2 is —',
        options: ['17 42 85 23 56', '17 23 42 85 56', '17 23 85 42 56', '23 17 42 85 56'],
        correctIndex: 1
      },
      {
        text: 'Input: 15 08 23 09 45, descending one number per step. The input after Step 1 is —',
        options: ['45 15 08 23 09', '08 15 23 09 45', '15 08 23 09 45', '45 08 23 09 15'],
        correctIndex: 0
      },
      {
        text: 'How many working steps does it take to fully sort 42 17 85 23 56 in ascending order?',
        options: ['2', '3', '4', '5'],
        correctIndex: 1
      },
      {
        text: 'How many elements does an input-output machine move per step?',
        options: ['1', '2', '3', 'All of them'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'arrange-events-in-logical-order',
    questions: [
      {
        text: 'Logical order of: 1. Application  2. Offer  3. Interview  4. Joining  5. Shortlisting —',
        options: ['1, 5, 3, 2, 4', '1, 3, 5, 2, 4', '5, 1, 3, 2, 4', '1, 5, 2, 3, 4'],
        correctIndex: 0
      },
      {
        text: 'Logical order of: 1. Bake  2. Buy flour  3. Eat  4. Mix  5. Serve —',
        options: ['2, 4, 1, 5, 3', '4, 2, 1, 5, 3', '2, 1, 4, 5, 3', '2, 4, 5, 1, 3'],
        correctIndex: 0
      },
      {
        text: 'In a job process, the FIRST event is —',
        options: ['Interview', 'Application', 'Offer', 'Joining'],
        correctIndex: 1
      },
      {
        text: 'In a job process, the LAST event is —',
        options: ['Application', 'Shortlisting', 'Offer', 'Joining'],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'identify-the-part-of-speech',
    questions: [
      {
        text: 'In "The quick brown fox jumps over the lazy dog", "jumps" is —',
        options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
        correctIndex: 1
      },
      {
        text: 'In the same sentence, "lazy" is —',
        options: ['Adjective', 'Adverb', 'Verb', 'Preposition'],
        correctIndex: 0
      },
      {
        text: 'In the same sentence, "over" is —',
        options: ['Conjunction', 'Adverb', 'Preposition', 'Article'],
        correctIndex: 2
      },
      {
        text: 'How many parts of speech are there in English?',
        options: ['5', '6', '7', '8'],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'identify-grammar-rule-violation',
    questions: [
      {
        text: '"Each of the students have submitted their assignments" violates —',
        options: [
          'Subject-verb agreement',
          'Tense consistency',
          'Preposition rule',
          'Nothing — the sentence is correct'
        ],
        correctIndex: 0
      },
      {
        text: 'Which is the correct version of: "Neither of the answers are correct"?',
        options: [
          'Neither of the answers is correct',
          'Neither of the answer is correct',
          'No error',
          'Neither of the answers were correct'
        ],
        correctIndex: 0
      },
      {
        text: 'Which is the correct version of: "There is many books on the table"?',
        options: [
          'There are many books on the table',
          'There is many book on the table',
          'No error',
          'There were many book on the table'
        ],
        correctIndex: 0
      },
      {
        text: 'Which sentence is correct?',
        options: ["He don't like coffee", "He doesn't likes coffee", "He doesn't like coffee", 'He not like coffee'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'correct-the-sentence',
    questions: [
      {
        text: '"A number of students ___ late to class today" —',
        options: ['is', 'are', 'was', 'be'],
        correctIndex: 1
      },
      {
        text: '"The number of students ___ rising" —',
        options: ['are', 'were', 'is', 'have been'],
        correctIndex: 2
      },
      {
        text: '"Each of the boys ___ a book" —',
        options: ['have', 'had', 'has', 'are having'],
        correctIndex: 2
      },
      {
        text: '"Five kilometers ___ a long walk" —',
        options: ['are', 'is', 'were', 'have'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'choose-the-correct-tense',
    questions: [
      {
        text: '"She ___ to the museum yesterday" —',
        options: ['has visited', 'visited', 'visits', 'is visiting'],
        correctIndex: 1
      },
      {
        text: '"They ___ here since 2019" —',
        options: ['lived', 'have lived', 'live', 'are living'],
        correctIndex: 1
      },
      {
        text: '"I saw ___ elephant at the zoo" —',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 1
      },
      {
        text: '"We ___ to Jaipur next week" —',
        options: ['went', 'go', 'will go', 'have gone'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'choose-the-correct-synonym',
    questions: [
      {
        text: 'Best synonym of "candid" —',
        options: ['Secretive', 'Frank', 'Rude', 'Vague'],
        correctIndex: 1
      },
      {
        text: 'Best antonym of "abundant" —',
        options: ['Plentiful', 'Enough', 'Meager', 'Lively'],
        correctIndex: 2
      },
      {
        text: 'Best synonym of "diligent" —',
        options: ['Lazy', 'Careless', 'Slow', 'Hardworking'],
        correctIndex: 3
      },
      {
        text: 'Best antonym of "genuine" —',
        options: ['Fake', 'Real', 'Honest', 'True'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'identify-one-word-substitute',
    questions: [
      {
        text: 'One word for "a person who speaks many languages" —',
        options: ['Polyglot', 'Orator', 'Scholar', 'Linguist'],
        correctIndex: 0
      },
      {
        text: '"My cousin visits us once in a blue moon" — the idiom means —',
        options: ['Every day', 'Very rarely', 'At night', 'In winter'],
        correctIndex: 1
      },
      {
        text: '"The new phone cost an arm and a leg" — the phone was —',
        options: ['Cheap', 'Free', 'Very expensive', 'Medium priced'],
        correctIndex: 2
      },
      {
        text: 'One word for "a place where weapons are kept" —',
        options: ['Canteen', 'Arsenal', 'Auditorium', 'Library'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'answer-questions-on-passage',
    questions: [
      {
        text: 'Passage: "Solar power leads the expansion, with capacity rising from under 3 GW in 2014 to over 60 GW by 2023." Which energy source grew the fastest?',
        options: ['Solar', 'Wind', 'Hydro', 'Nuclear'],
        correctIndex: 0
      },
      {
        text: 'Passage: "Experts argue that grid stability, not generation, is now the biggest challenge." What is the biggest challenge now?',
        options: ['Generation', 'Grid stability', 'Land acquisition', 'Funding'],
        correctIndex: 1
      },
      {
        text: 'Passage: "Wind energy grew more slowly, hampered by land acquisition delays." Why did wind grow slowly?',
        options: ['Funding problems', 'Land acquisition delays', 'Low demand', 'Poor technology'],
        correctIndex: 1
      },
      {
        text: 'Passage: "India\'s renewable energy capacity has grown rapidly... Experts argue that grid stability, not generation, is now the biggest challenge." The main idea of the passage is —',
        options: [
          'Solar grew from 3 GW to 60 GW',
          'India\'s renewable energy is growing fast but faces new challenges',
          'Wind energy is better than solar',
          'India has no renewable energy'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'identify-the-correct-inference',
    questions: [
      {
        text: 'Passage: "Despite spending more hours studying than most students, Riya consistently scores lower than her classmates on exams. Her teachers have noted she rarely finishes the paper on time." What can be inferred about Riya?',
        options: [
          'She is lazy',
          'She may struggle with time management',
          'She does not study',
          'Her teachers are unfair'
        ],
        correctIndex: 1
      },
      {
        text: 'Passage: "The shop owner lowered prices, yet sales fell." What can be inferred?',
        options: [
          'The shop owner raised prices',
          'The lower price did not attract new buyers',
          'Sales always rise when prices fall',
          'The shop is closed'
        ],
        correctIndex: 1
      },
      {
        text: 'Passage: "Despite heavy rain, the match started on time." What can be inferred?',
        options: [
          'It never rained',
          'Matches always start on time',
          'The organisers had prepared for rain',
          'Rain delays matches'
        ],
        correctIndex: 2
      },
      {
        text: 'Passage: "Rohan wakes at 5 AM daily and studies before sunrise." What can be inferred?',
        options: [
          'Rohan sleeps at noon',
          'Rohan studies at night',
          'Rohan never studies',
          'Rohan is a morning person'
        ],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'rearrange-sentences-into-paragraph',
    questions: [
      {
        text: 'Arrange: 1. "This has made communication faster."  2. "The internet began as a research network in the 1960s."  3. "However, access is still unequal."  4. "Today, billions use it daily."  5. "It connects computers across the globe."',
        options: ['2, 5, 4, 1, 3', '2, 4, 5, 1, 3', '3, 2, 5, 4, 1', '1, 2, 5, 4, 3'],
        correctIndex: 0
      },
      {
        text: 'Which sentence can NEVER open a paragraph?',
        options: ['One starting with "It"', 'One with a proper noun', 'A short sentence', 'One with a date'],
        correctIndex: 0
      },
      {
        text: 'A sentence starting with "However" —',
        options: [
          'Continues the same idea',
          'Contrasts with the previous sentence',
          'Introduces the topic',
          'Is always the first sentence'
        ],
        correctIndex: 1
      },
      {
        text: 'The best opening sentence among these is —',
        options: [
          '"This has changed everything."',
          '"The internet began as a small research network in the 1960s."',
          '"However, access is unequal."',
          '"It connects computers."'
        ],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'fill-in-the-blank',
    questions: [
      {
        text: '"The team was ___ after winning the championship, celebrating late into the night."',
        options: ['Dejected', 'Indifferent', 'Elated', 'Confused'],
        correctIndex: 2
      },
      {
        text: '"Despite the heavy rain, the match continued ___."',
        options: ['Interrupted', 'Uninterrupted', 'Cancelled', 'Postponed'],
        correctIndex: 1
      },
      {
        text: '"She spoke ___ so that everyone could hear her."',
        options: ['loud', 'loudly', 'louder', 'loudness'],
        correctIndex: 1
      },
      {
        text: '"___ the traffic, we reached the airport on time."',
        options: ['Because', 'Despite', 'Although', 'Since'],
        correctIndex: 1
      }
    ]
  },
  {
    problemSlug: 'fill-multiple-blanks-in-passage',
    questions: [
      {
        text: 'Passage: "Those who prepare ___ are more likely to succeed."',
        options: ['regular', 'regularity', 'regularly', 'more regular'],
        correctIndex: 2
      },
      {
        text: 'Passage: "Success depends not only on hard work ___ on smart planning."',
        options: ['and', 'or', 'so', 'but'],
        correctIndex: 3
      },
      {
        text: 'Passage: "Every year, thousands of students ___ for competitive exams."',
        options: ['look', 'appear', 'wait', 'listen'],
        correctIndex: 1
      },
      {
        text: 'The Ripple Check says —',
        options: [
          'Read the sentences before and after the hole',
          'Read only the hole',
          'Skip the passage',
          'Read the options first'
        ],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'choose-best-word-for-context',
    questions: [
      {
        text: '"The scientist was known for her ___ approach, testing every theory before accepting it."',
        options: ['Careless', 'Hasty', 'Meticulous', 'Casual'],
        correctIndex: 2
      },
      {
        text: '"The coach was ___ with the team\'s performance, demanding more practice."',
        options: ['Satisfied', 'Proud', 'Dissatisfied', 'Relaxed'],
        correctIndex: 2
      },
      {
        text: '"The river flowed ___ through the valley."',
        options: ['gently', 'gentle', 'gentler', 'gentleness'],
        correctIndex: 0
      },
      {
        text: '"She was ___ after the long journey, so she slept immediately."',
        options: ['Energetic', 'Fresh', 'Exhausted', 'Restless'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'answer-questions-from-table',
    questions: [
      {
        text: 'Table (lakhs) — North: Q1 120, Q2 150, Q3 140; West: Q1 80, Q2 100, Q3 120; South: Q1 90, Q2 110, Q3 95. Which region had the HIGHEST sales in Q2?',
        options: ['West', 'North', 'South', 'All equal'],
        correctIndex: 1
      },
      {
        text: 'Using the same table, the TOTAL sales in Q1 across all regions are —',
        options: ['220', '290', '300', '310'],
        correctIndex: 1
      },
      {
        text: 'Using the same table, North\'s percentage increase from Q1 to Q2 is —',
        options: ['20%', '15%', '30%', '25%'],
        correctIndex: 3
      },
      {
        text: 'Using the same table, the TOTAL sales in Q3 across all regions are —',
        options: ['345', '350', '355', '360'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'compare-values-from-bar-graph',
    questions: [
      {
        text: 'Bar Graph: Jan 50, Feb 70, Mar 90 (thousands). Which month had the highest sales?',
        options: ['Jan', 'All equal', 'Mar', 'Feb'],
        correctIndex: 2
      },
      {
        text: 'Using the same graph, the difference between the highest and lowest months is —',
        options: ['20', '30', '40', '50'],
        correctIndex: 2
      },
      {
        text: 'Using the same graph, Jan and Mar combined come to —',
        options: ['120', '130', '150', '140'],
        correctIndex: 3
      },
      {
        text: 'Using the same graph, the difference between Feb and Jan is —',
        options: ['20', '10', '30', '40'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'calculate-percentage-from-a-pie-chart',
    questions: [
      {
        text: 'Pie Chart "Annual Company Expenses" (Total ₹5 crore): Salaries 40%, Rent 20%, Travel 10%, Marketing 30%. What percentage went to Salaries?',
        options: ['30%', '40%', '20%', '50%'],
        correctIndex: 1
      },
      {
        text: 'Using the same pie, the AMOUNT spent on Salaries is —',
        options: ['₹1 crore', '₹2 crore', '₹3 crore', '₹4 crore'],
        correctIndex: 1
      },
      {
        text: 'Using the same pie, Rent and Marketing COMBINED come to —',
        options: ['₹2 crore', '₹1.5 crore', '₹2.5 crore', '₹3 crore'],
        correctIndex: 2
      },
      {
        text: 'Using the same pie, the ANGLE of the Travel slice (10%) is —',
        options: ['36°', '90°', '18°', '72°'],
        correctIndex: 0
      }
    ]
  },
  {
    problemSlug: 'find-trend-from-a-line-graph',
    questions: [
      {
        text: 'Line Graph "Monthly Sales" (thousands): Jan 40, Feb 60, Mar 50, Apr 80, May 70. Which month had the HIGHEST sales?',
        options: ['Jan', 'Feb', 'Apr', 'May'],
        correctIndex: 2
      },
      {
        text: 'Using the same graph, the TREND from February to March was —',
        options: ['Rising', 'Falling', 'Flat', 'Fluctuating'],
        correctIndex: 1
      },
      {
        text: 'Using the same graph, the percentage increase in sales from Jan to Feb is —',
        options: ['40%', '50%', '20%', '33%'],
        correctIndex: 1
      },
      {
        text: 'Using the same graph, the TOTAL sales across the five months are —',
        options: ['280', '290', '300', '310'],
        correctIndex: 2
      }
    ]
  },
  {
    problemSlug: 'determine-if-data-is-sufficient',
    questions: [
      {
        text: 'How old is Rani? I. Rani is twice as old as her son. II. Her son is 10 years old. Which data is needed?',
        options: ['Statement I alone', 'Statement II alone', 'Both together are needed', 'Even combined, insufficient'],
        correctIndex: 2
      },
      {
        text: 'What is the value of x? I. x + y = 15. II. y = 7. Which data is needed?',
        options: ['Both together are needed', 'Statement I alone', 'Statement II alone', 'Even combined, insufficient'],
        correctIndex: 0
      },
      {
        text: 'Is the number N even? I. N is divisible by 6. II. N > 100. Which data is needed?',
        options: ['Statement II alone', 'Statement I alone', 'Both together are needed', 'Even combined, insufficient'],
        correctIndex: 1
      },
      {
        text: 'What is the area of a rectangle? I. Its perimeter is 24. II. Its length is twice its width. Which data is needed?',
        options: ['Statement I alone', 'Statement II alone', 'Even combined, insufficient', 'Both together are needed'],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'evaluate-combined-statements',
    questions: [
      {
        text: 'Find the two-digit number. I. The sum of its digits is 9. II. The number is divisible by 5. Even combined, which is the correct conclusion?',
        options: ['The number is 45', 'The number is 90', 'Cannot be determined uniquely', 'No such number exists'],
        correctIndex: 2
      },
      {
        text: 'What is Priya\'s age? I. Priya is 5 years older than her brother. II. The sum of their ages is 35. Which data is needed?',
        options: ['Statement I alone', 'Both together are needed', 'Statement II alone', 'Even combined, insufficient'],
        correctIndex: 1
      },
      {
        text: 'What is the area of a rectangle? I. Its perimeter is 24. II. Its length is twice its width. Which data is needed?',
        options: ['Even combined, insufficient', 'Statement I alone', 'Both together are needed', 'Statement II alone'],
        correctIndex: 2
      },
      {
        text: 'What is the value of p? I. p + q = 12. II. q = 4. What can be concluded?',
        options: ['p cannot be determined', 'p = 4', 'p = 12', 'p = 8'],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'solve-a-caselet-data-set',
    questions: [
      {
        text: 'Caselet: Monthly budget ₹1,00,000. Salaries 40%, books ₹20,000, rest = sports. Half of sports = cricket equipment. What is spent on teachers\' salaries?',
        options: ['₹30,000', '₹40,000', '₹50,000', '₹20,000'],
        correctIndex: 1
      },
      {
        text: 'Using the same caselet, what is spent on SPORTS?',
        options: ['₹40,000', '₹20,000', '₹60,000', '₹30,000'],
        correctIndex: 0
      },
      {
        text: 'Using the same caselet, what is spent on CRICKET equipment?',
        options: ['₹10,000', '₹30,000', '₹20,000', '₹40,000'],
        correctIndex: 2
      },
      {
        text: 'Using the same caselet, books form what percentage of the budget?',
        options: ['25%', '15%', '10%', '20%'],
        correctIndex: 3
      }
    ]
  },
  {
    problemSlug: 'answer-questions-from-combined-graphs',
    questions: [
      {
        text: 'Bar: Sales 2021 = ₹500 crore, 2022 = ₹800 crore. Pie (2022): Exports 25%, Domestic 75%. What were exports in 2022?',
        options: ['200 crore', '150 crore', '250 crore', '100 crore'],
        correctIndex: 0
      },
      {
        text: 'Using the same graphs, DOMESTIC sales in 2022 were —',
        options: ['550 crore', '700 crore', '600 crore', '500 crore'],
        correctIndex: 2
      },
      {
        text: 'Using the same graphs, if exports in 2021 were 20% of 500, exports in 2021 were —',
        options: ['150 crore', '80 crore', '120 crore', '100 crore'],
        correctIndex: 3
      },
      {
        text: 'Using the same graphs, TOTAL exports across both years were —',
        options: ['300 crore', '250 crore', '400 crore', '350 crore'],
        correctIndex: 0
      }
    ]
  }
];

/* ================================================================
 * Aptitude Meta — categories, topics, and companies
 * (type/value pair must be unique — see AptitudeMeta index)
 * ================================================================ */

const aptitudeMetaData = [
  /* Categories (drive the filter pills on /aptitude via useAptitudeMetaStore) */
  { type: 'category', value: 'quantitative', label: 'Quantitative Aptitude', order: 1 },
  { type: 'category', value: 'logical', label: 'Logical Reasoning', order: 2 },
  { type: 'category', value: 'verbal', label: 'Verbal Ability', order: 3 },
  { type: 'category', value: 'data-interpretation', label: 'Data Interpretation', order: 4 },

  /* Topics used by seeded problems */
  { type: 'topic', value: 'divisibility', label: 'Divisibility Rules', order: 1 },
  { type: 'topic', value: 'number-properties', label: 'Number Properties', order: 2 },
  { type: 'topic', value: 'hcf-lcm', label: 'HCF & LCM', order: 3 },
  { type: 'topic', value: 'simplification', label: 'Simplification (BODMAS)', order: 4 },
  { type: 'topic', value: 'approximation', label: 'Approximation Techniques', order: 5 },
  { type: 'topic', value: 'percentages', label: 'Percentages', order: 6 },
  { type: 'topic', value: 'profit-loss', label: 'Profit & Loss', order: 7 },
  { type: 'topic', value: 'ratio-proportion', label: 'Ratio & Proportion', order: 8 },
  { type: 'topic', value: 'averages-mixtures', label: 'Averages & Mixtures', order: 9 },
  { type: 'topic', value: 'time-speed-distance', label: 'Time, Speed & Distance', order: 10 },
  { type: 'topic', value: 'time-work', label: 'Time & Work', order: 11 },
  { type: 'topic', value: 'simple-compound-interest', label: 'Simple & Compound Interest', order: 12 },
  { type: 'topic', value: 'permutations-combinations', label: 'Permutations & Combinations', order: 13 },
  { type: 'topic', value: 'probability', label: 'Probability', order: 14 },
  { type: 'topic', value: 'linear-quadratic-equations', label: 'Linear & Quadratic Equations', order: 15 },
  { type: 'topic', value: 'mensuration', label: 'Mensuration (Area, Perimeter & Volume)', order: 16 },
  { type: 'topic', value: 'logical-puzzles', label: 'Logical Puzzles', order: 17 },
  { type: 'topic', value: 'syllogisms', label: 'Syllogisms', order: 18 },
  { type: 'topic', value: 'blood-relations', label: 'Blood Relations', order: 19 },
  { type: 'topic', value: 'direction-sense', label: 'Direction Sense', order: 20 },
  { type: 'topic', value: 'coding-decoding', label: 'Coding-Decoding', order: 21 },
  { type: 'topic', value: 'number-series', label: 'Number Series', order: 22 },
  { type: 'topic', value: 'analogies', label: 'Analogies', order: 23 },
  { type: 'topic', value: 'odd-one-out', label: 'Odd One Out', order: 24 },
  { type: 'topic', value: 'linear-arrangement', label: 'Linear Arrangement', order: 25 },
  { type: 'topic', value: 'circular-arrangement', label: 'Circular Arrangement', order: 26 },
  { type: 'topic', value: 'statement-assumption', label: 'Statement & Assumption', order: 27 },
  { type: 'topic', value: 'statement-conclusion', label: 'Statement & Conclusion', order: 28 },
  { type: 'topic', value: 'clocks', label: 'Clocks', order: 29 },
  { type: 'topic', value: 'calendars', label: 'Calendars', order: 30 },
  { type: 'topic', value: 'input-output', label: 'Input-Output', order: 31 },
  { type: 'topic', value: 'logical-sequence', label: 'Logical Sequence', order: 32 },
  { type: 'topic', value: 'parts-of-speech', label: 'Parts of Speech', order: 33 },
  { type: 'topic', value: 'grammar-rules', label: 'Common Grammar Rules', order: 34 },
  { type: 'topic', value: 'subject-verb-agreement', label: 'Subject-Verb Agreement', order: 35 },
  { type: 'topic', value: 'tenses-articles', label: 'Tenses & Articles', order: 36 },
  { type: 'topic', value: 'synonyms-antonyms', label: 'Synonyms & Antonyms', order: 37 },
  { type: 'topic', value: 'one-word-substitution', label: 'One-Word Substitution & Idioms', order: 38 },
  { type: 'topic', value: 'passage-analysis', label: 'Passage Analysis', order: 39 },
  { type: 'topic', value: 'inference-questions', label: 'Inference-Based Questions', order: 40 },
  { type: 'topic', value: 'para-jumbles', label: 'Para Jumbles', order: 41 },
  { type: 'topic', value: 'sentence-completion', label: 'Sentence Completion', order: 42 },
  { type: 'topic', value: 'cloze-test-basics', label: 'Cloze Test Basics', order: 43 },
  { type: 'topic', value: 'context-word-choice', label: 'Context-Based Word Choice', order: 44 },
  { type: 'topic', value: 'tabular-data', label: 'Tabular Data Interpretation', order: 45 },
  { type: 'topic', value: 'bar-graph', label: 'Bar Graph Interpretation', order: 46 },
  { type: 'topic', value: 'pie-chart', label: 'Pie Chart Interpretation', order: 47 },
  { type: 'topic', value: 'line-graph', label: 'Line Graph Interpretation', order: 48 },
  { type: 'topic', value: 'data-sufficiency', label: 'Data Sufficiency', order: 49 },
  { type: 'topic', value: 'two-statement-analysis', label: 'Two-Statement Analysis', order: 50 },
  { type: 'topic', value: 'caselet-di', label: 'Caselet-Based DI', order: 51 },
  { type: 'topic', value: 'mixed-graph', label: 'Mixed Graph DI', order: 52 },

  /* Companies that ask these aptitude questions */
  { type: 'company', value: 'tcs', label: 'TCS', order: 1 },
  { type: 'company', value: 'infosys', label: 'Infosys', order: 2 },
  { type: 'company', value: 'wipro', label: 'Wipro', order: 3 },
  { type: 'company', value: 'accenture', label: 'Accenture', order: 4 },
  { type: 'company', value: 'amazon', label: 'Amazon', order: 5 },
  { type: 'company', value: 'flipkart', label: 'Flipkart', order: 6 }
];

/* ================================================================
 * Seed Runner
 * ================================================================ */

export async function runSeed() {
  console.log('[SEED-APT] Starting aptitude content seed...');

  /*
   * Clear ONLY the aptitude collections (+ aptitude quizzes).
   * Progress, QuizAttempt, and all other subjects' content are
   * deliberately left untouched.
   */
  console.log('[SEED-APT] Clearing existing aptitude data...');
  await Promise.all([
    AptitudeLesson.deleteMany({}),
    AptitudeSubtopic.deleteMany({}),
    AptitudeProblem.deleteMany({}),
    AptitudeMeta.deleteMany({}),
    Quiz.deleteMany({ problemModel: 'AptitudeProblem' })
  ]);
  console.log('[SEED-APT] Existing aptitude data cleared');

  console.log('[SEED-APT] Seeding aptitude lessons...');
  await AptitudeLesson.insertMany(aptitudeLessons);
  console.log('[SEED-APT] Seeding aptitude subtopics...');
  await AptitudeSubtopic.insertMany(aptitudeSubtopics);
  console.log('[SEED-APT] Seeding aptitude problems...');
  await AptitudeProblem.insertMany(aptitudeProblems);
  console.log('[SEED-APT] Seeding aptitude meta...');
  await AptitudeMeta.insertMany(aptitudeMetaData);

  /* ---- Seed quizzes: problemSlug → ObjectId + problemModel ---- */
  console.log('[SEED-APT] Seeding aptitude quizzes...');
  let quizCount = 0;
  for (const quiz of aptitudeQuizzes) {
    const problem = await AptitudeProblem.findOne({ slug: quiz.problemSlug });
    if (!problem) {
      console.log('[SEED-APT] WARNING: quiz skipped — problem not found:', quiz.problemSlug);
      continue;
    }
    await Quiz.create({
      problemId: problem._id,
      problemModel: 'AptitudeProblem',
      questions: quiz.questions
    });
    quizCount++;
  }
  console.log('[SEED-APT] Quizzes seeded:', quizCount);

  /* ---- Recount problemCount per lesson (dynamic, like seedPhaseContent) ---- */
  console.log('[SEED-APT] Recounting problemCount per lesson...');
  const lessons = await AptitudeLesson.find({});
  for (const lesson of lessons) {
    const count = await AptitudeProblem.countDocuments({ lessonSlug: lesson.slug });
    await AptitudeLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  console.log('[SEED-APT] problemCount updated dynamically');

  const summary = {
    aptitude: {
      lessons: aptitudeLessons.length,
      subtopics: aptitudeSubtopics.length,
      problems: aptitudeProblems.length,
      quizzes: quizCount
    },
    meta: {
      aptitude: aptitudeMetaData.length
    }
  };

  console.log('[SEED-APT] Aptitude content seeded successfully!', summary);
  return summary;
}

/*
 * CLI entry point
 */
const isCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/seedAptitudeContent.js');
if (isCLI) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
      console.log('[SEED-APT] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[SEED-APT] Connected to MongoDB');

      await runSeed();

      await mongoose.disconnect();
      console.log('[SEED-APT] Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('[SEED-APT] Error seeding database:', error);
      process.exit(1);
    }
  })();
}
