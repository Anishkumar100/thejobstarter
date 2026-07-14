export const questions = [
  {
    _id: 'q1',
    title: 'What is the difference between process and thread?',
    slug: 'process-vs-thread',
    body: 'I\'m preparing for OS interviews and keep getting confused between processes and threads. What are the key differences? When would you use one over the other?',
    tags: ['OS', 'Process', 'Thread'],
    author: 'u2',
    votes: 24,
    views: 1500,
    answerCount: 3,
    createdAt: '2026-02-20'
  },
  {
    _id: 'q2',
    title: 'How does HashMap work internally in Java?',
    slug: 'hashmap-internal-java',
    body: 'Can someone explain how HashMap works under the hood? What happens during collisions? How does resizing work?',
    tags: ['Java', 'DSA', 'Hashing'],
    author: 'u4',
    votes: 18,
    views: 1200,
    answerCount: 2,
    createdAt: '2026-02-25'
  },
  {
    _id: 'q3',
    title: 'What is the best strategy to learn SQL for interviews?',
    slug: 'learn-sql-interviews',
    body: 'I have basic SQL knowledge but interview questions are on another level. How should I practice? Any good resources?',
    tags: ['SQL', 'DBMS', 'Interview'],
    author: 'u3',
    votes: 12,
    views: 890,
    answerCount: 4,
    createdAt: '2026-03-05'
  }
];

export const answers = [
  {
    _id: 'a1',
    questionId: 'q1',
    body: 'A process is an independent program in execution with its own memory space. A thread is a lightweight unit of execution within a process that shares memory with other threads in the same process.\n\nKey differences:\n- **Memory**: Processes have separate memory; threads share memory\n- **Overhead**: Process creation is heavy; threads are lightweight\n- **Communication**: IPC is complex; threads share memory directly\n- **Isolation**: Process crash affects only itself; thread crash kills whole process\n\nUse threads for parallel tasks that need shared data. Use processes for isolation and security.',
    author: 'u1',
    votes: 15,
    accepted: true,
    createdAt: '2026-02-21'
  },
  {
    _id: 'a2',
    questionId: 'q1',
    body: 'Think of it like this: A process is a house (has its own address space, resources). Threads are the people living in the house (shared space, can talk to each other directly). Multiple houses don\'t share anything.',
    author: 'u3',
    votes: 8,
    accepted: false,
    createdAt: '2026-02-22'
  },
  {
    _id: 'a3',
    questionId: 'q2',
    body: 'HashMap works on the principle of hashing. When you put a key-value pair:\n1. hashCode() is called on the key\n2. Hash is compressed to an index using indexFor()\n3. Entry is stored at that index in an array of buckets\n\n**Collision handling**: Java uses chaining (linked list in each bucket). From Java 8, if a bucket has >8 entries, the linked list converts to a tree for O(log n) lookup.\n\n**Resizing**: When load factor (default 0.75) is exceeded, capacity doubles and all entries are rehashed.',
    author: 'u1',
    votes: 12,
    accepted: true,
    createdAt: '2026-02-26'
  },
  {
    _id: 'a4',
    questionId: 'q3',
    body: 'Here\'s my recommended plan:\n1. Start with LeetCode SQL problems (database section)\n2. Practice joins extensively — they\'re the most common\n3. Learn window functions (RANK, ROW_NUMBER, etc.)\n4. Practice subqueries and CTEs\n5. Use platforms: LeetCode, HackerRank, Mode Analytics\n\nFocus on medium-hard SQL problems on LeetCode — those are closest to interview level.',
    author: 'u2',
    votes: 10,
    accepted: true,
    createdAt: '2026-03-06'
  }
];
