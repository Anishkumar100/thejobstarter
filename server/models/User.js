import mongoose from 'mongoose';

/*
 * User Schema — Synced from Clerk via webhook on signup
 */
const userSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, sparse: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  displayName: String,
  email: String,
  phone: String,
  avatar: String,
  bio: String,
  college: String,
  year: String,
  externalLinks: [{
    platform: String,
    url: String,
    label: String
  }],
  links: {
    leetcode: String,
    github: String,
    linkedin: String,
    website: String
  },
  skills: [String],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinDate: { type: Date, default: Date.now },
  coachingCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachingCenter', default: null },
  coachingCenterJoinedAt: { type: Date, default: null },
  coordinatorFor: { type: mongoose.Schema.Types.ObjectId, ref: 'CoachingCenter', default: null },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  courseOffering: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', default: null },
  role: { type: String, enum: ['user', 'admin', 'coordinator'], default: 'user' },

  /*
   * Faculty fields — MONGO-ONLY (Clerk never knows about faculty status).
   * A faculty member is a regular student of a center who also teaches
   * the batches listed in facultyBatches. isFaculty defaults to false for
   * every normal user, and facultyBatches is strictly additive — it does
   * NOT replace the user's own student `batch` field.
   */
  isFaculty: { type: Boolean, default: false },
  facultyBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: [] }],

  /*
   * Subscription fields for Cashfree payments (recurring OR one-time orders).
   * Default ensures every user has subscription.status set to 'free' on creation.
   *
   * planId / planName / planInterval remember which pricing plan the user
   * paid for so the UI and expiry logic can be plan-aware (e.g. lifetime
   * 'once' plans never expire because currentPeriodEnd stays null).
   */
  subscription: {
    type: {
      status: {
        type: String,
        enum: ['free', 'active', 'past_due', 'canceled', 'expired'],
        default: 'free'
      },
      cashfreeCustomerId:     { type: String, default: '' },
      cashfreeSubscriptionId: { type: String, default: '' },
      planId:                 { type: String, default: '' },
      planName:               { type: String, default: '' },
      planInterval:           { type: String, default: '' },
      currentPeriodStart:     { type: Date, default: null },
      currentPeriodEnd:       { type: Date, default: null },
      appliedPromo:           { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null },
      pendingRedirect:        { type: String, default: '' }
    },
    default: { status: 'free' }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
