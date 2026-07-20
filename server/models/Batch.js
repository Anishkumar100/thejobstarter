import mongoose from 'mongoose';

/*
 * Batch Schema — A named sub-group inside a CoachingCenter.
 * Students join via batch code (nanoid(8)) or coordinator assignment.
 * Batches enable batch-scoped plans, needs-attention, and roster filtering.
 */
const batchSchema = new mongoose.Schema({
  coachingCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachingCenter', required: true, index: true },
  name: { type: String, required: true },            // e.g. "Jan 2027 Weekend Batch"
  code: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  courseOffering: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', default: null },
  expectedStudents: { type: Number, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

console.log('[BATCH] Batch model defined');

export default mongoose.model('Batch', batchSchema);
