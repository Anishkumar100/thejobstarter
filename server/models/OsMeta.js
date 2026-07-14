import mongoose from 'mongoose';

/*
 * OsMeta — mirrors DbmsMeta for OS categories, topics, and companies
 */
const osMetaSchema = new mongoose.Schema({
  type: { type: String, enum: ['category', 'topic', 'company'], required: true, index: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

osMetaSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model('OsMeta', osMetaSchema);
