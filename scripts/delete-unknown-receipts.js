const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUnknownReceipts() {
  try {
    console.log('🔍 Finding receipts with "Unknown Store"...');

    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("id, store_name, total_amount")
      .eq("store_name", "Unknown Store");

    if (error) {
      console.error("❌ Error fetching receipts:", error);
      return;
    }

    console.log(`📊 Found ${receipts.length} receipts with "Unknown Store"`);

    if (receipts.length === 0) {
      console.log("✅ No unknown receipts to delete");
      return;
    }

    // Delete each receipt
    for (const receipt of receipts) {
      console.log(
        `🗑️  Deleting receipt ${receipt.id} (${receipt.store_name}, $${receipt.total_amount})`
      );

      const { error: deleteError } = await supabase
        .from("receipts")
        .delete()
        .eq("id", receipt.id);

      if (deleteError) {
        console.error(`❌ Error deleting receipt ${receipt.id}:`, deleteError);
      } else {
        console.log(`✅ Deleted receipt ${receipt.id}`);
      }
    }

    console.log("🎉 Finished deleting unknown receipts");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

deleteUnknownReceipts();
