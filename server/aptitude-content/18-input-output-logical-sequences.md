# Aptitude Learning Document — Input-Output & Logical Sequences

> A simple, student-friendly guide to machine reasoning — "Input: 42 17 85 23 56, the machine sorts ascending one number per step: what comes after Step 2?" — and everyday order — "Arrange Application, Offer, Interview, Joining, Shortlisting in a logical order."
> Two tools: the one-element-per-step rule for machines, and the Sandwich Method for events (first event and last event first, the middle fills itself).

---

# 18. Input-Output & Logical Sequences

> **Lesson Overview:** **Input-Output** questions show a machine rearranging an input step by step — you find the one rule and trace the remaining steps. **Logical Sequence** questions list events out of order — you rebuild the natural timeline.
> - **Category:** Logical Reasoning
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 18.1 Input-Output Reasoning

### The Simple Idea

A machine takes an input — numbers, words, or both — and rearranges it in steps. Every step follows **exactly one rule**, and the machine moves **exactly one element** per step. Find the rule from the first two steps, and every later step predicts itself.

> **The Golden Rule: one rule, one element, one step.** The machine is not chaotic — it is the most patient sorter in the world. It moves a single item to its final place, then repeats.

### The Machine Rulebook (Common Patterns)

| Pattern | What the machine does | Example |
|---|---|---|
| Ascending | Smallest number first, one per step | 42 17 85 → 17 42 85 |
| Descending | Biggest number first, one per step | 42 17 85 → 85 42 17 |
| Alphabetical | A-word first (or last), one per step | Cat Dog Ant → Ant Cat Dog |
| Mixed | Two rules at once (e.g. numbers descending, words alphabetically) | Words and numbers each move on their own track |

### The Trace Method

```
Step 1: read steps 1 and 2 — identify WHICH element moved and WHERE it went
Step 2: that element is now "locked" — never moves again
Step 3: trace the remaining steps in your head, locking one element each time
Step 4: for "after N steps" questions, count the locked elements
```

### Worked Example — The Sorting Machine

**Question:** Input: `42 17 85 23 56`. A machine rearranges the numbers in ascending order, moving exactly one number per step.

```
Input :  42  17  85  23  56
Step 1 : 17  42  85  23  56      (17 — the smallest — locks at the front)
Step 2 : 17  23  42  85  56      (23 locks in seat 2)
Step 3 : 17  23  42  56  85      (56 locks in seat 4)
Step 4 : 17  23  42  56  85      (85 is already in place — machine stops)
```

**After Step 2 the input is: `17 23 42 85 56`.** The machine finishes in 3 working steps (Step 4 changes nothing).

### The "Already-Placed" Trap

Sometimes an element is already in its final seat — the machine skips it. `85 17 42 23 56` needs only 3 moves to become `17 23 42 56 85`: 17 to front, 23 to seat 2, 56 to seat 4. The last number always lands for free.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Moving two elements at once | "17 and 23 both go" | One element per step — count them |
| Rearranging everything | Rewriting the whole input each step | Lock one element; the rest stay put |
| Wrong direction | Ascending done as descending | Name the rule out loud first |
| Counting the final step twice | 3 moves reported as 4 | The machine stops when sorted |

### Quick Self-Test (answers at the bottom)

1. Input `42 17 85 23 56`, ascending one per step. After Step 2 — (a) 17 23 42 85 56  (b) 17 42 85 23 56  (c) 17 23 85 42 56  (d) 23 17 42 85 56
2. Input `15 08 23 09 45`, descending one per step. After Step 1 — (a) 45 15 08 23 09  (b) 08 15 23 09 45  (c) 15 08 23 09 45  (d) 45 08 23 09 15
3. How many working steps to sort `42 17 85 23 56` ascending? — (a) 2  (b) 3  (c) 4  (d) 5
4. How many elements does the machine move per step? — (a) 1  (b) 2  (c) 3  (d) all of them
5. Input `85 17 42 23 56` ascending — the element already in place is — (a) 17  (b) 42  (c) 85  (d) 23

**Answers:** 1→a, 2→a, 3→b, 4→a, 5→c.

### Key Takeaway

Input-Output machines move one element per step under one rule. Lock each moved element in place, trace the rest in your head, and count the working steps — the last element always lands for free.

---

## 18.2 Logical Sequence of Events

### The Simple Idea

Events in a question are listed out of order; your job is the natural timeline. Every process has a **first event** (nothing comes before it) and a **last event** (nothing comes after it) — find those two, and the middle orders itself.

> **The Golden Rule: the sandwich is made from the outside in.** Lock the first and last events first. The middle can only arrange itself one way.

### The Sandwich Method

```
Step 1: find the FIRST event — nothing can happen before it
        (you cannot be interviewed before you apply)
Step 2: find the LAST event — nothing can happen after it
        (the offer letter is not the end; joining is)
Step 3: the middle events order themselves between the two ends
Step 4: read the full sequence aloud — it must sound like a story
```

### Worked Example — The Job Process

**Question:** Arrange in a logical order — 1. Application  2. Offer letter  3. Interview  4. Joining  5. Shortlisting

```
Step 1 — the FIRST event:
nothing precedes Application → 1 first

Step 2 — the LAST event:
nothing follows Joining → 4 last

Step 3 — the middle:
Shortlisting follows the application
Interview follows shortlisting
Offer letter follows the interview

Step 4 — the story:
Application → Shortlisting → Interview → Offer letter → Joining

Order: 1, 5, 3, 2, 4
```

### The Timeline Toolkit (Common Life Cycles)

| Domain | First event | Middle | Last event |
|---|---|---|---|
| Job process | Application | Shortlisting → Interview → Offer | Joining |
| Buying a house | Searching | Loan approval → Agreement → Registration | Moving in |
| Cooking | Buying ingredients | Mixing → Baking | Serving |
| Exam day | Admit card | Exam → Results | Counselling |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Starting mid-process | Interview placed first | Nothing precedes Application — check every "first" |
| Ending early | Offer treated as the end | Joining, not the offer, closes the process |
| Jumping ahead | Interview before shortlisting | Read each pair: can B happen before A? |
| Ignoring the story test | Technically ordered, reads oddly | Read it aloud — stories don't skip chapters |

### Quick Self-Test (answers at the bottom)

1. Logical order of: 1. Application  2. Offer  3. Interview  4. Joining  5. Shortlisting — (a) 1, 5, 3, 2, 4  (b) 1, 3, 5, 2, 4  (c) 5, 1, 3, 2, 4  (d) 1, 5, 2, 3, 4
2. Logical order of: 1. Bake  2. Buy flour  3. Eat  4. Mix  5. Serve — (a) 2, 4, 1, 5, 3  (b) 4, 2, 1, 5, 3  (c) 2, 1, 4, 5, 3  (d) 2, 4, 5, 1, 3
3. In a job process, the FIRST event is — (a) Interview  (b) Application  (c) Offer  (d) Joining
4. In a job process, the LAST event is — (a) Application  (b) Shortlisting  (c) Offer  (d) Joining
5. The Sandwich Method says — (a) Find the first and last events first  (b) Order the middle first  (c) Pick any event to start  (d) Skip the story test

**Answers:** 1→a, 2→a, 3→b, 4→d, 5→a.

### Key Takeaway

Logical sequences are timelines rebuilt from the ends: first event and last event first, middle fills itself, story test last. If the sequence doesn't read like a story, it isn't the answer.
