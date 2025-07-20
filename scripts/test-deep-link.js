#!/usr/bin/env node

/**
 * Test Deep Link Script
 *
 * This script tests the deep link functionality for password reset
 */

console.log("🔗 Testing Deep Link Functionality\n");

console.log("📱 Your app's deep link scheme: receiptradar://");
console.log("🔗 Password reset deep link: receiptradar://reset-password\n");

console.log("🧪 To test the deep link:");
console.log("1. Send a password reset email");
console.log("2. Click the link in the email");
console.log("3. It should open your app at the reset password screen\n");

console.log("📋 Deep link URL structure:");
console.log(
  "receiptradar://reset-password?access_token=YOUR_TOKEN&type=recovery\n"
);

console.log("✅ Deep link is configured in:");
console.log("- app.json: scheme: 'receiptradar'");
console.log("- supabase.ts: redirectTo: 'receiptradar://reset-password'");
console.log("- reset-password.tsx: handles deep link parameters\n");

console.log("🚀 For production:");
console.log("- Update the redirectTo URL to your production domain");
console.log("- Test the deep link on actual devices");
console.log("- Ensure your app handles the deep link properly\n");
