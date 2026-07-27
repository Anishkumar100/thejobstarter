# DSA Learning Document — Strings

> A comprehensive, student-friendly guide to Strings — character encoding, immutability, pattern matching, and classic string problems.
> Master string manipulation, palindrome checking, and anagram detection.

---

# 2. Strings

> **Lesson Overview:** Strings are everywhere in programming — names, passwords, messages, DNA sequences. Learn how they work in memory, why immutability matters, and two essential problem-solving techniques.
> - **Category:** Fundamentals: Arrays & Strings
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 2.1 String Basics

### What is a String?

Imagine a row of lockers, but instead of holding numbers, each locker holds a single letter. The lockers are numbered 0, 1, 2, 3, and so on — and the sequence of letters they contain, read from left to right, forms a word, a sentence, or any text you want to represent.

A **string** is exactly that: an ordered sequence of characters stored in contiguous memory. Under the hood, a string is essentially an array of characters, with a few important differences that depend on the programming language you are using.

In most languages, the characters are encoded as numbers internally. Every character on your keyboard — and thousands that are not — maps to a numeric code. The most common encodings you will encounter are:

- **ASCII** — The original standard, covering 128 characters (English letters, digits, punctuation, control codes). Each character takes 1 byte. A is 65, a is 97, 0 is 48.
- **Unicode (UTF-8)** — The modern standard covering virtually every writing system on Earth. UTF-8 is backward-compatible with ASCII for the first 128 characters, and uses 1 to 4 bytes per character for everything else.

When you see the string `Hello`, the computer actually stores something like this in memory:

```
Memory: [72] [101] [108] [108] [111]
Char:    H     e     l     l     o
Index:   0     1     2     3     4
```

Each slot holds the numeric encoding of the character. The computer knows to interpret those bytes as text rather than as integers.

### Common String Operations and Their Cost

**Access a Character by Index — O(1)**

Grabbing the character at a specific position (like `s[3]`) is just like array access — the computer calculates the memory address in one step. This is always O(1).

**Find the Length — O(1) in most languages**

Most languages store the length of a string as metadata alongside the string data itself. Asking "how long is this string?" returns a pre-computed value instantly — no counting required.

**Character Comparison — O(1)**

Checking whether two characters are the same is a single integer comparison. `a == a` is just checking whether 97 equals 97 — one step.

**String Equality (Full Comparison) — O(n)**

Comparing whether two strings are identical character-by-character requires checking every position until you find a mismatch. In the worst case (they are equal, or they differ only in the last character), you check all n characters.

```text
FUNCTION strings_equal(a, b):
    IF lengths of a and b are different:
        RETURN False
    FOR i FROM 0 TO length(a) - 1:
        IF a[i] != b[i]:
            RETURN False
    RETURN True
```

**Concatenation — O(n + m) or worse**

Joining two strings together (`Hello` + `World`) creates a brand new string in memory that combines both. If the original strings are immutable (as they are in Python, Java, JavaScript, and many other languages), the old strings are not modified — a completely new block of memory is allocated, and both strings are copied into it.

This is why building a long string by repeatedly concatenating small pieces is expensive — every `+` operation creates a new string, copies everything, and discards the old one. For k concatenations, this can become O(k * total_length).

**Substring — O(n) for extraction**

Extracting a portion of a string typically creates a new string and copies the characters. Even if the language uses a reference-based optimization (like shared substring in some engines), extraction usually involves a copy.

### Immutability: The Most Important Concept

In many languages — Python, Java, JavaScript, C# — strings are **immutable**. Once a string is created, it can never be changed. Any operation that seems to modify a string actually creates a new one:

```text
s = "Hello"
s = s + " World"   // Does NOT modify "Hello" — creates "Hello World" and assigns it to s
// The original "Hello" is still in memory, waiting to be garbage-collected
```

This has real practical consequences:
- Modifying a string in a loop is slow (each iteration creates a new string)
- String comparisons can be optimized: if two strings are the same object (same reference), they must be equal
- Strings are thread-safe — since they cannot change, no synchronization is needed

### The Fix: StringBuilder / String Buffer

Languages provide a mutable alternative for building strings efficiently:
- Java: `StringBuilder` (not thread-safe, faster) or `StringBuffer` (thread-safe)
- C#: `StringBuilder`
- Python: using `list` of strings with `.join()`
- JavaScript: using array of strings with `.join("")` or template literals

The idea is the same across all of them: maintain a mutable buffer that can grow without creating new objects, and only produce the final string when you are done.

```text
// Instead of:
s = ""
FOR EACH word IN words:
    s = s + word + ", "     // Creates a new string every iteration

// Use:
buffer = []
FOR EACH word IN words:
    buffer.append(word)
    buffer.append(", ")
s = join(buffer, "")         // One allocation at the end
```

### Strings vs Character Arrays

If strings are just arrays of characters, why not always use character arrays?

| Aspect | String | Character Array |
|---|---|---|
| Mutability | Immutable (usually) | Mutable |
| Convenience | Built-in methods (search, split, case conversion) | Manual loop for everything |
| Performance | Copy on modification | Modify in place |
| Use when | Text processing, display, comparison | Low-level manipulation, performance-critical |

### When to Use Strings vs When to Think Differently

- Use strings for **any text data** — names, sentences, paragraphs, identifiers
- Think about **immutability** when building strings in loops (use StringBuilder or join)
- Remember that **string comparison is O(n)** — comparing long strings repeatedly can become a bottleneck
- Character encoding matters — a character might be 1 byte (ASCII) or up to 4 bytes (UTF-8 emoji)

---

## 2.2 Pattern Matching

### What is Pattern Matching?

Imagine you have a deck of cards with letters on them, and someone asks: "Does this smaller deck of cards appear somewhere in this larger deck, in the same order?" You slide the smaller deck along the larger one, checking at each position whether the cards match.

That is pattern matching in strings: checking whether a **pattern** (a smaller string) appears inside a **text** (a larger string), and if so, at what position.

In this lesson, we focus on a specific kind of pattern matching: **character frequency matching** — not whether a pattern appears in order, but whether two strings are made of the same characters in the same quantities. This is the essence of anagram detection.

### Character Frequency: The Core Idea

Every string is built from characters, each of which appears a certain number of times. In `hello`, the character `h` appears once, `e` once, `l` twice, and `o` once. The **frequency** of a character is simply how many times it occurs.

If two strings have identical character frequencies, they are **anagrams** — they contain the same letters in the same quantities, just in a different order.

- `listen` and `silent` — both have one l, one i, one s, one t, one e, one n — anagrams
- `hello` and `bello` — different first characters — not anagrams
- `aabbcc` and `abcabc` — each has two a, two b, two c — anagrams

### How to Count Characters: The Frequency Map

The most natural way to count character frequencies is with a **hash map** (also called a dictionary or object):

```text
FUNCTION build_frequency_map(s):
    freq = empty hash map
    FOR EACH character c IN s:
        IF c is in freq:
            freq[c] = freq[c] + 1
        ELSE:
            freq[c] = 1
    RETURN freq
```

This runs in O(n) time — we visit each character exactly once — and uses O(k) space, where k is the number of distinct characters (at most 26 for lowercase English letters, or 128 for ASCII, or more for Unicode).

**Alternative: Fixed-Size Array (for Known Alphabets)**

If we know the character set is limited — for example, only lowercase English letters — we can use a fixed-size array instead of a hash map:

```text
FUNCTION build_frequency_array(s):
    freq = array of size 26, all initialized to 0
    FOR EACH character c IN s:
        index = c - a      // a -> 0, b -> 1, ..., z -> 25
        freq[index] = freq[index] + 1
    RETURN freq
```

This is slightly faster (array access is cheaper than hash map lookups) and uses exactly O(1) space — the array is always 26 elements, regardless of how long the string is.

### Comparing Two Strings by Frequency

Once we have frequency maps (or arrays) for two strings, comparing them is straightforward:

```text
FUNCTION are_anagrams(s, t):
    IF lengths of s and t are different:
        RETURN False
    freq_s = build_frequency_map(s)
    freq_t = build_frequency_map(t)
    RETURN freq_s == freq_t
```

**Why Length Check First?**

If two strings have different lengths, they cannot possibly be anagrams — regardless of what characters they contain. This is a constant-time check that can save us from building frequency maps unnecessarily.

### Time and Space Analysis

| Approach | Time | Space | Notes |
|---|---|---|---|
| Brute force (generate all permutations) | O(n!) | O(n) | Impractical — 10! = 3,628,800 |
| Sort both strings and compare | O(n log n) | O(n) (or O(1) if in-place) | Simple but slower for large n |
| Frequency map (hash map) | O(n) | O(k) where k = distinct chars | Best general approach |
| Frequency array (fixed alphabet) | O(n) | O(1) | Best when character set is known |

### Beyond Anagrams: General Pattern Matching

The ideas you learn here extend beyond anagrams:

- **Substring search** — does `abc` appear in `xabcy`? Use the sliding window technique.
- **Character counting with sliding window** — find the longest substring with at most k distinct characters.
- **Frequency difference** — what is the minimum number of character changes to make two strings anagrams?

Each of these builds on the same foundation: efficiently counting and comparing character frequencies.

---

# 3. Problems

## 3.1 Check Palindrome

**Difficulty:** Easy  
**Topics:** Strings, Two Pointers  
**Companies:** Amazon, Google, Microsoft, Apple

### Problem Statement

You are given a string made up of lowercase English letters. Determine whether it reads the same forward and backward — in other words, whether it is a palindrome.

A palindrome is a word, phrase, or sequence that reads the same forwards and backwards. For example, `racecar` reversed is still `racecar`.

Write a function that takes the string and returns `True` if it is a palindrome, and `False` otherwise.

### Examples

| Input | Output | Explanation |
|---|---|---|
| `racecar` | True | r-a-c-e-c-a-r reads the same forwards and backwards |
| `hello` | False | h-e-l-l-o reversed is o-l-l-e-h |
| `a` | True | A single character is always a palindrome |
| (empty) | True | An empty string is considered a palindrome |

### Constraints

- The string length is between 0 and 100,000 characters.
- The string contains only lowercase English letters (a-z).

### Approach

#### Step 1 — The Obvious Way: Reverse and Compare

The simplest way to check for a palindrome is to reverse the string and compare it to the original:

```text
FUNCTION is_palindrome_reverse(s):
    reversed_s = reverse(s)
    RETURN s == reversed_s
```

This works, but it creates a copy of the entire string (O(n) extra memory) and requires O(n) time for both reversal and comparison.

#### Step 2 — The Two-Pointer Approach (Optimal)

This is where the two-pointer technique shines:

1. Place one pointer at the beginning (index 0) and one at the end (last index)
2. Compare the characters at these two positions
3. If they match, move the left pointer right and the right pointer left
4. If they don't match, return `False` — it is not a palindrome
5. If the pointers meet or cross without finding a mismatch, return `True`

Trace on `racecar`:

```
Initial:  r  a  c  e  c  a  r
          L                    R
Step 1: r == r -> move pointers
Step 2: a == a -> move pointers
Step 3: c == c -> move pointers
Step 4: e (middle) — pointers meet, L == R
All characters matched -> True
```

Trace on `hello`:

```
Initial:  h  e  l  l  o
          L              R
Step 1: h != o -> return False immediately
```

#### Step 3 — Why This Works

A palindrome requires that every character at position i matches the character at position (n-1-i). By comparing from both ends simultaneously, we check all required pairs. As soon as we find one mismatch, we can stop — the string cannot be a palindrome.

#### Complexity Analysis

- **Time Complexity: O(n)** — we check at most n/2 pairs of characters.
- **Space Complexity: O(1)** — only two index variables, regardless of string length.

### Python Solution

```python
def is_palindrome(s):
    left = 0
    right = len(s) - 1

    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1

    return True
```

### JavaScript Solution

```javascript
function isPalindrome(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        if (s[left] !== s[right]) {
            return false;
        }
        left++;
        right--;
    }

    return true;
}
```

---

## 3.2 Valid Anagram

**Difficulty:** Easy  
**Topics:** Strings, Hash Map  
**Companies:** Amazon, Google, Microsoft, Facebook, Uber

### Problem Statement

You are given two strings, `s` and `t`, made up of lowercase English letters. Determine whether `t` is an anagram of `s`.

An anagram is a word or phrase formed by rearranging the letters of another word or phrase, using all original letters exactly once. For example, `listen` and `silent` are anagrams because they contain the same letters: one l, one i, one s, one t, one e, one n.

Write a function that returns `True` if `t` is an anagram of `s`, and `False` otherwise.

### Examples

| Input | Output | Explanation |
|---|---|---|
| s = `anagram`, t = `nagaram` | True | Same letters: three a, one n, one g, one r, one m |
| s = `rat`, t = `car` | False | t vs c — different letters |
| s = `a`, t = `ab` | False | Different lengths |
| s = ``, t = `` | True | Both empty — trivially anagrams |

### Constraints

- Each string length is between 0 and 50,000 characters.
- Both strings contain only lowercase English letters (a-z).

### Approach

#### Step 1 — The Quick Exit: Different Lengths

If `s` and `t` have different lengths, they cannot possibly be anagrams. This is an O(1) check that lets us return `False` immediately.

#### Step 2 — The Frequency Array Approach

Since both strings contain only lowercase English letters (26 possible characters), we can use a fixed-size array of 26 integers instead of a hash map:

1. Create an array of size 26, initialized to 0
2. For each character in `s`, increment the corresponding position
3. For each character in `t`, decrement the corresponding position
4. If every position in the array is 0 at the end, they are anagrams

Trace on `anagram` and `nagaram`:

```
Initialize: count[26] = [0, 0, 0, ..., 0]

Processing s = "anagram":
  a -> count[0] = 1
  n -> count[13] = 1
  a -> count[0] = 2
  g -> count[6] = 1
  r -> count[17] = 1
  a -> count[0] = 3
  m -> count[12] = 1

Processing t = "nagaram":
  n -> count[13] = 0
  a -> count[0] = 2
  g -> count[6] = 0
  a -> count[0] = 1
  r -> count[17] = 0
  a -> count[0] = 0
  m -> count[12] = 0

Final: all zeros -> True (they are anagrams)
```

#### Step 3 — The Hash Map Approach (General Case)

If the strings could contain any Unicode characters, a fixed-size array won't work. Use a hash map:

```text
FUNCTION is_anagram(s, t):
    IF length(s) != length(t):
        RETURN False

    freq = empty hash map
    FOR EACH character c IN s:
        freq[c] = freq[c] + 1
    FOR EACH character c IN t:
        IF c NOT IN freq OR freq[c] == 0:
            RETURN False
        freq[c] = freq[c] - 1
    RETURN True
```

Instead of building a separate map for `t`, we increment for `s` and decrement for `t`. This saves memory and detects mismatches early.

#### Step 4 — Why This Works

Anagram detection is fundamentally about comparing multisets (sets where elements can appear multiple times). By counting each character's occurrences and checking that the counts match, we are effectively asking: "Are these two strings identical as multisets of characters?"

#### Complexity Analysis

- **Time Complexity: O(n)** — we make two passes over strings of length n.
- **Space Complexity: O(1)** — the array is always 26 elements.

### Python Solution

```python
def is_anagram(s, t):
    # Different lengths cannot be anagrams
    if len(s) != len(t):
        return False

    # Array of 26 zeros for a through z
    count = [0] * 26

    # Count characters in s, decrement for t
    for i in range(len(s)):
        count[ord(s[i]) - ord("a")] += 1
        count[ord(t[i]) - ord("a")] -= 1

    # All counts should be zero
    for c in count:
        if c != 0:
            return False

    return True
```

### JavaScript Solution

```javascript
function isAnagram(s, t) {
    // Different lengths cannot be anagrams
    if (s.length !== t.length) {
        return false;
    }

    // Array of 26 zeros for a through z
    const count = new Array(26).fill(0);

    // Count characters in s, decrement for t
    for (let i = 0; i < s.length; i++) {
        count[s.charCodeAt(i) - 97]++;
        count[t.charCodeAt(i) - 97]--;
    }

    // All counts should be zero
    for (const c of count) {
        if (c !== 0) {
            return false;
        }
    }

    return true;
}
```
