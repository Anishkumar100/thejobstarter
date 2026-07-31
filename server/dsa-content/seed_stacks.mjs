/*
 * Seed Stacks lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_stacks.mjs
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
    { slug: "stacks" },
    {
      title: "Stacks",
      slug: "stacks",
      category: "linked-lists-stacks-queues",
      description: "Master the stack — the Last-In-First-Out data structure behind undo buttons, browser back, and function calls. Learn the core push/pop operations and the powerful monotonic stack trick, then apply both to Valid Parentheses and Next Greater Element.",
      image: "",
      icon: "Layers",
      order: 1,
      difficulty: "medium",
      problemCount: 2
    },
    'Lesson "Stacks"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
{
      slug: "stack-basics", lessonSlug: "stacks", order: 0,
      title: "Stack Basics",
      description: "Learn the Last-In-First-Out (LIFO) stack: the push, pop, and peek operations, its real-world uses (undo, browser back, function calls, bracket matching), and why all operations run in O(1) time.",
      explanation: "## What is a Stack?\\n\\nA stack is a collection of items where you can only add or remove from the TOP. Imagine a stack of plates in a cafeteria: you take the plate on top first, and the plate you put down last is the one you pick up first. That's why a stack is called **Last-In-First-Out** (LIFO).\\n\\n## The Three Core Operations\\n\\nEvery stack supports three fundamental operations:\\n\\n1. **Push** — add an item on top\\n2. **Pop** — remove the top item (and return it)\\n3. **Peek / Top** — look at the top item without removing it\\n\\nAll three run in **O(1)** time — instant, no matter how many items are in the stack.\\n\\n## Visualising the Stack\\n\\n```\\n        push 3        push 7        pop  -> 7        pop  -> 3\\n\\n   +---+          +---+          +---+           +---+\\n   |   |          | 7 |          |   |           |   |\\n   |   |          | 3 |          | 3 |           |   |\\n   |   |          |   |          |   |           |   |\\n   +---+          +---+          +---+           +---+\\n```\\n\\nThe most recently pushed item is always on top and is always the first one out.\\n\\n## Real-World Uses of a Stack\\n\\nStacks are everywhere in computing:\\n\\n✅ **Undo / Redo** — every action you do is pushed onto a stack; undo pops the latest action\\n✅ **Browser back button** — each page you visit is pushed; back pops the previous page\\n✅ **Function calls** — the call stack remembers where each function should return when it finishes\\n✅ **Bracket matching** — compilers and code editors use a stack to check that ( ) [ ] { } are balanced\\n✅ **Expression evaluation** — converting and evaluating expressions (e.g. infix to postfix)\\n\\n## Array vs Stack\\n\\nA stack is really an abstraction — you can build it on top of an array (or a linked list). The stack rules decide HOW you use it:\\n\\n| Feature | Array | Stack |\\n|---|---|---|\\n| Access any position | Yes (random access) | No (only top) |\\n| Add/remove from end | O(1) append | O(1) push |\\n| Remove from start | O(n) shift | O(1) pop |\\n| Best for | Storing and searching data | Keeping a history of decisions |\\n\\n## When to Use a Stack\\n\\n✅ The problem needs to process items in reverse order of arrival (LIFO)\\n✅ Nested structures — brackets, parentheses, HTML tags, function calls\\n✅ You need to keep a 'history' of choices and roll back to the most recent one\\n\\n❌ When you need random access to items in the middle\\n❌ When First-In-First-Out (FIFO) order is needed — that's a queue's job\\n\\n## Complexity Summary\\n\\n| Operation | Time |\\n|---|---|\\n| Push | O(1) |\\n| Pop | O(1) |\\n| Peek | O(1) |\\n| Search | O(n) |\\n\\n## Key Takeaway\\n\\nA stack is a **Last-In-First-Out** collection with O(1) push/pop/peek. Whenever a problem mentions brackets, undo, history, or nested structure — reach for a stack.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    },
{
      slug: "monotonic-stack", lessonSlug: "stacks", order: 1,
      title: "Monotonic Stack",
      description: "Learn the monotonic stack — a stack that always stays sorted (increasing or decreasing). It turns 'find the next greater/smaller element' style problems from O(n^2) brute force into clean O(n) solutions.",
      explanation: "## The Problem With Brute Force\\n\\nMany problems ask: for each element, find the NEXT element to its right that is bigger (or smaller) than it.\\n\\nThe naive way: for every element, scan everything to its right until you find a bigger one. That's two nested loops — **O(n^2)** — too slow for big inputs.\\n\\n## The Idea: A Sorted Stack\\n\\nA **monotonic stack** is a stack that always stays sorted — every new element you push makes the stack either strictly increasing or strictly decreasing.\\n\\nHow? Before pushing a new element, you **pop everything that violates the order**. This is the whole trick!\\n\\n## How to Build a Decreasing Monotonic Stack\\n\\nImagine you want to keep the stack strictly decreasing from bottom to top (bigger at bottom, smaller at top):\\n\\n```\\nTo push value X:\\n  WHILE stack is not empty AND top of stack <= X:\\n      POP the top                     # smaller/equal elements can't stay\\n  PUSH X                              # now the order is restored\\n```\\n\\nWatch it in action on [4, 2, 5]:\\n\\n```\\nPush 4 -> stack: [4]\\nPush 2 -> 2 < 4, so just push -> stack: [4, 2]\\nPush 5 -> 5 >= 2, pop 2; 5 >= 4, pop 4 -> stack: [] -> push 5 -> stack: [5]\\n```\\n\\nThe stack stays strictly decreasing from bottom to top. Each element is pushed once and popped at most once — that's why the total work is **O(n)**, not O(n^2)!\\n\\n## Why This Helps 'Next Greater Element'\\n\\nWhile keeping the stack decreasing, the elements still sitting in the stack are exactly the ones **waiting for a greater element** to their right. The moment you push a bigger element X:\\n\\n- Every element X pops (i.e. is smaller than X) has found its **next greater element = X**\\n\\nSo the popping step itself answers the question for those elements — for free!\\n\\n## When to Use a Monotonic Stack\\n\\n✅ 'Find the next greater / next smaller element' problems\\n✅ Daily temperatures, stock span, largest rectangle in histogram\\n✅ Problems where each element cares about the nearest element that is bigger/smaller\\n\\n❌ When the order of answers doesn't depend on the nearest bigger/smaller neighbour\\n\\n## Complexity\\n\\n| Approach | Time | Space |\\n|---|---|---|\\n| Brute force (nested loops) | O(n^2) | O(1) |\\n| Monotonic stack | O(n) | O(n) |\\n\\nEach element is pushed and popped exactly once, giving linear time.\\n\\n## Key Takeaway\\n\\nA monotonic stack keeps itself sorted by popping violators before pushing. Because each element enters and leaves the stack once, it solves 'next greater/smaller element' problems in **O(n)** time instead of O(n^2).",
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
      slug: "valid-parentheses", lessonSlug: "stacks", subtopicSlug: "stack-basics",
      title: "Valid Parentheses", difficulty: "easy",
      topics: ["Stack","String"],
      companies: ["Amazon","Google","Microsoft","Meta","Apple","Adobe"],
      problemStatement: "You are given a string s containing only the characters '(', ')', '{', '}', '[' and ']'.\\n\\nDetermine if the input string is valid.\\n\\nA string is valid if:\\n1. Open brackets must be closed by the same type of bracket.\\n2. Open brackets must be closed in the correct order.\\n3. Every close bracket has a corresponding open bracket of the same type.\\n\\nFor example, '()' and '()[]{}' are valid, but '(]' and '([)]' are invalid because the brackets do not close in the correct order.",
      examples: [{"input":"s = \"()\"","output":"true","explanation":"The '(' closes with ')' of the same type in the correct order."},{"input":"s = \"()[]{}\"","output":"true","explanation":"Three independent pairs, each closed correctly."},{"input":"s = \"(]\"","output":"false","explanation":"'(' must close with ')' but it closes with ']' — wrong type."},{"input":"s = \"([)]\"","output":"false","explanation":"'[)' is out of order — the ')' closes the wrong bracket."}],
      constraints: ["The string length is between 1 and 10,000.","The string contains only the characters '(', ')', '{', '}', '[' and ']'."],
      approach: "## Understanding the Problem\\n\\nBrackets come in pairs, and they must close in the correct order. The last opened bracket must be the first one closed — that's exactly **Last-In-First-Out**, which is the signature of a stack!\\n\\n## The Stack Idea\\n\\nWalk through the string one character at a time:\\n\\n- When we see an **opening** bracket ( ( [ { ), push it onto the stack.\\n- When we see a **closing** bracket ( ) ] } ), the bracket on TOP of the stack must be its matching opener. If it matches, pop it; if it doesn't (or the stack is empty), the string is invalid.\\n\\nAt the end, the string is valid only if the stack is empty (every opener got closed).\\n\\n## Pseudocode\\n\\n```\\nFUNCTION isValid(s):\\n    stack = empty stack\\n    mapping = { ')': '(', ']': '[', '}': '{' }\\n\\n    FOR each character c in s:\\n        IF c is an opening bracket (c is in '(' '[' '{'):\\n            PUSH c onto stack\\n        ELSE:\\n            # c is a closing bracket\\n            IF stack is empty:\\n                RETURN false          # no opener to match\\n            IF top of stack != mapping[c]:\\n                RETURN false          # wrong type of opener\\n            POP the stack\\n\\n    RETURN true IF stack is empty ELSE false\\n```\\n\\n## Trace on s = \"([)]\"\\n\\n```\\n'(' -> push -> stack: ['(']\\n'[' -> push -> stack: ['(', '[']\\n')' -> top is '[' but expected '(' -> MISMATCH -> RETURN false\\n```\\n\\nThe string is invalid, which matches the expected answer.\\n\\n## Why a Stack Works\\n\\nThe stack naturally preserves nesting: the most recent opener is on top, so when a closer appears it must match the most recent unclosed opener. Any out-of-order closing is caught instantly.\\n\\n## Complexity Analysis\\n\\n- **Time Complexity: O(n)** — we visit each character exactly once.\\n- **Space Complexity: O(n)** — in the worst case (all opening brackets) the stack holds n items.",
      codeBlocks: [{"language":"python","code":"def isValid(s):\n    stack = []\n    mapping = {')': '(', ']': '[', '}': '{'}\n\n    for c in s:\n        # Opening bracket: push it\n        if c in '([{':\n            stack.append(c)\n        else:\n            # Closing bracket: top must match its opener\n            if not stack or stack[-1] != mapping[c]:\n                return False\n            stack.pop()\n\n    # Valid only if every opener was closed\n    return len(stack) == 0"},{"language":"javascript","code":"function isValid(s) {\n    const stack = [];\n    const mapping = {')': '(', ']': '[', '}': '{'};\n\n    for (const c of s) {\n        // Opening bracket: push it\n        if (c === '(' || c === '[' || c === '{') {\n            stack.push(c);\n        } else {\n            // Closing bracket: top must match its opener\n            if (stack.length === 0 || stack[stack.length - 1] !== mapping[c]) {\n                return false;\n            }\n            stack.pop();\n        }\n    }\n\n    // Valid only if every opener was closed\n    return stack.length === 0;\n}"}],
      timeComplexity: "O(n)", spaceComplexity: "O(n)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    },
{
      slug: "next-greater-element", lessonSlug: "stacks", subtopicSlug: "monotonic-stack",
      title: "Next Greater Element", difficulty: "medium",
      topics: ["Stack","Monotonic Stack","Array"],
      companies: ["Amazon","Google","Microsoft","Meta","Nvidia"],
      problemStatement: "You are given an array of integers. For each element, find the NEXT GREATER element — the first element to its RIGHT that is strictly greater than it.\\n\\nIf no such element exists (the element has nothing bigger to its right), use -1 as the answer.\\n\\nReturn an array where answer[i] is the next greater element for nums[i].\\n\\nFor example, for nums = [4, 1, 2, 3]:\\n- nums[0] = 4 has no bigger element to its right -> -1\\n- nums[1] = 1 -> next bigger is 2\\n- nums[2] = 2 -> next bigger is 3\\n- nums[3] = 3 -> nothing to its right -> -1\\nSo the answer is [-1, 2, 3, -1].",
      examples: [{"input":"nums = [4, 1, 2, 3]","output":"[-1, 2, 3, -1]","explanation":"4 has nothing bigger on the right; 1 -> 2; 2 -> 3; 3 has nothing -> -1."},{"input":"nums = [2, 4]","output":"[4, -1]","explanation":"2's next greater is 4; 4 is the last element -> -1."},{"input":"nums = [1, 3, 2, 4]","output":"[3, 4, 4, -1]","explanation":"1 -> 3; 3 -> 4; 2 -> 4; 4 is last -> -1."},{"input":"nums = [5, 4, 3, 2, 1]","output":"[-1, -1, -1, -1, -1]","explanation":"Every element is the biggest so far to the left — none has a greater element to its right."}],
      constraints: ["The array length is between 1 and 10,000.","Each element is an integer between -10,000 and 10,000."],
      approach: "## Understanding the Problem\\n\\nFor each element, we want the first bigger element to its right. The naive approach — for each element, scan everything to its right — costs O(n^2). The monotonic stack solves it in O(n).\\n\\n## The Key Insight\\n\\nWalk the array from RIGHT to LEFT (or use the popping trick scanning left to right). Keeping a decreasing monotonic stack means:\\n\\n- The stack always holds elements that are still waiting for their next greater element.\\n- When we meet a new element, we pop everything from the stack that is smaller or equal to it. Those popped elements have all found their answer.\\n\\nScanning right to left is the clearest version: for the element at index i, after popping smaller elements, whatever is on top of the stack is exactly its next greater element.\\n\\n## Pseudocode\\n\\n```\\nFUNCTION nextGreaterElements(nums):\\n    n = length of nums\\n    answer = array of size n filled with -1\\n    stack = empty stack\\n\\n    FOR i from n-1 down to 0:            # scan right to left\\n        WHILE stack is not empty AND stack.top <= nums[i]:\\n            POP                                # smaller/equal elements are useless\\n        IF stack is not empty:\\n            answer[i] = stack.top              # nearest greater element to the right\\n        PUSH nums[i] onto stack                # nums[i] now waits for ITS greater element\\n\\n    RETURN answer\\n```\\n\\n## Trace on nums = [4, 1, 2, 3]\\n\\n```\\ni=3, val=3 -> stack empty -> ans[3] = -1; push 3 -> stack: [3]\\ni=2, val=2 -> 3 > 2 -> ans[2] = 3;   push 2 -> stack: [3, 2]\\ni=1, val=1 -> 2 > 1 -> ans[1] = 2;   push 1 -> stack: [3, 2, 1]\\ni=0, val=4 -> pop 1, pop 2, pop 3 (all <= 4) -> stack empty -> ans[0] = -1; push 4\\n\\nanswer = [-1, 2, 3, -1]  ✓\\n```\\n\\nNotice how 4 'absorbed' everything smaller — none of those could be its answer.\\n\\n## Why Each Element Is Processed Only Once\\n\\nEvery element is pushed onto the stack exactly once and popped at most once. That single fact guarantees the total work is linear.\\n\\n## Complexity Analysis\\n\\n- **Time Complexity: O(n)** — each element is pushed once and popped at most once.\\n- **Space Complexity: O(n)** — the stack can hold up to n elements (e.g. a decreasing array).",
      codeBlocks: [{"language":"python","code":"def nextGreaterElements(nums):\n    n = len(nums)\n    answer = [-1] * n\n    stack = []\n\n    # Scan right to left, keeping a decreasing stack\n    for i in range(n - 1, -1, -1):\n        # Pop everything smaller or equal — it can't be the answer\n        while stack and stack[-1] <= nums[i]:\n            stack.pop()\n        # Whatever remains on top is the next greater element\n        if stack:\n            answer[i] = stack[-1]\n        # nums[i] now waits for its own greater element\n        stack.append(nums[i])\n\n    return answer"},{"language":"javascript","code":"function nextGreaterElements(nums) {\n    const n = nums.length;\n    const answer = new Array(n).fill(-1);\n    const stack = [];\n\n    // Scan right to left, keeping a decreasing stack\n    for (let i = n - 1; i >= 0; i--) {\n        // Pop everything smaller or equal — it can't be the answer\n        while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {\n            stack.pop();\n        }\n        // Whatever remains on top is the next greater element\n        if (stack.length > 0) {\n            answer[i] = stack[stack.length - 1];\n        }\n        // nums[i] now waits for its own greater element\n        stack.push(nums[i]);\n    }\n\n    return answer;\n}"}],
      timeComplexity: "O(n)", spaceComplexity: "O(n)",
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
      slug: "valid-parentheses",
      questions: [{"text":"What order does a stack follow?","options":["First-In-First-Out (FIFO)","Last-In-First-Out (LIFO)","Random order","Sorted order"],"correctIndex":1},{"text":"In Valid Parentheses, what do we do when we see an opening bracket?","options":["Pop the stack","Check the top of the stack","Push it onto the stack","Skip it"],"correctIndex":2},{"text":"In Valid Parentheses, when we see a closing bracket, the top of the stack must be what?","options":["Any bracket","A closing bracket","Its matching opening bracket","An empty stack"],"correctIndex":2},{"text":"When is the input string valid at the end of the scan?","options":["When the stack is empty","When the stack has one item","When the stack is full","When the stack is sorted"],"correctIndex":0},{"text":"What is the time complexity of the Valid Parentheses solution?","options":["O(1)","O(log n)","O(n)","O(n^2)"],"correctIndex":2}]
    },
{
      slug: "next-greater-element",
      questions: [{"text":"What kind of stack does the Next Greater Element solution keep?","options":["A monotonic decreasing stack","A monotonic increasing stack","A random stack","No stack at all"],"correctIndex":0},{"text":"What do we do with elements smaller or equal to the current one before reading the answer?","options":["Keep them on the stack","Push them again","Pop them from the stack","Sort them"],"correctIndex":2},{"text":"When the stack is empty after popping, what is the next greater element?","options":["0","The current element","-1","The previous element"],"correctIndex":2},{"text":"Why is the time complexity O(n) instead of O(n^2)?","options":["Because the input is sorted","Because each element is pushed once and popped at most once","Because the stack is never used","Because we use binary search"],"correctIndex":1},{"text":"For nums = [2, 4], what is the output?","options":["[4, 4]","[2, 4]","[-1, -1]","[4, -1]"],"correctIndex":3}]
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
  console.log('\n[SEED] Stacks lesson seeded successfully!');
  console.log('  Lesson:    1 (Stacks)');
  console.log('  Subtopics: ' + subtopics.length + ' (' + subtopics.map(s => s.title).join(', ') + ')');
  console.log('  Problems:  ' + problems.length + ' (' + problems.map(p => p.title).join(', ') + ')');
  console.log('  Quizzes:   ' + quizzes.length);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
