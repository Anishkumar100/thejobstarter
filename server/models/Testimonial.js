import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
