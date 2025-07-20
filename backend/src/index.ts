import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { spawn } from "child_process";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "ReceiptRadar Backend",
  });
});

// Manual scrape trigger endpoint
app.post("/api/scrape", async (req: Request, res: Response) => {
  try {
    console.log("🔄 Manual scrape triggered");

    const scraperProcess = spawn(
      "python3",
      [
        path.join(__dirname, "../ocr/start_production_scraper.py"),
        "--mode",
        "single",
      ],
      {
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL,
        },
      }
    );

    let output = "";
    let errorOutput = "";

    scraperProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log("Scraper output:", data.toString());
    });

    scraperProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("Scraper error:", data.toString());
    });

    scraperProcess.on("close", (code) => {
      if (code === 0) {
        res.json({
          success: true,
          message: "Scraping completed successfully",
          output: output,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Scraping failed",
          error: errorOutput,
        });
      }
    });
  } catch (error) {
    console.error("Scrape endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get scraping status
app.get("/api/scrape/status", (req: Request, res: Response) => {
  res.json({
    scheduler: "running",
    lastRun: new Date().toISOString(),
    nextRun: "Every 6 hours",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 ReceiptRadar Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  // Start the scraper scheduler
  startScraperScheduler();
});

// Scraper Scheduler
function startScraperScheduler() {
  console.log("⏰ Starting scraper scheduler...");

  // Run scraper every 6 hours
  cron.schedule(
    "0 */6 * * *",
    async () => {
      console.log("🔄 Scheduled scraping job started");

      try {
        const scraperProcess = spawn(
          "python3",
          [
            path.join(__dirname, "../ocr/start_production_scraper.py"),
            "--mode",
            "single",
          ],
          {
            env: {
              ...process.env,
              DATABASE_URL: process.env.DATABASE_URL,
            },
          }
        );

        let output = "";
        let errorOutput = "";

        scraperProcess.stdout.on("data", (data) => {
          output += data.toString();
          console.log("Scheduled scraper output:", data.toString());
        });

        scraperProcess.stderr.on("data", (data) => {
          errorOutput += data.toString();
          console.error("Scheduled scraper error:", data.toString());
        });

        scraperProcess.on("close", (code) => {
          if (code === 0) {
            console.log("✅ Scheduled scraping completed successfully");
          } else {
            console.error("❌ Scheduled scraping failed:", errorOutput);
          }
        });
      } catch (error) {
        console.error("❌ Scheduled scraping error:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Pacific/Auckland",
    }
  );

  console.log("✅ Scraper scheduler started - running every 6 hours");
}
