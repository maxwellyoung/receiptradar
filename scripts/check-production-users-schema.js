#!/usr/bin/env node

// Script to check the exact schema of the users table in production
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkProductionUsersSchema() {
  try {
    console.log("Checking production users table schema...");

    // Get table constraints
    const { data: constraints, error: constraintsError } = await supabase
      .rpc("get_table_constraints", { table_name: "users" })
      .select("*");

    if (constraintsError) {
      console.log(
        "Could not get constraints directly, trying alternative approach..."
      );
    } else {
      console.log("Table constraints:", constraints);
    }

    // Try to get foreign key information
    const { data: foreignKeys, error: fkError } = await supabase
      .from("information_schema.key_column_usage")
      .select("*")
      .eq("table_name", "users")
      .eq("constraint_name", "users_id_fkey");

    if (fkError) {
      console.log("Could not get foreign key info:", fkError);
    } else {
      console.log("Foreign key info:", foreignKeys);
    }

    // Check if there's a trigger or function that creates users
    const { data: triggers, error: triggerError } = await supabase
      .from("information_schema.triggers")
      .select("*")
      .eq("event_object_table", "users");

    if (triggerError) {
      console.log("Could not get triggers:", triggerError);
    } else {
      console.log("Triggers on users table:", triggers);
    }

    // Try to see if there's a function that handles user creation
    const { data: functions, error: funcError } = await supabase
      .from("information_schema.routines")
      .select("*")
      .ilike("routine_name", "%user%");

    if (funcError) {
      console.log("Could not get functions:", funcError);
    } else {
      console.log("User-related functions:", functions);
    }
  } catch (error) {
    console.error("Schema check failed:", error);
  }
}

checkProductionUsersSchema();
