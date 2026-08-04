import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import mongoose from 'mongoose';
import User from '../models/User.js';

const c = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

await mongoose.connect(process.env.MONGODB_URI);

const clerkUsers = await c.users.getUserList({ limit: 100 });
console.log('--- CLERK USERS WITH admin/coordinator ROLE ---');
for (const u of clerkUsers.data) {
  const role = u.publicMetadata?.role;
  if (role === 'admin' || role === 'coordinator') {
    console.log('-', u.emailAddresses[0]?.emailAddress, '| id:', u.id, '| role:', role);
  }
}

console.log('--- MONGO User docs with admin/coordinator role ---');
const mongoAdmins = await User.find({ $or: [{ role: 'admin' }, { role: 'coordinator' }] }).lean();
if (mongoAdmins.length === 0) console.log('NONE');
for (const u of mongoAdmins) console.log('-', u.username, ':', u.role);

console.log('--- akcoder1102004@gmail.com in Clerk ---');
const ak = clerkUsers.data.find(u => u.emailAddresses.some(e => e.emailAddress === 'akcoder1102004@gmail.com'));
console.log('clerk id:', ak?.id, '| metadata role:', JSON.stringify(ak?.publicMetadata?.role));
const akDoc = await User.findOne({ clerkId: ak?.id }).lean();
console.log('mongo doc:', akDoc ? akDoc.username + ' | role: ' + akDoc.role : 'MISSING (deleted)');

console.log('--- all clerk emails with mongo docs ---');
const all = await User.find().lean();
for (const u of all) {
  const clerkUser = clerkUsers.data.find(cu => cu.id === u.clerkId);
  console.log('-', u.username, '| mongo role:', u.role, '| clerk role:', JSON.stringify(clerkUser?.publicMetadata?.role), '| email:', clerkUser?.emailAddresses[0]?.emailAddress);
}

await mongoose.disconnect();
