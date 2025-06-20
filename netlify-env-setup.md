# 🚀 Netlify Environment Variables Setup

## Quick Fix for Build Error

Your Netlify build failed because of missing environment variables. Here's how to fix it:

### 1. Go to Netlify Dashboard
- Open your site in Netlify
- Go to **Site settings** → **Environment variables**

### 2. Add These Variables (Copy & Paste)

```bash
# === REQUIRED FOR BUILD ===
STRIPE_SECRET_KEY=sk_test_placeholder_for_build
STRIPE_MONTHLY_PRICE_ID=price_placeholder_for_build
STRIPE_YEARLY_PRICE_ID=price_placeholder_for_build
STRIPE_WEBHOOK_SECRET=whsec_placeholder_for_build

# === REQUIRED: SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# === REQUIRED: CLERK ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/custom-login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/custom-signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# === REQUIRED: APP CONFIG ===
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NODE_ENV=production

# === OPTIONAL ===
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drbzukawj
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=imprintify_preset
REMOVE_BG_API_KEY=your_remove_bg_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
```

### 3. Replace Placeholder Values

**For Supabase:**
- Get from: https://supabase.com/dashboard → Your Project → Settings → API

**For Clerk:**
- Get from: https://dashboard.clerk.com → Your App → API Keys

**For Stripe (when ready):**
- Get from: https://dashboard.stripe.com → Developers → API Keys

### 4. Redeploy

After adding the environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**

## 🎉 Your site should now build successfully!

---

## Next Steps After Deployment

1. **Test your live site**
2. **Update Clerk domains** to include your Netlify URL
3. **Set up real Stripe keys** when ready for payments
4. **Configure Supabase** with your live domain

---

**Need help?** The placeholder values will allow your site to build and run. You can update them later with real values when you're ready to enable those features.
