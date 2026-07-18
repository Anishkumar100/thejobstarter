import { create } from 'zustand';
import { fetchMessages, fetchAllMessages, createMessage, updateMessage, deleteMessage } from '../api/progressMessageApi.js';

export const useProgressMessageStore = create((set, get) => ({
  messages: [],
  allMessages: [],
  loading: false,
  error: null,

  /*
   * Fetch active messages (public) — cached after first load
   */
  fetchMessages: async (force = false) => {
    const { messages } = get();
    if (messages.length > 0 && !force) return;
    console.log('[PROGRESS-MSG] Fetching active messages');
    set({ loading: true, error: null });
    try {
      const res = await fetchMessages();
      console.log('[PROGRESS-MSG] Messages loaded:', res.data?.length);
      set({ messages: res.data || [], loading: false });
    } catch (error) {
      console.error('[PROGRESS-MSG] Error fetching:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Fetch all messages (admin) — includes inactive
   */
  fetchAllMessages: async () => {
    console.log('[PROGRESS-MSG] Admin fetching all messages');
    set({ loading: true, error: null });
    try {
      const res = await fetchAllMessages();
      console.log('[PROGRESS-MSG] All messages loaded:', res.data?.length);
      set({ allMessages: res.data || [], loading: false });
    } catch (error) {
      console.error('[PROGRESS-MSG] Error fetching all:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Admin: Create a new message
   */
  createMessage: async (data) => {
    console.log('[PROGRESS-MSG] Creating message');
    const res = await createMessage(data);
    await get().fetchAllMessages();
    return res.data;
  },

  /*
   * Admin: Update an existing message
   */
  updateMessage: async (id, data) => {
    console.log('[PROGRESS-MSG] Updating message:', id);
    const res = await updateMessage(id, data);
    set(state => ({
      allMessages: state.allMessages.map(m => m._id === id ? res.data : m)
    }));
    /* Also refresh active cache so users see changes */
    set({ messages: [] });
    get().fetchMessages();
    return res.data;
  },

  /*
   * Admin: Delete a message
   */
  deleteMessage: async (id) => {
    console.log('[PROGRESS-MSG] Deleting message:', id);
    await deleteMessage(id);
    set(state => ({
      allMessages: state.allMessages.filter(m => m._id !== id),
      messages: []
    }));
    get().fetchMessages();
  }
}));
