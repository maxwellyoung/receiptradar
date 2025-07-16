# ReceiptRadar — Grocery Intelligence Platform

> _"Mint for groceries, Plaid for FMCG—wrapped in Braun-grade calm."_

ReceiptRadar transforms receipt tracking into a comprehensive grocery intelligence platform, combining consumer savings with B2B data insights.

## 🚀 Vision

**Phase 1: Consumer Loop (0 → 1)**

- 2-tap receipt scanning with 95% parse accuracy
- Real-time price comparison and savings identification
- Cashback and loyalty integration

**Phase 2: Data Engine (1 → N)**

- Price-scraper mesh covering 80% of AU/NZ SKUs
- Anonymized basket intelligence for FMCG companies
- POS integration for 99% accuracy

**Phase 3: B2B Platform**

- SKU-level demand pulse with 48-hour latency
- Price competition analysis for hedge funds
- SaaS licensing for POS systems

## 🏗️ Architecture

### Core Services

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   OCR Service   │    │  B2B API        │
│   Mobile App    │◄──►│   (FastAPI)     │◄──►│  (FastAPI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │  Price Scraper  │    │  PostgreSQL     │
│   (Auth/Storage)│    │  (Playwright)   │    │  (Analytics)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **OCR Service** (`ocr/main.py`)

   - PaddleOCR for receipt parsing
   - Price intelligence integration
   - Real-time savings analysis

2. **Price Intelligence** (`ocr/price_intelligence.py`)

   - Price history tracking
   - Cross-store comparison
   - Savings opportunity identification

3. **Price Scraper** (`ocr/price_scraper.py`)

   - Playwright-based web scraping
   - Rotating proxy support
   - Store-specific selectors

4. **B2B API** (`ocr/b2b_api.py`)
   - Anonymized basket intelligence
   - Demand pulse analytics
   - API key management

## 🛠️ Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for mobile app)

### 1. Database Setup

```bash
# Start PostgreSQL with schema
docker-compose up postgres -d

# Verify database
docker-compose exec postgres psql -U postgres -d receiptradar -c "\dt"
```

### 2. OCR Service

```bash
# Install dependencies
cd ocr
pip install -r requirements.txt

# Start OCR service
python main.py
```

### 3. Price Intelligence

```bash
# Set environment variables
export DATABASE_URL="postgresql://postgres:receiptradar@localhost:5432/receiptradar"

# Run price scraper (optional)
python price_scraper.py

# Start B2B API
python -m uvicorn b2b_api:app --host 0.0.0.0 --port 8001
```

### 4. Mobile App

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### 5. Full Stack Deployment

```bash
# Deploy all services
docker-compose up -d

# Monitor services
docker-compose logs -f ocr-service
```

## 📊 API Endpoints

### OCR Service (`:8000`)

```bash
# Health check
GET /health

# Parse receipt
POST /parse
Content-Type: multipart/form-data
file: receipt_image.jpg

# Analyze savings
POST /analyze-savings
{
  "items": [
    {"name": "milk", "price": 4.50, "quantity": 1, "category": "Dairy"}
  ],
  "store_id": "countdown_001",
  "user_id": "user_uuid"
}

# Get price history
GET /price-history/milk?days=90

# Store comparison
GET /store-comparison/milk
```

### B2B API (`:8001`)

```bash
# Basket intelligence summary
GET /basket-intelligence/summary?start_date=2024-01-01&end_date=2024-01-31
X-API-Key: your_api_key

# Demand pulse
GET /demand-pulse/category?category=Dairy&days=7
X-API-Key: your_api_key

# Price competition
GET /price-intelligence/competition?item_name=milk
X-API-Key: your_api_key
```

## 🎯 Key Features

### Consumer Features

1. **Smart Receipt Parsing**

   - 95% accuracy benchmark vs Google Vision
   - Automatic categorization
   - Confidence scoring

2. **Price Intelligence**

   - Real-time price comparison
   - Historical price tracking
   - Store recommendations

3. **Savings Optimization**
   - Basket-level savings analysis
   - Cashback integration
   - Price alerts

### B2B Features

1. **Basket Intelligence**

   - Anonymized purchase patterns
   - Category demand trends
   - Cross-store analysis

2. **Price Competition**

   - Real-time price monitoring
   - Competitive analysis
   - Price volatility tracking

3. **Demand Pulse**
   - 48-hour latency SKU demand
   - Seasonal trend analysis
   - Geographic demand patterns

## 📈 Metrics & KPIs

### Consumer Metrics

- D1 retention ≥ 55%
- D30 retention ≥ 30%
- Average verified saving ≥ NZ$18/month
- 10% cashback activation within 60 days

### B2B Metrics

- 5 brands × NZ$4k/month pilot
- NZ$1M ARR by Y3
- 500k MAU projection
- 99% POS accuracy target

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# Scraping
SCRAPER_PROXIES=proxy1:port,proxy2:port

# Monitoring
LOG_LEVEL=INFO
GRAFANA_PASSWORD=admin
```

### Store Configuration

Edit `ocr/price_scraper.py` to add new stores:

```python
STORE_CONFIGS = {
    'new_store': {
        'store_id': 'new_store_001',
        'store_name': 'New Store',
        'base_url': 'https://shop.newstore.com',
        'selectors': {
            'product_container': '.product-item',
            'price': '.price-value',
            'product_name': '.product-title'
        },
        'items': ['milk', 'bread', 'eggs']
    }
}
```

## 🚀 Deployment

### Production Deployment

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Monitor with Grafana
open http://localhost:3000

# Check Prometheus metrics
open http://localhost:9090
```

### Scaling

```bash
# Scale OCR service
docker-compose up -d --scale ocr-service=3

# Scale price scraper
docker-compose up -d --scale price-scraper=2
```

## 🔒 Security & Compliance

### Data Privacy

- User data anonymization for B2B
- Opt-in data sharing
- GDPR compliance ready

### API Security

- API key authentication
- Rate limiting
- Request logging

### Legal Compliance

- robots.txt aware scraping
- Public price pages only
- US/EU counsel engaged

## 📚 Development

### Adding New Features

1. **New Store Support**

   ```python
   # Add to price_scraper.py
   # Update selectors and test
   ```

2. **New Analytics**

   ```python
   # Add to b2b_api.py
   # Create new endpoint
   ```

3. **Mobile Features**
   ```typescript
   // Add to src/components/
   // Update navigation
   ```

### Testing

```bash
# Run tests
pytest ocr/tests/

# Test API endpoints
curl -X POST http://localhost:8000/parse \
  -F "file=@test_receipt.jpg"
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.receiptradar.com](https://docs.receiptradar.com)
- **API Reference**: [api.receiptradar.com](https://api.receiptradar.com)
- **Issues**: [GitHub Issues](https://github.com/receiptradar/issues)

---

_Built with ❤️ for smarter grocery shopping_
