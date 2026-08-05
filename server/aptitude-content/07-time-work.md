# Aptitude Learning Document — Time & Work

> A comprehensive, student-friendly guide to the mathematics of getting things done — how long people (and pipes) take when they work together, and how a leak changes everything.
> Master the "1 job = 1 unit" trick that turns every days-to-finish question into simple addition, and see why a filling pipe and a leaking pipe fight each other like positive and negative numbers.

---

# 7. Time & Work

> **Lesson Overview:** Every job can be thought of as exactly **1 unit of work**. If A can finish the job in 12 days, then A finishes 1/12 of the job every single day. That tiny idea — *turn days into daily fractions* — solves almost every question in this chapter. Add the daily fractions of people who work together, subtract the fraction of a leak that undoes progress, and the answer falls out. Time & Work questions appear in nearly every campus test series (TCS, Infosys, Wipro, Accenture), and the fraction logic here is the exact same language you mastered in Percentages.
> - **Category:** Quantitative Aptitude
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 7.1 Work & Efficiency

### The One Idea That Solves Everything: "1 Job = 1 Unit"

A **piece of work** — painting a wall, packing boxes, digging a field — is always treated as **ONE unit of work**.

Now the golden move: if someone can complete 1 unit of work in `d` days, then in **one day** they complete:

> **Daily work = 1 ÷ d**  (read: "one over the number of days")

**Example:** A can paint the wall in 10 days → A paints **1/10 of the wall per day**. In 5 days, A paints 5 × 1/10 = 1/2 of the wall. Simple, and everything else is built on this.

| Person | Days alone | Work per day | In 4 days |
|---|---|---|---|
| A | 10 days | 1/10 | 4/10 = 2/5 |
| B | 15 days | 1/15 | 4/15 |
| A + B | ? | 1/10 + 1/15 = 1/6 | 4/6 = 2/3 |

### Working Together — Add the Daily Fractions

If A and B work together, they both add progress **every day**. So:

> **Combined daily work = (A's daily work) + (B's daily work)**
> **Days together = 1 ÷ Combined daily work**

**Worked example — A takes 10 days, B takes 15 days, together?**
```
A's daily work  = 1/10
B's daily work  = 1/15
Combined        = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6
Days together   = 1 ÷ (1/6) = 6 days
```
Two people together are ALWAYS faster than either alone — the combined days (6) is less than both 10 and 15. If your answer is ever bigger than both individual times, you made a mistake.

### The LCM Method — The Exam Shortcut (Learn This!)

Fractions like 1/12 and 1/18 are annoying. The LCM method replaces them with whole numbers:

1. Take the **LCM of all the days** — call it the total work in "units".
2. **One day's work of each person = LCM ÷ their days.**
3. **Days together = Total units ÷ Units done per day together.**

**Worked example — A takes 12 days, B takes 18 days, together?**
```
Step 1:  LCM(12, 18) = 36 units of total work
Step 2:  A does 36 ÷ 12 = 3 units/day
         B does 36 ÷ 18 = 2 units/day
Step 3:  Together = 3 + 2 = 5 units/day
Step 4:  Days = 36 ÷ 5 = 7.2 days (7⅕ days)
```
No fractions anywhere — just 36, 3, 2, 5. This is the method to use in the exam. (Check: 1/12 + 1/18 = 5/36, so days = 36/5 ✓ same answer.)

### Finding One Person's Time When You Know the Combined Time

Sometimes you're given the combined time and one person's time, and asked for the other's:

> **B's daily work = Combined daily work − A's daily work**
> **B's days = 1 ÷ B's daily work**

**Worked example — A and B together finish in 4 days; A alone takes 12 days. B alone?**
```
Combined daily work = 1/4
A's daily work      = 1/12
B's daily work      = 1/4 − 1/12 = 3/12 − 1/12 = 2/12 = 1/6
B's days            = 1 ÷ (1/6) = 6 days
```
B alone takes 6 days — faster than A, because B contributes more of the combined speed. Makes sense.

### Efficiency — How Fast Each Person Works

**Efficiency is the amount of work done per day** (that's the "daily work" fraction we've been using, or the units/day in the LCM method).

The key relation to remember:

> **Time and efficiency are INVERSELY proportional.** If A takes half the time B takes, A is twice as efficient.

If A takes `a` days and B takes `b` days, then:

> **A : B efficiency = b : a**  (flip the times!)

**Worked example — A takes 9 days, B takes 12 days. Efficiency ratio?**
```
A : B efficiency = 12 : 9 = 4 : 3
```
A is 4/3 times as efficient as B. ✓ (Check with LCM(9,12)=36: A does 4/day, B does 3/day — exactly 4 : 3.)

**When money is shared** (wages for a completed job), it is split **in the ratio of efficiencies** — the person who contributed more work gets more money.

### Working Together with People Joining / Leaving

A classic twist: one person starts, another joins mid-way, or someone leaves before the end.

**Worked example — A alone can finish in 20 days. After A works for 8 days, B joins. Together they finish the rest in 6 more days. B alone would take how many days?**
```
Step 1:  A's daily work = 1/20
Step 2:  In 8 days A does 8 × 1/20 = 8/20 = 2/5 of the work
Step 3:  Remaining = 1 − 2/5 = 3/5, done in 6 days by A + B
Step 4:  Combined daily work = (3/5) ÷ 6 = 3/30 = 1/10
Step 5:  B's daily work = 1/10 − 1/20 = 1/20
Step 6:  B alone = 20 days
```
Whenever work happens in stages, handle the stages one at a time: work done = daily work × days, and subtract completed work from 1 unit.

### The "A Does X Days, Then B Finishes" Family

These are the most common exam variations. The universal tool is the same:

> **Work done = Daily work × Days worked**  … and total work always adds up to **1**.

**Type 1 — Different start times:** A starts, B joins later.
**Type 2 — One quits early:** A works every day, B leaves after some days.
**Type 3 — Alternate days:** A works day 1, B works day 2, repeat. (Work in 2-day pairs, then handle leftovers.)

**Example — alternate days:** A takes 10 days alone, B takes 15 days alone. If they work on alternate days starting with A, when is the work done?
```
LCM(10, 15) = 30 units.  A does 3/day, B does 2/day.
2-day pair: A then B → 3 + 2 = 5 units every 2 days.
After 5 pairs (10 days): 25 units done, 5 units left.
Day 11 (A): +3 → 28 units, 2 left.
Day 12 (B): +2 → 30 units DONE.
Total = 12 days.
```
Pair the days first — it keeps the bookkeeping clean.

### Common Traps

❌ **Adding the days directly** — "A takes 10, B takes 15, together 10 + 15 = 25" is WRONG. People working together are *faster*, so the answer must be *less* than each individual time. Always add the *fractions* (or use LCM units), never the days.
❌ **Forgetting to flip in efficiency questions** — A takes 9 days, B takes 12 days → efficiency A:B = 12:9, NOT 9:12. Flip the times.
❌ **Subtracting the wrong way in "find the other person"** — B's daily work = combined − A's. If the subtraction gives a negative number, the data is impossible (together they can't be slower than A alone).
❌ **Ignoring "of the remaining work"** — when a fraction is completed first, subtract it from 1 unit *before* computing the rest. Answering with "days for the whole job" when only part remains is the #1 mark-loser.
❌ **Rounding 36/5 to 7 in an exam** — 7.2 days means 7 full days plus 1/5 of a day. In multiple-choice questions the options will distinguish 7.2 from 7 — be exact.

### Quick Self-Test (answers at the bottom)

1. A can do a job in 6 days, B in 8 days. Together they take — (a) 14 days  (b) 3 3/7 days  (c) 7 days  (d) 4 days
2. A and B together finish in 4 days; A alone takes 12 days. B alone takes — (a) 6 days  (b) 8 days  (c) 9 days  (d) 16 days
3. A takes 9 days, B takes 12 days. A : B efficiency = ? (a) 9 : 12  (b) 4 : 3  (c) 3 : 4  (d) 12 : 9
4. A does 2/5 of a job in 4 days. The whole job takes A — (a) 8 days  (b) 10 days  (c) 12 days  (d) 20 days
5. Three people A, B, C take 6, 8, 12 days respectively. All three together take — (a) 2 days  (b) 2 2/3 days  (c) 3 days  (d) 4 1/3 days

**Answers:** 1→b (LCM 24 → 4+3=7/day → 24/7 = 3 3/7), 2→a (1/4 − 1/12 = 1/6 → 6 days), 3→b (flip: 12 : 9 = 4 : 3), 4→b (2/5 in 4 days → 1/5 per 2 days → 5/5 in 10 days), 5→b (LCM 24 → 4+3+2=9/day → 24/9 = 2 2/3).

### Key Takeaway

**Turn days into daily fractions (or LCM units), add them for people working together, subtract for finding a single person, and always keep the total work = 1 unit.** Efficiency is the inverse of time — flip the ratio. Work in stages, subtract what's done, and never add days directly.

---

## 7.2 Pipes & Cisterns

### The Same Chapter in Disguise

Pipes & Cisterns is **Time & Work wearing a plumbing costume**. A pipe filling a tank is a worker doing *positive* work. A leak (or an emptying pipe) is a worker doing *negative* work — undoing progress.

| Time & Work | Pipes & Cisterns |
|---|---|
| Person completes 1 job in `d` days | Pipe fills 1 tank in `d` hours |
| Daily work = 1/d | Fill rate = 1/d per hour |
| Two people add their work | Two filling pipes add their rates |
| Someone quits / slows down | A leak or outlet pipe *subtracts* |

So every formula from Work & Efficiency transfers directly — just swap "days" for "hours" and "people" for "pipes".

### The Golden Rule: Filling is +, Emptying is −

> **Net rate = (sum of filling rates) − (sum of emptying rates)**
> **Time to fill = 1 ÷ Net rate**

**The bucket analogy:** imagine a bucket with a tap pouring water in and a hole leaking water out. The water level rises only at the speed of (tap − hole). If the hole drains faster than the tap pours, the bucket never fills — it empties!

**Worked example — pipe fills in 6 hours, leak empties the full tank in 12 hours. Time to fill with both open?**
```
Fill rate   = 1/6 of the tank per hour
Leak rate   = 1/12 of the tank per hour  (it empties a FULL tank in 12 h)
Net rate    = 1/6 − 1/12 = 2/12 − 1/12 = 1/12 per hour
Time to fill = 1 ÷ (1/12) = 12 hours
```
The leak halves the effective speed, so the tank takes twice as long (12 h instead of 6 h). Always sensible: a leak can only slow a fill down, never speed it up.

### The LCM Method Works Here Too

Same trick as Work & Efficiency — use the LCM of the times as the tank size in litres:

**Worked example — pipe A fills in 4 hours, pipe B fills in 6 hours. Both open, time to fill?**
```
Step 1:  LCM(4, 6) = 12 litres (call the tank 12 L)
Step 2:  A fills 12 ÷ 4 = 3 L/h
         B fills 12 ÷ 6 = 2 L/h
Step 3:  Together = 3 + 2 = 5 L/h
Step 4:  Time = 12 ÷ 5 = 2.4 hours
```
Check with fractions: 1/4 + 1/6 = 5/12 → time = 12/5 = 2.4 h ✓

### Mixed Fill and Empty Pipes

When a pipe fills and another empties simultaneously, the **emptying rate still subtracts**:

**Worked example — pipe A fills in 5 hours, pipe B empties in 10 hours. Tank starts empty, both opened. Fill time?**
```
A's fill rate  = 1/5 per hour
B's drain rate = 1/10 per hour
Net rate       = 1/5 − 1/10 = 2/10 − 1/10 = 1/10 per hour
Time to fill   = 10 hours
```
The emptying pipe works at half the speed of the filling pipe, so it doubles the fill time. If the emptying pipe were faster (say it empties in 4 hours while the fill pipe takes 5), the net rate would be 1/5 − 1/4 = −1/20 — **negative** — and the tank would never fill.

### The "Leak Empties a Full Tank in X" Trap

Pay attention to what the leak time refers to: a leak that **empties a full tank in 12 hours** drains 1/12 of a tank per hour. That's the absolute rate we subtract. Some questions instead give "the leak alone would empty the tank in 12 hours **if the filling pipe were closed**" — same thing, same 1/12 per hour. What you must never do is treat the leak as *positive* work. A leak is always subtracted.

### Filling a Partially-Filled Tank

**Worked example — a tank is 1/3 full. A pipe fills it in 6 hours. How long to fill the remaining 2/3?**
```
Fill rate = 1/6 per hour
Remaining = 1 − 1/3 = 2/3 of the tank
Time = (2/3) ÷ (1/6) = (2/3) × 6 = 4 hours
```
Only the *remaining* fraction matters — the pipe doesn't need to re-do the water that's already there.

### Common Traps

❌ **Adding the leak instead of subtracting** — a leak *undoes* work. 1/6 + 1/12 gives a wrong (faster) answer; the correct net is 1/6 − 1/12. When in doubt, ask: "does this pipe make the water level go up or down?"
❌ **Treating "empties in 12 h" as a fill rate** — an emptying pipe is always negative, even though its number looks like a normal time.
❌ **Using the full tank when it's part-filled** — compute the fill time for the *remaining* fraction only.
❌ **Forgetting that a leak can prevent filling entirely** — if the net rate is zero or negative, the tank never fills; some options are "never", and that's a real answer.
❌ **Mixing units** — if the fill time is in hours and the leak time in minutes, convert first. Rates must share one unit.

### Quick Self-Test (answers at the bottom)

1. A pipe fills a tank in 6 hours; a leak empties it in 12 hours. With both open, the fill time is — (a) 4 h  (b) 6 h  (c) 12 h  (d) 18 h
2. Pipe A fills in 4 h, pipe B fills in 6 h. Both open, fill time? (a) 2.4 h  (b) 2.5 h  (c) 3 h  (d) 5 h
3. A fills in 10 h, a leak empties in 15 h. Both open, fill time? (a) 15 h  (b) 20 h  (c) 30 h  (d) 25 h
4. A fills in 5 h, B empties in 10 h. Tank empty, both open. Result? (a) Fills in 5 h  (b) Fills in 10 h  (c) Fills in 15 h  (d) Never fills
5. A tank is 1/3 full. A pipe fills it in 6 h. Time to fill the rest? (a) 2 h  (b) 4 h  (c) 6 h  (d) 9 h

**Answers:** 1→c (1/6 − 1/12 = 1/12 → 12 h), 2→a (LCM 12 → 3+2=5 L/h → 12/5 = 2.4 h), 3→c (1/10 − 1/15 = 1/30 → 30 h), 4→b (1/5 − 1/10 = 1/10 → 10 h), 5→b ((2/3) ÷ (1/6) = 4 h).

### Key Takeaway

**Pipes & Cisterns is Work & Efficiency with signs: filling pipes add, emptying pipes and leaks subtract.** Net rate = fills − empties, and time = 1 ÷ net rate. Use the LCM trick for whole-number speed, only fill the *remaining* fraction, and remember a net rate of zero or negative means the tank never fills.

---

# 7. Problems

## 7.1 Days to Complete Work Together

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Work & Efficiency |
| **Companies** | TCS, Infosys |

### Problem Statement

A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together, in how many days will they finish the work?

### Step-by-Step Solution

**Step 1 — Pick the total work (LCM method):**

```
LCM(12, 18) = 36 units of work
```

**Step 2 — Find each person's daily output:**

```
A's daily work = 36 ÷ 12 = 3 units/day
B's daily work = 36 ÷ 18 = 2 units/day
```

**Step 3 — Combined daily output:**

```
A + B = 3 + 2 = 5 units/day
```

**Step 4 — Days to finish together:**

```
Days = 36 ÷ 5 = 7.2 days = 7⅕ days
```

**Cross-check with fractions (same answer, different path):**

```
1/12 + 1/18 = 3/36 + 2/36 = 5/36
Days = 1 ÷ (5/36) = 36/5 = 7.2 ✓
```

### Answer

| Question | Answer |
|---|---|
| Total work (LCM of 12, 18) | **36 units** |
| A's daily work | 3 units |
| B's daily work | 2 units |
| Combined daily work | 5 units |
| **Days to finish together** | **7.2 days (7⅕ days)** |

### Why This Works (One Line)

People working together add their *daily fractions* (or units) — never their days — because every day, both of them push the work forward at the same time.

### Trap to Remember

Never answer 12 + 18 = 30 days. Two workers together are always faster than each worker alone, so the combined time (7.2) must be smaller than both 12 and 18. If your answer is larger than either individual time, you added the days instead of the rates.

---

## 7.2 Time to Fill a Tank with a Leak

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Pipes & Cisterns |
| **Companies** | Accenture, Wipro |

### Problem Statement

A pipe can fill a tank in 6 hours. A leak at the bottom of the tank can empty the full tank in 12 hours. If the tank is initially empty and the filling pipe is opened with the leak left open, how long will it take to fill the tank?

### Step-by-Step Solution

**Step 1 — Fill rate of the pipe:**

```
Pipe fills 1 full tank in 6 h → fill rate = 1/6 of the tank per hour
```

**Step 2 — Leak rate:**

```
Leak empties 1 full tank in 12 h → leak rate = 1/12 of the tank per hour
```

**Step 3 — Net rate (filling − emptying):**

```
Net rate = 1/6 − 1/12 = 2/12 − 1/12 = 1/12 of the tank per hour
```

**Step 4 — Time to fill:**

```
Time = 1 ÷ (1/12) = 12 hours
```

**Sanity check:** the leak drains water at half the speed the pipe pours it in, so the tank fills at half speed — 12 hours instead of 6. A leak can only slow a fill down, and here it exactly doubles the time. ✓

### Answer

| Question | Answer |
|---|---|
| Fill rate | 1/6 tank per hour |
| Leak rate | 1/12 tank per hour |
| Net rate | 1/12 tank per hour |
| **Time to fill with leak open** | **12 hours** |

### Why This Works (One Line)

A filling pipe is positive work and a leak is negative work, so the tank rises at the speed of (fill rate − leak rate), and time = 1 ÷ net rate.

### Trap to Remember

The leak is *subtracted*, never added — 1/6 + 1/12 = 1/4 would wrongly give 4 hours. Also, the leak's "empties in 12 h" refers to a full tank, which is exactly the absolute rate to subtract: 1/12 per hour. Get the sign right and the chapter is easy.

---

*Happy studying! — TheWebytes Aptitude Team*
