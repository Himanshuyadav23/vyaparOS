# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for VyaparOS using Google Identity Services.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - If prompted, configure the OAuth consent screen first:
     - User Type: **External** (for testing) or **Internal** (for Google Workspace)
     - App name: `VyaparOS`
     - User support email: Your email
     - Developer contact: Your email
     - Click **Save and Continue**
     - Add scopes: `email`, `profile`, `openid`
     - Add test users (your email) if using External type
     - Click **Save and Continue**

5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `VyaparOS Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Click **Create**
   - **Copy the Client ID** (you'll need this)

## Step 2: Configure Environment Variables

Add the Google Client ID to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Important:** 
- The `NEXT_PUBLIC_` prefix makes it available in the browser
- Never commit `.env.local` to version control
- Use different client IDs for development and production

## Step 3: Update Vercel Environment Variables (for production)

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Your production Google Client ID
4. Redeploy your application

## Step 4: Test Google Sign-In

1. Start your development server: `npm run dev`
2. Go to `/auth/login` or `/auth/register`
3. You should see a "Sign in with Google" button
4. Click it and test the authentication flow

## How It Works

### Login Flow
1. User clicks "Sign in with Google" button
2. Google Identity Services popup appears
3. User selects/authenticates with Google account
4. Google returns an ID token
5. Frontend sends token to `/api/auth/google`
6. Backend verifies token with Google
7. Backend creates/finds user in MongoDB
8. Backend returns JWT token
9. User is logged in

### Sign Up Flow
1. User clicks "Sign up with Google" button
2. Same authentication flow as login
3. If user doesn't exist, account is created automatically
4. User profile is populated from Google account data

## Security Notes

- Google ID tokens are verified server-side
- Tokens are validated against Google's API
- Client ID is checked to prevent token reuse
- User passwords are not required for Google users
- JWT tokens are used for session management

## Troubleshooting

### "Google Client ID not configured"
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart the development server after adding the variable

### "Invalid token" error
- Verify the Client ID matches in both frontend and backend
- Check that authorized origins include your domain
- Ensure OAuth consent screen is configured

### Button doesn't appear
- Check browser console for errors
- Verify Google script is loading: `https://accounts.google.com/gsi/client`
- Check that Client ID is correctly set

### "Popup blocked" error
- Allow popups for your domain
- Try in incognito mode
- Check browser popup blocker settings

### Token verification fails
- Verify the Client ID in `.env.local` matches your Google Cloud Console
- Check that the token audience matches your Client ID
- Ensure Google+ API is enabled

## Production Checklist

- [ ] OAuth consent screen configured
- [ ] Production Client ID created
- [ ] Authorized origins include production domain
- [ ] Environment variable set in Vercel
- [ ] Test users added (if using External type)
- [ ] Tested on production domain
- [ ] HTTPS enabled (required for production

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)








