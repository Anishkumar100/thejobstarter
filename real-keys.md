# Real Keys — Production Setup Guide

> Step-by-step guide to deploy TheJobStarter (TheWebytes DSA Web) to **Vercel**, get **Clerk production keys**, and get **real (live) Cashfree keys**.
>
> Domain already purchased: **`thejobstarter.in`**. Follow the sections in order — DNS choices affect later steps.

---

## Part 0 — What you need before starting

| Item | Where to get it | Notes |
|------|-----------------|-------|
| ✅ Domain | Already bought: **`thejobstarter.in`** | Registrar DNS is where we add records (Part 1) |
| Vercel account | https://vercel.com | Free Hobby plan is enough to start |
| GitHub repo | https://github.com/Anishkumar100/thejobstarter | Both `client/` and `server/` are in this one repo |
| Business/individual documents for KYC | PAN + Aadhaar (India), or business registration | Needed only for **Cashfree** live mode |
| Bank account + IFSC | Your bank | Needed only for **Cashfree** KYC / settlements |
| Clerk account | https://dashboard.clerk.com | You already have one (dev keys working) |
| Cashfree account | https://merchant.cashfree.com | You already have a **test/sandbox** account |

> Our app reads keys from `.env` files locally, **but on Vercel you paste them as Environment Variables in the dashboard** (never commit them):
>
> - **Server project** → variables for `server/.env` (names in `server/.env.example`)
> - **Client project** → variables for `client/.env` (names in `client/.env.example`)
>
> **Never commit `.env` files.** They are already in `.gitignore` — keep it that way.

---

## Part 1 — Deploy to Vercel & connect `thejobstarter.in`

> The repo is already wired for Vercel:
>
> - `client/vercel.json` → Vite SPA, output `dist`, and it **rewrites `/api/*` to the backend URL** so the frontend can call the API through its own origin.
> - `server/vercel.json` → Express `app.js` built with `@vercel/node` (serverless functions).
>
> Resulting deployments (create these names in Vercel):
>
> | App | Vercel project name | Auto URL |
> |-----|---------------------|----------|
> | Frontend | `thejobstarter` | `https://thejobstarter.vercel.app` |
> | Backend API | `thejobstarter-backend` | `https://thejobstarter-backend.vercel.app` |

### 1.1 Push the repo to GitHub (first time only)
1. Open a terminal in the repo root:
   ```bash
   git add -A
   git commit -m "ready for Vercel deploy"
   git push -u origin main
   ```
2. Confirm at https://github.com/Anishkumar100/thejobstarter that `client/` and `server/` exist.

### 1.2 Import the repo into Vercel
1. Go to https://vercel.com/new
2. Choose **Import Git Repository** → connect your GitHub account if asked → pick `Anishkumar100/thejobstarter`.
3. Vercel auto-detects the **monorepo** and offers to import both projects. Import them **one at a time**:

### 1.3 Create the Frontend project (`thejobstarter`)
1. **Project name:** `thejobstarter`
2. **Root Directory:** `client`
3. **Framework Preset:** `Vite`
4. Build command / output dir: Vercel reads `client/vercel.json` → `npm run build` → `dist`.
5. **Environment Variables** (Add each; these are the client `.env` values):
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://api.thejobstarter.in/api` *(set in Part 1.7)* |
   | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` *(from Part 2.2)* |
   | `VITE_USE_MOCK` | `false` |
   | `VITE_IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/thewebytes` |
6. Click **Deploy**. First deploy may warn about the empty `VITE_CLERK_PUBLISHABLE_KEY` — fine, we set real keys in Part 2 and redeploy.

### 1.4 Create the Backend project (`thejobstarter-backend`)
1. **Project name:** `thejobstarter-backend`
2. **Root Directory:** `server`
3. **Framework Preset:** `Other` (Vercel will use `server/vercel.json`).
4. **Environment Variables** (Add each; these are the server `.env` values):
   | Name | Value |
   |------|-------|
   | `PORT` | `3001` |
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `CLIENT_URL` | `https://www.thejobstarter.in` |
   | `SERVER_URL` | `https://api.thejobstarter.in` |
   | `CLERK_SECRET_KEY` | `sk_live_...` *(Part 2.2)* |
   | `CLERK_PUBLISHABLE_KEY` | `pk_live_...` *(Part 2.2)* |
   | `CLERK_WEBHOOK_SECRET` | `whsec_...` *(Part 2.5)* |
   | `IMAGEKIT_PUBLIC_KEY` | from ImageKit |
   | `IMAGEKIT_PRIVATE_KEY` | from ImageKit |
   | `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/thewebytes` |
   | `CASHFREE_APP_ID` | live App ID *(Part 3)* |
   | `CASHFREE_SECRET_KEY` | live Secret Key *(Part 3)* |
   | `CASHFREE_ENV` | `production` *(Part 3)* |
5. Click **Deploy**.

> ⚠️ **Vercel doesn't read local `.env` fil
es.** You must add every variable above in the Vercel dashboard (Project → Settings → Environment Variables). Add them **now** (even with placeholder values) and update after Parts 2–3.

### 1.5 Verify both deployments
1. Open `https://thejobstarter.vercel.app` → the SPA should load.
2. Open `https://thejobstarter-backend.vercel.app/api/dsa` → should return JSON (not 404).
3. Test the frontend→backend proxy from the browser: `https://thejobstarter.vercel.app/api/dsa` → should also return JSON (via the `vercel.json` rewrite).

### 1.6 Add the domain to the Frontend project
1. Vercel → project **`thejobstarter`** → **Settings → Domains**.
2. Add `thejobstarter.in` and `www.thejobstarter.in`.
3. Vercel shows DNS instructions. Add records **in your registrar's DNS panel** (where you bought the domain):
   | Record | Name | Value |
   |--------|------|-------|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |
   > If your registrar only allows ALIAS/ANAME at apex, use `CNAME @ → cname.vercel-dns.com` if supported, otherwise keep the A record.
4. Wait for the domain to show **Valid Configuration** in Vercel (10 min – 48 h).

### 1.7 Add the API subdomain to the Backend project
1. Vercel → project **`thejobstarter-backend`** → **Settings → Domains**.
2. Add `api.thejobstarter.in`.
3. Add this record in your registrar's DNS:
   | Record | Name | Value |
   |--------|------|-------|
   | `CNAME` | `api` | `cname.vercel-dns.com` |
4. Wait for it to go valid. Now the API is reachable at `https://api.thejobstarter.in/api/...`.
5. ⚠️ Update the **Frontend** env var `VITE_API_URL=https://api.thejobstarter.in/api` and **redeploy** the frontend, and update backend `SERVER_URL` if needed.

### 1.8 Add the Clerk subdomain (needed in Part 2)
1. In your registrar's DNS, add a **placeholder** `CNAME clerk → cname.vercel-dns.com` now, so the subdomain exists.
2. In Part 2.3 Clerk will give you the real CNAME **target** — update the `clerk` record value then.

### 1.9 Update CORS for the real domain (backend code)
`server/app.js` already whitelists `https://thejobstarter.vercel.app`, but the real origin is `https://thejobstarter.in` / `https://www.thejobstarter.in`. Add your apex domain to the `allowedOrigins` array:
```js
'https://thejobstarter.in',
'https://www.thejobstarter.in',
```
(`CLIENT_URL` env var covers one of them automatically — add the apex explicitly to be safe.) Then push & redeploy the backend.

> ### DNS summary (final state, all in your registrar)
> | Record | Name | Value | Used by |
> |--------|------|-------|---------|
> | `A` | `@` | `76.76.21.21` | Frontend (`thejobstarter.in`) |
> | `CNAME` | `www` | `cname.vercel-dns.com` | Frontend (`www.thejobstarter.in`) |
> | `CNAME` | `api` | `cname.vercel-dns.com` | Backend (`api.thejobstarter.in`) |
> | `CNAME` | `clerk` | `cname.vercel-dns.com` *(temp)* → Clerk's target *(Part 2.3)* | Clerk auth |

---

## Part 2 — Clerk production keys

> Dev keys look like `pk_test_...` / `sk_test_...`. Production keys look like `pk_live_...` / `sk_live_...`.
> **A production instance is required** — the dev instance (`.accounts.dev`) is capped at 100 users, uses shared OAuth credentials, and is not safe for a real site.

### 2.1 Create a Production instance
1. Open https://dashboard.clerk.com
2. Click **Add application** (or the "Production" toggle next to your dev app).
3. Choose **Production** environment.
4. Name it `thewebytes-prod` (or similar).
5. Leave "Development" as-is — you keep it for local testing.

> The production instance is **empty** — users, webhooks, and OAuth settings do NOT carry over. That's expected.

### 2.2 Copy the live API keys
1. In the **production** instance, go to **Configure → API Keys** (URL: `https://dashboard.clerk.com/last-active?path=/api-keys`).
2. Copy:
   - **Publishable Key** → starts with `pk_live_`
   - **Secret Key** → starts with `sk_live_`
3. **Backend** → Vercel project `thejobstarter-backend` → Settings → Environment Variables:
   ```env
   CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
   CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
   ```
4. **Frontend** → Vercel project `thejobstarter` → Settings → Environment Variables:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
   ```

> ⚠️ The Secret Key is **server-only**. Never put `sk_...` in the frontend project or any frontend code.

### 2.3 Point Clerk at your own domain (CNAME)
Clerk's frontend API must run on **your** subdomain in production.
1. In the production instance: **Configure → Customization → Domains** (or **Accounts → Domains**).
2. Add a custom domain: `clerk.thejobstarter.in` (any subdomain you own works).
3. Clerk shows a **CNAME record** to add. Create it in your registrar's DNS:
   ```
   clerk   CNAME   →   <the CNAME target Clerk shows you>
   ```
4. Wait for DNS propagation (up to 48h). Clerk's dashboard shows the check status.
5. After it resolves, **go live** on that domain.

> ⚠️ **Check for CAA records** at your domain — a restrictive CAA record can block Clerk from issuing an SSL certificate for `clerk.thejobstarter.in`. If you have CAA records, add Clerk's CA (Let's Encrypt / Google Trust Services).

### 2.4 Allow your app's origins
In the production instance:
1. **Configure → Customization → General** (or **Security → Redirects / Authorized origins**).
2. Add your real frontend origin to **Allowed origins / Redirect URLs**:
   - `https://www.thejobstarter.in`
   - `https://thejobstarter.in`
   - (and `http://localhost:3000` if you want local testing against prod keys — not required)
3. Set **sign-in / sign-up redirect URLs** to your real pages (e.g. `/dsa`, `/qa`).

### 2.5 Fix the Clerk webhook (user sync)
Our app creates a `User` in MongoDB via `POST /api/users/webhook` (`handleClerkWebhook`). This must point to your real API in production.
1. In the **production** instance: **Configure → Webhooks → Add endpoint**.
2. **Endpoint URL:**
   ```
   https://api.thejobstarter.in/api/users/webhook
   ```
   (the `api` subdomain points to the Vercel backend project — see Part 1.7)
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
4. Click **Create** — Clerk generates a **signing secret** starting with `whsec_`.
5. Copy it into **`server/.env`**:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

> ⚠️ This signing secret is **different from your API Secret Key**. `CLERK_WEBHOOK_SECRET` must be the `whsec_...` value shown on the webhook endpoint, and the webhook endpoint must be on the **production** instance (not the dev one) for production signups to sync.

### 2.6 Reconfigure OAuth (Google/GitHub) for production
Dev instances use **shared Clerk test credentials**. Production requires **your own** OAuth app:
1. **Google:** https://console.cloud.google.com → Create an **OAuth 2.0 Client ID** (Web application).
   - Authorized redirect URI:
     ```
     https://clerk.thejobstarter.in/v1/oauth_callback
     ```
   - Paste the **Client ID** and **Client Secret** into Clerk → **Configure → SSO Connections → Google** (on the production instance).
2. **GitHub / other providers:** same pattern — register an app, set the redirect URI to `https://clerk.thejobstarter.in/v1/oauth_callback`, paste credentials into Clerk's SSO Connections.
3. In Clerk, set **Email, Phone, or Username** auth settings as you want for production.

### 2.7 Verify
1. Update the env vars in **Vercel** (frontend + backend) with the live Clerk keys, then redeploy both projects (push to GitHub or hit Redeploy in the dashboard).
2. Open `https://thejobstarter.in`, click **Sign in** → you should see the login on `clerk.thejobstarter.in` (your domain), not `.accounts.dev`.
3. Sign up a fresh account → check MongoDB got a `User` doc (webhook fired).
4. Confirm the browser network tab shows a `pk_live_` key and requests to `clerk.thejobstarter.in`.

---

## Part 3 — Cashfree real (live) keys

> Cashfree has two environments:
>
> - **Test** → keys start with `TEST` in the App ID, base URL `https://sandbox.cashfree.com/pg`, **no real money**.
> - **Production** → live App ID / Secret Key, base URL `https://api.cashfree.com/pg`, **real money**.
>
> Our app switches with `CASHFREE_ENV`:
> - `CASHFREE_ENV=production` → `CFEnvironment.PRODUCTION`
> - anything else → `CFEnvironment.SANDBOX`

### 3.1 Complete KYC first (mandatory)
You cannot generate **live** keys until Cashfree approves your account:
1. Login at https://merchant.cashfree.com
2. Complete the onboarding / KYC form:
   - Business type (Sole Proprietor / Pvt Ltd / LLP / etc.)
   - Business PAN
   - Authorized signatory Aadhaar (video/paper KYC as prompted)
   - GST (if registered)
   - Bank account + IFSC (settlements; Cashfree does a ₹1 penny-drop to verify)
   - Business address proof
3. Submit and wait — typically **24–48 working hours**.
4. Watch your email for **"Account Activated"**. Your dashboard will switch from **Test** to **Production/Live** mode.
5. If it's stuck: https://merchant.cashfree.com/merchants/landing?env=prod&raise_issue=1

### 3.2 Generate production API keys
1. In the **Production** (live) toggle at the top-right of the Cashfree merchant dashboard.
2. Go to **Payment Gateway → Developers → API Keys**.
3. Click **Generate Production Keys** (or **Create New API Key**).
4. You get two values:
   - **App ID / Client ID** (public identifier)
   - **Secret Key** (private)
5. **Download/copy the Secret Key immediately** — Cashfree masks it after you leave the page.

### 3.3 Add to the Vercel backend env vars
In Vercel project `thejobstarter-backend` → Settings → Environment Variables:
```env
CASHFREE_APP_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CASHFREE_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CASHFREE_ENV=production
```
> ⚠️ `CASHFREE_SECRET_KEY` is **server-only**. Never put it in the frontend project.
> ⚠️ Keep `CASHFREE_APP_ID`/`CASHFREE_SECRET_KEY` as the **pair** from the same environment — never mix a test App ID with a live Secret Key (this is the #1 cause of "Invalid credentials").

### 3.4 Configure the Cashfree webhook
Our app verifies payments with `POST /api/payments/webhook` (`handleWebhook`, raw body + signature check using `CASHFREE_SECRET_KEY`).
1. On the Cashfree dashboard: **Developers → Webhooks → Subscriptions** (the Subscriptions product — not the generic PG one).
2. Add endpoint:
   ```
   https://api.thejobstarter.in/api/payments/webhook
   ```
3. Subscribe to subscription + payment events, e.g.:
   - `SUBSCRIPTION_STATUS`
   - `PAYMENT_SUCCESS` / `PAYMENT_FAILED`
   - `SUBSCRIPTION_CHARGE_SUCCESS`
4. Save.

> **Signature verification note:** our code (and Cashfree's SDK) verifies the webhook signature with the **merchant Secret Key** (`CASHFREE_SECRET_KEY`), using header `x-webhook-signature` + `x-webhook-timestamp` over the **raw body**. If you see "signature mismatch" in sandbox or live, the usual cause is the body being parsed/JSON-stringified before signing — our route reads the raw body, so leave the route as-is.

### 3.5 Configure the return URL
Our checkout redirects the customer back through `POST/GET /api/payments/return`, which 302-redirects to the SPA at `/payment/success`.
1. When creating the subscription in code, the **Return URL** must be the live one:
   ```
   https://api.thejobstarter.in/api/payments/return
   ```
2. Also confirm `CLIENT_URL` / `SERVER_URL` in the **Vercel backend env vars** point to the live origins (used for redirects and CORS).

### 3.6 Test before going fully live
1. Optional: run one **₹1 real transaction** on production to confirm end-to-end.
2. `PaymentSuccess.jsx` calls `POST /api/payments/verify-subscription` as a fallback — it queries Cashfree directly, so even if the webhook is late, the user gets activated.

### 3.7 Cashfree support
- Docs: https://www.cashfree.com/docs
- Merchant dashboard: https://merchant.cashfree.com
- API auth: https://www.cashfree.com/docs/api-reference/authentication
- Subscriptions API: https://www.cashfree.com/docs/api-reference/payments/latest/subscription/mandate/create

---

## Part 4 — Final checklist before you cut over

### Environment Variables (Vercel dashboard — live values only)

**Backend project `thejobstarter-backend`** (Settings → Environment Variables)
```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.../thewebytes_dsa?retryWrites=true&w=majority
CLIENT_URL=https://www.thejobstarter.in
SERVER_URL=https://api.thejobstarter.in

CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/thewebytes

CASHFREE_APP_ID=<live app id>
CASHFREE_SECRET_KEY=<live secret>
CASHFREE_ENV=production
```

**Frontend project `thejobstarter`** (Settings → Environment Variables)
```env
VITE_API_URL=https://api.thejobstarter.in/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_USE_MOCK=false
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/thewebytes
```

### DNS records at your registrar (all propagated)
| Name | Type | Target | Used by |
|------|------|--------|---------|
| `@` | `A` | `76.76.21.21` | Frontend (`thejobstarter.in`) |
| `www` | `CNAME` | `cname.vercel-dns.com` | Frontend |
| `api` | `CNAME` | `cname.vercel-dns.com` | Backend |
| `clerk` | `CNAME` | Clerk's frontend-API target (shown in Clerk dashboard) | Clerk auth |

### Dashboard checks
- [ ] Frontend deployed at `https://thejobstarter.vercel.app` + custom domain `thejobstarter.in`
- [ ] Backend deployed at `https://thejobstarter-backend.vercel.app` + custom domain `api.thejobstarter.in`
- [ ] `https://api.thejobstarter.in/api/dsa` returns JSON
- [ ] Clerk production instance created; login works on `clerk.thejobstarter.in`
- [ ] Clerk webhook endpoint live + `CLERK_WEBHOOK_SECRET` set; signup creates a Mongo `User`
- [ ] OAuth providers re-registered for production (Google/GitHub client + secret pasted)
- [ ] Cashfree account activated (KYC approved)
- [ ] Cashfree **Production** toggle ON; live App ID + Secret Key saved
- [ ] Cashfree Subscriptions webhook endpoint live
- [ ] `CASHFREE_ENV=production` set in Vercel backend env vars

---

## Part 5 — Cut over steps (once everything above is green)

1. Put all live values into the **Vercel environment variables** for both projects (frontend + backend) and push to GitHub — Vercel auto-deploys on push.
2. Keep the **dev** Clerk instance running for local work; do not remove test Cashfree keys.
3. After deploy:
   - Sign in on `https://thejobstarter.in` (verifies Clerk).
   - Register a throwaway account (verifies Clerk webhook → Mongo).
   - Buy the cheapest subscription with a real ₹1 payment (verifies Cashfree live + webhook + verify-subscription fallback).
4. Watch the Vercel function logs (Project → Logs) for:
   - `[AUTH]`, `[USER] Clerk webhook received`
   - `[PAYMENT] Webhook verified` / subscription activation
5. Only after all four checks pass, announce the site is live.
