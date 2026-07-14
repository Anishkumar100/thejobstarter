import { apiRequest } from './client.js';

export function fetchPosts(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/blog?${params}`);
}

export function fetchPostBySlug(slug) {
  return apiRequest(`/blog/${slug}`);
}

export function createPost(data) {
  return apiRequest('/blog', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePost(id, data) {
  return apiRequest(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deletePost(id) {
  return apiRequest(`/blog/${id}`, { method: 'DELETE' });
}
