import { Router } from 'express';
import { createQuiz, updateQuiz, deleteQuiz, getQuizByProblem, getQuizByProblemId, submitAttempt, getMyAttempts } from '../controllers/quizController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Admin CRUD */
router.post('/', requireAuth, requireAdmin, createQuiz);
router.put('/:id', requireAuth, requireAdmin, updateQuiz);
router.delete('/:id', requireAuth, requireAdmin, deleteQuiz);

/* Admin — get quiz with correctIndex for editing */
router.get('/admin/by-problem/:problemModel/:problemId', requireAuth, requireAdmin, getQuizByProblemId);

/* Student-facing — get quiz without answer key */
router.get('/by-problem/:problemModel/:slug', requireAuth, getQuizByProblem);

/* User's own attempts */
router.get('/my-attempts', requireAuth, getMyAttempts);

/* Student-facing — submit attempt */
router.post('/:id/attempt', requireAuth, submitAttempt);

export default router;
