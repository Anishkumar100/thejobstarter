# Aptitude Learning Document — Seating Arrangements

> A simple, student-friendly guide to seating puzzles — "five friends sit in a row; A is at the extreme left, who is in the middle?" and "six friends around a circular table; who sits opposite F?"
> Two tools: draw the row and fill one clue at a time, and place the anchor person on the circle first. Both chapters reward slow drawings over fast guesses.

---

# 15. Seating Arrangements

> **Lesson Overview:** **Linear arrangements** give you people in a row with clues about who sits next to whom — you build the row seat by seat. **Circular arrangements** do the same thing around a table — you place an anchor person, then attach everyone else clockwise or anticlockwise.
> - **Category:** Logical Reasoning
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 15.1 Linear Arrangement

### The Simple Idea

A row is a line of seats: `___ ___ ___ ___ ___`. Every clue places someone into one of those seats. The trick is the **order of placing** — put the definite clues down first, then the relative ones, and verify at the end.

> **The Golden Rule: draw the row before you read the clues.** The row is the picture the clues paint into. Without the picture, every clue is a guess.

### The Seat-Drawing Tool

Draw one blank per person before reading the question:

```
seat 1    seat 2    seat 3    seat 4    seat 5
  ___      ___      ___      ___      ___
```

### The Clue Dictionary (Know Every Phrase)

| Clue | Meaning | Example |
|---|---|---|
| "at the extreme left" | The very first seat | A at seat 1 |
| "at the extreme right" | The very last seat | B at seat 5 |
| "immediately to the right of" | Next seat over, one step | C immediately right of A → A C |
| "immediately to the left of" | Next seat over, the other way | D immediately left of B → D B |
| "sits between X and Y" | One seat with both as neighbours | E between C and D → C E D |
| "at one of the ends" | Seat 1 or seat 5 (not yet known) | A at an end |

### The Two-Step Placement Order

```
Step 1: place the DEFINITE clues — extreme ends and middle first
Step 2: place the IMMEDIATE-NEIGHBOUR clues next — one step at a time
Step 3: verify — read every clue against the finished row
```

### Worked Example — Five Friends in a Row

**Question:** Five friends — A, B, C, D, E — sit in a row facing north. A sits at the extreme left. C sits immediately to the right of A. B sits at the extreme right. D sits immediately to the left of B. Who sits in the middle?

```
Step 1 — draw the five seats:
seat 1    seat 2    seat 3    seat 4    seat 5
  ___      ___      ___      ___      ___

Step 2 — place the definite clues:
A at extreme left → seat 1 = A
B at extreme right → seat 5 = B

Step 3 — place the neighbour clues:
C immediately right of A → seat 2 = C
D immediately left of B → seat 4 = D

Step 4 — the leftover seat:
seat 3 = E

Final row:  A  C  E  D  B
```

**Verify:** A at left ✓ · C right of A ✓ · B at right ✓ · D left of B ✓.

The answer: **E** sits in the middle.

### The Verification Habit (Always Do This)

Read every clue back against the finished row, one at a time. If one clue fails, the row is wrong — and it is faster to redraw than to argue with the paper.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reading "right of" as your right, not the row's | Mirror-image rows | People face north by default — your right IS their right, but only if everyone faces the same way |
| Placing relative clues first | Blank seats everywhere | Extremes and middle first, always |
| Skipping the drawing | Clues tangled in the head | One blank per person, every time |
| Forgetting the leftover | The unused name | After placing all clues, the empty seat belongs to the leftover |
| Not verifying | One clue quietly violated | Read every clue against the final row |

### Quick Self-Test (answers at the bottom)

1. In a row of 5, X sits 3rd from the left. Position from the right is — (a) 2nd  (b) 3rd  (c) 4th  (d) 1st
2. Five friends in a row: A extreme left, C immediately right of A, B extreme right, D immediately left of B. The middle seat belongs to — (a) A  (b) C  (c) E  (d) D
3. In a row of 7, X sits 4th from the left. How many people sit to X's right? — (a) 2  (b) 3  (c) 4  (d) 5
4. "A sits between B and C" — a possible left-to-right order is — (a) B A C  (b) A B C  (c) C B A  (d) B C A
5. In a row of 5, if D sits immediately left of B and B is in the middle, D is at — (a) seat 1  (b) seat 2  (c) seat 3  (d) seat 4

**Answers:** 1→b (5 − 3 + 1 = 3rd), 2→c, 3→b (7 − 4 = 3), 4→a, 5→b (B in seat 3, D one seat left → seat 2).

### Key Takeaway

Draw the row first, one blank per person. Place extreme-end and middle clues first, neighbour clues second, then give the leftover seat to the unused name. Finish by reading every clue against the row — a row that passes all clues cannot be wrong.

---

## 15.2 Circular Arrangement

### The Simple Idea

Same game, round table. The circle has no "left end" or "right end", so every clue is about **who is next to whom** — and which direction counts as left or right depends on which way everyone faces.

> **The Golden Rule: place the anchor first.** The person with the most clues — or the "sits opposite" clue — anchors the circle. Everything else is attached to the anchor, one person at a time.

### The Facing Rule (The Only Table You Need)

Everyone faces the centre unless the question says otherwise.

| Facing the centre | Direction | Memory anchor |
|---|---|---|
| Immediate LEFT | Clockwise | Face the centre — your left hand sweeps clockwise |
| Immediate RIGHT | Anticlockwise | Face the centre — your right hand sweeps anticlockwise |

```
Facing the centre (looking in):
  left  = clockwise  ✓
  right = anticlockwise ✓
```

### The Circle-Drawing Tool

Draw the seats around a clock face — it gives every seat a name:

```
        12
       /   \
     10     2
    /         \
   8           4
    \         /
     6       4?
```

Hmm — six seats around a clock face:

```
        seat 1 (12)
      /           \
 seat 6 (10)      seat 2 (2)
      \           /
        seat 5 (8)
        /       \
   seat 4 (6)  seat 3 (4)
```

Use "opposite" clues to anchor: seat 1 faces seat 4, seat 2 faces seat 5, seat 3 faces seat 6.

### Worked Example — Six Friends Around the Table

**Question:** Six friends — A, B, C, D, E, F — sit around a circular table facing the centre. A sits opposite D. B sits to the immediate right of A. C sits to the immediate left of A. E sits opposite C. Who sits opposite F?

```
Step 1 — anchor with the opposite clue:
A at seat 1 (12) → D at seat 4 (6)

Step 2 — attach the neighbours of A:
B immediate RIGHT of A → right is anticlockwise → seat 6 (10)
C immediate LEFT of A → left is clockwise → seat 2 (2)

Step 3 — attach E to the next opposite clue:
E sits opposite C (seat 2) → E at seat 5 (8)

Step 4 — the leftover seat:
seat 3 (4) = F

Final circle (clockwise):  A(12)  C(2)  F(4)  D(6)  E(8)  B(10)
```

**Verify:** A opposite D ✓ · B right of A ✓ · C left of A ✓ · E opposite C ✓.

The answer: F sits at seat 3, and the seat opposite seat 3 is **seat 6 = B**. So **B sits opposite F**.

### The Anchor Person Trick

When a clue says "X sits opposite Y", place X first — it instantly splits the circle into two known halves. Opposite clues are the most powerful; use them before any neighbour clue.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Mixing up left/right directions | Left treated as anticlockwise | Facing the centre: left = clockwise, right = anticlockwise |
| Ignoring the facing direction | "Right of" flipped | Check whether they face the centre or face outside |
| Attaching before anchoring | Circle floats with no fixed point | Place the opposite-clue person first |
| Counting the answer person | "Between X and Y" includes X and Y | Count the seats between them, not them |
| Drawing a row for a circle | Ends exist where they don't | Circles have no ends — only neighbours |

### Quick Self-Test (answers at the bottom)

1. Six friends around a table facing the centre: A opposite D, B right of A, C left of A, E opposite C. Who sits opposite F? — (a) A  (b) B  (c) C  (d) E
2. Facing the centre of a circular table, a person's LEFT is — (a) clockwise  (b) anticlockwise  (c) opposite  (d) depends on the seat
3. In a circular arrangement of 6 facing the centre, how many people sit between X and the person opposite X? — (a) 1  (b) 2  (c) 3  (d) 4
4. In a 5-person circle, if X is second to the left of Y, how many people sit between them on the short side? — (a) 0  (b) 1  (c) 2  (d) 3
5. Facing the centre, moving anticlockwise from a person means moving to their — (a) left  (b) right  (c) opposite  (d) same seat

**Answers:** 1→b, 2→a, 3→b (2 on each side of the opposite pair), 4→b, 5→b.

### Key Takeaway

Place the anchor person first — the one with the opposite clue. Attach everyone else one at a time: facing the centre, left is clockwise and right is anticlockwise. Use the leftover seat for the unused name, then verify every clue against the finished circle.
