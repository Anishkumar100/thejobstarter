import { create } from 'zustand';
import { fetchAptitudeMeta } from '../api/aptitudeMetaApi.js';

const DEFAULT_CATEGORIES = [
  { value: 'quantitative', label: 'Quantitative Aptitude' },
  { value: 'logical', label: 'Logical Reasoning' },
  { value: 'verbal', label: 'Verbal Ability' },
  { value: 'data-interpretation', label: 'Data Interpretation' }
];

export const useAptitudeMetaStore = create((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  loading: false,
  error: null,

  fetchAllMeta: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetchAptitudeMeta();
      const items = res.data || [];
      const categories = items
        .filter(i => i.type === 'category')
        .sort((a, b) => a.order - b.order)
        .map(i => ({ value: i.value, label: i.label }));
      set({ categories: categories.length ? categories : DEFAULT_CATEGORIES, loading: false });
    } catch (error) {
      console.error('[APT-META] Error:', error.message);
      set({ categories: DEFAULT_CATEGORIES, loading: false, error: error.message });
    }
  }
}));
