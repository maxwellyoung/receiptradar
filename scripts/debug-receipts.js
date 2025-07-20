const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function debugReceipts() {
  try {
    console.log("🔍 Debugging receipts in database...");

    // Get all receipts (without user filter to see everything)
    const { data: allReceipts, error } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error fetching receipts:", error);
      return;
    }

    console.log(`📊 Found ${allReceipts.length} receipts in database:`);

    if (allReceipts.length === 0) {
      console.log("✅ No receipts found - database is clean");
      return;
    }

    allReceipts.forEach((receipt, index) => {
      console.log(`\n${index + 1}. Receipt ID: ${receipt.id}`);
      console.log(`   User ID: ${receipt.user_id}`);
      console.log(`   Store: ${receipt.store_name}`);
      console.log(`   Amount: $${receipt.total_amount}`);
      console.log(`   Date: ${receipt.date}`);
      console.log(`   Created: ${receipt.created_at}`);
    });

    // Check if there are any "Demo Store" receipts
    const demoReceipts = allReceipts.filter(
      (r) => r.store_name === "Demo Store"
    );
    if (demoReceipts.length > 0) {
      console.log(`\n⚠️  Found ${demoReceipts.length} "Demo Store" receipts!`);
      console.log("These should be removed or replaced with real data.");
    }
  } catch (error) {
    console.error("❌ Error debugging receipts:", error);
  }
}

// Run the debug script
debugReceipts();
