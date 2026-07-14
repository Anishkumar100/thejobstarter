import { Router } from 'express';
import { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle } from '../controllers/articleController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);
router.post('/', requireAuth, requireAdmin, createArticle);
router.put('/:id', requireAuth, requireAdmin, updateArticle);
router.delete('/:id', requireAuth, requireAdmin, deleteArticle);

export default router;
