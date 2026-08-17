# OS Learning Document — Multilevel & Multiprocessor Scheduling

> A comprehensive, student-friendly guide to Multilevel & Multiprocessor Scheduling — the foundation every OS course stands on.
> Master multilevel queue & feedback queue, multiprocessor scheduling, with exam-style problems and fully worked solutions.

---

# 7. Multilevel & Multiprocessor Scheduling

> **Lesson Overview:** Real systems run a league of queues, not one — foreground jobs get quick quanta, background compute gets long turns, and misbehaving processes get demoted. Plus how scheduling changes when the machine has many CPUs: affinity, load balancing, and gang scheduling.
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Medium
> - **Problems:** 1

---

## 7.1 Multilevel Queue & Feedback Queue

### The League of Queues

Real systems do not run one queue — they run a LEAGUE. Different process types are assigned to different queues, each with its own scheduler.

### Multilevel Queue (MQ) — Fixed Teams

| Queue | Served | Policy | Priority |
|---|---|---|---|
| System processes | kernel daemons | FCFS | highest |
| Interactive | foreground apps | RR (small q) | high |
| Interactive editing | editors | RR (bigger q) | medium |
| Batch | background compute | FCFS | low |

| Property | Value |
|---|---|
| Processes are ASSIGNED permanently | a process never changes queue |
| Scheduling between queues | typically fixed priority or time-sliced among queues |

**Problem:** a process can do nothing about being a batch dog — no promotion, even if it becomes interactive.

### Multilevel Feedback Queue (MLFQ) — Dynamic Teams

The breakthrough: the OS watches behaviour and **promotes/demotes**:

1. New process enters the TOP queue (smallest quantum).
2. Uses its whole quantum → suspected CPU hog → **demote** one level.
3. Gives up the CPU early (I/O wait) → interactive → **stay** or even promote.
4. Aging moves starving processes UP one level over time.

### The Classic 3-Queue MLFQ

| Queue | Quantum | Scheme |
|---|---|---|
| Q0 | 2 ms | RR |
| Q1 | 4 ms | RR |
| Q2 | FCFS | no quantum — runs to completion |

### Worked Trace

| Process | Arrival | Burst |
|---|---|---|
| A | 0 | 5 |
| B | 0 | 2 |
| C | 0 | 9 |

| Step | Action | Bursts consumed |
|---|---|---|
| 0–2 | A in Q0, uses full q → demote to Q1 | A: 2 of 5 |
| 2–4 | B in Q0, finishes within its q | B: 2 of 2 — done |
| 4–6 | C in Q0, uses full q → demote to Q1 | C: 2 of 9 |
| 6–10 | A in Q1 (q=4), finishes with 3 left ≤ 4 → done at 9 | A: 2+3 = 5 — done |
| 9–13 | C in Q1 (q=4), C is alone → uses full 4, demotes to Q2 | C: 2+4 = 6 of 9 |
| 13–16 | C in Q2 (FCFS), runs to completion | C: 6+3 = 9 — done |

Final Gantt: A 0–2 + 6–9 | B 2–4 | C 4–6 + 9–16. All three finish; no starvation anywhere.

### Common Traps

❌ MLQ (no feedback) = fixed assignment; MLFQ = processes MOVE between queues.❌ Demotion happens on FULL-quantum use, not on blocking early.❌ In Q2 (FCFS) a process runs until complete — it can still be preempted by higher queues.❌ Aging is the anti-starvation device in BOTH MQ and MLFQ.

### Quick Self-Test (answers at the bottom)

1. In MLFQ, a process that uses its whole quantum typically:
(a) gets promoted (b) gets demoted (c) terminates
2. A process that blocks early for I/O looks:
(a) interactive (b) hog-hungry (c) dead
3. Q2 in the classic 3-queue MLFQ runs:
(a) RR q=2 (b) RR q=4 (c) FCFS
4. MLQ vs MLFQ difference:
(a) MLFQ lets processes change queues (b) MLQ has RR (c) none

**Answers:** 1→b, 2→a, 3→c, 4→a.

## 7.2 Multiprocessor Scheduling

### Many CPUs, One Scheduler Problem

Multiprocessor systems need scheduling that thinks about WHERE a process runs, not just WHEN. The extra axes:

### Symmetric vs Asymmetric

| Model | What it means | Example reality |
|---|---|---|
| **SMP — symmetric** | every CPU runs the scheduler; each CPU pulls ready processes from a shared queue | modern Linux |
| **Asymmetric (master/slave)** | one CPU runs the OS & scheduler; the others just execute user code | tiny embedded ARM systems |

### Processor Affinity

A process accumulates warm cache lines on CPU 3 (its TLB, L1, L2). Moving it to CPU 7 = the cache is cold again — the first instructions BURN through main memory.

| Kind | Meaning |
|---|---|
| **Soft affinity** | try to keep the process on its CPU (Linux default — a strong hint) |
| **Hard affinity** | the process is FORBIDDEN to move (pinned via CPU affinity mask) |

**Load balancing** fights the unfairness affinity creates: one CPU idle while another is swamped.

| Strategy | How | Trade-off |
|---|---|---|
| **Push migration** | a periodic task moves excess ready processes to idle CPUs | complexity, cache churn |
| **Pull migration** | an idle CPU steals work from a busy CPU's queue | steals the cache-warm process anyway |

### Gang Scheduling — The Parallel Crowd

Parallel jobs (e.g. a 4-thread MPI job) slow to a crawl if their threads are scheduled at different TIMES — a barrier waits for all 4 threads. **Gang scheduling** runs ALL threads of a process SIMULTANEOUSLY on different CPUs.

| Pros | Cons |
|---|---|
| barriers complete instantly | machine must have that many free CPUs at once |
| perfect for tightly-coupled parallel jobs | idle slots if the gang is smaller than the machine |

### Common Traps

❌ SMP = everyone schedules; it does NOT mean "no queues".❌ Affinity improves performance but can imbalance load — that is why balancing exists.❌ Gang scheduling is for threads that must run IN PARALLEL (barrier-synced), not for independent tasks.❌ Loading balancing and affinity are opposing forces — the OS tunes between them.

### Quick Self-Test (answers at the bottom)

1. In SMP, the scheduler runs:
(a) only on CPU 0 (b) on every CPU (c) nowhere
2. Processor affinity keeps a process on the same CPU to:
(a) save power (b) reuse warm caches (c) avoid forks
3. An idle CPU taking work from a busy CPU is:
(a) pull migration (b) push migration (c) gang scheduling
4. Gang scheduling runs a job's threads:
(a) one at a time (b) simultaneously on different CPUs (c) on one CPU with RR

**Answers:** 1→b, 2→b, 3→a, 4→b.

---

# 8. Problems

## 8.1 Trace a Multilevel Feedback Queue

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Multilevel Queue & Feedback Queue |
| **Companies** | Google, Amazon, Microsoft |

### Problem Statement

Three-queue MLFQ: Q0 RR q=2 → Q1 RR q=4 → Q2 FCFS. New processes enter Q0; using a full quantum demotes one level; finishing early stays. Processes (all arrive at 0): A burst 5, B burst 2, C burst 9, in arrival order A, B, C. Build the full trace: every quantum, every demotion, every completion, and the average waiting time.

### Examples

| Input | Output | Explanation |
|---|---|---|
| The first session: A and B at Q0. | A runs 0–2, uses its full quantum → demoted to Q1. B runs 2–4, finishes within its quantum → done at 4. | A's burst (5) exceeds q=2, so its slice ends by preemption and A drops to Q1. B's burst (2) fits exactly — completion, no demotion needed. |
| C's journey. | C runs 4–6 in Q0 (full q → demote), then 9–13 in Q1 at q=4 (still has 3 left → demote to Q2), then 13–16 in Q2 FCFS — finishes at 16. | C burns its entire 2 ms slice, then its entire 4 ms slice — the classic hog signature: demoted twice. In Q2 there is no quantum; it runs to completion. |
| The final Gantt and averages. | A 0–2 + 6–9 (Q1 slice, finishes) \| B 2–4 \| C 4–6 + 9–16. Completion: A 9, B 4, C 16. Waiting: A = 9−5 = 4, B = 4−2 = 2, C = 16−9 = 7 → average 13/3 ≈ 4.33. | A gets ONE more slice in Q1 (4 ms ≥ its 3 remaining) and finishes there. Waiting = completion − burst (all arrivals 0). |

### Constraints

- New processes always enter Q0.
- Full-quantum use = demote one level; early exit = no demotion.
- Q2 (FCFS) has no quantum — a process there runs until it finishes.
- Arrival order inside a queue is FIFO.

### Approach

**Rules of the League**

```
new process ─► Q0 (RR, q=2)
                │ full q? ──► demote to Q1
                │ done?     ──► exit
Q1 (RR, q=4)
                │ full q? ──► demote to Q2
                │ done?     ──► exit
Q2 (FCFS) ──► runs to completion
```

**Full Trace Table**

| Time | Queue state | Action |
|---|---|---|
| 0–2 | A in Q0 | A: 2/5, full q → demote |
| 2–4 | B in Q0 | B: 2/2 — COMPLETE |
| 4–6 | C in Q0 | C: 2/9, full q → demote |
| 6–9 | A in Q1 | A: 3/5 ≤ 4 → COMPLETE |
| 9–13 | C in Q1 | C: 4/9, full q → demote |
| 13–16 | C in Q2 | C: 3/9 — COMPLETE |

**Gantt + Metrics**

```
0  2  4  6     9     13   16
├A─┤─B─┤─C─┤──A──┤──C──┤─C─┤
Q0 Q0 Q0  Q1       Q1    Q2
```

| Process | completion | waiting |
|---|---|---|
| A | 9 | 4 |
| B | 4 | 2 |
| C | 16 | 7 |

Average waiting ≈ 4.33 ms.

**Common Traps**

❌ Batching "uses full quantum" — a process with burst EXACTLY q is DONE, not demoted.❌ Q2 FCFS can still be preempted by Q0/Q1 arrivals — it just never loses its own turns.❌ A demoted process never returns up (no promotion in the basic MLFQ — that needs aging).
