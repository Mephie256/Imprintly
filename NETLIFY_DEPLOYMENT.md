# 🚀 Deploy Imprintly to Netlify - Easy & Free!

This guide will get your Imprintly app live on Netlify in just a few minutes!

## 🎯 Why Netlify for Imprintly?

✅ **Free tier**: 100GB bandwidth/month  
✅ **Easy deployment**: Connect GitHub and go live  
✅ **Next.js support**: Built-in optimization  
✅ **Custom domains**: Free SSL included  
✅ **Form handling**: Perfect for contact forms  

---

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ **GitHub account** with your code pushed
- ✅ **Supabase project** set up with database
- ✅ **Clerk account** for authentication
- ✅ **Stripe account** for payments (optional)

---

## 🚀 Step 1: Deploy to Netlify (2 minutes!)

### Option A: One-Click Deploy (Easiest)

1. **Go to [netlify.com](https://netlify.com)** and sign up with GitHub
2. **Click "New site from Git"**
3. **Choose GitHub** and authorize Netlify
4. **Select your repository**: `image-text-overlay`
5. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

6. **Click "Deploy site"** 🎉

### Option B: Drag & Drop (If no GitHub)

1. **Build locally**:
   ```bash
   npm run build
   ```
2. **Drag the `.next` folder** to Netlify dashboard

---

## ⚙️ Step 2: Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

### 🔐 Required Variables

```bash
# Supabase Database
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

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NODE_ENV=production
```

### 💳 Optional: Stripe (for payments)

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

### 🎨 Optional: Image Processing

```bash
REMOVE_BG_API_KEY=your_remove_bg_key
REPLICATE_API_TOKEN=your_replicate_token
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drbzukawj
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=imprintify_preset
```

---

## 🔧 Step 3: Configure External Services

### 🔐 Update Clerk Settings

1. **Go to Clerk Dashboard** → Your App → **Domains**
2. **Add your Netlify URL**: `https://your-site-name.netlify.app`
3. **Update redirect URLs** to match your domain

### 💳 Update Stripe Webhooks (if using payments)

1. **Go to Stripe Dashboard** → **Webhooks**
2. **Add endpoint**: `https://your-site-name.netlify.app/api/webhooks/stripe`
3. **Select events**: `checkout.session.completed`, `invoice.payment_succeeded`
4. **Copy webhook secret** and add to Netlify environment variables

### 🗄️ Update Supabase Settings

1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Add site URL**: `https://your-site-name.netlify.app`
3. **Add redirect URLs**: `https://your-site-name.netlify.app/**`

---

## 🎉 Step 4: Test Your Live App!

1. **Visit your site**: `https://your-site-name.netlify.app`
2. **Test features**:
   - ✅ Sign up/Sign in
   - ✅ Upload images
   - ✅ Create text overlays
   - ✅ Save projects
   - ✅ Payment flow (if enabled)

---

## 🌐 Step 5: Custom Domain (Optional)

1. **In Netlify Dashboard** → **Domain settings**
2. **Add custom domain**: `yourdomain.com`
3. **Update DNS records** as shown by Netlify
4. **Free SSL** is automatically enabled!

---

## 🔄 Step 6: Automatic Deployments

Every time you push to GitHub, Netlify will automatically:
- ✅ **Build your app**
- ✅ **Deploy updates**
- ✅ **Invalidate cache**

No manual work needed! 🎉

---

## 🚨 Troubleshooting

### Build Fails?
```bash
# Check your build locally first
npm run build
npm run lint
```

### Environment Variables Not Working?
- ✅ Check variable names match exactly
- ✅ Restart deployment after adding variables
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables

### Authentication Issues?
- ✅ Update Clerk domain settings
- ✅ Check redirect URLs
- ✅ Verify environment variables

### Database Connection Issues?
- ✅ Check Supabase URL and keys
- ✅ Verify RLS policies
- ✅ Test database connection

---

## 📊 Monitoring Your App

- **Netlify Analytics**: Built-in traffic monitoring
- **Function logs**: Check API route performance
- **Deploy logs**: Debug build issues
- **Real User Monitoring**: Track performance

---

## 🚀 Next Steps

1. **Set up analytics** (Google Analytics, Plausible)
2. **Add monitoring** (Sentry for error tracking)
3. **Optimize images** (already handled by Next.js)
4. **Set up backups** for your database
5. **Add more features** to your app!

---

## 💡 Pro Tips

- **Use branch deploys** for testing features
- **Set up form notifications** for contact forms
- **Enable Netlify Identity** for additional auth options
- **Use Netlify Functions** for serverless APIs
- **Set up split testing** for A/B testing

---

**🎉 Congratulations!** Your Imprintly app is now live on Netlify!

**Need help?** Check [Netlify Docs](https://docs.netlify.com) or [Next.js on Netlify Guide](https://docs.netlify.com/frameworks/next-js/)
