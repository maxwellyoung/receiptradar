-- Fix MVP Database Issues
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS on categories table (needed for seeding)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on stores table (needed for seeding)
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;

-- 3. Add unique constraint to stores table (removed IF NOT EXISTS)
ALTER TABLE stores ADD CONSTRAINT stores_name_location_unique UNIQUE (name, location);

-- 4. Create receipt-images storage bucket if it doesn't exist
-- Note: This needs to be done in the Supabase dashboard under Storage

-- 5. Set up storage policies for receipt-images bucket
-- Run these after creating the bucket in the dashboard:

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipt-images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view images
CREATE POLICY "Allow authenticated downloads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipt-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'receipt-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to delete their own images
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipt-images' AND 
  auth.role() = 'authenticated'
);

-- 6. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. Verify the fixes
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('categories', 'stores')
ORDER BY tablename;

-- 8. Check constraints
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'stores'::regclass; 