import mongoose from 'mongoose';

/*
 * DsaLesson Schema — A topic/lesson grouping containing multiple DSA problems
 * category groups lessons into broader sections (data-structures, algorithms, techniques)
 */
const dsaLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ['data-structures', 'algorithms', 'techniques'], required: true, index: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: 'List' },
  order: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  problemCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('DsaLesson', dsaLessonSchema);
