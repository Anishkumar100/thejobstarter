import { create } from 'zustand';
import { apiRequest } from '../api/client.js';
import { uploadMedia as uploadMediaApi, listMedia, deleteMedia as deleteMediaApi } from '../api/mediaApi.js';

export const useAdminStore = create((set, get) => ({
  stats: null,
  users: [],
  media: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest('/admin/stats');
      set({ stats: res.data, loading: false });
    } catch (error) {
      console.error('[ADMIN] Error fetching stats:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest('/admin/users');
      set({ users: res.data, loading: false });
    } catch (error) {
      console.error('[ADMIN] Error fetching users:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  seedDatabase: async () => {
    try {
      await apiRequest('/admin/seed', { method: 'POST' });
      return true;
    } catch (error) {
      console.error('[ADMIN] Seed error:', error.message);
      set({ error: error.message });
      return false;
    }
  },

  fetchMedia: async () => {
    set({ loading: true, error: null });
    try {
      const res = await listMedia();
      set({ media: res.data, loading: false });
    } catch (error) {
      console.error('[ADMIN] Error fetching media:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  uploadMedia: async ({ file, fileName }) => {
    await uploadMediaApi(file, fileName);
  },

  deleteMedia: async (fileId) => {
    await deleteMediaApi(fileId);
    set(state => ({ media: state.media.filter(m => m.fileId !== fileId) }));
  },

  deleteUser: async (id) => {
    await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
    set(state => ({ users: state.users.filter(u => u._id !== id) }));
  },

  fetchUserById: async (id) => {
    const res = await apiRequest(`/admin/users?_id=${id}`);
    return res.data?.[0] || null;
  },

  updateUser: async (id, data) => {
    const res = await apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return res.data;
  }
}));
