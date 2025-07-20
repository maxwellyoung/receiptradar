# 🚀 ReceiptRadar Deployment Guide

## Overview

This guide will help you deploy ReceiptRadar to production with real NZ supermarket data.

## 🎯 What We're Deploying

### Frontend (React Native App)

- **Platform**: Expo/EAS
- **Features**: Real-time price data, receipt scanning, analytics
- **Data**: Live Countdown prices from your scraper

### Backend (Price Scraper)

- **Platform**: Railway
- **Features**: Automated scraping every 6 hours, API endpoints
- **Data**: Countdown, New World, Pak'nSave prices

### Database

- **Platform**: Supabase Cloud
- **Features**: Real-time price history, user data, analytics

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Run the automated deployment script
./scripts/deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Deploy Backend to Railway

```bash
cd backend
railway login
railway init
railway up
```

#### Step 2: Deploy Frontend to EAS

```bash
eas login
eas build --platform all
eas submit --platform ios
eas submit --platform android
```

## 🔧 Environment Setup

### Backend Environment Variables (Railway)

```env
DATABASE_URL=your_supabase_connection_string
PORT=3000
NODE_ENV=production
SCRAPER_INTERVAL_HOURS=6
SCRAPER_TIMEZONE=Pacific/Auckland
```

### Frontend Environment Variables (EAS)

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_BACKEND_URL=your_railway_backend_url
```

## 📊 Monitoring & Maintenance

### Backend Health Checks

- **Health Endpoint**: `https://your-backend.railway.app/health`
- **Scraper Status**: `https://your-backend.railway.app/api/scrape/status`
- **Manual Scrape**: `POST https://your-backend.railway.app/api/scrape`

### Logs & Monitoring

- **Railway Dashboard**: Monitor backend logs and performance
- **EAS Dashboard**: Monitor app builds and submissions
- **Supabase Dashboard**: Monitor database performance

## 🔄 Data Refresh

### Automatic (Every 6 Hours)

The scraper runs automatically every 6 hours via cron job.

### Manual Refresh

```bash
# Trigger manual scrape
curl -X POST https://your-backend.railway.app/api/scrape

# Or via Railway CLI
railway run "npm run scrape"
```

## 🛠️ Troubleshooting

### Common Issues

#### Backend Won't Start

- Check environment variables in Railway dashboard
- Verify DATABASE_URL is correct
- Check logs: `railway logs`

#### Scraper Not Working

- Verify Python dependencies are installed
- Check proxy configuration
- Monitor scraper logs in Railway

#### Frontend Build Fails

- Check EAS configuration in `eas.json`
- Verify all dependencies are installed
- Check for TypeScript errors

### Support

- **Backend Issues**: Check Railway logs and documentation
- **Frontend Issues**: Check EAS build logs
- **Database Issues**: Check Supabase dashboard

## 🎉 Success Metrics

### After Deployment

- ✅ Backend responds to health checks
- ✅ Scraper runs every 6 hours
- ✅ Frontend builds and deploys successfully
- ✅ Real price data appears in app
- ✅ Receipt scanning works
- ✅ Analytics and insights function

### Performance Targets

- **Backend Response Time**: < 200ms
- **Scraper Success Rate**: > 90%
- **App Load Time**: < 3 seconds
- **Database Query Time**: < 100ms

## 🔮 Future Enhancements

### Phase 2 Features

- [ ] Add more supermarkets (New World, Pak'nSave)
- [ ] Implement price alerts
- [ ] Add barcode scanning
- [ ] Enhanced analytics dashboard
- [ ] Push notifications for deals

### Scaling Considerations

- [ ] Implement caching layer
- [ ] Add CDN for static assets
- [ ] Database optimization
- [ ] Load balancing for scraper

---

**🎯 Your ReceiptRadar app is now production-ready with real NZ supermarket data!**
