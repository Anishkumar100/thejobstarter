# OS Learning Document — CPU Scheduling Basics

> A comprehensive, student-friendly guide to CPU Scheduling Basics — the foundation every OS course stands on.
> Master scheduling criteria & concepts, fcfs & sjf scheduling, with exam-style problems and fully worked solutions.

---

# 5. CPU Scheduling Basics

> **Lesson Overview:** The events never queue fairly — someone must pick who gets the CPU. Learn the four measurements an interviewer cares about (turnaround, waiting, response, throughput), then master the two simplest pickers: First-Come First-Served and Shortest Job First, complete with Gantt charts and convoy effects.
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 5.1 Scheduling Criteria & Concepts

### What Does "Better" Even Mean?

Before comparing schedulers you need a ruler. A scheduler picks who runs next among READY processes; we measure it with four rulers:

### The Four Metrics

| Metric | Definition | Formula vibes | We want |
|---|---|---|---|
| **Turnaround time** | total time from process arrival until completion | completion − arrival | LOW (short) |
| **Waiting time** | total time spent in the READY queue (never on CPU) | turnaround − CPU burst | LOW |
| **Response time** | from arrival to the FIRST response (for interactive apps) | first_response − arrival | LOW |
| **Throughput** | processes completed per unit time | jobs / time | HIGH |

The key difference: turnaround waits until COMPLETION; response only waits until FIRST CPU. A terminal feels good when response is small, even if completion takes forever.

### The CPU Burst Model

Processes alternate: **CPU burst** (compute) → **I/O burst** (wait) → CPU burst → ...

```
time ──►
CPU:    ████░░░░██████░░░░████            ██ = CPU burst
I/O:        ░░░░    ░░░░░░                ░░ = I/O wait
```

| Burst profile | Typical program |
|---|---|
| long CPU bursts, rare I/O | batch compute, video encoding |
| short CPU bursts, frequent I/O | interactive apps, editors |

Most programs are I/O-bound — which is why schedulers obsess over long CPU hoggers.

### The Gantt Chart — Drawing the Schedule

A Gantt chart is the timeline of who owns the CPU:

```
0         5         10        15      (time in ms)
├── P1 ──┼── P2 ──┼── P3 ──┼────────┤
```

| From the chart | How to read it |
|---|---|
| P1 runs 0–5 | burst lengths or time quanta |
| P2 runs 5–10 | next process |
| idles 12–15 | CPU empty — no ready process existed |

> Every scheduling answer on this platform is: draw the Gantt chart FIRST, then read metrics off it. Do not compute formulas from memory — the chart IS the answer.

### Common Traps

❌ Turnaround counts from ARRIVAL, not from when the process first runs.❌ Waiting time excludes all CPU time, not just the first burst.❌ Response is about FIRST reply, not completion — interactive UX metric.❌ Throughput and turnaround are different optimisations: a scheduler can excel at one and fail the other.

### Quick Self-Test (answers at the bottom)

1. Completion − arrival = ?
(a) waiting (b) turnaround (c) response
2. Waiting time counts only time spent:
(a) on the CPU (b) in the ready queue (c) doing I/O
3. A fast-feeling terminal cares most about:
(a) response time (b) throughput (c) batch size
4. A program with long CPU bursts and rare I/O is:
(a) I/O-bound (b) CPU-bound (c) a thread

**Answers:** 1→b, 2→b, 3→a, 4→b.

## 5.2 FCFS & SJF Scheduling

### The Coffee Queue vs the Fast Lane

**FCFS** is the coffee queue: strictly first-come, first-served, no one cuts in. **SJF** is the express lane: the shortest job always goes next — the queue moves fastest overall, but the long jobs wait forever.

### FCFS (First-Come, First-Served)

Non-preemptive: once running, a process keeps the CPU until it finishes or blocks.

| Process | Arrival | Burst |
|---|---|---|
| P1 | 0 | 24 |
| P2 | 0 | 3 |
| P3 | 0 | 3 |

Gantt: P1(24) → P2(3) → P3(3)

| Metric | P1 | P2 | P3 |
|---|---|---|---|
| turnaround | 24 | 27 | 30 |
| waiting | 0 | 24 | 27 |

Average waiting = 51/3 = 17 ms. P1 was greedy and made everyone wait — this is the **convoy effect**: one long process delays the whole line. (Had they arrived P2, P3 first, the average would be ~3 ms.)

### SJF (Shortest Job First)

Non-preemptive SJF: when the CPU frees up, pick the READY process with the smallest burst.

| Process | Arrival | Burst |
|---|---|---|
| P1 | 0 | 6 |
| P2 | 2 | 8 |
| P3 | 4 | 7 |
| P4 | 5 | 3 |

Timeline: P1 0–6; at 6, ready = {P2, P3, P4} → shortest is P4(3) → 6–9; then P3(7) → 9–16; then P2(8) → 16–24.

| Metric | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| completion | 6 | 24 | 16 | 9 |
| turnaround | 6 | 22 | 12 | 4 |
| waiting | 0 | 14 | 5 | 1 |

Average waiting = 20/4 = 5 ms — much better than FCFS (which would give 0+6+12+13 = 31/4 ≈ 7.75… strictly worse here).

> **SJF is provably optimal for average waiting time** (non-preemptive, all arrivals at once). Its sin: a long process can starve if a short one keeps arriving — starvation.

### Executive Summary

| Scheduler | Fair? | Average waiting | Weakness |
|---|---|---|---|
| FCFS | yes (in order) | poor — convoy effect | long jobs torture the whole line |
| SJF | no | optimal | starvation of long jobs |

### Common Traps

❌ At every DECISION POINT, consider only processes that have ALREADY ARRIVED — arrivals later than "now" cannot be picked yet.❌ SJF is optimal for average WAITING, not for every metric.❌ FCFS with all processes arriving together is just arrival order — no choice at all.❌ Break ties by arrival time (and then by process number) — graders love tie rules.

### Quick Self-Test (answers at the bottom)

1. FCFS is: (a) preemptive (b) non-preemptive always (c) random
2. The convoy effect means:
(a) one long job delays everyone (b) processes help each other (c) I/O is fast
3. SJF is optimal for minimising:
(a) response (b) average waiting (c) throughput
4. In SJF at time t, you may pick a process whose arrival is:
(a) any future time (b) ≤ t only (c) never

**Answers:** 1→b, 2→a, 3→b, 4→b.

---

# 6. Problems

## 6.1 Calculate Waiting and Turnaround Time

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Scheduling Criteria & Concepts |
| **Companies** | Google, Amazon, Oracle |

### Problem Statement

Four processes arrive together (arrival 0): P1 burst 5, P2 burst 2, P3 burst 8, P4 burst 3. The scheduler is NON-PREEMPTIVE FCFS in order P1, P2, P3, P4. Compute each process's completion, turnaround, and waiting time, then the average waiting time.

### Examples

| Input | Output | Explanation |
|---|---|---|
| P1 runs first (0–5). | P1: completion 5, turnaround 5, waiting 0. | It started at time 0 and finished at 5. Waiting = turnaround − burst = 5 − 5 = 0. |
| P2 runs second (5–7). | P2: completion 7, turnaround 7, waiting 5. | P2 arrived at 0 but the CPU was P1's until 5. Waiting = 7 − 2 = 5. |
| P3 then P4, and the average. | P3: completion 15, turnaround 15, waiting 7. P4: completion 18, turnaround 18, waiting 15. Average waiting = (0 + 5 + 7 + 15) / 4 = 6.75 ms. | P3 waits 5+2 = 7 (P1 and P2 ran before it); P4 waits 5+2+8 = 15. All arrivals are 0, so turnaround = completion. |

### Constraints

- Arrival times are all 0 — turnaround = completion − 0.
- Use the Gantt chart as the source of truth.
- Average = sum of waiting / number of processes.

### Approach

**Draw, Then Read**

**Step 1 — The Gantt Chart**

```
0     5     7            15           18
├─P1──┤─P2──┤──── P3 ────┤──── P4 ────┤
```

**Step 2 — The Metric Table**

```
Process | burst | completion | turnaround | waiting
P1      |  5    |     5      |   5 − 0 = 5 |  5 − 5 = 0
P2      |  2    |     7      |   7 − 0 = 7 |  7 − 2 = 5
P3      |  8    |    15      |  15 − 0 = 15| 15 − 8 = 7
P4      |  3    |    18      |  18 − 0 = 18| 18 − 3 = 15
```

**Step 3 — Formulae**

```
turnaround = completion − arrival
waiting    = turnaround − burst   (for a single-burst model)
average    = Σ waiting / n
```

**Common Traps**

❌ Waiting is NOT "start − arrival" — the process may yield the CPU mid-burst in preemptive systems.❌ With arrival = 0, turnaround == completion — the classic easy-mode giveaway.❌ Read completion times off the GANTT, not by accumulating bursts by heart.

## 6.2 Compute a Schedule Using SJF

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | FCFS & SJF Scheduling |
| **Companies** | Amazon, Microsoft |

### Problem Statement

Non-preemptive SJF with these processes: P1 arrives 0, burst 6; P2 arrives 1, burst 2; P3 arrives 2, burst 8; P4 arrives 3, burst 3; P5 arrives 4, burst 4. Build the Gantt chart, then give completion and waiting time for every process and the average waiting time.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Time 0–6: who runs and why? | P1 runs 0–6 — it is the only process present at time 0; SJF has nothing shorter to choose. | SJF picks the shortest READY job: at t=0 only P1 exists. This is why P1 runs first even though its burst is large. |
| At t=6 the ready set is {P2(2), P3(8), P4(3), P5(4)}. | Next: P2 (burst 2) runs 6–8; then P4 (3) runs 8–11; then P5 (4) runs 11–15; finally P3 (8) runs 15–23. | Shortest first at every decision point: at t=6 the bursts are 2, 8, 3, 4 → pick 2 (P2). At t=8 pick 3 (P4), at t=11 pick 4 (P5), and P3 (8) is last. |

### Constraints

- At every decision point ONLY already-arrived processes are candidates.
- Ties: smaller process number first.
- Fire the burst lengths strictly as given.

### Approach

**The Correct Trace (tie-broken, arrival-aware)**

**Step 1 — Decision Timeline**

| Time | Ready (arrived) | Pick | Runs |
|---|---|---|---|
| 0 | P1(6) | P1 | 0–6 |
| 6 | P2(2), P3(8), P4(3), P5(4) | P2 | 6–8 |
| 8 | P3(8), P4(3), P5(4) | P4 | 8–11 |
| 11 | P3(8), P5(4) | P5 | 11–15 |
| 15 | P3(8) | P3 | 15–23 |

**Step 2 — Gantt**

```
0     6     8    11        15              23
├─P1──┤─P2──┤─P4──┤── P5 ──┤───── P3 ──────┤
```

**Step 3 — Metrics (arrival-aware)**

```
Process | arrival | burst | completion | waiting (= completion − arrival − burst)
P1      |  0 |  6 |  6  |  0
P2      |  1 |  2 |  8  |  5      (8 − 1 − 2)
P3      |  2 |  8 | 23  | 13      (23 − 2 − 8)
P4      |  3 |  3 | 11  |  5      (11 − 3 − 3)
P5      |  4 |  4 | 15  |  7      (15 − 4 − 4)
average waiting = (0 + 5 + 13 + 5 + 7) / 5 = 6.0 ms
```

**Common Traps**

❌ At t=6 the shortest is P2 (burst 2) — do NOT mistake P4 (3) for the smallest.❌ Waiting = completion − arrival − burst (arrivals are NOT all zero here!).❌ Never schedule a process that has not arrived — the "future-ready" cheat invalidates the whole answer.
