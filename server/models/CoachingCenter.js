import mongoose from 'mongoose';

/*
 * CoachingCenter Schema — B2B training centres / coaching institutes
 * Each centre gets a unique join code (nanoid) for student self-linking
 */
const coachingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, default: '' },                 /* ImageKit URL */
  address: { type: String, default: '' },
  expectedStudents: { type: Number, default: null },
  code: { type: String, required: true, unique: true, index: true },  /* nanoid(6) */
  status: { type: String, enum: ['active', 'trial', 'suspended'], default: 'trial' },
  contactName: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  codeRegeneratedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('CoachingCenter', coachingCenterSchema);
