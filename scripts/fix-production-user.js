#!/usr/bin/env node

// Script to fix the user profile in production
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixProductionUser() {
  try {
    console.log("Fixing user profile in production...");

    const userId = "7201cf76-20c8-4253-9051-95e710fd7544";

    // First, let's try to drop the foreign key constraint if it exists
    console.log("Attempting to drop foreign key constraint...");
    try {
      await supabase.rpc("exec_sql", {
        sql: "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;",
      });
      console.log("✅ Foreign key constraint dropped");
    } catch (error) {
      console.log(
        "Could not drop constraint (might not exist):",
        error.message
      );
    }

    // Now try to create the user profile
    console.log("Creating user profile...");
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          email: "testuser@receiptradar.app",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (userError) {
      console.error("Error creating user profile:", userError);
      return;
    }

    console.log("✅ User profile created/updated:", user);

    // Now try to recreate the foreign key constraint
    console.log("Recreating foreign key constraint...");
    try {
      await supabase.rpc("exec_sql", {
        sql: "ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;",
      });
      console.log("✅ Foreign key constraint recreated");
    } catch (error) {
      console.log("Could not recreate constraint:", error.message);
    }
  } catch (error) {
    console.error("Fix failed:", error);
  }
}

fixProductionUser();
