import { Router } from 'express';
import { getStats, getPublicStats, getAllUsers, updateUser, deleteUser, seedDatabase, exportUsersCsv, getBatchPlanStats, getPaymentStats, getAllSubscriptions, activateSubscription, deactivateSubscription, cancelSubscription, getTransactionHistory, getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminOnly.js';

const router = Router();

/* Public stats endpoint for homepage (no auth) */
router.get('/public-stats', getPublicStats);

router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/batch-plan-stats', requireAuth, requireAdmin, getBatchPlanStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.put('/users/:id', requireAuth, requireAdmin, updateUser);
router.get('/users/export', requireAuth, requireAdmin, exportUsersCsv);
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser);
router.post('/seed', requireAuth, requireAdmin, seedDatabase);

/* ─── Payment Admin Routes ─── */
router.get('/payments/stats', requireAuth, requireAdmin, getPaymentStats);
router.get('/payments/subscriptions', requireAuth, requireAdmin, getAllSubscriptions);
router.post('/payments/subscriptions/:userId/activate', requireAuth, requireAdmin, activateSubscription);
router.post('/payments/subscriptions/:userId/deactivate', requireAuth, requireAdmin, deactivateSubscription);
router.post('/payments/subscriptions/:userId/cancel', requireAuth, requireAdmin, cancelSubscription);
router.get('/payments/transactions', requireAuth, requireAdmin, getTransactionHistory);

/* ─── Promo Code CRUD ─── */
router.get('/promos', requireAuth, requireAdmin, getPromoCodes);
router.post('/promos', requireAuth, requireAdmin, createPromoCode);
router.put('/promos/:id', requireAuth, requireAdmin, updatePromoCode);
router.delete('/promos/:id', requireAuth, requireAdmin, deletePromoCode);

export default router;
