# Next DSA Content — Queues

## Category

- Order: 3
- Name: Linked Lists, Stacks & Queues
- Slug: `linked-lists-stacks-queues`

## Lesson

```json
{
  "title": "Queues",
  "slug": "queues",
  "category": "linked-lists-stacks-queues",
  "description": "Meet the queue — the First-In-First-Out data structure behind printer lines, task scheduling, and BFS. Learn the core enqueue/dequeue operations, how to build a queue from two stacks, and the deque trick that powers sliding window maximum.",
  "image": "",
  "icon": "ListOrdered",
  "order": 2,
  "difficulty": "medium",
  "problemCount": 2
}
```

## Subtopics (2)

### Queue Basics

```json
{
  "title": "Queue Basics",
  "slug": "queue-basics",
  "lessonSlug": "queues",
  "order": 0,
  "description": "Learn the First-In-First-Out (FIFO) queue: the enqueue, dequeue, and peek operations, its real-world uses (printers, task scheduling, BFS), and how to implement one using two stacks.",
  "explanation": "## What is a Queue?\\n\\nA queue is a collection where you add items at the BACK and remove them from the FRONT. Think of a line of people at a ticket counter: the first person to join the line is the first person served. That's why a queue is called **First-In-First-Out** (FIFO).\\n\\n## The Core Operations\\n\\nEvery queue supports three fundamental operations:\\n\\n1. **Enqueue** — add an item at the back\\n2. **Dequeue** — remove the item at the front (and return it)\\n3. **Peek / Front** — look at the front item without removing it\\n\\nAll three run in **O(1)** time when implemented with a proper circular buffer.\\n\\n## Visualising the Queue\\n\\n```\\n        enqueue 3    enqueue 7    dequeue -> 3    dequeue -> 7\\n\\nFRONT            BACK\\n  +---+---+---+     +---+---+---+     +---+---+---+     +---+---+---+\\n  | 3 |   |   | --> | 3 | 7 |   | --> |   | 7 |   | --> |   |   |   |\\n  +---+---+---+     +---+---+---+     +---+---+---+     +---+---+---+\\n```\\n\\nItems enter at the back and leave at the front — the opposite of a stack.\\n\\n## Stack vs Queue\\n\\n| Feature | Stack | Queue |\\n|---|---|---|\\n| Order | Last-In-First-Out (LIFO) | First-In-First-Out (FIFO) |\\n| Add | Push (top) | Enqueue (back) |\\n| Remove | Pop (top) | Dequeue (front) |\\n| Analogy | Stack of plates | Line of people |\\n| Best for | History / undo / nesting | Scheduling / waiting lines |\\n\\n## Real-World Uses of a Queue\\n\\n✅ **Printer queues** — documents print in the order they were submitted\\n✅ **Task scheduling** — CPU and OS schedules processes FIFO (round-robin is queue-based)\\n✅ **Breadth-First Search (BFS)** — explores a graph level by level using a queue\\n✅ **Buffers** — keyboard input, network packets, message queues\\n✅ **Customer service lines** — first come, first served\\n\\n## The Tricky Part: Queue Using Two Stacks\\n\\nStacks are LIFO; queues are FIFO. To build a queue from stacks, use the **two-stack trick**:\\n\\n- **Enqueue**: always push into the 'in' stack (newest on top)\\n- **Dequeue**: if the 'out' stack is empty, dump ALL items from 'in' into 'out' (this flips their order, oldest ends up on top); then pop the top of 'out'\\n\\n```\\nin:  [1, 2, 3]   (3 is on top)\\n\\ndequeue: dump in -> out flips to [3, 2, 1] (1 on top), pop 1\\n\\nnext dequeue: out still has 2 on top -> pop 2  (no dumping needed)\\n```\\n\\nEach element is moved between stacks at most twice, so the amortised cost is O(1) per operation.\\n\\n## When to Use a Queue\\n\\n✅ The problem processes items in the order they arrive (FIFO)\\n✅ Level-order / BFS traversal, sliding windows that need order\\n✅ Task scheduling, buffering, and producer-consumer patterns\\n\\n❌ When you need the most recent item first — that's a stack's job\\n\\n## Complexity Summary\\n\\n| Operation | Time |\\n|---|---|\\n| Enqueue | O(1) |\\n| Dequeue | O(1) |\\n| Peek | O(1) |\\n| Search | O(n) |\\n\\n## Key Takeaway\\n\\nA queue is a **First-In-First-Out** collection with O(1) enqueue/dequeue/peek. Whenever a problem needs fairness, scheduling, or BFS order — reach for a queue. And remember the two-stack trick to build one from LIFO primitives.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
```

### Deque

```json
{
  "title": "Deque",
  "slug": "deque",
  "lessonSlug": "queues",
  "order": 1,
  "description": "Learn the deque (double-ended queue) — add and remove from BOTH ends in O(1). Master the monotonic-deque trick that computes the maximum of every sliding window in O(n) total time.",
  "explanation": "## What is a Deque?\\n\\nA **deque** (pronounced 'deck', short for double-ended queue) is a queue where you can add or remove items from BOTH the front and the back — all in O(1) time.\\n\\n```\\n        remove front (popleft)          remove back (pop)\\n              ^                              ^\\nFRONT  |  1  |  2  |  3  |  4  |  BACK\\n              v                              v\\n        add front (appendleft)          add back (append)\\n```\\n\\nIt combines the best of a stack and a queue: four O(1) operations.\\n\\n## Why We Need It: Sliding Window Maximum\\n\\nA classic problem: given an array and a window size k, find the maximum of every window as it slides right.\\n\\nBrute force checks every element in every window: O(n * k). For a big array that's too slow.\\n\\n## The Monotonic Deque Trick\\n\\nKeep a **deque of indices** whose values are strictly decreasing from front to back. The FRONT always holds the index of the current window's maximum.\\n\\nFor each new element (index i):\\n\\n1. **Remove expired indices** — pop from the front while the index is outside the current window (i - k)\\n2. **Maintain decreasing order** — pop from the back while the value at that index is <= the new value (those smaller values can never be the max again while the new bigger value is around)\\n3. **Add the new index** at the back\\n4. **Record the answer** — once the window is full (i >= k - 1), the front of the deque is the window maximum\\n\\n## Watch It In Action\\n\\nArray [1, 3, -1, -3, 5], window k = 3:\\n\\n```\\ni=0: deque [0] (1)          -> window not full\\ni=1: 3 > 1, pop 0 -> deque [1] (3)   -> not full\\ni=2: -1 < 3, keep -> deque [1,2] (3,-1) -> max = 3 ✓\\ni=3: -3 < -1, keep -> deque [1,2,3] (3,-1,-3) -> max = 3 ✓\\ni=4: 5 pops -3, -1, 3 -> deque [4] (5) -> max = 5 ✓\\n\\nanswers: [3, 3, 5]\\n```\\n\\nEach index is added once and removed at most once — total work is O(n).\\n\\n## When to Use a Deque\\n\\n✅ Sliding window min/max problems\\n✅ Problems needing O(1) add/remove at BOTH ends\\n✅ Monotonic queue patterns (decreasing for max, increasing for min)\\n\\n❌ When a plain FIFO queue suffices and you never touch the back\\n\\n## Complexity\\n\\n| Approach | Time | Space |\\n|---|---|---|\\n| Brute force per window | O(n * k) | O(1) |\\n| Monotonic deque | O(n) | O(k) |\\n\\nEach element enters and leaves the deque once, giving linear total time.\\n\\n## Key Takeaway\\n\\nA deque is a double-ended queue with O(1) operations on both ends. Keep a **monotonic deque** (decreasing for maxima) and each element is processed once — sliding window maximum drops from O(n*k) to O(n).",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
```

---

## Problems (2)

### Implement Queue using Stacks

```json
{
  "title": "Implement Queue using Stacks",
  "slug": "implement-queue-using-stacks",
  "lessonSlug": "queues",
  "subtopicSlug": "queue-basics",
  "difficulty": "easy",
  "topics": [
    "Queue",
    "Stack",
    "Design"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft",
    "Meta",
    "Apple"
  ],
  "problemStatement": "Implement a First-In-First-Out (FIFO) queue using only two stacks. The implemented queue must support all standard operations:\\n\\n- push(x): push element x to the back of the queue\\n- pop(): remove the element from the front of the queue and return it\\n- peek(): return the element at the front of the queue without removing it\\n- empty(): return whether the queue is empty\\n\\nYou may only use the standard stack operations — push to top, peek/pop from top, size, and is empty — which are all O(1) each.\\n\\nFor example, after push(1), push(2), push(3): pop() should return 1 (the first element pushed).",
  "examples": [
    {
      "input": "push(1), push(2), push(3), pop()",
      "output": "1",
      "explanation": "Elements enter in order 1, 2, 3 — the first one in must be the first one out, so pop returns 1."
    },
    {
      "input": "push(1), push(2), peek(), pop(), empty()",
      "output": "1, 1, false",
      "explanation": "peek sees the front (1); pop removes it; the queue still holds 2 so it is not empty."
    },
    {
      "input": "push(1), pop(), empty()",
      "output": "1, true",
      "explanation": "After pushing and popping the only element, the queue is empty."
    },
    {
      "input": "push(1), push(2), push(3), pop(), peek()",
      "output": "1, 2",
      "explanation": "pop removes 1; the new front is 2 so peek returns 2."
    }
  ],
  "constraints": [
    "At most 100 operations will be called.",
    "pop and peek are only called when the queue is non-empty.",
    "All values pushed are integers."
  ],
  "approach": "## Understanding the Problem\\n\\nA stack is LIFO (last in, first out); a queue is FIFO (first in, first out). We must fake FIFO behaviour using only LIFO stacks. The trick: use ONE stack for entering ('in') and ONE stack for leaving ('out'), and FLIP the order when we move items between them.\\n\\n## The Two-Stack Idea\\n\\n- **push(x)**: always push x onto the 'in' stack. (Newest is on top of 'in'.)\\n- **pop() / peek()**: we need the OLDEST element. If 'out' is empty, dump everything from 'in' into 'out' — this reverses the order, so the oldest element lands on top of 'out'. Then pop/peek the top of 'out'.\\n\\nThe 'out' stack is a lazily-flipped buffer: we only dump when it runs dry.\\n\\n## Pseudocode\\n\\n```\\nCLASS MyQueue:\\n    in  = empty stack   # for pushes\\n    out = empty stack   # for pops/peeks\\n\\n    FUNCTION push(x):\\n        in.push(x)                      # newest goes on top of 'in'\\n\\n    FUNCTION transferIfNeeded():\\n        IF out is empty:\\n            WHILE in is not empty:\\n                out.push(in.pop())      # flip: oldest ends up on top of 'out'\\n\\n    FUNCTION pop():\\n        transferIfNeeded()\\n        RETURN out.pop()                 # remove the front\\n\\n    FUNCTION peek():\\n        transferIfNeeded()\\n        RETURN out.top()                 # look at the front\\n\\n    FUNCTION empty():\\n        RETURN in is empty AND out is empty\\n```\\n\\n## Trace\\n\\n```\\npush(1) -> in: [1]\\npush(2) -> in: [2, 1]   (2 on top)\\npush(3) -> in: [3, 2, 1]\\n\\npop(): out empty -> dump: in -> out flips to [1, 2, 3] (1 on top)\\n       pop -> 1 ✓\\npeek(): out has 2 on top -> 2 ✓   (no dump needed)\\npop(): -> 2 ✓\\nempty(): out still has 3 -> false\\n```\\n\\nThe flip happens rarely, and each element is moved at most twice, so everything is fast on average.\\n\\n## Complexity Analysis\\n\\n- **Time Complexity: O(1) amortised per operation** — each element is pushed once and moved to 'out' at most once. A single pop can cost O(n), but across n operations it averages out to O(1).\\n- **Space Complexity: O(n)** — the two stacks together hold all n elements.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "class MyQueue:\n    def __init__(self):\n        self.in_stack = []   # newest elements on top\n        self.out_stack = []  # oldest elements on top\n\n    def push(self, x):\n        self.in_stack.append(x)\n\n    def _transfer(self):\n        # Flip 'in' into 'out' so the oldest element is on top\n        if not self.out_stack:\n            while self.in_stack:\n                self.out_stack.append(self.in_stack.pop())\n\n    def pop(self):\n        self._transfer()\n        return self.out_stack.pop()\n\n    def peek(self):\n        self._transfer()\n        return self.out_stack[-1]\n\n    def empty(self):\n        return not self.in_stack and not self.out_stack"
    },
    {
      "language": "javascript",
      "code": "var MyQueue = function () {\n    this.inStack = [];   // newest elements on top\n    this.outStack = [];  // oldest elements on top\n};\n\nMyQueue.prototype.push = function (x) {\n    this.inStack.push(x);\n};\n\nMyQueue.prototype._transfer = function () {\n    // Flip 'in' into 'out' so the oldest element is on top\n    if (this.outStack.length === 0) {\n        while (this.inStack.length > 0) {\n            this.outStack.push(this.inStack.pop());\n        }\n    }\n};\n\nMyQueue.prototype.pop = function () {\n    this._transfer();\n    return this.outStack.pop();\n};\n\nMyQueue.prototype.peek = function () {\n    this._transfer();\n    return this.outStack[this.outStack.length - 1];\n};\n\nMyQueue.prototype.empty = function () {\n    return this.inStack.length === 0 && this.outStack.length === 0;\n};"
    }
  ],
  "timeComplexity": "O(1) amortised",
  "spaceComplexity": "O(n)",
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
      "text": "What order does a queue follow?",
      "options": [
        "Last-In-First-Out (LIFO)",
        "First-In-First-Out (FIFO)",
        "Random order",
        "Sorted order"
      ],
      "correctIndex": 1
    },
    {
      "text": "In the two-stack queue, where does push(x) put the element?",
      "options": [
        "Onto the 'out' stack",
        "Onto the 'in' stack",
        "Into the middle of both stacks",
        "Nowhere — queues don't use stacks"
      ],
      "correctIndex": 1
    },
    {
      "text": "When is the 'out' stack refilled from the 'in' stack?",
      "options": [
        "On every operation",
        "Only when the 'out' stack is empty",
        "Only when the 'in' stack is empty",
        "When the queue is full"
      ],
      "correctIndex": 1
    },
    {
      "text": "What is the amortised time complexity of each queue operation?",
      "options": [
        "O(n)",
        "O(log n)",
        "O(n^2)",
        "O(1)"
      ],
      "correctIndex": 3
    },
    {
      "text": "After push(1), push(2), push(3), what does pop() return?",
      "options": [
        "3",
        "2",
        "1",
        "Nothing — the queue is empty"
      ],
      "correctIndex": 2
    }
  ]
}
```

---

### Sliding Window Maximum

```json
{
  "title": "Sliding Window Maximum",
  "slug": "sliding-window-maximum",
  "lessonSlug": "queues",
  "subtopicSlug": "deque",
  "difficulty": "hard",
  "topics": [
    "Deque",
    "Queue",
    "Monotonic Queue",
    "Array"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft",
    "Meta",
    "Apple",
    "Uber"
  ],
  "problemStatement": "You are given an array of integers and a window size k. The window starts at the left and slides one position to the right at a time — always covering exactly k elements.\\n\\nFor every position of the window, find the MAXIMUM value inside it, and return these maxima as an array.\\n\\nFor example, with nums = [1, 3, -1, -3, 5, 3, 6, 7] and k = 3:\\n- Window [1, 3, -1] -> max 3\\n- Window [3, -1, -3] -> max 3\\n- Window [-1, -3, 5] -> max 5\\n- ...and so on\\n\\nThe final answer is [3, 3, 5, 5, 6, 7].",
  "examples": [
    {
      "input": "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3",
      "output": "[3, 3, 5, 5, 6, 7]",
      "explanation": "Each window's maximum: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7."
    },
    {
      "input": "nums = [1], k = 1",
      "output": "[1]",
      "explanation": "A single window of size 1 contains just 1, so its max is 1."
    },
    {
      "input": "nums = [1, -1], k = 1",
      "output": "[1, -1]",
      "explanation": "Every window is a single element, so the maxima are the elements themselves."
    },
    {
      "input": "nums = [9, 11], k = 2",
      "output": "[11]",
      "explanation": "One window [9, 11] — the maximum is 11."
    }
  ],
  "constraints": [
    "The array length is between 1 and 100,000.",
    "k is between 1 and the array length.",
    "Each element is an integer between -10,000 and 10,000."
  ],
  "approach": "## Understanding the Problem\\n\\nWe need the maximum of every k-sized window as it slides across the array. Brute force scans all k elements for each window — O(n * k). With a big array that's far too slow.\\n\\n## The Monotonic Deque Idea\\n\\nKeep a **deque of indices** whose values stay strictly decreasing from front to back. The front of the deque is always the index of the current window's maximum.\\n\\nFor each index i (processing left to right):\\n\\n1. **Remove expired indices** — while the front index is outside the window (front <= i - k), popleft it\\n2. **Keep the deque decreasing** — while the value at the back index is <= nums[i], pop it (that older, smaller-or-equal element can never be a max again while the newer bigger value is in the window)\\n3. **Add index i** at the back\\n4. **Record the answer** — once the window is full (i >= k - 1), the front of the deque is this window's maximum\\n\\n## Pseudocode\\n\\n```\\nFUNCTION maxSlidingWindow(nums, k):\\n    deque = empty deque of indices\\n    answer = empty list\\n\\n    FOR i from 0 to length(nums) - 1:\\n        # 1. Drop indices outside the current window\\n        WHILE deque is not empty AND deque.front <= i - k:\\n            POP FRONT of deque\\n\\n        # 2. Keep values decreasing: remove smaller/equal values from the back\\n        WHILE deque is not empty AND nums[deque.back] <= nums[i]:\\n            POP BACK of deque\\n\\n        # 3. This index is now a candidate\\n        PUSH i onto BACK of deque\\n\\n        # 4. Window full -> record its maximum\\n        IF i >= k - 1:\\n            answer.append(nums[deque.front])\\n\\n    RETURN answer\\n```\\n\\n## Trace on nums = [1, 3, -1, -3, 5], k = 3\\n\\n```\\ni=0 (1): deque [0]                -> window not full\\ni=1 (3): 3 > 1, pop back 0 -> deque [1]      -> not full\\ni=2 (-1): -1 < 3, keep -> deque [1, 2]      -> max = nums[1] = 3 ✓\\ni=3 (-3): -3 < -1, keep -> deque [1, 2, 3]  -> max = 3 ✓\\ni=4 (5): 5 pops -3, -1, 3 -> deque [4]      -> max = 5 ✓\\n\\nanswer = [3, 3, 5]\\n```\\n\\nNotice the big 5 'absorbed' all the smaller elements — they were doomed to never be a max again.\\n\\n## Why Each Element Is Processed Only Once\\n\\nEvery index is added to the deque exactly once and removed at most once. That single fact makes the whole algorithm linear.\\n\\n## Complexity Analysis\\n\\n- **Time Complexity: O(n)** — each index is pushed once and popped at most once.\\n- **Space Complexity: O(k)** — the deque holds at most k indices (one window).",
  "codeBlocks": [
    {
      "language": "python",
      "code": "from collections import deque\n\ndef maxSlidingWindow(nums, k):\n    dq = deque()   # stores indices, values strictly decreasing\n    answer = []\n\n    for i, val in enumerate(nums):\n        # 1. Remove indices outside the current window\n        while dq and dq[0] <= i - k:\n            dq.popleft()\n\n        # 2. Keep values decreasing: pop smaller/equal values from the back\n        while dq and nums[dq[-1]] <= val:\n            dq.pop()\n\n        # 3. This index is now a candidate\n        dq.append(i)\n\n        # 4. Window full -> record its maximum\n        if i >= k - 1:\n            answer.append(nums[dq[0]])\n\n    return answer"
    },
    {
      "language": "javascript",
      "code": "function maxSlidingWindow(nums, k) {\n    const dq = [];   // stores indices, values strictly decreasing\n    let head = 0;    // logical front pointer (O(1) expiry instead of shift())\n    const answer = [];\n\n    for (let i = 0; i < nums.length; i++) {\n        const val = nums[i];\n\n        // 1. Remove indices outside the current window\n        while (head < dq.length && dq[head] <= i - k) {\n            head++;\n        }\n\n        // 2. Keep values decreasing: pop smaller/equal values from the back\n        while (dq.length > head && nums[dq[dq.length - 1]] <= val) {\n            dq.pop();\n        }\n\n        // 3. This index is now a candidate\n        dq.push(i);\n\n        // 4. Window full -> record its maximum\n        if (i >= k - 1) {\n            answer.push(nums[dq[head]]);\n        }\n\n        // Compact occasionally so the deque stays O(k) in memory\n        if (head >= k) {\n            dq.splice(0, head);\n            head = 0;\n        }\n    }\n\n    return answer;\n}"
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(k)",
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
      "text": "What kind of deque does Sliding Window Maximum keep?",
      "options": [
        "A monotonic increasing deque",
        "A monotonic decreasing deque",
        "A random deque",
        "No deque at all"
      ],
      "correctIndex": 1
    },
    {
      "text": "Where is the current window's maximum stored?",
      "options": [
        "At the back of the deque",
        "At the middle of the deque",
        "At the front of the deque",
        "Nowhere — it is recomputed each time"
      ],
      "correctIndex": 2
    },
    {
      "text": "When do we remove an index from the front of the deque?",
      "options": [
        "When it is smaller than the new element",
        "When it has fallen out of the current window",
        "When it is bigger than the new element",
        "Never"
      ],
      "correctIndex": 1
    },
    {
      "text": "Why do we pop smaller-or-equal values from the back before adding the new element?",
      "options": [
        "To sort the array",
        "Because they can never be a window maximum while the newer bigger value is present",
        "To save memory",
        "To keep the deque empty"
      ],
      "correctIndex": 1
    },
    {
      "text": "What is the time complexity of the sliding window maximum solution?",
      "options": [
        "O(n * k)",
        "O(n^2)",
        "O(n log n)",
        "O(n)"
      ],
      "correctIndex": 3
    }
  ]
}
```

---

## Summary

| Entity | Count |
|---|

| Categories | 0 of 7 (same category: Linked Lists, Stacks & Queues) |
|---|

| Lessons | 1 of 19 (order 2 in category) |
|---|

| Subtopics | 2 of 34 |
|---|

| Problems | 2 of 33 |
|---|

| Quizzes | 2 of 33 |
