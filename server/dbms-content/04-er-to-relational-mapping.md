# DBMS Learning Document — ER to Relational Mapping

> A comprehensive, student-friendly guide to ER to Relational Mapping — the foundation every DBMS course stands on.
> Master mapping er diagrams to tables, mapping constraints, with exam-style problems and fully worked solutions.

---

# 4. ER to Relational Mapping

> **Lesson Overview:** Turn a drawn ER diagram into actual tables — seven mechanical rules that decide every primary key, foreign key, and junction table, plus how cardinality and participation constraints survive the journey.
> - **Category:** Database Fundamentals & ER Modeling
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 4.1 Mapping ER Diagrams to Tables

### From Diagram to Database — The Translation Layer

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

```
DEPARTMENT (deptID PK)
EMPLOYEE   (empID PK, name, deptID FK → DEPARTMENT)   ← FK on the N side
```

**M:N — STUDENT enrolls in COURSE:**

```
STUDENT   (studentID PK)
COURSE    (courseID PK)
ENROLLS   (studentID FK, courseID FK, PRIMARY KEY (studentID, courseID))
            ↑ junction table — never a plain FK in either main table
```

### Rule 6 — The Multi-Valued Attribute

"Member has up to 3 phone numbers" produces:

```
MEMBER     (memberID PK, name)
MEMBER_PHONE (memberID FK, phone, PRIMARY KEY (memberID, phone))
```

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

❌ **FK on the wrong side of 1:N** — the "many" side carries the foreign key, always.❌ **Junction table without a composite PK** — the pair (studentID, courseID) must be unique; an auto-id alone invites duplicates.❌ **Multi-valued attribute as a comma list** — it gets its own table (rule 6), no exceptions.❌ **Skipping rule 2** — weak entities keep the owner key inside their primary key; a surrogate id is not acceptable here.

### Quick Self-Test (answers at the bottom)

1. A 1:N relationship puts the FK on: (a) the one side (b) the N side (c) a junction table
2. An M:N relationship becomes: (a) an FK (b) a junction table (c) a merged table
3. A multi-valued attribute becomes: (a) a column (b) its own table (c) part of the entity's key
4. A weak entity's PK is: (a) its own id (b) owner's PK + partial key (c) partial key alone

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 4.2 Mapping Constraints

### Constraints Are the Diagram's Fine Print

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

```
EMPLOYEE.deptID NOT NULL   ← "every employee MUST be assigned to a department"
DEPARTMENT managerID NULL   ← "a department MAY have a manager"
```

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
| Order → Customer is 1:N | ```Customer(customerID PK, ...)``` + ```Orders(orderID PK, customerID FK NOT NULL → Customer)``` |
| N side total (orders must exist) | ```customerID NOT NULL``` |
| Customer side partial | Customer table needs no order column at all! |
| Deleting a customer | ```ON DELETE CASCADE``` deletes their orders — or RESTRICT if history must be kept |

### Common Traps

❌ **UNIQUE on a 1:N foreign key** — that would force every order to a different customer; UNIQUE belongs only to 1:1 mappings.❌ **NOT NULL on partial participation** — "may have zero or many" must map to a NULLable FK; NOT NULL would forbid the zero case.❌ **Mixing SET NULL with total participation** — setting NULL violates the NOT NULL promise; pick CASCADE or RESTRICT instead.❌ **Auto-created junction rows** — junction-row FK columns are NOT NULL and CASCADE; a junction row without both sides is garbage.

### Quick Self-Test (answers at the bottom)

1. Total participation on the FK's side maps to: (a) UNIQUE (b) NOT NULL (c) CASCADE
2. A 1:1 link needs which extra keyword on the FK? (a) NOT NULL (b) UNIQUE (c) DEFAULT
3. Deleting a customer with CASCADE deletes their: (a) orders (b) only the customer row (c) nothing
4. RESTRICT is safer than CASCADE when: (a) children are transient (b) records are money-sensitive (c) the FK is nullable

**Answers:** 1→b, 2→b, 3→a, 4→b.

---

# 5. Problems

## 5.1 Convert an ER Diagram to a Relational Schema

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Mapping ER Diagrams to Tables |
| **Companies** | Google, Oracle, Ibm |

### Problem Statement

Convert the described ER design into a complete relational schema. Produce every table with its attribute list, primary key, foreign keys (including the column and the table it references), and any junction tables. Apply the seven mapping rules in order.

### Examples

| Input | Output | Explanation |
|---|---|---|
| University: PROFESSOR (profID, name) teaches (M:N) SUBJECT (code, title). SUBJECT is offered_by (1:N) DEPARTMENT (deptID, deptName). Additionally, a professor may head at most one department (1:1). | PROFESSOR(profID PK, name, headsDept FK→DEPARTMENT UNIQUE); DEPARTMENT(deptID PK, deptName); SUBJECT(code PK, title, deptID FK→DEPARTMENT NOT NULL); TEACHES(profID FK→PROFESSOR, code FK→SUBJECT, PRIMARY KEY(profID, code)). | M:N teaches becomes the TEACHES junction table with composite key (rule 5). 1:N offered_by puts deptID on the N side (SUBJECT) and 'offered by a department' makes it NOT NULL (rule 4 + total participation). The 1:1 heads link takes an FK on the professor side with UNIQUE (rule 3). |
| Hotel: HOTEL (hotelID, name, starRating) has (1:N) ROOM (roomNo, price, type). A room's number restarts in every hotel. ROOM also has multi-valued attribute: photos (URLs). | HOTEL(hotelID PK, name, starRating); ROOM(hotelID FK→HOTEL ON DELETE CASCADE, roomNo, price, type, PRIMARY KEY(hotelID, roomNo)); ROOM_PHOTO(hotelID FK, roomNo FK, photoURL, PRIMARY KEY(hotelID, roomNo, photoURL)). | ROOM is a weak entity — its PK borrows hotelID (rule 2) with CASCADE. The multi-valued photos attribute becomes its own table (rule 6), reusing the composite key plus the photo URL. |
| Bank: CUSTOMER (custID, name) opens (1:N) ACCOUNT (accNo, balance). Each account belongs to exactly one customer; a customer may open zero or more accounts. Account type is one value chosen from {savings, current, fixed}. (No other relationships.) | CUSTOMER(custID PK, name); ACCOUNT(accNo PK, balance, type CHECK (type IN ('savings','current','fixed')), custID FK→CUSTOMER NOT NULL). | 1:N maps the FK onto the N side (ACCOUNT) and total participation on that side makes it NOT NULL. The single-choice type attribute stays a normal column with a CHECK constraint — it is simple, not multi-valued. |

### Constraints

- Follow the rule order: strong entities → weak entities → relationships → multi-valued attributes.
- Every FK must be stated as table.column REFERENCES table.
- Junction tables must declare a composite primary key.
- Total participation must produce NOT NULL; 1:1 links must produce UNIQUE.

### Approach

**The Seven-Rule Pipeline (run in this order)**

```
FOR each strong entity:            → table, attributes → columns, key → PK
FOR each weak entity:              → table; PK = owner PK + partial key; CASCADE FK
FOR each 1:1 relationship:         → FK either side + UNIQUE
FOR each 1:N relationship:         → FK on the N side (NOT NULL if total on that side)
FOR each M:N relationship:         → junction table; composite PK of both FKs
FOR each multi-valued attribute:   → own table (owner key + value as PK)
FOR each ISA hierarchy:            → merged / per-subclass / superclass+subclasses
```

**Working Through the First Example**

```
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
```

**Verifying Your Answer**

| Check | How |
|---|---|
| Every entity present? | Count tables ≥ count entities (junction tables add more) |
| Every relationship present? | 1:1/1:N → an FK column; M:N → a junction table |
| Total participation → NOT NULL? | Scan the FK columns |
| 1:1 → UNIQUE? | Scan for UNIQUE on 1:1 FKs |
| Keys declared? | PK and FK on every table |

**Traps To Dodge**

❌ **Skipping the junction table for M:N** — putting courseID into STUDENT creates the first duplicate row ever.❌ **UNIQUE on every FK** — only 1:1 mappings need it; 1:N would break instantly.❌ **Weak entities with invented IDs** — ROOM must use (hotelID, roomNo), not a made-up roomID.❌ **Multi-valued attributes merged into a column** — photos, phones and the like always get their own table.

### Code

```sql
-- Full solution for the FIRST example (University)
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
);
```

```sql
-- Solution for the SECOND example (Hotel with weak ROOM + multi-valued photos)
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
);
```

## 5.2 Represent Cardinality Constraints in Schema

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Mapping Constraints |
| **Companies** | Amazon, Microsoft |

### Problem Statement

For each set of business rules, write the SQL that makes the database itself enforce the rules — no application code, no middle layer. Use the right combination of PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, and ON DELETE actions.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Rules: (1) Every order must belong to exactly one customer. (2) A customer may have zero to many orders. (3) Deleting a customer must delete their orders. | customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE inside Orders. That single column does it all: NOT NULL enforces rule 1, NULLable-by-default-elsewhere the FK column enforces rule 2 (no order column lives in Customer), and CASCADE enforces rule 3. | The three rules map to three SQL features: total participation → NOT NULL, partial participation → nothing needed in the Customer table, and the chosen delete behaviour → CASCADE. One column, three guarantees. |
| Rules: (1) Exactly one manager per department. (2) A manager may manage several departments. (3) If a manager leaves, departments must keep existing but end up with NO manager (NULL) until a replacement is named. | Department.deptHead INT NULL REFERENCES Manager(managerID) ON DELETE SET NULL. The 'exactly one' is enforced because the column holds a single managerID; leaving it NULLable matches rule 3; SET NULL performs the 'manager leaves' transition. | This is a 1:N — Department is the N side carrying the FK. 'End up with NULL until replaced' is literally SET NULL. If the rule had said 'a department must always have a manager', NOT NULL + SET NULL would clash and you would need RESTRICT/CASCADE instead. |
| Rules: (1) A student may enroll in many courses; a course may have many students. (2) An enrollment needs BOTH a student and a course — partial enrollments are not allowed. (3) Removing a student removes their enrollments; removing a course removes its enrollments. | Enrollment(studentID NOT NULL REFERENCES Student ON DELETE CASCADE, courseID NOT NULL REFERENCES Course ON DELETE CASCADE, PRIMARY KEY(studentID, courseID)). NOT NULL on both FKs enforces rule 2; the composite PK stops double enrollment; CASCADE twice enforces rule 3. | For M:N the junction table is where ALL the constraints live: composite PK + NOT NULL + CASCADE in both directions. The Student and Course tables stay completely clean — no FK columns at all. |

### Constraints

- Write full CREATE TABLE statements — not fragments.
- Every business rule must map to exactly one SQL feature — say which one.
- Watch for impossible combinations (total participation + SET NULL).
- M:N constraints live in the junction table, not in the two main tables.

### Approach

**Rule → SQL Translation Table**

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

**Decision Path**

```
1. CardLeaf shape: 1:1 → FK+UNIQUE | 1:N → FK on N | M:N → junction table
2. Participation: total side → NOT NULL ; partial side → nullable
3. Delete behaviour: pick CASCADE / SET NULL / RESTRICT by reading the words
4. Cross-check impossibilities: NOT NULL + SET NULL = contradiction
```

**Reading The Rules (the nouns are traps)**

| Phrase | Real meaning |
|---|---|
| "exactly one" | TOTAL on that side → NOT NULL |
| "may be none" / "zero or more" | PARTIAL → nullable |
| "must keep the record but clear the link" | SET NULL |
| "with the record" / "their orders" | CASCADE |

**Traps To Dodge**

❌ **NOT NULL + SET NULL on the same column** — SET NULL violates NOT NULL; if the rule demands both, use RESTRICT or CASCADE.❌ **Enforcing M:N business rules in the app layer** — the question asks for schema enforcement; junction-table constraints must do the job.❌ **Double enrollment allowed** — the composite primary key (studentID, courseID) is the enforcement; forgetting it invites duplicate rows.❌ **Putting the FK in the wrong table for 1:N** — the many side carries it; the one side stays untouched.

### Code

```sql
-- SOLUTION: Example 1 — Orders must belong to a customer (total), cascade on delete
CREATE TABLE Customer (
  customerID INT PRIMARY KEY,
  name       VARCHAR(50) NOT NULL
);

CREATE TABLE Orders (
  orderID    INT PRIMARY KEY,
  amount     DECIMAL(10, 2) NOT NULL,
  customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE
);
```

```sql
-- SOLUTION: Example 3 — M:N enrollments, all constraints in the junction
CREATE TABLE Student (studentID INT PRIMARY KEY, name VARCHAR(50) NOT NULL);
CREATE TABLE Course  (courseID  INT PRIMARY KEY, title VARCHAR(80) NOT NULL);

CREATE TABLE Enrollment (
  studentID INT NOT NULL REFERENCES Student(studentID) ON DELETE CASCADE,
  courseID  INT NOT NULL REFERENCES Course(courseID)   ON DELETE CASCADE,
  PRIMARY KEY (studentID, courseID)
);
```
