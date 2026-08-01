/*
 * Seed Variables, Data Types & Operators lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node programming-content/seed_variables-data-types-operators.mjs
 * NOTE: Generated from programming-content/present.md — do not hand-edit; regenerate via generate_seed.mjs present.md after updating present.md.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import ProgrammingLesson from '../models/ProgrammingLesson.js';
import ProgrammingSubtopic from '../models/ProgrammingSubtopic.js';
import ProgrammingProblem from '../models/ProgrammingProblem.js';
import Quiz from '../models/Quiz.js';

/* ─── Helpers ─── */
async function upsert(Model, query, data, label) {
  const result = await Model.findOneAndUpdate(query, data, { upsert: true, new: true });
  console.log('[SEED] ' + label + ': ' + (result ? 'upserted' : 'failed') + ' (' + JSON.stringify(query) + ')');
  return result;
}

async function upsertQuiz(problemId, problemModel, questions) {
  const result = await Quiz.findOneAndUpdate(
    { problemId, problemModel },
    { problemId, problemModel, questions },
    { upsert: true, new: true }
  );
  console.log('[SEED] Quiz for ' + problemModel + ' ' + problemId + ': upserted (' + questions.length + ' questions)');
  return result;
}

/* ─── Connect ─── */
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected to MongoDB\n');

  /* ─── 1. Lesson ─── */
  console.log('=== LESSON ===');
  const lesson = await upsert(ProgrammingLesson,
    { slug: "variables-data-types-operators" },
    {
      title: "Variables, Data Types & Operators",
      slug: "variables-data-types-operators",
      category: "programming-foundations",
      description: "Start here — learn how programs store and manipulate data. Master variables, the fundamental data types (integers, floats, strings, booleans), how to convert between them, and the operators that combine values into expressions.",
      image: "",
      icon: "Braces",
      order: 0,
      difficulty: "easy",
      problemCount: 2
    },
    'Lesson "Variables, Data Types & Operators"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
{
      slug: "variables-data-types", lessonSlug: "variables-data-types-operators", order: 0,
      title: "Variables & Data Types",
      description: "Learn what variables are, how they store values in memory, and the core data types — integers, floats, strings, and booleans — that every program is built on.",
      explanation: "## What is a Variable?\n\nA **variable** is a named container that stores a value in your program's memory. Think of it as a labeled box: the label is the variable's name, and whatever you put inside the box is its value. You can read what's in the box anytime, and you can replace its contents with something new.\n\n```\nname = \"Aarav\"    # a box labelled \"name\" holding the text \"Aarav\"\nage  = 21         # a box labelled \"age\" holding the number 21\n```\n\n## Why Variables Exist\n\nWithout variables, you would have to re-type every value every time you used it. Variables let you:\n\n✅ **Store** a value once and reuse it many times\n✅ **Name** data so your code reads like a story, not a mystery\n✅ **Change** a value at runtime — e.g. a score that goes up as the user plays\n✅ **Remember** intermediate results while solving a problem\n\n## Rules for Naming Variables\n\nGood names make code readable. Most languages agree on these rules:\n\n- Start with a **letter or underscore** (never a digit)\n- Use only **letters, digits, and underscores** after the first character\n- Be **case-sensitive** — `age` and `Age` are different variables\n- Choose **descriptive names** — `studentCount` beats `x`\n- Use `camelCase` or `snake_case` consistently (Python favours snake_case)\n\n## What is a Data Type?\n\nA **data type** tells the computer two things about a value: what kind of data it is, and what operations are legal on it. You cannot meaningfully \"add\" two strings the same way you add two numbers, so the type tells the language how to behave.\n\n## The Four Core Data Types\n\nEvery language has these four in some form:\n\n### 1. Integer (`int`)\nA whole number — no fraction part. Can be positive, negative, or zero.\n\n```\n42   -7   0   1000000\n```\n\n### 2. Float (`float`)\nA number with a fractional part (a \"decimal point\" number). Used whenever precision with decimals matters.\n\n```\n3.14   -0.5   2.0   99.99\n```\n\n### 3. String (`str`)\nA sequence of characters — text. Always wrapped in quotes ('single' or \"double\" depending on the language).\n\n```\n\"hello\"   \"TheWebytes\"   \"42\"   \"\"\n```\n\n> Note: `\"42\"` is a string, NOT the number 42. They behave differently in arithmetic — this is a classic source of bugs (see Type Conversion).\n\n### 4. Boolean (`bool`)\nOnly two possible values: `True` or `False` (in some languages `true`/`false`). Used to make decisions.\n\n```\nTrue   False\n```\n\n## Type Comparison Table\n\n| Type | Stores | Example | Common operations |\n|---|---|---|---|\n| int | Whole numbers | `25` | +, -, *, /, //, % |\n| float | Decimal numbers | `2.5` | +, -, *, / |\n| string | Text | `\"hi\"` | + (concat), len(), slicing |\n| bool | True/False | `True` | and, or, not, comparisons |\n\n## Checking a Variable's Type\n\nYou can ask a variable what type it holds instead of guessing:\n\n```python\nage = 21\nprint(type(age))   # <class 'int'>\n\nname = \"Aarav\"\nprint(type(name))  # <class 'str'>\n```\n\n## Key Takeaway\n\nA variable is a named box that stores a value. Every value has a **data type** — int, float, string, or bool — that decides what you can do with it. Always pick clear names and know the type of every value you store, because \"what kind of data is this?\" is the first question you must answer before writing any logic.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    },
{
      slug: "type-conversion", lessonSlug: "variables-data-types-operators", order: 1,
      title: "Type Conversion",
      description: "Learn how to convert a value from one data type to another — implicit vs explicit conversion, the common pitfalls when strings meet numbers, and how to handle failed conversions safely.",
      explanation: "## What is Type Conversion?\n\n**Type conversion** (also called **casting**) means changing a value from one data type to another — turning the string `\"42\"` into the integer `42`, or the integer `42` into the float `42.0`.\n\nWhy does this matter? Because the same data can arrive in different forms. A user's age arrives as a string from a form (`\"21\"`). A file stores prices as text. Before you can do arithmetic with those values, you often need to convert them into numbers.\n\n```python\nage_text = \"21\"          # string\nage = int(age_text)      # convert to integer -> 21\nprint(age + 1)           # 22  (would crash without conversion!)\n```\n\n## Implicit vs Explicit Conversion\n\n### Implicit (automatic)\nThe language converts types for you, automatically, when it is safe to do so. Example: adding an integer and a float. The integer is quietly promoted to a float so the arithmetic is exact.\n\n```python\nresult = 3 + 0.5     # 3 becomes 3.0 automatically\nprint(result)        # 3.5  (float)\n```\n\n### Explicit (manual)\nYou tell the language to convert, using a conversion function. You MUST do this when the automatic rules don't apply — e.g. a string can never be implicitly turned into a number.\n\n```python\n# Explicit conversions\nint(\"42\")        # -> 42\nfloat(\"3.14\")    # -> 3.14\nstr(100)         # -> \"100\"\n```\n\n## The Common Conversions\n\n| You have | You want | Convert with (Python) | Convert with (JS) | Convert with (Java) |\n|---|---|---|---|---|\n| string -> int | `\"42\"` -> `42` | `int(\"42\")` | `parseInt(\"42\", 10)` | `Integer.parseInt(\"42\")` |\n| string -> float | `\"3.14\"` -> `3.14` | `float(\"3.14\")` | `parseFloat(\"3.14\")` | `Double.parseDouble(\"3.14\")` |\n| int -> float | `42` -> `42.0` | `float(42)` | `Number(42)` | `(double) 42` |\n| number -> string | `42` -> `\"42\"` | `str(42)` | `String(42)` | `String.valueOf(42)` |\n\n## The Danger Zone: Strings That Look Like Numbers\n\nThe string `\"42\"` looks like a number, but it is NOT one. The moment you forget this:\n\n```javascript\nlet price = \"10\";          // string!\nconsole.log(price + 5);    // \"105\"  — string concatenation, not addition!\n```\n\nIn JavaScript the `+` operator concatenates strings, silently producing `\"105\"` instead of `15`. This is the #1 type-conversion bug. Convert first, then compute:\n\n```javascript\nlet price = Number(\"10\");  // number 10\nconsole.log(price + 5);    // 15 ✅\n```\n\n## What Happens When Conversion Fails?\n\nIf the text cannot be converted, the conversion throws an error (or returns a special \"not a number\" value in JavaScript). Always guard against bad input:\n\n```python\ndef safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None   # or 0 — your choice for the problem\n```\n\n## Key Takeaway\n\nType conversion changes a value from one type to another — use `int()`, `float()`, `str()`, `parseInt()`, `Number()`, etc. The language converts automatically when it's safe, but **strings never become numbers automatically**. Convert explicitly, handle bad input gracefully, and you will avoid the classic \"looks like a number but is text\" bug.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    },
{
      slug: "operators-expressions", lessonSlug: "variables-data-types-operators", order: 2,
      title: "Operators & Expressions",
      description: "Learn how operators combine values into expressions — arithmetic, comparison, logical, and assignment operators — and the precedence rules that decide the order of evaluation.",
      explanation: "## What is an Operator?\n\nAn **operator** is a symbol that tells the computer to perform a specific operation on one or more values. The values an operator works on are called **operands**.\n\n```\n5 + 3     # \"+\" is the operator, 5 and 3 are the operands\na == b    # \"==\" checks whether a and b are equal\n```\n\n## What is an Expression?\n\nAn **expression** is any combination of values, variables, and operators that produces a result. A single value is the simplest expression; `5 + 3` is a slightly bigger one. Expressions can be assigned to variables, printed, or used inside larger expressions.\n\n```python\ntotal = price + tax          # price + tax is an expression\nhas_discount = total < 1000  # comparison expression -> bool\n```\n\n## The Four Operator Families\n\n### 1. Arithmetic Operators (numbers in, numbers out)\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| + | Addition | `7 + 3` | `10` |\n| - | Subtraction | `7 - 3` | `4` |\n| * | Multiplication | `7 * 3` | `21` |\n| / | Division | `7 / 2` | `3.5` |\n| // | Integer division | `7 // 2` | `3` |\n| % | Modulo (remainder) | `7 % 2` | `1` |\n| ** | Exponent | `2 ** 3` | `8` |\n\n### 2. Comparison Operators (numbers/text in, bool out)\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| == | Equal to | `5 == 5` | `True` |\n| != | Not equal | `5 != 3` | `True` |\n| > | Greater than | `5 > 3` | `True` |\n| < | Less than | `5 < 3` | `False` |\n| >= | Greater or equal | `5 >= 5` | `True` |\n| <= | Less or equal | `5 <= 3` | `False` |\n\n### 3. Logical Operators (bools in, bool out)\n\n| Operator | Meaning | Example | Result |\n|---|---|---|---|\n| and | Both must be true | `True and False` | `False` |\n| or | At least one true | `True or False` | `True` |\n| not | Flip the value | `not True` | `False` |\n\n### 4. Assignment Operators (store a result)\n\n| Operator | Meaning | Example | Equivalent to |\n|---|---|---|---|\n| = | Assign | `x = 5` | — |\n| += | Add and assign | `x += 3` | `x = x + 3` |\n| -= | Subtract and assign | `x -= 2` | `x = x - 2` |\n| *= | Multiply and assign | `x *= 2` | `x = x * 2` |\n| /= | Divide and assign | `x /= 2` | `x = x / 2` |\n\n## Operator Precedence — Who Goes First?\n\nWhen an expression has many operators, the language evaluates them in a fixed order — just like maths (BODMAS/PEMDAS):\n\n1. Parentheses `( )` — highest priority\n2. Exponents `**`\n3. Multiplication, Division, Modulo `* / // %`\n4. Addition, Subtraction `+ -`\n5. Comparisons `== != > < >= <=`\n6. Logical `not` → `and` → `or`\n7. Assignment `=` — last\n\n```python\nresult = 2 + 3 * 4        # 3*4=12, then 2+12 -> 14\nresult2 = (2 + 3) * 4     # parentheses first -> 5*4 = 20\n```\n\n**Golden rule:** when in doubt, use parentheses. They cost nothing and make your intent obvious.\n\n## Key Takeaway\n\nOperators are the verbs of programming — they combine values into **expressions** that produce results. Master the four families (arithmetic, comparison, logical, assignment), respect **precedence** (or use parentheses), and remember: comparisons and logical operators always produce a boolean, which is exactly what you need to make decisions in code.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    }
  ];

  for (const sub of subtopics) {
    await upsert(ProgrammingSubtopic, { slug: sub.slug }, sub, 'Subtopic "' + sub.title + '"');
  }

  /* ─── 3. Problems ─── */
  console.log('\n=== PROBLEMS ===');

  const problems = [
{
      slug: "swap-two-variables", lessonSlug: "variables-data-types-operators", subtopicSlug: "variables-data-types",
      title: "Swap Two Variables", difficulty: "easy",
      topics: ["Variables","Basics"],
      companies: ["Google","Microsoft","Amazon"],
      problemStatement: "You are given two integer variables a and b. Swap their values so that a ends up holding b's original value and b ends up holding a's original value.\n\nYou may use a single temporary variable, but you must NOT use any array, list, or other data structure.\n\nFor example, if a = 5 and b = 10, after swapping a must be 10 and b must be 5.",
      examples: [{"input":"a = 5, b = 10","output":"a = 10, b = 5","explanation":"The values exchange places: a takes 10, b takes 5."},{"input":"a = -3, b = 7","output":"a = 7, b = -3","explanation":"Negative values swap exactly the same way as positive ones."},{"input":"a = 0, b = 0","output":"a = 0, b = 0","explanation":"Equal values — after swapping, both are still 0."},{"input":"a = 100, b = 1","output":"a = 1, b = 100","explanation":"Order fully reverses regardless of which value is bigger."}],
      constraints: ["a and b are integers.","Only assignment and arithmetic operations are allowed.","No arrays, lists, or other data structures may be used."],
      approach: "## Understanding the Problem\n\nWe need two variables to exchange their values. The naive mistake is writing:\n\n```\na = b\nb = a\n```\n\nThat does NOT swap — the first line overwrites a, so by the time the second line runs, a no longer holds its original value. Both end up holding b's value. We need to save the original value BEFORE overwriting it.\n\n## Approach 1: Temporary Variable (the reliable classic)\n\n1. Copy a into a temp variable: `temp = a`\n2. Overwrite a with b: `a = b`\n3. Put the saved original back into b: `b = temp`\n\n```\nStart:   a = 5   b = 10\nStep 1:  temp = 5\nStep 2:  a = 10\nStep 3:  b = 5\nDone:    a = 10  b = 5  ✅\n```\n\nThis works in every language and is impossible to get wrong. It uses exactly one extra variable — which the problem allows.\n\n## Approach 2: Parallel Assignment / Destructuring\n\nMany languages let you swap in one line — the right-hand side is evaluated first, then both assignments happen together:\n\n```python\na, b = b, a\n```\n\n```javascript\n[a, b] = [b, a];\n```\n\nBecause the right side is computed fully before any assignment, the original values are never lost. Clean and readable — but requires language support.\n\n## Approach 3: Arithmetic Trick (no temp at all)\n\n```\na = a + b\nb = a - b\na = a - b\n```\n\n```\nStart:  a=5 b=10\nStep 1: a=15 (5+10)\nStep 2: b=5  (15-10) -> b now holds old a ✅\nStep 3: a=10 (15-5)  -> a now holds old b ✅\n```\n\nWorks, but only for numbers, and can overflow in languages with fixed-size integers. It is a fun trick — not something you need in production code.\n\n## Complexity Analysis\n\n- **Time Complexity: O(1)** — a fixed number of operations regardless of the values.\n- **Space Complexity: O(1)** — at most one temporary variable.",
      codeBlocks: [{"language":"python","code":"# Approach 1: temporary variable (works everywhere)\ndef swap_temp(a, b):\n    temp = a\n    a = b\n    b = temp\n    return a, b\n\n# Approach 2: parallel assignment (Pythonic)\ndef swap_pythonic(a, b):\n    a, b = b, a\n    return a, b\n\nprint(swap_pythonic(5, 10))  # (10, 5)"},{"language":"javascript","code":"// Approach 1: temporary variable\nfunction swapTemp(a, b) {\n    let temp = a;\n    a = b;\n    b = temp;\n    return [a, b];\n}\n\n// Approach 2: destructuring assignment\nfunction swapDestructure(a, b) {\n    [a, b] = [b, a];\n    return [a, b];\n}\n\nconsole.log(swapDestructure(5, 10));  // [10, 5]"},{"language":"java","code":"// Java primitives are passed by value, so the swap\n// must return the new pair (or use a 2-element array).\npublic static int[] swap(int a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n    return new int[] { a, b };  // {10, 5}\n}"}],
      timeComplexity: "O(1)", spaceComplexity: "O(1)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    },
{
      slug: "convert-between-data-types", lessonSlug: "variables-data-types-operators", subtopicSlug: "type-conversion",
      title: "Convert Between Data Types", difficulty: "easy",
      topics: ["Type Conversion","Basics"],
      companies: ["Amazon","Google","Meta"],
      problemStatement: "Write a function that safely converts a string of digits into an integer.\n\nThe input string may contain:\n- Optional leading or trailing spaces\n- An optional sign (+ or -)\n- Digits\n\nIf the string represents a valid integer, return it as an integer. If it is NOT a valid integer (e.g. contains letters, decimals, or is empty), return 0.\n\nFor example, \"42\" returns 42, \"  -7  \" returns -7, and \"abc\" returns 0.",
      examples: [{"input":"\"42\"","output":"42","explanation":"Plain digits convert directly to the integer 42."},{"input":"\"  -7  \"","output":"-7","explanation":"Spaces are ignored and the negative sign is respected."},{"input":"\"+13\"","output":"13","explanation":"An explicit plus sign is allowed and ignored."},{"input":"\"3.14\"","output":"0","explanation":"A decimal is not an integer — return 0, not a crash."},{"input":"\"abc\"","output":"0","explanation":"Non-digit characters make the conversion invalid — return 0."}],
      constraints: ["The string length is between 0 and 10,000 characters.","The string contains only spaces, an optional sign, and digits (for valid inputs).","If conversion fails, return 0 instead of throwing an error."],
      approach: "## Understanding the Problem\n\nWe must turn text that represents a number into an actual integer, and fail gracefully when the text is not a valid integer. This is a daily real-world task: forms, files, and APIs deliver numbers as strings.\n\n## Why \"Fail Gracefully\" Matters\n\nA naive call to the built-in conversion function throws an error (or returns a special NaN value in JavaScript) when the input is invalid. The problem wants 0 in those cases so the program never crashes.\n\n## Approach 1: Built-in Conversion + Safe Guard\n\n1. Strip leading/trailing whitespace from the string.\n2. Try to convert with the language's integer parser.\n3. If it throws (or reports \"not a number\"), return 0.\n4. Otherwise return the parsed integer.\n\n```python\ndef to_int(s):\n    try:\n        return int(s.strip())   # int() already handles the sign\n    except ValueError:\n        return 0\n```\n\nNote: `int(\"3.14\")` raises ValueError (a decimal is not an integer), so it correctly falls back to 0.\n\n## Approach 2: Manual Parsing (no built-in)\n\nSometimes the problem forbids built-in converters. Build the number yourself:\n\n1. Trim spaces.\n2. If the string is empty, return 0.\n3. Check the first character for + or - and remember the sign.\n4. Walk the remaining characters: if any is not a digit (0-9), return 0.\n5. Accumulate: `result = result * 10 + digit` for each digit.\n6. Apply the sign at the end.\n\n```\n\"  -7  \" -> trim -> \"-7\" -> sign = -1 -> digit 7\n         -> result = 0*10 + 7 = 7 -> return -1 * 7 = -7 ✅\n```\n\nThis teaches you what the built-in function actually does under the hood.\n\n## Complexity Analysis\n\n- **Time Complexity: O(n)** — each character is examined once.\n- **Space Complexity: O(1)** — only a few variables, no extra storage.\n\n## Edge Cases to Handle\n\n- Empty string `\"\"` → 0\n- Only spaces `\"   \"` → 0\n- Sign with no digits `\"-\"` → 0\n- Decimals `\"3.14\"` → 0\n- Letters `\"12abc\"` → 0\n- Very long strings → still handled in O(n)",
      codeBlocks: [{"language":"python","code":"def convert_to_int(s):\n    s = s.strip()\n    # Empty or sign-only input is invalid\n    if not s or s in (\"+\", \"-\"):\n        return 0\n    # Manual parse: digits only\n    start = 1 if s[0] in \"+-\" else 0\n    result = 0\n    for ch in s[start:]:\n        if not ch.isdigit():\n            return 0\n        result = result * 10 + int(ch)\n    return -result if s[0] == \"-\" else result\n\nprint(convert_to_int(\"42\"))     # 42\nprint(convert_to_int(\"  -7  \")) # -7\nprint(convert_to_int(\"abc\"))    # 0"},{"language":"javascript","code":"function convertToInt(s) {\n    const trimmed = s.trim();\n    // Empty or sign-only input is invalid\n    if (!trimmed || trimmed === \"+\" || trimmed === \"-\") return 0;\n    // Manual parse: digits only\n    let start = (trimmed[0] === \"+\" || trimmed[0] === \"-\") ? 1 : 0;\n    let result = 0;\n    for (let i = start; i < trimmed.length; i++) {\n        const ch = trimmed[i];\n        if (ch < \"0\" || ch > \"9\") return 0;\n        result = result * 10 + (ch.charCodeAt(0) - 48);\n    }\n    return trimmed[0] === \"-\" ? -result : result;\n}\n\nconsole.log(convertToInt(\"42\"));      // 42\nconsole.log(convertToInt(\"  -7  \"));  // -7\nconsole.log(convertToInt(\"abc\"));     // 0"},{"language":"java","code":"public static int convertToInt(String s) {\n    String t = s.trim();\n    // Empty or sign-only input is invalid\n    if (t.isEmpty() || t.equals(\"+\") || t.equals(\"-\")) return 0;\n    int start = (t.charAt(0) == '+' || t.charAt(0) == '-') ? 1 : 0;\n    int result = 0;\n    for (int i = start; i < t.length(); i++) {\n        char ch = t.charAt(i);\n        if (ch < '0' || ch > '9') return 0;   // invalid character\n        result = result * 10 + (ch - '0');\n    }\n    return (t.charAt(0) == '-') ? -result : result;\n}"}],
      timeComplexity: "O(n)", spaceComplexity: "O(1)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
    }
  ];

  const createdProblems = [];
  for (const prob of problems) {
    const created = await upsert(ProgrammingProblem, { slug: prob.slug }, prob, 'Problem "' + prob.title + '"');
    createdProblems.push(created);
  }

  /* ─── 4. Quizzes ─── */
  console.log('\n=== QUIZZES ===');

  const quizzes = [
{
      slug: "swap-two-variables",
      questions: [{"text":"What is a variable?","options":["A fixed number that never changes","A named container that stores a value in memory","A type of loop","A special character"],"correctIndex":1},{"text":"Which of these is NOT one of the four core data types?","options":["Integer","Float","Array","Boolean"],"correctIndex":2},{"text":"Which data type does the value \"42\" (with quotes) belong to?","options":["Integer","Float","Boolean","String"],"correctIndex":3},{"text":"Why is a single temporary variable enough to swap two values?","options":["Because we only read the values","Because it preserves the original value before it is overwritten","Because the computer swaps values automatically","Because integers are small"],"correctIndex":1},{"text":"What is the time complexity of swapping two variables?","options":["O(n)","O(log n)","O(1)","O(n^2)"],"correctIndex":2}]
    },
{
      slug: "convert-between-data-types",
      questions: [{"text":"What does the string \"42\" become after int(\"42\")?","options":["The string \"42\" again","The integer 42","42.0 (float)","Nothing — it errors"],"correctIndex":1},{"text":"Which of these inputs should return 0 for a safe string-to-int converter?","options":["\"42\"","\"-7\"","\"3.14\"","\"+13\""],"correctIndex":2},{"text":"In JavaScript, what does \"10\" + 5 produce?","options":["15 (number)","105 (string)","An error","10.5"],"correctIndex":1},{"text":"Why does the temporary-variable approach avoid the a = b; b = a bug?","options":["It uses two temp variables","It saves the original value before overwriting it","It sorts the values first","It does not use assignment"],"correctIndex":1},{"text":"What is the space complexity of converting a string to an integer manually?","options":["O(n) — a new string is created","O(n^2)","O(log n)","O(1) — only a few variables"],"correctIndex":3}]
    }
  ];

  for (const q of quizzes) {
    const problemDoc = createdProblems.find(p => p.slug === q.slug);
    if (problemDoc) {
      await upsertQuiz(problemDoc._id, 'ProgrammingProblem', q.questions);
    } else {
      console.error('[SEED] Problem "' + q.slug + '" not found in created problems — skipping quiz');
    }
  }

  /* ─── Done ─── */
  console.log('\n[SEED] Variables, Data Types & Operators lesson seeded successfully!');
  console.log('  Lesson:    1 (Variables, Data Types & Operators)');
  console.log('  Subtopics: ' + subtopics.length + ' (' + subtopics.map(s => s.title).join(', ') + ')');
  console.log('  Problems:  ' + problems.length + ' (' + problems.map(p => p.title).join(', ') + ')');
  console.log('  Quizzes:   ' + quizzes.length);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
