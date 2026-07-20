import { create } from 'zustand';
import { fetchProgrammingMeta } from '../api/programmingMetaApi.js';

const DEFAULT_CATEGORIES = [
  { value: 'core', label: 'Core' },
  { value: 'fundamentals', label: 'Fundamentals' },
  { value: 'oops', label: 'OOPs' },
  { value: 'advanced', label: 'Advanced' }
];

export const useProgrammingMetaStore = create((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  loading: false,
  error: null,

  fetchAllMeta: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetchProgrammingMeta();
      const items = res.data || [];
      const categories = items
        .filter(i => i.type === 'category')
        .sort((a, b) => a.order - b.order)
        .map(i => ({ value: i.value, label: i.label }));
      set({ categories: categories.length ? categories : DEFAULT_CATEGORIES, loading: false });
    } catch (error) {
      console.error('[PROG-META] Error:', error.message);
      set({ categories: DEFAULT_CATEGORIES, loading: false, error: error.message });
    }
  }
}));
