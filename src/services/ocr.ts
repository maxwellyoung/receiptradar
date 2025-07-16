import { Platform } from "react-native";
import {
  OCRResult,
  OCRItem,
  ReceiptOCRData,
  OCRResponse,
  ReceiptValidation,
} from "@/types/ocr";
import { BUSINESS_RULES } from "@/constants/business-rules";
import {
  handleAsyncError,
  logError,
  ErrorCode,
  createError,
} from "@/utils/error-handler";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

class OCRService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  /**
   * Check if the OCR service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      const isHealthy = data.status === "healthy" && data.ocr_available;
      if (!isHealthy) {
        logger.warn("OCR health check failed", { data });
      }
      return isHealthy;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("OCR health check failed", error, { endpoint: "/health" });
      return false;
    }
  }

  /**
   * Process receipt image and extract raw OCR text
   */
  async processOCR(imageUri: string): Promise<OCRResponse> {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "receipt.jpg",
      } as any);

      const response = await fetch(`${this.baseUrl}/ocr`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw createError(
          ErrorCode.API_ERROR,
          `OCR request failed: ${response.status}`,
          { endpoint: "/ocr" }
        );
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("OCR processing failed", error, { endpoint: "/ocr" });
      throw createError(ErrorCode.OCR_FAILED, error.message, {}, error);
    }
  }

  /**
   * Process receipt image and return structured data
   */
  async parseReceipt(imageUri: string): Promise<ReceiptOCRData> {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "receipt.jpg",
      } as any);

      const response = await fetch(`${this.baseUrl}/parse`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw createError(
          ErrorCode.API_ERROR,
          `Receipt parsing failed: ${response.status}`,
          { endpoint: "/parse" }
        );
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Receipt parsing failed", error, { endpoint: "/parse" });
      throw createError(
        ErrorCode.RECEIPT_PARSE_FAILED,
        error.message,
        {},
        error
      );
    }
  }

  /**
   * Parse OCR results into structured data
   */
  async parseOCRResults(ocrResults: OCRResult[]): Promise<ReceiptOCRData> {
    try {
      const response = await fetch(`${this.baseUrl}/parse/ocr-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ocrResults),
      });

      if (!response.ok) {
        throw createError(
          ErrorCode.API_ERROR,
          `OCR results parsing failed: ${response.status}`,
          { endpoint: "/parse/ocr-results" }
        );
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("OCR results parsing failed", error, {
        endpoint: "/parse/ocr-results",
      });
      throw createError(
        ErrorCode.RECEIPT_PARSE_FAILED,
        error.message,
        {},
        error
      );
    }
  }

  /**
   * Get available item categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      if (!response.ok) {
        throw createError(
          ErrorCode.API_ERROR,
          `Categories request failed: ${response.status}`,
          { endpoint: "/categories" }
        );
      }

      const data = await response.json();
      return data.categories;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Failed to get categories", error, {
        endpoint: "/categories",
      });
      return [];
    }
  }

  /**
   * Get supported store patterns
   */
  async getStores(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stores`);
      if (!response.ok) {
        throw createError(
          ErrorCode.API_ERROR,
          `Stores request failed: ${response.status}`,
          { endpoint: "/stores" }
        );
      }

      const data = await response.json();
      return data.stores;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Failed to get stores", error, { endpoint: "/stores" });
      return [];
    }
  }

  /**
   * Process multiple receipt images
   */
  async processBatch(imageUris: string[]): Promise<ReceiptOCRData[]> {
    try {
      const formData = new FormData();

      imageUris.forEach((uri, index) => {
        formData.append("files", {
          uri,
          type: "image/jpeg",
          name: `receipt_${index}.jpg`,
        } as any);
      });

      const response = await fetch(`${this.baseUrl}/ocr/batch`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw createError(
          ErrorCode.API_ERROR,
          `Batch processing failed: ${response.status}`,
          { endpoint: "/ocr/batch" }
        );
      }

      const data = await response.json();
      return data.results.map((result: any) => result.result).filter(Boolean);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Batch processing failed", error, {
        endpoint: "/ocr/batch",
      });
      throw createError(ErrorCode.OCR_FAILED, error.message, {}, error);
    }
  }

  /**
   * Validate receipt data
   */
  validateReceiptData(receipt: ReceiptOCRData): ReceiptValidation {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if we have items
    if (!receipt.items || receipt.items.length === 0) {
      errors.push("No items found in receipt");
    }

    // Check if total matches sum of items
    if (receipt.total && receipt.items) {
      const calculatedTotal = receipt.items.reduce(
        (sum: number, item: OCRItem) => sum + item.price * item.quantity,
        0
      );

      if (Math.abs(calculatedTotal - receipt.total) > 0.01) {
        warnings.push(
          `Total mismatch: calculated $${calculatedTotal.toFixed(
            2
          )}, receipt shows $${receipt.total.toFixed(2)}`
        );
      }
    }

    // Check for low confidence items
    const lowConfidenceItems = receipt.items.filter(
      (item: OCRItem) =>
        item.confidence < BUSINESS_RULES.CONFIDENCE_THRESHOLDS.LOW
    );
    if (lowConfidenceItems.length > 0) {
      warnings.push(
        `${lowConfidenceItems.length} items have low confidence scores`
      );
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Save a processed receipt to our backend
   */
  async saveReceipt(receiptData: ReceiptOCRData): Promise<any> {
    try {
      const payload = {
        store_name: receiptData.store_name,
        total_amount: receiptData.total,
        date: receiptData.date
          ? new Date(receiptData.date).toISOString()
          : new Date().toISOString(),
        items: receiptData.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(`${API_CONFIG.honoApiUrl}/api/v1/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: Add Authorization header with user token
          // 'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw createError(
          ErrorCode.API_ERROR,
          `Failed to save receipt: ${response.status} ${errorBody}`,
          { endpoint: "/api/v1/receipts" }
        );
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Failed to save receipt", error);
      throw createError(
        ErrorCode.RECEIPT_SAVE_FAILED,
        error.message,
        {},
        error
      );
    }
  }
}

export const ocrService = new OCRService();
export default ocrService;
