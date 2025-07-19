# Backend Services Setup Guide

## Current Issues

The app is experiencing several backend service failures:

1. **OCR Service**: `http://localhost:8000` not running
2. **Storage Bucket**: `receipt-images` bucket missing in Supabase
3. **Hono API**: `http://127.0.0.1:8787` not running
4. **Image Upload**: Failing due to missing bucket

## Quick Fixes

### 1. Create Supabase Storage Bucket

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `cihuylmusthumxpuexrl`
3. Navigate to **Storage** in the sidebar
4. Click **Create a new bucket**
5. Name it: `receipt-images`
6. Set it as **Public** (for image access)
7. Click **Create bucket**

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# API URLs (use your computer's IP address for physical devices)
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:8000
EXPO_PUBLIC_HONO_API_URL=http://192.168.1.XXX:8787

# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=https://cihuylmusthumxpuexrl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start Backend Services

#### Option A: Use Existing Backend (if available)

```bash
# Start OCR service
cd backend
npm install
npm start

# Start Hono API (in another terminal)
cd backend
npm run dev
```

#### Option B: Use Fallback Mode (Current)

The app currently uses fallback data when services are unavailable:

- OCR falls back to demo receipt data
- Images are stored locally
- Receipts are saved to local database only

### 4. Test the Setup

1. **Storage Test**: Try uploading a receipt image
2. **OCR Test**: Check if OCR processing works
3. **Database Test**: Verify receipts are being saved

## Current Fallback Behavior

When backend services are unavailable, the app:

✅ **Works with demo data** - OCR returns sample receipt
✅ **Saves locally** - Receipts stored in local database  
✅ **Continues functioning** - App doesn't crash
⚠️ **No cloud sync** - Images and data stay local
⚠️ **No price intelligence** - Savings analysis disabled

## Next Steps

1. **Immediate**: Create the Supabase storage bucket
2. **Short-term**: Set up environment variables for your network
3. **Long-term**: Deploy backend services to production

## Troubleshooting

### "Bucket not found" Error

- Verify bucket name is exactly `receipt-images`
- Check bucket is set to **Public**
- Ensure your Supabase project is correct

### "OCR processing failed" Error

- Check if OCR service is running on correct port
- Verify network connectivity (use IP not localhost)
- Check service logs for specific errors

### "Failed to save receipt" Error

- Verify database connection
- Check if tables exist in Supabase
- Review backend service logs

## Development vs Production

### Development (Current)

- Uses localhost/127.0.0.1 URLs
- Fallback to demo data
- Local storage only

### Production (Recommended)

- Deploy backend services to cloud
- Use production URLs
- Full OCR and price intelligence
- Cloud storage and sync
