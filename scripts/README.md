# Scripts

This directory contains utility scripts for development, testing, and maintenance tasks.

## 📁 Available Scripts

### Database Scripts

- **`setup-database.js`** - Initialize database schema and tables
- **`run-migration.js`** - Run database migrations
- **`fix-database.js`** - Fix common database issues

### Testing Scripts

- **`test-mvp-status.js`** - Test MVP functionality and status
- **`test-structured-clone.js`** - Test structured clone polyfill
- **`find-jsx-issues.js`** - Find JSX-related issues in the codebase

### Development Scripts

- **`serve-landing.js`** - Serve the landing page for development

## 🚀 Usage

### Database Setup

```bash
# Initialize database
node scripts/setup-database.js

# Run migrations
node scripts/run-migration.js

# Fix database issues
node scripts/fix-database.js
```

### Testing

```bash
# Test MVP status
node scripts/test-mvp-status.js

# Test structured clone
node scripts/test-structured-clone.js

# Find JSX issues
node scripts/find-jsx-issues.js
```

### Development

```bash
# Serve landing page
node scripts/serve-landing.js
```

## 📝 Script Details

Each script is self-contained and includes error handling. Check the individual script files for specific configuration options and requirements.

## 🔧 Prerequisites

Most scripts require:

- Node.js 18+
- Access to the database (if database-related)
- Proper environment variables set

## 🐛 Troubleshooting

If a script fails:

1. Check that all prerequisites are met
2. Verify environment variables are set correctly
3. Check the script's error output for specific issues
4. Refer to the troubleshooting documentation in `docs/troubleshooting/`
