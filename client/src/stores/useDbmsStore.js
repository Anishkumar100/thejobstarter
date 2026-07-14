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
    console.log('[DBMS] Fetching lessons...');
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchLessons } = await import('../api/dbmsApi.js');
      const res = await fetchLessons();
      console.log('[DBMS] Lessons fetched:', res.data?.length);
      set({ lessons: res.data || [], lessonsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching lessons:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  fetchLessonBySlug: async (slug) => {
    console.log('[DBMS] Fetching lesson by slug:', slug);
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchLessonBySlug } = await import('../api/dbmsApi.js');
      const res = await fetchLessonBySlug(slug);
      console.log('[DBMS] Lesson fetched:', res.data?.title);
      set({ currentLesson: res.data, lessonsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching lesson:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  createLesson: async (data) => {
    console.log('[DBMS] Creating lesson...');
    const { createLesson } = await import('../api/dbmsApi.js');
    const res = await createLesson(data);
    console.log('[DBMS] Lesson created:', res.data?.title);
    set(state => ({ lessons: [res.data, ...state.lessons] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    console.log('[DBMS] Updating lesson:', id);
    const { updateLesson } = await import('../api/dbmsApi.js');
    const res = await updateLesson(id, data);
    console.log('[DBMS] Lesson updated:', res.data?.title);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    console.log('[DBMS] Deleting lesson:', id);
    const { deleteLesson } = await import('../api/dbmsApi.js');
    await deleteLesson(id);
    console.log('[DBMS] Lesson deleted:', id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ===================== SUBTOPICS ===================== */

  fetchSubtopics: async (filters = {}) => {
    console.log('[DBMS] Fetching subtopics with filters:', filters);
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchSubtopics } = await import('../api/dbmsApi.js');
      const res = await fetchSubtopics(filters);
      console.log('[DBMS] Subtopics fetched:', res.data?.length);
      set({ subtopics: res.data || [], subtopicsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching subtopics:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicBySlug: async (slug) => {
    console.log('[DBMS] Fetching subtopic by slug:', slug);
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchSubtopicBySlug } = await import('../api/dbmsApi.js');
      const res = await fetchSubtopicBySlug(slug);
      console.log('[DBMS] Subtopic fetched:', res.data?.title);
      set({ currentSubtopic: res.data, subtopicsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching subtopic:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicProblems: async (slug, filters = {}) => {
    console.log('[DBMS] Fetching subtopic problems:', slug);
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchSubtopicProblems } = await import('../api/dbmsApi.js');
      const res = await fetchSubtopicProblems(slug, filters);
      console.log('[DBMS] Subtopic problems fetched:', res.total);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching subtopic problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  createSubtopic: async (data) => {
    console.log('[DBMS] Creating subtopic...');
    const { createSubtopic } = await import('../api/dbmsApi.js');
    const res = await createSubtopic(data);
    console.log('[DBMS] Subtopic created:', res.data?.title);
    set(state => ({ subtopics: [res.data, ...state.subtopics] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    console.log('[DBMS] Updating subtopic:', id);
    const { updateSubtopic } = await import('../api/dbmsApi.js');
    const res = await updateSubtopic(id, data);
    console.log('[DBMS] Subtopic updated:', res.data?.title);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    console.log('[DBMS] Deleting subtopic:', id);
    const { deleteSubtopic } = await import('../api/dbmsApi.js');
    await deleteSubtopic(id);
    console.log('[DBMS] Subtopic deleted:', id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ===================== PROBLEMS ===================== */

  fetchProblems: async (filters = {}) => {
    console.log('[DBMS] Fetching problems with filters:', filters);
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchProblems } = await import('../api/dbmsApi.js');
      const res = await fetchProblems(filters);
      console.log('[DBMS] Problems fetched:', res.total);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  fetchProblemBySlug: async (slug) => {
    console.log('[DBMS] Fetching problem by slug:', slug);
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchProblemBySlug } = await import('../api/dbmsApi.js');
      const res = await fetchProblemBySlug(slug);
      console.log('[DBMS] Problem fetched:', res.data?.title);
      set({ currentProblem: res.data, problemsLoading: false });
    } catch (error) {
      console.error('[DBMS] Error fetching problem:', error.message);
      set({ problemsError: error.message, currentProblem: null, problemsLoading: false });
    }
  },

  createProblem: async (data) => {
    console.log('[DBMS] Creating problem...');
    const { createProblem } = await import('../api/dbmsApi.js');
    const res = await createProblem(data);
    console.log('[DBMS] Problem created:', res.data?.title);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    console.log('[DBMS] Updating problem:', id);
    const { updateProblem } = await import('../api/dbmsApi.js');
    const res = await updateProblem(id, data);
    console.log('[DBMS] Problem updated:', res.data?.title);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    console.log('[DBMS] Deleting problem:', id);
    const { deleteProblem } = await import('../api/dbmsApi.js');
    await deleteProblem(id);
    console.log('[DBMS] Problem deleted:', id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
