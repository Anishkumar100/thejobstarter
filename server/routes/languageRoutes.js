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
