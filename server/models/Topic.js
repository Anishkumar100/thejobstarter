import mongoose from 'mongoose';

/*
 * Topic Schema — Homepage showcase cards (DSA, DBMS, OS)
 * Each topic is a fullscreen card with background image, text, and link
 */
const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  description: { type: String, required: true },
  category: { type: String, required: true },       /* Short badge text e.g. 'DSA' */
  cta: { type: String, default: 'EXPLORE' },
  link: { type: String, required: true },            /* Route path e.g. '/dsa' */
  image: { type: String, default: '' },              /* ImageKit URL */
  accentColor: { type: String, default: '#e11d48' }, /* CSS color for accents */
  order: { type: Number, default: 0 }                /* Display order */
}, { timestamps: true });

export default mongoose.model('Topic', topicSchema);
