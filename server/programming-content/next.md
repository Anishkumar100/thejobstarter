# Next Programming Content — Control Flow

> Second lesson of the Programming curriculum. Category: `programming-foundations`, order 1.
> 3 subtopics · 2 problems · 2 quizzes


---

## Category

- Order: 0 (same category)
- Name: Programming Foundations
- Slug: `programming-foundations`


---

## Lesson

```json
{
  "title": "Control Flow",
  "slug": "control-flow",
  "category": "programming-foundations",
  "description": "Learn how programs make decisions and repeat actions — if/else conditions, for and while loops, and the break/continue statements that give you fine control over how your code flows.",
  "image": "",
  "icon": "GitBranch",
  "order": 1,
  "difficulty": "easy",
  "problemCount": 2
}
```


---

## Subtopics (3)

### Conditional Statements (theory only)

```json
{
  "title": "Conditional Statements",
  "slug": "conditional-statements",
  "lessonSlug": "control-flow",
  "order": 0,
  "description": "Learn how if, else if, and else let your program make decisions and run different code depending on conditions.",
  "explanation": "## What are Conditional Statements?\n\nPrograms don't just run top to bottom — they make **decisions**. A conditional statement lets your program ask \"is this true?\" and run different code depending on the answer. Think of it like a fork in the road: the path you take depends on a condition.\n\n## The Three Building Blocks\n\n### 1. if — \"If this is true, do something\"\n\n```\nIF score >= 50 THEN\n    PRINT \"Passed\"\nEND IF\n```\n\n### 2. else — \"Otherwise, do this instead\"\n\n```\nIF score >= 50 THEN\n    PRINT \"Passed\"\nELSE\n    PRINT \"Failed\"\nEND IF\n```\n\n### 3. else if — \"Check more possibilities\"\n\n```\nIF score >= 90 THEN\n    PRINT \"Grade A\"\nELSE IF score >= 75 THEN\n    PRINT \"Grade B\"\nELSE\n    PRINT \"Grade C\"\nEND IF\n```\n\n## What Makes Up a Condition?\n\nA **condition** is any expression that evaluates to true or false. It is usually built from:\n\n- **Comparison operators** — `==` equal, `!=` not equal, `>` greater than, `<` less than, `>=` greater or equal, `<=` less or equal\n- **Logical operators** — `and`, `or`, `not` — which combine smaller conditions\n\n```\nIF age >= 18 AND has_id == true THEN\n    PRINT \"Allowed to enter\"\nEND IF\n```\n\n## Real-World Analogy\n\nThink of a traffic light:\n\n```\nIF light is green THEN\n    go\nELSE IF light is yellow THEN\n    slow down\nELSE\n    stop\nEND IF\n```\n\nThat is a conditional statement in real life — your driving code checks a condition and runs one of three branches.\n\n## Why Order Matters in a Chain\n\nIn an `if / else if / else` chain, the conditions are checked **top to bottom**, and the **first true one wins**. So always put the most specific condition first.\n\n```\nIF age >= 18 THEN\n    PRINT \"Adult\"\nELSE IF age >= 13 THEN\n    PRINT \"Teen\"\nELSE\n    PRINT \"Child\"\nEND IF\n```\n\nA 20-year-old matches the first condition and prints \"Adult\" — the later checks are never reached.\n\n## Key Takeaway\n\nConditional statements let a program make decisions. Use `if` for a single check, `else` for the fallback, and `else if` chains for multiple possibilities. Every branch runs based on whether a condition evaluates to true or false — and the first true condition in a chain wins.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
```

### Loops

```json
{
  "title": "Loops",
  "slug": "loops",
  "lessonSlug": "control-flow",
  "order": 1,
  "description": "Learn how for and while loops repeat code — and when to use each. Loops are how programs handle repetitive tasks like processing the digits of a number.",
  "explanation": "## What is a Loop?\n\nA **loop** repeats a block of code. Instead of writing the same line 100 times, you write it once and tell the computer to repeat it. Think of a washing machine — the drum keeps spinning through the same cycle until the cycle ends.\n\n## The for Loop — When You Know the Count\n\nUse a `for` loop when you know **exactly how many times** to repeat.\n\n```\nFOR i FROM 1 TO 5:\n    PRINT i\nEND FOR\n\n# prints: 1 2 3 4 5\n```\n\nThe loop variable `i` takes each value in the range, one at a time, and the body runs once per value.\n\n## The while Loop — When the End Depends on a Condition\n\nUse a `while` loop when you **don't know the count in advance** — the loop keeps going as long as a condition stays true.\n\n```\nnumber = 123\nWHILE number > 0:\n    digit = number MOD 10     # last digit\n    PRINT digit\n    number = number DIV 10    # drop last digit\n\n# prints: 3 2 1\n```\n\n## for vs while — When to Use Which\n\n| Situation | Use |\n|---|---|\n| I know the exact count | `for` |\n| I don't know when it will stop | `while` |\n| I need an index from 0 to n | `for` |\n| The loop depends on a condition changing | `while` |\n\n## Real-World Analogies\n\n- **`for` loop** — a playlist you play start to finish. You know exactly how many songs there are.\n- **`while` loop** — waiting for a pot of water to boil. You don't know how long, you just keep checking until it bubbles.\n\n## Why Loops Matter\n\n✅ **Less code** — one block instead of ten copies\n✅ **Fewer bugs** — change one place, not ten\n✅ **Scales** — the same code handles 10 items or 10 million\n\n## Pseudocode\n\n```\nsum = 0\nFOR i FROM 1 TO n:\n    sum = sum + i\nEND FOR\nPRINT sum\n```\n\n## Key Takeaway\n\nLoops repeat code. Use `for` when you know how many times, and `while` when the end depends on a condition. Every loop needs a way to stop — an infinite loop is a loop that never ends, and it will freeze your program.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
```

### Loop Control (break/continue)

```json
{
  "title": "Loop Control",
  "slug": "loop-control",
  "lessonSlug": "control-flow",
  "order": 2,
  "description": "Learn how break and continue give you fine control inside loops — stopping the loop early or skipping a single iteration.",
  "explanation": "## What is Loop Control?\n\nLoops are powerful, but sometimes you want to take control mid-flight. Two statements let you do that: **break** and **continue**. They are the steering wheel of your loop.\n\n## break — Stop the Entire Loop\n\n`break` immediately ends the loop. The rest of the iterations are skipped and execution moves on to the code after the loop.\n\n```\nFOR i FROM 1 TO 10:\n    IF i == 5 THEN\n        BREAK\n    END IF\n    PRINT i\nEND FOR\n\n# prints: 1 2 3 4   (the loop stops at 5)\n```\n\n## continue — Skip Just One Iteration\n\n`continue` skips the **rest of the current iteration** and jumps straight to the next one. The loop keeps running — only the current round is skipped.\n\n```\nFOR i FROM 1 TO 5:\n    IF i == 3 THEN\n        CONTINUE\n    END IF\n    PRINT i\nEND FOR\n\n# prints: 1 2 4 5   (3 is skipped)\n```\n\n## break vs continue\n\n| Keyword | Effect |\n|---|---|\n| `break` | Ends the whole loop completely |\n| `continue` | Skips only the current iteration |\n\n## Real-World Analogies\n\n- **break** — searching a book for a word: the moment you find it, you stop reading the rest of the pages.\n- **continue** — checking a class list: you skip the absent students but keep going through the rest.\n\n## Pseudocode — Using Both Together\n\n```\nFOR each student IN class:\n    IF student is absent THEN\n        CONTINUE            # skip this student, no grade to record\n    END IF\n    IF student is the topper THEN\n        BREAK               # no need to check the rest\n    END IF\n    record_grade(student)\nEND FOR\n```\n\n## Key Takeaway\n\n`break` ends a loop completely; `continue` skips only the current iteration. Use them to avoid wasted work and keep your loop logic clean — they are small tools that make loops far more flexible.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
```


---

## Problems (2)

### Sum of Digits

```json
{
  "title": "Sum of Digits",
  "slug": "sum-of-digits",
  "lessonSlug": "control-flow",
  "subtopicSlug": "loops",
  "difficulty": "easy",
  "topics": [
    "Loops",
    "Math",
    "Basics"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft"
  ],
  "problemStatement": "Given a non-negative integer, return the sum of its digits.\n\nFor example, the digits of 123 are 1, 2, and 3, so the sum is 1 + 2 + 3 = 6.\n\nYou must NOT convert the number to a string — work with it as a number using a loop.",
  "examples": [
    {
      "input": "n = 123",
      "output": "6",
      "explanation": "1 + 2 + 3 = 6."
    },
    {
      "input": "n = 4567",
      "output": "22",
      "explanation": "4 + 5 + 6 + 7 = 22."
    },
    {
      "input": "n = 9",
      "output": "9",
      "explanation": "A single digit — its sum is itself."
    },
    {
      "input": "n = 0",
      "output": "0",
      "explanation": "Zero has no digits to add."
    }
  ],
  "constraints": [
    "n is a non-negative integer up to 10^9.",
    "Do not convert the number to a string.",
    "Use loops and arithmetic only."
  ],
  "approach": "## Understanding the Problem\n\nWe need to extract each digit from the number and add them all up. There is a neat trick that makes this easy:\n\n- `number MOD 10` gives the **last digit** (the remainder when dividing by 10).\n- `number DIV 10` **removes the last digit** (integer division by 10).\n\nRepeat these two steps until the number becomes 0, and you have visited every digit.\n\n## The Loop Idea\n\n1. Start a total at 0.\n2. While the number is greater than 0:\n   - Extract the last digit: `digit = number MOD 10`\n   - Add it to the total: `total = total + digit`\n   - Remove the last digit: `number = number DIV 10`\n3. Return the total.\n\n## Step-by-Step Trace on n = 4567\n\n```\nnumber = 4567, total = 0\n-> digit = 7, total = 7,  number = 456\n-> digit = 6, total = 13, number = 45\n-> digit = 5, total = 18, number = 4\n-> digit = 4, total = 22, number = 0  -> stop\n\nAnswer: 22 ✅\n```\n\n## Pseudocode\n\n```\nFUNCTION sum_of_digits(number):\n    total = 0\n    WHILE number > 0:\n        digit = number MOD 10\n        total = total + digit\n        number = number DIV 10\n    RETURN total\n```\n\n## Complexity Analysis\n\n- **Time Complexity: O(d)** where d is the number of digits — each digit is visited exactly once.\n- **Space Complexity: O(1)** — only a couple of variables, no extra storage.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def sum_of_digits(n):\n    total = 0\n    while n > 0:\n        digit = n % 10          # last digit\n        total += digit\n        n //= 10                # drop last digit\n    return total\n\nprint(sum_of_digits(123))   # 6\nprint(sum_of_digits(4567))  # 22"
    },
    {
      "language": "javascript",
      "code": "function sumOfDigits(n) {\n    let total = 0;\n    while (n > 0) {\n        total += n % 10;            // add last digit\n        n = Math.floor(n / 10);     // drop last digit\n    }\n    return total;\n}\n\nconsole.log(sumOfDigits(123));   // 6\nconsole.log(sumOfDigits(4567));  // 22"
    },
    {
      "language": "java",
      "code": "public static int sumOfDigits(int n) {\n    int total = 0;\n    while (n > 0) {\n        total += n % 10;        // add last digit\n        n = n / 10;             // drop last digit\n    }\n    return total;\n}\n// sumOfDigits(123)  == 6\n// sumOfDigits(4567) == 22"
    }
  ],
  "timeComplexity": "O(d)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
}
```

**Quiz — 5 MCQs**

```json
{
  "questions": [
    {
      "text": "Which operator extracts the last digit of a number?",
      "options": [
        "% (modulo)",
        "/ (division)",
        "* (multiplication)",
        "- (subtraction)"
      ],
      "correctIndex": 0
    },
    {
      "text": "What does integer division by 10 do to a number?",
      "options": [
        "Adds a 0 at the end",
        "Removes the last digit",
        "Doubles the number",
        "Nothing"
      ],
      "correctIndex": 1
    },
    {
      "text": "What is the sum of the digits of 4567?",
      "options": [
        "20",
        "21",
        "22",
        "23"
      ],
      "correctIndex": 2
    },
    {
      "text": "When should the loop stop in sum of digits?",
      "options": [
        "After 3 iterations",
        "When the total reaches 10",
        "When the number becomes 0",
        "Never"
      ],
      "correctIndex": 2
    },
    {
      "text": "What is the time complexity of sum of digits?",
      "options": [
        "O(n)",
        "O(log n)",
        "O(n^2)",
        "O(1)"
      ],
      "correctIndex": 1
    }
  ]
}
```


---

### FizzBuzz

```json
{
  "title": "FizzBuzz",
  "slug": "fizzbuzz",
  "lessonSlug": "control-flow",
  "subtopicSlug": "loop-control",
  "difficulty": "easy",
  "topics": [
    "Loops",
    "Conditionals",
    "Basics"
  ],
  "companies": [
    "Google",
    "Microsoft",
    "Meta",
    "Amazon"
  ],
  "problemStatement": "Write a program that prints the numbers from 1 to n, with these rules:\n\n- For multiples of 3, print \"Fizz\" instead of the number.\n- For multiples of 5, print \"Buzz\" instead of the number.\n- For multiples of BOTH 3 and 5, print \"FizzBuzz\" instead of the number.\n\nFor example, from 1 to 15 the output is:\n1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz.",
  "examples": [
    {
      "input": "n = 5",
      "output": "[\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]",
      "explanation": "3 is a multiple of 3; 5 is a multiple of 5."
    },
    {
      "input": "n = 15",
      "output": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]",
      "explanation": "15 is a multiple of both 3 and 5, so it becomes FizzBuzz."
    },
    {
      "input": "n = 3",
      "output": "[\"1\", \"2\", \"Fizz\"]",
      "explanation": "3 is the first multiple of 3."
    },
    {
      "input": "n = 1",
      "output": "[\"1\"]",
      "explanation": "1 is not a multiple of 3 or 5."
    }
  ],
  "constraints": [
    "n is a positive integer up to 100.",
    "Return the result as a list of strings (or print line by line)."
  ],
  "approach": "## Understanding the Problem\n\nFor each number from 1 to n, we need to decide what to print based on divisibility:\n\n- Divisible by 3 **and** 5 → \"FizzBuzz\"\n- Divisible by 3 only → \"Fizz\"\n- Divisible by 5 only → \"Buzz\"\n- Otherwise → the number itself\n\n## The Order of Checks Matters!\n\nThe \"both\" case must be checked **first**. Why? Because 15 is divisible by 3 — if you check \"divisible by 3\" first, then 15 matches that rule and prints \"Fizz\", which is wrong. The most specific case always comes first.\n\n## The Loop Idea\n\n1. Loop i from 1 to n.\n2. If `i MOD 15 == 0` → \"FizzBuzz\"  (15 = 3 × 5, so divisible by both)\n3. Else if `i MOD 3 == 0` → \"Fizz\"\n4. Else if `i MOD 5 == 0` → \"Buzz\"\n5. Else → the number itself as a string.\n\n## Why Check `i MOD 15 == 0`?\n\nA number is divisible by both 3 and 5 exactly when it is divisible by their product, 15. Checking `MOD 15` is the cleanest way to catch the \"both\" case in one step.\n\n## Pseudocode\n\n```\nFUNCTION fizz_buzz(n):\n    result = empty list\n    FOR i FROM 1 TO n:\n        IF i MOD 15 == 0 THEN\n            result.add(\"FizzBuzz\")\n        ELSE IF i MOD 3 == 0 THEN\n            result.add(\"Fizz\")\n        ELSE IF i MOD 5 == 0 THEN\n            result.add(\"Buzz\")\n        ELSE\n            result.add(STRING(i))\n        END IF\n    END FOR\n    RETURN result\n```\n\n## Complexity Analysis\n\n- **Time Complexity: O(n)** — a single pass over the numbers 1 to n.\n- **Space Complexity: O(n)** — the result list holds n strings (O(1) if printing on the fly).",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def fizz_buzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:            # divisible by 3 AND 5\n            result.append(\"FizzBuzz\")\n        elif i % 3 == 0:\n            result.append(\"Fizz\")\n        elif i % 5 == 0:\n            result.append(\"Buzz\")\n        else:\n            result.append(str(i))\n    return result\n\nprint(fizz_buzz(15))"
    },
    {
      "language": "javascript",
      "code": "function fizzBuzz(n) {\n    const result = [];\n    for (let i = 1; i <= n; i++) {\n        if (i % 15 === 0) result.push(\"FizzBuzz\");\n        else if (i % 3 === 0) result.push(\"Fizz\");\n        else if (i % 5 === 0) result.push(\"Buzz\");\n        else result.push(String(i));\n    }\n    return result;\n}\n\nconsole.log(fizzBuzz(15));"
    },
    {
      "language": "java",
      "code": "public static List<String> fizzBuzz(int n) {\n    List<String> result = new ArrayList<>();\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) result.add(\"FizzBuzz\");\n        else if (i % 3 == 0) result.add(\"Fizz\");\n        else if (i % 5 == 0) result.add(\"Buzz\");\n        else result.add(String.valueOf(i));\n    }\n    return result;\n}"
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
}
```

**Quiz — 5 MCQs**

```json
{
  "questions": [
    {
      "text": "What should print for the number 15?",
      "options": [
        "Fizz",
        "Buzz",
        "FizzBuzz",
        "15"
      ],
      "correctIndex": 2
    },
    {
      "text": "Why must the \"both\" case be checked first?",
      "options": [
        "Because it is the rarest case",
        "Because 15 is divisible by 3, so it would wrongly print Fizz",
        "Because the loop is faster that way",
        "It does not matter"
      ],
      "correctIndex": 1
    },
    {
      "text": "What does i % 15 == 0 check?",
      "options": [
        "Divisible by 3 only",
        "Divisible by 5 only",
        "Divisible by both 3 and 5",
        "Divisible by 15 only when i is even"
      ],
      "correctIndex": 2
    },
    {
      "text": "For n = 5, what is the correct output?",
      "options": [
        "1, 2, Fizz, 4, Buzz",
        "1, 2, 3, 4, 5",
        "Fizz, Buzz, Fizz, Buzz, FizzBuzz",
        "1, 2, Fizz, Buzz, Fizz"
      ],
      "correctIndex": 0
    },
    {
      "text": "What is the time complexity of FizzBuzz?",
      "options": [
        "O(1)",
        "O(n)",
        "O(n^2)",
        "O(log n)"
      ],
      "correctIndex": 1
    }
  ]
}
```


---

## Summary


| Entity | Count |
|---|---|
| Categories | 0 of 7 (same category: Programming Foundations) |
| Lessons | 2 of 18 (order 1 in category) |
| Subtopics | 3 of 48 |
| Problems | 2 of 29 |
| Quizzes | 2 of 29 |