import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimit } from "hono/rate-limit";
import { auth } from "./middleware/auth";
import { receipts } from "./routes/receipts";
import { households } from "./routes/households";
// import { users } from "./routes/users";
// import { analytics } from "./routes/analytics";
// import { webhooks } from "./routes/webhooks";
import Redis from "ioredis";

const app = new Hono();

// Initialize Redis client
export const redis = new Redis({
  host: "redis-13324.c232.us-east-1-2.ec2.redns.redis-cloud.com",
  port: 13324,
  username: "default", // change if you have a custom user
  password: "", // TODO: Set your actual Redis password here
  db: 0, // default database
});

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://receiptradar.app"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting
app.use(
  "*",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP",
  })
);

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ReceiptRadar API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route("/api/v1/receipts", auth, receipts);
app.route("/api/v1/households", auth, households);
// app.route("/api/v1/users", auth, users);
// app.route("/api/v1/analytics", auth, analytics);
// app.route("/api/v1/webhooks", webhooks);

// Error handling
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: err.message,
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not found",
      message: "The requested resource was not found",
    },
    404
  );
});

export default app;
