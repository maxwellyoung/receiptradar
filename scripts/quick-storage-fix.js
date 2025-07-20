const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log("Please check your .env.local file has:");
  console.log("- EXPO_PUBLIC_SUPABASE_URL");
  console.log("- EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickStorageFix() {
  console.log("🚀 Quick Storage Fix for ReceiptRadar\n");
  console.log("This will fix the 'Failed to upload image' error\n");

  try {
    // Check current status
    console.log("🔍 Checking current storage status...");
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Error accessing Supabase:", error.message);
      return;
    }

    const bucketExists = buckets.some(
      (bucket) => bucket.name === "receipt-images"
    );

    if (bucketExists) {
      console.log("✅ receipt-images bucket already exists!");
      console.log("Testing upload functionality...");

      // Test upload
      const testImageData = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        "base64"
      );

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipt-images")
        .upload(`test-${Date.now()}.png`, testImageData, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.log("❌ Upload failed - storage policies need setup");
        console.log("\n🔧 QUICK FIX:");
        console.log(
          "1. Go to: https://supabase.com/dashboard/project/cihuylmusthumxpuexrl/storage/policies"
        );
        console.log("2. Click 'New Policy'");
        console.log("3. Select 'Create a policy from scratch'");
        console.log("4. Name: 'Public Access'");
        console.log("5. Target roles: public");
        console.log("6. Policy definition: true");
        console.log("7. Operations: SELECT, INSERT, UPDATE, DELETE");
        console.log("8. Click 'Save policy'");
        console.log("9. Run this script again");
      } else {
        console.log("✅ Upload works! Cleaning up test file...");
        await supabase.storage.from("receipt-images").remove([uploadData.path]);
        console.log("🎉 Storage is working perfectly!");
        console.log(
          "Your app should now process receipts without upload errors."
        );
      }
    } else {
      console.log("❌ receipt-images bucket not found");
      console.log("\n🔧 QUICK FIX:");
      console.log(
        "1. Go to: https://supabase.com/dashboard/project/cihuylmusthumxpuexrl/storage/buckets"
      );
      console.log("2. Click 'Create a new bucket'");
      console.log("3. Name: receipt-images (exactly)");
      console.log("4. Make it public (uncheck 'Private bucket')");
      console.log("5. Click 'Create bucket'");
      console.log("6. Run this script again to test");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

quickStorageFix();
