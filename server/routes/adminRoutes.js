import { Router } from 'express';
import { getStats, getPublicStats, getAllUsers, updateUser, deleteUser, seedDatabase, exportUsersCsv, getBatchPlanStats } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Public stats endpoint for homepage (no auth) */
router.get('/public-stats', getPublicStats);

router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/batch-plan-stats', requireAuth, requireAdmin, getBatchPlanStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.put('/users/:id', requireAuth, requireAdmin, updateUser);
router.get('/users/export', requireAuth, requireAdmin, exportUsersCsv);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);
router.post('/seed', requireAuth, requireAdmin, seedDatabase);

export default router;
