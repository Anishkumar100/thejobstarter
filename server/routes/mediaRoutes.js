import { Router } from 'express';
import { uploadMedia, listMedia, deleteMedia } from '../controllers/mediaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.post('/upload', requireAuth, requireAdmin, uploadMedia);
router.get('/', requireAuth, requireAdmin, listMedia);
router.delete('/:fileId', requireAuth, requireAdmin, deleteMedia);

export default router;
