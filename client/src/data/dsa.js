/*
 * DSA Lessons — hierarchical: lessons (topics) contain problems
 * Each problem belongs to one lesson via lessonSlug
 */

/*
 * Mock subtopics — for mock mode fallback in the DSA store
 */
export const subtopics = [
  {
    _id: 'st1',
    title: 'Two Pointer Technique',
    slug: 'two-pointer-technique',
    lessonSlug: 'arrays',
    description: 'Master the two-pointer technique for solving array problems efficiently.',
    explanation: 'The two-pointer technique uses two pointers to iterate through a data structure, typically an array or string. This approach is especially useful for problems that involve searching pairs, reversing sequences, or finding subarrays that meet certain criteria.\n\nCommon patterns include:\n- Left and right pointers starting at opposite ends\n- Fast and slow pointers (Floyd\'s algorithm)\n- Sliding window with two pointers\n\nThe key insight is that by using two pointers instead of nested loops, you can often reduce time complexity from O(n²) to O(n).',
    image: '',
    youtubeUrl: '',
    pdfUrl: '',
    pptxUrl: '',
    order: 1
  },
  {
    _id: 'st2',
    title: 'Kadane\'s Algorithm',
    slug: 'kadanes-algorithm',
    lessonSlug: 'arrays',
    description: 'Learn Kadane\'s algorithm for finding the maximum subarray sum in linear time.',
    explanation: 'Kadane\'s algorithm is a dynamic programming approach that finds the maximum sum subarray in O(n) time. It works by iterating through the array, keeping track of the current sum and resetting it to 0 when it becomes negative.\n\nThe algorithm maintains two variables:\n- current_sum: the maximum sum ending at the current position\n- max_sum: the overall maximum sum seen so far\n\nAt each step, we add the current element to current_sum. If current_sum becomes negative, we reset it to 0. We update max_sum if current_sum is greater.',
    image: '',
    youtubeUrl: '',
    pdfUrl: '',
    pptxUrl: '',
    order: 2
  },
  {
    _id: 'st3',
    title: 'Reverse a Linked List',
    slug: 'reverse-linked-list-technique',
    lessonSlug: 'linked-lists',
    description: 'Techniques for reversing linked lists iteratively and recursively.',
    explanation: 'Reversing a linked list is a fundamental operation that appears in many interview problems. The iterative approach uses three pointers (prev, curr, next) to reverse the links one by one.\n\nThe recursive approach reverses the rest of the list first, then adjusts the pointers. Both approaches run in O(n) time with O(1) extra space for iterative and O(n) call stack space for recursive.',
    image: '',
    youtubeUrl: '',
    pdfUrl: '',
    pptxUrl: '',
    order: 1
  },
  {
    _id: 'st4',
    title: 'Hash Map Patterns',
    slug: 'hash-map-patterns',
    lessonSlug: 'hashing',
    description: 'Common hash map patterns for counting, grouping, and lookup optimization.',
    explanation: 'Hash maps (dictionaries/objects) are one of the most versatile data structures for coding interviews. Common patterns include:\n\n1. Frequency Counting: Count occurrences of elements\n2. Two-Sum Pattern: Store complements while iterating\n3. Grouping: Group elements by some key\n4. Caching: Store computed results to avoid recalculation\n\nHash maps provide O(1) average-case lookup, insertion, and deletion, making them invaluable for optimization.',
    image: '',
    youtubeUrl: '',
    pdfUrl: '',
    pptxUrl: '',
    order: 1
  },
  {
    _id: 'st5',
    title: 'Sliding Window Basics',
    slug: 'sliding-window-basics',
    lessonSlug: 'sliding-window',
    description: 'Understanding the sliding window pattern for substring and subarray problems.',
    explanation: 'The sliding window technique maintains a window of elements that satisfies certain constraints and slides it through the array/string. It is particularly useful for problems involving contiguous subarrays or substrings.\n\nTypes of sliding windows:\n- Fixed-size window\n- Variable-size window (expand/shrink)\n\nThe key advantage is reducing O(n²) brute force to O(n) by avoiding repeated calculations.',
    image: '',
    youtubeUrl: '',
    pdfUrl: '',
    pptxUrl: '',
    order: 1
  },
  {
    _id: 'st6',
    title: 'Tree Traversals',
    slug: 'tree-traversals',
    lessonSlug: 'trees',
    description: 'In-order, pre-order, post-order, and level-order tree traversals.',
    explanation: 'Tree traversals are fundamental operations that visit each node in a tree exactly once. The main types are:\n\n1. In-Order (Left, Root, Right): Gives sorted order for BST\n2. Pre-Order (Root, Left, Right): Used for copying trees\n3. Post-Order (Left, Right, Root): Used for deleting trees\n4. Level-Order (BFS): Visits nodes level by level\n\nEach traversal can be implemented recursively or iteratively using a stack/queue.',
    image: '',
    youtubeUrl: '',
    pdfUrl: '',
    pptxUrl: '',
    order: 1
  }
];

export const dsaLessons = [
  {
    _id: 'l1',
    title: 'Arrays',
    slug: 'arrays',
    category: 'data-structures',
    description: 'Arrays are the most fundamental data structure. Master array manipulation, traversal, and common patterns like two-pointer and sliding window.',
    icon: 'List',
    order: 1,
    problemCount: 2,
    difficulty: 'easy'
  },
  {
    _id: 'l2',
    title: 'Linked Lists',
    slug: 'linked-lists',
    category: 'data-structures',
    description: 'Understand pointer manipulation, reversal, cycle detection, and merge operations on singly and doubly linked lists.',
    icon: 'Link2',
    order: 2,
    problemCount: 1,
    difficulty: 'easy'
  },
  {
    _id: 'l3',
    title: 'Strings',
    slug: 'strings',
    category: 'data-structures',
    description: 'Pattern matching, substring search, palindrome checks, and string manipulation algorithms for interviews.',
    icon: 'Type',
    order: 3,
    problemCount: 1,
    difficulty: 'medium'
  },
  {
    _id: 'l4',
    title: 'Hashing',
    slug: 'hashing',
    category: 'data-structures',
    description: 'Hash maps and hash sets for O(1) lookups. Essential for counting, grouping, and duplicate detection problems.',
    icon: 'Hash',
    order: 4,
    problemCount: 2,
    difficulty: 'easy'
  },
  {
    _id: 'l5',
    title: 'Sliding Window',
    slug: 'sliding-window',
    category: 'techniques',
    description: 'Optimize brute force solutions by maintaining a window over array or string segments. Key for substring and subarray problems.',
    icon: 'MoveRight',
    order: 5,
    problemCount: 1,
    difficulty: 'medium'
  },
  {
    _id: 'l6',
    title: 'Trees',
    slug: 'trees',
    category: 'data-structures',
    description: 'Binary trees, BSTs, traversals, and tree-based algorithms. A cornerstone of technical interviews.',
    icon: 'GitBranch',
    order: 6,
    problemCount: 1,
    difficulty: 'medium'
  },
  {
    _id: 'l7',
    title: 'Dynamic Programming',
    slug: 'dynamic-programming',
    category: 'algorithms',
    description: 'Master memoization and tabulation. Solve optimization problems by breaking them into overlapping subproblems.',
    icon: 'Layers',
    order: 7,
    problemCount: 0,
    difficulty: 'hard'
  },
  {
    _id: 'l8',
    title: 'Graphs',
    slug: 'graphs',
    category: 'data-structures',
    description: 'BFS, DFS, shortest paths, and graph traversal algorithms for solving complex connected-data problems.',
    icon: 'Share2',
    order: 8,
    problemCount: 0,
    difficulty: 'hard'
  }
];

export const problems = [
  {
    _id: 'p1',
    title: 'Two Sum',
    slug: 'two-sum',
    lessonSlug: 'arrays',
    difficulty: 'easy',
    topics: ['Arrays', 'Hashing'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
    problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: '' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    approach: 'Use a hash map to store each element\'s value and its index. Iterate through the array, for each element check if the complement (target - nums[i]) exists in the map. If found, return both indices.',
    codeBlocks: [
      {
        language: 'python',
        code: 'def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        complement = target - n\n        if complement in seen:\n            return [seen[complement], i]\n        seen[n] = i\n    return []'
      },
      {
        language: 'javascript',
        code: 'function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (seen.has(complement)) {\n            return [seen.get(complement), i];\n        }\n        seen.set(nums[i], i);\n    }\n    return [];\n}'
      },
      {
        language: 'java',
        code: 'public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[] { map.get(complement), i };\n        }\n        map.put(nums[i], i);\n    }\n    return new int[] {};\n}'
      },
      {
        language: 'cpp',
        code: 'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (seen.count(complement)) {\n            return {seen[complement], i};\n        }\n        seen[nums[i]] = i;\n    }\n    return {};\n}'
      }
    ],
    media: [
      { type: 'youtube', url: 'dQw4w9WgXcQ', caption: 'Two Sum walkthrough', position: 1 }
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    views: 12400,
    bookmarks: 3400,
    createdAt: '2026-01-15'
  },
  {
    _id: 'p2',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    lessonSlug: 'linked-lists',
    difficulty: 'easy',
    topics: ['Linked Lists'],
    companies: ['Microsoft', 'Apple', 'Amazon'],
    problemStatement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: '' },
      { input: 'head = [1,2]', output: '[2,1]', explanation: '' }
    ],
    constraints: ['The number of nodes in the list is [0, 5000]', '-5000 <= Node.val <= 5000'],
    approach: 'Iterate through the list, reversing the next pointer of each node to point to the previous node. Track previous, current, and next nodes.',
    codeBlocks: [
      {
        language: 'python',
        code: 'def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev'
      },
      {
        language: 'javascript',
        code: 'function reverseList(head) {\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        const next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}'
      }
    ],
    media: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    views: 8900,
    bookmarks: 2100,
    createdAt: '2026-01-18'
  },
  {
    _id: 'p3',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    lessonSlug: 'sliding-window',
    difficulty: 'medium',
    topics: ['Sliding Window', 'Strings', 'Hashing'],
    companies: ['Amazon', 'Google', 'Meta', 'Adobe'],
    problemStatement: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with length 3.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    approach: 'Use a sliding window with a hash set. Expand the right pointer, if a duplicate is found, shrink from left until the duplicate is removed.',
    codeBlocks: [
      {
        language: 'python',
        code: 'def lengthOfLongestSubstring(s):\n    used = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in used:\n            used.remove(s[left])\n            left += 1\n        used.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len'
      },
      {
        language: 'javascript',
        code: 'function lengthOfLongestSubstring(s) {\n    const used = new Set();\n    let left = 0;\n    let maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        while (used.has(s[right])) {\n            used.delete(s[left]);\n            left++;\n        }\n        used.add(s[right]);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}'
      }
    ],
    media: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k) where k is charset size',
    views: 15200,
    bookmarks: 4200,
    createdAt: '2026-02-01'
  },
  {
    _id: 'p4',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    lessonSlug: 'hashing',
    difficulty: 'easy',
    topics: ['Strings', 'Hashing'],
    companies: ['Amazon', 'Google', 'Apple'],
    problemStatement: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: '' },
      { input: 's = "rat", t = "car"', output: 'false', explanation: '' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    approach: 'Count character frequencies in both strings using a hash map or array of size 26. Compare counts.',
    codeBlocks: [
      {
        language: 'python',
        code: 'def isAnagram(s, t):\n    if len(s) != len(t): return False\n    counts = {}\n    for c in s:\n        counts[c] = counts.get(c, 0) + 1\n    for c in t:\n        if c not in counts or counts[c] == 0:\n            return False\n        counts[c] -= 1\n    return True'
      },
      {
        language: 'javascript',
        code: 'function isAnagram(s, t) {\n    if (s.length !== t.length) return false;\n    const counts = {};\n    for (const c of s) counts[c] = (counts[c] || 0) + 1;\n    for (const c of t) {\n        if (!counts[c]) return false;\n        counts[c]--;\n    }\n    return true;\n}'
      }
    ],
    media: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    views: 5600,
    bookmarks: 1200,
    createdAt: '2026-02-10'
  },
  {
    _id: 'p5',
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    lessonSlug: 'arrays',
    difficulty: 'medium',
    topics: ['Arrays', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
    problemStatement: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: '' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    approach: 'Use Kadane\'s algorithm. Track current sum and max sum. Reset current sum to 0 if it goes negative.',
    codeBlocks: [
      {
        language: 'python',
        code: 'def maxSubArray(nums):\n    max_sum = float("-inf")\n    cur_sum = 0\n    for n in nums:\n        cur_sum += n\n        max_sum = max(max_sum, cur_sum)\n        if cur_sum < 0:\n            cur_sum = 0\n    return max_sum'
      },
      {
        language: 'javascript',
        code: 'function maxSubArray(nums) {\n    let maxSum = -Infinity;\n    let curSum = 0;\n    for (const n of nums) {\n        curSum += n;\n        maxSum = Math.max(maxSum, curSum);\n        if (curSum < 0) curSum = 0;\n    }\n    return maxSum;\n}'
      }
    ],
    media: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    views: 9800,
    bookmarks: 2800,
    createdAt: '2026-02-20'
  },
  {
    _id: 'p6',
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    lessonSlug: 'trees',
    difficulty: 'easy',
    topics: ['Trees', 'Recursion'],
    companies: ['Google', 'Microsoft', 'Amazon'],
    problemStatement: 'Given the root of a binary tree, invert the tree, and return its root. Swapping every left and right child.',
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'Every node\'s left and right children are swapped.' }
    ],
    constraints: ['The number of nodes in the tree is [0, 100]', '-100 <= Node.val <= 100'],
    approach: 'Recursively swap left and right children of every node. Base case: null node returns null.',
    codeBlocks: [
      {
        language: 'python',
        code: 'def invertTree(root):\n    if not root:\n        return None\n    root.left, root.right = root.right, root.left\n    invertTree(root.left)\n    invertTree(root.right)\n    return root'
      },
      {
        language: 'javascript',
        code: 'function invertTree(root) {\n    if (!root) return null;\n    [root.left, root.right] = [root.right, root.left];\n    invertTree(root.left);\n    invertTree(root.right);\n    return root;\n}'
      }
    ],
    media: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is tree height',
    views: 7200,
    bookmarks: 1500,
    createdAt: '2026-03-01'
  }
];
