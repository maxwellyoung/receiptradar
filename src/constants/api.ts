import { logger } from "@/utils/logger";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  // On a physical device, 'localhost' will not work. You need to use your
  // computer's local IP address. Create a .env.local file in the root of
  // your project and add the following line, replacing with your actual IP:
  // EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
  logger.warn(
    "EXPO_PUBLIC_API_URL is not set. Using default development URL. " +
      "Create a .env.local file with EXPO_PUBLIC_API_URL for production builds.",
    { component: "API_CONFIG" }
  );
}

export const API_CONFIG = {
  baseUrl: API_URL || "http://localhost:8000",
  honoApiUrl: process.env.EXPO_PUBLIC_HONO_API_URL || "http://127.0.0.1:8787",
} as const;
