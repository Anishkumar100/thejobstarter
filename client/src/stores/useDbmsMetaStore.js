import { create } from 'zustand';
import { fetchDbmsMeta, createDbmsMeta, updateDbmsMeta, deleteDbmsMeta, seedDbmsMeta } from '../api/dbmsMetaApi.js';

/*
 * DBMS categories fallback — used when the API is unavailable
 */
const DBMS_CATEGORIES_FALLBACK = [
  { value: 'sql', label: 'SQL' },
  { value: 'design', label: 'Database Design' },
  { value: 'theory', label: 'Theory & Concepts' }
];

/*
 * useDbmsMetaStore — manages DBMS categories, topics, and companies from backend
 * Mirrors useMetaStore but scoped to DBMS content
 */
export const useDbmsMetaStore = create((set, get) => ({
  categories: DBMS_CATEGORIES_FALLBACK,
  topics: [],
  companies: [],
  loading: false,
  error: null,

  /*
   * Fetch all DBMS meta from backend and split by type
   */
  fetchAllMeta: async () => {
    console.log('[DBMS-META] Fetching all DBMS meta...');
    set({ loading: true, error: null });
    try {
      const res = await fetchDbmsMeta();
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

      console.log('[DBMS-META] Meta fetched — categories:', categories.length, 'topics:', topics.length, 'companies:', companies.length);

      /* Preserve fallbacks when server has no data yet */
      const finalCategories = categories.length > 0 ? categories : get().categories;
      const finalTopics = topics.length > 0 ? topics : get().topics;
      const finalCompanies = companies.length > 0 ? companies : get().companies;

      set({ categories: finalCategories, topics: finalTopics, companies: finalCompanies, loading: false });
    } catch (error) {
      console.error('[DBMS-META] Error fetching meta, using fallback:', error.message);
      set({ loading: false, error: error.message });
    }
  },

  /* Admin: create a new meta entry */
  createMeta: async (data) => {
    console.log('[DBMS-META] Creating meta:', data.label);
    const res = await createDbmsMeta(data);
    console.log('[DBMS-META] Meta created:', res.data?._id);
    await get().fetchAllMeta();
    return res.data;
  },

  /* Admin: update a meta entry */
  updateMeta: async (id, data) => {
    console.log('[DBMS-META] Updating meta:', id);
    const res = await updateDbmsMeta(id, data);
    console.log('[DBMS-META] Meta updated:', res.data?._id);
    await get().fetchAllMeta();
    return res.data;
  },

  /* Admin: delete a meta entry */
  deleteMeta: async (id) => {
    console.log('[DBMS-META] Deleting meta:', id);
    await deleteDbmsMeta(id);
    console.log('[DBMS-META] Meta deleted:', id);
    await get().fetchAllMeta();
  },

  /* Admin: seed defaults */
  seedMeta: async () => {
    console.log('[DBMS-META] Seeding default meta...');
    await seedDbmsMeta();
    console.log('[DBMS-META] Seed complete');
    await get().fetchAllMeta();
  }
}));
