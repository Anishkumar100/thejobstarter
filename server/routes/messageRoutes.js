import { Router } from 'express';
import { getConversations, getMessages, sendMessage, markAsRead, deleteMessage } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getConversations);
router.get('/:userId', requireAuth, getMessages);
router.post('/:userId', requireAuth, sendMessage);
router.put('/:id/read', requireAuth, markAsRead);
router.delete('/:id', requireAuth, deleteMessage);

export default router;
