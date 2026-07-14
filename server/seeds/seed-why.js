import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

import SiteConfig from '../models/SiteConfig.js';

/*
 * seed-why.js — Seed ONLY the "Why DSA, DBMS & OS" section in SiteConfig
 * Run: node server/seeds/seed-why.js
 * Does NOT touch any other collection.
 */
async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
  console.log('[SEED_WHY] Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('[SEED_WHY] Connected');

  console.log('[SEED_WHY] Upserting homepageWhySection...');
  await SiteConfig.findOneAndUpdate(
    {},
    {
      $set: {
        homepageWhySection: {
          header: { tag: 'Why You Need', title: 'DSA, DBMS & OS', subtitle: 'The three subjects that decide your placement outcome.' },
          dsaCard: {
            tag: 'DSA \u2014 GATEKEEPER', number: 70,
            description: 'Companies screen candidates purely on DSA before your resume reaches a human recruiter.',
            quoteText: 'The gatekeeper of nearly every software engineering interview.',
            quoteCite: 'OnJob.io, 2026',
            stats: [{ number: '180', label: 'Problems' }, { number: '12', label: 'Patterns' }, { number: '6', label: 'Difficulty bands' }],
            ctaLabel: 'Start DSA \u2014 180 Problems', ctaLink: '/dsa'
          },
          confessionCard: {
            quote: 'I spent 6 months learning React.\nGot to the interview.\nThey asked me to reverse a linked list.',
            attribution: 'Every placement student, ever'
          },
          dbmsCard: {
            tag: 'DBMS',
            description: 'Second most-asked subject after DSA in every tech placement cycle.',
            quoteText: 'Second most important subject after DSA.',
            quoteCite: 'GeeksforGeeks',
            stats: ['45+ Articles', '10 Core Topics'],
            ctaLabel: 'Explore DBMS \u2014 45+ Articles', ctaLink: '/dbms'
          },
          osCard: {
            tag: 'Operating Systems', subTag: 'MOST IGNORED',
            headlineLine1: 'One OS round', headlineLine2: 'can make or break', headlineLine3: 'your shortlisting.',
            body: "Service companies test OS concepts heavily. Product companies are now joining in. Most candidates skip it entirely \u2014 that's your edge.",
            quoteText: 'CS fundamentals are tested heavily at service companies and increasingly at product companies too.',
            quoteCite: "Let's Code, 2026",
            ctaLabel: 'Explore OS \u2014 40+ Articles', ctaLink: '/os'
          },
          statsFooter: [
            { stat: '93%', text: 'of job postings required data structures knowledge', cite: 'hackajob, 2025' },
            { stat: '80\u201390%', text: 'of candidates fail technical coding rounds', cite: 'Karat, 2026' },
            { stat: 'Big 3', text: 'Algorithms \u00b7 SQL \u00b7 Data Structures \u2014 top 3 by volume', cite: 'HackerEarth CEO, 2026' }
          ]
        }
      }
    },
    { upsert: true }
  );
  console.log('[SEED_WHY] Done');

  await mongoose.disconnect();
  console.log('[SEED_WHY] Disconnected');
  process.exit(0);
}

run().catch(err => {
  console.error('[SEED_WHY] Error:', err);
  process.exit(1);
});
