import { create } from 'zustand';
import { markComplete as markCompleteApi, fetchProgressSummary as fetchSummaryApi, fetchDailyCount as fetchDailyCountApi } from '../api/progressApi.js';

export const useProgressStore = create((set, get) => ({
  summary: null,
  dailyCount: 0,
  loading: false,
  error: null,

  /*
   * Fetch the authenticated user's progress summary (per-subject completed/total)
   */
  fetchSummary: async () => {
    console.log('[PROGRESS] Fetching summary...');
    set({ loading: true, error: null });
    try {
      const res = await fetchSummaryApi();
      console.log('[PROGRESS] Summary fetched');
      set({ summary: res.data, loading: false });
    } catch (error) {
      console.error('[PROGRESS] Error fetching summary:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Fetch how many items the user marked complete today
   */
  fetchDailyCount: async () => {
    try {
      const res = await fetchDailyCountApi();
      set({ dailyCount: res.data?.count || 0 });
    } catch (error) {
      console.error('[PROGRESS] Error fetching daily count:', error.message);
    }
  },

  /*
   * Mark a lesson/subtopic/problem as complete for the current user
   */
  markComplete: async (subject, targetType, targetSlug) => {
    console.log('[PROGRESS] Marking complete:', subject, targetType, targetSlug);
    try {
      await markCompleteApi(subject, targetType, targetSlug);
      /* Refresh summary and daily count to reflect the new completion */
      await Promise.all([
        get().fetchSummary(),
        get().fetchDailyCount()
      ]);
    } catch (error) {
      console.error('[PROGRESS] Error marking complete:', error.message);
    }
  }
}));
