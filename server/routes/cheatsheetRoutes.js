import { Router } from 'express';
import { getCheatsheets, getCheatsheetBySlug, downloadCheatsheet, createCheatsheet, updateCheatsheet, deleteCheatsheet } from '../controllers/cheatsheetController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getCheatsheets);
router.get('/:slug', getCheatsheetBySlug);
router.get('/:slug/download', requireAuth, downloadCheatsheet);
router.post('/', requireAuth, requireAdmin, createCheatsheet);
router.put('/:id', requireAuth, requireAdmin, updateCheatsheet);
router.delete('/:id', requireAuth, requireAdmin, deleteCheatsheet);

export default router;
