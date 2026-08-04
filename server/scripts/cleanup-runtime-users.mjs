import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import CoachingCenter from '../models/CoachingCenter.js';

await mongoose.connect(process.env.MONGODB_URI);

const usernames = ['runtime_coord', 'runtime_user', 'runtime_admin', 'user_aDthI3', 'user_7VlIys'];

const users = await User.find({ username: { $in: usernames } }).lean();
console.log('[CLEANUP] Found users to delete:', users.map(u => `${u.username} (${u.email || 'no email'})`).join(' | '));
const deletedUsers = await User.deleteMany({ username: { $in: usernames } });
console.log('[CLEANUP] Deleted users:', deletedUsers.deletedCount);

const deletedCenter = await CoachingCenter.deleteMany({ code: 'RV-CENTER' });
console.log('[CLEANUP] Deleted RV-CENTER centers:', deletedCenter.deletedCount);

console.log('[CLEANUP] Remaining users:', await User.countDocuments());
console.log('[CLEANUP] Remaining centers:', (await CoachingCenter.find().lean()).map(c => c.code).join(', '));

await mongoose.disconnect();
