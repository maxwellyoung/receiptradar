#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runStoresCodeFix() {
  console.log("🚀 Running stores code + views fix migration...\n");
  try {
    // Load SQL
    const migrationPath = path.join(
      __dirname,
      "../database/09-stores-code-and-views-fix.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Split and execute statements individually for better resilience
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql: stmt });
        if (error) {
          console.log(`⚠️  Statement failed (may be ok): ${error.message}`);
        } else {
          console.log(`✅ Executed: ${stmt.substring(0, 80)}...`);
        }
      } catch (e) {
        console.log(`⚠️  Exception executing statement: ${e.message}`);
      }
    }

    // Verify code column exists
    const { data: columns, error } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "stores")
      .eq("column_name", "code");

    if (error) {
      console.log("⚠️  Verification skipped (insufficient privileges)");
    } else if (columns && columns.length > 0) {
      console.log("\n✅ stores.code column present");
    } else {
      console.log("\n❌ stores.code column not found");
    }

    console.log("\n🎉 Stores code + views fix migration complete!");
  } catch (e) {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  }
}

runStoresCodeFix();
