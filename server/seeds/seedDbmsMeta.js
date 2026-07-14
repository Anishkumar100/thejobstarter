import 'dotenv/config';
import mongoose from 'mongoose';

import DbmsMeta from '../models/DbmsMeta.js';

/*
 * seedDbmsMeta — Standalone script to seed only DBMS categories, topics, and companies.
 * Run with: node seeds/seedDbmsMeta.js
 * Does NOT touch any other data in the database.
 */
async function seedDbmsMeta() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
  console.log('[SEED-DBMS-META] Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('[SEED-DBMS-META] Connected.');

  console.log('[SEED-DBMS-META] Removing existing DbmsMeta entries...');
  await DbmsMeta.deleteMany({});

  const defaults = [
    /* Categories — DBMS lesson groupings */
    { type: 'category', value: 'sql', label: 'SQL', order: 1 },
    { type: 'category', value: 'design', label: 'Database Design', order: 2 },
    { type: 'category', value: 'theory', label: 'Theory & Concepts', order: 3 },
    /* Topics — DBMS subject areas */
    { type: 'topic', value: 'sql-queries', label: 'SQL Queries', order: 1 },
    { type: 'topic', value: 'joins', label: 'Joins', order: 2 },
    { type: 'topic', value: 'indexing', label: 'Indexing', order: 3 },
    { type: 'topic', value: 'normalization', label: 'Normalization', order: 4 },
    { type: 'topic', value: 'transactions', label: 'Transactions', order: 5 },
    { type: 'topic', value: 'acid', label: 'ACID Properties', order: 6 },
    { type: 'topic', value: 'concurrency', label: 'Concurrency Control', order: 7 },
    { type: 'topic', value: 'er-diagrams', label: 'ER Diagrams', order: 8 },
    { type: 'topic', value: 'relational-model', label: 'Relational Model', order: 9 },
    { type: 'topic', value: 'nosql', label: 'NoSQL', order: 10 },
    { type: 'topic', value: 'query-optimization', label: 'Query Optimization', order: 11 },
    { type: 'topic', value: 'triggers', label: 'Triggers & Stored Procedures', order: 12 },
    /* Companies */
    { type: 'company', value: 'amazon', label: 'Amazon', order: 1 },
    { type: 'company', value: 'google', label: 'Google', order: 2 },
    { type: 'company', value: 'microsoft', label: 'Microsoft', order: 3 },
    { type: 'company', value: 'oracle', label: 'Oracle', order: 4 },
    { type: 'company', value: 'ibm', label: 'IBM', order: 5 },
    { type: 'company', value: 'uber', label: 'Uber', order: 6 },
    { type: 'company', value: 'flipkart', label: 'Flipkart', order: 7 },
    { type: 'company', value: 'atlassian', label: 'Atlassian', order: 8 },
  ];

  await DbmsMeta.insertMany(defaults);
  console.log(`[SEED-DBMS-META] Seeded ${defaults.length} entries.`);
  console.log(`  Categories: ${defaults.filter(d => d.type === 'category').length}`);
  console.log(`  Topics: ${defaults.filter(d => d.type === 'topic').length}`);
  console.log(`  Companies: ${defaults.filter(d => d.type === 'company').length}`);

  await mongoose.disconnect();
  console.log('[SEED-DBMS-META] Done.');
}

seedDbmsMeta().catch(err => {
  console.error('[SEED-DBMS-META] Error:', err.message);
  process.exit(1);
});
