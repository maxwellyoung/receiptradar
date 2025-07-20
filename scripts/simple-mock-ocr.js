const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer();

// CORS middleware
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "mock-ocr",
    timestamp: new Date().toISOString(),
  });
});

// AI health check endpoint
app.get("/ai-health", (req, res) => {
  res.json({
    ai_available: true,
    status: "healthy",
    model: "gpt-4-vision-preview",
  });
});

// Parse endpoint (handles both /parse and /parse-hybrid)
app.post("/parse", upload.single("file"), (req, res) => {
  console.log("Mock OCR: Processing receipt image...");

  // Simulate processing time
  setTimeout(() => {
    const mockReceipt = {
      store_name: "Countdown",
      date: new Date().toISOString().split("T")[0],
      total: 45.67,
      items: [
        {
          name: "Milk 2L",
          price: 4.5,
          quantity: 1,
          category: "Dairy",
          confidence: 0.95,
        },
        {
          name: "Bread",
          price: 3.2,
          quantity: 1,
          category: "Pantry",
          confidence: 0.92,
        },
        {
          name: "Bananas 1kg",
          price: 3.99,
          quantity: 1,
          category: "Fresh Produce",
          confidence: 0.88,
        },
        {
          name: "Chicken Breast 500g",
          price: 12.99,
          quantity: 1,
          category: "Meat",
          confidence: 0.9,
        },
        {
          name: "Rice 1kg",
          price: 3.5,
          quantity: 1,
          category: "Pantry",
          confidence: 0.87,
        },
        {
          name: "Apples 1kg",
          price: 4.99,
          quantity: 1,
          category: "Fresh Produce",
          confidence: 0.89,
        },
        {
          name: "Cheese 250g",
          price: 5.99,
          quantity: 1,
          category: "Dairy",
          confidence: 0.91,
        },
        {
          name: "Eggs 12pk",
          price: 6.99,
          quantity: 1,
          category: "Dairy",
          confidence: 0.93,
        },
      ],
      subtotal: 44.15,
      tax: 1.52,
      receipt_number: "R123456",
      validation: {
        is_valid: true,
        confidence_score: 0.89,
        issues: [],
      },
      processing_time: 2.34,
      ai_enhanced: true,
      savings_analysis: {
        total_savings: 5.2,
        savings_percentage: 11.4,
        suggestions: [
          "Consider buying store brand for 20% savings",
          "Bulk purchase could save $3.50",
          "Check for coupons next time",
        ],
      },
    };

    console.log("Mock OCR: Receipt processed successfully");
    res.json(mockReceipt);
  }, 2000); // 2 second delay to simulate processing
});

// Categories endpoint
app.get("/categories", (req, res) => {
  res.json([
    { id: "fresh-produce", name: "Fresh Produce", color: "#4CAF50" },
    { id: "dairy", name: "Dairy", color: "#2196F3" },
    { id: "meat", name: "Meat", color: "#F44336" },
    { id: "pantry", name: "Pantry", color: "#FF9800" },
    { id: "beverages", name: "Beverages", color: "#9C27B0" },
    { id: "snacks", name: "Snacks", color: "#795548" },
    { id: "frozen", name: "Frozen", color: "#00BCD4" },
    { id: "household", name: "Household", color: "#607D8B" },
  ]);
});

// Stores endpoint
app.get("/stores", (req, res) => {
  res.json([
    { id: "countdown", name: "Countdown", location: "Auckland" },
    { id: "new_world", name: "New World", location: "Auckland" },
    { id: "paknsave", name: "Pak'nSave", location: "Auckland" },
    { id: "four_square", name: "Four Square", location: "Auckland" },
    { id: "fresh_choice", name: "Fresh Choice", location: "Auckland" },
  ]);
});

const PORT = 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Mock OCR Service running on http://0.0.0.0:${PORT}`);
  console.log("📱 React Native apps can connect to: http://192.168.1.10:8000");
  console.log("✅ Endpoints available:");
  console.log("   GET  /health");
  console.log("   GET  /ai-health");
  console.log("   POST /parse");
  console.log("   GET  /categories");
  console.log("   GET  /stores");
});
