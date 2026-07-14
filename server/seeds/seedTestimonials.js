import 'dotenv/config';
import mongoose from 'mongoose';

import Testimonial from '../models/Testimonial.js';
import mockTestimonials from '../../client/src/data/testimonials.js';

/*
 * seedTestimonials.js — Seed ONLY the Testimonials collection.
 * Run: node server/seeds/seedTestimonials.js
 * Does NOT touch any other collection.
 */
function stripId(arr) {
  return arr.map(({ _id, ...rest }) => rest);
}

async function seedTestimonials() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
  console.log('[SEED-TESTIMONIALS] Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('[SEED-TESTIMONIALS] Connected.');

  /* Clear existing testimonials */
  console.log('[SEED-TESTIMONIALS] Removing existing testimonials...');
  await Testimonial.deleteMany({});

  /* Insert mock testimonials */
  console.log('[SEED-TESTIMONIALS] Inserting testimonials...');
  const result = await Testimonial.insertMany(stripId(mockTestimonials));
  console.log(`[SEED-TESTIMONIALS] Inserted ${result.length} testimonials.`);

  await mongoose.disconnect();
  console.log('[SEED-TESTIMONIALS] Done.');
}

seedTestimonials().catch(err => {
  console.error('[SEED-TESTIMONIALS] Error:', err.message);
  process.exit(1);
});
