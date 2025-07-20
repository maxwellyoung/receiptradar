#!/usr/bin/env node

/**
 * Force Password Reset Script
 *
 * This script directly updates a user's password using the service role key
 * No token needed - just the email and new password
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function forceResetPassword() {
  console.log("🔐 Force Password Reset (Admin)\n");

  try {
    // Get the email
    const email = await new Promise((resolve) => {
      rl.question("Enter the user's email: ", resolve);
    });

    // Get the new password
    const newPassword = await new Promise((resolve) => {
      rl.question("Enter the new password (min 6 characters): ", resolve);
    });

    if (newPassword.length < 6) {
      console.error("❌ Password must be at least 6 characters");
      rl.close();
      return;
    }

    console.log("\n🔄 Updating password...");

    // Use admin API to update user password
    const { data, error } = await supabase.auth.admin.updateUserById(
      "b79216d0-d8c7-49dd-8cae-95db14e8abb2", // Your user ID from the debug script
      { password: newPassword }
    );

    if (error) {
      console.error("❌ Failed to update password:", error.message);
    } else {
      console.log("✅ Password updated successfully!");
      console.log("🎉 You can now sign in with your new password");
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${newPassword}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

forceResetPassword();
