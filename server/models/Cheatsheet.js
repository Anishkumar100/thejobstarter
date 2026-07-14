import mongoose from 'mongoose';

/*
 * Cheatsheet Schema — Downloadable PDF cheatsheets
 */
const cheatsheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ['dsa', 'dbms', 'os'], required: true },
  description: String,
  pdfUrl: { type: String, required: true },
  thumbnail: String,
  tags: [String],
  downloads: { type: Number, default: 0 },
  premium: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Cheatsheet', cheatsheetSchema);
