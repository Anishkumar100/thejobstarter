import { create } from 'zustand';

/*
 * useDbmsStore — Zustand store for DBMS hierarchy (lessons → subtopics → problems)
 * Mirrors the DSA store pattern with lessons, subtopics, and problems
 */
export const useDbmsStore = create((set, get) => ({
  /* Lessons state */
  lessons: [],
  currentLesson: null,
  lessonsLoading: false,
  lessonsError: null,

  /* Subtopics state */
  subtopics: [],
  currentSubtopic: null,
  subtopicsLoading: false,
  subtopicsError: null,

  /* Problems state */
  problems: [],
  currentProblem: null,
  problemsLoading: false,
  problemsError: null,
  total: 0,
  page: 1,
  totalPages: 1,

  /* ===================== LESSONS ===================== */

  fetchLessons: async () => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchLessons } = await import('../api/dbmsApi.js');
      const res = await fetchLessons();
      set({ lessons: res.data || [], lessonsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching lessons:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  fetchLessonBySlug: async (slug) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchLessonBySlug } = await import('../api/dbmsApi.js');
      const res = await fetchLessonBySlug(slug);
      set({ currentLesson: res.data, lessonsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching lesson:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  createLesson: async (data) => {
    const { createLesson } = await import('../api/dbmsApi.js');
    const res = await createLesson(data);
    set(state => ({ lessons: [res.data, ...state.lessons] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    const { updateLesson } = await import('../api/dbmsApi.js');
    const res = await updateLesson(id, data);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    const { deleteLesson } = await import('../api/dbmsApi.js');
    await deleteLesson(id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ===================== SUBTOPICS ===================== */

  fetchSubtopics: async (filters = {}) => {
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchSubtopics } = await import('../api/dbmsApi.js');
      const res = await fetchSubtopics(filters);
      set({ subtopics: res.data || [], subtopicsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching subtopics:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicBySlug: async (slug) => {
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchSubtopicBySlug } = await import('../api/dbmsApi.js');
      const res = await fetchSubtopicBySlug(slug);
      set({ currentSubtopic: res.data, subtopicsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching subtopic:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicProblems: async (slug, filters = {}) => {
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchSubtopicProblems } = await import('../api/dbmsApi.js');
      const res = await fetchSubtopicProblems(slug, filters);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching subtopic problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  createSubtopic: async (data) => {
    const { createSubtopic } = await import('../api/dbmsApi.js');
    const res = await createSubtopic(data);
    set(state => ({ subtopics: [res.data, ...state.subtopics] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    const { updateSubtopic } = await import('../api/dbmsApi.js');
    const res = await updateSubtopic(id, data);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    const { deleteSubtopic } = await import('../api/dbmsApi.js');
    await deleteSubtopic(id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ===================== PROBLEMS ===================== */

  fetchProblems: async (filters = {}) => {
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchProblems } = await import('../api/dbmsApi.js');
      const res = await fetchProblems(filters);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  fetchProblemBySlug: async (slug) => {
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchProblemBySlug } = await import('../api/dbmsApi.js');
      const res = await fetchProblemBySlug(slug);
      set({ currentProblem: res.data, problemsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching problem:', error.message);
      set({ problemsError: error.message, currentProblem: null, problemsLoading: false });
    }
  },

  createProblem: async (data) => {
    const { createProblem } = await import('../api/dbmsApi.js');
    const res = await createProblem(data);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    const { updateProblem } = await import('../api/dbmsApi.js');
    const res = await updateProblem(id, data);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    const { deleteProblem } = await import('../api/dbmsApi.js');
    await deleteProblem(id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
