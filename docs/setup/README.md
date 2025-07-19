# Setup Guide

This directory contains all setup and installation guides for ReceiptRadar.

## 📋 Prerequisites

Before setting up ReceiptRadar, ensure you have the following installed:

- **Docker & Docker Compose** - For containerized services
- **Python 3.11+** - For backend services
- **Node.js 18+** - For mobile app development
- **Git** - For version control

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd receiptradar
   ```

2. **Database Setup** - See [database-setup.md](./database-setup.md)
3. **Backend Setup** - See [backend-setup.md](./backend-setup.md)
4. **Mobile App Setup** - See [mobile-setup.md](./mobile-setup.md)
5. **Deployment** - See [deployment.md](./deployment.md)

## 📁 Setup Files

- [database-setup.md](./database-setup.md) - Database configuration and migration
- [backend-setup.md](./backend-setup.md) - Backend services setup
- [mobile-setup.md](./mobile-setup.md) - React Native app setup
- [deployment.md](./deployment.md) - Production deployment guide

## 🔧 Environment Configuration

Create a `.env` file in the root directory with the following variables:

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

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐛 Troubleshooting

If you encounter issues during setup, check the [troubleshooting guide](../troubleshooting/README.md) for common solutions.
