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
    console.log('[DSA] Fetching lessons...');
    set({ lessonsLoading: true, lessonsError: null });
    try {
      if (USE_MOCK) {
        console.log('[DSA] Mock lessons:', mockLessons.length);
        set({ lessons: mockLessons, lessonsLoading: false });
      } else {
        const res = await fetchDsaLessons();
        console.log('[DSA] Lessons fetched:', res.data?.length);
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
    console.log('[DSA] Fetching lesson by slug:', slug);
    set({ lessonsLoading: true, lessonsError: null });
    try {
      if (USE_MOCK) {
        const lesson = mockLessons.find(l => l.slug === slug);
        const lessonProblems = mockProblems.filter(p => p.lessonSlug === slug);
        console.log('[DSA] Mock lesson found:', !!lesson, 'problems:', lessonProblems.length);
        set({ currentLesson: lesson || null, problems: lessonProblems, lessonsLoading: false, total: lessonProblems.length });
      } else {
        const res = await fetchDsaLessonBySlug(slug);
        console.log('[DSA] Lesson fetched:', res.data?.title);
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
    console.log('[DSA] Fetching problems with filters:', filters);
    set({ problemsLoading: true, problemsError: null });
    try {
      if (USE_MOCK) {
        let result = [...mockProblems];
        if (filters.lesson) result = result.filter(p => p.lessonSlug === filters.lesson);
        if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
        if (filters.company) result = result.filter(p => p.companies.includes(filters.company));
        if (filters.topic) result = result.filter(p => p.topics.includes(filters.topic));
        if (filters.search) result = result.filter(p => p.title.toLowerCase().includes(filters.search.toLowerCase()));
        console.log('[DSA] Mock problems filtered:', result.length);
        set({ problems: result, problemsLoading: false, total: result.length, totalPages: 1 });
      } else {
        const res = await fetchDsaProblems(filters);
        console.log('[DSA] Problems fetched from API:', res.total);
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
    console.log('[DSA] Fetching problem by slug:', slug);
    set({ problemsLoading: true, problemsError: null });
    try {
      if (USE_MOCK) {
        const problem = mockProblems.find(p => p.slug === slug);
        const lesson = mockLessons.find(l => l.slug === problem?.lessonSlug);
        console.log('[DSA] Mock problem found:', !!problem);
        set({ currentProblem: problem || null, currentLesson: lesson || null, problemsLoading: false });
      } else {
        const res = await fetchDsaProblemBySlug(slug);
        console.log('[DSA] Problem fetched:', res.data?.title);
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
    console.log('[DSA] Fetching subtopics with filters:', filters);
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      if (USE_MOCK) {
        let result = [...mockSubtopics];
        if (filters.lesson) result = result.filter(s => s.lessonSlug === filters.lesson);
        console.log('[DSA] Mock subtopics filtered:', result.length);
        set({ subtopics: result, subtopicsLoading: false });
      } else {
        const res = await fetchDsaSubtopics(filters);
        console.log('[DSA] Subtopics fetched:', res.data?.length);
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
    console.log('[DSA] Fetching subtopic by slug:', slug);
    set({ subtopicsLoading: true, subtopicsError: null });
    try {
      if (USE_MOCK) {
        const subtopic = mockSubtopics.find(s => s.slug === slug);
        const subtopicProblems = mockProblems.filter(p => p.subtopicSlug === slug || p.lessonSlug === subtopic?.lessonSlug);
        console.log('[DSA] Mock subtopic found:', !!subtopic, 'problems:', subtopicProblems.length);
        set({ currentSubtopic: subtopic || null, problems: subtopicProblems, subtopicsLoading: false, total: subtopicProblems.length });
      } else {
        const res = await fetchDsaSubtopicBySlug(slug);
        console.log('[DSA] Subtopic fetched:', res.data?.title);
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
    console.log('[DSA] Fetching problems for subtopic:', slug);
    set({ problemsLoading: true, problemsError: null });
    try {
      if (USE_MOCK) {
        let result = mockProblems.filter(p => p.subtopicSlug === slug || p.lessonSlug === slug);
        if (filters.difficulty) result = result.filter(p => p.difficulty === filters.difficulty);
        console.log('[DSA] Mock subtopic problems filtered:', result.length);
        set({ problems: result, problemsLoading: false, total: result.length, totalPages: 1 });
      } else {
        const res = await fetchDsaSubtopicProblems(slug, filters);
        console.log('[DSA] Subtopic problems fetched:', res.total);
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
    console.log('[DSA] Creating lesson...');
    if (USE_MOCK) return;
    const res = await createDsaLesson(data);
    console.log('[DSA] Lesson created:', res.data?.title);
    set(state => ({ lessons: [...state.lessons, res.data] }));
    return res.data;
  },

  updateLesson: async (id, data) => {
    console.log('[DSA] Updating lesson:', id);
    if (USE_MOCK) return;
    const res = await updateDsaLesson(id, data);
    console.log('[DSA] Lesson updated:', res.data?.title);
    set(state => ({
      lessons: state.lessons.map(l => l._id === id ? res.data : l),
      currentLesson: state.currentLesson?._id === id ? res.data : state.currentLesson
    }));
    return res.data;
  },

  deleteLesson: async (id) => {
    console.log('[DSA] Deleting lesson:', id);
    if (USE_MOCK) return;
    await deleteDsaLesson(id);
    console.log('[DSA] Lesson deleted:', id);
    set(state => ({ lessons: state.lessons.filter(l => l._id !== id) }));
  },

  /* ===== ADMIN: SUBTOPIC CRUD ===== */

  createSubtopic: async (data) => {
    console.log('[DSA] Creating subtopic...');
    if (USE_MOCK) return;
    const res = await createDsaSubtopic(data);
    console.log('[DSA] Subtopic created:', res.data?.title);
    set(state => ({ subtopics: [...state.subtopics, res.data] }));
    return res.data;
  },

  updateSubtopic: async (id, data) => {
    console.log('[DSA] Updating subtopic:', id);
    if (USE_MOCK) return;
    const res = await updateDsaSubtopic(id, data);
    console.log('[DSA] Subtopic updated:', res.data?.title);
    set(state => ({
      subtopics: state.subtopics.map(s => s._id === id ? res.data : s),
      currentSubtopic: state.currentSubtopic?._id === id ? res.data : state.currentSubtopic
    }));
    return res.data;
  },

  deleteSubtopic: async (id) => {
    console.log('[DSA] Deleting subtopic:', id);
    if (USE_MOCK) return;
    await deleteDsaSubtopic(id);
    console.log('[DSA] Subtopic deleted:', id);
    set(state => ({ subtopics: state.subtopics.filter(s => s._id !== id) }));
  },

  /* ===== ADMIN: PROBLEM CRUD ===== */

  createProblem: async (data) => {
    console.log('[DSA] Creating problem...');
    if (USE_MOCK) return;
    const res = await createDsaProblem(data);
    console.log('[DSA] Problem created:', res.data?.title);
    set(state => ({ problems: [...state.problems, res.data] }));
    return res.data;
  },

  updateProblem: async (id, data) => {
    console.log('[DSA] Updating problem:', id);
    if (USE_MOCK) return;
    const res = await updateDsaProblem(id, data);
    console.log('[DSA] Problem updated:', res.data?.title);
    set(state => ({
      problems: state.problems.map(p => p._id === id ? res.data : p),
      currentProblem: state.currentProblem?._id === id ? res.data : state.currentProblem
    }));
    return res.data;
  },

  deleteProblem: async (id) => {
    console.log('[DSA] Deleting problem:', id);
    if (USE_MOCK) return;
    await deleteDsaProblem(id);
    console.log('[DSA] Problem deleted:', id);
    set(state => ({ problems: state.problems.filter(p => p._id !== id) }));
  }
}));
