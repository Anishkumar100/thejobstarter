export const articles = [
  {
    _id: 'os1',
    title: 'Process States and Lifecycle',
    slug: 'process-states-lifecycle',
    category: 'os',
    topics: ['Process Management'],
    difficulty: 'beginner',
    content: '## Process Lifecycle\n\nA process goes through various states during its execution.\n\n### States\n- **New**: Process is created\n- **Ready**: Loaded in memory, waiting for CPU\n- **Running**: CPU is executing the process\n- **Waiting**: Process waiting for I/O or event\n- **Terminated**: Process finished execution\n\n### Key Takeaways\n- Only one process can be RUNNING per CPU core\n- Context switching moves processes between states\n- PCB (Process Control Block) stores process info',
    codeBlocks: [
      { language: 'python', code: '# Creating a process (Unix-like systems)\nimport os\n\npid = os.fork()\nif pid == 0:\n    print("Child process")\nelse:\n    print("Parent process")' }
    ],
    media: [],
    readTime: 10,
    tags: ['Process', 'Lifecycle', 'Beginner'],
    views: 6200,
    createdAt: '2026-01-20'
  },
  {
    _id: 'os2',
    title: 'CPU Scheduling Algorithms: FCFS, SJF, RR',
    slug: 'cpu-scheduling-algorithms',
    category: 'os',
    topics: ['CPU Scheduling'],
    difficulty: 'intermediate',
    content: '## CPU Scheduling\n\nScheduling algorithms decide which process runs next.\n\n### FCFS (First Come First Served)\nNon-preemptive. Processes run in arrival order.\n- Simple but causes Convoy effect.\n\n### SJF (Shortest Job First)\nNon-preemptive. Process with shortest burst time runs first.\n- Minimizes average waiting time.\n\n### Round Robin (RR)\nPreemptive. Each process gets a fixed time quantum.\n- Fair for all processes.\n\n### Key Formulas\n- Turnaround Time = Completion - Arrival\n- Waiting Time = Turnaround - Burst\n- Response Time = First Response - Arrival',
    codeBlocks: [
      { language: 'python', code: 'def fcfs(processes):\n    # processes: [(id, arrival, burst), ...]\n    processes.sort(key=lambda p: p[1])\n    time = 0\n    for pid, arr, burst in processes:\n        if time < arr:\n            time = arr\n        print(f"Process {pid}: runs at {time}")\n        time += burst\n        print(f"Process {pid}: completes at {time}")' }
    ],
    media: [],
    readTime: 14,
    tags: ['Scheduling', 'FCFS', 'SJF', 'RR'],
    views: 5100,
    createdAt: '2026-02-05'
  },
  {
    _id: 'os3',
    title: 'Deadlocks: Detection, Prevention and Avoidance',
    slug: 'deadlocks-detection-prevention',
    category: 'os',
    topics: ['Deadlocks'],
    difficulty: 'advanced',
    content: '## Deadlocks\n\nA deadlock is a situation where processes block each other indefinitely.\n\n### Necessary Conditions\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n\n### Prevention\nBreak any one of the four conditions.\n\n### Avoidance (Banker\'s Algorithm)\nCheck if granting a request leads to a safe state.\n\n### Detection\nUse wait-for graphs. If cycle exists → deadlock.',
    codeBlocks: [],
    media: [],
    readTime: 12,
    tags: ['Deadlocks', 'Banker\'s Algorithm', 'Advanced'],
    views: 3400,
    createdAt: '2026-02-20'
  }
];
