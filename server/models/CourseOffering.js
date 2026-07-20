import mongoose from 'mongoose';

/*
 * CourseOffering Schema — A specific program/course that a CoachingCenter runs.
 * Examples: "Full-Stack Development", "Data Science", "DSA Bootcamp".
 * NOT to be confused with the four content pillars (dsa, dbms, os, programming)
 * which are called `subject` throughout the codebase. This is a separate concept.
 */
const courseOfferingSchema = new mongoose.Schema({
  coachingCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachingCenter', required: true, index: true },
  name: { type: String, required: true },            /* e.g. "Full-Stack Development" */
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

console.log('[COURSE] CourseOffering model defined');

export default mongoose.model('CourseOffering', courseOfferingSchema);
