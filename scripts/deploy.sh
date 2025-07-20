#!/bin/bash

echo "🚀 Deploying ReceiptRadar to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_error "EAS CLI not found. Please install it first:"
    echo "npm install -g @expo/eas-cli"
    exit 1
fi

print_status "Deploying Backend to Railway..."

# Deploy backend
cd backend
if railway up; then
    print_status "Backend deployed successfully!"
    BACKEND_URL=$(railway status --json | jq -r '.url')
    echo "Backend URL: $BACKEND_URL"
else
    print_error "Backend deployment failed!"
    exit 1
fi

cd ..

print_status "Building and deploying Frontend to EAS..."

# Build and deploy frontend
if eas build --platform all --non-interactive; then
    print_status "Frontend build completed!"
    
    # Submit to app stores (optional)
    read -p "Do you want to submit to app stores? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Submitting to App Store..."
        eas submit --platform ios --non-interactive
        
        print_status "Submitting to Google Play Store..."
        eas submit --platform android --non-interactive
    fi
else
    print_error "Frontend build failed!"
    exit 1
fi

print_status "Deployment completed successfully! 🎉"

echo ""
echo "📱 Your ReceiptRadar app is now live!"
echo "🔗 Backend: $BACKEND_URL"
echo "📊 Health check: $BACKEND_URL/health"
echo "🔄 Scraper status: $BACKEND_URL/api/scrape/status"
echo ""
echo "💡 Next steps:"
echo "   1. Test your app with real data"
echo "   2. Monitor scraper logs in Railway"
echo "   3. Set up monitoring and alerts" 