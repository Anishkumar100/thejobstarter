import mongoose from 'mongoose';

/*
 * Question Schema — Q&A forum questions with voting
 */
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [String],
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    avatar: String
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Answer'
  }],
  votes: { type: Number, default: 0 },
  voters: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, vote: { type: Number, enum: [-1, 1] } }],
  views: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
