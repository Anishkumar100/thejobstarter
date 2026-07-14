export const articles = [
  {
    _id: 'db1',
    title: 'SQL Joins Explained with Examples',
    slug: 'sql-joins-explained',
    category: 'dbms',
    topics: ['SQL', 'Joins'],
    difficulty: 'beginner',
    content: '## SQL Joins\n\nJoins are used to combine rows from two or more tables based on a related column.\n\n### INNER JOIN\nReturns records with matching values in both tables.\n\n```sql\nSELECT * FROM users\nINNER JOIN orders ON users.id = orders.user_id;\n```\n\n### LEFT JOIN\nReturns all records from the left table and matched from the right.\n\n```sql\nSELECT * FROM users\nLEFT JOIN orders ON users.id = orders.user_id;\n```\n\n### Key Takeaways\n- INNER JOIN = intersection\n- LEFT JOIN = all left + matches from right\n- RIGHT JOIN = all right + matches from left\n- FULL OUTER JOIN = everything',
    codeBlocks: [
      { language: 'sql', code: 'SELECT users.name, orders.total\nFROM users\nINNER JOIN orders ON users.id = orders.user_id\nWHERE orders.total > 100;' }
    ],
    media: [],
    readTime: 12,
    tags: ['SQL', 'Joins', 'Interview'],
    views: 5600,
    createdAt: '2026-02-10'
  },
  {
    _id: 'db2',
    title: 'ACID Properties in DBMS',
    slug: 'acid-properties-dbms',
    category: 'dbms',
    topics: ['ACID', 'Transactions'],
    difficulty: 'intermediate',
    content: '## ACID Properties\n\nACID stands for Atomicity, Consistency, Isolation, Durability — the four key properties of database transactions.\n\n### Atomicity\nA transaction is treated as a single unit. Either all operations complete, or none do.\n\n### Consistency\nA transaction brings the database from one valid state to another.\n\n### Isolation\nConcurrent transactions don\'t interfere with each other.\n\n### Durability\nOnce committed, changes persist even after system failure.',
    codeBlocks: [],
    media: [],
    readTime: 8,
    tags: ['ACID', 'Transactions', 'Core Concept'],
    views: 4300,
    createdAt: '2026-02-15'
  },
  {
    _id: 'db3',
    title: 'Normalization: 1NF to BCNF with Examples',
    slug: 'normalization-1nf-to-bcnf',
    category: 'dbms',
    topics: ['Normalization'],
    difficulty: 'intermediate',
    content: '## Normalization\n\nNormalization organizes data to reduce redundancy.\n\n### 1NF (First Normal Form)\nEach cell contains a single value.\n\n### 2NF (Second Normal Form)\nIn 1NF + no partial dependency.\n\n### 3NF (Third Normal Form)\nIn 2NF + no transitive dependency.\n\n### BCNF\nEvery determinant is a candidate key.',
    codeBlocks: [
      { language: 'sql', code: '-- BEFORE (redundant)\nCREATE TABLE Orders (\n    OrderID INT,\n    CustomerName VARCHAR,\n    Item VARCHAR\n);\n\n-- AFTER (normalized)\nCREATE TABLE Customers (\n    CustomerID INT PRIMARY KEY,\n    CustomerName VARCHAR\n);\nCREATE TABLE Orders (\n    OrderID INT PRIMARY KEY,\n    CustomerID INT REFERENCES Customers(CustomerID),\n    Item VARCHAR\n);' }
    ],
    media: [],
    readTime: 15,
    tags: ['Normalization', 'Core Concept', 'Interview'],
    views: 3800,
    createdAt: '2026-03-01'
  }
];
