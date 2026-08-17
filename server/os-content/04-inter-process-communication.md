# OS Learning Document — Inter-Process Communication

> A comprehensive, student-friendly guide to Inter-Process Communication — the foundation every OS course stands on.
> Master shared memory & message passing, pipes & signals, with exam-style problems and fully worked solutions.

---

# 4. Inter-Process Communication

> **Lesson Overview:** How separate processes trade data when they have no shared memory — the shared-memory mailbox (fast but hand-coordinated) vs the message-passing postman (safe but slower), plus the humble pipe, the named FIFO, and the signals that tap processes on the shoulder.
> - **Category:** OS Fundamentals & Process Management
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 4.1 Shared Memory & Message Passing

### Two Ways to Share a Secret

Processes have separate address spaces — they cannot see each other's variables. To trade data they need a bridge, and there are exactly two classic bridges:

1. **Shared memory** — both processes agree to use one region of memory as a bulletin board.
2. **Message passing** — data is wrapped and shipped by the kernel, like letters through a post office.

### The Bulletin Board (Shared Memory)

```
Process A                        Process B
┌──────────────┐                ┌──────────────┐
│ writes to    │                │ reads from   │
│   buffer[i]  │──► SHARED ◄────│   buffer[j]  │
│              │     REGION     │              │
└──────────────┘                └──────────────┘
        ▲                                      ▲
        └──── both agree: "we call it BUFFER" ─┘
```

The kernel helps build the region ONCE (shmget / mmap); after that the kernel is out of the way — reads and writes are plain memory accesses. No system calls per message = **blazing fast**.

| Pros | Cons |
|---|---|
| fastest IPC on the machine | both sides must SYNCHRONIZE (who writes when?) — races are on you |
| kernel out of the data path after setup | touches shared memory need locks |
| simple mental model | only works on one machine |

The classic discipline: a **bounded buffer** with producer/consumer — the producer must not overwrite a slot the consumer has not emptied yet. This is exactly the problem semaphores solve in the synchronization lessons.

### The Post Office (Message Passing)

```
Process A                     kernel                     Process B
  send(msg) ──────────►  mailbox / queue  ──────────►  recv(msg)
```

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

❌ Shared memory is NOT synchronized by the kernel at all — the processes must hand-coordinate.❌ "Message passing is always slower" — true per message, but it buys correctness for free.❌ Direct vs indirect is about ADDRESSING, not speed.❌ The bounded buffer still deadlocks/stalls if producers outpace consumers — buffering is not infinite.

### Quick Self-Test (answers at the bottom)

1. After setup, shared memory reads/writes involve:
(a) system calls per access (b) plain memory operations (c) the network
2. Who carries the data in message passing?
(a) the processes directly (b) the kernel (c) the disk
3. send(P, msg) is ________ addressing.
(a) indirect (b) direct (c) shared
4. The biggest shared-memory danger:
(a) speed (b) forgetting to synchronize (c) kernel copies

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 4.2 Pipes & Signals

### Plumbers and Fencers

A **pipe** is a byte-stream between two processes: one side writes, the other reads, in strict first-in-first-out order. Think of a drain pipe — whatever goes in at the top comes out at the bottom, same order, no structure.

### The Anonymous Pipe — Built by fork

```
             pipe(fds)          fds[0] = read end, fds[1] = write end
                │
        fork()  ▼  (child inherits BOTH ends)
   ┌────────────┴────────────┐
   │  parent: close(fds[0])  │  child: close(fds[1])
   │  write(fds[1], data)    │  read(fds[0], data)
   │        ────  Byte stream  ────►
   └─────────────────────────┘
```

| Rule | Why |
|---|---|
| parent closes read end, child closes write end | one direction only, one writer, one reader |
| pipe() BEFORE fork() | the child inherits both descriptors |
| unnamed pipes only work between relatives | the descriptors must be inherited to be shared |

### The Shell Pipeline — ps | grep

```
$ ps aux | grep chrome
   ┌──────────┐   pipe #1   ┌──────────┐
   │    ps     │ ──────────► │   grep   │
   └──────────┘             └──────────┘
       3 PROCESSES total:   ps (parent) → grep (child)
       shell forks ps; ps forks grep; every output byte of ps pours into grep's stdin
```

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

❌ Anonymous pipes need fork() — no fork, no pipe sharing between unrelated processes.❌ A pipe is UNIDIRECTIONAL — two pipes if both sides must talk.❌ SIGKILL cannot be caught or ignored — no handler, ever.❌ Pipes carry raw BYTES — no framing; if you need records, you build them.

### Quick Self-Test (answers at the bottom)

1. After pipe()+fork(), the child must:
(a) close the write end (b) close the read end (c) close both
2. bash "a | b | c" creates how many processes?
(a) 2 (b) 3 (c) 4
3. Which signal can NO handler stop?
(a) SIGINT (b) SIGTERM (c) SIGKILL
4. A FIFO exists because:
(a) FIFOs are faster (b) unrelated processes need a named pipe (c) pipes are encrypted

**Answers:** 1→b, 2→b, 3→c, 4→b.

---

# 5. Problems

## 5.1 Design an IPC Mechanism for a Scenario

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Shared Memory & Message Passing |
| **Companies** | Google, Oracle |

### Problem Statement

Pick the best IPC tool for each scenario and justify in one sentence. (a) A video encoder streams 4 GB/s of frames between two processes on the same machine. (b) A payment API exchanges small JSON requests with a microservice on another server. (c) A parent process must hand a stream of bytes to its child in order, with no extra copies. (d) A server needs the exact same message delivered to several subscribers.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Scenario (a): 4 GB/s frame streaming, same machine. | Shared memory. | Message passing copies every byte through the kernel — 4 GB/s would die in the syscall/copy cost; shared memory is direct memory access after setup. |
| Scenario (b): small JSON to a remote microservice. | Message passing (network sockets / RPC). | Shared memory is per-machine; small structured requests across machines must be packaged and shipped — message passing. |
| Scenarios (c) and (d): ordered parent→child bytes; same message to many subscribers. | (c) Pipe. (d) Message passing with a public mailbox (indirect addressing). | A pipe gives strict FIFO byte order and needs no extra copies after fork. Indirect addressing lets many receivers pull from one shared mailbox. |

### Constraints

- Justify every choice with ONE cost or benefit line.
- Same-machine + huge data → lean shared memory; cross-machine or tiny & safe → message passing.
- Parent/child byte streams → pipe.

### Approach

**The IPC Decision Tree**

```
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
```

**The Four-Column Cheat Sheet**

| Tool | Speed | Machines | Safety | Best for |
|---|---|---|---|---|
| shared memory | ★★★ | one | pin-drop quiet kernel | big same-machine data |
| message passing | ★★ | many | kernel-copied, race-free | small/safe/remote |
| pipe | ★★ | one (relatives) | FIFO order, one writer | parent → child streams |
| mailbox | ★★ | one-ish | decoupled | publish to many |

**Common Traps**

❌ Raw speed is never the only vote — a payment API wants safe copies, not speed.❌ Shared memory across machines does not exist without network glue (that glue IS message passing).❌ A pipe between unrelated processes needs a named FIFO — the anonymous pipe requires fork.

## 5.2 Trace a Piped Command Sequence

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Pipes & Signals |
| **Companies** | Google, Amazon, Microsoft |

### Problem Statement

The shell runs: ls | grep log | wc -l. Answer: (a) how many processes participate, and how are they related? (b) how many pipes exist? (c) trace WHERE each pipe's write end is closed, and what makes wc -l receive ONLY grep's filtered lines and NOTHING else. (d) if ls writes more output than the pipe buffer, what happens and who pauses?

### Examples

| Input | Output | Explanation |
|---|---|---|
| Parts (a) and (b): process count and pipe count. | 3 processes (ls, grep, wc) in a line — ls spawned first, wc last; 2 pipes: pipe1 = ls→grep, pipe2 = grep→wc. | Each '\|' adds one new process and one pipe. The shell links pipe1's write end to grep's stdin and pipe2's read end to grep's stdout. |
| Part (c): how does wc only see filtered lines? | grep inherits pipe1's read end as STDIN and pipe2's write end as STDOUT; every byte ls writes flows → grep → pipe2 → wc. Closure of unused ends prevents surprise readers/writers from keeping pipes open. | The flow is one directional chain: ls stdout = pipe1 write; grep stdin = pipe1 read; grep stdout = pipe2 write; wc stdin = pipe2 read. Any process that keeps an unused write end open would prevent EOF — wc would hang. |
| Part (d): ls outpaces the pipe buffer (e.g. 8 KB). | ls BLOCKS on write until grep drains the pipe; the pipeline self-paces — nobody loses bytes, everything is buffered FIFO. | A pipe is a fixed-size kernel buffer. A full buffer pauses the writer (write() blocks) until the reader drains it — backpressure. |

### Constraints

- Count processes, not commands — each pipeline stage is a process.
- Assume all processes run concurrently on an idle machine.
- Unused ends MUST be closed — otherwise EOF never arrives and wc waits forever.

### Approach

**Draw the Data-Flow Snake**

```
shell
  │ fork()
  ├──► ls          its STDOUT = pipe1(W)
  │                fork()
  ├──► grep        STDIN = pipe1(R); STDOUT = pipe2(W)
  │                fork()
  └──► wc          STDIN = pipe2(R)
                    pipe2(W) closed by grep when grep exits
                    pipe1(W) closed by ls when ls exits
```

**The Pipeline Rules**

| Rule | Consequence |
|---|---|
| n pipes in one command | n + 1 processes |
| each process's stdout | the NEXT pipe's write end |
| each process's stdin | the PREVIOUS pipe's read end |
| every unused write end closed | EOF can propagate — else the reader hangs |
| full pipe buffer | writer blocks — backpressure |

**The EOF Story**

wc counts lines until it sees EOF on its stdin. EOF arrives only when EVERY write end of pipe2 is closed. grep closing pipe2(W) when it exits is what finally tells wc "no more lines." That is why closure discipline matters.

**Common Traps**

❌ wc does not wait for "all data ever" — it waits for ENOUGH EOF signals.❌ Blocks-per-second: a blocked writer uses zero CPU — it sits in the pipe's wait queue.❌ The shell itself forks the FIRST command — the shell is not a pipeline stage; it is the ancestor.
