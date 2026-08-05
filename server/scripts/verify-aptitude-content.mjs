/*
 * verify-aptitude-content.mjs — quick richness check on seeded aptitude content.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import AptitudeSubtopic from '../models/AptitudeSubtopic.js';
import AptitudeProblem from '../models/AptitudeProblem.js';

await mongoose.connect(process.env.MONGODB_URI);

const subs = await AptitudeSubtopic.find({}).lean();
const probs = await AptitudeProblem.find({}).lean();

for (const s of subs) {
  console.log('[SUB]', s.title, '| chars:', s.explanation.length,
    '| headings:', (s.explanation.match(/^###/gm) || []).length,
    '| tables:', (s.explanation.match(/\|---\|/gm) || []).length,
    '| codefences:', (s.explanation.match(/```/g) || []).length,
    '| checks/crosses:', (s.explanation.match(/[✓❌]/g) || []).length);
}
for (const p of probs) {
  console.log('[PROB]', p.title, '| solution chars:', p.solution.length,
    '| headings:', (p.solution.match(/^###/gm) || []).length,
    '| tables:', (p.solution.match(/\|---\|/gm) || []).length);
}

await mongoose.disconnect();
process.exit(0);
