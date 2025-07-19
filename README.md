# ReceiptRadar — Grocery Intelligence Platform

> _"Mint for groceries, Plaid for FMCG—wrapped in Braun-grade calm."_

ReceiptRadar transforms receipt tracking into a comprehensive grocery intelligence platform, combining consumer savings with B2B data insights.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd receiptradar

# Install dependencies
npm install

# Start development
npm start
```

For detailed setup instructions, see [docs/setup/README.md](docs/setup/README.md).

## 📁 Project Structure

```
receiptradar/
├── app/                    # React Native app (Expo Router)
├── src/                    # Shared source code
│   ├── components/         # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── backend/               # Backend API (Cloudflare Workers)
├── ocr/                   # OCR and price intelligence service
├── database/              # Database schema and migrations
├── supabase/              # Supabase configuration
├── docs/                  # Project documentation
├── scripts/               # Utility scripts
└── assets/                # Static assets
```

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

## 🎯 Key Features

### Consumer Features

- **Smart Receipt Parsing** - 95% accuracy with automatic categorization
- **Price Intelligence** - Real-time price comparison and historical tracking
- **Savings Optimization** - Basket-level savings analysis and cashback integration

### B2B Features

- **Basket Intelligence** - Anonymized purchase patterns and demand trends
- **Price Competition** - Real-time price monitoring and competitive analysis
- **Demand Pulse** - 48-hour latency SKU demand with geographic patterns

## 📚 Documentation

- **[Setup Guide](docs/setup/README.md)** - Installation and configuration
- **[Development Guide](docs/development/README.md)** - Development workflow and architecture
- **[Features](docs/features/README.md)** - Feature documentation and guides
- **[Troubleshooting](docs/troubleshooting/README.md)** - Common issues and solutions
- **[Roadmap](docs/roadmap/README.md)** - Project planning and milestones

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build:ios
npm run build:android

# Database operations
node scripts/setup-database.js
node scripts/run-migration.js
```

## 📊 Metrics & KPIs

### Consumer Metrics

- D1 retention ≥ 55%
- D30 retention ≥ 30%
- Average verified saving ≥ NZ$18/month

### B2B Metrics

- 5 brands × NZ$4k/month pilot
- NZ$1M ARR by Y3
- 500k MAU projection

## 🤝 Contributing

1. Check the [development guide](docs/development/README.md)
2. Follow the [contribution guidelines](docs/development/contributing.md)
3. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: [docs/README.md](docs/README.md)
- **Troubleshooting**: [docs/troubleshooting/README.md](docs/troubleshooting/README.md)
- **Issues**: Create an issue in the repository

---

_Built with ❤️ for smarter grocery shopping_
