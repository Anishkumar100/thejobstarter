const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/*
 * Get Clerk JWT token from the global Clerk instance
 */
async function getClerkToken() {
  try {
    if (window.Clerk?.session) {
      return await window.Clerk.session.getToken();
    }
  } catch {
    /* Clerk not loaded or not signed in */
  }
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  const token = await getClerkToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return res.json();
}
