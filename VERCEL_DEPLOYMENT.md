# 🚀 Vercel Deployment Guide for VyaparOS

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you don't have one
3. **MongoDB Atlas**: Your MongoDB connection string ready
4. **Environment Variables**: All required secrets ready

## Step-by-Step Deployment

### Step 1: Connect GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `Himanshuyadav23/vyaparOS`
4. Vercel will auto-detect it's a Next.js project

### Step 2: Configure Project Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

**CRITICAL**: Add these environment variables in Vercel dashboard:

#### Required Environment Variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://shortshimanshuyadav_db_user:YOUR_PASSWORD@cluster0.pulzusv.mongodb.net/vyaparos?retryWrites=true&w=majority&appName=Cluster0

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-secure
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production

# Google OAuth (Optional - if using Google login)
GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Skip Auth (Set to false for production)
SKIP_AUTH=false
NEXT_PUBLIC_SKIP_AUTH=false
```

#### How to Add Environment Variables in Vercel:

1. In your project settings, go to **"Environment Variables"**
2. Click **"Add"** for each variable
3. Add both for **Production**, **Preview**, and **Development** environments
4. **Important**: Use a strong, random `JWT_SECRET` (you can generate one using: `openssl rand -base64 32`)

### Step 4: Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies
   - Build your Next.js app
   - Deploy to production

### Step 5: Verify Deployment

1. Once deployed, Vercel will provide you with a URL like: `https://vyaparos.vercel.app`
2. Test the following:
   - ✅ Landing page loads
   - ✅ Registration works
   - ✅ Login works
   - ✅ Dashboard is accessible after login
   - ✅ Marketplace is accessible without login
   - ✅ API routes work

## Post-Deployment Checklist

### ✅ Security Checklist

- [ ] `JWT_SECRET` is set to a strong, random value
- [ ] `SKIP_AUTH` is set to `false` in production
- [ ] MongoDB connection string is correct
- [ ] Google OAuth credentials are configured (if using)
- [ ] No sensitive data in code (all in environment variables)

### ✅ Functionality Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Each user gets their own account
- [ ] Dashboard is protected (requires login)
- [ ] Marketplace is public (no login required)
- [ ] API routes respond correctly
- [ ] Database connections work

### ✅ Performance Checklist

- [ ] Build completes successfully
- [ ] Pages load quickly
- [ ] Images are optimized
- [ ] API responses are fast

## Troubleshooting

### Build Fails

**Error**: Build command failed
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)
- Check build logs in Vercel dashboard

**Error**: TypeScript errors
- Run `npm run build` locally first to catch errors
- Fix all TypeScript errors before deploying

### Runtime Errors

**Error**: MongoDB connection failed
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
- Ensure MongoDB user has correct permissions

**Error**: Authentication not working
- Verify `JWT_SECRET` is set
- Check that `SKIP_AUTH=false` in production
- Verify token is being sent in requests

**Error**: Environment variables not found
- Ensure variables are set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Database Issues

**MongoDB Atlas IP Whitelist**:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs - Vercel uses dynamic IPs)
3. Or add specific Vercel IP ranges if available

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically configure SSL

## Monitoring & Analytics

- **Vercel Analytics**: Enable in project settings
- **Logs**: View in Vercel dashboard → Logs
- **Performance**: Check Vercel dashboard → Analytics

## Continuous Deployment

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Pull requests → Preview deployments
- ✅ You can also trigger manual deployments

## Rollback

If something goes wrong:
1. Go to Deployments in Vercel dashboard
2. Find the last working deployment
3. Click "..." → "Promote to Production"

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas

---

## Quick Deploy Command (Alternative)

If you have Vercel CLI installed:

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts to deploy!

---

**🎉 Once deployed, your VyaparOS app will be live and accessible to users worldwide!**

