# Troubleshooting Guide

This directory contains troubleshooting guides and solutions for common ReceiptRadar issues.

## 📁 Troubleshooting Documentation

### General Issues

- [troubleshooting.md](./troubleshooting.md) - General troubleshooting guide
- [quick-fix-guide.md](./quick-fix-guide.md) - Quick fixes for common problems

### Authentication Issues

- [email-confirmation-fix.md](./email-confirmation-fix.md) - Email confirmation problems
- [email-confirmation-ui.md](./email-confirmation-ui.md) - Email confirmation UI issues

### Technical Issues

- [structured-clone-fix.md](./structured-clone-fix.md) - Structured clone polyfill issues
- [processing-timeout-fixes.md](./processing-timeout-fixes.md) - Processing timeout problems
- [processing-page-improvements.md](./processing-page-improvements.md) - Processing page issues

### Database Issues

- [manual-database-fix.md](./manual-database-fix.md) - Manual database fixes

## 🚨 Common Issues

### Setup Issues

#### Database Connection Failed

```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

1. Check if PostgreSQL is running: `docker-compose ps`
2. Start database: `docker-compose up postgres -d`
3. Verify connection: `node scripts/setup-database.js`

#### OCR Service Not Starting

```bash
Error: Module not found: 'paddleocr'
```

**Solution:**

1. Install Python dependencies: `cd ocr && pip install -r requirements.txt`
2. Check Python version: `python --version` (should be 3.11+)
3. Restart OCR service: `python main.py`

### Authentication Issues

#### Apple Sign-In Not Working

```bash
Error: Apple authentication failed
```

**Solution:**

1. Check Apple Developer configuration
2. Verify bundle identifier matches
3. Test with development account
4. See [apple-signin-fix.md](./apple-signin-fix.md) for detailed steps

#### Email Confirmation Issues

```bash
Error: Email confirmation not received
```

**Solution:**

1. Check spam folder
2. Verify email address
3. Resend confirmation
4. See [email-confirmation-fix.md](./email-confirmation-fix.md)

### Performance Issues

#### Slow Receipt Processing

```bash
Processing takes >10 seconds
```

**Solution:**

1. Check OCR service status
2. Verify image quality
3. Check network connectivity
4. See [processing-timeout-fixes.md](./processing-timeout-fixes.md)

#### App Crashes on Startup

```bash
App crashes immediately after launch
```

**Solution:**

1. Clear app cache: `npx expo start --clear`
2. Check for JavaScript errors
3. Verify environment variables
4. Test on different device

## 🔧 Debugging Tools

### Development Tools

#### React Native Debugger

```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

#### Flipper

```bash
# Install Flipper
brew install --cask flipper

# Start Flipper
open -a Flipper
```

#### Expo DevTools

```bash
# Start Expo DevTools
npx expo start --dev-client
```

### Logging

#### Enable Debug Logging

```bash
# Set debug level
export LOG_LEVEL=debug

# Start with debug logging
LOG_LEVEL=debug npm start
```

#### View Logs

```bash
# View app logs
npx expo logs

# View OCR service logs
docker-compose logs ocr-service

# View database logs
docker-compose logs postgres
```

## 🐛 Error Codes

### Common Error Codes

| Error Code | Description                | Solution                      |
| ---------- | -------------------------- | ----------------------------- |
| `AUTH_001` | Authentication failed      | Check credentials and network |
| `OCR_001`  | OCR service unavailable    | Restart OCR service           |
| `DB_001`   | Database connection failed | Check database status         |
| `NET_001`  | Network timeout            | Check internet connection     |
| `IMG_001`  | Image processing failed    | Check image format and size   |

### Error Reporting

When reporting errors, include:

1. **Error message** - Complete error text
2. **Error code** - If available
3. **Steps to reproduce** - Detailed steps
4. **Environment** - OS, device, app version
5. **Logs** - Relevant log output

## 🔄 Recovery Procedures

### Database Recovery

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres receiptradar > backup.sql

# Restore database
docker-compose exec postgres psql -U postgres receiptradar < backup.sql

# Reset database
node scripts/fix-database.js
```

### Service Recovery

```bash
# Restart all services
docker-compose down
docker-compose up -d

# Restart specific service
docker-compose restart ocr-service

# Check service health
docker-compose ps
```

### App Recovery

```bash
# Clear cache and restart
npx expo start --clear

# Reset app data (iOS)
# Settings > General > Reset > Reset All Content and Settings

# Reset app data (Android)
# Settings > Apps > ReceiptRadar > Storage > Clear Data
```

## 📞 Support

### Getting Help

1. **Check this guide** - Search for your specific issue
2. **Check logs** - Look for error messages
3. **Search issues** - Check existing GitHub issues
4. **Create issue** - Provide detailed information

### Issue Template

When creating an issue, use this template:

```markdown
## Issue Description

Brief description of the problem

## Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [iOS/Android/Web]
- Device: [Device model]
- App Version: [Version number]
- Node Version: [Node version]

## Logs

Relevant log output

## Additional Information

Any other relevant information
```

## 📚 Additional Resources

- [Development Guide](../development/README.md) - Development setup and workflow
- [Setup Guide](../setup/README.md) - Initial setup instructions
- [API Documentation](../development/api-reference.md) - API troubleshooting
