# OS Learning Document — Threads

> A comprehensive, student-friendly guide to Threads — the foundation every OS course stands on.
> Master threads vs processes, multithreading models, with exam-style problems and fully worked solutions.

---

# 3. Threads

> **Lesson Overview:** The lightweight cousins of processes — one process with many work crews. Compare threads vs processes, see what threads share and what each keeps private, and map the three threading models (many-to-one, one-to-one, many-to-many) onto real systems like Linux and Java.
> - **Category:** OS Fundamentals & Process Management
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 3.1 Threads vs Processes

### One Kitchen, Many Chefs

A process is a whole kitchen: its own pots, its own recipe book, its own counters. A **thread** is a single chef inside that kitchen. Ten threads in one process = ten chefs sharing the same pots, book, and counters. New chefs are cheap to hire; building a new kitchen is not.

### The Sharing-Table

| Resource | Threads of the same process | Processes |
|---|---|---|
| Code (instruction text) | SHARED | separate |
| Global data / heap | SHARED | separate |
| Open files | SHARED | separate |
| Process ID | SHARED (same PID) | each its own |
| Program counter | own (each thread runs its own code path) | own |
| Register set | own | own |
| Stack | own (each thread has private call stack) | own |

So: **threads share everything except the CPU theatre** — PC, registers, and stack stay private per thread.

### Why Threads Are Lightweight

| Operation | Process | Thread |
|---|---|---|
| Create | copy address space, new PCB | one new stack — the address space is already there |
| Switch (context switch) | flush TLB, switch memory mappings, switch kernel stacks | swap registers + program counter (often microtask-fast) |
| Communicate | IPC (sockets, pipes, shared memory) — kernel help needed | they already share memory; just write a global |

A process context switch can be **10–100× slower** than a thread switch on the same machine.

### Where Threads Win

| Use case | Why a thread |
|---|---|
| Web server (one connection per thread) | many concurrent clients, few wasted switches |
| GUI apps | UI thread + render thread + network thread stay responsive |
| Multi-core number crunching | split the work across cores, share the result buffer |

### Where One Thread Hurts

❌ Crash in one thread can corrupt shared data of ALL its sibling threads.❌ No isolation — a wild heap pointer in one thread wrecks the whole process.❌ Concurrency bugs (races) appear only at nanosecond-timing — the worst debugging.❌ A multi-core UI without synchronization = your render loop fights the input thread.

### Common Traps

❌ "Threads share the stack" — FALSE, each thread owns a private stack and program counter.❌ "Thread switch costs the same as process switch" — FALSE, no memory mapping change = much cheaper.❌ "Threads can live without a process" — FALSE, threads always belong to a process as its workers.❌ "Threads get separate file tables" — FALSE, open files are shared (that is why locks exist).

### Quick Self-Test (answers at the bottom)

1. Which is shared between threads of one process?
(a) stack (b) registers (c) global variables
2. Creating a thread is cheaper because:
(a) no new address space copy (b) threads need no RAM (c) the kernel is skipped
3. A context switch between two threads of the SAME process:
(a) swaps memory mappings (b) saves/loads registers + PC only (c) flushes the whole TLB
4. Two threads racing on the same counter is:
(a) always fine (b) a race condition (c) impossible

**Answers:** 1→c, 2→a, 3→b, 4→b.

## 3.2 Multithreading Models

### Who Runs the Thread — The Library or the Kernel?

Two "species" of thread exist:

| Species | Managed by | Visible to the kernel? |
|---|---|---|
| **User threads** | a user-space library (thread_create, thread_yield — no system calls needed) | NO — the kernel sees ONE process doing everything |
| **Kernel threads** | the OS itself (real scheduler entries, block independently) | YES — each is scheduled like a tiny process |

The number of each determines the **threading model** — how user threads map onto kernel threads.

### The Three Models

**1. Many-to-One (user threads on ONE kernel thread)**

```
  user threads:    T1   T2   T3          ← cheerfully parallel on paper
                       |   /
                       |  /
             kernel:    K1               ← one scheduler entry
```

| Pros | Cons |
|---|---|
| ultra-cheap creation, no system calls | one blocking call (read()) freezes ALL threads |
| fine for non-blocking libraries | cannot use multiple cores — parallelism is fake |

**2. One-to-One (each user thread has its own kernel thread)**

```
  user threads:    T1   T2   T3
                    |    |    |
  kernel threads:  K1   K2   K3        ← real parallel scheduling
```

| Pros | Cons |
|---|---|
| a blocked T1 never halts T2 | every thread costs a kernel ticket |
| true multi-core parallelism | many threads = heavy kernel overhead |

Used by **Linux, Windows, Java/JVM** — the default in the modern world.

**3. Many-to-Many (a pool of kernel threads, user threads float around)**

```
  user threads:    T1  T2  T3  T4       ← can jump between kernel slots
                      |  |  /
                      |  /
  kernel threads:     K1   K2
```

| Pros | Cons |
|---|---|
| lots of threads, limited kernel cost | complex to implement, rare in practice |
| blocking one thread does not freeze the group | scheduler tuning gets hard |

### The One-Sentence Interview Answer

> "Linux and Java use **one-to-one**: every user thread maps to a kernel thread, so any thread can block safely and the OS can run threads on different cores at the same time."

### Common Traps

❌ Many-to-one = "fine until ANY thread blocks — then the whole process stops", not "best".❌ N:1 cannot use multiple cores, despite having many threads — a favourite trick question.\
❌ "User threads are invisible to the kernel" — correct, and that is exactly why one block freezes all.❌ Threads do not become parallel just by existing — the UNDERLYING kernel slots decide.

### Quick Self-Test (answers at the bottom)

1. Linux uses which model?
(a) many-to-one (b) one-to-one (c) many-to-many only
2. In many-to-one, one thread calling read() blocks:
(a) only that thread (b) the whole process (c) the kernel
3. One-to-one's biggest cost:
(a) no parallelism (b) kernel overhead per thread (c) shared stacks
4. Many-to-many maps user threads onto:
(a) one kernel thread (b) a pool of kernel threads (c) the GPU

**Answers:** 1→b, 2→b, 3→b, 4→b.

---

# 4. Problems

## 4.1 Compare Multithreading Models

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Threads vs Processes |
| **Companies** | Google, Microsoft |

### Problem Statement

For each statement, decide whether it is TRUE for threads (of one process), TRUE for processes, or TRUE for BOTH: (a) each unit has its own stack and program counter; (b) all units share the same address space; (c) a context switch between two units requires switching memory mappings; (d) a crash in one unit can take down its siblings.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Statement (a): own stack and program counter. | TRUE for BOTH. | Each thread needs its own call stack and PC; each process has its own too. This is the execution identity every unit must own. |
| Statement (b): same address space. | TRUE for THREADS ONLY. | Threads of one process share code, data, heap, and open files; processes have isolated address spaces. |
| Statements (c) and (d): memory mapping switch; crash kills siblings. | (c) TRUE for PROCESSES ONLY. (d) TRUE for THREADS ONLY. | Process switching requires new page tables (memory mappings) — thread switches do not. A wild pointer in one thread corrupts shared data (sibling damage); processes are crash-isolated. |

### Constraints

- Answer with the finest category that applies: THREADS / PROCESSES / BOTH.
- Assume threads belong to ONE common parent process.
- Consider only the default POSIX-style model (no exotic isolation).

### Approach

**The Sharing Table Decides Everything**

```
                    THREADS      PROCESSES
code/global data      SHARE        separate
address space         SHARE        separate
open files            SHARE        separate
stack + PC            own          own
memory mappings       same         switch on swap
crash isolation       NONE         isolated
```

| Statement | Anchor column | Verdict |
|---|---|---|
| own stack/PC | execution identity | BOTH |
| shared address space | address space column | THREADS |
| mapping switch | context switch row | PROCESSES |
| crash takes siblings | crash isolation row | THREADS |

**The 3-Second Interview Method**

Ask: **does this concern the PROCESS shell or the thread of execution?**

- Shell things (address space, files, mappings, isolation) → processes differ, threads share.
- Execution things (stack, PC, registers) → each unit owns its own, always.

**Common Traps**

❌ "Crash isolation" is a PROCESS property — threads are friends who die together.❌ Context-switch cost is a PROCESS complaint — thread switches skip the mapping switch.❌ Open files are SHARED among threads — that is why they race on stdout.

## 4.2 Identify the Threading Model for a Scenario

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Multithreading Models |
| **Companies** | Amazon, Microsoft |

### Problem Statement

Choose the threading model (many-to-one, one-to-one, many-to-many) for each scenario. (a) A Java app on Linux where every user thread is a kernel thread and a blocked thread never freezes others. (b) An embedded library with 2000 user threads on ONE kernel thread — creation is nearly free but any blocking call freezes everything. (c) A legacy Solaris app where 100 user threads float over 4 kernel threads.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Scenario (a): Java on Linux, per-thread kernel support. | One-to-one. | Each user thread has its own kernel thread — the model that lets any thread block without freezing the process and uses all cores. |
| Scenario (b): 2000 user threads over one kernel thread. | Many-to-one. | One kernel scheduling entity carries every user thread; blocking in any one of them blocks them all. |
| Scenario (c): 100 user threads over 4 kernel threads. | Many-to-many. | A pool of kernel threads with user threads multiplexed over them — many-to-many's defining shape. |

### Constraints

- Name the model and CONFIRM with the signpost: 1 kernel entity = many-to-one; n:n = one-to-one; pool = many-to-many.
- Blocking behaviour is the fastest discriminator.

### Approach

**Count the Kernel Entities**

| Clue in the story | Model |
|---|---|
| many user threads → ONE kernel thread | many-to-one |
| each user thread → its OWN kernel thread | one-to-one |
| many user threads → a POOL of kernel threads | many-to-many |

**The Decision Flow**

```
IF every user thread maps 1:1 to a kernel thread  → ONE-TO-ONE
ELSE IF all user threads share a single kernel thread → MANY-TO-ONE
ELSE → MANY-TO-MANY (pool)
```

**The Behaviour Table**

| Model | One thread blocks? | Parallel on multi-core? |
|---|---|---|
| many-to-one | whole process freezes | NO |
| one-to-one | nobody else notices | YES |
| many-to-many | its slot blocks; group survives | only within the pool size |

**Interview One-Liner**

> "Count kernel threads: exactly one → many-to-one; equal count → one-to-one; a smaller pool → many-to-many."

**Common Traps**

❌ Many-to-one on a multi-core machine still runs ONE thread at a time — the kernel sees one entity.❌ "2000 user threads" says nothing by itself — the model is decided by the KERNEL mapping.❌ Java is one-to-one ONLY when the JVM maps to native threads (the normal Linux case).
