# Aptitude Learning Document — Coding-Decoding & Number Series

> A simple, student-friendly guide to code-breaking and pattern-spotting — "if CAT is written as DBU, how is DOG written?" and "what number comes after 2, 5, 10, 17?"
> Two tools: find the one rule that produced the code, and find the one pattern that produces each number. Both chapters are about spotting a consistent pattern — nothing else.

---

# 13. Coding-Decoding & Number Series

> **Lesson Overview:** **Coding-decoding** questions give you one word and its code; you discover the rule (shift letters, reverse the alphabet, add positions) and apply it to a new word. **Number series** questions give you a sequence of numbers; you discover the pattern (add, multiply, square, alternate) and predict the next term.
> - **Category:** Logical Reasoning
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 13.1 Coding-Decoding

### The Simple Idea

A code is a **rule applied consistently**. The question gives you one example ("CAT is written as DBU") — you find the rule from that example, then apply the same rule to the target word. There is no magic; every code is one of a handful of standard tricks.

### The Letter Position Table (The Only Table You Need)

| Letter | Position | Letter | Position | Letter | Position | Letter | Position |
|---|---|---|---|---|---|---|---|
| A | 1 | H | 8 | O | 15 | V | 22 |
| B | 2 | I | 9 | P | 16 | W | 23 |
| C | 3 | J | 10 | Q | 17 | X | 24 |
| D | 4 | K | 11 | R | 18 | Y | 25 |
| E | 5 | L | 12 | S | 19 | Z | 26 |
| F | 6 | M | 13 | T | 20 | | |
| G | 7 | N | 14 | U | 21 | | |

**Memory anchor:** E = 5, M = 13, T = 20, Z = 26. Four anchors let you count to any letter quickly.

### The Code-Maker's Toolbox (Standard Rules)

| Trick | What it does | Example |
|---|---|---|
| Shift by a constant | Each letter moves +k or −k positions | CAT → DBU (+1 each) |
| Reverse alphabet | A↔Z, B↔Y, C↔X (positions add to 27) | ZEBRA → AYAQZ |
| Reverse the word | Write the word backwards | DOG → GOD |
| Mix vowels & consonants | Vowels shift one way, consonants another | CAP → DBQ (vowels +1, consonants +1) |
| Sum of positions | Add positions; code is a number | CAT = 3 + 1 + 20 = 24 |

**First question to ask yourself: is the code letters or numbers?** If letters → shift/reverse. If numbers → positions/sums.

### Worked Example 1 — Shift by a Constant

**Question:** In a certain code, CAT is written as DBU. How is DOG written?

```
Step 1: C → D  (+1)     A → B  (+1)     T → U  (+1)
Step 2: the rule is "+1 on every letter"
Step 3: apply the rule:
        D → E   O → P   G → H
Step 4: DOG = EPH
```

The answer: **EPH**.

### Worked Example 2 — Reverse Alphabet

**Question:** In a certain code, ZEBRA is written as AYAQZ. How is SUN written?

```
Step 1: Z → A (reverse pair), E → Y, B → A, R → Q, A → Z
Step 2: rule = reverse alphabet (A↔Z, B↔Y, C↔X, ...)
Step 3: S → H   U → F   N → M
Step 4: SUN = HFM
```

**Reverse-pair trick:** a letter and its reverse always add to 27 (Z + A = 26 + 1 = 27, B + Y = 2 + 25 = 27). If two letters sum to 27, they are reverse pairs.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Skipping the given example | Applying the wrong rule | The rule always comes from the sample |
| Shifting backwards | +1 read as −1 | Check the sample direction once |
| Forgetting reverse pairs sum to 27 | Guessing pairs | Use the 27 rule to verify |
| Mixing positions | A read as 0 instead of 1 | A = 1, always |
| Vowels only | Changing consonants too | Recheck the rule on every letter type |

### Quick Self-Test (answers at the bottom)

1. If CAT is written as DBU, how is RAT written? — (a) SBU  (b) QZS  (c) SAU  (d) RBT
2. A letter and its reverse alphabet partner always sum to — (a) 25  (b) 26  (c) 27  (d) 13
3. Letter position of M is — (a) 12  (b) 13  (c) 14  (d) 11
4. If DOG is written as GOD, how is CAT written? — (a) TAC  (b) CTA  (c) ACT  (d) TCA
5. If AB = 1 + 2 = 3 (sum of positions), then CD = — (a) 7  (b) 8  (c) 9  (d) 10

**Answers:** 1→a, 2→c, 3→b, 4→a, 5→a (C = 3, D = 4, sum = 7).

### Key Takeaway

Every code obeys one consistent rule. Find the rule from the sample (shift, reverse alphabet, reverse word, sum of positions), then apply it letter by letter. The 27-rule verifies reverse pairs, and A = 1, never 0.

---

## 13.2 Number Series

### The Simple Idea

Every sequence hides one pattern that turns each number into the next. Find the pattern on the **first few terms**, verify it on the **next terms**, then predict the answer. If the first guess fails, try the next pattern family.

### The Pattern Family Table (Check Differences First)

| Family | Pattern | Example |
|---|---|---|
| Constant difference | Add (or subtract) the same number | 2, 5, 8, 11 → +3 |
| Constant ratio | Multiply (or divide) by the same number | 3, 6, 12, 24 → ×2 |
| Alternating | Two patterns on odd and even positions | 2, 5, 3, 7, 4, 9 → +1, +2 |
| Growing difference | Difference itself grows (+2, +3, +4...) | 2, 5, 10, 17 → +3, +5, +7 |
| Squares / cubes | Perfect squares or cubes with a tweak | 1, 4, 9, 16 → n² |
| Prime numbers | The primes in order | 2, 3, 5, 7, 11 → next 13 |
| Difference of differences | Second difference is constant | 1, 4, 10, 19 → +3, +6, +9 (+3 each) |

**The first move is always: write down the differences.** If the differences are constant → constant difference. If the differences grow steadily → growing difference. If nothing → try ratio, squares, or alternating.

### Worked Example 1 — Constant Ratio

**Question:** What comes next: 2, 4, 8, 16, ?

```
Step 1: 4 ÷ 2 = 2    8 ÷ 4 = 2    16 ÷ 8 = 2
Step 2: pattern = multiply by 2
Step 3: 16 × 2 = 32
```

The answer: **32**.

### Worked Example 2 — Growing Difference

**Question:** What comes next: 2, 5, 10, 17, ?

```
Step 1: differences = +3, +5, +7
Step 2: the differences themselves grow by +2
Step 3: next difference = +9
Step 4: 17 + 9 = 26
```

The answer: **26**. Never answer 25 (which "feels" like squares) — the differences tell the real story.

### The Verification Habit (Always Do This)

Once you have a pattern, check it on **two consecutive terms you already know**. If the pattern explains term 2 from term 1 AND term 3 from term 2, you can trust it. A pattern that only works once is a guess.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Guessing squares without checking differences | 2, 5, 10, 17 answered 25 | Differences +3, +5, +7 say +9 → 26 |
| Skipping the differences step | Jumping to a wild pattern | Differences first, always |
| Stopping after one match | Pattern fits once only | Verify on two known terms |
| Forgetting alternation | Two patterns hidden in one list | Check odd and even positions separately |
| Ratio before difference | ×2 assumed on 2, 4, 6 | Differences (+2) beat ratio here |

### Quick Self-Test (answers at the bottom)

1. Next term: 3, 6, 12, 24 — (a) 36  (b) 48  (c) 40  (d) 30
2. Next term: 1, 4, 9, 16 — (a) 20  (b) 24  (c) 25  (d) 23
3. Next term: 5, 8, 11, 14 — (a) 17  (b) 16  (c) 18  (d) 15
4. Next term: 100, 90, 81, 73 — (a) 65  (b) 66  (c) 67  (d) 64
5. Next term: 1, 2, 4, 8 — (a) 12  (b) 14  (c) 16  (d) 10

**Answers:** 1→b, 2→c, 3→a, 4→b (−10, −9, −8 → −7 → 66), 5→c.

### Key Takeaway

Write the differences first — they reveal most patterns instantly. If the differences are constant, that's the pattern; if they grow steadily, continue their growth. Verify any pattern on two known terms before predicting, and check odd/even positions when the sequence seems to dance between two rules.
