const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log("🔍 Testing Storage Setup...\n");

  try {
    // 1. List all buckets
    console.log("1. Listing all buckets...");
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Failed to list buckets:", listError);
      return;
    }

    console.log(
      "✅ Found buckets:",
      buckets.map((b) => b.name)
    );

    const receiptImagesBucket = buckets.find(
      (bucket) => bucket.name === "receipt-images"
    );

    if (!receiptImagesBucket) {
      console.log("❌ receipt-images bucket not found");
      console.log(
        "\n📝 Available buckets:",
        buckets.map((b) => b.name)
      );
      return;
    }

    console.log("✅ receipt-images bucket found!");
    console.log("   - Public:", receiptImagesBucket.public);
    console.log("   - File size limit:", receiptImagesBucket.file_size_limit);
    console.log(
      "   - Allowed MIME types:",
      receiptImagesBucket.allowed_mime_types
    );

    // 2. Test bucket access
    console.log("\n2. Testing bucket access...");
    const { data: files, error: filesError } = await supabase.storage
      .from("receipt-images")
      .list();

    if (filesError) {
      console.error("❌ Failed to list files:", filesError);
      console.log("\n🔧 This might be a permissions issue. Check:");
      console.log("1. Bucket is set to public");
      console.log("2. Storage policies are set up correctly");
      return;
    }

    console.log("✅ Can access bucket files");
    console.log("   - Files in bucket:", files.length);

    // 3. Test upload permissions (with a small test file)
    console.log("\n3. Testing upload permissions...");

    // Create a small test image
    const testImageData = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipt-images")
      .upload("test-image.png", testImageData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError);
      console.log("\n🔧 Storage policies needed:");
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

    console.log("✅ Upload test successful!");
    console.log("   - File uploaded:", uploadData.path);

    // 4. Clean up test file
    console.log("\n4. Cleaning up test file...");
    const { error: deleteError } = await supabase.storage
      .from("receipt-images")
      .remove(["test-image.png"]);

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
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    console.log("\n🔧 Manual setup required:");
    console.log("1. Go to Supabase Dashboard → Storage");
    console.log('2. Create bucket named "receipt-images"');
    console.log("3. Make it public");
    console.log("4. Set up storage policies");
  }
}

testStorage();
