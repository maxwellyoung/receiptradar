import { logger } from "@/utils/logger";
import { handleAsyncError } from "@/utils/error-handler";
import {
  OCRData,
  NormalizedProduct,
  ShoppingInsight,
  BudgetCoaching,
  AIHealthCheck,
  PriceHistoryEntry,
  SavingsAnalysis,
} from "@/types/ocr";

import { BUSINESS_RULES } from "@/constants/business-rules";

const OCR_SERVICE_URL =
  process.env.EXPO_PUBLIC_OCR_URL || BUSINESS_RULES.API.DEFAULT_OCR_URL;

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
  ai_enhanced?: boolean;
}

export interface SaveReceiptRequest {
  store_name: string;
  total_amount: number;
  date: string;
  image_url?: string;
  ocr_data: OCRData;
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
      logger.info("Starting AI-enhanced OCR processing", { imageUri });

      // Check if service is available first
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        logger.warn("OCR service unavailable, using fallback immediately");
        return this.getFallbackResult("OCR service unavailable");
      }

      // Try AI-enhanced parsing first (hybrid approach)
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
        logger.info("AI-enhanced OCR processing successful", {
          store: result.store_name,
          total: result.total,
          itemCount: result.items?.length || 0,
          aiEnhanced: result.ai_enhanced,
        });
        return result;
      } else {
        throw new Error("Invalid OCR result structure");
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.warn("AI-enhanced OCR processing failed, using fallback", {
        errorMessage: errorObj.message,
        imageUri,
      });

      // Return enhanced fallback result with error information
      return this.getFallbackResult(errorObj.message);
    }
  }

  async parseReceiptWithAI(imageUri: string): Promise<OCRResult> {
    try {
      logger.info("Starting pure AI receipt parsing", { imageUri });

      // Check if AI service is available
      const aiHealth = await this.aiHealthCheck();
      if (!aiHealth.ai_available || aiHealth.status !== "healthy") {
        logger.warn("AI service unavailable, falling back to hybrid parsing");
        return this.parseReceipt(imageUri);
      }

      // Use pure AI parsing
      const response = await fetch(`${this.baseUrl}/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: this.createFormData(imageUri),
      });

      if (!response.ok) {
        throw new Error(
          `AI service returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Validate the result
      if (this.validateOCRResult(result)) {
        logger.info("Pure AI receipt parsing successful", {
          store: result.store_name,
          total: result.total,
          itemCount: result.items?.length || 0,
          confidence: result.confidence,
        });
        return result;
      } else {
        throw new Error("Invalid AI result structure");
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.warn("Pure AI parsing failed, falling back to hybrid", {
        errorMessage: errorObj.message,
        imageUri,
      });

      // Fallback to hybrid parsing
      return this.parseReceipt(imageUri);
    }
  }

  async normalizeProducts(products: string[]): Promise<NormalizedProduct[]> {
    try {
      logger.info("Normalizing products with AI", {
        productCount: products.length,
      });

      const response = await fetch(`${this.baseUrl}/normalize-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        throw new Error(`Product normalization failed: ${response.status}`);
      }

      const result = await response.json();
      logger.info("Product normalization successful", {
        normalizedCount: result.normalized_products?.length || 0,
      });

      return result.normalized_products || [];
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error("Product normalization failed", errorObj);
      // Return original products if normalization fails
      return products.map((product) => ({
        original: product,
        normalized: product,
        confidence: 0.5,
      }));
    }
  }

  async generateShoppingInsights(
    userHistory: OCRItem[],
    currentBasket: OCRItem[]
  ): Promise<ShoppingInsight> {
    try {
      logger.info("Generating AI shopping insights", {
        historyCount: userHistory.length,
        basketCount: currentBasket.length,
      });

      const response = await fetch(`${this.baseUrl}/shopping-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_history: userHistory,
          current_basket: currentBasket,
        }),
      });

      if (!response.ok) {
        throw new Error(`Shopping insights failed: ${response.status}`);
      }

      const result = await response.json();
      logger.info("Shopping insights generated successfully");

      return result;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error("Shopping insights generation failed", errorObj);
      // Return empty insights if generation fails
      return {
        price_anomalies: [],
        substitutions: [],
        timing_recommendations: [],
        store_switching: [],
      };
    }
  }

  async generateBudgetCoaching(
    userData: { receipts: OCRItem[]; spending: number; categories: string[] },
    toneMode: "gentle" | "direct" = "gentle"
  ): Promise<BudgetCoaching> {
    try {
      logger.info("Generating AI budget coaching", { toneMode });

      const response = await fetch(`${this.baseUrl}/budget-coaching`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_data: userData,
          tone_mode: toneMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Budget coaching failed: ${response.status}`);
      }

      const result = await response.json();
      logger.info("Budget coaching generated successfully");

      return result;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error("Budget coaching generation failed", errorObj);
      // Return mock coaching if generation fails
      return {
        weekly_analysis:
          "Unable to analyze your spending patterns at the moment.",
        spending_patterns: [],
        savings_opportunities: [],
        motivational_message:
          "Keep tracking your receipts to get personalized insights!",
        next_week_prediction: 0,
        action_items: [],
        progress_score: 50,
      };
    }
  }

  private validateOCRResult(result: unknown): boolean {
    // Basic validation of OCR result structure
    if (!result || typeof result !== "object") {
      return false;
    }

    const resultObj = result as Record<string, unknown>;

    // Check for required fields
    if (!resultObj.validation || typeof resultObj.validation !== "object") {
      return false;
    }

    if (!Array.isArray(resultObj.items)) {
      return false;
    }

    // Validate items structure
    for (const item of resultObj.items as OCRItem[]) {
      if (!item.name || typeof item.price !== "number" || item.price < 0) {
        return false;
      }
    }

    return true;
  }

  private getFallbackResult(errorMessage?: string): OCRResult {
    // Enhanced fallback result with error information
    const fallbackResult: OCRResult = {
      store_name: "Unknown Store",
      date: new Date().toISOString().split("T")[0],
      total: 0,
      items: [],
      subtotal: 0,
      tax: 0,
      receipt_number: "",
      validation: {
        is_valid: false,
        confidence_score: 0.0,
        issues: errorMessage
          ? [`OCR Service Error: ${errorMessage}`]
          : ["Unable to process receipt"],
      },
      processing_time: 0,
      ai_enhanced: false,
    };

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
        timeout: BUSINESS_RULES.TIMEOUTS.OCR_HEALTH_CHECK,
      } as any);

      return response.ok;
    } catch (error) {
      logger.warn("OCR service health check failed", { error });
      return false;
    }
  }

  async aiHealthCheck(): Promise<AIHealthCheck> {
    try {
      const response = await fetch(`${this.baseUrl}/ai-health`, {
        method: "GET",
        timeout: BUSINESS_RULES.TIMEOUTS.OCR_HEALTH_CHECK,
      } as any);

      if (!response.ok) {
        return { ai_available: false, status: "error" };
      }

      return await response.json();
    } catch (error) {
      logger.warn("AI service health check failed", { error });
      return { ai_available: false, status: "error" };
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

  async getPriceHistory(itemName: string, storeId?: string, days: number = 90) {
    try {
      const params = new URLSearchParams({
        item_name: itemName,
        days: days.toString(),
      });

      if (storeId) {
        params.append("store_id", storeId);
      }

      const response = await fetch(`${this.baseUrl}/price-history?${params}`, {
        method: "GET",
        timeout: BUSINESS_RULES.TIMEOUTS.OCR_PROCESSING,
      } as any);

      if (!response.ok) {
        throw new Error(`Price history failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.info("Price history skipped (service unavailable)", {
        itemName,
        storeId,
      });
      return [];
    }
  }
}

export const ocrService = new OCRService();
