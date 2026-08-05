# Aptitude Learning Document — Simplification & Approximation

> A comprehensive, student-friendly guide to the speed layer of every quantitative paper — BODMAS, mental-math shortcuts, and the fine art of knowing when "good enough" is exactly right.
> Master the order of operations so no bracket can trick you, then learn to round like a pro and beat the clock on every section.

---

# 2. Simplification & Approximation

> **Lesson Overview:** Almost every quantitative section starts with 3–5 "simplify this" questions. They look easy — and they are — but they're engineered to punish students who ignore the order of operations or compute unnecessarily. This lesson gives you the exact battle plan: BODMAS for expression surgery, then approximation for the speed round.
> - **Category:** Quantitative Aptitude
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 2.1 BODMAS & Simplification

### The One Rule That Decides Everything

An expression like `6 + 4 × 5 − 2` has two possible answers depending on what you do first:

- Do addition first: (6 + 4) × 5 − 2 = 50 − 2 = 48 ❌
- Do multiplication first: 6 + 20 − 2 = **24** ✅

Same numbers, same symbols — different answers. The **BODMAS** rule is the universally agreed order that makes arithmetic a science, not an argument:

| Letter | Operation | Example |
|---|---|---|
| **B** | Brackets (solve from innermost to outermost) | (2 + 3)² → 5² |
| **O** | Order (powers and roots, "of" means ×) | 2³, √49, ½ of 8 |
| **D** | Division | 18 ÷ 3 |
| **M** | Multiplication | 6 × 2 |
| **A** | Addition | 7 + 9 |
| **S** | Subtraction | 15 − 4 |

**Fun mnemonic:** *Big Oranges Do Make Amazing Samosas* — B, O, D, M, A, S.

### The Three Rules Inside BODMAS

**Rule 1 — Brackets are solved from the INSIDE out.**
An expression may contain round ( ), curly { } and square [ ] brackets. Solve the innermost bracket completely (using BODMAS inside it) before touching anything outside it.

**Rule 2 — Division and Multiplication are SAME priority — go left to right.**
18 ÷ 3 × 2 = (18 ÷ 3) × 2 = 6 × 2 = **12**. Do NOT "multiply first because M comes after D": D and M are a single level, decided by whichever appears first when scanning left to right. Same for A and S: 20 − 5 + 3 = (20 − 5) + 3 = **18**, not 20 − 8.

**Rule 3 — "Of" is multiplication in disguise.**
"½ of 16" means ½ × 16 = 8. In expressions like `3 + ½ of 16 − 4`, the "of" is solved with the O/M level: 3 + 8 − 4 = 7.

### Worked Example — Full BODMAS Run

Simplify: `12 + 6 × 2 − 18 ÷ 3 + (4 + 2 × 3)`

```
Step 0:  12 + 6 × 2 − 18 ÷ 3 + (4 + 2 × 3)
Step 1:  Brackets first — inside them, × before +:
         (4 + 2 × 3) = 4 + 6 = 10
Step 2:  Now the expression is:  12 + 6 × 2 − 18 ÷ 3 + 10
Step 3:  Division & multiplication, left to right:
         6 × 2 = 12       18 ÷ 3 = 6
Step 4:  Addition & subtraction, left to right:
         12 + 12 − 6 + 10 = 24 − 6 + 10 = 18 + 10 = 28
Answer:  28 ✓
```

### Bracket Depth — Innermost First

Simplify: `25 − [12 + (7 − 4)] × 2`

```
Step 1:  Innermost (7 − 4) = 3
Step 2:  [12 + 3] = 15
Step 3:  25 − 15 × 2 = 25 − 30 = -5
Answer:  -5 ✓   (multiplication before subtraction — always)
```

### Powers and Roots ("O") in Expressions

`(3 + 2)² − √(25) + 2³`

```
Step 1:  Bracket: (3 + 2)² = 5² = 25
Step 2:  O:  √25 = 5, and 2³ = 8
Step 3:  25 − 5 + 8 = 28
Answer:  28 ✓
```

### Quick Mental Powers (Memorise the Squares)

| Square | Value | | Square | Value |
|---|---|---|---|---|
| 11² | 121 | | 16² | 256 |
| 12² | 144 | | 17² | 289 |
| 13² | 169 | | 18² | 324 |
| 14² | 196 | | 19² | 361 |
| 15² | 225 | | 20² | 400 |

Cubes worth remembering: 2³=8, 3³=27, 4³=64, 5³=125, 6³=216, 10³=1000.

### Common Traps

❌ **"Division before multiplication because D comes before M"** — WRONG. They share one priority level; go left to right.
❌ **"Addition before subtraction"** — same trap. Left to right.
❌ **Solving brackets but forgetting to keep their value**: `(4 + 2 × 3)` must become a single number (10) before the outside math starts.
❌ **Treating "of" as +**: "½ of 16" is ×, never +.
❌ **Skipping steps in your head on two-mark questions** — the whole point of BODMAS questions is to catch careless students.

### Quick Self-Test (answers at the bottom)

1. 6 + 4 × 5 − 2 = ? (a) 48  (b) 24  (c) 30  (d) 40
2. 18 ÷ 3 × 2 = ? (a) 12  (b) 3  (c) 8  (d) 27
3. 100 ÷ 4 × 5 = ? (a) 5  (b) 80  (c) 125  (d) 500
4. In `25 − 6 × 3 + (8 − 5)²`, which operation happens FIRST? (a) 25 − 6  (b) 6 × 3  (c) 8 − 5  (d) 3 + 8
5. Simplify: `3 + ½ of 16 − 4` (a) 6  (b) 7  (c) 11  (d) 15

**Answers:** 1→b (6 + 20 − 2 = 24), 2→a (18÷3=6, 6×2=12), 3→c (100÷4=25, 25×5=125), 4→c (brackets first), 5→b (3 + 8 − 4 = 7).

### Key Takeaway

BODMAS is non-negotiable: **Brackets → Order → (÷ and × left to right) → (+ and − left to right)**. Write each step on paper, and never let "D before M" superstition rob you of easy marks.

---

## 2.2 Approximation Techniques

### The Idea: Exactness Is Expensive

In exam questions with **answer options far apart**, you almost never need the exact answer — you need the closest one. Approximation trades a tiny bit of precision for a huge gain in speed. A question that takes 60 seconds exactly takes 10 seconds approximately.

**The golden rule of approximation:** only round if the options are comfortably far apart. If options are close (49, 50, 51), calculate carefully; if they're 45, 50, 55 — round freely.

### Technique 1 — Round to the Nearest Convenient Number

Replace awkward numbers with round ones close by:

| Awkward | Round to | Why |
|---|---|---|
| 899 | 900 | 1 away, clean multiples |
| 1,195 | 1,200 | 5 away, 12 and 15 both divide 1,200 |
| 79.7 | 80 | clean tens |
| 12.4 | 12 | clean dozen |

**Example:** 37% of 899 ≈ 37% of 900 = 0.37 × 900 = **333**. (Exact: 332.63 — error is 0.37!)

### Technique 2 — Percent → Fraction Equivalents (The Speed Table)

| Percent | Fraction | Percent | Fraction |
|---|---|---|---|
| 10% | 1/10 | 33⅓% | 1/3 |
| 12.5% | 1/8 | 37.5% | 3/8 |
| 20% | 1/5 | 40% | 2/5 |
| 25% | 1/4 | 60% | 3/5 |
| 30% | 3/10 | 66⅔% | 2/3 |

**Example:** 25% of 720 = 720 ÷ 4 = **180** — no multiplication needed.

### Technique 3 — Compatible Numbers in Division

When dividing, round the top and bottom so the bottom divides the top cleanly:

**Example:** (36% of 1195 + 41% of 795) ÷ 14 ≈ ?

```
36% of 1195 ≈ 36% of 1200 = 432
41% of 795  ≈ 41% of 800  = 328
Sum ≈ 432 + 328 = 760
760 ÷ 14 = 54.28 → ≈ 54
```

(Exact answer: 54.01 — the estimate nails it.)

### Technique 4 — Two-Digit Multiply Cheats

- **Square ending in 5:** 35² = 3 × 4, then "25" → 1225. 65² → 6×7 = 42, then 25 → 4225.
- **×11:** 53 × 11 → split 5 and 3, insert their sum: 5 (5+3) 3 = 583.
- **×25:** multiply by 100, divide by 4. 68 × 25 = 6800 ÷ 4 = 1700.

### Worked Example — A Full Speed Round

Estimate: `(31% of 899 + 19% of 620) − 200`

```
31% of 899 ≈ 31% of 900 = 279
19% of 620 ≈ 20% of 600 = 120        (both rounded, one up one down — errors cancel)
279 + 120 − 200 = 199 → ≈ 200
```

(Exact: 278.69 + 117.8 − 200 = 196.49 — error of 3.5 on a 200 scale; options at 180/200/220 → 200 ✓)

**Pro tip — round one number up and the other down.** When two values get rounded, deliberately round one up and one down so the errors partially cancel instead of stacking.

### Common Traps

❌ **Rounding when options are close together** (49, 50, 51) — an error of 1 flips the answer.
❌ **Rounding only one side:** (31% of 899 + 19% of 620) — rounding both numbers UP stacks the error.
❌ **Approximating in the wrong direction on ratios** — always ask: does my rounding make the answer bigger or smaller?
❌ **Forgetting the fraction table** — 12.5%, 25%, 33⅓% appear constantly; converting to fractions is 10× faster than multiplying decimals.

### Quick Self-Test (answers at the bottom)

1. 31% of 900 ≈ ? (a) 270  (b) 279  (c) 290  (d) 300
2. 499 × 0.6 ≈ ? (a) 280  (b) 290  (c) 300  (d) 310
3. 27.9 × 3.1 ≈ ? (a) 75  (b) 84  (c) 90  (d) 100
4. Which of these is 33⅓% of 240? (a) 60  (b) 80  (c) 90  (d) 120
5. Estimate: (24% of 1249) ÷ 10 ≈ ? (a) 25  (b) 30  (c) 35  (d) 40

**Answers:** 1→b (0.31 × 900 = 279), 2→c (500 × 0.6 = 300), 3→b (28 × 3 = 84), 4→b (240 ÷ 3 = 80), 5→b (25% of 1250 = 312.5, ÷10 = 31.25 → 30).

### Key Takeaway

Approximation is a speed skill, not a guessing game: **round to convenient numbers, lean on percent→fraction shortcuts, cancel rounding errors by rounding one side up and the other down, and only round when the options are far apart.** Exactness is expensive — spend it only when you must.

---

# 2. Problems

## 2.1 Simplify a Complex Expression

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | BODMAS & Simplification |
| **Companies** | Wipro, Accenture |

### Problem Statement

Simplify the following expression using BODMAS, showing each step:

```
12 + 6 × 2 − 18 ÷ 3 + (4 + 2 × 3)
```

### Step-by-Step Solution

**Step 1 — Solve the bracket first (B), and inside it, multiplication before addition (M before A):**

```
(4 + 2 × 3) = 4 + 6 = 10
```

**Step 2 — Rewrite the expression with the bracket resolved:**

```
12 + 6 × 2 − 18 ÷ 3 + 10
```

**Step 3 — Division and multiplication, left to right (D then M):**

```
6 × 2  = 12
18 ÷ 3 = 6
```

**Step 4 — Addition and subtraction, left to right (A then S):**

```
12 + 12 − 6 + 10
 = 24 − 6 + 10
 = 18 + 10
 = 28
```

### Answer

| Step | Result |
|---|---|
| Bracket | (4 + 2 × 3) = 10 |
| Final value | **28** |

### Trap to Remember

The bracket contains its own multiplication: `4 + 2 × 3` is 4 + 6 = 10 — NOT (4 + 2) × 3 = 18. BODMAS applies inside brackets too.

---

## 2.2 Approximate the Value of an Expression

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Approximation Techniques |
| **Companies** | TCS, Infosys |

### Problem Statement

Estimate the value of the expression below to the nearest whole number, and choose the closest option:

```
(36% of 1195 + 41% of 795) ÷ 14
```

Options: (a) 50  (b) 54  (c) 58  (d) 62

### Step-by-Step Solution

**Step 1 — Round each number to a convenient neighbour:**

```
1195 → 1200     (4% easier: 1200 × 36% is clean)
 795 →  800     (800 × 41% is clean)
```

**Step 2 — Compute each percentage:**

```
36% of 1200 = 0.36 × 1200 = 432
41% of  800 = 0.41 ×  800 = 328
```

**Step 3 — Add, then divide:**

```
432 + 328 = 760
760 ÷ 14 = 54.28 → ≈ 54
```

**Step 4 — Compare with options:**

```
(a) 50   (b) 54   (c) 58   (d) 62   →  closest is 54
```

### Answer

| Question | Answer |
|---|---|
| Approximate value | **54** |
| Option | **(b) 54** |
| Exact check | (0.36×1195 + 0.41×795) ÷ 14 = 756.15 ÷ 14 = 54.01 ✓ |

### Why Rounding This Way Is Safe

1195 rounded UP by 5 and 795 rounded UP by 5 — both estimates run high, yet the final error is just 0.27 on the whole expression. Even when errors stack, a 54.28 estimate vs a 54.01 exact answer means option (b) is picked with complete confidence — and in a fraction of the time.

### Trap to Remember

If the options had been 53, 54, 55, the rounding shortcut would be too risky — with options a whole number apart, round as much as you like.

---

*Happy studying! — TheWebytes Aptitude Team*
