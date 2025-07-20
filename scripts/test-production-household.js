#!/usr/bin/env node

// Script to test household creation in production
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testProductionHousehold() {
  try {
    console.log("Testing household creation in production...");

    const userId = "7201cf76-20c8-4253-9051-95e710fd7544";

    // Create household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        name: "Production Test Household",
        owner_id: userId,
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
        user_id: userId,
        household_id: household.id,
      });

    if (memberError) {
      console.error("Error adding user to household:", memberError);
      return;
    }

    console.log("✅ User added to household");
    console.log("🎉 Production household creation works!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testProductionHousehold();
