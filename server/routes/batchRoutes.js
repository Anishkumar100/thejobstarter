/*
 * Batch Routes — Admin batch management.
 * Creation is handled by coordinators via /api/coordinator/batches,
 * but admin can assign/remove students and update batches.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';
import {
  getAllBatches, getBatchById, updateBatch, deleteBatch, regenerateBatchCode,
  assignStudentToBatch, removeStudentFromBatch,
  bulkAssignStudentsToBatch, bulkRemoveStudentsFromBatch,
  adminUpdateStudentCourse
} from '../controllers/batchController.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, getAllBatches);
router.get('/:id', requireAuth, requireAdmin, getBatchById);
router.put('/:id', requireAuth, requireAdmin, updateBatch);
router.post('/:id/regenerate-code', requireAuth, requireAdmin, regenerateBatchCode);
router.delete('/:id', requireAuth, requireAdmin, deleteBatch);
router.patch('/:id/assign-student/:userId', requireAuth, requireAdmin, assignStudentToBatch);
router.patch('/:id/remove-student/:userId', requireAuth, requireAdmin, removeStudentFromBatch);
router.post('/:id/assign-students', requireAuth, requireAdmin, bulkAssignStudentsToBatch);
router.post('/:id/remove-students', requireAuth, requireAdmin, bulkRemoveStudentsFromBatch);
router.patch('/students/:userId/course', requireAuth, requireAdmin, adminUpdateStudentCourse);

export default router;
