/*
 * Seed Linked Lists lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_linked-lists.mjs
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
    { slug: "linked-lists" },
    {
      title: "Linked Lists",
      slug: "linked-lists",
      category: "linked-lists-stacks-queues",
      description: "Learn the pointer-based data structure that beats arrays at insertions and deletions — how nodes link together, and the two classic skills: reversing a list and detecting cycles with Floyd's algorithm.",
      image: "",
      icon: "Link",
      order: 0,
      difficulty: "medium",
      problemCount: 2
    },
    'Lesson "Linked Lists"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
{
      slug: "singly-linked-list", lessonSlug: "linked-lists", order: 0,
      title: "Singly Linked List",
      description: "Learn what a linked list is, how nodes store data plus a pointer to the next node, why insertions and deletions are O(1) at the head, and the trade-offs compared to arrays.",
      explanation: "## What is a Linked List?\n\nImagine a train. Each carriage holds its cargo, and a coupling links it to the carriage behind it. To visit every carriage you walk from the engine to the back, one coupling at a time. That's a linked list.\n\nA **linked list** is a sequence of **nodes**, where each node holds two things:\n\n1. **Data** — the value you want to store\n2. **Next** — a pointer to the next node in the sequence\n\n```\n[ data | next ] -> [ data | next ] -> [ data | next ] -> null\n    head                                        tail\n```\n\nThe list starts at a special node called the **head**. The last node's `next` points to `null` — that's how you know the list ended.\n\n## Node Anatomy\n\nIn code, a node is usually a tiny class or struct:\n\n```python\nclass Node:\n    def __init__(self, value):\n        self.value = value   # the data\n        self.next = None     # pointer to the next node\n```\n\n## Key Operations and Their Cost\n\n### Traversal — O(n)\n\nTo find a value or reach the kth node, you start at the head and follow `next` pointers one by one. There's no index — you can't jump straight to position 5 like in an array.\n\n```\ncurrent = head\nWHILE current != null:\n    print(current.value)\n    current = current.next\n```\n\n### Insert at the Head — O(1)\n\nInserting at the front is fast: create a new node, point it to the old head, and make it the new head. Two steps, no shifting!\n\n```\nnew_node.next = head\nhead = new_node\n```\n\n### Delete at the Head — O(1)\n\nJust move the head forward: `head = head.next`. The old head is skipped and gets garbage-collected.\n\n### Insert / Delete in the Middle — O(n)\n\nTo insert or delete in the middle, you must first walk to the right spot (O(n)), then fix a couple of pointers (O(1)).\n\n## Linked List vs Array\n\n| Aspect | Array | Linked List |\n|---|---|---|\n| Random access | O(1) — jump straight to index | O(n) — must walk |\n| Insert/delete at head | O(n) — shift everything | O(1) — fix pointers |\n| Memory | Contiguous block | Scattered nodes + pointers |\n| Extra overhead per element | None | One pointer per node |\n| Cache friendliness | Excellent | Poor (nodes scattered) |\n\n## When to Use a Linked List\n\n✅ Frequent insertions/deletions at the head or tail\n✅ You don't know the size in advance\n✅ You need constant-time insertion once you have the node\n❌ You need fast random access (arrays win)\n❌ Memory is tight (each node carries a pointer)\n\n## Key Takeaway\n\nA linked list trades random access for cheap insertions and deletions. Nodes hold data + a pointer, and every operation is about carefully rewiring those pointers — always keep track of the head and never lose the rest of the list.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    },
{
      slug: "fast-slow-pointers", lessonSlug: "linked-lists", order: 1,
      title: "Fast & Slow Pointers",
      description: "Learn the two-pointer technique where one pointer moves twice as fast as the other — how it finds the middle of a list in one pass and detects cycles (Floyd's algorithm) using only O(1) space.",
      explanation: "## The Two Runners\n\nImagine two runners on a circular track. One is fast, one is slow. As long as the track has a loop, the fast runner will always catch up to the slow one from behind. If the track is straight, they never meet again.\n\n**Fast & slow pointers** (also called **Floyd's algorithm** or **tortoise and hare**) apply this idea to linked lists: one pointer moves 1 step per iteration, the other moves 2 steps.\n\n```\nslow = slow.next          # moves 1 step\nfast = fast.next.next     # moves 2 steps\n```\n\n## Finding the Middle in One Pass\n\nMove both pointers from the head. When the fast pointer reaches the end, the slow pointer is exactly at the middle! This works because slow travels half the distance of fast.\n\n```\nList:  1 -> 2 -> 3 -> 4 -> 5 -> null\nslow:  [1]  [2]  [3]  (middle!)\nfast:  [1]  [3]  [5]  (reached end)\n```\n\n## Detecting a Cycle\n\nA **cycle** happens when some node's `next` points back to an earlier node, creating a loop — the list never ends. The classic way to detect it:\n\n1. Start slow and fast at the head\n2. Move slow by 1 and fast by 2\n3. If they ever meet, there's a cycle\n4. If fast reaches `null`, there is no cycle\n\nWhy does the fast pointer catching slow mean a cycle? Because in a loop, the distance between them shrinks by 1 every step (fast gains 1 per move), so they are guaranteed to collide.\n\n## Why This Is Brilliant\n\n- **Time: O(n)** — both pointers together visit each node at most a constant number of times\n- **Space: O(1)** — just two pointers, no hash set, no extra memory\n\nCompare to the naive approach: store every visited node in a hash set and check for repeats — that's O(n) space. Floyd's does it in O(1) space.\n\n## When to Use Fast & Slow Pointers\n\n✅ Detect a cycle in a linked list\n✅ Find the middle of a list\n✅ Find the node where a cycle begins\n✅ Find the kth node from the end\n\n## Key Takeaway\n\nFast & slow pointers are a one-pass, O(1)-space superpower for linked lists: the fast pointer travels twice as far, so wherever they meet or stop tells you something structural about the list — a cycle, the middle, or the end.",
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
      slug: "reverse-linked-list", lessonSlug: "linked-lists", subtopicSlug: "singly-linked-list",
      title: "Reverse a Linked List", difficulty: "medium",
      topics: ["Linked List"],
      companies: ["Amazon","Google","Microsoft","Meta","Apple","Adobe"],
      problemStatement: "You are given the head of a singly linked list. Your task is to reverse the list and return the head of the reversed list.\n\nIn a singly linked list, each node has a value and a pointer to the next node. Reversing means the last node becomes the first, the first becomes the last, and every next pointer is flipped to point backward.\n\nFor example, the list 1 -> 2 -> 3 -> 4 -> 5 becomes 5 -> 4 -> 3 -> 2 -> 1.\n\nThe reversed list must be a NEW arrangement of the same nodes — you should not create a new list, just rewire the pointers.",
      examples: [{"input":"head = [1, 2, 3, 4, 5]","output":"[5, 4, 3, 2, 1]","explanation":"Every next pointer is flipped: 5 -> 4 -> 3 -> 2 -> 1."},{"input":"head = [1, 2]","output":"[2, 1]","explanation":"A two-node list swaps: 2 -> 1."},{"input":"head = []","output":"[]","explanation":"An empty list reversed is still empty."},{"input":"head = [1]","output":"[1]","explanation":"A single node reversed is itself."}],
      constraints: ["The number of nodes is between 0 and 5000.","Each node value is an integer between -5000 and 5000."],
      approach: "## Understanding the Problem\n\nWe must flip every next pointer so the list runs backward. The catch: when you change a node's next pointer, you lose the rest of the list — so you must save the remainder BEFORE rewiring.\n\n## The Iterative Three-Pointer Approach\n\nKeep three pointers as you walk the list:\n\n```\nprev  — the node before current (the reversed part)\ncurr  — the node we are processing now\nnext  — the remainder of the list (saved before rewiring)\n```\n\nFor each node:\n1. Save `next = curr.next` (so we don't lose the list)\n2. Flip: `curr.next = prev` (point backward)\n3. Advance: `prev = curr`, then `curr = next`\n\nWhen `curr` reaches `null`, `prev` is the new head.\n\n## Trace on [1 -> 2 -> 3]\n\n```\nStart: prev = null, curr = 1\n\nStep 1: next = 2, 1.next = null, prev = 1, curr = 2\n        null <- 1    2 -> 3\n\nStep 2: next = 3, 2.next = 1, prev = 2, curr = 3\n        null <- 1 <- 2    3\n\nStep 3: next = null, 3.next = 2, prev = 3, curr = null\n        null <- 1 <- 2 <- 3\n\ncurr is null -> prev is the new head: 3 -> 2 -> 1 ✓\n```\n\n## Complexity Analysis\n\n- **Time Complexity: O(n)** — we visit each node exactly once.\n- **Space Complexity: O(1)** — just three pointer variables, no extra storage.\n\n### Python Code\n\n```python\ndef reverseList(head):\n    prev = None\n    curr = head\n\n    while curr is not None:\n        next_node = curr.next  # save the rest of the list\n        curr.next = prev       # flip the pointer backward\n        prev = curr            # move prev forward\n        curr = next_node       # move curr forward\n\n    return prev  # prev is the new head\n```\n\n### JavaScript Code\n\n```javascript\nfunction reverseList(head) {\n    let prev = null;\n    let curr = head;\n\n    while (curr !== null) {\n        const nextNode = curr.next; // save the rest of the list\n        curr.next = prev;           // flip the pointer backward\n        prev = curr;                // move prev forward\n        curr = nextNode;            // move curr forward\n    }\n\n    return prev; // prev is the new head\n}\n```",
      codeBlocks: [{"language":"python","code":"def reverseList(head):\n    prev = None\n    curr = head\n\n    while curr is not None:\n        next_node = curr.next  # save the rest of the list\n        curr.next = prev       # flip the pointer backward\n        prev = curr            # move prev forward\n        curr = next_node       # move curr forward\n\n    return prev  # prev is the new head"},{"language":"javascript","code":"function reverseList(head) {\n    let prev = null;\n    let curr = head;\n\n    while (curr !== null) {\n        const nextNode = curr.next; // save the rest of the list\n        curr.next = prev;           // flip the pointer backward\n        prev = curr;                // move prev forward\n        curr = nextNode;            // move curr forward\n    }\n\n    return prev; // prev is the new head\n}"}],
      timeComplexity: "O(n)", spaceComplexity: "O(1)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    },
{
      slug: "detect-cycle-floyds", lessonSlug: "linked-lists", subtopicSlug: "fast-slow-pointers",
      title: "Detect Cycle (Floyd's)", difficulty: "medium",
      topics: ["Linked List","Two Pointers"],
      companies: ["Amazon","Google","Microsoft","Apple","Bloomberg"],
      problemStatement: "You are given the head of a linked list. Your task is to determine whether the list contains a cycle.\n\nA cycle exists when a node's next pointer points back to an earlier node, so that walking the list forever never reaches null.\n\nReturn True if there is a cycle in the list, and False otherwise.\n\nYour solution should use O(1) extra space — the classic approach is Floyd's tortoise and hare algorithm (fast & slow pointers).",
      examples: [{"input":"head = [3, 2, 0, -4], cycle at index 1","output":"True","explanation":"The node with value -4 points back to the node with value 2, forming a cycle."},{"input":"head = [1, 2], cycle at index 0","output":"True","explanation":"The node with value 2 points back to the head (value 1) — a self-loop cycle."},{"input":"head = [1]","output":"False","explanation":"A single node whose next is null has no cycle."},{"input":"head = [1, 2]","output":"False","explanation":"A normal list ending in null has no cycle."}],
      constraints: ["The number of nodes is between 0 and 10000.","Each node value is an integer between -10^5 and 10^5.","A cycle index may be any valid position, or -1 for no cycle."],
      approach: "## Understanding the Problem\n\nWe need to detect a cycle using O(1) space. The naive solution stores every visited node in a hash set and checks for repeats — that works but uses O(n) space. Floyd's algorithm does it with just two pointers.\n\n## Floyd's Tortoise and Hare\n\nUse two pointers starting at the head:\n\n```\nslow = slow.next          # moves 1 step\nfast = fast.next.next     # moves 2 steps\n```\n\nIf there is a cycle:\n- The fast pointer enters the loop first and runs around it\n- The slow pointer eventually enters the loop too\n- The fast pointer gains on slow by 1 step per move, so they MUST meet\n\nIf there is no cycle, the fast pointer eventually reaches `null`.\n\n## Step-by-Step Algorithm\n\n1. Set slow and fast to the head\n2. While fast and fast.next are not null:\n   a. Move slow by 1 and fast by 2\n   b. If slow == fast, return True (cycle found)\n3. Return False (fast hit null — no cycle)\n\n## Trace on a Cyclic List 1 -> 2 -> 3 -> back to 2\n\n```\nStart: slow = 1, fast = 1\nStep 1: slow = 2, fast = 3\nStep 2: slow = 3, fast = 2   (fast looped around)\nStep 3: slow = 2, fast = 3\nStep 4: slow = 3, fast = 2\nStep 5: slow = 2, fast = 2   -> MEET! Cycle detected ✓\n```\n\n## Why the Fast Pointer Always Catches Slow\n\nInside a loop, the gap between them shrinks by 1 every step (fast gains 1 each move), so they are guaranteed to collide — no matter where slow enters the loop.\n\n## Complexity Analysis\n\n- **Time Complexity: O(n)** — both pointers together make at most a constant number of passes over the nodes.\n- **Space Complexity: O(1)** — just two pointers, no hash set.\n\n### Python Code\n\n```python\ndef hasCycle(head):\n    slow = head\n    fast = head\n\n    while fast is not None and fast.next is not None:\n        slow = slow.next        # 1 step\n        fast = fast.next.next   # 2 steps\n        if slow == fast:\n            return True         # they met -> cycle\n\n    return False  # fast hit null -> no cycle\n```\n\n### JavaScript Code\n\n```javascript\nfunction hasCycle(head) {\n    let slow = head;\n    let fast = head;\n\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next;        // 1 step\n        fast = fast.next.next;   // 2 steps\n        if (slow === fast) {\n            return true;         // they met -> cycle\n        }\n    }\n\n    return false; // fast hit null -> no cycle\n}\n```",
      codeBlocks: [{"language":"python","code":"def hasCycle(head):\n    slow = head\n    fast = head\n\n    while fast is not None and fast.next is not None:\n        slow = slow.next        # 1 step\n        fast = fast.next.next   # 2 steps\n        if slow == fast:\n            return True         # they met -> cycle\n\n    return False  # fast hit null -> no cycle"},{"language":"javascript","code":"function hasCycle(head) {\n    let slow = head;\n    let fast = head;\n\n    while (fast !== null && fast.next !== null) {\n        slow = slow.next;        // 1 step\n        fast = fast.next.next;   // 2 steps\n        if (slow === fast) {\n            return true;         // they met -> cycle\n        }\n    }\n\n    return false; // fast hit null -> no cycle\n}"}],
      timeComplexity: "O(n)", spaceComplexity: "O(1)",
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
      slug: "reverse-linked-list",
      questions: [{"text":"In the iterative reversal, what must we save BEFORE flipping curr.next?","options":["The prev pointer","The next node (the rest of the list)","The head of the list","The length of the list"],"correctIndex":1},{"text":"What is the time complexity of the iterative reversal?","options":["O(1)","O(n)","O(n log n)","O(n squared)"],"correctIndex":1},{"text":"What is the space complexity of the iterative reversal?","options":["O(n) — we build a new list","O(n) — recursion stack","O(1) — just three pointer variables","O(log n)"],"correctIndex":2},{"text":"What does the ORIGINAL head's next point to after a full reversal?","options":["The second node","Itself","null","The new head"],"correctIndex":2},{"text":"When curr becomes null during reversal, which pointer is the new head?","options":["curr","prev","next","head"],"correctIndex":1}]
    },
{
      slug: "detect-cycle-floyds",
      questions: [{"text":"What is Floyd's cycle-detection algorithm also called?","options":["Tortoise and hare","Binary search","Sliding window","Merge sort"],"correctIndex":0},{"text":"How many steps does the fast pointer take each move?","options":["0","1","2","3"],"correctIndex":2},{"text":"If the fast pointer reaches null, what does that mean?","options":["There is a cycle","There is no cycle","The list has one node","The list is sorted"],"correctIndex":1},{"text":"What is the space complexity of Floyd's algorithm?","options":["O(n) — a hash set of visited nodes","O(n) — a second copy of the list","O(1) — just two pointers","O(log n)"],"correctIndex":2},{"text":"Inside a cycle, by how much does the gap between fast and slow shrink each step?","options":["0","1","2","It grows"],"correctIndex":1}]
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
  console.log('\n[SEED] Linked Lists lesson seeded successfully!');
  console.log('  Lesson:    1 (Linked Lists)');
  console.log('  Subtopics: ' + subtopics.length + ' (' + subtopics.map(s => s.title).join(', ') + ')');
  console.log('  Problems:  ' + problems.length + ' (' + problems.map(p => p.title).join(', ') + ')');
  console.log('  Quizzes:   ' + quizzes.length);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
