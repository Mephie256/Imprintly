# 🚀 Deploying Imprintly to Vercel

This guide will walk you through deploying your Imprintly app to Vercel.

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase project set up with database schema
- ✅ Clerk authentication configured
- ✅ Stripe account with products/prices created
- ✅ GitHub repository with your code

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your repository** from GitHub
4. **Configure project settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (leave default)
   - Output Directory: `.next` (leave default)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

### 🔐 Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/custom-login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/custom-signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe Payments (LIVE keys for production)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 🎨 Optional Variables

```bash
# Image Processing
REMOVE_BG_API_KEY=your_remove_bg_key
REPLICATE_API_TOKEN=your_replicate_token

# Cloudinary (already configured)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drbzukawj
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=imprintify_preset

# Webhooks
CLERK_WEBHOOK_SECRET=whsec_...
```

## Step 4: Configure External Services

### 🔐 Clerk Configuration

1. **Go to Clerk Dashboard** → Your App → **Domains**
2. **Add your Vercel domain**: `https://your-app.vercel.app`
3. **Update redirect URLs** in Clerk to match your production domain

### 💳 Stripe Configuration

1. **Go to Stripe Dashboard** → **Webhooks**
2. **Add endpoint**: `https://your-app.vercel.app/api/webhooks/stripe`
3. **Select events**: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`
4. **Copy webhook secret** and add to Vercel environment variables

### 🗄️ Supabase Configuration

1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Add site URL**: `https://your-app.vercel.app`
3. **Add redirect URLs**: `https://your-app.vercel.app/**`

## Step 5: Test Your Deployment

1. **Visit your deployed app**: `https://your-app.vercel.app`
2. **Test key features**:
   - ✅ Sign up/Sign in
   - ✅ Image upload
   - ✅ Text overlay creation
   - ✅ Payment flow (if implemented)
   - ✅ Project saving

## Step 6: Set Up Custom Domain (Optional)

1. **In Vercel Dashboard** → **Settings** → **Domains**
2. **Add your custom domain**
3. **Update DNS records** as instructed by Vercel
4. **Update environment variables** to use your custom domain

## 🔧 Troubleshooting

### Common Issues:

1. **Build Errors**:
   - Check TypeScript errors: `npm run lint`
   - Ensure all dependencies are in `package.json`

2. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check variable names match exactly

3. **Authentication Issues**:
   - Verify Clerk domain configuration
   - Check redirect URLs

4. **Database Issues**:
   - Ensure Supabase schema is set up
   - Check RLS policies

## 📊 Monitoring

After deployment, monitor your app:
- **Vercel Analytics**: Built-in performance monitoring
- **Vercel Logs**: Check function logs for errors
- **Supabase Logs**: Monitor database queries
- **Stripe Dashboard**: Track payments and webhooks

## 🚀 Next Steps

1. **Set up monitoring** and error tracking
2. **Configure analytics** (Plausible, PostHog, etc.)
3. **Set up CI/CD** for automatic deployments
4. **Add custom domain** and SSL
5. **Optimize performance** based on Vercel analytics

---

**Need help?** Check the [Vercel Documentation](https://vercel.com/docs) or [Next.js Deployment Guide](https://nextjs.org/docs/deployment).
