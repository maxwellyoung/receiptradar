const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReceipts() {
  try {
    console.log("🔍 Checking all receipts in database...");

    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("id, store_name, total_amount, user_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching receipts:", error);
      return;
    }

    console.log(`📊 Found ${receipts.length} total receipts`);

    if (receipts.length === 0) {
      console.log("✅ Database is empty");
      return;
    }

    console.log("\n📋 Receipt details:");
    receipts.forEach((receipt, index) => {
      console.log(`${index + 1}. ID: ${receipt.id}`);
      console.log(`   Store: "${receipt.store_name}"`);
      console.log(`   Amount: $${receipt.total_amount}`);
      console.log(`   User: ${receipt.user_id}`);
      console.log(`   Created: ${receipt.created_at}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

checkReceipts();
