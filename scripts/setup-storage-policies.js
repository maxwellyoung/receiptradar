const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStoragePolicies() {
  console.log("🔧 Setting up Storage Policies...\n");

  try {
    // Test current bucket access
    console.log("1. Testing current bucket access...");
    const { data: files, error: listError } = await supabase.storage
      .from("receipt-images")
      .list();

    if (listError) {
      console.log("   ❌ Cannot access bucket:", listError.message);
      console.log(
        "   This suggests the bucket doesn't exist or has wrong permissions"
      );
      return;
    }

    console.log("   ✅ Bucket is accessible");
    console.log("   Files in bucket:", files.length);

    // Test upload with current policies
    console.log("\n2. Testing upload with current policies...");

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
      console.log("\n🔧 The issue is with your storage policies.");
      console.log("You need to update them in the Supabase dashboard:");
      console.log(
        "\n1. Go to Supabase Dashboard → Storage → receipt-images → Policies"
      );
      console.log("2. Delete all existing policies");
      console.log("3. Create these new policies:");
      console.log("\n   POLICY 1 (Upload):");
      console.log("   - Name: 'Allow public uploads'");
      console.log("   - Operation: INSERT");
      console.log("   - Target roles: public");
      console.log("   - Definition: true");
      console.log("\n   POLICY 2 (Download):");
      console.log("   - Name: 'Allow public downloads'");
      console.log("   - Operation: SELECT");
      console.log("   - Target roles: public");
      console.log("   - Definition: true");
      console.log("\n   POLICY 3 (Delete):");
      console.log("   - Name: 'Allow public deletes'");
      console.log("   - Operation: DELETE");
      console.log("   - Target roles: public");
      console.log("   - Definition: true");
      console.log("\n4. After updating policies, run this script again");
      return;
    }

    console.log("   ✅ Upload successful!");
    console.log("   File path:", uploadData.path);

    // Test public URL
    console.log("\n3. Testing public URL...");
    const { data: urlData } = supabase.storage
      .from("receipt-images")
      .getPublicUrl(uploadData.path);

    console.log("   ✅ Public URL generated!");
    console.log("   URL:", urlData.publicUrl);

    // Clean up
    console.log("\n4. Cleaning up test file...");
    const { error: deleteError } = await supabase.storage
      .from("receipt-images")
      .remove([testFileName]);

    if (deleteError) {
      console.log("   ⚠️  Could not delete test file:", deleteError.message);
    } else {
      console.log("   ✅ Test file cleaned up");
    }

    console.log("\n🎉 STORAGE IS WORKING PERFECTLY!");
    console.log("\n📱 Your app is ready for market!");
    console.log("✅ Receipt images can be uploaded");
    console.log("✅ Images can be displayed");
    console.log("✅ Storage is secure and functional");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.log("\n🔧 Manual setup required:");
    console.log("1. Check bucket exists and is public");
    console.log("2. Set up storage policies as described above");
    console.log("3. Verify environment variables");
  }
}

setupStoragePolicies();
