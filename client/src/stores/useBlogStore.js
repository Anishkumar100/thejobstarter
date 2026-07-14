import { create } from 'zustand';
import { posts as mockPosts } from '../data/blog.js';
import { fetchPosts, fetchPostBySlug, createPost, updatePost, deletePost } from '../api/blogApi.js';

import { usePageLoadingStore } from './usePageLoadingStore.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useBlogStore = create((set, get) => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,

  fetchPosts: async (filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Blog');
    console.log('[BLOG] Fetching posts');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ posts: mockPosts, loading: false });
      } else {
        const res = await fetchPosts(filters);
        set({ posts: res.data, loading: false });
      }
    } catch (error) {
      console.error('[BLOG] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Blog');
    }
  },

  fetchPostBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Blog');
    console.log('[BLOG] Fetching post by slug:', slug);
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        const post = mockPosts.find(p => p.slug === slug);
        set({ currentPost: post || null, loading: false });
      } else {
        const res = await fetchPostBySlug(slug);
        set({ currentPost: res.data, loading: false });
      }
    } catch (error) {
      console.error('[BLOG] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Blog');
    }
  },

  createPost: async (data) => {
    if (USE_MOCK) return;
    const res = await createPost(data);
    set(state => ({ posts: [res.data, ...state.posts] }));
    return res.data;
  },

  updatePost: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updatePost(id, data);
    set(state => ({ posts: state.posts.map(p => p._id === id ? res.data : p) }));
    return res.data;
  },

  deletePost: async (id) => {
    if (USE_MOCK) return;
    await deletePost(id);
    set(state => ({ posts: state.posts.filter(p => p._id !== id) }));
  }
}));
