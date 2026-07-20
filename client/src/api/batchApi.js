/* Batch API client — admin CRUD for batches */
import { apiRequest } from './client.js';

export function fetchBatches() {
  return apiRequest('/batches');
}

export function fetchBatchById(id) {
  return apiRequest(`/batches/${id}`);
}

export function createBatch(data) {
  return apiRequest('/batches', { method: 'POST', body: JSON.stringify(data) });
}

export function updateBatch(id, data) {
  return apiRequest(`/batches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function regenerateBatchCode(id) {
  return apiRequest(`/batches/${id}/regenerate-code`, { method: 'POST' });
}

export function deleteBatch(id) {
  return apiRequest(`/batches/${id}`, { method: 'DELETE' });
}

/* Coordinator batch endpoints */
export function fetchCoordinatorBatches() {
  return apiRequest('/coordinator/batches');
}

export function createCoordinatorBatch(data) {
  return apiRequest('/coordinator/batches', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCoordinatorBatch(id, data) {
  return apiRequest(`/coordinator/batches/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteCoordinatorBatch(id) {
  return apiRequest(`/coordinator/batches/${id}`, { method: 'DELETE' });
}

export function assignStudentToBatch(userId, batchId) {
  return apiRequest(`/coordinator/students/${userId}/batch`, { method: 'PATCH', body: JSON.stringify({ batchId }) });
}

export function removeStudentFromBatch(userId) {
  return apiRequest(`/coordinator/students/${userId}/batch/remove`, { method: 'PATCH' });
}

/* Student self-join via code */
export function linkBatch(code) {
  return apiRequest('/users/link-batch', { method: 'POST', body: JSON.stringify({ code }) });
}
