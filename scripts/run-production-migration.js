#!/usr/bin/env node

// Script to run the production migration
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runProductionMigration() {
  try {
    console.log("Running production migration...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../database/08-fix-users-auth-relation.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Migration SQL loaded, executing...");

    // Execute the migration
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      console.error("Migration failed:", error);
      return;
    }

    console.log("✅ Migration completed successfully!");
    console.log("Result:", data);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runProductionMigration();
