import { apiRequest } from './client.js';

export function subscribeToNewsletter(email) {
  return apiRequest('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
}
