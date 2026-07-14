import { createClerkClient } from '@clerk/backend';

/*
 * Initialize Clerk backend SDK with secret key and publishable key
 * both are required for authenticateRequest() to verify JWTs
 */
export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

/*
 * Re-export createClerkClient for admin-only contexts
 */
export { createClerkClient };

export default clerk;
