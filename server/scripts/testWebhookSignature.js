/*
 * scripts/testWebhookSignature.js
 * Local test for Clerk webhook signature verification.
 *
 * Signs a fake Clerk `user.created` payload with the dev CLERK_WEBHOOK_SECRET
 * (from server/.env) using svix, then POSTs it to a running server:
 *   1. Valid signature  → expect 200 + "verified" log (or 500 only if DB is down)
 *   2. Tampered payload → expect 401
 *   3. Missing headers  → expect 400
 *
 * Usage:
 *   node scripts/testWebhookSignature.js
 *   BASE_URL=http://localhost:3999 node scripts/testWebhookSignature.js
 */
import { Webhook } from 'svix';
import 'dotenv/config';

const BASE = process.env.BASE_URL || 'http://localhost:3001';

/* ── Build a fake Clerk user.created event ── */
const runId = Date.now();
const payload = {
  data: {
    id: `user_test_wh_${runId}`,
    username: `webhook_test_${runId}`, /* unique per run to avoid username index collisions */
    first_name: 'Webhook',
    last_name: 'Test',
    email_addresses: [{ email_address: `wh_${Date.now()}@example.com` }],
    image_url: '',
    public_metadata: {}
  },
  object: 'event',
  type: 'user.created'
};

const secret = process.env.CLERK_WEBHOOK_SECRET;
if (!secret) {
  console.error('[TEST] FAIL: CLERK_WEBHOOK_SECRET is not set in server/.env');
  process.exit(1);
}

const wh = new Webhook(secret);
const body = JSON.stringify(payload);

/*
 * svix v1: sign(msgId, timestamp, payload) returns a signature string like "v1,xxx".
 * We assemble the svix headers ourselves (same shape Clerk sends).
 */
const msgId = `msg_${Date.now()}`;
const now = new Date();
const signature = wh.sign(msgId, now, body);
const headers = {
  'svix-id': msgId,
  'svix-timestamp': String(Math.floor(now.getTime() / 1000)),
  'svix-signature': signature
};

async function post(bodyToSend, headersToSend, label) {
  const res = await fetch(`${BASE}/api/users/webhook`, {
    method: 'POST',
    headers: headersToSend,
    body: bodyToSend
  });
  const text = await res.text();
  console.log(`[TEST] ${label}: HTTP ${res.status} — ${text.slice(0, 120)}`);
  return res.status;
}

/* ── Case 1: valid signature ── */
console.log('[TEST] Signing payload with CLERK_WEBHOOK_SECRET from .env');
let status = await post(body, { 'Content-Type': 'application/json', ...headers }, 'valid signature');
const case1 = status === 200;

/* ── Case 2: tampered payload, same headers ── */
const tampered = JSON.stringify({ ...payload, data: { ...payload.data, first_name: 'HACKER' } });
status = await post(tampered, { 'Content-Type': 'application/json', ...headers }, 'tampered payload');
const case2 = status === 401;

/* ── Case 3: no svix headers ── */
status = await post(body, { 'Content-Type': 'application/json' }, 'missing headers');
const case3 = status === 400;

console.log('\n[TEST] ── Results ──');
console.log(`[TEST] 1. valid signature   → ${case1 ? 'PASS' : 'FAIL'}`);
console.log(`[TEST] 2. tampered payload  → ${case2 ? 'PASS' : 'FAIL'}`);
console.log(`[TEST] 3. missing headers   → ${case3 ? 'PASS' : 'FAIL'}`);

/*
 * Cleanup: the valid-signature case runs the real handler, which upserts a User doc.
 * Remove it so repeated runs don't leave test users behind in the dev DB.
 */
try {
  const mongoose = (await import('mongoose')).default;
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  /* Find test users first so we can also remove their orphaned notifications */
  const testUsers = await db.collection('users').find({ clerkId: { $regex: '^user_test_wh_' } }).toArray();
  const testUserIds = testUsers.map(u => u._id);
  if (testUserIds.length > 0) {
    const notifResult = await db.collection('notifications').deleteMany({ user: { $in: testUserIds } });
    console.log(`[TEST] Cleanup: removed ${notifResult.deletedCount} orphaned notification(s)`);
  }
  const result = await db.collection('users').deleteMany({ clerkId: { $regex: '^user_test_wh_' } });
  console.log(`[TEST] Cleanup: removed ${result.deletedCount} test user(s)`);
  await mongoose.disconnect();
} catch (cleanupError) {
  console.warn('[TEST] Cleanup skipped (could not connect to DB):', cleanupError.message);
}

if (case1 && case2 && case3) {
  console.log('[TEST] ALL CHECKS PASSED ✅');
} else {
  console.log('[TEST] SOME CHECKS FAILED ❌');
  process.exit(1);
}
