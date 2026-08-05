# Aptitude Learning Document — Mixed & Caselet DI

> The grand finale of the data unit — the two question styles where the chart is NOT handed to you ready-made. In a **caselet** the data hides inside a paragraph and you must BUILD the table; in **mixed-graph** DI the data spreads across TWO charts that must be connected through a shared quantity.
> Two tools: the **Case-Builder Method** (extract → grid → gaps → unit) and the **Chart-Bridge Method** (read chart A, transfer into chart B, never cross years).

---

# 28. Mixed & Caselet DI

> **Lesson Overview:** A **caselet** is data in paragraph form — your first job is to convert the words into a clean grid, then answer like a normal table question. **Mixed-graph DI** puts two charts side by side — a bar and a pie, or two lines — and the questions force you to carry a number from one chart into the other. Both punish skimming and reward structure.
> - **Category:** Data Interpretation
> - **Difficulty:** Easy
> - **Problems:** 2

---

# 28.1 Caselet-Based DI

### The Simple Idea

A caselet is a paragraph that is secretly a table. All the numbers you need are sitting in the sentences — the challenge is **extraction and organisation**, not arithmetic. Read it like a detective: underline each actor (salaries? books? sports?) and each number, then arrange them into rows and columns. Once the grid exists, the questions are normal table questions.

> **The Golden Rule: build the grid before you attempt one answer.** Every question is answered from the complete picture; answering from the raw paragraph is how the "rest" quantities get missed.

### The Case-Builder Method

```
STEP 1  EXTRACT — read the paragraph and collect:
             EVERY actor (category) named
             EVERY number attached to an actor

STEP 2  GRID — lay the actors out as rows,
             fill in each number that was named,
             leave "rest / remaining" as an empty cell

STEP 3  FILL THE GAPS — "rest" = total − (all named parts).
             Compute the empty cells first.

STEP 4  NAME THE UNIT — crores? rupees? % of whom?
             Attach it to every answer.
```

### The Unsaid-Total Rule

A caselet usually starts with one big number — the TOTAL. Everything after it is a slice:

```
When a sentence says "₹20,000 to books, and the rest to sports":
     REST = TOTAL  −  (every named slice so far)
Not rest = just ₹20,000, and not rest = an eyeball guess.
```

### Worked Example — The School Budget Caselet

**Caselet:** A school's monthly budget is **₹1,00,000**. **40%** goes to teachers' salaries, **₹20,000** goes to books, and the **rest** goes to sports. Half of the sports money is spent on **cricket equipment**.

**Step 1 — Extract the actors and numbers:**

```
ACTORS: salaries, books, sports (→ cricket equipment)
TOTAL: ₹1,00,000
NUMBERS: 40% → salaries; ₹20,000 → books;
         rest → sports; half of sports → cricket
```

**Step 2 — Build the grid:**

| Item | Amount |
|---|---|
| Salaries (40%) | ₹40,000 |
| Books | ₹20,000 |
| Sports (the rest) | ? |
| Cricket equipment (½ ≈ sports) | ? |
| **Total** | **₹1,00,000** |

**Step 3 — Fill the gaps:**

```
Sports = 1,00,000 − 40,000 − 20,000 = ₹40,000
Cricket equipment = half of sports = ₹20,000
```

**Step 4 — Answer the questions:**

```
Q1  How much on salaries?      → ₹40,000
Q2  How much on sports?        → ₹40,000
Q3  How much on cricket?       → ₹20,000
Q4  Books as a percentage?     → 20,000/1,00,000 = 20%
```

### The Half-of-the-Rest Curse

Watch which number "half" attaches to:

```
"Half the sports money"    → ½ × sports (₹20,000) ✓
"Half the total budget"    → ½ × 1,00,000 (₹50,000) — DIFFERENT!
"Half of books"            → ½ × 20,000 (₹10,000) — DIFFERENT!
```

The sentence names its own base every time — read it twice.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Skimming the total | Using 40% on the wrong base | The first line carries the total — tag it |
| Missing the "rest" | Filling sports as ₹20,000 | rest = total − all named parts |
| Wrong half-base | Halving the total instead of sports | Read WHICH quantity "half of" attaches to |
| Overlap double-count | Counting only-both twice | A caselet's groups rarely overlap — trust the sentence |
| Unit drift | Crore answers in rupees | Name the unit once, attach it everywhere |

### Quick Self-Test (answers at the bottom)

**Caselet:** Monthly budget ₹1,00,000. Salaries 40%, books ₹20,000, rest = sports. Half the sports money = cricket equipment.

1. Amount on teachers' salaries — (a) ₹30,000  (b) ₹50,000  (c) ₹40,000  (d) ₹20,000
2. Amount on sports — (a) ₹60,000  (b) ₹40,000  (c) ₹30,000  (d) ₹50,000
3. Amount on cricket equipment — (a) ₹20,000  (b) ₹10,000  (c) ₹30,000  (d) ₹40,000
4. Books as a percentage of the budget — (a) 25%  (b) 15%  (c) 10%  (d) 20%
5. "The rest" always means — (a) the largest slice alone  (b) total minus the named parts  (c) books  (d) half the total

**Answers:** 1→c, 2→b, 3→a, 4→d, 5→b.

### Key Takeaway

A caselet is a paragraph hiding a table. Extract every actor and number, build the grid, fill the "rest" as total minus the named parts, and only then answer. The arithmetic is never the problem — the extraction is.

---

## 28.2 Mixed Graph DI

### The Simple Idea

Mixed-graph DI shows **two charts together** — a bar graph of total sales per year plus a pie chart of export percentages, or two line graphs for two products. The charts are not separate puzzles; they **share one quantity**. The trick of every question is to find the link and carry the number across the bridge.

> **The Golden Rule: one chart's 100% is usually another chart's bar.** The pie is often the *inside* story of a single bar. Read the link sentence ("in 2022", "out of total sales") before touching any arithmetic.

### The Chart-Bridge Method

```
STEP 1  SCOPE — what does each chart show?
         bar = totals by year · pie = % split within ONE year

STEP 2  LINK — find the shared quantity:
         "exports in 2022" → pie's 100% = the 2022 bar

STEP 3  TRANSFER — read from chart A (the bar),
         apply chart B's % on THAT value only

STEP 4  NEVER CROSS YEARS — each pie belongs to its own bar;
         2022's % on 2021's total is always wrong
```

### The Bridge Diagram

```
        BAR GRAPH (crores per year)          PIE (export % within a year)
                                           ┌────────────────────────┐
   2021 ▓▓▓▓ 500  ──┐                     │  Exports 25%  ▓▓▓       │
   2022 ▓▓▓▓▓▓ 800  ─┴── THE BRIDGE ──→   │  Domestic 75%  ░░░     │
                                            └────────────────────────┘
       "exports in 2022" = 25% of the 2022 BAR (800), never 2021.

Exports 2022 = 25% × 800 = 200 crore
Domestic 2022 = 75% × 800 = 600 crore
```

### Worked Example — Sales Bar + Export Pie

**Chart 1 (Bar):** Company sales — 2021 = ₹500 crore, 2022 = ₹800 crore.
**Chart 2 (Pie):** 2022 split — Exports 25%, Domestic 75%.

**Question 1 (Transfer):** What were exports in 2022?

```
The pie belongs to 2022 → its 100% is 800 crore
Exports = 25% × 800 = ₹200 crore ✓
```

**Question 2 (Same year):** What were domestic sales in 2022?

```
Domestic = 75% × 800 = ₹600 crore ✓
```

**Question 3 (Second chart snapshot):** The pie also showed that in 2021 exports were 20%.

```
Exports 2021 = 20% × 500 = ₹100 crore
     (180° of the 2021 bar, not 2022's bar)
```

**Question 4 (Combined total):** Total exports across both years?

```
2021 exports (100) + 2022 exports (200) = ₹300 crore ✓
```

### The Cross-Year Fraction Trap

The pie is per-year. Mixing years corrupts the transfer:

```
Exports 2022 = 25% × 800 = 200   ✓ (same year)
25% × 500 (2021's bar) = 125      ✗ — wrong year, wrong base
```

Every percentage must multiply **the bar of the year it is drawn from**. If the question says exports rose from 20% to 25%, compute both separately, then compare.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| The cross-year fraction | 2022's % on 2021's bar | Match the % to its own year's bar |
| Ignoring the link sentence | Pie treated as a free-standing total | The pie's 100% IS one bar of the other chart |
| Double-counting the bridge | Exports counted inside total AND separately | Pick ONE flow: bar → apply % → that's the answer |
| Legend blindness | Domestic read as exports | Read the pie's labels before the pie |
| Unit drift | Crore answers mixed with lakh | The axis title sets the unit — keep it |

### Quick Self-Test (answers at the bottom)

**Bar:** Sales 2021 = ₹500 crore, 2022 = ₹800 crore. **Pie:** 2022 exports 25% (domestic 75%); 2021 exports 20%.

1. Exports in 2022 — (a) ₹200 crore  (b) ₹150 crore  (c) ₹250 crore  (d) ₹100 crore
2. Domestic sales in 2022 — (a) ₹550 crore  (b) ₹700 crore  (c) ₹600 crore  (d) ₹500 crore
3. Exports in 2021 — (a) ₹150 crore  (b) ₹80 crore  (c) ₹120 crore  (d) ₹100 crore
4. Total exports across both years — (a) ₹300 crore  (b) ₹250 crore  (c) ₹350 crore  (d) ₹400 crore
5. A pie chart in mixed DI is 100% of — (a) both bars  (b) the smaller bar  (c) one bar of its year  (d) the total of everything

**Answers:** 1→a, 2→c, 3→d, 4→a, 5→c.

### Key Takeaway

Mixed-graph DI connects two charts through one shared quantity — a pie is the inside story of a single bar. Read the scope, find the link, transfer the percentage onto the correct year's bar, and never let a fraction cross years. Structure beats speed every time.