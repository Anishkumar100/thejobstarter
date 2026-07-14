import { apiRequest } from './client.js';

export function fetchCheatsheets(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/cheatsheets?${params}`);
}

export function fetchCheatsheetBySlug(slug) {
  return apiRequest(`/cheatsheets/${slug}`);
}

export function downloadCheatsheet(slug) {
  return apiRequest(`/cheatsheets/${slug}/download`);
}

export function createCheatsheet(data) {
  return apiRequest('/cheatsheets', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCheatsheet(id, data) {
  return apiRequest(`/cheatsheets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteCheatsheet(id) {
  return apiRequest(`/cheatsheets/${id}`, { method: 'DELETE' });
}
