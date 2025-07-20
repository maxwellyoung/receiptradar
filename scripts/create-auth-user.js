#!/usr/bin/env node

// Script to create a user through Supabase Auth
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://cihuylmusthumxpuexrl.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAuthUser() {
  try {
    console.log("Creating user through Supabase Auth...");

    // Create user through Supabase Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: "testuser@receiptradar.app",
        password: "testpassword123",
        email_confirm: true,
        user_metadata: {
          name: "Test User",
        },
      });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return;
    }

    console.log("✅ Auth user created:", authUser.user.id);
    console.log("User ID:", authUser.user.id);
    console.log("Email:", authUser.user.email);

    // Now create the user in our users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: authUser.user.id,
        email: authUser.user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error("Error creating user in users table:", userError);
      return;
    }

    console.log("✅ User created in users table:", user);
  } catch (error) {
    console.error("Create auth user failed:", error);
  }
}

createAuthUser();
