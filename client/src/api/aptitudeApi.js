import { apiRequest } from './client.js';

/*
 * Aptitude API client
 * Mirrors Programming endpoint structure
 */

/* ── Lessons ── */
export function fetchAptitudeLessons() {
  return apiRequest('/aptitude/lessons');
}

export function fetchAptitudeLessonBySlug(slug) {
  return apiRequest(`/aptitude/lessons/${slug}`);
}

export function createAptitudeLesson(data) {
  return apiRequest('/aptitude/lessons', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAptitudeLesson(id, data) {
  return apiRequest(`/aptitude/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAptitudeLesson(id) {
  return apiRequest(`/aptitude/lessons/${id}`, { method: 'DELETE' });
}

/* ── Subtopics ── */
export function fetchAptitudeSubtopics(lessonSlug) {
  const params = lessonSlug ? `?lesson=${lessonSlug}` : '';
  return apiRequest(`/aptitude/subtopics${params}`);
}

export function fetchAptitudeSubtopicBySlug(slug) {
  return apiRequest(`/aptitude/subtopics/${slug}`);
}

export function createAptitudeSubtopic(data) {
  return apiRequest('/aptitude/subtopics', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAptitudeSubtopic(id, data) {
  return apiRequest(`/aptitude/subtopics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAptitudeSubtopic(id) {
  return apiRequest(`/aptitude/subtopics/${id}`, { method: 'DELETE' });
}

/* ── Problems ── */
export function fetchAptitudeProblems(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/aptitude/problems?${params}`);
}

export function fetchAptitudeSubtopicProblems(slug, filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/aptitude/subtopics/${slug}/problems?${params}`);
}

export function fetchAptitudeProblemBySlug(slug) {
  return apiRequest(`/aptitude/problems/${slug}`);
}

export function createAptitudeProblem(data) {
  return apiRequest('/aptitude/problems', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAptitudeProblem(id, data) {
  return apiRequest(`/aptitude/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAptitudeProblem(id) {
  return apiRequest(`/aptitude/problems/${id}`, { method: 'DELETE' });
}
