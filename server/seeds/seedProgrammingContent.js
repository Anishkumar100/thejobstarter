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
  "explanation": "## What a Variable Is\n\nThink of a **variable** as a labelled box in your computer's memory. The label is the name (like `score` or `name`), and what is inside the box is the **value** (like `98` or `\"Aarav\"`). Any time you use the name, the computer looks inside the box and hands you the value.\n\n```\nscore = 98            box \"score\" now holds the number 98\nname  = \"Aarav\"       box \"name\" now holds the text \"Aarav\"\n```\n\nThe beauty of a variable: the box can be **re-filled**. Same name, new value:\n\n```\nmarks = 90\nmarks = 95            the box now holds 95 — old value is gone\n```\n\n### The Big Four Data Types\n\n| Type | What it stores | Example values |\n|---|---|---|\n| Integer | Whole numbers (positive, negative, zero) | -3, 0, 42, 999 |\n| Float / Decimal | Numbers with a fractional part | 3.14, -0.5, 99.99 |\n| String | A sequence of text characters | \"Hello\", \"42\" (this is TEXT) |\n| Boolean | Only true or false | true, false |\n\nOne crucial trap: `\"42\"` and `42` are NOT the same. The first is a string (text), the second is a number. You cannot multiply \"42\" — the computer will complain loudly.\n\n### Naming Rules (the interview checklist)\n\n- Names must start with a letter or underscore, never a digit.\n- No spaces — use an underscore: `total_marks` is good, `total marks` is not.\n- Avoid reserved keywords (if, for, while, class) as names.\n- Choose meaningful names: `student_grade` beats `x`.\n\n### Constants — the Locked Box\n\nA **constant** is a variable whose value must never change. By convention it is written in ALL_CAPS so every reader knows: this box is locked.\n\n```\nPI = 3.14159          convention: all caps = constant\nMAX_ATTEMPTS = 3\n```\n\n### Key Takeaway\n\nVariables are labelled memory boxes that hold values and can be re-filled. Every value has a type — integer, float, string, or boolean — and mixing them up (text \"42\" vs number 42) is the #1 beginner bug.",
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
  "explanation": "## What Type Conversion Is\n\nValues carry a type — integer, float, string, boolean. **Type conversion** (also called casting) is changing a value from one type to another: turning the text `\"42\"` into the number `42`, or turning a decimal into a whole number.\n\n```\n\"42\"   -> 42         string to integer\n3.99   -> 3          float to integer (the fraction is CUT OFF, not rounded!)\n42     -> \"42\"       integer to string\n\"abc\"  -> ERROR      cannot convert non-numeric text to a number\n```\n\n### Explicit Conversion — You Give the Order\n\n**Explicit** conversion is when YOU command the change, using built-in conversion functions:\n\n```\nage_text  = \"21\"\nage       = to_integer(age_text)      now age is the NUMBER 21\n\nprice     = 19.99\nprice_tag = to_string(price)          now price_tag is the TEXT \"19.99\"\n\nweight    = 75.8\nwhole_kg  = to_integer(weight)        whole_kg is 75 — the .8 is chopped off\n```\n\n### Implicit Conversion — the Language Decides\n\n**Implicit** conversion happens automatically when the language safely combines two types — usually widening a smaller type so no data is lost:\n\n```\ninteger + float  ->  float        5 + 0.5 becomes 5.5\n```\n\nThe danger: implicit conversion is invisible. The value changes shape behind your back, and if the language tries a conversion it cannot do (like text to number), the program crashes.\n\n### The Classic Input Trap\n\nInput from the keyboard arrives as **text** — always. Beginners forget this and try to do math on it:\n\n```\nn = read_input()          n is the STRING \"12\"\nn = to_integer(n)         NOW n is the number 12 — only then can you add to it\n```\n\nSkipping that conversion line makes `\"12\" + 1` fail with an error instead of giving 13.\n\n### Truncation vs Rounding — Know the Difference\n\n- **Truncate (cut)**: 3.99 -> 3 (the fraction is simply dropped)\n- **Round**: 3.99 -> 4, 3.49 -> 3 (the nearest whole number)\n\nCutting and rounding give different answers! Exams love testing which one you use.\n\n### Key Takeaway\n\nType conversion reshapes a value from one type to another. Explicit conversion is your order; implicit is the language's hidden move. Always convert keyboard input to the right type before doing math, and remember: truncation is NOT rounding.",
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
  "explanation": "## What Operators Are\n\n**Operators** are the verbs of programming — the symbols that tell the computer to do something with values. An **expression** is any combination of values and operators that the computer evaluates down to a single result. `5 + 3` is an expression; its result is `8`.\n\n### The Three Families\n\n**1. Arithmetic — number crunching:**\n\n| Operator | Meaning | Example -> Result |\n|---|---|---|\n| + | Add | 7 + 2 -> 9 |\n| - | Subtract | 7 - 2 -> 5 |\n| * | Multiply | 7 * 2 -> 14 |\n| / | Divide | 7 / 2 -> 3.5 |\n| % | Modulo (remainder) | 7 % 2 -> 1 |\n| ** | Power | 2 ** 3 -> 8 |\n| // | Integer divide (drop fraction) | 7 // 2 -> 3 |\n\n**2. Comparison — true/false questions:**\n\n| Operator | Meaning | Example -> Result |\n|---|---|---|\n| == | Equal to | 5 == 5 -> true |\n| != | Not equal | 5 != 3 -> true |\n| > | Greater than | 7 > 2 -> true |\n| < | Less than | 7 < 2 -> false |\n| >= | Greater or equal | 5 >= 5 -> true |\n| <= | Less or equal | 4 <= 3 -> false |\n\n**3. Logical — combining true/false answers:**\n\n| Operator | Meaning | Example -> Result |\n|---|---|---|\n| AND | Both must be true | true AND false -> false |\n| OR | At least one true | true OR false -> true |\n| NOT | Flip the answer | NOT true -> false |\n\n### The % Operator — the Superstar of Remainders\n\n`%` gives the remainder after division. It doesn't get headlines, but it powers half the interview problems: even/odd checks, digit extraction, and the classic FizzBuzz.\n\n```\n17 % 5  ->  2      (5 goes into 17 three times, leaving 2)\n10 % 5  ->  0      (5 divides 10 exactly — remainder 0)\n7  % 2  ->  1      (odd number -> remainder 1!)\n```\n\n### Operator Precedence — Who Computes First?\n\nExpressions follow a strict order, like arithmetic at school:\n\n1. Parentheses `( )` — always first\n2. `**` Power\n3. `* / % //` (left to right)\n4. `+ -` (left to right)\n5. Comparisons (`< > == ...`)\n6. NOT, then AND, then OR\n\n```\n2 + 3 * 4     = 2 + 12 = 14      (multiplication wins!)\n(2 + 3) * 4   = 5 * 4 = 20       (parentheses override)\n```\n\nWhen in doubt, add parentheses — they make your intent obvious and eliminate guesswork.\n\n### Short-Circuit Logic — the Smart Shortcut\n\nAND and OR are lazy in a good way:\n\n- For `A AND B`: if A is false, the answer is already false — B is never evaluated.\n- For `A OR B`: if A is true, the answer is already true — B is never evaluated.\n\nThis is useful AND it is a classic exam question: \"is B even evaluated?\" — no!\n\n### Key Takeaway\n\nOperators are arithmetic, comparison, and logical verbs; expressions reduce to one result. Master `%` (remainder), respect precedence (parentheses save lives), and remember AND and OR short-circuit.",
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
  "explanation": "## What Conditional Statements Do\n\nPrograms need to make decisions. **Conditional statements** let your code choose a path based on a true/false question — \"Is the student passing?\", \"Is today a weekend?\" — and run different instructions for each answer.\n\n### The Three Building Blocks\n\n**1. If — the single gate:**\n\n```\nif score >= 50:\n    print \"Passed!\"\n```\n\nIf the condition is true, the block runs. If false, the block is skipped entirely.\n\n**2. If / Else — two roads:**\n\n```\nif score >= 50:\n    print \"Passed!\"\nelse:\n    print \"Failed — try again!\"\n```\n\nExactly one branch runs. Always. True runs the first, false runs the second.\n\n**3. If / Else If / Else — a fork with many roads:**\n\n```\nif grade >= 90:\n    print \"A\"\nelse if grade >= 75:\n    print \"B\"\nelse if grade >= 60:\n    print \"C\"\nelse:\n    print \"D\"\n```\n\nThe conditions are checked top-down. The FIRST one that is true wins — the rest are skipped, even if they would also be true. Order matters!\n\n### The Indentation Trap\n\nIn many languages, the indentation (the spaces before the lines) is what tells the computer which statements belong to the if. Change the indentation, change the program's logic:\n\n```\nif score >= 50:          this block is INSIDE the if\n    print \"Passed\"\nprint \"Exam over\"        this runs REGARDLESS of the condition\n```\n\n### Choosing the Right Condition — the Negation Flip\n\nAny condition can be flipped with NOT, but the flipped version is usually harder to read. Prefer the positive phrasing:\n\n```\nif not (score < 50):      correct but confusing\nif score >= 50:           same result, much clearer\n```\n\n### Nested Ifs — If Inside If\n\nAn if inside an if lets you check a second condition only after the first passes:\n\n```\nif is_logged_in:\n    if is_admin:\n        print \"Welcome, admin\"\n    else:\n        print \"Welcome, user\"\nelse:\n    print \"Please log in\"\n```\n\nNesting is fine, but 3+ levels deep becomes hard to read — prefer combining conditions with AND/OR when possible.\n\n### The Vowel-Counting Preview\n\nCounting vowels is a decision problem: for each character, ask \"is it one of the vowels?\" — an if per character inside a loop. You will meet it in the Strings lesson.\n\n### Key Takeaway\n\nConditionals run code only when a condition is true. Use if / else-if / else for multi-way forks, check conditions top-down, keep indentation honest, and prefer clear positive conditions over NOT-twisted ones.",
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
  "explanation": "## What Loops Are\n\nA **loop** repeats a block of code — once per item, or until a condition flips. Instead of writing the same instructions 10 times, write them once and let the loop do the counting. Loops are the engine of every bulk operation: processing lists, validating inputs, printing tables.\n\n### The Two Loop Families\n\n**1. While — \"keep going WHILE this is true\":**\n\n```\ncount = 1\nwhile count <= 5:\n    print count\n    count = count + 1\n```\n\nOutput: 1 2 3 4 5\n\nThe condition is checked BEFORE every run. If it starts false, the body never runs even once.\n\n**2. For — \"for each item, do this\":**\n\n```\nfor i from 1 to 5:            for each number 1 through 5\n    print i\n\nfor char in \"Aarav\":          for each character in the string\n    print char\n```\n\nThe for loop handles the counting itself — no manual increment, no \"forgot to add 1\" infinite-loop bugs.\n\n### The Three Parts of a While Loop (memorise this)\n\nEvery while loop needs a **start**, a **condition**, and an **update**:\n\n```\ncount = 1            START: where we begin\nwhile count <= 5:    CONDITION: keep going while true\n    print count\n    count = count + 1    UPDATE: move toward stopping\n```\n\nForget the update line and the condition never becomes false -> **infinite loop** -> your program hangs. The classic beginner catastrophe.\n\n### Loop Patterns That Reappear Everywhere\n\n**Accumulator — sum up a series:**\n\n```\ntotal = 0\nfor i from 1 to 10:\n    total = total + i\nprint total            55\n```\n\n**Counter — count matches:**\n\n```\nvowels = 0\nfor char in \"Aarav\":\n    if char is a vowel:\n        vowels = vowels + 1\nprint vowels            3\n```\n\n**Finding — search for something:**\n\n```\nfor score in scores:\n    if score > best_so_far:\n        best_so_far = score\n```\n\n### Loop Inside Loop — the Nested Pattern\n\nA loop inside a loop runs the inner loop fully for EVERY run of the outer loop (that's multiplication, not addition):\n\n```\nfor row from 1 to 3:\n    for col from 1 to 3:\n        print \"*\"\n    print newline\n\nOutput:\n***\n***\n***\n```\n\n### Key Takeaway\n\nWhile loops repeat until a condition flips; for loops repeat per item. Always manage START, CONDITION, UPDATE to avoid infinite loops. Accumulate, count, and find inside loops — these three patterns solve most beginner problems.",
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
  "explanation": "## What Loop Control Is\n\nSometimes a loop needs to change its course mid-run — skip this item, bail out early, or stop everything. **Loop control** statements are the steering wheel: `break` (emergency exit), `continue` (skip ahead), and `return` (leave the whole function).\n\n### Break — The Emergency Exit\n\n`break` instantly ends the loop, jumping to the first line after it. Everything between break and the loop's end is abandoned.\n\n```\nfor i from 1 to 10:\n    if i == 5:\n        break            stop the loop right here\n    print i\n\nOutput: 1 2 3 4           5, 6, 7... never printed\n```\n\nClassic use: **searching** — the moment you find what you need, stop scanning the rest:\n\n```\nfor student in students:\n    if student.name == \"Aarav\":\n        print \"Found!\"\n        break              no point checking anyone else\n```\n\n### Continue — The Skip Button\n\n`continue` skips the REST of the current round and jumps straight to the next one. The loop keeps running — it just ignores this particular item.\n\n```\nfor i from 1 to 5:\n    if i == 3:\n        continue           skip 3 entirely\n    print i\n\nOutput: 1 2 4 5             3 is missing, loop never stopped\n```\n\nClassic use: **filtering** — process only the items that pass a check:\n\n```\nfor num in numbers:\n    if num < 0:\n        continue           ignore negatives\n    total = total + num\n```\n\n### Break vs Continue — the Memory Trick\n\n- **break** = Break the whole loop (door slams shut)\n- **continue** = Continue with the NEXT item (skips one step, keeps walking)\n\n| Situation | What happens | Remaining items? |\n|---|---|---|\n| break on 3 | loop ends | never processed |\n| continue on 3 | 3 skipped, 4 and 5 processed | all others processed |\n\n### Return — The Exit From Everything\n\n`return` doesn't just stop the loop — it exits the ENTIRE function immediately, carrying a value back to the caller. This is the cleanest way to \"find and go\":\n\n```\nfunction find_score(students, target_name):\n    for student in students:\n        if student.name == target_name:\n            return student.score      found it — leave now\n    return -1                          searched everything, not found\n```\n\n### The Infinite Loop Rescue\n\nLoop control is your rescue tool when a loop goes wrong:\n\n```\ncount = 1\nwhile true:              dangerous — never ends on its own!\n    print count\n    count = count + 1\n    if count > 1000:\n        break            safe exit when we've had enough\n```\n\n### The Elegant Rule\n\nIf you find yourself using flags like `found = true` just to break out of two loops at once, a `return` inside a function is usually cleaner. Fewer flags = fewer bugs.\n\n### Key Takeaway\n\nbreak ends the loop now; continue skips only the current item; return leaves the whole function. Use break for search-and-stop, continue for filter-and-skip, and return to exit cleanly with a result.",
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
  "explanation": "## What a Function Is\n\nA **function** is a named, reusable block of code. You write the instructions ONCE, give them a name, and then \"call\" the name whenever you need that behaviour. Think of it as a mini-machine: you feed it inputs, it does its job, and it hands back a result.\n\n```\nfunction greet():\n    print \"Hello, welcome!\"\n\ngreet()      call the machine — prints \"Hello, welcome!\"\ngreet()      call it again — prints it again\n```\n\n### Why Functions Are the Backbone of Code\n\n- **Reuse** — write once, call a hundred times. No copy-pasting.\n- **Readability** — `calculate_grade()` reads better than 20 lines of grading logic.\n- **Testing** — a small function is easy to test in isolation.\n- **Fixing** — fix a bug in one place, every call is fixed.\n\n### The Two Phases of Every Function\n\n**1. Definition** — writing the machine. Nothing runs yet:\n\n```\nfunction welcome(name):\n    print \"Hello, \" + name\n```\n\n**2. Call** — running the machine. The function executes:\n\n```\nwelcome(\"Aarav\")       prints \"Hello, Aarav\"\nwelcome(\"Priya\")       prints \"Hello, Priya\"\n```\n\nA defined-but-never-called function is a machine that exists but is never switched on.\n\n### The Anatomy of a Function\n\n```\nfunction average(a, b):      function keyword, name, parameters\n    sum = a + b              body — the instructions (indented!)\n    return sum / 2           return — hand the result back\n```\n\n- **Name** — a verb that describes the action (calculate_total, is_even)\n- **Parameters** — the inputs the function expects\n- **Body** — the instructions, indented to show they belong to the function\n- **Return value** — the output handed back (optional)\n\n### The Side-Effect Trap\n\nA function can do two kinds of things:\n\n- **Return a value** — `result = average(10, 20)` (result gets 15)\n- **Cause a side effect** — printing, writing a file, updating a screen\n\nThe classic trap: calling a function that RETURNS a value but forgetting to store it:\n\n```\naverage(10, 20)        the result 15 is computed... and thrown away\n```\n\n### Functions Should Do ONE Job\n\nA function that both calculates and prints and saves is a jack-of-all-trades that's hard to test and reuse. Split it:\n\n```\nfunction average(a, b):        pure: takes inputs, returns a result\n    return (a + b) / 2\n\nfunction report(a, b):         uses the pure function, handles output\n    result = average(a, b)\n    print \"Average is \" + result\n```\n\n### Key Takeaway\n\nFunctions are named, reusable machines: define once, call many times. They take inputs (parameters) and hand back outputs (return values). Store returned values, keep side effects in check, and give each function one clear job.",
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
  "explanation": "## What Parameters and Return Values Are\n\nParameters and return values are how functions TALK to the rest of the program. **Parameters** are the inputs you hand in; the **return value** is the output the function hands back. Without them, every function would be an island.\n\n### Parameters — The Input Doors\n\nA **parameter** is a placeholder for a value the caller will supply. When you call the function, you pass **arguments** — the actual values that fill the placeholders.\n\n```\nfunction double(number):        \"number\" is the parameter (placeholder)\n    return number * 2\n\nresult = double(5)             5 is the argument (real value)\nprint result                    10\n```\n\nThe magic: the SAME function works with any value. `double(5)` -> 10, `double(100)` -> 200. One machine, unlimited inputs.\n\n### Multiple Parameters — Several Input Doors\n\n```\nfunction rectangle_area(length, width):\n    return length * width\n\nrectangle_area(4, 5)          returns 20\n```\n\n**Order matters.** The first argument fills the first parameter, the second fills the second. Pass them wrong and you get nonsense results.\n\n### Default Values — The Optional Inputs\n\nA parameter can have a **default value**: if the caller says nothing, the default is used. This is exactly what the \"Function with Default Arguments\" problem in this lesson explores.\n\n```\nfunction greet(name, greeting = \"Hello\"):\n    print greeting + \", \" + name\n\ngreet(\"Aarav\")                prints \"Hello, Aarav\"   (default used)\ngreet(\"Priya\", \"Namaste\")     prints \"Namaste, Priya\" (caller's choice)\n```\n\nDefaults make functions friendly: the caller can pass everything or pass just the essentials.\n\n### Return Values — The Output Door\n\n`return` does two jobs: it produces the function's result AND it stops the function instantly. Code after a return never runs.\n\n```\nfunction check(score):\n    if score >= 50:\n        return \"Pass\"\n    return \"Fail\"             no else needed — first return already left\n\nprint check(70)               \"Pass\"\n```\n\n### No Return? Then the Function Returns Nothing\n\nFunctions without a `return` still \"return\" — they hand back nothing (often called null or none). This is the silent killer:\n\n```\nfunction show_sum(a, b):\n    print a + b               prints, but returns NOTHING\n\nresult = show_sum(2, 3)       result is \"nothing\", not 5!\n```\n\n### The Golden Chain — Reusing Functions\n\nFunctions can call other functions. Small functions build big behaviour:\n\n```\nfunction add(a, b):\n    return a + b\n\nfunction total(list):\n    sum = 0\n    for value in list:\n        sum = add(sum, value)     reuse add inside total\n    return sum\n```\n\n### Key Takeaway\n\nParameters are the inputs a function receives; return values are what it hands back. Arguments must match parameters in order, defaults make inputs optional, and a function without return hands back nothing — store that returned value or it's lost forever.",
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
  "explanation": "## What Variable Scope Is\n\n**Scope** answers one question: \"Where is this variable visible?\" A variable created inside a function exists only inside that function. A variable created at the top level exists everywhere. Mixing these up is the source of some of the most confusing bugs in programming.\n\n### Local Scope — The Function's Private Room\n\nA variable created inside a function is **local**: it lives while the function runs, and is destroyed when the function ends. No other function can see it.\n\n```\nfunction calculate():\n    temp = 10              temp is LOCAL — private to calculate\n    return temp * 2\n\nprint temp                 ERROR! temp doesn't exist out here\n```\n\n### Global Scope — The Shared Lounge\n\nA variable created outside any function is **global**: visible to every function in the file.\n\n```\napp_name = \"MyApp\"         global — everyone can see it\n\nfunction show():\n    print app_name         works fine, globals are visible inside\n```\n\n### The Shadowing Trap — Same Name, Two Boxes\n\nIf you create a local variable with the same name as a global, the local one **shadows** (hides) the global — inside the function, your new local box is used; the global box is untouched.\n\n```\ncount = 100                global count\n\nfunction see():\n    print count            prints 100 — global still intact\n```\n\nReading a global inside a function is fine. But trying to REASSIGN it is the classic confusion — languages have special keywords (like `global`) to say \"I mean the global one\".\n\n### The Memory Trick\n\n| Where declared | Scope | Who can see it |\n|---|---|---|\n| Inside a function | Local | Only that function |\n| Outside all functions | Global | Everyone |\n\n### Why Scope Is a Feature, Not a Nuisance\n\n- **Isolation** — two functions can each use `temp` without colliding.\n- **Safety** — locals can't be corrupted by accident from other code.\n- **Clarity** — you can SEE a global in the file; a local stays hidden in its function.\n\nBest practice: keep variables as **local as possible**. Fewer globals = fewer surprises.\n\n### The Lifetime Difference\n\nLocals are born when the function runs and die when it ends. Globals are born when the program starts and live until it exits. That's why heavy global use makes state hard to track.\n\n### Key Takeaway\n\nScope decides where a variable is visible: locals are private to their function, globals are visible everywhere. Local shadows global when names clash, and keeping variables local is the discipline that keeps large programs predictable.",
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
  "explanation": "## What a Class Is\n\nA **class** is a blueprint for creating objects. It describes what data an object holds (its **attributes**) and what it can do (its **methods**) — but the blueprint itself is not an object. You can't live in a blueprint; you need a house built from it.\n\n```\nclass Student:                       the blueprint\n    name = \"\"                        attributes: what a student HAS\n    grade = 0\n\n    function introduce():            methods: what a student DOES\n        print \"I am \" + name\n```\n\n### Class vs Object — the Blueprint Analogy\n\n| | Blueprint (Class) | House (Object) |\n|---|---|---|\n| What it is | The template | A real instance built from it |\n| How many | One | Many — each independent |\n| Example | Student | Aarav, Priya, Rohan |\n\n```\na = Student()               build object #1 from the blueprint\nb = Student()               build object #2 — separate, independent\n\na.name = \"Aarav\"            Aarav's name — b is not affected\nb.name = \"Priya\"            b has her own name\n```\n\nObjects built from the same class share the SHAPE but not the DATA. Each object carries its own copy of the attributes.\n\n### Attributes — What Objects Have\n\nAttributes are the data fields an object holds — the nouns of the system:\n\n- A Student: name, roll_number, grade\n- A BankAccount: account_number, balance, owner\n- A Car: model, speed, fuel_level\n\n```\naccount = BankAccount()\naccount.balance = 5000         set an attribute\nprint account.balance          read it back — 5000\n```\n\n### Methods — What Objects Do\n\nMethods are functions attached to the class — the verbs of the system. They usually work with the object's own attributes:\n\n```\nclass BankAccount:\n    balance = 0\n\n    function deposit(amount):      a method\n        balance = balance + amount      method uses its own data\n```\n\n### The `self` Question — \"Whose Data Am I Touching?\"\n\nA method needs to know WHICH object called it — Aarav's introduce() or Priya's? Languages handle this with an implicit reference (often called self or this) that the language fills in automatically:\n\n```\na.introduce()      behind the scenes: introduce(a) — self = a\n```\n\nYou write the method once, but it always knows which object's data to use.\n\n### Why Classes Matter\n\nClasses bundle **data + behaviour** into one package — that's the heart of object-oriented thinking. Instead of scattered variables and functions, you get a self-contained unit: a BankAccount that knows its own balance AND how to deposit.\n\n### Key Takeaway\n\nA class is a reusable blueprint; objects are the real things built from it, each with its own data. Attributes are what an object HAS, methods are what it DOES, and the self-reference is how a method knows whose data to touch.",
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
  "explanation": "## What a Constructor Is\n\nA **constructor** is a special method that runs automatically the moment an object is born. Its job: set up the object with its initial data so the object is never half-ready. No constructor means an empty shell you must fill manually; with one, the object arrives fully formed.\n\n```\nclass Student:\n    function __init__(name, grade):      the constructor\n        this.name = name                 set up the object NOW\n        this.grade = grade\n\na = Student(\"Aarav\", 90)                 constructor runs automatically\n```\n\n### Without a Constructor — the Half-Made Object\n\n```\nclass Student:\n    name = \"\"           empty default\n\na = Student()           object born with NO data\na.name = \"Aarav\"        you must remember to fill it — easy to forget\n```\n\nThe danger: someone creates a Student and forgets to set the name. The object exists in a broken, half-finished state. Constructors exist to make that impossible.\n\n### Instance Variables — Data That Belongs to ONE Object\n\n**Instance variables** are attributes that live inside a specific object, not the class as a whole. Each object gets its own copy:\n\n```\na = Student(\"Aarav\", 90)\nb = Student(\"Priya\", 85)\n\na.name is \"Aarav\"      a's private copy\nb.name is \"Priya\"      b's private copy — independent\n```\n\nThis is why two Students can hold different names with one class: the blueprint is shared, the instance variables are personal.\n\n### The Constructor Signature — Parameters Become Data\n\nThe constructor's parameters are the \"order form\" for the new object. Whatever you pass when creating the object flows into the instance variables:\n\n```\nStudent(\"Aarav\", 90)    name gets \"Aarav\", grade gets 90\nStudent(\"Priya\", 85)    name gets \"Priya\", grade gets 85\n```\n\nSame class, different objects, each with its own state — the constructor makes it happen.\n\n### Default Values — Safe Construction\n\nConstructors can also use default values so that even a \"bare\" construction yields a valid object:\n\n```\nclass BankAccount:\n    function __init__(owner, balance = 0):\n        this.owner = owner\n        this.balance = balance      sensible starting balance\n\nnew_account = BankAccount(\"Aarav\")        balance starts at 0 — safe\n```\n\n### The Birth Ritual in Three Steps\n\n1. **Allocate** — memory is set aside for the object\n2. **Initialize** — the constructor runs, setting instance variables\n3. **Return** — the ready-to-use object is handed back\n\nEvery object you ever create passes through this ritual. The constructor is step 2 — and the only step you control.\n\n### Key Takeaway\n\nThe constructor is the automatic birth-setup of an object: it turns constructor parameters into instance variables so no object is ever half-made. Instance variables are per-object data, and defaults keep construction safe even with missing arguments.",
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
  "explanation": "## What Methods Are\n\n**Methods** are functions that belong to a class — the behaviours an object can perform. While instance variables say what an object HAS, methods say what an object CAN DO. A BankAccount has a balance; it can deposit, withdraw, and check its balance.\n\n### Methods vs Plain Functions\n\n| | Function | Method |\n|---|---|---|\n| Where it lives | Standalone | Inside a class |\n| What it knows | Nothing extra | Its own object's data |\n| How it's called | calculate(5) | account.calculate(5) |\n\nThe method's superpower: it reaches the object's own attributes automatically. The function has to be handed everything; the method already knows its object.\n\n### The Anatomy of a Method\n\n```\nclass BankAccount:\n    balance = 0\n\n    function deposit(amount):        a method — acts on THIS account\n        balance = balance + amount\n```\n\nNotice the method refers to `balance` directly. It knows which balance to touch because it belongs to a specific object.\n\n### Method Types — the Menu\n\n- **Instance methods** — the workhorses. They act on one object's data:\n\n```\naccount.deposit(100)          acts on THIS account\n```\n\n- **Class methods** — operate on the class level, not one object:\n\n```\nfunction total_accounts():\n    count all instances ever created\n```\n\n- **Static/helper methods** — utilities that don't need object data at all.\n\n### Method Naming\n\nMethods describe actions — name them accordingly:\n\n- `deposit()`, `calculate_total()`, `is_valid()`  (good)\n- `stuff()`, `do_thing()`                       (bad)\n\nNames that read like questions (is_valid, has_funds) return true/false by convention.\n\n### The Encapsulation Preview\n\nMethods are the GUARDS of the object's data. Instead of letting any code directly poke `balance`, route changes through methods that can enforce rules:\n\n```\naccount.balance = 999999        BAD — bypasses all rules\n\naccount.withdraw(999999)        GOOD — method checks if you even have that much\n```\n\nThis is the seed of encapsulation — you'll master it in the Encapsulation, a full lesson.\n\n### Key Takeaway\n\nMethods are functions that belong to a class and act on an object's own data. Name them as actions, and deliberately route data changes through them — that's the doorway to encapsulation, and the pattern behind the BankAccount and Shape problems.",
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
  "explanation": "## What Inheritance Is\n\n**Inheritance** lets one class (the child) borrow the attributes and methods of another (the parent), then add its own extras. The child IS-A specialised version of the parent. A Dog is an Animal. A SavingsAccount is a BankAccount.\n\n```\nclass Animal:                      the PARENT (base class)\n    name = \"\"\n\n    function eat():\n        print \"nom nom\"\n\nclass Dog extends Animal:          the CHILD — inherits everything\n    function bark():\n        print \"Woof!\"\n```\n\nThe Dog automatically has name and eat() — no copying needed. It only writes the NEW parts: bark().\n\n### The Is-A Test\n\nAsk: \"Is a child a kind of parent?\" If yes, inheritance fits.\n\n- A Dog IS an Animal (yes)\n- A Car IS a Vehicle (yes)\n- A Rectangle IS a Shape (yes)\n\nIf the answer is \"has-a\" instead of \"is-a\", you want composition, not inheritance. A Car HAS an Engine; it is not an Engine.\n\n### Why Inherit — the Three Payoffs\n\n1. **Reuse** — write eat() once; every child gets it free.\n2. **Consistency** — all children share the parent's behaviour; no drift.\n3. **Extensibility** — add a new child (Cat, Bird) without touching existing code.\n\n### The Parent-Child Hierarchy\n\nInheritance chains can go deeper — a child can itself be a parent:\n\n```\nAnimal  ->  Dog  ->  Puppy  (each level inherits everything above it)\n```\n\nEvery object in the chain gets everything above it. Add Animal's methods low in the chain, and every descendant has them.\n\n### What the Child Can Add\n\n```\nclass Dog extends Animal:\n    function bark(): ...     add NEW method\n    tail_length = 5          add NEW attribute\n```\n\nThe child inherits the parent's world and extends it. That's the whole trick of reuse.\n\n### Key Takeaway\n\nInheritance = one class extends another: child inherits parent attributes and methods, then adds extras. It only makes sense when the child IS-A parent. The relationship is one-directional — the parent (base) is on top.",
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
  "explanation": "## Method Overriding\n\n**Method overriding** is when a child class RE-writes a method it inherited from the parent — same name, same argument list, but a NEW body. The child says: \"I have a version of my own.\"\n\n### The Signature Rule\n\nTo override, the child method must have exactly the same combination of name and parameter types as the parent's.\n\n```\nclass Animal:\n    function sound():\n        print \"Some animal sound\"\n\nclass Dog extends Animal:\n    function sound():        override it (same name, same list)\n        print \"Woof!\"\n```\n\n### Compare: Overriding vs Overloading\n\nDo NOT confuse override with **overloading** (two methods same name but different parameters):\n\n| | Overriding | Overloading |\n|---|---|---|\n| Where | Child's own version | Several versions in the SAME class |\n| Required | Different behaviour | Extra variant (params) |\n| How selected | Runtime name + type | Signature match |\n\n### Polymorphism example\nOne supervisory method works on both, because children honour the same name:\n\n```\nfunction make_any_sound(animal):\n    animal.sound()     # runtime decides which version\n\nmake_any_sound(Dog())  -> \"Woof!\"\n```\n\n### Calling the Parent — the `super` Keyword\n\nSometimes the child wants its own version PLUS the parent's original behaviour. The `super` reference gives access to the parent's method:\n\n```\nclass Dog extends Animal:\n    function sound():\n        super.sound()      # parent's version first, if useful\n        print \"Woof!\"      # then the child's extra line\n```\n\n### Key Takeaway\n\nOverriding is a child's new version of an inherited method — same name and parameters, new body, chosen at runtime by the object's real type. Do not confuse it with overloading (several same-name methods differing by parameters in the SAME class).",
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
  "explanation": "## What Polymorphism Is\n\n**Polymorphism** means \"many forms\" — the ability of the same method call to behave differently depending on which object receives it. One word: `area()`. Many behaviours: circle area, rectangle area, triangle area.\n\n```\nshapes = [Circle(radius 5), Rectangle(4, 6), Triangle(3, 4)]\n\nfor shape in shapes:\n    print shape.area()      same call, different answers\n\nCircle: 78.5\nRectangle: 24\nTriangle: 6\n```\n\n### The Two Faces of Polymorphism\n\n**1. Runtime polymorphism (via overriding)** — the object's real type decides which method runs:\n\n```\nclass Shape:\n    function area():  return 0\n\nclass Circle extends Shape:\n    function area():  return 3.14 * r * r     override\n\nc = Circle(...)\nprint c.area()        Circle's version runs\n```\n\n**2. Compile-time polymorphism (via overloading)** — the same name with different parameter lists; the call's arguments pick the version:\n\n```\nfunction area(side)              square\nfunction area(length, width)     rectangle\n```\n\n### Why the Same Call Works — the Contract\n\nPolymorphism works because every child honours the parent's promise: \"every Shape can compute an area\". The caller trusts the CONTRACT, not the details:\n\n```\nfunction print_area(shape):     works for ANY shape!\n    print \"Area: \" + shape.area()\n\nprint_area(Circle(...))         78.5\nprint_area(Rectangle(...))      24\n```\n\nWrite the function once, feed it any shape. Add a new shape tomorrow — the function still works. Zero changes. That's the superpower.\n\n### The Shapes Hierarchy in Action\n\nThe class hierarchy problem becomes elegant with polymorphism:\n\n```\nfunction print_all(shapes):\n    for shape in shapes:\n        print shape.area()      circle, rectangle, triangle — one line\n        print shape.perimeter()     even this dispatches correctly\n```\n\n### Polymorphism Without Inheritance? — Interfaces\n\nSome languages allow polymorphism through **interfaces** — contracts without inheritance. Any class that implements the interface can be treated the same way, even if they share no parent. (More in the Abstract Classes & Interfaces subtopic.)\n\n### The Interview One-Liner\n\n> \"Polymorphism lets the same method call behave differently based on the object receiving it — achieved through overriding at runtime or overloading at compile time.\"\n\n### Key Takeaway\n\nPolymorphism is \"one call, many forms\": the object decides what happens. Runtime polymorphism rides on overriding, compile-time rides on overloading, and the payoff is code written against a contract that works for every type — past, present, and future.",
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
  "explanation": "## What Access Modifiers Are\n\n**Access modifiers** are keywords that control WHO can touch a class member (an attribute or a method): only the class itself, its children, or the whole world. They are the locks on your code's doors — and the foundation of encapsulation.\n\n### The Three Standard Locks\n\n**1. Public — the open door (everyone can use it)**\n\n```\nclass Student:\n    public name                 visible everywhere\n    public function show(): ...\n```\n\nPublic members are the class's public interface — what the outside world is allowed to use.\n\n**2. Private — the locked vault (only this class)**\n\n```\nclass BankAccount:\n    private balance             only BankAccount methods can touch it\n\n    public function deposit(x):\n        balance = balance + x   allowed — we're INSIDE the class\n```\n\n`account.balance = 999999` from outside -> ERROR. The vault is locked.\n\n**3. Protected — the family circle (class + its children)**\n\n```\nclass Animal:\n    protected lifespan           animals and their children can see it\n\nclass Dog extends Animal:\n    function show(): print lifespan    allowed — Dog is family\n```\n\n### The Visibility Ladder\n\n```\npublic      -> everyone\nprotected   -> the class + its subclasses\nprivate     -> only the class itself\n```\n\nLeast restrictive to most restrictive. Defaults vary by language (many default to public if you say nothing — a common source of bugs).\n\n### Why Locking Things Down Matters\n\n- **Safety** — outsiders can't corrupt the object's data (nobody sets balance to -50000)\n- **Control** — every change goes through the methods you designed, where rules live\n- **Contract** — public members are the promise; private ones are implementation you can change freely without breaking users\n\n### The Rule of Thumb for Interviews\n\n> \"Make attributes private; expose behaviour through public methods.\"\n\nIf an attribute must be readable/writable from outside, route it through accessor methods (getters/setters — the next subtopic). The outside world needs deposit() and get_balance(), not a raw balance it can wreck.\n\n### Access Modifiers Across Languages\n\nSame idea, different keywords: some languages have public/private/protected; others use a leading underscore as a private convention. The CONCEPT is identical: control visibility, protect state.\n\n### Key Takeaway\n\nAccess modifiers are the locks on class members: public for the world, protected for the family, private for the class alone. Default to private attributes + public methods — that discipline IS encapsulation.",
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
  "explanation": "## What Encapsulation Is\n\n**Encapsulation** bundles data (attributes) and behaviour (methods) into one class AND protects the data behind controlled methods. Two ideas in one word: \"package it together\" and \"lock the data, open the doors you choose\".\n\n```\nclass BankAccount:\n    private balance = 0                    data is LOCKED\n\n    public function deposit(amount):       only door to change it\n        if amount > 0:\n            balance = balance + amount\n            return true\n        return false\n\n    public function get_balance():         read-only door\n        return balance\n```\n\nFrom outside: `account.get_balance()` works, `account.deposit(100)` works, but `account.balance = -500` is DENIED.\n\n### The Two Pillars\n\n**Pillar 1 — Bundling:** data and its operations live together. Balance + deposit/withdraw = one self-contained unit.\n\n**Pillar 2 — Hiding:** private data can't be touched directly. Outsiders must go through public methods — where your rules live.\n\n### The Danger Encapsulation Prevents\n\n```\n# WITHOUT encapsulation — anything goes:\naccount.balance = -1000        a negative balance! nonsense state\n\n# WITH encapsulation — the rules hold:\naccount.withdraw(1000)         method checks: you don't have that much -> refused\n```\n\nRaw data is chaos; guarded data is order. The withdraw method REJECTS invalid operations instead of letting them happen.\n\n### Getters and Setters — the Guarded Doors\n\nThe standard pattern: private attributes + public accessor methods.\n\n```\nclass Student:\n    private grade = 0\n\n    public function get_grade():       getter — READ\n        return grade\n\n    public function set_grade(g):      setter — WRITE with validation\n        if g >= 0 and g <= 100:\n            grade = g\n        else:\n            print \"Invalid grade!\"     nonsense values bounced back\n```\n\nThe setter is where validation lives. Without it, grade could be 500 or -3.\n\n### Validation — the Setter's Real Job\n\nSetters aren't ceremony — they enforce invariants (truths the object must always hold):\n\n- grade must be between 0 and 100\n- balance must never go negative\n- email must contain \"@\"\n\nThe moment invalid data is rejected, a whole family of bugs disappears.\n\n### Encapsulation in the \"Encapsulation in a Class\" Problem\n\nThe lesson's problem builds exactly this: a class where the attribute is private, changes flow through a validating setter, and reads go through a getter. If you can build that from scratch, you understand the pillar.\n\n### Key Takeaway\n\nEncapsulation = bundle data + behaviour into a class, then hide the data behind public methods. Private attributes plus getters and setters (with validation) keep every object in a valid state — the heart of clean, safe object-oriented design.",
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
  "explanation": "## What Abstract Classes and Interfaces Are\n\nSome classes are too vague to exist as real objects. You can't \"create\" a Shape — what shape? Circle? Rectangle? The **abstract class** says: \"I define the contract; my children fill in the details.\"\n\n```\nabstract class Shape:\n    abstract function area()         no body — just the contract\n\nclass Circle extends Shape:\n    function area():                 MUST provide the body\n        return 3.14 * radius * radius\n```\n\n### Abstract Class vs Concrete Class\n\n| | Concrete class | Abstract class |\n|---|---|---|\n| Can create objects? | Yes | NO — it's a template |\n| Has method bodies? | All | Mostly, but at least one abstract |\n| Purpose | Usable objects | Define the contract for children |\n\n### The Abstract Method Rule\n\nAn **abstract method** has a signature but NO body. Any child must implement it:\n\n```\nabstract class Animal:\n    abstract function make_sound()       no body here\n\nclass Dog extends Animal:\n    function make_sound():               dog MUST write this\n        print \"Woof!\"\n```\n\nForget to implement it and the child class itself becomes abstract — you can't create objects from it.\n\n### What an Interface Is\n\nAn **interface** is a 100% abstract contract: only method signatures, zero implementation. A class \"implements\" an interface, promising to provide every listed method.\n\n```\ninterface Drawable:\n    function draw()\n\nclass Circle implements Drawable:\n    function draw():            must exist, or the class is incomplete\n        print \"Drawing a circle\"\n```\n\n### Abstract Class vs Interface — the Exam Table\n\n| | Abstract class | Interface |\n|---|---|---|\n| Can have concrete methods? | Yes | No — signatures only |\n| Can have attributes? | Yes | Usually no (constants maybe) |\n| Can be multiple-inherited? | No | Yes (implement several) |\n| IS-A relationship | Strong | Capability relationship |\n\nRemember: **a class CAN implement many interfaces but extends only ONE (abstract) class.** Capabilities (\"can draw\") vs identity (\"is a shape\").\n\n### The Shape Connection\n\nThe \"Abstract Base Class Example\" problem uses exactly this: a Shape base with an abstract area() (and maybe perimeter()), with Circle/Rectangle providing the real formulas. The abstract class guarantees every shape HAS an area — the exact contract polymorphism needs.\n\n### Key Takeaway\n\nAbstract classes define contracts with partial implementation; interfaces define pure contracts. Abstract methods must be implemented by children. Use abstract classes for strong IS-A identity, interfaces for capabilities — and never create objects from abstract classes or interfaces.",
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
  "explanation": "## What a String Is\n\nA **string** is a sequence of characters — letters, digits, spaces, punctuation — treated as ONE value. \"Hello\", \"Aarav\", even \"42\" (that's text, not a number!) and \"\" (the empty string).\n\n### The Golden Rule: Strings Are Immutable\n\n> **You cannot change a string.** Every \"edit\" actually builds a BRAND-NEW string and discards the old one.\n\n```\nword = \"cat\"\nword[0] = \"r\"          ERROR — strings cannot be modified in place\n\nword = \"r\" + word[1:]  CORRECT — builds a NEW string \"rat\"\n```\n\nThis is the #1 exam trap. `to_uppercase(s)` doesn't \"change s\" — it *returns* a new string:\n\n```\ns = \"hello\"\nupper = to_uppercase(s)      s is STILL \"hello\"\ns = upper                    only now does s point at the new string\n```\n\n### Indexing — Positions Start at Zero\n\nCharacters are numbered from 0; negative indices count from the end:\n\n```\n\"  A  a  r  a  v  \"\n   0  1  2  3  4\n  -5 -4 -3 -2 -1\n```\n\n```\ns = \"Aarav\"\ns[0]      -> 'A'       first character\ns[-1]     -> 'v'       last character\ns[1:4]    -> 'ara'     SLICE: start included, end EXCLUDED\ns[::-1]   -> 'varaA'   the reversal trick\n```\n\nSlicing is half-open: `s[a:b]` gives positions a through b-1. Memorise \"end excluded\" — it's behind every off-by-one slicing bug.\n\n### The Workhorse Methods (memorise these 10)\n\n| Operation | What it does | Example -> Result |\n|---|---|---|\n| length(s) | Number of characters | length(\"Aarav\") -> 5 |\n| to_uppercase / to_lowercase | Case conversion (new string) | to_lowercase(\"HELLO\") -> \"hello\" |\n| strip(s) | Remove surrounding whitespace | strip(\"  hi  \") -> \"hi\" |\n| split(s, sep) | Split into parts | split(\"a,b,c\", \",\") -> [a, b, c] |\n| join(list, sep) | Join parts into one string | join([a, b], \"-\") -> \"a-b\" |\n| replace(s, old, new) | Substitute text | replace(\"cat\", \"c\", \"r\") -> \"rat\" |\n| find(s, sub) | Position of first occurrence | find(\"Aarav\", \"ra\") -> 1 |\n| count(s, sub) | How many occurrences | count(\"banana\", \"na\") -> 2 |\n| startswith / endswith | Prefix/suffix test | startswith(\"cat\", \"ca\") -> true |\n| is_digit(s) | All characters digits? | is_digit(\"123\") -> true |\n\n### The Immutability Consequence\n\nSince strings can't change, EVERY string operation returns a new string. Chain them:\n\n```\ntext = \"  Hello, Aarav!  \"\nclean = strip(to_lowercase(text))       -> \"hello, aarav!\"\n```\n\n### Key Takeaway\n\nStrings are immutable sequences of characters: you can index, slice, and transform them, but every operation builds a new string. End-excluded slices, zero-based indices, and the uppercase-returns-new-string trap are the three things exams live on.",
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
  "explanation": "## What String Formatting Is\n\nBuilding output with values baked inside is a daily task: \"Hello, Aarav! You have 3 new messages.\" **String formatting** is the clean, readable way to construct such strings — instead of ugly manual concatenation.\n\n### The Ugly Way vs the Clean Way\n\n**Naive concatenation** — works, but fragile and hard to read:\n\n```\nmessage = \"Hello, \" + name + \"! You have \" + count + \" new messages.\"\n```\n\nEvery value must be converted to text first (count is a number!), and the quotes get tangled.\n\n**Placeholder formatting** — the modern clean way:\n\n```\nmessage = \"Hello, {name}! You have {count} new messages.\"\n```\n\n### How Placeholders Work\n\nCurly braces mark the holes; the variables fill them:\n\n```\nname = \"Aarav\"\ncount = 3\nprint \"Hello, {name}! You have {count} new messages.\"\n-> Hello, Aarav! You have 3 new messages.\n```\n\nThe formatting engine converts values to text automatically — no manual conversion, no broken chains.\n\n### Format Specifiers — Control the Presentation\n\nBeyond filling holes, specifiers control HOW values look:\n\n| Specifier | Meaning | Example -> Result |\n|---|---|---|\n| {x} | Just the value | \"{5}\" -> \"5\" |\n| {x:.2f} | Two decimal places | \"{3.14159:.2f}\" -> \"3.14\" |\n| {x:05d} | Zero-pad to 5 digits | \"{42:05d}\" -> \"00042\" |\n| {x:,} | Thousands separators | \"{1234567:,}\" -> \"1,234,567\" |\n| {x:>5} | Right-align in width 5 | \"{42:>5}\" -> \"   42\" |\n| {x:<5} | Left-align in width 5 | \"{42:<5}\" -> \"42   \" |\n\nThe pattern is always `{value:specifier}` — colon, then the spec.\n\n### Positional vs Named Placeholders\n\n- **Positional:** `\"{}, {}\"` filled in order\n- **Named:** `\"{name}, {age}\"` filled by name\n\nNamed placeholders are self-documenting; positional is compact. Prefer named for anything non-trivial.\n\n### When You'd Use It in Problems\n\nThe vowel-counter problem ends with reporting a result:\n\n```\nprint \"The string '{s}' contains {n} vowels.\"\n-> The string 'Aarav' contains 3 vowels.\n```\n\nClean output is part of the solution — formatting is how you make it.\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| Wrong brace count | Placeholder left empty -> error | Match every { with a value |\n| Forgetting specifier syntax | Wrong width/padding | Always colon after value: {x:.2f} |\n| Mixing positional + named | Confusing order bugs | Pick one style and stick to it |\n\n### Key Takeaway\n\nFormatting builds strings with placeholders instead of concatenation: cleaner, auto-converts values, and supports specifiers like .2f and :05d for presentation control. It turns messy output code into a one-liner.",
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
  "explanation": "## What a List Is\n\nA **list** is an ordered, MUTABLE collection — the workhorse of programming. You can add, remove, and change items after creation, and order matters. One list can hold any mix of types: `[90, 85, 92]`, `[1, \"two\", 3.0]`, `[]` (empty).\n\n### Indexing and Slicing (same rules as strings)\n\n```\nscores = [90, 85, 92]\nscores[0]    -> 90       zero-based\nscores[-1]   -> 92       last item\nscores[0:2]  -> [90, 85] half-open slice (end excluded)\n```\n\n### The Essential Operations (memorise these 12)\n\n| Operation | What it does | Example -> Result |\n|---|---|---|\n| length(list) | Number of items | length([1,2,3]) -> 3 |\n| list[i] | Index (negative from end) | [90,85,92][1] -> 85 |\n| list[a:b] | Slice (end excluded) | [1,2,3][0:2] -> [1,2] |\n| append(list, x) | Add at the END | append([1,2], 3) -> [1,2,3] |\n| extend(list, xs) | Add many at the end | extend([1], [2,3]) -> [1,2,3] |\n| insert(list, i, x) | Insert at index i | insert([1,3], 1, 2) -> [1,2,3] |\n| pop(list) | Remove LAST item (returns it) | pop([1,2,3]) -> 3, list [1,2] |\n| pop_at(list, i) | Remove at index i | pop_at([1,2,3], 0) -> 1, list [2,3] |\n| remove(list, x) | Remove first x by VALUE | remove([1,2,2], 2) -> [1,2] |\n| contains(list, x) | Membership test | contains([1,2], 2) -> true |\n| sort_in_place(list) | Sort the list itself | sort_in_place([3,1]) -> list [1,3] |\n| sorted(list) | Return a NEW sorted list | sorted([3,1]) -> [1,3], original untouched |\n\n### The #1 Sorting Trap: sort-in-place vs sorted\n\n```\nlist = [3, 1, 2]\nsort_in_place(list)         changes the ORIGINAL list, returns nothing\nresult = sorted(list)       original untouched, result = [1, 2, 3]\n```\n\n- sort_in_place mutates the original and returns nothing.\n- sorted returns a NEW list, leaving the original alone.\n\nUsing the mutating one where you wanted the copy (or vice versa) is a silent bug. The same trap appears in Sets with update operations — watch for \"returns nothing vs returns new\".\n\n### The Remove Duplicates Connection\n\nThe \"Remove Duplicates from a List\" problem builds the classic pattern: a seen set + an output list. For each item: if not in seen, add to both. That's a list + set working together — and it's the exact problem in this lesson.\n\n### List Comprehensions — the Compact Power Move\n\nMany languages build new lists with a loop. A comprehension compresses loop + build into one line:\n\n```\nsquares = [ x * x  for x in numbers ]\n-> same as: loop x in numbers, build list of x*x\n```\n\nReadable and fast — but only after you understand the loop it replaces.\n\n### Key Takeaway\n\nLists are ordered, mutable, and full of power: indexing, slicing, append/pop, and the sort-in-place vs sorted distinction. Master membership, and remember the seen-set pattern for deduplication — it appears in problem after problem.",
},
{
  "title": "Tuples",
  "slug": "tuples",
  "lessonSlug": "lists-tuples-dictionaries",
  "order": 1,
  "description": "Learn the immutable sibling of the list — why fixed data is safer, the comma that makes a one-item tuple, and packing/unpacking superpowers like the swap.",
  "explanation": "## What a Tuple Is\n\nA **tuple** is an ordered, IMMUTABLE collection — the stricter sibling of the list. Once created, its items cannot be added, removed, or changed. That immutability is a FEATURE, not a limitation.\n\n```\npoint = (3, 4)          parentheses create a tuple\nsingle = (5,)           NOTE the comma — (5) is just the number 5!\n```\n\n### Tuple vs List — the Comparison\n\n| | List | Tuple |\n|---|---|---|\n| Syntax | [1, 2, 3] | (1, 2, 3) |\n| Mutable? | Yes | NO — fixed forever |\n| Use for | Growing collections | Fixed records, coordinates, return values |\n| Can be a key in maps/dicts? | NO (not hashable) | YES |\n| Memory | Slightly heavier | Lighter, faster |\n\n### Why Immutability Is a Superpower\n\n1. **Safety** — a tuple can't be accidentally modified anywhere; it's safe to share.\n2. **Hashable** — because it can't change, a tuple can be a key in a dictionary (a list cannot).\n3. **Honesty** — `(width, height)` says \"this is a fixed shape\", not \"feel free to grow me\".\n\n### Packing and Unpacking — the Superpower\n\n```\npoint = (3, 4)\nx, y = point           UNPACKING: x = 3, y = 4 — one line, two variables\n\na, b = b, a            the famous SWAP — it's just tuple packing/unpacking!\n```\n\nUnpacking is everywhere: `for name, score in pairs:` works because each pair is a 2-tuple.\n\n### The One-Element Gotcha\n\n`(5)` is just the number 5 — parentheses alone don't make a tuple. The **comma** does: `(5,)`. Forgetting the comma is the classic silent bug (and the classic interview smirk).\n\n### The Return-Value Pattern\n\nFunctions often return multiple results as a tuple:\n\n```\nfunction min_max(list):\n    return (min(list), max(list))      caller unpacks:\n\nlow, high = min_max([3, 1, 2])         low = 1, high = 3\n```\n\n### Common Traps\n\n| Trap | What goes wrong | The fix |\n|---|---|---|\n| t[0] = 5 | ERROR — tuples are immutable | Build a new tuple: (5,) + t[1:] |\n| (5) instead of (5,) | It's a number, not a tuple | Always comma for one item |\n| Using a list as a dict key | ERROR — unhashable | Use a tuple instead |\n| Calling append/pop on a tuple | ERROR — no such operation | Convert to a list if you must mutate |\n\n### Key Takeaway\n\nTuples are immutable ordered collections: same indexing and slicing as lists, but no mutation. The comma makes a 1-tuple; tuples (not lists) can be dict keys; and packing/unpacking powers the swap and multi-return patterns.",
},
{
  "title": "Dictionaries",
  "slug": "dictionaries",
  "lessonSlug": "lists-tuples-dictionaries",
  "order": 2,
  "description": "Learn O(1) key-value storage — safe lookups with get(), the three iteration views, the immutable-key rule, and the merge tricks.",
  "explanation": "## What a Dictionary Is\n\nA **dictionary** (also called a map or hash) stores key->value pairs with FAST lookups. Think of a real dictionary: you look up a word (key) and get its meaning (value). No searching — the key leads straight to the value.\n\n```\nstudent = {\n    \"name\": \"Aarav\",\n    \"age\": 21,\n    \"subjects\": [\"DSA\", \"DBMS\"]      values can be ANY type\n}\n```\n\n### The O(1) Promise\n\nLookups in a dictionary take constant time — O(1) — regardless of how many items it holds. A dictionary with 10 items and one with 1,000,000 both find a key instantly. That's the whole point: fast access by key instead of scanning.\n\n### The Essential Operations (memorise these 8)\n\n| Operation | What it does | Example -> Result |\n|---|---|---|\n| map[key] | Lookup (ERROR if missing) | student[\"name\"] -> \"Aarav\" |\n| get(map, key, default) | Safe lookup | get(student, \"x\", 0) -> 0 if absent |\n| map[key] = value | Insert or update | student[\"age\"] = 22 |\n| contains(map, key) | Key exists? (O(1)) | contains(student, \"age\") -> true |\n| keys(map) / values(map) | The key view / value view | keys(student) -> [name, age, subjects] |\n| items(map) | The key-value pairs | items(student) -> pairs |\n| update(map, other) | Merge — other wins on conflicts | update(m1, m2) |\n| length(map) | Number of keys | length(student) -> 3 |\n\n### The Two Lookup Styles — and the Trap\n\n```\nstudent[\"absent\"]         -> ERROR — key doesn't exist, program crashes\nget(student, \"absent\")    -> nothing (null) — graceful\nget(student, \"absent\", 0) -> 0 — graceful with a default\n```\n\n`map[key]` is for keys you KNOW exist; `get` is for keys that MIGHT not. The interview question \"safe lookup vs crash\" lives exactly here.\n\n### Iterating — the Three Views\n\n```\nfor key in keys(student):               keys\nfor key, value in items(student):       BOTH — the common one\nfor value in values(student):           values\n```\n\n### The Immutable-Key Rule\n\nKeys MUST be immutable (strings, numbers, tuples). Lists and other dictionaries CANNOT be keys — the engine needs a stable hash, and mutable things can change it.\n\n```\n{ [\"a\"]: 1 }        ERROR — list as key\n{ (\"a\", 1): 1 }     OK — tuple as key\n```\n\n### The Merge Connection\n\nThe \"Merge Two Dictionaries\" problem lives here: combining two maps where the second's values win on conflicts — exactly what `update` (and the spread trick in some languages) does.\n\n### Key Takeaway\n\nDictionaries give O(1) key->value lookups with three iteration views and a safe-get pattern. Keys must be immutable; use `map[key]` only for known keys, `get` otherwise. Merge conflicts: the right-hand dictionary wins.",
},
{
  "title": "Set Basics",
  "slug": "set-basics",
  "lessonSlug": "sets",
  "order": 0,
  "description": "Learn the unordered, unique collection — add, discard vs remove, the {} vs set() trap, and why membership is O(1).",
  "explanation": "## What a Set Is\n\nA **set** is an unordered collection of UNIQUE items. Three properties define it:\n\n1. **Unique** — duplicates are silently dropped\n2. **Unordered** — no index, no positions, no slicing\n3. **Fast** — membership tests are O(1), just like dictionary keys\n\n```\nfruits = {\"apple\", \"banana\", \"apple\"}      -> {apple, banana} — second apple vanished\nempty = set()                              <- the ONLY way to make an empty set\n```\n\n### The {} vs set() Trap\n\n```\na = {}            this is an empty DICTIONARY, not a set!\nb = set()         this is the empty set\n```\n\nCurly braces with key:value pairs make a dictionary; braces with plain items make a set; empty braces are ALWAYS a dictionary. Classic exam trick.\n\n### The Essential Operations (memorise these 8)\n\n| Operation | What it does | Example -> Result |\n|---|---|---|\n| contains(s, x) | Membership (O(1)!) | contains({1,2,3}, 2) -> true |\n| add(s, x) | Add one item | add({1}, 2) -> {1, 2} |\n| update(s, xs) | Add many items | update({1}, [2,3]) -> {1, 2, 3} |\n| remove(s, x) | Remove (ERROR if missing!) | remove({1,2}, 1) -> {2} |\n| discard(s, x) | Remove (silent if missing) | discard({1}, 9) -> {1} |\n| length(s) | Count of UNIQUE items | length({1,2,2}) -> 2 |\n| pop(s) | Remove and return ANY item | pop({5,6}) -> 5 or 6 |\n| copy(s) | Shallow copy | b = copy(a) |\n\n### remove vs discard — the Distinction\n\n```\ns = {1, 2, 3}\nremove(s, 9)      -> ERROR — 9 isn't there\ndiscard(s, 9)     -> silent — nothing happens\n```\n\n`remove` insists the item exists; `discard` tolerates absence. If unsure, discard.\n\n### What CANNOT Go In a Set\n\nSet items must be immutable (hashable): strings, numbers, tuples are fine; lists and dictionaries are NOT.\n\n```\n{ [1, 2] }     -> ERROR — unhashable list\n{ (1, 2) }     -> fine — tuple is hashable\n```\n\n### The Remove Duplicates Connection\n\nThis lesson's problem is the classic: build an empty seen set, loop the list, and keep each item only if it's NEW. Sets make deduplication a one-trick problem.\n\n### Key Takeaway\n\nSets are unordered, unique, O(1) membership collections. Empty braces = dictionary (use set()); remove throws if missing while discard doesn't; and only immutable items can live inside. They are the default tool for deduplication.",
},
{
  "title": "Set Operations",
  "slug": "set-operations",
  "lessonSlug": "sets",
  "order": 1,
  "description": "Learn the big five — union |, intersection &, difference -, symmetric difference ^, and subset <= — plus the mutation-safe rules for each.",
  "explanation": "## The Big Five — Set Operators\n\nSets really shine when COMBINED. Five operations cover almost everything:\n\n```\na = {1, 2, 3}\nb = {3, 4, 5}\n\na | b    -> {1, 2, 3, 4, 5}    UNION: everything from both\na & b    -> {3}                INTERSECTION: only in both\na - b    -> {1, 2}             DIFFERENCE: in a but NOT in b\na ^ b    -> {1, 2, 4, 5}       SYMMETRIC DIFFERENCE: in either, not both\na <= b   -> false              SUBSET test: is a fully inside b?\n```\n\n### Union — the Merge\n\nEverything from both sets, duplicates kept once. The natural \"combine two groups\" move. Think of joining two friend lists.\n\n### Intersection — the Overlap\n\nOnly the items in BOTH sets. The interview classic: \"who appears in both lists?\" — the one-line answer is `intersection(set(x), set(y))`.\n\n### Difference — the Directional Cut\n\n`a - b` is \"a's items minus anything b also has\". ORDER MATTERS:\n\n```\na - b    -> {1, 2}     in a, not in b\nb - a    -> {4, 5}     in b, not in a — DIFFERENT answer!\n```\n\n### Symmetric Difference — the Either-Or\n\nItems in either set but NOT both — it's union minus intersection. Order doesn't matter: `a ^ b == b ^ a`.\n\n### Subset / Superset — the Relationship Tests\n\n```\n{1, 2} <= {1, 2, 3}     -> true    every item of the left is in the right\n{1, 2, 3} >= {1, 2}     -> true    right side is inside the left\n```\n\nAlso strict versions (< and >): true only when they're NOT equal.\n\n### The Mutating vs Non-Mutating Trap\n\nThe operators build NEW sets. The update family MUTATES in place — the same sort-in-place vs sorted lesson as lists:\n\n| New set (non-mutating) | Mutates in place |\n|---|---|\n| a | b | update(a, b) |\n| a & b | intersection_update(a, b) |\n| a - b | difference_update(a, b) |\n| a ^ b | symmetric_difference_update(a, b) |\n\n### The Union/Intersection Problem Connection\n\nThe \"Union/Intersection of Two Sets\" problem is the big five applied directly: compute the combined set and the shared set from two inputs — and return them (often as lists).\n\n### Key Takeaway\n\nFive operators rule set combination: union, intersection, difference (directional!), symmetric difference, and subset tests. Operator versions build new sets; _update versions mutate. They compress multi-line loops into one expression.",
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
  "approach": "## Understanding the Problem\n\nWe need two variables to exchange their values. The naive mistake is writing:\n\n```\na = b\nb = a\n```\n\nThat does NOT swap — the first line overwrites a, so by the time the second line runs, a no longer holds its original value. Both end up holding b's value. We need to save the original value BEFORE overwriting it.\n\n## Approach 1: Temporary Variable (the reliable classic)\n\n1. Copy a into a temp variable: `temp = a`\n2. Overwrite a with b: `a = b`\n3. Put the saved original back into b: `b = temp`\n\n```\nStart:   a = 5   b = 10\nStep 1:  temp = 5\nStep 2:  a = 10\nStep 3:  b = 5\nDone:    a = 10  b = 5  OK\n```\n\nThis works in every language and is impossible to get wrong. It uses exactly one extra variable — which the problem allows.\n\n## Approach 2: Parallel / Simultaneous Assignment\n\nMany languages let you swap in one line — the right-hand side is evaluated FIRST, then both assignments happen together:\n\n```\n(a, b) = (b, a)\n```\n\nThis is really tuple packing and unpacking: the pair (old b, old a) is built first, then unpacked into a and b. Because the entire right side is computed before any assignment, the original values are never lost. Clean and readable — but requires language support.\n\n## Approach 3: Arithmetic Trick (no temp at all)\n\n```\na = a + b\nb = a - b\na = a - b\n```\n\n```\nStart:  a=5 b=10\nStep 1: a=15 (5+10)\nStep 2: b=5  (15-10)  -> b now holds old a OK\nStep 3: a=10 (15-5)   -> a now holds old b OK\n```\n\nWorks, but only for numbers, and can overflow in languages with fixed-size integers. A fun trick — not something you need in production code.\n\n## Complexity Analysis\n\n- **Time: O(1)** — a fixed number of steps regardless of the values.\n- **Space: O(1)** — at most one temporary variable.",
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
  "approach": "## Understanding the Problem\n\nInput arrives as TEXT (keyboards always deliver strings). We must convert it to a number, do the math, then convert the result back to text for display. The whole trick is knowing WHEN to convert.\n\n```\n\"25\" + 5    -> ERROR — can't add a number to text\n```\n\n## Approach: Convert At the Right Moments\n\n1. Read input as text: `age_text = read_input()`  ->  `\"25\"`\n2. Convert to a number: `age = to_number(age_text)` -> `25`\n3. Do the math: `next_age = age + 1` -> `26`   (now this works!)\n4. Convert the result back to text before printing: `reply = to_string(next_age)`\n\n```\nIF input comes from a keyboard:\n    it is ALWAYS text            <- the #1 hidden trap\n\nvalue = to_number(input_text)       convert up front\nresult = value * 2               do the math on a real number\nprint to_string(result)          convert back for output\n```\n\n## Common Mistakes\n\n- Forgetting input is text -> math crashes.\n- Converting too late (math before conversion).\n- Mixing types in the output — the printed value must be text.\n\n## Edge Cases\n\n- Empty input -> conversion may fail.\n- \"25.7\" -> converting to an INTEGER truncates to 25, not 26.\n\n## Complexity Analysis\n\n- **Time: O(1)** — a constant number of conversions and one operation.\n- **Space: O(1)** — a few scalar values, nothing grows.",
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
  "approach": "## Understanding the Problem\n\nGiven a number like 1234, return 1 + 2 + 3 + 4 = 10. The classic tool is the pair `%` (remainder) and `//` (integer division) — they peel digits off one at a time.\n\n```\n1234 % 10   -> 4      (the last digit)\n1234 // 10  -> 123    (the number without its last digit)\n```\n\n## Approach: Repeatedly Peel Digits\n\n1. Take the number modulo 10 to grab the LAST digit.\n2. Add it to a running total.\n3. Integer-divide the number by 10 to drop that digit.\n4. Repeat until the number becomes 0.\n\n```\ntotal = 0\nWHILE number > 0:\n    digit  = number % 10     grab the last digit\n    total  = total + digit   add it to the sum\n    number = number // 10    drop it — number shrinks toward 0\nPRINT total                  -> 1234 gives 10\n```\n\nStep-by-step for 1234:\n\n```\n1234 % 10 -> 4, total=4,  number=123\n123  % 10 -> 3, total=7,  number=12\n12   % 10 -> 2, total=9,  number=1\n1    % 10 -> 1, total=10, number=0  -> loop stops\ntotal = 10  OK\n```\n\n## Why Integer Division (//) and Not /\n\nRegular `/` gives 123.4 — a decimal that would never reach 0. Integer division drops the fraction and gives 123, so the loop terminates.\n\n## Edge Cases\n\n- n = 0 -> the loop never runs, total stays 0 (correct).\n- Negative numbers — handle by working on the absolute value.\n\n## Complexity Analysis\n\n- **Time: O(number of digits)** — one iteration per digit.\n- **Space: O(1)** — only a couple of scalar variables.",
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
  "approach": "## Understanding the Problem\n\nFor each number from 1 to N, print:\n- \"FizzBuzz\" if divisible by both 3 and 5\n- \"Fizz\" if divisible by 3 only\n- \"Buzz\" if divisible by 5 only\n- the number itself otherwise\n\n## Key Insight: Check the Combined Case FIRST\n\n15 is divisible by both 3 and 5. If we checked \"divisible by 3\" first, 15 would print \"Fizz\" and never reach \"FizzBuzz\". The most specific condition must win.\n\n## Approach: Loop + Multi-Way Conditional\n\n```\nFOR n = 1 TO N:\n    IF n divisible by 3 AND n divisible by 5:\n        PRINT \"FizzBuzz\"\n    ELSE IF n divisible by 3:\n        PRINT \"Fizz\"\n    ELSE IF n divisible by 5:\n        PRINT \"Buzz\"\n    ELSE:\n        PRINT n\n```\n\n## A Neat Shorthand\n\n\"Divisible by both 3 and 5\" is the same as \"divisible by 15\" (since 15 = 3 x 5). Both phrasings are correct — pick whichever reads clearly.\n\n```\nn % 3 == 0 AND n % 5 == 0     same result as n % 15 == 0\n```\n\n## Complexity Analysis\n\n- **Time: O(n)** — a single pass over 1..n, constant work per number.\n- **Space: O(1)** — no extra data structures.",
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
  "approach": "## Understanding the Problem\n\nA function that greets a person, with an OPTIONAL custom greeting. Callers who pass nothing need a sensible default (\"Hello\"); callers who pass their own greeting get theirs.\n\n## Approach 1: Default Parameter Value\n\nDeclare the parameter with a default. A caller who omits the argument silently gets the default.\n\n```\nfunction greet(name, greeting = \"Hello\"):\n    PRINT greeting + \", \" + name\n\ngreet(\"Aarav\")            -> \"Hello, Aarav\"\ngreet(\"Priya\", \"Namaste\") -> \"Namaste, Priya\"\n```\n\nThis is the cleanest approach and most modern languages support default values in the signature itself.\n\n## Approach 2: Manual Fallback Inside the Body\n\nFor languages without native defaults, check whether the argument was provided and fall back manually.\n\n```\nfunction greet(name, greeting):\n    IF greeting is missing or empty:\n        greeting = \"Hello\"\n    PRINT greeting + \", \" + name\n```\n\n## Which Is Better?\n\nDefaults in the signature are self-documenting — the reader sees the fallback at a glance. The manual fallback is the portable approach for languages that lack the feature.\n\n## Edge Cases\n\n- Distinguish \"no argument\" from an explicitly empty greeting — verify expected behaviour.\n- Put optional parameters AFTER required ones in the signature.\n\n## Complexity Analysis\n\n- **Time: O(1)** — constant work: assignment + print.\n- **Space: O(1)** — only the local string built.",
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
  "approach": "## Understanding the Problem\n\nThe factorial of n, n!, is the product of every integer from 1 to n. 5! = 5 x 4 x 3 x 2 x 1 = 120. We solve with a loop rather than recursion.\n\n## Approach: Multiply with a Running Product\n\nStart at 1 (the multiplicative identity), then multiply by every number from 1 to n. Counting up (1, 2, 3, ...) and counting down (n, n-1, ...) produce the same answer.\n\n```\nfunction factorial(n):\n    result = 1\n    FOR i = 1 TO n:\n        result = result * i\n    RETURN result\n\nfactorial(5) -> 120   (1 x 2 x 3 x 4 x 5)\nfactorial(0) -> 1     (0! is defined as 1; the loop never runs)\n```\n\n## Why Iterative Over Recursive?\n\n- The loop uses O(1) extra memory.\n- Recursion adds a call-stack frame per level and risks stack overflow for large n, so the iterative loop is the default.\n\n## Edge Cases\n\n- n = 0 -> 1 (mathematical definition).\n- Negative inputs are undefined -> return an error.\n- Large n grows fast — the answer may exceed the integer range.\n\n## Complexity Analysis\n\n- **Time: O(n)** — the loop runs exactly n times.\n- **Space: O(1)** — only the product variable and loop counter.",
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
  "approach": "## Understanding the Problem\n\nA BankAccount with an owner and balance, and deposit/withdraw/show operations. It must never let the balance go negative — reject impossible operations.\n\n## Design: Data + Behaviour in One Class\n\nThe balance lives inside the object, reachable only through its methods — encapsulation in action.\n\n## Approach\n\n1. **Constructor:** set the owner and initial balance when created.\n2. **deposit(amount):** add the amount only if it is positive.\n3. **withdraw(amount):** subtract only if enough money exists; return success/failure.\n4. **get_balance():** read the current balance.\n\n```\nclass BankAccount:\n    constructor(owner, balance = 0):\n        this.owner = owner\n        this.balance = balance\n\n    function deposit(amount):\n        IF amount > 0:\n            this.balance = this.balance + amount\n            RETURN true\n        RETURN false        # can't deposit zero or negative\n\n    function withdraw(amount):\n        IF amount > 0 AND amount <= this.balance:\n            this.balance = this.balance - amount\n            RETURN true\n        RETURN false        # would overdraw — refused!\n\n    function get_balance():\n        RETURN this.balance\n```\n\n## The Rules Live Inside the Object\n\n- Deposits refuse zero/negative amounts.\n- Withdrawals refuse more than the balance -> balance can NEVER go negative.\n- No one can assign balance directly — all changes go through validated methods.\n\n## Example Usage\n\n```\nacc = BankAccount(\"Aarav\", 1000)\nacc.deposit(500)      -> true,  balance 1500\nacc.withdraw(2000)    -> false, balance still 1500\nacc.get_balance()     -> 1500\n```\n\n## Complexity Analysis\n\n- **Time: O(1)** — each action is a few fixed operations.\n- **Space: O(1)** — only the account's own fields.",
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
  "approach": "## Understanding the Problem\n\nShapes (Circle, Rectangle, and perhaps Triangle) with area and perimeter. A parent Shape class defines the CONTRACT; children inherit and override with real formulas.\n\n## Approach: Abstract Parent + Overriding Children\n\n1. **Shape (parent):** declares the area() and perimeter() contracts.\n2. **Circle (child):** overrides them with circle formulas.\n3. **Rectangle (child):** overrides them with rectangle formulas.\n\n```\nabstract class Shape:\n    abstract function area()\n    abstract function perimeter()\n\nclass Circle extends Shape:\n    radius\n    function area():      RETURN PI * radius * radius\n    function perimeter(): RETURN 2 * PI * radius\n\nclass Rectangle extends Shape:\n    width, length\n    function area():      RETURN length * width\n    function perimeter(): RETURN 2 * (length + width)\n```\n\n## Why an Abstract Parent?\n\nThe parent guarantees \"every shape knows its area and perimeter\" WITHOUT saying how. Each child supplies its own. If a child forgets to implement a method, the program fails early. This is inheritance + polymorphism working together.\n\n## Polymorphism Payoff\n\nBecause every child honours the contract, one loop handles ALL shapes:\n\n```\nshapes = [Circle(4), Rectangle(4, 6)]\n\nFOR shape in shapes:\n    print shape.area()\n```\n\nAdding a Triangle tomorrow requires NO changes to the loop.\n\n## Complexity Analysis\n\n- **Time: O(1)** per measurement — a fixed set of operations.\n- **Space: O(1)** — only each shape's own fields.",
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
  "approach": "## Understanding the Problem\n\nA private attribute (like a balance or a grade) that can't be changed directly by the outside world — only through a getter and a setter. The setter is where validation happens.\n\n## Approach: Private Field + Getter + Setter\n\n1. **Private attribute** — locked inside the class.\n2. **Getter** — returns the current value.\n3. **Setter** — validates, then writes.\n\n```\nclass Student:\n    private grade = 0\n\n    function get_grade():\n        RETURN this.grade\n\n    function set_grade(new_grade):\n        IF new_grade >= 0 AND new_grade <= 100:\n            this.grade = new_grade\n            RETURN true\n        RETURN false          # e.g. -10 or 150 rejected\n\nstudent = Student()\nstudent.set_grade(95)   -> true,  grade is 95\nstudent.set_grade(-10)  -> false, grade stays 95\n```\n\n## Why This Works\n\n- Direct writes are impossible: `student.grade = -5` -> access denied (private).\n- Validation lives in one place — every write gets the same 0..100 check.\n- The object can't be corrupted.\n\n## Variations\n\n- Return a boolean from the setter so the caller knows if the update applied.\n- Use an action method (withdraw) instead of a plain setter for richer rules.\n\n## Complexity Analysis\n\n- **Time: O(1)** — constant-time assignment and check.\n- **Space: O(1)** — the single stored field.",
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
  "approach": "## Understanding the Problem\n\nAn abstract base class defines a contract (e.g. an area() method). Concrete subclasses supply the implementation. The base class itself can never create an object.\n\n## Approach: Abstract Class + Overrides\n\n1. **Declare the abstract class** with abstract area() — signature only, no body.\n2. **Create a concrete subclass** (Circle) that inherits and implements area().\n\n```\nabstract class Shape:\n    abstract function area()\n\nclass Circle extends Shape:\n    radius\n    function area():\n        RETURN 3.14159 * radius * radius\n\nc = Circle(5)\nc.area()     -> 78.5\n```\n\n## What the Abstract Keyword Guarantees\n\n1. **No instantiation** — creating a Shape object is impossible; the base is a template.\n2. **All abstract methods must be implemented** in children — a child that forgets stays abstract itself.\n3. **The contract is enforced** — every concrete shape has an area().\n\n## Rules Table\n\n| Rule | Why |\n|---|---|\n| abstract classes can't make objects | their abstract methods have no body |\n| abstract methods have signature but no body | the subclass provides the behaviour |\n| subclass must implement all abstract methods | otherwise it is abstract too |\n| abstract class CAN have concrete methods/fields | it shares common helpers |\n\n## When Abstract vs Interface\n\n| | Abstract class | Interface |\n|---|---|---|\n| concrete methods? | yes | no |\n| attributes? | yes | no |\n| purpose | IS-A family | capabilities |\n\n## Complexity Analysis\n\n- **Time: O(1)** — the formula is a fixed number of steps.\n- **Space: O(1)** — just the radius field.",
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
  "approach": "## Understanding the Problem\n\nReverse the characters of a string: \"Hello\" -> \"olleH\". Strings are immutable, so any solution must build a new string (or work through a mutable char array).\n\n## Approach 1: Build the Result Backwards\n\n1. Start with an empty result.\n2. Iterate the original from the LAST index down to 0.\n3. Append each character to the result.\n\n```\nfunction reverse(text):\n    result = \"\"\n    FOR i = length(text) - 1 DOWN TO 0:\n        result = result + text[i]\n    RETURN result\n\n\"Hello\" -> o -> lo -> llo -> ello -> olleH  OK\n```\n\n## Approach 2: Two-Pointer Swap (in place)\n\n1. Convert the immutable string into a mutable character array.\n2. Point at the first and last index.\n3. Swap them, move inward, stop when the pointers cross.\n\n```\nchars = to_list(text)\nleft  = 0\nright = length(chars) - 1\n\nWHILE left < right:\n    swap chars[left] and chars[right]\n    left  = left + 1\n    right = right - 1\n\nRETURN join(chars)\n```\n\nThis is the \"reverse in place\" pattern used everywhere in interviews.\n\n## Approach 3: Built-in Reverse\n\nMost languages have a built-in reverse on strings/lists — the idiomatic one-liner for real code. Good to know; less educational.\n\n## Complexity Analysis\n\n- **Time: O(n)** — each character is visited once (n/2 swaps for the pointer version).\n- **Space:** O(n) for the new string in Approach 1; O(1) extra beyond the char array in Approach 2.\n\n## Caveat\n\nNaive string concatenation inside a loop can be slow in some languages — the two-pointer/array approach is safer for large inputs.",
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
  "approach": "## Understanding the Problem\n\nCount how many vowels (a e i o u) appear in a string, ignoring case. \"Aarav\" -> 3 (a, A, a — three vowels; r and v are not).\n\n## Approach: Loop + Membership in a Vowel Set\n\n1. Lowercase the entire string first so 'A' and 'a' match the same set.\n2. Loop over every character.\n3. If the character is in the vowel set, increment the counter.\n\n```\nfunction count_vowels(text):\n    text = lowercase(text)\n    vowels = set of \"a\", \"e\", \"i\", \"o\", \"u\"\n    count = 0\n\n    FOR each char in text:\n        IF char IN vowels:\n            count = count + 1\n\n    RETURN count\n\n\"Hello\" -> 2   (e, o)\n\"Aarav\" -> 3   (a, a, a)\n```\n\n## The Membership Trick\n\n- **A set:** membership is O(1) per character. Fast, clean, reads like a question.\n- Comparing against the string \"aeiou\" also works.\n\nSets exist for exactly this: \"is it in this group?\" in constant time.\n\n## Edge Cases\n\n- Case: lowercase first so \"Aa\" and \"aa\" both count.\n- Non-letters: digits, spaces, punctuation aren't vowels, so they are skipped automatically.\n- Empty string -> count = 0.\n\n## Formatting the Output\n\nReport with a clean message (see the formatting patterns from the Strings lesson):\n\n```\nprint \"The string '\" + text + \"' contains \" + count + \" vowels.\"\n-> The string 'Aarav' contains 3 vowels.\n```\n\n## Complexity Analysis\n\n- **Time: O(n)** — one pass, O(1) membership per character.\n- **Space: O(1)** — the vowel set and counter are constant size.",
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
  "approach": "## Understanding the Problem\n\nRemove duplicates from a list while preserving the FIRST occurrence order: [1, 2, 2, 3, 1] -> [1, 2, 3].\n\n## Approach: A \"Seen\" Set Filters the List\n\nThe pattern: maintain a seen set. First time an item appears, it is not yet in the set — keep it in the output and mark it seen. Later duplicates find it already in the set — skip them.\n\n```\nfunction remove_duplicates(items):\n    seen   = empty set\n    result = empty list\n\n    FOR each item in items:\n        IF item NOT IN seen:\n            seen.add(item)\n            result.append(item)\n\n    RETURN result\n\n[1, 2, 2, 3, 1] -> result [1, 2, 3]  OK\n```\n\n## Why It Works\n\n- Set membership is O(1), so checking each item is cheap.\n- The FIRST occurrence is always added; later copies are blocked by the set already containing them.\n- Appending only on the first encounter preserves the original relative order.\n\n## Handling Unhashable Items\n\nThe list is assumed to hold hashable values (strings, numbers, tuples). For lists of lists, convert each item to a hashable form first.\n\n## Complexity Analysis\n\n- **Time: O(n)** — one pass with O(1) membership per item.\n- **Space: O(n)** — the set can hold up to the number of distinct items.",
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
  "approach": "## Understanding the Problem\n\nCombine two dictionaries into one. When both maps share a key, the SECOND map's value wins.\n\n```\nd1 = { \"a\": 1, \"b\": 2 }\nd2 = { \"b\": 3, \"c\": 4 }\nmerged -> { \"a\": 1, \"b\": 3, \"c\": 4 }   <- \"b\" came from d2 (value 3)\n```\n\n## Approach 1: Copy Then Update\n\n1. Start with a copy of the first map.\n2. Update it with every key of the second — conflicts overwrite.\n\n```\nmerged = copy of d1\nfor key in d2:\n    merged[key] = d2[key]\n\n-> { \"a\": 1, \"b\": 3, \"c\": 4 }\n```\n\n## Approach 2: Update Method One-Liner\n\nMany languages provide a built-in update/merge (or a spread operator):\n\n```\nmerged = d1 updated with d2      (or  merged = { ...d1, ...d2 })\n```\n\nBoth start with d1, then let d2 win the conflicts.\n\n## The Rule Most People Get Wrong — WHICH WINS?\n\nThe SECOND dictionary (the one merged in later) wins the tie. A classic exam trap: merging in the wrong order gives d1's values where the maps overlap.\n\n- Keys only in d1 -> from d1.\n- Keys only in d2 -> from d2.\n- Keys in BOTH -> d2.\n\n## Where This Is Used\n\n- Defaults merging: start with defaults, then override with the user's choices (user wins).\n- Config and settings merging.\n\n## Complexity Analysis\n\n- **Time: O(n + m)** — walk all keys of both maps.\n- **Space: O(n + m)** — the result stores the union of keys.",
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
  "approach": "## Understanding the Problem\n\nGiven two sets (or lists to convert), produce their UNION (everything from both) and INTERSECTION (items in both). Usually the result must be returned as lists.\n\n```\na = {1, 2, 3}\nb = {3, 4, 5}\nunion = {1, 2, 3, 4, 5}\ninter = {3}\n```\n\n## Approach 1: The Big Five Operators\n\nIf the language has set operators, this is nearly a one-liner:\n\n```\nunion_set        = union_of(a, b)        every item from both\nintersection_set = intersection_of(a, b) only what's in both\n\nreturn to_list(union_set), to_list(intersection_set)\n```\n\n## Manual Loop Version (no operator support)\n\n**For union:** add every item from both sets into a result set (duplicates vanish automatically).\n\n**For intersection:** for each item from a, if it is also in b, it belongs in the output.\n\n```\nfunction set_ops(a, b):\n    union = copy of a\n    for item in b: add item to union\n\n    inter = empty set\n    for item in a:\n        if item IN b: add item to inter\n\n    return to_list(union), to_list(inter)\n```\n\n## Key Reasoning\n\n- Union is \"copy a, then add all of b\" — the set's uniqueness de-dupes automatically.\n- Intersection loops one set and uses O(1) membership in the other.\n\n## Edge Cases\n\n- Empty sets -> union and intersection are both empty.\n- Identical sets -> union = intersection = the set itself.\n- Inputs given as lists -> convert to sets first (dedupe happens for free).\n\n## Complexity Analysis\n\n- **Time: O(|a| + |b|)** — each item visited once with O(1) membership.\n- **Space: O(|union|)** — the result sizes.",
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
