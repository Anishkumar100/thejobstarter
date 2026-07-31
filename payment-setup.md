# Payment Setup Guide — TheJobStarter

> Practical setup guide for the Cashfree payment integration.
> Last updated: July 29, 2026

---

## 1. Environment Variables

Set these in your **local `.env`** and **Vercel dashboard → Settings → Environment Variables**:

```env
# Cashfree Payment Gateway
CASHFREE_APP_ID=CF_TEST_xxxxx          # Sandbox: from cashfree.com sandbox dashboard → API Keys
CASHFREE_SECRET_KEY=CF_TEST_xxxxx      # Sandbox: same page
CASHFREE_ENV=sandbox                   # 'sandbox' or 'production'

# URLs (for payment return redirect flow)
CLIENT_URL=https://thejobstarter.vercel.app   # Your frontend URL
SERVER_URL=https://thejobstarter-backend.vercel.app  # Your backend URL
```

### Where to get Cashfree sandbox keys

1. Go to [Cashfree Sandbox Dashboard](https://sandbox.cashfree.com/)
2. Login/Sign up
3. Go to **Settings → API Keys**
4. Copy **Client ID** → `CASHFREE_APP_ID`
5. Copy **Secret Key** → `CASHFREE_SECRET_KEY`
6. Set `CASHFREE_ENV=sandbox`

---

## 2. Payment Flow (How It Works)

```
User clicks "Subscribe" on /pricing
  → Frontend sends POST /api/payments/create-subscription { plan: "premium", phone: "999..." }
    → Backend creates Cashfree subscription (plan + subscription via SDK)
    → Returns { subscriptionId, subscriptionSessionId, payLink }
  → Frontend opens Cashfree hosted checkout page (payLink)
  → User completes payment on payments-test.cashfree.com
  → Cashfree redirects browser to /api/payments/return?subscription_id=sub_xxx
    → Backend 302 redirects to /payment/success?subscription_id=sub_xxx
  → Frontend PaymentSuccess page loads
    → Calls POST /api/payments/verify-subscription { subscriptionId }
    → Backend checks Cashfree status, activates user subscription locally
  → User redirected to /dsa (or stored redirectUrl) with full access
```

### Cashfree also fires a webhook:
```
Cashfree → POST /api/payments/webhook (PAYMENT_SUCCESS)
  → Backend verifies signature, updates user subscription
  → Creates PaymentTransaction audit record
```

---

## 3. Key Files

| File | Purpose |
|------|---------|
| `server/config/cashfree.js` | Cashfree SDK initialization |
| `server/controllers/paymentController.js` | All payment logic (7 exported functions) |
| `server/routes/paymentRoutes.js` | 6 payment endpoints |
| `server/utils/accessControl.js` | Free tier locking (first 2 lessons free) |
| `server/models/PromoCode.js` | Promo codes model |
| `server/models/PaymentTransaction.js` | Transaction audit trail |
| `server/models/SiteConfig.js` | `subscriptionSettings` + `pricingPlans` |

---

## 4. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payments/create-subscription` | User | Create Cashfree subscription |
| POST | `/api/payments/webhook` | Public | Cashfree webhook (raw body) |
| POST | `/api/payments/return` | Public | Cashfree redirect handler (GET/POST → 302 to frontend) |
| POST | `/api/payments/verify-subscription` | User | Verify & activate after payment redirect |
| POST | `/api/payments/apply-promo` | User | Validate promo code |
| GET | `/api/payments/status` | User | Get subscription status |
| POST | `/api/payments/cancel` | User | Cancel subscription |

---

## 5. Deployment Checklist

### First-time setup on Vercel

1. Push all code changes (including CORS fix in `app.js`)
2. Set these environment variables in Vercel dashboard:
   - `CASHFREE_APP_ID` — from Cashfree sandbox
   - `CASHFREE_SECRET_KEY` — from Cashfree sandbox
   - `CASHFREE_ENV` → `sandbox`
   - `CLIENT_URL` → `https://your-frontend.vercel.app`
   - `SERVER_URL` → `https://your-backend.vercel.app`
3. Redeploy
4. Test payment flow

### Switching to Production

1. Get live API keys from [Cashfree Production Dashboard](https://merchant.cashfree.com/)
2. Update Vercel env vars:
   - `CASHFREE_APP_ID` → live Client ID
   - `CASHFREE_SECRET_KEY` → live Secret Key
   - `CASHFREE_ENV` → `production`
3. Set actual pricing plans via Admin → Payments → Pricing Settings
4. Redeploy

---

## 6. Bugs Fixed & Lessons Learned

### Bug 1: Sentry Crash on Vercel (500 — No outgoing requests)
**Root cause:** `cashfree-pg` SDK v6.0.4 defaults `XEnableErrorAnalytics = true` in its constructor. This calls `Sentry.init()` with `profilesSampleRate: 1.0`. On Vercel's serverless sandbox, the V8 profiling APIs are restricted, causing the process to crash.

**Fix:** Pass `XEnableErrorAnalytics = false` as the 7th constructor param:
```js
const client = new Cashfree(
  env,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
  undefined, undefined, undefined,
  false  // ← prevents Sentry.init() crash
);
```

**Also removed:** The `client.XApiVersion = '2022-09-01'` override was forcing an outdated API version, causing schema mismatch with the SDK's auto-generated request payloads. SDK v6 defaults to `2026-01-01`.

### Bug 2: Cashfree 401 Unauthorized on Vercel
**Root cause:** `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` env vars weren't set on Vercel.

**Fix:** Add them to Vercel dashboard → Settings → Environment Variables.

### Bug 3: CORS Error after Payment
**Root cause:** `payments-test.cashfree.com` wasn't in the CORS allowed origins in `app.js`.

**Fix:** Added Cashfree domains to CORS config:
```js
allowedOrigins.push(
  'https://payments-test.cashfree.com',
  'https://payments.cashfree.com'
);
// Also add wildcard check:
if (origin.endsWith('.cashfree.com')) return callback(null, true);
```

### Bug 4: Promo discount calculated against wrong price
**Root cause:** `applyPromo` used `getSubscriptionSettings().price` (₹99 default) instead of the actual `pricingPlan.price`.

**Fix:** Now fetches the pricing plan from `SiteConfig.pricingPlans.find()` and uses its actual price.

### Bug 5: Promo discount never reached Cashfree
**Root cause:** `createSubscription` calculated `firstCharge` locally but never sent `subscription_first_charge` in the Cashfree API request.

**Fix:** Now adds `subscription_first_charge` to the request body when `firstCharge !== price`.

### Bug 6: Webhook transaction type always 'subscription_renewed'
**Root cause:** Status check was done AFTER mutating user.subscription (checking already-updated status).

**Fix:** Moved `wasPreviouslyActive` check to BEFORE any mutation.

---

## 7. Testing Notes

- **Cashfree sandbox always shows ₹1** for test transactions regardless of the plan price — this is normal
- The sandbox uses `payments-test.cashfree.com` for the hosted checkout page
- Use test card details from Cashfree sandbox docs to complete test payments
- Locally, the return URL redirects to `http://localhost:5173/payment/success` (set `CLIENT_URL` in your `.env`)
- The redirect flow: Cashfree → backend `/api/payments/return` → 302 → frontend `/payment/success`

---

## 8. Admin Management

| Page | Route | Purpose |
|------|-------|---------|
| Payments Dashboard | `/admin/payments` | Revenue stats, active subs |
| Subscribers | `/admin/payments/subscribers` | View/manage (Activate/Cancel) user subscriptions |
| Promo Codes | `/admin/payments/promos` | CRUD promo codes |
| Subscription Settings | `/admin/payments/settings` | Configure price & duration |
| Pricing Plans | `/admin/payments/pricing` | Configure plan prices, intervals, features |
