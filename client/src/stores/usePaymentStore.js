import { create } from 'zustand';
import {
  createSubscription,
  createOrder,
  applyPromoCode,
  getSubscriptionStatus,
  cancelMySubscription,
  verifySubscription as verifySubscriptionApi,
  verifyOrder as verifyOrderApi
} from '../api/paymentApi.js';

/*
 * Cashfree JS SDK — loaded lazily (on first order) from Cashfree's CDN.
 * Required to open the pre-built hosted checkout page for one-time orders.
 */
const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

/*
 * loadCashfreeSdk()
 *
 * Injects the Cashfree JS SDK script tag once and waits for it to load.
 * Returns a promise that resolves with the global window.Cashfree function.
 * Subsequent calls reuse the already-loaded SDK.
 *
 * @returns {Promise<Function>} - window.Cashfree constructor
 */
function loadCashfreeSdk() {
  return new Promise((resolve, reject) => {
    /* Already loaded (script tag present + global available) */
    if (window.Cashfree) {
      return resolve(window.Cashfree);
    }
    const script = document.createElement('script');
    script.src = CASHFREE_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        console.log('[PAYMENT] Cashfree JS SDK loaded');
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK loaded but Cashfree is not defined'));
      }
    };
    script.onerror = () => reject(new Error('Could not load the Cashfree payment SDK. Please check your connection and try again.'));
    document.head.appendChild(script);
  });
}

/*
 * Payment Store — Zustand store for subscription state
 *
 * Provides subscription status, loading state, and actions for:
 *   - Fetching subscription status
 *   - Subscribing (one-time PG order — current flow, manual payments)
 *   - Subscribing (auto-pay Cashfree subscription — legacy flow, kept for when
 *     the Subscriptions product is activated)
 *   - Applying promo codes
 *   - Cancelling subscription
 *   - Verifying after payment return
 *
 * Components can use this store to check if the user has an active
 * subscription, display Premium badges, or redirect to pricing.
 */

export const usePaymentStore = create((set, get) => ({
  /* ─── State ─── */
  subscription: null,      // { status, planId, planName, planInterval, currentPeriodStart, currentPeriodEnd, appliedPromo }
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
   * Create a one-time PG order (manual monthly/annual payments) and open the
   * Cashfree hosted checkout page via the JS SDK.
   *
   * The browser is redirected to Cashfree's checkout; when the customer
   * returns, PaymentSuccess verifies the order (webhook fallback).
   *
   * @param {Object} params - { plan, phone, promoCode?, redirectUrl? }
   * @returns {Object} - { orderId, firstCharge, ... }
   */
  orderPayment: async (params) => {
    console.log('[PAYMENT] Creating one-time payment order...');
    set({ loading: true, error: null });
    try {
      const res = await createOrder(params);
      const { orderId, paymentSessionId, firstCharge, paymentMode } = res.data;
      console.log('[PAYMENT] Order created:', orderId, '| amount:', firstCharge, '| mode:', paymentMode);

      /* Open Cashfree's hosted checkout with the session id */
      const CashfreeSdk = await loadCashfreeSdk();
      const cashfree = new CashfreeSdk({
        mode: paymentMode === 'production' ? 'production' : 'sandbox'
      });
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self' /* return to our SPA (backend return_url 302s) */
      });

      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Error creating order:', error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /*
   * Create a new auto-pay subscription — redirects to Cashfree checkout.
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
   * Verify a one-time order after the Cashfree checkout returns.
   * @param {string} orderId - Cashfree PG order ID
   */
  verifyAfterOrder: async (orderId) => {
    console.log('[PAYMENT] Verifying order after payment:', orderId);
    set({ loading: true, error: null });
    try {
      const res = await verifyOrderApi(orderId);
      console.log('[PAYMENT] Order verification result:', res.data?.status);
      set({ subscription: res.data, loading: false });
      return res.data;
    } catch (error) {
      console.error('[PAYMENT] Order verification error:', error.message);
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
