import mongoose from 'mongoose';

/*
 * Language Schema — Programming languages available for code blocks
 */
const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  icon: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Language', languageSchema);
