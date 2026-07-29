# Payment Integration Plan — TheWebytes DSA Web

## Overview

Dual payment system for the platform:

| System | Model | Price | Mechanism |
|--------|-------|-------|-----------|
| **SaaS (Individual)** | ₹99/month (configurable via admin) recurring for students NOT in a coaching center | Cashfree subscriptions + webhooks with **auto-pay always enabled** | Free tier = first 2 lessons per subject. Paid = full access. |
| **Enterprise (Coaching Centers)** | Manual admin management per center | No platform transaction | Existing `CoachingCenter.status` (`active`/`trial`/`suspended`) |

### Free Tier Rules

- First 2 lessons **by `order` field** in each subject (DSA, DBMS, OS, Programming) are free
- All subtopics and problems under those 2 lessons are also free
- Lesson 3+ and everything under them is locked for non-subscribers
- Students linked to a coaching center get full access regardless
- This is a **one-time trial** — no monthly reset

---

## Phase 1 — Data Model Changes

### User Model (`server/models/User.js`) — Add subscription fields

```js
subscription: {
  status: {
    type: String,
    enum: ['free', 'active', 'past_due', 'canceled', 'expired'],
    default: 'free'
  },
  cashfreeCustomerId:     { type: String, default: '' },
  cashfreeSubscriptionId: { type: String, default: '' },
  currentPeriodStart:     { type: Date, default: null },
  currentPeriodEnd:       { type: Date, default: null },
  appliedPromo:           { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null }
}
```

### PromoCode Model (new — `server/models/PromoCode.js`)

```js
import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        { type: String, enum: ['free_month', 'discount_percent', 'discount_fixed'], required: true },
  value:       { type: Number, required: true },  // percentage or INR amount
  maxUses:     { type: Number, default: null },    // null = unlimited
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date, default: null },
  active:      { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('PromoCode', promoSchema);
```

### PaymentTransaction Model (new — `server/models/PaymentTransaction.js`)

```js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, enum: [
    'subscription_created', 'subscription_renewed', 'subscription_canceled',
    'promo_applied', 'admin_activated', 'admin_deactivated'
  ], required: true },
  amount:       { type: Number, default: 0 },
  currency:     { type: String, default: 'INR' },
  cashfreeOrderId:        { type: String, default: '' },
  cashfreePaymentId:      { type: String, default: '' },
  cashfreeSubscriptionId: { type: String, default: '' },
  status:       { type: String, enum: ['success', 'failed', 'pending', 'refunded'], default: 'pending' },
  metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
  promoCode:    { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null }
}, { timestamps: true });

export default mongoose.model('PaymentTransaction', transactionSchema);
```

### CoachingCenter Model (`server/models/CoachingCenter.js`) — Add billing fields

> ⏭️ **Deferred to future phase.** Not implementing yet.

<!--
Future billing fields for reference:
billingEmail:     { type: String, default: '' },
billingPhone:     { type: String, default: '' },
billingAddress:   { type: String, default: '' },
pricePerStudent:  { type: Number, default: 0 },
billingPeriod:    { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
lastBilledAt:     { type: Date, default: null },
nextBillingAt:    { type: Date, default: null },
paymentStatus:    { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
paymentNotes:     { type: String, default: '' }
 -->
```
</s>

### SiteConfig Model (`server/models/SiteConfig.js`) — Add subscription settings

```js
subscriptionSettings: {
  price: { type: Number, default: 99 },        // ₹ per subscription period
  durationDays: { type: Number, default: 30 }  // days per subscription period
}
```

Price and duration are no longer hardcoded. Both `paymentController.js` and `adminController.js` call `getSubscriptionSettings()` from `siteConfigController.js` to get the latest values. Admin can change them at any time via the Subscription Settings admin page.

---

## Phase 2 — Backend Payment Core

### New files

| File | Purpose |
|------|---------|
| `server/config/cashfree.js` | Cashfree SDK init with API keys |
| `server/controllers/paymentController.js` | All payment logic |
| `server/routes/paymentRoutes.js` | Payment endpoints |
| `server/utils/accessControl.js` | Shared access check utility |

### Cashfree Config (`server/config/cashfree.js`)

```js
import Cashfree from 'cashfree-pg'; // or use REST API

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'production'
  ? Cashfree.Environment.PRODUCTION
  : Cashfree.Environment.SANDBOX;

export default Cashfree;
```

### Payment Routes (`/api/payments`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/payments/create-subscription` | User | Create Cashfree subscription order |
| POST | `/api/payments/webhook` | Public | Cashfree webhook handler |
| POST | `/api/payments/apply-promo` | User | Validate & apply promo code |
| GET  | `/api/payments/status` | User | Get current subscription status |
| POST | `/api/payments/cancel` | User | Cancel subscription |

### Cashfree Subscription Flow

```
Frontend                          Backend                         Cashfree
   │                                │                                │
   │  POST /create-subscription     │                                │
   │  { promoCode? }                │                                │
   │───────────────────────────────>│                                │
   │                                │  Create Cashfree subscription  │
   │                                │  for ₹99/month                 │
   │                                │──────────────────────────────>│
   │                                │    { subscription_id, link }   │
   │                                │<──────────────────────────────│
   │  { subscriptionId, payLink }   │                                │
   │<───────────────────────────────│                                │
   │                                │                                │
   │  Redirect user to Cashfree     │                                │
   │  hosted checkout page          │                                │
   │───────────────────────────────────────────────────────────────>│
   │                                │                                │
   │                                │  Webhook: PAYMENT_SUCCESS      │
   │                                │<──────────────────────────────│
   │                                │                                │
   │                                │  Update User.subscription      │
   │                                │  Create PaymentTransaction     │
   │                                │                                │
   │  GET /status (poll/check)      │                                │
   │───────────────────────────────>│                                │
   │  { status: 'active', ... }     │                                │
   │<───────────────────────────────│                                │
```

### Payment Controller Core Logic

**`createSubscription`:**

> **Auto-pay is always enabled.** The Cashfree subscription is created as recurring from day one. Promo codes only affect the first charge amount — subsequent months are always the configured price (default ₹99).

1. Validate promo code if provided (check active, not expired, not maxed out)
2. Fetch dynamic config via `getSubscriptionSettings()` (price, durationDays)
3. Calculate first-charge amount:
   - No promo: configured price
   - `free_month`: first charge = ₹0, subsequent = configured price
   - `discount_percent`: first charge = configured price × (1 - value/100), subsequent = configured price
   - `discount_fixed`: first charge = configured price - value (min ₹0), subsequent = configured price
4. Call Cashfree Subscription API with `first_charge = calculated_amount`, `recurring_amount = price`, `interval = durationDays` — this sets up auto-pay immediately
5. If promo applied, store `appliedPromo` on User doc for audit trail
6. Store `cashfreeSubscriptionId` on User doc
7. Return payment link to frontend

**`handleWebhook`** (Cashfree webhook):
1. Verify webhook signature
2. Extract event type: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `SUBSCRIPTION_CANCELLED`, `SUBSCRIPTION_CHARGED`
3. Find user by `cashfreeCustomerId` or metadata
4. On `PAYMENT_SUCCESS` (first payment or first recurring charge after free month):
   - Fetch dynamic config via `getSubscriptionSettings()` to get the current `durationDays`
   - Set `subscription.status = 'active'`
   - Set `currentPeriodStart` / `currentPeriodEnd` (durationDays from now)
   - If promo was applied on first payment only, increment `PromoCode.usedCount`
   - Create `PaymentTransaction` with `status: 'success'`
5. On `SUBSCRIPTION_CHARGED` (subsequent recurring charges):
   - Same as `PAYMENT_SUCCESS` — update `currentPeriodEnd` by +durationDays
   - Create `PaymentTransaction` with type `subscription_renewed`
6. On `PAYMENT_FAILED`:
   - Set `subscription.status = 'past_due'`
   - Create `PaymentTransaction` with `status: 'failed'`
7. On `SUBSCRIPTION_CANCELLED`:
   - Set `subscription.status = 'canceled'`
   - Create `PaymentTransaction`
8. Return 200 OK to Cashfree

**`applyPromo`:**
1. Fetch dynamic config via `getSubscriptionSettings()` to get current price
2. Validate promo code exists, is active, not expired, not at max uses
3. Calculate discount:
   - `free_month` → first month ₹0, then ₹price/month
   - `discount_percent` → ₹price × (1 - value/100)
   - `discount_fixed` → ₹price - value (min ₹0)
4. Return calculated price and promo details

**`cancelSubscription`:**

```
Frontend (/settings/subscription)     Backend                    Cashfree
   │                                     │                         │
   │  Click "Cancel Subscription"        │                         │
   │────────────────────────────────────>│                         │
   │                                     │  Call Cashfree API      │
   │                                     │  to cancel subscription │
   │                                     │────────────────────────>│
   │                                     │    { success }          │
   │                                     │<────────────────────────│
   │                                     │                         │
   │                                     │  Set status = 'canceled'│
   │                                     │  Create Transaction     │
   │                                     │  (type: subscription_   │
   │                                     │   canceled)             │
   │  { success, message, accessUntil }  │                         │
   │<────────────────────────────────────│                         │
```

Before calling the API, frontend shows a confirmation dialog:

```
┌──────────────────────────────────────┐
│  Cancel Subscription?                │
│                                      │
│  Your access continues until         │
│  25 Aug 2026. After that, you'll     │
│  be downgraded to the free tier.     │
│                                      │
│  [  No, Keep It  ] [  Yes, Cancel ] │
└──────────────────────────────────────┘
```

Backend logic:
1. Call Cashforce API to cancel the recurring subscription (stops future charges)
2. Set `user.subscription.status = 'canceled'` (NOT `'expired'`)
3. Create `PaymentTransaction` with type `subscription_canceled`, status `'success'`
4. Return `{ success: true, accessUntil: currentPeriodEnd }`

**Status distinction:**
- `canceled` — User manually canceled. Still has access until `currentPeriodEnd`. No more charges.
- `expired` — `currentPeriodEnd` passed without an active subscription. No access.
- A periodic check (webhook or cron) transitions `canceled` → `expired` when `currentPeriodEnd` is in the past.

### Access Control Utility (`server/utils/accessControl.js`)

```js
/*
 * canAccessSubject(user)
 * Accepts a User Mongoose doc (or null/undefined).
 * Returns true if user can view all content in the subject.
 * Returns false if user is limited to free tier.
 *
 * IMPORTANT: caller (controller) must fetch the User doc via:
 *   const user = await User.findOne({ clerkId: req.userId }).lean();
 *   req.user = user;
 * before calling this utility. req.userId is the Clerk session string,
 * not a Mongoose document — the controllers must look up the doc first.
 */
export function canAccessSubject(user) {
  if (!user) return false;
  // Centre-enrolled users get full access
  if (user.coachingCenter) return true;
  // Active subscription
  if (user.subscription?.status === 'active') return true;
  return false;
}

/*
 * getLockedLessons(lessons, user, freeCount = 2)
 * Takes sorted lessons array (plain objects from .lean() or Mongoose docs),
 * returns same array with locked: boolean added per lesson.
 * Safe for both .lean() results (no .toObject()) and Mongoose docs.
 */
export function getLockedLessons(lessons, user, freeCount = 2) {
  if (canAccessSubject(user)) {
    return lessons.map(l => ({ ...l, locked: false }));
  }
  const freeSlugs = lessons.slice(0, freeCount).map(l => l.slug);
  return lessons.map(l => ({
    ...l,
    locked: !freeSlugs.includes(l.slug)
  }));
}

/*
 * isLessonFree(lessonSlug, allLessons, freeCount = 2)
 * Checks if a specific lesson is within free tier.
 * allLessons must be sorted by order asc (use .sort({ order: 1 }) from the controller).
 */
export function isLessonFree(lessonSlug, allLessons, freeCount = 2) {
  const freeSlugs = allLessons.slice(0, freeCount).map(l => l.slug);
  return freeSlugs.includes(lessonSlug);
}
```

---

## Phase 3 — Access Control on Existing Endpoints

### Modify All 4 Subject Controllers

Each controller must import User and fetch the user doc at the top of gated handlers:

```js
import User from '../models/User.js';
import { canAccessSubject, getLockedLessons, isLessonFree } from '../utils/accessControl.js';

/*
 * Helper: fetch user doc by req.userId (Clerk session ID).
 * Must be called in every gated route handler.
 * req.userId is set by requireAuth middleware — it is NOT the Mongoose _id.
 */
async function resolveUser(req) {
  const user = await User.findOne({ clerkId: req.userId }).lean();
  return user;
}
```

**`GET /:subject/lessons`** — Add `locked` flag:
```js
export async function getLessons(req, res) {
  try {
    const lessons = await DsaLesson.find().sort({ order: 1, title: 1 }).lean();
    const user = await resolveUser(req);
    const enriched = getLockedLessons(lessons, user);
    res.json({ data: enriched });
  } catch (error) { ... }
}
```

**`GET /:subject/lessons/:slug`** — Gate if locked:
```js
export async function getLessonBySlug(req, res) {
  try {
    const user = await resolveUser(req);
    const lesson = await DsaLesson.findOne({ slug: req.params.slug }).lean();
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Check access
    const allLessons = await DsaLesson.find().sort({ order: 1 }).lean();
    const free = isLessonFree(lesson.slug, allLessons);

    if (!free && !canAccessSubject(user)) {
      return res.json({
        data: {
          ...lesson,
          locked: true,
          problems: [],
          message: 'Subscribe to access this lesson'
        }
      });
    }

    const problems = await Problem.find({ lessonSlug: req.params.slug }).sort({ createdAt: -1 }).lean();
    res.json({ data: { ...lesson, locked: false, problems } });
  } catch (error) { ... }
}
```

**`GET /:subject/subtopics?lesson=slug`** — Gate based on parent lesson:
```js
export async function getSubtopics(req, res) {
  try {
    const user = await resolveUser(req);
    const { lesson } = req.query;
    if (!lesson) return res.status(400).json({ error: 'lesson query param required' });

    // Check if parent lesson is accessible
    const allLessons = await LessonModel.find().sort({ order: 1 }).lean();
    const free = isLessonFree(lesson, allLessons);

    if (!free && !canAccessSubject(user)) {
      return res.json({
        data: [],
        locked: true,
        message: 'Subscribe to access this lesson\'s subtopics'
      });
    }

    const subtopics = await SubtopicModel.find({ lessonSlug: lesson }).sort({ order: 1 }).lean();
    res.json({ data: subtopics });
  } catch (error) { ... }
}
```

**`GET /:subject/problems/:slug`** — Same pattern, check parent lesson.

### Modify All 4 Subject Routes

**⚠️ CRITICAL: Programming routes currently MISSING `requireAuth` on all GET endpoints (lines 14, 15, 21, 22, 28, 30 of `programmingRoutes.js`). Anonymous users can access all programming content without logging in. Fix this by adding `requireAuth`.**

DSA, DBMS, OS routes already have `requireAuth` — no change needed. Programming needs:

```js
// programmingRoutes.js
router.get('/lessons', requireAuth, getLessons);           // was: no auth
router.get('/lessons/:slug', requireAuth, getLessonBySlug); // was: no auth
router.get('/subtopics', requireAuth, getSubtopics);        // was: no auth
router.get('/subtopics/:slug', requireAuth, getSubtopicBySlug); // was: no auth
router.get('/problems', requireAuth, getProblems);          // was: no auth
router.get('/problems/:slug', requireAuth, getProblemBySlug); // was: no auth
```

---

## Phase 4 — Admin Payment Management

### New Backend Routes (`/api/admin`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/payments/stats` | Revenue overview stats |
| GET | `/api/admin/payments/subscriptions` | List all users with subscription data |
| POST | `/api/admin/payments/subscriptions/:userId/activate` | Manually activate (accepts `{ months }` in body) |
| POST | `/api/admin/payments/subscriptions/:userId/cancel` | Manually cancel (sets status to `canceled`, user keeps access until period end) |
| POST | `/api/admin/payments/subscriptions/:userId/deactivate` | Manually deactivate (sets status to `expired` immediately) |
| GET | `/api/admin/payments/transactions` | Transaction history |

### New Backend Routes (`/api/site-config`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/site-config/subscription` | Get current subscription price & durationDays |
| PUT | `/api/site-config/subscription` | Update subscription price & durationDays |

### New Backend Routes (`/api/admin/promos`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/promos` | List all promo codes |
| POST | `/api/admin/promos` | Create promo code |
| PUT | `/api/admin/promos/:id` | Update promo code |
| DELETE | `/api/admin/promos/:id` | Delete promo code |

### New Frontend Admin Pages

| Page | Route | Purpose |
|------|-------|---------|
| Payments Dashboard | `/admin/payments` | Stats cards, revenue, recent transactions |
| Subscriber Management | `/admin/payments/subscribers` | Table of subscriptions with manual Activate/Cancel controls |
| Promo Codes | `/admin/payments/promos` | CRUD for promo codes |
| Subscription Settings | `/admin/payments/settings` | Configure subscription price & durationDays |

### Admin Subscribers Detail

For active users, the Actions column shows a **Cancel** button (red). Admin clicks it to immediately set the user's subscription status to `canceled`. For non-active users, an **Activate** button (green) prompts "How many months of access should this user get?" and activates for `months × durationDays`.

### Admin Dashboard Changes (`AdminDashboard.jsx`)

Add a **Revenue** stats section:
```
╔══════════════════════════════════╗
║  REVENUE                         ║
╠══════════════════════════════════╣
║  Active Subscribers    42        ║
║  Active Centres        8         ║
║  Expected Monthly      ₹4,158    ║
║  Promo Codes Active    3         ║
╚══════════════════════════════════╝
```

### Coaching Center Detail Changes (`AdminCoachingCenterDetail.jsx`)

Add a **Billing & Payments** section:

```
╔══════════════════════════════════════════════╗
║  BILLING & PAYMENTS                          ║
╠══════════════════════════════════════════════╣
║  Status:  [Paid ▼]                          ║
║  Price/Student: [₹ 99]  Period: [Monthly ▼] ║
║  Students: 24                                ║
║  Expected: ₹2,376/month                     ║
║  Last Billed: 15 Jun 2026                   ║
║  Next Billing: 15 Jul 2026                  ║
║  Contact Email: [________]                  ║
║  Contact Phone: [________]                  ║
║  Notes: [____________________________]      ║
╚══════════════════════════════════════════════╝
```

### Admin Sidebar Changes (`AdminSidebar.jsx`)

Payments section now includes Subscription Settings:
```js
{ heading: 'Payments', links: [
  { to: '/admin/payments', label: 'Dashboard', icon: IndianRupee },
  { to: '/admin/payments/subscribers', label: 'Subscribers', icon: Users },
  { to: '/admin/payments/promos', label: 'Promo Codes', icon: TicketPercent },
  { to: '/admin/payments/settings', label: 'Subscription Settings', icon: Settings }
]}
```

---

## Phase 5 — Frontend Changes

### New files

| File | Purpose |
|------|---------|
| `client/src/pages/Pricing.jsx` | Public pricing page with Cashfree CTA |
| `client/src/pages/SubscriptionSettings.jsx` | User subscription management |
| `client/src/stores/usePaymentStore.js` | Zustand store for subscription state |
| `client/src/api/paymentApi.js` | API client for payment endpoints |
| `client/src/pages/AdminPayments.jsx` | Admin payment dashboard |
| `client/src/pages/AdminSubscribers.jsx` | Admin subscriber management |
| `client/src/pages/AdminPromoCodes.jsx` | Admin promo code CRUD |

### Pricing Page (`Pricing.jsx`)

Two columns side by side:

```
╔══════════════════════╗  ╔══════════════════════════════╗
║      FREE            ║  ║      PREMIUM — ₹99/month     ║
╠══════════════════════╣  ╠══════════════════════════════╣
║  ✓ First 2 lessons   ║  ║  ✓ All lessons               ║
║    per subject       ║  ║  ✓ All subtopics             ║
║  ✓ Basic access      ║  ║  ✓ All problems              ║
║                      ║  ║  ✓ Video solutions           ║
║                      ║  ║  ✓ PDF & PPTX downloads      ║
║                      ║  ║  ✓ Cancel anytime             ║
║                      ║  ║                              ║
║  [ CURRENT PLAN ]    ║  ║  [ SUBSCRIBE → ]             ║
╚══════════════════════╝  ╚══════════════════════════════╝
```

### Lock UI Pattern

**Lesson card (list page):**
```
┌──────────────────────┐
│   [image]            │
│                       │
│   🔒  Arrays         │  ← greyed / muted styling
│   12 problems        │
│                       │
│   [SUBSCRIBE →]      │  ← small CTA button linking to /pricing
└──────────────────────┘
```

**Lesson detail page (paywall banner at top):**
```
╔══════════════════════════════════════════════╗
║  🔒  This lesson requires a subscription     ║
║                                              ║
║  Subscribe for ₹99/month to unlock all       ║
║  lessons, subtopics, problems, and more.     ║
║                                              ║
║  [  Subscribe Now →  ]                       ║
╚══════════════════════════════════════════════╝
```

### Navigation Changes (`Navbar.jsx`)

For free users (not in center, no subscription):
- Show "Upgrade" or "Pricing" link in desktop nav
- Show "Go Premium" CTA in mobile overlay

For subscribed users:
- Show a small "Premium" badge next to the user avatar/dropdown

### App.jsx Route Additions

```jsx
<Route path="/pricing" element={<Pricing />} />
<Route path="/settings/subscription" element={<ProtectedRoute><SubscriptionSettings /></ProtectedRoute>} />
<Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
<Route path="/admin/payments/subscribers" element={<AdminRoute><AdminSubscribers /></AdminRoute>} />
<Route path="/admin/payments/promos" element={<AdminRoute><AdminPromoCodes /></AdminRoute>} />
<Route path="/admin/payments/settings" element={<AdminRoute><AdminSubscriptionSettings /></AdminRoute>} />
```

### Payment Store (`usePaymentStore.js`)

```js
import { create } from 'zustand';
import {
  createSubscription,
  checkStatus,
  cancelSubscription,
  applyPromo
} from '../api/paymentApi.js';

export const usePaymentStore = create((set, get) => ({
  subscription: null,   // { status, currentPeriodEnd, ... }
  loading: false,
  error: null,

  fetchStatus: async () => {
    set({ loading: true });
    try {
      const res = await checkStatus();
      set({ subscription: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribe: async (promoCode) => {
    const res = await createSubscription({ promoCode });
    // Redirect to Cashfree checkout
    window.location.href = res.payLink;
  },

  cancel: async () => { ... },

  checkPromo: async (code) => {
    return applyPromo({ code });
  }
}));
```

---

## Summary — All Files

### Create (13 files)

| # | File |
|---|------|
| 1 | `server/models/PromoCode.js` |
| 2 | `server/models/PaymentTransaction.js` |
| 3 | `server/config/cashfree.js` |
| 4 | `server/controllers/paymentController.js` |
| 5 | `server/routes/paymentRoutes.js` |
| 6 | `server/utils/accessControl.js` |
| 7 | `client/src/pages/Pricing.jsx` |
| 8 | `client/src/pages/SubscriptionSettings.jsx` |
| 9 | `client/src/pages/AdminPayments.jsx` |
| 10 | `client/src/pages/AdminSubscribers.jsx` |
| 11 | `client/src/pages/AdminPromoCodes.jsx` |
| 12 | `client/src/pages/AdminSubscriptionSettings.jsx` |
| 13 | `client/src/api/paymentApi.js` |

### Modify (22 files)

| # | File | Changes |
|---|------|---------|
| 1 | `server/models/User.js` | Add `subscription` sub-object |
| 2 | `server/models/SiteConfig.js` | Add `subscriptionSettings { price, durationDays }` field |
| 3 | `server/app.js` | Register payment routes |
| 4 | `server/controllers/adminController.js` | Add `getPaymentStats`, `cancelSubscription`, payment/subscription/promo endpoints; use `getSubscriptionSettings()` for dynamic duration |
| 5 | `server/controllers/siteConfigController.js` | Add `getSubscriptionSettings()` helper + `getSubscriptionConfig` / `updateSubscriptionConfig` endpoints |
| 6 | `server/routes/adminRoutes.js` | Add payment + promo admin routes + cancel subscription route |
| 7 | `server/routes/siteConfigRoutes.js` | Add GET + PUT for `/subscription` config |
| 8 | `server/controllers/paymentController.js` | Replace hardcoded `SUBSCRIPTION_PRICE=99` and `30` days with dynamic `getSubscriptionSettings()` |
| 9 | `server/controllers/dsaController.js` | Add `locked` flag to lesson list, gate detail |
| 10 | `server/controllers/dbmsController.js` | Same |
| 11 | `server/controllers/osController.js` | Same |
| 12 | `server/controllers/programmingController.js` | Same |
| 13 | `server/routes/dsaRoutes.js` | Already has `requireAuth` on all GET endpoints — no change |
| 14 | `server/routes/dbmsRoutes.js` | Same — already has `requireAuth` |
| 15 | `server/routes/osRoutes.js` | Same — already has `requireAuth` |
| 16 | `server/routes/programmingRoutes.js` | **ADD `requireAuth`** to 6 GET endpoints (missing — security gap) |
| 17 | `client/src/App.jsx` | Add /pricing, /settings/subscription, admin payment routes, admin subscription settings |
| 18 | `client/src/components/ui/Navbar.jsx` | Upgrade/Pricing link, Premium badge |
| 19 | `client/src/stores/useAuthStore.js` | Call `updateUser({ subscription })` after fetching status from payment store |
| 20 | `client/src/components/admin/AdminSidebar.jsx` | Add Payments section with Subscription Settings link |
| 21 | `client/src/pages/AdminDashboard.jsx` | Revenue stats card (uses dynamic `currentPrice` from API) |
| 22 | `client/src/pages/AdminSubscribers.jsx` | Activate prompts for months, Cancel button for active users, dynamic status badge |
| 23 | `client/src/pages/DsaList.jsx` (and DbmsList, OsList, ProgrammingList) | Lock overlay on lesson cards |
| 24 | `client/src/pages/DsaDetail.jsx` (and DbmsDetail, OsDetail, ProgrammingDetail) | Paywall banner when locked |

**Total: ~35 files**

---

## Environment Variables (add to `server/.env`)

```env
# Cashfree
CASHFREE_APP_ID=CF_TEST_xxxxx
CASHFREE_SECRET_KEY=CF_TEST_xxxxx
CASHFREE_ENV=sandbox    # or 'production'
```

---

## Implementation Order

### Status Overview

| # | Step | Status |
|---|------|--------|
| 1 | Data models | ✅ Done |
| 2 | Access control | ✅ Done |
| 3 | Subject controllers (locked flag) | ✅ Done |
| 4 | Subject routes (requireAuth) | ✅ Done |
| 5 | **Cashfree integration** | ✅ **Connected** — SDK configured with test keys in `.env`, sandbox mode, all 5 routes wired, webhook handler with signature verification ready |
| 6 | Admin backend (stats, subs, promos) | ✅ Done |
| 7 | Admin frontend (dashboard, subs, promos) | ✅ Done |
| 8 | **Pricing page** (`/pricing`) | ❌ Not started |
| 9 | **Lock UI** (lesson cards, paywall banners) | ❌ Not started |
| 10 | **Navigation** (Upgrade link, Premium badge) | ❌ Not started |
| 11 | **User subscription settings** (`/settings/subscription`) | ❌ Not started |
| 12 | Subscription settings admin (`/admin/payments/settings`) | ✅ Done |
| 13 | Admin cancel subscription | ✅ Done |

### Detail

1. **Data models** — User, PromoCode, PaymentTransaction changes (CoachingCenter billing deferred)
2. **Access control** — `server/utils/accessControl.js` first
3. **Subject controllers** — Add locking to lessons/subtopics/problems across all 4 subjects
4. **Subject routes** — Add `requireAuth` to programming GET routes (DSA/DBMS/OS already have it)
5. **Cashfree integration** — Config, payment controller, webhook, routes
   - `server/config/cashfree.js` — SDK initialized with `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`
   - `.env` has test keys loaded, sandbox mode active
   - 5 endpoints wired in `app.js`: `createSubscription`, `handleWebhook`, `applyPromo`, `getStatus`, `cancel`
   - All controller functions call Cashfree SDK and handle responses
   - Not yet end-to-end tested with live Cashfree API calls
6. **Admin backend** — Payment stats, subscription management, promo CRUD, cancel subscription
7. **Admin frontend** — Payments dashboard, subscribers page (with Activate/Cancel), promo codes page
8. **Pricing page** — Public `/pricing` with Cashfree checkout — **NEXT**
9. **Lock UI** — Lesson cards, paywall banners on detail pages — **NEXT**
10. **Navigation** — Upgrade link, Premium badge — **NEXT**
11. **User subscription settings** — `/settings/subscription` page — **NEXT**
12. **Subscription settings admin** — Configurable price & duration via `/admin/payments/settings`
13. **Admin cancel subscription** — Cancel button on subscriber management page
