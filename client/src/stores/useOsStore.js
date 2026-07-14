import { create } from 'zustand';

/*
 * useOsStore — mirrors useDbmsStore for OS hierarchy (lessons → subtopics → problems)
 * OS problems have NO codeBlocks (conceptual only)
 */
export const useOsStore = create((set, get) => ({
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
    console.log('[OS] Fetching lessons...');
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchOsLessons } = await import('../api/osApi.js');
      const res = await fetchOsLessons();
      console.log('[OS] Lessons fetched:', res.data?.length);
      set({ lessons: res.data || [], lessonsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching lessons:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  fetchLessonBySlug: async (slug) => {
    console.log('[OS] Fetching lesson by slug:', slug);
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchOsLessonBySlug } = await import('../api/osApi.js');
      const res = await fetchOsLessonBySlug(slug);
      console.log('[OS] Lesson fetched:', res.data?.title);
      set({ currentLesson: res.data, lessonsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching lesson:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  createLesson: async (data) => {
    console.log('[OS] Creating lesson...');
    const { createOsLesson } = await import('../api/osApi.js');
    const res = await createOsLesson(data);
    console.log('[OS] Lesson created:', res.data?.title);
    set(state => ({ lessons: [res.data, ...state.lessons] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    console.log('[OS] Updating lesson:', id);
    const { updateOsLesson } = await import('../api/osApi.js');
    const res = await updateOsLesson(id, data);
    console.log('[OS] Lesson updated:', res.data?.title);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    console.log('[OS] Deleting lesson:', id);
    const { deleteOsLesson } = await import('../api/osApi.js');
    await deleteOsLesson(id);
    console.log('[OS] Lesson deleted:', id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ===================== SUBTOPICS ===================== */

  fetchSubtopics: async (filters = {}) => {
    console.log('[OS] Fetching subtopics with filters:', filters);
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchOsSubtopics } = await import('../api/osApi.js');
      const res = await fetchOsSubtopics(filters);
      console.log('[OS] Subtopics fetched:', res.data?.length);
      set({ subtopics: res.data || [], subtopicsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching subtopics:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicBySlug: async (slug) => {
    console.log('[OS] Fetching subtopic by slug:', slug);
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchOsSubtopicBySlug } = await import('../api/osApi.js');
      const res = await fetchOsSubtopicBySlug(slug);
      console.log('[OS] Subtopic fetched:', res.data?.title);
      set({ currentSubtopic: res.data, subtopicsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching subtopic:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicProblems: async (slug, filters = {}) => {
    console.log('[OS] Fetching subtopic problems:', slug);
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchOsSubtopicProblems } = await import('../api/osApi.js');
      const res = await fetchOsSubtopicProblems(slug, filters);
      console.log('[OS] Subtopic problems fetched:', res.total);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching subtopic problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  createSubtopic: async (data) => {
    console.log('[OS] Creating subtopic...');
    const { createOsSubtopic } = await import('../api/osApi.js');
    const res = await createOsSubtopic(data);
    console.log('[OS] Subtopic created:', res.data?.title);
    set(state => ({ subtopics: [res.data, ...state.subtopics] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    console.log('[OS] Updating subtopic:', id);
    const { updateOsSubtopic } = await import('../api/osApi.js');
    const res = await updateOsSubtopic(id, data);
    console.log('[OS] Subtopic updated:', res.data?.title);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    console.log('[OS] Deleting subtopic:', id);
    const { deleteOsSubtopic } = await import('../api/osApi.js');
    await deleteOsSubtopic(id);
    console.log('[OS] Subtopic deleted:', id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ===================== PROBLEMS ===================== */

  fetchProblems: async (filters = {}) => {
    console.log('[OS] Fetching problems with filters:', filters);
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchOsProblems } = await import('../api/osApi.js');
      const res = await fetchOsProblems(filters);
      console.log('[OS] Problems fetched:', res.total);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  fetchProblemBySlug: async (slug) => {
    console.log('[OS] Fetching problem by slug:', slug);
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchOsProblemBySlug } = await import('../api/osApi.js');
      const res = await fetchOsProblemBySlug(slug);
      console.log('[OS] Problem fetched:', res.data?.title);
      set({ currentProblem: res.data, problemsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching problem:', error.message);
      set({ problemsError: error.message, currentProblem: null, problemsLoading: false });
    }
  },

  createProblem: async (data) => {
    console.log('[OS] Creating problem...');
    const { createOsProblem } = await import('../api/osApi.js');
    const res = await createOsProblem(data);
    console.log('[OS] Problem created:', res.data?.title);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    console.log('[OS] Updating problem:', id);
    const { updateOsProblem } = await import('../api/osApi.js');
    const res = await updateOsProblem(id, data);
    console.log('[OS] Problem updated:', res.data?.title);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    console.log('[OS] Deleting problem:', id);
    const { deleteOsProblem } = await import('../api/osApi.js');
    await deleteOsProblem(id);
    console.log('[OS] Problem deleted:', id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
