# Programming Learning Document — Control Flow

> A comprehensive, student-friendly guide to Control Flow — the decision-making and repetition superpower behind every program that reacts to input.
> Master conditions (if/else), loops (for/while), and the break/continue statements with two classics: Sum of Digits and FizzBuzz.

---

# 2. Control Flow

> **Lesson Overview:** Learn how programs make decisions and repeat actions — if/else conditions, for and while loops, and the break/continue statements that give you fine control over how your code flows.
> - **Category:** Programming Foundations
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 2.1 Conditional Statements

### What are Conditional Statements?

Programs don't just run top to bottom — they make **decisions**. A conditional statement lets your program ask "is this true?" and run different code depending on the answer. Think of it like a fork in the road: the path you take depends on a condition.

### The Three Building Blocks

**1. `if` — "If this is true, do something"**

```
IF score >= 50 THEN
    PRINT "Passed"
END IF
```

**2. `else` — "Otherwise, do this instead"**

```
IF score >= 50 THEN
    PRINT "Passed"
ELSE
    PRINT "Failed"
END IF
```

**3. `else if` — "Check more possibilities"**

```
IF score >= 90 THEN
    PRINT "Grade A"
ELSE IF score >= 75 THEN
    PRINT "Grade B"
ELSE
    PRINT "Grade C"
END IF
```

### What Makes Up a Condition?

A **condition** is any expression that evaluates to true or false. It is usually built from:

- **Comparison operators** — `==` equal, `!=` not equal, `>` greater than, `<` less than, `>=` greater or equal, `<=` less or equal
- **Logical operators** — `and`, `or`, `not` — which combine smaller conditions

```
IF age >= 18 AND has_id == true THEN
    PRINT "Allowed to enter"
END IF
```

### Real-World Analogy

Think of a traffic light:

```
IF light is green THEN
    go
ELSE IF light is yellow THEN
    slow down
ELSE
    stop
END IF
```

That is a conditional statement in real life — your driving code checks a condition and runs one of three branches.

### Why Order Matters in a Chain

In an `if / else if / else` chain, the conditions are checked **top to bottom**, and the **first true one wins**. So always put the most specific condition first.

```
IF age >= 18 THEN
    PRINT "Adult"
ELSE IF age >= 13 THEN
    PRINT "Teen"
ELSE
    PRINT "Child"
END IF
```

A 20-year-old matches the first condition and prints "Adult" — the later checks are never reached.

### Key Takeaway

Conditional statements let a program make decisions. Use `if` for a single check, `else` for the fallback, and `else if` chains for multiple possibilities. Every branch runs based on whether a condition evaluates to true or false — and the first true condition in a chain wins.

---

## 2.2 Loops

### What is a Loop?

A **loop** repeats a block of code. Instead of writing the same line 100 times, you write it once and tell the computer to repeat it. Think of a washing machine — the drum keeps spinning through the same cycle until the cycle ends.

### The `for` Loop — When You Know the Count

Use a `for` loop when you know **exactly how many times** to repeat.

```
FOR i FROM 1 TO 5:
    PRINT i
END FOR

# prints: 1 2 3 4 5
```

The loop variable `i` takes each value in the range, one at a time, and the body runs once per value.

### The `while` Loop — When the End Depends on a Condition

Use a `while` loop when you **don't know the count in advance** — the loop keeps going as long as a condition stays true.

```
number = 123
WHILE number > 0:
    digit = number MOD 10     # last digit
    PRINT digit
    number = number DIV 10    # drop last digit

# prints: 3 2 1
```

### for vs while — When to Use Which

| Situation | Use |
|---|---|
| I know the exact count | `for` |
| I don't know when it will stop | `while` |
| I need an index from 0 to n | `for` |
| The loop depends on a condition changing | `while` |

### Real-World Analogies

- **`for` loop** — a playlist you play start to finish. You know exactly how many songs there are.
- **`while` loop** — waiting for a pot of water to boil. You don't know how long, you just keep checking until it bubbles.

### Why Loops Matter

✅ **Less code** — one block instead of ten copies
✅ **Fewer bugs** — change one place, not ten
✅ **Scales** — the same code handles 10 items or 10 million

### Pseudocode

```
sum = 0
FOR i FROM 1 TO n:
    sum = sum + i
END FOR
PRINT sum
```

### Key Takeaway

Loops repeat code. Use `for` when you know how many times, and `while` when the end depends on a condition. Every loop needs a way to stop — an infinite loop is a loop that never ends, and it will freeze your program.

---

## 2.3 Loop Control

### What is Loop Control?

Loops are powerful, but sometimes you want to take control mid-flight. Two statements let you do that: **break** and **continue**. They are the steering wheel of your loop.

### break — Stop the Entire Loop

`break` immediately ends the loop. The rest of the iterations are skipped and execution moves on to the code after the loop.

```
FOR i FROM 1 TO 10:
    IF i == 5 THEN
        BREAK
    END IF
    PRINT i
END FOR

# prints: 1 2 3 4   (the loop stops at 5)
```

### continue — Skip Just One Iteration

`continue` skips the **rest of the current iteration** and jumps straight to the next one. The loop keeps running — only the current round is skipped.

```
FOR i FROM 1 TO 5:
    IF i == 3 THEN
        CONTINUE
    END IF
    PRINT i
END FOR

# prints: 1 2 4 5   (3 is skipped)
```

### break vs continue

| Keyword | Effect |
|---|---|
| `break` | Ends the whole loop completely |
| `continue` | Skips only the current iteration |

### Real-World Analogies

- **break** — searching a book for a word: the moment you find it, you stop reading the rest of the pages.
- **continue** — checking a class list: you skip the absent students but keep going through the rest.

### Pseudocode — Using Both Together

```
FOR each student IN class:
    IF student is absent THEN
        CONTINUE            # skip this student, no grade to record
    END IF
    IF student is the topper THEN
        BREAK               # no need to check the rest
    END IF
    record_grade(student)
END FOR
```

### Key Takeaway

`break` ends a loop completely; `continue` skips only the current iteration. Use them to avoid wasted work and keep your loop logic clean — they are small tools that make loops far more flexible.

---

# 3. Problems

## 3.1 Sum of Digits

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Loops |
| **Companies** | Amazon, Google, Microsoft |

### Problem Statement

Given a non-negative integer, return the sum of its digits.

For example, the digits of 123 are 1, 2, and 3, so the sum is 1 + 2 + 3 = 6.

You must NOT convert the number to a string — work with it as a number using a loop.

```
Input:  n = 123
Output: 6   (1 + 2 + 3)
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| n = 123 | 6 | 1 + 2 + 3 = 6 |
| n = 4567 | 22 | 4 + 5 + 6 + 7 = 22 |
| n = 9 | 9 | A single digit — its sum is itself |
| n = 0 | 0 | Zero has no digits to add |

### Constraints

- n is a non-negative integer up to 10^9
- Do not convert the number to a string
- Use loops and arithmetic only

### Approach

**The Key Trick**

We need to extract each digit from the number and add them all up. Two operations make this easy:

- `number MOD 10` gives the **last digit** (the remainder when dividing by 10).
- `number DIV 10` **removes the last digit** (integer division by 10).

Repeat these two steps until the number becomes 0, and you have visited every digit.

**The Loop Idea**

1. Start a total at 0.
2. While the number is greater than 0:
   - Extract the last digit: `digit = number MOD 10`
   - Add it to the total: `total = total + digit`
   - Remove the last digit: `number = number DIV 10`
3. Return the total.

**Step-by-Step Trace on n = 4567**

```
number = 4567, total = 0
-> digit = 7, total = 7,  number = 456
-> digit = 6, total = 13, number = 45
-> digit = 5, total = 18, number = 4
-> digit = 4, total = 22, number = 0  -> stop

Answer: 22 ✅
```

**Pseudocode:**

```
FUNCTION sum_of_digits(number):
    total = 0
    WHILE number > 0:
        digit = number MOD 10
        total = total + digit
        number = number DIV 10
    RETURN total
```

**Complexity:** Time **O(d)** where d is the number of digits — each digit is visited exactly once. Space **O(1)** — only a couple of variables, no extra storage.

### Code Solution

```python
def sum_of_digits(n):
    total = 0
    while n > 0:
        digit = n % 10          # last digit
        total += digit
        n //= 10                # drop last digit
    return total

print(sum_of_digits(123))   # 6
print(sum_of_digits(4567))  # 22
```

```javascript
function sumOfDigits(n) {
    let total = 0;
    while (n > 0) {
        total += n % 10;            // add last digit
        n = Math.floor(n / 10);     // drop last digit
    }
    return total;
}

console.log(sumOfDigits(123));   // 6
console.log(sumOfDigits(4567));  // 22
```

```java
public static int sumOfDigits(int n) {
    int total = 0;
    while (n > 0) {
        total += n % 10;        // add last digit
        n = n / 10;             // drop last digit
    }
    return total;
}
// sumOfDigits(123)  == 6
// sumOfDigits(4567) == 22
```

---

## 3.2 FizzBuzz

| | |
|---|---|
| **Difficulty** | Easy |
| **Subtopic** | Loop Control |
| **Companies** | Google, Microsoft, Meta, Amazon |

### Problem Statement

Write a program that prints the numbers from 1 to n, with these rules:

- For multiples of 3, print "Fizz" instead of the number.
- For multiples of 5, print "Buzz" instead of the number.
- For multiples of BOTH 3 and 5, print "FizzBuzz" instead of the number.

```
Input:  n = 15
Output: 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz
```

### Examples

| Input | Output | Explanation |
|---|---|---|
| n = 5 | ["1", "2", "Fizz", "4", "Buzz"] | 3 is a multiple of 3; 5 is a multiple of 5 |
| n = 15 | ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"] | 15 is a multiple of both 3 and 5 |
| n = 3 | ["1", "2", "Fizz"] | 3 is the first multiple of 3 |
| n = 1 | ["1"] | 1 is not a multiple of 3 or 5 |

### Constraints

- n is a positive integer up to 100
- Return the result as a list of strings (or print line by line)

### Approach

**The Key Insight**

For each number from 1 to n, we need to decide what to print based on divisibility:

- Divisible by 3 **and** 5 → "FizzBuzz"
- Divisible by 3 only → "Fizz"
- Divisible by 5 only → "Buzz"
- Otherwise → the number itself

**The Order of Checks Matters!**

The "both" case must be checked **first**. Why? Because 15 is divisible by 3 — if you check "divisible by 3" first, then 15 matches that rule and prints "Fizz", which is wrong. The most specific case always comes first.

**The Loop Idea**

1. Loop i from 1 to n.
2. If `i MOD 15 == 0` → "FizzBuzz"  (15 = 3 × 5, so divisible by both)
3. Else if `i MOD 3 == 0` → "Fizz"
4. Else if `i MOD 5 == 0` → "Buzz"
5. Else → the number itself as a string.

**Why Check `i MOD 15 == 0`?**

A number is divisible by both 3 and 5 exactly when it is divisible by their product, 15. Checking `MOD 15` is the cleanest way to catch the "both" case in one step.

**Pseudocode:**

```
FUNCTION fizz_buzz(n):
    result = empty list
    FOR i FROM 1 TO n:
        IF i MOD 15 == 0 THEN
            result.add("FizzBuzz")
        ELSE IF i MOD 3 == 0 THEN
            result.add("Fizz")
        ELSE IF i MOD 5 == 0 THEN
            result.add("Buzz")
        ELSE
            result.add(STRING(i))
        END IF
    END FOR
    RETURN result
```

**Complexity:** Time **O(n)** — a single pass over the numbers 1 to n. Space **O(n)** — the result list holds n strings (O(1) if printing on the fly).

### Code Solution

```python
def fizz_buzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:            # divisible by 3 AND 5
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

print(fizz_buzz(15))
```

```javascript
function fizzBuzz(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) result.push("FizzBuzz");
        else if (i % 3 === 0) result.push("Fizz");
        else if (i % 5 === 0) result.push("Buzz");
        else result.push(String(i));
    }
    return result;
}

console.log(fizzBuzz(15));
```

```java
public static List<String> fizzBuzz(int n) {
    List<String> result = new ArrayList<>();
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) result.add("FizzBuzz");
        else if (i % 3 == 0) result.add("Fizz");
        else if (i % 5 == 0) result.add("Buzz");
        else result.add(String.valueOf(i));
    }
    return result;
}
```

---

*Happy coding! — TheWebytes Team*
