# Apple Authentication Setup for ReceiptRadar

This guide will help you set up Apple Sign-In for your ReceiptRadar app.

## Prerequisites

- Apple Developer Account ($99/year)
- iOS device or simulator for testing
- Expo CLI installed
- Supabase project configured

## Step 1: Apple Developer Console Setup

### 1.1 Create App ID

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Click "Identifiers" → "+" → "App IDs"
4. Select "App" and click "Continue"
5. Fill in the details:
   - **Description**: ReceiptRadar
   - **Bundle ID**: `com.receiptradar.app` (must match your app.json)
6. Scroll down to "Capabilities"
7. **Enable "Sign In with Apple"**
8. Click "Continue" and "Register"

### 1.2 Create Service ID (for web support)

1. In the same section, click "+" → "App IDs"
2. Select "Services IDs" and click "Continue"
3. Fill in the details:
   - **Description**: ReceiptRadar Web
   - **Identifier**: `com.receiptradar.app.web`
4. Enable "Sign In with Apple"
5. Click "Configure" next to "Sign In with Apple"
6. Add your domain and return URL (if you have a web version)
7. Click "Continue" and "Register"

### 1.3 Get Your Team ID

1. In Apple Developer Console, click on your name in the top right
2. Note your **Team ID** (10-character string)
3. You'll need this for the app.json configuration

## Step 2: Update App Configuration

### 2.1 Update app.json

Replace `YOUR_APPLE_TEAM_ID` in your `app.json` with your actual Team ID:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-apple-authentication",
        {
          "appleTeamId": "YOUR_ACTUAL_TEAM_ID"
        }
      ]
    ]
  }
}
```

### 2.2 Update Bundle Identifier

Make sure your bundle identifier matches what you created in Apple Developer Console:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.receiptradar.app"
    }
  }
}
```

## Step 3: Supabase Configuration

### 3.1 Enable Apple Provider

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Find "Apple" and click "Enable"
4. Fill in the configuration:
   - **Client ID**: `com.receiptradar.app` (your App ID)
   - **Team ID**: Your Apple Team ID
   - **Key ID**: You'll create this in the next step
   - **Private Key**: You'll create this in the next step

### 3.2 Create Apple Signing Key

1. In Apple Developer Console, go to "Keys"
2. Click "+" → "Apple Signing Key"
3. Fill in:
   - **Key Name**: ReceiptRadar Apple Auth
   - **Key ID**: Note this (you'll need it for Supabase)
4. Enable "Sign In with Apple"
5. Click "Configure" and select your App ID
6. Click "Continue" and "Register"
7. **Download the .p8 file** (you can only download once!)
8. Open the .p8 file and copy the private key content

### 3.3 Complete Supabase Configuration

1. Back in Supabase, paste your private key content
2. Save the configuration
3. Test the connection

## Step 4: Build and Test

### 4.1 Development Build

```bash
# Install dependencies
npm install

# Create development build
eas build --profile development --platform ios

# Or use Expo Go for testing (limited Apple Sign-In support)
npx expo start
```

### 4.2 Testing

1. Install the app on a physical iOS device (Apple Sign-In doesn't work in simulator)
2. Open the app and go to the auth screen
3. Tap the "Sign in with Apple" button
4. Complete the Apple authentication flow
5. Verify the user is created in your Supabase dashboard

## Step 5: Production Deployment

### 5.1 App Store Connect

1. Create an app in App Store Connect
2. Use the same bundle identifier: `com.receiptradar.app`
3. Upload your build

### 5.2 Production Build

```bash
# Build for production
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

## Troubleshooting

### Common Issues

1. **"Apple Sign-In is not available"**

   - Make sure you're testing on a physical iOS device
   - Verify the bundle identifier matches
   - Check that Sign In with Apple is enabled in your App ID

2. **"Invalid client" error**

   - Verify your Team ID in app.json
   - Check that your App ID is correctly configured
   - Ensure the bundle identifier matches

3. **Supabase authentication fails**

   - Verify your private key is correctly pasted
   - Check that the Key ID matches
   - Ensure the Client ID matches your App ID

4. **Build fails**
   - Clear Expo cache: `expo r -c`
   - Update Expo SDK: `expo upgrade`
   - Check that all dependencies are installed

### Debug Mode

Enable debug logging in your app:

```typescript
// In your Apple authentication service
console.log(
  "Apple auth available:",
  await AppleAuthentication.isAvailableAsync()
);
console.log("Platform:", Platform.OS);
```

## Security Considerations

1. **Private Key Security**: Never commit your .p8 private key to version control
2. **Environment Variables**: Store sensitive values in environment variables
3. **App Review**: Apple will review your Apple Sign-In implementation
4. **User Privacy**: Follow Apple's privacy guidelines

## Additional Resources

- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Apple Developer Console logs
3. Check Supabase authentication logs
4. Test with a fresh development build
5. Verify all configuration matches exactly

## Next Steps

After successful Apple authentication setup:

1. Test the complete user flow
2. Implement user profile creation
3. Add error handling for edge cases
4. Consider adding other social providers (Google, Facebook)
5. Implement account linking for existing users
