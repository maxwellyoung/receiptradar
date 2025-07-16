#!/usr/bin/env node

/**
 * Database Setup Script for ReceiptRadar
 *
 * This script helps initialize the database with sample data for testing.
 * Run this after setting up your Supabase project.
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

// Configuration - update these with your Supabase credentials
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "your_supabase_url";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your_supabase_anon_key";

if (
  SUPABASE_URL === "your_supabase_url" ||
  SUPABASE_ANON_KEY === "your_supabase_anon_key"
) {
  console.error(
    "❌ Please set your Supabase credentials in environment variables:"
  );
  console.error("   EXPO_PUBLIC_SUPABASE_URL");
  console.error("   EXPO_PUBLIC_SUPABASE_ANON_KEY");
  console.error("");
  console.error("Or update the values in this script.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log("🚀 Setting up ReceiptRadar database...\n");

  try {
    // 1. Seed Categories
    console.log("📂 Seeding categories...");
    const categories = [
      { name: "Fresh Produce", color: "#4CAF50", icon: "local-florist" },
      { name: "Dairy", color: "#2196F3", icon: "local-drink" },
      { name: "Meat", color: "#F44336", icon: "restaurant" },
      { name: "Pantry", color: "#FF9800", icon: "kitchen" },
      { name: "Beverages", color: "#9C27B0", icon: "local-cafe" },
      { name: "Snacks", color: "#795548", icon: "cake" },
      { name: "Frozen", color: "#00BCD4", icon: "ac-unit" },
      { name: "Household", color: "#607D8B", icon: "home" },
    ];

    for (const category of categories) {
      const { error } = await supabase
        .from("categories")
        .upsert(category, { onConflict: "name" });

      if (error) {
        console.error(
          `❌ Error creating category ${category.name}:`,
          error.message
        );
      } else {
        console.log(`✅ Created category: ${category.name}`);
      }
    }

    // 2. Seed Stores
    console.log("\n🏪 Seeding stores...");
    const stores = [
      { name: "Countdown", location: "Auckland" },
      { name: "New World", location: "Auckland" },
      { name: "Pak'nSave", location: "Auckland" },
      { name: "Four Square", location: "Auckland" },
      { name: "Fresh Choice", location: "Auckland" },
      { name: "Super Value", location: "Auckland" },
    ];

    for (const store of stores) {
      const { error } = await supabase
        .from("stores")
        .upsert(store, { onConflict: "name" });

      if (error) {
        console.error(`❌ Error creating store ${store.name}:`, error.message);
      } else {
        console.log(`✅ Created store: ${store.name}`);
      }
    }

    // 3. Create a test user (if you want to test with sample data)
    console.log("\n👤 Creating test user...");
    const testUser = {
      email: "test@receiptradar.com",
      password: "testpassword123",
    };

    const { data: authData, error: authError } = await supabase.auth.signUp(
      testUser
    );

    if (authError) {
      console.error("❌ Error creating test user:", authError.message);
      console.log(
        "💡 You can create a user manually through the app or Supabase dashboard."
      );
    } else {
      console.log("✅ Created test user:", testUser.email);
      console.log("   Password:", testUser.password);
    }

    console.log("\n🎉 Database setup complete!");
    console.log("\n📱 Next steps:");
    console.log("   1. Start your app: npx expo start");
    console.log("   2. Sign in with the test user or create a new account");
    console.log("   3. Start scanning receipts to see real data in action!");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
