const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function debugUser() {
  try {
    console.log("🔍 Debugging user authentication...");

    // Get current user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("❌ Error getting user:", error);
      return;
    }

    if (!user) {
      console.log("❌ No user authenticated");
      console.log(
        "This explains why you might see mock data - the app is not fetching real receipts for any user"
      );
      return;
    }

    console.log("✅ User authenticated:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email confirmed: ${!!user.email_confirmed_at}`);

    // Now let's check receipts for this specific user
    const { data: userReceipts, error: receiptsError } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (receiptsError) {
      console.error("❌ Error fetching user receipts:", receiptsError);
      return;
    }

    console.log(`\n📊 User has ${userReceipts.length} receipts:`);

    if (userReceipts.length === 0) {
      console.log("✅ No receipts found for this user");
      console.log(
        'The "Demo Store" data you see must be coming from mock data generation in the UI'
      );
    } else {
      userReceipts.forEach((receipt, index) => {
        console.log(`\n${index + 1}. Receipt ID: ${receipt.id}`);
        console.log(`   Store: ${receipt.store_name}`);
        console.log(`   Amount: $${receipt.total_amount}`);
        console.log(`   Date: ${receipt.date}`);
      });
    }
  } catch (error) {
    console.error("❌ Error debugging user:", error);
  }
}

// Run the debug script
debugUser();
