import { Router } from 'express';
import { getDsaMeta, createDsaMeta, updateDsaMeta, deleteDsaMeta, seedDsaMeta } from '../controllers/metaController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Public: fetch DSA categories, topics, companies */
router.get('/', getDsaMeta);

/* Admin: create / update / delete / seed */
router.post('/', requireAuth, requireAdmin, createDsaMeta);
router.put('/:id', requireAuth, requireAdmin, updateDsaMeta);
router.delete('/:id', requireAuth, requireAdmin, deleteDsaMeta);
router.post('/seed', requireAuth, requireAdmin, seedDsaMeta);

export default router;