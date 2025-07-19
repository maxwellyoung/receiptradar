# Authentication Integration

ReceiptRadar now includes complete Supabase authentication integration with the following features:

## 🔐 Authentication Flow

1. **App Launch**: The app checks for existing authentication session
2. **Unauthenticated Users**: Redirected to `/auth` screen
3. **Authenticated Users**: Redirected to main app `/(tabs)`
4. **Session Management**: Automatic token refresh and persistence

## 📁 New Files Created

### Core Authentication

- `src/contexts/AuthContext.tsx` - Global authentication state management
- `src/components/AuthGuard.tsx` - Route protection and navigation logic
- `src/components/AuthScreen.tsx` - Sign in/sign up UI component
- `app/auth.tsx` - Authentication screen wrapper

### Supabase Integration

- `src/constants/supabase.ts` - Supabase configuration
- `src/services/supabase.ts` - Database and auth services
- `src/hooks/useAuth.ts` - Authentication hook (alternative to context)
- `src/hooks/useReceipts.ts` - Receipt management hook
- `src/types/database.ts` - TypeScript database types

### Updated Screens

- `app/_layout.tsx` - Added AuthProvider and AuthGuard
- `app/(tabs)/settings.tsx` - Added user profile and sign out
- `app/(tabs)/index.tsx` - Integrated real receipt data
- `app/(tabs)/trends.tsx` - Spending analytics screen
- `app/(tabs)/camera.tsx` - Camera tab redirect

## 🚀 How to Use

### Authentication Context

```typescript
import { useAuthContext } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, signIn, signUp, signOut } = useAuthContext();

  // Use authentication state and methods
}
```

### Receipt Management

```typescript
import { useReceipts } from "@/hooks/useReceipts";

function ReceiptsList() {
  const { receipts, loading, createReceipt, updateReceipt, deleteReceipt } =
    useReceipts(userId);

  // Manage receipt data
}
```

### Database Operations

```typescript
import { dbService, authService, storageService } from "@/services/supabase";

// Create a receipt
const { data, error } = await dbService.createReceipt({
  user_id: userId,
  store_name: "Countdown",
  total_amount: 87.45,
  date: "2024-01-15",
});

// Upload receipt image
const { data, error } = await storageService.uploadReceiptImage(
  file,
  "receipt.jpg",
  userId
);
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure token-based authentication
- **Session Persistence**: Automatic login state restoration
- **Secure Storage**: Receipt images stored in user-specific folders

## 📊 Database Schema

The app uses the following Supabase tables:

- `users` - User profiles (linked to Supabase Auth)
- `receipts` - Receipt data with OCR results
- `categories` - Spending categories
- `stores` - Store information
- `items` - Individual items from receipts

## 🎨 UI Components

### AuthScreen

- Clean, modern authentication UI
- Email/password sign in and sign up
- Form validation and error handling
- Responsive design with keyboard handling

### Settings Screen

- User profile display
- App settings toggles
- Sign out functionality
- Pro features promotion

## 🔧 Configuration

### Supabase Setup

1. Run the SQL schema in `database/schema.sql`
2. Create storage bucket `receipt-images`
3. Configure RLS policies for storage
4. Test authentication flow

### Environment Variables

The Supabase configuration is already set up with your credentials:

- Project URL: `https://cihuylmusthumxpuexrl.supabase.co`
- Anon Key: Configured in `src/constants/supabase.ts`

## 🧪 Testing

1. **Fresh Install**: App should redirect to auth screen
2. **Sign Up**: Create new account, verify user creation
3. **Sign In**: Login with existing credentials
4. **Session Persistence**: Restart app, should stay logged in
5. **Sign Out**: Should redirect to auth screen
6. **Data Access**: Verify users can only see their own receipts

## 🚨 Error Handling

- Network connectivity issues
- Invalid credentials
- Database connection errors
- Storage upload failures
- Session expiration

## 🔄 State Management

The app uses React Context for global authentication state:

- Automatic session restoration
- Real-time auth state updates
- Loading states for better UX
- Error handling and display

## 📱 Navigation Flow

```
App Launch
    ↓
Check Auth State
    ↓
┌─────────────────┐    ┌─────────────────┐
│   Loading...    │    │   Authenticated │
└─────────────────┘    └─────────────────┘
    ↓                        ↓
┌─────────────────┐    ┌─────────────────┐
│   Auth Screen   │    │   Main App      │
│  (Sign In/Up)   │    │   (Tabs)        │
└─────────────────┘    └─────────────────┘
```

## 🎯 Next Steps

1. **Real Data Integration**: Replace mock data with Supabase queries
2. **Image Upload**: Implement receipt photo upload to storage
3. **Analytics**: Add spending charts and insights
4. **Notifications**: Push notifications for spending alerts
5. **Offline Support**: Cache data for offline usage
6. **Social Features**: Share receipts and savings tips
