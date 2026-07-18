import mongoose from 'mongoose';

/*
 * QuizAttempt Schema — A student's single attempt at a quiz.
 * Single-shot (unique index on user + quiz prevents retakes).
 * Score is computed server-side on submit, never trust client-sent score.
 */
const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true },
  attemptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

quizAttemptSchema.index({ user: 1, quiz: 1 }, { unique: true });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
