import fs from 'fs';

/* ── NOTE: run this from the PROJECT ROOT (writes server/programming-content/next.md).
 *   node server/programming-content/generate_functions-scope.mjs
 * Then generate the seed with:  node server/programming-content/generate_seed.mjs next.md
 * And run it from server/:     cd server && node programming-content/seed_functions-scope.mjs */

const lines = [];
const push = s => lines.push(s);
const hr = () => push('\n---\n');

const F = '```'; // triple-backtick fence
const t = s => '`' + s + '`'; // inline code: `foo`

// ──────────────────────────────────────────────
// HEADER
// ──────────────────────────────────────────────
push('# Next Programming Content — Functions & Scope\n');
push('> Third lesson of the Programming curriculum. Category: `programming-foundations`, order 2.');
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
  title: 'Functions & Scope',
  slug: 'functions-scope',
  category: 'programming-foundations',
  description: 'Learn how to package code into functions — named recipes you can call anytime — how parameters and return values pass data in and out, and how variable scope decides what each part of your program can see.',
  image: '',
  icon: 'FunctionSquare',
  order: 2,
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

// --- Subtopic 1: Defining Functions (theory only) ---
const sub1Explain = `## The Simple Idea — A Function Is a Recipe

A **function** is a named block of code that you write once and run as many times as you like. Think of it as a cooking recipe: the recipe doesn't make the dish by itself — you have to *follow* it. Calling the function is "following the recipe".

${F}
def make_chai(milk, sugar):     ${t('← PART 1: the header (name + ingredients)')}
    boil(milk)                  ${t('← PART 2: the body (the steps, indented)')}
    add(sugar)
    return cup                  ${t('← PART 3: the dish (what comes out)')}
${F}

### The Recipe Anatomy (Memorise the Three Parts)

| Part | Name | What it is | In the recipe |
|---|---|---|---|
| ${t('def name(ingredients):')} | **Header** | The recipe's name + what it needs | ${t('def make_chai(milk, sugar):')} |
| indented lines | **Body** | The steps, run top-to-bottom | ${t('boil(milk)')} / ${t('add(sugar)')} |
| ${t('return value')} | **Dish** | The result handed back to the caller | ${t('return cup')} |

### Why Functions Exist — The 4 P's

✅ **Package** — write the logic once, call it from a hundred places
✅ **Protect** — fix a bug in one place and every caller benefits
✅ **Puzzle-ize** — split a huge problem into small, testable pieces
✅ **Prove** — test one recipe at a time instead of debugging a wall of code

> **The Golden Rule: a function does ONE job well.** If the name needs the word "and" in it (${t('get_total_and_save')}), split it in two.

### Naming a Function

Follow the same rules as variables, but make names **verb-first** — a function *does* something:

- ${t('get_total()')} — reads like an action ✅
- ${t('total')} — could be a value, not an action ❌
- ${t('is_valid()')}, ${t('calculate_area()')}, ${t('send_email()')} — all actions

### The Header Anatomy

${F}
def   calculate_area (  length,  width  )   :
 │      └── name ──┘    └params┘     │
 the keyword          inputs in     the colon
 that starts          parentheses
 the function
${F}

The body must be **indented** (convention: 4 spaces). Every line under the header belongs to the function; the first un-indented line ends it.

### Calling a Function

You call a function by its name with parentheses — and pass the values (arguments) it needs:

${F}python
def greet(name):
    print("Hello, " + name + "!")

greet("Aarav")   # Hello, Aarav!
greet("Meera")   # Hello, Meera!
${F}

Each call runs the whole body with that call's value. No need to copy-paste the greeting code anywhere.

### The Three Silent Killers

| Trap | What goes wrong | The fix |
|---|---|---|
| Missing colon after the header | Syntax error the moment the file loads | End the header with ${t(':')} |
| Body not indented | Code silently outside the function | Indent every body line 4 spaces |
| Calling before defining | ${t('NameError')} — the name is not yet defined | Define first, call after |

### Quick Self-Test (answers at the bottom)

1. The three parts of a function are — (a) name, args, return  (b) header, body, dish  (c) def, if, loop  (d) input, output, error
2. Which is the best function name? (a) ${t('x')}  (b) ${t('calculate_area')}  (c) ${t('calc')}  (d) ${t('area_only_please_123')}
3. What runs when ${t('greet("Aarav")')} is called? (a) The body with name = "Aarav"  (b) Nothing  (c) The whole file  (d) Only the header
4. The Golden Rule of functions is — (a) write as many lines as possible  (b) do ONE job well  (c) always use recursion  (d) never use parentheses
5. An un-indented body means — (a) the code is inside the function  (b) the code is outside the function  (c) a faster program  (d) an error in the header

**Answers:** 1→b, 2→b, 3→a, 4→b, 5→b.

### Key Takeaway

A function is a named recipe with three parts — header, body, dish. Write it once, call it anywhere, give it an action-name, and keep it to one job. The most common failures are boring but brutal: a missing colon, a forgotten indent, or a call before the definition.`;

const sub1 = {
  title: 'Defining Functions',
  slug: 'defining-functions',
  lessonSlug: 'functions-scope',
  order: 0,
  description: 'Learn the recipe anatomy of a function — header, body, and return value — why functions exist, and the golden rule that each function does exactly one job well.',
  explanation: sub1Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Defining Functions (theory only)\n');
push('```json');
push(JSON.stringify(sub1, null, 2));
push('```\n');

// --- Subtopic 2: Parameters & Return Values ---
const sub2Explain = `## The Simple Idea

**Parameters** are the recipe's ingredients — placeholders written in the header. **Arguments** are the actual values you hand over when you call. **${t('return')}** is the dish — the value your function sends back to the caller.

${F}python
def area(length, width):    ${t('← length, width = PARAMETERS (placeholders)')}
    return length * width

a = area(5, 3)              ${t('← 5, 3 = ARGUMENTS (the real values)')}
${F}

### The Call ↔ Parameter Handshake

Arguments bind to parameters **by position**: the 1st argument meets the 1st parameter, the 2nd meets the 2nd, and so on.

${F}
area(5, 3)   →  length = 5, width = 3   →  5 × 3 = 15
area(4, 6)   →  length = 4, width = 6   →  4 × 6 = 24
${F}

Swap the order and you hand the values to the wrong ingredients.

### The Two Doors: ${t('print')} vs ${t('return')}

The #1 beginner bug is *printing when you should return*. They are not the same:

| You want to… | Use | What happens |
|---|---|---|
| Show text on screen | ${t('print(value)')} | Side-effect; the function returns ${t('None')} |
| Hand a value back for storage/comparison | ${t('return value')} | Caller receives the actual value |

${F}python
def a():
    print(5)     # prints "5" but returns None
def b():
    return 5     # prints nothing, returns the number 5

x = a()          # x = None
y = b()          # y = 5 — the value is really captured
${F}

### Default Parameters — The Fallback Values

A **default parameter** gives a placeholder a value to use when the caller doesn't send one.

${F}python
def area(length, width=None):     # width has a fallback
    if width is None:
        width = length            # square! width defaults to length
    return length * width

area(5, 3)   # 15 — both arguments supplied
area(4)      # 16 — width falls back to 4 → square 4 × 4
${F}

### The Default-Position Rule

Defaults must come **after** required parameters. ${t('def f(a, b=2)')} is valid; ${t('def f(a=1, b)')} is a syntax error — the language can't tell what the caller meant when a required parameter sits behind an optional one.

### The Mutable-Default Trap

Never use a mutable value (an empty list ${t('[]')} or dict ${t('{}')}) as a default. It is created **once** at definition time and **shared** by every call — changes to it in one call leak into the next.

${F}python
def push(item, items=[]):    # BAD — the list is shared!
    items.append(item)
    return items

push(1)   # [1]
push(2)   # [1, 2]   ${t('← the first call list came back!')}

def push(item, items=None):  # GOOD — fresh list each call
    if items is None:
        items = []
    items.append(item)
    return items
${F}

### Worked Example — The Full Trace

${F}
area(4)          area(5, 3)
│                │
▼                ▼
length = 4       length = 5   width = 3
width = None     width = 3
└─ None? yes     └─ width given → keep 3
   width = 4         return 5 × 3 = 15
   return 4 × 4 = 16
${F}

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting ${t('return')} | Function silently returns ${t('None')} | End with ${t('return value')} |
| Reversed arguments | ${t('area(3, 5)')} swaps the meaning | Match positions: 1st→1st |
| Mutable default | Shared list/dict across calls | Default ${t('None')}, create inside |
| Too many / too few args | ${t('TypeError')} at the call | Count the parameters |

### Quick Self-Test (answers at the bottom)

1. ${t('area(5, 3)')} binds — (a) length=3, width=5  (b) length=5, width=3  (c) length=5, width=None  (d) length=None, width=None
2. A function that only ${t('print')}s a value returns — (a) the printed value  (b) ${t('None')}  (c) the string of the value  (d) an error
3. ${t('area(4)')} with ${t('width=None')} default returns — (a) 4  (b) 16  (c) 8  (d) 0
4. ${t('def foo(a=1, b)')} is — (a) valid  (b) a syntax error (default before required)  (c) valid only in Java  (d) slower
5. The mutable-default fix is — (a) default ${t('None')}, make the list inside  (b) never use lists  (c) use a global list  (d) default ${t('[]')}

**Answers:** 1→b, 2→b, 3→b, 4→b, 5→a.

### Key Takeaway

Parameters are the ingredients, arguments are the real values, and ${t('return')} is the dish the caller can actually keep. Print shows, return supplies; defaults give parameters a fallback — but they must come last and never be mutable.`;

const sub2 = {
  title: 'Parameters & Return Values',
  slug: 'parameters-return-values',
  lessonSlug: 'functions-scope',
  order: 1,
  description: 'Learn the handshake between parameters and arguments, the critical difference between print and return, and how default parameters behave — including the mutable-default trap.',
  explanation: sub2Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Parameters & Return Values\n');
push('```json');
push(JSON.stringify(sub2, null, 2));
push('```\n');

// --- Subtopic 3: Variable Scope ---
const sub3Explain = `## The Simple Idea

**Scope** is the visibility zone of a variable — the region of code where that name is in play. A variable defined inside a function is **local** (only that function can see it). A variable defined at the top level is **global** (everything can see it).

### The Scope Map

${F}
+--------------------------------------------------+
| GLOBAL ZONE  (module level)                      |
|   price = 100        ${t('← visible EVERYWHERE')}        |
|                                                  |
|   def discount():                                |
|       off = 20       ${t('← LOCAL to discount only')}    |
|       return price - off                         |
+--------------------------------------------------+
${F}

Here ${t('price')} is global — ${t('discount()')} can read it. ${t('off')} is local — nothing outside ${t('discount()')} can see it.

### The Read/Write Rule (The Crux of Scope)

- **READ a global inside a function** → perfectly allowed. The function can look out and see it.
- **ASSIGN inside a function** → creates a brand-new **local** variable, even if a global with the same name exists. This is called **shadowing**.

### The Shadow Trap

${F}python
x = 10

def change():
    x = 5          # NOT the global x — a NEW local x!
    print(x)       # 5 (inside)

change()
print(x)           # 10 (global untouched)
${F}

The assignment inside ${t('change()')} does not touch the global — it builds a shadow copy. If you *want* to modify the global inside a function you need the ${t('global')} keyword, which is rare and usually a code smell. The clean pattern is to pass values as parameters and receive the result through ${t('return')}.

### The Scope Ladder (Where a Name Is Found)

When your code uses a name, the language searches this order — first match wins:

${F}
1. LOCAL     — inside the current function
2. GLOBAL    — module level, outside any function
3. BUILT-IN  — the language's own names (print, len, ...)
${F}

### Worked Example — Factorial's Variables

In the factorial problem, ${t('n')} (the parameter) and ${t('result')} are **local** to the function. Even if a global ${t('n = 100')} exists, calling ${t('factorial(5)')} uses its own local 5 — the parameter *shadows* the global for the duration of the call, and the global is untouched afterwards.

${F}
global:  n = 100
call:    factorial(5)
         → inside: n = 5 (local copy of the parameter)
         → loop builds result = 120
         → return 120; global n stays 100
${F}

### Loops and Scope

Loop variables are **not** block-scoped in Python — ${t('i')} from a ${t('for')} loop still exists after the loop ends, inside the same function. Java *does* scope them to the loop block. Knowing this explains small surprises like reusing ${t('i')} later.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Shadowing | New local hides the global | Rename, or pass as a parameter |
| Assuming the global changed | ${t('change()')} left ${t('x')} = 10 | Use the ${t('return')} value instead |
| Reading before assigning | ${t('NameError')} inside a function | Initialise the variable first |
| Loop variable afterlife | ${t('i')} still alive after the loop | Reuse it on purpose, not by accident |

### Quick Self-Test (answers at the bottom)

1. A variable defined inside a function is — (a) global  (b) local  (c) built-in  (d) invisible
2. Reading a global inside a function is — (a) forbidden  (b) allowed  (c) only with ${t('import')}  (d) an error
3. ${t('x = 5')} inside a function where a global ${t('x')} exists — (a) changes the global  (b) creates a new local  (c) errors  (d) deletes the global
4. Search order for a name is — (a) global → local → built-in  (b) local → global → built-in  (c) built-in → local → global  (d) random
5. In Python, a loop variable after the loop ends — (a) is deleted  (b) still exists  (c) errors  (d) becomes global

**Answers:** 1→b, 2→b, 3→b, 4→b, 5→b.

### Key Takeaway

Scope is who-can-see-what: locals live inside a function, globals live at the top, and the ladder looks local-first. Reading a global is free; assigning inside a function makes a shadow copy. Pass values in, return results out — and leave the ${t('global')} keyword alone.`;

const sub3 = {
  title: 'Variable Scope',
  slug: 'variable-scope',
  lessonSlug: 'functions-scope',
  order: 2,
  description: 'Learn who-can-see-what — local vs global variables, the shadow trap where assignment builds a copy, and the scope ladder that decides where every name is found.',
  explanation: sub3Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Variable Scope\n');
push('```json');
push(JSON.stringify(sub3, null, 2));
push('```\n');
hr();

// ──────────────────────────────────────────────
// PROBLEMS + QUIZZES
// ──────────────────────────────────────────────
push('## Problems (2)\n');

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

// ===== Problem 1: Function with Default Arguments =====
const prob1 = {
  title: 'Function with Default Arguments',
  slug: 'function-with-default-arguments',
  lessonSlug: 'functions-scope',
  subtopicSlug: 'parameters-return-values',
  difficulty: 'easy',
  topics: ['Functions', 'Parameters', 'Basics'],
  companies: ['Google', 'Microsoft', 'Amazon'],
  problemStatement: `Write a function calculate_area(length, width) that returns the area of a rectangle. The width argument is OPTIONAL — when it is not passed, the shape is treated as a square, so the function must use the length as the width.

- calculate_area(5, 3) must return 15 (5 × 3)
- calculate_area(4) must return 16 (4 × 4, a square)`,
  examples: [
    { input: 'calculate_area(5, 3)', output: '15', explanation: '5 × 3 = 15 — both dimensions given.' },
    { input: 'calculate_area(4)', output: '16', explanation: 'width omitted → square: 4 × 4 = 16.' },
    { input: 'calculate_area(7, 2)', output: '14', explanation: '7 × 2 = 14 — both dimensions given.' },
    { input: 'calculate_area(10)', output: '100', explanation: 'width omitted → square: 10 × 10 = 100.' }
  ],
  constraints: [
    'length and width are positive numbers (int or float, no negatives).',
    'width may be omitted entirely — the square rule applies then.',
    'No loops or data structures — a single formula.'
  ],
  approach: `## Understanding the Problem

The twist is the *optional* dimension. When ${t('width')} is supplied, ordinary multiplication. When it's missing, the caller expects the square rule — area = length × length. The classic mistake is hard-coding a default like ${t('width = 0')}, which would turn ${t('calculate_area(4)')} into 4 × 0 = 0. The correct fallback must copy the length itself.

## The None-Guard pattern

Set the default to ${t('None')} (a value that means "nothing was passed"), then branch:

${F}
1. If width is None  →  width = length   (the square rule)
2. Return length × width
${F}

${F}
calculate_area(5, 3):
    width = 3 (given)  →  return 5 × 3 = 15 ✅

calculate_area(4):
    width = None       →  width = 4 (square rule)
                       →  return 4 × 4 = 16 ✅
${F}

## Why default None instead of 0?

${t('0')} is a real number — ${t('calculate_area(4)')} would silently answer 0 and you would never notice the caller forgot the width. ${t('None')} is a sentinel meaning "absent", so it can be told apart from any legal value.

## The default-position rule

In any language, default parameters must come after required ones (${t('width')} after ${t('length')}) — putting the fallback first is a syntax error.

## Complexity Analysis

- **Time: O(1)** — one comparison and one multiplication.
- **Space: O(1)** — a couple of numbers, nothing stored.

## Edge Cases

- ${t('calculate_area(0, 5)')} → 0 (valid: a zero area)
- ${t('calculate_area(2.5)')} → 6.25 (floats work too)
- Never use a mutable default like ${t('[]')} here — for a value function it's unnecessary and dangerous.`,
  codeBlocks: [
    {
      language: 'python',
      code: 'def calculate_area(length, width=None):\n    if width is None:        # the square rule: no width given\n        width = length\n    return length * width\n\nprint(calculate_area(5, 3))   # 15\nprint(calculate_area(4))      # 16'
    },
    {
      language: 'javascript',
      code: 'function calculateArea(length, width) {\n    if (width === undefined) width = length;  // square rule\n    return length * width;\n}\n\nconsole.log(calculateArea(5, 3));   // 15\nconsole.log(calculateArea(4));      // 16'
    },
    {
      language: 'java',
      code: 'public static double calculateArea(double length, Double width) {\n    if (width == null) width = length;   // square rule\n    return length * width;\n}\n// calculateArea(5, 3) == 15.0\n// calculateArea(4, null) == 16.0'
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
  { text: 'In calculate_area(4), what value does width end up with after the square rule?', options: ['It throws an error', '0', '4 (same as length)', '1'], correctIndex: 2 },
  { text: 'Why must default parameters come AFTER required parameters?', options: ['To avoid ambiguous argument binding', 'It runs faster', 'It saves memory', 'It is only a style choice'], correctIndex: 0 },
  { text: 'calculate_area(5, 3) returns —', options: ['8', '15', '16', '53'], correctIndex: 1 },
  { text: 'Which of these is a risky default value for mutable data?', options: ['An empty list []', '0', 'None', 'A string'], correctIndex: 0 },
  { text: 'What is the time complexity of calculate_area?', options: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], correctIndex: 1 }
];

push('### Function with Default Arguments\n');
problemJson(prob1);
quizJson(quiz1);
hr();

// ===== Problem 2: Factorial (Iterative) =====
const prob2 = {
  title: 'Factorial (Iterative)',
  slug: 'factorial-iterative',
  lessonSlug: 'functions-scope',
  subtopicSlug: 'variable-scope',
  difficulty: 'easy',
  topics: ['Functions', 'Loops', 'Math'],
  companies: ['Amazon', 'Google', 'Microsoft'],
  problemStatement: `Write a function factorial(n) that returns n! — the product of all integers from 1 to n. Use a LOOP (NOT recursion). By convention, 0! = 1.

- factorial(5) = 1 × 2 × 3 × 4 × 5 = 120
- factorial(0) = 1 (by definition)`,
  examples: [
    { input: 'n = 5', output: '120', explanation: '1 × 2 × 3 × 4 × 5 = 120.' },
    { input: 'n = 0', output: '1', explanation: '0! is defined as 1 by convention.' },
    { input: 'n = 1', output: '1', explanation: '1! = 1.' },
    { input: 'n = 4', output: '24', explanation: '1 × 2 × 3 × 4 = 24.' }
  ],
  constraints: [
    'n is a non-negative integer up to 20.',
    'Must use iteration (a loop), not recursion.',
    'No extra data structures needed.'
  ],
  approach: `## Understanding the Problem

Factorial multiplies a *running total*: start at 1, then multiply by 2, then 3, and so on up to n. Each multiplication is result = result × i.

## The Loop Idea

${F}
1. result = 1
2. For i = 2 to n:   result = result × i
3. Return result
${F}

Why start at 2? Multiplying by 1 changes nothing — starting at 2 avoids one wasted step. For n < 2, the loop body never runs and the initial 1 is returned: that single rule handles both ${t('factorial(0) = 1')} and ${t('factorial(1) = 1')} for free.

## Step-by-Step Trace on n = 5

${F}
result = 1
i = 2 → result = 1 × 2 = 2
i = 3 → result = 2 × 3 = 6
i = 4 → result = 6 × 4 = 24
i = 5 → result = 24 × 5 = 120  → stop

Answer: 120 ✅
${F}

## Scope in Action

${t('n')} (the parameter) and ${t('result')} are **local** to the function — a global ${t('n')} elsewhere is untouched. That is exactly the scope lesson: the parameter shadows any outer name for the duration of the call.

## Why Not Recursion for This One?

Recursion is elegant but uses the call stack — for n = 20 the iterative loop is simpler, faster, and cannot overflow the stack.

## Complexity Analysis

- **Time: O(n)** — the loop runs n − 1 times.
- **Space: O(1)** — only result and the loop counter.

## Overflow Note

Factorials explode: 20! = 2,432,902,008,176,640,000 already exceeds a 32-bit int. That is why the constraint caps n at 20 — beyond it you need a bigger numeric type.`,
  codeBlocks: [
    {
      language: 'python',
      code: 'def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\nprint(factorial(5))   # 120\nprint(factorial(0))   # 1'
    },
    {
      language: 'javascript',
      code: 'function factorial(n) {\n    let result = 1;\n    for (let i = 2; i <= n; i++) {\n        result *= i;\n    }\n    return result;\n}\n\nconsole.log(factorial(5));   // 120\nconsole.log(factorial(0));   // 1'
    },
    {
      language: 'java',
      code: 'public static long factorial(int n) {\n    long result = 1;\n    for (int i = 2; i <= n; i++) {\n        result *= i;      // long avoids overflow up to ~20!\n    }\n    return result;\n}\n// factorial(5) == 120\n// factorial(0) == 1'
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
  { text: 'factorial(0) returns —', options: ['0', '1', 'undefined', '-1'], correctIndex: 1 },
  { text: 'The loop multiplies the running total by —', options: ['2, 3, ..., up to n', '0, 1, ..., n', 'Only by n', 'Nothing — it adds'], correctIndex: 0 },
  { text: 'factorial(4) equals —', options: ['16', '12', '36', '24'], correctIndex: 3 },
  { text: 'What is the time complexity of iterative factorial?', options: ['O(1)', 'O(n)', 'O(n^2)', 'O(log n)'], correctIndex: 1 },
  { text: 'Why does factorial(0) need no special code?', options: ['The loop never runs and result stays 1', '0 is negative', 'An if-statement still handles it', 'It returns -1'], correctIndex: 0 }
];

push('### Factorial (Iterative)\n');
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
push('| Lessons | 3 of 18 (order 2 in category) |');
push('| Subtopics | 3 of 48 |');
push('| Problems | 2 of 29 |');
push('| Quizzes | 2 of 29 |');

// Write file
fs.writeFileSync('server/programming-content/next.md', lines.join('\n'), 'utf8');
console.log('Wrote next.md —', lines.join('\n').length, 'chars,', lines.length, 'lines');