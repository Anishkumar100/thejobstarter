/*
 * One-time script: Sync Clerk publicMetadata.role to MongoDB User.role
 * Run: node scripts/syncAdminRoles.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { createClerkClient } from '@clerk/backend';

/* Create Clerk client directly (same pattern as adminOnly.js) */
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

import User from '../models/User.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SYNC] Connected to MongoDB');

  const dbUsers = await User.find({}).lean();
  console.log('[SYNC] Found', dbUsers.length, 'users in MongoDB');

  let updated = 0;
  for (const dbUser of dbUsers) {
    if (!dbUser.clerkId) continue;
    try {
      const clerkUser = await clerk.users.getUser(dbUser.clerkId);
      const clerkRole = clerkUser.publicMetadata?.role || 'user';
      const dbRole = dbUser.role || 'user';

      if (clerkRole !== dbRole) {
        await User.findByIdAndUpdate(dbUser._id, { role: clerkRole });
        console.log('[SYNC] Updated', dbUser.username, ':', dbRole, '→', clerkRole);
        updated++;
      } else {
        console.log('[SYNC] Already synced:', dbUser.username, '→', clerkRole);
      }
    } catch (err) {
      console.error('[SYNC] Failed for', dbUser.username, ':', err.message);
    }
  }

  console.log('[SYNC] Done —', updated, 'users updated');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
