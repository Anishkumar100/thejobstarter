import { apiRequest } from './client.js';

/* Lessons */
export function fetchLessons() {
  return apiRequest('/dbms/lessons');
}

export function fetchLessonBySlug(slug) {
  return apiRequest(`/dbms/lessons/${slug}`);
}

export function createLesson(data) {
  return apiRequest('/dbms/lessons', { method: 'POST', body: JSON.stringify(data) });
}

export function updateLesson(id, data) {
  return apiRequest(`/dbms/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteLesson(id) {
  return apiRequest(`/dbms/lessons/${id}`, { method: 'DELETE' });
}

/* Subtopics */
export function fetchSubtopics(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dbms/subtopics?${params}`);
}

export function fetchSubtopicBySlug(slug) {
  return apiRequest(`/dbms/subtopics/${slug}`);
}

export function fetchSubtopicProblems(slug, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dbms/subtopics/${slug}/problems?${params}`);
}

export function createSubtopic(data) {
  return apiRequest('/dbms/subtopics', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSubtopic(id, data) {
  return apiRequest(`/dbms/subtopics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteSubtopic(id) {
  return apiRequest(`/dbms/subtopics/${id}`, { method: 'DELETE' });
}

/* Problems */
export function fetchProblems(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dbms/problems?${params}`);
}

export function fetchProblemBySlug(slug) {
  return apiRequest(`/dbms/problems/${slug}`);
}

export function createProblem(data) {
  return apiRequest('/dbms/problems', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProblem(id, data) {
  return apiRequest(`/dbms/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProblem(id) {
  return apiRequest(`/dbms/problems/${id}`, { method: 'DELETE' });
}
