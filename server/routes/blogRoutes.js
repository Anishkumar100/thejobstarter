import { Router } from 'express';
import { getPosts, getPostBySlug, createPost, updatePost, deletePost } from '../controllers/blogController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', requireAuth, requireAdmin, createPost);
router.put('/:id', requireAuth, requireAdmin, updatePost);
router.delete('/:id', requireAuth, requireAdmin, deletePost);

export default router;
