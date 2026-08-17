# DBMS Learning Document — Relational Model Basics

> A comprehensive, student-friendly guide to Relational Model Basics — the foundation every DBMS course stands on.
> Master keys (candidate, primary, foreign, super), relational algebra basics, with exam-style problems and fully worked solutions.

---

# 5. Relational Model Basics

> **Lesson Overview:** The formal foundations underneath every SQL table — super keys, candidate keys, primary keys and foreign keys — and the relational algebra operators that serve as SQL's mathematical engine.
> - **Category:** Relational Model & SQL
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 5.1 Keys (Candidate, Primary, Foreign, Super)

### Every Row Needs A Name

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

```
1. UNIQUENESS  — no two rows share the same value
2. MINIMALITY  — delete any column and uniqueness breaks
```

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

```
UNIQUE columns → empID, pan, phone (each alone can name a row)
CANDIDATE keys  → empID, pan, phone (single-column, minimal by default)
PRIMARY key     → the one we pick: empID
ALTERNATE keys  → pan, phone
SUPER keys      → any superset: (empID, name), (pan, name, deptID), ...
FOREIGN key     → deptID → DEPARTMENT.deptID
```

### Common Traps

❌ **Calling (empID, name) a candidate key** — it is unique but NOT minimal; only super key.❌ **Thinking the primary key must be a single column** — composite primary keys are perfectly normal.❌ **Foreign key must match column names** — no; only the referenced values must exist.❌ **Believing every unique column is the primary key** — unique columns are candidates; you *choose* one.❌ **Shipment tracking numbers as primary keys in every scenario** — stability and size matter, not just uniqueness.

### Quick Self-Test (answers at the bottom)

1. In EMP(empID, pan, phone), how many candidate keys exist? (a) 1 (b) 2 (c) 3
2. (empID, name) is what kind of key? (a) candidate (b) super (c) primary
3. A composite key always has: (a) one column (b) two or more columns (c) a foreign key
4. Which column is the FK in EMP(empID, pan, deptID)? (a) empID (b) pan (c) deptID

**Answers:** 1→c, 2→b, 3→b, 4→c.

## 5.2 Relational Algebra Basics

### SQL Is Sugar On Top Of Algebra

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
| Notation | σ_condition(table) | π_columns(table) |
| Example | σ_salary>50000(EMP) — *all columns, only rich rows* | π_name(EMP) — *only names, all rows* |
| Duplicates | Kept | **Removed** |

### Reading Algebraic Expressions

```
σ (department = 'Research') (EMPLOYEE)
   └──────── rows only from the Research department ────────┘

π (name, salary) (EMPLOYEE)
   └────── keep only the name and salary columns ────────────┘

π (name) ( σ (salary > 50000) (EMPLOYEE) )
   └─ project  ┘  └──── select ────┘
   = names of employees earning more than 50,000
```

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

❌ **SELECT/PROJECT name clash** — SQL's SELECT does BOTH jobs; algebra splits them. σ = rows, π = columns. Never mix.❌ **π keeps duplicates OUT** — yeah: PROJECT removes duplicate rows in the pure algebra.❌ **× without a purpose** — a cartesian product alone is almost always a bug; joins exist to pair meaningfully.❌ **Expressions read left-to-right** — operators bind to their immediate inner table first; parse inside-out.

### Quick Self-Test (answers at the bottom)

1. σ filters: (a) columns (b) rows (c) tables
2. π removes: (a) columns (b) duplicate rows (c) NULLs
3. A ∪ B contains: (a) rows in both only (b) all rows of A and B, no duplicates (c) only rows of A
4. Which symbol pairs rows on a condition? (a) × (b) ⋈ (c) ρ

**Answers:** 1→b, 2→b, 3→b, 4→b.

---

# 6. Problems

## 6.1 Identify All Candidate Keys

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Keys (Candidate, Primary, Foreign, Super) |
| **Companies** | Google, Oracle, Ibm |

### Problem Statement

Given a relation schema and its set of functional dependencies (FDs), find ALL candidate keys of the relation. Then pick a primary key and list the alternate keys. Use the closure method — compute what each attribute (or attribute set) can determine.

### Examples

| Input | Output | Explanation |
|---|---|---|
| R(A, B, C, D) with FDs: A → B, B → C, C → D. Which sets are candidate keys? | Candidate keys: {A} only. Closure(A) = {A, B, C, D} — A determines everything alone, and no smaller set exists (single column). Alternate keys: none (there is only one candidate). | Following the chain A→B→C→D, A's closure covers all four attributes, so {A} is the sole candidate key. Single-column keys are automatically minimal. |
| R(A, B, C, D) with FDs: AB → C, C → D, D → A. Find all candidate keys. | Candidate keys: {AB} and {BC}. Check: closure(AB) = {A,B,C,D}; closure(BC) = {B,C,D,A} = all four. {A}, {B}, {C}, {D} alone each FAIL to cover everything — try them and see. | BC is a surprising candidate key — neither B nor C is a key alone, but together they determine D → A → everything. This is why you must compute closures for every minimal attribute set, not just the obvious ones. |
| R(EMP_ID, PAN, NAME, DEPT) with FDs: EMP_ID → NAME, EMP_ID → DEPT, PAN → NAME, NAME → DEPT. Find all candidate keys. | Candidate keys: {EMP_ID} and {PAN}. Both single columns each determine the rest (EMP_ID → NAME → DEPT; PAN → NAME → DEPT). Alternate keys: whichever of EMP_ID/PAN you do not choose as primary. | Two candidate keys compete; you pick one as PRIMARY KEY and the other becomes an ALTERNATE key. NAME and DEPT alone are never keys — they only ever appear on the right-hand side of FDs. |

### Constraints

- Compute the closure of every candidate set — never guess from the FDs alone.
- A candidate key must pass BOTH tests: uniqueness (closure covers all attributes) and minimality (no proper subset works).
- Single-column keys are automatically minimal — you still must verify their closure.
- Report all candidate keys, then mark the primary and alternate keys clearly.

### Approach

**The Closure Machine**

The closure of a set X is everything X can determine, directly or through chains. Compute it by looping:

```
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
```

**Candidate-Key Algorithm**

```
INPUT  : attributes Attrs, functional dependencies FDs
OUTPUT : list of candidate keys

1. FOR each single attribute A in Attrs:
       IF closure(A) covers ALL attributes → {A} is a candidate key
2. FOR each pair (A, B), triple (A, B, C), ... of the REMAINING attributes:
       IF closure(set) covers ALL attributes
          AND no proper subset of the set is itself a key → candidate key
3. Sort the candidates by size; the smallest are what interviews expect
```

**Worked Trace — The {AB, BC} Example**

```
FDs: AB→C, C→D, D→A        Attrs: A B C D

closure(A)  = A            → ✗ incomplete
closure(B)  = B            → ✗
closure(C)  = C+D+A        → ✗ (C, D, A — B missing!)
closure(D)  = D+A          → ✗
closure(AB) = A B →(AB→C) C →(C→D) D   → ✓ ALL FOUR
closure(BC) = B C →(C→D) C D... wait:
           B C → C→D gives D → D→A gives A → now A B C D ✓
No proper subset of {AB} or {BC} works → BOTH are candidate keys
```

**Traps To Dodge**

❌ **Stopping after the first key** — the question says ALL candidate keys; keep scanning pairs and triples.❌ **Forgetting minimality** — {ABC} may cover everything, but if {AB} already does, {ABC} is only a super key.❌ **Attributes on the RHS only** — an attribute that never appears on a left-hand side (like NAME → DEPT direction traps) can still join a composite key — test it anyway.❌ **Single-column shortcuts** — "obviously" non-key columns can become keys through chains (like BC). Compute, don't guess.

### Code

```python
# Find all candidate keys of a relation
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
# Output: [{'B', 'C'}, {'A', 'B'}]  -> both are candidate keys
```

## 6.2 Write a Relational Algebra Expression

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Relational Algebra Basics |
| **Companies** | Amazon, Google |

### Problem Statement

Translate each English query into a relational algebra expression using σ, π, ×/⋈, and set operators. Use the tables EMPLOYEE(EID, ENAME, SALARY, DNO) and DEPARTMENT(DNO, DNAME, LOCATION).

### Examples

| Input | Output | Explanation |
|---|---|---|
| List the names of all employees who earn more than 50,000. | π_ENAME( σ_SALARY > 50000 (EMPLOYEE) ) | "Name" is a column → PROJECT (π). "Earn more than 50,000" is a row filter → SELECT (σ). The expression reads inside-out: filter the rows first, then keep the column. |
| List the names of employees who work in the department 'Research'. (EMPLOYEE has an FK DNO; DEPARTMENT has DNO and DNAME.) | π_ENAME( EMPLOYEE ⋈ ( σ_DNAME = 'Research' (DEPARTMENT) ) ) | The filter uses DNAME, owned by DEPARTMENT — so first select the Research row from DEPARTMENT, join it to EMPLOYEE on DNO (the natural link), then project ENAME. Three operators: σ → ⋈ → π. |
| List all employee IDs of employees who are NOT in the 'Sales' department. | π_EID(EMPLOYEE) − π_EID( σ_DNAME = 'Sales' (DEPARTMENT ⋈ EMPLOYEE) ) | "NOT" across two sets is the DIFFERENCE (−) operator. The left side is every employee ID; the right side is the IDs of Sales employees; subtracting leaves everyone else. |

### Constraints

- Write each expression as a single line, operators inside-out: innermost executes first.
- Use σ for row filters, π for column lists, ⋈ for the join, − for difference.
- Join the two tables whenever the filter column lives in the other table.
- Compose operators — a one-operator answer is usually incomplete.

### Approach

**Sentence → Operator Translation**

| English | Operator |
|---|---|
| "names / IDs / salaries of..." | **π** (pick the column) |
| "...who earn / who work / where..." | **σ** (filter rows) |
| "...and we need BOTH tables' data..." | **⋈** (join) |
| "...who are NOT / except / minus..." | **−** (difference) |
| "...in either list..." | **∪** (union) |

**The Assembly Order**

```
1. Underline the COLUMNS wanted  → that list becomes π(...)
2. Underline the CONDITIONS      → each becomes σ_cond below π
3. If a condition's column lives in ANOTHER table → join it in first:
       σ (that table's filter) FIRST, then ⋈, then π
4. "NOT / except" over two ideas → build both halves, subtract: A − B
5. Read the finished expression inside-out and sanity-check aloud
```

**Worked Walkthrough — The Research Query**

```
Sentence: "names of employees who work in the department 'Research'"

Columns wanted    : ENAME        → π_ENAME at the front
Condition        : DNAME = Research → σ_DNAME = 'Research' — but DNAME is in DEPARTMENT!
Fix              : select the Research row first:  σ_DNAME = 'Research' (DEPARTMENT)
Join             : EMPLOYEE ⋈ (that result)      → matches rows on DNO
Finish           : π_ENAME( EMPLOYEE ⋈ ( σ_DNAME = 'Research' (DEPARTMENT) ) )
```

**Traps To Dodge**

❌ **σ on a column from the wrong table** — σ_DNAME='Research'(EMPLOYEE) is invalid algebra: the column does not exist there. Join first.❌ **π before σ** — π discards columns; if you dropped DNO before the join, the join becomes impossible.❌ **− written as ≠** — "not in Sales" is set difference, not a filter that compares a non-existent column.❌ **Skipping brackets** — never rely on operator precedence you haven't specified; bracket everything.

### Code

```sql
-- The same three queries, as the SQL the algebra maps to

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
WHERE d.DNAME = 'Sales';
```
