import { apiRequest } from './client.js';

export function fetchInbox() {
  return apiRequest('/messages');
}

export function fetchThread(userId) {
  return apiRequest(`/messages/${userId}`);
}

export function sendMessage(userId, data) {
  return apiRequest(`/messages/${userId}`, { method: 'POST', body: JSON.stringify(data) });
}

export function markAsRead(messageId) {
  return apiRequest(`/messages/${messageId}/read`, { method: 'PUT' });
}

export function deleteMessage(messageId) {
  return apiRequest(`/messages/${messageId}`, { method: 'DELETE' });
}
