import { Router } from 'express';
import { markComplete, getSummary, getDailyCount, getAdminUserSummary, getAdminUserDailyCount, checkCompleted } from '../controllers/progressController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.post('/', requireAuth, markComplete);
router.get('/summary', requireAuth, getSummary);
router.get('/daily', requireAuth, getDailyCount);
router.get('/admin/:userId/summary', requireAuth, requireAdmin, getAdminUserSummary);
router.get('/admin/:userId/daily', requireAuth, requireAdmin, getAdminUserDailyCount);
router.get('/check-completed', requireAuth, checkCompleted);

export default router;
