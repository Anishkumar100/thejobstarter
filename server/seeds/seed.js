import mongoose from 'mongoose';

import DsaLesson from '../models/DsaLesson.js';
import Problem from '../models/Problem.js';
import Article from '../models/Article.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Language from '../models/Language.js';
import Cheatsheet from '../models/Cheatsheet.js';
import SiteConfig from '../models/SiteConfig.js';

/* Import mock data from client/src/data/ */
import { dsaLessons, problems as dsaProblems } from '../../client/src/data/dsa.js';
import { articles as dbmsArticles } from '../../client/src/data/dbms.js';
import { articles as osArticles } from '../../client/src/data/os.js';
import { posts as blogPosts } from '../../client/src/data/blog.js';
import { users as mockUsers } from '../../client/src/data/users.js';
import * as qaData from '../../client/src/data/qa.js';
import { languages as mockLanguages } from '../../client/src/data/languages.js';
import { cheatsheets as mockCheatsheets } from '../../client/src/data/cheatsheets.js';

/*
 * Strip _id from mock data so Mongoose auto-generates ObjectIds
 */
function stripId(arr) {
  return arr.map(({ _id, ...rest }) => rest);
}

/*
 * Strip ObjectId ref fields that use string IDs
 */
function stripRefs(arr, ...fields) {
  return arr.map(obj => {
    const clean = { ...obj };
    fields.forEach(f => { delete clean[f]; });
    const { _id, ...rest } = clean;
    return rest;
  });
}

/*
 * Seed all collections from mock data files.
 * Assumes MongoDB is already connected — does NOT connect/disconnect.
 * Safe to call from the admin controller or CLI.
 * Returns a summary object with counts per collection.
 */
export async function runSeed() {
  console.log('[SEED] Starting database seed...');

  /* Clear existing collections */
  console.log('[SEED] Clearing existing data...');
  await Promise.all([
    DsaLesson.deleteMany({}),
    Problem.deleteMany({}),
    Article.deleteMany({}),
    BlogPost.deleteMany({}),
    User.deleteMany({}),
    Question.deleteMany({}),
    Answer.deleteMany({}),
    Language.deleteMany({}),
    Cheatsheet.deleteMany({}),
    SiteConfig.deleteMany({})
  ]);
  console.log('[SEED] Existing data cleared');

  /* Drop and recreate index on User.clerkId (changed from unique to sparse) */
  try {
    await User.collection.dropIndex('clerkId_1');
    console.log('[SEED] Dropped old clerkId index');
  } catch { /* index may not exist */ }
  try {
    await User.collection.createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    console.log('[SEED] Created sparse clerkId index');
  } catch (e) { console.log('[SEED] Index creation skipped:', e.message); }

  /* Seed DSA lessons */
  console.log('[SEED] Inserting DSA lessons...');
  await DsaLesson.insertMany(stripId(dsaLessons));

  /* Seed problems */
  console.log('[SEED] Inserting problems...');
  await Problem.insertMany(stripId(dsaProblems));

  /* Seed DBMS + OS articles */
  console.log('[SEED] Inserting DBMS articles...');
  await Article.insertMany(stripId(dbmsArticles).map(a => ({ ...a, category: 'dbms' })));

  console.log('[SEED] Inserting OS articles...');
  await Article.insertMany(stripId(osArticles).map(a => ({ ...a, category: 'os' })));

  /* Seed blog posts */
  console.log('[SEED] Inserting blog posts...');
  await BlogPost.insertMany(stripId(blogPosts));

  /* Seed users */
  console.log('[SEED] Inserting users...');
  const insertedUsers = await User.insertMany(stripRefs(mockUsers, 'followers', 'following'));

  /* Build a map of string ID (u1, u2, ...) to MongoDB ObjectId + author info */
  const userMap = {};
  mockUsers.forEach((u, i) => {
    if (insertedUsers[i]) {
      userMap[u._id] = {
        _id: insertedUsers[i]._id,
        name: insertedUsers[i].displayName || insertedUsers[i].username,
        avatar: insertedUsers[i].avatar || ''
      };
    }
  });
  console.log('[SEED] User map built:', Object.keys(userMap).join(', '));

  /* Seed Q&A questions */
  console.log('[SEED] Inserting Q&A questions...');
  const cleanQa = (arr) => arr.map(({ _id, voters, answers, ...rest }) => {
    const authorId = rest.author;
    const author = authorId && userMap[authorId] ? userMap[authorId] : { _id: null, name: 'Unknown', avatar: '' };
    const { author: _author, ...cleanRest } = rest;
    return { ...cleanRest, author };
  });
  const insertedQuestions = await Question.insertMany(cleanQa(qaData.questions));

  /* Seed answers linked to questions */
  console.log('[SEED] Inserting answers...');
  if (qaData.answers && qaData.answers.length > 0) {
    const preparedAnswers = qaData.answers.map(({ _id, questionId, voters, ...rest }) => {
      const authorId = rest.author;
      const author = authorId && userMap[authorId] ? userMap[authorId] : { _id: null, name: 'Unknown', avatar: '' };
      const { author: _author, ...cleanRest } = rest;
      return {
        question: insertedQuestions.find(q =>
          q.slug === qaData.questions.find(qq => qq._id === questionId)?.slug
        )?._id,
        ...cleanRest,
        author
      };
    }).filter(a => a.question);
    await Answer.insertMany(preparedAnswers);
  }

  /* Seed languages */
  console.log('[SEED] Inserting languages...');
  await Language.insertMany(stripId(mockLanguages));

  /* Seed cheatsheets */
  console.log('[SEED] Inserting cheatsheets...');
  await Cheatsheet.insertMany(
    stripId(mockCheatsheets).map(c => ({
      ...c,
      pdfUrl: c.pdfUrl || 'https://ik.imagekit.io/akmaster/thewebytes/placeholder.pdf'
    }))
  );

  /* Seed SiteConfig with the WhyTheseThree section content */
  console.log('[SEED] Seeding SiteConfig (homepage Why section)...');
  await SiteConfig.findOneAndUpdate(
    {},
    {
      $set: {
        homepageStats: { problems: dsaProblems.length, articles: dbmsArticles.length + osArticles.length, users: mockUsers.length, questions: qaData.questions?.length || 0 },
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
            /* eslint-disable-next-line */
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
  console.log('[SEED] SiteConfig seeded');

  /* Note: Progress messages are now seeded via server/seeds/seedProgressMessages.js */

  const summary = {
    lessons: dsaLessons.length,
    problems: dsaProblems.length,
    articles: dbmsArticles.length + osArticles.length,
    blogPosts: blogPosts.length,
    users: mockUsers.length,
    questions: qaData.questions?.length || 0,
    answers: qaData.answers?.length || 0,
    languages: mockLanguages.length,
    cheatsheets: mockCheatsheets.length,
  };

  console.log('[SEED] Database seeded successfully!', summary);
  return summary;
}

/*
 * CLI entry point — auto-runs when script is executed directly via:
 *   node server/seeds/seed.js
 * Does NOT run when imported by the admin controller.
 */
const isCLI = process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/seed.js');
if (isCLI) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thewebytes_dsa';
      console.log('[SEED] Connecting to MongoDB...');
      await mongoose.connect(uri);
      console.log('[SEED] Connected to MongoDB');

      await runSeed();

      await mongoose.disconnect();
      console.log('[SEED] Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('[SEED] Error seeding database:', error);
      process.exit(1);
    }
  })();
}
