# OS Learning Document — Deadlock Prevention & Avoidance

> A comprehensive, student-friendly guide to Deadlock Prevention & Avoidance — the foundation every OS course stands on.
> Master deadlock conditions & prevention, deadlock avoidance (banker's algorithm), with exam-style problems and fully worked solutions.

---

# 10. Deadlock Prevention & Avoidance

> **Lesson Overview:** The four conditions that must ALL hold for a deadlock — and the four ways to break one of them. Then the crown jewel of avoidance: the Banker's Algorithm, which never grants a request that could leave the system unable to finish every process (complete with the safety-sequence table trace).
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Hard
> - **Problems:** 2

---

## 10.1 Deadlock Conditions & Prevention

### The Traffic Gridlock

Four cars meet in a box junction: each waits for the car ahead, nobody can move. In OS terms:

> **Deadlock** = a set of processes, each waiting for a resource held by another member of the set, forever.

### The Four Conditions — ALL must hold

| # | Condition | Meaning | How to break it |
|---|---|---|---|
| 1 | **Mutual exclusion** | resources cannot be shared | share the resource (rarely possible) |
| 2 | **Hold and wait** | a process holds one resource while waiting for another | request ALL resources up front, or release before requesting |
| 3 | **No preemption** | a held resource cannot be forcibly taken | allow preemption — force-release held resources |
| 4 | **Circular wait** | a cycle of processes each waiting on the next | impose a GLOBAL ORDER on resources — request in ascending order only |

### The Strategy Table — Prevent by Breaking ONE

| You break… | The rule your system obeys | Cost |
|---|---|---|
| **Mutual exclusion** | all resources are shareable (e.g. read-only files) | impossible for printers, mutexes… |
| **Hold and wait** | a process must request everything BEFORE running | terrible utilisation — holds resources it needs late |
| **No preemption** | a waiter's held resources are forcibly taken back | expensive — state must be rollback-able |
| **Circular wait** | all resource types numbered; requests only in increasing order | the classic practical answer — number the resources |

### The Numbered-Resources Example

Resources numbered 1..5. Rule: a process needing resources 5 and 2 must request 2 FIRST, then 5. Consequences: no cycle can form — a process holding a low number requests only HIGHER numbers; the one holding the highest-numbered resource never waits on anyone holding a lower one.

### The Exam One-Liner

> "Breaking ANY ONE of the four conditions prevents deadlock — the least costly is usually circular wait via resource ordering."

### Common Traps

❌ All four conditions must hold — proving just one absent is enough to prove no deadlock.❌ Deadlock on a SINGLE resource (one printer) is impossible without other resources — you need ≥2 contenders on ≥2 resources.❌ Circular wait is a CYCLE condition, not "processes waiting for the same thing".❌ Prevention ≠ avoidance: prevention makes deadlock structurally impossible; avoidance refuses unsafe grants.

### Quick Self-Test (answers at the bottom)

1. Hold-and-wait means the process:
(a) holds one resource while requesting another (b) waits endlessly (c) never releases
2. Numbering resources breaks:
(a) mutual exclusion (b) circular wait (c) preemption
3. To prevent deadlock you need to break:
(a) all four (b) at least one (c) exactly two
4. Requesting EVERYTHING up front is a(n):
(a) avoidance (b) hold-and-wait prevention (c) detection

**Answers:** 1→a, 2→b, 3→b, 4→b.

## 10.2 Deadlock Avoidance (Banker's Algorithm)

### The Bank That Never Goes Broke

A banker lends money only if the remaining cash can still let every client eventually finish their project. THAT is deadlock avoidance: a request is granted only if the system remains in a **safe state**.

### The Model

| Matrix | Meaning |
|---|---|
| **Allocation** | what each process holds NOW |
| **Max** | what each process may EVER need |
| **Need = Max − Allocation** | what each process may still ask for |
| **Available** | what is free right now |

### The Safety Algorithm (pseudocode)

```
Work   = Available                // what we can still hand out
Finish = all FALSE                // nobody proven done yet

REPEAT:
    find a process i with  Finish[i] == FALSE
        AND  Need[i]  <=  Work     // every need satisfiable today
    if found:
        Work   = Work + Allocation[i]   // its resources return
        Finish[i] = TRUE
    else break

DONE: all Finish TRUE          → SAFE (a full order exists)
      some Finish FALSE        → UNSAFE — deadlock eventually possible
```

The resulting order (P1 → P3 → P2 …) is the **safe sequence** — the proof that everyone can finish.

### Worked Example

| Process | Allocation | Max | Need |
|---|---|---|---|
| P0 | (0, 1, 0) | (7, 5, 3) | (7, 4, 3) |
| P1 | (2, 0, 0) | (3, 2, 2) | (1, 2, 2) |
| P2 | (3, 0, 2) | (9, 0, 2) | (6, 0, 0) |
| P3 | (2, 1, 1) | (2, 2, 2) | (0, 1, 1) |
| P4 | (0, 0, 2) | (4, 3, 3) | (4, 3, 1) |

Available = (3, 3, 2).

| Pass | Candidate(s) | Picked | Work after |
|---|---|---|---|
| 1 | P1 (1,2,2) ≤ (3,3,2); P3 (0,1,1) too | P1 → P3 | (5,3,2) → (7,4,3) |
| 2 | P4 (4,3,1) ≤ (7,4,3) | P4 | (7,4,5) |
| 3 | P0 (7,4,3) ≤ (7,4,5); P2 (6,0,0) too | P0 → P2 | (7,5,5) → (10,5,7) |

**Safe sequence: P1 → P3 → P4 → P0 → P2** — the system is safe.

### The Request Rule

A request (R_i) for process i is granted ONLY if:

1. R_i ≤ Need[i]   (never ask for more than you declared)
2. R_i ≤ Available (the money exists)
3. **Trial-allocate** — pretend it is granted and run the safety check; grant only if the state stays SAFE.

### Common Traps

❌ Need = Max − Allocation, NOT Max − Available.❌ The safety check needs a process whose ENTIRE Need fits in Work — partial fits do not count.❌ Safe state ⇒ deadlock impossible; unsafe state ⇒ deadlock POSSIBLE (not certain).❌ When a process "finishes", its full Allocation is ADDED back to Work.

### Quick Self-Test (answers at the bottom)

1. The safety algorithm runs until:
(a) every Finish is TRUE (b) Work is empty (c) one pass completes
2. When a process finishes, we add its ________ to Work:
(a) Need (b) Allocation (c) Max
3. An unsafe state means deadlock is:
(a) guaranteed (b) possible (c) impossible
4. A request is granted only if the attempted state is:
(a) faster (b) safe (c) busy

**Answers:** 1→a, 2→b, 3→b, 4→b.

---

# 11. Problems

## 11.1 Identify Which Deadlock Condition is Violated

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Deadlock Conditions & Prevention |
| **Companies** | Amazon, Oracle |

### Problem Statement

For each prevention rule, name the deadlock condition it breaks, and for each system description, name the condition the system actually PREVENTS (or why it can still deadlock). (a) A printer is granted to one process at a time (no sharing). (b) A process must request ALL resources before starting. (c) The OS can forcibly reclaim a tape drive from a sleeping process. (d) Resources are numbered and requests must be ascending.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Rules (a) and (b). | (a) keeps mutual exclusion — deadlock is still possible if other conditions hold. (b) breaks hold-and-wait. | Condition 1 cannot be 'broken' for printers — they are exclusive by nature. Requiring everything upfront means a process never holds one resource while requesting another. |
| Rule (c): forcible reclamation. | Breaks no preemption. | If a held resource may be taken away, the 'wait forever on a held resource' chain cannot solidify — preemption is the lever. |
| Rule (d) plus a system that uses it. | Breaks circular wait. | Ascending-only requests make a cycle impossible: the holder of the highest-numbered resource never requests any other — circles cannot close. |

### Constraints

- One condition per rule — name it exactly (mutual exclusion, hold and wait, no preemption, circular wait).
- Explain WHY in one line per case.
- A rule that strengthens mutual exclusion (a) does not prevent deadlock by itself.

### Approach

**The Condition → Countermeasure Map**

| # | Condition | Countermeasure family |
|---|---|---|
| 1 | mutual exclusion | share the resource |
| 2 | hold and wait | request everything up front / release before requesting |
| 3 | no preemption | allow forcible resource reclamation |
| 4 | circular wait | global resource numbering, ascending requests |

**The One-Line Question Bank**

| System smells like… | Condition addressed |
|---|---|
| "must declare all resources in advance" | hold and wait |
| "kernel can take the resource back" | no preemption |
| "numbered resources, ascending order" | circular wait |
| "mutexes, printers, exclusive devices" | (mutual exclusion — kept, needs other guards) |

**Common Traps**

❌ Breaking mutual exclusion is the ONE strategy you almost never can apply.❌ All-upfront requests prevent deadlock but waste utilisation — the classic trade-off question.❌ Numbering prevents cycles but burdens programmers with global ordering discipline.

## 11.2 Apply the Banker's Algorithm

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Deadlock Avoidance (Banker's Algorithm) |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Five processes, three resource types (A, B, C). Available = (3, 3, 2). Allocation: P0 (0,1,0), P1 (2,0,0), P2 (3,0,2), P3 (2,1,1), P4 (0,0,2). Max: P0 (7,5,3), P1 (3,2,2), P2 (9,0,2), P3 (2,2,2), P4 (4,3,3). (a) Build the Need matrix. (b) Find a safe sequence. (c) Can P1's request (1, 0, 2) be granted immediately? (d) If granted, is the system still safe? (e) Can P0's request (0, 2, 0) be granted after that?

### Examples

| Input | Output | Explanation |
|---|---|---|
| Part (a): the Need matrix. | P0 (7,4,3), P1 (1,2,2), P2 (6,0,0), P3 (0,1,1), P4 (4,3,1). | Need = Max − Allocation, element-wise. P1 needs only 1 A, 2 B, 2 C more to finish its declared plan. |
| Parts (b) and (c): find the safe sequence, then decide on P1's request (1,0,2). | Need matrix from part (a). Work = Available = (3,3,2): P1 (1,2,2) fits → Work (5,3,2); P3 (0,1,1) fits → (7,4,3); P4 (4,3,1) fits → (7,4,5); P0 (7,4,3) fits → (7,5,5); P2 (6,0,0) fits → (10,5,7). Safe sequence: P1 → P3 → P4 → P0 → P2. Now P1 requests (1,0,2): ≤ Need₁ (1,2,2) ✓ and ≤ Available (3,3,2) ✓ — first two gates pass, so trial-grant it. | Gates 1 and 2 are only affordability checks. The third gate — trial-granting and testing the resulting state — decides whether the request is actually granted (next example). |
| Parts (d) and (e): is the system still safe after P1's grant? Then P0 requests (0,2,0). | (d) Trial-grant P1: Available becomes (2,3,0), P1's Need drops to (0,2,2). Safety check on the trial state finds NO process that fits: P0 (7,4,3) fails A, P2 (6,0,0) fails A, P3 (0,1,1) fails C (1 > 0), P4 (4,3,1) fails A and C. Nobody can ever run → trial state is UNSAFE → P1's request (1,0,2) is DENIED; P1 must wait. (e) With P1's request refused, P0's (0,2,0) is checked against the ORIGINAL state: ≤ Need (7,4,3) ✓, ≤ Available (3,3,2) ✓ → trial Available = (3,1,2); P1 (1,2,2) fails B, so try P3 (0,1,1) ✓ → Work (5,2,3); P1 ✓ → (7,2,3); P0 ✓ → (7,3,3); P4 ✓ → (7,3,5); P2 ✓ → (10,3,7). SAFE — grant P0. | The lesson: 'individually affordable' is NOT 'safe'. P1's request passes gates 1 and 2 but FAILS safety — refusing it is the algorithm's whole purpose. P0's request passes all three gates and is granted. |

### Constraints

- Three gates per request: R ≤ Need, R ≤ Available, trial-state safety.
- A safe sequence must be shown, not just asserted.
- Answers must reflect the DENIED request: later answers use the ORIGINAL state.

### Approach

**Part (c)/(d) — The Denied Request**

```
ORIGINAL  Available = (3,3,2)
safe:     P1 → P3 → P4 → P0 → P2
          Work: (3,3,2)→(5,3,2)→(7,4,3)→(7,4,5)→(7,5,5)→(10,5,7)

REQUEST P1(1,0,2):
  ≤ Need (1,2,2)? ✓   ≤ Available? ✓   trial → Available (2,3,0)
  safety on trial: NO process fits
     P3 (0,1,1) fails C (1 > 0); P4 (4,3,1) fails C; P2 fails A; P0 fails A
  → UNSAFE → DENY, restore Available (3,3,2)
```

**Part (e) — The Granted Request**

```
REQUEST P0(0,2,0):  ≤ Need (7,4,3) ✓  ≤ Available (3,3,2) ✓
trial Available = (3,1,2)
P3 (0,1,1) ✓ → Work (5,2,3)
P1 (1,2,2) ✓ → Work (7,2,3)
P0 (7,4,3) ✓ → Work (7,3,3)
P4 (4,3,1) ✓ → Work (7,3,5)
P2 (6,0,0) ✓ → Work (10,3,7)
→ SAFE: P3 → P1 → P0 → P4 → P2   GRANT (0,2,0)
```

**The Decision Flow**

```
request valid (≤ Need, ≤ Available)?
   │
   ├─ trial-grant → run safety check
   │      ├─ finds a full sequence → GRANT
   │      └─ finds none → DENY (tell the process to wait)
```

**Common Traps**

❌ A request that 'fits in Available' can still be unsafe — always trial and verify.❌ After a grant the system graphs CHANGE — recompute Need for the granted process.❌ Sequence order in the trial: pick the first process whose ENTIRE Need fits Work, in any consistent order.
