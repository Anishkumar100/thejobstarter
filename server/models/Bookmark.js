import mongoose from 'mongoose';

/*
 * Bookmark Schema — Users can bookmark problems and articles
 */
const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['problem', 'article'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
  targetModel: { type: String, required: true }
}, { timestamps: true });

bookmarkSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
