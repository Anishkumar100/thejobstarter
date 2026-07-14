import { create } from 'zustand';

/*
 * usePageLoadingStore — global loading counter
 *
 * Every API fetch or initial page load calls start() when it begins
 * and stop() when it finishes. The PageLoader component subscribes
 * to this store and renders a full-screen loader when count > 0.
 *
 * Usage:
 *   const { start, stop } = usePageLoadingStore.getState();
 *   start('DSA');
 *   // ... async work ...
 *   stop('DSA');
 *
 * The label is optional — it's surfaced as a status message on the loader.
 */

export const usePageLoadingStore = create((set, get) => ({
  count: 0,
  activeLabels: [],   // stack of active loader labels for status display

  /*
   * Increment the loading counter.
   * @param {string} [label] — optional label shown on the loader (e.g. 'DSA', 'Blog')
   */
  start: (label) => {
    console.log(`[LOADER] start — ${label || 'anonymous'}`);
    set((state) => ({
      count: state.count + 1,
      activeLabels: label
        ? [...state.activeLabels, label]
        : state.activeLabels
    }));
  },

  /*
   * Decrement the loading counter.
   * @param {string} [label] — optional label to remove from the status stack
   */
  stop: (label) => {
    console.log(`[LOADER] stop — ${label || 'anonymous'}`);
    set((state) => ({
      count: Math.max(0, state.count - 1),
      activeLabels: label
        ? state.activeLabels.filter(l => l !== label)
        : state.activeLabels
    }));
  },

  /*
   * Force reset loading state (safety net).
   */
  reset: () => {
    console.log('[LOADER] reset');
    set({ count: 0, activeLabels: [] });
  }
}));
