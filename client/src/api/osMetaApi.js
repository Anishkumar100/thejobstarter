import { apiRequest } from './client.js';

export function fetchOsMeta() {
  return apiRequest('/os-meta');
}

export function createOsMeta(data) {
  return apiRequest('/os-meta', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOsMeta(id, data) {
  return apiRequest(`/os-meta/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteOsMeta(id) {
  return apiRequest(`/os-meta/${id}`, { method: 'DELETE' });
}

export function seedOsMeta() {
  return apiRequest('/os-meta/seed', { method: 'POST' });
}
