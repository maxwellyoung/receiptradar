import { logger } from "@/utils/logger";

export interface MockOCRResult {
  results: Array<{
    text: string;
    bbox: number[][];
    confidence: number;
  }>;
  processing_time: number;
  image_size: {
    width: number;
    height: number;
  };
}

export interface MockReceiptDetectionResult {
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

class MockOCRService {
  private isHealthy = true;

  async healthCheck(): Promise<boolean> {
    return this.isHealthy;
  }

  async detectReceipt(imageUri: string): Promise<MockReceiptDetectionResult> {
    try {
      logger.info("Mock OCR: Starting receipt detection", { imageUri });

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate OCR results based on image URI
      const mockOCRResult = this.generateMockOCRResult(imageUri);

      // Analyze the mock results to determine if it's a receipt
      const detectionResult = this.analyzeMockResults(mockOCRResult);

      logger.info("Mock OCR: Receipt detection completed", {
        detected: detectionResult.detected,
        confidence: detectionResult.confidence,
        textElements: mockOCRResult.results.length,
      });

      return detectionResult;
    } catch (error) {
      logger.warn("Mock OCR: Detection failed, using fallback", {
        error: error instanceof Error ? error.message : String(error),
      });

      return this.getFallbackDetection();
    }
  }

  private generateMockOCRResult(imageUri: string): MockOCRResult {
    // Generate different results based on the image URI to simulate real detection
    const uriHash = this.hashCode(imageUri);
    const random = (uriHash % 100) / 100; // 0-1 based on URI

    // Simulate different scenarios
    if (random > 0.7) {
      // High confidence receipt
      return {
        results: [
          {
            text: "COUNTDOWN MT ALBERT",
            bbox: [
              [0, 0],
              [200, 0],
              [200, 20],
              [0, 20],
            ],
            confidence: 0.95,
          },
          {
            text: "RECEIPT",
            bbox: [
              [10, 30],
              [80, 30],
              [80, 45],
              [10, 45],
            ],
            confidence: 0.92,
          },
          {
            text: "DATE: 20/07/2024",
            bbox: [
              [10, 60],
              [120, 60],
              [120, 75],
              [10, 75],
            ],
            confidence: 0.88,
          },
          {
            text: "MILK 2L",
            bbox: [
              [10, 100],
              [80, 100],
              [80, 115],
              [10, 115],
            ],
            confidence: 0.85,
          },
          {
            text: "$4.50",
            bbox: [
              [150, 100],
              [200, 100],
              [200, 115],
              [150, 115],
            ],
            confidence: 0.9,
          },
          {
            text: "BREAD",
            bbox: [
              [10, 130],
              [80, 130],
              [80, 145],
              [10, 145],
            ],
            confidence: 0.87,
          },
          {
            text: "$3.20",
            bbox: [
              [150, 130],
              [200, 130],
              [200, 145],
              [150, 145],
            ],
            confidence: 0.89,
          },
          {
            text: "TOTAL",
            bbox: [
              [10, 200],
              [80, 200],
              [80, 215],
              [10, 215],
            ],
            confidence: 0.94,
          },
          {
            text: "$7.70",
            bbox: [
              [150, 200],
              [200, 200],
              [200, 215],
              [150, 215],
            ],
            confidence: 0.96,
          },
        ],
        processing_time: 1.2,
        image_size: { width: 400, height: 600 },
      };
    } else if (random > 0.4) {
      // Medium confidence receipt
      return {
        results: [
          {
            text: "NEW WORLD",
            bbox: [
              [0, 0],
              [150, 0],
              [150, 20],
              [0, 20],
            ],
            confidence: 0.75,
          },
          {
            text: "TOTAL",
            bbox: [
              [10, 100],
              [80, 100],
              [80, 115],
              [10, 115],
            ],
            confidence: 0.8,
          },
          {
            text: "$12.50",
            bbox: [
              [150, 100],
              [200, 100],
              [200, 115],
              [150, 115],
            ],
            confidence: 0.85,
          },
        ],
        processing_time: 0.8,
        image_size: { width: 400, height: 500 },
      };
    } else {
      // Low confidence or not a receipt
      return {
        results: [
          {
            text: "SOME TEXT",
            bbox: [
              [10, 10],
              [100, 10],
              [100, 25],
              [10, 25],
            ],
            confidence: 0.6,
          },
        ],
        processing_time: 0.5,
        image_size: { width: 300, height: 400 },
      };
    }
  }

  private analyzeMockResults(
    ocrResult: MockOCRResult
  ): MockReceiptDetectionResult {
    const results = ocrResult.results;

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
      .map((r) => r.text || "")
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

  private getFallbackDetection(): MockReceiptDetectionResult {
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

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const mockOCRService = new MockOCRService();
