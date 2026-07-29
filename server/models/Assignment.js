/*
 * Assignment Schema — Coordinators create assignments for their batches.
 * Students submit a Google Drive link as their response.
 * Each assignment belongs to a specific batch within a coaching center.
 */
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  /* Title of the assignment */
  title: { type: String, required: true },
  /* Detailed instructions (big text area) */
  instructions: { type: String, default: '' },
  /* Coordinator's link to the assignment material (PPT/Doc/PDF on Drive) */
  attachmentLink: { type: String, default: '' },
  /* The batch this assignment is for (optional — can be set later via edit) */
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null, index: true },
  /* The coaching center (derived from batch ownership) */
  coachingCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachingCenter', required: true, index: true },
  /* Who created this assignment */
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  /* When students can start submitting */
  startDate: { type: Date, required: true },
  /* Deadline for submissions */
  endDate: { type: Date, required: true },
  /* Status: draft = hidden from students, active = visible, completed = past endDate */
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' }
}, { timestamps: true });

assignmentSchema.index({ coachingCenter: 1, batch: 1, createdAt: -1 });
assignmentSchema.index({ batch: 1, status: 1, endDate: -1 });

export default mongoose.model('Assignment', assignmentSchema);
