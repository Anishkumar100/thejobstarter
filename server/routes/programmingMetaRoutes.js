import { Router } from 'express';
import { getProgrammingMeta, createProgrammingMeta, updateProgrammingMeta, deleteProgrammingMeta, seedProgrammingMeta } from '../controllers/programmingMetaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getProgrammingMeta);
router.post('/', requireAuth, requireAdmin, createProgrammingMeta);
router.put('/:id', requireAuth, requireAdmin, updateProgrammingMeta);
router.delete('/:id', requireAuth, requireAdmin, deleteProgrammingMeta);
router.post('/seed', requireAuth, requireAdmin, seedProgrammingMeta);

export default router;
