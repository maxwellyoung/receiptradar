import { logger } from "@/utils/logger";

// Always use production API
const PRODUCTION_API_URL = "https://receiptradar-api.receipt-radar.workers.dev";

// Use production URL for all environments
const API_URL = PRODUCTION_API_URL;

logger.info(`Using production API: ${API_URL}`, { component: "API_CONFIG" });

export const API_CONFIG = {
  baseUrl: API_URL,
  honoApiUrl: API_URL,
  isDevelopment: false,
} as const;
