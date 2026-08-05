# OS Curriculum Content Map — v1 Launch Scope (thejobstarter)

> **Progress:** Lesson 1 of 20 seeded — 8/6/2026: "Introduction to Operating Systems" (2 subtopics, 1 problem + 6-question quiz, 11 meta entries). Verify with `node os-content/verify_seed.mjs`. Content lives in `server/seeds/seedOsContent.js`.

This file contains the full v1 build scope for the Operating Systems subject, following the same structure as the DSA, Aptitude, and DBMS content maps (Category → Lesson → Subtopic → Problem).

**v1 Totals:** 4 categories · 20 lessons · 40 subtopics · 34 problems
`*Theory only*` = pure concept subtopic, no problem attached.

## Categories

| Order | Category | Slug | Lessons Inside |
|---|---|---|---|
| 0 | OS Fundamentals & Process Management | `os-fundamentals-process-management` | Introduction to Operating Systems, Process Concepts, Threads, Inter-Process Communication |
| 1 | CPU Scheduling, Synchronization & Deadlocks | `cpu-scheduling-synchronization-deadlocks` | CPU Scheduling Basics, Priority & Round Robin Scheduling, Multilevel & Multiprocessor Scheduling, Process Synchronization, Classical Synchronization Problems, Deadlock Prevention & Avoidance, Deadlock Detection & Recovery |
| 2 | Memory Management | `memory-management` | Memory Management Basics, Paging, Segmentation, Virtual Memory, Virtual Memory Advanced |
| 3 | Storage, File Systems & I/O | `storage-file-systems-io` | File System Basics, File System Implementation, Disk Scheduling, I/O Systems & RAID |

## Full Breakdown

| Order | Category | Lesson | Subtopic | Problem |
|---|---|---|---|---|
| 0 | OS Fundamentals & Process Management | Introduction to Operating Systems | OS Functions & Types | *Theory only* |
| 0 | OS Fundamentals & Process Management | Introduction to Operating Systems | System Calls & OS Structure | Identify the System Call for a Given Operation |
| 0 | OS Fundamentals & Process Management | Process Concepts | Process States & PCB | Trace the Process State Diagram |
| 0 | OS Fundamentals & Process Management | Process Concepts | Process Creation & Termination | Determine Parent-Child Process Output (fork) |
| 0 | OS Fundamentals & Process Management | Threads | Threads vs Processes | Compare Multithreading Models |
| 0 | OS Fundamentals & Process Management | Threads | Multithreading Models | Identify the Threading Model for a Scenario |
| 0 | OS Fundamentals & Process Management | Inter-Process Communication | Shared Memory & Message Passing | Design an IPC Mechanism for a Scenario |
| 0 | OS Fundamentals & Process Management | Inter-Process Communication | Pipes & Signals | Trace the Output of a Piped Command Sequence |
| 1 | CPU Scheduling, Synchronization & Deadlocks | CPU Scheduling Basics | Scheduling Criteria & Concepts | Calculate Waiting and Turnaround Time |
| 1 | CPU Scheduling, Synchronization & Deadlocks | CPU Scheduling Basics | FCFS & SJF Scheduling | Compute a Schedule Using SJF |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Priority & Round Robin Scheduling | Priority Scheduling | Compute a Schedule Using Priority Scheduling |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Priority & Round Robin Scheduling | Round Robin Scheduling | Compute a Schedule Using Round Robin |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Multilevel & Multiprocessor Scheduling | Multilevel Queue & Feedback Queue | Trace a Multilevel Feedback Queue |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Multilevel & Multiprocessor Scheduling | Multiprocessor Scheduling | *Theory only* |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Process Synchronization | Critical Section Problem | Identify the Critical Section Violation |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Process Synchronization | Semaphores & Mutex Locks | Solve a Producer-Consumer Problem with Semaphores |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Classical Synchronization Problems | Readers-Writers Problem | Solve the Readers-Writers Problem |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Classical Synchronization Problems | Dining Philosophers Problem | Solve the Dining Philosophers Problem |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Deadlock Prevention & Avoidance | Deadlock Conditions & Prevention | Identify Which Deadlock Condition is Violated |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Deadlock Prevention & Avoidance | Deadlock Avoidance (Banker's Algorithm) | Apply the Banker's Algorithm |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Deadlock Detection & Recovery | Deadlock Detection Algorithms | Detect a Deadlock Using a Resource Allocation Graph |
| 1 | CPU Scheduling, Synchronization & Deadlocks | Deadlock Detection & Recovery | Deadlock Recovery Strategies | *Theory only* |
| 2 | Memory Management | Memory Management Basics | Contiguous Memory Allocation | Apply Best-Fit, Worst-Fit and First-Fit Allocation |
| 2 | Memory Management | Memory Management Basics | Fragmentation | *Theory only* |
| 2 | Memory Management | Paging | Paging Concepts & Address Translation | Translate a Logical Address to a Physical Address |
| 2 | Memory Management | Paging | Page Table Structures | Calculate Page Table Size |
| 2 | Memory Management | Segmentation | Segmentation Basics | Translate a Segmented Address |
| 2 | Memory Management | Segmentation | Segmentation with Paging | *Theory only* |
| 2 | Memory Management | Virtual Memory | Demand Paging & Page Faults | Calculate the Effective Access Time |
| 2 | Memory Management | Virtual Memory | Page Replacement Algorithms (FIFO, LRU, Optimal) | Compute Page Faults Using LRU |
| 2 | Memory Management | Virtual Memory Advanced | Thrashing & Working Set Model | Identify Thrashing from Given Metrics |
| 2 | Memory Management | Virtual Memory Advanced | Frame Allocation Algorithms | Apply Proportional Frame Allocation |
| 3 | Storage, File Systems & I/O | File System Basics | File Concepts & Access Methods | Identify the File Access Method for a Scenario |
| 3 | Storage, File Systems & I/O | File System Basics | Directory Structures | Trace a Directory Structure Path |
| 3 | Storage, File Systems & I/O | File System Implementation | File Allocation Methods | Compute Block Access for Linked/Indexed Allocation |
| 3 | Storage, File Systems & I/O | File System Implementation | Free Space Management | Apply a Free Space Management Technique |
| 3 | Storage, File Systems & I/O | Disk Scheduling | Disk Scheduling Algorithms (FCFS, SSTF, SCAN) | Compute Seek Time Using SCAN |
| 3 | Storage, File Systems & I/O | Disk Scheduling | C-SCAN & LOOK | Compute Seek Time Using C-SCAN |
| 3 | Storage, File Systems & I/O | I/O Systems & RAID | I/O Hardware & Software Layers | *Theory only* |
| 3 | Storage, File Systems & I/O | I/O Systems & RAID | RAID Levels | Identify the RAID Level for a Given Requirement |
