import { logger } from "@/utils/logger";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  logger.warn(
    "EXPO_PUBLIC_API_URL is not set. Using default development URL. " +
      "Create a .env file with EXPO_PUBLIC_API_URL for production builds.",
    { component: "API_CONFIG" }
  );
}

export const API_CONFIG = {
  baseUrl: API_URL || "http://localhost:8000",
  honoApiUrl: process.env.EXPO_PUBLIC_HONO_API_URL || "http://127.0.0.1:8787",
} as const;
