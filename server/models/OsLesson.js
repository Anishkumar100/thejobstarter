import mongoose from 'mongoose';

/*
 * OsLesson — mirrors DbmsLesson for OS hierarchy
 * Each lesson groups related subtopics under an OS category (e.g., "Process Management")
 */
const osLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: 'process', index: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: 'Monitor' },
  order: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  problemCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('OsLesson', osLessonSchema);
