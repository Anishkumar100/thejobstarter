/*
 * Seed Backtracking lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_backtracking.mjs
 * NOTE: Generated from dsa-content/next.md — do not hand-edit; regenerate via generate_seed.mjs next.md after updating next.md.
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
  console.log('[SEED] Connected to MongoDB\n');

  /* ─── 1. Lesson ─── */
  console.log('=== LESSON ===');
  const lesson = await upsert(DsaLesson,
    { slug: "backtracking" },
    {
      title: "Backtracking",
      slug: "backtracking",
      category: "recursion-backtracking",
      description: "Learn the superpower of trying every possibility without going down every dead end — the choose, explore, unchoose pattern. Master it with two classic problems: generating all Subsets and placing N-Queens on a board.",
      image: "",
      icon: "GitBranch",
      order: 1,
      difficulty: "medium",
      problemCount: 2
    },
    'Lesson "Backtracking"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
{
      slug: "backtracking-basics", lessonSlug: "backtracking", order: 0,
      title: "Backtracking Basics",
      description: "Learn what backtracking is, how it builds on recursion with the choose-explore-unchoose pattern, and why pruning dead-end branches makes it far better than brute force for 'find all' problems like subsets, permutations, and board puzzles.",
      explanation: "## What is Backtracking?\n\nImagine you're walking through a maze. At every fork you pick a path. If it leads to a dead end, you walk BACK to the last fork and try the next path instead. That's backtracking: trying possibilities one at a time, and when a choice leads nowhere, undoing it and trying the next.\n\n**Backtracking = recursion + the power to UNDO your last decision** (called \\\"unchoosing\\\" or \\\"backtracking\\\"). It's the go-to technique for problems that ask for ALL solutions: all subsets, all permutations, all ways to place queens.\n\n## The Core Pattern: Choose, Explore, Unchoose\n\nEvery backtracking solution follows the same rhythm:\n\n1. **Choose** — make a decision (add an element, place a queen)\n2. **Explore** — recursively explore the consequences of that choice\n3. **Unchoose** — undo the decision before trying the next option\n\nThis is why backtracking is often described as \\\"try and roll back.\\\"\n\n## The Decision Tree\n\nThink of every choice as a branch in a tree. The root is the empty state; the leaves are complete solutions (or dead ends).\n\nFor the subsets of [1, 2]:\n\n```\n                    []\n                 /      \\\\\n              [1]        []\n             /   \\\\      /   \\\\\n         [1,2]   [1]  [2]   []\n```\n\nEach path from root to leaf is one subset: [1,2], [1], [2], and []. The tree grows one level per element — 2^n leaves for n elements.\n\n## Why Not Just Brute Force?\n\nBrute force generates EVERY possibility (often 2^n or n!) and then filters out the invalid ones. Backtracking is smarter: it stops exploring a branch as soon as it knows the branch can't lead to a valid answer. This is called **pruning** — and it saves a huge amount of work.\n\nIn N-Queens, for example, we don't try all n! placements and check each one. We place queens one row at a time and prune the moment a queen would be attacked.\n\n## When to Use Backtracking\n\n✅ Problems asking for \\\"all combinations / permutations / subsets\\\"\n✅ Constraint problems (place things so no rule is broken)\n✅ Puzzles: N-Queens, Sudoku, maze solving\n✅ The problem mentions \\\"find all\\\", \\\"count all\\\", or \\\"is there any\\\"\n\n❌ When a greedy or DP solution exists (much faster)\n❌ When the search space is astronomically large (backtracking is still exponential)\n\n## Complexity\n\nBacktracking explores the whole decision tree in the worst case:\n\n| Problem | Worst Case |\n|---|---|\n| Subsets | O(2^n) |\n| Permutations | O(n!) |\n| N-Queens | O(n!) |\n\nPruning makes the average case much faster, but the worst case is still exponential.\n\n## Key Takeaway\n\nBacktracking = recursion + undo. **Choose, explore, unchoose** — and prune branches that can't work. Whenever a problem says \\\"find all ways,\\\" reach for backtracking.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    },
{
      slug: "n-queens", lessonSlug: "backtracking", order: 1,
      title: "N-Queens",
      description: "Learn the classic N-Queens puzzle — placing N queens on an N×N board so none attack each other — and how backtracking with three O(1) attack checks (column, main diagonal, anti diagonal) prunes impossible branches instantly.",
      explanation: "## The Problem\n\nPlace N queens on an N×N chessboard so that no two queens attack each other. A queen attacks everything in its row, its column, and both diagonals — so no two queens may share a row, a column, or a diagonal.\n\n## Key Insight: One Queen Per Row\n\nSince no two queens can share a row, and we must place N queens, there must be exactly ONE queen in each row. So we place queens row by row — and only need to check columns and diagonals.\n\n## The Three Attack Conditions\n\nWhen placing a queen at (row, col), we must check three things:\n\n1. **Column is free** — no queen already in this column\n2. **Main diagonal is free** — top-left to bottom-right\n3. **Anti diagonal is free** — top-right to bottom-left\n\nThe math trick: squares on the same main diagonal share the same (row - col), and squares on the same anti diagonal share the same (row + col). So we track three sets:\n\n```\nused_cols  -> stores every occupied column\nused_main  -> stores every occupied (row - col)\nused_anti  -> stores every occupied (row + col)\n```\n\nAll three checks are O(1) — that's what makes backtracking here lightning fast.\n\n## How Backtracking Explores\n\nStart at row 0:\n\n1. Try each column\n2. If the column, main diagonal, and anti diagonal are all free: place the queen, mark the three sets, move to the next row\n3. If row == N: we placed all queens — record the board as a solution\n4. If no column works in this row: backtrack — unplace the last queen and try its next column\n\nThe pruning is automatic: if placing a queen would attack another, we never even recurse down that branch.\n\n## Trace on a 4x4 Board (Partial)\n\n```\nRow 0: place Q at (0, 1)\n  Row 1: try (1, 3) — safe -> place\n    Row 2: try (2, 0) — safe -> place\n      Row 3: try (3, 2) — safe -> ALL 4 PLACED — SOLUTION! ✓\n    Row 2: no more safe columns -> backtrack\n  Row 1: no more safe columns -> backtrack\nRow 0: no more safe columns -> backtrack\n\nContinue exploring -> the second solution is found symmetrically.\n```\n\nFor n = 4 there are exactly 2 solutions.\n\n## Complexity\n\n- **Time: O(n!)** worst case — first row has n choices, the next n-1, and so on. Pruning makes real runs much faster.\n- **Space: O(n)** — the recursion stack plus the three sets.\n\n## Key Takeaway\n\nN-Queens is the classic backtracking showcase: **place row by row, track three sets for instant attack checks, prune impossible branches, and record every complete board.**",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    }
  ];

  for (const sub of subtopics) {
    await upsert(Subtopic, { slug: sub.slug }, sub, 'Subtopic "' + sub.title + '"');
  }

  /* ─── 3. Problems ─── */
  console.log('\n=== PROBLEMS ===');

  const problems = [
{
      slug: "subsets", lessonSlug: "backtracking", subtopicSlug: "backtracking-basics",
      title: "Subsets", difficulty: "medium",
      topics: ["Backtracking","Recursion","Arrays"],
      companies: ["Amazon","Google","Microsoft","Meta","Apple","Uber"],
      problemStatement: "You are given an array of distinct integers. Your task is to return ALL possible subsets of the array — the power set.\n\nA subset is any selection of elements from the array, in any order. The empty set [] and the full array itself are both valid subsets.\n\nReturn the answer as a list of lists. The solution set must not contain duplicate subsets — you may return the subsets in any order.\n\nFor example, given nums = [1, 2, 3], the power set is [[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]] — all 8 subsets.",
      examples: [{"input":"nums = [1, 2, 3]","output":"[[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]]","explanation":"All 8 subsets of a 3-element array: 2^3 = 8."},{"input":"nums = [0]","output":"[[], [0]]","explanation":"A 1-element array has 2 subsets: empty and the element itself."},{"input":"nums = [1, 2]","output":"[[], [1], [2], [1,2]]","explanation":"All 4 subsets: 2^2 = 4."},{"input":"nums = []","output":"[[]]","explanation":"The only subset of an empty array is the empty set itself."}],
      constraints: ["The array length is between 1 and 10 elements.","All integers in the array are distinct.","Each element is an integer between -10 and 10."],
      approach: "## Understanding the Problem\n\nWe need the power set — every possible subset. For n elements there are exactly 2^n subsets, because each element makes one binary decision: it's either IN a subset or OUT of it.\n\n## The Backtracking Idea\n\nWalk through the array. At each element, decide: **include it or skip it?** Build a temporary list, and at the end of the array, record a copy of it.\n\n```\nFUNCTION backtrack(index, current):\n    IF index == length(nums):\n        ADD a copy of current to the answer\n        RETURN\n\n    # Option 1: INCLUDE nums[index]\n    current.append(nums[index])\n    backtrack(index + 1, current)\n\n    # Option 2: EXCLUDE nums[index]  (this is the unchoose step)\n    current.pop()\n    backtrack(index + 1, current)\n```\n\n## Trace on [1, 2]\n\n```\nbacktrack(0, [])\n├── include 1 -> backtrack(1, [1])\n│   ├── include 2 -> backtrack(2, [1,2]) -> record [1,2] ✓\n│   └── exclude 2 -> backtrack(2, [1])   -> record [1] ✓\n└── exclude 1 -> backtrack(1, [])\n    ├── include 2 -> backtrack(2, [2])   -> record [2] ✓\n    └── exclude 2 -> backtrack(2, [])    -> record [] ✓\n```\n\nAnswer: [[1,2], [1], [2], []] — all 4 subsets, no duplicates.\n\n## Why There Are No Duplicates\n\nEach element is visited exactly once per path, and the recursion never looks backward — so every subset is generated exactly once.\n\n## Complexity Analysis\n\n- **Time Complexity: O(2^n)** — one node in the decision tree per subset.\n- **Space Complexity: O(n)** — the recursion stack depth (not counting the output, which is O(2^n) itself).\n\n### Python Code\n\n```python\ndef subsets(nums):\n    result = []\n\n    def backtrack(index, current):\n        # Reached the end of the array: record this subset\n        if index == len(nums):\n            result.append(current[:])  # copy!\n            return\n\n        # Option 1: include nums[index]\n        current.append(nums[index])\n        backtrack(index + 1, current)\n\n        # Option 2: exclude nums[index] (unchoose)\n        current.pop()\n        backtrack(index + 1, current)\n\n    backtrack(0, [])\n    return result\n```\n\n### JavaScript Code\n\n```javascript\nfunction subsets(nums) {\n    const result = [];\n\n    function backtrack(index, current) {\n        // Reached the end of the array: record this subset\n        if (index === nums.length) {\n            result.push([...current]); // copy!\n            return;\n        }\n\n        // Option 1: include nums[index]\n        current.push(nums[index]);\n        backtrack(index + 1, current);\n\n        // Option 2: exclude nums[index] (unchoose)\n        current.pop();\n        backtrack(index + 1, current);\n    }\n\n    backtrack(0, []);\n    return result;\n}\n```",
      codeBlocks: [{"language":"python","code":"def subsets(nums):\n    result = []\n\n    def backtrack(index, current):\n        # Reached the end of the array: record this subset\n        if index == len(nums):\n            result.append(current[:])  # copy!\n            return\n\n        # Option 1: include nums[index]\n        current.append(nums[index])\n        backtrack(index + 1, current)\n\n        # Option 2: exclude nums[index] (unchoose)\n        current.pop()\n        backtrack(index + 1, current)\n\n    backtrack(0, [])\n    return result"},{"language":"javascript","code":"function subsets(nums) {\n    const result = [];\n\n    function backtrack(index, current) {\n        // Reached the end of the array: record this subset\n        if (index === nums.length) {\n            result.push([...current]); // copy!\n            return;\n        }\n\n        // Option 1: include nums[index]\n        current.push(nums[index]);\n        backtrack(index + 1, current);\n\n        // Option 2: exclude nums[index] (unchoose)\n        current.pop();\n        backtrack(index + 1, current);\n    }\n\n    backtrack(0, []);\n    return result;\n}"}],
      timeComplexity: "O(2^n)", spaceComplexity: "O(n)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    },
{
      slug: "n-queens", lessonSlug: "backtracking", subtopicSlug: "n-queens",
      title: "N-Queens", difficulty: "hard",
      topics: ["Backtracking","Matrix"],
      companies: ["Amazon","Google","Microsoft","Meta","Apple"],
      problemStatement: "You are given an integer n. Your task is to place n queens on an n x n chessboard so that no two queens attack each other.\n\nA queen attacks any piece in the same row, the same column, or along either diagonal. A valid arrangement must therefore have exactly one queen in each row and column, with no two queens sharing a diagonal.\n\nReturn ALL distinct solutions to the n-queens puzzle. Each solution is represented as an array of n strings, where 'Q' marks a queen and '.' marks an empty square. The strings must have length n and use only 'Q' and '.' characters.\n\nFor example, for n = 4 there are exactly 2 solutions.",
      examples: [{"input":"n = 4","output":"[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]","explanation":"The 2 distinct ways to place 4 queens on a 4x4 board so none attack each other."},{"input":"n = 1","output":"[[\"Q\"]]","explanation":"A single queen attacks nothing — there is exactly 1 solution."},{"input":"n = 2","output":"[]","explanation":"It is impossible to place 2 non-attacking queens on a 2x2 board."},{"input":"n = 3","output":"[]","explanation":"There is no way to place 3 non-attacking queens on a 3x3 board."}],
      constraints: ["n is between 1 and 9.","Return all distinct solutions — the order of solutions does not matter."],
      approach: "## Understanding the Problem\n\nWe must place n queens so no two attack. Since a queen attacks its whole row and column, a valid solution has exactly one queen per row and one per column. We can use this to our advantage.\n\n## The Plan: Place Row by Row\n\nPlace queens one row at a time. For each row, try every column; if the square is safe, place a queen and recurse to the next row. If a row has no safe column, backtrack to the previous row and try its next column.\n\n## The Three O(1) Attack Checks\n\nTrack three sets as we go:\n\n```\nused_cols  -> every occupied column\nused_main  -> every occupied (row - col)  -> main diagonals\nused_anti  -> every occupied (row + col)  -> anti diagonals\n```\n\nA square (row, col) is safe iff all three are free:\n\n```\ncol NOT in used_cols\n(row - col) NOT in used_main\n(row + col) NOT in used_anti\n```\n\n## Trace on n = 4 (First Solution)\n\n```\nRow 0: place Q at (0, 1)\n  Row 1: try (1, 3) — safe -> place\n    Row 2: try (2, 0) — safe -> place\n      Row 3: try (3, 2) — safe -> ALL 4 QUEENS PLACED\n             Record: [\".Q..\", \"...Q\", \"Q...\", \"..Q.\"]  ✓\n      Row 3: no more safe columns -> backtrack\n    Row 2: no more safe columns -> backtrack\n  Row 1: no more safe columns -> backtrack\nRow 0: no more safe columns -> backtrack\n```\n\nContinuing the same pattern finds the mirrored second solution. Total for n = 4: **2 solutions**.\n\n## Complexity Analysis\n\n- **Time Complexity: O(n!)** — worst case: first row n choices, next n-1, and so on. Pruning makes practical runs much faster.\n- **Space Complexity: O(n)** — the recursion stack plus the three sets.\n\n### Python Code\n\n```python\ndef solveNQueens(n):\n    result = []\n    cols, main, anti = set(), set(), set()\n    board = [['.'] * n for _ in range(n)]\n\n    def backtrack(row):\n        # All rows filled — record this board\n        if row == n:\n            result.append([''.join(r) for r in board])\n            return\n\n        for col in range(n):\n            # Attack check: column, main diagonal, anti diagonal\n            if col in cols or (row - col) in main or (row + col) in anti:\n                continue\n\n            # Choose: place the queen\n            board[row][col] = 'Q'\n            cols.add(col)\n            main.add(row - col)\n            anti.add(row + col)\n\n            # Explore: next row\n            backtrack(row + 1)\n\n            # Unchoose: remove the queen and try the next column\n            board[row][col] = '.'\n            cols.remove(col)\n            main.remove(row - col)\n            anti.remove(row + col)\n\n    backtrack(0)\n    return result\n```\n\n### JavaScript Code\n\n```javascript\nfunction solveNQueens(n) {\n    const result = [];\n    const cols = new Set();\n    const main = new Set();\n    const anti = new Set();\n    const board = Array.from({ length: n }, () => Array(n).fill('.'));\n\n    function backtrack(row) {\n        // All rows filled — record this board\n        if (row === n) {\n            result.push(board.map(r => r.join('')));\n            return;\n        }\n\n        for (let col = 0; col < n; col++) {\n            // Attack check: column, main diagonal, anti diagonal\n            if (cols.has(col) || main.has(row - col) || anti.has(row + col)) {\n                continue;\n            }\n\n            // Choose: place the queen\n            board[row][col] = 'Q';\n            cols.add(col);\n            main.add(row - col);\n            anti.add(row + col);\n\n            // Explore: next row\n            backtrack(row + 1);\n\n            // Unchoose: remove the queen and try the next column\n            board[row][col] = '.';\n            cols.delete(col);\n            main.delete(row - col);\n            anti.delete(row + col);\n        }\n    }\n\n    backtrack(0);\n    return result;\n}\n```",
      codeBlocks: [{"language":"python","code":"def solveNQueens(n):\n    result = []\n    cols, main, anti = set(), set(), set()\n    board = [['.'] * n for _ in range(n)]\n\n    def backtrack(row):\n        # All rows filled — record this board\n        if row == n:\n            result.append([''.join(r) for r in board])\n            return\n\n        for col in range(n):\n            # Attack check: column, main diagonal, anti diagonal\n            if col in cols or (row - col) in main or (row + col) in anti:\n                continue\n\n            # Choose: place the queen\n            board[row][col] = 'Q'\n            cols.add(col)\n            main.add(row - col)\n            anti.add(row + col)\n\n            # Explore: next row\n            backtrack(row + 1)\n\n            # Unchoose: remove the queen and try the next column\n            board[row][col] = '.'\n            cols.remove(col)\n            main.remove(row - col)\n            anti.remove(row + col)\n\n    backtrack(0)\n    return result"},{"language":"javascript","code":"function solveNQueens(n) {\n    const result = [];\n    const cols = new Set();\n    const main = new Set();\n    const anti = new Set();\n    const board = Array.from({ length: n }, () => Array(n).fill('.'));\n\n    function backtrack(row) {\n        // All rows filled — record this board\n        if (row === n) {\n            result.push(board.map(r => r.join('')));\n            return;\n        }\n\n        for (let col = 0; col < n; col++) {\n            // Attack check: column, main diagonal, anti diagonal\n            if (cols.has(col) || main.has(row - col) || anti.has(row + col)) {\n                continue;\n            }\n\n            // Choose: place the queen\n            board[row][col] = 'Q';\n            cols.add(col);\n            main.add(row - col);\n            anti.add(row + col);\n\n            // Explore: next row\n            backtrack(row + 1);\n\n            // Unchoose: remove the queen and try the next column\n            board[row][col] = '.';\n            cols.delete(col);\n            main.delete(row - col);\n            anti.delete(row + col);\n        }\n    }\n\n    backtrack(0);\n    return result;\n}"}],
      timeComplexity: "O(n!)", spaceComplexity: "O(n)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    }
  ];

  const createdProblems = [];
  for (const prob of problems) {
    const created = await upsert(Problem, { slug: prob.slug }, prob, 'Problem "' + prob.title + '"');
    createdProblems.push(created);
  }

  /* ─── 4. Quizzes ─── */
  console.log('\n=== QUIZZES ===');

  const quizzes = [
{
      slug: "subsets",
      questions: [{"text":"How many subsets does an array with n distinct elements have?","options":["n","n squared","2^n","n factorial"],"correctIndex":2},{"text":"In the subsets backtracking, what does the 'unchoose' step do?","options":["Removes the element we just added before trying the other branch","Sorts the current subset","Deletes the whole answer list","Stops the recursion permanently"],"correctIndex":0},{"text":"What is the time complexity of generating all subsets with backtracking?","options":["O(n)","O(n log n)","O(2^n)","O(n!)"],"correctIndex":2},{"text":"How many subsets does the array [1, 2] produce?","options":["2","3","4","8"],"correctIndex":2},{"text":"Which of the following is NOT a subset of [1, 2, 3]?","options":["[2]","[1, 3]","[3, 4]","[]"],"correctIndex":2}]
    },
{
      slug: "n-queens",
      questions: [{"text":"How many queens are placed in each row of a valid N-Queens solution?","options":["Zero","Exactly one","Two","It varies per row"],"correctIndex":1},{"text":"Which two diagonal identities does the algorithm track?","options":["row + col and row - col","row x col and row / col","row x row and col x col","row + row and col + col"],"correctIndex":0},{"text":"When no column is safe in the current row, what does the algorithm do?","options":["Places a queen anyway","Skips the row entirely","Backtracks to the previous row and tries its next column","Returns an empty result"],"correctIndex":2},{"text":"What is the worst-case time complexity of the N-Queens backtracking solution?","options":["O(n)","O(n squared)","O(2^n)","O(n!)"],"correctIndex":3},{"text":"For n = 4, how many valid solutions does N-Queens have?","options":["0","2","4","8"],"correctIndex":1}]
    }
  ];

  for (const q of quizzes) {
    const problemDoc = createdProblems.find(p => p.slug === q.slug);
    if (problemDoc) {
      await upsertQuiz(problemDoc._id, 'Problem', q.questions);
    } else {
      console.error('[SEED] Problem "' + q.slug + '" not found in created problems — skipping quiz');
    }
  }

  /* ─── Done ─── */
  console.log('\n[SEED] Backtracking lesson seeded successfully!');
  console.log('  Lesson:    1 (Backtracking)');
  console.log('  Subtopics: ' + subtopics.length + ' (' + subtopics.map(s => s.title).join(', ') + ')');
  console.log('  Problems:  ' + problems.length + ' (' + problems.map(p => p.title).join(', ') + ')');
  console.log('  Quizzes:   ' + quizzes.length);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
