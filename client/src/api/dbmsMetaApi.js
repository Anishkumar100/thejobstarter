import { apiRequest } from './client.js';

/* Fetch all DBMS meta entries, optionally filtered by type */
export function fetchDbmsMeta(type = '') {
  const params = type ? `?type=${type}` : '';
  return apiRequest(`/dbms-meta${params}`);
}

/* Admin: create a new DBMS meta entry */
export function createDbmsMeta(data) {
  return apiRequest('/dbms-meta', { method: 'POST', body: JSON.stringify(data) });
}

/* Admin: update a DBMS meta entry */
export function updateDbmsMeta(id, data) {
  return apiRequest(`/dbms-meta/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

/* Admin: delete a DBMS meta entry */
export function deleteDbmsMeta(id) {
  return apiRequest(`/dbms-meta/${id}`, { method: 'DELETE' });
}

/* Admin: seed default DBMS meta entries */
export function seedDbmsMeta() {
  return apiRequest('/dbms-meta/seed', { method: 'POST' });
}
