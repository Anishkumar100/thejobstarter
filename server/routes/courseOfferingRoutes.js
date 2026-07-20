import { Router } from 'express';
import {
  createCourseOffering, getAllCourseOfferings, getCourseOfferingById,
  updateCourseOffering, deleteCourseOffering
} from '../controllers/courseOfferingController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.post('/', requireAuth, requireAdmin, createCourseOffering);
router.get('/', requireAuth, requireAdmin, getAllCourseOfferings);
router.get('/:id', requireAuth, requireAdmin, getCourseOfferingById);
router.put('/:id', requireAuth, requireAdmin, updateCourseOffering);
router.delete('/:id', requireAuth, requireAdmin, deleteCourseOffering);

export default router;
