import mongoose from 'mongoose';

/*
 * ProgressMessage — Admin-managed motivational message for a specific progress tier.
 * Each message is tied to a completion percentage range, a context (where it shows),
 * and optionally a subject (dsa/dbms/os/'all').
 */
const progressMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  tier: { type: Number, required: true },        /* Max percentage this applies to (0, 10, 25, 50, 75, 90, 100) */
  context: {                                      /* Where this message is shown */
    type: String,
    enum: ['per-subject', 'overall', 'celebration', 'streak'],
    required: true
  },
  subject: {                                      /* 'dsa', 'dbms', 'os', or 'all' */
    type: String,
    default: 'all'
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

progressMessageSchema.index({ tier: 1, context: 1, subject: 1 });

export default mongoose.model('ProgressMessage', progressMessageSchema);
