# DBMS Learning Document — Subqueries & Set Operations

> A comprehensive, student-friendly guide to Subqueries & Set Operations — the foundation every DBMS course stands on.
> Master nested subqueries, union, intersect, except, with exam-style problems and fully worked solutions.

---

# 10. Subqueries & Set Operations

> **Lesson Overview:** Queries inside queries — scalar, column and correlated subqueries with EXISTS and ANY — then stack result sets on top of each other with UNION, INTERSECT, and EXCEPT.
> - **Category:** Relational Model & SQL
> - **Difficulty:** Hard
> - **Problems:** 2

---

## 10.1 Nested Subqueries

### Why Nest Queries?

Real questions come in two steps: "find the department with the lowest budget, then list its employees". You could do it with two queries and copy-paste — or wrap the first as a **subquery** inside the second. The inner query runs first and hands its result to the outer query.

### The Three Flavours Of Subqueries

| Flavour | Returns | Usable where | Example use |
|---|---|---|---|
| **Scalar** | ONE value (one row, one column) | anywhere a value fits | ```WHERE salary > (SELECT AVG(salary) ...)``` |
| **Column (IN)** | One column, many rows | ```IN``` lists | ```WHERE deptID IN (SELECT deptID ...)``` |
| **Row** | One row, many columns | row comparisons | ```WHERE (a, b) = (SELECT ...)``` |
| **Table** | Whole result set | FROM-clause / derived tables | ```FROM (SELECT ...) AS t``` |

### Non-Correlated vs Correlated — The Big Brainer

| | Non-correlated | Correlated |
|---|---|---|
| Runs | ONCE, then the outer query uses the stored result | **ONCE PER ROW** of the outer query |
| References the outer query? | NO | YES — sees the current outer row |
| Speed | Fast (single execution) | Slow (runs n times) |
| Example | ```WHERE salary > (SELECT AVG(salary) FROM Employees)``` | ```WHERE salary > (SELECT AVG(salary) FROM Employees e2 WHERE e2.dept = e1.dept)``` |
| Count of executions | 1 | 1 + rows of outer query |

### The Correlated Pattern — "Compared To MY OWN"

```sql
SELECT name, salary, dept
FROM Employees e1
WHERE salary > (
  SELECT AVG(salary)
  FROM Employees e2
  WHERE e2.dept = e1.dept   -- the correlation: link to the OUTER row
);
-- For EVERY row of e1, the inner query re-averages e1.dept's salaries.
```

Execution trace:

```
ROW 1 (IT):    inner → AVG of IT salaries   → compare   ✓/✗
ROW 2 (HR):    inner → AVG of HR salaries   → compare   ✓/✗
ROW 3 (IT):    inner → AVG of IT salaries   → compare   ✓/✗   (recomputed!)
```

### EXISTS, ANY, ALL — Readers Of The Result

| Operator | Meaning | Example |
|---|---|---|
| EXISTS | true if the subquery returns ≥ 1 row | ```WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.cid = c.cid)``` |
| NOT EXISTS | true if it returns nothing | customers with zero orders |
| x > ANY(sub) | true if x beats AT LEAST ONE value | above at least one |
| x > ALL(sub) | true if x beats EVERY value | above every one, i.e. the max |

**Mnemonic:** ANY = "at least one" (like OR), ALL = "every one" (like AND).

### Common Traps

❌ **= with a multi-row subquery** — ```= (SELECT ...)``` needs exactly one row; more → error. Use IN.❌ **Correlated subquery without an alias link** — no e1/e2 relationship means it is run once, and the answer quietly becomes wrong.❌ **Perf surprises** — correlated subqueries re-run per outer row; with big tables that is expensive.❌ **EXISTS vs IN with NULLs** — IN behaves oddly with NULL lists; EXISTS is the safer truth-test.

### Quick Self-Test (answers at the bottom)

1. A correlated subquery executes: (a) once (b) once per outer row (c) never
2. ```WHERE x > ALL(sub)``` means x beats: (a) at least one value (b) every value (c) zero values
3. ```WHERE dept = (SELECT ...)``` fails when the subquery returns: (a) one row (b) multiple rows (c) NULL
4. Customers with zero orders test best with: (a) NOT EXISTS (b) = 0 (c) MAX

**Answers:** 1→b, 2→b, 3→b, 4→a.

## 10.2 UNION, INTERSECT, EXCEPT

### Set Operations — Result Sets Meet Result Sets

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

**Watch this trap:** ```SELECT name UNION SELECT city``` is legal — the position matters, not the column name or table.

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

- ORDER BY in a set operation goes at the **very end**: ```SELECT ... UNION SELECT ... ORDER BY name```
- ORDER BY inside one half of the set ("top 3 from each side") needs a subquery on each side
- Operators chain: ```A UNION B INTERSECT C``` — parentheses when intent matters (INTERSECT binds first in most engines)

### Worked Example

Employees with >8 years OR in IT:

| Query A: senior list | Query B: IT list | UNION | UNION ALL | INTERSECT | A EXCEPT B |
|---|---|---|---|---|---|
| Aarav, Meera | Meera, Ravi | Aarav, Meera, Ravi | Aarav, Meera, Meera, Ravi | Meera | Aarav |

### Common Traps

❌ **Different column counts in the two SELECTs** — the pairing rule; count columns first.❌ **UNION when repeats must show** — totals per day want UNION ALL.❌ **ORDER BY inside each half** — meaningless; ORDER BY lands once, at the end.❌ **Merging by magic** — the operators pair columns by POSITION: (name, salary) ∪ (city, score) merges name-with-city if their types match. Check the types.

### Quick Self-Test (answers at the bottom)

1. UNION removes: (a) duplicates (b) NULLs (c) columns
2. Duplicates must appear → use: (a) UNION (b) UNION ALL (c) INTERSECT
3. A EXCEPT B keeps: (a) both (b) A not in B (c) B not in A
4. ORDER BY with set operations goes: (a) inside each part (b) at the very end (c) nowhere

**Answers:** 1→a, 2→b, 3→b, 4→b.

---

# 11. Problems

## 11.1 Write a Query Using a Correlated Subquery

| | |
|---|---|
| **Difficulty** | Hard |
| **Subtopic** | Nested Subqueries |
| **Companies** | Amazon, Google, Oracle |

### Problem Statement

For each question below, write a single query using a correlated subquery (or EXISTS/NOT EXISTS where the question demands it). The inner query MUST reference the outer row — prove the correlation with the aliases. Table: Employees(empID, name, salary, dept).

### Examples

| Input | Output | Explanation |
|---|---|---|
| Employees: (1, Aarav, 60000, IT), (2, Meera, 50000, IT), (3, Ravi, 45000, HR), (4, Sneha, 70000, HR). Question: employees earning MORE than the average of their OWN department. | SELECT name FROM Employees e1 WHERE salary > (SELECT AVG(salary) FROM Employees e2 WHERE e2.dept = e1.dept); → Aarav (60000 > avg 55000), Sneha (70000 > avg 57500). | The inner query uses e1.dept — that is the correlation. For each outer row the department average is recomputed: IT avg = (60000+50000)/2 = 55000 → only Aarav beats it; HR avg = 57500 → only Sneha beats it. Without the e2.dept = e1.dept link it would be the wrong single-global-average query. |
| Same table. Question: find departments that have at least one employee earning above 60,000 — using EXISTS. | SELECT DISTINCT dept FROM Employees e1 WHERE EXISTS (SELECT 1 FROM Employees e2 WHERE e2.dept = e1.dept AND e2.salary > 60000); → IT, HR. | EXISTS returns TRUE as soon as one matching row exists — the 1 in SELECT 1 is a placeholder (never materialised). The correlation e2.dept = e1.dept ties each outer row to its own department; the salary condition lives in the inner WHERE. |
| Same table. Question: employees who earn more than EVERYONE in OTHER departments — strictly above the global best outside their own department. | SELECT name FROM Employees e1 WHERE salary > ALL (SELECT salary FROM Employees e2 WHERE e2.dept <> e1.dept); | The inner query collects the salaries of all departments EXCEPT e1's own; salary > ALL(...) means the employee beats every one of those. The <> e1.dept makes it correlated; ALL turns the comparison into 'greater than the max'. |

### Constraints

- The inner query must reference the outer alias — otherwise it is NOT correlated; say which clause does it.
- Use >ALL / >ANY / EXISTS / NOT EXISTS exactly where the question maps to them.
- SELECT 1 inside EXISTS is idiomatic — explain it.
- Verify the row outputs against the recomputed inner values, as in the examples.

### Approach

**The Correlated Subquery Recipe**

```
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
```

**Why The Aliases Matter**

```
WRONG (not correlated):
   WHERE salary > (SELECT AVG(salary) FROM Employees)        -- global average, once

RIGHT (correlated):
   WHERE salary > (SELECT AVG(salary) FROM Employees e2
                   WHERE e2.dept = e1.dept)                  -- per-row average
```

Execution for the first example:

```
ROW Aarav (IT):    inner → AVG(IT) = 55000 → 60000 > 55000 ✓ keep
ROW Meera (IT):    inner → AVG(IT) = 55000 → 50000 > 55000 ✗ drop
ROW Ravi (HR):     inner → AVG(HR) = 57500 → 45000 > 57500 ✗ drop
ROW Sneha (HR):    inner → AVG(HR) = 57500 → 70000 > 57500 ✓ keep
```

**Traps To Dodge**

❌ **Missing the correlation** — the inner query without e1.dept runs once and answers a different question.❌ **Same alias on both copies** — e1 vs e2 must differ or the engine cannot resolve the link.❌ **EXISTS returning data** — SELECT 1 (or *): only existence matters, never row contents.❌ **Perf blindness** — correlated queries rerun per row; mention WHERE possible.

### Code

```sql
-- Q1: above the average of one's OWN department (correlated)
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
);
```

## 11.2 Combine Results Using Set Operators

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | UNION, INTERSECT, EXCEPT |
| **Companies** | Google, Oracle, Microsoft |

### Problem Statement

Answer each question with one query using UNION, UNION ALL, INTERSECT, or EXCEPT. Both SELECT halves must return the same number of columns with compatible types. Tables: Products(productCode, launchYear, category), Q1Sales, Q2Sales, Catalogue, Ordered (each with a productCode column). In every set operation columns pair by POSITION, not by name.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Products launched before 2020: (P1, 2018), (P2, 2019). Products launched after 2024: (P2, 2025), (P3, 2026). Question: the DISTINCT list of all products launched outside 2020–2024. | SELECT productCode FROM Products WHERE launchYear < 2020 UNION SELECT productCode FROM Products WHERE launchYear > 2024; → P1, P2, P3 (unique). | P2 appears in BOTH halves — UNION removes the duplicate, giving one P2 row. UNION ALL would have returned P2 twice: P1, P2, P2, P3. |
| Products sold in Q1: {P1, P2, P3}. Products sold in Q2: {P2, P3, P4}. Question: products sold in BOTH quarters. | SELECT productCode FROM Q1Sales INTERSECT SELECT productCode FROM Q2Sales; → P2, P3. | INTERSECT keeps only rows that exist in both result sets. P1 and P4 miss one half each; P2 and P3 make both. Duplicates inside one half collapse automatically. |
| Catalogue products: {P1, P2, P3, P4}. Products ever ordered: {P2, P4, P5}. Question: products in the catalogue that have NEVER been ordered. | SELECT productCode FROM Catalogue EXCEPT SELECT productCode FROM Ordered; → P1, P3. | EXCEPT keeps ONLY the left side's rows that are missing from the right side. P2 and P4 are ordered → excluded; P5 is not in the catalogue at all → irrelevant; P1 and P3 survive. |

### Constraints

- Both halves must return the same number of columns — violations are the classic hidden trap.
- UNION vs UNION ALL: choose with the duplicate question in mind and justify.
- EXCEPT = left minus right — its direction is part of the answer.
- ORDER BY lands once at the very end of the whole set expression.

### Approach

**Operator → Question Word Map**

| Question words | Operator |
|---|---|
| "distinct list of all products from either" | UNION |
| "including every occurrence / total over days" | UNION ALL |
| "sold in BOTH ... and ..." | INTERSECT |
| "in A but NEVER in B / not ordered / missing" | EXCEPT (left = keep-side) |
| "at least one of the two lists" | UNION |

**The Position-Pairing Rule**

```
CHECK before typing:
  1. COUNT the columns of the left SELECT
  2. COUNT the columns of the right SELECT
  3. MATCH types per position (VARCHAR↔VARCHAR, INT↔INT)
  4. Column NAMES do NOT need to agree — positions do!
```

**Worked Walkthrough — The Never-Ordered Products**

```
Catalogue = {P1, P2, P3, P4}      Ordered = {P2, P4, P5}
Keep-criterion: in Catalogue but not in Ordered

P1 ∈ C, ∉ O  → keep
P2 ∈ C, ∈ O  → drop
P3 ∈ C, ∉ O  → keep
P4 ∈ C, ∈ O  → drop
P5 ∉ C       → not in the game

Result: P1, P3
```

**Traps To Dodge**

❌ **Swapping EXCEPT's direction** — "catalogue minus ordered" answers "never ordered"; "ordered minus catalogue" answers something else entirely.❌ **UNION where duplicates count** — a daily-log total with UNION loses every repeated entry.❌ **Different column counts** — the pairing rule; a 2-column left vs 1-column right errors immediately.❌ **ORDER BY scatter** — a single ORDER BY at the end of the combined statement; halves never carry their own sorts (unless inside subqueries).

### Code

```sql
-- Q1: outside 2020-2024, distinct (UNION)
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
ORDER BY productCode;
```
