import { Router } from 'express';
import { getTopics, getTopic, createTopic, updateTopic, deleteTopic } from '../controllers/topicController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getTopics);
router.get('/:id', requireAuth, requireAdmin, getTopic);
router.post('/', requireAuth, requireAdmin, createTopic);
router.put('/:id', requireAuth, requireAdmin, updateTopic);
router.delete('/:id', requireAuth, requireAdmin, deleteTopic);

export default router;
