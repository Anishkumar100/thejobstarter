/*
 * Seed Strings lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_strings.mjs
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import DsaLesson from '../models/DsaLesson.js';
import Subtopic from '../models/Subtopic.js';
import Problem from '../models/Problem.js';
import Quiz from '../models/Quiz.js';

/* ─── Helpers ─── */
async function upsert(Model, query, data, label) {
  const result = await Model.findOneAndUpdate(query, data, { upsert: true, new: true });
  console.log(`[SEED] ${label}: ${result ? 'upserted' : 'failed'} (${JSON.stringify(query)})`);
  return result;
}

async function upsertQuiz(problemId, problemModel, questions) {
  const result = await Quiz.findOneAndUpdate(
    { problemId, problemModel },
    { problemId, problemModel, questions },
    { upsert: true, new: true }
  );
  console.log(`[SEED] Quiz for ${problemModel} ${problemId}: upserted (${questions.length} questions)`);
  return result;
}

/* ─── Connect ─── */
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected to MongoDB\n');

  /* ─── 1. Lesson ─── */
  console.log('=== LESSON ===');
  const lesson = await upsert(DsaLesson,
    { slug: 'strings' },
    {
      title: 'Strings',
      slug: 'strings',
      category: 'fundamentals-arrays-strings',
      description: 'Learn how strings work under the hood — character encoding, immutability, common operations, and two classic problems: palindrome checking and anagram detection.',
      image: '',
      icon: 'Type',
      order: 2,
      difficulty: 'easy',
      problemCount: 2
    },
    'Lesson "Strings"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
    {
      slug: 'string-basics', lessonSlug: 'strings', order: 0,
      title: 'String Basics',
      description: 'Learn what strings are, how they\'re stored in memory, why immutability matters, and the time complexity of common operations like access, concatenation, comparison, and substring.',
      explanation: '## What is a String?\n\nImagine a row of lockers, but instead of holding numbers, each locker holds a single letter. The lockers are numbered 0, 1, 2, 3, and so on — and the sequence of letters they contain, read from left to right, forms a word, a sentence, or any text you want to represent.\n\nA **string** is exactly that: an ordered sequence of characters stored in contiguous memory. Under the hood, a string is essentially an array of characters, with a few important differences that depend on the programming language you\'re using.\n\nIn most languages, the characters are encoded as numbers internally. Every character on your keyboard — and thousands that aren\'t — maps to a numeric code. The most common encodings you\'ll encounter are:\n\n- **ASCII** — The original standard, covering 128 characters (English letters, digits, punctuation, control codes). Each character takes 1 byte. \'A\' is 65, \'a\' is 97, \'0\' is 48.\n- **Unicode (UTF-8)** — The modern standard covering virtually every writing system on Earth. UTF-8 is backward-compatible with ASCII for the first 128 characters, and uses 1 to 4 bytes per character for everything else.\n\nWhen you see the string "Hello", the computer actually stores something like this in memory:\n\n```\nMemory: [72] [101] [108] [108] [111]\nChar:    H     e     l     l     o\nIndex:   0     1     2     3     4\n```\n\nEach slot holds the numeric encoding of the character. The computer knows to interpret those bytes as text rather than as integers.\n\n## Common String Operations and Their Cost\n\n### Access a Character by Index — O(1)\n\nGrabbing the character at a specific position (like `s[3]`) is just like array access — the computer calculates the memory address in one step. This is always O(1).\n\n### Find the Length — O(1) in most languages\n\nMost languages store the length of a string as metadata alongside the string data itself. Asking "how long is this string?" returns a pre-computed value instantly — no counting required.\n\n### Character Comparison — O(1)\n\nChecking whether two characters are the same is a single integer comparison. \'a\' == \'a\' is just checking whether 97 == 97 — one step.\n\n### String Equality (Full Comparison) — O(n)\n\nComparing whether two strings are identical character-by-character requires checking every position until you find a mismatch. In the worst case (they\'re equal, or they differ only in the last character), you check all n characters.\n\n```text\nFUNCTION strings_equal(a, b):\n    IF lengths of a and b are different:\n        RETURN False\n\n    FOR i FROM 0 TO length(a) - 1:\n        IF a[i] != b[i]:\n            RETURN False\n\n    RETURN True\n```\n\n### Concatenation — O(n + m) or worse\n\nJoining two strings together ("Hello" + "World") creates a brand new string in memory that combines both. If the original strings are immutable (as they are in Python, Java, JavaScript, and many other languages), the old strings aren\'t modified — a completely new block of memory is allocated, and both strings are copied into it.\n\nThis is why building a long string by repeatedly concatenating small pieces is expensive — every `+` operation creates a new string, copies everything, and discards the old one. For `k` concatenations, this can become O(k x total_length).\n\n### Substring — O(n) for extraction\n\nExtracting a portion of a string typically creates a new string and copies the characters. Even if the language uses a reference-based optimization (like JavaScript\'s shared substring in some engines), extraction usually involves a copy.\n\n## Immutability: The Most Important Concept\n\nIn many languages — Python, Java, JavaScript, C# — strings are **immutable**. Once a string is created, it can never be changed. Any operation that seems to "modify" a string actually creates a new one:\n\n```text\ns = "Hello"\ns = s + " World"   // Does NOT modify "Hello" — it creates "Hello World" and assigns it to s\n\n// The original "Hello" is still somewhere in memory, waiting to be garbage-collected\n```\n\nThis has real practical consequences:\n- Modifying a string in a loop is slow (each iteration creates a new string)\n- String comparisons can be optimized: if two strings are the same object (same reference), they must be equal\n- Strings are thread-safe — since they can\'t change, no synchronization is needed\n\n### The Fix: StringBuilder / String Buffer\n\nLanguages provide a mutable alternative for building strings efficiently:\n- Java: `StringBuilder` (not thread-safe, faster) or `StringBuffer` (thread-safe)\n- C#: `StringBuilder`\n- Python: using `list` of strings with `.join()`\n- JavaScript: using array of strings with `.join("")` or template literals\n\nThe idea is the same across all of them: maintain a mutable buffer that can grow without creating new objects, and only produce the final string when you\'re done.\n\n```text\n// Instead of:\ns = ""\nFOR EACH word IN words:\n    s = s + word + ", "     // Creates a new string every iteration\n\n// Use:\nbuffer = []\nFOR EACH word IN words:\n    buffer.append(word)\n    buffer.append(", ")\n\ns = join(buffer, "")         // One allocation at the end\n```\n\n## Strings vs Character Arrays\n\nIf strings are just arrays of characters, why not always use character arrays?\n\n| Aspect | String | Character Array |\n|---|---|---|\n| Mutability | Immutable (usually) | Mutable |\n| Convenience | Built-in methods (search, split, case conversion) | Manual loop for everything |\n| Performance | Copy on modification | Modify in place |\n| Use when | Text processing, display, comparison | Low-level manipulation, performance-critical hot paths |\n\n## When to Use Strings vs When to Think Differently\n\n- Use strings for **any text data** — names, sentences, paragraphs, identifiers\n- Think about **immutability** when you\'re building strings in loops (use StringBuilder or join)\n- Remember that **string comparison is O(n)** — comparing long strings repeatedly can become a bottleneck\n- Character encoding matters — a "character" might be 1 byte (ASCII) or up to 4 bytes (UTF-8 emoji)',
      image: '', youtubeUrl: '', pdfUrl: '', pptxUrl: ''
    },
    {
      slug: 'pattern-matching', lessonSlug: 'strings', order: 1,
      title: 'Pattern Matching',
      description: 'Learn how to check whether one string contains another, how to count character frequencies efficiently, and how to detect anagrams by comparing frequency maps instead of brute-force permutations.',
      explanation: '## What is Pattern Matching?\n\nImagine you have a deck of cards with letters on them, and someone asks: "Does this smaller deck of cards appear somewhere in this larger deck, in the same order?" You\'d slide the smaller deck along the larger one, checking at each position whether the cards match.\n\nThat\'s pattern matching in strings: checking whether a **pattern** (a smaller string) appears inside a **text** (a larger string), and if so, at what position.\n\nIn this lesson, we focus on a specific kind of pattern matching: **character frequency matching** — not whether a pattern appears in order, but whether two strings are made of the same characters in the same quantities. This is the essence of anagram detection.\n\n## Character Frequency: The Core Idea\n\nEvery string is built from characters, each of which appears a certain number of times. In "hello", the character \'h\' appears once, \'e\' once, \'l\' twice, and \'o\' once. The **frequency** of a character is simply how many times it occurs.\n\nIf two strings have identical character frequencies, they are **anagrams** — they contain the same letters in the same quantities, just in a different order.\n\n- "listen" and "silent" — both have one \'l\', one \'i\', one \'s\', one \'t\', one \'e\', one \'n\' — anagrams\n- "hello" and "bello" — different first characters — not anagrams\n- "aabbcc" and "abcabc" — each has two \'a\', two \'b\', two \'c\' — anagrams\n\n## How to Count Characters: The Frequency Map\n\nThe most natural way to count character frequencies is with a **hash map** (also called a dictionary or object):\n\n```text\nFUNCTION build_frequency_map(s):\n    freq = empty hash map\n\n    FOR EACH character c IN s:\n        IF c is in freq:\n            freq[c] = freq[c] + 1\n        ELSE:\n            freq[c] = 1\n\n    RETURN freq\n```\n\nThis runs in O(n) time — we visit each character exactly once — and uses O(k) space, where k is the number of distinct characters (at most 26 for lowercase English letters, or 128 for ASCII, or more for Unicode).\n\n### Alternative: Fixed-Size Array (for Known Alphabets)\n\nIf we know the character set is limited — for example, only lowercase English letters — we can use a fixed-size array instead of a hash map:\n\n```text\nFUNCTION build_frequency_array(s):\n    freq = array of size 26, all initialized to 0\n\n    FOR EACH character c IN s:\n        index = c - \'a\'      // \'a\' -> 0, \'b\' -> 1, ..., \'z\' -> 25\n        freq[index] = freq[index] + 1\n\n    RETURN freq\n```\n\nThis is slightly faster (array access is cheaper than hash map lookups) and uses exactly O(1) space — the array is always 26 elements, regardless of how long the string is.\n\n## Comparing Two Strings by Frequency\n\nOnce we have frequency maps (or arrays) for two strings, comparing them is straightforward:\n\n```text\nFUNCTION are_anagrams(s, t):\n    IF lengths of s and t are different:\n        RETURN False                      // Quick exit — must be same length\n\n    freq_s = build_frequency_map(s)\n    freq_t = build_frequency_map(t)\n\n    RETURN freq_s == freq_t               // Compare the two maps\n```\n\n### Why Length Check First?\n\nIf two strings have different lengths, they cannot possibly be anagrams — regardless of what characters they contain. This is a constant-time check that can save us from building frequency maps unnecessarily.\n\n## Time and Space Analysis\n\n| Approach | Time | Space | Notes |\n|---|---|---|---|\n| Brute force (generate all permutations) | O(n!) | O(n) | Impractical — 10! = 3,628,800 |\n| Sort both strings and compare | O(n log n) | O(n) (or O(1) if in-place) | Simple but slower for large n |\n| Frequency map (hash map) | O(n) | O(k) where k = distinct chars | Best general approach |\n| Frequency array (fixed alphabet) | O(n) | O(1) | Best when character set is known |\n\n## Beyond Anagrams: General Pattern Matching\n\nThe ideas you learn here extend beyond anagrams:\n\n- **Substring search** — does "abc" appear in "xabcy"? Use the sliding window technique you learned in Arrays.\n- **Character counting with sliding window** — find the longest substring with at most k distinct characters.\n- **Frequency difference** — what\'s the minimum number of character changes to make two strings anagrams?\n\nEach of these builds on the same foundation: efficiently counting and comparing character frequencies.',
      image: '', youtubeUrl: '', pdfUrl: '', pptxUrl: ''
    }
  ];

  for (const sub of subtopics) {
    await upsert(Subtopic, { slug: sub.slug }, sub, `Subtopic "${sub.title}"`);
  }

  /* ─── 3. Problems ─── */
  console.log('\n=== PROBLEMS ===');

  const problems = [
    {
      slug: 'check-palindrome', lessonSlug: 'strings', subtopicSlug: 'string-basics',
      title: 'Check Palindrome', difficulty: 'easy',
      topics: ['Strings', 'Two Pointers'], companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
      problemStatement: 'You are given a string made up of lowercase English letters. Your task is to determine whether it reads the same forward and backward — in other words, whether it is a palindrome.\n\nA palindrome is a word, phrase, or sequence that reads the same forwards and backwards. For example, "racecar" reversed is still "racecar".\n\nWrite a function that takes the string and returns True if it is a palindrome, and False otherwise.\n\nNote: You should ignore case differences and non-alphanumeric characters — only consider letters and digits, and treat uppercase and lowercase as the same. For this version of the problem, the input will only contain lowercase letters, so you don\'t need to handle case conversion or filtering.',
      examples: [
        { input: '"racecar"', output: 'True', explanation: 'r-a-c-e-c-a-r reads the same forwards and backwards.' },
        { input: '"hello"', output: 'False', explanation: 'h-e-l-l-o reversed is o-l-l-e-h, which is not the same.' },
        { input: '"a"', output: 'True', explanation: 'A single character is always a palindrome.' },
        { input: '""', output: 'True', explanation: 'An empty string is considered a palindrome.' }
      ],
      constraints: ['The string length is between 0 and 100,000 characters.', 'The string contains only lowercase English letters (a-z).'],
      approach: '## Understanding the Problem\n\nA palindrome is a string that reads the same forwards and backwards. "racecar" is a palindrome because when you reverse it, you get "racecar" back. "hello" is not because reversing gives "olleh".\n\nThis problem tests whether you understand array/string indexing and whether you can write a clean, efficient solution without unnecessary work.\n\n### Step 1 — The Obvious Approach: Reverse and Compare\n\nThe simplest way to check for a palindrome is to reverse the string and compare it to the original:\n\n```text\nFUNCTION is_palindrome_reverse(s):\n    reversed_s = reverse(s)\n    RETURN s == reversed_s\n```\n\nThis works, but it creates a copy of the entire string (O(n) extra memory) and requires O(n) time for the reversal plus O(n) for the comparison.\n\n### Step 2 — The Two-Pointer Approach (Optimal)\n\nThis is where the two-pointer technique comes in again:\n\n1. Place one pointer at the beginning (index 0) and one at the end (last index)\n2. Compare the characters at these two positions\n3. If they match, move the left pointer right by 1 and the right pointer left by 1\n4. If they don\'t match, return False — it\'s not a palindrome\n5. If the pointers meet or cross without finding a mismatch, return True\n\nLet\'s trace on "racecar":\n\n```\nInitial:  r  a  c  e  c  a  r\n          L                    R\n\nStep 1: r == r -> move pointers\nStep 2: a == a -> move pointers\nStep 3: c == c -> move pointers\nStep 4: e (middle) — pointers meet, L == R\n\nAll characters matched -> True (it\'s a palindrome)\n```\n\nNow trace on "hello":\n\n```\nInitial:  h  e  l  l  o\n          L              R\n\nStep 1: h != o -> return False immediately\n\nFirst pair doesn\'t match -> not a palindrome\n```\n\n### Step 3 — Why This Works\n\nA palindrome requires that every character at position i matches the character at position (n-1-i). By comparing from both ends simultaneously, we check all required pairs. As soon as we find one mismatch, we can stop — the string cannot be a palindrome.\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — we check at most n/2 pairs of characters.\n- **Space Complexity: O(1)** — only two index variables, regardless of string length.\n\n### Python Code\n\n```python\ndef is_palindrome(s):\n    left = 0\n    right = len(s) - 1\n\n    while left < right:\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right -= 1\n\n    return True\n```\n\n### JavaScript Code\n\n```javascript\nfunction isPalindrome(s) {\n    let left = 0;\n    let right = s.length - 1;\n\n    while (left < right) {\n        if (s[left] !== s[right]) {\n            return false;\n        }\n        left++;\n        right--;\n    }\n\n    return true;\n}\n```',
      codeBlocks: [
        { language: 'python', code: 'def is_palindrome(s):\n    left = 0\n    right = len(s) - 1\n\n    while left < right:\n        if s[left] != s[right]:\n            return False\n        left += 1\n        right -= 1\n\n    return True' },
        { language: 'javascript', code: 'function isPalindrome(s) {\n    let left = 0;\n    let right = s.length - 1;\n\n    while (left < right) {\n        if (s[left] !== s[right]) {\n            return false;\n        }\n        left++;\n        right--;\n    }\n\n    return true;\n}' }
      ],
      timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
      youtubeUrl: '', pdfUrl: '', pptxUrl: '', media: []
    },
    {
      slug: 'valid-anagram', lessonSlug: 'strings', subtopicSlug: 'pattern-matching',
      title: 'Valid Anagram', difficulty: 'easy',
      topics: ['Strings', 'Hash Map'], companies: ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Uber'],
      problemStatement: 'You are given two strings, s and t, made up of lowercase English letters. Your task is to determine whether t is an anagram of s.\n\nAn anagram is a word or phrase formed by rearranging the letters of another word or phrase, using all original letters exactly once. For example, "listen" and "silent" are anagrams because they contain the same letters: one \'l\', one \'i\', one \'s\', one \'t\', one \'e\', one \'n\'.\n\nWrite a function that takes s and t, and returns True if t is an anagram of s, and False otherwise.\n\nNote: both strings contain only lowercase English letters, so you don\'t need to worry about spaces, punctuation, or case sensitivity.',
      examples: [
        { input: 's = "anagram", t = "nagaram"', output: 'True', explanation: 'Both strings contain three \'a\'s, one \'n\', one \'g\', one \'r\', one \'m\' — just in different orders.' },
        { input: 's = "rat", t = "car"', output: 'False', explanation: '"rat" contains r, a, t. "car" contains c, a, r. They share \'a\' and \'r\', but \'t\' vs \'c\' means they\'re not anagrams.' },
        { input: 's = "a", t = "ab"', output: 'False', explanation: 'Different lengths — they can\'t be anagrams. \'a\' has only one letter, \'ab\' has two.' },
        { input: 's = "", t = ""', output: 'True', explanation: 'Two empty strings are trivially anagrams — both contain zero of every character.' }
      ],
      constraints: ['Each string length is between 0 and 50,000 characters.', 'Both strings contain only lowercase English letters (a-z).'],
      approach: '## Understanding the Problem\n\nTwo strings are anagrams if they use the same characters in the same quantities. The order doesn\'t matter — only the frequency of each character.\n\n### Step 1 — The Quick Exit: Different Lengths\n\nIf s and t have different lengths, they cannot possibly be anagrams. This is an O(1) check that lets us return False immediately without any further work.\n\n### Step 2 — The Frequency Array Approach\n\nSince we know both strings contain only lowercase English letters (26 possible characters), we can use a fixed-size array of 26 integers instead of a hash map. This is more efficient:\n\n1. Create an array of size 26, initialized to 0\n2. For each character in s, increment the corresponding position in the array\n3. For each character in t, decrement the corresponding position\n4. If every position in the array is 0 at the end, they\'re anagrams\n\nWhy does this work? If we add 1 for each character in s and subtract 1 for each character in t, and the strings use the same characters in the same quantities, everything cancels out to zero.\n\nLet\'s trace on "anagram" and "nagaram":\n\n```\nInitialize: count[26] = [0, 0, 0, ..., 0]\n\nProcessing s = "anagram":\n  \'a\' -> count[0] = 1\n  \'n\' -> count[13] = 1\n  \'a\' -> count[0] = 2\n  \'g\' -> count[6] = 1\n  \'r\' -> count[17] = 1\n  \'a\' -> count[0] = 3\n  \'m\' -> count[12] = 1\n\nProcessing t = "nagaram":\n  \'n\' -> count[13] = 0  (subtract 1)\n  \'a\' -> count[0] = 2\n  \'g\' -> count[6] = 0\n  \'a\' -> count[0] = 1\n  \'r\' -> count[17] = 0\n  \'a\' -> count[0] = 0\n  \'m\' -> count[12] = 0\n\nFinal count array: all zeros -> True (they are anagrams)\n```\n\n### Step 3 — The Hash Map Approach (General Case)\n\nIf the strings could contain any Unicode characters (not just \'a\' to \'z\'), a fixed-size array won\'t work. Instead, use a hash map:\n\n```text\nFUNCTION is_anagram(s, t):\n    IF length(s) != length(t):\n        RETURN False\n\n    freq = empty hash map\n\n    FOR EACH character c IN s:\n        freq[c] = freq[c] + 1\n\n    FOR EACH character c IN t:\n        IF c NOT IN freq OR freq[c] == 0:\n            RETURN False       // Extra character or wrong count\n        freq[c] = freq[c] - 1\n\n    RETURN True\n```\n\nNotice: instead of building a separate map for t and comparing, we increment for s and decrement for t. This saves memory and lets us detect mismatches early.\n\n### Step 4 — Why This Works\n\nThe counting approach works because anagram detection is fundamentally about comparing multisets (sets where elements can appear multiple times). By counting each character\'s occurrences and checking that the counts match, we\'re effectively asking: "Are these two strings identical as multisets of characters?"\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — we make two passes over strings of length n.\n- **Space Complexity: O(1)** — the array is always 26 elements. Even with a hash map, the space is O(k) where k is the number of distinct characters (at most 26 for lowercase letters).\n\n### Python Code\n\n```python\ndef is_anagram(s, t):\n    if len(s) != len(t):\n        return False\n\n    count = [0] * 26\n\n    for i in range(len(s)):\n        count[ord(s[i]) - ord(\'a\')] += 1\n        count[ord(t[i]) - ord(\'a\')] -= 1\n\n    for c in count:\n        if c != 0:\n            return False\n\n    return True\n```\n\n### JavaScript Code\n\n```javascript\nfunction isAnagram(s, t) {\n    if (s.length !== t.length) {\n        return false;\n    }\n\n    const count = new Array(26).fill(0);\n\n    for (let i = 0; i < s.length; i++) {\n        count[s.charCodeAt(i) - 97]++;\n        count[t.charCodeAt(i) - 97]--;\n    }\n\n    for (const c of count) {\n        if (c !== 0) {\n            return false;\n        }\n    }\n\n    return true;\n}\n```',
      codeBlocks: [
        { language: 'python', code: 'def is_anagram(s, t):\n    if len(s) != len(t):\n        return False\n\n    count = [0] * 26\n\n    for i in range(len(s)):\n        count[ord(s[i]) - ord(\'a\')] += 1\n        count[ord(t[i]) - ord(\'a\')] -= 1\n\n    for c in count:\n        if c != 0:\n            return False\n\n    return True' },
        { language: 'javascript', code: 'function isAnagram(s, t) {\n    if (s.length !== t.length) {\n        return false;\n    }\n\n    const count = new Array(26).fill(0);\n\n    for (let i = 0; i < s.length; i++) {\n        count[s.charCodeAt(i) - 97]++;\n        count[t.charCodeAt(i) - 97]--;\n    }\n\n    for (const c of count) {\n        if (c !== 0) {\n            return false;\n        }\n    }\n\n    return true;\n}' }
      ],
      timeComplexity: 'O(n)', spaceComplexity: 'O(1)',
      youtubeUrl: '', pdfUrl: '', pptxUrl: '', media: []
    }
  ];

  const createdProblems = [];
  for (const prob of problems) {
    const created = await upsert(Problem, { slug: prob.slug }, prob, `Problem "${prob.title}"`);
    createdProblems.push(created);
  }

  /* ─── 4. Quizzes ─── */
  console.log('\n=== QUIZZES ===');

  const quizzes = [
    {
      slug: 'check-palindrome',
      questions: [
        { text: 'What does it mean for a string to be a palindrome?', options: ['It contains only letters that appear twice', 'It reads the same forwards and backwards', 'It has an even number of characters', 'It starts and ends with the same letter'], correctIndex: 1 },
        { text: 'In the two-pointer approach, when can we safely return False?', options: ['After checking all pairs', 'As soon as we find a pair of characters that don\'t match', 'When the left pointer passes the middle', 'When the string length is odd'], correctIndex: 1 },
        { text: 'How many character comparisons does the two-pointer approach make in the worst case?', options: ['n comparisons (every character against the middle)', 'n/2 comparisons (half the string against the other half)', 'n^2 comparisons (every character against every other)', '1 comparison (just the first and last)'], correctIndex: 1 },
        { text: 'For the input "abcdefedcba", what does the algorithm return?', options: ['True, because it\'s a palindrome', 'False, because the length is odd', 'False, because \'b\' doesn\'t match \'a\'', 'True, because all characters are unique'], correctIndex: 0 },
        { text: 'What is the space complexity of the two-pointer palindrome check?', options: ['O(n) — we need to reverse the string first', 'O(n) — we need extra space for the pointers', 'O(1) — we only use a constant amount of extra memory', 'O(log n) — we halve the string at each step'], correctIndex: 2 }
      ]
    },
    {
      slug: 'valid-anagram',
      questions: [
        { text: 'What is the quickest way to determine two strings are NOT anagrams?', options: ['Check if they are exactly equal', 'Check if they have different lengths', 'Check if they start with different letters', 'Sort both strings and compare'], correctIndex: 1 },
        { text: 'In the frequency array approach, why do we use an array of size 26?', options: ['Because 26 is the maximum string length allowed', 'Because there are 26 letters in the English alphabet', 'Because arrays can only hold 26 elements', 'Because we need to count 26 different frequencies per character'], correctIndex: 1 },
        { text: 'After processing both strings, if the frequency array contains all zeros, what does that mean?', options: ['Both strings were empty', 'Every character appeared an even number of times', 'The two strings are anagrams of each other', 'The two strings are identical'], correctIndex: 2 },
        { text: 'What is the time complexity of the frequency array approach?', options: ['O(1) — constant time regardless of string length', 'O(log n) — we keep dividing the problem', 'O(n log n) — the sorting step is the bottleneck', 'O(n) — we iterate through the strings linearly'], correctIndex: 3 },
        { text: 'When would you use a hash map instead of a fixed-size array for this problem?', options: ['Never — arrays are always better', 'When the strings are very long', 'When the characters could be any Unicode character, not just a-z', 'When you want the answer to be case-sensitive'], correctIndex: 2 }
      ]
    }
  ];

  for (const q of quizzes) {
    const problem = createdProblems.find(p => p.slug === q.slug);
    if (problem) {
      await upsertQuiz(problem._id, 'Problem', q.questions);
    } else {
      console.error(`[SEED] Problem "${q.slug}" not found in created problems — skipping quiz`);
    }
  }

  /* ─── Done ─── */
  console.log('\n[SEED] Strings lesson seeded successfully!');
  console.log(`  Lesson:    1 (Strings)`);
  console.log(`  Subtopics: ${subtopics.length} (String Basics, Pattern Matching)`);
  console.log(`  Problems:  ${problems.length} (Check Palindrome, Valid Anagram)`);
  console.log(`  Quizzes:   ${quizzes.length}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
