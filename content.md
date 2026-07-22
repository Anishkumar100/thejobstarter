# Content Seed Data — DSA, DBMS, OS, Programming (Beginner-Friendly, Language-Agnostic)

> Seed data for the plan builder hierarchy.
> Structure: **Lesson → Subtopics → Problems**, with **Quizzes linked to each Problem**.
> Every problem's approach is explained in plain-English conceptual steps.
> All fields match the Mongoose model schemas exactly.

---

## DSA (Data Structures & Algorithms)

### Lessons

```json
[
  {
    "title": "Big O Notations",
    "slug": "big-o-notations",
    "category": "techniques",
    "description": "The language used to describe how an algorithm's speed or memory use grows as its input gets bigger.",
    "icon": "TrendingUp",
    "order": 1,
    "difficulty": "easy",
    "problemCount": 0
  },
  {
    "title": "Arrays",
    "slug": "arrays",
    "category": "data-structures",
    "description": "The most basic data structure — a numbered row of values that lets you jump straight to any position instantly.",
    "icon": "List",
    "order": 2,
    "difficulty": "easy",
    "problemCount": 0
  },
  {
    "title": "Linked Lists",
    "slug": "linked-lists",
    "category": "data-structures",
    "description": "A chain of nodes, each pointing to the next, that lets you insert at the front instantly but access by position slowly.",
    "icon": "Link2",
    "order": 3,
    "difficulty": "easy",
    "problemCount": 0
  },
  {
    "title": "Stacks & Queues",
    "slug": "stacks-queues",
    "category": "data-structures",
    "description": "Two restricted-access structures — Last In First Out and First In First Out — built for very specific access patterns.",
    "icon": "Layers",
    "order": 4,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Trees",
    "slug": "trees",
    "category": "data-structures",
    "description": "A hierarchical structure — like a family tree or file system — built from a root and branching child nodes.",
    "icon": "GitBranch",
    "order": 5,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Graphs",
    "slug": "graphs",
    "category": "data-structures",
    "description": "A network of points connected by links, used to model roads, social networks, and dependencies of all kinds.",
    "icon": "Share2",
    "order": 6,
    "difficulty": "hard",
    "problemCount": 0
  }
]
```

### Subtopics

```json
[
  {
    "title": "Time Complexity Analysis",
    "slug": "time-complexity",
    "description": "How to count the number of steps an algorithm takes so you can predict how it behaves on large inputs.",
    "explanation": "Time complexity answers: 'How many operations does this algorithm perform as the input grows?' We count meaningful steps (comparisons, additions, lookups) — not actual seconds, since seconds depend on the machine.\n\nHow to analyse any algorithm:\n1. Identify the input size, usually called n.\n2. Look for loops. A single loop that runs once per item is O(n). A loop inside another loop is O(n²).\n3. Look for repeated (recursive) calls that split the problem — these often lead to O(log n) or O(n log n).\n4. Drop constant multipliers. Doing something twice per item is still O(n), not 'O(2n)' — constants don't change the growth pattern.\n5. Keep only the largest-growing term. If a process involves both an O(n) step and an O(n²) step, the overall complexity is O(n²), because it dominates as n grows.\n\nCommon beginner mistakes:\n- Thinking that doing a task 'twice as often' changes the Big O category — it doesn't; only the shape of growth matters, not the constant factor.\n- Forgetting that a loop placed inside another loop multiplies the work, it doesn't just add to it.\n- Mixing up worst-case (the guarantee Big O usually describes), best-case, and average-case behaviour.",
    "lessonSlug": "big-o-notations",
    "order": 1
  },
  {
    "title": "Space Complexity",
    "slug": "space-complexity",
    "description": "How to measure the extra memory an algorithm needs, beyond the input it was given.",
    "explanation": "Space complexity answers: 'How much extra memory does this algorithm need, beyond the input itself?'\n\nKey ideas:\n- Auxiliary space — the extra memory you allocate yourself, separate from the input.\n- Total space — the input's memory plus the auxiliary space.\n- Recursive space — every time a task calls itself, it uses a bit of extra memory to 'remember where it was,' and this adds up with depth.\n\nWorked example: If a process makes a brand-new copy of a list so it has the same number of items as the original, that copy needs memory proportional to the size of the input — so it uses O(n) extra space.\n\nSpace-time trade-off: Sometimes you can make something faster by using more memory, or use less memory at the cost of speed. Keeping a lookup table of values you've already seen costs some memory, but lets you answer 'have I seen this before?' instantly instead of searching through everything again.",
    "lessonSlug": "big-o-notations",
    "order": 2
  },
  {
    "title": "Two Pointer Technique",
    "slug": "two-pointer-technique",
    "description": "Use two moving markers instead of nested loops to scan an array in a single pass.",
    "explanation": "Instead of checking every possible pair of elements with two nested loops (which is slow), you keep track of two positions ('pointers') in the array and move them toward each other or alongside each other based on simple rules. This often turns an O(n²) approach into an O(n) one.\n\nCommon patterns:\n1. Opposite ends closing in: One marker starts at the beginning, one at the end, and they move toward each other. Great for checking palindromes or finding pairs that add up to a target in a sorted list.\n2. Slow and fast, same direction: One marker moves one step at a time, the other moves two steps at a time. Useful for finding the middle of a sequence or detecting loops.\n3. A growing/shrinking window: Both markers start together and the gap between them expands or contracts depending on a condition.",
    "lessonSlug": "arrays",
    "order": 1
  },
  {
    "title": "Sliding Window",
    "slug": "sliding-window",
    "description": "Maintain a moving 'view' over a continuous stretch of the array instead of recalculating everything from scratch.",
    "explanation": "A sliding window is a 'view' over a continuous stretch of the array that you move along one step at a time, updating your answer as you go, instead of recalculating everything from scratch each time.\n\nWhen to use it: Whenever a problem asks about a continuous chunk of the array or string — things like 'the biggest sum in any stretch of k numbers' or 'the shortest stretch that satisfies some condition.'\n\nHow it works:\n1. Expand the right edge of the window to include a new element.\n2. Check whether the window still satisfies whatever condition the problem asks for.\n3. Shrink the left edge of the window if the condition is broken, removing elements until it's valid again.\n4. Update your best answer so far each time the window is valid.\n5. Repeat until the right edge has covered the whole array.",
    "lessonSlug": "arrays",
    "order": 2
  },
  {
    "title": "Singly Linked List Operations",
    "slug": "singly-linked-list",
    "description": "The basic building and moving operations for a chain of nodes, each pointing only forward.",
    "explanation": "How to build and work with a chain of nodes, where every node stores a value and a reference to the next node.\n\nKey operations:\n- Insert at the front: Create a new node, point it at the current first node, and make the new node the new front. Instant — O(1).\n- Insert at the end: Walk the entire chain to find the last node, then attach the new node there. O(n).\n- Delete a node: Walk the chain to find the node just before the one you want to remove, then have it 'skip over' the target node. Finding it takes O(n), but the actual removal is O(1) once found.\n- Search for a value: Walk from the front, checking each node in turn, until you find it or reach the end. O(n).",
    "lessonSlug": "linked-lists",
    "order": 1
  },
  {
    "title": "Fast & Slow Pointers",
    "slug": "fast-slow-pointers",
    "description": "Move two markers through a list at different speeds to find the middle or detect loops in a single pass.",
    "explanation": "A technique using two markers that move through the list at different speeds — the slow one moves one step at a time, the fast one moves two steps at a time.\n\nWhy it works: Picture two runners starting at the same point on a track, one running twice as fast as the other. By the time the fast runner finishes a lap, the slow runner is exactly halfway. This creates a predictable relationship between their positions.\n\nWhat this enables:\n1. Finding the middle: By the time the fast marker reaches the end, the slow marker is at the middle.\n2. Detecting a loop: If there's a cycle, the fast and slow markers will eventually land on the same node.\n3. Finding the item a fixed distance from the end: Move the fast marker ahead by that many steps first, then move both markers together.",
    "lessonSlug": "linked-lists",
    "order": 2
  },
  {
    "title": "Stack Operations & Applications",
    "slug": "stack-applications",
    "description": "The push/pop/peek operations behind undo buttons, browser history, and function calls.",
    "explanation": "A stack supports three core operations, all instant (O(1)):\n- Push — add an item to the top.\n- Pop — remove and return the item currently on top.\n- Peek — look at the top item without removing it.\n\nReal-world applications:\n- Undo/Redo: Every action gets pushed onto a stack. Undo pops the most recent action off.\n- Browser back button: Each page you visit gets pushed; clicking back pops the current page.\n- Evaluating expressions: Stacks help process nested expressions like parentheses.\n- Program execution: Every time a function calls another function, that call gets 'pushed'; when it finishes, it's 'popped' — this is the call stack.\n\nChecking that brackets are balanced:\n1. Go through the text one character at a time.\n2. Every time you see an opening bracket, push it onto the stack.\n3. Every time you see a closing bracket: if the stack is empty, it's unbalanced; otherwise pop and check it matches.\n4. After processing everything, if the stack is empty, all brackets matched correctly.",
    "lessonSlug": "stacks-queues",
    "order": 1
  },
  {
    "title": "Queue Operations & Types",
    "slug": "queue-types",
    "description": "The enqueue/dequeue operations behind print queues, task scheduling, and level-by-level exploration.",
    "explanation": "A queue supports two core operations, both instant (O(1)):\n- Enqueue — add an item to the back.\n- Dequeue — remove and return the item at the front.\n\nQueue variations:\n- Circular Queue: Uses a fixed amount of space with wrap-around, so the front and back positions loop back to the start when they reach the end.\n- Priority Queue: Items are removed based on priority, not just arrival order.\n- Deque (double-ended queue): You can add or remove from both ends, combining features of a stack and a queue.\n\nReal-world applications:\n- Print spooler: Documents wait in a queue and print in order.\n- Exploring level by level: Breadth-first exploration uses a queue to visit things 'layer by layer.'\n- Task scheduling: An operating system uses queues to manage waiting processes.",
    "lessonSlug": "stacks-queues",
    "order": 2
  },
  {
    "title": "Binary Tree Traversals",
    "slug": "binary-tree-traversals",
    "description": "The standard orders — pre-order, in-order, post-order, and level order — for visiting every node in a tree.",
    "explanation": "Traversing means visiting every node in a specific order. For binary trees (where each node has at most two children — left and right), there are three classic depth-first orders, plus one breadth-first order.\n\nThe three depth-first orders:\n- Pre-order (root first): Visit the current node, then explore everything to its left, then everything to its right. Useful for creating a copy of the tree structure.\n- In-order (root in the middle): Explore everything to the left, then visit the current node, then explore everything to the right. For a BST, this visits every value in sorted order.\n- Post-order (root last): Explore everything to the left, then everything to the right, then finally visit the current node. Useful for safely deleting a tree.\n\nLevel order (breadth-first):\n1. Start with the root in a waiting line (queue).\n2. Take the front node out and visit it.\n3. Add its children to the back of the line.\n4. Repeat until the line is empty.",
    "lessonSlug": "trees",
    "order": 1
  },
  {
    "title": "Binary Search Trees",
    "slug": "binary-search-trees",
    "description": "A binary tree that keeps itself organised — smaller values on the left, larger on the right — enabling fast search.",
    "explanation": "A Binary Search Tree (BST) is a binary tree with one special rule: for every node, everything in its left branch is smaller, and everything in its right branch is larger.\n\nSearching in a BST:\n1. Start at the root.\n2. If the current node is empty, or its value matches what you're looking for, you're done.\n3. If your target is smaller than the current node's value, move to the left branch.\n4. If your target is larger, move to the right branch.\n5. Repeat until you find the value or run out of tree to search.\n\nWhy this is O(log n): Each step throws away roughly half of the remaining nodes — you never have to check the branch you know can't contain your target. For a balanced tree holding a million values, finding anything takes only about 20 steps.",
    "lessonSlug": "trees",
    "order": 2
  },
  {
    "title": "Graph Representation",
    "slug": "graph-representation",
    "description": "The two standard ways to store a graph in memory — adjacency matrix and adjacency list — and when to use each.",
    "explanation": "Before you can work with a graph, you need to store it. The two most common ways are the adjacency matrix and the adjacency list.\n\nAdjacency Matrix: A grid where a mark at row A, column B means there's a connection from A to B.\n- Space needed: grows with the square of the number of points — wasteful if few connections.\n- Checking whether two points are connected: instant.\n- Finding all of a point's neighbours: requires scanning a whole row.\n\nAdjacency List (usually better): Each point keeps a small list of the points it's directly connected to.\n- Space needed: grows with points plus connections — efficient when connections are sparse.\n- Checking whether two points are connected: usually fast.\n- Finding all neighbours: instant.\n\nUse an adjacency matrix when the graph is very densely connected. Otherwise, adjacency list is the default choice.",
    "lessonSlug": "graphs",
    "order": 1
  },
  {
    "title": "BFS & DFS Traversals",
    "slug": "bfs-dfs-traversal",
    "description": "Two core strategies for exploring a graph — spreading out layer by layer, or diving deep down one path first.",
    "explanation": "Breadth-First Search (BFS):\n1. Put the starting point into a waiting line (queue) and mark it as visited.\n2. Take the point at the front of the line out and process it.\n3. Look at all its neighbours. For each one not visited yet, mark it visited and add it to the back of the line.\n4. Repeat until the line is empty.\n- Explores layer by layer.\n- Finds the shortest path in unweighted graphs.\n\nDepth-First Search (DFS):\n1. Start at the given point and mark it visited, then process it.\n2. Pick any unvisited neighbour and repeat the process from that neighbour.\n3. If a point has no unvisited neighbours left, back up to the previous point and try a different neighbour.\n4. Continue until every reachable point has been visited.\n- Goes deep before wide.\n- Often uses less memory than BFS on wide, shallow graphs.\n\nBoth take time proportional to vertices plus edges.",
    "lessonSlug": "graphs",
    "order": 2
  }
]
```

### Problems

```json
[
  {
    "title": "Find the Missing Number",
    "slug": "missing-number",
    "lessonSlug": "big-o-notations",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Arrays", "Math"],
    "companies": ["Microsoft", "Amazon"],
    "problemStatement": "You are given a list containing n-1 distinct numbers, all taken from the range 1 to n. One number from that range is missing. Find the missing number without using extra memory and by scanning the list only once.",
    "examples": [
      {
        "input": "List: [3, 7, 1, 2, 8, 4, 5], n = 8",
        "output": "6",
        "explanation": "Sum of 1 through 8 = 36. Sum of numbers in the list = 30. 36 - 30 = 6, which is the missing number."
      }
    ],
    "constraints": ["2 <= n <= 10^5", "Array contains n-1 distinct integers"],
    "approach": "Step 1: Work out how many numbers there should be — since one is missing, that count is (items in the list) + 1. Call this n.\n\nStep 2: Calculate what the sum of every number from 1 to n should be, using the shortcut formula n × (n + 1) ÷ 2. This formula was discovered by a young mathematician named Gauss — you don't need to add up every number one by one.\n\nStep 3: Add up all the numbers that are actually present in the list by going through it once.\n\nStep 4: Subtract the actual sum from the expected sum. Whatever is left over is the missing number.\n\nWhy this works: The formula gives you the 'should be' total for a complete, unbroken sequence. Since your list is that same sequence with exactly one number taken out, the gap between the expected total and the real total has to be exactly that missing number.\n\nEdge cases: If only one number is in the list and it is 1, the missing number is 2. If it is 2, the missing number is 1. For very large lists, the arithmetic-shortcut formula handles this instantly.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "views": 25000,
    "bookmarks": 4200
  },
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "lessonSlug": "arrays",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Arrays", "Hashing", "Two Pointers"],
    "companies": ["Amazon", "Google", "Meta", "Microsoft"],
    "problemStatement": "Given a list of numbers and a target number, find two numbers in the list that add up to the target and report their positions. There is guaranteed to be exactly one valid answer.",
    "examples": [
      {
        "input": "List: [2, 7, 11, 15], target = 9",
        "output": "[0, 1]",
        "explanation": "Look at position 0, value 2. We need 9 - 2 = 7. Have we seen a 7? Not yet. Remember 2 at position 0. Look at position 1, value 7. We need 9 - 7 = 2. We have seen a 2 before at position 0. Answer is positions 0 and 1."
      }
    ],
    "constraints": ["2 <= nums.length <= 10^4", "Each input has exactly one solution"],
    "approach": "Step 1: Keep a running memory of every number you have already looked at, along with its position.\n\nStep 2: Go through the list one number at a time.\n\nStep 3: For the current number, work out what value would be needed to reach the target: target minus current number.\n\nStep 4: Check your memory — have you already seen that needed value?\n- If yes, you have found your pair. Report the earlier position and the current position.\n- If no, add the current number and its position to your memory, and move to the next number.\n\nWhy keep a memory of past numbers? Without it, for every number you would have to search through the entire rest of the list to see if its partner exists — that is O(n²). Keeping a quick lookup memory means each check only takes constant time, bringing the whole thing down to O(n).\n\nWhat if the list is already sorted? Then the two-pointer technique works instead, using less extra memory — but only if you do not need to report the original positions, since sorting changes where each number sits.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "views": 45000,
    "bookmarks": 8900
  },
  {
    "title": "Middle of the Linked List",
    "slug": "middle-of-linked-list",
    "lessonSlug": "linked-lists",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Linked Lists", "Two Pointers"],
    "companies": ["Amazon", "Apple", "Adobe"],
    "problemStatement": "Given the front of a singly linked list, find and return the node in the middle. If there are two middle nodes (an even number of items), return the second one.",
    "examples": [
      {
        "input": "Chain: 1 -> 2 -> 3 -> 4 -> 5",
        "output": "Node with value 3",
        "explanation": "Slow starts at 1, fast starts at 1. Step 1: slow=2, fast=3. Step 2: slow=3, fast=5. Fast has nowhere left to go. Answer is node 3."
      },
      {
        "input": "Chain: 1 -> 2 -> 3 -> 4 -> 5 -> 6",
        "output": "Node with value 4",
        "explanation": "Step 1: slow=2, fast=3. Step 2: slow=3, fast=5. Step 3: slow=4, fast has nowhere left to go. Answer is node 4 (the second of the two middle nodes)."
      }
    ],
    "constraints": ["0 <= nodes <= 5000"],
    "approach": "Step 1: Place both a slow marker and a fast marker at the front of the list.\n\nStep 2: Move the slow marker forward one node at a time, and the fast marker forward two nodes at a time.\n\nStep 3: Keep going until the fast marker either reaches the last node or runs out of nodes to move to.\n\nStep 4: Whatever node the slow marker is sitting on at that point is the middle.\n\nWhy this is elegant: Without this trick, you would need one full pass just to count how many items are in the list, then a second pass to walk halfway. The fast-slow approach finds the middle in a single pass.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "views": 14000,
    "bookmarks": 2500
  },
  {
    "title": "Valid Parentheses",
    "slug": "valid-parentheses",
    "lessonSlug": "stacks-queues",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Stacks", "Strings"],
    "companies": ["Google", "Meta", "Amazon", "Microsoft"],
    "problemStatement": "Given a string made up only of the bracket characters (, ), {, }, [, ], determine whether it is valid — every opening bracket must have a matching closing bracket in the correct order.",
    "examples": [
      {
        "input": "s = '()[]{}'",
        "output": "true",
        "explanation": "Each opening bracket has a correctly ordered closing bracket. The stack ensures proper nesting."
      },
      {
        "input": "s = '(]'",
        "output": "false",
        "explanation": "When ']' appears, the top of the stack is '(' but we expected '[' to match ']' — mismatch."
      },
      {
        "input": "s = '([)]'",
        "output": "false",
        "explanation": "Even though every bracket type has a match, the order is wrong — brackets must close inside-out, not crisscross."
      }
    ],
    "constraints": ["1 <= s.length <= 10^4", "s consists of brackets only: ()[]{}"],
    "approach": "Step 1: Go through the string one character at a time.\n\nStep 2: If the character is an opening bracket, push it onto a stack.\n\nStep 3: If the character is a closing bracket:\n- If the stack is empty, it is invalid — there is nothing to match against.\n- Otherwise, pop the top of the stack and check it is the correct opening bracket for this closing one. If not, it is invalid.\n\nStep 4: After the whole string is processed, check the stack: if it is empty, the string is valid. If anything is left over, some opening brackets were never closed.\n\nEdge cases: An empty string is valid. A single bracket is invalid. The string '(((' is invalid because the stack is not empty at the end. The string '([)]' is invalid because brackets close in the wrong order.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "views": 38000,
    "bookmarks": 7200
  },
  {
    "title": "Maximum Depth of a Binary Tree",
    "slug": "max-depth-binary-tree",
    "lessonSlug": "trees",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Trees", "Recursion"],
    "companies": ["Amazon", "Google", "Microsoft"],
    "problemStatement": "Given the root of a binary tree, find its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.",
    "examples": [
      {
        "input": "Root = 3 (left child 9, right child 20 which has children 15 and 7)",
        "output": "3",
        "explanation": "The root (3) is depth 1, its children are depth 2, and the grandchildren (15, 7) are depth 3."
      }
    ],
    "constraints": ["0 <= nodes <= 10^4"],
    "approach": "Step 1: If the current node does not exist (you have gone past a leaf), its depth is 0.\n\nStep 2: Otherwise, find the depth of the left branch by repeating this same process on it.\n\nStep 3: Find the depth of the right branch the same way.\n\nStep 4: The depth of the current node is 1, plus whichever of the two branch depths is bigger.\n\nThis is divide and conquer: solve the same smaller problem on the left and right branches, and combine those two results to get the answer for the whole tree.\n\nEdge cases: An empty tree has depth 0. A tree with just one node has depth 1. A tree that is just a straight line has depth equal to the number of nodes — this is the worst case for memory use.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(h) where h = height of tree",
    "views": 20000,
    "bookmarks": 3800
  },
  {
    "title": "Find if a Path Exists in a Graph",
    "slug": "path-exists-in-graph",
    "lessonSlug": "graphs",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Graphs", "Traversal"],
    "companies": ["Amazon", "Uber", "Microsoft"],
    "problemStatement": "Given a graph with connections going both ways (undirected), along with a source point and a destination point, determine whether there is any valid path connecting the source to the destination.",
    "examples": [
      {
        "input": "Points 0 through 5. Connections: 0-1, 0-2, 3-5, 5-4, 4-3. Source = 0, Destination = 5",
        "output": "false",
        "explanation": "Points 0, 1, 2 form one cluster. Points 3, 4, 5 form a separate cluster. Since 0 and 5 are in different clusters, there is no path between them."
      }
    ],
    "constraints": ["1 <= n <= 2000", "0 <= edges.length <= 5000"],
    "approach": "Step 1: Organise the connections so you can easily look up each point's neighbours. The simplest way is to build an adjacency list where each point stores a list of the points it is directly connected to.\n\nStep 2: Starting from the source, explore outward using either breadth-first (queue-based) or depth-first (recursion-based) search. Keep track of every point you have already visited so you do not loop forever.\n\nStep 3: If at any point during the exploration you reach the destination, a path exists — stop and report true.\n\nStep 4: If you run out of new points to explore without ever reaching the destination, no path exists — report false.\n\nWhy this works: Exploring outward from the source visits every point in its entire connected cluster. If the destination belongs to that same cluster, the exploration is guaranteed to reach it eventually. If not, the exploration runs out of places to go, proving there is no path.",
    "timeComplexity": "O(n + edges)",
    "spaceComplexity": "O(n + edges)",
    "views": 11000,
    "bookmarks": 2100
  }
]
```

### Quizzes (DSA)

```json
[
  {
    "problemSlug": "missing-number",
    "problemModel": "Problem",
    "questions": [
      {
        "text": "What is the time complexity of the sum-based approach to finding the missing number?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        "correctIndex": 2
      },
      {
        "text": "List: [1, 2, 4, 5] (n = 5, one number missing from 1 to 5). Using the expected-sum-minus-actual-sum method, what is the missing number?",
        "options": ["2", "3", "4", "5"],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "two-sum",
    "problemModel": "Problem",
    "questions": [
      {
        "text": "Why does keeping a 'memory' of seen numbers speed up Two Sum compared to checking every pair?",
        "options": [
          "It sorts the list first",
          "It turns each partner-check into a constant-time lookup instead of a rescan",
          "It removes duplicate numbers",
          "It reduces the target value"
        ],
        "correctIndex": 1
      },
      {
        "text": "What is the worst-case space complexity of the memory-based Two Sum approach, and when does the two-pointer alternative become viable instead?",
        "options": [
          "O(1); always",
          "O(n); only when the list is already sorted and original positions are not needed",
          "O(n²); never",
          "O(log n); when the list has duplicates"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "middle-of-linked-list",
    "problemModel": "Problem",
    "questions": [
      {
        "text": "For the chain 1 -> 2 -> 3 -> 4 -> 5 -> 6, which node does the fast-slow approach return as 'the middle'?",
        "options": ["3", "4", "5", "6"],
        "correctIndex": 1
      },
      {
        "text": "Why is the fast-slow pointer approach considered better than counting the list length first and then walking halfway?",
        "options": [
          "It uses less space than counting",
          "It finds the middle in a single pass instead of requiring two full passes",
          "It works on unsorted lists only",
          "It avoids using any pointers at all"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "valid-parentheses",
    "problemModel": "Problem",
    "questions": [
      {
        "text": "Why is '([)]' invalid even though it contains one of each bracket type in matching pairs?",
        "options": [
          "It has too many characters",
          "The closing brackets do not appear in the correct nested order — ']' closes before its matching '['",
          "The stack is never used",
          "'(' and '[' are incompatible characters"
        ],
        "correctIndex": 1
      },
      {
        "text": "After scanning the entire string, why must the algorithm check whether the stack is empty?",
        "options": [
          "To count total brackets",
          "Because a non-empty stack means some opening bracket was never matched with a closing one",
          "To reverse the string",
          "To free up memory"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "max-depth-binary-tree",
    "problemModel": "Problem",
    "questions": [
      {
        "text": "For a tree where every node has only one child (a straight line), what does the space complexity become, and why?",
        "options": [
          "O(1), because no extra memory is used",
          "O(log n), because the tree is still searched efficiently",
          "O(n), because the remembering needed at each level grows as deep as the tree, which here equals the number of nodes",
          "O(n²), because every node is compared to every other node"
        ],
        "correctIndex": 2
      },
      {
        "text": "How is the depth of the current node calculated from its children's depths?",
        "options": [
          "The sum of both children's depths",
          "The smaller of the two children's depths",
          "1 plus whichever child's depth is larger",
          "Always exactly 1 more than the root's depth"
        ],
        "correctIndex": 2
      }
    ]
  },
  {
    "problemSlug": "path-exists-in-graph",
    "problemModel": "Problem",
    "questions": [
      {
        "text": "Why must the exploration keep track of points it has already visited?",
        "options": [
          "To calculate the shortest distance",
          "To avoid looping forever by revisiting the same points repeatedly",
          "To count the total number of points",
          "To sort the points by value"
        ],
        "correctIndex": 1
      },
      {
        "text": "For this specific problem — just checking whether any path exists — does it matter whether you use breadth-first or depth-first exploration?",
        "options": [
          "Yes, only BFS works",
          "Yes, only DFS works",
          "No, either works equally well since only reachability matters, not the shortest path",
          "No, neither works and a different technique is needed"
        ],
        "correctIndex": 2
      }
    ]
  }
]
```

---

## DBMS (Database Management Systems)

### Lessons

```json
[
  {
    "title": "SQL Basics",
    "slug": "sql-basics",
    "category": "sql",
    "description": "The four core operations for talking to a database — Create, Read, Update, and Delete.",
    "icon": "Database",
    "order": 1,
    "difficulty": "easy",
    "problemCount": 0
  },
  {
    "title": "Joins & Subqueries",
    "slug": "joins-subqueries",
    "category": "sql",
    "description": "How to combine related rows spread across multiple tables using joins and subqueries.",
    "icon": "GitMerge",
    "order": 2,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Normalization",
    "slug": "normalization",
    "category": "design",
    "description": "The process of organising a database to eliminate duplicate data and prevent inconsistent updates.",
    "icon": "Layers",
    "order": 3,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Indexing & Performance",
    "slug": "indexing-performance",
    "category": "performance",
    "description": "How indexes speed up searching in a database, and how to read a query's execution plan to spot slowdowns.",
    "icon": "Zap",
    "order": 4,
    "difficulty": "hard",
    "problemCount": 0
  },
  {
    "title": "Transactions & Concurrency",
    "slug": "transactions-concurrency",
    "category": "transactions",
    "description": "How databases group operations so they all succeed or all fail together, even with many users at once.",
    "icon": "Shuffle",
    "order": 5,
    "difficulty": "hard",
    "problemCount": 0
  }
]
```

### Subtopics

```json
[
  {
    "title": "Filtering Rows by a Condition",
    "slug": "filtering-where",
    "description": "Narrow down which rows a query returns, using comparisons, ranges, and text-pattern matching.",
    "explanation": "Filtering narrows down which rows you get back, based on a condition. Without any filter, you get back every single row in the table.\n\nBasic comparisons: 'Give me all employees whose salary is above a certain number.' 'Give me all products whose price falls between two values.' 'Give me all orders whose status is one of a specific set of allowed values.'\n\nPattern matching: Filters can also match patterns in text — for example, 'find every email address ending in a certain domain.'\n\nCombining conditions: Multiple conditions can be joined together — for example: 'orders where the total is above a threshold, AND the status is still pending, AND the order was created after a certain date.' All three conditions must be true at once for a row to be included.",
    "lessonSlug": "sql-basics",
    "order": 1
  },
  {
    "title": "Aggregating and Grouping Data",
    "slug": "aggregate-groupby",
    "description": "Summarise a whole table — or groups within it — into single values like totals, averages, and counts.",
    "explanation": "An aggregate calculation looks across a whole set of rows and boils it down to a single summary number.\n\nCommon aggregate calculations:\n- Count — how many rows are there?\n- Sum — what is the total of a numeric column?\n- Average — what is the mean value?\n- Maximum / Minimum — what is the largest or smallest value?\n\nGrouping rows before aggregating: Instead of summarising the entire table at once, you can split rows into groups first (for example, 'group by department') and then calculate the summary separately for each group — giving you the total salary per department rather than one grand total.\n\nThe key distinction: Filtering individual rows happens before grouping. Filtering entire groups (based on an aggregate calculation) happens after grouping. You cannot filter on an aggregate result before that aggregate has been calculated.",
    "lessonSlug": "sql-basics",
    "order": 2
  },
  {
    "title": "Matching vs Keeping Everything (Inner and Outer Joins)",
    "slug": "inner-outer-joins",
    "description": "The different join types and how each decides which rows survive when two tables are combined.",
    "explanation": "Different join types decide which rows survive when two tables are combined.\n\n- Matching only (inner join): Keeps only the rows that have a match in both tables. If an order references a customer that no longer exists, that order disappears from the result.\n- Keep everything from one side (left/right join): Keeps every row from one specified table, filling in blanks for the other table wherever there is no match. For example, keeping every product — even ones that have never been ordered.\n- Keep everything from both sides (full outer join): Keeps every row from both tables, filling in blanks wherever there is no match on either side.",
    "lessonSlug": "joins-subqueries",
    "order": 1
  },
  {
    "title": "Subqueries That Depend on the Outer Row (Correlated Subqueries)",
    "slug": "correlated-subqueries",
    "description": "A 'question within a question' that re-runs once per outer row, using that row's own values.",
    "explanation": "A correlated subquery is a smaller question tucked inside a bigger one, where the smaller question depends on values from the row currently being checked in the bigger question. Because of that dependency, it effectively runs once per row of the outer question — which can be slow on large tables.\n\nExample: For every employee being examined, a fresh calculation works out the average salary just within that employee's department, and then compares the employee's salary to that freshly-calculated number.\n\nPerformance note: If there are 10,000 employees spread across only 50 departments, repeating this calculation once per employee (10,000 times) is wasteful. A more efficient approach: calculate each department's average once (by grouping), and then match that pre-calculated average back to each employee.",
    "lessonSlug": "joins-subqueries",
    "order": 2
  },
  {
    "title": "Functional Dependencies",
    "slug": "functional-dependencies",
    "description": "How one piece of data can reliably determine another — the foundation every normal form is built on.",
    "explanation": "A functional dependency means one piece of information uniquely determines another. For example, if you know a student's ID number, that alone tells you their name, address, and phone number — the ID 'determines' those other fields.\n\nWhy this matters for normalisation: Every level of normalisation is really about finding and removing unwanted dependencies. A partial dependency (where some information only depends on part of what uniquely identifies a row) gets removed at one stage. A transitive dependency (where one non-identifying piece of information depends on another non-identifying piece of information) gets removed at a later stage.",
    "lessonSlug": "normalization",
    "order": 1
  },
  {
    "title": "The Strictest Level: Every Determining Fact Must Be a True Identifier",
    "slug": "bcnf-decomposition",
    "description": "A stricter rule than the usual third normal form, requiring every determining fact to uniquely identify a row.",
    "explanation": "This stricter level (BCNF) requires that whenever one piece of information reliably determines another, the determining piece must be capable of uniquely identifying a whole row on its own — not just a partial dependency hiding in a larger table.\n\nHow to fix a table that breaks this rule:\n1. Find a dependency where the determining information is not capable of uniquely identifying the whole row.\n2. Split that dependency out into its own separate table.\n3. Remove the dependent information from the original table.\n4. Repeat this process on any remaining tables until none of them break the rule anymore.",
    "lessonSlug": "normalization",
    "order": 2
  },
  {
    "title": "Balanced Tree Indexes",
    "slug": "btree-indexes",
    "description": "The most common index structure in databases, keeping data sorted for fast searches, ranges, and sorting.",
    "explanation": "A balanced tree index is a self-organising tree structure that keeps data sorted, allowing searching, inserting, and deleting all in O(log n) time. It is the most common type of index used in databases.\n\nHow it works conceptually:\n- Data is stored in evenly-sized chunks called pages.\n- Each page points down to smaller groups of pages, forming a tree.\n- The actual data (or pointers to it) lives in the bottom layer, called leaf nodes.\n- Every leaf node sits at the exact same depth, keeping the tree balanced.\n\nWhen it helps most:\n- Looking for an exact match: 'find the row where the ID equals a specific value.'\n- Looking for a range: 'find every row with a date between two values.'\n- Sorting results by the indexed column.",
    "lessonSlug": "indexing-performance",
    "order": 1
  },
  {
    "title": "Reading Execution Plans",
    "slug": "query-execution-plans",
    "description": "How to read a database's plan for running your query, so you can spot slow full-table scans before they hurt.",
    "explanation": "An execution plan shows how the database actually intends to carry out your request. Reading it helps you spot performance problems before they become serious.\n\nWhat to look out for:\n- Scanning every row: Reading the entire table from start to finish — usually bad for large tables.\n- Using an index to jump straight to matching rows: Usually good.\n- Nested comparisons between two tables: For every row in one table, scanning through another table — can be slow if both tables are large.\n- Building a lookup table first, then scanning: Often faster than nested comparisons for large tables.",
    "lessonSlug": "indexing-performance",
    "order": 2
  },
  {
    "title": "The Four Guarantees (ACID)",
    "slug": "acid-properties",
    "description": "The four properties — Atomicity, Consistency, Isolation, Durability — that make transactions trustworthy.",
    "explanation": "ACID is a set of four guarantees that make transactions trustworthy.\n\n- Atomicity: All-or-nothing. If any part of the transaction fails, everything is rolled back as if it never started.\n- Consistency: The database always moves from one valid state to another valid state — none of its rules are ever violated, even temporarily.\n- Isolation: Transactions happening at the same time do not interfere with each other — each one behaves as if it were the only one running.\n- Durability: Once a transaction is confirmed as complete, the changes are permanent, even if the system crashes immediately afterward.",
    "lessonSlug": "transactions-concurrency",
    "order": 1
  },
  {
    "title": "Isolation Levels",
    "slug": "isolation-levels",
    "description": "The four standard settings that control how much simultaneous transactions are allowed to see of each other.",
    "explanation": "There are several standard isolation levels, each preventing a different kind of interference between simultaneous transactions.\n\nFrom loosest to strictest:\n- Read Uncommitted: Possible to read unfinished data, get different results on repeated reads, and see new rows appear.\n- Read Committed: Cannot read unfinished data, but can still get different results on repeated reads and see new rows appear.\n- Repeatable Read: Cannot read unfinished data or get different results on repeated reads, but can still see new rows appear.\n- Serializable: All three problems are prevented.\n\nProblems prevented:\n- Reading unfinished data: Seeing changes made by another transaction that has not been confirmed yet.\n- Different results on repeated reads: Reading the same row twice and getting different answers.\n- New rows appearing: Running the same query twice and getting a different set of rows.",
    "lessonSlug": "transactions-concurrency",
    "order": 2
  }
]
```

### Problems

```json
[
  {
    "title": "Employees Earning Above Their Department's Average",
    "slug": "employee-salary-query",
    "lessonSlug": "sql-basics",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Filtering", "Aggregation"],
    "companies": ["Amazon", "Google"],
    "problemStatement": "Find every employee who earns more than the average salary within their own department. Report their name, salary, and department name.",
    "examples": [
      {
        "input": "Employee table (id, name, salary, dept_id), Department table (id, name)",
        "output": "Names of employees earning above their department's average salary",
        "explanation": "For each employee, compare their salary to the average salary of everyone in the same department, not the company-wide average."
      }
    ],
    "constraints": ["1 <= rows <= 10^5", "salary is a positive integer"],
    "approach": "Step 1: For each department, work out the average salary of everyone in it.\n\nStep 2: Match each employee up with their department's name by connecting the employee data to the department data through a shared department identifier.\n\nStep 3: Compare each individual employee's salary to their own department's average — not the company-wide average — and keep only the ones who earn more than that average.\n\nHow the per-employee comparison works: For every single employee being checked, the calculation re-computes the average salary just for people in that same department, then checks the current employee against that number. This means the average used is specific to the employee's own department.",
    "timeComplexity": "O(n²) naive, O(n log n) with window functions",
    "spaceComplexity": "O(n)",
    "views": 8500,
    "bookmarks": 1400
  },
  {
    "title": "Total Sales Report by Product",
    "slug": "product-sales-report",
    "lessonSlug": "joins-subqueries",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["Joins", "Aggregation"],
    "companies": ["Microsoft", "Amazon"],
    "problemStatement": "Produce a report showing each product's total quantity sold and total revenue across every region — including products that have not sold at all.",
    "examples": [
      {
        "input": "Products table (id, name), Sales table (product_id, quantity, price)",
        "output": "Product name, total quantity sold, total revenue. Products with no sales show 0.",
        "explanation": "A LEFT JOIN from Products to Sales ensures products with no sales records still appear in the result."
      }
    ],
    "constraints": ["1 <= rows <= 10^5", "price > 0"],
    "approach": "Step 1: Start from the full list of products and connect each one to its matching sales records — but keep every product even if it has zero matching sales records. This is the 'keep everything from one side' join type (LEFT JOIN).\n\nStep 2: Group the combined data by product.\n\nStep 3: For each product, add up the total quantity sold and total revenue.\n\nStep 4: For products with no sales at all, treat their missing totals as zero rather than leaving them blank.\n\nStep 5: Sort the final report by revenue, highest first.",
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "views": 7200,
    "bookmarks": 1100
  },
  {
    "title": "Cleaning Up a Repetitive Student Table",
    "slug": "normalise-student-data",
    "lessonSlug": "normalization",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["Normalization"],
    "companies": ["Adobe", "Oracle"],
    "problemStatement": "Given a messy student table where each student has multiple Course1/Instructor1, Course2/Instructor2 columns repeated side by side, reorganise it into properly normalised tables.",
    "examples": [
      {
        "input": "Student(StudentID, Name, Course1, Instructor1, Course2, Instructor2)",
        "output": "Students(StudentID, Name), Enrollments(StudentID, CourseID), Courses(CourseID, Name, Instructor)",
        "explanation": "Remove repeating groups (1NF), then partial dependencies (2NF), then transitive dependencies (3NF)."
      }
    ],
    "constraints": ["Identify all functional dependencies first"],
    "approach": "Step 1 (Remove repeating groups — 1NF): Instead of separate columns for each course a student takes, create one row per student-course pairing. Now you have a simple Student table, plus a separate Enrollment table linking students to courses.\n\nStep 2 (Remove partial dependencies — 2NF): Check whether any piece of information in the Enrollment table depends on only part of what uniquely identifies each row. If not, this step is already satisfied.\n\nStep 3 (Remove transitive dependencies — 3NF): The instructor teaching a course depends on the course itself, not on which student is enrolled. Move instructor information into its own Course table, connected by course ID, rather than leaving it duplicated inside the Enrollment table across every student in that course.",
    "timeComplexity": "N/A",
    "spaceComplexity": "N/A",
    "views": 5600,
    "bookmarks": 980
  },
  {
    "title": "Speeding Up a Slow Multi-Table Query",
    "slug": "query-optimizer-analysis",
    "lessonSlug": "indexing-performance",
    "subtopicSlug": "",
    "difficulty": "hard",
    "topics": ["Indexing", "Performance"],
    "companies": ["Google", "Meta"],
    "problemStatement": "A query joining five tables with several filter conditions on un-indexed columns is taking 30 seconds. Recommend fixes to bring it under 1 second.",
    "examples": [
      {
        "input": "Slow query joining 5 tables with multiple WHERE conditions on unindexed columns (millions of rows)",
        "output": "Execution plan showing sequential scans on 3 large tables, replaced with index scans after optimisation",
        "explanation": "Missing indexes on JOIN and WHERE columns cause full table scans — adding composite indexes and restructuring the query fixes this."
      }
    ],
    "constraints": ["Table sizes range from 100K to 10M rows"],
    "approach": "Step 1: Examine the execution plan to identify which parts of the query are scanning entire tables instead of using an index.\n\nStep 2: Add indexes on the columns that are actually used for joining tables together and for filtering. Use combined (multi-column) indexes when a query filters on more than one column at once.\n\nStep 3: Avoid wrapping a filtered column in a calculation (like extracting just the year from a date), since that usually prevents the database from using an index at all. Instead, filter using a plain range: 'on or after the start of the year, and before the start of the next year.'\n\nStep 4: Re-check the execution plan afterward to confirm the slow full-table scans have been replaced with fast index lookups.",
    "timeComplexity": "Reduced from O(n×m) to O(log n + m) with indexes",
    "spaceComplexity": "O(n) for index storage",
    "views": 4100,
    "bookmarks": 760
  },
  {
    "title": "Detecting a Deadlock",
    "slug": "deadlock-detection",
    "lessonSlug": "transactions-concurrency",
    "subtopicSlug": "",
    "difficulty": "hard",
    "topics": ["Concurrency", "Transactions"],
    "companies": ["Oracle", "Microsoft"],
    "problemStatement": "Given a set of transactions and the locks they are each waiting on, detect whether a deadlock exists using a wait-for graph.",
    "examples": [
      {
        "input": "T1 holds lock on A and waits for B. T2 holds lock on B and waits for A.",
        "output": "Deadlock detected between T1 and T2",
        "explanation": "Circular wait condition creates a deadlock — neither transaction can proceed."
      }
    ],
    "constraints": ["Up to 100 concurrent transactions", "Resources are identified by integers"],
    "approach": "Step 1: Build a diagram where each transaction is a point, and a connection is drawn from Transaction X to Transaction Y whenever X is waiting on something Y is holding. This is called a wait-for graph.\n\nStep 2: Explore this diagram starting from each point, looking for a path that eventually loops back to where it started — a cycle.\n\nStep 3: If such a cycle exists, a deadlock is present among the transactions in that cycle. Every transaction in that loop is waiting on the next one, all the way back to itself — none of them can ever proceed.",
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V)",
    "views": 3800,
    "bookmarks": 620
  }
]
```

### Quizzes (DBMS)

```json
[
  {
    "problemSlug": "employee-salary-query",
    "problemModel": "DbmsProblem",
    "questions": [
      {
        "text": "When checking whether an employee earns 'above average,' which average should be used?",
        "options": [
          "The company-wide average salary",
          "The average salary within that employee's own department",
          "The average of the top 3 earners",
          "The average of the previous year's salaries"
        ],
        "correctIndex": 1
      },
      {
        "text": "Why does the average salary calculation need to be tied to each employee's department rather than computed once for the whole company?",
        "options": [
          "Because averages can only be computed once per table",
          "Because each department can have a different average, so the comparison must use that specific department's figure",
          "Because company-wide averages are always inaccurate",
          "Because department names must be sorted first"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "product-sales-report",
    "problemModel": "DbmsProblem",
    "questions": [
      {
        "text": "Why must this report use a 'keep everything from one side' join starting from the products table, instead of a matching-only join?",
        "options": [
          "Because matching-only joins are always slower",
          "Because products with zero sales have no matching sales records, and a matching-only join would drop them entirely",
          "Because the products table has more columns",
          "Because sales data is always incomplete"
        ],
        "correctIndex": 1
      },
      {
        "text": "For a product with zero matching sales rows, what should its total quantity and revenue be shown as?",
        "options": ["Left blank/null", "Zero", "The average of all other products", "Excluded from the report entirely"],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "normalise-student-data",
    "problemModel": "DbmsProblem",
    "questions": [
      {
        "text": "What is the first step in decomposing the repetitive student table?",
        "options": [
          "Removing transitive dependencies",
          "Removing repeating groups by creating one row per student-course pairing",
          "Deleting the Student table entirely",
          "Merging all courses into one column"
        ],
        "correctIndex": 1
      },
      {
        "text": "Why should instructor information be moved into a separate Course table instead of staying in the Enrollment table?",
        "options": [
          "Because instructors change every semester",
          "Because the instructor depends on the course itself, not on which student is enrolled — leaving it in Enrollment would duplicate it across every student in that course",
          "Because Enrollment tables cannot hold text",
          "Because it makes the table shorter"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "query-optimizer-analysis",
    "problemModel": "DbmsProblem",
    "questions": [
      {
        "text": "What should be examined first to find out why the 5-table query is slow?",
        "options": [
          "The table names",
          "The execution plan, to spot which parts are scanning entire tables instead of using an index",
          "The number of columns in each table",
          "The database's storage engine version"
        ],
        "correctIndex": 1
      },
      {
        "text": "Why does filtering with 'extract the year from this date column' hurt performance compared to filtering with a plain date range?",
        "options": [
          "It uses more storage space",
          "Wrapping the column in a calculation usually prevents the database from using an index on that column at all",
          "It returns incorrect results",
          "It only works on numeric columns"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "deadlock-detection",
    "problemModel": "DbmsProblem",
    "questions": [
      {
        "text": "In the wait-for graph built for deadlock detection, what does a connection from Transaction X to Transaction Y mean?",
        "options": [
          "X and Y are both idle",
          "X is waiting on a resource that Y currently holds",
          "X has finished and Y is starting",
          "X and Y are the same transaction"
        ],
        "correctIndex": 1
      },
      {
        "text": "What structure in the wait-for graph indicates that a deadlock exists?",
        "options": [
          "A single point with no connections",
          "A cycle — a path that starts and ends at the same transaction",
          "The transaction with the most connections",
          "Two disconnected points"
        ],
        "correctIndex": 1
      }
    ]
  }
]
```

---

## OS (Operating Systems)

### Lessons

```json
[
  {
    "title": "Process Management",
    "slug": "process-management",
    "category": "process",
    "description": "How the operating system creates, tracks, and switches between running programs.",
    "icon": "Cpu",
    "order": 1,
    "difficulty": "easy",
    "problemCount": 0
  },
  {
    "title": "CPU Scheduling",
    "slug": "cpu-scheduling",
    "category": "scheduling",
    "description": "The algorithms that decide which waiting process gets the processor next, and for how long.",
    "icon": "Clock",
    "order": 2,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Memory Management",
    "slug": "memory-management",
    "category": "memory",
    "description": "How the operating system allocates memory and creates the illusion that every process has it all to itself.",
    "icon": "HardDrive",
    "order": 3,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "File Systems",
    "slug": "file-systems",
    "category": "storage",
    "description": "How data is organised, stored, and retrieved from disk, including how disk requests are ordered.",
    "icon": "FolderOpen",
    "order": 4,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Synchronisation & Deadlocks",
    "slug": "sync-deadlocks",
    "category": "synchronization",
    "description": "How to safely coordinate access to shared resources between processes, and how deadlocks form.",
    "icon": "Shield",
    "order": 5,
    "difficulty": "hard",
    "problemCount": 0
  }
]
```

### Subtopics

```json
[
  {
    "title": "Process States & Transitions",
    "slug": "process-states",
    "description": "The lifecycle a process moves through — New, Ready, Running, Waiting, Terminated.",
    "explanation": "A process moves through a series of states over its lifetime:\n- New: The process is being set up.\n- Ready: Loaded into memory, waiting for its turn on the processor.\n- Running: Currently executing on the processor.\n- Waiting: Paused, blocked on something external like disk or keyboard input.\n- Terminated: Finished running.\n\nTransitions: New → Ready (admitted), Ready → Running (scheduled), Running → Waiting (I/O or event wait), Waiting → Ready (I/O completed), Running → Terminated (finished).",
    "lessonSlug": "process-management",
    "order": 1
  },
  {
    "title": "Context Switching",
    "slug": "context-switching",
    "description": "How the CPU saves one process's state and loads another's when it switches who is running.",
    "explanation": "When the processor switches from running one process to running another, it has to save the current process's exact state (what instruction it was on, what its variables held, etc.) and load the next process's saved state. This is a context switch.\n\nThe cost: Context switching is pure overhead — it does not accomplish any actual work for either process. Frequent switching can noticeably slow down overall throughput.\n\nWhat gets saved in the Process Control Block (PCB):\n- A unique identifier for the process.\n- Exactly which instruction it should resume from (program counter).\n- The values held in the processor's working registers.\n- Information about which parts of memory belong to it.\n- The status of any files or resources it has open.",
    "lessonSlug": "process-management",
    "order": 2
  },
  {
    "title": "First-Come-First-Served & Shortest-Job-First",
    "slug": "fcfs-sjf",
    "description": "Two simple scheduling rules — run whoever arrived first, or run whoever needs the least time.",
    "explanation": "First-Come-First-Served: Whoever arrives first runs first, all the way through, without being interrupted. Simple, but suffers from the convoy effect: if a very long process happens to arrive first, everything behind it has to wait.\n\nShortest-Job-First: The process needing the least amount of time runs next. Mathematically proven to give the smallest possible average waiting time. But can cause starvation: if short processes keep arriving, a long process might get pushed back indefinitely.",
    "lessonSlug": "cpu-scheduling",
    "order": 1
  },
  {
    "title": "Round Robin Scheduling",
    "slug": "round-robin",
    "description": "Give every process a small, fixed time slice in rotation, so nothing waits forever.",
    "explanation": "Every process gets a small, fixed slice of time (called a quantum). When its slice runs out, it goes to the back of the waiting line and the next process gets its turn.\n\nThe trade-off around slice size:\n- A small slice: Very responsive, good for interactive use, but causes lots of context-switch overhead.\n- A large slice: Less overhead, but less responsive — with a large enough slice, it behaves just like first-come-first-served.\n\nRule of thumb: The slice should be a bit larger than the actual cost of a context switch, so most of the time is spent doing real work rather than switching.",
    "lessonSlug": "cpu-scheduling",
    "order": 2
  },
  {
    "title": "Paging & Virtual Memory",
    "slug": "paging-virtual-memory",
    "description": "How memory is split into fixed-size pages, letting a process use more memory than physically exists.",
    "explanation": "Paging splits memory into fixed-size chunks: pages in virtual memory, and frames in physical memory. A lookup table maps each virtual page to wherever its data actually lives in physical memory.\n\nWhy have virtual memory? A program might need more memory than the computer physically has. Virtual memory lets parts of a process sit on disk until they are actually needed, creating the illusion of nearly unlimited memory.\n\nPage fault: When a program tries to use a page that is not currently loaded into physical memory, the operating system has to fetch it from disk. This is dramatically slower than accessing memory that is already loaded — often tens of thousands of times slower.",
    "lessonSlug": "memory-management",
    "order": 1
  },
  {
    "title": "Page Replacement Algorithms",
    "slug": "page-replacement",
    "description": "The strategies for choosing which page to evict when memory is full and a new one needs to load.",
    "explanation": "When physical memory is full and a new page needs to be loaded, the operating system must evict something.\n\n- First In, First Out: Evict whichever page has been in memory the longest. Simple, but can behave counter-intuitively — sometimes adding more memory actually causes more page faults (Belady's Anomaly).\n- Least Recently Used: Evict the page that has not been touched for the longest time. Generally performs well, but is more complex to implement precisely.\n- Optimal (theoretical only): Evict the page that will not be needed again for the longest time in the future. Used mainly as a benchmark to compare other strategies against.\n- Clock: A practical approximation of LRU. Every page has a 'recently used' flag. A pointer sweeps around, clearing flags as it goes; the first page it finds with a cleared flag gets evicted.",
    "lessonSlug": "memory-management",
    "order": 2
  },
  {
    "title": "File Allocation Methods",
    "slug": "file-allocation",
    "description": "Three ways to lay out a file's data on disk — contiguous, linked, or indexed — each with its own trade-offs.",
    "explanation": "Contiguous allocation: Each file occupies one unbroken stretch of disk space. Pros: Fast to read sequentially or randomly. Cons: Leaves gaps of unusable space over time (fragmentation); you need to know the file's size in advance.\n\nLinked allocation: Each chunk of the file points to the location of the next chunk. Pros: No fragmentation; files can grow freely. Cons: Slow to jump to a specific point; some space is spent on pointers.\n\nIndexed allocation: Each file has a separate index listing every chunk it uses. Pros: Fast to jump to any point; no fragmentation. Cons: The index itself takes up extra space, wasteful for very small files.",
    "lessonSlug": "file-systems",
    "order": 1
  },
  {
    "title": "Disk Scheduling Algorithms",
    "slug": "disk-scheduling",
    "description": "The strategies that decide the order in which pending disk requests are served, to minimise head movement.",
    "explanation": "The disk's read/write head has to physically move to the right location to access data. Scheduling algorithms aim to minimise how much it has to move.\n\n- First-Come-First-Served: Handle requests in arrival order. Fair but can mean a lot of unnecessary back-and-forth.\n- Shortest-Seek-Time-First: Always handle whichever request is physically closest. Better throughput but can cause starvation.\n- Elevator-style sweep (SCAN): Move steadily in one direction, handle every request along the way, then reverse.\n- One-directional sweep with jump-back (C-SCAN): Move in one direction only, then jump straight back to the start.\n- LOOK/C-LOOK: Like SCAN/C-SCAN but turn around at the last request rather than the physical end.",
    "lessonSlug": "file-systems",
    "order": 2
  },
  {
    "title": "Locks and Counting Permits",
    "slug": "semaphores-mutexes",
    "description": "The basic tools — locks and counting permits — used to make sure shared resources are not touched unsafely.",
    "explanation": "A simple lock (mutex): Has exactly two states — locked and unlocked. Only whoever locked it is allowed to unlock it.\n\nHow it works:\n1. Before entering the shared section, acquire the lock — if it is already locked, wait until it is free.\n2. Do the work that needs exclusive access.\n3. Release the lock so someone else can acquire it.\n\nA counting semaphore: A generalised version with a running count, starting at however many identical resources are available. Useful for managing a pool of resources — for example, allowing up to 5 simultaneous connections.",
    "lessonSlug": "sync-deadlocks",
    "order": 1
  },
  {
    "title": "Classic Synchronisation Problems",
    "slug": "classic-sync-problems",
    "description": "Three famous scenarios — producer-consumer, dining philosophers, readers-writers — that expose synchronisation pitfalls.",
    "explanation": "Producer-Consumer: Producers add items to a shared, limited-size buffer; consumers remove items from it. Needs three coordinating mechanisms: one tracking how many empty slots remain, one tracking how many filled slots exist, and one ensuring only one party touches the buffer at a time.\n\nDining Philosophers: Five people sit around a table with five utensils between them, and each person needs two utensils to eat. Solutions: require picking up both utensils at once, or limit how many people can attempt eating simultaneously.\n\nReaders-Writers: Multiple readers can safely read shared data at the same time, but a writer needs completely exclusive access. Typical solution: readers may proceed as long as no writer is active; writers wait until all current readers have finished.",
    "lessonSlug": "sync-deadlocks",
    "order": 2
  }
]
```

### Problems

```json
[
  {
    "title": "First-Come-First-Served Scheduling Calculator",
    "slug": "process-scheduling-calculator",
    "lessonSlug": "process-management",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Process Scheduling"],
    "companies": ["Microsoft", "Amazon"],
    "problemStatement": "Given a list of processes with their arrival times and how long each one needs to run (burst time), calculate each process's waiting time and turnaround time, assuming processes run strictly in the order they arrive.",
    "examples": [
      {
        "input": "Process 1: arrival=0, burst=5. Process 2: arrival=1, burst=3. Process 3: arrival=2, burst=8.",
        "output": "Average waiting = 3.67, Average turnaround = 9.0",
        "explanation": "P1 runs from 0 to 5. P2 runs from 5 to 8. P3 runs from 8 to 16. Waiting times: P1=0, P2=4, P3=6. Turnaround: P1=5, P2=7, P3=14."
      }
    ],
    "constraints": ["1 <= n <= 100", "Burst time <= 1000"],
    "approach": "Step 1: Sort the processes by arrival time — whoever arrives first runs first.\n\nStep 2: Track a running 'current time,' starting at the first process's arrival time.\n\nStep 3: For each process in order:\n- Its waiting time is the current time minus its arrival time.\n- Run it for its full burst time, advancing the current time by that amount.\n- Its turnaround time is the current time (after running) minus its arrival time.\n\nStep 4: Average the waiting times and turnaround times across all processes.\n\nKey concept: Waiting time measures only the delay before the process starts running. Turnaround time measures the full span from arrival to completion, including the actual run time.",
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(1)",
    "views": 9800,
    "bookmarks": 1600
  },
  {
    "title": "Simulating Round Robin",
    "slug": "round-robin-quantum",
    "lessonSlug": "cpu-scheduling",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["CPU Scheduling"],
    "companies": ["Google", "Meta"],
    "problemStatement": "Simulate Round Robin scheduling for a set of processes with a given time slice (quantum), and report each process's completion time along with the number of context switches.",
    "examples": [
      {
        "input": "P1 needs 10 units, P2 needs 5 units, P3 needs 8 units. Slice = 4 units. All arrive at time 0.",
        "output": "P2 finishes at 13, P1 finishes at 17, P3 finishes at 23",
        "explanation": "Round 1: P1 runs 4 (6 left), P2 runs 4 (1 left), P3 runs 4 (4 left). Round 2: P1 runs 4 (2 left), P2 runs 1 and finishes, P3 runs 4 and finishes. Round 3: P1 runs 2 and finishes."
      }
    ],
    "constraints": ["1 <= n <= 50", "Quantum >= 1"],
    "approach": "Step 1: Put every process into a waiting line in arrival order.\n\nStep 2: Take the process at the front of the line and let it run for up to one time slice, or until it finishes — whichever comes first.\n\nStep 3: If it still has work left after its slice, send it to the back of the line.\n\nStep 4: If it finishes, record its completion time.\n\nStep 5: Repeat until the line is empty. Count each handoff between processes as one context switch.\n\nContext switch counting: A context switch happens when control moves from one process to a different one.",
    "timeComplexity": "O(n × max_burst/quantum)",
    "spaceComplexity": "O(n)",
    "views": 7600,
    "bookmarks": 1200
  },
  {
    "title": "Simulating Least-Recently-Used Page Replacement",
    "slug": "lru-page-replacement",
    "lessonSlug": "memory-management",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["Memory Management"],
    "companies": ["Amazon", "Adobe"],
    "problemStatement": "Given a sequence of page requests and a fixed number of available memory frames, simulate Least-Recently-Used (LRU) replacement and count how many page faults occur.",
    "examples": [
      {
        "input": "Pages: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2], Frames = 4",
        "output": "Page faults = 9",
        "explanation": "Each unique page not in memory causes a fault. When memory is full, the least recently used page is evicted. The total number of times a new page must be loaded is 9."
      }
    ],
    "constraints": ["1 <= frames <= 100", "1 <= reference length <= 1000"],
    "approach": "Step 1: Keep track of which pages are currently loaded, along with how recently each was used.\n\nStep 2: For each requested page:\n- If it is already loaded, mark it as just-used and move on (a hit, no fault).\n- If it is not loaded and there is still free space, load it and mark it just-used (a fault, but no eviction).\n- If it is not loaded and memory is full, evict whichever loaded page was used least recently, then load the new page in its place (a fault, with an eviction).\n\nStep 3: Count every fault along the way.\n\nKey distinction: A 'hit' means the page was already in memory — no fault. A 'fault' means the page was not in memory and had to be loaded. An 'eviction' is a fault that also required removing an existing page.",
    "timeComplexity": "O(n × f) where f = frames",
    "spaceComplexity": "O(f)",
    "views": 8300,
    "bookmarks": 1400
  },
  {
    "title": "Simulating an Elevator-Style Disk Sweep",
    "slug": "scan-disk-scheduling",
    "lessonSlug": "file-systems",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["Disk Scheduling"],
    "companies": ["Microsoft", "Seagate"],
    "problemStatement": "Simulate the elevator-style (SCAN) disk scheduling algorithm. The disk head starts at a given position and moves in a given direction. Calculate the total head movement in cylinders.",
    "examples": [
      {
        "input": "Head = 50, Direction = Right, Requests = [82, 170, 43, 140, 24, 16, 190], Disk size = 200",
        "output": "Total head movement = 332 cylinders",
        "explanation": "Head moves right: 50 to 82, 140, 170, 190, then to 199 (end). Reverses left: 199 to 43, 24, 16. Total = (199-50) + (199-16) = 149 + 183 = 332."
      }
    ],
    "constraints": ["0 <= cylinder <= 199", "1 <= requests <= 1000"],
    "approach": "Step 1: Sort all the requests into two groups: those to the right of the current position and those to the left.\n\nStep 2: Starting at the current position and moving in the given direction, visit each request in that direction in order (increasing if moving right, decreasing if moving left).\n\nStep 3: Continue moving all the way to the physical end of the disk in that direction, even if there is no request exactly there — the head must physically travel through that point before reversing.\n\nStep 4: Reverse direction and visit each remaining request in the opposite order.\n\nStep 5: Add up the total distance travelled in both directions to get the total head movement.\n\nKey distinction: Standard SCAN sweeps to the physical end of the disk before reversing, whereas the LOOK variant turns around at the last request.",
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "views": 5400,
    "bookmarks": 880
  },
  {
    "title": "Coordinating Producers and Consumers Safely",
    "slug": "producer-consumer",
    "lessonSlug": "sync-deadlocks",
    "subtopicSlug": "",
    "difficulty": "hard",
    "topics": ["Synchronisation"],
    "companies": ["Google", "Meta", "Uber"],
    "problemStatement": "Multiple producers add items to a shared, fixed-size buffer, while multiple consumers remove items from it. The solution must avoid conflicts (two threads touching the buffer at once) and avoid deadlocks (everyone stuck waiting forever).",
    "examples": [
      {
        "input": "Buffer size = 5, 3 producers producing 10 items each, 2 consumers consuming 15 items each",
        "output": "All 30 items produced and consumed without race conditions or deadlocks",
        "explanation": "Three coordinating mechanisms work together: one tracks empty slots (starts at 5), one tracks filled slots (starts at 0), and one ensures exclusive access to the buffer itself."
      }
    ],
    "constraints": ["Buffer size >= 1", "1 <= producers, consumers <= 100"],
    "approach": "Step 1: Keep track of how many empty slots remain in the buffer, and how many filled slots exist.\n\nStep 2: Before a producer adds an item, it must first wait for an empty slot to be available (so the buffer never overflows).\n\nStep 3: Before actually placing the item, the producer must gain exclusive access to the buffer, so no other thread is modifying it at the same moment. It releases that exclusive access immediately after placing the item.\n\nStep 4: Once the item is placed, mark that there is now one more filled slot for a consumer to take.\n\nStep 5: Symmetrically, before a consumer removes an item, it must first wait for a filled slot to be available (so it never reads from an empty buffer), then gain exclusive access, remove the item, release exclusive access, and finally mark that there is now one more empty slot.\n\nWhy this works: Waiting for an empty slot stops producers from overflowing the buffer. Waiting for a filled slot stops consumers from reading nothing. Exclusive access during the actual add/remove step stops two threads from corrupting the buffer by touching it at exactly the same instant.",
    "timeComplexity": "O(n) total across all threads",
    "spaceComplexity": "O(buffer_size)",
    "views": 11000,
    "bookmarks": 2100
  }
]
```

### Quizzes (OS)

```json
[
  {
    "problemSlug": "process-scheduling-calculator",
    "problemModel": "OsProblem",
    "questions": [
      {
        "text": "A process starts running at time 8 but arrived at time 2. What is its waiting time?",
        "options": ["8", "2", "6", "10"],
        "correctIndex": 2
      },
      {
        "text": "What is the difference between a process's turnaround time and its waiting time?",
        "options": [
          "They are always equal",
          "Turnaround time is finish time minus arrival time (includes execution); waiting time is start time minus arrival time (excludes execution)",
          "Waiting time includes execution time but turnaround does not",
          "Turnaround time only applies to the first process"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "round-robin-quantum",
    "problemModel": "OsProblem",
    "questions": [
      {
        "text": "If a process still has work left after using its full time slice, what happens to it?",
        "options": [
          "It is terminated immediately",
          "It goes to the back of the waiting line to wait for another turn",
          "It gets a longer slice next time",
          "It skips ahead of all other processes"
        ],
        "correctIndex": 1
      },
      {
        "text": "In the simulation, what counts as one context switch?",
        "options": [
          "Every time a process runs at all",
          "Each handoff from one process to another when the CPU changes who it is running",
          "Only when a process finishes completely",
          "Only at the very start of the simulation"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "lru-page-replacement",
    "problemModel": "OsProblem",
    "questions": [
      {
        "text": "When a requested page is already loaded in memory, what happens?",
        "options": [
          "It is counted as a fault",
          "It is counted as a hit, and the page is marked as most recently used",
          "The oldest page is evicted",
          "Nothing happens and it is ignored"
        ],
        "correctIndex": 1
      },
      {
        "text": "When memory is full and a new page must be loaded, which page does LRU evict?",
        "options": [
          "The page that was loaded first",
          "The page that has not been used for the longest time",
          "A randomly chosen page",
          "The page requested most frequently overall"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "scan-disk-scheduling",
    "problemModel": "OsProblem",
    "questions": [
      {
        "text": "Why does the elevator-style sweep travel all the way to position 199, even though the farthest actual request is only at 190?",
        "options": [
          "To save time",
          "Because the classic SCAN algorithm sweeps to the physical end of the disk before reversing, regardless of where the last request is",
          "Because 199 is always a request",
          "To reduce the total number of requests"
        ],
        "correctIndex": 1
      },
      {
        "text": "Given the head starts at 50, sweeps right to 199, then left to 16, how is total head movement calculated?",
        "options": [
          "199 - 16",
          "(199 - 50) + (199 - 16)",
          "190 - 50",
          "(199 - 50) - (199 - 16)"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "producer-consumer",
    "problemModel": "OsProblem",
    "questions": [
      {
        "text": "What stops a producer from adding an item when the buffer is already full?",
        "options": [
          "The exclusive-access lock alone",
          "Waiting for an empty slot to become available before adding anything",
          "A random delay between additions",
          "Consumers running faster than producers"
        ],
        "correctIndex": 1
      },
      {
        "text": "Given that empty/filled slot counts already prevent overflow and underflow, why is exclusive access to the buffer still required during the actual add/remove step?",
        "options": [
          "It is not required, the slot counts are enough",
          "To stop two threads from modifying the buffer's contents at the exact same instant and corrupting it",
          "To make the buffer bigger",
          "To speed up producers"
        ],
        "correctIndex": 1
      }
    ]
  }
]
```

---

## Programming (General Concepts, Language-Agnostic)

### Lessons

```json
[
  {
    "title": "Core Programming Building Blocks",
    "slug": "python-basics",
    "category": "core",
    "description": "Foundational ideas — transforming collections and understanding variable scope — that exist in nearly every language.",
    "icon": "Terminal",
    "order": 1,
    "difficulty": "easy",
    "problemCount": 0
  },
  {
    "title": "Object-Oriented Thinking",
    "slug": "oop-concepts",
    "category": "oop",
    "description": "A way of organising code around objects that bundle data and behaviour, built on four core pillars.",
    "icon": "Box",
    "order": 2,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Thinking in Functions (Functional Programming Ideas)",
    "slug": "functional-programming",
    "category": "functional",
    "description": "Treating computation as data transformations — using map, filter, reduce, and functions that remember their context.",
    "icon": "Repeat",
    "order": 3,
    "difficulty": "medium",
    "problemCount": 0
  },
  {
    "title": "Recognising Reusable Design Solutions",
    "slug": "design-patterns",
    "category": "design",
    "description": "Well-known, reusable blueprints for common software design problems, like Singleton and Observer.",
    "icon": "Layers",
    "order": 4,
    "difficulty": "hard",
    "problemCount": 0
  },
  {
    "title": "Testing & Debugging",
    "slug": "testing-debugging",
    "category": "testing",
    "description": "The skills of confirming code works correctly (testing) and finding out why it does not (debugging).",
    "icon": "Bug",
    "order": 5,
    "difficulty": "medium",
    "problemCount": 0
  }
]
```

### Subtopics

```json
[
  {
    "title": "Building a New List by Transforming an Existing One",
    "slug": "list-comprehensions",
    "description": "A concise pattern for turning one collection into another by transforming and optionally filtering its items.",
    "explanation": "A common, concise pattern: take an existing collection of items, apply some transformation to each one, optionally skip items that do not meet a condition, and end up with a brand-new collection.\n\nThe general idea:\n1. Go through each item in the original collection, one at a time.\n2. Optionally, check a condition — if the item does not satisfy it, skip it entirely.\n3. Otherwise, apply some transformation to the item (like doubling a number).\n4. Collect all the transformed items into a new collection, in the same order they were processed.\n\nWorked example: Starting with the numbers 0 through 9, and wanting only the squares of the even ones: go through each number, keep only the ones that divide evenly by 2, and for each one that survives, square it. The result: 0, 4, 16, 36, 64.",
    "lessonSlug": "python-basics",
    "order": 1
  },
  {
    "title": "Functions and Where Variables Live (Scope)",
    "slug": "functions-scope",
    "description": "How functions organise reusable code, and the rules that decide where a variable can and cannot be seen.",
    "explanation": "A function is a reusable, named block of instructions. 'Scope' describes where a variable can actually be seen and used.\n\nThe general rule most languages follow, from narrowest to widest:\n1. Local — variables created inside the current function; only that function can see them.\n2. Enclosing — variables from any function that wraps around the current one, if functions are nested inside each other.\n3. Global — variables defined at the top level, outside any function, visible everywhere in that file.\n4. Built-in — names the language itself provides automatically.\n\nWorked example: Imagine a variable named x set at the very top level of a program. Inside a function, a different variable also named x is created — this new one only exists inside that function and does not affect the outer one. If there is a function nested even further inside that creates its own x too, that innermost x only affects code within that innermost function. Once each function finishes, whatever x it created disappears, and whatever version of x was visible one level up reappears unaffected.",
    "lessonSlug": "python-basics",
    "order": 2
  },
  {
    "title": "Inheritance & Polymorphism",
    "slug": "inheritance-polymorphism",
    "description": "How new object categories can reuse and override behaviour from a general 'parent' category.",
    "explanation": "Inheritance conceptually: Imagine a general category called 'Animal' that knows how to 'make a sound,' but does not specify exactly what sound. More specific categories, like 'Dog' and 'Cat,' inherit everything general Animals can do, but override the 'make a sound' behaviour with their own specific version.\n\nPolymorphism in action: If you have a mixed group containing Dogs and Cats, and you tell every single one of them to 'make a sound,' each object automatically produces its own correct sound — a Dog barks, a Cat meows — even though you gave exactly the same instruction to all of them. The calling code does not need to know or care which specific type each object is.",
    "lessonSlug": "oop-concepts",
    "order": 1
  },
  {
    "title": "Encapsulation & Abstraction",
    "slug": "encapsulation-abstraction",
    "description": "How objects can hide their internal data and expose only a simple, safe way to interact with it.",
    "explanation": "Encapsulation conceptually: Imagine a bank account object that keeps its balance hidden from the outside world. Nobody outside the object can directly change the balance number by reaching in and editing it. Instead, they must go through controlled actions the object exposes, like 'deposit' — which can include its own safety checks, such as refusing a deposit of a negative amount.\n\nAbstraction conceptually: When you use something like a 'deposit' action, you do not need to know how the balance is stored internally, or what checks happen behind the scenes — you only need to know that calling 'deposit' with an amount increases the balance appropriately. The complexity is hidden behind a simple, predictable interface.",
    "lessonSlug": "oop-concepts",
    "order": 2
  },
  {
    "title": "Transform, Filter, Combine",
    "slug": "map-filter-reduce",
    "description": "Three fundamental ways to process a collection — transform every item, keep only some, or boil it down to one value.",
    "explanation": "Transform (often called 'map'): Apply the same operation to every item in a collection, producing a new collection of the same length. For example, doubling every number in a list of 1, 2, 3, 4 gives 2, 4, 6, 8.\n\nFilter: Keep only the items that satisfy some condition, discarding the rest. For example, keeping only even numbers from 1, 2, 3, 4 gives 2, 4.\n\nCombine (often called 'reduce' or 'fold'): Boil an entire collection down to a single value by repeatedly combining items two at a time. For example, combining 1, 2, 3, 4 by adding: first combine 1 and 2 to get 3, then combine that with 3 to get 6, then combine that with 4 to get a final total of 10.",
    "lessonSlug": "functional-programming",
    "order": 1
  },
  {
    "title": "Functions That Remember Their Surroundings (Closures)",
    "slug": "closures-hof",
    "description": "Functions that keep hold of the variables from where they were created, even after that context has finished.",
    "explanation": "A closure is a function that 'remembers' the variables from the place it was created, even after that surrounding context has technically finished running.\n\nWorked example conceptually: Imagine a function whose whole job is to build other functions — you give it a number (say, 2), and it hands you back a brand-new function that always multiplies whatever it is given by 2. If you ask it again with a different number (say, 3), it hands you back a separate function that always multiplies by 3 instead. Each of these returned functions permanently 'remembers' its own multiplier, even though the original function that created it has already finished running.",
    "lessonSlug": "functional-programming",
    "order": 2
  },
  {
    "title": "Ensuring Only One Instance Exists (Singleton)",
    "slug": "singleton-pattern",
    "description": "A pattern that guarantees a class has exactly one shared instance across the whole program.",
    "explanation": "The idea: Guarantee that a particular class only ever has exactly one instance in the whole program, and provide one shared way to access it.\n\nWhen to use it: Situations like a shared configuration manager, a logging system, or a shared pool of database connections — cases where having multiple independent instances would cause conflicts or wasted resources.\n\nHow it works:\n1. The very first time anyone asks for an instance, create it and remember it.\n2. Every subsequent time anyone asks for an instance, hand back that same remembered one instead of creating a new one.\n3. As a result, no matter how many different parts of the program ask for it, they are all sharing the exact same underlying instance.",
    "lessonSlug": "design-patterns",
    "order": 1
  },
  {
    "title": "Broadcasting Changes to Interested Parties (Observer)",
    "slug": "observer-pattern",
    "description": "A pattern where interested subscribers are automatically notified whenever something they follow changes.",
    "explanation": "The idea: Set up a one-to-many relationship where, when one object's state changes, every other object that has expressed interest gets automatically notified.\n\nWhen to use it: Event-handling systems, notification services, or updating a user interface automatically whenever the underlying data changes.\n\nHow it works:\n1. Interested parties 'subscribe' to a particular event by registering themselves.\n2. When that event actually happens, the source goes through its list of subscribers one by one and notifies each of them.\n3. Any party that is no longer interested can 'unsubscribe,' so it stops being notified going forward.",
    "lessonSlug": "design-patterns",
    "order": 2
  },
  {
    "title": "Unit Testing",
    "slug": "unit-testing-pytest",
    "description": "How to check the smallest testable piece of code in isolation, and reuse shared setup across tests.",
    "explanation": "A unit test checks the smallest meaningful piece of your code — usually a single function — in isolation, to confirm it behaves correctly for a given input.\n\nThe general shape of a unit test:\n1. Set up whatever input or starting conditions the test needs.\n2. Run the specific piece of code being tested.\n3. Check that the actual result matches the expected result.\n4. If it does not match, the test fails and flags exactly what went wrong.\n\nSetup and teardown (often called fixtures): Sometimes several tests need the same starting conditions — like a sample piece of data. Rather than repeating that setup in every single test, you prepare it once in a reusable way, and each test that needs it simply asks for it.",
    "lessonSlug": "testing-debugging",
    "order": 1
  },
  {
    "title": "Debugging Strategies",
    "slug": "debugging-strategies",
    "description": "A systematic, five-step method for tracking down and fixing bugs in any language.",
    "explanation": "A systematic approach to hunting down bugs:\n1. Reproduce it — can you make the bug happen reliably, on demand?\n2. Isolate it — narrow down exactly which part of the code is responsible.\n3. Read carefully — error messages and stack traces usually point almost exactly to the problem.\n4. Add checkpoints — temporarily print or log variable values at different points to see where reality diverges from what you expected.\n5. Explain it out loud — describing the problem step by step to someone else often reveals the bug yourself.\n\nOther useful techniques:\n- Narrowing down when a bug was introduced by checking earlier versions of the code.\n- Divide and conquer: temporarily disable half the code to see if the bug disappears.\n- Stepping through code one instruction at a time using a debugging tool.",
    "lessonSlug": "testing-debugging",
    "order": 2
  }
]
```

### Problems

```json
[
  {
    "title": "FizzBuzz",
    "slug": "fizzbuzz",
    "lessonSlug": "python-basics",
    "subtopicSlug": "",
    "difficulty": "easy",
    "topics": ["Control Flow"],
    "companies": ["Amazon", "Google", "Microsoft"],
    "problemStatement": "Go through the numbers from 1 to n. For every multiple of 3, output 'Fizz.' For every multiple of 5, output 'Buzz.' For every multiple of both 3 and 5, output 'FizzBuzz.' Otherwise, output the number itself.",
    "examples": [
      {
        "input": "n = 15",
        "output": "[1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz]",
        "explanation": "The order of checking matters: check for divisibility by 15 first (both 3 and 5), then 3, then 5, otherwise output the number."
      }
    ],
    "constraints": ["1 <= n <= 10^4"],
    "approach": "Step 1: Go through each whole number from 1 up to n, one at a time.\n\nStep 2: For the current number, first check: does it divide evenly by 15 (meaning it is a multiple of both 3 and 5)? If so, output 'FizzBuzz' and move to the next number.\n\nStep 3: Otherwise, check: does it divide evenly by 3? If so, output 'Fizz' and move on.\n\nStep 4: Otherwise, check: does it divide evenly by 5? If so, output 'Buzz' and move on.\n\nStep 5: If none of the above apply, just output the number itself.\n\nThe key insight: Order matters. The most specific condition (divisible by both) must be checked first. If you check 'divisible by 3' first, a number like 15 would output 'Fizz' instead of 'FizzBuzz' because it matches the first condition and never reaches the combined check.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "views": 45000,
    "bookmarks": 1200
  },
  {
    "title": "Designing a Library Management System",
    "slug": "library-management-system",
    "lessonSlug": "oop-concepts",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["Object-Oriented Design"],
    "companies": ["Amazon", "Flipkart"],
    "problemStatement": "Design a library system involving Books, Members, and a Librarian. Support borrowing, returning, and calculating late fees.",
    "examples": [
      {
        "input": "Member borrows 'Clean Code' on Jan 1, returns on Jan 15. Max borrow period = 7 days, late fee = Rs 5/day.",
        "output": "Late fee = Rs 40",
        "explanation": "Days late = 15 - 1 - 7 = 8 days. Fee = 8 × 5 = Rs 40."
      }
    ],
    "constraints": ["Max 5 books per member", "Max borrow period = 7 days"],
    "approach": "Step 1: Understand the responsibilities of each object:\n- Book: knows its title, author, and whether it is currently borrowed.\n- Member: knows their name and which books they currently have borrowed, limited to a maximum number of books at once.\n- Librarian: manages the overall catalogue of books and handles searching and registering new members.\n\nStep 2: For borrowing a book:\n1. Check that the requested book actually exists in the catalogue and is not already borrowed.\n2. Check that the member has not already reached their maximum number of borrowed books.\n3. If both checks pass, mark the book as borrowed and add it to that member's list of currently-borrowed books.\n4. Record the date it was borrowed so a late fee can be calculated later.\n\nStep 3: For returning a book:\n1. Mark the book as available.\n2. Calculate the number of days the book was kept.\n3. If the days exceed the max borrow period, multiply the extra days by the daily late fee rate.\n4. Report the late fee (if any) and update the member's borrowed list.",
    "timeComplexity": "O(1) per operation",
    "spaceComplexity": "O(n) for books in system",
    "views": 6200,
    "bookmarks": 1100
  },
  {
    "title": "Building a Custom 'Transform Each Item' Utility",
    "slug": "custom-map-polyfill",
    "lessonSlug": "functional-programming",
    "subtopicSlug": "",
    "difficulty": "medium",
    "topics": ["Functional Programming"],
    "companies": ["Google", "Meta"],
    "problemStatement": "Implement your own version of the standard 'transform every item in a collection' utility — one that correctly applies a given transformation to every item, handles collections with gaps in them, and returns a brand-new collection without changing the original.",
    "examples": [
      {
        "input": "Original collection: [1, 2, 3]. Transformation: double each number.",
        "output": "New collection: [2, 4, 6]",
        "explanation": "Each item is transformed independently, and a new collection is returned. The original remains unchanged."
      }
    ],
    "constraints": ["Must handle gaps (empty positions) in the collection", "Must not modify the original collection"],
    "approach": "Step 1: Create a new, empty collection with the same length as the original.\n\nStep 2: Go through the original collection position by position.\n\nStep 3: Skip any position that is genuinely empty (a gap), rather than treating it as if it held a real value.\n\nStep 4: For every position that does hold a real value, apply the given transformation to it and store the result in the same position in the new collection.\n\nStep 5: Once every position has been processed, return the new collection — leaving the original completely untouched.\n\nWhy this matters: This is a fundamental building block of functional programming — transforming data without changing the original. It avoids accidental side effects that can introduce bugs.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "views": 5100,
    "bookmarks": 780
  },
  {
    "title": "Building an Event Bus",
    "slug": "observer-pattern-event-bus",
    "lessonSlug": "design-patterns",
    "subtopicSlug": "",
    "difficulty": "hard",
    "topics": ["Design Patterns"],
    "companies": ["Google", "Meta", "Microsoft"],
    "problemStatement": "Build a shared 'event bus' that supports subscribing to an event, unsubscribing, broadcasting an event to all current subscribers, and subscribing to an event just once (automatically unsubscribing after the first time it fires).",
    "examples": [
      {
        "input": "A handler subscribes to 'order.placed.' The event 'order.placed' is broadcast with order data.",
        "output": "The handler is called with the order data.",
        "explanation": "The pub-sub pattern decouples the code that produces events from the code that consumes them."
      }
    ],
    "constraints": ["Support multiple subscribers per event", "Support unsubscribing"],
    "approach": "Step 1: Keep an internal record mapping each event name to the set of handlers currently subscribed to it.\n\nStep 2 (Subscribing): Add the given handler to that event's set of subscribers.\n\nStep 3 (Unsubscribing): Remove the given handler from that event's set of subscribers, if it is there.\n\nStep 4 (Broadcasting): Look up every subscriber currently registered for that event, and call each one in turn, passing along whatever data came with the event.\n\nStep 5 (Subscribe once): Wrap the given handler in a helper that, the moment it is triggered, immediately unsubscribes itself before or after running the original handler — so it can never fire a second time.\n\nWhy this pattern is useful: It decouples the parts of a program that produce events from the parts that respond to them. A button click does not need to know what happens when it is clicked — it just broadcasts a 'clicked' event, and any number of subscribers can react independently.",
    "timeComplexity": "O(h) per broadcast where h = handler count",
    "spaceComplexity": "O(e × h) where e = events, h = average handlers per event",
    "views": 4700,
    "bookmarks": 920
  },
  {
    "title": "Measuring Test Coverage",
    "slug": "test-coverage-analyzer",
    "lessonSlug": "testing-debugging",
    "subtopicSlug": "",
    "difficulty": "hard",
    "topics": ["Testing"],
    "companies": ["JetBrains", "GitHub"],
    "problemStatement": "Build a tool that looks at a piece of source code and reports which of its functions are actually being exercised by tests, and which are not.",
    "examples": [
      {
        "input": "A module with 10 defined functions. Tests exercise 7 of them.",
        "output": "Coverage: 70%. Uncovered: func_a, func_c, func_j",
        "explanation": "Compare the list of all defined functions against the list of functions that were actually called during test execution."
      }
    ],
    "constraints": ["Handle nested functions", "Support functions defined at the module level"],
    "approach": "Step 1: Scan through the source code and make a complete list of every function that is defined in it.\n\nStep 2: While the tests run, keep a separate record of every function that actually gets called during that run.\n\nStep 3: Compare the two lists: any function that was defined but never appeared in the 'actually called' list is uncovered.\n\nStep 4: Calculate a coverage percentage: the number of functions that were called, divided by the total number of functions defined, expressed as a percentage.\n\nStep 5: Report the percentage along with the specific names of any uncovered functions, so they can be prioritised for new tests.\n\nWhy this matters: Coverage analysis tells you which parts of your codebase are never tested. Untested code is a risk — bugs can hide there without anyone noticing until they reach production.",
    "timeComplexity": "O(n) where n = lines of code",
    "spaceComplexity": "O(f) where f = number of functions",
    "views": 3400,
    "bookmarks": 560
  }
]
```

### Quizzes (Programming)

```json
[
  {
    "problemSlug": "fizzbuzz",
    "problemModel": "ProgrammingProblem",
    "questions": [
      {
        "text": "Why must the 'divisible by 15' check happen before the 'divisible by 3' check?",
        "options": [
          "It does not matter, checks can be in any order",
          "Because otherwise a number like 15 would incorrectly print just 'Fizz' instead of 'FizzBuzz'",
          "Because 15 is a prime number",
          "Because 3 always comes after 15 numerically"
        ],
        "correctIndex": 1
      },
      {
        "text": "What is the simplest way to check whether a number is a multiple of both 3 and 5?",
        "options": [
          "Check divisibility by 3 and 5 in two separate steps, then combine results",
          "Check whether the number divides evenly by 15",
          "Check whether the number is odd",
          "Check whether the number divides evenly by 8"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "library-management-system",
    "problemModel": "ProgrammingProblem",
    "questions": [
      {
        "text": "What two checks must both pass before a book can be successfully borrowed?",
        "options": [
          "The book's title length and the member's age",
          "The book must be available (not already borrowed) and the member must not have reached their maximum borrowed-book limit",
          "The librarian's schedule and the book's publisher",
          "The member's name and the book's page count"
        ],
        "correctIndex": 1
      },
      {
        "text": "Why does the system need to record the date a book was borrowed?",
        "options": [
          "To sort books alphabetically",
          "So a late fee can be calculated later if the book is returned after its due date",
          "To count total library visits",
          "To register new members"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "custom-map-polyfill",
    "problemModel": "ProgrammingProblem",
    "questions": [
      {
        "text": "What should the custom utility do when it encounters a genuinely empty position (gap) in the original collection?",
        "options": [
          "Apply the transformation to it anyway, treating it as zero",
          "Skip it, rather than treating it as if it held a real value",
          "Stop processing the rest of the collection",
          "Remove the gap and shift later items left"
        ],
        "correctIndex": 1
      },
      {
        "text": "After the utility finishes running, what should be true of the original collection?",
        "options": [
          "It should be transformed in place",
          "It should remain completely untouched, since a brand-new collection is returned instead",
          "It should be emptied out",
          "It should be sorted"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "observer-pattern-event-bus",
    "problemModel": "ProgrammingProblem",
    "questions": [
      {
        "text": "What internal record does the event bus need to keep in order to support subscribing and broadcasting?",
        "options": [
          "A single global list of all handlers ever created",
          "A mapping from each event name to the set of handlers currently subscribed to it",
          "A count of how many times each event has fired",
          "A list of all possible event names in the program"
        ],
        "correctIndex": 1
      },
      {
        "text": "How does a 'subscribe once' handler ensure it only ever fires a single time?",
        "options": [
          "It is given a special priority flag",
          "It is wrapped in a helper that immediately unsubscribes itself the moment it is triggered",
          "It is stored in a separate list that is cleared after one broadcast",
          "It checks a counter before running each time"
        ],
        "correctIndex": 1
      }
    ]
  },
  {
    "problemSlug": "test-coverage-analyzer",
    "problemModel": "ProgrammingProblem",
    "questions": [
      {
        "text": "How does the tool determine which functions are 'uncovered'?",
        "options": [
          "Functions with the longest names",
          "Functions that were defined in the source code but never appeared in the record of functions actually called during test runs",
          "Functions that raise errors",
          "Functions that are called more than once"
        ],
        "correctIndex": 1
      },
      {
        "text": "If a codebase has 20 defined functions and 15 of them were called during testing, what is the coverage percentage?",
        "options": ["20%", "33%", "75%", "100%"],
        "correctIndex": 2
      }
    ]
  }
]
```

---

## Languages

```json
[
  { "name": "Python", "slug": "python", "icon": "🐍", "active": true },
  { "name": "JavaScript", "slug": "javascript", "icon": "🟨", "active": true },
  { "name": "Java", "slug": "java", "icon": "☕", "active": true },
  { "name": "C++", "slug": "cpp", "icon": "⚡", "active": true },
  { "name": "SQL", "slug": "sql", "icon": "🗄️", "active": true }
]
```
