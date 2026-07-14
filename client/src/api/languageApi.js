import { apiRequest } from './client.js';

export function fetchLanguages() {
  return apiRequest('/languages');
}

export function fetchLanguageBySlug(slug) {
  return apiRequest(`/languages/${slug}`);
}

export function createLanguage(data) {
  return apiRequest('/languages', { method: 'POST', body: JSON.stringify(data) });
}

export function updateLanguage(id, data) {
  return apiRequest(`/languages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteLanguage(id) {
  return apiRequest(`/languages/${id}`, { method: 'DELETE' });
}
