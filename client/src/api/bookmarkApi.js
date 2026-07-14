import { apiRequest } from './client.js';

export function bookmarkTarget(targetType, targetSlug) {
  return apiRequest(`/${targetType}/${targetSlug}/bookmark`, { method: 'POST' });
}

export function unbookmarkTarget(targetType, targetSlug) {
  return apiRequest(`/${targetType}/${targetSlug}/bookmark`, { method: 'DELETE' });
}
