# Aptitude Learning Document — Data Sufficiency

> A student-friendly guide to the one DI topic where you never find the answer — you only decide whether the data is enough to find it. Two tools: the **Sufficiency Test** (is it Unique, Complete, Clean?) and the **Five-Code Answer Grid** (A–E) that every two-statement question is graded against.
> Both chapters share the same two-statement format and the same five answer codes — learn the codes once, and every sufficiency question is the same ritual.

---

# 27. Data Sufficiency

> **Lesson Overview:** In **data sufficiency** you are given a question plus two numbered statements (I and II), and you must choose which combination of data — I alone, II alone, each alone, together, or never — is enough to answer uniquely. The skill is not arithmetic speed but **data triage**: recognising exactly when information becomes sufficient.
> - **Category:** Data Interpretation
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 27.1 Data Sufficiency Basics

### The Simple Idea

Every data sufficiency question has the same anatomy — a question, and two statements labelled I and II. **You never have to solve for the answer; you only have to say whether the data can produce one.** Enough = exactly one clean answer. Not enough = more than one possible answer, or none at all.

> **The Golden Rule: sufficiency is about UNIQUENESS, not solvability.** A question is "sufficient" only when the data forces one and exactly one answer. If two different numbers both fit the facts, the data is insufficient every time.

### The Five-Code Answer Grid (Memorise This)

Every question ends with the same five options. Learn the codes in one order — I-first, then II, then combined:

```
(A)  Statement I ALONE is sufficient,
     Statement II alone is NOT

(B)  Statement II ALONE is sufficient,
     Statement I alone is NOT

(C)  EACH statement ALONE is sufficient

(D)  BOTH statements TOGETHER are needed

(E)  Even TOGETHER, the statements are
     NOT sufficient
```

### The Sufficiency Test (Three Questions for Every Answer)

Ask these three questions of any "answer" you believe the data gives:

```
┌──────────────────────────────────────────────────────┐
│  1. UNIQUE — does the data force exactly ONE         │
│     answer? (no second possibility lurking)          │
├──────────────────────────────────────────────────────┤
│  2. COMPLETE — does the data use everything needed,  │
│     or is a known quantity still missing?            │
├──────────────────────────────────────────────────────┤
│  3. CLEAN — am I assuming facts that were not        │
│     stated? (positivity? integers?)                  │
└──────────────────────────────────────────────────────┘
```

### The Triage Order (Test Statements One at a Time)

```
STEP 1  TEST I ALONE — can it force a unique answer?
              YES → lean A or C, then check II alone
              NO  → set it aside, move to II

STEP 2  TEST II ALONE — same question for II

STEP 3  IF NEITHER alone → COMBINE both and re-test
        uniqueness on the merged facts

STEP 4  NAME the code from the Five-Code Grid
```

### Worked Example 1 — How Old Is Rani?

**Question:** How old is Rani?
- **I.** Rani is twice as old as her son.
- **II.** Her son is 10 years old.

```
STEP 1  I ALONE: "twice as old" — infinite ages fit
        (son 5 → Rani 10, son 8 → Rani 16...)  →  NOT alone

STEP 2  II ALONE: "son is 10" — still infinite Rani
        ages (she could be any age with a 10-year-old!)
        →  NOT alone

STEP 3  COMBINE: son = 10, Rani = 2 × 10 = 20
        → exactly ONE age  ✓ UNIQUE ✓ COMPLETE ✓ CLEAN ✓

STEP 4  CODE: both statements together are needed → (D)
```

**Why this is tricky:** statement II looks powerful on its own, but it is only about the son — Rani's age stays unknown until I joins it. Sufficiency is about the QUESTION's variable, not just any number in the data.

### Worked Example 2 — Find the Value of x

**Question:** What is the value of x?
- **I.** x + y = 15
- **II.** y = 7

```
I ALONE: one equation, two unknowns → infinite pairs → NO
II ALONE: y = 7 says nothing about x → NO
COMBINE: x + 7 = 15 → x = 8 → exactly one ✓ → (D)
```

**The two-variables-one-equation trap lives here:** a single equation with two letters never produces a unique answer — you need a second independent fact.

### Worked Example 3 — Is N Even?

**Question:** Is the number N even?
- **I.** N is divisible by 6.
- **II.** N > 100.

```
I ALONE: divisible by 6 means divisible by 2 → N is
        ALWAYS even → YES, uniquely → sufficient

II ALONE: N > 100 — a number over 100 can be even or
        odd → NOT sufficient

CODE: statement I alone is sufficient → (A)
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Solving instead of deciding | A correct arithmetic answer to the wrong question | The task is to pick a CODE, not an answer |
| The silent assumption | Assuming N is an integer when not stated | Run the CLEAN check before trusting |
| One equation, two unknowns | "x + y = 15" called enough | One equation with two letters = not unique |
| Irrelevant extras | "N > 100" added to a divisibility question | Extra true data is not automatically useful |
| 0 and 1 special cases | Forgetting 0 is even, 1 is odd | Test the boundary, not just the middle |

### Quick Self-Test (answers at the bottom)

Use the codes: (A) I alone · (B) II alone · (C) each alone · (D) together · (E) never.

1. **What is x?** I. x + y = 15. II. y = 7. — (a) A  (b) B  (c) C  (d) D  (e) E
2. **Is N even?** I. N is divisible by 6. II. N > 100. — (a) A  (b) B  (c) C  (d) D  (e) E
3. **How old is Rani?** I. Twice her son's age. II. Son is 10. — (a) A  (b) B  (c) C  (d) D  (e) E
4. **What is the unit digit of p?** I. p is a multiple of 5. II. p is odd. — (a) A  (b) B  (c) C  (d) D  (e) E
5. A question is "sufficient" only when the data gives — (a) a long answer  (b) exactly one answer  (c) the biggest answer  (d) any answer at all

**Answers:** 1→d, 2→a, 3→d, 4→d (unit digit 0 or 5 from I; odd from II → together → 5 uniquely), 5→b.

### Key Takeaway

Data sufficiency is data triage — test statement I alone, then II alone, then the combination, and grade the result against the five-code grid. Sufficient means exactly one clean, unassumed answer, and the biggest sufficiency killers are assumptions and two-variable equations.

---

## 27.2 Two-Statement Analysis

### The Simple Idea

This is the "exam version" of sufficiency — the question comes with exactly two labelled statements, I and II, and the answer is one of the five codes. **The skill is a ritual: test I, test II, combine if needed, name the code.** When both statements look strong, the winner is decided by uniqueness.

> **The Golden Rule: combination is a last resort, and it must be tested for uniqueness like everything else.** Two statements together can still fail to be enough — "both are about the same unknowns in a circle" is the classic hidden failure.

### The Recursive Flow (Same Every Time)

```
STEP 1  TEST I ALONE        → sufficient? → note it (A-target or C)
STEP 2  TEST II ALONE       → sufficient? → note it (B-target or C)
STEP 3  IF both alone fail  → COMBINE the facts
STEP 4  RE-TEST uniqueness  → if still 2+ answers → (E)
```

### The Five-Code Quick Table

| What I alone does | What II alone does | Correct code |
|---|---|---|
| Sufficient | Not sufficient | **(A)** |
| Not sufficient | Sufficient | **(B)** |
| Sufficient | Sufficient | **(C)** |
| Not sufficient | Not sufficient, but together they are | **(D)** |
| Not sufficient | Not sufficient, and together they still fail | **(E)** |

### Worked Example 1 — Find the Two-Digit Number (The Combined-Failure)

**Question:** What is the two-digit number?
- **I.** The sum of its digits is 9.
- **II.** The number is divisible by 5.

```
STEP 1  I ALONE: digits sum to 9 → 18, 27, 36, 45, 54,
        63, 72, 81, 90 → NINE candidates → NOT alone

STEP 2  II ALONE: divisible by 5 → 10, 15, 20, ..., 95
        → NINE+ candidates → NOT alone

STEP 3  COMBINE: divisible by 5 → unit digit 0 or 5.
        Sum of digits 9:
            unit 0 → tens 9 → 90
            unit 5 → tens 4 → 45
        TWO candidates survive: 45 and 90!

STEP 4  RE-TEST uniqueness: two valid numbers → FAILS
        CODE: even together, insufficient → (E)
```

**The lesson:** a combination is not automatically sufficient. Whenever the survivors are few but plural, the code is E.

### Worked Example 2 — Priya's Age (The Clean Combination)

**Question:** What is Priya's age?
- **I.** Priya is 5 years older than her brother.
- **II.** The sum of their ages is 35.

```
STEP 1  I ALONE: P = B + 5 → infinite B-ages → NOT alone
STEP 2  II ALONE: P + B = 35 → still two unknowns → NOT alone
STEP 3  COMBINE: P = B + 5 and P + B = 35

        B + 5 + B = 35 → 2B = 30 → B = 15, P = 20

STEP 4  Exactly one age → CODE: together are needed → (D)
```

### Worked Example 3 — The Same-Fact Trick

**Question:** What is the value of k?
- **I.** k + 3 = 11
- **II.** k = 12 − 4

```
STEP 1  I ALONE: k = 8 → sufficient
STEP 2  II ALONE: k = 8 → sufficient (different words,
        same fact!)
STEP 3  CODE: each alone is sufficient → (C)
```

**The Same-Fact Trick:** when I and II are the same relationship restated, they cannot combine to make the answer stronger. Restating a fact (C) is not the same as adding a fact (D).

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Combining early | Combining when I alone already suffices | Test I alone BEFORE combining |
| The restate trap | Calling the same fact "together" | Same relation twice = (C) at best, never a stronger code |
| Un-checked combination | Declaring (D) without listing survivors | List every surviving answer before choosing (D) vs (E) |
| Last-digit blindness | Forgetting 90 for "divisible by 5" | Unit 0 is a valid divisor case |
| Answer-driven solving | Trying to find the number, not the code | The question asks WHICH DATA, not the value |

### Quick Self-Test (answers at the bottom)

Use the codes: (A) I alone · (B) II alone · (C) each alone · (D) together · (E) never.

1. **Two-digit number?** I. Digit sum is 9. II. Divisible by 5. — (a) A  (b) B  (c) C  (d) D  (e) E
2. **What is Priya's age?** I. 5 years older than brother. II. Sum of ages is 35. — (a) A  (b) B  (c) C  (d) D  (e) E
3. **Value of k?** I. k + 3 = 11. II. k = 12 − 4. — (a) A  (b) B  (c) C  (d) D  (e) E
4. **Value of p?** I. p + q = 12. II. q = 4. — (a) A  (b) B  (c) C  (d) D  (e) E
5. Two statements together produce two surviving answers — the code is — (a) C  (b) D  (c) E  (d) A

**Answers:** 1→e, 2→d, 3→c, 4→d, 5→c.

### Key Takeaway

Two-statement analysis is a fixed ritual — test I alone, test II alone, combine only if both fail, then re-test the combination for uniqueness before naming a code. Combinations can fail, restated facts never strengthen — and the correct code comes from the survivors you can list, not the answer you can compute.