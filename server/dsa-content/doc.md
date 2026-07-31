# DSA Learning Document — Stacks

> A comprehensive, student-friendly guide to Stacks — the Last-In-First-Out superpower behind undo buttons, browser back, and bracket matching.
> Master the core push/pop operations and the monotonic stack trick with two classics: Valid Parentheses and Next Greater Element.

---

# 8. Stacks

> **Lesson Overview:** A stack is a LIFO (Last-In-First-Out) collection with O(1) push/pop/peek. Learn when to reach for it — nesting, history, and undo — then supercharge it with the monotonic stack for O(n) solutions to Valid Parentheses (O(n)) and Next Greater Element (O(n)).
> - **Category:** Linked Lists, Stacks & Queues
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 8.1 Stack Basics

### What is a Stack?

A stack is a collection of items where you can only add or remove from the TOP. Imagine a stack of plates in a cafeteria: you take the plate on top first, and the plate you put down last is the one you pick up first. That's why a stack is called **Last-In-First-Out** (LIFO).

### The Three Core Operations

Every stack supports three fundamental operations:

1. **Push** — add an item on top
2. **Pop** — remove the top item (and return it)
3. **Peek / Top** — look at the top item without removing it

All three run in **O(1)** time — instant, no matter how many items are in the stack.

### Visualising the Stack

```
        push 3        push 7        pop  -> 7        pop  -> 3

   +---+          +---+          +---+           +---+
   |   |          | 7 |          |   |           |   |
   |   |          | 3 |          | 3 |           |   |
   |   |          |   |          |   |           |   |
   +---+          +---+          +---+           +---+
```

The most recently pushed item is always on top and is always the first one out.

### Real-World Uses of a Stack

✅ **Undo / Redo** — every action you do is pushed onto a stack; undo pops the latest action
✅ **Browser back button** — each page you visit is pushed; back pops the previous page
✅ **Function calls** — the call stack remembers where each function should return when it finishes
✅ **Bracket matching** — compilers and code editors use a stack to check that ( ) [ ] { } are balanced
✅ **Expression evaluation** — converting and evaluating expressions (e.g. infix to postfix)

### Array vs Stack

| Feature | Array | Stack |
|---|---|---|
| Access any position | Yes (random access) | No (only top) |
| Add/remove from end | O(1) append | O(1) push |
| Remove from start | O(n) shift | O(1) pop |
| Best for | Storing and searching data | Keeping a history of decisions |

### When to Use a Stack

✅ The problem needs to process items in reverse order of arrival (LIFO)
✅ Nested structures — brackets, parentheses, HTML tags, function calls
✅ You need to keep a 'history' of choices and roll back to the most recent one

❌ When you need random access to items in the middle
❌ When First-In-First-Out (FIFO) order is needed — that's a queue's job

### Complexity Summary

| Operation | Time |
|---|---|
| Push | O(1) |
| Pop | O(1) |
| Peek | O(1) |
| Search | O(n) |

### Key Takeaway

A stack is a **Last-In-First-Out** collection with O(1) push/pop/peek. Whenever a problem mentions brackets, undo, history, or nested structure — reach for a stack.

---

## 8.2 Monotonic Stack

### The Problem With Brute Force

Many problems ask: for each element, find the NEXT element to its right that is bigger (or smaller) than it.

The naive way: for every element, scan everything to its right until you find a bigger one. That's two nested loops — **O(n^2)** — too slow for big inputs.

### The Idea: A Sorted Stack

A **monotonic stack** is a stack that always stays sorted — every new element you push makes the stack either strictly increasing or strictly decreasing.

How? Before pushing a new element, you **pop everything that violates the order**. This is the whole trick!

### How to Build a Decreasing Monotonic Stack

Imagine you want to keep the stack strictly decreasing from bottom to top (bigger at bottom, smaller at top):

```
To push value X:
  WHILE stack is not empty AND top of stack <= X:
      POP the top                     # smaller/equal elements can't stay
  PUSH X                              # now the order is restored
```

Watch it in action on [4, 2, 5]:

```
Push 4 -> stack: [4]
Push 2 -> 2 < 4, so just push -> stack: [4, 2]
Push 5 -> 5 >= 2, pop 2; 5 >= 4, pop 4 -> stack: [] -> push 5 -> stack: [5]
```

The stack stays strictly decreasing from bottom to top. Each element is pushed once and popped at most once — that's why the total work is **O(n)**, not O(n^2)!

### Why This Helps 'Next Greater Element'

While keeping the stack decreasing, the elements still sitting in the stack are exactly the ones **waiting for a greater element** to their right. The moment you push a bigger element X:

- Every element X pops (i.e. is smaller than X) has found its **next greater element = X**

So the popping step itself answers the question for those elements — for free!

### When to Use a Monotonic Stack

✅ 'Find the next greater / next smaller element' problems
✅ Daily temperatures, stock span, largest rectangle in histogram
✅ Problems where each element cares about the nearest element that is bigger/smaller

❌ When the order of answers doesn't depend on the nearest bigger/smaller neighbour

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force (nested loops) | O(n^2) | O(1) |
| Monotonic stack | O(n) | O(n) |

### Key Takeaway

A monotonic stack keeps itself sorted by popping violators before pushing. Because each element enters and leaves the stack once, it solves 'next greater/smaller element' problems in **O(n)** time instead of O(n^2).

---

# 9. Problems

## 9.1 Valid Parentheses

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Stack Basics |
| **Companies** | Amazon, Google, Microsoft, Meta, Apple, Adobe |

### Problem Statement

Given a string s containing only '(', ')', '{', '}', '[' and ']', determine if it is valid. A string is valid if open brackets are closed by the same type, in the correct order, and every close bracket has a matching open bracket.

```
Input:  s = "()[]{}"
Output: true

Input:  s = "([)]"
Output: false   (brackets not closed in the correct order)
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| "()" | true | '(' closes with ')' of the same type |
| "()[]{}" | true | Three independent pairs, each closed correctly |
| "(]" | false | '(' must close with ')' — wrong type |
| "([)]" | false | ')' closes the wrong bracket — out of order |

### Constraints

- String length: 1 to 10,000
- Only the characters '(', ')', '{', '}', '[' and ']'

### Approach

**The Stack Idea**

Walk through the string one character at a time:

- Opening bracket → **push** onto the stack
- Closing bracket → the **top** of the stack must be its matching opener; if it matches, **pop**; otherwise invalid

At the end, the string is valid only if the stack is empty.

**Pseudocode:**

```
FUNCTION isValid(s):
    stack = empty stack
    mapping = { ')': '(', ']': '[', '}': '{' }

    FOR each character c in s:
        IF c is an opening bracket (c is in '(' '[' '{'):
            PUSH c onto stack
        ELSE:
            IF stack is empty:
                RETURN false          # no opener to match
            IF top of stack != mapping[c]:
                RETURN false          # wrong type of opener
            POP the stack

    RETURN true IF stack is empty ELSE false
```

**Trace on s = "([)]":**

```
'(' -> push -> stack: ['(']
'[' -> push -> stack: ['(', '[']
')' -> top is '[' but expected '(' -> MISMATCH -> RETURN false
```

**Why a stack works:** the most recent opener is on top, so any closer must match it — out-of-order closings are caught instantly.

**Complexity:** Time **O(n)** — each character visited once. Space **O(n)** — the stack holds up to n openers.

### Code Solution

```python
def isValid(s):
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}

    for c in s:
        # Opening bracket: push it
        if c in '([{':
            stack.append(c)
        else:
            # Closing bracket: top must match its opener
            if not stack or stack[-1] != mapping[c]:
                return False
            stack.pop()

    # Valid only if every opener was closed
    return len(stack) == 0
```

```javascript
function isValid(s) {
    const stack = [];
    const mapping = {')': '(', ']': '[', '}': '{'};

    for (const c of s) {
        // Opening bracket: push it
        if (c === '(' || c === '[' || c === '{') {
            stack.push(c);
        } else {
            // Closing bracket: top must match its opener
            if (stack.length === 0 || stack[stack.length - 1] !== mapping[c]) {
                return false;
            }
            stack.pop();
        }
    }

    // Valid only if every opener was closed
    return stack.length === 0;
}
```

---

## 9.2 Next Greater Element

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Monotonic Stack |
| **Companies** | Amazon, Google, Microsoft, Meta, Nvidia |

### Problem Statement

Given an array of integers, for each element find the NEXT GREATER element — the first element to its RIGHT that is strictly greater. If none exists, use -1.

```
Input:  nums = [4, 1, 2, 3]
Output: [-1, 2, 3, -1]

4 -> nothing bigger on the right -> -1
1 -> next bigger is 2
2 -> next bigger is 3
3 -> nothing to its right -> -1
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| [4, 1, 2, 3] | [-1, 2, 3, -1] | 4 none; 1→2; 2→3; 3 none |
| [2, 4] | [4, -1] | 2→4; 4 is last |
| [1, 3, 2, 4] | [3, 4, 4, -1] | 1→3; 3→4; 2→4; 4 last |
| [5, 4, 3, 2, 1] | [-1, -1, -1, -1, -1] | Decreasing — nothing bigger to the right |

### Constraints

- Array length: 1 to 10,000
- Each element between -10,000 and 10,000

### Approach

**The Key Insight**

Keep a **decreasing monotonic stack**. When we meet a new element, pop everything from the stack that is smaller or equal — those popped elements have found their answer. Scanning **right to left**, whatever remains on top after popping is exactly the current element's next greater element.

**Pseudocode:**

```
FUNCTION nextGreaterElements(nums):
    n = length of nums
    answer = array of size n filled with -1
    stack = empty stack

    FOR i from n-1 down to 0:            # scan right to left
        WHILE stack is not empty AND stack.top <= nums[i]:
            POP                                # smaller/equal elements are useless
        IF stack is not empty:
            answer[i] = stack.top              # nearest greater element to the right
        PUSH nums[i] onto stack                # nums[i] now waits for ITS greater element

    RETURN answer
```

**Trace on nums = [4, 1, 2, 3]:**

```
i=3, val=3 -> stack empty -> ans[3] = -1; push 3 -> stack: [3]
i=2, val=2 -> 3 > 2 -> ans[2] = 3;   push 2 -> stack: [3, 2]
i=1, val=1 -> 2 > 1 -> ans[1] = 2;   push 1 -> stack: [3, 2, 1]
i=0, val=4 -> pop 1, pop 2, pop 3 (all <= 4) -> stack empty -> ans[0] = -1; push 4

answer = [-1, 2, 3, -1]  ✓
```

**Why each element is processed once:** every element is pushed exactly once and popped at most once — that single fact guarantees linear time.

**Complexity:** Time **O(n)** — each element pushed once, popped at most once. Space **O(n)** — the stack.

### Code Solution

```python
def nextGreaterElements(nums):
    n = len(nums)
    answer = [-1] * n
    stack = []

    # Scan right to left, keeping a decreasing stack
    for i in range(n - 1, -1, -1):
        # Pop everything smaller or equal — it can't be the answer
        while stack and stack[-1] <= nums[i]:
            stack.pop()
        # Whatever remains on top is the next greater element
        if stack:
            answer[i] = stack[-1]
        # nums[i] now waits for its own greater element
        stack.append(nums[i])

    return answer
```

```javascript
function nextGreaterElements(nums) {
    const n = nums.length;
    const answer = new Array(n).fill(-1);
    const stack = [];

    // Scan right to left, keeping a decreasing stack
    for (let i = n - 1; i >= 0; i--) {
        // Pop everything smaller or equal — it can't be the answer
        while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {
            stack.pop();
        }
        // Whatever remains on top is the next greater element
        if (stack.length > 0) {
            answer[i] = stack[stack.length - 1];
        }
        // nums[i] now waits for its own greater element
        stack.push(nums[i]);
    }

    return answer;
}
```

---

*Happy coding! — TheWebytes DSA Team*
