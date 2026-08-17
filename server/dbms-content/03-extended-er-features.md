# DBMS Learning Document — Extended ER Features

> A comprehensive, student-friendly guide to Extended ER Features — the foundation every DBMS course stands on.
> Master generalization, specialization & aggregation, weak entities & keys, with exam-style problems and fully worked solutions.

---

# 3. Extended ER Features

> **Lesson Overview:** The advanced tools of the ER world — building entity hierarchies with generalization and specialization, and the weak entities that can only survive leaning on a strong owner.
> - **Category:** Database Fundamentals & ER Modeling
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 3.1 Generalization, Specialization & Aggregation

### One Entity Can Wear Many Shapes

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

```
PROJECT —works_on— EMPLOYEE   (M:N)

Now: "A DEPARTMENT manages the fact that EMPLOYEE E works on PROJECT P."
The works_on link itself is being linked → AGGREGATE it:
┌─────────────────────────────┐
│ (PROJECT works_on EMPLOYEE) │  ← aggregated as a single box
└─────────────────────────────┘
        ▲
        │ manages
     DEPARTMENT
```

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

❌ **Mixing disjoint with overlapping** — an employee cannot be both full-time and contract (disjoint); a car CAN be both passenger and electric (overlapping). The words "at the same time" decide it.❌ **Re-adding the inherited key** — subclasses carry the SAME key down from the superclass; they never invent a new primary key.❌ **Forgetting total/partial** — "Some vehicles are neither cars nor trucks" makes the hierarchy partial; only "every X must be one of..." makes it total.❌ **Aggregation without a reason** — only aggregate when the relationship itself is connected to something.

### Quick Self-Test (answers at the bottom)

1. Specialization runs: (a) top-down (b) bottom-up (c) sideways
2. EMPLOYEE → FullTime XOR Contract is what type of constraint? (a) overlapping-total (b) disjoint-total (c) overlapping-partial
3. A vehicle that is both a car and electric means the subclass membership is: (a) disjoint (b) overlapping (c) neither
4. When a relationship must itself participate in a relationship, we use: (a) generalization (b) specialization (c) aggregation

**Answers:** 1→a, 2→b, 3→b, 4→c.

## 3.2 Weak Entities & Keys

### Some Things Only Exist Because Something Else Exists

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

```
Two hotels both have "Room 101" — no problem.
"HotelID + 101" is unique across the WHOLE database.
```

### The Three Test Questions

```
1. Can it be identified WITHOUT any other table's key?  → YES = strong ; NO = weak
2. Does it make sense with zero rows when the owner exists? → depends on participation
3. Is its key made from ANOTHER entity's key + its own?    → YES = classic weak entity
```

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

**Answers:** 1→b, 2→b, 3→b, 4→a.

---

# 4. Problems

## 4.1 Convert an ER Diagram with Specialization

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Generalization, Specialization & Aggregation |
| **Companies** | Amazon, Oracle, Ibm |

### Problem Statement

Given the description of a specialization hierarchy below, choose the best relational mapping option and produce the complete tables with keys. The three options are: (A) one merged table with nullable subtype columns, (B) one table per subclass with a shared primary key, (C) one table per entity (superclass + each subclass) linked by the same key.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Scenario 1: EMPLOYEE (empID, name, joinDate) specializes into FULL_TIME (salary) and CONTRACT (hourlyRate, endDate). The hierarchy is DISJOINT and TOTAL. Full-time and contract attributes barely overlap. Queries frequently target ONE subtype at a time. | Option B (one table per subclass with shared PK). Tables: EMPLOYEE(empID PK, name, joinDate); FULL_TIME(empID PK + FK → EMPLOYEE, salary); CONTRACT(empID PK + FK → EMPLOYEE, hourlyRate, endDate). | Disjoint + total means every employee lives in exactly one subtype, and the subtype attributes barely overlap — no NULL-heavy merged row. Frequent subtype-only queries make option B (or C) favourable; B is chosen because each subtype has few attributes and its own small table. |
| Scenario 2: VEHICLE (regNo, make, model) specializes into CAR (seats) and TRUCK (loadCapacity). Hierarchy is DISJOINT and PARTIAL — the fleet also contains vans that are just VEHICLE. Subtypes each have only ONE extra attribute. | Option A (one merged table: regNo PK, make, model, seats NULL, loadCapacity NULL) works, but examine the query mix first. If subtype-attribute queries are rare, A avoids joins; the partial hierarchy also lawfully leaves type NULL for plain vans. | With one extra attribute per subtype, the merged table has at most two sparse columns — negligible waste. Partial hierarchy means some rows deliberately carry type NULL. This is the classic case where merging (option A) beats splitting. |
| Scenario 3: EMPLOYEE (empID, name) specializes into SALARIED (salary) and HOURLY (rate). Some employees are BOTH (paid a salary AND billed hourly for overtime). Queries often scan ALL employees and occasionally drill into one subtype for a report. | Option C (superclass table + both subclass tables, same key). EMPLOYEE(empID PK, name); SALARIED(empID PK+FK, salary); HOURLY(empID PK+FK, rate). An employee may appear in BOTH subclass tables. | Overlapping membership breaks option A (a single type column cannot say 'both') and breaks B's exclusivity assumption. Option C lets any employee appear in zero, one, or both subclass tables — exactly matching overlapping semantics. |

### Constraints

- State which option (A, B, or C) and justify in one sentence using the words disjoint/overlapping and total/partial.
- List every table with its full primary key and every foreign key.
- NULL columns in the merged option must be listed explicitly.
- Overlapping hierarchies may NOT use option A or B — rows can appear in multiple subtype tables.

### Approach

**The ISA Mapping Decision**

Read the hierarchy once, then answer three questions:

| Question | If YES → | If NO → |
|---|---|---|
| 1. Do subtype attributes barely overlap AND queries hit one subtype at a time? | Option B or C | Consider A |
| 2. Is the hierarchy DISJOINT? | B keeps membership clean | C (rows may sit in several subtype tables) |
| 3. Are there very few extra attributes per subtype AND rare subtype-only queries? | Option A (merged) | Split (B/C) |

**Rules for Each Option**

**Option A — merged table (superclass + all subtype attributes):**
```
EMPLOYEE(empID PK, name, joinDate, salary NULL, hourlyRate NULL, endDate NULL, type)
- Works only when subtypes are almost identical in shape
- Partial hierarchy → type may be NULL (plain superclass rows)
- Overlapping hierarchy → IMPOSSIBLE: one type column cannot hold "both"
```

**Option B — superclass table + per-subclass tables sharing the superclass key:**
```
EMPLOYEE(empID PK, name, joinDate)
FULL_TIME(empID PK + FK→EMPLOYEE, salary)
CONTRACT(empID PK + FK→EMPLOYEE, hourlyRate, endDate)
- One row max per subclass (disjoint enforced)
- Total → every empID appears in exactly one subtype table
```

**Option C — like B, but membership is not exclusive:**
```
EMPLOYEE(empID PK, name)
SALARIED(empID PK + FK→EMPLOYEE, salary)
HOURLY(empID PK + FK→EMPLOYEE, rate)
- The same empID may appear in several subtype tables — the ONLY correct choice for overlapping
```

**Worked Walkthrough (Scenario 3)**

```
1. Read the constraint words: "Some employees are BOTH" → OVERLAPPING.
2. Overlapping kills A (one type column) and forces exclusive? No → B invalid.
3. Choose C. Write EMPLOYEE + one table per subclass, key = empID everywhere.
4. Verify: an employee paid salary AND hours appears in SALARIED and HOURLY. ✓
```

**Traps To Dodge**

❌ **Option A for overlapping hierarchies** — no single column can record "belongs to both".❌ **Option B for overlapping** — B assumes one-row-per-subclass; overlapping rows would need duplicates.❌ **New primary keys inside subtypes** — subclasses always INHERIT the superclass key; `FULL_TIME(ftID, empID, salary)` is a redundancy trap.❌ **Ignoring query patterns** — merged tables win when subtype columns are rarely used; split tables win when subtype data is often queried alone.

### Code

```sql
-- Scenario 3 (OVERLAPPING hierarchy) → Option C
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
-- INSERT INTO Hourly   (empID, rate)  VALUES (7, 1500);
```

```sql
-- Scenario 2 (DISJOINT + PARTIAL, sparse subtype attributes) → Option A
CREATE TABLE Vehicle (
  regNo        VARCHAR(10) PRIMARY KEY,
  make         VARCHAR(30) NOT NULL,
  model        VARCHAR(30) NOT NULL,
  seats        SMALLINT,     -- NULL for trucks AND for plain vans
  loadCapacity DECIMAL(8, 2) -- NULL for cars AND for plain vans
);

-- Plain vans: both subtype columns stay NULL -> partial hierarchy respected
```

## 4.2 Identify the Weak Entity and Its Discriminator

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Weak Entities & Keys |
| **Companies** | Google, Microsoft |

### Problem Statement

For each scenario, identify the weak entity, its owner, the partial key (discriminator), and the composite primary key the relational table will need. Prove the choice with the "can it be identified alone?" test.

### Examples

| Input | Output | Explanation |
|---|---|---|
| A hospital has many wards, each ward has numbered beds. Bed numbers restart at 1 in every ward. | Weak entity: BED. Owner: WARD. Partial key: bedNo. Composite PK: (wardID, bedNo). Reason: 'Bed 3' alone is meaningless — it only identifies a bed inside a specific ward. | Bed numbering restarts per ward, so without wardID the bed cannot be identified — the signature of a weak entity. The composite key (wardID, bedNo) is globally unique. |
| An online order contains multiple line items. Line items are numbered 1, 2, 3... inside each order. Order numbers are unique across the whole system. | Weak entity: LINE_ITEM. Owner: ORDER. Partial key: itemNo. Composite PK: (orderID, itemNo). No line item can exist without its order — and deleting the order must delete its items. | itemNo restarts in every order, so identity requires orderID as well — classic weak entity. The identifying relationship ORDER—has—LINE_ITEM demands ON DELETE CASCADE in the schema. |
| A delivery company issues tracking numbers. Every parcel's tracking number is unique globally, even across different customers. | No weak entity here. PARCEL is STRONG — its trackingNo identifies it without any owner. The link CUSTOMER—ships—PARCEL is an ordinary relationship, not an identifying one. | The trap: a parcel without a customer makes little business sense, but it is still identifiable on its own. Being logically dependent on an owner is NOT the same as needing the owner's key to be identified. |

### Constraints

- Answer with: weak entity, owner, partial key, composite key — in that order.
- Justify with the "identified alone?" test in one sentence.
- If there is no weak entity, say STRONG with its own key and prove it.
- Remember the cascade implication when the owner is deleted.

### Approach

**The Three-Question Interrogation**

Run every candidate entity through this gauntlet:

```
Q1: Can the candidate be IDENTIFIED using only its own attributes?
    YES → STRONG entity. Done. (parcel can — by trackingNo)
    NO  → continue

Q2: Does the candidate have a KEY that includes ANOTHER entity's key?
    YES → WEAK entity — owner = that other entity

Q3: What is the partial key (unique only within one owner's family)?
    → The part of the composite key NOT borrowed from the owner
```

**Filling The Answer Table**

| Piece | Where to find it | Example (hospital) |
|---|---|---|
| Weak entity | The answer to Q1 = NO | BED |
| Owner | Q2's other entity — the strong one side of the identifying relationship | WARD |
| Partial key | The attribute that restarts per owner | bedNo |
| Composite PK | ownerPK + partial key | (wardID, bedNo) |
| Cascade | Owner delete → weak rows delete | ON DELETE CASCADE |

**Signal Words — What They Mean**

| Phrase in the question | Meaning |
|---|---|
| "number restarts per..." / "numbered inside each..." | Partial key → weak entity ahead |
| "unique across the whole system" | Strong — has its own key |
| "cannot exist without..." / "dies with..." | Weak flavour — but still PROVE Q1 |
| "identifying relationship" | Double diamond → weak entity on the many side |

**Traps To Dodge**

❌ **Deciding "weak" from business sense alone** — a parcel needs a customer to *make sense* but survives on trackingNo alone → strong.❌ **Using only the partial key in the PK** — "bedNo" alone collides across wards; you need (wardID, bedNo).❌ **Giving the weak entity a surrogate id** — a synthetic `bedID` would technically work but destroys the identifying-relationship semantics the examiner wants.❌ **Forgetting the cascade** — owner deletion must ripple into weak rows; an FK without ON DELETE CASCADE leaves orphans.

### Code

```sql
-- Hospital example: BED is a weak entity of WARD
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
);
```
