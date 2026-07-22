import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';

/* Load environment variables */
config();

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

/* Import all route modules */
import dsaRoutes from './routes/dsaRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import dbmsRoutes from './routes/dbmsRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import qaRoutes from './routes/qaRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import languageRoutes from './routes/languageRoutes.js';
import cheatsheetRoutes from './routes/cheatsheetRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import coachingCenterRoutes from './routes/coachingCenterRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import siteConfigRoutes from './routes/siteConfigRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import dbmsMetaRoutes from './routes/dbmsMetaRoutes.js';
console.log('[APP] Importing notification routes...');
import progressRoutes from './routes/progressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import osRoutes from './routes/osRoutes.js';
import osMetaRoutes from './routes/osMetaRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressMessageRoutes from './routes/progressMessageRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import programmingRoutes from './routes/programmingRoutes.js';
import programmingMetaRoutes from './routes/programmingMetaRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import courseOfferingRoutes from './routes/courseOfferingRoutes.js';
import planRoutes from './routes/planRoutes.js';

/* Initialize Express app */
const app = express();
const PORT = process.env.PORT || 3001;

/*
 * Connect to MongoDB
 */
console.log('[APP] Starting server...');
connectDB();

/*
 * Middleware
 */
app.use(helmet());
app.use(compression());
/*
 * CORS configuration
 * Accept requests from:
 *  - CLIENT_URL env var (production)
 *  - Local dev server (http://localhost:3000)
 *  - Vite dev server on common ports
 *  - The current request origin if it's a known pattern
 */
/*
 * Collect allowed origins, trimming trailing slashes from env vars
 * because the browser Origin header never has a trailing slash.
 */
const allowedOrigins = [
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL.replace(/\/+$/, '')] : []),
  'http://localhost:3000',
  'http://localhost:5173',
  'https://thejobstarter.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    /* Allow requests with no origin (server-to-server, curl, etc.) */
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    /* Also allow any Vercel preview deployment (*.vercel.app) */
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

/*
 * JSON body parser (skip for Clerk webhook which needs raw body)
 */
app.use('/api/users/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/*
 * API Routes
 */
console.log('[APP] Registering API routes...');
app.use('/api/dsa', dsaRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/dbms', dbmsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/cheatsheets', cheatsheetRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coaching-centers', coachingCenterRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/dsa-meta', metaRoutes);
app.use('/api/dbms-meta', dbmsMetaRoutes);
app.use('/api/os', osRoutes);
app.use('/api/os-meta', osMetaRoutes);
app.use('/api/progress', progressRoutes);
console.log('[APP] Registering notification routes...');
app.use('/api/notifications', notificationRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress-messages', progressMessageRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/programming', programmingRoutes);
app.use('/api/programming-meta', programmingMetaRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/course-offerings', courseOfferingRoutes);

/*
 * SSR placeholder — Client will use Next.js in v2.
 * For now, this is a pure API server.
 * In production, serve the built Next.js static output from a CDN or static host.
 */
app.get('/', (req, res) => {
  res.json({ message: 'TheWebytes DSA API — client coming in v2 (Next.js)' });
});

/*
 * Global error handler (must be last)
 */
app.use(errorHandler);

/*
 * Start server
 */
app.listen(PORT, () => {
  console.log(`[APP] Server running on port ${PORT}`);
  console.log(`[APP] Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
