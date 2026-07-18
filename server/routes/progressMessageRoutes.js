import { Router } from 'express';
import { getMessages, getAllMessages, createMessage, updateMessage, deleteMessage } from '../controllers/progressMessageController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getMessages);
router.get('/admin', requireAuth, requireAdmin, getAllMessages);
router.post('/', requireAuth, requireAdmin, createMessage);
router.put('/:id', requireAuth, requireAdmin, updateMessage);
router.delete('/:id', requireAuth, requireAdmin, deleteMessage);

export default router;
