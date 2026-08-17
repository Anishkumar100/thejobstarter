# DBMS Learning Document — Normal Forms (1NF- BCNF)

> A comprehensive, student-friendly guide to Normal Forms (1NF- BCNF) — the foundation every DBMS course stands on.
> Master 1nf, 2nf and 3nf, bcnf, with exam-style problems and fully worked solutions.

---

# 12. Normal Forms (1NF- BCNF)

> **Lesson Overview:** The normalization ladder — climb from messy tables with repeating groups and duplicate data (1NF) through partial and transitive dependency removal (2NF, 3NF) up to BCNF, where every determinant is a key and nothing can be split away.
> - **Category:** Normalization & Schema Design
> - **Difficulty:** Hard
> - **Problems:** 2

---

## 12.1 1NF, 2NF and 3NF

### The Normalization Ladder

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

❌ **Skipping 1NF** — repeating groups hide partial AND transitive problems; fix atomicity first.❌ **Calling any multi-column key a partial dependency** — dependence must be on a true *part* of the key, not the whole key.❌ **Splitting away the key column** — every extracted table must keep the key it depends on.❌ **Forgetting dependency preservation** — the split must keep the original FDs enforceable; a split is useless if the FD is lost.

### Quick Self-Test (answers at the bottom)

1. A non-atomic cell like "DBMS, OS" violates: (a) 2NF (b) 1NF (c) 3NF
2. Partial dependency means: (a) half the table is empty (b) non-prime depends on part of a composite key (c) NULL values
3. EMP → DeptID → DeptName violates: (a) 1NF (b) 2NF (c) 3NF
4. A table with a single-attribute key that is 1NF is automatically: (a) 2NF (b) 5NF (c) non-normalized

**Answers:** 1→b, 2→b, 3→c, 4→a.

## 12.2 BCNF

### BCNF in One Line

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

```
INPUT  : relation attributes U, FDs F
OUTPUT : boolean (in BCNF?)

FOR each non-trivial FD  X → Y in F:
    IF closure(X, F) =/= U:
        RETURN FALSE    // left side is not a superkey
RETURN TRUE
```

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

❌ **Confusing BCNF with 3NF** — BCNF demands superkeys; prime-attribute determinants pass 3NF but can fail BCNF.❌ **Skipping the closure check** — "left side is part of the key" is not enough; X must close to the ENTIRE relation.❌ **Losing dependencies during decomposition** — if an FD cannot be enforced in any resulting table, the normal form was achieved only by losing semantics.❌ **Forgetting losslessness** — tables must always be joinable back to the original without phantom rows; the shared key column guarantees this in the X-split pattern.

### Quick Self-Test (answers at the bottom)

1. BCNF requires every non-trivial FD to have: (a) a primary key (b) a superkey left side (c) two attributes
2. R (A, B, C) with AB → C and C → B is: (a) 3NF only (b) BCNF (c) 2NF only
3. Decompose on violating X → Y: table 2 keeps: (a) X only (b) U − Y + X (c) Y only
4. A decomposition must be: (a) lossless and dependency-preserving where possible (b) faster (c) smaller

**Answers:** 1→b, 2→a, 3→b, 4→a.

---

# 13. Problems

## 13.1 Normalize a Relation to 3NF

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | 1NF, 2NF and 3NF |
| **Companies** | Amazon, TCS, Infosys |

### Problem Statement

ORDER_DETAILS (OrderID, OrderDate, CustomerID, CustomerName, ProductID, ProductName, Qty) with FDs: OrderID → OrderDate, CustomerID → CustomerName, ProductID → ProductName, and (OrderID, ProductID) → Qty. Walk the table through 1NF → 2NF → 3NF, list every decomposition with its key, and show the final schema with foreign keys. Also explain where each original FD lives after normalization.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Start table (a few rows): (501, 2026-08-01, C1, Priya, P1, Bolt, 2), (501, 2026-08-01, C1, Priya, P2, Nut, 5), (502, 2026-08-02, C2, Ravi, P1, Bolt, 1) | 1NF check: pass (all atomic). 2NF: ProductName depends only on ProductID (part of the key) — extract PRODUCT. CustomerName depends only on CustomerID — extract CUSTOMER. 3NF: OrderDate already depends on the key OrderID alone — no transitive chain remains. | The only column fully dependent on the whole key (OrderID, ProductID) is Qty; CustomerName, OrderDate, and ProductName were hiding partial dependencies. |
| The final 3NF schema to produce | CUSTOMER (CustomerID PK, CustomerName); PRODUCT (ProductID PK, ProductName); ORDER_HDR (OrderID PK, OrderDate, CustomerID FK → CUSTOMER); ORDER_ITEM (OrderID FK, ProductID FK, Qty, PK = (OrderID, ProductID)) | Each extracted table has its own key; ORDER_ITEM links products to orders and keeps the quantity. |
| Where does each original FD end up? | OrderID → OrderDate lives in ORDER_HDR; CustomerID → CustomerName in CUSTOMER; ProductID → ProductName in PRODUCT; (OrderID, ProductID) → Qty in ORDER_ITEM — every FD preserved | Normalization here is dependency-preserving: no FD needed a join across tables to be enforced. |

### Constraints

- Decompose in order: 1NF first, then partials (2NF), then transitives (3NF)
- Every final table needs exactly one key (PK) and every FK must reference an existing PK
- Do not lose any of the four original FDs
- You may join the four tables to fully reconstruct the original

### Approach

**The Normalization Checklist**

1. **1NF**: every cell atomic, no repeating groups. (This table already passes.)
2. **2NF**: find non-prime columns depending on PART of the composite key.
3. **3NF**: find non-prime columns depending on another non-prime column.

**Finding Violations — Dependency Table**

| FD | Left side | Is it a key? | Problem? |
|---|---|---|---|
| OrderID → OrderDate | OrderID | part of key | partial |
| CustomerID → CustomerName | CustomerID | not a key at all | partial |
| ProductID → ProductName | ProductID | part of key | partial |
| (OrderID, ProductID) → Qty | full key | fine | none — keep |

**The Split (Pseudocode)**

```
FOR each violating FD  X → Y:
    NEW table = (X, Y)  with key X
    REMOVE Y from the original table (keep X as a foreign key)
```

| Step | Table | Key |
|---|---|---|
| out | CUSTOMER (CustomerID, CustomerName) | CustomerID |
| out | PRODUCT (ProductID, ProductName) | ProductID |
| out | ORDER_HDR (OrderID, OrderDate, CustomerID) | OrderID |
| kept | ORDER_ITEM (OrderID, ProductID, Qty) | (OrderID, ProductID) |

**Code Solution — Final 3NF Schema (SQL DDL)**

```sql
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
```

### Code

```sql
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
```

## 13.2 Determine if a Relation is in BCNF

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | BCNF |
| **Companies** | Microsoft, Flipkart |

### Problem Statement

For each relation and FD family below, state whether the relation is in BCNF. If not, decompose it using the violating FD so every resulting table is in BCNF, and prove losslessness (a shared key exists between tables). Case 1: R (A, B, C) with AB → C and C → B. Case 2: CourseAlloc (Student, Course, Instructor) with (Student, Course) → Instructor and Instructor → Course. Case 3: EMP (EmpID, DeptID, Role) with EmpID → DeptID and EmpID → Role.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Case 1: R (A, B, C), F = {AB → C, C → B}; also compute the keys first | NOT BCNF. Keys: {AB} and {AC} (both close to ABC). Violation: C → B where {C} is not a superkey. Decompose into BC (B, C) and AC (A, C). | closure(C) = {C, B}, not all of ABC, so C → B violates BCNF. Splitting on C → B gives T1 (B, C) with key {C} and T2 (A, C) with key {A, C}; both are BCNF, but AB → C is lost — it cannot be enforced by any single table, the classic BCNF trade-off (dependency preservation is sacrificed). |
| Case 2: CourseAlloc (Student, Course, Instructor), F = {(Student, Course) → Instructor, Instructor → Course} | NOT BCNF. Key = {Student, Course}. Instructor → Course violates it. Decompose into (Instructor, Course) and (Student, Instructor); join on Instructor recovers everything. | Closure(Instructor) = {Instructor, Course} — not the whole table, so it violates BCNF. Both pieces are BCNF and the shared Instructor column makes the decomposition lossless. |
| Case 3: EMP (EmpID, DeptID, Role), F = {EmpID → DeptID, EmpID → Role} | BCNF. Key = {EmpID}; every FD left side is the superkey {EmpID}. | Both FDs have EmpID, whose closure is every attribute, on the left — the BCNF test passes without any splitting. |

### Constraints

- Always compute candidate keys BEFORE judging BCNF
- A non-trivial FD with a left side that is not a superkey is an automatic violation
- When decomposing, table 1 = X ∪ Y and table 2 = (all attributes − Y) ∪ X
- Show the shared column that makes the join lossless

### Approach

**BCNF Test (Pseudocode)**

```
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
```

**Closing Every Left Side — Case 1**

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

**Final Check Table for All Cases**

| Case | Keys | Violator FD | BCNF? | Split |
|---|---|---|---|---|
| 1 | {AB}, {AC} | C → B | no | (B, C), (A, C) |
| 2 | {Student, Course} | Instructor → Course | no | (Instructor, Course), (Student, Instructor) |
| 3 | {EmpID} | none | YES | none needed |

**Code Solution — SQL DDL for Case 2 fix**

```sql
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
```

### Code

```sql
CREATE TABLE INSTRUCTOR_COURSE (
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
JOIN INSTRUCTOR_COURSE ic ON ic.Instructor = si.Instructor;
```

```python
def bcnf_check(attrs, fds):
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
print(ok, violator)  # False ({'C'}, {'B'}) -> split on C->B
```
