import { Router } from 'express';
import {
  getLessons, getLessonBySlug, createLesson, updateLesson, deleteLesson,
  getSubtopics, getSubtopicBySlug, createSubtopic, updateSubtopic, deleteSubtopic,
  getSubtopicProblems,
  getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem
} from '../controllers/aptitudeController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Lessons */
router.get('/lessons', requireAuth, getLessons);
router.get('/lessons/:slug', requireAuth, getLessonBySlug);
router.post('/lessons', requireAuth, requireAdmin, createLesson);
router.put('/lessons/:id', requireAuth, requireAdmin, updateLesson);
router.delete('/lessons/:id', requireAuth, requireAdmin, deleteLesson);

/* Subtopics */
router.get('/subtopics', requireAuth, getSubtopics);
router.get('/subtopics/:slug', requireAuth, getSubtopicBySlug);
router.post('/subtopics', requireAuth, requireAdmin, createSubtopic);
router.put('/subtopics/:id', requireAuth, requireAdmin, updateSubtopic);
router.delete('/subtopics/:id', requireAuth, requireAdmin, deleteSubtopic);

/* Problems */
router.get('/problems', requireAuth, getProblems);
router.get('/subtopics/:slug/problems', requireAuth, getSubtopicProblems);
router.get('/problems/:slug', requireAuth, getProblemBySlug);
router.post('/problems', requireAuth, requireAdmin, createProblem);
router.put('/problems/:id', requireAuth, requireAdmin, updateProblem);
router.delete('/problems/:id', requireAuth, requireAdmin, deleteProblem);

export default router;
