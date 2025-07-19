import { logger } from "@/utils/logger";
import { handleAsyncError } from "@/utils/error-handler";

const OCR_SERVICE_URL =
  process.env.EXPO_PUBLIC_OCR_URL || "http://localhost:8000";

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

  private createFormData(imageUri: string): FormData {
    const formData = new FormData();

    // Handle different image URI formats
    const imageFile = {
      uri: imageUri,
      type: "image/jpeg",
      name: "receipt.jpg",
    } as any;

    formData.append("file", imageFile);
    return formData;
  }

  async parseReceipt(imageUri: string): Promise<OCRResult> {
    try {
      logger.info("Starting OCR processing", { imageUri });

      // Check if service is available first
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        logger.warn("OCR service unavailable, using fallback immediately");
        return this.getFallbackResult("OCR service unavailable");
      }

      // Try to process with OCR service
      const response = await fetch(`${this.baseUrl}/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: this.createFormData(imageUri),
      });

      if (!response.ok) {
        throw new Error(
          `OCR service returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Validate the result
      if (this.validateOCRResult(result)) {
        logger.info("OCR processing successful", {
          store: result.store_name,
          total: result.total,
          itemCount: result.items?.length || 0,
        });
        return result;
      } else {
        throw new Error("Invalid OCR result structure");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.warn("OCR processing failed, using fallback", {
        errorMessage,
        imageUri,
      });

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
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error("Price history failed", errorObj, { itemName });
      return { price_history: [] };
    }
  }
}

export const ocrService = new OCRService();
