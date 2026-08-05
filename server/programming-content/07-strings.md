# Programming Learning Document — Strings

> A comprehensive, student-friendly guide to text — the data type every program meets at the door, and the string methods that slice, search, and transform it.
> Master string basics (immutability, indexing, slicing), the workhorse methods (join, split, replace, case), and the two classic placement problems: Reverse a String and Count Vowels.

---

# 7. Strings

> **Lesson Overview:** Text arrives from users, files, and APIs as **strings** — and strings are sneaky: they are **immutable** (every "change" actually creates a new string), they support **indexing and slicing** like lists, and they carry a rich toolbox of methods (split, join, replace, strip, case conversion). This lesson builds the toolkit, then applies it to the two most-asked warm-up problems in interviews: reversing a string and counting vowels.
> - **Category:** Data Handling & Collections
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 7.1 String Basics & Methods

### What a String Is

A **string** is a sequence of characters — letters, digits, spaces, punctuation — usually held in double or single quotes. "Hello" is a string; `42` is not.

```python
name = "Aarav"        # 5 characters: A a r a v
empty = ""            # the empty string (length 0)
```

### The Golden Rule: Strings Are Immutable

> **You cannot change a string.** Every "edit" actually builds a **brand-new** string and discards the old one.

```python
word = "cat"
word[0] = "r"          # TypeError: 'str' object does not support item assignment

word = "r" + word[1:]  # this works: builds a NEW string "rat", rebinds word
```

This is the #1 exam trap. `word.upper()` doesn't "uppercase word" — it *returns* a new string; the original stays put:

```python
s = "hello"
s.upper()          # returns "HELLO" — s is STILL "hello"
s = s.upper()      # only now does s point at the new string
```

### Indexing and Slicing — Strings Are Sequences

Characters have positions starting at **0**; negative indices count from the end:

```
"  A  a  r  a  v  "
    0  1  2  3  4
   -5 -4 -3 -2 -1
```

```python
s = "Aarav"
s[0]      # 'A'
s[-1]     # 'v'  (last character)
s[1:4]    # 'ara' (start included, end EXCLUDED — the half-open slice)
s[::-1]   # 'varaA' — the reversal trick (see the problem below)
```

### The Workhorse Methods (memorise these 10)

| Method | What it does | Example → Result |
|---|---|---|
| `len(s)` | Length (a function, not a method) | `len("Aarav")` → 5 |
| `s.upper()` / `s.lower()` | Case conversion (returns new string) | `"Hello".lower()` → `"hello"` |
| `s.strip()` | Removes surrounding whitespace | `"  hi  ".strip()` → `"hi"` |
| `s.split(sep)` | Splits into a list | `"a,b,c".split(",")` → `["a","b","c"]` |
| `sep.join(list)` | Joins a list into one string | `"-".join(["a","b"])` → `"a-b"` |
| `s.replace(old, new)` | Substitutes text | `"cat".replace("c","r")` → `"rat"` |
| `s.startswith(x)` | Boolean check | `"hello".startswith("he")` → True |
| `s.find(x)` | Index of first match (−1 if absent) | `"banana".find("na")` → 2 |
| `s.isdigit()` | All characters digits? | `"123".isdigit()` → True |
| `s.count(x)` | How many non-overlapping matches | `"banana".count("na")` → 2 |

### The Join/Split Mirror

`split` and `join` are exact opposites — the #2 exam trap is using them the wrong way round:

```python
words = ["hello", "world"]
joined = " ".join(words)     # "hello world" — join is called ON the separator
back   = joined.split(" ")   # ["hello", "world"] — split is called ON the text
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Mutating a string | TypeError — strings are immutable | Rebuild and rebind (`s = s.upper()`) |
| Half-open slicing | `s[0:3]` gives 3 chars, not 4 | Remember: end index is EXCLUDED |
| Forgetting `.join`'s owner | `words.join(" ")` — AttributeError | The separator joins: `" ".join(words)` |
| `==` on objects | Not a string issue — but case matters | Normalise first (`s.lower()`) |
| Index out of range | `s[10]` on a 5-char string — IndexError | Check `len(s)` first |

### Quick Self-Test (answers at the bottom)

1. `s = "abc"; s[0] = "x"` — (a) works  (b) TypeError — strings are immutable  (c) makes a new string  (d) deletes s
2. `s = "Hello"; s.lower()` leaves s as — (a) "hello"  (b) "Hello"  (c) "HELLO"  (d) "" 
3. `"a,b,c".split(",")` returns — (a) `["a,b,c"]`  (b) `["a","b","c"]`  (c) `"abc"`  (d) 3
4. `" ".join(["x","y"])` returns — (a) `"x y"`  (b) `["x","y"]`  (c) `"xy"`  (d) error
5. `"hello"[1:4]` is — (a) `"ell"`  (b) `"hell"`  (c) `"ello"`  (d) `"e"`

**Answers:** 1→b, 2→b, 3→b, 4→a, 5→a.

### Key Takeaway

Strings are immutable sequences: you rebuild, never edit. Index and slice like a list (half-open slices!), and lean on the ten workhorse methods — especially the split/join mirror. When in doubt, `s = s.method()` rebinds to the result.

---

## 7.2 String Formatting

### Why Formatting Matters

Printing text with values jammed inside is a daily task — "Hello, Aarav! You have 3 new messages." String formatting is the clean way to build such output, instead of ugly concatenation chains.

### The Three Families

**1. Concatenation (the naive way):**

```python
print("Hello, " + name + "! You have " + str(count) + " new messages.")
```

Works, but unreadable, and every value needs `str()` conversion.

**2. f-strings (Python 3.6+, the modern way):**

```python
print(f"Hello, {name}! You have {count} new messages.")
```

Braces interpolate expressions directly — including method calls and math: `f"{price * qty:.2f}"`.

**3. .format() (the older standard, still seen in exams):**

```python
print("Hello, {}! You have {} new messages.".format(name, count))
```

### Format Specifiers — the Quick Table

| Specifier | Meaning | Example → Result |
|---|---|---|
| `{x}` | Interpolate the value | `f"{5}"` → `"5"` |
| `{x:.2f}` | Two decimals | `f"{3.14159:.2f}"` → `"3.14"` |
| `{x:>5}` | Right-align, width 5 | `f"{42:>5}"` → `"   42"` |
| `{x:<5}` | Left-align, width 5 | `f"{42:<5}"` → `"42   "` |
| `{x:05d}` | Zero-pad to 5 digits | `f"{42:05d}"` → `"00042"` |
| `{x:,}` | Thousands separator | `f"{1234567:,}"` → `"1,234,567"` |

### The Count-Vowels Connection

Formatting shines when reporting results. A vowel counter is trivial to write — but producing *"The string 'Aarav' contains 3 vowels."* cleanly is where formatting earns its keep.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting `str()` in concatenation | TypeError: can only concatenate str | f-strings handle it automatically |
| `{x:0.2f}` vs `{x:.2f}` | Misplaced zero — wrong format | `.2f` = two decimals; `0` before `d` pads |
| Empty braces confusion | `"{} {}".format(a, b)` — positional | Modern code prefers f-strings |
| Modifying inside braces | `f"{count = }"` includes the name | Keep braces for values only |

### Quick Self-Test (answers at the bottom)

1. `f"{3.14159:.2f}"` → — (a) 3.14  (b) 3.14159  (c) 3.15  (d) error
2. `f"{42:05d}"` → — (a) 42  (b) 00042  (c) 0000042  (d) 42.00
3. `f"{1234567:,}"` → — (a) 1234567  (b) 1,234,567  (c) 1234,567  (d) 12,345,67
4. Which prints `"Hi Aarav"`? (a) `f"Hi {name}"` with name="Aarav"  (b) `f"Hi" + name`  (c) `"Hi {name}"`  (d) `f"{Hi} {name}"`
5. `"{} has {} vowels".format("Aarav", 3)` → — (a) Aarav has 3 vowels  (b) error  (c) {} has {} vowels  (d) 3 has Aarav vowels

**Answers:** 1→a, 2→b, 3→b, 4→a, 5→a.

### Key Takeaway

Build output with f-strings — braces interpolate any expression, and format specifiers (`:.2f`, `:05d`, `:,`) do the presentation work. Skip concatenation chains and `str()` everywhere; the f-string is both cleaner and faster to read.

---

# 8. Problems

## 8.1 Reverse a String

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | String Basics & Methods |
| **Companies** | Google, Amazon, Microsoft |

### Problem Statement

Given a string s, return the string reversed. For example, `"hello"` → `"olleh"` and `"Aarav"` → `"varaA"`. You must handle the empty string and single-character strings correctly (both reverse to themselves).

### Step-by-Step Solution

**Step 1 — The one-line trick (slicing):**

```
reversed_string = s[::-1]
```

The slice `[::-1]` reads the sequence backwards — start at the end, step −1.

**Step 2 — The manual loop (no built-in trick):**

```
result = ""
for ch in s:
    result = ch + result     # prepend each character
return result
```

`"h"` → `"eh"` → `"leh"` → `"lleh"` → `"olleh"`. Prepending builds the reverse.

**Step 3 — The two-pointer swap (if the language allows mutation):**

```
left, right = 0, len(s) - 1
while left < right:
    swap(s[left], s[right])
    left += 1
    right -= 1
```

**Full trace (loop version on "cat"):**

```
result = ""
ch = 'c' → result = "c"
ch = 'a' → result = "ac"
ch = 't' → result = "tac"  → "cat" reversed is "tac" ✅
```

### Answer

| Question | Answer |
|---|---|
| reverse("hello") | **"olleh"** |
| reverse("Aarav") | **"varaA"** |
| reverse("") | **""** (empty stays empty) |
| reverse("z") | **"z"** (single char stays itself) |
| Slice notation | `s[::-1]` |

### Trap to Remember

Remembering that slicing is **half-open** matters here: `s[::-1]` is the only magic you need — do NOT fall for `s[::-2]` (that skips characters). And in the loop version, prepending (`ch + result`) is the entire trick — appending (`result + ch`) would return the string unchanged.

---

## 8.2 Count Vowels

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | String Formatting |
| **Companies** | Microsoft, Amazon, Google |

### Problem Statement

Given a string s, count how many vowels (a, e, i, o, u) it contains — case-insensitively (both 'A' and 'a' count). Non-alphabetic characters and consonants do not count. Return the count, and report it with a formatted message: `"The string 'hello' contains 2 vowels."`

### Step-by-Step Solution

**Step 1 — Normalise the case:**

```
s = s.lower()          # one case, so 'A' and 'a' both match
```

**Step 2 — The membership check:**

```
vowels = "aeiou"
count = 0
for ch in s:
    if ch in vowels:
        count += 1
```

`"hello"` → h(no) e(yes) l l o(yes) → **2**.

**Step 3 — Format the result:**

```
print(f"The string '{original}' contains {count} vowels.")
```

**Full trace on "Aarav":**

```
"Aarav".lower() → "aarav"
a ✓ a ✓ r ✗ a ✓ v ✗ → count = 3
Output: The string 'Aarav' contains 3 vowels.
```

### Answer

| Question | Answer |
|---|---|
| countVowels("hello") | **2** |
| countVowels("Aarav") | **3** |
| countVowels("AEIOU") | **5** (case-insensitive) |
| countVowels("xyz123") | **0** |
| `"hello"` check details | e and o only |

### Trap to Remember

Two traps. First, **case**: without `.lower()`, `"AEIOU"` would score 0 — the 'A' never equals 'a'. Second, `ch in vowels` on a lowercase string is the elegant membership test — do not hand-write `if ch == 'a' or ch == 'e' or ...` and certainly don't forget 'u'!

---

*Happy studying! — TheWebytes Programming Team*