# OS Learning Document — Priority & Round Robin Scheduling

> A comprehensive, student-friendly guide to Priority & Round Robin Scheduling — the foundation every OS course stands on.
> Master priority scheduling, round robin scheduling, with exam-style problems and fully worked solutions.

---

# 6. Priority & Round Robin Scheduling

> **Lesson Overview:** Two scheduling heavyweights: priority scheduling that always serves the most important task first (watch out for starvation — aging to the rescue), and Round Robin, the fair time-slicer that gives everyone a quantum and keeps the CPU democratic.
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 6.1 Priority Scheduling

### The VIP Queue

**Priority scheduling** always runs the highest-priority READY process. Priorities are usually numbers (lower = more important, or higher — check the problem's convention!).

### The Two Flavours

| Flavour | Behaviour |
|---|---|
| **Preemptive** | a higher-priority process arriving MID-run yanks the CPU away immediately |
| **Non-preemptive** | the running process finishes its burst even if a VIP arrives |

### Worked Trace (non-preemptive)

| Process | Arrival | Burst | Priority (1 = highest) |
|---|---|---|---|
| P1 | 0 | 10 | 3 |
| P2 | 1 | 1 | 1 |
| P3 | 2 | 2 | 4 |
| P4 | 3 | 5 | 2 |

Timeline: P1 runs 0–10 (it was already running; non-preemptive — P2 cannot cut in). At 10: ready = {P2, P3, P4} → highest priority = P2 (1) → 10–11; then P4 (2) → 11–16; then P3 (4) → 16–18.

| Metric | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| turnaround | 10 | 10 | 16 | 13 |
| waiting | 0 | 9 | 14 | 8 |

### The Disease and the Cure

| Problem | What happens | Fix |
|---|---|---|
| **Starvation** | a low-priority process may NEVER run if high-priority work keeps arriving | **Aging**: boost a waiting process's priority by +1 every tick; it eventually becomes the most important |
| Priority inversion | a high-priority task blocks on a resource held by a low-priority one | priority inheritance protocols (classic Mars Pathfinder bug) |

### The Interview One-Liner

> "Priority scheduling is fast and flexible but unfair; aging guarantees every process eventually runs."

### Common Traps

❌ Non-preemptive priority = decision ONLY when the current process finishes or blocks.❌ Preemptive priority = decide at EVERY arrival too.❌ Lower number = more important (or the reverse — the problem must say).❌ Starvation is about low-priority processes, not low arrival times.

### Quick Self-Test (answers at the bottom)

1. Preemptive priority interrupts the running process when:
(a) a shorter job arrives (b) a higher-priority job arrives (c) the quantum ends
2. Aging fixes:
(a) convoy effect (b) starvation (c) response time
3. Starvation happens when:
(a) high-priority work keeps arriving (b) CPU is idle (c) I/O is slow
4. Non-preemptive priority can be forced to wait:
(a) never (b) until the current burst finishes (c) forever always

**Answers:** 1→b, 2→b, 3→a, 4→b.

## 6.2 Round Robin Scheduling

### Everybody Gets a Slice

**Round Robin (RR)** runs ready processes in a circle: each gets the CPU for one **time quantum (q)**, then goes to the back of the line. No starvation, ever — everyone is served.

### The Rules

1. Ready queue is FIFO.
2. Run the head for AT MOST q units.
3. If it finishes sooner → leave.
4. If q expires with work left → preempt, put it at the tail, run the next head.

### Worked Trace — q = 4 ms

| Process | Arrival | Burst |
|---|---|---|
| P1 | 0 | 8 |
| P2 | 1 | 4 |
| P3 | 2 | 9 |

| Time | Who runs | Note |
|---|---|---|
| 0–4 | P1 | P1 has 4 left |
| 4–5 | P2 (arrived at 1) | P2 runs only 1 of its 4 (5 is when P3 arrives — but P2 keeps its whole 4? No: q=4, so P2 runs 4–8) |
| 8–12 | P3 | P3's first slice |
| 12–16 | P1 | P1's second slice — finishes (4+4=8) |
| 16–20 | P2 | P2's second slice — finishes |
| 20–25 | P3 | P3's second slice — finishes (4+5) |

Correct Gantt: P1 0–4 | P2 4–8 | P3 8–12 | P1 12–16 | P2 16–20 | P3 20–25.

| Metric | P1 | P2 | P3 |
|---|---|---|---|
| turnaround | 16 | 19 | 23 |
| waiting | 8 | 14 | 13 |
| response | 0 | 3 | 6 |

### The Quantum Tuning Knob

| Quantum | Behaviour |
|---|---|
| **Very large** (→∞) | RR degenerates into FCFS — one process monopolises the machine |
| **Very small** (→0) | perfect fairness, but context switches dominate: CPU time wasted on switching |
| **Sweet spot** | a few ms — switch overhead (≈10 μs) is a rounding error, responsiveness is instant |

Rule of thumb: **80%+ of bursts should finish within one quantum** — then most processes need no switches at all.

### Why RR Wins

✅ No starvation — every ready process runs within one quantum.✅ Excellent response time for interactive users.✅ Simple and fair — the workhorse of time-sharing systems.

### Common Traps

❌ The quantum counts even when the process used less than q and BLOCKS (I/O) — it left on its own, not by preemption, and goes to the tail on return.❌ Compute waiting from the Gantt chart, never from formulas alone.❌ q too small = context-switch overhead explosion, not "more fair".❌ New arrivals append at the TAIL — they do not cut the queue.

### Quick Self-Test (answers at the bottom)

1. When q expires, the running process:
(a) stays on CPU (b) goes to the tail of the ready queue (c) terminates
2. RR with infinite quantum becomes:
(a) SJF (b) FCFS (c) priority
3. Tiny quanta cause:
(a) no switching (b) excessive context-switch overhead (c) starvation
4. An I/O-bound process that blocks mid-quantum:
(a) keeps its full remaining quantum later too (b) rejoins ready normally (c) is killed

**Answers:** 1→b, 2→b, 3→b, 4→b.

---

# 7. Problems

## 7.1 Compute a Schedule Using Priority Scheduling

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Priority Scheduling |
| **Companies** | Amazon, Google |

### Problem Statement

Processes: P1 arrival 0, burst 10, priority 3; P2 arrival 1, burst 1, priority 1; P3 arrival 2, burst 2, priority 4; P4 arrival 3, burst 5, priority 2. Lower number = higher priority. (a) Build the Gantt chart for the NON-PREEMPTIVE version and the waiting times. (b) Rebuild for the PREEMPTIVE version and compare the average waiting times.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Part (a), non-preemptive: what happens at t=1 when P2 (priority 1) arrives while P1 runs? | P1 keeps running until 10 — non-preemptive priority only decides when the current burst ends. | At t=10 the ready set is {P2(1), P3(4), P4(2)}: order by priority → P2 (1) 10–11, P4 (2) 11–16, P3 (4) 16–18. Waiting: P1 0, P2 9, P3 14, P4 8 → average 31/4 = 7.75. |
| Part (b), preemptive: which arrivals cut P1 off? | P2 cuts in at t=1 (pri 1 > 3); P4 arrives at t=3 (pri 2 > 3) and cuts in too; P3 (pri 4) never preempts anyone. | Trace: P1 0–1, P2 1–2 (done), P1 2–3, P4 3–8 (done), P1 8–16 (finishes), P3 16–18. Waiting: P1 = 16 − 0 − 10 = 6, P2 = 0, P3 = 14, P4 = 0 → average 20/4 = 5.0. |
| Which version is better here, and what does preemption buy? | Preemptive: 5.0 vs 7.75 average waiting — VIP arrivals get served instantly; the cost is more context switches (P1 was interrupted twice). | Preemptive priority optimises for responsiveness to high-priority arrivals; the switch overhead is the trade-off. |

### Constraints

- Lower number = higher priority in this problem.
- Non-preemptive decides ONLY at completion/block points.
- Preemptive decides at every arrival too.
- Ties: earlier arrival first.

### Approach

**Two Flavours, Two Gantts**

**Non-Preemptive Trace**

| Time | Event / decision | Runs |
|---|---|---|
| 0 | P1 only | P1 0–10 |
| 10 | ready: P2(1), P3(4), P4(2) | P2 10–11, P4 11–16, P3 16–18 |

```
0                   10 11       16   18
├─────── P1 ─────────┤─P2─┤─P4───┤─P3─┤
```

**Preemptive Trace (arrivals cut in)**

| t | Arrival/event | Who runs |
|---|---|---|
| 0 | — | P1 0–1 |
| 1 | P2 (pri 1) | P2 1–2, done |
| 2 | P3 (pri 4) — too low | P1 2–3 |
| 3 | P4 (pri 2) | P4 3–8, done |
| 8 | P1 resumes | P1 8–16, done |
| 16 | P3 | P3 16–18, done |

**Waiting Comparison**

| | P1 | P2 | P3 | P4 | average |
|---|---|---|---|---|---|
| non-preemptive | 0 | 9 | 14 | 8 | 7.75 |
| preemptive | 6 | 0 | 14 | 0 | 5.00 |

**Common Traps**

❌ Non-preemptive = the current process IGNORES every arrival, however VIP.❌ Priority is about WHO, not how long — SJF logic does not apply.❌ Preemptive yields more switches: count them when the interviewer asks about overhead.

## 7.2 Compute a Schedule Using Round Robin

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Round Robin Scheduling |
| **Companies** | Google, Microsoft, Oracle |

### Problem Statement

Round Robin with quantum q = 4 ms. Processes: P1 arrives 0, burst 8; P2 arrives 1, burst 4; P3 arrives 2, burst 9. Draw the Gantt chart, compute each process's completion, waiting, and response time, and the average waiting time.

### Examples

| Input | Output | Explanation |
|---|---|---|
| The first four milliseconds: who runs? | P1 runs 0–4 — it is the only ready process at t=0; the quantum expires with P1 at 4/8 done. | P1 goes to the tail of the ready queue. P2 (arrived 1) and P3 (arrived 2) are waiting: queue = [P2, P3, P1]. |
| The full schedule. | P1 0–4 \| P2 4–8 \| P3 8–12 \| P1 12–16 \| P3 16–21. P2 finishes in its first quantum (burst 4 = q); P1 finishes at 16; P3 finishes at 21. | P2's burst equals the quantum, so it exits at the preemption point — no second slice needed. P3 completes its 5 remaining ms in the 16–21 slice. |
| Waiting and response times. | Waiting: P1 = 16 − 0 − 8 = 8, P2 = 8 − 1 − 4 = 3, P3 = 21 − 2 − 9 = 10 → average 21/3 = 7. Response: P1 0, P2 3, P3 6. | Response = time to FIRST CPU: P2 waits 3 ms (P1's leftover slice), P3 waits 6 ms. Note response << turnaround — RR's whole point. |

### Constraints

- Quantum q = 4 ms, context switch overhead ignored (assume 0).
- New arrivals join at the TAIL.
- Waiting = completion − arrival − burst; response = first-CPU time − arrival.

### Approach

**The Circle of Slices**

**The Queue State Machine**

| Time | Ready queue | Runs | Notes |
|---|---|---|---|
| 0 | [P1] | P1 0–4 | q expired → tail |
| 1 | [P2] arrives | — | joins at tail |
| 2 | [P3] arrives | — | joins at tail |
| 4 | [P2, P3, P1] | P2 4–8 | burst 4 = q → finishes |
| 8 | [P3, P1] | P3 8–12 | 4 of 9 used → tail |
| 12 | [P1, P3] | P1 12–16 | 4 of 8 used → finishes |
| 16 | [P3] | P3 16–21 | 5 left, runs to completion |

**The Gantt**

```
0    4    8   12   16        21
├─P1─┤─P2─┤─P3─┤─P1─┤──P3───┤
```

**Metrics Table**

| Process | arrival | burst | completion | waiting | response |
|---|---|---|---|---|---|
| P1 | 0 | 8 | 16 | 8 | 0 |
| P2 | 1 | 4 | 8 | 3 | 3 |
| P3 | 2 | 9 | 21 | 10 | 6 |

Average waiting = 7 ms.

**Common Traps**

❌ A process that FINISHES exactly at the quantum boundary does not go to the tail — it is done.❌ New arrivals join the TAIL — they do not displace the current slice.❌ Response is NOT waiting time — it stops at the first CPU grant, not completion.
