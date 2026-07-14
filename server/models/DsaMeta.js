import mongoose from 'mongoose';

/*
 * DsaMeta — stores DSA categories, topics, and companies for dynamic CRUD
 * type: 'category' | 'topic' | 'company'
 * value: machine-readable key (slug or lowercase)
 * label: human-readable display name
 * order: sort order
 */
const dsaMetaSchema = new mongoose.Schema({
  type: { type: String, enum: ['category', 'topic', 'company'], required: true, index: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

dsaMetaSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model('DsaMeta', dsaMetaSchema);