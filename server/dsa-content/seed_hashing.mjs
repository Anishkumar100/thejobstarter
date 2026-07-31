/*
 * Seed Hashing lesson content into MongoDB
 * Uses slug-based upserts — never deletes existing data.
 * Run: node dsa-content/seed_hashing.mjs
 * NOTE: Generated from dsa-content/next.md — do not hand-edit; regenerate via generate_seed.mjs after updating next.md.
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
    { slug: "hashing" },
    {
      title: "Hashing",
      slug: "hashing",
      category: "searching-sorting-hashing",
      description: "Learn how hash tables give you lightning-fast lookups by turning keys into memory addresses. Understand hash functions, collisions, and why a hash map turns O(n) searches into O(1) — the secret behind the classic Two Sum problem.",
      image: "",
      icon: "Hash",
      order: 2,
      difficulty: "easy",
      problemCount: 1
    },
    'Lesson "Hashing"'
  );

  /* ─── 2. Subtopics ─── */
  console.log('\n=== SUBTOPICS ===');

  const subtopics = [
    {
      slug: "hash-table-basics", lessonSlug: "hashing", order: 0,
      title: "Hash Table Basics",
      description: "Learn what hash tables are, how hash functions map keys to memory addresses, why lookups are O(1) on average, and how collisions are handled — the data structure behind dictionaries, caches, and the Two Sum problem.",
      explanation: "## What is a Hash Table?\n\nImagine a giant locker room. Instead of searching every locker to find your gym bag, each locker has a number, and there's a simple rule that tells you exactly which locker is yours the moment you see your name. Walk straight to it, open it, done.\n\nA **hash table** (also called a **hash map** or **dictionary**) is exactly that: a data structure that stores **key-value pairs** and can find any value by its key in a single step — without searching through everything else.\n\nThink of these everyday examples:\n- A phone book: you look up a **name** (key) and instantly get the **number** (value)\n- A dictionary: you look up a **word** (key) and instantly get the **definition** (value)\n- A ticket counter: your **ticket number** (key) tells you which **counter** (value) to go to\n\nBefore hash tables, finding a value meant scanning a list one item at a time — O(n). Hash tables change the game: they can find anything in **O(1) average time**.\n\n## The Magic Ingredient: The Hash Function\n\nThe secret is a **hash function**: a mathematical formula that takes a key and turns it into a number — an index in an array.\n\n```\nindex = hash_function(key)  %  array_size\n```\n\nFor example, say the hash function gives each word a number based on its letters, and our array has 10 slots:\n\n```\n\"apple\"  -> hash = 42 -> index = 42 % 10 = 2  -> store at slot 2\n\"banana\" -> hash = 67 -> index = 67 % 10 = 7  -> store at slot 7\n\"cherry\" -> hash = 12 -> index = 12 % 10 = 2  -> store at slot 2 (uh oh!)\n```\n\nA good hash function has three superpowers:\n1. **Deterministic** — the same key ALWAYS gives the same index. \"apple\" is always slot 2.\n2. **Fast** — computing the hash takes O(1) time, no matter how big the key is.\n3. **Spreads keys evenly** — different keys land in different slots as much as possible.\n\n## Storing and Finding: Step by Step\n\n**To store a key-value pair** like (\"apple\", 5):\n1. Compute `index = hash(\"apple\") % array_size`\n2. Place the pair at that index in the array\n\n**To find the value for a key** like \"apple\":\n1. Compute the SAME index: `hash(\"apple\") % array_size`\n2. Walk straight to that slot and read the value — one step, O(1)!\n\nNo scanning, no searching. The hash function does all the work of telling you where to look.\n\n## The Collision Problem (and How to Solve It)\n\nWhat happens when two different keys hash to the same slot? \"apple\" and \"cherry\" both wanted slot 2. This is called a **collision**.\n\nSince a slot can only hold one item, we need a strategy. The most common one is called **chaining**: each slot holds a small list (often a linked list or array) of all the key-value pairs that landed there.\n\n```\nSlot 2: [ (\"apple\", 5) -> (\"cherry\", 8) ]\n```\n\nNow a lookup at slot 2 has to check the items in that small list. If the hash function spreads keys well, each slot has only a handful of items, so the lookup is still effectively O(1).\n\nOther collision strategies exist (like open addressing, where a collision makes you look for the next empty slot), but the key idea is the same: collisions slow things down a little, and a good hash function keeps them rare.\n\n## Load Factor and Resizing\n\nAs you add more items, slots get fuller and collisions become more common. The **load factor** measures this:\n\n```\nload_factor = number_of_items / number_of_slots\n```\n\nWhen the load factor gets too high (typically above 0.75), the hash table **resizes**: it creates a bigger array (usually double the size) and re-hashes every item into it. This keeps the table fast no matter how many items you add.\n\n## Hash Map vs Hash Set\n\nA **hash map** (or dictionary) stores key-value pairs — you can look up the value for a key.\n\nA **hash set** (or just \"set\") stores only keys — you use it to answer \"does this item exist?\" and to remove duplicates.\n\nBoth use the exact same hashing machinery under the hood.\n\n## Time Complexity of Hash Table Operations\n\n| Operation | Average | Worst Case |\n|---|---|---|\n| Insert | O(1) | O(n) |\n| Lookup / Search | O(1) | O(n) |\n| Delete | O(1) | O(n) |\n\nThe O(n) worst case happens only when a terrible hash function (or a malicious input) sends everything to the same slot. With a good hash function and resizing, the average stays O(1).\n\nSpace complexity: **O(n)** — the hash table stores all n key-value pairs, plus some empty slots.\n\n## When to Use a Hash Table\n\n✅ You need to look things up by a **key** (name, ID, word) — not by position\n✅ You need to check **if something exists** quickly (sets)\n✅ You need to **remove duplicates**\n✅ You need to **count frequencies** of items\n✅ The problem mentions \"dictionary\", \"map\", \"lookup\", or \"appears exactly once\"\n\n❌ You need items in **sorted order** — a tree or sorted array is better\n❌ You need to find the **next/previous** item — a tree or linked list is better\n❌ You have a tiny dataset where a simple array is faster (no hashing overhead)\n\n## Key Takeaway\n\nA hash table trades a little memory (O(n) space) for incredible speed (O(1) average lookups). Its power comes from the hash function, which turns any key into a memory address instantly. Whenever a problem asks \"find\", \"check if exists\", \"count\", or \"appears twice\", think hash table first — it's the fastest tool in your box for lookups.",
      image: "", youtubeUrl: "", pdfUrl: "", pptxUrl: ""
    }
  ];

  for (const sub of subtopics) {
    await upsert(Subtopic, { slug: sub.slug }, sub, `Subtopic "${sub.title}"`);
  }

  /* ─── 3. Problems ─── */
  console.log('\n=== PROBLEMS ===');

  const problems = [
    {
      slug: "two-sum-hashmap", lessonSlug: "hashing", subtopicSlug: "hash-table-basics",
      title: "Two Sum (Hashmap)", difficulty: "easy",
      topics: ["Arrays","Hash Map"],
      companies: ["Amazon","Google","Microsoft","Facebook","Apple","Uber"],
      problemStatement: "You are given an array of integers and a target integer. Your task is to find two numbers in the array that add up to exactly the target, and return their indices (0-based) as an array of two integers.\n\nYou may assume that exactly one solution exists for each input, and you may not use the same element twice.\n\nIf no solution exists, return an empty array.\n\nFor example, given nums = [2, 7, 11, 15] and target = 9, the answer is [0, 1] because 2 + 7 = 9.\n\nNote: your solution should be as efficient as possible. Can you solve it in O(n) time using a hash map?",
      examples: [{"input":"nums = [2, 7, 11, 15], target = 9","output":"[0, 1]","explanation":"2 + 7 = 9. The two numbers are at indices 0 and 1."},{"input":"nums = [3, 2, 4], target = 6","output":"[1, 2]","explanation":"2 + 4 = 6. The two numbers are at indices 1 and 2. (3 + 3 = 6 would be wrong — you can't use the same element twice.)"},{"input":"nums = [3, 3], target = 6","output":"[0, 1]","explanation":"3 + 3 = 6, using both elements at indices 0 and 1."},{"input":"nums = [1, 2, 3], target = 10","output":"[]","explanation":"No two numbers add up to 10. Return an empty array."}],
      constraints: ["The array length is between 2 and 100,000 elements.","Each element is an integer between -10^9 and 10^9.","target is an integer between -10^9 and 10^9.","Exactly one valid solution exists (indices are distinct)."],
      approach: "## Understanding the Problem\n\nWe need two numbers that sum to a target. The brute-force way checks every pair — O(n²) — which is way too slow for 100,000 elements (5 billion pairs!). Let's find the smarter way.\n\n### Step 1 — The Brute Force Approach (Too Slow)\n\nCheck every pair of indices (i, j) and test if they add up to the target:\n\n```text\nFUNCTION two_sum_brute(nums, target):\n    FOR i FROM 0 TO length(nums) - 1:\n        FOR j FROM i + 1 TO length(nums) - 1:\n            IF nums[i] + nums[j] == target:\n                RETURN [i, j]\n    RETURN []\n```\n\nThis works but takes O(n²) — two nested loops. For each element, we scan everything after it.\n\n### Step 2 — The Key Insight: The Complement\n\nInstead of looking for pairs, flip the question around. For each number `nums[i]`, we don't need to scan for its partner — we know exactly what the partner must be:\n\n```\ncomplement = target - nums[i]\n```\n\nIf `complement` exists somewhere in the array (and it's not the same element), we've found our answer. The question becomes: \"have I seen this complement before?\" And THAT is a perfect job for a hash map.\n\n### Step 3 — The Hash Map Solution (Optimal)\n\nHere's the plan:\n\n1. Create an empty hash map that stores each number we've seen, mapped to its index\n2. Walk through the array one element at a time:\n   a. Compute `complement = target - nums[i]`\n   b. If `complement` is in the hash map → we found our pair! Return [map[complement], i]\n   c. Otherwise, add `nums[i]` with its index to the hash map, and keep going\n3. If we never find a pair, return []\n\nTrace on nums = [2, 7, 11, 15], target = 9:\n\n```\nmap = {}  (empty)\n\ni=0, num=2:  complement = 9 - 2 = 7. Is 7 in map? No. Add 2 -> {2: 0}\ni=1, num=7:  complement = 9 - 7 = 2. Is 2 in map? YES (at index 0)!\n             Return [map[2], i] = [0, 1] ✓\n```\n\nOnly 2 steps! We found the answer before even finishing the array.\n\nTrace on nums = [3, 2, 4], target = 6:\n\n```\nmap = {}\n\ni=0, num=3:  complement = 6 - 3 = 3. Is 3 in map? No. Add 3 -> {3: 0}\ni=1, num=2:  complement = 6 - 2 = 4. Is 4 in map? No. Add 2 -> {3: 0, 2: 1}\ni=2, num=4:  complement = 6 - 4 = 2. Is 2 in map? YES (at index 1)!\n             Return [map[2], i] = [1, 2] ✓\n```\n\n### Step 4 — Why the Same-Element Check Happens Naturally\n\nNotice in the first trace: when i=1 and num=7, the complement was 2 — which is a DIFFERENT element already in the map. We only add an element to the map AFTER checking it, so we can never match an element with itself. That's why [1, 1] (using nums[1] twice) is impossible.\n\n### Step 5 — Why This Is So Fast\n\nEach hash map lookup and insertion is O(1) on average. We make exactly one pass through the array, doing O(1) work per element. Total: **O(n)** time — a massive improvement over the O(n²) brute force.\n\n### Complexity Analysis\n\n- **Time Complexity: O(n)** — one pass through the array, with O(1) hash map operations per element.\n- **Space Complexity: O(n)** — the hash map stores up to n elements in the worst case.\n\n### Python Code\n\n```python\ndef two_sum(nums, target):\n    # Map each number to the index where we saw it\n    seen = {}\n\n    for i, num in enumerate(nums):\n        complement = target - num\n\n        # If we've seen the complement before, we found the pair\n        if complement in seen:\n            return [seen[complement], i]\n\n        # Remember this number and its index for future lookups\n        seen[num] = i\n\n    return []\n```\n\n### JavaScript Code\n\n```javascript\nfunction twoSum(nums, target) {\n    // Map each number to the index where we saw it\n    const seen = new Map();\n\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n\n        // If we've seen the complement before, we found the pair\n        if (seen.has(complement)) {\n            return [seen.get(complement), i];\n        }\n\n        // Remember this number and its index for future lookups\n        seen.set(nums[i], i);\n    }\n\n    return [];\n}\n```",
      codeBlocks: [{"language":"python","code":"def two_sum(nums, target):\n    # Map each number to the index where we saw it\n    seen = {}\n\n    for i, num in enumerate(nums):\n        complement = target - num\n\n        # If we've seen the complement before, we found the pair\n        if complement in seen:\n            return [seen[complement], i]\n\n        # Remember this number and its index for future lookups\n        seen[num] = i\n\n    return []"},{"language":"javascript","code":"function twoSum(nums, target) {\n    // Map each number to the index where we saw it\n    const seen = new Map();\n\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n\n        // If we've seen the complement before, we found the pair\n        if (seen.has(complement)) {\n            return [seen.get(complement), i];\n        }\n\n        // Remember this number and its index for future lookups\n        seen.set(nums[i], i);\n    }\n\n    return [];\n}"}],
      timeComplexity: "O(n)", spaceComplexity: "O(n)",
      youtubeUrl: "", pdfUrl: "", pptxUrl: "", media: []
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
      slug: "two-sum-hashmap",
      questions: [{"text":"What is the average time complexity of a hash table lookup?","options":["O(n) — it scans the whole array","O(n log n) — it sorts first","O(1) — the hash function tells you the exact slot instantly","O(log n) — it halves the search space each step"],"correctIndex":2},{"text":"What happens when two different keys hash to the same slot?","options":["The newer key overwrites the older one silently","It's called a collision, and strategies like chaining handle it","The hash table crashes","Both keys are deleted"],"correctIndex":1},{"text":"In the Two Sum hash map approach, what do we look up for each number?","options":["The number itself in the array","The next larger number","The complement (target - current number)","The index of the smallest number"],"correctIndex":2},{"text":"Why can't the hash map approach match an element with itself?","options":["Because the hash function forbids it","Because we add each element to the map only AFTER checking its complement","Because the array has no duplicates","Because the target is always even"],"correctIndex":1},{"text":"What is the time and space complexity of the hash map Two Sum solution?","options":["O(n²) time and O(1) space","O(n) time and O(n) space","O(n log n) time and O(n) space","O(1) time and O(1) space"],"correctIndex":1}]
    }
  ];

  for (const q of quizzes) {
    const problemDoc = createdProblems.find(p => p.slug === q.slug);
    if (problemDoc) {
      await upsertQuiz(problemDoc._id, 'Problem', q.questions);
    } else {
      console.error(`[SEED] Problem "${q.slug}" not found in created problems — skipping quiz`);
    }
  }

  /* ─── Done ─── */
  console.log('\n[SEED] Hashing lesson seeded successfully!');
  console.log(`  Lesson:    1 (Hashing)`);
  console.log(`  Subtopics: ${subtopics.length} (Hash Table Basics)`);
  console.log(`  Problems:  ${problems.length} (Two Sum (Hashmap))`);
  console.log(`  Quizzes:   ${quizzes.length}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
