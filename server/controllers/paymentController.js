/*
 * Payment Controller
 *
 * Handles all Cashfree subscription operations:
 *   - createSubscription  (POST /api/payments/create-subscription)
 *   - handleWebhook       (POST /api/payments/webhook)
 *   - applyPromo          (POST /api/payments/apply-promo)
 *   - getStatus           (GET  /api/payments/status)
 *   - cancelSubscription  (POST /api/payments/cancel)
 *
 * The Cashfree SDK (cashfree-pg) is used for API calls and webhook verification.
 * API version: 2026-01-01
 */
import User from '../models/User.js';
import PromoCode from '../models/PromoCode.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import SiteConfig from '../models/SiteConfig.js';
import { getSubscriptionSettings } from './siteConfigController.js';

/* Cashfree SDK v6 is CommonJS — import the Cashfree class directly */
import pkg from 'cashfree-pg';
const { Cashfree, CFEnvironment } = pkg;

/*
 * Helper: create a configured Cashfree client.
 * SDK v6 Cashfree constructor: new Cashfree(XEnvironment, XClientId, XClientSecret, ...)
 */
function getCashfreeClient() {
  const env = process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;
  /*
   * Pass XEnableErrorAnalytics = false (7th constructor param) to prevent
   * the SDK from calling Sentry.init() with profilesSampleRate: 1.0.
   * On Vercel's serverless sandbox, the V8 profiling hooks needed by
   * @sentry/node are restricted, causing the process to crash.
   *
   * The remaining params (XPartnerKey, XClientSignature, XPartnerMerchantId,
   * axios) are left as undefined since they're not needed.
   */
  const client = new Cashfree(
    env,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY,
    undefined, /* XPartnerKey */
    undefined, /* XClientSignature */
    undefined, /* XPartnerMerchantId */
    false      /* XEnableErrorAnalytics — disable Sentry to avoid Vercel crash */
  );
  /*
   * Let the SDK keep its default XApiVersion ('2026-01-01' for SDK v6).
   * The SDK auto-generates request payloads matching this version, so
   * overriding it would cause schema mismatch with Cashfree's server.
   */
  return client;
}

/*
 * Helper: generate a unique subscription ID for Cashfree
 * Format: sub_{userMongoId}_{timestamp}
 */
function generateSubscriptionId(userId) {
  return `sub_${userId}_${Date.now()}`;
}

/*
 * Helper: map a pricing plan's interval to Cashfree's plan_type and plan_interval.
 * Derives everything from the pricing plan data — nothing hardcoded.
 */
function getCashfreePlanConfig(plan) {
  console.log('[PAYMENT] getCashfreePlanConfig called with interval:', plan.interval);
  if (plan.interval === 'monthly') {
    console.log('[PAYMENT] Mapping to PERIODIC MONTHLY');
    return { plan_type: 'PERIODIC', plan_interval_type: 'MONTH', plan_intervals: 1 };
  }
  if (plan.interval === 'yearly') {
    console.log('[PAYMENT] Mapping to PERIODIC YEARLY');
    return { plan_type: 'PERIODIC', plan_interval_type: 'YEAR', plan_intervals: 1 };
  }
  /*
   * One-time / lifetime — Cashfree has NO 'ONCE' plan_type (valid values are
   * only PERIODIC and ON_DEMAND; 'ONCE' is rejected with plan_type_invalid).
   * Map to a PERIODIC plan with a single cycle so the customer is auto-charged
   * exactly once and the subscription completes.
   */
  console.log('[PAYMENT] Mapping to PERIODIC with single cycle (one-time)');
  return { plan_type: 'PERIODIC', plan_interval_type: 'MONTH', plan_intervals: 1 };
}

/*
 * Helper: ensure a Cashfree plan exists matching the pricing plan.
 * Generates a deterministic plan_id from the pricing plan's own id + price
 * so repeated calls reuse the same plan. If the plan already exists (409),
 * we ignore the error and proceed.
 */
async function ensurePlan(cf, plan) {
  const cfg = getCashfreePlanConfig(plan);
  const planId = `plan_${plan.id}_${plan.price}`;
  /* One-time plans use a single cycle; monthly/yearly cap at 12/5 cycles */
  const isOnce = plan.interval === 'once';
  let maxCycles;
  if (isOnce) {
    maxCycles = 1;
  } else if (plan.interval === 'yearly') {
    maxCycles = 5;
  } else {
    maxCycles = 12;
  }
  const planRequest = {
    plan_id: planId,
    plan_name: plan.name,
    plan_type: cfg.plan_type,
    plan_currency: 'INR',
    plan_max_amount: plan.price * maxCycles,
  };
  if (isOnce) {
    /* Single-cycle PERIODIC plan — charge once, then the subscription completes */
    planRequest.plan_recurring_amount = plan.price;
    planRequest.plan_max_cycles = 1;
    planRequest.plan_interval_type = cfg.plan_interval_type;
    planRequest.plan_intervals = cfg.plan_intervals;
  } else {
    /* PERIODIC plan — requires recurring amount and interval */
    planRequest.plan_recurring_amount = plan.price;
    planRequest.plan_max_cycles = 0;
    planRequest.plan_interval_type = cfg.plan_interval_type;
    planRequest.plan_intervals = cfg.plan_intervals;
  }
  try {
    console.log('[PAYMENT] ensurePlan REQUEST:', JSON.stringify(planRequest, null, 2));
    await cf.SubsCreatePlan(planRequest);
    console.log('[PAYMENT] Plan created:', planId);
  } catch (err) {
    console.log('[PAYMENT] Plan create FULL ERROR:', JSON.stringify(err.response?.data || err.message, null, 2));
    console.log('[PAYMENT] Plan create STATUS:', err.response?.status);
    /* If plan already exists, proceed — otherwise rethrow */
    const planExistsCodes = ['plan_exists', 'plan_already_exists'];
    if (err.response?.status !== 409 && !planExistsCodes.includes(err.response?.data?.code)) {
      throw err;
    }
    console.log('[PAYMENT] Plan already exists (ignored):', planId);
  }
  return { planId, planConfig: cfg };
}

/*
 * POST /api/payments/create-subscription
 *
 * Creates a Cashfree subscription order with auto-pay enabled.
 * Accepts an optional promoCode in the request body.
 *
 * Steps:
 *   1. Validate promo code if provided
 *   2. Calculate first-charge amount (promo may reduce it)
 *   3. Call Cashfree Subscriptions API
 *   4. Store subscription details on the User doc
 *   5. Return payment link to frontend
 */
export async function createSubscription(req, res) {
  try {
    console.log('[PAYMENT] createSubscription called by user:', req.userId);
    const { plan: planId, phone, promoCode, redirectUrl } = req.body;

    if (!phone) {
      console.log('[PAYMENT] Phone number is required');
      return res.status(400).json({ error: 'Phone number is required for payment' });
    }

    if (!planId) {
      console.log('[PAYMENT] Plan ID is required');
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    /* Fetch the pricing plan from SiteConfig */
    const siteConfig = await SiteConfig.findOne({});
    const pricingPlan = siteConfig?.pricingPlans?.find(p => p.id === planId);
    if (!pricingPlan || pricingPlan.price === undefined) {
      console.log('[PAYMENT] Pricing plan not found:', planId);
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    console.log('[PAYMENT] Pricing plan found:', JSON.stringify(pricingPlan));

    const price = pricingPlan.price;

    /* Look up the user in MongoDB */
    const user = await User.findOne({ clerkId: req.userId });
    if (!user) {
      console.log('[PAYMENT] User not found for clerkId:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    /* Prevent duplicate active subscriptions */
    if (user.subscription?.status === 'active') {
      console.log('[PAYMENT] User already has active subscription:', user._id);
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    let firstCharge = price;
    let appliedPromoDoc = null;

    /* ── Validate promo code if provided ── */
    if (promoCode) {
      console.log('[PAYMENT] Validating promo code:', promoCode);
      appliedPromoDoc = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        active: true
      });

      if (!appliedPromoDoc) {
        console.log('[PAYMENT] Promo code not found or inactive:', promoCode);
        return res.status(400).json({ error: 'Invalid or expired promo code' });
      }

      /* Check expiration */
      if (appliedPromoDoc.expiresAt && new Date(appliedPromoDoc.expiresAt) < new Date()) {
        console.log('[PAYMENT] Promo code expired:', promoCode);
        return res.status(400).json({ error: 'This promo code has expired' });
      }

      /* Check usage limit */
      if (appliedPromoDoc.maxUses !== null && appliedPromoDoc.usedCount >= appliedPromoDoc.maxUses) {
        console.log('[PAYMENT] Promo code max uses reached:', promoCode);
        return res.status(400).json({ error: 'This promo code has reached its usage limit' });
      }

      /* Calculate first-charge amount based on promo type */
      if (appliedPromoDoc.type === 'free_month') {
        firstCharge = 0;
      } else if (appliedPromoDoc.type === 'discount_percent') {
        firstCharge = Math.round(price * (1 - appliedPromoDoc.value / 100));
      } else if (appliedPromoDoc.type === 'discount_fixed') {
        firstCharge = Math.max(0, price - appliedPromoDoc.value);
      }

      console.log('[PAYMENT] Promo applied:', promoCode, '| type:', appliedPromoDoc.type, '| firstCharge:', firstCharge);
    }

    /* ── Build Cashfree subscription request ── */
    const subscriptionId = generateSubscriptionId(user._id);
    const customerPhone = phone;
    const cleanClientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
    /* 
     * Point return_url to a backend endpoint instead of directly to the frontend.
     * Cashfree may POST to the return_url (instead of a GET 302), and Vite's dev server
     * returns 404 for POST to SPA routes. The backend catches the POST and does a 302 GET
     * redirect to the React app with the subscription_id preserved.
     */
    const returnUrl = `${serverUrl}/api/payments/return?subscription_id=${subscriptionId}`;

    const cf = getCashfreeClient();

    /* Ensure the plan exists in Cashfree — derives everything from the pricing plan */
    const { planId: cfPlanId, planConfig } = await ensurePlan(cf, pricingPlan);

    /* Calculate max charges based on the pricing plan's interval */
    const isOnce = pricingPlan.interval === 'once';
    let maxCycles;
    if (isOnce) {
      maxCycles = 1;
    } else if (pricingPlan.interval === 'yearly') {
      maxCycles = 5;
    } else {
      maxCycles = 12;
    }
    const planMaxAmount = price * maxCycles;

    const subscriptionRequest = {
      subscription_id: subscriptionId,
      customer_details: {
        customer_id: user._id.toString(),
        customer_phone: customerPhone,
        customer_email: user.email || ''
      },
      plan_details: {
        plan_id: cfPlanId,
        plan_name: pricingPlan.name,
        plan_type: planConfig.plan_type,
        plan_currency: 'INR',
        plan_amount: price,
        plan_max_amount: planMaxAmount,
        plan_max_cycles: isOnce ? 1 : 0
      },
      subscription_note: `${pricingPlan.name} — TheWebytes Premium`,
      subscription_meta: {
        return_url: returnUrl
      }
    };

    /* Interval fields are always sent — every plan is PERIODIC (one-time maps to a single-cycle periodic plan) */
    subscriptionRequest.plan_details.plan_interval_type = planConfig.plan_interval_type;
    subscriptionRequest.plan_details.plan_intervals = planConfig.plan_intervals;

    /*
     * Set the first charge amount — promo codes may reduce it (e.g. free_month = ₹0,
     * discount_percent = partial amount). Without this field, Cashfree charges
     * plan_amount for the first payment regardless of any promo calculation.
     */
    if (firstCharge !== price) {
      subscriptionRequest.subscription_first_charge = firstCharge;
      console.log('[PAYMENT] First charge differs from plan price — sending subscription_first_charge:', firstCharge);
    }

    console.log('[PAYMENT] SubsCreateSubscription REQUEST:', JSON.stringify(subscriptionRequest, null, 2));
    const cfResponse = await cf.SubsCreateSubscription(subscriptionRequest);
    console.log('[PAYMENT] SubsCreateSubscription RESPONSE:', JSON.stringify(cfResponse?.data, null, 2));
    const subscription = cfResponse.data;

    console.log('[PAYMENT] Cashfree subscription created:', subscription.subscription_id, '| status:', subscription.subscription_status);

    /*
     * Save cashfreeSubscriptionId on the User doc immediately.
     * Status stays 'free' until the webhook confirms the first payment.
     */
    user.subscription.cashfreeSubscriptionId = subscription.subscription_id;
    user.subscription.cashfreeCustomerId = user._id.toString(); /* Same as customer_id sent in request */
    user.subscription.pendingRedirect = redirectUrl || ''; /* Save redirect for PaymentSuccess to use */
    user.phone = phone; /* Save phone for future use */
    if (appliedPromoDoc) {
      user.subscription.appliedPromo = appliedPromoDoc._id;
    }
    await user.save();

    /* Create a pending transaction record */
    await PaymentTransaction.create({
      user: user._id,
      type: 'subscription_created',
      amount: firstCharge,
      currency: 'INR',
      cashfreeSubscriptionId: subscription.subscription_id,
      status: 'pending',
      promoCode: appliedPromoDoc?._id || null
    });

    const isSandbox = process.env.CASHFREE_ENV !== 'production';
    const paymentBaseUrl = isSandbox
      ? 'https://sandbox.cashfree.com/pg/view/sessions/checkout/subs'
      : 'https://api.cashfree.com/pg/view/sessions/checkout/subs';

    console.log('[PAYMENT] Subscription created successfully for user:', user._id);
    res.json({
      data: {
        subscriptionId: subscription.subscription_id,
        subscriptionSessionId: subscription.subscription_session_id,
        payLink: paymentBaseUrl,
        firstCharge,
        status: subscription.subscription_status
      }
    });
  } catch (error) {
    console.error('[PAYMENT] Error creating subscription:', error.message);
    console.error('[PAYMENT] Error details:', error.response?.data || error);

    /*
     * Cashfree merchant-side errors must not surface as opaque 500s.
     * Map known API error codes to clear HTTP statuses + user-friendly
     * messages so the Subscribe page shows exactly what went wrong.
     */
    const cfCode = error.response?.data?.code;
    if (cfCode === 'profile_inactive') {
      console.log('[PAYMENT] Cashfree merchant profile inactive — returning friendly error');
      return res.status(400).json({
        error: 'Payments are temporarily unavailable — your Cashfree account is still being activated. Please try again in a few hours.',
        code: cfCode
      });
    }
    if (cfCode === 'plan_type_invalid') {
      console.log('[PAYMENT] Invalid plan type mapped for pricing plan');
      return res.status(400).json({
        error: 'This subscription plan is misconfigured. Please contact support.',
        code: cfCode
      });
    }

    res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
}

/*
 * POST /api/payments/webhook
 *
 * Cashfree webhook handler — receives payment and subscription lifecycle events.
 * Uses the SDK's built-in signature verification.
 *
 * Must use express.raw() body parser to preserve the raw JSON for signature verification.
 */
export async function handleWebhook(req, res) {
  try {
    console.log('[PAYMENT] Webhook received');

    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    /* express.raw() sets req.body as a Buffer — convert to string for SDK verification */
    const rawBody = (req.body instanceof Buffer ? req.body.toString('utf8') : req.body) || '';

    if (!signature || !timestamp || !rawBody) {
      console.log('[PAYMENT] Webhook missing signature/timestamp/body');
      return res.status(400).json({ error: 'Missing webhook headers or body' });
    }

    /* Verify webhook signature using the Cashfree SDK */
    const cf = getCashfreeClient();
    let event;
    try {
      event = cf.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    } catch (sigError) {
      console.error('[PAYMENT] Webhook signature verification failed:', sigError.message);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    console.log('[PAYMENT] Webhook event type:', event.type);

    /* Parse the webhook payload from the SDK event object */
    const payload = event.object;
    const cashfreeSubscriptionId = payload.data?.subscription?.subscription_id
      || payload.order?.subscription_id
      || payload.subscription_id
      || '';

    const cashfreeOrderId = payload.data?.order?.order_id || payload.order_id || '';
    const cashfreePaymentId = payload.data?.payment?.cf_payment_id || payload.cf_payment_id || '';
    const paymentAmount = payload.data?.order?.order_amount || payload.order_amount || 0;
    const paymentStatus = payload.data?.payment?.payment_status || payload.payment_status || '';

    console.log('[PAYMENT] Webhook payload:', JSON.stringify({
      subscriptionId: cashfreeSubscriptionId,
      orderId: cashfreeOrderId,
      paymentId: cashfreePaymentId,
      amount: paymentAmount,
      paymentStatus
    }));

    /* Find the user by cashfreeSubscriptionId */
    const user = await User.findOne({ 'subscription.cashfreeSubscriptionId': cashfreeSubscriptionId });
    if (!user) {
      console.log('[PAYMENT] No user found for subscription:', cashfreeSubscriptionId);
      return res.status(200).json({ status: 'ignored' }); /* Still return 200 to Cashfree */
    }

    let transactionType = 'subscription_renewed';
    let transactionStatus = 'pending';
    const hookSubConfig = await getSubscriptionSettings();

    /* ── Handle different webhook event types ── */
    switch (event.type) {
      case 'PAYMENT_SUCCESS':
      case 'SUBSCRIPTION_CHARGED':
        /*
         * First payment or recurring charge succeeded.
         * Check if this is a first-time payment (no currentPeriodStart = never been active)
         * BEFORE modifying user.subscription fields.
         */
        const wasPreviouslyActive = !!user.subscription?.currentPeriodStart;
        console.log('[PAYMENT] Payment success — previously active:', wasPreviouslyActive, 'for user:', user._id);

        user.subscription.status = 'active';
        user.subscription.currentPeriodStart = new Date();
        user.subscription.currentPeriodEnd = new Date(Date.now() + hookSubConfig.durationDays * 24 * 60 * 60 * 1000);

        transactionType = wasPreviouslyActive ? 'subscription_renewed' : 'subscription_created';
        transactionStatus = 'success';

        /* Increment promo usage if a promo was applied */
        if (user.subscription.appliedPromo) {
          await PromoCode.findByIdAndUpdate(user.subscription.appliedPromo, {
            $inc: { usedCount: 1 }
          });
        }
        break;

      case 'PAYMENT_FAILED':
        console.log('[PAYMENT] Payment failed for user:', user._id);
        user.subscription.status = 'past_due';
        transactionType = 'subscription_renewed';
        transactionStatus = 'failed';
        break;

      case 'SUBSCRIPTION_CANCELLED':
        console.log('[PAYMENT] Subscription cancelled for user:', user._id);
        user.subscription.status = 'canceled';
        transactionType = 'subscription_canceled';
        transactionStatus = 'success';
        break;

      default:
        console.log('[PAYMENT] Unknown webhook event type:', eventType);
        return res.status(200).json({ status: 'ignored' });
    }

    await user.save();

    /* Create transaction record for audit trail */
    await PaymentTransaction.create({
      user: user._id,
      type: transactionType,
      amount: paymentAmount || hookSubConfig.price,
      currency: 'INR',
      cashfreeOrderId,
      cashfreePaymentId,
      cashfreeSubscriptionId,
      status: transactionStatus,
      metadata: { webhookEvent: event.type, rawPayload: payload }
    });

    console.log('[PAYMENT] Webhook processed successfully | user:', user._id, '| type:', event.type);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('[PAYMENT] Webhook error:', error.message);
    /* Always return 200 to Cashfree so they don't retry indefinitely */
    res.status(200).json({ status: 'error', message: error.message });
  }
}

/*
 * POST /api/payments/apply-promo
 *
 * Validates a promo code and returns the calculated price.
 * Does NOT apply the promo — that happens at subscription creation time.
 */
export async function applyPromo(req, res) {
  try {
    console.log('[PAYMENT] applyPromo called');
    const { code, planId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'planId is required to calculate discount' });
    }

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!promo) {
      console.log('[PAYMENT] Promo code not found:', code);
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    /* Check expiration */
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      console.log('[PAYMENT] Promo code expired:', code);
      return res.status(400).json({ error: 'This promo code has expired' });
    }

    /* Check usage limit */
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      console.log('[PAYMENT] Promo code max uses reached:', code);
      return res.status(400).json({ error: 'This promo code has reached its usage limit' });
    }

    /* Fetch the pricing plan to get the actual price */
    const siteConfig = await SiteConfig.findOne({});
    const pricingPlan = siteConfig?.pricingPlans?.find(p => p.id === planId);
    if (!pricingPlan || pricingPlan.price === undefined) {
      console.log('[PAYMENT] Pricing plan not found for promo:', planId);
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const basePrice = pricingPlan.price;

    /* Calculate discounted price based on the actual plan price */
    let discountedPrice = basePrice;
    let description = '';
    const intervalLabel = pricingPlan.interval === 'monthly' ? '/month' : pricingPlan.interval === 'yearly' ? '/year' : pricingPlan.interval === 'once' ? ' one-time' : '';

    switch (promo.type) {
      case 'free_month':
        discountedPrice = 0;
        description = `First ${pricingPlan.interval === 'once' ? 'payment' : 'billing cycle'} free, then ₹${basePrice}${intervalLabel}`;
        break;
      case 'discount_percent':
        discountedPrice = Math.round(basePrice * (1 - promo.value / 100));
        description = `${promo.value}% off — ₹${discountedPrice} first ${pricingPlan.interval === 'once' ? 'payment' : 'billing cycle'}, then ₹${basePrice}${intervalLabel}`;
        break;
      case 'discount_fixed':
        discountedPrice = Math.max(0, basePrice - promo.value);
        description = `₹${promo.value} off — ₹${discountedPrice} first ${pricingPlan.interval === 'once' ? 'payment' : 'billing cycle'}, then ₹${basePrice}${intervalLabel}`;
        break;
    }

    console.log('[PAYMENT] Promo valid:', code, '| plan price:', basePrice, '| discountedPrice:', discountedPrice);
    res.json({
      data: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        basePrice,
        discountedPrice,
        description,
        valid: true
      }
    });
  } catch (error) {
    console.error('[PAYMENT] Error validating promo:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET /api/payments/status
 *
 * Returns the current subscription status for the authenticated user.
 */
export async function getSubscriptionStatus(req, res) {
  try {
    console.log('[PAYMENT] getStatus called for user:', req.userId);
    const user = await User.findOne({ clerkId: req.userId })
      .populate('subscription.appliedPromo', 'code type')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[PAYMENT] User subscription status:', user.subscription?.status);

    res.json({
      data: {
        status: user.subscription?.status || 'free',
        currentPeriodStart: user.subscription?.currentPeriodStart || null,
        currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
        appliedPromo: user.subscription?.appliedPromo || null,
        coachingCenter: !!user.coachingCenter
      }
    });
  } catch (error) {
    console.error('[PAYMENT] Error fetching subscription status:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * POST /api/payments/cancel
 *
 * Cancels the user's active subscription.
 * Calls Cashfree API to stop future recurring charges.
 * Access continues until currentPeriodEnd.
 */
/*
 * POST /api/payments/verify-subscription
 *
 * Verifies the subscription status with Cashfree API and updates local state.
 * This acts as a fallback when the webhook hasn't fired yet (e.g. local dev,
 * or the webhook was delayed). On the PaymentSuccess page we call this to
 * immediately reflect the paid status without waiting for the webhook.
 *
 * Steps:
 *   1. Look up Cashfree subscription by ID
 *   2. If Cashfree reports active/paid status, update local User doc
 *   3. Return the updated status to the frontend
 */
export async function verifySubscription(req, res) {
  try {
    console.log('[PAYMENT] verifySubscription called by user:', req.userId);
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      console.log('[PAYMENT] verifySubscription: subscriptionId is required');
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    /* Find the user whose subscription matches this Cashfree subscription ID */
    const user = await User.findOne({
      clerkId: req.userId,
      'subscription.cashfreeSubscriptionId': subscriptionId
    });

    if (!user) {
      console.log('[PAYMENT] verifySubscription: no user found for subscription:', subscriptionId);
      return res.status(404).json({ error: 'Subscription not found for this user' });
    }

    /* If already active locally, nothing to do */
    if (user.subscription?.status === 'active') {
      console.log('[PAYMENT] verifySubscription: user already active');
      return res.json({
        data: {
          status: 'active',
          currentPeriodStart: user.subscription.currentPeriodStart,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          redirect: user.subscription.pendingRedirect || ''
        }
      });
    }

    /*
     * Fetch subscription status from Cashfree API.
     * This tells us whether the first payment has been captured.
     */
    let cfData = null;
    try {
      const cf = getCashfreeClient();
      const cfResp = await cf.SubsFetchSubscription(subscriptionId);
      cfData = cfResp?.data;
      console.log('[PAYMENT] verifySubscription: Cashfree status:', JSON.stringify(cfData, null, 2));
    } catch (cfErr) {
      console.error('[PAYMENT] verifySubscription: Cashfree API error:', cfErr.message);
      /* Do NOT activate on API failure — activation requires positive confirmation
       * from Cashfree (or the signature-verified webhook). A genuine payment will
       * be confirmed by the webhook shortly; the frontend shows a friendly
       * 'processing' state until then. */
    }

    /*
     * Determine if the subscription is active/paid.
     * Cashfree subscription_status values: ACTIVE, COMPLETED, ON_HOLD, CANCELLED, INITIALISED, etc.
     */
    const cfStatus = cfData?.subscription_status || '';
    const isPaid = ['ACTIVE', 'COMPLETED'].includes(cfStatus);

    if (isPaid) {
      /* Activate the user locally */
      const hookSubConfig = await getSubscriptionSettings();
      user.subscription.status = 'active';
      user.subscription.currentPeriodStart = new Date();
      user.subscription.currentPeriodEnd = new Date(Date.now() + hookSubConfig.durationDays * 24 * 60 * 60 * 1000);
      /* Clear the pending redirect so it's only used once */
      const savedRedirect = user.subscription.pendingRedirect || '';
      user.subscription.pendingRedirect = '';
      await user.save();

      /* Create transaction audit record if one doesn't already exist for this subscription */
      const existingTx = await PaymentTransaction.findOne({ cashfreeSubscriptionId: subscriptionId, status: 'success' });
      if (!existingTx) {
        await PaymentTransaction.create({
          user: user._id,
          type: 'subscription_created',
          amount: 0, /* amount unknown at this point — webhook will have the real one */
          currency: 'INR',
          cashfreeSubscriptionId: subscriptionId,
          status: 'success',
          metadata: { source: 'verify_endpoint', note: 'Activated after payment redirect (webhook fallback)' }
        });
      }

      console.log('[PAYMENT] verifySubscription: user activated successfully:', user._id);
      return res.json({
        data: {
          status: 'active',
          currentPeriodStart: user.subscription.currentPeriodStart,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          redirect: savedRedirect
        }
      });
    }

    /* Cashfree says not yet paid */
    console.log('[PAYMENT] verifySubscription: Cashfree status is not active:', cfStatus);
    return res.json({
      data: {
        status: user.subscription?.status || 'pending',
        cashfreeStatus: cfStatus,
        note: 'Payment not yet confirmed by Cashfree. The system will update automatically once confirmed.'
      }
    });
  } catch (error) {
    console.error('[PAYMENT] verifySubscription error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/*
 * GET|POST /api/payments/return
 *
 * Cashfree payment return redirect handler.
 * Cashfree may POST to the return_url (form submission) instead of a GET 302.
 * This endpoint catches either method, then issues a 302 GET redirect to the
 * frontend with the subscription_id so the React app loads properly (Vite
 * returns 404 for POST to SPA routes).
 */
export async function handlePaymentReturn(req, res) {
  try {
    /* Extract subscription_id from query (GET) or body (POST) */
    const subscriptionId = req.query.subscription_id
      || req.body?.subscription_id
      || req.body?.order_id
      || '';
    const cleanClientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const redirectUrl = `${cleanClientUrl}/payment/success${subscriptionId ? `?subscription_id=${encodeURIComponent(subscriptionId)}` : ''}`;
    console.log('[PAYMENT] Handling payment return — redirecting to:', redirectUrl);
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('[PAYMENT] Error in payment return handler:', error.message);
    const fallbackUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '') + '/payment/success';
    res.redirect(302, fallbackUrl);
  }
}

export async function cancelSubscription(req, res) {
  try {
    console.log('[PAYMENT] cancelSubscription called by user:', req.userId);
    const user = await User.findOne({ clerkId: req.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscription?.status !== 'active') {
      console.log('[PAYMENT] No active subscription to cancel for user:', user._id);
      return res.status(400).json({ error: 'No active subscription to cancel' });
    }

    const cashfreeSubId = user.subscription.cashfreeSubscriptionId;

    if (cashfreeSubId) {
      /*
       * Call Cashfree API to cancel the subscription and stop future charges.
       * SubsManageSubscription with action: 'CANCEL' cancels the recurring subscription.
       */
      try {
        console.log('[PAYMENT] Calling Cashfree SubsManageSubscription with CANCEL for:', cashfreeSubId);
        const cf = getCashfreeClient();
        await cf.SubsManageSubscription(cashfreeSubId, { action: 'CANCEL' });
        console.log('[PAYMENT] Cashfree subscription cancelled successfully');
      } catch (cfError) {
        /*
         * If Cashfree returns an error (e.g., already cancelled), log it but
         * proceed with local cancellation to keep state consistent.
         */
        console.error('[PAYMENT] Cashfree cancel API error:', cfError.message);
      }
    }

    /* Update local state */
    user.subscription.status = 'canceled';
    await user.save();

    /* Create transaction record */
    await PaymentTransaction.create({
      user: user._id,
      type: 'subscription_canceled',
      amount: 0,
      currency: 'INR',
      cashfreeSubscriptionId: cashfreeSubId || '',
      status: 'success',
      metadata: { accessUntil: user.subscription.currentPeriodEnd }
    });

    console.log('[PAYMENT] Subscription cancelled for user:', user._id, '| access until:', user.subscription.currentPeriodEnd);
    res.json({
      data: {
        success: true,
        message: 'Subscription cancelled successfully',
        accessUntil: user.subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('[PAYMENT] Error cancelling subscription:', error.message);
    res.status(500).json({ error: error.message });
  }
}
