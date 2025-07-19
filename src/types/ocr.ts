export interface OCRResult {
  text: string;
  bbox: number[][];
  confidence: number;
}

export interface OCRItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  confidence: number;
  brand?: string;
  sku?: string;
  unit_price?: number;
}

export interface ReceiptOCRData {
  items: OCRItem[];
  store_name?: string;
  date?: string;
  total?: number;
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

export interface OCRResponse {
  results: OCRResult[];
  processing_time: number;
  image_size: {
    width: number;
    height: number;
  };
}

export interface ReceiptValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}
