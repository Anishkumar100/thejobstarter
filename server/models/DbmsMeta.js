import mongoose from 'mongoose';

/*
 * DbmsMeta — stores DBMS categories, topics, and companies for dynamic CRUD
 * Mirrors DsaMeta but scoped to DBMS content
 * type: 'category' | 'topic' | 'company'
 * value: machine-readable key (slug or lowercase)
 * label: human-readable display name
 * order: sort order
 */
const dbmsMetaSchema = new mongoose.Schema({
  type: { type: String, enum: ['category', 'topic', 'company'], required: true, index: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

dbmsMetaSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model('DbmsMeta', dbmsMetaSchema);
