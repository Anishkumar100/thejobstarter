import { apiRequest } from './client.js';

export function markComplete(subject, targetType, targetSlug) {
  return apiRequest('/progress', {
    method: 'POST',
    body: JSON.stringify({ subject, targetType, targetSlug })
  });
}

export function fetchProgressSummary() {
  return apiRequest('/progress/summary');
}

export function fetchDailyCount() {
  return apiRequest('/progress/daily');
}

export function fetchAdminUserDailyCount(userId) {
  return apiRequest(`/progress/admin/${userId}/daily`);
}

export function fetchAdminUserSummary(userId) {
  return apiRequest(`/progress/admin/${userId}/summary`);
}

export function checkItemCompleted(subject, targetType, targetSlug) {
  const params = new URLSearchParams({ subject, targetType, targetSlug });
  return apiRequest(`/progress/check-completed?${params}`);
}
