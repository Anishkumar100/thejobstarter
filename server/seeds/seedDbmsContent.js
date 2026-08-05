/*
 * seedDbmsContent.js
 * Seeds DBMS lessons, subtopics, problems, quizzes, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems → Quiz (one per problem)
 * Source of content: server/dbms-content/dbms-content-map.md
 * Lesson seeded so far: 1 of 23
 *
 * NOTE: This script ONLY touches the DBMS collections plus Quiz
 * documents for DbmsProblem — it never clears other subjects' content
 * and it never clears Progress/QuizAttempt (student data must survive).
 *
 * Usage:
 *   node server/seeds/seedDbmsContent.js
 *   (requires MONGODB_URI in env, defaults to localhost)
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO ADD NEW CONTENT
 *
 * Fill the arrays below. Every entry MUST match its Mongoose model:
 *
 * LESSON (DbmsLesson)
 *   { title, slug, category, description, icon, order, difficulty, problemCount }
 *   - category: filter value shown on /dbms — must be one of the
 *     categories in dbmsMetaData below (e.g. 'database-fundamentals').
 *   - problemCount is IGNORED at insert time — the runner recounts it
 *     from the actual problems after seeding.
 *
 * SUBTOPIC (DbmsSubtopic)
 *   { title, slug, description, explanation, lessonSlug, order }
 *   - explanation: RICH Markdown (headings, tables, code fences, ✅/❌ lists)
 *     rendered on the subtopic detail page.
 *   - optional: image, youtubeUrl, pdfUrl, pptxUrl
 *   - lessonSlug MUST equal the slug of an existing lesson above.
 *
 * PROBLEM (DbmsProblem)
 *   { title, slug, lessonSlug, subtopicSlug, difficulty, topics,
 *     companies, problemStatement, examples, constraints, approach,
 *     codeBlocks, timeComplexity, spaceComplexity }
 *   - difficulty: 'easy' | 'medium' | 'hard'
 *   - approach: RICH Markdown (steps, traces, tips, edge cases)
 *   - codeBlocks: [{ language, code }] — sql / python / javascript
 *   - optional: media[], youtubeUrl, pdfUrl, pptxUrl
 *   - subtopicSlug MUST equal the slug of an existing subtopic above.
 *
 * QUIZ (Quiz — attached to problems, one quiz per problem)
 *   { problemSlug, questions: [{ text, options, correctIndex }] }
 *   - problemSlug must equal the slug of a problem above; the runner
 *     converts it to the problem's ObjectId + problemModel 'DbmsProblem'.
 *   - options: 2 to 6 strings; correctIndex: index of the correct option
 *     (0-based). NEVER reveal correctIndex to students — it is internal.
 *
 * META (DbmsMeta)
 *   { type, value, label, order }  — type: 'category' | 'topic' | 'company'
 *   - Categories drive the filter pills on /dbms.
 *   - (type + value) pair must be unique.
 * ─────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import DbmsLesson from '../models/DbmsLesson.js';
import DbmsSubtopic from '../models/DbmsSubtopic.js';
import DbmsProblem from '../models/DbmsProblem.js';
import DbmsMeta from '../models/DbmsMeta.js';
import Quiz from '../models/Quiz.js';

/* ================================================================
 * DBMS Lessons
 * ================================================================ */

const dbmsLessons = [
  {
    "title": "Introduction to DBMS",
    "slug": "introduction-to-dbms",
    "category": "database-fundamentals",
    "description": "Start here — why a pile of Excel files is a nightmare and a DBMS is a superpower. Learn what a database really is, how a DBMS beats a raw file system, the three-schema architecture that keeps every developer and every user looking at the same truth, and the big families of data models that decide how records relate.",
    "image": "",
    "icon": "Database",
    "order": 0,
    "difficulty": "easy",
    "problemCount": 1
  }
];

/* ================================================================
 * DBMS Subtopics
 * ================================================================ */

const dbmsSubtopics = [
  {
    "title": "DBMS vs File System",
    "slug": "dbms-vs-file-system",
    "lessonSlug": "introduction-to-dbms",
    "order": 0,
    "description": "Why storing data in plain files fails the moment two people touch the same data — and the five superpowers a DBMS brings: zero duplication, one source of truth, security, speed, and safe concurrency.",
    "explanation": "## The Story — Two Ways to Keep Data\n\nImagine you run a chai stall and write every customer's name, phone and ₹amount in a **notebook**. Now you open two more stalls, each with its own notebook. Tomorrow, the same customer is \"pending\" in one book and \"paid\" in another. That is the **file system** approach — data lives in loose, independent files, and nobody guarantees the copies agree.\n\nNow imagine a **single golden ledger** that all your stalls share, plus a strict **bank-teller** who queues everyone up, checks IDs, and never lets two people write the same page at once. That teller is your **DBMS** (DataBase Management System).\n\n## Where the File System Breaks\n\n| Problem | File system | DBMS |\n|---|---|---|\n| Same record in 5 offices | Copied 5× — copies drift | Stored **once**, visible everywhere |\n| Two people edit the same amount | Both overwrite → corruption | Locked → applied one by one |\n| Power cuts mid-save | Half-written file | Transaction rolls back — data intact |\n| \"Who owes me ₹1000?\" | Scan every file manually | `SELECT` with an index → milliseconds |\n| Who changed this row last night? | No trace | Audit log + per-user permissions |\n\n## The Five Superpowers of a DBMS\n\n### 1. No Data Twice (Redundancy-Free)\nA file system stores the customer's phone number in five files, five shapes. A DBMS stores it **exactly once** and every screen reads that one copy → no disagreement possible. If 2,00,000 copies of a record would eat 12 GB in files, one copy in a DBMS eats almost nothing.\n\n### 2. One Source of Truth\nCentralise it: the address lives in one row. Same data, same meaning, used by every app — you stop trusting which copy is right.\n\n### 3. Access Controlled\nDBMS sits between the user and the raw data like a security guard — passwords, roles, row-level permissions. A spreadsheet has no walls; `GRANT` and `REVOKE` do.\n\n### 4. Scale Without a Heart-Attack\n\"Total sales over ₹10,00,000\" = scanning 4 million CSV rows by hand. With an **index**, the DBMS jumps straight to the rows — the same lazy trick as a book's index.\n\n### 5. Safe Concurrency (many users at once)\nTwo clerks updating the same stock at the same instant is the classic file-corruption. A DBMS locks the row, applies the writes one after another, and every viewer sees a consistent snapshot.\n\n## When Does the File System Win?\n\n| File system preferred | DBMS preferred |\n|---|---|\n| A few read-only static files | Data that is queried, joined, filtered daily |\n| Videos, photos, logs (raw blobs) | Data that needs relationships and integrity |\n| One user, one machine | Many users, many screens, shared truth |\n\n## Key Takeaway\n\nA file system **stores** raw bytes. A DBMS **manages** them — deduplication, one source of truth, a security gate, an index for speed, and locks for safety. That is why libraries, banks, and the internet all run on DBMS, not on folders."
  ,
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
  }
  ,
  {
    "title": "Database Architecture & Data Models",
    "slug": "database-architecture-data-models",
    "lessonSlug": "introduction-to-dbms",
    "order": 1,
    "description": "Meet the three-schema blueprint behind every serious database — the External view (what users see), the Conceptual schema (what the data means), and the Physical schema (how it's stored on disk) — plus the data-model family tree, from relational tables to network and hierarchical trees.",
    "explanation": "## The Blueprint of Every Serious Database\n\nThink of a university. A student sees a simple login screen and a course card. The database designer sees tables: Student, Course. The storage engine sees records sitting in disk blocks. All three look at the **same database** from different windows — that is exactly the **three-schema architecture**.\n\n### Meet the Three Schemas\n\n| Schema | Who lives here | What it describes | Example |\n|---|---|---|---|\n| **External** (View level) | End users & apps | What a single user needs, possibly rearranged or computed | A student sees `name, grade, hobby` on a friendly screen |\n| **Conceptual** (Logical level) | Database designer | The **pure meaning**: tables, columns, keys, relationships — no storage talk | `Student(ID, name, grade)` linked to `Hobby(studentID, hobbyName)` |\n| **Internal** (Physical level) | Storage engine | How rows are placed on disk: blocks, indexes, pointers | Records packed in 4 KB blocks with a B+tree index on `ID` |\n\n### Why Have a Middle Floor?\nBecause it keeps the users and the storage **decoupled**. You can rebuild the whole physical layer (faster index, different block size) and **no app changes a single line** — the conceptual schema is the contract in between.\n\n## Data Models — How We Draw the Conceptual World\n\nA data model decides the *shape* in which records relate. There are four big families:\n\n### 1. Relational Model — the king of tables\nData lives in **tables** (relations). Rows = records, columns = attributes, keys connect tables. SQL speaks this shape. MySQL, PostgreSQL, Oracle — today's default for the world.\n\n```sql\nSTUDENT                      COURSE\nID | Name  | Grade           ID | Title\n1  | Aarav | A               1  | DBMS\n2  | Meera | B               2  | DSA\n\nSTUDENT_COURSE (the link table)\nstudentID | courseID\n1         | 1\n1         | 2\n2         | 1\n```\n\n### 2. Hierarchical Model — the family tree\nData organised as a **tree**: one parent, many children, every child has exactly one parent. Think org charts or folder trees. Fast for tree queries, painful for many-to-many. IBM's IMS was built on this.\n\n```\n             College\n        ┌───────┼───────┐\n     Dept A     Dept B   Dept C\n      │                   │\n   Students           Teachers\n```\n\n### 3. Network Model — the web of pointers\nLike hierarchy, but a child can have **many parents** — records linked by explicit pointers. Flexible but the data itself is spaghetti: changing a pointer structure means rewriting queries. CODASYL/DBTG model.\n\n### 4. Object-Oriented / Document Model — the modern rebels\nRecords as objects (OODBMS) or JSON documents (MongoDB, CouchDB). No rigid schema needed — each document can carry its own fields. Loved when data is naturally nested, like a blog post with its comments inside it.\n\n```json\n{\n  \"student\": \"Aarav\",\n  \"grade\": \"A\",\n  \"hobbies\": [\"chess\", \"cricket\"]\n}\n```\n\n### Which Model Wins?\nThere is no absolute winner — it depends on the question:\n\n| Need | Model |\n|---|---|\n| Account balances, joins, reports | Relational (SQL) |\n| Parent→child drill-down, org charts | Hierarchical |\n| Complex many-to-many, legacy | Network |\n| Flexible JSON, nested documents | Document (NoSQL) |\n\n## Key Takeaway\n\nEvery database has three windows: **External** (user view), **Conceptual** (pure structure), **Internal** (disk layout). The conceptual middle floor is the contract that frees apps from storage details. And the **data model** decides the drawing — tables for the relational world, trees for hierarchy, pointers for networks, documents for NoSQL."
  ,
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
  }
];

/* ================================================================
 * DBMS Problems
 * ================================================================ */

const dbmsProblems = [
  {
    "title": "Identify the Three-Schema Architecture Level",
    "slug": "three-schema-architecture-level",
    "lessonSlug": "introduction-to-dbms",
    "subtopicSlug": "database-architecture-data-models",
    "difficulty": "easy",
    "topics": ["Three-Schema Architecture", "Database Fundamentals", "Data Models"],
    "companies": ["amazon", "google", "oracle"],
    "problemStatement": "You are given five statements that different people make about the same university database. For each statement, classify which level of the three-schema architecture it belongs to: External (View), Conceptual (Logical), or Internal (Physical).",
    "examples": [
      {
        "input": "An app developer says: 'I only show the user their name, grade and hobby — my screen never touches the raw table.'",
        "output": "External",
        "explanation": "The statement talks about what a single user/application sees — a rearranged or computed projection of data. That is the view level (External schema)."
      },
      {
        "input": "The database designer says: 'Student and Course are two tables linked by a many-to-many relationship through a STUDENT_COURSE link table.'",
        "output": "Conceptual",
        "explanation": "This describes the pure structure — tables, keys, relationships — with zero storage detail. That is the Conceptual (logical) schema."
      },
      {
        "input": "A DBA says: 'I will pack the rows into 4 KB blocks and build a B+tree index on the Student ID column.'",
        "output": "Internal",
        "explanation": "Blocks, indexes, and file layout are physical storage concerns. That is the Internal (physical) schema."
      },
      {
        "input": "A lecturer says: 'A student may enroll in many courses, and a course may have many students.'",
        "output": "Conceptual",
        "explanation": "This describes a relationship between entities — structure and meaning, not storage. That is the Conceptual schema."
      },
      {
        "input": "A user says: 'On my app, I see two columns: my grade and my hobby. I have no idea what a STUDENT table looks like.'",
        "output": "External",
        "explanation": "The user sees only their personalised window on the data — the External (view) level."
      }
    ],
    "constraints": [
      "Classify each statement as exactly one of: External, Conceptual, Internal.",
      "Watch for trigger words — user/app/screen → External; table/relationship/key → Conceptual; block/index/disk/pointer → Internal."
    ],
    "approach": "## The One-Line Trick\n\nAsk: **Who is speaking, and about what?**\n\n| If the speaker talks about… | It is |\n|---|---|\n| What a user or app **sees** (screens, views, visible columns) | **External** |\n| **Structure and meaning** — tables, keys, relationships, cardinality | **Conceptual** |\n| **Storage on disk** — blocks, indexes, pointers, file layout | **Internal** |\n\n## Step-by-Step Method\n\n1. **Read the statement and find the subject.** Is it about a screen, a table design, or a disk?\n2. **User/app + visible columns → External.** Views are tailor-made projections — often they hide or recompute columns.\n3. **Designer + structure → Conceptual.** \"Student and Course are linked\" describes the schema's meaning, not its bits.\n4. **DBA + blocks/indexes → Internal.** \"4 KB blocks\" and \"B+tree\" are pure physical talk.\n5. **When in doubt, remember the middle floor is the contract.** If the statement stays true no matter how the data is stored on disk, it is Conceptual. If it mentions the disk at all, it is Internal. If it mentions a screen or a specific user's needs, it is External.\n\n## Why This Trick Always Works\n\nThe three-schema architecture exists exactly so that these three audiences can talk about the same database without confusion. The **view level** is cosmetic (what you see), the **logical level** is structural (what it means), the **physical level** is mechanical (how it is stored). Real-world interview questions hide exactly these trigger words — hunt for them.",
    "codeBlocks": [
      {
        "language": "sql",
        "code": "-- EXTERNAL: a view an app sees (only 2 columns, no raw table)\nCREATE VIEW StudentSummary AS\nSELECT name, grade\nFROM Student;\n\n-- CONCEPTUAL: the pure structure (tables + relationship)\nCREATE TABLE Student (\n  id   INT PRIMARY KEY,\n  name VARCHAR(50),\n  grade CHAR(1)\n);\n\nCREATE TABLE STUDENT_COURSE (\n  studentID INT REFERENCES Student(id),\n  courseID  INT REFERENCES Course(id)\n);\n\n-- INTERNAL (conceptualised, not real SQL):\n-- rows packed in 4 KB blocks, B+tree index on id"
      }
    ],
    "timeComplexity": "N/A — classification problem, no data traversal",
    "spaceComplexity": "N/A — no data structures created"
  }
];

/* ================================================================
 * DBMS Quizzes (one per problem, keyed by problemSlug)
 * ================================================================ */

const dbmsQuizzes = [
  {
    "problemSlug": "three-schema-architecture-level",
    "questions": [
      {
        "text": "A user sees only their name, grade, and hobby on an app screen. Which schema level is that?",
        "options": [
          "Internal",
          "Conceptual",
          "External",
          "Physical"
        ],
        "correctIndex": 2
      },
      {
        "text": "\"Student and Course are two tables linked many-to-many\" — which level does this statement belong to?",
        "options": [
          "External",
          "Conceptual",
          "Internal",
          "View level"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which of these is a PHYSICAL (Internal) level concern?",
        "options": [
          "What columns appear on a user's screen",
          "Whether Student and Course are related",
          "Packing rows into 4 KB disk blocks with a B+tree index",
          "The password policy for the app"
        ],
        "correctIndex": 2
      },
      {
        "text": "What is the main benefit of the middle (Conceptual) schema?",
        "options": [
          "It stores the data faster",
          "It decouples user views from storage details — the contract between them",
          "It hides data from the designer",
          "It creates more tables"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which data model stores data as tables with rows, columns, and keys?",
        "options": [
          "Hierarchical",
          "Network",
          "Document",
          "Relational"
        ],
        "correctIndex": 3
      },
      {
        "text": "In a hierarchical model, how many parents can a child record have?",
        "options": [
          "Many",
          "Exactly one",
          "Zero",
          "Two or more"
        ],
        "correctIndex": 1
      },
      {
        "text": "A JSON document that nests its own comments inside it is a signature of which model?",
        "options": [
          "Document (NoSQL)",
          "Hierarchical",
          "Relational",
          "Network"
        ],
        "correctIndex": 0
      },
      {
        "text": "Which DBMS superpower fixes the problem of the same phone number stored in five different files?",
        "options": [
          "Concurrency control",
          "Redundancy-free storage (one copy)",
          "Audit logs",
          "Indexing"
        ],
        "correctIndex": 1
      }
    ]
  }
];

/* ================================================================
 * DBMS Meta — categories, topics, and companies
 * (type/value pair must be unique — see DbmsMeta index)
 * ================================================================ */

const dbmsMetaData = [
  { "type": "category", "value": "database-fundamentals", "label": "Database Fundamentals & ER Modeling", "order": 1 },
  { "type": "category", "value": "relational-model-sql", "label": "Relational Model & SQL", "order": 2 },
  { "type": "category", "value": "normalization-schema-design", "label": "Normalization & Schema Design", "order": 3 },
  { "type": "category", "value": "transactions-concurrency-recovery", "label": "Transactions, Concurrency & Recovery", "order": 4 },
  { "type": "category", "value": "indexing-query-processing-storage", "label": "Indexing, Query Processing & Storage", "order": 5 },
  { "type": "topic", "value": "dbms-vs-file-system", "label": "DBMS vs File System", "order": 1 },
  { "type": "topic", "value": "three-schema-architecture", "label": "Three-Schema Architecture", "order": 2 },
  { "type": "topic", "value": "data-models", "label": "Data Models", "order": 3 },
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
  console.log('[SEED-DBMS] Starting DBMS content seed...');

  /*
   * Clear ONLY the DBMS collections (+ DBMS quizzes).
   * Progress, QuizAttempt, and all other subjects' content are
   * deliberately left untouched.
   */
  console.log('[SEED-DBMS] Clearing existing DBMS data...');
  await Promise.all([
    DbmsLesson.deleteMany({}),
    DbmsSubtopic.deleteMany({}),
    DbmsProblem.deleteMany({}),
    DbmsMeta.deleteMany({}),
    Quiz.deleteMany({ problemModel: 'DbmsProblem' })
  ]);
  console.log('[SEED-DBMS] Existing DBMS data cleared');

  console.log('[SEED-DBMS] Seeding DBMS lessons...');
  await DbmsLesson.insertMany(dbmsLessons);
  console.log('[SEED-DBMS] Seeding DBMS subtopics...');
  await DbmsSubtopic.insertMany(dbmsSubtopics);
  console.log('[SEED-DBMS] Seeding DBMS problems...');
  await DbmsProblem.insertMany(dbmsProblems);
  console.log('[SEED-DBMS] Seeding DBMS meta...');
  await DbmsMeta.insertMany(dbmsMetaData);

  /* ---- Seed quizzes: problemSlug → ObjectId + problemModel ---- */
  console.log('[SEED-DBMS] Seeding DBMS quizzes...');
  let quizCount = 0;
  for (const quiz of dbmsQuizzes) {
    const problem = await DbmsProblem.findOne({ slug: quiz.problemSlug });
    if (!problem) {
      console.log('[SEED-DBMS] WARNING: quiz skipped — problem not found:', quiz.problemSlug);
      continue;
    }
    await Quiz.create({
      problemId: problem._id,
      problemModel: 'DbmsProblem',
      questions: quiz.questions
    });
    quizCount++;
  }
  console.log('[SEED-DBMS] Quizzes seeded:', quizCount);

  /* ---- Recount problemCount per lesson (dynamic) ---- */
  console.log('[SEED-DBMS] Recounting problemCount per lesson...');
  const lessons = await DbmsLesson.find({});
  for (const lesson of lessons) {
    const count = await DbmsProblem.countDocuments({ lessonSlug: lesson.slug });
    await DbmsLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  console.log('[SEED-DBMS] problemCount updated dynamically');

  const summary = {
    dbms: {
      lessons: dbmsLessons.length,
      subtopics: dbmsSubtopics.length,
      problems: dbmsProblems.length,
      quizzes: quizCount
    },
    meta: {
      dbms: dbmsMetaData.length
    }
  };

  console.log('[SEED-DBMS] DBMS content seeded successfully!', summary);
  return summary;
}

/*
 * CLI entry point
 */
const isCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/seedDbmsContent.js');
if (isCLI) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
      console.log('[SEED-DBMS] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[SEED-DBMS] Connected to MongoDB');

      await runSeed();

      await mongoose.disconnect();
      console.log('[SEED-DBMS] Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('[SEED-DBMS] Error seeding database:', error);
      process.exit(1);
    }
  })();
}
