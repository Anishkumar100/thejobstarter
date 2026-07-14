import mongoose from 'mongoose';

/*
 * Subtopic Schema — A topic within a DSA lesson (e.g., "Two Pointer" under "Arrays")
 * Each subtopic has explanation text, optional YT video, PDF, and PPTX
 */
const subtopicSchema = new mongoose.Schema({
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

export default mongoose.model('Subtopic', subtopicSchema);
