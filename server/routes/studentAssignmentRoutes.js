/*
 * Student Assignment Routes — Gated by requireAuth.
 * Students can view assignments for their batch and submit drive links.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getStudentAssignments,
  getStudentAssignmentById,
  submitAssignment,
  updateSubmission
} from '../controllers/assignmentController.js';

const router = Router();

router.get('/', requireAuth, getStudentAssignments);
router.get('/:id', requireAuth, getStudentAssignmentById);
router.post('/:id/submit', requireAuth, submitAssignment);
router.put('/:id/submission', requireAuth, updateSubmission);

export default router;
