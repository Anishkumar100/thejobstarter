import { create } from 'zustand';
import {
  createSubscription,
  applyPromoCode,
  getSubscriptionStatus,
  cancelMySubscription,
  verifySubscription as verifySubscriptionApi
} from '../api/paymentApi.js';

/*
 * Payment Store — Zustand store for subscription state
 *
 * Provides subscription status, loading state, and actions for:
 *   - Fetching subscription status
 *   - Subscribing (creating a Cashfree subscription)
 *   - Applying promo codes
 *   - Cancelling subscription
 *   - Verifying after payment return
 *
 * Components can use this store to check if the user has an active
 * subscription, display Premium badges, or redirect to pricing.
 */

export const usePaymentStore = create((set, get) => ({
  /* ─── State ─── */
  subscription: null,      // { status, currentPeriodStart, currentPeriodEnd, appliedPromo }
  loading: false,
  error: null,
  lastFetched: null,

  /* ─── Actions ─── */

  /*
   * Fetch the current user's subscription status from the backend.
   * Called on app mount (via AuthSync) and after payment success.
   */
  fetchStatus: async () => {
    console.log('[PAYMENT] Fetching subscription status...');
    set({ loading: true, error: null });
    try {
      const res = await getSubscriptionStatus();
      console.log('[PAYMENT] Status fetched:', res.data?.status);
      set({
        subscription: res.data,
        loading: false,
        lastFetched: new Date().toISOString()
      });
      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Error fetching status:', error.message);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  /*
   * Create a new subscription — redirects to Cashfree checkout.
   * @param {Object} params - { plan, phone, promoCode?, redirectUrl? }
   * Returns the Cashfree payment link and session ID for redirect.
   */
  subscribe: async (params) => {
    console.log('[PAYMENT] Creating subscription...');
    set({ loading: true, error: null });
    try {
      const res = await createSubscription(params);
      const { payLink, subscriptionSessionId, firstCharge } = res.data;
      console.log('[PAYMENT] Subscription created, redirecting to:', payLink);

      /* Cashfree v6 requires a POST form with subs_session_id */
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payLink;
      form.target = '_self';
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'subs_session_id';
      input.value = subscriptionSessionId;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();

      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Error creating subscription:', error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /*
   * Apply a promo code to get discounted price.
   * @param {string} code - Promo code to validate
   * @returns {Object} { valid, discountedPrice, description, ... }
   */
  checkPromo: async (code) => {
    console.log('[PAYMENT] Checking promo code:', code);
    set({ error: null });
    try {
      const res = await applyPromoCode(code);
      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Promo error:', error.message);
      return { valid: false, error: error.message };
    }
  },

  /*
   * Cancel the current user's active subscription.
   * User keeps access until currentPeriodEnd.
   */
  cancel: async () => {
    console.log('[PAYMENT] Cancelling subscription...');
    set({ loading: true, error: null });
    try {
      const res = await cancelMySubscription();
      console.log('[PAYMENT] Subscription cancelled, access until:', res.data?.accessUntil);
      /* Refresh status to reflect cancellation */
      await get().fetchStatus();
      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Error cancelling:', error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /*
   * Verify a subscription after payment return (webhook fallback).
   * @param {string} subscriptionId - Cashfree subscription ID
   */
  verifyAfterPayment: async (subscriptionId) => {
    console.log('[PAYMENT] Verifying subscription after payment:', subscriptionId);
    set({ loading: true, error: null });
    try {
      const res = await verifySubscriptionApi(subscriptionId);
      console.log('[PAYMENT] Verification result:', res.data?.status);
      set({ subscription: res.data, loading: false });
      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Verification error:', error.message);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  /*
   * Clear any payment error (e.g. after user dismisses error message)
   */
  clearError: () => set({ error: null }),

  /*
   * Reset the entire store (e.g. on logout)
   */
  reset: () => set({
    subscription: null,
    loading: false,
    error: null,
    lastFetched: null
  })
}));
