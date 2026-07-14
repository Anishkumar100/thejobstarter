/*
 * Simple in-memory cache for SSR-generated content pages
 * Cache entries expire after CACHE_TTL milliseconds
 */
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; /* 5 minutes */

/*
 * Middleware: Serve cached response if available and not expired
 * Caches the response for subsequent requests
 */
export function cacheMiddleware(req, res, next) {
  const key = req.originalUrl || req.url;

  /* Check cache */
  if (cache.has(key)) {
    const entry = cache.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      console.log('[CACHE] Hit:', key);
      return res.send(entry.html);
    }
    cache.delete(key);
  }

  /* Store original send to intercept and cache */
  const originalSend = res.send.bind(res);
  res.send = (html) => {
    cache.set(key, { html, timestamp: Date.now() });
    console.log('[CACHE] Set:', key);
    originalSend(html);
  };

  next();
}

/*
 * Clear entire cache (useful after admin updates)
 */
export function clearCache() {
  cache.clear();
  console.log('[CACHE] Cleared');
}

export default cacheMiddleware;
