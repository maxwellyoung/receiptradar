# Supabase Setup for ReceiptRadar

This guide will help you set up Supabase for your ReceiptRadar app.

## 1. Database Setup

### Run the SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script

This will create:

- Users table (linked to Supabase Auth)
- Categories table (with default categories)
- Stores table
- Receipts table
- Items table
- Row Level Security (RLS) policies
- Triggers for automatic timestamps

## 2. Storage Setup

### Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `receipt-images`
3. Set the bucket to private
4. Configure the following RLS policy for the bucket:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Users can upload receipt images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipt-images' AND
  auth.role() = 'authenticated'
);

-- Allow users to view their own images
CREATE POLICY "Users can view own receipt images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipt-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own receipt images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipt-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Environment Configuration

The Supabase configuration is already set up in your app with the provided credentials:

- **Project URL**: `https://cihuylmusthumxpuexrl.supabase.co`
- **Anon Key**: Already configured in `src/constants/supabase.ts`
- **Service Role Key**: Available for backend operations

## 4. Authentication

The app includes:

- Email/password authentication
- Automatic session management
- Row Level Security (RLS) for data protection
- Custom hooks for auth state management

## 5. Available Services

### Auth Service (`src/services/supabase.ts`)

- `signUp(email, password)`
- `signIn(email, password)`
- `signOut()`
- `getCurrentUser()`
- `getCurrentSession()`
- `onAuthStateChange(callback)`

### Database Service

- `createReceipt(data)`
- `getReceipts(userId, limit)`
- `getReceiptById(id)`
- `updateReceipt(id, updates)`
- `deleteReceipt(id)`
- `getCategories()`
- `getStores()`
- `createStore(data)`
- Analytics functions for spending data

### Storage Service

- `uploadReceiptImage(file, fileName, userId)`
- `getReceiptImageUrl(filePath)`
- `deleteReceiptImage(filePath)`

## 6. Custom Hooks

### useAuth Hook (`src/hooks/useAuth.ts`)

Provides authentication state and methods:

```typescript
const { user, loading, error, signIn, signUp, signOut, isAuthenticated } =
  useAuth();
```

### useReceipts Hook (`src/hooks/useReceipts.ts`)

Provides receipt management:

```typescript
const {
  receipts,
  loading,
  error,
  createReceipt,
  updateReceipt,
  deleteReceipt,
} = useReceipts(userId);
```

## 7. TypeScript Types

All database types are defined in `src/types/database.ts`:

- `Receipt`, `ReceiptInsert`, `ReceiptUpdate`
- `User`, `UserInsert`, `UserUpdate`
- `Category`, `CategoryInsert`, `CategoryUpdate`
- `Store`, `StoreInsert`, `StoreUpdate`
- `Item`, `ItemInsert`, `ItemUpdate`

## 8. Testing the Setup

1. Run the app: `npm start`
2. Navigate to the AuthScreen component
3. Try creating a new account
4. Sign in with the created account
5. Verify that the user is created in the Supabase dashboard

## 9. Security Features

- Row Level Security (RLS) ensures users can only access their own data
- Automatic user profile creation on signup
- Secure image storage with user-specific folders
- JWT-based authentication with automatic token refresh

## 10. Next Steps

1. Integrate the AuthScreen component into your app navigation
2. Use the `useAuth` hook to protect routes
3. Use the `useReceipts` hook to manage receipt data
4. Implement image upload functionality using the storage service
5. Add analytics and reporting features using the database queries

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure all tables have RLS enabled and proper policies
2. **Storage Permission Errors**: Verify the storage bucket policies are correctly set
3. **Authentication Errors**: Check that the anon key is correct and auth is enabled
4. **Type Errors**: Ensure all TypeScript types match your actual database schema

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Review the generated types in `src/types/database.ts`
- Test queries in the Supabase SQL Editor
