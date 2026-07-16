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
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchOsLessons } = await import('../api/osApi.js');
      const res = await fetchOsLessons();
      set({ lessons: res.data || [], lessonsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching lessons:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  fetchLessonBySlug: async (slug) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      const { fetchOsLessonBySlug } = await import('../api/osApi.js');
      const res = await fetchOsLessonBySlug(slug);
      set({ currentLesson: res.data, lessonsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching lesson:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    }
  },

  createLesson: async (data) => {
    const { createOsLesson } = await import('../api/osApi.js');
    const res = await createOsLesson(data);
    set(state => ({ lessons: [res.data, ...state.lessons] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    const { updateOsLesson } = await import('../api/osApi.js');
    const res = await updateOsLesson(id, data);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    const { deleteOsLesson } = await import('../api/osApi.js');
    await deleteOsLesson(id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ===================== SUBTOPICS ===================== */

  fetchSubtopics: async (filters = {}) => {
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchOsSubtopics } = await import('../api/osApi.js');
      const res = await fetchOsSubtopics(filters);
      set({ subtopics: res.data || [], subtopicsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching subtopics:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicBySlug: async (slug) => {
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      const { fetchOsSubtopicBySlug } = await import('../api/osApi.js');
      const res = await fetchOsSubtopicBySlug(slug);
      set({ currentSubtopic: res.data, subtopicsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching subtopic:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    }
  },

  fetchSubtopicProblems: async (slug, filters = {}) => {
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchOsSubtopicProblems } = await import('../api/osApi.js');
      const res = await fetchOsSubtopicProblems(slug, filters);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching subtopic problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  createSubtopic: async (data) => {
    const { createOsSubtopic } = await import('../api/osApi.js');
    const res = await createOsSubtopic(data);
    set(state => ({ subtopics: [res.data, ...state.subtopics] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    const { updateOsSubtopic } = await import('../api/osApi.js');
    const res = await updateOsSubtopic(id, data);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    const { deleteOsSubtopic } = await import('../api/osApi.js');
    await deleteOsSubtopic(id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ===================== PROBLEMS ===================== */

  fetchProblems: async (filters = {}) => {
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchOsProblems } = await import('../api/osApi.js');
      const res = await fetchOsProblems(filters);
      set({ problems: res.data, total: res.total, page: res.page, totalPages: res.totalPages, problemsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    }
  },

  fetchProblemBySlug: async (slug) => {
    set({ problemsLoading: true, problemsError: null });
    try {
      const { fetchOsProblemBySlug } = await import('../api/osApi.js');
      const res = await fetchOsProblemBySlug(slug);
      set({ currentProblem: res.data, problemsLoading: false });
    } catch (error) {
      console.error('[OS] Error fetching problem:', error.message);
      set({ problemsError: error.message, currentProblem: null, problemsLoading: false });
    }
  },

  createProblem: async (data) => {
    const { createOsProblem } = await import('../api/osApi.js');
    const res = await createOsProblem(data);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    const { updateOsProblem } = await import('../api/osApi.js');
    const res = await updateOsProblem(id, data);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    const { deleteOsProblem } = await import('../api/osApi.js');
    await deleteOsProblem(id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
