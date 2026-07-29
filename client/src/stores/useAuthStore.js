import { create } from 'zustand';
import { getSubscriptionStatus } from '../api/paymentApi.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isPremium: false,
  subscriptionStatus: null, // 'free' | 'active' | 'canceled' | 'expired' | 'past_due'
  loading: true,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.publicMetadata?.role === 'admin',
      isPremium: !!user?.coachingCenter, /* Center-enrolled = premium access */
      loading: false
    });
    /* Fetch subscription status in background when user logs in */
    if (user) {
      get().fetchSubscriptionStatus();
    }
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false, isAdmin: false, isPremium: false, subscriptionStatus: null, loading: false });
  },

  updateUser: (updates) => {
    set(state => {
      const newUser = state.user ? { ...state.user, ...updates } : null;
      /* If coachingCenter was just set, update isPremium */
      const isPremium = updates.coachingCenter
        ? true
        : state.isPremium;
      return { user: newUser, isPremium };
    });
  },

  /*
   * Fetch subscription status from backend and sync into auth store.
   * Called automatically on login. Can also be called manually after payment.
   * Sets isPremium based on subscription status OR coaching center enrollment.
   */
  fetchSubscriptionStatus: async () => {
    console.log('[AUTH] Fetching subscription status...');
    try {
      const res = await getSubscriptionStatus();
      const sub = res.data;
      console.log('[AUTH] Subscription status:', sub?.status);
      const currentUser = get().user;
      const isActive = sub?.status === 'active';
      const hasCenter = !!currentUser?.coachingCenter;
      set({
        subscriptionStatus: sub?.status || 'free',
        isPremium: isActive || hasCenter
      });
      /* Also store subscription data on the user object for components */
      if (currentUser) {
        set({ user: { ...currentUser, subscription: sub } });
      }
    } catch (error) {
      console.error('[AUTH] Error fetching subscription:', error.message);
      /* Don't flip to false — just keep whatever we had */
    }
  }
}));
