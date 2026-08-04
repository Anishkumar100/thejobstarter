import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import CoachingCenter from '../models/CoachingCenter.js';

await mongoose.connect(process.env.MONGODB_URI);

const usernames = ['runtime_coord', 'runtime_user', 'runtime_admin', 'user_aDthI3', 'user_7VlIys'];
const users = await User.find({ username: { $in: usernames } }).lean();
console.log('--- USERS ---');
for (const u of users) {
  console.log(JSON.stringify({
    username: u.username,
    displayName: u.displayName,
    email: u.email,
    clerkId: u.clerkId,
    role: u.role,
    createdAt: u.createdAt,
    _id: String(u._id)
  }));
}

console.log('--- ALL COACHING CENTERS ---');
const centers = await CoachingCenter.find().lean();
for (const c of centers) {
  console.log(JSON.stringify({
    code: c.code,
    name: c.name,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
    _id: String(c._id)
  }));
}

console.log('--- TOTAL USER COUNT ---');
console.log('total users:', await User.countDocuments());

await mongoose.disconnect();
