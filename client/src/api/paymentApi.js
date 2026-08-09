import { apiRequest } from './client.js';

/*
 * Payment API Client
 *
 * Wraps all /payments and /admin/payments endpoints for subscription management.
 * Used by usePaymentStore and admin pages.
 */

/* ─── Public / User-Facing Payment Endpoints ─── */

/*
 * Create a new subscription via Cashfree
 * @param {Object} data - { plan, phone, promoCode?, redirectUrl? }
 */
export function createSubscription(data) {
  return apiRequest('/payments/create-subscription', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/*
 * Create a one-time Payment Gateway order (manual monthly/annual payments)
 * @param {Object} data - { plan, phone, promoCode?, redirectUrl? }
 * Returns { orderId, paymentSessionId, firstCharge, paymentMode }
 */
export function createOrder(data) {
  return apiRequest('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/*
 * Validate a promo code and get the discounted price
 * @param {string} code - The promo code to validate
 */
export function applyPromoCode(code) {
  return apiRequest('/payments/apply-promo', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

/*
 * Get the current user's subscription status
 */
export function getSubscriptionStatus() {
  return apiRequest('/payments/status');
}

/*
 * Cancel the current user's active subscription
 */
export function cancelMySubscription() {
  return apiRequest('/payments/cancel', { method: 'POST' });
}

/*
 * Verify a subscription after payment return (webhook fallback)
 * @param {string} subscriptionId - Cashfree subscription ID
 */
export function verifySubscription(subscriptionId) {
  return apiRequest('/payments/verify-subscription', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId })
  });
}

/*
 * Verify a one-time order after the Cashfree checkout returns
 * @param {string} orderId - Cashfree PG order ID
 */
export function verifyOrder(orderId) {
  return apiRequest('/payments/verify-subscription', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  });
}

/* ─── Admin Payment Endpoints ─── */

/*
 * Get payment dashboard stats
 */
export function getPaymentStats() {
  return apiRequest('/admin/payments/stats');
}

/*
 * List all subscriptions (admin)
 * @param {Object} params - { page?, limit?, status? }
 */
export function getAllSubscriptions(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/admin/payments/subscriptions?${qs}`);
}

/*
 * Manually activate a user's subscription (admin)
 * @param {string} userId - MongoDB User _id
 * @param {number} months - Number of months to activate for
 */
export function activateUserSubscription(userId, months) {
  return apiRequest(`/admin/payments/subscriptions/${userId}/activate`, {
    method: 'POST',
    body: JSON.stringify({ months })
  });
}

/*
 * Cancel a user's subscription (admin — access until period end)
 * @param {string} userId - MongoDB User _id
 */
export function cancelUserSubscription(userId) {
  return apiRequest(`/admin/payments/subscriptions/${userId}/cancel`, {
    method: 'POST'
  });
}

/*
 * Immediately deactivate a user's subscription (admin)
 * @param {string} userId - MongoDB User _id
 */
export function deactivateUserSubscription(userId) {
  return apiRequest(`/admin/payments/subscriptions/${userId}/deactivate`, {
    method: 'POST'
  });
}

/*
 * Get transaction history (admin)
 * @param {Object} params - { page?, limit?, type?, status? }
 */
export function getTransactionHistory(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/admin/payments/transactions?${qs}`);
}

/* ─── Site Config Endpoints ─── */

/*
 * Get current subscription settings (price, durationDays)
 */
export function getSubscriptionConfig() {
  return apiRequest('/site-config/subscription');
}

/*
 * Get public subscription config (no auth required)
 */
export function getPublicSubscriptionConfig() {
  return apiRequest('/site-config/subscription/public');
}

/*
 * Get pricing plans
 */
export function getPricingPlans() {
  return apiRequest('/site-config/pricing');
}
