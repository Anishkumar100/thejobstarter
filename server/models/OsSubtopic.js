import mongoose from 'mongoose';

/*
 * OsSubtopic — mirrors DbmsSubtopic for OS hierarchy
 * Each subtopic belongs to an OS lesson
 */
const osSubtopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  explanation: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  pptxUrl: { type: String, default: '' },
  lessonSlug: { type: String, required: true, index: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('OsSubtopic', osSubtopicSchema);
