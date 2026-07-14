# AGENTS.md — TheWebytes DSA Web

> Instructions for AI agents and developers working on this codebase.
> Read this file before making any changes.

---

## Project Overview

**TheWebytes DSA Web** is a placement-preparation platform for students learning DSA, Databases (DBMS), and Operating Systems (OS). It features curated problem solutions, in-depth articles, a Q&A forum, user profiles with external platform showcases (LeetCode, GitHub, etc.), and direct messaging.

**Brand:** TheWebytes (footer branding on every page)
**Primary goal:** Drive organic traffic via SEO-optimized content, convert visitors to registered users.

---

## Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Frontend      | React 18 (pure JS/JSX, no TypeScript)         |
| State Mgmt    | Zustand                                       |
| Backend       | Node.js + Express (ES Modules — NO `require`) |
| Database      | MongoDB + Mongoose                            |
| Auth          | Clerk (React SDK + backend webhook verification) |
| Image Storage | ImageKit (upload, optimize, CDN delivery)     |
| Styling       | Pure CSS (Gumroad-style neo-brutalism)        |
| Bundler       | None (v2 planned with Next.js) |
| Rendering     | SSR for content pages (SEO), CSR for app pages |

---

## Golden Rules

1. **NO TypeScript.** Pure JavaScript and JSX only. Files use `.js` and `.jsx` extensions.
2. **NO `require()` in backend.** Use ES module `import`/`export` syntax everywhere. Root `package.json` has `"type": "module"`.
3. **COMMENTS ARE REQUIRED.** Every function, every async operation, every non-trivial block MUST have clear comments explaining what it does. This project is for learning — comments teach the reader.
4. **CONSOLE.LOG IN EVERY ASYNC OP.** Every `try/catch` block must log the error with `console.error()`. Every successful async operation should log key state: `console.log('[DSA] Fetching problems...')`, `console.log('[DSA] Problems fetched:', count)`. Use bracket-prefixed tags like `[AUTH]`, `[DSA]`, `[QA]`, `[USER]` for consistent logging.
5. **NO CSS frameworks** (no Tailwind, no Bootstrap). Write raw CSS following `design.md`.
6. **NO `border-radius`.** Neo-brutalism = sharp corners everywhere.
7. **NO gradients.** Solid colors only.
8. **NO soft shadows.** Use hard offset shadows only: `box-shadow: 6px 6px 0 #000`.
9. **All images go through ImageKit.** Never use local file paths for user-uploaded media.
10. **All state management uses Zustand.** Do not use React Context for data fetching or global state.
11. **Backend always uses ES module imports.** `import express from 'express'` not `const express = require('express')`.
12. **File extensions in imports.** When importing local files, always include the `.js` or `.jsx` extension: `import { foo } from './foo.js'`.
13. **FULLY RESPONSIVE.** Every page must work on mobile (320px+), tablet, and desktop. Use CSS Grid + Flexbox. No horizontal overflow. Test at 375px, 768px, 1024px, 1440px.
14. **OPTIMIZED.** Minimal re-renders (React.memo where it counts), lazy load routes, debounce search inputs, compress images via ImageKit, cache SSR pages, minified CSS/JS in production.
15. **MAX BRUTALIST.** No break from the design system in `design.md`. No rounded corners anywhere. Every border is `3px solid #000`. Every shadow is hard offset. Every component screams neo-brutalism.
16. **CLEAN CODE.** Meaningful variable names, consistent indentation (2 spaces), no dead code, no commented-out blocks (except explanatory comments per rule 3), single responsibility per function.

---

## Folder Structure

```
dsa-web/
├── server/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   ├── clerk.js               # Clerk webhook + session verification
│   │   └── imagekit.js            # ImageKit SDK init
│   ├── models/
│   │   ├── Problem.js             # DSA problems
│   │   ├── Article.js             # DBMS + OS articles (category field differentiates)
│   │   ├── BlogPost.js            # Blog posts
│   │   ├── User.js                # User profiles (synced from Clerk)
│   │   ├── Question.js            # Q&A questions
│   │   ├── Answer.js              # Q&A answers
│   │   ├── Message.js             # DM messages
│   │   ├── Newsletter.js          # Newsletter subscribers
│   │   ├── Language.js            # Code languages (Python, JS, etc.)
│   │   ├── Cheatsheet.js          # Downloadable PDF cheatsheets
│   │   └── Bookmark.js            # User bookmarks on problems/articles
│   ├── controllers/
│   │   ├── dsaController.js
│   │   ├── articleController.js   # Handles DBMS + OS (filter by category)
│   │   ├── blogController.js
│   │   ├── qaController.js
│   │   ├── userController.js
│   │   ├── messageController.js
│   │   ├── mediaController.js     # ImageKit upload handler
│   │   ├── languageController.js  # Language CRUD
│   │   ├── cheatsheetController.js
│   │   ├── bookmarkController.js
│   │   └── adminController.js     # Admin stats + seed
│   ├── routes/
│   │   ├── dsaRoutes.js
│   │   ├── articleRoutes.js
│   │   ├── blogRoutes.js
│   │   ├── qaRoutes.js
│   │   ├── userRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── mediaRoutes.js
│   │   ├── languageRoutes.js
│   │   ├── cheatsheetRoutes.js
│   │   ├── bookmarkRoutes.js
│   │   ├── adminRoutes.js
│   │   └── newsletterRoutes.js
│   ├── middleware/
│   │   ├── auth.js                # Clerk session verification
│   │   ├── adminOnly.js           # Checks Clerk publicMetadata.role === 'admin'
│   │   ├── cache.js               # In-memory cache for SSR pages
│   │   └── errorHandler.js
│   ├── seeds/
│   │   └── seed.js                # Seeds MongoDB from client/src/data/ files
│   ├── utils/
│   │   ├── imageKit.js            # ImageKit upload/delete helpers
│   │   └── slugify.js
│   └── app.js                     # Express entry point
│
├── client/
│   ├── src/
│   │   ├── data/                  # Mock data (matches Mongoose schemas)
│   │   │   ├── dsa.js             # 180+ DSA problems
│   │   │   ├── dbms.js            # 45+ DBMS articles
│   │   │   ├── os.js              # 40+ OS articles
│   │   │   ├── blog.js            # 25+ blog posts
│   │   │   ├── users.js           # Sample users
│   │   │   ├── qa.js              # Sample Q&A
│   │   │   ├── messages.js        # Sample messages
│   │   │   ├── languages.js       # Code languages (Python, JS, etc.)
│   │   │   ├── cheatsheets.js     # Sample cheatsheets
│   │   │   └── index.js           # Re-exports all
│   │   ├── stores/                # Zustand stores
│   │   │   ├── useDsaStore.js
│   │   │   ├── useArticleStore.js # DBMS + OS
│   │   │   ├── useBlogStore.js
│   │   │   ├── useQaStore.js
│   │   │   ├── useUserStore.js
│   │   │   ├── useMessageStore.js
│   │   │   ├── useAuthStore.js
│   │   │   ├── useLanguageStore.js
│   │   │   ├── useCheatsheetStore.js
│   │   │   └── useAdminStore.js
│   │   ├── api/                   # API clients (fetch wrappers)
│   │   │   ├── client.js          # Base fetch wrapper
│   │   │   ├── dsaApi.js
│   │   │   ├── articleApi.js
│   │   │   ├── blogApi.js
│   │   │   ├── qaApi.js
│   │   │   ├── userApi.js
│   │   │   ├── messageApi.js
│   │   │   ├── mediaApi.js        # ImageKit upload from client
│   │   │   ├── languageApi.js
│   │   │   ├── cheatsheetApi.js
│   │   │   └── bookmarkApi.js
│   │   ├── components/
│   │   │   ├── ui/                # Brutalist primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Textarea.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Divider.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── CodeBlock.jsx
│   │   │   │   ├── VideoEmbed.jsx
│   │   │   │   ├── Image.jsx      # ImageKit image component
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── dsa/
│   │   │   │   ├── ProblemCard.jsx
│   │   │   │   ├── ProblemList.jsx
│   │   │   │   ├── ProblemView.jsx
│   │   │   │   └── FilterBar.jsx
│   │   │   ├── article/
│   │   │   │   ├── ArticleCard.jsx
│   │   │   │   ├── ArticleView.jsx
│   │   │   │   └── ArticleList.jsx
│   │   │   ├── blog/
│   │   │   │   ├── BlogCard.jsx
│   │   │   │   └── BlogView.jsx
│   │   │   ├── qa/
│   │   │   │   ├── QuestionCard.jsx
│   │   │   │   ├── QuestionDetail.jsx
│   │   │   │   ├── AnswerList.jsx
│   │   │   │   ├── AnswerForm.jsx
│   │   │   │   └── AskForm.jsx
│   │   │   ├── users/
│   │   │   │   ├── ProfileHero.jsx
│   │   │   │   ├── ProfileCard.jsx
│   │   │   │   ├── UserGrid.jsx
│   │   │   │   ├── ExternalLinks.jsx
│   │   │   │   ├── SkillsTags.jsx
│   │   │   │   ├── ActivityFeed.jsx
│   │   │   │   └── FollowButton.jsx
│   │   │   ├── messages/
│   │   │   │   ├── InboxList.jsx
│   │   │   │   ├── MessageThread.jsx
│   │   │   │   └── MessageInput.jsx
│   │   │   └── admin/
│   │   │       ├── AdminSidebar.jsx
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── StatsCard.jsx
│   │   │       ├── ProblemForm.jsx
│   │   │       ├── ArticleForm.jsx
│   │   │       ├── BlogForm.jsx
│   │   │       ├── MediaUploader.jsx  # ImageKit upload UI
│   │   │       ├── MediaLibrary.jsx
│   │   │       └── DataTable.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── DsaList.jsx
│   │   │   ├── DsaDetail.jsx
│   │   │   ├── DbmsList.jsx
│   │   │   ├── DbmsDetail.jsx
│   │   │   ├── OsList.jsx
│   │   │   ├── OsDetail.jsx
│   │   │   ├── BlogList.jsx
│   │   │   ├── BlogDetail.jsx
│   │   │   ├── QaList.jsx
│   │   │   ├── QaDetail.jsx
│   │   │   ├── AskQuestion.jsx
│   │   │   ├── UserSearchPage.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── MessageThreadPage.jsx
│   │   │   ├── Cheatsheets.jsx
│   │   │   ├── Newsletter.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDsaList.jsx
│   │   │   ├── AdminDsaEdit.jsx
│   │   │   ├── AdminDbmsList.jsx
│   │   │   ├── AdminDbmsEdit.jsx
│   │   │   ├── AdminOsList.jsx
│   │   │   ├── AdminOsEdit.jsx
│   │   │   ├── AdminBlogList.jsx
│   │   │   ├── AdminBlogEdit.jsx
│   │   │   ├── AdminMedia.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminQA.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── utils/
│   │   │   ├── imageKit.js        # ImageKit URL builder
│   │   │   ├── slugify.js
│   │   │   └── constants.js       # Topics, companies, difficulties
│   │   ├── styles/
│   │   │   ├── global.css         # CSS reset + variables + base
│   │   │   ├── components.css     # UI component styles
│   │   │   ├── pages.css          # Page-specific styles
│   │   │   └── admin.css          # Admin dashboard styles
│   │   ├── App.jsx                # Router + route guards
│   │   └── index.jsx              # Entry point
│   ├── public/
│   │   ├── robots.txt
│   │   └── favicon.ico
│   └── package.json
│
├── package.json                  # Root (helper scripts)
├── .env.example
├── .gitignore
├── design.md
└── agents.md
```

---

## Backend Conventions

### ES Modules (MANDATORY)

```js
// CORRECT
import express from 'express';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import { getProblems } from '../controllers/dsaController.js';

// WRONG — NEVER DO THIS
const express = require('express');
const Problem = require('../models/Problem');
```

### package.json (root)

```json
{
  "name": "dsa-web-root",
  "version": "1.0.0",
  "private": true,
  "description": "TheWebytes DSA Web — Root project with independent client and server",
  "scripts": {
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "install:all": "cd client && npm install && cd ../server && npm install"
  }
}
```

### package.json (client)

```json
{
  "name": "thewebytes-client",
  "version": "1.0.0",
  "private": true,
  "description": "TheWebytes DSA Web — Client (React source, bring your own bundler / Next.js v2 planned)",
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.0",
    "@clerk/clerk-react": "^5.26.2",
    "zustand": "^5.0.5",
    "motion": "^12.10.5",
    "react-helmet-async": "^3.0.0",
    "lucide-react": "^1.0.0"
  }
}
```

### package.json (server)

```json
{
  "name": "thewebytes-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "TheWebytes DSA Web — Express + MongoDB API server",
  "scripts": {
    "dev": "node --watch app.js",
    "start": "node app.js",
    "seed": "node seeds/seed.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.14.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "@clerk/backend": "^1.27.2",
    "imagekit": "^5.2.0",
    "compression": "^1.8.1",
    "slugify": "^1.6.6"
  }
}
```

### Mongoose Model Pattern

```js
// server/models/Problem.js
import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
  topics: [{ type: String, index: true }],
  companies: [{ type: String, index: true }],
  problemStatement: { type: String, required: true },
  examples: [{ input: String, output: String, explanation: String }],
  constraints: [String],
  approach: String,
  codeBlocks: [{ language: String, code: String }],
  media: [{
    type: { type: String, enum: ['image', 'youtube'] },
    url: String,
    caption: String,
    position: Number
  }],
  timeComplexity: String,
  spaceComplexity: String,
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
```

```js
// server/models/Language.js
import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },       // 'Python', 'JavaScript'
  slug: { type: String, required: true, unique: true, index: true },  // 'python', 'javascript'
  icon: { type: String, default: '' },           // Emoji or icon class (optional)
  active: { type: Boolean, default: true }       // Show in language picker?
}, { timestamps: true });

export default mongoose.model('Language', languageSchema);
```

```js
// server/models/Cheatsheet.js
import mongoose from 'mongoose';

const cheatsheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ['dsa', 'dbms', 'os'], required: true },
  description: String,
  pdfUrl: { type: String, required: true },      // ImageKit PDF URL
  thumbnail: String,                              // ImageKit image URL
  tags: [String],
  downloads: { type: Number, default: 0 },
  premium: { type: Boolean, default: false }      // Gated behind auth?
}, { timestamps: true });

export default mongoose.model('Cheatsheet', cheatsheetSchema);
```

```js
// server/models/Bookmark.js
import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['problem', 'article'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
  targetModel: { type: String, required: true }   // 'Problem' or 'Article'
}, { timestamps: true });

bookmarkSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
```

### Controller Pattern (with console.log + comments)

```js
// server/controllers/dsaController.js
import Problem from '../models/Problem.js';

/*
 * GET /api/dsa
 * Fetch problems with optional filters: difficulty, company, topic, search, page
 */
export async function getProblems(req, res) {
  try {
    console.log('[DSA] Fetching problems with filters:', req.query);
    const { difficulty, company, topic, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (difficulty) query.difficulty = difficulty;
    if (company) query.companies = company;
    if (topic) query.topics = topic;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const problems = await Problem.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Problem.countDocuments(query);

    console.log('[DSA] Problems fetched:', total);
    res.json({ data: problems, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[DSA] Error fetching problems:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/dsa/:slug
 * Fetch single problem by slug, increment view count
 */
export async function getProblemBySlug(req, res) {
  try {
    console.log('[DSA] Fetching problem by slug:', req.params.slug);
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      console.log('[DSA] Problem not found:', req.params.slug);
      return res.status(404).json({ error: 'Problem not found' });
    }
    await Problem.findByIdAndUpdate(problem._id, { $inc: { views: 1 } });
    console.log('[DSA] Problem fetched:', problem.title);
    res.json({ data: problem });
  } catch (error) {
    console.error('[DSA] Error fetching problem:', error.message);
    res.status(500).json({ error: error.message });
  }
}
```

### Route Pattern

```js
// server/routes/dsaRoutes.js
import { Router } from 'express';
import { getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem } from '../controllers/dsaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);
router.post('/', requireAuth, requireAdmin, createProblem);
router.put('/:id', requireAuth, requireAdmin, updateProblem);
router.delete('/:id', requireAuth, requireAdmin, deleteProblem);

export default router;
```

```js
// server/routes/languageRoutes.js
import { Router } from 'express';
import { getLanguages, getLanguageBySlug, createLanguage, updateLanguage, deleteLanguage } from '../controllers/languageController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getLanguages);
router.get('/:slug', getLanguageBySlug);
router.post('/', requireAuth, requireAdmin, createLanguage);
router.put('/:id', requireAuth, requireAdmin, updateLanguage);
router.delete('/:id', requireAuth, requireAdmin, deleteLanguage);

export default router;
```

### Middleware Pattern

```js
// server/middleware/auth.js
import { Clerk } from '@clerk/backend';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireAuth(req, res, next) {
  try {
    const session = await clerk.verifyToken(req.headers.authorization?.replace('Bearer ', ''));
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    req.userId = session.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// server/middleware/adminOnly.js
import { clerkClient } from '../config/clerk.js';

export async function requireAdmin(req, res, next) {
  try {
    const user = await clerkClient.users.getUser(req.userId);
    if (user.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch {
    res.status(403).json({ error: 'Admin access required' });
  }
}
```

---

## Frontend Conventions

### Zustand Store Pattern

Every data domain gets its own Zustand store. Stores handle:
1. Mock data fallback (when `USE_MOCK=true`)
2. API fetching (when `USE_MOCK=false`)
3. State (data, loading, error)
4. Actions (fetch, create, update, delete)

```js
// client/src/stores/useDsaStore.js
import { create } from 'zustand';
import { problems as mockProblems } from '../data/dsa.js';
import { fetchProblems, fetchProblemBySlug, createProblem, updateProblem, deleteProblem } from '../api/dsaApi.js';

/* Flag to toggle between mock data and live API */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useDsaStore = create((set, get) => ({
  problems: [],
  currentProblem: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,

  /*
   * Fetch problems with optional filters
   * Supports: difficulty, company, topic, search, page
   */
  fetchProblems: async (filters = {}) => {
    console.log('[DSA] Fetching problems with filters:', filters);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        /*
         * Mock mode — filter in-memory data
         * This allows frontend dev without a running backend
         */
        let result = [...mockProblems];
        if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
        if (filters.company) result = result.filter(p => p.companies.includes(filters.company));
        if (filters.topic) result = result.filter(p => p.topics.includes(filters.topic));
        if (filters.search) result = result.filter(p => p.title.toLowerCase().includes(filters.search.toLowerCase()));
        console.log('[DSA] Mock problems filtered:', result.length);
        set({ problems: result, loading: false, total: result.length, totalPages: 1 });
      } else {
        /* Live mode — fetch from Express API */
        const res = await fetchProblems(filters);
        console.log('[DSA] Problems fetched from API:', res.total);
        set({ problems: res.data, loading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[DSA] Error fetching problems:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Fetch a single problem by its URL slug
   * Backend automatically increments view count
   */
  fetchProblemBySlug: async (slug) => {
    console.log('[DSA] Fetching problem by slug:', slug);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        const problem = mockProblems.find(p => p.slug === slug);
        console.log('[DSA] Mock problem found:', !!problem);
        set({ currentProblem: problem || null, loading: false });
      } else {
        const res = await fetchProblemBySlug(slug);
        console.log('[DSA] Problem fetched:', res.data?.title);
        set({ currentProblem: res.data, loading: false });
      }
    } catch (error) {
      console.error('[DSA] Error fetching problem:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /* Admin: Create a new problem (only works in live mode) */
  createProblem: async (data) => {
    console.log('[DSA] Creating problem...');
    if (USE_MOCK) return;
    const res = await createProblem(data);
    console.log('[DSA] Problem created:', res.data?.title);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  /* Admin: Update an existing problem */
  updateProblem: async (id, data) => {
    console.log('[DSA] Updating problem:', id);
    if (USE_MOCK) return;
    const res = await updateProblem(id, data);
    console.log('[DSA] Problem updated:', res.data?.title);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  /* Admin: Delete a problem */
  deleteProblem: async (id) => {
    console.log('[DSA] Deleting problem:', id);
    if (USE_MOCK) return;
    await deleteProblem(id);
    console.log('[DSA] Problem deleted:', id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
```

### API Client Pattern

```js
// client/src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  const token = localStorage.getItem('clerk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }
  return res.json();
}

// client/src/api/dsaApi.js
import { apiRequest } from './client.js';

export function fetchProblems(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dsa?${params}`);
}

export function fetchProblemBySlug(slug) {
  return apiRequest(`/dsa/${slug}`);
}

export function createProblem(data) {
  return apiRequest('/dsa', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProblem(id, data) {
  return apiRequest(`/dsa/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProblem(id) {
  return apiRequest(`/dsa/${id}`, { method: 'DELETE' });
}

// client/src/api/languageApi.js
import { apiRequest } from './client.js';

export function fetchLanguages() {
  return apiRequest('/languages');
}

export function fetchLanguageBySlug(slug) {
  return apiRequest(`/languages/${slug}`);
}

export function createLanguage(data) {
  return apiRequest('/languages', { method: 'POST', body: JSON.stringify(data) });
}

export function updateLanguage(id, data) {
  return apiRequest(`/languages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteLanguage(id) {
  return apiRequest(`/languages/${id}`, { method: 'DELETE' });
}
```

### Component Pattern

```jsx
// client/src/components/dsa/ProblemCard.jsx
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import './ProblemCard.css';

export default function ProblemCard({ problem }) {
  return (
    <Link to={`/dsa/${problem.slug}`} className="problem-card">
      <div className="problem-card__header">
        <h3 className="problem-card__title">{problem.title}</h3>
        <Badge variant={problem.difficulty}>{problem.difficulty}</Badge>
      </div>
      <div className="problem-card__topics">
        {problem.topics.map(topic => (
          <span key={topic} className="tag">{topic}</span>
        ))}
      </div>
      <div className="problem-card__companies">
        {problem.companies.slice(0, 4).map(company => (
          <span key={company} className="tag">{company}</span>
        ))}
      </div>
      <div className="problem-card__stats">
        <span>▲ {problem.views}</span>
      </div>
    </Link>
  );
}
```

### CSS Pattern

```css
/* client/src/styles/global.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --black: #000000;
  --white: #ffffff;
  --gray-100: #f5f5f5;
  --gray-300: #d4d4d4;
  --gray-500: #9ca3af;
  --gray-700: #555555;
  --gray-900: #111111;
  --accent: #ff4f00;
  --accent-blue: #0066ff;
  --border: 3px solid var(--black);
  --shadow: 6px 6px 0 var(--black);
  --shadow-lg: 8px 8px 0 var(--black);
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

body {
  font-family: var(--font-sans);
  color: var(--gray-900);
  background: var(--white);
  font-size: 1rem;
  line-height: 1.6;
}

a { color: var(--black); text-decoration: none; }
a:hover { color: var(--accent); }

button, input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}
```

---

## ImageKit Integration

### Server-side (admin uploads)

```js
// server/config/imagekit.js
import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// server/controllers/mediaController.js
import { imagekit } from '../config/imagekit.js';

export async function uploadMedia(req, res) {
  try {
    const { file, fileName } = req.body;
    const result = await imagekit.upload({
      file,
      fileName,
      folder: '/thewebytes/'
    });
    res.json({ url: result.url, fileId: result.fileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function listMedia(req, res) {
  try {
    const files = await imagekit.listFiles({ path: '/thewebytes/' });
    res.json({ data: files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteMedia(req, res) {
  try {
    await imagekit.deleteFile(req.params.fileId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Client-side (URL builder)

```js
// client/src/utils/imageKit.js
const IMAGEKIT_URL = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

export function buildImageUrl(path, transformations = {}) {
  const { width, height, quality = 80, format = 'webp' } = transformations;
  const tr = [];
  if (width) tr.push(`w-${width}`);
  if (height) tr.push(`h-${height}`);
  tr.push(`q-${quality}`);
  tr.push(`f-${format}`);
  if (width || height) tr.push('fo-auto');

  const trString = tr.join(',');
  return `${IMAGEKIT_URL}${path}?tr=${trString}`;
}

export function buildYouTubeEmbed(videoId, title) {
  return `https://www.youtube.com/embed/${videoId}`;
}
```

```jsx
// client/src/components/ui/Image.jsx
import { buildImageUrl } from '../../utils/imageKit.js';

export default function Image({ src, alt, width, height, className = '' }) {
  const optimizedSrc = buildImageUrl(src, { width, height });
  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={`brutal-image ${className}`}
    />
  );
}
```

---

## Clerk Auth Integration

### Frontend

```jsx
// client/src/App.jsx
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function AdminRoute({ children }) {
  const { user } = useUser();
  if (user?.publicMetadata?.role !== 'admin') return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/dsa" element={<DsaList />} />
        <Route path="/dsa/:slug" element={<DsaDetail />} />
        <Route path="/dbms" element={<DbmsList />} />
        <Route path="/dbms/:slug" element={<DbmsDetail />} />
        <Route path="/os" element={<OsList />} />
        <Route path="/os/:slug" element={<OsDetail />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/cheatsheets" element={<Cheatsheets />} />
        <Route path="/about" element={<About />} />
        <Route path="/newsletter" element={<Newsletter />} />

        {/* Protected routes */}
        <Route path="/qa" element={<ProtectedRoute><QaList /></ProtectedRoute>} />
        <Route path="/qa/:id" element={<ProtectedRoute><QaDetail /></ProtectedRoute>} />
        <Route path="/qa/ask" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserSearchPage /></ProtectedRoute>} />
        <Route path="/users/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/settings/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><MessageThreadPage /></ProtectedRoute>} />
        <Route path="/cheatsheets/:slug/download" element={<ProtectedRoute><Cheatsheets /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/dsa" element={<AdminRoute><AdminDsaList /></AdminRoute>} />
        <Route path="/admin/dsa/new" element={<AdminRoute><AdminDsaEdit /></AdminRoute>} />
        <Route path="/admin/dsa/:id/edit" element={<AdminRoute><AdminDsaEdit /></AdminRoute>} />
        <Route path="/admin/dbms" element={<AdminRoute><AdminDbmsList /></AdminRoute>} />
        <Route path="/admin/dbms/new" element={<AdminRoute><AdminDbmsEdit /></AdminRoute>} />
        <Route path="/admin/dbms/:id/edit" element={<AdminRoute><AdminDbmsEdit /></AdminRoute>} />
        <Route path="/admin/os" element={<AdminRoute><AdminOsList /></AdminRoute>} />
        <Route path="/admin/os/new" element={<AdminRoute><AdminOsEdit /></AdminRoute>} />
        <Route path="/admin/os/:id/edit" element={<AdminRoute><AdminOsEdit /></AdminRoute>} />
        <Route path="/admin/blog" element={<AdminRoute><AdminBlogList /></AdminRoute>} />
        <Route path="/admin/blog/new" element={<AdminRoute><AdminBlogEdit /></AdminRoute>} />
        <Route path="/admin/blog/:id/edit" element={<AdminRoute><AdminBlogEdit /></AdminRoute>} />
        <Route path="/admin/media" element={<AdminRoute><AdminMedia /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/qa" element={<AdminRoute><AdminQA /></AdminRoute>} />

        {/* Auth pages (Clerk handles these) */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ClerkProvider>
  );
}
```

### Backend Webhook (user sync)

```js
// server/routes/userRoutes.js
import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/userController.js';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), handleClerkWebhook);

// When a user signs up via Clerk, webhook creates a User doc in MongoDB:
// { clerkId, username, displayName, avatar, joinDate }
```

---

## Auth Split (Public vs Protected)

### Public (no login — SEO indexed)
- `/` Home
- `/about` About
- `/dsa` DSA listing
- `/dsa/:slug` DSA problem detail
- `/dbms` DBMS listing
- `/dbms/:slug` DBMS article detail
- `/os` OS listing
- `/os/:slug` OS article detail
- `/blog` Blog listing
- `/blog/:slug` Blog post detail
- `/cheatsheets` Cheatsheets (view only)

### Protected (login required)
- `/qa` Q&A listing
- `/qa/:id` Q&A detail
- `/qa/ask` Ask a question
- `/users` User search
- `/users/:username` User profile
- `/settings/profile` Edit profile
- `/messages` Inbox
- `/messages/:userId` DM thread
- `/cheatsheets/:id/download` Download PDF

### Admin only
- `/admin` Dashboard
- `/admin/dsa` + `/admin/dsa/new` + `/admin/dsa/:id/edit`
- `/admin/dbms` + `/admin/dbms/new` + `/admin/dbms/:id/edit`
- `/admin/os` + `/admin/os/new` + `/admin/os/:id/edit`
- `/admin/blog` + `/admin/blog/new` + `/admin/blog/:id/edit`
- `/admin/media` Media library
- `/admin/users` User management
- `/admin/qa` Q&A moderation

---

## Environment Variables

```env
# .env.example

# Server
PORT=3001
MONGODB_URI=mongodb://localhost:27017/thewebytes_dsa
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/thewebytes

# Client
VITE_API_URL=http://localhost:3001/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_USE_MOCK=true
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/thewebytes
```

---

## Mock Data Conventions

Mock data files in `client/src/data/` must match Mongoose schema shapes exactly. This allows seamless switching between mock and API via `VITE_USE_MOCK`.

- Every mock object uses `_id` as a string (e.g., `'p1'`, `'u1'`, `'q1'`)
- Dates as ISO strings (`'2026-01-15'`)
- All fields present even if empty (`media: []`, `codeBlocks: []`)
- Seed script (`server/seeds/seed.js`) imports from `client/src/data/` and inserts into MongoDB

---

## Development Commands

```bash
# Install dependencies for both client and server
cd client && npm install
cd ../server && npm install
# Or use root shortcut: npm run install:all

# Run server only
npm run dev:server     # (from root) or: cd server && node --watch app.js

# Seed MongoDB with mock data
cd server && node seeds/seed.js

# Start production server
cd server && node app.js
```

---

## Design System Reference

See `design.md` for the complete Gumroad-style neo-brutalist design system including:
- Color palette and CSS variables
- Typography scale
- Border and shadow specs
- Component patterns (buttons, cards, inputs, badges, modals, etc.)
- Page layout wireframes
- Responsive breakpoints
- Animation rules
- Accessibility requirements

**Always consult `design.md` before writing any CSS or component markup.**

---

## API Endpoints Summary

### DSA
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dsa` | Public | List problems (filters: difficulty, company, topic, search, page) |
| GET | `/api/dsa/:slug` | Public | Get single problem |
| POST | `/api/dsa` | Admin | Create problem |
| PUT | `/api/dsa/:id` | Admin | Update problem |
| DELETE | `/api/dsa/:id` | Admin | Delete problem |
| POST | `/api/dsa/:slug/bookmark` | User | Bookmark a problem |
| DELETE | `/api/dsa/:slug/bookmark` | User | Remove bookmark |

### Articles (DBMS + OS)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/articles?category=dbms` | Public | List articles by category |
| GET | `/api/articles/:slug` | Public | Get single article |
| POST | `/api/articles` | Admin | Create article |
| PUT | `/api/articles/:id` | Admin | Update article |
| DELETE | `/api/articles/:id` | Admin | Delete article |
| POST | `/api/articles/:slug/bookmark` | User | Bookmark an article |
| DELETE | `/api/articles/:slug/bookmark` | User | Remove bookmark |

### Blog
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blog` | Public | List posts |
| GET | `/api/blog/:slug` | Public | Get single post |
| POST | `/api/blog` | Admin | Create post |
| PUT | `/api/blog/:id` | Admin | Update post |
| DELETE | `/api/blog/:id` | Admin | Delete post |

### Q&A
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/qa` | Public* | List questions |
| GET | `/api/qa/:id` | Public* | Get question + answers |
| POST | `/api/qa` | User | Ask question |
| PUT | `/api/qa/:id` | User (author) | Edit own question |
| DELETE | `/api/qa/:id` | User (author) / Admin | Delete question |
| POST | `/api/qa/:id/answers` | User | Post answer |
| PUT | `/api/qa/:id/answers/:aid` | User (author) | Edit own answer |
| DELETE | `/api/qa/:id/answers/:aid` | User (author) / Admin | Delete answer |
| PUT | `/api/qa/:id/vote` | User | Vote on question (up/down) |
| PUT | `/api/qa/:id/answers/:aid/vote` | User | Vote on answer |
| PUT | `/api/qa/:id/answers/:aid/accept` | User (author) | Accept an answer |

*Q&A list/detail are public for SEO but posting/voting requires auth.

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | User | Search users |
| GET | `/api/users/:username` | User | Get public profile |
| PUT | `/api/users/:username` | User (owner) | Update own profile |
| DELETE | `/api/users/:id` | Admin | Delete a user |
| POST | `/api/users/:id/follow` | User | Follow user |
| DELETE | `/api/users/:id/follow` | User | Unfollow user |
| POST | `/api/users/webhook` | Clerk webhook | Sync user on signup |

### Messages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages` | User | Get inbox (conversations) |
| GET | `/api/messages/:userId` | User | Get message thread |
| POST | `/api/messages/:userId` | User | Send message |
| PUT | `/api/messages/:id/read` | User | Mark message as read |
| DELETE | `/api/messages/:id` | User | Delete a message |

### Languages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/languages` | Public | List active languages |
| GET | `/api/languages/:slug` | Public | Get single language |
| POST | `/api/languages` | Admin | Create a language |
| PUT | `/api/languages/:id` | Admin | Update a language |
| DELETE | `/api/languages/:id` | Admin | Delete a language |

### Cheatsheets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cheatsheets` | Public | List cheatsheets (filters: category, tag) |
| GET | `/api/cheatsheets/:slug` | Public | Get single cheatsheet |
| GET | `/api/cheatsheets/:slug/download` | User | Download PDF (tracks count) |
| POST | `/api/cheatsheets` | Admin | Create cheatsheet |
| PUT | `/api/cheatsheets/:id` | Admin | Update cheatsheet |
| DELETE | `/api/cheatsheets/:id` | Admin | Delete cheatsheet |

### Media (ImageKit)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/media/upload` | Admin | Upload image to ImageKit |
| GET | `/api/media` | Admin | List all media in ImageKit |
| DELETE | `/api/media/:fileId` | Admin | Delete media from ImageKit |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard statistics (counts across all collections) |
| GET | `/api/admin/users` | Admin | List all users (admin panel) |
| POST | `/api/admin/seed` | Admin | Seed MongoDB from mock data files |

### Newsletter
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/newsletter/subscribe` | Public | Subscribe email |
| GET | `/api/newsletter` | Admin | List all subscribers |
| DELETE | `/api/newsletter/:id` | Admin | Remove subscriber |
