# OS Learning Document — Process Concepts

> A comprehensive, student-friendly guide to Process Concepts — the foundation every OS course stands on.
> Master process states & pcb, process creation & termination, with exam-style problems and fully worked solutions.

---

# 2. Process Concepts

> **Lesson Overview:** What a process really is under the hood — the five-state life cycle a program lives through (new, ready, running, waiting, terminated), the Process Control Block that is the OS's ID card for every process, and how processes are born from fork() and die into zombies or orphans.
> - **Category:** OS Fundamentals & Process Management
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 2.1 Process States & PCB

### The Assembly-Line View of a Process

A **process** is a program in action — with a past, a present, and a future. The OS never lets a program just "run"; it shuffles it through a **life cycle** of states, exactly like a box moving along an assembly line: waiting in the queue, on the machine, waiting for parts, done.

### The Five-State Diagram

```
        start                 terminate
          │                       ▲
          ▼                       │
   ┌────────────┐   dispatch   ┌────────────┐
   │    NEW     │ ───────────► │  RUNNING   │
   └────────────┘              └────────────┘
          ▲                        │  ▲
          │                        │  │
          │        (CPU gives up   │  │
          │         voluntarily    │  │ timeout (preempted)
          │         — I/O wait)    │  │
          │                        v  │
   ┌────────────┐              ┌────────────┐
   │ TERMINATED │              │  WAITING   │
   └────────────┘              └────────────┘
                                      │
                      I/O complete ───┘
                                    │
                                    ▼
                              ┌────────────┐
                              │   READY    │
                              └────────────┘
                                    │
                                    └──► (back to RUNNING via dispatch)
```

### The Transitions That Matter

| From → To | Trigger | Example |
|---|---|---|
| NEW → READY | the OS admits the process into the ready queue | admission control |
| READY → RUNNING | **dispatch** — the scheduler picks this process | a quantum is free |
| RUNNING → READY | **timeout / preemption** — the tick expired | timer interrupt |
| RUNNING → WAITING | the process asks for something slow (I/O) | read() a disk file |
| WAITING → READY | the slow thing finished | disk interrupt, I/O complete |
| RUNNING → TERMINATED | the process finished or crashed | exit() or a fatal error |

Trap to memorise: **READY means "wants CPU but does not have it"; WAITING means "has no use for the CPU right now"** — it is blocked on something outside the CPU.

### The Process Control Block (PCB)

Everything the OS knows about one process lives in one record — the PCB:

| PCB field | It answers |
|---|---|
| Process ID (PID) | who are you? |
| Program counter | where did this process stop? |
| Register state | what were you holding? (saved on every switch) |
| Memory pointers | where does your code/data live? |
| I/O status & open files | what are you touching? |
| Scheduling info | what priority do you get, how long did you run? |

**Context switch = swapping one PCB out of the CPU for another.** That is why switching between processes is expensive: the CPU must save every register and load a whole new set.

### Common Traps

❌ Running and ready are NOT the same — running has the CPU; ready wants it.❌ A process doing disk I/O is WAITING (blocked), not ready — it cannot use the CPU at all.❌ NEW → RUNNING is never direct; admission always passes through READY.❌ The PCB is kernel memory — user programs never touch it directly.

### Quick Self-Test (answers at the bottom)

1. Which state means "wants the CPU but does not have it"?
(a) RUNNING (b) READY (c) WAITING
2. A process blocked on disk I/O moves from RUNNING to:
(a) READY (b) NEW (c) WAITING
3. The timer interrupt moves a process RUNNING → ?
(a) WAITING (b) READY (c) TERMINATED
4. What is saved on a context switch?
(a) the whole RAM (b) the PCB registers + program counter (c) the file system

**Answers:** 1→b, 2→c, 3→b, 4→b.

## 2.2 Process Creation & Termination

### The Fork Story — How Processes Are Born

In most systems a process creates another process by calling **fork()**, which WINs by duplicating: the child is a photocopy of the parent — same code, same data, same open files — except for the return value of fork() itself.

### The Fork Magic Trick — Return Values

```
pid = fork();
if (pid < 0)   // fork failed — no child created
if (pid == 0)  // WE ARE IN THE CHILD — fork() returned 0 to the child
else           // we are the PARENT — pid holds the child's PID (a positive number)
```

| Code | Who gets what |
|---|---|
| the parent after fork() | child's PID (a positive number) |
| the child after fork() | exactly 0 |
| failure | −1, no child born |

### Process Trees

One fork → two processes. Two forks in sequence → FOUR processes. The formula: **n fork() calls in a row produce 2ⁿ processes** — and the number of NEW forks among them doubles each generation.

```
             P (parent)
             │  fork #1
        ┌────┴────┐
        P1        C1
        │ fork#2  │ fork#2
     ┌──┴──┐   ┌──┴──┐
     P2    C2   C3   C4     ← 3 forks on a path = 2³ = 8 total
```

### The exec() Swap

fork() gives you a twin of your own program. To run a DIFFERENT program, the child calls **exec()** — the address space is entirely replaced with the new program's code, while the PID stays the same.

> Classic shell trick: fork() a child, the child immediately exec()'s the command. The old program is discarded; the new command takes over the child's body.

### Termination — Dead or Undead

| Call | Meaning |
|---|---|
| exit(status) | process ends, returns a status to its parent |
| wait(&status) | parent blocks until a child dies, then collects the status |

Two famous undead states:

| State | How it happens | Danger |
|---|---|---|
| **Zombie** | Child exited, parent forgot to wait() — the PCB cannot be freed until the parent collects it | it is a husk: unreachable but still occupying a PCB entry |
| **Orphan** | Parent died first — the init process (PID 1) adopts the child and eventually reaps it | a child with no apparent parent; adoption prevents permanent zombies |

### Common Traps

❌ fork() returns TWO different values at once — "one call, two returns" is the whole point.❌ The child starts running AT the fork, not at the top of the program — code above fork() runs in the parent only.❌ 3 forks in sequence = 8 processes TOTAL, not 6 — count the tree, do not double-count.❌ A zombie is already DEAD — it is not a blocked process; it just has an uncollected exit status.

### Quick Self-Test (answers at the bottom)

1. fork() returns 0 in:
(a) the parent (b) the child (c) both
2. 3 fork() calls in sequence create how many total processes?
(a) 4 (b) 6 (c) 8
3. A child that dies while the parent never wait()s becomes:
(a) an orphan (b) a zombie (c) a thread
4. exec() replaces:
(a) the PID (b) the address space (c) the parent

**Answers:** 1→b, 2→c, 3→b, 4→b.

---

# 3. Problems

## 3.1 Trace the Process State Diagram

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Process States & PCB |
| **Companies** | Google, Microsoft |

### Problem Statement

For each event below, give the state transition it causes (FROM state → TO state). Events: (a) the scheduler picks a ready process; (b) the running process asks for a disk read; (c) the disk read completes; (d) the timer interrupt fires while the process is running; (e) the process calls exit(). Use the states NEW, READY, RUNNING, WAITING, TERMINATED.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Event (a): scheduler picks a READY process. | READY → RUNNING (dispatch) | Dispatch is the only way into RUNNING — the scheduler selects the next process and loads its PCB. |
| Events (b) then (c): disk read requested, then completes. | RUNNING → WAITING, then WAITING → READY | Blocking on I/O moves the process OUT of the CPU race (WAITING); when the device finishes, it re-joins the ready queue — it still has to wait for the CPU. |
| Events (d) then (e): timer interrupt fires; later the process exits. | RUNNING → READY (preemption); RUNNING → TERMINATED | The timer is preemption — the process did not finish, it just lost its turn. exit() ends the life cycle forever. |

### Constraints

- Every transition must name both states — FROM and TO.
- A process cannot go to TERMINATED from WAITING in these events.
- Label the transition with its trigger (dispatch, I/O, timeout, exit).

### Approach

**Draw the Diagram Once, Answer Everything**

The five states and their legal transitions:

```
NEW ──admit──► READY ──dispatch──► RUNNING
                    ▲                  │
              I/O done │               │ I/O wait
                    │   ┌──────────────┘
                    │   │ (timeout)
                    │   ▼
                    └── READY ◄── WAITING
RUNNING ──exit──► TERMINATED
```

**The Decision Table**

| Event | FROM | TO | Trigger name |
|---|---|---|---|
| scheduler picks a process | READY | RUNNING | dispatch |
| running process asks for I/O | RUNNING | WAITING | I/O request |
| I/O completes | WAITING | READY | I/O completion |
| timer interrupt | RUNNING | READY | timeout / preemption |
| process ends | RUNNING | TERMINATED | exit |

**The Three-Step Method**

1. **Identify the actor.** Is the CPU, the device, or the process causing it?
2. **Find the current state** on the diagram.
3. **Walk the legal arrow** — if no arrow exists, the event is impossible in the model.

**Interview Tip**

The classic trap is I/O completion going straight to RUNNING. The device cannot give the CPU — the process must queue for it: WAITING → READY, never directly to RUNNING.

## 3.2 Determine Parent-Child Process Output (fork)

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Process Creation & Termination |
| **Companies** | Amazon, Oracle |

### Problem Statement

A program calls fork() three times in sequence (three separate fork statements, one after another, in the same process paths). Answer: (a) how many total processes exist after all forks complete? (b) how many of them are CHILDREN (not the original)? (c) if each process prints its PID instantly on creation, how many PID lines appear in total?

### Examples

| Input | Output | Explanation |
|---|---|---|
| One fork() call in a parent-only program. | 2 total processes; 1 child; 2 PID lines (parent + child). | fork duplicates the caller — the parent and its photocopy both continue executing after the call. |
| Two fork() calls in sequence (both parent and child reach the second call). | 4 total processes; 3 children; each prints once → 4 lines. | After fork1: 2 processes. Both execute fork2 → 2 more → 4 total. Formula: 2^n = 4. |
| Three fork() calls in sequence. | 8 total processes; 7 children; 8 lines total. | 2^3 = 8 processes. The original parent is the only non-child: 8 − 1 = 7 children. Counting lines = counting processes = 8. |

### Constraints

- All forks execute on EVERY alive process path (the standard trick problem).
- EXEC is not involved — no process replaces its image.
- Count the ORIGINAL process as one of the total.

### Approach

**One Formula — 2ⁿ**

Every fork DOUBLES the number of alive processes:

```
n sequential forks      →  total processes = 2ⁿ
children               =  2ⁿ − 1
PID lines (each prints) =  2ⁿ
```

**The Tree — n = 3**

```
               ORIG (P)
              fork #1
        ┌───────┴───────┐
        P               C1
      fork #2         fork #2
    ┌───┴───┐       ┌───┴───┐
    P      C2       C3      C4
  fork#3  fork#3   fork#3  fork#3
 ┌─┴─┐   ┌─┴─┐   ┌─┴─┐   ┌─┴─┐
 P   C5  C6  C7  C8  C9  C10 C11

Total: 1 + 7 = 8 processes. The original runs 3 times (each fork adds a child).
```

**Counting Rules of Thumb**

| Question | Fast way |
|---|---|
| total processes | 2ⁿ |
| children | 2ⁿ − 1 |
| number of NEW processes after the k-th fork | 2ᵏ−¹ (the k-th fork's own children) |
| lines printed if all print | 2ⁿ |

**Common Traps**

❌ "Total" vs "children" — the original counts once in total but not as a child.❌ fork() IN A LOOP is different — count generation by generation, not n loops = 2ⁿ blindly.❌ If the child calls exec() after a fork, the CHILD COUNT still stands — the process exists, just with a new image.
