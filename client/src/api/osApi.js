import { apiRequest } from './client.js';

/* Lessons */
export function fetchOsLessons() {
  return apiRequest('/os/lessons');
}

export function fetchOsLessonBySlug(slug) {
  return apiRequest(`/os/lessons/${slug}`);
}

export function createOsLesson(data) {
  return apiRequest('/os/lessons', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOsLesson(id, data) {
  return apiRequest(`/os/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteOsLesson(id) {
  return apiRequest(`/os/lessons/${id}`, { method: 'DELETE' });
}

/* Subtopics */
export function fetchOsSubtopics(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/os/subtopics?${params}`);
}

export function fetchOsSubtopicBySlug(slug) {
  return apiRequest(`/os/subtopics/${slug}`);
}

export function fetchOsSubtopicProblems(slug, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/os/subtopics/${slug}/problems?${params}`);
}

export function createOsSubtopic(data) {
  return apiRequest('/os/subtopics', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOsSubtopic(id, data) {
  return apiRequest(`/os/subtopics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteOsSubtopic(id) {
  return apiRequest(`/os/subtopics/${id}`, { method: 'DELETE' });
}

/* Problems */
export function fetchOsProblems(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/os/problems?${params}`);
}

export function fetchOsProblemBySlug(slug) {
  return apiRequest(`/os/problems/${slug}`);
}

export function createOsProblem(data) {
  return apiRequest('/os/problems', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOsProblem(id, data) {
  return apiRequest(`/os/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteOsProblem(id) {
  return apiRequest(`/os/problems/${id}`, { method: 'DELETE' });
}
