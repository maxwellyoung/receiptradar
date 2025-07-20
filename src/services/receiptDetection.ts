import { logger } from "@/utils/logger";

export interface DetectionResult {
  detected: boolean;
  confidence: number;
  details: {
    hasText: boolean;
    isRectangular: boolean;
    aspectRatio: number;
    edgeDensity: number;
    confidence: number;
  };
}

export interface ReceiptDetectionService {
  detectReceipt(imageUri: string): Promise<DetectionResult>;
}

class RealReceiptDetectionService implements ReceiptDetectionService {
  private ocrServiceUrl: string;

  constructor() {
    this.ocrServiceUrl =
      process.env.EXPO_PUBLIC_OCR_SERVICE_URL || "http://localhost:8000";
  }

  async detectReceipt(imageUri: string): Promise<DetectionResult> {
    try {
      logger.info("Starting real receipt detection", { imageUri });

      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("file", blob, "receipt.jpg");

      // Send to OCR service for quick analysis
      const ocrResponse = await fetch(`${this.ocrServiceUrl}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error(`OCR service returned ${ocrResponse.status}`);
      }

      const ocrResult = await ocrResponse.json();

      // Analyze OCR results to determine if it's a receipt
      const detectionResult = this.analyzeOCRResults(ocrResult);

      logger.info("Receipt detection completed", {
        detected: detectionResult.detected,
        confidence: detectionResult.confidence,
        textElements: ocrResult.results?.length || 0,
      });

      return detectionResult;
    } catch (error) {
      logger.warn("Receipt detection failed, using fallback", {
        error: error instanceof Error ? error.message : String(error),
      });

      // Fallback to basic detection
      return this.getFallbackDetection();
    }
  }

  private analyzeOCRResults(ocrResult: any): DetectionResult {
    const results = ocrResult.results || [];

    if (results.length === 0) {
      return {
        detected: false,
        confidence: 0.1,
        details: {
          hasText: false,
          isRectangular: false,
          aspectRatio: 1.0,
          edgeDensity: 0.1,
          confidence: 0.1,
        },
      };
    }

    // Extract all text
    const allText = results
      .map((r: any) => r.text || "")
      .join(" ")
      .toLowerCase();

    // Check for receipt indicators
    const receiptKeywords = [
      "receipt",
      "invoice",
      "total",
      "subtotal",
      "tax",
      "amount",
      "price",
      "countdown",
      "new world",
      "paknsave",
      "four square",
      "fresh choice",
      "super value",
      "woolworths",
      "coles",
      "safeway",
      "foodstuffs",
    ];

    const hasReceiptKeywords = receiptKeywords.some((keyword) =>
      allText.includes(keyword)
    );

    // Check for price patterns
    const pricePattern = /\$\d+\.\d{2}|\d+\.\d{2}/g;
    const hasPrices = pricePattern.test(allText);

    // Check for date patterns
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g;
    const hasDate = datePattern.test(allText);

    // Calculate confidence based on multiple factors
    let confidence = 0.0;

    if (hasReceiptKeywords) confidence += 0.4;
    if (hasPrices) confidence += 0.3;
    if (hasDate) confidence += 0.2;
    if (results.length > 5) confidence += 0.1; // Multiple text elements

    // Check for store names specifically
    const storeNames = ["countdown", "new world", "paknsave", "four square"];
    const hasStoreName = storeNames.some((store) => allText.includes(store));
    if (hasStoreName) confidence += 0.2;

    const detected = confidence > 0.5;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      details: {
        hasText: results.length > 0,
        isRectangular: this.checkRectangularShape(results),
        aspectRatio: this.calculateAspectRatio(results),
        edgeDensity: this.calculateEdgeDensity(results),
        confidence: Math.min(confidence, 1.0),
      },
    };
  }

  private checkRectangularShape(results: any[]): boolean {
    if (results.length < 4) return false;

    // Check if text elements form a roughly rectangular pattern
    const boxes = results
      .map((r) => r.bbox || [])
      .filter((box) => box.length === 4);
    if (boxes.length < 4) return false;

    // Simple check: if we have text elements spread across the image
    const xCoords = boxes.flatMap((box) => [
      box[0]?.[0] || 0,
      box[2]?.[0] || 0,
    ]);
    const yCoords = boxes.flatMap((box) => [
      box[0]?.[1] || 0,
      box[2]?.[1] || 0,
    ]);

    const xSpread = Math.max(...xCoords) - Math.min(...xCoords);
    const ySpread = Math.max(...yCoords) - Math.min(...yCoords);

    // If we have good spread in both directions, it's likely rectangular
    return xSpread > 100 && ySpread > 100;
  }

  private calculateAspectRatio(results: any[]): number {
    if (results.length === 0) return 1.0;

    const boxes = results
      .map((r) => r.bbox || [])
      .filter((box) => box.length === 4);
    if (boxes.length === 0) return 1.0;

    // Calculate average aspect ratio from bounding boxes
    const ratios = boxes.map((box) => {
      const width = Math.abs((box[1]?.[0] || 0) - (box[0]?.[0] || 0));
      const height = Math.abs((box[2]?.[1] || 0) - (box[0]?.[1] || 0));
      return width > 0 && height > 0 ? width / height : 1.0;
    });

    const avgRatio =
      ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    return Math.min(Math.max(avgRatio, 0.5), 5.0); // Clamp between 0.5 and 5.0
  }

  private calculateEdgeDensity(results: any[]): number {
    if (results.length === 0) return 0.0;

    // Calculate how densely packed the text elements are
    const boxes = results
      .map((r) => r.bbox || [])
      .filter((box) => box.length === 4);
    if (boxes.length === 0) return 0.0;

    // Simple density calculation based on number of elements
    const density = Math.min(results.length / 20.0, 1.0); // Normalize to 0-1
    return density;
  }

  private getFallbackDetection(): DetectionResult {
    // Simple fallback that's less aggressive than the mock
    return {
      detected: false,
      confidence: 0.2,
      details: {
        hasText: false,
        isRectangular: false,
        aspectRatio: 1.0,
        edgeDensity: 0.1,
        confidence: 0.2,
      },
    };
  }
}

// Export singleton instance
export const receiptDetectionService = new RealReceiptDetectionService();
