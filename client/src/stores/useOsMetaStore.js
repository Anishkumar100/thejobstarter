import { create } from 'zustand';
import { fetchOsMeta, createOsMeta, updateOsMeta, deleteOsMeta, seedOsMeta } from '../api/osMetaApi.js';

/*
 * OS categories fallback — used when the API is unavailable
 */
const OS_CATEGORIES_FALLBACK = [
  { value: 'operating-systems', label: 'Operating Systems' },
  { value: 'memory-management', label: 'Memory Management' },
  { value: 'storage-file-systems', label: 'Storage & File Systems' }
];

/*
 * useOsMetaStore — mirrors useDbmsMetaStore for OS categories, topics, and companies
 */
export const useOsMetaStore = create((set, get) => ({
  categories: OS_CATEGORIES_FALLBACK,
  topics: [],
  companies: [],
  loading: false,
  error: null,

  /*
   * Fetch all OS meta from backend and split by type
   */
  fetchAllMeta: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetchOsMeta();
      const items = res.data || [];

      const categories = items
        .filter(i => i.type === 'category')
        .sort((a, b) => a.order - b.order)
        .map(i => ({ value: i.value, label: i.label }));

      const topics = items
        .filter(i => i.type === 'topic')
        .sort((a, b) => a.order - b.order)
        .map(i => i.label);

      const companies = items
        .filter(i => i.type === 'company')
        .sort((a, b) => a.order - b.order)
        .map(i => i.label);


      /* Preserve fallbacks when server has no data yet */
      const finalCategories = categories.length > 0 ? categories : get().categories;
      const finalTopics = topics.length > 0 ? topics : get().topics;
      const finalCompanies = companies.length > 0 ? companies : get().companies;

      set({ categories: finalCategories, topics: finalTopics, companies: finalCompanies, loading: false });
    } catch (error) {
      console.error('[OS-META] Error fetching meta, using fallback:', error.message);
      set({ loading: false, error: error.message });
    }
  },

  /* Admin: create a new meta entry */
  createMeta: async (data) => {
    const res = await createOsMeta(data);
    await get().fetchAllMeta();
    return res.data;
  },

  /* Admin: update a meta entry */
  updateMeta: async (id, data) => {
    const res = await updateOsMeta(id, data);
    await get().fetchAllMeta();
    return res.data;
  },

  /* Admin: delete a meta entry */
  deleteMeta: async (id) => {
    await deleteOsMeta(id);
    await get().fetchAllMeta();
  },

  /* Admin: seed defaults */
  seedMeta: async () => {
    await seedOsMeta();
    await get().fetchAllMeta();
  }
}));
