import { apiRequest } from './client.js';

export function fetchMessages() {
  return apiRequest('/progress-messages');
}

export function fetchAllMessages() {
  return apiRequest('/progress-messages/admin');
}

export function createMessage(data) {
  return apiRequest('/progress-messages', { method: 'POST', body: JSON.stringify(data) });
}

export function updateMessage(id, data) {
  return apiRequest(`/progress-messages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteMessage(id) {
  return apiRequest(`/progress-messages/${id}`, { method: 'DELETE' });
}
