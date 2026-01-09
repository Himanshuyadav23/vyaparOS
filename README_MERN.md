# VyaparOS - MERN Stack Version

This is the MongoDB + Express (Next.js API Routes) + React + Next.js version of VyaparOS, deployed on Vercel.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (Express-like)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel
- **Storage**: Local file system (can be upgraded to cloud storage)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vyaparos?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Migrate to MERN stack"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. Deploy!

### 3. Configure MongoDB Atlas for Production

- Update IP whitelist to allow Vercel's IPs (or use 0.0.0.0/0)
- Ensure your connection string is correct

## Project Structure

```
vyaparOS/
├── app/
│   ├── api/              # Next.js API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── catalog-items/ # Catalog CRUD
│   │   ├── dead-stock/   # Dead stock CRUD
│   │   ├── ledger/       # Ledger transactions
│   │   └── upload/       # File upload
│   ├── auth/             # Auth pages
│   ├── dashboard/        # Dashboard pages
│   └── catalog/          # Public catalog pages
├── lib/
│   ├── mongodb/          # MongoDB connection & models
│   ├── auth/             # JWT & password utilities
│   ├── middleware/       # Auth middleware
│   └── services/         # API client services
├── context/              # React contexts
└── components/           # React components
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Catalog Items
- `GET /api/catalog-items` - List items
- `POST /api/catalog-items` - Create item
- `GET /api/catalog-items/[id]` - Get item
- `PUT /api/catalog-items/[id]` - Update item
- `DELETE /api/catalog-items/[id]` - Delete item

### Dead Stock
- `GET /api/dead-stock` - List listings
- `POST /api/dead-stock` - Create listing
- `GET /api/dead-stock/[id]` - Get listing
- `PUT /api/dead-stock/[id]` - Update listing
- `DELETE /api/dead-stock/[id]` - Delete listing

### Ledger
- `GET /api/ledger/transactions` - List transactions
- `POST /api/ledger/transactions` - Create transaction
- `GET /api/ledger/transactions/[id]` - Get transaction
- `PUT /api/ledger/transactions/[id]` - Update transaction

### Upload
- `POST /api/upload` - Upload file

## Features

✅ User authentication (JWT)
✅ Catalog management
✅ Dead stock exchange
✅ Credit ledger
✅ File uploads
✅ MongoDB database
✅ Vercel deployment ready

## Production Considerations

1. **File Storage**: Currently using local storage. For production, consider:
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage

2. **Security**:
   - Use strong JWT_SECRET
   - Enable HTTPS
   - Implement rate limiting
   - Add input validation
   - Set up CORS properly

3. **Performance**:
   - Add MongoDB indexes
   - Implement caching
   - Optimize images
   - Use CDN for static assets

4. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor API performance
   - Track database queries

## Troubleshooting

### MongoDB Connection Issues
- Check connection string format
- Verify IP whitelist
- Check database user permissions

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure token is sent in Authorization header

### File Upload Issues
- Check `public/uploads` directory exists
- Verify file size limits
- Check authentication

## Support

For issues or questions, please refer to the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) or open an issue.








