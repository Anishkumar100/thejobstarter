import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteConfig from '../models/SiteConfig.js';

dotenv.config({ path: '../.env' });

/*
 * seed-about.js — Seeds the aboutPage field into the SiteConfig document.
 * Run: cd server && node seeds/seed-about.js
 *
 * The /about page renders perfectly without this (falls back to DEFAULT_ABOUT
 * in About.jsx). Running this pre-populates the admin form at /admin/about-page
 * so you don't have to type every field from scratch.
 */

const DEFAULT_ABOUT_PAGE = {
  hero: {
    subtitle: 'THEJOBSTARTER / FIELD NOTE 001',
    title: 'STOP\nPREPARING\nTO PREPARE.',
    description:
      'TheJobStarter is a focused operating system for placement preparation. Learn the foundations. Train under pressure. Build visible proof that you can solve difficult problems.',
  },
  principles: [
    {
      id: '01',
      label: 'Focus Over Noise',
      title: 'LEARN WHAT\nACTUALLY MATTERS.',
      body: 'Every section is built around the concepts that repeatedly shape technical interviews: problem solving, database thinking, operating-system fundamentals, and clear communication.',
      accent: '#e11d48',
      route: '/dsa',
      action: 'ENTER DSA',
    },
    {
      id: '02',
      label: 'Practice With Intent',
      title: 'REPETITION\nBUILDS INSTINCT.',
      body: 'Reading is only the start. Confidence comes from recognising patterns, making mistakes, reviewing them, and solving the next problem with more clarity.',
      accent: '#0066ff',
      route: '/dbms',
      action: 'EXPLORE DBMS',
    },
    {
      id: '03',
      label: 'Progress Together',
      title: 'QUESTIONS ARE\nPART OF THE WORK.',
      body: 'Ask better questions. Compare approaches. Explain what you learned. Growth moves faster when your effort connects with a community moving in the same direction.',
      accent: '#ff4f00',
      route: '/qa',
      action: 'OPEN Q&A',
    },
  ],
  philosophy: [
    {
      id: '01',
      title: 'BUILD. BREAK. REBUILD.',
      body: 'We are builders first. The fastest path to understanding is to create something, push it until it fails, inspect why it failed, and make it stronger.',
    },
    {
      id: '02',
      title: 'CLARITY BEATS HYPE.',
      body: 'Students do not need louder promises. They need a clearer path, useful material, practical direction, and the confidence to face difficult questions.',
    },
    {
      id: '03',
      title: 'THE WORK MUST SHOW.',
      body: 'A strong career is not built in one night. It is built through small wins: one solved problem, one understood concept, one better explanation at a time.',
    },
    {
      id: '04',
      title: 'START BEFORE YOU FEEL READY.',
      body: 'Nobody begins fully prepared. The difference is choosing to begin, staying consistent when progress feels slow, and returning tomorrow with more intent.',
    },
  ],
  manifesto: {
    quote: 'TALENT GETS\nATTENTION.\nWORK GETS RESULTS.',
    description:
      'You do not need to know everything today. You need to return tomorrow with one more solved problem, one clearer concept, and one stronger attempt than yesterday.',
    watermark: 'WORK',
  },
  cta: {
    title: 'STOP WAITING\nFOR THE PERFECT\nMOMENT.',
    description:
      'Pick a starting point. Stay with it. Build proof of your growth one focused session at a time.',
    watermark: 'GO',
  },
};

async function seedAbout() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';

  try {
    console.log('[SEED_ABOUT] Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('[SEED_ABOUT] Connected to MongoDB');

    /* Upsert the aboutPage field — preserves any existing site config data */
    const result = await SiteConfig.findOneAndUpdate(
      {},
      { $set: { aboutPage: DEFAULT_ABOUT_PAGE } },
      { upsert: true, new: true }
    );

    console.log('[SEED_ABOUT] About page data seeded successfully');
    console.log('[SEED_ABOUT] SiteConfig ID:', result._id);
    console.log('[SEED_ABOUT] Fields set: hero, principles (3), philosophy (4), manifesto, cta');

    await mongoose.disconnect();
    console.log('[SEED_ABOUT] Done');
    process.exit(0);
  } catch (error) {
    console.error('[SEED_ABOUT] Error:', error.message);
    process.exit(1);
  }
}

seedAbout();
