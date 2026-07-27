import fs from 'fs';

const lines = [];
const push = s => lines.push(s);

// ──────────────────────────────────────────────
// HEADER
// ──────────────────────────────────────────────
push('# Next DSA Content — Arrays\n');
push('> Lesson to create after "Introduction to DSA". Same category: `fundamentals-arrays-strings`, order 1.\n');
push('> 4 subtopics · 4 problems · 4 quizzes\n');
push('---\n');

// ──────────────────────────────────────────────
// CATEGORY
// ──────────────────────────────────────────────
push('## Category\n');
push('- Order: 0');
push('- Name: Fundamentals: Arrays & Strings');
push('- Slug: `fundamentals-arrays-strings`\n');
push('---\n');

// ──────────────────────────────────────────────
// LESSON
// ──────────────────────────────────────────────
const lesson = {
  title: 'Arrays',
  slug: 'arrays',
  category: 'fundamentals-arrays-strings',
  description: 'Arrays are the most fundamental data structure in programming. Learn how they work in memory, how to manipulate them, and three essential problem-solving techniques: Two Pointers, Sliding Window, and Prefix Sum.',
  image: '',
  icon: 'List',
  order: 1,
  difficulty: 'easy',
  problemCount: 4
};

push('## Lesson\n');
push('```json');
push(JSON.stringify(lesson, null, 2));
push('```\n');
push('---\n');

// ──────────────────────────────────────────────
// SUBTOPICS
// ──────────────────────────────────────────────
push('## Subtopics (4)\n');

// --- Subtopic: Array Basics ---
const sub1Explain = `## What is an Array?

Imagine a row of lockers in a school hallway. Each locker has a number painted on it — 0, 1, 2, 3, and so on. You know exactly where locker 14 is: it's the 15th locker from the start. You don't have to count — you walk straight to it because the lockers are arranged in a straight line and every locker takes up the same amount of space.

An array is exactly like that row of lockers — it's a **contiguous block of memory** divided into equally-sized slots, each identified by an index starting from 0.

## How Arrays Work in Memory

When you create an array like \`[10, 20, 30, 40]\`, the computer finds a free block of memory large enough to hold four numbers and places them one right after the other:

\`\`\`
Memory:  [10] [20] [30] [40]
Address: 100  104  108  112
Index:     0    1    2    3
\`\`\`

If each integer takes 4 bytes, the address of element at index \`i\` is:

\`\`\`
address = base_address + (i x size_of_each_element)
\`\`\`

This is why array access is O(1) — the computer can calculate the exact memory address in a single step, no matter which index you ask for.

## Common Operations and Their Time Complexity

### Access by Index — O(1)
Grabbing \`arr[3]\` takes one step. The formula above gives you the exact memory address instantly.

### Search for a Value — O(n)
If you want to find whether the number 30 is in the array, you might have to check every single slot until you find it. In the worst case (the value isn't there at all), you check all n elements.

### Insert at the End (Dynamic Array) — O(1) on average
If the array has room at the end, inserting is one step. If the array is full, it must create a new, larger block of memory and copy everything over — but this happens rarely enough that the "amortized" (averaged-out) cost is still O(1).

### Insert at the Beginning or Middle — O(n)
To insert at position 0, every single element must shift one spot to the right to make room. That's n moves for a single insertion.

### Delete from the Beginning or Middle — O(n)
Same problem in reverse — deleting the first element means everything else shifts left by one.

### Delete from the End — O(1)
Just remove the last element, nothing shifts.

## Static vs Dynamic Arrays

**Static arrays** have a fixed size set at creation. You can't add more elements than the capacity you declared.

**Dynamic arrays** (like Python lists or JavaScript arrays) automatically grow when you add more elements. Under the hood, they work like this:

1. Allocate an initial capacity (say, 4 slots)
2. When you try to add a 5th element, allocate a new block of 8 slots, copy the 4 old elements over, then add the new one
3. The old block is freed — the array has "grown"

This doubling strategy means most insertions are O(1), with an occasional O(n) copy.

## When to Use Arrays

✅ **You need fast access by index** — arr[i] is always O(1)
✅ **You know roughly how many items you'll store**
✅ **You iterate through items sequentially**
✅ **Memory overhead matters** — arrays are the most memory-efficient data structure for storing a sequence

❌ **You frequently insert or delete at the beginning** — a linked list or deque is better
❌ **You need to search by value often** — a hash table or binary search tree may be better

## Key Takeaway

Arrays are the building block of almost every other data structure. Their superpower is O(1) index access, and their weakness is O(n) insertion/deletion anywhere except the end. Mastering array manipulation means understanding how to work around that weakness using techniques like Two Pointers, Sliding Window, and Prefix Sum — which you'll learn next.`;

const sub1 = {
  title: 'Array Basics',
  slug: 'array-basics',
  lessonSlug: 'arrays',
  order: 0,
  description: 'Learn what arrays are, how they store data in contiguous memory, and the time complexity of common operations like access, search, insertion, and deletion.',
  explanation: sub1Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Array Basics\n');
push('```json');
push(JSON.stringify(sub1, null, 2));
push('```\n');

// --- Subtopic: Two Pointers ---
const sub2Explain = `## What is the Two-Pointer Technique?

Imagine you and a friend are standing at opposite ends of a long hallway lined with numbered boxes. You both walk toward each other, checking boxes as you go. Between the two of you, you can cover the entire hallway in one pass, meeting somewhere in the middle.

That's the two-pointer technique in a nutshell: instead of using a single loop variable, you use **two indices** (pointers) that move through the array, often from opposite ends toward each other. This lets you solve problems in O(n) time that would otherwise require O(n^2) with nested loops.

## The Two Main Patterns

### 1. Opposite Direction (Left/Right)

Both pointers start at opposite ends and move toward each other:

\`\`\`
[1, 3, 5, 7, 9]
 ^             ^
left         right
\`\`\`

After each step, either \`left\` moves right or \`right\` moves left, depending on some condition. The pointers meet (or cross) in the middle, at which point you're done.

**Example problem:** Given a sorted array, find two numbers that add up to a target.

### 2. Same Direction (Fast/Slow)

Both pointers start at the same end, but one moves faster than the other. This pattern is useful for finding cycles, removing duplicates, or finding the middle of a linked list.

## Why Two Pointers Work

Nested loops often look like this:

\`\`\`python
for i in range(n):
    for j in range(i + 1, n):
        # check pair (i, j)
\`\`\`

This checks every possible pair — a classic O(n^2) approach.

Two pointers eliminate the need for the inner loop by using the fact that **the data is structured** (often sorted) or that **there's a monotonic property** — once a pointer moves past a certain point, those elements are no longer relevant.

## A Concrete Example

Say you have a sorted array \`[1, 3, 4, 6, 8, 10]\` and you want to find two numbers that sum to 12.

**Brute-force approach:** Check every pair — (1,3), (1,4), ..., (8,10). That's 15 pairs for 6 numbers.

**Two-pointer approach:**

\`\`\`
Step 1: left=0(1), right=5(10) → sum=11 → too small, move left
Step 2: left=1(3), right=5(10) → sum=13 → too big, move right
Step 3: left=1(3), right=4(8)  → sum=11 → too small, move left
Step 4: left=2(4), right=4(8)  → sum=12 → found!
\`\`\`

Only 4 steps instead of 15. For n=1000, that's ~999 steps instead of ~500,000.

## When to Use Two Pointers

✅ **The array is sorted** — the most common clue
✅ **You need to find a pair (or triplet) that satisfies a condition**
✅ **You need to reverse or rotate in place**
✅ **The problem involves partitioning or rearranging elements**
✅ **You're comparing elements from both ends**

## Complexity Analysis

- **Time:** O(n) — each pointer moves at most n times, for a total of at most 2n moves
- **Space:** O(1) — only two extra variables for the indices

## Key Takeaway

The two-pointer technique is your first tool for moving from O(n^2) to O(n). Whenever you see a problem involving arrays (especially sorted ones) and pairs, ask yourself: "Can I use two pointers here instead of nested loops?"`;

const sub2 = {
  title: 'Two Pointers',
  slug: 'two-pointers',
  lessonSlug: 'arrays',
  order: 1,
  description: 'Learn the two-pointer technique — using two indices to traverse an array from different directions — and discover how it turns O(n^2) brute-force solutions into efficient O(n) ones.',
  explanation: sub2Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Two Pointers\n');
push('```json');
push(JSON.stringify(sub2, null, 2));
push('```\n');

// --- Subtopic: Sliding Window ---
const sub3Explain = `## What is a Sliding Window?

Imagine you're looking through a train window as the train moves. At any moment, you see a specific stretch of the landscape — that's your "window." As the train moves, the window slides, revealing new scenery on one side and losing old scenery on the other. You never have to re-examine the entire journey at once — just the part visible through the window.

A **sliding window** in programming is the same idea: it's a contiguous subarray (or substring) that moves across the array one element at a time, or expands and contracts based on conditions. Instead of restarting from scratch for every subarray, you **reuse** the computation from the previous window.

## Fixed Window vs Variable Window

### Fixed Window Size

The window has a constant length k. It slides one step at a time:

\`\`\`
Array: [2, 5, 1, 8, 3, 7], k = 3

Window 1: [2, 5, 1] → sum = 8
Window 2: [5, 1, 8] → sum = 14  (added 8, removed 2)
Window 3: [1, 8, 3] → sum = 12  (added 3, removed 5)
Window 4: [8, 3, 7] → sum = 18  (added 7, removed 1)
\`\`\`

Notice: instead of summing all three elements from scratch each time, you just **add the new element** and **subtract the element that just left the window**. That's O(1) per slide instead of O(k).

### Variable Window Size

The window grows or shrinks based on a condition. This is used when you need to find a subarray that satisfies some property (like "sum >= target" or "all unique characters"):

\`\`\`
Start with both pointers at index 0.
Expand the right pointer until the condition is met.
Then contract the left pointer until the condition is broken.
Repeat until the right pointer reaches the end.
\`\`\`

This is sometimes called the "expand-shrink" pattern, and each element enters and leaves the window at most once.

## Why Sliding Windows Work

The brute-force approach to subarray problems checks every possible subarray:

\`\`\`python
for i in range(n):
    for j in range(i, n):
        # consider subarray arr[i..j]
\`\`\`

That's O(n^2) subarrays. For each one, you might need to compute something (like a sum or check for duplicates), potentially making it O(n^3).

The key insight of sliding window is: **contiguous subarrays that start at different positions are highly overlapping**. Most of the elements in arr[i..j] are also in arr[i+1..j+1]. Instead of recalculating from scratch, just adjust for the elements that entered and left.

## A Concrete Example

Say you have \`[1, 3, 2, 6, 1, 4]\` and you need the maximum sum of any subarray of size 3.

**Brute force:** Compute sum for [1,3,2]=6, [3,2,6]=11, [2,6,1]=9, [6,1,4]=11 — each sum computed independently = 4 x 3 = 12 operations.

**Sliding window:**
- First window: sum = 1+3+2 = 6
- Slide right: subtract 1, add 6 → sum = 6-1+6 = 11 (2 operations, not 3)
- Slide right: subtract 3, add 1 → sum = 11-3+1 = 9
- Slide right: subtract 2, add 4 → sum = 9-2+4 = 11

Total: 3 + 2 + 2 + 2 = 9 operations instead of 12. The savings grow with k and n.

## When to Use Sliding Window

✅ **The problem involves a contiguous subarray or substring**
✅ **You need to find a subarray that satisfies a condition (max, min, longest, shortest)**
✅ **The problem mentions "subarray" or "substring" — that's your cue**
✅ **The array elements are positive or the condition is monotonic**

## Complexity Analysis

- **Time:** O(n) — each element enters the window once and leaves the window at most once
- **Space:** O(1) or O(k) depending on what you store in the window

## Key Takeaway

Whenever you read "contiguous subarray" or "substring" in a problem description, your first thought should be: "Can I solve this with a sliding window?" It turns O(n^2) brute-force into clean, O(n) code.`;

const sub3 = {
  title: 'Sliding Window',
  slug: 'sliding-window',
  lessonSlug: 'arrays',
  order: 2,
  description: 'Learn the sliding window technique — maintaining a dynamic subarray that slides across the array — and see how it solves contiguous subarray/substring problems in O(n) time.',
  explanation: sub3Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Sliding Window\n');
push('```json');
push(JSON.stringify(sub3, null, 2));
push('```\n');

// --- Subtopic: Prefix Sum ---
const sub4Explain = `## What is Prefix Sum?

Imagine you're a teacher grading a stack of quizzes. A student asks, "What's my total score on questions 5 through 12?" You could add up questions 5, 6, 7, 8, 9, 10, 11, and 12 individually each time. That's 8 additions per question. If 30 students ask different ranges, you're doing hundreds of additions.

A smarter way: before class starts, compute a **running total** as you go through the answer key. Write down: after question 1 the total is X, after question 2 the total is Y, and so on. Now when a student asks about questions 5-12, you just look up the total through question 12 and subtract the total through question 4. Two lookups, one subtraction — done.

That's the prefix sum technique.

## How It Works

Given an array \`arr\`, the prefix sum array \`prefix\` is defined as:

\`\`\`
prefix[0] = 0
prefix[i] = sum of arr[0] + arr[1] + ... + arr[i-1]
\`\`\`

In plain English: \`prefix[i]\` stores the sum of all elements in the array **before** index \`i\`.

Here's an example:

\`\`\`
arr    = [3,  1,  4,  1,  5,  9,  2]
prefix = [0,  3,  4,  8,  9, 14, 23, 25]
index    0   1   2   3   4   5   6   7
\`\`\`

To build this:
- \`prefix[0] = 0\` (sum of zero elements is 0)
- \`prefix[1] = prefix[0] + arr[0] = 0 + 3 = 3\`
- \`prefix[2] = prefix[1] + arr[1] = 3 + 1 = 4\`
- \`prefix[3] = prefix[2] + arr[2] = 4 + 4 = 8\`
- ... and so on

## The Magic Formula: Range Sum in O(1)

To get the sum of elements from index \`l\` to \`r\` (inclusive):

\`\`\`
sum(l, r) = prefix[r + 1] - prefix[l]
\`\`\`

Why does this work?
- \`prefix[r + 1]\` is the sum of all elements from index 0 to r
- \`prefix[l]\` is the sum of all elements from index 0 to l-1
- Subtract the second from the first and you're left with elements from l to r

Example: sum of elements from index 2 to 5 in the array above:
- prefix[6] = 23 (sum of indices 0 through 5)
- prefix[2] = 4 (sum of indices 0 through 1)
- 23 - 4 = 19 = 4 + 1 + 5 + 9 = 19

## The Space-Time Tradeoff

Prefix sum is a classic example of trading **space for time**:
- **Without prefix sum:** Each range sum query takes O(n) time — you loop from l to r and add up the elements
- **With prefix sum:** Each query takes O(1) time, but you pay O(n) extra memory to store the prefix array

This tradeoff is worth it when you need to answer **many** range sum queries on the **same** array.

## Beyond Simple Range Sum

The prefix sum idea extends beyond just sums. You can build prefix products, prefix XORs, prefix counts — any operation that's **reversible** (you can "undo" it) can use the prefix technique.

## A Deeper Application: Subarray Sum Equals K

One of the most common interview uses of prefix sum goes beyond simple range queries. If you want to count how many subarrays sum to exactly \`k\`, you can:

1. Build prefix sums while iterating
2. For each position, check if \`currentPrefix - k\` has appeared before (using a hashmap)
3. If it has, that means there's a subarray ending at the current position that sums to k

This combines prefix sums with hash maps — a very powerful pattern.

## When to Use Prefix Sum

✅ **You need to answer many range sum queries on the same array**
✅ **You need to find subarrays with a specific sum**
✅ **The problem involves cumulative or running totals**
✅ **Operations are reversible (addition, subtraction, XOR)**

## Complexity Analysis

- **Precomputation:** O(n) — one pass to build the prefix array
- **Each query:** O(1) — one subtraction
- **Space:** O(n) for the prefix array

## Key Takeaway

Prefix sum is a preprocessing technique that makes range sum queries instant. Whenever you need sums of multiple subarrays, think: "Can I precompute prefix sums once and answer each query in O(1)?"`;

const sub4 = {
  title: 'Prefix Sum',
  slug: 'prefix-sum',
  lessonSlug: 'arrays',
  order: 3,
  description: 'Learn the prefix sum technique — precomputing cumulative sums to answer range sum queries in O(1) time — and understand the space-time tradeoff it represents.',
  explanation: sub4Explain,
  image: '',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: ''
};

push('### Prefix Sum\n');
push('```json');
push(JSON.stringify(sub4, null, 2));
push('```\n');
push('---\n');

// ──────────────────────────────────────────────
// PROBLEMS
// ──────────────────────────────────────────────
push('## Problems (4)\n');

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

// ===== Problem 1: Reverse an Array =====
const prob1 = {
  title: 'Reverse an Array',
  slug: 'reverse-an-array',
  lessonSlug: 'arrays',
  subtopicSlug: 'array-basics',
  difficulty: 'easy',
  topics: ['Arrays'],
  companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
  problemStatement: 'You are given an array of numbers. Your job is to reverse the order of its elements — the first element becomes the last, the last becomes the first, and everything in between swaps accordingly.\n\nFor example, if the input is [1, 2, 3, 4, 5], the result should be [5, 4, 3, 2, 1].\n\nYour task is to do this in-place — meaning you should modify the original array directly, without creating a separate copy.\n\nWrite a function that takes the array and reverses it in-place. The function should return the same array (now reversed).',
  examples: [
    { input: '[1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]', explanation: 'Walkthrough:\n- Swap positions 0 and 4: [5, 2, 3, 4, 1]\n- Swap positions 1 and 3: [5, 4, 3, 2, 1]\n- Position 2 is the middle — no swap needed\n- Done' },
    { input: '[7, 8, 9]', output: '[9, 8, 7]', explanation: 'Walkthrough:\n- Swap positions 0 and 2: [9, 8, 7]\n- Position 1 is the middle — done' },
    { input: '[42]', output: '[42]', explanation: 'A single-element array is already reversed — nothing to swap.' },
    { input: '[]', output: '[]', explanation: 'An empty array has nothing to reverse.' }
  ],
  constraints: ['The array can have anywhere from 0 to 100,000 elements.', 'Each element is an integer between -10^9 and 10^9.'],
  approach: '## Understanding the Problem\n\nReversing an array is one of the most fundamental problems in programming. It tests whether you understand how array indices work and whether you can manipulate elements in-place.\n\n### Step 1 — The Obvious Way (But Wrong for This Problem)\n\nThe simplest way to reverse an array is to create a new array and copy elements in reverse order:\n\n```text\nFUNCTION reverse_copy(arr):\n    new_arr = []\n    FOR i FROM last_index DOWN TO 0:\n        new_arr.append(arr[i])\n    RETURN new_arr\n```\n\nThis works, but it uses O(n) extra memory — and the problem asks for an in-place solution.\n\n### Step 2 — The Two-Pointer Approach (In-Place)\n\nThis is where the two-pointer technique shines:\n\n1. Place one pointer at the beginning (index 0) and one at the end (last index)\n2. Swap the elements at these two positions\n3. Move the left pointer right by 1 and the right pointer left by 1\n4. Repeat until the pointers meet (or cross)\n\nLet\'s visualize this with [1, 2, 3, 4, 5]:\n\n```\nInitial:     [1, 2, 3, 4, 5]\n              L              R\n\nAfter swap:  [5, 2, 3, 4, 1]\n                 L        R\n\nAfter swap:  [5, 4, 3, 2, 1]\n                    L\n                    R\n\nPointers meet (L == R at index 2) — we\'re done!\n```\n\n### Step 3 — When Do We Stop?\n\n- If the array has an odd length (like 5), the middle element stays in place. Pointers meet at the middle.\n- If the array has an even length (like 4), the pointers cross over. We stop when left >= right.\n\n### Step 4 — Why This Works\n\nEach swap places two elements in their correct final position. After the first swap, position 0 and the last position are permanently correct — we never need to touch them again.\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — we perform roughly n/2 swaps, each taking constant time.\n- **Space Complexity: O(1)** — only a handful of extra variables, regardless of array size.\n\n### Python Code\n\n```python\ndef reverse_array(arr):\n    left = 0\n    right = len(arr) - 1\n\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n\n    return arr\n```\n\n### JavaScript Code\n\n```javascript\nfunction reverseArray(arr) {\n    let left = 0;\n    let right = arr.length - 1;\n\n    while (left < right) {\n        [arr[left], arr[right]] = [arr[right], arr[left]];\n        left++;\n        right--;\n    }\n\n    return arr;\n}\n```',
  codeBlocks: [
    { language: 'python', code: 'def reverse_array(arr):\n    left = 0\n    right = len(arr) - 1\n\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n\n    return arr' },
    { language: 'javascript', code: 'function reverseArray(arr) {\n    let left = 0;\n    let right = arr.length - 1;\n\n    while (left < right) {\n        [arr[left], arr[right]] = [arr[right], arr[left]];\n        left++;\n        right--;\n    }\n\n    return arr;\n}' }
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz1 = [
  { text: 'What is the time complexity of the two-pointer approach for reversing an array of n elements?', options: ['O(n^2) — because we have nested loops', 'O(n) — we make a single pass with two pointers', 'O(log n) — we keep dividing the array in half', 'O(1) — regardless of array size'], correctIndex: 1 },
  { text: 'What does "in-place" mean when reversing an array?', options: ['The reversal happens on the user\'s computer, not on a server', 'We modify the original array directly, without creating a separate copy', 'We reverse the array using only one line of code', 'We write the result directly to the console'], correctIndex: 1 },
  { text: 'In the two-pointer reverse algorithm, when should we stop swapping?', options: ['After the right pointer reaches index 0', 'After every element has been swapped once', 'When left is no longer less than right (they meet or cross)', 'After exactly n swaps'], correctIndex: 2 },
  { text: 'How many swaps does the two-pointer reverse perform on an array of 10 elements?', options: ['10 swaps', '20 swaps', '5 swaps', '2 swaps'], correctIndex: 2 },
  { text: 'If the original array is [10, 20, 30, 40, 50], what is the array after one full iteration of the while loop (one swap)?', options: ['[50, 20, 30, 40, 10]', '[50, 40, 30, 20, 10]', '[10, 20, 30, 40, 50]', '[10, 50, 30, 40, 20]'], correctIndex: 0 }
];

push('### Reverse an Array\n');
problemJson(prob1);
quizJson(quiz1);
push('---\n');

// ===== Problem 2: Two Sum (Sorted Array) =====
const prob2 = {
  title: 'Two Sum (Sorted Array)',
  slug: 'two-sum-sorted-array',
  lessonSlug: 'arrays',
  subtopicSlug: 'two-pointers',
  difficulty: 'easy',
  topics: ['Arrays', 'Two Pointers'],
  companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
  problemStatement: 'You are given an array of numbers sorted in increasing order, and a target number. Your task is to find two numbers in the array that add up to exactly the target.\n\nReturn the indices of these two numbers (0-based) as an array of two integers. You may assume that exactly one solution exists for each input, and you may not use the same element twice.\n\nIf no solution exists, return an empty array.\n\nFor example, given [2, 7, 11, 15] and target 9, the answer is [0, 1] because 2 + 7 = 9.',
  examples: [
    { input: 'arr = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: '2 + 7 = 9. Both numbers are at indices 0 and 1.' },
    { input: 'arr = [1, 3, 4, 5, 7, 10], target = 8', output: '[2, 3]', explanation: '4 + 5 = 8. They are at indices 2 and 3.' },
    { input: 'arr = [1, 2, 3], target = 10', output: '[]', explanation: 'No pair adds up to 10. Return empty array.' }
  ],
  constraints: ['The array length is between 2 and 100,000.', 'Each element is an integer between -10^9 and 10^9.', 'The array is sorted in strictly increasing order.', 'At most one valid pair exists.'],
  approach: '## Understanding the Problem\n\nThis is a classic problem that appears at almost every tech company. The "sorted" part is your biggest clue — it tells you exactly which technique to use.\n\n### Step 1 — The Brute Force Approach\n\nThe naive solution checks every possible pair — O(n^2). For 100,000 elements, that\'s 5 billion pairs. Way too slow.\n\n### Step 2 — The Key Insight: The Array is Sorted\n\nBecause the array is sorted, we know something very useful:\n\n- If we pick two numbers and their sum is **too small**, the left number needs to get **bigger** (move the left pointer right)\n- If their sum is **too big**, the right number needs to get **smaller** (move the right pointer left)\n\n### Step 3 — The Two-Pointer Solution\n\n1. Place left at the start and right at the end\n2. Check arr[left] + arr[right]:\n   - If it equals target → found the pair, return both indices\n   - If it\'s less than target → the sum is too small, move left rightward\n   - If it\'s greater than target → the sum is too big, move right leftward\n3. Repeat until pointers meet. If no pair found, return [].\n\nTrace on [1, 3, 4, 5, 7, 10] with target 8:\n\n```\nStep 1: left=0(1), right=5(10) → sum=11 > 8 → move right left\nStep 2: left=0(1), right=4(7)  → sum=8 == 8 → found! Return [0, 4]\n```\n\nWait — 1 + 7 = 8, but the example in the problem says [2, 3] (4 + 5 = 8). Both are valid answers because multiple pairs sum to 8 in this array. The algorithm returns whichever it finds first.\n\n### Step 4 — Why This Works\n\nThe magic of two pointers on a sorted array is that at every step, we eliminate one entire row of possibilities:\n\n- When sum < target, we know arr[left] paired with ANY element to the right (that we haven\'t checked yet) will still be too small. We can safely move left forward.\n- When sum > target, we know arr[right] paired with ANY element to the left will still be too big. We can safely move right backward.\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — each pointer moves at most n steps total.\n- **Space Complexity: O(1)** — only two variables for the indices.\n\n### Python Code\n\n```python\ndef two_sum_sorted(arr, target):\n    left = 0\n    right = len(arr) - 1\n\n    while left < right:\n        current_sum = arr[left] + arr[right]\n\n        if current_sum == target:\n            return [left, right]\n        elif current_sum < target:\n            left += 1\n        else:\n            right -= 1\n\n    return []\n```\n\n### JavaScript Code\n\n```javascript\nfunction twoSumSorted(arr, target) {\n    let left = 0;\n    let right = arr.length - 1;\n\n    while (left < right) {\n        const currentSum = arr[left] + arr[right];\n\n        if (currentSum === target) {\n            return [left, right];\n        } else if (currentSum < target) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n\n    return [];\n}\n```',
  codeBlocks: [
    { language: 'python', code: 'def two_sum_sorted(arr, target):\n    left = 0\n    right = len(arr) - 1\n\n    while left < right:\n        current_sum = arr[left] + arr[right]\n\n        if current_sum == target:\n            return [left, right]\n        elif current_sum < target:\n            left += 1\n        else:\n            right -= 1\n\n    return []' },
    { language: 'javascript', code: 'function twoSumSorted(arr, target) {\n    let left = 0;\n    let right = arr.length - 1;\n\n    while (left < right) {\n        const currentSum = arr[left] + arr[right];\n\n        if (currentSum === target) {\n            return [left, right];\n        } else if (currentSum < target) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n\n    return [];\n}' }
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz2 = [
  { text: 'What makes the two-pointer approach valid for this specific problem?', options: ['The array is not too large', 'The array is sorted in increasing order', 'The target is always positive', 'We can use the same element twice'], correctIndex: 1 },
  { text: 'If arr[left] + arr[right] is less than the target, what should we do?', options: ['Move right leftward to make the sum smaller', 'Move left rightward to make the sum larger', 'Return an empty array because it\'s impossible', 'Move both pointers toward each other'], correctIndex: 1 },
  { text: 'If arr[left] + arr[right] is greater than the target, what should we do?', options: ['Move left rightward to make the sum larger', 'Move right leftward to make the sum smaller', 'Return the current pair anyway', 'Reset both pointers to the beginning'], correctIndex: 1 },
  { text: 'How much extra memory does the two-pointer approach use?', options: ['O(n) — we need to store the result array', 'O(n^2) — we need a 2D table', 'O(1) — just two variables for the indices', 'O(log n) — we need space for the recursion stack'], correctIndex: 2 },
  { text: 'Given arr = [1, 2, 3, 4, 6] and target = 6, which pair will the algorithm find?', options: ['[0, 4] (1 + 6 = 7) — it\'s wrong, then it keeps going', '[1, 3] (2 + 4 = 6)', '[2, 2] (3 + 3 = 6) — can\'t use same element', '[] — no solution'], correctIndex: 1 }
];

push('### Two Sum (Sorted Array)\n');
problemJson(prob2);
quizJson(quiz2);
push('---\n');

// ===== Problem 3: Longest Substring Without Repeating Characters =====
const prob3 = {
  title: 'Longest Substring Without Repeating Characters',
  slug: 'longest-substring-without-repeating-characters',
  lessonSlug: 'arrays',
  subtopicSlug: 'sliding-window',
  difficulty: 'medium',
  topics: ['Strings', 'Sliding Window'],
  companies: ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Apple'],
  problemStatement: 'You are given a string made up of letters and digits. Your task is to find the length of the longest substring (a contiguous block of characters) that contains no repeated characters.\n\nFor example, in the string "abcabcbb", the longest substring without repeating characters is "abc", which has length 3.\n\nWrite a function that takes the string and returns the length of the longest substring without repeating characters.\n\nNote: a substring is different from a subsequence — a substring must be continuous (no skipping characters).',
  examples: [
    { input: '"abcabcbb"', output: '3', explanation: 'The longest substrings without repeating characters are "abc" (length 3) starting at index 0, or "bca" (length 3) starting at index 1, or "cab" (length 3) starting at index 2.' },
    { input: '"bbbbb"', output: '1', explanation: 'All characters are the same, so the longest substring without repeats is just a single character — "b".' },
    { input: '"pwwkew"', output: '3', explanation: 'The longest substring without repeats is "wke" (length 3). Note that "pwke" is NOT a substring — it\'s a subsequence because the characters are not contiguous.' },
    { input: '"dvdf"', output: '3', explanation: 'Walkthrough:\n- Start scanning: \'d\', \'v\' — no repeats, current length is 2\n- Next character: \'d\' — repeat found! The previous \'d\' was at index 0. Window now starts after index 0, at index 1.\n- Continue: \'v\' (already in window), then add \'f\' → "vdf", length 3.\n- Answer: 3' }
  ],
  constraints: ['The string length is between 0 and 50,000 characters.', 'The string contains only English letters (a-z, A-Z) and digits (0-9).'],
  approach: '## Understanding the Problem\n\nWe need to find the longest contiguous chunk of the string where every character appears at most once. This is a classic sliding window problem.\n\n### Step 1 — The Brute Force Approach\n\nCheck every possible substring and verify uniqueness — O(n^3). Way too slow.\n\n### Step 2 — The Sliding Window Insight\n\nInstead of checking every substring from scratch, we maintain a "window" (a range between two pointers) that always satisfies the condition: **no repeating characters inside the window**.\n\nAs we expand the window by moving the right pointer, we track which characters are currently in the window. When we encounter a character that\'s already in the window, we shrink from the left until that character is removed.\n\n### Step 3 — The Algorithm\n\n1. Initialize left = 0 and a set to track characters in the current window\n2. Move right from 0 to the end of the string:\n   a. If s[right] is NOT in the set → add it, update max length\n   b. If s[right] IS in the set → move left forward, removing s[left] from the set, until the repeat is resolved. Then add s[right].\n3. Return the max length found.\n\nTrace on "abcabcbb":\n\n```\nright=0, char=\'a\', set={a},        max=1\nright=1, char=\'b\', set={a,b},      max=2\nright=2, char=\'c\', set={a,b,c},    max=3\nright=3, char=\'a\', set has \'a\'! Move left from 0 to 1, remove \'a\'\n         set={b,c}, add \'a\', set={b,c,a}, max=3\nright=4, char=\'b\', set has \'b\'! Move left from 1 to 2, remove \'b\'\n         set={c,a}, add \'b\', set={c,a,b}, max=3\nright=5, char=\'c\', set has \'c\'! Move left from 2 to 3, remove \'c\'\n         set={a,b}, add \'c\', set={a,b,c}, max=3\nright=6, char=\'b\', set has \'b\'! Move left from 3 to 5, remove \'a\',\'b\'\n         set={c}, add \'b\', set={c,b}, max=3\nright=7, char=\'b\', set has \'b\'! Move left from 5 to 7, remove \'c\',\'b\'\n         set={}, add \'b\', set={b}, max=3\n```\n\nFinal answer: 3.\n\n### Step 4 — Why This Works\n\nWhen we find a character that\'s already in the window, we don\'t reset everything — we just slide the left side forward past the previous occurrence. All the characters between the old occurrence and the new one are still valid, so we reuse them.\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — each character is added to the set once and removed at most once.\n- **Space Complexity: O(min(m, n))** — the set stores unique characters in the current window. With a limited alphabet (letters + digits), this is effectively O(1).\n\n### Python Code\n\n```python\ndef length_of_longest_substring(s):\n    char_set = set()\n    left = 0\n    max_len = 0\n\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n\n    return max_len\n```\n\n### JavaScript Code\n\n```javascript\nfunction lengthOfLongestSubstring(s) {\n    const charSet = new Set();\n    let left = 0;\n    let maxLen = 0;\n\n    for (let right = 0; right < s.length; right++) {\n        while (charSet.has(s[right])) {\n            charSet.delete(s[left]);\n            left++;\n        }\n\n        charSet.add(s[right]);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n\n    return maxLen;\n}\n```',
  codeBlocks: [
    { language: 'python', code: 'def length_of_longest_substring(s):\n    char_set = set()\n    left = 0\n    max_len = 0\n\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n\n    return max_len' },
    { language: 'javascript', code: 'function lengthOfLongestSubstring(s) {\n    const charSet = new Set();\n    let left = 0;\n    let maxLen = 0;\n\n    for (let right = 0; right < s.length; right++) {\n        while (charSet.has(s[right])) {\n            charSet.delete(s[left]);\n            left++;\n        }\n\n        charSet.add(s[right]);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n\n    return maxLen;\n}' }
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(min(m, n))',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz3 = [
  { text: 'A substring must be:', options: ['Any set of characters from the string in any order', 'A contiguous block of characters from the original string', 'Any sequence of characters in the original order, possibly skipping some', 'The first half of the string'], correctIndex: 1 },
  { text: 'In the sliding window approach, what does the left pointer do when we encounter a repeated character?', options: ['It jumps to just after the previous occurrence of that character', 'It moves one step to the right, regardless of where the repeat is', 'It resets to the beginning of the string', 'It stays in place while the right pointer moves back'], correctIndex: 0 },
  { text: 'For input "bbbbb", the longest substring without repeating characters has length:', options: ['5', '4', '1', '0'], correctIndex: 2 },
  { text: 'What data structure helps us efficiently check if a character is already in the current window?', options: ['A stack', 'A queue', 'A hash set (or hash map)', 'A linked list'], correctIndex: 2 },
  { text: 'Why is the time complexity O(n) even though there\'s a while loop inside the for loop?', options: ['Because n is always small', 'Because each character is removed from the set at most once, so total work is O(2n) = O(n)', 'Because the while loop never runs more than once', 'Because the set lookup is O(1)'], correctIndex: 1 }
];

push('### Longest Substring Without Repeating Characters\n');
problemJson(prob3);
quizJson(quiz3);
push('---\n');

// ===== Problem 4: Subarray Sum Equals K =====
const prob4 = {
  title: 'Subarray Sum Equals K',
  slug: 'subarray-sum-equals-k',
  lessonSlug: 'arrays',
  subtopicSlug: 'prefix-sum',
  difficulty: 'medium',
  topics: ['Arrays', 'Prefix Sum', 'Hash Map'],
  companies: ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Uber'],
  problemStatement: 'You are given an array of integers (which can be positive, negative, or zero) and a target integer k. Your task is to count how many contiguous subarrays sum to exactly k.\n\nA subarray is a contiguous block of elements — meaning elements that appear consecutively in the original array. Every single element counts as a subarray of length 1.\n\nFor example, given [1, 1, 1] and k = 2, there are two subarrays that sum to 2: [1, 1] (indices 0-1) and [1, 1] (indices 1-2). So the answer is 2.\n\nWrite a function that takes the array and k, and returns the count of subarrays that sum to exactly k.',
  examples: [
    { input: 'arr = [1, 1, 1], k = 2', output: '2', explanation: 'Two subarrays sum to 2: indices [0,1] (1+1) and indices [1,2] (1+1).' },
    { input: 'arr = [1, 2, 3], k = 3', output: '2', explanation: 'Two subarrays sum to 3: indices [0,1] (1+2=3) and indices [2,2] (3=3 — a single element subarray).' },
    { input: 'arr = [3, 4, 7, 2, -3, 1, 4, 2], k = 7', output: '4', explanation: 'Four subarrays sum to 7:\n- [3, 4] at indices 0-1 = 7\n- [7] at index 2 = 7\n- [7, 2, -3, 1] at indices 2-5 = 7\n- [1, 4, 2] at indices 5-7 = 7' }
  ],
  constraints: ['The array length is between 1 and 20,000.', 'Each element is an integer between -1000 and 1000.', 'k is an integer between -10^7 and 10^7.'],
  approach: '## Understanding the Problem\n\nWe need to count subarrays whose elements add up to exactly k. This is tricky because:\n- A subarray could be any length from 1 to n\n- Elements can be negative, so we can\'t use the sliding window technique\n\n### Step 1 — The Brute Force Approach\n\nCheck every possible subarray by summing its elements — O(n^2) even with optimized sum reuse. For n=20,000, that\'s 200 million subarrays.\n\n### Step 2 — The Key Insight: Prefix Sums + Hash Map\n\nRemember the prefix sum formula: sum(i, j) = prefix[j+1] - prefix[i].\n\nIf sum(i, j) = k, then:\n- prefix[j+1] - prefix[i] = k\n- prefix[j+1] - k = prefix[i]\n\nThis means: **when we\'re at position j, if any previous prefix sum equals (current prefix sum - k), then a subarray ending at j sums to k**.\n\n### Step 3 — The Algorithm\n\n1. Initialize prefix_sum = 0, a hash map with {0: 1}, and count = 0\n2. For each element in the array:\n   a. Add the element to prefix_sum\n   b. Check if (prefix_sum - k) exists in the map\n   c. If yes, add its count to our total (each occurrence = one subarray)\n   d. Increment the count for prefix_sum in the map\n3. Return count\n\nKey: we seed the map with {0: 1} to handle subarrays that start from index 0.\n\n### Step 4 — Walk Through an Example\n\nTrace on [3, 4, 7, 2, -3, 1, 4, 2] with k = 7:\n\n```\nInitialize: prefix_sum = 0, map = {0: 1}, count = 0\n\nIndex 0 (value=3):\n  prefix_sum = 3\n  Check: 3 - 7 = -4 → not in map\n  Add 3:1 to map\n\nIndex 1 (value=4):\n  prefix_sum = 7\n  Check: 7 - 7 = 0 → map has {0: 1} → count = 1\n  Add 7:1 to map\n  → Subarray [3, 4] (indices 0-1) sums to 7\n\nIndex 2 (value=7):\n  prefix_sum = 14\n  Check: 14 - 7 = 7 → map has {7: 1} → count = 2\n  Add 14:1 to map\n  → Subarray [7] (index 2) sums to 7\n\nIndex 3 (value=2):\n  prefix_sum = 16\n  Check: 16 - 7 = 9 → not in map\n  Add 16:1 to map\n\nIndex 4 (value=-3):\n  prefix_sum = 13\n  Check: 13 - 7 = 6 → not in map\n  Add 13:1 to map\n\nIndex 5 (value=1):\n  prefix_sum = 14\n  Check: 14 - 7 = 7 → map has {7: 1} → count = 3\n  Add 14:2 to map (now appears twice)\n  → Subarray [7, 2, -3, 1] (indices 2-5) sums to 7\n\nIndex 6 (value=4):\n  prefix_sum = 18\n  Check: 18 - 7 = 11 → not in map\n  Add 18:1 to map\n\nIndex 7 (value=2):\n  prefix_sum = 20\n  Check: 20 - 7 = 13 → map has {13: 1} → count = 4\n  Add 20:1 to map\n  → Subarray [1, 4, 2] (indices 5-7) sums to 7\n\nFinal count: 4\n```\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — we make a single pass through the array, with O(1) hash map operations at each step.\n- **Space Complexity: O(n)** — in the worst case, the hash map stores n+1 different prefix sums.\n\n### Python Code\n\n```python\ndef subarray_sum(arr, k):\n    # Dictionary to store the count of each prefix sum seen so far\n    prefix_map = {0: 1}\n    prefix_sum = 0\n    count = 0\n\n    for num in arr:\n        prefix_sum += num\n\n        # If (prefix_sum - k) has been seen before,\n        # then a subarray ending here sums to k\n        if (prefix_sum - k) in prefix_map:\n            count += prefix_map[prefix_sum - k]\n\n        # Record this prefix sum for future lookups\n        prefix_map[prefix_sum] = prefix_map.get(prefix_sum, 0) + 1\n\n    return count\n```\n\n### JavaScript Code\n\n```javascript\nfunction subarraySum(arr, k) {\n    // Map to store the count of each prefix sum seen so far\n    const prefixMap = new Map();\n    prefixMap.set(0, 1);\n    let prefixSum = 0;\n    let count = 0;\n\n    for (const num of arr) {\n        prefixSum += num;\n\n        // If (prefixSum - k) has been seen before,\n        // then a subarray ending here sums to k\n        if (prefixMap.has(prefixSum - k)) {\n            count += prefixMap.get(prefixSum - k);\n        }\n\n        // Record this prefix sum for future lookups\n        prefixMap.set(prefixSum, (prefixMap.get(prefixSum) || 0) + 1);\n    }\n\n    return count;\n}\n```',
  codeBlocks: [
    { language: 'python', code: 'def subarray_sum(arr, k):\n    # Dictionary to store the count of each prefix sum seen so far\n    prefix_map = {0: 1}\n    prefix_sum = 0\n    count = 0\n\n    for num in arr:\n        prefix_sum += num\n\n        # If (prefix_sum - k) has been seen before,\n        # then a subarray ending here sums to k\n        if (prefix_sum - k) in prefix_map:\n            count += prefix_map[prefix_sum - k]\n\n        # Record this prefix sum for future lookups\n        prefix_map[prefix_sum] = prefix_map.get(prefix_sum, 0) + 1\n\n    return count' },
    { language: 'javascript', code: 'function subarraySum(arr, k) {\n    // Map to store the count of each prefix sum seen so far\n    const prefixMap = new Map();\n    prefixMap.set(0, 1);\n    let prefixSum = 0;\n    let count = 0;\n\n    for (const num of arr) {\n        prefixSum += num;\n\n        // If (prefixSum - k) has been seen before,\n        // then a subarray ending here sums to k\n        if (prefixMap.has(prefixSum - k)) {\n            count += prefixMap.get(prefixSum - k);\n        }\n\n        // Record this prefix sum for future lookups\n        prefixMap.set(prefixSum, (prefixMap.get(prefixSum) || 0) + 1);\n    }\n\n    return count;\n}' }
  ],
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  youtubeUrl: '',
  pdfUrl: '',
  pptxUrl: '',
  media: []
};

const quiz4 = [
  { text: 'What is the key data structure used alongside prefix sums to solve this problem efficiently?', options: ['A stack', 'A queue', 'A hash map (to store prefix sum frequencies)', 'A linked list'], correctIndex: 2 },
  { text: 'Why do we initialize the hash map with {0: 1}?', options: ['Because arrays always start with 0', 'To handle subarrays that start from index 0 and sum to k', 'Because 0 is the first prefix sum we check', 'It\'s just a convention with no special meaning'], correctIndex: 1 },
  { text: 'In the approach, what does it mean when (prefix_sum - k) exists in the map?', options: ['The entire array sum equals k', 'There is a subarray ending at the current position that sums to k', 'There is a subarray starting at the current position that sums to k', 'k is larger than the total array sum'], correctIndex: 1 },
  { text: 'Why can\'t we use the sliding window technique for this problem when there are negative numbers?', options: ['Sliding window only works for strings, not arrays', 'Because adding more elements doesn\'t always increase the sum when negatives exist', 'Sliding window only works for consecutive elements', 'Because we need to return a count, not a max length'], correctIndex: 1 },
  { text: 'What is the space complexity of the optimal solution?', options: ['O(1) — we only use a few variables', 'O(log n) — we store a balanced tree', 'O(n) — the hash map can store up to n+1 prefix sums', 'O(n^2) — we store all subarray sums'], correctIndex: 2 }
];

push('### Subarray Sum Equals K\n');
problemJson(prob4);
quizJson(quiz4);

// ──────────────────────────────────────────────
// SUMMARY
// ──────────────────────────────────────────────
push('---\n');
push('## Summary\n');
push('');
push('| Entity | Count |');
push('|---|---|');
push('| Categories | 1 of 7 (same as Introduction to DSA) |');
push('| Lessons | 1 of 19 (order 1 in category) |');
push('| Subtopics | 4 of 34 |');
push('| Problems | 4 of 33 |');
push('| Quizzes | 4 of 33 |');

// Write file
fs.writeFileSync('dsa-content/next.md', lines.join('\n'), 'utf8');
console.log('Wrote next.md —', lines.join('\n').length, 'chars,', lines.length, 'lines');
