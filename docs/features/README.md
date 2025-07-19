# Features Documentation

This directory contains documentation for all ReceiptRadar features.

## 📁 Feature Documentation

### Core Features

- [receipt-parsing-improvements.md](./receipt-parsing-improvements.md) - OCR and receipt parsing features
- [store-parsers-implementation.md](./store-parsers-implementation.md) - Store-specific parsing logic
- [correction-integration-guide.md](./correction-integration-guide.md) - Receipt correction system

### Growth & Viral Features

- [viral-features.md](./viral-features.md) - Viral growth mechanisms
- [radar-worm.md](./radar-worm.md) - Radar worm feature
- [landing-page.md](./landing-page.md) - Landing page features

## 🎯 Core Features

### Smart Receipt Parsing

ReceiptRadar's core feature is intelligent receipt parsing with 95% accuracy:

- **OCR Processing** - Advanced text recognition using PaddleOCR
- **Store Detection** - Automatic store identification from receipt layout
- **Item Extraction** - Product names, prices, and quantities
- **Category Classification** - Automatic categorization of items
- **Confidence Scoring** - Quality assessment of parsed data

### Price Intelligence

Real-time price comparison and historical tracking:

- **Cross-Store Comparison** - Find the best prices across retailers
- **Price History** - Track price changes over time
- **Savings Alerts** - Notifications when prices drop
- **Basket Optimization** - Suggest alternative stores for savings

### B2B Data Intelligence

Anonymized consumer data for business insights:

- **Demand Pulse** - Real-time demand trends with 48-hour latency
- **Price Competition** - Competitive pricing analysis
- **Basket Intelligence** - Purchase pattern analysis
- **Geographic Insights** - Regional demand patterns

## 🚀 Growth Features

### Viral Mechanics

- **Social Sharing** - Share savings achievements
- **Referral System** - Invite friends for rewards
- **Achievement Badges** - Gamification elements
- **Community Features** - User-generated content

### Radar Worm

A unique feature that gamifies receipt scanning:

- **Progressive Unlocking** - Unlock features through usage
- **Visual Feedback** - Animated worm that grows with activity
- **Milestone Rewards** - Rewards for scanning milestones
- **Social Elements** - Share worm progress with friends

## 📱 User Experience Features

### Onboarding

- **Guided Tutorial** - Step-by-step setup process
- **Sample Receipts** - Practice with example receipts
- **Permission Setup** - Camera and notification permissions
- **Account Creation** - Seamless sign-up process

### Receipt Management

- **Receipt Library** - Organized receipt storage
- **Search & Filter** - Find receipts by date, store, or amount
- **Export Options** - Download receipts for tax purposes
- **Receipt Sharing** - Share receipts with family members

### Analytics & Insights

- **Spending Trends** - Visual spending analysis
- **Category Breakdown** - Spending by category
- **Savings Tracking** - Track total savings over time
- **Budget Integration** - Connect with budgeting apps

## 🔧 Technical Features

### Store Parser System

Modular parsing system for different retailers:

```typescript
// Example store parser
class CountdownParser implements IReceiptParser {
  parseReceipt(image: string): ParsedReceipt {
    // Store-specific parsing logic
  }
}
```

### Price Scraper

Automated price collection from retailer websites:

- **Multi-Store Support** - Countdown, New World, Pak'nSave
- **Proxy Rotation** - Avoid rate limiting
- **Real-time Updates** - Continuous price monitoring
- **Error Handling** - Robust error recovery

### API Integration

Comprehensive API for third-party integrations:

```bash
# Receipt parsing
POST /api/receipts/parse
Content-Type: multipart/form-data

# Price comparison
GET /api/prices/compare?item=milk&location=auckland

# B2B analytics
GET /api/analytics/demand-pulse?category=dairy
```

## 📊 Feature Metrics

### Performance Targets

- **OCR Accuracy**: 95% vs Google Vision
- **Processing Speed**: <5 seconds per receipt
- **Price Coverage**: 80% of AU/NZ SKUs
- **Uptime**: 99.9% availability

### User Engagement

- **D1 Retention**: ≥55%
- **D30 Retention**: ≥30%
- **Receipts per User**: ≥8/month
- **Feature Adoption**: ≥70% for core features

## 🔄 Feature Development

### Development Process

1. **Feature Planning** - Requirements and design
2. **Prototype Development** - Quick implementation
3. **User Testing** - Feedback and iteration
4. **Production Release** - Gradual rollout
5. **Performance Monitoring** - Metrics and optimization

### Feature Flags

Use feature flags for controlled rollouts:

```typescript
// Feature flag example
if (isFeatureEnabled("viral-features")) {
  // Show viral features
}
```

## 📚 Additional Resources

- [API Documentation](../development/api-reference.md) - Technical API details
- [Design System](../development/design-system.md) - UI/UX guidelines
- [Troubleshooting](../troubleshooting/README.md) - Feature-specific issues
