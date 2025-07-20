#!/usr/bin/env node

/**
 * Manual Password Reset Script
 *
 * Use this script to reset your password using the token from the email
 * Copy the access_token from the email URL and paste it when prompted
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const readline = require("readline");

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetPassword() {
  console.log("🔐 Manual Password Reset\n");

  try {
    // Get the access token from user
    const accessToken = await new Promise((resolve) => {
      rl.question("Enter the access_token from the email URL: ", resolve);
    });

    // Get the new password
    const newPassword = await new Promise((resolve) => {
      rl.question("Enter your new password (min 6 characters): ", resolve);
    });

    if (newPassword.length < 6) {
      console.error("❌ Password must be at least 6 characters");
      rl.close();
      return;
    }

    console.log("\n🔄 Resetting password...");

    // Clean the access token (remove any extra characters)
    const cleanToken = accessToken.trim().split("&")[0];

    console.log("🔍 Using token:", cleanToken.substring(0, 50) + "...");

    // Set the session with the access token
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: cleanToken,
        refresh_token: "dummy", // We don't need the refresh token for this
      });

    if (sessionError) {
      console.error("❌ Invalid or expired token:", sessionError.message);
      rl.close();
      return;
    }

    // Update the password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("❌ Failed to update password:", error.message);
    } else {
      console.log("✅ Password updated successfully!");
      console.log("🎉 You can now sign in with your new password");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

resetPassword();
