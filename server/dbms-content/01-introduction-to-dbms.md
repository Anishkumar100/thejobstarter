# DBMS Learning Document — Introduction to DBMS

> A comprehensive, student-friendly guide to Introduction to DBMS — the foundation every database course stands on.
> Master why a DBMS beats a raw file system, the three-schema architecture that keeps users and storage decoupled, and the data-model family tree from relational tables to network and hierarchical trees.

---

# 1. Introduction to DBMS

> **Lesson Overview:** Start here — why a pile of Excel files is a nightmare and a DBMS is a superpower. Learn what a database really is, how a DBMS beats a raw file system, the three-schema architecture that keeps every developer and every user looking at the same truth, and the big families of data models that decide how records relate.
> - **Category:** Database Fundamentals & ER Modeling
> - **Difficulty:** Easy
> - **Problems:** 1

---

## 1.1 DBMS vs File System

### The Story — Two Ways to Keep Data

Imagine you run a chai stall and write every customer's name, phone and ₹amount in a **notebook**. Now you open two more stalls, each with its own notebook. Tomorrow, the same customer is "pending" in one book and "paid" in another. That is the **file system** approach — data lives in loose, independent files, and nobody guarantees the copies agree.

Now imagine a **single golden ledger** that all your stalls share, plus a strict **bank-teller** who queues everyone up, checks IDs, and never lets two people write the same page at once. That teller is your **DBMS** (DataBase Management System).

### Where the File System Breaks

| Problem | File system | DBMS |
|---|---|---|
| Same record in 5 offices | Copied 5× — copies drift | Stored **once**, visible everywhere |
| Two people edit the same amount | Both overwrite → corruption | Locked → applied one by one |
| Power cuts mid-save | Half-written file | Transaction rolls back — data intact |
| "Who owes me ₹1000?" | Scan every file manually | `SELECT` with an index → milliseconds |
| Who changed this row last night? | No trace | Audit log + per-user permissions |

### The Five Superpowers of a DBMS

**1. No Data Twice (Redundancy-Free)**
A file system stores the customer's phone number in five files, five shapes. A DBMS stores it **exactly once** and every screen reads that one copy — no disagreement possible. If 2,00,000 copies of a record would eat 12 GB in files, one copy in a DBMS eats almost nothing.

**2. One Source of Truth**
Centralise it: the address lives in one row. Same data, same meaning, used by every app — you stop trusting which copy is right.

**3. Access Controlled**
The DBMS sits between the user and the raw data like a security guard — passwords, roles, row-level permissions. A spreadsheet has no walls; `GRANT` and `REVOKE` do.

**4. Scale Without a Heart-Attack**
"Total sales over ₹10,00,000" = scanning 4 million CSV rows by hand. With an **index**, the DBMS jumps straight to the relevant rows — the same lazy trick as a book's index.

**5. Safe Concurrency (many users at once)**
Two clerks updating the same stock at the same instant is the classic file-corruption. A DBMS locks the row, applies the writes one after another, and every viewer sees a consistent snapshot.

### When Does the File System Win?

| File system preferred | DBMS preferred |
|---|---|
| A few read-only static files | Data that is queried, joined, filtered daily |
| Videos, photos, logs (raw blobs) | Data that needs relationships and integrity |
| One user, one machine | Many users, many screens, shared truth |

### Key Takeaway

A file system **stores** raw bytes. A DBMS **manages** them — deduplication, one source of truth, a security gate, an index for speed, and locks for safety. That is why libraries, banks, and the internet all run on DBMS, not on folders.

---

## 1.2 Database Architecture & Data Models

### The Blueprint of Every Serious Database

Think of a university. A student sees a simple login screen and a course card. The database designer sees tables: Student, Course. The storage engine sees records sitting in disk blocks. All three look at the **same database** from different windows — that is exactly the **three-schema architecture**.

### Meet the Three Schemas

| Schema | Who lives here | What it describes | Example |
|---|---|---|---|
| **External** (View level) | End users & apps | What a single user needs, possibly rearranged or computed | A student sees `name, grade, hobby` on a friendly screen |
| **Conceptual** (Logical level) | Database designer | The **pure meaning**: tables, columns, keys, relationships — no storage talk | `Student(ID, name, grade)` linked to `Hobby(studentID, hobbyName)` |
| **Internal** (Physical level) | Storage engine | How rows are placed on disk: blocks, indexes, pointers | Records packed in 4 KB blocks with a B+tree index on `ID` |

### Why Have a Middle Floor?

Because it keeps the **users and the storage decoupled**. You can rebuild the entire physical layer — a faster index, a different block size — and **no app changes a single line**. The conceptual schema is the contract in between that both sides agree on.

### Data Models — How We Draw the Conceptual World

A data model decides the *shape* in which records relate. There are four big families:

**1. Relational Model — the king of tables**
Data lives in **tables** (relations). Rows = records, columns = attributes, keys connect tables. SQL speaks this shape. MySQL, PostgreSQL, Oracle — today's default for the world.

```
STUDENT                      COURSE
ID | Name  | Grade           ID | Title
1  | Riya  | A               1  | DBMS
2  | Aditi  | B              2  | DSA

STUDENT_COURSE (the link table)
studentID | courseID
1         | 1
1         | 2
2         | 1
```

**2. Hierarchical Model — the family tree**
Data organised as a **tree**: one parent, many children, every child has exactly one parent. Think org charts or folder trees. Fast for tree queries, painful for many-to-many. IBM's IMS was built on this.

```
             College
       ┌───────┼──────┐
    Dept A   Dept B   Dept C
     │                │
  Students         Teachers
```

**3. Network Model — the web of pointers**
Like hierarchy, but a child can have **many parents** — records linked by explicit pointers. Flexible but the data itself can become tangled: changing a pointer structure means rewriting queries. The CODASYL/DBTG model is the classic example.

**4. Object-Oriented / Document Model — the modern rebels**
Records as objects (OODBMS) or JSON documents (MongoDB, CouchDB). No rigid schema is needed — each document can carry its own fields. Loved when data is naturally nested, like a blog post with its comments inside it.

```json
{
  "student": "Aditi",
  "grade": "A",
  "hobbies": ["chess", "cricket"]
}
```

### Which Model Wins?

There is no absolute winner — it depends on the question you are asking:

| Need | Model |
|---|---|
| Account balances, joins, reports | Relational (SQL) |
| Parent→child drill-down, org charts | Hierarchical |
| Complex many-to-many, legacy systems | Network |
| Flexible JSON, nested documents | Document (NoSQL) |

### Key Takeaway

Every database has three windows: **External** (user view), **Conceptual** (pure structure), **Internal** (disk layout). The conceptual middle floor is the contract that frees apps from storage details. And the **data model** decides the drawing — tables for the relational world, trees for hierarchy, pointers for networks, documents for NoSQL.

---

# 2. Problems

## 2.1 Identify the Three-Schema Architecture Level

```
|                    |                                  |
|--------------------|----------------------------------|
| **Difficulty**     | Easy                             |
| **Subtopic**       | Database Architecture & Data Models |
| **Companies**      | Amazon, Google, Oracle           |
```

### Problem Statement

You are given five statements that different people make about the same university database. For each statement, classify which level of the three-schema architecture it belongs to: External (View), Conceptual (Logical), or Internal (Physical).

### Examples

| Input | Output | Explanation |
|---|---|---|
| An app shows rows about a user's name and grade only | External | The statement talks about what a single user/app sees to a view of the data |
| The designer says "Student and Course are two tables with a many-to-many link" | Conceptual | Says nothing about disk; talks about tables, keys, relationships |
| The DBA says "pack records into 4 KB blocks with a B+tree index" | Internal | Mention of blocks, indexes and file layout = physical concern |
| "A student may enroll in many courses, and a course may have many students" | Conceptual | A relationship between entities — structure and meaning |
| The user sees only two columns and has no idea what the raw table is | External | A user's personalised window on the data |

### Constraints

- Classify each statement as exactly one of: External, Conceptual, Internal
- You may replay each statement as it relates to the same three-schema blueprint

### Approach

**The One-Line Trick**

Ask: **Who is speaking, and about what?**

| If the speaker talks about… | It is |
|---|---|
| What a user or app **sees** (screens, views, visible columns) | **External** |
| The **structure and meaning** — tables, keys, relationships, cardinality | **Conceptual** |
| **Storage on disk** — blocks, indexes, pointers, file layout | **Internal** |

**Step-by-Step Method**

1. **Read the statement and find the subject.** Is it about a screen, a table, or a disk?
2. **User/app + visible columns → External.** Views are tailor-made projections — often they hide or recompute columns.
3. **Designer + structure → Conceptual.** "Student and Course are linked" describes the schema's meaning, not its storage.
4. **Engineer + blocks/indexes → Internal.** "4 KB blocks" and "B+tree" are pure physical talk.
5. **When in doubt, remember the middle floor is the contract.** If the statement stays true no matter how the data is stored on disk, it is Conceptual. If it mentions the disk at all, it is Internal. If it mentions a screen or a specific user's needs, it is External.

**Why This Trick Always Works**

The three-schema architecture exists exactly so that these three audiences can talk about the same database without confusion. The **view level** is cosmetic (what you see), the **logical level** is structural (what it means), the **physical level** is mechanical (how it is stored). Interview questions hide exactly these trigger words — hunt for them.

| Trigger words | Level |
|---|---|
| user, app, screen, view, visible columns | External |
| table, key, relationship, cardinality, schema | Conceptual |
| block, index, pointer, disk, file layout | Internal |

### Code

```sql
-- EXTERNAL: a view an app sees (only 2 columns, no raw table)
CREATE VIEW StudentSummary AS
SELECT name, grade
FROM Student;

-- CONCEPTUAL: the pure structure (tables + relationship)
CREATE TABLE Student (
  id    INT PRIMARY KEY,
  name  VARCHAR(50),
  grade CHAR(1)
);

CREATE TABLE STUDENT_COURSE (
  studentID INT REFERENCES Student(id),
  courseID  INT REFERENCES Course(id)
);

-- INTERNAL (conceptualised, not real SQL):
-- rows packed in 4 KB blocks, B+tree index on id
```