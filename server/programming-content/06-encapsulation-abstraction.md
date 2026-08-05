# Programming Learning Document — Encapsulation & Abstraction

> A comprehensive, student-friendly guide to the two guardians of clean OOP — hiding the machinery behind a safe wall, and promising a contract without revealing how it's kept.
> Master access modifiers that lock down data, encapsulation that puts guard methods between outsiders and your object's truth, and abstract classes that force every child to honor its promises.

---

# 6. Encapsulation & Abstraction

> **Lesson Overview:** Classes can do more than package data — they can **protect** it. **Encapsulation** bundles an object's data with the methods that own it, and hides the data behind a guarded door (access modifiers + getter/setter methods), so an account's balance can never be silently corrupted. **Abstraction** hides *implementation* behind a clean *interface* — an abstract base class promises "every shape has an area()" without saying how each computes it.
> - **Category:** OOPs
> - **Difficulty:** Medium
> - **Problems:** 2

---

## 6.1 Access Modifiers

### The Problem: Unguarded State

Right now any code holding an account can do this:

```python
acc.balance = -5000       # nobody stops this!
```

A negative balance breaks the meaning of an account — yet nothing in the class prevented it. **Access modifiers** are the language-level doors that lock the data: *public* (anyone), *protected* (family only), *private* (nobody but me).

### The Three Doors

| Modifier | Who can touch it | Idea |
|---|---|---|
| **Public** | Everyone | The open sign |
| **Protected** (`_` in Python, `protected` in Java) | The class and its children | Family-only |
| **Private** (`__` in Python with mangling, `private` in Java) | Only the class itself | Locked room |

```java
public class BankAccount {
    private double balance;        // locked — nobody outside touches it

    public double getBalance() {   // the door with a peephole
        return this.balance;
    }
}
```

### Python's Convention and the Rules That Are Real

Python has no true `private` keyword — privacy is a **gentleman's agreement**:

- `_balance` → private by convention: "don't touch, friend"
- `__balance` → name-mangled to `_ClassName__balance`: the language actively fights outside access (though a determined cheat can still reach it)
- `balance` → public

Java and C# *enforce* privacy with the compiler; Python asks you to respect the underscore. Both carry the same lesson: **data has an owner, and touch-ups go through the owner's doors.**

### The Getter / Setter Pattern

When outsiders need access, they knock politely:

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance          # private by convention

    def get_balance(self):               # read
        return self._balance

    def set_balance(self, amount):       # write — with the chance to validate
        if amount < 0:
            raise ValueError("Balance can't go negative")
        self._balance = amount
```

The setter is a **checkpoint**: every change passes through validation instead of landing on the field directly.

### The Rule of Thumb

> **Fields private, methods public.** Data stays locked; behavior stays open. If an outsider needs the data, they get the *method*, not the field.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Naming `_balance` but never using the guard | Privacy theater — the field is still writable | Route writes through a validated method |
| Public fields everywhere | Corrupt state slips in silently | Default to private, open deliberately |
| Getter without validation | Read is fine, blind writes are the danger | Guard the setter, keep the getter pure |
| Over-exposing with getters/setters | A "class" that is just a public bag | Only expose what callers genuinely need |

### Quick Self-Test (answers at the bottom)

1. `private` (Java) means — (a) public  (b) only the class itself  (c) only children  (d) everyone
2. In Python, the private-by-convention prefix is — (a) `#`  (b) `$`  (c) `_` (underscore)  (d) no symbol needed
3. The getter/setter pattern lets a setter — (a) validate before writing  (b) speed up code  (c) delete the object  (d) change the class name
4. A checkpoint on every write to `balance` — (a) slows nothing and blocks garbage  (b) is impossible  (c) is only for games  (d) duplicates code
5. The data-layer rule of thumb — (a) fields private, methods public  (b) fields public, methods private  (c) everything public  (d) everything protected

**Answers:** 1→b, 2→c, 3→a, 4→a, 5→a.

### Key Takeaway

Access modifiers put doors on data: public for everyone, protected for children, private for the class alone. Privacy is enforced in Java/C++ and agreed-by-underscore in Python. Lock the fields, open the methods, and put a validating checkpoint (a setter or guard method) on every write path.

---

## 6.2 Encapsulation

### The Full Idea

**Encapsulation** = bundle data + the methods that own it (we already do that) **AND** protect the data from unmediated outside writes (we just learned how). Two words: *packaging* and *protection*.

```
              OUTSIDE WORLD
                  │
        polite calls only (methods)
                  ▼
   ┌──────────────────────────────────┐
   │  BankAccount                     │
   │  ╔══════════════════════════════╗│
   │  ║ _owner   (private)           ║│
   │  ║ _balance (private)  ← locked ║│
   │  ╚══════════════════════════════╝│
   │  deposit() │ withdraw() │ get()  │ ← the guarded doors
   └──────────────────────────────────┘
```

The object is a castle: the fields are the treasure rooms (locked), the methods are the gates (open, but watched).

### Why It Beats Bare Variables

`acc.balance += 500` works today — but it bypasses the class's *opinions*:

- A cheque can bounce → balance must never go **negative** (invariant)
- An account can't deposit a **negative amount**
- The owner's name, once set, rarely changes

Bare writes enforce **none** of this. Encapsulation funnels every change through methods that **check then change** — the invariant lives in one place, and every path through it is guarded.

### The Guard Methods — Validating Invariants

```python
def withdraw(self, amount):
    if amount <= 0:                     # a deposit in disguise fails
        return False
    if amount > self._balance:          # insufficient funds — no negative balance
        return False
    self._balance -= amount
    return True

def deposit(self, amount):
    if amount <= 0: return False         # garbage in, rejected out
    self._balance += amount
    return True
```

Balanced only ever changes through these gates → **the invariant "balance ≥ 0" is guaranteed by construction**, not by hope.

### Encapsulation ≠ Just Getters/Setters

A real encapsulated class exposes **behavior**, not handlers:

- ✅ `acc.withdraw(200)` — a *verb*, guarded
- ❌ `acc.setBalance(acc.getBalance() − 200)` — hand-rolling withdraw outside the class, re-introducing the bug it was designed to prevent

The class owns its state and its verbs; outsiders compose the verbs. That division of labour *is* encapsulation.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Getters/setters without guards | Locked fields, wide-open jail | Validate inside the write method |
| Outsiders composing raw math | Invariants get violated through back doors | Export verbs (deposit/withdraw), not field maths |
| Everything private, nothing usable | A class only its own maker can use | Balance privacy with genuinely-needed access |
| Mixing data and logic | The class becomes the whole program | One concern per object |

### Quick Self-Test (answers at the bottom)

1. Encapsulation = — (a) packaging + completeness  (b) bundling data, methods and protection  (c) merging classes  (d) hiding methods too
2. The point of the withdraw guard is — (a) slower code  (b) to keep the balance invariant (never negative)  (c) to confuse callers  (d) to print errors
3. An entry that only ever changes through validated methods — (a) absolutely cannot violate its invariant  (b) breeds bugs  (c) is slower  (d) cannot be read
4. `acc.withdraw(200)` is — (a) an unguarded hack  (b) behavior, exactly what encapsulation wants  (c) a getter  (d) a setName
5. Value being good — (a) every change validated on the surface  (b) every change rebuilt from outside  (c) directly writing the field from the UI  (d) making everything public

**Answers:** 1→b, 2→b, 3→a, 4→b, 5→a.

### Key Takeaway

Encapsulation is protection + packaging: fields locked, behavior open. Funnel every write through a validating method so invariants (balance ≥ 0) hold **by construction** — and expose real verbs like `withdraw()`, never the field maths.

---

## 6.3 Abstract Classes & Interfaces

### The Incomplete Blueprint

A **concrete class** is fully ready — you can ask for objects. An **abstract class** is an incomplete blueprint: it sketches the shape, names the promises (abstract methods), but **cannot itself be instantiated**. You can only build objects of the classes that *complete* the blueprint.

```python
from abc import ABC, abstractmethod

class Shape(ABC):                  # an abstract class
    def __init__(self, name):
        self.name = name

    @abstractmethod                # a promise, not an implementation
    def area(self):
        pass                       # no body — children MUST provide one
```

`Shape()` now fails: you cannot instantiate an incomplete blueprint. But `Circle()` and `Rectangle()` are instantiable only **if they implement `area()`**.

### Abstract Method = A Promise

An **abstract method** has a signature and no body. It says:

> "Any child of mine MUST implement this method. If you forget, you cannot be instantiated either."

Enforced at construction time, by the language. That is abstraction: the *interface* (what `area()` means) is fixed in the parent; the *implementation* (how each shape computes it) lives in the children.

### Abstract Class vs Interface (Java world)

| | Abstract class | Interface |
|---|---|---|
| Can hold concrete fields | Yes | No |
| Can implement some methods | Yes | Modern: default methods yes, classic: no |
| A class can | Extend ONE | Implement MANY |
| Role | Partial blueprint | Pure contract |

Python has no separate interface keyword — an abstract class with only abstract methods *is* your interface.

### Why It Beats a Concrete Parent

Compare with lesson 5's `Shape` (a real class whose `area()` returned 0):

- **Concrete `Shape`**: a child can "forget" to override `area()` and silently return 0 — a bug wearing a smile.
- **Abstract `Shape`**: forgetting is **impossible** — the child cannot exist until it implements `area()`.

Abstraction moves the safety from *discipline* (student must remember) to *enforcement* (language refuses). That is the whole upgrade.

### The Polymorphism Payoff

Abstract types give polymorphism its safest form: code written against `Shape` is **guaranteed** every object under it knows `area()` — because the language checked at construction time. No missing-method crashes at the call site, ever.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Instantiating the abstract | Error — that's the design working | Build the children instead |
| Forgetting an abstract method in a child | Child is abstract too → can't be instantiated | Implement every abstract method |
| Making everything concrete | "Forgetting" the override returns the placeholder silently | Abstract the contract |
| Over-abstracting | Inheritance chains nobody understands | Abstract only genuinely-shared contracts |

### Quick Self-Test (answers at the bottom)

1. An abstract class — (a) can be instantiated directly  (b) cannot be instantiated directly — incomplete blueprint  (c) cannot be inherited  (d) has no methods
2. A concrete subclass of an abstract class must — (a) implement the abstract methods  (b) copy the parent  (c) delete the abstract  (d) return 0
3. The danger of lesson 5's concrete `Shape.area()` (returning 0) — (a) children "forget" and silently get 0  (b) children crash  (c) the parent is too fast  (d) names get long
4. Python abstract classes come from — (a) `from abc import ABC, abstractmethod`  (b) `import math`  (c) `import random`  (d) `import os`
5. A child that forgets an abstract method — (a) still works  (b) becomes abstract itself (or errors on instantiation)  (c) deletes the parent  (d) duplicates the parent

**Answers:** 1→b, 2→a, 3→a, 4→a, 5→b.

### Key Takeaway

An abstract class is an incomplete blueprint: no instantiation, abstract methods as promises. Children that forget a promise cannot exist — the language enforces the contract instead of hoping. Abstract the interface, implement the details, and polymorphism becomes crash-proof by construction.

---

# 7. Problems

## 7.1 Encapsulation in a Class

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Encapsulation |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Re-build the Bank Account as an **encapsulated** class:

1. Constructor that takes owner (string) and an optional starting balance (default 0).
2. `_balance` stored as a **private-by-convention** attribute.
3. `deposit(amount)`: rejects nothing — returns False for non-positive amounts, otherwise adds to the balance (True).
4. `withdraw(amount)`: returns False for non-positive or insufficient amounts; otherwise subtracts and returns True — **the balance must never go negative**.
5. `get_balance()`: read-only access, always returns the current balance.

### Step-by-Step Solution

**Step 1 — Private field, guarded doors:**

```
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance          # private by convention

    def get_balance(self):               # read-only
        return self._balance
```

**Step 2 — deposit with the positivity guard:**

```
def deposit(self, amount):
    if amount <= 0:
        return False
    self._balance += amount
    return True
```

**Step 3 — withdraw with the double guard (positive + sufficient):**

```
def withdraw(self, amount):
    if amount <= 0:
        return False
    if amount > self._balance:
        return False
    self._balance -= amount
    return True
```

**Step 4 — Why this protects the invariant:**

```
acc = BankAccount("Aarav", 500)
acc.deposit(300)      →  800 (guarded: 300 > 0 ✓)
acc.withdraw(900)     →  False. (900 > 800 → rejected → balance = 800)
acc.withdraw(200)     →  True, 600
acc.get_balance()     →  600
```

### Answer

| Question | Answer |
|---|---|
| after deposit(300) from 500 | **800** |
| withdraw(900) | **False**, balance still **800** |
| withdraw(200) | **True**, balance = **600** |
| get_balance() | **600** |
| Could acc._balance go negative? | **No** — the only write paths are the guarded methods |

### Trap to Remember

The point is not the letters `_balance` — it is that **no write to the balance happens outside `deposit`/`withdraw`**. If the demo code set `acc._balance = -9000` directly, the class's ownership is defeated. Encapsulation is a discipline the underscore documents, and the validating methods *enforce* it.

---

## 7.2 Abstract Base Class Example

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Abstract Classes & Interfaces |
| **Companies** | Amazon, Microsoft, Google |

### Problem Statement

Rebuild the Shape hierarchy as an **abstract** base class:

1. `Shape` (abstract) with a constructor storing a name, and an **abstract `area()`** method (a promise — no body).
2. `Circle(Shape)` with a radius, **must implement** `area()` = 3.14159 × radius².
3. `Rectangle(Shape)` with length and width, **must implement** `area()` = length × width.
4. Demonstrate: `Shape()` must fail; Circle and Rectangle must each compute their own area.

### Step-by-Step Solution

**Step 1 — The abstract contract:**

```
from abc import ABC, abstractmethod

class Shape(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def area(self):
        pass
```

**Step 2 — the children are forced to fulfill the promise:**

```
class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius

    def area(self):                     # MUST exist — or Circle stays abstract
        return 3.14159 * self.radius ** 2
```

**Step 3 — why the compiler beats discipline:**

```
Shape()                  # ERROR: cannot instantiate the abstract class
                            (forgetting area() below is impossible)

for shape in [Circle(7), Rectangle(4, 5)]:
    print(shape.area())  # 153.94 / 20 — each override, guaranteed present
```

### Answer

| Question | Answer |
|---|---|
| `Shape()` | **Error** — abstract, cannot instantiate |
| Circle(7).area() | **153.94** |
| Rectangle(4, 5).area() | **20** |
| A child forgetting area() | Cannot be instantiated — the contract holds |
| The loop's guarantee | Every child *must* provide area() — no missing-method crashes |

### Trap to Remember

From lesson 5, `Shape.area()` returned 0 wheels — a child that "forgot" the override silently handed out 0. Abstraction is the fix: making `area()` abstract means forgetting is *impossible*. The trap is thinking abstraction is "abstract" — it is a move for the language to enforce what good habits alone could not.

---

*Happy studying! — TheWebytes Programming Team*