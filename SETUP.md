# ReceiptRadar Setup Guide

This guide will help you set up the ReceiptRadar project for local development.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Expo CLI (`npm install -g @expo/cli`)
- Git
- Docker (for OCR service)
- Supabase account
- Cloudflare account
- Fly.io account (optional, for OCR deployment)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/receiptradar.git
cd receiptradar
npm install
```

### 2. Environment Setup

Create environment files:

```bash
# Frontend
cp .env.example .env.local

# Backend
cp backend/.env.example backend/.env.local

# OCR Service
cp ocr/.env.example ocr/.env.local
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the schema: `database/schema.sql`
3. Get your Supabase URL and keys
4. Update environment variables

### 4. Start Development Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (Cloudflare Workers)
cd backend
npm run dev

# Terminal 3: OCR Service
cd ocr
python -m uvicorn main:app --reload --port 8000
```

## Detailed Setup

### Frontend (React Native + Expo)

1. **Install Expo CLI**

   ```bash
   npm install -g @expo/cli
   ```

2. **Configure Environment**

   ```bash
   # .env.local
   EXPO_PUBLIC_API_URL=http://localhost:8787
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development**

   ```bash
   npm run dev
   ```

4. **Run on Device**
   - Install Expo Go on your phone
   - Scan the QR code from the terminal
   - Or run on simulator: `npm run ios` / `npm run android`

### Backend (Cloudflare Workers)

1. **Install Wrangler**

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**

   ```bash
   wrangler login
   ```

3. **Configure Environment**

   ```bash
   # backend/.env.local
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OCR_SERVICE_URL=http://localhost:8000
   ```

4. **Start Development Server**
   ```bash
   cd backend
   npm run dev
   ```

### OCR Service (Python + FastAPI)

1. **Create Virtual Environment**

   ```bash
   cd ocr
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Start Service**

   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

4. **Test OCR**
   ```bash
   curl -X POST "http://localhost:8000/health"
   ```

## Database Setup

### Supabase Configuration

1. **Create Project**

   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API keys

2. **Run Schema**

   ```bash
   # In Supabase SQL editor
   # Copy and paste contents of database/schema.sql
   ```

3. **Configure RLS**
   - Row Level Security is already configured in the schema
   - Test with a sample user

### Sample Data

```sql
-- Insert test user
INSERT INTO users (email) VALUES ('test@receiptradar.com');

-- Insert test receipt
INSERT INTO receipts (user_id, store_id, ts, total)
VALUES (
  (SELECT id FROM users WHERE email = 'test@receiptradar.com'),
  (SELECT id FROM stores WHERE name = 'Countdown Mt Albert'),
  NOW(),
  87.45
);
```

## Testing

### Frontend Tests

```bash
npm test
npm run test:watch
```

### Backend Tests

```bash
cd backend
npm test
```

### OCR Tests

```bash
cd ocr
python -m pytest tests/ -v
```

### E2E Tests

```bash
npm run test:e2e
```

## Deployment

### Frontend (Expo)

```bash
# Build for production
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Backend (Cloudflare Workers)

```bash
cd backend
wrangler deploy --env production
```

### OCR Service (Fly.io)

```bash
cd ocr
flyctl deploy
```

## Environment Variables

### Frontend (.env.local)

```bash
EXPO_PUBLIC_API_URL=https://your-api.workers.dev
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Backend (.env.local)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OCR_SERVICE_URL=https://receiptradar-ocr.fly.dev
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### OCR Service (.env.local)

```bash
REDIS_URL=your_redis_url
LOG_LEVEL=INFO
```

## Troubleshooting

### Common Issues

1. **Expo Build Fails**

   - Clear cache: `expo r -c`
   - Update Expo SDK: `expo upgrade`

2. **OCR Service Won't Start**

   - Check Python version: `python --version`
   - Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

3. **Database Connection Issues**

   - Verify Supabase credentials
   - Check RLS policies
   - Test connection in Supabase dashboard

4. **Camera Permissions**
   - iOS: Check Info.plist settings
   - Android: Check AndroidManifest.xml

### Performance Tips

1. **Development**

   - Use Expo Go for faster iteration
   - Enable Hermes engine
   - Use React DevTools

2. **Production**
   - Enable code splitting
   - Optimize images
   - Use CDN for static assets

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Support

- 📧 Email: support@receiptradar.app
- 💬 Discord: [ReceiptRadar Community](https://discord.gg/receiptradar)
- 📖 Docs: [docs.receiptradar.app](https://docs.receiptradar.app)

## License

MIT License - see [LICENSE](LICENSE) for details.
