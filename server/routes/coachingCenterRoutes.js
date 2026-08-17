import { Router } from 'express';
import {
  createCenter, getCenters, getCenterById,
  updateCenter, regenerateCenterCode, deleteCenter,
  getCenterStudents, getCenterStudentById, updateCenterStudent,
  removeStudentFromCenter, getCenterCourseOfferings
} from '../controllers/coachingCenterController.js';
import { getCenterPlans, getCenterPlansWithAssignments } from '../controllers/planController.js';
import {
  getCenterFaculties, promoteCenterStudentToFaculty, revokeCenterFaculty, updateCenterFacultyBatches
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.post('/', requireAuth, requireAdmin, createCenter);
router.get('/', requireAuth, requireAdmin, getCenters);
router.get('/:id', requireAuth, requireAdmin, getCenterById);
router.put('/:id', requireAuth, requireAdmin, updateCenter);
router.post('/:id/regenerate-code', requireAuth, requireAdmin, regenerateCenterCode);
router.delete('/:id', requireAuth, requireAdmin, deleteCenter);
router.get('/:id/plans', requireAuth, requireAdmin, getCenterPlans);
router.get('/:id/plan-assignments', requireAuth, requireAdmin, getCenterPlansWithAssignments);
router.get('/:id/course-offerings', requireAuth, getCenterCourseOfferings);
router.get('/:id/students', requireAuth, requireAdmin, getCenterStudents);
router.patch('/:id/students/:userId', requireAuth, requireAdmin, removeStudentFromCenter);
router.get('/:id/students/:userId', requireAuth, requireAdmin, getCenterStudentById);
router.put('/:id/students/:userId', requireAuth, requireAdmin, updateCenterStudent);

/* ── Faculty management (center-scoped, Mongo-only) ── */
router.get('/:id/faculties', requireAuth, requireAdmin, getCenterFaculties);
router.post('/:id/students/:userId/promote', requireAuth, requireAdmin, promoteCenterStudentToFaculty);
router.post('/:id/students/:userId/revoke-faculty', requireAuth, requireAdmin, revokeCenterFaculty);
router.put('/:id/faculties/:userId/batches', requireAuth, requireAdmin, updateCenterFacultyBatches);

export default router;
