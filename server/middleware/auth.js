import clerk from '../config/clerk.js';

/*
 * Middleware: Require a valid Clerk session token
 * Extracts userId from the verified token and attaches to req.userId
 */
export async function requireAuth(req, res, next) {
  try {
    console.log('[AUTH] requireAuth called for:', req.originalUrl);
    console.log('[AUTH] Authorization header:', req.headers.authorization?.substring(0, 50));
    console.log('[AUTH] CLERK_SECRET_KEY set:', !!process.env.CLERK_SECRET_KEY);
    /*
     * Clerk's authenticateRequest needs a full URL to resolve the Clerk domain.
     * Express sub-routers set req.url to the relative path (e.g. /stats),
     * so we use req.originalUrl or construct an absolute URL.
     */
    const result = await clerk.authenticateRequest({
      url: `http://localhost:${process.env.PORT || 3001}${req.originalUrl}`,
      headers: req.headers,
      method: req.method
    });
    console.log('[AUTH] Result top-level keys:', Object.keys(result));
    console.log('[AUTH] Full result:', JSON.stringify(result, (key, val) => {
      // Omit authorization header for security
      if (key === 'authorization') return '[REDACTED]';
      return val;
    }, 2));
    const { status } = result;
    /*
     * Clerk v5 stores decoded JWT claims in 'claims' not 'payload'.
     * Try 'claims', 'payload', 'sessionClaims' and fallback to Bearer token decode.
     */
    const claims = result.claims || result.sessionClaims || result.payload;
    console.log('[AUTH] Claims found:', !!claims, 'keys:', claims ? Object.keys(claims) : []);
    let userId = claims?.sub || claims?.userId || claims?.id || claims?.user_id;
    // Last resort: manually decode the JWT payload from the Bearer token
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        console.log('[AUTH] Manual JWT decode keys:', Object.keys(decoded));
        userId = decoded.sub || decoded.userId || decoded.id || decoded.user_id;
        console.log('[AUTH] Manual JWT userId:', userId);
      } catch (jwtErr) {
        console.error('[AUTH] Manual JWT decode failed:', jwtErr.message);
      }
    }
    if (status !== 'signed-in' || !userId) {
      console.log('[AUTH] Auth failed, status:', status, 'userId found:', !!userId);
      return res.status(401).json({ error: 'Unauthorized — invalid token, status: ' + status });
    }
    req.userId = userId;
    console.log('[AUTH] Authenticated user:', req.userId);
    next();
  } catch (error) {
    console.error('[AUTH] Authentication error:', error.message);
    console.error('[AUTH] Full error:', error);
    res.status(401).json({ error: 'Unauthorized — ' + error.message });
  }
}

/*
 * Optional auth — attaches userId if token present, but does not block
 */
export async function optionalAuth(req, res, next) {
  try {
    const result = await clerk.authenticateRequest({
      url: `http://localhost:${process.env.PORT || 3001}${req.originalUrl}`,
      headers: req.headers,
      method: req.method
    });
    const claims = result.claims || result.sessionClaims || result.payload;
    let userId = claims?.sub || claims?.userId || claims?.id || claims?.user_id;
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        userId = decoded.sub || decoded.userId || decoded.id || decoded.user_id;
      } catch {
        /* Silently continue */
      }
    }
    if (result.status === 'signed-in' && userId) {
      req.userId = userId;
    }
  } catch {
    /* Silently continue without auth */
  }
  next();
}
