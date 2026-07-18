import { apiRequest } from './client.js';

export function fetchQuizByProblem(problemModel, slug) {
  return apiRequest(`/quizzes/by-problem/${problemModel}/${slug}`);
}

export function fetchQuizByProblemId(problemModel, problemId) {
  return apiRequest(`/quizzes/admin/by-problem/${problemModel}/${problemId}`);
}

export function submitQuizAttempt(quizId, answers) {
  return apiRequest(`/quizzes/${quizId}/attempt`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
}

export function createQuiz(data) {
  return apiRequest('/quizzes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateQuiz(id, data) {
  return apiRequest(`/quizzes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function deleteQuiz(id) {
  return apiRequest(`/quizzes/${id}`, {
    method: 'DELETE'
  });
}

export function fetchMyQuizAttempts() {
  return apiRequest('/quizzes/my-attempts');
}
