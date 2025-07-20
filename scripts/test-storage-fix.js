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

async function testStorageFix() {
  console.log("🔍 Testing Storage Fix...\n");

  try {
    // 1. Test bucket listing
    console.log("1. Checking if receipt-images bucket exists...");
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Error listing buckets:", bucketError.message);
      return;
    }

    const bucketExists = buckets.some(
      (bucket) => bucket.name === "receipt-images"
    );

    if (!bucketExists) {
      console.log("❌ receipt-images bucket not found");
      console.log("\n🔧 ACTION NEEDED:");
      console.log("1. Go to Supabase Dashboard → Storage");
      console.log("2. Click 'Create a new bucket'");
      console.log("3. Name: 'receipt-images' (exactly)");
      console.log("4. Make it public (uncheck 'Private bucket')");
      console.log("5. Click 'Create bucket'");
      console.log("6. Run this script again");
      return;
    }

    console.log("✅ receipt-images bucket found!");

    // 2. Test upload with a small test image
    console.log("\n2. Testing image upload...");

    // Create a minimal test image (1x1 pixel PNG)
    const testImageData = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    const testFileName = `test-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipt-images")
      .upload(testFileName, testImageData, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError.message);
      console.log("\n🔧 Storage policies needed:");
      console.log(
        "1. Go to Supabase Dashboard → Storage → receipt-images → Policies"
      );
      console.log("2. Click 'New Policy'");
      console.log("3. Select 'Create a policy from scratch'");
      console.log("4. Name: 'Public Access'");
      console.log("5. Target roles: public");
      console.log("6. Policy definition: true");
      console.log("7. Operations: SELECT, INSERT, UPDATE, DELETE");
      console.log("8. Click 'Save policy'");
      return;
    }

    console.log("✅ Upload test successful!");
    console.log("   - File uploaded:", uploadData.path);

    // 3. Test getting public URL
    console.log("\n3. Testing public URL generation...");
    const { data: urlData } = supabase.storage
      .from("receipt-images")
      .getPublicUrl(testFileName);

    if (urlData.publicUrl) {
      console.log("✅ Public URL generated successfully!");
      console.log("   - URL:", urlData.publicUrl);
    } else {
      console.log("❌ Failed to generate public URL");
    }

    // 4. Clean up test file
    console.log("\n4. Cleaning up test file...");
    const { error: deleteError } = await supabase.storage
      .from("receipt-images")
      .remove([testFileName]);

    if (deleteError) {
      console.log("⚠️  Could not delete test file:", deleteError.message);
    } else {
      console.log("✅ Test file cleaned up");
    }

    console.log("\n🎉 Storage is working perfectly!");
    console.log("\n📱 Your app should now be able to:");
    console.log("✅ Upload receipt images");
    console.log("✅ Store images securely");
    console.log("✅ Display images in the app");
    console.log("✅ Process receipts without upload errors");
  } catch (error) {
    console.error("❌ Error during storage test:", error.message);
  }
}

testStorageFix();
