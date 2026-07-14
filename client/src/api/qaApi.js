import { apiRequest } from './client.js';

export function fetchQuestions(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/qa?${params}`);
}

export function fetchQuestionById(id) {
  return apiRequest(`/qa/${id}`);
}

export function askQuestion(data) {
  return apiRequest('/qa', { method: 'POST', body: JSON.stringify(data) });
}

export function updateQuestion(id, data) {
  return apiRequest(`/qa/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteQuestion(id) {
  return apiRequest(`/qa/${id}`, { method: 'DELETE' });
}

export function postAnswer(questionId, data) {
  return apiRequest(`/qa/${questionId}/answers`, { method: 'POST', body: JSON.stringify(data) });
}

export function updateAnswer(questionId, answerId, data) {
  return apiRequest(`/qa/${questionId}/answers/${answerId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAnswer(questionId, answerId) {
  return apiRequest(`/qa/${questionId}/answers/${answerId}`, { method: 'DELETE' });
}

export function voteQuestion(questionId, vote) {
  return apiRequest(`/qa/${questionId}/vote`, { method: 'PUT', body: JSON.stringify({ vote }) });
}

export function voteAnswer(questionId, answerId, vote) {
  return apiRequest(`/qa/${questionId}/answers/${answerId}/vote`, { method: 'PUT', body: JSON.stringify({ vote }) });
}

export function acceptAnswer(questionId, answerId) {
  return apiRequest(`/qa/${questionId}/answers/${answerId}/accept`, { method: 'PUT' });
}

/* Admin: approve/reject a question */
export function approveQuestion(questionId) {
  return apiRequest(`/qa/${questionId}/approve`, { method: 'PUT' });
}

export function rejectQuestion(questionId) {
  return apiRequest(`/qa/${questionId}/reject`, { method: 'PUT' });
}

/* Question author: approve/reject an answer */
export function approveAnswer(questionId, answerId) {
  return apiRequest(`/qa/${questionId}/answers/${answerId}/approve`, { method: 'PUT' });
}

export function rejectAnswer(questionId, answerId) {
  return apiRequest(`/qa/${questionId}/answers/${answerId}/reject`, { method: 'PUT' });
}
