import { Router } from 'express';
import {
  getLessons, getLessonBySlug, createLesson, updateLesson, deleteLesson,
  getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem
} from '../controllers/dsaController.js';
import {
  getSubtopics, getSubtopicBySlug, createSubtopic, updateSubtopic, deleteSubtopic,
  getSubtopicProblems
} from '../controllers/subtopicController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Lesson routes */
router.get('/lessons', requireAuth, getLessons);
router.get('/lessons/:slug', requireAuth, getLessonBySlug);
router.post('/lessons', requireAuth, requireAdmin, createLesson);
router.put('/lessons/:id', requireAuth, requireAdmin, updateLesson);
router.delete('/lessons/:id', requireAuth, requireAdmin, deleteLesson);

/* Subtopic routes */
router.get('/subtopics', requireAuth, getSubtopics);
router.get('/subtopics/:slug', requireAuth, getSubtopicBySlug);
router.get('/subtopics/:slug/problems', requireAuth, getSubtopicProblems);
router.post('/subtopics', requireAuth, requireAdmin, createSubtopic);
router.put('/subtopics/:id', requireAuth, requireAdmin, updateSubtopic);
router.delete('/subtopics/:id', requireAuth, requireAdmin, deleteSubtopic);

/* Problem routes */
router.get('/problems', requireAuth, getProblems);
router.get('/problems/:slug', requireAuth, getProblemBySlug);
router.post('/problems', requireAuth, requireAdmin, createProblem);
router.put('/problems/:id', requireAuth, requireAdmin, updateProblem);
router.delete('/problems/:id', requireAuth, requireAdmin, deleteProblem);

/* Legacy: flat GET / and GET /:slug for backward compat */
router.get('/', requireAuth, getProblems);

export default router;
