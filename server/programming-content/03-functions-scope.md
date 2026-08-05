# Programming Learning Document — Functions & Scope

> A comprehensive, student-friendly guide to Functions & Scope — the superpower that turns one-time scripts into reusable, organised programs.
> Master the recipe anatomy of functions (header · body · dish), the parameters-return handshake with default value fallbacks, and the scope rules that decide which variables your code can actually see.

---

# 3. Functions & Scope

> **Lesson Overview:** Learn how to package code into **functions** — named recipes you can call any time — how **parameters** and **return values** pass data in and out, and how **variable scope** decides what each part of your program can see.
> - **Category:** Programming Foundations
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 3.1 Defining Functions

### The Simple Idea — A Function Is a Recipe

A **function** is a named block of code that you write once and run as many times as you like. Think of it as a cooking recipe: the recipe doesn't make the dish by itself — you have to *follow* it. Calling the function is "following the recipe".

```
def make_chai(milk, sugar):     ← PART 1: the header (name + ingredients)
    boil(milk)                  ← PART 2: the body (the steps, indented)
    add(sugar)
    return cup                  ← PART 3: the dish (what comes out)
```

### The Recipe Anatomy (Memorise the Three Parts)

| Part | Name | What it is | In the recipe |
|---|---|---|---|
| `def name(ingredients):` | **Header** | The recipe's name + what it needs | `def make_chai(milk, sugar):` |
| indented lines | **Body** | The steps, run top-to-bottom | `boil(milk)` / `add(sugar)` |
| `return value` | **Dish** | The result handed back to the caller | `return cup` |

### Why Functions Exist — The 4 P's

✅ **Package** — write the logic once, call it from a hundred places
✅ **Protect** — fix a bug in one place and every caller benefits
✅ **Puzzle-ize** — split a huge problem into small, testable pieces
✅ **Prove** — test one recipe at a time instead of debugging a wall of code

> **The Golden Rule: a function does ONE job well.** If the name needs the word "and" in it (`get_total_and_save`), split it in two.

### Naming a Function

Follow the same rules as variables, but make names **verb-first** — a function *does* something:

- `get_total()` — reads like an action ✅
- `total` — could be a value, not an action ❌
- `is_valid()`, `calculate_area()`, `send_email()` — all actions

### The Header Anatomy

```
def   calculate_area (  length,  width  )   :
 │      └── name ──┘    └params┘     │
 the keyword          inputs in     the colon
 that starts          parentheses
 the function
```

The body must be **indented** (convention: 4 spaces). Every line under the header belongs to the function; the first un-indented line ends it.

### Calling a Function

You call a function by its name with parentheses — and pass the values (arguments) it needs:

```python
def greet(name):
    print("Hello, " + name + "!")

greet("Aarav")   # Hello, Aarav!
greet("Meera")   # Hello, Meera!
```

Each call runs the whole body with that call's value. No need to copy-paste the greeting code anywhere.

### The Three Silent Killers

| Trap | What goes wrong | The fix |
|---|---|---|
| Missing colon after the header | Syntax error the moment the file loads | End the header with `:` |
| Body not indented | Code silently outside the function | Indent every body line 4 spaces |
| Calling before defining | `NameError: name 'greet' is not defined` | Define first, call after |

### Quick Self-Test (answers at the bottom)

1. The three parts of a function are — (a) name, args, return  (b) header, body, dish  (c) def, if, loop  (d) input, output, error
2. Which is the best function name? (a) `x`  (b) `calculate_area`  (c) `calc`  (d) `area_only_please_123`
3. What runs when `greet("Aarav")` is called? (a) The body with name = "Aarav"  (b) Nothing  (c) The whole file  (d) Only the header
4. The Golden Rule of functions is — (a) write as many lines as possible  (b) do ONE job well  (c) always use recursion  (d) never use parentheses
5. An un-indented body means — (a) the code is inside the function  (b) the code is outside the function  (c) a faster program  (d) an error in the header

**Answers:** 1→b, 2→b, 3→a, 4→b, 5→b.

### Key Takeaway

A function is a named recipe with three parts — header, body, dish. Write it once, call it anywhere, give it an action-name, and keep it to one job. The most common failures are boring but brutal: a missing colon, a forgotten indent, or a call before the definition.

---

## 3.2 Parameters & Return Values

### The Simple Idea

**Parameters** are the recipe's ingredients — placeholders written in the header. **Arguments** are the actual values you hand over when you call. **`return`** is the dish — the value your function sends back to the caller.

```
def area(length, width):    ← length, width = PARAMETERS (placeholders)
    return length * width

a = area(5, 3)              ← 5, 3 = ARGUMENTS (the real values)
```

### The Call ↔ Parameter Handshake

Arguments bind to parameters **by position**: the 1st argument meets the 1st parameter, the 2nd meets the 2nd, and so on.

```
area(5, 3)   →  length = 5, width = 3   →  5 × 3 = 15
area(4, 6)   →  length = 4, width = 6   →  4 × 6 = 24
```

Swap the order and you hand the values to the wrong ingredients.

### The Two Doors: `print` vs `return`

The #1 beginner bug is *printing when you should return*. They are not the same:

| You want to… | Use | What happens |
|---|---|---|
| Show text on screen | `print(value)` | Side-effect; the function returns `None` |
| Hand a value back for storage/comparison | `return value` | Caller receives the actual value |

```python
def a():
    print(5)     # prints "5" but returns None
def b():
    return 5     # prints nothing, returns the number 5

x = a()          # x = None
y = b()          # y = 5 — the value is really captured
```

### Default Parameters — The Fallback Values

A **default parameter** gives a placeholder a value to use when the caller doesn't send one.

```python
def area(length, width=None):     # width has a fallback
    if width is None:
        width = length            # square! width defaults to length
    return length * width

area(5, 3)   # 15 — both arguments supplied
area(4)      # 16 — width falls back to 4 → square 4 × 4
```

### The Default-Position Rule

Defaults must come **after** required parameters. `def f(a, b=2)` is valid; `def f(a=1, b)` is a syntax error — the language can't tell what the caller meant when a required parameter sits behind an optional one.

### The Mutable-Default Trap

Never use a mutable value (an empty list `[]` or dict `{}`) as a default. It is created **once** at definition time and **shared** by every call — changes to it in one call leak into the next.

```python
def push(item, items=[]):    # BAD — the list is shared!
    items.append(item)
    return items

push(1)   # [1]
push(2)   # [1, 2]   ← the first call's list came back!

def push(item, items=None):  # GOOD — fresh list each call
    if items is None:
        items = []
    items.append(item)
    return items
```

### Worked Example — The Full Trace

```
area(4)          area(5, 3)
│                │
▼                ▼
length = 4       length = 5   width = 3
width = None     width = 3
└─ None? yes     └─ width given → keep 3
   width = 4         return 5 × 3 = 15
   return 4 × 4 = 16
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting `return` | Function silently returns `None` | End with `return value` |
| Reversed arguments | `area(3, 5)` swaps the meaning | Match positions: 1st→1st |
| Mutable default | Shared list/dict across calls | Default `None`, create inside |
| Too many / too few args | `TypeError` at the call | Count the parameters |

### Quick Self-Test (answers at the bottom)

1. `area(5, 3)` binds — (a) length=3, width=5  (b) length=5, width=3  (c) length=5, width=None  (d) length=None, width=None
2. A function that only `print`s a value returns — (a) the printed value  (b) `None`  (c) the string of the value  (d) an error
3. `area(4)` with `width=None` default returns — (a) 4  (b) 16  (c) 8  (d) 0
4. `def foo(a=1, b)` is — (a) valid  (b) a syntax error (default before required)  (c) valid only in Java  (d) slower
5. The mutable-default fix is — (a) default `None`, make the list inside  (b) never use lists  (c) use a global list  (d) default `[]`

**Answers:** 1→b, 2→b, 3→b, 4→b, 5→a.

### Key Takeaway

Parameters are the ingredients, arguments are the real values, and `return` is the dish the caller can actually keep. Print shows, return supplies; defaults give parameters a fallback — but they must come last and never be mutable.

---

## 3.3 Variable Scope

### The Simple Idea

**Scope** is the visibility zone of a variable — the region of code where that name is in play. A variable defined inside a function is **local** (only that function can see it). A variable defined at the top level is **global** (everything can see it).

### The Scope Map

```
+--------------------------------------------------+
| GLOBAL ZONE  (module level)                      |
|   price = 100        ← visible EVERYWHERE        |
|                                                  |
|   def discount():                                |
|       off = 20       ← LOCAL to discount only    |
|       return price - off                         |
+--------------------------------------------------+
```

Here `price` is global — `discount()` can read it. `off` is local — nothing outside `discount()` can see it.

### The Read/Write Rule (The Crux of Scope)

- **READ a global inside a function** → perfectly allowed. The function can look out and see it.
- **ASSIGN inside a function** → creates a brand-new **local** variable, even if a global with the same name exists. This is called **shadowing**.

### The Shadow Trap

```python
x = 10

def change():
    x = 5          # NOT the global x — a NEW local x!
    print(x)       # 5 (inside)

change()
print(x)           # 10 (global untouched)
```

The assignment inside `change()` does not touch the global — it builds a shadow copy. If you *want* to modify the global inside a function you need the `global` keyword, which is rare and usually a code smell. The clean pattern is to pass values as parameters and receive the result through `return`.

### The Scope Ladder (Where a Name Is Found)

When your code uses a name, the language searches this order — first match wins:

```
1. LOCAL     — inside the current function
2. GLOBAL    — module level, outside any function
3. BUILT-IN  — the language's own names (print, len, ...)
```

### Worked Example — Factorial's Variables

In the factorial problem, `n` (the parameter) and `result` are **local** to the function. Even if a global `n = 100` exists, calling `factorial(5)` uses its own local `5` — the parameter *shadows* the global for the duration of the call, and the global is untouched afterwards.

```
global:  n = 100
call:    factorial(5)
         → inside: n = 5 (local copy of the parameter)
         → loop builds result = 120
         → return 120; global n stays 100
```

### Loops and Scope

Loop variables are **not** block-scoped in Python — `i` from a `for` loop still exists after the loop ends, inside the same function. Java *does* scope them to the loop block. Knowing this explains small surprises like reusing `i` later.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Shadowing | New local hides the global | Rename, or pass as a parameter |
| Assuming the global changed | `change()` left `x` = 10 | Use the `return` value instead |
| Reading before assigning | `NameError` inside a function | Initialise the variable first |
| Loop variable afterlife | `i` still alive after the loop | Reuse it on purpose, not by accident |

### Quick Self-Test (answers at the bottom)

1. A variable defined inside a function is — (a) global  (b) local  (c) built-in  (d) invisible
2. Reading a global inside a function is — (a) forbidden  (b) allowed  (c) only with `import`  (d) an error
3. `x = 5` inside a function where a global `x` exists — (a) changes the global  (b) creates a new local  (c) errors  (d) deletes the global
4. Search order for a name is — (a) global → local → built-in  (b) local → global → built-in  (c) built-in → local → global  (d) random
5. In Python, a loop variable after the loop ends — (a) is deleted  (b) still exists  (c) errors  (d) becomes global

**Answers:** 1→b, 2→b, 3→b, 4→b, 5→b.

### Key Takeaway

Scope is who-can-see-what: locals live inside a function, globals live at the top, and the ladder looks local-first. Reading a global is free; assigning inside a function makes a shadow copy. Pass values in, return results out — and leave the `global` keyword alone.

---

# 4. Problems

## 4.1 Function with Default Arguments

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Parameters & Return Values |
| **Companies** | Google, Microsoft, Amazon |

### Problem Statement

Write a function `calculate_area(length, width)` that returns the area of a rectangle. The `width` argument is **optional** — when it is not passed, the shape is treated as a **square**, so the function must use the length as the width.

- `calculate_area(5, 3)` must return 15 (5 × 3)
- `calculate_area(4)` must return 16 (4 × 4, a square)

```
Input:  calculate_area(5, 3)
Output: 15

Input:  calculate_area(4)
Output: 16
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| calculate_area(5, 3) | 15 | 5 × 3 = 15 |
| calculate_area(4) | 16 | width omitted → square: 4 × 4 = 16 |
| calculate_area(7, 2) | 14 | 7 × 2 = 14 |
| calculate_area(10) | 100 | width omitted → square: 10 × 10 = 100 |

### Constraints

- length and width are positive numbers (int or float, no negatives)
- width may be omitted entirely
- Do not use loops or any data structure — one formula

### Approach

**Understanding the problem**

The twist is the *optional* dimension. When `width` is supplied, ordinary multiplication. When it's missing, the caller expects the square rule — `area = length × length`. The classic mistake is hard-coding a default like `width = 0`, which would turn `calculate_area(4)` into `4 × 0 = 0`. The correct fallback must copy the length itself.

**The None-Guard pattern**

Set the default to `None` (a value that means "nothing was passed"), then branch:

```
1. If width is None  →  width = length   (the square rule)
2. Return length × width
```

```
calculate_area(5, 3):
    width = 3 (given)  →  return 5 × 3 = 15 ✅

calculate_area(4):
    width = None       →  width = 4 (square rule)
                       →  return 4 × 4 = 16 ✅
```

**Why default `None` instead of 0?**

`0` is a real number — `calculate_area(4)` would silently answer 0, and you'd never notice the caller forgot the width. `None` is a sentinel meaning "absent", so it can be told apart from any legal value.

**The default-position rule**

In any language, default parameters must come after required ones (`width` after `length`) — putting the fallback first is a syntax error.

**Complexity Analysis**

- **Time: O(1)** — one comparison and one multiplication.
- **Space: O(1)** — a couple of numbers, nothing stored.

**Edge cases**

- `calculate_area(0, 5)` → 0 (valid: a zero area)
- `calculate_area(2.5)` → 6.25 (floats work too)
- Never use a mutable default like `[]` here — for a value function it's unnecessary and dangerous.

### Code

```python
def calculate_area(length, width=None):
    if width is None:        # the square rule: no width given
        width = length
    return length * width

print(calculate_area(5, 3))   # 15
print(calculate_area(4))      # 16
```

```javascript
function calculateArea(length, width) {
    if (width === undefined) width = length;  // square rule
    return length * width;
}

console.log(calculateArea(5, 3));   // 15
console.log(calculateArea(4));      // 16
```

```java
public static double calculateArea(double length, Double width) {
    if (width == null) width = length;   // square rule
    return length * width;
}
// calculateArea(5, 3) == 15.0
// calculateArea(4, null) == 16.0
```

## 4.2 Factorial (Iterative)

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Variable Scope |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Write a function `factorial(n)` that returns `n!` — the product of all integers from 1 to n. Use a **loop** (NOT recursion). By convention, `0! = 1`.

- `factorial(5)` = 1 × 2 × 3 × 4 × 5 = 120
- `factorial(0)` = 1 (by definition)

```
Input:  n = 5
Output: 120   (1 × 2 × 3 × 4 × 5)
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| n = 5 | 120 | 1 × 2 × 3 × 4 × 5 = 120 |
| n = 0 | 1 | 0! is defined as 1 |
| n = 1 | 1 | 1! = 1 |
| n = 4 | 24 | 1 × 2 × 3 × 4 = 24 |

### Constraints

- n is a non-negative integer up to 20
- Must use iteration (a loop), not recursion
- No extra data structures needed

### Approach

**Understanding the problem**

Factorial multiplies a *running total*: start at 1, then multiply by 2, then 3, and so on up to n. Each multiplication is `result = result × i`.

**The Loop Idea**

```
1. result = 1
2. For i = 2 to n:   result = result × i
3. Return result
```

Why start at 2? Multiplying by 1 changes nothing — starting at 2 avoids one wasted step. For n < 2, the loop body never runs and the initial 1 is returned: that single rule handles both `factorial(0) = 1` and `factorial(1) = 1` for free.

**Step-by-Step Trace on n = 5**

```
result = 1
i = 2 → result = 1 × 2 = 2
i = 3 → result = 2 × 3 = 6
i = 4 → result = 6 × 4 = 24
i = 5 → result = 24 × 5 = 120  → stop

Answer: 120 ✅
```

**Scope in action**

`n` (the parameter) and `result` are **local** to the function — a global `n` elsewhere is untouched, which is exactly the scope lesson: the parameter shadows any outer name for the duration of the call.

**Why not recursion for this one?**

Recursion is elegant but uses the call stack — for n = 20 the iterative loop is simpler, faster, and cannot overflow the stack. The problem asks for iteration deliberately.

**Complexity Analysis**

- **Time: O(n)** — the loop runs n − 1 times.
- **Space: O(1)** — only `result` and the loop counter.

**Edge case / overflow note**

Factorials explode: 20! = 2,432,902,008,176,640,000 already exceeds a 32-bit int. That is why the constraint caps n at 20 — beyond it you need a bigger numeric type.

### Code

```python
def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print(factorial(5))   # 120
print(factorial(0))   # 1
```

```javascript
function factorial(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

console.log(factorial(5));   // 120
console.log(factorial(0));   // 1
```

```java
public static long factorial(int n) {
    long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;      // long avoids overflow up to ~20!
    }
    return result;
}
// factorial(5) == 120
// factorial(0) == 1
```