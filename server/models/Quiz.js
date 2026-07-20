import mongoose from 'mongoose';

/*
 * Quiz Schema — An optional MCQ attached to a specific problem.
 * One Quiz per problem. Admin creates/updates/deletes.
 * Questions store the correctIndex — NEVER sent to students.
 */
const quizSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'problemModel' },
  problemModel: { type: String, required: true, enum: ['Problem', 'DbmsProblem', 'OsProblem', 'ProgrammingProblem'] },
  questions: [{
    text: { type: String, required: true },
    options: { type: [String], required: true, validate: v => v.length >= 2 && v.length <= 6 },
    correctIndex: { type: Number, required: true }
  }]
}, { timestamps: true });

quizSchema.index({ problemId: 1, problemModel: 1 }, { unique: true });

export default mongoose.model('Quiz', quizSchema);
