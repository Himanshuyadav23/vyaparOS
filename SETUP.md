# VyaparOS Setup Guide

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `vyaparos` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Save

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode** (we'll add rules)
4. Choose a location (preferably close to your users)
5. Enable

### 4. Add Security Rules

1. In Firestore Database, go to **Rules** tab
2. Copy the contents of `firestore.rules` from this project
3. Paste and click **Publish**

### 5. Enable Storage

1. Go to **Storage**
2. Click **Get started**
3. Start in **production mode**
4. Use the same location as Firestore
5. Enable

### 6. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click **Web** icon (`</>`)
4. Register app with a nickname
5. Copy the Firebase configuration object

### 7. Set Environment Variables

Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firestore Collections

The following collections will be created automatically when you use the app:

- `users` - User profiles and business information
- `deadStock` - Dead stock exchange listings
- `catalog` - Product catalog items
- `creditTransactions` - Credit ledger transactions
- `suppliers` - Supplier directory
- `marketSignals` - Market intelligence signals (typically populated by system/admin)

## Storage Structure

Images will be stored in Firebase Storage with the following structure:

```
{collection}/{itemId}/{filename}
```

For example:
- `catalog/abc123/image1.jpg`
- `deadStock/xyz789/product.jpg`

## First Run

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000
4. Register a new account
5. Complete your business profile
6. Start using the features!

## Testing the Features

### Dead Stock Exchange
1. Go to Dashboard > Dead Stock
2. Click "Add Item"
3. Fill in product details
4. Save and view your listing

### Digital Catalog
1. Go to Dashboard > Catalog
2. Add products to your catalog
3. Use the share button to get a shareable link
4. Share the link with buyers

### Credit Ledger
1. Go to Dashboard > Credit Ledger
2. Add a credit transaction
3. Track pending and paid amounts
4. Mark transactions as paid when completed

### Supplier Discovery
1. Go to Dashboard > Suppliers
2. Search for suppliers
3. Add new suppliers to the network
4. Filter by category or location

### Market Intelligence
1. Go to Dashboard > Market Intelligence
2. View aggregated market signals
3. Analyze trends with charts
4. Filter by category

## Production Deployment

### Before Deploying

1. **Update Security Rules**: Review and test Firestore rules
2. **Set Production Environment Variables**: Add `.env.local` values to your hosting platform
3. **Test Authentication**: Ensure email/password auth works
4. **Test Storage**: Verify image uploads work
5. **Review Security**: Check that multi-tenant isolation works

### Deployment Platforms

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm run build
# Deploy the .next folder
```

**Other Platforms**
- Build: `npm run build`
- Start: `npm start`
- Ensure Node.js 18+ is available

## Troubleshooting

### Authentication Issues
- Verify Firebase Auth is enabled
- Check environment variables are set correctly
- Ensure email/password provider is enabled

### Firestore Errors
- Verify security rules are deployed
- Check collection names match exactly
- Ensure user is authenticated

### Storage Upload Failures
- Verify Storage is enabled
- Check storage rules allow authenticated uploads
- Verify file size limits (default: 5MB)

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Support

For issues or questions, check:
1. Firebase Console for errors
2. Browser console for client-side errors
3. Network tab for API call failures
4. Firestore rules for permission errors



