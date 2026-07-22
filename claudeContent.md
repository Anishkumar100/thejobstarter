# Content Seed Data — DSA, DBMS, OS, Programming (Beginner-Friendly, Language-Agnostic)

> Seed data for the plan builder hierarchy.
> Structure: **Lesson → Subtopics → Problems**, with **Quizzes nested inside
> each Problem** and written to test that specific problem's logic, approach,
> and edge cases — not generic lesson trivia. Every lesson, subtopic, and
> problem carries a short one-line **Description** at the top for use as
> card/preview text. All logic is explained in plain English so it works no
> matter what programming language a student is learning.

---

## DSA (Data Structures & Algorithms)

### What is DSA?
Data Structures & Algorithms is the backbone of computer science. A **data
structure** is a way of organising data — like a cupboard organises your
clothes so you can find them quickly. An **algorithm** is a step-by-step
method for solving a problem — like a recipe for cooking a meal. Companies
test DSA in interviews because it shows whether you can think logically and
solve problems efficiently, not just whether you know a particular language.

---

### 1. Big O Notation
- **Slug:** `big-o-notations`
- **Category:** data-structures | **Order:** 1 | **Difficulty:** easy
- **Icon:** TrendingUp
- **Description:** The language used to describe how an algorithm's speed or memory use grows as its input gets bigger.

**What is it?**
Big O Notation is the language we use to describe how fast an algorithm runs,
or how much memory it needs, **as the input grows**. It doesn't matter which
language you use or how fast your computer is — Big O only cares about one
question: if the input gets 10 times bigger, does the work take 10 times
longer, 100 times longer, or barely any longer at all?

**Why it matters:**
Code that works fine with 10 items can completely freeze with 10 million
items if its Big O is bad. Interviewers care about Big O because it predicts
whether your solution will survive contact with real-world data.

**Key growth rates, from best to worst:**
- **O(1) — Constant:** Same amount of work no matter the input size.
- **O(log n) — Logarithmic:** Doubling the input only adds one extra step.
- **O(n) — Linear:** Double the input, double the work.
- **O(n log n) — Linearithmic:** Slightly worse than linear; the best sorting algorithms land here.
- **O(n²) — Quadratic:** Double the input, four times the work.
- **O(2^n) — Exponential:** Adding just one more item can double the total work. Avoid this whenever possible.

**Everyday analogy:**
- O(1) = grabbing a book because you already know exactly which shelf and slot it's on.
- O(n) = checking every book on a shelf one at a time.
- O(n²) = comparing every book against every other book to find duplicates.
- O(log n) = opening a phone book in the middle, deciding which half your name is in, and repeating.

---

#### Subtopics

##### 1. Time Complexity Analysis (`time-complexity`)
**Description:** How to count the number of steps an algorithm takes so you can predict how it behaves on large inputs.

**What it teaches:**
Time complexity answers: *"How many operations does this algorithm perform
as the input grows?"* We count meaningful steps (comparisons, additions,
lookups) — not actual seconds, since seconds depend on the machine.

**How to analyse any algorithm — a general method:**
1. Identify the input size, usually called `n`.
2. Look for loops. A single loop that runs once per item is O(n). A loop
   inside another loop is O(n²).
3. Look for repeated (recursive) calls that split the problem — these often
   lead to O(log n) or O(n log n).
4. Drop constant multipliers. Doing something twice per item is still O(n),
   not "O(2n)" — constants don't change the growth pattern.
5. Keep only the largest-growing term. If a process involves both an O(n)
   step and an O(n²) step, the overall complexity is O(n²), because it
   dominates as n grows.

**Worked example — adding up all the numbers in a list:**
Imagine you walk through a list once, keeping a running total, and adding
each number to that total as you go. You do a fixed amount of setup work
(start the total at zero), then one addition per item, then a fixed amount
of work to return the answer. Since the middle part depends directly on how
many items there are, and everything else is constant, this process is O(n)
— linear time.

**Common beginner mistakes:**
- Thinking that doing a task "twice as often" changes the Big O category — it doesn't; only the *shape* of growth matters, not the constant factor.
- Forgetting that a loop placed inside another loop multiplies the work, it doesn't just add to it.
- Mixing up *worst-case* (the guarantee Big O usually describes), *best-case*, and *average-case* behaviour.

---

##### 2. Space Complexity (`space-complexity`)
**Description:** How to measure the extra memory an algorithm needs, beyond the input it was given.

**What it teaches:**
Space complexity answers: *"How much extra memory does this algorithm need,
beyond the input itself?"*

**Key ideas:**
- **Auxiliary space** — the extra memory you allocate yourself, separate from the input.
- **Total space** — the input's memory plus the auxiliary space.
- **Recursive space** — every time a task calls itself, it uses a bit of extra memory to "remember where it was," and this adds up with depth.

**Worked example:**
If a process makes a brand-new copy of a list so it has the same number of
items as the original, that copy needs memory proportional to the size of
the input — so it uses O(n) extra space, even though it doesn't take extra
*time* beyond what's needed to fill it in.

**Space-time trade-off:**
Sometimes you can make something faster by using more memory, or use less
memory at the cost of speed. A classic example: keeping a lookup table of
values you've already seen costs some memory, but lets you answer "have I
seen this before?" instantly instead of searching through everything again.

**Analogy:**
Time complexity = how many minutes a chef spends cooking.
Space complexity = how much counter space the chef needs while cooking.

---

#### Problems

##### 1. Find the Missing Number (`missing-number`) [easy]
- **Topics:** Arrays, Math
- **Companies:** Microsoft, Amazon
- **Description:** Find the one missing number from a nearly-complete sequence of 1 to n, using only arithmetic.

**The problem:**
You're given a list containing `n - 1` distinct numbers, all taken from the
range 1 to `n`. One number from that range is missing. Find it, ideally
without using any extra memory and by scanning the list only once.

**Example walkthrough:**
List: `3, 7, 1, 2, 8, 4, 5` — these numbers should include everything from
1 to 8, but one is missing.
- Sum of 1 through 8, if nothing were missing, would be 36.
- Sum of the numbers actually in the list: 3+7+1+2+8+4+5 = 30.
- Missing number = 36 − 30 = **6**.

**Step-by-step approach:**
1. Work out how many numbers there *should* be: since one is missing, that count is `(items in the list) + 1`. Call this `n`.
2. Calculate what the sum of every number from 1 to `n` *should* be, using the shortcut formula `n × (n + 1) ÷ 2` (a trick a young Gauss famously discovered — you don't need to add 1+2+3+...+n one by one).
3. Add up all the numbers that are actually present in the list.
4. Subtract the actual sum from the expected sum. Whatever is left over is the missing number.

**Why this works:**
The formula gives you the "should be" total for a complete, unbroken
sequence. Since your list is that same sequence with exactly one number
taken out, the gap between the expected total and the real total has to be
exactly that missing number.

**Time:** O(n) — one pass to add up the numbers.
**Space:** O(1) — only two running totals are needed, regardless of list size.

**Edge cases to think about:**
- Only one number in the list, and it's 1 → missing number is 2.
- Only one number in the list, and it's 2 → missing number is 1.
- Very large lists — the arithmetic-shortcut formula handles this instantly, without needing to loop to compute the expected sum.

**Quizzes**

1. **Time Complexity** [easy]
   *What is the time complexity of the sum-based approach to finding the missing number?*
   → Options: O(1), O(log n), **O(n)**, O(n²)
   *Explanation: The approach makes exactly one pass through the list to total the actual values, so it grows linearly with the list size.*

2. **Applying the Approach** [medium]
   *List: `1, 2, 4, 5` (n = 5, one number missing from 1–5). Using the expected-sum-minus-actual-sum method, what is the missing number?*
   → Options: 2, **3**, 4, 5
   *Explanation: Expected sum of 1–5 is 5×6÷2 = 15. Actual sum is 1+2+4+5 = 12. 15 − 12 = 3.*

---

### 2. Arrays
- **Slug:** `arrays`
- **Category:** data-structures | **Order:** 2 | **Difficulty:** easy
- **Icon:** List
- **Description:** The most basic data structure — a numbered row of values that lets you jump straight to any position instantly.

**What is it?**
An array (also called a list) is the most basic data structure — a row of
values sitting one after another, each with a position number called an
**index**. Think of it as a row of numbered lockers: if you know a locker's
number, you can open it instantly.

**Why it matters:**
Arrays are everywhere. Text is a sequence of characters. Images are grids of
colour values. Arrays are the simplest, most efficient way to store data
that has an order, and most interview problems build on top of them.

**Key properties:**
- **Reading by position:** Jumping straight to position 5 takes the same amount of time no matter how big the array is — O(1).
- **Adding/removing at the front:** Everything after that spot has to shift over, so this takes O(n).
- **Adding/removing at the end:** Usually quick, close to O(1), since nothing else needs to move.
- **Searching for a value:** O(n) if the array isn't sorted; O(log n) if it is sorted and you use a smarter search.

**Analogy:**
An array is like a row of numbered cinema seats. You know exactly where
seat 7 is. But if someone new needs to sit in seat 5, everyone after them
has to shift down by one.

---

#### Subtopics

##### 1. Two Pointer Technique (`two-pointer-technique`)
**Description:** Use two moving markers instead of nested loops to scan an array in a single pass.

**What it teaches:**
Instead of checking every possible pair of elements with two nested loops
(which is slow), you keep track of two positions ("pointers") in the array
and move them toward each other or alongside each other based on simple
rules. This often turns an O(n²) approach into an O(n) one.

**Common patterns:**
- **Opposite ends closing in:** One marker starts at the beginning, one at the end, and they move toward each other. Great for checking palindromes or finding pairs that add up to a target in a sorted list.
- **Slow and fast, same direction:** One marker moves one step at a time, the other moves two steps at a time. Useful for finding the middle of a sequence or detecting loops.
- **A growing/shrinking window:** Both markers start together and the gap between them expands or contracts depending on a condition — this is the basis of the sliding window technique below.

**Worked example — finding two numbers in a sorted list that add up to a target:**
1. Place one marker at the very start of the list and another at the very end.
2. Add the two values the markers are pointing at.
3. If the sum matches the target, you're done — return those two positions.
4. If the sum is too small, move the left marker one step to the right (to get a bigger value).
5. If the sum is too large, move the right marker one step to the left (to get a smaller value).
6. Repeat until the markers meet or the answer is found.

Without this technique, you'd have to compare every pair — that's O(n²).
With two markers closing in on a sorted list, it only takes O(n).

---

##### 2. Sliding Window (`sliding-window`)
**Description:** Maintain a moving "view" over a continuous stretch of the array instead of recalculating everything from scratch.

**What it teaches:**
A sliding window is a "view" over a continuous stretch of the array that you
move along one step at a time, updating your answer as you go, instead of
recalculating everything from scratch each time.

**When to use it:**
Whenever a problem asks about a continuous chunk of the array or string —
things like "the biggest sum in any stretch of 5 numbers" or "the shortest
stretch that satisfies some condition."

**How it works, step by step:**
1. **Expand** the right edge of the window to include a new element.
2. **Check** whether the window still satisfies whatever condition the problem asks for.
3. **Shrink** the left edge of the window if the condition is broken, removing elements until it's valid again.
4. **Update** your best answer so far each time the window is valid.
5. Repeat until the right edge has covered the whole array.

**Worked example — largest sum of any stretch of k consecutive numbers:**
1. Add up the first k numbers — this is your starting window sum, and also your current best answer.
2. Move the window one step forward: add the new number entering on the right, and subtract the number leaving on the left.
3. Compare this new window sum to your best answer so far, and keep whichever is bigger.
4. Repeat step 2–3 until the window has slid all the way to the end of the array.

This takes O(n) time total, compared to recalculating each window's sum from
scratch, which would take much longer.

**Analogy:**
Think of looking through a train window as the train moves — you always see
a fixed-size view. As the train moves forward, one thing leaves your view on
the left, and one new thing enters on the right.

---

#### Problems

##### 1. Two Sum (`two-sum`) [easy]
- **Topics:** Arrays, Hashing, Two Pointers
- **Companies:** Amazon, Google, Meta, Microsoft
- **Description:** Find the two numbers in a list that add up to a target value, using a "memory" of numbers already seen.

**The problem:**
Given a list of numbers and a target number, find two numbers in the list
that add up to the target, and report their positions. There's guaranteed
to be exactly one valid answer.

**Example walkthrough:**
List: `2, 7, 11, 15`, target = `9`
- Look at position 0, value 2. What number would we need to pair with it? `9 − 2 = 7`. Have we seen a 7 yet? No. Remember that we've seen "2" at position 0.
- Look at position 1, value 7. What number would we need? `9 − 7 = 2`. Have we seen a 2 yet? Yes — at position 0! That's our answer: positions **0 and 1**.

**Step-by-step approach:**
1. Keep a running "memory" of every number you've already looked at, along with its position.
2. Go through the list one number at a time.
3. For the current number, work out what value would be needed to reach the target (target minus current number).
4. Check your memory: have you already seen that needed value?
   - If yes, you've found your pair — report the earlier position and the current position.
   - If no, add the current number and its position to your memory, and move to the next number.

**Why keep a memory of past numbers?**
Without it, for every number you'd have to search through the *entire rest*
of the list to see if its partner exists — that's O(n²). Keeping a quick
lookup memory means each check only takes constant time, bringing the whole
thing down to O(n).

**Time:** O(n) — a single pass through the list.
**Space:** O(n) — in the worst case you remember almost every number before finding the match.

**What if the list is already sorted?**
Then the two-pointer technique above would work instead, using less extra
memory — but only if you don't need to report the *original* positions,
since sorting the list changes where each number sits.

**Edge cases:**
- Negative numbers work fine — the arithmetic doesn't care about sign.
- If the same number appears more than once, the first time you see it stays in memory, which is fine because you stop as soon as you find a match.

**Quizzes**

1. **Why the Memory Matters** [easy]
   *Why does keeping a "memory" of seen numbers speed up Two Sum compared to checking every pair?*
   → Options: It sorts the list first, **It turns each partner-check into a constant-time lookup instead of a rescan**, It removes duplicate numbers, It reduces the target value
   *Explanation: Without memory, each number requires scanning the rest of the list (O(n²) total). With memory, each check is instant, bringing the total down to O(n).*

2. **Space Trade-off** [medium]
   *What's the worst-case space complexity of the memory-based Two Sum approach, and when does the two-pointer alternative become viable instead?*
   → Options: O(1); always, **O(n); only when the list is already sorted and original positions aren't needed**, O(n²); never, O(log n); when the list has duplicates
   *Explanation: The memory can hold up to almost every number before a match is found (O(n)). Two pointers avoid this extra memory but require a sorted list and don't preserve original indices after sorting.*

---

### 3. Linked Lists
- **Slug:** `linked-lists`
- **Category:** data-structures | **Order:** 3 | **Difficulty:** easy
- **Icon:** Link2
- **Description:** A chain of nodes, each pointing to the next, that lets you insert at the front instantly but access by position slowly.

**What is it?**
A linked list is a chain of items called **nodes**, where each node holds a
value and a "pointer" telling you where the next node lives. Unlike arrays,
the nodes aren't necessarily stored next to each other in memory — think of
it like a treasure hunt where each clue tells you where to find the next
one.

**Why it matters:**
Linked lists teach the idea of connecting pieces of data through references
rather than fixed positions. This same idea underlies trees, graphs, and
many real systems, and it comes up often in interviews for problems about
reversing, detecting loops, or rearranging data in place.

**Types:**
- **Singly linked list:** Each node points only forward to the next one.
- **Doubly linked list:** Each node points both forward and backward.
- **Circular linked list:** The last node points back to the very first one, forming a loop.

**Key trade-off versus arrays:**
- Arrays: instant access by position, but slow insertion at the front.
- Linked lists: slow access by position (you must walk from the start), but instant insertion at the front.

**Analogy:**
A linked list is like a conga line — each person holds the shoulders of the
person in front of them. To find the 5th person, you must count from the
front. But if a new person joins at the very front, they just grab the
current first person's shoulders — nobody else needs to move.

---

#### Subtopics

##### 1. Singly Linked List Operations (`singly-linked-list`)
**Description:** The basic building and moving operations for a chain of nodes, each pointing only forward.

**What it teaches:**
How to build and work with a chain of nodes, where every node stores a
value and a reference to the next node.

**Key operations and their cost:**
- **Insert at the front:** Create a new node, point it at the current first node, and make the new node the new front. Instant — O(1).
- **Insert at the end:** Walk the entire chain to find the last node, then attach the new node there. O(n).
- **Delete a node:** Walk the chain to find the node just before the one you want to remove, then have it "skip over" the target node. Finding it takes O(n), but the actual removal is O(1) once found.
- **Search for a value:** Walk from the front, checking each node in turn, until you find it or reach the end. O(n).

**Inserting at the front, step by step:**
1. Create a brand-new node holding the value you want to add.
2. Point this new node at whatever the current first node is.
3. Mark the new node as the new "front" of the list.

**Walking through a list, step by step:**
1. Start at the front node.
2. Do whatever you need with the current node's value.
3. Move to the node it points to.
4. Repeat until you reach a node that points to nothing — that's the end.

---

##### 2. Fast & Slow Pointers (`fast-slow-pointers`)
**Description:** Move two markers through a list at different speeds to find the middle or detect loops in a single pass.

**What it teaches:**
A technique using two markers that move through the list at different
speeds — the slow one moves one step at a time, the fast one moves two
steps at a time. Simple, but surprisingly powerful.

**Why it works:**
Picture two runners starting at the same point on a track, one running
twice as fast as the other. By the time the fast runner finishes a lap, the
slow runner is exactly halfway. This creates a predictable relationship
between their positions that we can use to solve problems.

**What this enables:**
1. **Finding the middle:** By the time the fast marker reaches the end, the slow marker is sitting right at the middle.
2. **Detecting a loop:** If there's a cycle somewhere in the chain, the fast and slow markers will eventually land on the same node at the same time.
3. **Finding the item a fixed distance from the end:** Move the fast marker ahead by that many steps first, then move both markers together — when the fast one reaches the end, the slow one is at the target.

**Detecting a cycle, step by step:**
1. Place both a slow marker and a fast marker at the front of the list.
2. Move the slow marker forward by one node, and the fast marker forward by two nodes.
3. If at any point the two markers land on the exact same node, there's a loop.
4. If the fast marker reaches the very end (nowhere left to go), there's no loop.

---

#### Problems

##### 1. Middle of the Linked List (`middle-of-linked-list`) [easy]
- **Topics:** Linked Lists, Two Pointers
- **Companies:** Amazon, Apple, Adobe
- **Description:** Find the middle node of a linked list in a single pass, using a slow and a fast marker.

**The problem:**
Given the front of a singly linked list, find and return the node in the
middle. If there are two middle nodes (an even number of items), return the
second one.

**Example walkthrough (odd length):**
Chain: 1 → 2 → 3 → 4 → 5
- Start: slow = 1, fast = 1
- Step 1: slow = 2, fast = 3
- Step 2: slow = 3, fast = 5
- Step 3: fast has nowhere left to go — stop. Answer: **3**.

**Example walkthrough (even length):**
Chain: 1 → 2 → 3 → 4 → 5 → 6
- Step 1: slow = 2, fast = 3
- Step 2: slow = 3, fast = 5
- Step 3: slow = 4, fast has nowhere left to go — stop. Answer: **4** (the second middle).

**Step-by-step approach:**
1. Place both a slow marker and a fast marker at the front of the list.
2. Move the slow marker forward one node at a time, and the fast marker forward two nodes at a time.
3. Keep going until the fast marker either reaches the last node or runs out of nodes to move to.
4. Whatever node the slow marker is sitting on at that point is the middle.

**Why this is elegant:**
Without this trick, you'd need one full pass just to count how many items
are in the list, then a second pass to walk halfway. The fast-slow approach
finds the middle in a single pass.

**Time:** O(n) — one pass through the list.
**Space:** O(1) — only two markers are used, regardless of list length.

**Quizzes**

1. **Even-Length Behaviour** [easy]
   *For the chain 1 → 2 → 3 → 4 → 5 → 6, which node does the fast-slow approach return as "the middle"?*
   → Options: 3, **4**, 5, 6
   *Explanation: With an even number of nodes, the slow marker lands on the second of the two middle nodes once the fast marker runs out of room — that's node 4 here.*

2. **Why Not Count First** [medium]
   *Why is the fast-slow pointer approach considered better than counting the list length first and then walking halfway?*
   → Options: It uses less space than counting, **It finds the middle in a single pass instead of requiring two full passes**, It works on unsorted lists only, It avoids using any pointers at all
   *Explanation: Counting the length is one full pass, and walking halfway is a second pass. Fast-slow pointers solve it in just one pass through the list.*

---

### 4. Stacks & Queues
- **Slug:** `stacks-queues`
- **Category:** data-structures | **Order:** 4 | **Difficulty:** medium
- **Icon:** Layers
- **Description:** Two restricted-access structures — Last In First Out and First In First Out — built for very specific access patterns.

**What is it?**
Stacks and queues are structures where you can only add or remove items from
specific ends — and that restriction is exactly what makes them useful.

**Stack (Last In, First Out — LIFO):**
Like a stack of plates: you can only take the top plate off, and any new
plate goes on top. The last one placed is the first one removed.

**Queue (First In, First Out — FIFO):**
Like a line at a ticket counter: the first person to join the line is the
first person served, and new people join at the back.

---

#### Subtopics

##### 1. Stack Operations & Applications (`stack-applications`)
**Description:** The push/pop/peek operations behind undo buttons, browser history, and function calls.

**What it teaches:**
A stack supports three core operations, all instant (O(1)):
- **Push** — add an item to the top.
- **Pop** — remove and return the item currently on top.
- **Peek** — look at the top item without removing it.

**Real-world applications:**
- **Undo/Redo:** Every action gets pushed onto a stack. Undo pops the most recent action off.
- **Browser back button:** Each page you visit gets pushed; clicking back pops the current page and returns to the one below it.
- **Evaluating expressions:** Stacks help process nested expressions like parentheses.
- **Program execution:** Every time a function calls another function, that call gets "pushed"; when it finishes, it's "popped" — this is literally called the call stack.

**Checking that brackets are balanced — a classic stack problem, step by step:**
1. Go through the text one character at a time.
2. Every time you see an *opening* bracket, push it onto the stack.
3. Every time you see a *closing* bracket:
   - If the stack is empty, something's wrong — there's no opening bracket left to match, so it's unbalanced.
   - Otherwise, pop the top item off the stack and check that it's the matching opening bracket. If it doesn't match, it's unbalanced.
4. After processing everything, if the stack is empty, all brackets matched up correctly. If anything is left over, some opening bracket was never closed.

---

##### 2. Queue Operations & Types (`queue-types`)
**Description:** The enqueue/dequeue operations behind print queues, task scheduling, and level-by-level exploration.

**What it teaches:**
A queue supports two core operations, both instant (O(1)):
- **Enqueue** — add an item to the back.
- **Dequeue** — remove and return the item at the front.

**Queue variations:**
- **Circular Queue:** Uses a fixed amount of space with wrap-around, so the "front" and "back" positions loop back to the start when they reach the end — more memory-efficient than constantly growing.
- **Priority Queue:** Items are removed based on priority, not just arrival order — the highest-priority item leaves first, no matter when it joined.
- **Deque (double-ended queue):** You can add or remove from *both* ends, combining features of a stack and a queue.

**Real-world applications:**
- **Print spooler:** Documents wait in a queue and print in the order they were sent.
- **Exploring level by level:** Breadth-first exploration of a tree or network uses a queue to visit things "layer by layer."
- **Task scheduling:** An operating system uses queues to decide which waiting task gets the CPU next.
- **Messaging systems:** Messages wait in a queue until a receiver is ready to process them.

---

#### Problems

##### 1. Valid Parentheses (`valid-parentheses`) [easy]
- **Topics:** Stacks, Strings
- **Companies:** Google, Meta, Amazon, Microsoft
- **Description:** Check whether every bracket in a string is properly opened and closed in the right order, using a stack.

**The problem:**
Given a string made up only of the bracket characters `(`, `)`, `{`, `}`,
`[`, `]`, determine whether it's valid — every opening bracket must have a
matching closing bracket, in the correct order.

**Example walkthrough — valid case:** `()[]{}`
- `(` → push. Stack holds: `(`
- `)` → pop, it matches `(`. Stack is empty.
- `[` → push. Stack holds: `[`
- `]` → pop, it matches `[`. Stack is empty.
- `{` → push. Stack holds: `{`
- `}` → pop, it matches `{`. Stack is empty.
- End of string, stack empty → **valid**.

**Example walkthrough — invalid case:** `(]`
- `(` → push. Stack holds: `(`
- `]` → pop, we get `(`, but we needed `[` to match `]` → **invalid**.

**Step-by-step approach:**
1. Go through the string one character at a time.
2. If the character is an opening bracket, push it onto a stack.
3. If the character is a closing bracket:
   - If the stack is empty, it's invalid — there's nothing to match against.
   - Otherwise, pop the top of the stack and check it's the correct opening bracket for this closing one. If not, it's invalid.
4. After the whole string is processed, check the stack: if it's empty, the string is valid; if anything is left, some opening brackets were never closed, so it's invalid.

**Time:** O(n) — one pass through the string.
**Space:** O(n) — in the worst case (all opening brackets), the stack holds every character.

**Edge cases:**
- An empty string is considered valid.
- A single bracket character alone is always invalid.
- `(((` is invalid — the stack isn't empty at the end.
- `([)]` is invalid — even though every bracket type has a match, the *order* is wrong (brackets must close inside-out, not crisscross).

**Quizzes**

1. **Crisscrossed Brackets** [medium]
   *Why is `([)]` invalid even though it contains one of each bracket type in matching pairs?*
   → Options: It has too many characters, **The closing brackets don't appear in the correct nested order — `]` closes before its matching `[`**, The stack is never used, `(` and `[` are incompatible characters
   *Explanation: When `)` appears, the top of the stack is `[`, not `(`, so it fails the match check — brackets must close in strict inside-out order.*

2. **End-of-String Check** [easy]
   *After scanning the entire string, why must the algorithm check whether the stack is empty?*
   → Options: To count total brackets, **Because a non-empty stack means some opening bracket was never matched with a closing one**, To reverse the string, To free up memory
   *Explanation: Any opening bracket left on the stack after the scan has no closing partner, which makes the string invalid regardless of what was matched earlier.*

---

### 5. Trees
- **Slug:** `trees`
- **Category:** data-structures | **Order:** 5 | **Difficulty:** medium
- **Icon:** GitBranch
- **Description:** A hierarchical structure — like a family tree or file system — built from a root and branching child nodes.

**What is it?**
A tree is a **hierarchical** structure with one **root** at the top, and
**child** nodes branching out below it. Unlike arrays or linked lists (which
are straight lines), trees represent hierarchies — think of a family tree, a
company's org chart, or the folders on your computer.

**Why it matters:**
Trees show up constantly in computing: web pages are structured as a tree,
your file system is a tree, and databases often use tree-like structures to
find data quickly. A well-organised tree (called a Binary Search Tree) lets
you search, insert, and delete in O(log n) time.

**Key terms:**
- **Root:** The top node, with no parent.
- **Leaf:** A node with no children.
- **Parent/Child:** A direct connection between two nodes.
- **Height:** The number of steps from the root down to the deepest leaf.
- **Depth:** The number of steps from the root down to a specific node.

---

#### Subtopics

##### 1. Binary Tree Traversals (`binary-tree-traversals`)
**Description:** The standard orders — pre-order, in-order, post-order, and level order — for visiting every node in a tree.

**What it teaches:**
"Traversing" means visiting every node in a specific order. For binary
trees (where each node has at most two children — usually called "left" and
"right"), there are three classic depth-first orders, plus one
breadth-first order.

**The three depth-first orders, explained by when the root is visited:**
- **Pre-order (root first):** Visit the current node, then explore everything to its left, then everything to its right. Useful for creating a copy of the tree structure.
- **In-order (root in the middle):** Explore everything to the left, then visit the current node, then explore everything to the right. For a Binary Search Tree, this visits every value in sorted order.
- **Post-order (root last):** Explore everything to the left, then everything to the right, then finally visit the current node. Useful for safely deleting a tree, since you deal with children before their parent.

**Level order (breadth-first):**
1. Start with the root in a waiting line (a queue).
2. Take the front node out of the line and visit it.
3. Add its children (if any) to the back of the line.
4. Repeat until the line is empty.

This visits the tree one whole level at a time, top to bottom, left to
right within each level — like ripples spreading outward.

**Memory aid:**
The name tells you *when* the root gets visited relative to its children:
Pre-order = before, In-order = between, Post-order = after.

---

##### 2. Binary Search Trees (`binary-search-trees`)
**Description:** A binary tree that keeps itself organised — smaller values on the left, larger on the right — enabling fast search.

**What it teaches:**
A Binary Search Tree (BST) is a binary tree with one special rule: for every
node, everything in its **left** branch is **smaller**, and everything in
its **right** branch is **larger**.

**Picture this BST:**
```
        8
       / \
      3   10
     / \    \
    1   6    14
       / \   /
      4   7 13
```
Everything under the root's left branch (1, 3, 4, 6, 7) is smaller than 8.
Everything under its right branch (10, 13, 14) is larger than 8. This same
rule holds true at every single node, not just the root.

**Searching in a BST, step by step:**
1. Start at the root.
2. If the current node is empty, or its value matches what you're looking for, you're done.
3. If your target is smaller than the current node's value, move to the left branch.
4. If your target is larger, move to the right branch.
5. Repeat until you find the value or run out of tree to search.

**Why this is O(log n):**
Each step throws away roughly half of the remaining nodes — you never have
to check the branch you know can't contain your target. For a balanced tree
holding a million values, this means finding anything takes only about 20
steps.

**Inserting into a BST, step by step:**
1. Start at the root, following the same left/right rule as searching.
2. If you reach an empty spot, that's where the new value belongs — place it there.
3. If the new value is smaller than the current node, go left; if larger, go right, and repeat until you find that empty spot.

---

#### Problems

##### 1. Maximum Depth of a Binary Tree (`max-depth-binary-tree`) [easy]
- **Topics:** Trees, Recursion
- **Companies:** Amazon, Google, Microsoft
- **Description:** Find the longest path from the root of a binary tree down to its farthest leaf.

**The problem:**
Given the root of a binary tree, find its maximum depth — the number of
nodes along the longest path from the root down to the farthest leaf.

**Example walkthrough:**
```
    3            → depth 1
   / \
  9   20         → depth 2
     /  \
    15   7       → depth 3
```
Maximum depth here is **3**.

**Step-by-step approach:**
1. If the current node doesn't exist (you've gone past a leaf), its depth is 0.
2. Otherwise, find the depth of the left branch (by repeating this same process on it).
3. Find the depth of the right branch the same way.
4. The depth of the current node is 1, plus whichever of the two branch depths is bigger.

This is a great example of **divide and conquer**: solve the same, smaller
problem on the left and right branches, and combine those two results to
get the answer for the whole tree.

**Time:** O(n) — every node is visited exactly once.
**Space:** O(height of the tree) — because solving each branch requires "remembering" its parent while it works, and that memory need grows with how deep the tree goes.

**Edge cases:**
- An empty tree has depth 0.
- A tree with just one node has depth 1.
- A tree that's really just a straight line (every node has only one child) has depth equal to the number of nodes — this is the worst case for memory use.

**Quizzes**

1. **Worst-Case Space** [medium]
   *For a tree where every node has only one child (a straight line), what does the space complexity become, and why?*
   → Options: O(1), because no extra memory is used, O(log n), because the tree is still searched efficiently, **O(n), because the "remembering" needed at each level grows as deep as the tree, which here equals the number of nodes**, O(n²), because every node is compared to every other node
   *Explanation: Space complexity is tied to the height of the tree. A single-child chain has height equal to its node count, so the space usage grows linearly in the worst case.*

2. **Divide and Conquer Logic** [easy]
   *How is the depth of the current node calculated from its children's depths?*
   → Options: The sum of both children's depths, The smaller of the two children's depths, **1 plus whichever child's depth is larger**, Always exactly 1 more than the root's depth
   *Explanation: The current node's depth is 1 (for itself) plus the depth of its deeper branch — this is the divide-and-conquer combination step.*

---

### 6. Graphs
- **Slug:** `graphs`
- **Category:** data-structures | **Order:** 6 | **Difficulty:** hard
- **Icon:** Share2
- **Description:** A network of points connected by links, used to model roads, social networks, and dependencies of all kinds.

**What is it?**
A graph is a collection of **points** (called vertices or nodes) connected
by **links** (called edges). Unlike a tree, which is strictly hierarchical
with no loops, a graph can connect points in absolutely any pattern —
including loops, multiple paths between the same two points, or completely
isolated points.

**Why it matters:**
Graphs model real-world networks: friendships on a social network, roads on
a map, links between web pages, or prerequisites between courses. If you can
represent a problem as a graph, you can apply powerful, well-known
techniques to solve it.

**Key terms:**
- **Directed vs Undirected:** In a directed graph, a connection has a direction — going from A to B doesn't automatically mean you can go from B to A. In an undirected graph, connections work both ways.
- **Weighted vs Unweighted:** A weighted graph's connections have a "cost," like the distance of a road. An unweighted graph's connections are all treated equally.
- **Cycle:** A path that starts and ends at the same point.
- **Connected component:** A cluster of points that are all reachable from each other, but not reachable from points outside the cluster.

**Analogy:**
A tree is like a family tree — one parent per child, no loops. A graph is
like a city road map — multiple routes between places, roundabouts, dead
ends, and shortcuts.

---

#### Subtopics

##### 1. Graph Representation (`graph-representation`)
**Description:** The two standard ways to store a graph in memory — adjacency matrix and adjacency list — and when to use each.

**What it teaches:**
Before you can work with a graph, you need to store it somehow. The two
most common ways are the adjacency matrix and the adjacency list.

**Adjacency Matrix:**
A grid where a mark at row A, column B means there's a connection from A to
B.
```
     A  B  C  D
A    0  1  1  0
B    1  0  0  1
C    1  0  0  0
D    0  1  0  0
```
- Space needed: grows with the *square* of the number of points — wasteful if there are relatively few connections.
- Checking whether two points are connected: instant.
- Finding all of a point's neighbours: requires scanning a whole row.

**Adjacency List (usually the better choice):**
Each point simply keeps a small list of the points it's directly connected
to.
```
A connects to: B, C
B connects to: A, D
C connects to: A
D connects to: B
```
- Space needed: grows with the number of points *plus* the number of connections — efficient when connections are sparse.
- Checking whether two points are connected: usually fast, proportional to how many neighbours that point has.
- Finding all of a point's neighbours: instant, since they're already listed together.

**When to use which:**
Use an adjacency matrix when the graph is very densely connected, or you
need instant "are these two connected?" checks. Otherwise, an adjacency
list is the default, more memory-efficient choice.

---

##### 2. Breadth-First and Depth-First Traversal (`bfs-dfs-traversal`)
**Description:** Two core strategies for exploring a graph — spreading out layer by layer, or diving deep down one path first.

**What it teaches:**
Two fundamental ways to explore a graph. Breadth-first search explores in
expanding layers, like ripples spreading in a pond. Depth-first search
follows one path as far as it can go before backtracking, like a mouse in a
maze committing to one route until it hits a dead end.

**Breadth-First Search (BFS), step by step:**
1. Put the starting point into a waiting line (a queue) and mark it as visited.
2. Take the point at the front of the line out, and process it.
3. Look at all of its neighbours. For each one you haven't visited yet, mark it visited and add it to the back of the line.
4. Repeat until the line is empty.
- Explores the graph one layer at a time.
- Finds the *shortest* path in graphs where every connection counts equally.
- Takes time proportional to the number of points plus the number of connections.

**Depth-First Search (DFS), step by step:**
1. Start at the given point and mark it visited, then process it.
2. Pick any neighbour you haven't visited yet, and repeat this entire process starting from that neighbour.
3. If a point has no unvisited neighbours left, back up to the previous point and try a different neighbour from there.
4. Continue until every reachable point has been visited.
- Goes deep before it goes wide.
- Often uses less memory than BFS on wide, shallow graphs.
- Also takes time proportional to the number of points plus the number of connections.

**When to use which:**

| Situation | Use |
|---|---|
| Shortest path where every step counts the same | Breadth-first |
| Just checking whether a path exists at all | Either |
| Ordering tasks with dependencies | Depth-first |
| Detecting loops | Depth-first |
| Finding clusters of connected points | Either |
| Exploring a website's links politely, layer by layer | Breadth-first |

---

#### Problems

##### 1. Find if a Path Exists in a Graph (`path-exists-in-graph`) [easy]
- **Topics:** Graphs, Traversal
- **Companies:** Amazon, Uber, Microsoft
- **Description:** Determine whether a route exists between two points in a graph by exploring outward from the source.

**The problem:**
You're given a graph with connections going both ways, along with a source
point and a destination point. Determine whether there's any valid path
connecting the source to the destination.

**Example walkthrough:**
Points 0 through 5. Connections: 0–1, 0–2, 3–5, 5–4, 4–3. Source = 0,
destination = 5.
- Points 0, 1, 2 form one cluster.
- Points 3, 4, 5 form a separate cluster.
- Since 0 and 5 are in different clusters, there's **no path** between them.

**Step-by-step approach:**
1. Organise the connections so you can easily look up each point's neighbours.
2. Starting from the source, explore outward (using breadth-first or depth-first search — either works), keeping track of every point you've already visited so you don't loop forever.
3. If, at any point during the exploration, you reach the destination, a path exists — stop and report true.
4. If you run out of new points to explore without ever reaching the destination, no path exists — report false.

**Why this works:**
Exploring outward from the source visits every point in its entire
connected cluster. If the destination belongs to that same cluster, the
exploration is guaranteed to reach it eventually. If not, the exploration
runs out of places to go, proving there's no path.

**Time:** proportional to the number of points plus the number of connections.
**Space:** proportional to the number of points plus the number of connections, for keeping track of neighbours and visited points.

**Quizzes**

1. **Why Track Visited Points** [easy]
   *Why must the exploration keep track of points it has already visited?*
   → Options: To calculate the shortest distance, **To avoid looping forever by revisiting the same points repeatedly**, To count the total number of points, To sort the points by value
   *Explanation: Without a visited record, the exploration could bounce back and forth between already-explored points indefinitely, especially in graphs with cycles.*

2. **BFS vs DFS Choice** [easy]
   *For this specific problem — just checking whether *any* path exists — does it matter whether you use breadth-first or depth-first exploration?*
   → Options: Yes, only BFS works, Yes, only DFS works, **No, either works equally well since only reachability matters, not the shortest path**, No, neither works and a different technique is needed
   *Explanation: Since the goal is simply reachability (does a path exist at all), both BFS and DFS will correctly discover the destination if it's in the same connected cluster as the source.*

---

## DBMS (Database Management Systems)

### What is DBMS?
A Database Management System is software that stores, organises, and
retrieves data reliably. Think of it as a highly organised digital filing
cabinet. Instead of dumping data into a messy pile, a DBMS keeps information
in **tables** with clear relationships, guarantees **consistency**, and lets
you ask precise questions using a query language.

**Why it matters for placements:**
DBMS is one of the most-asked subjects after DSA. Every real application
needs to store and retrieve data reliably, so understanding how databases
work — not just how to write one particular query language — is essential.

---

### 1. Query Basics (Reading, Filtering, and Aggregating Data)
- **Slug:** `sql-basics`
- **Category:** dbms | **Order:** 1 | **Difficulty:** easy
- **Icon:** Database
- **Description:** The four core operations for talking to a database — Create, Read, Update, and Delete.

**What is it?**
A query language is how we "ask questions" of a database — things like
"show me every customer who spent more than a certain amount last month" or
"update this person's email address."

**The four fundamental operations, often remembered as CRUD:**
- **Read** — retrieve data (by far the most common operation).
- **Create** — add new data.
- **Update** — modify existing data.
- **Delete** — remove data.

---

#### Subtopics

##### 1. Filtering Rows by a Condition (`filtering-where`)
**Description:** Narrow down which rows a query returns, using comparisons, ranges, and text-pattern matching.

**What it teaches:**
Filtering narrows down which rows you get back, based on a condition. Without
any filter, you get back every single row in the table.

**Basic comparisons:**
- "Give me all employees whose salary is above a certain number."
- "Give me all products whose price falls between two values."
- "Give me all orders whose status is one of a specific set of allowed values."

**Pattern matching:**
Filters can also match *patterns* in text — for example, "find every email
address ending in a certain domain" or "find every product name starting
with a certain word." A wildcard symbol typically stands in for "any
sequence of characters," and another for "exactly one character."

**Combining conditions:**
Multiple conditions can be joined together — for example: "orders where the
total is above a threshold, AND the status is still pending, AND the order
was created after a certain date." All three conditions must be true at
once for a row to be included.

---

##### 2. Aggregating and Grouping Data (`aggregate-groupby`)
**Description:** Summarise a whole table — or groups within it — into single values like totals, averages, and counts.

**What it teaches:**
An aggregate calculation looks across a whole set of rows and boils it down
to a single summary number.

**Common aggregate calculations:**
- **Count** — how many rows are there?
- **Sum** — what's the total of a numeric column?
- **Average** — what's the mean value?
- **Maximum / Minimum** — what's the largest or smallest value?

**Grouping rows before aggregating:**
Instead of summarising the *entire* table at once, you can split rows into
groups first (for example, "group by department") and then calculate the
summary separately for each group — giving you, say, the total salary
*per department* rather than one grand total.

You can also filter which *groups* show up in the final result — for
example, "only show departments where more than 5 employees work," which is
different from filtering individual rows *before* grouping.

**The key distinction:**
Filtering individual rows happens *before* grouping. Filtering entire groups
(often based on an aggregate calculation like a group's average) happens
*after* grouping. You can't filter on an aggregate result before that
aggregate has actually been calculated.

---

#### Problems

##### 1. Employees Earning Above Their Department's Average (`employee-salary-query`) [easy]
- **Topics:** Filtering, Aggregation
- **Companies:** Amazon, Google
- **Description:** Find every employee who earns more than the average salary within their own department.

**The problem:**
Find every employee who earns more than the average salary within their own
department. Report their name, salary, and department name.

**Step-by-step approach:**
1. For each department, work out the average salary of everyone in it.
2. Match each employee up with their department's name (by connecting the employee data to the department data through a shared department identifier).
3. Compare each individual employee's salary to *their own department's* average — not the company-wide average — and keep only the ones who earn more than that.

**How the "per-employee comparison" logic works:**
For every single employee being checked, the calculation re-computes the
average salary just for people in that same department, then checks the
current employee against that number. This means the average used is always
specific to the employee's own department, not a single company-wide figure.

**Quizzes**

1. **Which Average?** [easy]
   *When checking whether an employee earns "above average," which average should be used?*
   → Options: The company-wide average salary, **The average salary within that employee's own department**, The average of the top 3 earners, The average of the previous year's salaries
   *Explanation: The problem specifically asks for employees earning above their own department's average, not a single company-wide figure — comparing against the wrong average would give the wrong result set.*

2. **Recomputing Per Employee** [medium]
   *Why does the average salary calculation need to be tied to each employee's department rather than computed once for the whole company?*
   → Options: Because averages can only be computed once per table, **Because each department can have a different average, so the comparison must use that specific department's figure**, Because company-wide averages are always inaccurate, Because department names must be sorted first
   *Explanation: Different departments likely have different salary averages, so comparing every employee against one shared number would incorrectly include or exclude people based on the wrong baseline.*

---

### 2. Combining Data from Multiple Tables
- **Slug:** `joins-subqueries`
- **Category:** dbms | **Order:** 2 | **Difficulty:** medium
- **Icon:** GitMerge
- **Description:** How to combine related rows spread across multiple tables using joins and subqueries.

**What is it?**
Real databases split data across multiple tables to avoid storing the same
information twice (this is called normalisation — covered next). **Joins**
let you combine related rows from different tables based on a shared
identifier.

---

#### Subtopics

##### 1. Matching vs. Keeping Everything (Inner and Outer Joins) (`inner-outer-joins`)
**Description:** The different join types and how each decides which rows survive when two tables are combined.

**What it teaches:**
Different join types decide which rows survive when two tables are combined.

- **Matching only (inner join):** Keeps only the rows that have a match in *both* tables. If an order references a customer that no longer exists, that order disappears from the result.
- **Keep everything from one side (left/right join):** Keeps every row from one specified table, filling in blanks for the other table wherever there's no match. For example, keeping every product — even ones that have never been ordered — with empty values shown for their (nonexistent) order details.
- **Keep everything from both sides (full outer join):** Keeps every row from *both* tables, filling in blanks wherever there's no match on either side.

---

##### 2. Subqueries That Depend on the Outer Row (Correlated Subqueries) (`correlated-subqueries`)
**Description:** A "question within a question" that re-runs once per outer row, using that row's own values.

**What it teaches:**
A correlated subquery is a smaller question tucked inside a bigger one,
where the smaller question depends on values from the row currently being
checked in the bigger question. Because of that dependency, it effectively
runs once *per row* of the outer question — which can be slow on large
tables.

**Example — the same "above department average" problem from before:**
For every employee being examined, a fresh calculation works out the
average salary just within that employee's department, and then compares
the employee's salary to that freshly-calculated number.

**Performance note:**
If there are 10,000 employees spread across only 50 departments, repeating
this calculation once per employee (10,000 times) is wasteful, since there
are really only 50 distinct averages worth calculating. A more efficient
approach: calculate each department's average once (by grouping), and then
match that pre-calculated average back to each employee.

---

#### Problems

##### 1. Total Sales Report by Product (`product-sales-report`) [medium]
- **Topics:** Joins, Aggregation
- **Companies:** Microsoft, Amazon
- **Description:** Build a report of total quantity sold and revenue per product, including products with zero sales.

**The problem:**
Produce a report showing each product's total quantity sold and total
revenue, across every region — including products that haven't sold at
all.

**Step-by-step approach:**
1. Start from the full list of products, and connect each one to its matching sales records — but keep every product even if it has zero matching sales records (this is the "keep everything from one side" join type).
2. Group the combined data by product.
3. For each product, add up the total quantity sold and total revenue.
4. For products with no sales at all, treat their missing totals as zero rather than leaving them blank.
5. Sort the final report by revenue, highest first.

**Quizzes**

1. **Choosing the Join Type** [easy]
   *Why must this report use a "keep everything from one side" join starting from the products table, instead of a matching-only join?*
   → Options: Because matching-only joins are always slower, **Because products with zero sales have no matching sales records, and a matching-only join would drop them entirely**, Because the products table has more columns, Because sales data is always incomplete
   *Explanation: An inner (matching-only) join only keeps rows with a match on both sides — since unsold products have no sales rows to match, they'd be excluded, which contradicts the requirement to include them.*

2. **Handling Missing Totals** [medium]
   *For a product with zero matching sales rows, what should its total quantity and revenue be shown as?*
   → Options: Left blank/null, **Zero**, The average of all other products, Excluded from the report entirely
   *Explanation: The report must include unsold products, and since there's nothing to sum for them, their totals should be treated as zero rather than blank or omitted.*

---

### 3. Normalization
- **Slug:** `normalization`
- **Category:** dbms | **Order:** 3 | **Difficulty:** medium
- **Icon:** Layers
- **Description:** The process of organising a database to eliminate duplicate data and prevent inconsistent updates.

**What is it?**
Normalisation is the process of organising data to **reduce duplication**
and **avoid inconsistency**. There are progressive levels of organisation
(called normal forms), each one fixing a specific kind of problem.

**Why it matters:**
Without normalisation, you might store a customer's address inside every
single order they place. If that customer moves, you'd have to update every
one of those order records — and if you miss even one, your data becomes
inconsistent. Normalisation prevents this by storing each fact in exactly
one place.

---

#### Subtopics

##### 1. Functional Dependencies (`functional-dependencies`)
**Description:** How one piece of data can reliably determine another — the foundation every normal form is built on.

**What it teaches:**
A functional dependency means one piece of information uniquely determines
another. For example, if you know a student's ID number, that alone tells
you their name, address, and phone number — the ID "determines" those other
fields.

**Why this matters for normalisation:**
Every level of normalisation is really about finding and removing unwanted
dependencies. A **partial dependency** (where some information only depends
on *part* of what uniquely identifies a row) gets removed at one stage. A
**transitive dependency** (where one non-identifying piece of information
depends on *another* non-identifying piece of information, rather than
directly on the identifier) gets removed at a later stage.

---

##### 2. The Strictest Level: Every Determining Fact Must Be a True Identifier (`bcnf-decomposition`)
**Description:** A stricter rule than the usual third normal form, requiring every determining fact to uniquely identify a row.

**What it teaches:**
This stricter level requires that whenever one piece of information reliably
determines another, the determining piece must be capable of uniquely
identifying a whole row on its own — not just a partial dependency hiding
in a larger table.

**How to fix a table that breaks this rule:**
1. Find a dependency where the determining information *isn't* capable of uniquely identifying the whole row.
2. Split that dependency out into its own separate table.
3. Remove the dependent information from the original table, since it now lives in the new table.
4. Repeat this process on any remaining tables until none of them break the rule anymore.

---

#### Problems

##### 1. Cleaning Up a Repetitive Student Table (`normalise-student-data`) [medium]
- **Topics:** Normalization
- **Companies:** Adobe, Oracle
- **Description:** Break a messy table with repeated course columns into clean, properly normalised tables.

**The problem:**
You're given a messy student table where each student has multiple
"Course1 / Instructor1, Course2 / Instructor2..." columns repeated side by
side. Reorganise it into properly normalised tables.

**Step-by-step decomposition:**
1. **Remove repeating groups:** Instead of separate columns for each course a student takes, create one row per student-course pairing. Now you have a simple Student table, plus a separate Enrollment table linking students to courses.
2. **Remove partial dependencies:** Check whether any piece of information in the Enrollment table depends on only *part* of what uniquely identifies each row. If not, this step is already satisfied.
3. **Remove transitive dependencies:** Notice that the instructor teaching a course depends on the *course itself*, not on which student is enrolled. Move instructor information into its own Course table, connected by course, rather than leaving it duplicated inside the Enrollment table.

**Quizzes**

1. **First Step** [easy]
   *What is the first step in decomposing the repetitive student table?*
   → Options: Removing transitive dependencies, **Removing repeating groups by creating one row per student-course pairing**, Deleting the Student table entirely, Merging all courses into one column
   *Explanation: Before dependencies can even be analysed, the repeating "Course1/Instructor1, Course2/Instructor2..." columns must first be broken into individual rows in a separate Enrollment table.*

2. **Why Move Instructor Out** [medium]
   *Why should instructor information be moved into a separate Course table instead of staying in the Enrollment table?*
   → Options: Because instructors change every semester, **Because the instructor depends on the course itself, not on which student is enrolled — leaving it in Enrollment would duplicate it across every student in that course**, Because Enrollment tables can't hold text, Because it makes the table shorter
   *Explanation: This is a transitive dependency — instructor depends on course, and course is a non-key field in Enrollment. Leaving it there duplicates the instructor's name for every enrolled student in that course.*

---

### 4. Indexing & Performance
- **Slug:** `indexing-performance`
- **Category:** dbms | **Order:** 4 | **Difficulty:** hard
- **Icon:** Zap
- **Description:** How indexes speed up searching in a database, and how to read a query's execution plan to spot slowdowns.

**What is it?**
An index is a structure that speeds up how quickly data can be found. Think
of it like the index at the back of a textbook — instead of flipping
through every single page to find a topic, you look it up in the index and
jump straight to the right page.

**The trade-off:**
Indexes make reading (searching) faster, but they make writing (adding,
updating, deleting) slower, because the index itself has to be kept up to
date too. They also take up extra storage space.

---

#### Subtopics

##### 1. Balanced Tree Indexes (`btree-indexes`)
**Description:** The most common index structure in databases, keeping data sorted for fast searches, ranges, and sorting.

**What it teaches:**
A balanced tree index is a self-organising tree structure that keeps data
sorted, allowing searching, inserting, and deleting all in O(log n) time.
It's the most common type of index used in databases.

**How it works, conceptually:**
- Data is stored in evenly-sized chunks called pages.
- Each page points down to smaller groups of pages, forming a tree.
- The actual data (or pointers to it) lives in the bottom layer, called leaf nodes.
- Every leaf node sits at the exact same depth, keeping the tree balanced and predictable.

**When it helps most:**
- Looking for an exact match, like "find the row where the ID equals a specific value."
- Looking for a range, like "find every row with a date between two values."
- Sorting results by the indexed column.

---

##### 2. Reading Execution Plans (`query-execution-plans`)
**Description:** How to read a database's plan for running your query, so you can spot slow full-table scans before they hurt.

**What it teaches:**
An execution plan shows how the database actually intends to carry out your
request. Reading it helps you spot performance problems before they become
serious.

**What to look out for:**
- **Scanning every row:** Reading the entire table from start to finish — usually bad for large tables.
- **Using an index to jump straight to matching rows:** Usually good.
- **Nested comparisons between two tables:** For every row in one table, scanning through another table — can be slow if both tables are large.
- **Building a lookup table first, then scanning:** Often faster than nested comparisons for large tables.

---

#### Problems

##### 1. Speeding Up a Slow Multi-Table Query (`query-optimizer-analysis`) [hard]
- **Topics:** Indexing, Performance
- **Companies:** Google, Meta
- **Description:** Diagnose and fix a slow 5-table query so it runs in under a second instead of 30.

**The problem:**
A query joining five tables with several filter conditions on
un-indexed columns is taking 30 seconds. Recommend fixes to bring it under
1 second.

**Step-by-step approach:**
1. Examine the execution plan to identify which parts of the query are scanning entire tables instead of using an index.
2. Add indexes on the columns that are actually used for joining tables together and for filtering — especially combined (multi-column) indexes when a query filters on more than one column at once.
3. Avoid wrapping a filtered column in a calculation (like extracting just the year from a date), since that usually prevents the database from using an index at all. Instead, filter using a plain range (like "on or after the start of the year, and before the start of the next year").
4. Re-check the execution plan afterward to confirm the slow full-table scans have been replaced with fast index lookups.

**Quizzes**

1. **Diagnosing the Slowdown** [medium]
   *What should be examined first to find out why the 5-table query is slow?*
   → Options: The table names, **The execution plan, to spot which parts are scanning entire tables instead of using an index**, The number of columns in each table, The database's storage engine version
   *Explanation: The execution plan reveals exactly where the database is doing expensive full-table scans versus fast index lookups, pointing directly at the bottleneck.*

2. **Why Avoid Wrapping Columns in Calculations** [hard]
   *Why does filtering with "extract the year from this date column" hurt performance compared to filtering with a plain date range?*
   → Options: It uses more storage space, **Wrapping the column in a calculation usually prevents the database from using an index on that column at all**, It returns incorrect results, It only works on numeric columns
   *Explanation: When a column is transformed inside a filter condition, the database generally can't match it against the pre-sorted index values, forcing a full scan instead — a plain range filter preserves index usability.*

---

### 5. Transactions & Concurrency
- **Slug:** `transactions-concurrency`
- **Category:** dbms | **Order:** 5 | **Difficulty:** hard
- **Icon:** Shuffle
- **Description:** How databases group operations so they all succeed or all fail together, even with many users at once.

**What is it?**
A transaction is a group of database operations that must all succeed
together, or all fail together, with no in-between state. Think of a bank
transfer: money leaving one account and arriving in another must happen as
one indivisible unit. If either half fails, the whole thing should be undone.

**Why it matters:**
Without proper transaction handling, multiple people accessing the same
data at the same time can cause serious problems — lost updates, reading
data that was never actually finalised, or seeing inconsistent results.
Every real application needs solid transaction handling.

---

#### Subtopics

##### 1. The Four Guarantees (ACID) (`acid-properties`)
**Description:** The four properties — Atomicity, Consistency, Isolation, Durability — that make transactions trustworthy.

**What it teaches:**
ACID is a set of four guarantees that make transactions trustworthy.

- **Atomicity:** All-or-nothing. If any part of the transaction fails, everything is rolled back as if it never started.
- **Consistency:** The database always moves from one valid state to another valid state — none of its rules are ever violated, even temporarily.
- **Isolation:** Transactions happening at the same time don't interfere with each other — each one behaves as if it were the only one running.
- **Durability:** Once a transaction is confirmed as complete, the changes are permanent, even if the system crashes immediately afterward.

---

##### 2. Isolation Levels (`isolation-levels`)
**Description:** The four standard settings that control how much simultaneous transactions are allowed to see of each other.

**What it teaches:**
There are several standard isolation levels, each preventing a different
kind of interference between simultaneous transactions.

| Level | Reading unfinished data | Getting different results on repeated reads | New rows appearing on repeated queries |
|---|---|---|---|
| Loosest | Possible | Possible | Possible |
| Slightly stricter | Prevented | Possible | Possible |
| Stricter still | Prevented | Prevented | Possible |
| Strictest | Prevented | Prevented | Prevented |

- **Reading unfinished data:** Seeing changes made by another transaction that hasn't actually been confirmed yet — and might still get undone.
- **Different results on repeated reads:** Reading the same row twice within one transaction and getting two different answers, because another transaction changed it in between.
- **New rows appearing:** Running the same query twice and getting a different *set* of rows the second time, because another transaction inserted or removed rows in between.

---

#### Problems

##### 1. Detecting a Deadlock (`deadlock-detection`) [hard]
- **Topics:** Concurrency, Transactions
- **Companies:** Oracle, Microsoft
- **Description:** Detect whether a group of transactions is stuck waiting on each other forever, using a wait-for graph.

**The problem:**
Given a set of transactions and the locks they're each waiting on, detect
whether a deadlock exists.

**What is a deadlock?**
Transaction 1 holds a lock on resource A and is waiting for resource B.
Transaction 2 holds a lock on resource B and is waiting for resource A.
Neither can move forward — they're stuck waiting on each other forever,
unless one of them is forcibly stopped.

**Step-by-step approach:**
1. Build a diagram where each transaction is a point, and a connection is drawn from Transaction X to Transaction Y whenever X is waiting on something Y is holding.
2. Explore this diagram, starting from each point, looking for a path that eventually loops back to where it started.
3. If such a loop exists, a deadlock is present among the transactions in that loop.

**Quizzes**

1. **What the Wait-For Graph Represents** [medium]
   *In the wait-for graph built for deadlock detection, what does a connection from Transaction X to Transaction Y mean?*
   → Options: X and Y are both idle, **X is waiting on a resource that Y currently holds**, X has finished and Y is starting, X and Y are the same transaction
   *Explanation: Each directed connection captures a "waiting on" relationship — X can't proceed until Y releases what it's holding.*

2. **Detecting the Deadlock** [easy]
   *What structure in the wait-for graph indicates that a deadlock exists?*
   → Options: A single point with no connections, **A cycle — a path that starts and ends at the same transaction**, The transaction with the most connections, Two disconnected points
   *Explanation: A cycle means every transaction in that loop is waiting on the next one, all the way back to itself — none of them can ever proceed.*

---

## OS (Operating Systems)

### What is an Operating System?
An operating system is the software that manages a computer's hardware and
provides services for every application running on it. It sits between you
and the raw hardware. Windows, macOS, Linux, and Android are all operating
systems.

**Why it matters for placements:**
Many companies test OS concepts heavily, and even fewer candidates prepare
for them compared to DSA — which means solid OS knowledge can genuinely set
you apart.

---

### 1. Process Management
- **Slug:** `process-management`
- **Category:** os | **Order:** 1 | **Difficulty:** easy
- **Icon:** Cpu
- **Description:** How the operating system creates, tracks, and switches between running programs.

**What is it?**
A **process** is a program that's currently running. When you open an app,
the operating system creates a process for it, with its own memory and its
own state. Process management covers creating, scheduling, and eventually
ending these processes.

---

#### Subtopics

##### 1. Process States & Transitions (`process-states`)
**Description:** The lifecycle a process moves through — New, Ready, Running, Waiting, Terminated.

**What it teaches:**
A process moves through a series of states over its lifetime:

```
    ┌─────┐   Admitted    ┌───────┐   Scheduled    ┌─────────┐
    │ New ├─────────────► │ Ready ├───────────────►│ Running │
    └─────┘                └───────┘                └─────────┘
                               ▲                          │
                               │                    Needs to wait
                               │                    for I/O or an event
                               │                          │
                               │                    ┌──────────┐
                               └────────────────────│ Waiting  │
                                  I/O finished       └──────────┘
```

- **New:** The process is being set up.
- **Ready:** Loaded into memory, waiting for its turn on the processor.
- **Running:** Currently executing on the processor.
- **Waiting:** Paused, blocked on something external like disk or keyboard input.
- **Terminated:** Finished running.

---

##### 2. Context Switching (`context-switching`)
**Description:** How the CPU saves one process's state and loads another's when it switches who's running.

**What it teaches:**
When the processor switches from running one process to running another, it
has to save the current process's exact state (what instruction it was on,
what its variables held, etc.) and load the next process's saved state.
This is a **context switch**.

**The cost:**
Context switching is pure overhead — it doesn't accomplish any actual work
for either process, it's just the "cost of switching attention." Frequent
switching can noticeably slow down overall throughput.

**What gets saved (in something called a Process Control Block):**
- A unique identifier for the process.
- Exactly which instruction it should resume from.
- The values held in the processor's working registers at that moment.
- Information about which parts of memory belong to it.
- The status of any files or resources it has open.

---

#### Problems

##### 1. First-Come-First-Served Scheduling Calculator (`process-scheduling-calculator`) [easy]
- **Topics:** Process Scheduling
- **Companies:** Microsoft, Amazon
- **Description:** Calculate waiting and turnaround time for a set of processes run strictly in arrival order.

**The problem:**
Given a list of processes with their arrival times and how long each one
needs to run (burst time), calculate each process's waiting time and
turnaround time, assuming processes run strictly in the order they arrive.

**Example walkthrough:**
Process 1 arrives at time 0, needs 5 units. Process 2 arrives at time 1,
needs 3 units. Process 3 arrives at time 2, needs 8 units.

Since they run strictly in arrival order: Process 1 runs from 0 to 5,
Process 2 runs from 5 to 8, Process 3 runs from 8 to 16.

- Process 1: waited 0 units before starting (5 − 5 = 0 wait... more precisely, start time 0 minus arrival time 0 = 0 wait); finished at time 5, so turnaround (time from arrival to finish) = 5 − 0 = **5**.
- Process 2: started at time 5 but arrived at time 1, so it waited 5 − 1 = **4**; turnaround = 8 − 1 = **7**.
- Process 3: started at time 8 but arrived at time 2, so it waited 8 − 2 = **6**; turnaround = 16 − 2 = **14**.

Average waiting time = (0 + 4 + 6) ÷ 3 = 3.67 units.
Average turnaround time = (5 + 7 + 14) ÷ 3 = 9.0 units.

**Step-by-step approach:**
1. Sort the processes by arrival time (in this scheduling rule, whoever arrives first runs first).
2. Track a running "current time," starting at the first process's arrival time.
3. For each process in order: its waiting time is the current time minus its arrival time; run it for its full burst time, advancing the current time by that amount; its turnaround time is its finish time minus its arrival time.
4. Average the waiting times and turnaround times across all processes.

**Quizzes**

1. **Calculating Waiting Time** [easy]
   *A process starts running at time 8 but arrived at time 2. What is its waiting time?*
   → Options: 8, 2, **6**, 10
   *Explanation: Waiting time is start time minus arrival time: 8 − 2 = 6.*

2. **Turnaround vs. Waiting Time** [medium]
   *What's the difference between a process's turnaround time and its waiting time?*
   → Options: They're always equal, **Turnaround time is finish time minus arrival time (includes execution); waiting time is start time minus arrival time (excludes execution)**, Waiting time includes execution time but turnaround doesn't, Turnaround time only applies to the first process
   *Explanation: Waiting time measures only the delay before the process starts running, while turnaround time measures the full span from arrival to completion, including the actual run time.*

---

### 2. CPU Scheduling
- **Slug:** `cpu-scheduling`
- **Category:** os | **Order:** 2 | **Difficulty:** medium
- **Icon:** Clock
- **Description:** The algorithms that decide which waiting process gets the processor next, and for how long.

**What is it?**
CPU scheduling algorithms decide which waiting process gets the processor
next, and for how long. The goal is to keep the processor busy while
keeping every process reasonably responsive.

---

#### Subtopics

##### 1. First-Come-First-Served & Shortest-Job-First (`fcfs-sjf`)
**Description:** Two simple scheduling rules — run whoever arrived first, or run whoever needs the least time.

**First-Come-First-Served:**
- Whoever arrives first runs first, all the way through, without being interrupted.
- Simple, but suffers from the **convoy effect**: if a very long process happens to arrive first, everything behind it has to wait, even short, quick processes.

**Shortest-Job-First:**
- The process needing the least amount of time runs next.
- Mathematically proven to give the smallest possible average waiting time.
- Can cause **starvation**: if short processes keep arriving, a long process might get pushed back indefinitely and never actually run.

---

##### 2. Round Robin Scheduling (`round-robin`)
**Description:** Give every process a small, fixed time slice in rotation, so nothing waits forever.

**What it teaches:**
Every process gets a small, fixed slice of time (called a quantum). When
its slice runs out, it goes to the back of the waiting line and the next
process gets its turn.

**The trade-off around slice size:**
- **A small slice:** Very responsive, good for interactive use, but causes lots of context-switch overhead since switching happens so often.
- **A large slice:** Less overhead, but less responsive — with a large enough slice, it starts behaving just like first-come-first-served.

**Rule of thumb:** The slice should be a bit larger than the actual cost of a
context switch, so most of the time is spent doing real work rather than
switching between processes.

---

#### Problems

##### 1. Simulating Round Robin (`round-robin-quantum`) [medium]
- **Topics:** CPU Scheduling
- **Companies:** Google, Meta
- **Description:** Simulate Round Robin scheduling and report each process's completion time and switch count.

**The problem:**
Simulate Round Robin scheduling for a set of processes with a given time
slice, and report each process's completion time along with the number of
switches between processes.

**Example:**
Process 1 needs 10 units, Process 2 needs 5 units, Process 3 needs 8 units.
Slice = 4 units. All arrive at time 0.

- Round 1: Process 1 runs 4 units (6 left), Process 2 runs 4 units (1 left), Process 3 runs 4 units (4 left).
- Round 2: Process 1 runs 4 units (2 left), Process 2 runs its remaining 1 unit and finishes, Process 3 runs its remaining 4 units and finishes.
- Round 3: Process 1 runs its remaining 2 units and finishes.

Completion times: Process 2 finishes at 13, Process 3 finishes at 23,
Process 1 finishes at 17.

**Step-by-step approach:**
1. Put every process into a waiting line in arrival order.
2. Take the process at the front of the line and let it run for up to one time slice, or until it finishes — whichever comes first.
3. If it still has work left after its slice, send it to the back of the line.
4. If it finishes, record its completion time.
5. Repeat until the line is empty, counting each handoff between processes as one context switch.

**Quizzes**

1. **What Happens Mid-Slice** [easy]
   *If a process still has work left after using its full time slice, what happens to it?*
   → Options: It's terminated immediately, **It goes to the back of the waiting line to wait for another turn**, It gets a longer slice next time, It skips ahead of all other processes
   *Explanation: Round Robin is designed so no process monopolises the CPU — any unfinished process is requeued at the back to give others a turn.*

2. **Counting Context Switches** [medium]
   *In the simulation, what counts as one context switch?*
   → Options: Every time a process runs at all, **Each handoff from one process to another when the CPU changes who it's running**, Only when a process finishes completely, Only at the very start of the simulation
   *Explanation: A context switch happens specifically when control moves from one process to a different one — every such handoff during the simulation adds to the switch count.*

---

### 3. Memory Management
- **Slug:** `memory-management`
- **Category:** os | **Order:** 3 | **Difficulty:** medium
- **Icon:** HardDrive
- **Description:** How the operating system allocates memory and creates the illusion that every process has it all to itself.

**What is it?**
Memory management is how the operating system allocates and tracks memory.
It creates an illusion called **virtual memory**, so every process feels
like it has the whole memory to itself, even though many processes are
actually sharing the same physical memory.

---

#### Subtopics

##### 1. Paging & Virtual Memory (`paging-virtual-memory`)
**Description:** How memory is split into fixed-size pages, letting a process use more memory than physically exists.

**What it teaches:**
**Paging** splits memory into fixed-size chunks: **pages** in virtual
memory, and **frames** in physical memory. A lookup table maps each virtual
page to wherever its data actually lives in physical memory.

**Why have virtual memory at all?**
A program might need more memory than the computer physically has. Virtual
memory lets parts of a process sit on disk until they're actually needed,
creating the illusion of nearly unlimited memory.

**Page fault:** When a program tries to use a page that isn't currently
loaded into physical memory, the operating system has to fetch it from
disk. This is dramatically slower than accessing memory that's already
loaded — often tens of thousands of times slower.

---

##### 2. Page Replacement Algorithms (`page-replacement`)
**Description:** The strategies for choosing which page to evict when memory is full and a new one needs to load.

**What it teaches:**
When physical memory is full and a new page needs to be loaded, the
operating system must evict something. Which page should be evicted?

- **First In, First Out:** Evict whichever page has been in memory the longest. Simple, but can behave counter-intuitively — sometimes *adding* more memory actually causes *more* page faults, a quirk known as Belady's Anomaly.
- **Least Recently Used:** Evict the page that hasn't been touched for the longest time. Generally performs well, but is more complex to implement precisely.
- **Optimal (theoretical only):** Evict the page that won't be needed again for the longest time in the future. This is the best possible choice, but it's impossible in real systems since you can't actually see the future — it's mainly used as a benchmark to compare other strategies against.
- **Clock (a practical approximation of Least Recently Used):** Every page has a simple "recently used" flag. A pointer sweeps around, clearing flags as it goes; the first page it finds with a cleared flag gets evicted.

---

#### Problems

##### 1. Simulating Least-Recently-Used Page Replacement (`lru-page-replacement`) [medium]
- **Topics:** Memory Management
- **Companies:** Amazon, Adobe
- **Description:** Simulate LRU page replacement on a request sequence and count how many page faults occur.

**The problem:**
Given a sequence of page requests and a fixed number of available memory
frames, simulate Least-Recently-Used replacement and count how many page
faults occur.

**Example:**
Requested pages, in order: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2. Frames
available: 4.

Walking through it:
- 7 arrives → not in memory → fault. Memory now holds: 7
- 0 arrives → not in memory → fault. Memory now holds: 7, 0
- 1 arrives → not in memory → fault. Memory now holds: 7, 0, 1
- 2 arrives → not in memory → fault. Memory now holds: 7, 0, 1, 2
- 0 arrives → already in memory → hit. Mark 0 as most recently used.
- 3 arrives → not in memory, and memory is full → fault, evict whichever page was used least recently (page 2). Memory now holds: 3, 0, 7, 1
- ...continuing this pattern through the rest of the sequence, the total comes to **9 faults**.

**Step-by-step approach:**
1. Keep track of which pages are currently loaded, along with how recently each was used.
2. For each requested page: if it's already loaded, mark it as just-used and move on (a "hit," no fault).
3. If it's not loaded and there's still free space, load it and mark it just-used (a "fault," but no eviction needed).
4. If it's not loaded and memory is full, evict whichever loaded page was used least recently, then load the new page in its place (a "fault," with an eviction).
5. Count every fault along the way.

**Quizzes**

1. **A Hit vs. a Fault** [easy]
   *When a requested page is already loaded in memory, what happens?*
   → Options: It's counted as a fault, **It's counted as a hit, and the page is marked as most recently used**, The oldest page is evicted, Nothing happens and it's ignored
   *Explanation: A hit simply updates the "recently used" status of the already-loaded page — no eviction or fault is involved.*

2. **Choosing What to Evict** [medium]
   *When memory is full and a new page must be loaded, which page does LRU evict?*
   → Options: The page that was loaded first, **The page that hasn't been used for the longest time**, A randomly chosen page, The page requested most frequently overall
   *Explanation: LRU specifically evicts based on recency of use, not order of loading — the page that's gone the longest without being touched is removed.*

---

### 4. File Systems
- **Slug:** `file-systems`
- **Category:** os | **Order:** 4 | **Difficulty:** medium
- **Icon:** FolderOpen
- **Description:** How data is organised, stored, and retrieved from disk, including how disk requests are ordered.

**What is it?**
A file system manages how data is stored and retrieved on disk. It
organises files into directories and handles turning a file's name into the
actual physical location where its data lives.

---

#### Subtopics

##### 1. File Allocation Methods (`file-allocation`)
**Description:** Three ways to lay out a file's data on disk — contiguous, linked, or indexed — each with its own trade-offs.

**Contiguous allocation:** Each file occupies one unbroken stretch of disk
space.
- Pros: Fast to read sequentially or jump to any part; simple to manage.
- Cons: Leaves gaps of unusable space over time (fragmentation); you need to know the file's size in advance.

**Linked allocation:** Each chunk of the file points to the location of the
next chunk.
- Pros: No fragmentation; files can grow freely over time.
- Cons: Slow to jump to a specific point (you must follow the chain from the start); some space is spent just on the pointers themselves.

**Indexed allocation:** Each file has a separate index listing every chunk
it uses.
- Pros: Fast to jump to any point; no fragmentation.
- Cons: The index itself takes up extra space, which is wasteful for very small files.

---

##### 2. Disk Scheduling Algorithms (`disk-scheduling`)
**Description:** The strategies that decide the order in which pending disk requests are served, to minimise head movement.

The disk's read/write head has to physically move to the right location to
access data. Scheduling algorithms aim to minimise how much it has to move.

- **First-Come-First-Served:** Handle requests strictly in the order they arrive. Fair, but can mean a lot of unnecessary back-and-forth movement.
- **Shortest-Seek-Time-First:** Always handle whichever request is physically closest right now. Better overall throughput, but can leave a distant request waiting indefinitely.
- **Elevator-style sweep:** Move steadily in one direction, handling every request along the way, then reverse direction once you hit the end — just like a lift.
- **One-directional sweep with a jump-back:** Move in one direction only, servicing requests, then jump straight back to the start rather than sweeping backward — this gives more consistent wait times.
- **Sweep that turns around at the last request (rather than the physical end of the disk):** A refinement of the sweeping approaches above, avoiding wasted movement past the final actual request.

---

#### Problems

##### 1. Simulating an Elevator-Style Disk Sweep (`scan-disk-scheduling`) [medium]
- **Topics:** Disk Scheduling
- **Companies:** Microsoft, Seagate
- **Description:** Simulate the elevator-style (SCAN) disk scheduling algorithm and calculate total head movement.

**The problem:**
Simulate an elevator-style sweep. The disk head starts at position 50,
initially moving rightward (toward higher positions). Pending requests:
82, 170, 43, 140, 24, 16, 190. The disk's positions range from 0 to 199.

**Step-by-step approach:**
1. Sort all the requests into two groups: those to the right of the current position, and those to the left.
2. Starting at 50 and moving right, visit each right-side request in increasing order: 82, then 140, then 170, then 190.
3. Continue moving right all the way to the very end of the disk (position 199), even if there's no request exactly there, since the head must physically travel through that point before reversing.
4. Reverse direction and visit each left-side request in decreasing order: 43, then 24, then 16.
5. Add up the total distance travelled: (199 − 50) going right, plus (199 − 16) coming back = 149 + 183 = **332 total units of movement**.

**Quizzes**

1. **Why Go All the Way to 199** [medium]
   *Why does the elevator-style sweep travel all the way to position 199, even though the farthest actual request is only at 190?*
   → Options: To save time, **Because the classic SCAN algorithm sweeps to the physical end of the disk before reversing, regardless of where the last request is**, Because 199 is always a request, To reduce the total number of requests
   *Explanation: Standard SCAN commits to moving to the boundary of the disk before turning around — this is what distinguishes it from the "turn around at the last request" variant.*

2. **Computing Total Movement** [medium]
   *Given the head starts at 50, sweeps right to 199, then left to 16, how is total head movement calculated?*
   → Options: 199 − 16, **(199 − 50) + (199 − 16)**, 190 − 50, (199 − 50) − (199 − 16)
   *Explanation: Total movement is the distance travelled in each direction added together: the rightward leg (199 − 50 = 149) plus the leftward leg (199 − 16 = 183), totaling 332.*

---

### 5. Synchronisation & Deadlocks
- **Slug:** `sync-deadlocks`
- **Category:** os | **Order:** 5 | **Difficulty:** hard
- **Icon:** Shield
- **Description:** How to safely coordinate access to shared resources between processes, and how deadlocks form.

**What is it?**
When multiple processes or threads share a resource — like a file, a
printer, or a shared variable — we need synchronisation to avoid conflicts.
Deadlocks happen when everyone is waiting on someone else's resource, and
nobody can move forward.

---

#### Subtopics

##### 1. Locks and Counting Permits (`semaphores-mutexes`)
**Description:** The basic tools — locks and counting permits — used to make sure shared resources aren't touched unsafely.

**A simple lock (binary lock, sometimes called a mutex):** Has exactly two
states — locked and unlocked. Typically, only whoever locked it is allowed
to unlock it. Used to guarantee that only one thread touches a shared
resource at a time:
1. Before entering the shared section, acquire the lock — if it's already locked, wait until it's free.
2. Do the work that needs exclusive access.
3. Release the lock so someone else can acquire it.

**A counting permit system (counting semaphore):** A generalised version
with a running count, starting at however many identical resources are
available. Useful for managing a *pool* of resources rather than a single
one — for example, allowing up to 5 simultaneous connections.

---

##### 2. Classic Synchronisation Problems (`classic-sync-problems`)
**Description:** Three famous scenarios — producer-consumer, dining philosophers, readers-writers — that expose synchronisation pitfalls.

**Producer-Consumer:** Producers add items to a shared, limited-size
buffer; consumers remove items from it. This needs three coordinating
mechanisms: one tracking how many empty slots remain, one tracking how many
filled slots exist, and one ensuring only one party touches the buffer at a
time.

**Dining Philosophers:** Five people sit around a table with five utensils
between them, and each person needs two utensils to eat. How do you prevent
everyone from grabbing one utensil each and waiting forever for the second?
Common solutions: require picking up both utensils at the exact same time,
or limit how many people are allowed to attempt eating simultaneously.

**Readers-Writers:** Multiple readers can safely read shared data at the
same time, but a writer needs completely exclusive access. Typical
solution: readers may proceed as long as no writer is currently active;
writers wait until all current readers have finished.

---

#### Problems

##### 1. Coordinating Producers and Consumers Safely (`producer-consumer`) [hard]
- **Topics:** Synchronisation
- **Companies:** Google, Meta, Uber
- **Description:** Coordinate multiple producers and consumers sharing a fixed-size buffer without conflicts or deadlocks.

**The problem:**
Multiple producers add items to a shared, fixed-size buffer, while multiple
consumers remove items from it. The solution must avoid conflicts (two
threads touching the buffer at once) and avoid deadlocks (everyone stuck
waiting forever).

**Step-by-step logic:**
1. Keep track of how many empty slots remain in the buffer, and how many filled slots exist.
2. Before a producer adds an item, it must first wait for an empty slot to be available (so the buffer never overflows).
3. Before actually placing the item, the producer must gain exclusive access to the buffer, so no other thread is modifying it at the same moment; it releases that exclusive access immediately after placing the item.
4. Once the item is placed, mark that there's now one more filled slot for a consumer to take.
5. Symmetrically, before a consumer removes an item, it must first wait for a filled slot to be available (so it never reads from an empty buffer), then gain exclusive access, remove the item, release exclusive access, and finally mark that there's now one more empty slot.

**Why this works:**
Waiting for an empty slot stops producers from overflowing the buffer.
Waiting for a filled slot stops consumers from reading nothing. Exclusive
access during the actual add/remove step stops two threads from corrupting
the buffer by touching it at exactly the same instant.

**Quizzes**

1. **Preventing Overflow** [easy]
   *What stops a producer from adding an item when the buffer is already full?*
   → Options: The exclusive-access lock alone, **Waiting for an empty slot to become available before adding anything**, A random delay between additions, Consumers running faster than producers
   *Explanation: The count of empty slots is checked and waited on before a producer adds anything — if there are no empty slots, the producer must wait, which prevents overflow.*

2. **Why Exclusive Access Is Still Needed** [medium]
   *Given that empty/filled slot counts already prevent overflow and underflow, why is exclusive access to the buffer still required during the actual add/remove step?*
   → Options: It isn't required, the slot counts are enough, **To stop two threads from modifying the buffer's contents at the exact same instant and corrupting it**, To make the buffer bigger, To speed up producers
   *Explanation: Slot counts control *when* a producer or consumer is allowed to act, but exclusive access is what prevents two threads from simultaneously writing to or reading from the same buffer position and corrupting its state.*

---

## Programming (General Concepts, Language-Agnostic)

### What is this?
Programming ideas that go beyond DSA — thinking in objects, working with
functions as values, recognising reusable design solutions, and testing and
debugging your work. These concepts apply no matter which language you
happen to be using; the *ideas* transfer even when the exact syntax
doesn't.

---

### 1. Core Programming Building Blocks
- **Slug:** `python-basics`
- **Category:** programming | **Order:** 1 | **Difficulty:** easy
- **Icon:** Terminal
- **Description:** Foundational ideas — transforming collections and understanding variable scope — that exist in nearly every language.

**What is it?**
Before tackling advanced problems, it helps to be comfortable with a few
foundational ideas that exist in essentially every programming language,
even though the exact wording or punctuation differs from one to the next.

---

#### Subtopics

##### 1. Building a New List by Transforming an Existing One (`list-comprehensions`)
**Description:** A concise pattern for turning one collection into another by transforming and optionally filtering its items.

**What it teaches:**
A common, concise pattern: take an existing collection of items, apply some
transformation to each one, optionally skip items that don't meet a
condition, and end up with a brand-new collection.

**The general idea, step by step:**
1. Go through each item in the original collection, one at a time.
2. Optionally, check a condition — if the item doesn't satisfy it, skip it entirely.
3. Otherwise, apply some transformation to the item (like squaring a number).
4. Collect all the transformed items into a new collection, in the same order they were processed.

**Worked example:**
Starting with the numbers 0 through 9, and wanting only the squares of the
even ones: go through each number, keep only the ones that divide evenly by
2, and for each one that survives, square it. The result: 0, 4, 16, 36, 64.

---

##### 2. Functions and Where Variables Live (Scope) (`functions-scope`)
**Description:** How functions organise reusable code, and the rules that decide where a variable can and can't be seen.

**What it teaches:**
A function is a reusable, named block of instructions. "Scope" describes
*where* a variable can actually be seen and used.

**The general rule most languages follow, from narrowest to widest:**
1. **Local** — variables created inside the current function; only that function can see them.
2. **Enclosing** — variables from any function that "wraps around" the current one, if functions are nested inside each other.
3. **Global** — variables defined at the top level, outside any function, visible everywhere in that file.
4. **Built-in** — names the language itself provides automatically, like common utility functions.

**Worked example (concept, not syntax):**
Imagine a variable named `x` set at the very top level of a program. Inside
a function, a *different* variable also named `x` is created — this new one
only exists inside that function and doesn't affect the outer one. If
there's a function nested even further inside, and it creates its own `x`
too, that innermost `x` only affects code within that innermost function.
Once each function finishes, whatever `x` it created disappears, and
whatever version of `x` was visible one level up "reappears" unaffected.

---

#### Problems

##### 1. FizzBuzz (`fizzbuzz`) [easy]
- **Topics:** Control Flow
- **Companies:** Amazon, Google, Microsoft
- **Description:** Print "Fizz," "Buzz," or "FizzBuzz" in place of numbers based on divisibility by 3 and 5.

**The problem:**
Go through the numbers from 1 to n. For every multiple of 3, output "Fizz."
For every multiple of 5, output "Buzz." For every multiple of both 3 and 5,
output "FizzBuzz." Otherwise, output the number itself.

**The key insight:**
Order of checking matters. You must check "is this a multiple of both 3 and
5" *before* checking "is this a multiple of 3 alone," otherwise you'd
mistakenly print just "Fizz" for a number like 15 instead of "FizzBuzz."
The simplest way to check "multiple of both" directly is checking whether
the number divides evenly by 15.

**Step-by-step approach:**
1. Go through each whole number from 1 up to n, one at a time.
2. For the current number, first check: does it divide evenly by 15 (meaning it's a multiple of both 3 and 5)? If so, output "FizzBuzz" and move to the next number.
3. Otherwise, check: does it divide evenly by 3? If so, output "Fizz" and move on.
4. Otherwise, check: does it divide evenly by 5? If so, output "Buzz" and move on.
5. If none of the above apply, just output the number itself.

**Quizzes**

1. **Order of Checks** [easy]
   *Why must the "divisible by 15" check happen before the "divisible by 3" check?*
   → Options: It doesn't matter, checks can be in any order, **Because otherwise a number like 15 would incorrectly print just "Fizz" instead of "FizzBuzz"**, Because 15 is a prime number, Because 3 always comes after 15 numerically
   *Explanation: If the divisible-by-3 check runs first and matches, the code would print "Fizz" and move on, never getting to check divisibility by 5 — checking the combined case (÷15) first avoids this.*

2. **Simplifying the Combined Check** [easy]
   *What's the simplest way to check whether a number is a multiple of both 3 and 5?*
   → Options: Check divisibility by 3 and 5 in two separate steps, then combine results with OR, **Check whether the number divides evenly by 15**, Check whether the number is odd, Check whether the number divides evenly by 8
   *Explanation: Since 15 is the least common multiple of 3 and 5, checking divisibility by 15 directly captures "multiple of both" in a single check.*

---

### 2. Object-Oriented Thinking
- **Slug:** `oop-concepts`
- **Category:** programming | **Order:** 2 | **Difficulty:** medium
- **Icon:** Box
- **Description:** A way of organising code around objects that bundle data and behaviour, built on four core pillars.

**What is it?**
Object-oriented programming is a way of organising code around "objects" —
bundles that combine data (attributes) with the actions that make sense for
that data (behaviours). It helps large codebases stay organised by
modelling real-world things directly in code.

**The four pillars:**
1. **Encapsulation** — bundle data and behaviour together, and hide the internal details other parts of the program don't need to know about.
2. **Abstraction** — expose only the essential features of something, hiding unnecessary complexity behind a simple interface.
3. **Inheritance** — build a new category of object based on an existing one, reusing its behaviour and adding or changing only what's different.
4. **Polymorphism** — let different types of objects respond to the same request in their own appropriate way.

---

#### Subtopics

##### 1. Inheritance & Polymorphism (`inheritance-polymorphism`)
**Description:** How new object categories can reuse and override behaviour from a general "parent" category.

**Inheritance, conceptually:**
Imagine a general category called "Animal" that knows how to "make a
sound," but doesn't specify exactly what sound. More specific categories,
like "Dog" and "Cat," inherit everything general Animals can do, but
override the "make a sound" behaviour with their own specific version
("Woof" for a dog, "Meow" for a cat).

**Polymorphism in action:**
If you have a mixed group containing Dogs and Cats, and you tell every
single one of them to "make a sound," each object automatically produces
its own correct sound — a Dog barks, a Cat meows — even though you gave
exactly the same instruction to all of them. The calling code doesn't need
to know or care which specific type each object is.

##### 2. Encapsulation & Abstraction (`encapsulation-abstraction`)
**Description:** How objects can hide their internal data and expose only a simple, safe way to interact with it.

**Encapsulation, conceptually:**
Imagine a bank account object that keeps its balance hidden from the
outside world. Nobody outside the object can directly change the balance
number by reaching in and editing it. Instead, they must go through
controlled actions the object exposes, like "deposit" — which can include
its own safety checks, such as refusing a deposit of a negative amount.
This protects the internal data from being put into an invalid state by
accident.

**Abstraction, conceptually:**
When you use something like a "deposit" action, you don't need to know
*how* the balance is stored internally, or what checks happen behind the
scenes — you only need to know that calling "deposit" with an amount
increases the balance appropriately. The complexity is hidden behind a
simple, predictable interface.

---

#### Problems

##### 1. Designing a Library Management System (`library-management-system`) [medium]
- **Topics:** Object-Oriented Design
- **Companies:** Amazon, Flipkart
- **Description:** Design a library system with Books, Members, and a Librarian that supports borrowing and late fees.

**The problem:**
Design a library system involving Books, Members, and a Librarian.
Support borrowing, returning, and calculating late fees.

**Conceptual class design:**
- **Book:** knows its title, author, and whether it's currently borrowed.
- **Member:** knows their name and which books they currently have borrowed, and is limited to a maximum number of books at once (say, 5).
- **Librarian:** manages the overall catalogue of books, and handles searching and registering new members.

**Step-by-step logic for borrowing a book:**
1. Check that the requested book actually exists in the catalogue and isn't already borrowed by someone else.
2. Check that the member hasn't already reached their maximum number of borrowed books.
3. If both checks pass, mark the book as borrowed, and add it to that member's list of currently-borrowed books.
4. Record the date it was borrowed, so a late fee can be calculated later if it's returned past the due date.

**Quizzes**

1. **Required Checks Before Borrowing** [easy]
   *What two checks must both pass before a book can be successfully borrowed?*
   → Options: The book's title length and the member's age, **The book must be available (not already borrowed) and the member must not have reached their maximum borrowed-book limit**, The librarian's schedule and the book's publisher, The member's name and the book's page count
   *Explanation: Both conditions guard the system's integrity — lending an already-borrowed book or letting a member exceed their limit would break the design's rules.*

2. **Why Record the Borrow Date** [easy]
   *Why does the system need to record the date a book was borrowed?*
   → Options: To sort books alphabetically, **So a late fee can be calculated later if the book is returned after its due date**, To count total library visits, To register new members
   *Explanation: Late fee calculation depends on knowing how much time has passed since borrowing, which requires the borrow date to be stored.*

---

### 3. Thinking in Functions (Functional Programming Ideas)
- **Slug:** `functional-programming`
- **Category:** programming | **Order:** 3 | **Difficulty:** medium
- **Icon:** Repeat
- **Description:** Treating computation as data transformations — using map, filter, reduce, and functions that remember their context.

**What is it?**
Functional programming treats computation as a series of transformations,
avoiding hidden changes to shared data wherever possible. Very few jobs
require *purely* functional code, but the underlying techniques — like
transforming collections, filtering, and reducing them to a single value —
are genuinely useful everywhere.

---

#### Subtopics

##### 1. Transform, Filter, Combine (`map-filter-reduce`)
**Description:** Three fundamental ways to process a collection — transform every item, keep only some, or boil it down to one value.

**Transform (often called "map"):** Apply the same operation to every item
in a collection, producing a new collection of the same length. For
example, doubling every number in a list of `1, 2, 3, 4` gives `2, 4, 6,
8`.

**Filter:** Keep only the items that satisfy some condition, discarding the
rest. For example, keeping only even numbers from `1, 2, 3, 4` gives `2,
4`.

**Combine (often called "reduce" or "fold"):** Boil an entire collection
down to a single value by repeatedly combining items two at a time. For
example, combining `1, 2, 3, 4` by adding: first combine 1 and 2 to get 3,
then combine that with 3 to get 6, then combine that with 4 to get a final
total of 10.

---

##### 2. Functions That Remember Their Surroundings (Closures) (`closures-hof`)
**Description:** Functions that keep hold of the variables from where they were created, even after that context has finished.

**What it teaches:**
A closure is a function that "remembers" the variables from the place it
was created, even after that surrounding context has technically finished
running.

**Worked example, conceptually:**
Imagine a function whose whole job is to build *other* functions — you give
it a number (say, 2), and it hands you back a brand-new function that
always multiplies whatever it's given by 2. If you ask it again with a
different number (say, 3), it hands you back a *separate* function that
always multiplies by 3 instead. Each of these returned functions
permanently "remembers" its own multiplier, even though the original
function that created it has already finished running.

---

#### Problems

##### 1. Building a Custom "Transform Each Item" Utility (`custom-map-polyfill`) [medium]
- **Topics:** Functional Programming
- **Companies:** Google, Meta
- **Description:** Build your own version of the standard "transform every item" utility, handling gaps correctly.

**The problem:**
Implement your own version of the standard "transform every item in a
collection" utility — one that correctly applies a given transformation to
every item, handles collections with gaps in them, and returns a
brand-new collection without changing the original.

**Step-by-step approach:**
1. Create a new, empty collection with the same length as the original.
2. Go through the original collection position by position.
3. Skip any position that's genuinely empty (a "gap"), rather than treating it as if it held a real value.
4. For every position that does hold a real value, apply the given transformation to it, and store the result in the same position in the new collection.
5. Once every position has been processed, return the new collection — leaving the original completely untouched.

**Quizzes**

1. **Handling Gaps** [medium]
   *What should the custom utility do when it encounters a genuinely empty position ("gap") in the original collection?*
   → Options: Apply the transformation to it anyway, treating it as zero, **Skip it, rather than treating it as if it held a real value**, Stop processing the rest of the collection, Remove the gap and shift later items left
   *Explanation: A correct implementation mirrors the standard behavior of skipping gaps rather than transforming a nonexistent value, which would produce incorrect or misleading results.*

2. **Preserving the Original** [easy]
   *After the utility finishes running, what should be true of the original collection?*
   → Options: It should be transformed in place, **It should remain completely untouched, since a brand-new collection is returned instead**, It should be emptied out, It should be sorted
   *Explanation: The utility is required to return a new collection with the transformed values, leaving the original collection exactly as it was before the call.*

---

### 4. Recognising Reusable Design Solutions
- **Slug:** `design-patterns`
- **Category:** programming | **Order:** 4 | **Difficulty:** hard
- **Icon:** Layers
- **Description:** Well-known, reusable blueprints for common software design problems, like Singleton and Observer.

**What is it?**
Design patterns are well-known, reusable solutions to problems that come up
again and again in software design. Think of them as blueprints you can
adapt to your specific situation, rather than code you copy-paste directly.

---

#### Subtopics

##### 1. Ensuring Only One Instance Exists (Singleton) (`singleton-pattern`)
**Description:** A pattern that guarantees a class has exactly one shared instance across the whole program.

**The idea:**
Guarantee that a particular class only ever has exactly one instance in the
whole program, and provide one shared, well-known way to access it.

**When to use it:**
Situations like a shared configuration manager, a logging system, or a
shared pool of database connections — cases where having *multiple*
independent instances would cause conflicts or wasted resources.

**How it works, step by step:**
1. The very first time anyone asks for an instance, create it and remember it.
2. Every subsequent time anyone asks for an instance, hand back that *same* remembered one instead of creating a new one.
3. As a result, no matter how many different parts of the program ask for it, they're all sharing the exact same underlying instance.

##### 2. Broadcasting Changes to Interested Parties (Observer) (`observer-pattern`)
**Description:** A pattern where interested subscribers are automatically notified whenever something they follow changes.

**The idea:**
Set up a "one-to-many" relationship where, when one object's state
changes, every other object that has expressed interest gets automatically
notified.

**When to use it:**
Event-handling systems, notification services, or updating a user interface
automatically whenever the underlying data changes.

**How it works, step by step:**
1. Interested parties "subscribe" to a particular event by registering themselves.
2. When that event actually happens, the source goes through its list of subscribers one by one and notifies each of them.
3. Any party that's no longer interested can "unsubscribe," so it stops being notified going forward.

---

#### Problems

##### 1. Building an Event Bus (`observer-pattern-event-bus`) [hard]
- **Topics:** Design Patterns
- **Companies:** Google, Meta, Microsoft
- **Description:** Build a shared event bus supporting subscribe, unsubscribe, broadcast, and subscribe-once.

**The problem:**
Build a shared "event bus" that supports subscribing to an event,
unsubscribing, broadcasting an event to all current subscribers, and
subscribing to an event just once (automatically unsubscribing after the
first time it fires).

**Step-by-step approach:**
1. Keep an internal record mapping each event name to the set of handlers currently subscribed to it.
2. **Subscribing:** add the given handler to that event's set of subscribers.
3. **Unsubscribing:** remove the given handler from that event's set of subscribers, if it's there.
4. **Broadcasting:** look up every subscriber currently registered for that event, and call each one in turn, passing along whatever data came with the event.
5. **Subscribing "just once":** wrap the given handler in a helper that, the moment it's triggered, immediately unsubscribes itself before (or after) running the original handler — so it can never fire a second time.

**Quizzes**

1. **Internal Structure** [easy]
   *What internal record does the event bus need to keep in order to support subscribing and broadcasting?*
   → Options: A single global list of all handlers ever created, **A mapping from each event name to the set of handlers currently subscribed to it**, A count of how many times each event has fired, A list of all possible event names in the program
   *Explanation: Broadcasting a specific event requires looking up only the handlers registered for that event, which means the bus must map event names to their own subscriber sets.*

2. **Implementing "Subscribe Once"** [medium]
   *How does a "subscribe once" handler ensure it only ever fires a single time?*
   → Options: It's given a special priority flag, **It's wrapped in a helper that immediately unsubscribes itself the moment it's triggered**, It's stored in a separate list that's cleared after one broadcast, It checks a counter before running each time
   *Explanation: Wrapping the handler lets the bus treat it like any other subscriber, but the wrapper's own logic removes it from the subscriber set as soon as it fires once, preventing further calls.*

---

### 5. Testing & Debugging
- **Slug:** `testing-debugging`
- **Category:** programming | **Order:** 5 | **Difficulty:** medium
- **Icon:** Bug
- **Description:** The skills of confirming code works correctly (testing) and finding out why it doesn't (debugging).

**What is it?**
Testing is how you confirm your code actually works correctly. Debugging is
how you find and fix things when it doesn't. These are two sides of the
same skill, and both are essential no matter which language you write in.

---

#### Subtopics

##### 1. Unit Testing (`unit-testing-pytest`)
**Description:** How to check the smallest testable piece of code in isolation, and reuse shared setup across tests.

**What it teaches:**
A unit test checks the smallest meaningful piece of your code — usually a
single function — in isolation, to confirm it behaves correctly for a given
input.

**The general shape of a unit test:**
1. Set up whatever input or starting conditions the test needs.
2. Run the specific piece of code being tested.
3. Check that the actual result matches the expected result.
4. If it doesn't match, the test fails and flags exactly what went wrong.

**Setup and teardown (often called "fixtures"):**
Sometimes several tests need the same starting conditions — like a sample
piece of data. Rather than repeating that setup in every single test, you
prepare it once in a reusable way, and each test that needs it simply asks
for it.

##### 2. Debugging Strategies (`debugging-strategies`)
**Description:** A systematic, five-step method for tracking down and fixing bugs in any language.

**What it teaches:**
A systematic approach to hunting down bugs, useful in any language:
1. **Reproduce it** — can you make the bug happen reliably, on demand?
2. **Isolate it** — narrow down exactly which part of the code is responsible.
3. **Read carefully** — error messages and stack traces usually point you almost exactly to the problem, if you take the time to read them properly.
4. **Add checkpoints** — temporarily print or log variable values at different points to see where reality diverges from what you expected.
5. **Explain it out loud** — describing the problem step by step to someone else (or even to an inanimate object) often reveals the bug yourself, simply because explaining forces you to slow down and check every assumption.

**Other useful techniques:**
- Narrowing down *when* a bug was introduced by checking earlier versions of the code.
- Divide and conquer: temporarily disable half the code to see if the bug disappears, then narrow further from there.
- Stepping through code one instruction at a time using a debugging tool, watching exactly how values change.

---

#### Problems

##### 1. Measuring Test Coverage (`test-coverage-analyzer`) [hard]
- **Topics:** Testing
- **Companies:** JetBrains, GitHub
- **Description:** Build a tool that reports which functions in a codebase are actually exercised by tests.

**The problem:**
Build a tool that looks at a piece of source code and reports which of its
functions are actually being exercised by tests, and which aren't.

**Step-by-step approach:**
1. Scan through the source code and make a complete list of every function that's defined in it.
2. While the tests run, keep a separate record of every function that actually gets called during that run.
3. Compare the two lists: any function that was defined but never appeared in the "actually called" list is uncovered.
4. Calculate a coverage percentage: the number of functions that were called, divided by the total number of functions defined, expressed as a percentage.
5. Report the percentage, along with the specific names of any uncovered functions, so they can be prioritised for new tests.

**Quizzes**

1. **Identifying Uncovered Functions** [easy]
   *How does the tool determine which functions are "uncovered"?*
   → Options: Functions with the longest names, **Functions that were defined in the source code but never appeared in the record of functions actually called during test runs**, Functions that raise errors, Functions that are called more than once
   *Explanation: Coverage is about the gap between what's defined and what's actually exercised — comparing the full function list against the "called during tests" list reveals exactly which ones were never run.*

2. **Calculating Coverage Percentage** [easy]
   *If a codebase has 20 defined functions and 15 of them were called during testing, what is the coverage percentage?*
   → Options: 20%, 33%, **75%**, 100%
   *Explanation: Coverage percentage = (functions called ÷ total functions defined) × 100 = (15 ÷ 20) × 100 = 75%.*

---

## Languages

1. **Python** (`python`) — 🐍 — Active
   The most popular language for DSA and general programming. Readable, expressive, and backed by a huge ecosystem of tools and libraries.

2. **JavaScript** (`javascript`) — 🟨 — Active
   The language of the web. Runs in every browser and is essential for frontend development.

3. **Java** (`java`) — ☕ — Active
   A strongly-typed, enterprise staple, widely used in large organisations and runs on the Java Virtual Machine.

4. **C++** (`cpp`) — ⚡ — Active
   A high-performance systems language, used for game engines, browsers, and competitive programming.

5. **SQL** (`sql`) — 🗄️ — Active
   The language of databases. Not a general-purpose language, but essential for anyone working with data.

---

## Notes on this rewrite

- **Hierarchy is now strict:** Lesson → Subtopics → Problems, with
  **Quizzes nested inside each Problem** rather than floating at the lesson
  level. Every quiz question tests understanding of that specific problem's
  logic, approach, complexity, or edge cases — not generic lesson-wide
  trivia.
- Every **lesson**, **subtopic**, and **problem** still has a one-line
  **Description** field right under its metadata — short enough to use as
  card/preview text in the UI, distinct from the fuller explanation that
  follows it.
- Every subtopic and problem walkthrough explains the **logic** in
  numbered, plain-English steps that don't depend on knowing any particular
  programming language's syntax.
- All code blocks remain step-by-step descriptions of *what happens and
  why*, so the content tests correctly regardless of which language a
  student later chooses to implement it in.
- Difficulty levels, slugs, categories, icons, topics, and companies were
  left unchanged from the source data so they still map cleanly onto the
  existing schema. Each lesson's original 2 quiz questions were converted
  into 2 problem-specific quiz questions attached to that lesson's single
  problem — if a lesson later gets more problems, each new problem should
  get its own quiz pair rather than sharing one at the lesson level.