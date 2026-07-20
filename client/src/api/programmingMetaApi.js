import { apiRequest } from './client.js';

export function fetchProgrammingMeta(type = '') {
  const params = type ? `?type=${type}` : '';
  return apiRequest(`/programming-meta${params}`);
}

export function createProgrammingMeta(data) {
  return apiRequest('/programming-meta', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProgrammingMeta(id, data) {
  return apiRequest(`/programming-meta/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProgrammingMeta(id) {
  return apiRequest(`/programming-meta/${id}`, { method: 'DELETE' });
}

export function seedProgrammingMeta() {
  return apiRequest('/programming-meta/seed', { method: 'POST' });
}
