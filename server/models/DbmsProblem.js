import mongoose from 'mongoose';

const dbmsProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  lessonSlug: { type: String, required: true, index: true },
  subtopicSlug: { type: String, default: '', index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
  topics: [{ type: String, index: true }],
  companies: [{ type: String, index: true }],
  problemStatement: { type: String, required: true },
  examples: [{ input: String, output: String, explanation: String }],
  constraints: [String],
  approach: String,
  codeBlocks: [{ language: String, code: String }],
  media: [{
    type: { type: String, enum: ['image', 'youtube'] },
    url: String,
    caption: String,
    position: Number
  }],
  timeComplexity: String,
  spaceComplexity: String,
  youtubeUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  pptxUrl: { type: String, default: '' },
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('DbmsProblem', dbmsProblemSchema);
