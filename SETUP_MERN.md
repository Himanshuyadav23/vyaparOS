# VyaparOS MERN Stack Setup Guide

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- uuid (unique ID generation)

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier M0)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Save the username and password
5. Whitelist IP addresses:
   - Go to Network Access
   - Add IP Address
   - For development: Add `0.0.0.0/0` (allows all IPs)
   - For production: Add specific IPs
6. Get connection string:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `vyaparos`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vyaparos?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Configuration (leave empty for same-origin)
NEXT_PUBLIC_API_URL=

# Environment
NODE_ENV=development
```

**Important Security Notes:**
- Generate a strong JWT_SECRET (use: `openssl rand -base64 32`)
- Never commit `.env.local` to version control
- Use different secrets for development and production

### 4. Create Upload Directory

```bash
mkdir -p public/uploads
```

Or on Windows:
```powershell
New-Item -ItemType Directory -Path "public\uploads" -Force
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Test the Setup

1. **Register a new user:**
   - Go to `/auth/register`
   - Fill in the form
   - Submit

2. **Login:**
   - Go to `/auth/login`
   - Use your credentials

3. **Access Dashboard:**
   - After login, you should be redirected to dashboard
   - Try creating a catalog item or dead stock listing

## Deployment to Vercel

### 1. Prepare for Deployment

1. Push your code to GitHub
2. Ensure `.env.local` is in `.gitignore`
3. Test locally that everything works

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret (generate a new one for production)
- `JWT_EXPIRES_IN` - `7d`
- `NODE_ENV` - `production`
- `NEXT_PUBLIC_API_URL` - Leave empty

### 4. Update MongoDB Atlas for Production

1. Go to MongoDB Atlas → Network Access
2. Add Vercel's IP ranges or use `0.0.0.0/0` (less secure but easier)
3. Ensure your database user has proper permissions

### 5. Deploy

Click "Deploy" and wait for the build to complete.

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError"**
- Check your connection string
- Verify IP whitelist includes your IP
- Check database user credentials
- Ensure cluster is running

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check database user exists and has correct permissions

### Authentication Issues

**Error: "Unauthorized"**
- Check JWT_SECRET is set
- Verify token is being sent in requests
- Check token expiration

**Error: "Invalid token"**
- Token may be expired
- JWT_SECRET may have changed
- Try logging out and logging back in

### File Upload Issues

**Error: "Upload failed"**
- Ensure `public/uploads` directory exists
- Check file size (max 5MB)
- Verify authentication token
- Check write permissions

### Build Errors

**Error: "Cannot find module"**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check all dependencies are in `package.json`

## Next Steps

1. **Set up MongoDB indexes** for better performance
2. **Implement rate limiting** to prevent abuse
3. **Add input validation** on API routes
4. **Set up error monitoring** (e.g., Sentry)
5. **Configure cloud storage** for file uploads (AWS S3, Cloudinary)
6. **Set up CI/CD** pipeline
7. **Add unit and integration tests**

## Support

For more information, see:
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed migration steps
- [README_MERN.md](./README_MERN.md) - Project overview
- [DEPENDENCIES.md](./DEPENDENCIES.md) - Dependency information








