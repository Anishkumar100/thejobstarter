import { apiRequest } from './client.js';

export function fetchArticles(category, filters = {}) {
  const params = new URLSearchParams({ category, ...filters }).toString();
  return apiRequest(`/articles?${params}`);
}

export function fetchArticleBySlug(slug) {
  return apiRequest(`/articles/${slug}`);
}

export function createArticle(data) {
  return apiRequest('/articles', { method: 'POST', body: JSON.stringify(data) });
}

export function updateArticle(id, data) {
  return apiRequest(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteArticle(id) {
  return apiRequest(`/articles/${id}`, { method: 'DELETE' });
}

export function bookmarkArticle(slug) {
  return apiRequest(`/articles/${slug}/bookmark`, { method: 'POST' });
}

export function unbookmarkArticle(slug) {
  return apiRequest(`/articles/${slug}/bookmark`, { method: 'DELETE' });
}
