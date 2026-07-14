import { create } from 'zustand';
import { cheatsheets as mockCheatsheets } from '../data/cheatsheets.js';
import { fetchCheatsheets, downloadCheatsheet, createCheatsheet, updateCheatsheet, deleteCheatsheet } from '../api/cheatsheetApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useCheatsheetStore = create((set, get) => ({
  cheatsheets: [],
  loading: false,
  error: null,

  fetchCheatsheets: async (filters = {}) => {
    console.log('[CHEATSHEET] Fetching cheatsheets');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        let result = [...mockCheatsheets];
        if (filters.category) result = result.filter(c => c.category === filters.category);
        set({ cheatsheets: result, loading: false });
      } else {
        const res = await fetchCheatsheets(filters);
        set({ cheatsheets: res.data, loading: false });
      }
    } catch (error) {
      console.error('[CHEATSHEET] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  downloadCheatsheet: async (slug) => {
    console.log('[CHEATSHEET] Downloading:', slug);
    if (USE_MOCK) {
      const cs = mockCheatsheets.find(c => c.slug === slug);
      if (cs?.pdfUrl) window.open(cs.pdfUrl, '_blank');
      return;
    }
    const res = await downloadCheatsheet(slug);
    if (res.url) window.open(res.url, '_blank');
  },

  createCheatsheet: async (data) => {
    if (USE_MOCK) return;
    const res = await createCheatsheet(data);
    set(state => ({ cheatsheets: [...state.cheatsheets, res.data] }));
    return res.data;
  },

  updateCheatsheet: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateCheatsheet(id, data);
    set(state => ({ cheatsheets: state.cheatsheets.map(c => c._id === id ? res.data : c) }));
    return res.data;
  },

  deleteCheatsheet: async (id) => {
    if (USE_MOCK) return;
    await deleteCheatsheet(id);
    set(state => ({ cheatsheets: state.cheatsheets.filter(c => c._id !== id) }));
  }
}));
