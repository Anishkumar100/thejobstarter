import { create } from 'zustand';
import { languages as mockLanguages } from '../data/languages.js';
import { fetchLanguages, createLanguage, updateLanguage, deleteLanguage } from '../api/languageApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useLanguageStore = create((set, get) => ({
  languages: [],
  loading: false,
  error: null,

  fetchLanguages: async () => {
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ languages: mockLanguages, loading: false });
      } else {
        const res = await fetchLanguages();
        set({ languages: res.data, loading: false });
      }
    } catch (error) {
      console.error('[LANG] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  createLanguage: async (data) => {
    if (USE_MOCK) return;
    const res = await createLanguage(data);
    set(state => ({ languages: [...state.languages, res.data] }));
    return res.data;
  },

  updateLanguage: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateLanguage(id, data);
    set(state => ({ languages: state.languages.map(l => l._id === id ? res.data : l) }));
    return res.data;
  },

  deleteLanguage: async (id) => {
    if (USE_MOCK) return;
    await deleteLanguage(id);
    set(state => ({ languages: state.languages.filter(l => l._id !== id) }));
  }
}));
