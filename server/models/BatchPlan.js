import mongoose from 'mongoose';

/*
 * BatchPlan Schema — Links a Plan template to a Batch with a real start date.
 * Only one active BatchPlan per batch is allowed at a time.
 * Assigning a new plan to a batch sets any existing active one to 'completed'.
 * The day-offset calendar mapping (Day 1 = startDate, Day N = startDate + N-1)
 * is computed at runtime — not stored here.
 */
const batchPlanSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active', index: true }
}, { timestamps: true });

/* Index for the "only one active per batch" query */
batchPlanSchema.index({ batch: 1, status: 1 });

console.log('[BATCHPLAN] BatchPlan model defined');

export default mongoose.model('BatchPlan', batchPlanSchema);
