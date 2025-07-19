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

// Create a simple Hono app for development
const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Dummy authentication middleware
const DUMMY_USER = {
  id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  email: "testuser@receiptradar.app",
  is_premium: false,
};

const auth = async (c, next) => {
  c.set("user", DUMMY_USER);
  await next();
};

// Health check
app.get("/", (c) => {
  return c.text("Welcome to the ReceiptRadar API!");
});

// Households routes
app.get("/api/v1/households/mine", auth, async (c) => {
  // Return 404 for no household found (this is expected for new users)
  return c.json({ error: "No household found" }, 404);
});

app.post("/api/v1/households", auth, async (c) => {
  const { name } = await c.req.json();
  if (!name) {
    return c.json({ error: "Household name is required" }, 400);
  }

  // Return a dummy household
  return c.json(
    {
      id: "household-123",
      name: name,
      owner_id: DUMMY_USER.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [
        {
          user: {
            id: DUMMY_USER.id,
            email: DUMMY_USER.email,
          },
          role: "admin",
        },
      ],
    },
    201
  );
});

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
