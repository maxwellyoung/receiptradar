export const BUSINESS_RULES = {
  // Spending thresholds
  LUXURY_ITEMS: [
    "caviar",
    "truffle",
    "wagyu",
    "champagne",
    "lobster",
    "oyster",
    "saffron",
    "foie gras",
    "kobe",
  ] as const,

  // Spending thresholds
  SPENDING_THRESHOLDS: {
    LOW_SPEND: 20,
    HIGH_SPEND: 200,
    LUXURY_THRESHOLD: 100,
  } as const,

  // Category breakdown percentages (fallback when OCR data unavailable)
  ESTIMATED_BREAKDOWN: {
    "Fresh Produce": 0.3,
    Dairy: 0.2,
    Meat: 0.25,
    Pantry: 0.25,
  } as const,

  // Snack spending threshold
  SNACK_THRESHOLD: 0.3,

  // Duplicate detection
  DUPLICATE_ITEMS_THRESHOLD: 2,

  // Budget streak for zen mood
  BUDGET_STREAK_THRESHOLD: 3,

  // Confidence thresholds
  CONFIDENCE_THRESHOLDS: {
    LOW: 0.6,
    MEDIUM: 0.8,
    HIGH: 0.9,
  } as const,

  // Database connection limits
  DATABASE: {
    MAX_CONNECTIONS: 10,
    PRICE_HISTORY_DAYS: 30,
    PRICE_HISTORY_DAYS_EXTENDED: 90,
  } as const,

  // API timeouts
  API_TIMEOUTS: {
    OCR_PROCESSING: 30000, // 30 seconds
    HEALTH_CHECK: 5000, // 5 seconds
  } as const,
} as const;

export type LuxuryItem = (typeof BUSINESS_RULES.LUXURY_ITEMS)[number];
export type SpendingThreshold = keyof typeof BUSINESS_RULES.SPENDING_THRESHOLDS;
export type ConfidenceLevel = keyof typeof BUSINESS_RULES.CONFIDENCE_THRESHOLDS;
