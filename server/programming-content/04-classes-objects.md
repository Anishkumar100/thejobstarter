# Programming Learning Document — Classes & Objects

> A comprehensive, student-friendly guide to Classes & Objects — the blueprint-and-building idea that turns messy programs into organised worlds of interacting things.
> Master the anatomy of a class, constructors that give every object its own fresh state, and methods — the verbs your objects know how to perform.

---

# 4. Classes & Objects

> **Lesson Overview:** Until now every program was a straight-line set of instructions. Object-Oriented Programming (OOP) reorganises the world: a **class** is a blueprint, and an **object** is a real thing built from that blueprint. This lesson teaches the anatomy of a class (the keyword, the body, the constructor), instance variables that give every object its own private state, and methods — the actions each object can perform.
> - **Category:** OOPs
> - **Difficulty:** Medium
> - **Problems:** 1

---

## 4.1 Defining Classes

### The Blueprint Metaphor

Think of a **class** as an architectural blueprint, and an **object** as a building constructed from that blueprint.

```
   BLUEPRINT (the class)              BUILDINGS (the objects)
   ┌───────────────────────┐          ┌───────────┐  ┌───────────┐
   │ BankAccount           │          │ BankAccount│ │ BankAccount│
   │  - owner: string      │   ───▶   │  owner: "Aarav"  │  owner: "Meera" │
   │  - balance: number    │          │  balance: 5000   │  balance: 200   │
   │  + deposit(amount)    │          │  + deposit()     │  + deposit()    │
   │  + withdraw(amount)   │          │  + withdraw()    │  + withdraw()   │
   └───────────────────────┘          └───────────┘  └───────────┘
```

One blueprint → many buildings. Every building follows the same design, yet each one is a completely independent physical thing: turning on the lights in one building does nothing to the others. **A class describes; an object exists.**

### Class vs Object — The Table

| | Class | Object (instance) |
|---|---|---|
| What is it? | The blueprint / the design | A real thing made from the blueprint |
| How many? | One | Many |
| Made when? | When the file loads | When you *call* the class |
| Example | `BankAccount` | `acc1 = BankAccount()` |
| Analogy | The recipe | The actual dish |

### The Anatomy of a Class

```python
class BankAccount:                 # ← the keyword "class" + PascalCase name + colon
    def deposit(self, amount):     # ← methods: functions INSIDE the class
        self.balance += amount
```

Three ingredients, in order:

| Part | What it is |
|---|---|
| `class Name:` | The keyword, the PascalCase name, the colon |
| indented body | Everything inside the class — its methods |
| methods | Functions that belong to the class and act on its objects |

### Attributes and Methods — Nouns and Verbs

A class bundles two kinds of things:

- **Attributes** (nouns) — data each object has: `owner`, `balance`, `color`, `size`
- **Methods** (verbs) — actions each object can do: `deposit()`, `withdraw()`, `start()`, `stop()`

If a class name is a noun, its attributes are adjectives and its methods are verbs. This one habit makes your classes read like English sentences: `account.withdraw(500)`.

### Creating an Object — Call the Class

An object is born by "calling" the class, exactly like calling a function:

```python
acc1 = BankAccount()   # call the class → brand-new object
acc2 = BankAccount()   # a SECOND, completely separate object
```

`acc1` and `acc2` are independent: changing `acc1`'s data never leaks into `acc2`. That independence is the entire point of OOP.

### Naming Conventions

- **Classes**: PascalCase — `BankAccount`, `ShoppingCart`, `EmailSender`
- **Objects (variables)**: snake_case / camelCase — `bank_account`, `shoppingCart`
- **Methods**: verb-first snake_case — `deposit()`, not `money()`

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting the colon | Syntax error at class load | End the header with `:` |
| Body not indented | Methods silently end up outside the class | Indent every class line 4 spaces |
| Lowercase class name | `bankAccount` reads like a variable | PascalCase: `BankAccount` |
| "Object vs class" confusion | Talking about *the* account instead of *an* account | One blueprint, many buildings |

### Quick Self-Test (answers at the bottom)

1. A class is best compared to — (a) a building  (b) a blueprint  (c) a variable  (d) a loop
2. How many objects can one class create? (a) exactly one  (b) as many as you call the class  (c) two, no more  (d) zero
3. Methods inside a class are — (a) functions  (b) variables  (c) loops  (d) comments
4. Which name follows the class naming convention? (a) `bankAccount`  (b) `BankAccount`  (c) `bank_account`  (d) `bankaccount`
5. Two objects from the same class — (a) share all data  (b) are independent copies  (c) cannot both exist  (d) must have equal values

**Answers:** 1→b, 2→b, 3→a, 4→b, 5→b.

### Key Takeaway

A class is a blueprint — it *describes*; an object is a building — it *exists*. One class, many independent objects. Write classes in PascalCase, bundle nouns (attributes) and verbs (methods), and create objects by calling the class like a function.

---

## 4.2 Constructors & Instance Variables

### The Problem: Every Object Needs Its Own Fresh State

`BankAccount()` creates an object — but an empty shell with no owner and no balance is useless. Every real account needs *its own* starting data: Aarav's account with ₹5,000, Meera's with ₹200. The **constructor** is the special method that runs automatically the moment an object is born, ready to receive that starting data.

### The Constructor — `__init__`

In Python the constructor is always named `__init__` (initialise). It runs **exactly once, automatically**, right after the object is created — you never call it by hand.

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner          # store on the object
        self.balance = balance
```

```
BankAccount("Aarav", 5000)
    │
    ▼  Python secretly does:
    new_obj = <brand-new empty object>
    BankAccount.__init__(new_obj, "Aarav", 5000)
    └── inside __init__: self = new_obj
        self.owner   = "Aarav"
        self.balance = 5000
    return new_obj
```

### `self` — The Object Being Built

`self` is the secret glue of OOP. It is **the current object** — the very instance the constructor is initialising (or the instance a method is acting on). Without `self` the constructor has no way to say *"store this value ON this particular object"*.

> Rule: the first parameter of every instance method is `self`. The language passes it automatically — you never supply it at the call site.

### Instance Variables — Stored on Each Object

`self.owner` and `self.balance` are **instance variables**: each object gets its own private copy. The dot tells the story — `self.owner` means "this object's owner".

```
acc1 = BankAccount("Aarav", 5000)     acc2 = BankAccount("Meera", 200)
acc1.owner   = "Aarav"                acc2.owner   = "Meera"
acc1.balance = 5000                   acc2.balance = 200
```

Changing `acc1.balance` affects nothing but `acc1`. The instance variables are the object's private lockers.

### Reading Attributes — Dot Notation

Once the object exists, any code holding the object can read and write its attributes with a dot:

```python
print(acc1.balance)     # 5000
acc1.balance += 100     # allowed — but direct poking like this is a code smell
```

### Default Values in the Constructor

Like any function, a constructor can give parameters fallback values:

```python
def __init__(self, owner, balance=0):   # balance is optional
    self.owner = owner
    self.balance = balance

BankAccount("Meera")        # balance silently starts at 0
BankAccount("Aarav", 5000)  # balance starts at 5000
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting `self` in `__init__` | TypeError the moment an object is created | First parameter is always `self` |
| Forgetting to store with `self.` | Attribute never saved — `self.owner` missing later | Always assign to `self.xxx` |
| Calling `__init__` by hand | Double initialisation — bad state | Never call it; it runs automatically |
| Constructor name typo | Method never runs — objects born empty | Must be spelled exactly `__init__` |

### Quick Self-Test (answers at the bottom)

1. The constructor in Python is always named — (a) `build`  (b) `init`  (c) `__init__`  (d) `start`
2. The constructor runs — (a) when you call it by name  (b) automatically when an object is created  (c) once per program  (d) only with the `new` keyword
3. `self` inside `__init__` refers to — (a) the class  (b) a global variable  (c) the current instance being built  (d) the first argument
4. `BankAccount("Meera")` with `balance=0` default gives — (a) an error  (b) balance None  (c) balance 0  (d) balance undefined
5. Instance variables are stored — (a) on each object via `self`  (b) in the class only  (c) in global scope  (d) in the file

**Answers:** 1→c, 2→b, 3→c, 4→c, 5→a.

### Key Takeaway

The constructor (`__init__`) runs automatically at birth, takes the starting data, and stores it as **instance variables** on the object via `self`. Every object gets its own private copy — one blueprint, many independent lockers.

---

## 4.3 Methods

### What a Method Is

A **method** is a function that belongs to a class. The only structural difference from a plain function: its first parameter is `self` — the object it is acting on.

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):          # a method — self first!
        self.balance += amount
```

### The Sweet Sugar: `acc.deposit(500)`

Calling a method on an object is shorthand. These two lines are **identical**:

```python
acc.deposit(500)                    # sugar — reads like English
BankAccount.deposit(acc, 500)       # the full truth: object goes in as self
```

The object *before* the dot is automatically passed as `self`. That is the entire trick of method syntax — and why forgetting `self` in the definition breaks every call: the language would try to stuff the object into `amount`.

### Methods Talk to the Object Through `self`

Inside a method, `self` is the object that received the call, so a method can read and update that object's instance variables:

```python
def withdraw(self, amount):
    if amount <= self.balance:        # read the object's own balance
        self.balance -= amount        # update the object's own balance
        return True
    return False
```

`acc1.withdraw(200)` changes only `acc1`'s balance — `acc2`'s locker is untouched.

### The Three Kinds of Methods (brief preview)

| Kind | First param | What it does | When to use |
|---|---|---|---|
| **Instance method** | `self` | Acts on one object's data | Almost everything |
| Class method | `cls` | Acts on the class itself | Factory helpers, shared config |
| Static method | none | Plain function parked in the class | Utilities that need no object data |

This lesson cares about instance methods — the other two are formalities you will meet later.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Missing `self` in the definition | TypeError: method takes N args but 1 was given | First parameter is `self` |
| Calling without parentheses | `acc.deposit` is the method object, not a call | `acc.deposit(500)` |
| Forgetting the dot | Name not found — it lives on the object | `acc.<method>()` |
| Putting logic outside the class | Method-less objects — data has no verbs | Every action on an object is a method |

### Quick Self-Test (answers at the bottom)

1. The only structural difference between a method and a function is — (a) the `self` first parameter  (b) the `return` keyword  (c) indentation  (d) the class keyword
2. `acc.deposit(500)` is shorthand for — (a) `deposit(acc, 500)`  (b) `BankAccount.deposit(acc, 500)`  (c) `BankAccount.deposit(500)`  (d) `acc(500)`
3. Inside `withdraw`, `self.balance` is — (a) a global  (b) the balance of the object that received the call  (c) a local variable  (d) an error
4. A method that only returns a value without touching `self` — (a) is impossible  (b) is still an instance method  (c) must be a loop  (d) crashes
5. Which call is correct? (a) `acc.deposit`  (b) `acc.deposit(500)`  (c) `deposit(acc)`  (d) `BankAccount(500)`

**Answers:** 1→a, 2→b, 3→b, 4→b, 5→b.

### Key Takeaway

A method is a function with `self` first. `acc.deposit(500)` is sugar for `BankAccount.deposit(acc, 500)` — the dot-object is automatically passed as `self`, giving the method access to that one object's state. Verbs on the object, state on the object, both through `self`.

---

# 5. Problems

## 5.1 Build a Simple Class (Bank Account)

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Constructors & Instance Variables |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Create a `BankAccount` class with:

1. A constructor that takes an `owner` (string) and an optional `balance` (number, defaults to 0), storing both as instance variables.
2. A `deposit(amount)` method that adds the amount to the balance.
3. A `withdraw(amount)` method that returns `True` and reduces the balance ONLY when the amount is at most the current balance; otherwise it returns `False` and leaves the balance unchanged — the balance must NEVER go negative.
4. A `get_balance()` method that returns the current balance.

### Step-by-Step Solution

**Step 1 — The constructor stores each object's private state:**

```
def __init__(self, owner, balance=0):
    self.owner = owner
    self.balance = balance
```

The default `balance=0` means `BankAccount("Meera")` starts at zero, while `BankAccount("Aarav", 5000)` starts with a real balance.

**Step 2 — deposit adds through self:**

```
def deposit(self, amount):
    self.balance += amount
```

`self.balance` is *this object's* balance — `acc1.deposit(500)` touches only `acc1`.

**Step 3 — withdraw guards before subtracting:**

```
def withdraw(self, amount):
    if amount <= self.balance:
        self.balance -= amount
        return True
    return False
```

The guard is the heart of the problem: check first, subtract second, and return the truth of what happened. No guard → balance can silently go negative, which is the exact bug the problem forbids.

**Step 4 — get_balance just reports:**

```
def get_balance(self):
    return self.balance
```

**Full trace:**

```
acc = BankAccount("Aarav", 1000)
acc.deposit(500)      →  balance = 1000 + 500 = 1500
acc.withdraw(200)     →  200 ≤ 1500? yes → balance = 1300, return True
acc.withdraw(5000)    →  5000 ≤ 1300? no  → balance stays 1300, return False
acc.get_balance()     →  1300
```

### Answer

| Question | Answer |
|---|---|
| Constructor signature | `__init__(self, owner, balance=0)` |
| After deposit(500) from 1000 | balance = **1500** |
| withdraw(200) result | **True**, balance = **1300** |
| withdraw(5000) result | **False**, balance still **1300** |
| get_balance() at the end | **1300** |

### Trap to Remember

Two traps are in play. First, the **guard order**: checking `amount <= self.balance` BEFORE subtracting is what keeps the balance non-negative — swapping the order creates a negative balance the moment an oversized withdrawal arrives. Second, the **`self` plumbing**: every method's first parameter must be `self` and every state write must be `self.balance = ...` — miss one and calls crash with a TypeError or the state silently lives nowhere.

---

*Happy studying! — TheWebytes Programming Team*
