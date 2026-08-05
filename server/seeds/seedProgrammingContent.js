/*
 * seedProgrammingContent.js
 * Seeds Programming lessons, subtopics, problems, quizzes, and meta into MongoDB.
 *
 * Hierarchy: Lesson → Subtopics → Problems → Quiz (one per problem)
 * Source of content: server/programming-content/ (one numbered markdown doc per
 * lesson, e.g. 01-variables-data-types-operators.md, 04-classes-objects.md).
 * Lesson seeded so far: 9 of 18
 *
 * NOTE: This script ONLY touches the Programming collections plus Quiz
 * documents for ProgrammingProblem — it never clears other subjects' content
 * and it never clears Progress/QuizAttempt (student data must survive).
 *
 * Usage:
 *   node server/seeds/seedProgrammingContent.js
 *   (requires MONGODB_URI in env, defaults to localhost)
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO ADD NEW CONTENT
 *
 * Fill the arrays below. Every entry MUST match its Mongoose model:
 *
 * LESSON (ProgrammingLesson)
 *   { title, slug, category, description, icon, order, difficulty, problemCount }
 *   - category: filter value shown on /programming — must be one of the
 *     categories in programmingMetaData below (e.g. 'oops').
 *   - problemCount is IGNORED at insert time — the runner recounts it
 *     from the actual problems after seeding.
 *
 * SUBTOPIC (ProgrammingSubtopic)
 *   { title, slug, description, explanation, lessonSlug, order }
 *   - explanation: RICH Markdown (headings, tables, code fences, ✅/❌ lists)
 *     rendered on the subtopic detail page. Mirror the matching section of
 *     the lesson's doc file (server/programming-content/NN-lesson-slug.md).
 *   - optional: image, youtubeUrl, pdfUrl, pptxUrl
 *   - lessonSlug MUST equal the slug of an existing lesson above.
 *
 * PROBLEM (ProgrammingProblem)
 *   { title, slug, lessonSlug, subtopicSlug, difficulty, topics,
 *     companies, problemStatement, examples, constraints, approach,
 *     codeBlocks, timeComplexity, spaceComplexity }
 *   - difficulty: 'easy' | 'medium' | 'hard'
 *   - approach: RICH Markdown (steps, traces, complexity, edge cases)
 *   - codeBlocks: [{ language, code }] — python / javascript / java
 *   - optional: media[], youtubeUrl, pdfUrl, pptxUrl
 *   - subtopicSlug MUST equal the slug of an existing subtopic above.
 *
 * QUIZ (Quiz — attached to problems, one quiz per problem)
 *   { problemSlug, questions: [{ text, options, correctIndex }] }
 *   - problemSlug must equal the slug of a problem above; the runner
 *     converts it to the problem's ObjectId + problemModel 'ProgrammingProblem'.
 *   - options: 2 to 6 strings; correctIndex: index of the correct option
 *     (0-based). NEVER list correctIndex to students — it is internal.
 *
 * META (ProgrammingMeta)
 *   { type, value, label, order }  — type: 'category' | 'topic' | 'company'
 *   - Categories drive the filter pills on /programming.
 *   - (type + value) pair must be unique.
 * ─────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import ProgrammingMeta from '../models/ProgrammingMeta.js';
import Quiz from '../models/Quiz.js';

/* ================================================================
 * Programming Lessons
 * ================================================================ */

const programmingLessons = [
{
  "title": "Variables, Data Types & Operators",
  "slug": "variables-data-types-operators",
  "category": "programming-foundations",
  "description": "Start here — learn how programs store and manipulate data. Master variables, the fundamental data types (integers, floats, strings, booleans), how to convert between them, and the operators that combine values into expressions.",
  "image": "",
  "icon": "Braces",
  "order": 0,
  "difficulty": "easy",
  "problemCount": 2
},
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
},
{
  "title": "Functions & Scope",
  "slug": "functions-scope",
  "category": "programming-foundations",
  "description": "Learn how to package code into functions — named recipes you can call anytime — how parameters and return values pass data in and out, and how variable scope decides what each part of your program can see.",
  "image": "",
  "icon": "FunctionSquare",
  "order": 2,
  "difficulty": "easy",
  "problemCount": 2
}
,
{
  "title": "Classes & Objects",
  "slug": "classes-objects",
  "category": "oops",
  "description": "The blueprint-and-building idea of Object-Oriented Programming — how to define a class, give every object its own fresh state with a constructor, and attach actions as methods.",
  "image": "",
  "icon": "Box",
  "order": 3,
  "difficulty": "medium",
  "problemCount": 1
},
{
  "title": "Inheritance & Polymorphism",
  "slug": "inheritance-polymorphism",
  "category": "oops",
  "description": "The IS-A relationship — child classes that inherit everything from a parent, method overriding that swaps a parent's behaviour while keeping the name, and polymorphism that lets one piece of code work on any object.",
  "image": "",
  "icon": "GitBranch",
  "order": 4,
  "difficulty": "medium",
  "problemCount": 1
},
{
  "title": "Encapsulation & Abstraction",
  "slug": "encapsulation-abstraction",
  "category": "oops",
  "description": "The two guardians of clean OOP — access modifiers and guard methods that lock data down, and abstract classes that force every child to honor its promises.",
  "image": "",
  "icon": "Lock",
  "order": 5,
  "difficulty": "medium",
  "problemCount": 2
},
{
  "title": "Strings",
  "slug": "strings",
  "category": "data-handling-collections",
  "description": "The text layer of every program — immutable strings, indexing and slicing, the ten workhorse methods (split, join, replace, strip…), and clean f-string formatting.",
  "image": "",
  "icon": "Type",
  "order": 6,
  "difficulty": "easy",
  "problemCount": 2
},
{
  "title": "Lists, Tuples & Dictionaries",
  "slug": "lists-tuples-dictionaries",
  "category": "data-handling-collections",
  "description": "The containers that hold everything else — mutable lists with their dozen operations, immutable tuples that can even serve as dictionary keys, and lightning-fast key-value dictionaries.",
  "image": "",
  "icon": "Layers",
  "order": 7,
  "difficulty": "easy",
  "problemCount": 2
},
{
  "title": "Sets",
  "slug": "sets",
  "category": "data-handling-collections",
  "description": "The unordered, unique, lightning-fast collection — set basics without the {} vs set() trap, and the five operations that turn sets into a one-line maths engine.",
  "image": "",
  "icon": "Layers",
  "order": 8,
  "difficulty": "easy",
  "problemCount": 1
}];

/* ================================================================
 * Programming Subtopics
 * ================================================================ */

const programmingSubtopics = [
{
  "title": "Variables & Data Types",
  "slug": "variables-data-types",
  "lessonSlug": "variables-data-types-operators",
  "order": 0,
  "description": "Learn what variables are, how they store values in memory, and the core data types — integers, floats, strings, and booleans — that every program is built on.",
  "explanation": "## What is a Variable?\n\nA **variable** is a named container that stores a value in your program's memory. Think of it as a labeled box: the label is the variable's name, and whatever you put inside the box is its value. You can read what's in the box anytime, and you can replace its contents with something new.\n\n```\nname = \"Aarav\"    # a box labelled \"name\" holding the text \"Aarav\"\nage  = 21         # a box labelled \"age\" holding the number 21\n```\n\n## Why Variables Exist\n\nWithout variables, you would have to re-type every value every time you used it. Variables let you:\n\n✅ **Store** a value once and reuse it many times\n✅ **Name** data so your code reads like a story, not a mystery\n✅ **Change** a value at runtime — e.g. a score that goes up as the user plays\n✅ **Remember** intermediate results while solving a problem\n\n## Rules for Naming Variables\n\nGood names make code readable. Most languages agree on these rules:\n\n- Start with a **letter or underscore** (never a digit)\n- Use only **letters, digits, and underscores** after the first character\n- Be **case-sensitive** — `age` and `Age` are different variables\n- Choose **descriptive names** — `studentCount` beats `x`\n- Use `camelCase` or `snake_case` consistently (Python favours snake_case)\n\n## What is a Data Type?\n\nA **data type** tells the computer two things about a value: what kind of data it is, and what operations are legal on it. You cannot meaningfully \"add\" two strings the same way you add two numbers, so the type tells the language how to behave.\n\n## The Four Core Data Types\n\nEvery language has these four in some form:\n\n### 1. Integer (`int`)\nA whole number — no fraction part. Can be positive, negative, or zero.\n\n```\n42   -7   0   1000000\n```\n\n### 2. Float (`float`)\nA number with a fractional part (a \"decimal point\" number). Used whenever precision with decimals matters.\n\n```\n3.14   -0.5   2.0   99.99\n```\n\n### 3. String (`str`)\nA sequence of characters — text. Always wrapped in quotes ('single' or \"double\" depending on the language).\n\n```\n\"hello\"   \"TheWebytes\"   \"42\"   \"\"\n```\n\n> Note: `\"42\"` is a string, NOT the number 42. They behave differently in arithmetic — this is a classic source of bugs (see Type Conversion).\n\n### 4. Boolean (`bool`)\nOnly two possible values: `True` or `False` (in some languages `true`/`false`). Used to make decisions.\n\n```\nTrue   False\n```\n\n## Type Comparison Table\n\n| Type | Stores | Example | Common operations |\n|---|---|---|---|\n| int | Whole numbers | `25` | +, -, *, /, //, % |\n| float | Decimal numbers | `2.5` | +, -, *, / |\n| string | Text | `\"hi\"` | + (concat), len(), slicing |\n| bool | True/False | `True` | and, or, not, comparisons |\n\n## Checking a Variable's Type\n\nYou can ask a variable what type it holds instead of guessing:\n\n```python\nage = 21\nprint(type(age))   # <class 'int'>\n\nname = \"Aarav\"\nprint(type(name))  # <class 'str'>\n```\n\n## Key Takeaway\n\nA variable is a named box that stores a value. Every value has a **data type** — int, float, string, or bool — that decides what you can do with it. Always pick clear names and know the type of every value you store, because \"what kind of data is this?\" is the first question you must answer before writing any logic.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Type Conversion",
  "slug": "type-conversion",
  "lessonSlug": "variables-data-types-operators",
  "order": 1,
  "description": "Learn how to convert a value from one data type to another — implicit vs explicit conversion, the common pitfalls when strings meet numbers, and how to handle failed conversions safely.",
  "explanation": "## What is Type Conversion?\n\n**Type conversion** (also called **casting**) means changing a value from one data type to another — turning the string `\"42\"` into the integer `42`, or the integer `42` into the float `42.0`.\n\nWhy does this matter? Because the same data can arrive in different forms. A user's age arrives as a string from a form (`\"21\"`). A file stores prices as text. Before you can do arithmetic with those values, you often need to convert them into numbers.\n\n```python\nage_text = \"21\"          # string\nage = int(age_text)      # convert to integer -> 21\nprint(age + 1)           # 22  (would crash without conversion!)\n```\n\n## Implicit vs Explicit Conversion\n\n### Implicit (automatic)\nThe language converts types for you, automatically, when it is safe to do so. Example: adding an integer and a float. The integer is quietly promoted to a float so the arithmetic is exact.\n\n```python\nresult = 3 + 0.5     # 3 becomes 3.0 automatically\nprint(result)        # 3.5  (float)\n```\n\n### Explicit (manual)\nYou tell the language to convert, using a conversion function. You MUST do this when the automatic rules don't apply — e.g. a string can never be implicitly turned into a number.\n\n```python\n# Explicit conversions\nint(\"42\")        # -> 42\nfloat(\"3.14\")    # -> 3.14\nstr(100)         # -> \"100\"\n```\n\n## The Common Conversions\n\n| You have | You want | Convert with (Python) | Convert with (JS) | Convert with (Java) |\n|---|---|---|---|---|\n| string -> int | `\"42\"` -> `42` | `int(\"42\")` | `parseInt(\"42\", 10)` | `Integer.parseInt(\"42\")` |\n| string -> float | `\"3.14\"` -> `3.14` | `float(\"3.14\")` | `parseFloat(\"3.14\")` | `Double.parseDouble(\"3.14\")` |\n| int -> float | `42` -> `42.0` | `float(42)` | `Number(42)` | `(double) 42` |\n| number -> string | `42` -> `\"42\"` | `str(42)` | `String(42)` | `String.valueOf(42)` |\n\n## The Danger Zone: Strings That Look Like Numbers\n\nThe string `\"42\"` looks like a number, but it is NOT one. The moment you forget this:\n\n```javascript\nlet price = \"10\";          // string!\nconsole.log(price + 5);    // \"105\"  — string concatenation, not addition!\n```\n\nIn JavaScript the `+` operator concatenates strings, silently producing `\"105\"` instead of `15`. This is the #1 type-conversion bug. Convert first, then compute:\n\n```javascript\nlet price = Number(\"10\");  // number 10\nconsole.log(price + 5);    // 15 ✅\n```\n\n## What Happens When Conversion Fails?\n\nIf the text cannot be converted, the conversion throws an error (or returns a special \"not a number\" value in JavaScript). Always guard against bad input:\n\n```python\ndef safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None   # or 0 — your choice for the problem\n```\n\n## Key Takeaway\n\nType conversion changes a value from one type to another — use `int()`, `float()`, `str()`, `parseInt()`, `Number()`, etc. The language converts automatically when it's safe, but **strings never become numbers automatically**. Convert explicitly, handle bad input gracefully, and you will avoid the classic \"looks like a number but is text\" bug.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Operators & Expressions",
  "slug": "operators-expressions",
  "lessonSlug": "variables-data-types-operators",
  "order": 2,
  "description": "Learn how operators combine values into expressions — arithmetic, comparison, logical, and assignment operators — and the precedence rules that decide the order of evaluation.",
  "explanation": "## What is an Operator?\n\nAn **operator** is a symbol that tells the computer to perform a specific operation on one or more values. The values an operator works on are called **operands**.\n\n```\n5 + 3     # \"+\" is the operator, 5 and 3 are the operands\na == b    # \"==\" checks whether a and b are equal\n```\n\n## What is an Expression?\n\nAn **expression** is any combination of values, variables, and operators that produces a result. A single value is the simplest expression; `5 + 3` is a slightly bigger one. Expressions can be assigned to variables, printed, or used inside larger expressions.\n\n```python\ntotal = price + tax          # price + tax is an expression\nhas_discount = total < 1000  # comparison expression -> bool\n```\n\n## The Four Operator Families\n\n### 1. Arithmetic Operators (numbers in, numbers out)\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| + | Addition | `7 + 3` | `10` |\n| - | Subtraction | `7 - 3` | `4` |\n| * | Multiplication | `7 * 3` | `21` |\n| / | Division | `7 / 2` | `3.5` |\n| // | Integer division | `7 // 2` | `3` |\n| % | Modulo (remainder) | `7 % 2` | `1` |\n| ** | Exponent | `2 ** 3` | `8` |\n\n### 2. Comparison Operators (numbers/text in, bool out)\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| == | Equal to | `5 == 5` | `True` |\n| != | Not equal | `5 != 3` | `True` |\n| > | Greater than | `5 > 3` | `True` |\n| < | Less than | `5 < 3` | `False` |\n| >= | Greater or equal | `5 >= 5` | `True` |\n| <= | Less or equal | `5 <= 3` | `False` |\n\n### 3. Logical Operators (bools in, bool out)\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| and | Both must be true | `True and False` | `False` |\n| or | At least one true | `True or False` | `True` |\n| not | Flip the value | `not True` | `False` |\n\n### 4. Assignment Operators (store a result)\n\n| Operator | Meaning | Example | Equivalent to |\n|---|---|---|---|\n| = | Assign | `x = 5` | — |\n| += | Add and assign | `x += 3` | `x = x + 3` |\n| -= | Subtract and assign | `x -= 2` | `x = x - 2` |\n| *= | Multiply and assign | `x *= 2` | `x = x * 2` |\n| /= | Divide and assign | `x /= 2` | `x = x / 2` |\n\n## Operator Precedence — Who Goes First?\n\nWhen an expression has many operators, the language evaluates them in a fixed order — just like maths (BODMAS/PEMDAS):\n\n1. Parentheses `( )` — highest priority\n2. Exponents `**`\n3. Multiplication, Division, Modulo `* / // %`\n4. Addition, Subtraction `+ -`\n5. Comparisons `== != > < >= <=`\n6. Logical `not` → `and` → `or`\n7. Assignment `=` — last\n\n```python\nresult = 2 + 3 * 4        # 3*4=12, then 2+12 -> 14\nresult2 = (2 + 3) * 4     # parentheses first -> 5*4 = 20\n```\n\n**Golden rule:** when in doubt, use parentheses. They cost nothing and make your intent obvious.\n\n## Key Takeaway\n\nOperators are the verbs of programming — they combine values into **expressions** that produce results. Master the four families (arithmetic, comparison, logical, assignment), respect **precedence** (or use parentheses), and remember: comparisons and logical operators always produce a boolean, which is exactly what you need to make decisions in code.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
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
},
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
},
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
},
{
  "title": "Defining Functions",
  "slug": "defining-functions",
  "lessonSlug": "functions-scope",
  "order": 0,
  "description": "Learn the recipe anatomy of a function — header, body, and return value — why functions exist, and the golden rule that each function does exactly one job well.",
  "explanation": "## The Simple Idea — A Function Is a Recipe\n\nA **function** is a named block of code that you write once and run as many times as you like. Think of it as a cooking recipe: the recipe doesn't make the dish by itself — you have to *follow* it. Calling the function is \"following the recipe\".\n\n```\ndef make_chai(milk, sugar):     `← PART 1: the header (name + ingredients)`\n    boil(milk)                  `← PART 2: the body (the steps, indented)`\n    add(sugar)\n    return cup                  `← PART 3: the dish (what comes out)`\n```\n\n### The Recipe Anatomy (Memorise the Three Parts)\n\n| Part | Name | What it is | In the recipe |\n|---|---|---|---|\n| `def name(ingredients):` | **Header** | The recipe's name + what it needs | `def make_chai(milk, sugar):` |\n| indented lines | **Body** | The steps, run top-to-bottom | `boil(milk)` / `add(sugar)` |\n| `return value` | **Dish** | The result handed back to the caller | `return cup` |\n\n### Why Functions Exist — The 4 P's\n\n✅ **Package** — write the logic once, call it from a hundred places\n✅ **Protect** — fix a bug in one place and every caller benefits\n✅ **Puzzle-ize** — split a huge problem into small, testable pieces\n✅ **Prove** — test one recipe at a time instead of debugging a wall of code\n\n> **The Golden Rule: a function does ONE job well.** If the name needs the word \"and\" in it (`get_total_and_save`), split it in two.\n\n### Naming a Function\n\nFollow the same rules as variables, but make names **verb-first** — a function *does* something:\n\n- `get_total()` — reads like an action ✅\n- `total` — could be a value, not an action ❌\n- `is_valid()`, `calculate_area()`, `send_email()` — all actions\n\n### The Header Anatomy\n\n```\ndef   calculate_area (  length,  width  )   :\n │      └── name ──┘    └params┘     │\n the keyword          inputs in     the colon\n that starts          parentheses\n the function\n```\n\nThe body must be **indented** (convention: 4 spaces). Every line under the header belongs to the function; the first un-indented line ends it.\n\n### Calling a Function\n\nYou call a function by its name with parentheses — and pass the values (arguments) it needs:\n\n```python\ndef greet(name):\n    print(\"Hello, \" + name + \"!\")\n\ngreet(\"Aarav\")   # Hello, Aarav!\ngreet(\"Meera\")   # Hello, Meera!\n```\n\nEach call runs the whole body with that call's value. No need to copy-paste the greeting code anywhere.\n\n### The Three Silent Killers\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Missing colon after the header | Syntax error the moment the file loads | End the header with `:` |\n| Body not indented | Code silently outside the function | Indent every body line 4 spaces |\n| Calling before defining | `NameError` — the name is not yet defined | Define first, call after |\n\n### Quick Self-Test (answers at the bottom)\n\n1. The three parts of a function are — (a) name, args, return  (b) header, body, dish  (c) def, if, loop  (d) input, output, error\n2. Which is the best function name? (a) `x`  (b) `calculate_area`  (c) `calc`  (d) `area_only_please_123`\n3. What runs when `greet(\"Aarav\")` is called? (a) The body with name = \"Aarav\"  (b) Nothing  (c) The whole file  (d) Only the header\n4. The Golden Rule of functions is — (a) write as many lines as possible  (b) do ONE job well  (c) always use recursion  (d) never use parentheses\n5. An un-indented body means — (a) the code is inside the function  (b) the code is outside the function  (c) a faster program  (d) an error in the header\n\n**Answers:** 1→b, 2→b, 3→a, 4→b, 5→b.\n\n### Key Takeaway\n\nA function is a named recipe with three parts — header, body, dish. Write it once, call it anywhere, give it an action-name, and keep it to one job. The most common failures are boring but brutal: a missing colon, a forgotten indent, or a call before the definition.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Parameters & Return Values",
  "slug": "parameters-return-values",
  "lessonSlug": "functions-scope",
  "order": 1,
  "description": "Learn the handshake between parameters and arguments, the critical difference between print and return, and how default parameters behave — including the mutable-default trap.",
  "explanation": "## The Simple Idea\n\n**Parameters** are the recipe's ingredients — placeholders written in the header. **Arguments** are the actual values you hand over when you call. **`return`** is the dish — the value your function sends back to the caller.\n\n```python\ndef area(length, width):    `← length, width = PARAMETERS (placeholders)`\n    return length * width\n\na = area(5, 3)              `← 5, 3 = ARGUMENTS (the real values)`\n```\n\n### The Call ↔ Parameter Handshake\n\nArguments bind to parameters **by position**: the 1st argument meets the 1st parameter, the 2nd meets the 2nd, and so on.\n\n```\narea(5, 3)   →  length = 5, width = 3   →  5 × 3 = 15\narea(4, 6)   →  length = 4, width = 6   →  4 × 6 = 24\n```\n\nSwap the order and you hand the values to the wrong ingredients.\n\n### The Two Doors: `print` vs `return`\n\nThe #1 beginner bug is *printing when you should return*. They are not the same:\n\n| You want to… | Use | What happens |\n|---|---|---|\n| Show text on screen | `print(value)` | Side-effect; the function returns `None` |\n| Hand a value back for storage/comparison | `return value` | Caller receives the actual value |\n\n```python\ndef a():\n    print(5)     # prints \"5\" but returns None\ndef b():\n    return 5     # prints nothing, returns the number 5\n\nx = a()          # x = None\ny = b()          # y = 5 — the value is really captured\n```\n\n### Default Parameters — The Fallback Values\n\nA **default parameter** gives a placeholder a value to use when the caller doesn't send one.\n\n```python\ndef area(length, width=None):     # width has a fallback\n    if width is None:\n        width = length            # square! width defaults to length\n    return length * width\n\narea(5, 3)   # 15 — both arguments supplied\narea(4)      # 16 — width falls back to 4 → square 4 × 4\n```\n\n### The Default-Position Rule\n\nDefaults must come **after** required parameters. `def f(a, b=2)` is valid; `def f(a=1, b)` is a syntax error — the language can't tell what the caller meant when a required parameter sits behind an optional one.\n\n### The Mutable-Default Trap\n\nNever use a mutable value (an empty list `[]` or dict `{}`) as a default. It is created **once** at definition time and **shared** by every call — changes to it in one call leak into the next.\n\n```python\ndef push(item, items=[]):    # BAD — the list is shared!\n    items.append(item)\n    return items\n\npush(1)   # [1]\npush(2)   # [1, 2]   `← the first call list came back!`\n\ndef push(item, items=None):  # GOOD — fresh list each call\n    if items is None:\n        items = []\n    items.append(item)\n    return items\n```\n\n### Worked Example — The Full Trace\n\n```\narea(4)          area(5, 3)\n│                │\n▼                ▼\nlength = 4       length = 5   width = 3\nwidth = None     width = 3\n└─ None? yes     └─ width given → keep 3\n   width = 4         return 5 × 3 = 15\n   return 4 × 4 = 16\n```\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Forgetting `return` | Function silently returns `None` | End with `return value` |\n| Reversed arguments | `area(3, 5)` swaps the meaning | Match positions: 1st→1st |\n| Mutable default | Shared list/dict across calls | Default `None`, create inside |\n| Too many / too few args | `TypeError` at the call | Count the parameters |\n\n### Quick Self-Test (answers at the bottom)\n\n1. `area(5, 3)` binds — (a) length=3, width=5  (b) length=5, width=3  (c) length=5, width=None  (d) length=None, width=None\n2. A function that only `print`s a value returns — (a) the printed value  (b) `None`  (c) the string of the value  (d) an error\n3. `area(4)` with `width=None` default returns — (a) 4  (b) 16  (c) 8  (d) 0\n4. `def foo(a=1, b)` is — (a) valid  (b) a syntax error (default before required)  (c) valid only in Java  (d) slower\n5. The mutable-default fix is — (a) default `None`, make the list inside  (b) never use lists  (c) use a global list  (d) default `[]`\n\n**Answers:** 1→b, 2→b, 3→b, 4→b, 5→a.\n\n### Key Takeaway\n\nParameters are the ingredients, arguments are the real values, and `return` is the dish the caller can actually keep. Print shows, return supplies; defaults give parameters a fallback — but they must come last and never be mutable.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Variable Scope",
  "slug": "variable-scope",
  "lessonSlug": "functions-scope",
  "order": 2,
  "description": "Learn who-can-see-what — local vs global variables, the shadow trap where assignment builds a copy, and the scope ladder that decides where every name is found.",
  "explanation": "## The Simple Idea\n\n**Scope** is the visibility zone of a variable — the region of code where that name is in play. A variable defined inside a function is **local** (only that function can see it). A variable defined at the top level is **global** (everything can see it).\n\n### The Scope Map\n\n```\n+--------------------------------------------------+\n| GLOBAL ZONE  (module level)                      |\n|   price = 100        `← visible EVERYWHERE`        |\n|                                                  |\n|   def discount():                                |\n|       off = 20       `← LOCAL to discount only`    |\n|       return price - off                         |\n+--------------------------------------------------+\n```\n\nHere `price` is global — `discount()` can read it. `off` is local — nothing outside `discount()` can see it.\n\n### The Read/Write Rule (The Crux of Scope)\n\n- **READ a global inside a function** → perfectly allowed. The function can look out and see it.\n- **ASSIGN inside a function** → creates a brand-new **local** variable, even if a global with the same name exists. This is called **shadowing**.\n\n### The Shadow Trap\n\n```python\nx = 10\n\ndef change():\n    x = 5          # NOT the global x — a NEW local x!\n    print(x)       # 5 (inside)\n\nchange()\nprint(x)           # 10 (global untouched)\n```\n\nThe assignment inside `change()` does not touch the global — it builds a shadow copy. If you *want* to modify the global inside a function you need the `global` keyword, which is rare and usually a code smell. The clean pattern is to pass values as parameters and receive the result through `return`.\n\n### The Scope Ladder (Where a Name Is Found)\n\nWhen your code uses a name, the language searches this order — first match wins:\n\n```\n1. LOCAL     — inside the current function\n2. GLOBAL    — module level, outside any function\n3. BUILT-IN  — the language's own names (print, len, ...)\n```\n\n### Worked Example — Factorial's Variables\n\nIn the factorial problem, `n` (the parameter) and `result` are **local** to the function. Even if a global `n = 100` exists, calling `factorial(5)` uses its own local 5 — the parameter *shadows* the global for the duration of the call, and the global is untouched afterwards.\n\n```\nglobal:  n = 100\ncall:    factorial(5)\n         → inside: n = 5 (local copy of the parameter)\n         → loop builds result = 120\n         → return 120; global n stays 100\n```\n\n### Loops and Scope\n\nLoop variables are **not** block-scoped in Python — `i` from a `for` loop still exists after the loop ends, inside the same function. Java *does* scope them to the loop block. Knowing this explains small surprises like reusing `i` later.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Shadowing | New local hides the global | Rename, or pass as a parameter |\n| Assuming the global changed | `change()` left `x` = 10 | Use the `return` value instead |\n| Reading before assigning | `NameError` inside a function | Initialise the variable first |\n| Loop variable afterlife | `i` still alive after the loop | Reuse it on purpose, not by accident |\n\n### Quick Self-Test (answers at the bottom)\n\n1. A variable defined inside a function is — (a) global  (b) local  (c) built-in  (d) invisible\n2. Reading a global inside a function is — (a) forbidden  (b) allowed  (c) only with `import`  (d) an error\n3. `x = 5` inside a function where a global `x` exists — (a) changes the global  (b) creates a new local  (c) errors  (d) deletes the global\n4. Search order for a name is — (a) global → local → built-in  (b) local → global → built-in  (c) built-in → local → global  (d) random\n5. In Python, a loop variable after the loop ends — (a) is deleted  (b) still exists  (c) errors  (d) becomes global\n\n**Answers:** 1→b, 2→b, 3→b, 4→b, 5→b.\n\n### Key Takeaway\n\nScope is who-can-see-what: locals live inside a function, globals live at the top, and the ladder looks local-first. Reading a global is free; assigning inside a function makes a shadow copy. Pass values in, return results out — and leave the `global` keyword alone.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
}
,
{
  "title": "Defining Classes",
  "slug": "defining-classes",
  "lessonSlug": "classes-objects",
  "order": 0,
  "description": "Learn the blueprint metaphor — a class describes, an object exists — and the anatomy of a class: the keyword, the PascalCase name, and the methods living inside its indented body.",
  "explanation": "## The Blueprint Metaphor\n\nThink of a **class** as an architectural blueprint, and an **object** as a building constructed from that blueprint.\n\n```\n   BLUEPRINT (the class)              BUILDINGS (the objects)\n   ┌───────────────────────┐          ┌───────────┐  ┌───────────┐\n   │ BankAccount           │          │ BankAccount│ │ BankAccount│\n   │  - owner: string      │   ───▶   │  owner: \"Aarav\"  │  owner: \"Meera\" │\n   │  - balance: number    │          │  balance: 5000   │  balance: 200   │\n   │  + deposit(amount)    │          │  + deposit()     │  + deposit()    │\n   │  + withdraw(amount)   │          │  + withdraw()    │  + withdraw()   │\n   └───────────────────────┘          └───────────┘  └───────────┘\n```\n\nOne blueprint → many buildings. Every building follows the same design, yet each one is a completely independent physical thing. **A class describes; an object exists.**\n\n### Class vs Object — The Table\n\n| | Class | Object (instance) |\n|---|---|---|\n| What is it? | The blueprint / the design | A real thing made from the blueprint |\n| How many? | One | Many |\n| Made when? | When the file loads | When you *call* the class |\n| Example | `BankAccount` | `acc1 = BankAccount()` |\n| Analogy | The recipe | The actual dish |\n\n### The Anatomy of a Class\n\n```python\nclass BankAccount:                 # ← the keyword \"class\" + PascalCase name + colon\n    def deposit(self, amount):     # ← methods: functions INSIDE the class\n        self.balance += amount\n```\n\n| Part | What it is |\n|---|---|\n| `class Name:` | The keyword, the PascalCase name, the colon |\n| indented body | Everything inside the class — its methods |\n| methods | Functions that belong to the class and act on its objects |\n\n### Attributes and Methods — Nouns and Verbs\n\nA class bundles two kinds of things:\n\n- **Attributes** (nouns) — data each object has: `owner`, `balance`, `color`, `size`\n- **Methods** (verbs) — actions each object can do: `deposit()`, `withdraw()`, `start()`, `stop()`\n\nIf a class name is a noun, its attributes are adjectives and its methods are verbs. This one habit makes your classes read like English sentences: `account.withdraw(500)`.\n\n### Creating an Object — Call the Class\n\nAn object is born by \"calling\" the class, exactly like calling a function:\n\n```python\nacc1 = BankAccount()   # call the class → brand-new object\nacc2 = BankAccount()   # a SECOND, completely separate object\n```\n\n`acc1` and `acc2` are independent: changing `acc1`'s data never leaks into `acc2`. That independence is the entire point of OOP.\n\n### Naming Conventions\n\n- **Classes**: PascalCase — `BankAccount`, `ShoppingCart`, `EmailSender`\n- **Objects (variables)**: snake_case / camelCase — `bank_account`, `shoppingCart`\n- **Methods**: verb-first snake_case — `deposit()`, not `money()`\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Forgetting the colon | Syntax error at class load | End the header with `:` |\n| Body not indented | Methods silently end up outside the class | Indent every class line 4 spaces |\n| Lowercase class name | `bankAccount` reads like a variable | PascalCase: `BankAccount` |\n| \"Object vs class\" confusion | Talking about *the* account instead of *an* account | One blueprint, many buildings |\n\n### Quick Self-Test (answers at the bottom)\n\n1. A class is best compared to — (a) a building  (b) a blueprint  (c) a variable  (d) a loop\n2. How many objects can one class create? (a) exactly one  (b) as many as you call the class  (c) two, no more  (d) zero\n3. Methods inside a class are — (a) functions  (b) variables  (c) loops  (d) comments\n4. Which name follows the class naming convention? (a) `bankAccount`  (b) `BankAccount`  (c) `bank_account`  (d) `bankaccount`\n5. Two objects from the same class — (a) share all data  (b) are independent copies  (c) cannot both exist  (d) must have equal values\n\n**Answers:** 1→b, 2→b, 3→a, 4→b, 5→b.\n\n### Key Takeaway\n\nA class is a blueprint — it *describes*; an object is a building — it *exists*. One class, many independent objects. Write classes in PascalCase, bundle nouns (attributes) and verbs (methods), and create objects by calling the class like a function.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Constructors & Instance Variables",
  "slug": "constructors-instance-variables",
  "lessonSlug": "classes-objects",
  "order": 1,
  "description": "Learn how the __init__ constructor runs automatically at birth, how self points at the object being built, and how instance variables give every object its own private state.",
  "explanation": "## The Problem: Every Object Needs Its Own Fresh State\n\n`BankAccount()` creates an object — but an empty shell with no owner and no balance is useless. Every real account needs *its own* starting data: Aarav's account with ₹5,000, Meera's with ₹200. The **constructor** is the special method that runs automatically the moment an object is born, ready to receive that starting data.\n\n### The Constructor — `__init__`\n\nIn Python the constructor is always named `__init__` (initialise). It runs **exactly once, automatically**, right after the object is created — you never call it by hand.\n\n```python\nclass BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner          # store on the object\n        self.balance = balance\n```\n\n```\nBankAccount(\"Aarav\", 5000)\n    │\n    ▼  Python secretly does:\n    new_obj = <brand-new empty object>\n    BankAccount.__init__(new_obj, \"Aarav\", 5000)\n    └── inside __init__: self = new_obj\n        self.owner   = \"Aarav\"\n        self.balance = 5000\n    return new_obj\n```\n\n### `self` — The Object Being Built\n\n`self` is the secret glue of OOP. It is **the current object** — the very instance the constructor is initialising (or the instance a method is acting on). Without `self` the constructor has no way to say *\"store this value ON this particular object\"*.\n\n> Rule: the first parameter of every instance method is `self`. The language passes it automatically — you never supply it at the call site.\n\n### Instance Variables — Stored on Each Object\n\n`self.owner` and `self.balance` are **instance variables**: each object gets its own private copy. The dot tells the story — `self.owner` means \"this object's owner\".\n\n```\nacc1 = BankAccount(\"Aarav\", 5000)     acc2 = BankAccount(\"Meera\", 200)\nacc1.owner   = \"Aarav\"                acc2.owner   = \"Meera\"\nacc1.balance = 5000                   acc2.balance = 200\n```\n\nChanging `acc1.balance` affects nothing but `acc1`. The instance variables are the object's private lockers.\n\n### Reading Attributes — Dot Notation\n\nOnce the object exists, any code holding the object can read and write its attributes with a dot:\n\n```python\nprint(acc1.balance)     # 5000\nacc1.balance += 100     # allowed — but direct poking like this is a code smell\n```\n\n### Default Values in the Constructor\n\nLike any function, a constructor can give parameters fallback values:\n\n```python\ndef __init__(self, owner, balance=0):   # balance is optional\n    self.owner = owner\n    self.balance = balance\n\nBankAccount(\"Meera\")        # balance silently starts at 0\nBankAccount(\"Aarav\", 5000)  # balance starts at 5000\n```\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Forgetting `self` in `__init__` | TypeError the moment an object is created | First parameter is always `self` |\n| Forgetting to store with `self.` | Attribute never saved — `self.owner` missing later | Always assign to `self.xxx` |\n| Calling `__init__` by hand | Double initialisation — bad state | Never call it; it runs automatically |\n| Constructor name typo | Method never runs — objects born empty | Must be spelled exactly `__init__` |\n\n### Quick Self-Test (answers at the bottom)\n\n1. The constructor in Python is always named — (a) `build`  (b) `init`  (c) `__init__`  (d) `start`\n2. The constructor runs — (a) when you call it by name  (b) automatically when an object is created  (c) once per program  (d) only with the `new` keyword\n3. `self` inside `__init__` refers to — (a) the class  (b) a global variable  (c) the current instance being built  (d) the first argument\n4. `BankAccount(\"Meera\")` with `balance=0` default gives — (a) an error  (b) balance None  (c) balance 0  (d) balance undefined\n5. Instance variables are stored — (a) on each object via `self`  (b) in the class only  (c) in global scope  (d) in the file\n\n**Answers:** 1→c, 2→b, 3→c, 4→c, 5→a.\n\n### Key Takeaway\n\nThe constructor (`__init__`) runs automatically at birth, takes the starting data, and stores it as **instance variables** on the object via `self`. Every object gets its own private copy — one blueprint, many independent lockers.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Methods",
  "slug": "methods",
  "lessonSlug": "classes-objects",
  "order": 2,
  "description": "Learn how methods are functions with self first, how acc.deposit(500) is sugar for BankAccount.deposit(acc, 500), and how methods reach an object's state through self.",
  "explanation": "## What a Method Is\n\nA **method** is a function that belongs to a class. The only structural difference from a plain function: its first parameter is `self` — the object it is acting on.\n\n```python\nclass BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):          # a method — self first!\n        self.balance += amount\n```\n\n### The Sweet Sugar: `acc.deposit(500)`\n\nCalling a method on an object is shorthand. These two lines are **identical**:\n\n```python\nacc.deposit(500)                    # sugar — reads like English\nBankAccount.deposit(acc, 500)       # the full truth: object goes in as self\n```\n\nThe object *before* the dot is automatically passed as `self`. That is the entire trick of method syntax — and why forgetting `self` in the definition breaks every call: the language would try to stuff the object into `amount`.\n\n### Methods Talk to the Object Through `self`\n\nInside a method, `self` is the object that received the call, so a method can read and update that object's instance variables:\n\n```python\ndef withdraw(self, amount):\n    if amount <= self.balance:        # read the object's own balance\n        self.balance -= amount        # update the object's own balance\n        return True\n    return False\n```\n\n`acc1.withdraw(200)` changes only `acc1`'s balance — `acc2`'s locker is untouched.\n\n### The Three Kinds of Methods (brief preview)\n\n| Kind | First param | What it does | When to use |\n|---|---|---|---|\n| **Instance method** | `self` | Acts on one object's data | Almost everything |\n| Class method | `cls` | Acts on the class itself | Factory helpers, shared config |\n| Static method | none | Plain function parked in the class | Utilities that need no object data |\n\nThis lesson cares about instance methods — the other two are formalities you will meet later.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Missing `self` in the definition | TypeError: method takes N args but 1 was given | First parameter is `self` |\n| Calling without parentheses | `acc.deposit` is the method object, not a call | `acc.deposit(500)` |\n| Forgetting the dot | Name not found — it lives on the object | `acc.<method>()` |\n| Putting logic outside the class | Method-less objects — data has no verbs | Every action on an object is a method |\n\n### Quick Self-Test (answers at the bottom)\n\n1. The only structural difference between a method and a function is — (a) the `self` first parameter  (b) the `return` keyword  (c) indentation  (d) the class keyword\n2. `acc.deposit(500)` is shorthand for — (a) `deposit(acc, 500)`  (b) `BankAccount.deposit(acc, 500)`  (c) `BankAccount.deposit(500)`  (d) `acc(500)`\n3. Inside `withdraw`, `self.balance` is — (a) a global  (b) the balance of the object that received the call  (c) a local variable  (d) an error\n4. A method that only returns a value without touching `self` — (a) is impossible  (b) is still an instance method  (c) must be a loop  (d) crashes\n5. Which call is correct? (a) `acc.deposit`  (b) `acc.deposit(500)`  (c) `deposit(acc)`  (d) `BankAccount(500)`\n\n**Answers:** 1→a, 2→b, 3→b, 4→b, 5→b.\n\n### Key Takeaway\n\nA method is a function with `self` first. `acc.deposit(500)` is sugar for `BankAccount.deposit(acc, 500)` — the dot-object is automatically passed as `self`, giving the method access to that one object's state. Verbs on the object, state on the object, both through `self`.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Inheritance Basics",
  "slug": "inheritance-basics",
  "lessonSlug": "inheritance-polymorphism",
  "order": 0,
  "description": "Learn the IS-A relationship — a child class automatically receives the parent's methods and constructor setup, then adds its own extras, with super() opening the door to the parent.",
  "explanation": "## The Parent-Child Idea\n\n**Inheritance** is the IS-A relationship between classes: a **child class** (subclass) is a specialised version of a **parent class** (superclass), and therefore inherits — automatically receives — everything the parent defines.\n\n```\n      Shape                    ← the PARENT (superclass)\n       ▲\n       │  is-a\n   ┌───┴────┐\n Circle    Rectangle           ← the CHILDREN (subclasses)\n```\n\nA Circle *is a* Shape. A Rectangle *is a* Shape. Everything a Shape can do (have a name, compute an area) a Circle can do too — inherited for free.\n\n### The IS-A Test\n\nBefore building any hierarchy, ask: **\"Is every child genuinely a type of the parent?\"** A `Dog` IS-A `Animal` ✅. A `Dog` IS-A `Car` ❌ — inheritance that fails the IS-A test is a design bug that will haunt the project.\n\n### The Syntax — Three Flavours, One Idea\n\n```python\nclass Circle(Shape):          # Python: parent in parentheses\n    ...\n\nclass Circle extends Shape    # Java: the extends keyword\nclass Circle extends Shape    # JavaScript: same keyword\n```\n\n### What the Child Inherits\n\n| Inherited for free | Not inherited |\n|---|---|\n| All the parent's methods | (In some languages) private members |\n| All the parent's instance-variable setup via the constructor | The child's own new members (until you add them) |\n\nThe child can then:\n\n1. **Keep** a method exactly as the parent wrote it\n2. **Override** it — rewrite with the same name (see Method Overriding)\n3. **Add** brand-new methods of its own\n\n### Adding New Powers — The Child's Own Members\n\n```python\nclass Rectangle(Shape):\n    def __init__(self, length, width):\n        super().__init__(\"Rectangle\")   # 1. run the parent's constructor\n        self.length = length            # 2. then add its own state\n        self.width = width\n\n    def diagonal(self):                 # a brand-new method, only Rectangle has it\n        return (self.length ** 2 + self.width ** 2) ** 0.5\n```\n\n`super()` is the doorway to the parent. Calling `super().__init__(\"Rectangle\")` runs the parent's constructor so the shared \"name\" state is set up — skipping it leaves the inherited state unbuilt.\n\n### The Method-Lookup Chain\n\nWhen you call a method on a child object, the language searches: **child first, then parent, then grandparent.** The first match wins. This single rule powers both inheritance and overriding.\n\n```\ncircle.area()\n   │\n   ▼\n1. Does Circle define area()?   → yes → run Circle's\n2. No? Does Shape define area()? → yes → run Shape's\n```\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Failing the IS-A test | A `Lizard` extending `LaserPrinter` — nonsense design | Ask \"is-a?\" before extending |\n| Forgetting `super().__init__` | Inherited state never built — missing attributes | Call it first in the child constructor |\n| Inheriting to reach one method | Coupling children to a parent they're not a type of | Composition over inheritance |\n| Overriding by accident | A child method with the same name silently replaces the parent's | Deliberate names; deliberate overrides |\n\n### Quick Self-Test (answers at the bottom)\n\n1. `class Circle(Shape):` means — (a) Shape is a child of Circle  (b) Circle is a child of Shape  (c) Circle calls Shape once  (d) Circle deletes Shape\n2. A child class automatically gets — (a) only the constructor  (b) nothing until it copies code  (c) the parent's methods  (d) the parent's private bank accounts\n3. `super().__init__(...)` inside a child constructor — (a) runs the parent's constructor  (b) deletes the parent  (c) creates a second parent  (d) is only for static methods\n4. Method lookup searches — (a) parent first, then child  (b) child first, then parent  (c) random  (d) only the child\n5. Which passes the IS-A test? (a) `Horse` extends `WashingMachine`  (b) `Truck` extends `Vehicle`  (c) `Pizza` extends `Email`  (d) `Chair` extends `Oxygen`\n\n**Answers:** 1→b, 2→c, 3→a, 4→b, 5→b.\n\n### Key Takeaway\n\nInheritance is the IS-A relationship: the child inherits the parent's methods and constructor setup, then adds its own. Search order is child-first-then-parent, `super()` opens the parent's constructor, and the IS-A test decides whether a hierarchy is brilliant or broken.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Method Overriding",
  "slug": "method-overriding",
  "lessonSlug": "inheritance-polymorphism",
  "order": 1,
  "description": "Learn how a child swaps the parent's behaviour — same method name and signature, a specialised body — and how super().method() extends instead of replacing.",
  "explanation": "## What Overriding Is\n\n**Overriding** = defining a method in the child with the **same name and same signature** as the parent, so the child's version replaces the parent's for child objects.\n\n```python\nclass Shape:\n    def area(self):\n        return 0          # generic placeholder: \"I have no fixed area\"\n\nclass Circle(Shape):\n    def area(self):       # SAME name, SAME parameters\n        return 3.14159 * self.radius ** 2\n```\n\n`Circle.area()` is the *override*. A generic `Shape` object returns 0; a `Circle` returns πr² — the same verb, a specialised body.\n\n### Same Verb, Different Body\n\nOverride exists because children share the *vocabulary* but not the *math*. Every shape answers `area()`; only each shape knows how to compute its own. The call site says one word — `shape.area()` — and the object decides what that word means. This is the bridge to polymorphism.\n\n### Extend, Don't Replace — `super().method()`\n\nOften the child wants the parent's behavior PLUS something extra. `super()` reaches back into the parent:\n\n```python\ndef display(self):\n    super().display()          # parent's version first\n    print(\"  (a circle!)\")     # then the child's addition\n```\n\nPattern: **parent first, child extra.** This keeps shared behavior in one place instead of copy-pasting it.\n\n### Override vs Overload — Don't Confuse Them\n\n| | Override | Overload |\n|---|---|---|\n| What | Child redefines a parent method, same signature | Same class, same name, DIFFERENT parameters |\n| Why | Replace/extend inherited behavior | One name, several parameter sets |\n| Where | Between parent and child | Inside one class |\n| Exam trap | Same name + same signature + different class | Same name + different signature + same class |\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Typo in the signature | Parent's version silently runs instead of the override | Match name AND parameters exactly |\n| Forgetting `super()` when extending | Parent's half of the behavior is lost | Call `super().method()` first |\n| Overriding a method you meant to keep | Behavior changes unexpectedly | Override deliberately, or don't |\n| Changing parameter names/types | Looks like an override, behaves like a new method | Match the parent's signature |\n\n### Quick Self-Test (answers at the bottom)\n\n1. Overriding means — (a) deleting the parent's method  (b) same name + same signature in the child, replacing the parent's  (c) adding a new method with a new name  (d) calling the parent twice\n2. A Shape with `area() → 0` and a Circle with `area() → πr²` is — (a) an overload  (b) an override  (c) an error  (d) a loop\n3. `super().method()` in an override — (a) runs the parent's version first  (b) deletes the parent  (c) renames the method  (d) is only for constructors\n4. Overload is — (a) same name, different parameters, same class  (b) same name, same parameters, child class  (c) two classes merging  (d) recursion\n5. A typo in the override's signature causes — (a) a crash  (b) the parent's version to silently run  (c) the child's version to run  (d) nothing\n\n**Answers:** 1→b, 2→b, 3→a, 4→a, 5→b.\n\n### Key Takeaway\n\nOverriding is the same verb with a specialised body: same name, same signature, child replaces parent. Use `super()` to extend instead of replace (parent first, child extra), and never confuse override (child vs parent) with overload (different parameters, one class).",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Polymorphism",
  "slug": "polymorphism",
  "lessonSlug": "inheritance-polymorphism",
  "order": 2,
  "description": "Learn how one method name takes many forms — a call site written against the parent type that behaves per the actual object, and why that makes adding new subclasses a zero-edit event.",
  "explanation": "## The Word and the Idea\n\n**Poly-morphism** = *many forms*. One method name, many behaviours — and the code that calls it doesn't care which one it gets.\n\n```python\nshapes = [Circle(7), Rectangle(4, 5), Shape()]\n\nfor shape in shapes:\n    print(shape.area())     # 153.93...  20  0\n```\n\nOne line of code — `shape.area()` — produces three different answers, because **each object brings its own form of `area()`**. That is polymorphism in one sentence.\n\n### The Polymorphic Call Site\n\nThe magic: the *caller* is written once, against the **parent type**. The *object* decides the actual behavior at runtime.\n\n```\nfor shape in shapes:          ← written against Shape, the PARENT\n    print(shape.area())       ← each child's override runs automatically\n```\n\n- `Circle(7)` → Circle's `area()` → 153.93…\n- `Rectangle(4, 5)` → Rectangle's `area()` → 20\n- `Shape()` → Shape's `area()` → 0\n\nThe loop never mentions `Circle` or `Rectangle` by name. It just says `area()` — and the runtime dispatches to whichever form the object has. This is called **runtime polymorphism** (dynamic dispatch).\n\n### Why It's the Superpower of Big Projects\n\nWithout polymorphism, the loop would need to check every type:\n\n```\nif isinstance(s, Circle): print(circle_area(s))\nelif isinstance(s, Rectangle): print(rect_area(s))\n...\n```\n\nEvery new shape = a new `elif` = touching working code. **With** polymorphism, adding a new shape touches nothing:\n\n> Add a new subclass, implement `area()`, done. All existing code keeps working — it already talks to Shape.\n\nThat is extensibility: the open/closed principle in miniature (open for extension, closed for modification).\n\n### Duck Typing (Python & JavaScript flavour)\n\n\"if it walks like a duck and quacks like a duck, it's a duck.\" These languages don't even *require* the parent — any object with an `area()` method is accepted:\n\n```python\ndef print_area(thing):\n    print(thing.area())     # works on ANY object that has area()\n\nprint_area(Circle(7))       # fine\nprint_area(Rectangle(4, 5)) # fine\n```\n\nStructure matters, not ancestry. Statically-typed languages (Java) need the formal parent type instead.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| If/else chains on type | New classes force edits to working code | Rely on the shared method instead |\n| Forgetting the override | The parent's generic version runs | Implement the method in every child |\n| Expecting the parent's behavior | Overrides change answers per object | Know which object is really in hand |\n| Passing the wrong type | Static languages reject it at compile time | Use the parent type in the signature |\n\n### Quick Self-Test (answers at the bottom)\n\n1. Polymorphism means — (a) one method name with many behaviours  (b) many method names, one behaviour  (c) classes with no methods  (d) functions outside classes\n2. The polymorphic call site is written against — (a) the child types  (b) the parent type  (c) no type  (d) the constructor\n3. `for s in shapes: print(s.area())` with Circle and Rectangle objects — (a) crashes  (b) each object runs its own area()  (c) always runs Shape's  (d) runs only once\n4. Adding a new subclass with polymorphism — (a) requires editing the loop  (b) requires no changes to existing code  (c) breaks everything  (d) needs an if/else\n5. Duck typing accepts — (a) only the exact parent class  (b) any object that has the needed method  (c) only grandchildren  (d) nothing\n\n**Answers:** 1→a, 2→b, 3→b, 4→b, 5→b.\n\n### Key Takeaway\n\nPolymorphism = many forms for one name. Write the call site against the parent type; each object's override runs automatically. It kills if/else type-chains, makes adding new subclasses a zero-edit event, and (in duck-typed languages) asks only that an object *has* the method.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Access Modifiers",
  "slug": "access-modifiers",
  "lessonSlug": "encapsulation-abstraction",
  "order": 0,
  "description": "Learn the three doors on data — public, protected, private — how Java enforces them and Python agrees by underscore, and the getter/setter checkpoint pattern.",
  "explanation": "## The Problem: Unguarded State\n\nRight now any code holding an account can do this:\n\n```python\nacc.balance = -5000       # nobody stops this!\n```\n\nA negative balance breaks the meaning of an account — yet nothing in the class prevented it. **Access modifiers** are the language-level doors that lock the data: *public* (anyone), *protected* (family only), *private* (nobody but me).\n\n### The Three Doors\n\n| Modifier | Who can touch it | Idea |\n|---|---|---|\n| **Public** | Everyone | The open sign |\n| **Protected** (`_` in Python, `protected` in Java) | The class and its children | Family-only |\n| **Private** (`__` in Python with mangling, `private` in Java) | Only the class itself | Locked room |\n\n```java\npublic class BankAccount {\n    private double balance;        // locked — nobody outside touches it\n\n    public double getBalance() {   // the door with a peephole\n        return this.balance;\n    }\n}\n```\n\n### Python's Convention and the Rules That Are Real\n\nPython has no true `private` keyword — privacy is a **gentleman's agreement**:\n\n- `_balance` → private by convention: \"don't touch, friend\"\n- `__balance` → name-mangled to `_ClassName__balance`: the language actively fights outside access (though a determined cheat can still reach it)\n- `balance` → public\n\nJava and C# *enforce* privacy with the compiler; Python asks you to respect the underscore. Both carry the same lesson: **data has an owner, and touch-ups go through the owner's doors.**\n\n### The Getter / Setter Pattern\n\nWhen outsiders need access, they knock politely:\n\n```python\nclass BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self._balance = balance          # private by convention\n\n    def get_balance(self):               # read\n        return self._balance\n\n    def set_balance(self, amount):       # write — with the chance to validate\n        if amount < 0:\n            raise ValueError(\"Balance can't go negative\")\n        self._balance = amount\n```\n\nThe setter is a **checkpoint**: every change passes through validation instead of landing on the field directly.\n\n### The Rule of Thumb\n\n> **Fields private, methods public.** Data stays locked; behavior stays open. If an outsider needs the data, they get the *method*, not the field.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Naming `_balance` but never using the guard | Privacy theater — the field is still writable | Route writes through a validated method |\n| Public fields everywhere | Corrupt state slips in silently | Default to private, open deliberately |\n| Getter without validation | Read is fine, blind writes are the danger | Guard the setter, keep the getter pure |\n| Over-exposing with getters/setters | A \"class\" that is just a public bag | Only expose what callers genuinely need |\n\n### Quick Self-Test (answers at the bottom)\n\n1. `private` (Java) means — (a) public  (b) only the class itself  (c) only children  (d) everyone\n2. In Python, the private-by-convention prefix is — (a) `#`  (b) `$`  (c) `_` (underscore)  (d) no symbol needed\n3. The getter/setter pattern lets a setter — (a) validate before writing  (b) speed up code  (c) delete the object  (d) change the class name\n4. A checkpoint on every write to `balance` — (a) slows nothing and blocks garbage  (b) is impossible  (c) is only for games  (d) duplicates code\n5. The data-layer rule of thumb — (a) fields private, methods public  (b) fields public, methods private  (c) everything public  (d) everything protected\n\n**Answers:** 1→b, 2→c, 3→a, 4→a, 5→a.\n\n### Key Takeaway\n\nAccess modifiers put doors on data: public for everyone, protected for children, private for the class alone. Privacy is enforced in Java/C++ and agreed-by-underscore in Python. Lock the fields, open the methods, and put a validating checkpoint (a setter or guard method) on every write path.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Encapsulation",
  "slug": "encapsulation",
  "lessonSlug": "encapsulation-abstraction",
  "order": 1,
  "description": "Learn how bundling data with guard methods protects invariants — the balance can never go negative because every write path is a validated door.",
  "explanation": "## The Full Idea\n\n**Encapsulation** = bundle data + the methods that own it (we already do that) **AND** protect the data from unmediated outside writes (we just learned how). Two words: *packaging* and *protection*.\n\n```\n              OUTSIDE WORLD\n                  │\n        polite calls only (methods)\n                  ▼\n   ┌──────────────────────────────────┐\n   │  BankAccount                     │\n   │  ╔══════════════════════════════╗│\n   │  ║ _owner   (private)           ║│\n   │  ║ _balance (private)  ← locked ║│\n   │  ╚══════════════════════════════╝│\n   │  deposit() │ withdraw() │ get()  │ ← the guarded doors\n   └──────────────────────────────────┘\n```\n\nThe object is a castle: the fields are the treasure rooms (locked), the methods are the gates (open, but watched).\n\n### Why It Beats Bare Variables\n\n`acc.balance += 500` works today — but it bypasses the class's *opinions*:\n\n- A cheque can bounce → balance must never go **negative** (invariant)\n- An account can't deposit a **negative amount**\n- The owner's name, once set, rarely changes\n\nBare writes enforce **none** of this. Encapsulation funnels every change through methods that **check then change** — the invariant lives in one place, and every path through it is guarded.\n\n### The Guard Methods — Validating Invariants\n\n```python\ndef withdraw(self, amount):\n    if amount <= 0:                     # a deposit in disguise fails\n        return False\n    if amount > self._balance:          # insufficient funds — no negative balance\n        return False\n    self._balance -= amount\n    return True\n\ndef deposit(self, amount):\n    if amount <= 0: return False         # garbage in, rejected out\n    self._balance += amount\n    return True\n```\n\nBalance only ever changes through these gates → **the invariant \"balance ≥ 0\" is guaranteed by construction**, not by hope.\n\n### Encapsulation ≠ Just Getters/Setters\n\nA real encapsulated class exposes **behavior**, not handlers:\n\n- ✅ `acc.withdraw(200)` — a *verb*, guarded\n- ❌ `acc.setBalance(acc.getBalance() − 200)` — hand-rolling withdraw outside the class, re-introducing the bug it was designed to prevent\n\nThe class owns its state and its verbs; outsiders compose the verbs. That division of labour *is* encapsulation.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Getters/setters without guards | Locked fields, wide-open jail | Validate inside the write method |\n| Outsiders composing raw math | Invariants get violated through back doors | Export verbs (deposit/withdraw), not field maths |\n| Everything private, nothing usable | A class only its own maker can use | Balance privacy with genuinely-needed access |\n| Mixing data and logic | The class becomes the whole program | One concern per object |\n\n### Quick Self-Test (answers at the bottom)\n\n1. Encapsulation = — (a) packaging + completeness  (b) bundling data, methods and protection  (c) merging classes  (d) hiding methods too\n2. The point of the withdraw guard is — (a) slower code  (b) to keep the balance invariant (never negative)  (c) to confuse callers  (d) to print errors\n3. An entry that only ever changes through validated methods — (a) absolutely cannot violate its invariant  (b) breeds bugs  (c) is slower  (d) cannot be read\n4. `acc.withdraw(200)` is — (a) an unguarded hack  (b) behavior, exactly what encapsulation wants  (c) a getter  (d) a setName\n5. The gold standard for state writes — (a) every change validated on the surface  (b) every change rebuilt from outside  (c) directly writing the field from the UI  (d) making everything public\n\n**Answers:** 1→b, 2→b, 3→a, 4→b, 5→a.\n\n### Key Takeaway\n\nEncapsulation is protection + packaging: fields locked, behavior open. Funnel every write through a validating method so invariants (balance ≥ 0) hold **by construction** — and expose real verbs like `withdraw()`, never the field maths.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "Abstract Classes & Interfaces",
  "slug": "abstract-classes-interfaces",
  "lessonSlug": "encapsulation-abstraction",
  "order": 2,
  "description": "Learn the incomplete blueprint — abstract classes cannot be instantiated, abstract methods are promises every child MUST keep, and enforcement beats discipline.",
  "explanation": "## The Incomplete Blueprint\n\nA **concrete class** is fully ready — you can ask for objects. An **abstract class** is an incomplete blueprint: it sketches the shape, names the promises (abstract methods), but **cannot itself be instantiated**. You can only build objects of the classes that *complete* the blueprint.\n\n```python\nfrom abc import ABC, abstractmethod\n\nclass Shape(ABC):                  # an abstract class\n    def __init__(self, name):\n        self.name = name\n\n    @abstractmethod                # a promise, not an implementation\n    def area(self):\n        pass                       # no body — children MUST provide one\n```\n\n`Shape()` now fails: you cannot instantiate an incomplete blueprint. But `Circle()` and `Rectangle()` are instantiable only **if they implement `area()`**.\n\n### Abstract Method = A Promise\n\nAn **abstract method** has a signature and no body. It says:\n\n> \"Any child of mine MUST implement this method. If you forget, you cannot be instantiated either.\"\n\nEnforced at construction time, by the language. That is abstraction: the *interface* (what `area()` means) is fixed in the parent; the *implementation* (how each shape computes it) lives in the children.\n\n### Abstract Class vs Interface (Java world)\n\n| | Abstract class | Interface |\n|---|---|---|\n| Can hold concrete fields | Yes | No |\n| Can implement some methods | Yes | Modern: default methods yes, classic: no |\n| A class can | Extend ONE | Implement MANY |\n| Role | Partial blueprint | Pure contract |\n\nPython has no separate interface keyword — an abstract class with only abstract methods *is* your interface.\n\n### Why It Beats a Concrete Parent\n\nCompare with lesson 5's `Shape` (a real class whose `area()` returned 0):\n\n- **Concrete `Shape`**: a child can \"forget\" to override `area()` and silently return 0 — a bug wearing a smile.\n- **Abstract `Shape`**: forgetting is **impossible** — the child cannot exist until it implements `area()`.\n\nAbstraction moves the safety from *discipline* (student must remember) to *enforcement* (language refuses). That is the whole upgrade.\n\n### The Polymorphism Payoff\n\nAbstract types give polymorphism its safest form: code written against `Shape` is **guaranteed** every object under it knows `area()` — because the language checked at construction time. No missing-method crashes at the call site, ever.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Instantiating the abstract | Error — that's the design working | Build the children instead |\n| Forgetting an abstract method in a child | Child is abstract too → can't be instantiated | Implement every abstract method |\n| Making everything concrete | \"Forgetting\" the override returns the placeholder silently | Abstract the contract |\n| Over-abstracting | Inheritance chains nobody understands | Abstract only genuinely-shared contracts |\n\n### Quick Self-Test (answers at the bottom)\n\n1. An abstract class — (a) can be instantiated directly  (b) cannot be instantiated directly — incomplete blueprint  (c) cannot be inherited  (d) has no methods\n2. A concrete subclass of an abstract class must — (a) implement the abstract methods  (b) copy the parent  (c) delete the abstract  (d) return 0\n3. The danger of lesson 5's concrete `Shape.area()` (returning 0) — (a) children \"forget\" and silently get 0  (b) children crash  (c) the parent is too fast  (d) names get long\n4. Python abstract classes come from — (a) `from abc import ABC, abstractmethod`  (b) `import math`  (c) `import random`  (d) `import os`\n5. A child that forgets an abstract method — (a) still works  (b) becomes abstract itself (or errors on instantiation)  (c) deletes the parent  (d) duplicates the parent\n\n**Answers:** 1→b, 2→a, 3→a, 4→a, 5→b.\n\n### Key Takeaway\n\nAn abstract class is an incomplete blueprint: no instantiation, abstract methods as promises. Children that forget a promise cannot exist — the language enforces the contract instead of hoping. Abstract the interface, implement the details, and polymorphism becomes crash-proof by construction.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "String Basics & Methods",
  "slug": "string-basics-methods",
  "lessonSlug": "strings",
  "order": 0,
  "description": "Learn what strings are, why they are immutable (every \"change\" builds a new one), how to index and slice them, and the ten workhorse methods that search and transform text.",
  "explanation": "## What a String Is\n\nA **string** is a sequence of characters — letters, digits, spaces, punctuation — usually held in double or single quotes. \"Hello\" is a string; `42` is not.\n\n```python\nname = \"Aarav\"        # 5 characters: A a r a v\nempty = \"\"            # the empty string (length 0)\n```\n\n### The Golden Rule: Strings Are Immutable\n\n> **You cannot change a string.** Every \"edit\" actually builds a **brand-new** string and discards the old one.\n\n```python\nword = \"cat\"\nword[0] = \"r\"          # TypeError: 'str' object does not support item assignment\n\nword = \"r\" + word[1:]  # this works: builds a NEW string \"rat\", rebinds word\n```\n\nThis is the #1 exam trap. `word.upper()` doesn't \"uppercase word\" — it *returns* a new string; the original stays put:\n\n```python\ns = \"hello\"\ns.upper()          # returns \"HELLO\" — s is STILL \"hello\"\ns = s.upper()      # only now does s point at the new string\n```\n\n### Indexing and Slicing — Strings Are Sequences\n\nCharacters have positions starting at **0**; negative indices count from the end:\n\n```\n\"  A  a  r  a  v  \"\n    0  1  2  3  4\n   -5 -4 -3 -2 -1\n```\n\n```python\ns = \"Aarav\"\ns[0]      # 'A'\ns[-1]     # 'v'  (last character)\ns[1:4]    # 'ara' (START included, END EXCLUDED — the half-open slice)\ns[::-1]   # 'varaA' — the reversal trick\n```\n\n### The Workhorse Methods (memorise these 10)\n\n| Method | What it does | Example → Result |\n|---|---|---|\n| `len(s)` | Length (a function, not a method) | `len(\"Aarav\")` → 5 |\n| `s.upper()` / `s.lower()` | Case conversion (returns new string) | `\"Hello\".lower()` → `\"hello\"` |\n| `s.strip()` | Removes surrounding whitespace | `\"  hi  \".strip()` → `\"hi\"` |\n| `s.split(sep)` | Splits into a list | `\"a,b,c\".split(\",\")` → `[\"a\",\"b\",\"c\"]` |\n| `sep.join(list)` | Joins a list into one string | `\"-\".join([\"a\",\"b\"])` → `\"a-b\"` |\n| `s.replace(old, new)` | Substitutes text | `\"cat\".replace(\"c\",\"r\")` → `\"rat\"` |\n| `s.startswith(x)` | Boolean check | `\"hello\".startswith(\"he\")` → True |\n| `s.find(x)` | Index of first match (−1 if absent) | `\"banana\".find(\"na\")` → 2 |\n| `s.isdigit()` | All characters digits? | `\"123\".isdigit()` → True |\n| `s.count(x)` | How many non-overlapping matches | `\"banana\".count(\"na\")` → 2 |\n\n### The Join/Split Mirror\n\n`split` and `join` are exact opposites — the classic trap is using them the wrong way round:\n\n```python\nwords = [\"hello\", \"world\"]\njoined = \" \".join(words)     # \"hello world\" — join is called ON the separator\nback   = joined.split(\" \")   # [\"hello\", \"world\"] — split is called ON the text\n```\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Mutating a string | TypeError — strings are immutable | Rebuild and rebind (`s = s.upper()`) |\n| Half-open slicing | `s[0:3]` gives 3 chars, not 4 | Remember: end index is EXCLUDED |\n| Forgetting `.join`'s owner | `words.join(\" \")` — AttributeError | The separator joins: `\" \".join(words)` |\n| Case mismatch | `\"A\" == \"a\"` is False | Normalise first (`s.lower()`) |\n| Index out of range | `s[10]` on a 5-char string — IndexError | Check `len(s)` first |\n\n### Quick Self-Test (answers at the bottom)\n\n1. `s = \"abc\"; s[0] = \"x\"` — (a) works  (b) TypeError — strings are immutable  (c) makes a new string  (d) deletes s\n2. `s = \"Hello\"; s.lower()` leaves s as — (a) \"hello\"  (b) \"Hello\"  (c) \"HELLO\"  (d) \"\"\n3. `\"a,b,c\".split(\",\")` returns — (a) `[\"a,b,c\"]`  (b) `[\"a\",\"b\",\"c\"]`  (c) `\"abc\"`  (d) 3\n4. `\" \".join([\"x\",\"y\"])` returns — (a) `\"x y\"`  (b) `[\"x\",\"y\"]`  (c) `\"xy\"`  (d) error\n5. `\"hello\"[1:4]` is — (a) `\"ell\"`  (b) `\"hell\"`  (c) `\"ello\"`  (d) `\"e\"`\n\n**Answers:** 1→b, 2→b, 3→b, 4→a, 5→a.\n\n### Key Takeaway\n\nStrings are immutable sequences: you rebuild, never edit. Index and slice like a list (half-open slices!), and lean on the ten workhorse methods — especially the split/join mirror. When in doubt, `s = s.method()` rebinds to the result.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "String Formatting",
  "slug": "string-formatting",
  "lessonSlug": "strings",
  "order": 1,
  "description": "Learn how to build clean output with f-strings — braces interpolate any expression, and format specifiers like :.2f, :05d, and :, do the presentation work.",
  "explanation": "## Why Formatting Matters\n\nPrinting text with values jammed inside is a daily task — \"Hello, Aarav! You have 3 new messages.\" String formatting is the clean way to build such output, instead of ugly concatenation chains.\n\n### The Three Families\n\n**1. Concatenation (the naive way):**\n\n```python\nprint(\"Hello, \" + name + \"! You have \" + str(count) + \" new messages.\")\n```\n\nWorks, but unreadable, and every value needs `str()` conversion.\n\n**2. f-strings (Python 3.6+, the modern way):**\n\n```python\nprint(f\"Hello, {name}! You have {count} new messages.\")\n```\n\nBraces interpolate expressions directly — including method calls and math: `f\"{price * qty:.2f}\"`.\n\n**3. .format() (the older standard, still seen in exams):**\n\n```python\nprint(\"Hello, {}! You have {} new messages.\".format(name, count))\n```\n\n### Format Specifiers — the Quick Table\n\n| Specifier | Meaning | Example → Result |\n|---|---|---|\n| `{x}` | Interpolate the value | `f\"{5}\"` → `\"5\"` |\n| `{x:.2f}` | Two decimals | `f\"{3.14159:.2f}\"` → `\"3.14\"` |\n| `{x:>5}` | Right-align, width 5 | `f\"{42:>5}\"` → `\"   42\"` |\n| `{x:<5}` | Left-align, width 5 | `f\"{42:<5}\"` → `\"42   \"` |\n| `{x:05d}` | Zero-pad to 5 digits | `f\"{42:05d}\"` → `\"00042\"` |\n| `{x:,}` | Thousands separator | `f\"{1234567:,}\"` → `\"1,234,567\"` |\n\n### The Count-Vowels Connection\n\nFormatting shines when reporting results. A vowel counter is trivial to write — but producing *\"The string 'Aarav' contains 3 vowels.\"* cleanly is where formatting earns its keep.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Forgetting `str()` in concatenation | TypeError: can only concatenate str | f-strings handle it automatically |\n| `{x:0.2f}` vs `{x:.2f}` | Misplaced zero — wrong format | `.2f` = two decimals; `0` before `d` pads digits |\n| Empty braces confusion | `\"{} {}\".format(a, b)` — positional | Modern code prefers f-strings |\n| Formatting inside braces with junk | `f\"{count = }\"` includes the name | Keep braces for values only |\n\n### Quick Self-Test (answers at the bottom)\n\n1. `f\"{3.14159:.2f}\"` → — (a) 3.14  (b) 3.14159  (c) 3.15  (d) error\n2. `f\"{42:05d}\"` → — (a) 42  (b) 00042  (c) 0000042  (d) 42.00\n3. `f\"{1234567:,}\"` → — (a) 1234567  (b) 1,234,567  (c) 1234,567  (d) 12,345,67\n4. Which prints `\"Hi Aarav\"`? (a) `f\"Hi {name}\"` with name=\"Aarav\"  (b) `\"Hi\" + name`  (c) `\"Hi {name}\"`  (d) `f\"{Hi} {name}\"`\n5. `\"{} has {} vowels\".format(\"Aarav\", 3)` → — (a) Aarav has 3 vowels  (b) error  (c) {} has {} vowels  (d) 3 has Aarav vowels\n\n**Answers:** 1→a, 2→b, 3→b, 4→a, 5→a.\n\n### Key Takeaway\n\nBuild output with f-strings — braces interpolate any expression, and format specifiers (`:.2f`, `:05d`, `:`,`) do the presentation work. Skip concatenation chains and `str()` everywhere; the f-string is both cleaner and faster to read.",
  "image": "",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": ""
},
{
  "title": "List Operations",
  "slug": "list-operations",
  "lessonSlug": "lists-tuples-dictionaries",
  "order": 0,
  "description": "Learn the ordered mutable sequence — append, extend, pop, slicing, membership, the sort() vs sorted() trap, and list comprehensions that compress loops into one line.",
  "explanation": "## What a List Is\n\nA **list** is an ordered, mutable collection of items (any types, even mixed). Order matters, and you can change it after creation.\n\n```python\nscores = [90, 85, 92]        # a list of numbers\nmixed  = [1, \"two\", 3.0]     # mixed types are legal\nempty  = []                  # the empty list\n```\n\n### The Essential Operations (memorise these 12)\n\n| Operation | What it does | Example → Result |\n|---|---|---|\n| `lst[i]` | Index (0-based, negative from end) | `scores[1]` → 85 |\n| `lst[a:b]` | Slice (half-open, like strings) | `scores[0:2]` → [90, 85] |\n| `len(lst)` | Length | `len(scores)` → 3 |\n| `lst.append(x)` | Add at the end | `[1].append(2)` → [1, 2] |\n| `lst.extend(iter)` | Add many at the end | `[1].extend([2,3])` → [1, 2, 3] |\n| `lst.insert(i, x)` | Add at index i | `[1,3].insert(1,2)` → [1, 2, 3] |\n| `lst.pop()` / `lst.pop(i)` | Remove last / at index | `[1,2,3].pop()` → 3, list [1,2] |\n| `lst.remove(x)` | Remove first x by value | `[1,2,2].remove(2)` → [1,2] |\n| `x in lst` | Membership | `2 in [1,2,3]` → True |\n| `lst.sort()` | Sort IN PLACE (returns None) | `[3,1].sort()` → list [1,3] |\n| `sorted(lst)` | Return a NEW sorted list | `sorted([3,1])` → [1,3] |\n| `lst.copy()` | Shallow copy | `b = lst.copy()` — independent list |\n\n### The #1 Sorting Trap: `sort()` vs `sorted()`\n\n```python\nlst = [3, 1, 2]\nlst.sort()          # mutates lst; returns NONE\nresult = lst.sort() # result = None! ← the classic exam trap\n\nlst = [3, 1, 2]\nresult = sorted(lst)  # lst untouched; result = [1, 2, 3]\n```\n\n`sorted()` works on any iterable and returns a new list; `sort()` only exists on lists and changes the original. Mixing them up is a silent `None` bug.\n\n### The Duplicates Connection\n\nRemoving duplicates is a *set* idea applied to a *list* — the problem at the end of this lesson builds the classic pattern: a `seen` set + an output list.\n\n### List Comprehensions (the compact power move)\n\n```python\nsquares = [x * x for x in range(5)]      # [0, 1, 4, 9, 16]\nevens   = [x for x in range(10) if x % 2 == 0]\n```\n\n`[expr for item in iterable if condition]` — one line, no loop bookkeeping.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| `lst.sort()` returns None | Result assigned to None | Use `sorted()` for a value, `sort()` for in-place |\n| Mutating while iterating | Items skip or shift under you | Iterate a copy: `for x in lst.copy():` |\n| `lst.remove` removes only the first match | Duplicate stays behind | Loop, or build a new list |\n| Slicing instead of copying | `b = lst` shares the SAME list | `b = lst.copy()` or `b = lst[:]` |\n| Forgetting lists are mutable | `b = lst` then b changes lst too | Copy explicitly |\n\n### Key Takeaway\n\nLists are ordered, mutable sequences. Master the dozen operations — especially append/extend/pop, membership, and the sort()/sorted() split. Copy before aliasing, use comprehensions for one-liners, and never assign `lst.sort()` to anything."
},
{
  "title": "Tuples",
  "slug": "tuples",
  "lessonSlug": "lists-tuples-dictionaries",
  "order": 1,
  "description": "Learn the immutable sibling of the list — why fixed data is safer, the comma that makes a one-item tuple, and packing/unpacking superpowers like the swap.",
  "explanation": "## What a Tuple Is\n\nA **tuple** is an ordered, IMMUTABLE sequence — the list's stricter sibling. Once created, its items cannot be added, removed, or changed.\n\n```python\npoint = (3, 4)           # parentheses, not brackets\nsingle = (5,)            # note the comma — (5) is just the number 5!\n```\n\n### Tuple vs List — The Table\n\n| | List | Tuple |\n|---|---|---|\n| Syntax | `[1, 2]` | `(1, 2)` |\n| Mutable? | Yes | **No** |\n| Dictionary key? | Never | Yes |\n| Use for | Growing collections | Fixed records, coordinates, return values |\n| Speed / memory | Slightly heavier | Lighter, hashable |\n\n### Why Immutable Is a Feature\n\n- **Safe to share** — a tuple can't be corrupted by accident (nobody can `t[0] = x`)\n- **Hashable** — tuples can be dictionary keys; lists cannot\n- **Honest** — `(width, height)` says \"this is a fixed shape\", not \"feel free to grow me\"\n\n### The Packing / Unpacking Superpower\n\n```python\npoint = (3, 4)\nx, y = point          # unpacking: x = 3, y = 4\na, b = b, a           # the famous swap — it's tuple packing/unpacking\n```\n\nUnpacking is everywhere: `for name, score in pairs:` works because each item is a 2-tuple.\n\n### The One-Element Gotcha\n\n`(5)` is just the integer 5 — parentheses alone don't make a tuple. The **comma** does: `(5,)`. Forgetting the comma is the classic silent bug (and the classic interview smirk).\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| `t[0] = 5` | TypeError — tuples are immutable | Rebuild: `(5,) + t[1:]` |\n| `(5)` instead of `(5,)` | A number, not a tuple | Always comma for one item |\n| Using a list as a dict key | TypeError: unhashable | Use a tuple instead |\n| Trying `.append()` on a tuple | AttributeError | Convert or use a list |\n\n### Key Takeaway\n\nTuples are immutable sequences: same indexing and slicing as lists, but no mutation. The comma makes a 1-tuple, tuples (not lists) can be dict keys, and unpacking is the superpower for clean multiple-return and swap code."
},
{
  "title": "Dictionaries",
  "slug": "dictionaries",
  "lessonSlug": "lists-tuples-dictionaries",
  "order": 2,
  "description": "Learn O(1) key-value storage — safe lookups with get(), the three iteration views, the immutable-key rule, and the merge tricks.",
  "explanation": "## What a Dictionary Is\n\nA **dictionary** stores key→value pairs with **O(1) lookups** — think of a phone book (name → number), not an ordered list.\n\n```python\nstudent = {\n    \"name\": \"Aarav\",\n    \"age\": 21,\n    \"subjects\": [\"DSA\", \"DBMS\"]     # values can be any type\n}\n```\n\n### The Essential Operations (memorise these 8)\n\n| Operation | What it does | Example → Result |\n|---|---|---|\n| `d[key]` | Lookup (KeyError if missing) | `student[\"name\"]` → \"Aarav\" |\n| `d.get(key, default)` | Safe lookup | `d.get(\"x\", 0)` → 0 if absent |\n| `d[key] = value` | Insert or update | `d[\"age\"] = 22` |\n| `key in d` | Membership (O(1)) | `\"age\" in d` → True |\n| `d.keys()` / `d.values()` / `d.items()` | The three views | `d.items()` → pairs |\n| `d.update(other)` | Merge — other wins | see the problem below |\n| `d.pop(key)` | Remove and return | `d.pop(\"age\")` → 21 |\n| `len(d)` | Number of keys | `len(student)` → 3 |\n\n### The Two Lookup Styles — and the Trap\n\n```python\nstudent[\"absent\"]        # KeyError — crashes!\nstudent.get(\"absent\")    # None — graceful\nstudent.get(\"absent\", 0) # 0 — graceful with a default\n```\n\n`d[key]` is for keys you *know* exist; `.get()` is for keys that *might* not. The interview question \"safe lookup vs crash\" lives exactly here.\n\n### Iterating — the Three Views\n\n```python\nfor key in d:                   # keys\nfor key, value in d.items():    # BOTH — the common one\nfor value in d.values():        # values\n```\n\n### Merge Tricks (the second problem's whole point)\n\n```python\nd1 = {\"a\": 1, \"b\": 2}\nd2 = {\"b\": 3, \"c\": 4}\n\nmerged = {**d1, **d2}      # unpacking — d2 wins on conflicts\nmerged = d1 | d2           # Python 3.9+ — d2 wins\nd1.update(d2)              # mutates d1 — d2 wins\n```\n\nAll three produce `{\"a\": 1, \"b\": 3, \"c\": 4}` — the right-side dict wins the tie.\n\n### The Immutable-Key Rule\n\nKeys must be **immutable** (strings, numbers, tuples) — never lists or dicts. The rule exists because the dictionary *hashes* the key; a key that can change mid-hash breaks the lookup.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| `d[key]` on a missing key | KeyError crash | `d.get(key, default)` |\n| Mutable key | TypeError: unhashable type | Use a string or tuple |\n| Forgetting which dict wins on merge | Wrong duplicate handling | Right side (d2) wins |\n| `d.keys()` isn't a list | Can't index it directly | `list(d.keys())` if you need indexing |\n| `{}` vs `set()` | Empty dict vs empty set confusion | `{}` is a dict; `set()` is a set |\n\n### Key Takeaway\n\nDictionaries are O(1) key→value stores. Use `.get()` for uncertain lookups, iterate with `.items()`, keep keys immutable, and merge with `{**a, **b}` / `a | b` / `update` — right side wins the tie."
},
{
  "title": "Set Basics",
  "slug": "set-basics",
  "lessonSlug": "sets",
  "order": 0,
  "description": "Learn the unordered, unique collection — add, discard vs remove, the {} vs set() trap, and why membership is O(1).",
  "explanation": "## What a Set Is\n\nA **set** is an unordered collection of **unique** items. Three properties define it:\n\n1. **Unique** — duplicates are silently dropped\n2. **Unordered** — no index, no positions, no slicing\n3. **Fast** — membership checks are O(1)\n\n```python\nfruits = {\"apple\", \"banana\", \"apple\"}   # {apple, banana} — the second apple vanished\nempty  = set()                          # the ONLY way to make an empty set!\n```\n\n### The `{}` vs `set()` Trap\n\n```python\na = {}          # an empty DICTIONARY, not a set!\nb = set()       # the empty set\n```\n\nCurly braces with `key: value` make a dict; curly braces with plain items make a set. An empty pair of braces is always a dict. This is a favourite exam trick.\n\n### The Essential Operations (memorise these 8)\n\n| Operation | What it does | Example → Result |\n|---|---|---|\n| `x in s` | Membership (O(1)!) | `2 in {1,2,3}` → True |\n| `s.add(x)` | Add one item | `{1}.add(2)` → {1, 2} |\n| `s.update(iter)` | Add many | `{1}.update([2,3])` → {1, 2, 3} |\n| `s.remove(x)` | Remove (KeyError if missing!) | `{1,2}.remove(1)` → {2} |\n| `s.discard(x)` | Remove (silent if missing) | `{1}.discard(9)` → {1} |\n| `len(s)` | Count of unique items | `len({1,2,2})` → 2 |\n| `s.pop()` | Remove and return ANY item | `{5,6}.pop()` → 5 or 6 |\n| `s.copy()` | Shallow copy | `b = s.copy()` |\n\n### The remove() vs discard() Distinction\n\n```python\ns = {1, 2, 3}\ns.remove(9)      # KeyError! 9 isn't there\ns.discard(9)     # silent — nothing happens\n```\n\n`remove()` insists the item exists; `discard()` tolerates absence. If you're not sure the item is present, `discard()` is the safe door.\n\n### What CANNOT Go In a Set\n\nSet items must be **hashable** (immutable): strings, numbers, tuples are fine; lists and dicts are not.\n\n```python\ns = {[1, 2]}     # TypeError: unhashable type: 'list'\ns = {(1, 2)}     # fine — a tuple is hashable\n```\n\n### The Duplicates Connection (you met this in the Lists lesson)\n\nThe Remove Duplicates problem used a `seen` set precisely because set membership is O(1). Converting a list to a set is the instant-deduplicate move — just remember it destroys order:\n\n```python\nlist(set([3, 1, 3, 2]))   # order NOT preserved\n```\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| `{}` for an empty set | You get a dict | `set()` |\n| `s.remove(x)` on a missing x | KeyError crash | Use `discard(x)` or check `x in s` |\n| Expecting an index | TypeError: 'set' object is not subscriptable | Sets are unordered — no `s[0]` |\n| Adding a list | TypeError: unhashable | Convert to a tuple first |\n| Assuming order | Set iteration order is arbitrary | Use a list if order matters |\n\n### Key Takeaway\n\nSets are unordered, unique, and O(1)-fast. Make an empty set with `set()` (never `{}`), remove with `discard()` when unsure, keep items hashable, and reach for a set the moment you need uniqueness or rapid membership."
},
{
  "title": "Set Operations",
  "slug": "set-operations",
  "lessonSlug": "sets",
  "order": 1,
  "description": "Learn the big five — union |, intersection &, difference -, symmetric difference ^, and subset <= — plus the mutation-safe rules for each.",
  "explanation": "## The Big Five — the Set Operators\n\n| Operation | Operator | What it returns | Example → Result |\n|---|---|---|---|\n| **Union** | `a | b` | Everything from both | `{1,2} | {2,3}` → {1, 2, 3} |\n| **Intersection** | `a & b` | Only the shared items | `{1,2} & {2,3}` → {2} |\n| **Difference** | `a - b` | In a but NOT in b | `{1,2} - {2,3}` → {1} |\n| **Symmetric difference** | `a ^ b` | In either, but NOT both | `{1,2} ^ {2,3}` → {1, 3} |\n| **Subset / superset** | `a <= b`, `a >= b` | True/False | `{1} <= {1,2}` → True |\n\nEach also has a method spelling (`a.union(b)`, `a.intersection(b)`, `a.difference(b)`, `a.symmetric_difference(b)`, `a.issubset(b)`) — same results, different handwriting.\n\n### Union — the Merge\n\n```python\na = {1, 2, 3}\nb = {3, 4, 5}\na | b          # {1, 2, 3, 4, 5}\n```\n\nEvery item from both sets, duplicates (like 3) kept once. The natural \"combine two groups\" move.\n\n### Intersection — the Overlap\n\n```python\na = {1, 2, 3}\nb = {3, 4, 5}\na & b          # {3}\n```\n\nItems in BOTH sets. The interview classic: \"who appears in both lists?\" — the one-line answer is `set(x) & set(y)`.\n\n### Difference and Symmetric Difference\n\n```python\na = {1, 2, 3}\nb = {3, 4, 5}\na - b          # {1, 2}   — in a, not in b\nb - a          # {4, 5}   — in b, not in a\na ^ b          # {1, 2, 4, 5} — in either, not both\n```\n\n`-` is directional (order matters!); `^` is symmetric (order doesn't).\n\n### The in-place Update Family\n\nLike `sort()` vs `sorted()`, the operators build NEW sets; the `_update` methods mutate:\n\n| Mutating form | Equivalent non-mutating |\n|---|---|\n| `a.update(b)` | `a | b` |\n| `a.intersection_update(b)` | `a & b` |\n| `a.difference_update(b)` | `a - b` |\n| `a.symmetric_difference_update(b)` | `a ^ b` |\n\n### Subset / Superset — the Relationship Tests\n\n```python\n{1, 2} <= {1, 2, 3}     # True — {1,2} is a subset of {1,2,3}\n{1, 2, 3} >= {1, 2}     # True — {1,2,3} is a superset of {1,2}\n{1, 2} <= {1, 2}        # True — every set is a subset of itself\n{1, 2} < {1, 2}         # False — strict subset needs a missing item\n```\n\n### The Collection Family Portrait (choose the right container)\n\n| Container | Ordered? | Unique? | Mutable? | Perfect for |\n|---|---|---|---|---|\n| **List** | Yes | No | Yes | Ordered, growing data |\n| **Tuple** | Yes | No | No | Fixed records, dict keys |\n| **Dict** | Insertion | Keys unique | Yes | key → value lookups |\n| **Set** | No | Yes | Yes | Uniqueness, membership, group maths |\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| `a - b` vs `b - a` | Results differ — it's directional | Think \"in the left one, not the right\" |\n| Using `&` on lists | TypeError — only sets support these | Convert first: `set(a) & set(b)` |\n| Forgetting `^` | Symmetric difference vs plain difference | `^` = in either but NOT both |\n| Expecting union to keep duplicates | Sets never keep duplicates | It's a set — uniqueness is the point |\n| Mutating when you meant to copy | `a.update(b)` changes a forever | Use `a | b` for a fresh result |\n\n### Key Takeaway\n\nThe five operations — union `|`, intersection `&`, difference `-`, symmetric difference `^`, and subset `<=` — turn sets into a one-line maths engine. Use the non-mutating operators for fresh results, the `_update` family when mutation is intended, and remember sets only work on sets (convert lists first)."
}];

/* ================================================================
 * Programming Problems
 * ================================================================ */

const programmingProblems = [
{
  "title": "Swap Two Variables",
  "slug": "swap-two-variables",
  "lessonSlug": "variables-data-types-operators",
  "subtopicSlug": "variables-data-types",
  "difficulty": "easy",
  "topics": [
    "Variables",
    "Basics"
  ],
  "companies": [
    "Google",
    "Microsoft",
    "Amazon"
  ],
  "problemStatement": "You are given two integer variables a and b. Swap their values so that a ends up holding b's original value and b ends up holding a's original value.\n\nYou may use a single temporary variable, but you must NOT use any array, list, or other data structure.\n\nFor example, if a = 5 and b = 10, after swapping a must be 10 and b must be 5.",
  "examples": [
    {
      "input": "a = 5, b = 10",
      "output": "a = 10, b = 5",
      "explanation": "The values exchange places: a takes 10, b takes 5."
    },
    {
      "input": "a = -3, b = 7",
      "output": "a = 7, b = -3",
      "explanation": "Negative values swap exactly the same way as positive ones."
    },
    {
      "input": "a = 0, b = 0",
      "output": "a = 0, b = 0",
      "explanation": "Equal values — after swapping, both are still 0."
    },
    {
      "input": "a = 100, b = 1",
      "output": "a = 1, b = 100",
      "explanation": "Order fully reverses regardless of which value is bigger."
    }
  ],
  "constraints": [
    "a and b are integers.",
    "Only assignment and arithmetic operations are allowed.",
    "No arrays, lists, or other data structures may be used."
  ],
  "approach": "## Understanding the Problem\n\nWe need two variables to exchange their values. The naive mistake is writing:\n\n```\na = b\nb = a\n```\n\nThat does NOT swap — the first line overwrites a, so by the time the second line runs, a no longer holds its original value. Both end up holding b's value. We need to save the original value BEFORE overwriting it.\n\n## Approach 1: Temporary Variable (the reliable classic)\n\n1. Copy a into a temp variable: `temp = a`\n2. Overwrite a with b: `a = b`\n3. Put the saved original back into b: `b = temp`\n\n```\nStart:   a = 5   b = 10\nStep 1:  temp = 5\nStep 2:  a = 10\nStep 3:  b = 5\nDone:    a = 10  b = 5  ✅\n```\n\nThis works in every language and is impossible to get wrong. It uses exactly one extra variable — which the problem allows.\n\n## Approach 2: Parallel Assignment / Destructuring\n\nMany languages let you swap in one line — the right-hand side is evaluated first, then both assignments happen together:\n\n```python\na, b = b, a\n```\n\n```javascript\n[a, b] = [b, a];\n```\n\nBecause the right side is computed fully before any assignment, the original values are never lost. Clean and readable — but requires language support.\n\n## Approach 3: Arithmetic Trick (no temp at all)\n\n```\na = a + b\nb = a - b\na = a - b\n```\n\n```\nStart:  a=5 b=10\nStep 1: a=15 (5+10)\nStep 2: b=5  (15-10) -> b now holds old a ✅\nStep 3: a=10 (15-5)  -> a now holds old b ✅\n```\n\nWorks, but only for numbers, and can overflow in languages with fixed-size integers. It is a fun trick — not something you need in production code.\n\n## Complexity Analysis\n\n- **Time Complexity: O(1)** — a fixed number of operations regardless of the values.\n- **Space Complexity: O(1)** — at most one temporary variable.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "# Approach 1: temporary variable (works everywhere)\ndef swap_temp(a, b):\n    temp = a\n    a = b\n    b = temp\n    return a, b\n\n# Approach 2: parallel assignment (Pythonic)\ndef swap_pythonic(a, b):\n    a, b = b, a\n    return a, b\n\nprint(swap_pythonic(5, 10))  # (10, 5)"
    },
    {
      "language": "javascript",
      "code": "// Approach 1: temporary variable\nfunction swapTemp(a, b) {\n    let temp = a;\n    a = b;\n    b = temp;\n    return [a, b];\n}\n\n// Approach 2: destructuring assignment\nfunction swapDestructure(a, b) {\n    [a, b] = [b, a];\n    return [a, b];\n}\n\nconsole.log(swapDestructure(5, 10));  // [10, 5]"
    },
    {
      "language": "java",
      "code": "// Java primitives are passed by value, so the swap\n// must return the new pair (or use a 2-element array).\npublic static int[] swap(int a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n    return new int[] { a, b };  // {10, 5}\n}"
    }
  ],
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Convert Between Data Types",
  "slug": "convert-between-data-types",
  "lessonSlug": "variables-data-types-operators",
  "subtopicSlug": "type-conversion",
  "difficulty": "easy",
  "topics": [
    "Type Conversion",
    "Basics"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Meta"
  ],
  "problemStatement": "Write a function that safely converts a string of digits into an integer.\n\nThe input string may contain:\n- Optional leading or trailing spaces\n- An optional sign (+ or -)\n- Digits\n\nIf the string represents a valid integer, return it as an integer. If it is NOT a valid integer (e.g. contains letters, decimals, or is empty), return 0.\n\nFor example, \"42\" returns 42, \"  -7  \" returns -7, and \"abc\" returns 0.",
  "examples": [
    {
      "input": "\"42\"",
      "output": "42",
      "explanation": "Plain digits convert directly to the integer 42."
    },
    {
      "input": "\"  -7  \"",
      "output": "-7",
      "explanation": "Spaces are ignored and the negative sign is respected."
    },
    {
      "input": "\"+13\"",
      "output": "13",
      "explanation": "An explicit plus sign is allowed and ignored."
    },
    {
      "input": "\"3.14\"",
      "output": "0",
      "explanation": "A decimal is not an integer — return 0, not a crash."
    },
    {
      "input": "\"abc\"",
      "output": "0",
      "explanation": "Non-digit characters make the conversion invalid — return 0."
    }
  ],
  "constraints": [
    "The string length is between 0 and 10,000 characters.",
    "The string contains only spaces, an optional sign, and digits (for valid inputs).",
    "If conversion fails, return 0 instead of throwing an error."
  ],
  "approach": "## Understanding the Problem\n\nWe must turn text that represents a number into an actual integer, and fail gracefully when the text is not a valid integer. This is a daily real-world task: forms, files, and APIs deliver numbers as strings.\n\n## Why \"Fail Gracefully\" Matters\n\nA naive call to the built-in conversion function throws an error (or returns a special NaN value in JavaScript) when the input is invalid. The problem wants 0 in those cases so the program never crashes.\n\n## Approach 1: Built-in Conversion + Safe Guard\n\n1. Strip leading/trailing whitespace from the string.\n2. Try to convert with the language's integer parser.\n3. If it throws (or reports \"not a number\"), return 0.\n4. Otherwise return the parsed integer.\n\n```python\ndef to_int(s):\n    try:\n        return int(s.strip())   # int() already handles the sign\n    except ValueError:\n        return 0\n```\n\nNote: `int(\"3.14\")` raises ValueError (a decimal is not an integer), so it correctly falls back to 0.\n\n## Approach 2: Manual Parsing (no built-in)\n\nSometimes the problem forbids built-in converters. Build the number yourself:\n\n1. Trim spaces.\n2. If the string is empty, return 0.\n3. Check the first character for + or - and remember the sign.\n4. Walk the remaining characters: if any is not a digit (0-9), return 0.\n5. Accumulate: `result = result * 10 + digit` for each digit.\n6. Apply the sign at the end.\n\n```\n\"  -7  \" -> trim -> \"-7\" -> sign = -1 -> digit 7\n         -> result = 0*10 + 7 = 7 -> return -1 * 7 = -7 ✅\n```\n\nThis teaches you what the built-in function actually does under the hood.\n\n## Complexity Analysis\n\n- **Time Complexity: O(n)** — each character is examined once.\n- **Space Complexity: O(1)** — only a few variables, no extra storage.\n\n## Edge Cases to Handle\n\n- Empty string `\"\"` → 0\n- Only spaces `\"   \"` → 0\n- Sign with no digits `\"-\"` → 0\n- Decimals `\"3.14\"` → 0\n- Letters `\"12abc\"` → 0\n- Very long strings → still handled in O(n)",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def convert_to_int(s):\n    s = s.strip()\n    # Empty or sign-only input is invalid\n    if not s or s in (\"+\", \"-\"):\n        return 0\n    # Manual parse: digits only\n    start = 1 if s[0] in \"+-\" else 0\n    result = 0\n    for ch in s[start:]:\n        if not ch.isdigit():\n            return 0\n        result = result * 10 + int(ch)\n    return -result if s[0] == \"-\" else result\n\nprint(convert_to_int(\"42\"))     # 42\nprint(convert_to_int(\"  -7  \")) # -7\nprint(convert_to_int(\"abc\"))    # 0"
    },
    {
      "language": "javascript",
      "code": "function convertToInt(s) {\n    const trimmed = s.trim();\n    // Empty or sign-only input is invalid\n    if (!trimmed || trimmed === \"+\" || trimmed === \"-\") return 0;\n    // Manual parse: digits only\n    let start = (trimmed[0] === \"+\" || trimmed[0] === \"-\") ? 1 : 0;\n    let result = 0;\n    for (let i = start; i < trimmed.length; i++) {\n        const ch = trimmed[i];\n        if (ch < \"0\" || ch > \"9\") return 0;\n        result = result * 10 + (ch.charCodeAt(0) - 48);\n    }\n    return trimmed[0] === \"-\" ? -result : result;\n}\n\nconsole.log(convertToInt(\"42\"));      // 42\nconsole.log(convertToInt(\"  -7  \"));  // -7\nconsole.log(convertToInt(\"abc\"));     // 0"
    },
    {
      "language": "java",
      "code": "public static int convertToInt(String s) {\n    String t = s.trim();\n    // Empty or sign-only input is invalid\n    if (t.isEmpty() || t.equals(\"+\") || t.equals(\"-\")) return 0;\n    int start = (t.charAt(0) == '+' || t.charAt(0) == '-') ? 1 : 0;\n    int result = 0;\n    for (int i = start; i < t.length(); i++) {\n        char ch = t.charAt(i);\n        if (ch < '0' || ch > '9') return 0;   // invalid character\n        result = result * 10 + (ch - '0');\n    }\n    return (t.charAt(0) == '-') ? -result : result;\n}"
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
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
},
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
},
{
  "title": "Function with Default Arguments",
  "slug": "function-with-default-arguments",
  "lessonSlug": "functions-scope",
  "subtopicSlug": "parameters-return-values",
  "difficulty": "easy",
  "topics": [
    "Functions",
    "Parameters",
    "Basics"
  ],
  "companies": [
    "Google",
    "Microsoft",
    "Amazon"
  ],
  "problemStatement": "Write a function calculate_area(length, width) that returns the area of a rectangle. The width argument is OPTIONAL — when it is not passed, the shape is treated as a square, so the function must use the length as the width.\n\n- calculate_area(5, 3) must return 15 (5 × 3)\n- calculate_area(4) must return 16 (4 × 4, a square)",
  "examples": [
    {
      "input": "calculate_area(5, 3)",
      "output": "15",
      "explanation": "5 × 3 = 15 — both dimensions given."
    },
    {
      "input": "calculate_area(4)",
      "output": "16",
      "explanation": "width omitted → square: 4 × 4 = 16."
    },
    {
      "input": "calculate_area(7, 2)",
      "output": "14",
      "explanation": "7 × 2 = 14 — both dimensions given."
    },
    {
      "input": "calculate_area(10)",
      "output": "100",
      "explanation": "width omitted → square: 10 × 10 = 100."
    }
  ],
  "constraints": [
    "length and width are positive numbers (int or float, no negatives).",
    "width may be omitted entirely — the square rule applies then.",
    "No loops or data structures — a single formula."
  ],
  "approach": "## Understanding the Problem\n\nThe twist is the *optional* dimension. When `width` is supplied, ordinary multiplication. When it's missing, the caller expects the square rule — area = length × length. The classic mistake is hard-coding a default like `width = 0`, which would turn `calculate_area(4)` into 4 × 0 = 0. The correct fallback must copy the length itself.\n\n## The None-Guard pattern\n\nSet the default to `None` (a value that means \"nothing was passed\"), then branch:\n\n```\n1. If width is None  →  width = length   (the square rule)\n2. Return length × width\n```\n\n```\ncalculate_area(5, 3):\n    width = 3 (given)  →  return 5 × 3 = 15 ✅\n\ncalculate_area(4):\n    width = None       →  width = 4 (square rule)\n                       →  return 4 × 4 = 16 ✅\n```\n\n## Why default None instead of 0?\n\n`0` is a real number — `calculate_area(4)` would silently answer 0 and you would never notice the caller forgot the width. `None` is a sentinel meaning \"absent\", so it can be told apart from any legal value.\n\n## The default-position rule\n\nIn any language, default parameters must come after required ones (`width` after `length`) — putting the fallback first is a syntax error.\n\n## Complexity Analysis\n\n- **Time: O(1)** — one comparison and one multiplication.\n- **Space: O(1)** — a couple of numbers, nothing stored.\n\n## Edge Cases\n\n- `calculate_area(0, 5)` → 0 (valid: a zero area)\n- `calculate_area(2.5)` → 6.25 (floats work too)\n- Never use a mutable default like `[]` here — for a value function it's unnecessary and dangerous.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def calculate_area(length, width=None):\n    if width is None:        # the square rule: no width given\n        width = length\n    return length * width\n\nprint(calculate_area(5, 3))   # 15\nprint(calculate_area(4))      # 16"
    },
    {
      "language": "javascript",
      "code": "function calculateArea(length, width) {\n    if (width === undefined) width = length;  // square rule\n    return length * width;\n}\n\nconsole.log(calculateArea(5, 3));   // 15\nconsole.log(calculateArea(4));      // 16"
    },
    {
      "language": "java",
      "code": "public static double calculateArea(double length, Double width) {\n    if (width == null) width = length;   // square rule\n    return length * width;\n}\n// calculateArea(5, 3) == 15.0\n// calculateArea(4, null) == 16.0"
    }
  ],
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Factorial (Iterative)",
  "slug": "factorial-iterative",
  "lessonSlug": "functions-scope",
  "subtopicSlug": "variable-scope",
  "difficulty": "easy",
  "topics": [
    "Functions",
    "Loops",
    "Math"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft"
  ],
  "problemStatement": "Write a function factorial(n) that returns n! — the product of all integers from 1 to n. Use a LOOP (NOT recursion). By convention, 0! = 1.\n\n- factorial(5) = 1 × 2 × 3 × 4 × 5 = 120\n- factorial(0) = 1 (by definition)",
  "examples": [
    {
      "input": "n = 5",
      "output": "120",
      "explanation": "1 × 2 × 3 × 4 × 5 = 120."
    },
    {
      "input": "n = 0",
      "output": "1",
      "explanation": "0! is defined as 1 by convention."
    },
    {
      "input": "n = 1",
      "output": "1",
      "explanation": "1! = 1."
    },
    {
      "input": "n = 4",
      "output": "24",
      "explanation": "1 × 2 × 3 × 4 = 24."
    }
  ],
  "constraints": [
    "n is a non-negative integer up to 20.",
    "Must use iteration (a loop), not recursion.",
    "No extra data structures needed."
  ],
  "approach": "## Understanding the Problem\n\nFactorial multiplies a *running total*: start at 1, then multiply by 2, then 3, and so on up to n. Each multiplication is result = result × i.\n\n## The Loop Idea\n\n```\n1. result = 1\n2. For i = 2 to n:   result = result × i\n3. Return result\n```\n\nWhy start at 2? Multiplying by 1 changes nothing — starting at 2 avoids one wasted step. For n < 2, the loop body never runs and the initial 1 is returned: that single rule handles both `factorial(0) = 1` and `factorial(1) = 1` for free.\n\n## Step-by-Step Trace on n = 5\n\n```\nresult = 1\ni = 2 → result = 1 × 2 = 2\ni = 3 → result = 2 × 3 = 6\ni = 4 → result = 6 × 4 = 24\ni = 5 → result = 24 × 5 = 120  → stop\n\nAnswer: 120 ✅\n```\n\n## Scope in Action\n\n`n` (the parameter) and `result` are **local** to the function — a global `n` elsewhere is untouched. That is exactly the scope lesson: the parameter shadows any outer name for the duration of the call.\n\n## Why Not Recursion for This One?\n\nRecursion is elegant but uses the call stack — for n = 20 the iterative loop is simpler, faster, and cannot overflow the stack.\n\n## Complexity Analysis\n\n- **Time: O(n)** — the loop runs n − 1 times.\n- **Space: O(1)** — only result and the loop counter.\n\n## Overflow Note\n\nFactorials explode: 20! = 2,432,902,008,176,640,000 already exceeds a 32-bit int. That is why the constraint caps n at 20 — beyond it you need a bigger numeric type.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def factorial(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\nprint(factorial(5))   # 120\nprint(factorial(0))   # 1"
    },
    {
      "language": "javascript",
      "code": "function factorial(n) {\n    let result = 1;\n    for (let i = 2; i <= n; i++) {\n        result *= i;\n    }\n    return result;\n}\n\nconsole.log(factorial(5));   // 120\nconsole.log(factorial(0));   // 1"
    },
    {
      "language": "java",
      "code": "public static long factorial(int n) {\n    long result = 1;\n    for (int i = 2; i <= n; i++) {\n        result *= i;      // long avoids overflow up to ~20!\n    }\n    return result;\n}\n// factorial(5) == 120\n// factorial(0) == 1"
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
}
,
{
  "title": "Build a Simple Class (Bank Account)",
  "slug": "bank-account-class",
  "lessonSlug": "classes-objects",
  "subtopicSlug": "constructors-instance-variables",
  "difficulty": "medium",
  "topics": [
    "Classes",
    "OOP"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft"
  ],
  "problemStatement": "Create a BankAccount class with:\n\n1. A constructor that takes an owner (string) and an optional balance (number, defaults to 0), storing both as instance variables.\n2. A deposit(amount) method that adds the amount to the balance.\n3. A withdraw(amount) method that returns True and reduces the balance ONLY when the amount is at most the current balance; otherwise it returns False and leaves the balance unchanged — the balance must NEVER go negative.\n4. A get_balance() method that returns the current balance.\n\nFor example, after BankAccount(\"Aarav\", 1000), deposit(500), withdraw(200), withdraw(5000) — the balance must be 1300.",
  "examples": [
    {
      "input": "acc = BankAccount(\"Aarav\", 1000); acc.deposit(500)",
      "output": "balance = 1500",
      "explanation": "deposit adds: 1000 + 500 = 1500."
    },
    {
      "input": "acc.withdraw(200)",
      "output": "True, balance = 1300",
      "explanation": "200 ≤ 1500 → guard passes, balance drops to 1300, True returned."
    },
    {
      "input": "acc.withdraw(5000)",
      "output": "False, balance = 1300",
      "explanation": "5000 > 1300 → guard fails, balance unchanged, False returned."
    },
    {
      "input": "acc2 = BankAccount(\"Meera\"); acc2.get_balance()",
      "output": "0",
      "explanation": "Balance defaults to 0 when not passed."
    }
  ],
  "constraints": [
    "owner is a non-empty string.",
    "amounts are positive numbers (int or float).",
    "The balance must NEVER become negative — withdraw must fail safely.",
    "No external libraries — plain class, constructor, and methods."
  ],
  "approach": "## Understanding the Problem\n\nWe must build our first real class: a blueprint for bank accounts. Four pieces — a constructor that stores per-object state, and three methods that act on that state through `self`. The trap hidden inside is the **withdraw guard**: the balance must never go negative.\n\n## The Constructor Stores Each Object's Private State\n\n```\ndef __init__(self, owner, balance=0):\n    self.owner = owner\n    self.balance = balance\n```\n\nThe default `balance=0` means `BankAccount(\"Meera\")` starts at zero while `BankAccount(\"Aarav\", 5000)` starts with a real balance — the same default-parameter rule from the Functions lesson, now inside a constructor.\n\n## deposit — Mutate Through self\n\n```\ndef deposit(self, amount):\n    self.balance += amount\n```\n\n`self.balance` is *this object's* balance. `acc1.deposit(500)` touches only `acc1` — the sugar from the Methods section at work.\n\n## withdraw — The Guard Comes First\n\n```\ndef withdraw(self, amount):\n    if amount <= self.balance:\n        self.balance -= amount\n        return True\n    return False\n```\n\nCheck first, subtract second, report the truth. No guard → `withdraw(999999)` silently pushes the balance negative, which the problem forbids.\n\n## get_balance — Report, Don't Touch\n\n```\ndef get_balance(self):\n    return self.balance\n```\n\n## Full Trace\n\n```\nacc = BankAccount(\"Aarav\", 1000)\nacc.deposit(500)      →  balance = 1000 + 500 = 1500\nacc.withdraw(200)     →  200 ≤ 1500? yes → balance = 1300, return True\nacc.withdraw(5000)    →  5000 ≤ 1300? no  → balance stays 1300, return False\nacc.get_balance()     →  1300\n```\n\n## Complexity Analysis\n\n- **Time: O(1)** per method — a comparison and an addition.\n- **Space: O(1)** per object — two instance variables.\n\n## Edge Cases\n\n- `BankAccount(\"Meera\")` → balance starts at 0 (default).\n- `withdraw(0)` → 0 ≤ balance → True, balance unchanged (valid).\n- `deposit(-100)` → the guard would reject negative amounts if you add one — the statement only guarantees non-negative balances via withdraw, but a defensive class checks both ways.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount\n            return True\n        return False\n\n    def get_balance(self):\n        return self.balance\n\nacc = BankAccount(\"Aarav\", 1000)\nacc.deposit(500)\nprint(acc.withdraw(200))     # True\nprint(acc.withdraw(5000))    # False\nprint(acc.get_balance())     # 1300"
    },
    {
      "language": "javascript",
      "code": "class BankAccount {\n    constructor(owner, balance = 0) {\n        this.owner = owner;\n        this.balance = balance;\n    }\n\n    deposit(amount) {\n        this.balance += amount;\n    }\n\n    withdraw(amount) {\n        if (amount <= this.balance) {\n            this.balance -= amount;\n            return true;\n        }\n        return false;\n    }\n\n    getBalance() {\n        return this.balance;\n    }\n}\n\nconst acc = new BankAccount(\"Aarav\", 1000);\nacc.deposit(500);\nconsole.log(acc.withdraw(200));    // true\nconsole.log(acc.withdraw(5000));   // false\nconsole.log(acc.getBalance());     // 1300"
    },
    {
      "language": "java",
      "code": "public class BankAccount {\n    private String owner;\n    private double balance;\n\n    public BankAccount(String owner, double balance) {\n        this.owner = owner;\n        this.balance = balance;\n    }\n\n    public void deposit(double amount) {\n        this.balance += amount;\n    }\n\n    public boolean withdraw(double amount) {\n        if (amount <= this.balance) {\n            this.balance -= amount;\n            return true;\n        }\n        return false;\n    }\n\n    public double getBalance() {\n        return this.balance;\n    }\n}\n\n// BankAccount acc = new BankAccount(\"Aarav\", 1000);\n// acc.deposit(500);\n// acc.withdraw(200);   -> true\n// acc.withdraw(5000);  -> false\n// acc.getBalance()     -> 1300.0"
    }
  ],
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Class Hierarchy (Shapes)",
  "slug": "class-hierarchy-shapes",
  "lessonSlug": "inheritance-polymorphism",
  "subtopicSlug": "inheritance-basics",
  "difficulty": "medium",
  "topics": [
    "Inheritance",
    "OOP"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft"
  ],
  "problemStatement": "Build a class hierarchy for shapes using inheritance:\n\n1. A Shape base class with a constructor taking a name (string) stored as an instance variable, and an area() method that returns 0 (the generic placeholder).\n2. A Circle(Shape) subclass whose constructor takes a radius, calls super().__init__(\"Circle\"), stores the radius, and OVERRIDES area() to return 3.14159 × radius².\n3. A Rectangle(Shape) subclass whose constructor takes length and width, calls super().__init__(\"Rectangle\"), stores both, and OVERRIDES area() to return length × width.\n4. Demonstrate polymorphism: build a list [Circle(7), Rectangle(4, 5), Shape()], loop over it printing each shape's name and area.",
  "examples": [
    {
      "input": "Circle(7).area()",
      "output": "153.94",
      "explanation": "3.14159 × 7² = 3.14159 × 49 ≈ 153.94 — the override, not the parent placeholder."
    },
    {
      "input": "Rectangle(4, 5).area()",
      "output": "20",
      "explanation": "4 × 5 = 20 — the rectangle override."
    },
    {
      "input": "Shape().area()",
      "output": "0",
      "explanation": "The generic placeholder, never overridden on the parent."
    },
    {
      "input": "for s in [Circle(7), Rectangle(4, 5)]: s.area()",
      "output": "153.94, 20",
      "explanation": "Polymorphism — one call, each object runs its own area()."
    }
  ],
  "constraints": [
    "name is a non-empty string set via the parent constructor (super().__init__).",
    "radius, length, and width are positive numbers.",
    "area() must be overridden in each child — never duplicated in the loop.",
    "The demo loop must not use type checks (no if/else on the class)."
  ],
  "approach": "## Understanding the Problem\n\nThree classes, one hierarchy, one punchline. The parent `Shape` provides shared state (name) and a placeholder `area()`; the children inherit the state and `override` the math; the demo loop proves polymorphism — one `area()` call, three correct answers.\n\n## The Parent — Shared State + Placeholder\n\n```\nclass Shape:\n    def __init__(self, name):\n        self.name = name\n\n    def area(self):\n        return 0          # generic: \"I have no fixed shape's area\"\n```\n\nThe parent's `area()` returning 0 is a deliberate placeholder — children that forget to override get a safe default instead of a crash.\n\n## The Children — super() First, Then Own State\n\n```\nclass Circle(Shape):\n    def __init__(self, radius):\n        super().__init__(\"Circle\")     # parent sets name = \"Circle\"\n        self.radius = radius\n\n    def area(self):                    # override\n        return 3.14159 * self.radius ** 2\n```\n\nThe golden order: `super().__init__` FIRST (so inherited state exists), then the child's own attributes. Reverse it and `name` is never built.\n\n## The Demo — Polymorphism, Not Type Checks\n\n```\nshapes = [Circle(7), Rectangle(4, 5), Shape()]\n\nfor shape in shapes:\n    print(shape.name + \": \" + str(shape.area()))\n```\n\nThe loop mentions only `Shape`. Each object's override runs automatically — write an if/else on the type and you have thrown the lesson away.\n\n## Full Trace\n\n```\nCircle(7)       → name = \"Circle\" (via super), radius = 7\n                → area() = 3.14159 × 49 = 153.94 (rounded)\nRectangle(4,5)  → name = \"Rectangle\", length = 4, width = 5\n                → area() = 4 × 5 = 20\nShape()         → name = \"\" (constructor requires a name)\n                → area() = 0 (the placeholder)\n```\n\n## Complexity Analysis\n\n- **Time: O(1)** per area() call — a single formula.\n- **Space: O(1)** per object — a name plus one or two numbers.\n\n## Edge Cases\n\n- A child that forgets the override silently returns 0 (the placeholder) — the classic silent bug.\n- `Circle(0)` → area 0 (valid: a point).\n- `Rectangle(2.5, 4)` → area 10.0 — floats work naturally.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "class Shape:\n    def __init__(self, name):\n        self.name = name\n\n    def area(self):\n        return 0\n\n\nclass Circle(Shape):\n    def __init__(self, radius):\n        super().__init__(\"Circle\")\n        self.radius = radius\n\n    def area(self):\n        return 3.14159 * self.radius ** 2\n\n\nclass Rectangle(Shape):\n    def __init__(self, length, width):\n        super().__init__(\"Rectangle\")\n        self.length = length\n        self.width = width\n\n    def area(self):\n        return self.length * self.width\n\n\nshapes = [Circle(7), Rectangle(4, 5), Shape()]\nfor shape in shapes:\n    print(shape.name + \": \" + str(shape.area()))\n# Circle: 153.94\n# Rectangle: 20\n# Shape: 0"
    },
    {
      "language": "javascript",
      "code": "class Shape {\n    constructor(name) {\n        this.name = name;\n    }\n\n    area() {\n        return 0;\n    }\n}\n\nclass Circle extends Shape {\n    constructor(radius) {\n        super(\"Circle\");\n        this.radius = radius;\n    }\n\n    area() {\n        return 3.14159 * this.radius ** 2;\n    }\n}\n\nclass Rectangle extends Shape {\n    constructor(length, width) {\n        super(\"Rectangle\");\n        this.length = length;\n        this.width = width;\n    }\n\n    area() {\n        return this.length * this.width;\n    }\n}\n\nconst shapes = [new Circle(7), new Rectangle(4, 5), new Shape()];\nfor (const shape of shapes) {\n    console.log(shape.name + \": \" + shape.area());\n}\n// Circle: 153.94\n// Rectangle: 20\n// Shape: 0"
    },
    {
      "language": "java",
      "code": "public class Shape {\n    protected String name;\n\n    public Shape(String name) {\n        this.name = name;\n    }\n\n    public double area() {\n        return 0;\n    }\n}\n\nclass Circle extends Shape {\n    private double radius;\n\n    public Circle(double radius) {\n        super(\"Circle\");\n        this.radius = radius;\n    }\n\n    @Override\n    public double area() {\n        return 3.14159 * radius * radius;\n    }\n}\n\nclass Rectangle extends Shape {\n    private double length;\n    private double width;\n\n    public Rectangle(double length, double width) {\n        super(\"Rectangle\");\n        this.length = length;\n        this.width = width;\n    }\n\n    @Override\n    public double area() {\n        return length * width;\n    }\n}\n\n// Shape[] shapes = { new Circle(7), new Rectangle(4, 5), new Shape(\"plain\") };\n// for (Shape s : shapes) System.out.println(s.name + \": \" + s.area());"
    }
  ],
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Encapsulation in a Class",
  "slug": "encapsulation-in-a-class",
  "lessonSlug": "encapsulation-abstraction",
  "subtopicSlug": "encapsulation",
  "difficulty": "medium",
  "topics": [
    "Encapsulation",
    "OOP"
  ],
  "companies": [
    "Amazon",
    "Google",
    "Microsoft"
  ],
  "problemStatement": "Re-build the Bank Account as an encapsulated class:\n\n1. Constructor that takes owner (string) and an optional starting balance (default 0).\n2. The balance stored as a PRIVATE-BY-CONVENTION attribute (_balance).\n3. deposit(amount): returns False for non-positive amounts, otherwise adds to the balance and returns True.\n4. withdraw(amount): returns False for non-positive or insufficient amounts; otherwise subtracts and returns True — the balance must NEVER go negative.\n5. get_balance(): read-only access, always returns the current balance.\n\nFor example: start at 500, deposit(300) → 800, withdraw(900) → False (still 800), withdraw(200) → True (600), get_balance() → 600.",
  "examples": [
    {
      "input": "acc = BankAccount(\"Aarav\", 500); acc.deposit(300)",
      "output": "True, balance = 800",
      "explanation": "300 > 0 → accepted, 500 + 300 = 800."
    },
    {
      "input": "acc.withdraw(900)",
      "output": "False, balance = 800",
      "explanation": "900 > 800 → insufficient, rejected — invariant protected."
    },
    {
      "input": "acc.withdraw(200)",
      "output": "True, balance = 600",
      "explanation": "200 ≤ 800 → accepted, 800 − 200 = 600."
    },
    {
      "input": "acc.deposit(-50)",
      "output": "False, balance unchanged",
      "explanation": "Non-positive amounts are rejected at the door."
    }
  ],
  "constraints": [
    "owner is a non-empty string; balance defaults to 0.",
    "The balance must never go negative — enforced by the methods, not by hope.",
    "No direct writes to the balance outside deposit/withdraw (use get_balance to read).",
    "amounts are positive numbers; non-positive ones are rejected with False."
  ],
  "approach": "## Understanding the Problem\n\nLesson 4's Bank Account let `acc.balance = -5000` slide. This problem's whole point is sealing that hole: a private field plus two guarded methods that own every write.\n\n## Step 1 — The Private Field and Read-Only Window\n\n```\nclass BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self._balance = balance          # private by convention\n\n    def get_balance(self):               # read-only\n        return self._balance\n```\n\n## Step 2 — deposit with the positivity guard\n\n```\ndef deposit(self, amount):\n    if amount <= 0:\n        return False\n    self._balance += amount\n    return True\n```\n\n## Step 3 — withdraw with the double guard (positive + sufficient)\n\n```\ndef withdraw(self, amount):\n    if amount <= 0:\n        return False\n    if amount > self._balance:\n        return False\n    self._balance -= amount\n    return True\n```\n\n## Why This Protects the Invariant\n\n```\nacc = BankAccount(\"Aarav\", 500)\nacc.deposit(300)      →  800 (guarded: 300 > 0 ✓)\nacc.withdraw(900)     →  False (900 > 800 → rejected → balance = 800)\nacc.withdraw(200)     →  True, 600\nacc.get_balance()     →  600\n```\n\nEvery write goes through a checkpoint that checks BEFORE it changes. The invariant \"balance ≥ 0\" is guaranteed by construction — the code literally has no other path to the field.\n\n## Complexity Analysis\n\n- **Time: O(1)** per method — comparisons only.\n- **Space: O(1)** — one private number.\n\n## Edge Cases\n\n- `deposit(-50)` → False (positivity guard).\n- `withdraw(0)` → False (non-positive).\n- `withdraw(exact balance)` → True, balance 0 (allowed: 0 is not negative).\n- `get_balance()` never mutates — pure read.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self._balance = balance          # private by convention\n\n    def get_balance(self):               # read-only window\n        return self._balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            return False\n        self._balance += amount\n        return True\n\n    def withdraw(self, amount):\n        if amount <= 0:\n            return False\n        if amount > self._balance:\n            return False\n        self._balance -= amount\n        return True\n\nacc = BankAccount(\"Aarav\", 500)\nprint(acc.deposit(300))     # True  -> 800\nprint(acc.withdraw(900))    # False -> still 800\nprint(acc.withdraw(200))    # True  -> 600\nprint(acc.get_balance())    # 600"
    },
    {
      "language": "javascript",
      "code": "class BankAccount {\n    constructor(owner, balance = 0) {\n        this.owner = owner;\n        this._balance = balance;         // private by convention\n    }\n\n    getBalance() {\n        return this._balance;\n    }\n\n    deposit(amount) {\n        if (amount <= 0) return false;\n        this._balance += amount;\n        return true;\n    }\n\n    withdraw(amount) {\n        if (amount <= 0) return false;\n        if (amount > this._balance) return false;\n        this._balance -= amount;\n        return true;\n    }\n}\n\nconst acc = new BankAccount(\"Aarav\", 500);\nconsole.log(acc.deposit(300));    // true\nconsole.log(acc.withdraw(900));   // false\nconsole.log(acc.withdraw(200));   // true\nconsole.log(acc.getBalance());    // 600"
    },
    {
      "language": "java",
      "code": "public class BankAccount {\n    private String owner;\n    private double balance;             // private: the locked room\n\n    public BankAccount(String owner, double balance) {\n        this.owner = owner;\n        this.balance = balance;\n    }\n\n    public double getBalance() {\n        return this.balance;\n    }\n\n    public boolean deposit(double amount) {\n        if (amount <= 0) return false;\n        this.balance += amount;\n        return true;\n    }\n\n    public boolean withdraw(double amount) {\n        if (amount <= 0) return false;\n        if (amount > this.balance) return false;\n        this.balance -= amount;\n        return true;\n    }\n}\n\n// BankAccount acc = new BankAccount(\"Aarav\", 500);\n// acc.deposit(300)   -> true\n// acc.withdraw(900)  -> false\n// acc.withdraw(200)  -> true\n// acc.getBalance()   -> 600.0"
    }
  ],
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Abstract Base Class Example",
  "slug": "abstract-base-class-example",
  "lessonSlug": "encapsulation-abstraction",
  "subtopicSlug": "abstract-classes-interfaces",
  "difficulty": "medium",
  "topics": [
    "Abstraction",
    "OOP"
  ],
  "companies": [
    "Amazon",
    "Microsoft",
    "Google"
  ],
  "problemStatement": "Rebuild the Shape hierarchy as an ABSTRACT base class:\n\n1. Shape (abstract, using ABC) with a constructor storing a name, and an ABSTRACT area() method — a promise with no body.\n2. Circle(Shape) with a radius that MUST implement area() = 3.14159 × radius².\n3. Rectangle(Shape) with length and width that MUST implement area() = length × width.\n4. Demonstrate: attempting Shape() must fail (cannot instantiate an abstract class), while Circle(7).area() gives ≈153.94 and Rectangle(4, 5).area() gives 20.",
  "examples": [
    {
      "input": "Circle(7).area()",
      "output": "153.94",
      "explanation": "3.14159 × 49 — the required implementation."
    },
    {
      "input": "Rectangle(4, 5).area()",
      "output": "20",
      "explanation": "4 × 5 — the second required implementation."
    },
    {
      "input": "Shape()",
      "output": "Error",
      "explanation": "Cannot instantiate an abstract class — the incomplete blueprint refuses."
    },
    {
      "input": "A child class that omits area()",
      "output": "Cannot be instantiated",
      "explanation": "Missing a promise → the child stays abstract → no objects."
    }
  ],
  "constraints": [
    "Shape must extend ABC and mark area() with @abstractmethod.",
    "Neither Circle nor Rectangle may be instantiated without implementing area().",
    "All classes take their needed parameters via constructors using super().__init__.",
    "No type checks in the demo — the abstract contract guarantees area() exists."
  ],
  "approach": "## Understanding the Problem\n\nThis is lesson 5's Shape problem with the safety upgraded: the parent is now ABSTRACT. The same hierarchy, but \"forgetting area()\" changes from a silent bug into an error the language refuses to ship.\n\n## Step 1 — The Abstract Contract\n\n```\nfrom abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    def __init__(self, name):\n        self.name = name\n\n    @abstractmethod\n    def area(self):\n        pass                     # the promise — no body\n```\n\n## Step 2 — Children MUST Fulfill the Promise\n\n```\nclass Circle(Shape):\n    def __init__(self, radius):\n        super().__init__(\"Circle\")\n        self.radius = radius\n\n    def area(self):              # required — missing it = no Circle objects\n        return 3.14159 * self.radius ** 2\n```\n\n## Step 3 — Why the Language Beats Discipline\n\n```\nShape()                  # ERROR: cannot instantiate the abstract class\n\nfor shape in [Circle(7), Rectangle(4, 5)]:\n    print(shape.area())  # 153.94 / 20 — guaranteed present\n```\n\nIn lesson 5 a child that \"forgot\" the override silently returned 0 — a bug wearing a smile. Here forgetting is impossible: the child cannot even be instantiated until area() exists. Enforcement beats discipline.\n\n## Complexity Analysis\n\n- **Time: O(1)** per area() call — a single formula.\n- **Space: O(1)** per object — name plus one or two numbers.\n\n## Edge Cases\n\n- `Shape()` → TypeError (abstract instantiation) — expected, it is the design working.\n- A child with a missing area() → also cannot be instantiated.\n- `Circle(1)` → 3.14159 — radius 1 makes π visible directly.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    def __init__(self, name):\n        self.name = name\n\n    @abstractmethod\n    def area(self):\n        pass\n\n\nclass Circle(Shape):\n    def __init__(self, radius):\n        super().__init__(\"Circle\")\n        self.radius = radius\n\n    def area(self):\n        return 3.14159 * self.radius ** 2\n\n\nclass Rectangle(Shape):\n    def __init__(self, length, width):\n        super().__init__(\"Rectangle\")\n        self.length = length\n        self.width = width\n\n    def area(self):\n        return self.length * self.width\n\n\n# Shape()                     # ERROR: cannot instantiate abstract class\nfor shape in [Circle(7), Rectangle(4, 5)]:\n    print(shape.name + \": \" + str(shape.area()))\n# Circle: 153.94\n# Rectangle: 20"
    },
    {
      "language": "javascript",
      "code": "class Shape {\n    constructor(name) {\n        if (new.target === Shape) {\n            throw new Error(\"Cannot instantiate the abstract class Shape\");\n        }\n        this.name = name;\n    }\n\n    area() {\n        throw new Error(\"Abstract method — subclasses must implement area()\");\n    }\n}\n\nclass Circle extends Shape {\n    constructor(radius) {\n        super(\"Circle\");\n        this.radius = radius;\n    }\n\n    area() {\n        return 3.14159 * this.radius ** 2;\n    }\n}\n\nclass Rectangle extends Shape {\n    constructor(length, width) {\n        super(\"Rectangle\");\n        this.length = length;\n        this.width = width;\n    }\n\n    area() {\n        return this.length * this.width;\n    }\n}\n\nfor (const shape of [new Circle(7), new Rectangle(4, 5)]) {\n    console.log(shape.name + \": \" + shape.area());\n}\n// Circle: 153.94\n// Rectangle: 20"
    },
    {
      "language": "java",
      "code": "public abstract class Shape {\n    protected String name;\n\n    public Shape(String name) {\n        this.name = name;\n    }\n\n    public abstract double area();    // the promise — no body\n}\n\nclass Circle extends Shape {\n    private double radius;\n\n    public Circle(double radius) {\n        super(\"Circle\");\n        this.radius = radius;\n    }\n\n    @Override\n    public double area() {\n        return 3.14159 * radius * radius;\n    }\n}\n\nclass Rectangle extends Shape {\n    private double length;\n    private double width;\n\n    public Rectangle(double length, double width) {\n        super(\"Rectangle\");\n        this.length = length;\n        this.width = width;\n    }\n\n    @Override\n    public double area() {\n        return length * width;\n    }\n}\n\n// new Shape(\"x\") -> compile error: abstract cannot be instantiated\n// Shape[] s = { new Circle(7), new Rectangle(4, 5) };\n// for (Shape sh : s) System.out.println(sh.name + \": \" + sh.area());"
    }
  ],
  "timeComplexity": "O(1)",
  "spaceComplexity": "O(1)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Reverse a String",
  "slug": "reverse-a-string",
  "lessonSlug": "strings",
  "subtopicSlug": "string-basics-methods",
  "difficulty": "easy",
  "topics": [
    "Strings",
    "Basics"
  ],
  "companies": [
    "Google",
    "Amazon",
    "Microsoft"
  ],
  "problemStatement": "Given a string s, return the string reversed. For example, \"hello\" → \"olleh\" and \"Aarav\" → \"varaA\". Handle the empty string and single-character strings correctly (both reverse to themselves). Provide both the one-line slicing solution and a manual loop solution.",
  "examples": [
    {
      "input": "s = \"hello\"",
      "output": "\"olleh\"",
      "explanation": "Characters appear in reverse order."
    },
    {
      "input": "s = \"Aarav\"",
      "output": "\"varaA\"",
      "explanation": "Case is preserved — only the order changes."
    },
    {
      "input": "s = \"\"",
      "output": "\"\"",
      "explanation": "The empty string reverses to itself."
    },
    {
      "input": "s = \"z\"",
      "output": "\"z\"",
      "explanation": "A single character reverses to itself."
    }
  ],
  "constraints": [
    "s contains only printable ASCII characters.",
    "Length is between 0 and 10,000.",
    "Both a slicing solution and a manual loop must work."
  ],
  "approach": "## Understanding the Problem\n\nReverse the order of characters. Three valid routes — the one-liner, a manual prepend loop, and (in mutable languages) the two-pointer swap.\n\n## Route 1 — The One-Line Slice\n\n```\nreversed_string = s[::-1]\n```\n\nThe slice `[::-1]` reads the sequence backwards: start at the end, step −1. Given the half-open rule, this is the single most useful string trick in the exam.\n\n## Route 2 — The Manual Loop (no built-in trick)\n\n```\nresult = \"\"\nfor ch in s:\n    result = ch + result     # PREPEND each character\nreturn result\n```\n\nThe order of addition is the entire trick:\n\n```\n\"h\"  → \"eh\" → \"leh\" → \"lleh\" → \"olleh\"\n```\n\nPrepending (`ch + result`) reverses; appending (`result + ch`) would return the string unchanged.\n\n## Route 3 — Two-Pointer Swap (mutable-language version)\n\n```\nleft, right = 0, len(s) - 1\nwhile left < right:\n    swap(s[left], s[right])\n    left += 1\n    right -= 1\n```\n\nIn-place, O(1) extra space. Integers yesterday, characters today — the loop maths is identical.\n\n## Complexity Analysis\n\n- **Time: O(n)** — every character is visited once (any route).\n- **Space: O(n)** for slicing/prepend (a new string is built); O(1) for the in-place swap.\n\n## Edge Cases\n\n- `\"\"` → `\"\"` (the loop never runs).\n- `\"z\"` → `\"z\"` (one character, no swap).\n- `\"aa\"` → `\"aa\"` (palindrome — output looks unchanged).",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def reverse_slice(s):\n    return s[::-1]\n\n\ndef reverse_loop(s):\n    result = \"\"\n    for ch in s:\n        result = ch + result   # prepend to build the reverse\n    return result\n\nprint(reverse_slice(\"hello\"))   # olleh\nprint(reverse_loop(\"Aarav\"))    # varaA"
    },
    {
      "language": "javascript",
      "code": "function reverseString(s) {\n    return s.split(\"\").reverse().join(\"\");\n}\n\nfunction reverseLoop(s) {\n    let result = \"\";\n    for (const ch of s) {\n        result = ch + result;      // prepend\n    }\n    return result;\n}\n\nconsole.log(reverseString(\"hello\"));   // olleh\nconsole.log(reverseLoop(\"Aarav\"));     // varaA"
    },
    {
      "language": "java",
      "code": "public static String reverseString(String s) {\n    StringBuilder sb = new StringBuilder(s);\n    return sb.reverse().toString();\n}\n\npublic static String reverseLoop(String s) {\n    StringBuilder result = new StringBuilder();\n    for (int i = s.length() - 1; i >= 0; i--) {\n        result.append(s.charAt(i));   // read backwards\n    }\n    return result.toString();\n}\n\n// reverseString(\"hello\") -> \"olleh\"\n// reverseLoop(\"Aarav\")   -> \"varaA\""
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Count Vowels",
  "slug": "count-vowels",
  "lessonSlug": "strings",
  "subtopicSlug": "string-formatting",
  "difficulty": "easy",
  "topics": [
    "Strings",
    "Formatting"
  ],
  "companies": [
    "Microsoft",
    "Amazon",
    "Google"
  ],
  "problemStatement": "Given a string s, count how many vowels (a, e, i, o, u) it contains — CASE-INSENSITIVELY (both 'A' and 'a' count). Consonants and non-alphabetic characters do not count. Return the count and report it with a formatted message: \"The string 'hello' contains 2 vowels.\"\n\nFor example: \"hello\" → 2, \"Aarav\" → 3, \"AEIOU\" → 5, \"xyz123\" → 0.",
  "examples": [
    {
      "input": "s = \"hello\"",
      "output": "2",
      "explanation": "Only e and o are vowels (h, l, l are not)."
    },
    {
      "input": "s = \"Aarav\"",
      "output": "3",
      "explanation": "Case-insensitive: A, a and a (u? none) — 3 vowels."
    },
    {
      "input": "s = \"AEIOU\"",
      "output": "5",
      "explanation": "Uppercase counts too — the lower() step is crucial."
    },
    {
      "input": "s = \"xyz123\"",
      "output": "0",
      "explanation": "No vowels at all."
    }
  ],
  "constraints": [
    "s may contain letters, digits, spaces, and punctuation.",
    "Counting is case-insensitive — both \"a\" and \"A\" count.",
    "Only a, e, i, o, u count; y is NOT a vowel here."
  ],
  "approach": "## Understanding the Problem\n\nCount vowels, but never be fooled by case. The work is two steps: normalise, then count via membership.\n\n## Step 1 — Normalise the case\n\n```\ns = s.lower()          # one case, so 'A' and 'a' both match\n```\n\nWithout this, \"AEIOU\" scores 0 — 'A' never equals the lowercase 'a' in the vowel list.\n\n## Step 2 — The membership check\n\n```\nvowels = \"aeiou\"\ncount = 0\nfor ch in s:\n    if ch in vowels:\n        count += 1\n```\n\n`ch in vowels` is the elegant test — no chain of `if ch == 'a' or ch == 'e' ...` and no forgetting 'u'.\n\n## Step 3 — Format the result\n\n```\nprint(f\"The string '{original}' contains {count} vowels.\")\n```\n\nKeep the ORIGINAL string for display; use the lowered copy for counting.\n\n## Full trace on \"Aarav\"\n\n```\n\"Aarav\".lower() → \"aarav\"\na ✓ a ✓ r ✗ a ✓ v ✗ → count = 3\n\"`\" → the reversals above\n```\n\n## Complexity Analysis\n\n- **Time: O(n)** — one pass over the (lowered) string.\n- **Space: O(n)** — the lowered copy; a single constant-space alternative counts in place.\n\n## Edge Cases\n\n- `\"\"` → 0 (loop never runs).\n- `\"AEIOU\"` → 5 (case handled).\n- `\"bcd\"` → 0.\n- `\"y\"` → 0 (y is not a vowel here).",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def count_vowels(s):\n    original = s\n    s = s.lower()            # case-insensitive\n    vowels = \"aeiou\"\n    count = 0\n    for ch in s:\n        if ch in vowels:\n            count += 1\n    return original, count\n\noriginal, count = count_vowels(\"hello\")\nprint(f\"The string '{original}' contains {count} vowels.\")\n# The string \"hello\" contains 2 vowels."
    },
    {
      "language": "javascript",
      "code": "function countVowels(s) {\n    let count = 0;\n    const vowels = \"aeiou\";\n    for (const ch of s.toLowerCase()) {   // case-insensitive\n        if (vowels.includes(ch)) count++;\n    }\n    return count;\n}\n\nconsole.log(countVowels(\"hello\"));   // 2\nconsole.log(countVowels(\"Aarav\"));   // 3"
    },
    {
      "language": "java",
      "code": "public static int countVowels(String s) {\n    int count = 0;\n    String lower = s.toLowerCase();\n    for (int i = 0; i < lower.length(); i++) {\n        char ch = lower.charAt(i);\n        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {\n            count++;\n        }\n    }\n    return count;\n}\n// countVowels(\"hello\") == 2\n// countVowels(\"Aarav\") == 3"
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Remove Duplicates from a List",
  "slug": "remove-duplicates-from-a-list",
  "lessonSlug": "lists-tuples-dictionaries",
  "subtopicSlug": "list-operations",
  "difficulty": "easy",
  "topics": [
    "Lists",
    "Basics"
  ],
  "companies": [
    "Google",
    "Amazon",
    "Microsoft"
  ],
  "problemStatement": "Given a list of integers, return a new list with duplicates removed, PRESERVING the order of first occurrence. For example, [3, 1, 3, 2, 1] → [3, 1, 2]. The empty list and a list with no duplicates must pass through unchanged.",
  "examples": [
    {
      "input": "nums = [3, 1, 3, 2, 1]",
      "output": "[3, 1, 2]",
      "explanation": "Order of first occurrence is kept — 3 and 1 appear only once."
    },
    {
      "input": "nums = []",
      "output": "[]",
      "explanation": "The empty list has no duplicates."
    },
    {
      "input": "nums = [7, 7, 7]",
      "output": "[7]",
      "explanation": "Every duplicate collapses into one survivor."
    },
    {
      "input": "nums = [1, 2, 3]",
      "output": "[1, 2, 3]",
      "explanation": "No duplicates — the list passes through unchanged."
    }
  ],
  "constraints": [
    "nums may be empty.",
    "nums contains only integers.",
    "Length is between 0 and 10,000.",
    "The output MUST preserve the order of first occurrence."
  ],
  "approach": "## Understanding the Problem\n\nReturn a NEW list with duplicates removed, preserving the order of FIRST occurrence. Two demands at once: uniqueness (a *set* idea) and order (a *list* idea) — so the solution uses both.\n\n## Step 1 — The set + list pattern\n\n```python\nseen = set()\nresult = []\n\nfor x in nums:\n    if x not in seen:      # O(1) duplicate check\n        seen.add(x)\n        result.append(x)\nreturn result\n```\n\n- `seen` gives instant duplicate checks (set membership is O(1)).\n- `result` keeps the sequence — we only append first-time values.\n\n## Step 2 — Trace on [3, 1, 3, 2, 1]\n\n```\nx = 3 → not in seen → result = [3],     seen = {3}\nx = 1 → not in seen → result = [3, 1],  seen = {3, 1}\nx = 3 → IN seen    → skipped\nx = 2 → not in seen → result = [3, 1, 2]\nx = 1 → IN seen    → skipped\n→ [3, 1, 2] ✅\n```\n\n## Step 3 — The shortcut (order-breaking)\n\n```python\nlist(set(nums))        # removes duplicates but ORDER IS LOST\n```\n\nSets are unordered — only use this when order doesn't matter.\n\n## Complexity Analysis\n\n- **Time: O(n)** — one pass; every set check is O(1) on average.\n- **Space: O(n)** — the `seen` set (worst case: all values unique).\n\n## Edge Cases\n\n- `[]` → `[]` (the loop never runs).\n- `[7, 7, 7]` → `[7]` (one survivor).\n- `[1, 2, 3]` → `[1, 2, 3]` (no duplicates — unchanged).",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def remove_duplicates(nums):\n    seen = set()\n    result = []\n    for x in nums:\n        if x not in seen:      # O(1) duplicate check\n            seen.add(x)\n            result.append(x)\n    return result\n\nprint(remove_duplicates([3, 1, 3, 2, 1]))   # [3, 1, 2]\nprint(remove_duplicates([7, 7, 7]))         # [7]"
    },
    {
      "language": "javascript",
      "code": "function removeDuplicates(nums) {\n    const seen = new Set();\n    const result = [];\n    for (const x of nums) {\n        if (!seen.has(x)) {       // O(1) duplicate check\n            seen.add(x);\n            result.push(x);\n        }\n    }\n    return result;\n}\n\nconsole.log(removeDuplicates([3, 1, 3, 2, 1]));   // [3, 1, 2]\nconsole.log(removeDuplicates([7, 7, 7]));         // [7]"
    },
    {
      "language": "java",
      "code": "public static List<Integer> removeDuplicates(List<Integer> nums) {\n    Set<Integer> seen = new HashSet<>();\n    List<Integer> result = new ArrayList<>();\n    for (int x : nums) {\n        if (seen.add(x)) {   // add() returns true only when x is new\n            result.add(x);\n        }\n    }\n    return result;\n}\n// removeDuplicates([3,1,3,2,1]) -> [3, 1, 2]"
    }
  ],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Merge Two Dictionaries",
  "slug": "merge-two-dictionaries",
  "lessonSlug": "lists-tuples-dictionaries",
  "subtopicSlug": "dictionaries",
  "difficulty": "easy",
  "topics": [
    "Dictionaries",
    "Basics"
  ],
  "companies": [
    "Microsoft",
    "Amazon",
    "Google"
  ],
  "problemStatement": "Given two dictionaries, return a merged dictionary containing all keys from both. When a key exists in BOTH dictionaries, the value from the SECOND dictionary wins. For example, {\"a\": 1, \"b\": 2} merged with {\"b\": 3, \"c\": 4} → {\"a\": 1, \"b\": 3, \"c\": 4}. The original dictionaries must not be modified.",
  "examples": [
    {
      "input": "merge({\"a\": 1, \"b\": 2}, {\"b\": 3, \"c\": 4})",
      "output": "{\"a\": 1, \"b\": 3, \"c\": 4}",
      "explanation": "\"b\" exists in both — the second dictionary's value 3 wins."
    },
    {
      "input": "merge({}, {\"x\": 1})",
      "output": "{\"x\": 1}",
      "explanation": "Merging with an empty dict adds everything from the other."
    },
    {
      "input": "merge({\"x\": 1}, {})",
      "output": "{\"x\": 1}",
      "explanation": "Empty second dict — the first passes through unchanged."
    },
    {
      "input": "merge({\"a\": 1}, {\"a\": 9})",
      "output": "{\"a\": 9}",
      "explanation": "Conflict on \"a\" — second dict wins."
    }
  ],
  "constraints": [
    "Both dictionaries may be empty.",
    "Keys are strings; values are integers.",
    "No keys collide across more than two dictionaries (only two inputs).",
    "The original dictionaries must NOT be mutated."
  ],
  "approach": "## Understanding the Problem\n\nCombine two dicts into one; on conflicting keys, the SECOND dict wins; and — the sneaky part — the caller's dicts must survive untouched.\n\n## Step 1 — The `update()` way (mutates, so copy first)\n\n```python\nmerged = d1.copy()     # don't destroy the caller's d1!\nmerged.update(d2)      # d2 wins on conflicts\nreturn merged\n```\n\n`update()` is clear but in-place — the `copy()` protects d1.\n\n## Step 2 — The unpacking way (new dict, clean)\n\n```python\nmerged = {**d1, **d2}\n```\n\nBuilding a fresh dict from both — no mutation possible, no copy needed. This is the interview favourite.\n\n## Step 3 — The pipe way (Python 3.9+)\n\n```python\nmerged = d1 | d2\n```\n\nReads like a set union — d2's values win on ties.\n\n## Full trace\n\n```\nd1 = {\"a\": 1, \"b\": 2}    d2 = {\"b\": 3, \"c\": 4}\nmerged = {**d1, **d2}\n  \"a\": from d1 → 1\n  \"b\": d1 says 2, d2 says 3 → d2 wins → 3\n  \"c\": from d2 → 4\n→ {\"a\": 1, \"b\": 3, \"c\": 4} ✅\n```\n\n## Complexity Analysis\n\n- **Time: O(n + m)** — every key of both dicts is visited once.\n- **Space: O(n + m)** — the new merged dict.\n\n## Edge Cases\n\n- `merge({}, {\"x\": 1})` → `{\"x\": 1}`.\n- `merge({\"x\": 1}, {})` → `{\"x\": 1}`.\n- Full conflict: `merge({\"a\": 1}, {\"a\": 9})` → `{\"a\": 9}`.",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def merge_dicts(d1, d2):\n    merged = d1.copy()     # don't mutate the caller's dict\n    merged.update(d2)      # d2 wins on conflicts\n    return merged\n\n# One-liners (both build a NEW dict):\n# merged = {**d1, **d2}\n# merged = d1 | d2         # Python 3.9+\n\nprint(merge_dicts({\"a\": 1, \"b\": 2}, {\"b\": 3, \"c\": 4}))  # {\"a\": 1, \"b\": 3, \"c\": 4}"
    },
    {
      "language": "javascript",
      "code": "function mergeDicts(d1, d2) {\n    return { ...d1, ...d2 };   // d2 wins on conflicts, brand-new object\n}\n\nconsole.log(mergeDicts({ a: 1, b: 2 }, { b: 3, c: 4 }));  // { a: 1, b: 3, c: 4 }"
    },
    {
      "language": "java",
      "code": "public static Map<String, Integer> mergeDicts(\n        Map<String, Integer> d1, Map<String, Integer> d2) {\n    Map<String, Integer> merged = new HashMap<>(d1);  // copy first\n    merged.putAll(d2);      // d2 wins on conflicts\n    return merged;\n}\n// mergeDicts({a:1,b:2}, {b:3,c:4}) -> {a:1, b:3, c:4}"
    }
  ],
  "timeComplexity": "O(n + m)",
  "spaceComplexity": "O(n + m)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
},
{
  "title": "Union/Intersection of Two Sets",
  "slug": "union-intersection-of-two-sets",
  "lessonSlug": "sets",
  "subtopicSlug": "set-operations",
  "difficulty": "easy",
  "topics": [
    "Sets",
    "Basics"
  ],
  "companies": [
    "Google",
    "Amazon",
    "Microsoft"
  ],
  "problemStatement": "Given two sets, return their UNION (every item from both, no duplicates) and their INTERSECTION (items present in both). For example, {1, 2, 3} and {2, 3, 4} → union {1, 2, 3, 4}, intersection {2, 3}. Empty sets and identical sets must be handled correctly.",
  "examples": [
    {
      "input": "union({1,2,3}, {2,3,4})",
      "output": "{1, 2, 3, 4}",
      "explanation": "Every item from both sets, duplicates kept once — the 2 and 3 appear only once."
    },
    {
      "input": "intersection({1,2,3}, {2,3,4})",
      "output": "{2, 3}",
      "explanation": "Only the items present in BOTH sets."
    },
    {
      "input": "union({1,2}, {1,2})",
      "output": "{1, 2}",
      "explanation": "Identical sets — union of a set with itself is the set itself."
    },
    {
      "input": "intersection({1,2}, {3,4})",
      "output": "set()",
      "explanation": "No shared items — the empty set, still a set."
    }
  ],
  "constraints": [
    "Both inputs are sets (may be empty).",
    "Set items are hashable values (numbers, strings, tuples).",
    "The original sets must NOT be modified.",
    "Return real sets — an empty result is set(), never {} (that is a dict!)."
  ],
  "approach": "## Understanding the Problem\n\nReturn union and intersection of two sets, without mutating the inputs, and without confusing the empty set with the dict.\n\n## Step 1 — Union with the pipe operator\n\n```python\na | b\n```\n\nEvery item from both sets, duplicates kept once. For `{1, 2, 3} | {2, 3, 4}` → `{1, 2, 3, 4}`.\n\n## Step 2 — Intersection with the ampersand\n\n```python\na & b\n```\n\nItems in BOTH sets. For `{1, 2, 3} & {2, 3, 4}` → `{2, 3}`.\n\n## Step 3 — The method spellings (same result)\n\n```python\na.union(b)          # or  a | b\na.intersection(b)   # or  a & b\n```\n\nPrefer the operators — they are shorter and make the maths visible at a glance.\n\n## Trace\n\n```\na = {1, 2, 3}   b = {2, 3, 4}\na | b  → 1 from a, 2 shared (once), 3 shared (once), 4 from b → {1, 2, 3, 4}\na & b  → only the shared 2 and 3 → {2, 3}\n✅\n```\n\n## Complexity Analysis\n\n- **Time: O(n + m)** — every item of both sets is touched once.\n- **Space: O(n + m)** — the size of the resulting set.\n\n## Edge Cases\n\n- `{} | {5}` → `{5}` (empty set is the union's identity).\n- `{1,2} & {3,4}` → `set()` (disjoint — empty intersection).\n- `{1,2} | {1,2}` → `{1,2}` (union with itself).",
  "codeBlocks": [
    {
      "language": "python",
      "code": "def union_and_intersection(a, b):\n    union = a | b          # every item from both, no duplicates\n    intersection = a & b   # only the shared items\n    return union, intersection\n\nu, i = union_and_intersection({1, 2, 3}, {2, 3, 4})\nprint(u)   # {1, 2, 3, 4}\nprint(i)   # {2, 3}"
    },
    {
      "language": "javascript",
      "code": "function unionAndIntersection(a, b) {\n    const union = new Set([...a, ...b]);   // spread both — duplicates collapse\n    const intersection = new Set([...a].filter(x => b.has(x)));\n    return { union, intersection };\n}\n\nconst { union, intersection } = unionAndIntersection(\n    new Set([1, 2, 3]), new Set([2, 3, 4]));\nconsole.log(union);         // Set { 1, 2, 3, 4 }\nconsole.log(intersection);  // Set { 2, 3 }"
    },
    {
      "language": "java",
      "code": "public static ArrayList<Set<Integer>> unionAndIntersection(\n        Set<Integer> a, Set<Integer> b) {\n    Set<Integer> union = new HashSet<>(a);\n    union.addAll(b);                 // every item from both, no duplicates\n\n    Set<Integer> intersection = new HashSet<>(a);\n    intersection.retainAll(b);       // keep only what b also has\n    return new ArrayList<>(List.of(union, intersection));\n}\n// unionAndIntersection({1,2,3}, {2,3,4}) -> [{1,2,3,4}, {2,3}]"
    }
  ],
  "timeComplexity": "O(n + m)",
  "spaceComplexity": "O(n + m)",
  "youtubeUrl": "",
  "pdfUrl": "",
  "pptxUrl": "",
  "media": []
}];

/* ================================================================
 * Programming Quizzes (one per problem, keyed by problemSlug)
 * ================================================================ */

const programmingQuizzes = [
{
  "problemSlug": "swap-two-variables",
  "questions": [
    {
      "text": "What is a variable?",
      "options": [
        "A fixed number that never changes",
        "A named container that stores a value in memory",
        "A type of loop",
        "A special character"
      ],
      "correctIndex": 1
    },
    {
      "text": "Which of these is NOT one of the four core data types?",
      "options": [
        "Integer",
        "Float",
        "Array",
        "Boolean"
      ],
      "correctIndex": 2
    },
    {
      "text": "Which data type does the value \"42\" (with quotes) belong to?",
      "options": [
        "Integer",
        "Float",
        "Boolean",
        "String"
      ],
      "correctIndex": 3
    },
    {
      "text": "Why is a single temporary variable enough to swap two values?",
      "options": [
        "Because we only read the values",
        "Because it preserves the original value before it is overwritten",
        "Because the computer swaps values automatically",
        "Because integers are small"
      ],
      "correctIndex": 1
    },
    {
      "text": "What is the time complexity of swapping two variables?",
      "options": [
        "O(n)",
        "O(log n)",
        "O(1)",
        "O(n^2)"
      ],
      "correctIndex": 2
    }
  ]
},
{
  "problemSlug": "convert-between-data-types",
  "questions": [
    {
      "text": "What does the string \"42\" become after int(\"42\")?",
      "options": [
        "The string \"42\" again",
        "The integer 42",
        "42.0 (float)",
        "Nothing — it errors"
      ],
      "correctIndex": 1
    },
    {
      "text": "Which of these inputs should return 0 for a safe string-to-int converter?",
      "options": [
        "\"42\"",
        "\"-7\"",
        "\"3.14\"",
        "\"+13\""
      ],
      "correctIndex": 2
    },
    {
      "text": "In JavaScript, what does \"10\" + 5 produce?",
      "options": [
        "15 (number)",
        "105 (string)",
        "An error",
        "10.5"
      ],
      "correctIndex": 1
    },
    {
      "text": "Why does the temporary-variable approach avoid the a = b; b = a bug?",
      "options": [
        "It uses two temp variables",
        "It saves the original value before overwriting it",
        "It sorts the values first",
        "It does not use assignment"
      ],
      "correctIndex": 1
    },
    {
      "text": "What is the space complexity of converting a string to an integer manually?",
      "options": [
        "O(n) — a new string is created",
        "O(n^2)",
        "O(log n)",
        "O(1) — only a few variables"
      ],
      "correctIndex": 3
    }
  ]
},
{
  "problemSlug": "sum-of-digits",
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
},
{
  "problemSlug": "fizzbuzz",
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
},
{
  "problemSlug": "function-with-default-arguments",
  "questions": [
    {
      "text": "In calculate_area(4), what value does width end up with after the square rule?",
      "options": [
        "It throws an error",
        "0",
        "4 (same as length)",
        "1"
      ],
      "correctIndex": 2
    },
    {
      "text": "Why must default parameters come AFTER required parameters?",
      "options": [
        "To avoid ambiguous argument binding",
        "It runs faster",
        "It saves memory",
        "It is only a style choice"
      ],
      "correctIndex": 0
    },
    {
      "text": "calculate_area(5, 3) returns —",
      "options": [
        "8",
        "15",
        "16",
        "53"
      ],
      "correctIndex": 1
    },
    {
      "text": "Which of these is a risky default value for mutable data?",
      "options": [
        "An empty list []",
        "0",
        "None",
        "A string"
      ],
      "correctIndex": 0
    },
    {
      "text": "What is the time complexity of calculate_area?",
      "options": [
        "O(n)",
        "O(1)",
        "O(n^2)",
        "O(log n)"
      ],
      "correctIndex": 1
    }
  ]
},
{
  "problemSlug": "factorial-iterative",
  "questions": [
    {
      "text": "factorial(0) returns —",
      "options": [
        "0",
        "1",
        "undefined",
        "-1"
      ],
      "correctIndex": 1
    },
    {
      "text": "The loop multiplies the running total by —",
      "options": [
        "2, 3, ..., up to n",
        "0, 1, ..., n",
        "Only by n",
        "Nothing — it adds"
      ],
      "correctIndex": 0
    },
    {
      "text": "factorial(4) equals —",
      "options": [
        "16",
        "12",
        "36",
        "24"
      ],
      "correctIndex": 3
    },
    {
      "text": "What is the time complexity of iterative factorial?",
      "options": [
        "O(1)",
        "O(n)",
        "O(n^2)",
        "O(log n)"
      ],
      "correctIndex": 1
    },
    {
      "text": "Why does factorial(0) need no special code?",
      "options": [
        "The loop never runs and result stays 1",
        "0 is negative",
        "An if-statement still handles it",
        "It returns -1"
      ],
      "correctIndex": 0
    }
  ]
}
,
{
  "problemSlug": "bank-account-class",
  "questions": [
    {
      "text": "What does self refer to inside __init__?",
      "options": [
        "The class",
        "A global variable",
        "The current instance",
        "The constructor"
      ],
      "correctIndex": 2
    },
    {
      "text": "acc = BankAccount(\"Meera\") — what is the starting balance?",
      "options": [
        "None",
        "0",
        "1000",
        "An error"
      ],
      "correctIndex": 1
    },
    {
      "text": "withdraw(5000) when balance is 1300 — what happens?",
      "options": [
        "Returns False and balance stays the same",
        "Balance goes negative",
        "Returns True anyway",
        "Raises an exception"
      ],
      "correctIndex": 0
    },
    {
      "text": "acc.deposit(100) is shorthand for —",
      "options": [
        "A syntax error",
        "BankAccount.deposit(acc, 100)",
        "deposit(acc, 100)",
        "acc(100)"
      ],
      "correctIndex": 1
    },
    {
      "text": "What does deposit() return?",
      "options": [
        "The new balance",
        "The owner",
        "None",
        "An error"
      ],
      "correctIndex": 2
    }
  ]
},
{
  "problemSlug": "class-hierarchy-shapes",
  "questions": [
    {
      "text": "What does a child class inherit from its parent?",
      "options": [
        "All the parent's attributes and methods",
        "Only the constructor",
        "Nothing — it starts empty",
        "Only the private fields"
      ],
      "correctIndex": 0
    },
    {
      "text": "class Circle(Shape): means —",
      "options": [
        "Circle calls Shape as a function",
        "Shape is a child of Circle",
        "Circle is a child of Shape",
        "Circle is a copy of Shape"
      ],
      "correctIndex": 2
    },
    {
      "text": "Why call super().__init__ inside a child constructor?",
      "options": [
        "To duplicate the object",
        "It is optional decoration",
        "To delete the parent",
        "To run the parent's constructor so shared state is set up"
      ],
      "correctIndex": 3
    },
    {
      "text": "Method overriding is —",
      "options": [
        "Changing the parent class itself",
        "Defining a method in the child with the same name and signature as the parent",
        "Writing a brand-new class",
        "Calling super() with no arguments"
      ],
      "correctIndex": 1
    },
    {
      "text": "Polymorphism lets us —",
      "options": [
        "Write code against the parent type that behaves per the actual object",
        "Avoid classes entirely",
        "Duplicate the parent's code",
        "Only ever use one subclass"
      ],
      "correctIndex": 0
    }
  ]
},
{
  "problemSlug": "encapsulation-in-a-class",
  "questions": [
    {
      "text": "Why store the balance as a private attribute?",
      "options": [
        "So outsiders can't corrupt it directly",
        "To slow the program down",
        "Because numbers must be hidden",
        "It is just a style rule"
      ],
      "correctIndex": 0
    },
    {
      "text": "In Python, the private-by-convention prefix is —",
      "options": [
        "# (hash)",
        "$ (dollar)",
        "_ (underscore)",
        "No symbol needed"
      ],
      "correctIndex": 2
    },
    {
      "text": "What protects the invariant \"balance never negative\"?",
      "options": [
        "The class name",
        "The withdraw guard inside the method",
        "The private keyword alone",
        "The loop"
      ],
      "correctIndex": 1
    },
    {
      "text": "get_balance() is a —",
      "options": [
        "Setter",
        "Constructor",
        "Getter",
        "Loop"
      ],
      "correctIndex": 2
    },
    {
      "text": "acc.deposit(-50) returns —",
      "options": [
        "True and adds -50",
        "False — non-positive amounts are rejected",
        "An exception",
        "-50"
      ],
      "correctIndex": 1
    }
  ]
},
{
  "problemSlug": "abstract-base-class-example",
  "questions": [
    {
      "text": "An abstract class —",
      "options": [
        "Can be instantiated like any class",
        "Cannot be instantiated directly — it is an incomplete blueprint",
        "Cannot be inherited",
        "Has only static methods"
      ],
      "correctIndex": 1
    },
    {
      "text": "An abstract method is —",
      "options": [
        "An optional method",
        "A promise every child MUST implement",
        "A private method",
        "A getter"
      ],
      "correctIndex": 1
    },
    {
      "text": "Why make area() abstract in Shape?",
      "options": [
        "To guarantee every shape provides area() — safe polymorphism",
        "To make Shape run faster",
        "To hide the radius",
        "To remove code from children"
      ],
      "correctIndex": 0
    },
    {
      "text": "In Python, abstract classes come from —",
      "options": [
        "The math library",
        "The ABC module with @abstractmethod",
        "The random module",
        "The os module"
      ],
      "correctIndex": 1
    },
    {
      "text": "A child of an abstract class that forgets the abstract method —",
      "options": [
        "Still works fine",
        "Deletes the parent",
        "Becomes abstract itself or errors on instantiation",
        "Duplicates the parent"
      ],
      "correctIndex": 2
    }
  ]
},
{
  "problemSlug": "reverse-a-string",
  "questions": [
    {
      "text": "s[::-1] on \"abc\" gives —",
      "options": [
        "abc",
        "bbc",
        "cba",
        "Err"
      ],
      "correctIndex": 2
    },
    {
      "text": "In the manual loop, the prepend trick is —",
      "options": [
        "result = result + ch",
        "result = ch + result",
        "result += ch",
        "ch = result"
      ],
      "correctIndex": 1
    },
    {
      "text": "reverse(\"\") returns —",
      "options": [
        "Error",
        "The empty string",
        "A space",
        "None"
      ],
      "correctIndex": 1
    },
    {
      "text": "The two-pointer swap keeps swapping while —",
      "options": [
        "left >= right",
        "left < right",
        "always",
        "len times"
      ],
      "correctIndex": 0
    },
    {
      "text": "reverse(\"Aarav\") gives —",
      "options": [
        "varaA",
        "vraaA",
        "aarav",
        "vAara"
      ],
      "correctIndex": 0
    }
  ]
},
{
  "problemSlug": "count-vowels",
  "questions": [
    {
      "text": "countVowels(\"hello\") returns —",
      "options": [
        "5",
        "3",
        "2",
        "1"
      ],
      "correctIndex": 2
    },
    {
      "text": "countVowels(\"Aarav\") returns —",
      "options": [
        "2",
        "3",
        "5",
        "1"
      ],
      "correctIndex": 1
    },
    {
      "text": "Why lower() the string first?",
      "options": [
        "To count case-insensitively",
        "It speeds up the loop",
        "It removes spaces",
        "It is required for the loop to run"
      ],
      "correctIndex": 0
    },
    {
      "text": "The membership test for a vowel is —",
      "options": [
        "vowels.contains(ch)",
        "ch in vowels",
        "ch == vowels",
        "len(vowels)"
      ],
      "correctIndex": 1
    },
    {
      "text": "countVowels(\"AEIOU\") returns —",
      "options": [
        "0",
        "1",
        "4",
        "5"
      ],
      "correctIndex": 3
    }
  ]
},
{
  "problemSlug": "remove-duplicates-from-a-list",
  "questions": [
    {
      "text": "removeDuplicates([3, 1, 3, 2, 1]) returns —",
      "options": [
        "[3, 1, 2]",
        "[3, 3, 1, 2]",
        "[1, 2, 3]",
        "[2, 3, 1]"
      ],
      "correctIndex": 0
    },
    {
      "text": "Which structure gives the O(1) duplicate check?",
      "options": [
        "A list",
        "A set",
        "A tuple",
        "A string"
      ],
      "correctIndex": 1
    },
    {
      "text": "Why is list(set(nums)) NOT the answer here?",
      "options": [
        "It is too slow",
        "It destroys the order",
        "It needs an import",
        "It crashes on empty input"
      ],
      "correctIndex": 1
    },
    {
      "text": "removeDuplicates([]) returns —",
      "options": [
        "[]",
        "None",
        "An error",
        "[0]"
      ],
      "correctIndex": 0
    },
    {
      "text": "The seen set contains —",
      "options": [
        "Only the duplicates",
        "Every distinct value seen so far",
        "The original indices",
        "Nothing after the loop"
      ],
      "correctIndex": 1
    }
  ]
},
{
  "problemSlug": "merge-two-dictionaries",
  "questions": [
    {
      "text": "merge({\"a\":1,\"b\":2}, {\"b\":3,\"c\":4}) returns —",
      "options": [
        "{\"a\":1,\"b\":2,\"c\":4}",
        "{\"a\":1,\"b\":3,\"c\":4}",
        "{\"a\":1,\"b\":5,\"c\":4}",
        "An error"
      ],
      "correctIndex": 1
    },
    {
      "text": "Which form MUTATES the first dictionary?",
      "options": [
        "{**d1, **d2}",
        "d1 | d2",
        "d1.update(d2)",
        "None of them"
      ],
      "correctIndex": 2
    },
    {
      "text": "On a conflicting key, which value wins?",
      "options": [
        "The first dictionary's",
        "The second dictionary's",
        "Both (added)",
        "An error is raised"
      ],
      "correctIndex": 1
    },
    {
      "text": "d1.update(d2) returns —",
      "options": [
        "The merged dict",
        "None",
        "d2",
        "A list of keys"
      ],
      "correctIndex": 1
    },
    {
      "text": "merge({\"a\":1}, {\"b\":2}) has how many keys?",
      "options": [
        "1",
        "2",
        "3",
        "An error"
      ],
      "correctIndex": 1
    }
  ]
},
{
  "problemSlug": "union-intersection-of-two-sets",
  "questions": [
    {
      "text": "union({1,2,3}, {3,4}) —",
      "options": [
        "{1, 2, 3, 4}",
        "{1, 2, 3}",
        "{3}",
        "An error"
      ],
      "correctIndex": 0
    },
    {
      "text": "intersection({1,2,3}, {3,4}) —",
      "options": [
        "{1, 2, 3, 4}",
        "{3}",
        "{1, 2}",
        "set()"
      ],
      "correctIndex": 1
    },
    {
      "text": "Which operator gives symmetric difference?",
      "options": [
        "|",
        "&",
        "-",
        "^"
      ],
      "correctIndex": 3
    },
    {
      "text": "{1,2,3} - {2,3} —",
      "options": [
        "{1}",
        "{2, 3}",
        "{1, 2, 3}",
        "{1, 2}"
      ],
      "correctIndex": 0
    },
    {
      "text": "The empty-set result must be returned as —",
      "options": [
        "{}",
        "set()",
        "None",
        "[]"
      ],
      "correctIndex": 1
    }
  ]
}];

/* ================================================================
 * Programming Meta — categories, topics, and companies
 * (type/value pair must be unique — see ProgrammingMeta index)
 * ================================================================ */

const programmingMetaData = [
{
  "type": "category",
  "value": "programming-foundations",
  "label": "Programming Foundations",
  "order": 1
},
{
  "type": "category",
  "value": "oops",
  "label": "OOPs",
  "order": 2
},
{
  "type": "category",
  "value": "data-handling-collections",
  "label": "Data Handling & Collections",
  "order": 3
},
{
  "type": "category",
  "value": "error-handling-file-io",
  "label": "Error Handling & File I/O",
  "order": 4
},
{
  "type": "category",
  "value": "advanced-language-concepts",
  "label": "Advanced Language Concepts",
  "order": 5
},
{
  "type": "category",
  "value": "memory-performance-concurrency",
  "label": "Memory, Performance & Concurrency",
  "order": 6
},
{
  "type": "category",
  "value": "software-design-best-practices",
  "label": "Software Design & Best Practices",
  "order": 7
},
{
  "type": "topic",
  "value": "variables",
  "label": "Variables",
  "order": 1
},
{
  "type": "topic",
  "value": "basics",
  "label": "Basics",
  "order": 2
},
{
  "type": "topic",
  "value": "type-conversion",
  "label": "Type Conversion",
  "order": 3
},
{
  "type": "topic",
  "value": "loops",
  "label": "Loops",
  "order": 4
},
{
  "type": "topic",
  "value": "math",
  "label": "Math",
  "order": 5
},
{
  "type": "topic",
  "value": "conditionals",
  "label": "Conditionals",
  "order": 6
},
{
  "type": "topic",
  "value": "functions",
  "label": "Functions",
  "order": 7
},
{
  "type": "topic",
  "value": "parameters",
  "label": "Parameters",
  "order": 8
},
{
  "type": "company",
  "value": "google",
  "label": "Google",
  "order": 9
},
{
  "type": "company",
  "value": "microsoft",
  "label": "Microsoft",
  "order": 10
},
{
  "type": "company",
  "value": "amazon",
  "label": "Amazon",
  "order": 11
},
{
  "type": "company",
  "value": "meta",
  "label": "Meta",
  "order": 12
}
,
{
  "type": "topic",
  "value": "classes",
  "label": "Classes",
  "order": 8
},
{
  "type": "topic",
  "value": "oop",
  "label": "OOP",
  "order": 9
},
{
  "type": "topic",
  "value": "inheritance",
  "label": "Inheritance",
  "order": 10
},
{
  "type": "topic",
  "value": "encapsulation",
  "label": "Encapsulation",
  "order": 11
},
{
  "type": "topic",
  "value": "abstraction",
  "label": "Abstraction",
  "order": 12
},
{
  "type": "topic",
  "value": "strings",
  "label": "Strings",
  "order": 13
},
{
  "type": "topic",
  "value": "formatting",
  "label": "Formatting",
  "order": 14
},
{
  "type": "topic",
  "value": "lists",
  "label": "Lists",
  "order": 15
},
{
  "type": "topic",
  "value": "dictionaries",
  "label": "Dictionaries",
  "order": 16
},
{
  "type": "topic",
  "value": "sets",
  "label": "Sets",
  "order": 17
}];

/* ================================================================
 * Seed Runner
 * ================================================================ */

export async function runSeed() {
  console.log('[SEED-PROG] Starting programming content seed...');

  /*
   * Clear ONLY the programming collections (+ programming quizzes).
   * Progress, QuizAttempt, and all other subjects' content are
   * deliberately left untouched.
   */
  console.log('[SEED-PROG] Clearing existing programming data...');
  await Promise.all([
    ProgrammingLesson.deleteMany({}),
    ProgrammingSubtopic.deleteMany({}),
    ProgrammingProblem.deleteMany({}),
    ProgrammingMeta.deleteMany({}),
    Quiz.deleteMany({ problemModel: 'ProgrammingProblem' })
  ]);
  console.log('[SEED-PROG] Existing programming data cleared');

  console.log('[SEED-PROG] Seeding programming lessons...');
  await ProgrammingLesson.insertMany(programmingLessons);
  console.log('[SEED-PROG] Seeding programming subtopics...');
  await ProgrammingSubtopic.insertMany(programmingSubtopics);
  console.log('[SEED-PROG] Seeding programming problems...');
  await ProgrammingProblem.insertMany(programmingProblems);
  console.log('[SEED-PROG] Seeding programming meta...');
  await ProgrammingMeta.insertMany(programmingMetaData);

  /* ---- Seed quizzes: problemSlug → ObjectId + problemModel ---- */
  console.log('[SEED-PROG] Seeding programming quizzes...');
  let quizCount = 0;
  for (const quiz of programmingQuizzes) {
    const problem = await ProgrammingProblem.findOne({ slug: quiz.problemSlug });
    if (!problem) {
      console.log('[SEED-PROG] WARNING: quiz skipped — problem not found:', quiz.problemSlug);
      continue;
    }
    await Quiz.create({
      problemId: problem._id,
      problemModel: 'ProgrammingProblem',
      questions: quiz.questions
    });
    quizCount++;
  }
  console.log('[SEED-PROG] Quizzes seeded:', quizCount);

  /* ---- Recount problemCount per lesson (dynamic, like seedAptitudeContent) ---- */
  console.log('[SEED-PROG] Recounting problemCount per lesson...');
  const lessons = await ProgrammingLesson.find({});
  for (const lesson of lessons) {
    const count = await ProgrammingProblem.countDocuments({ lessonSlug: lesson.slug });
    await ProgrammingLesson.updateOne({ _id: lesson._id }, { problemCount: count });
  }
  console.log('[SEED-PROG] problemCount updated dynamically');

  const summary = {
    programming: {
      lessons: programmingLessons.length,
      subtopics: programmingSubtopics.length,
      problems: programmingProblems.length,
      quizzes: quizCount
    },
    meta: {
      programming: programmingMetaData.length
    }
  };

  console.log('[SEED-PROG] Programming content seeded successfully!', summary);
  return summary;
}

/*
 * CLI entry point
 */
const isCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/seedProgrammingContent.js');
if (isCLI) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
      console.log('[SEED-PROG] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[SEED-PROG] Connected to MongoDB');

      await runSeed();

      await mongoose.disconnect();
      console.log('[SEED-PROG] Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('[SEED-PROG] Error seeding database:', error);
      process.exit(1);
    }
  })();
}
