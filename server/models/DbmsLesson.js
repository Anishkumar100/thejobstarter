import mongoose from 'mongoose';

const dbmsLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: 'sql', index: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: 'Database' },
  order: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  problemCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('DbmsLesson', dbmsLessonSchema);
