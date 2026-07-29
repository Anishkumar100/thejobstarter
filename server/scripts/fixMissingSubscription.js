/*
 * Fix users missing the subscription field after schema update.
 * The User model now always defaults subscription.status to 'free',
 * but existing users created before the schema fix may be missing it.
 *
 * Usage: cd server && node scripts/fixMissingSubscription.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixMissingSubscription() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[MIGRATION] Connected to MongoDB');

  const result = await mongoose.connection.db.collection('users').updateMany(
    { subscription: { $exists: false } },
    { $set: { subscription: { status: 'free' } } }
  );

  console.log(`[MIGRATION] Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  console.log('[MIGRATION] Done — all users now have subscription.status');
  await mongoose.disconnect();
}

fixMissingSubscription().catch(err => {
  console.error('[MIGRATION] Fatal error:', err);
  process.exit(1);
});
