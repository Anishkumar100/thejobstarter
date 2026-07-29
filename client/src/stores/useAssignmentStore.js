/*
 * Assignment Store — Manages coordinator and student assignment state.
 * Coordinators: CRUD on assignments + grading submissions.
 * Students: View assignments + submit drive links.
 */
import { create } from 'zustand';
import { apiRequest } from '../api/client.js';

export const useAssignmentStore = create((set, get) => ({
  /* Coordinator state */
  assignments: [],
  currentAssignment: null,
  loading: false,
  error: null,

  /* Student state */
  studentAssignments: [],
  studentLoading: false,

  /*
   * ── Coordinator: Fetch all assignments (optionally filtered by batch) ──
   */
  fetchAssignments: async (batchId = '') => {
    set({ loading: true, error: null });
    try {
      const query = batchId ? `?batchId=${batchId}` : '';
      const res = await apiRequest(`/coordinator/assignments${query}`);
      set({ assignments: res.data || [], loading: false });
      console.log('[ASSIGN STORE] Assignments fetched:', res.data?.length);
    } catch (err) {
      console.error('[ASSIGN STORE] Error:', err.message);
      set({ error: err.message, loading: false });
    }
  },

  /*
   * ── Coordinator: Fetch single assignment with submissions ──
   */
  fetchAssignmentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest(`/coordinator/assignments/${id}`);
      set({ currentAssignment: res.data, loading: false });
      return res.data;
    } catch (err) {
      console.error('[ASSIGN STORE] Error:', err.message);
      set({ error: err.message, loading: false });
      return null;
    }
  },

  /*
   * ── Coordinator: Create assignment ──
   */
  createAssignment: async (data) => {
    console.log('[ASSIGN STORE] createAssignment called with data keys:', Object.keys(data));
    console.log('[ASSIGN STORE] data values:', { 
      title: data.title, batchId: data.batchId, 
      startDate: data.startDate, endDate: data.endDate,
      fieldsCount: Object.keys(data).length
    });
    try {
      const bodyStr = JSON.stringify(data);
      console.log('[ASSIGN STORE] Sending POST to /coordinator/assignments with body length:', bodyStr.length);
      const res = await apiRequest('/coordinator/assignments', {
        method: 'POST',
        body: bodyStr
      });
      console.log('[ASSIGN STORE] ✅ API response received:', { 
        hasData: !!res.data, 
        id: res.data?._id,
        title: res.data?.title 
      });
      set(state => ({ assignments: [res.data, ...state.assignments] }));
      return res.data;
    } catch (err) {
      console.log('[ASSIGN STORE] ❌ API call FAILED:', err.message);
      console.log('[ASSIGN STORE] Full error:', err);
      throw err;
    }
  },

  /*
   * ── Coordinator: Update assignment ──
   */
  updateAssignment: async (id, data) => {
    console.log('[ASSIGN STORE] updateAssignment called — id:', id);
    try {
      const res = await apiRequest(`/coordinator/assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      console.log('[ASSIGN STORE] ✅ Update successful:', res.data?._id);
      set(state => ({
        assignments: state.assignments.map(a => a._id === id ? res.data : a),
        currentAssignment: state.currentAssignment?._id === id ? res.data : state.currentAssignment
      }));
      return res.data;
    } catch (err) {
      console.log('[ASSIGN STORE] ❌ Update FAILED:', err.message);
      throw err;
    }
  },

  /*
   * ── Coordinator: Delete assignment ──
   */
  deleteAssignment: async (id) => {
    try {
      await apiRequest(`/coordinator/assignments/${id}`, { method: 'DELETE' });
      set(state => ({
        assignments: state.assignments.filter(a => a._id !== id),
        currentAssignment: state.currentAssignment?._id === id ? null : state.currentAssignment
      }));
    } catch (err) {
      throw err;
    }
  },

  /*
   * ── Coordinator: Grade a submission ──
   */
  gradeSubmission: async (assignmentId, submissionId, data) => {
    try {
      const res = await apiRequest(`/coordinator/assignments/${assignmentId}/submissions/${submissionId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      set(state => {
        if (!state.currentAssignment) return state;
        const subs = (state.currentAssignment.submissions || []).map(s =>
          s._id === submissionId ? res.data : s
        );
        return { currentAssignment: { ...state.currentAssignment, submissions: subs } };
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  /*
   * ── Student: Fetch assignments ──
   */
  fetchStudentAssignments: async () => {
    set({ studentLoading: true, error: null });
    try {
      const res = await apiRequest('/student/assignments');
      set({ studentAssignments: res.data || [], studentLoading: false });
    } catch (err) {
      console.error('[ASSIGN STORE] Student error:', err.message);
      set({ error: err.message, studentLoading: false });
    }
  },

  /*
   * ── Student: Submit drive link ──
   */
  submitAssignment: async (id, driveLink) => {
    try {
      const res = await apiRequest(`/student/assignments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ driveLink })
      });
      /* Update the local student assignments list */
      set(state => ({
        studentAssignments: state.studentAssignments.map(a =>
          a._id === id ? { ...a, _submission: res.data, _canSubmit: false } : a
        )
      }));
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  /*
   * ── Student: Update existing submission ──
   */
  updateSubmission: async (id, driveLink) => {
    try {
      const res = await apiRequest(`/student/assignments/${id}/submission`, {
        method: 'PUT',
        body: JSON.stringify({ driveLink })
      });
      set(state => ({
        studentAssignments: state.studentAssignments.map(a =>
          a._id === id ? { ...a, _submission: res.data } : a
        )
      }));
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  /*
   * ── Student: Fetch single assignment detail ──
   */
  fetchStudentAssignmentById: async (id) => {
    set({ studentLoading: true, error: null });
    try {
      const res = await apiRequest(`/student/assignments/${id}`);
      set({ currentAssignment: res.data, studentLoading: false });
      return res.data;
    } catch (err) {
      console.error('[ASSIGN STORE] Error:', err.message);
      set({ error: err.message, studentLoading: false });
      return null;
    }
  }
}));
