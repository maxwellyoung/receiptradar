// Business Rules and Constants
// This file centralizes all business logic constants to eliminate magic numbers

export const BUSINESS_RULES = {
  // Timeouts (in milliseconds)
  TIMEOUTS: {
    OCR_HEALTH_CHECK: 5000,
    OCR_PROCESSING: 10000,
    API_REQUEST: 5000,
    AUTH_TIMEOUT: 5000,
    PROCESSING_TIMEOUT: 30000,
  },

  // Price Analysis
  PRICE_ANALYSIS: {
    EXPENSIVE_ITEM_MULTIPLIER: 1.5,
    POTENTIAL_SAVINGS_PERCENTAGE: 0.2,
    STORE_COMPARISON_THRESHOLD: 100,
    STORE_SAVINGS_PERCENTAGE: 0.08,
    HIGH_SPENDING_THRESHOLD: 200,
    PRICE_STABILITY_THRESHOLD: 0.01,
  },

  // UI Constants
  UI: {
    ANIMATION_DURATION: {
      FAST: 100,
      NORMAL: 600,
      SLOW: 800,
    },
    ANIMATION_TENSION: {
      NORMAL: 100,
      SPRING: 40,
    },
    ANIMATION_FRICTION: {
      NORMAL: 8,
      SPRING: 6,
    },
    IMAGE_SIZES: {
      SMALL: { width: 40, height: 40 },
      MEDIUM: { width: 80, height: 80 },
      LARGE: { width: 120, height: 120 },
      TEST: { width: 200, height: 200 },
    },
    OPACITY: {
      DISABLED: 0.5,
      OVERLAY: 0.8,
    },
  },

  // API Configuration
  API: {
    DEFAULT_OCR_URL: "http://localhost:8000",
    DEFAULT_HONO_URL: "http://127.0.0.1:8787",
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    NOT_FOUND_STATUS: 404,
  },

  // Date/Time Constants
  TIME: {
    ONE_DAY_MS: 86400000,
    TWO_DAYS_MS: 172800000,
    THREE_DAYS_MS: 259200000,
    FIVE_DAYS_MS: 432000000,
  },

  // Mock Data Constants
  MOCK: {
    MIN_RANDOM_PRICE: 100,
    MAX_RANDOM_PRICE: 1000,
    DEFAULT_SAVINGS: 1250.5,
    DEFAULT_TOTAL: 120.75,
  },

  // Geolocation (Wellington, NZ)
  LOCATIONS: {
    EARTH_RADIUS_KM: 6371,
    METERS_THRESHOLD: 1, // Distance threshold for showing meters vs kilometers
    WELLINGTON: {
      lat: -41.2866,
      lon: 174.7756,
    },
    AUCKLAND: {
      lat: -36.8485,
      lon: 174.7633,
    },
    CHRISTCHURCH: {
      lat: -43.532,
      lon: 172.6306,
    },
  },

  // Achievement System
  ACHIEVEMENTS: {
    PROGRESS_PERCENTAGE_MULTIPLIER: 100,
    TIME_CALCULATION_DIVISOR: 1000 * 60 * 60, // Convert to hours
  },

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

// Type-safe access to business rules
export type BusinessRules = typeof BUSINESS_RULES;
