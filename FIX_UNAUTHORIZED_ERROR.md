# 🔐 Fix "Unauthorized" Error

## The Problem

You're getting "Unauthorized" when trying to create dead stock because authentication is required, but you're not logged in.

## Solution: Enable SKIP_AUTH for Development

### Step 1: Add SKIP_AUTH to `.env.local`

Open your `.env.local` file and add these lines:

```env
SKIP_AUTH=true
NEXT_PUBLIC_SKIP_AUTH=true
```

Your `.env.local` should now look like:

```env
MONGODB_URI=mongodb+srv://shortshimanshuyadav_db_user:YOUR_PASSWORD@cluster0.pulzusv.mongodb.net/vyaparos?retryWrites=true&w=majority&appName=Cluster0
SKIP_AUTH=true
NEXT_PUBLIC_SKIP_AUTH=true
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Step 2: Restart Your Server

**IMPORTANT:** After updating `.env.local`, you MUST restart your dev server:

1. **Stop the server** (Press `Ctrl+C` in the terminal)
2. **Start it again**: `npm run dev`

### Step 3: Try Again

After restarting, try creating a dead stock listing again. It should work now! 🎉

## Alternative: Use Real Authentication

If you prefer to use real authentication instead of skipping it:

1. **Remove or set to false**:
   ```env
   SKIP_AUTH=false
   NEXT_PUBLIC_SKIP_AUTH=false
   ```

2. **Register/Login**:
   - Go to `/auth/register` to create an account
   - Or go to `/auth/login` if you already have one

3. **Then create items** - they'll be associated with your real account

## Why This Happens

- The API routes require authentication by default
- `SKIP_AUTH=true` tells the middleware to allow requests through in development mode
- Without it, you need a valid JWT token (which requires logging in)

## After Fixing

Once you've:
1. ✅ Added `SKIP_AUTH=true` to `.env.local`
2. ✅ Restarted the server
3. ✅ Tried creating dead stock again

Everything should work! If you still get errors, check:
- Browser console for error messages
- Terminal/server logs
- Make sure the server was restarted after changing `.env.local`








