# Demo Mode Setup Guide

## Overview
VyaparOS includes a demo mode with pre-loaded sample data for judges and evaluators to explore all features without creating an account.

## Demo Account Credentials

**Email:** `demo@vyaparos.com`  
**Password:** `demo123456`

## Setting Up Demo Account in Firebase

### Step 1: Create Demo User in Firebase Console

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter:
   - Email: `demo@vyaparos.com`
   - Password: `demo123456`
4. Click "Add user"

### Step 2: Create Demo User Document in Firestore

1. Go to Firestore Database
2. Navigate to `users` collection
3. Create a new document with ID: `demo_user_12345` (or use the UID from Authentication)
4. Add the following fields:

```json
{
  "uid": "demo_user_12345",
  "email": "demo@vyaparos.com",
  "businessName": "Demo Wholesaler",
  "businessType": "wholesaler",
  "role": "wholesaler",
  "verified": true,
  "createdAt": [timestamp],
  "updatedAt": [timestamp]
}
```

### Step 3: Load Sample Data

1. Navigate to `/demo` page
2. Click "Load Sample Data" button
3. This will populate:
   - 3 Dead Stock Listings
   - 3 Catalog Items
   - 3 Ledger Transactions
   - 3 Shops/Suppliers

## Demo Features

### What's Included

1. **Dead Stock Exchange**
   - 3 sample listings (Cotton, Silk, Denim)
   - Various discount percentages
   - Different locations

2. **Digital Catalog**
   - 3 catalog items with specifications
   - View counts and inquiry data
   - Active listings

3. **Credit Ledger**
   - 3 transactions (pending, paid, overdue)
   - Different amounts and statuses
   - Payment history

4. **Supplier Discovery**
   - 3 verified shops
   - Different categories and specialties
   - Contact information

5. **Market Intelligence**
   - Can compute stats from demo data
   - Visualizations and trends

## Accessing Demo Mode

### Option 1: From Landing Page
1. Visit the homepage (`/`)
2. Click "Enter Demo Mode" button
3. This takes you to `/demo` page

### Option 2: Direct Access
1. Navigate to `/demo`
2. Click "Load Sample Data" to populate data
3. Click "Login to Demo" to access the platform

### Option 3: Direct Login
1. Go to `/auth/login`
2. Use demo credentials:
   - Email: `demo@vyaparos.com`
   - Password: `demo123456`

## Demo Data Details

### Dead Stock Listings
- Cotton Fabric - White (Mumbai)
- Silk Saree Material (Surat)
- Denim Fabric - Blue (Ahmedabad)

### Catalog Items
- Premium Cotton Shirt Fabric
- Silk Saree Fabric
- Polyester Blend Fabric

### Ledger Transactions
- ₹50,000 - Pending (due in 30 days)
- ₹35,000 - Paid (paid 3 days late)
- ₹25,000 - Overdue (10 days past due)

### Shops
- Premium Textiles Wholesale (Mumbai)
- Silk Paradise Wholesale (Surat)
- Denim Experts (Ahmedabad)

## Notes for Judges

- All demo data is read-only for safety
- You can explore all modules and features
- Market Intelligence can compute stats from demo data
- Sample data represents realistic wholesale scenarios
- All features are fully functional in demo mode

## Troubleshooting

### Demo Login Fails
- Ensure demo user is created in Firebase Authentication
- Check that user document exists in Firestore `users` collection
- Verify credentials match exactly

### Sample Data Not Loading
- Check browser console for errors
- Ensure Firestore security rules allow writes
- Verify API route `/api/demo/seed` is accessible

### Data Not Showing
- Refresh the page after loading sample data
- Check Firestore console to verify data was created
- Ensure you're logged in with demo account

## Security Note

Demo mode uses a separate demo account. In production, you may want to:
- Restrict demo account permissions
- Add rate limiting to seed endpoint
- Implement demo data cleanup after session



