/*
 * Seed Progress Messages — standalone: run via `node server/seeds/seedProgressMessages.js`
 * Seeds professional motivational messages for all progress tiers and contexts.
 * Safe to re-run (drops existing messages first).
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import ProgressMessage from '../models/ProgressMessage.js';

/* Load .env so MONGODB_URI matches what the server uses */
config();

const messages = [
  /* ── per-subject (shown inside subject cards) ── */
  { message: "Every expert was once a beginner. Take the first step — your future self will thank you.", tier: 0, context: 'per-subject', subject: 'all' },
  { message: "A strong start. Momentum is building — stay consistent and the results will follow.", tier: 10, context: 'per-subject', subject: 'all' },
  { message: "A quarter of the way there. Small daily wins compound into remarkable progress.", tier: 25, context: 'per-subject', subject: 'all' },
  { message: "Halfway done. You've proven you have the discipline to see this through.", tier: 50, context: 'per-subject', subject: 'all' },
  { message: "Three quarters complete. This level of dedication sets you apart from the crowd.", tier: 75, context: 'per-subject', subject: 'all' },
  { message: "The final stretch. Push through — the finish line is closer than it appears.", tier: 90, context: 'per-subject', subject: 'all' },
  { message: "Mastered. Every topic you've completed here is a skill that will serve you for life.", tier: 100, context: 'per-subject', subject: 'all' },

  /* ── overall (shown in the global banner above progress cards) ── */
  { message: "Your learning journey starts now. Every step forward, no matter how small, builds toward mastery.", tier: 0, context: 'overall', subject: 'all' },
  { message: "You're off to a solid start. Consistency in these early stages builds the foundation for advanced learning.", tier: 10, context: 'overall', subject: 'all' },
  { message: "Steady progress. The habit of daily learning is one of the most valuable skills you can develop.", tier: 30, context: 'overall', subject: 'all' },
  { message: "Exceptional progress. You're building knowledge that will set you apart in every interview.", tier: 50, context: 'overall', subject: 'all' },
  { message: "Remarkable dedication. You're well on your way to mastering the core computer science fundamentals.", tier: 75, context: 'overall', subject: 'all' },
  { message: "Nearly there. The final few steps separate the good from the great — keep pushing.", tier: 99, context: 'overall', subject: 'all' },
  { message: "Complete mastery. You've built a comprehensive understanding across all three subjects. Outstanding work.", tier: 100, context: 'overall', subject: 'all' },

  /* ── celebration (shown when marking an item complete) ── */
  { message: "Excellent work. Each completed topic brings you closer to your goals.", tier: 100, context: 'celebration', subject: 'all' },
  { message: "Progress recorded. Consistency like this is what builds true expertise.", tier: 100, context: 'celebration', subject: 'all' },
  { message: "Well done. Every item you complete strengthens your understanding and confidence.", tier: 100, context: 'celebration', subject: 'all' },
  { message: "Another topic mastered. This is how careers are built — one concept at a time.", tier: 100, context: 'celebration', subject: 'all' },
  { message: "Great progress. The effort you're putting in today will pay off in every interview tomorrow.", tier: 100, context: 'celebration', subject: 'all' },
  { message: "Completed. Each step forward builds momentum that carries you toward your goals.", tier: 100, context: 'celebration', subject: 'all' },

  /* ── streak (daily motivation) ── */
  { message: "Nothing marked today. Even a single topic tomorrow will keep your momentum alive.", tier: 0, context: 'streak', subject: 'all' },
  { message: "One item completed today. Consistency is the foundation of mastery — stay the course.", tier: 1, context: 'streak', subject: 'all' },
  { message: "Multiple items completed today. Strong discipline and focus — keep this momentum going.", tier: 3, context: 'streak', subject: 'all' },
  { message: "Outstanding effort today. This level of dedication is what separates top performers.", tier: 5, context: 'streak', subject: 'all' }
];

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
  console.log('[SEED-MSG] Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('[SEED-MSG] Connected');

  console.log('[SEED-MSG] Clearing existing progress messages...');
  await ProgressMessage.deleteMany({});

  console.log('[SEED-MSG] Inserting progress messages...');
  await ProgressMessage.insertMany(messages);

  console.log(`[SEED-MSG] Done! ${messages.length} messages seeded.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('[SEED-MSG] Error:', err);
  process.exit(1);
});
