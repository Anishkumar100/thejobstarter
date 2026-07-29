/*
 * Payment Routes — Cashfree Subscription API endpoints
 *
 * POST   /api/payments/create-subscription   Create a Cashfree subscription order
 * POST   /api/payments/webhook                Cashfree webhook handler (raw body)
 * POST   /api/payments/apply-promo            Validate a promo code
 * GET    /api/payments/status                 Get current subscription status
 * POST   /api/payments/cancel                 Cancel active subscription
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createSubscription,
  handleWebhook,
  handlePaymentReturn,
  applyPromo,
  getSubscriptionStatus,
  verifySubscription,
  cancelSubscription
} from '../controllers/paymentController.js';

const router = Router();

/*
 * Webhook endpoint MUST use express.raw() to preserve the raw JSON body
 * for Cashfree webhook signature verification.
 * The route-level middleware is set in app.js (see app.use('/api/payments/webhook', ...)).
 */
router.post('/webhook', handleWebhook);

/*
 * Payment return handler — no auth required.
 * Cashfree redirects the browser here (GET or POST). We just redirect (302)
 * to the frontend SPA which loads React Router and handles the route.
 */
router.all('/return', handlePaymentReturn);

/*
 * All other payment endpoints require authentication.
 * User must be logged in to create/subscribe/check/cancel.
 */
router.post('/create-subscription', requireAuth, createSubscription);
router.post('/verify-subscription', requireAuth, verifySubscription);
router.post('/apply-promo', requireAuth, applyPromo);
router.get('/status', requireAuth, getSubscriptionStatus);
router.post('/cancel', requireAuth, cancelSubscription);

export default router;
