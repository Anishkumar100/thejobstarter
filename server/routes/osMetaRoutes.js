import { Router } from 'express';
import { getOsMeta, createOsMeta, updateOsMeta, deleteOsMeta, seedOsMeta } from '../controllers/osMetaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getOsMeta);
router.post('/', requireAuth, requireAdmin, createOsMeta);
router.put('/:id', requireAuth, requireAdmin, updateOsMeta);
router.delete('/:id', requireAuth, requireAdmin, deleteOsMeta);
router.post('/seed', requireAuth, requireAdmin, seedOsMeta);

export default router;
