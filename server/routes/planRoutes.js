/*
 * Plan Routes — Admin CRUD + content hierarchy + batch plan assignment
 *
 * Public/Protected split:
 *   - Hierarchy and content-search are public (needed by admin & coordinator builders)
 *   - Plan CRUD requires admin auth
 *   - Batch assign/unassign requires auth (used by admin & coordinator)
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';
import {
  getPlans, getPlanById, createPlan, updatePlan, deletePlan,
  getContentHierarchy, searchContent,
  assignPlanToBatch, unassignPlanFromBatch, getActivePlanForBatch,
  getPlanAssignments, getDayProgressBreakdown, getBatchDayProgress
} from '../controllers/planController.js';

const router = Router();

/* ── Public / Semi-public ── */
router.get('/hierarchy', getContentHierarchy);          /* GET /api/plans/hierarchy?subject=dsa */
router.get('/content-search', searchContent);             /* GET /api/plans/content-search?subject=dsa&q=array */

/* ── Admin CRUD ── */
router.get('/', requireAuth, requireAdmin, getPlans);
router.get('/:id', requireAuth, requireAdmin, getPlanById);
router.post('/', requireAuth, requireAdmin, createPlan);
router.put('/:id', requireAuth, requireAdmin, updatePlan);
router.delete('/:id', requireAuth, requireAdmin, deletePlan);

/* ── Plan assignments (which batches use this plan) ── */
router.get('/:id/assignments', requireAuth, getPlanAssignments);

/* ── Day-by-day progress breakdown ── */
router.get('/:planId/day-progress/:batchId/:userId', requireAuth, getDayProgressBreakdown);
router.get('/:planId/day-progress/:batchId', requireAuth, getBatchDayProgress);

/* ── Batch plan assignment (used by admin) ── */
router.post('/batches/:id/assign-plan', requireAuth, assignPlanToBatch);
router.delete('/batches/:id/unassign-plan', requireAuth, unassignPlanFromBatch);
router.get('/batches/:id/active-plan', requireAuth, getActivePlanForBatch);

export default router;
