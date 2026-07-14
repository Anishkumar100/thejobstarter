# Deployment Guide — TheWebytes DSA Web

> Deploy the client (Vite React SPA) and server (Express API) separately on Vercel.

---

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier works)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier)
- A [Clerk](https://clerk.com) application for authentication
- An [ImageKit](https://imagekit.io) account for media storage
- Git repository pushed to GitHub (or any VCS Vercel supports)

---

## Environment Variables

### Server (`server/`)

Set these in the Vercel dashboard for the server project:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string from Atlas |
| `CLERK_SECRET_KEY` | Clerk secret key (starts with `sk_test_` or `sk_live_`) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint (e.g. `https://ik.imagekit.io/your-id`) |
| `CLIENT_URL` | Your deployed client URL (e.g. `https://dsa-web-client.vercel.app`) |
| `NODE_ENV` | Set to `production` |

### Client (`client/`)

Set these in the Vercel dashboard for the client project:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Your deployed server URL + `/api` (e.g. `https://dsa-web-server.vercel.app/api`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (starts with `pk_test_` or `pk_live_`) |
| `VITE_IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint (same as server) |
| `VITE_USE_MOCK` | Set to `false` for production |

---

## Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/dsa-web.git
git push -u origin main
```

### 2. Deploy the Server

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `server/`
   - **Framework Preset**: Other
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)
4. Add all **server environment variables** from the table above
5. Click **Deploy**
6. Note your deployment URL (e.g. `https://dsa-web-server.vercel.app`)

### 3. Deploy the Client

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**
2. Import the same GitHub repo
3. Configure:
   - **Root Directory**: `client/`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add all **client environment variables** from the table above
   - Set `VITE_API_URL` to your server URL + `/api`
5. Click **Deploy**

### 4. Update the API Proxy (if needed)

After deploying the server, update `client/vercel.json` with your actual server URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-server-name.vercel.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Then push the change or redeploy the client.

---

## Post-Deployment

### Set up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Webhooks**
2. Add endpoint: `https://your-server.vercel.app/api/users/webhook`
3. Subscribe to `user.created` and `user.updated` events
4. Copy the signing secret and add it as `CLERK_WEBHOOK_SECRET` in your server env vars
5. Redeploy the server

### Seed the Database

Once deployed, make a `POST` request to seed data:

```bash
curl -X POST https://your-server.vercel.app/api/admin/seed
```

Or to seed just the about page:

```bash
curl -X PUT https://your-server.vercel.app/api/site-config/about-page \
  -H "Content-Type: application/json" \
  -d '{"aboutPage": { ... }}'
```

### Verify Everything

- Visit `https://your-client.vercel.app` — the site should load
- Navigate to `/dsa`, `/dbms`, `/os` — content should load from the API
- Try sign-in/sign-up — Clerk auth should work
- Visit `/admin` — admin dashboard should load

---

## Local Development

```bash
# Start the server (from server/)
cd server
npm run dev

# Start the client (from client/)
cd client
npm run dev
```

The client proxies `/api/*` requests to `http://localhost:3001` via Vite config.

---

## Troubleshooting

| Issue | Likely Fix |
|---|---|
| API returns 404 | Check `VITE_API_URL` on client — must match deployed server URL |
| Auth not working | Verify Clerk keys match between dashboard and env vars |
| Images not loading | Check ImageKit credentials |
| "Failed to fetch" | CORS — verify `CLIENT_URL` on server matches your client domain |
| Build fails | Check Vercel build logs; ensure `npm install` runs correctly |
