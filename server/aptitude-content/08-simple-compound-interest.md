# Aptitude Learning Document — Simple & Compound Interest

> A comprehensive, student-friendly guide to the money chapter — what a bank's "8% per annum" really means, how simple interest grows in a straight line, and why compound interest is a snowball that quietly rolls over its own interest.
> One mindset change unlocks this whole chapter: **interest is rent paid for using someone's money.** The only question is whether the rent is calculated on the original money (simple) or on the ever-growing balance (compound).

---

# 8. Simple & Compound Interest

> **Lesson Overview:** You borrow ₹5,000 from a bank at 8% per annum. Simple Interest (SI) charges 8% of the ORIGINAL ₹5,000 every year — same rent forever. Compound Interest (CI) charges 8% of whatever you owe THAT year — the rent grows because the balance grows. Same story, two ways of counting rent, and CI always wins after the first year.
> - **Category:** Quantitative Aptitude
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 8.1 Simple Interest

### The Bank's Vocabulary (Four Words, One Story)

Every interest question uses exactly four ideas:

| Word | Meaning | Example |
|---|---|---|
| **Principal (P)** | The original money borrowed or deposited | ₹5,000 |
| **Rate (R)** | The yearly rent, as a percentage of the principal | 8% per annum |
| **Time (T)** | How long the money is used, measured in YEARS | 3 years |
| **Interest (SI)** | The total rent paid for using the money | ₹1,200 |

**The core idea:** the bank charges **8% of the principal** every single year. Year 1 → ₹400. Year 2 → ₹400. Year 3 → ₹400. The rent never changes, because it is always computed on the original ₹5,000 — never on the growing balance.

### The Formula (One Formula, Three Letters)

> **SI = (P × R × T) ÷ 100**

And the final amount you pay back:

> **Amount (A) = P + SI**

**Example — ₹5,000 at 8% for 3 years:**

```
SI = (5000 × 8 × 3) ÷ 100
   = 120000 ÷ 100
   = ₹1,200

Amount = 5000 + 1200 = ₹6,200
```

**Why ÷ 100?** R is a percentage (out of 100), so P × R × T gives the answer in "percentage units" — dividing by 100 converts it back to rupees.

### The Time Conversion Table (Get This Right First)

The formula wants T in **years**. Exam questions love hiding the time in other units:

| Given time | Convert to years | Example |
|---|---|---|
| 1 year | 1 | — |
| 6 months | 0.5 | 1/2 year |
| 18 months | 1.5 | 1½ years |
| 2 years 4 months | 2 + 4/12 | 2⅓ years |
| 73 days | 73 ÷ 365 | 1/5 year |
| 146 days | 146 ÷ 365 | 2/5 year |

**Memory anchor:** months → divide by 12. Days → divide by 365 (unless the question says a 360-day year).

### The Rate Multiplier Table (Read SI the Fast Way)

SI per year = P × (R/100). So the yearly rent is instantly:

| Rate (R) | Yearly interest on ₹1,000 | Yearly interest on ₹5,000 |
|---|---|---|
| 5% | ₹50 | ₹250 |
| 8% | ₹80 | ₹400 |
| 10% | ₹100 | ₹500 |
| 12% | ₹120 | ₹600 |
| 15% | ₹150 | ₹750 |

Look how linear it is: every year adds the SAME amount. That straight-line growth is the fingerprint of simple interest.

### The Five Ways to Use One Formula

SI = P×R×T/100 has four letters — any three give you the fourth. The table shows each case:

| You know | You want | Formula | Example |
|---|---|---|---|
| P, R, T | SI | (P×R×T)/100 | ₹5,000 @ 8% × 3 yr → ₹1,200 |
| P, R, T | Amount | P + SI | ₹5,000 → ₹6,200 |
| P, T, SI | R | (SI × 100)/(P×T) | SI ₹1,200, P ₹5,000, T 3 → R = 8% |
| P, R, SI | T | (SI × 100)/(P×R) | SI ₹1,200, P ₹5,000, R 8 → T = 3 yr |
| R, T, SI | P | (SI × 100)/(R×T) | SI ₹1,200, R 8, T 3 → P = ₹5,000 |

**Example — finding the rate:** a sum of ₹4,000 earns ₹800 in 2 years. Rate?

```
R = (800 × 100) ÷ (4000 × 2) = 80000 ÷ 8000 = 10%
```

Check: 10% of 4,000 = 400 per year × 2 years = 800 ✓.

### The Year-by-Year Picture (Why It's "Simple")

Follow ₹1,000 at 10% simple interest, year after year:

| Year | Balance at start | Interest that year (10% of P) | Balance at end |
|---|---|---|---|
| 1 | ₹1,000 | ₹100 | ₹1,100 |
| 2 | ₹1,100 | ₹100 | ₹1,200 |
| 3 | ₹1,200 | ₹100 | ₹1,300 |
| 4 | ₹1,300 | ₹100 | ₹1,400 |

The interest column is frozen at ₹100 forever — always 10% of the ORIGINAL ₹1,000. Every year is identical. (Keep this table in your head; the compound table next is its evil twin.)

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Time not in years | 6 months used as "6" | Divide months by 12 |
| Rate as a decimal | "8" used as 0.08 in the ÷100 formula | Either use 8 with ÷100, or 0.08 without |
| Adding rent to the wrong base | Computing 8% of the new balance | SI is ALWAYS on the original P |
| Confusing SI and Amount | Reporting ₹1,200 instead of ₹6,200 | Read "interest" vs "amount" in the question |

### Quick Self-Test (answers at the bottom)

1. Simple interest on ₹5,000 at 8% per annum for 3 years? (a) ₹1,200  (b) ₹1,500  (c) ₹1,000  (d) ₹1,800
2. Simple interest on ₹2,000 at 5% per annum for 2 years? (a) ₹100  (b) ₹200  (c) ₹300  (d) ₹400
3. A sum becomes ₹1,100 after 1 year at 10% simple interest. The principal was — (a) ₹1,000  (b) ₹990  (c) ₹1,100  (d) ₹900
4. In simple interest, the interest earned each year is — (a) the same every year  (b) increasing every year  (c) decreasing every year  (d) zero after the first year
5. The amount on ₹4,000 at 5% per annum for 2 years (simple) is — (a) ₹4,400  (b) ₹4,200  (c) ₹4,000  (d) ₹4,500

**Answers:** 1→a (5000×8×3/100 = 1200), 2→b (2000×5×2/100 = 200), 3→a (1100 ÷ 1.10), 4→a, 5→a (SI 400 + P 4000).

### Key Takeaway

SI = (P × R × T) ÷ 100, with time in years and R as the plain number. The interest is the same every year because it is always a slice of the original principal. Master the "five ways" table and any SI question is a one-line substitution.

---

## 8.2 Compound Interest

### The Snowball Story

Compound interest is interest on interest. Every year, the bank charges the rate on **whatever you currently owe** — and since you owe more each year, the rent itself grows. It's a snowball: the bigger it gets, the faster it grows.

**Example — ₹1,000 at 10% for 2 years:**

```
Year 1:  1000 × 1.10 = 1100      (interest ₹100)
Year 2:  1100 × 1.10 = 1210      (interest ₹110 — on ₹1,100, not ₹1,000!)

CI = 1210 − 1000 = ₹210
```

The second year earns ₹110 instead of ₹100 — the extra ₹10 is "interest on interest." Tiny at first, enormous over decades.

### The Formula

> **Amount = P × (1 + R/100)^T**
> **CI = Amount − P**

**Why (1 + R/100)?** One year at 10% multiplies the money by 1.10 — that's your multiplier from the Percentages chapter, reused here. Two years multiplies twice: 1.10 × 1.10 = 1.21. The exponent just counts how many years the snowball rolls.

### The Year-by-Year Picture (Compare with the SI Table!)

The same ₹1,000 at 10%, now compounded:

| Year | Balance at start | Interest that year (10% of balance) | Balance at end |
|---|---|---|---|
| 1 | ₹1,000 | ₹100 | ₹1,100 |
| 2 | ₹1,100 | ₹110 | ₹1,210 |
| 3 | ₹1,210 | ₹121 | ₹1,331 |
| 4 | ₹1,331 | ₹133.10 | ₹1,464.10 |

Compare with the simple table above — same money, same rate, same years. The interest column here climbs: 100, 110, 121, 133.10. That climbing column is the entire difference between the two chapters.

### SI vs CI — The Head-to-Head Table

| Year | Balance with SI (10%) | Balance with CI (10%) | Who is ahead? |
|---|---|---|---|
| 1 | ₹1,100 | ₹1,100 | Tie |
| 2 | ₹1,200 | ₹1,210 | CI by ₹10 |
| 3 | ₹1,300 | ₹1,331 | CI by ₹31 |
| 4 | ₹1,400 | ₹1,464.10 | CI by ₹64.10 |

Year 1 is a tie — interest hasn't had anything to roll over yet. From year 2 on, CI pulls ahead, and the gap widens every year. That gap is the **CI − SI difference**, the most asked question in this chapter.

### The CI − SI Difference Formulas (The Exam's Favourite)

| Time | CI − SI (with P and R) | Example: P = 10,000, R = 10% |
|---|---|---|
| 2 years | P × (R/100)² | 10000 × 0.1² = **₹100** |
| 3 years | P × (R/100)² × (3 + R/100) | 10000 × 0.01 × 3.1 = **₹310** |

**2-year check with ₹10,000 at 10%:**

```
CI = 10000 × 1.21 − 10000 = 12100 − 10000 = ₹2,100
SI = (10000 × 10 × 2) / 100 = ₹2,000
Difference = ₹100 ✓
```

The formula P × (R/100)² is the 10-second version — it's literally "the interest on the first year's interest."

### The Multiplier Table (Memorise These Three Rows)

| Rate | 1-year multiplier | 2-year multiplier | 3-year multiplier |
|---|---|---|---|
| 5% | 1.05 | 1.1025 | 1.1576 |
| 10% | 1.10 | 1.21 | 1.331 |
| 20% | 1.20 | 1.44 | 1.728 |

A 2-year question at 10% is then just: Amount = P × **1.21**. No exponent needed — the table did the work.

### Compounding More Often Than Yearly

| Frequency | Adjust the rate | Adjust the time | Formula |
|---|---|---|---|
| Yearly | R | T | P × (1 + R/100)^T |
| Half-yearly | R/2 | 2T | P × (1 + R/200)^(2T) |
| Quarterly | R/4 | 4T | P × (1 + R/400)^(4T) |

**Example — ₹5,000 at 10% compounded half-yearly for 1 year:**

```
Amount = 5000 × (1 + 0.05)² = 5000 × 1.1025 = ₹5,512.50
CI = ₹512.50 (more than the yearly ₹500 — frequent compounding earns more)
```

### Worked Examples

**Example 1 — plain CI:** CI on ₹8,000 at 10% for 2 years?

```
Amount = 8000 × 1.21 = ₹9,680
CI = 9680 − 8000 = ₹1,680
```

Check: year 1 interest 800, year 2 interest 880 → total 1,680 ✓.

**Example 2 — difference:** CI − SI on ₹12,000 at 20% for 2 years?

```
Formula: P × (R/100)² = 12000 × 0.04 = ₹480
Check: CI = 12000 × 1.44 − 12000 = 17280 − 12000 = 5280
      SI = 12000 × 0.2 × 2 = 4800
      Difference = 5280 − 4800 = 480 ✓
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Adding the rate years | "10% for 2 years = 20%" | Multiply multipliers: 1.1 × 1.1 = 1.21 |
| Computing CI like SI | Same interest both years | Year 2 interest is on year 2's opening balance |
| Forgetting to subtract P | Reporting Amount as CI | CI = Amount − P, always |
| Half-yearly confusion | Halving time instead of rate | Half-yearly: rate ÷ 2 AND time × 2 |
| Using the 2-year formula for 3 years | Wrong difference | 3 years: P(R/100)²(3 + R/100) |

### Quick Self-Test (answers at the bottom)

1. Compound interest on ₹10,000 at 10% per annum for 2 years? (a) ₹2,100  (b) ₹2,000  (c) ₹1,210  (d) ₹1,000
2. Compound interest on ₹5,000 at 20% per annum for 2 years? (a) ₹2,400  (b) ₹2,200  (c) ₹2,000  (d) ₹1,800
3. The difference between CI and SI on ₹10,000 at 10% per annum for 2 years? (a) ₹200  (b) ₹100  (c) ₹1,000  (d) ₹210
4. For the same principal, rate and time (more than 1 year), compound interest is — (a) always more than SI  (b) always less than SI  (c) equal to SI  (d) equal to half of SI
5. On ₹1,000 at 10% compounded yearly, the interest earned in the SECOND year is — (a) ₹110  (b) ₹100  (c) ₹121  (d) ₹210

**Answers:** 1→a (12100 − 10000), 2→b (5000 × 1.44 − 5000 = 2200), 3→b (10000 × 0.1² = 100), 4→a, 5→a (10% of the year-2 opening balance 1,100).

### Key Takeaway

Compound interest is the snowball: Amount = P × (1 + R/100)^T, and every year's interest is the rate times THAT year's balance. After year 1, CI beats SI, and the difference for 2 years is exactly P × (R/100)². Memorise the multiplier table, halve the rate and double the time for half-yearly, and the chapter writes itself.

---

# 8. Problems

## 8.1 Calculate SI for a Given Principal

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Simple Interest |
| **Companies** | TCS, Wipro |

### Problem Statement

Find the simple interest on ₹5,000 at 8% per annum for 3 years. Also find the total amount to be repaid.

### Step-by-Step Solution

**Step 1 — Write down what you know:**

```
P = ₹5,000   R = 8%   T = 3 years
```

**Step 2 — Apply the SI formula:**

```
SI = (P × R × T) ÷ 100
   = (5000 × 8 × 3) ÷ 100
   = 120000 ÷ 100
   = ₹1,200
```

**Step 3 — Find the amount (principal + interest):**

```
Amount = P + SI = 5000 + 1200 = ₹6,200
```

**Step 4 — Verify year by year:**

```
Year 1: 8% of 5000 = ₹400
Year 2: 8% of 5000 = ₹400
Year 3: 8% of 5000 = ₹400
Total:  3 × 400 = ₹1,200 ✓
```

### Answer

| Question | Answer |
|---|---|
| Interest per year | ₹400 |
| Simple interest (3 years) | **₹1,200** |
| Amount to be repaid | **₹6,200** |
| Check | 3 × 400 = 1,200 ✓ |

### Trap to Remember

Every year's interest is on the ORIGINAL ₹5,000 — never on the growing balance (that would be compound interest). And read the question: "interest" wants ₹1,200, "amount" wants ₹6,200. Missing the difference loses the mark.

---

## 8.2 Calculate CI–SI Difference

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Compound Interest |
| **Companies** | Infosys, Accenture |

### Problem Statement

Find the difference between the compound interest and the simple interest on ₹10,000 at 10% per annum for 2 years.

### Step-by-Step Solution

**Step 1 — Compute the simple interest:**

```
SI = (10000 × 10 × 2) ÷ 100 = ₹2,000
```

**Step 2 — Compute the compound interest:**

```
Amount = P × (1 + R/100)² = 10000 × 1.1 × 1.1 = 10000 × 1.21 = ₹12,100
CI = 12100 − 10000 = ₹2,100
```

**Step 3 — Find the difference:**

```
CI − SI = 2100 − 2000 = ₹100
```

**Step 4 — Verify with the shortcut formula:**

```
CI − SI = P × (R/100)² = 10000 × (10/100)² = 10000 × 0.01 = ₹100 ✓
```

### Answer

| Question | Answer |
|---|---|
| Simple interest | ₹2,000 |
| Compound interest | ₹2,100 |
| Difference | **₹100** |
| Check | 10000 × 0.1² = 100 ✓ |

### Trap to Remember

The difference is NOT the whole extra ₹100 being charged twice — it is exactly the interest earned on the first year's ₹1,000 of interest (10% of 1,000 = ₹100). For 2 years that's always P × (R/100)². For 3 years, remember the longer version: P × (R/100)² × (3 + R/100).

---

*Happy studying! — TheWebytes Aptitude Team*
