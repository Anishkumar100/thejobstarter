import mongoose from 'mongoose';

/*
 * AptitudeProblem — same shape as ProgrammingProblem minus code-centric fields
 * (no codeBlocks/examples/constraints/approach/timeComplexity/spaceComplexity/pptxUrl).
 * companies[] is required so problems can show which company asked the question.
 */
const aptitudeProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  lessonSlug: { type: String, required: true, index: true },
  subtopicSlug: { type: String, default: '', index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
  topics: [{ type: String, index: true }],
  companies: [{ type: String, index: true }],
  problemStatement: { type: String, required: true },
  solution: { type: String, default: '' },
  media: [{
    type: { type: String, enum: ['image', 'youtube'] },
    url: String,
    caption: String,
    position: Number
  }],
  youtubeUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  pptxUrl: { type: String, default: '' },
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('AptitudeProblem', aptitudeProblemSchema);
