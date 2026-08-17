# OS Learning Document — Classical Synchronization Problems

> A comprehensive, student-friendly guide to Classical Synchronization Problems — the foundation every OS course stands on.
> Master readers-writers problem, dining philosophers problem, with exam-style problems and fully worked solutions.

---

# 9. Classical Synchronization Problems

> **Lesson Overview:** The three classic exam monsters. The Readers-Writers problem (many readers may read together, writers need total silence), the Dining Philosophers (five thinkers, five forks, guaranteed chopstick deadlock if you code it naively), and the bounded-buffer producer-consumer — each with a proven semaphore solution.
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Hard
> - **Problems:** 2

---

## 9.1 Readers-Writers Problem

### The Library Rule

A database can serve many READERS at once — reads do not change anything. A WRITER must have the room completely to itself. The problem: balance who gets priority without starving anyone.

### The Cast

| Participant | Rule |
|---|---|
| Reader | may enter while other readers are inside |
| Writer | may enter only when NO ONE else is inside (readers or writers) |

### Solution Structure (reader-priority)

Two semaphores:

| Semaphore | Initial | Guards |
|---|---|---|
| rw_mutex | 1 | who enters the data? (readers coordinate, writers gate on it) |
| mutex | 1 | the reader counter |

```
// WRITER — always the same shape:
wait(rw_mutex);
   write the data;
signal(rw_mutex);

// READER — first reader in takes the gate, last one out releases it:
wait(mutex);
   read_count++;
   if (read_count == 1) wait(rw_mutex);   // first reader: lock the writers out
signal(mutex);

   read the data;                          // safe: other readers allowed

wait(mutex);
   read_count--;
   if (read_count == 0) signal(rw_mutex); // last reader: writers may enter
signal(mutex);
```

### Reader vs Writer Priority

| Variant | Winner | Trade-off |
|---|---|---|
| **Reader priority** (above) | readers never wait for readers | a continuous stream of readers can starve the writers |
| **Writer priority** | once a writer waits, new readers queue behind it | readers can starve if writers keep queuing |

### Common Traps

❌ The FIRST reader takes rw_mutex; only the LAST reader releases it — count the readers correctly.❌ Writers do NOT touch the reader counter at all — that is mutex's private business.❌ Reader priority does not use a queue for writers — it races; writer starvation needs writer-priority or a ticket queue.❌ "Two writers at once" is forbidden even if no readers — rw_mutex enforces that too.

### Quick Self-Test (answers at the bottom)

1. Readers may be inside the CS: (a) one at a time (b) many at once (c) never with writers also allowed
2. Writer entry requires: (a) read_count == 0 and no writer (b) an empty buffer (c) priority
3. The first reader must: (a) wait(rw_mutex) (b) signal(rw_mutex) (c) sleep
4. Reader priority can starve: (a) readers (b) writers (c) the kernel

**Answers:** 1→b, 2→a, 3→a, 4→b.

## 9.2 Dining Philosophers Problem

### The Round Table of Deadlock

Five philosophers sit around a table, one fork between each pair (5 forks total). Each philosopher alternates THINK and EAT; to eat they need BOTH the fork on their left AND the one on their right.

### The Naive (Deadlocking) Solution

```
wait(fork[i]);            // left fork
wait(fork[(i + 1) % 5]);  // right fork
EAT
signal(fork[i]);
signal(fork[(i + 1) % 5]);
THINK
```

If EVERY philosopher picks up their left fork at the same moment:

| Philosopher | Holds | Wants |
|---|---|---|
| P0 | fork0 | fork1 |
| P1 | fork1 | fork2 |
| P2 | fork2 | fork3 |
| P3 | fork3 | fork4 |
| P4 | fork4 | fork0 |

A perfect wait-for CYCLE — nobody can eat, nobody can put a fork down. **Classic deadlock: hold-and-wait + circular wait.**

### Three Proven Fixes

| Fix | Idea | Cost |
|---|---|---|
| **One left-hander** | philosopher 4 grabs the RIGHT fork first — breaks the cycle | simple, classic exam answer |
| **Max 4 at the table** | a counting semaphore of 4 lets at most four philosophers compete — one fork always remains free | elegant with a semaphore |
| **Odd/even rule** | odd philosophers grab left first, even grab right first — same cycle break | easy to explain |

```
// Fix 2 with a semaphore — room = 4:
wait(room);                // at most 4 philosophers try to eat
wait(fork[i]);
wait(fork[(i + 1) % 5]);
EAT
signal(fork[i]);
signal(fork[(i + 1) % 5]);
signal(room);
```

Why does the room=4 fix work? Among any 4 philosophers at 5 forks, at least one pair is NOT fighting over the same middle fork — someone can always make progress.

### Interview One-Liner

> "The dining philosophers deadlock because of circular wait; break the cycle by having one philosopher pick up forks in the opposite order."

### Common Traps

❌ The deadlock needs ALL FIVE to hold-and-wait — four philosophers cannot deadlock (5 forks, 4 diners).❌ Fixes break circular wait, not "greed"/priority.❌ The room semaphore (n−1 of n) is a general anti-deadlock trick: cap concurrent contenders.❌ Starvation is still possible in naive fixes — the semaphore fix + fairness covers it.

### Quick Self-Test (answers at the bottom)

1. With the naive solution, all 5 philosophers picking the left fork first:
(a) eat in turns (b) deadlock (c) are fast
2. The deadly cycle is called:
(a) circular wait (b) convoy (c) aging
3. Letting at most 4 philosophers reach for forks:
(a) guarantees one fork stays free (b) breaks the table (c) adds forks
4. Having philosopher 4 take the right fork first:
(a) breaks the cycle (b) starves P4 (c) doubles forks

**Answers:** 1→b, 2→a, 3→a, 4→a.

---

# 10. Problems

## 10.1 Solve the Readers-Writers Problem

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Readers-Writers Problem |
| **Companies** | Amazon, Microsoft, Oracle |

### Problem Statement

Answer for the reader-priority solution (rw_mutex, mutex, read_count). (a) Write the WRITER's entry/exit and the READER's entry/exit. (b) What happens if a new reader arrives while a WRITER is waiting? (c) Show the state trace for: R1 in, R2 in, W1 wants in, R3 arrives, R2 leaves, R1 leaves — who gets the database when and why?

### Examples

| Input | Output | Explanation |
|---|---|---|
| Part (a): the skeleton. | Writer: wait(rw_mutex); write; signal(rw_mutex). Reader: wait(mutex); read_count++; if (read_count == 1) wait(rw_mutex); signal(mutex); read; wait(mutex); read_count--; if (read_count == 0) signal(rw_mutex); signal(mutex). | The first reader takes the gate for the whole reader pack; the last reader opens it. Writers always go through rw_mutex alone. |
| Part (b): a reader arrives while a writer waits. | The reader enters the database immediately — read_count becomes 2 and the first-reader gate (rw_mutex) is already held by R1. | Reader priority: waiting writers do not block arriving readers. This is exactly why writers can starve under continuous reader traffic. |
| Part (c): the full trace. | R1 in (takes rw_mutex). R2 in (count 2 — no gate change). W1 waits on rw_mutex. R3 enters (count 3 — writer cannot stop it). R2 leaves (count 2). R1 leaves (count 1 — still no gate release). When the LAST reader leaves, rw_mutex is released and W1 finally writes. | Readers chain through the count; only the final reader's exit unblocks the writer. The writer's wait may last a long time — reader-priority in a nutshell. |

### Constraints

- Use ONLY the reader-priority primitives: rw_mutex, mutex, read_count.
- Readers never touch rw_mutex except first-in/last-out.
- Writers never touch read_count.

### Approach

**The Canonical Solution**

```
read_count = 0; mutex = 1; rw_mutex = 1

WRITER:             READER:
wait(rw_mutex)      wait(mutex)
write               read_count++
signal(rw_mutex)    if (read_count == 1) wait(rw_mutex)
                    signal(mutex)
                    read
                    wait(mutex)
                    read_count--
                    if (read_count == 0) signal(rw_mutex)
                    signal(mutex)
```

**Part (c) — The State Table**

| Step | read_count | rw_mutex holder | Who is in the DB |
|---|---|---|---|
| R1 enters | 1 | R1 (first reader) | R1 |
| R2 enters | 2 | still R1's | R1, R2 |
| W1 wants in | 2 | still held | blocked on rw_mutex |
| R3 enters | 3 | still held | R1, R2, R3 |
| R2 leaves | 2 | still held | R1, R3 |
| R1 leaves | 1 | still held | R3 |
| R3 leaves | 0 | RELEASED → W1 | W1 writes |

**Why Writers Starve (and the fix)**

Readers keep bumping read_count above 0 while holding rw_mutex. Writer-priority adds a gate writers pass first; then arriving readers queue behind it.

**Common Traps**

❌ The FIRST reader's wait() is inside the mutex — do not re-order; the count itself must be exclusive.❌ signal(rw_mutex) happens ONLY at count 0 — releasing earlier lets a writer in while readers still read.❌ A writer while readers are inside just WAITS — the database is not corrupt, merely busy.

## 10.2 Solve the Dining Philosophers Problem

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Dining Philosophers Problem |
| **Companies** | Google, Microsoft |

### Problem Statement

Five philosophers, one fork between each pair. (a) Explain exactly how the naive left-then-right solution deadlocks. (b) Add ONE mechanism (a room semaphore of 4, or a left-hander) and prove no deadlock can occur. (c) For the state 'P0 holds fork0 and fork1; P2 holds fork2 and fork3; P1, P3, P4 hungry with left forks free or taken below', decide if anyone can eat and whether the state is deadlocked.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Part (a): the naive deadlock. | All five grab their LEFT fork simultaneously → every philosopher holds one fork and waits for the right → a perfect wait-for cycle → deadlock. | Hold-and-wait + circular wait: each waiter's needed fork is held by the next waiter. Nobody can release (releasing requires eating, eating requires forks). |
| Part (b): the room fix and its proof. | Add semaphore room = 4; every philosopher does wait(room) before reaching for forks. Proof: with ≤ 4 diners at 5 forks, at least one fork is free even if everyone holds one — a free fork pair exists for someone. | With 4 philosophers holding 4 forks and 5 forks total, the fifth fork is free. Someone adjacent to the free fork can take it and eat — progress forever guaranteed. |
| Part (c): given the state. | P0 holds fork0 + fork1 and can EAT right now (it holds both). P2 holds fork2 + fork3 and can also eat. After they eat and release, P1/P3/P4 take their pairs. NOT deadlocked. | Deadlock requires EVERY contender to be blocked. Here two philosophers already hold complete fork pairs — they make progress, break any cycle, and eventually free forks for the rest. |

### Constraints

- Proofs must be one or two sentences — exam style.
- 'Left-hander' means philosopher 4 takes the right fork first.
- Decide each given state on whether ANYONE can make progress.

### Approach

**Anatomy of the Deadlock**

```
naive:
wait(fork[i]);  wait(fork[(i+1) % 5]);  EAT;  signal both

simultaneous grab → everyone holds fork[i], waits for fork[(i+1)%5]
cycle: P0→P1→P2→P3→P4→P0  → DEADLOCK
```

**Fix 1 — The Room (n − 1 contenders)**

| Why it works | Numbers |
|---|---|
| at most 4 philosophers compete | 5 forks, 4 held max → 1 free |
| someone next to the free fork eats | progress exists at every instant |

**Fix 2 — The Left-Hander**

Philosopher 4 picks fork0 (right) FIRST. The cycle P4→P0 breaks: P4 and P0 cannot both wait on each other's fork simultaneously.

**The Decision Method for Any State**

```
1. can ANY competitor hold a FULL fork pair right now?      → someone eats
2. can anyone whose pair is incomplete acquire it without
   waiting on another waiter?                              → progress
3. neither → DEADLOCK
```

**Common Traps**

❌ Deadlock needs EVERYONE blocked — one eater breaks the case.❌ The room semaphore is released AFTER both forks — late release reserves the seat longer.❌ Fixes break circular wait; they do not reduce hunger (starvation is a separate fairness question).
