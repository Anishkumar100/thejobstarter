import { Router } from 'express';
import { getAptitudeMeta, createAptitudeMeta, updateAptitudeMeta, deleteAptitudeMeta, seedAptitudeMeta } from '../controllers/aptitudeMetaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getAptitudeMeta);
router.post('/', requireAuth, requireAdmin, createAptitudeMeta);
router.put('/:id', requireAuth, requireAdmin, updateAptitudeMeta);
router.delete('/:id', requireAuth, requireAdmin, deleteAptitudeMeta);
router.post('/seed', requireAuth, requireAdmin, seedAptitudeMeta);

export default router;
