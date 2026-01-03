# 🔧 Vercel Deployment Troubleshooting Guide

## Step 1: Check Build Logs

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the **failed deployment**
3. Check the **Build Logs** tab
4. Look for the specific error message

## Common Errors & Solutions

### Error 1: "Build Command Failed" or "TypeScript Errors"

**Symptoms:**
- Build fails during compilation
- TypeScript errors in logs

**Solutions:**

1. **Test build locally first:**
   ```bash
   npm run build
   ```
   Fix any errors that appear locally.

2. **Check for missing dependencies:**
   - Ensure all imports are available
   - Check `package.json` has all required packages

3. **Clear cache and rebuild:**
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

### Error 2: "Environment Variables Missing"

**Symptoms:**
- Runtime errors about missing env vars
- MongoDB connection errors
- JWT errors

**Solutions:**

1. **Go to Vercel Dashboard** → Settings → Environment Variables
2. **Add ALL required variables:**
   ```
   MONGODB_URI=your-connection-string
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   SKIP_AUTH=false
   NEXT_PUBLIC_SKIP_AUTH=false
   ```

3. **After adding variables, REDEPLOY** (they don't apply to existing deployments)

### Error 3: "Module Not Found" or "Cannot Find Module"

**Symptoms:**
- Errors about missing modules
- Import errors

**Solutions:**

1. **Check all dependencies are in package.json:**
   ```bash
   npm install
   ```

2. **Ensure devDependencies are included** (Vercel installs all dependencies)

3. **Check for case-sensitive imports** (Linux servers are case-sensitive)

### Error 4: "MongoDB Connection Failed"

**Symptoms:**
- Database connection errors
- Timeout errors

**Solutions:**

1. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` to allow all IPs

2. **Verify MONGODB_URI is correct:**
   - Check connection string in Vercel environment variables
   - Ensure password is URL-encoded if it contains special characters

3. **Check MongoDB user permissions:**
   - User should have read/write access

### Error 5: "Function Execution Timeout"

**Symptoms:**
- API routes timing out
- Long-running operations fail

**Solutions:**

1. **Check Vercel plan limits:**
   - Free tier has 10s timeout for serverless functions
   - Upgrade plan if needed

2. **Optimize database queries:**
   - Add indexes
   - Limit query results
   - Use pagination

### Error 6: "Build Output Not Found"

**Symptoms:**
- Build completes but deployment fails
- Output directory issues

**Solutions:**

1. **Check vercel.json configuration:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next"
   }
   ```

2. **Ensure Next.js is properly configured**

## Quick Fix Checklist

### Before Redeploying:

- [ ] **Test build locally**: `npm run build` succeeds
- [ ] **All environment variables set** in Vercel dashboard
- [ ] **MongoDB IP whitelist** includes `0.0.0.0/0`
- [ ] **No TypeScript errors** locally
- [ ] **All dependencies** in package.json
- [ ] **Node version** compatible (Vercel uses Node 18.x)

### Vercel Settings to Check:

1. **Framework Preset**: Should be "Next.js"
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next` (auto-detected)
4. **Install Command**: `npm install`
5. **Node Version**: 18.x (default)

## Step-by-Step Fix Process

### 1. Get the Exact Error

1. Go to Vercel Dashboard
2. Click on failed deployment
3. Copy the exact error message

### 2. Fix Locally First

```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install

# Test build
npm run build

# Fix any errors that appear
```

### 3. Commit and Push Fixes

```bash
git add .
git commit -m "Fix deployment issues"
git push origin main
```

### 4. Redeploy in Vercel

- Vercel will automatically redeploy on push
- Or manually trigger redeploy in dashboard

## Still Having Issues?

### Share These Details:

1. **Exact error message** from Vercel logs
2. **Build log snippet** showing where it fails
3. **Environment variables** you've set (without values)
4. **Local build status** (`npm run build` output)

### Common Quick Fixes:

1. **Remove vercel.json** if it's causing issues (Next.js auto-detects)
2. **Set Node version** in Vercel: Settings → Node.js Version → 18.x
3. **Check file paths** - ensure no Windows-specific paths
4. **Verify all API routes** export correct HTTP methods

## Emergency Rollback

If deployment is completely broken:

1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

---

**Need more help?** Share the exact error message from Vercel logs and I can help debug!

