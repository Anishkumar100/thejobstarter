# Aptitude Learning Document — Number Systems & HCF-LCM

> A comprehensive, student-friendly guide to the foundation of all quantitative aptitude — divisibility rules, number properties, and the two great workhorses HCF and LCM.
> Master the sum-of-digits rule for 3 and 9, spot factors instantly, and connect HCF to LCM with one golden formula.

---

# 1. Number Systems & HCF-LCM

> **Lesson Overview:** Every quantitative section starts here. Divisibility rules let you check "does 3 divide this number?" in two seconds flat, and HCF/LCM questions appear in almost every campus test series. Nail this lesson and the rest of arithmetic (percentages, ratio, time & work) gets easier, because they all reuse these ideas.
> - **Category:** Quantitative Aptitude
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 1.1 Divisibility Rules & Number Properties

### Why Divisibility Rules Matter

A **divisibility rule** is a quick mental check that tells you whether one number divides another **exactly** — without doing the long division. In an exam, saving two minutes on every number-based question is the difference between finishing and not finishing.

Example: Is 7,29,846 divisible by 3? Instead of dividing, you add the digits: 7 + 2 + 9 + 8 + 4 + 6 = 36. Since 36 is a multiple of 3, the number is divisible by 3. Done — no division needed.

### The Complete Rules Table (Memorise This)

| Divisible by | Rule | Example |
|---|---|---|
| 2 | Last digit is even (0, 2, 4, 6, 8) | 348 → last digit 8 is even ✓ |
| 3 | **Sum of digits is a multiple of 3** | 729 → 7+2+9 = 18 ✓ |
| 4 | Last TWO digits form a multiple of 4 | 5,316 → 16 is a multiple of 4 ✓ |
| 5 | Last digit is 0 or 5 | 415 ✓ |
| 6 | Even **AND** sum of digits is a multiple of 3 | 342 → even and 3+4+2 = 9 ✓ |
| 8 | Last THREE digits form a multiple of 8 | 71,208 → 208 is a multiple of 8 ✓ |
| 9 | **Sum of digits is a multiple of 9** | 1,836 → 1+8+3+6 = 18 ✓ |
| 10 | Last digit is 0 | 750 ✓ |
| 11 | (Sum of digits in odd positions) − (sum in even positions) is 0 or a multiple of 11 | 9,251 → (9+5) − (2+1) = 11 ✓ |

**How to read the table:** the rules for 3 and 9 use the WHOLE number (its digit sum). The rules for 2, 5, 10 use only the LAST digit. The rules for 4 and 8 use the last two/three digits. Never mix them up.

### Why the Sum-of-Digits Rule for 3 and 9 Actually Works

This is the one rule every student asks "but why?" — and understanding it means you'll never forget it.

The secret: **10, 100, 1000, ... all leave a remainder of 1 when divided by 9.**

- 10 = 9 + 1 → remainder 1
- 100 = 99 + 1 → remainder 1
- 1000 = 999 + 1 → remainder 1

Now take any number, say 5,862:

```
5862 = 5×1000 + 8×100 + 6×10 + 2
     = 5×(999+1) + 8×(99+1) + 6×(9+1) + 2
     = (5×999 + 8×99 + 6×9)  +  (5 + 8 + 6 + 2)
       └──── all multiples of 9 ────┘   └── the digit sum!
```

The first bracket is always a multiple of 9. So the whole number is a multiple of 9 **exactly when the digit sum is**. And since every multiple of 9 is also a multiple of 3, the digit sum rules out both — for free.

### Worked Examples

**Example 1 — Check 5862 for divisibility by 3 and 9:**
1. Sum the digits: 5 + 8 + 6 + 2 = **21**
2. 21 is a multiple of 3 → 5862 is divisible by 3 (5862 ÷ 3 = 1954 exactly ✓)
3. 21 is NOT a multiple of 9 → 5862 is NOT divisible by 9

**Example 2 — Which of 12345, 9876, 11111 is divisible by 9?**
- 12345 → 1+2+3+4+5 = 15 → not a multiple of 9 ✗
- 9876 → 9+8+7+6 = 30 → not a multiple of 9 ✗
- 11111 → 1+1+1+1+1 = 5 → not a multiple of 9 ✗
- None! (12345 is divisible by 3 though — 15 is a multiple of 3.)

**Example 3 — Find the smallest digit A so that 5A2 is divisible by 3:**
1. Digit sum: 5 + A + 2 = 7 + A
2. Need 7 + A to be a multiple of 3: A = 2 gives 9 ✓ (A = 5 gives 12, A = 8 gives 15)
3. **Smallest A = 2**

**Example 4 — Using rule 11:** Is 13,024 divisible by 11?
1. Odd positions (1st, 3rd, 5th): 1 + 0 + 4 = 5; Even positions (2nd, 4th): 3 + 2 = 5
2. Difference: 5 − 5 = 0 → divisible by 11 ✓ (13,024 ÷ 11 = 1,184 ✓)

### Number Properties — the Vocabulary You Need

| Property | Meaning | Examples |
|---|---|---|
| Even / Odd | Divisible by 2 / not divisible by 2 | 4, 18 even · 7, 23 odd |
| Prime | Exactly TWO factors: 1 and itself | 2, 3, 5, 7, 11, 13 |
| Composite | More than two factors | 4, 6, 9, 12, 15 |
| Perfect square | A number × itself | 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 |
| Perfect cube | A number × itself × itself | 1, 8, 27, 64, 125 |
| Coprime (relatively prime) | HCF is 1 | (4, 9), (8, 15), (21, 25) |
| Factor / divisor | Divides the number exactly | factors of 12: 1, 2, 3, 4, 6, 12 |
| Multiple | Number × a whole number | multiples of 4: 4, 8, 12, 16, ... |

**Three facts worth remembering:**
1. **2 is the only even prime** — every other even number has at least three factors (1, 2, itself).
2. **1 is neither prime nor composite** — it has exactly one factor.
3. The smallest composite number is **4**.

### Divisibility + Number Properties Combo Questions

These combine both ideas — exam favourites:

**Q: How many two-digit numbers are divisible by both 3 and 5?**
1. Divisible by 3 and 5 = divisible by LCM(3, 5) = 15.
2. Two-digit multiples of 15: 15, 30, 45, 60, 75, 90 → **6 numbers**.

**Q: A number is divisible by 6. Which of these must also divide it?**
1. Divisible by 6 = divisible by 2 AND by 3 (LCM again).
2. So 2 and 3 must divide it. But 6 = 2×3, so 6 dividing the number does NOT force 18 or 12 to divide it (e.g. 30 is divisible by 6 but not by 18).

### Common Traps

❌ **"Divisible by 3 means divisible by 9"** — WRONG. 21 is divisible by 3 but not by 9. The digit sum decides: multiple of 9 only if digit sum is a multiple of 9.
❌ **Using the last digit for 3/9** — the last digit only works for 2 and 5.
❌ **Divisible by 6 = just checking even** — must ALSO check the digit sum is a multiple of 3. 14 is even but not divisible by 6.
❌ **Forgetting 2 is prime** — it's the only even prime; don't call primes "all odd".
❌ **Divisible by 4 uses the last TWO digits** — not the last digit (that's 2) and not the sum of digits.

### Quick Self-Test (answers at the bottom of this section)

1. Which of these is NOT divisible by 3? (a) 231  (b) 1,002  (c) 7,891  (d) 12,345
2. The sum of digits of a number is 27. Which is definitely true? (a) divisible by 3 only  (b) divisible by 3 and 9  (c) divisible by 9 only
3. Smallest digit A so that 5A2 is divisible by 3? (a) 1  (b) 2  (c) 3  (d) 4
4. Which number is divisible by 11? (a) 1,276  (b) 13,024  (c) 2,461
5. A number is divisible by 6. It must also be divisible by — (a) 12  (b) 18  (c) 3  (d) 9

**Answers:** 1→c (digit sum 25), 2→b (27 is a multiple of 9), 3→b (7+2=9), 4→b (odd 1+0+4=5, even 3+2=5, diff 0), 5→c (6 = 2×3, so 2 and 3 divide it).

### Key Takeaway

For 3 and 9, **sum the digits and check the multiple**. For 2, 5, 10 check the **last digit**. For 4 and 8 check the **last two/three digits**. And remember: 9's rule implies 3's rule — but never the other way around.

---

## 1.2 HCF & LCM

### What is HCF?

The **Highest Common Factor** (HCF) of two or more numbers is the **largest** number that divides each of them exactly.

- Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24
- Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36
- Common factors: 1, 2, 3, 4, 6, 12 → **HCF = 12**

### What is LCM?

The **Least Common Multiple** (LCM) of two or more numbers is the **smallest** number that each of them divides exactly.

- Multiples of 24: 24, 48, 72, 96, ...
- Multiples of 36: 36, 72, 108, ...
- First common multiple: **LCM = 72**

**The analogy that sticks:**
Imagine groups of students forming rows. HCF asks: *what is the biggest row size that lets every group form complete rows?* LCM asks: *what is the fewest total students such that every group can be split exactly?* Same numbers, opposite questions.

### Method 1 — Prime Factorisation (Always Works)

1. Break each number into its prime factors.
2. **HCF:** for each prime, take the SMALLEST exponent that appears anywhere.
3. **LCM:** for each prime, take the LARGEST exponent that appears anywhere.

**Worked example — HCF and LCM of 24 and 36:**

```
24 = 2 × 2 × 2 × 3 = 2³ × 3
36 = 2 × 2 × 3 × 3 = 2² × 3²

HCF:  2² × 3  =  4 × 3  = 12    (smallest exponents)
LCM:  2³ × 3² =  8 × 9  = 72    (largest exponents)
```

**Verification:** 12 × 72 = 864 = 24 × 36 ✓ — the golden relation (below) confirms both answers.

### Method 2 — Division Method for HCF (Fast for Two Numbers)

1. Divide the larger number by the smaller one.
2. Now divide the divisor by the remainder.
3. Repeat until the remainder is 0 — the LAST divisor is the HCF.

**Worked example — HCF of 84 and 120:**

```
120 ÷ 84 → remainder 36
84 ÷ 36 → remainder 12
36 ÷ 12 → remainder 0   →  HCF = 12
```

### The Golden Relation (Memorise This)

> **For two numbers A and B:  HCF × LCM = A × B**

The moment you know any three of the four values, the fourth is one division away. This single formula solves more exam problems than any other trick in this chapter.

**Why it works (simple intuition):** the LCM of A and B is the product of all prime factors with maximum exponents; the HCF is the same primes with minimum exponents. Multiplying them multiplies each prime's exponents: max + min = the exponents in A × B. So LCM × HCF is exactly A × B.

### The Three Classic Exam Patterns

**Pattern 1 — Ratio + HCF: two numbers are in ratio a : b with HCF h.**
The actual numbers are **h×a and h×b**.

Example: Two numbers are in the ratio 3 : 4 and their HCF is 6.
→ Numbers are 3×6 = 18 and 4×6 = 24. Check: HCF(18, 24) = 6 ✓

**Pattern 2 — Same remainder: find the largest number dividing several numbers leaving the same remainder r.**
**Subtract r from each number first, then take the HCF of the results.**

Example: Find the largest number that divides 94, 70 and 52 leaving remainder 4 each time.
→ 94−4 = 90, 70−4 = 66, 52−4 = 48 → HCF(90, 66, 48) = 6. Check: 94÷6 leaves 4 ✓

**Pattern 3 — Smallest number divisible by several numbers = LCM.**
Example: The smallest number divisible by 4, 6 and 8 → LCM(4, 6, 8) = 24.

**Bonus pattern — ringing bells / running laps:** three bells ring at 4, 6 and 8 minutes. They ring together again after LCM(4, 6, 8) = **24 minutes**.

### Common Traps

❌ **Using HCF × LCM = A × B for three or more numbers** — the golden relation works ONLY for two numbers. With A, B, C you cannot use it.
❌ **HCF of numbers in ratio problems:** forgetting to multiply the ratio terms by the HCF to get the actual numbers.
❌ **LCM vs HCF swapped:** "largest number that divides ..." = HCF; "smallest number divisible by ..." = LCM. Read the question's direction.
❌ **Same-remainder problems:** forgetting to subtract the remainder from EVERY number before taking HCF.
❌ **Exponent confusion:** HCF takes the smallest exponent, LCM takes the largest — it's easy to flip them. Write "HCF = small, LCM = big" at the top of your rough sheet.

### Quick Self-Test (answers at the bottom of this section)

1. HCF of 42 and 56? (a) 7  (b) 14  (c) 21  (d) 28
2. LCM of 12 and 18? (a) 24  (b) 36  (c) 54  (d) 72
3. HCF of two numbers is 6, LCM is 72. One number is 18. The other is? (a) 12  (b) 24  (c) 36  (d) 48
4. Two numbers are in ratio 3 : 4 with HCF 5. The numbers are? (a) 15, 20  (b) 3, 4  (c) 12, 16  (d) 5, 20
5. The largest number dividing 94, 70, 52 leaving remainder 4 each time? (a) 4  (b) 6  (c) 8  (d) 12

**Answers:** 1→b (42 = 2×3×7, 56 = 2³×7 → 2×7 = 14), 2→b (12 = 2²×3, 18 = 2×3² → 2²×3² = 36), 3→b (6×72 = 432, 432 ÷ 18 = 24), 4→a (3×5, 4×5), 5→b (90, 66, 48 → HCF 6).

### Key Takeaway

**HCF = biggest common divisor (take smallest exponents). LCM = smallest common multiple (take largest exponents).** For exactly two numbers, HCF × LCM = A × B — use it to find the fourth value from any three. Direction decides the method: "largest dividing" → HCF, "smallest divisible" → LCM.

---

# 2. Problems

## 2.1 Find Sum of Digits Divisible by 3

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Divisibility Rules & Number Properties |
| **Companies** | Infosys, TCS |

### Problem Statement

Find the sum of the digits of 5862. Using the divisibility rules, determine whether 5862 is divisible by 3 and whether it is divisible by 9. Show the rule you use for each.

### Step-by-Step Solution

**Step 1 — Add the digits:**

```
5862 → 5 + 8 + 6 + 2 = 21
```

**Step 2 — Check divisibility by 3:**

> Rule: a number is divisible by 3 if the SUM of its digits is a multiple of 3.

21 is a multiple of 3 (21 = 3 × 7) → **5862 is divisible by 3**.
Quick check: 5862 ÷ 3 = 1954 exactly ✓

**Step 3 — Check divisibility by 9:**

> Rule: a number is divisible by 9 if the SUM of its digits is a multiple of 9.

21 is NOT a multiple of 9 → **5862 is NOT divisible by 9**.

### Answer

| Question | Answer |
|---|---|
| Sum of digits | **21** |
| Divisible by 3? | **Yes** |
| Divisible by 9? | **No** |

### Why the Rule Works (One Line)

10, 100, 1000, ... each leave a remainder of 1 when divided by 9, so a number and its digit sum always share the same remainder on division by 9 — the digit sum decides both 3 and 9 for free.

### Trap to Remember

Divisible by 9 ⟹ divisible by 3, but divisible by 3 does NOT imply divisible by 9. Here 21 is a multiple of 3 only — if the digit sum had been 27, both would have been true.

---

## 2.2 Find HCF and LCM of Two Numbers

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | HCF & LCM |
| **Companies** | TCS, Wipro |

### Problem Statement

Find the HCF and LCM of 24 and 36 using the prime factorisation method, and verify your answers using the golden relation HCF × LCM = A × B.

### Step-by-Step Solution

**Step 1 — Prime factorise both numbers:**

```
24 = 2 × 2 × 2 × 3 = 2³ × 3
36 = 2 × 2 × 3 × 3 = 2² × 3²
```

**Step 2 — HCF (smallest exponent of each prime):**

- 2 appears as 2³ and 2² → take 2²
- 3 appears as 3¹ and 3² → take 3¹

HCF = 2² × 3 = 4 × 3 = **12**

**Step 3 — LCM (largest exponent of each prime):**

- 2 appears as 2³ and 2² → take 2³
- 3 appears as 3¹ and 3² → take 3²

LCM = 2³ × 3² = 8 × 9 = **72**

**Step 4 — Verify with the golden relation:**

```
HCF × LCM = 12 × 72 = 864
A × B     = 24 × 36 = 864
```

Both sides match → the answers are correct. ✓

### Answer

| Question | Answer |
|---|---|
| HCF | **12** |
| LCM | **72** |
| Verification | 12 × 72 = 864 = 24 × 36 ✓ |

### Trap to Remember

The golden relation HCF × LCM = A × B works ONLY for two numbers. For three numbers, HCF(A, B, C) × LCM(A, B, C) is NOT equal to A × B × C — the product rule breaks down.

---

*Happy studying! — TheWebytes Aptitude Team*
