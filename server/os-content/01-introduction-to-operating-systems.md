# OS Learning Document — Introduction to Operating Systems

> A comprehensive, student-friendly guide to Introduction to Operating Systems — the foundation every OS course stands on.
> Master what an OS actually does (the five core jobs), the types of OS from batch to real-time, and the system calls that are the doorway between your app and the kernel.

---

# 1. Introduction to Operating Systems

> **Lesson Overview:** Start here — what an operating system actually does all day. Learn the traffic-cop job description, the five core jobs every OS does (running programs, guarding memory, filing files, driving devices, security), the types of OS from batch to real-time, and the system calls that are the doorway between your app and the kernel.
> - **Category:** OS Fundamentals & Process Management
> - **Difficulty:** Easy
> - **Problems:** 1

---

## 1.1 OS Functions & Types

### The Story — Who Really Is the OS?

An operating system (OS) is the **traffic cop** between you and the hardware. You type letters, the OS makes the keyboard work. You open a music app, the OS loads the code into RAM, schedules the CPU, and makes the speakers play. Without it, every app would have to teach itself how to talk to every chip — the world would run on paper.

### The Layer Cake View

```
     ┌──────────────────────────┐
     │    User programs (apps)   │
     ├──────────────────────────┤
     │  SYSTEM SOFTWARE (the OS) │   ◄── we are here
     ├──────────────────────────┤
     │          HARDWARE          │
     └──────────────────────────┘
```

### The Five Core Functions

**1. Process Management — the conductor of CPUs**
A **process** is a program in action. The OS watches every running program, gives each one a turn on the CPU, and cleanly kills dead ones so the whole machine does not crash.

**2. Memory Management — the landlord of RAM**
Programs need memory; RAM is finite. The OS decides how much RAM each program gets, keeps programs from stepping on each other, and swaps data to disk when space runs out.

**3. File Management — the librarian of disk**
Files are saved, named, organised in folders, and found again — the OS owns the directory tree and handles permissions (read, write, execute).

**4. Device Management — the garage for hardware**
Every device (printer, mouse, camera) has a driver. The OS greets the driver, passes data in and out, and manages who gets the device when several apps want it at once.

**5. Security & Protection — the security guard**
Users and processes are separated so one app cannot read another app's memory. The OS verifies logins, passwords and permissions, and catches malware before it breaks in.

### Types of Operating Systems

| Type | What it does | Typical use |
|---|---|---|
| **Batch** | Runs jobs one after another with no human in the middle | Payroll, billing (mostly gone today) |
| **Time-sharing** | Many users share the CPU in turns — each feels they own the machine | Unix workstations, Linux desktops |
| **Real-time** | Must respond within a strict deadline | airbag deployment, autopilots, pacemakers |
| **Distributed** | Many machines act as one big system | cloud clusters, Hadoop |
| **Mobile / Embedded** | Low power, touch-driven, sensor-heavy | Android, iOS, smartwatches |

### Hard vs Soft Real-Time

- **Hard real-time:** the deadline is sacred — missing it is a failure (an airbag timer).
- **Soft real-time:** the deadline matters but a miss is annoying, not fatal (video streaming).

### Key Takeaway

An OS is a traffic director: it runs processes, doles out RAM, files away bytes, drives devices, and guards security. The **type** of OS is a trade-off between how many users, how fast a response, and how constrained the hardware.

---

## 1.2 System Calls & OS Structure

### The Door Between the App and the Kernel

Your app runs in a protected room, the kernel — the heart of the OS — runs in a separate room where it can touch hardware directly. An app CANNOT touch the keyboard or the hard drive. The only doorway is the **system call** — a carefully chosen service request the app makes.

### The System Call Flow

```
User program   →  system call  →  kernel does the work  →  return
"read the file"     read()         fetch bytes            "here is the data"
```

Think of it as a restaurant: the app is the customer, the **system call** is the waiter, and the kernel is the chef who never talks to the customer directly. The menu item is the call name (open, read, write); the waiter carries the request and brings back the plate.

### The Five Families of System Calls

| Family | The purpose | Example calls |
|---|---|---|
| **Process control** | start, run, and end a process | fork(), exec(), wait(), exit() |
| **File management** | open, read, write, close files | open(), read(), write(), close() |
| **Device management** | talk to hardware devices | open(), close(), read(), ioctl() |
| **Information maintenance** | get/set system info | getpid(), time(), get_clock() |
| **Communication** | exchange messages between processes | pipe(), send(), recv() |

### Monolithic vs Microkernel — How to Build the OS

| Structure | What it is | Example |
|---|---|---|
| **Monolithic** | Everything (schedulers, files, drivers) in one big kernel | Linux, classic UNIX |
| **Layered** | Each layer does one job — a staircase of layers, each with its own role | Older designs, teaching |
| **Microkernel** | Kernel is a tiny core; most services run separately in user space | QNX, many embedded systems |

### Microkernel Pros and Cons

- ✅ **Fault isolation:** a crash in a service does not take down the whole kernel.
- ❌ **Slower:** passing messages between user space and the kernel costs extra time.

### Key Takeaway

A system call is the **legal doorway** from user space to kernel space. The five families are: process, file, device, information, and communication. The kernel's architecture chooses how much lives in the core — everything (monolithic) or just a little (microkernel).

---

# 2. Problems

## 2.1 Identify the System Call for a Given Operation

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | System Calls & OS Structure |
| **Companies** | Google, Amazon |

### Problem Statement

A junior developer is building a tiny shell. For each scenario, identify which family of system calls (process, file, device, information, communication) best fits the job.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Scenario A: They want to start a brand-new child process | Process control (fork/exec) | Creating a child process is the process family's classic job — fork duplicates, exec replaces the running image |
| Scenario B: They want to read the contents of a text file from disk | File management | Reading a file means open() then read() then close() — all file-family calls |
| Scenario C: The shell must print the current system time | Information maintenance | Asking the OS for the clock time or pid belongs to the information family |
| Scenario D: Two programs want to exchange data with each other | Communication family | Passing messages between processes is the communication family — pipe, send, recv |

### Constraints

- Each scenario maps to exactly one family: process, file, device, information, or communication.
- When in doubt, ask: what resource am I touching?

### Approach

**The One-Line Trick**

Ask: **what resource am I touching?**

| The task is about a… | System call family | Example calls |
|---|---|---|
| child process / exec | Process control | fork(), exec(), wait(), exit() |
| a file | File management | open(), read(), write(), close() |
| a device | Device management | open(), close(), ioctl() |
| system info / time | Information maintenance | getpid(), time() |
| two processes exchanging data | Communication | pipe(), send(), recv(), connect() |

**Step-by-Step Method**

1. **Find the subject.** Is the task about a process, a file, a device, system info, or another process?
2. **Match it to the row in the table above.** The subject word is almost always the answer.
3. **Name the family — then name the exact call** for a perfect answer: "File management — open() then read()."
4. **Avoid traps:** printing the time is INFORMATION (not file), starting a child is PROCESS (not file), and two apps talking is COMMUNICATION (not device).

**Interview Tip**

Interviewers love this question because it tests whether you can map a real task to the kernel's menu. Say the family first, then the exact call: "That is process control — I would fork() and then exec()." It is a two-word answer with a ten-second reason.
