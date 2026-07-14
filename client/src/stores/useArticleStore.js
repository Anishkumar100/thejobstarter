import { create } from 'zustand';
import { articles as mockDbms } from '../data/dbms.js';
import { articles as mockOs } from '../data/os.js';
import { fetchArticles, fetchArticleBySlug, createArticle, updateArticle, deleteArticle } from '../api/articleApi.js';

import { usePageLoadingStore } from './usePageLoadingStore.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useArticleStore = create((set, get) => ({
  articles: [],
  currentArticle: null,
  loading: false,
  error: null,

  fetchArticles: async (category, filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Articles');
    console.log('[ARTICLES] Fetching articles:', category, filters);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        const source = category === 'dbms' ? mockDbms : mockOs;
        let result = [...source];
        if (filters.search) result = result.filter(a => a.title.toLowerCase().includes(filters.search.toLowerCase()));
        if (filters.topic) result = result.filter(a => a.topics.includes(filters.topic));
        set({ articles: result, loading: false });
      } else {
        const res = await fetchArticles(category, filters);
        set({ articles: res.data, loading: false });
      }
    } catch (error) {
      console.error('[ARTICLES] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Articles');
    }
  },

  fetchArticleBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Articles');
    console.log('[ARTICLES] Fetching article by slug:', slug);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        const article = [...mockDbms, ...mockOs].find(a => a.slug === slug);
        set({ currentArticle: article || null, loading: false });
      } else {
        const res = await fetchArticleBySlug(slug);
        set({ currentArticle: res.data, loading: false });
      }
    } catch (error) {
      console.error('[ARTICLES] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Articles');
    }
  },

  createArticle: async (data) => {
    if (USE_MOCK) return;
    const res = await createArticle(data);
    set(state => ({ articles: [res.data, ...state.articles] }));
    return res.data;
  },

  updateArticle: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateArticle(id, data);
    set(state => ({ articles: state.articles.map(a => a._id === id ? res.data : a) }));
    return res.data;
  },

  deleteArticle: async (id) => {
    if (USE_MOCK) return;
    await deleteArticle(id);
    set(state => ({ articles: state.articles.filter(a => a._id !== id) }));
  }
}));
