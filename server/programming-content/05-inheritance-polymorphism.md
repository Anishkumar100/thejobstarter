# Programming Learning Document — Inheritance & Polymorphism

> A comprehensive, student-friendly guide to the two pillars of reuse in Object-Oriented Programming — inheriting a parent's powers, and letting one method name take many forms.
> Master the IS-A relationship (child classes reuse everything the parent has), method overriding (the same verb, a different body), and polymorphism (code that talks to the parent but behaves per the actual object).

---

# 5. Inheritance & Polymorphism

> **Lesson Overview:** After Classes & Objects you can build one class. This lesson shows you how classes **relate**: **inheritance** lets a child class automatically receive everything its parent has (then add its own extras), **method overriding** lets a child swap out a parent's behavior while keeping the name, and **polymorphism** lets a single piece of code work correctly on *any* child — the exact trick that makes big projects extensible.
> - **Category:** OOPs
> - **Difficulty:** Medium
> - **Problems:** 1

---

## 5.1 Inheritance Basics

### The Parent-Child Idea

**Inheritance** is the IS-A relationship between classes: a **child class** (subclass) is a specialised version of a **parent class** (superclass), and therefore inherits — automatically receives — everything the parent defines.

```
      Shape                    ← the PARENT (superclass)
       ▲
       │  is-a
   ┌───┴────┐
 Circle    Rectangle           ← the CHILDREN (subclasses)
```

A Circle *is a* Shape. A Rectangle *is a* Shape. Everything a Shape can do (have a name, compute an area) a Circle can do too — inherited for free.

### The IS-A Test

Before building any hierarchy, ask: **"Is every child genuinely a type of the parent?"** A `Dog` IS-A `Animal` ✅. A `Dog` IS-A `Car` ❌ — inheritance that fails the IS-A test is a design bug that will haunt the project.

### The Syntax — Three Flavours, One Idea

```python
class Circle(Shape):          # Python: parent in parentheses
    ...

class Circle extends Shape    # Java: the extends keyword
class Circle extends Shape    # JavaScript: same keyword
```

### What the Child Inherits

| Inherited for free | Not inherited |
|---|---|
| All the parent's methods | (In some languages) private members |
| All the parent's instance-variable setup via the constructor | The child's own new members (until you add them) |

The child can then:

1. **Keep** a method exactly as the parent wrote it
2. **Override** it — rewrite with the same name (section 5.2)
3. **Add** brand-new methods of its own

### Adding New Powers — The Child's Own Members

```python
class Rectangle(Shape):
    def __init__(self, length, width):
        super().__init__("Rectangle")   # 1. run the parent's constructor
        self.length = length            # 2. then add its own state
        self.width = width

    def diagonal(self):                 # a brand-new method, only Rectangle has it
        return (self.length ** 2 + self.width ** 2) ** 0.5
```

`super()` is the doorway to the parent. Calling `super().__init__("Rectangle")` runs the parent's constructor so the shared "name" state is set up — skipping it leaves the inherited state unbuilt.

### The Method-Lookup Chain

When you call a method on a child object, the language searches: **child first, then parent, then grandparent.** The first match wins. This single rule powers both inheritance and overriding.

```
circle.area()
   │
   ▼
1. Does Circle define area()?   → yes → run Circle's
2. No? Does Shape define area()? → yes → run Shape's
```

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Failing the IS-A test | A `Lizard` extending `LaserPrinter` — nonsense design | Ask "is-a?" before extending |
| Forgetting `super().__init__` | Inherited state never built — missing attributes | Call it first in the child constructor |
| Inheriting to reach one method | Coupling children to a parent they're not a type of | Composition over inheritance |
| Overriding by accident | A child method with the same name silently replaces the parent's | Deliberate names; deliberate overrides |

### Quick Self-Test (answers at the bottom)

1. `class Circle(Shape):` means — (a) Shape is a child of Circle  (b) Circle is a child of Shape  (c) Circle calls Shape once  (d) Circle deletes Shape
2. A child class automatically gets — (a) only the constructor  (b) nothing until it copies code  (c) the parent's methods  (d) the parent's private bank accounts
3. `super().__init__(...)` inside a child constructor — (a) runs the parent's constructor  (b) deletes the parent  (c) creates a second parent  (d) is only for static methods
4. Method lookup searches — (a) parent first, then child  (b) child first, then parent  (c) random  (d) only the child
5. Which passes the IS-A test? (a) `Horse` extends `WashingMachine`  (b) `Truck` extends `Vehicle`  (c) `Pizza` extends `Email`  (d) `Chair` extends `Oxygen`

**Answers:** 1→b, 2→c, 3→a, 4→b, 5→b.

### Key Takeaway

Inheritance is the IS-A relationship: the child inherits the parent's methods and constructor setup, then adds its own. Search order is child-first-then-parent, `super()` opens the parent's constructor, and the IS-A test decides whether a hierarchy is brilliant or broken.

---

## 5.2 Method Overriding

### What Overriding Is

**Overriding** = defining a method in the child with the **same name and same signature** as the parent, so the child's version replaces the parent's for child objects.

```python
class Shape:
    def area(self):
        return 0          # generic placeholder: "I have no fixed area"

class Circle(Shape):
    def area(self):       # SAME name, SAME parameters
        return 3.14159 * self.radius ** 2
```

`Circle.area()` is the *override*. A generic `Shape` object returns 0; a `Circle` returns πr² — the same verb, a specialised body.

### Same Verb, Different Body

Override exists because children share the *vocabulary* but not the *math*. Every shape answers `area()`; only each shape knows how to compute its own. The call site says one word — `shape.area()` — and the object decides what that word means. This is the bridge to polymorphism.

### Extend, Don't Replace — `super().method()`

Often the child wants the parent's behavior PLUS something extra. `super()` reaches back into the parent:

```python
def display(self):
    super().display()          # parent's version first
    print("  (a circle!)")     # then the child's addition
```

Pattern: **parent first, child extra.** This keeps shared behavior in one place instead of copy-pasting it.

### Override vs Overload — Don't Confuse Them

| | Override | Overload |
|---|---|---|
| What | Child redefines a parent method, same signature | Same class, same name, DIFFERENT parameters |
| Why | Replace/extend inherited behavior | One name, several parameter sets |
| Where | Between parent and child | Inside one class |
| Exam trap | Same name + same signature + different class | Same name + different signature + same class |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Typo in the signature | Parent's version silently runs instead of the override | Match name AND parameters exactly |
| Forgetting `super()` when extending | Parent's half of the behavior is lost | Call `super().method()` first |
| Overriding a method you meant to keep | Behavior changes unexpectedly | Override deliberately, or don't |
| Changing parameter names/types | Looks like an override, behaves like a new method | Match the parent's signature |

### Quick Self-Test (answers at the bottom)

1. Overriding means — (a) deleting the parent's method  (b) same name + same signature in the child, replacing the parent's  (c) adding a new method with a new name  (d) calling the parent twice
2. A Shape with `area() → 0` and a Circle with `area() → πr²` is — (a) an overload  (b) an override  (c) an error  (d) a loop
3. `super().method()` in an override — (a) runs the parent's version first  (b) deletes the parent  (c) renames the method  (d) is only for constructors
4. Overload is — (a) same name, different parameters, same class  (b) same name, same parameters, child class  (c) two classes merging  (d) recursion
5. A typo in the override's signature causes — (a) a crash  (b) the parent's version to silently run  (c) the child's version to run  (d) nothing

**Answers:** 1→b, 2→b, 3→a, 4→a, 5→b.

### Key Takeaway

Overriding is the same verb with a specialised body: same name, same signature, child replaces parent. Use `super()` to extend instead of replace (parent first, child extra), and never confuse override (child vs parent) with overload (different parameters, one class).

---

## 5.3 Polymorphism

### The Word and the Idea

**Poly-morphism** = *many forms*. One method name, many behaviours — and the code that calls it doesn't care which one it gets.

```python
shapes = [Circle(7), Rectangle(4, 5), Shape()]

for shape in shapes:
    print(shape.area())     # 153.93...  20  0
```

One line of code — `shape.area()` — produces three different answers, because **each object brings its own form of `area()`**. That is polymorphism in one sentence.

### The Polymorphic Call Site

The magic: the *caller* is written once, against the **parent type**. The *object* decides the actual behavior at runtime.

```
for shape in shapes:          ← written against Shape, the PARENT
    print(shape.area())       ← each child's override runs automatically
```

- `Circle(7)` → Circle's `area()` → 153.93…
- `Rectangle(4, 5)` → Rectangle's `area()` → 20
- `Shape()` → Shape's `area()` → 0

The loop never mentions `Circle` or `Rectangle` by name. It just says `area()` — and the runtime dispatches to whichever form the object has. This is called **runtime polymorphism** (dynamic dispatch).

### Why It's the Superpower of Big Projects

Without polymorphism, the loop would need to check every type:

```
if isinstance(s, Circle): print(circle_area(s))
elif isinstance(s, Rectangle): print(rect_area(s))
...
```

Every new shape = a new `elif` = touching working code. **With** polymorphism, adding a new shape touches nothing:

> Add a new subclass, implement `area()`, done. All existing code keeps working — it already talks to Shape.

That is extensibility: the open/closed principle in miniature (open for extension, closed for modification).

### Duck Typing (Python & JavaScript flavour)

"if it walks like a duck and quacks like a duck, it's a duck." These languages don't even *require* the parent — any object with an `area()` method is accepted:

```python
def print_area(thing):
    print(thing.area())     # works on ANY object that has area()

print_area(Circle(7))       # fine
print_area(Rectangle(4, 5)) # fine
```

Structure matters, not ancestry. Statically-typed languages (Java) need the formal parent type instead.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| If/else chains on type | New classes force edits to working code | Rely on the shared method instead |
| Forgetting the override | The parent's generic version runs | Implement the method in every child |
| Expecting the parent's behavior | Overrides change answers per object | Know which object is really in hand |
| Passing the wrong type | Static languages reject it at compile time | Use the parent type in the signature |

### Quick Self-Test (answers at the bottom)

1. Polymorphism means — (a) one method name with many behaviours  (b) many method names, one behaviour  (c) classes with no methods  (d) functions outside classes
2. The polymorphic call site is written against — (a) the child types  (b) the parent type  (c) no type  (d) the constructor
3. `for s in shapes: print(s.area())` with Circle and Rectangle objects — (a) crashes  (b) each object runs its own area()  (c) always runs Shape's  (d) runs only once
4. Adding a new subclass with polymorphism — (a) requires editing the loop  (b) requires no changes to existing code  (c) breaks everything  (d) needs an if/else
5. Duck typing accepts — (a) only the exact parent class  (b) any object that has the needed method  (c) only grandchildren  (d) nothing

**Answers:** 1→a, 2→b, 3→b, 4→b, 5→b.

### Key Takeaway

Polymorphism = many forms for one name. Write the call site against the parent type; each object's override runs automatically. It kills if/else type-chains, makes adding new subclasses a zero-edit event, and (in duck-typed languages) asks only that an object *has* the method.

---

# 6. Problems

## 6.1 Class Hierarchy (Shapes)

| | |
|---|---|
| **Difficulty** | Medium |
| **Subtopic** | Inheritance Basics |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Build a class hierarchy for shapes using inheritance:

1. A `Shape` base class with a constructor taking a `name` (string) stored as an instance variable, and an `area()` method that returns 0 (the generic placeholder).
2. A `Circle(Shape)` subclass whose constructor takes a `radius`, calls `super().__init__("Circle")`, stores the radius, and **overrides** `area()` to return 3.14159 × radius².
3. A `Rectangle(Shape)` subclass whose constructor takes `length` and `width`, calls `super().__init__("Rectangle")`, stores both, and **overrides** `area()` to return length × width.
4. Demonstrate polymorphism: build a list `[Circle(7), Rectangle(4, 5), Shape()]`, loop over it printing each shape's name and area.

### Step-by-Step Solution

**Step 1 — The parent with a placeholder method:**

```
class Shape:
    def __init__(self, name):
        self.name = name

    def area(self):
        return 0          # generic: "I have no fixed shape's area"
```

**Step 2 — The Circle child: super() first, then its own state:**

```
class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")     # parent sets name = "Circle"
        self.radius = radius

    def area(self):                    # override
        return 3.14159 * self.radius ** 2
```

**Step 3 — The Rectangle child, same pattern:**

```
class Rectangle(Shape):
    def __init__(self, length, width):
        super().__init__("Rectangle")
        self.length = length
        self.width = width

    def area(self):                    # override
        return self.length * self.width
```

**Step 4 — The polymorphic loop:**

```
shapes = [Circle(7), Rectangle(4, 5), Shape()]

for shape in shapes:
    print(shape.name + ": " + str(shape.area()))
```

**Full trace:**

```
Circle(7)       → name = "Circle" (via super), radius = 7
                → area() = 3.14159 × 7² = 3.14159 × 49 = 153.94 (rounded)
Rectangle(4,5)  → name = "Rectangle", length = 4, width = 5
                → area() = 4 × 5 = 20
Shape()         → name = "" (constructor requires a name) or as passed
                → area() = 0 (the placeholder, never overridden)

Output:
  Circle: 153.94
  Rectangle: 20
  Shape: 0
```

### Answer

| Question | Answer |
|---|---|
| Circle's area() for radius 7 | **153.94** (3.14159 × 49) |
| Rectangle's area() for 4 × 5 | **20** |
| Shape's area() | **0** (placeholder, inherited) |
| The loop's output style | name + ": " + area, per object |
| What makes the loop work | Polymorphism — each object's own override runs |

### Trap to Remember

Two traps. First, **forgetting `super().__init__`** in a child leaves `name` unset — the child then crashes the moment the loop prints `shape.name`. The constructor call order is non-negotiable: parent first, child state second. Second, **writing the loop with if/else type checks** — that defeats polymorphism; the entire point is one `shape.area()` call that each object resolves itself.

---

*Happy studying! — TheWebytes Programming Team*
