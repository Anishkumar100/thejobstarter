import mongoose from 'mongoose';

/*
 * ProgrammingMeta — stores categories for the Programming subject
 * type: 'category' | 'topic' | 'company'
 */
const programmingMetaSchema = new mongoose.Schema({
  type: { type: String, enum: ['category', 'topic', 'company'], required: true, index: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

programmingMetaSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model('ProgrammingMeta', programmingMetaSchema);
