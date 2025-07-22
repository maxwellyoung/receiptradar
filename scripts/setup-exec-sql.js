const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupExecSql() {
  console.log("🚀 Setting up exec_sql function...");

  try {
    // Create the exec_sql function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;

    // Execute the function creation using direct SQL
    const { error } = await supabase.rpc("exec_sql", {
      sql: createFunctionSQL,
    });

    if (error) {
      console.log(
        "⚠️  Function creation failed (this might be expected):",
        error.message
      );

      // Try alternative approach - create function directly
      console.log("🔄 Trying alternative approach...");

      // We'll need to use a different method since exec_sql doesn't exist yet
      console.log(
        "📝 Please run this SQL manually in your Supabase SQL editor:"
      );
      console.log(createFunctionSQL);
    } else {
      console.log("✅ exec_sql function created successfully!");
    }
  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.log("📝 Please run this SQL manually in your Supabase SQL editor:");
    console.log(`
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `);
  }
}

setupExecSql().catch(console.error);
