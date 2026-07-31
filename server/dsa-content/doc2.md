# DSA Learning Document — Queues

> A comprehensive, student-friendly guide to Queues — the First-In-First-Out superpower behind printer lines, task scheduling, and BFS.
> Master the FIFO queue and the double-ended deque with two classics: Implement Queue using Stacks and Sliding Window Maximum.

---

# 9. Queues

> **Lesson Overview:** A queue is a FIFO (First-In-First-Out) collection with O(1) enqueue/dequeue/peek. Learn when to reach for it — fairness, scheduling, and BFS — then master the deque for O(n) solutions to Implement Queue using Stacks (O(1) amortised) and Sliding Window Maximum (O(n)).
> - **Category:** Linked Lists, Stacks & Queues
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 9.1 Queue Basics

### What is a Queue?

A queue is a collection where you add items at the BACK and remove them from the FRONT. Think of a line of people at a ticket counter: the first person to join the line is the first person served. That's why a queue is called **First-In-First-Out** (FIFO).

### The Core Operations

Every queue supports three fundamental operations:

1. **Enqueue** — add an item at the back
2. **Dequeue** — remove the item at the front (and return it)
3. **Peek / Front** — look at the front item without removing it

All three run in **O(1)** time when implemented with a proper circular buffer.

### Visualising the Queue

```
        enqueue 3    enqueue 7    dequeue -> 3    dequeue -> 7

FRONT            BACK
  +---+---+---+     +---+---+---+     +---+---+---+     +---+---+---+
  | 3 |   |   | --> | 3 | 7 |   | --> |   | 7 |   | --> |   |   |   |
  +---+---+---+     +---+---+---+     +---+---+---+     +---+---+---+
```

Items enter at the back and leave at the front — the opposite of a stack.

### Stack vs Queue

| Feature | Stack | Queue |
|---|---|---|
| Order | Last-In-First-Out (LIFO) | First-In-First-Out (FIFO) |
| Add | Push (top) | Enqueue (back) |
| Remove | Pop (top) | Dequeue (front) |
| Analogy | Stack of plates | Line of people |
| Best for | History / undo / nesting | Scheduling / waiting lines |

### Real-World Uses of a Queue

✅ **Printer queues** — documents print in the order they were submitted
✅ **Task scheduling** — CPU and OS schedules processes FIFO (round-robin is queue-based)
✅ **Breadth-First Search (BFS)** — explores a graph level by level using a queue
✅ **Buffers** — keyboard input, network packets, message queues
✅ **Customer service lines** — first come, first served

### The Tricky Part: Queue Using Two Stacks

Stacks are LIFO; queues are FIFO. To build a queue from stacks, use the **two-stack trick**:

- **Enqueue**: always push into the 'in' stack (newest on top)
- **Dequeue**: if the 'out' stack is empty, dump ALL items from 'in' into 'out' (this flips their order, oldest ends up on top); then pop the top of 'out'

```
in:  [1, 2, 3]   (3 is on top)

dequeue: dump in -> out flips to [3, 2, 1] (1 on top), pop 1

next dequeue: out still has 2 on top -> pop 2  (no dumping needed)
```

Each element is moved between stacks at most twice, so the amortised cost is O(1) per operation.

### When to Use a Queue

✅ The problem processes items in the order they arrive (FIFO)
✅ Level-order / BFS traversal, sliding windows that need order
✅ Task scheduling, buffering, and producer-consumer patterns

❌ When you need the most recent item first — that's a stack's job

### Complexity Summary

| Operation | Time |
|---|---|
| Enqueue | O(1) |
| Dequeue | O(1) |
| Peek | O(1) |
| Search | O(n) |

### Key Takeaway

A queue is a **First-In-First-Out** collection with O(1) enqueue/dequeue/peek. Whenever a problem needs fairness, scheduling, or BFS order — reach for a queue. And remember the two-stack trick to build one from LIFO primitives.

---

## 9.2 Deque

### What is a Deque?

A **deque** (pronounced 'deck', short for double-ended queue) is a queue where you can add or remove items from BOTH the front and the back — all in O(1) time.

```
        remove front (popleft)          remove back (pop)
              ^                              ^
FRONT  |  1  |  2  |  3  |  4  |  BACK
              v                              v
        add front (appendleft)          add back (append)
```

It combines the best of a stack and a queue: four O(1) operations.

### Why We Need It: Sliding Window Maximum

A classic problem: given an array and a window size k, find the maximum of every window as it slides right.

Brute force checks every element in every window: O(n * k). For a big array that's too slow.

### The Monotonic Deque Trick

Keep a **deque of indices** whose values are strictly decreasing from front to back. The FRONT always holds the index of the current window's maximum.

For each new element (index i):

1. **Remove expired indices** — pop from the front while the index is outside the current window (i - k)
2. **Maintain decreasing order** — pop from the back while the value at that index is <= the new value (those smaller values can never be the max again while the new bigger value is around)
3. **Add the new index** at the back
4. **Record the answer** — once the window is full (i >= k - 1), the front of the deque is the window maximum

### Watch It In Action

Array [1, 3, -1, -3, 5], window k = 3:

```
i=0: deque [0] (1)          -> window not full
i=1: 3 > 1, pop 0 -> deque [1] (3)   -> not full
i=2: -1 < 3, keep -> deque [1,2] (3,-1) -> max = 3 ✓
i=3: -3 < -1, keep -> deque [1,2,3] (3,-1,-3) -> max = 3 ✓
i=4: 5 pops -3, -1, 3 -> deque [4] (5) -> max = 5 ✓

answers: [3, 3, 5]
```

Each index is added once and removed at most once — total work is O(n).

### When to Use a Deque

✅ Sliding window min/max problems
✅ Problems needing O(1) add/remove at BOTH ends
✅ Monotonic queue patterns (decreasing for max, increasing for min)

❌ When a plain FIFO queue suffices and you never touch the back

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force per window | O(n * k) | O(1) |
| Monotonic deque | O(n) | O(k) |

### Key Takeaway

A deque is a double-ended queue with O(1) operations on both ends. Keep a **monotonic deque** (decreasing for maxima) and each element is processed once — sliding window maximum drops from O(n*k) to O(n).

---

# 10. Problems

## 10.1 Implement Queue using Stacks

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Queue Basics |
| **Companies** | Amazon, Google, Microsoft, Meta, Apple |

### Problem Statement

Implement a FIFO queue using only two stacks. Support push(x), pop(), peek(), and empty(). You may only use standard stack operations (push to top, peek/pop from top, size, is empty), all O(1).

```
Input:  push(1), push(2), push(3), pop()
Output: 1   (the first element pushed)
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| push(1), push(2), push(3), pop() | 1 | First in, first out — pop returns 1 |
| push(1), push(2), peek(), pop(), empty() | 1, 1, false | peek sees front (1); pop removes it; queue still holds 2 |
| push(1), pop(), empty() | 1, true | After the only element is popped, the queue is empty |
| push(1), push(2), push(3), pop(), peek() | 1, 2 | pop removes 1; new front is 2 |

### Constraints

- At most 100 operations
- pop and peek only called on a non-empty queue
- All values are integers

### Approach

**The Two-Stack Idea**

A stack is LIFO; a queue is FIFO. Use one stack for entering ('in') and one for leaving ('out'), and FLIP the order when moving items between them:

- **push(x)**: always push onto 'in' (newest on top)
- **pop()/peek()**: if 'out' is empty, dump everything from 'in' into 'out' — reversing the order so the oldest element lands on top of 'out'. Then pop/peek the top of 'out'.

**Pseudocode:**

```
CLASS MyQueue:
    in  = empty stack   # for pushes
    out = empty stack   # for pops/peeks

    FUNCTION push(x):
        in.push(x)                      # newest goes on top of 'in'

    FUNCTION transferIfNeeded():
        IF out is empty:
            WHILE in is not empty:
                out.push(in.pop())      # flip: oldest ends up on top of 'out'

    FUNCTION pop():
        transferIfNeeded()
        RETURN out.pop()                 # remove the front

    FUNCTION peek():
        transferIfNeeded()
        RETURN out.top()                 # look at the front

    FUNCTION empty():
        RETURN in is empty AND out is empty
```

**Trace:**

```
push(1) -> in: [1]
push(2) -> in: [2, 1]   (2 on top)
push(3) -> in: [3, 2, 1]

pop(): out empty -> dump: in -> out flips to [1, 2, 3] (1 on top)
       pop -> 1 ✓
peek(): out has 2 on top -> 2 ✓   (no dump needed)
pop(): -> 2 ✓
empty(): out still has 3 -> false
```

**Complexity:** Time **O(1) amortised** — each element is pushed once and moved to 'out' at most once (a single pop can cost O(n), but averaged over n operations it's O(1)). Space **O(n)** — both stacks hold n elements.

### Code Solution

```python
class MyQueue:
    def __init__(self):
        self.in_stack = []   # newest elements on top
        self.out_stack = []  # oldest elements on top

    def push(self, x):
        self.in_stack.append(x)

    def _transfer(self):
        # Flip 'in' into 'out' so the oldest element is on top
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())

    def pop(self):
        self._transfer()
        return self.out_stack.pop()

    def peek(self):
        self._transfer()
        return self.out_stack[-1]

    def empty(self):
        return not self.in_stack and not self.out_stack
```

```javascript
var MyQueue = function () {
    this.inStack = [];   // newest elements on top
    this.outStack = [];  // oldest elements on top
};

MyQueue.prototype.push = function (x) {
    this.inStack.push(x);
};

MyQueue.prototype._transfer = function () {
    // Flip 'in' into 'out' so the oldest element is on top
    if (this.outStack.length === 0) {
        while (this.inStack.length > 0) {
            this.outStack.push(this.inStack.pop());
        }
    }
};

MyQueue.prototype.pop = function () {
    this._transfer();
    return this.outStack.pop();
};

MyQueue.prototype.peek = function () {
    this._transfer();
    return this.outStack[this.outStack.length - 1];
};

MyQueue.prototype.empty = function () {
    return this.inStack.length === 0 && this.outStack.length === 0;
};
```

---

## 10.2 Sliding Window Maximum

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Deque |
| **Companies** | Amazon, Google, Microsoft, Meta, Apple, Uber |

### Problem Statement

Given an array of integers and a window size k, the window slides one position to the right at a time, always covering exactly k elements. For every window position, find the maximum value inside it and return all maxima as an array.

```
Input:  nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
Output: [3, 3, 5, 5, 6, 7]

[1,3,-1] -> 3; [3,-1,-3] -> 3; [-1,-3,5] -> 5; [-3,5,3] -> 5; [5,3,6] -> 6; [3,6,7] -> 7
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| [1, 3, -1, -3, 5, 3, 6, 7], k=3 | [3, 3, 5, 5, 6, 7] | Each window's maximum |
| [1], k=1 | [1] | A single window of size 1 |
| [1, -1], k=1 | [1, -1] | Every window is one element |
| [9, 11], k=2 | [11] | One window [9, 11] -> max 11 |

### Constraints

- Array length: 1 to 100,000
- k between 1 and array length
- Each element between -10,000 and 10,000

### Approach

**The Monotonic Deque Idea**

Keep a **deque of indices** whose values stay strictly decreasing from front to back. The front is always the index of the current window's maximum.

For each index i (left to right):

1. **Remove expired indices** — while the front index is outside the window (front <= i - k), popleft it
2. **Keep the deque decreasing** — while the value at the back index is <= nums[i], pop it
3. **Add index i** at the back
4. **Record the answer** — once the window is full (i >= k - 1), the front is this window's maximum

**Pseudocode:**

```
FUNCTION maxSlidingWindow(nums, k):
    deque = empty deque of indices
    answer = empty list

    FOR i from 0 to length(nums) - 1:
        # 1. Drop indices outside the current window
        WHILE deque is not empty AND deque.front <= i - k:
            POP FRONT of deque

        # 2. Keep values decreasing: remove smaller/equal values from the back
        WHILE deque is not empty AND nums[deque.back] <= nums[i]:
            POP BACK of deque

        # 3. This index is now a candidate
        PUSH i onto BACK of deque

        # 4. Window full -> record its maximum
        IF i >= k - 1:
            answer.append(nums[deque.front])

    RETURN answer
```

**Trace on nums = [1, 3, -1, -3, 5], k = 3:**

```
i=0 (1): deque [0]                -> window not full
i=1 (3): 3 > 1, pop back 0 -> deque [1]      -> not full
i=2 (-1): -1 < 3, keep -> deque [1, 2]      -> max = nums[1] = 3 ✓
i=3 (-3): -3 < -1, keep -> deque [1, 2, 3]  -> max = 3 ✓
i=4 (5): 5 pops -3, -1, 3 -> deque [4]      -> max = 5 ✓

answer = [3, 3, 5]
```

**Why each element is processed once:** every index is added to the deque exactly once and removed at most once — that single fact makes the whole algorithm linear.

**Complexity:** Time **O(n)** — each index pushed once, popped at most once. Space **O(k)** — the deque holds at most k indices.

### Code Solution

```python
from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()   # stores indices, values strictly decreasing
    answer = []

    for i, val in enumerate(nums):
        # 1. Remove indices outside the current window
        while dq and dq[0] <= i - k:
            dq.popleft()

        # 2. Keep values decreasing: pop smaller/equal values from the back
        while dq and nums[dq[-1]] <= val:
            dq.pop()

        # 3. This index is now a candidate
        dq.append(i)

        # 4. Window full -> record its maximum
        if i >= k - 1:
            answer.append(nums[dq[0]])

    return answer
```

```javascript
function maxSlidingWindow(nums, k) {
    const dq = [];   // stores indices, values strictly decreasing
    let head = 0;    // logical front pointer (O(1) expiry instead of shift())
    const answer = [];

    for (let i = 0; i < nums.length; i++) {
        const val = nums[i];

        // 1. Remove indices outside the current window
        while (head < dq.length && dq[head] <= i - k) {
            head++;
        }

        // 2. Keep values decreasing: pop smaller/equal values from the back
        while (dq.length > head && nums[dq[dq.length - 1]] <= val) {
            dq.pop();
        }

        // 3. This index is now a candidate
        dq.push(i);

        // 4. Window full -> record its maximum
        if (i >= k - 1) {
            answer.push(nums[dq[head]]);
        }

        // Compact occasionally so the deque stays O(k) in memory
        if (head >= k) {
            dq.splice(0, head);
            head = 0;
        }
    }

    return answer;
}
```

---

*Happy coding! — TheWebytes DSA Team*
