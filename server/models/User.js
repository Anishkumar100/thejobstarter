import mongoose from 'mongoose';

/*
 * User Schema — Synced from Clerk via webhook on signup
 */
const userSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, sparse: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  displayName: String,
  email: String,
  avatar: String,
  bio: String,
  college: String,
  year: String,
  externalLinks: [{
    platform: String,
    url: String,
    label: String
  }],
  links: {
    leetcode: String,
    github: String,
    linkedin: String,
    website: String
  },
  skills: [String],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
