# 🔐 Update MongoDB Password in .env.local

## ⚠️ Important: Replace the Password Placeholder

Your `.env.local` file now has your MongoDB connection string, but you need to **replace `<db_password>` with your actual MongoDB password**.

## Steps:

1. **Open `.env.local`** in your editor

2. **Find this line:**
   ```
   MONGODB_URI=mongodb+srv://shortshimanshuyadav_db_user:<db_password>@cluster0.pulzusv.mongodb.net/vyaparos?retryWrites=true&w=majority&appName=Cluster0
   ```

3. **Replace `<db_password>`** with your actual MongoDB Atlas password

   **Example:**
   ```
   MONGODB_URI=mongodb+srv://shortshimanshuyadav_db_user:MyActualPassword123@cluster0.pulzusv.mongodb.net/vyaparos?retryWrites=true&w=majority&appName=Cluster0
   ```

## ⚠️ Special Characters in Password

If your password contains special characters, you need to **URL encode** them:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `/` → `%2F`
- `:` → `%3A`
- `?` → `%3F`
- `=` → `%3D`

**Example:**
If your password is `MyP@ss#123`, it becomes `MyP%40ss%23123`

## After Updating:

1. **Save the file**
2. **Restart your dev server** (Ctrl+C, then `npm run dev`)
3. **Try creating a dead stock listing again**

## Where to Find Your Password?

If you forgot your MongoDB password:

1. Go to https://www.mongodb.com/cloud/atlas
2. Login to your account
3. Go to **Database Access** (left sidebar)
4. Find your user `shortshimanshuyadav_db_user`
5. Click **"Edit"** or **"Reset Password"**
6. Set a new password and save it

## Security Note:

- Never commit `.env.local` to git
- Keep your password secure
- Use a strong password

Once you've updated the password, everything should work! 🎉








