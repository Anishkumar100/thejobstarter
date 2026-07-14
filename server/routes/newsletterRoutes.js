import { Router } from 'express';
import { subscribe, getSubscribers, removeSubscriber } from '../controllers/newsletterController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.post('/subscribe', subscribe);
router.get('/', requireAuth, requireAdmin, getSubscribers);
router.delete('/:id', requireAuth, requireAdmin, removeSubscriber);

export default router;
