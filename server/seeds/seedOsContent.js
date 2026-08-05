/*
 * seedOsContent.js
 * Seeds OS lessons, subtopics, problems, quizzes, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems → Quiz (one per problem)
 * Source of content: server/os-content/os-content-map.md
 * Lesson seeded so far: 1 of 20
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
    "timeComplexity": "N/A — conceptual mapping",
    "spaceComplexity": "N/A — no data structures used"
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
