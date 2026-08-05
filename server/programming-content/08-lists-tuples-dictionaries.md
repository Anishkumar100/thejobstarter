# Programming Learning Document — Lists, Tuples & Dictionaries

> A comprehensive, student-friendly guide to the three containers that hold almost everything — the mutable list, the immutable tuple, and the lightning-fast dictionary.
> Master list operations (append, pop, slicing, sorting), why tuples exist and when they win, and the key→value dictionary with the merge tricks every interview loves.

---

# 8. Lists, Tuples & Dictionaries

> **Lesson Overview:** Strings were sequences of characters. **Lists** are sequences of *anything*, and they are **mutable** — you can add, remove, and change items. **Tuples** are the same idea made **immutable** — safer for fixed data and usable as dictionary keys. **Dictionaries** store key→value pairs for O(1) lookups. Between them they solve a huge fraction of everyday programming — including the two classics in this lesson: removing duplicates from a list, and merging two dictionaries.
> - **Category:** Data Handling & Collections
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 8.1 List Operations

### What a List Is

A **list** is an ordered, mutable collection of items (any types, even mixed). Order matters, and you can change it after creation.

```python
scores = [90, 85, 92]        # a list of numbers
mixed  = [1, "two", 3.0]     # mixed types are legal
empty  = []                  # the empty list
```

### The Essential Operations (memorise these 12)

| Operation | What it does | Example → Result |
|---|---|---|
| `lst[i]` | Index (0-based, negative from end) | `scores[1]` → 85 |
| `lst[a:b]` | Slice (half-open, like strings) | `scores[0:2]` → [90, 85] |
| `len(lst)` | Length | `len(scores)` → 3 |
| `lst.append(x)` | Add at the end | `[1].append(2)` → [1, 2] |
| `lst.extend(iter)` | Add many at the end | `[1].extend([2,3])` → [1, 2, 3] |
| `lst.insert(i, x)` | Add at index i | `[1,3].insert(1,2)` → [1, 2, 3] |
| `lst.pop()` / `lst.pop(i)` | Remove last / at index | `[1,2,3].pop()` → 3, list [1,2] |
| `lst.remove(x)` | Remove first x by value | `[1,2,2].remove(2)` → [1,2] |
| `x in lst` | Membership | `2 in [1,2,3]` → True |
| `lst.sort()` | Sort IN PLACE (returns None) | `[3,1].sort()` → list [1,3] |
| `sorted(lst)` | Return a NEW sorted list | `sorted([3,1])` → [1,3] |
| `lst.copy()` | Shallow copy | `b = lst.copy()` — independent list |

### The #1 Sorting Trap: `sort()` vs `sorted()`

```python
lst = [3, 1, 2]
lst.sort()          # mutates lst; returns NONE
result = lst.sort() # result = None! ← the classic exam trap

lst = [3, 1, 2]
result = sorted(lst)  # lst untouched; result = [1, 2, 3]
```

`sorted()` works on any iterable and returns a new list; `sort()` only exists on lists and changes the original. Mixing them up is a silent `None` bug.

### The Duplicates Connection

Removing duplicates is a *set* idea applied to a *list* — the problem at the end of this lesson builds the classic pattern: a `seen` set + an output list.

### List Comprehensions (the compact power move)

```python
squares = [x * x for x in range(5)]      # [0, 1, 4, 9, 16]
evens   = [x for x in range(10) if x % 2 == 0]
```

`[expr for item in iterable if condition]` — one line, no loop bookkeeping. Interviews love to see it.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| `lst.sort()` returns None | Result assigned to None | Use `sorted()` for a value, `sort()` for in-place |
| Mutating while iterating | Items skip or shift under you | Iterate a copy: `for x in lst.copy():` |
| `lst.remove` removes only the first match | Duplicate stays behind | Loop, or build a new list |
| Slicing instead of copying | `b = lst` shares the SAME list | `b = lst.copy()` or `b = lst[:]` |
| Forgetting lists are mutable | `b = lst` then b changes lst too | Copy explicitly |

### Quick Self-Test (answers at the bottom)

1. `[1, 2, 3].pop()` returns — (a) 1  (b) 3  (c) None  (d) [1, 2]
2. `[3, 1, 2].sort()` returns — (a) [1, 2, 3]  (b) None  (c) 3  (d) error
3. `b = lst` then modifying b — (a) affects lst too (same list)  (b) affects only b  (c) errors  (d) copies automatically
4. `[x * 2 for x in range(3)]` is — (a) [0, 2, 4]  (b) [2, 4, 6]  (c) [0, 2]  (d) error
5. `5 in [1, 2, 3]` — (a) True  (b) False  (c) 3  (d) None

**Answers:** 1→b, 2→b, 3→a, 4→a, 5→b.

### Key Takeaway

Lists are ordered, mutable sequences. Master the dozen operations — especially append/extend/pop, membership, and the sort()/sorted() split. Copy before aliasing, use comprehensions for one-liners, and never assign `lst.sort()` to anything.

---

## 8.2 Tuples

### What a Tuple Is

A **tuple** is an ordered, IMMUTABLE sequence — the list's stricter sibling. Once created, its items cannot be added, removed, or changed.

```python
point = (3, 4)           # parentheses, not brackets
single = (5,)            # note the comma — (5) is just the number 5!
```

### Tuple vs List — The Table

| | List | Tuple |
|---|---|---|
| Syntax | `[1, 2]` | `(1, 2)` |
| Mutable? | Yes | **No** |
| Dictionary key? | Never | Yes |
| Use for | Growing collections | Fixed records, coordinates, return values |
| Speed / memory | Slightly heavier | Lighter, hashable |

### Why Immutable Is a Feature

- **Safe to share** — a tuple can't be corrupted by accident (nobody can `t[0] = x`)
- **Hashable** — tuples can be dictionary keys; lists cannot
- **Honest** — `(width, height)` says "this is a fixed shape", not "feel free to grow me"

### The Packing / Unpacking Superpower

```python
point = (3, 4)
x, y = point          # unpacking: x = 3, y = 4
a, b = b, a           # the famous swap — it's tuple packing/unpacking
```

Unpacking is everywhere: `for name, score in pairs:` works because each item is a 2-tuple.

### The One-Element Gotcha

`(5)` is just the integer 5 — parentheses alone don't make a tuple. The **comma** does: `(5,)`. Forgetting the comma is the classic silent bug (and the classic interview smirk).

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| `t[0] = 5` | TypeError — tuples are immutable | Rebuild: `(5,) + t[1:]` |
| `(5)` instead of `(5,)` | A number, not a tuple | Always comma for one item |
| Using a list as a dict key | TypeError: unhashable | Use a tuple instead |
| Trying `.append()` on a tuple | AttributeError | Convert or use a list |

### Quick Self-Test (answers at the bottom)

1. A tuple is — (a) mutable  (b) immutable  (c) unordered  (d) always empty
2. `(5)` is — (a) a 1-tuple  (b) the integer 5  (c) an error  (d) a list
3. Which can be a dictionary key? (a) a list  (b) a tuple  (c) a dict  (d) a set
4. `x, y = (3, 4)` sets — (a) x=3, y=4  (b) x=4, y=3  (c) x=(3,4), y=()  (d) error
5. `t = (1, 2); t.append(3)` — (a) works  (b) AttributeError  (c) returns (1,2,3)  (d) deletes t

**Answers:** 1→b, 2→b, 3→b, 4→a, 5→b.

### Key Takeaway

Tuples are immutable sequences: same indexing and slicing as lists, but no mutation. The comma makes a 1-tuple, tuples (not lists) can be dict keys, and unpacking is the superpower for clean multiple-return and swap code.

---

## 8.3 Dictionaries

### What a Dictionary Is

A **dictionary** stores key→value pairs with **O(1) lookups** — think of a phone book (name → number), not an ordered list.

```python
student = {
    "name": "Aarav",
    "age": 21,
    "subjects": ["DSA", "DBMS"]     # values can be any type
}
```

### The Essential Operations (memorise these 8)

| Operation | What it does | Example → Result |
|---|---|---|
| `d[key]` | Lookup (KeyError if missing) | `student["name"]` → "Aarav" |
| `d.get(key, default)` | Safe lookup | `d.get("x", 0)` → 0 if absent |
| `d[key] = value` | Insert or update | `d["age"] = 22` |
| `key in d` | Membership (O(1)) | `"age" in d` → True |
| `d.keys()` / `d.values()` / `d.items()` | The three views | `d.items()` → pairs |
| `d.update(other)` | Merge — other wins | see the problem below |
| `d.pop(key)` | Remove and return | `d.pop("age")` → 21 |
| `len(d)` | Number of keys | `len(student)` → 3 |

### The Two Lookup Styles — and the Trap

```python
student["absent"]    # KeyError — crashes!
student.get("absent")    # None — graceful
student.get("absent", 0) # 0 — graceful with a default
```

`d[key]` is for keys you *know* exist; `.get()` is for keys that *might* not. The interview question "safe lookup vs crash" lives exactly here.

### Iterating — the Three Views

```python
for key in d:            # keys
for key, value in d.items():   # BOTH — the common one
for value in d.values():       # values
```

### Merge Tricks (the second problem's whole point)

```python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}

merged = {**d1, **d2}      # unpacking — d2 wins on conflicts
merged = d1 | d2           # Python 3.9+ — d2 wins
d1.update(d2)              # mutates d1 — d2 wins
```

All three produce `{"a": 1, "b": 3, "c": 4}` — right-side dict wins the tie.

### The Immutable-Key Rule

Keys must be **immutable** (strings, numbers, tuples) — never lists or dicts. The rule exists because the dictionary *hashes* the key; a key that can change mid-hash breaks the lookup.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| `d[key]` on a missing key | KeyError crash | `d.get(key, default)` |
| Mutable key | TypeError: unhashable type | Use a string or tuple |
| Forgetting which dict wins on merge | Wrong duplicate handling | Right side (`d2`) wins |
| `d.keys()` isn't a list | Can't index it directly | `list(d.keys())` if you need indexing |
| `d = {}` vs `set()` | Empty dict vs empty set confusion | `{}` is a dict; `set()` is a set |

### Quick Self-Test (answers at the bottom)

1. `d = {"a": 1}; d["b"]` — (a) 1  (b) KeyError  (c) None  (d) 0
2. `d.get("b", 0)` on the same d — (a) KeyError  (b) 0  (c) None  (d) 1
3. `{"a":1} | {"a":9}` (3.9+) — (a) {"a": 10}  (b) {"a": 9}  (c) {"a": 1}  (d) error
4. Which is a legal dictionary key? (a) a list  (b) a dict  (c) a tuple  (d) a set
5. `d.items()` yields — (a) keys  (b) values  (c) key-value pairs  (d) lengths

**Answers:** 1→b, 2→b, 3→b, 4→c, 5→c.

### Key Takeaway

Dictionaries are O(1) key→value stores. Use `.get()` for uncertain lookups, iterate with `.items()`, keep keys immutable, and merge with `{**a, **b}` / `a | b` / `update` — right side wins the tie.

---

# 9. Problems

## 9.1 Remove Duplicates from a List

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | List Operations |
| **Companies** | Google, Amazon, Microsoft |

### Problem Statement

Given a list of integers, return a new list with duplicates removed, **preserving the order of first occurrence**. For example, `[3, 1, 3, 2, 1]` → `[3, 1, 2]`. The empty list and a list with no duplicates must pass through unchanged.

### Step-by-Step Solution

**Step 1 — The set + list pattern:**

```
seen = set()
result = []

for x in nums:
    if x not in seen:
        seen.add(x)
        result.append(x)
```

**Step 2 — Why this preserves order:**

```
[3, 1, 3, 2, 1]
x = 3  → not in seen → result = [3], seen = {3}
x = 1  → not in seen → result = [3, 1], seen = {3, 1}
x = 3  → IN seen    → skipped
x = 2  → not in seen → result = [3, 1, 2], seen = {3, 1, 2}
x = 1  → IN seen    → skipped
→ [3, 1, 2] ✅
```

**Step 3 — The shortcut (order-breaking):**

```
list(set(nums))        # removes duplicates but ORDER IS LOST
```

Sets are unordered — only use this when order doesn't matter.

### Answer

| Question | Answer |
|---|---|
| [3, 1, 3, 2, 1] | **[3, 1, 2]** |
| [] | **[]** |
| [7, 7, 7] | **[7]** |
| [1, 2, 3] | **[1, 2, 3]** (unchanged) |
| Pattern | `seen` set + result list |

### Trap to Remember

`list(set(nums))` is the tempting one-liner — and it **destroys the order**, exactly what the problem forbids. The order-preserving pattern needs the `seen` set *and* the result list: one for O(1) checks, one to keep the sequence.

---

## 9.2 Merge Two Dictionaries

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Dictionaries |
| **Companies** | Microsoft, Amazon, Google |

### Problem Statement

Given two dictionaries, return a merged dictionary containing all keys from both. When a key exists in BOTH dictionaries, the value from the SECOND dictionary wins. For example, `{"a": 1, "b": 2}` merged with `{"b": 3, "c": 4}` → `{"a": 1, "b": 3, "c": 4}`.

### Step-by-Step Solution

**Step 1 — The update() way (mutates the first dict):**

```
merged = d1.copy()     # don't destroy the caller's d1!
merged.update(d2)      # d2 wins on conflicts
```

**Step 2 — The unpacking way (new dict, clean):**

```
merged = {**d1, **d2}
```

**Step 3 — The pipe way (Python 3.9+):**

```
merged = d1 | d2
```

**Full trace:**

```
d1 = {"a": 1, "b": 2}    d2 = {"b": 3, "c": 4}
merged = {**d1, **d2}
  "a": from d1 → 1
  "b": d1 says 2, d2 says 3 → d2 wins → 3
  "c": from d2 → 4
→ {"a": 1, "b": 3, "c": 4} ✅
```

### Answer

| Question | Answer |
|---|---|
| merge({"a":1,"b":2}, {"b":3,"c":4}) | **{"a": 1, "b": 3, "c": 4}** |
| merge({}, {"x": 1}) | **{"x": 1}** |
| merge({"x": 1}, {}) | **{"x": 1}** |
| Conflict winner | **The second dictionary (d2)** |
| Non-mutating options | `{**d1, **d2}` or `d1 | d2` |

### Trap to Remember

Two traps. First, **conflict handling**: the second dictionary wins — students reverse it all the time. Second, **mutation**: `d1.update(d2)` destroys the caller's `d1`; if the problem expects d1 to survive, copy first or use the unpacking/pipe forms that build a fresh dict.

---

*Happy studying! — TheWebytes Programming Team*