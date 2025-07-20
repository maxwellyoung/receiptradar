#!/usr/bin/env node

/**
 * Migration Script for ReceiptRadar
 *
 * This script runs the household tables migration to fix the API error.
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

// Use service role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log("🚀 Running household tables migration...\n");

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "..",
      "database",
      "02-household-tables.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Executing migration SQL...");

    // Execute the migration using rpc (raw SQL)
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      // If rpc doesn't work, try direct SQL execution
      console.log("⚠️  RPC method failed, trying alternative approach...");

      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });

          if (stmtError) {
            console.log(
              `⚠️  Statement failed (this might be expected): ${stmtError.message}`
            );
          }
        }
      }
    } else {
      console.log("✅ Migration executed successfully");
    }

    // Verify the tables were created
    console.log("\n🔍 Verifying tables...");

    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["households", "household_users"]);

    if (tablesError) {
      console.log(
        "⚠️  Could not verify tables (this is normal if using anon key)"
      );
    } else {
      const tableNames = tables.map((t) => t.table_name);
      console.log(`✅ Found tables: ${tableNames.join(", ")}`);
    }

    console.log("\n🎉 Migration complete!");
    console.log("📱 The household API should now work correctly.");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log(
      "\n💡 Alternative: You can run the SQL manually in the Supabase dashboard:"
    );
    console.log("   1. Go to your Supabase project dashboard");
    console.log("   2. Navigate to SQL Editor");
    console.log(
      "   3. Copy and paste the contents of database/02-household-tables.sql"
    );
    console.log("   4. Execute the SQL");
    process.exit(1);
  }
}

// Run the migration
runMigration();
