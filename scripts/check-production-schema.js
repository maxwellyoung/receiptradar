#!/usr/bin/env node

// Script to check production database schema
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkProductionSchema() {
  try {
    console.log("Checking production database schema...");

    // Check if users table exists
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    console.log("Users table check:", usersError ? "Error" : "Exists");
    if (usersError) console.log("Users error:", usersError);

    // Check if households table exists
    const { data: households, error: householdsError } = await supabase
      .from("households")
      .select("*")
      .limit(1);

    console.log(
      "Households table check:",
      householdsError ? "Error" : "Exists"
    );
    if (householdsError) console.log("Households error:", householdsError);

    // Check if household_users table exists
    const { data: householdUsers, error: householdUsersError } = await supabase
      .from("household_users")
      .select("*")
      .limit(1);

    console.log(
      "Household_users table check:",
      householdUsersError ? "Error" : "Exists"
    );
    if (householdUsersError)
      console.log("Household_users error:", householdUsersError);

    // Check auth.users table (Supabase Auth)
    const { data: authUsers, error: authUsersError } = await supabase
      .from("auth.users")
      .select("*")
      .limit(1);

    console.log("Auth.users table check:", authUsersError ? "Error" : "Exists");
    if (authUsersError) console.log("Auth.users error:", authUsersError);
  } catch (error) {
    console.error("Schema check failed:", error);
  }
}

checkProductionSchema();
