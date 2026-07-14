import { apiRequest } from './client.js';

export function searchUsers(query = {}) {
  const params = new URLSearchParams(query).toString();
  return apiRequest(`/users?${params}`);
}

export function getUserByUsername(username) {
  return apiRequest(`/users/${username}`);
}

export function updateProfile(username, data) {
  return apiRequest(`/users/${username}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function followUser(id) {
  return apiRequest(`/users/${id}/follow`, { method: 'POST' });
}

export function unfollowUser(id) {
  return apiRequest(`/users/${id}/follow`, { method: 'DELETE' });
}

export function getFollowers(id) {
  return apiRequest(`/users/${id}/followers`);
}

export function getFollowing(id) {
  return apiRequest(`/users/${id}/following`);
}

export function getUserActivity(id) {
  return apiRequest(`/users/${id}/activity`);
}
