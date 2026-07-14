import { apiRequest } from './client.js';

/* Fetch all DSA meta entries, optionally filtered by type */
export function fetchDsaMeta(type = '') {
  const params = type ? `?type=${type}` : '';
  return apiRequest(`/dsa-meta${params}`);
}

/* Admin: create a new DSA meta entry */
export function createDsaMeta(data) {
  return apiRequest('/dsa-meta', { method: 'POST', body: JSON.stringify(data) });
}

/* Admin: update a DSA meta entry */
export function updateDsaMeta(id, data) {
  return apiRequest(`/dsa-meta/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

/* Admin: delete a DSA meta entry */
export function deleteDsaMeta(id) {
  return apiRequest(`/dsa-meta/${id}`, { method: 'DELETE' });
}

/* Admin: seed default DSA meta entries */
export function seedDsaMeta() {
  return apiRequest('/dsa-meta/seed', { method: 'POST' });
}