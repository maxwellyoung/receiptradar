#!/usr/bin/env node

// Test script to verify household creation works
const fetch = require("node-fetch");

async function testHouseholdCreation() {
  try {
    console.log("Testing household creation...");

    // Test the local Supabase API directly
    const response = await fetch("http://127.0.0.1:54321/rest/v1/households", {
      method: "POST",
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHV5bG11c3RodW14cHVleHJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU2OTExMSwiZXhwIjoyMDY4MTQ1MTExfQ.2sdXqL8HuvZris4IRzP0uG-yLyUIlgVyWwrKv6MpLTQ",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Household from Script",
        owner_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      }),
    });

    console.log("Response status:", response.status);

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log("✅ Household created successfully:", data);
      } catch (e) {
        console.log("✅ Household created successfully (non-JSON response)");
      }
    } else {
      console.log("❌ Failed to create household");
    }
  } catch (error) {
    console.log("❌ Error testing household creation:", error.message);
  }
}

testHouseholdCreation();
