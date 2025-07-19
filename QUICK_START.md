# 🚀 Quick Start Guide - ReceiptRadar MVP

This guide will get your ReceiptRadar MVP up and running in minutes.

## ✅ Prerequisites

- Node.js 18+ installed
- Expo CLI installed (`npm install -g @expo/cli`)
- Supabase account (free tier works)
- Python 3.11+ (optional, for OCR service)

## 🏗️ Setup Steps

### 1. Database Setup

First, set up your Supabase database:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Copy your credentials** from Settings > API
3. **Create `.env.local`** in your project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:8000
```

4. **Run the database schema**:

   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Click "Run"

5. **Seed the database**:

```bash
npm install
node setup-database.js
```

### 2. Start the App

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### 3. Create Storage Bucket (Important!)

In your Supabase dashboard:

1. Go to **Storage**
2. Create a new bucket called `receipt-images`
3. Make it **public** (for now, we'll secure it later)
4. Set up RLS policies if needed

### 4. Test the App

1. **Sign up** for a new account in the app
2. **Scan a receipt** using the camera
3. **View your dashboard** with real data
4. **Check receipt details** by tapping on a receipt

## 🔧 Optional: OCR Service

For real OCR processing (otherwise uses fallback data):

```bash
# In a separate terminal
cd ocr
pip install -r requirements.txt
python main.py
```

The OCR service will run on `http://localhost:8000`

## 🎯 What Works Now

✅ **Authentication** - Sign up, sign in, sign out  
✅ **Receipt Scanning** - Camera capture with processing  
✅ **Image Storage** - Photos saved to Supabase Storage  
✅ **Real Data** - Receipts stored in database  
✅ **Dashboard** - Real spending analytics  
✅ **Receipt Details** - Full receipt view with items  
✅ **Search & Filter** - Find receipts by store/item  
✅ **OCR Integration** - Real or fallback receipt parsing

## 🐛 Troubleshooting

### "Database connection failed"

- Check your `.env.local` file has correct Supabase credentials
- Ensure your Supabase project is active
- Run the database schema migration

### "Image upload failed"

- Create the `receipt-images` storage bucket in Supabase
- Make sure the bucket is public or has proper RLS policies

### "OCR service unavailable"

- This is normal! The app uses fallback data when OCR service isn't running
- Start the OCR service with `cd ocr && python main.py` for real processing

### "No receipts showing"

- Make sure you're signed in
- Try scanning a receipt
- Check the database has the correct schema

## 📱 Testing Flow

1. **Sign up** with email/password
2. **Tap the + button** to scan a receipt
3. **Take a photo** of any receipt
4. **Watch the processing** animation
5. **See the results** and tap "Dash away"
6. **View your dashboard** with real data
7. **Tap a receipt** to see full details

## 🚀 Next Steps

Once your MVP is working:

- [ ] Add more stores to the database
- [ ] Improve OCR accuracy with real service
- [ ] Add price comparison features
- [ ] Implement savings notifications
- [ ] Add export functionality
- [ ] Set up proper RLS policies

## 💡 Tips

- **Use real receipts** for best results
- **The app works offline** for basic functionality
- **OCR service is optional** - fallback data works for testing
- **Check Supabase logs** if something isn't working

---

🎉 **You now have a working grocery receipt tracking MVP!**

The app can scan receipts, store them with real data, show spending analytics, and provide a complete receipt management experience.
