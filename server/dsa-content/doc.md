# DSA Learning Document — Searching

> A comprehensive, student-friendly guide to Searching — linear search and binary search.
> Master the divide-and-conquer approach and understand why binary search is exponentially faster than linear search.

---

# 2. Searching

> **Lesson Overview:** Searching is one of the most fundamental operations in programming. Learn two approaches: Linear Search (check every element) and Binary Search (repeatedly cut the search space in half).
> - **Category:** Searching, Sorting & Hashing
> - **Difficulty:** Easy
> - **Problems:** 1

---

## 2.1 Linear & Binary Search

### What is Searching?

Imagine you have lost your keys somewhere in your house. You have two strategies:

1. **The Room-by-Room Method** — Start in one corner and check every single drawer, every shelf, every pocket until you find them. You might find them in the first place you look, or you might check every single spot in the entire house before giving up.

2. **The Smart Method** — But this only works if you know something about where you lost them. You remember you last had them in either the kitchen or the living room, so you check only those two rooms first. Then you narrow it down further.

Searching in programming is the same idea: given a list of items and a target value, find out whether the target exists in the list, and if so, where.

There are two fundamental approaches, and the one you should use depends entirely on whether your data is **sorted** or not.

### Linear Search — The Room-by-Room Method

#### How It Works

Linear search is the simplest search algorithm. You start at the beginning of the list and check every single element, one after another, until you find what you are looking for or reach the end.

```text
FUNCTION linear_search(arr, target):
    FOR i FROM 0 TO length(arr) - 1:
        IF arr[i] == target:
            RETURN i          // Found it at index i

    RETURN -1                   // Not found after checking everything
```

#### Trace It

Say you have `[4, 2, 9, 1, 7]` and you are looking for `9`:

```
i=0: arr[0] = 4 -> not 9, keep going
i=1: arr[1] = 2 -> not 9, keep going
i=2: arr[2] = 9 -> found! Return 2
```

Only 3 checks out of 5. Lucky.

But what if you are looking for `10` (which does not exist)?

```
i=0: 4 != 10
i=1: 2 != 10
i=2: 9 != 10
i=3: 1 != 10
i=4: 7 != 10
End of list -> Return -1
```

You checked every single element — all 5 of them.

#### When to Use Linear Search

- The list is **unsorted** (you have no choice)
- The list is **very small** (the simplicity outweighs any performance gain)
- You only need to search **once** (the cost of sorting is not worth it)

#### Time Complexity

- **Best case: O(1)** — the target is the very first element
- **Worst case: O(n)** — the target is last, or does not exist at all. You check all n elements.
- **Average case: O(n)** — on average, you check n/2 elements

#### Space Complexity

- **O(1)** — you only need a single index variable

### Binary Search — The Divide-and-Conquer Method

#### How It Works

Binary search is dramatically faster, but it comes with one crucial requirement: **the data must be sorted**.

The idea is simple and powerful:

1. Look at the middle element of the list
2. If it is the target, you are done
3. If the target is smaller than the middle, repeat the process on the **left half** of the list
4. If the target is larger, repeat on the **right half**
5. Keep going until you find it or the search space is empty

At every step, you eliminate **half** of the remaining elements. This is why it is so fast.

```text
FUNCTION binary_search(arr, target):
    left = 0
    right = length(arr) - 1

    WHILE left <= right:
        mid = left + (right - left) / 2   // Integer division

        IF arr[mid] == target:
            RETURN mid                     // Found it
        ELSE IF arr[mid] < target:
            left = mid + 1                 // Target is in the right half
        ELSE:
            right = mid - 1                // Target is in the left half

    RETURN -1                              // Not found
```

> **Important:** The formula `mid = left + (right - left) / 2` is used instead of `mid = (left + right) / 2` to avoid integer overflow for very large arrays. Both give the same result in practice for most cases.

#### Trace It

Say you have a sorted array `[2, 5, 8, 12, 16, 23, 38, 45, 56]` and you are looking for `23`:

```
Step 1: left=0, right=8, mid=4 -> arr[4]=16
        16 < 23 -> target is in the right half
        left becomes 5

Step 2: left=5, right=8, mid=6 -> arr[6]=38
        38 > 23 -> target is in the left half
        right becomes 5

Step 3: left=5, right=5, mid=5 -> arr[5]=23
        23 == 23 -> Found! Return 5
```

Only **3 comparisons** to find 23 in a list of 9 elements. Linear search would have taken 6 comparisons.

Now say you are looking for `3` (not in the list):

```
Step 1: left=0, right=8, mid=4 -> arr[4]=16
        16 > 3 -> target is in the left half
        right becomes 3

Step 2: left=0, right=3, mid=1 -> arr[1]=5
        5 > 3 -> left half
        right becomes 0

Step 3: left=0, right=0, mid=0 -> arr[0]=2
        2 < 3 -> right half
        left becomes 1

Step 4: left=1, right=0 -> left > right, loop exits
        Return -1
```

Only **3 comparisons** to determine that 3 does not exist in a list of 9 elements. Linear search would have checked all 9 before being sure.

#### The Magic: Why Binary Search Is So Fast

Every comparison eliminates half the remaining elements. This means the number of steps grows very slowly as the list grows:

| List Size | Linear Search (worst case) | Binary Search (worst case) |
|---|---|---|
| 10 | 10 checks | 4 checks |
| 1,000 | 1,000 checks | 10 checks |
| 1,000,000 | 1,000,000 checks | 20 checks |
| 1,000,000,000 | 1,000,000,000 checks | 30 checks |

This is the difference between O(n) and O(log n). For a billion elements, linear search takes a billion steps. Binary search takes just 30.

#### When to Use Binary Search

- The data is **sorted** (this is mandatory)
- The list is **large enough** that O(n) would be too slow
- You need to search **many times** (it is worth keeping the data sorted)

#### Time Complexity

- **Best case: O(1)** — the target is at the middle on the first check
- **Worst case: O(log n)** — you keep halving until only one element remains. For n elements, that is about log2(n) steps.
- **Average case: O(log n)**

#### Space Complexity

- **O(1)** for the iterative version — just three variables (left, right, mid)
- **O(log n)** for the recursive version — the call stack grows with each recursive call

### Linear vs Binary: Side by Side

| Aspect | Linear Search | Binary Search |
|---|---|---|
| Data requirement | Any data | Must be sorted |
| Time complexity | O(n) | O(log n) |
| Space complexity | O(1) | O(1) iterative, O(log n) recursive |
| Implementation | Trivial | Slightly more complex |
| Best for | Small or unsorted data | Large sorted data |
| Real-world example | Finding a name in an unsorted list | Looking up a word in a dictionary |

### The Key Takeaway

Binary search is one of the most important algorithms in computer science because it demonstrates a core principle: **if your data is organized, you can exploit that organization to solve problems exponentially faster.**

The same "divide and conquer" pattern appears again and again — in tree search, in sorting algorithms like Merge Sort and Quick Sort, and in many advanced data structures.

---

# 3. Problems

## 3.1 Binary Search

**Difficulty:** Easy  
**Topics:** Searching, Binary Search  
**Companies:** Amazon, Google, Microsoft, Facebook, Apple

### Problem Statement

You are given a sorted array of integers (sorted in increasing order) and a target integer. Find the index of the target in the array using binary search.

If the target exists in the array, return its index (0-based). If it does not exist, return -1.

You must implement the binary search algorithm — do not use a simple linear scan.

For example, given `arr = [-1, 0, 3, 5, 9, 12]` and `target = 9`, the answer is 4 because 9 is at index 4.

### Examples

| Input | Output | Explanation |
|---|---|---|
| arr = [-1, 0, 3, 5, 9, 12], target = 9 | 4 | mid=2 -> arr[2]=3 < 9, search right; mid=4 -> arr[4]=9, found |
| arr = [-1, 0, 3, 5, 9, 12], target = 2 | -1 | Eliminates halves until left > right, returns -1 |
| arr = [5], target = 5 | 0 | Single element: left=0, right=0, mid=0 -> arr[0]=5, found |
| arr = [], target = 1 | -1 | Empty array: left > right immediately, return -1 |

### Constraints

- The array length is between 0 and 100,000 elements.
- Each element is a 32-bit integer.
- The array is sorted in strictly increasing order.

### Approach

#### Step 1 — The Linear Search Way (Too Slow)

The naive approach is to scan every element:

```text
FUNCTION linear_search(arr, target):
    FOR i FROM 0 TO length(arr) - 1:
        IF arr[i] == target:
            RETURN i
    RETURN -1
```

This works, but it is O(n). For 100,000 elements, that is up to 100,000 checks. If you are searching many times, this becomes way too slow.

#### Step 2 — The Binary Search Insight

Since the array is sorted, we can use the divide-and-conquer approach:

1. Start with two pointers: `left` at index 0 and `right` at the last index
2. Find the middle index: `mid = left + (right - left) / 2`
3. Compare `arr[mid]` with the target:
   - **Equal** — found it! Return mid
   - **Less than target** — the target must be to the right. Move `left` to `mid + 1`
   - **Greater than target** — the target must be to the left. Move `right` to `mid - 1`
4. Repeat until left passes right (meaning the search space is empty)

#### Step 3 — Trace the Full Algorithm

Walk through `arr = [-1, 0, 3, 5, 9, 12]`, target = 9:

```
Initial: left = 0, right = 5

Iteration 1:
  mid = 0 + (5 - 0) / 2 = 2
  arr[2] = 3
  3 < 9 -> target is in the right half
  left = mid + 1 = 3

Iteration 2:
  mid = 3 + (5 - 3) / 2 = 4
  arr[4] = 9
  9 == 9 -> found!
  Return 4
```

Only 2 iterations to find the target in a 6-element array. Linear search would have taken 5.

#### Step 4 — Edge Cases to Watch For

1. **Empty array**: left (0) > right (-1) immediately. The loop never runs. Return -1.
2. **Single element**: left == right. The loop runs once. If it matches, return the index. If not, left becomes > right and we return -1.
3. **Target not in array**: Eventually left will pass right and we return -1.
4. **Target smaller than every element**: After the first comparison, right moves to before mid, and eventually left > right.
5. **Target larger than every element**: left keeps moving right until it passes right.

#### Step 5 — Handling the Mid Calculation

Always use `mid = left + (right - left) / 2` instead of `mid = (left + right) / 2`. Why? If left and right are very large (close to the maximum integer value), their sum can overflow. The alternative formula avoids this by calculating the offset from left instead.

#### Complexity Analysis

- **Time Complexity: O(log n)** — each iteration eliminates half the remaining search space.
- **Space Complexity: O(1)** — we only use three variables (left, right, mid) regardless of input size.

### Python Solution

```python
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
```

### JavaScript Solution

```javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);

        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}
```
