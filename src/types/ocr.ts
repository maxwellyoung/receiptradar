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

export interface OCRData {
  store_name: string;
  total: number;
  items: OCRItem[];
  date: string;
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

export interface NormalizedProduct {
  original: string;
  normalized: string;
  confidence: number;
  category?: string;
  brand?: string;
  size?: string;
}

export interface ShoppingInsight {
  price_anomalies: Array<{
    item: string;
    expected_price: number;
    actual_price: number;
    difference: number;
  }>;
  substitutions: Array<{
    original: string;
    suggested: string;
    savings: number;
    reason: string;
  }>;
  timing_recommendations: Array<{
    item: string;
    best_time: string;
    reason: string;
  }>;
  store_switching: Array<{
    item: string;
    current_store: string;
    suggested_store: string;
    savings: number;
  }>;
}

export interface BudgetCoaching {
  weekly_analysis: string;
  spending_patterns: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: "increasing" | "decreasing" | "stable";
  }>;
  savings_opportunities: Array<{
    category: string;
    potential_savings: number;
    action: string;
  }>;
  motivational_message: string;
  next_week_prediction: number;
  action_items: Array<{
    action: string;
    priority: "high" | "medium" | "low";
    impact: number;
  }>;
  progress_score: number;
}

export interface AIHealthCheck {
  ai_available: boolean;
  status: "healthy" | "degraded" | "error";
  response_time?: number;
  model_version?: string;
  last_check?: string;
}

export interface PriceHistoryEntry {
  item_name: string;
  price: number;
  store_id: string;
  date: string;
  source: "receipt" | "scraped" | "user_entered";
}

export interface SavingsAnalysis {
  total_potential_savings: number;
  items_with_savings: Array<{
    item_name: string;
    current_price: number;
    best_price: number;
    savings: number;
    store_name: string;
  }>;
  recommendations: Array<{
    action: string;
    savings: number;
    priority: "high" | "medium" | "low";
  }>;
}
