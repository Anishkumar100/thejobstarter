import { Router } from 'express';
import { getDbmsMeta, createDbmsMeta, updateDbmsMeta, deleteDbmsMeta, seedDbmsMeta } from '../controllers/dbmsMetaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Public: fetch DBMS categories, topics, companies */
router.get('/', getDbmsMeta);

/* Admin: create / update / delete / seed */
router.post('/', requireAuth, requireAdmin, createDbmsMeta);
router.put('/:id', requireAuth, requireAdmin, updateDbmsMeta);
router.delete('/:id', requireAuth, requireAdmin, deleteDbmsMeta);
router.post('/seed', requireAuth, requireAdmin, seedDbmsMeta);

export default router;
