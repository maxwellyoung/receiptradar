#!/usr/bin/env node

// Script to set up production database
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupProductionDatabase() {
  try {
    console.log("Setting up production database...");

    // Create test user
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
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
      console.error("Error creating user:", userError);
      return;
    }

    console.log("✅ User created/updated:", user);

    // Test household creation
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        name: "Production Test Household",
        owner_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      })
      .select()
      .single();

    if (householdError) {
      console.error("Error creating household:", householdError);
      return;
    }

    console.log("✅ Household created:", household);

    // Add user to household
    const { error: memberError } = await supabase
      .from("household_users")
      .insert({
        user_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        household_id: household.id,
      });

    if (memberError) {
      console.error("Error adding user to household:", memberError);
      return;
    }

    console.log("✅ User added to household");
    console.log("🎉 Production database setup complete!");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

setupProductionDatabase();
