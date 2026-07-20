import mongoose from 'mongoose';

/*
 * Progress Schema — Tracks per-user completion of lessons, subtopics, and problems
 * One document per (user, item). Compound unique index prevents duplicates.
 * This is a separate collection — do NOT add completion fields to content models.
 */
const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, enum: ['dsa', 'dbms', 'os', 'programming'], required: true },
  targetType: { type: String, enum: ['lesson', 'subtopic', 'problem'], required: true },
  targetSlug: { type: String, required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

/* Prevent duplicate completion records */
progressSchema.index({ user: 1, subject: 1, targetType: 1, targetSlug: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
