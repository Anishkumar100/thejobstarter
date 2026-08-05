# Programming Learning Document — Sets

> A comprehensive, student-friendly guide to the unique-and-unordered workhorse — the set. Master what makes it fast, the five core operations (union, intersection, difference, symmetric difference, subset), and why it is the perfect tool for the duplicate problem.
> Also: the collection family portrait — when to reach for list, tuple, dict, or set.

---

# 9. Sets

> **Lesson Overview:** A **set** is an *unordered* collection of *unique* items. It has no index, no duplicates, and no order — what it has instead is **O(1) membership tests** and lightning-fast mathematical operations. If you ever need "is this thing in there?" quickly, or "what's shared between these two groups?", the set is the tool. This lesson covers set basics (creation, uniqueness, add/remove, the `{}` vs `set()` trap) and the five big operations — including the classic union/intersection problem.
> - **Category:** Data Handling & Collections
> - **Difficulty:** Easy
> - **Problems:** 1

---

## 9.1 Set Basics

### What a Set Is

A **set** is an unordered collection of **unique** items. Three properties define it:

1. **Unique** — duplicates are silently dropped
2. **Unordered** — no index, no positions, no slicing
3. **Fast** — membership checks are O(1)

```python
fruits = {"apple", "banana", "apple"}   # {apple, banana} — the second apple vanished
empty  = set()                          # the ONLY way to make an empty set!
```

### The `{}` vs `set()` Trap

```python
a = {}          # an empty DICTIONARY, not a set!
b = set()       # the empty set
```

Curly braces with `key: value` make a dict; curly braces with plain items make a set. An empty pair of braces is always a dict. This is a favourite exam trick.

### The Essential Operations (memorise these 8)

| Operation | What it does | Example → Result |
|---|---|---|
| `x in s` | Membership (O(1)!) | `2 in {1,2,3}` → True |
| `s.add(x)` | Add one item | `{1}.add(2)` → {1, 2} |
| `s.update(iter)` | Add many | `{1}.update([2,3])` → {1, 2, 3} |
| `s.remove(x)` | Remove (KeyError if missing!) | `{1,2}.remove(1)` → {2} |
| `s.discard(x)` | Remove (silent if missing) | `{1}.discard(9)` → {1} |
| `len(s)` | Count of unique items | `len({1,2,2})` → 2 |
| `s.pop()` | Remove and return ANY item | `{5,6}.pop()` → 5 or 6 |
| `s.copy()` | Shallow copy | `b = s.copy()` |

### The remove() vs discard() Distinction

```python
s = {1, 2, 3}
s.remove(9)      # KeyError! 9 isn't there
s.discard(9)     # silent — nothing happens
```

`remove()` insists the item exists; `discard()` tolerates absence. If you're not sure the item is present, `discard()` is the safe door.

### What CANNOT Go In a Set

Set items must be **hashable** (immutable): strings, numbers, tuples are fine; lists and dicts are not.

```python
s = {[1, 2]}     # TypeError: unhashable type: 'list'
s = {(1, 2)}     # fine — a tuple is hashable
```

### The Duplicates Connection (you met this in the Lists lesson)

The Remove Duplicates problem used a `seen` set precisely because set membership is O(1). Converting a list to a set is the instant-deduplicate move — just remember it destroys order:

```python
list(set([3, 1, 3, 2]))   # order NOT preserved
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| `{}` for an empty set | You get a dict | `set()` |
| `s.remove(x)` on a missing x | KeyError crash | Use `discard(x)` or check `x in s` |
| Expecting an index | TypeError: 'set' object is not subscriptable | Sets are unordered — no `s[0]` |
| Adding a list | TypeError: unhashable | Convert to a tuple first |
| Assuming order | Set iteration order is arbitrary | Use a list if order matters |

### Quick Self-Test (answers at the bottom)

1. `{}` creates — (a) a set  (b) a dict  (c) an error  (d) a list
2. `{1, 2, 2, 3}` is — (a) {1, 2, 3}  (b) {1, 2, 2, 3}  (c) an error  (d) {1, 2}
3. `s.remove(9)` on a set without 9 — (a) silent  (b) KeyError  (c) returns None  (d) deletes s
4. Membership `x in s` costs — (a) O(1)  (b) O(n)  (c) O(n²)  (d) O(log n)
5. Which can go in a set? (a) a list  (b) a dict  (c) a tuple  (d) another set

**Answers:** 1→b, 2→a, 3→b, 4→a, 5→c.

### Key Takeaway

Sets are unordered, unique, and O(1)-fast. Make an empty set with `set()` (never `{}`), remove with `discard()` when unsure, keep items hashable, and reach for a set the moment you need uniqueness or rapid membership.

---

## 9.2 Set Operations

### The Big Five — the Set Operators

| Operation | Operator | What it returns | Example → Result |
|---|---|---|---|
| **Union** | `a \| b` | Everything from both | `{1,2} \| {2,3}` → {1, 2, 3} |
| **Intersection** | `a & b` | Only the shared items | `{1,2} & {2,3}` → {2} |
| **Difference** | `a - b` | In a but NOT in b | `{1,2} - {2,3}` → {1} |
| **Symmetric difference** | `a ^ b` | In either, but NOT both | `{1,2} ^ {2,3}` → {1, 3} |
| **Subset / superset** | `a <= b`, `a >= b` | True/False | `{1} <= {1,2}` → True |

Each also has a method spelling (`a.union(b)`, `a.intersection(b)`, `a.difference(b)`, `a.symmetric_difference(b)`, `a.issubset(b)`) — same results, different handwriting.

### Union — the Merge

```python
a = {1, 2, 3}
b = {3, 4, 5}
a | b          # {1, 2, 3, 4, 5}
```

Every item from both sets, duplicates (like 3) kept once. The natural "combine two groups" move.

### Intersection — the Overlap

```python
a = {1, 2, 3}
b = {3, 4, 5}
a & b          # {3}
```

Items in BOTH sets. The interview classic: "who appears in both lists?" — the one-line answer is `set(x) & set(y)`.

### Difference and Symmetric Difference

```python
a = {1, 2, 3}
b = {3, 4, 5}
a - b          # {1, 2}   — in a, not in b
b - a          # {4, 5}   — in b, not in a
a ^ b          # {1, 2, 4, 5} — in either, not both
```

`-` is directional (order matters!); `^` is symmetric (order doesn't).

### The in-place Update Family

Like `sort()` vs `sorted()`, the operators build NEW sets; the `_update` methods mutate:

| Mutating form | Equivalent non-mutating |
|---|---|
| `a.update(b)` | `a \| b` |
| `a.intersection_update(b)` | `a & b` |
| `a.difference_update(b)` | `a - b` |
| `a.symmetric_difference_update(b)` | `a ^ b` |

### Subset / Superset — the Relationship Tests

```python
{1, 2} <= {1, 2, 3}     # True — {1,2} is a subset of {1,2,3}
{1, 2, 3} >= {1, 2}     # True — {1,2,3} is a superset of {1,2}
{1, 2} <= {1, 2}        # True — every set is a subset of itself
{1, 2} < {1, 2}         # False — strict subset needs a missing item
```

### The Collection Family Portrait (choose the right container)

| Container | Ordered? | Unique? | Mutable? | Perfect for |
|---|---|---|---|---|
| **List** | Yes | No | Yes | Ordered, growing data |
| **Tuple** | Yes | No | No | Fixed records, dict keys |
| **Dict** | Insertion | Keys unique | Yes | key → value lookups |
| **Set** | No | Yes | Yes | Uniqueness, membership, group maths |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| `a - b` vs `b - a` | Results differ — it's directional | Think "in the left one, not the right" |
| Using `&` on lists | TypeError — only sets support these | Convert first: `set(a) & set(b)` |
| Forgetting `^` | Symmetric difference vs plain difference | `^` = in either but NOT both |
| Expecting union to keep duplicates | Sets never keep duplicates | It's a set — uniqueness is the point |
| Mutating when you meant to copy | `a.update(b)` changes a forever | Use `a \| b` for a fresh result |

### Quick Self-Test (answers at the bottom)

1. `{1,2,3} \| {3,4}` — (a) {1,2,3,4}  (b) {1,2,3}  (c) {3}  (d) error
2. `{1,2,3} & {3,4}` — (a) {1,2,3,4}  (b) {3}  (c) {1,2}  (d) {}
3. `{1,2,3} - {2,3}` — (a) {1}  (b) {2,3}  (c) {1,2,3}  (d) {1,2}
4. `{1,2} ^ {2,3}` — (a) {1,2,3}  (b) {2}  (c) {1,3}  (d) {}
5. `{1,2} <= {1,2,3}` — (a) True  (b) False  (c) error  (d) None

**Answers:** 1→a, 2→b, 3→a, 4→c, 5→a.

### Key Takeaway

The five operations — union `|`, intersection `&`, difference `-`, symmetric difference `^`, and subset `<=` — turn sets into a one-line maths engine. Use the non-mutating operators for fresh results, the `_update` family when mutation is intended, and remember sets only work on sets (convert lists first).

---

# 10. Problems

## 10.1 Union/Intersection of Two Sets

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Set Operations |
| **Companies** | Google, Amazon, Microsoft |

### Problem Statement

Given two sets, return their **union** (every item from both, no duplicates) and their **intersection** (items present in both). For example, `{1, 2, 3}` and `{2, 3, 4}` → union `{1, 2, 3, 4}`, intersection `{2, 3}`. Empty sets and identical sets must be handled (union of identical sets = the set itself; intersection of empty with anything = empty).

### Step-by-Step Solution

**Step 1 — Union with the pipe operator:**

```
a | b
```

Every item from both sets, duplicates kept once. For `{1, 2, 3} | {2, 3, 4}` → `{1, 2, 3, 4}`.

**Step 2 — Intersection with the ampersand:**

```
a & b
```

Items in BOTH sets. For `{1, 2, 3} & {2, 3, 4}` → `{2, 3}`.

**Step 3 — The method spellings (same result):**

```
a.union(b)          # or  a | b
a.intersection(b)   # or  a & b
```

### Answer

| Question | Answer |
|---|---|
| union({1,2,3}, {2,3,4}) | **{1, 2, 3, 4}** |
| intersection({1,2,3}, {2,3,4}) | **{2, 3}** |
| union({1,2}, {1,2}) | **{1, 2}** |
| intersection({1,2}, {3,4}) | **set()** (empty) |
| union({}, {5}) | **{5}** |

### Trap to Remember

Union and intersection are **commutative** — `a | b` equals `b | a`, and `a & b` equals `b & a` — but their *in-place* update forms (`a.update(b)`, `a.intersection_update(b)`) mutate the left set. Read the problem statement: if it says "return", use the non-mutating operators; if it says "modify", use the update family. Also remember the empty-set results are still sets — `set()`, never `{}`.

---

*Happy studying! — TheWebytes Programming Team*