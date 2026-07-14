import { Router } from 'express';
import {
  getLessons, getLessonBySlug, createLesson, updateLesson, deleteLesson,
  getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem,
  getSubtopics, getSubtopicBySlug, getSubtopicProblems, createSubtopic, updateSubtopic, deleteSubtopic
} from '../controllers/dbmsController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Lesson routes */
router.get('/lessons', getLessons);
router.get('/lessons/:slug', getLessonBySlug);
router.post('/lessons', requireAuth, requireAdmin, createLesson);
router.put('/lessons/:id', requireAuth, requireAdmin, updateLesson);
router.delete('/lessons/:id', requireAuth, requireAdmin, deleteLesson);

/* Subtopic routes */
router.get('/subtopics', getSubtopics);
router.get('/subtopics/:slug', getSubtopicBySlug);
router.get('/subtopics/:slug/problems', getSubtopicProblems);
router.post('/subtopics', requireAuth, requireAdmin, createSubtopic);
router.put('/subtopics/:id', requireAuth, requireAdmin, updateSubtopic);
router.delete('/subtopics/:id', requireAuth, requireAdmin, deleteSubtopic);

/* Problem routes */
router.get('/problems', getProblems);
router.get('/problems/:slug', getProblemBySlug);
router.post('/problems', requireAuth, requireAdmin, createProblem);
router.put('/problems/:id', requireAuth, requireAdmin, updateProblem);
router.delete('/problems/:id', requireAuth, requireAdmin, deleteProblem);

export default router;
