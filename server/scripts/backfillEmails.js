/*
 * Backfill missing emails for existing User documents.
 * Connects to MongoDB, finds users without an email,
 * fetches their Clerk user data, and updates the email field.
 *
 * Usage: cd server && node scripts/backfillEmails.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';

dotenv.config();

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

async function backfillEmails() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[BACKFILL] Connected to MongoDB');

  /* Find users where email is missing, empty, or null */
  const users = await mongoose.connection.db.collection('users').find({
    $or: [
      { email: { $exists: false } },
      { email: '' },
      { email: null }
    ]
  }).toArray();

  console.log(`[BACKFILL] Found ${users.length} users without email`);

  let updated = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.clerkId) {
      console.log(`[BACKFILL] Skipping user ${user._id} — no clerkId`);
      continue;
    }

    try {
      const clerkUser = await clerk.users.getUser(user.clerkId);
      const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || '';

      if (email) {
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          { $set: { email } }
        );
        console.log(`[BACKFILL] Updated ${user.username || user._id}: ${email}`);
        updated++;
      } else {
        console.log(`[BACKFILL] No email found for ${user.username || user._id} (clerkId: ${user.clerkId})`);
        failed++;
      }
    } catch (err) {
      console.error(`[BACKFILL] Failed for ${user.username || user._id}: ${err.message}`);
      failed++;
    }

    /* Small delay to avoid rate limiting */
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[BACKFILL] Done. Updated: ${updated}, Failed: ${failed}`);
  await mongoose.disconnect();
}

backfillEmails().catch(err => {
  console.error('[BACKFILL] Fatal error:', err);
  process.exit(1);
});
