# Next DSA Content — Searching

## Category

- Order: 1
- Name: Searching, Sorting & Hashing
- Slug: `searching-sorting-hashing`

## Lesson

```json
{
  "title": "Searching",
  "slug": "searching",
  "category": "searching-sorting-hashing",
  "description": "Learn two fundamental search algorithms: Linear Search (check every element) and Binary Search (divide and conquer on sorted data). Understand when to use each and why Binary Search is exponentially faster.",
  "image": "",
  "icon": "Search",
  "order": 0,
  "difficulty": "easy",
  "problemCount": 1
}
```

## Subtopics (1)

### Linear & Binary Search

```json
{
  "title": "Linear & Binary Search",
  "slug": "linear-and-binary-search",
  "lessonSlug": "searching",
  "order": 0,
  "description": "Learn two ways to find an element in a list: Linear Search checks every item one by one; Binary Search repeatedly cuts the list in half, finding targets exponentially faster on sorted data.",
  "explanation": "## What is Searching?\n\nImagine you've lost your keys somewhere in your house. You have two strategies:\n\n1. **The Room-by-Room Method** — Start in one corner and check every single drawer, every shelf, every pocket until you find them. You might find them in the first place you look, or you might check every single spot in the entire house before giving up.\n\n2. **The Smart Method** — But this only works if you know something about where you lost them. You remember you last had them in either the kitchen or the living room, so you check only those two rooms first. Then you narrow it down further.\n\nSearching in programming is the same idea: given a list of items and a target value, find out whether the target exists in the list, and if so, where.\n\nThere are two fundamental approaches, and the one you should use depends entirely on whether your data is **sorted** or not.\n\n## Linear Search — The Room-by-Room Method\n\n### How It Works\n\nLinear search is the simplest search algorithm. You start at the beginning of the list and check every single element, one after another, until you find what you're looking for or reach the end.\n\n```text\nFUNCTION linear_search(arr, target):\n    FOR i FROM 0 TO length(arr) - 1:\n        IF arr[i] == target:\n            RETURN i          // Found it at index i\n\n    RETURN -1                   // Not found after checking everything\n```\n\n### Trace It\n\nSay you have `[4, 2, 9, 1, 7]` and you're looking for `9`:\n\n```\ni=0: arr[0] = 4 -> not 9, keep going\ni=1: arr[1] = 2 -> not 9, keep going\ni=2: arr[2] = 9 -> found! Return 2\n```\n\nOnly 3 checks out of 5. Lucky.\n\nBut what if you're looking for `10` (which doesn't exist)?\n\n```\ni=0: 4 != 10\ni=1: 2 != 10\ni=2: 9 != 10\ni=3: 1 != 10\ni=4: 7 != 10\nEnd of list -> Return -1\n```\n\nYou checked every single element — all 5 of them.\n\n### When to Use Linear Search\n\n- The list is **unsorted** (you have no choice)\n- The list is **very small** (the simplicity outweighs any performance gain)\n- You only need to search **once** (the cost of sorting isn't worth it)\n\n### Time Complexity\n\n- **Best case: O(1)** — the target is the very first element\n- **Worst case: O(n)** — the target is last, or doesn't exist at all. You check all n elements.\n- **Average case: O(n)** — on average, you check n/2 elements\n\n### Space Complexity\n\n- **O(1)** — you only need a single index variable\n\n## Binary Search — The Divide-and-Conquer Method\n\n### How It Works\n\nBinary search is dramatically faster, but it comes with one crucial requirement: **the data must be sorted**.\n\nThe idea is simple and powerful:\n\n1. Look at the middle element of the list\n2. If it's the target, you're done\n3. If the target is smaller than the middle, repeat the process on the **left half** of the list\n4. If the target is larger, repeat on the **right half**\n5. Keep going until you find it or the search space is empty\n\nAt every step, you eliminate **half** of the remaining elements. This is why it's so fast.\n\n```text\nFUNCTION binary_search(arr, target):\n    left = 0\n    right = length(arr) - 1\n\n    WHILE left <= right:\n        mid = left + (right - left) / 2   // Integer division\n\n        IF arr[mid] == target:\n            RETURN mid                     // Found it\n        ELSE IF arr[mid] < target:\n            left = mid + 1                 // Target is in the right half\n        ELSE:\n            right = mid - 1                // Target is in the left half\n\n    RETURN -1                              // Not found\n```\n\n> **Important:** The formula `mid = left + (right - left) / 2` is used instead of `mid = (left + right) / 2` to avoid integer overflow for very large arrays. Both give the same result in practice for most cases.\n\n### Trace It\n\nSay you have a sorted array `[2, 5, 8, 12, 16, 23, 38, 45, 56]` and you're looking for `23`:\n\n```\nStep 1: left=0, right=8, mid=4 -> arr[4]=16\n        16 < 23 -> target is in the right half\n        left becomes 5\n\nStep 2: left=5, right=8, mid=6 -> arr[6]=38\n        38 > 23 -> target is in the left half\n        right becomes 5\n\nStep 3: left=5, right=5, mid=5 -> arr[5]=23\n        23 == 23 -> Found! Return 5\n```\n\nOnly **3 comparisons** to find 23 in a list of 9 elements. Linear search would have taken 6 comparisons.\n\nNow say you're looking for `3` (not in the list):\n\n```\nStep 1: left=0, right=8, mid=4 -> arr[4]=16\n        16 > 3 -> target is in the left half\n        right becomes 3\n\nStep 2: left=0, right=3, mid=1 -> arr[1]=5\n        5 > 3 -> left half\n        right becomes 0\n\nStep 3: left=0, right=0, mid=0 -> arr[0]=2\n        2 < 3 -> right half\n        left becomes 1\n\nStep 4: left=1, right=0 -> left > right, loop exits\n        Return -1\n```\n\nOnly **3 comparisons** to determine that 3 doesn't exist in a list of 9 elements. Linear search would have checked all 9 before being sure.\n\n### The Magic: Why Binary Search Is So Fast\n\nEvery comparison eliminates half the remaining elements. This means the number of steps grows very slowly as the list grows:\n\n| List Size | Linear Search (worst case) | Binary Search (worst case) |\n|---|---|---|\n| 10 | 10 checks | 4 checks |\n| 1,000 | 1,000 checks | 10 checks |\n| 1,000,000 | 1,000,000 checks | 20 checks |\n| 1,000,000,000 | 1,000,000,000 checks | 30 checks |\n\nThis is the difference between O(n) and O(log n). For a billion elements, linear search takes a billion steps. Binary search takes just 30.\n\n### When to Use Binary Search\n\n- The data is **sorted** (this is mandatory)\n- The list is **large enough** that O(n) would be too slow\n- You need to search **many times** (it's worth keeping the data sorted)\n\n### Time Complexity\n\n- **Best case: O(1)** — the target is at the middle on the first check\n- **Worst case: O(log n)** — you keep halving until only one element remains. For n elements, that's about log₂(n) steps.\n- **Average case: O(log n)**\n\n### Space Complexity\n\n- **O(1)** for the iterative version — just three variables (left, right, mid)\n- **O(log n)** for the recursive version — the call stack grows with each recursive call\n\n## Linear vs Binary: Side by Side\n\n| Aspect | Linear Search | Binary Search |\n|---|---|---|\n| Data requirement | Any data | Must be sorted |\n| Time complexity | O(n) | O(log n) |\n| Space complexity | O(1) | O(1) iterative, O(log n) recursive |\n| Implementation | Trivial | Slightly more complex |\n| Best for | Small or unsorted data | Large sorted data |\n| Real-world example | Finding a name in an unsorted list | Looking up a word in a dictionary |\n\n## The Key Takeaway\n\nBinary search is one of the most important algorithms in computer science because it demonstrates a core principle: **if your data is organized, you can exploit that organization to solve problems exponentially faster.**\n\nThe same \"divide and conquer\" pattern appears again and again — in tree search, in sorting algorithms like Merge Sort and Quick Sort, and in many advanced data structures.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
```

---

## Problems (1)

### Binary Search

```json
{
  "title": "Binary Search",
  "slug": "binary-search",
  "lessonSlug": "searching",
  "subtopicSlug": "linear-and-binary-search",
  "difficulty": "easy",
  "topics": [
    "Searching",
    "Binary Search"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft",
    "Facebook",
    "Apple"
  ],
  "problemStatement": "You are given a sorted array of integers (sorted in increasing order) and a target integer. Your task is to find the index of the target in the array using binary search.\n\nIf the target exists in the array, return its index (0-based). If it does not exist, return -1.\n\nYou must implement the binary search algorithm — do not use a simple linear scan.\n\nFor example, given arr = [-1, 0, 3, 5, 9, 12] and target = 9, the answer is 4 because 9 is at index 4.",
  "examples": [
    {
      "input": "arr = [-1, 0, 3, 5, 9, 12], target = 9",
      "output": "4",
      "explanation": "Binary search trace:\n- left=0, right=5, mid=2 -> arr[2]=3 < 9 -> search right half (left=3)\n- left=3, right=5, mid=4 -> arr[4]=9 == 9 -> found! Return 4"
    },
    {
      "input": "arr = [-1, 0, 3, 5, 9, 12], target = 2",
      "output": "-1",
      "explanation": "Binary search trace:\n- left=0, right=5, mid=2 -> arr[2]=3 > 2 -> search left half (right=1)\n- left=0, right=1, mid=0 -> arr[0]=-1 < 2 -> search right half (left=1)\n- left=1, right=1, mid=1 -> arr[1]=0 < 2 -> search right half (left=2)\n- left=2, right=1 -> left > right, loop exits\n- Return -1 (not found)"
    },
    {
      "input": "arr = [5], target = 5",
      "output": "0",
      "explanation": "Single element: left=0, right=0, mid=0 -> arr[0]=5 == 5 -> found! Return 0"
    },
    {
      "input": "arr = [], target = 1",
      "output": "-1",
      "explanation": "Empty array: left=0, right=-1 -> left > right immediately, loop never runs. Return -1."
    }
  ],
  "constraints": [
    "The array length is between 0 and 100,000 elements.",
    "Each element is a 32-bit integer.",
    "The array is sorted in strictly increasing order."
  ],
  "approach": "## Understanding the Problem\n\nThis is the classic Binary Search problem — the algorithm that every computer scientist learns first after sorting. It tests whether you understand the divide-and-conquer principle and can implement it correctly without off-by-one errors.\n\n### Step 1 — The Linear Search Way (Too Slow)\n\nThe naive approach is to scan every element:\n\n```text\nFUNCTION linear_search(arr, target):\n    FOR i FROM 0 TO length(arr) - 1:\n        IF arr[i] == target:\n            RETURN i\n    RETURN -1\n```\n\nThis works, but it's O(n). For 100,000 elements, that's up to 100,000 checks. If you're searching many times, this becomes way too slow.\n\n### Step 2 — The Binary Search Insight\n\nSince the array is sorted, we can use the divide-and-conquer approach:\n\n1. Start with two pointers: `left` at index 0 and `right` at the last index\n2. Find the middle index: `mid = left + (right - left) / 2`\n3. Compare `arr[mid]` with the target:\n   - **Equal** → found it! Return mid\n   - **Less than target** → the target must be to the right (if it exists). Move `left` to `mid + 1`\n   - **Greater than target** → the target must be to the left. Move `right` to `mid - 1`\n4. Repeat until left passes right (meaning the search space is empty)\n\n### Step 3 — Trace the Full Algorithm\n\nLet's walk through `arr = [-1, 0, 3, 5, 9, 12]`, target = 9:\n\n```\nInitial: left = 0, right = 5\n\nIteration 1:\n  mid = 0 + (5 - 0) / 2 = 2\n  arr[2] = 3\n  3 < 9 -> target is in the right half\n  left = mid + 1 = 3\n\nIteration 2:\n  mid = 3 + (5 - 3) / 2 = 4\n  arr[4] = 9\n  9 == 9 -> found!\n  Return 4\n```\n\nOnly 2 iterations to find the target in a 6-element array. Linear search would have taken 5.\n\n### Step 4 — Edge Cases to Watch For\n\n1. **Empty array**: left (0) > right (-1) immediately. The loop never runs. Return -1.\n2. **Single element**: left == right. The loop runs once. If it matches, return the index. If not, left becomes > right and we return -1.\n3. **Target not in array**: Eventually left will pass right and we return -1.\n4. **Target smaller than every element**: After the first comparison, right moves to before mid, and eventually left > right.\n5. **Target larger than every element**: left keeps moving right until it passes right.\n\n### Step 5 — Handling the Mid Calculation\n\nAlways use `mid = left + (right - left) / 2` instead of `mid = (left + right) / 2`. Why? If left and right are very large (close to the maximum integer value), their sum can overflow. The alternative formula avoids this by calculating the offset from left instead.\n\n### Complexity Analysis\n\n- **Time Complexity: O(log n)** — each iteration eliminates half the remaining search space.\n- **Space Complexity: O(1)** — we only use three variables (left, right, mid) regardless of input size.\n\n### Python Code\n\n```python\ndef binary_search(arr, target):\n    left = 0\n    right = len(arr) - 1\n\n    while left <= right:\n        mid = left + (right - left) // 2\n\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n\n    return -1\n```\n\n### JavaScript Code\n\n```javascript\nfunction binarySearch(arr, target) {\n    let left = 0;\n    let right = arr.length - 1;\n\n    while (left <= right) {\n        const mid = left + Math.floor((right - left) / 2);\n\n        if (arr[mid] === target) {\n            return mid;\n        } else if (arr[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n\n    return -1;\n}\n```",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def binary_search(arr, target):\n    left = 0\n    right = len(arr) - 1\n\n    while left <= right:\n        mid = left + (right - left) // 2\n\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n\n    return -1"
    },
    {
      "language": "javascript",
      "code": "function binarySearch(arr, target) {\n    let left = 0;\n    let right = arr.length - 1;\n\n    while (left <= right) {\n        const mid = left + Math.floor((right - left) / 2);\n\n        if (arr[mid] === target) {\n            return mid;\n        } else if (arr[mid] < target) {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n\n    return -1;\n}"
    }
  ],
  "timeComplexity": "O(log n)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
}
```

---

**Quiz — 5 MCQs**

```json
{
  "questions": [
    {
      "text": "What is the one condition that must be true for binary search to work correctly?",
      "options": [
        "The array must contain only positive numbers",
        "The array must be sorted",
        "The array must have no duplicate values",
        "The array must have at least 10 elements"
      ],
      "correctIndex": 1
    },
    {
      "text": "How many elements does binary search examine in the worst case when searching an array of 1,000 elements?",
      "options": [
        "1,000 elements (all of them)",
        "500 elements (half of them)",
        "About 10 elements (log₂(1000) ≈ 10)",
        "Exactly 1 element"
      ],
      "correctIndex": 2
    },
    {
      "text": "In the binary search while loop, why do we use `left <= right` instead of `left < right`?",
      "options": [
        "They both work the same way",
        "To handle the case where the array has only one element (left == right)",
        "To make the loop run faster",
        "To prevent integer overflow"
      ],
      "correctIndex": 1
    },
    {
      "text": "What does binary search return if the target is not found in the array?",
      "options": [
        "0",
        "The index where the target would be inserted",
        "-1",
        "undefined"
      ],
      "correctIndex": 2
    },
    {
      "text": "Why do we write `mid = left + (right - left) / 2` instead of `mid = (left + right) / 2`?",
      "options": [
        "It's the same formula written differently — no real difference",
        "To avoid integer overflow when left and right are very large",
        "To make the code run faster",
        "To handle negative numbers correctly"
      ],
      "correctIndex": 1
    }
  ]
}
```

---

## Summary


| Entity | Count |
|---|

| Categories | 1 of 7 (new category: Searching, Sorting & Hashing) |
|---|

| Lessons | 1 of 19 (order 0 in new category) |
|---|

| Subtopics | 1 of 34 |
|---|

| Problems | 1 of 33 |
|---|

| Quizzes | 1 of 33 |
