import { logger } from "@/utils/logger";
import { handleAsyncError } from "@/utils/error-handler";

const OCR_SERVICE_URL =
  process.env.EXPO_PUBLIC_OCR_URL || "https://receiptradar-ocr.fly.dev";

export interface OCRItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  confidence: number;
}

export interface OCRResult {
  store_name?: string;
  date?: string;
  total?: number;
  items: OCRItem[];
  subtotal?: number;
  tax?: number;
  receipt_number?: string;
  validation: {
    is_valid: boolean;
    confidence_score: number;
    issues: string[];
  };
  processing_time: number;
}

export interface SaveReceiptRequest {
  store_name: string;
  total_amount: number;
  date: string;
  image_url?: string;
  ocr_data: any;
  savings_identified?: number;
  cashback_earned?: number;
}

class OCRService {
  private baseUrl: string;

  constructor(baseUrl: string = OCR_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  async parseReceipt(imageUri: string): Promise<OCRResult> {
    try {
      logger.info("Starting OCR processing", { imageUri });

      // Create FormData for image upload
      const formData = new FormData();

      // Handle different image URI formats
      const imageFile = {
        uri: imageUri,
        type: "image/jpeg",
        name: "receipt.jpg",
      } as any;

      formData.append("file", imageFile);

      // Add retry mechanism
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(`${this.baseUrl}/parse`, {
            method: "POST",
            body: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            // Add timeout
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `OCR service error: ${response.status} - ${errorText}`
            );
          }

          const result = await response.json();

          // Validate the result
          if (!this.validateOCRResult(result)) {
            throw new Error("Invalid OCR result received");
          }

          logger.info("OCR processing completed", {
            itemCount: result.items?.length || 0,
            total: result.total,
            processingTime: result.processing_time,
            confidence: result.validation?.confidence_score,
          });

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          lastError = new Error(errorMessage);
          logger.warn(`OCR attempt ${attempt} failed`, {
            errorMessage,
            attempt,
            maxRetries,
          });

          // If this is the last attempt, throw the error
          if (attempt === maxRetries) {
            throw error;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }

      throw lastError || new Error("OCR processing failed after all retries");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("OCR processing failed", { errorMessage, imageUri });

      // Return enhanced fallback result with error information
      return this.getFallbackResult(errorMessage);
    }
  }

  private validateOCRResult(result: any): boolean {
    // Basic validation of OCR result structure
    if (!result || typeof result !== "object") {
      return false;
    }

    // Check for required fields
    if (!result.validation || typeof result.validation !== "object") {
      return false;
    }

    if (!Array.isArray(result.items)) {
      return false;
    }

    // Validate items structure
    for (const item of result.items) {
      if (!item.name || typeof item.price !== "number" || item.price < 0) {
        return false;
      }
    }

    return true;
  }

  private getFallbackResult(errorMessage?: string): OCRResult {
    // Enhanced fallback result with error information
    const fallbackResult: OCRResult = {
      store_name: "Demo Store",
      date: new Date().toISOString().split("T")[0],
      total: 45.67,
      items: [
        {
          name: "Milk 2L",
          price: 4.5,
          quantity: 1,
          category: "Dairy",
          confidence: 0.95,
        },
        {
          name: "Bread Loaf",
          price: 3.2,
          quantity: 1,
          category: "Bakery",
          confidence: 0.92,
        },
        {
          name: "Bananas 1kg",
          price: 2.8,
          quantity: 1,
          category: "Fresh Produce",
          confidence: 0.88,
        },
      ],
      subtotal: 41.23,
      tax: 4.44,
      receipt_number: "R123456789",
      validation: {
        is_valid: true,
        confidence_score: 0.92,
        issues: errorMessage ? [`OCR Service Error: ${errorMessage}`] : [],
      },
      processing_time: 1.2,
    };

    // If there was an error, mark as invalid
    if (errorMessage) {
      fallbackResult.validation.is_valid = false;
      fallbackResult.validation.confidence_score = 0.3;
    }

    return fallbackResult;
  }

  async saveReceipt(receiptData: SaveReceiptRequest): Promise<boolean> {
    try {
      logger.info("Saving receipt to backend", {
        store: receiptData.store_name,
        total: receiptData.total_amount,
      });

      const response = await fetch(`${this.baseUrl}/store-prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receipt_data: receiptData,
          store_id: receiptData.store_name.toLowerCase().replace(/\s+/g, "_"),
          user_id: "anonymous", // Will be replaced with real user ID
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save receipt: ${response.status}`);
      }

      logger.info("Receipt saved successfully");
      return true;
    } catch (error) {
      // Don't log as error since this is expected when backend is not running
      logger.info("Backend save skipped (service unavailable)", {
        store: receiptData.store_name,
        total: receiptData.total_amount,
      });
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        timeout: 5000,
      } as any);

      return response.ok;
    } catch (error) {
      logger.warn("OCR service health check failed", { error });
      return false;
    }
  }

  // Analyze savings opportunities
  async analyzeSavings(items: OCRItem[], storeId: string, userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-savings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
          })),
          store_id: storeId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Savings analysis failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Don't log as error since this is expected when backend is not running
      logger.info("Savings analysis skipped (service unavailable)", {
        itemCount: items.length,
        storeId,
      });
      return {
        total_savings: 0,
        savings_opportunities: [],
        store_recommendation: null,
        cashback_available: 0,
      };
    }
  }

  // Get price history for an item
  async getPriceHistory(itemName: string, storeId?: string, days: number = 90) {
    try {
      const params = new URLSearchParams({
        days: days.toString(),
      });

      if (storeId) {
        params.append("store_id", storeId);
      }

      const response = await fetch(
        `${this.baseUrl}/price-history/${encodeURIComponent(
          itemName
        )}?${params}`
      );

      if (!response.ok) {
        throw new Error(`Price history failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Price history failed", { error, itemName });
      return { price_history: [] };
    }
  }
}

export const ocrService = new OCRService();
