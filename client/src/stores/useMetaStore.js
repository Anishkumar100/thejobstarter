import { create } from 'zustand';
import { fetchDsaMeta, createDsaMeta, updateDsaMeta, deleteDsaMeta, seedDsaMeta } from '../api/metaApi.js';

/*
 * useMetaStore — manages DSA categories, topics, and companies from backend
 * Falls back to constants if fetch fails
 */
import { DSA_CATEGORIES, DSA_TOPICS, COMPANIES } from '../utils/constants.js';

export const useMetaStore = create((set, get) => ({
  categories: DSA_CATEGORIES,
  topics: DSA_TOPICS,
  companies: COMPANIES,
  loading: false,
  error: null,

  /*
   * Fetch all DSA meta from backend and split by type
   * Categories → { value, label }
   * Topics → [label strings]
   * Companies → [label strings]
   */
  fetchAllMeta: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetchDsaMeta();
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

      set({ categories, topics, companies, loading: false });
    } catch (error) {
      console.error('[META] Error fetching meta, using constants fallback:', error.message);
      set({ loading: false, error: error.message });
    }
  },

  /* Admin: create a new meta entry */
  createMeta: async (data) => {
    const res = await createDsaMeta(data);
    /* Refresh the relevant list */
    await get().fetchAllMeta();
    return res.data;
  },

  /* Admin: update a meta entry */
  updateMeta: async (id, data) => {
    const res = await updateDsaMeta(id, data);
    await get().fetchAllMeta();
    return res.data;
  },

  /* Admin: delete a meta entry */
  deleteMeta: async (id) => {
    await deleteDsaMeta(id);
    await get().fetchAllMeta();
  },

  /* Admin: seed defaults */
  seedMeta: async () => {
    await seedDsaMeta();
    await get().fetchAllMeta();
  }
}));
