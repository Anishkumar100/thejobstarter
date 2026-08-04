import { apiRequest } from './client.js';

export function fetchAptitudeMeta(type = '') {
  const params = type ? `?type=${type}` : '';
  return apiRequest(`/aptitude-meta${params}`);
}

export function createAptitudeMeta(data) {
  return apiRequest('/aptitude-meta', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAptitudeMeta(id, data) {
  return apiRequest(`/aptitude-meta/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAptitudeMeta(id) {
  return apiRequest(`/aptitude-meta/${id}`, { method: 'DELETE' });
}

export function seedAptitudeMeta() {
  return apiRequest('/aptitude-meta/seed', { method: 'POST' });
}
