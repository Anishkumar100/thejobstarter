# Aptitude Learning Document — Permutations, Combinations & Probability

> A simple, student-friendly guide to counting fast — how many ways to arrange books, how many ways to pick a team, and the chance of drawing the card you want.
> You only need two ideas: **multiply the choices**, and **divide when order doesn't matter**. Probability is the last step: good outcomes ÷ all outcomes.

---

# 9. Permutations, Combinations & Probability

> **Lesson Overview:** This chapter is about counting without listing everything. First we arrange (order matters), then we choose (order doesn't), then we put a favourite count over a total count and call it probability.
> - **Category:** Quantitative Aptitude
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 9.1 Permutations & Combinations

### What This Chapter Is About

Counting — fast. How many ways can 3 books be arranged on a shelf? How many ways can a team of 2 be picked from 4 friends? Instead of writing every option down, we multiply. Two rules do everything:

1. **Choices multiply.**
2. **When order doesn't matter, divide by the shuffles.**

### Rule 1: Choices Multiply

You are picking a shirt AND pants. 3 shirts, 2 pants. Every shirt works with every pants:

| Shirts | Pants | Outfits |
|---|---|---|
| 3 | × 2 | = 6 |
| 4 | × 3 | = 12 |
| 2 | × 2 | = 4 |

Multiply the choices at every step. That's the whole engine of this chapter — every formula below is just this rule in a costume.

### Rule 2: Factorial — "Multiply n Down to 1"

**3! (read "three factorial") = 3 × 2 × 1 = 6.** The exclamation mark means: multiply every number from n down to 1.

What does it count? **Arranging things where order matters.**

**Example — 3 friends (A, B, C) stand in a queue:**

| Position | Choices left | Why |
|---|---|---|
| 1st | 3 | any of the 3 friends |
| 2nd | 2 | one is already first |
| 3rd | 1 | only one remains |
| **Total** | **3 × 2 × 1 = 6** | six different queues |

| n | n! | Easy way to think |
|---|---|---|
| 1! | 1 | 1 thing, 1 way |
| 2! | 2 | 2 books: 2 orders |
| 3! | 6 | 3 friends: 6 queues |
| 4! | 24 | 4 books: 24 shelves |
| 5! | 120 | 5 letters: 120 words |

### Arranging = Fill the Slots, Each Time One Less Choice

**Example — 4 different books on a shelf:**

```
4 × 3 × 2 × 1 = 24 ways
```

**Example — arrange only 2 of the 4 books:**

```
First slot:  4 books to choose from
Second slot: 3 books left
Total:       4 × 3 = 12 ways
```

That's all a "permutation" is — filling slots where order matters, with one fewer choice each step. The fancy formula (nPr) is just this idea written longhand; you never need it if you multiply the slots.

### Choosing = Arrange First, Then Undo the Shuffling

Picking a team of 3 from 5 friends. Now the order does NOT matter — team (A, B, C) is the same team as (B, C, A).

**Step 1 — pretend order matters:** 5 × 4 × 3 = 60 ways.

**Step 2 — notice the problem:** the same 3 people were counted many times. The team A, B, C also appeared as A, C, B, as B, A, C… a team of 3 can be shuffled 3 × 2 × 1 = 6 ways. So every team was counted 6 times.

**Step 3 — undo the shuffling:** 60 ÷ 6 = **10 teams**.

| You want | Order matters? | What to do | Answer |
|---|---|---|---|
| Arrange 4 books | Yes | 4 × 3 × 2 × 1 | 24 |
| Arrange 2 of 4 books | Yes | 4 × 3 | 12 |
| Pick 3 from 5 | No | (5 × 4 × 3) ÷ (3 × 2 × 1) | 10 |
| Pick 2 from 4 | No | (4 × 3) ÷ (2 × 1) | 6 |

### The Repeats Trick (Words)

All different letters → just multiply. Repeated letters → **divide by their shuffles**.

**Example — "BOOK":** 4 letters, so 4! = 24. But the two O's are the same letter — swapping them makes no new word. Divide by 2! (the O's shuffles): 24 ÷ 2 = **12**.

| Word | Letters | The trick | Answer |
|---|---|---|---|
| CAT | 3 different | 3! | 6 |
| BOOK | 4, two O's | 4! ÷ 2! | 12 |
| LEVEL | 5, L and E each twice | 5! ÷ (2! × 2!) | 30 |
| BANANA | 6, A three times, N twice | 6! ÷ (3! × 2!) | 60 |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Order? | Team counted 6 times | If swapping changes nothing → divide by the shuffles |
| Repeated letters | "BOOK" answered 24 | Divide by the repeats' factorial |
| Zero factorial | 0! called "0" | 0! = 1 — just remember it |

### Quick Self-Test (answers at the bottom)

1. The value of 5! is — (a) 120  (b) 60  (c) 100  (d) 24
2. In how many ways can 3 different books be arranged on a shelf? (a) 3  (b) 6  (c) 9  (d) 12
3. How many ways to choose 2 students from a group of 4? (a) 12  (b) 8  (c) 6  (d) 4
4. The number of arrangements of the letters of "BOOK" is — (a) 12  (b) 24  (c) 8  (d) 6
5. How many arrangements of 4 different letters? (a) 12  (b) 16  (c) 24  (d) 8

**Answers:** 1→a, 2→b (3 × 2 × 1), 3→c ((4 × 3) ÷ (2 × 1) = 6), 4→a (24 ÷ 2), 5→c (4!).

### Key Takeaway

Multiply the choices. Arrange = multiply the slots down (4 × 3 × 2 × 1). Choose = multiply, then divide by the shuffles. Same letters = divide by their shuffles too. Ask one question first: **does order matter?**

---

## 9.2 Basic Probability

### The One-Line Idea

> **Probability = the good outcomes ÷ all the outcomes.**

**Example — toss a coin:** all outcomes = 2 (heads, tails). Good outcomes = 1 (heads). Probability of heads = **1 ÷ 2 = 1/2**.

That's it. Every probability question is just this fraction — count the good ones, count everything, divide.

### What the Number Means (The Dial)

A probability is always between 0 and 1:

| Value | What it means | Example |
|---|---|---|
| 0 | Never happens | Rolling a 7 on a normal die |
| 1/4 | Happens sometimes | Drawing a face card |
| 1/2 | Half the time | Heads in a toss |
| 3/4 | Happens most times | NOT drawing a face card |
| 1 | Always happens | The sun rising tomorrow |

### The Three Worlds (Know These Counts)

| World | All outcomes | Memory |
|---|---|---|
| Coin | 2 | heads, tails |
| Die | 6 | 1, 2, 3, 4, 5, 6 |
| Deck of cards | 52 | 4 suits × 13 cards |

**Die questions:**

| Question | Good outcomes | Probability |
|---|---|---|
| Roll a 3 | 1 | 1/6 |
| Roll an even number | 3 (2, 4, 6) | 3/6 = 1/2 |
| Roll 5 or 6 | 2 | 2/6 = 1/3 |

**Card questions:**

| Question | Good outcomes | Probability |
|---|---|---|
| Draw a king | 4 (one per suit) | 4/52 = 1/13 |
| Draw a heart | 13 | 13/52 = 1/4 |
| Draw a red card | 26 | 26/52 = 1/2 |

### The Recipe (Always 4 Steps)

```
Step 1 — All outcomes:    coin 2, die 6, deck 52
Step 2 — Good outcomes:   read the question carefully
Step 3 — Divide:          good ÷ all
Step 4 — Simplify:        cut the fraction down
```

**Example — probability of a king:**

```
All outcomes = 52
Good outcomes = 4 kings
P = 4 ÷ 52 = 1/13
```

### The "Not" Shortcut

The opposite of an event is easy: **P(not) = 1 − P**.

If drawing a face card has probability 1/4, then NOT drawing one has probability 1 − 1/4 = **3/4**. No counting needed — just take what's left.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Not simplifying | Answer left as 4/52 | Cut it down: 1/13 |
| Counting wrong good ones | Kings counted as 1 | 4 kings, one per suit |
| Probability above 1 | "Good" bigger than "all" | Impossible — recount |

### Quick Self-Test (answers at the bottom)

1. The probability of heads in a coin toss? (a) 1/2  (b) 1  (c) 1/4  (d) 2/3
2. A die is rolled. Probability of getting a 3? (a) 1/6  (b) 1/3  (c) 1/2  (d) 1/4
3. A card is drawn from 52. Probability of a king? (a) 1/52  (b) 1/13  (c) 1/26  (d) 1/4
4. Probability of NOT getting heads in a coin toss? (a) 1/4  (b) 1/2  (c) 0  (d) 2/3
5. Probability of an even number on a die? (a) 1/6  (b) 1/3  (c) 1/2  (d) 2/3

**Answers:** 1→a, 2→a, 3→b (4 ÷ 52), 4→b (1 − 1/2), 5→c (3 ÷ 6).

### Key Takeaway

Probability = good outcomes ÷ all outcomes, always between 0 and 1. Count the world (coin 2, die 6, deck 52), count the good ones, divide and simplify. For "not" questions, use 1 − P.

---

# 9. Problems

## 9.1 Arrange Letters of a Word

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Permutations & Combinations |
| **Companies** | TCS, Infosys |

### Problem Statement

How many different ways can the letters of the word "BOOK" be arranged?

### Step-by-Step Solution

**Step 1 — Arrange the 4 letters like they were all different:**

```
4 × 3 × 2 × 1 = 24
```

**Step 2 — Spot the problem:** the two O's are the same letter. Swapping them makes no new word — every arrangement above was counted twice (once with each O first).

**Step 3 — Divide by the repeats' shuffles:**

```
24 ÷ 2! = 24 ÷ 2 = 12
```

**Step 4 — Verify with blocks:**

```
Treat "OO" as one block X → arrange B, X, K → 3! = 6 ways
O's separated → 12 − 6 = 6 ways
Total = 6 + 6 = 12 ✓
```

### Answer

| Question | Answer |
|---|---|
| All 4 letters arranged | 24 |
| The O's shuffles | 2 |
| Distinct arrangements | **12** (24 ÷ 2) |
| Check | 6 (blocked) + 6 (separated) = 12 ✓ |

### Trap to Remember

Don't answer 4! = 24 — the two O's are the same letter, so divide by 2!. Same rule for any word: divide by each repeated letter's factorial.

---

## 9.2 Probability of Drawing a Card

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Basic Probability |
| **Companies** | Wipro, Accenture |

### Problem Statement

A card is drawn at random from a well-shuffled deck of 52 cards. What is the probability that the card is a king?

### Step-by-Step Solution

**Step 1 — Count all outcomes:**

```
A full deck = 52 cards
```

**Step 2 — Count the good outcomes:**

```
Kings = 4 (one king in each suit: hearts, diamonds, clubs, spades)
```

**Step 3 — Divide:**

```
P(king) = 4 ÷ 52 = 1/13
```

**Step 4 — Check:**

```
4 × 13 = 52 ✓ — one king in every 13 cards, which matches the deck (4 suits of 13).
```

### Answer

| Question | Answer |
|---|---|
| All cards | 52 |
| Good cards (kings) | 4 |
| Probability | **1/13** |
| Check | 4 × 13 = 52 ✓ |

### Trap to Remember

Don't leave 4/52 — simplify to 1/13. And don't answer 1/52 — that's only the ace of spades (one specific card). "A king" means any of the 4 kings.

---

*Happy studying! — TheWebytes Aptitude Team*
