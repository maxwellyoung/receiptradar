# 🔧 Manual Database Fix Instructions

## Step 1: Fix Database Issues (5 minutes)

### 1.1 Go to Supabase Dashboard

1. Open [supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project: `cihuylmusthumxpuexrl`

### 1.2 Run SQL Fixes

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Fix MVP Database Issues
-- 1. Disable RLS on categories table (needed for seeding)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on stores table (needed for seeding)
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;

-- 3. Add unique constraint to stores table
ALTER TABLE stores ADD CONSTRAINT IF NOT EXISTS stores_name_location_unique UNIQUE (name, location);

-- 4. Verify the fixes
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('categories', 'stores')
ORDER BY tablename;
```

4. Click **"Run"** button
5. You should see a table showing `rowsecurity: false` for both tables

## Step 2: Create Storage Bucket (2 minutes)

### 2.1 Create Bucket

1. Click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Enter bucket name: `receipt-images`
4. Make it **public** (check the box)
5. Click **"Create bucket"**

### 2.2 Set Storage Policies

1. Click on the `receipt-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"Create a policy from template"**
5. Select **"Allow authenticated users to upload files"**
6. Click **"Review"** then **"Save policy"**
7. Repeat for **"Allow authenticated users to download files"**

## Step 3: Test the Fix (2 minutes)

### 3.1 Run Database Setup

```bash
node setup-database.js
```

You should see:

```
✅ Categories created successfully
✅ Stores created successfully
🎉 Database setup complete!
```

### 3.2 Test the App

1. Your app should already be running at http://localhost:8082
2. Sign up with a new email
3. Try scanning a receipt
4. Check if it appears in the dashboard

## 🎉 Success!

If everything works:

- ✅ Database seeding completes without errors
- ✅ You can sign up and sign in
- ✅ Camera opens and takes photos
- ✅ Receipts process and appear in dashboard
- ✅ Images upload to storage

## 🚨 If Something Doesn't Work

### Database seeding still fails:

- Check the SQL ran successfully in Supabase
- Verify RLS is disabled on categories and stores tables
- Try running the setup script again

### Images don't upload:

- Verify the `receipt-images` bucket exists
- Check it's set to public
- Verify storage policies are set up

### App crashes:

- Check browser console for errors
- Verify all environment variables are set
- Try refreshing the page

## 📞 Need Help?

If you're still having issues:

1. Check the browser console for error messages
2. Look at the Supabase logs in the dashboard
3. Try the debug screen at `/debug` in your app

---

**You're almost there! These fixes should get your MVP working. 🚀**
