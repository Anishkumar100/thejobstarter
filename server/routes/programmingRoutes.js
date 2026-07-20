import { Router } from 'express';
import {
  getLessons, getLessonBySlug, createLesson, updateLesson, deleteLesson,
  getSubtopics, getSubtopicBySlug, createSubtopic, updateSubtopic, deleteSubtopic,
  getSubtopicProblems,
  getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem
} from '../controllers/programmingController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Lessons */
router.get('/lessons', getLessons);
router.get('/lessons/:slug', getLessonBySlug);
router.post('/lessons', requireAuth, requireAdmin, createLesson);
router.put('/lessons/:id', requireAuth, requireAdmin, updateLesson);
router.delete('/lessons/:id', requireAuth, requireAdmin, deleteLesson);

/* Subtopics */
router.get('/subtopics', getSubtopics);
router.get('/subtopics/:slug', getSubtopicBySlug);
router.post('/subtopics', requireAuth, requireAdmin, createSubtopic);
router.put('/subtopics/:id', requireAuth, requireAdmin, updateSubtopic);
router.delete('/subtopics/:id', requireAuth, requireAdmin, deleteSubtopic);

/* Problems */
router.get('/problems', getProblems);
router.get('/subtopics/:slug/problems', getSubtopicProblems);
router.get('/problems/:slug', getProblemBySlug);
router.post('/problems', requireAuth, requireAdmin, createProblem);
router.put('/problems/:id', requireAuth, requireAdmin, updateProblem);
router.delete('/problems/:id', requireAuth, requireAdmin, deleteProblem);

export default router;
