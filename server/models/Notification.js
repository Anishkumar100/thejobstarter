/*
 * Notification Schema — System notifications for user interactions
 * Types:
 *   'answer' — someone answered your question
 *   'question_approved' — your question was approved by admin
 *   'question_rejected' — your question was rejected by admin
 *   'profile_incomplete' — user's profile is missing required fields
 *   'needs_attention' — student flagged by needs-attention checks (Phase 13)
 */
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  /* The user who will receive this notification */
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  /* The user who triggered this notification (optional for system actions) */
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  /* Type of notification */
  type: { type: String, enum: ['answer', 'question_approved', 'question_rejected', 'answer_approved', 'answer_rejected', 'profile_incomplete', 'needs_attention'], required: true },
  /* Link to the relevant question (not used for profile_incomplete / needs_attention) */
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  /* Question title for display without needing to populate */
  questionTitle: { type: String, default: '' },
  /* Link to the answer (for answer/answer_approved/answer_rejected notifications) */
  answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
  /* Reason text for needs_attention notifications (e.g. 'Inactive 12 days', 'Quiz avg 38%') */
  attentionReasons: { type: [String], default: [] },
  /* Read status */
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
