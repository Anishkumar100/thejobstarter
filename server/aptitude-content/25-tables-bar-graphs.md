# Aptitude Learning Document — Tables & Bar Graphs

> A simple, student-friendly guide to reading data — a quarterly sales table and a three-month bar graph: "what was total Q1 sales?", "which bar is tallest?"
> Two tools: the Cell-Eyes Method for tables (read the column meanings, then read-compare-compute) and the Bar-Eye Method for graphs (axis labels first, then heights).

---

# 25. Tables & Bar Graphs

> **Lesson Overview:** **Tabular Data** questions give you a table of numbers and ask you to read a cell, add a row, or compute a percentage change. **Bar Graph** questions show the same numbers as bars — you compare heights by eye and compute only when the question demands precision.
> - **Category:** Data Interpretation
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 25.1 Tabular Data Interpretation

### The Simple Idea

A table is a filing cabinet: rows are categories, columns are measures. The exam gives you a small section and asks three kinds of questions — **read** a cell, **compare** two rows, or **compute** total/percentage. There is no hidden data; every answer is sitting in a cell.

> **The Golden Rule: the columns are the vocabulary — read them first.** Never touch a number before you know what the row and column headings mean. A table read with wrong headings is a wrong answer, however accurate the arithmetic.

### The Three Question Types (Every Table Question Is One of These)

```
┌──────────────────────────────────────────────────┐
│  TYPE 1 — DIRECT READ                            │
│  "Which region was highest in Q2?"               │
│  → find the cell, name it                        │
├──────────────────────────────────────────────────┤
│  TYPE 2 — SUM OR AVERAGE                         │
│  "Total sales in Q1?" → add the row              │
├──────────────────────────────────────────────────┤
│  TYPE 3 — PERCENTAGE CHANGE                      │
│  "North's increase from Q1 to Q2?"               │
│  → (new − old) ÷ old × 100                      │
│  → the base is ALWAYS the OLD value              │
└──────────────────────────────────────────────────┘
```

### The Cell-Eyes Method

```
STEP 1  READ THE ANATOMY — rows and columns:
        rows = regions, columns = quarters

STEP 2  LOCATE what the question asks:
        "total Q1" → the whole Q1 COLUMN

STEP 3  COMPUTE with discipline:
        add, subtract, or divide — no rounding
        until the final step

STEP 4  SANITY-CHECK the unit (lakhs? thousands?)
        and the base (increase is on the old number)
```

### Worked Example — The Sales Table

**Table: Quarterly Sales (in lakhs)**

| Region | Q1 | Q2 | Q3 |
|---|---|---|---|
| North | 120 | 150 | 140 |
| West | 80 | 100 | 120 |
| South | 90 | 110 | 95 |

**Question 1 (Direct read):** Which region had the highest sales in Q2?

```
Locate the Q2 column: North 150, West 100, South 110
Highest → NORTH (150) ✓
```

**Question 2 (Sum):** What were the total sales in Q1?

```
Add the Q1 column: 120 + 80 + 90 = 290 lakhs
```

**Question 3 (Percentage change):** By what percentage did North's sales rise from Q1 to Q2?

```
New = 150, Old = 120
Increase = (150 − 120) ÷ 120 × 100 = 30 ÷ 120 × 100 = 25%

NORTH rose by 25% ✓
```

### The Percentage-Base Trap

Increase percentage is ALWAYS calculated on the OLD value:

```
150 vs 120 → rise of 30 → 30/120 = 25%  ✓
(Not 30/150 = 20% — that is the decrease from the new value)
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Reading the wrong column | Q2 answers from Q3 numbers | Match the quarter column before reading |
| Wrong percentage base | Dividing by the new value | Increase % = rise ÷ OLD × 100 |
| Ignoring units | 290 lakhs read as 290 rupees | Annex the unit from the table's heading |
| Rounding early | Percentages off by decimals | Round only the final answer |
| Summing the wrong direction | Adding a row when the question wants a column | "Total in Q1" = the Q1 COLUMN |

### Quick Self-Test (answers at the bottom)

**Table: Quarterly Sales (in lakhs)**

| Region | Q1 | Q2 | Q3 |
|---|---|---|---|
| North | 120 | 150 | 140 |
| West | 80 | 100 | 120 |
| South | 90 | 110 | 95 |

1. Which region had the highest sales in Q2? — (a) North  (b) West  (c) South  (d) All equal
2. Total sales in Q1? — (a) 220  (b) 290  (c) 300  (d) 310
3. North's percentage increase from Q1 to Q2? — (a) 20%  (b) 15%  (c) 30%  (d) 25%
4. Total sales in Q3? — (a) 345  (b) 350  (c) 355  (d) 360
5. Increase percentage is calculated on — (a) The new value  (b) The old value  (c) The difference  (d) The average

**Answers:** 1→a, 2→b, 3→d, 4→c, 5→b.

### Key Takeaway

Tables are filing cabinets: read the column headings before any number, then classify the question — read, sum, or percentage. For percentage change, the base is always the old value, and the unit is always written in the table's title.

---

## 25.2 Bar Graph Interpretation

### The Simple Idea

A bar graph is a table drawn as buildings — the **height of the bar IS the number**. Direct reads and comparisons are done by eye against the gridlines; only sum and percentage questions need precise arithmetic.

> **The Golden Rule: read the axis before you read the bars.** The horizontal axis names the categories, the vertical axis sets the scale — every bar's height means nothing until you know what one tick equals.

### The Bar-Eye Method

```
STEP 1  AXIS CHECK — what do the bars represent?
        horizontal = category, vertical = value + unit

STEP 2  SCALE CHECK — what does one gridline equal?
        10? 20? 100? (misread this and every bar lies)

STEP 3  READ by height, COMPUTE by tick:
        direct questions → eye the tallest bar
        sums/percentages → write the numbers, then add/divide
```

### Worked Example — The Monthly Sales Bars

**Bar Graph: Sales (in thousands)**

```
  Sales (thousands)
   90 ┤                        ██
   80 ┤                 ██
   70 ┤                 ██
   60 ┤          ██     ██
   50 ┤          ██     ██
   40 ┤          ██     ██
   30 ┤     ██   ██     ██
   20 ┤     ██   ██     ██
   10 ┤     ██   ██     ██
    0 ┼────────────────────────
              Jan  Feb   Mar
```

Values: Jan = 50, Feb = 70, Mar = 90 (thousands).

**Question 1 (Direct read):** Which month had the highest sales?

```
Tallest bar → MAR (90) ✓
```

**Question 2 (Compare):** What is the difference between the highest and lowest months?

```
Highest = Mar 90, Lowest = Jan 50
Difference = 90 − 50 = 40 thousand ✓
```

**Question 3 (Sum):** What were Jan and Mar combined?

```
50 + 90 = 140 thousand ✓
```

### The Grouped-Bar Twist (Two Bars Per Label)

Sometimes each label carries TWO bars — one per product or year:

```
      Product A  ▒  Product B  ░

        Jan ░░░▒▒▒    Feb ░░▒▒█    Mar ░░░▒▒▒
```

When bars are grouped, always read the **legend** (the key) to know which colour is which product. "The highest bar" is meaningless until the colour is named.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Misreading the scale | A bar at 70 read as 7 | One tick can be 10; count the ticks |
| Ignoring units | Thousands read as units | The axis title carries the unit |
| Eye-only precision | "Seems like 140" for a sum | Write the numbers down, then add |
| Forgetting the legend | Product A colour read as B | Read the key before any grouped bar |
| Comparing wrong labels | Feb compared to Dec | Match the label under each bar |

### Quick Self-Test (answers at the bottom)

**Bar Graph: Monthly sales — Jan 50, Feb 70, Mar 90 (thousands).**

1. Which month had the highest sales? — (a) Jan  (b) Feb  (c) Mar  (d) All equal
2. Difference between the highest and lowest months? — (a) 20  (b) 30  (c) 40  (d) 50
3. Jan and Mar combined? — (a) 120  (b) 130  (c) 140  (d) 150
4. Difference between Feb and Jan? — (a) 20  (b) 10  (c) 30  (d) 40
5. Before reading grouped bars you must check — (a) The legend  (b) The date  (c) The title only  (d) Nothing

**Answers:** 1→c, 2→c, 3→c, 4→a, 5→a.

### Key Takeaway

Bar graphs are buildings of data: read the axis for categories and units, read the scale for the value of one tick, then read heights by eye. Sums and percentages still need the numbers written down — and grouped bars always come with a legend you must read first.