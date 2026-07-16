# Deploying to cPanel — Full Beginner Guide

## What is cPanel?

cPanel is a **control panel** for your hosting. Think of it as a dashboard where you manage your website — upload files, create databases, set up emails, etc.

You log into cPanel through a URL your hosting provider gives you (something like `https://yourdomain.com:2083` or `https://server-name.com/cpanel`).

---

## How Does Hosting Work?

Your hosting account has a **folder structure** on the server:

```
Your hosting account's home directory
├── public_html/        ← This is your website. Visitors see this.
├── logs/               ← Error logs (don't touch)
└── ... other folders
```

When someone visits `https://yourdomain.com`, the server looks inside `public_html/` and serves whatever files are there.

Our job:
1. Put the **frontend** (React app) into `public_html/`
2. Put the **backend** (Express API) into a separate folder and tell cPanel to run it as a Node.js app

---

## Step 1: Build the Frontend

Do this on your **local computer** (the one you code on).

Open a terminal in the `client/` folder:

```bash
cd client
npm install
npm run build
```

This creates a `dist/` folder inside `client/`. The `dist/` folder contains your completed website (HTML, JS, CSS).

> If you get errors, make sure you have Node.js installed on your computer first. Check with `node --version`.

---

## Step 2: Set Environment Variables for Production

Before building, open `client/.env` and set:

```
VITE_API_URL=https://yourdomain.com/api
```

Replace `yourdomain.com` with your actual domain.

**We'll find the correct URL later when the backend is running.**

---

## Step 3: Upload the Frontend

Now go to **cPanel** in your browser.

### 3a. Open File Manager

Look for the **File Manager** icon (under "Files" section). Click it.

### 3b. Navigate to public_html

You'll see a list of folders. Click on **public_html** (or `public_html/yourdomain.com` — depends on your host).

### 3c. Delete Default Files

There might be default files like `index.html`, `cgi-bin/`, etc. Select them all and click **Delete** at the top. We'll replace them with our app.

### 3d. Upload dist/

Click **Upload** at the top. A new window opens.

Go to your local `client/dist/` folder, select ALL files inside it, and drag them into the upload area.

Files you should see uploading:
- `index.html`
- `assets/` (folder with JS/CSS files inside)
- `robots.txt`
- `favicon.ico`
- (anything else that was inside `dist/`)

Wait for upload to finish (100%). Close the upload window.

### 3e. Check the Result

Go back to File Manager, inside `public_html/`. You should see the files you uploaded. If they're there, the frontend is uploaded.

---

## Step 4: Fix 404 Errors on Other Pages (Create .htaccess)

If you visit `https://yourdomain.com` it works, but `https://yourdomain.com/dsa` gives a 404 error — we need to fix this.

React handles routing on the client side, so the server needs to send ALL requests to `index.html`.

1. In File Manager (inside `public_html/`), click **+ File** (top bar)
2. Type: `.htaccess` and click **Create**
3. Right-click the new `.htaccess` file → **Edit**
4. Paste this exactly:

```
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

5. Click **Save Changes**

Now try visiting `https://yourdomain.com/dsa` — it should work.

---

## Step 5: Set Up the Backend (Node.js App)

The frontend is just the visual part. The backend is the server that handles API requests (fetching problems, user data, etc.).

### 5a. Find Node.js Setup in cPanel

Scroll through the cPanel icons and look for one of these:
- **Setup Node.js App**
- **Node.js**
- **Node.js Selector**

If you can't find it, search "Node" in the cPanel search bar (top right). If it's not there at all, your plan doesn't support Node.js and you'll need to upgrade.

### 5b. Upload Backend Files

First, let's upload the backend code:

1. Go to **File Manager**
2. Click on your **home directory** (it's usually at the top, named your cPanel username — NOT `public_html`). It's the parent folder of `public_html`.
3. Click **+ Folder** and name it `server`
4. Open the new `server/` folder
5. Click **Upload**, then upload ALL files and folders from your local `server/` folder (except `node_modules/` — we'll install those separately)

Files to upload:
```
app.js
package.json
package-lock.json
config/
controllers/
middleware/
models/
routes/
seeds/
utils/
```

### 5c. Create the Node.js App

1. Go to **Setup Node.js App**
2. Click **Create Application** or **+ Create**
3. Fill in:

| Field | Value |
|---|---|
| Node.js version | **18** (or whatever is available — 16+ works) |
| Application mode | **Production** |
| Application root | `server` (type this — it's the folder we created) |
| Application URL | Select your domain from the dropdown |
| Application startup file | `app.js` |

4. Click **Create**

### 5d. Add Environment Variables

Now you'll see your app listed. Click on the **application name** or the **edit** button.

Scroll down to **Environment Variables**. Add each of these one by one:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string (from MongoDB Atlas) |
| `CLERK_SECRET_KEY` | `sk_test_xxx` from Clerk |
| `CLERK_PUBLISHABLE_KEY` | `pk_test_xxx` from Clerk |
| `CLERK_WEBHOOK_SECRET` | `whsec_xxx` from Clerk |
| `IMAGEKIT_PUBLIC_KEY` | From ImageKit |
| `IMAGEKIT_PRIVATE_KEY` | From ImageKit |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/your_account` |

Click **Add** after each one. When done, scroll up and click **Save** or **Update**.

### 5e. Install Dependencies

Back on the Node.js app page, look for a button that says **Run npm install** or **Install npm dependencies**. Click it.

Wait for it to finish (you'll see a log/output). This downloads all the packages the backend needs.

### 5f. Start the App

Click **Run** or **Start App**. The app should start.

You'll see the application URL appear (something like `https://yourdomain.com:3000`). This is your backend URL. **Write this down.**

---

## Step 6: Find Your Backend URL

After starting, the Node.js app page shows something like:

```
https://yourdomain.com:3000
```

or

```
https://server1234.yourhost.com/~
```

Test it:
1. Visit `https://yourdomain.com:3000/api/dsa?limit=1` in your browser
2. If you see JSON data (or `{}`), it's working
3. If you get an error, the app isn't fully running yet — check the logs

---

## Step 7: Rebuild Frontend with Correct API URL

Now that we know the backend URL, we need to rebuild the frontend to point to it.

On your local computer, edit `client/.env`:

```
VITE_API_URL=https://yourdomain.com:3000/api
```

(Replace with your actual backend URL + `/api`)

Then rebuild and re-upload:

```bash
cd client
npm run build
```

Delete everything in `public_html/` again (except `.htaccess`), upload the new `dist/` contents, and the frontend will now talk to your live backend.

---

## Step 8: Seed the Database

Visit this URL in your browser:

```
https://yourdomain.com:3000/api/admin/seed
```

This loads the initial data (DSA problems, DBMS articles, etc.) into MongoDB. You'll see "Database seeded successfully" or a summary JSON.

---

## Step 9: Update Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Click on your existing webhook endpoint
3. Change the URL from `http://localhost:3001/api/users/webhook` to:
   ```
   https://yourdomain.com:3000/api/users/webhook
   ```
   (Use your actual backend URL)
4. Click **Save**

Now when users sign up, their profile gets created in MongoDB automatically.

---

## Final Checklist

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] Navigating to `/dsa`, `/dbms`, `/os` works (no 404)
- [ ] Backend responds at `https://yourdomain.com:3000/api/dsa`
- [ ] Sign up works (Clerk → redirects back)
- [ ] Admin access works (set `publicMetadata.role = "admin"` in Clerk Dashboard)

---

## Troubleshooting

**"The page isn't working" or blank screen**
- Open browser DevTools (F12) → Console tab → see error messages
- Common: wrong `VITE_API_URL`, or backend not running

**"503 Service Unavailable"**
- Node.js app stopped. Go to Setup Node.js App and click Start

**"Cannot POST /api/something"**
- Backend is running but env variables missing. Check MongoDB URI is correct

**"MongooseError: Cannot connect"**
- MongoDB Atlas connection string wrong, or your IP isn't whitelisted
- In MongoDB Atlas → Network Access → Add your server's IP

**"npm install fails"**
- Go to Setup Node.js App → see if the logs show an error. Might be a memory limit

---

## What's Next?

After everything works, you can point your domain to the backend (remove the port number) using a subdomain — but that's advanced. For now, having `:3000` in the URL is fine for testing.
