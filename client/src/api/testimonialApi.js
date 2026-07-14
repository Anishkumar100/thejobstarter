import { apiRequest } from './client.js';

export function fetchTestimonials() {
  return apiRequest('/testimonials');
}

export function fetchAllTestimonials() {
  return apiRequest('/testimonials/all');
}

export function createTestimonial(data) {
  return apiRequest('/testimonials', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTestimonial(id, data) {
  return apiRequest(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteTestimonial(id) {
  return apiRequest(`/testimonials/${id}`, { method: 'DELETE' });
}
