import { Router } from 'express';
import {
  createCenter, getCenters, getCenterById,
  updateCenter, regenerateCenterCode, deleteCenter,
  getCenterStudents, getCenterStudentById, updateCenterStudent,
  removeStudentFromCenter, getCenterCourseOfferings
} from '../controllers/coachingCenterController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.post('/', requireAuth, requireAdmin, createCenter);
router.get('/', requireAuth, requireAdmin, getCenters);
router.get('/:id', requireAuth, requireAdmin, getCenterById);
router.put('/:id', requireAuth, requireAdmin, updateCenter);
router.post('/:id/regenerate-code', requireAuth, requireAdmin, regenerateCenterCode);
router.delete('/:id', requireAuth, requireAdmin, deleteCenter);
router.get('/:id/course-offerings', requireAuth, getCenterCourseOfferings);
router.get('/:id/students', requireAuth, requireAdmin, getCenterStudents);
router.patch('/:id/students/:userId', requireAuth, requireAdmin, removeStudentFromCenter);
router.get('/:id/students/:userId', requireAuth, requireAdmin, getCenterStudentById);
router.put('/:id/students/:userId', requireAuth, requireAdmin, updateCenterStudent);

export default router;
