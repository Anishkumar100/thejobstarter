/*
 * Coordinator-only middleware — modeled on adminOnly.js
 *
 * Checks that the authenticated user has Clerk publicMetadata.role === 'coordinator'
 * AND that their User document has a non-null coordinatorFor field.
 *
 * On success, sets req.coordinatorCenterId to the user's coordinatorFor value.
 * This is the ONLY source of truth for the center ID — never accept it from
 * req.params or req.query in any coordinator controller (per rule 4).
 *
 * Must be used after requireAuth (req.userId must exist).
 */
import { createClerkClient } from '@clerk/backend';
import User from '../models/User.js';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

export async function requireCoordinator(req, res, next) {
  try {
    console.log('[AUTH] Checking coordinator role for user:', req.userId);

    /* Verify Clerk metadata */
    const clerkUser = await clerk.users.getUser(req.userId);
    if (!clerkUser || clerkUser.publicMetadata?.role !== 'coordinator') {
      console.log('[AUTH] Not a coordinator — metadata.role:', clerkUser?.publicMetadata?.role);
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    /* Load our User doc to get the coordinatorFor field */
    const user = await User.findOne({ clerkId: req.userId }).select('coordinatorFor').lean();
    if (!user || !user.coordinatorFor) {
      console.log('[AUTH] User not linked to any center as coordinator');
      return res.status(403).json({ error: 'Coordinator not assigned to any center' });
    }

    /* Set the center ID from the user's own document — never from request params */
    req.coordinatorCenterId = user.coordinatorFor;
    console.log('[AUTH] Coordinator verified for center:', req.coordinatorCenterId);
    next();
  } catch (error) {
    console.error('[AUTH] Coordinator check error:', error.message);
    res.status(403).json({ error: 'Coordinator access required' });
  }
}

export default requireCoordinator;
