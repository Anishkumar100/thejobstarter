import { create } from 'zustand';

/*
 * Global toast notification store
 * Supports: success, error, info variants
 * Auto-dismisses after 4 seconds
 */
export const useToastStore = create((set, get) => ({
  toasts: [],

  /*
   * Add a toast notification
   * @param {string} message - The message to display
   * @param {'success'|'error'|'info'} type - Visual style
   */
  addToast: (message, type = 'info') => {
    const id = Date.now() + Math.random();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    /* Auto-dismiss after 4 seconds */
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  /* Convenience methods */
  success: (message) => get().addToast(message, 'success'),
  error: (message) => get().addToast(message, 'error'),
  info: (message) => get().addToast(message, 'info')
}));
