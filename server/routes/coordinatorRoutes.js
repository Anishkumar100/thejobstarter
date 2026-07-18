/*
 * Coordinator Routes — All gated by requireAuth + requireCoordinator.
 * No route accepts a center ID from params or query (per rule 4).
 * The center ID is always read from req.coordinatorCenterId set by middleware.
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireCoordinator } from '../middleware/coordinatorOnly.js';
import { getStudents, getStats, getStudentById, updateStudent, removeStudent, exportCoordinatorCsv } from '../controllers/coordinatorController.js';

const router = Router();

/* All coordinator routes require both auth and coordinator role */
router.get('/students', requireAuth, requireCoordinator, getStudents);
router.get('/students/:userId', requireAuth, requireCoordinator, getStudentById);
router.patch('/students/:userId', requireAuth, requireCoordinator, updateStudent);
router.patch('/students/:userId/remove', requireAuth, requireCoordinator, removeStudent);
router.get('/stats', requireAuth, requireCoordinator, getStats);
router.get('/export', requireAuth, requireCoordinator, exportCoordinatorCsv);

export default router;
