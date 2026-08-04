/*
 * One-time role sync — mirrors Clerk publicMetadata.role into Mongo User docs.
 * Fixes users whose docs were auto-created by localhost login (role defaulted to 'user').
 */
import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import mongoose from 'mongoose';
import User from '../models/User.js';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

await mongoose.connect(process.env.MONGODB_URI);

const users = await User.find().lean();
console.log('[ROLESYNC] Total Mongo users:', users.length);

let updated = 0;
for (const u of users) {
  let clerkRole = null;
  try {
    const clerkUser = await clerk.users.getUser(u.clerkId);
    clerkRole = clerkUser.publicMetadata?.role || null;
  } catch {
    console.log('[ROLESYNC] No Clerk match for', u.username, '(', u.clerkId, ') — skipping');
    continue;
  }
  if (clerkRole && u.role !== clerkRole) {
    await User.updateOne({ _id: u._id }, { $set: { role: clerkRole } });
    console.log('[ROLESYNC]', u.username, ':', u.role, '->', clerkRole);
    updated++;
  }
}
console.log('[ROLESYNC] Updated docs:', updated);
await mongoose.disconnect();
