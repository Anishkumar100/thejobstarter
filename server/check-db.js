import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';

async function run() {
  // Check test db
  const conn1 = await mongoose.createConnection(uri).asPromise();
  const db1 = conn1.db;
  console.log('Default DB:', db1.databaseName);
  const cats1 = await db1.collection('osmeta').find({ type: 'category' }).toArray();
  console.log('  categories:', cats1.length > 0 ? cats1.map(c => c.value).join(', ') : 'NONE');

  // Check admin db
  const conn2 = await mongoose.createConnection(uri.replace(/\?/, '/admin?')).asPromise();
  const db2 = conn2.db;
  console.log('Admin DB:', db2.databaseName);
  const cats2 = await db2.collection('osmeta').find({ type: 'category' }).toArray();
  console.log('  categories:', cats2.length > 0 ? cats2.map(c => c.value).join(', ') : 'NONE');

  // Check thewebytes_dsa db
  const conn3 = await mongoose.createConnection(uri.replace(/\?/, '/thewebytes_dsa?')).asPromise();
  const db3 = conn3.db;
  console.log('thewebytes_dsa DB:', db3.databaseName);
  const cats3 = await db3.collection('osmeta').find({ type: 'category' }).toArray();
  console.log('  categories:', cats3.length > 0 ? cats3.map(c => c.value).join(', ') : 'NONE');

  // Find which DB has the OLD doc
  for (const [label, db] of [['test', db1], ['admin', db2], ['thewebytes_dsa', db3]]) {
    const doc = await db.collection('osmeta').findOne({ _id: new mongoose.Types.ObjectId('6a5448467eaa95f269f5c5d2') });
    if (doc) console.log(`FOUND old doc in ${label}:`, doc.value);
  }

  await Promise.all([conn1.close(), conn2.close(), conn3.close()]);
}
run().catch(e => { console.error(e.message); process.exit(1); });
