import { create } from 'zustand';
import {
  fetchCoachingCenters as fetchApi,
  fetchCoachingCenterById as fetchByIdApi,
  createCoachingCenter as createApi,
  updateCoachingCenter as updateApi,
  regenerateCenterCode as regenerateApi,
  deleteCoachingCenter as deleteApi,
  fetchCenterStudents as fetchStudentsApi,
  removeStudentFromCenter as removeStudentApi,
  fetchCenterStudentById as fetchStudentApi,
  updateCenterStudent as updateStudentApi
} from '../api/coachingCenterApi.js';

export const useCoachingCenterStore = create((set, get) => ({
  centers: [],
  currentCenter: null,
  currentStudent: null,
  students: [],
  studentsLoading: false,
  studentLoading: false,
  loading: false,
  error: null,

  /*
   * Fetch all coaching centers (admin list view)
   */
  fetchCenters: async () => {
    console.log('[COACHING] Fetching centers...');
    set({ loading: true, error: null });
    try {
      const res = await fetchApi();
      console.log('[COACHING] Centers fetched:', res.data?.length);
      set({ centers: res.data, loading: false });
    } catch (error) {
      console.error('[COACHING] Error fetching centers:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Fetch a single center by ID (detail view)
   */
  fetchCenterById: async (id) => {
    console.log('[COACHING] Fetching center:', id);
    set({ loading: true, error: null });
    try {
      const res = await fetchByIdApi(id);
      console.log('[COACHING] Center fetched:', res.data?.name);
      set({ currentCenter: res.data, loading: false });
    } catch (error) {
      console.error('[COACHING] Error fetching center:', error.message);
      set({ error: error.message, loading: false });
    }
  },

  /*
   * Create a new coaching center
   */
  createCenter: async (data) => {
    console.log('[COACHING] Creating center...');
    try {
      const res = await createApi(data);
      console.log('[COACHING] Center created:', res.data?._id);
      set(state => ({ centers: [res.data, ...state.centers] }));
      return res.data;
    } catch (error) {
      console.error('[COACHING] Error creating center:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Update a coaching center's fields
   */
  updateCenter: async (id, data) => {
    console.log('[COACHING] Updating center:', id);
    try {
      const res = await updateApi(id, data);
      console.log('[COACHING] Center updated:', res.data?._id);
      set(state => ({
        centers: state.centers.map(c => c._id === id ? res.data : c),
        currentCenter: state.currentCenter?._id === id ? res.data : state.currentCenter
      }));
      return res.data;
    } catch (error) {
      console.error('[COACHING] Error updating center:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Regenerate a center's join code
   */
  regenerateCode: async (id) => {
    console.log('[COACHING] Regenerating code for center:', id);
    try {
      const res = await regenerateApi(id);
      console.log('[COACHING] Code regenerated:', res.data?.code);
      set(state => ({
        centers: state.centers.map(c => c._id === id ? res.data : c),
        currentCenter: state.currentCenter?._id === id ? res.data : state.currentCenter
      }));
      return res.data;
    } catch (error) {
      console.error('[COACHING] Error regenerating code:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Delete a coaching center (blocked if has linked students)
   */
  deleteCenter: async (id) => {
    console.log('[COACHING] Deleting center:', id);
    try {
      await deleteApi(id);
      console.log('[COACHING] Center deleted:', id);
      set(state => ({ centers: state.centers.filter(c => c._id !== id) }));
    } catch (error) {
      console.error('[COACHING] Error deleting center:', error.message);
      set({ error: error.message });
      throw error;
    }
  },

  /*
   * Fetch the student roster for a center (admin detail view)
   */
  fetchCenterStudents: async (id) => {
    console.log('[COACHING] Fetching students for center:', id);
    set({ studentsLoading: true });
    try {
      const res = await fetchStudentsApi(id);
      console.log('[COACHING] Students fetched:', res.data?.students?.length);
      set({ students: res.data?.students || [], studentsLoading: false });
      return res.data;
    } catch (error) {
      console.error('[COACHING] Error fetching students:', error.message);
      set({ studentsLoading: false });
      throw error;
    }
  },

  /*
   * Directly set the students array (used for batch assign/remove in admin detail)
   * Supports both value and updater function (like React setState)
   */
  setStudents: (studentsOrFn) => set(state => ({
    students: typeof studentsOrFn === 'function' ? studentsOrFn(state.students) : studentsOrFn
  })),

  /*
   * Admin: Remove a student from a center (emergency unlink)
   */
  removeStudentFromCenter: async (centerId, userId) => {
    console.log('[COACHING] Removing student from center:', userId);
    try {
      await removeStudentApi(centerId, userId);
      set(state => ({
        students: state.students.filter(s => s._id !== userId)
      }));
    } catch (error) {
      console.error('[COACHING] Error removing student:', error.message);
      throw error;
    }
  },

  /*
   * Fetch a single student within a center (admin detail view)
   */
  fetchCenterStudentById: async (centerId, userId) => {
    console.log('[COACHING] Fetching student:', userId);
    set({ studentLoading: true, currentStudent: null });
    try {
      const res = await fetchStudentApi(centerId, userId);
      console.log('[COACHING] Student fetched:', res.data?.displayName);
      set({ currentStudent: res.data, studentLoading: false });
      return res.data;
    } catch (error) {
      console.error('[COACHING] Error fetching student:', error.message);
      set({ studentLoading: false });
      throw error;
    }
  },

  /*
   * Admin: Update a student's basic fields within a center
   */
  updateCenterStudent: async (centerId, userId, data) => {
    console.log('[COACHING] Updating student:', userId);
    try {
      const res = await updateStudentApi(centerId, userId, data);
      console.log('[COACHING] Student updated:', res.data?.displayName);
      set({ currentStudent: res.data });
      /* Also update the student in the roster list if present */
      set(state => ({
        students: state.students.map(s => s._id === userId ? { ...s, ...data } : s)
      }));
      return res.data;
    } catch (error) {
      console.error('[COACHING] Error updating student:', error.message);
      throw error;
    }
  }
}));
