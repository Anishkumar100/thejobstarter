# DBMS Learning Document — Entity-Relationship Modeling

> A comprehensive, student-friendly guide to Entity-Relationship Modeling — the foundation every DBMS course stands on.
> Master er diagram basics, relationship types & cardinality, with exam-style problems and fully worked solutions.

---

# 2. Entity-Relationship Modeling

> **Lesson Overview:** Sketch a database before writing a single line of SQL — what an entity is, how attributes dress it up, and how relationships with the right cardinality capture real-world rules like one-to-many and many-to-many.
> - **Category:** Database Fundamentals & ER Modeling
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 2.1 ER Diagram Basics

### Why Draw Before You Build

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

❌ **Classic mistake:** squeezing multi-valued data into one cell like `"ph1, ph2, ph3"`. You can never query "whose number is ph2?" without scanning every cell. A separate table fixes it:

```
PHONE
├── studentID  (links back to STUDENT)
├── phoneNumber
└── (composite key: studentID + phoneNumber)
```

### How to Hunt for the Three Elements

Read the requirement and interrogate every noun:

```
FOR each noun or noun-phrase in the requirement:
    IF the system stores facts about it          → ENTITY (❑)
    ELSE IF it IS a fact about an entity         → ATTRIBUTE (◯)
    ELSE IF it links two entities together       → RELATIONSHIP (◇)
    ELSE                                         → ignore it (helper/UI detail)
```

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

❌ **Using an attribute as an entity** — "city" is usually an attribute of an address, not its own rectangle (unless you store facts *about* cities).❌ **Multi-valued data in one column** — always a separate linked table.❌ **Relationship attributes glued to an entity** — the borrow *date* is not "a fact about the book"; it lives on the relationship.❌ **Mixing input forms with stored data** — a button or a screen is not a database element; the ER diagram only cares about persistent facts.

### Quick Self-Test (answers at the bottom)

1. In "a customer places an order", what is each noun? (a) both entities, places = relationship (b) order is an attribute (c) places is an entity
2. A student's *another email address* (optional, could be several) is what attribute type? (a) simple (b) composite (c) multi-valued (d) derived
3. Age is usually stored in the database — true or false?
4. Which of these is most likely an ENTITY? (a) the price of a book (b) the book (c) the word "book" in the navbar

**Answers:** 1→a, 2→c, 3→false (it is derived from DateOfBirth), 4→b (we store many facts about the book).

### Key Takeaway

An ER diagram is a **sentence of shapes**. Hunt every noun, label it entity/attribute/relationship, and respect the four attribute flavours — the drawing you make here decides the tables you build later.

## 2.2 Relationship Types & Cardinality

### Relationships Come in Three Sizes

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

```
Q1: Can ONE X  be linked to MANY Ys?   (yes/no)
Q2: Can ONE Y  be linked to MANY Xs?   (yes/no)

Q1=no,  Q2=no  →  1:1
Q1=yes, Q2=no  →  1:N   (X is the "one" side)
Q1=no,  Q2=yes →  1:N   (Y is the "one" side)
Q1=yes, Q2=yes →  M:N
```

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

❌ **Saying 1:N when the sentence is M:N** — if both sides can have many, it is M:N (courses enrol many students *and* students take many courses).❌ **"Total" written as "at least one" on the WRONG side** — always attach the double line to the entity that *must* participate.❌ **Unary relationships forgotten in counting** — an employee managing employees is still a relationship; give it its own thought about cardinality (one manager can manage many — 1:N).❌ **Ternary cardinality read as three binary ratios** — a ternary must be judged as one three-way fact.

### Quick Self-Test (answers at the bottom)

1. "A country has many states; each state belongs to exactly one country" → ratio? (a) 1:1 (b) 1:N (c) M:N
2. "A car has exactly one engine; an engine is made for exactly one car model" → ratio? (a) 1:1 (b) 1:N (c) M:N
3. Total participation on the employee side of "employee — works in — department" means? (a) every department must have employees (b) every employee must have a department (c) departments are optional
4. A relationship where EMPLOYEE manages EMPLOYEE is called? (a) binary (b) unary (c) ternary

**Answers:** 1→b (many states per country), 2→a, 3→b, 4→b.

---

# 3. Problems

## 3.1 Identify Entities, Attributes and Relationships

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | ER Diagram Basics |
| **Companies** | Amazon, Google, Oracle |

### Problem Statement

For the system described below, list (1) every entity with the attribute that could uniquely identify it, (2) every simple attribute, (3) the multi-valued attributes, and (4) every relationship with a one-line meaning.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Library system: A book has a title, an ISBN and a shelf number. A member has a name, a member ID and up to three phone numbers. A member can borrow many books; a book can be borrowed by many members over time. | Entities: BOOK (ISBN), MEMBER (memberID). Simple attributes: title, shelfNumber, name. Multi-valued: phone numbers (and the borrow date rides the BORROWS relationship). Relationship: MEMBER borrows BOOK (M:N). | ISBN uniquely identifies a book and memberID uniquely identifies a member, so they become the key attributes. Phone numbers (up to three) are multi-valued — they need their own table later. "Borrowed by many members over time" makes the relationship M:N. |
| Restaurant: A customer can place at most one order per day. An order has an order number, a total amount and a delivery address (street, city, pincode). | Entities: CUSTOMER (customerID), ORDER (orderNumber). Simple attributes: totalAmount. Composite: deliveryAddress = street + city + pincode. Relationship: CUSTOMER places ORDER (1:N — many orders over many days, but read carefully: one order belongs to one customer). | The address splits into three logical parts — that is the signature of a composite attribute. The daily limit does NOT cap the relationship shape; over time one customer can place many orders, while each order has exactly one customer → 1:N. |
| University: A professor teaches many subjects. Each subject has a code, name and credit count. Some professors are research-only and teach nothing. | Entities: PROFESSOR (profID), SUBJECT (code). Simple attributes: name, creditCount. Relationships: PROFESSOR teaches SUBJECT (M:N — one professor teaches many subjects; one subject is taught by many professors). Participation: professor side is PARTIAL (research-only professors teach nothing). | Subject code is compact and unique → the key. 'Research-only professors' reveals partial participation on the professor side — an important fact to record even though it is not an entity or attribute. |

### Constraints

- Exactly one identifying attribute per entity (write it in brackets).
- Classify every attribute as simple, composite or multi-valued — do not skip any.
- Name every relationship as ENTITY verb ENTITY and state its cardinality.
- Watch for hidden facts: dates that belong to a relationship, not an entity.

### Approach

**The Three-Pass Method**

Work in passes so nothing slips through:

| Pass | What you do | Output |
|---|---|---|
| 1 | Circle every **noun** in the text | Candidate list |
| 2 | For each noun ask: *do we store facts about it?* | Entities vs attributes |
| 3 | For each pair of entities ask: *how do they link?* | Relationships + cardinality |

**Pass-by-Pass On The First Example**

**Pass 1 — nouns:** book, title, ISBN, shelf number, member, name, member ID, phone numbers, date, borrow.

**Pass 2 — entity or attribute?**

```
book        → stores title, ISBN, shelf → ENTITY
title       → a value, nothing stored about it → ATTRIBUTE of BOOK
ISBN        → ATTRIBUTE (and unique → the key)
shelfNumber → ATTRIBUTE
member      → stores name, id, phones → ENTITY
name        → ATTRIBUTE of MEMBER
memberID    → ATTRIBUTE (unique → the key)
phones      → ATTRIBUTE, but repeatable → MULTI-VALUED!
date        → belongs to the BORROWS link, not to book/member
```

**Pass 3 — links:** "a member can borrow many books" AND "a book can be borrowed by many members" → both sides "many" → **M:N**.

**Decision Flowchart**

```
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
```

**Traps To Dodge**

❌ **Dates as entity attributes** — a borrow *date* describes the event; put it on the relationship edge.❌ **Calling every single-cardinality link 1:1** — "a book is borrowed by many members" already kills 1:1. Always ask both sides.❌ **Skipping multi-valued flags** — "up to three phones" is deliberately planted; losing it means a broken table design later.

### Code

```sql
-- The identified design turned into real tables (Library example)
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
);
```

## 3.2 Determine the Cardinality of a Relationship

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Relationship Types & Cardinality |
| **Companies** | Google, Microsoft, Ibm |

### Problem Statement

For each pair of entities below, state the cardinality ratio (1:1, 1:N or M:N), which side is which, and the participation (total or partial) on each side. Justify every answer with the words you were given.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Every employee must be assigned to exactly one department. A department can have between 0 and 100 employees. | Ratio: 1:N (100 allows many employees per department → department is the 'one' side). Participation: EMPLOYEE — TOTAL ("must be assigned", "exactly one"); DEPARTMENT — PARTIAL (0 employees allowed). | "Must be assigned to exactly one department" forces total participation on the employee side — the database must forbid an employee without a department. "Can have between 0 and 100" makes department participation partial. |
| Each person can hold at most one passport, and each passport belongs to exactly one person. | Ratio: 1:1. Participation: both sides TOTAL ("exactly one person" and a passport always has an owner). | Neither side can link to many of the other — the classic 1:1. "At most one" plus "exactly one" means every passport must have an owner (total). If some passports were issued but unclaimed, that side would drop to partial. |
| A student must enroll in between 1 and 8 courses per semester. Every course must have at least 5 students, and may have up to 200. | Ratio: M:N. Participation: both sides TOTAL (a student cannot exist without a course and a course cannot be offered without students). | One student → many courses AND one course → many students means M:N. Lower bounds of 1 and 5 respectively convert both participations to total. The record 'belongs to a semester' would ride the enrollment link, not the course. |
| An employee may manage any number of other employees. Each employee has at most one manager. | Ratio: 1:N, unary (EMPLOYEE relates to itself). Participation: managed employee side — PARTIAL ("may" manage, so some employees manage no one); being-managed side — PARTIAL ("at most one manager" — a CEO has none). | This is a unary relationship hiding in plain sight. One manager → many reports (1:N). No 'must' anywhere → both sides partial. |

### Constraints

- Answer with three facts in order: ratio, side names, participation per side.
- Justify participation using exact words like "must", "exactly", "at most", "may".
- Treat unary relationships as relationships — do not ignore self-references.
- Ternary and higher: state that all three participants are needed to make the link meaningful (if applicable).

### Approach

**Method — Ask Both Sides, Then Look For "Must"**

**Step 1 — find the two players.** In unary sentences both players are the same entity.

**Step 2 — cardinality, the two questions:**

```
Q1: Can one X be linked to many Ys?
Q2: Can one Y be linked to many Xs?
Both no  → 1:1     X yes Y no → 1:N (X = one)     both yes → M:N
```

**Step 3 — participation, the hint-word table:**

| Word you were given | Participation | Meaning |
|---|---|---|
| "must", "exactly one", "at least 1", "always" | TOTAL | No row may exist without the link |
| "may", "at most 1", "0 to n", "can", "optional" | PARTIAL | Rows without the link are legal |

**Step 4 — justify by quoting.** Never answer from intuition; paste the deciding phrase into your explanation. "I chose total because the text says *every employee must*".

**Worked Walkthrough — The Employee/Department Example**

```
Read: "Every employee must be assigned to exactly one department."
Q1: one DEPARTMENT → many EMPLOYEEs?  "between 0 and 100" → YES
Q2: one EMPLOYEE → many DEPARTMENTs?  "exactly one" → NO
→ 1:N
```

```
Participation:
EMPLOYEE:  "must be assigned" → TOTAL  (double line in the diagram)
DEPARTMENT: "0 to 100" → PARTIAL        (single line)
```

**Traps To Dodge**

❌ **Reading the wrong 1:N direction** — the "one" is the side whose SINGLE row can link to many; put it clearly on the one side of the ratio.❌ **Confusing "at most 1" with total** — "at most one manager" still allows zero managers → partial.❌ **Missing unary relationships** — self-referencing links are valid; identify them and name both roles ("manages" and "is managed by").❌ **Forgetting that ternary facts change everything** — if the meaning needs all three entities, do not reduce it to two binary ratios.

### Code

```sql
-- How each ratio decides the foreign key (solutions to the examples)
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
);
```
