# OS Learning Document — Process Synchronization

> A comprehensive, student-friendly guide to Process Synchronization — the foundation every OS course stands on.
> Master critical section problem, semaphores & mutex locks, with exam-style problems and fully worked solutions.

---

# 8. Process Synchronization

> **Lesson Overview:** Two processes updating the same balance at the same time = lost money. Learn what makes a critical section safe (mutual exclusion, progress, bounded waiting), then arm yourself with the two classic weapons: mutex locks and semaphores — the counting-semaphore recipe for producer-consumer is the single most-asked OS interview question.
> - **Category:** CPU Scheduling, Synchronization & Deadlocks
> - **Difficulty:** Hard
> - **Problems:** 2

---

## 8.1 Critical Section Problem

### The ATM Horror Story

Two ATMs, one account with 1000 rupees. Both check "balance ≥ 500" (true), both dispense 500 — mutual exclusion was NOT enforced. Two processes updating the same variable with read-modify-write are racing: the last write wins, money vanishes.

### What a Critical Section Is

The **critical section** of a process is the piece of code that touches SHARED data. The rule: at most ONE process may be inside its critical section at any moment.

```
while (true) {
    // entry section  — ask permission
    CRITICAL SECTION  — update shared balance
    // exit section   — release permission
    remainder section — everything else (no shared data)
}
```

### The Three Holy Requirements

| Requirement | Meaning | Violation smells like |
|---|---|---|
| **Mutual exclusion** | no two processes inside the CS at once | two ATMs both dispensing |
| **Progress** | if the CS is free and someone wants in, someone MUST get in — no bystander/outsider blocks the decision | an unrelated process holds the door shut forever |
| **Bounded waiting** | no process waits forever — a bound exists on how many times others pass first | starvation (one process never gets in) |

### Peterson's Algorithm (for TWO processes)

```
shared: turn = 0; flag[2] = {false, false}

// process i (i = 0 or 1), other = 1 - i
flag[i] = true;
turn = other;              // "your turn first — be polite"
while (flag[other] && turn == other)
    ;                      // busy wait — other is inside
CRITICAL SECTION
flag[i] = false;           // leave

// The trick: only the LAST one to set turn actually waits.
// Worst case: other passes at most ONCE before i enters → bounded waiting.
```

| Property | Why it holds |
|---|---|
| mutual exclusion | both set turn=other; the loser spins, the winner enters |
| progress | if only i wants in, flag[other]=false → i never spins |
| bounded waiting | i can be overtaken at most once (by the other) |

### Common Traps

❌ Mutual exclusion alone is NOT enough — progress and bounded waiting matter too.❌ Busy waiting is a valid solution, just wasteful — it spins the CPU.❌ "Two processes read, nobody writes" has NO race — races need a WRITER.❌ The entry section must run WITHOUT holding the resource — that is the whole trick.

### Quick Self-Test (answers at the bottom)

1. A critical section is code that:
(a) is fast (b) touches shared data (c) runs on CPU 0
2. "Liberate the CS while someone else also wants in — without deadlock" is:
(a) mutual exclusion (b) progress (c) speed
3. Bounded waiting forbids:
(a) loops (b) starvation (c) recursion
4. The ATM disaster violated:
(a) mutual exclusion (b) the bank's uptime (c) priority

**Answers:** 1→b, 2→b, 3→b, 4→a.

## 8.2 Semaphores & Mutex Locks

### The Toll Booth for Shared Data

A **semaphore** is a counter with two atomic operations:

| Operation | Effect |
|---|---|
| **wait() (P / down / acquire)** | if count > 0 → decrement; else block until the semaphore is positive again |
| **signal() (V / up / release)** | increment count; if processes are blocked → wake one |

| Kind | Initial value | Use |
|---|---|---|
| **Binary mutex** | 1 | mutual exclusion on ONE resource |
| **Counting semaphore** | n (> 1) | pool of n identical resources |

### Mutex, the Binary Key

```
mutex = 1

// every process:
wait(mutex);      // acquire the key
CRITICAL SECTION
signal(mutex);    // release the key
```

### The Producer-Consumer Solution (THE classic)

Shared: bounded buffer of size n, plus three semaphores:

| Semaphore | Initial | Guards |
|---|---|---|
| mutex | 1 | the buffer itself (mutual exclusion) |
| empty | n | free slots |
| full | 0 | occupied slots |

```
// PRODUCER
while (true) {
    produce(item);
    wait(empty);          // need a free slot
    wait(mutex);          // enter buffer
    buffer[in] = item; in = (in + 1) % n;
    signal(mutex);        // leave buffer
    signal(full);         // one more occupied slot
}

// CONSUMER
while (true) {
    wait(full);           // need an item
    wait(mutex);          // enter buffer
    item = buffer[out]; out = (out + 1) % n;
    signal(mutex);        // leave buffer
    signal(empty);        // one more free slot
    consume(item);
}
```

**Order matters:** wait(empty) BEFORE wait(mutex) — swapping them invites deadlock (the producer holding the buffer lock while waiting for a free slot the consumer can never free).

### Busy Waiting vs Blocking

| Implementation | What happens |
|---|---|
| **Busy waiting** | the semaphore spins: while (count ≤ 0) {}; — wastes CPU but stays in user space |
| **Blocking** | the process is suspended and put on a wait queue — the CPU is freed |

Modern semaphores block; the classic textbook counts them spinning.

### Common Traps

❌ Swap the wait() order in producer-consumer → deadlock. Memorise: resource count FIRST, mutex second.❌ A mutex is NOT a counting semaphore with n>1 — a mutex has ownership; a semaphore does not.❌ signal() never blocks — only wait() can block.❌ 2× wait(mutex) without a signal in between = self-deadlock.

### Quick Self-Test (answers at the bottom)

1. wait() decrements when: (a) count > 0 (b) count = 0 always (c) never
2. Producer-consumer waits for a slot with:
(a) wait(mutex) (b) wait(empty) (c) signal(full)
3. Swapping the two waits in producer-consumer:
(a) speeds it up (b) risks deadlock (c) loses items
4. Blocking semaphores, unlike busy-wait, free:
(a) the buffer (b) the CPU (c) the disk

**Answers:** 1→a, 2→b, 3→b, 4→b.

---

# 9. Problems

## 9.1 Identify the Critical Section Violation

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Critical Section Problem |
| **Companies** | Google, Oracle |

### Problem Statement

For each scenario, name the requirement that fails (mutual exclusion, progress, bounded waiting — or none). (a) Two processes may both enter the critical section together. (b) The CS is free, process X wants in, but process Y — which does not want the CS at all — prevents X from entering. (c) Process X wants in and is repeatedly overtaken by others, forever. (d) Processes enter one at a time, a waiter always gets in within two passes, and a bystander never blocks anyone.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Scenario (a): two processes inside the CS together. | Mutual exclusion violated. | The core promise of a CS: at most one process inside at any moment. Two inside = the ATM disaster. |
| Scenario (b): an uninterested bystander blocks X. | Progress violated. | Progress demands: CS free + someone wants in → someone gets in. Decisions must involve ONLY contenders; a bystander's vote blocks the entry decision. |
| Scenarios (c) and (d). | (c) Bounded waiting violated (starvation). (d) No violation — all three requirements hold. | Bounded waiting caps how many times others may pass first. Scenario (d) passes mutual exclusion (one at a time), progress (no bystander blocking), and bounded waiting (a 2-pass cap). |

### Constraints

- One requirement per scenario — do not invent new ones.
- Progress is about DECISION-making; bounded waiting is about FAIRNESS over time.
- If all three hold, answer 'none'.

### Approach

**The Three-Question Interrogation**

For any scenario ask in order:

```
Q1: can two processes be inside the CS together?      → MUTUAL EXCLUSION
Q2: is the CS free, someone wants in, and yet NOBODY   → PROGRESS
    can get in (because of an outsider or all-inside
    argument) ?
Q3: can a contending process be overtaken forever?     → BOUNDED WAITING
Q4: none of the above?                                 → NO VIOLATION
```

**The Distinction Table**

| Smell in the story | Requirement |
|---|---|
| "both inside" / "two ATMs" | mutual exclusion |
| "an unrelated process holds the door" | progress |
| "always someone else first" / "starves" | bounded waiting |
| "one at a time, capped overtakes, no bystanders" | none |

**Common Traps**

❌ Starvation (repeatedly overtaken) is a BOUNDED-WAITING fault, not a progress fault — progress fails when NOBODY can enter.❌ Two readers with no writer is NOT a violation — a CS only matters when shared data is WRITTEN.❌ Livelock/deadlock of the door-holding kind is usually a PROGRESS failure, not mutual exclusion.

## 9.2 Solve the Producer-Consumer Problem with Semaphores

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Semaphores & Mutex Locks |
| **Companies** | Google, Amazon, Microsoft |

### Problem Statement

A bounded buffer of size 3 starts empty. One producer and one consumer share it. The code below is MISSING four statements (two in each side). Complete it so that: the buffer never overflows, the consumer never reads an empty slot, and two processes never touch the buffer at once. State the initial values of every semaphore you introduce.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Which three semaphores does the solution need, and their start values? | empty = 3 (free slots), full = 0 (filled slots), mutex = 1 (buffer access). | Counting semaphores track capacity; the binary mutex serialises physical access to the array. |
| The PRODUCER side: place the waits and signals correctly. | wait(empty) THEN wait(mutex); work; then signal(mutex) THEN signal(full). | Capacity is reserved BEFORE taking the mutex — holding the mutex while waiting for a slot is the classic deadlock: the consumer cannot free a slot because the producer owns the buffer. |
| The CONSUMER side, plus a sanity check on the final state. | wait(full) THEN wait(mutex); take item; signal(mutex) THEN signal(empty). After one produce + one consume cycle the buffer holds exactly what was produced — no overflow, no underflow. | Mirror image of the producer: reserve content, then the buffer lock. The two counting semaphores guarantee the invariant empty + full = 3 at all times. |

### Constraints

- Introduce whatever semaphores are needed — name initial values explicitly.
- The ORDER of the two waits is graded — never mutex-first.
- The invariants must hold: 0 ≤ items ≤ 3; empty + full = 3.

### Approach

**The Complete Solution**

```
shared:
  buffer[3]
  empty = 3, full = 0, mutex = 1

PRODUCER:
  loop:
    item = produce()
    wait(empty)          // reserve a free slot — BLOCKS when buffer full
    wait(mutex)          // lock the array
    buffer[in] = item; in = (in + 1) % 3
    signal(mutex)        // unlock the array
    signal(full)         // announce one filled slot

CONSUMER:
  loop:
    wait(full)           // reserve an item — BLOCKS when buffer empty
    wait(mutex)          // lock the array
    item = buffer[out]; out = (out + 1) % 3
    signal(mutex)        // unlock the array
    signal(empty)        // announce one free slot
    consume(item)
```

**Why the Order Prevents Deadlock**

| Order | Effect |
|---|---|
| wait(empty) FIRST | the producer blocks on CAPACITY while holding NOTHING |
| wait(mutex) second | once past capacity, it locks the buffer briefly |
| swap them | producer holds mutex + waits for empty → consumer needs mutex to free a slot → circular wait → deadlock |

**Invariant Checks**

| After any step | Assert |
|---|---|
| produce | full + empty = 3 still true (count moved, not lost) |
| consume | buffer count never negative, never above 3 |

**Interview One-Liner**

> "Reserve the RESOURCE first, the mutex second — never hold the buffer lock while waiting for the buffer itself to change."

**Common Traps**

❌ missing signal() anywhere = counters drift → eventual deadlock or overflow.❌ mutex around EVERY array access — the count semaphores do NOT protect the array.❌ A consumer blocked on wait(full) holds NO locks — verify with the swap-order trap above.
