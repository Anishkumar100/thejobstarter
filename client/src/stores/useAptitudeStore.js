import { create } from 'zustand';
import {
  fetchAptitudeLessons,
  fetchAptitudeLessonBySlug,
  fetchAptitudeSubtopics,
  fetchAptitudeSubtopicBySlug,
  fetchAptitudeSubtopicProblems,
  fetchAptitudeProblems,
  fetchAptitudeProblemBySlug,
  createAptitudeLesson,
  updateAptitudeLesson,
  deleteAptitudeLesson,
  createAptitudeSubtopic,
  updateAptitudeSubtopic,
  deleteAptitudeSubtopic,
  createAptitudeProblem,
  updateAptitudeProblem,
  deleteAptitudeProblem
} from '../api/aptitudeApi.js';
import { usePageLoadingStore } from './usePageLoadingStore.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/*
 * Aptitude Store
 * Mirrors Programming store pattern — lessons, subtopics, and problems
 * In mock mode, returns empty arrays (no mock data for aptitude — content is seeded server-side)
 */
export const useAptitudeStore = create((set, get) => ({
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
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ lessons: [], loading: false });
      } else {
        const res = await fetchAptitudeLessons();
        console.log('[APTITUDE] Lessons fetched:', res.data?.length);
        set({ lessons: res.data, loading: false });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching lessons:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  fetchLessonBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ currentLesson: null, loading: false });
      } else {
        const res = await fetchAptitudeLessonBySlug(slug);
        console.log('[APTITUDE] Lesson fetched:', res.data?.title);
        set({ currentLesson: res.data, loading: false });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching lesson:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  createLesson: async (data) => {
    if (USE_MOCK) return;
    const res = await createAptitudeLesson(data);
    console.log('[APTITUDE] Lesson created:', res.data?.title);
    set(state => ({ lessons: [res.data, ...state.lessons] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateAptitudeLesson(id, data);
    console.log('[APTITUDE] Lesson updated:', res.data?.title);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    if (USE_MOCK) return;
    await deleteAptitudeLesson(id);
    console.log('[APTITUDE] Lesson deleted:', id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ── Subtopics ── */

  fetchSubtopics: async (lessonSlug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ subtopics: [], loading: false });
      } else {
        const res = await fetchAptitudeSubtopics(lessonSlug);
        console.log('[APTITUDE] Subtopics fetched:', res.data?.length);
        set({ subtopics: res.data, loading: false });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching subtopics:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  fetchSubtopicBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ currentSubtopic: null, loading: false });
      } else {
        const res = await fetchAptitudeSubtopicBySlug(slug);
        console.log('[APTITUDE] Subtopic fetched:', res.data?.title);
        set({ currentSubtopic: res.data, loading: false });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching subtopic:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  createSubtopic: async (data) => {
    if (USE_MOCK) return;
    const res = await createAptitudeSubtopic(data);
    console.log('[APTITUDE] Subtopic created:', res.data?.title);
    set(state => ({ subtopics: [res.data, ...state.subtopics] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateAptitudeSubtopic(id, data);
    console.log('[APTITUDE] Subtopic updated:', res.data?.title);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    if (USE_MOCK) return;
    await deleteAptitudeSubtopic(id);
    console.log('[APTITUDE] Subtopic deleted:', id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ── Problems ── */

  fetchProblems: async (filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ problems: [], loading: false, total: 0, totalPages: 1 });
      } else {
        const res = await fetchAptitudeProblems(filters);
        console.log('[APTITUDE] Problems fetched:', res.total);
        set({ problems: res.data, loading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching problems:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  fetchSubtopicProblems: async (slug, filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ problems: [], loading: false });
      } else {
        const res = await fetchAptitudeSubtopicProblems(slug, filters);
        console.log('[APTITUDE] Subtopic problems fetched:', res.total);
        set({ problems: res.data, loading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching subtopic problems:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  fetchProblemBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Aptitude');
    set({ loading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ currentProblem: null, loading: false });
      } else {
        const res = await fetchAptitudeProblemBySlug(slug);
        console.log('[APTITUDE] Problem fetched:', res.data?.title);
        set({ currentProblem: res.data, loading: false });
      }
    } catch (error) {
      console.error('[APTITUDE] Error fetching problem:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Aptitude');
    }
  },

  createProblem: async (data) => {
    if (USE_MOCK) return;
    const res = await createAptitudeProblem(data);
    console.log('[APTITUDE] Problem created:', res.data?.title);
    set(state => ({ problems: [res.data, ...state.problems] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateAptitudeProblem(id, data);
    console.log('[APTITUDE] Problem updated:', res.data?.title);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    if (USE_MOCK) return;
    await deleteAptitudeProblem(id);
    console.log('[APTITUDE] Problem deleted:', id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
