/*
 * Course Offering API Client
 * Admin: /api/course-offerings (full CRUD)
 * Coordinator: /api/coordinator/course-offerings (scoped)
 * Public (auth): /api/coaching-centers/:centerId/course-offerings (student dropdown)
 * Student: /api/users/select-course (self-select)
 */
import { apiRequest } from './client.js';

/* ── Admin ── */

export function fetchCourseOfferings() {
  return apiRequest('/course-offerings');
}

export function fetchCourseOfferingById(id) {
  return apiRequest(`/course-offerings/${id}`);
}

export function createCourseOffering(data) {
  return apiRequest('/course-offerings', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCourseOffering(id, data) {
  return apiRequest(`/course-offerings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteCourseOffering(id) {
  return apiRequest(`/course-offerings/${id}`, { method: 'DELETE' });
}

/* ── Coordinator ── */

export function fetchCoordinatorCourseOfferings() {
  return apiRequest('/coordinator/course-offerings');
}

export function createCoordinatorCourseOffering(data) {
  return apiRequest('/coordinator/course-offerings', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCoordinatorCourseOffering(id, data) {
  return apiRequest(`/coordinator/course-offerings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteCoordinatorCourseOffering(id) {
  return apiRequest(`/coordinator/course-offerings/${id}`, { method: 'DELETE' });
}

/* ── Student self-select ── */

export function selectCourse(courseOfferingId) {
  return apiRequest('/users/select-course', {
    method: 'POST',
    body: JSON.stringify({ courseOfferingId })
  });
}

/* ── Public: fetch active offerings for a center (used in EditProfile dropdown) ── */

export function fetchCenterCourseOfferings(centerId) {
  return apiRequest(`/coaching-centers/${centerId}/course-offerings`);
}
