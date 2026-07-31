/*
 * Seed Recursion lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_recursion.mjs
 * NOTE: Generated from dsa-content/present.md — do not hand-edit; regenerate via generate_seed.mjs present.md after updating present.md.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';

/* ─── Helpers ─── */
async function upsert(Model, query, data, label) {
  const result = await Model.findOneAndUpdate(query, data, { upsert: true, new: true });
  console.log(`[SEED] ${label}: ${result ? 'upserted' : 'failed'} (${JSON.stringify(query)})`);
  return result;
}

async function upsertQuiz(problemId, problemModel, questions) {
  const result = await Quiz.findOneAndUpdate(
    { problemId, problemModel },
    { problemId, problemModel, questions },
    { upsert: true, new: true }
  );
  console.log(`[SEED] Quiz for ${problemModel} ${problemId}: upserted (${questions.length} questions)`);
  return result;
}

/* ─── Connect ─── */
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected to MongoDB\n');

  /* ─── 1. Lesson ─── */
  console.log('=== LESSON ===');
  const lesson = await upsert(DsaLesson,
    { slug: "recursion" },
    {
      title: "Recursion",
      slug: "recursion",
      category: "recursion-backtracking",
      description: "Learn the art of functions that call themselves — the base case that stops them, the call stack that tracks them, and how to think recursively with two classic examples: factorial and the Fibonacci sequence.",
      image: "",
      icon: "Repeat",
      order: 0,
      difficulty: "easy",
      problemCount: 1
    },
    'Lesson "Recursion"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
    {
      slug: "recursion-basics", lessonSlug: "recursion", order: 0,
      title: "Recursion Basics",
      description: "Learn what recursion is, why every recursive function needs a base case, how the call stack tracks unfinished calls, and when recursion beats iteration — using factorial and Fibonacci as your first two examples.",
      explanation: "## What is Recursion?\n\nImagine two mirrors facing each other. You see the same image reflected inside itself, smaller and smaller, forever. Or think of Russian nesting dolls (matryoshka) — open one, there's a smaller one inside; open that, an even smaller one; until you reach the tiniest doll that can't be opened.\n\n**Recursion** is exactly this: a function that calls itself, each time solving a slightly smaller version of the same problem, until it reaches a tiny version it can answer directly.\n\nA recursive function always has two parts:\n\n1. **Base case** — the tiny problem you can answer immediately (the smallest doll that can't be opened). Without it, recursion never stops.\n2. **Recursive case** — the function calls itself on a smaller version of the problem (opening the next doll).\n\n## The Call Stack: What Actually Happens\n\nWhen a function calls itself, the computer keeps track of all the unfinished calls in a special structure called the **call stack**. Each call is placed on top of the stack. The topmost call runs first; when it finishes, it's removed and the next one resumes.\n\nLet's watch this with the classic example, `factorial(n) = n * factorial(n-1)`, with `factorial(1) = 1`.\n\nComputing `factorial(4)`:\n\n```\nfactorial(4) -> 4 * factorial(3)\nfactorial(3) -> 3 * factorial(2)\nfactorial(2) -> 2 * factorial(1)\nfactorial(1) -> 1   (BASE CASE — stops here)\n```\n\nNow the stack unwinds, top to bottom:\n\n```\nfactorial(1) returns 1\nfactorial(2) returns 2 * 1 = 2\nfactorial(3) returns 3 * 2 = 6\nfactorial(4) returns 4 * 6 = 24\n```\n\nAnswer: **24**. Each call waits for its \"child\" to finish before it can multiply and return. This is why recursion uses memory — the call stack grows one frame per pending call.\n\n## Fibonacci: The Classic Example\n\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, ... Each number is the sum of the previous two. As a formula:\n\n```\nfib(0) = 0\nfib(1) = 1\nfib(n) = fib(n-1) + fib(n-2)\n```\n\nTo compute `fib(5)`, the function calls itself twice, and each of those calls itself twice, and so on — like a branching tree:\n\n```\n                    fib(5)\n                  /        \\\n            fib(4)          fib(3)\n           /      \\        /      \\\n      fib(3)    fib(2)  fib(2)   fib(1)\n      /    \\    /    \\  /    \\\n   fib(2) fib(1) ... ...   ...\n   /    \\\nfib(1) fib(0)\n```\n\nNotice `fib(3)` and `fib(2)` get computed multiple times! This naive version is **exponential** — O(2^n) — because it recomputes the same values over and over. (Later you'll learn a trick called memoization to cache and reuse those answers.)\n\n## Recursion vs Iteration\n\n| Aspect | Recursion | Iteration (loops) |\n|---|---|---|\n| How it repeats | Function calls itself | Loop repeats a block |\n| Readability | Natural for branching problems (trees, backtracking) | Natural for linear scans |\n| Memory | Uses the call stack — O(depth) extra space | Usually O(1) extra space |\n| Speed | Slightly slower (function call overhead) | Faster |\n| Risk | Stack overflow if the base case is missing | Infinite loop if the condition is wrong |\n\n**Rule of thumb:** use recursion when a problem naturally breaks into smaller copies of itself (trees, graphs, divide & conquer, backtracking). Use loops for simple linear repetition.\n\n## When to Use Recursion\n\n✅ Problems that divide into identical smaller subproblems (divide & conquer)\n✅ Tree and graph traversals\n✅ Backtracking (try a path, undo, try another)\n✅ Naturally recursive problems (factorial, Fibonacci, permutations, subsets)\n\n❌ When the call depth could be huge — you risk a stack overflow\n❌ Simple linear loops where iteration is faster and cheaper\n\n## Common Pitfalls\n\n1. **Missing base case** — infinite recursion → stack overflow crash\n2. **Wrong base case** — off-by-one errors or incorrect answers\n3. **Forgetting the return value** — each level must combine its result and pass it up the chain\n4. **Exponential blowup** — naive Fibonacci recomputes the same subproblems; memoization fixes it\n\n## Key Takeaway\n\nRecursion = a function that calls itself on a smaller problem until a **base case** stops it, with the **call stack** doing the bookkeeping. It's the natural tool for branching problems like trees, and the foundation of divide & conquer and backtracking — but always check your base case and watch your stack depth.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    }
  ];

  for (const sub of subtopics) {
    await upsert(Subtopic, { slug: sub.slug }, sub, `Subtopic "${sub.title}"`);
  }

  /* ─── 3. Problems ─── */
  console.log('\n=== PROBLEMS ===');

  const problems = [
    {
      slug: "factorial-fibonacci-recursive", lessonSlug: "recursion", subtopicSlug: "recursion-basics",
      title: "Factorial/Fibonacci (Recursive)", difficulty: "easy",
      topics: ["Recursion","Math"],
      companies: ["Amazon","Google","Microsoft","Apple","Adobe"],
      problemStatement: "You are given an integer n. Write TWO recursive functions:\n\n1. **factorial(n)** — returns the product of all integers from 1 to n: n! = n * (n-1) * ... * 2 * 1. By definition, 0! = 1.\n2. **fibonacci(n)** — returns the nth number in the Fibonacci sequence, where fib(0) = 0, fib(1) = 1, and every next number is the sum of the previous two.\n\nBoth functions MUST be implemented recursively — no loops, no built-in math shortcuts. This problem exists to make you comfortable with the base case + recursive case pattern.\n\nFor example, factorial(5) = 5 * 4 * 3 * 2 * 1 = 120, and fibonacci(6) = 8 (the sequence is 0, 1, 1, 2, 3, 5, 8).",
      examples: [{"input":"n = 5, function = factorial","output":"120","explanation":"5! = 5 * 4 * 3 * 2 * 1 = 120."},{"input":"n = 0, function = factorial","output":"1","explanation":"0! is defined to be 1 — this is the base case."},{"input":"n = 6, function = fibonacci","output":"8","explanation":"The sequence is 0, 1, 1, 2, 3, 5, 8 — the 6th number (0-indexed) is 8."},{"input":"n = 1, function = fibonacci","output":"1","explanation":"fib(1) = 1 by definition — the second base case."}],
      constraints: ["0 <= n <= 20 for factorial (results fit comfortably in 64-bit integers).","0 <= n <= 30 for Fibonacci (the naive recursive version is O(2^n) — larger inputs would be far too slow)."],
      approach: "## Understanding the Problem\n\nWe need two classic recursive functions. Both follow the same skeleton: a **base case** that answers the smallest problem directly, and a **recursive case** that breaks the problem into a smaller version of itself.\n\n## Part 1 — Factorial\n\n### The Recurrence\n\n```\nfactorial(n) = n * factorial(n - 1)   for n > 1\nfactorial(n) = 1                      for n = 0 or n = 1  (BASE CASE)\n```\n\nTo compute `factorial(4)`, we ask: what is `4 * factorial(3)`? To know that, we need `3 * factorial(2)`, then `2 * factorial(1)`, and `factorial(1)` is just 1 — we can answer that immediately. Now everything unwinds:\n\n```\nfactorial(1) = 1\nfactorial(2) = 2 * 1 = 2\nfactorial(3) = 3 * 2 = 6\nfactorial(4) = 4 * 6 = 24\n```\n\n### Why the Base Case Matters\n\nIf we forgot the `n == 1` check, `factorial(n)` would call `factorial(n-1)` forever, growing the call stack until the program crashes with a stack overflow. The base case is the exit ramp.\n\n## Part 2 — Fibonacci\n\n### The Recurrence\n\n```\nfib(0) = 0\nfib(1) = 1\nfib(n) = fib(n - 1) + fib(n - 2)   for n >= 2\n```\n\nHere the recursion **branches**: each call makes two more calls. Trace `fib(4)`:\n\n```\nfib(4) = fib(3) + fib(2)\n       = (fib(2) + fib(1)) + (fib(1) + fib(0))\n       = ((fib(1) + fib(0)) + 1) + (1 + 0)\n       = ((1 + 0) + 1) + 1\n       = 2 + 1\n       = 3\n```\n\n### Complexity of the Naive Version\n\nThe call tree doubles at each level, so the naive recursive Fibonacci makes about 2^n calls — **O(2^n) time**. That's why the constraint caps n at 30. The space used is the call stack depth, **O(n)**.\n\nFactorial, by contrast, is **O(n) time** — one call per value of n — with **O(n)** stack space.\n\n## Step-by-Step Algorithm\n\n**factorial(n):**\n1. If n <= 1, return 1 (base case)\n2. Otherwise, return n * factorial(n - 1) (recursive case)\n\n**fibonacci(n):**\n1. If n == 0, return 0 (base case)\n2. If n == 1, return 1 (base case)\n3. Otherwise, return fibonacci(n - 1) + fibonacci(n - 2) (recursive case)\n\n## Complexity Analysis\n\n- **factorial:** Time **O(n)** · Space **O(n)** (call stack depth)\n- **fibonacci (naive):** Time **O(2^n)** · Space **O(n)** (call stack depth)\n\n## Practice Tips\n\n- Always write the base case FIRST — it defines when recursion stops\n- Trace small inputs on paper (like n = 4) to build intuition for the call stack\n- For Fibonacci, notice how many times `fib(2)` is recomputed — that's the hint for why memoization (caching) is a topic right around the corner\n\n### Python Code\n\n```python\ndef factorial(n):\n    # Base case: 0! and 1! are both 1\n    if n <= 1:\n        return 1\n    # Recursive case: n! = n * (n-1)!\n    return n * factorial(n - 1)\n\n\ndef fibonacci(n):\n    # Base cases: the first two numbers of the sequence\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n    # Recursive case: each number is the sum of the previous two\n    return fibonacci(n - 1) + fibonacci(n - 2)\n```\n\n### JavaScript Code\n\n```javascript\nfunction factorial(n) {\n    // Base case: 0! and 1! are both 1\n    if (n <= 1) {\n        return 1;\n    }\n    // Recursive case: n! = n * (n-1)!\n    return n * factorial(n - 1);\n}\n\nfunction fibonacci(n) {\n    // Base cases: the first two numbers of the sequence\n    if (n === 0) {\n        return 0;\n    }\n    if (n === 1) {\n        return 1;\n    }\n    // Recursive case: each number is the sum of the previous two\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n```",
      codeBlocks: [{"language":"python","code":"def factorial(n):\n    # Base case: 0! and 1! are both 1\n    if n <= 1:\n        return 1\n    # Recursive case: n! = n * (n-1)!\n    return n * factorial(n - 1)\n\n\ndef fibonacci(n):\n    # Base cases: the first two numbers of the sequence\n    if n == 0:\n        return 0\n    if n == 1:\n        return 1\n    # Recursive case: each number is the sum of the previous two\n    return fibonacci(n - 1) + fibonacci(n - 2)"},{"language":"javascript","code":"function factorial(n) {\n    // Base case: 0! and 1! are both 1\n    if (n <= 1) {\n        return 1;\n    }\n    // Recursive case: n! = n * (n-1)!\n    return n * factorial(n - 1);\n}\n\nfunction fibonacci(n) {\n    // Base cases: the first two numbers of the sequence\n    if (n === 0) {\n        return 0;\n    }\n    if (n === 1) {\n        return 1;\n    }\n    // Recursive case: each number is the sum of the previous two\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}"}],
      timeComplexity: "O(n) for factorial; O(2^n) for naive Fibonacci", spaceComplexity: "O(n) — the call stack depth for both",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    }
  ];

  const createdProblems = [];
  for (const prob of problems) {
    const created = await upsert(Problem, { slug: prob.slug }, prob, `Problem "${prob.title}"`);
    createdProblems.push(created);
  }

  /* ─── 4. Quizzes ─── */
  console.log('\n=== QUIZZES ===');

  const quizzes = [
    {
      slug: "factorial-fibonacci-recursive",
      questions: [{"text":"What stops a recursive function from calling itself forever?","options":["The compiler's loop limit","The base case","The return keyword","The call stack's maximum depth"],"correctIndex":1},{"text":"What happens if a recursive function has no base case?","options":["It returns 0 immediately","It skips to the largest input","It calls itself forever until the stack overflows","The compiler refuses to compile it"],"correctIndex":2},{"text":"What is factorial(5)?","options":["5","25","100","120"],"correctIndex":3},{"text":"What is the base case for the factorial function?","options":["n <= 1 returns 1","n == 2 returns 2","n == n returns n","There is no base case"],"correctIndex":0},{"text":"What is the time complexity of the naive recursive Fibonacci function?","options":["O(n) — one call per value of n","O(log n) — it halves the problem each step","O(2^n) — the call tree doubles at every level","O(n^2) — nested loops"],"correctIndex":2}]
    }
  ];

  for (const q of quizzes) {
    const problemDoc = createdProblems.find(p => p.slug === q.slug);
    if (problemDoc) {
      await upsertQuiz(problemDoc._id, 'Problem', q.questions);
    } else {
      console.error(`[SEED] Problem "${q.slug}" not found in created problems — skipping quiz`);
    }
  }

  /* ─── Done ─── */
  console.log('\n[SEED] Recursion lesson seeded successfully!');
  console.log(`  Lesson:    1 (Recursion)`);
  console.log(`  Subtopics: ${subtopics.length} (Recursion Basics)`);
  console.log(`  Problems:  ${problems.length} (Factorial/Fibonacci (Recursive))`);
  console.log(`  Quizzes:   ${quizzes.length}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
