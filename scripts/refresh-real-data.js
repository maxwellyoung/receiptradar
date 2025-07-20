#!/usr/bin/env node
/**
 * Refresh Real Data Script
 * Runs the scraper and updates the frontend data files
 */

const { exec } = require("child_process");
const path = require("path");

console.log("🔄 Starting real data refresh...");

// Function to run the scraper
function runScraper() {
  return new Promise((resolve, reject) => {
    console.log("📊 Running scraper...");

    exec(
      'cd ocr && export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" && python start_production_scraper.py --mode single',
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Scraper error:", error);
          reject(error);
          return;
        }

        console.log("✅ Scraper completed");
        console.log(stdout);
        resolve();
      }
    );
  });
}

// Function to export data
function exportData() {
  return new Promise((resolve, reject) => {
    console.log("📁 Exporting data...");

    exec("node scripts/export-real-data.js", (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Export error:", error);
        reject(error);
        return;
      }

      console.log("✅ Data exported");
      console.log(stdout);
      resolve();
    });
  });
}

// Main refresh function
async function refreshData() {
  try {
    await runScraper();
    await exportData();
    console.log("🎉 Real data refresh complete!");
    console.log("💡 Your app now has the latest Countdown prices!");
  } catch (error) {
    console.error("❌ Refresh failed:", error);
  }
}

// Run the refresh
refreshData();
