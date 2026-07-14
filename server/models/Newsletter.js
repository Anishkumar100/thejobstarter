import mongoose from 'mongoose';

/*
 * Newsletter Schema — Stores email subscribers
 */
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Newsletter', newsletterSchema);
