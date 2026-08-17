/*
 * seedDbmsContent.js
 * Seeds DBMS lessons, subtopics, problems, quizzes, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems → Quiz (one per problem)
 * Source of content: server/dbms-content/dbms-content-map.md
 * Lesson seeded so far: 12 of 23
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
  },
  {
    "title": "Entity-Relationship Modeling",
    "slug": "entity-relationship-modeling",
    "category": "database-fundamentals",
    "description": "Sketch a database before writing a single line of SQL — what an entity is, how attributes dress it up, and how relationships with the right cardinality capture real-world rules like one-to-many and many-to-many.",
    "image": "",
    "icon": "Layers",
    "order": 1,
    "difficulty": "easy",
    "problemCount": 2
  },
  {
    "title": "Extended ER Features",
    "slug": "extended-er-features",
    "category": "database-fundamentals",
    "description": "The advanced tools of the ER world — building entity hierarchies with generalization and specialization, and the weak entities that can only survive leaning on a strong owner.",
    "image": "",
    "icon": "GitBranch",
    "order": 2,
    "difficulty": "easy",
    "problemCount": 2
  },
  {
    "title": "ER to Relational Mapping",
    "slug": "er-to-relational-mapping",
    "category": "database-fundamentals",
    "description": "Turn a drawn ER diagram into actual tables — seven mechanical rules that decide every primary key, foreign key, and junction table, plus how cardinality and participation constraints survive the journey.",
    "image": "",
    "icon": "Table",
    "order": 3,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Relational Model Basics",
    "slug": "relational-model-basics",
    "category": "relational-model-sql",
    "description": "The formal foundations underneath every SQL table — super keys, candidate keys, primary keys and foreign keys — and the relational algebra operators that serve as SQL's mathematical engine.",
    "image": "",
    "icon": "Braces",
    "order": 4,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Relational Algebra & Calculus",
    "slug": "relational-algebra-calculus",
    "category": "relational-model-sql",
    "description": "Push tables through set operations and joins like a query optimizer — union, intersect, minus, natural joins — and predict exactly which rows come out the other side.",
    "image": "",
    "icon": "Binary",
    "order": 5,
    "difficulty": "hard",
    "problemCount": 2
  },
  {
    "title": "SQL DDL & DML",
    "slug": "sql-ddl-dml",
    "category": "relational-model-sql",
    "description": "The first SQL you will ever run — create and destroy the skeleton of a database with CREATE TABLE and constraints, then fill it with INSERT, UPDATE, and DELETE.",
    "image": "",
    "icon": "Terminal",
    "order": 6,
    "difficulty": "easy",
    "problemCount": 2
  },
  {
    "title": "SQL SELECT Queries",
    "slug": "sql-select-queries",
    "category": "relational-model-sql",
    "description": "SQL's most-used statement — filtering rows with WHERE, sorting with ORDER BY, and rolling data up with aggregates and GROUP BY, including the HAVING filter for groups.",
    "image": "",
    "icon": "Filter",
    "order": 7,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "SQL Joins",
    "slug": "sql-joins",
    "category": "relational-model-sql",
    "description": "Combine two tables into one answer — inner and outer joins that keep unmatched rows, plus the self-join that lets a table talk to itself and the cross join that multiplies everything.",
    "image": "",
    "icon": "GitMerge",
    "order": 8,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Subqueries & Set Operations",
    "slug": "subqueries-set-operations",
    "category": "relational-model-sql",
    "description": "Queries inside queries — scalar, column and correlated subqueries with EXISTS and ANY — then stack result sets on top of each other with UNION, INTERSECT, and EXCEPT.",
    "image": "",
    "icon": "Network",
    "order": 9,
    "difficulty": "hard",
    "problemCount": 2
  },
  {
    "title": "Functional Dependencies",
    "slug": "functional-dependencies",
    "category": "normalization-schema-design",
    "description": "The dependency rules underneath every good schema — what it means for one attribute (or set) to determine another, how to prove dependencies with Armstrong's axioms, and how to compute the closure of an attribute set to find keys and detect bad design.",
    "image": "",
    "icon": "Hash",
    "order": 10,
    "difficulty": "medium",
    "problemCount": 2
  },
  {
    "title": "Normal Forms (1NF- BCNF)",
    "slug": "normal-forms-1nf-bcnf",
    "category": "normalization-schema-design",
    "description": "The normalization ladder — climb from messy tables with repeating groups and duplicate data (1NF) through partial and transitive dependency removal (2NF, 3NF) up to BCNF, where every determinant is a key and nothing can be split away.",
    "image": "",
    "icon": "Layers",
    "order": 11,
    "difficulty": "hard",
    "problemCount": 2
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
  ,
  {
    title: 'ER Diagram Basics',
    slug: 'er-diagram-basics',
    lessonSlug: 'entity-relationship-modeling',
    order: 0,
    description: 'A database blueprint drawn before any code exists — entities as rectangles, attributes as ovals, relationships as diamonds, and the four attribute flavours (simple, composite, multi-valued, derived).',
    explanation: `### Why Draw Before You Build

Building a database straight from a written requirement is like constructing a house without a blueprint — rooms end up where you did not expect them. The **ER diagram** is that blueprint: it shows every *thing* we store data about (**entities**), every *fact* we remember about them (**attributes**), and every *link* between them (**relationships**) — all as a few simple shapes.

### The Three Building Blocks

| Shape | Name | Meaning | Example |
|---|---|---|---|
| Rectangle (❑) | Entity | A thing we store data about — person, place, object, event | STUDENT, BOOK, ORDER |
| Oval (◯) | Attribute | A single fact about an entity | Student's *name*, *rollNo* |
| Diamond (◇) | Relationship | A link between two (or more) entities | STUDENT **enrolls in** COURSE |

**Read a diagram like a sentence:** the diamond is the verb, the rectangles are the subjects. "STUDENT — enrolls in — COURSE" is a sentence your database must be able to answer.

### The Four Flavours of Attributes

| Type | Meaning | Example | How you store it later |
|---|---|---|---|
| **Simple** | One atomic value — cannot be split further | Aadhaar number, salary | A single column |
| **Composite** | Made of smaller logical parts | Address = (city, state, pincode) | Several columns, or one formatted column |
| **Multi-valued** | More than one value at once | A student's phone numbers | A **separate table** (never a comma-separated cell!) |
| **Derived** | Computed from other attributes | Age from DateOfBirth | Not stored — calculated when needed |

❌ **Classic mistake:** squeezing multi-valued data into one cell like \`"ph1, ph2, ph3"\`. You can never query "whose number is ph2?" without scanning every cell. A separate table fixes it:

\`\`\`
PHONE
├── studentID  (links back to STUDENT)
├── phoneNumber
└── (composite key: studentID + phoneNumber)
\`\`\`

### How to Hunt for the Three Elements

Read the requirement and interrogate every noun:

\`\`\`
FOR each noun or noun-phrase in the requirement:
    IF the system stores facts about it          → ENTITY (❑)
    ELSE IF it IS a fact about an entity         → ATTRIBUTE (◯)
    ELSE IF it links two entities together       → RELATIONSHIP (◇)
    ELSE                                         → ignore it (helper/UI detail)
\`\`\`

**Test for entity vs attribute:** ask "what do we record about it?" If the answer is "nothing, it just *is* a value" — it is an attribute. If the answer is a list of properties — it is an entity.

### Worked Example — A Library

Requirement: *"The library has books, each with a title, ISBN and author. Members borrow copies of books; a borrow record stores the date."*

| Sentence piece | Element | Why |
|---|---|---|
| book | Entity ❑ | We store title, ISBN, author for it |
| title, ISBN, author | Attributes ◯ | Facts about a book |
| member | Entity ❑ | We store name, phone, join date |
| date (of borrow) | Attribute ◯ | Belongs to the *borrow* event, not to the member |
| borrows | Relationship ◯→◇→◯ | Links BOOK and MEMBER |

Drawing it: two rectangles (BOOK, MEMBER) with their ovals, and one diamond (BORROWS) between them carrying the *date* oval on its own edge (an attribute of the relationship, not of either entity — the date belongs to the act of borrowing, not to the book or member).

### Common Traps

❌ **Using an attribute as an entity** — "city" is usually an attribute of an address, not its own rectangle (unless you store facts *about* cities).\
❌ **Multi-valued data in one column** — always a separate linked table.\
❌ **Relationship attributes glued to an entity** — the borrow *date* is not "a fact about the book"; it lives on the relationship.\
❌ **Mixing input forms with stored data** — a button or a screen is not a database element; the ER diagram only cares about persistent facts.

### Quick Self-Test (answers at the bottom)

1. In "a customer places an order", what is each noun? (a) both entities, places = relationship (b) order is an attribute (c) places is an entity
2. A student's *another email address* (optional, could be several) is what attribute type? (a) simple (b) composite (c) multi-valued (d) derived
3. Age is usually stored in the database — true or false?
4. Which of these is most likely an ENTITY? (a) the price of a book (b) the book (c) the word "book" in the navbar

**Answers:** 1→a, 2→c, 3→false (it is derived from DateOfBirth), 4→b (we store many facts about the book).

### Key Takeaway

An ER diagram is a **sentence of shapes**. Hunt every noun, label it entity/attribute/relationship, and respect the four attribute flavours — the drawing you make here decides the tables you build later.`
  }
  ,
  {
    title: 'Relationship Types & Cardinality',
    slug: 'relationship-types-cardinality',
    lessonSlug: 'entity-relationship-modeling',
    order: 1,
    description: 'The grammar of relationships — unary, binary and ternary links — plus cardinality (how many?), participation (must or may?), and what each ratio forces in your future tables.',
    explanation: `### Relationships Come in Three Sizes

| Type | Meaning | Example |
|---|---|---|
| **Unary** (one entity) | An entity relates to *itself* | EMPLOYEE **manages** EMPLOYEE (a boss is also an employee) |
| **Binary** (two entities) | The everyday case — one link, two players | CUSTOMER **places** ORDER |
| **Ternary** (three entities) | A link needing all three to make sense | DOCTOR **treats** PATIENT **in** HOSPITAL |

**Ternary rule of thumb:** the relationship is meaningful only when all three participants are known. "Dr. Rao treats Ravi" is incomplete until we add *where*. If you never need all three together, split it into two binary relationships.
Treating a ternary as two binaries loses information — always check the "3 questions" test first.

### Cardinality — How Many?

Cardinality answers: **how many of one side link to one of the other?** Three ratios exist:

| Ratio | Meaning | Classic example |
|---|---|---|
| **1:1** | One X ↔ at most one Y | PERSON — has — AADHAAR (one person, one Aadhaar, one Aadhaar, one person) |
| **1:N** | One X ↔ many Ys (each Y has exactly one X) | DEPARTMENT — employs — EMPLOYEE |
| **M:N** | Many X ↔ many Ys | STUDENT — enrolls in — COURSE |

### The Two-Question Method (never guess again)

To find the ratio between X and Y, ask **both** sides:

\`\`\`
Q1: Can ONE X  be linked to MANY Ys?   (yes/no)
Q2: Can ONE Y  be linked to MANY Xs?   (yes/no)

Q1=no,  Q2=no  →  1:1
Q1=yes, Q2=no  →  1:N   (X is the "one" side)
Q1=no,  Q2=yes →  1:N   (Y is the "one" side)
Q1=yes, Q2=yes →  M:N
\`\`\`

**Worked examples:**

| Sentence | Q1: one X → many Ys? | Q2: one Y → many Xs? | Ratio |
|---|---|---|---|
| Customer **places** Order | one customer → many orders: YES | one order → many customers: NO | **1:N** (Customer 1, Order N) |
| Student **enrolls in** Course | one student → many courses: YES | one course → many students: YES | **M:N** |
| Person **owns** Passport | one person → many passports: NO | one passport → many persons: NO | **1:1** |

### Participation — Must or May?

Participation says whether a *mandatory* side exists:

| Term | Meaning | Diagram notation |
|---|---|---|
| **Total participation** | Every member of this entity MUST take part in the relationship | Double line on that side |
| **Partial participation** | Members of this entity MAY take part | Single line on that side |

**Example — "every employee must be assigned to a department":**
EMPLOYEE —(total)— belongs to —(partial)— DEPARTMENT.
- Employee side is **total**: no employee may exist without a department.
- Department side is **partial**: a department may exist with zero employees (yet).

### Why Cardinality Decides Your Future Tables

| Ratio | What it forces when you build tables |
|---|---|
| 1:1 | Put the foreign key on **either** side (optionally with a UNIQUE constraint) |
| 1:N | Foreign key goes on the **N** side (add NOT NULL if the N side is total) |
| M:N | **Never** a foreign key — build a separate junction/link table with both keys |

### Common Traps

❌ **Saying 1:N when the sentence is M:N** — if both sides can have many, it is M:N (courses enrol many students *and* students take many courses).\
❌ **"Total" written as "at least one" on the WRONG side** — always attach the double line to the entity that *must* participate.\
❌ **Unary relationships forgotten in counting** — an employee managing employees is still a relationship; give it its own thought about cardinality (one manager can manage many — 1:N).\
❌ **Ternary cardinality read as three binary ratios** — a ternary must be judged as one three-way fact.

### Quick Self-Test (answers at the bottom)

1. "A country has many states; each state belongs to exactly one country" → ratio? (a) 1:1 (b) 1:N (c) M:N
2. "A car has exactly one engine; an engine is made for exactly one car model" → ratio? (a) 1:1 (b) 1:N (c) M:N
3. Total participation on the employee side of "employee — works in — department" means? (a) every department must have employees (b) every employee must have a department (c) departments are optional
4. A relationship where EMPLOYEE manages EMPLOYEE is called? (a) binary (b) unary (c) ternary

**Answers:** 1→b (many states per country), 2→a, 3→b, 4→b.`
  }
  ,
  {
    title: 'Generalization, Specialization & Aggregation',
    slug: 'generalization-specialization-aggregation',
    lessonSlug: 'extended-er-features',
    order: 0,
    description: 'Build entity hierarchies with IS-A links — generalizing common traits upward, specializing subtypes downward — and learn the two constraint axes (disjoint/overlapping, total/partial) that control who belongs where.',
    explanation: `### One Entity Can Wear Many Shapes

A university stores all EMPLOYEE rows together — but full-time staff have *salary and benefits*, while contract staff have *hourly rate and end date*. Stuffing both sets of attributes into one table wastes columns. The fix: an **IS-A hierarchy**.

### Generalization vs Specialization — Two Directions, One Hierarchy

| | Generalization | Specialization |
|---|---|---|
| Direction | **Bottom-up** — find the common core | **Top-down** — split a broad entity into subtypes |
| Trigger | Many similar entities (Bus, Train, Airplane → VEHICLE) | One entity with different behaviour (EMPLOYEE → FullTime, Contract) |
| Shared thing | Common attributes move UP to the superclass | Shared attributes already sit in the superclass |

Both produce the same drawing: a **superclass** on top, **subclasses** below, connected by ISA triangles.

### The ISA Inheritance Rule

A subclass **inherits everything** from its superclass and adds its own attributes on top:

| | Superclass EMPLOYEE | Subclass FULL_TIME |
|---|---|---|
| Own attributes | empID, name, joinDate | salary, benefitsPackage |
| Inherited | — | empID, name, joinDate (comes from above) |
| Key | empID | empID (SAME key — inherited, never re-invented) |

### The Two Constraint Axes — Where Most Questions Live

Axis 1 — **can an entity be in many subclasses at once?**

| Constraint | Meaning | Example |
|---|---|---|
| **Disjoint** | A row belongs to at most ONE subclass | EMPLOYEE → FullTime XOR PartTime (can't be both) — denoted with a "disjoint" arc/D |
| **Overlapping** | A row may sit in several subclasses | VEHICLE → (is a Passenger Vehicle) AND (is an Electric Vehicle) — an EV passenger car is in both |

Axis 2 — **must every superclass row pick a subclass?**

| Constraint | Meaning | Example |
|---|---|---|
| **Total** | Every superclass row MUST be in some subclass | EMPLOYEE → every employee is FullTime or Contract |
| **Partial** | Some rows live only in the superclass | VEHICLE → a delivery van is a Vehicle but not a Car or Truck subtype |

Combine the axes to get four **specialization types** (disjoint-total, disjoint-partial, overlapping-total, overlapping-partial) — every exam question is one of these four.

### Aggregation — When a Relationship Becomes a Thing

Sometimes you must treat a **relationship as an entity** because *another* relationship attaches to it. Classic example:

\`\`\`
PROJECT —works_on— EMPLOYEE   (M:N)

Now: "A DEPARTMENT manages the fact that EMPLOYEE E works on PROJECT P."
The works_on link itself is being linked → AGGREGATE it:
┌─────────────────────────────┐
│ (PROJECT works_on EMPLOYEE) │  ← aggregated as a single box
└─────────────────────────────┘
        ▲
        │ manages
     DEPARTMENT
\`\`\`

**Why not draw DEPARTMENT → PROJECT directly?** A department manages *assignments*, not projects — the aggregation object has its own meaning and can carry its own attributes (e.g., hours) without duplicating the M:N link.

**Rule of thumb:** you need aggregation when a relationship participates in another relationship.

### Choosing Between the Tools

| Situation | Tool |
|---|---|
| Subtypes share attributes & behaviour | Specialization / Generalization |
| A relationship needs its own relationship | Aggregation |
| Attributes differ wildly between groups | Specialization (each subtype keeps its own) |
| Everyone is essentially identical | No hierarchy — one flat entity |

### Common Traps

❌ **Mixing disjoint with overlapping** — an employee cannot be both full-time and contract (disjoint); a car CAN be both passenger and electric (overlapping). The words "at the same time" decide it.\
❌ **Re-adding the inherited key** — subclasses carry the SAME key down from the superclass; they never invent a new primary key.\
❌ **Forgetting total/partial** — "Some vehicles are neither cars nor trucks" makes the hierarchy partial; only "every X must be one of..." makes it total.\
❌ **Aggregation without a reason** — only aggregate when the relationship itself is connected to something.

### Quick Self-Test (answers at the bottom)

1. Specialization runs: (a) top-down (b) bottom-up (c) sideways
2. EMPLOYEE → FullTime XOR Contract is what type of constraint? (a) overlapping-total (b) disjoint-total (c) overlapping-partial
3. A vehicle that is both a car and electric means the subclass membership is: (a) disjoint (b) overlapping (c) neither
4. When a relationship must itself participate in a relationship, we use: (a) generalization (b) specialization (c) aggregation

**Answers:** 1→a, 2→b, 3→b, 4→c.`
  }
  ,
  {
    title: 'Weak Entities & Keys',
    slug: 'weak-entities-keys',
    lessonSlug: 'extended-er-features',
    order: 1,
    description: 'Entities that cannot stand alone — dependents, line items and rooms — identified by a partial key plus their owner\'s key, and drawn with a double rectangle and a double diamond.',
    explanation: `### Some Things Only Exist Because Something Else Exists

A DEPENDENT of an employee has no identity in the database on their own — "Ravi" means nothing until we ask *Ravi of which employee?* The DEPENDENT is a **weak entity**: it cannot be identified without its **owner** (strong entity).

### Strong vs Weak — The Comparison Table

| | Strong entity | Weak entity |
|---|---|---|
| Has its own key? | Yes | No — never enough attributes for a primary key |
| Can exist alone? | Yes | No — dies if the owner dies |
| Diagram | Single rectangle | **Double rectangle** |
| Relationship to owner | Ordinary | **Identifying relationship** (double diamond) |
| Example | EMPLOYEE | DEPENDENT (of an employee) |
| Key in tables | Primary key of its table | **Composite key = owner's PK + partial key** |

### The Partial Key (Discriminator)

The weak entity contributes a **partial key** — unique only *within* the owner's family:

| Weak entity | Owner | Partial key | Full composite primary key |
|---|---|---|---|
| DEPENDENT | EMPLOYEE | name | (empID, name) |
| LINE_ITEM | ORDER | itemNo | (orderID, itemNo) |
| ROOM | HOTEL | roomNo | (hotelID, roomNo) |
| INSTALLMENT | LOAN | installmentNo | (loanID, installmentNo) |

\`\`\`
Two hotels both have "Room 101" — no problem.
"HotelID + 101" is unique across the WHOLE database.
\`\`\`

### The Three Test Questions

\`\`\`
1. Can it be identified WITHOUT any other table's key?  → YES = strong ; NO = weak
2. Does it make sense with zero rows when the owner exists? → depends on participation
3. Is its key made from ANOTHER entity's key + its own?    → YES = classic weak entity
\`\`\`

A simple rule that covers every exam: **if the primary key must borrow the owner's key, it is weak.**

### Why Weak Entities Matter in Table Design

Weak entities dictate a **composite primary key** and a **mandatory foreign key**:

| Design rule | Why |
|---|---|
| Composite PK (ownerPK + partialKey) | The partial key alone can never be unique — the owner key makes it unique |
| FK to owner with ON DELETE CASCADE | Owner gone → dependent rows are meaningless and must die with it |
| Identifying relationship | The link to the owner is not optional; it is part of the identity |

### Common Traps

❌ **Calling every child a weak entity** — LINE_ITEM is weak (needs orderID), but a SHIPMENT tracking number is strong (unique worldwide). The test is *can it be identified alone?*
❌ **Partial key treated as a global key** — "Room 101" is not unique; only (hotelID, 101) is.
❌ **Weak entity with no owner** — a weak entity ALWAYS sits on the many side of an identifying relationship to exactly one owner.
❌ **Cascade rules forgotten** — deleting the owner must delete the weak rows; leaving orphans violates even the meaning of the data.

### Quick Self-Test (answers at the bottom)

1. Which of these is a weak entity? (a) Employee with empID (b) Order line item with order's ID + item number (c) Aadhaar (d) Book with ISBN
2. The partial key alone is unique: (a) across the database (b) only within its owner's set (c) never unique
3. A weak entity's table key is: (a) its own surrogate id (b) ownerPK + partial key (c) just the partial key
4. ROOM in "HOTEL has ROOM" — what makes Room 101 OK in two hotels? (a) hotelID + 101 composite (b) 101 alone is unique (c) room numbers are global

**Answers:** 1→b, 2→b, 3→b, 4→a.`
  }
  ,
  {
    title: 'Mapping ER Diagrams to Tables',
    slug: 'mapping-er-diagrams-tables',
    lessonSlug: 'er-to-relational-mapping',
    order: 0,
    description: 'The seven mechanical rules that turn any ER diagram into tables — strong entities become tables, weak entities borrow keys, M:N becomes a junction table, and multi-valued attributes get a home of their own.',
    explanation: `### From Diagram to Database — The Translation Layer

An ER diagram describes *what* the data means; a relational schema says *how* it will sit in tables. The mapping between them is so standardised it can be taught as **seven rules**. Apply them in order and you can translate any diagram without thinking twice.

### The Seven Rules

| # | ER element | Relational result |
|---|---|---|
| 1 | Strong entity | A table. Each attribute → a column. Entity key → primary key |
| 2 | Weak entity | A table whose primary key = **owner's PK + partial key** (FK to owner with CASCADE) |
| 3 | 1:1 relationship | Foreign key on **either** side (+ UNIQUE to keep it 1:1) |
| 4 | 1:N relationship | Foreign key on the **N side** (NOT NULL if that side participates totally) |
| 5 | M:N relationship | A **junction table** with both foreign keys; composite primary key |
| 6 | Multi-valued attribute | Its **own table** (entity key + the value, both in the PK) |
| 7 | ISA / specialization | One of the three options (merged / per-subclass / superclass + subclasses) |

### Rule 3 & 4 In Pictures

**1:N — DEPARTMENT employs EMPLOYEE:**

\`\`\`
DEPARTMENT (deptID PK)
EMPLOYEE   (empID PK, name, deptID FK → DEPARTMENT)   ← FK on the N side
\`\`\`

**M:N — STUDENT enrolls in COURSE:**

\`\`\`
STUDENT   (studentID PK)
COURSE    (courseID PK)
ENROLLS   (studentID FK, courseID FK, PRIMARY KEY (studentID, courseID))
            ↑ junction table — never a plain FK in either main table
\`\`\`

### Rule 6 — The Multi-Valued Attribute

"Member has up to 3 phone numbers" produces:

\`\`\`
MEMBER     (memberID PK, name)
MEMBER_PHONE (memberID FK, phone, PRIMARY KEY (memberID, phone))
\`\`\`

The value itself joins the key so the same number cannot be stored twice for one member.

### A Full Walkthrough — One Diagram, All Rules

ER: PROFESSOR (profID, name) — teaches — SUBJECT (code, title); SUBJECT — offered by — DEPARTMENT (deptID); a professor may head at most one department.

| Rule used | Result |
|---|---|
| 1 | PROFESSOR(profID PK, name) |
| 1 | SUBJECT(code PK, title) |
| 1 | DEPARTMENT(deptID PK) |
| 5 (M:N) | TEACHES(profID FK, code FK, PK(profID, code)) |
| 4 (1:N) | SUBJECT gets deptID FK → DEPARTMENT |
| 3 (1:1) | PROFESSOR gets headOfDept FK → DEPARTMENT with UNIQUE |

### The Order Matters

Rule 1 first (all strong tables), then weak entities, THEN the links. If you jump straight to relationships, you will be writing foreign keys to tables that do not exist yet.

### Common Traps

❌ **FK on the wrong side of 1:N** — the "many" side carries the foreign key, always.\
❌ **Junction table without a composite PK** — the pair (studentID, courseID) must be unique; an auto-id alone invites duplicates.\
❌ **Multi-valued attribute as a comma list** — it gets its own table (rule 6), no exceptions.\
❌ **Skipping rule 2** — weak entities keep the owner key inside their primary key; a surrogate id is not acceptable here.

### Quick Self-Test (answers at the bottom)

1. A 1:N relationship puts the FK on: (a) the one side (b) the N side (c) a junction table
2. An M:N relationship becomes: (a) an FK (b) a junction table (c) a merged table
3. A multi-valued attribute becomes: (a) a column (b) its own table (c) part of the entity's key
4. A weak entity's PK is: (a) its own id (b) owner's PK + partial key (c) partial key alone

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'Mapping Constraints',
    slug: 'mapping-constraints',
    lessonSlug: 'er-to-relational-mapping',
    order: 1,
    description: "How the drawing's rules survive the trip to SQL — cardinality becomes foreign keys and UNIQUE, participation becomes NOT NULL, and referential integrity is steered with ON DELETE actions.",
    explanation: `### Constraints Are the Diagram's Fine Print

The ER diagram says "every employee MUST have a department". When we map to tables we must translate that *must* — otherwise the database happily stores an employee with no department. Constraints are how the drawing's promises become SQL's guarantees.

### Cardinality → Keys

| ER fact | SQL translation |
|---|---|
| 1:1 | FK on either side + **UNIQUE** on the FK column (a person's passport row can point at a person at most once) |
| 1:N | FK on the **N side**; optional UNIQUE never needed here |
| M:N | Junction table; **composite PK** on the two FKs |

### Participation → NULL Rules

| ER fact | SQL translation |
|---|---|
| Total (line is double) | **NOT NULL** on the foreign key — a row without the link is rejected by the database itself |
| Partial | FK stays **nullable** — such rows are legal |

\`\`\`
EMPLOYEE.deptID NOT NULL   ← "every employee MUST be assigned to a department"
DEPARTMENT managerID NULL   ← "a department MAY have a manager"
\`\`\`

### Referential Integrity → ON DELETE Actions

What happens when the row the FK points to is deleted? The diagram does not say — you choose:

| Action | Effect | When to use |
|---|---|---|
| CASCADE | Delete the children with the parent | Weak entities, junction tables |
| SET NULL | Children survive; FK becomes NULL | Optional links (department loses manager) |
| RESTRICT / NO ACTION | Deleting the parent is REJECTED while children exist | Money-sensitive records — never silently destroy |
| SET DEFAULT | Children jump to a fallback value | Rarely needed |

### Worked Translation

ER: "Every order must belong to exactly one customer. A customer may have zero or many orders."

| Diagram element | SQL |
|---|---|
| Order → Customer is 1:N | \`\`\`Customer(customerID PK, ...)\`\`\` + \`\`\`Orders(orderID PK, customerID FK NOT NULL → Customer)\`\`\` |
| N side total (orders must exist) | \`\`\`customerID NOT NULL\`\`\` |
| Customer side partial | Customer table needs no order column at all! |
| Deleting a customer | \`\`\`ON DELETE CASCADE\`\`\` deletes their orders — or RESTRICT if history must be kept |

### Common Traps

❌ **UNIQUE on a 1:N foreign key** — that would force every order to a different customer; UNIQUE belongs only to 1:1 mappings.\
❌ **NOT NULL on partial participation** — "may have zero or many" must map to a NULLable FK; NOT NULL would forbid the zero case.\
❌ **Mixing SET NULL with total participation** — setting NULL violates the NOT NULL promise; pick CASCADE or RESTRICT instead.\
❌ **Auto-created junction rows** — junction-row FK columns are NOT NULL and CASCADE; a junction row without both sides is garbage.

### Quick Self-Test (answers at the bottom)

1. Total participation on the FK's side maps to: (a) UNIQUE (b) NOT NULL (c) CASCADE
2. A 1:1 link needs which extra keyword on the FK? (a) NOT NULL (b) UNIQUE (c) DEFAULT
3. Deleting a customer with CASCADE deletes their: (a) orders (b) only the customer row (c) nothing
4. RESTRICT is safer than CASCADE when: (a) children are transient (b) records are money-sensitive (c) the FK is nullable

**Answers:** 1→b, 2→b, 3→a, 4→b.`
  }
  ,
  {
    title: 'Keys (Candidate, Primary, Foreign, Super)',
    slug: 'keys-candidate-primary-foreign-super',
    lessonSlug: 'relational-model-basics',
    order: 0,
    description: 'The identity system of relational tables — super keys and minimal candidate keys, the chosen primary key, alternate keys in waiting, and composite keys that need several columns to be unique.',
    explanation: `### Every Row Needs A Name

In a relational table, rows have no order — so the database needs a *value* that can name a row forever. That value is a key. Different keys play different roles, and interview questions love to shuffle them around.

### The Key Family Table

| Key | Definition | Example (EMP(empID, pan, phone, name)) |
|---|---|---|
| **Super key** | ANY set of columns that is unique per row | empID · (empID, name) · (pan, phone) · (empID, pan, name) |
| **Candidate key** | A MINIMAL super key — remove any column and uniqueness dies | empID · pan · phone (if phone is unique) |
| **Primary key** | The one candidate key **chosen** to be the row's official name | empID |
| **Alternate key** | Candidate keys NOT chosen | pan, phone |
| **Foreign key** | Column(s) in this table that reference a key of another table | EMP.deptID → DEPARTMENT.deptID |
| **Composite key** | A key made of ≥ 2 columns | (deptID, role) |

### Super vs Candidate — The Minimality Test

A candidate key must pass TWO tests:

\`\`\`
1. UNIQUENESS  — no two rows share the same value
2. MINIMALITY  — delete any column and uniqueness breaks
\`\`\`

| Key | Unique? | Minimal? | Verdict |
|---|---|---|---|
| empID | ✓ | ✓ | Candidate |
| (empID, name) | ✓ | ✗ (empID alone works) | Super only |
| (pan, phone) | ✓ (both unique columns) | ✗ | Super only |
| name | ✗ | — | Not a key at all |

### Where The Keys Come From / Go

**Primary key rules:**
- NOT NULL and UNIQUE — that is the whole definition
- Chosen from the candidate keys — the smallest or most stable one wins
- Composite primary keys are legal: (deptID, role) + (deptID, role, fromDate) can co-exist as different candidate keys

**Foreign key rules:**
- References the PRIMARY KEY of another table (or any unique column)
- Values in the FK must EXIST in the target table — **referential integrity**
- The FK column name needn't match; the *meaning* must

### Reading A Table For Its Keys

EMP(empID, pan, phone, name, deptID):

\`\`\`
UNIQUE columns → empID, pan, phone (each alone can name a row)
CANDIDATE keys  → empID, pan, phone (single-column, minimal by default)
PRIMARY key     → the one we pick: empID
ALTERNATE keys  → pan, phone
SUPER keys      → any superset: (empID, name), (pan, name, deptID), ...
FOREIGN key     → deptID → DEPARTMENT.deptID
\`\`\`

### Common Traps

❌ **Calling (empID, name) a candidate key** — it is unique but NOT minimal; only super key.\
❌ **Thinking the primary key must be a single column** — composite primary keys are perfectly normal.\
❌ **Foreign key must match column names** — no; only the referenced values must exist.\
❌ **Believing every unique column is the primary key** — unique columns are candidates; you *choose* one.\
❌ **Shipment tracking numbers as primary keys in every scenario** — stability and size matter, not just uniqueness.

### Quick Self-Test (answers at the bottom)

1. In EMP(empID, pan, phone), how many candidate keys exist? (a) 1 (b) 2 (c) 3
2. (empID, name) is what kind of key? (a) candidate (b) super (c) primary
3. A composite key always has: (a) one column (b) two or more columns (c) a foreign key
4. Which column is the FK in EMP(empID, pan, deptID)? (a) empID (b) pan (c) deptID

**Answers:** 1→c, 2→b, 3→b, 4→c.`
  }
  ,
  {
    title: 'Relational Algebra Basics',
    slug: 'relational-algebra-basics',
    lessonSlug: 'relational-model-basics',
    order: 1,
    description: 'The mathematical operators underneath every SQL query — SELECT (σ), PROJECT (π), RENAME (ρ), set operations, and join — the formal language that lets us prove what a query returns.',
    explanation: `### SQL Is Sugar On Top Of Algebra

Every SQL query you write is really a chain of **relational algebra** operators. Databases do their thinking in algebra: the optimizer rewrites query plans using algebra rules, and interviewers ask algebra questions to check that you understand *why* a query behaves the way it does.

### The Core Operators

| Symbol | Name | What it does | Reads like |
|---|---|---|---|
| σ (sigma) | SELECT | Filters **rows** by a condition | "give me the rows where..." |
| π (pi) | PROJECT | Picks **columns** (removes duplicates) | "show me only these columns" |
| ρ (rho) | RENAME | Renames a table or column | "call it X" |
| ∪ | UNION | All rows of both tables (duplicates dropped) | "add the two lists" |
| ∩ | INTERSECT | Rows present in BOTH tables | "keep what's in both" |
| − | DIFFERENCE | Rows in A but not in B | "A minus B" |
| × | CARTESIAN | Every combination of rows | "pair everyone with everything" |
| ⋈ | JOIN | Rows paired on a matching condition | "stitch the tables together" |

### SELECT vs PROJECT — The Two That Trap Everyone

| | σ (SELECT) | π (PROJECT) |
|---|---|---|
| Filters | **Rows** (horizontal) | **Columns** (vertical) |
| Notation | σ\_condition(table) | π\_columns(table) |
| Example | σ\_salary>50000(EMP) — *all columns, only rich rows* | π\_name(EMP) — *only names, all rows* |
| Duplicates | Kept | **Removed** |

### Reading Algebraic Expressions

\`\`\`
σ (department = 'Research') (EMPLOYEE)
   └──────── rows only from the Research department ────────┘

π (name, salary) (EMPLOYEE)
   └────── keep only the name and salary columns ────────────┘

π (name) ( σ (salary > 50000) (EMPLOYEE) )
   └─ project  ┘  └──── select ────┘
   = names of employees earning more than 50,000
\`\`\`

**Composition rule:** an inner expression produces a *relation* (a table), and any operator can eat a table — so you can stack them unlimitedly. This nesting is exactly how SQL queries nest.

### Algebra ↔ SQL Translation Table

| Algebra | SQL |
|---|---|
| σ (select rows) | WHERE |
| π (project columns) | SELECT columns / DISTINCT |
| ∪ | UNION |
| ∩ | INTERSECT |
| − | EXCEPT / NOT IN |
| × | CROSS JOIN |
| ⋈ | JOIN ... ON ... |

### Common Traps

❌ **SELECT/PROJECT name clash** — SQL's SELECT does BOTH jobs; algebra splits them. σ = rows, π = columns. Never mix.\
❌ **π keeps duplicates OUT** — yeah: PROJECT removes duplicate rows in the pure algebra.\
❌ **× without a purpose** — a cartesian product alone is almost always a bug; joins exist to pair meaningfully.\
❌ **Expressions read left-to-right** — operators bind to their immediate inner table first; parse inside-out.

### Quick Self-Test (answers at the bottom)

1. σ filters: (a) columns (b) rows (c) tables
2. π removes: (a) columns (b) duplicate rows (c) NULLs
3. A ∪ B contains: (a) rows in both only (b) all rows of A and B, no duplicates (c) only rows of A
4. Which symbol pairs rows on a condition? (a) × (b) ⋈ (c) ρ

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'Set Operations in Relational Algebra',
    slug: 'set-operations-relational-algebra',
    lessonSlug: 'relational-algebra-calculus',
    order: 0,
    description: 'Union, intersect and minus — the operators that combine two whole tables — plus the union-compatibility rule that decides whether the operation is even legal.',
    explanation: `### Tables As Sets

Relational algebra treats every relation as a **set of rows** — and sets can be added, overlapped, and subtracted. The three set operators work on TWO whole tables and produce one result table.

### The Union-Compatibility Rule

Before any set operation, the two tables MUST match:

| Rule | Meaning |
|---|---|
| Same number of columns (degree) | A(3 columns) ∪ B(4 columns) → ILLEGAL |
| Corresponding columns have the same domain | Mixing phone numbers with salaries → nonsense |

\`\`\`
Is R ∪ S legal?
R(a, b) and S(a, b)  → SAME degree (2) → LEGAL
R(a, b) and X(a)     → different degree → ILLEGAL
R(a, b) and S(b, a)  → compatible but columns align BY POSITION, not by name
\`\`\`

### The Three Operators With Real Data

R = students in course 1, S = students in course 2:

| R | | S | | R ∪ S | | R ∩ S | | R − S | | S − R |
|---|---|---|---|---|---|---|---|---|---|---|
| Alice | | Bob | | Alice | | Charlie | | Alice | | Bob |
| Charlie | | Charlie | | Bob | | (only shared) | | (only in R) | | (only in S) |
| | | | | Charlie | | | | | | |

| Operator | Result contains | Mentally |
|---|---|---|
| R ∪ S | Rows in R **or** S (duplicates removed) | the combined list |
| R ∩ S | Rows in BOTH R and S | the common ones |
| R − S | Rows in R **but not** in S | what R alone brings |
| S − R | Rows in S but not in R | what S alone brings |

### ∪ vs ⋈ — Don't Confuse Them

| | UNION (∪) | JOIN (⋈) |
|---|---|---|
| Puts rows | Below each other (vertical, same columns) | Beside each other (columns merged) |
| Row count | R ∪ S ≤ R + S | Up to R × S |
| Warning | Extreme duplicate elimination | Extreme multiplication |

### ρ (Rename) — The Glue For Set Ops

Sometimes the same table appears twice (e.g. unioning employees of two branches):

\`\`\`
ρ (BranchA, EMPLOYEE)   — now EMPLOYEE is also called BranchA
π_name(BranchA) ∪ π_name(BranchB)   — names from either branch
\`\`\`

Rename is how you reuse a table in one expression without ambiguity.

### Common Traps

❌ **Union of incompatible tables** — differing degrees or domains = illegal; always check first.\
❌ **Duplicates in your ∪ answer** — algebra drops them; writing "Alice, Charlie, Alice" is wrong.\
❌ **R − S vs S − R** — direction matters; "minus" is not commutative.\
❌ **∪ vs ⋈** — union stacks rows; join merges columns; mixing them up loses marks on every problem.

### Quick Self-Test (answers at the bottom)

1. R(2 cols) ∪ S(3 cols) is: (a) legal (b) illegal — different degrees (c) legal if both are text
2. R ∩ S returns rows: (a) in R only (b) in both (c) in neither
3. Duplicates in a set-operation result are: (a) kept (b) removed (c) doubled
4. ρ exists so that: (a) columns can be dropped (b) a table can appear twice under a new name (c) rows are sorted

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'Joins in Relational Algebra',
    slug: 'joins-relational-algebra',
    lessonSlug: 'relational-algebra-calculus',
    order: 1,
    description: 'The join family — theta joins for any condition, equi-joins for equality, the famous natural join that de-duplicates shared columns, and outer joins that keep unmatched rows.',
    explanation: `### From Cartesian Chaos To Meaningful Pairs

The cartesian product × pairs EVERY row of A with EVERY row of B — mostly garbage. A **join** (⋈) applies a condition and keeps only the meaningful pairs. The join family is the same idea at different strictness levels.

### The Join Family

| Join | Condition | Result columns | Unmatched rows |
|---|---|---|---|
| θ-join (theta) | Any comparison: <, >, ≤, ≥, =, ≠ | A + B (all columns, duplicates kept) | Dropped |
| Equi-join | Equality only (A.x = B.y) | A + B (both join columns appear!) | Dropped |
| **Natural join (⋈)** | Equality on SAME-NAMED columns | A + B **minus one copy** of the common column | Dropped |
| Left outer join (⋈L) | As natural | + keeps ALL left rows (unmatched → NULLs) | Left rows kept |
| Right outer (⋈R) | As natural | + keeps ALL right rows | Right rows kept |
| Full outer (⋈F) | As natural | + keeps EVERYTHING | Both kept |

### Natural Join — The Star Of The Show

Natural join automatically matches on columns that have the **same name in both tables**:

\`\`\`
STUDENT (sid, name, cid)      ENROLLED (cid, grade)

STUDENT ⋈ ENROLLED:
  1. Find common columns → cid
  2. Pair rows where cid matches; drop the SECOND cid column
  3. Result: (sid, name, cid, grade)
\`\`\`

| STUDENT.sid | name | cid | ⋈ | cid | grade | → | sid | name | cid | grade |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Aarav | 10 | | 10 | A | | 1 | Aarav | 10 | A |
| 2 | Meera | 20 | | 20 | B | | 2 | Meera | 20 | B |
| 3 | Ravi | 20 | | | | | 3 | Ravi | 20 | B |

### Natural Join Edge Cases (exam specials)

| Situation | Result |
|---|---|
| No shared column names | Natural join = **cartesian product** (every pair) |
| Two shared columns | Matches on BOTH at once |
| Column names differ but meanings match | **Rename first** (ρ), then natural join |

### Outer Joins — The Safety Net

A left outer join starts from the natural join and **adds back every left row** that matched nothing, padded with NULLs:

\`\`\`
COURSE (cid, title)  ⋈L  ENROLLED (cid, grade)
-> every course appears, even courses with ZERO enrollments
   (enrollment columns become NULL for them)
\`\`\`

### Common Traps

❌ **Equi-join keeping duplicated join columns** — equi-join shows both copies; natural join shows one. Read the question's wording carefully.\
❌ **Natural join with no common attribute** — you get ×, a full cartesian product — usually not what the question intends.\
❌ **Outer joins only when told** — plain "join" in algebra means inner: unmatched rows vanish.\
❌ **Rename forgotten** — σ on the wrong side of a rename, and your expressions break instantly.

### Quick Self-Test (answers at the bottom)

1. Natural join matches on: (a) any condition (b) same-named columns (c) keys only
2. If no column shares a name, natural join equals: (a) intersection (b) cartesian product (c) minus
3. Left outer join keeps: (a) only matched rows (b) all left rows, NULL-padded (c) all right rows
4. Equi-join and natural join differ: (a) never (b) equi-join keeps both join columns (c) equi-join keeps one

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'CREATE, ALTER, DROP Statements',
    slug: 'create-alter-drop-statements',
    lessonSlug: 'sql-ddl-dml',
    order: 0,
    description: 'The Data Definition Language — building tables with column types and constraints, reshaping them with ALTER, and destroying or emptying them with DROP and TRUNCATE.',
    explanation: `### DDL — The Database Skeleton

**DDL (Data Definition Language)** is the part of SQL that creates, changes, and removes the *structure* of the database — not the data inside it. Three verbs rule this world: CREATE, ALTER, DROP.

### CREATE TABLE — The Blueprint

\`\`\`sql
CREATE TABLE Employee (
  empID     INT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  salary    DECIMAL(10, 2),
  hireDate  DATE DEFAULT CURRENT_DATE,
  deptID    INT REFERENCES Department(deptID),
  status    VARCHAR(10) CHECK (status IN ('active', 'inactive'))
);
\`\`\`

### The Column Type Table (pick wisely)

| Type | Holds | Example |
|---|---|---|
| INT / SMALLINT / BIGINT | Whole numbers | 42, 999999999 |
| DECIMAL(p, s) | Exact money-style numbers | DECIMAL(10,2) → 99999999.99 |
| FLOAT / REAL | Approximate decimals | scientific data |
| VARCHAR(n) | Text up to n chars | names, titles |
| CHAR(n) | Fixed-length text (padded) | country codes |
| DATE / TIME / DATETIME | Calendar moments | '2026-08-11' |
| BOOLEAN | true / false | isActive |

### The Constraint Table

| Constraint | Effect |
|---|---|
| PRIMARY KEY | NOT NULL + UNIQUE — the row's identity |
| FOREIGN KEY | Must match an existing row's key — referential integrity |
| NOT NULL | The column may never be empty |
| UNIQUE | No two rows share this value |
| CHECK | Every value must pass the condition |
| DEFAULT | Automatic value when none is given |

### ALTER — Reshaping Without Rebuilding

| Statement | Meaning |
|---|---|
| \`\`\`ALTER TABLE Employee ADD COLUMN email VARCHAR(100);\`\`\` | New column appears on all rows (NULL for existing) |
| \`\`\`ALTER TABLE Employee DROP COLUMN status;\`\`\` | Permanently removes a column |
| \`\`\`ALTER TABLE Employee MODIFY COLUMN name VARCHAR(80);\`\`\` | Widens/narrows the type |
| \`\`\`ALTER TABLE Employee ADD CONSTRAINT chk_salary CHECK (salary > 0);\`\`\` | Adds a named constraint later |

### DROP vs TRUNCATE vs DELETE — The Big Confusion

| | DROP TABLE | TRUNCATE TABLE | DELETE FROM |
|---|---|---|---|
| Removes | Structure + data + indexes | All data (structure stays) | Chosen rows |
| Can it be rolled back (in most engines)? | Usually no | Usually no | Yes — with a transaction |
| Speed | Instant | Fast | Slower (row by row) |
| WHERE clause | No | No | Yes |
| Kind | DDL | DDL | DML |

### Common Traps

❌ **DROP when you meant TRUNCATE** — one wipes the table definition forever; the other just empties it.\
❌ **VARCHAR vs CHAR** — variable-length text is VARCHAR; fixed-coded values are CHAR.\
❌ **CHECK ranges on wrong sides** — \`\`\`CHECK (salary > 0)\`\`\` rejects zero and negatives; don't invert it.\
❌ **Foreign keys to missing tables** — the referenced table must exist BEFORE you create the child table.\
❌ **DECIMAL for money and FLOAT for money** — always DECIMAL for money; FLOAT introduces rounding surprises.

### Quick Self-Test (answers at the bottom)

1. DROP TABLE removes: (a) data only (b) structure + data (c) structure only
2. Which constraint makes a column both NOT NULL and UNIQUE? (a) FOREIGN KEY (b) PRIMARY KEY (c) CHECK
3. Money columns should use: (a) FLOAT (b) DECIMAL (c) VARCHAR
4. ALTER TABLE ... ADD COLUMN: (a) removes data (b) reshapes structure (c) empties the table

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'INSERT, UPDATE, DELETE',
    slug: 'insert-update-delete',
    lessonSlug: 'sql-ddl-dml',
    order: 1,
    description: 'The Data Manipulation Language — adding rows with INSERT, editing them with UPDATE, removing them with DELETE, and the WHERE safety rules that keep you from wiping entire tables.',
    explanation: `### DML — The Data Mover

DDL builds the skeleton; **DML (Data Manipulation Language)** fills and edits the rows. Three verbs: INSERT, UPDATE, DELETE.

### INSERT — Three Ways To Add Rows

\`\`\`sql
-- 1. Full row, values in column order
INSERT INTO Employee VALUES (1, 'Aarav', 60000);

-- 2. Named columns (safe — order free, missing get DEFAULT/NULL)
INSERT INTO Employee (empID, name) VALUES (2, 'Meera');

-- 3. Many rows at once
INSERT INTO Employee (empID, name) VALUES
  (3, 'Ravi'),
  (4, 'Sneha');

-- 4. From a query — the copy machine
INSERT INTO OldEmployee (empID, name)
SELECT empID, name FROM Employee WHERE hireDate < '2020-01-01';
\`\`\`

**Rule of thumb:** always name the columns. When the table gains a column, unnamed inserts break; named inserts survive.

### UPDATE — Edit With A Target

\`\`\`sql
-- WITHOUT a WHERE clause: EVERY row gets changed! (usually a disaster)
UPDATE Employee SET salary = salary * 1.10;

-- WITH a WHERE: only the matching rows
UPDATE Employee
SET salary = salary * 1.10, status = 'promoted'
WHERE deptID = 5;
\`\`\`

**The golden rule: write the WHERE first, then the SET.** If you can't say which rows you mean, you don't understand the statement yet.

### DELETE — Remove With Care

\`\`\`sql
-- All rows: table survives but is emptied
DELETE FROM Employee;

-- Targeted: only the fired people
DELETE FROM Employee
WHERE status = 'terminated';
\`\`\`

### Foreign-Key Side Effects — The Ripple

Deleting an \`\`\`ON DELETE CASCADE\`\`\` parent removes children too; an \`\`\`ON DELETE RESTRICT\`\`\` parent refuses to die while children exist. Choose per relationship — never delete "blind".

### The Safety Net — Transactions

\`\`\`sql
BEGIN;
DELETE FROM Employee WHERE status = 'terminated';  -- risky step
ROLLBACK;  -- oops — undo everything
-- or COMMIT;  -- yes — keep it
\`\`\`

Wrap multi-row damage in a transaction; you can inspect before committing.

### Common Traps

❌ **UPDATE / DELETE without WHERE** — the classic "oops, I deleted the whole table" — every beginner does it once; transactions save you.\
❌ **INSERT without column names** — the column-order trap; add one column later and everything breaks.\
❌ **DELETE vs TRUNCATE confusion** — DELETE can be rolled back in a transaction; TRUNCATE usually cannot.\
❌ **Forgetting FK ripples** — a CASCADE delete removes more rows than your WHERE mentioned; check \`\`\`RESTRICT\`\`\` vs \`\`\`CASCADE\`\`\` before writing.

### Quick Self-Test (answers at the bottom)

1. UPDATE without WHERE affects: (a) one row (b) all rows (c) zero rows
2. INSERT with named columns is safer because: (a) it's faster (b) order doesn't matter and defaults fill gaps (c) fewer keystrokes
3. Which can usually be rolled back inside a transaction? (a) TRUNCATE (b) DELETE (c) both
4. CASCADE on delete means: (a) children are deleted too (b) children survive (c) the delete fails

**Answers:** 1→b, 2→b, 3→b, 4→a.`
  }
  ,
  {
    title: 'Basic SELECT, WHERE, ORDER BY',
    slug: 'basic-select-where-order-by',
    lessonSlug: 'sql-select-queries',
    order: 0,
    description: 'The everyday query recipe — pick columns with SELECT, filter rows with WHERE, remove repeats with DISTINCT, and sort the survivors with ORDER BY plus LIMIT.',
    explanation: `### The SELECT Statement — Reading Data

SELECT is the most-used statement in SQL. It answers one question: *which columns, from which table, for which rows, in what order?*

\`\`\`sql
SELECT column1, column2        -- which columns
FROM Employees                 -- from which table
WHERE department = 'IT'        -- which rows
ORDER BY salary DESC           -- in what order
LIMIT 10;                      -- how many at most
\`\`\`

### The WHERE Toolbox

| Operator | Meaning | Example |
|---|---|---|
| =  <>  != | equal / not equal | \`\`\`WHERE dept = 'IT'\`\`\` |
| >  <  >=  <= | comparisons | \`\`\`WHERE salary >= 50000\`\`\` |
| BETWEEN a AND b | inclusive range | \`\`\`WHERE salary BETWEEN 40000 AND 60000\`\`\` |
| IN (list) | matches any listed value | \`\`\`WHERE dept IN ('IT', 'HR')\`\`\` |
| LIKE pattern | partial text match | \`\`\`WHERE name LIKE 'Sha%'\`\`\` |
| IS NULL / IS NOT NULL | missing values | \`\`\`WHERE email IS NULL\`\`\` |
| AND / OR / NOT | combine conditions | \`\`\`WHERE dept = 'IT' AND salary > 40000\`\`\` |

### LIKE — The Two Wildcards

| Pattern | Matches |
|---|---|
| \`\`\`'Sha%'\`\`\` | Starts with "Sha" — any ending |
| \`\`\`'%raj'\`\`\` | Ends with "raj" |
| \`\`\`'_a%'\`\`\` | Second letter is "a" (underscore = ONE char) |
| \`\`\`'%an%'\`\`\` | Contains "an" anywhere |

### ORDER BY — Sorting The Survivors

| Clause | Effect |
|---|---|
| ORDER BY salary | Ascending (default) |
| ORDER BY salary DESC | Descending |
| ORDER BY dept, salary DESC | Sort by dept, then by salary within each dept |
| LIMIT 3 | Keep only the first 3 rows (after sorting!) |
| OFFSET 3 | Skip 3 rows first (pagination) |

### The Execution Order (mental model)

SQL *looks* like it runs top-to-bottom — it does not:

\`\`\`
FROM       →  pick the table and join everything
WHERE      →  discard rows that fail the filter   (before grouping)
SELECT     →  compute the output columns
DISTINCT   →  drop duplicate output rows
ORDER BY   →  sort what remains
LIMIT      →  cut the list
\`\`\`

That is why \`\`\`WHERE\`\`\` cannot use an alias from \`\`\`SELECT\`\`\`, and why LIMIT sees the sorted list.

### NULL Is A Trap

- NULL means *unknown*, not zero and not empty string
- \`\`\`WHERE salary = NULL\`\`\` matches NOTHING — use \`\`\`IS NULL\`\`\`
- NULLs sort LAST in most engines on ASC — check your engine if it matters

### Common Traps

❌ **= NULL instead of IS NULL** — the most common beginner bug in SQL; \`\`\`= NULL\`\`\` always evaluates to unknown.\
❌ **LIKE without wildcards** — \`\`\`LIKE 'Sha'\`\`\` equals \`\`\`= 'Sha'\`\`\`; you want \`\`\`'Sha%'\`\`\`.\
❌ **LIMIT before ORDER BY thinking** — "top 3" requires ORDER BY first, then LIMIT.\
❌ **AND/OR precedence** — OR binds looser than AND; \`\`\`a OR b AND c\`\`\` means \`\`\`a OR (b AND c)\`\`\` — bracket when in doubt.

### Quick Self-Test (answers at the bottom)

1. Rows where email is missing: (a) \`\`\`WHERE email = NULL\`\`\` (b) \`\`\`WHERE email IS NULL\`\`\` (c) \`\`\`WHERE email = ''\`\`\`
2. Names starting with "Sha": (a) \`\`\`LIKE 'Sha'\`\`\` (b) \`\`\`LIKE 'Sha%'\`\`\` (c) \`\`\`LIKE '%Sha'\`\`\`
3. "Top 3 salaries" requires: (a) LIMIT first (b) ORDER BY salary DESC + LIMIT 3 (c) DISTINCT only
4. LIMIT 10 OFFSET 20 shows rows: (a) 10-20 (b) 21-30 (c) 20-30

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'Aggregate Functions & GROUP BY',
    slug: 'aggregate-functions-group-by',
    lessonSlug: 'sql-select-queries',
    order: 1,
    description: 'Roll many rows into one number — COUNT, SUM, AVG, MIN, MAX — then cut the table into groups with GROUP BY and filter those groups with HAVING.',
    explanation: `### Aggregates — Many Rows, One Number

| Function | Returns | Example |
|---|---|---|
| COUNT(*) | number of rows | 42 employees |
| COUNT(col) | non-NULL values in col | 40 emails (2 NULL) |
| COUNT(DISTINCT col) | unique non-NULL values | 7 departments |
| SUM(col) | total (NULLs ignored) | total salary |
| AVG(col) | average (NULLs ignored) | mean salary |
| MIN / MAX(col) | smallest / largest | cheapest / costliest |

### GROUP BY — Cutting The Table Into Slices

\`\`\`sql
SELECT department, COUNT(*) AS head_count, AVG(salary) AS avg_salary
FROM Employees
GROUP BY department;
\`\`\`

| department | head_count | avg_salary |
|---|---|---|
| HR | 3 | 42000 |
| IT | 5 | 51000 |

**The golden rule:** any column in SELECT that is NOT inside an aggregate must appear in GROUP BY. \`\`\`SELECT department, name, COUNT(*)\`\`\` without name in GROUP BY — illegal in standard SQL.

### WHERE vs HAVING — The Classic Confusion

| | WHERE | HAVING |
|---|---|---|
| Filters | ROWS (before grouping) | GROUPS (after grouping) |
| Can use aggregates? | NO | YES |
| Example | \`\`\`WHERE salary > 40000\`\`\` | \`\`\`HAVING AVG(salary) > 40000\`\`\` |
| Position | Before GROUP BY | After GROUP BY |

\`\`\`
WHERE filters individual rows  →  then rows are grouped  →  HAVING filters groups
\`\`\`

### The Full Execution Order

\`\`\`
FROM      →  WHERE (row filter)  →  GROUP BY (slice)  →  HAVING (group filter)
→ SELECT (compute columns)  →  ORDER BY  →  LIMIT
\`\`\`

That is why \`\`\`WHERE salary > 50000\`\`\` is different from \`\`\`HAVING AVG(salary) > 50000\`\`\` — one keeps rich rows, the other keeps groups whose average is rich.

### NULL Behaviour Inside Aggregates

- \`\`\`AVG\`\`\` and \`\`\`SUM\`\`\` silently skip NULLs — an AVG over (10, NULL, 20) is 15, not 10
- \`\`\`COUNT(*)\`\`\` counts NULL rows too; \`\`\`COUNT(col)\`\`\` does not
- A group of all-NULL values: SUM → NULL, COUNT(*) → still counts

### Common Traps

❌ **Aggregate in WHERE** — \`\`\`WHERE AVG(salary) > X\`\`\` is illegal; that is HAVING's job.\
❌ **Column not in GROUP BY** — the golden rule; every non-aggregate SELECT column must be grouped.\
❌ **COUNT(*) vs COUNT(col)** — one counts rows, the other counts non-NULL values.\
❌ **AVG(0s vs NULLs)** — \`\`\`AVG((10,NULL,20)) = 15\`\`\`; if you want 10, you must handle the NULL explicitly.

### Quick Self-Test (answers at the bottom)

1. Which filters GROUPS? (a) WHERE (b) HAVING (c) LIMIT
2. AVG over (10, NULL, 20) = ? (a) 10 (b) 15 (c) 30
3. Column X in SELECT, not in an aggregate — must appear: (a) in GROUP BY (b) in WHERE (c) nowhere
4. COUNT(*) counts: (a) non-NULL only (b) all rows (c) unique values

**Answers:** 1→b, 2→b, 3→a, 4→b.`
  }
  ,
  {
    title: 'Inner & Outer Joins',
    slug: 'inner-outer-joins',
    lessonSlug: 'sql-joins',
    order: 0,
    description: 'The JOIN family in SQL — INNER keeps only matched pairs, LEFT keeps every left row padded with NULLs, and FULL keeps everything on both sides.',
    explanation: `### Why Joins Exist

Data about one real-world object often lives split across tables — a customer in one, their orders in another. A **join** stitches them back together for a single answer.

### The Four Joins At A Glance

| Join | Unmatched left rows | Unmatched right rows |
|---|---|---|
| INNER JOIN | Dropped | Dropped |
| LEFT JOIN | **Kept (NULL-padded)** | Dropped |
| RIGHT JOIN | Dropped | **Kept (NULL-padded)** |
| FULL OUTER JOIN | Kept | Kept |

### The Visual Memory Trick

\`\`\`
INNER  = match only — the overlap of two circles
LEFT   = everything in circle A, plus its overlap with B
RIGHT  = everything in circle B, plus the overlap
FULL   = everything in both circles
\`\`\`

### The Data

Customers: (1, Aarav), (2, Meera), (3, Ravi) · Orders: (101, 1, 500), (102, 1, 700), (103, 3, 900)

| Query | Result rows |
|---|---|
| INNER: customers with orders | Aarav (×2), Ravi — Meera gone |
| LEFT: all customers + orders | Aarav ×2, **Meera with NULL order**, Ravi |
| RIGHT: all orders + customers | orders 101, 102, 103 — all have customers here |
| FULL: everything | same as LEFT in this data (no orphan orders) |

### The Syntax

\`\`\`sql
SELECT c.name, o.amount
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID;

-- ON vs USING: USING works when both columns share the name
SELECT c.name, o.amount
FROM Customers c
LEFT JOIN Orders o USING (customerID);
\`\`\`

### Less-Is-More Joins

You can skip the word INNER when writing an inner join — \`\`\`JOIN\`\`\` alone means INNER JOIN. MySQL and earlier SQLite do not understand FULL OUTER JOIN — use LEFT + RIGHT and UNION when you need everyone.

### NULL-Fill Behaviour

Unmatched rows get NULLs in *the columns of the other table* — "Meera's order" appears as (Meera, NULL). Filters like \`\`\`WHERE o.amount IS NULL\`\`\` can then find exactly the customers with no orders.

### Common Traps

❌ **INNER when asked for "every customer"** — "every/each/all" hints LEFT (or RIGHT); INNER silently drops the unmatched.\
❌ **FULL OUTER on MySQL** — it is not supported; know your engine before using it.\
❌ **Forgetting the ON condition** — a join without ON is a cartesian product — every pair, multiplied.\
❌ **Ambiguous column names** — two tables both have customerID; qualify them: c.customerID.

### Quick Self-Test (answers at the bottom)

1. "Every customer, with their orders if any" needs: (a) INNER (b) LEFT (c) cartesian
2. Unmatched left rows in INNER JOIN: (a) kept with NULLs (b) dropped (c) duplicated
3. JOIN alone means: (a) INNER (b) LEFT (c) FULL OUTER
4. MySQL does not support: (a) INNER (b) LEFT (c) FULL OUTER JOIN

**Answers:** 1→b, 2→b, 3→a, 4→c.`
  }
  ,
  {
    title: 'Self Joins & Cross Joins',
    slug: 'self-joins-cross-joins',
    lessonSlug: 'sql-joins',
    order: 1,
    description: 'When a table joins itself with aliases to answer "who vs whom" questions — managers and reports — and the cross join that multiplies every row with every row.',
    explanation: `### The Self Join — A Table Versus Itself

The EMPLOYEE table stores both the worker AND their manager (as managerID). To compare an employee with their own boss, you must join Employee to **itself** — SQL needs a second copy, and that copy needs an **alias**:

\`\`\`sql
SELECT w.name AS worker, m.name AS manager
FROM Employee w
JOIN Employee m ON w.managerID = m.empID;
\`\`\`

| worker | manager |
|---|---|
| Aarav | Meera |
| Ravi | Meera |
| Sneha | Aarav |

**Aliases are mandatory** — \`Employee w\` and \`Employee m\` are two logical copies of the same physical table; without aliases, \`ON w.managerID = m.empID\` is unreadable and ambiguous.

### Classic Self-Join Questions

| Question pattern | ON condition |
|---|---|
| Employee vs their own manager | \`\`\`ON w.managerID = m.empID\`\`\` |
| Employees earning more than their manager | self-join + \`\`\`WHERE w.salary > m.salary\`\`\` |
| Pairs who live in the same city | \`\`\`ON a.city = b.city AND a.empID < b.empID\`\`\` |

The \`\`\`a.empID < b.empID\`\`\` trick: without it, every pair appears TWICE (A–B and B–A); the inequality keeps each pair once.

### The Cross Join — Multiplication Without A Condition

\`\`\`sql
SELECT * FROM Shirts CROSS JOIN Sizes;
-- every shirt × every size = shirts × sizes rows
\`\`\`

| Use case | Example |
|---|---|
| Generate all combinations | sizes × colours (9 rows for 3×3) |
| Pivot/calendar tables | dates × hours |
| Debugging tool | see the junk that joins produce without ON |

**Warning:** cross join on big tables explodes — 10,000 × 10,000 = 100,000,000 rows. Rarely intentional in production.

### INNER vs CROSS — The Two-Second Table

| | INNER JOIN | CROSS JOIN |
|---|---|---|
| Condition | ON required | NONE |
| Paired rows | Meaningful matches | Every possible pair |
| Row count | ≤ rows × rows | EXACTLY rows × rows |

### Common Traps

❌ **No alias in a self join** — the query fails or, worse, silently intends the wrong copy.\
❌ **Duplicate pairs** — without \`\`\`a.empID < b.empID\`\`\`, pair questions return every combo twice.\
❌ **CROSS JOIN by accident** — forgetting the ON clause turns any join into a cartesian explosion.\
❌ **Manager lists missing the bossless** — an INNER self join drops the CEO (no manager row); use LEFT JOIN if "everyone" is wanted.

### Quick Self-Test (answers at the bottom)

1. A self join needs: (a) two tables (b) aliases (c) a third copy
2. "Pairs in same city" needs a.empID < b.empID to: (a) sort (b) avoid duplicate pairs (c) filter cities
3. Shirts(4) × Sizes(3) cross join yields: (a) 4 rows (b) 12 rows (c) 1 row
4. A JOIN with no ON becomes: (a) an error (b) a cartesian product (c) a LEFT JOIN

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  }
  ,
  {
    title: 'Nested Subqueries',
    slug: 'nested-subqueries',
    lessonSlug: 'subqueries-set-operations',
    order: 0,
    description: 'Queries inside queries — scalar, column and row subqueries, the correlated subquery that re-runs per row, and the EXISTS/ANY/ALL operators that read the results.',
    explanation: `### Why Nest Queries?

Real questions come in two steps: "find the department with the lowest budget, then list its employees". You could do it with two queries and copy-paste — or wrap the first as a **subquery** inside the second. The inner query runs first and hands its result to the outer query.

### The Three Flavours Of Subqueries

| Flavour | Returns | Usable where | Example use |
|---|---|---|---|
| **Scalar** | ONE value (one row, one column) | anywhere a value fits | \`\`\`WHERE salary > (SELECT AVG(salary) ...)\`\`\` |
| **Column (IN)** | One column, many rows | \`\`\`IN\`\`\` lists | \`\`\`WHERE deptID IN (SELECT deptID ...)\`\`\` |
| **Row** | One row, many columns | row comparisons | \`\`\`WHERE (a, b) = (SELECT ...)\`\`\` |
| **Table** | Whole result set | FROM-clause / derived tables | \`\`\`FROM (SELECT ...) AS t\`\`\` |

### Non-Correlated vs Correlated — The Big Brainer

| | Non-correlated | Correlated |
|---|---|---|
| Runs | ONCE, then the outer query uses the stored result | **ONCE PER ROW** of the outer query |
| References the outer query? | NO | YES — sees the current outer row |
| Speed | Fast (single execution) | Slow (runs n times) |
| Example | \`\`\`WHERE salary > (SELECT AVG(salary) FROM Employees)\`\`\` | \`\`\`WHERE salary > (SELECT AVG(salary) FROM Employees e2 WHERE e2.dept = e1.dept)\`\`\` |
| Count of executions | 1 | 1 + rows of outer query |

### The Correlated Pattern — "Compared To MY OWN"

\`\`\`sql
SELECT name, salary, dept
FROM Employees e1
WHERE salary > (
  SELECT AVG(salary)
  FROM Employees e2
  WHERE e2.dept = e1.dept   -- the correlation: link to the OUTER row
);
-- For EVERY row of e1, the inner query re-averages e1.dept's salaries.
\`\`\`

Execution trace:

\`\`\`
ROW 1 (IT):    inner → AVG of IT salaries   → compare   ✓/✗
ROW 2 (HR):    inner → AVG of HR salaries   → compare   ✓/✗
ROW 3 (IT):    inner → AVG of IT salaries   → compare   ✓/✗   (recomputed!)
\`\`\`

### EXISTS, ANY, ALL — Readers Of The Result

| Operator | Meaning | Example |
|---|---|---|
| EXISTS | true if the subquery returns ≥ 1 row | \`\`\`WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.cid = c.cid)\`\`\` |
| NOT EXISTS | true if it returns nothing | customers with zero orders |
| x > ANY(sub) | true if x beats AT LEAST ONE value | above at least one |
| x > ALL(sub) | true if x beats EVERY value | above every one, i.e. the max |

**Mnemonic:** ANY = "at least one" (like OR), ALL = "every one" (like AND).

### Common Traps

❌ **= with a multi-row subquery** — \`\`\`= (SELECT ...)\`\`\` needs exactly one row; more → error. Use IN.\
❌ **Correlated subquery without an alias link** — no e1/e2 relationship means it is run once, and the answer quietly becomes wrong.\
❌ **Perf surprises** — correlated subqueries re-run per outer row; with big tables that is expensive.\
❌ **EXISTS vs IN with NULLs** — IN behaves oddly with NULL lists; EXISTS is the safer truth-test.

### Quick Self-Test (answers at the bottom)

1. A correlated subquery executes: (a) once (b) once per outer row (c) never
2. \`\`\`WHERE x > ALL(sub)\`\`\` means x beats: (a) at least one value (b) every value (c) zero values
3. \`\`\`WHERE dept = (SELECT ...)\`\`\` fails when the subquery returns: (a) one row (b) multiple rows (c) NULL
4. Customers with zero orders test best with: (a) NOT EXISTS (b) = 0 (c) MAX

**Answers:** 1→b, 2→b, 3→b, 4→a.`
  }
  ,
  {
    title: 'UNION, INTERSECT, EXCEPT',
    slug: 'union-intersect-except',
    lessonSlug: 'subqueries-set-operations',
    order: 1,
    description: 'Stacking whole result sets — UNION and UNION ALL, INTERSECT, and EXCEPT — with the column-compatibility rule that makes set operations legal.',
    explanation: `### Set Operations — Result Sets Meet Result Sets

WHERE joins rows sideways; the **set operators** stack them vertically. Two queries produce their own result sets, and the operator merges them.

### The Column-Pairing Rule

For any set operation between two queries, both queries must return:

- The **same number of columns** (degree)
- **Compatible types** column-by-column (numbers ↔ numbers, text ↔ text)

| Query A | Query B | Legal? |
|---|---|---|
| (name, salary) | (name, salary) | ✓ |
| (name, salary) | (city, score) | ✓ structurally — names match positions, not headers! |
| (name) | (name, salary) | ✗ different degrees |

**Watch this trap:** \`\`\`SELECT name UNION SELECT city\`\`\` is legal — the position matters, not the column name or table.

### The Four Operators

| Operator | Keeps | Duplicates |
|---|---|---|
| UNION | Rows of A OR rows of B | Removed |
| UNION ALL | Rows of A OR rows of B | **Kept** |
| INTERSECT | Rows in BOTH A and B | Removed |
| EXCEPT | Rows of A not in B | Removed |

### UNION vs UNION ALL — Know the Difference

| | UNION | UNION ALL |
|---|---|---|
| Duplicates | Deduplicated | Preserved |
| Cost | Extra sorting pass | None (streams) |
| When | Distinct "who has ever..." lists | Totals where repeats matter (daily log sums) |

### Ordering & Composing

- ORDER BY in a set operation goes at the **very end**: \`\`\`SELECT ... UNION SELECT ... ORDER BY name\`\`\`
- ORDER BY inside one half of the set ("top 3 from each side") needs a subquery on each side
- Operators chain: \`\`\`A UNION B INTERSECT C\`\`\` — parentheses when intent matters (INTERSECT binds first in most engines)

### Worked Example

Employees with >8 years OR in IT:

| Query A: senior list | Query B: IT list | UNION | UNION ALL | INTERSECT | A EXCEPT B |
|---|---|---|---|---|---|
| Aarav, Meera | Meera, Ravi | Aarav, Meera, Ravi | Aarav, Meera, Meera, Ravi | Meera | Aarav |

### Common Traps

❌ **Different column counts in the two SELECTs** — the pairing rule; count columns first.\
❌ **UNION when repeats must show** — totals per day want UNION ALL.\
❌ **ORDER BY inside each half** — meaningless; ORDER BY lands once, at the end.\
❌ **Merging by magic** — the operators pair columns by POSITION: (name, salary) ∪ (city, score) merges name-with-city if their types match. Check the types.

### Quick Self-Test (answers at the bottom)

1. UNION removes: (a) duplicates (b) NULLs (c) columns
2. Duplicates must appear → use: (a) UNION (b) UNION ALL (c) INTERSECT
3. A EXCEPT B keeps: (a) both (b) A not in B (c) B not in A
4. ORDER BY with set operations goes: (a) inside each part (b) at the very end (c) nowhere

**Answers:** 1→a, 2→b, 3→b, 4→b.`
  },
  {
    title: 'Functional Dependency Basics',
    slug: 'functional-dependency-basics',
    description: 'What X → Y means, trivial vs non-trivial dependencies, and how to prove new ones with Armstrong axioms.',
    lessonSlug: 'functional-dependencies',
    order: 0,
    explanation: `### What Is a Functional Dependency (FD)?

A **functional dependency** X → Y means: *"any two rows that agree on X must also agree on Y."* In other words, the value of X **determines** the value of Y. Every valid table automatically satisfies some FDs (its primary key determines everything) and violates others.

### The Two-Person Test

To test whether X → Y holds on real data, pick any two rows that have the **same X values**; they must have the **same Y values**:

| Row pair | Both rows have same... | Check | Verdict |
|---|---|---|---|
| r1, r2 | student_id = 104 | name must match | id → name holds |
| r3, r4 | city = Pune | zip must match | city → zip holds |
| r1, r4 | name = Priya | zip same? | if different, name → zip FAILS |

If even one violation exists, the FD does not hold on this data.

### Trivial vs Non-Trivial

| Kind | Meaning | Example |
|---|---|---|
| Trivial | Y is already inside X | {id, name} → name |
| Non-trivial | Y has something new | id → name |

### Proving FDs — Armstrong Axioms

Three rules let us derive new FDs from known ones:

| Axiom | Rule | Example |
|---|---|---|
| Reflexivity | X → X (and any subset) | A,B → B |
| Augmentation | X → Y implies XZ → YZ | id → dept implies (id, city) → (dept, city) |
| Transitivity | X → Y and Y → Z implies X → Z | id → dept and dept → dept_head implies id → dept_head |

From these we get **derived rules**:

| Derived rule | Rule |
|---|---|
| Union | X → Y and X → Z implies X → YZ |
| Decomposition | X → YZ implies X → Y and X → Z |
| Pseudo-transitivity | X → Y and YZ → W implies XZ → W |

**Example:** Given A → B and B → C, prove A → C: transitivity directly. Given A → BC, decompose to A → B and A → C.

### Keys Written as FDs

A **candidate key** K is an attribute set with K → (every attribute), and removing any attribute breaks that property. The primary key is just one chosen candidate key. So keys and FDs are the same story: *"keyhood is just a special FD."*

### Common Traps

❌ **Mixing up direction** — A → B does not mean B → A; FDs are one-way.\
❌ **Testing with one row** — an FD can only be violated by a *pair* of rows; single rows prove nothing.\
❌ **Assuming values are unique** — if two rows agree on X, that is exactly where the test happens.\
❌ **Forgetting decomposition gives both halves** — X → YZ is two FDs for the price of one.

### Quick Self-Test (answers at the bottom)

1. id → name is: (a) trivial (b) non-trivial (c) neither
2. A → B, B → C implies: (a) B → A (b) A → C (c) C → A
3. X → YZ gives us: (a) X → Y only (b) X → Y and X → Z (c) Y → Z
4. A primary key is: (a) any FD (b) a chosen candidate key (c) an Armstrong axiom

**Answers:** 1→b, 2→b, 3→b, 4→b.`
  },
  {
    title: 'Closure of Attributes',
    slug: 'closure-of-attributes',
    description: 'The closure X+ — everything an attribute set can reach through FDs — the tool to find keys and check dependencies.',
    lessonSlug: 'functional-dependencies',
    order: 1,
    explanation: `### Why Compute a Closure?

Given an attribute set X and a family of FDs F, the **closure X+** is the set of every attribute that X can determine. It answers three questions at once:

| Question | Closure test |
|---|---|
| Does the FD X → Y follow from F? | Y contained in X+ |
| Is X a candidate key? | X+ contains ALL attributes (and no smaller set does) |
| Is X a superkey? | X+ contains all attributes |

### The Closure Algorithm (Pseudocode)

\`\`\`
INPUT  : attribute set X, set of FDs F
OUTPUT : closure X+

1.  result = X
2.  REPEAT
3.    changed = FALSE
4.    FOR each FD  L → R in F:
5.      IF L is contained in result AND R is NOT contained in result:
6.        ADD all of R to result
7.        changed = TRUE
8.  UNTIL changed == FALSE
9.  RETURN result
\`\`\`

Each pass applies every FD whose left side finally fits; we keep looping until a pass changes nothing.

### Worked Example

Relation R (A, B, C, D, E) with FDs: A → B, A → C, B → D, D → E. Compute {A}+:

| Pass | Added rule | result = |
|---|---|---|
| 0 | start | { A } |
| 1 | A → B, A → C | { A, B, C } |
| 2 | B → D (B is in), then D → E | { A, B, C, D, E } |
| 3 | nothing new | stop |

{A}+ = {A, B, C, D, E} — the whole relation, so {A} is a candidate key.

### Using Closure to Find Keys

| Attribute set | Closure | Result |
|---|---|---|
| {B}+ | {B, D, E} | not a key |
| {A}+ | {A, B, C, D, E} | candidate key! |
| {C}+ | {C} | not a key |

If no single attribute closes to everything, test pairs — those pairs OR their determiners form the keys.

### Common Traps

❌ **Stopping after one pass** — a rule unlocked by pass 2 could add more; loop until nothing changes.\
❌ **Applying rules backwards** — an FD whose LHS has attributes NOT yet in result is skipped, not "used".\
❌ **Checking only one candidate** — a subset key disqualifies a larger set; also check for a smaller closure first.\
❌ **Ignoring zero-step FDs** — if X already contains everything, the closure is X itself.

### Quick Self-Test (answers at the bottom)

1. To prove X → Y using FDs, check whether: (a) X+ contains Y (b) Y+ contains X (c) X is in Y+
2. The loop stops when: (a) time runs out (b) a pass changes nothing (c) one FD fires
3. X is a superkey when: (a) X+ is every attribute (b) X+ is a subset (c) X has 2+ attributes
4. Given F = {A → B, B → C}, the closure {A}+ is: (a) {A, B} (b) {A, B, C} (c) {A}

**Answers:** 1→a, 2→b, 3→a, 4→b.`
  },
  {
    title: '1NF, 2NF and 3NF',
    slug: '1nf-2nf-3nf',
    description: 'Climb the ladder: atomic values (1NF), no partial dependencies (2NF), no transitive dependencies (3NF).',
    lessonSlug: 'normal-forms-1nf-bcnf',
    order: 0,
    explanation: `### The Normalization Ladder

Each normal form forbids one specific design smell. A table stops at the highest rung it satisfies.

| Form | Forbids | Fix |
|---|---|---|
| 1NF | non-atomic values, repeating groups | one value per cell, move lists to their own tables |
| 2NF | partial dependency (non-prime attribute depending on PART of a composite key) | extract the partial dependency into its own table |
| 3NF | transitive dependency (non-prime attribute depending on another non-prime attribute) | extract the transitive dependency into its own table |

**Prime attribute** = member of some candidate key. **Non-prime** = everyone else.

### 1NF — Atomic Cells

Violation:

| Student | Courses |
|---|---|
| 104 | DBMS, OS |

Fixed by one row per course:

| Student | Course |
|---|---|
| 104 | DBMS |
| 104 | OS |

### 2NF — Kill Partial Dependencies

The classic victim: a composite key where part of the key alone determines a non-prime column.

| OrderID | ProductID | ProductName | Qty |
|---|---|---|---|
| 501 | P1 | Bolt | 2 |
| 502 | P1 | Bolt | 5 |

Key = {OrderID, ProductID}, but **ProductID alone → ProductName**: a partial dependency. Split:

| OrderID | ProductID | Qty | | ProductID | ProductName |
|---|---|---|---|---|
| 501 | P1 | 2 | | P1 | Bolt |
| 502 | P1 | 5 | | | |

Both halves are now 2NF-safe (the order rows have no column depending on a key part).

### 3NF — Kill Transitive Dependencies

| EMP | EmpName | DeptID | DeptName |
|---|---|---|---|
| E1 | Aman | D1 | Sales |

EMP → DeptID → DeptName: DeptName depends on a non-prime attribute (DeptID, unless it is itself the key). Split:

| EMP | EmpName | DeptID | | DeptID | DeptName |
|---|---|---|---|---|
| E1 | Aman | D1 | | D1 | Sales |

### How Far Does 2NF Apply?

Only tables with **composite keys** can have partial dependencies. A single-attribute key automatically satisfies 2NF (if it is in 1NF).

### Common Traps

❌ **Skipping 1NF** — repeating groups hide partial AND transitive problems; fix atomicity first.\
❌ **Calling any multi-column key a partial dependency** — dependence must be on a true *part* of the key, not the whole key.\
❌ **Splitting away the key column** — every extracted table must keep the key it depends on.\
❌ **Forgetting dependency preservation** — the split must keep the original FDs enforceable; a split is useless if the FD is lost.

### Quick Self-Test (answers at the bottom)

1. A non-atomic cell like "DBMS, OS" violates: (a) 2NF (b) 1NF (c) 3NF
2. Partial dependency means: (a) half the table is empty (b) non-prime depends on part of a composite key (c) NULL values
3. EMP → DeptID → DeptName violates: (a) 1NF (b) 2NF (c) 3NF
4. A table with a single-attribute key that is 1NF is automatically: (a) 2NF (b) 5NF (c) non-normalized

**Answers:** 1→b, 2→b, 3→c, 4→a.`
  },
  {
    title: 'BCNF',
    slug: 'bcnf',
    description: 'The strictest classical form — every non-trivial FD must have a superkey on its left side.',
    lessonSlug: 'normal-forms-1nf-bcnf',
    order: 1,
    explanation: `### BCNF in One Line

A relation is in **BCNF** when, for every non-trivial functional dependency X → Y, the left side X is a **superkey** (its closure is the entire relation).

BCNF kills the last smell 3NF tolerates: a non-prime attribute determining a *prime* attribute.

### The 3NF Gap

| Relation | FDs | 3NF? | BCNF? |
|---|---|---|---|
| R (A, B, C) | AB → C, C → B | yes (C is prime) | NO — C → B has non-superkey left side |

Student (Student, Course, Instructor) with FDs: (Student, Course) → Instructor and **Instructor → Course**:

| Student | Course | Instructor |
|---|---|---|
| Priya | DBMS | Meera |
| Ravi | DBMS | Meera |
| Priya | OS | Aman |
| Ravi | OS | Aman |

The fact "the course Meera teaches is DBMS" is stored FOUR times. Instructor → Course is non-trivial and Instructor is not a superkey → violation. Decompose using the FD:

| Instructor | Course | | Student | Instructor |
|---|---|---|---|---|
| Meera | DBMS | | Priya | Meera |
| Aman | OS | | Ravi | Aman |

Now every FD has a superkey on the left. No redundancy, no update anomalies, no lost information (join both tables to recover the original).

### The BCNF Check (Pseudocode)

\`\`\`
INPUT  : relation attributes U, FDs F
OUTPUT : boolean (in BCNF?)

FOR each non-trivial FD  X → Y in F:
    IF closure(X, F) =/= U:
        RETURN FALSE    // left side is not a superkey
RETURN TRUE
\`\`\`

### Decomposing a Violator

1. Pick the violating FD X → Y.
2. Table 1 = X ∪ Y (the FD itself lives here).
3. Table 2 = U − Y ∪ X (holds the rest, X becomes its key).
4. Repeat until only BCNF tables remain.

| Step | Tables |
|---|---|
| Start | Student, Course, Instructor |
| Split on Instructor → Course | (Instructor, Course) + (Student, Instructor) |
| Check | both satisfy BCNF — done |

### Common Traps

❌ **Confusing BCNF with 3NF** — BCNF demands superkeys; prime-attribute determinants pass 3NF but can fail BCNF.\
❌ **Skipping the closure check** — "left side is part of the key" is not enough; X must close to the ENTIRE relation.\
❌ **Losing dependencies during decomposition** — if an FD cannot be enforced in any resulting table, the normal form was achieved only by losing semantics.\
❌ **Forgetting losslessness** — tables must always be joinable back to the original without phantom rows; the shared key column guarantees this in the X-split pattern.

### Quick Self-Test (answers at the bottom)

1. BCNF requires every non-trivial FD to have: (a) a primary key (b) a superkey left side (c) two attributes
2. R (A, B, C) with AB → C and C → B is: (a) 3NF only (b) BCNF (c) 2NF only
3. Decompose on violating X → Y: table 2 keeps: (a) X only (b) U − Y + X (c) Y only
4. A decomposition must be: (a) lossless and dependency-preserving where possible (b) faster (c) smaller

**Answers:** 1→b, 2→a, 3→b, 4→a.`
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
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A"
  }
  ,
  {
    title: 'Identify Entities, Attributes and Relationships',
    slug: 'identify-entities-attributes-relationships',
    lessonSlug: 'entity-relationship-modeling',
    subtopicSlug: 'er-diagram-basics',
    difficulty: 'easy',
    topics: ['ER Diagram', 'Entities', 'Attributes', 'Database Fundamentals'],
    companies: ['amazon', 'google', 'oracle'],
    problemStatement: 'For the system described below, list (1) every entity with the attribute that could uniquely identify it, (2) every simple attribute, (3) the multi-valued attributes, and (4) every relationship with a one-line meaning.',
    examples: [
      {
        input: "Library system: A book has a title, an ISBN and a shelf number. A member has a name, a member ID and up to three phone numbers. A member can borrow many books; a book can be borrowed by many members over time.",
        output: "Entities: BOOK (ISBN), MEMBER (memberID). Simple attributes: title, shelfNumber, name. Multi-valued: phone numbers (and the borrow date rides the BORROWS relationship). Relationship: MEMBER borrows BOOK (M:N).",
        explanation: "ISBN uniquely identifies a book and memberID uniquely identifies a member, so they become the key attributes. Phone numbers (up to three) are multi-valued — they need their own table later. \"Borrowed by many members over time\" makes the relationship M:N."
      },
      {
        input: "Restaurant: A customer can place at most one order per day. An order has an order number, a total amount and a delivery address (street, city, pincode).",
        output: "Entities: CUSTOMER (customerID), ORDER (orderNumber). Simple attributes: totalAmount. Composite: deliveryAddress = street + city + pincode. Relationship: CUSTOMER places ORDER (1:N — many orders over many days, but read carefully: one order belongs to one customer).",
        explanation: "The address splits into three logical parts — that is the signature of a composite attribute. The daily limit does NOT cap the relationship shape; over time one customer can place many orders, while each order has exactly one customer → 1:N."
      },
      {
        input: "University: A professor teaches many subjects. Each subject has a code, name and credit count. Some professors are research-only and teach nothing.",
        output: "Entities: PROFESSOR (profID), SUBJECT (code). Simple attributes: name, creditCount. Relationships: PROFESSOR teaches SUBJECT (M:N — one professor teaches many subjects; one subject is taught by many professors). Participation: professor side is PARTIAL (research-only professors teach nothing).",
        explanation: "Subject code is compact and unique → the key. 'Research-only professors' reveals partial participation on the professor side — an important fact to record even though it is not an entity or attribute."
      }
    ],
    constraints: [
      'Exactly one identifying attribute per entity (write it in brackets).',
      'Classify every attribute as simple, composite or multi-valued — do not skip any.',
      'Name every relationship as ENTITY verb ENTITY and state its cardinality.',
      'Watch for hidden facts: dates that belong to a relationship, not an entity.'
    ],
    approach: `## The Three-Pass Method

Work in passes so nothing slips through:

| Pass | What you do | Output |
|---|---|---|
| 1 | Circle every **noun** in the text | Candidate list |
| 2 | For each noun ask: *do we store facts about it?* | Entities vs attributes |
| 3 | For each pair of entities ask: *how do they link?* | Relationships + cardinality |

## Pass-by-Pass On The First Example

**Pass 1 — nouns:** book, title, ISBN, shelf number, member, name, member ID, phone numbers, date, borrow.

**Pass 2 — entity or attribute?**

\`\`\`
book        → stores title, ISBN, shelf → ENTITY
title       → a value, nothing stored about it → ATTRIBUTE of BOOK
ISBN        → ATTRIBUTE (and unique → the key)
shelfNumber → ATTRIBUTE
member      → stores name, id, phones → ENTITY
name        → ATTRIBUTE of MEMBER
memberID    → ATTRIBUTE (unique → the key)
phones      → ATTRIBUTE, but repeatable → MULTI-VALUED!
date        → belongs to the BORROWS link, not to book/member
\`\`\`

**Pass 3 — links:** "a member can borrow many books" AND "a book can be borrowed by many members" → both sides "many" → **M:N**.

## Decision Flowchart

\`\`\`
START with the text
├─ FOR every noun:
│   ├─ Stored facts about it?      → ENTITY
│   ├─ Is itself a stored fact?    → ATTRIBUTE
│   │   ├─ one value?              → SIMPLE
│   │   ├─ many values?            → MULTI-VALUED → separate table later
│   │   └─ split into parts?       → COMPOSITE
│   └─ links two entities?         → RELATIONSHIP
│       └─ ask BOTH sides "one → many?" to get 1:1 / 1:N / M:N
└─ Mark the attribute that uniquely identifies each entity (its key)
\`\`\`

## Traps To Dodge

❌ **Dates as entity attributes** — a borrow *date* describes the event; put it on the relationship edge.\
❌ **Calling every single-cardinality link 1:1** — "a book is borrowed by many members" already kills 1:1. Always ask both sides.\
❌ **Skipping multi-valued flags** — "up to three phones" is deliberately planted; losing it means a broken table design later.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- The identified design turned into real tables (Library example)
CREATE TABLE Member (
  memberID INT PRIMARY KEY,
  name     VARCHAR(50) NOT NULL
);

-- Multi-valued attribute gets its own table, keyed by both values
CREATE TABLE MemberPhone (
  memberID    INT REFERENCES Member(memberID),
  phoneNumber VARCHAR(15),
  PRIMARY KEY (memberID, phoneNumber)
);

CREATE TABLE Book (
  isbn        VARCHAR(13) PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  shelfNumber VARCHAR(10)
);

-- M:N relationship becomes a link table carrying the date as a column
CREATE TABLE Borrows (
  memberID INT REFERENCES Member(memberID),
  isbn     VARCHAR(13) REFERENCES Book(isbn),
  date     DATE NOT NULL,
  PRIMARY KEY (memberID, isbn, date)
);`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Determine the Cardinality of a Relationship',
    slug: 'determine-cardinality-relationship',
    lessonSlug: 'entity-relationship-modeling',
    subtopicSlug: 'relationship-types-cardinality',
    difficulty: 'medium',
    topics: ['Cardinality', 'Participation', 'ER Diagram', 'Relationship'],
    companies: ['google', 'microsoft', 'ibm'],
    problemStatement: 'For each pair of entities below, state the cardinality ratio (1:1, 1:N or M:N), which side is which, and the participation (total or partial) on each side. Justify every answer with the words you were given.',
    examples: [
      {
        input: "Every employee must be assigned to exactly one department. A department can have between 0 and 100 employees.",
        output: "Ratio: 1:N (100 allows many employees per department → department is the 'one' side). Participation: EMPLOYEE — TOTAL (\"must be assigned\", \"exactly one\"); DEPARTMENT — PARTIAL (0 employees allowed).",
        explanation: "\"Must be assigned to exactly one department\" forces total participation on the employee side — the database must forbid an employee without a department. \"Can have between 0 and 100\" makes department participation partial."
      },
      {
        input: "Each person can hold at most one passport, and each passport belongs to exactly one person.",
        output: "Ratio: 1:1. Participation: both sides TOTAL (\"exactly one person\" and a passport always has an owner).",
        explanation: "Neither side can link to many of the other — the classic 1:1. \"At most one\" plus \"exactly one\" means every passport must have an owner (total). If some passports were issued but unclaimed, that side would drop to partial."
      },
      {
        input: "A student must enroll in between 1 and 8 courses per semester. Every course must have at least 5 students, and may have up to 200.",
        output: "Ratio: M:N. Participation: both sides TOTAL (a student cannot exist without a course and a course cannot be offered without students).",
        explanation: "One student → many courses AND one course → many students means M:N. Lower bounds of 1 and 5 respectively convert both participations to total. The record 'belongs to a semester' would ride the enrollment link, not the course."
      },
      {
        input: "An employee may manage any number of other employees. Each employee has at most one manager.",
        output: "Ratio: 1:N, unary (EMPLOYEE relates to itself). Participation: managed employee side — PARTIAL (\"may\" manage, so some employees manage no one); being-managed side — PARTIAL (\"at most one manager\" — a CEO has none).",
        explanation: "This is a unary relationship hiding in plain sight. One manager → many reports (1:N). No 'must' anywhere → both sides partial."
      }
    ],
    constraints: [
      'Answer with three facts in order: ratio, side names, participation per side.',
      'Justify participation using exact words like "must", "exactly", "at most", "may".',
      'Treat unary relationships as relationships — do not ignore self-references.',
      'Ternary and higher: state that all three participants are needed to make the link meaningful (if applicable).'
    ],
    approach: `## Method — Ask Both Sides, Then Look For "Must"

**Step 1 — find the two players.** In unary sentences both players are the same entity.

**Step 2 — cardinality, the two questions:**

\`\`\`
Q1: Can one X be linked to many Ys?
Q2: Can one Y be linked to many Xs?
Both no  → 1:1     X yes Y no → 1:N (X = one)     both yes → M:N
\`\`\`

**Step 3 — participation, the hint-word table:**

| Word you were given | Participation | Meaning |
|---|---|---|
| "must", "exactly one", "at least 1", "always" | TOTAL | No row may exist without the link |
| "may", "at most 1", "0 to n", "can", "optional" | PARTIAL | Rows without the link are legal |

**Step 4 — justify by quoting.** Never answer from intuition; paste the deciding phrase into your explanation. "I chose total because the text says *every employee must*".

## Worked Walkthrough — The Employee/Department Example

\`\`\`
Read: "Every employee must be assigned to exactly one department."
Q1: one DEPARTMENT → many EMPLOYEEs?  "between 0 and 100" → YES
Q2: one EMPLOYEE → many DEPARTMENTs?  "exactly one" → NO
→ 1:N
\`\`\`

\`\`\`
Participation:
EMPLOYEE:  "must be assigned" → TOTAL  (double line in the diagram)
DEPARTMENT: "0 to 100" → PARTIAL        (single line)
\`\`\`

## Traps To Dodge

❌ **Reading the wrong 1:N direction** — the "one" is the side whose SINGLE row can link to many; put it clearly on the one side of the ratio.\
❌ **Confusing "at most 1" with total** — "at most one manager" still allows zero managers → partial.\
❌ **Missing unary relationships** — self-referencing links are valid; identify them and name both roles ("manages" and "is managed by").\
❌ **Forgetting that ternary facts change everything** — if the meaning needs all three entities, do not reduce it to two binary ratios.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- How each ratio decides the foreign key (solutions to the examples)
-- 1:N  → FK on the N side; NOT NULL because the N side is TOTAL
CREATE TABLE Department (
  deptID   INT PRIMARY KEY,
  deptName VARCHAR(50)
);
CREATE TABLE Employee (
  empID   INT PRIMARY KEY,
  deptID  INT NOT NULL REFERENCES Department(deptID)  -- N side, total
);

-- 1:1  → FK on either side; UNIQUE keeps it one-to-one
CREATE TABLE Person (
  personID INT PRIMARY KEY,
  name     VARCHAR(50)
);
CREATE TABLE Passport (
  passNo   INT PRIMARY KEY,
  personID INT UNIQUE REFERENCES Person(personID)
);

-- M:N  → never a plain FK: a link table holds both keys
CREATE TABLE Student  (studentID INT PRIMARY KEY);
CREATE TABLE Course   (courseID  INT PRIMARY KEY);
CREATE TABLE Enrolls (
  studentID INT REFERENCES Student(studentID),
  courseID  INT REFERENCES Course(courseID),
  PRIMARY KEY (studentID, courseID)
);`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Convert an ER Diagram with Specialization',
    slug: 'convert-er-diagram-specialization',
    lessonSlug: 'extended-er-features',
    subtopicSlug: 'generalization-specialization-aggregation',
    difficulty: 'medium',
    topics: ['Specialization', 'Generalization', 'ER Diagram', 'ISA Hierarchy'],
    companies: ['amazon', 'oracle', 'ibm'],
    problemStatement: 'Given the description of a specialization hierarchy below, choose the best relational mapping option and produce the complete tables with keys. The three options are: (A) one merged table with nullable subtype columns, (B) one table per subclass with a shared primary key, (C) one table per entity (superclass + each subclass) linked by the same key.',
    examples: [
      {
        input: "Scenario 1: EMPLOYEE (empID, name, joinDate) specializes into FULL_TIME (salary) and CONTRACT (hourlyRate, endDate). The hierarchy is DISJOINT and TOTAL. Full-time and contract attributes barely overlap. Queries frequently target ONE subtype at a time.",
        output: "Option B (one table per subclass with shared PK). Tables: EMPLOYEE(empID PK, name, joinDate); FULL_TIME(empID PK + FK → EMPLOYEE, salary); CONTRACT(empID PK + FK → EMPLOYEE, hourlyRate, endDate).",
        explanation: "Disjoint + total means every employee lives in exactly one subtype, and the subtype attributes barely overlap — no NULL-heavy merged row. Frequent subtype-only queries make option B (or C) favourable; B is chosen because each subtype has few attributes and its own small table."
      },
      {
        input: "Scenario 2: VEHICLE (regNo, make, model) specializes into CAR (seats) and TRUCK (loadCapacity). Hierarchy is DISJOINT and PARTIAL — the fleet also contains vans that are just VEHICLE. Subtypes each have only ONE extra attribute.",
        output: "Option A (one merged table: regNo PK, make, model, seats NULL, loadCapacity NULL) works, but examine the query mix first. If subtype-attribute queries are rare, A avoids joins; the partial hierarchy also lawfully leaves type NULL for plain vans.",
        explanation: "With one extra attribute per subtype, the merged table has at most two sparse columns — negligible waste. Partial hierarchy means some rows deliberately carry type NULL. This is the classic case where merging (option A) beats splitting."
      },
      {
        input: "Scenario 3: EMPLOYEE (empID, name) specializes into SALARIED (salary) and HOURLY (rate). Some employees are BOTH (paid a salary AND billed hourly for overtime). Queries often scan ALL employees and occasionally drill into one subtype for a report.",
        output: "Option C (superclass table + both subclass tables, same key). EMPLOYEE(empID PK, name); SALARIED(empID PK+FK, salary); HOURLY(empID PK+FK, rate). An employee may appear in BOTH subclass tables.",
        explanation: "Overlapping membership breaks option A (a single type column cannot say 'both') and breaks B's exclusivity assumption. Option C lets any employee appear in zero, one, or both subclass tables — exactly matching overlapping semantics."
      }
    ],
    constraints: [
      'State which option (A, B, or C) and justify in one sentence using the words disjoint/overlapping and total/partial.',
      'List every table with its full primary key and every foreign key.',
      'NULL columns in the merged option must be listed explicitly.',
      'Overlapping hierarchies may NOT use option A or B — rows can appear in multiple subtype tables.'
    ],
    approach: `## The ISA Mapping Decision

Read the hierarchy once, then answer three questions:

| Question | If YES → | If NO → |
|---|---|---|
| 1. Do subtype attributes barely overlap AND queries hit one subtype at a time? | Option B or C | Consider A |
| 2. Is the hierarchy DISJOINT? | B keeps membership clean | C (rows may sit in several subtype tables) |
| 3. Are there very few extra attributes per subtype AND rare subtype-only queries? | Option A (merged) | Split (B/C) |

## Rules for Each Option

**Option A — merged table (superclass + all subtype attributes):**
\`\`\`
EMPLOYEE(empID PK, name, joinDate, salary NULL, hourlyRate NULL, endDate NULL, type)
- Works only when subtypes are almost identical in shape
- Partial hierarchy → type may be NULL (plain superclass rows)
- Overlapping hierarchy → IMPOSSIBLE: one type column cannot hold "both"
\`\`\`

**Option B — superclass table + per-subclass tables sharing the superclass key:**
\`\`\`
EMPLOYEE(empID PK, name, joinDate)
FULL_TIME(empID PK + FK→EMPLOYEE, salary)
CONTRACT(empID PK + FK→EMPLOYEE, hourlyRate, endDate)
- One row max per subclass (disjoint enforced)
- Total → every empID appears in exactly one subtype table
\`\`\`

**Option C — like B, but membership is not exclusive:**
\`\`\`
EMPLOYEE(empID PK, name)
SALARIED(empID PK + FK→EMPLOYEE, salary)
HOURLY(empID PK + FK→EMPLOYEE, rate)
- The same empID may appear in several subtype tables — the ONLY correct choice for overlapping
\`\`\`

## Worked Walkthrough (Scenario 3)

\`\`\`
1. Read the constraint words: "Some employees are BOTH" → OVERLAPPING.
2. Overlapping kills A (one type column) and forces exclusive? No → B invalid.
3. Choose C. Write EMPLOYEE + one table per subclass, key = empID everywhere.
4. Verify: an employee paid salary AND hours appears in SALARIED and HOURLY. ✓
\`\`\`

## Traps To Dodge

❌ **Option A for overlapping hierarchies** — no single column can record "belongs to both".\
❌ **Option B for overlapping** — B assumes one-row-per-subclass; overlapping rows would need duplicates.\
❌ **New primary keys inside subtypes** — subclasses always INHERIT the superclass key; \`FULL_TIME(ftID, empID, salary)\` is a redundancy trap.\
❌ **Ignoring query patterns** — merged tables win when subtype columns are rarely used; split tables win when subtype data is often queried alone.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Scenario 3 (OVERLAPPING hierarchy) → Option C
CREATE TABLE Employee (
  empID INT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL
);

-- Subclass 1: salaried employees
CREATE TABLE Salaried (
  empID  INT PRIMARY KEY REFERENCES Employee(empID),
  salary DECIMAL(10, 2) NOT NULL
);

-- Subclass 2: hourly employees — SAME empID may also sit here
CREATE TABLE Hourly (
  empID INT PRIMARY KEY REFERENCES Employee(empID),
  rate  DECIMAL(8, 2) NOT NULL
);

-- An employee who is BOTH appears in both tables:
-- INSERT INTO Salaried (empID, salary) VALUES (7, 60000);
-- INSERT INTO Hourly   (empID, rate)  VALUES (7, 1500);`
      },
      {
        language: 'sql',
        code: `-- Scenario 2 (DISJOINT + PARTIAL, sparse subtype attributes) → Option A
CREATE TABLE Vehicle (
  regNo        VARCHAR(10) PRIMARY KEY,
  make         VARCHAR(30) NOT NULL,
  model        VARCHAR(30) NOT NULL,
  seats        SMALLINT,     -- NULL for trucks AND for plain vans
  loadCapacity DECIMAL(8, 2) -- NULL for cars AND for plain vans
);

-- Plain vans: both subtype columns stay NULL -> partial hierarchy respected`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Identify the Weak Entity and Its Discriminator',
    slug: 'identify-weak-entity-discriminator',
    lessonSlug: 'extended-er-features',
    subtopicSlug: 'weak-entities-keys',
    difficulty: 'easy',
    topics: ['Weak Entity', 'Partial Key', 'ER Diagram', 'Identifying Relationship'],
    companies: ['google', 'microsoft'],
    problemStatement: 'For each scenario, identify the weak entity, its owner, the partial key (discriminator), and the composite primary key the relational table will need. Prove the choice with the "can it be identified alone?" test.',
    examples: [
      {
        input: "A hospital has many wards, each ward has numbered beds. Bed numbers restart at 1 in every ward.",
        output: "Weak entity: BED. Owner: WARD. Partial key: bedNo. Composite PK: (wardID, bedNo). Reason: 'Bed 3' alone is meaningless — it only identifies a bed inside a specific ward.",
        explanation: "Bed numbering restarts per ward, so without wardID the bed cannot be identified — the signature of a weak entity. The composite key (wardID, bedNo) is globally unique."
      },
      {
        input: "An online order contains multiple line items. Line items are numbered 1, 2, 3... inside each order. Order numbers are unique across the whole system.",
        output: "Weak entity: LINE_ITEM. Owner: ORDER. Partial key: itemNo. Composite PK: (orderID, itemNo). No line item can exist without its order — and deleting the order must delete its items.",
        explanation: "itemNo restarts in every order, so identity requires orderID as well — classic weak entity. The identifying relationship ORDER—has—LINE_ITEM demands ON DELETE CASCADE in the schema."
      },
      {
        input: "A delivery company issues tracking numbers. Every parcel's tracking number is unique globally, even across different customers.",
        output: "No weak entity here. PARCEL is STRONG — its trackingNo identifies it without any owner. The link CUSTOMER—ships—PARCEL is an ordinary relationship, not an identifying one.",
        explanation: "The trap: a parcel without a customer makes little business sense, but it is still identifiable on its own. Being logically dependent on an owner is NOT the same as needing the owner's key to be identified."
      }
    ],
    constraints: [
      'Answer with: weak entity, owner, partial key, composite key — in that order.',
      'Justify with the "identified alone?" test in one sentence.',
      'If there is no weak entity, say STRONG with its own key and prove it.',
      'Remember the cascade implication when the owner is deleted.'
    ],
    approach: `## The Three-Question Interrogation

Run every candidate entity through this gauntlet:

\`\`\`
Q1: Can the candidate be IDENTIFIED using only its own attributes?
    YES → STRONG entity. Done. (parcel can — by trackingNo)
    NO  → continue

Q2: Does the candidate have a KEY that includes ANOTHER entity's key?
    YES → WEAK entity — owner = that other entity

Q3: What is the partial key (unique only within one owner's family)?
    → The part of the composite key NOT borrowed from the owner
\`\`\`

## Filling The Answer Table

| Piece | Where to find it | Example (hospital) |
|---|---|---|
| Weak entity | The answer to Q1 = NO | BED |
| Owner | Q2's other entity — the strong one side of the identifying relationship | WARD |
| Partial key | The attribute that restarts per owner | bedNo |
| Composite PK | ownerPK + partial key | (wardID, bedNo) |
| Cascade | Owner delete → weak rows delete | ON DELETE CASCADE |

## Signal Words — What They Mean

| Phrase in the question | Meaning |
|---|---|
| "number restarts per..." / "numbered inside each..." | Partial key → weak entity ahead |
| "unique across the whole system" | Strong — has its own key |
| "cannot exist without..." / "dies with..." | Weak flavour — but still PROVE Q1 |
| "identifying relationship" | Double diamond → weak entity on the many side |

## Traps To Dodge

❌ **Deciding "weak" from business sense alone** — a parcel needs a customer to *make sense* but survives on trackingNo alone → strong.\
❌ **Using only the partial key in the PK** — "bedNo" alone collides across wards; you need (wardID, bedNo).\
❌ **Giving the weak entity a surrogate id** — a synthetic \`bedID\` would technically work but destroys the identifying-relationship semantics the examiner wants.\
❌ **Forgetting the cascade** — owner deletion must ripple into weak rows; an FK without ON DELETE CASCADE leaves orphans.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Hospital example: BED is a weak entity of WARD
CREATE TABLE Ward (
  wardID   INT PRIMARY KEY,
  wardName VARCHAR(50) NOT NULL
);

-- Composite PK = owner's key + partial key
CREATE TABLE Bed (
  wardID INT NOT NULL REFERENCES Ward(wardID) ON DELETE CASCADE,
  bedNo  INT NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  PRIMARY KEY (wardID, bedNo)
);

-- Order line items — same pattern
CREATE TABLE LineItem (
  orderID INT NOT NULL REFERENCES Orders(orderID) ON DELETE CASCADE,
  itemNo  INT NOT NULL,
  product VARCHAR(50) NOT NULL,
  qty     INT NOT NULL,
  PRIMARY KEY (orderID, itemNo)
);`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Convert an ER Diagram to a Relational Schema',
    slug: 'convert-er-diagram-relational-schema',
    lessonSlug: 'er-to-relational-mapping',
    subtopicSlug: 'mapping-er-diagrams-tables',
    difficulty: 'medium',
    topics: ['ER to Relational', 'Mapping', 'Primary Key', 'Foreign Key'],
    companies: ['google', 'oracle', 'ibm'],
    problemStatement: 'Convert the described ER design into a complete relational schema. Produce every table with its attribute list, primary key, foreign keys (including the column and the table it references), and any junction tables. Apply the seven mapping rules in order.',
    examples: [
      {
        input: "University: PROFESSOR (profID, name) teaches (M:N) SUBJECT (code, title). SUBJECT is offered_by (1:N) DEPARTMENT (deptID, deptName). Additionally, a professor may head at most one department (1:1).",
        output: "PROFESSOR(profID PK, name, headsDept FK→DEPARTMENT UNIQUE); DEPARTMENT(deptID PK, deptName); SUBJECT(code PK, title, deptID FK→DEPARTMENT NOT NULL); TEACHES(profID FK→PROFESSOR, code FK→SUBJECT, PRIMARY KEY(profID, code)).",
        explanation: "M:N teaches becomes the TEACHES junction table with composite key (rule 5). 1:N offered_by puts deptID on the N side (SUBJECT) and 'offered by a department' makes it NOT NULL (rule 4 + total participation). The 1:1 heads link takes an FK on the professor side with UNIQUE (rule 3)."
      },
      {
        input: "Hotel: HOTEL (hotelID, name, starRating) has (1:N) ROOM (roomNo, price, type). A room's number restarts in every hotel. ROOM also has multi-valued attribute: photos (URLs).",
        output: "HOTEL(hotelID PK, name, starRating); ROOM(hotelID FK→HOTEL ON DELETE CASCADE, roomNo, price, type, PRIMARY KEY(hotelID, roomNo)); ROOM_PHOTO(hotelID FK, roomNo FK, photoURL, PRIMARY KEY(hotelID, roomNo, photoURL)).",
        explanation: "ROOM is a weak entity — its PK borrows hotelID (rule 2) with CASCADE. The multi-valued photos attribute becomes its own table (rule 6), reusing the composite key plus the photo URL."
      },
      {
        input: "Bank: CUSTOMER (custID, name) opens (1:N) ACCOUNT (accNo, balance). Each account belongs to exactly one customer; a customer may open zero or more accounts. Account type is one value chosen from {savings, current, fixed}. (No other relationships.)",
        output: "CUSTOMER(custID PK, name); ACCOUNT(accNo PK, balance, type CHECK (type IN ('savings','current','fixed')), custID FK→CUSTOMER NOT NULL).",
        explanation: "1:N maps the FK onto the N side (ACCOUNT) and total participation on that side makes it NOT NULL. The single-choice type attribute stays a normal column with a CHECK constraint — it is simple, not multi-valued."
      }
    ],
    constraints: [
      'Follow the rule order: strong entities → weak entities → relationships → multi-valued attributes.',
      'Every FK must be stated as table.column REFERENCES table.',
      'Junction tables must declare a composite primary key.',
      'Total participation must produce NOT NULL; 1:1 links must produce UNIQUE.'
    ],
    approach: `## The Seven-Rule Pipeline (run in this order)

\`\`\`
FOR each strong entity:            → table, attributes → columns, key → PK
FOR each weak entity:              → table; PK = owner PK + partial key; CASCADE FK
FOR each 1:1 relationship:         → FK either side + UNIQUE
FOR each 1:N relationship:         → FK on the N side (NOT NULL if total on that side)
FOR each M:N relationship:         → junction table; composite PK of both FKs
FOR each multi-valued attribute:   → own table (owner key + value as PK)
FOR each ISA hierarchy:            → merged / per-subclass / superclass+subclasses
\`\`\`

## Working Through the First Example

\`\`\`
1. Strong entities: PROFESSOR, SUBJECT, DEPARTMENT.
   → PROFESSOR(profID PK, name), SUBJECT(code PK, title), DEPARTMENT(deptID PK, deptName)

2. No weak entities.

3. 1:1 "head at most one department":
   Put headsDept in PROFESSOR, UNIQUE → keeps many professors from heading one dept? No —
   UNIQUE on PROFESSOR.headsDept means one professor heads one dept; the dept-side
   uniqueness comes from the same column (two professors can't hold the same dept row).
   → PROFESSOR(profID PK, name, headsDept UNIQUE → DEPARTMENT)

4. 1:N "SUBJECT offered_by DEPARTMENT": FK on N side = SUBJECT.deptID → DEPARTMENT.
   Every subject must belong to a department → NOT NULL.

5. M:N teaches → junction: TEACHES(profID, code), PK(profID, code).

6. No multi-valued attributes in this scenario.
\`\`\`

## Verifying Your Answer

| Check | How |
|---|---|
| Every entity present? | Count tables ≥ count entities (junction tables add more) |
| Every relationship present? | 1:1/1:N → an FK column; M:N → a junction table |
| Total participation → NOT NULL? | Scan the FK columns |
| 1:1 → UNIQUE? | Scan for UNIQUE on 1:1 FKs |
| Keys declared? | PK and FK on every table |

## Traps To Dodge

❌ **Skipping the junction table for M:N** — putting courseID into STUDENT creates the first duplicate row ever.\
❌ **UNIQUE on every FK** — only 1:1 mappings need it; 1:N would break instantly.\
❌ **Weak entities with invented IDs** — ROOM must use (hotelID, roomNo), not a made-up roomID.\
❌ **Multi-valued attributes merged into a column** — photos, phones and the like always get their own table.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Full solution for the FIRST example (University)
CREATE TABLE Department (
  deptID   INT PRIMARY KEY,
  deptName VARCHAR(50) NOT NULL
);

CREATE TABLE Professor (
  profID    INT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  headsDept INT UNIQUE REFERENCES Department(deptID)  -- 1:1 head link
);

CREATE TABLE Subject (
  code   VARCHAR(10) PRIMARY KEY,
  title  VARCHAR(100) NOT NULL,
  deptID INT NOT NULL REFERENCES Department(deptID)   -- 1:N, total side
);

CREATE TABLE Teaches (                                 -- M:N junction
  profID INT NOT NULL REFERENCES Professor(profID) ON DELETE CASCADE,
  code   VARCHAR(10) NOT NULL REFERENCES Subject(code) ON DELETE CASCADE,
  PRIMARY KEY (profID, code)
);`
      },
      {
        language: 'sql',
        code: `-- Solution for the SECOND example (Hotel with weak ROOM + multi-valued photos)
CREATE TABLE Hotel (
  hotelID    INT PRIMARY KEY,
  name       VARCHAR(80) NOT NULL,
  starRating SMALLINT CHECK (starRating BETWEEN 1 AND 5)
);

CREATE TABLE Room (
  hotelID INT NOT NULL REFERENCES Hotel(hotelID) ON DELETE CASCADE,
  roomNo  INT NOT NULL,
  price   DECIMAL(10, 2) NOT NULL,
  type    VARCHAR(20),
  PRIMARY KEY (hotelID, roomNo)                        -- weak entity composite key
);

CREATE TABLE RoomPhoto (                               -- multi-valued attribute
  hotelID  INT NOT NULL,
  roomNo   INT NOT NULL,
  photoURL VARCHAR(300) NOT NULL,
  PRIMARY KEY (hotelID, roomNo, photoURL),
  FOREIGN KEY (hotelID, roomNo) REFERENCES Room(hotelID, roomNo) ON DELETE CASCADE
);`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Represent Cardinality Constraints in Schema',
    slug: 'represent-cardinality-constraints-schema',
    lessonSlug: 'er-to-relational-mapping',
    subtopicSlug: 'mapping-constraints',
    difficulty: 'medium',
    topics: ['Cardinality Constraints', 'NOT NULL', 'UNIQUE', 'Referential Integrity'],
    companies: ['amazon', 'microsoft'],
    problemStatement: 'For each set of business rules, write the SQL that makes the database itself enforce the rules — no application code, no middle layer. Use the right combination of PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, and ON DELETE actions.',
    examples: [
      {
        input: "Rules: (1) Every order must belong to exactly one customer. (2) A customer may have zero to many orders. (3) Deleting a customer must delete their orders.",
        output: "customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE inside Orders. That single column does it all: NOT NULL enforces rule 1, NULLable-by-default-elsewhere the FK column enforces rule 2 (no order column lives in Customer), and CASCADE enforces rule 3.",
        explanation: "The three rules map to three SQL features: total participation → NOT NULL, partial participation → nothing needed in the Customer table, and the chosen delete behaviour → CASCADE. One column, three guarantees."
      },
      {
        input: "Rules: (1) Exactly one manager per department. (2) A manager may manage several departments. (3) If a manager leaves, departments must keep existing but end up with NO manager (NULL) until a replacement is named.",
        output: "Department.deptHead INT NULL REFERENCES Manager(managerID) ON DELETE SET NULL. The 'exactly one' is enforced because the column holds a single managerID; leaving it NULLable matches rule 3; SET NULL performs the 'manager leaves' transition.",
        explanation: "This is a 1:N — Department is the N side carrying the FK. 'End up with NULL until replaced' is literally SET NULL. If the rule had said 'a department must always have a manager', NOT NULL + SET NULL would clash and you would need RESTRICT/CASCADE instead."
      },
      {
        input: "Rules: (1) A student may enroll in many courses; a course may have many students. (2) An enrollment needs BOTH a student and a course — partial enrollments are not allowed. (3) Removing a student removes their enrollments; removing a course removes its enrollments.",
        output: "Enrollment(studentID NOT NULL REFERENCES Student ON DELETE CASCADE, courseID NOT NULL REFERENCES Course ON DELETE CASCADE, PRIMARY KEY(studentID, courseID)). NOT NULL on both FKs enforces rule 2; the composite PK stops double enrollment; CASCADE twice enforces rule 3.",
        explanation: "For M:N the junction table is where ALL the constraints live: composite PK + NOT NULL + CASCADE in both directions. The Student and Course tables stay completely clean — no FK columns at all."
      }
    ],
    constraints: [
      'Write full CREATE TABLE statements — not fragments.',
      'Every business rule must map to exactly one SQL feature — say which one.',
      'Watch for impossible combinations (total participation + SET NULL).',
      'M:N constraints live in the junction table, not in the two main tables.'
    ],
    approach: `## Rule → SQL Translation Table

| Business rule | SQL feature |
|---|---|
| "must belong to exactly one X" | FK + NOT NULL |
| "may have zero or more X" | FK nullable (or no column at all on the one side) |
| "at most one X" (1:1) | FK + UNIQUE |
| "many-to-many" | Junction table + composite PK |
| "partial enrollment forbidden" | NOT NULL on every FK of the junction |
| "deleting parent deletes children" | ON DELETE CASCADE |
| "parent gone, child kept, link cleared" | ON DELETE SET NULL |
| "never delete a parent that has children" | ON DELETE RESTRICT |

## Decision Path

\`\`\`
1. CardLeaf shape: 1:1 → FK+UNIQUE | 1:N → FK on N | M:N → junction table
2. Participation: total side → NOT NULL ; partial side → nullable
3. Delete behaviour: pick CASCADE / SET NULL / RESTRICT by reading the words
4. Cross-check impossibilities: NOT NULL + SET NULL = contradiction
\`\`\`

## Reading The Rules (the nouns are traps)

| Phrase | Real meaning |
|---|---|
| "exactly one" | TOTAL on that side → NOT NULL |
| "may be none" / "zero or more" | PARTIAL → nullable |
| "must keep the record but clear the link" | SET NULL |
| "with the record" / "their orders" | CASCADE |

## Traps To Dodge

❌ **NOT NULL + SET NULL on the same column** — SET NULL violates NOT NULL; if the rule demands both, use RESTRICT or CASCADE.\
❌ **Enforcing M:N business rules in the app layer** — the question asks for schema enforcement; junction-table constraints must do the job.\
❌ **Double enrollment allowed** — the composite primary key (studentID, courseID) is the enforcement; forgetting it invites duplicate rows.\
❌ **Putting the FK in the wrong table for 1:N** — the many side carries it; the one side stays untouched.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- SOLUTION: Example 1 — Orders must belong to a customer (total), cascade on delete
CREATE TABLE Customer (
  customerID INT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL
);

CREATE TABLE Orders (
  orderID    INT PRIMARY KEY,
  amount     DECIMAL(10, 2) NOT NULL,
  customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE
);`
      },
      {
        language: 'sql',
        code: `-- SOLUTION: Example 3 — M:N enrollments, all constraints in the junction
CREATE TABLE Student (studentID INT PRIMARY KEY, name VARCHAR(50) NOT NULL);
CREATE TABLE Course  (courseID  INT PRIMARY KEY, title VARCHAR(80) NOT NULL);

CREATE TABLE Enrollment (
  studentID INT NOT NULL REFERENCES Student(studentID) ON DELETE CASCADE,
  courseID  INT NOT NULL REFERENCES Course(courseID)   ON DELETE CASCADE,
  PRIMARY KEY (studentID, courseID)
);`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Identify All Candidate Keys',
    slug: 'identify-all-candidate-keys',
    lessonSlug: 'relational-model-basics',
    subtopicSlug: 'keys-candidate-primary-foreign-super',
    difficulty: 'medium',
    topics: ['Candidate Keys', 'Functional Dependency', 'Closure', 'Primary Key'],
    companies: ['google', 'oracle', 'ibm'],
    problemStatement: 'Given a relation schema and its set of functional dependencies (FDs), find ALL candidate keys of the relation. Then pick a primary key and list the alternate keys. Use the closure method — compute what each attribute (or attribute set) can determine.',
    examples: [
      {
        input: "R(A, B, C, D) with FDs: A → B, B → C, C → D. Which sets are candidate keys?",
        output: "Candidate keys: {A} only. Closure(A) = {A, B, C, D} — A determines everything alone, and no smaller set exists (single column). Alternate keys: none (there is only one candidate).",
        explanation: "Following the chain A→B→C→D, A's closure covers all four attributes, so {A} is the sole candidate key. Single-column keys are automatically minimal."
      },
      {
        input: "R(A, B, C, D) with FDs: AB → C, C → D, D → A. Find all candidate keys.",
        output: "Candidate keys: {AB} and {BC}. Check: closure(AB) = {A,B,C,D}; closure(BC) = {B,C,D,A} = all four. {A}, {B}, {C}, {D} alone each FAIL to cover everything — try them and see.",
        explanation: "BC is a surprising candidate key — neither B nor C is a key alone, but together they determine D → A → everything. This is why you must compute closures for every minimal attribute set, not just the obvious ones."
      },
      {
        input: "R(EMP_ID, PAN, NAME, DEPT) with FDs: EMP_ID → NAME, EMP_ID → DEPT, PAN → NAME, NAME → DEPT. Find all candidate keys.",
        output: "Candidate keys: {EMP_ID} and {PAN}. Both single columns each determine the rest (EMP_ID → NAME → DEPT; PAN → NAME → DEPT). Alternate keys: whichever of EMP_ID/PAN you do not choose as primary.",
        explanation: "Two candidate keys compete; you pick one as PRIMARY KEY and the other becomes an ALTERNATE key. NAME and DEPT alone are never keys — they only ever appear on the right-hand side of FDs."
      }
    ],
    constraints: [
      'Compute the closure of every candidate set — never guess from the FDs alone.',
      'A candidate key must pass BOTH tests: uniqueness (closure covers all attributes) and minimality (no proper subset works).',
      'Single-column keys are automatically minimal — you still must verify their closure.',
      'Report all candidate keys, then mark the primary and alternate keys clearly.'
    ],
    approach: `## The Closure Machine

The closure of a set X is everything X can determine, directly or through chains. Compute it by looping:

\`\`\`
FUNCTION closure(X, FDs):
    result = X
    REPEAT:
        changed = FALSE
        FOR each FD (LHS -> RHS) in FDs:
            IF LHS is a subset of result AND RHS not in result:
                result = result + RHS
                changed = TRUE
    UNTIL no change
    RETURN result
\`\`\`

## Candidate-Key Algorithm

\`\`\`
INPUT  : attributes Attrs, functional dependencies FDs
OUTPUT : list of candidate keys

1. FOR each single attribute A in Attrs:
       IF closure(A) covers ALL attributes → {A} is a candidate key
2. FOR each pair (A, B), triple (A, B, C), ... of the REMAINING attributes:
       IF closure(set) covers ALL attributes
          AND no proper subset of the set is itself a key → candidate key
3. Sort the candidates by size; the smallest are what interviews expect
\`\`\`

## Worked Trace — The {AB, BC} Example

\`\`\`
FDs: AB→C, C→D, D→A        Attrs: A B C D

closure(A)  = A            → ✗ incomplete
closure(B)  = B            → ✗
closure(C)  = C+D+A        → ✗ (C, D, A — B missing!)
closure(D)  = D+A          → ✗
closure(AB) = A B →(AB→C) C →(C→D) D   → ✓ ALL FOUR
closure(BC) = B C →(C→D) C D... wait:
           B C → C→D gives D → D→A gives A → now A B C D ✓
No proper subset of {AB} or {BC} works → BOTH are candidate keys
\`\`\`

## Traps To Dodge

❌ **Stopping after the first key** — the question says ALL candidate keys; keep scanning pairs and triples.\
❌ **Forgetting minimality** — {ABC} may cover everything, but if {AB} already does, {ABC} is only a super key.\
❌ **Attributes on the RHS only** — an attribute that never appears on a left-hand side (like NAME → DEPT direction traps) can still join a composite key — test it anyway.\
❌ **Single-column shortcuts** — "obviously" non-key columns can become keys through chains (like BC). Compute, don't guess.`,
    codeBlocks: [
      {
        language: 'python',
        code: `# Find all candidate keys of a relation
def closure(attrs, fds):
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:                     # each FD: lhs -> rhs
            if set(lhs).issubset(result) and not set(rhs).issubset(result):
                result |= set(rhs)
                changed = True
    return result

def candidate_keys(attrs, fds, key_sizes=(1, 2, 3)):
    all_attrs = set(attrs)
    keys = []
    for size in key_sizes:
        from itertools import combinations
        for combo in combinations(attrs, size):
            if closure(combo, fds) == all_attrs:         # uniqueness
                if not any(set(combo).issuperset(k) for k in keys):  # minimality
                    keys.append(set(combo))
    return keys

# Example: R(A,B,C,D), FDs AB->C, C->D, D->A
print(candidate_keys(['A', 'B', 'C', 'D'],
                     [('AB', 'C'), ('C', 'D'), ('D', 'A')]))
# Output: [{'B', 'C'}, {'A', 'B'}]  -> both are candidate keys`
      }
    ],
    timeComplexity: 'O(2^n)',
    spaceComplexity: 'O(n)'
  }
  ,
  {
    title: 'Write a Relational Algebra Expression',
    slug: 'write-relational-algebra-expression',
    lessonSlug: 'relational-model-basics',
    subtopicSlug: 'relational-algebra-basics',
    difficulty: 'easy',
    topics: ['Relational Algebra', 'Selection', 'Projection', 'Joins'],
    companies: ['amazon', 'google'],
    problemStatement: 'Translate each English query into a relational algebra expression using σ, π, ×/⋈, and set operators. Use the tables EMPLOYEE(EID, ENAME, SALARY, DNO) and DEPARTMENT(DNO, DNAME, LOCATION).',
    examples: [
      {
        input: "List the names of all employees who earn more than 50,000.",
        output: "π_ENAME( σ_SALARY > 50000 (EMPLOYEE) )",
        explanation: "\"Name\" is a column → PROJECT (π). \"Earn more than 50,000\" is a row filter → SELECT (σ). The expression reads inside-out: filter the rows first, then keep the column."
      },
      {
        input: "List the names of employees who work in the department 'Research'. (EMPLOYEE has an FK DNO; DEPARTMENT has DNO and DNAME.)",
        output: "π_ENAME( EMPLOYEE ⋈ ( σ_DNAME = 'Research' (DEPARTMENT) ) )",
        explanation: "The filter uses DNAME, owned by DEPARTMENT — so first select the Research row from DEPARTMENT, join it to EMPLOYEE on DNO (the natural link), then project ENAME. Three operators: σ → ⋈ → π."
      },
      {
        input: "List all employee IDs of employees who are NOT in the 'Sales' department.",
        output: "π_EID(EMPLOYEE) − π_EID( σ_DNAME = 'Sales' (DEPARTMENT ⋈ EMPLOYEE) )",
        explanation: "\"NOT\" across two sets is the DIFFERENCE (−) operator. The left side is every employee ID; the right side is the IDs of Sales employees; subtracting leaves everyone else."
      }
    ],
    constraints: [
      'Write each expression as a single line, operators inside-out: innermost executes first.',
      'Use σ for row filters, π for column lists, ⋈ for the join, − for difference.',
      'Join the two tables whenever the filter column lives in the other table.',
      'Compose operators — a one-operator answer is usually incomplete.'
    ],
    approach: `## Sentence → Operator Translation

| English | Operator |
|---|---|
| "names / IDs / salaries of..." | **π** (pick the column) |
| "...who earn / who work / where..." | **σ** (filter rows) |
| "...and we need BOTH tables' data..." | **⋈** (join) |
| "...who are NOT / except / minus..." | **−** (difference) |
| "...in either list..." | **∪** (union) |

## The Assembly Order

\`\`\`
1. Underline the COLUMNS wanted  → that list becomes π(...)
2. Underline the CONDITIONS      → each becomes σ_cond below π
3. If a condition's column lives in ANOTHER table → join it in first:
       σ (that table's filter) FIRST, then ⋈, then π
4. "NOT / except" over two ideas → build both halves, subtract: A − B
5. Read the finished expression inside-out and sanity-check aloud
\`\`\`

## Worked Walkthrough — The Research Query

\`\`\`
Sentence: "names of employees who work in the department 'Research'"

Columns wanted    : ENAME        → π_ENAME at the front
Condition        : DNAME = Research → σ_DNAME = 'Research' — but DNAME is in DEPARTMENT!
Fix              : select the Research row first:  σ_DNAME = 'Research' (DEPARTMENT)
Join             : EMPLOYEE ⋈ (that result)      → matches rows on DNO
Finish           : π_ENAME( EMPLOYEE ⋈ ( σ_DNAME = 'Research' (DEPARTMENT) ) )
\`\`\`

## Traps To Dodge

❌ **σ on a column from the wrong table** — σ_DNAME='Research'(EMPLOYEE) is invalid algebra: the column does not exist there. Join first.\
❌ **π before σ** — π discards columns; if you dropped DNO before the join, the join becomes impossible.\
❌ **− written as ≠** — "not in Sales" is set difference, not a filter that compares a non-existent column.\
❌ **Skipping brackets** — never rely on operator precedence you haven't specified; bracket everything.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- The same three queries, as the SQL the algebra maps to

-- 1. Names of employees earning more than 50,000
--    Algebra: π_ENAME( σ_SALARY > 50000 (EMPLOYEE) )
SELECT ENAME FROM EMPLOYEE WHERE SALARY > 50000;

-- 2. Names of employees in the Research department
--    Algebra: π_ENAME( EMPLOYEE ⋈ ( σ_DNAME = 'Research' (DEPARTMENT) ) )
SELECT e.ENAME
FROM EMPLOYEE e
JOIN DEPARTMENT d ON e.DNO = d.DNO
WHERE d.DNAME = 'Research';

-- 3. Employee IDs NOT in the Sales department
--    Algebra: π_EID(EMPLOYEE) − π_EID(σ_DNAME='Sales'(DEPARTMENT ⋈ EMPLOYEE))
SELECT EID FROM EMPLOYEE
EXCEPT
SELECT e.EID
FROM EMPLOYEE e
JOIN DEPARTMENT d ON e.DNO = d.DNO
WHERE d.DNAME = 'Sales';`
      }
    ],
    timeComplexity: 'O(n*m)',
    spaceComplexity: 'O(result size)'
  }
  ,
  {
    title: 'Apply Union, Intersect, and Minus',
    slug: 'apply-union-intersect-minus',
    lessonSlug: 'relational-algebra-calculus',
    subtopicSlug: 'set-operations-relational-algebra',
    difficulty: 'easy',
    topics: ['Relational Algebra', 'Union', 'Intersect', 'Difference'],
    companies: ['amazon', 'google', 'oracle'],
    problemStatement: 'Given the two relations below, compute R ∪ S, R ∩ S, R − S, and S − R. Then answer: is R − S = S − R in general? (No — prove it with the numbers.) Treat relations as sets: duplicate rows appear once.',
    examples: [
      {
        input: "R: {(1, A), (2, B), (3, C)}   S: {(2, B), (3, C), (4, D)}",
        output: "R ∪ S = {(1,A), (2,B), (3,C), (4,D)} · R ∩ S = {(2,B), (3,C)} · R − S = {(1,A)} · S − R = {(4,D)}. R − S ≠ S − R — they share nothing here.",
        explanation: "Union merges all four distinct rows. Intersect keeps only the two tuples appearing in both. R − S keeps R's rows that don't exist in S (just (1,A)); S − R keeps (4,D) — demonstrating both directions differ."
      },
      {
        input: "R: {(x, 1), (x, 1)} (duplicate row!)   S: {(x, 1), (y, 2)}",
        output: "R ∪ S = {(x,1), (y,2)} · R ∩ S = {(x,1)} · R − S = {} (empty) · S − R = {(y,2)}.",
        explanation: "R holds duplicate (x,1) but relations are sets — the duplicate collapses. R − S is EMPTY because R's only distinct row (x,1) also exists in S."
      },
      {
        input: "R: Student IDs in the Cricket club {101, 102, 103}   S: Student IDs in the Drama club {102, 104}. Find students in Cricket but NOT in Drama.",
        output: "R − S = {101, 103}. Students 102 is a member of both clubs (it's in R ∩ S); 104 only in Drama.",
        explanation: "R − S is the classic 'members of A who are not members of B'. 101 and 103 are Cricket-only; 102 belongs to both (so it appears in the intersection, not the difference); 104 isn't in R at all."
      }
    ],
    constraints: [
      'Relations are sets — collapse duplicate rows before answering.',
      '∪ = at least one table; ∩ = both tables; − = first table only.',
      'Show the four results as explicit row lists, empty sets included.',
      'For the final sentence: explain in your own words why − is not commutative.'
    ],
    approach: `## The One-Line Definitions

\`\`\`
A ∪ B : rows appearing in A OR B        (deduplicate!)
A ∩ B : rows appearing in A AND B
A − B : rows in A that are NOT in B
B − A : rows in B that are NOT in A
\`\`\`

## The Method

\`\`\`
1. Write BOTH relations as row lists — collapse repeats FIRST.
2. UNION    → merge the lists, drop duplicates.
3. INTERSECT → keep rows whose value exists in the other table too.
4. DIFFERENCE → for each row of A ask "is this exact row in B?"
                 NO → it goes into A − B.
5. Round trip check: (A − B) and (B − A) overlap? If they do —
   you have a bug; set differences are disjoint.
\`\`\`

## Worked Walkthrough (Example 2)

\`\`\`
Step 1  R = {(x,1), (x,1)}  → collapses to {(x,1)}
Step 2  R ∪ S = {(x,1)} ∪ {(x,1), (y,2)} = {(x,1), (y,2)}
Step 3  R ∩ S = {(x,1)}            (the only common tuple)
Step 4  R − S = {}                 ((x,1) exists in S → dropped)
Step 5  S − R = {(y,2)}            (not in R)
\`\`\`

## Traps To Dodge

❌ **Keeping duplicates** — relations are sets by definition; every result must be deduplicated.\
❌ **Writing R − S and S − R as the same answer** — they are mirror images; compute each separately.\
❌ **Treating − like a comparison** — "not equal to S" is meaningless; − operates on whole table membership.\
❌ **Skipping the empty-set answer** — an empty result is a valid, and often the intended, answer.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- The set operations in SQL (same semantics: duplicates dropped)

-- R ∪ S
SELECT * FROM R
UNION
SELECT * FROM S;

-- R ∩ S
SELECT * FROM R
INTERSECT
SELECT * FROM S;

-- R − S
SELECT * FROM R
EXCEPT
SELECT * FROM S;

-- S − R
SELECT * FROM S
EXCEPT
SELECT * FROM R;`
      },
      {
        language: 'python',
        code: `# The same computation as plain sets
R = {(1, 'A'), (2, 'B'), (3, 'C')}
S = {(2, 'B'), (3, 'C'), (4, 'D')}

print("R ∪ S =", R | S)          # {(1,'A'), (2,'B'), (3,'C'), (4,'D')}
print("R ∩ S =", R & S)          # {(2,'B'), (3,'C')}
print("R − S =", R - S)          # {(1,'A')}
print("S − R =", S - R)          # {(4,'D')}
print("Commutative?", R - S == S - R)   # False`
      }
    ],
    timeComplexity: 'O(n+m)',
    spaceComplexity: 'O(n+m)'
  }
  ,
  {
    title: 'Compute a Natural Join Result',
    slug: 'compute-natural-join-result',
    lessonSlug: 'relational-algebra-calculus',
    subtopicSlug: 'joins-relational-algebra',
    difficulty: 'medium',
    topics: ['Natural Join', 'Relational Algebra', 'Joins'],
    companies: ['google', 'microsoft', 'ibm'],
    problemStatement: 'Compute the natural join (R ⋈ S) of the two relations below. Show every result row, the final column list (shared column appears ONCE), and state what happens to rows that find no match.',
    examples: [
      {
        input: "STUDENT(sid, name, dept): (1, Aarav, CS), (2, Meera, EC), (3, Ravi, ME).   ENROLLED(sid, grade, cid): (1, A, 101), (1, B, 102), (3, A, 201).",
        output: "STUDENT ⋈ ENROLLED (on shared column sid): (1, Aarav, CS, A, 101), (1, Aarav, CS, B, 102), (3, Ravi, ME, A, 201). Meera (sid 2) joins to NOTHING — inner natural join drops her.",
        explanation: "Match rows by sid: sid 1 appears in ENROLLED twice → Aarav gets TWO joined rows (one per course). sid 2 has no enrollment → dropped by the inner join. sid 3 matches once. Result columns: sid, name, dept, grade, cid — the shared sid appears exactly once."
      },
      {
        input: "GAME(player, team): (Sachin, IND), (Kohli, IND).   TEAM(name, coach): (IND, Rahul), (AUS, Langer).",
        output: "GAME ⋈ TEAM on same-named column name/team? CAREFUL: the shared-looking columns are player/team and name/coach — they share NO attribute name. Natural join = CARTESIAN PRODUCT: all 4 pairs.",
        explanation: "This is the classic edge case: player ≠ name, team ≠ name... The only same-named attribute is none — GAME has player+team; TEAM has name+coach? Actually no common column exists, so natural join degenerates into the cartesian product (4 rows). Rename (ρ) is needed to join meaningfully."
      },
      {
        input: "A(x, y): (1, p), (2, q).   B(y, z): (p, 10), (p, 20), (r, 30).",
        output: "A ⋈ B = (1, p, 10), (1, p, 20). Row (2, q) matches nothing → dropped. Row (r, 30) in B matches no A-row → dropped.",
        explanation: "Shared column y. A's (1,p) pairs with BOTH (p,10) and (p,20) → two result rows. Both (2,q) and (r,30) fail the equality → gone. Result columns: x, y, z with y once."
      }
    ],
    constraints: [
      'List every result row explicitly — row counts must match the pairing logic.',
      'Column list: shared attribute appears exactly ONCE.',
      'Inner natural join: unmatched rows on either side are dropped — say so.',
      'No shared column name → the answer is the cartesian product; call it out, do not fake a join.'
    ],
    approach: `## The Three-Step Natural Join

\`\`\`
1. FIND the common column(s) — same name in both schemas
   (none? → answer is the cartesian product; stop and say so)

2. PAIR rows — for every R row, for every S row:
   EQUAL common-column values → one result row
   (an R row with 2 matching S rows produces 2 results)

3. MERGE columns — concat R's columns and S's columns,
   SHARED column written ONCE
\`\`\`

## Working Example 1 Row-By-Row

\`\`\`
STUDENT: (1, Aarav, CS)  ENROLLED: (1, A, 101)   sid 1=1 → PAIR → (1, Aarav, CS, A, 101)
                 (1, Aarav, CS)  ENROLLED: (1, B, 102)   sid 1=1 → PAIR → (1, Aarav, CS, B, 102)
                 (2, Meera, EC)  ENROLLED: (1, ...)      sid 2≠1 → skip
                 (2, Meera, EC)  ENROLLED: (3, ...)      sid 2≠3 → skip
                 (3, Ravi, ME)   ENROLLED: (1, ...)      sid 3≠1 → skip
                 (3, Ravi, ME)   ENROLLED: (3, A, 201)   sid 3=3 → PAIR → (3, Ravi, ME, A, 201)

Result: 3 rows; columns (sid, name, dept, grade, cid) — sid once ✓
\`\`\`

## Traps To Dodge

❌ **Writing the shared column twice** — natural join output has it once; duplicating it is wrong.\
❌ **Counting rows wrong when one side repeats** — Aarav × 2 courses = 2 rows; multiply, don't add.\
❌ **Silently assuming a common column** — GAME/TEAM shares none; natural join = cartesian product; say it explicitly.\
❌ **Padding dropped rows with NULLs** — that is OUTER join behaviour; the plain ⋈ is inner and drops them.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Natural join in SQL (same semantics — shared columns matched once)

SELECT *
FROM STUDENT
NATURAL JOIN ENROLLED;

-- Or the explicit version (sid, which appears in both tables):
SELECT s.sid, s.name, s.dept, e.grade, e.cid
FROM STUDENT s
JOIN ENROLLED e ON s.sid = e.sid;`
      },
      {
        language: 'python',
        code: `STUDENT = [(1, 'Aarav', 'CS'), (2, 'Meera', 'EC'), (3, 'Ravi', 'ME')]
ENROLLED = [(1, 'A', 101), (1, 'B', 102), (3, 'A', 201)]

# natural join on the common attribute 'sid' (index 0 in both)
result = [(s[0], s[1], s[2], e[1], e[2])
          for s in STUDENT
          for e in ENROLLED
          if s[0] == e[0]]

print(result)
# [(1, 'Aarav', 'CS', 'A', 101), (1, 'Aarav', 'CS', 'B', 102), (3, 'Ravi', 'ME', 'A', 201)]`
      }
    ],
    timeComplexity: 'O(n*m)',
    spaceComplexity: 'O(n*m)'
  }
  ,
  {
    title: 'Write a CREATE TABLE Statement with Constraints',
    slug: 'write-create-table-constraints',
    lessonSlug: 'sql-ddl-dml',
    subtopicSlug: 'create-alter-drop-statements',
    difficulty: 'easy',
    topics: ['SQL DDL', 'CREATE TABLE', 'Constraints', 'Primary Key'],
    companies: ['amazon', 'microsoft', 'oracle'],
    problemStatement: 'Write a CREATE TABLE statement for the system described below, enforcing every business rule with the right constraints. Include column types, PRIMARY KEY, FOREIGN KEY (with ON DELETE choice), NOT NULL, UNIQUE, CHECK, and DEFAULT where the rules demand them.',
    examples: [
      {
        input: "Customers: each has a unique customerID, a mandatory name, a phone that never contains letters, and every customer must have an optional email. Orders: an order number unique per order, a placement date that defaults to today, an amount that must be positive, and every order must reference an existing customer.",
        output: "CREATE TABLE Customer (customerID INT PRIMARY KEY, name VARCHAR(80) NOT NULL, phone VARCHAR(15) CHECK (phone NOT LIKE '%[^0-9]%'), email VARCHAR(120)); CREATE TABLE Orders (orderID INT PRIMARY KEY, orderDate DATE DEFAULT CURRENT_DATE, amount DECIMAL(10,2) CHECK (amount > 0), customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE);",
        explanation: "Every rule maps to one constraint: unique → PRIMARY KEY; mandatory → NOT NULL; positive amount → CHECK; default today → DEFAULT CURRENT_DATE; must reference a customer → FK with NOT NULL; deleting a customer deleting orders → CASCADE."
      },
      {
        input: "A course registry: course code is unique and looks like 'CS101' (2 letters + 3 digits). Title is mandatory. Credits between 1 and 4. Optional instructor name. Deleting a department must reject while courses exist.",
        output: "CREATE TABLE Course (code VARCHAR(5) PRIMARY KEY CHECK (code LIKE '[A-Z][A-Z][0-9][0-9][0-9]'), title VARCHAR(100) NOT NULL, credits SMALLINT CHECK (credits BETWEEN 1 AND 4), instructor VARCHAR(50), deptID INT REFERENCES Department(deptID) ON DELETE RESTRICT);",
        explanation: "Pattern validation uses CHECK with LIKE; RESTRICT (NO ACTION) makes the department delete fail while courses reference it — history is never silently destroyed."
      }
    ],
    constraints: [
      'Write complete CREATE TABLE statements — every table mentioned in the scenario.',
      'Each business rule must visibly map to exactly one constraint — say which.',
      'Choose ON DELETE deliberately: CASCADE for expendable children, RESTRICT for protected history.',
      'Watch the order: referenced tables must be created first.'
    ],
    approach: `## Rule → Constraint Translation

| Business rule | Constraint |
|---|---|
| unique per row / code | PRIMARY KEY (or UNIQUE) |
| mandatory value | NOT NULL |
| must be positive / within a range / match a pattern | CHECK |
| auto value when omitted | DEFAULT |
| must reference an existing X | FOREIGN KEY ... REFERENCES X |
| deleting X must remove children | ON DELETE CASCADE |
| deleting X must be blocked | ON DELETE RESTRICT / NO ACTION |
| no two rows share a value | UNIQUE |

## Assembly Order

\`\`\`
1. LIST the tables — one per entity; the referenced ones go first
2. CHOOSE a type per column: INT / DECIMAL(p,s) / VARCHAR(n) / DATE
3. APPLY column constraints: NOT NULL, CHECK, UNIQUE, DEFAULT
4. DECLARE keys: PRIMARY KEY on each table, then FOREIGN KEYs
5. STATE delete behaviour on every FK: CASCADE / SET NULL / RESTRICT
6. CHECK the sentence: for every "must" in the problem — is there a constraint? ✓
\`\`\`

## Worked Trace On The Customer/Orders Example

\`\`\`
Requirement                   → Constraint
"unique customerID"          → PRIMARY KEY
"mandatory name"             → NOT NULL
"phone: no letters"          → CHECK (phone NOT LIKE '%[^0-9]%')
"optional email"             → NO constraint (nullable)
"order number unique"        → PRIMARY KEY
"defaults to today"          → DEFAULT CURRENT_DATE
"amount must be positive"    → CHECK (amount > 0)
"must reference a customer"  → customerID NOT NULL REFERENCES Customer
"delete customer → orders"   → ON DELETE CASCADE
\`\`\`

## Traps To Dodge

❌ **Child before parent** — creating Orders before Customer fails; create referenced tables first.\
❌ **CHECK without range logic** — \`\`\`amount > 0\`\`\` allows zero? No — it REJECTS zero; use >= 0 if zero is legal.\
❌ **VARCHAR for every column** — phones and codes want VARCHAR; money wants DECIMAL.\
❌ **CASCADE on sacred history** — orders are expendable (cascade ok); audit records are not (RESTRICT).`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- SOLUTION: Customer + Orders (full DDL)
CREATE TABLE Customer (
  customerID INT PRIMARY KEY,
  name       VARCHAR(80) NOT NULL,
  phone      VARCHAR(15) CHECK (phone NOT LIKE '%[^0-9]%'),
  email      VARCHAR(120)
);

CREATE TABLE Orders (
  orderID    INT PRIMARY KEY,
  orderDate  DATE DEFAULT CURRENT_DATE,
  amount     DECIMAL(10, 2) CHECK (amount > 0),
  customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE
);`
      },
      {
        language: 'sql',
        code: `-- SOLUTION: Course registry with pattern + range + RESTRICT
CREATE TABLE Department (
  deptID   INT PRIMARY KEY,
  deptName VARCHAR(60) NOT NULL
);

CREATE TABLE Course (
  code       VARCHAR(5) PRIMARY KEY
             CHECK (code LIKE '[A-Z][A-Z][0-9][0-9][0-9]'),
  title      VARCHAR(100) NOT NULL,
  credits    SMALLINT CHECK (credits BETWEEN 1 AND 4),
  instructor VARCHAR(50),
  deptID     INT REFERENCES Department(deptID) ON DELETE RESTRICT
);`
      }
    ],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A'
  }
  ,
  {
    title: 'Write DML Statements for a Given Scenario',
    slug: 'write-dml-statements-scenario',
    lessonSlug: 'sql-ddl-dml',
    subtopicSlug: 'insert-update-delete',
    difficulty: 'easy',
    topics: ['SQL DML', 'INSERT', 'UPDATE', 'DELETE'],
    companies: ['google', 'microsoft', 'wipro'],
    problemStatement: 'For the inventory scenario below, write the exact series of DML statements: the INSERTs for new stock, the UPDATEs for price changes, and the DELETEs for discontinued items. Every statement must target exactly the rows the scenario names — nothing more, nothing less.',
    examples: [
      {
        input: "Products table: (1, 'Chai', 18), (2, 'Coffee', 45), (3, 'Sugar', 30). Today: a new product (4, 'Salt', 12) arrives; the price of Coffee rises by 10; product 3 is discontinued and must leave the catalog.",
        output: "INSERT INTO Products VALUES (4, 'Salt', 12);\nUPDATE Products SET price = price + 10 WHERE productID = 2;\nDELETE FROM Products WHERE productID = 3;",
        explanation: "Each action maps to one statement. INSERT adds the new row; UPDATE applies 'rise by 10' to exactly product 2 via WHERE; DELETE removes only product 3. The new row (4) is untouched by the UPDATE because WHERE named productID = 2."
      },
      {
        input: "Employee table: (1, 'Aarav', 50000, 'HR'), (2, 'Meera', 60000, 'IT'), (3, 'Ravi', 55000, 'IT'). Promotion: everyone in IT gets +5%; Aarav moves to IT; Ravi resigns.",
        output: "UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT'; — run BEFORE Aarav moves!\nUPDATE Employee SET dept = 'IT' WHERE empID = 1;\nDELETE FROM Employee WHERE empID = 3;",
        explanation: "Order matters: Aarav is promoted by +5% only if he is still HR when the IT UPDATE runs. Sequence: raise IT salaries first, then transfer Aarav, then remove Ravi. Wrong order → Aarav's salary misses the raise."
      },
      {
        input: "Orders table with customerID FK (CASCADE). Customer 5 placed orders 101 and 102. The company is closing customer 5's account.",
        output: "DELETE FROM Customer WHERE customerID = 5; — the ON DELETE CASCADE removes orders 101 and 102 automatically.\n(Check the cascade before running: a NON-cascade FK would fail with a constraint error.)",
        explanation: "DML must respect FKs. With CASCADE the single DELETE does both jobs; without it the DELETE errors — the correct DML is then two statements (delete orders, then customer) inside a transaction."
      }
    ],
    constraints: [
      'Write statements in execution order and justify that order.',
      'Every WHERE clause must name the exact rows the scenario touches.',
      'Consider FK side effects (CASCADE vs RESTRICT) before writing a DELETE.',
      'Use transactions around multi-row risky changes — show BEGIN/COMMIT where relevant.'
    ],
    approach: `## The DML Planning Loop

\`\`\`
1. SORT the scenario into INSERT / UPDATE / DELETE buckets
2. ORDER the buckets: INSERTs first, then UPDATEs, then DELETEs
   — because UPDATEs must see the rows INSERTs created,
     and DELETEs must not kill rows later UPDATEs need
3. WRITE every WHERE to match the scenario words exactly:
   "product 3" → WHERE productID = 3  (never "WHERE price = 30")
4. ASK the FK question per DELETE:
   CASCADE? → one DELETE
   RESTRICT? → delete children first, or the DELETE fails
5. WRAP risky multi-row steps in BEGIN/COMMIT/ROLLBACK
\`\`\`

## Why Order Nearly Broke Example 2

\`\`\`
WRONG (Aarav gets the raise twice? No — once, wrongly):
   UPDATE Employee SET dept = 'IT' WHERE empID = 1;   ← moves Aarav FIRST
   UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT';  ← now includes Aarav

RIGHT:
   UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT';  ← HR only +5%
   UPDATE Employee SET dept = 'IT' WHERE empID = 1;
\`\`\`

## Traps To Dodge

❌ **Identifying rows by attributes instead of keys** — "the Coffee product" becomes \`\`\`WHERE productID = 2\`\`\`, not \`\`\`WHERE name = 'Coffee'\`\`\` (names can repeat).\
❌ **Order blindness** — a delete that runs before the update that needed that row wrecks the answer.\
❌ **Ignoring the cascade** — writing \`\`\`DELETE FROM Customer\`\`\` on a RESTRICT FK errors; the grader wants the children-first approach.\
❌ **Auto-commit surprise** — without a transaction, a mistaken full-table UPDATE is permanent; show BEGIN/ROLLBACK discipline.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- SOLUTION: Example 1 (Chai/Coffee/Sugar)
INSERT INTO Products VALUES (4, 'Salt', 12);

UPDATE Products SET price = price + 10 WHERE productID = 2;

DELETE FROM Products WHERE productID = 3;`
      },
      {
        language: 'sql',
        code: `-- SOLUTION: Example 2 (HR/IT promotion — correct order)
BEGIN;

UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT';
UPDATE Employee SET dept = 'IT' WHERE empID = 1;
DELETE FROM Employee WHERE empID = 3;

COMMIT;   -- inspect count of affected rows first, then COMMIT or ROLLBACK`
      }
    ],
    timeComplexity: 'O(rows)',
    spaceComplexity: 'O(1)'
  }
  ,
  {
    title: 'Write a Filtered and Sorted Query',
    slug: 'write-filtered-sorted-query',
    lessonSlug: 'sql-select-queries',
    subtopicSlug: 'basic-select-where-order-by',
    difficulty: 'easy',
    topics: ['SQL SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
    companies: ['amazon', 'google', 'microsoft'],
    problemStatement: 'Write a single SELECT statement for each English question below, using only the Employees table: id, name, dept, hireDate, salary. Read the question for the filter, the columns to show, and the exact sort order.',
    examples: [
      {
        input: "Employees table rows: (1, Aarav, IT, 2021-06-01, 60000), (2, Meera, HR, 2019-03-15, 55000), (3, Ravi, IT, 2023-01-20, 45000), (4, Sneha, Sales, 2020-11-02, 52000). Question: show names and salaries of IT employees earning more than 50,000, best salary first.",
        output: "SELECT name, salary FROM Employees WHERE dept = 'IT' AND salary > 50000 ORDER BY salary DESC;  → Result: (Aarav, 60000) only.",
        explanation: "Both filters land in WHERE connected by AND; columns picked are exactly name and salary; ORDER BY salary DESC puts 60000 before any lower value. Ravi fails the salary filter, HR/Sales fail the dept filter."
      },
      {
        input: "Same Employees table. Question: list distinct departments in alphabetical order.",
        output: "SELECT DISTINCT dept FROM Employees ORDER BY dept;  → Result: HR, IT, Sales (alphabetical).",
        explanation: "DISTINCT removes repeated dept values even though multiple rows share them; ORDER BY dept sorts the single result rows alphabetically. DISTINCT runs before ORDER BY in the execution pipeline."
      },
      {
        input: "Same Employees table. Question: show the names of the three newest hires (most recent hire date first).",
        output: "SELECT name FROM Employees ORDER BY hireDate DESC LIMIT 3;  → Result: Ravi (2023), Aarav (2021), Sneha (2020).",
        explanation: "Ordering happens BEFORE limiting: the whole table is sorted by hireDate DESC, then LIMIT 3 keeps the top of that sorted list. Reversing them would pick three arbitrary rows."
      }
    ],
    constraints: [
      'One statement per question — no subqueries or joins unless stated.',
      'Filter exactly what the words say: every word in the question maps to a clause.',
      'Sort direction matters: DESC for "best"/"newest"/"highest", ASC otherwise.',
      'LIMIT always after ORDER BY — the limit applies to the sorted list.'
    ],
    approach: `## Sentence → Clause Translation

| English words | SQL clause |
|---|---|
| "show / list / display" | SELECT columns |
| "distinct / unique / different" | DISTINCT |
| "who earn / in IT / hired after..." | WHERE |
| "best / newest / highest first" | ORDER BY ... DESC |
| "alphabetical / beginning" | ORDER BY ... ASC (or nothing) |
| "top / first 3 / just 5" | LIMIT n |
| "skip the first 2" | OFFSET 2 |

## The Five-Line Recipe

\`\`\`
1. UNDERLINE the columns   → SELECT list
2. UNDERLINE every condition → WHERE (join with AND)
3. CIRCLE sorting words     → ORDER BY col + direction
4. CIRCLE limit words      → LIMIT n  (AFTER ORDER BY)
5. READ the query aloud:
   "SELECT name, salary FROM Employees WHERE dept = 'IT' AND
    salary > 50000 ORDER BY salary DESC;"
\`\`\`

## Worked Trace — The Three Newest Hires

\`\`\`
Who      → "three newest hires"
Columns  → name
Sort     → most recent hire first → ORDER BY hireDate DESC
Limit    → "three" → LIMIT 3

SELECT name FROM Employees ORDER BY hireDate DESC LIMIT 3;

Execution: FROM (whole table) → no WHERE → ORDER BY date desc
          → LIMIT keeps (Ravi, Aarav, Sneha) ✓
\`\`\`

## Traps To Dodge

❌ **LIMIT before sorting** — LIMIT takes the first n of whatever order exists; sort first.\
❌ **= NULL** — the hiring question says "no hire date" — that needs IS NULL, not = NULL.\
❌ **Forgetting DESC** — "best salary first" without DESC returns the LOWEST first.\
❌ **SELECT * when three columns are asked** — grade against the question's column list, not the table.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Solution queries (Employees table)

-- Q1: IT employees earning > 50k, best salary first
SELECT name, salary
FROM Employees
WHERE dept = 'IT' AND salary > 50000
ORDER BY salary DESC;

-- Q2: distinct departments, alphabetical
SELECT DISTINCT dept
FROM Employees
ORDER BY dept;

-- Q3: three newest hires
SELECT name
FROM Employees
ORDER BY hireDate DESC
LIMIT 3;`
      }
    ],
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  }
  ,
  {
    title: 'Write a Query Using GROUP BY and HAVING',
    slug: 'write-query-group-by-having',
    lessonSlug: 'sql-select-queries',
    subtopicSlug: 'aggregate-functions-group-by',
    difficulty: 'medium',
    topics: ['SQL GROUP BY', 'HAVING', 'Aggregates', 'AVG'],
    companies: ['google', 'oracle', 'ibm'],
    problemStatement: 'Write the SQL that answers each business question below. Every aggregate question needs GROUP BY on the dimension column; every filter on a GROUP result needs HAVING; row-level filters stay in WHERE. Use the Sales table: id, region, product, amount.',
    examples: [
      {
        input: "Sales rows: (1, North, Pen, 100), (2, North, Pen, 50), (3, South, Pen, 200), (4, North, Book, 300). Question: total sales per region.",
        output: "SELECT region, SUM(amount) AS total FROM Sales GROUP BY region;  → Result: North 450, South 200.",
        explanation: "The dimension 'per region' is GROUP BY region; the measure 'total' is SUM(amount). North sums 100 + 50 + 300 = 450; South sums 200."
      },
      {
        input: "Same Sales table. Question: regions whose AVERAGE sale is above 150.",
        output: "SELECT region, AVG(amount) AS avg_sale FROM Sales GROUP BY region HAVING AVG(amount) > 150;  → Result: South (200).",
        explanation: "The filter targets the GROUP's aggregate, not individual rows — so it lives in HAVING. North's average is (100+50+300)/3 = 150, which fails > 150; South's 200 passes."
      },
      {
        input: "Extended Sales table. Question: am allowed to filter out small individual sales (amount < 50) BEFORE grouping, then find regions with more than 2 remaining sales.",
        output: "SELECT region, COUNT(*) AS cnt FROM Sales WHERE amount >= 50 GROUP BY region HAVING COUNT(*) > 2;",
        explanation: "The row filter goes in WHERE before grouping; the group-count filter goes in HAVING after grouping. Execution: drop small rows → group by region → count → keep groups with count > 2."
      }
    ],
    constraints: [
      'Every non-aggregate column in SELECT must appear in GROUP BY.',
      'Row filters → WHERE (before grouping); group filters → HAVING (after grouping).',
      'Name computed columns with AS — the expected output shows the alias.',
      'Aggregates skip NULLs — flag it in your explanation when the data contains them.'
    ],
    approach: `## The Six-Step Group Query Builder

\`\`\`
1. FIND the dimension: "per region / per product / by year"
   → GROUP BY dimension_column
2. FIND the measure: "total / average / count / cheapest"
   → SUM / AVG / COUNT / MIN / MAX
3. FIND row filters: "sales above 500" for each individual row
   → WHERE (before GROUP BY)
4. FIND group filters: "regions whose AVERAGE..." "groups with more than..."
   → HAVING (after GROUP BY)
5. WRITE the SELECT: dimension, aggregate AS alias
6. VERIFY: every non-aggregate SELECT column is in GROUP BY ✓
\`\`\`

## WHERE vs HAVING — Instant Decision

\`\`\`
Does the filter talk about ONE ROW?      → WHERE
Does it talk about a GROUP/aggregate?    → HAVING

"sales above 500" (each row)     → WHERE amount > 500
"average sale above 150" (group) → HAVING AVG(amount) > 150
\`\`\`

## Worked Trace — Example 3

\`\`\`
"filter out amount < 50"         → WHERE amount >= 50       (row filter)
"regions with more than 2 sales" → HAVING COUNT(*) > 2      (group filter)
dimension: region                → GROUP BY region
measure: how many                → COUNT(*)

Execution: WHERE drops small rows → GROUP BY region → COUNT per group
→ HAVING keeps only groups with count > 2 ✓
\`\`\`

## Traps To Dodge

❌ **Aggregate in WHERE** — \`\`\`WHERE AVG(amount) > 150\`\`\` is illegal; HAVING owns aggregates.\
❌ **SELECT columns out of GROUP BY** — \`\`\`SELECT region, product, SUM(amount) GROUP BY region\`\`\` breaks instantly.\
❌ **HAVING for row filters** — semantic error: groups form AFTER the row filter; filtering rows in HAVING is a different question.\
❌ **AS missing** — the expected output table has a name for the computed column.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Q1: total sales per region
SELECT region, SUM(amount) AS total
FROM Sales
GROUP BY region;

-- Q2: regions whose AVERAGE sale is above 150
SELECT region, AVG(amount) AS avg_sale
FROM Sales
GROUP BY region
HAVING AVG(amount) > 150;

-- Q3: drop small sales, then regions with more than 2 remaining
SELECT region, COUNT(*) AS cnt
FROM Sales
WHERE amount >= 50
GROUP BY region
HAVING COUNT(*) > 2;`
      }
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(groups)'
  }
  ,
  {
    title: 'Write a Query Using an Outer Join',
    slug: 'write-query-outer-join',
    lessonSlug: 'sql-joins',
    subtopicSlug: 'inner-outer-joins',
    difficulty: 'medium',
    topics: ['SQL Joins', 'LEFT JOIN', 'Outer Join', 'COUNT'],
    companies: ['amazon', 'google', 'microsoft'],
    problemStatement: 'Write the query that answers each question below. When the question says "every/each/all customers", the join must KEEP unmatched rows — that means an outer join. Tables: Customers(customerID, name) and Orders(orderID, customerID, amount).',
    examples: [
      {
        input: "Customers: (1, Aarav), (2, Meera), (3, Ravi). Orders: (101, 1, 500), (102, 1, 700), (103, 3, 900). Question: every customer with the total amount of their orders (customers with zero orders must appear with 0).",
        output: "SELECT c.name, COALESCE(SUM(o.amount), 0) AS total FROM Customers c LEFT JOIN Orders o ON c.customerID = o.customerID GROUP BY c.name; → Aarav 1200, Meera 0, Ravi 900.",
        explanation: "LEFT JOIN keeps Meera's NULL order row; SUM over a NULL becomes NULL, so COALESCE turns it into 0. GROUP BY c.name collapses each customer's rows; the ORDER column is absent from Orders? No — the column list works because GROUP BY names the only non-aggregate."
      },
      {
        input: "Same tables. Question: customers who have NOT placed any order.",
        output: "SELECT c.name FROM Customers c LEFT JOIN Orders o ON c.customerID = o.customerID WHERE o.orderID IS NULL; → Meera.",
        explanation: "The LEFT JOIN produces NULLs in the order columns for unmatched customers; WHERE o.orderID IS NULL selects exactly those rows — the standard 'find the non-matching side' idiom."
      },
      {
        input: "Same tables. Question: every order, with the customer name, and keep orders even if their customer record is missing.",
        output: "SELECT o.orderID, c.name FROM Orders o LEFT JOIN Customers c ON o.customerID = c.customerID;",
        explanation: "The 'keep every order' side is the LEFT side of the join — Orders first, Customers second. Unmatched orders (if any) get NULL name. Flip the table order, do not flip the keyword."
      }
    ],
    constraints: [
      'The "keep everyone" side must sit on the LEFT of a LEFT JOIN (or the RIGHT of a RIGHT JOIN) — state it.',
      'Zero-count customers: use COALESCE(SUM(...), 0) — never let NULL leak into the answer.',
      'The "not on the other side" idiom is LEFT JOIN + WHERE otherTable.key IS NULL.',
      'GROUP BY only the non-aggregate columns.'
    ],
    approach: `## Choosing The Join Type In Three Words

\`\`\`
Read the question — who is the "every/each/all" side?

"EVERY customer, with their orders if any"  → Customers must ALL survive → LEFT JOIN
"orders even if customer missing"           → Orders must ALL survive   → LEFT JOIN (orders first)
"only customers who have orders"            → nobody forced to survive  → INNER JOIN
\`\`\`

## The Two Outer-Join Patterns

**Pattern 1 — keep everyone, count the rest:**
\`\`\`
SELECT c.name, COALESCE(SUM(o.amount), 0)
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
GROUP BY c.name;
\`\`\`

**Pattern 2 — the ones with no match:**
\`\`\`
SELECT c.name
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
WHERE o.orderID IS NULL;      -- no matching order → NULL key
\`\`\`

## Worked Walkthrough — The Zero-Order Customer

\`\`\`
Meera:  LEFT JOIN gives (Meera, NULL, NULL)
SUM(o.amount) over one NULL row → NULL        (aggregates skip NULLs → empty set → NULL)
COALESCE(NULL, 0) → 0                        ✓ answer says "0"

Without COALESCE the row reads "Meera, NULL" — the classic grading loss.
\`\`\`

## Traps To Dodge

❌ **INNER JOIN in a "every customer" question** — Meera silently disappears.\
❌ **SUM leaking NULL** — wrap every aggregate that may see zero rows in COALESCE.\
❌ **GROUP BY missing columns** — c.name is the only non-aggregate → it must be grouped.\
❌ **IS NULL on the wrong column** — the JOIN column (o.customerID) is fine, but o.orderID is safer — both work only if it can never be NULL for a real order.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Q1: every customer + order totals (zeros included)
SELECT c.name, COALESCE(SUM(o.amount), 0) AS total
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
GROUP BY c.name;

-- Q2: customers who never ordered
SELECT c.name
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
WHERE o.orderID IS NULL;

-- Q3: every order with its customer (missing customers kept)
SELECT o.orderID, c.name
FROM Orders o
LEFT JOIN Customers c ON o.customerID = c.customerID;`
      }
    ],
    timeComplexity: 'O(n+m)',
    spaceComplexity: 'O(n+m)'
  }
  ,
  {
    title: 'Write a Self-Join Query',
    slug: 'write-self-join-query',
    lessonSlug: 'sql-joins',
    subtopicSlug: 'self-joins-cross-joins',
    difficulty: 'medium',
    topics: ['SQL Joins', 'Self Join', 'Alias', 'Cross Join'],
    companies: ['google', 'oracle', 'ibm'],
    problemStatement: 'Write the queries below using ONLY the Employees table: empID, name, salary, managerID (managerID references empID of another row; NULL = no manager). Self joins need aliases — name both copies clearly.',
    examples: [
      {
        input: "Employees: (1, Aarav, 60000, NULL), (2, Meera, 90000, NULL), (3, Ravi, 55000, 1), (4, Sneha, 70000, 2). Question: each employee with their manager's name.",
        output: "SELECT w.name AS employee, m.name AS manager FROM Employees w LEFT JOIN Employees m ON w.managerID = m.empID; → Aarav NULL (no manager), Meera NULL, Ravi Aarav, Sneha Meera.",
        explanation: "w is the worker copy, m is the manager copy; ON w.managerID = m.empID links each worker to the row that is their boss. LEFT JOIN keeps the two bossless employees with NULL manager names."
      },
      {
        input: "Same table. Question: employees earning MORE than their own manager.",
        output: "SELECT w.name FROM Employees w JOIN Employees m ON w.managerID = m.empID WHERE w.salary > m.salary;",
        explanation: "An INNER self join pairs workers with their manager rows; the WHERE compares the two salaries in the same row. Bossless employees (managerID NULL) fail the join condition and are correctly excluded."
      },
      {
        input: "Same table extended with city. Question: all pairs of employees living in the same city, each pair listed once.",
        output: "SELECT a.name AS person1, b.name AS person2 FROM Employees a JOIN Employees b ON a.city = b.city AND a.empID < b.empID;",
        explanation: "The a.empID < b.empID guard kills duplicates: without it, (Aarav, Meera) and (Meera, Aarav) both appear. The inequality keeps exactly one ordering of each pair."
      }
    ],
    constraints: [
      'Give every copy of the table an alias — w/m or a/b — and say which is which.',
      'Choose LEFT JOIN when bossless employees must appear; INNER when they must not.',
      'Pair questions need the a.id < b.id guard against double listing.',
      'A CROSS JOIN must be explicitly named if used — never accidental cartesian products.'
    ],
    approach: `## The Self-Join Recipe

\`\`\`
1. DRAW the two roles the table plays:
   "worker vs manager" → w = worker copy, m = manager copy
   "people vs people"  → a = first copy, b = second copy
2. WRITE the ON that links the roles:
   worker-manager   → ON w.managerID = m.empID
   same-city pairs  → ON a.city = b.city  (+ dedupe guard)
3. CHOOSE join type by the "must they all survive?" question:
   bossless included → LEFT JOIN ; strictly pairs → INNER JOIN
4. ADD the WHERE for value comparisons (salary >, date <, ...)
5. DEDUPE pairs: a.empID < b.empID
\`\`\`

## Worked Trace — Salary vs Manager

\`\`\`
Join rows (INNER):  Ravi–Aarav, Sneha–Meera
Compare:            Ravi 55000 > Aarav 60000? NO → dropped
                    Sneha 70000 > Meera 90000? NO → dropped
Result: empty in this data — the query is still the right answer.
\`\`\`

## Traps To Dodge

❌ **Aliasless self join** — SQL cannot tell the two copies apart without aliases.\
❌ **INNER dropping the CEO** — "each employee with their manager" must use LEFT JOIN or the bossless vanish.\
❌ **Missing the dedupe guard** — same-city pairs without \`\`\`a.empID < b.empID\`\`\` return each pair twice.\
❌ **Accidental cartesian** — writing the self join without an ON clause multiplies the table by itself.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Q1: employee + manager name (bossless employees kept)
SELECT w.name AS employee, m.name AS manager
FROM Employees w
LEFT JOIN Employees m ON w.managerID = m.empID;

-- Q2: earners above their own manager
SELECT w.name AS employee
FROM Employees w
JOIN Employees m ON w.managerID = m.empID
WHERE w.salary > m.salary;

-- Q3: same-city pairs, each listed once
SELECT a.name AS person1, b.name AS person2
FROM Employees a
JOIN Employees b ON a.city = b.city AND a.empID < b.empID;`
      }
    ],
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n^2)'
  }
  ,
  {
    title: 'Write a Query Using a Correlated Subquery',
    slug: 'write-correlated-subquery',
    lessonSlug: 'subqueries-set-operations',
    subtopicSlug: 'nested-subqueries',
    difficulty: 'hard',
    topics: ['Correlated Subquery', 'EXISTS', 'Subquery', 'AVG'],
    companies: ['amazon', 'google', 'oracle'],
    problemStatement: 'For each question below, write a single query using a correlated subquery (or EXISTS/NOT EXISTS where the question demands it). The inner query MUST reference the outer row — prove the correlation with the aliases. Table: Employees(empID, name, salary, dept).',
    examples: [
      {
        input: "Employees: (1, Aarav, 60000, IT), (2, Meera, 50000, IT), (3, Ravi, 45000, HR), (4, Sneha, 70000, HR). Question: employees earning MORE than the average of their OWN department.",
        output: "SELECT name FROM Employees e1 WHERE salary > (SELECT AVG(salary) FROM Employees e2 WHERE e2.dept = e1.dept); → Aarav (60000 > avg 55000), Sneha (70000 > avg 57500).",
        explanation: "The inner query uses e1.dept — that is the correlation. For each outer row the department average is recomputed: IT avg = (60000+50000)/2 = 55000 → only Aarav beats it; HR avg = 57500 → only Sneha beats it. Without the e2.dept = e1.dept link it would be the wrong single-global-average query."
      },
      {
        input: "Same table. Question: find departments that have at least one employee earning above 60,000 — using EXISTS.",
        output: "SELECT DISTINCT dept FROM Employees e1 WHERE EXISTS (SELECT 1 FROM Employees e2 WHERE e2.dept = e1.dept AND e2.salary > 60000); → IT, HR.",
        explanation: "EXISTS returns TRUE as soon as one matching row exists — the 1 in SELECT 1 is a placeholder (never materialised). The correlation e2.dept = e1.dept ties each outer row to its own department; the salary condition lives in the inner WHERE."
      },
      {
        input: "Same table. Question: employees who earn more than EVERYONE in OTHER departments — strictly above the global best outside their own department.",
        output: "SELECT name FROM Employees e1 WHERE salary > ALL (SELECT salary FROM Employees e2 WHERE e2.dept <> e1.dept);",
        explanation: "The inner query collects the salaries of all departments EXCEPT e1's own; salary > ALL(...) means the employee beats every one of those. The <> e1.dept makes it correlated; ALL turns the comparison into 'greater than the max'."
      }
    ],
    constraints: [
      'The inner query must reference the outer alias — otherwise it is NOT correlated; say which clause does it.',
      'Use >ALL / >ANY / EXISTS / NOT EXISTS exactly where the question maps to them.',
      'SELECT 1 inside EXISTS is idiomatic — explain it.',
      'Verify the row outputs against the recomputed inner values, as in the examples.'
    ],
    approach: `## The Correlated Subquery Recipe

\`\`\`
1. WRITE the outer query first: SELECT ... FROM Employees e1
2. ASK: what does the inner query need from THIS row?
   "their own department" → e2.dept = e1.dept
   "other departments"    → e2.dept <> e1.dept
3. WRITE the inner query, ALIASED differently (e2)
4. CONNECT: the correlation clause sits in the inner WHERE
5. CHOOSE the word by the question:
   "more than the average of their own" → scalar > (inner)
   "at least one exists"               → EXISTS
   "more than everyone in others"      → > ALL
   "more than at least one other"      → > ANY
\`\`\`

## Why The Aliases Matter

\`\`\`
WRONG (not correlated):
   WHERE salary > (SELECT AVG(salary) FROM Employees)        -- global average, once

RIGHT (correlated):
   WHERE salary > (SELECT AVG(salary) FROM Employees e2
                   WHERE e2.dept = e1.dept)                  -- per-row average
\`\`\`

Execution for the first example:

\`\`\`
ROW Aarav (IT):    inner → AVG(IT) = 55000 → 60000 > 55000 ✓ keep
ROW Meera (IT):    inner → AVG(IT) = 55000 → 50000 > 55000 ✗ drop
ROW Ravi (HR):     inner → AVG(HR) = 57500 → 45000 > 57500 ✗ drop
ROW Sneha (HR):    inner → AVG(HR) = 57500 → 70000 > 57500 ✓ keep
\`\`\`

## Traps To Dodge

❌ **Missing the correlation** — the inner query without e1.dept runs once and answers a different question.\
❌ **Same alias on both copies** — e1 vs e2 must differ or the engine cannot resolve the link.\
❌ **EXISTS returning data** — SELECT 1 (or *): only existence matters, never row contents.\
❌ **Perf blindness** — correlated queries rerun per row; mention WHERE possible.`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Q1: above the average of one's OWN department (correlated)
SELECT name
FROM Employees e1
WHERE salary > (
  SELECT AVG(salary)
  FROM Employees e2
  WHERE e2.dept = e1.dept
);

-- Q2: departments with a 60k+ earner (EXISTS)
SELECT DISTINCT dept
FROM Employees e1
WHERE EXISTS (
  SELECT 1
  FROM Employees e2
  WHERE e2.dept = e1.dept AND e2.salary > 60000
);

-- Q3: above EVERYONE in other departments (> ALL, correlated)
SELECT name
FROM Employees e1
WHERE salary > ALL (
  SELECT salary
  FROM Employees e2
  WHERE e2.dept <> e1.dept
);`
      }
    ],
    timeComplexity: 'O(n*k)',
    spaceComplexity: 'O(1)'
  }
  ,
  {
    title: 'Combine Results Using Set Operators',
    slug: 'combine-results-set-operators',
    lessonSlug: 'subqueries-set-operations',
    subtopicSlug: 'union-intersect-except',
    difficulty: 'medium',
    topics: ['UNION', 'INTERSECT', 'EXCEPT', 'Set Operations'],
    companies: ['google', 'oracle', 'microsoft'],
    problemStatement: 'Answer each question with one query using UNION, UNION ALL, INTERSECT, or EXCEPT. Both SELECT halves must return the same number of columns with compatible types. Tables: Products(productCode, launchYear, category), Q1Sales, Q2Sales, Catalogue, Ordered (each with a productCode column). In every set operation columns pair by POSITION, not by name.',
    examples: [
      {
        input: "Products launched before 2020: (P1, 2018), (P2, 2019). Products launched after 2024: (P2, 2025), (P3, 2026). Question: the DISTINCT list of all products launched outside 2020–2024.",
        output: "SELECT productCode FROM Products WHERE launchYear < 2020 UNION SELECT productCode FROM Products WHERE launchYear > 2024; → P1, P2, P3 (unique).",
        explanation: "P2 appears in BOTH halves — UNION removes the duplicate, giving one P2 row. UNION ALL would have returned P2 twice: P1, P2, P2, P3."
      },
      {
        input: "Products sold in Q1: {P1, P2, P3}. Products sold in Q2: {P2, P3, P4}. Question: products sold in BOTH quarters.",
        output: "SELECT productCode FROM Q1Sales INTERSECT SELECT productCode FROM Q2Sales; → P2, P3.",
        explanation: "INTERSECT keeps only rows that exist in both result sets. P1 and P4 miss one half each; P2 and P3 make both. Duplicates inside one half collapse automatically."
      },
      {
        input: "Catalogue products: {P1, P2, P3, P4}. Products ever ordered: {P2, P4, P5}. Question: products in the catalogue that have NEVER been ordered.",
        output: "SELECT productCode FROM Catalogue EXCEPT SELECT productCode FROM Ordered; → P1, P3.",
        explanation: "EXCEPT keeps ONLY the left side's rows that are missing from the right side. P2 and P4 are ordered → excluded; P5 is not in the catalogue at all → irrelevant; P1 and P3 survive."
      }
    ],
    constraints: [
      'Both halves must return the same number of columns — violations are the classic hidden trap.',
      'UNION vs UNION ALL: choose with the duplicate question in mind and justify.',
      'EXCEPT = left minus right — its direction is part of the answer.',
      'ORDER BY lands once at the very end of the whole set expression.'
    ],
    approach: `## Operator → Question Word Map

| Question words | Operator |
|---|---|
| "distinct list of all products from either" | UNION |
| "including every occurrence / total over days" | UNION ALL |
| "sold in BOTH ... and ..." | INTERSECT |
| "in A but NEVER in B / not ordered / missing" | EXCEPT (left = keep-side) |
| "at least one of the two lists" | UNION |

## The Position-Pairing Rule

\`\`\`
CHECK before typing:
  1. COUNT the columns of the left SELECT
  2. COUNT the columns of the right SELECT
  3. MATCH types per position (VARCHAR↔VARCHAR, INT↔INT)
  4. Column NAMES do NOT need to agree — positions do!
\`\`\`

## Worked Walkthrough — The Never-Ordered Products

\`\`\`
Catalogue = {P1, P2, P3, P4}      Ordered = {P2, P4, P5}
Keep-criterion: in Catalogue but not in Ordered

P1 ∈ C, ∉ O  → keep
P2 ∈ C, ∈ O  → drop
P3 ∈ C, ∉ O  → keep
P4 ∈ C, ∈ O  → drop
P5 ∉ C       → not in the game

Result: P1, P3
\`\`\`

## Traps To Dodge

❌ **Swapping EXCEPT's direction** — "catalogue minus ordered" answers "never ordered"; "ordered minus catalogue" answers something else entirely.\
❌ **UNION where duplicates count** — a daily-log total with UNION loses every repeated entry.\
❌ **Different column counts** — the pairing rule; a 2-column left vs 1-column right errors immediately.\
❌ **ORDER BY scatter** — a single ORDER BY at the end of the combined statement; halves never carry their own sorts (unless inside subqueries).`,
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Q1: outside 2020-2024, distinct (UNION)
SELECT productCode FROM Products WHERE launchYear < 2020
UNION
SELECT productCode FROM Products WHERE launchYear > 2024;

-- Q2: sold in both quarters (INTERSECT)
SELECT productCode FROM Q1Sales
INTERSECT
SELECT productCode FROM Q2Sales;

-- Q3: catalogue products never ordered (EXCEPT)
SELECT productCode FROM Catalogue
EXCEPT
SELECT productCode FROM Ordered;

-- With ordering: one ORDER BY, at the end
SELECT productCode FROM Catalogue
EXCEPT
SELECT productCode FROM Ordered
ORDER BY productCode;`
      }
    ],
    timeComplexity: 'O(n log n + m log m)',
    spaceComplexity: 'O(n+m)'
  },
  {
    title: 'Determine if a Functional Dependency Holds',
    slug: 'determine-functional-dependency-holds',
    lessonSlug: 'functional-dependencies',
    subtopicSlug: 'functional-dependency-basics',
    difficulty: 'medium',
    topics: ['Functional Dependency Basics'],
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    problemStatement: 'For each scenario below, decide whether the given functional dependency holds, and name the exact reason (data test, Armstrong rule, or counter example). Scenario 1 — STUDENT table with sample rows: judge id → name, city → zip, name → zip. Scenario 2 — logical family F = {A → B, B → C}: judge A → C and B → A. Scenario 3 — an EMPLOYEE table where two bosses share a name: judge boss_name → salary.',
    examples: [
      {
        input: 'STUDENT rows: (104, Priya, Pune, 411001), (105, Ravi, Pune, 411001), (106, Priya, Mumbai, 400001)',
        output: 'id → name HOLDS; city → zip HOLDS; name → zip VIOLATED',
        explanation: 'Rows 104 and 106 share name = Priya but differ in zip (411001 vs 400001), so name → zip fails the two-person test.'
      },
      {
        input: 'F = {A → B, B → C}; judge A → C, then judge B → A',
        output: 'A → C holds by transitivity; B → A cannot be derived',
        explanation: 'Transitivity chains A → B → C. For B → A there is no rule with B on any left side reaching A — nothing proves it.'
      },
      {
        input: 'EMPLOYEE rows: (E1, Sameer, Zone1, 90000), (E2, Sameer, Zone1, 85000)',
        output: 'boss_name → salary VIOLATED',
        explanation: 'Two employees have the same boss_name = Sameer but different salaries, so the FD fails on real data.'
      }
    ],
    constraints: [
      'For data-based judgments, use only the rows shown — do not make up new rows',
      'For logical judgments, use exactly the family F given and Armstrong axioms',
      'Answer must name the evidence: which row pair, or which axiom'
    ],
    approach: `### Data Test (Two-Person Rule) — Pseudocode

\`\`\`
FOR every pair of rows (r1, r2):
    IF r1.X matches r2.X AND r1.Y differs from r2.Y:
        RETURN "FD VIOLATED — pair (r1, r2) is the counter example"
RETURN "FD HOLDS on this data"
\`\`\`

| Scenario row pair | Same X? | Same Y? | Verdict |
|---|---|---|---|
| 104, 105 for (id → name) | id never duplicates | names match | holds |
| 104, 105 for (city → zip) | Pune = Pune | 411001 = 411001 | holds |
| 104, 106 for (name → zip) | Priya = Priya | 411001 ≠ 400001 | VIOLATED |

### Logical Test — Armstrong

| Target FD | Chain | Verdict |
|---|---|---|
| A → C | A → B, B → C (transitivity) | Holds |
| B → A | no rule produces B on the left | Cannot be derived |

### Code Solution — SQL

\`\`\`sql
-- Any row returned here means X -> Y is VIOLATED
SELECT city, COUNT(DISTINCT zip) AS zips
FROM STUDENT
GROUP BY city
HAVING COUNT(DISTINCT zip) > 1;
\`\`\`

### Code Solution — Python

\`\`\`python
def fd_holds(rows, lhs, rhs):
    """True if no two rows agree on lhs but differ on rhs."""
    seen = {}
    for row in rows:
        key = tuple(row[a] for a in lhs)
        value = tuple(row[a] for a in rhs)
        if key in seen and seen[key] != value:
            return False
        seen[key] = value
    return True
\`\`\``,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    codeBlocks: [
      {
        language: 'sql',
        code: `-- Any row returned here means city -> zip is VIOLATED on the data
SELECT city, COUNT(DISTINCT zip) AS zips
FROM STUDENT
GROUP BY city
HAVING COUNT(DISTINCT zip) > 1;`
      },
      {
        language: 'python',
        code: `def fd_holds(rows, lhs, rhs):
    """True when no two rows agree on lhs but differ on rhs."""
    seen = {}
    for row in rows:
        key = tuple(row[a] for a in lhs)
        value = tuple(row[a] for a in rhs)
        if key in seen and seen[key] != value:
            return False
        seen[key] = value
    return True`
      }
    ]
  },
  {
    title: 'Compute the Closure of an Attribute Set',
    slug: 'compute-closure-attribute-set',
    lessonSlug: 'functional-dependencies',
    subtopicSlug: 'closure-of-attributes',
    difficulty: 'medium',
    topics: ['Closure of Attributes'],
    companies: ['Amazon', 'Google'],
    problemStatement: 'Relation R (A, B, C, D, E) with FDs F = { A → B, A → C, B → D, D → E }. Compute the closures {A}+, {B}+, and {C}+, then answer: which single attribute is a candidate key, and does FD B → E follow from F? Show every pass of the closure algorithm.',
    examples: [
      {
        input: 'Closure of {A} with F = {A → B, A → C, B → D, D → E}',
        output: '{A}+ = {A, B, C, D, E} — every attribute; {A} is a candidate key',
        explanation: 'Pass 1 adds B and C via A → B and A → C; pass 2 adds D via B → D; pass 3 adds E via D → E; pass 4 changes nothing.'
      },
      {
        input: 'Closure of {B} with the same F',
        output: '{B}+ = {B, D, E}',
        explanation: 'B → D adds D, then D → E adds E. A and C are unreachable, so neither is determined by B.'
      },
      {
        input: 'Closure of {C} and the question B → E',
        output: '{C}+ = {C}; B → E DOES follow from F',
        explanation: 'No FD has a left side inside {C}, so the closure stays {C}. But E is in {B}+ = {B, D, E}, so B → E is provable.'
      }
    ],
    constraints: [
      'Apply FDs in any pass order, but never use an FD before its left side is fully inside the running closure',
      'Keep looping until a full pass adds nothing',
      'A candidate key must be minimal — show no subset works'
    ],
    approach: `### The Repeat-Until-Stable Algorithm

\`\`\`
def closure(attrs, fds):
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for L, R in fds:
            if L <= result and not R <= result:
                result |= R
                changed = True
    return result
\`\`\`

### Tracing {A}+

| Pass | FDs that fire | result after pass |
|---|---|---|
| start | — | {A} |
| 1 | A → B, A → C | {A, B, C} |
| 2 | B → D | {A, B, C, D} |
| 3 | D → E | {A, B, C, D, E} |
| 4 | none | stop (stable) |

### Answering the Two Questions

| Question | Test | Answer |
|---|---|---|
| Candidate key? | {A}+ = whole relation and {A} is minimal | YES — {A} is the only single-attribute key |
| Does B → E follow? | E ∈ {B}+ = {B, D, E} | YES |

A key is a set whose closure is the ENTIRE relation and whose subsets have smaller closures.

### Code Solution — SQL (reconstruct route to a target)

\`\`\`sql
-- Is E reachable from B? (illustrated as a reachability join)
SELECT 'reachable' AS answer
WHERE EXISTS (
  SELECT 1 FROM FDs f1 JOIN FDs f2 ON f1.rhs = f2.lhs
  WHERE f1.lhs = 'B' AND f2.rhs = 'E'
);
\`\`\``,
    timeComplexity: 'O(k*n)',
    spaceComplexity: 'O(n)',
    codeBlocks: [
      {
        language: 'python',
        code: `def closure(attrs, fds):
    """Repeatedly apply every FD whose left side fits, until stable."""
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            if lhs <= result and not rhs <= result:
                result |= rhs
                changed = True
    return result

fds = [({'A'}, {'B'}), ({'A'}, {'C'}), ({'B'}, {'D'}), ({'D'}, {'E'})]
print(sorted(closure({'A'}, fds)))  # ['A', 'B', 'C', 'D', 'E']
print(sorted(closure({'B'}, fds)))  # ['B', 'D', 'E']`
      }
    ]
  },
  {
    title: 'Normalize a Relation to 3NF',
    slug: 'normalize-relation-3nf',
    lessonSlug: 'normal-forms-1nf-bcnf',
    subtopicSlug: '1nf-2nf-3nf',
    difficulty: 'hard',
    topics: ['1NF, 2NF and 3NF'],
    companies: ['Amazon', 'TCS', 'Infosys'],
    problemStatement: 'ORDER_DETAILS (OrderID, OrderDate, CustomerID, CustomerName, ProductID, ProductName, Qty) with FDs: OrderID → OrderDate, CustomerID → CustomerName, ProductID → ProductName, and (OrderID, ProductID) → Qty. Walk the table through 1NF → 2NF → 3NF, list every decomposition with its key, and show the final schema with foreign keys. Also explain where each original FD lives after normalization.',
    examples: [
      {
        input: 'Start table (a few rows): (501, 2026-08-01, C1, Priya, P1, Bolt, 2), (501, 2026-08-01, C1, Priya, P2, Nut, 5), (502, 2026-08-02, C2, Ravi, P1, Bolt, 1)',
        output: '1NF check: pass (all atomic). 2NF: ProductName depends only on ProductID (part of the key) — extract PRODUCT. CustomerName depends only on CustomerID — extract CUSTOMER. 3NF: OrderDate already depends on the key OrderID alone — no transitive chain remains.',
        explanation: 'The only column fully dependent on the whole key (OrderID, ProductID) is Qty; CustomerName, OrderDate, and ProductName were hiding partial dependencies.'
      },
      {
        input: 'The final 3NF schema to produce',
        output: 'CUSTOMER (CustomerID PK, CustomerName); PRODUCT (ProductID PK, ProductName); ORDER_HDR (OrderID PK, OrderDate, CustomerID FK → CUSTOMER); ORDER_ITEM (OrderID FK, ProductID FK, Qty, PK = (OrderID, ProductID))',
        explanation: 'Each extracted table has its own key; ORDER_ITEM links products to orders and keeps the quantity.'
      },
      {
        input: 'Where does each original FD end up?',
        output: 'OrderID → OrderDate lives in ORDER_HDR; CustomerID → CustomerName in CUSTOMER; ProductID → ProductName in PRODUCT; (OrderID, ProductID) → Qty in ORDER_ITEM — every FD preserved',
        explanation: 'Normalization here is dependency-preserving: no FD needed a join across tables to be enforced.'
      }
    ],
    constraints: [
      'Decompose in order: 1NF first, then partials (2NF), then transitives (3NF)',
      'Every final table needs exactly one key (PK) and every FK must reference an existing PK',
      'Do not lose any of the four original FDs',
      'You may join the four tables to fully reconstruct the original'
    ],
    approach: `### The Normalization Checklist

1. **1NF**: every cell atomic, no repeating groups. (This table already passes.)
2. **2NF**: find non-prime columns depending on PART of the composite key.
3. **3NF**: find non-prime columns depending on another non-prime column.

### Finding Violations — Dependency Table

| FD | Left side | Is it a key? | Problem? |
|---|---|---|---|
| OrderID → OrderDate | OrderID | part of key | partial |
| CustomerID → CustomerName | CustomerID | not a key at all | partial |
| ProductID → ProductName | ProductID | part of key | partial |
| (OrderID, ProductID) → Qty | full key | fine | none — keep |

### The Split (Pseudocode)

\`\`\`
FOR each violating FD  X → Y:
    NEW table = (X, Y)  with key X
    REMOVE Y from the original table (keep X as a foreign key)
\`\`\`

| Step | Table | Key |
|---|---|---|
| out | CUSTOMER (CustomerID, CustomerName) | CustomerID |
| out | PRODUCT (ProductID, ProductName) | ProductID |
| out | ORDER_HDR (OrderID, OrderDate, CustomerID) | OrderID |
| kept | ORDER_ITEM (OrderID, ProductID, Qty) | (OrderID, ProductID) |

### Code Solution — Final 3NF Schema (SQL DDL)

\`\`\`sql
CREATE TABLE CUSTOMER (
  CustomerID   VARCHAR(10) PRIMARY KEY,
  CustomerName VARCHAR(50) NOT NULL
);

CREATE TABLE PRODUCT (
  ProductID   VARCHAR(10) PRIMARY KEY,
  ProductName VARCHAR(50) NOT NULL
);

CREATE TABLE ORDER_HDR (
  OrderID     VARCHAR(10) PRIMARY KEY,
  OrderDate   DATE NOT NULL,
  CustomerID  VARCHAR(10) NOT NULL REFERENCES CUSTOMER(CustomerID)
);

CREATE TABLE ORDER_ITEM (
  OrderID    VARCHAR(10) NOT NULL REFERENCES ORDER_HDR(OrderID),
  ProductID  VARCHAR(10) NOT NULL REFERENCES PRODUCT(ProductID),
  Qty        INT NOT NULL,
  PRIMARY KEY (OrderID, ProductID)
);
\`\`\``,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    codeBlocks: [
      {
        language: 'sql',
        code: `CREATE TABLE CUSTOMER (
  CustomerID   VARCHAR(10) PRIMARY KEY,
  CustomerName VARCHAR(50) NOT NULL
);

CREATE TABLE PRODUCT (
  ProductID   VARCHAR(10) PRIMARY KEY,
  ProductName VARCHAR(50) NOT NULL
);

CREATE TABLE ORDER_HDR (
  OrderID     VARCHAR(10) PRIMARY KEY,
  OrderDate   DATE NOT NULL,
  CustomerID  VARCHAR(10) NOT NULL REFERENCES CUSTOMER(CustomerID)
);

CREATE TABLE ORDER_ITEM (
  OrderID    VARCHAR(10) NOT NULL REFERENCES ORDER_HDR(OrderID),
  ProductID  VARCHAR(10) NOT NULL REFERENCES PRODUCT(ProductID),
  Qty        INT NOT NULL,
  PRIMARY KEY (OrderID, ProductID)
);`
      }
    ]
  },
  {
    title: 'Determine if a Relation is in BCNF',
    slug: 'determine-relation-bcnf',
    lessonSlug: 'normal-forms-1nf-bcnf',
    subtopicSlug: 'bcnf',
    difficulty: 'hard',
    topics: ['BCNF'],
    companies: ['Microsoft', 'Flipkart'],
    problemStatement: 'For each relation and FD family below, state whether the relation is in BCNF. If not, decompose it using the violating FD so every resulting table is in BCNF, and prove losslessness (a shared key exists between tables). Case 1: R (A, B, C) with AB → C and C → B. Case 2: CourseAlloc (Student, Course, Instructor) with (Student, Course) → Instructor and Instructor → Course. Case 3: EMP (EmpID, DeptID, Role) with EmpID → DeptID and EmpID → Role.',
    examples: [
      {
        input: 'Case 1: R (A, B, C), F = {AB → C, C → B}; also compute the keys first',
        output: 'NOT BCNF. Keys: {AB} and {AC} (both close to ABC). Violation: C → B where {C} is not a superkey. Decompose into BC (B, C) and AC (A, C).',
        explanation: 'closure(C) = {C, B}, not all of ABC, so C → B violates BCNF. Splitting on C → B gives T1 (B, C) with key {C} and T2 (A, C) with key {A, C}; both are BCNF, but AB → C is lost — it cannot be enforced by any single table, the classic BCNF trade-off (dependency preservation is sacrificed).'
      },
      {
        input: 'Case 2: CourseAlloc (Student, Course, Instructor), F = {(Student, Course) → Instructor, Instructor → Course}',
        output: 'NOT BCNF. Key = {Student, Course}. Instructor → Course violates it. Decompose into (Instructor, Course) and (Student, Instructor); join on Instructor recovers everything.',
        explanation: 'Closure(Instructor) = {Instructor, Course} — not the whole table, so it violates BCNF. Both pieces are BCNF and the shared Instructor column makes the decomposition lossless.'
      },
      {
        input: 'Case 3: EMP (EmpID, DeptID, Role), F = {EmpID → DeptID, EmpID → Role}',
        output: 'BCNF. Key = {EmpID}; every FD left side is the superkey {EmpID}.',
        explanation: 'Both FDs have EmpID, whose closure is every attribute, on the left — the BCNF test passes without any splitting.'
      }
    ],
    constraints: [
      'Always compute candidate keys BEFORE judging BCNF',
      'A non-trivial FD with a left side that is not a superkey is an automatic violation',
      'When decomposing, table 1 = X ∪ Y and table 2 = (all attributes − Y) ∪ X',
      'Show the shared column that makes the join lossless'
    ],
    approach: `### BCNF Test (Pseudocode)

\`\`\`
def is_bcnf(attrs, fds):
    all_attrs = set(attrs)
    for lhs, rhs in fds:
        if not set(rhs) <= set(lhs):          # non-trivial?
            if closure(lhs, fds) != all_attrs:  # left side not a superkey?
                return False, (lhs, rhs)        # name the violator
    return True, None

def decompose(attrs, fds, X, Y):
    t1 = X | Y                    # first table: the FD lives here
    t2 = (attrs - Y) | X          # second table: keep X as its key
    return t1, t2
\`\`\`

### Closing Every Left Side — Case 1

| FD | closure(lhs) | Whole relation? | Verdict |
|---|---|---|---|
| AB → C | {A, B, C} | yes | fine |
| C → B | {C, B} | NO | VIOLATOR |

Decomposition on C → B:
| Table | Columns | Key |
|---|---|---|
| T1 | B, C | {C} (C → B so {C} closes to BC; {B} alone closes only to {B}) |
| T2 | A, C | {A, C} |

Split tables share column C; joining T1 ⨝ T2 on C reproduces every original row exactly — lossless.

### Final Check Table for All Cases

| Case | Keys | Violator FD | BCNF? | Split |
|---|---|---|---|---|
| 1 | {AB}, {AC} | C → B | no | (B, C), (A, C) |
| 2 | {Student, Course} | Instructor → Course | no | (Instructor, Course), (Student, Instructor) |
| 3 | {EmpID} | none | YES | none needed |

### Code Solution — SQL DDL for Case 2 fix

\`\`\`sql
CREATE TABLE INSTRUCTOR_COURSE (
  Instructor VARCHAR(50) PRIMARY KEY,
  Course     VARCHAR(50) NOT NULL
);

CREATE TABLE STUDENT_INSTRUCTOR (
  Student     VARCHAR(50),
  Instructor  VARCHAR(50) REFERENCES INSTRUCTOR_COURSE(Instructor),
  PRIMARY KEY (Student, Instructor)
);

-- Original query reproduced from the two BCNF tables
SELECT si.Student, ic.Course, si.Instructor
FROM STUDENT_INSTRUCTOR si
JOIN INSTRUCTOR_COURSE ic ON ic.Instructor = si.Instructor;
\`\`\``,
    timeComplexity: 'O(|F|*closure)',
    spaceComplexity: 'O(n)',
    codeBlocks: [
      {
        language: 'sql',
        code: `CREATE TABLE INSTRUCTOR_COURSE (
  Instructor VARCHAR(50) PRIMARY KEY,
  Course     VARCHAR(50) NOT NULL
);

CREATE TABLE STUDENT_INSTRUCTOR (
  Student     VARCHAR(50),
  Instructor  VARCHAR(50) REFERENCES INSTRUCTOR_COURSE(Instructor),
  PRIMARY KEY (Student, Instructor)
);

-- Original data recovered from the two BCNF tables
SELECT si.Student, ic.Course, si.Instructor
FROM STUDENT_INSTRUCTOR si
JOIN INSTRUCTOR_COURSE ic ON ic.Instructor = si.Instructor;`
      },
      {
        language: 'python',
        code: `def bcnf_check(attrs, fds):
    """Returns (ok, violating_fd). Left side must close to everything."""
    all_attrs = set(attrs)
    for lhs, rhs in fds:
        if not set(rhs) <= set(lhs) and closure(lhs, fds) != all_attrs:
            return False, (lhs, rhs)
    return True, None

# Case 1: R(A,B,C) with AB->C and C->B
attrs = {'A', 'B', 'C'}
fds = [({'A', 'B'}, {'C'}), ({'C'}, {'B'})]
ok, violator = bcnf_check(attrs, fds)
print(ok, violator)  # False ({'C'}, {'B'}) -> split on C->B`
      }
    ]
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
  ,
  {
    "problemSlug": "identify-entities-attributes-relationships",
    "questions": [
      {
        "text": "\"A book has a title, an ISBN and a price.\" What is the book in an ER diagram?",
        "options": [
          "An attribute",
          "An entity",
          "A relationship",
          "A weak entity"
        ],
        "correctIndex": 1
      },
      {
        "text": "A student's address splits into street, city and pincode. Which attribute type is it?",
        "options": [
          "Simple",
          "Multi-valued",
          "Composite",
          "Derived"
        ],
        "correctIndex": 2
      },
      {
        "text": "A member can have up to three phone numbers. How should this be stored?",
        "options": [
          "One column with comma-separated numbers",
          "Three fixed columns phone1, phone2, phone3",
          "A separate PHONE table linked back to the member",
          "A derived attribute calculated on read"
        ],
        "correctIndex": 2
      },
      {
        "text": "Age is computed from DateOfBirth. What attribute type is it?",
        "options": [
          "Simple",
          "Composite",
          "Multi-valued",
          "Derived"
        ],
        "correctIndex": 3
      },
      {
        "text": "A borrow record's date belongs to which element?",
        "options": [
          "The book entity",
          "The member entity",
          "The BORROWS relationship",
          "Nothing — dates are never stored"
        ],
        "correctIndex": 2
      },
      {
        "text": "\"A member borrows many books; a book is borrowed by many members.\" What is the cardinality?",
        "options": [
          "1:1",
          "1:N",
          "M:N",
          "N:1"
        ],
        "correctIndex": 2
      },
      {
        "text": "In a unary relationship, how many entities participate?",
        "options": [
          "Zero",
          "One (the entity relates to itself)",
          "Two different entities",
          "Three or more"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which diagram shape represents a relationship?",
        "options": [
          "Rectangle",
          "Oval",
          "Diamond",
          "Circle"
        ],
        "correctIndex": 2
      }
    ]
  }
  ,
  {
    "problemSlug": "determine-cardinality-relationship",
    "questions": [
      {
        "text": "\"Every employee MUST be assigned to exactly one department. A department can have 0–100 employees.\" Which is correct?",
        "options": [
          "1:N, employee side total",
          "1:1, both sides total",
          "M:N, both sides partial",
          "1:N, both sides partial"
        ],
        "correctIndex": 0
      },
      {
        "text": "\"Each person holds at most one passport; each passport belongs to exactly one person.\" The ratio is:",
        "options": [
          "1:N",
          "1:1",
          "M:N",
          "N:1"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"At most one\" in a sentence means the participation is:",
        "options": [
          "Total — every row must participate",
          "Partial — zero links are allowed",
          "Impossible to tell",
          "Always 1:1"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Must\", \"exactly one\", and \"at least 1\" typically signal:",
        "options": [
          "Partial participation",
          "Total participation",
          "A weak entity",
          "A 1:1 ratio guaranteed"
        ],
        "correctIndex": 1
      },
      {
        "text": "A student enrolls in 1–8 courses; a course has 5–200 students. Which is correct?",
        "options": [
          "1:N, student side total",
          "M:N, both sides total",
          "1:1, both sides partial",
          "M:N, both sides partial"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"An employee manages other employees.\" This relationship is:",
        "options": [
          "Binary",
          "Ternary",
          "Unary",
          "None — managers are separate entities"
        ],
        "correctIndex": 2
      },
      {
        "text": "An M:N relationship must eventually be implemented as:",
        "options": [
          "A foreign key on either side",
          "A shared primary key",
          "A link (junction) table holding both keys",
          "One merged table"
        ],
        "correctIndex": 2
      },
      {
        "text": "For a 1:N relationship, where does the foreign key go?",
        "options": [
          "On the one side",
          "On the N side",
          "In a junction table",
          "Both sides"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "convert-er-diagram-specialization",
    "questions": [
      {
        "text": "Which mapping option merges all subtype attributes into one table with NULLs?",
        "options": [
          "Option A — one merged table",
          "Option B — one table per subclass",
          "Option C — superclass + subclass tables",
          "None — merging is never allowed"
        ],
        "correctIndex": 0
      },
      {
        "text": "An OVERLAPPING hierarchy can only be mapped with:",
        "options": [
          "Option A (merged)",
          "Option B (per-subclass tables)",
          "Option C (superclass + subclass tables, shared key)",
          "A single table with a type column"
        ],
        "correctIndex": 2
      },
      {
        "text": "Subclasses always inherit their key from:",
        "options": [
          "A brand new surrogate key",
          "The superclass primary key",
          "The partial key",
          "A foreign key to an unrelated table"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"VEHICLE → CAR XOR TRUCK\" describes which constraint?",
        "options": [
          "Overlapping-total",
          "Disjoint-total",
          "Disjoint-partial",
          "Overlapping-partial"
        ],
        "correctIndex": 1
      },
      {
        "text": "Generalization works in which direction?",
        "options": [
          "Top-down",
          "Bottom-up",
          "Left to right",
          "It has no direction"
        ],
        "correctIndex": 1
      },
      {
        "text": "Aggregation is used when:",
        "options": [
          "An entity has too many attributes",
          "A relationship itself must participate in another relationship",
          "Two entities are identical",
          "A weak entity needs an owner"
        ],
        "correctIndex": 1
      },
      {
        "text": "In a PARTIAL specialization, some rows:",
        "options": [
          "Must join every subclass",
          "Live only in the superclass",
          "Are deleted automatically",
          "Become weak entities"
        ],
        "correctIndex": 1
      },
      {
        "text": "An employee who is paid a salary AND billed hourly belongs to:",
        "options": [
          "One subclass only",
          "Both subclass tables in Option C",
          "The merged table with type = single value",
          "No table at all"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "identify-weak-entity-discriminator",
    "questions": [
      {
        "text": "Bed numbers restart at 1 in every ward. The composite primary key of BED is:",
        "options": [
          "(bedNo)",
          "(wardID)",
          "(wardID, bedNo)",
          "(wardID, bedNo, hospital)"
        ],
        "correctIndex": 2
      },
      {
        "text": "The partial key (discriminator) of LINE_ITEM is:",
        "options": [
          "orderID",
          "itemNo",
          "(orderID, itemNo)",
          "product"
        ],
        "correctIndex": 1
      },
      {
        "text": "A parcel with a globally unique tracking number is:",
        "options": [
          "Weak — it needs a customer",
          "Strong — it is identifiable on its own",
          "Weak — it cannot exist alone",
          "Neither — parcels are not entities"
        ],
        "correctIndex": 1
      },
      {
        "text": "The identifying relationship is drawn with:",
        "options": [
          "A single diamond",
          "A double diamond",
          "A rectangle",
          "A circle"
        ],
        "correctIndex": 1
      },
      {
        "text": "A weak entity in the diagram is drawn with:",
        "options": [
          "A single rectangle",
          "A double rectangle",
          "An oval",
          "A double oval"
        ],
        "correctIndex": 1
      },
      {
        "text": "Deleting the owner of a weak entity should:",
        "options": [
          "Keep the weak rows as orphans",
          "Cascade-delete the weak rows too",
          "Move weak rows to a new owner",
          "Block the owner's deletion"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Numbered 1, 2, 3... inside each order\" signals:",
        "options": [
          "A strong entity with its own key",
          "A partial key → weak entity",
          "A derived attribute",
          "A 1:1 relationship"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which is NOT a weak entity?",
        "options": [
          "DEPENDENT of EMPLOYEE",
          "LINE_ITEM of ORDER",
          "ROOM of HOTEL",
          "Aadhaar record of a person"
        ],
        "correctIndex": 3
      }
    ]
  }
  ,
  {
    "problemSlug": "convert-er-diagram-relational-schema",
    "questions": [
      {
        "text": "An M:N relationship in the ER diagram becomes what in the relational schema?",
        "options": [
          "A foreign key on either side",
          "A junction table with a composite primary key",
          "A merged table",
          "A UNIQUE constraint"
        ],
        "correctIndex": 1
      },
      {
        "text": "For the 1:N link DEPARTMENT employs EMPLOYEE, where does the FK live?",
        "options": [
          "In DEPARTMENT",
          "In EMPLOYEE",
          "In a junction table",
          "In both tables"
        ],
        "correctIndex": 1
      },
      {
        "text": "A weak entity maps to a table whose primary key is:",
        "options": [
          "Its own surrogate ID",
          "Owner's PK + partial key",
          "Only the partial key",
          "The owner's PK alone"
        ],
        "correctIndex": 1
      },
      {
        "text": "A multi-valued attribute (e.g. photos) becomes:",
        "options": [
          "One comma-separated column",
          "Its own table with the owner's key in its PK",
          "A derived attribute",
          "A second column in the entity table"
        ],
        "correctIndex": 1
      },
      {
        "text": "In the university example, which of these is the junction table?",
        "options": [
          "DEPARTMENT",
          "TEACHES",
          "SUBJECT",
          "PROFESSOR"
        ],
        "correctIndex": 1
      },
      {
        "text": "If every subject must be offered by a department, the column is:",
        "options": [
          "Nullable",
          "NOT NULL",
          "UNIQUE",
          "DEFAULT 0"
        ],
        "correctIndex": 1
      },
      {
        "text": "What does UNIQUE do on a 1:1 foreign key?",
        "options": [
          "Forces every row to have the FK value",
          "Forces assignments to keep nulls",
          "Stops two rows pointing at the same row",
          "Auto-increments the key"
        ],
        "correctIndex": 2
      },
      {
        "text": "The correct order of the mapping rules is:",
        "options": [
          "Strong entities → weak entities → relationships → multi-valued",
          "Relationships → entities → attributes",
          "Junction tables first, then keys",
          "Any order works"
        ],
        "correctIndex": 0
      }
    ]
  }
  ,
  {
    "problemSlug": "represent-cardinality-constraints-schema",
    "questions": [
      {
        "text": "Total participation on the N side maps to which keyword?",
        "options": [
          "UNIQUE",
          "NOT NULL",
          "DEFAULT",
          "CHECK"
        ],
        "correctIndex": 1
      },
      {
        "text": "A 1:1 relationship needs which extra constraint on the FK?",
        "options": [
          "NOT NULL",
          "ON DELETE CASCADE",
          "UNIQUE",
          "PRIMARY KEY"
        ],
        "correctIndex": 2
      },
      {
        "text": "\"If a manager leaves, the department keeps existing and the manager field becomes empty\" maps to:",
        "options": [
          "ON DELETE CASCADE",
          "ON DELETE SET NULL",
          "ON DELETE RESTRICT",
          "NOT NULL"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which combination is a contradiction?",
        "options": [
          "UNIQUE + partial participation",
          "NOT NULL + ON DELETE SET NULL",
          "PRIMARY KEY + UNIQUE",
          "CASCADE + junction table"
        ],
        "correctIndex": 1
      },
      {
        "text": "For M:N enrollments, \"both a student and a course are required\" means:",
        "options": [
          "Both FKs nullable",
          "Both FKs NOT NULL",
          "One FK NOT NULL",
          "A CHECK on the composite key"
        ],
        "correctIndex": 1
      },
      {
        "text": "Deleting a customer with CASCADE removes their:",
        "options": [
          "Only the customer row",
          "Orders too",
          "Nothing — deletes are blocked",
          "Only the newest order"
        ],
        "correctIndex": 1
      },
      {
        "text": "RESTRICT (NO ACTION) should be used when:",
        "options": [
          "Records are transient and expendable",
          "History must never be silently destroyed",
          "The FK is nullable",
          "The relationship is unary"
        ],
        "correctIndex": 1
      },
      {
        "text": "Partial participation on the FK's side produces a column that:",
        "options": [
          "Is NOT NULL",
          "Is nullable",
          "Is UNIQUE",
          "Has a DEFAULT"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "identify-all-candidate-keys",
    "questions": [
      {
        "text": "R(A, B, C, D) with A → B, B → C, C → D. Which is the candidate key?",
        "options": [
          "{B}",
          "{A}",
          "{C}",
          "{D}"
        ],
        "correctIndex": 1
      },
      {
        "text": "What is the closure of {B} given A → B, B → C, C → D?",
        "options": [
          "{B}",
          "{B, C}",
          "{B, C, D}",
          "{A, B, C, D}"
        ],
        "correctIndex": 2
      },
      {
        "text": "A candidate key must pass which two tests?",
        "options": [
          "Uniqueness and minimality",
          "Size and speed",
          "NOT NULL and DEFAULT",
          "Indexing and sorting"
        ],
        "correctIndex": 0
      },
      {
        "text": "R(A, B, C, D) with AB → C, C → D, D → A. The candidate keys are:",
        "options": [
          "{A} only",
          "{AB} and {BC}",
          "{AB} only",
          "{ABC}"
        ],
        "correctIndex": 1
      },
      {
        "text": "{ABC} covers all attributes, but {AB} already does. {ABC} is a:",
        "options": [
          "Candidate key",
          "Super key only",
          "Foreign key",
          "Alternate key"
        ],
        "correctIndex": 1
      },
      {
        "text": "R(EMP_ID, PAN, NAME, DEPT), EMP_ID → NAME, PAN → NAME, NAME → DEPT. The candidate keys are:",
        "options": [
          "{EMP_ID} and {NAME}",
          "{EMP_ID} and {PAN}",
          "{NAME} and {DEPT}",
          "{EMP_ID}, {PAN} and {NAME}"
        ],
        "correctIndex": 1
      },
      {
        "text": "An attribute that only ever appears on the RIGHT side of FDs:",
        "options": [
          "Is always a candidate key",
          "Can never be part of any key",
          "May still join a composite key",
          "Must become the primary key"
        ],
        "correctIndex": 2
      },
      {
        "text": "The closure algorithm terminates when:",
        "options": [
          "One pass completes",
          "A full pass adds no new attributes",
          "All FDs are used once",
          "The key set reaches 3 columns"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-relational-algebra-expression",
    "questions": [
      {
        "text": "\"Names of employees earning more than 50,000\" maps to:",
        "options": [
          "π_ENAME( σ_SALARY > 50000 (EMPLOYEE) )",
          "σ_ENAME > 50000 (EMPLOYEE)",
          "π_SALARY( σ_ENAME (EMPLOYEE) )",
          "EMPLOYEE − SALARY"
        ],
        "correctIndex": 0
      },
      {
        "text": "σ (sigma) operates on:",
        "options": [
          "Columns",
          "Rows",
          "Tables",
          "Keys"
        ],
        "correctIndex": 1
      },
      {
        "text": "π (pi) operates on:",
        "options": [
          "Columns",
          "Rows",
          "Records",
          "Constraints"
        ],
        "correctIndex": 0
      },
      {
        "text": "In pure relational algebra, π removes:",
        "options": [
          "NULL values",
          "Duplicate rows",
          "Foreign keys",
          "Ordered output"
        ],
        "correctIndex": 1
      },
      {
        "text": "The filter \"DNAME = 'Research'\" cannot be applied directly to EMPLOYEE because:",
        "options": [
          "Employees never work in departments",
          "DNAME lives in DEPARTMENT — join it first",
          "WHERE clauses are illegal in algebra",
          "σ only works on single-column tables"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Employees NOT in the Sales department\" is expressed with:",
        "options": [
          "σ_SALES(EMPLOYEE)",
          "π_EID(EMPLOYEE) − π_EID(Sales employees)",
          "EMPLOYEE ∪ Sales",
          "ρ (EMPLOYEE)"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which operator pairs rows from two tables on a condition?",
        "options": [
          "×",
          "⋈",
          "ρ",
          "σ"
        ],
        "correctIndex": 1
      },
      {
        "text": "An algebraic expression is executed:",
        "options": [
          "Left to right",
          "Right to left",
          "Inside-out — the innermost table first",
          "All at once"
        ],
        "correctIndex": 2
      }
    ]
  }
  ,
  {
    "problemSlug": "apply-union-intersect-minus",
    "questions": [
      {
        "text": "R: {(1,A), (2,B), (3,C)}   S: {(2,B), (3,C), (4,D)}.  R − S is:",
        "options": [
          "{(2,B), (3,C)}",
          "{(1,A)}",
          "{(4,D)}",
          "{(1,A), (2,B), (3,C), (4,D)}"
        ],
        "correctIndex": 1
      },
      {
        "text": "R ∩ S for the same relations is:",
        "options": [
          "{(1,A)}",
          "{(4,D)}",
          "{(2,B), (3,C)}",
          "{}"
        ],
        "correctIndex": 2
      },
      {
        "text": "R: {(x,1), (x,1)} (duplicate row). As a relation, R contains:",
        "options": [
          "Two rows — duplicates are kept",
          "One row — relations are sets",
          "Zero rows — x is invalid",
          "As many rows as memory allows"
        ],
        "correctIndex": 1
      },
      {
        "text": "Union of two relations is legal only if:",
        "options": [
          "Both tables have equal row counts",
          "Same degree and matching column domains",
          "They share a primary key",
          "Both tables are empty"
        ],
        "correctIndex": 1
      },
      {
        "text": "R ∪ S contains rows that are:",
        "options": [
          "In R only",
          "In both R and S",
          "In R or S (deduplicated)",
          "In neither R nor S"
        ],
        "correctIndex": 2
      },
      {
        "text": "Why is R − S ≠ S − R in general?",
        "options": [
          "Because − is not commutative — direction matters",
          "Because sets are unordered",
          "Because deductions are always equal",
          "It is always equal, actually"
        ],
        "correctIndex": 0
      },
      {
        "text": "Set difference is best described as:",
        "options": [
          "Rows in A not present in B",
          "Rows in both A and B",
          "All rows of A and B",
          "Rows sorted alphabetically"
        ],
        "correctIndex": 0
      },
      {
        "text": "R: Cricket {101, 102, 103}, S: Drama {102, 104}. Students in Cricket but NOT Drama:",
        "options": [
          "{101, 102, 103}",
          "{101, 103}",
          "{102}",
          "{104}"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "compute-natural-join-result",
    "questions": [
      {
        "text": "STUDENT(1, Aarav, CS) and ENROLLED(1, A, 101), (1, B, 102). How many natural-join rows does Aarav produce?",
        "options": [
          "One",
          "Two — one per enrollment",
          "Three",
          "Zero"
        ],
        "correctIndex": 1
      },
      {
        "text": "A student with NO enrollment row, under an inner natural join:",
        "options": [
          "Appears with NULL grade",
          "Is dropped from the result",
          "Causes a runtime error",
          "Appears with grade = 0"
        ],
        "correctIndex": 1
      },
      {
        "text": "When two relations share NO column name, natural join equals:",
        "options": [
          "An empty set",
          "The cartesian product",
          "A left join",
          "The intersection"
        ],
        "correctIndex": 1
      },
      {
        "text": "The shared column in a natural join result appears:",
        "options": [
          "Twice — once per table",
          "Once",
          "Zero times",
          "Only if renamed"
        ],
        "correctIndex": 1
      },
      {
        "text": "A(1,p), B(p,10) and B(p,20). How many result rows does A ⋈ B produce for the (1,p) row?",
        "options": [
          "One",
          "Two",
          "Three",
          "Four"
        ],
        "correctIndex": 1
      },
      {
        "text": "θ-join pairs rows when:",
        "options": [
          "A general condition like A.x < B.y holds",
          "Columns always share names",
          "Keys match automatically",
          "Rows appear twice"
        ],
        "correctIndex": 0
      },
      {
        "text": "Equi-join vs natural join difference:",
        "options": [
          "Equi-join keeps both join columns",
          "Natural join keeps both join columns",
          "They are identical in every way",
          "Equi-join drops all columns"
        ],
        "correctIndex": 0
      },
      {
        "text": "Which join keeps unmatched left rows padded with NULLs?",
        "options": [
          "Inner natural join",
          "Left outer join",
          "Equi-join",
          "Theta join"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-create-table-constraints",
    "questions": [
      {
        "text": "Which constraint makes a column both NOT NULL and unique?",
        "options": [
          "FOREIGN KEY",
          "PRIMARY KEY",
          "CHECK",
          "DEFAULT"
        ],
        "correctIndex": 1
      },
      {
        "text": "Money columns should use which type?",
        "options": [
          "FLOAT",
          "DOUBLE",
          "DECIMAL",
          "VARCHAR"
        ],
        "correctIndex": 2
      },
      {
        "text": "DROP TABLE removes:",
        "options": [
          "Only the data",
          "Only the structure",
          "Structure + data + indexes",
          "Only the indexes"
        ],
        "correctIndex": 2
      },
      {
        "text": "Which statement empties a table but keeps its structure?",
        "options": [
          "DROP TABLE",
          "TRUNCATE TABLE",
          "DELETE COLUMN",
          "REMOVE TABLE"
        ],
        "correctIndex": 1
      },
      {
        "text": "CHECK (salary > 0) rejects:",
        "options": [
          "Only negative salaries",
          "Zero and negative salaries",
          "Salaries above 100000",
          "NULL salaries"
        ],
        "correctIndex": 1
      },
      {
        "text": "The referenced table must exist BEFORE:",
        "options": [
          "Creating the child table with its FK",
          "Running any SELECT",
          "Dropping the parent",
          "Adding a DEFAULT"
        ],
        "correctIndex": 0
      },
      {
        "text": "ALTER TABLE Employee ADD COLUMN email VARCHAR(100); does what?",
        "options": [
          "Deletes the email data",
          "Adds a new column to the table",
          "Renames the table",
          "Empties the table"
        ],
        "correctIndex": 1
      },
      {
        "text": "CREATE TABLE with a PRIMARY KEY implicitly also enforces:",
        "options": [
          "CHECK and DEFAULT",
          "NOT NULL and UNIQUE",
          "CASCADE and RESTRICT",
          "Only UNIQUE"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-dml-statements-scenario",
    "questions": [
      {
        "text": "UPDATE without a WHERE clause changes:",
        "options": [
          "One random row",
          "Every row",
          "Zero rows",
          "Only the newest row"
        ],
        "correctIndex": 1
      },
      {
        "text": "The golden rule of UPDATE is:",
        "options": [
          "Write the SET first, then the WHERE",
          "Write the WHERE first, then the SET",
          "Never use WHERE in UPDATE",
          "Always update all rows"
        ],
        "correctIndex": 1
      },
      {
        "text": "INSERT with a column list is safer because:",
        "options": [
          "It runs faster",
          "Column order is free and defaults fill gaps",
          "It bypasses constraints",
          "It is shorter"
        ],
        "correctIndex": 1
      },
      {
        "text": "ON DELETE CASCADE means deleting the parent row:",
        "options": [
          "Fails with an error",
          "Also deletes the referencing children",
          "Leaves the children as orphans",
          "Sets the children FK to NULL"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which can usually be rolled back inside a transaction?",
        "options": [
          "TRUNCATE TABLE",
          "DELETE FROM ... WHERE",
          "DROP TABLE",
          "ALTER TABLE"
        ],
        "correctIndex": 1
      },
      {
        "text": "INSERT INTO OldEmployees SELECT ... FROM Employees is used to:",
        "options": [
          "Copy rows from one table to another",
          "Delete old employees",
          "Rename a table",
          "Create a new database"
        ],
        "correctIndex": 0
      },
      {
        "text": "DELETE FROM Employee; (no WHERE) empties the table — what survives?",
        "options": [
          "Nothing — the table is gone",
          "The table structure",
          "The row data only",
          "The indexes"
        ],
        "correctIndex": 1
      },
      {
        "text": "Multi-row risky DML should be wrapped in:",
        "options": [
          "A subquery",
          "A transaction (BEGIN/COMMIT/ROLLBACK)",
          "A CHECK constraint",
          "A UNION"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-filtered-sorted-query",
    "questions": [
      {
        "text": "\"IT employees earning more than 50,000\" — both conditions go in:",
        "options": [
          "HAVING",
          "WHERE with AND",
          "ORDER BY",
          "LIMIT"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Best salary first\" maps to:",
        "options": [
          "ORDER BY salary",
          "ORDER BY salary DESC",
          "WHERE salary = MAX(salary)",
          "LIMIT salary"
        ],
        "correctIndex": 1
      },
      {
        "text": "To check for missing hire dates:",
        "options": [
          "WHERE hireDate = NULL",
          "WHERE hireDate IS NULL",
          "WHERE hireDate = ''",
          "WHERE hireDate = 0"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Three newest hires\" requires which order of clauses?",
        "options": [
          "LIMIT 3 then ORDER BY",
          "ORDER BY hireDate DESC then LIMIT 3",
          "LIMIT 3 only",
          "DISTINCT then LIMIT"
        ],
        "correctIndex": 1
      },
      {
        "text": "SELECT DISTINCT dept removes:",
        "options": [
          "All rows",
          "Repeated dept values",
          "NULL departments only",
          "The first row"
        ],
        "correctIndex": 1
      },
      {
        "text": "In the execution pipeline, WHERE runs:",
        "options": [
          "After ORDER BY",
          "Before SELECT computes columns",
          "After LIMIT",
          "It never runs"
        ],
        "correctIndex": 1
      },
      {
        "text": "The practical execution order of SELECT clauses is:",
        "options": [
          "SELECT → FROM → WHERE → ORDER BY",
          "FROM → WHERE → SELECT → ORDER BY → LIMIT",
          "ORDER BY → WHERE → FROM → SELECT",
          "LIMIT → FROM → SELECT → WHERE"
        ],
        "correctIndex": 1
      },
      {
        "text": "The query asked for 'names and salaries' but nothing else. SELECT * would be:",
        "options": [
          "Correct — more data is better",
          "Wrong — the question named two columns",
          "Correct — DISTINCT handles it",
          "An error in every database"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-query-group-by-having",
    "questions": [
      {
        "text": "\"Total sales PER REGION\" — the GROUP BY column is:",
        "options": [
          "amount",
          "region",
          "id",
          "None — GROUP BY is optional"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Regions whose AVERAGE sale is above 150\" — the filter goes in:",
        "options": [
          "WHERE",
          "HAVING",
          "ORDER BY",
          "LIMIT"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which query is illegal?",
        "options": [
          "SELECT region, SUM(amount) FROM Sales GROUP BY region",
          "SELECT region, product, SUM(amount) FROM Sales GROUP BY region",
          "SELECT region, COUNT(*) FROM Sales GROUP BY region",
          "SELECT region, AVG(amount) AS a FROM Sales GROUP BY region"
        ],
        "correctIndex": 1
      },
      {
        "text": "North sales: 100, 50, 300. AVG(amount) for North = ?",
        "options": [
          "150",
          "450",
          "100",
          "50"
        ],
        "correctIndex": 0
      },
      {
        "text": "AVG over (10, NULL, 20) equals:",
        "options": [
          "10",
          "15",
          "30",
          "NULL"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Filter out individual sales below 50 BEFORE grouping\" maps to:",
        "options": [
          "HAVING amount >= 50",
          "WHERE amount >= 50",
          "ORDER BY amount DESC",
          "DISTINCT amount"
        ],
        "correctIndex": 1
      },
      {
        "text": "COUNT(*) vs COUNT(col):",
        "options": [
          "Identical in every case",
          "COUNT(*) counts all rows; COUNT(col) counts non-NULL values",
          "COUNT(col) is faster always",
          "COUNT(*) ignores NULL rows"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Groups with more than 2 sales\" is:",
        "options": [
          "A row filter → WHERE",
          "A group filter → HAVING COUNT(*) > 2",
          "A sort condition",
          "A LIMIT clause"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-query-outer-join",
    "questions": [
      {
        "text": "\"Every customer, with their orders if any\" — which join?",
        "options": [
          "INNER JOIN",
          "LEFT JOIN",
          "CROSS JOIN",
          "A join is not needed"
        ],
        "correctIndex": 1
      },
      {
        "text": "Meera has no orders. LEFT JOIN gives her row:",
        "options": [
          "Dropped entirely",
          "Kept, order columns NULL",
          "Kept with amount 0 in the order table",
          "Duplicated"
        ],
        "correctIndex": 1
      },
      {
        "text": "SUM(o.amount) over a zero-order customer returns:",
        "options": [
          "0",
          "NULL",
          "An error",
          "The customer's name"
        ],
        "correctIndex": 1
      },
      {
        "text": "COALESCE(SUM(o.amount), 0) turns the NULL total into:",
        "options": [
          "0",
          "NULL",
          "An empty string",
          "A minus sign"
        ],
        "correctIndex": 0
      },
      {
        "text": "\"Customers who never ordered\" uses LEFT JOIN + WHERE:",
        "options": [
          "o.orderID IS NULL",
          "o.orderID = 0",
          "o.amount > 0",
          "c.customerID IS NULL"
        ],
        "correctIndex": 0
      },
      {
        "text": "In \"every order, even with missing customer\", which table comes first?",
        "options": [
          "Customers",
          "Orders",
          "Neither — order never matters",
          "A junction table"
        ],
        "correctIndex": 1
      },
      {
        "text": "INNER JOIN with unmatched rows:",
        "options": [
          "Keeps them with NULLs",
          "Drops them",
          "Keeps them with zeros",
          "Returns an error"
        ],
        "correctIndex": 1
      },
      {
        "text": "A JOIN clause without ON produces:",
        "options": [
          "An INNER JOIN",
          "A cartesian product",
          "A LEFT JOIN",
          "A syntax error in all engines"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-self-join-query",
    "questions": [
      {
        "text": "A self join requires:",
        "options": [
          "Two different tables",
          "Aliases for the two copies",
          "A third table",
          "A CROSS JOIN keyword"
        ],
        "correctIndex": 1
      },
      {
        "text": "Worker-to-manager self join links:",
        "options": [
          "w.empID = m.empID",
          "w.managerID = m.empID",
          "w.managerID = m.managerID",
          "w.name = m.name"
        ],
        "correctIndex": 1
      },
      {
        "text": "\"Each employee with their manager\" must keep the CEO (no manager) — use:",
        "options": [
          "INNER JOIN",
          "LEFT JOIN",
          "CROSS JOIN",
          "RIGHT OUTER on the wrong table"
        ],
        "correctIndex": 1
      },
      {
        "text": "The a.empID < b.empID guard exists to:",
        "options": [
          "Sort the output",
          "Prevent duplicate pairs (A,B and B,A)",
          "Filter by salary",
          "Add a foreign key"
        ],
        "correctIndex": 1
      },
      {
        "text": "CROSS JOIN of 4 shirts × 3 sizes yields:",
        "options": [
          "4 rows",
          "12 rows",
          "7 rows",
          "1 row"
        ],
        "correctIndex": 1
      },
      {
        "text": "Comparing w.salary > m.salary happens:",
        "options": [
          "Inside the ON clause",
          "In a WHERE after the join pairs rows",
          "In the SELECT list",
          "Before the join"
        ],
        "correctIndex": 1
      },
      {
        "text": "Bossless employees fail which part of the inner self join?",
        "options": [
          "The WHERE clause",
          "The ON condition (NULL managerID never equals empID)",
          "The SELECT list",
          "The alias declaration"
        ],
        "correctIndex": 1
      },
      {
        "text": "Accidental cartesian products happen when a join lacks:",
        "options": [
          "A SELECT list",
          "An ON condition",
          "An alias",
          "A GROUP BY"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "write-correlated-subquery",
    "questions": [
      {
        "text": "A correlated subquery executes:",
        "options": [
          "Once",
          "Once per outer row",
          "Never",
          "Twice"
        ],
        "correctIndex": 1
      },
      {
        "text": "The correlation in \"above own department average\" is:",
        "options": [
          "e2.dept = e1.dept",
          "e1.empID = e2.empID",
          "e2.salary > e1.salary",
          "No correlation exists"
        ],
        "correctIndex": 0
      },
      {
        "text": "IT employees: Aarav 60000, Meera 50000. The IT department average is:",
        "options": [
          "50000",
          "55000",
          "60000",
          "110000"
        ],
        "correctIndex": 1
      },
      {
        "text": "SELECT 1 inside EXISTS is:",
        "options": [
          "A real output column",
          "A placeholder — only row existence matters",
          "An error",
          "A COUNT function"
        ],
        "correctIndex": 1
      },
      {
        "text": "salary > ALL (other-dept salaries) means the employee:",
        "options": [
          "Beats at least one",
          "Beats every one of them",
          "Beats none",
          "Equals the max"
        ],
        "correctIndex": 1
      },
      {
        "text": "Without the correlation clause, the inner AVG query runs:",
        "options": [
          "Per row",
          "Once — and answers a wrong question",
          "Never",
          "In parallel with sorting"
        ],
        "correctIndex": 1
      },
      {
        "text": "The two copies of the table must use:",
        "options": [
          "The same alias",
          "Different aliases (e1, e2)",
          "No aliases",
          "Table names only"
        ],
        "correctIndex": 1
      },
      {
        "text": "EXISTS returns true when the inner query produces:",
        "options": [
          "Zero rows",
          "At least one row",
          "Exactly one row",
          "A NULL"
        ],
        "correctIndex": 1
      }
    ]
  }
  ,
  {
    "problemSlug": "combine-results-set-operators",
    "questions": [
      {
        "text": "Products {P1, P2} from half A, {P2, P3} from half B. UNION gives:",
        "options": [
          "P1, P2, P2, P3",
          "P1, P2, P3",
          "P2",
          "P1, P3"
        ],
        "correctIndex": 1
      },
      {
        "text": "The same halves under UNION ALL give:",
        "options": [
          "P1, P2, P3",
          "P1, P2, P2, P3",
          "P2, P2",
          "P1, P3"
        ],
        "correctIndex": 1
      },
      {
        "text": "Q1Sales {P1, P2, P3} INTERSECT Q2Sales {P2, P3, P4} = :",
        "options": [
          "P1, P4",
          "P2, P3",
          "P1, P2, P3, P4",
          "P3, P2, P3"
        ],
        "correctIndex": 1
      },
      {
        "text": "Catalogue {P1, P2, P3, P4} EXCEPT Ordered {P2, P4, P5} = :",
        "options": [
          "P2, P4",
          "P1, P3",
          "P5",
          "P1, P2, P3, P4"
        ],
        "correctIndex": 1
      },
      {
        "text": "Set operations pair columns by:",
        "options": [
          "Column name",
          "Position (and compatible types)",
          "Primary key",
          "Table name"
        ],
        "correctIndex": 1
      },
      {
        "text": "Duplicates must be PRESERVED — use:",
        "options": [
          "UNION",
          "UNION ALL",
          "INTERSECT",
          "EXCEPT"
        ],
        "correctIndex": 1
      },
      {
        "text": "ORDER BY with set operations goes:",
        "options": [
          "Inside each half",
          "Once, at the very end",
          "Before the first SELECT",
          "It is not allowed"
        ],
        "correctIndex": 1
      },
      {
        "text": "A query with a 1-column left half and a 2-column right half:",
        "options": [
          "Works — names matter more",
          "Errors — degrees must match",
          "Runs with NULLs",
          "Returns both columns"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "determine-functional-dependency-holds",
    "questions": [
      {
        "text": "Two rows agree on X but differ on Y. What does that prove?",
        "options": [
          "X → Y holds",
          "X → Y is violated",
          "X is a key",
          "Y is a key"
        ],
        "correctIndex": 1
      },
      {
        "text": "Which FD is trivial?",
        "options": [
          "id → name",
          "{id, name} → name",
          "name → zip",
          "zip → city"
        ],
        "correctIndex": 1
      },
      {
        "text": "Given A → B and B → C, which rule proves A → C?",
        "options": [
          "Reflexivity",
          "Augmentation",
          "Transitivity",
          "Decomposition"
        ],
        "correctIndex": 2
      },
      {
        "text": "Augmentation says: if X → Y, then",
        "options": [
          "XZ → YZ for any Z",
          "Y → X",
          "X → Z",
          "XY → Z"
        ],
        "correctIndex": 0
      },
      {
        "text": "X → YZ implies (by decomposition)",
        "options": [
          "X → Y only",
          "X → Y and X → Z",
          "Y → Z",
          "Z → Y"
        ],
        "correctIndex": 1
      },
      {
        "text": "A candidate key K is exactly:",
        "options": [
          "any FD with K on the right",
          "a minimal set with K → all attributes",
          "the first column",
          "an Armstrong axiom"
        ],
        "correctIndex": 1
      },
      {
        "text": "Can one row alone violate an FD?",
        "options": [
          "Yes, always",
          "No — the test needs a pair of rows",
          "Only for composite keys",
          "Only for trivial FDs"
        ],
        "correctIndex": 1
      },
      {
        "text": "SELECT city, COUNT(DISTINCT zip) ... HAVING COUNT(DISTINCT zip) > 1 returns rows when:",
        "options": [
          "city → zip holds",
          "city → zip is violated",
          "zip is NULL",
          "city is a key"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "compute-closure-attribute-set",
    "questions": [
      {
        "text": "The closure {A}+ with F = {A → B, B → C} is:",
        "options": [
          "{A, B}",
          "{A, B, C}",
          "{A}",
          "{B, C}"
        ],
        "correctIndex": 1
      },
      {
        "text": "The closure loop stops when:",
        "options": [
          "every FD fires once",
          "a full pass adds no new attribute",
          "the input set is empty",
          "one rule is used twice"
        ],
        "correctIndex": 1
      },
      {
        "text": "FD X → Y follows from F if and only if:",
        "options": [
          "X is in Y+",
          "Y is in X+",
          "X and Y are in the same table",
          "Y is a key"
        ],
        "correctIndex": 1
      },
      {
        "text": "A set S is a superkey when:",
        "options": [
          "S+ contains every attribute",
          "S has more than 2 attributes",
          "S+ is a proper subset",
          "S contains the PK"
        ],
        "correctIndex": 0
      },
      {
        "text": "With F = {A → B, A → C, B → D, D → E}, what is {B}+?",
        "options": [
          "{B, D, E}",
          "{A, B, C, D, E}",
          "{B}",
          "{B, D}"
        ],
        "correctIndex": 0
      },
      {
        "text": "Why is {A} a candidate key in the same family?",
        "options": [
          "It is the first attribute",
          "{A}+ is everything and {A} is minimal",
          "Every FD has A on the left",
          "A appears twice"
        ],
        "correctIndex": 1
      },
      {
        "text": "An FD whose left side is NOT yet inside the closure is:",
        "options": [
          "applied anyway",
          "skipped for this pass",
          "applied backwards",
          "deleted from F"
        ],
        "correctIndex": 1
      },
      {
        "text": "If X already contains all attributes, then X+ is:",
        "options": [
          "X itself",
          "empty",
          "undefined",
          "the set of keys"
        ],
        "correctIndex": 0
      }
    ]
  },
  {
    "problemSlug": "normalize-relation-3nf",
    "questions": [
      {
        "text": "A cell holding 'DBMS, OS' violates:",
        "options": [
          "1NF",
          "2NF",
          "3NF",
          "BCNF"
        ],
        "correctIndex": 0
      },
      {
        "text": "A partial dependency means a non-prime attribute depends on:",
        "options": [
          "the whole composite key",
          "part of a composite key",
          "another non-prime attribute",
          "a foreign key"
        ],
        "correctIndex": 1
      },
      {
        "text": "In ORDER_DETAILS, ProductName depended only on ProductID. This is:",
        "options": [
          "a transitive dependency",
          "a partial dependency",
          "a trivial dependency",
          "an anomaly-free design"
        ],
        "correctIndex": 1
      },
      {
        "text": "EmpID → DeptID → DeptName is an example of:",
        "options": [
          "partial dependency",
          "transitive dependency",
          "repeating group",
          "1NF violation"
        ],
        "correctIndex": 1
      },
      {
        "text": "A prime attribute is one that:",
        "options": [
          "is indexed",
          "belongs to some candidate key",
          "is the FK",
          "has no NULLs"
        ],
        "correctIndex": 1
      },
      {
        "text": "A table with a single-attribute key that is already 1NF is automatically:",
        "options": [
          "2NF",
          "5NF",
          "un-normalized",
          "non-atomic"
        ],
        "correctIndex": 0
      },
      {
        "text": "The final 3NF schema for the problem had how many tables?",
        "options": [
          "2",
          "3",
          "4",
          "5"
        ],
        "correctIndex": 2
      },
      {
        "text": "ORDER_ITEM keeps quantity and links orders to products using:",
        "options": [
          "a single-column key",
          "a composite key (OrderID, ProductID)",
          "no key at all",
          "a transitive key"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "determine-relation-bcnf",
    "questions": [
      {
        "text": "R (A, B, C) with AB → C and C → B is:",
        "options": [
          "BCNF",
          "3NF but not BCNF",
          "1NF only",
          "not in 1NF"
        ],
        "correctIndex": 1
      },
      {
        "text": "The candidate keys of R (A, B, C) with AB → C, C → B are:",
        "options": [
          "{AB} and {AC}",
          "{A} only",
          "{BC} only",
          "{ABC}"
        ],
        "correctIndex": 0
      },
      {
        "text": "The BCNF test requires every non-trivial FD to have:",
        "options": [
          "a primary key on the left",
          "a superkey on the left",
          "two attributes",
          "a foreign key"
        ],
        "correctIndex": 1
      },
      {
        "text": "In CourseAlloc, Instructor → Course violates BCNF because:",
        "options": [
          "Instructor is the PK",
          "closure(Instructor) is not the whole table",
          "Course is NULL",
          "Instructor appears twice"
        ],
        "correctIndex": 1
      },
      {
        "text": "Decomposing on X → Y, table 2 contains:",
        "options": [
          "only Y",
          "(all attributes − Y) plus X",
          "only X",
          "the FK"
        ],
        "correctIndex": 1
      },
      {
        "text": "A decomposition is lossless when the tables:",
        "options": [
          "have different sizes",
          "share a key column so joins recover the original rows",
          "keep every column twice",
          "drop all FDs"
        ],
        "correctIndex": 1
      },
      {
        "text": "In Case 1, the FD AB → C is not enforceable in either split table. This is:",
        "options": [
          "loss of dependency preservation",
          "a NULL problem",
          "a key violation",
          "a 1NF failure"
        ],
        "correctIndex": 0
      },
      {
        "text": "EMP (EmpID, DeptID, Role) with EmpID → DeptID and EmpID → Role is already:",
        "options": [
          "BCNF",
          "violated",
          "in 1NF only",
          "non-atomic"
        ],
        "correctIndex": 0
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
  { "type": "topic", "value": "er-diagram-basics", "label": "ER Diagram Basics", "order": 4 },
  { "type": "topic", "value": "relationship-types-cardinality", "label": "Relationship Types & Cardinality", "order": 5 },
  { "type": "topic", "value": "generalization-specialization-aggregation", "label": "Generalization, Specialization & Aggregation", "order": 6 },
  { "type": "topic", "value": "weak-entities-keys", "label": "Weak Entities & Keys", "order": 7 },
  { "type": "topic", "value": "mapping-er-diagrams-tables", "label": "Mapping ER Diagrams to Tables", "order": 8 },
  { "type": "topic", "value": "mapping-constraints", "label": "Mapping Constraints", "order": 9 },
  { "type": "topic", "value": "keys-candidate-primary-foreign-super", "label": "Keys (Candidate, Primary, Foreign, Super)", "order": 10 },
  { "type": "topic", "value": "relational-algebra-basics", "label": "Relational Algebra Basics", "order": 11 },
  { "type": "topic", "value": "set-operations-relational-algebra", "label": "Set Operations in Relational Algebra", "order": 12 },
  { "type": "topic", "value": "joins-relational-algebra", "label": "Joins in Relational Algebra", "order": 13 },
  { "type": "topic", "value": "create-alter-drop-statements", "label": "CREATE, ALTER, DROP Statements", "order": 14 },
  { "type": "topic", "value": "insert-update-delete", "label": "INSERT, UPDATE, DELETE", "order": 15 },
  { "type": "topic", "value": "basic-select-where-order-by", "label": "Basic SELECT, WHERE, ORDER BY", "order": 16 },
  { "type": "topic", "value": "aggregate-functions-group-by", "label": "Aggregate Functions & GROUP BY", "order": 17 },
  { "type": "topic", "value": "inner-outer-joins", "label": "Inner & Outer Joins", "order": 18 },
  { "type": "topic", "value": "self-joins-cross-joins", "label": "Self Joins & Cross Joins", "order": 19 },
  { "type": "topic", "value": "nested-subqueries", "label": "Nested Subqueries", "order": 20 },
  { "type": "topic", "value": "union-intersect-except", "label": "UNION, INTERSECT, EXCEPT", "order": 21 },
  { "type": "topic", "value": "functional-dependency-basics", "label": "Functional Dependency Basics", "order": 22 },
  { "type": "topic", "value": "closure-of-attributes", "label": "Closure of Attributes", "order": 23 },
  { "type": "topic", "value": "1nf-2nf-3nf", "label": "1NF, 2NF and 3NF", "order": 24 },
  { "type": "topic", "value": "bcnf", "label": "BCNF", "order": 25 },
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
 * Export the content arrays so admin tools and verification scripts
 * can validate data without a live database.
 */
export { dbmsLessons, dbmsSubtopics, dbmsProblems, dbmsQuizzes, dbmsMetaData };

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
