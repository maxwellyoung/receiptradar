# Troubleshooting Guide - ReceiptRadar

This guide helps resolve common issues when running ReceiptRadar with real data.

## 🔧 Common Issues & Solutions

### 1. Authentication Errors

**Problem**: `Invalid login credentials` or authentication failures

**Solutions**:

- Ensure your Supabase project is properly configured
- Check that your environment variables are set correctly:
  ```bash
  EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```
- Run the database setup script: `node setup-database.js`
- Create a test user through the Supabase dashboard

### 2. Theme Provider Errors

**Problem**: `useThemeContext must be used within a ThemeProvider`

**Solution**: ✅ **Fixed** - The ThemeProvider is now properly configured in `app/_layout.tsx`

### 3. Route Navigation Errors

**Problem**: `No route named "camera" exists` or similar warnings

**Solutions**: ✅ **Fixed** - Routes are now properly configured:

- Camera modal: `/modals/camera`
- Receipt processing: `/receipt/processing`
- All tab routes are properly defined

### 4. Database Connection Issues

**Problem**: Network request failures or database errors

**Solutions**:

- Ensure your Supabase project is active
- Check Row Level Security (RLS) policies
- Verify database schema is up to date
- Run the migration script in Supabase SQL editor

### 5. OCR Service Errors

**Problem**: `Receipt parsing failed: Network request failed`

**Solutions**:

- Ensure the OCR service is running: `cd ocr && python main.py`
- Check OCR service URL configuration
- Verify the service is accessible at the expected endpoint

## 🚀 Quick Setup Guide

### 1. Database Setup

```bash
# Run the database setup script
node setup-database.js

# Or manually run SQL in Supabase dashboard:
# Copy contents of database/migrate.sql
```

### 2. Environment Configuration

Create `.env.local` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Services

```bash
# Start the app
npx expo start

# Start OCR service (optional)
cd ocr
python main.py
```

## 🔍 Debug Mode

Enable debug logging by adding to your environment:

```bash
EXPO_DEBUG=true
```

## 📱 Testing with Sample Data

1. **Use the setup script** to create test data
2. **Sign in** with the test user or create a new account
3. **Scan receipts** to see real analytics
4. **Check the dashboard** for real spending data

## 🐛 Known Issues

### 1. Apple Auth Service

- **Issue**: Apple Auth service doesn't exist yet
- **Status**: ✅ **Fixed** - Removed from AuthContext
- **Workaround**: Use email/password authentication

### 2. setState During Render

- **Issue**: React warnings about setState during render
- **Status**: ✅ **Fixed** - Moved navigation to useEffect
- **Workaround**: None needed

### 3. Missing Routes

- **Issue**: Navigation warnings for non-existent routes
- **Status**: ✅ **Fixed** - All routes properly configured
- **Workaround**: None needed

## 📞 Getting Help

If you encounter issues not covered here:

1. **Check the logs** in your terminal for specific error messages
2. **Verify Supabase configuration** in your dashboard
3. **Test with the setup script** to ensure database is working
4. **Check network connectivity** for OCR service

## 🔄 Reset Everything

If you need to start fresh:

```bash
# Clear Expo cache
npx expo start -c

# Reset database (in Supabase dashboard)
# Drop all tables and re-run migration

# Re-run setup
node setup-database.js
```

## ✅ Success Checklist

- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Database schema migrated
- [ ] Categories and stores seeded
- [ ] Test user created
- [ ] App starts without errors
- [ ] Authentication works
- [ ] Receipt scanning works
- [ ] Real data appears in dashboard

## 🎯 Expected Behavior

After successful setup:

- App loads without errors
- Authentication screen appears
- Sign up/in works
- Dashboard shows real data (or empty state)
- Receipt scanning works
- Analytics update with real data
