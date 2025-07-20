import { logger } from "@/utils/logger";

// For local development, use the local server
const LOCAL_API_URL = "http://192.168.1.10:8787";
const PRODUCTION_API_URL = "https://receiptradar-api.receipt-radar.workers.dev";

// Check if we're in development mode
const isDevelopment = __DEV__;

// Use local server in development, production URL otherwise
const API_URL = isDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;

if (isDevelopment) {
  logger.info(`Using local development API: ${API_URL}`, {
    component: "API_CONFIG",
  });
} else {
  logger.info(`Using production API: ${API_URL}`, { component: "API_CONFIG" });
}

export const API_CONFIG = {
  baseUrl: API_URL,
  honoApiUrl: API_URL,
  isDevelopment,
} as const;
