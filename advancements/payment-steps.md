# Payment Integration — Step-by-Step Progress

> Log of every file created/modified during payment integration.
> Referenced from `payments.md`.
> **Last updated: July 29, 2026**

---

## Phase 1 — Data Model Changes ✅

| File | Action | Details |
|------|--------|---------|
| `server/models/User.js` | Modified | Added `subscription` sub-object (`status`, `cashfreeCustomerId`, `cashfreeSubscriptionId`, `currentPeriodStart`, `currentPeriodEnd`, `appliedPromo`, `pendingRedirect`) |
| `server/models/PromoCode.js` | Created | Promo codes model (`free_month`, `discount_percent`, `discount_fixed`) with maxUses/expiresAt/active |
| `server/models/PaymentTransaction.js` | Created | Payment audit trail — type enum includes `subscription_created/renewed/canceled`, `promo_applied`, `admin_activated/deactivated` |
| `server/models/SiteConfig.js` | Modified | Added `subscriptionSettings { price, durationDays }` + `pricingPlans [{ id, name, price, interval, features, ... }]` |

**Note:** CoachingCenter billing fields deferred to future phase.

---

## Phase 2 — Access Control Utility ✅

**File:** `server/utils/accessControl.js` — Created

Four functions:
- `resolveUser(req)` — Looks up User doc by `req.userId` (Clerk session), handles unauthenticated
- `canAccessSubject(user)` — Checks admin/coordinator/coachingCenter/active subscription/regular user
- `getLockedLessons(lessons, user, freeCount=2)` — Adds `locked: boolean` flag per lesson
- `isLessonFree(lessonSlug, allLessons, freeCount=2)` — Checks if specific lesson is within free tier

All functions have detailed `console.log('[ACCESS]')` logging for runtime debugging.

---

## Phase 3 — Subject Controller Locking ✅

### Controllers — Added gating on all GET endpoints:

| Controller | Changes |
|---|---|
| `dsaController.js` | Locked lesson list, lesson detail, problem list, problem detail |
| `subtopicController.js` | Locked subtopic list, subtopic detail, subtopic problems |
| `dbmsController.js` | Same pattern — locked all GET endpoints |
| `osController.js` | Same pattern — locked all GET endpoints |
| `programmingController.js` | Same pattern — locked all GET endpoints |

### Routes — All GET endpoints require authentication:

| Route File | Before | After |
|---|---|---|
| `dsaRoutes.js` | `requireAuth` on GET | Kept `requireAuth` (no change) |
| `dbmsRoutes.js` | `requireAuth` on GET | Kept `requireAuth` (no change) |
| `osRoutes.js` | `requireAuth` on GET | Kept `requireAuth` (no change) |
| `programmingRoutes.js` | **No auth** on GET (security gap) | Added `requireAuth` on GET |

All POST/PUT/DELETE remain `requireAuth + requireAdmin`. Unauthenticated users receive 401 on every endpoint.

✅ All 10 files pass syntax check.

---

## Phase 2 (Backend) — Payment Core SDK & Routes ✅

### New Files

| File | Action | Details |
|---|---|---|
| `server/config/cashfree.js` | Created | Cashfree SDK init (`cashfree-pg` v6, `CFEnvironment.SANDBOX`/`PRODUCTION`) |
| `server/controllers/paymentController.js` | Created | **7 functions**: `createSubscription`, `handleWebhook`, `applyPromo`, `getSubscriptionStatus`, `verifySubscription`, `handlePaymentReturn`, `cancelSubscription` |
| `server/routes/paymentRoutes.js` | Created | **6 endpoints** (webhook uses `express.raw()`, others require auth) |
| `server/app.js` | Modified | Imported `paymentRoutes`, added raw body parser for payment webhook, registered `/api/payments` |

### Payment Endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/payments/create-subscription` | User | Create Cashfree subscription with dynamic pricing plan + optional promo |
| POST | `/api/payments/webhook` | Public | Cashfree webhook (raw body, signature verified via SDK) |
| POST | `/api/payments/apply-promo` | User | Validate promo code, return calculated price |
| GET | `/api/payments/status` | User | Return current subscription + period dates |
| POST | `/api/payments/verify-subscription` | User | Fallback: verify after payment return (webhook may be delayed) |
| GET\|POST | `/api/payments/return` | Public | Cashfree return handler (POST->302 redirect to frontend) |
| POST | `/api/payments/cancel` | User | Cancel subscription via Cashfree API, set `canceled` status |

### Key Implementation Details

- **Dynamic pricing plans**: `createSubscription` fetches plans from `SiteConfig.pricingPlans`, creates Cashfree plan via `ensurePlan()`, supports monthly/yearly/once intervals
- **Promo codes**: Validated with expiration + maxUses checks, affects first-charge only (recurring = full price)
- **Webhook**: SDK `PGVerifyWebhookSignature()`, handles `PAYMENT_SUCCESS/CHARGED/FAILED/CANCELLED`, uses `wasPreviouslyActive` check before mutation
- **verifySubscription**: Fallback when webhook hasn't fired — calls `SubsFetchSubscription` to check Cashfree status, activates locally if paid
- **Payment return**: Handles both GET (302) and POST (form submission) from Cashfree, redirects to frontend `PaymentSuccess` page
- **Cancel**: Calls `SubsManageSubscription` with `CANCEL` action, creates transaction audit record

### Dependencies
- Added `cashfree-pg` to `server/package.json`
- Env vars already present: `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV=sandbox`

### Post-Code-Review Fixes Already Applied

| Issue | Fix |
|---|---|
| `transactionType` always `'subscription_renewed'` in webhook (checked status after mutation) | Moved check before mutation — uses `wasPreviouslyActive` |
| `req.rawBody` doesn't exist with `express.raw()` | Added explicit `.toString('utf8')` Buffer conversion |
| `cashfreeCustomerId` set to subscription ID (wrong value) | Changed to `user._id.toString()` |
| Typo `susbcribe` in route comment | Fixed to `subscribe` |

---

## Phase 4 — Admin Payment Management ✅

### Backend — New Functions in `server/controllers/adminController.js`

Added **9 new exported functions**:

| Function | Endpoint | Purpose |
|---|---|---|
| `getPaymentStats` | `GET /api/admin/payments/stats` | Aggregate revenue (total, expected monthly), active/canceled subs, transaction counts, current price/duration |
| `getAllSubscriptions` | `GET /api/admin/payments/subscriptions` | Paginated list of users with non-free subscription, status breakdown counts, status filter |
| `activateSubscription` | `POST /api/admin/payments/subscriptions/:userId/activate` | Manually set user to `active` with `months × durationDays` period + audit trail |
| `cancelSubscription` | `POST /api/admin/payments/subscriptions/:userId/cancel` | Set `canceled` (access until period end, no more charges) + audit trail |
| `deactivateSubscription` | `POST /api/admin/payments/subscriptions/:userId/deactivate` | Set `expired` immediately (revoke access) + audit trail |
| `getTransactionHistory` | `GET /api/admin/payments/transactions` | Paginated transaction list with user + promo population, type/status filters |
| `getPromoCodes` | `GET /api/admin/promos` | List all promo codes with creator info |
| `createPromoCode` | `POST /api/admin/promos` | Create promo (uppercased, validates type/value, checks duplicates) |
| `updatePromoCode` | `PUT /api/admin/promos/:id` | Update type/value/expires/active/description (code frozen after creation) |
| `deletePromoCode` | `DELETE /api/admin/promos/:id` | Permanently delete a promo code |

### Backend — Site Config Routes (New)

| File | Action | Purpose |
|---|---|---|
| `server/controllers/siteConfigController.js` | Modified | Added `getSubscriptionSettings()` helper + `getSubscriptionConfig`, `updateSubscriptionConfig`, `getPricingPlans`, `getPricingPlansAdmin`, `updatePricingPlans`, `getPublicSubscriptionConfig` |
| `server/routes/siteConfigRoutes.js` | Modified | Added `GET /api/site-config/subscription`, `PUT /api/site-config/subscription`, `GET /api/site-config/subscription/public`, `GET /api/site-config/pricing`, `GET /api/site-config/pricing/admin`, `PUT /api/site-config/pricing` |

### Backend — Routes in `server/routes/adminRoutes.js`

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/payments/stats` | Admin |
| GET | `/api/admin/payments/subscriptions` | Admin |
| POST | `/api/admin/payments/subscriptions/:userId/activate` | Admin |
| POST | `/api/admin/payments/subscriptions/:userId/deactivate` | Admin |
| POST | `/api/admin/payments/subscriptions/:userId/cancel` | Admin |
| GET | `/api/admin/payments/transactions` | Admin |
| GET | `/api/admin/promos` | Admin |
| POST | `/api/admin/promos` | Admin |
| PUT | `/api/admin/promos/:id` | Admin |
| DELETE | `/api/admin/promos/:id` | Admin |

### Frontend — Admin Pages (6 total)

| Page | Route | Purpose |
|---|---|---|
| `AdminPayments.jsx` | `/admin/payments` | 6 stats cards (revenue, active subs, expected monthly, transactions, canceled, monthly) + recent transactions table |
| `AdminSubscribers.jsx` | `/admin/payments/subscribers` | Filterable table with user avatar/name/email, status badges (Active/Canceled/Expired/Past Due/Free), period start/end dates, Activate (prompts for months) / Cancel buttons |
| `AdminPromoCodes.jsx` | `/admin/payments/promos` | Full CRUD: create/edit form with type/value/maxUses/expiration, delete with confirmation |
| `AdminSubscriptionSettings.jsx` | `/admin/payments/settings` | Configure subscription price (₹) + duration (days) |
| `AdminPricingSettings.jsx` | `/admin/payments/pricing` | Configure pricing plans (Free/Premium/Lifetime) with features |
| `AdminDashboard.jsx` | `/admin` | Revenue section with 3 stats cards (active subs, expected monthly income, promo codes active) |

### Frontend — Sidebar & Navigation

| File | Changes |
|---|---|
| `AdminSidebar.jsx` | Added **Payments** section with Dashboard, Subscribers, Promo Codes, Pricing Settings links |
| `App.jsx` | Added routes for `/admin/payments`, `/admin/payments/subscribers`, `/admin/payments/promos`, `/admin/payments/settings`, `/admin/payments/pricing` |

### Additional Scripts

| File | Purpose |
|---|---|
| `server/scripts/fixMissingSubscription.js` | Migration script to backfill missing subscription fields on existing users |
| `server/scripts/syncAdminRoles.js` | Sync Clerk publicMetadata roles to MongoDB User docs |

---

## Phase 5 — Frontend User-Facing ✅

### Navbar Changes (`Navbar.jsx`)

| Change | Details |
|--------|---------|
| **Pricing hidden for center/coordinator** | `isCenterOrCoordinator` check hides Pricing nav link and Upgrade CTA for center-enrolled users, coordinators, and users with `coordinatorFor` |
| **Community dropdown** | Q&A and Users consolidated under a single "Community ▼" dropdown. Opens on click + hover, closes on mouse leave. Rotating chevron icon. |
| **Responsive breakpoints** | Added progressive breakpoints at 1100px and 960px — tighter padding/gap, smaller fonts — before the 768px mobile overlay |
| **Role badges** | Premium subscribers get `Sparkles` badge (gold). Coordinators get `Building2` badge (accent red). Center students get `GraduationCap` badge (indigo). |

### Pricing Page (`Pricing.jsx`)

| Change | Details |
|--------|---------|
| **Center/coordinator restriction** | Full brutalist page replaces pricing grid — lock badge, role icon, message explaining organization access, CTA buttons (Go to DSA / Dashboard) |
| **Subscribed plan disabled** | Paid plan cards become `opacity-80 pointer-events-none` with green success border/shadow. "SUBSCRIBED" badge replaces plan badge. CTA becomes static green "Subscribed ✓" |
| **DOM glitch eliminated** | Restructured from 3 early-return blocks to single return with conditional children — no hard DOM swap, no flash |
| **Race condition guard** | Loading waits for both plans data AND user data before rendering pricing grid or restriction screen |
| **Button visibility** | Both Go to DSA and Dashboard buttons use CSS variables for guaranteed contrast in light and dark modes |

### Subscription Settings Page (`SubscriptionSettings.jsx`) — NEW

| Item | Details |
|------|---------|
| **Route** | `/settings/subscription` — protected route added to `App.jsx` |
| **Status card** | Shows current plan (Active/Canceled/Expired/Free) with period start/end dates, color-coded status bar |
| **Cancel flow** | Confirmation dialog with warning icon + explanation → subscription cancelled via Cashfree API → success state with access-until date |
| **Free user CTA** | Subscribe button linking to `/pricing` for unsubscribed users |
| **Styling** | Full brutalist design using CSS variables, theme-adaptive |

### PaymentSuccess Page (`PaymentSuccess.jsx`) — REWRITTEN

| Change | Details |
|--------|---------|
| **Route** | Removed `<AppLayout>` wrapper — no navbar/footer rendered |
| **Redesign** | Full brutalist: 6px border, 14px hard shadow, grid background, success accent bar, CSS variables throughout |
| **Theme support** | All colors use `var()` CSS variables — adapts to light/dark modes |
| **States** | Verifying spinner, warning banner for pending payments, countdown timer, interactive Continue Now button with hover/press effects |
| **Dead code cleanup** | Removed unused `useUser` import after changing default redirect to `/dsa` |

### Paywall Button Text Cleanup — 8 Files Updated

| File | Before | After |
|------|--------|-------|
| `DsaList.jsx`, `DbmsList.jsx`, `OsList.jsx`, `ProgrammingList.jsx` | `Subscribe — ₹` | `Subscribe` |
| `DsaDetail.jsx`, `DbmsDetail.jsx`, `OsDetail.jsx`, `ProgrammingDetail.jsx` | `Subscribe Now — ₹` | `Subscribe` |

### Lock UI — Already Implemented Earlier

| Item | Files Affected | Status |
|------|---------------|--------|
| **Locked lesson cards** | `DsaList.jsx`, `DbmsList.jsx`, `OsList.jsx`, `ProgrammingList.jsx` | ✅ Done (lock overlay + Premium Lesson badge + Subscribe CTA on each locked card) |
| **Paywall banners on detail pages** | `DsaDetail.jsx`, `DbmsDetail.jsx`, `OsDetail.jsx`, `ProgrammingDetail.jsx` | ✅ Done (full paywall banner replacing locked content, with Subscribe CTA + Back link) |
| **Navbar Premium badge + Upgrade CTA** | `Navbar.jsx` | ✅ Done (Sparkles badge for subscribers, Upgrade CTA for free users) |

### How Lock Logic Works (accessControl.js)

- Free tier = **first 2 lessons** (by `order` field, ascending) — global across all categories
- Lessons 3+ are `locked: true` for free users
- Full access users (active sub, center student, coordinator, admin) see all lessons unlocked
- Lock is applied **server-side** before sending to frontend — not client-side only

### Still NOT Started (Post-Phase 5 Initiatives)

| # | Item | Priority |
|---|------|---------|
| 1 | **`usePaymentStore.js`** | 🟢 Low — currently using direct `apiRequest` calls |
| 2 | **`paymentApi.js`** | 🟢 Low — currently using direct `apiRequest` calls |
| 3 | **AuthStore subscription sync** | 🟢 Low — nice-to-have |

---

---

## Architecture: Pricing Plans vs Payment Configuration

> **Key insight:** The admin panel has TWO separate price fields that serve different purposes.

### The Two Price Fields

| Section | Field | What it controls | Where it's used |
|---------|-------|----------------|-----------------|
| **Payment Configuration** | `subscriptionSettings.price` (default ₹99) | Fallback amount + admin manual activations | Webhook transaction records (fallback), `verifySubscription` period calc, admin activate button |
| **Pricing Plans** | `pricingPlans[].price` (e.g. ₹100) | **The actual price Cashfree charges** | `createSubscription→plan_amount`, `ensurePlan→plan_recurring_amount`, promo code discount calculation |

### Data Flow: What actually goes to Cashfree

When a user subscribes:

```
User clicks "Subscribe" on Pricing page (shows price from pricingPlans[].price)
  → /subscribe?plan=plan_xxx
    → POST /api/payments/create-subscription { plan: "plan_xxx" }
      → createSubscription() looks up SiteConfig.pricingPlans.find(id === planId)
        → Uses pricingPlan.price as plan_amount  ← THIS IS SENT TO CASHFREE
        → Uses pricingPlan.interval for plan_type (PERIODIC/ONCE/MONTH/YEAR)
        → Creates Cashfree plan with plan_recurring_amount = pricingPlan.price
```

**The `subscriptionSettings.price` (Payment Configuration) is NEVER sent to Cashfree.**

### Where Payment Configuration IS used

| Scenario | What uses it |
|----------|-------------|
| Webhook `PAYMENT_SUCCESS` | `hookSubConfig.durationDays` to set `currentPeriodEnd` (period length) |
| Webhook transaction record | `hookSubConfig.price` as fallback when `paymentAmount` is 0 |
| `verifySubscription` fallback | `hookSubConfig.durationDays` for period calculation |
| Admin manual activate | `subConfig.durationDays × months` for access duration |
| `applyPromo` (BEFORE fix) | Used subscriptionSettings.price instead of plan price — **BUG** |

### Historical Bugs (Now Fixed)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Promo discount calculated against wrong price | `applyPromo` used `getSubscriptionSettings().price` (₹99 default) instead of the actual `pricingPlan.price` | Now fetches the pricing plan from `SiteConfig.pricingPlans.find()` and uses its actual price |
| Promo discount never reached Cashfree | `createSubscription` calculated `firstCharge` locally but never sent `subscription_first_charge` in the Cashfree API request | Now adds `subscription_first_charge` to the request body when `firstCharge !== price` |
| Subscribe page didn't tell backend which plan to discount | `applyPromo` was called with only `{ code }`, no `planId` | Subscribe.jsx now passes `planId` along with the promo code |

---

## Overall Verdict

| Phase | Total Items | Done | % Complete |
|---|---|---|---|
| 1 — Data Models | 5 | 5 | **100%** |
| 2 — Access Control | 1 (file) | 1 | **100%** |
| 3 — Controller Locking | 10 | 10 | **100%** |
| 2 (Backend) — Payment Core | 7 (functions) | 7 | **100%** |
| 4 — Admin Management | 9 (backend) + 6 (frontend) | 15 | **100%** |
| **Phase 5 — User-Facing** | **8 items** | **5 (CSS/Nav/App/routes)** + **3 pages** | **~50%** |
| **Total** | **~42 items** | **~37** | **~88%** |
