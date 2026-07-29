/*
 * Cashfree Payment Gateway Configuration
 *
 * Exports the Cashfree SDK class for use in paymentController.js.
 * Credentials and environment are set on each client instance
 * in the getCashfreeClient() helper within the controller.
 *
 * SDK: cashfree-pg v6.x (ES module compatible)
 */
import { Cashfree } from 'cashfree-pg';

console.log('[CASHFREE] SDK loaded | Env:', process.env.CASHFREE_ENV || 'sandbox');

export default Cashfree;
