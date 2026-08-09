/*
 * Subscription Expiry Utility
 *
 * Enforces subscription period ends. Before this file existed, users whose
 * paid period ended stayed 'active' forever — nothing ever downgraded them.
 *
 * Two enforcement layers:
 *   1. Lazy check — accessControl.resolveUser() flips a due user to 'expired'
 *      the moment they hit any content endpoint (see accessControl.js).
 *   2. Hourly sweep — startExpirySweep() bulk-updates every due user so the
 *      DB state is correct even without traffic (admin panels, stats, etc.).
 *
 * Lifetime plans (planInterval 'once'/'forever') store currentPeriodEnd = null
 * and are intentionally never expired.
 */
import User from '../models/User.js';

/*
 * expireDueSubscriptions()
 *
 * Marks every subscription with status 'active' whose currentPeriodEnd has
 * passed as 'expired' (and clears the stale period end).
 *
 * @returns {Promise<number>} — number of users expired in this run
 */
export async function expireDueSubscriptions() {
  const now = new Date();
  const result = await User.updateMany(
    {
      'subscription.status': 'active',
      'subscription.currentPeriodEnd': { $ne: null, $lt: now }
    },
    {
      $set: {
        'subscription.status': 'expired',
        'subscription.currentPeriodEnd': null
      }
    }
  );

  if (result.modifiedCount > 0) {
    console.log('[PAYMENT] Expiry sweep — expired', result.modifiedCount, 'subscriptions');
  }
  return result.modifiedCount;
}

/*
 * startExpirySweep(intervalMs = 60 * 60 * 1000)
 *
 * Runs expireDueSubscriptions() once immediately (on boot) and then every
 * hour. Safe to call multiple times — each run is a single bulk update.
 *
 * @param {number} intervalMs — sweep frequency (default: every hour)
 */
export function startExpirySweep(intervalMs = 60 * 60 * 1000) {
  /* Run once on startup so stale 'active' users are fixed without waiting */
  expireDueSubscriptions().catch((error) => {
    console.error('[PAYMENT] Initial expiry sweep failed:', error.message);
  });

  setInterval(() => {
    expireDueSubscriptions().catch((error) => {
      console.error('[PAYMENT] Expiry sweep failed:', error.message);
    });
  }, intervalMs);

  console.log('[PAYMENT] Expiry sweep scheduled every', intervalMs / 60000, 'minutes');
}

export default expireDueSubscriptions;