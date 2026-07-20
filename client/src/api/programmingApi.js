import { apiRequest } from './client.js';

/*
 * Programming Concepts API client
 * Mirrors DSA/DBMS endpoint structure
 */

/* ── Lessons ── */
export function fetchProgrammingLessons() {
  return apiRequest('/programming/lessons');
}

export function fetchProgrammingLessonBySlug(slug) {
  return apiRequest(`/programming/lessons/${slug}`);
}

export function createProgrammingLesson(data) {
  return apiRequest('/programming/lessons', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProgrammingLesson(id, data) {
  return apiRequest(`/programming/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProgrammingLesson(id) {
  return apiRequest(`/programming/lessons/${id}`, { method: 'DELETE' });
}

/* ── Subtopics ── */
export function fetchProgrammingSubtopics(lessonSlug) {
  const params = lessonSlug ? `?lesson=${lessonSlug}` : '';
  return apiRequest(`/programming/subtopics${params}`);
}

export function fetchProgrammingSubtopicBySlug(slug) {
  return apiRequest(`/programming/subtopics/${slug}`);
}

export function createProgrammingSubtopic(data) {
  return apiRequest('/programming/subtopics', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProgrammingSubtopic(id, data) {
  return apiRequest(`/programming/subtopics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProgrammingSubtopic(id) {
  return apiRequest(`/programming/subtopics/${id}`, { method: 'DELETE' });
}

/* ── Problems ── */
export function fetchProgrammingProblems(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/programming/problems?${params}`);
}

export function fetchProgrammingSubtopicProblems(slug, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/programming/subtopics/${slug}/problems?${params}`);
}

export function fetchProgrammingProblemBySlug(slug) {
  return apiRequest(`/programming/problems/${slug}`);
}

export function createProgrammingProblem(data) {
  return apiRequest('/programming/problems', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProgrammingProblem(id, data) {
  return apiRequest(`/programming/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProgrammingProblem(id) {
  return apiRequest(`/programming/problems/${id}`, { method: 'DELETE' });
}
