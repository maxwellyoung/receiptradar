const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 STORAGE DIAGNOSTIC REPORT");
console.log("============================\n");

// 1. Environment Variables Check
console.log("1. ENVIRONMENT VARIABLES:");
console.log(
  "   Supabase URL:",
  supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "❌ MISSING"
);
console.log(
  "   Supabase Key:",
  supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "❌ MISSING"
);
console.log(
  "   .env.local loaded:",
  !!process.env.EXPO_PUBLIC_SUPABASE_URL ? "✅" : "❌"
);
console.log("");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL: Missing environment variables");
  console.log("   Check your .env.local file contains:");
  console.log("   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url");
  console.log("   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseStorage() {
  try {
    // 2. Test Supabase Connection
    console.log("2. SUPABASE CONNECTION TEST:");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.log("   Auth test:", "❌", authError.message);
    } else {
      console.log("   Auth test:", "✅ Connected successfully");
    }

    // 3. List All Buckets
    console.log("\n3. STORAGE BUCKETS:");
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.log("   List buckets:", "❌", listError.message);
      console.log("   Error code:", listError.statusCode);
      console.log("   Error details:", listError.details);
    } else {
      console.log("   List buckets:", "✅ Success");
      console.log("   Total buckets found:", buckets.length);

      if (buckets.length === 0) {
        console.log("   ⚠️  No buckets found - this might be the issue!");
      } else {
        console.log("   Available buckets:");
        buckets.forEach((bucket, index) => {
          console.log(
            `     ${index + 1}. "${bucket.name}" (public: ${bucket.public})`
          );
        });
      }
    }

    // 4. Test Specific Bucket Names
    console.log("\n4. BUCKET NAME VARIATIONS TEST:");
    const possibleNames = [
      "receipt-images",
      "receipt_images",
      "receiptimages",
      "receipt-images-bucket",
      "images",
      "receipts",
      "receipt",
    ];

    for (const name of possibleNames) {
      try {
        const { data: files, error } = await supabase.storage.from(name).list();
        if (!error) {
          console.log(`   ✅ Found bucket: "${name}" (${files.length} files)`);
        }
      } catch (e) {
        // Bucket doesn't exist or no access
      }
    }

    // 5. Test Storage Permissions
    console.log("\n5. STORAGE PERMISSIONS TEST:");

    // Try to create a test bucket to see if we have permissions
    const testBucketName = `test-bucket-${Date.now()}`;
    const { data: createData, error: createError } =
      await supabase.storage.createBucket(testBucketName, {
        public: false,
      });

    if (createError) {
      console.log("   Create bucket permission:", "❌", createError.message);
      console.log(
        "   This suggests permission issues with the current API key"
      );
    } else {
      console.log("   Create bucket permission:", "✅ Can create buckets");

      // Clean up test bucket
      await supabase.storage.deleteBucket(testBucketName);
    }

    // 6. Test with Service Role (if available)
    console.log("\n6. SERVICE ROLE TEST:");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceKey) {
      console.log("   Service role key available, testing...");
      const serviceSupabase = createClient(supabaseUrl, serviceKey);

      const { data: serviceBuckets, error: serviceError } =
        await serviceSupabase.storage.listBuckets();

      if (serviceError) {
        console.log("   Service role test:", "❌", serviceError.message);
      } else {
        console.log("   Service role test:", "✅ Success");
        console.log(
          "   Service role buckets:",
          serviceBuckets.map((b) => b.name)
        );
      }
    } else {
      console.log("   Service role key not available (this is normal)");
    }

    // 7. Project Information
    console.log("\n7. PROJECT INFORMATION:");
    console.log("   Project URL:", supabaseUrl);
    console.log(
      "   Project ID:",
      supabaseUrl.split("//")[1]?.split(".")[0] || "Unknown"
    );

    // Try to get project info
    try {
      const { data: projectInfo } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .limit(1);
      console.log("   Database access:", projectInfo ? "✅" : "❌");
    } catch (e) {
      console.log("   Database access:", "❌", e.message);
    }

    // 8. Recommendations
    console.log("\n8. RECOMMENDATIONS:");

    if (buckets.length === 0) {
      console.log("   🔧 ACTION NEEDED: Create the receipt-images bucket");
      console.log("   1. Go to Supabase Dashboard → Storage");
      console.log("   2. Click 'Create a new bucket'");
      console.log("   3. Name: 'receipt-images' (exactly)");
      console.log("   4. Check 'Public bucket'");
      console.log("   5. Click 'Create bucket'");
    } else {
      const receiptBucket = buckets.find((b) => b.name === "receipt-images");
      if (!receiptBucket) {
        console.log("   🔧 ACTION NEEDED: Bucket name mismatch");
        console.log(
          "   Available buckets:",
          buckets.map((b) => b.name)
        );
        console.log("   Expected: 'receipt-images'");
        console.log(
          "   Check the exact bucket name in your Supabase dashboard"
        );
      } else {
        console.log("   ✅ Bucket exists and is accessible");
        console.log("   Next: Test upload functionality");
      }
    }
  } catch (error) {
    console.error("❌ DIAGNOSTIC ERROR:", error);
    console.log("\n🔧 MANUAL TROUBLESHOOTING:");
    console.log("1. Check Supabase project is active");
    console.log("2. Verify environment variables");
    console.log("3. Check network connectivity");
    console.log("4. Try creating bucket manually in dashboard");
  }
}

diagnoseStorage();
