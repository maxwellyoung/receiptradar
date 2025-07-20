const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read environment variables from wrangler.toml
function getWranglerConfig() {
  try {
    const wranglerPath = path.join(__dirname, "../backend/wrangler.toml");
    const wranglerContent = fs.readFileSync(wranglerPath, "utf8");

    // Parse wrangler.toml to extract production environment values
    const lines = wranglerContent.split("\n");
    let supabaseUrl = "https://cihuylmusthumxpuexrl.supabase.co";
    let supabaseServiceKey = "";
    let inProductionEnv = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if we're in the production environment vars section
      if (line === "[env.production.vars]") {
        inProductionEnv = true;
        continue;
      }

      // If we hit another section, stop looking in production
      if (line.startsWith("[") && line !== "[env.production.vars]") {
        inProductionEnv = false;
        continue;
      }

      // Only read values if we're in the production environment
      if (inProductionEnv) {
        if (line.startsWith("SUPABASE_URL = ")) {
          supabaseUrl = line.split("=")[1].trim().replace(/"/g, "");
        }
        if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY = ")) {
          supabaseServiceKey = line.split("=")[1].trim().replace(/"/g, "");
        }
      }
    }

    return { supabaseUrl, supabaseServiceKey };
  } catch (error) {
    console.error("Error reading wrangler.toml:", error);
    return {
      supabaseUrl: "https://cihuylmusthumxpuexrl.supabase.co",
      supabaseServiceKey: "",
    };
  }
}

const { supabaseUrl, supabaseServiceKey } = getWranglerConfig();

console.log("🔍 Debug info:");
console.log("Supabase URL:", supabaseUrl);
console.log(
  "Service Key (first 20 chars):",
  supabaseServiceKey.substring(0, 20) + "..."
);

if (!supabaseServiceKey) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyUserTrigger() {
  try {
    console.log("🔧 Applying user trigger migration...");

    // Read the SQL file
    const sqlPath = path.join(__dirname, "../database/06-user-trigger.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      console.error("❌ Error applying migration:", error);
      return;
    }

    console.log("✅ User trigger migration applied successfully!");
    console.log(
      "📝 This will automatically create user records when people sign up"
    );
  } catch (error) {
    console.error("❌ Failed to apply migration:", error);
  }
}

// Alternative approach using direct SQL execution
async function applyUserTriggerDirect() {
  try {
    console.log("🔧 Applying user trigger migration (direct method)...");

    // Test if we can access the users table
    console.log("📝 Testing database access...");
    const { error: testError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Cannot access users table:", testError);
      console.log("💡 The immediate fix in the backend should work for now.");
      return;
    }

    console.log("✅ Database access confirmed!");
    console.log("💡 The backend fix should handle new users automatically.");
    console.log(
      "💡 For future users, you can manually create the trigger in Supabase dashboard:"
    );
    console.log("   1. Go to your Supabase dashboard");
    console.log("   2. Navigate to SQL Editor");
    console.log("   3. Run the SQL from database/06-user-trigger.sql");
  } catch (error) {
    console.error("❌ Failed to apply migration:", error);
    console.log("💡 The backend fix should work for now.");
  }
}

// Run the migration
applyUserTriggerDirect();
