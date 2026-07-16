import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

/*
 * Middleware: Require admin role via Clerk publicMetadata.role === 'admin'
 * Must be used after requireAuth (req.userId must exist)
 */
export async function requireAdmin(req, res, next) {
  try {
    const user = await clerk.users.getUser(req.userId);
    if (!user || user.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('[AUTH] Admin check error:', error.message);
    res.status(403).json({ error: 'Admin access required' });
  }
}

export default requireAdmin;
