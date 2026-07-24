import mongoose from 'mongoose';

/*
 * Plan Schema — A reusable study template created by admins/coordinators.
 * Contains a day-offset sequence of content items (lessons, subtopics, problems)
 * across any of the 4 subjects (dsa, dbms, os, programming).
 * Plans are assigned to batches via BatchPlan with a startDate.
 */
const planItemSchema = new mongoose.Schema({
  dayOffset: { type: Number, required: true },          /* Day in the plan (1-based) */
  subject: { type: String, enum: ['dsa', 'dbms', 'os', 'programming'], required: true },
  targetType: { type: String, enum: ['lesson', 'subtopic', 'problem'], required: true },
  targetSlug: { type: String, required: true },          /* Slug of the content item */
  targetTitle: { type: String, required: true },          /* Denormalized for display */
  targetId: { type: mongoose.Schema.Types.ObjectId },     /* Direct ref for future stats */
  instruction: { type: String, default: '' },              /* Teacher's note to students */
  subtopicTitle: { type: String, default: '' },            /* Parent subtopic title for context (problems only) */
  lessonTitle: { type: String, default: '' }               /* Parent lesson title for context (subtopics & problems) */
}, { _id: false });

const planSchema = new mongoose.Schema({
  coachingCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachingCenter', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  durationDays: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [planItemSchema]
}, { timestamps: true });

console.log('[PLAN] Plan model defined');

export default mongoose.model('Plan', planSchema);
