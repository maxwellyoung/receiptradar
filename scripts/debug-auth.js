#!/usr/bin/env node

/**
 * Debug Authentication Script
 *
 * This script helps diagnose authentication issues by checking user status
 * and providing helpful information about what might be wrong.
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugAuth() {
  console.log("🔍 Debugging Authentication Issues...\n");

  try {
    // Get all users from auth.users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("❌ Error fetching users:", usersError.message);
      return;
    }

    console.log(`📊 Found ${users.users.length} users in the system:\n`);

    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(
        `   Email confirmed: ${user.email_confirmed_at ? "✅ Yes" : "❌ No"}`
      );
      console.log(
        `   Last sign in: ${
          user.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString()
            : "Never"
        }`
      );
      console.log(`   Provider: ${user.app_metadata?.provider || "email"}`);
      console.log(
        `   Has password: ${user.encrypted_password ? "✅ Yes" : "❌ No"}`
      );
      console.log("");
    });

    // Check if there are any users without passwords
    const usersWithoutPassword = users.users.filter(
      (user) => !user.encrypted_password
    );
    if (usersWithoutPassword.length > 0) {
      console.log(
        "⚠️  Users without passwords (these can't sign in with email/password):"
      );
      usersWithoutPassword.forEach((user) => {
        console.log(
          `   - ${user.email} (created: ${new Date(
            user.created_at
          ).toLocaleDateString()})`
        );
      });
      console.log("");
    }

    // Check if there are any users with unconfirmed emails
    const unconfirmedUsers = users.users.filter(
      (user) => !user.email_confirmed_at
    );
    if (unconfirmedUsers.length > 0) {
      console.log("⚠️  Users with unconfirmed emails:");
      unconfirmedUsers.forEach((user) => {
        console.log(
          `   - ${user.email} (created: ${new Date(
            user.created_at
          ).toLocaleDateString()})`
        );
      });
      console.log("");
    }

    console.log("💡 Troubleshooting Tips:");
    console.log(
      "1. If you see 'Has password: ❌ No', the user was created without a password"
    );
    console.log(
      "2. If you see 'Email confirmed: ❌ No', the user needs to confirm their email"
    );
    console.log(
      "3. Try using the 'Forgot Password' feature to reset your password"
    );
    console.log(
      "4. Make sure you're using the exact email address that was used to create the account"
    );
    console.log(
      "5. Check your email spam folder for confirmation/reset emails"
    );
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugAuth();
