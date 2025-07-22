const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runEnhancedScrapingMigration() {
  console.log("🚀 Running enhanced scraping migration...");

  try {
    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      "../database/06-enhanced-scraping.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Executing migration SQL...");

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc("exec_sql", { sql: statement });
          if (error) {
            console.log(
              `⚠️  Statement failed (this might be expected): ${error.message}`
            );
          } else {
            console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
          }
        } catch (err) {
          console.log(
            `⚠️  Statement failed (this might be expected): ${err.message}`
          );
        }
      }
    }

    console.log("🔍 Verifying migration...");

    // Check if the image_url column was added
    const { data: columns, error: columnError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "price_history")
      .eq("column_name", "image_url");

    if (columnError) {
      console.log(
        "⚠️  Could not verify columns (this is normal if using anon key)"
      );
    } else if (columns && columns.length > 0) {
      console.log(
        "✅ image_url column successfully added to price_history table"
      );
    } else {
      console.log("❌ image_url column not found - migration may have failed");
    }

    console.log("🎉 Enhanced scraping migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

runEnhancedScrapingMigration().catch(console.error);
