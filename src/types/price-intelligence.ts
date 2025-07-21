// Centralized Price Intelligence Types
// This file consolidates all price intelligence related types to eliminate duplication

export interface SavingsOpportunity {
  item_name: string;
  current_price: number;
  best_price: number;
  savings: number;
  store_name: string;
  confidence: number;
  price_history_points: number;
}

export interface BasketAnalysis {
  total_savings: number;
  savings_opportunities: SavingsOpportunity[];
  store_recommendation?: string;
  cashback_available: number;
}

export interface PriceHistoryPoint {
  price: number;
  date: string;
  store_name: string;
  confidence: number;
}

export type PriceHistory = {
  price: number;
  date: string;
  store_name: string;
};

export type PriceInsight = {
  message: string;
  icon: "trending-up" | "trending-down" | "trending-flat" | "info-outline";
  color: string;
};

export interface PriceAnomaly {
  item: string;
  usual_price: number;
  current_price: number;
  difference: number;
  reasoning: string;
}

export interface Substitution {
  expensive_item: string;
  cheaper_alternative: string;
  savings: number;
  confidence: number;
}

export interface TimingRecommendation {
  item: string;
  best_day: string;
  best_store: string;
  reasoning: string;
}

export interface StoreSwitching {
  current_store: string;
  better_store: string;
  potential_savings: number;
  items_to_switch: string[];
}

export interface ShoppingInsights {
  price_anomalies: PriceAnomaly[];
  substitutions: Substitution[];
  timing_recommendations: TimingRecommendation[];
  store_switching: StoreSwitching[];
}

export interface PriceInsightCard {
  id: string;
  type: "savings" | "warning" | "tip" | "comparison" | "trend";
  title: string;
  description: string;
  savings?: number;
  icon: string;
  color: string;
  priority: number;
  confidence: number;
  actionText?: string;
  actionUrl?: string;
}
