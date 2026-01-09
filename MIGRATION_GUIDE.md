# Migration Guide: Firebase to MERN Stack

This guide will help you migrate from Firebase/Firestore to MongoDB with Next.js API routes.

## Prerequisites

1. **MongoDB Atlas Account** (free tier available)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get your connection string

2. **Node.js 18+** installed

## Step 1: Install Dependencies

```bash
npm install mongoose bcryptjs jsonwebtoken uuid
npm install -D @types/bcryptjs @types/jsonwebtoken @types/uuid
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vyaparos?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API URL (leave empty for same-origin)
NEXT_PUBLIC_API_URL=
```

**Important:** 
- Replace `username` and `password` with your MongoDB Atlas credentials
- Generate a strong JWT_SECRET (you can use: `openssl rand -base64 32`)

## Step 3: Update Authentication

The authentication system has been migrated from Firebase Auth to JWT-based authentication.

### Changes:
- Login/Register now use `/api/auth/login` and `/api/auth/register`
- Token is stored in `localStorage` instead of Firebase session
- Auth context updated to use new API endpoints

## Step 4: Update File Uploads

File uploads are now handled through `/api/upload` endpoint. Files are stored in the `public/uploads` directory.

**For Production:** Consider using cloud storage services like:
- AWS S3
- Cloudinary
- Vercel Blob Storage

## Step 5: Database Migration

If you have existing Firebase data, you'll need to migrate it:

1. Export data from Firestore
2. Transform data to match MongoDB schema
3. Import into MongoDB

A migration script can be created if needed.

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. Deploy!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Catalog Items
- `GET /api/catalog-items` - List catalog items
- `POST /api/catalog-items` - Create catalog item (requires auth)
- `GET /api/catalog-items/[id]` - Get catalog item
- `PUT /api/catalog-items/[id]` - Update catalog item (requires auth)
- `DELETE /api/catalog-items/[id]` - Delete catalog item (requires auth)

### Dead Stock
- `GET /api/dead-stock` - List dead stock listings
- `POST /api/dead-stock` - Create listing (requires auth)
- `GET /api/dead-stock/[id]` - Get listing
- `PUT /api/dead-stock/[id]` - Update listing (requires auth)
- `DELETE /api/dead-stock/[id]` - Delete listing (requires auth)

### Ledger Transactions
- `GET /api/ledger/transactions` - List transactions (requires auth)
- `POST /api/ledger/transactions` - Create transaction (requires auth)
- `GET /api/ledger/transactions/[id]` - Get transaction (requires auth)
- `PUT /api/ledger/transactions/[id]` - Update transaction (requires auth)

### File Upload
- `POST /api/upload` - Upload file (requires auth)

## Testing

1. Start development server: `npm run dev`
2. Test registration: Create a new account
3. Test login: Login with credentials
4. Test CRUD operations for each feature

## Troubleshooting

### MongoDB Connection Issues
- Verify your connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

### Authentication Issues
- Check JWT_SECRET is set
- Verify token is being sent in Authorization header
- Check token expiration

### File Upload Issues
- Ensure `public/uploads` directory exists
- Check file size limits (currently 5MB)
- Verify authentication token

## Next Steps

1. Set up MongoDB indexes for better performance
2. Implement rate limiting
3. Add input validation
4. Set up error monitoring (e.g., Sentry)
5. Configure CORS if needed
6. Set up cloud storage for production file uploads








