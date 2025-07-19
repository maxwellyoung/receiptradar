import { supabase } from "@/services/supabase";
import { ocrService } from "@/services/ocr";
import { logger } from "@/utils/logger";

export interface HealthStatus {
  database: boolean;
  storage: boolean;
  ocr: boolean;
  overall: boolean;
}

export const performHealthCheck = async (): Promise<HealthStatus> => {
  const status: HealthStatus = {
    database: false,
    storage: false,
    ocr: false,
    overall: false,
  };

  try {
    // Check database connection
    logger.info("Checking database connection...");
    const { data, error } = await supabase
      .from("categories")
      .select("count")
      .limit(1);

    status.database = !error;
    if (error) {
      logger.warn("Database check failed", { error: error.message });
    } else {
      logger.info("Database connection OK");
    }
  } catch (error) {
    logger.error("Database health check error", { error });
    status.database = false;
  }

  try {
    // Check storage (try to list buckets)
    logger.info("Checking storage connection...");
    const { data, error } = await supabase.storage.listBuckets();

    status.storage =
      !error && data?.some((bucket) => bucket.name === "receipt-images");
    if (error) {
      logger.warn("Storage check failed", { error: error.message });
    } else if (!data?.some((bucket) => bucket.name === "receipt-images")) {
      logger.warn("Receipt images bucket not found");
    } else {
      logger.info("Storage connection OK");
    }
  } catch (error) {
    logger.error("Storage health check error", { error });
    status.storage = false;
  }

  try {
    // Check OCR service
    logger.info("Checking OCR service...");
    status.ocr = await ocrService.healthCheck();
    if (status.ocr) {
      logger.info("OCR service OK");
    } else {
      logger.warn("OCR service unavailable (fallback will be used)");
    }
  } catch (error) {
    logger.warn("OCR health check error", { error });
    status.ocr = false;
  }

  // Overall status
  status.overall = status.database && status.storage;

  logger.info("Health check completed", {
    database: status.database,
    storage: status.storage,
    ocr: status.ocr,
    overall: status.overall,
  });

  return status;
};

export const getHealthSummary = (status: HealthStatus): string => {
  if (status.overall) {
    return status.ocr
      ? "🟢 All systems operational"
      : "🟡 Core systems OK (OCR service offline)";
  } else {
    const issues = [];
    if (!status.database) issues.push("Database");
    if (!status.storage) issues.push("Storage");

    return `🔴 Issues detected: ${issues.join(", ")}`;
  }
};
