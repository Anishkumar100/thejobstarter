import { Router } from 'express';
import { bookmarkProblem, unbookmarkProblem, bookmarkArticle, unbookmarkArticle } from '../controllers/bookmarkController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/dsa/:slug/bookmark', requireAuth, bookmarkProblem);
router.delete('/dsa/:slug/bookmark', requireAuth, unbookmarkProblem);
router.post('/articles/:slug/bookmark', requireAuth, bookmarkArticle);
router.delete('/articles/:slug/bookmark', requireAuth, unbookmarkArticle);

export default router;
