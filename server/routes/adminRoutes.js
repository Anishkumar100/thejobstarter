import { Router } from 'express';
import { getStats, getPublicStats, getAllUsers, deleteUser, seedDatabase } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Public stats endpoint for homepage (no auth) */
router.get('/public-stats', getPublicStats);

router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);
router.post('/seed', requireAuth, requireAdmin, seedDatabase);

export default router;
