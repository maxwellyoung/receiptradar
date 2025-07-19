# Development Guide

This directory contains development-related documentation for ReceiptRadar.

## 📁 Development Documentation

### Architecture & Design

- [architecture.md](./architecture.md) - System architecture overview
- [design-system.md](./design-system.md) - UI/UX design system
- [design-system-guide.md](./design-system-guide.md) - Design system implementation guide

### Authentication & Security

- [authentication.md](./authentication.md) - Authentication system overview
- [apple-auth-setup.md](./apple-auth-setup.md) - Apple Sign-In setup
- [apple-auth-summary.md](./apple-auth-summary.md) - Apple authentication summary
- [apple-signin-fix.md](./apple-signin-fix.md) - Apple Sign-In troubleshooting

### API Reference

- [api-reference.md](./api-reference.md) - API documentation (coming soon)

### Contributing

- [contributing.md](./contributing.md) - Contribution guidelines (coming soon)

## 🚀 Development Workflow

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Getting Started

1. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd receiptradar
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development**
   ```bash
   npm start
   ```

### Code Organization

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── services/          # API and external services
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── contexts/          # React contexts
├── parsers/           # Receipt parsing logic
└── repositories/      # Data access layer
```

### Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build:ios
npm run build:android
```

## 🎨 Design System

The project uses a custom design system inspired by minimalist designers like Jony Ive, Dieter Rams, and Michael Bierut. Key principles:

- **Clean, minimal interfaces** with subtle shadows and borders
- **Consistent spacing** using a 4px base unit
- **Typography hierarchy** with clear contrast
- **Subtle animations** for feedback and delight
- **Accessibility first** with proper contrast ratios

See [design-system.md](./design-system.md) for detailed guidelines.

## 🔐 Authentication

The app supports multiple authentication methods:

- **Apple Sign-In** (primary for iOS)
- **Email/Password** (fallback)
- **Supabase Auth** (backend)

See [authentication.md](./authentication.md) for implementation details.

## 🧪 Testing

### Testing Strategy

- **Unit tests** for utilities and hooks
- **Component tests** for UI components
- **Integration tests** for API interactions
- **E2E tests** for critical user flows

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

## 📱 Mobile Development

### Expo Router

The app uses Expo Router for navigation:

```typescript
// File-based routing
app/
├── (tabs)/
│   ├── index.tsx          # Home tab
│   ├── receipts.tsx       # Receipts tab
│   └── settings.tsx       # Settings tab
└── modals/
    └── camera.tsx         # Camera modal
```

### Platform-Specific Code

```typescript
// Platform-specific implementations
import { Platform } from "react-native";

if (Platform.OS === "ios") {
  // iOS-specific code
} else {
  // Android-specific code
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OCR Service
OCR_SERVICE_URL=http://localhost:8000

# Development
NODE_ENV=development
LOG_LEVEL=debug
```

### Build Configuration

- **iOS**: Configured in `ios/` directory
- **Android**: Configured in `android/` directory
- **Expo**: Configured in `app.json` and `eas.json`

## 🚀 Deployment

### Development Deployment

```bash
# Start all services
docker-compose up -d

# Deploy to development environment
npm run deploy:dev
```

### Production Deployment

```bash
# Build for production
npm run build:ios
npm run build:android

# Deploy to production
npm run deploy:prod
```

## 🐛 Debugging

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS build issues**: Clean build folder in Xcode
3. **Android build issues**: Clean gradle cache

### Debug Tools

- **React Native Debugger** for component inspection
- **Flipper** for network and performance monitoring
- **Expo DevTools** for development server management

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
