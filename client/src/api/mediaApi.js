import { apiRequest } from './client.js';

export function uploadMedia(file, fileName) {
  return apiRequest('/media/upload', { method: 'POST', body: JSON.stringify({ file, fileName }) });
}

export function listMedia() {
  return apiRequest('/media');
}

export function deleteMedia(fileId) {
  return apiRequest(`/media/${fileId}`, { method: 'DELETE' });
}
