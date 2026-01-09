# 🔧 Fix MongoDB Connection Error

## Error: `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net`

This error means your MongoDB connection string is **invalid** or **incomplete**. The connection string likely contains placeholder values instead of your actual MongoDB Atlas cluster details.

## Quick Fix Steps

### 1. Get Your Real MongoDB Atlas Connection String

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Login** to your account
3. **Click "Connect"** on your cluster
4. **Choose "Connect your application"**
5. **Select "Node.js"** and version **"5.5 or later"**
6. **Copy the connection string** - it should look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Update Your Connection String

**Replace placeholders:**
- Replace `<username>` with your MongoDB username
- Replace `<password>` with your MongoDB password (URL encode special characters!)
- Add your database name: Replace `/?` with `/vyaparos?`

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/vyaparos?retryWrites=true&w=majority
```

### 3. Update `.env.local`

Open `.env.local` and update the `MONGODB_URI` line:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/vyaparos?retryWrites=true&w=majority
```

**⚠️ Important:**
- Replace `your-username` with your actual MongoDB username
- Replace `your-password` with your actual password
- Replace `cluster0.xxxxx` with your actual cluster name
- If your password has special characters, URL encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `/` → `%2F`
  - `:` → `%3A`
  - `?` → `%3F`
  - `=` → `%3D`

### 4. Verify MongoDB Atlas Settings

Make sure:
- ✅ Your cluster is **running** (not paused)
- ✅ Your **IP address is whitelisted** (Network Access → Add IP Address → Use `0.0.0.0/0` for development)
- ✅ Your **database user exists** and has proper permissions
- ✅ Your **password is correct**

### 5. Restart Your Server

After updating `.env.local`:
1. **Stop the server** (Ctrl+C in terminal)
2. **Start it again**: `npm run dev`

## Example Connection String

```
mongodb+srv://vyaparos-user:MyP@ssw0rd123@cluster0.abc123.mongodb.net/vyaparos?retryWrites=true&w=majority
```

## Still Having Issues?

1. **Check your `.env.local` file** - Make sure there are no extra spaces or quotes
2. **Verify the cluster name** - It should match exactly what's in MongoDB Atlas
3. **Test the connection string** - Try connecting with MongoDB Compass or another tool
4. **Check MongoDB Atlas dashboard** - Ensure your cluster is active and not paused
5. **Check your internet connection** - MongoDB Atlas requires internet access

## Need to Create a MongoDB Atlas Account?

If you don't have MongoDB Atlas set up yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a **free account**
3. Create a **free cluster** (M0 tier)
4. Follow the setup steps in `MONGODB_SETUP.md`

## After Fixing

Once you've updated the connection string and restarted the server, try creating a dead stock listing again. It should work! 🎉








