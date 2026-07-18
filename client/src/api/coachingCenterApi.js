import { apiRequest } from './client.js';

export function fetchCoachingCenters() {
  return apiRequest('/coaching-centers');
}

export function fetchCoachingCenterById(id) {
  return apiRequest(`/coaching-centers/${id}`);
}

export function createCoachingCenter(data) {
  return apiRequest('/coaching-centers', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCoachingCenter(id, data) {
  return apiRequest(`/coaching-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function regenerateCenterCode(id) {
  return apiRequest(`/coaching-centers/${id}/regenerate-code`, { method: 'POST' });
}

export function deleteCoachingCenter(id) {
  return apiRequest(`/coaching-centers/${id}`, { method: 'DELETE' });
}

export function fetchCenterStudents(id) {
  return apiRequest(`/coaching-centers/${id}/students`);
}

export function removeStudentFromCenter(centerId, userId) {
  return apiRequest(`/coaching-centers/${centerId}/students/${userId}`, { method: 'PATCH' });
}

export function fetchCenterStudentById(centerId, userId) {
  return apiRequest(`/coaching-centers/${centerId}/students/${userId}`);
}

export function updateCenterStudent(centerId, userId, data) {
  return apiRequest(`/coaching-centers/${centerId}/students/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
}
