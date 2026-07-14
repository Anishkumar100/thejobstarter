import { create } from 'zustand';
import { fetchInbox, fetchThread, sendMessage, markAsRead, deleteMessage } from '../api/messageApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useMessageStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeUserId: null,
  loading: false,
  error: null,

  fetchConversations: async () => {
    console.log('[MESSAGE] Fetching inbox');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        const { conversations } = await import('../data/messages.js');
        set({ conversations, loading: false });
      } else {
        const res = await fetchInbox();
        set({ conversations: res.data, loading: false });
      }
    } catch (error) {
      console.error('[MESSAGE] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchMessages: async (userId) => {
    console.log('[MESSAGE] Fetching thread for:', userId);
    set({ loading: true, error: null, activeUserId: userId });
    try {
      if (USE_MOCK) {
        const { messages } = await import('../data/messages.js');
        const thread = messages.filter(m => m.sender === userId || m.receiver === userId);
        set({ messages: thread, loading: false });
      } else {
        const res = await fetchThread(userId);
        set({ messages: res.data, loading: false });
      }
    } catch (error) {
      console.error('[MESSAGE] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  sendMessage: async (userId, content) => {
    console.log('[MESSAGE] Sending message to:', userId);
    try {
      if (USE_MOCK) {
        const msg = { _id: Date.now().toString(), sender: 'me', receiver: userId, content, read: false, createdAt: new Date().toISOString() };
        set(state => ({ messages: [...state.messages, msg] }));
        return msg;
      }
      const res = await sendMessage(userId, { content });
      set(state => ({ messages: [...state.messages, res.data] }));
      return res.data;
    } catch (error) {
      console.error('[MESSAGE] Error sending:', error.message);
      set({ error: error.message });
    }
  },

  markRead: async (messageId) => {
    if (USE_MOCK) return;
    await markAsRead(messageId);
  },

  removeMessage: async (messageId) => {
    console.log('[MESSAGE] Deleting message:', messageId);
    if (USE_MOCK) {
      set(state => ({ messages: state.messages.filter(m => m._id !== messageId) }));
      return;
    }
    await deleteMessage(messageId);
    set(state => ({ messages: state.messages.filter(m => m._id !== messageId) }));
  }
}));
