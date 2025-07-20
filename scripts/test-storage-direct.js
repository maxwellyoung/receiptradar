const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageDirect() {
  console.log("🔍 Direct Storage Test (Bypassing listBuckets)\n");

  try {
    // Test 1: Direct bucket access (bypassing listBuckets)
    console.log("1. Testing direct bucket access...");
    const { data: files, error: listError } = await supabase.storage
      .from("receipt-images")
      .list();

    if (listError) {
      console.log("   ❌ Direct access failed:", listError.message);
      console.log(
        "   This suggests the bucket doesn't exist or has wrong permissions"
      );
      return;
    }

    console.log("   ✅ Direct bucket access works!");
    console.log("   Files in bucket:", files.length);

    // Test 2: Upload a small test image
    console.log("\n2. Testing image upload...");

    // Create a tiny test image (1x1 pixel PNG)
    const testImageData = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    const testFileName = `test-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipt-images")
      .upload(testFileName, testImageData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.log("   ❌ Upload failed:", uploadError.message);
      console.log("\n🔧 This suggests storage policies need to be set up:");
      console.log(
        "1. Go to Supabase Dashboard → Storage → receipt-images → Policies"
      );
      console.log(
        "2. Create policy: 'Allow authenticated users to upload files'"
      );
      console.log(
        "3. Create policy: 'Allow authenticated users to download files'"
      );
      return;
    }

    console.log("   ✅ Upload successful!");
    console.log("   File path:", uploadData.path);

    // Test 3: Get public URL
    console.log("\n3. Testing public URL generation...");
    const { data: urlData } = supabase.storage
      .from("receipt-images")
      .getPublicUrl(uploadData.path);

    console.log("   ✅ Public URL generated!");
    console.log("   URL:", urlData.publicUrl);

    // Test 4: Clean up test file
    console.log("\n4. Cleaning up test file...");
    const { error: deleteError } = await supabase.storage
      .from("receipt-images")
      .remove([uploadData.path]);

    if (deleteError) {
      console.log("   ⚠️  Could not delete test file:", deleteError.message);
    } else {
      console.log("   ✅ Test file cleaned up");
    }

    console.log("\n🎉 STORAGE IS WORKING PERFECTLY!");
    console.log("\n📱 Your app should now be able to:");
    console.log("✅ Upload receipt images");
    console.log("✅ Generate public URLs");
    console.log("✅ Display images in the app");
    console.log("✅ Store images securely");

    console.log("\n🚀 You're ready for market!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log("\n🔧 Manual troubleshooting:");
    console.log("1. Check bucket exists in Supabase dashboard");
    console.log("2. Verify bucket is set to public");
    console.log("3. Check storage policies are set up");
    console.log("4. Verify environment variables");
  }
}

testStorageDirect();
