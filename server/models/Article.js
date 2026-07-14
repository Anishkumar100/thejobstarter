import mongoose from 'mongoose';

/*
 * Article Schema — Used for both DBMS and OS articles, differentiated by category field
 */
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ['dbms', 'os'], required: true, index: true },
  topics: [{ type: String, index: true }],
  content: { type: String, required: true },
  media: [{
    type: { type: String, enum: ['image', 'youtube'] },
    url: String,
    caption: String,
    position: Number
  }],
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Article', articleSchema);
