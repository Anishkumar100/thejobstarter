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
    console.log('[ADMIN] Fetching dashboard stats');
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
    console.log('[ADMIN] Fetching all users');
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
    console.log('[ADMIN] Seeding database...');
    try {
      await apiRequest('/admin/seed', { method: 'POST' });
      console.log('[ADMIN] Database seeded successfully');
      return true;
    } catch (error) {
      console.error('[ADMIN] Seed error:', error.message);
      set({ error: error.message });
      return false;
    }
  },

  fetchMedia: async () => {
    console.log('[ADMIN] Fetching media library');
    set({ loading: true, error: null });
    try {
      const res = await listMedia();
      set({ media: res.data, loading: false });
    } catch (error) {
      console.error('[ADMIN] Error fetching media:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  uploadMedia: async (file) => {
    console.log('[ADMIN] Uploading media...');
    await uploadMediaApi(file, file.name);
  },

  deleteMedia: async (fileId) => {
    console.log('[ADMIN] Deleting media:', fileId);
    await deleteMediaApi(fileId);
    set(state => ({ media: state.media.filter(m => m.fileId !== fileId) }));
  },

  deleteUser: async (id) => {
    console.log('[ADMIN] Deleting user:', id);
    await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
    set(state => ({ users: state.users.filter(u => u._id !== id) }));
  }
}));
