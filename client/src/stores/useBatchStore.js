import { create } from 'zustand';
import {
  fetchBatches as fetchBatchesApi,
  fetchBatchById as fetchBatchByIdApi,
  createBatch as createBatchApi,
  updateBatch as updateBatchApi,
  regenerateBatchCode as regenerateBatchCodeApi,
  deleteBatch as deleteBatchApi
} from '../api/batchApi.js';

export const useBatchStore = create((set, get) => ({
  batches: [],
  currentBatch: null,
  loading: false,
  error: null,

  /*
   * Fetch all batches (admin list view)
   */
  fetchBatches: async () => {
    console.log('[BATCH] Fetching batches...');
    set({ loading: true, error: null });
    try {
      const res = await fetchBatchesApi();
      console.log('[BATCH] Batches fetched:', res.data?.length);
      set({ batches: res.data, loading: false });
    } catch (error) {
      console.error('[BATCH] Error fetching batches:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Fetch a single batch by ID (detail view)
   */
  fetchBatchById: async (id) => {
    console.log('[BATCH] Fetching batch:', id);
    set({ loading: true, error: null });
    try {
      const res = await fetchBatchByIdApi(id);
      console.log('[BATCH] Batch fetched:', res.data?.name);
      set({ currentBatch: res.data, loading: false });
    } catch (error) {
      console.error('[BATCH] Error fetching batch:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Create a new batch (admin)
   */
  createBatch: async (data) => {
    console.log('[BATCH] Creating batch...');
    try {
      const res = await createBatchApi(data);
      console.log('[BATCH] Batch created:', res.data?._id);
      set(state => ({ batches: [res.data, ...state.batches] }));
      return res.data;
    } catch (error) {
      console.error('[BATCH] Error creating batch:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Update a batch's fields
   */
  updateBatch: async (id, data) => {
    console.log('[BATCH] Updating batch:', id);
    try {
      const res = await updateBatchApi(id, data);
      console.log('[BATCH] Batch updated:', res.data?._id);
      set(state => ({
        batches: state.batches.map(b => b._id === id ? res.data : b),
        currentBatch: state.currentBatch?._id === id ? res.data : state.currentBatch
      }));
      return res.data;
    } catch (error) {
      console.error('[BATCH] Error updating batch:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Regenerate a batch's join code
   */
  regenerateCode: async (id) => {
    console.log('[BATCH] Regenerating code for batch:', id);
    try {
      const res = await regenerateBatchCodeApi(id);
      console.log('[BATCH] Code regenerated:', res.data?.code);
      set(state => ({
        batches: state.batches.map(b => b._id === id ? res.data : b),
        currentBatch: state.currentBatch?._id === id ? res.data : state.currentBatch
      }));
      return res.data;
    } catch (error) {
      console.error('[BATCH] Error regenerating code:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Delete a batch (blocked if has linked students)
   */
  deleteBatch: async (id) => {
    console.log('[BATCH] Deleting batch:', id);
    try {
      await deleteBatchApi(id);
      console.log('[BATCH] Batch deleted:', id);
      set(state => ({ batches: state.batches.filter(b => b._id !== id) }));
    } catch (error) {
      console.error('[BATCH] Error deleting batch:', error.message);
      set({ error: error.message });
      throw error;
    }
  }
}));
