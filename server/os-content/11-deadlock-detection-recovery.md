# OS Learning Document — Deadlock Detection & Recovery

> A comprehensive, student-friendly guide to Deadlock Detection & Recovery — the foundation every OS course stands on.
> Master deadlock detection algorithms, deadlock recovery strategies, with exam-style problems and fully worked solutions.

---

# 11. Deadlock Detection & Recovery

> **Lesson Overview:** Deadlocks happen — detective work begins. Learn to read a Resource Allocation Graph and spot the deadly cycle, run the wait-for detection algorithm on real allocation tables, and then decide who gets sacrificed: kill a process, steal a resource, or roll back to a checkpoint.
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Medium
> - **Problems:** 1

---

## 11.1 Deadlock Detection Algorithms

### The Detective's Toolkit

Prevention and avoidance stop deadlocks before they happen. **Detection** lets them happen — then finds them and recovers. Two tools:

### Tool 1 — The Resource Allocation Graph (RAG)

| Node / edge | Drawing |
|---|---|
| process | circle |
| resource type (with instances) | square with dots |
| P wants R (request edge) | P ───► R |
| R is held by P (assignment edge) | R ───► P |

**Rule:** if every resource type has exactly ONE instance, a **cycle in the RAG = deadlock** (cycle detection on the graph).

```
   P1 ──► R1 ──► P2 ──► R2 ──► P3 ──► R3 ──► P1    ← cycle through all three!
   P1 holds R3, wants R1; P2 holds R1, wants R2; P3 holds R2, wants R3
   = deadlock: everyone waits on the next person's resource
```

**Multi-instance caveat:** with resources of multiple instances, a cycle is NECESSARY but not SUFFICIENT — check with the matrix algorithm below.

### Tool 2 — The Wait-For Detection Algorithm (multi-instance)

A safety-check lookalike: see if someone can finish and return resources.

```
Work   = Available
Finish = FALSE for all

pick any i with Finish[i] == FALSE and Allocation[i] <= Work
    → Work += Allocation[i]; Finish[i] = TRUE; repeat

any Finish FALSE  → DEADLOCK (those processes are in it)
```

| State | Verdict |
|---|---|
| all Finish TRUE | no deadlock — everyone can finish |
| some Finish FALSE (unfinishable, their needs > Work) | deadlocked set found |

### When to Run Detection

| Strategy | Cadence | Cost |
|---|---|---|
| **Every request** | tightest net | expensive — used only where deadlock is catastrophic |
| **Periodically** | every n seconds, or when CPU utilisation drops below a floor | the practical default (Linux OOM-killer-style heuristics: "CPU idle + I/O busy = deadlocked?") |

### Common Traps

❌ A RAG cycle guarantees deadlock ONLY for single-instance resources.❌ In a RAG, request edges point P→R and assignment edges R→P — get the direction right.❌ The detection scan is a SAFETY-CLASS algorithm but proves DEADLOCK, not safety.❌ Detection must be periodic or on-demand — the OS cannot know by intuition.

### Quick Self-Test (answers at the bottom)

1. In a RAG, "P → R" means:
(a) P holds R (b) P requests R (c) R requests P
2. A RAG cycle with single-instance resources implies:
(a) starvation (b) deadlock (c) aging
3. With multi-instance resources, a cycle is:
(a) sufficient (b) necessary but not sufficient (c) irrelevant
4. The wait-for scan finishes a process whose Allocation:
(a) equals Work (b) fits inside Work (c) exceeds Work

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 11.2 Deadlock Recovery Strategies

### After the Detective Comes the Swat Team

Deadlocks detected are deadlocks that must be resolved. The three families of recovery:

### 1. Process Termination — The Hammer

| Strategy | What you do | Effect |
|---|---|---|
| **Kill ALL deadlocked processes** | nuke everyone in the cycle | costly — done work is lost, but guaranteed clean |
| **Kill ONE at a time** | kill, re-run detection, repeat | cheaper — you may clear the cycle with a single victim |

Choosing the victim:

| Criterion | Ask |
|---|---|
| priority | kill the LOWEST priority |
| progress | how long has it run? how much work left? |
| resources used | how many resources does it hold? |
| how many more does it need | high need = happy victim |
| interactivity | users suffer when interactive jobs die |
| restarts | is it cheap to restart? |

### 2. Resource Preemption — The Steal

Forcefully take a resource from its holder and give it to a waiter.

| Step | Detail |
|---|---|
| Select a victim | same criteria as above |
| Rollback | return the victim process to a safe CHECKPOINT state (it restarts from there) |
| Starvation guard | the same process must not get robbed repeatedly — track how many times it was preempted |

### 3. Rollback — The Time Machine

If the OS checkpoints processes periodically (save full state), a deadlocked process can jump BACK to the last checkpoint — releasing the resources it holds between checkpoint and now, and undoing its interference.

| Strategy | Unique cost |
|---|---|
| Termination | lose ALL of the victim's work |
| Preemption + rollback | lose only work since the last checkpoint |
| No recovery | the system freezes silently — never acceptable |

### The Interview One-Liner

> "Terminate the fewest cheap processes, or preempt with rollback to the last checkpoint — and never let the same process be the victim forever."

### Common Traps

❌ Killing ALL victims is the sledgehammer — "kill one at a time" is usually enough (the cycle often breaks with one death).❌ Preemption needs CHECKPOINTS to be meaningful — rollback demands periodic state saves.❌ Victim selection must avoid punishing the same process repeatedly (starvation of recovery).❌ Recovery acts AFTER detection — no deadlock detector means no recovery trigger.

### Quick Self-Test (answers at the bottom)

1. Killing one process at a time, then re-checking, is:
(a) wasteful (b) the budget-friendly strategy (c) forbidden
2. Rollback needs:
(a) checkpoints (b) more RAM (c) a faster CPU
3. The victim should have:
(a) the highest priority (b) the least remaining work justified (c) most users
4. Preempting the same victim forever is:
(a) fine (b) recovery starvation (c) mandatory

**Answers:** 1→b, 2→a, 3→b, 4→b.

---

# 12. Problems

## 12.1 Detect a Deadlock Using a Resource Allocation Graph

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Deadlock Detection Algorithms |
| **Companies** | Amazon, Oracle, Microsoft |

### Problem Statement

Given these graph clauses (single-instance resources): P1 holds R3, requests R1; P2 holds R1, requests R2; P3 holds R2, requests R4; P4 holds R4, requests R3; P5 holds R5 (and requests nothing). (a) Draw the graph edges. (b) Is there a cycle — are P1..P4 deadlocked? (c) Is P5 deadlocked? (d) Explain with the wait-for cycle.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Part (a): the edge list. | Request edges: P1→R1, P2→R2, P3→R4, P4→R3. Assignment edges: R3→P1, R1→P2, R2→P3, R4→P4, R5→P5. | Requests point process → resource; assignments point resource → process. Edge directions are half the marks. |
| Parts (b) and (c): cycle? deadlock? P5? | (b) Cycle exists: P1 → R1 → P2 → R2 → P3 → R4 → P4 → R3 → P1 — all four are deadlocked. (c) P5 is NOT in the cycle — it holds R5 and waits on nothing; it runs happily. | Single-instance resources: cycle ⟺ deadlock for the cycle members. P5's subgraph is acyclic and satisfied — free to complete. |
| Part (d): the wait-for restatement. | Wait-for chain: P1 waits for a resource P2 holds; P2 waits for P3; P3 waits for P4; P4 waits for P1 — circular wait among exactly {P1, P2, P3, P4}. | Contracting each resource edge into its holder gives the wait-for graph; any cycle there IS the deadlocked set. |

### Constraints

- Draw request → resource and resource → request-assignment directions correctly.
- A cycle names WHICH processes are trapped (others may be free).
- Single-instance assumption applies to every resource here.

### Approach

**Build the Graph, Shrink to Wait-For**

**Step 1 — Full RAG**

```
     request:  P ──► R        assignment:  R ──► P

P1 ──► R1 ──► P2 ──► R2 ──► P3 ──► R4 ──► P4 ──► R3 ──► P1
              ^                                          │
              └────────────── cycle! ◄───────────────────┘

P5 ──► R5                            (isolated — no requests)
```

**Step 2 — The Wait-For Reduction**

| Contender | Waits for the resource held by |
|---|---|
| P1 | P2 (R1) |
| P2 | P3 (R2) |
| P3 | P4 (R4) |
| P4 | P1 (R3) |

Cycle: P1 ⇄ P2 ⇄ P3 ⇄ P4 — deadlocked set = {P1, P2, P3, P4}.

**Step 3 — Verdicts**

| Process | In cycle? | Verdict |
|---|---|---|
| P1–P4 | yes | DEADLOCKED |
| P5 | no | free to finish |

**Common Traps**

❌ P5 holds a resource but requests NOTHING — never part of a wait cycle by definition.❌ Multi-instance resources break the cycle ⟺ deadlock equivalence — that is why the matrix scan exists.❌ Edge direction: requests P→R, assignments R→P — reversing them misreads the whole graph.
