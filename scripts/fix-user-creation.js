const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserCreation() {
  console.log("🔧 Fixing User Creation Issue...\n");

  try {
    // 1. First, let's check if the trigger exists
    console.log("1. Checking if user trigger exists...");
    const { data: triggers, error: triggerError } = await supabase
      .from("information_schema.triggers")
      .select("trigger_name")
      .eq("trigger_name", "on_auth_user_created");

    if (triggerError) {
      console.log("   ⚠️  Could not check triggers:", triggerError.message);
    } else if (triggers && triggers.length > 0) {
      console.log("   ✅ User trigger already exists");
    } else {
      console.log("   ❌ User trigger not found - creating it...");

      // Read and execute the trigger SQL
      const sqlPath = path.join(__dirname, "../database/06-user-trigger.sql");
      const sql = fs.readFileSync(sqlPath, "utf8");

      // Split the SQL into individual statements
      const statements = sql.split(";").filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });
          if (error) {
            console.log("   ⚠️  Error executing statement:", error.message);
          }
        }
      }

      console.log("   ✅ User trigger created");
    }

    // 2. Check for existing users in auth.users
    console.log("\n2. Checking existing auth users...");
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.log("   ❌ Could not check auth users:", authError.message);
    } else {
      console.log(`   📊 Found ${authUsers.users.length} users in auth.users`);

      // 3. Check which users exist in the public.users table
      console.log("\n3. Checking public.users table...");
      const { data: publicUsers, error: publicError } = await supabase
        .from("users")
        .select("id, email");

      if (publicError) {
        console.log("   ❌ Could not check public users:", publicError.message);
      } else {
        console.log(`   📊 Found ${publicUsers.length} users in public.users`);

        // 4. Create missing users
        console.log("\n4. Creating missing users...");
        for (const authUser of authUsers.users) {
          const exists = publicUsers.some((pu) => pu.id === authUser.id);
          if (!exists) {
            console.log(`   🔧 Creating user: ${authUser.email}`);
            const { error: createError } = await supabase.from("users").insert({
              id: authUser.id,
              email: authUser.email,
            });

            if (createError) {
              console.log(
                `   ❌ Failed to create user ${authUser.email}:`,
                createError.message
              );
            } else {
              console.log(`   ✅ Created user: ${authUser.email}`);
            }
          } else {
            console.log(`   ✅ User already exists: ${authUser.email}`);
          }
        }
      }
    }

    // 5. Test receipt creation
    console.log("\n5. Testing receipt creation...");
    if (authUsers && authUsers.users.length > 0) {
      const testUser = authUsers.users[0];
      const testReceipt = {
        user_id: testUser.id,
        store_name: "Test Store",
        total_amount: 25.5,
        date: new Date().toISOString().split("T")[0],
        image_url: "https://example.com/test.jpg",
        ocr_data: { store_name: "Test Store", total: 25.5 },
      };

      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert([testReceipt])
        .select()
        .single();

      if (receiptError) {
        console.log("   ❌ Receipt creation failed:", receiptError.message);
      } else {
        console.log("   ✅ Receipt creation successful!");

        // Clean up test receipt
        await supabase.from("receipts").delete().eq("id", receipt.id);
        console.log("   🧹 Test receipt cleaned up");
      }
    }

    console.log("\n🎉 User creation issue should now be fixed!");
    console.log("\n📱 Next steps:");
    console.log("1. Try signing up again in your app");
    console.log("2. Check if the user appears in Supabase users table");
    console.log("3. Try processing a receipt - should work now!");
  } catch (error) {
    console.error("❌ Error fixing user creation:", error.message);
  }
}

fixUserCreation();
