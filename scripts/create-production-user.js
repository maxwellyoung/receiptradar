#!/usr/bin/env node

// Script to create a user in production database
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createProductionUser() {
  try {
    console.log("Creating user in production database...");

    // First, let's see what columns exist in the users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.error("Error checking users table:", usersError);
      return;
    }

    console.log("Users table structure:", Object.keys(users[0] || {}));

    // Try to create a user with minimal fields
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        email: "testuser@receiptradar.app",
      })
      .select()
      .single();

    if (userError) {
      console.error("Error creating user:", userError);

      // Try with upsert
      const { data: upsertUser, error: upsertError } = await supabase
        .from("users")
        .upsert(
          {
            id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            email: "testuser@receiptradar.app",
          },
          {
            onConflict: "id",
          }
        )
        .select()
        .single();

      if (upsertError) {
        console.error("Error upserting user:", upsertError);
        return;
      }

      console.log("✅ User created/updated via upsert:", upsertUser);
    } else {
      console.log("✅ User created:", user);
    }
  } catch (error) {
    console.error("Create user failed:", error);
  }
}

createProductionUser();
