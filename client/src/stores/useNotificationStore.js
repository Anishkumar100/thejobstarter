import { create } from 'zustand';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsRead, deleteNotification } from '../api/notificationApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/* Track dismissed synthetic notifications in localStorage so they stay gone across refreshes */
const DISMISSED_KEY = 'tw_dismissed_notifs';
function getDismissed() {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); }
  catch { return new Set(); }
}
function addDismissed(id) {
  const s = getDismissed();
  s.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s]));
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  /*
   * Fetch notifications for the current user
   */
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ notifications: [], unreadCount: 0, loading: false });
        return;
      }
      const res = await fetchNotifications();
      const dismissed = getDismissed();
      /* Filter out dismissed synthetic notifications */
      const filtered = (res.data || []).filter(n => !(n._directQuery && dismissed.has(n._id)));
      set({ notifications: filtered, unreadCount: res.unreadCount || 0, loading: false });
    } catch (error) {
      console.error('[NOTIFICATION] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Mark a single notification as read
   */
  markRead: async (id) => {
    if (USE_MOCK) return;

    /* For synthetic notifications, just mark read locally and dismiss permanently */
    if (typeof id === 'string' && id.startsWith('q_')) {
      addDismissed(id);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
      return;
    }

    /* For real notifications, also pre-dismiss the synthetic counterpart */
    const existing = get().notifications.find(n => n._id === id);
    if (existing?.questionId) {
      addDismissed(`q_${existing.questionId}`);
    }

    try {
      await markNotificationAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n => n._id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('[NOTIFICATION] Error marking read:', error.message);
    }
  },

  /*
   * Mark all notifications as read
   */
  markAllRead: async () => {
    if (USE_MOCK) return;
    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error('[NOTIFICATION] Error marking all read:', error.message);
    }
    /* Permanently dismiss all synthetic notifications */
    const state = get();
    state.notifications.forEach(n => {
      if (n._directQuery) {
        addDismissed(n._id);
      } else if (n.questionId) {
        /* Also dismiss synthetic counterpart for real notifications */
        addDismissed(`q_${n.questionId}`);
      }
    });
    set(state => ({
      notifications: state.notifications.filter(n => !n._directQuery).map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  /*
   * Delete a notification
   * Synthetic notifications (from direct query, prefixed with 'q_') are only removed locally
   */
  removeNotification: async (id) => {
    if (USE_MOCK) return;

    /* For synthetic notifications, dismiss permanently via localStorage */
    if (typeof id === 'string' && id.startsWith('q_')) {
      addDismissed(id);
      const n = get().notifications.find(n => n._id === id);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: state.unreadCount - (n && !n.read ? 1 : 0)
      }));
      return;
    }

    /* For real Notification docs, also dismiss the synthetic counterpart
       so the direct query doesn't regenerate it on next fetch */
    const existing = get().notifications.find(n => n._id === id);
    if (existing?.questionId) {
      addDismissed(`q_${existing.questionId}`);
    }

    try {
      await deleteNotification(id);
      const n = get().notifications.find(n => n._id === id);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: state.unreadCount - (n && !n.read ? 1 : 0)
      }));
    } catch (error) {
      console.error('[NOTIFICATION] Error deleting:', error.message);
    }
  }
}));
