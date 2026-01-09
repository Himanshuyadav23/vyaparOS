# MongoDB Atlas Setup Guide

## Quick Setup Steps

### 1. Create MongoDB Atlas Account (if you don't have one)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create your account

### 2. Create a Cluster

1. After logging in, click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you
5. Name your cluster (e.g., "Cluster0")
6. Click "Create"

### 3. Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - Username: (choose a username, e.g., "vyaparos-user")
   - Password: (click "Autogenerate Secure Password" or create your own)
   - **IMPORTANT:** Save the password! You'll need it for the connection string
5. Set user privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 4. Whitelist Your IP Address

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
   - ⚠️ For production, use specific IPs only
4. Click **"Confirm"**

### 5. Get Your Connection String

1. Go to **Clusters** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your Connection String

Replace the placeholders in the connection string:

1. Replace `<username>` with your database username
2. Replace `<password>` with your database password (URL encode special characters if needed)
3. Add your database name after the `/`:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vyaparos?retryWrites=true&w=majority
   ```

### 7. Update .env.local

Open `.env.local` and replace the MONGODB_URI line with your actual connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/vyaparos?retryWrites=true&w=majority
```

**Important Notes:**
- Replace special characters in password with URL encoding:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - `%` becomes `%25`
  - `&` becomes `%26`
  - `/` becomes `%2F`
  - `:` becomes `%3A`
  - `?` becomes `%3F`
  - `=` becomes `%3D`

### 8. Restart Your Server

After updating `.env.local`:
1. Stop the server (Ctrl+C)
2. Run `npm run dev` again

## Example Connection String

```
mongodb+srv://vyaparos-user:MyP@ssw0rd123@cluster0.abc123.mongodb.net/vyaparos?retryWrites=true&w=majority
```

## Troubleshooting

### Error: "querySrv ENOTFOUND"
- Check that your connection string is correct
- Verify the cluster name matches your actual cluster
- Ensure you've whitelisted your IP address

### Error: "Authentication failed"
- Verify username and password are correct
- Check that password special characters are URL encoded
- Ensure the database user has proper permissions

### Error: "IP not whitelisted"
- Go to Network Access in MongoDB Atlas
- Add your current IP or use 0.0.0.0/0 for development

### Connection Timeout
- Check your internet connection
- Verify the cluster is running (not paused)
- Try a different region if issues persist

## Testing the Connection

After setting up, try logging in again. The connection should work!








