#!/usr/bin/env node
/**
 * Setup Production Environment Variables
 * Configures cloud database connection for ReceiptRadar
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up Production Environment Variables...\n");

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function setupProductionEnv() {
  try {
    console.log("📋 Please provide your Supabase cloud database details:");
    console.log(
      "   (Get these from: https://supabase.com/dashboard/project/cihuylmusthumxpuexrl)\n"
    );

    // Get database details
    const databaseUrl = await prompt("🔗 Database URL (postgresql://...): ");
    const apiUrl = await prompt("🌐 API URL (https://...supabase.co): ");
    const anonKey = await prompt("🔑 Anon Key: ");
    const serviceRoleKey = await prompt("🔐 Service Role Key: ");

    console.log("\n🚀 Setting up Railway environment variables...");

    // Set Railway environment variables
    const railwayCommands = [
      `railway variables set DATABASE_URL="${databaseUrl}"`,
      `railway variables set SUPABASE_URL="${apiUrl}"`,
      `railway variables set SUPABASE_ANON_KEY="${anonKey}"`,
      `railway variables set SUPABASE_SERVICE_ROLE_KEY="${serviceRoleKey}"`,
      `railway variables set NODE_ENV="production"`,
      `railway variables set SCRAPER_INTERVAL_HOURS="6"`,
      `railway variables set SCRAPER_TIMEZONE="Pacific/Auckland"`,
    ];

    for (const command of railwayCommands) {
      console.log(`\n📝 Running: ${command}`);
      await new Promise((resolve, reject) => {
        exec(
          command,
          { cwd: path.join(__dirname, "../backend") },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`❌ Error: ${error.message}`);
              reject(error);
            } else {
              console.log(`✅ Success: ${stdout}`);
              resolve();
            }
          }
        );
      });
    }

    // Create .env.production file for frontend
    const envProduction = `# Production Environment Variables
EXPO_PUBLIC_SUPABASE_URL=${apiUrl}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
EXPO_PUBLIC_BACKEND_URL=https://receiptradar-production.up.railway.app
`;

    fs.writeFileSync(path.join(__dirname, "../.env.production"), envProduction);
    console.log("\n📁 Created .env.production file for frontend");

    // Create .env.local for local development
    const envLocal = `# Local Development Environment Variables
EXPO_PUBLIC_SUPABASE_URL=${apiUrl}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
EXPO_PUBLIC_BACKEND_URL=https://receiptradar-production.up.railway.app
`;

    fs.writeFileSync(path.join(__dirname, "../.env.local"), envLocal);
    console.log("📁 Updated .env.local file");

    console.log("\n🎉 Production environment setup complete!");
    console.log("\n📋 Summary:");
    console.log("  ✅ Railway environment variables set");
    console.log("  ✅ Frontend environment files created");
    console.log("  ✅ Backend will use cloud database");
    console.log("  ✅ Frontend will connect to production backend");

    console.log("\n🔄 Next steps:");
    console.log("  1. Redeploy backend: cd backend && railway up");
    console.log(
      "  2. Test scraper: curl -X POST https://receiptradar-production.up.railway.app/api/scrape"
    );
    console.log("  3. Deploy frontend with production environment");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.log("\n💡 Manual setup instructions:");
    console.log("  1. Go to Railway dashboard");
    console.log("  2. Add environment variables manually");
    console.log("  3. Set DATABASE_URL to your Supabase connection string");
  }
}

// Run the setup
setupProductionEnv();
