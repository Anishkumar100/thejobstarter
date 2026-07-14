import { Router } from 'express';
import { getActiveTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', getActiveTestimonials);
router.get('/all', requireAuth, requireAdmin, getAllTestimonials);
router.post('/', requireAuth, requireAdmin, createTestimonial);
router.put('/:id', requireAuth, requireAdmin, updateTestimonial);
router.delete('/:id', requireAuth, requireAdmin, deleteTestimonial);

export default router;
