/*
 * seedAptitudeContent.js
 * Seeds Aptitude lessons, subtopics, problems, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems (1 problem per subtopic)
 * Subjects:  Aptitude (5 lessons, 10 subtopics, 10 problems)
 *
 * NOTE: Unlike seedPhaseContent.js this script ONLY touches the four
 * Aptitude collections — it never clears other subjects' content and it
 * never clears Progress/QuizAttempt (student data must survive).
 *
 * Usage:
 *   node server/seeds/seedAptitudeContent.js
 *   (requires MONGODB_URI in env, defaults to localhost)
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import AptitudeLesson from '../models/AptitudeLesson.js';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';
import AptitudeProblem from '../models/AptitudeProblem.js';
import AptitudeMeta from '../models/AptitudeMeta.js';

/* ================================================================
 * Aptitude Lessons
 * Category values match the four meta categories: quantitative,
 * logical, verbal, data-interpretation (see aptitudeMetaData below
 * and useAptitudeMetaStore.js defaults).
 * ================================================================ */

const aptitudeLessons = [
  {
    title: 'Number Systems & HCF-LCM',
    slug: 'number-systems-hcf-lcm',
    category: 'quantitative',
    description: 'The foundation of all quantitative aptitude — divisibility, factors, and the two great workhorses HCF and LCM.',
    icon: 'Calculator',
    order: 1,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Percentages, Profit & Loss',
    slug: 'percentages-profit-loss',
    category: 'quantitative',
    description: 'How to think in hundredths — percentage change, successive discounts, and the mathematics of buying and selling.',
    icon: 'Percent',
    order: 2,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Puzzles & Syllogisms',
    slug: 'puzzles-syllogisms',
    category: 'logical',
    description: 'The heart of the reasoning section — seating arrangements, blood relations, and yes/no deductive reasoning.',
    icon: 'Box',
    order: 3,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Verbal Ability Essentials',
    slug: 'verbal-ability',
    category: 'verbal',
    description: 'Grammar, vocabulary, and reading comprehension — the skills that decide how polished your communication looks.',
    icon: 'BookOpen',
    order: 4,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Data Interpretation',
    slug: 'data-interpretation',
    category: 'data-interpretation',
    description: 'Turning tables, bar charts, and pie charts into quick, confident calculations — a must for every test series.',
    icon: 'BarChart',
    order: 5,
    difficulty: 'medium',
    problemCount: 2
  }
];

/* ================================================================
 * Aptitude Subtopics
 * ================================================================ */

const aptitudeSubtopics = [
  /* Number Systems & HCF-LCM */
  {
    title: 'HCF and LCM Basics',
    slug: 'hcf-lcm-basics',
    description: 'Factors and multiples, and the golden relation between the Highest Common Factor and the Least Common Multiple.',
    explanation: `The Highest Common Factor (HCF) of two or more numbers is the largest number that divides each of them exactly. The Least Common Multiple (LCM) is the smallest number that each of them divides exactly.

The golden relation:
For two numbers A and B:  HCF × LCM = A × B
This single formula lets you find either one the moment you know the other, and it is the fastest route to most exam problems.

How to find the HCF (prime factorisation method):
1. Break each number into its prime factors.
2. For each prime, take the smallest exponent that appears anywhere.
3. Multiply those together — that's the HCF.

How to find the LCM:
1. Break each number into its prime factors.
2. For each prime, take the largest exponent that appears anywhere.
3. Multiply those together — that's the LCM.

Common exam patterns:
- Find the largest number that divides several numbers leaving the same remainder: subtract the remainder from each number first, then find the HCF of the results.
- Find the smallest number divisible by several numbers: just take their LCM.
- Two numbers in a ratio with a known HCF: multiply the ratio terms by the HCF to recover the actual numbers.

Analogy:
Think of a group of students forming rows. HCF asks: what is the biggest row size that lets every group form complete rows? LCM asks: what is the fewest total students such that every group can be split exactly?`,
    lessonSlug: 'number-systems-hcf-lcm',
    order: 1
  },
  {
    title: 'Number Series',
    slug: 'number-series',
    description: 'Spotting the hidden pattern — arithmetic, geometric, squares, primes, and alternating series.',
    explanation: `A number series is a sequence with one (or two) missing terms. Your job is to spot the rule that generates the sequence and apply it.

The standard patterns to try, in order:
1. Arithmetic: a constant is added (or subtracted) each step — 2, 5, 8, 11, ...
2. Geometric: a constant multiplies each step — 3, 6, 12, 24, ...
3. Squares and cubes: terms are perfect squares or cubes with a small offset — 1, 4, 9, 16, ... is n².
4. Prime numbers: the sequence is primes, or products/sums of consecutive primes.
5. Alternating series: two interleaved rules — one for odd positions, one for even positions. 2, 10, 4, 8, 8, 6, ... has one rule on the odd slots and another on the even slots.
6. Increasing difference: the gap between terms itself grows — differences of 1, 2, 3, 4, ... 2, 3, 5, 8, 12, ... has gaps 1, 2, 3, 4.
7. Reciprocals or fractions: the numerator and denominator each follow their own rule.

A methodical approach:
1. Compute the differences between consecutive terms and look at the difference sequence.
2. If the differences themselves form a pattern, extend it and work backward.
3. If the sequence is long, check odd and even positions separately.
4. When in doubt, test the "multiply and add" pattern: each term is a constant times the previous term, plus another constant.

The most common mistake is locking onto the first pattern you see. Always verify your rule against at least three consecutive transitions before committing.`,
    lessonSlug: 'number-systems-hcf-lcm',
    order: 2
  },

  /* Percentages, Profit & Loss */
  {
    title: 'Percentage Change & Successive Percentages',
    slug: 'percentage-change',
    description: 'How to apply and combine percentage increases and decreases without ever making the classic "add the percentages" error.',
    explanation: `A percentage is just a fraction with denominator 100. Increasing a value by p% multiplies it by (1 + p/100). Decreasing it by p% multiplies it by (1 − p/100).

Successive percentage changes — the key rule:
Two successive changes of +a% and +b% are NOT equal to a single change of (a + b)%. The correct combined change is:
  combined = a + b + (a × b) / 100
Example: a 10% increase followed by another 10% increase is 10 + 10 + (100/100) = 21%, not 20%. The second 10% applies to the already-increased value, so it's worth more.

The multiplier method (always prefer this):
- +10% → multiply by 1.10
- −20% → multiply by 0.80
- Apply every change as a multiplication in sequence. A 10% rise then a 10% fall is 1.10 × 0.90 = 0.99 → a net 1% loss.

Percentage change itself:
Change% = (new − old) / old × 100
For exam speed, use fractions: a 25% increase is a ×5/4, a 20% decrease is a ×4/5. These round nicely and are easier to compute mentally.

Reverse percentage problems:
"If a price rises by 25% to 500, what was the original?" → original × 1.25 = 500 → original = 500 / 1.25 = 400. Never subtract 25% of the final price — that's the classic trap.

Analogy:
Think of a value as a stack of blocks. A percentage change multiplies the whole stack, not just the top block. Two changes multiply the stack twice — the second change acts on the already-changed stack.`,
    lessonSlug: 'percentages-profit-loss',
    order: 1
  },
  {
    title: 'Profit, Loss & Discount',
    slug: 'profit-loss-discount',
    description: 'The vocabulary of trade — cost price, selling price, marked price, and the discounts that connect them.',
    explanation: `The four prices you must keep straight:
- Cost Price (CP): what the seller paid to acquire the item.
- Selling Price (SP): what the buyer actually pays.
- Marked Price (MP): the sticker price before any discount.
- Discount: a percentage cut applied to the Marked Price.

The core formulas:
- Profit = SP − CP (when SP > CP); Loss = CP − SP (when CP > SP).
- Profit% = (Profit / CP) × 100 — always on Cost Price unless the question says otherwise.
- SP = CP × (1 + profit%/100) or CP × (1 − loss%/100).
- After a discount of d% on the marked price: SP = MP × (1 − d/100).

The golden chain for discount problems:
MP → (apply discount) → SP → (compare with CP) → profit or loss.
Work backwards through this chain: if the question gives the profit percentage and the discount, you can find the relation between MP and CP.

Common trap: profit percentage is computed on CP, but discount percentage is computed on MP. Mixing the two bases is the number one source of wrong answers.

Fast mental tricks:
- Selling at "20% profit" means SP = CP × 6/5, so a problem can be solved by ratios alone.
- "Two successive discounts of 10% each" is not 20% off — it's 0.9 × 0.9 = 0.81, an effective 19% off.

Analogy:
The marked price is the price tag in the shop window. The discount is the sign that says "20% off the tag." The cost price is what the shop owner paid behind the scenes. Your profit is measured between the cost price and what the customer finally pays — not between the cost and the tag.`,
    lessonSlug: 'percentages-profit-loss',
    order: 2
  },

  /* Puzzles & Syllogisms */
  {
    title: 'Seating Arrangements',
    slug: 'seating-arrangements',
    description: 'Linear and circular arrangement puzzles — drawing the diagram correctly is 80% of the solution.',
    explanation: `Seating arrangement puzzles give you clues about who sits where, and ask you to place every person. The methodical approach:

1. Read all clues first. Do not start placing anyone until you know the full set of constraints.
2. Decide the shape: a straight line (people face one way) or a circle (people face the centre or outward). The direction of "left" and "right" flips depending on which way people face — decide this before placing anyone.
3. Find the most constraining clue — the one that fixes the most positions, like "A is exactly in the middle" or "B sits second to the right of C."
4. Draw a rough diagram with placeholder slots and fill from the strongest clue outward.
5. Apply every remaining clue one at a time. If a clue has two possible interpretations, branch into two diagrams and test both.
6. Eliminate branches as soon as a contradiction appears. A clue that cannot be placed invalidates that branch.
7. Verify: re-read every clue against your final diagram before answering.

Left/right trap:
If everyone faces the centre of a circle, "left of A" means A's left from your perspective looking at the diagram is actually A's right. If everyone faces the same direction in a line, left and right are as you see them. Always confirm facing direction from the question.

Order words to watch:
- "Immediately next to" — adjacent, no one between.
- "Second to the right" — skip one person to the right.
- "Sits between B and C" — B on one side, C on the other, but you don't yet know which.

Analogy:
The diagram is like a bus seating chart — you're placing named passengers into numbered seats. Every clue is a rule about who can sit where. If a placement breaks a rule, that placement is wrong.`,
    lessonSlug: 'puzzles-syllogisms',
    order: 1
  },
  {
    title: 'Syllogisms',
    slug: 'syllogisms',
    description: 'Deciding whether conclusions necessarily follow from statements — the Venn diagram method made reliable.',
    explanation: `A syllogism question gives two or more categorical statements (like "All engineers are smart") and asks which of several conclusions necessarily follow.

The reliable method — Venn diagrams:
1. Draw the statements as overlapping circles, choosing the configuration that makes each statement true. Key shapes:
   - "All A are B": the A circle sits entirely inside the B circle.
   - "Some A are B": the two circles overlap.
   - "No A are B": the two circles are completely separate.
   - "Some A are not B": part of A lies outside B.
2. Draw every possible configuration that satisfies all statements — usually one or two diagrams.
3. A conclusion is valid only if it holds in EVERY valid configuration. If it holds in one diagram but fails in another, it does not follow.

The classic traps:
- "All A are B" does NOT imply "All B are A" — the B circle can be bigger.
- "Some A are B" and "Some B are C" does NOT imply "Some A are C" — draw it and you'll see the A and C circles can stay separate.
- "Some A are B" does NOT imply "Some A are not B" — the overlap could be complete (A entirely inside B).
- Universal statements are stronger than particular ones: "All A are B" plus "No B are C" cleanly gives "No A are C".

Possible/therefore rule:
If a conclusion contains words like "possible," it usually follows from even a single configuration. If it contains "definitely" or "necessarily," it must hold in all configurations.

Analogy:
Think of the statements as facts about a crowd. A conclusion is only safe if it stays true no matter how you arrange the crowd — as long as the facts hold. If you can arrange the crowd so the conclusion is false, the conclusion is unsafe.`,
    lessonSlug: 'puzzles-syllogisms',
    order: 2
  },

  /* Verbal Ability */
  {
    title: 'Grammar & Sentence Correction',
    slug: 'grammar-sentence-correction',
    description: 'The most-tested grammar rules — subject-verb agreement, tenses, and pronoun reference — with a quick-check method.',
    explanation: `Most sentence-correction questions test a small, repeatable set of rules. Master these and you cover the majority of questions:

1. Subject-verb agreement:
   The verb must agree in number with its subject, no matter what sits between them. "The box of chocolates IS on the table" — the subject is "box," singular, even though "chocolates" is plural. Ignore interrupting phrases like "of chocolates," "along with," "as well as."

2. Singular/plural trigger words:
   "Each," "every," "either...or," "neither...nor" take a singular verb: "Each of the students IS responsible." "Both" takes plural: "Both students ARE responsible."

3. Parallelism:
   Items in a list must share the same grammatical form: "She likes running, swimming, and hiking" — not "running, swimming, and to hike." Faulty parallelism is the most common error in correction questions.

4. Tense consistency:
   The verb tenses must agree with the time markers in the sentence. "He said that he WILL go" is wrong if reported speech is involved — reported speech shifts tenses back: "He said that he WOULD go."

5. Pronoun reference:
   Every pronoun must have a clear, unambiguous antecedent. "When John met Sam, he was tired" — who was tired? Ambiguous.

6. Dangling modifiers:
   A modifier at the start of a sentence must attach to the subject. "Walking down the road, the trees were tall" — the trees are not walking. The subject must be the person doing the walking.

A quick three-pass method:
1. Read the sentence and identify the subject and the verb — check agreement first.
2. Scan the list of items (commas + "and") for parallel structure.
3. Read the sentence aloud mentally — if any part feels unnatural, it usually hides an error.

Analogy:
Think of the sentence as a machine with interlocking parts: the verb must fit the subject like a gear fits its shaft, the items in a list must be identical parts, and every pronoun is a bolt that must connect to exactly one noun.`,
    lessonSlug: 'verbal-ability',
    order: 1
  },
  {
    title: 'Reading Comprehension Strategies',
    slug: 'reading-comprehension',
    description: 'How to read fast and answer accurately — skimming, identifying the main idea, and handling inference questions.',
    explanation: `Reading comprehension tests two things: understanding what the passage says, and answering precisely within the time limit. The method:

1. Skim before reading: read the first and last sentence of each paragraph in 30-60 seconds to map the structure. Passages usually follow: main claim → supporting points → conclusion.
2. Identify the main idea: the main idea is what the whole passage is about — usually stated in the first paragraph and restated in the last. The first question on most passages is the "main idea" question, so solve it early: it primes your understanding for everything else.
3. Answer factual questions by locating: read the question, find the paragraph that mentions the key words, and match the wording — the correct answer is almost always a paraphrase, not a verbatim copy.
4. Handle inference questions: an inference is something the passage implies but doesn't state directly. The correct answer is the one that MUST be true given the passage — not merely "could be true."
5. Eliminate aggressively: wrong options usually say the opposite of the passage, stretch too far beyond it, or repeat the passage's words without its meaning. Get rid of all three, and the survivor is correct.

Timing strategy:
- Don't read every word on your first pass — build the map, then zoom into the paragraphs the questions ask about.
- If a question asks about a specific detail, go back and read that paragraph carefully before choosing.
- Never answer from memory or prior knowledge: every answer must be grounded in the passage text.

The vocabulary layer:
Unfamiliar words are fair game. Use the context: the surrounding sentences almost always give you a contrast (but, however, although) or a confirmation (therefore, similarly) that reveals the meaning's direction.

Analogy:
Think of the passage as a building. Skimming gives you the floor plan. The main idea is the building's purpose. Questions ask you to find specific rooms (details), guess what's in the basement (inference), and never to wander into a neighbouring building (outside knowledge).`,
    lessonSlug: 'verbal-ability',
    order: 2
  },

  /* Data Interpretation */
  {
    title: 'Tables & Bar Charts',
    slug: 'tables-bar-charts',
    description: 'Reading tabular data and bar charts quickly — and the percentage/ratio calculations that follow.',
    explanation: `Data Interpretation questions give you a table or chart and ask for comparisons, percentages, and ratios. The approach:

1. Read the labels first: what does each row and column mean? What are the units? Note the period covered (e.g., sales per year for 2019-2023).
2. Locate before calculating: find the exact cell or bar you need. Copy the values down before doing any arithmetic — most errors come from reading the wrong cell.
3. The three question families you'll meet:
   - Direct reading: the answer is literally in the table (e.g., "What were sales in 2021?").
   - Percentage: "Sales in 2022 are what percent of 2020?" → (2022 / 2020) × 100.
   - Ratio/difference: "What is the ratio of exports to imports?" or "By how much did sales increase?" → subtract.
4. Use approximations where options are far apart: exam options usually let you estimate with rounded numbers — this is much faster and nearly as accurate.
5. Compare with a baseline: "increase by 25% of the previous year" — anchor your calculation to the stated baseline (previous year, not the current one).

Bar chart specifics:
- Bars may be single (one series) or grouped (several series side by side). Read the legend carefully to know which bar is which series.
- Scale: read the axis interval first (each step = 10? 50? 100?). Misreading the scale is the most common bar-chart error.
- A question like "what percentage of total is X?" needs the total first — sum the relevant bars, then divide.

Analogy:
The table is a spreadsheet with the answers already inside. Your job is not to compute the data — the data is given. Your job is to compute FROM the data, using exactly the cells the question names and nothing else.`,
    lessonSlug: 'data-interpretation',
    order: 1
  },
  {
    title: 'Pie Charts & Caselets',
    slug: 'pie-charts-caselets',
    description: 'Working with angles, percentages, and prose-embedded data — the two trickiest DI formats.',
    explanation: `Pie charts and caselets (data hidden inside a paragraph) are the formats where candidates lose the most marks — both hide the data behind an extra translation step.

Pie charts:
- The full circle = 360° = 100% of the total. Each sector's angle is proportional to its share: share% = (angle / 360) × 100.
- To get an actual value, you must be given one anchor: either the total (then value = total × angle/360) or one sector's value (then total = sector value × 360/angle).
- The classic question chain: "If the total is X, what is the value of sector A?" → angle of A/360 × X. "What percent is A of B?" → angle A / angle B × 100.
- Two pie charts often compare different years or categories: never mix the totals between charts unless the question explicitly ties them together.

Caselets:
- All the data lives in a paragraph — usually a table described in words (e.g., "Out of 1200 students, 40% are in engineering, of which 60% are boys...").
- The method: extract the numbers into your own small table as you read. Write the given total at the top, then fill percentages level by level.
- Work top-down through the chain: total → first split → second split → third split. Each "of which" is another multiplication by a percentage.
- Beware "of which" vs "compared to": "40% of the total are engineers, of which 60% are boys" means boys = 0.60 × 0.40 × total. If it said "boys are 60% more than girls," that is a different calculation entirely.

Both formats reward the same habit: translate the visual or verbal data into plain numbers before answering a single question.

Analogy:
A pie chart is a pizza cut into angle-sized slices — the whole pizza is 100% and 360°. A caselet is a recipe described in words: you must write down the ingredients (numbers) before you can cook (calculate).`,
    lessonSlug: 'data-interpretation',
    order: 2
  }
];

/* ================================================================
 * Aptitude Problems — NOTE: the AptitudeProblem model does NOT have
 * examples/constraints/approach/code fields. Each problem carries a
 * `solution` Markdown string instead (rendered on AptitudeDetail).
 * ================================================================ */

const aptitudeProblems = [
  {
    title: 'HCF and LCM of Two Numbers',
    slug: 'hcf-lcm-two-numbers',
    lessonSlug: 'number-systems-hcf-lcm',
    subtopicSlug: 'hcf-lcm-basics',
    difficulty: 'easy',
    topics: ['HCF', 'LCM'],
    companies: ['Infosys', 'TCS'],
    problemStatement: 'The HCF of two numbers is 12 and their product is 4320. Find the LCM of the two numbers.',
    solution: `## Solution

**Golden relation:** For two numbers, HCF × LCM = A × B (the product of the numbers).

We are given:

- HCF = 12
- A × B = 4320

Substitute into the relation:

12 × LCM = 4320

LCM = 4320 ÷ 12 = **360**

**Answer: 360**

**Why this works:** every common factor of the two numbers divides the HCF, and every common multiple is a multiple of the LCM — the two numbers' product is always exactly the HCF times the LCM, so one follows from the other with a single division.

**Check:** if the numbers are 12a and 12b with a, b coprime, then LCM = 12ab and product = 144ab. So LCM = product ÷ 12 = 4320 ÷ 12 = 360. ✓`
  },
  {
    title: 'Find the Missing Term in a Number Series',
    slug: 'missing-term-number-series',
    lessonSlug: 'number-systems-hcf-lcm',
    subtopicSlug: 'number-series',
    difficulty: 'easy',
    topics: ['Number Series'],
    companies: ['Wipro', 'Infosys'],
    problemStatement: 'Find the missing term in the series: 3, 8, 15, 24, 35, __',
    solution: `## Solution

Write the series and compute the gaps between consecutive terms:

- 8 − 3 = 5
- 15 − 8 = 7
- 24 − 15 = 9
- 35 − 24 = 11

The gaps form their own clean pattern: 5, 7, 9, 11 — each gap grows by 2.

So the next gap must be 11 + 2 = **13**.

Missing term = 35 + 13 = **48**

**Answer: 48**

**Pattern check (the alternate view):** the terms are also n² − 1 for n = 2, 3, 4, 5, 6: 2²−1 = 3, 3²−1 = 8, 4²−1 = 15, 5²−1 = 24, 6²−1 = 35 → next is 7²−1 = **48**. Both views agree, which confirms the answer.

**Lesson:** when the gaps themselves form a pattern, extend the gap pattern and work backward — and always verify with a second interpretation when one is available.`
  },
  {
    title: 'Two Successive Discounts',
    slug: 'successive-discounts',
    lessonSlug: 'percentages-profit-loss',
    subtopicSlug: 'percentage-change',
    difficulty: 'easy',
    topics: ['Percentages', 'Discount'],
    companies: ['Amazon', 'Flipkart'],
    problemStatement: 'A shopkeeper offers two successive discounts of 20% and 10% on a marked price of ₹5000. What is the final selling price, and what single discount is equivalent to the two combined?',
    solution: `## Solution

Apply the discounts as successive multipliers:

1. After 20% off: 5000 × (1 − 0.20) = 5000 × 0.80 = **4000**
2. After 10% off: 4000 × (1 − 0.10) = 4000 × 0.90 = **3600**

**Final selling price = ₹3600**

Equivalent single discount: the final price as a fraction of the marked price is 0.80 × 0.90 = 0.72, so the total discount is 1 − 0.72 = 0.28 = **28%**.

(Note: NOT 20% + 10% = 30% — the second discount applies to the already-reduced price. Using the successive-change formula: 20 + 10 − (20×10)/100 = 28%.)

**Answer:** Selling price ₹3600; equivalent single discount 28%.

**Check:** 5000 × 0.72 = 3600 ✓`
  },
  {
    title: 'Profit Earned on Marked Price Discount',
    slug: 'profit-marked-price',
    lessonSlug: 'percentages-profit-loss',
    subtopicSlug: 'profit-loss-discount',
    difficulty: 'medium',
    topics: ['Profit & Loss', 'Discount'],
    companies: ['Flipkart', 'Amazon'],
    problemStatement: 'A shopkeeper marks his goods 25% above the cost price and allows a discount of 10% on the marked price. Find his profit percentage.',
    solution: `## Solution

Let the cost price (CP) be 100 (a convenient base for percentage problems).

1. Marked price = CP + 25% = 100 × 1.25 = **125**
2. Discount 10% on marked price: SP = 125 × 0.90 = **112.50**

Profit = SP − CP = 112.50 − 100 = 12.50

Profit% = (Profit / CP) × 100 = 12.50%

**Answer: 12.5%**

**Why the base matters:** profit% is always computed on CP (100), not on the marked price. If you had wrongly computed 10% of 125 you would get a different and incorrect answer.

**Fast ratio view:** 25% above CP is a ×5/4 multiplier; a 10% discount is a ×9/10 multiplier. Net = (5/4) × (9/10) = 45/40 = 1.125 → 12.5% profit. ✓`
  },
  {
    title: 'Seating Arrangement Puzzle',
    slug: 'seating-arrangement-puzzle',
    lessonSlug: 'puzzles-syllogisms',
    subtopicSlug: 'seating-arrangements',
    difficulty: 'medium',
    topics: ['Puzzles', 'Seating Arrangement'],
    companies: ['Infosys', 'TCS'],
    problemStatement: 'Five friends — A, B, C, D, E — sit in a row facing north. C sits immediately next to A. B sits at one of the ends. D sits to the immediate right of B. E sits exactly in the middle of the row. If A sits to the immediate right of E, who sits at the other end of the row?',
    solution: `## Solution

Place the strongest clue first: **E sits exactly in the middle** of five seats.

Row: [ _ ] [ _ ] [ E ] [ _ ] [ _ ]

Next strong clue: **A sits to the immediate right of E**, so A takes seat 4.

Row: [ _ ] [ _ ] [ E ] [ A ] [ _ ]

Now **C sits immediately next to A** — C must be in seat 5 (seat 3 is already taken by E).

Row: [ _ ] [ _ ] [ E ] [ A ] [ C ]

**B sits at one of the ends** and **D sits to the immediate right of B**. B cannot be at the right end (seat 5 is C), so B is at seat 1, and D takes seat 2.

Row: [ B ] [ D ] [ E ] [ A ] [ C ]

**Answer: C sits at the other end of the row.**

**Method note:** always start from the clue that pins down an absolute position (the middle, an end, "second to the right of"). Place it, then work outward, and only branch when a clue has two possible readings — here every clue had exactly one valid placement, so no branching was needed.`
  },
  {
    title: 'Syllogism: All and Some',
    slug: 'syllogism-all-some',
    lessonSlug: 'puzzles-syllogisms',
    subtopicSlug: 'syllogisms',
    difficulty: 'medium',
    topics: ['Syllogisms', 'Logical Reasoning'],
    companies: ['TCS', 'Infosys'],
    problemStatement: 'Statements: (1) All pens are books. (2) Some books are pencils. Conclusions: I. Some pens are pencils. II. Some pencils are books. Which conclusion(s) necessarily follow?',
    solution: `## Solution

Draw the Venn configurations that satisfy both statements.

**Configuration 1:** Pens entirely inside Books, and Pencils overlapping Books in a region that also touches Pens. Then some pens are pencils → conclusion I holds.

**Configuration 2:** Pens entirely inside Books, and Pencils overlapping Books in a region completely separate from Pens. Then no pen is a pencil → conclusion I FAILS here.

Because both configurations satisfy the statements but conclusion I only holds in one of them, conclusion I does **not** necessarily follow.

**Conclusion II:** "Some pencils are books" is directly stated by statement (2) — it holds in every valid configuration.

**Answer: Only conclusion II follows.**

**Rule to remember:** "All A are B" and "Some B are C" never force "Some A are C." The B-circle may be bigger than A, and C may overlap B entirely outside A. A conclusion with "some" only follows if every valid diagram shows the overlap.`
  },
  {
    title: 'Spot the Grammatical Error',
    slug: 'sentence-correction-error',
    lessonSlug: 'verbal-ability',
    subtopicSlug: 'grammar-sentence-correction',
    difficulty: 'easy',
    topics: ['Grammar', 'Sentence Correction'],
    companies: ['Wipro', 'Accenture'],
    problemStatement: 'The sentence below has one underlined part that contains a grammatical error. Identify it: "Each of the employees (A) were asked to submit (B) their reports by Friday, (C) and the manager will review them (D) on Monday."',
    solution: `## Solution

Check each part with the core rules:

- **Part A: "were asked"** — the subject is "Each," which is singular. "Each of the employees" is singular even though "employees" is plural, because the prepositional phrase "of the employees" does not change the subject. The verb must be "was asked," not "were asked." → **Error.**
- Part B: "their reports by Friday" — acceptable here; while "each" is singular, modern usage accepts a singular/plural mix in this construction, and this part is not the intended error.
- Part C and Part D: verb tenses are consistent ("asked... will review" is a valid sequence: past event, future action).

**Answer: A — "were asked" should be "was asked."**

Corrected: "Each of the employees **was** asked to submit their reports by Friday, and the manager will review them on Monday."

**Rule:** when the subject is "each," "every," or "either," ignore everything between the subject and the verb — the verb stays singular.`
  },
  {
    title: 'Reading Comprehension: Main Idea',
    slug: 'rc-main-idea',
    lessonSlug: 'verbal-ability',
    subtopicSlug: 'reading-comprehension',
    difficulty: 'medium',
    topics: ['Reading Comprehension'],
    companies: ['Accenture', 'TCS'],
    problemStatement: 'Read the passage and choose the statement that best captures the main idea: "Renewable energy is often dismissed as unreliable, yet modern grids are learning to smooth its intermittency. Battery storage absorbs surplus generation during windy nights and releases it during evening peaks, while demand-response programmes shift flexible loads to times of abundance. The obstacle is no longer technology but economics: storage costs have fallen sharply, but policy still prices carbon too cheaply to reward it."',
    solution: `## Solution

Break the passage into its claims:

1. Counter-claim: renewables are called unreliable.
2. Refutation: storage (batteries) and demand-response already smooth the intermittency.
3. Final claim: the real barrier is economic — carbon is priced too cheaply to reward storage, even though storage costs have fallen.

The main idea is the claim the whole passage argues toward: **renewable intermittency is already solvable; the remaining problem is that policy does not price carbon to reward the solution.**

**Why the others fail:**
- "Battery storage is the only solution to intermittency" — the passage also mentions demand-response, and calls nothing "the only" solution. Too strong.
- "Renewable energy is too unreliable to power modern grids" — the opposite of the passage's position.
- "Storage costs have fallen sharply" — true but only a supporting detail, not the point of the passage.

**Method:** the first sentence sets up the debate, the middle supplies evidence, and the last sentence states the conclusion. For main-idea questions, weight the conclusion sentence the heaviest.`
  },
  {
    title: 'Table-Based Percentage',
    slug: 'table-percentage-di',
    lessonSlug: 'data-interpretation',
    subtopicSlug: 'tables-bar-charts',
    difficulty: 'easy',
    topics: ['Data Interpretation', 'Percentages'],
    companies: ['Amazon', 'Deloitte'],
    problemStatement: 'A company\'s sales (in ₹ lakh) are: 2019: 120, 2020: 150, 2021: 180, 2022: 210, 2023: 240. By what percentage did sales grow from 2021 to 2023?',
    solution: `## Solution

The question names two years: **2021 (180)** and **2023 (240)**.

Growth from 2021 to 2023 = 240 − 180 = 60.

Percentage growth is anchored to the earlier year (the base): (growth / base) × 100 = (60 / 180) × 100 = **33.33%**.

**Answer: 33⅓%**

**Trap avoided:** anchoring to 2023 instead of 2021 would give (60/240) × 100 = 25% — wrong. The phrase "from 2021 to 2023" makes 2021 the base.

**Fast fraction trick:** 60 is exactly one-third of 180, so the growth is 33⅓% without any long division.

**Method:** copy the two named values out of the table first, decide which is the base (the "from" year), then divide the difference by the base.`
  },
  {
    title: 'Pie Chart Angle to Percentage',
    slug: 'pie-chart-percentage',
    lessonSlug: 'data-interpretation',
    subtopicSlug: 'pie-charts-caselets',
    difficulty: 'medium',
    topics: ['Data Interpretation', 'Pie Charts'],
    companies: ['Deloitte', 'KPMG'],
    problemStatement: 'A pie chart shows a company\'s total expenditure of ₹7,20,000. The sector for "Salaries" subtends an angle of 120°. What amount is spent on salaries, and what percentage of the total is it?',
    solution: `## Solution

The full circle = 360° = 100% of the total.

**Percentage first:** salaries share = 120/360 = 1/3 = **33⅓%**.

**Amount:** 33⅓% of ₹7,20,000 = 7,20,000 × (1/3) = **₹2,40,000**.

**Answer: ₹2,40,000 (33⅓%)**

**Fast method:** for every 3.6° of angle there is 1% of the total. 120 ÷ 3.6 = 33.33% — the same result, quicker.

**Check:** 2,40,000 × 3 = 7,20,000 ✓ — exactly one-third of the total, matching the 120°/360° ratio.

**Method:** when the total is given, each sector's value is (angle/360) × total. Never compute percentages from amounts you have not been given — the angle-to-total ratio is the only anchor you need.`
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

  /* Topics */
  { type: 'topic', value: 'hcf-lcm', label: 'HCF & LCM', order: 1 },
  { type: 'topic', value: 'number-series', label: 'Number Series', order: 2 },
  { type: 'topic', value: 'percentages', label: 'Percentages', order: 3 },
  { type: 'topic', value: 'profit-loss', label: 'Profit & Loss', order: 4 },
  { type: 'topic', value: 'puzzles', label: 'Puzzles', order: 5 },
  { type: 'topic', value: 'syllogisms', label: 'Syllogisms', order: 6 },
  { type: 'topic', value: 'grammar', label: 'Grammar', order: 7 },
  { type: 'topic', value: 'reading-comprehension', label: 'Reading Comprehension', order: 8 },
  { type: 'topic', value: 'tables', label: 'Tables & Bar Charts', order: 9 },
  { type: 'topic', value: 'pie-charts', label: 'Pie Charts & Caselets', order: 10 },

  /* Companies that commonly ask aptitude questions */
  { type: 'company', value: 'tcs', label: 'TCS', order: 1 },
  { type: 'company', value: 'infosys', label: 'Infosys', order: 2 },
  { type: 'company', value: 'wipro', label: 'Wipro', order: 3 },
  { type: 'company', value: 'accenture', label: 'Accenture', order: 4 },
  { type: 'company', value: 'amazon', label: 'Amazon', order: 5 },
  { type: 'company', value: 'flipkart', label: 'Flipkart', order: 6 },
  { type: 'company', value: 'deloitte', label: 'Deloitte', order: 7 },
  { type: 'company', value: 'kpmg', label: 'KPMG', order: 8 }
];

/* ================================================================
 * Seed Runner
 * ================================================================ */

export async function runSeed() {
  console.log('[SEED-APT] Starting aptitude content seed...');

  /*
   * Clear ONLY the aptitude collections. Progress, QuizAttempt, and all
   * other subjects' content are deliberately left untouched.
   */
  console.log('[SEED-APT] Clearing existing aptitude data...');
  await Promise.all([
    AptitudeLesson.deleteMany({}),
    AptitudeSubtopic.deleteMany({}),
    AptitudeProblem.deleteMany({}),
    AptitudeMeta.deleteMany({})
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
      problems: aptitudeProblems.length
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
