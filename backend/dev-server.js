#!/usr/bin/env node

/**
 * Development Server for ReceiptRadar Backend
 *
 * This server runs the Hono app on all interfaces for local development
 * so that React Native apps on devices can access it.
 */

const { serve } = require("@hono/node-server");
const { Hono } = require("hono");
const { cors } = require("hono/cors");
const { logger } = require("hono/logger");

// Import the main app
const app = require("./src/index.ts").default;

// Add CORS for development
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Start the server
const port = 8787;
const host = "0.0.0.0"; // Listen on all interfaces

console.log(`🚀 Starting ReceiptRadar development server on ${host}:${port}`);
console.log(`📱 React Native apps can connect to: http://192.168.1.10:${port}`);

serve({
  fetch: app.fetch,
  port: port,
  hostname: host,
});
