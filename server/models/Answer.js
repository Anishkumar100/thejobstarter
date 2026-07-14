import mongoose from 'mongoose';

/*
 * Answer Schema — Answers to Q&A questions with voting and accepted status
 */
const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  body: { type: String, required: true },
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    avatar: String
  },
  votes: { type: Number, default: 0 },
  voters: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, vote: { type: Number, enum: [-1, 1] } }],
  accepted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true }
}, { timestamps: true });

export default mongoose.model('Answer', answerSchema);
