const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Testing ReceiptRadar MVP Status...\n");

// Test 1: Environment Variables
console.log("1. Environment Variables:");
console.log(`   Supabase URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`);
console.log(`   Supabase Key: ${supabaseKey ? "✅ Set" : "❌ Missing"}`);

if (!supabaseUrl || !supabaseKey) {
  console.log("\n❌ Missing environment variables. Check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMVPStatus() {
  try {
    // Test 2: Database Connection
    console.log("\n2. Database Connection:");
    const { data: tables, error: tablesError } = await supabase
      .from("receipts")
      .select("count")
      .limit(1);

    if (tablesError) {
      console.log(`   ❌ Database connection failed: ${tablesError.message}`);
    } else {
      console.log("   ✅ Database connection successful");
    }

    // Test 3: Check Tables Exist
    console.log("\n3. Database Tables:");

    const tablesToCheck = [
      "users",
      "receipts",
      "items",
      "categories",
      "stores",
    ];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: exists`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

    // Test 4: Check RLS Status
    console.log("\n4. Row Level Security:");

    // Try to insert a test category
    const { error: categoryError } = await supabase
      .from("categories")
      .insert([{ name: "Test Category", color: "#FF0000" }]);

    if (categoryError && categoryError.message.includes("row-level security")) {
      console.log("   ❌ RLS is blocking category creation");
    } else if (categoryError) {
      console.log(`   ⚠️  Category creation failed: ${categoryError.message}`);
    } else {
      console.log("   ✅ Categories table allows inserts");
    }

    // Test 5: Storage Bucket
    console.log("\n5. Storage Bucket:");
    try {
      const { data: files, error } = await supabase.storage
        .from("receipt-images")
        .list();

      if (error) {
        console.log("   ❌ receipt-images bucket missing or inaccessible");
      } else {
        console.log("   ✅ receipt-images bucket accessible");
        console.log("   Files in bucket:", files.length);
      }
    } catch (err) {
      console.log("   ❌ receipt-images bucket missing or inaccessible");
    }

    // Test 6: Current Data
    console.log("\n6. Current Data:");

    const { count: userCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: receiptCount } = await supabase
      .from("receipts")
      .select("*", { count: "exact", head: true });

    const { count: categoryCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    const { count: storeCount } = await supabase
      .from("stores")
      .select("*", { count: "exact", head: true });

    console.log(`   Users: ${userCount || 0}`);
    console.log(`   Receipts: ${receiptCount || 0}`);
    console.log(`   Categories: ${categoryCount || 0}`);
    console.log(`   Stores: ${storeCount || 0}`);

    // Summary
    console.log("\n📊 MVP Status Summary:");

    const issues = [];
    if (categoryCount === 0) issues.push("No categories seeded");
    if (storeCount === 0) issues.push("No stores seeded");
    if (userCount === 0) issues.push("No users created");

    if (issues.length === 0) {
      console.log("   🎉 MVP is ready to test!");
      console.log("\n   Next steps:");
      console.log("   1. Open http://localhost:8082");
      console.log("   2. Sign up with a new email");
      console.log("   3. Try scanning a receipt");
    } else {
      console.log("   ⚠️  Issues found:");
      issues.forEach((issue) => console.log(`      - ${issue}`));
      console.log("\n   💡 Run the database fixes from MANUAL_DATABASE_FIX.md");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testMVPStatus();
