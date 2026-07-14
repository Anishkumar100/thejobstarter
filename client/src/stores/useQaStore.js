import { create } from 'zustand';
import {
  fetchQuestions, fetchQuestionById, askQuestion, postAnswer,
  voteQuestion, voteAnswer, acceptAnswer,
  deleteQuestion as deleteQuestionApi, deleteAnswer as deleteAnswerApi,
  approveQuestion as approveQuestionApi, rejectQuestion as rejectQuestionApi,
  approveAnswer as approveAnswerApi, rejectAnswer as rejectAnswerApi
} from '../api/qaApi.js';

import { usePageLoadingStore } from './usePageLoadingStore.js';

export const useQaStore = create((set, get) => ({
  questions: [],
  currentQuestion: null,
  answers: [],
  loading: false,
  error: null,

  /*
   * Fetch all questions with optional filters
   */
  fetchQuestions: async (filters = {}) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Q&A');
    console.log('[QA] Fetching questions');
    set({ loading: true, error: null });
    try {
      const res = await fetchQuestions(filters);
      set({ questions: res.data, loading: false });
    } catch (error) {
      console.error('[QA] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Q&A');
    }
  },

  /*
   * Fetch a single question by ID, along with its answers
   * Server returns: { data: { ...question, answers: [...] } }
   */
  fetchQuestionById: async (id) => {
    const pl = usePageLoadingStore.getState();
    pl.start('Q&A');
    console.log('[QA] Fetching question:', id);
    set({ loading: true, error: null });
    try {
      const res = await fetchQuestionById(id);
      set({ currentQuestion: res.data, answers: res.data.answers || [], loading: false });
    } catch (error) {
      console.error('[QA] Error:', error.message);
      set({ error: error.message, loading: false });
    } finally {
      pl.stop('Q&A');
    }
  },

  /*
   * Ask a new question
   */
  askQuestion: async (data) => {
    console.log('[QA] Asking question...');
    const res = await askQuestion(data);
    set(state => ({ questions: [res.data, ...state.questions] }));
    return res.data;
  },

  /*
   * Post an answer to a question
   */
  postAnswer: async (questionId, data) => {
    console.log('[QA] Posting answer...');
    const res = await postAnswer(questionId, data);
    set(state => ({ answers: [...state.answers, res.data] }));
    return res.data;
  },

  /*
   * Vote on a question (upvote/downvote)
   */
  voteOnQuestion: async (questionId, vote) => {
    console.log('[QA] Voting on question:', questionId, vote);
    await voteQuestion(questionId, vote);
  },

  /*
   * Vote on an answer
   */
  voteOnAnswer: async (questionId, answerId, vote) => {
    console.log('[QA] Voting on answer:', answerId);
    await voteAnswer(questionId, answerId, vote);
  },

  /*
   * Accept an answer as correct (question author only)
   */
  acceptAnswerAction: async (questionId, answerId) => {
    console.log('[QA] Accepting answer:', answerId);
    await acceptAnswer(questionId, answerId);
    set(state => ({
      answers: state.answers.map(a => ({ ...a, accepted: a._id === answerId }))
    }));
  },

  /*
   * Delete an answer (admin or answer author)
   */
  deleteAnswerAction: async (questionId, answerId) => {
    console.log('[QA] Deleting answer:', answerId);
    await deleteAnswerApi(questionId, answerId);
    set(state => ({
      answers: state.answers.filter(a => a._id !== answerId)
    }));
  },

  /*
   * Delete a question and all its answers
   */
  deleteQuestion: async (id) => {
    console.log('[QA] Deleting question:', id);
    await deleteQuestionApi(id);
    set(state => ({
      questions: state.questions.filter(q => q._id !== id)
    }));
  },

  /*
   * Admin: Approve a pending question
   */
  approveQuestion: async (id) => {
    console.log('[QA] Approving question:', id);
    const res = await approveQuestionApi(id);
    set(state => ({
      questions: state.questions.map(q => q._id === id ? res.data : q)
    }));
    return res.data;
  },

  /*
   * Admin: Reject a question
   */
  rejectQuestion: async (id) => {
    console.log('[QA] Rejecting question:', id);
    const res = await rejectQuestionApi(id);
    set(state => ({
      questions: state.questions.map(q => q._id === id ? res.data : q)
    }));
    return res.data;
  },

  /*
   * Question author: Approve a pending answer
   */
  approveAnswerAction: async (questionId, answerId) => {
    console.log('[QA] Approving answer:', answerId);
    const res = await approveAnswerApi(questionId, answerId);
    set(state => ({
      answers: state.answers.map(a => a._id === answerId ? res.data : a)
    }));
    return res.data;
  },

  /*
   * Question author: Reject a pending answer
   */
  rejectAnswerAction: async (questionId, answerId) => {
    console.log('[QA] Rejecting answer:', answerId);
    const res = await rejectAnswerApi(questionId, answerId);
    set(state => ({
      answers: state.answers.map(a => a._id === answerId ? res.data : a)
    }));
    return res.data;
  }
}));
