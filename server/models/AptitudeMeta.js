import mongoose from 'mongoose';

/*
 * AptitudeMeta — stores categories for the Aptitude subject
 * type: 'category' | 'topic' | 'company'
 */
const aptitudeMetaSchema = new mongoose.Schema({
  type: { type: String, enum: ['category', 'topic', 'company'], required: true, index: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

aptitudeMetaSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model('AptitudeMeta', aptitudeMetaSchema);
