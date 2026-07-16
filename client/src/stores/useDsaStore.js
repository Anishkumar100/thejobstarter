import { create } from 'zustand';
import { dsaLessons as mockLessons, problems as mockProblems, subtopics as mockSubtopics } from '../data/dsa.js';
import {
  fetchDsaLessons, fetchDsaLessonBySlug,
  fetchDsaProblems, fetchDsaProblemBySlug,
  createDsaLesson, updateDsaLesson, deleteDsaLesson,
  createDsaProblem, updateDsaProblem, deleteDsaProblem,
  fetchDsaSubtopics, fetchDsaSubtopicBySlug, fetchDsaSubtopicProblems,
  createDsaSubtopic, updateDsaSubtopic, deleteDsaSubtopic
} from '../api/dsaApi.js';

import { usePageLoadingStore } from './usePageLoadingStore.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useDsaStore = create((set, get) => ({
  /* === Lesson state === */
  lessons: [],
  currentLesson: null,
  lessonsLoading: false,
  lessonsError: null,

  /* === Problem state === */
  problems: [],
  currentProblem: null,
  problemsLoading: false,
  problemsError: null,

  /* === Subtopic state === */
  subtopics: [],
  currentSubtopic: null,
  subtopicsLoading: false,
  subtopicsError: null,

  /* === Shared loading (for backward compat) === */
  get loading() { return get().lessonsLoading || get().subtopicsLoading || get().problemsLoading; },
  get error() { return get().lessonsError || get().subtopicsError || get().problemsError; },

  total: 0,
  page: 1,
  totalPages: 1,

  /* ===== LESSONS ===== */

  /*
   * Fetch all DSA lessons
   */
  fetchLessons: async () => {
    const pl = usePageLoadingStore.getState();
    pl.start('DSA');
    set({ lessonsLoading: true, lessonsError: null });
    try {
      if (USE_MOCK) {
        set({ lessons: mockLessons, lessonsLoading: false });
      } else {
        const res = await fetchDsaLessons();
        set({ lessons: res.data, lessonsLoading: false });
      }
    } catch (error) {
      console.error('[DSA] Error fetching lessons:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /*
   * Fetch a single lesson by slug, includes its problems
   */
  fetchLessonBySlug: async (slug) => {
    set({ lessonsLoading: true, lessonsError: null });
    try {
      if (USE_MOCK) {
        const lesson = mockLessons.find(l => l.slug === slug);
        const lessonProblems = mockProblems.filter(p => p.lessonSlug === slug);
        set({ currentLesson: lesson || null, problems: lessonProblems, lessonsLoading: false, total: lessonProblems.length });
      } else {
        const res = await fetchDsaLessonBySlug(slug);
        set({ currentLesson: res.data, problems: res.data.problems || [], lessonsLoading: false, total: res.data.problems?.length || 0 });
      }
    } catch (error) {
      console.error('[DSA] Error fetching lesson:', error.message);
      set({ lessonsError: error.message, lessonsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /* ===== PROBLEMS ===== */

  /*
   * Fetch problems with optional filters: difficulty, company, lesson, search
   */
  fetchProblems: async (filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('DSA');
    set({ problemsLoading: true, problemsError: null });
    try {
      if (USE_MOCK) {
        let result = [...mockProblems];
        if (filters.lesson) result = result.filter(p => p.lessonSlug === filters.lesson);
        if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
        if (filters.company) result = result.filter(p => p.companies.includes(filters.company));
        if (filters.topic) result = result.filter(p => p.topics.includes(filters.topic));
        if (filters.search) result = result.filter(p => p.title.toLowerCase().includes(filters.search.toLowerCase()));
        set({ problems: result, problemsLoading: false, total: result.length, totalPages: 1 });
      } else {
        const res = await fetchDsaProblems(filters);
        set({ problems: res.data, problemsLoading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[DSA] Error fetching problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /*
   * Fetch a single problem by its slug
   */
  fetchProblemBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('DSA');
    set({ problemsLoading: true, problemsError: null });
    try {
      if (USE_MOCK) {
        const problem = mockProblems.find(p => p.slug === slug);
        const lesson = mockLessons.find(l => l.slug === problem?.lessonSlug);
        set({ currentProblem: problem || null, currentLesson: lesson || null, problemsLoading: false });
      } else {
        const res = await fetchDsaProblemBySlug(slug);
        set({ currentProblem: res.data, currentLesson: res.data?.lesson || null, problemsLoading: false });
      }
    } catch (error) {
      console.error('[DSA] Error fetching problem:', error.message);
      set({ problemsError: error.message, currentProblem: null, problemsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /* ===== SUBTOPICS ===== */

  /*
   * Fetch subtopics, optionally filtered by lesson slug
   */
  fetchSubtopics: async (filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('DSA');
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      if (USE_MOCK) {
        let result = [...mockSubtopics];
        if (filters.lesson) result = result.filter(s => s.lessonSlug === filters.lesson);
        set({ subtopics: result, subtopicsLoading: false });
      } else {
        const res = await fetchDsaSubtopics(filters);
        set({ subtopics: res.data, subtopicsLoading: false });
      }
    } catch (error) {
      console.error('[DSA] Error fetching subtopics:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /*
   * Fetch a single subtopic by slug, includes its problems
   */
  fetchSubtopicBySlug: async (slug) => {
    const pl = usePageLoadingStore.getState();
    pl.start('DSA');
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      if (USE_MOCK) {
        const subtopic = mockSubtopics.find(s => s.slug === slug);
        const subtopicProblems = mockProblems.filter(p => p.subtopicSlug === slug || p.lessonSlug === subtopic?.lessonSlug);
        set({ currentSubtopic: subtopic || null, problems: subtopicProblems, subtopicsLoading: false, total: subtopicProblems.length });
      } else {
        const res = await fetchDsaSubtopicBySlug(slug);
        set({ currentSubtopic: res.data, problems: res.data.problems || [], subtopicsLoading: false, total: res.data.problems?.length || 0 });
      }
    } catch (error) {
      console.error('[DSA] Error fetching subtopic:', error.message);
      set({ subtopicsError: error.message, subtopicsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /*
   * Fetch problems for a subtopic
   */
  fetchSubtopicProblems: async (slug, filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('DSA');
    set({ problemsLoading: true, problemsError: null });
    try {
      if (USE_MOCK) {
        let result = mockProblems.filter(p => p.subtopicSlug === slug || p.lessonSlug === slug);
        if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
        set({ problems: result, problemsLoading: false, total: result.length, totalPages: 1 });
      } else {
        const res = await fetchDsaSubtopicProblems(slug, filters);
        set({ problems: res.data, problemsLoading: false, total: res.total, page: res.page, totalPages: res.totalPages });
      }
    } catch (error) {
      console.error('[DSA] Error fetching subtopic problems:', error.message);
      set({ problemsError: error.message, problemsLoading: false });
    } finally {
      pl.stop('DSA');
    }
  },

  /* ===== ADMIN: LESSON & SUBTOPIC CRUD ===== */

  createLesson: async (data) => {
    if (USE_MOCK) return;
    const res = await createDsaLesson(data);
    set(state => ({ lessons: [...state.lessons, res.data] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateDsaLesson(id, data);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    if (USE_MOCK) return;
    await deleteDsaLesson(id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ===== ADMIN: SUBTOPIC CRUD ===== */

  createSubtopic: async (data) => {
    if (USE_MOCK) return;
    const res = await createDsaSubtopic(data);
    set(state => ({ subtopics: [...state.subtopics, res.data] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateDsaSubtopic(id, data);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    if (USE_MOCK) return;
    await deleteDsaSubtopic(id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ===== ADMIN: PROBLEM CRUD ===== */

  createProblem: async (data) => {
    if (USE_MOCK) return;
    const res = await createDsaProblem(data);
    set(state => ({ problems: [...state.problems, res.data] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    if (USE_MOCK) return;
    const res = await updateDsaProblem(id, data);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    if (USE_MOCK) return;
    await deleteDsaProblem(id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
