/*
 * Coordinator Assignment Routes — All gated by requireAuth + requireCoordinator.
 * Automatically scoped to the coordinator's own center via req.coordinatorCenterId.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCoordinator } from '../middleware/coordinatorOnly.js';
import {
  getCoordinatorAssignments,
  getCoordinatorAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,
  bulkGradeSubmissions,
  deleteSubmission,
  deleteAllSubmissions
} from '../controllers/assignmentController.js';

const router = Router();

router.get('/', requireAuth, requireCoordinator, getCoordinatorAssignments);
router.get('/:id', requireAuth, requireCoordinator, getCoordinatorAssignmentById);
router.post('/', requireAuth, requireCoordinator, createAssignment);
router.put('/:id', requireAuth, requireCoordinator, updateAssignment);
router.delete('/:id', requireAuth, requireCoordinator, deleteAssignment);
router.put('/:id/submissions/:submissionId', requireAuth, requireCoordinator, gradeSubmission);
router.put('/:id/bulk-grade', requireAuth, requireCoordinator, bulkGradeSubmissions);
router.delete('/:id/submissions', requireAuth, requireCoordinator, deleteAllSubmissions);
router.delete('/:id/submissions/:submissionId', requireAuth, requireCoordinator, deleteSubmission);

export default router;
