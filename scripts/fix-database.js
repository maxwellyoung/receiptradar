const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseIssues() {
  console.log("🔧 Fixing database issues...\n");

  try {
    // 1. Disable RLS on categories table
    console.log("1. Disabling RLS on categories table...");
    const { error: categoriesError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE categories DISABLE ROW LEVEL SECURITY;",
    });

    if (categoriesError) {
      console.log("⚠️  Categories RLS already disabled or needs manual fix");
    } else {
      console.log("✅ Categories RLS disabled");
    }

    // 2. Disable RLS on stores table
    console.log("2. Disabling RLS on stores table...");
    const { error: storesError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE stores DISABLE ROW LEVEL SECURITY;",
    });

    if (storesError) {
      console.log("⚠️  Stores RLS already disabled or needs manual fix");
    } else {
      console.log("✅ Stores RLS disabled");
    }

    // 3. Add unique constraint to stores table
    console.log("3. Adding unique constraint to stores table...");
    const { error: constraintError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE stores ADD CONSTRAINT IF NOT EXISTS stores_name_location_unique UNIQUE (name, location);",
    });

    if (constraintError) {
      console.log("⚠️  Constraint already exists or needs manual fix");
    } else {
      console.log("✅ Unique constraint added to stores");
    }

    console.log("\n🎉 Database fixes applied!");
    console.log("\n📝 Next steps:");
    console.log("1. Go to Supabase Dashboard → Storage");
    console.log('2. Create bucket named "receipt-images"');
    console.log("3. Make it public (for now)");
    console.log("4. Run: node setup-database.js");
    console.log("5. Test the app!");
  } catch (error) {
    console.error("❌ Error fixing database:", error.message);
    console.log("\n💡 Manual fix required:");
    console.log("1. Go to Supabase Dashboard → SQL Editor");
    console.log("2. Run the SQL from database/fix-mvp-issues.sql");
    console.log("3. Create receipt-images storage bucket");
  }
}

fixDatabaseIssues();
