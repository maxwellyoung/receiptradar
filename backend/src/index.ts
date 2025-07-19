import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { auth } from "./middleware/auth";
import { receipts } from "./routes/receipts";
import { households } from "./routes/households";
// import { users } from "./routes/users";
// import { analytics } from "./routes/analytics";
// import { webhooks } from "./routes/webhooks";

const app = new Hono();

// Initialize Redis client (commented out for Cloudflare Workers compatibility)
// export const redis = new Redis({
//   host: "redis-13324.c232.us-east-1-2.ec2.redns.redis-cloud.com",
//   port: 13324,
//   username: "default", // change if you have a custom user
//   password: "", // TODO: Set your actual Redis password here
//   db: 0, // default database
// });

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*", // In production, you should restrict this to your frontend's domain
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting (commented out for Cloudflare Workers compatibility)
// const limiter = rateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 100, // Limit each IP to 100 requests per `window`
//   standardHeaders: "draft-6",
//   keyGenerator: (c) => {
//     // A more robust key generator would be needed in a real app
//     return (
//       c.req.header("x-forwarded-for") ||
//       c.req.header("cf-connecting-ip") ||
//       "unknown"
//     );
//   },
// });
// app.use(limiter);

// Health check
app.get("/", (c) => {
  return c.text("Welcome to the ReceiptRadar API!");
});

// Authenticated routes
const v1 = new Hono();

v1.use("*", auth);

v1.route("/receipts", receipts);
v1.route("/households", households);
// v1.route("/api/v1/users", auth, users);
// v1.route("/api/v1/analytics", auth, analytics);
// v1.route("/api/v1/webhooks", webhooks);

app.route("/api/v1", v1);

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

// --- Cloudflare Workers Export ---

export default app;
