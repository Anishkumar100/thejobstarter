# DBMS Learning Document — SQL SELECT Queries

> A comprehensive, student-friendly guide to SQL SELECT Queries — the foundation every DBMS course stands on.
> Master basic select, where, order by, aggregate functions & group by, with exam-style problems and fully worked solutions.

---

# 8. SQL SELECT Queries

> **Lesson Overview:** SQL's most-used statement — filtering rows with WHERE, sorting with ORDER BY, and rolling data up with aggregates and GROUP BY, including the HAVING filter for groups.
> - **Category:** Relational Model & SQL
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 8.1 Basic SELECT, WHERE, ORDER BY

### The SELECT Statement — Reading Data

SELECT is the most-used statement in SQL. It answers one question: *which columns, from which table, for which rows, in what order?*

```sql
SELECT column1, column2        -- which columns
FROM Employees                 -- from which table
WHERE department = 'IT'        -- which rows
ORDER BY salary DESC           -- in what order
LIMIT 10;                      -- how many at most
```

### The WHERE Toolbox

| Operator | Meaning | Example |
|---|---|---|
| =  <>  != | equal / not equal | ```WHERE dept = 'IT'``` |
| >  <  >=  <= | comparisons | ```WHERE salary >= 50000``` |
| BETWEEN a AND b | inclusive range | ```WHERE salary BETWEEN 40000 AND 60000``` |
| IN (list) | matches any listed value | ```WHERE dept IN ('IT', 'HR')``` |
| LIKE pattern | partial text match | ```WHERE name LIKE 'Sha%'``` |
| IS NULL / IS NOT NULL | missing values | ```WHERE email IS NULL``` |
| AND / OR / NOT | combine conditions | ```WHERE dept = 'IT' AND salary > 40000``` |

### LIKE — The Two Wildcards

| Pattern | Matches |
|---|---|
| ```'Sha%'``` | Starts with "Sha" — any ending |
| ```'%raj'``` | Ends with "raj" |
| ```'_a%'``` | Second letter is "a" (underscore = ONE char) |
| ```'%an%'``` | Contains "an" anywhere |

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

```
FROM       →  pick the table and join everything
WHERE      →  discard rows that fail the filter   (before grouping)
SELECT     →  compute the output columns
DISTINCT   →  drop duplicate output rows
ORDER BY   →  sort what remains
LIMIT      →  cut the list
```

That is why ```WHERE``` cannot use an alias from ```SELECT```, and why LIMIT sees the sorted list.

### NULL Is A Trap

- NULL means *unknown*, not zero and not empty string
- ```WHERE salary = NULL``` matches NOTHING — use ```IS NULL```
- NULLs sort LAST in most engines on ASC — check your engine if it matters

### Common Traps

❌ **= NULL instead of IS NULL** — the most common beginner bug in SQL; ```= NULL``` always evaluates to unknown.❌ **LIKE without wildcards** — ```LIKE 'Sha'``` equals ```= 'Sha'```; you want ```'Sha%'```.❌ **LIMIT before ORDER BY thinking** — "top 3" requires ORDER BY first, then LIMIT.❌ **AND/OR precedence** — OR binds looser than AND; ```a OR b AND c``` means ```a OR (b AND c)``` — bracket when in doubt.

### Quick Self-Test (answers at the bottom)

1. Rows where email is missing: (a) ```WHERE email = NULL``` (b) ```WHERE email IS NULL``` (c) ```WHERE email = ''```
2. Names starting with "Sha": (a) ```LIKE 'Sha'``` (b) ```LIKE 'Sha%'``` (c) ```LIKE '%Sha'```
3. "Top 3 salaries" requires: (a) LIMIT first (b) ORDER BY salary DESC + LIMIT 3 (c) DISTINCT only
4. LIMIT 10 OFFSET 20 shows rows: (a) 10-20 (b) 21-30 (c) 20-30

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 8.2 Aggregate Functions & GROUP BY

### Aggregates — Many Rows, One Number

| Function | Returns | Example |
|---|---|---|
| COUNT(*) | number of rows | 42 employees |
| COUNT(col) | non-NULL values in col | 40 emails (2 NULL) |
| COUNT(DISTINCT col) | unique non-NULL values | 7 departments |
| SUM(col) | total (NULLs ignored) | total salary |
| AVG(col) | average (NULLs ignored) | mean salary |
| MIN / MAX(col) | smallest / largest | cheapest / costliest |

### GROUP BY — Cutting The Table Into Slices

```sql
SELECT department, COUNT(*) AS head_count, AVG(salary) AS avg_salary
FROM Employees
GROUP BY department;
```

| department | head_count | avg_salary |
|---|---|---|
| HR | 3 | 42000 |
| IT | 5 | 51000 |

**The golden rule:** any column in SELECT that is NOT inside an aggregate must appear in GROUP BY. ```SELECT department, name, COUNT(*)``` without name in GROUP BY — illegal in standard SQL.

### WHERE vs HAVING — The Classic Confusion

| | WHERE | HAVING |
|---|---|---|
| Filters | ROWS (before grouping) | GROUPS (after grouping) |
| Can use aggregates? | NO | YES |
| Example | ```WHERE salary > 40000``` | ```HAVING AVG(salary) > 40000``` |
| Position | Before GROUP BY | After GROUP BY |

```
WHERE filters individual rows  →  then rows are grouped  →  HAVING filters groups
```

### The Full Execution Order

```
FROM      →  WHERE (row filter)  →  GROUP BY (slice)  →  HAVING (group filter)
→ SELECT (compute columns)  →  ORDER BY  →  LIMIT
```

That is why ```WHERE salary > 50000``` is different from ```HAVING AVG(salary) > 50000``` — one keeps rich rows, the other keeps groups whose average is rich.

### NULL Behaviour Inside Aggregates

- ```AVG``` and ```SUM``` silently skip NULLs — an AVG over (10, NULL, 20) is 15, not 10
- ```COUNT(*)``` counts NULL rows too; ```COUNT(col)``` does not
- A group of all-NULL values: SUM → NULL, COUNT(*) → still counts

### Common Traps

❌ **Aggregate in WHERE** — ```WHERE AVG(salary) > X``` is illegal; that is HAVING's job.❌ **Column not in GROUP BY** — the golden rule; every non-aggregate SELECT column must be grouped.❌ **COUNT(*) vs COUNT(col)** — one counts rows, the other counts non-NULL values.❌ **AVG(0s vs NULLs)** — ```AVG((10,NULL,20)) = 15```; if you want 10, you must handle the NULL explicitly.

### Quick Self-Test (answers at the bottom)

1. Which filters GROUPS? (a) WHERE (b) HAVING (c) LIMIT
2. AVG over (10, NULL, 20) = ? (a) 10 (b) 15 (c) 30
3. Column X in SELECT, not in an aggregate — must appear: (a) in GROUP BY (b) in WHERE (c) nowhere
4. COUNT(*) counts: (a) non-NULL only (b) all rows (c) unique values

**Answers:** 1→b, 2→b, 3→a, 4→b.

---

# 9. Problems

## 9.1 Write a Filtered and Sorted Query

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Basic SELECT, WHERE, ORDER BY |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Write a single SELECT statement for each English question below, using only the Employees table: id, name, dept, hireDate, salary. Read the question for the filter, the columns to show, and the exact sort order.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Employees table rows: (1, Aarav, IT, 2021-06-01, 60000), (2, Meera, HR, 2019-03-15, 55000), (3, Ravi, IT, 2023-01-20, 45000), (4, Sneha, Sales, 2020-11-02, 52000). Question: show names and salaries of IT employees earning more than 50,000, best salary first. | SELECT name, salary FROM Employees WHERE dept = 'IT' AND salary > 50000 ORDER BY salary DESC;  → Result: (Aarav, 60000) only. | Both filters land in WHERE connected by AND; columns picked are exactly name and salary; ORDER BY salary DESC puts 60000 before any lower value. Ravi fails the salary filter, HR/Sales fail the dept filter. |
| Same Employees table. Question: list distinct departments in alphabetical order. | SELECT DISTINCT dept FROM Employees ORDER BY dept;  → Result: HR, IT, Sales (alphabetical). | DISTINCT removes repeated dept values even though multiple rows share them; ORDER BY dept sorts the single result rows alphabetically. DISTINCT runs before ORDER BY in the execution pipeline. |
| Same Employees table. Question: show the names of the three newest hires (most recent hire date first). | SELECT name FROM Employees ORDER BY hireDate DESC LIMIT 3;  → Result: Ravi (2023), Aarav (2021), Sneha (2020). | Ordering happens BEFORE limiting: the whole table is sorted by hireDate DESC, then LIMIT 3 keeps the top of that sorted list. Reversing them would pick three arbitrary rows. |

### Constraints

- One statement per question — no subqueries or joins unless stated.
- Filter exactly what the words say: every word in the question maps to a clause.
- Sort direction matters: DESC for "best"/"newest"/"highest", ASC otherwise.
- LIMIT always after ORDER BY — the limit applies to the sorted list.

### Approach

**Sentence → Clause Translation**

| English words | SQL clause |
|---|---|
| "show / list / display" | SELECT columns |
| "distinct / unique / different" | DISTINCT |
| "who earn / in IT / hired after..." | WHERE |
| "best / newest / highest first" | ORDER BY ... DESC |
| "alphabetical / beginning" | ORDER BY ... ASC (or nothing) |
| "top / first 3 / just 5" | LIMIT n |
| "skip the first 2" | OFFSET 2 |

**The Five-Line Recipe**

```
1. UNDERLINE the columns   → SELECT list
2. UNDERLINE every condition → WHERE (join with AND)
3. CIRCLE sorting words     → ORDER BY col + direction
4. CIRCLE limit words      → LIMIT n  (AFTER ORDER BY)
5. READ the query aloud:
   "SELECT name, salary FROM Employees WHERE dept = 'IT' AND
    salary > 50000 ORDER BY salary DESC;"
```

**Worked Trace — The Three Newest Hires**

```
Who      → "three newest hires"
Columns  → name
Sort     → most recent hire first → ORDER BY hireDate DESC
Limit    → "three" → LIMIT 3

SELECT name FROM Employees ORDER BY hireDate DESC LIMIT 3;

Execution: FROM (whole table) → no WHERE → ORDER BY date desc
          → LIMIT keeps (Ravi, Aarav, Sneha) ✓
```

**Traps To Dodge**

❌ **LIMIT before sorting** — LIMIT takes the first n of whatever order exists; sort first.❌ **= NULL** — the hiring question says "no hire date" — that needs IS NULL, not = NULL.❌ **Forgetting DESC** — "best salary first" without DESC returns the LOWEST first.❌ **SELECT * when three columns are asked** — grade against the question's column list, not the table.

### Code

```sql
-- Solution queries (Employees table)

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
LIMIT 3;
```

## 9.2 Write a Query Using GROUP BY and HAVING

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Aggregate Functions & GROUP BY |
| **Companies** | Google, Oracle, Ibm |

### Problem Statement

Write the SQL that answers each business question below. Every aggregate question needs GROUP BY on the dimension column; every filter on a GROUP result needs HAVING; row-level filters stay in WHERE. Use the Sales table: id, region, product, amount.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Sales rows: (1, North, Pen, 100), (2, North, Pen, 50), (3, South, Pen, 200), (4, North, Book, 300). Question: total sales per region. | SELECT region, SUM(amount) AS total FROM Sales GROUP BY region;  → Result: North 450, South 200. | The dimension 'per region' is GROUP BY region; the measure 'total' is SUM(amount). North sums 100 + 50 + 300 = 450; South sums 200. |
| Same Sales table. Question: regions whose AVERAGE sale is above 150. | SELECT region, AVG(amount) AS avg_sale FROM Sales GROUP BY region HAVING AVG(amount) > 150;  → Result: South (200). | The filter targets the GROUP's aggregate, not individual rows — so it lives in HAVING. North's average is (100+50+300)/3 = 150, which fails > 150; South's 200 passes. |
| Extended Sales table. Question: am allowed to filter out small individual sales (amount < 50) BEFORE grouping, then find regions with more than 2 remaining sales. | SELECT region, COUNT(*) AS cnt FROM Sales WHERE amount >= 50 GROUP BY region HAVING COUNT(*) > 2; | The row filter goes in WHERE before grouping; the group-count filter goes in HAVING after grouping. Execution: drop small rows → group by region → count → keep groups with count > 2. |

### Constraints

- Every non-aggregate column in SELECT must appear in GROUP BY.
- Row filters → WHERE (before grouping); group filters → HAVING (after grouping).
- Name computed columns with AS — the expected output shows the alias.
- Aggregates skip NULLs — flag it in your explanation when the data contains them.

### Approach

**The Six-Step Group Query Builder**

```
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
```

**WHERE vs HAVING — Instant Decision**

```
Does the filter talk about ONE ROW?      → WHERE
Does it talk about a GROUP/aggregate?    → HAVING

"sales above 500" (each row)     → WHERE amount > 500
"average sale above 150" (group) → HAVING AVG(amount) > 150
```

**Worked Trace — Example 3**

```
"filter out amount < 50"         → WHERE amount >= 50       (row filter)
"regions with more than 2 sales" → HAVING COUNT(*) > 2      (group filter)
dimension: region                → GROUP BY region
measure: how many                → COUNT(*)

Execution: WHERE drops small rows → GROUP BY region → COUNT per group
→ HAVING keeps only groups with count > 2 ✓
```

**Traps To Dodge**

❌ **Aggregate in WHERE** — ```WHERE AVG(amount) > 150``` is illegal; HAVING owns aggregates.❌ **SELECT columns out of GROUP BY** — ```SELECT region, product, SUM(amount) GROUP BY region``` breaks instantly.❌ **HAVING for row filters** — semantic error: groups form AFTER the row filter; filtering rows in HAVING is a different question.❌ **AS missing** — the expected output table has a name for the computed column.

### Code

```sql
-- Q1: total sales per region
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
HAVING COUNT(*) > 2;
```
