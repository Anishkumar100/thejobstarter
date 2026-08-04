/*
 * Gating verification — confirms the role fix works:
 * 1) getSubtopics WITHOUT a lesson param must return all 10 for a role:admin user
 *    (before the fix, the admin's doc had role 'user' → 400 blocked / data: [])
 * 2) Server restart needed? No — controller changes are live via node --watch.
 * Uses a direct DB check + hits the API with the admin's real session JWT if available.
 */
import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

await mongoose.connect(process.env.MONGODB_URI);

/* 1. Verify the admin doc's role is now 'admin' */
const admin = await User.findOne({ clerkId: 'user_3GBsEaQKLZXkghIC4ISEMaDthI3' }).lean();
console.log('[GATE] Admin mongo doc:', admin ? `${admin.username} | role: ${admin.role}` : 'MISSING');

/* 2. Confirm all subtopics exist in DB (they were never missing — just hidden by gating) */
const subtopics = await AptitudeSubtopic.find().lean();
console.log('[GATE] Subtopics in DB:', subtopics.length);

/* 3. Attempt to hit the API with the admin's Clerk user to prove gating passes */
const testingToken = await clerk.testingTokens.createTestingToken({ userId: 'user_3GBsEaQKLZXkghIC4ISEMaDthI3' });
const res = await fetch('http://localhost:3001/api/aptitude/subtopics', {
  headers: { Authorization: 'Bearer ' + testingToken.token }
});
const body = await res.json();
console.log('[GATE] API /subtopics (all, admin):', res.status, '| data items:', body.data?.length, '| locked:', body.locked, '| error:', body.error || '-');

await mongoose.disconnect();
