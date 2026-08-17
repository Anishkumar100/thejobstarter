/*
 * seedOsContent.js
 * Seeds OS lessons, subtopics, problems, quizzes, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems → Quiz (one per problem)
 * Source of content: server/os-content/os-content-map.md
 * Lesson seeded so far: 12 of 20
 *
 * NOTE: This script ONLY touches the OS collections plus Quiz
 * documents for OsProblem — it never clears other subjects' content
 * and it never clears Progress/QuizAttempt (student data must survive).
 *
 * IMPORTANT: OsProblem has NO codeBlocks field — OS problems are
 * conceptual only. Do NOT add a codeBlocks array to a problem.
 *
 * Usage:
 *   node server/seeds/seedOsContent.js
 *   (requires MONGODB_URI in env, defaults to localhost)
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO ADD NEW CONTENT
 *
 * Fill the arrays below. Every entry MUST match its Mongoose model:
 *
 * LESSON (OsLesson)
 *   { title, slug, category, description, icon, order, difficulty, problemCount }
 *   - category: filter value shown on /os — must be one of the
 *     categories in osMetaData below.
 *   - problemCount is IGNORED at insert time — the runner recounts it.
 *
 * SUBTOPIC (OsSubtopic)
 *   { title, slug, description, explanation, lessonSlug, order }
 *   - explanation: RICH Markdown rendered on the subtopic detail page.
 *   - lessonSlug MUST equal the slug of an existing lesson above.
 *
 * PROBLEM (OsProblem)
 *   { title, slug, lessonSlug, subtopicSlug, difficulty, topics,
 *     companies, problemStatement, examples, constraints, approach,
 *     timeComplexity, spaceComplexity }
 *   - NO codeBlocks field on OsProblem.
 *   - subtopicSlug MUST equal the slug of an existing subtopic above.
 *
 * QUIZ (Quiz — attached to problems, one quiz per problem)
 *   { problemSlug, questions: [{ text, options, correctIndex }] }
 *   - problemSlug must equal the slug of a problem above; the runner
 *     converts it to the problem's ObjectId + problemModel 'OsProblem'.
 *   - options: 2 to 6 strings; correctIndex: index of the correct option
 *     (0-based). NEVER reveal correctIndex to students.
 *
 * META (OsMeta)
 *   { type, value, label, order }  — type: 'category' | 'topic' | 'company'
 *   - (type + value) pair must be unique.
 * ─────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import OsLesson from '../models/OsLesson.js';
import OsSubtopic from '../models/OsSubtopic.js';
import OsProblem from '../models/OsProblem.js';
import OsMeta from '../models/OsMeta.js';
import Quiz from '../models/Quiz.js';

/* ================================================================
 * OS Lessons
 * ================================================================ */

const osLessons = [
  {
    "title": "Introduction to Operating Systems",
    "slug": "introduction-to-operating-systems",
    "category": "os-fundamentals-process-management",
    "description": "Start here — what an operating system actually does all day. Learn the traffic-cop job description, the five core jobs every OS does (running programs, guarding memory, filing files, driving devices, security), the types of OS from batch to real-time, and the system calls that are the doorway between your app and the kernel.",
    "image": "",
    "icon": "Monitor",
    "order": 0,
    "difficulty": "easy",
    "problemCount": 1
  },
  {
    "title": "Process Concepts",
    "slug": "process-concepts",
    "category": "os-fundamentals-process-management",
    "description": "What a process really is under the hood — the five-state life cycle a program lives through (new, ready, running, waiting, terminated), the Process Control Block that is the OS's ID card for every process, and how processes are born from fork() and die into zombies or orphans.",
    "image": "",
    "icon": "Binary",
    "order": 1,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Threads",
    "slug": "threads",
    "category": "os-fundamentals-process-management",
    "description": "The lightweight cousins of processes — one process with many work crews. Compare threads vs processes, see what threads share and what each keeps private, and map the three threading models (many-to-one, one-to-one, many-to-many) onto real systems like Linux and Java.",
    "image": "",
    "icon": "GitFork",
    "order": 2,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Inter-Process Communication",
    "slug": "inter-process-communication",
    "category": "os-fundamentals-process-management",
    "description": "How separate processes trade data when they have no shared memory — the shared-memory mailbox (fast but hand-coordinated) vs the message-passing postman (safe but slower), plus the humble pipe, the named FIFO, and the signals that tap processes on the shoulder.",
    "image": "",
    "icon": "MessageCircle",
    "order": 3,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "CPU Scheduling Basics",
    "slug": "cpu-scheduling-basics",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "The events never queue fairly — someone must pick who gets the CPU. Learn the four measurements an interviewer cares about (turnaround, waiting, response, throughput), then master the two simplest pickers: First-Come First-Served and Shortest Job First, complete with Gantt charts and convoy effects.",
    "image": "",
    "icon": "Timer",
    "order": 4,
    "difficulty": "easy",
    "problemCount": 2
  },
  {
    "title": "Priority & Round Robin Scheduling",
    "slug": "priority-round-robin-scheduling",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "Two scheduling heavyweights: priority scheduling that always serves the most important task first (watch out for starvation — aging to the rescue), and Round Robin, the fair time-slicer that gives everyone a quantum and keeps the CPU democratic.",
    "image": "",
    "icon": "Clock",
    "order": 5,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Multilevel & Multiprocessor Scheduling",
    "slug": "multilevel-multiprocessor-scheduling",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "Real systems run a league of queues, not one — foreground jobs get quick quanta, background compute gets long turns, and misbehaving processes get demoted. Plus how scheduling changes when the machine has many CPUs: affinity, load balancing, and gang scheduling.",
    "image": "",
    "icon": "Layers",
    "order": 6,
    "difficulty": "medium",
    "problemCount": 1
  },
  {
    "title": "Process Synchronization",
    "slug": "process-synchronization",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "Two processes updating the same balance at the same time = lost money. Learn what makes a critical section safe (mutual exclusion, progress, bounded waiting), then arm yourself with the two classic weapons: mutex locks and semaphores — the counting-semaphore recipe for producer-consumer is the single most-asked OS interview question.",
    "image": "",
    "icon": "Lock",
    "order": 7,
    "difficulty": "hard",
    "problemCount": 2
  },
  {
    "title": "Classical Synchronization Problems",
    "slug": "classical-synchronization-problems",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "The three classic exam monsters. The Readers-Writers problem (many readers may read together, writers need total silence), the Dining Philosophers (five thinkers, five forks, guaranteed chopstick deadlock if you code it naively), and the bounded-buffer producer-consumer — each with a proven semaphore solution.",
    "image": "",
    "icon": "Utensils",
    "order": 8,
    "difficulty": "hard",
    "problemCount": 2
  },
  {
    "title": "Deadlock Prevention & Avoidance",
    "slug": "deadlock-prevention-avoidance",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "The four conditions that must ALL hold for a deadlock — and the four ways to break one of them. Then the crown jewel of avoidance: the Banker's Algorithm, which never grants a request that could leave the system unable to finish every process (complete with the safety-sequence table trace).",
    "image": "",
    "icon": "Shield",
    "order": 9,
    "difficulty": "hard",
    "problemCount": 2
  },
  {
    "title": "Deadlock Detection & Recovery",
    "slug": "deadlock-detection-recovery",
    "category": "cpu-scheduling-synchronization-deadlocks",
    "description": "Deadlocks happen — detective work begins. Learn to read a Resource Allocation Graph and spot the deadly cycle, run the wait-for detection algorithm on real allocation tables, and then decide who gets sacrificed: kill a process, steal a resource, or roll back to a checkpoint.",
    "image": "",
    "icon": "Crosshair",
    "order": 10,
    "difficulty": "medium",
    "problemCount": 1
  },
  {
    "title": "Memory Management Basics",
    "slug": "memory-management-basics",
    "category": "memory-management",
    "description": "RAM is scarce, programs are greedy. Start managing memory with contiguous allocation — partitions, dynamic holes, and the three-fit family (best, worst, first) with a full hole-tracking trace — and meet the two fragmentation monsters (internal and external) that force the invention of paging.",
    "image": "",
    "icon": "MemoryStick",
    "order": 11,
    "difficulty": "medium",
    "problemCount": 1
  }
];

/* ================================================================
 * OS Subtopics
 * ================================================================ */

const osSubtopics = [
  {
    "title": "OS Functions & Types",
    "slug": "os-functions-types",
    "lessonSlug": "introduction-to-operating-systems",
    "order": 0,
    "description": "What an OS does behind the scenes — the five core jobs (process, memory, file, device, security) — plus the types of OS from batch to real-time to mobile.",
    "explanation": "## The Story — Who Really Is the OS?\n\nAn operating system (OS) is the **traffic cop** between you and the hardware. You type letters, the OS makes the keyboard work. You open a music app, the OS loads the code into RAM, schedules the CPU, and makes the speakers play. Without it, every app would have to teach itself how to talk to every chip — the world would run on paper.\n\n### The Layer Cake View\n\n```\n     ┌──────────────────────────┐\n     │    User programs (apps)   │\n     ├──────────────────────────┤\n     │  SYSTEM SOFTWARE (the OS) │   ◄── we are here\n     ├──────────────────────────┤\n     │          HARDWARE          │\n     └──────────────────────────┘\n```\n\n### The Five Core Functions\n\n**1. Process Management — the conductor of CPUs**\nA **process** is a program in action. The OS watches every running program, gives each one a turn on the CPU, and cleanly kills dead ones so the whole machine does not crash.\n\n**2. Memory Management — the landlord of RAM**\nPrograms need memory; RAM is finite. The OS decides how much RAM each program gets, keeps programs from stepping on each other, and swaps data to disk when space runs out.\n\n**3. File Management — the librarian of disk**\nFiles are saved, named, organised in folders, and found again — the OS owns the directory tree and handles permissions (read, write, execute).\n\n**4. Device Management — the garage for hardware**\nEvery device (printer, mouse, camera) has a driver. The OS greets the driver, passes data in and out, and manages who gets the device when several apps want it at once.\n\n**5. Security & Protection — the security guard**\nUsers and processes are separated so one app cannot read another app's memory. The OS verifies logins, passwords and permissions, and catches malware before it breaks in.\n\n### Types of Operating Systems\n\n| Type | What it does | Typical use |\n|---|---|---|\n| **Batch** | Runs jobs one after another with no human in the middle | Payroll, billing (mostly gone today) |\n| **Time-sharing** | Many users share the CPU in turns — each feels they own the machine | Unix workstations, Linux desktops |\n| **Real-time** | Must respond within a strict deadline | airbag deployment, autopilots, pacemakers |\n| **Distributed** | Many machines act as one big system | cloud clusters, Hadoop |\n| **Mobile / Embedded** | Low power, touch-driven, sensor-heavy | Android, iOS, smartwatches |\n\n### Hard vs Soft Real-Time\n\n- **Hard real-time:** the deadline is sacred — missing it is a failure (an airbag timer).\n- **Soft real-time:** the deadline matters but a miss is annoying, not fatal (video streaming).\n\n### Key Takeaway\n\nAn OS is a traffic director: it runs processes, doles out RAM, files away bytes, drives devices, and guards security. The **type** of OS is a trade-off between how many users, how fast a response, and how constrained the hardware.",
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "System Calls & OS Structure",
    "slug": "system-calls-os-structure",
    "lessonSlug": "introduction-to-operating-systems",
    "order": 1,
    "description": "The door between your app and the kernel — what a system call is, the five families of system calls, and how the kernel is built (monolithic vs layered vs microkernel).",
    "explanation": "## The Door Between the App and the Kernel\n\nYour app runs in a protected room, the kernel — the heart of the OS — runs in a separate room where it can touch hardware directly. An app CANNOT touch the keyboard or the hard drive. The only doorway is the **system call** — a carefully chosen service request the app makes.\n\n### The System Call Flow\n\n```\nUser program   →  system call  →  kernel does the work  →  return\n\"read the file\"     read()         fetch bytes            \"here is the data\"\n```\n\nThink of it as a restaurant: the app is the customer, the **system call** is the waiter, and the kernel is the chef who never talks to the customer directly. The menu item is the call name (open, read, write); the waiter carries the request and brings back the plate.\n\n### The Five Families of System Calls\n\n| Family | The purpose | Example calls |\n|---|---|---|\n| **Process control** | start, run, and end a process | fork(), exec(), wait(), exit() |\n| **File management** | open, read, write, close files | open(), read(), write(), close() |\n| **Device management** | talk to hardware devices | open(), close(), read(), ioctl() |\n| **Information maintenance** | get/set system info | getpid(), time(), get_clock() |\n| **Communication** | exchange messages between processes | pipe(), send(), recv() |\n\n### Monolithic vs Microkernel — How to Build the OS\n\n| Structure | What it is | Example |\n|---|---|---|\n| **Monolithic** | Everything (schedulers, files, drivers) in one big kernel | Linux, classic UNIX |\n| **Layered** | Each layer does one job — a staircase of layers, each with its own role | Older designs, teaching |\n| **Microkernel** | Kernel is a tiny core; most services run separately in user space | QNX, many embedded systems |\n\n### Microkernel Pros and Cons\n\n- ✅ **Fault isolation:** a crash in a service does not take down the whole kernel.\n- ❌ **Slower:** passing messages between user space and the kernel costs extra time.\n\n## Key Takeaway\n\nA system call is the **legal doorway** from user space to kernel space. The five families are: process, file, device, information, and communication. The kernel's architecture chooses how much lives in the core — everything (monolithic) or just a little (microkernel).",
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Threads vs Processes",
    "slug": "threads-vs-processes",
    "lessonSlug": "threads",
    "order": 0,
    "description": "Why threads are called lightweight — what they share, what they own, and the price of context switching on each.",
    "explanation": `## One Kitchen, Many Chefs

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

❌ Crash in one thread can corrupt shared data of ALL its sibling threads.\
❌ No isolation — a wild heap pointer in one thread wrecks the whole process.\
❌ Concurrency bugs (races) appear only at nanosecond-timing — the worst debugging.\
❌ A multi-core UI without synchronization = your render loop fights the input thread.

### Common Traps

❌ "Threads share the stack" — FALSE, each thread owns a private stack and program counter.\
❌ "Thread switch costs the same as process switch" — FALSE, no memory mapping change = much cheaper.\
❌ "Threads can live without a process" — FALSE, threads always belong to a process as its workers.\
❌ "Threads get separate file tables" — FALSE, open files are shared (that is why locks exist).

### Quick Self-Test (answers at the bottom)

1. Which is shared between threads of one process?
(a) stack (b) registers (c) global variables
2. Creating a thread is cheaper because:
(a) no new address space copy (b) threads need no RAM (c) the kernel is skipped
3. A context switch between two threads of the SAME process:
(a) swaps memory mappings (b) saves/loads registers + PC only (c) flushes the whole TLB
4. Two threads racing on the same counter is:
(a) always fine (b) a race condition (c) impossible

**Answers:** 1→c, 2→a, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Multithreading Models",
    "slug": "multithreading-models",
    "lessonSlug": "threads",
    "order": 1,
    "description": "User threads vs kernel threads, and the three mapping models: many-to-one, one-to-one, many-to-many.",
    "explanation": `## Who Runs the Thread — The Library or the Kernel?

Two "species" of thread exist:

| Species | Managed by | Visible to the kernel? |
|---|---|---|
| **User threads** | a user-space library (thread_create, thread_yield — no system calls needed) | NO — the kernel sees ONE process doing everything |
| **Kernel threads** | the OS itself (real scheduler entries, block independently) | YES — each is scheduled like a tiny process |

The number of each determines the **threading model** — how user threads map onto kernel threads.

### The Three Models

**1. Many-to-One (user threads on ONE kernel thread)**

\`\`\`
  user threads:    T1   T2   T3          ← cheerfully parallel on paper
                    \   |   /
                     \  |  /
             kernel:    K1               ← one scheduler entry
\`\`\`

| Pros | Cons |
|---|---|
| ultra-cheap creation, no system calls | one blocking call (read()) freezes ALL threads |
| fine for non-blocking libraries | cannot use multiple cores — parallelism is fake |

**2. One-to-One (each user thread has its own kernel thread)**

\`\`\`
  user threads:    T1   T2   T3
                    |    |    |
  kernel threads:  K1   K2   K3        ← real parallel scheduling
\`\`\`

| Pros | Cons |
|---|---|
| a blocked T1 never halts T2 | every thread costs a kernel ticket |
| true multi-core parallelism | many threads = heavy kernel overhead |

Used by **Linux, Windows, Java/JVM** — the default in the modern world.

**3. Many-to-Many (a pool of kernel threads, user threads float around)**

\`\`\`
  user threads:    T1  T2  T3  T4       ← can jump between kernel slots
                    \  |  |  /
                     \ |  /
  kernel threads:     K1   K2
\`\`\`

| Pros | Cons |
|---|---|
| lots of threads, limited kernel cost | complex to implement, rare in practice |
| blocking one thread does not freeze the group | scheduler tuning gets hard |

### The One-Sentence Interview Answer

> "Linux and Java use **one-to-one**: every user thread maps to a kernel thread, so any thread can block safely and the OS can run threads on different cores at the same time."

### Common Traps

❌ Many-to-one = "fine until ANY thread blocks — then the whole process stops", not "best".\
❌ N:1 cannot use multiple cores, despite having many threads — a favourite trick question.\\
❌ "User threads are invisible to the kernel" — correct, and that is exactly why one block freezes all.\
❌ Threads do not become parallel just by existing — the UNDERLYING kernel slots decide.

### Quick Self-Test (answers at the bottom)

1. Linux uses which model?
(a) many-to-one (b) one-to-one (c) many-to-many only
2. In many-to-one, one thread calling read() blocks:
(a) only that thread (b) the whole process (c) the kernel
3. One-to-one's biggest cost:
(a) no parallelism (b) kernel overhead per thread (c) shared stacks
4. Many-to-many maps user threads onto:
(a) one kernel thread (b) a pool of kernel threads (c) the GPU

**Answers:** 1→b, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Process States & PCB",
    "slug": "process-states-pcb",
    "lessonSlug": "process-concepts",
    "order": 0,
    "description": "The five-state life cycle of a process and the Process Control Block — the ID card the OS keeps for every running program.",
    "explanation": `## The Assembly-Line View of a Process

A **process** is a program in action — with a past, a present, and a future. The OS never lets a program just "run"; it shuffles it through a **life cycle** of states, exactly like a box moving along an assembly line: waiting in the queue, on the machine, waiting for parts, done.

### The Five-State Diagram

\`\`\`
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
\`\`\`

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

❌ Running and ready are NOT the same — running has the CPU; ready wants it.\
❌ A process doing disk I/O is WAITING (blocked), not ready — it cannot use the CPU at all.\
❌ NEW → RUNNING is never direct; admission always passes through READY.\
❌ The PCB is kernel memory — user programs never touch it directly.

### Quick Self-Test (answers at the bottom)

1. Which state means "wants the CPU but does not have it"?
(a) RUNNING (b) READY (c) WAITING
2. A process blocked on disk I/O moves from RUNNING to:
(a) READY (b) NEW (c) WAITING
3. The timer interrupt moves a process RUNNING → ?
(a) WAITING (b) READY (c) TERMINATED
4. What is saved on a context switch?
(a) the whole RAM (b) the PCB registers + program counter (c) the file system

**Answers:** 1→b, 2→c, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Process Creation & Termination",
    "slug": "process-creation-termination",
    "lessonSlug": "process-concepts",
    "order": 1,
    "description": "How processes are born (fork/exec), how they exit (exit/wait), and the two undead states: zombies and orphans.",
    "explanation": `## The Fork Story — How Processes Are Born

In most systems a process creates another process by calling **fork()**, which WINs by duplicating: the child is a photocopy of the parent — same code, same data, same open files — except for the return value of fork() itself.

### The Fork Magic Trick — Return Values

\`\`\`
pid = fork();
if (pid < 0)   // fork failed — no child created
if (pid == 0)  // WE ARE IN THE CHILD — fork() returned 0 to the child
else           // we are the PARENT — pid holds the child's PID (a positive number)
\`\`\`

| Code | Who gets what |
|---|---|
| the parent after fork() | child's PID (a positive number) |
| the child after fork() | exactly 0 |
| failure | −1, no child born |

### Process Trees

One fork → two processes. Two forks in sequence → FOUR processes. The formula: **n fork() calls in a row produce 2ⁿ processes** — and the number of NEW forks among them doubles each generation.

\`\`\`
             P (parent)
             │  fork #1
        ┌────┴────┐
        P1        C1
        │ fork#2  │ fork#2
     ┌──┴──┐   ┌──┴──┐
     P2    C2   C3   C4     ← 3 forks on a path = 2³ = 8 total
\`\`\`

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

❌ fork() returns TWO different values at once — "one call, two returns" is the whole point.\
❌ The child starts running AT the fork, not at the top of the program — code above fork() runs in the parent only.\
❌ 3 forks in sequence = 8 processes TOTAL, not 6 — count the tree, do not double-count.\
❌ A zombie is already DEAD — it is not a blocked process; it just has an uncollected exit status.

### Quick Self-Test (answers at the bottom)

1. fork() returns 0 in:
(a) the parent (b) the child (c) both
2. 3 fork() calls in sequence create how many total processes?
(a) 4 (b) 6 (c) 8
3. A child that dies while the parent never wait()s becomes:
(a) an orphan (b) a zombie (c) a thread
4. exec() replaces:
(a) the PID (b) the address space (c) the parent

**Answers:** 1→b, 2→c, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Shared Memory & Message Passing",
    "slug": "shared-memory-message-passing",
    "lessonSlug": "inter-process-communication",
    "order": 0,
    "description": "The two big IPC families — a shared bulletin board vs a postal service — and when each wins.",
    "explanation": `## Two Ways to Share a Secret

Processes have separate address spaces — they cannot see each other's variables. To trade data they need a bridge, and there are exactly two classic bridges:

1. **Shared memory** — both processes agree to use one region of memory as a bulletin board.
2. **Message passing** — data is wrapped and shipped by the kernel, like letters through a post office.

### The Bulletin Board (Shared Memory)

\`\`\`
Process A                        Process B
┌──────────────┐                ┌──────────────┐
│ writes to    │                │ reads from   │
│   buffer[i]  │──► SHARED ◄────│   buffer[j]  │
│              │     REGION     │              │
└──────────────┘                └──────────────┘
        ▲                                      ▲
        └──── both agree: "we call it BUFFER" ─┘
\`\`\`

The kernel helps build the region ONCE (shmget / mmap); after that the kernel is out of the way — reads and writes are plain memory accesses. No system calls per message = **blazing fast**.

| Pros | Cons |
|---|---|
| fastest IPC on the machine | both sides must SYNCHRONIZE (who writes when?) — races are on you |
| kernel out of the data path after setup | touches shared memory need locks |
| simple mental model | only works on one machine |

The classic discipline: a **bounded buffer** with producer/consumer — the producer must not overwrite a slot the consumer has not emptied yet. This is exactly the problem semaphores solve in the synchronization lessons.

### The Post Office (Message Passing)

\`\`\`
Process A                     kernel                     Process B
  send(msg) ──────────►  mailbox / queue  ──────────►  recv(msg)
\`\`\`

Data is copied by the kernel from sender to receiver. Two addressing styles:

| Style | How a message reaches its target |
|---|---|
| **Direct** | send(P, msg) / recv(P, msg) — name the partner explicitly |
| **Indirect** | send(A, msg) / recv(A, msg) — both use a shared mailbox A |

| Pros | Cons |
|---|---|
| no synchronization bugs — the kernel queues | every message costs system calls + copies |
| receiver gets a clean copy, no races | slower for big payloads |
| works across machines (sockets, RPC) | kernel buffers can fill up — then send() blocks |

### Choosing the Right Bridge

| You need to... | Use |
|---|---|
| stream huge data fast, same machine | shared memory |
| exchange small structured requests safely | message passing |
| survive a crash without corrupting the partner | message passing (kernel holds the copy) |
| send between DIFFERENT machines | message passing over a network (sockets) |

### Common Traps

❌ Shared memory is NOT synchronized by the kernel at all — the processes must hand-coordinate.\
❌ "Message passing is always slower" — true per message, but it buys correctness for free.\
❌ Direct vs indirect is about ADDRESSING, not speed.\
❌ The bounded buffer still deadlocks/stalls if producers outpace consumers — buffering is not infinite.

### Quick Self-Test (answers at the bottom)

1. After setup, shared memory reads/writes involve:
(a) system calls per access (b) plain memory operations (c) the network
2. Who carries the data in message passing?
(a) the processes directly (b) the kernel (c) the disk
3. send(P, msg) is ________ addressing.
(a) indirect (b) direct (c) shared
4. The biggest shared-memory danger:
(a) speed (b) forgetting to synchronize (c) kernel copies

**Answers:** 1→b, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Pipes & Signals",
    "slug": "pipes-signals",
    "lessonSlug": "inter-process-communication",
    "order": 1,
    "description": "The humble pipe, its named cousin the FIFO, and the signals the kernel sends to tap a process on the shoulder.",
    "explanation": `## Plumbers and Fencers

A **pipe** is a byte-stream between two processes: one side writes, the other reads, in strict first-in-first-out order. Think of a drain pipe — whatever goes in at the top comes out at the bottom, same order, no structure.

### The Anonymous Pipe — Built by fork

\`\`\`
             pipe(fds)          fds[0] = read end, fds[1] = write end
                │
        fork()  ▼  (child inherits BOTH ends)
   ┌────────────┴────────────┐
   │  parent: close(fds[0])  │  child: close(fds[1])
   │  write(fds[1], data)    │  read(fds[0], data)
   │        ────  Byte stream  ────►
   └─────────────────────────┘
\`\`\`

| Rule | Why |
|---|---|
| parent closes read end, child closes write end | one direction only, one writer, one reader |
| pipe() BEFORE fork() | the child inherits both descriptors |
| unnamed pipes only work between relatives | the descriptors must be inherited to be shared |

### The Shell Pipeline — ps | grep

\`\`\`
$ ps aux | grep chrome
   ┌──────────┐   pipe #1   ┌──────────┐
   │    ps     │ ──────────► │   grep   │
   └──────────┘             └──────────┘
       3 PROCESSES total:   ps (parent) → grep (child)
       shell forks ps; ps forks grep; every output byte of ps pours into grep's stdin
\`\`\`

Each | in a shell command = one pipe and one extra fork.

### Named Pipes (FIFO)

When the two processes are NOT parent-child (no inherited descriptors), use a **FIFO** — a pipe with a name, created with mkfifo. Anyone who opens the name joins the stream.

### Signals — The Tap on the Shoulder

A **signal** is a small asynchronous notification: "stop what you are doing, something happened."

| Signal | Number | Meaning |
|---|---|---|
| SIGINT | 2 | Ctrl+C — interrupt |
| SIGKILL | 9 | unblockable kill — the nuclear option |
| SIGTERM | 15 | polite terminate — app may clean up |
| SIGSEGV | 11 | segmentation fault — you touched illegal memory |
| SIGCHLD | 17 | a child process died |

| Delivered how | Default action |
|---|---|
| kernel (panic, timer, child exit) | terminate the process |
| another process (kill(pid, sig)) | terminate, or the app's own handler |

### Common Traps

❌ Anonymous pipes need fork() — no fork, no pipe sharing between unrelated processes.\
❌ A pipe is UNIDIRECTIONAL — two pipes if both sides must talk.\
❌ SIGKILL cannot be caught or ignored — no handler, ever.\
❌ Pipes carry raw BYTES — no framing; if you need records, you build them.

### Quick Self-Test (answers at the bottom)

1. After pipe()+fork(), the child must:
(a) close the write end (b) close the read end (c) close both
2. bash "a | b | c" creates how many processes?
(a) 2 (b) 3 (c) 4
3. Which signal can NO handler stop?
(a) SIGINT (b) SIGTERM (c) SIGKILL
4. A FIFO exists because:
(a) FIFOs are faster (b) unrelated processes need a named pipe (c) pipes are encrypted

**Answers:** 1→b, 2→b, 3→c, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Scheduling Criteria & Concepts",
    "slug": "scheduling-criteria-concepts",
    "lessonSlug": "cpu-scheduling-basics",
    "order": 0,
    "description": "The four metrics every scheduling question judges — turnaround, waiting, response, throughput — and the CPU/IO burst model behind them.",
    "explanation": `## What Does "Better" Even Mean?

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

\`\`\`
time ──►
CPU:    ████░░░░██████░░░░████            ██ = CPU burst
I/O:        ░░░░    ░░░░░░                ░░ = I/O wait
\`\`\`

| Burst profile | Typical program |
|---|---|
| long CPU bursts, rare I/O | batch compute, video encoding |
| short CPU bursts, frequent I/O | interactive apps, editors |

Most programs are I/O-bound — which is why schedulers obsess over long CPU hoggers.

### The Gantt Chart — Drawing the Schedule

A Gantt chart is the timeline of who owns the CPU:

\`\`\`
0         5         10        15      (time in ms)
├── P1 ──┼── P2 ──┼── P3 ──┼────────┤
\`\`\`

| From the chart | How to read it |
|---|---|
| P1 runs 0–5 | burst lengths or time quanta |
| P2 runs 5–10 | next process |
| idles 12–15 | CPU empty — no ready process existed |

> Every scheduling answer on this platform is: draw the Gantt chart FIRST, then read metrics off it. Do not compute formulas from memory — the chart IS the answer.

### Common Traps

❌ Turnaround counts from ARRIVAL, not from when the process first runs.\
❌ Waiting time excludes all CPU time, not just the first burst.\
❌ Response is about FIRST reply, not completion — interactive UX metric.\
❌ Throughput and turnaround are different optimisations: a scheduler can excel at one and fail the other.

### Quick Self-Test (answers at the bottom)

1. Completion − arrival = ?
(a) waiting (b) turnaround (c) response
2. Waiting time counts only time spent:
(a) on the CPU (b) in the ready queue (c) doing I/O
3. A fast-feeling terminal cares most about:
(a) response time (b) throughput (c) batch size
4. A program with long CPU bursts and rare I/O is:
(a) I/O-bound (b) CPU-bound (c) a thread

**Answers:** 1→b, 2→b, 3→a, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "FCFS & SJF Scheduling",
    "slug": "fcfs-sjf-scheduling",
    "lessonSlug": "cpu-scheduling-basics",
    "order": 1,
    "description": "The two simplest schedulers — First-Come First-Served (fair but convoy-prone) and Shortest Job First (optimal but starves the long job).",
    "explanation": `## The Coffee Queue vs the Fast Lane

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

❌ At every DECISION POINT, consider only processes that have ALREADY ARRIVED — arrivals later than "now" cannot be picked yet.\
❌ SJF is optimal for average WAITING, not for every metric.\
❌ FCFS with all processes arriving together is just arrival order — no choice at all.\
❌ Break ties by arrival time (and then by process number) — graders love tie rules.

### Quick Self-Test (answers at the bottom)

1. FCFS is: (a) preemptive (b) non-preemptive always (c) random
2. The convoy effect means:
(a) one long job delays everyone (b) processes help each other (c) I/O is fast
3. SJF is optimal for minimising:
(a) response (b) average waiting (c) throughput
4. In SJF at time t, you may pick a process whose arrival is:
(a) any future time (b) ≤ t only (c) never

**Answers:** 1→b, 2→a, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Priority Scheduling",
    "slug": "priority-scheduling",
    "lessonSlug": "priority-round-robin-scheduling",
    "order": 0,
    "description": "Serve the most important task first, preemptive or not — and the starvation problem that aging fixes.",
    "explanation": `## The VIP Queue

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

❌ Non-preemptive priority = decision ONLY when the current process finishes or blocks.\
❌ Preemptive priority = decide at EVERY arrival too.\
❌ Lower number = more important (or the reverse — the problem must say).\
❌ Starvation is about low-priority processes, not low arrival times.

### Quick Self-Test (answers at the bottom)

1. Preemptive priority interrupts the running process when:
(a) a shorter job arrives (b) a higher-priority job arrives (c) the quantum ends
2. Aging fixes:
(a) convoy effect (b) starvation (c) response time
3. Starvation happens when:
(a) high-priority work keeps arriving (b) CPU is idle (c) I/O is slow
4. Non-preemptive priority can be forced to wait:
(a) never (b) until the current burst finishes (c) forever always

**Answers:** 1→b, 2→b, 3→a, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Round Robin Scheduling",
    "slug": "round-robin-scheduling",
    "lessonSlug": "priority-round-robin-scheduling",
    "order": 1,
    "description": "The fair time-slicer — every ready process gets one quantum, no exceptions — and how the quantum size shapes the system.",
    "explanation": `## Everybody Gets a Slice

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

✅ No starvation — every ready process runs within one quantum.\
✅ Excellent response time for interactive users.\
✅ Simple and fair — the workhorse of time-sharing systems.

### Common Traps

❌ The quantum counts even when the process used less than q and BLOCKS (I/O) — it left on its own, not by preemption, and goes to the tail on return.\
❌ Compute waiting from the Gantt chart, never from formulas alone.\
❌ q too small = context-switch overhead explosion, not "more fair".\
❌ New arrivals append at the TAIL — they do not cut the queue.

### Quick Self-Test (answers at the bottom)

1. When q expires, the running process:
(a) stays on CPU (b) goes to the tail of the ready queue (c) terminates
2. RR with infinite quantum becomes:
(a) SJF (b) FCFS (c) priority
3. Tiny quanta cause:
(a) no switching (b) excessive context-switch overhead (c) starvation
4. An I/O-bound process that blocks mid-quantum:
(a) keeps its full remaining quantum later too (b) rejoins ready normally (c) is killed

**Answers:** 1→b, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Multilevel Queue & Feedback Queue",
    "slug": "multilevel-queue-feedback-queue",
    "lessonSlug": "multilevel-multiprocessor-scheduling",
    "order": 0,
    "description": "Multiple ready queues with different policies — and the feedback variant that promotes and demotes processes as they behave.",
    "explanation": `## The League of Queues

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

❌ MLQ (no feedback) = fixed assignment; MLFQ = processes MOVE between queues.\
❌ Demotion happens on FULL-quantum use, not on blocking early.\
❌ In Q2 (FCFS) a process runs until complete — it can still be preempted by higher queues.\
❌ Aging is the anti-starvation device in BOTH MQ and MLFQ.

### Quick Self-Test (answers at the bottom)

1. In MLFQ, a process that uses its whole quantum typically:
(a) gets promoted (b) gets demoted (c) terminates
2. A process that blocks early for I/O looks:
(a) interactive (b) hog-hungry (c) dead
3. Q2 in the classic 3-queue MLFQ runs:
(a) RR q=2 (b) RR q=4 (c) FCFS
4. MLQ vs MLFQ difference:
(a) MLFQ lets processes change queues (b) MLQ has RR (c) none

**Answers:** 1→b, 2→a, 3→c, 4→a.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Multiprocessor Scheduling",
    "slug": "multiprocessor-scheduling",
    "lessonSlug": "multilevel-multiprocessor-scheduling",
    "order": 1,
    "description": "Scheduling across many CPUs — symmetric vs asymmetric, processor affinity, load balancing, and gang scheduling.",
    "explanation": `## Many CPUs, One Scheduler Problem

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

❌ SMP = everyone schedules; it does NOT mean "no queues".\
❌ Affinity improves performance but can imbalance load — that is why balancing exists.\
❌ Gang scheduling is for threads that must run IN PARALLEL (barrier-synced), not for independent tasks.\
❌ Loading balancing and affinity are opposing forces — the OS tunes between them.

### Quick Self-Test (answers at the bottom)

1. In SMP, the scheduler runs:
(a) only on CPU 0 (b) on every CPU (c) nowhere
2. Processor affinity keeps a process on the same CPU to:
(a) save power (b) reuse warm caches (c) avoid forks
3. An idle CPU taking work from a busy CPU is:
(a) pull migration (b) push migration (c) gang scheduling
4. Gang scheduling runs a job's threads:
(a) one at a time (b) simultaneously on different CPUs (c) on one CPU with RR

**Answers:** 1→b, 2→b, 3→a, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Critical Section Problem",
    "slug": "critical-section-problem",
    "lessonSlug": "process-synchronization",
    "order": 0,
    "description": "The race-condition horror story, the three requirements of a correct critical section, and Peterson's solution.",
    "explanation": `## The ATM Horror Story

Two ATMs, one account with 1000 rupees. Both check "balance ≥ 500" (true), both dispense 500 — mutual exclusion was NOT enforced. Two processes updating the same variable with read-modify-write are racing: the last write wins, money vanishes.

### What a Critical Section Is

The **critical section** of a process is the piece of code that touches SHARED data. The rule: at most ONE process may be inside its critical section at any moment.

\`\`\`
while (true) {
    // entry section  — ask permission
    CRITICAL SECTION  — update shared balance
    // exit section   — release permission
    remainder section — everything else (no shared data)
}
\`\`\`

### The Three Holy Requirements

| Requirement | Meaning | Violation smells like |
|---|---|---|
| **Mutual exclusion** | no two processes inside the CS at once | two ATMs both dispensing |
| **Progress** | if the CS is free and someone wants in, someone MUST get in — no bystander/outsider blocks the decision | an unrelated process holds the door shut forever |
| **Bounded waiting** | no process waits forever — a bound exists on how many times others pass first | starvation (one process never gets in) |

### Peterson's Algorithm (for TWO processes)

\`\`\`
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
\`\`\`

| Property | Why it holds |
|---|---|
| mutual exclusion | both set turn=other; the loser spins, the winner enters |
| progress | if only i wants in, flag[other]=false → i never spins |
| bounded waiting | i can be overtaken at most once (by the other) |

### Common Traps

❌ Mutual exclusion alone is NOT enough — progress and bounded waiting matter too.\
❌ Busy waiting is a valid solution, just wasteful — it spins the CPU.\
❌ "Two processes read, nobody writes" has NO race — races need a WRITER.\
❌ The entry section must run WITHOUT holding the resource — that is the whole trick.

### Quick Self-Test (answers at the bottom)

1. A critical section is code that:
(a) is fast (b) touches shared data (c) runs on CPU 0
2. "Liberate the CS while someone else also wants in — without deadlock" is:
(a) mutual exclusion (b) progress (c) speed
3. Bounded waiting forbids:
(a) loops (b) starvation (c) recursion
4. The ATM disaster violated:
(a) mutual exclusion (b) the bank's uptime (c) priority

**Answers:** 1→b, 2→b, 3→b, 4→a.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Semaphores & Mutex Locks",
    "slug": "semaphores-mutex-locks",
    "lessonSlug": "process-synchronization",
    "order": 1,
    "description": "The counting semaphore and its binary cousin the mutex — plus the classic producer-consumer solution and the famous busy-wait debate.",
    "explanation": `## The Toll Booth for Shared Data

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

\`\`\`
mutex = 1

// every process:
wait(mutex);      // acquire the key
CRITICAL SECTION
signal(mutex);    // release the key
\`\`\`

### The Producer-Consumer Solution (THE classic)

Shared: bounded buffer of size n, plus three semaphores:

| Semaphore | Initial | Guards |
|---|---|---|
| mutex | 1 | the buffer itself (mutual exclusion) |
| empty | n | free slots |
| full | 0 | occupied slots |

\`\`\`
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
\`\`\`

**Order matters:** wait(empty) BEFORE wait(mutex) — swapping them invites deadlock (the producer holding the buffer lock while waiting for a free slot the consumer can never free).

### Busy Waiting vs Blocking

| Implementation | What happens |
|---|---|
| **Busy waiting** | the semaphore spins: while (count ≤ 0) {}; — wastes CPU but stays in user space |
| **Blocking** | the process is suspended and put on a wait queue — the CPU is freed |

Modern semaphores block; the classic textbook counts them spinning.

### Common Traps

❌ Swap the wait() order in producer-consumer → deadlock. Memorise: resource count FIRST, mutex second.\
❌ A mutex is NOT a counting semaphore with n>1 — a mutex has ownership; a semaphore does not.\
❌ signal() never blocks — only wait() can block.\
❌ 2× wait(mutex) without a signal in between = self-deadlock.

### Quick Self-Test (answers at the bottom)

1. wait() decrements when: (a) count > 0 (b) count = 0 always (c) never
2. Producer-consumer waits for a slot with:
(a) wait(mutex) (b) wait(empty) (c) signal(full)
3. Swapping the two waits in producer-consumer:
(a) speeds it up (b) risks deadlock (c) loses items
4. Blocking semaphores, unlike busy-wait, free:
(a) the buffer (b) the CPU (c) the disk

**Answers:** 1→a, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Readers-Writers Problem",
    "slug": "readers-writers-problem",
    "lessonSlug": "classical-synchronization-problems",
    "order": 0,
    "description": "Many readers may read together; writers need total silence — the classic reader-priority semaphore solution.",
    "explanation": `## The Library Rule

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

\`\`\`
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
\`\`\`

### Reader vs Writer Priority

| Variant | Winner | Trade-off |
|---|---|---|
| **Reader priority** (above) | readers never wait for readers | a continuous stream of readers can starve the writers |
| **Writer priority** | once a writer waits, new readers queue behind it | readers can starve if writers keep queuing |

### Common Traps

❌ The FIRST reader takes rw_mutex; only the LAST reader releases it — count the readers correctly.\
❌ Writers do NOT touch the reader counter at all — that is mutex's private business.\
❌ Reader priority does not use a queue for writers — it races; writer starvation needs writer-priority or a ticket queue.\
❌ "Two writers at once" is forbidden even if no readers — rw_mutex enforces that too.

### Quick Self-Test (answers at the bottom)

1. Readers may be inside the CS: (a) one at a time (b) many at once (c) never with writers also allowed
2. Writer entry requires: (a) read_count == 0 and no writer (b) an empty buffer (c) priority
3. The first reader must: (a) wait(rw_mutex) (b) signal(rw_mutex) (c) sleep
4. Reader priority can starve: (a) readers (b) writers (c) the kernel

**Answers:** 1→b, 2→a, 3→a, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Dining Philosophers Problem",
    "slug": "dining-philosophers-problem",
    "lessonSlug": "classical-synchronization-problems",
    "order": 1,
    "description": "Five thinkers, five forks — and why the naive solution deadlocks every time, plus the fixes.",
    "explanation": `## The Round Table of Deadlock

Five philosophers sit around a table, one fork between each pair (5 forks total). Each philosopher alternates THINK and EAT; to eat they need BOTH the fork on their left AND the one on their right.

### The Naive (Deadlocking) Solution

\`\`\`
wait(fork[i]);            // left fork
wait(fork[(i + 1) % 5]);  // right fork
EAT
signal(fork[i]);
signal(fork[(i + 1) % 5]);
THINK
\`\`\`

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

\`\`\`
// Fix 2 with a semaphore — room = 4:
wait(room);                // at most 4 philosophers try to eat
wait(fork[i]);
wait(fork[(i + 1) % 5]);
EAT
signal(fork[i]);
signal(fork[(i + 1) % 5]);
signal(room);
\`\`\`

Why does the room=4 fix work? Among any 4 philosophers at 5 forks, at least one pair is NOT fighting over the same middle fork — someone can always make progress.

### Interview One-Liner

> "The dining philosophers deadlock because of circular wait; break the cycle by having one philosopher pick up forks in the opposite order."

### Common Traps

❌ The deadlock needs ALL FIVE to hold-and-wait — four philosophers cannot deadlock (5 forks, 4 diners).\
❌ Fixes break circular wait, not "greed"/priority.\
❌ The room semaphore (n−1 of n) is a general anti-deadlock trick: cap concurrent contenders.\
❌ Starvation is still possible in naive fixes — the semaphore fix + fairness covers it.

### Quick Self-Test (answers at the bottom)

1. With the naive solution, all 5 philosophers picking the left fork first:
(a) eat in turns (b) deadlock (c) are fast
2. The deadly cycle is called:
(a) circular wait (b) convoy (c) aging
3. Letting at most 4 philosophers reach for forks:
(a) guarantees one fork stays free (b) breaks the table (c) adds forks
4. Having philosopher 4 take the right fork first:
(a) breaks the cycle (b) starves P4 (c) doubles forks

**Answers:** 1→b, 2→a, 3→a, 4→a.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Deadlock Conditions & Prevention",
    "slug": "deadlock-conditions-prevention",
    "lessonSlug": "deadlock-prevention-avoidance",
    "order": 0,
    "description": "The four conditions that must ALL hold for deadlock — and the four ways to break one of them.",
    "explanation": `## The Traffic Gridlock

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

❌ All four conditions must hold — proving just one absent is enough to prove no deadlock.\
❌ Deadlock on a SINGLE resource (one printer) is impossible without other resources — you need ≥2 contenders on ≥2 resources.\
❌ Circular wait is a CYCLE condition, not "processes waiting for the same thing".\
❌ Prevention ≠ avoidance: prevention makes deadlock structurally impossible; avoidance refuses unsafe grants.

### Quick Self-Test (answers at the bottom)

1. Hold-and-wait means the process:
(a) holds one resource while requesting another (b) waits endlessly (c) never releases
2. Numbering resources breaks:
(a) mutual exclusion (b) circular wait (c) preemption
3. To prevent deadlock you need to break:
(a) all four (b) at least one (c) exactly two
4. Requesting EVERYTHING up front is a(n):
(a) avoidance (b) hold-and-wait prevention (c) detection

**Answers:** 1→a, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Deadlock Avoidance (Banker's Algorithm)",
    "slug": "deadlock-avoidance-bankers",
    "lessonSlug": "deadlock-prevention-avoidance",
    "order": 1,
    "description": "Never grant a request that could leave the system unable to finish every process — the Banker's Algorithm safety check.",
    "explanation": `## The Bank That Never Goes Broke

A banker lends money only if the remaining cash can still let every client eventually finish their project. THAT is deadlock avoidance: a request is granted only if the system remains in a **safe state**.

### The Model

| Matrix | Meaning |
|---|---|
| **Allocation** | what each process holds NOW |
| **Max** | what each process may EVER need |
| **Need = Max − Allocation** | what each process may still ask for |
| **Available** | what is free right now |

### The Safety Algorithm (pseudocode)

\`\`\`
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
\`\`\`

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

❌ Need = Max − Allocation, NOT Max − Available.\
❌ The safety check needs a process whose ENTIRE Need fits in Work — partial fits do not count.\
❌ Safe state ⇒ deadlock impossible; unsafe state ⇒ deadlock POSSIBLE (not certain).\
❌ When a process "finishes", its full Allocation is ADDED back to Work.

### Quick Self-Test (answers at the bottom)

1. The safety algorithm runs until:
(a) every Finish is TRUE (b) Work is empty (c) one pass completes
2. When a process finishes, we add its ________ to Work:
(a) Need (b) Allocation (c) Max
3. An unsafe state means deadlock is:
(a) guaranteed (b) possible (c) impossible
4. A request is granted only if the attempted state is:
(a) faster (b) safe (c) busy

**Answers:** 1→a, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Deadlock Detection Algorithms",
    "slug": "deadlock-detection-algorithms",
    "lessonSlug": "deadlock-detection-recovery",
    "order": 0,
    "description": "When deadlocks are allowed to happen — find them with the Resource Allocation Graph or the wait-for detection scan.",
    "explanation": `## The Detective's Toolkit

Prevention and avoidance stop deadlocks before they happen. **Detection** lets them happen — then finds them and recovers. Two tools:

### Tool 1 — The Resource Allocation Graph (RAG)

| Node / edge | Drawing |
|---|---|
| process | circle |
| resource type (with instances) | square with dots |
| P wants R (request edge) | P ───► R |
| R is held by P (assignment edge) | R ───► P |

**Rule:** if every resource type has exactly ONE instance, a **cycle in the RAG = deadlock** (cycle detection on the graph).

\`\`\`
   P1 ──► R1 ──► P2 ──► R2 ──► P3 ──► R3 ──► P1    ← cycle through all three!
   P1 holds R3, wants R1; P2 holds R1, wants R2; P3 holds R2, wants R3
   = deadlock: everyone waits on the next person's resource
\`\`\`

**Multi-instance caveat:** with resources of multiple instances, a cycle is NECESSARY but not SUFFICIENT — check with the matrix algorithm below.

### Tool 2 — The Wait-For Detection Algorithm (multi-instance)

A safety-check lookalike: see if someone can finish and return resources.

\`\`\`
Work   = Available
Finish = FALSE for all

pick any i with Finish[i] == FALSE and Allocation[i] <= Work
    → Work += Allocation[i]; Finish[i] = TRUE; repeat

any Finish FALSE  → DEADLOCK (those processes are in it)
\`\`\`

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

❌ A RAG cycle guarantees deadlock ONLY for single-instance resources.\
❌ In a RAG, request edges point P→R and assignment edges R→P — get the direction right.\
❌ The detection scan is a SAFETY-CLASS algorithm but proves DEADLOCK, not safety.\
❌ Detection must be periodic or on-demand — the OS cannot know by intuition.

### Quick Self-Test (answers at the bottom)

1. In a RAG, "P → R" means:
(a) P holds R (b) P requests R (c) R requests P
2. A RAG cycle with single-instance resources implies:
(a) starvation (b) deadlock (c) aging
3. With multi-instance resources, a cycle is:
(a) sufficient (b) necessary but not sufficient (c) irrelevant
4. The wait-for scan finishes a process whose Allocation:
(a) equals Work (b) fits inside Work (c) exceeds Work

**Answers:** 1→b, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Deadlock Recovery Strategies",
    "slug": "deadlock-recovery-strategies",
    "lessonSlug": "deadlock-detection-recovery",
    "order": 1,
    "description": "Deadlock found — now what? Kill a process, steal a resource, or roll back to a checkpoint.",
    "explanation": `## After the Detective Comes the Swat Team

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

❌ Killing ALL victims is the sledgehammer — "kill one at a time" is usually enough (the cycle often breaks with one death).\
❌ Preemption needs CHECKPOINTS to be meaningful — rollback demands periodic state saves.\
❌ Victim selection must avoid punishing the same process repeatedly (starvation of recovery).\
❌ Recovery acts AFTER detection — no deadlock detector means no recovery trigger.

### Quick Self-Test (answers at the bottom)

1. Killing one process at a time, then re-checking, is:
(a) wasteful (b) the budget-friendly strategy (c) forbidden
2. Rollback needs:
(a) checkpoints (b) more RAM (c) a faster CPU
3. The victim should have:
(a) the highest priority (b) the least remaining work justified (c) most users
4. Preempting the same victim forever is:
(a) fine (b) recovery starvation (c) mandatory

**Answers:** 1→b, 2→a, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Contiguous Memory Allocation",
    "slug": "contiguous-memory-allocation",
    "lessonSlug": "memory-management-basics",
    "order": 0,
    "description": "Give each process one unbroken slab of RAM — and the three fit-strategies (first, best, worst) with a full hole-tracking trace.",
    "explanation": `## One Slab per Tenant

**Contiguous allocation** hands each process a single, unbroken region of memory. The OS tracks free intervals ("holes") and picks a hole for each new process.

### The Memory Layout

\`\`\`
0          OS kernel (resident)
│──────────│
│  hole A  │  free 100K
│──────────│
│  P1      │  80K
│──────────│
│  hole B  │  free 300K
│──────────│
│  P2      │  50K
│──────────│
│  hole C  │  free 200K
└──────────┘
\`\`\`

### The Three Fit Strategies

| Strategy | Pick | Example: request 112K on holes 100K, 500K, 200K, 300K |
|---|---|---|
| **First fit** | the FIRST hole big enough | 500K |
| **Best fit** | the SMALLEST hole big enough | 300K (leaves the smallest leftover) |
| **Worst fit** | the LARGEST hole — keep big chunks for big future requests | 500K (leaves 388K, still usable) |

| Strategy | Speed | Fragmentation behaviour |
|---|---|---|
| first fit | fastest scan | medium |
| best fit | scans all holes | LEAST external fragmentation but many tiny leftovers |
| worst fit | scans all holes | biggest leftovers each time — paradoxically can leave the most usable space |

### The Trace — Request Sequence on Holes {100, 500, 200, 300}

| Request | First fit | Best fit | Worst fit |
|---|---|---|---|
| 212K | 500K → leaves 288K | 300K → leaves 88K | 500K → leaves 288K |
| 417K | 288K is too small, 200 too, 300 too → FAILS | 288K too small… 88K… 200, 300 → FAILS | 288K too small → FAILS |

Different victims: best fit burned the 300K hole on the 212K request, leaving three small holes; first fit ate the 500K — both then fail on 417K. Moral: **hole sizes, not algorithms, doom a request.**

### The Two Kinds of Space Wasted

| Kind | Where it lives | Fix |
|---|---|---|
| **External fragmentation** | BETWEEN processes — many small unusable holes | compaction (move processes to pack holes together), or paging |
| **Internal fragmentation** | INSIDE a process's allocation (memory given extra, unused) | exact-fit sizing, or page-based allocation |

### Compaction

Move all processes towards lower addresses so the scattered holes merge:

\`\`\`
BEFORE:  [P1][hole][P2][hole][P3][hole]    usable total: 60K but split
AFTER:   [P1][P2][P3][      hole 60K   ]   one BIG hole — a 55K process now fits
\`\`\`

Cost: everything must be RELOCATED (base-register relocation hardware) — expensive, done only when a request cannot fit otherwise.

### Common Traps

❌ Best fit minimises leftover size, NOT "uses memory best" overall — it creates the tiniest holes and can force compaction sooner.\
❌ Worst fit prefers the largest hole — the leftover stays big, but the strategy is not "worst for you".\
❌ First fit makes 2 passes in theory (OS, then user region) — but between holes it is one scan.\
❌ Internal fragmentation is about the ALLOCATION being bigger than the request — the process cannot use it, and neither can anyone else.

### Quick Self-Test (answers at the bottom)

1. Best fit picks the hole that is:
(a) first in address order (b) smallest but sufficient (c) largest
2. Compaction cures:
(a) internal fragmentation (b) external fragmentation (c) paging
3. Worst fit leaves behind:
(a) the smallest leftovers (b) the largest leftovers (c) nothing
4. Holes BETWEEN processes are:
(a) internal fragmentation (b) external fragmentation (c) swapping

**Answers:** 1→b, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  },
  {
    "title": "Fragmentation",
    "slug": "fragmentation",
    "lessonSlug": "memory-management-basics",
    "order": 1,
    "description": "The two fragmentation monsters — internal and external — and why they force the invention of paging.",
    "explanation": `## The Two Holes in Every Slab

Contiguous allocation wastes memory in exactly two ways. Knowing the difference is a guaranteed interview question.

### External Fragmentation — Cracks Between the Slabs

Total free memory is plenty, but it is SPLIT into small pieces — no single hole fits the next request.

\`\`\`
[P1] [free 20K] [P2] [free 30K] [P3] [free 25K] [P4]
     total free = 75K, but a 40K process cannot fit anywhere!
\`\`\`

| Real-world smell | Fixes |
|---|---|
| 60% of memory free, yet requests fail | compaction (expensive), or give up contiguity → **paging** |

### Internal Fragmentation — Wasted Space INSIDE an Allocation

Memory is given to a process in fixed multiples (say 2K units). A process needing 4.5K gets 6K — the last 1.5K is inside its slab and unusable by anyone.

\`\`\`
requested: 4.5K   allocated: 6K (3 × 2K units)
[ 2K ][ 2K ][ 2K ]  ← 1.5K of the last chunk is dead weight
\`\`\`

| Kind | Where | Can another process use it? | Caused by |
|---|---|---|---|
| External | between processes | no — it is in pieces | variable-size allocations + churn |
| Internal | inside an allocation | no — it is reserved | fixed-size allocation units |

### Why Paging Wipes Both Out

**Paging** splits both memory AND processes into small fixed frames (say 4K): a process's pages can live in ANY free frames — the "slab" is gone, so external fragmentation cannot form (holes merge into free-frame lists). Small leftover inside a process's last frame is bounded by one frame size — internal fragmentation shrinks to ≤ one frame per process.

| Metric | Contiguous | Paged |
|---|---|---|
| external fragmentation | happens | impossible |
| internal fragmentation | none (exact fit) | ≤ one frame per process |
| compaction needed | sometimes | never |

### Common Traps

❌ External fragmentation is a FUNCTION of variable-size allocations — fixed-size slots cannot create it.\
❌ Internal fragmentation is ownership: the wasted space belongs to the process, no one else may touch it.\
❌ Compaction fixes external, NOT internal — paging fixes both effectively.\
❌ "Memory is 40% free but a request fails" is the signature of external fragmentation (or of a hole list with no fitting hole).

### Quick Self-Test (answers at the bottom)

1. External fragmentation lives:
(a) between processes (b) inside a process (c) in the TLB
2. Internal fragmentation is caused by:
(a) variable allocations (b) fixed-size allocation units (c) paging
3. Paging eliminates:
(a) internal fragmentation completely (b) external fragmentation (c) both perfectly at zero cost
4. Compaction is a fix for:
(a) internal fragmentation (b) external fragmentation (c) segmentation faults

**Answers:** 1→a, 2→b, 3→b, 4→b.`,
    "image": "",
    "youtubeUrl": "",
    "pdfUrl": "",
    "pptxUrl": ""
  }
];

/* ================================================================
 * OS Problems
 * ================================================================ */

const osProblems = [
  {
    "title": "Identify the System Call for a Given Operation",
    "slug": "identify-the-system-call",
    "lessonSlug": "introduction-to-operating-systems",
    "subtopicSlug": "system-calls-os-structure",
    "difficulty": "easy",
    "topics": ["System Calls", "OS Structure", "Process Management"],
    "companies": ["google", "amazon"],
    "problemStatement": "A junior developer is building a tiny shell. For each scenario, identify which family of system calls (process, file, device, information, communication) best fits the job.",
    "examples": [
      {
        "input": "Scenario A: They want to start a brand-new child process.",
        "output": "Process control (fork/exec)",
        "explanation": "Creating a child process is the process family's classic job — fork duplicates, exec replaces the running image."
      },
      {
        "input": "Scenario B: They want to read the contents of a text file from disk.",
        "output": "File management",
        "explanation": "Reading a file means open() then read() then close() — all file-family calls."
      },
      {
        "input": "Scenario C: The shell must print the current system time.",
        "output": "Information maintenance",
        "explanation": "Asking the OS for the clock time or pid belongs to the information family."
      },
      {
        "input": "Scenario D: Two programs want to exchange data with each other.",
        "output": "Communication family",
        "explanation": "Passing messages between processes is the communication family — pipe, send, recv."
      }
    ],
    "constraints": [
      "Each scenario maps to exactly one family: process, file, device, information, or communication.",
      "When in doubt, ask: what resource am I touching?"
    ],
    "approach": "## The One-Line Trick\n\nAsk: **what resource am I touching?**\n\n| The task is about a… | System call family | Example calls |\n|---|---|---|\n| child process / exec | Process control | fork(), exec(), wait(), exit() |\n| a file | File management | open(), read(), write(), close() |\n| a device | Device management | open(), close(), ioctl() |\n| system info / time | Information maintenance | getpid(), time() |\n| two processes exchanging data | Communication | pipe(), send(), recv(), connect() |\n\n### Step-by-Step Method\n\n1. **Find the subject.** Is the task about a process, a file, a device, system info, or another process?\n2. **Match it to the row in the table above.** The subject word is almost always the answer.\n3. **Name the family — then name the exact call** for a perfect answer: \"File management — open() then read().\"\n4. **Avoid traps:** printing the time is INFORMATION (not file), starting a child is PROCESS (not file), and two apps talking is COMMUNICATION (not device).\n\n### Interview Tip\n\nInterviewers love this question because it tests whether you can map a real task to the kernel's menu. Say the family first, then the exact call: \"That is process control — I would fork() and then exec().\" It is a two-word answer with a ten-second reason.",
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Trace the Process State Diagram",
    "slug": "trace-process-state-diagram",
    "lessonSlug": "process-concepts",
    "subtopicSlug": "process-states-pcb",
    "difficulty": "easy",
    "topics": ["Process States", "PCB"],
    "companies": ["google", "microsoft"],
    "problemStatement": "For each event below, give the state transition it causes (FROM state → TO state). Events: (a) the scheduler picks a ready process; (b) the running process asks for a disk read; (c) the disk read completes; (d) the timer interrupt fires while the process is running; (e) the process calls exit(). Use the states NEW, READY, RUNNING, WAITING, TERMINATED.",
    "examples": [
      {
        "input": "Event (a): scheduler picks a READY process.",
        "output": "READY → RUNNING (dispatch)",
        "explanation": "Dispatch is the only way into RUNNING — the scheduler selects the next process and loads its PCB."
      },
      {
        "input": "Events (b) then (c): disk read requested, then completes.",
        "output": "RUNNING → WAITING, then WAITING → READY",
        "explanation": "Blocking on I/O moves the process OUT of the CPU race (WAITING); when the device finishes, it re-joins the ready queue — it still has to wait for the CPU."
      },
      {
        "input": "Events (d) then (e): timer interrupt fires; later the process exits.",
        "output": "RUNNING → READY (preemption); RUNNING → TERMINATED",
        "explanation": "The timer is preemption — the process did not finish, it just lost its turn. exit() ends the life cycle forever."
      }
    ],
    "constraints": [
      "Every transition must name both states — FROM and TO.",
      "A process cannot go to TERMINATED from WAITING in these events.",
      "Label the transition with its trigger (dispatch, I/O, timeout, exit)."
    ],
    "approach": `## Draw the Diagram Once, Answer Everything

The five states and their legal transitions:

\`\`\`
NEW ──admit──► READY ──dispatch──► RUNNING
                    ▲                  │
              I/O done │               │ I/O wait
                    │   ┌──────────────┘
                    │   │ (timeout)
                    │   ▼
                    └── READY ◄── WAITING
RUNNING ──exit──► TERMINATED
\`\`\`

### The Decision Table

| Event | FROM | TO | Trigger name |
|---|---|---|---|
| scheduler picks a process | READY | RUNNING | dispatch |
| running process asks for I/O | RUNNING | WAITING | I/O request |
| I/O completes | WAITING | READY | I/O completion |
| timer interrupt | RUNNING | READY | timeout / preemption |
| process ends | RUNNING | TERMINATED | exit |

### The Three-Step Method

1. **Identify the actor.** Is the CPU, the device, or the process causing it?
2. **Find the current state** on the diagram.
3. **Walk the legal arrow** — if no arrow exists, the event is impossible in the model.

### Interview Tip

The classic trap is I/O completion going straight to RUNNING. The device cannot give the CPU — the process must queue for it: WAITING → READY, never directly to RUNNING.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Determine Parent-Child Process Output (fork)",
    "slug": "determine-parent-child-fork-output",
    "lessonSlug": "process-concepts",
    "subtopicSlug": "process-creation-termination",
    "difficulty": "medium",
    "topics": ["Process Creation", "fork", "exec"],
    "companies": ["amazon", "oracle"],
    "problemStatement": "A program calls fork() three times in sequence (three separate fork statements, one after another, in the same process paths). Answer: (a) how many total processes exist after all forks complete? (b) how many of them are CHILDREN (not the original)? (c) if each process prints its PID instantly on creation, how many PID lines appear in total?",
    "examples": [
      {
        "input": "One fork() call in a parent-only program.",
        "output": "2 total processes; 1 child; 2 PID lines (parent + child).",
        "explanation": "fork duplicates the caller — the parent and its photocopy both continue executing after the call."
      },
      {
        "input": "Two fork() calls in sequence (both parent and child reach the second call).",
        "output": "4 total processes; 3 children; each prints once → 4 lines.",
        "explanation": "After fork1: 2 processes. Both execute fork2 → 2 more → 4 total. Formula: 2^n = 4."
      },
      {
        "input": "Three fork() calls in sequence.",
        "output": "8 total processes; 7 children; 8 lines total.",
        "explanation": "2^3 = 8 processes. The original parent is the only non-child: 8 − 1 = 7 children. Counting lines = counting processes = 8."
      }
    ],
    "constraints": [
      "All forks execute on EVERY alive process path (the standard trick problem).",
      "EXEC is not involved — no process replaces its image.",
      "Count the ORIGINAL process as one of the total."
    ],
    "approach": `## One Formula — 2ⁿ

Every fork DOUBLES the number of alive processes:

\`\`\`
n sequential forks      →  total processes = 2ⁿ
children               =  2ⁿ − 1
PID lines (each prints) =  2ⁿ
\`\`\`

### The Tree — n = 3

\`\`\`
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
\`\`\`

### Counting Rules of Thumb

| Question | Fast way |
|---|---|
| total processes | 2ⁿ |
| children | 2ⁿ − 1 |
| number of NEW processes after the k-th fork | 2ᵏ−¹ (the k-th fork's own children) |
| lines printed if all print | 2ⁿ |

### Common Traps

❌ "Total" vs "children" — the original counts once in total but not as a child.\
❌ fork() IN A LOOP is different — count generation by generation, not n loops = 2ⁿ blindly.\
❌ If the child calls exec() after a fork, the CHILD COUNT still stands — the process exists, just with a new image.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Compare Multithreading Models",
    "slug": "compare-multithreading-models",
    "lessonSlug": "threads",
    "subtopicSlug": "threads-vs-processes",
    "difficulty": "easy",
    "topics": ["Threads", "Processes"],
    "companies": ["google", "microsoft"],
    "problemStatement": "For each statement, decide whether it is TRUE for threads (of one process), TRUE for processes, or TRUE for BOTH: (a) each unit has its own stack and program counter; (b) all units share the same address space; (c) a context switch between two units requires switching memory mappings; (d) a crash in one unit can take down its siblings.",
    "examples": [
      {
        "input": "Statement (a): own stack and program counter.",
        "output": "TRUE for BOTH.",
        "explanation": "Each thread needs its own call stack and PC; each process has its own too. This is the execution identity every unit must own."
      },
      {
        "input": "Statement (b): same address space.",
        "output": "TRUE for THREADS ONLY.",
        "explanation": "Threads of one process share code, data, heap, and open files; processes have isolated address spaces."
      },
      {
        "input": "Statements (c) and (d): memory mapping switch; crash kills siblings.",
        "output": "(c) TRUE for PROCESSES ONLY. (d) TRUE for THREADS ONLY.",
        "explanation": "Process switching requires new page tables (memory mappings) — thread switches do not. A wild pointer in one thread corrupts shared data (sibling damage); processes are crash-isolated."
      }
    ],
    "constraints": [
      "Answer with the finest category that applies: THREADS / PROCESSES / BOTH.",
      "Assume threads belong to ONE common parent process.",
      "Consider only the default POSIX-style model (no exotic isolation)."
    ],
    "approach": `## The Sharing Table Decides Everything

\`\`\`
                    THREADS      PROCESSES
code/global data      SHARE        separate
address space         SHARE        separate
open files            SHARE        separate
stack + PC            own          own
memory mappings       same         switch on swap
crash isolation       NONE         isolated
\`\`\`

| Statement | Anchor column | Verdict |
|---|---|---|
| own stack/PC | execution identity | BOTH |
| shared address space | address space column | THREADS |
| mapping switch | context switch row | PROCESSES |
| crash takes siblings | crash isolation row | THREADS |

### The 3-Second Interview Method

Ask: **does this concern the PROCESS shell or the thread of execution?**

- Shell things (address space, files, mappings, isolation) → processes differ, threads share.
- Execution things (stack, PC, registers) → each unit owns its own, always.

### Common Traps

❌ "Crash isolation" is a PROCESS property — threads are friends who die together.\
❌ Context-switch cost is a PROCESS complaint — thread switches skip the mapping switch.\
❌ Open files are SHARED among threads — that is why they race on stdout.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Identify the Threading Model for a Scenario",
    "slug": "identify-threading-model-scenario",
    "lessonSlug": "threads",
    "subtopicSlug": "multithreading-models",
    "difficulty": "medium",
    "topics": ["Multithreading Models", "User Threads", "Kernel Threads"],
    "companies": ["amazon", "microsoft"],
    "problemStatement": "Choose the threading model (many-to-one, one-to-one, many-to-many) for each scenario. (a) A Java app on Linux where every user thread is a kernel thread and a blocked thread never freezes others. (b) An embedded library with 2000 user threads on ONE kernel thread — creation is nearly free but any blocking call freezes everything. (c) A legacy Solaris app where 100 user threads float over 4 kernel threads.",
    "examples": [
      {
        "input": "Scenario (a): Java on Linux, per-thread kernel support.",
        "output": "One-to-one.",
        "explanation": "Each user thread has its own kernel thread — the model that lets any thread block without freezing the process and uses all cores."
      },
      {
        "input": "Scenario (b): 2000 user threads over one kernel thread.",
        "output": "Many-to-one.",
        "explanation": "One kernel scheduling entity carries every user thread; blocking in any one of them blocks them all."
      },
      {
        "input": "Scenario (c): 100 user threads over 4 kernel threads.",
        "output": "Many-to-many.",
        "explanation": "A pool of kernel threads with user threads multiplexed over them — many-to-many's defining shape."
      }
    ],
    "constraints": [
      "Name the model and CONFIRM with the signpost: 1 kernel entity = many-to-one; n:n = one-to-one; pool = many-to-many.",
      "Blocking behaviour is the fastest discriminator."
    ],
    "approach": `## Count the Kernel Entities

| Clue in the story | Model |
|---|---|
| many user threads → ONE kernel thread | many-to-one |
| each user thread → its OWN kernel thread | one-to-one |
| many user threads → a POOL of kernel threads | many-to-many |

### The Decision Flow

\`\`\`
IF every user thread maps 1:1 to a kernel thread  → ONE-TO-ONE
ELSE IF all user threads share a single kernel thread → MANY-TO-ONE
ELSE → MANY-TO-MANY (pool)
\`\`\`

### The Behaviour Table

| Model | One thread blocks? | Parallel on multi-core? |
|---|---|---|
| many-to-one | whole process freezes | NO |
| one-to-one | nobody else notices | YES |
| many-to-many | its slot blocks; group survives | only within the pool size |

### Interview One-Liner

> "Count kernel threads: exactly one → many-to-one; equal count → one-to-one; a smaller pool → many-to-many."

### Common Traps

❌ Many-to-one on a multi-core machine still runs ONE thread at a time — the kernel sees one entity.\
❌ "2000 user threads" says nothing by itself — the model is decided by the KERNEL mapping.\
❌ Java is one-to-one ONLY when the JVM maps to native threads (the normal Linux case).`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Design an IPC Mechanism for a Scenario",
    "slug": "design-ipc-mechanism-scenario",
    "lessonSlug": "inter-process-communication",
    "subtopicSlug": "shared-memory-message-passing",
    "difficulty": "medium",
    "topics": ["IPC", "Shared Memory", "Message Passing"],
    "companies": ["google", "oracle"],
    "problemStatement": "Pick the best IPC tool for each scenario and justify in one sentence. (a) A video encoder streams 4 GB/s of frames between two processes on the same machine. (b) A payment API exchanges small JSON requests with a microservice on another server. (c) A parent process must hand a stream of bytes to its child in order, with no extra copies. (d) A server needs the exact same message delivered to several subscribers.",
    "examples": [
      {
        "input": "Scenario (a): 4 GB/s frame streaming, same machine.",
        "output": "Shared memory.",
        "explanation": "Message passing copies every byte through the kernel — 4 GB/s would die in the syscall/copy cost; shared memory is direct memory access after setup."
      },
      {
        "input": "Scenario (b): small JSON to a remote microservice.",
        "output": "Message passing (network sockets / RPC).",
        "explanation": "Shared memory is per-machine; small structured requests across machines must be packaged and shipped — message passing."
      },
      {
        "input": "Scenarios (c) and (d): ordered parent→child bytes; same message to many subscribers.",
        "output": "(c) Pipe. (d) Message passing with a public mailbox (indirect addressing).",
        "explanation": "A pipe gives strict FIFO byte order and needs no extra copies after fork. Indirect addressing lets many receivers pull from one shared mailbox."
      }
    ],
    "constraints": [
      "Justify every choice with ONE cost or benefit line.",
      "Same-machine + huge data → lean shared memory; cross-machine or tiny & safe → message passing.",
      "Parent/child byte streams → pipe."
    ],
    "approach": `## The IPC Decision Tree

\`\`\`
same machine? ── NO ──► message passing (sockets/RPC)
      │ YES
      ▼
huge data / speed critical? ── YES ──► shared memory
      │ NO
      ▼
talking to a relative (parent/child)? ── YES ──► pipe
      │ NO
      ▼
multiple receivers / want safety? ──► message passing (mailbox)
      │
      └──► either — pick the one you can justify
\`\`\`

### The Four-Column Cheat Sheet

| Tool | Speed | Machines | Safety | Best for |
|---|---|---|---|---|
| shared memory | ★★★ | one | pin-drop quiet kernel | big same-machine data |
| message passing | ★★ | many | kernel-copied, race-free | small/safe/remote |
| pipe | ★★ | one (relatives) | FIFO order, one writer | parent → child streams |
| mailbox | ★★ | one-ish | decoupled | publish to many |

### Common Traps

❌ Raw speed is never the only vote — a payment API wants safe copies, not speed.\
❌ Shared memory across machines does not exist without network glue (that glue IS message passing).\
❌ A pipe between unrelated processes needs a named FIFO — the anonymous pipe requires fork.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Trace a Piped Command Sequence",
    "slug": "trace-piped-command-sequence",
    "lessonSlug": "inter-process-communication",
    "subtopicSlug": "pipes-signals",
    "difficulty": "hard",
    "topics": ["Pipes", "Shell Pipelines", "fork"],
    "companies": ["google", "amazon", "microsoft"],
    "problemStatement": "The shell runs: ls | grep log | wc -l. Answer: (a) how many processes participate, and how are they related? (b) how many pipes exist? (c) trace WHERE each pipe's write end is closed, and what makes wc -l receive ONLY grep's filtered lines and NOTHING else. (d) if ls writes more output than the pipe buffer, what happens and who pauses?",
    "examples": [
      {
        "input": "Parts (a) and (b): process count and pipe count.",
        "output": "3 processes (ls, grep, wc) in a line — ls spawned first, wc last; 2 pipes: pipe1 = ls→grep, pipe2 = grep→wc.",
        "explanation": "Each '|' adds one new process and one pipe. The shell links pipe1's write end to grep's stdin and pipe2's read end to grep's stdout."
      },
      {
        "input": "Part (c): how does wc only see filtered lines?",
        "output": "grep inherits pipe1's read end as STDIN and pipe2's write end as STDOUT; every byte ls writes flows → grep → pipe2 → wc. Closure of unused ends prevents surprise readers/writers from keeping pipes open.",
        "explanation": "The flow is one directional chain: ls stdout = pipe1 write; grep stdin = pipe1 read; grep stdout = pipe2 write; wc stdin = pipe2 read. Any process that keeps an unused write end open would prevent EOF — wc would hang."
      },
      {
        "input": "Part (d): ls outpaces the pipe buffer (e.g. 8 KB).",
        "output": "ls BLOCKS on write until grep drains the pipe; the pipeline self-paces — nobody loses bytes, everything is buffered FIFO.",
        "explanation": "A pipe is a fixed-size kernel buffer. A full buffer pauses the writer (write() blocks) until the reader drains it — backpressure."
      }
    ],
    "constraints": [
      "Count processes, not commands — each pipeline stage is a process.",
      "Assume all processes run concurrently on an idle machine.",
      "Unused ends MUST be closed — otherwise EOF never arrives and wc waits forever."
    ],
    "approach": `## Draw the Data-Flow Snake

\`\`\`
shell
  │ fork()
  ├──► ls          its STDOUT = pipe1(W)
  │                fork()
  ├──► grep        STDIN = pipe1(R); STDOUT = pipe2(W)
  │                fork()
  └──► wc          STDIN = pipe2(R)
                    pipe2(W) closed by grep when grep exits
                    pipe1(W) closed by ls when ls exits
\`\`\`

### The Pipeline Rules

| Rule | Consequence |
|---|---|
| n pipes in one command | n + 1 processes |
| each process's stdout | the NEXT pipe's write end |
| each process's stdin | the PREVIOUS pipe's read end |
| every unused write end closed | EOF can propagate — else the reader hangs |
| full pipe buffer | writer blocks — backpressure |

### The EOF Story

wc counts lines until it sees EOF on its stdin. EOF arrives only when EVERY write end of pipe2 is closed. grep closing pipe2(W) when it exits is what finally tells wc "no more lines." That is why closure discipline matters.

### Common Traps

❌ wc does not wait for "all data ever" — it waits for ENOUGH EOF signals.\
❌ Blocks-per-second: a blocked writer uses zero CPU — it sits in the pipe's wait queue.\
❌ The shell itself forks the FIRST command — the shell is not a pipeline stage; it is the ancestor.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Calculate Waiting and Turnaround Time",
    "slug": "calculate-waiting-turnaround-time",
    "lessonSlug": "cpu-scheduling-basics",
    "subtopicSlug": "scheduling-criteria-concepts",
    "difficulty": "easy",
    "topics": ["Scheduling Criteria", "Turnaround", "Waiting Time"],
    "companies": ["google", "amazon", "oracle"],
    "problemStatement": "Four processes arrive together (arrival 0): P1 burst 5, P2 burst 2, P3 burst 8, P4 burst 3. The scheduler is NON-PREEMPTIVE FCFS in order P1, P2, P3, P4. Compute each process's completion, turnaround, and waiting time, then the average waiting time.",
    "examples": [
      {
        "input": "P1 runs first (0–5).",
        "output": "P1: completion 5, turnaround 5, waiting 0.",
        "explanation": "It started at time 0 and finished at 5. Waiting = turnaround − burst = 5 − 5 = 0."
      },
      {
        "input": "P2 runs second (5–7).",
        "output": "P2: completion 7, turnaround 7, waiting 5.",
        "explanation": "P2 arrived at 0 but the CPU was P1's until 5. Waiting = 7 − 2 = 5."
      },
      {
        "input": "P3 then P4, and the average.",
        "output": "P3: completion 15, turnaround 15, waiting 7. P4: completion 18, turnaround 18, waiting 15. Average waiting = (0 + 5 + 7 + 15) / 4 = 6.75 ms.",
        "explanation": "P3 waits 5+2 = 7 (P1 and P2 ran before it); P4 waits 5+2+8 = 15. All arrivals are 0, so turnaround = completion."
      }
    ],
    "constraints": [
      "Arrival times are all 0 — turnaround = completion − 0.",
      "Use the Gantt chart as the source of truth.",
      "Average = sum of waiting / number of processes."
    ],
    "approach": `## Draw, Then Read

### Step 1 — The Gantt Chart

\`\`\`
0     5     7            15           18
├─P1──┤─P2──┤──── P3 ────┤──── P4 ────┤
\`\`\`

### Step 2 — The Metric Table

\`\`\`
Process | burst | completion | turnaround | waiting
P1      |  5    |     5      |   5 − 0 = 5 |  5 − 5 = 0
P2      |  2    |     7      |   7 − 0 = 7 |  7 − 2 = 5
P3      |  8    |    15      |  15 − 0 = 15| 15 − 8 = 7
P4      |  3    |    18      |  18 − 0 = 18| 18 − 3 = 15
\`\`\`

### Step 3 — Formulae

\`\`\`
turnaround = completion − arrival
waiting    = turnaround − burst   (for a single-burst model)
average    = Σ waiting / n
\`\`\`

### Common Traps

❌ Waiting is NOT "start − arrival" — the process may yield the CPU mid-burst in preemptive systems.\
❌ With arrival = 0, turnaround == completion — the classic easy-mode giveaway.\
❌ Read completion times off the GANTT, not by accumulating bursts by heart.`,
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)"
  },
  {
    "title": "Compute a Schedule Using SJF",
    "slug": "compute-schedule-sjf",
    "lessonSlug": "cpu-scheduling-basics",
    "subtopicSlug": "fcfs-sjf-scheduling",
    "difficulty": "easy",
    "topics": ["SJF", "Scheduling"],
    "companies": ["amazon", "microsoft"],
    "problemStatement": "Non-preemptive SJF with these processes: P1 arrives 0, burst 6; P2 arrives 1, burst 2; P3 arrives 2, burst 8; P4 arrives 3, burst 3; P5 arrives 4, burst 4. Build the Gantt chart, then give completion and waiting time for every process and the average waiting time.",
    "examples": [
      {
        "input": "Time 0–6: who runs and why?",
        "output": "P1 runs 0–6 — it is the only process present at time 0; SJF has nothing shorter to choose.",
        "explanation": "SJF picks the shortest READY job: at t=0 only P1 exists. This is why P1 runs first even though its burst is large."
      },
      {
        "input": "At t=6 the ready set is {P2(2), P3(8), P4(3), P5(4)}.",
        "output": "Next: P2 (burst 2) runs 6–8; then P4 (3) runs 8–11; then P5 (4) runs 11–15; finally P3 (8) runs 15–23.",
        "explanation": "Shortest first at every decision point: at t=6 the bursts are 2, 8, 3, 4 → pick 2 (P2). At t=8 pick 3 (P4), at t=11 pick 4 (P5), and P3 (8) is last."
      }
    ],
    "constraints": [
      "At every decision point ONLY already-arrived processes are candidates.",
      "Ties: smaller process number first.",
      "Fire the burst lengths strictly as given."
    ],
    "approach": `## The Correct Trace (tie-broken, arrival-aware)

### Step 1 — Decision Timeline

| Time | Ready (arrived) | Pick | Runs |
|---|---|---|---|
| 0 | P1(6) | P1 | 0–6 |
| 6 | P2(2), P3(8), P4(3), P5(4) | P2 | 6–8 |
| 8 | P3(8), P4(3), P5(4) | P4 | 8–11 |
| 11 | P3(8), P5(4) | P5 | 11–15 |
| 15 | P3(8) | P3 | 15–23 |

### Step 2 — Gantt

\`\`\`
0     6     8    11        15              23
├─P1──┤─P2──┤─P4──┤── P5 ──┤───── P3 ──────┤
\`\`\`

### Step 3 — Metrics (arrival-aware)

\`\`\`
Process | arrival | burst | completion | waiting (= completion − arrival − burst)
P1      |  0 |  6 |  6  |  0
P2      |  1 |  2 |  8  |  5      (8 − 1 − 2)
P3      |  2 |  8 | 23  | 13      (23 − 2 − 8)
P4      |  3 |  3 | 11  |  5      (11 − 3 − 3)
P5      |  4 |  4 | 15  |  7      (15 − 4 − 4)
average waiting = (0 + 5 + 13 + 5 + 7) / 5 = 6.0 ms
\`\`\`

### Common Traps

❌ At t=6 the shortest is P2 (burst 2) — do NOT mistake P4 (3) for the smallest.\
❌ Waiting = completion − arrival − burst (arrivals are NOT all zero here!).\
❌ Never schedule a process that has not arrived — the "future-ready" cheat invalidates the whole answer.`,
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)"
  },
  {
    "title": "Compute a Schedule Using Priority Scheduling",
    "slug": "compute-schedule-priority",
    "lessonSlug": "priority-round-robin-scheduling",
    "subtopicSlug": "priority-scheduling",
    "difficulty": "medium",
    "topics": ["Priority Scheduling", "Scheduling"],
    "companies": ["amazon", "google"],
    "problemStatement": "Processes: P1 arrival 0, burst 10, priority 3; P2 arrival 1, burst 1, priority 1; P3 arrival 2, burst 2, priority 4; P4 arrival 3, burst 5, priority 2. Lower number = higher priority. (a) Build the Gantt chart for the NON-PREEMPTIVE version and the waiting times. (b) Rebuild for the PREEMPTIVE version and compare the average waiting times.",
    "examples": [
      {
        "input": "Part (a), non-preemptive: what happens at t=1 when P2 (priority 1) arrives while P1 runs?",
        "output": "P1 keeps running until 10 — non-preemptive priority only decides when the current burst ends.",
        "explanation": "At t=10 the ready set is {P2(1), P3(4), P4(2)}: order by priority → P2 (1) 10–11, P4 (2) 11–16, P3 (4) 16–18. Waiting: P1 0, P2 9, P3 14, P4 8 → average 31/4 = 7.75."
      },
      {
        "input": "Part (b), preemptive: which arrivals cut P1 off?",
        "output": "P2 cuts in at t=1 (pri 1 > 3); P4 arrives at t=3 (pri 2 > 3) and cuts in too; P3 (pri 4) never preempts anyone.",
        "explanation": "Trace: P1 0–1, P2 1–2 (done), P1 2–3, P4 3–8 (done), P1 8–16 (finishes), P3 16–18. Waiting: P1 = 16 − 0 − 10 = 6, P2 = 0, P3 = 14, P4 = 0 → average 20/4 = 5.0."
      },
      {
        "input": "Which version is better here, and what does preemption buy?",
        "output": "Preemptive: 5.0 vs 7.75 average waiting — VIP arrivals get served instantly; the cost is more context switches (P1 was interrupted twice).",
        "explanation": "Preemptive priority optimises for responsiveness to high-priority arrivals; the switch overhead is the trade-off."
      }
    ],
    "constraints": [
      "Lower number = higher priority in this problem.",
      "Non-preemptive decides ONLY at completion/block points.",
      "Preemptive decides at every arrival too.",
      "Ties: earlier arrival first."
    ],
    "approach": `## Two Flavours, Two Gantts

### Non-Preemptive Trace

| Time | Event / decision | Runs |
|---|---|---|
| 0 | P1 only | P1 0–10 |
| 10 | ready: P2(1), P3(4), P4(2) | P2 10–11, P4 11–16, P3 16–18 |

\`\`\`
0                   10 11       16   18
├─────── P1 ─────────┤─P2─┤─P4───┤─P3─┤
\`\`\`

### Preemptive Trace (arrivals cut in)

| t | Arrival/event | Who runs |
|---|---|---|
| 0 | — | P1 0–1 |
| 1 | P2 (pri 1) | P2 1–2, done |
| 2 | P3 (pri 4) — too low | P1 2–3 |
| 3 | P4 (pri 2) | P4 3–8, done |
| 8 | P1 resumes | P1 8–16, done |
| 16 | P3 | P3 16–18, done |

### Waiting Comparison

| | P1 | P2 | P3 | P4 | average |
|---|---|---|---|---|---|
| non-preemptive | 0 | 9 | 14 | 8 | 7.75 |
| preemptive | 6 | 0 | 14 | 0 | 5.00 |

### Common Traps

❌ Non-preemptive = the current process IGNORES every arrival, however VIP.\
❌ Priority is about WHO, not how long — SJF logic does not apply.\
❌ Preemptive yields more switches: count them when the interviewer asks about overhead.`,
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)"
  },
  {
    "title": "Compute a Schedule Using Round Robin",
    "slug": "compute-schedule-round-robin",
    "lessonSlug": "priority-round-robin-scheduling",
    "subtopicSlug": "round-robin-scheduling",
    "difficulty": "medium",
    "topics": ["Round Robin", "Time Quantum", "Scheduling"],
    "companies": ["google", "microsoft", "oracle"],
    "problemStatement": "Round Robin with quantum q = 4 ms. Processes: P1 arrives 0, burst 8; P2 arrives 1, burst 4; P3 arrives 2, burst 9. Draw the Gantt chart, compute each process's completion, waiting, and response time, and the average waiting time.",
    "examples": [
      {
        "input": "The first four milliseconds: who runs?",
        "output": "P1 runs 0–4 — it is the only ready process at t=0; the quantum expires with P1 at 4/8 done.",
        "explanation": "P1 goes to the tail of the ready queue. P2 (arrived 1) and P3 (arrived 2) are waiting: queue = [P2, P3, P1]."
      },
      {
        "input": "The full schedule.",
        "output": "P1 0–4 | P2 4–8 | P3 8–12 | P1 12–16 | P3 16–21. P2 finishes in its first quantum (burst 4 = q); P1 finishes at 16; P3 finishes at 21.",
        "explanation": "P2's burst equals the quantum, so it exits at the preemption point — no second slice needed. P3 completes its 5 remaining ms in the 16–21 slice."
      },
      {
        "input": "Waiting and response times.",
        "output": "Waiting: P1 = 16 − 0 − 8 = 8, P2 = 8 − 1 − 4 = 3, P3 = 21 − 2 − 9 = 10 → average 21/3 = 7. Response: P1 0, P2 3, P3 6.",
        "explanation": "Response = time to FIRST CPU: P2 waits 3 ms (P1's leftover slice), P3 waits 6 ms. Note response << turnaround — RR's whole point."
      }
    ],
    "constraints": [
      "Quantum q = 4 ms, context switch overhead ignored (assume 0).",
      "New arrivals join at the TAIL.",
      "Waiting = completion − arrival − burst; response = first-CPU time − arrival."
    ],
    "approach": `## The Circle of Slices

### The Queue State Machine

| Time | Ready queue | Runs | Notes |
|---|---|---|---|
| 0 | [P1] | P1 0–4 | q expired → tail |
| 1 | [P2] arrives | — | joins at tail |
| 2 | [P3] arrives | — | joins at tail |
| 4 | [P2, P3, P1] | P2 4–8 | burst 4 = q → finishes |
| 8 | [P3, P1] | P3 8–12 | 4 of 9 used → tail |
| 12 | [P1, P3] | P1 12–16 | 4 of 8 used → finishes |
| 16 | [P3] | P3 16–21 | 5 left, runs to completion |

### The Gantt

\`\`\`
0    4    8   12   16        21
├─P1─┤─P2─┤─P3─┤─P1─┤──P3───┤
\`\`\`

### Metrics Table

| Process | arrival | burst | completion | waiting | response |
|---|---|---|---|---|---|
| P1 | 0 | 8 | 16 | 8 | 0 |
| P2 | 1 | 4 | 8 | 3 | 3 |
| P3 | 2 | 9 | 21 | 10 | 6 |

Average waiting = 7 ms.

### Common Traps

❌ A process that FINISHES exactly at the quantum boundary does not go to the tail — it is done.\
❌ New arrivals join the TAIL — they do not displace the current slice.\
❌ Response is NOT waiting time — it stops at the first CPU grant, not completion.`,
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)"
  },
  {
    "title": "Trace a Multilevel Feedback Queue",
    "slug": "trace-multilevel-feedback-queue",
    "lessonSlug": "multilevel-multiprocessor-scheduling",
    "subtopicSlug": "multilevel-queue-feedback-queue",
    "difficulty": "hard",
    "topics": ["MLFQ", "Multilevel Queue", "Scheduling"],
    "companies": ["google", "amazon", "microsoft"],
    "problemStatement": "Three-queue MLFQ: Q0 RR q=2 → Q1 RR q=4 → Q2 FCFS. New processes enter Q0; using a full quantum demotes one level; finishing early stays. Processes (all arrive at 0): A burst 5, B burst 2, C burst 9, in arrival order A, B, C. Build the full trace: every quantum, every demotion, every completion, and the average waiting time.",
    "examples": [
      {
        "input": "The first session: A and B at Q0.",
        "output": "A runs 0–2, uses its full quantum → demoted to Q1. B runs 2–4, finishes within its quantum → done at 4.",
        "explanation": "A's burst (5) exceeds q=2, so its slice ends by preemption and A drops to Q1. B's burst (2) fits exactly — completion, no demotion needed."
      },
      {
        "input": "C's journey.",
        "output": "C runs 4–6 in Q0 (full q → demote), then 9–13 in Q1 at q=4 (still has 3 left → demote to Q2), then 13–16 in Q2 FCFS — finishes at 16.",
        "explanation": "C burns its entire 2 ms slice, then its entire 4 ms slice — the classic hog signature: demoted twice. In Q2 there is no quantum; it runs to completion."
      },
      {
        "input": "The final Gantt and averages.",
        "output": "A 0–2 + 6–9 (Q1 slice, finishes) | B 2–4 | C 4–6 + 9–16. Completion: A 9, B 4, C 16. Waiting: A = 9−5 = 4, B = 4−2 = 2, C = 16−9 = 7 → average 13/3 ≈ 4.33.",
        "explanation": "A gets ONE more slice in Q1 (4 ms ≥ its 3 remaining) and finishes there. Waiting = completion − burst (all arrivals 0)."
      }
    ],
    "constraints": [
      "New processes always enter Q0.",
      "Full-quantum use = demote one level; early exit = no demotion.",
      "Q2 (FCFS) has no quantum — a process there runs until it finishes.",
      "Arrival order inside a queue is FIFO."
    ],
    "approach": `## Rules of the League

\`\`\`
new process ─► Q0 (RR, q=2)
                │ full q? ──► demote to Q1
                │ done?     ──► exit
Q1 (RR, q=4)
                │ full q? ──► demote to Q2
                │ done?     ──► exit
Q2 (FCFS) ──► runs to completion
\`\`\`

### Full Trace Table

| Time | Queue state | Action |
|---|---|---|
| 0–2 | A in Q0 | A: 2/5, full q → demote |
| 2–4 | B in Q0 | B: 2/2 — COMPLETE |
| 4–6 | C in Q0 | C: 2/9, full q → demote |
| 6–9 | A in Q1 | A: 3/5 ≤ 4 → COMPLETE |
| 9–13 | C in Q1 | C: 4/9, full q → demote |
| 13–16 | C in Q2 | C: 3/9 — COMPLETE |

### Gantt + Metrics

\`\`\`
0  2  4  6     9     13   16
├A─┤─B─┤─C─┤──A──┤──C──┤─C─┤
Q0 Q0 Q0  Q1       Q1    Q2
\`\`\`

| Process | completion | waiting |
|---|---|---|
| A | 9 | 4 |
| B | 4 | 2 |
| C | 16 | 7 |

Average waiting ≈ 4.33 ms.

### Common Traps

❌ Batching "uses full quantum" — a process with burst EXACTLY q is DONE, not demoted.\
❌ Q2 FCFS can still be preempted by Q0/Q1 arrivals — it just never loses its own turns.\
❌ A demoted process never returns up (no promotion in the basic MLFQ — that needs aging).`,
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)"
  },
  {
    "title": "Identify the Critical Section Violation",
    "slug": "identify-critical-section-violation",
    "lessonSlug": "process-synchronization",
    "subtopicSlug": "critical-section-problem",
    "difficulty": "medium",
    "topics": ["Critical Section", "Mutual Exclusion", "Race Conditions"],
    "companies": ["google", "oracle"],
    "problemStatement": "For each scenario, name the requirement that fails (mutual exclusion, progress, bounded waiting — or none). (a) Two processes may both enter the critical section together. (b) The CS is free, process X wants in, but process Y — which does not want the CS at all — prevents X from entering. (c) Process X wants in and is repeatedly overtaken by others, forever. (d) Processes enter one at a time, a waiter always gets in within two passes, and a bystander never blocks anyone.",
    "examples": [
      {
        "input": "Scenario (a): two processes inside the CS together.",
        "output": "Mutual exclusion violated.",
        "explanation": "The core promise of a CS: at most one process inside at any moment. Two inside = the ATM disaster."
      },
      {
        "input": "Scenario (b): an uninterested bystander blocks X.",
        "output": "Progress violated.",
        "explanation": "Progress demands: CS free + someone wants in → someone gets in. Decisions must involve ONLY contenders; a bystander's vote blocks the entry decision."
      },
      {
        "input": "Scenarios (c) and (d).",
        "output": "(c) Bounded waiting violated (starvation). (d) No violation — all three requirements hold.",
        "explanation": "Bounded waiting caps how many times others may pass first. Scenario (d) passes mutual exclusion (one at a time), progress (no bystander blocking), and bounded waiting (a 2-pass cap)."
      }
    ],
    "constraints": [
      "One requirement per scenario — do not invent new ones.",
      "Progress is about DECISION-making; bounded waiting is about FAIRNESS over time.",
      "If all three hold, answer 'none'."
    ],
    "approach": `## The Three-Question Interrogation

For any scenario ask in order:

\`\`\`
Q1: can two processes be inside the CS together?      → MUTUAL EXCLUSION
Q2: is the CS free, someone wants in, and yet NOBODY   → PROGRESS
    can get in (because of an outsider or all-inside
    argument) ?
Q3: can a contending process be overtaken forever?     → BOUNDED WAITING
Q4: none of the above?                                 → NO VIOLATION
\`\`\`

### The Distinction Table

| Smell in the story | Requirement |
|---|---|
| "both inside" / "two ATMs" | mutual exclusion |
| "an unrelated process holds the door" | progress |
| "always someone else first" / "starves" | bounded waiting |
| "one at a time, capped overtakes, no bystanders" | none |

### Common Traps

❌ Starvation (repeatedly overtaken) is a BOUNDED-WAITING fault, not a progress fault — progress fails when NOBODY can enter.\
❌ Two readers with no writer is NOT a violation — a CS only matters when shared data is WRITTEN.\
❌ Livelock/deadlock of the door-holding kind is usually a PROGRESS failure, not mutual exclusion.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Solve the Producer-Consumer Problem with Semaphores",
    "slug": "solve-producer-consumer-semaphores",
    "lessonSlug": "process-synchronization",
    "subtopicSlug": "semaphores-mutex-locks",
    "difficulty": "hard",
    "topics": ["Semaphores", "Producer-Consumer", "Bounded Buffer"],
    "companies": ["google", "amazon", "microsoft"],
    "problemStatement": "A bounded buffer of size 3 starts empty. One producer and one consumer share it. The code below is MISSING four statements (two in each side). Complete it so that: the buffer never overflows, the consumer never reads an empty slot, and two processes never touch the buffer at once. State the initial values of every semaphore you introduce.",
    "examples": [
      {
        "input": "Which three semaphores does the solution need, and their start values?",
        "output": "empty = 3 (free slots), full = 0 (filled slots), mutex = 1 (buffer access).",
        "explanation": "Counting semaphores track capacity; the binary mutex serialises physical access to the array."
      }
      ,
      {
        "input": "The PRODUCER side: place the waits and signals correctly.",
        "output": "wait(empty) THEN wait(mutex); work; then signal(mutex) THEN signal(full).",
        "explanation": "Capacity is reserved BEFORE taking the mutex — holding the mutex while waiting for a slot is the classic deadlock: the consumer cannot free a slot because the producer owns the buffer."
      },
      {
        "input": "The CONSUMER side, plus a sanity check on the final state.",
        "output": "wait(full) THEN wait(mutex); take item; signal(mutex) THEN signal(empty). After one produce + one consume cycle the buffer holds exactly what was produced — no overflow, no underflow.",
        "explanation": "Mirror image of the producer: reserve content, then the buffer lock. The two counting semaphores guarantee the invariant empty + full = 3 at all times."
      }
    ],
    "constraints": [
      "Introduce whatever semaphores are needed — name initial values explicitly.",
      "The ORDER of the two waits is graded — never mutex-first.",
      "The invariants must hold: 0 ≤ items ≤ 3; empty + full = 3."
    ],
    "approach": `## The Complete Solution

\`\`\`
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
\`\`\`

### Why the Order Prevents Deadlock

| Order | Effect |
|---|---|
| wait(empty) FIRST | the producer blocks on CAPACITY while holding NOTHING |
| wait(mutex) second | once past capacity, it locks the buffer briefly |
| swap them | producer holds mutex + waits for empty → consumer needs mutex to free a slot → circular wait → deadlock |

### Invariant Checks

| After any step | Assert |
|---|---|
| produce | full + empty = 3 still true (count moved, not lost) |
| consume | buffer count never negative, never above 3 |

### Interview One-Liner

> "Reserve the RESOURCE first, the mutex second — never hold the buffer lock while waiting for the buffer itself to change."

### Common Traps

❌ missing signal() anywhere = counters drift → eventual deadlock or overflow.\
❌ mutex around EVERY array access — the count semaphores do NOT protect the array.\
❌ A consumer blocked on wait(full) holds NO locks — verify with the swap-order trap above.`,
    "timeComplexity": "O(1)",
    "spaceComplexity": "O(n)"
  },
  {
    "title": "Solve the Readers-Writers Problem",
    "slug": "solve-readers-writers-problem",
    "lessonSlug": "classical-synchronization-problems",
    "subtopicSlug": "readers-writers-problem",
    "difficulty": "hard",
    "topics": ["Readers-Writers", "Semaphores", "Concurrency"],
    "companies": ["amazon", "microsoft", "oracle"],
    "problemStatement": "Answer for the reader-priority solution (rw_mutex, mutex, read_count). (a) Write the WRITER's entry/exit and the READER's entry/exit. (b) What happens if a new reader arrives while a WRITER is waiting? (c) Show the state trace for: R1 in, R2 in, W1 wants in, R3 arrives, R2 leaves, R1 leaves — who gets the database when and why?",
    "examples": [
      {
        "input": "Part (a): the skeleton.",
        "output": "Writer: wait(rw_mutex); write; signal(rw_mutex). Reader: wait(mutex); read_count++; if (read_count == 1) wait(rw_mutex); signal(mutex); read; wait(mutex); read_count--; if (read_count == 0) signal(rw_mutex); signal(mutex).",
        "explanation": "The first reader takes the gate for the whole reader pack; the last reader opens it. Writers always go through rw_mutex alone."
      },
      {
        "input": "Part (b): a reader arrives while a writer waits.",
        "output": "The reader enters the database immediately — read_count becomes 2 and the first-reader gate (rw_mutex) is already held by R1.",
        "explanation": "Reader priority: waiting writers do not block arriving readers. This is exactly why writers can starve under continuous reader traffic."
      },
      {
        "input": "Part (c): the full trace.",
        "output": "R1 in (takes rw_mutex). R2 in (count 2 — no gate change). W1 waits on rw_mutex. R3 enters (count 3 — writer cannot stop it). R2 leaves (count 2). R1 leaves (count 1 — still no gate release). When the LAST reader leaves, rw_mutex is released and W1 finally writes.",
        "explanation": "Readers chain through the count; only the final reader's exit unblocks the writer. The writer's wait may last a long time — reader-priority in a nutshell."
      }
    ],
    "constraints": [
      "Use ONLY the reader-priority primitives: rw_mutex, mutex, read_count.",
      "Readers never touch rw_mutex except first-in/last-out.",
      "Writers never touch read_count."
    ],
    "approach": `## The Canonical Solution

\`\`\`
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
\`\`\`

### Part (c) — The State Table

| Step | read_count | rw_mutex holder | Who is in the DB |
|---|---|---|---|
| R1 enters | 1 | R1 (first reader) | R1 |
| R2 enters | 2 | still R1's | R1, R2 |
| W1 wants in | 2 | still held | blocked on rw_mutex |
| R3 enters | 3 | still held | R1, R2, R3 |
| R2 leaves | 2 | still held | R1, R3 |
| R1 leaves | 1 | still held | R3 |
| R3 leaves | 0 | RELEASED → W1 | W1 writes |

### Why Writers Starve (and the fix)

Readers keep bumping read_count above 0 while holding rw_mutex. Writer-priority adds a gate writers pass first; then arriving readers queue behind it.

### Common Traps

❌ The FIRST reader's wait() is inside the mutex — do not re-order; the count itself must be exclusive.\
❌ signal(rw_mutex) happens ONLY at count 0 — releasing earlier lets a writer in while readers still read.\
❌ A writer while readers are inside just WAITS — the database is not corrupt, merely busy.`,
    "timeComplexity": "O(1)",
    "spaceComplexity": "O(1)"
  },
  {
    "title": "Solve the Dining Philosophers Problem",
    "slug": "solve-dining-philosophers-problem",
    "lessonSlug": "classical-synchronization-problems",
    "subtopicSlug": "dining-philosophers-problem",
    "difficulty": "hard",
    "topics": ["Dining Philosophers", "Deadlock", "Semaphores"],
    "companies": ["google", "microsoft"],
    "problemStatement": "Five philosophers, one fork between each pair. (a) Explain exactly how the naive left-then-right solution deadlocks. (b) Add ONE mechanism (a room semaphore of 4, or a left-hander) and prove no deadlock can occur. (c) For the state 'P0 holds fork0 and fork1; P2 holds fork2 and fork3; P1, P3, P4 hungry with left forks free or taken below', decide if anyone can eat and whether the state is deadlocked.",
    "examples": [
      {
        "input": "Part (a): the naive deadlock.",
        "output": "All five grab their LEFT fork simultaneously → every philosopher holds one fork and waits for the right → a perfect wait-for cycle → deadlock.",
        "explanation": "Hold-and-wait + circular wait: each waiter's needed fork is held by the next waiter. Nobody can release (releasing requires eating, eating requires forks)."
      },
      {
        "input": "Part (b): the room fix and its proof.",
        "output": "Add semaphore room = 4; every philosopher does wait(room) before reaching for forks. Proof: with ≤ 4 diners at 5 forks, at least one fork is free even if everyone holds one — a free fork pair exists for someone.",
        "explanation": "With 4 philosophers holding 4 forks and 5 forks total, the fifth fork is free. Someone adjacent to the free fork can take it and eat — progress forever guaranteed."
      },
      {
        "input": "Part (c): given the state.",
        "output": "P0 holds fork0 + fork1 and can EAT right now (it holds both). P2 holds fork2 + fork3 and can also eat. After they eat and release, P1/P3/P4 take their pairs. NOT deadlocked.",
        "explanation": "Deadlock requires EVERY contender to be blocked. Here two philosophers already hold complete fork pairs — they make progress, break any cycle, and eventually free forks for the rest."
      }
    ],
    "constraints": [
      "Proofs must be one or two sentences — exam style.",
      "'Left-hander' means philosopher 4 takes the right fork first.",
      "Decide each given state on whether ANYONE can make progress."
    ],
    "approach": `## Anatomy of the Deadlock

\`\`\`
naive:
wait(fork[i]);  wait(fork[(i+1) % 5]);  EAT;  signal both

simultaneous grab → everyone holds fork[i], waits for fork[(i+1)%5]
cycle: P0→P1→P2→P3→P4→P0  → DEADLOCK
\`\`\`

### Fix 1 — The Room (n − 1 contenders)

| Why it works | Numbers |
|---|---|
| at most 4 philosophers compete | 5 forks, 4 held max → 1 free |
| someone next to the free fork eats | progress exists at every instant |

### Fix 2 — The Left-Hander

Philosopher 4 picks fork0 (right) FIRST. The cycle P4→P0 breaks: P4 and P0 cannot both wait on each other's fork simultaneously.

### The Decision Method for Any State

\`\`\`
1. can ANY competitor hold a FULL fork pair right now?      → someone eats
2. can anyone whose pair is incomplete acquire it without
   waiting on another waiter?                              → progress
3. neither → DEADLOCK
\`\`\`

### Common Traps

❌ Deadlock needs EVERYONE blocked — one eater breaks the case.\
❌ The room semaphore is released AFTER both forks — late release reserves the seat longer.\
❌ Fixes break circular wait; they do not reduce hunger (starvation is a separate fairness question).`,
    "timeComplexity": "O(1)",
    "spaceComplexity": "O(1)"
  },
  {
    "title": "Identify Which Deadlock Condition is Violated",
    "slug": "identify-deadlock-condition-violated",
    "lessonSlug": "deadlock-prevention-avoidance",
    "subtopicSlug": "deadlock-conditions-prevention",
    "difficulty": "medium",
    "topics": ["Deadlock", "Deadlock Prevention", "Hold and Wait"],
    "companies": ["amazon", "oracle"],
    "problemStatement": "For each prevention rule, name the deadlock condition it breaks, and for each system description, name the condition the system actually PREVENTS (or why it can still deadlock). (a) A printer is granted to one process at a time (no sharing). (b) A process must request ALL resources before starting. (c) The OS can forcibly reclaim a tape drive from a sleeping process. (d) Resources are numbered and requests must be ascending.",
    "examples": [
      {
        "input": "Rules (a) and (b).",
        "output": "(a) keeps mutual exclusion — deadlock is still possible if other conditions hold. (b) breaks hold-and-wait.",
        "explanation": "Condition 1 cannot be 'broken' for printers — they are exclusive by nature. Requiring everything upfront means a process never holds one resource while requesting another."
      },
      {
        "input": "Rule (c): forcible reclamation.",
        "output": "Breaks no preemption.",
        "explanation": "If a held resource may be taken away, the 'wait forever on a held resource' chain cannot solidify — preemption is the lever."
      },
      {
        "input": "Rule (d) plus a system that uses it.",
        "output": "Breaks circular wait.",
        "explanation": "Ascending-only requests make a cycle impossible: the holder of the highest-numbered resource never requests any other — circles cannot close."
      }
    ],
    "constraints": [
      "One condition per rule — name it exactly (mutual exclusion, hold and wait, no preemption, circular wait).",
      "Explain WHY in one line per case.",
      "A rule that strengthens mutual exclusion (a) does not prevent deadlock by itself."
    ],
    "approach": `## The Condition → Countermeasure Map

| # | Condition | Countermeasure family |
|---|---|---|
| 1 | mutual exclusion | share the resource |
| 2 | hold and wait | request everything up front / release before requesting |
| 3 | no preemption | allow forcible resource reclamation |
| 4 | circular wait | global resource numbering, ascending requests |

### The One-Line Question Bank

| System smells like… | Condition addressed |
|---|---|
| "must declare all resources in advance" | hold and wait |
| "kernel can take the resource back" | no preemption |
| "numbered resources, ascending order" | circular wait |
| "mutexes, printers, exclusive devices" | (mutual exclusion — kept, needs other guards) |

### Common Traps

❌ Breaking mutual exclusion is the ONE strategy you almost never can apply.\
❌ All-upfront requests prevent deadlock but waste utilisation — the classic trade-off question.\
❌ Numbering prevents cycles but burdens programmers with global ordering discipline.`,
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  },
  {
    "title": "Apply the Banker's Algorithm",
    "slug": "apply-bankers-algorithm",
    "lessonSlug": "deadlock-prevention-avoidance",
    "subtopicSlug": "deadlock-avoidance-bankers",
    "difficulty": "hard",
    "topics": ["Banker's Algorithm", "Deadlock Avoidance", "Safety Algorithm"],
    "companies": ["amazon", "google", "microsoft"],
    "problemStatement": "Five processes, three resource types (A, B, C). Available = (3, 3, 2). Allocation: P0 (0,1,0), P1 (2,0,0), P2 (3,0,2), P3 (2,1,1), P4 (0,0,2). Max: P0 (7,5,3), P1 (3,2,2), P2 (9,0,2), P3 (2,2,2), P4 (4,3,3). (a) Build the Need matrix. (b) Find a safe sequence. (c) Can P1's request (1, 0, 2) be granted immediately? (d) If granted, is the system still safe? (e) Can P0's request (0, 2, 0) be granted after that?",
    "examples": [
      {
        "input": "Part (a): the Need matrix.",
        "output": "P0 (7,4,3), P1 (1,2,2), P2 (6,0,0), P3 (0,1,1), P4 (4,3,1).",
        "explanation": "Need = Max − Allocation, element-wise. P1 needs only 1 A, 2 B, 2 C more to finish its declared plan."
      },
      {
        "input": "Parts (b) and (c): find the safe sequence, then decide on P1's request (1,0,2).",
        "output": "Need matrix from part (a). Work = Available = (3,3,2): P1 (1,2,2) fits → Work (5,3,2); P3 (0,1,1) fits → (7,4,3); P4 (4,3,1) fits → (7,4,5); P0 (7,4,3) fits → (7,5,5); P2 (6,0,0) fits → (10,5,7). Safe sequence: P1 → P3 → P4 → P0 → P2. Now P1 requests (1,0,2): ≤ Need₁ (1,2,2) ✓ and ≤ Available (3,3,2) ✓ — first two gates pass, so trial-grant it.",
        "explanation": "Gates 1 and 2 are only affordability checks. The third gate — trial-granting and testing the resulting state — decides whether the request is actually granted (next example)."
      },
      {
        "input": "Parts (d) and (e): is the system still safe after P1's grant? Then P0 requests (0,2,0).",
        "output": "(d) Trial-grant P1: Available becomes (2,3,0), P1's Need drops to (0,2,2). Safety check on the trial state finds NO process that fits: P0 (7,4,3) fails A, P2 (6,0,0) fails A, P3 (0,1,1) fails C (1 > 0), P4 (4,3,1) fails A and C. Nobody can ever run → trial state is UNSAFE → P1's request (1,0,2) is DENIED; P1 must wait. (e) With P1's request refused, P0's (0,2,0) is checked against the ORIGINAL state: ≤ Need (7,4,3) ✓, ≤ Available (3,3,2) ✓ → trial Available = (3,1,2); P1 (1,2,2) fails B, so try P3 (0,1,1) ✓ → Work (5,2,3); P1 ✓ → (7,2,3); P0 ✓ → (7,3,3); P4 ✓ → (7,3,5); P2 ✓ → (10,3,7). SAFE — grant P0.",
        "explanation": "The lesson: 'individually affordable' is NOT 'safe'. P1's request passes gates 1 and 2 but FAILS safety — refusing it is the algorithm's whole purpose. P0's request passes all three gates and is granted."
      }
    ],
    "constraints": [
      "Three gates per request: R ≤ Need, R ≤ Available, trial-state safety.",
      "A safe sequence must be shown, not just asserted.",
      "Answers must reflect the DENIED request: later answers use the ORIGINAL state."
    ],
    "approach": `## Part (c)/(d) — The Denied Request

\`\`\`
ORIGINAL  Available = (3,3,2)
safe:     P1 → P3 → P4 → P0 → P2
          Work: (3,3,2)→(5,3,2)→(7,4,3)→(7,4,5)→(7,5,5)→(10,5,7)

REQUEST P1(1,0,2):
  ≤ Need (1,2,2)? ✓   ≤ Available? ✓   trial → Available (2,3,0)
  safety on trial: NO process fits
     P3 (0,1,1) fails C (1 > 0); P4 (4,3,1) fails C; P2 fails A; P0 fails A
  → UNSAFE → DENY, restore Available (3,3,2)
\`\`\`

### Part (e) — The Granted Request

\`\`\`
REQUEST P0(0,2,0):  ≤ Need (7,4,3) ✓  ≤ Available (3,3,2) ✓
trial Available = (3,1,2)
P3 (0,1,1) ✓ → Work (5,2,3)
P1 (1,2,2) ✓ → Work (7,2,3)
P0 (7,4,3) ✓ → Work (7,3,3)
P4 (4,3,1) ✓ → Work (7,3,5)
P2 (6,0,0) ✓ → Work (10,3,7)
→ SAFE: P3 → P1 → P0 → P4 → P2   GRANT (0,2,0)
\`\`\`

### The Decision Flow

\`\`\`
request valid (≤ Need, ≤ Available)?
   │
   ├─ trial-grant → run safety check
   │      ├─ finds a full sequence → GRANT
   │      └─ finds none → DENY (tell the process to wait)
\`\`\`

### Common Traps

❌ A request that 'fits in Available' can still be unsafe — always trial and verify.\
❌ After a grant the system graphs CHANGE — recompute Need for the granted process.\
❌ Sequence order in the trial: pick the first process whose ENTIRE Need fits Work, in any consistent order.`,
    "timeComplexity": "O(n²·m)",
    "spaceComplexity": "O(n·m)"
  },
  {
    "title": "Detect a Deadlock Using a Resource Allocation Graph",
    "slug": "detect-deadlock-resource-allocation-graph",
    "lessonSlug": "deadlock-detection-recovery",
    "subtopicSlug": "deadlock-detection-algorithms",
    "difficulty": "medium",
    "topics": ["Deadlock Detection", "Resource Allocation Graph"],
    "companies": ["amazon", "oracle", "microsoft"],
    "problemStatement": "Given these graph clauses (single-instance resources): P1 holds R3, requests R1; P2 holds R1, requests R2; P3 holds R2, requests R4; P4 holds R4, requests R3; P5 holds R5 (and requests nothing). (a) Draw the graph edges. (b) Is there a cycle — are P1..P4 deadlocked? (c) Is P5 deadlocked? (d) Explain with the wait-for cycle.",
    "examples": [
      {
        "input": "Part (a): the edge list.",
        "output": "Request edges: P1→R1, P2→R2, P3→R4, P4→R3. Assignment edges: R3→P1, R1→P2, R2→P3, R4→P4, R5→P5.",
        "explanation": "Requests point process → resource; assignments point resource → process. Edge directions are half the marks."
      },
      {
        "input": "Parts (b) and (c): cycle? deadlock? P5?",
        "output": "(b) Cycle exists: P1 → R1 → P2 → R2 → P3 → R4 → P4 → R3 → P1 — all four are deadlocked. (c) P5 is NOT in the cycle — it holds R5 and waits on nothing; it runs happily.",
        "explanation": "Single-instance resources: cycle ⟺ deadlock for the cycle members. P5's subgraph is acyclic and satisfied — free to complete."
      },
      {
        "input": "Part (d): the wait-for restatement.",
        "output": "Wait-for chain: P1 waits for a resource P2 holds; P2 waits for P3; P3 waits for P4; P4 waits for P1 — circular wait among exactly {P1, P2, P3, P4}.",
        "explanation": "Contracting each resource edge into its holder gives the wait-for graph; any cycle there IS the deadlocked set."
      }
    ],
    "constraints": [
      "Draw request → resource and resource → request-assignment directions correctly.",
      "A cycle names WHICH processes are trapped (others may be free).",
      "Single-instance assumption applies to every resource here."
    ],
    "approach": `## Build the Graph, Shrink to Wait-For

### Step 1 — Full RAG

\`\`\`
     request:  P ──► R        assignment:  R ──► P

P1 ──► R1 ──► P2 ──► R2 ──► P3 ──► R4 ──► P4 ──► R3 ──► P1
              ^                                          │
              └────────────── cycle! ◄───────────────────┘

P5 ──► R5                            (isolated — no requests)
\`\`\`

### Step 2 — The Wait-For Reduction

| Contender | Waits for the resource held by |
|---|---|
| P1 | P2 (R1) |
| P2 | P3 (R2) |
| P3 | P4 (R4) |
| P4 | P1 (R3) |

Cycle: P1 ⇄ P2 ⇄ P3 ⇄ P4 — deadlocked set = {P1, P2, P3, P4}.

### Step 3 — Verdicts

| Process | In cycle? | Verdict |
|---|---|---|
| P1–P4 | yes | DEADLOCKED |
| P5 | no | free to finish |

### Common Traps

❌ P5 holds a resource but requests NOTHING — never part of a wait cycle by definition.\
❌ Multi-instance resources break the cycle ⟺ deadlock equivalence — that is why the matrix scan exists.\
❌ Edge direction: requests P→R, assignments R→P — reversing them misreads the whole graph.`,
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V)"
  },
  {
    "title": "Apply Best-Fit, Worst-Fit and First-Fit Allocation",
    "slug": "apply-best-worst-first-fit",
    "lessonSlug": "memory-management-basics",
    "subtopicSlug": "contiguous-memory-allocation",
    "difficulty": "medium",
    "topics": ["Contiguous Allocation", "Best Fit", "First Fit", "Worst Fit"],
    "companies": ["google", "amazon"],
    "problemStatement": "Memory holds free holes: 100K, 500K, 200K, 300K (in address order). Requests arrive: 212K, 417K, 112K. For EACH strategy (first fit, best fit, worst fit), show which hole satisfies each request and the hole list after every grant. Which strategies satisfy ALL THREE requests? Assume each strategy starts from the same initial holes and requests are served in order (no compaction, no merging after releases).",
    "examples": [
      {
        "input": "First fit — request 212K.",
        "output": "Scans holes in order: 100K too small, 500K fits → 212K goes into 500K, which shrinks to 288K. Holes: [100, 288, 200, 300].",
        "explanation": "First fit takes the FIRST hole big enough — speed comes from stopping the scan early at 500K."
      },
      {
        "input": "Best fit vs worst fit for 212K.",
        "output": "Best fit: smallest sufficient hole = 300K → leaves 88K → [100, 500, 200, 88]. Worst fit: largest hole = 500K → leaves 288K → [100, 288, 200, 300] (same as first fit this round).",
        "explanation": "Best fit minimises the leftover (88K); worst fit maximises it (288K). Different residue — and different futures."
      },
      {
        "input": "Which strategy serves all three requests?",
        "output": "After 212K: first/worst have [100,288,200,300]; best has [100,500,200,88]. Request 417K: first/worst scan — 288 < 417, 200 < 417, 300 < 417 → FAIL. Best: 500K fits → leaves 83K → [100,83,200,88]. Request 112K: best fit scans candidates 100 (too small), 83 (too small), 200 (fits, leaves 88), 88 (too small) → pushes 112K into 200K → [100,83,88,88]. BEST FIT serves all three; first fit and worst fit both fail the 417K request.",
        "explanation": "The order rescues best fit: it hoarded the 500K hole by using 300K for 212K, so 417K had a home. Strategy choice changes survivability, not just leftover sizes."
      }
    ],
    "constraints": [
      "Each strategy restarts from the ORIGINAL hole list [100, 500, 200, 300].",
      "Requests are served in the given order: 212K, 417K, 112K.",
      "A request that no hole satisfies is rejected and never retried."
    ],
    "approach": `## The Three Strategies in One Shot

\`\`\`
FIRST FIT: first hole with size ≥ request
BEST  FIT: smallest hole with size ≥ request
WORST FIT: largest hole overall (even if other holes also fit)
\`\`\`

### Full Trace — Request 212K, then 417K, then 112K

| Step | First fit | Best fit | Worst fit |
|---|---|---|---|
| initial | [100, 500, 200, 300] | same | same |
| 212K → | 500K → [100, 288, 200, 300] | 300K → [100, 500, 200, 88] | 500K → [100, 288, 200, 300] |
| 417K → | FAILS (no hole ≥ 417) | 500K → [100, 83, 200, 88] | FAILS |
| 112K → | — | 200K → [100, 83, 88, 88] | — |

Winner: **best fit** — only it keeps a large enough hole until the 417K request arrives.

### Strategy Character Sheet

| Strategy | Scan | Leftover | Risk |
|---|---|---|---|
| first fit | stops early | medium | burns big holes early |
| best fit | full scan | smallest | many tiny unusable holes → external fragmentation |
| worst fit | full scan | largest | big process may still fail if the big hole was split |

### Common Traps

❌ Best fit takes the SMALLEST SUFFICIENT hole — 200K would be used for 112K only if no smaller fits.\
❌ Worst fit takes the largest hole REGARDLESS of surplus — that is its definition.\
❌ Expensive fragmentation: a failing strategy leaves memory free but unusable — exactly the external-fragmentation signature.`,
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)"
  }
];

/* ================================================================
 * OS Quizzes (one per problem, keyed by problemSlug)
 * ================================================================ */

const osQuizzes = [
  {
    "problemSlug": "identify-the-system-call",
    "questions": [
      {
        "text": "Which system call family starts a brand-new child process?",
        "options": [
          "Process control",
          "File management",
          "Device management",
          "Communication"
        ],
        "correctIndex": 0
      },
      {
        "text": "open(), read(), write(), close() belong to which family?",
        "options": [
          "Process control",
          "File management",
          "Information maintenance",
          "Communication"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which call asks the OS for the current time?",
        "options": [
          "open()",
          "fork()",
          "time()",
          "write()"
        ],
        "correctIndex": 2
      },
      {
        "text": "A microkernel keeps the core kernel ________.",
        "options": [
          "huge",
          "tiny",
          "invisible",
          "in the user space only"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which OS type must respond within a strict deadline (e.g. airbag deployment)?",
        "options": [
          "Batch",
          "Time-sharing",
          "Real-time",
          "Mobile"
        ],
        "correctIndex": 2
      },
      {
        "text": "Two processes exchanging data with each other uses the ________ family.",
        "options": [
          "Process control",
          "File management",
          "Information maintenance",
          "Communication"
        ],
        "correctIndex": 3
      }
    ]
  },
  {
    "problemSlug": "trace-process-state-diagram",
    "questions": [
      {
        "text": "Which transition moves a process from NEW to READY?",
        "options": [
          "Dispatch",
          "Admit",
          "I/O wait",
          "Terminate"
        ],
        "correctIndex": 1
      },
      {
        "text": "A timer interrupt moves a RUNNING process to which state?",
        "options": [
          "Waiting",
          "New",
          "Ready",
          "Terminated"
        ],
        "correctIndex": 2
      },
      {
        "text": "Which transition happens when a process requests I/O?",
        "options": [
          "Running → Ready",
          "Running → Waiting",
          "Ready → Running",
          "Waiting → Ready"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which state transition is ILLEGAL in a standard process model?",
        "options": [
          "Waiting → Ready",
          "Ready → Running",
          "Running → Ready",
          "Waiting → Running"
        ],
        "correctIndex": 3
      },
      {
        "text": "The PCB (Process Control Block) primarily stores ________.",
        "options": [
          "The source code of the process",
          "Process state, registers, and scheduling info",
          "The compiled binary file",
          "The user password"
        ],
        "correctIndex": 1
      },
      {
        "text": "Who MOSTLY causes the Running → Ready transition in time-sharing systems?",
        "options": [
          "The process itself",
          "I/O device",
          "Timer interrupt",
          "User input"
        ],
        "correctIndex": 2
      },
      {
        "text": "A process is moved from Ready to Running by an action called ________.",
        "options": [
          "Dispatching",
          "Blocking",
          "Suspending",
          "Forking"
        ],
        "correctIndex": 0
      },
      {
        "text": "A process that has finished executing but its parent has not yet collected its status is in the ________ state.",
        "options": [
          "Ready",
          "Zombie",
          "Waiting",
          "Suspended"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "determine-parent-child-fork-output",
    "questions": [
      {
        "text": "Inside the child process, fork() returns ________.",
        "options": [
          "The child's PID",
          "The parent's PID",
          "0",
          "-1"
        ],
        "correctIndex": 2
      },
      {
        "text": "Inside the parent process, fork() returns ________.",
        "options": [
          "0",
          "The child's PID",
          "The parent's PID",
          "An error code"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which statement about the parent and child after fork() is TRUE?",
        "options": [
          "They are identical except for the fork() return value",
          "The child is a separate executable",
          "The parent halts",
          "They share register contents permanently"
        ],
        "correctIndex": 0
      },
      {
        "text": "A program calls fork() inside a loop N times (not recursively). How many total processes run?",
        "options": [
          "N",
          "2N",
          "N + 1",
          "2^N"
        ],
        "correctIndex": 3
      },
      {
        "text": "The order in which parent and child print after a single fork() is ________.",
        "options": [
          "Always parent first",
          "Always child first",
          "Deterministic by PID",
          "Nondeterministic (scheduler dependent)"
        ],
        "correctIndex": 3
      },
      {
        "text": "getppid() returns ________.",
        "options": [
          "The caller's own PID",
          "The parent's PID",
          "The child's PID",
          "The shell's PID"
        ],
        "correctIndex": 1
      },
      {
        "text": "If the parent exits before the child, the child is said to be ________.",
        "options": [
          "Orphaned",
          "Woken",
          "Reborn",
          "Swapped"
        ],
        "correctIndex": 0
      },
      {
        "text": "A zombie process is one that ________.",
        "options": [
          "Is executing rapidly",
          "Has terminated but the parent hasn't reaped its status",
          "Is blocked on I/O",
          "Is waiting for a child"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "compare-multithreading-models",
    "questions": [
      {
        "text": "In the many-to-one model, if one thread blocks on a system call, ________.",
        "options": [
          "Only that thread blocks",
          "The entire process blocks",
          "The kernel runs the thread",
          "A new process is created"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which model maps each user thread to a kernel thread allowing true parallelism?",
        "options": [
          "Many-to-one",
          "One-to-one",
          "Many-to-many",
          "None of these"
        ],
        "correctIndex": 1
      },
      {
        "text": "The main DISADVANTAGE of the one-to-one model is ________.",
        "options": [
          "No parallelism",
          "High overhead in creating kernel threads",
          "Kernel doesn't see threads",
          "Threads can't communicate"
        ],
        "correctIndex": 1
      },
      {
        "text": "Linux and Windows typically implement ________ mapping.",
        "options": [
          "Many-to-one",
          "One-to-one",
          "Many-to-many",
          "One-to-many"
        ],
        "correctIndex": 1
      },
      {
        "text": "Threads of the same process share ________ but NOT ________.",
        "options": [
          "Address space; global variables",
          "Registers; code",
          "Address space (code/data/heap); their own stack and registers",
          "Stack; register set"
        ],
        "correctIndex": 2
      },
      {
        "text": "Context switching between threads of the SAME process is ________ than between processes.",
        "options": [
          "Slower",
          "Faster",
          "Equal",
          "Not possible"
        ],
        "correctIndex": 1
      },
      {
        "text": "User-level threads are managed ________.",
        "options": [
          "By the kernel scheduler",
          "By a library in user space without kernel support",
          "Only by hardware",
          "By BIOS"
        ],
        "correctIndex": 1
      },
      {
        "text": "A multi-threaded web server benefits from threads because ________.",
        "options": [
          "Threads are slower than processes",
          "Independent requests can execute concurrently with shared data",
          "Threads use more memory",
          "Threads run only one at a time"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "identify-threading-model-scenario",
    "questions": [
      {
        "text": "Which threading model most limits concurrency because a single blocking kernel call blocks all user threads?",
        "options": [
          "One-to-one",
          "Many-to-one",
          "Many-to-many",
          "Two-level"
        ],
        "correctIndex": 1
      },
      {
        "text": "Java's thread implementation typically maps to ________.",
        "options": [
          "User threads only",
          "Kernel threads via one-to-one",
          "Hardware threads",
          "No threads"
        ],
        "correctIndex": 1
      },
      {
        "text": "The many-to-many model allows ________.",
        "options": [
          "More user threads than kernel threads with scheduling flexibility",
          "Only one kernel thread",
          "No user threads",
          "Threads only in kernel space"
        ],
        "correctIndex": 0
      },
      {
        "text": "________ is a benefit of using a thread pool.",
        "options": [
          "More memory per request",
          "Reusing existing threads reduces creation overhead",
          "Threads never need synchronization",
          "Slower response times"
        ],
        "correctIndex": 1
      },
      {
        "text": "Thread-local storage (TLS) allows ________.",
        "options": [
          "All threads to share one variable",
          "Each thread to have its own private copy of data",
          "Threads to be invisible",
          "Only kernel to access data"
        ],
        "correctIndex": 1
      },
      {
        "text": "Deferred thread cancellation means ________.",
        "options": [
          "The thread is killed immediately",
          "The thread checks a flag and terminates at a safe point",
          "Cancellation can never occur",
          "The OS must restart the thread"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which issue is a THREAD-specific problem (not process)?",
        "options": [
          "Debugging shared global variables across threads",
          "Filesystem layout",
          "Swap space allocation",
          "Page table ownership"
        ],
        "correctIndex": 0
      },
      {
        "text": "A signal delivered to a process with multiple threads is handled by ________.",
        "options": [
          "All threads at once",
          "A specific thread chosen by the system (varies by implementation)",
          "No thread",
          "The BIOS"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "design-ipc-mechanism-scenario",
    "questions": [
      {
        "text": "Which IPC method is typically FASTEST?",
        "options": [
          "Message passing",
          "Shared memory",
          "Sockets over network",
          "Pipes across machines"
        ],
        "correctIndex": 1
      },
      {
        "text": "The advantage of message passing over shared memory is ________.",
        "options": [
          "It's slower",
          "No race conditions on shared data need manual synchronization",
          "It uses more memory",
          "It requires shared variables"
        ],
        "correctIndex": 1
      },
      {
        "text": "A pipe provides ________.",
        "options": [
          "Bidirectional communication",
          "Unidirectional (one-way) data flow",
          "Network-wide communication",
          "Shared variable access"
        ],
        "correctIndex": 1
      },
      {
        "text": "In a bounded-buffer producer-consumer using shared memory, producers and consumers MUST ________.",
        "options": [
          "Synchronize access to the buffer",
          "Use pipes instead",
          "Run in the kernel",
          "Use sockets"
        ],
        "correctIndex": 0
      },
      {
        "text": "In message passing, the operations are ________.",
        "options": [
          "fork and exec",
          "read and write",
          "send(message) and receive(message)",
          "lock and unlock"
        ],
        "correctIndex": 2
      },
      {
        "text": "Mailboxes (ports) in message passing are an example of ________ communication.",
        "options": [
          "Direct",
          "Indirect",
          "Synchronous-only",
          "Shared"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which IPC is most suitable for communicating across DIFFERENT machines?",
        "options": [
          "Shared memory",
          "Message passing over a network (e.g., sockets)",
          "Ordinary pipe",
          "A global variable"
        ],
        "correctIndex": 1
      },
      {
        "text": "A producer-consumer problem solved with shared memory REQUIRES a shared ________ to prevent races.",
        "options": [
          "Buffer and synchronization mechanism",
          "Only a global counter without sync",
          "Data structure only",
          "Signal handler"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "problemSlug": "trace-piped-command-sequence",
    "questions": [
      {
        "text": "A call to pipe() creates ________.",
        "options": [
          "One file descriptor",
          "Two file descriptors (read end and write end)",
          "A socket pair",
          "A temporary file"
        ],
        "correctIndex": 1
      },
      {
        "text": "In `ps aux | grep ssh`, data flows ________.",
        "options": [
          "grep → ps",
          "ps → grep",
          "Both directions simultaneously",
          "From the kernel to both"
        ],
        "correctIndex": 1
      },
      {
        "text": "If a process writes to a pipe whose read end is closed, it receives ________.",
        "options": [
          "0 bytes",
          "SIGPIPE (broken pipe) and terminates",
          "An error code only",
          "A new pipe"
        ],
        "correctIndex": 1
      },
      {
        "text": "To make a pipe bidirectional between two processes, you need ________.",
        "options": [
          "One pipe",
          "Two pipes",
          "A socket only",
          "Shared memory only"
        ],
        "correctIndex": 1
      },
      {
        "text": "A named pipe (FIFO) differs from an ordinary pipe because ________.",
        "options": [
          "It's faster",
          "It has a filesystem name and can be used by unrelated processes",
          "It's only in memory",
          "It cannot be used for data"
        ],
        "correctIndex": 1
      },
      {
        "text": "In a shell pipeline, the child process reading from the pipe ________.",
        "options": [
          "Should close the write end",
          "Should keep both ends open",
          "Must write too",
          "Cannot read"
        ],
        "correctIndex": 0
      },
      {
        "text": "Before the fork that creates pipeline children, the parent should ________.",
        "options": [
          "Create the pipe first, then fork",
          "Fork first, then create the pipe",
          "Only create sockets",
          "Not close any descriptors"
        ],
        "correctIndex": 0
      },
      {
        "text": "A shell command `cat file | wc -l` — the number of pipes is ________.",
        "options": [
          "0",
          "1",
          "2",
          "Unknown"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "calculate-waiting-turnaround-time",
    "questions": [
      {
        "text": "Turnaround time = ________.",
        "options": [
          "Completion time − arrival time",
          "Start time − burst time",
          "Completion time + burst time",
          "Waiting time + arrival time"
        ],
        "correctIndex": 0
      },
      {
        "text": "Waiting time = ________.",
        "options": [
          "Completion time − burst time",
          "Turnaround time − burst time",
          "Start time + burst time",
          "Turnaround time + burst time"
        ],
        "correctIndex": 1
      },
      {
        "text": "FCFS: processes arrive in order P1 (burst 24), P2 (burst 3), P3 (burst 3). P2's turnaround time is ________.",
        "options": [
          "3",
          "24",
          "27",
          "30"
        ],
        "correctIndex": 2
      },
      {
        "text": "FCFS: P1=24, P2=3, P3=3 (that order). The AVERAGE waiting time is ________.",
        "options": [
          "0",
          "17",
          "27",
          "30"
        ],
        "correctIndex": 1
      },
      {
        "text": "The convoy effect in FCFS happens when ________.",
        "options": [
          "A short process precedes long ones",
          "A long CPU-bound process blocks short processes behind it",
          "All processes are equal",
          "The CPU is idle"
        ],
        "correctIndex": 1
      },
      {
        "text": "Compared to FCFS, SJF typically gives ________ average waiting time.",
        "options": [
          "Higher",
          "Lower",
          "Identical",
          "Indeterminate"
        ],
        "correctIndex": 1
      },
      {
        "text": "FCFS: P1 burst 4 arrives at 0, P2 burst 2 arrives at 1, P3 burst 5 arrives at 2. P1's completion time is ________.",
        "options": [
          "0",
          "4",
          "6",
          "11"
        ],
        "correctIndex": 1
      },
      {
        "text": "A process with burst 5 arriving at time 0 alone: waiting time = ________.",
        "options": [
          "0",
          "5",
          "10",
          "Depends on quantum"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "problemSlug": "compute-schedule-sjf",
    "questions": [
      {
        "text": "SJF always selects the process with ________.",
        "options": [
          "Highest priority number",
          "Smallest next CPU burst",
          "Largest burst",
          "Earliest arrival"
        ],
        "correctIndex": 1
      },
      {
        "text": "Preemptive SJF is also called ________.",
        "options": [
          "Priority scheduling",
          "Shortest-Remaining-Time-First (SRTF)",
          "Round robin",
          "Multilevel queue"
        ],
        "correctIndex": 1
      },
      {
        "text": "SJF is provably optimal with respect to ________.",
        "options": [
          "Average waiting time",
          "CPU utilization",
          "Response time of longest job",
          "Memory usage"
        ],
        "correctIndex": 0
      },
      {
        "text": "A significant DISADVANTAGE of SJF is ________.",
        "options": [
          "It never preempts",
          "Starvation of long jobs",
          "It needs no burst estimates",
          "It can't be implemented"
        ],
        "correctIndex": 1
      },
      {
        "text": "In practice SJF requires ________ because future bursts are unknown.",
        "options": [
          "A perfect crystal ball",
          "Predicting burst lengths (e.g., exponential averaging)",
          "The user to specify it",
          "No estimates"
        ],
        "correctIndex": 1
      },
      {
        "text": "Nonpreemptive SJF: P1 burst 6, P2 burst 8, P3 burst 7, P4 burst 3 (all arrive at 0). The schedule order is ________.",
        "options": [
          "P1, P2, P3, P4",
          "P4, P1, P3, P2",
          "P1, P3, P2, P4",
          "P2, P3, P1, P4"
        ],
        "correctIndex": 1
      },
      {
        "text": "SRTF: processes arrive — P1 (burst 8) at 0, P2 (burst 4) at 1. What happens at time 1?",
        "options": [
          "P1 continues",
          "P2 preempts P1 (remaining 7 vs 4)",
          "Both run",
          "CPU idles"
        ],
        "correctIndex": 1
      },
      {
        "text": "If two processes have identical burst lengths under SJF, the tie is broken by ________.",
        "options": [
          "Priority always",
          "Arrival order (typically)",
          "Random choice",
          "Larger PID"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "compute-schedule-priority",
    "questions": [
      {
        "text": "In the common convention, a LOWER priority number means ________.",
        "options": [
          "Higher priority",
          "Lower priority",
          "No priority",
          "It depends on the quantum"
        ],
        "correctIndex": 0
      },
      {
        "text": "Starvation in priority scheduling is solved by ________.",
        "options": [
          "Increasing the quantum",
          "Aging (gradually increasing priority of waiting processes)",
          "Using FCFS instead",
          "Removing priorities"
        ],
        "correctIndex": 1
      },
      {
        "text": "Aging works by ________.",
        "options": [
          "Decreasing burst time",
          "Increasing a waiting process's priority over time",
          "Shutting down low-priority processes",
          "Moving all to ready queue"
        ],
        "correctIndex": 1
      },
      {
        "text": "Internal priorities are defined by ________.",
        "options": [
          "The OS rules (memory, burst estimates)",
          "Environmental factors outside the system",
          "The user's salary",
          "Hardware serial number"
        ],
        "correctIndex": 0
      },
      {
        "text": "Priority scheduling can be ________.",
        "options": [
          "Only nonpreemptive",
          "Either preemptive or nonpreemptive",
          "Only round robin",
          "Only random"
        ],
        "correctIndex": 1
      },
      {
        "text": "Priority scheduling: P1 (priority 3), P2 (priority 1), P3 (priority 4), P4 (priority 2), all arrive at 0. Execution order (lower number = higher priority) is ________.",
        "options": [
          "P1, P2, P3, P4",
          "P2, P4, P1, P3",
          "P4, P2, P1, P3",
          "P1, P4, P2, P3"
        ],
        "correctIndex": 1
      },
      {
        "text": "Combining SJF with priority scheduling: the process with ________ gets the highest priority.",
        "options": [
          "Longest burst",
          "Shortest next CPU burst",
          "Largest PID",
          "Lowest memory"
        ],
        "correctIndex": 1
      },
      {
        "text": "An example of external priority is ________.",
        "options": [
          "Memory requirements",
          "Process importance set by the user/accounting policies",
          "Burst estimate",
          "Time quantum"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "compute-schedule-round-robin",
    "questions": [
      {
        "text": "In Round Robin, each process runs for at most ________.",
        "options": [
          "Its full burst",
          "A fixed time quantum q",
          "Until I/O",
          "8 hours"
        ],
        "correctIndex": 1
      },
      {
        "text": "RR with a VERY LARGE quantum q degenerates into ________.",
        "options": [
          "SJF",
          "FCFS",
          "Priority scheduling",
          "MLFQ"
        ],
        "correctIndex": 1
      },
      {
        "text": "RR guarantees each process waits at most ________ before its turn.",
        "options": [
          "q",
          "(n − 1) × q",
          "n × q²",
          "Infinite"
        ],
        "correctIndex": 1
      },
      {
        "text": "RR with quantum q=4: P1 burst 24, P2 burst 3, P3 burst 3. P2 completes at time ________.",
        "options": [
          "7",
          "11",
          "15",
          "30"
        ],
        "correctIndex": 0
      },
      {
        "text": "RR: P1 burst 24, P2 burst 3, P3 burst 3, q=4. P3 completes before P1 because ________.",
        "options": [
          "P3 has higher priority",
          "P3's remaining burst fits in its next quantum slice",
          "P1 is starved",
          "P3 preempts P1 forever"
        ],
        "correctIndex": 1
      },
      {
        "text": "A very SMALL quantum q increases ________.",
        "options": [
          "Response time",
          "Context-switch overhead",
          "Turnaround time guarantee",
          "Memory usage"
        ],
        "correctIndex": 1
      },
      {
        "text": "RR: P1 (24), P2 (3), P3 (3) with q=4, P1 runs first. The completion order is ________.",
        "options": [
          "P1, P2, P3",
          "P2, P3, P1",
          "P3, P2, P1",
          "P1, P3, P2"
        ],
        "correctIndex": 1
      },
      {
        "text": "The typical RR turnaround time for the set P1=24, P2=3, P3=3, q=4 is ________ compared to SJF.",
        "options": [
          "Lower",
          "Higher",
          "Equal",
          "Zero"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "trace-multilevel-feedback-queue",
    "questions": [
      {
        "text": "In MLFQ, a process that exhausts its time quantum in the top queue is ________.",
        "options": [
          "Terminated",
          "Demoted to a lower-priority queue",
          "Promoted",
          "Given infinite time"
        ],
        "correctIndex": 1
      },
      {
        "text": "In MLFQ, the CPU always services ________ first.",
        "options": [
          "The lowest queue",
          "The highest-priority (top) queue that is nonempty",
          "A random queue",
          "The last queue"
        ],
        "correctIndex": 1
      },
      {
        "text": "I/O-bound processes in MLFQ tend to ________.",
        "options": [
          "Get demoted quickly",
          "Stay in the top queue (they rarely exhaust the quantum)",
          "Never execute",
          "Get starved"
        ],
        "correctIndex": 1
      },
      {
        "text": "MLFQ prevents starvation via ________.",
        "options": [
          "Aging or periodic priority boosts",
          "Killing old processes",
          "Larger memory",
          "No mechanism"
        ],
        "correctIndex": 0
      },
      {
        "text": "A new process entering MLFQ starts in ________.",
        "options": [
          "The top-priority queue with the smallest quantum",
          "The bottom queue",
          "Any queue at random",
          "A separate queue"
        ],
        "correctIndex": 0
      },
      {
        "text": "A process that completes its work within a small slice at the top queue is treated as ________.",
        "options": [
          "CPU-bound",
          "Interactive (short burst)",
          "Dead",
          "Suspended"
        ],
        "correctIndex": 1
      },
      {
        "text": "The time quantum in MLFQ typically ________ as you go down the queues.",
        "options": [
          "Decreases",
          "Increases (doubles)",
          "Stays constant",
          "Is random"
        ],
        "correctIndex": 1
      },
      {
        "text": "MLFQ's key advantage over plain RR is ________.",
        "options": [
          "It needs no priorities",
          "It adapts to process behavior without prior knowledge",
          "It's easier to code",
          "It uses zero CPU"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "identify-critical-section-violation",
    "questions": [
      {
        "text": "Mutual exclusion requires that ________.",
        "options": [
          "All processes enter the critical section together",
          "At most one process executes in the critical section at a time",
          "No process ever waits",
          "The critical section is empty"
        ],
        "correctIndex": 1
      },
      {
        "text": "The PROGRESS requirement means ________.",
        "options": [
          "No process outside the critical section can block others indefinitely",
          "Processes must run faster",
          "Only the OS may choose the next",
          "The critical section never ends"
        ],
        "correctIndex": 0
      },
      {
        "text": "Bounded waiting guarantees ________.",
        "options": [
          "All processes finish",
          "A bound on how long a process may wait to enter its critical section",
          "No waiting at all",
          "The CPU never idles"
        ],
        "correctIndex": 1
      },
      {
        "text": "A race condition occurs when ________.",
        "options": [
          "Two processes are fast",
          "The outcome depends on the timing/interleaving of accesses to shared data",
          "A process uses a mutex",
          "The CPU is single-core"
        ],
        "correctIndex": 1
      },
      {
        "text": "When two processes increment a shared counter without synchronization (load, add, store interleaved), the counter can ________.",
        "options": [
          "Only increment correctly",
          "Increment incorrectly (lost update)",
          "Never change",
          "Always double"
        ],
        "correctIndex": 1
      },
      {
        "text": "Peterson's solution provides mutual exclusion for ________.",
        "options": [
          "Any number of processes",
          "Exactly two processes",
          "Only kernel threads",
          "Only single-core systems"
        ],
        "correctIndex": 1
      },
      {
        "text": "Hardware instructions like test-and-set support synchronization by ________.",
        "options": [
          "Doing the test and set atomically",
          "Slowing the CPU",
          "Pausing interrupts only in software",
          "Requiring user cooperation"
        ],
        "correctIndex": 0
      },
      {
        "text": "If one process is swapped out of the CPU inside the critical section in a single-core system, other processes ________.",
        "options": [
          "Can enter concurrently",
          "Cannot run at all",
          "Are safe because preemption can also resume later (no parallel execution)",
          "Die"
        ],
        "correctIndex": 2
      }
    ]
  },
  {
    "problemSlug": "solve-producer-consumer-semaphores",
    "questions": [
      {
        "text": "A counting semaphore's value represents ________.",
        "options": [
          "The number of available resources",
          "The process PID",
          "The buffer size",
          "The number of CPUs"
        ],
        "correctIndex": 0
      },
      {
        "text": "The wait() operation ________ on a semaphore.",
        "options": [
          "Increments",
          "Decrements",
          "Multiplies",
          "Resets"
        ],
        "correctIndex": 1
      },
      {
        "text": "In the bounded-buffer solution (N slots), the semaphore 'empty' is initialized to ________.",
        "options": [
          "0",
          "1",
          "N",
          "N/2"
        ],
        "correctIndex": 2
      },
      {
        "text": "In the bounded-buffer solution, the producer does ________.",
        "options": [
          "wait(full); produce/signal(empty)",
          "wait(empty); produce/signal(full)",
          "wait(empty); wait(mutex); produce/signal(full); signal(mutex)",
          "signal(empty); produce/wait(full)"
        ],
        "correctIndex": 2
      },
      {
        "text": "If the producer waits on full instead of empty when the buffer is full, ________.",
        "options": [
          "It is correct",
          "It deadlocks or corrupts the buffer",
          "It runs faster",
          "Nothing changes"
        ],
        "correctIndex": 1
      },
      {
        "text": "The mutex semaphore in producer-consumer protects ________.",
        "options": [
          "The producer's code",
          "Access to the shared buffer (mutual exclusion)",
          "The scheduler",
          "The consumer only"
        ],
        "correctIndex": 1
      },
      {
        "text": "A binary semaphore is also called a ________.",
        "options": [
          "Counting lock",
          "Mutex lock",
          "Spinlock",
          "Condition variable"
        ],
        "correctIndex": 1
      },
      {
        "text": "A spinlock (busy wait) is preferred when ________.",
        "options": [
          "The critical section is long",
          "The wait is expected to be very short and multiprocessor",
          "Memory is tight",
          "There is one core"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "solve-readers-writers-problem",
    "questions": [
      {
        "text": "In the readers-writers problem, multiple readers ________.",
        "options": [
          "Must be serialized",
          "Can read the shared data simultaneously",
          "Cannot read",
          "Need a writer lock to read"
        ],
        "correctIndex": 1
      },
      {
        "text": "A writer can enter the critical section only when ________.",
        "options": [
          "At least one reader is reading",
          "No readers are currently reading",
          "The buffer is empty",
          "The timer allows it"
        ],
        "correctIndex": 1
      },
      {
        "text": "In the classic solution, the FIRST reader (rcount 0→1) must ________ to block writers.",
        "options": [
          "wait on rw_mutex (write lock)",
          "Sleep forever",
          "Increment a counter only",
          "Read without locking"
        ],
        "correctIndex": 0
      },
      {
        "text": "In the classic solution, the LAST reader (rcount reaches 0) must ________.",
        "options": [
          "signal rw_mutex so a writer may proceed",
          "wait rw_mutex",
          "Restart the system",
          "Wake all writers"
        ],
        "correctIndex": 0
      },
      {
        "text": "The main FLAW of the classic first-reader-wins solution is ________.",
        "options": [
          "Readers starve writers",
          "Writers starve readers",
          "It crashes",
          "It uses no locks"
        ],
        "correctIndex": 0
      },
      {
        "text": "The readers-writers problem uses the shared variable readcount which must be protected by a ________.",
        "options": [
          "Write lock",
          "Mutex (mutex lock)",
          "Counting semaphore for readers",
          "Timer"
        ],
        "correctIndex": 1
      },
      {
        "text": "The readers-writers problem is a typical ________.",
        "options": [
          "Scheduling problem",
          "Synchronization (concurrency control) problem",
          "Memory problem",
          "I/O problem"
        ],
        "correctIndex": 1
      },
      {
        "text": "A reader-writer lock has ________ modes.",
        "options": [
          "One",
          "Two (shared read mode and exclusive write mode)",
          "Three",
          "Zero"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "solve-dining-philosophers-problem",
    "questions": [
      {
        "text": "The classic dining philosophers problem has ________ philosophers around a table.",
        "options": [
          "2",
          "5",
          "8",
          "Unlimited"
        ],
        "correctIndex": 1
      },
      {
        "text": "The deadlock scenario happens when ________.",
        "options": [
          "All philosophers put down chopsticks",
          "Each philosopher picks up the left chopstick simultaneously",
          "One philosopher eats forever",
          "No philosophers are hungry"
        ],
        "correctIndex": 1
      },
      {
        "text": "Adding the rule 'a philosopher may pick up chopsticks only if both are available' prevents deadlock by breaking ________.",
        "options": [
          "Mutual exclusion",
          "Hold and wait",
          "No preemption",
          "Circular wait"
        ],
        "correctIndex": 1
      },
      {
        "text": "Limiting the table to at most 4 philosophers eating at once breaks ________.",
        "options": [
          "Circular wait",
          "Mutual exclusion",
          "The dinner",
          "Memory"
        ],
        "correctIndex": 0
      },
      {
        "text": "The odd-even rule (odd philosophers pick right first, even pick left first) prevents ________.",
        "options": [
          "Starvation",
          "Deadlock",
          "Swapping",
          "Interrupts"
        ],
        "correctIndex": 1
      },
      {
        "text": "Each chopstick in the semaphore solution is modeled as ________.",
        "options": [
          "A counting semaphore of value N",
          "A binary semaphore initialized to 1",
          "A pipe",
          "A mutex of value 0"
        ],
        "correctIndex": 1
      },
      {
        "text": "The philosophers problem demonstrates ________ in the naive solution.",
        "options": [
          "Deadlock (all four conditions satisfied)",
          "Only starvation",
          "Only memory leaks",
          "No concurrency at all"
        ],
        "correctIndex": 0
      },
      {
        "text": "A monitor-based solution uses condition variables so a philosopher ________.",
        "options": [
          "Eats without leaving the room",
          "Waits for both chopsticks then eats, signals after putting them down",
          "Never waits",
          "Uses no shared state"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "identify-deadlock-condition-violated",
    "questions": [
      {
        "text": "Mutual exclusion can be broken in practice by ________.",
        "options": [
          "Making the resource shareable (e.g., spooling printers)",
          "Requesting resources in order",
          "Forcibly taking resources",
          "Asking for all resources at once"
        ],
        "correctIndex": 0
      },
      {
        "text": "Requiring a process to request ALL resources before starting breaks ________.",
        "options": [
          "Hold and wait",
          "Mutual exclusion",
          "Circular wait only",
          "Preemption"
        ],
        "correctIndex": 0
      },
      {
        "text": "Allowing the OS to take a resource back from a sleeping process breaks ________.",
        "options": [
          "Mutual exclusion",
          "No preemption",
          "Hold and wait",
          "Circular wait"
        ],
        "correctIndex": 1
      },
      {
        "text": "Numbering resources and requiring ascending requests breaks ________.",
        "options": [
          "Circular wait",
          "Mutual exclusion",
          "Hold and wait",
          "No preemption"
        ],
        "correctIndex": 0
      },
      {
        "text": "Why can't a printer simply abandon mutual exclusion?",
        "options": [
          "It is too slow",
          "Two processes cannot share a printer's platen meaningfully",
          "Printers are deadlock-free",
          "The OS forbids it"
        ],
        "correctIndex": 1
      },
      {
        "text": "The drawback of 'request all resources upfront' is ________.",
        "options": [
          "Lower average waiting time",
          "Low resource utilization (resources tied up while idle)",
          "Faster execution",
          "Less memory"
        ],
        "correctIndex": 1
      },
      {
        "text": "All four conditions are ________ for deadlock to occur.",
        "options": [
          "Optional",
          "Necessary",
          "Impossible",
          "Only two required"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which condition is the HARDEST to break in real systems?",
        "options": [
          "Mutual exclusion (for exclusive devices)",
          "Circular wait",
          "No preemption",
          "Hold and wait"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "problemSlug": "apply-bankers-algorithm",
    "questions": [
      {
        "text": "The Banker's algorithm is a ________ technique.",
        "options": [
          "Deadlock prevention",
          "Deadlock avoidance",
          "Deadlock detection",
          "Recovery"
        ],
        "correctIndex": 1
      },
      {
        "text": "Need = ________.",
        "options": [
          "Max − Allocation",
          "Allocation − Max",
          "Available − Max",
          "Max + Allocation"
        ],
        "correctIndex": 0
      },
      {
        "text": "A state is SAFE if ________.",
        "options": [
          "There is free memory",
          "There EXISTS a sequence where every process can finish",
          "No process waits",
          "All resources are allocated"
        ],
        "correctIndex": 1
      },
      {
        "text": "Before granting request R, the check order is ________.",
        "options": [
          "R ≤ Available, R ≤ Need, safety",
          "R ≤ Need, R ≤ Available, safety",
          "Safety first, then R ≤ Need",
          "Only R ≤ Available"
        ],
        "correctIndex": 1
      },
      {
        "text": "If a request passes the first two checks but the trial state is unsafe, the request is ________.",
        "options": [
          "Granted",
          "Denied and the process must wait",
          "Split in half",
          "Always granted later"
        ],
        "correctIndex": 1
      },
      {
        "text": "An unsafe state ________.",
        "options": [
          "Always deadlocks",
          "MAY deadlock (no guarantee of completion)",
          "Never deadlocks",
          "Is a hardware error"
        ],
        "correctIndex": 1
      },
      {
        "text": "The Banker's algorithm requires ________.",
        "options": [
          "No extra knowledge",
          "Each process to declare its MAXIMUM resource need in advance",
          "The process to finish instantly",
          "A single resource type"
        ],
        "correctIndex": 1
      },
      {
        "text": "In the safety algorithm, a process can proceed when its Need ≤ ________.",
        "options": [
          "Allocation",
          "Work (currently available)",
          "Total resources",
          "Zero"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "detect-deadlock-resource-allocation-graph",
    "questions": [
      {
        "text": "In a single-instance RAG, deadlock exists if and only if ________.",
        "options": [
          "There is any edge",
          "There is a cycle",
          "All nodes are red",
          "There is no edge"
        ],
        "correctIndex": 1
      },
      {
        "text": "A request edge points from ________.",
        "options": [
          "Resource to process",
          "Process to resource",
          "Process to process",
          "Resource to resource"
        ],
        "correctIndex": 1
      },
      {
        "text": "An assignment edge points from ________.",
        "options": [
          "Process to resource",
          "Resource to process",
          "Process to process",
          "A device to another"
        ],
        "correctIndex": 1
      },
      {
        "text": "For MULTI-instance resources, ________.",
        "options": [
          "Cycle ⟺ deadlock still holds",
          "A cycle may NOT mean deadlock — use the matrix detection algorithm",
          "Deadlock never happens",
          "Detection is impossible"
        ],
        "correctIndex": 1
      },
      {
        "text": "The wait-for graph contains ________.",
        "options": [
          "Processes and resources",
          "Only processes (edges represent waiting on another process)",
          "Only resources",
          "Nothing"
        ],
        "correctIndex": 1
      },
      {
        "text": "A process holding a resource and requesting NOTHING is ________.",
        "options": [
          "Deadlocked",
          "Not deadlocked (it can finish)",
          "Zombie",
          "Suspended"
        ],
        "correctIndex": 1
      },
      {
        "text": "Running deadlock detection frequently has the disadvantage of ________.",
        "options": [
          "Causing deadlock",
          "Overhead — and a detected deadlock requires recovery anyway",
          "Freeing memory",
          "Speeding processes"
        ],
        "correctIndex": 1
      },
      {
        "text": "The matrix-based deadlock detection algorithm is essentially like the Banker's safety check but ________.",
        "options": [
          "Uses Request matrix instead of Need",
          "Ignores allocation",
          "Runs only once",
          "Needs no available vector"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "problemSlug": "apply-best-worst-first-fit",
    "questions": [
      {
        "text": "First-fit allocates the ________.",
        "options": [
          "Largest sufficient hole",
          "First hole big enough (scanning from start)",
          "Smallest sufficient hole",
          "Any random hole"
        ],
        "correctIndex": 1
      },
      {
        "text": "Best-fit allocates the ________.",
        "options": [
          "First sufficient hole",
          "Largest hole",
          "Smallest sufficient hole (least leftover)",
          "Closest numbered hole"
        ],
        "correctIndex": 2
      },
      {
        "text": "Worst-fit allocates the ________.",
        "options": [
          "Largest hole",
          "Smallest hole",
          "First hole",
          "Middle hole"
        ],
        "correctIndex": 0
      },
      {
        "text": "External fragmentation means ________.",
        "options": [
          "Total free space is small",
          "Total free space is enough but split into unusable small holes",
          "Memory is full",
          "The disk is fragmented"
        ],
        "correctIndex": 1
      },
      {
        "text": "One remedy for external fragmentation is ________.",
        "options": [
          "Compaction (moving processes to gather free space)",
          "Deleting processes",
          "Buying more RAM only",
          "Disabling paging"
        ],
        "correctIndex": 0
      },
      {
        "text": "Best-fit tends to create ________.",
        "options": [
          "Many large holes",
          "Many tiny fragments, lowering future usability",
          "No fragmentation",
          "Larger processes"
        ],
        "correctIndex": 1
      },
      {
        "text": "Holes: [100, 500, 200, 300]. A request of 212K under first-fit lands in the ________ hole.",
        "options": [
          "100K (rejected)",
          "500K",
          "200K",
          "300K"
        ],
        "correctIndex": 1
      },
      {
        "text": "Holes: [100, 500, 200, 300]. A request of 212K under best-fit lands in the ________ hole.",
        "options": [
          "100K",
          "500K",
          "200K",
          "300K"
        ],
        "correctIndex": 3
      }
    ]
  }
];

/* ================================================================
 * OS Meta — categories, topics, and companies
 * (type/value pair must be unique — see OsMeta index)
 * ================================================================ */

const osMetaData = [
  { "type": "category", "value": "os-fundamentals-process-management", "label": "OS Fundamentals & Process Management", "order": 1 },
  { "type": "category", "value": "cpu-scheduling-synchronization-deadlocks", "label": "CPU Scheduling, Synchronization & Deadlocks", "order": 2 },
  { "type": "category", "value": "memory-management", "label": "Memory Management", "order": 3 },
  { "type": "category", "value": "storage-file-systems-io", "label": "Storage, File Systems & I/O", "order": 4 },
  { "type": "topic", "value": "os-functions-types", "label": "OS Functions & Types", "order": 1 },
  { "type": "topic", "value": "system-calls-os-structure", "label": "System Calls & OS Structure", "order": 2 },
  { "type": "topic", "value": "process-states-pcb", "label": "Process States & PCB", "order": 3 },
  { "type": "topic", "value": "process-creation-termination", "label": "Process Creation & Termination", "order": 4 },
  { "type": "topic", "value": "threads-vs-processes", "label": "Threads vs Processes", "order": 5 },
  { "type": "topic", "value": "multithreading-models", "label": "Multithreading Models", "order": 6 },
  { "type": "topic", "value": "shared-memory-message-passing", "label": "Shared Memory & Message Passing", "order": 7 },
  { "type": "topic", "value": "pipes-signals", "label": "Pipes & Signals", "order": 8 },
  { "type": "topic", "value": "scheduling-criteria-concepts", "label": "Scheduling Criteria & Concepts", "order": 9 },
  { "type": "topic", "value": "fcfs-sjf-scheduling", "label": "FCFS & SJF Scheduling", "order": 10 },
  { "type": "topic", "value": "priority-scheduling", "label": "Priority Scheduling", "order": 11 },
  { "type": "topic", "value": "round-robin-scheduling", "label": "Round Robin Scheduling", "order": 12 },
  { "type": "topic", "value": "multilevel-queue-feedback-queue", "label": "Multilevel & Feedback Queues", "order": 13 },
  { "type": "topic", "value": "multiprocessor-scheduling", "label": "Multiprocessor Scheduling", "order": 14 },
  { "type": "topic", "value": "critical-section-problem", "label": "The Critical Section Problem", "order": 15 },
  { "type": "topic", "value": "semaphores-mutex-locks", "label": "Semaphores & Mutex Locks", "order": 16 },
  { "type": "topic", "value": "readers-writers-problem", "label": "Readers-Writers Problem", "order": 17 },
  { "type": "topic", "value": "dining-philosophers-problem", "label": "Dining Philosophers Problem", "order": 18 },
  { "type": "topic", "value": "deadlock-conditions-prevention", "label": "Deadlock Conditions & Prevention", "order": 19 },
  { "type": "topic", "value": "deadlock-avoidance-bankers", "label": "Deadlock Avoidance & Banker's Algorithm", "order": 20 },
  { "type": "topic", "value": "deadlock-detection-algorithms", "label": "Deadlock Detection Algorithms", "order": 21 },
  { "type": "topic", "value": "deadlock-recovery-strategies", "label": "Deadlock Recovery Strategies", "order": 22 },
  { "type": "topic", "value": "contiguous-memory-allocation", "label": "Contiguous Memory Allocation", "order": 23 },
  { "type": "topic", "value": "fragmentation", "label": "Fragmentation", "order": 24 },
  { "type": "company", "value": "amazon", "label": "Amazon", "order": 1 },
  { "type": "company", "value": "google", "label": "Google", "order": 2 },
  { "type": "company", "value": "microsoft", "label": "Microsoft", "order": 3 },
  { "type": "company", "value": "oracle", "label": "Oracle", "order": 4 },
  { "type": "company", "value": "ibm", "label": "IBM", "order": 5 }
];

/* ================================================================
 * Seed Runner
 * ================================================================ */

export async function runSeed() {
  console.log('[SEED-OS] Starting OS content seed...');

  /*
   * Clear ONLY the OS collections (+ OS quizzes).
   * Progress, QuizAttempt, and all other subjects' content are
   * deliberately left untouched.
   */
  console.log('[SEED-OS] Clearing existing OS data...');
  await Promise.all([
    OsLesson.deleteMany({}),
    OsSubtopic.deleteMany({}),
    OsProblem.deleteMany({}),
    OsMeta.deleteMany({}),
    Quiz.deleteMany({ problemModel: 'OsProblem' })
  ]);
  console.log('[SEED-OS] Existing OS data cleared');

  console.log('[SEED-OS] Seeding OS lessons...');
  await OsLesson.insertMany(osLessons);
  console.log('[SEED-OS] Seeding OS subtopics...');
  await OsSubtopic.insertMany(osSubtopics);
  console.log('[SEED-OS] Seeding OS problems...');
  await OsProblem.insertMany(osProblems);
  console.log('[SEED-OS] Seeding OS meta...');
  await OsMeta.insertMany(osMetaData);

  /* ---- Seed quizzes: problemSlug → ObjectId + problemModel ---- */
  console.log('[SEED-OS] Seeding OS quizzes...');
  let quizCount = 0;
  for (const quiz of osQuizzes) {
    const problem = await OsProblem.findOne({ slug: quiz.problemSlug });
    if (!problem) {
      console.log('[SEED-OS] WARNING: quiz skipped — problem not found:', quiz.problemSlug);
      continue;
    }
    await Quiz.create({
      problemId: problem._id,
      problemModel: 'OsProblem',
      questions: quiz.questions
    });
    quizCount++;
  }
  console.log('[SEED-OS] Quizzes seeded:', quizCount);

  /* ---- Recount problemCount per lesson (dynamic) ---- */
  console.log('[SEED-OS] Recounting problemCount per lesson...');
  const lessons = await OsLesson.find({});
  for (const lesson of lessons) {
    const count = await OsProblem.countDocuments({ lessonSlug: lesson.slug });
    await OsLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  console.log('[SEED-OS] problemCount updated dynamically');

  const summary = {
    os: {
      lessons: osLessons.length,
      subtopics: osSubtopics.length,
      problems: osProblems.length,
      quizzes: quizCount
    },
    meta: {
      os: osMetaData.length
    }
  };

  console.log('[SEED-OS] OS content seeded successfully!', summary);
  return summary;
}

/*
 * CLI entry point
 */
const isCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/seedOsContent.js');
if (isCLI) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
      console.log('[SEED-OS] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[SEED-OS] Connected to MongoDB');

      await runSeed();

      await mongoose.disconnect();
      console.log('[SEED-OS] Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('[SEED-OS] Error seeding database:', error);
      process.exit(1);
    }
  })();
}

export { osLessons, osSubtopics, osProblems, osQuizzes, osMetaData };
