# Apple Sign-In Fix: "Unacceptable audience in id_token"

## 🚨 The Problem

You're getting this error:

```
ERROR Apple authentication error: [AuthApiError: Unacceptable audience in id_token: [host.exp.Exponent]]
```

This happens because:

- **Expo Go/Development**: Uses `host.exp.Exponent` as the audience in Apple ID tokens
- **Supabase Configuration**: Expects `com.receiptradar.app` as the client ID
- **Mismatch**: Supabase rejects the token because audiences don't match

## 🔧 Solutions (Choose One)

### Solution 1: Create Development Build (Recommended)

This is the best long-term solution:

```bash
# 1. Install latest EAS CLI
npm install -g eas-cli@latest

# 2. Login to Expo
eas login

# 3. Create development build
eas build --profile development --platform ios
```

**Benefits:**

- ✅ Apple Sign-In works properly
- ✅ Uses your actual bundle identifier
- ✅ Closer to production environment
- ✅ Better debugging capabilities

### Solution 2: Update Supabase Configuration

If you want to test with Expo Go, you need to configure Supabase to accept both audiences:

1. **Go to Supabase Dashboard** → Authentication → Providers → Apple
2. **Add multiple Client IDs**:
   - `com.receiptradar.app` (production)
   - `host.exp.Exponent` (development)

**Note:** This is a temporary workaround and not recommended for production.

### Solution 3: Use Email/Password Authentication

For immediate testing, use the email/password authentication instead:

1. **Sign up** with email/password
2. **Sign in** with email/password
3. **Apple Sign-In** will work once you have a development build

## 🛠️ Current Status

### What's Fixed

✅ **Better Error Handling**: The app now detects development mode and provides helpful error messages

✅ **User Feedback**: Clear alerts explain what's happening and how to fix it

✅ **Graceful Degradation**: App continues to work with email/password auth

### What You Need to Do

🔄 **Choose a solution above** based on your needs

🔄 **Test the authentication flow** with your chosen solution

## 📱 Testing Steps

### With Development Build (Solution 1)

1. **Create the build**:

   ```bash
   eas build --profile development --platform ios
   ```

2. **Install on device** (not simulator)

3. **Test Apple Sign-In** - should work without errors

### With Email/Password (Solution 3)

1. **Open the app** in Expo Go
2. **Tap "Sign Up"**
3. **Enter email and password**
4. **Complete signup**
5. **Sign in** - should work immediately

## 🔍 Debug Information

The app now logs helpful information:

```javascript
// Development mode detection
console.log(
  "⚠️ Development mode detected - Apple Sign-In may not work with Supabase"
);

// Apple credential details
console.log("Apple credential received:", {
  user: credential.user,
  fullName: credential.fullName,
  email: credential.email,
  hasIdentityToken: !!identityToken,
});
```

## 🎯 Expected Behavior

### After Fix

- ✅ **Development Build**: Apple Sign-In works seamlessly
- ✅ **Expo Go**: Clear error messages guide you to create a build
- ✅ **Email/Password**: Always works as fallback
- ✅ **Error Handling**: Helpful messages instead of cryptic errors

### Error Messages You'll See

- **Development Mode**: "Apple Sign-In may not work in Expo Go. For full functionality, please create a development build."
- **Audience Error**: "Apple Sign-In requires a development build. Please run: eas build --profile development --platform ios"
- **Configuration Error**: "Apple Sign-In is not properly configured. Please check your Supabase Apple provider settings."

## 🚀 Next Steps

1. **Choose your solution** from the options above
2. **Test the authentication flow**
3. **Verify user creation** in Supabase dashboard
4. **Test the complete app flow** with authenticated user

## 📞 Need Help?

If you're still having issues:

1. **Check the console logs** for detailed error information
2. **Verify your Apple Developer Console** configuration
3. **Check your Supabase Apple provider** settings
4. **Try the email/password authentication** as a fallback

## 🔒 Security Note

The audience mismatch is actually a security feature - it prevents tokens from one environment from being used in another. This is why creating a proper development build is the recommended solution.
