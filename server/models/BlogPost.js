import mongoose from 'mongoose';

/*
 * BlogPost Schema — Blog posts for placement tips, interview experiences
 */
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: String,
  content: { type: String, required: true },
  coverImage: String,
  author: {
    name: String,
    avatar: String
  },
  tags: [String],
  readTime: Number,
  views: { type: Number, default: 0 },
  /* Attached document (PDF, notes, etc.) uploaded by admin */
  document: {
    url: { type: String, default: '' },
    title: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('BlogPost', blogPostSchema);
