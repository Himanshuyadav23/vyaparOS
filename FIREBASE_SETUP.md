# Firebase Setup Guide for VyaparOS

Follow these steps to set up Firebase for your VyaparOS project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `vyaparos` (or your preferred name)
4. Click **Continue**
5. (Optional) Enable Google Analytics - you can skip this for now
6. Click **Create project**
7. Wait for project creation (30-60 seconds)
8. Click **Continue**

## Step 2: Register Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) or **"Add app"** > **Web**
2. Register app nickname: `vyaparos-web` (or any name)
3. **DO NOT** check "Also set up Firebase Hosting" (we're using Next.js)
4. Click **Register app**
5. You'll see your Firebase configuration - **COPY THESE VALUES** (you'll need them in Step 5)

The config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 3: Enable Authentication

1. In the left sidebar, click **Authentication** (or **Build** > **Authentication**)
2. Click **Get started**
3. Click on **Email/Password** provider
4. **Enable** the first toggle (Email/Password)
5. Click **Save**

## Step 4: Create Firestore Database

1. In the left sidebar, click **Firestore Database** (or **Build** > **Firestore Database**)
2. Click **Create database**
3. Select **Start in production mode** (we'll add security rules)
4. Click **Next**
5. Choose a **location** (select closest to your users, e.g., `us-central1` for US, `asia-south1` for India)
6. Click **Enable**
7. Wait for database creation (30-60 seconds)

## Step 5: Add Security Rules

1. In Firestore Database, click the **Rules** tab
2. Open the `firestore.rules` file from this project
3. Copy **ALL** the contents
4. Paste into the Firebase Rules editor
5. Click **Publish**

## Step 6: Enable Storage

1. In the left sidebar, click **Storage** (or **Build** > **Storage**)
2. Click **Get started**
3. Select **Start in production mode**
4. Click **Next**
5. Use the **same location** as your Firestore database
6. Click **Done**

## Step 7: Configure Environment Variables

1. In your project root, create a file named `.env.local`
2. Copy the template from `.env.local.template`
3. Fill in your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (from Step 2)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important:** 
- Replace all placeholder values with your actual Firebase config values
- The `.env.local` file is already in `.gitignore`, so it won't be committed

## Step 8: Install Dependencies (if not done)

```bash
npm install
```

## Step 9: Test Your Setup

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. Try to register a new account
4. If registration works, Firebase is set up correctly!

## Quick Reference: Where to Find Config Values

If you need to find your config values again:

1. Go to Firebase Console
2. Click the **gear icon** (⚙️) next to "Project Overview"
3. Click **Project settings**
4. Scroll down to **"Your apps"** section
5. Click on your web app
6. You'll see the config values under **"SDK setup and configuration"**

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that all environment variables are set in `.env.local`
- Make sure variable names start with `NEXT_PUBLIC_`
- Restart your dev server after changing `.env.local`

### "Missing or insufficient permissions" (Firestore)
- Make sure you've deployed the security rules (Step 5)
- Check that rules are published in Firebase Console

### "Storage permission denied"
- Verify Storage is enabled (Step 6)
- Check that you're authenticated before uploading

### Can't find Authentication/Storage in sidebar
- Make sure you're in the correct Firebase project
- Some features may be under "Build" menu

## Next Steps

Once Firebase is set up:
1. ✅ Test user registration
2. ✅ Test creating a dead stock item
3. ✅ Test uploading an image
4. ✅ Verify data appears in Firestore Console

You're all set! 🎉

