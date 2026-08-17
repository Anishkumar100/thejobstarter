# DBMS Learning Document — Functional Dependencies

> A comprehensive, student-friendly guide to Functional Dependencies — the foundation every DBMS course stands on.
> Master functional dependency basics, closure of attributes, with exam-style problems and fully worked solutions.

---

# 11. Functional Dependencies

> **Lesson Overview:** The dependency rules underneath every good schema — what it means for one attribute (or set) to determine another, how to prove dependencies with Armstrong's axioms, and how to compute the closure of an attribute set to find keys and detect bad design.
> - **Category:** Normalization & Schema Design
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 11.1 Functional Dependency Basics

### What Is a Functional Dependency (FD)?

A **functional dependency** X → Y means: *"any two rows that agree on X must also agree on Y."* In other words, the value of X **determines** the value of Y. Every valid table automatically satisfies some FDs (its primary key determines everything) and violates others.

### The Two-Person Test

To test whether X → Y holds on real data, pick any two rows that have the **same X values**; they must have the **same Y values**:

| Row pair | Both rows have same... | Check | Verdict |
|---|---|---|---|
| r1, r2 | student_id = 104 | name must match | id → name holds |
| r3, r4 | city = Pune | zip must match | city → zip holds |
| r1, r4 | name = Priya | zip same? | if different, name → zip FAILS |

If even one violation exists, the FD does not hold on this data.

### Trivial vs Non-Trivial

| Kind | Meaning | Example |
|---|---|---|
| Trivial | Y is already inside X | {id, name} → name |
| Non-trivial | Y has something new | id → name |

### Proving FDs — Armstrong Axioms

Three rules let us derive new FDs from known ones:

| Axiom | Rule | Example |
|---|---|---|
| Reflexivity | X → X (and any subset) | A,B → B |
| Augmentation | X → Y implies XZ → YZ | id → dept implies (id, city) → (dept, city) |
| Transitivity | X → Y and Y → Z implies X → Z | id → dept and dept → dept_head implies id → dept_head |

From these we get **derived rules**:

| Derived rule | Rule |
|---|---|
| Union | X → Y and X → Z implies X → YZ |
| Decomposition | X → YZ implies X → Y and X → Z |
| Pseudo-transitivity | X → Y and YZ → W implies XZ → W |

**Example:** Given A → B and B → C, prove A → C: transitivity directly. Given A → BC, decompose to A → B and A → C.

### Keys Written as FDs

A **candidate key** K is an attribute set with K → (every attribute), and removing any attribute breaks that property. The primary key is just one chosen candidate key. So keys and FDs are the same story: *"keyhood is just a special FD."*

### Common Traps

❌ **Mixing up direction** — A → B does not mean B → A; FDs are one-way.❌ **Testing with one row** — an FD can only be violated by a *pair* of rows; single rows prove nothing.❌ **Assuming values are unique** — if two rows agree on X, that is exactly where the test happens.❌ **Forgetting decomposition gives both halves** — X → YZ is two FDs for the price of one.

### Quick Self-Test (answers at the bottom)

1. id → name is: (a) trivial (b) non-trivial (c) neither
2. A → B, B → C implies: (a) B → A (b) A → C (c) C → A
3. X → YZ gives us: (a) X → Y only (b) X → Y and X → Z (c) Y → Z
4. A primary key is: (a) any FD (b) a chosen candidate key (c) an Armstrong axiom

**Answers:** 1→b, 2→b, 3→b, 4→b.

## 11.2 Closure of Attributes

### Why Compute a Closure?

Given an attribute set X and a family of FDs F, the **closure X+** is the set of every attribute that X can determine. It answers three questions at once:

| Question | Closure test |
|---|---|
| Does the FD X → Y follow from F? | Y contained in X+ |
| Is X a candidate key? | X+ contains ALL attributes (and no smaller set does) |
| Is X a superkey? | X+ contains all attributes |

### The Closure Algorithm (Pseudocode)

```
INPUT  : attribute set X, set of FDs F
OUTPUT : closure X+

1.  result = X
2.  REPEAT
3.    changed = FALSE
4.    FOR each FD  L → R in F:
5.      IF L is contained in result AND R is NOT contained in result:
6.        ADD all of R to result
7.        changed = TRUE
8.  UNTIL changed == FALSE
9.  RETURN result
```

Each pass applies every FD whose left side finally fits; we keep looping until a pass changes nothing.

### Worked Example

Relation R (A, B, C, D, E) with FDs: A → B, A → C, B → D, D → E. Compute {A}+:

| Pass | Added rule | result = |
|---|---|---|
| 0 | start | { A } |
| 1 | A → B, A → C | { A, B, C } |
| 2 | B → D (B is in), then D → E | { A, B, C, D, E } |
| 3 | nothing new | stop |

{A}+ = {A, B, C, D, E} — the whole relation, so {A} is a candidate key.

### Using Closure to Find Keys

| Attribute set | Closure | Result |
|---|---|---|
| {B}+ | {B, D, E} | not a key |
| {A}+ | {A, B, C, D, E} | candidate key! |
| {C}+ | {C} | not a key |

If no single attribute closes to everything, test pairs — those pairs OR their determiners form the keys.

### Common Traps

❌ **Stopping after one pass** — a rule unlocked by pass 2 could add more; loop until nothing changes.❌ **Applying rules backwards** — an FD whose LHS has attributes NOT yet in result is skipped, not "used".❌ **Checking only one candidate** — a subset key disqualifies a larger set; also check for a smaller closure first.❌ **Ignoring zero-step FDs** — if X already contains everything, the closure is X itself.

### Quick Self-Test (answers at the bottom)

1. To prove X → Y using FDs, check whether: (a) X+ contains Y (b) Y+ contains X (c) X is in Y+
2. The loop stops when: (a) time runs out (b) a pass changes nothing (c) one FD fires
3. X is a superkey when: (a) X+ is every attribute (b) X+ is a subset (c) X has 2+ attributes
4. Given F = {A → B, B → C}, the closure {A}+ is: (a) {A, B} (b) {A, B, C} (c) {A}

**Answers:** 1→a, 2→b, 3→a, 4→b.

---

# 12. Problems

## 12.1 Determine if a Functional Dependency Holds

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Functional Dependency Basics |
| **Companies** | Amazon, Microsoft, Flipkart |

### Problem Statement

For each scenario below, decide whether the given functional dependency holds, and name the exact reason (data test, Armstrong rule, or counter example). Scenario 1 — STUDENT table with sample rows: judge id → name, city → zip, name → zip. Scenario 2 — logical family F = {A → B, B → C}: judge A → C and B → A. Scenario 3 — an EMPLOYEE table where two bosses share a name: judge boss_name → salary.

### Examples

| Input | Output | Explanation |
|---|---|---|
| STUDENT rows: (104, Priya, Pune, 411001), (105, Ravi, Pune, 411001), (106, Priya, Mumbai, 400001) | id → name HOLDS; city → zip HOLDS; name → zip VIOLATED | Rows 104 and 106 share name = Priya but differ in zip (411001 vs 400001), so name → zip fails the two-person test. |
| F = {A → B, B → C}; judge A → C, then judge B → A | A → C holds by transitivity; B → A cannot be derived | Transitivity chains A → B → C. For B → A there is no rule with B on any left side reaching A — nothing proves it. |
| EMPLOYEE rows: (E1, Sameer, Zone1, 90000), (E2, Sameer, Zone1, 85000) | boss_name → salary VIOLATED | Two employees have the same boss_name = Sameer but different salaries, so the FD fails on real data. |

### Constraints

- For data-based judgments, use only the rows shown — do not make up new rows
- For logical judgments, use exactly the family F given and Armstrong axioms
- Answer must name the evidence: which row pair, or which axiom

### Approach

**Data Test (Two-Person Rule) — Pseudocode**

```
FOR every pair of rows (r1, r2):
    IF r1.X matches r2.X AND r1.Y differs from r2.Y:
        RETURN "FD VIOLATED — pair (r1, r2) is the counter example"
RETURN "FD HOLDS on this data"
```

| Scenario row pair | Same X? | Same Y? | Verdict |
|---|---|---|---|
| 104, 105 for (id → name) | id never duplicates | names match | holds |
| 104, 105 for (city → zip) | Pune = Pune | 411001 = 411001 | holds |
| 104, 106 for (name → zip) | Priya = Priya | 411001 ≠ 400001 | VIOLATED |

**Logical Test — Armstrong**

| Target FD | Chain | Verdict |
|---|---|---|
| A → C | A → B, B → C (transitivity) | Holds |
| B → A | no rule produces B on the left | Cannot be derived |

**Code Solution — SQL**

```sql
-- Any row returned here means X -> Y is VIOLATED
SELECT city, COUNT(DISTINCT zip) AS zips
FROM STUDENT
GROUP BY city
HAVING COUNT(DISTINCT zip) > 1;
```

**Code Solution — Python**

```python
def fd_holds(rows, lhs, rhs):
    """True if no two rows agree on lhs but differ on rhs."""
    seen = {}
    for row in rows:
        key = tuple(row[a] for a in lhs)
        value = tuple(row[a] for a in rhs)
        if key in seen and seen[key] != value:
            return False
        seen[key] = value
    return True
```

### Code

```sql
-- Any row returned here means city -> zip is VIOLATED on the data
SELECT city, COUNT(DISTINCT zip) AS zips
FROM STUDENT
GROUP BY city
HAVING COUNT(DISTINCT zip) > 1;
```

```python
def fd_holds(rows, lhs, rhs):
    """True when no two rows agree on lhs but differ on rhs."""
    seen = {}
    for row in rows:
        key = tuple(row[a] for a in lhs)
        value = tuple(row[a] for a in rhs)
        if key in seen and seen[key] != value:
            return False
        seen[key] = value
    return True
```

## 12.2 Compute the Closure of an Attribute Set

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Closure of Attributes |
| **Companies** | Amazon, Google |

### Problem Statement

Relation R (A, B, C, D, E) with FDs F = { A → B, A → C, B → D, D → E }. Compute the closures {A}+, {B}+, and {C}+, then answer: which single attribute is a candidate key, and does FD B → E follow from F? Show every pass of the closure algorithm.

### Examples

| Input | Output | Explanation |
|---|---|---|
| Closure of {A} with F = {A → B, A → C, B → D, D → E} | {A}+ = {A, B, C, D, E} — every attribute; {A} is a candidate key | Pass 1 adds B and C via A → B and A → C; pass 2 adds D via B → D; pass 3 adds E via D → E; pass 4 changes nothing. |
| Closure of {B} with the same F | {B}+ = {B, D, E} | B → D adds D, then D → E adds E. A and C are unreachable, so neither is determined by B. |
| Closure of {C} and the question B → E | {C}+ = {C}; B → E DOES follow from F | No FD has a left side inside {C}, so the closure stays {C}. But E is in {B}+ = {B, D, E}, so B → E is provable. |

### Constraints

- Apply FDs in any pass order, but never use an FD before its left side is fully inside the running closure
- Keep looping until a full pass adds nothing
- A candidate key must be minimal — show no subset works

### Approach

**The Repeat-Until-Stable Algorithm**

```
def closure(attrs, fds):
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for L, R in fds:
            if L <= result and not R <= result:
                result |= R
                changed = True
    return result
```

**Tracing {A}+**

| Pass | FDs that fire | result after pass |
|---|---|---|
| start | — | {A} |
| 1 | A → B, A → C | {A, B, C} |
| 2 | B → D | {A, B, C, D} |
| 3 | D → E | {A, B, C, D, E} |
| 4 | none | stop (stable) |

**Answering the Two Questions**

| Question | Test | Answer |
|---|---|---|
| Candidate key? | {A}+ = whole relation and {A} is minimal | YES — {A} is the only single-attribute key |
| Does B → E follow? | E ∈ {B}+ = {B, D, E} | YES |

A key is a set whose closure is the ENTIRE relation and whose subsets have smaller closures.

**Code Solution — SQL (reconstruct route to a target)**

```sql
-- Is E reachable from B? (illustrated as a reachability join)
SELECT 'reachable' AS answer
WHERE EXISTS (
  SELECT 1 FROM FDs f1 JOIN FDs f2 ON f1.rhs = f2.lhs
  WHERE f1.lhs = 'B' AND f2.rhs = 'E'
);
```

### Code

```python
def closure(attrs, fds):
    """Repeatedly apply every FD whose left side fits, until stable."""
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            if lhs <= result and not rhs <= result:
                result |= rhs
                changed = True
    return result

fds = [({'A'}, {'B'}), ({'A'}, {'C'}), ({'B'}, {'D'}), ({'D'}, {'E'})]
print(sorted(closure({'A'}, fds)))  # ['A', 'B', 'C', 'D', 'E']
print(sorted(closure({'B'}, fds)))  # ['B', 'D', 'E']
```
