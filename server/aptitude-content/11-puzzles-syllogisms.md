# Aptitude Learning Document — Puzzles & Syllogisms

> A simple, student-friendly guide to the brain-training chapter — arranging people with clue-following logic, and judging statements with Venn circles.
> Two skills, one mindset: **only believe what the clues force you to believe.** Puzzles fill one seat at a time; syllogisms accept only conclusions that are true in every possible drawing.

---

# 11. Puzzles & Syllogisms

> **Lesson Overview:** Two classic logical-reasoning games. **Seating puzzles** give you clues about who sits where — you place people one by one, always starting from the most definite clue. **Syllogisms** give you two statements and test whether a conclusion MUST be true — Venn circles make the answer obvious.
> - **Category:** Logical Reasoning
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 11.1 Logical Puzzles (Seating Arrangements)

### The Setup

Five chairs in a row, five friends, and clues like "R sits in the middle" or "T sits at the right end." Your job: place everyone. It's like a crossword — you fill the definite squares first.

**Draw the seats before anything else:**

```
Seat:  1    2    3    4    5
       _    _    _    _    _
```

### The Clue Dictionary (Know Each Clue's Meaning)

| Clue | What it means |
|---|---|
| X sits in the middle | X is at seat 3 of 5 |
| X sits at the right end | X is at the last seat |
| X sits at the left end | X is at the first seat |
| X sits immediately to the left of Y | No one between X and Y, X on the left |
| X sits immediately right of Y | No one between them, X on the right |
| X and Y sit together | They are neighbours (either order) |
| X is not at an end | X is a middle seat |

**The two golden habits:**
1. **Start with the most definite clue** — "in the middle" beats "somewhere to the left."
2. **Update the seats as you go** — cross off filled seats; the remaining friends fit into the remaining chairs.

### Worked Example — Five Friends in a Row

**Clues:** R sits in the middle. T sits at the right end. P sits immediately to the left of Q.

**Step 1 — the definite clues:**

```
Seat:  1    2    3    4    5
       _    _    R    _    T
```

**Step 2 — find P and Q.** They must be adjacent, with P left of Q. The free seats are 1, 2 and 4. Adjacent free pairs: only (1, 2) — (2, 3) has R, (3, 4) has R, (4, 5) has T.

**Step 3 — place them:**

```
Seat:  1    2    3    4    5
       P    Q    R    S    T
```

S takes the last free seat. **The arrangement is forced** — no guessing was needed.

### The Power of "Definitely"

The whole game is finding what MUST be true:

| Clue | Definite? |
|---|---|
| "P sits somewhere left of Q" | Not definite — many layouts possible |
| "P sits immediately left of Q" | Definite — the pair occupies two fixed seats |
| "T sits at the right end" | Definite — locks seat 5 |

If a clue gives you a definite position, place it. If not, note it and keep going — later clues usually decide.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Guessing early | Wrong layout, wrong answers | Only fill seats the clues force |
| Ignoring "immediately" | P and Q separated | "Immediately" = neighbours, no gap |
| Forgetting to redraw | Mistakes pile up | Draw seats once, fill as clues arrive |
| Answering "cannot say" too fast | Missing the forced seat | If one seat is left for one person, that's an answer |

### Quick Self-Test (answers at the bottom)

1. In the row above, who sits at the left end? (a) P  (b) Q  (c) T  (d) Cannot be determined
2. C sits in the middle of 5 seats and D sits at the left end. Which seats are definitely occupied? (a) 1 and 3  (b) 2 and 4  (c) 3 and 5  (d) 1 and 5
3. In a row of 4 seats, A sits immediately left of B. How many positions can the pair (A, B) take? (a) 4  (b) 3  (c) 2  (d) 1
4. The best first step in a seating puzzle is — (a) guessing the arrangement  (b) starting with the most definite clue  (c) reading only the last clue  (d) ignoring the middle seats
5. In the worked example, who sits between R and T? (a) P  (b) Q  (c) S  (d) Nobody

**Answers:** 1→a (P Q R S T), 2→a, 3→b (pairs 1-2, 2-3, 3-4), 4→b, 5→c.

### Key Takeaway

Draw the seats, start with the most definite clue, place forced people, and let the remaining seats decide the rest. "Immediately" means neighbours. No guessing — the clues always force the layout in easy puzzles.

---

## 11.2 Syllogisms

### The Game

Two statements (premises), then conclusions. You decide: does the conclusion **definitely follow**? If the conclusion could be false in some situation, it does NOT follow — even if it sounds reasonable.

### The Three Statement Types

| Statement | Picture (Venn) | Example |
|---|---|---|
| **All A are B** | A's circle inside B's circle | All dogs are animals |
| **Some A are B** | A and B circles overlap | Some students are athletes |
| **No A are B** | Two separate circles | No cat is a fish |

Draw the circles — the picture answers the question.

### The Conversion Rules (The Heart of the Chapter)

A statement can sometimes be "flipped." The table shows which flips are safe:

| You have | Valid flip | Invalid flip |
|---|---|---|
| All A are B | Some B are A ✓ | All B are A ✗ |
| Some A are B | Some B are A ✓ | All A are B ✗ |
| No A are B | No B are A ✓ | Some A are B ✗ |

**The one rule to never break:** **"All A are B" NEVER becomes "All B are A."** All dogs are animals, but certainly not all animals are dogs.

### The Chain Rule

When statement 1 ends where statement 2 begins, chain them:

**Example — "All cats are mammals. All mammals are animals."**

```
Cats → Mammals → Animals
```

"All cats are animals" **follows** — the chain is continuous. Chains like this are the most common safe conclusion in exams.

### Definite vs Possible (The Exam's Favourite Trick)

| Conclusion | Truth status |
|---|---|
| All cats are animals (from the chain) | **Definite — follows** |
| Some animals are cats (flip of the chain) | **Definite — follows** |
| All animals are cats | False — never reverse "all" |
| Some mammals are not cats | Possible but NOT definite |

A conclusion must be true in **every possible drawing**. "Some mammals are not cats" could be true, but it could also be false (what if every mammal were a cat?). Possible ≠ definite.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reversing "all" | "All animals are cats" accepted | "All A are B" never flips to "All B are A" |
| Accepting "possible" | "Some mammals are not cats" marked true | Only accept what every drawing shows |
| Skipping the picture | Circles not drawn | Draw the Venn — it decides |
| Mixing up "some" | Some A are B read as all A are B | "Some" = at least one, nothing more |

### Quick Self-Test (answers at the bottom)

1. All dogs are animals. Which conclusion follows? (a) All animals are dogs  (b) Some animals are dogs  (c) No dogs are animals  (d) Dogs are not animals
2. All cats are mammals and all mammals are animals. Does "all cats are animals" follow? (a) Yes  (b) No  (c) Only some cats  (d) Cannot say
3. Which is a valid flip of "All A are B"? (a) Some B are A  (b) All B are A  (c) No B are A  (d) Some A are not B
4. From "Some A are B", which definitely follows? (a) All A are B  (b) No B are A  (c) Some B are A  (d) Some B are not A
5. All apples are fruits. Which statement is definitely false? (a) Some fruits are apples  (b) All apples are fruits  (c) All fruits are apples  (d) None of these

**Answers:** 1→b, 2→a (chain), 3→a, 4→c, 5→c.

### Key Takeaway

Draw the Venn circles. "All A are B" means A's circle is inside B's — flip it safely to "Some B are A," but NEVER to "All B are A." Chain statements that connect. And only conclusions true in every drawing count as following.

---

# 11. Problems

## 11.1 Solve a Seating Puzzle

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Logical Puzzles |
| **Companies** | TCS, Infosys |

### Problem Statement

Five friends P, Q, R, S, T sit in a row of five seats facing north. R sits in the middle. T sits at the right end. P sits immediately to the left of Q. Who sits at the left end? Who sits between R and T?

### Step-by-Step Solution

**Step 1 — Draw the seats and place the definite clues:**

```
Seat:  1    2    3    4    5
       _    _    R    _    T
```

**Step 2 — Find the only possible spot for the pair (P, Q):**

They must be neighbours with P on the left. Free seats: 1, 2, 4. Only (1, 2) is an adjacent free pair:

```
Seat:  1    2    3    4    5
       P    Q    R    _    T
```

**Step 3 — S takes the last seat:**

```
Seat:  1    2    3    4    5
       P    Q    R    S    T
```

**Step 4 — Verify every clue:**

```
R middle (seat 3)? ✓    T right end (seat 5)? ✓
P immediately left of Q (1 then 2)? ✓    All five placed? ✓
```

### Answer

| Question | Answer |
|---|---|
| Left end | **P** |
| Between R and T | **S** |
| Full row | P, Q, R, S, T |
| Check | Every clue verified ✓ |

### Trap to Remember

Don't guess — the pair (P, Q) had only ONE possible spot once R and T were placed. Start with the definite clues and the arrangement builds itself. Also note "immediately to the left" means neighbours: P and Q touch.

---

## 11.2 Determine the Valid Conclusion

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Syllogisms |
| **Companies** | Wipro, Accenture |

### Problem Statement

Statements: All cats are mammals. All mammals are animals.
Conclusions: (1) All cats are animals. (2) Some animals are cats. (3) All animals are cats. Which conclusions follow?

### Step-by-Step Solution

**Step 1 — Draw the circles:**

```
Cats' circle sits inside Mammals' circle, which sits inside Animals' circle.
```

**Step 2 — Test conclusion (1):** all cats are animals — the chain:

```
Cats → Mammals → Animals
```

Continuous chain → **follows** ✓

**Step 3 — Test conclusion (2):** some animals are cats — safe flip of (1):

"All cats are animals" flips safely to "Some animals are cats" → **follows** ✓

**Step 4 — Test conclusion (3):** all animals are cats — reversing "all":

The animals' circle is bigger; cats are only a part of it → **does not follow** ✗

### Answer

| Conclusion | Verdict |
|---|---|
| (1) All cats are animals | **Follows** ✓ (chain) |
| (2) Some animals are cats | **Follows** ✓ (safe flip) |
| (3) All animals are cats | **Does not follow** ✗ (never reverse "all") |
| Final answer | (1) and (2) |

### Trap to Remember

The classic exam trap is conclusion (3) — it sounds mirror-symmetric but reverses the direction of "all." If the circles show animals bigger than cats, "all animals are cats" can't be true, while "some animals are cats" definitely is.

---

*Happy studying! — TheWebytes Aptitude Team*
