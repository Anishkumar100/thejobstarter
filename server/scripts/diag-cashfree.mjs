/*
 * Diagnostic #3 — test the NEW one-time mapping (single-cycle PERIODIC)
 * exactly as the fixed ensurePlan() would send it.
 */
import 'dotenv/config';
import pkg from 'cashfree-pg';
const { Cashfree, CFEnvironment } = pkg;

const client = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
  undefined, undefined, undefined, false
);

const plan = { id: 'diag-once', name: 'Lifetime', price: 499, interval: 'once' };
const cfg = { plan_type: 'PERIODIC', plan_interval_type: 'MONTH', plan_intervals: 1 };
const maxCycles = 1;

const planRequest = {
  plan_id: `plan_${plan.id}_${plan.price}`,
  plan_name: plan.name,
  plan_type: cfg.plan_type,
  plan_currency: 'INR',
  plan_max_amount: plan.price * maxCycles,
  plan_recurring_amount: plan.price,
  plan_max_cycles: 1,
  plan_interval_type: cfg.plan_interval_type,
  plan_intervals: cfg.plan_intervals,
};
console.log('[DIAG3] One-time payload:', JSON.stringify(planRequest, null, 1));

try {
  const resp = await client.SubsCreatePlan(planRequest);
  console.log('[DIAG3] OK:', JSON.stringify(resp.data, null, 1));
} catch (err) {
  console.log('[DIAG3] FAILED | status:', err.response?.status);
  console.log('[DIAG3] body:', JSON.stringify(err.response?.data, null, 1));
}
process.exit(0);
