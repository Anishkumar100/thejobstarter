/*
 * AssignmentSubmission Schema — Students submit a Google Drive link
 * as their response to an assignment. Coordinators can view, approve,
 * reject, and leave feedback on submissions.
 */
import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  /* Which assignment this is for */
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  /* The student who submitted */
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  /* Google Drive link to the student's work */
  driveLink: { type: String, required: true },
  /* When the student submitted */
  submittedAt: { type: Date, default: Date.now },
  /* Status of this submission */
  status: { type: String, enum: ['submitted', 'approved', 'rejected'], default: 'submitted' },
  /* Coordinator's feedback on this submission */
  feedback: { type: String, default: '' }
}, { timestamps: true });

/* One submission per student per assignment */
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model('AssignmentSubmission', submissionSchema);
