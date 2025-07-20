const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStorageBucket() {
  console.log("🪣 Creating storage bucket...\n");

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Failed to list buckets:", listError);
      return;
    }

    const existingBucket = buckets.find(
      (bucket) => bucket.name === "receipt-images"
    );

    if (existingBucket) {
      console.log("✅ receipt-images bucket already exists");
      return;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(
      "receipt-images",
      {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        fileSizeLimit: 5242880, // 5MB
      }
    );

    if (error) {
      console.error("❌ Failed to create bucket:", error);
      console.log("\n📝 Manual steps:");
      console.log("1. Go to Supabase Dashboard → Storage");
      console.log('2. Click "Create a new bucket"');
      console.log('3. Name: "receipt-images"');
      console.log("4. Check 'Public bucket'");
      console.log("5. Click 'Create bucket'");
      return;
    }

    console.log("✅ receipt-images bucket created successfully!");

    // Set up storage policies
    console.log("\n🔒 Setting up storage policies...");

    const policies = [
      {
        name: "Allow authenticated uploads",
        definition:
          "CREATE POLICY \"Allow authenticated uploads\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipt-images' AND auth.role() = 'authenticated');",
      },
      {
        name: "Allow authenticated downloads",
        definition:
          "CREATE POLICY \"Allow authenticated downloads\" ON storage.objects FOR SELECT USING (bucket_id = 'receipt-images' AND auth.role() = 'authenticated');",
      },
      {
        name: "Allow authenticated updates",
        definition:
          "CREATE POLICY \"Allow authenticated updates\" ON storage.objects FOR UPDATE USING (bucket_id = 'receipt-images' AND auth.role() = 'authenticated');",
      },
      {
        name: "Allow authenticated deletes",
        definition:
          "CREATE POLICY \"Allow authenticated deletes\" ON storage.objects FOR DELETE USING (bucket_id = 'receipt-images' AND auth.role() = 'authenticated');",
      },
    ];

    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc("exec_sql", {
          sql: policy.definition,
        });

        if (policyError) {
          console.log(`⚠️  ${policy.name}: ${policyError.message}`);
        } else {
          console.log(`✅ ${policy.name}`);
        }
      } catch (e) {
        console.log(`⚠️  ${policy.name}: Manual setup required`);
      }
    }

    console.log("\n🎉 Storage setup complete!");
    console.log("\n📱 Next steps:");
    console.log("1. Test the app at http://localhost:8082");
    console.log("2. Sign up with a new email");
    console.log("3. Try scanning a receipt");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    console.log("\n📝 Manual setup required:");
    console.log("1. Go to Supabase Dashboard → Storage");
    console.log('2. Create bucket named "receipt-images"');
    console.log("3. Make it public");
    console.log("4. Set up storage policies manually");
  }
}

createStorageBucket();
