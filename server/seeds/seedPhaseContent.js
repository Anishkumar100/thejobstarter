/*
 * seedPhaseContent.js
 * Seeds lessons, subtopics, problems, and languages from claudeContent.md
 * into their respective MongoDB collections.
 *
 * Hierarchy: Lesson → Subtopics → Problems (1 problem per lesson)
 * Subjects:  DSA (6), DBMS (5), OS (5), Programming (5)
 *
 * Usage:
 *   node server/seeds/seedPhaseContent.js
 *   (requires MONGODB_URI in env, defaults to localhost)
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';

import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';

import OsLesson from '../models/OsLesson.js';
import OsSubtopic from '../models/OsSubtopic.js';
import OsProblem from '../models/OsProblem.js';

import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';

import Language from '../models/Language.js';

import DsaMeta from '../models/DsaMeta.js';
import DbmsMeta from '../models/DbmsMeta.js';
import OsMeta from '../models/OsMeta.js';
import ProgrammingMeta from '../models/ProgrammingMeta.js';
import Progress from '../models/Progress.js';
import QuizAttempt from '../models/QuizAttempt.js';

/* ================================================================
 * DSA — Data Structures & Algorithms
 * ================================================================ */

const dsaLessons = [
  {
    title: 'Big O Notation',
    slug: 'big-o-notations',
    category: 'techniques',
    description: 'The language used to describe how an algorithm\'s speed or memory use grows as its input gets bigger.',
    icon: 'TrendingUp',
    order: 1,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Arrays',
    slug: 'arrays',
    category: 'data-structures',
    description: 'The most basic data structure — a numbered row of values that lets you jump straight to any position instantly.',
    icon: 'List',
    order: 2,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Linked Lists',
    slug: 'linked-lists',
    category: 'data-structures',
    description: 'A chain of nodes, each pointing to the next, that lets you insert at the front instantly but access by position slowly.',
    icon: 'Link2',
    order: 3,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Stacks & Queues',
    slug: 'stacks-queues',
    category: 'data-structures',
    description: 'Two restricted-access structures — Last In First Out and First In First Out — built for very specific access patterns.',
    icon: 'Layers',
    order: 4,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Trees',
    slug: 'trees',
    category: 'data-structures',
    description: 'A hierarchical structure — like a family tree or file system — built from a root and branching child nodes.',
    icon: 'GitBranch',
    order: 5,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Graphs',
    slug: 'graphs',
    category: 'data-structures',
    description: 'A network of points connected by links, used to model roads, social networks, and dependencies of all kinds.',
    icon: 'Share2',
    order: 6,
    difficulty: 'hard',
    problemCount: 2
  }
];

const dsaSubtopics = [
  /* Big O Notation */
  {
    title: 'Time Complexity Analysis',
    slug: 'time-complexity',
    description: 'How to count the number of steps an algorithm takes so you can predict how it behaves on large inputs.',
    explanation: `Time complexity answers: "How many operations does this algorithm perform as the input grows?" We count meaningful steps (comparisons, additions, lookups) — not actual seconds, since seconds depend on the machine.

How to analyse any algorithm — a general method:
1. Identify the input size, usually called n.
2. Look for loops. A single loop that runs once per item is O(n). A loop inside another loop is O(n²).
3. Look for repeated (recursive) calls that split the problem — these often lead to O(log n) or O(n log n).
4. Drop constant multipliers. Doing something twice per item is still O(n), not "O(2n)" — constants don't change the growth pattern.
5. Keep only the largest-growing term. If a process involves both an O(n) step and an O(n²) step, the overall complexity is O(n²), because it dominates as n grows.

Worked example — adding up all the numbers in a list:
Imagine you walk through a list once, keeping a running total, and adding each number to that total as you go. You do a fixed amount of setup work (start the total at zero), then one addition per item, then a fixed amount of work to return the answer. Since the middle part depends directly on how many items there are, and everything else is constant, this process is O(n) — linear time.

Common beginner mistakes:
- Thinking that doing a task "twice as often" changes the Big O category — it doesn't; only the shape of growth matters, not the constant factor.
- Forgetting that a loop placed inside another loop multiplies the work, it doesn't just add to it.
- Mixing up worst-case (the guarantee Big O usually describes), best-case, and average-case behaviour.`,
    lessonSlug: 'big-o-notations',
    order: 1
  },
  {
    title: 'Space Complexity',
    slug: 'space-complexity',
    description: 'How to measure the extra memory an algorithm needs, beyond the input it was given.',
    explanation: `Space complexity answers: "How much extra memory does this algorithm need, beyond the input itself?"

Key ideas:
- Auxiliary space — the extra memory you allocate yourself, separate from the input.
- Total space — the input's memory plus the auxiliary space.
- Recursive space — every time a task calls itself, it uses a bit of extra memory to "remember where it was," and this adds up with depth.

Worked example:
If a process makes a brand-new copy of a list so it has the same number of items as the original, that copy needs memory proportional to the size of the input — so it uses O(n) extra space, even though it doesn't take extra time beyond what's needed to fill it in.

Space-time trade-off:
Sometimes you can make something faster by using more memory, or use less memory at the cost of speed. A classic example: keeping a lookup table of values you've already seen costs some memory, but lets you answer "have I seen this before?" instantly instead of searching through everything again.

Analogy:
Time complexity = how many minutes a chef spends cooking. Space complexity = how much counter space the chef needs while cooking.`,
    lessonSlug: 'big-o-notations',
    order: 2
  },

  /* Arrays */
  {
    title: 'Two Pointer Technique',
    slug: 'two-pointer-technique',
    description: 'Use two moving markers instead of nested loops to scan an array in a single pass.',
    explanation: `Instead of checking every possible pair of elements with two nested loops (which is slow), you keep track of two positions ("pointers") in the array and move them toward each other or alongside each other based on simple rules. This often turns an O(n²) approach into an O(n) one.

Common patterns:
- Opposite ends closing in: One marker starts at the beginning, one at the end, and they move toward each other. Great for checking palindromes or finding pairs that add up to a target in a sorted list.
- Slow and fast, same direction: One marker moves one step at a time, the other moves two steps at a time. Useful for finding the middle of a sequence or detecting loops.
- A growing/shrinking window: Both markers start together and the gap between them expands or contracts depending on a condition — this is the basis of the sliding window technique.

Worked example — finding two numbers in a sorted list that add up to a target:
1. Place one marker at the very start of the list and another at the very end.
2. Add the two values the markers are pointing at.
3. If the sum matches the target, you're done — return those two positions.
4. If the sum is too small, move the left marker one step to the right (to get a bigger value).
5. If the sum is too large, move the right marker one step to the left (to get a smaller value).
6. Repeat until the markers meet or the answer is found.

Without this technique, you'd have to compare every pair — that's O(n²). With two markers closing in on a sorted list, it only takes O(n).`,
    lessonSlug: 'arrays',
    order: 1
  },
  {
    title: 'Sliding Window',
    slug: 'sliding-window',
    description: 'Maintain a moving "view" over a continuous stretch of the array instead of recalculating everything from scratch.',
    explanation: `A sliding window is a "view" over a continuous stretch of the array that you move along one step at a time, updating your answer as you go, instead of recalculating everything from scratch each time.

When to use it:
Whenever a problem asks about a continuous chunk of the array or string — things like "the biggest sum in any stretch of 5 numbers" or "the shortest stretch that satisfies some condition."

How it works, step by step:
1. Expand the right edge of the window to include a new element.
2. Check whether the window still satisfies whatever condition the problem asks for.
3. Shrink the left edge of the window if the condition is broken, removing elements until it's valid again.
4. Update your best answer so far each time the window is valid.
5. Repeat until the right edge has covered the whole array.

Worked example — largest sum of any stretch of k consecutive numbers:
1. Add up the first k numbers — this is your starting window sum, and also your current best answer.
2. Move the window one step forward: add the new number entering on the right, and subtract the number leaving on the left.
3. Compare this new window sum to your best answer so far, and keep whichever is bigger.
4. Repeat steps 2–3 until the window has slid all the way to the end of the array.

This takes O(n) time total, compared to recalculating each window's sum from scratch, which would take much longer.

Analogy:
Think of looking through a train window as the train moves — you always see a fixed-size view. As the train moves forward, one thing leaves your view on the left, and one new thing enters on the right.`,
    lessonSlug: 'arrays',
    order: 2
  },

  /* Linked Lists */
  {
    title: 'Singly Linked List Operations',
    slug: 'singly-linked-list',
    description: 'The basic building and moving operations for a chain of nodes, each pointing only forward.',
    explanation: `How to build and work with a chain of nodes, where every node stores a value and a reference to the next node.

Key operations and their cost:
- Insert at the front: Create a new node, point it at the current first node, and make the new node the new front. Instant — O(1).
- Insert at the end: Walk the entire chain to find the last node, then attach the new node there. O(n).
- Delete a node: Walk the chain to find the node just before the one you want to remove, then have it "skip over" the target node. Finding it takes O(n), but the actual removal is O(1) once found.
- Search for a value: Walk from the front, checking each node in turn, until you find it or reach the end. O(n).

Inserting at the front, step by step:
1. Create a brand-new node holding the value you want to add.
2. Point this new node at whatever the current first node is.
3. Mark the new node as the new "front" of the list.

Walking through a list, step by step:
1. Start at the front node.
2. Do whatever you need with the current node's value.
3. Move to the node it points to.
4. Repeat until you reach a node that points to nothing — that's the end.`,
    lessonSlug: 'linked-lists',
    order: 1
  },
  {
    title: 'Fast & Slow Pointers',
    slug: 'fast-slow-pointers',
    description: 'Move two markers through a list at different speeds to find the middle or detect loops in a single pass.',
    explanation: `A technique using two markers that move through the list at different speeds — the slow one moves one step at a time, the fast one moves two steps at a time. Simple, but surprisingly powerful.

Why it works:
Picture two runners starting at the same point on a track, one running twice as fast as the other. By the time the fast runner finishes a lap, the slow runner is exactly halfway. This creates a predictable relationship between their positions that we can use to solve problems.

What this enables:
1. Finding the middle: By the time the fast marker reaches the end, the slow marker is sitting right at the middle.
2. Detecting a loop: If there's a cycle somewhere in the chain, the fast and slow markers will eventually land on the same node at the same time.
3. Finding the item a fixed distance from the end: Move the fast marker ahead by that many steps first, then move both markers together — when the fast one reaches the end, the slow one is at the target.

Detecting a cycle, step by step:
1. Place both a slow marker and a fast marker at the front of the list.
2. Move the slow marker forward by one node, and the fast marker forward by two nodes.
3. If at any point the two markers land on the exact same node, there's a loop.
4. If the fast marker reaches the very end (nowhere left to go), there's no loop.`,
    lessonSlug: 'linked-lists',
    order: 2
  },

  /* Stacks & Queues */
  {
    title: 'Stack Operations & Applications',
    slug: 'stack-applications',
    description: 'The push/pop/peek operations behind undo buttons, browser history, and function calls.',
    explanation: `A stack supports three core operations, all instant (O(1)):
- Push — add an item to the top.
- Pop — remove and return the item currently on top.
- Peek — look at the top item without removing it.

Real-world applications:
- Undo/Redo: Every action gets pushed onto a stack. Undo pops the most recent action off.
- Browser back button: Each page you visit gets pushed; clicking back pops the current page and returns to the one below it.
- Evaluating expressions: Stacks help process nested expressions like parentheses.
- Program execution: Every time a function calls another function, that call gets "pushed"; when it finishes, it's "popped" — this is literally called the call stack.

Checking that brackets are balanced — a classic stack problem, step by step:
1. Go through the text one character at a time.
2. Every time you see an opening bracket, push it onto the stack.
3. Every time you see a closing bracket:
   - If the stack is empty, something's wrong — there's no opening bracket left to match, so it's unbalanced.
   - Otherwise, pop the top item off the stack and check that it's the matching opening bracket. If it doesn't match, it's unbalanced.
4. After processing everything, if the stack is empty, all brackets matched up correctly. If anything is left over, some opening bracket was never closed.`,
    lessonSlug: 'stacks-queues',
    order: 1
  },
  {
    title: 'Queue Operations & Types',
    slug: 'queue-types',
    description: 'The enqueue/dequeue operations behind print queues, task scheduling, and level-by-level exploration.',
    explanation: `A queue supports two core operations, both instant (O(1)):
- Enqueue — add an item to the back.
- Dequeue — remove and return the item at the front.

Queue variations:
- Circular Queue: Uses a fixed amount of space with wrap-around, so the "front" and "back" positions loop back to the start when they reach the end — more memory-efficient than constantly growing.
- Priority Queue: Items are removed based on priority, not just arrival order — the highest-priority item leaves first, no matter when it joined.
- Deque (double-ended queue): You can add or remove from both ends, combining features of a stack and a queue.

Real-world applications:
- Print spooler: Documents wait in a queue and print in the order they were sent.
- Exploring level by level: Breadth-first exploration of a tree or network uses a queue to visit things "layer by layer."
- Task scheduling: An operating system uses queues to decide which waiting task gets the CPU next.
- Messaging systems: Messages wait in a queue until a receiver is ready to process them.`,
    lessonSlug: 'stacks-queues',
    order: 2
  },

  /* Trees */
  {
    title: 'Binary Tree Traversals',
    slug: 'binary-tree-traversals',
    description: 'The standard orders — pre-order, in-order, post-order, and level order — for visiting every node in a tree.',
    explanation: `"Traversing" means visiting every node in a specific order. For binary trees (where each node has at most two children — usually called "left" and "right"), there are three classic depth-first orders, plus one breadth-first order.

The three depth-first orders, explained by when the root is visited:
- Pre-order (root first): Visit the current node, then explore everything to its left, then everything to its right. Useful for creating a copy of the tree structure.
- In-order (root in the middle): Explore everything to the left, then visit the current node, then explore everything to the right. For a Binary Search Tree, this visits every value in sorted order.
- Post-order (root last): Explore everything to the left, then everything to the right, then finally visit the current node. Useful for safely deleting a tree, since you deal with children before their parent.

Level order (breadth-first):
1. Start with the root in a waiting line (a queue).
2. Take the front node out of the line and visit it.
3. Add its children (if any) to the back of the line.
4. Repeat until the line is empty.

This visits the tree one whole level at a time, top to bottom, left to right within each level — like ripples spreading outward.

Memory aid:
The name tells you when the root gets visited relative to its children: Pre-order = before, In-order = between, Post-order = after.`,
    lessonSlug: 'trees',
    order: 1
  },
  {
    title: 'Binary Search Trees',
    slug: 'binary-search-trees',
    description: 'A binary tree that keeps itself organised — smaller values on the left, larger on the right — enabling fast search.',
    explanation: `A Binary Search Tree (BST) is a binary tree with one special rule: for every node, everything in its left branch is smaller, and everything in its right branch is larger.

Picture this BST:
        8
       / \
      3   10
     / \    \
    1   6    14
       / \   /
      4   7 13

Everything under the root's left branch (1, 3, 4, 6, 7) is smaller than 8. Everything under its right branch (10, 13, 14) is larger than 8. This same rule holds true at every single node, not just the root.

Searching in a BST, step by step:
1. Start at the root.
2. If the current node is empty, or its value matches what you're looking for, you're done.
3. If your target is smaller than the current node's value, move to the left branch.
4. If your target is larger, move to the right branch.
5. Repeat until you find the value or run out of tree to search.

Why this is O(log n):
Each step throws away roughly half of the remaining nodes — you never have to check the branch you know can't contain your target. For a balanced tree holding a million values, this means finding anything takes only about 20 steps.

Inserting into a BST, step by step:
1. Start at the root, following the same left/right rule as searching.
2. If you reach an empty spot, that's where the new value belongs — place it there.
3. If the new value is smaller than the current node, go left; if larger, go right, and repeat until you find that empty spot.`,
    lessonSlug: 'trees',
    order: 2
  },

  /* Graphs */
  {
    title: 'Graph Representation',
    slug: 'graph-representation',
    description: 'The two standard ways to store a graph in memory — adjacency matrix and adjacency list — and when to use each.',
    explanation: `Before you can work with a graph, you need to store it somehow. The two most common ways are the adjacency matrix and the adjacency list.

Adjacency Matrix:
A grid where a mark at row A, column B means there's a connection from A to B.

     A  B  C  D
A    0  1  1  0
B    1  0  0  1
C    1  0  0  0
D    0  1  0  0

- Space needed: grows with the square of the number of points — wasteful if there are relatively few connections.
- Checking whether two points are connected: instant.
- Finding all of a point's neighbours: requires scanning a whole row.

Adjacency List (usually the better choice):
Each point simply keeps a small list of the points it's directly connected to.

A connects to: B, C
B connects to: A, D
C connects to: A
D connects to: B

- Space needed: grows with the number of points plus the number of connections — efficient when connections are sparse.
- Checking whether two points are connected: usually fast, proportional to how many neighbours that point has.
- Finding all of a point's neighbours: instant, since they're already listed together.

When to use which:
Use an adjacency matrix when the graph is very densely connected, or you need instant "are these two connected?" checks. Otherwise, an adjacency list is the default, more memory-efficient choice.`,
    lessonSlug: 'graphs',
    order: 1
  },
  {
    title: 'Breadth-First and Depth-First Traversal',
    slug: 'bfs-dfs-traversal',
    description: 'Two core strategies for exploring a graph — spreading out layer by layer, or diving deep down one path first.',
    explanation: `Two fundamental ways to explore a graph. Breadth-first search explores in expanding layers, like ripples spreading in a pond. Depth-first search follows one path as far as it can go before backtracking, like a mouse in a maze committing to one route until it hits a dead end.

Breadth-First Search (BFS), step by step:
1. Put the starting point into a waiting line (a queue) and mark it as visited.
2. Take the point at the front of the line out, and process it.
3. Look at all of its neighbours. For each one you haven't visited yet, mark it visited and add it to the back of the line.
4. Repeat until the line is empty.
- Explores the graph one layer at a time.
- Finds the shortest path in graphs where every connection counts equally.
- Takes time proportional to the number of points plus the number of connections.

Depth-First Search (DFS), step by step:
1. Start at the given point and mark it visited, then process it.
2. Pick any neighbour you haven't visited yet, and repeat this entire process starting from that neighbour.
3. If a point has no unvisited neighbours left, back up to the previous point and try a different neighbour from there.
4. Continue until every reachable point has been visited.
- Goes deep before it goes wide.
- Often uses less memory than BFS on wide, shallow graphs.
- Also takes time proportional to the number of points plus the number of connections.

When to use which:
- Shortest path where every step counts the same → Breadth-first
- Just checking whether a path exists at all → Either
- Ordering tasks with dependencies → Depth-first
- Detecting loops → Depth-first
- Finding clusters of connected points → Either
- Exploring a website's links politely, layer by layer → Breadth-first`,
    lessonSlug: 'graphs',
    order: 2
  }
];

const dsaProblems = [
  {
    title: 'Find the Missing Number',
    slug: 'missing-number',
    lessonSlug: 'big-o-notations',
    subtopicSlug: 'time-complexity',
    difficulty: 'easy',
    topics: ['Arrays', 'Math'],
    companies: ['Microsoft', 'Amazon'],
    problemStatement: 'You\'re given a list containing n - 1 distinct numbers, all taken from the range 1 to n. One number from that range is missing. Find it, ideally without using any extra memory and by scanning the list only once.',
    examples: [
      {
        input: '[3, 7, 1, 2, 8, 4, 5]',
        output: '6',
        explanation: 'Sum of 1 through 8 = 36. Actual sum = 3+7+1+2+8+4+5 = 30. Missing number = 36 - 30 = 6.'
      },
      {
        input: '[1]',
        output: '2',
        explanation: 'Sum of 1 through 2 = 3. Actual sum = 1. Missing number = 3 - 1 = 2.'
      },
      {
        input: '[2]',
        output: '1',
        explanation: 'Sum of 1 through 2 = 3. Actual sum = 2. Missing number = 3 - 2 = 1.'
      }
    ],
    constraints: [
      'The list contains n - 1 distinct integers in the range [1, n].',
      'n is at least 2.',
      'The numbers are not necessarily sorted.'
    ],
    approach: `1. Work out how many numbers there should be: since one is missing, that count is (items in the list) + 1. Call this n.
2. Calculate what the sum of every number from 1 to n should be, using the shortcut formula n × (n + 1) ÷ 2 (a trick a young Gauss famously discovered — you don't need to add 1+2+3+...+n one by one).
3. Add up all the numbers that are actually present in the list.
4. Subtract the actual sum from the expected sum. Whatever is left over is the missing number.

Why this works:
The formula gives you the "should be" total for a complete, unbroken sequence. Since your list is that same sequence with exactly one number taken out, the gap between the expected total and the real total has to be exactly that missing number.

Edge cases to think about:
- Only one number in the list, and it's 1 → missing number is 2.
- Only one number in the list, and it's 2 → missing number is 1.
- Very large lists — the arithmetic-shortcut formula handles this instantly, without needing to loop to compute the expected sum.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Two Sum',
    slug: 'two-sum',
    lessonSlug: 'arrays',
    subtopicSlug: 'two-pointer-technique',
    difficulty: 'easy',
    topics: ['Arrays', 'Hashing', 'Two Pointers'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
    problemStatement: 'Given a list of numbers and a target number, find two numbers in the list that add up to the target, and report their positions. There\'s guaranteed to be exactly one valid answer.',
    examples: [
      {
        input: '[2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: '2 + 7 = 9. Positions 0 and 1.'
      },
      {
        input: '[3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: '2 + 4 = 6. Positions 1 and 2.'
      }
    ],
    constraints: [
      'There is exactly one valid answer.',
      'You may not use the same element twice.',
      'Numbers can be negative.',
      'The list may contain duplicate values.'
    ],
    approach: `1. Keep a running "memory" of every number you've already looked at, along with its position.
2. Go through the list one number at a time.
3. For the current number, work out what value would be needed to reach the target (target minus current number).
4. Check your memory: have you already seen that needed value?
   - If yes, you've found your pair — report the earlier position and the current position.
   - If no, add the current number and its position to your memory, and move to the next number.

Why keep a memory of past numbers?
Without it, for every number you'd have to search through the entire rest of the list to see if its partner exists — that's O(n²). Keeping a quick lookup memory means each check only takes constant time, bringing the whole thing down to O(n).

What if the list is already sorted?
Then the two-pointer technique would work instead, using less extra memory — but only if you don't need to report the original positions, since sorting the list changes where each number sits.

Edge cases:
- Negative numbers work fine — the arithmetic doesn't care about sign.
- If the same number appears more than once, the first time you see it stays in memory, which is fine because you stop as soon as you find a match.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Middle of the Linked List',
    slug: 'middle-of-linked-list',
    lessonSlug: 'linked-lists',
    subtopicSlug: 'fast-slow-pointers',
    difficulty: 'easy',
    topics: ['Linked Lists', 'Two Pointers'],
    companies: ['Amazon', 'Apple', 'Adobe'],
    problemStatement: 'Given the front of a singly linked list, find and return the node in the middle. If there are two middle nodes (an even number of items), return the second one.',
    examples: [
      {
        input: '1 → 2 → 3 → 4 → 5',
        output: '3',
        explanation: 'Odd length: slow lands exactly on the middle node 3.'
      },
      {
        input: '1 → 2 → 3 → 4 → 5 → 6',
        output: '4',
        explanation: 'Even length: slow lands on the second middle node (node 4).'
      }
    ],
    constraints: [
      'The list is singly linked (nodes only point forward).',
      'The list may be empty (return null/nothing).',
      'The number of nodes can be any non-negative integer.'
    ],
    approach: `1. Place both a slow marker and a fast marker at the front of the list.
2. Move the slow marker forward one node at a time, and the fast marker forward two nodes at a time.
3. Keep going until the fast marker either reaches the last node or runs out of nodes to move to.
4. Whatever node the slow marker is sitting on at that point is the middle.

Why this is elegant:
Without this trick, you'd need one full pass just to count how many items are in the list, then a second pass to walk halfway. The fast-slow approach finds the middle in a single pass.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    lessonSlug: 'stacks-queues',
    subtopicSlug: 'stack-applications',
    difficulty: 'easy',
    topics: ['Stacks', 'Strings'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    problemStatement: 'Given a string made up only of the bracket characters (, ), {, }, [, ], determine whether it\'s valid — every opening bracket must have a matching closing bracket, in the correct order.',
    examples: [
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: 'Every opening bracket has a matching closing bracket in the correct nested order.'
      },
      {
        input: '"(]"',
        output: 'false',
        explanation: 'The closing ] does not match the opening ( on top of the stack.'
      },
      {
        input: '"([)]"',
        output: 'false',
        explanation: 'Brackets crisscross: ) closes before its matching ( is reached, because [ is on top of the stack.'
      },
      {
        input: '"((("',
        output: 'false',
        explanation: 'Three opening brackets are never closed — stack is non-empty at the end.'
      }
    ],
    constraints: [
      'The string only contains bracket characters: (, ), {, }, [, ].',
      'The string length can range from 0 to 10^4.',
      'An empty string is considered valid.'
    ],
    approach: `1. Go through the string one character at a time.
2. If the character is an opening bracket, push it onto a stack.
3. If the character is a closing bracket:
   - If the stack is empty, it's invalid — there's nothing to match against.
   - Otherwise, pop the top of the stack and check it's the correct opening bracket for this closing one. If not, it's invalid.
4. After the whole string is processed, check the stack: if it's empty, the string is valid; if anything is left, some opening brackets were never closed, so it's invalid.

Edge cases:
- An empty string is considered valid.
- A single bracket character alone is always invalid.
- ((( is invalid — the stack isn't empty at the end.
- ([)] is invalid — even though every bracket type has a match, the order is wrong (brackets must close inside-out, not crisscross).`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Maximum Depth of a Binary Tree',
    slug: 'max-depth-binary-tree',
    lessonSlug: 'trees',
    subtopicSlug: 'binary-tree-traversals',
    difficulty: 'easy',
    topics: ['Trees', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    problemStatement: 'Given the root of a binary tree, find its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.',
    examples: [
      {
        input: 'root = [3, 9, 20, null, null, 15, 7]',
        output: '3',
        explanation: 'The tree has depth 3: 3 → 20 → 15 (or 3 → 20 → 7).'
      },
      {
        input: 'root = [1, null, 2]',
        output: '2',
        explanation: 'A straight line: 1 → 2. Depth is 2.'
      }
    ],
    constraints: [
      'The tree may be empty (return 0).',
      'Each node has at most two children (binary tree).',
      'The tree may be unbalanced (a straight line).'
    ],
    approach: `1. If the current node doesn't exist (you've gone past a leaf), its depth is 0.
2. Otherwise, find the depth of the left branch (by repeating this same process on it).
3. Find the depth of the right branch the same way.
4. The depth of the current node is 1, plus whichever of the two branch depths is bigger.

This is a great example of divide and conquer: solve the same, smaller problem on the left and right branches, and combine those two results to get the answer for the whole tree.

Edge cases:
- An empty tree has depth 0.
- A tree with just one node has depth 1.
- A tree that's really just a straight line (every node has only one child) has depth equal to the number of nodes — this is the worst case for memory use.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(height of the tree)'
  },
  {
    title: 'Find if a Path Exists in a Graph',
    slug: 'path-exists-in-graph',
    lessonSlug: 'graphs',
    subtopicSlug: 'bfs-dfs-traversal',
    difficulty: 'easy',
    topics: ['Graphs', 'Traversal'],
    companies: ['Amazon', 'Uber', 'Microsoft'],
    problemStatement: 'You\'re given a graph with connections going both ways, along with a source point and a destination point. Determine whether there\'s any valid path connecting the source to the destination.',
    examples: [
      {
        input: 'nodes = 0..5, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5',
        output: 'false',
        explanation: 'Points 0, 1, 2 form one cluster; points 3, 4, 5 form another. No path exists between the two clusters.'
      },
      {
        input: 'nodes = 0..4, edges = [[0,1],[1,2],[2,3],[3,4]], source = 0, destination = 4',
        output: 'true',
        explanation: 'All points are connected in a chain: 0→1→2→3→4. A path exists.'
      }
    ],
    constraints: [
      'Connections go both ways (undirected graph).',
      'The graph may have multiple isolated clusters.',
      'There may be cycles in the graph.'
    ],
    approach: `1. Organise the connections so you can easily look up each point's neighbours.
2. Starting from the source, explore outward (using breadth-first or depth-first search — either works), keeping track of every point you've already visited so you don't loop forever.
3. If, at any point during the exploration, you reach the destination, a path exists — stop and report true.
4. If you run out of new points to explore without ever reaching the destination, no path exists — report false.

Why this works:
Exploring outward from the source visits every point in its entire connected cluster. If the destination belongs to that same cluster, the exploration is guaranteed to reach it eventually. If not, the exploration runs out of places to go, proving there's no path.`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)'
  },
  {
    title: 'Space Complexity Analysis',
    slug: 'space-complexity-analysis',
    lessonSlug: 'big-o-notations',
    subtopicSlug: 'space-complexity',
    difficulty: 'easy',
    topics: ['Complexity Analysis'],
    companies: ['Google', 'Microsoft'],
    problemStatement: 'Given a set of functions, determine the space complexity of each — how much additional memory they use as the input size grows, not counting the input itself.',
    examples: [
      {
        input: 'Function A: uses an array of size n. Function B: uses a 2D array of size n×n. Function C: uses a single variable regardless of input size.',
        output: 'A: O(n), B: O(n²), C: O(1)',
        explanation: 'A allocates n slots → O(n). B allocates an n-by-n grid → O(n²). C uses one fixed variable → O(1).'
      }
    ],
    constraints: ['Ignore the memory used to store the input itself.', 'Assume all variables occupy the same constant amount of space.'],
    approach: `1. Scan the function and note every new data structure it creates. The input data itself does not count toward extra space — only what the function adds on top.
2. For each new structure, determine its size relative to the input size n: a list of n items adds O(n), a 2D grid of n×n adds O(n²), a single counter adds O(1).
3. If the function creates multiple structures nested inside each other (like recursion), account for the maximum depth of that nesting — recursive calls each consume their own stack frame.
4. Report the dominant term, ignoring smaller terms and constant factors, just like with time complexity.`,
    timeComplexity: 'O(f)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Maximum Sum of a Subarray of Fixed Length',
    slug: 'max-sum-subarray-fixed',
    lessonSlug: 'arrays',
    subtopicSlug: 'sliding-window',
    difficulty: 'easy',
    topics: ['Arrays', 'Sliding Window'],
    companies: ['Amazon', 'Google'],
    problemStatement: 'Given a list of integers and a fixed window size k, find the maximum sum of any contiguous subarray of length k.',
    examples: [
      {
        input: 'nums = [2, 1, 5, 1, 3, 2], k = 3',
        output: '9',
        explanation: 'Window positions: [2,1,5]→8, [1,5,1]→7, [5,1,3]→9 (max), [1,3,2]→6. Maximum is 9.'
      }
    ],
    constraints: ['1 ≤ k ≤ nums.length ≤ 10^5', 'Values can be negative.'],
    approach: `1. Start with the sum of the first k elements. Record this as the current best.
2. Slide the window one position to the right: add the new element that enters from the right, and subtract the element that falls out on the left.
3. After each slide, compare the new sum against the current best, keeping whichever is larger.
4. Continue until the window has reached the end of the list, then report the best sum found.

Why this is efficient: Computing each window's sum from scratch costs O(k) per window, totalling O(n×k). Instead of re-computing, the sliding technique only does two operations per slide — one addition and one subtraction reducing the total to O(n).`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Reverse a Singly Linked List',
    slug: 'reverse-linked-list',
    lessonSlug: 'linked-lists',
    subtopicSlug: 'singly-linked-list',
    difficulty: 'easy',
    topics: ['Linked Lists'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    problemStatement: 'Given the head of a singly linked list, reverse it so that the tail becomes the new head and every next pointer points to the previous node.',
    examples: [
      {
        input: 'Head → 1 → 2 → 3 → 4 → 5',
        output: 'Head → 5 → 4 → 3 → 2 → 1',
        explanation: 'Walk through the list once, redirecting each node\'s next pointer to point back at the previous node instead of forward to the next one.'
      }
    ],
    constraints: ['0 ≤ nodes ≤ 5000', 'The list is singly linked — no previous pointers to help.'],
    approach: `1. Keep three references: previous (starts at null), current (starts at the head), and next (temporary storage).
2. While current is not null: save the next node (because we're about to overwrite current.next), set current.next to point to previous, then advance previous to current and current to next.
3. When current reaches null, previous is the new head of the reversed list.

Why three references: Once you change current.next to point backward, you lose the reference to the rest of the list unless you saved it beforehand. This is the most common pointer-manipulation mistake in linked list problems.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Implement a Queue Using Two Stacks',
    slug: 'queue-using-stacks',
    lessonSlug: 'stacks-queues',
    subtopicSlug: 'queue-types',
    difficulty: 'medium',
    topics: ['Stacks', 'Queues', 'Data Structure Design'],
    companies: ['Google', 'Meta', 'Amazon'],
    problemStatement: 'Implement a first-in-first-out (FIFO) queue using only two last-in-first-out (LIFO) stacks. The queue must support push (enqueue), pop (dequeue), peek (front), and empty checks.',
    examples: [
      {
        input: 'push(1), push(2), peek(), pop(), push(3), pop(), empty()',
        output: 'peek=1, pop=1, pop=2, empty=false',
        explanation: 'Elements enter via one stack and exit via the other, reversing their order exactly once so the oldest element is always on top of the output stack.'
      }
    ],
    constraints: ['All operations must run in amortised O(1) time.', 'You may only use standard stack operations: push, pop, peek, isEmpty.'],
    approach: `1. Use two stacks: an "in" stack for pushes and an "out" stack for pops.
2. When pushing, simply push onto the "in" stack.
3. When popping or peeking: if the "out" stack is empty, transfer every element from "in" to "out" by popping from "in" and pushing onto "out" — this reverses the order so the oldest element ends up on top.
4. Then pop (or peek) from the "out" stack.

Why this works: Transferring from "in" to "out" reverses the element order once. After that, every subsequent pop removes elements in the correct FIFO order, until "out" runs empty and needs another transfer. Each element is moved exactly twice total (once in, once out) across its entire lifetime, so the amortised cost per operation is O(1).`,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Validate a Binary Search Tree',
    slug: 'validate-bst',
    lessonSlug: 'trees',
    subtopicSlug: 'binary-search-trees',
    difficulty: 'medium',
    topics: ['Trees', 'Binary Search Trees'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    problemStatement: 'Given the root of a binary tree, determine whether it is a valid binary search tree (BST). A BST must satisfy: every node\'s left subtree contains only values less than the node, and every right subtree contains only values greater than the node.',
    examples: [
      {
        input: 'Root=5, left=1, right=4 (right has left=3, right=6)',
        output: 'false',
        explanation: 'The right child 4 is less than the root 5, which is fine. But 4\'s left child 3 is less than 4 (fine), while 4\'s right child 6 is greater than 4 (fine locally) but also greater than the root 5 — violating the BST property at the root level.'
      }
    ],
    constraints: ['0 ≤ nodes ≤ 10^4', 'Node values can be any integer, including negative.'],
    approach: `1. A BST requires not just that each node respects its immediate parent's value, but that every ancestor's bounds are also respected. A node's allowable range is bounded by its parent's range: left children must stay below the parent's value (and above the parent's own lower bound), right children must stay above (and below the parent's own upper bound).
2. Traverse the tree, passing down a valid range (min, max) for each node.
3. At each node: the node's value must be strictly between min and max. If not, it's invalid.
4. Recurse left with (min, node.value) as the new range, and right with (node.value, max).
5. If all nodes pass their range checks, the tree is a valid BST.

The common mistake: Only checking against the immediate parent. A node may be valid locally but still violate an ancestor's bound — which is why passing the full range down is essential.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)'
  },
  {
    title: 'Clone an Undirected Graph',
    slug: 'clone-graph',
    lessonSlug: 'graphs',
    subtopicSlug: 'graph-representation',
    difficulty: 'medium',
    topics: ['Graphs', 'Traversal'],
    companies: ['Meta', 'Amazon', 'Uber'],
    problemStatement: 'Given a reference to a node in a connected undirected graph, return a deep copy of the entire graph. Each node in the clone must be a new object, but the structure must exactly match the original.',
    examples: [
      {
        input: 'Node 0 connected to 1 and 2. Node 1 connected to 2. Node 2 connected to 0.',
        output: 'A separate graph with identical structure but entirely new node objects.',
        explanation: 'A simple adjacency-based traversal (BFS or DFS) builds the clone. A map tracks which original nodes have already been cloned to avoid duplication and handle cycles.'
      }
    ],
    constraints: ['The graph is connected (one traversal from the given node reaches everything).', 'Node values are unique within each graph.'],
    approach: `1. Use a hash map to associate each original node with its clone. This serves two purposes: it prevents cloning the same node twice (which would break the structure for shared references or cycles), and it provides quick lookups when wiring up neighbours.
2. Starting from the given node, explore using either depth-first (recursive) or breadth-first (queue-based) traversal.
3. When visiting a node for the first time: create its clone, store the mapping, then recursively (or iteratively) visit all its neighbours.
4. For each neighbour, look up its clone from the map (visiting and cloning it first if needed), then add that clone to the current clone's neighbour list.
5. Once the entire traversal completes, return the clone of the starting node.

Why the hash map is essential: Without it, cycles would cause infinite recursion — visiting a node that's already being visited. With it, you check the map first: if the node already has a clone, you return that clone immediately instead of recursing again.`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)'
  }
];

/* ================================================================
 * DBMS — Database Management Systems
 * ================================================================ */

const dbmsLessons = [
  {
    title: 'SQL Basics',
    slug: 'sql-basics',
    category: 'sql',
    description: 'The four core operations for talking to a database — Create, Read, Update, and Delete.',
    icon: 'Database',
    order: 1,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Combining Data from Multiple Tables',
    slug: 'joins-subqueries',
    category: 'sql',
    description: 'How to combine related rows spread across multiple tables using joins and subqueries.',
    icon: 'GitMerge',
    order: 2,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Normalization',
    slug: 'normalization',
    category: 'design',
    description: 'The process of organising a database to eliminate duplicate data and prevent inconsistent updates.',
    icon: 'Layers',
    order: 3,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Indexing & Performance',
    slug: 'indexing-performance',
    category: 'performance',
    description: 'How indexes speed up searching in a database, and how to read a query\'s execution plan to spot slowdowns.',
    icon: 'Zap',
    order: 4,
    difficulty: 'hard',
    problemCount: 2
  },
  {
    title: 'Transactions & Concurrency',
    slug: 'transactions-concurrency',
    category: 'transactions',
    description: 'How databases group operations so they all succeed or all fail together, even with many users at once.',
    icon: 'Shuffle',
    order: 5,
    difficulty: 'hard',
    problemCount: 2
  }
];

const dbmsSubtopics = [
  /* SQL Basics */
  {
    title: 'Filtering Rows by a Condition',
    slug: 'filtering-where',
    description: 'Narrow down which rows a query returns, using comparisons, ranges, and text-pattern matching.',
    explanation: `Filtering narrows down which rows you get back, based on a condition. Without any filter, you get back every single row in the table.

Basic comparisons:
- "Give me all employees whose salary is above a certain number."
- "Give me all products whose price falls between two values."
- "Give me all orders whose status is one of a specific set of allowed values."

Pattern matching:
Filters can also match patterns in text — for example, "find every email address ending in a certain domain" or "find every product name starting with a certain word." A wildcard symbol typically stands in for "any sequence of characters," and another for "exactly one character."

Combining conditions:
Multiple conditions can be joined together — for example: "orders where the total is above a threshold, AND the status is still pending, AND the order was created after a certain date." All three conditions must be true at once for a row to be included.`,
    lessonSlug: 'sql-basics',
    order: 1
  },
  {
    title: 'Aggregating and Grouping Data',
    slug: 'aggregate-groupby',
    description: 'Summarise a whole table — or groups within it — into single values like totals, averages, and counts.',
    explanation: `An aggregate calculation looks across a whole set of rows and boils it down to a single summary number.

Common aggregate calculations:
- Count — how many rows are there?
- Sum — what's the total of a numeric column?
- Average — what's the mean value?
- Maximum / Minimum — what's the largest or smallest value?

Grouping rows before aggregating:
Instead of summarising the entire table at once, you can split rows into groups first (for example, "group by department") and then calculate the summary separately for each group — giving you, say, the total salary per department rather than one grand total.

You can also filter which groups show up in the final result — for example, "only show departments where more than 5 employees work," which is different from filtering individual rows before grouping.

The key distinction:
Filtering individual rows happens before grouping. Filtering entire groups (often based on an aggregate calculation like a group's average) happens after grouping. You can't filter on an aggregate result before that aggregate has actually been calculated.`,
    lessonSlug: 'sql-basics',
    order: 2
  },

  /* Joins */
  {
    title: 'Matching vs. Keeping Everything (Inner and Outer Joins)',
    slug: 'inner-outer-joins',
    description: 'The different join types and how each decides which rows survive when two tables are combined.',
    explanation: `Different join types decide which rows survive when two tables are combined.

- Matching only (inner join): Keeps only the rows that have a match in both tables. If an order references a customer that no longer exists, that order disappears from the result.
- Keep everything from one side (left/right join): Keeps every row from one specified table, filling in blanks for the other table wherever there's no match. For example, keeping every product — even ones that have never been ordered — with empty values shown for their (nonexistent) order details.
- Keep everything from both sides (full outer join): Keeps every row from both tables, filling in blanks wherever there's no match on either side.`,
    lessonSlug: 'joins-subqueries',
    order: 1
  },
  {
    title: 'Subqueries That Depend on the Outer Row (Correlated Subqueries)',
    slug: 'correlated-subqueries',
    description: 'A "question within a question" that re-runs once per outer row, using that row\'s own values.',
    explanation: `A correlated subquery is a smaller question tucked inside a bigger one, where the smaller question depends on values from the row currently being checked in the bigger question. Because of that dependency, it effectively runs once per row of the outer question — which can be slow on large tables.

Example — the same "above department average" problem:
For every employee being examined, a fresh calculation works out the average salary just within that employee's department, and then compares the employee's salary to that freshly-calculated number.

Performance note:
If there are 10,000 employees spread across only 50 departments, repeating this calculation once per employee (10,000 times) is wasteful, since there are really only 50 distinct averages worth calculating. A more efficient approach: calculate each department's average once (by grouping), and then match that pre-calculated average back to each employee.`,
    lessonSlug: 'joins-subqueries',
    order: 2
  },

  /* Normalization */
  {
    title: 'Functional Dependencies',
    slug: 'functional-dependencies',
    description: 'How one piece of data can reliably determine another — the foundation every normal form is built on.',
    explanation: `A functional dependency means one piece of information uniquely determines another. For example, if you know a student's ID number, that alone tells you their name, address, and phone number — the ID "determines" those other fields.

Why this matters for normalisation:
Every level of normalisation is really about finding and removing unwanted dependencies. A partial dependency (where some information only depends on part of what uniquely identifies a row) gets removed at one stage. A transitive dependency (where one non-identifying piece of information depends on another non-identifying piece of information, rather than directly on the identifier) gets removed at a later stage.`,
    lessonSlug: 'normalization',
    order: 1
  },
  {
    title: 'The Strictest Level: Every Determining Fact Must Be a True Identifier',
    slug: 'bcnf-decomposition',
    description: 'A stricter rule than the usual third normal form, requiring every determining fact to uniquely identify a row.',
    explanation: `This stricter level requires that whenever one piece of information reliably determines another, the determining piece must be capable of uniquely identifying a whole row on its own — not just a partial dependency hiding in a larger table.

How to fix a table that breaks this rule:
1. Find a dependency where the determining information isn't capable of uniquely identifying the whole row.
2. Split that dependency out into its own separate table.
3. Remove the dependent information from the original table, since it now lives in the new table.
4. Repeat this process on any remaining tables until none of them break the rule anymore.`,
    lessonSlug: 'normalization',
    order: 2
  },

  /* Indexing */
  {
    title: 'Balanced Tree Indexes',
    slug: 'btree-indexes',
    description: 'The most common index structure in databases, keeping data sorted for fast searches, ranges, and sorting.',
    explanation: `A balanced tree index is a self-organising tree structure that keeps data sorted, allowing searching, inserting, and deleting all in O(log n) time. It's the most common type of index used in databases.

How it works, conceptually:
- Data is stored in evenly-sized chunks called pages.
- Each page points down to smaller groups of pages, forming a tree.
- The actual data (or pointers to it) lives in the bottom layer, called leaf nodes.
- Every leaf node sits at the exact same depth, keeping the tree balanced and predictable.

When it helps most:
- Looking for an exact match, like "find the row where the ID equals a specific value."
- Looking for a range, like "find every row with a date between two values."
- Sorting results by the indexed column.`,
    lessonSlug: 'indexing-performance',
    order: 1
  },
  {
    title: 'Reading Execution Plans',
    slug: 'query-execution-plans',
    description: 'How to read a database\'s plan for running your query, so you can spot slow full-table scans before they hurt.',
    explanation: `An execution plan shows how the database actually intends to carry out your request. Reading it helps you spot performance problems before they become serious.

What to look out for:
- Scanning every row: Reading the entire table from start to finish — usually bad for large tables.
- Using an index to jump straight to matching rows: Usually good.
- Nested comparisons between two tables: For every row in one table, scanning through another table — can be slow if both tables are large.
- Building a lookup table first, then scanning: Often faster than nested comparisons for large tables.`,
    lessonSlug: 'indexing-performance',
    order: 2
  },

  /* Transactions */
  {
    title: 'The Four Guarantees (ACID)',
    slug: 'acid-properties',
    description: 'The four properties — Atomicity, Consistency, Isolation, Durability — that make transactions trustworthy.',
    explanation: `ACID is a set of four guarantees that make transactions trustworthy.

- Atomicity: All-or-nothing. If any part of the transaction fails, everything is rolled back as if it never started.
- Consistency: The database always moves from one valid state to another valid state — none of its rules are ever violated, even temporarily.
- Isolation: Transactions happening at the same time don't interfere with each other — each one behaves as if it were the only one running.
- Durability: Once a transaction is confirmed as complete, the changes are permanent, even if the system crashes immediately afterward.`,
    lessonSlug: 'transactions-concurrency',
    order: 1
  },
  {
    title: 'Isolation Levels',
    slug: 'isolation-levels',
    description: 'The four standard settings that control how much simultaneous transactions are allowed to see of each other.',
    explanation: `There are several standard isolation levels, each preventing a different kind of interference between simultaneous transactions.

Level | Reading unfinished data | Getting different results on repeated reads | New rows appearing on repeated queries
Loosest | Possible | Possible | Possible
Slightly stricter | Prevented | Possible | Possible
Stricter still | Prevented | Prevented | Possible
Strictest | Prevented | Prevented | Prevented

- Reading unfinished data: Seeing changes made by another transaction that hasn't actually been confirmed yet — and might still get undone.
- Different results on repeated reads: Reading the same row twice within one transaction and getting two different answers, because another transaction changed it in between.
- New rows appearing: Running the same query twice and getting a different set of rows the second time, because another transaction inserted or removed rows in between.`,
    lessonSlug: 'transactions-concurrency',
    order: 2
  }
];

const dbmsProblems = [
  {
    title: 'Employees Earning Above Their Department\'s Average',
    slug: 'employee-salary-query',
    lessonSlug: 'sql-basics',
    subtopicSlug: 'aggregate-groupby',
    difficulty: 'easy',
    topics: ['Filtering', 'Aggregation'],
    companies: ['Amazon', 'Google'],
    problemStatement: 'Find every employee who earns more than the average salary within their own department. Report their name, salary, and department name.',
    examples: [
      {
        input: 'Employees table with columns: id, name, salary, dept_id. Departments table with columns: id, name.',
        output: 'List of employee names, salaries, and department names where salary > department average.',
        explanation: 'For each employee, compute the average salary of their department, then keep only employees whose salary exceeds that average.'
      }
    ],
    constraints: [
      'Each employee belongs to exactly one department.',
      'Departments may have zero or more employees.',
      'Salary values are non-negative.'
    ],
    approach: `1. For each department, work out the average salary of everyone in it.
2. Match each employee up with their department's name (by connecting the employee data to the department data through a shared department identifier).
3. Compare each individual employee's salary to their own department's average — not the company-wide average — and keep only the ones who earn more than that.

How the "per-employee comparison" logic works:
For every single employee being checked, the calculation re-computes the average salary just for people in that same department, then checks the current employee against that number. This means the average used is always specific to the employee's own department, not a single company-wide figure.`,
    timeComplexity: 'O(n × d)',
    spaceComplexity: 'O(d)'
  },
  {
    title: 'Total Sales Report by Product',
    slug: 'product-sales-report',
    lessonSlug: 'joins-subqueries',
    subtopicSlug: 'inner-outer-joins',
    difficulty: 'medium',
    topics: ['Joins', 'Aggregation'],
    companies: ['Microsoft', 'Amazon'],
    problemStatement: 'Produce a report showing each product\'s total quantity sold and total revenue, across every region — including products that haven\'t sold at all.',
    examples: [
      {
        input: 'Products table (id, name, price). Sales table (product_id, quantity, region).',
        output: 'Product name | Total Quantity | Total Revenue sorted by revenue descending.',
        explanation: 'Products with no sales appear with 0 quantity and 0 revenue.'
      }
    ],
    constraints: [
      'A product may have zero sales records.',
      'Sales records reference products by a shared identifier.',
      'Revenue = quantity × price at the time of sale.'
    ],
    approach: `1. Start from the full list of products, and connect each one to its matching sales records — but keep every product even if it has zero matching sales records (this is the "keep everything from one side" join type).
2. Group the combined data by product.
3. For each product, add up the total quantity sold and total revenue.
4. For products with no sales at all, treat their missing totals as zero rather than leaving them blank.
5. Sort the final report by revenue, highest first.`,
    timeComplexity: 'O(p + s)',
    spaceComplexity: 'O(p)'
  },
  {
    title: 'Cleaning Up a Repetitive Student Table',
    slug: 'normalise-student-data',
    lessonSlug: 'normalization',
    subtopicSlug: 'functional-dependencies',
    difficulty: 'medium',
    topics: ['Normalization'],
    companies: ['Adobe', 'Oracle'],
    problemStatement: 'You\'re given a messy student table where each student has multiple "Course1 / Instructor1, Course2 / Instructor2..." columns repeated side by side. Reorganise it into properly normalised tables.',
    examples: [
      {
        input: 'Student table with columns: student_id, name, course1, instructor1, course2, instructor2, course3, instructor3.',
        output: 'Three tables: Student (id, name), Course (id, name, instructor), Enrollment (student_id, course_id).',
        explanation: 'Repeating groups removed into a separate Enrollment table. Instructor info moved to its own Course table.'
      }
    ],
    constraints: [
      'Each student can be enrolled in multiple courses.',
      'Each course has exactly one instructor.',
      'A course can have many enrolled students.'
    ],
    approach: `1. Remove repeating groups: Instead of separate columns for each course a student takes, create one row per student-course pairing. Now you have a simple Student table, plus a separate Enrollment table linking students to courses.
2. Remove partial dependencies: Check whether any piece of information in the Enrollment table depends on only part of what uniquely identifies each row. If not, this step is already satisfied.
3. Remove transitive dependencies: Notice that the instructor teaching a course depends on the course itself, not on which student is enrolled. Move instructor information into its own Course table, connected by course, rather than leaving it duplicated inside the Enrollment table.`,
    timeComplexity: 'O(r)',
    spaceComplexity: 'O(e + c)'
  },
  {
    title: 'Speeding Up a Slow Multi-Table Query',
    slug: 'query-optimizer-analysis',
    lessonSlug: 'indexing-performance',
    subtopicSlug: 'query-execution-plans',
    difficulty: 'hard',
    topics: ['Indexing', 'Performance'],
    companies: ['Google', 'Meta'],
    problemStatement: 'A query joining five tables with several filter conditions on un-indexed columns is taking 30 seconds. Recommend fixes to bring it under 1 second.',
    examples: [
      {
        input: 'Slow query joining 5 tables with filters on date, status, and customer_id. No indexes on filtered columns.',
        output: 'Query runs in under 1 second after adding indexes and rewriting date filters.',
        explanation: 'Indexing the filtered/joined columns and avoiding wrapping columns in functions eliminates full-table scans.'
      }
    ],
    constraints: [
      'Tables range from 10K to 1M rows.',
      'Filters use date ranges, status equality, and customer lookups.',
      'No existing indexes on the filtered columns.'
    ],
    approach: `1. Examine the execution plan to identify which parts of the query are scanning entire tables instead of using an index.
2. Add indexes on the columns that are actually used for joining tables together and for filtering — especially combined (multi-column) indexes when a query filters on more than one column at once.
3. Avoid wrapping a filtered column in a calculation (like extracting just the year from a date), since that usually prevents the database from using an index at all. Instead, filter using a plain range (like "on or after the start of the year, and before the start of the next year").
4. Re-check the execution plan afterward to confirm the slow full-table scans have been replaced with fast index lookups.`,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Detecting a Deadlock',
    slug: 'deadlock-detection',
    lessonSlug: 'transactions-concurrency',
    subtopicSlug: 'acid-properties',
    difficulty: 'hard',
    topics: ['Concurrency', 'Transactions'],
    companies: ['Oracle', 'Microsoft'],
    problemStatement: 'Given a set of transactions and the locks they\'re each waiting on, detect whether a deadlock exists.',
    examples: [
      {
        input: 'T1 holds lock A, waits for lock B. T2 holds lock B, waits for lock A.',
        output: 'Deadlock detected (cycle: T1 → T2 → T1).',
        explanation: 'T1 can\'t proceed until T2 releases B; T2 can\'t proceed until T1 releases A. They\'re stuck forever.'
      }
    ],
    constraints: [
      'A transaction may hold multiple locks simultaneously.',
      'A transaction may wait on at most one resource at a time.',
      'Locks are exclusive (only one holder).'
    ],
    approach: `1. Build a diagram where each transaction is a point, and a connection is drawn from Transaction X to Transaction Y whenever X is waiting on something Y is holding.
2. Explore this diagram, starting from each point, looking for a path that eventually loops back to where it started.
3. If such a loop exists, a deadlock is present among the transactions in that loop.`,
    timeComplexity: 'O(T + E)',
    spaceComplexity: 'O(T + E)'
  },
  {
    title: 'Filter Employees by Multiple Conditions',
    slug: 'filter-employees-sql',
    lessonSlug: 'sql-basics',
    subtopicSlug: 'filtering-where',
    difficulty: 'easy',
    topics: ['SQL', 'Filtering'],
    companies: ['Amazon', 'Microsoft'],
    problemStatement: 'Given an Employees table with columns (id, name, department, salary, hire_date), write a query to find employees earning above 60,000 in the Engineering department who were hired after January 1, 2022.',
    examples: [
      {
        input: 'Employees table with 20 rows across 4 departments.',
        output: 'List of Engineering employees with salary > 60000 and hire_date > 2022-01-01.',
        explanation: 'The WHERE clause combines three conditions with AND: department = \'Engineering\', salary > 60000, hire_date > \'2022-01-01\'.'
      }
    ],
    constraints: ['All columns exist and are non-null.', 'Dates are stored in YYYY-MM-DD format.'],
    approach: `1. Start with a basic SELECT * FROM Employees to establish the data source.
2. Add a WHERE clause that filters using the AND operator to combine multiple conditions: department = 'Engineering' AND salary > 60000 AND hire_date > '2022-01-01'.
3. Each condition in the WHERE clause narrows the result further — only rows satisfying ALL conditions survive.
4. Optionally, select only specific columns instead of * to return a cleaner result set.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Find Customers Who Have Not Ordered in the Last 6 Months',
    slug: 'inactive-customers',
    lessonSlug: 'joins-subqueries',
    subtopicSlug: 'correlated-subqueries',
    difficulty: 'medium',
    topics: ['SQL', 'Subqueries'],
    companies: ['Flipkart', 'Amazon'],
    problemStatement: 'Using a correlated subquery (not a JOIN), find every customer from the Customers table who has zero orders in the Orders table within the last 6 months.',
    examples: [
      {
        input: 'Customers: 50 entries. Orders: 200 entries spanning 12 months.',
        output: '12 customers with no orders in the last 6 months.',
        explanation: 'For each customer, the correlated subquery checks whether any matching order exists within the date range — if none does, the customer is included.'
      }
    ],
    constraints: ['Use a correlated subquery rather than a LEFT JOIN / IS NULL pattern.', 'The subquery must reference the outer query\'s customer ID.'],
    approach: `1. Write an outer query that iterates through every customer.
2. For each customer, run a correlated subquery against the Orders table: "SELECT 1 FROM Orders WHERE customer_id = outer.customer_id AND order_date >= date_six_months_ago".
3. Use NOT EXISTS (or NOT IN, though EXISTS is generally more efficient and handles NULLs better) to keep only those customers whose subquery returns no rows.
4. The subquery is "correlated" because it refers to the outer query's customer_id — it must be re-evaluated for every customer row individually.

Why a correlated subquery: A regular subquery runs once and returns a static result. A correlated subquery runs once per outer row, which is necessary here because the check depends on each specific customer's ID.`,
    timeComplexity: 'O(c × o)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Decompose a Relation to BCNF',
    slug: 'bcnf-decomposition',
    lessonSlug: 'normalization',
    subtopicSlug: 'bcnf-decomposition',
    difficulty: 'hard',
    topics: ['Normalization', 'BCNF'],
    companies: ['Oracle', 'IBM'],
    problemStatement: 'Given a relation R(A, B, C, D) with functional dependencies, decompose it into BCNF. Identify all candidate keys, check each dependency for BCNF violation, and perform lossless decomposition.',
    examples: [
      {
        input: 'R(A, B, C, D). FDs: AB → C, C → D, D → A',
        output: 'R1(A, B, C) and R2(C, D) or R3(A, D) depending on decomposition order — both lossless.',
        explanation: 'C → D violates BCNF (C is not a superkey). Decompose around it: R1 contains C and D, R2 contains everything else (A, B, C).'
      }
    ],
    constraints: ['The decomposition must be lossless (no information lost on join).', 'List all candidate keys before decomposing.'],
    approach: `1. Identify all candidate keys by examining the functional dependencies and finding minimal attribute sets that determine everything.
2. For each functional dependency X → Y, check whether X is a superkey. If not, it violates BCNF.
3. Decompose around the violating dependency: create one relation containing X ∪ Y, and another containing all attributes except Y (but keep X as the join key between them).
4. Repeat steps 2-3 for each resulting relation until every dependency's left-hand side is a superkey in its relation.
5. Verify the decomposition is lossless: joining the decomposed relations on their common attributes must reproduce the original relation exactly.`,
    timeComplexity: 'O(f × r)',
    spaceComplexity: 'O(r)'
  },
  {
    title: 'Choose the Right Index for a Query Pattern',
    slug: 'index-selection',
    lessonSlug: 'indexing-performance',
    subtopicSlug: 'btree-indexes',
    difficulty: 'medium',
    topics: ['Indexing', 'Performance'],
    companies: ['Oracle', 'Google'],
    problemStatement: 'Given a query that filters on (department, hire_date) and sorts by hire_date, recommend whether a single-column index, a composite index, or no index is best — and explain why.',
    examples: [
      {
        input: 'Query: "SELECT * FROM Employees WHERE department = \'Engineering\' ORDER BY hire_date". Table has 1M rows, 10 distinct departments.',
        output: 'Composite index on (department, hire_date) — covers both the filter and the sort in one structure.',
        explanation: 'A single-column B-tree on department narrows to 100K Eng rows, but must sort separately. A composite B-tree (department, hire_date) is already sorted by date within each department — no extra sort needed.'
      }
    ],
    constraints: ['The database supports standard B-tree indexes.', 'Only one index can be added (choose the most impactful).'],
    approach: `1. Analyse the query's WHERE clause (filter) and ORDER BY clause (sort) to identify which columns are referenced.
2. A composite index on (department, hire_date) places rows with the same department physically close together, ordered by hire_date within each department.
3. The database can seek directly to 'Engineering' in the B-tree, then scan forward in hire_date order — the result is already sorted by the index's physical order, eliminating an expensive filesort.
4. Without an index: full table scan (1M rows read) + external sort. With a single-column index on department: 100K rows read + sort. With the composite index: only Engineering rows read, already sorted — minimal cost.`,
    timeComplexity: 'O(log n + k)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Detecting Isolation-Level Anomalies',
    slug: 'isolation-anomalies',
    lessonSlug: 'transactions-concurrency',
    subtopicSlug: 'isolation-levels',
    difficulty: 'hard',
    topics: ['Concurrency', 'Transactions', 'Isolation'],
    companies: ['Oracle', 'Microsoft'],
    problemStatement: 'Given a sequence of interleaved transactions, identify which isolation level was used by analysing which anomalies (dirty read, non-repeatable read, phantom read) occurred.',
    examples: [
      {
        input: 'T1 reads salary=50, T2 changes salary to 60 and commits, T1 reads salary=60 within the same transaction.',
        output: 'Non-repeatable read occurred — isolation level was at most READ COMMITTED.',
        explanation: 'READ COMMITTED prevents dirty reads (uncommitted data) but allows non-repeatable reads (different values on repeated reads within a single transaction). REPEATABLE READ would have returned 50 on both reads.'
      }
    ],
    constraints: ['Standard SQL isolation levels: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE.', 'Each level prevents a specific set of anomalies.'],
    approach: `1. Examine the transaction log for each anomaly type: a dirty read occurs if a transaction reads data another transaction wrote but hasn't committed yet.
2. A non-repeatable read occurs if the same row read twice within one transaction returns different values (because another transaction committed an update in between).
3. A phantom read occurs if a re-executed range query returns a different set of rows (because another transaction inserted or deleted rows that fall within that range).
4. Map the observed anomalies to the weakest isolation level that permits them. For example, if only phantoms occur, the level is REPEATABLE READ (which prevents dirty + non-repeatable but allows phantoms).`,
    timeComplexity: 'O(t)',
    spaceComplexity: 'O(1)'
  }
];

/* ================================================================
 * OS — Operating Systems
 * ================================================================ */

const osLessons = [
  {
    title: 'Process Management',
    slug: 'process-management',
    category: 'process',
    description: 'How the operating system creates, tracks, and switches between running programs.',
    icon: 'Cpu',
    order: 1,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'CPU Scheduling',
    slug: 'cpu-scheduling',
    category: 'scheduling',
    description: 'The algorithms that decide which waiting process gets the processor next, and for how long.',
    icon: 'Clock',
    order: 2,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Memory Management',
    slug: 'memory-management',
    category: 'memory',
    description: 'How the operating system allocates memory and creates the illusion that every process has it all to itself.',
    icon: 'HardDrive',
    order: 3,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'File Systems',
    slug: 'file-systems',
    category: 'storage',
    description: 'How data is organised, stored, and retrieved from disk, including how disk requests are ordered.',
    icon: 'FolderOpen',
    order: 4,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Synchronisation & Deadlocks',
    slug: 'sync-deadlocks',
    category: 'synchronization',
    description: 'How to safely coordinate access to shared resources between processes, and how deadlocks form.',
    icon: 'Shield',
    order: 5,
    difficulty: 'hard',
    problemCount: 2
  }
];

const osSubtopics = [
  /* Process Management */
  {
    title: 'Process States & Transitions',
    slug: 'process-states',
    description: 'The lifecycle a process moves through — New, Ready, Running, Waiting, Terminated.',
    explanation: `A process moves through a series of states over its lifetime:

New → Ready → Running → Terminated
            ↑            ↓
            ← ← ← ← ← Waiting

- New: The process is being set up.
- Ready: Loaded into memory, waiting for its turn on the processor.
- Running: Currently executing on the processor.
- Waiting: Paused, blocked on something external like disk or keyboard input.
- Terminated: Finished running.`,
    lessonSlug: 'process-management',
    order: 1
  },
  {
    title: 'Context Switching',
    slug: 'context-switching',
    description: 'How the CPU saves one process\'s state and loads another\'s when it switches who\'s running.',
    explanation: `When the processor switches from running one process to running another, it has to save the current process's exact state (what instruction it was on, what its variables held, etc.) and load the next process's saved state. This is a context switch.

The cost:
Context switching is pure overhead — it doesn't accomplish any actual work for either process, it's just the "cost of switching attention." Frequent switching can noticeably slow down overall throughput.

What gets saved (in something called a Process Control Block):
- A unique identifier for the process.
- Exactly which instruction it should resume from.
- The values held in the processor's working registers at that moment.
- Information about which parts of memory belong to it.
- The status of any files or resources it has open.`,
    lessonSlug: 'process-management',
    order: 2
  },

  /* CPU Scheduling */
  {
    title: 'First-Come-First-Served & Shortest-Job-First',
    slug: 'fcfs-sjf',
    description: 'Two simple scheduling rules — run whoever arrived first, or run whoever needs the least time.',
    explanation: `First-Come-First-Served:
- Whoever arrives first runs first, all the way through, without being interrupted.
- Simple, but suffers from the convoy effect: if a very long process happens to arrive first, everything behind it has to wait, even short, quick processes.

Shortest-Job-First:
- The process needing the least amount of time runs next.
- Mathematically proven to give the smallest possible average waiting time.
- Can cause starvation: if short processes keep arriving, a long process might get pushed back indefinitely and never actually run.`,
    lessonSlug: 'cpu-scheduling',
    order: 1
  },
  {
    title: 'Round Robin Scheduling',
    slug: 'round-robin',
    description: 'Give every process a small, fixed time slice in rotation, so nothing waits forever.',
    explanation: `Every process gets a small, fixed slice of time (called a quantum). When its slice runs out, it goes to the back of the waiting line and the next process gets its turn.

The trade-off around slice size:
- A small slice: Very responsive, good for interactive use, but causes lots of context-switch overhead since switching happens so often.
- A large slice: Less overhead, but less responsive — with a large enough slice, it starts behaving just like first-come-first-served.

Rule of thumb: The slice should be a bit larger than the actual cost of a context switch, so most of the time is spent doing real work rather than switching between processes.`,
    lessonSlug: 'cpu-scheduling',
    order: 2
  },

  /* Memory Management */
  {
    title: 'Paging & Virtual Memory',
    slug: 'paging-virtual-memory',
    description: 'How memory is split into fixed-size pages, letting a process use more memory than physically exists.',
    explanation: `Paging splits memory into fixed-size chunks: pages in virtual memory, and frames in physical memory. A lookup table maps each virtual page to wherever its data actually lives in physical memory.

Why have virtual memory at all?
A program might need more memory than the computer physically has. Virtual memory lets parts of a process sit on disk until they're actually needed, creating the illusion of nearly unlimited memory.

Page fault: When a program tries to use a page that isn't currently loaded into physical memory, the operating system has to fetch it from disk. This is dramatically slower than accessing memory that's already loaded — often tens of thousands of times slower.`,
    lessonSlug: 'memory-management',
    order: 1
  },
  {
    title: 'Page Replacement Algorithms',
    slug: 'page-replacement',
    description: 'The strategies for choosing which page to evict when memory is full and a new one needs to load.',
    explanation: `When physical memory is full and a new page needs to be loaded, the operating system must evict something. Which page should be evicted?

- First In, First Out: Evict whichever page has been in memory the longest. Simple, but can behave counter-intuitively — sometimes adding more memory actually causes more page faults, a quirk known as Belady's Anomaly.
- Least Recently Used: Evict the page that hasn't been touched for the longest time. Generally performs well, but is more complex to implement precisely.
- Optimal (theoretical only): Evict the page that won't be needed again for the longest time in the future. This is the best possible choice, but it's impossible in real systems since you can't actually see the future — it's mainly used as a benchmark to compare other strategies against.
- Clock (a practical approximation of Least Recently Used): Every page has a simple "recently used" flag. A pointer sweeps around, clearing flags as it goes; the first page it finds with a cleared flag gets evicted.`,
    lessonSlug: 'memory-management',
    order: 2
  },

  /* File Systems */
  {
    title: 'File Allocation Methods',
    slug: 'file-allocation',
    description: 'Three ways to lay out a file\'s data on disk — contiguous, linked, or indexed — each with its own trade-offs.',
    explanation: `Contiguous allocation: Each file occupies one unbroken stretch of disk space.
- Pros: Fast to read sequentially or jump to any part; simple to manage.
- Cons: Leaves gaps of unusable space over time (fragmentation); you need to know the file's size in advance.

Linked allocation: Each chunk of the file points to the location of the next chunk.
- Pros: No fragmentation; files can grow freely over time.
- Cons: Slow to jump to a specific point (you must follow the chain from the start); some space is spent just on the pointers themselves.

Indexed allocation: Each file has a separate index listing every chunk it uses.
- Pros: Fast to jump to any point; no fragmentation.
- Cons: The index itself takes up extra space, which is wasteful for very small files.`,
    lessonSlug: 'file-systems',
    order: 1
  },
  {
    title: 'Disk Scheduling Algorithms',
    slug: 'disk-scheduling',
    description: 'The strategies that decide the order in which pending disk requests are served, to minimise head movement.',
    explanation: `The disk's read/write head has to physically move to the right location to access data. Scheduling algorithms aim to minimise how much it has to move.

- First-Come-First-Served: Handle requests strictly in the order they arrive. Fair, but can mean a lot of unnecessary back-and-forth movement.
- Shortest-Seek-Time-First: Always handle whichever request is physically closest right now. Better overall throughput, but can leave a distant request waiting indefinitely.
- Elevator-style sweep: Move steadily in one direction, handling every request along the way, then reverse direction once you hit the end — just like a lift.
- One-directional sweep with a jump-back: Move in one direction only, servicing requests, then jump straight back to the start rather than sweeping backward — this gives more consistent wait times.
- Sweep that turns around at the last request (rather than the physical end of the disk): A refinement of the sweeping approaches above, avoiding wasted movement past the final actual request.`,
    lessonSlug: 'file-systems',
    order: 2
  },

  /* Sync */
  {
    title: 'Locks and Counting Permits',
    slug: 'semaphores-mutexes',
    description: 'The basic tools — locks and counting permits — used to make sure shared resources aren\'t touched unsafely.',
    explanation: `A simple lock (binary lock, sometimes called a mutex): Has exactly two states — locked and unlocked. Typically, only whoever locked it is allowed to unlock it. Used to guarantee that only one thread touches a shared resource at a time:
1. Before entering the shared section, acquire the lock — if it's already locked, wait until it's free.
2. Do the work that needs exclusive access.
3. Release the lock so someone else can acquire it.

A counting permit system (counting semaphore): A generalised version with a running count, starting at however many identical resources are available. Useful for managing a pool of resources rather than a single one — for example, allowing up to 5 simultaneous connections.`,
    lessonSlug: 'sync-deadlocks',
    order: 1
  },
  {
    title: 'Classic Synchronisation Problems',
    slug: 'classic-sync-problems',
    description: 'Three famous scenarios — producer-consumer, dining philosophers, readers-writers — that expose synchronisation pitfalls.',
    explanation: `Producer-Consumer: Producers add items to a shared, limited-size buffer; consumers remove items from it. This needs three coordinating mechanisms: one tracking how many empty slots remain, one tracking how many filled slots exist, and one ensuring only one party touches the buffer at a time.

Dining Philosophers: Five people sit around a table with five utensils between them, and each person needs two utensils to eat. How do you prevent everyone from grabbing one utensil each and waiting forever for the second? Common solutions: require picking up both utensils at the exact same time, or limit how many people are allowed to attempt eating simultaneously.

Readers-Writers: Multiple readers can safely read shared data at the same time, but a writer needs completely exclusive access. Typical solution: readers may proceed as long as no writer is currently active; writers wait until all current readers have finished.`,
    lessonSlug: 'sync-deadlocks',
    order: 2
  }
];

/*
 * OS Problems — NOTE: OsProblem model does NOT have codeBlocks field
 */
const osProblems = [
  {
    title: 'First-Come-First-Served Scheduling Calculator',
    slug: 'process-scheduling-calculator',
    lessonSlug: 'process-management',
    subtopicSlug: 'process-states',
    difficulty: 'easy',
    topics: ['Process Scheduling'],
    companies: ['Microsoft', 'Amazon'],
    problemStatement: 'Given a list of processes with their arrival times and how long each one needs to run (burst time), calculate each process\'s waiting time and turnaround time, assuming processes run strictly in the order they arrive.',
    examples: [
      {
        input: 'P1: arrival=0, burst=5 | P2: arrival=1, burst=3 | P3: arrival=2, burst=8',
        output: 'P1: wait=0, turnaround=5 | P2: wait=4, turnaround=7 | P3: wait=6, turnaround=14. Average wait = 3.67, average turnaround = 9.0.',
        explanation: 'P1 runs 0-5, P2 runs 5-8, P3 runs 8-16. Wait times: P1=0, P2=5-1=4, P3=8-2=6.'
      }
    ],
    constraints: [
      'All processes arrive within the simulation timeframe.',
      'Burst times are positive integers.',
      'Processes cannot be interrupted (non-preemptive).'
    ],
    approach: `1. Sort the processes by arrival time (in this scheduling rule, whoever arrives first runs first).
2. Track a running "current time," starting at the first process's arrival time.
3. For each process in order: its waiting time is the current time minus its arrival time; run it for its full burst time, advancing the current time by that amount; its turnaround time is its finish time minus its arrival time.
4. Average the waiting times and turnaround times across all processes.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Simulating Round Robin',
    slug: 'round-robin-quantum',
    lessonSlug: 'cpu-scheduling',
    subtopicSlug: 'round-robin',
    difficulty: 'medium',
    topics: ['CPU Scheduling'],
    companies: ['Google', 'Meta'],
    problemStatement: 'Simulate Round Robin scheduling for a set of processes with a given time slice, and report each process\'s completion time along with the number of switches between processes.',
    examples: [
      {
        input: 'P1: burst=10, P2: burst=5, P3: burst=8. Time slice = 4. All arrive at time 0.',
        output: 'P1 completes at 17, P2 completes at 13, P3 completes at 23. Context switches counted.',
        explanation: 'Round 1: P1 runs 4 (6 left), P2 runs 4 (1 left), P3 runs 4 (4 left). Round 2: P1 runs 4 (2 left), P2 runs 1 (finishes), P3 runs 4 (finishes). Round 3: P1 runs 2 (finishes).'
      }
    ],
    constraints: [
      'All processes arrive at or before time 0.',
      'Time slices are fixed and equal for all processes.',
      'Context switch overhead is not counted in burst time.'
    ],
    approach: `1. Put every process into a waiting line in arrival order.
2. Take the process at the front of the line and let it run for up to one time slice, or until it finishes — whichever comes first.
3. If it still has work left after its slice, send it to the back of the line.
4. If it finishes, record its completion time.
5. Repeat until the line is empty, counting each handoff between processes as one context switch.`,
    timeComplexity: 'O(total burst / quantum × n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Simulating Least-Recently-Used Page Replacement',
    slug: 'lru-page-replacement',
    lessonSlug: 'memory-management',
    subtopicSlug: 'page-replacement',
    difficulty: 'medium',
    topics: ['Memory Management'],
    companies: ['Amazon', 'Adobe'],
    problemStatement: 'Given a sequence of page requests and a fixed number of available memory frames, simulate Least-Recently-Used replacement and count how many page faults occur.',
    examples: [
      {
        input: 'Requests: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2]. Frames = 4.',
        output: '9 page faults',
        explanation: 'Pages 7,0,1,2 fault in. 0 is a hit. 3 faults, evicting 2. 0 is a hit. 4 faults, evicting 7. 2 faults, evicting 1. 3 is a hit. 0 faults, evicting 4. 3 is a hit. 2 is a hit. Total = 9 faults.'
      }
    ],
    constraints: [
      'Memory frames are fixed and limited.',
      'Page requests are given as a sequence of page numbers.',
      'LRU tracks recency of use, not frequency.'
    ],
    approach: `1. Keep track of which pages are currently loaded, along with how recently each was used.
2. For each requested page: if it's already loaded, mark it as just-used and move on (a "hit," no fault).
3. If it's not loaded and there's still free space, load it and mark it just-used (a "fault," but no eviction needed).
4. If it's not loaded and memory is full, evict whichever loaded page was used least recently, then load the new page in its place (a "fault," with an eviction).
5. Count every fault along the way.`,
    timeComplexity: 'O(n × f)',
    spaceComplexity: 'O(f)'
  },
  {
    title: 'Simulating an Elevator-Style Disk Sweep',
    slug: 'scan-disk-scheduling',
    lessonSlug: 'file-systems',
    subtopicSlug: 'disk-scheduling',
    difficulty: 'medium',
    topics: ['Disk Scheduling'],
    companies: ['Microsoft', 'Seagate'],
    problemStatement: 'Simulate an elevator-style sweep (SCAN) disk scheduling algorithm and calculate total head movement. The disk head starts at position 50, initially moving rightward.',
    examples: [
      {
        input: 'Head starts at 50, moving right. Requests: [82, 170, 43, 140, 24, 16, 190]. Disk range: 0-199.',
        output: 'Total head movement = 332 units.',
        explanation: 'Rightward: 50→82→140→170→190→199 = 149 units. Leftward: 199→43→24→16 = 183 units. Total = 332.'
      }
    ],
    constraints: [
      'Disk positions range from 0 to 199.',
      'The head moves in one direction until reaching the end, then reverses.',
      'Request positions are valid disk addresses.'
    ],
    approach: `1. Sort all the requests into two groups: those to the right of the current position, and those to the left.
2. Starting at 50 and moving right, visit each right-side request in increasing order: 82, then 140, then 170, then 190.
3. Continue moving right all the way to the very end of the disk (position 199), even if there's no request exactly there, since the head must physically travel through that point before reversing.
4. Reverse direction and visit each left-side request in decreasing order: 43, then 24, then 16.
5. Add up the total distance travelled: (199 - 50) going right, plus (199 - 16) coming back = 149 + 183 = 332 total units of movement.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Coordinating Producers and Consumers Safely',
    slug: 'producer-consumer',
    lessonSlug: 'sync-deadlocks',
    subtopicSlug: 'classic-sync-problems',
    difficulty: 'hard',
    topics: ['Synchronisation'],
    companies: ['Google', 'Meta', 'Uber'],
    problemStatement: 'Multiple producers add items to a shared, fixed-size buffer, while multiple consumers remove items from it. The solution must avoid conflicts (two threads touching the buffer at once) and avoid deadlocks (everyone stuck waiting forever).',
    examples: [
      {
        input: 'Buffer size = 5. 3 producers, 2 consumers. Producers add at varying rates, consumers remove at varying rates.',
        output: 'No item is ever lost or corrupted. Producers never overflow the buffer. Consumers never read from an empty buffer.',
        explanation: 'Slot counts prevent overflow/underflow. Exclusive access prevents concurrent modification.'
      }
    ],
    constraints: [
      'The buffer has a fixed maximum capacity.',
      'Multiple producers and consumers run concurrently.',
      'Both producers and consumers may run at different speeds.'
    ],
    approach: `1. Keep track of how many empty slots remain in the buffer, and how many filled slots exist.
2. Before a producer adds an item, it must first wait for an empty slot to be available (so the buffer never overflows).
3. Before actually placing the item, the producer must gain exclusive access to the buffer, so no other thread is modifying it at the same moment; it releases that exclusive access immediately after placing the item.
4. Once the item is placed, mark that there's now one more filled slot for a consumer to take.
5. Symmetrically, before a consumer removes an item, it must first wait for a filled slot to be available (so it never reads from an empty buffer), then gain exclusive access, remove the item, release exclusive access, and finally mark that there's now one more empty slot.

Why this works:
Waiting for an empty slot stops producers from overflowing the buffer. Waiting for a filled slot stops consumers from reading nothing. Exclusive access during the actual add/remove step stops two threads from corrupting the buffer by touching it at exactly the same instant.`,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(capacity)'
  },
  {
    title: 'Calculating Context Switch Overhead',
    slug: 'context-switch-overhead',
    lessonSlug: 'process-management',
    subtopicSlug: 'context-switching',
    difficulty: 'easy',
    topics: ['Process Management'],
    companies: ['Microsoft', 'Intel'],
    problemStatement: 'Given a set of processes and their burst times, along with the cost of a single context switch, calculate the total time wasted on context switching for a given scheduling order.',
    examples: [
      {
        input: 'Processes: P1(10ms), P2(5ms), P3(8ms). Context switch cost = 1ms. Scheduled order: P1, P2, P3.',
        output: 'Total context switch time = 2ms (switches between P1→P2 and P2→P3).',
        explanation: 'With 3 processes, two context switches are needed: one after P1 ends and one after P2 ends. Each costs 1ms, totalling 2ms of overhead — pure time that accomplishes no actual work.'
      }
    ],
    constraints: ['Context switch cost is the same between any two processes.', 'Processes run non-preemptively to completion.'],
    approach: `1. Count how many context switches occur: with n processes scheduled sequentially, exactly (n - 1) switches happen — one between each consecutive pair.
2. Multiply the switch count by the cost per switch to get total overhead.
3. Add the total overhead to the sum of all burst times to get the total elapsed time including overhead.
4. Context switch overhead reduces CPU utilisation: the fraction of time actually doing useful work is (total burst time) / (total burst time + total overhead).`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Shortest-Job-First Scheduling',
    slug: 'sjf-scheduling',
    lessonSlug: 'cpu-scheduling',
    subtopicSlug: 'fcfs-sjf',
    difficulty: 'easy',
    topics: ['CPU Scheduling'],
    companies: ['Amazon', 'Microsoft'],
    problemStatement: 'Given a set of processes with their arrival times and burst times, calculate each process\'s waiting time and turnaround time using the Shortest-Job-First (non-preemptive) scheduling algorithm.',
    examples: [
      {
        input: 'P1: arrival=0, burst=6 | P2: arrival=0, burst=8 | P3: arrival=0, burst=7 | P4: arrival=0, burst=3',
        output: 'Order: P4(0-3), P1(3-9), P3(9-16), P2(16-24). Avg wait = (0+3+9+16)/4 = 7.0ms.',
        explanation: 'At time 0, all are ready. P4 has the smallest burst (3) and runs first. P1 runs next (burst 6), then P3 (7), then P2 (8). This minimises average waiting time compared to any other order.'
      }
    ],
    constraints: ['All processes arrive at the same time (simultaneous arrival).', 'Preemption is not allowed.'],
    approach: `1. When a scheduling decision must be made, pick the ready process with the smallest remaining burst time.
2. With simultaneous arrivals, simply sort by burst time and run from shortest to longest.
3. For each process: waiting time = start time - arrival time; turnaround time = completion time - arrival time.
4. SJF is provably optimal for average waiting time when all processes arrive simultaneously — no other non-preemptive policy can beat it.

Why it's called Shortest-Job-First: The algorithm always picks the job that will finish the soonest. This minimises the number of processes waiting behind a long-running one.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Translate a Logical Address to a Physical Address',
    slug: 'address-translation',
    lessonSlug: 'memory-management',
    subtopicSlug: 'paging',
    difficulty: 'medium',
    topics: ['Memory Management', 'Paging'],
    companies: ['Intel', 'AMD'],
    problemStatement: 'Given a page table, a logical address, and a page size, compute the corresponding physical address by extracting the page number, looking up the frame number, and calculating the offset within that frame.',
    examples: [
      {
        input: 'Page size = 4KB (4096 bytes). Logical address = 16385. Page table: [8, 3, 12, 5].',
        output: 'Physical address = 12293. Page = floor(16385/4096) = 4 → page 4 maps to frame 5. Offset = 16385 mod 4096 = 1. Physical = 5×4096 + 1 = 20480 + 1 = 20481.',
        explanation: 'First determine which page the logical address falls on (16385 ÷ 4096 = 4 with remainder 1). Look up page 4 in the page table — it maps to frame 5. The offset within the page (1) remains unchanged. Physical address = frame×page_size + offset.'
      }
    ],
    constraints: ['Page size is a power of 2 (typical: 4KB).', 'The page table maps page numbers directly to frame numbers.'],
    approach: `1. Divide the logical address by the page size: the quotient is the page number, and the remainder is the offset within that page.
2. Look up the page number in the page table to find which physical frame it maps to.
3. Multiply the frame number by the page size, then add the offset to get the full physical address.
4. The offset is never changed by address translation — it directly specifies the exact byte within both the logical page and the physical frame.`,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Simulating Contiguous File Allocation',
    slug: 'contiguous-file-allocation',
    lessonSlug: 'file-systems',
    subtopicSlug: 'file-allocation',
    difficulty: 'easy',
    topics: ['File Systems'],
    companies: ['Microsoft', 'Seagate'],
    problemStatement: 'Given a disk with fixed-size blocks and a set of files with known sizes, simulate how contiguous allocation would place them on the disk. Identify any files that cannot be placed due to fragmentation.',
    examples: [
      {
        input: 'Free blocks: [0-19] (20 blocks). Files: A(5 blocks), B(8 blocks), C(4 blocks), D(6 blocks).',
        output: 'A at 0-4, B at 5-12, C at 13-16, D at 17-22 → D exceeds disk (only 20 blocks) → D cannot be placed contiguously.',
        explanation: 'Contiguous allocation places each file in one unbroken stretch of blocks, one after another. If the remaining space is insufficient, the file cannot be stored.'
      }
    ],
    constraints: ['All files are placed one after the other in allocation order.', 'Free space is initially one contiguous stretch.'],
    approach: `1. Keep track of the next available block position, starting at the beginning of the free space.
2. For each file in allocation order: if the file's required block count fits within the remaining free space, place it starting at the current position and advance the position by the file's size.
3. If the file is larger than the remaining free space, it cannot be stored contiguously — fragmentation has made it impossible despite enough total free space.
4. Over time, as files are deleted, the free space becomes fragmented into multiple small gaps — future large files may fail to fit despite abundant total free space, which is the main disadvantage of contiguous allocation.`,
    timeComplexity: 'O(f)',
    spaceComplexity: 'O(f)'
  },
  {
    title: 'Using a Mutex to Protect a Shared Counter',
    slug: 'mutex-counter',
    lessonSlug: 'sync-deadlocks',
    subtopicSlug: 'semaphores-mutexes',
    difficulty: 'easy',
    topics: ['Synchronisation'],
    companies: ['Google', 'Meta'],
    problemStatement: 'Two threads each increment a shared counter 1000 times. Without synchronisation, the final value is less than 2000 due to race conditions. Implement the fix using a mutex so that the counter always reaches exactly 2000.',
    examples: [
      {
        input: 'Thread A: for i in 1..1000: counter++. Thread B: for i in 1..1000: counter++. No lock.',
        output: 'counter < 2000 after both finish (e.g., 1823). With mutex: counter = 2000 exactly.',
        explanation: 'counter++ is actually three operations: read, add, write. Without a lock, both threads can read the same value, both add 1, and both write back — losing one increment. A mutex ensures atomicity: only one thread can execute the read-add-write sequence at a time.'
      }
    ],
    constraints: ['Use a single mutex to protect the shared counter.', 'Threads run concurrently on separate CPU cores.'],
    approach: `1. Identify the critical section — the code that reads and modifies the shared counter. This is the region that must execute atomically.
2. Before entering the critical section, acquire the mutex. If another thread holds it, this thread will wait until it's released.
3. Perform the read-add-write on the counter while holding the mutex.
4. Immediately after the critical section, release the mutex so other threads can proceed.
5. Without the mutex: the read-add-write from two threads can interleave, producing a race condition. With the mutex: the sequence is effectively atomic from the perspective of other threads.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  }
];

/* ================================================================
 * Programming — General Concepts (Language-Agnostic)
 * ================================================================ */

const programmingLessons = [
  {
    title: 'Core Programming Building Blocks',
    slug: 'python-basics',
    category: 'core',
    description: 'Foundational ideas — transforming collections and understanding variable scope — that exist in nearly every language.',
    icon: 'Terminal',
    order: 1,
    difficulty: 'easy',
    problemCount: 2
  },
  {
    title: 'Object-Oriented Thinking',
    slug: 'oop-concepts',
    category: 'oop',
    description: 'A way of organising code around objects that bundle data and behaviour, built on four core pillars.',
    icon: 'Box',
    order: 2,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Thinking in Functions (Functional Programming Ideas)',
    slug: 'functional-programming',
    category: 'functional',
    description: 'Treating computation as data transformations — using map, filter, reduce, and functions that remember their context.',
    icon: 'Repeat',
    order: 3,
    difficulty: 'medium',
    problemCount: 2
  },
  {
    title: 'Recognising Reusable Design Solutions',
    slug: 'design-patterns',
    category: 'design',
    description: 'Well-known, reusable blueprints for common software design problems, like Singleton and Observer.',
    icon: 'Layers',
    order: 4,
    difficulty: 'hard',
    problemCount: 2
  },
  {
    title: 'Testing & Debugging',
    slug: 'testing-debugging',
    category: 'testing',
    description: 'The skills of confirming code works correctly (testing) and finding out why it doesn\'t (debugging).',
    icon: 'Bug',
    order: 5,
    difficulty: 'medium',
    problemCount: 2
  }
];

const programmingSubtopics = [
  /* Core */
  {
    title: 'Building a New List by Transforming an Existing One',
    slug: 'list-comprehensions',
    description: 'A concise pattern for turning one collection into another by transforming and optionally filtering its items.',
    explanation: `A common, concise pattern: take an existing collection of items, apply some transformation to each one, optionally skip items that don't meet a condition, and end up with a brand-new collection.

The general idea, step by step:
1. Go through each item in the original collection, one at a time.
2. Optionally, check a condition — if the item doesn't satisfy it, skip it entirely.
3. Otherwise, apply some transformation to the item (like squaring a number).
4. Collect all the transformed items into a new collection, in the same order they were processed.

Worked example:
Starting with the numbers 0 through 9, and wanting only the squares of the even ones: go through each number, keep only the ones that divide evenly by 2, and for each one that survives, square it. The result: 0, 4, 16, 36, 64.`,
    lessonSlug: 'python-basics',
    order: 1
  },
  {
    title: 'Functions and Where Variables Live (Scope)',
    slug: 'functions-scope',
    description: 'How functions organise reusable code, and the rules that decide where a variable can and can\'t be seen.',
    explanation: `A function is a reusable, named block of instructions. "Scope" describes where a variable can actually be seen and used.

The general rule most languages follow, from narrowest to widest:
1. Local — variables created inside the current function; only that function can see them.
2. Enclosing — variables from any function that "wraps around" the current one, if functions are nested inside each other.
3. Global — variables defined at the top level, outside any function, visible everywhere in that file.
4. Built-in — names the language itself provides automatically, like common utility functions.

Worked example (concept, not syntax):
Imagine a variable named x set at the very top level of a program. Inside a function, a different variable also named x is created — this new one only exists inside that function and doesn't affect the outer one. If there's a function nested even further inside, and it creates its own x too, that innermost x only affects code within that innermost function. Once each function finishes, whatever x it created disappears, and whatever version of x was visible one level up "reappears" unaffected.`,
    lessonSlug: 'python-basics',
    order: 2
  },

  /* OOP */
  {
    title: 'Inheritance & Polymorphism',
    slug: 'inheritance-polymorphism',
    description: 'How new object categories can reuse and override behaviour from a general "parent" category.',
    explanation: `Inheritance, conceptually:
Imagine a general category called "Animal" that knows how to "make a sound," but doesn't specify exactly what sound. More specific categories, like "Dog" and "Cat," inherit everything general Animals can do, but override the "make a sound" behaviour with their own specific version ("Woof" for a dog, "Meow" for a cat).

Polymorphism in action:
If you have a mixed group containing Dogs and Cats, and you tell every single one of them to "make a sound," each object automatically produces its own correct sound — a Dog barks, a Cat meows — even though you gave exactly the same instruction to all of them. The calling code doesn't need to know or care which specific type each object is.`,
    lessonSlug: 'oop-concepts',
    order: 1
  },
  {
    title: 'Encapsulation & Abstraction',
    slug: 'encapsulation-abstraction',
    description: 'How objects can hide their internal data and expose only a simple, safe way to interact with it.',
    explanation: `Encapsulation, conceptually:
Imagine a bank account object that keeps its balance hidden from the outside world. Nobody outside the object can directly change the balance number by reaching in and editing it. Instead, they must go through controlled actions the object exposes, like "deposit" — which can include its own safety checks, such as refusing a deposit of a negative amount. This protects the internal data from being put into an invalid state by accident.

Abstraction, conceptually:
When you use something like a "deposit" action, you don't need to know how the balance is stored internally, or what checks happen behind the scenes — you only need to know that calling "deposit" with an amount increases the balance appropriately. The complexity is hidden behind a simple, predictable interface.`,
    lessonSlug: 'oop-concepts',
    order: 2
  },

  /* Functional */
  {
    title: 'Transform, Filter, Combine',
    slug: 'map-filter-reduce',
    description: 'Three fundamental ways to process a collection — transform every item, keep only some, or boil it down to one value.',
    explanation: `Transform (often called "map"): Apply the same operation to every item in a collection, producing a new collection of the same length. For example, doubling every number in a list of 1, 2, 3, 4 gives 2, 4, 6, 8.

Filter: Keep only the items that satisfy some condition, discarding the rest. For example, keeping only even numbers from 1, 2, 3, 4 gives 2, 4.

Combine (often called "reduce" or "fold"): Boil an entire collection down to a single value by repeatedly combining items two at a time. For example, combining 1, 2, 3, 4 by adding: first combine 1 and 2 to get 3, then combine that with 3 to get 6, then combine that with 4 to get a final total of 10.`,
    lessonSlug: 'functional-programming',
    order: 1
  },
  {
    title: 'Functions That Remember Their Surroundings (Closures)',
    slug: 'closures-hof',
    description: 'Functions that keep hold of the variables from where they were created, even after that context has finished.',
    explanation: `A closure is a function that "remembers" the variables from the place it was created, even after that surrounding context has technically finished running.

Worked example, conceptually:
Imagine a function whose whole job is to build other functions — you give it a number (say, 2), and it hands you back a brand-new function that always multiplies whatever it's given by 2. If you ask it again with a different number (say, 3), it hands you back a separate function that always multiplies by 3 instead. Each of these returned functions permanently "remembers" its own multiplier, even though the original function that created it has already finished running.`,
    lessonSlug: 'functional-programming',
    order: 2
  },

  /* Design Patterns */
  {
    title: 'Ensuring Only One Instance Exists (Singleton)',
    slug: 'singleton-pattern',
    description: 'A pattern that guarantees a class has exactly one shared instance across the whole program.',
    explanation: `Guarantee that a particular class only ever has exactly one instance in the whole program, and provide one shared, well-known way to access it.

When to use it:
Situations like a shared configuration manager, a logging system, or a shared pool of database connections — cases where having multiple independent instances would cause conflicts or wasted resources.

How it works, step by step:
1. The very first time anyone asks for an instance, create it and remember it.
2. Every subsequent time anyone asks for an instance, hand back that same remembered one instead of creating a new one.
3. As a result, no matter how many different parts of the program ask for it, they're all sharing the exact same underlying instance.`,
    lessonSlug: 'design-patterns',
    order: 1
  },
  {
    title: 'Broadcasting Changes to Interested Parties (Observer)',
    slug: 'observer-pattern',
    description: 'A pattern where interested subscribers are automatically notified whenever something they follow changes.',
    explanation: `Set up a "one-to-many" relationship where, when one object's state changes, every other object that has expressed interest gets automatically notified.

When to use it:
Event-handling systems, notification services, or updating a user interface automatically whenever the underlying data changes.

How it works, step by step:
1. Interested parties "subscribe" to a particular event by registering themselves.
2. When that event actually happens, the source goes through its list of subscribers one by one and notifies each of them.
3. Any party that's no longer interested can "unsubscribe," so it stops being notified going forward.`,
    lessonSlug: 'design-patterns',
    order: 2
  },

  /* Testing */
  {
    title: 'Unit Testing',
    slug: 'unit-testing-pytest',
    description: 'How to check the smallest testable piece of code in isolation, and reuse shared setup across tests.',
    explanation: `A unit test checks the smallest meaningful piece of your code — usually a single function — in isolation, to confirm it behaves correctly for a given input.

The general shape of a unit test:
1. Set up whatever input or starting conditions the test needs.
2. Run the specific piece of code being tested.
3. Check that the actual result matches the expected result.
4. If it doesn't match, the test fails and flags exactly what went wrong.

Setup and teardown (often called "fixtures"):
Sometimes several tests need the same starting conditions — like a sample piece of data. Rather than repeating that setup in every single test, you prepare it once in a reusable way, and each test that needs it simply asks for it.`,
    lessonSlug: 'testing-debugging',
    order: 1
  },
  {
    title: 'Debugging Strategies',
    slug: 'debugging-strategies',
    description: 'A systematic, five-step method for tracking down and fixing bugs in any language.',
    explanation: `A systematic approach to hunting down bugs, useful in any language:
1. Reproduce it — can you make the bug happen reliably, on demand?
2. Isolate it — narrow down exactly which part of the code is responsible.
3. Read carefully — error messages and stack traces usually point you almost exactly to the problem, if you take the time to read them properly.
4. Add checkpoints — temporarily print or log variable values at different points to see where reality diverges from what you expected.
5. Explain it out loud — describing the problem step by step to someone else (or even to an inanimate object) often reveals the bug yourself, simply because explaining forces you to slow down and check every assumption.

Other useful techniques:
- Narrowing down when a bug was introduced by checking earlier versions of the code.
- Divide and conquer: temporarily disable half the code to see if the bug disappears, then narrow further from there.
- Stepping through code one instruction at a time using a debugging tool, watching exactly how values change.`,
    lessonSlug: 'testing-debugging',
    order: 2
  }
];

const programmingProblems = [
  {
    title: 'FizzBuzz',
    slug: 'fizzbuzz',
    lessonSlug: 'python-basics',
    subtopicSlug: 'list-comprehensions',
    difficulty: 'easy',
    topics: ['Control Flow'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    problemStatement: 'Go through the numbers from 1 to n. For every multiple of 3, output "Fizz." For every multiple of 5, output "Buzz." For every multiple of both 3 and 5, output "FizzBuzz." Otherwise, output the number itself.',
    examples: [
      {
        input: 'n = 15',
        output: '1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz',
        explanation: 'Numbers 3,6,9,12 → Fizz. 5,10 → Buzz. 15 → FizzBuzz (multiple of both).'
      }
    ],
    constraints: [
      'n is a positive integer.',
      'The "both" check (multiple of 3 and 5) must come before the individual checks.'
    ],
    approach: `1. Go through each whole number from 1 up to n, one at a time.
2. For the current number, first check: does it divide evenly by 15 (meaning it's a multiple of both 3 and 5)? If so, output "FizzBuzz" and move to the next number.
3. Otherwise, check: does it divide evenly by 3? If so, output "Fizz" and move on.
4. Otherwise, check: does it divide evenly by 5? If so, output "Buzz" and move on.
5. If none of the above apply, just output the number itself.

The key insight:
Order of checking matters. You must check "is this a multiple of both 3 and 5" before checking "is this a multiple of 3 alone," otherwise you'd mistakenly print just "Fizz" for a number like 15 instead of "FizzBuzz." The simplest way to check "multiple of both" directly is checking whether the number divides evenly by 15.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Designing a Library Management System',
    slug: 'library-management-system',
    lessonSlug: 'oop-concepts',
    subtopicSlug: 'encapsulation-abstraction',
    difficulty: 'medium',
    topics: ['Object-Oriented Design'],
    companies: ['Amazon', 'Flipkart'],
    problemStatement: 'Design a library system involving Books, Members, and a Librarian. Support borrowing, returning, and calculating late fees.',
    examples: [
      {
        input: 'Member borrows "The Great Gatsby" (available). Member has 2 books out of 5 max.',
        output: 'Borrow succeeds. Book marked as unavailable. Borrow date recorded.',
        explanation: 'Both checks pass: book is available AND member is under their limit.'
      }
    ],
    constraints: [
      'A member can borrow at most 5 books at once.',
      'A book can be borrowed by only one member at a time.',
      'Late fees are based on days past the due date.'
    ],
    approach: `1. Check that the requested book actually exists in the catalogue and isn't already borrowed by someone else.
2. Check that the member hasn't already reached their maximum number of borrowed books.
3. If both checks pass, mark the book as borrowed, and add it to that member's list of currently-borrowed books.
4. Record the date it was borrowed, so a late fee can be calculated later if it's returned past the due date.

Conceptual class design:
- Book: knows its title, author, and whether it's currently borrowed.
- Member: knows their name and which books they currently have borrowed, and is limited to a maximum number of books at once (say, 5).
- Librarian: manages the overall catalogue of books, and handles searching and registering new members.`,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(b + m)'
  },
  {
    title: 'Building a Custom "Transform Each Item" Utility',
    slug: 'custom-map-polyfill',
    lessonSlug: 'functional-programming',
    subtopicSlug: 'map-filter-reduce',
    difficulty: 'medium',
    topics: ['Functional Programming'],
    companies: ['Google', 'Meta'],
    problemStatement: 'Implement your own version of the standard "transform every item in a collection" utility — one that correctly applies a given transformation to every item, handles collections with gaps in them, and returns a brand-new collection without changing the original.',
    examples: [
      {
        input: 'Original: [1, 2, empty, 3]. Transform: double each number.',
        output: 'New: [2, 4, empty, 6]. Original unchanged: [1, 2, empty, 3].',
        explanation: 'Gaps are preserved (skipped, not transformed). Original collection is untouched.'
      }
    ],
    constraints: [
      'The original collection must not be modified.',
      'Gaps in the original must remain gaps in the result.',
      'The transformation is applied to every real (non-gap) value.'
    ],
    approach: `1. Create a new, empty collection with the same length as the original.
2. Go through the original collection position by position.
3. Skip any position that's genuinely empty (a "gap"), rather than treating it as if it held a real value.
4. For every position that does hold a real value, apply the given transformation to it, and store the result in the same position in the new collection.
5. Once every position has been processed, return the new collection — leaving the original completely untouched.`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  },
  {
    title: 'Building an Event Bus',
    slug: 'observer-pattern-event-bus',
    lessonSlug: 'design-patterns',
    subtopicSlug: 'observer-pattern',
    difficulty: 'hard',
    topics: ['Design Patterns'],
    companies: ['Google', 'Meta', 'Microsoft'],
    problemStatement: 'Build a shared "event bus" that supports subscribing to an event, unsubscribing, broadcasting an event to all current subscribers, and subscribing to an event just once (automatically unsubscribing after the first time it fires).',
    examples: [
      {
        input: 'Subscribe handler A to "order.placed". Broadcast "order.placed" with data { id: 123 }.',
        output: 'Handler A is called with data { id: 123 }.',
        explanation: 'The bus looks up all subscribers registered for "order.placed" and calls each one with the broadcast data.'
      }
    ],
    constraints: [
      'Multiple events can exist, each with its own set of subscribers.',
      'A subscriber can unsubscribe from an event at any time.',
      'A "subscribe once" handler must fire at most once and then remove itself.'
    ],
    approach: `1. Keep an internal record mapping each event name to the set of handlers currently subscribed to it.
2. Subscribing: add the given handler to that event's set of subscribers.
3. Unsubscribing: remove the given handler from that event's set of subscribers, if it's there.
4. Broadcasting: look up every subscriber currently registered for that event, and call each one in turn, passing along whatever data came with the event.
5. Subscribing "just once": wrap the given handler in a helper that, the moment it's triggered, immediately unsubscribes itself before (or after) running the original handler — so it can never fire a second time.`,
    timeComplexity: 'O(s)',
    spaceComplexity: 'O(e × s)'
  },
  {
    title: 'Measuring Test Coverage',
    slug: 'test-coverage-analyzer',
    lessonSlug: 'testing-debugging',
    subtopicSlug: 'unit-testing-pytest',
    difficulty: 'hard',
    topics: ['Testing'],
    companies: ['JetBrains', 'GitHub'],
    problemStatement: 'Build a tool that looks at a piece of source code and reports which of its functions are actually being exercised by tests, and which aren\'t.',
    examples: [
      {
        input: 'Source has 20 defined functions. Tests call 15 of them during the test run.',
        output: 'Coverage = 75%. Uncovered functions: [names of the 5 uncalled functions].',
        explanation: '15 called ÷ 20 total = 75%. The 5 functions that were defined but never called are listed as uncovered.'
      }
    ],
    constraints: [
      'Functions are identified by their names or signatures.',
      'The tool must distinguish between definition and invocation.',
      'Coverage is calculated as a percentage of called vs total functions.'
    ],
    approach: `1. Scan through the source code and make a complete list of every function that's defined in it.
2. While the tests run, keep a separate record of every function that actually gets called during that run.
3. Compare the two lists: any function that was defined but never appeared in the "actually called" list is uncovered.
4. Calculate a coverage percentage: the number of functions that were called, divided by the total number of functions defined, expressed as a percentage.
5. Report the percentage, along with the specific names of any uncovered functions, so they can be prioritised for new tests.`,
    timeComplexity: 'O(f + c)',
    spaceComplexity: 'O(f)'
  },
  {
    title: 'Write a Function to Check If a Number Is Prime',
    slug: 'is-prime',
    lessonSlug: 'python-basics',
    subtopicSlug: 'functions-scope',
    difficulty: 'easy',
    topics: ['Functions', 'Control Flow'],
    companies: ['Amazon', 'Google'],
    problemStatement: 'Write a function is_prime(n) that returns true if n is a prime number and false otherwise. The function must handle edge cases (n ≤ 1) efficiently.',
    examples: [
      {
        input: 'is_prime(7)',
        output: 'true',
        explanation: '7 is only divisible by 1 and itself (7). Check divisors up to √7 ≈ 2.6 → only 2 and 3 need checking.'
      },
      {
        input: 'is_prime(1)',
        output: 'false',
        explanation: 'By definition, 1 is not prime.'
      }
    ],
    constraints: ['n is a positive integer.', 'The function should minimise unnecessary checks.'],
    approach: `1. Handle the base case: if n ≤ 1, return false immediately since primes are defined as integers greater than 1.
2. Check divisibility by 2 and 3 as special cases — this catches all even numbers and multiples of 3 early.
3. For remaining candidates, use the 6k ± 1 optimisation: any prime > 3 is of the form 6k ± 1. Check divisors from 5 upward, incrementing by 6, stopping when the divisor squared exceeds n.
4. Variable scope: the function parameter n is local to the function — it doesn't affect any variable named n in the calling code. Any helper variables (like the divisor) are also local and invisible outside the function.`,
    timeComplexity: 'O(√n)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Model a Vehicle Hierarchy with Polymorphic Behaviour',
    slug: 'vehicle-hierarchy',
    lessonSlug: 'oop-concepts',
    subtopicSlug: 'inheritance-polymorphism',
    difficulty: 'medium',
    topics: ['OOP', 'Inheritance', 'Polymorphism'],
    companies: ['Google', 'Microsoft'],
    problemStatement: 'Design a class hierarchy for vehicles: a base Vehicle class with a method startEngine(), and subclasses Car and Motorcycle that override it with their own behaviour. Demonstrate polymorphism by calling startEngine() on a list of mixed vehicles.',
    examples: [
      {
        input: 'vehicles = [Car("Sedan"), Motorcycle("Cruiser")]. For each v in vehicles: v.startEngine().',
        output: '"Sedan engine starts with a key turn." / "Cruiser engine starts with a button press."',
        explanation: 'Each subclass provides its own startEngine() implementation. The calling code doesn\'t need to know which specific type each vehicle is — polymorphism handles it automatically.'
      }
    ],
    constraints: ['The base class must define the common interface.', 'Each subclass must override at least one method.'],
    approach: `1. Define a base Vehicle class with shared attributes (like name, wheels) and a method startEngine() that provides a default implementation or is abstract.
2. Create Car as a subclass that inherits from Vehicle, overrides startEngine() to describe a specific starting behaviour (e.g., key turn), and adds any car-specific attributes (like number of doors).
3. Create Motorcycle as another subclass that overrides startEngine() differently (e.g., button press) and adds bike-specific attributes (like hasSidecar).
4. Polymorphism in action: when iterating over a list of Vehicles and calling startEngine() on each, the correct overridden method runs based on the actual type of each object — the calling code never checks types or uses conditional logic.`,
    timeComplexity: 'O(v)',
    spaceComplexity: 'O(v)'
  },
  {
    title: 'Build a Multiplier Factory Using Closures',
    slug: 'multiplier-closure',
    lessonSlug: 'functional-programming',
    subtopicSlug: 'closures-hof',
    difficulty: 'medium',
    topics: ['Functional Programming', 'Closures'],
    companies: ['Google', 'Stripe'],
    problemStatement: 'Write a function make_multiplier(factor) that returns a new function. The returned function, when called with a number, returns that number multiplied by the factor that was captured from its creation context.',
    examples: [
      {
        input: 'double = make_multiplier(2); triple = make_multiplier(3); double(5); triple(5);',
        output: 'double(5) = 10, triple(5) = 15',
        explanation: 'Each returned function "remembers" its own factor value (2 or 3) even after make_multiplier has finished executing. The factor is captured by the closure and persists for the lifetime of the returned function.'
      }
    ],
    constraints: ['make_multiplier must work for any integer factor.', 'The returned function must rely solely on its captured environment — no global variables.'],
    approach: `1. Define make_multiplier(factor) which takes a single parameter factor.
2. Inside make_multiplier, define and return an inner function that takes a parameter x and returns x * factor.
3. The inner function forms a closure: it "closes over" the factor variable from its enclosing scope. Even after make_multiplier returns, the inner function retains access to the specific factor value it was created with.
4. Each call to make_multiplier creates a separate closure with its own captured factor — double and triple are independent functions that happen to share the same structure but have different captured state.

Why closures matter: They allow functions to carry private, persistent state without needing a class or object. This is fundamental to functional programming and enables patterns like partial application and function factories.`,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)'
  },
  {
    title: 'Implement a Singleton Logger',
    slug: 'singleton-logger',
    lessonSlug: 'design-patterns',
    subtopicSlug: 'singleton-pattern',
    difficulty: 'medium',
    topics: ['Design Patterns', 'Singleton'],
    companies: ['Google', 'Amazon'],
    problemStatement: 'Implement a Logger class that ensures only one instance exists globally. All parts of the application that call Logger.getInstance() must receive the exact same instance and share its log history.',
    examples: [
      {
        input: 'Logger.getInstance().log("App started"); Logger.getInstance().log("User logged in"); Logger.getInstance().getLogs()',
        output: '["App started", "User logged in"]',
        explanation: 'Both calls to getInstance() return the same Logger object. Log entries accumulate in the shared instance\'s internal history.'
      }
    ],
    constraints: ['The constructor must not be accessible from outside the class.', 'Lazy initialisation: the instance should be created only on the first call to getInstance().'],
    approach: `1. Make the constructor private (or otherwise inaccessible from outside the class) so that no external code can create a second instance.
2. Declare a static variable to hold the single instance, initially set to null.
3. Define a static getInstance() method that checks: if the static variable is null, create a new instance and assign it; otherwise, return the existing instance.
4. Any internal state (like a log history list) is stored as an instance variable — since there's only one instance, there's only one shared state.
5. Thread safety: in concurrent environments, the creation check must be synchronised to prevent two threads from each creating a separate instance on the first call.

Why Singleton exists: Centralised resources like loggers, configuration managers, and database connection pools benefit from having exactly one point of coordination — logging to multiple independent files would be useless, just as multiple configuration objects could hold contradictory values.`,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(s)'
  },
  {
    title: 'Debug a Function That Returns Wrong Results',
    slug: 'debug-broken-function',
    lessonSlug: 'testing-debugging',
    subtopicSlug: 'debugging-strategies',
    difficulty: 'medium',
    topics: ['Debugging'],
    companies: ['Google', 'Microsoft'],
    problemStatement: 'A function intended to find the second largest number in an array is returning incorrect results. Apply a systematic debugging process: reproduce, isolate, inspect, and fix the bug.',
    examples: [
      {
        input: 'Broken code: function secondLargest(arr) { arr.sort(); return arr[arr.length - 2]; } Test: secondLargest([10, 5, 20, 8])',
        output: 'Returns 10 instead of 10 (correct by luck) but secondLargest([10, 5, 20, 8, 100]) returns 20 instead of 10 — wrong!',
        explanation: 'The default .sort() sorts lexicographically (alphabetically), not numerically. [10, 100, 20, 5, 8] sorted as strings → [10, 100, 20, 5, 8]. arr[-2] = 20 instead of 10.'
      }
    ],
    constraints: ['The array contains at least two distinct numbers.', 'The fix must handle both positive and negative integers.'],
    approach: `1. Reproduce: Run the function with multiple test cases until you find one that fails consistently. The failure here is intermittent in the sense that it depends on the specific values.
2. Isolate: Print the sorted array right after the sort call. The output reveals that [10, 5, 20, 8, 100] becomes [10, 100, 20, 5, 8] — clearly not numeric order.
3. Inspect: Check the documentation — JavaScript's default .sort() converts elements to strings and compares their UTF-16 values. "100" comes before "20" because "1" < "2".
4. Fix: Pass a numeric comparator: arr.sort((a, b) => a - b). Then arr[arr.length - 2] correctly returns the second largest.
5. Verify: Re-run all test cases, including edge cases like negative numbers and arrays with duplicates.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)'
  }
];

/* ================================================================
 * Languages
 * ================================================================ */

const languages = [
  { name: 'Python', slug: 'python', icon: '🐍', active: true },
  { name: 'JavaScript', slug: 'javascript', icon: '🟨', active: true },
  { name: 'Java', slug: 'java', icon: '☕', active: true },
  { name: 'C++', slug: 'cpp', icon: '⚡', active: true },
  { name: 'SQL', slug: 'sql', icon: '🗄️', active: true }
];

/* ================================================================
 * Meta — categories for each subject (frontend uses these for grouping)
 * ================================================================ */

const dsaMetaData = [
  { type: 'category', value: 'data-structures', label: 'Data Structures', order: 1 },
  { type: 'category', value: 'algorithms', label: 'Algorithms', order: 2 },
  { type: 'category', value: 'techniques', label: 'Techniques', order: 3 },
  { type: 'topic', value: 'arrays', label: 'Arrays', order: 1 },
  { type: 'topic', value: 'strings', label: 'Strings', order: 2 },
  { type: 'topic', value: 'linked-lists', label: 'Linked Lists', order: 3 },
  { type: 'topic', value: 'stacks', label: 'Stacks', order: 4 },
  { type: 'topic', value: 'queues', label: 'Queues', order: 5 },
  { type: 'topic', value: 'trees', label: 'Trees', order: 6 },
  { type: 'topic', value: 'graphs', label: 'Graphs', order: 7 },
  { type: 'topic', value: 'dynamic-programming', label: 'Dynamic Programming', order: 8 },
  { type: 'topic', value: 'recursion', label: 'Recursion', order: 9 },
  { type: 'topic', value: 'backtracking', label: 'Backtracking', order: 10 },
  { type: 'topic', value: 'hashing', label: 'Hashing', order: 11 },
  { type: 'topic', value: 'two-pointers', label: 'Two Pointers', order: 12 },
  { type: 'topic', value: 'sliding-window', label: 'Sliding Window', order: 13 },
  { type: 'topic', value: 'binary-search', label: 'Binary Search', order: 14 },
  { type: 'topic', value: 'sorting', label: 'Sorting', order: 15 },
  { type: 'topic', value: 'searching', label: 'Searching', order: 16 },
  { type: 'topic', value: 'greedy', label: 'Greedy', order: 17 },
  { type: 'topic', value: 'bit-manipulation', label: 'Bit Manipulation', order: 18 },
  { type: 'topic', value: 'heaps', label: 'Heaps', order: 19 },
  { type: 'topic', value: 'matrix', label: 'Matrix', order: 20 },
  { type: 'topic', value: 'math', label: 'Math', order: 21 },
  { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
  { type: 'company', value: 'google', label: 'Google', order: 2 },
  { type: 'company', value: 'meta', label: 'Meta', order: 3 },
  { type: 'company', value: 'microsoft', label: 'Microsoft', order: 4 },
  { type: 'company', value: 'apple', label: 'Apple', order: 5 },
  { type: 'company', value: 'netflix', label: 'Netflix', order: 6 },
  { type: 'company', value: 'uber', label: 'Uber', order: 7 },
  { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 },
  { type: 'company', value: 'adobe', label: 'Adobe', order: 9 },
  { type: 'company', value: 'flipkart', label: 'Flipkart', order: 10 },
  { type: 'company', value: 'oracle', label: 'Oracle', order: 11 },
  { type: 'company', value: 'ibm', label: 'IBM', order: 12 },
  { type: 'company', value: 'goldman-sachs', label: 'Goldman Sachs', order: 13 },
  { type: 'company', value: 'jpmorgan', label: 'JPMorgan', order: 14 },
  { type: 'company', value: 'tesla', label: 'Tesla', order: 15 }
];

const dbmsMetaData = [
  { type: 'category', value: 'sql', label: 'SQL', order: 1 },
  { type: 'category', value: 'design', label: 'Database Design', order: 2 },
  { type: 'category', value: 'performance', label: 'Query Optimization & Indexing', order: 3 },
  { type: 'category', value: 'transactions', label: 'Transactions & Concurrency', order: 4 },
  { type: 'topic', value: 'sql-queries', label: 'SQL Queries', order: 1 },
  { type: 'topic', value: 'joins', label: 'Joins', order: 2 },
  { type: 'topic', value: 'indexing', label: 'Indexing', order: 3 },
  { type: 'topic', value: 'normalization', label: 'Normalization', order: 4 },
  { type: 'topic', value: 'transactions', label: 'Transactions', order: 5 },
  { type: 'topic', value: 'acid', label: 'ACID Properties', order: 6 },
  { type: 'topic', value: 'concurrency', label: 'Concurrency Control', order: 7 },
  { type: 'topic', value: 'er-diagrams', label: 'ER Diagrams', order: 8 },
  { type: 'topic', value: 'relational-model', label: 'Relational Model', order: 9 },
  { type: 'topic', value: 'nosql', label: 'NoSQL', order: 10 },
  { type: 'topic', value: 'query-optimization', label: 'Query Optimization', order: 11 },
  { type: 'topic', value: 'triggers', label: 'Triggers & Stored Procedures', order: 12 },
  { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
  { type: 'company', value: 'google', label: 'Google', order: 2 },
  { type: 'company', value: 'microsoft', label: 'Microsoft', order: 3 },
  { type: 'company', value: 'oracle', label: 'Oracle', order: 4 },
  { type: 'company', value: 'ibm', label: 'IBM', order: 5 },
  { type: 'company', value: 'uber', label: 'Uber', order: 6 },
  { type: 'company', value: 'flipkart', label: 'Flipkart', order: 7 },
  { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 }
];

const osMetaData = [
  { type: 'category', value: 'process', label: 'Process Management', order: 1 },
  { type: 'category', value: 'scheduling', label: 'CPU Scheduling', order: 2 },
  { type: 'category', value: 'memory', label: 'Memory Management', order: 3 },
  { type: 'category', value: 'storage', label: 'Storage & File Systems', order: 4 },
  { type: 'category', value: 'synchronization', label: 'Synchronization & Deadlocks', order: 5 },
  { type: 'topic', value: 'process-management', label: 'Process Management', order: 1 },
  { type: 'topic', value: 'cpu-scheduling', label: 'CPU Scheduling', order: 2 },
  { type: 'topic', value: 'synchronization', label: 'Process Synchronization', order: 3 },
  { type: 'topic', value: 'deadlocks', label: 'Deadlocks', order: 4 },
  { type: 'topic', value: 'memory-management', label: 'Memory Management', order: 5 },
  { type: 'topic', value: 'virtual-memory', label: 'Virtual Memory', order: 6 },
  { type: 'topic', value: 'file-systems', label: 'File Systems', order: 7 },
  { type: 'topic', value: 'disk-scheduling', label: 'Disk Scheduling', order: 8 },
  { type: 'topic', value: 'threads', label: 'Threads', order: 9 },
  { type: 'topic', value: 'system-calls', label: 'System Calls', order: 10 },
  { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
  { type: 'company', value: 'google', label: 'Google', order: 2 },
  { type: 'company', value: 'microsoft', label: 'Microsoft', order: 3 },
  { type: 'company', value: 'oracle', label: 'Oracle', order: 4 },
  { type: 'company', value: 'ibm', label: 'IBM', order: 5 },
  { type: 'company', value: 'uber', label: 'Uber', order: 6 },
  { type: 'company', value: 'flipkart', label: 'Flipkart', order: 7 },
  { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 }
];

const programmingMetaData = [
  { type: 'category', value: 'core', label: 'Core Concepts', order: 1 },
  { type: 'category', value: 'oop', label: 'OOP', order: 2 },
  { type: 'category', value: 'functional', label: 'Functional Programming', order: 3 },
  { type: 'category', value: 'design', label: 'Design Patterns', order: 4 },
  { type: 'category', value: 'testing', label: 'Testing & Debugging', order: 5 }
];

/* ================================================================
 * Seed Runner
 * ================================================================ */

export async function runSeed() {
  console.log('[SEED-PHASE] Starting phase content seed...');

  /* Clear existing phase content collections */
  console.log('[SEED-PHASE] Clearing existing phase data...');
  await Promise.all([
    DsaLesson.deleteMany({}),
    Subtopic.deleteMany({}),
    Problem.deleteMany({}),
    DbmsLesson.deleteMany({}),
    DbmsSubtopic.deleteMany({}),
    DbmsProblem.deleteMany({}),
    OsLesson.deleteMany({}),
    OsSubtopic.deleteMany({}),
    OsProblem.deleteMany({}),
    ProgrammingLesson.deleteMany({}),
    ProgrammingSubtopic.deleteMany({}),
    ProgrammingProblem.deleteMany({}),
    Language.deleteMany({}),
    DsaMeta.deleteMany({}),
    DbmsMeta.deleteMany({}),
    OsMeta.deleteMany({}),
    ProgrammingMeta.deleteMany({}),
    Progress.deleteMany({}),
    QuizAttempt.deleteMany({})
  ]);
  console.log('[SEED-PHASE] Existing phase data + meta cleared');

  /* ---- DSA ---- */
  console.log('[SEED-PHASE] Seeding DSA lessons...');
  await DsaLesson.insertMany(dsaLessons);
  console.log('[SEED-PHASE] Seeding DSA subtopics...');
  await Subtopic.insertMany(dsaSubtopics);
  console.log('[SEED-PHASE] Seeding DSA problems...');
  await Problem.insertMany(dsaProblems);

  /* ---- DBMS ---- */
  console.log('[SEED-PHASE] Seeding DBMS lessons...');
  await DbmsLesson.insertMany(dbmsLessons);
  console.log('[SEED-PHASE] Seeding DBMS subtopics...');
  await DbmsSubtopic.insertMany(dbmsSubtopics);
  console.log('[SEED-PHASE] Seeding DBMS problems...');
  await DbmsProblem.insertMany(dbmsProblems);

  /* ---- OS ---- */
  console.log('[SEED-PHASE] Seeding OS lessons...');
  await OsLesson.insertMany(osLessons);
  console.log('[SEED-PHASE] Seeding OS subtopics...');
  await OsSubtopic.insertMany(osSubtopics);
  console.log('[SEED-PHASE] Seeding OS problems...');
  await OsProblem.insertMany(osProblems);

  /* ---- Programming ---- */
  console.log('[SEED-PHASE] Seeding Programming lessons...');
  await ProgrammingLesson.insertMany(programmingLessons);
  console.log('[SEED-PHASE] Seeding Programming subtopics...');
  await ProgrammingSubtopic.insertMany(programmingSubtopics);
  console.log('[SEED-PHASE] Seeding Programming problems...');
  await ProgrammingProblem.insertMany(programmingProblems);

  /* ---- Languages ---- */
  console.log('[SEED-PHASE] Seeding languages...');
  await Language.insertMany(languages);

  /* ---- Recount problemCount per lesson (dynamic) ---- */
  console.log('[SEED-PHASE] Recounting problemCount per lesson...');
  const dsaLessonsDocs = await DsaLesson.find({});
  for (const lesson of dsaLessonsDocs) {
    const count = await Problem.countDocuments({ lessonSlug: lesson.slug });
    await DsaLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  const dbmsLessonsDocs = await DbmsLesson.find({});
  for (const lesson of dbmsLessonsDocs) {
    const count = await DbmsProblem.countDocuments({ lessonSlug: lesson.slug });
    await DbmsLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  const osLessonsDocs = await OsLesson.find({});
  for (const lesson of osLessonsDocs) {
    const count = await OsProblem.countDocuments({ lessonSlug: lesson.slug });
    await OsLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  const progLessonsDocs = await ProgrammingLesson.find({});
  for (const lesson of progLessonsDocs) {
    const count = await ProgrammingProblem.countDocuments({ lessonSlug: lesson.slug });
    await ProgrammingLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  console.log('[SEED-PHASE] problemCount updated dynamically');

  /* ---- Meta (categories, topics, companies) ---- */
  console.log('[SEED-PHASE] Seeding DSA meta...');
  await DsaMeta.insertMany(dsaMetaData);
  console.log('[SEED-PHASE] Seeding DBMS meta...');
  await DbmsMeta.insertMany(dbmsMetaData);
  console.log('[SEED-PHASE] Seeding OS meta...');
  await OsMeta.insertMany(osMetaData);
  console.log('[SEED-PHASE] Seeding Programming meta...');
  await ProgrammingMeta.insertMany(programmingMetaData);

  const summary = {
    dsa: { lessons: dsaLessons.length, subtopics: dsaSubtopics.length, problems: dsaProblems.length },
    dbms: { lessons: dbmsLessons.length, subtopics: dbmsSubtopics.length, problems: dbmsProblems.length },
    os: { lessons: osLessons.length, subtopics: osSubtopics.length, problems: osProblems.length },
    programming: { lessons: programmingLessons.length, subtopics: programmingSubtopics.length, problems: programmingProblems.length },
    languages: languages.length,
    meta: {
      dsa: dsaMetaData.length,
      dbms: dbmsMetaData.length,
      os: osMetaData.length,
      programming: programmingMetaData.length
    }
  };

  console.log('[SEED-PHASE] Phase content seeded successfully!', summary);
  return summary;
}

/*
 * CLI entry point
 */
const isCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/seedPhaseContent.js');
if (isCLI) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
      console.log('[SEED-PHASE] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[SEED-PHASE] Connected to MongoDB');

      await runSeed();

      await mongoose.disconnect();
      console.log('[SEED-PHASE] Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('[SEED-PHASE] Error seeding database:', error);
      process.exit(1);
    }
  })();
}
