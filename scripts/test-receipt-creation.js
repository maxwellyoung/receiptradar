const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReceiptCreation() {
  console.log("🧪 Testing Receipt Creation...\n");

  try {
    // 1. Check if there are any users
    console.log("1. Checking users...");
    const { data: users, error: usersError } = await supabase.auth.getUser();

    if (usersError) {
      console.log("❌ No authenticated user found");
      console.log("   Error:", usersError.message);
      console.log("\n🔧 This is likely the issue!");
      console.log(
        "   The app needs a user to be signed in to create receipts."
      );
      console.log("   Try signing up/signing in to the app first.");
      return;
    }

    console.log("✅ User found:", users.user?.email);

    // 2. Test receipt creation with sample data
    console.log("\n2. Testing receipt creation...");
    const testReceiptData = {
      user_id: users.user.id,
      store_name: "Test Store",
      total_amount: 25.5,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      image_url: "https://example.com/test-image.jpg",
      ocr_data: {
        store_name: "Test Store",
        total: 25.5,
        items: [{ name: "Test Item", price: 25.5, quantity: 1 }],
      },
      savings_identified: 0,
      cashback_earned: 0,
    };

    const { data: receipt, error: receiptError } = await supabase
      .from("receipts")
      .insert([testReceiptData])
      .select()
      .single();

    if (receiptError) {
      console.log("❌ Receipt creation failed:");
      console.log("   Error:", receiptError.message);
      console.log("   Code:", receiptError.code);
      console.log("   Details:", receiptError.details);
      console.log("   Hint:", receiptError.hint);

      // Check if it's a foreign key constraint error
      if (receiptError.code === "23503") {
        console.log("\n🔧 This is a foreign key constraint error!");
        console.log("   The user_id might not exist in the users table.");
        console.log("   Or there might be a database schema issue.");
      }

      return;
    }

    console.log("✅ Receipt created successfully!");
    console.log("   Receipt ID:", receipt.id);
    console.log("   Store:", receipt.store_name);
    console.log("   Total:", receipt.total_amount);

    // 3. Clean up test receipt
    console.log("\n3. Cleaning up test receipt...");
    const { error: deleteError } = await supabase
      .from("receipts")
      .delete()
      .eq("id", receipt.id);

    if (deleteError) {
      console.log("⚠️  Could not delete test receipt:", deleteError.message);
    } else {
      console.log("✅ Test receipt cleaned up");
    }

    console.log("\n🎉 Receipt creation is working!");
    console.log("The issue might be with user authentication in your app.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testReceiptCreation();
