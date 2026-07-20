import { create } from 'zustand';
import {
  fetchProgrammingLessons,
  fetchProgrammingLessonBySlug,
  fetchProgrammingSubtopics,
  fetchProgrammingSubtopicBySlug,
  fetchProgrammingSubtopicProblems,
  fetchProgrammingProblems,
  fetchProgrammingProblemBySlug,
  createProgrammingLesson,
  updateProgrammingLesson,
  deleteProgrammingLesson,
  createProgrammingSubtopic,
  updateProgrammingSubtopic,
  deleteProgrammingSubtopic,
  createProgrammingProblem,
  updateProgrammingProblem,
  deleteProgrammingProblem
} from '../api/programmingApi.js';
import { usePageLoadingStore } from './usePageLoadingStore.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/*
 * Programming Concepts Store
 * Mirrors DSA store pattern — lessons, subtopics, and problems
 * In mock mode, returns empty arrays (no mock data for programming yet)
 */
export const useProgrammingStore = create((set, get) => ({
  lessons: [],
  currentLesson: null,
  subtopics: [],
  currentSubtopic: null,
  problems: [],
  currentProblem: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,

  /* ── Lessons ── */

  fetchLessons: async () => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ lessons: [], loading: false });
      } else {
        const res = await fetchProgrammingLessons();
        console.log('[PROGRAMMING] Lessons fetched:', res.data?.length);
        set({ lessons: res.data, loading: false });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching lessons:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  fetchLessonBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ currentLesson: null, loading: false });
      } else {
        const res = await fetchProgrammingLessonBySlug(slug);
        console.log('[PROGRAMMING] Lesson fetched:', res.data?.title);
        set({ currentLesson: res.data, loading: false });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching lesson:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  createLesson: async (data) => {
    if (USE_MOCK) return;
    const res = await createProgrammingLesson(data);
    console.log('[PROGRAMMING] Lesson created:', res.data?.title);
    set(state => ({ lessons: [res.data, ...state.lessons] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateProgrammingLesson(id, data);
    console.log('[PROGRAMMING] Lesson updated:', res.data?.title);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    if (USE_MOCK) return;
    await deleteProgrammingLesson(id);
    console.log('[PROGRAMMING] Lesson deleted:', id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ── Subtopics ── */

  fetchSubtopics: async (lessonSlug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ subtopics: [], loading: false });
      } else {
        const res = await fetchProgrammingSubtopics(lessonSlug);
        console.log('[PROGRAMMING] Subtopics fetched:', res.data?.length);
        set({ subtopics: res.data, loading: false });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching subtopics:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  fetchSubtopicBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ currentSubtopic: null, loading: false });
      } else {
        const res = await fetchProgrammingSubtopicBySlug(slug);
        console.log('[PROGRAMMING] Subtopic fetched:', res.data?.title);
        set({ currentSubtopic: res.data, loading: false });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching subtopic:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  createSubtopic: async (data) => {
    if (USE_MOCK) return;
    const res = await createProgrammingSubtopic(data);
    console.log('[PROGRAMMING] Subtopic created:', res.data?.title);
    set(state => ({ subtopics: [res.data, ...state.subtopics] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateProgrammingSubtopic(id, data);
    console.log('[PROGRAMMING] Subtopic updated:', res.data?.title);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    if (USE_MOCK) return;
    await deleteProgrammingSubtopic(id);
    console.log('[PROGRAMMING] Subtopic deleted:', id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ── Problems ── */

  fetchProblems: async (filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ problems: [], loading: false, total: 0, totalPages: 1 });
      } else {
        const res = await fetchProgrammingProblems(filters);
        console.log('[PROGRAMMING] Problems fetched:', res.total);
        set({ problems: res.data, loading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching problems:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  fetchSubtopicProblems: async (slug, filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ problems: [], loading: false });
      } else {
        const res = await fetchProgrammingSubtopicProblems(slug, filters);
        console.log('[PROGRAMMING] Subtopic problems fetched:', res.total);
        set({ problems: res.data, loading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching subtopic problems:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  fetchProblemBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Programming');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ currentProblem: null, loading: false });
      } else {
        const res = await fetchProgrammingProblemBySlug(slug);
        console.log('[PROGRAMMING] Problem fetched:', res.data?.title);
        set({ currentProblem: res.data, loading: false });
      }
    } catch (error) {
      console.error('[PROGRAMMING] Error fetching problem:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Programming');
    }
  },

  createProblem: async (data) => {
    if (USE_MOCK) return;
    const res = await createProgrammingProblem(data);
    console.log('[PROGRAMMING] Problem created:', res.data?.title);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateProgrammingProblem(id, data);
    console.log('[PROGRAMMING] Problem updated:', res.data?.title);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    if (USE_MOCK) return;
    await deleteProgrammingProblem(id);
    console.log('[PROGRAMMING] Problem deleted:', id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
