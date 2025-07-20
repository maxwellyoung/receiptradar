#!/usr/bin/env node
/**
 * Export Real Scraped Data for Frontend Integration
 * Replaces mock data with real Countdown prices
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Connect to your local Supabase
const supabase = createClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
);

async function exportRealData() {
  console.log("🔄 Exporting real scraped data...");

  try {
    // Get real prices from the last 24 hours
    const { data: prices, error } = await supabase
      .from("price_history")
      .select("*")
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching prices:", error);
      return;
    }

    console.log(`✅ Found ${prices.length} real prices`);

    // Transform data for frontend use
    const transformedData = prices.map((price) => ({
      id: price.id,
      name: price.item_name,
      price: parseFloat(price.price),
      store: "Countdown",
      category: price.department || "General",
      image: price.image_url || null,
      volume: price.volume_size || null,
      lastUpdated: price.created_at,
      source: "real_scraped_data",
    }));

    // Group by category for easier frontend use
    const groupedByCategory = {};
    transformedData.forEach((item) => {
      const category = item.category;
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(item);
    });

    // Create summary stats
    const stats = {
      totalProducts: transformedData.length,
      categories: Object.keys(groupedByCategory).length,
      averagePrice:
        transformedData.reduce((sum, item) => sum + item.price, 0) /
        transformedData.length,
      lastUpdated: new Date().toISOString(),
      dataSource: "Countdown Scraper",
    };

    // Export data to files
    const fs = require("fs");
    const path = require("path");

    // Create data directory
    const dataDir = path.join(__dirname, "..", "src", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Export all data
    fs.writeFileSync(
      path.join(dataDir, "real-prices.json"),
      JSON.stringify(transformedData, null, 2)
    );

    // Export grouped data
    fs.writeFileSync(
      path.join(dataDir, "real-prices-by-category.json"),
      JSON.stringify(groupedByCategory, null, 2)
    );

    // Export stats
    fs.writeFileSync(
      path.join(dataDir, "real-prices-stats.json"),
      JSON.stringify(stats, null, 2)
    );

    console.log("📁 Data exported to:");
    console.log("  - src/data/real-prices.json");
    console.log("  - src/data/real-prices-by-category.json");
    console.log("  - src/data/real-prices-stats.json");

    // Show sample data
    console.log("\n📊 Sample real products:");
    transformedData.slice(0, 5).forEach((item) => {
      console.log(
        `  ${item.name.substring(0, 40)}... - $${item.price.toFixed(2)} (${
          item.category
        })`
      );
    });

    console.log("\n🎉 Real data export complete!");
    console.log("\n💡 Next steps:");
    console.log("  1. Update your frontend to use this real data");
    console.log("  2. Replace mock data imports with real data imports");
    console.log("  3. Your app will now show real Countdown prices!");
  } catch (error) {
    console.error("❌ Export failed:", error);
  }
}

// Run the export
exportRealData();
