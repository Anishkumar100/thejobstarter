# Clerk Setup Instructions (Test Mode)

## Prerequisites

- A Clerk account at https://dashboard.clerk.com
- This project running locally (`http://localhost:3001`)

---

## 1. Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Add Application**
2. Name: **TheWebytes DSA** (or any name)
3. Sign-in methods: Select **Email** and any social providers you want (Google recommended)
4. Click **Create Application**

---

## 2. Get API Keys

From the Clerk Dashboard → **API Keys**:

| Variable | Where to put it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (copy the `pk_test_xxx` value) | `client/.env` → `VITE_CLERK_PUBLISHABLE_KEY` |
| `CLERK_SECRET_KEY` (the `sk_test_xxx` value) | `server/.env` → `CLERK_SECRET_KEY` |
| `CLERK_PUBLISHABLE_KEY` (same `pk_test_xxx` as above) | `server/.env` → `CLERK_PUBLISHABLE_KEY` |

### Example `.env` files:

**`client/.env`:**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK=true
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_account
```

**`server/.env`:**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/thewebytes_dsa
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_account
```

---

## 3. Enable Required Features in Clerk Dashboard

### 3a. Sign-in Methods (User & Authentication → Email, Phone, Username)

Enable at minimum:

- **Email address** ✅ (required for account creation)
- **Username** ✅ (required — the app uses `username` for profile URLs like `/users/{username}`)

Recommended: Also enable **Google** (or any social login) under **Social Connections**.

### 3b. Session Settings (Sessions)

Default settings work out of the box. No changes needed.

### 3c. Webhooks

1. Go to **Webhooks** in the Clerk Dashboard
2. Click **Add Endpoint**
3. **Endpoint URL**: `http://localhost:3001/api/users/webhook`
4. **Subscribe to events**: Select `user.created` and `user.updated`
5. Click **Create**
6. Copy the **Signing Secret** (`whsec_xxx`) into `server/.env` → `CLERK_WEBHOOK_SECRET`

> **Why this is needed**: When a user signs up, Clerk sends a webhook to your backend so a matching `User` document is created in MongoDB. Without this, user profiles won't exist in the database.

---

## 4. Grant Admin Access

By default, all new users are regular users. To give yourself admin access:

### Option A: Via Clerk Dashboard (easier)

1. Go to **Clerk Dashboard** → **Users**
2. Click on your user
3. Under **Public metadata**, click **Edit**
4. Enter: `{"role": "admin"}`
5. Click **Save**

### Option B: Via Clerk API

From your terminal:
```bash
curl -X PATCH https://api.clerk.com/v1/users/{user_id} \
  -H "Authorization: Bearer sk_test_xxx" \
  -H "Content-Type: application/json" \
  -d '{"public_metadata": {"role": "admin"}}'
```

> Once set, the admin badge appears in the app navbar and `/admin/*` routes become accessible.

---

## 5. Verify Everything Works

1. **Start the app**: `cd client && npm run dev` and `cd server && node --watch app.js`
2. **Visit** `http://localhost:5173` (or your Vite dev URL)
3. **Click Sign In** → should redirect to Clerk's sign-in page
4. **Sign up** with email → after verification, you should be redirected back
5. **Check the navbar** → should show your user avatar
6. **Visit** `http://localhost:3001/api/users/webhook` with a POST request (or check server logs) to see webhook sync
7. **Set your role to admin** (see step 4) → `/admin` routes become accessible

---

## Test Mode Limits

- Emails are sent but **not actually delivered** (check the Clerk Dashboard → **Emails** tab to see verification emails)
- Max 5000 users in test mode
- Rate limits apply (lower than production)
- Session tokens expire after 60 days of inactivity

When you're ready for production, switch to **Live** mode in the Clerk Dashboard and replace `pk_test_xxx` / `sk_test_xxx` with live keys.

---

## Troubleshooting

| Problem | Likely Fix |
|---|---|
| "Clerk not loaded" banner | `VITE_CLERK_PUBLISHABLE_KEY` is missing or still set to placeholder `pk_test_xxx` in `client/.env` |
| API returns 401 | `CLERK_SECRET_KEY` is missing or wrong in `server/.env` |
| User signs up but no user in MongoDB | Webhook endpoint not configured in Clerk Dashboard, or server not running, or `CLERK_WEBHOOK_SECRET` wrong |
| Admin routes return 403 | User's `publicMetadata.role` is not `"admin"` — set it in Clerk Dashboard |
| Webhook verification errors | The backend currently does **not** verify webhook signatures. In test mode this is fine. For production, add signature verification using the `CLERK_WEBHOOK_SECRET`. |
