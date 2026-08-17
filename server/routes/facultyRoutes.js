/*
 * Faculty Routes — All gated by requireAuth + requireFaculty.
 * No route accepts a center ID or batch scope from params — scope always
 * comes from req.facultyBatchIds / req.facultyCenterId set by the middleware.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireFaculty } from '../middleware/facultyOnly.js';
import {
  getFacultyBatches,
  getFacultyBatchById,
  getFacultyBatchesProgress,
  getFacultyStudents,
  getFacultyStudentById,
  getFacultyStats,
  exportFacultyCsv,
  getFacultyPlans,
  getFacultyPlanById,
  getFacultyPlanAssignments,
  createFacultyPlan,
  updateFacultyPlan,
  deleteFacultyPlan,
  assignFacultyPlanToBatch,
  unassignFacultyPlanFromBatch,
  getFacultyActivePlanForBatch,
  getFacultyBatchDayProgress,
  getFacultyAssignments,
  getFacultyAssignmentById,
  createFacultyAssignment,
  updateFacultyAssignment,
  deleteFacultyAssignment,
  bulkGradeFacultySubmissions,
  gradeFacultySubmission
} from '../controllers/facultyController.js';

const router = Router();

/* Batches (view only) */
router.get('/batches', requireAuth, requireFaculty, getFacultyBatches);
router.get('/batches/progress', requireAuth, requireFaculty, getFacultyBatchesProgress);
router.get('/batches/:id', requireAuth, requireFaculty, getFacultyBatchById);

/* Students (view + export only) */
router.get('/students', requireAuth, requireFaculty, getFacultyStudents);
router.get('/students/:id', requireAuth, requireFaculty, getFacultyStudentById);

/* Dashboard / stats */
router.get('/stats', requireAuth, requireFaculty, getFacultyStats);
router.get('/export', requireAuth, requireFaculty, exportFacultyCsv);

/* Plans */
router.get('/plans', requireAuth, requireFaculty, getFacultyPlans);
router.get('/plans/:id/assignments', requireAuth, requireFaculty, getFacultyPlanAssignments);
router.get('/plans/:id', requireAuth, requireFaculty, getFacultyPlanById);
router.post('/plans', requireAuth, requireFaculty, createFacultyPlan);
router.put('/plans/:id', requireAuth, requireFaculty, updateFacultyPlan);
router.delete('/plans/:id', requireAuth, requireFaculty, deleteFacultyPlan);

/* Plan assign/unassign (own batches only) */
router.post('/batches/:id/assign-plan', requireAuth, requireFaculty, assignFacultyPlanToBatch);
router.delete('/batches/:id/unassign-plan', requireAuth, requireFaculty, unassignFacultyPlanFromBatch);

/* Plan progress for own batches (faculty mirrors of the admin/coordinator endpoints) */
router.get('/batches/:id/active-plan', requireAuth, requireFaculty, getFacultyActivePlanForBatch);
router.get('/batches/:batchId/day-progress/:planId', requireAuth, requireFaculty, getFacultyBatchDayProgress);

/* Assignments (full CRUD + grading, batch-scoped) */
router.get('/assignments', requireAuth, requireFaculty, getFacultyAssignments);
router.get('/assignments/:id', requireAuth, requireFaculty, getFacultyAssignmentById);
router.post('/assignments', requireAuth, requireFaculty, createFacultyAssignment);
router.put('/assignments/:id', requireAuth, requireFaculty, updateFacultyAssignment);
router.delete('/assignments/:id', requireAuth, requireFaculty, deleteFacultyAssignment);
router.put('/assignments/:id/bulk-grade', requireAuth, requireFaculty, bulkGradeFacultySubmissions);
router.put('/assignments/:id/submissions/:submissionId', requireAuth, requireFaculty, gradeFacultySubmission);

export default router;