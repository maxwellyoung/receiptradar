import { createMiddleware } from "hono/factory";

// This is a placeholder for a real authentication system.
// In a real app, you would verify a JWT or session cookie here.
const DUMMY_USER = {
  id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", // A valid UUID
  email: "testuser@receiptradar.app",
  is_premium: false,
};

export const auth = createMiddleware(async (c, next) => {
  // Set the dummy user in the context so downstream handlers can use it
  c.set("user", DUMMY_USER);
  await next();
});
