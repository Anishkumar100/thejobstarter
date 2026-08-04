/*
 * Runtime verification helper — creates two test users in the Clerk TEST
 * instance and issues REAL session JWTs via the frontend API (password sign-in).
 * Users: runtime-admin@thejobstarter.in (admin role) + runtime-user@thejobstarter.in (normal)
 * Outputs JWTs to TEMP/opencode/runtime-tokens.json (never in the repo).
 */
import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

const PASSWORD = 'Rt!verif-2026-xQz!7';

/* Derive the Clerk frontend API domain from the publishable key (pk_test_<base64>)
   The base64 decodes to "<subdomain>.<domain>$" */
const pkB64 = process.env.CLERK_PUBLISHABLE_KEY.replace('pk_test_', '');
const padded = pkB64 + '='.repeat((4 - (pkB64.length % 4)) % 4);
const decoded = Buffer.from(padded, 'base64').toString('utf8').replace(/\$$/, '');
console.log('[TOKENS] FAPI domain:', decoded);
const FAPI = `https://${decoded}`;

async function ensureUser(email, role) {
  const existing = await clerk.users.getUserList({ emailAddress: [email] });
  if (existing.data.length > 0) {
    console.log(`[TOKENS] User already exists: ${email}`);
    /* Reset password to our known value so we can sign in */
    await clerk.users.updateUser(existing.data[0].id, { password: PASSWORD, publicMetadata: { role: role || {} } });
    return existing.data[0];
  }
  const user = await clerk.users.createUser({
    emailAddress: [email],
    password: PASSWORD,
    publicMetadata: { role: role || {} }
  });
  console.log(`[TOKENS] Created user: ${email} (id ${user.id})`);
  return user;
}

/*
 * Sign in via the Clerk frontend API to obtain a real session JWT.
 * 1) POST /v1/client  -> creates a client, returns __client cookie + client id
 * 2) POST /v1/client/sign_ins with { identifier, password, strategy: 'password' }
 * 3) Extract session id, then get JWT via backend sessions.getToken
 */
async function getSessionJwt(email) {
  /* Step 0 — register a dev browser (required for dev instances) */
  const devBrowserRes = await fetch(`${FAPI}/v1/dev_browser`, { method: 'POST' });
  if (!devBrowserRes.ok) {
    const t = await devBrowserRes.text();
    throw new Error(`POST /v1/dev_browser failed: ${devBrowserRes.status} ${t.slice(0, 300)}`);
  }
  const devBrowserJson = await devBrowserRes.json();
  const devBrowserJwt = devBrowserJson.token || devBrowserJson.response?.jwt;
  if (!devBrowserJwt) throw new Error('No dev_browser jwt in response: ' + JSON.stringify(devBrowserJson).slice(0, 300));
  const dbCookie = `__clerk_db_jwt=${devBrowserJwt}`;
  console.log('[TOKENS] Dev browser jwt acquired, len:', devBrowserJwt.length);

  /* Step 1 — create client with dev_browser cookie */
  const clientRes = await fetch(`${FAPI}/v1/client`, { method: 'POST', headers: { Cookie: dbCookie } });
  if (!clientRes.ok) {
    const t = await clientRes.text();
    throw new Error(`POST /v1/client failed: ${clientRes.status} ${t.slice(0, 300)}`);
  }
  const clientJson = await clientRes.json();
  const clientId = clientJson.response?.id || clientJson.client?.id;
  const setCookie = clientRes.headers.get('set-cookie') || '';
  const clientCookie = setCookie.split(';')[0];
  console.log('[TOKENS] Client created:', clientId, '| cookie:', clientCookie ? clientCookie.slice(0, 40) + '...' : '(none)');

  /* Step 2 — sign in with password */
  const body = { identifier: email, password: PASSWORD, strategy: 'password' };
  const signInRes = await fetch(`${FAPI}/v1/client/sign_ins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: [dbCookie, clientCookie].filter(Boolean).join('; ')
    },
    body: JSON.stringify(body)
  });
  if (!signInRes.ok) {
    const t = await signInRes.text();
    throw new Error(`POST /v1/client/sign_ins failed: ${signInRes.status} ${t.slice(0, 400)}`);
  }
  const signInJson = await signInRes.json();
  const session = signInJson.client?.sessions?.[0] || signInJson.response?.client?.sessions?.[0];
  const sessionId = session?.id;
  if (!sessionId) {
    throw new Error('No session in sign-in response: ' + JSON.stringify(signInJson).slice(0, 400));
  }
  console.log('[TOKENS] Session created:', sessionId, 'status:', session.status);

  /* Step 3 — fetch the JWT for that session via backend SDK */
  const token = await clerk.sessions.getToken({ sessionId });
  const jwt = token.jwt;
  if (!jwt) throw new Error('No jwt returned for session ' + sessionId);
  console.log('[TOKENS] JWT length:', jwt.length, '| prefix:', jwt.slice(0, 20));
  return jwt;
}

const admin = await ensureUser('runtime-admin@thejobstarter.in', 'admin');
const normal = await ensureUser('runtime-user@thejobstarter.in', null);

/* Make sure roles are set correctly (in case users pre-existed) */
await clerk.users.updateUser(admin.id, { publicMetadata: { role: 'admin' } });
await clerk.users.updateUser(normal.id, { publicMetadata: {} });

console.log('[TOKENS] Signing in as admin...');
const adminJwt = await getSessionJwt('runtime-admin@thejobstarter.in');
console.log('[TOKENS] Signing in as normal user...');
const normalJwt = await getSessionJwt('runtime-user@thejobstarter.in');

const out = path.join(process.env.TEMP || 'C:/Users/akcod/AppData/Local/Temp', 'opencode', 'runtime-tokens.json');
writeFileSync(out, JSON.stringify({
  adminUserId: admin.id,
  normalUserId: normal.id,
  adminToken: adminJwt,
  normalToken: normalJwt
}, null, 2));
console.log('[TOKENS] JWTs written to', out);
