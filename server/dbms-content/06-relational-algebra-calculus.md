# DBMS Learning Document — Relational Algebra & Calculus

> A comprehensive, student-friendly guide to Relational Algebra & Calculus — the foundation every DBMS course stands on.
> Master set operations in relational algebra, joins in relational algebra, with exam-style problems and fully worked solutions.

---

# 6. Relational Algebra & Calculus

> **Lesson Overview:** Push tables through set operations and joins like a query optimizer — union, intersect, minus, natural joins — and predict exactly which rows come out the other side.
> - **Category:** Relational Model & SQL
> - **Difficulty:** Hard
> - **Problems:** 2

---

## 6.1 Set Operations in Relational Algebra

### Tables As Sets

Relational algebra treats every relation as a **set of rows** — and sets can be added, overlapped, and subtracted. The three set operators work on TWO whole tables and produce one result table.

### The Union-Compatibility Rule

Before any set operation, the two tables MUST match:

| Rule | Meaning |
|---|---|
| Same number of columns (degree) | A(3 columns) ∪ B(4 columns) → ILLEGAL |
| Corresponding columns have the same domain | Mixing phone numbers with salaries → nonsense |

```
Is R ∪ S legal?
R(a, b) and S(a, b)  → SAME degree (2) → LEGAL
R(a, b) and X(a)     → different degree → ILLEGAL
R(a, b) and S(b, a)  → compatible but columns align BY POSITION, not by name
```

### The Three Operators With Real Data

R = students in course 1, S = students in course 2:

| R | | S | | R ∪ S | | R ∩ S | | R − S | | S − R |
|---|---|---|---|---|---|---|---|---|---|---|
| Alice | | Bob | | Alice | | Charlie | | Alice | | Bob |
| Charlie | | Charlie | | Bob | | (only shared) | | (only in R) | | (only in S) |
| | | | | Charlie | | | | | | |

| Operator | Result contains | Mentally |
|---|---|---|
| R ∪ S | Rows in R **or** S (duplicates removed) | the combined list |
| R ∩ S | Rows in BOTH R and S | the common ones |
| R − S | Rows in R **but not** in S | what R alone brings |
| S − R | Rows in S but not in R | what S alone brings |

### ∪ vs ⋈ — Don't Confuse Them

| | UNION (∪) | JOIN (⋈) |
|---|---|---|
| Puts rows | Below each other (vertical, same columns) | Beside each other (columns merged) |
| Row count | R ∪ S ≤ R + S | Up to R × S |
| Warning | Extreme duplicate elimination | Extreme multiplication |

### ρ (Rename) — The Glue For Set Ops

Sometimes the same table appears twice (e.g. unioning employees of two branches):

```
ρ (BranchA, EMPLOYEE)   — now EMPLOYEE is also called BranchA
π_name(BranchA) ∪ π_name(BranchB)   — names from either branch
```

Rename is how you reuse a table in one expression without ambiguity.

### Common Traps

❌ **Union of incompatible tables** — differing degrees or domains = illegal; always check first.❌ **Duplicates in your ∪ answer** — algebra drops them; writing "Alice, Charlie, Alice" is wrong.❌ **R − S vs S − R** — direction matters; "minus" is not commutative.❌ **∪ vs ⋈** — union stacks rows; join merges columns; mixing them up loses marks on every problem.

### Quick Self-Test (answers at the bottom)

1. R(2 cols) ∪ S(3 cols) is: (a) legal (b) illegal — different degrees (c) legal if both are text
2. R ∩ S returns rows: (a) in R only (b) in both (c) in neither
3. Duplicates in a set-operation result are: (a) kept (b) removed (c) doubled
4. ρ exists so that: (a) columns can be dropped (b) a table can appear twice under a new name (c) rows are sorted

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 6.2 Joins in Relational Algebra

### From Cartesian Chaos To Meaningful Pairs

The cartesian product × pairs EVERY row of A with EVERY row of B — mostly garbage. A **join** (⋈) applies a condition and keeps only the meaningful pairs. The join family is the same idea at different strictness levels.

### The Join Family

| Join | Condition | Result columns | Unmatched rows |
|---|---|---|---|
| θ-join (theta) | Any comparison: <, >, ≤, ≥, =, ≠ | A + B (all columns, duplicates kept) | Dropped |
| Equi-join | Equality only (A.x = B.y) | A + B (both join columns appear!) | Dropped |
| **Natural join (⋈)** | Equality on SAME-NAMED columns | A + B **minus one copy** of the common column | Dropped |
| Left outer join (⋈L) | As natural | + keeps ALL left rows (unmatched → NULLs) | Left rows kept |
| Right outer (⋈R) | As natural | + keeps ALL right rows | Right rows kept |
| Full outer (⋈F) | As natural | + keeps EVERYTHING | Both kept |

### Natural Join — The Star Of The Show

Natural join automatically matches on columns that have the **same name in both tables**:

```
STUDENT (sid, name, cid)      ENROLLED (cid, grade)

STUDENT ⋈ ENROLLED:
  1. Find common columns → cid
  2. Pair rows where cid matches; drop the SECOND cid column
  3. Result: (sid, name, cid, grade)
```

| STUDENT.sid | name | cid | ⋈ | cid | grade | → | sid | name | cid | grade |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Aarav | 10 | | 10 | A | | 1 | Aarav | 10 | A |
| 2 | Meera | 20 | | 20 | B | | 2 | Meera | 20 | B |
| 3 | Ravi | 20 | | | | | 3 | Ravi | 20 | B |

### Natural Join Edge Cases (exam specials)

| Situation | Result |
|---|---|
| No shared column names | Natural join = **cartesian product** (every pair) |
| Two shared columns | Matches on BOTH at once |
| Column names differ but meanings match | **Rename first** (ρ), then natural join |

### Outer Joins — The Safety Net

A left outer join starts from the natural join and **adds back every left row** that matched nothing, padded with NULLs:

```
COURSE (cid, title)  ⋈L  ENROLLED (cid, grade)
-> every course appears, even courses with ZERO enrollments
   (enrollment columns become NULL for them)
```

### Common Traps

❌ **Equi-join keeping duplicated join columns** — equi-join shows both copies; natural join shows one. Read the question's wording carefully.❌ **Natural join with no common attribute** — you get ×, a full cartesian product — usually not what the question intends.❌ **Outer joins only when told** — plain "join" in algebra means inner: unmatched rows vanish.❌ **Rename forgotten** — σ on the wrong side of a rename, and your expressions break instantly.

### Quick Self-Test (answers at the bottom)

1. Natural join matches on: (a) any condition (b) same-named columns (c) keys only
2. If no column shares a name, natural join equals: (a) intersection (b) cartesian product (c) minus
3. Left outer join keeps: (a) only matched rows (b) all left rows, NULL-padded (c) all right rows
4. Equi-join and natural join differ: (a) never (b) equi-join keeps both join columns (c) equi-join keeps one

**Answers:** 1→b, 2→b, 3→b, 4→b.

---

# 7. Problems

## 7.1 Apply Union, Intersect, and Minus

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Set Operations in Relational Algebra |
| **Companies** | Amazon, Google, Oracle |

### Problem Statement

Given the two relations below, compute R ∪ S, R ∩ S, R − S, and S − R. Then answer: is R − S = S − R in general? (No — prove it with the numbers.) Treat relations as sets: duplicate rows appear once.

### Examples

| Input | Output | Explanation |
|---|---|---|
| R: {(1, A), (2, B), (3, C)}   S: {(2, B), (3, C), (4, D)} | R ∪ S = {(1,A), (2,B), (3,C), (4,D)} · R ∩ S = {(2,B), (3,C)} · R − S = {(1,A)} · S − R = {(4,D)}. R − S ≠ S − R — they share nothing here. | Union merges all four distinct rows. Intersect keeps only the two tuples appearing in both. R − S keeps R's rows that don't exist in S (just (1,A)); S − R keeps (4,D) — demonstrating both directions differ. |
| R: {(x, 1), (x, 1)} (duplicate row!)   S: {(x, 1), (y, 2)} | R ∪ S = {(x,1), (y,2)} · R ∩ S = {(x,1)} · R − S = {} (empty) · S − R = {(y,2)}. | R holds duplicate (x,1) but relations are sets — the duplicate collapses. R − S is EMPTY because R's only distinct row (x,1) also exists in S. |
| R: Student IDs in the Cricket club {101, 102, 103}   S: Student IDs in the Drama club {102, 104}. Find students in Cricket but NOT in Drama. | R − S = {101, 103}. Students 102 is a member of both clubs (it's in R ∩ S); 104 only in Drama. | R − S is the classic 'members of A who are not members of B'. 101 and 103 are Cricket-only; 102 belongs to both (so it appears in the intersection, not the difference); 104 isn't in R at all. |

### Constraints

- Relations are sets — collapse duplicate rows before answering.
- ∪ = at least one table; ∩ = both tables; − = first table only.
- Show the four results as explicit row lists, empty sets included.
- For the final sentence: explain in your own words why − is not commutative.

### Approach

**The One-Line Definitions**

```
A ∪ B : rows appearing in A OR B        (deduplicate!)
A ∩ B : rows appearing in A AND B
A − B : rows in A that are NOT in B
B − A : rows in B that are NOT in A
```

**The Method**

```
1. Write BOTH relations as row lists — collapse repeats FIRST.
2. UNION    → merge the lists, drop duplicates.
3. INTERSECT → keep rows whose value exists in the other table too.
4. DIFFERENCE → for each row of A ask "is this exact row in B?"
                 NO → it goes into A − B.
5. Round trip check: (A − B) and (B − A) overlap? If they do —
   you have a bug; set differences are disjoint.
```

**Worked Walkthrough (Example 2)**

```
Step 1  R = {(x,1), (x,1)}  → collapses to {(x,1)}
Step 2  R ∪ S = {(x,1)} ∪ {(x,1), (y,2)} = {(x,1), (y,2)}
Step 3  R ∩ S = {(x,1)}            (the only common tuple)
Step 4  R − S = {}                 ((x,1) exists in S → dropped)
Step 5  S − R = {(y,2)}            (not in R)
```

**Traps To Dodge**

❌ **Keeping duplicates** — relations are sets by definition; every result must be deduplicated.❌ **Writing R − S and S − R as the same answer** — they are mirror images; compute each separately.❌ **Treating − like a comparison** — "not equal to S" is meaningless; − operates on whole table membership.❌ **Skipping the empty-set answer** — an empty result is a valid, and often the intended, answer.

### Code

```sql
-- The set operations in SQL (same semantics: duplicates dropped)

-- R ∪ S
SELECT * FROM R
UNION
SELECT * FROM S;

-- R ∩ S
SELECT * FROM R
INTERSECT
SELECT * FROM S;

-- R − S
SELECT * FROM R
EXCEPT
SELECT * FROM S;

-- S − R
SELECT * FROM S
EXCEPT
SELECT * FROM R;
```

```python
# The same computation as plain sets
R = {(1, 'A'), (2, 'B'), (3, 'C')}
S = {(2, 'B'), (3, 'C'), (4, 'D')}

print("R ∪ S =", R | S)          # {(1,'A'), (2,'B'), (3,'C'), (4,'D')}
print("R ∩ S =", R & S)          # {(2,'B'), (3,'C')}
print("R − S =", R - S)          # {(1,'A')}
print("S − R =", S - R)          # {(4,'D')}
print("Commutative?", R - S == S - R)   # False
```

## 7.2 Compute a Natural Join Result

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Joins in Relational Algebra |
| **Companies** | Google, Microsoft, Ibm |

### Problem Statement

Compute the natural join (R ⋈ S) of the two relations below. Show every result row, the final column list (shared column appears ONCE), and state what happens to rows that find no match.

### Examples

| Input | Output | Explanation |
|---|---|---|
| STUDENT(sid, name, dept): (1, Aarav, CS), (2, Meera, EC), (3, Ravi, ME).   ENROLLED(sid, grade, cid): (1, A, 101), (1, B, 102), (3, A, 201). | STUDENT ⋈ ENROLLED (on shared column sid): (1, Aarav, CS, A, 101), (1, Aarav, CS, B, 102), (3, Ravi, ME, A, 201). Meera (sid 2) joins to NOTHING — inner natural join drops her. | Match rows by sid: sid 1 appears in ENROLLED twice → Aarav gets TWO joined rows (one per course). sid 2 has no enrollment → dropped by the inner join. sid 3 matches once. Result columns: sid, name, dept, grade, cid — the shared sid appears exactly once. |
| GAME(player, team): (Sachin, IND), (Kohli, IND).   TEAM(name, coach): (IND, Rahul), (AUS, Langer). | GAME ⋈ TEAM on same-named column name/team? CAREFUL: the shared-looking columns are player/team and name/coach — they share NO attribute name. Natural join = CARTESIAN PRODUCT: all 4 pairs. | This is the classic edge case: player ≠ name, team ≠ name... The only same-named attribute is none — GAME has player+team; TEAM has name+coach? Actually no common column exists, so natural join degenerates into the cartesian product (4 rows). Rename (ρ) is needed to join meaningfully. |
| A(x, y): (1, p), (2, q).   B(y, z): (p, 10), (p, 20), (r, 30). | A ⋈ B = (1, p, 10), (1, p, 20). Row (2, q) matches nothing → dropped. Row (r, 30) in B matches no A-row → dropped. | Shared column y. A's (1,p) pairs with BOTH (p,10) and (p,20) → two result rows. Both (2,q) and (r,30) fail the equality → gone. Result columns: x, y, z with y once. |

### Constraints

- List every result row explicitly — row counts must match the pairing logic.
- Column list: shared attribute appears exactly ONCE.
- Inner natural join: unmatched rows on either side are dropped — say so.
- No shared column name → the answer is the cartesian product; call it out, do not fake a join.

### Approach

**The Three-Step Natural Join**

```
1. FIND the common column(s) — same name in both schemas
   (none? → answer is the cartesian product; stop and say so)

2. PAIR rows — for every R row, for every S row:
   EQUAL common-column values → one result row
   (an R row with 2 matching S rows produces 2 results)

3. MERGE columns — concat R's columns and S's columns,
   SHARED column written ONCE
```

**Working Example 1 Row-By-Row**

```
STUDENT: (1, Aarav, CS)  ENROLLED: (1, A, 101)   sid 1=1 → PAIR → (1, Aarav, CS, A, 101)
                 (1, Aarav, CS)  ENROLLED: (1, B, 102)   sid 1=1 → PAIR → (1, Aarav, CS, B, 102)
                 (2, Meera, EC)  ENROLLED: (1, ...)      sid 2≠1 → skip
                 (2, Meera, EC)  ENROLLED: (3, ...)      sid 2≠3 → skip
                 (3, Ravi, ME)   ENROLLED: (1, ...)      sid 3≠1 → skip
                 (3, Ravi, ME)   ENROLLED: (3, A, 201)   sid 3=3 → PAIR → (3, Ravi, ME, A, 201)

Result: 3 rows; columns (sid, name, dept, grade, cid) — sid once ✓
```

**Traps To Dodge**

❌ **Writing the shared column twice** — natural join output has it once; duplicating it is wrong.❌ **Counting rows wrong when one side repeats** — Aarav × 2 courses = 2 rows; multiply, don't add.❌ **Silently assuming a common column** — GAME/TEAM shares none; natural join = cartesian product; say it explicitly.❌ **Padding dropped rows with NULLs** — that is OUTER join behaviour; the plain ⋈ is inner and drops them.

### Code

```sql
-- Natural join in SQL (same semantics — shared columns matched once)

SELECT *
FROM STUDENT
NATURAL JOIN ENROLLED;

-- Or the explicit version (sid, which appears in both tables):
SELECT s.sid, s.name, s.dept, e.grade, e.cid
FROM STUDENT s
JOIN ENROLLED e ON s.sid = e.sid;
```

```python
STUDENT = [(1, 'Aarav', 'CS'), (2, 'Meera', 'EC'), (3, 'Ravi', 'ME')]
ENROLLED = [(1, 'A', 101), (1, 'B', 102), (3, 'A', 201)]

# natural join on the common attribute 'sid' (index 0 in both)
result = [(s[0], s[1], s[2], e[1], e[2])
          for s in STUDENT
          for e in ENROLLED
          if s[0] == e[0]]

print(result)
# [(1, 'Aarav', 'CS', 'A', 101), (1, 'Aarav', 'CS', 'B', 102), (3, 'Ravi', 'ME', 'A', 201)]
```
