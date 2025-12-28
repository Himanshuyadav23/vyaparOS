# Google Authentication Setup Guide

## Overview
VyaparOS now supports Google Sign-In for easier authentication. Users can sign in or sign up using their Google account.

## Firebase Configuration

### Step 1: Enable Google Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`vyaparos-a8fbe`)
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Toggle **Enable** to ON
6. Enter your **Project support email** (your email)
7. Click **Save**

### Step 2: Configure OAuth Consent Screen (if needed)

If you haven't set up OAuth consent screen:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **External** user type (for testing)
5. Fill in required information:
   - App name: `VyaparOS`
   - User support email: Your email
   - Developer contact: Your email
6. Add scopes (if needed):
   - `email`
   - `profile`
   - `openid`
7. Add test users (your email addresses for testing)
8. Click **Save and Continue**

### Step 3: Add Authorized Domains

1. In Firebase Console → Authentication → Settings
2. Scroll to **Authorized domains**
3. Add your domain (e.g., `localhost` for development, your production domain)
4. Firebase automatically includes:
   - `localhost`
   - Your Firebase project domain
   - `googleapis.com`

## How It Works

### For New Users (Sign Up)
1. User clicks "Sign up with Google"
2. Google popup opens for authentication
3. User selects/enters Google account
4. System creates Firebase Auth user
5. System automatically creates user document in Firestore with:
   - Email from Google account
   - Display name from Google account
   - Default business type (wholesaler)
   - Business name set to display name

### For Existing Users (Sign In)
1. User clicks "Sign in with Google"
2. Google popup opens
3. User authenticates
4. System checks if user document exists in Firestore
5. If exists, user is logged in
6. If not, user document is created automatically

## Features

- **One-click authentication**: No need to remember passwords
- **Automatic profile creation**: User data is automatically synced from Google
- **Secure**: Uses Firebase's secure authentication
- **Mobile-friendly**: Works on all devices

## User Experience

### Login Page (`/auth/login`)
- Email/Password form
- "Sign in with Google" button with Google icon
- Divider: "Or continue with"

### Register Page (`/auth/register`)
- Registration form
- "Sign up with Google" button with Google icon
- Divider: "Or continue with"

## Code Implementation

### Auth Function (`lib/firebase/auth.ts`)
```typescript
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return await signInWithPopup(auth, provider);
};
```

### User Document Creation
When a user signs in with Google for the first time, a user document is automatically created in Firestore with:
- Email
- Display name
- Business name (from display name)
- Business type (default: wholesaler)
- Created/Updated timestamps

## Testing

1. **Development**: Works on `localhost` automatically
2. **Production**: Ensure your domain is added to authorized domains
3. **Test Flow**:
   - Click "Sign in with Google"
   - Select Google account
   - Verify user document is created in Firestore
   - Verify user can access dashboard

## Troubleshooting

### "Popup blocked" error
- Ensure popup blockers are disabled
- Check browser settings
- Try in incognito mode

### "auth/popup-closed-by-user"
- User closed the popup window
- Show friendly error message
- Allow user to try again

### "auth/unauthorized-domain"
- Domain not in authorized domains list
- Add domain to Firebase Console → Authentication → Settings → Authorized domains

### User document not created
- Check Firestore security rules
- Verify `users` collection write permissions
- Check browser console for errors

## Security Notes

- Google OAuth tokens are handled securely by Firebase
- No passwords stored for Google users
- User data synced from Google profile
- Firestore security rules still apply

## Next Steps

After enabling Google Sign-In:
1. Test the flow on login page
2. Test the flow on register page
3. Verify user documents are created correctly
4. Test on mobile devices
5. Update any documentation or help text



