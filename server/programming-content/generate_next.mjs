import fs from 'fs';

/* ── NOTE: run this from the PROJECT ROOT (writes server/programming-content/next.md).
 *   node server/programming-content/generate_next.mjs
 * Then generate the seed with:  node server/programming-content/generate_seed.mjs next.md
 * And run it from server/:     cd server && node programming-content/seed_<lesson>.mjs */

const lines = [];
const push = s => lines.push(s);
const hr = () => push('\n---\n');

/* ── Code-fence + inline-code helpers.
 *   Using variables (instead of literal backticks) inside template literals avoids
 *   any escaping bugs — this is why present.md generation failed the first time. ── */
const F = '```'; // triple-backtick fence
const t = s => '`' + s + '`'; // inline code: `foo`

// ──────────────────────────────────────────────
// HEADER
// ──────────────────────────────────────────────
push('# Next Programming Content — Control Flow\n');
push('> Second lesson of the Programming curriculum. Category: `programming-foundations`, order 1.');
push('> 3 subtopics · 2 problems · 2 quizzes\n');
hr();

// ──────────────────────────────────────────────
// CATEGORY
// ──────────────────────────────────────────────
push('## Category\n');
push('- Order: 0 (same category)');
push('- Name: Programming Foundations');
push('- Slug: `programming-foundations`\n');
hr();

// ──────────────────────────────────────────────
// LESSON
// ──────────────────────────────────────────────
const lesson = {
  title: 'Control Flow',
  slug: 'control-flow',
  category: 'programming-foundations',
  description: 'Learn how programs make decisions and repeat actions — if/else conditions, for and while loops, and the break/continue statements that give you fine control over how your code flows.',
  image: '',
  icon: 'GitBranch',
  order: 1,
  difficulty: 'easy',
  problemCount: 2
};

push('## Lesson\n');
push('```json');
push(JSON.stringify(lesson, null, 2));
push('```\n');
hr();

// ──────────────────────────────────────────────
// SUBTOPICS
// ──────────────────────────────────────────────
push('## Subtopics (3)\n');

// --- Subtopic 1: Conditional Statements (theory only) ---
const sub1Explain = `## What are Conditional Statements?

Programs don't just run top to bottom — they make **decisions**. A conditional statement lets your program ask "is this true?" and run different code depending on the answer. Think of it like a fork in the road: the path you take depends on a condition.

## The Three Building Blocks

### 1. if — "If this is true, do something"

${F}
IF score >= 50 THEN
    PRINT "Passed"
END IF
${F}

### 2. else — "Otherwise, do this instead"

${F}
IF score >= 50 THEN
    PRINT "Passed"
ELSE
    PRINT "Failed"
END IF
${F}

### 3. else if — "Check more possibilities"

${F}
IF score >= 90 THEN
    PRINT "Grade A"
ELSE IF score >= 75 THEN
    PRINT "Grade B"
ELSE
    PRINT "Grade C"
END IF
${F}

## What Makes Up a Condition?

A **condition** is any expression that evaluates to true or false. It is usually built from:

- **Comparison operators** — ${t('==')} equal, ${t('!=')} not equal, ${t('>')} greater than, ${t('<')} less than, ${t('>=')} greater or equal, ${t('<=')} less or equal
- **Logical operators** — ${t('and')}, ${t('or')}, ${t('not')} — which combine smaller conditions

${F}
IF age >= 18 AND has_id == true THEN
    PRINT "Allowed to enter"
END IF
${F}

## Real-World Analogy

Think of a traffic light:

${F}
IF light is green THEN
    go
ELSE IF light is yellow THEN
    slow down
ELSE
    stop
END IF
${F}

That is a conditional statement in real life — your driving code checks a condition and runs one of three branches.

## Why Order Matters in a Chain

In an ${t('if / else if / else')} chain, the conditions are checked **top to bottom**, and the **first true one wins**. So always put the most specific condition first.

${F}
IF age >= 18 THEN
    PRINT "Adult"
ELSE IF age >= 13 THEN
    PRINT "Teen"
ELSE
    PRINT "Child"
END IF
${F}

A 20-year-old matches the first condition and prints "Adult" — the later checks are never reached.

## Key Takeaway

Conditional statements let a program make decisions. Use ${t('if')} for a single check, ${t('else')} for the fallback, and ${t('else if')} chains for multiple possibilities. Every branch runs based on whether a condition evaluates to true or false — and the first true condition in a chain wins.`;

const sub1 = {
  title: 'Conditional Statements',
  slug: 'conditional-statements',
  lessonSlug: 'control-flow',
  order: 0,
  description: 'Learn how if, else if, and else let your program make decisions and run different code depending on conditions.',
  explanation: sub1Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Conditional Statements (theory only)\n');
push('```json');
push(JSON.stringify(sub1, null, 2));
push('```\n');

// --- Subtopic 2: Loops ---
const sub2Explain = `## What is a Loop?

A **loop** repeats a block of code. Instead of writing the same line 100 times, you write it once and tell the computer to repeat it. Think of a washing machine — the drum keeps spinning through the same cycle until the cycle ends.

## The for Loop — When You Know the Count

Use a ${t('for')} loop when you know **exactly how many times** to repeat.

${F}
FOR i FROM 1 TO 5:
    PRINT i
END FOR

# prints: 1 2 3 4 5
${F}

The loop variable ${t('i')} takes each value in the range, one at a time, and the body runs once per value.

## The while Loop — When the End Depends on a Condition

Use a ${t('while')} loop when you **don't know the count in advance** — the loop keeps going as long as a condition stays true.

${F}
number = 123
WHILE number > 0:
    digit = number MOD 10     # last digit
    PRINT digit
    number = number DIV 10    # drop last digit

# prints: 3 2 1
${F}

## for vs while — When to Use Which

| Situation | Use |
|---|---|
| I know the exact count | ${t('for')} |
| I don't know when it will stop | ${t('while')} |
| I need an index from 0 to n | ${t('for')} |
| The loop depends on a condition changing | ${t('while')} |

## Real-World Analogies

- **${t('for')} loop** — a playlist you play start to finish. You know exactly how many songs there are.
- **${t('while')} loop** — waiting for a pot of water to boil. You don't know how long, you just keep checking until it bubbles.

## Why Loops Matter

✅ **Less code** — one block instead of ten copies
✅ **Fewer bugs** — change one place, not ten
✅ **Scales** — the same code handles 10 items or 10 million

## Pseudocode

${F}
sum = 0
FOR i FROM 1 TO n:
    sum = sum + i
END FOR
PRINT sum
${F}

## Key Takeaway

Loops repeat code. Use ${t('for')} when you know how many times, and ${t('while')} when the end depends on a condition. Every loop needs a way to stop — an infinite loop is a loop that never ends, and it will freeze your program.`;

const sub2 = {
  title: 'Loops',
  slug: 'loops',
  lessonSlug: 'control-flow',
  order: 1,
  description: 'Learn how for and while loops repeat code — and when to use each. Loops are how programs handle repetitive tasks like processing the digits of a number.',
  explanation: sub2Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Loops\n');
push('```json');
push(JSON.stringify(sub2, null, 2));
push('```\n');

// --- Subtopic 3: Loop Control (break/continue) ---
const sub3Explain = `## What is Loop Control?

Loops are powerful, but sometimes you want to take control mid-flight. Two statements let you do that: **break** and **continue**. They are the steering wheel of your loop.

## break — Stop the Entire Loop

${t('break')} immediately ends the loop. The rest of the iterations are skipped and execution moves on to the code after the loop.

${F}
FOR i FROM 1 TO 10:
    IF i == 5 THEN
        BREAK
    END IF
    PRINT i
END FOR

# prints: 1 2 3 4   (the loop stops at 5)
${F}

## continue — Skip Just One Iteration

${t('continue')} skips the **rest of the current iteration** and jumps straight to the next one. The loop keeps running — only the current round is skipped.

${F}
FOR i FROM 1 TO 5:
    IF i == 3 THEN
        CONTINUE
    END IF
    PRINT i
END FOR

# prints: 1 2 4 5   (3 is skipped)
${F}

## break vs continue

| Keyword | Effect |
|---|---|
| ${t('break')} | Ends the whole loop completely |
| ${t('continue')} | Skips only the current iteration |

## Real-World Analogies

- **break** — searching a book for a word: the moment you find it, you stop reading the rest of the pages.
- **continue** — checking a class list: you skip the absent students but keep going through the rest.

## Pseudocode — Using Both Together

${F}
FOR each student IN class:
    IF student is absent THEN
        CONTINUE            # skip this student, no grade to record
    END IF
    IF student is the topper THEN
        BREAK               # no need to check the rest
    END IF
    record_grade(student)
END FOR
${F}

## Key Takeaway

${t('break')} ends a loop completely; ${t('continue')} skips only the current iteration. Use them to avoid wasted work and keep your loop logic clean — they are small tools that make loops far more flexible.`;

const sub3 = {
  title: 'Loop Control',
  slug: 'loop-control',
  lessonSlug: 'control-flow',
  order: 2,
  description: 'Learn how break and continue give you fine control inside loops — stopping the loop early or skipping a single iteration.',
  explanation: sub3Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Loop Control (break/continue)\n');
push('```json');
push(JSON.stringify(sub3, null, 2));
push('```\n');
hr();

// ──────────────────────────────────────────────
// PROBLEMS + QUIZZES
// ──────────────────────────────────────────────
push('## Problems (2)\n');

// Helper: problem JSON
function problemJson(p) {
  push('```json');
  push(JSON.stringify(p, null, 2));
  push('```\n');
}

function quizJson(q) {
  push('**Quiz — 5 MCQs**\n');
  push('```json');
  push(JSON.stringify({ questions: q }, null, 2));
  push('```\n');
}

// ===== Problem 1: Sum of Digits =====
const prob1 = {
  title: 'Sum of Digits',
  slug: 'sum-of-digits',
  lessonSlug: 'control-flow',
  subtopicSlug: 'loops',
  difficulty: 'easy',
  topics: ['Loops', 'Math', 'Basics'],
  companies: ['Amazon', 'Google', 'Microsoft'],
  problemStatement: `Given a non-negative integer, return the sum of its digits.

For example, the digits of 123 are 1, 2, and 3, so the sum is 1 + 2 + 3 = 6.

You must NOT convert the number to a string — work with it as a number using a loop.`,
  examples: [
    { input: 'n = 123', output: '6', explanation: '1 + 2 + 3 = 6.' },
    { input: 'n = 4567', output: '22', explanation: '4 + 5 + 6 + 7 = 22.' },
    { input: 'n = 9', output: '9', explanation: 'A single digit — its sum is itself.' },
    { input: 'n = 0', output: '0', explanation: 'Zero has no digits to add.' }
  ],
  constraints: [
    'n is a non-negative integer up to 10^9.',
    'Do not convert the number to a string.',
    'Use loops and arithmetic only.'
  ],
  approach: `## Understanding the Problem

We need to extract each digit from the number and add them all up. There is a neat trick that makes this easy:

- ${t('number MOD 10')} gives the **last digit** (the remainder when dividing by 10).
- ${t('number DIV 10')} **removes the last digit** (integer division by 10).

Repeat these two steps until the number becomes 0, and you have visited every digit.

## The Loop Idea

1. Start a total at 0.
2. While the number is greater than 0:
   - Extract the last digit: ${t('digit = number MOD 10')}
   - Add it to the total: ${t('total = total + digit')}
   - Remove the last digit: ${t('number = number DIV 10')}
3. Return the total.

## Step-by-Step Trace on n = 4567

${F}
number = 4567, total = 0
-> digit = 7, total = 7,  number = 456
-> digit = 6, total = 13, number = 45
-> digit = 5, total = 18, number = 4
-> digit = 4, total = 22, number = 0  -> stop

Answer: 22 ✅
${F}

## Pseudocode

${F}
FUNCTION sum_of_digits(number):
    total = 0
    WHILE number > 0:
        digit = number MOD 10
        total = total + digit
        number = number DIV 10
    RETURN total
${F}

## Complexity Analysis

- **Time Complexity: O(d)** where d is the number of digits — each digit is visited exactly once.
- **Space Complexity: O(1)** — only a couple of variables, no extra storage.`,
  codeBlocks: [
    {
      language: 'python',
      code: 'def sum_of_digits(n):\n    total = 0\n    while n > 0:\n        digit = n % 10          # last digit\n        total += digit\n        n //= 10                # drop last digit\n    return total\n\nprint(sum_of_digits(123))   # 6\nprint(sum_of_digits(4567))  # 22'
    },
    {
      language: 'javascript',
      code: 'function sumOfDigits(n) {\n    let total = 0;\n    while (n > 0) {\n        total += n % 10;            // add last digit\n        n = Math.floor(n / 10);     // drop last digit\n    }\n    return total;\n}\n\nconsole.log(sumOfDigits(123));   // 6\nconsole.log(sumOfDigits(4567));  // 22'
    },
    {
      language: 'java',
      code: 'public static int sumOfDigits(int n) {\n    int total = 0;\n    while (n > 0) {\n        total += n % 10;        // add last digit\n        n = n / 10;             // drop last digit\n    }\n    return total;\n}\n// sumOfDigits(123)  == 6\n// sumOfDigits(4567) == 22'
    }
  ],
  timeComplexity: 'O(d)',
  spaceComplexity: 'O(1)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz1 = [
  { text: 'Which operator extracts the last digit of a number?', options: ['% (modulo)', '/ (division)', '* (multiplication)', '- (subtraction)'], correctIndex: 0 },
  { text: 'What does integer division by 10 do to a number?', options: ['Adds a 0 at the end', 'Removes the last digit', 'Doubles the number', 'Nothing'], correctIndex: 1 },
  { text: 'What is the sum of the digits of 4567?', options: ['20', '21', '22', '23'], correctIndex: 2 },
  { text: 'When should the loop stop in sum of digits?', options: ['After 3 iterations', 'When the total reaches 10', 'When the number becomes 0', 'Never'], correctIndex: 2 },
  { text: 'What is the time complexity of sum of digits?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correctIndex: 1 }
];

push('### Sum of Digits\n');
problemJson(prob1);
quizJson(quiz1);
hr();

// ===== Problem 2: FizzBuzz =====
const prob2 = {
  title: 'FizzBuzz',
  slug: 'fizzbuzz',
  lessonSlug: 'control-flow',
  subtopicSlug: 'loop-control',
  difficulty: 'easy',
  topics: ['Loops', 'Conditionals', 'Basics'],
  companies: ['Google', 'Microsoft', 'Meta', 'Amazon'],
  problemStatement: `Write a program that prints the numbers from 1 to n, with these rules:

- For multiples of 3, print "Fizz" instead of the number.
- For multiples of 5, print "Buzz" instead of the number.
- For multiples of BOTH 3 and 5, print "FizzBuzz" instead of the number.

For example, from 1 to 15 the output is:
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz.`,
  examples: [
    { input: 'n = 5', output: '["1", "2", "Fizz", "4", "Buzz"]', explanation: '3 is a multiple of 3; 5 is a multiple of 5.' },
    { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', explanation: '15 is a multiple of both 3 and 5, so it becomes FizzBuzz.' },
    { input: 'n = 3', output: '["1", "2", "Fizz"]', explanation: '3 is the first multiple of 3.' },
    { input: 'n = 1', output: '["1"]', explanation: '1 is not a multiple of 3 or 5.' }
  ],
  constraints: [
    'n is a positive integer up to 100.',
    'Return the result as a list of strings (or print line by line).'
  ],
  approach: `## Understanding the Problem

For each number from 1 to n, we need to decide what to print based on divisibility:

- Divisible by 3 **and** 5 → "FizzBuzz"
- Divisible by 3 only → "Fizz"
- Divisible by 5 only → "Buzz"
- Otherwise → the number itself

## The Order of Checks Matters!

The "both" case must be checked **first**. Why? Because 15 is divisible by 3 — if you check "divisible by 3" first, then 15 matches that rule and prints "Fizz", which is wrong. The most specific case always comes first.

## The Loop Idea

1. Loop i from 1 to n.
2. If ${t('i MOD 15 == 0')} → "FizzBuzz"  (15 = 3 × 5, so divisible by both)
3. Else if ${t('i MOD 3 == 0')} → "Fizz"
4. Else if ${t('i MOD 5 == 0')} → "Buzz"
5. Else → the number itself as a string.

## Why Check ${t('i MOD 15 == 0')}?

A number is divisible by both 3 and 5 exactly when it is divisible by their product, 15. Checking ${t('MOD 15')} is the cleanest way to catch the "both" case in one step.

## Pseudocode

${F}
FUNCTION fizz_buzz(n):
    result = empty list
    FOR i FROM 1 TO n:
        IF i MOD 15 == 0 THEN
            result.add("FizzBuzz")
        ELSE IF i MOD 3 == 0 THEN
            result.add("Fizz")
        ELSE IF i MOD 5 == 0 THEN
            result.add("Buzz")
        ELSE
            result.add(STRING(i))
        END IF
    END FOR
    RETURN result
${F}

## Complexity Analysis

- **Time Complexity: O(n)** — a single pass over the numbers 1 to n.
- **Space Complexity: O(n)** — the result list holds n strings (O(1) if printing on the fly).`,
  codeBlocks: [
    {
      language: 'python',
      code: 'def fizz_buzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:            # divisible by 3 AND 5\n            result.append("FizzBuzz")\n        elif i % 3 == 0:\n            result.append("Fizz")\n        elif i % 5 == 0:\n            result.append("Buzz")\n        else:\n            result.append(str(i))\n    return result\n\nprint(fizz_buzz(15))'
    },
    {
      language: 'javascript',
      code: 'function fizzBuzz(n) {\n    const result = [];\n    for (let i = 1; i <= n; i++) {\n        if (i % 15 === 0) result.push("FizzBuzz");\n        else if (i % 3 === 0) result.push("Fizz");\n        else if (i % 5 === 0) result.push("Buzz");\n        else result.push(String(i));\n    }\n    return result;\n}\n\nconsole.log(fizzBuzz(15));'
    },
    {
      language: 'java',
      code: 'public static List<String> fizzBuzz(int n) {\n    List<String> result = new ArrayList<>();\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) result.add("FizzBuzz");\n        else if (i % 3 == 0) result.add("Fizz");\n        else if (i % 5 == 0) result.add("Buzz");\n        else result.add(String.valueOf(i));\n    }\n    return result;\n}'
    }
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz2 = [
  { text: 'What should print for the number 15?', options: ['Fizz', 'Buzz', 'FizzBuzz', '15'], correctIndex: 2 },
  { text: 'Why must the "both" case be checked first?', options: ['Because it is the rarest case', 'Because 15 is divisible by 3, so it would wrongly print Fizz', 'Because the loop is faster that way', 'It does not matter'], correctIndex: 1 },
  { text: 'What does i % 15 == 0 check?', options: ['Divisible by 3 only', 'Divisible by 5 only', 'Divisible by both 3 and 5', 'Divisible by 15 only when i is even'], correctIndex: 2 },
  { text: 'For n = 5, what is the correct output?', options: ['1, 2, Fizz, 4, Buzz', '1, 2, 3, 4, 5', 'Fizz, Buzz, Fizz, Buzz, FizzBuzz', '1, 2, Fizz, Buzz, Fizz'], correctIndex: 0 },
  { text: 'What is the time complexity of FizzBuzz?', options: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], correctIndex: 1 }
];

push('### FizzBuzz\n');
problemJson(prob2);
quizJson(quiz2);

// ──────────────────────────────────────────────
// SUMMARY
// ──────────────────────────────────────────────
hr();
push('## Summary\n');
push('');
push('| Entity | Count |');
push('|---|---|');
push('| Categories | 0 of 7 (same category: Programming Foundations) |');
push('| Lessons | 2 of 18 (order 1 in category) |');
push('| Subtopics | 3 of 48 |');
push('| Problems | 2 of 29 |');
push('| Quizzes | 2 of 29 |');

// Write file
fs.writeFileSync('server/programming-content/next.md', lines.join('\n'), 'utf8');
console.log('Wrote next.md —', lines.join('\n').length, 'chars,', lines.length, 'lines');
