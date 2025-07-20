#!/usr/bin/env node

/**
 * Start Backend Development Server
 *
 * This script helps start the local development server for ReceiptRadar.
 * Run this when you see "Network request failed" errors.
 */

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting ReceiptRadar Backend Development Server...");
console.log(
  "📱 This will allow your React Native app to connect to the local API"
);
console.log("");

// Change to backend directory
const backendDir = path.join(__dirname, "..", "backend");

// Start the development server
const child = spawn("npm", ["run", "dev"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: true,
});

child.on("error", (error) => {
  console.error("❌ Failed to start backend server:", error.message);
  console.log("");
  console.log("💡 Make sure you have:");
  console.log("   1. Node.js installed");
  console.log('   2. Run "npm install" in the backend directory');
  console.log("   3. Your IP address is correct in src/constants/api.ts");
  process.exit(1);
});

child.on("close", (code) => {
  console.log(`\n🔚 Backend server stopped with code ${code}`);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping backend server...");
  child.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Stopping backend server...");
  child.kill("SIGTERM");
});
