import { Router } from 'express';
import {
  getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion,
  voteQuestion, approveQuestion, rejectQuestion
} from '../controllers/qaController.js';
import {
  createAnswer, updateAnswer, deleteAnswer, voteAnswer, acceptAnswer,
  approveAnswer, rejectAnswer
} from '../controllers/answerController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Public: view approved questions (use ?author=me for own questions) */
router.get('/', optionalAuth, getQuestions);

/* Public: view single question (pending ones are filtered in controller) */
router.get('/:id', optionalAuth, getQuestionById);

/* User: create a question (saved as pending) */
router.post('/', requireAuth, createQuestion);
router.put('/:id', requireAuth, updateQuestion);
router.delete('/:id', requireAuth, deleteQuestion);
router.put('/:id/vote', requireAuth, voteQuestion);

/* Admin: approve/reject pending questions */
router.put('/:id/approve', requireAuth, requireAdmin, approveQuestion);
router.put('/:id/reject', requireAuth, requireAdmin, rejectQuestion);

/* Answer routes nested under questions */
router.post('/:id/answers', requireAuth, createAnswer);
router.put('/:id/answers/:aid', requireAuth, updateAnswer);
router.delete('/:id/answers/:aid', requireAuth, deleteAnswer);
router.put('/:id/answers/:aid/vote', requireAuth, voteAnswer);
router.put('/:id/answers/:aid/accept', requireAuth, acceptAnswer);

/* Question author: approve/reject pending answers */
router.put('/:id/answers/:aid/approve', requireAuth, approveAnswer);
router.put('/:id/answers/:aid/reject', requireAuth, rejectAnswer);

export default router;
