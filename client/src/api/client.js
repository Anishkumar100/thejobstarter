const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/*
 * Get Clerk JWT token from the global Clerk instance
 * Waits for Clerk session to be ready (up to 3s) before returning null
 */
async function getClerkToken() {
  try {
    /* Clerk not loaded yet */
    if (!window.Clerk) return null;

    /* Session available — get token immediately */
    if (window.Clerk.session) {
      return await window.Clerk.session.getToken();
    }

    /*
     * Clerk loaded but session not ready yet (still hydrating).
     * Poll briefly so the Home page (which fetches on mount)
     * doesn't fire a tokenless request before auth initializes.
     */
    return new Promise((resolve) => {
      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if (window.Clerk?.session) {
          clearInterval(check);
          resolve(window.Clerk.session.getToken());
        } else if (attempts >= 30) {
          /* ~3s timeout — user likely not signed in */
          clearInterval(check);
          resolve(null);
        }
      }, 100);
    });
  } catch {
    return null;
  }
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
