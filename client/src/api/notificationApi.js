import { apiRequest } from './client.js';

export function fetchNotifications() {
  return apiRequest('/notifications');
}

export function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
}

export function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', { method: 'PUT' });
}

export function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, { method: 'DELETE' });
}
