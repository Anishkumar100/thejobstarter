# DBMS Learning Document — SQL Joins

> A comprehensive, student-friendly guide to SQL Joins — the foundation every DBMS course stands on.
> Master inner & outer joins, self joins & cross joins, with exam-style problems and fully worked solutions.

---

# 9. SQL Joins

> **Lesson Overview:** Combine two tables into one answer — inner and outer joins that keep unmatched rows, plus the self-join that lets a table talk to itself and the cross join that multiplies everything.
> - **Category:** Relational Model & SQL
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 9.1 Inner & Outer Joins

### Why Joins Exist

Data about one real-world object often lives split across tables — a customer in one, their orders in another. A **join** stitches them back together for a single answer.

### The Four Joins At A Glance

| Join | Unmatched left rows | Unmatched right rows |
|---|---|---|
| INNER JOIN | Dropped | Dropped |
| LEFT JOIN | **Kept (NULL-padded)** | Dropped |
| RIGHT JOIN | Dropped | **Kept (NULL-padded)** |
| FULL OUTER JOIN | Kept | Kept |

### The Visual Memory Trick

```
INNER  = match only — the overlap of two circles
LEFT   = everything in circle A, plus its overlap with B
RIGHT  = everything in circle B, plus the overlap
FULL   = everything in both circles
```

### The Data

Customers: (1, Aarav), (2, Meera), (3, Ravi) · Orders: (101, 1, 500), (102, 1, 700), (103, 3, 900)

| Query | Result rows |
|---|---|
| INNER: customers with orders | Aarav (×2), Ravi — Meera gone |
| LEFT: all customers + orders | Aarav ×2, **Meera with NULL order**, Ravi |
| RIGHT: all orders + customers | orders 101, 102, 103 — all have customers here |
| FULL: everything | same as LEFT in this data (no orphan orders) |

### The Syntax

```sql
SELECT c.name, o.amount
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID;

-- ON vs USING: USING works when both columns share the name
SELECT c.name, o.amount
FROM Customers c
LEFT JOIN Orders o USING (customerID);
```

### Less-Is-More Joins

You can skip the word INNER when writing an inner join — ```JOIN``` alone means INNER JOIN. MySQL and earlier SQLite do not understand FULL OUTER JOIN — use LEFT + RIGHT and UNION when you need everyone.

### NULL-Fill Behaviour

Unmatched rows get NULLs in *the columns of the other table* — "Meera's order" appears as (Meera, NULL). Filters like ```WHERE o.amount IS NULL``` can then find exactly the customers with no orders.

### Common Traps

❌ **INNER when asked for "every customer"** — "every/each/all" hints LEFT (or RIGHT); INNER silently drops the unmatched.❌ **FULL OUTER on MySQL** — it is not supported; know your engine before using it.❌ **Forgetting the ON condition** — a join without ON is a cartesian product — every pair, multiplied.❌ **Ambiguous column names** — two tables both have customerID; qualify them: c.customerID.

### Quick Self-Test (answers at the bottom)

1. "Every customer, with their orders if any" needs: (a) INNER (b) LEFT (c) cartesian
2. Unmatched left rows in INNER JOIN: (a) kept with NULLs (b) dropped (c) duplicated
3. JOIN alone means: (a) INNER (b) LEFT (c) FULL OUTER
4. MySQL does not support: (a) INNER (b) LEFT (c) FULL OUTER JOIN

**Answers:** 1→b, 2→b, 3→a, 4→c.

## 9.2 Self Joins & Cross Joins

### The Self Join — A Table Versus Itself

The EMPLOYEE table stores both the worker AND their manager (as managerID). To compare an employee with their own boss, you must join Employee to **itself** — SQL needs a second copy, and that copy needs an **alias**:

```sql
SELECT w.name AS worker, m.name AS manager
FROM Employee w
JOIN Employee m ON w.managerID = m.empID;
```

| worker | manager |
|---|---|
| Aarav | Meera |
| Ravi | Meera |
| Sneha | Aarav |

**Aliases are mandatory** — `Employee w` and `Employee m` are two logical copies of the same physical table; without aliases, `ON w.managerID = m.empID` is unreadable and ambiguous.

### Classic Self-Join Questions

| Question pattern | ON condition |
|---|---|
| Employee vs their own manager | ```ON w.managerID = m.empID``` |
| Employees earning more than their manager | self-join + ```WHERE w.salary > m.salary``` |
| Pairs who live in the same city | ```ON a.city = b.city AND a.empID < b.empID``` |

The ```a.empID < b.empID``` trick: without it, every pair appears TWICE (A–B and B–A); the inequality keeps each pair once.

### The Cross Join — Multiplication Without A Condition

```sql
SELECT * FROM Shirts CROSS JOIN Sizes;
-- every shirt × every size = shirts × sizes rows
```

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

❌ **No alias in a self join** — the query fails or, worse, silently intends the wrong copy.❌ **Duplicate pairs** — without ```a.empID < b.empID```, pair questions return every combo twice.❌ **CROSS JOIN by accident** — forgetting the ON clause turns any join into a cartesian explosion.❌ **Manager lists missing the bossless** — an INNER self join drops the CEO (no manager row); use LEFT JOIN if "everyone" is wanted.

### Quick Self-Test (answers at the bottom)

1. A self join needs: (a) two tables (b) aliases (c) a third copy
2. "Pairs in same city" needs a.empID < b.empID to: (a) sort (b) avoid duplicate pairs (c) filter cities
3. Shirts(4) × Sizes(3) cross join yields: (a) 4 rows (b) 12 rows (c) 1 row
4. A JOIN with no ON becomes: (a) an error (b) a cartesian product (c) a LEFT JOIN

**Answers:** 1→b, 2→b, 3→b, 4→b.

---

# 10. Problems

## 10.1 Write a Query Using an Outer Join

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Inner & Outer Joins |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Write the query that answers each question below. When the question says "every/each/all customers", the join must KEEP unmatched rows — that means an outer join. Tables: Customers(customerID, name) and Orders(orderID, customerID, amount).

### Examples

| Input | Output | Explanation |
|---|---|---|
| Customers: (1, Aarav), (2, Meera), (3, Ravi). Orders: (101, 1, 500), (102, 1, 700), (103, 3, 900). Question: every customer with the total amount of their orders (customers with zero orders must appear with 0). | SELECT c.name, COALESCE(SUM(o.amount), 0) AS total FROM Customers c LEFT JOIN Orders o ON c.customerID = o.customerID GROUP BY c.name; → Aarav 1200, Meera 0, Ravi 900. | LEFT JOIN keeps Meera's NULL order row; SUM over a NULL becomes NULL, so COALESCE turns it into 0. GROUP BY c.name collapses each customer's rows; the ORDER column is absent from Orders? No — the column list works because GROUP BY names the only non-aggregate. |
| Same tables. Question: customers who have NOT placed any order. | SELECT c.name FROM Customers c LEFT JOIN Orders o ON c.customerID = o.customerID WHERE o.orderID IS NULL; → Meera. | The LEFT JOIN produces NULLs in the order columns for unmatched customers; WHERE o.orderID IS NULL selects exactly those rows — the standard 'find the non-matching side' idiom. |
| Same tables. Question: every order, with the customer name, and keep orders even if their customer record is missing. | SELECT o.orderID, c.name FROM Orders o LEFT JOIN Customers c ON o.customerID = c.customerID; | The 'keep every order' side is the LEFT side of the join — Orders first, Customers second. Unmatched orders (if any) get NULL name. Flip the table order, do not flip the keyword. |

### Constraints

- The "keep everyone" side must sit on the LEFT of a LEFT JOIN (or the RIGHT of a RIGHT JOIN) — state it.
- Zero-count customers: use COALESCE(SUM(...), 0) — never let NULL leak into the answer.
- The "not on the other side" idiom is LEFT JOIN + WHERE otherTable.key IS NULL.
- GROUP BY only the non-aggregate columns.

### Approach

**Choosing The Join Type In Three Words**

```
Read the question — who is the "every/each/all" side?

"EVERY customer, with their orders if any"  → Customers must ALL survive → LEFT JOIN
"orders even if customer missing"           → Orders must ALL survive   → LEFT JOIN (orders first)
"only customers who have orders"            → nobody forced to survive  → INNER JOIN
```

**The Two Outer-Join Patterns**

**Pattern 1 — keep everyone, count the rest:**
```
SELECT c.name, COALESCE(SUM(o.amount), 0)
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
GROUP BY c.name;
```

**Pattern 2 — the ones with no match:**
```
SELECT c.name
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
WHERE o.orderID IS NULL;      -- no matching order → NULL key
```

**Worked Walkthrough — The Zero-Order Customer**

```
Meera:  LEFT JOIN gives (Meera, NULL, NULL)
SUM(o.amount) over one NULL row → NULL        (aggregates skip NULLs → empty set → NULL)
COALESCE(NULL, 0) → 0                        ✓ answer says "0"

Without COALESCE the row reads "Meera, NULL" — the classic grading loss.
```

**Traps To Dodge**

❌ **INNER JOIN in a "every customer" question** — Meera silently disappears.❌ **SUM leaking NULL** — wrap every aggregate that may see zero rows in COALESCE.❌ **GROUP BY missing columns** — c.name is the only non-aggregate → it must be grouped.❌ **IS NULL on the wrong column** — the JOIN column (o.customerID) is fine, but o.orderID is safer — both work only if it can never be NULL for a real order.

### Code

```sql
-- Q1: every customer + order totals (zeros included)
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
LEFT JOIN Customers c ON o.customerID = c.customerID;
```

## 10.2 Write a Self-Join Query

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Self Joins & Cross Joins |
| **Companies** | Google, Oracle, Ibm |

### Problem Statement

Write the queries below using ONLY the Employees table: empID, name, salary, managerID (managerID references empID of another row; NULL = no manager). Self joins need aliases — name both copies clearly.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Employees: (1, Aarav, 60000, NULL), (2, Meera, 90000, NULL), (3, Ravi, 55000, 1), (4, Sneha, 70000, 2). Question: each employee with their manager's name. | SELECT w.name AS employee, m.name AS manager FROM Employees w LEFT JOIN Employees m ON w.managerID = m.empID; → Aarav NULL (no manager), Meera NULL, Ravi Aarav, Sneha Meera. | w is the worker copy, m is the manager copy; ON w.managerID = m.empID links each worker to the row that is their boss. LEFT JOIN keeps the two bossless employees with NULL manager names. |
| Same table. Question: employees earning MORE than their own manager. | SELECT w.name FROM Employees w JOIN Employees m ON w.managerID = m.empID WHERE w.salary > m.salary; | An INNER self join pairs workers with their manager rows; the WHERE compares the two salaries in the same row. Bossless employees (managerID NULL) fail the join condition and are correctly excluded. |
| Same table extended with city. Question: all pairs of employees living in the same city, each pair listed once. | SELECT a.name AS person1, b.name AS person2 FROM Employees a JOIN Employees b ON a.city = b.city AND a.empID < b.empID; | The a.empID < b.empID guard kills duplicates: without it, (Aarav, Meera) and (Meera, Aarav) both appear. The inequality keeps exactly one ordering of each pair. |

### Constraints

- Give every copy of the table an alias — w/m or a/b — and say which is which.
- Choose LEFT JOIN when bossless employees must appear; INNER when they must not.
- Pair questions need the a.id < b.id guard against double listing.
- A CROSS JOIN must be explicitly named if used — never accidental cartesian products.

### Approach

**The Self-Join Recipe**

```
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
```

**Worked Trace — Salary vs Manager**

```
Join rows (INNER):  Ravi–Aarav, Sneha–Meera
Compare:            Ravi 55000 > Aarav 60000? NO → dropped
                    Sneha 70000 > Meera 90000? NO → dropped
Result: empty in this data — the query is still the right answer.
```

**Traps To Dodge**

❌ **Aliasless self join** — SQL cannot tell the two copies apart without aliases.❌ **INNER dropping the CEO** — "each employee with their manager" must use LEFT JOIN or the bossless vanish.❌ **Missing the dedupe guard** — same-city pairs without ```a.empID < b.empID``` return each pair twice.❌ **Accidental cartesian** — writing the self join without an ON clause multiplies the table by itself.

### Code

```sql
-- Q1: employee + manager name (bossless employees kept)
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
JOIN Employees b ON a.city = b.city AND a.empID < b.empID;
```
