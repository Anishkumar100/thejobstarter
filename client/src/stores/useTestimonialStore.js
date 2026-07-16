import { create } from 'zustand';
import mockTestimonials from '../data/testimonials.js';
import { fetchTestimonials, fetchAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../api/testimonialApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useTestimonialStore = create((set, get) => ({
  testimonials: [],
  allTestimonials: [],
  loading: false,
  error: null,

  fetchTestimonials: async () => {
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        const active = mockTestimonials.filter(t => t.active).sort((a, b) => a.order - b.order);
        set({ testimonials: active, loading: false });
      } else {
        const res = await fetchTestimonials();
        set({ testimonials: res.data, loading: false });
      }
    } catch (error) {
      console.error('[TESTIMONIALS] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  fetchAllTestimonials: async () => {
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ allTestimonials: mockTestimonials, loading: false });
      } else {
        const res = await fetchAllTestimonials();
        set({ allTestimonials: res.data, loading: false });
      }
    } catch (error) {
      console.error('[TESTIMONIALS] Error:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  createTestimonial: async (data) => {
    if (USE_MOCK) return;
    const res = await createTestimonial(data);
    set(state => ({ allTestimonials: [res.data, ...state.allTestimonials] }));
    return res.data;
  },

  updateTestimonial: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateTestimonial(id, data);
    set(state => ({
      allTestimonials: state.allTestimonials.map(t => t._id === id ? res.data : t)
    }));
    return res.data;
  },

  deleteTestimonial: async (id) => {
    if (USE_MOCK) return;
    await deleteTestimonial(id);
    set(state => ({
      allTestimonials: state.allTestimonials.filter(t => t._id !== id)
    }));
  }
}));
