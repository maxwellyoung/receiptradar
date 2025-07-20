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

async function createStorageBucket() {
  console.log("🔧 Creating Storage Bucket...\n");

  try {
    // Note: Creating buckets via the client is not supported in Supabase
    // The user needs to create it manually in the dashboard

    console.log("📋 MANUAL STEPS REQUIRED:");
    console.log("1. Go to your Supabase dashboard");
    console.log("2. Navigate to Storage");
    console.log('3. Click "Create a new bucket"');
    console.log("4. Name it: receipt-images");
    console.log('5. Make it public (uncheck "Private bucket")');
    console.log('6. Click "Create bucket"');
    console.log("\n7. Then set up RLS policies:");
    console.log("   - Go to Storage > Policies");
    console.log('   - Click "New Policy"');
    console.log('   - Select "Create a policy from scratch"');
    console.log('   - Name: "Public Access"');
    console.log("   - Target roles: public");
    console.log("   - Policy definition: true");
    console.log("   - Operations: SELECT, INSERT, DELETE");
    console.log("\n8. Run this script again to test");

    // Test if bucket exists
    console.log("\n🧪 Testing bucket access...");
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Error listing buckets:", error.message);
      return;
    }

    const bucketExists = buckets.some(
      (bucket) => bucket.name === "receipt-images"
    );

    if (bucketExists) {
      console.log('✅ Bucket "receipt-images" exists!');

      // Test upload
      console.log("🧪 Testing upload...");
      const testBlob = new Blob(["test"], { type: "text/plain" });
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipt-images")
        .upload("test.txt", testBlob);

      if (uploadError) {
        console.error("❌ Upload failed:", uploadError.message);
      } else {
        console.log("✅ Upload successful!");

        // Clean up test file
        await supabase.storage.from("receipt-images").remove(["test.txt"]);
        console.log("✅ Test file cleaned up");
      }
    } else {
      console.log('❌ Bucket "receipt-images" not found');
      console.log("Please follow the manual steps above to create it");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createStorageBucket();
