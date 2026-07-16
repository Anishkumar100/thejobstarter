# Deploying to cPanel — Full Beginner Guide

## Your Setup

| Part | Where it runs |
|---|---|
| **Frontend** (React app) | **cPanel** — uploaded to `public_html/` |
| **Backend** (Express API) | **cPanel** — Node.js app |
| **Database** (MongoDB) | **MongoDB Atlas** — free cloud database |

**Your server domain:** `anivoice.rhzsite.in` (this was given to you by RankHostZone)

---

## What is cPanel?

cPanel is a **control panel** for your hosting. It's a webpage where you manage files, set up Node.js apps, check logs, etc.

You're already logged in — everything happens inside this interface.

---

## How Does cPanel Work?

Your hosting account has a **folder structure** on the server:

```
Your Home Directory
├── public_html/          ← Your website lives here. Visitors see this.
├── logs/                 ← Error logs
├── ssl/                  ← SSL certificates
└── ... other folders
```

When someone visits `https://anivoice.rhzsite.in`, the server looks inside `public_html/` and serves whatever files are there.

Our job:
1. Put the **frontend** (React app) into `public_html/`
2. Put the **backend** (Express API) into a separate folder and run it as a Node.js app

**Both are on the same cPanel.** The frontend handles the visual pages, the backend handles API calls (fetching problems, users, etc.).

---

## Step 1: Understand What the dist/ Folder Is

You checked your `client/dist/` folder and saw `index.html` plus some `.js` and `.css` files. You might expect HTML files for every page (`dsa.html`, `about.html`, etc.) — but React doesn't work that way.

It's a **Single Page Application (SPA)**:

- There's only **one** `index.html` file
- When you visit `/dsa`, React reads the URL and **dynamically loads the DSA page** using JavaScript
- No need for separate HTML files — it's all done in the browser

So your `dist/` folder is exactly correct:
```
dist/
├── index.html              ← The one and only page
├── assets/
│   ├── index-CZcPbcuz.js   ← All your React code (compressed)
│   ├── index-CW4FOVeX.css  ← All your styles (compressed)
│   ├── dbmsApi-B_BdKGvd.js ← DBMS API code
│   └── osApi-DlTCOpAR.js   ← OS API code
├── favicon.ico
├── hero-video.mp4
└── thewebytes.png
```

This is exactly what a React app looks like after building. It works.

---

## Step 2: Build the Frontend

You already have `dist/` — done. If you ever change the code and need to rebuild:

```bash
cd client
npm run build
```

This refreshes the `dist/` folder.

---

## Step 3: Upload the Frontend

Now, inside cPanel:

### 3a. Open File Manager

Click **File Manager** (under the "Files" section).

### 3b. Navigate to public_html

The file tree opens on the left. Click on **public_html** to open it.

### 3c. Delete Default Files

There will be default files (like `cgi-bin/`, a default `index.html`, etc.). Select them all and click **Delete** at the top.

### 3d. Upload dist/ contents

1. Click **Upload**
2. Go to your local `client/dist/` folder
3. Drag and drop **everything inside** `dist/` into the upload box:
   - `index.html`
   - `assets/` (the whole folder)
   - `favicon.ico`
   - `hero-video.mp4`
   - `thewebytes.png`
4. Wait for it to finish (100%)

### 3e. Create .htaccess (routing fix)

React handles its own navigation. But if someone types `https://anivoice.rhzsite.in/dsa` directly in the browser, the server looks for a file called `dsa/` and gives a 404. We fix this:

1. Back in File Manager inside `public_html/`, click **+ File**
2. Name it `.htaccess` (with the dot)
3. Right-click → **Edit**
4. Paste:

```
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

5. **Save**

### 3f. Test

Open a new tab and go to `https://anivoice.rhzsite.in`. You should see your app. Click around — `/dsa`, `/dbms`, `/os` should all work.

If the page loads but looks weird (no styles), your `VITE_API_URL` might need fixing — we'll do that after the backend is set up.

---

## Step 4: Set Up the Backend (Node.js App)

The frontend is just the look. The backend is the server that talks to MongoDB and Clerk.

### 4a. Upload Backend Files

1. In File Manager, go **up one level** from `public_html` to your **home directory** (it's the top folder, named after your cPanel username)
2. Click **+ Folder**, name it `server`, click **Create**
3. Enter the `server/` folder
4. Click **Upload** and upload everything from your local `server/` folder **except `node_modules/`**:
   - `app.js`
   - `package.json`
   - `package-lock.json`
   - `config/`
   - `controllers/`
   - `middleware/`
   - `models/`
   - `routes/`
   - `seeds/`
   - `utils/`

### 4b. Find Node.js Setup

Scroll through cPanel icons for **Setup Node.js App**. Use the search bar at top-right and type "node" if you can't find it.

### 4c. Create the App

Click **Create Application**. Fill:

| Field | Value |
|---|---|
| **Node.js version** | **18** or **20** |
| **Application mode** | **Production** |
| **Application root** | `server` |
| **Application URL** | Select `anivoice.rhzsite.in` from the dropdown |
| **Application startup file** | `app.js` |

Click **Create**.

### 4d. Add Environment Variables

Click **Edit** on your app. Scroll down to **Environment Variables**. Add these one by one:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `CLERK_SECRET_KEY` | From Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | From Clerk Dashboard → Webhooks |
| `IMAGEKIT_PUBLIC_KEY` | From ImageKit Dashboard |
| `IMAGEKIT_PRIVATE_KEY` | From ImageKit Dashboard |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/your_account` |

Click **Add** for each one. Then **Save**.

### 4e. Install & Start

1. Click **Run npm install** — wait for completion
2. Click **Start App** or **Run**

### 4f. Get Backend URL

After starting, the app page shows the URL. It will look like:

```
https://anivoice.rhzsite.in:PORTNUMBER
```

or it may show with the port already displayed. **Write this down.**

Test it by visiting:

```
https://anivoice.rhzsite.in:PORT/api/dsa?limit=1
```

If you see JSON data, the backend is live.

---

## Step 5: Seed the Database

Visit:

```
https://anivoice.rhzsite.in:PORT/api/admin/seed
```

This fills MongoDB with all the DSA problems, DBMS articles, etc.

If it fails, check that `MONGODB_URI` is correct in the environment variables.

---

## Step 6: Connect Frontend to Backend

The frontend needs to know where the backend API is.

On your local computer, open `client/.env` and set:

```
VITE_API_URL=https://anivoice.rhzsite.in:PORT/api
```

Replace `PORT` with your actual port number.

Then rebuild the frontend:

```bash
cd client
npm run build
```

### Re-upload the frontend

1. In cPanel File Manager, delete everything inside `public_html/` (except `.htaccess`)
2. Upload the new `dist/` files again
3. Done

Now your app at `https://anivoice.rhzsite.in` talks to the API at `https://anivoice.rhzsite.in:PORT/api`.

---

## Step 7: Update Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Edit your endpoint
3. Change URL to: `https://anivoice.rhzsite.in:PORT/api/users/webhook`
4. Save

Now when users sign up, a profile is created in MongoDB.

---

## Step 8: Set Yourself as Admin

1. Go to **Clerk Dashboard** → **Users**
2. Click on your user
3. Under **Public Metadata**, click **Edit**
4. Type: `{"role": "admin"}`
5. Save

Now you can access `/admin` routes.

---

## Final URLs

| Thing | URL |
|---|---|
| Your website | `https://anivoice.rhzsite.in` |
| Backend API | `https://anivoice.rhzsite.in:PORT` |
| Backend API test | `https://anivoice.rhzsite.in:PORT/api/dsa?limit=1` |
| MongoDB | Your Atlas connection string |

---

## Troubleshooting

| Problem | Likely Fix |
|---|---|
| **Blank page / no styles** | Wrong `VITE_API_URL`. Rebuild and re-upload |
| **404 on /dsa, /dbms** | `.htaccess` missing. Check Step 3e |
| **Backend not responding** | Node.js app not started. Check Setup Node.js App → Start |
| **"Cannot connect to MongoDB"** | `MONGODB_URI` wrong, or IP not whitelisted in Atlas → Network Access → Add `0.0.0.0/0` |
| **npm install fails** | Low memory? Check logs in Setup Node.js App |
| **Can't see my app after upload** | Wait 2-3 minutes — cPanel sometimes caches. Or clear your browser cache |
| **Port number changes** | If you restart the Node.js app, the port may change. Check the URL again in Setup Node.js App |

---

## Keeping the Backend Running

Once started in Setup Node.js App, it runs **on the server** — you don't need to keep the cPanel tab open. It keeps running even after you close your browser.
