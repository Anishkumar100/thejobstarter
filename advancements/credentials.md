# Cashfree — Getting Test (Sandbox) Credentials

> A minimal guide to sign up and obtain Cashfree sandbox API keys for testing the ₹99/month subscription flow.

---

## Step 1: Sign Up for a Cashfree Merchant Account

Go to **[https://merchant.cashfree.com/merchants/signup](https://merchant.cashfree.com/merchants/signup)**

You'll need:
- **Email** — Any business/work email
- **Mobile** — Phone number for OTP verification
- **Password** — Create a strong password

> ✅ Sandbox is **completely free**. No KYC or documentation needed for testing.

---

## Step 2: Get Your Sandbox API Keys

Once logged in:

1. In the left navigation panel, click the **Developers** icon ⚙️
2. Under **Payment Gateway**, click **API Keys**
3. Your sandbox keys are **auto-generated** and already visible:
   - **App ID** (`x-client-id`) — e.g., `CF_TEST_xxxxxxxxxxxxx`
   - **Secret Key** (`x-client-secret`) — e.g., `sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Click the **eye icon** 👁️ to reveal the full keys, then **copy them**

> ⚠️ **Never** expose the Secret Key in client-side code or commit it to GitHub.

---

## Step 3: Add Credentials to Your Project

Add these to `server/.env`:

```env
CASHFREE_APP_ID=CF_TEST_xxxxxxxxxxxxx
CASHFREE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CASHFREE_ENV=sandbox
```

---

## That's It! ✅

Once you have these two keys (`CASHFREE_APP_ID` + `CASHFREE_SECRET_KEY`), you're ready to start implementing the payment system. Let me know when you have them!

### Quick Reference

| Item | Where to Find |
|------|---------------|
| Signup URL | https://merchant.cashfree.com/merchants/signup |
| Dashboard Login | https://merchant.cashfree.com |
| Keys Location | Dashboard → Developers → API Keys |
| Official Docs | https://www.cashfree.com/docs/api-reference/authentication |
