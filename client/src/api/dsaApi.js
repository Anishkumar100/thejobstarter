import { apiRequest } from './client.js';

/* ===== Lessons ===== */
export function fetchDsaLessons() {
  return apiRequest('/dsa/lessons');
}

export function fetchDsaLessonBySlug(slug) {
  return apiRequest(`/dsa/lessons/${slug}`);
}

export function createDsaLesson(data) {
  return apiRequest('/dsa/lessons', { method: 'POST', body: JSON.stringify(data) });
}

export function updateDsaLesson(id, data) {
  return apiRequest(`/dsa/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteDsaLesson(id) {
  return apiRequest(`/dsa/lessons/${id}`, { method: 'DELETE' });
}

/* ===== Problems ===== */
export function fetchDsaProblems(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dsa/problems?${params}`);
}

export function fetchDsaProblemBySlug(slug) {
  return apiRequest(`/dsa/problems/${slug}`);
}

export function createDsaProblem(data) {
  return apiRequest('/dsa/problems', { method: 'POST', body: JSON.stringify(data) });
}

export function updateDsaProblem(id, data) {
  return apiRequest(`/dsa/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteDsaProblem(id) {
  return apiRequest(`/dsa/problems/${id}`, { method: 'DELETE' });
}

/* ===== Subtopics ===== */
export function fetchDsaSubtopics(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dsa/subtopics?${params}`);
}

export function fetchDsaSubtopicBySlug(slug) {
  return apiRequest(`/dsa/subtopics/${slug}`);
}

export function fetchDsaSubtopicProblems(slug, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/dsa/subtopics/${slug}/problems?${params}`);
}

export function createDsaSubtopic(data) {
  return apiRequest('/dsa/subtopics', { method: 'POST', body: JSON.stringify(data) });
}

export function updateDsaSubtopic(id, data) {
  return apiRequest(`/dsa/subtopics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteDsaSubtopic(id) {
  return apiRequest(`/dsa/subtopics/${id}`, { method: 'DELETE' });
}

export function bookmarkDsaProblem(slug) {
  return apiRequest(`/dsa/problems/${slug}/bookmark`, { method: 'POST' });
}

export function unbookmarkDsaProblem(slug) {
  return apiRequest(`/dsa/problems/${slug}/bookmark`, { method: 'DELETE' });
}
