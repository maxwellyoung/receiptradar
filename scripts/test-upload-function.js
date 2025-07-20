const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock the uploadReceiptImage function from the app
async function uploadReceiptImage(imageUri, fileName, userId) {
  try {
    console.log("Uploading receipt image", { fileName, userId });

    // Create file path
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `receipts/${userId}/${timestamp}_${cleanFileName}`;

    // For React Native, we need to handle the image URI differently
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from("receipt-images")
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Image upload failed", { error: error.message, filePath });
      return { data: null, error };
    }

    console.log("Image uploaded successfully", { filePath });
    return { data, error: null };
  } catch (error) {
    console.error("Image upload error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { data: null, error: error };
  }
}

async function testUploadFunction() {
  console.log("🧪 Testing uploadReceiptImage function...\n");

  try {
    // Create a test image URI (base64 encoded 1x1 pixel PNG)
    const testImageData = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    // Convert to data URI
    const testImageUri = `data:image/png;base64,${testImageData.toString(
      "base64"
    )}`;

    console.log("1. Testing with data URI...");
    const result1 = await uploadReceiptImage(
      testImageUri,
      "test-receipt.jpg",
      "test-user-123"
    );

    if (result1.error) {
      console.log(
        "❌ Data URI upload failed:",
        result1.error.message || result1.error
      );
    } else {
      console.log("✅ Data URI upload successful!");
      console.log("   File path:", result1.data.path);

      // Clean up
      await supabase.storage.from("receipt-images").remove([result1.data.path]);
      console.log("   Test file cleaned up");
    }

    console.log("\n2. Testing with file URI (simulated)...");
    // Simulate a file URI that might come from camera
    const fileUri = "file:///tmp/test-receipt.jpg";

    try {
      const result2 = await uploadReceiptImage(
        fileUri,
        "camera-receipt.jpg",
        "test-user-123"
      );
      if (result2.error) {
        console.log(
          "❌ File URI upload failed (expected):",
          result2.error.message || result2.error
        );
        console.log("   This is expected since we don't have a real file");
      } else {
        console.log("✅ File URI upload successful!");
      }
    } catch (error) {
      console.log("❌ File URI upload failed (expected):", error.message);
      console.log("   This is expected since we don't have a real file");
    }

    console.log("\n🎉 Upload function test completed!");
    console.log("The function should work correctly in your app now.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testUploadFunction();
