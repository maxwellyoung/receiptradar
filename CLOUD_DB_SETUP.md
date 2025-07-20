# 🔧 Cloud Database Setup Guide

## 📋 **Step 1: Get Supabase Cloud Details**

1. **Go to**: https://supabase.com/dashboard/project/cihuylmusthumxpuexrl
2. **Navigate to**: Settings → Database
3. **Copy these values**:

### **Database Connection**

- **Database URL**: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
- **API URL**: `https://[project-ref].supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 **Step 2: Set Railway Environment Variables**

### **Option A: Automated Setup**

```bash
node scripts/setup-production-env.js
```

### **Option B: Manual Setup**

```bash
cd backend

# Set environment variables
railway variables set DATABASE_URL="your_database_url_here"
railway variables set SUPABASE_URL="your_api_url_here"
railway variables set SUPABASE_ANON_KEY="your_anon_key_here"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
railway variables set NODE_ENV="production"
railway variables set SCRAPER_INTERVAL_HOURS="6"
railway variables set SCRAPER_TIMEZONE="Pacific/Auckland"

# Redeploy
railway up
```

## 📱 **Step 3: Update Frontend Environment**

Create `.env.production` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_api_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_BACKEND_URL=https://receiptradar-production.up.railway.app
```

## ✅ **Step 4: Test the Setup**

```bash
# Test backend health
curl https://receiptradar-production.up.railway.app/health

# Test scraper
curl -X POST https://receiptradar-production.up.railway.app/api/scrape

# Check scraper status
curl https://receiptradar-production.up.railway.app/api/scrape/status
```

## 🔄 **Step 5: Deploy Frontend**

```bash
# Build with production environment
eas build --platform all --profile production

# Or build for testing
eas build --platform ios --profile preview
```

## 🎯 **Expected Results**

After setup:

- ✅ Backend connects to cloud database
- ✅ Scraper saves data to cloud database
- ✅ Frontend connects to production backend
- ✅ Real-time data sync between all components

## 🛠️ **Troubleshooting**

### **Backend Won't Start**

- Check Railway logs: `railway logs`
- Verify DATABASE_URL format
- Ensure all environment variables are set

### **Scraper Fails**

- Check Python dependencies in requirements.txt
- Verify database connection
- Check Railway logs for errors

### **Frontend Can't Connect**

- Verify EXPO*PUBLIC*\* variables
- Check network connectivity
- Ensure backend is running

---

**🎉 Your ReceiptRadar app will be fully deployed to production!**
