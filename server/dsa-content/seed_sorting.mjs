/*
 * Seed Sorting lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_sorting.mjs
 * NOTE: Generated from dsa-content/next.md — do not hand-edit; regenerate via generate_seed.mjs after updating next.md.
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
    { slug: "sorting" },
    {
      title: "Sorting",
      slug: "sorting",
      category: "searching-sorting-hashing",
      description: "Learn how to arrange data in order with Quick Sort — the divide-and-conquer algorithm that sorts in O(n log n) time on average. Understand pivoting, partitioning, and why it's one of the fastest sorting algorithms in practice.",
      image: "",
      icon: "ArrowUpDown",
      order: 1,
      difficulty: "medium",
      problemCount: 1
    },
    'Lesson "Sorting"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
    {
      slug: "quick-sort", lessonSlug: "sorting", order: 0,
      title: "Quick Sort",
      description: "Learn the divide-and-conquer sorting algorithm that picks a pivot, partitions the array so the pivot lands in its final sorted position, and recurses — sorting in O(n log n) average time with O(log n) space.",
      explanation: "## What is Sorting?\n\nImagine your school library. Books piled in the order they were returned — some face up, some sideways, completely mixed up. Finding a specific book would mean checking every single shelf. Now imagine the librarian spends one afternoon arranging everything alphabetically. After that, finding any book takes seconds.\n\nThat's sorting: rearranging data into a specific order (usually ascending or descending) so that finding, comparing, and processing data becomes dramatically easier.\n\nSorting is everywhere in real life:\n- Contact lists sorted by name\n- Leaderboards sorted by score\n- Music playlists sorted by artist\n- Search results sorted by relevance\n\nAnd in programming, sorting is one of the most important operations. Many algorithms (like the binary search you just learned!) only work on sorted data.\n\n## The Sorting Family\n\nThere are many sorting algorithms, each with different strengths and weaknesses:\n\n| Algorithm | Best Case | Average | Worst Case | Space |\n|---|---|---|---|---|\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |\n| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) |\n| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) |\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |\n\nIn this lesson, we focus on **Quick Sort** — one of the fastest and most widely used sorting algorithms in the real world. Many programming languages use a version of Quick Sort in their built-in sort functions.\n\n## Quick Sort — The Divide-and-Conquer Superstar\n\nQuick Sort follows the same \"divide and conquer\" philosophy you saw in binary search: break a big problem into smaller pieces, solve each piece, and combine the results.\n\nBut instead of just halving the array, Quick Sort does something clever: it picks a special element called the **pivot**, and rearranges the array so that:\n\n- Everything **smaller** than the pivot goes to its **left**\n- Everything **larger** than the pivot goes to its **right**\n\nAfter this step (called **partitioning**), the pivot is in its **final sorted position** — it never needs to move again!\n\nThen Quick Sort recursively applies the same process to the left part and the right part. When a part has 0 or 1 elements, it's already sorted — the recursion stops.\n\n## The Three Steps of Quick Sort\n\n1. **Choose a pivot** — any element. A simple choice: the last element (or the first, or the middle, or a random one).\n2. **Partition** — rearrange the array so smaller elements are left of the pivot and larger elements are right of it. The pivot lands in its correct spot.\n3. **Recurse** — apply Quick Sort to the left partition and the right partition.\n\n## Partitioning Explained Like You're Five\n\nSay we have `[8, 3, 5, 1, 9, 2]` and we pick the last element `2` as the pivot.\n\nWe'll use a pointer `i` that marks the boundary between the \"small section\" (left of the pivot) and the \"big section\" (right of the pivot).\n\n```\n[8, 3, 5, 1, 9, 2]   pivot = 2\n i                  // i = 0, boundary between small and big\n\nWalk through each element except the pivot:\n\n8: is 8 < 2? No -> it belongs to the big section. i stays 0.\n   [8, 3, 5, 1, 9, 2]\n\n3: is 3 < 2? No -> big section. i stays 0.\n   [8, 3, 5, 1, 9, 2]\n\n5: is 5 < 2? No -> big section. i stays 0.\n   [8, 3, 5, 1, 9, 2]\n\n1: is 1 < 2? Yes -> swap it with arr[i] (which is 8), then i becomes 1.\n   [1, 3, 5, 8, 9, 2]\n\n9: is 9 < 2? No -> big section. i stays 1.\n   [1, 3, 5, 8, 9, 2]\n\nFinally: swap the pivot (last element, 2) with arr[i] (which is 3).\n   [1, 2, 5, 8, 9, 3]\n    ^\n   pivot 2 is now at index 1 - its FINAL sorted position!\n```\n\nEverything left of `2` is smaller (`[1]`), everything right is larger (`[5, 8, 9, 3]`). Now recursively sort both sides:\n\n```\nInitial:     [8, 3, 5, 1, 9, 2]\nPivot = 2 -> [1, 2, 5, 8, 9, 3]   pivot 2 is final (index 1)\n\nRecurse left  [1]      -> already sorted ✓\nRecurse right [5, 8, 9, 3]\n  Pivot = 3 -> [3, 8, 9, 5]        pivot 3 is final (index 2)\n  Left  []   -> done ✓\n  Right [8, 9, 5]\n    Pivot = 5 -> [5, 9, 8]         pivot 5 is final (index 3)\n    Left  []  -> done ✓\n    Right [9, 8]\n      Pivot = 8 -> [8, 9]          pivot 8 is final (index 4)\n      Right [9] -> already sorted ✓\n\nFinal sorted array: [1, 2, 3, 5, 8, 9]\n```\n\n## Why Quick Sort Is So Fast — O(n log n)\n\nEach partitioning step walks the whole section once: that's O(n) work. And because the pivot splits the array roughly in half each time, there are only about log₂(n) levels of recursion:\n\n```\nLevel 0: n elements     -> n comparisons\nLevel 1: n/2 + n/2      -> n comparisons\nLevel 2: n/4 + n/4 + ... -> n comparisons\n...\nLevel log₂n:            -> n comparisons\n\nTotal: n × log₂n = O(n log n)\n```\n\nThis is the same growth rate as Merge Sort, and it's the fastest general-purpose sorting you'll get.\n\n## The Worst Case — O(n²) and How to Avoid It\n\nQuick Sort has a dark secret: if you always pick a bad pivot, it degrades to O(n²).\n\nThe worst case happens when the pivot is always the smallest (or largest) element. This happens if:\n- The array is already sorted, and you pick the first or last element as pivot\n- Each partition produces one empty side and one side with n-1 elements\n\n```\nAlready sorted: [1, 2, 3, 4, 5, 6]\nPivot = 6 (last) -> left has 5 elements, right has 0!\n```\n\nNow you have n levels of recursion instead of log₂n, each doing O(n) work — a total of O(n²).\n\n**The fix: pick a random pivot.** When the pivot is random, the chance of repeatedly hitting the worst case is astronomically small, and Quick Sort performs O(n log n) on virtually every real input.\n\n## Space Complexity — O(log n)\n\nQuick Sort sorts **in place** (no extra array needed, unlike Merge Sort which needs O(n) extra space). But recursion uses the call stack: each recursive call needs a little memory. Since we split roughly in half, the stack depth is about log₂(n), so the space complexity is **O(log n)**.\n\n## When to Use Quick Sort\n\n✅ You need to sort a large array fast (O(n log n) average)\n✅ You care about memory — it sorts in place\n✅ You're sorting random or mostly-random data\n✅ The built-in sort in many languages uses it under the hood\n\n❌ You need a guaranteed O(n log n) — use Merge Sort or Heap Sort instead\n❌ The array is already sorted or nearly sorted and you use a naive pivot\n❌ You need a stable sort (equal elements keep their original order) — Quick Sort is not stable\n\n## Key Takeaway\n\nQuick Sort is the classic divide-and-conquer sorting algorithm: pick a pivot, partition so the pivot lands in its final spot, and recurse. It averages O(n log n) with O(log n) space, making it one of the fastest practical sorts — and its partitioning step is so powerful that we reuse it in the very next problem to find the kth largest element without sorting at all!",
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
      slug: "kth-largest-element", lessonSlug: "sorting", subtopicSlug: "quick-sort",
      title: "Kth Largest Element", difficulty: "medium",
      topics: ["Sorting","Quick Select"],
      companies: ["Amazon","Google","Microsoft","Facebook","Apple","Uber"],
      problemStatement: "You are given an unsorted array of integers and an integer k. Your task is to find the kth largest element in the array.\n\nThe kth largest element is the element that would be at position k if the array were sorted in descending order (1-indexed). For example, the 1st largest element is the maximum, the 2nd largest is the second maximum, and so on.\n\nNote: duplicates in the array are counted separately. For example, in [3, 2, 3, 1, 2, 4, 5, 5, 6] with k = 4, the answer is 4.\n\nWrite a function that takes the array and k, and returns the kth largest element. You may assume that k is always between 1 and the length of the array.",
      examples: [{"input":"arr = [3, 2, 1, 5, 6, 4], k = 2","output":"5","explanation":"Sorted descending: [6, 5, 4, 3, 2, 1]. The 2nd largest element is 5."},{"input":"arr = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4","output":"4","explanation":"Sorted descending: [6, 5, 5, 4, 3, 3, 2, 2, 1]. The 4th largest element is 4. Notice duplicates (5, 5 and 3, 3) are counted separately."},{"input":"arr = [7], k = 1","output":"7","explanation":"Single element: the 1st largest element is the element itself."},{"input":"arr = [1, 2, 3, 4, 5], k = 5","output":"1","explanation":"Sorted descending: [5, 4, 3, 2, 1]. The 5th largest element (which is also the smallest) is 1."}],
      constraints: ["The array length is between 1 and 100,000 elements.","Each element is an integer between -10^9 and 10^9.","k is between 1 and the array length."],
      approach: "## Understanding the Problem\n\nThe kth largest element is the element that sits at position (n - k) if the array were sorted in ascending order. For example, in [3, 2, 1, 5, 6, 4] (n = 6), the 2nd largest element is at position 6 - 2 = 4 in ascending order: [1, 2, 3, 4, 5, 6].\n\nBut here's the catch: we only need ONE element — not the whole sorted array. Sorting everything is wasteful. Let's find a smarter way.\n\n### Step 1 — The Obvious Way: Sort and Index\n\nThe simplest solution is to sort the array ascending and pick arr[n - k]:\n\n```text\nFUNCTION find_kth_largest(nums, k):\n    SORT nums in ascending order\n    RETURN nums[length(nums) - k]\n```\n\nThis works, but it sorts the entire array even though we only care about one element — O(n log n) time. Can we do better?\n\n### Step 2 — The Quick Select Insight\n\nRemember Quick Sort's partition step from the lesson? After partitioning around a pivot, **the pivot is in its final sorted position**. That's exactly what we need!\n\nIf the pivot lands at index (n - k), we're done — that's our answer.\n- If the pivot lands BEFORE position (n - k), the answer must be to the **right**.\n- If the pivot lands AFTER position (n - k), the answer must be to the **left**.\n\nSo instead of recursing into BOTH sides (like Quick Sort), we only go into the ONE side that can contain the answer. This is called **Quick Select**, and it's dramatically faster.\n\n### Step 3 — The Algorithm\n\n1. Let target = n - k (the sorted position of the kth largest element)\n2. Partition the array around a pivot (we'll use the last element as the pivot for simplicity)\n3. After partitioning, pivotIndex tells us where the pivot landed:\n   - pivotIndex == target -> return arr[pivotIndex]\n   - pivotIndex < target -> search the right half (answer is bigger)\n   - pivotIndex > target -> search the left half (answer is smaller)\n4. Repeat until found\n\nTrace on [3, 2, 1, 5, 6, 4], k = 2 -> target = 6 - 2 = 4:\n\n```\nPartition around pivot 4 (last element):\n  [3, 2, 1, 4, 6, 5]  -> pivot 4 lands at index 3\n  target is 4, so we need index 4 -> search the right half [6, 5]\n\nPartition right half around pivot 5:\n  [3, 2, 1, 4, 5, 6]  -> pivot 5 lands at index 4\n  pivotIndex == target -> found! Return arr[4] = 5\n```\n\nAnswer: 5 ✓\n\n### Step 4 — Why This Works\n\nEvery partition places the pivot in its final sorted position. So the moment a pivot lands exactly where the kth largest element must be, we've found it. We never need to fully sort — we keep discarding the half that cannot possibly contain the answer.\n\n### Step 5 — Worst Case and the Random Pivot Fix\n\nLike Quick Sort, always picking a bad pivot (e.g., the last element on an already-sorted array) gives O(n²). The fix is the same: pick a **random pivot** so the expected time becomes O(n) on any input.\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** on average (we examine n + n/2 + n/4 + ... = 2n elements). Worst case O(n²) with a bad pivot.\n- **Space Complexity: O(1)** for the iterative version — only a few variables, no extra arrays.\n\n### Python Code\n\n```python\nimport random\n\ndef find_kth_largest(nums, k):\n    n = len(nums)\n    target = n - k  # index of kth largest in ascending sorted order\n\n    def partition(left, right):\n        # Random pivot to avoid the O(n^2) worst case\n        pivot_idx = random.randint(left, right)\n        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]\n        pivot = nums[right]\n        i = left\n        for j in range(left, right):\n            if nums[j] <= pivot:\n                nums[i], nums[j] = nums[j], nums[i]\n                i += 1\n        nums[i], nums[right] = nums[right], nums[i]\n        return i\n\n    left, right = 0, n - 1\n    while left <= right:\n        pivot_idx = partition(left, right)\n        if pivot_idx == target:\n            return nums[pivot_idx]\n        elif pivot_idx < target:\n            left = pivot_idx + 1\n        else:\n            right = pivot_idx - 1\n```\n\n### JavaScript Code\n\n```javascript\nfunction findKthLargest(nums, k) {\n    const n = nums.length;\n    const target = n - k;  // index of kth largest in ascending sorted order\n\n    function partition(left, right) {\n        // Random pivot to avoid the O(n^2) worst case\n        const pivotIdx = left + Math.floor(Math.random() * (right - left + 1));\n        [nums[pivotIdx], nums[right]] = [nums[right], nums[pivotIdx]];\n        const pivot = nums[right];\n        let i = left;\n        for (let j = left; j < right; j++) {\n            if (nums[j] <= pivot) {\n                [nums[i], nums[j]] = [nums[j], nums[i]];\n                i++;\n            }\n        }\n        [nums[i], nums[right]] = [nums[right], nums[i]];\n        return i;\n    }\n\n    let left = 0, right = n - 1;\n    while (left <= right) {\n        const pivotIdx = partition(left, right);\n        if (pivotIdx === target) {\n            return nums[pivotIdx];\n        } else if (pivotIdx < target) {\n            left = pivotIdx + 1;\n        } else {\n            right = pivotIdx - 1;\n        }\n    }\n}\n```",
      codeBlocks: [{"language":"python","code":"import random\n\ndef find_kth_largest(nums, k):\n    n = len(nums)\n    target = n - k  # index of kth largest in ascending sorted order\n\n    def partition(left, right):\n        # Random pivot to avoid the O(n^2) worst case\n        pivot_idx = random.randint(left, right)\n        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]\n        pivot = nums[right]\n        i = left\n        for j in range(left, right):\n            if nums[j] <= pivot:\n                nums[i], nums[j] = nums[j], nums[i]\n                i += 1\n        nums[i], nums[right] = nums[right], nums[i]\n        return i\n\n    left, right = 0, n - 1\n    while left <= right:\n        pivot_idx = partition(left, right)\n        if pivot_idx == target:\n            return nums[pivot_idx]\n        elif pivot_idx < target:\n            left = pivot_idx + 1\n        else:\n            right = pivot_idx - 1"},{"language":"javascript","code":"function findKthLargest(nums, k) {\n    const n = nums.length;\n    const target = n - k;  // index of kth largest in ascending sorted order\n\n    function partition(left, right) {\n        // Random pivot to avoid the O(n^2) worst case\n        const pivotIdx = left + Math.floor(Math.random() * (right - left + 1));\n        [nums[pivotIdx], nums[right]] = [nums[right], nums[pivotIdx]];\n        const pivot = nums[right];\n        let i = left;\n        for (let j = left; j < right; j++) {\n            if (nums[j] <= pivot) {\n                [nums[i], nums[j]] = [nums[j], nums[i]];\n                i++;\n            }\n        }\n        [nums[i], nums[right]] = [nums[right], nums[i]];\n        return i;\n    }\n\n    let left = 0, right = n - 1;\n    while (left <= right) {\n        const pivotIdx = partition(left, right);\n        if (pivotIdx === target) {\n            return nums[pivotIdx];\n        } else if (pivotIdx < target) {\n            left = pivotIdx + 1;\n        } else {\n            right = pivotIdx - 1;\n        }\n    }\n}"}],
      timeComplexity: "O(n) average", spaceComplexity: "O(1)",
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
      slug: "kth-largest-element",
      questions: [{"text":"What is the time complexity of Quick Sort on average?","options":["O(n²) — it degrades on every input","O(n log n) — the array is split roughly in half at each level","O(n) — each element is compared only once","O(log n) — the array is halved at each step"],"correctIndex":1},{"text":"After the partition step, what do we know about the pivot?","options":["It is the smallest element in the array","It moves to the start of the array","It is in its final sorted position","It gets removed from the array"],"correctIndex":2},{"text":"In Quick Select, why do we only recurse into ONE side of the partition?","options":["Because the array is already sorted","Because we only have time to sort half the array","Because after partitioning, we know the answer can only be in one half","Because recursion into two sides would overflow the stack"],"correctIndex":2},{"text":"In the Kth Largest Element problem, why is the target index n - k?","options":["Because arrays are 1-indexed in this problem","Because in ascending order, the kth largest element sits at index n - k","Because k is always equal to n","Because the array is sorted in descending order"],"correctIndex":1},{"text":"What happens to Quick Sort's time complexity if the pivot is always the largest element?","options":["It stays O(n log n) because pivoting is always fast","It becomes O(n) — fewer comparisons needed","It degrades to O(n²) — one partition is always empty","It becomes O(1) — no work is needed"],"correctIndex":2}]
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
  console.log('\n[SEED] Sorting lesson seeded successfully!');
  console.log(`  Lesson:    1 (Sorting)`);
  console.log(`  Subtopics: ${subtopics.length} (Quick Sort)`);
  console.log(`  Problems:  ${problems.length} (Kth Largest Element)`);
  console.log(`  Quizzes:   ${quizzes.length}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
