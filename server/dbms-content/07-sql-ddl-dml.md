# DBMS Learning Document — SQL DDL & DML

> A comprehensive, student-friendly guide to SQL DDL & DML — the foundation every DBMS course stands on.
> Master create, alter, drop statements, insert, update, delete, with exam-style problems and fully worked solutions.

---

# 7. SQL DDL & DML

> **Lesson Overview:** The first SQL you will ever run — create and destroy the skeleton of a database with CREATE TABLE and constraints, then fill it with INSERT, UPDATE, and DELETE.
> - **Category:** Relational Model & SQL
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 7.1 CREATE, ALTER, DROP Statements

### DDL — The Database Skeleton

**DDL (Data Definition Language)** is the part of SQL that creates, changes, and removes the *structure* of the database — not the data inside it. Three verbs rule this world: CREATE, ALTER, DROP.

### CREATE TABLE — The Blueprint

```sql
CREATE TABLE Employee (
  empID     INT PRIMARY KEY,
  name      VARCHAR(50) NOT NULL,
  salary    DECIMAL(10, 2),
  hireDate  DATE DEFAULT CURRENT_DATE,
  deptID    INT REFERENCES Department(deptID),
  status    VARCHAR(10) CHECK (status IN ('active', 'inactive'))
);
```

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
| ```ALTER TABLE Employee ADD COLUMN email VARCHAR(100);``` | New column appears on all rows (NULL for existing) |
| ```ALTER TABLE Employee DROP COLUMN status;``` | Permanently removes a column |
| ```ALTER TABLE Employee MODIFY COLUMN name VARCHAR(80);``` | Widens/narrows the type |
| ```ALTER TABLE Employee ADD CONSTRAINT chk_salary CHECK (salary > 0);``` | Adds a named constraint later |

### DROP vs TRUNCATE vs DELETE — The Big Confusion

| | DROP TABLE | TRUNCATE TABLE | DELETE FROM |
|---|---|---|---|
| Removes | Structure + data + indexes | All data (structure stays) | Chosen rows |
| Can it be rolled back (in most engines)? | Usually no | Usually no | Yes — with a transaction |
| Speed | Instant | Fast | Slower (row by row) |
| WHERE clause | No | No | Yes |
| Kind | DDL | DDL | DML |

### Common Traps

❌ **DROP when you meant TRUNCATE** — one wipes the table definition forever; the other just empties it.❌ **VARCHAR vs CHAR** — variable-length text is VARCHAR; fixed-coded values are CHAR.❌ **CHECK ranges on wrong sides** — ```CHECK (salary > 0)``` rejects zero and negatives; don't invert it.❌ **Foreign keys to missing tables** — the referenced table must exist BEFORE you create the child table.❌ **DECIMAL for money and FLOAT for money** — always DECIMAL for money; FLOAT introduces rounding surprises.

### Quick Self-Test (answers at the bottom)

1. DROP TABLE removes: (a) data only (b) structure + data (c) structure only
2. Which constraint makes a column both NOT NULL and UNIQUE? (a) FOREIGN KEY (b) PRIMARY KEY (c) CHECK
3. Money columns should use: (a) FLOAT (b) DECIMAL (c) VARCHAR
4. ALTER TABLE ... ADD COLUMN: (a) removes data (b) reshapes structure (c) empties the table

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 7.2 INSERT, UPDATE, DELETE

### DML — The Data Mover

DDL builds the skeleton; **DML (Data Manipulation Language)** fills and edits the rows. Three verbs: INSERT, UPDATE, DELETE.

### INSERT — Three Ways To Add Rows

```sql
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
```

**Rule of thumb:** always name the columns. When the table gains a column, unnamed inserts break; named inserts survive.

### UPDATE — Edit With A Target

```sql
-- WITHOUT a WHERE clause: EVERY row gets changed! (usually a disaster)
UPDATE Employee SET salary = salary * 1.10;

-- WITH a WHERE: only the matching rows
UPDATE Employee
SET salary = salary * 1.10, status = 'promoted'
WHERE deptID = 5;
```

**The golden rule: write the WHERE first, then the SET.** If you can't say which rows you mean, you don't understand the statement yet.

### DELETE — Remove With Care

```sql
-- All rows: table survives but is emptied
DELETE FROM Employee;

-- Targeted: only the fired people
DELETE FROM Employee
WHERE status = 'terminated';
```

### Foreign-Key Side Effects — The Ripple

Deleting an ```ON DELETE CASCADE``` parent removes children too; an ```ON DELETE RESTRICT``` parent refuses to die while children exist. Choose per relationship — never delete "blind".

### The Safety Net — Transactions

```sql
BEGIN;
DELETE FROM Employee WHERE status = 'terminated';  -- risky step
ROLLBACK;  -- oops — undo everything
-- or COMMIT;  -- yes — keep it
```

Wrap multi-row damage in a transaction; you can inspect before committing.

### Common Traps

❌ **UPDATE / DELETE without WHERE** — the classic "oops, I deleted the whole table" — every beginner does it once; transactions save you.❌ **INSERT without column names** — the column-order trap; add one column later and everything breaks.❌ **DELETE vs TRUNCATE confusion** — DELETE can be rolled back in a transaction; TRUNCATE usually cannot.❌ **Forgetting FK ripples** — a CASCADE delete removes more rows than your WHERE mentioned; check ```RESTRICT``` vs ```CASCADE``` before writing.

### Quick Self-Test (answers at the bottom)

1. UPDATE without WHERE affects: (a) one row (b) all rows (c) zero rows
2. INSERT with named columns is safer because: (a) it's faster (b) order doesn't matter and defaults fill gaps (c) fewer keystrokes
3. Which can usually be rolled back inside a transaction? (a) TRUNCATE (b) DELETE (c) both
4. CASCADE on delete means: (a) children are deleted too (b) children survive (c) the delete fails

**Answers:** 1→b, 2→b, 3→b, 4→a.

---

# 8. Problems

## 8.1 Write a CREATE TABLE Statement with Constraints

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | CREATE, ALTER, DROP Statements |
| **Companies** | Amazon, Microsoft, Oracle |

### Problem Statement

Write a CREATE TABLE statement for the system described below, enforcing every business rule with the right constraints. Include column types, PRIMARY KEY, FOREIGN KEY (with ON DELETE choice), NOT NULL, UNIQUE, CHECK, and DEFAULT where the rules demand them.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Customers: each has a unique customerID, a mandatory name, a phone that never contains letters, and every customer must have an optional email. Orders: an order number unique per order, a placement date that defaults to today, an amount that must be positive, and every order must reference an existing customer. | CREATE TABLE Customer (customerID INT PRIMARY KEY, name VARCHAR(80) NOT NULL, phone VARCHAR(15) CHECK (phone NOT LIKE '%[^0-9]%'), email VARCHAR(120)); CREATE TABLE Orders (orderID INT PRIMARY KEY, orderDate DATE DEFAULT CURRENT_DATE, amount DECIMAL(10,2) CHECK (amount > 0), customerID INT NOT NULL REFERENCES Customer(customerID) ON DELETE CASCADE); | Every rule maps to one constraint: unique → PRIMARY KEY; mandatory → NOT NULL; positive amount → CHECK; default today → DEFAULT CURRENT_DATE; must reference a customer → FK with NOT NULL; deleting a customer deleting orders → CASCADE. |
| A course registry: course code is unique and looks like 'CS101' (2 letters + 3 digits). Title is mandatory. Credits between 1 and 4. Optional instructor name. Deleting a department must reject while courses exist. | CREATE TABLE Course (code VARCHAR(5) PRIMARY KEY CHECK (code LIKE '[A-Z][A-Z][0-9][0-9][0-9]'), title VARCHAR(100) NOT NULL, credits SMALLINT CHECK (credits BETWEEN 1 AND 4), instructor VARCHAR(50), deptID INT REFERENCES Department(deptID) ON DELETE RESTRICT); | Pattern validation uses CHECK with LIKE; RESTRICT (NO ACTION) makes the department delete fail while courses reference it — history is never silently destroyed. |

### Constraints

- Write complete CREATE TABLE statements — every table mentioned in the scenario.
- Each business rule must visibly map to exactly one constraint — say which.
- Choose ON DELETE deliberately: CASCADE for expendable children, RESTRICT for protected history.
- Watch the order: referenced tables must be created first.

### Approach

**Rule → Constraint Translation**

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

**Assembly Order**

```
1. LIST the tables — one per entity; the referenced ones go first
2. CHOOSE a type per column: INT / DECIMAL(p,s) / VARCHAR(n) / DATE
3. APPLY column constraints: NOT NULL, CHECK, UNIQUE, DEFAULT
4. DECLARE keys: PRIMARY KEY on each table, then FOREIGN KEYs
5. STATE delete behaviour on every FK: CASCADE / SET NULL / RESTRICT
6. CHECK the sentence: for every "must" in the problem — is there a constraint? ✓
```

**Worked Trace On The Customer/Orders Example**

```
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
```

**Traps To Dodge**

❌ **Child before parent** — creating Orders before Customer fails; create referenced tables first.❌ **CHECK without range logic** — ```amount > 0``` allows zero? No — it REJECTS zero; use >= 0 if zero is legal.❌ **VARCHAR for every column** — phones and codes want VARCHAR; money wants DECIMAL.❌ **CASCADE on sacred history** — orders are expendable (cascade ok); audit records are not (RESTRICT).

### Code

```sql
-- SOLUTION: Customer + Orders (full DDL)
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
);
```

```sql
-- SOLUTION: Course registry with pattern + range + RESTRICT
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
);
```

## 8.2 Write DML Statements for a Given Scenario

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | INSERT, UPDATE, DELETE |
| **Companies** | Google, Microsoft, Wipro |

### Problem Statement

For the inventory scenario below, write the exact series of DML statements: the INSERTs for new stock, the UPDATEs for price changes, and the DELETEs for discontinued items. Every statement must target exactly the rows the scenario names — nothing more, nothing less.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Products table: (1, 'Chai', 18), (2, 'Coffee', 45), (3, 'Sugar', 30). Today: a new product (4, 'Salt', 12) arrives; the price of Coffee rises by 10; product 3 is discontinued and must leave the catalog. | INSERT INTO Products VALUES (4, 'Salt', 12); UPDATE Products SET price = price + 10 WHERE productID = 2; DELETE FROM Products WHERE productID = 3; | Each action maps to one statement. INSERT adds the new row; UPDATE applies 'rise by 10' to exactly product 2 via WHERE; DELETE removes only product 3. The new row (4) is untouched by the UPDATE because WHERE named productID = 2. |
| Employee table: (1, 'Aarav', 50000, 'HR'), (2, 'Meera', 60000, 'IT'), (3, 'Ravi', 55000, 'IT'). Promotion: everyone in IT gets +5%; Aarav moves to IT; Ravi resigns. | UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT'; — run BEFORE Aarav moves! UPDATE Employee SET dept = 'IT' WHERE empID = 1; DELETE FROM Employee WHERE empID = 3; | Order matters: Aarav is promoted by +5% only if he is still HR when the IT UPDATE runs. Sequence: raise IT salaries first, then transfer Aarav, then remove Ravi. Wrong order → Aarav's salary misses the raise. |
| Orders table with customerID FK (CASCADE). Customer 5 placed orders 101 and 102. The company is closing customer 5's account. | DELETE FROM Customer WHERE customerID = 5; — the ON DELETE CASCADE removes orders 101 and 102 automatically. (Check the cascade before running: a NON-cascade FK would fail with a constraint error.) | DML must respect FKs. With CASCADE the single DELETE does both jobs; without it the DELETE errors — the correct DML is then two statements (delete orders, then customer) inside a transaction. |

### Constraints

- Write statements in execution order and justify that order.
- Every WHERE clause must name the exact rows the scenario touches.
- Consider FK side effects (CASCADE vs RESTRICT) before writing a DELETE.
- Use transactions around multi-row risky changes — show BEGIN/COMMIT where relevant.

### Approach

**The DML Planning Loop**

```
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
```

**Why Order Nearly Broke Example 2**

```
WRONG (Aarav gets the raise twice? No — once, wrongly):
   UPDATE Employee SET dept = 'IT' WHERE empID = 1;   ← moves Aarav FIRST
   UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT';  ← now includes Aarav

RIGHT:
   UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT';  ← HR only +5%
   UPDATE Employee SET dept = 'IT' WHERE empID = 1;
```

**Traps To Dodge**

❌ **Identifying rows by attributes instead of keys** — "the Coffee product" becomes ```WHERE productID = 2```, not ```WHERE name = 'Coffee'``` (names can repeat).❌ **Order blindness** — a delete that runs before the update that needed that row wrecks the answer.❌ **Ignoring the cascade** — writing ```DELETE FROM Customer``` on a RESTRICT FK errors; the grader wants the children-first approach.❌ **Auto-commit surprise** — without a transaction, a mistaken full-table UPDATE is permanent; show BEGIN/ROLLBACK discipline.

### Code

```sql
-- SOLUTION: Example 1 (Chai/Coffee/Sugar)
INSERT INTO Products VALUES (4, 'Salt', 12);

UPDATE Products SET price = price + 10 WHERE productID = 2;

DELETE FROM Products WHERE productID = 3;
```

```sql
-- SOLUTION: Example 2 (HR/IT promotion — correct order)
BEGIN;

UPDATE Employee SET salary = salary * 1.05 WHERE dept = 'IT';
UPDATE Employee SET dept = 'IT' WHERE empID = 1;
DELETE FROM Employee WHERE empID = 3;

COMMIT;   -- inspect count of affected rows first, then COMMIT or ROLLBACK
```
