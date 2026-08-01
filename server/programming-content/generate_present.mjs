import fs from 'fs';

/* ── NOTE: run this from the PROJECT ROOT (writes server/programming-content/present.md).
 *   node server/programming-content/generate_present.mjs
 * Then generate the seed with:  node server/programming-content/generate_seed.mjs present.md
 * And run it from server/:     cd server && node programming-content/seed_<lesson>.mjs */

const lines = [];
const push = s => lines.push(s);
const hr = () => push('\n---\n');

// ──────────────────────────────────────────────
// HEADER
// ──────────────────────────────────────────────
push('# Present Programming Content — Variables, Data Types & Operators\n');
push('> First lesson of the Programming curriculum. Category: `programming-foundations`, order 0.');
push('> 3 subtopics · 2 problems · 2 quizzes\n');
hr();

// ──────────────────────────────────────────────
// CATEGORY
// ──────────────────────────────────────────────
push('## Category\n');
push('- Order: 0');
push('- Name: Programming Foundations');
push('- Slug: `programming-foundations`\n');
hr();

// ──────────────────────────────────────────────
// LESSON
// ──────────────────────────────────────────────
const lesson = {
  title: 'Variables, Data Types & Operators',
  slug: 'variables-data-types-operators',
  category: 'programming-foundations',
  description: 'Start here — learn how programs store and manipulate data. Master variables, the fundamental data types (integers, floats, strings, booleans), how to convert between them, and the operators that combine values into expressions.',
  image: '',
  icon: 'Braces',
  order: 0,
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

// --- Subtopic 1: Variables & Data Types ---
const sub1Explain = `## What is a Variable?

A **variable** is a named container that stores a value in your program's memory. Think of it as a labeled box: the label is the variable's name, and whatever you put inside the box is its value. You can read what's in the box anytime, and you can replace its contents with something new.

\`\`\`
name = "Aarav"    # a box labelled "name" holding the text "Aarav"
age  = 21         # a box labelled "age" holding the number 21
\`\`\`

## Why Variables Exist

Without variables, you would have to re-type every value every time you used it. Variables let you:

✅ **Store** a value once and reuse it many times
✅ **Name** data so your code reads like a story, not a mystery
✅ **Change** a value at runtime — e.g. a score that goes up as the user plays
✅ **Remember** intermediate results while solving a problem

## Rules for Naming Variables

Good names make code readable. Most languages agree on these rules:

- Start with a **letter or underscore** (never a digit)
- Use only **letters, digits, and underscores** after the first character
- Be **case-sensitive** — \`age\` and \`Age\` are different variables
- Choose **descriptive names** — \`studentCount\` beats \`x\`
- Use \`camelCase\` or \`snake_case\` consistently (Python favours snake_case)

## What is a Data Type?

A **data type** tells the computer two things about a value: what kind of data it is, and what operations are legal on it. You cannot meaningfully "add" two strings the same way you add two numbers, so the type tells the language how to behave.

## The Four Core Data Types

Every language has these four in some form:

### 1. Integer (\`int\`)
A whole number — no fraction part. Can be positive, negative, or zero.

\`\`\`
42   -7   0   1000000
\`\`\`

### 2. Float (\`float\`)
A number with a fractional part (a "decimal point" number). Used whenever precision with decimals matters.

\`\`\`
3.14   -0.5   2.0   99.99
\`\`\`

### 3. String (\`str\`)
A sequence of characters — text. Always wrapped in quotes ('single' or "double" depending on the language).

\`\`\`
"hello"   "TheWebytes"   "42"   ""
\`\`\`

> Note: \`"42"\` is a string, NOT the number 42. They behave differently in arithmetic — this is a classic source of bugs (see Type Conversion).

### 4. Boolean (\`bool\`)
Only two possible values: \`True\` or \`False\` (in some languages \`true\`/\`false\`). Used to make decisions.

\`\`\`
True   False
\`\`\`

## Type Comparison Table

| Type | Stores | Example | Common operations |
|---|---|---|---|
| int | Whole numbers | \`25\` | +, -, *, /, //, % |
| float | Decimal numbers | \`2.5\` | +, -, *, / |
| string | Text | \`"hi"\` | + (concat), len(), slicing |
| bool | True/False | \`True\` | and, or, not, comparisons |

## Checking a Variable's Type

You can ask a variable what type it holds instead of guessing:

\`\`\`python
age = 21
print(type(age))   # <class 'int'>

name = "Aarav"
print(type(name))  # <class 'str'>
\`\`\`

## Key Takeaway

A variable is a named box that stores a value. Every value has a **data type** — int, float, string, or bool — that decides what you can do with it. Always pick clear names and know the type of every value you store, because "what kind of data is this?" is the first question you must answer before writing any logic.`;

const sub1 = {
  title: 'Variables & Data Types',
  slug: 'variables-data-types',
  lessonSlug: 'variables-data-types-operators',
  order: 0,
  description: 'Learn what variables are, how they store values in memory, and the core data types — integers, floats, strings, and booleans — that every program is built on.',
  explanation: sub1Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Variables & Data Types\n');
push('```json');
push(JSON.stringify(sub1, null, 2));
push('```\n');

// --- Subtopic 2: Type Conversion ---
const sub2Explain = `## What is Type Conversion?

**Type conversion** (also called **casting**) means changing a value from one data type to another — turning the string \`"42"\` into the integer \`42\`, or the integer \`42\` into the float \`42.0\`.

Why does this matter? Because the same data can arrive in different forms. A user's age arrives as a string from a form (\`"21"\`). A file stores prices as text. Before you can do arithmetic with those values, you often need to convert them into numbers.

\`\`\`python
age_text = "21"          # string
age = int(age_text)      # convert to integer -> 21
print(age + 1)           # 22  (would crash without conversion!)
\`\`\`

## Implicit vs Explicit Conversion

### Implicit (automatic)
The language converts types for you, automatically, when it is safe to do so. Example: adding an integer and a float. The integer is quietly promoted to a float so the arithmetic is exact.

\`\`\`python
result = 3 + 0.5     # 3 becomes 3.0 automatically
print(result)        # 3.5  (float)
\`\`\`

### Explicit (manual)
You tell the language to convert, using a conversion function. You MUST do this when the automatic rules don't apply — e.g. a string can never be implicitly turned into a number.

\`\`\`python
# Explicit conversions
int("42")        # -> 42
float("3.14")    # -> 3.14
str(100)         # -> "100"
\`\`\`

## The Common Conversions

| You have | You want | Convert with (Python) | Convert with (JS) | Convert with (Java) |
|---|---|---|---|---|
| string -> int | \`"42"\` -> \`42\` | \`int("42")\` | \`parseInt("42", 10)\` | \`Integer.parseInt("42")\` |
| string -> float | \`"3.14"\` -> \`3.14\` | \`float("3.14")\` | \`parseFloat("3.14")\` | \`Double.parseDouble("3.14")\` |
| int -> float | \`42\` -> \`42.0\` | \`float(42)\` | \`Number(42)\` | \`(double) 42\` |
| number -> string | \`42\` -> \`"42"\` | \`str(42)\` | \`String(42)\` | \`String.valueOf(42)\` |

## The Danger Zone: Strings That Look Like Numbers

The string \`"42"\` looks like a number, but it is NOT one. The moment you forget this:

\`\`\`javascript
let price = "10";          // string!
console.log(price + 5);    // "105"  — string concatenation, not addition!
\`\`\`

In JavaScript the \`+\` operator concatenates strings, silently producing \`"105"\` instead of \`15\`. This is the #1 type-conversion bug. Convert first, then compute:

\`\`\`javascript
let price = Number("10");  // number 10
console.log(price + 5);    // 15 ✅
\`\`\`

## What Happens When Conversion Fails?

If the text cannot be converted, the conversion throws an error (or returns a special "not a number" value in JavaScript). Always guard against bad input:

\`\`\`python
def safe_int(text):
    try:
        return int(text)
    except ValueError:
        return None   # or 0 — your choice for the problem
\`\`\`

## Key Takeaway

Type conversion changes a value from one type to another — use \`int()\`, \`float()\`, \`str()\`, \`parseInt()\`, \`Number()\`, etc. The language converts automatically when it's safe, but **strings never become numbers automatically**. Convert explicitly, handle bad input gracefully, and you will avoid the classic "looks like a number but is text" bug.`;

const sub2 = {
  title: 'Type Conversion',
  slug: 'type-conversion',
  lessonSlug: 'variables-data-types-operators',
  order: 1,
  description: 'Learn how to convert a value from one data type to another — implicit vs explicit conversion, the common pitfalls when strings meet numbers, and how to handle failed conversions safely.',
  explanation: sub2Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Type Conversion\n');
push('```json');
push(JSON.stringify(sub2, null, 2));
push('```\n');

// --- Subtopic 3: Operators & Expressions (theory only) ---
const sub3Explain = `## What is an Operator?

An **operator** is a symbol that tells the computer to perform a specific operation on one or more values. The values an operator works on are called **operands**.

\`\`\`
5 + 3     # "+" is the operator, 5 and 3 are the operands
a == b    # "==" checks whether a and b are equal
\`\`\`

## What is an Expression?

An **expression** is any combination of values, variables, and operators that produces a result. A single value is the simplest expression; \`5 + 3\` is a slightly bigger one. Expressions can be assigned to variables, printed, or used inside larger expressions.

\`\`\`python
total = price + tax          # price + tax is an expression
has_discount = total < 1000  # comparison expression -> bool
\`\`\`

## The Four Operator Families

### 1. Arithmetic Operators (numbers in, numbers out)

| Operator | Meaning | Example | Result |
|---|---|---|---|
| + | Addition | \`7 + 3\` | \`10\` |
| - | Subtraction | \`7 - 3\` | \`4\` |
| * | Multiplication | \`7 * 3\` | \`21\` |
| / | Division | \`7 / 2\` | \`3.5\` |
| // | Integer division | \`7 // 2\` | \`3\` |
| % | Modulo (remainder) | \`7 % 2\` | \`1\` |
| ** | Exponent | \`2 ** 3\` | \`8\` |

### 2. Comparison Operators (numbers/text in, bool out)

| Operator | Meaning | Example | Result |
|---|---|---|---|
| == | Equal to | \`5 == 5\` | \`True\` |
| != | Not equal | \`5 != 3\` | \`True\` |
| > | Greater than | \`5 > 3\` | \`True\` |
| < | Less than | \`5 < 3\` | \`False\` |
| >= | Greater or equal | \`5 >= 5\` | \`True\` |
| <= | Less or equal | \`5 <= 3\` | \`False\` |

### 3. Logical Operators (bools in, bool out)

| Operator | Meaning | Example | Result |
|---|---|---|---|
| and | Both must be true | \`True and False\` | \`False\` |
| or | At least one true | \`True or False\` | \`True\` |
| not | Flip the value | \`not True\` | \`False\` |

### 4. Assignment Operators (store a result)

| Operator | Meaning | Example | Equivalent to |
|---|---|---|---|
| = | Assign | \`x = 5\` | — |
| += | Add and assign | \`x += 3\` | \`x = x + 3\` |
| -= | Subtract and assign | \`x -= 2\` | \`x = x - 2\` |
| *= | Multiply and assign | \`x *= 2\` | \`x = x * 2\` |
| /= | Divide and assign | \`x /= 2\` | \`x = x / 2\` |

## Operator Precedence — Who Goes First?

When an expression has many operators, the language evaluates them in a fixed order — just like maths (BODMAS/PEMDAS):

1. Parentheses \`( )\` — highest priority
2. Exponents \`**\`
3. Multiplication, Division, Modulo \`* / // %\`
4. Addition, Subtraction \`+ -\`
5. Comparisons \`== != > < >= <=\`
6. Logical \`not\` → \`and\` → \`or\`
7. Assignment \`=\` — last

\`\`\`python
result = 2 + 3 * 4        # 3*4=12, then 2+12 -> 14
result2 = (2 + 3) * 4     # parentheses first -> 5*4 = 20
\`\`\`

**Golden rule:** when in doubt, use parentheses. They cost nothing and make your intent obvious.

## Key Takeaway

Operators are the verbs of programming — they combine values into **expressions** that produce results. Master the four families (arithmetic, comparison, logical, assignment), respect **precedence** (or use parentheses), and remember: comparisons and logical operators always produce a boolean, which is exactly what you need to make decisions in code.`;

const sub3 = {
  title: 'Operators & Expressions',
  slug: 'operators-expressions',
  lessonSlug: 'variables-data-types-operators',
  order: 2,
  description: 'Learn how operators combine values into expressions — arithmetic, comparison, logical, and assignment operators — and the precedence rules that decide the order of evaluation.',
  explanation: sub3Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Operators & Expressions (theory only)\n');
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

// ===== Problem 1: Swap Two Variables =====
const prob1 = {
  title: 'Swap Two Variables',
  slug: 'swap-two-variables',
  lessonSlug: 'variables-data-types-operators',
  subtopicSlug: 'variables-data-types',
  difficulty: 'easy',
  topics: ['Variables', 'Basics'],
  companies: ['Google', 'Microsoft', 'Amazon'],
  problemStatement: `You are given two integer variables a and b. Swap their values so that a ends up holding b's original value and b ends up holding a's original value.

You may use a single temporary variable, but you must NOT use any array, list, or other data structure.

For example, if a = 5 and b = 10, after swapping a must be 10 and b must be 5.`,
  examples: [
    { input: 'a = 5, b = 10', output: 'a = 10, b = 5', explanation: 'The values exchange places: a takes 10, b takes 5.' },
    { input: 'a = -3, b = 7', output: 'a = 7, b = -3', explanation: 'Negative values swap exactly the same way as positive ones.' },
    { input: 'a = 0, b = 0', output: 'a = 0, b = 0', explanation: 'Equal values — after swapping, both are still 0.' },
    { input: 'a = 100, b = 1', output: 'a = 1, b = 100', explanation: 'Order fully reverses regardless of which value is bigger.' }
  ],
  constraints: [
    'a and b are integers.',
    'Only assignment and arithmetic operations are allowed.',
    'No arrays, lists, or other data structures may be used.'
  ],
  approach: `## Understanding the Problem

We need two variables to exchange their values. The naive mistake is writing:

\`\`\`
a = b
b = a
\`\`\`

That does NOT swap — the first line overwrites a, so by the time the second line runs, a no longer holds its original value. Both end up holding b's value. We need to save the original value BEFORE overwriting it.

## Approach 1: Temporary Variable (the reliable classic)

1. Copy a into a temp variable: \`temp = a\`
2. Overwrite a with b: \`a = b\`
3. Put the saved original back into b: \`b = temp\`

\`\`\`
Start:   a = 5   b = 10
Step 1:  temp = 5
Step 2:  a = 10
Step 3:  b = 5
Done:    a = 10  b = 5  ✅
\`\`\`

This works in every language and is impossible to get wrong. It uses exactly one extra variable — which the problem allows.

## Approach 2: Parallel Assignment / Destructuring

Many languages let you swap in one line — the right-hand side is evaluated first, then both assignments happen together:

\`\`\`python
a, b = b, a
\`\`\`

\`\`\`javascript
[a, b] = [b, a];
\`\`\`

Because the right side is computed fully before any assignment, the original values are never lost. Clean and readable — but requires language support.

## Approach 3: Arithmetic Trick (no temp at all)

\`\`\`
a = a + b
b = a - b
a = a - b
\`\`\`

\`\`\`
Start:  a=5 b=10
Step 1: a=15 (5+10)
Step 2: b=5  (15-10) -> b now holds old a ✅
Step 3: a=10 (15-5)  -> a now holds old b ✅
\`\`\`

Works, but only for numbers, and can overflow in languages with fixed-size integers. It is a fun trick — not something you need in production code.

## Complexity Analysis

- **Time Complexity: O(1)** — a fixed number of operations regardless of the values.
- **Space Complexity: O(1)** — at most one temporary variable.`,
  codeBlocks: [
    {
      language: 'python',
      code: '# Approach 1: temporary variable (works everywhere)\ndef swap_temp(a, b):\n    temp = a\n    a = b\n    b = temp\n    return a, b\n\n# Approach 2: parallel assignment (Pythonic)\ndef swap_pythonic(a, b):\n    a, b = b, a\n    return a, b\n\nprint(swap_pythonic(5, 10))  # (10, 5)'
    },
    {
      language: 'javascript',
      code: '// Approach 1: temporary variable\nfunction swapTemp(a, b) {\n    let temp = a;\n    a = b;\n    b = temp;\n    return [a, b];\n}\n\n// Approach 2: destructuring assignment\nfunction swapDestructure(a, b) {\n    [a, b] = [b, a];\n    return [a, b];\n}\n\nconsole.log(swapDestructure(5, 10));  // [10, 5]'
    },
    {
      language: 'java',
      code: '// Java primitives are passed by value, so the swap\n// must return the new pair (or use a 2-element array).\npublic static int[] swap(int a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n    return new int[] { a, b };  // {10, 5}\n}'
    }
  ],
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(1)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz1 = [
  { text: 'What is a variable?', options: ['A fixed number that never changes', 'A named container that stores a value in memory', 'A type of loop', 'A special character'], correctIndex: 1 },
  { text: 'Which of these is NOT one of the four core data types?', options: ['Integer', 'Float', 'Array', 'Boolean'], correctIndex: 2 },
  { text: 'Which data type does the value "42" (with quotes) belong to?', options: ['Integer', 'Float', 'Boolean', 'String'], correctIndex: 3 },
  { text: 'Why is a single temporary variable enough to swap two values?', options: ['Because we only read the values', 'Because it preserves the original value before it is overwritten', 'Because the computer swaps values automatically', 'Because integers are small'], correctIndex: 1 },
  { text: 'What is the time complexity of swapping two variables?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correctIndex: 2 }
];

push('### Swap Two Variables\n');
problemJson(prob1);
quizJson(quiz1);
hr();

// ===== Problem 2: Convert Between Data Types =====
const prob2 = {
  title: 'Convert Between Data Types',
  slug: 'convert-between-data-types',
  lessonSlug: 'variables-data-types-operators',
  subtopicSlug: 'type-conversion',
  difficulty: 'easy',
  topics: ['Type Conversion', 'Basics'],
  companies: ['Amazon', 'Google', 'Meta'],
  problemStatement: `Write a function that safely converts a string of digits into an integer.

The input string may contain:
- Optional leading or trailing spaces
- An optional sign (+ or -)
- Digits

If the string represents a valid integer, return it as an integer. If it is NOT a valid integer (e.g. contains letters, decimals, or is empty), return 0.

For example, "42" returns 42, "  -7  " returns -7, and "abc" returns 0.`,
  examples: [
    { input: '"42"', output: '42', explanation: 'Plain digits convert directly to the integer 42.' },
    { input: '"  -7  "', output: '-7', explanation: 'Spaces are ignored and the negative sign is respected.' },
    { input: '"+13"', output: '13', explanation: 'An explicit plus sign is allowed and ignored.' },
    { input: '"3.14"', output: '0', explanation: 'A decimal is not an integer — return 0, not a crash.' },
    { input: '"abc"', output: '0', explanation: 'Non-digit characters make the conversion invalid — return 0.' }
  ],
  constraints: [
    'The string length is between 0 and 10,000 characters.',
    'The string contains only spaces, an optional sign, and digits (for valid inputs).',
    'If conversion fails, return 0 instead of throwing an error.'
  ],
  approach: `## Understanding the Problem

We must turn text that represents a number into an actual integer, and fail gracefully when the text is not a valid integer. This is a daily real-world task: forms, files, and APIs deliver numbers as strings.

## Why "Fail Gracefully" Matters

A naive call to the built-in conversion function throws an error (or returns a special NaN value in JavaScript) when the input is invalid. The problem wants 0 in those cases so the program never crashes.

## Approach 1: Built-in Conversion + Safe Guard

1. Strip leading/trailing whitespace from the string.
2. Try to convert with the language's integer parser.
3. If it throws (or reports "not a number"), return 0.
4. Otherwise return the parsed integer.

\`\`\`python
def to_int(s):
    try:
        return int(s.strip())   # int() already handles the sign
    except ValueError:
        return 0
\`\`\`

Note: \`int("3.14")\` raises ValueError (a decimal is not an integer), so it correctly falls back to 0.

## Approach 2: Manual Parsing (no built-in)

Sometimes the problem forbids built-in converters. Build the number yourself:

1. Trim spaces.
2. If the string is empty, return 0.
3. Check the first character for + or - and remember the sign.
4. Walk the remaining characters: if any is not a digit (0-9), return 0.
5. Accumulate: \`result = result * 10 + digit\` for each digit.
6. Apply the sign at the end.

\`\`\`
"  -7  " -> trim -> "-7" -> sign = -1 -> digit 7
         -> result = 0*10 + 7 = 7 -> return -1 * 7 = -7 ✅
\`\`\`

This teaches you what the built-in function actually does under the hood.

## Complexity Analysis

- **Time Complexity: O(n)** — each character is examined once.
- **Space Complexity: O(1)** — only a few variables, no extra storage.

## Edge Cases to Handle

- Empty string \`""\` → 0
- Only spaces \`"   "\` → 0
- Sign with no digits \`"-"\` → 0
- Decimals \`"3.14"\` → 0
- Letters \`"12abc"\` → 0
- Very long strings → still handled in O(n)`,
  codeBlocks: [
    {
      language: 'python',
      code: 'def convert_to_int(s):\n    s = s.strip()\n    # Empty or sign-only input is invalid\n    if not s or s in ("+", "-"):\n        return 0\n    # Manual parse: digits only\n    start = 1 if s[0] in "+-" else 0\n    result = 0\n    for ch in s[start:]:\n        if not ch.isdigit():\n            return 0\n        result = result * 10 + int(ch)\n    return -result if s[0] == "-" else result\n\nprint(convert_to_int("42"))     # 42\nprint(convert_to_int("  -7  ")) # -7\nprint(convert_to_int("abc"))    # 0'
    },
    {
      language: 'javascript',
      code: 'function convertToInt(s) {\n    const trimmed = s.trim();\n    // Empty or sign-only input is invalid\n    if (!trimmed || trimmed === "+" || trimmed === "-") return 0;\n    // Manual parse: digits only\n    let start = (trimmed[0] === "+" || trimmed[0] === "-") ? 1 : 0;\n    let result = 0;\n    for (let i = start; i < trimmed.length; i++) {\n        const ch = trimmed[i];\n        if (ch < "0" || ch > "9") return 0;\n        result = result * 10 + (ch.charCodeAt(0) - 48);\n    }\n    return trimmed[0] === "-" ? -result : result;\n}\n\nconsole.log(convertToInt("42"));      // 42\nconsole.log(convertToInt("  -7  "));  // -7\nconsole.log(convertToInt("abc"));     // 0'
    },
    {
      language: 'java',
      code: 'public static int convertToInt(String s) {\n    String t = s.trim();\n    // Empty or sign-only input is invalid\n    if (t.isEmpty() || t.equals("+") || t.equals("-")) return 0;\n    int start = (t.charAt(0) == \'+\' || t.charAt(0) == \'-\') ? 1 : 0;\n    int result = 0;\n    for (int i = start; i < t.length(); i++) {\n        char ch = t.charAt(i);\n        if (ch < \'0\' || ch > \'9\') return 0;   // invalid character\n        result = result * 10 + (ch - \'0\');\n    }\n    return (t.charAt(0) == \'-\') ? -result : result;\n}'
    }
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz2 = [
  { text: 'What does the string "42" become after int("42")?', options: ['The string "42" again', 'The integer 42', '42.0 (float)', 'Nothing — it errors'], correctIndex: 1 },
  { text: 'Which of these inputs should return 0 for a safe string-to-int converter?', options: ['"42"', '"-7"', '"3.14"', '"+13"'], correctIndex: 2 },
  { text: 'In JavaScript, what does "10" + 5 produce?', options: ['15 (number)', '105 (string)', 'An error', '10.5'], correctIndex: 1 },
  { text: 'Why does the temporary-variable approach avoid the a = b; b = a bug?', options: ['It uses two temp variables', 'It saves the original value before overwriting it', 'It sorts the values first', 'It does not use assignment'], correctIndex: 1 },
  { text: 'What is the space complexity of converting a string to an integer manually?', options: ['O(n) — a new string is created', 'O(n^2)', 'O(log n)', 'O(1) — only a few variables'], correctIndex: 3 }
];

push('### Convert Between Data Types\n');
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
push('| Lessons | 1 of 18 (order 0 in category) |');
push('| Subtopics | 3 of 48 |');
push('| Problems | 2 of 29 |');
push('| Quizzes | 2 of 29 |');

// Write file
fs.writeFileSync('server/programming-content/present.md', lines.join('\n'), 'utf8');
console.log('Wrote present.md —', lines.join('\n').length, 'chars,', lines.length, 'lines');
