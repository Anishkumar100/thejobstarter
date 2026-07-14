export const posts = [
  {
    _id: 'b1',
    title: 'How I Cracked Amazon SDE Interview',
    slug: 'cracked-amazon-sde',
    content: '## My Journey\n\nAfter 6 months of preparation, I finally cracked Amazon SDE-1. Here\'s what worked for me.\n\n### Strategy\n1. **DSA**: Solved 200+ problems on LeetCode focusing on Arrays, Trees, DP, Graphs\n2. **System Design**: Read Alex Xu\'s book + practiced whiteboarding\n3. **Behavioral**: Prepared 15 stories using STAR method\n\n### Interview Round Breakdown\n- **OA**: 2 medium problems, 90 minutes\n- **Phone Screen**: 1 medium-hard problem\n- **On-site (4 rounds)**: 2 DSA + 1 System Design + 1 Behavioral\n\n### Tips\n- Mock interviews are crucial\n- Understand time/space complexity deeply\n- Think out loud during coding rounds',
    excerpt: 'My journey from zero to Amazon offer in 6 months of focused DSA preparation.',
    author: { name: 'Rahul Sharma', username: 'rahuldev' },
    tags: ['Interview', 'Amazon', 'SDE'],
    coverImage: 'https://picsum.photos/seed/amazon-blog/800/400',
    readTime: 8,
    publishedAt: '2026-03-01'
  },
  {
    _id: 'b2',
    title: 'Why Dynamic Programming Feels Hard (And How to Fix It)',
    slug: 'why-dp-feels-hard',
    content: '## Dynamic Programming Demystified\n\nDP is often the hardest topic for students. Here\'s a framework.\n\n### The 5 Steps\n1. Identify if it\'s a DP problem (optimal substructure? overlapping subproblems?)\n2. Define the state\n3. Find recurrence relation\n4. Decide bottom-up vs top-down\n5. Optimize space\n\n### Common Patterns\n- Fibonacci-style\n- Grid traversal\n- Knapsack family\n- Longest subsequence\n- Interval DP',
    excerpt: 'A simple 5-step framework to tackle any DP problem.',
    author: { name: 'Priya Patel', username: 'priyap' },
    tags: ['DP', 'Interview', 'Learning'],
    coverImage: 'https://picsum.photos/seed/dp-blog/800/400',
    readTime: 10,
    publishedAt: '2026-03-10'
  }
];
