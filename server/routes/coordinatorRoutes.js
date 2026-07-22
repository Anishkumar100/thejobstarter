/*
 * Coordinator Routes — All gated by requireAuth + requireCoordinator.
 * No route accepts a center ID from params or query (per rule 4).
 * The center ID is always read from req.coordinatorCenterId set by middleware.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCoordinator } from '../middleware/coordinatorOnly.js';
import { getStudents, getStats, getStudentById, updateStudent, removeStudent, exportCoordinatorCsv, getCoordinatorBatches, createCoordinatorBatch, updateCoordinatorBatch, deleteCoordinatorBatch, assignStudentToBatch, removeStudentFromBatch, bulkAssignStudentsToBatch, bulkRemoveStudentsFromBatch, getCoordinatorCourseOfferings, createCoordinatorCourseOffering, updateCoordinatorCourseOffering, deleteCoordinatorCourseOffering, updateStudentCourse } from '../controllers/coordinatorController.js';
import { getCoordinatorPlans, getCoordinatorPlanById, createCoordinatorPlan, updateCoordinatorPlan, deleteCoordinatorPlan, getBatchesWithPlans } from '../controllers/planController.js';

const router = Router();

/* All coordinator routes require both auth and coordinator role */
router.get('/students', requireAuth, requireCoordinator, getStudents);
router.get('/students/:userId', requireAuth, requireCoordinator, getStudentById);
router.patch('/students/:userId', requireAuth, requireCoordinator, updateStudent);
router.patch('/students/:userId/remove', requireAuth, requireCoordinator, removeStudent);
router.patch('/students/:userId/batch', requireAuth, requireCoordinator, assignStudentToBatch);
router.patch('/students/:userId/batch/remove', requireAuth, requireCoordinator, removeStudentFromBatch);
router.get('/stats', requireAuth, requireCoordinator, getStats);
router.get('/export', requireAuth, requireCoordinator, exportCoordinatorCsv);
router.get('/batches', requireAuth, requireCoordinator, getCoordinatorBatches);
router.post('/batches', requireAuth, requireCoordinator, createCoordinatorBatch);
router.patch('/batches/:id', requireAuth, requireCoordinator, updateCoordinatorBatch);
router.delete('/batches/:id', requireAuth, requireCoordinator, deleteCoordinatorBatch);
router.post('/batches/:id/assign-students', requireAuth, requireCoordinator, bulkAssignStudentsToBatch);
router.post('/batches/:id/remove-students', requireAuth, requireCoordinator, bulkRemoveStudentsFromBatch);

/* Course-offering routes */
router.get('/course-offerings', requireAuth, requireCoordinator, getCoordinatorCourseOfferings);
router.post('/course-offerings', requireAuth, requireCoordinator, createCoordinatorCourseOffering);
router.patch('/course-offerings/:id', requireAuth, requireCoordinator, updateCoordinatorCourseOffering);
router.delete('/course-offerings/:id', requireAuth, requireCoordinator, deleteCoordinatorCourseOffering);

/* Student course change */
router.patch('/students/:userId/course', requireAuth, requireCoordinator, updateStudentCourse);

/* ── Plan routes (scoped to own center) ── */
router.get('/plans', requireAuth, requireCoordinator, getCoordinatorPlans);
router.get('/plans/:id', requireAuth, requireCoordinator, getCoordinatorPlanById);
router.post('/plans', requireAuth, requireCoordinator, createCoordinatorPlan);
router.put('/plans/:id', requireAuth, requireCoordinator, updateCoordinatorPlan);
router.delete('/plans/:id', requireAuth, requireCoordinator, deleteCoordinatorPlan);

/* ── Batch progress (for dashboard) ── */
router.get('/batches/progress', requireAuth, requireCoordinator, getBatchesWithPlans);

export default router;
