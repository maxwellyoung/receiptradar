import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { Receipt } from "@/types";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";
import { BUSINESS_RULES } from "@/constants/business-rules";

export interface StoreInsight {
  storeName: string;
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  lastVisit: string;
  savingsIdentified: number;
  priceCompetitiveness: number;
  topCategories: Array<{ name: string; amount: number }>;
  priceTrend: "increasing" | "decreasing" | "stable";
  recommendation: string;
}

export interface PriceComparison {
  itemName: string;
  currentPrice: number;
  storePrices: Array<{
    storeName: string;
    price: number;
    lastUpdated: string;
  }>;
  bestPrice: number;
  bestStore: string;
  savings: number;
}

export interface ShoppingPattern {
  preferredStore: string;
  averageWeeklySpend: number;
  mostFrequentDay: string;
  mostFrequentTime: string;
  topItems: Array<{ name: string; frequency: number }>;
}

export const useStoreTracking = () => {
  const { user } = useAuthContext();
  const { receipts } = useReceipts(user?.id || "");
  const [storeInsights, setStoreInsights] = useState<StoreInsight[]>([]);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>(
    []
  );
  const [shoppingPatterns, setShoppingPatterns] =
    useState<ShoppingPattern | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper functions - defined before use
  const calculatePriceCompetitiveness = (store: StoreInsight): number => {
    // Simple algorithm based on savings ratio
    const savingsRatio = store.savingsIdentified / store.totalSpent;
    return Math.min(
      BUSINESS_RULES.ACHIEVEMENTS.PROGRESS_PERCENTAGE_MULTIPLIER,
      Math.max(0, savingsRatio * 1000)
    );
  };

  const calculatePriceTrend = (
    store: StoreInsight,
    allReceipts: Receipt[]
  ): "increasing" | "decreasing" | "stable" => {
    const storeReceipts = allReceipts
      .filter((r) => r.store?.name === store.storeName)
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    if (storeReceipts.length < 2) return "stable";

    const recentReceipts = storeReceipts.slice(-3);
    const olderReceipts = storeReceipts.slice(-6, -3);

    if (recentReceipts.length === 0 || olderReceipts.length === 0)
      return "stable";

    const recentAvg =
      recentReceipts.reduce((sum, r) => sum + r.total, 0) /
      recentReceipts.length;
    const olderAvg =
      olderReceipts.reduce((sum, r) => sum + r.total, 0) / olderReceipts.length;

    const change =
      ((recentAvg - olderAvg) / olderAvg) *
      BUSINESS_RULES.ACHIEVEMENTS.PROGRESS_PERCENTAGE_MULTIPLIER;

    if (change > 5) return "increasing";
    if (change < -5) return "decreasing";
    return "stable";
  };

  const generateRecommendation = (store: StoreInsight): string => {
    if (store.priceCompetitiveness >= 80) {
      return "Excellent value - keep shopping here!";
    } else if (store.priceCompetitiveness >= 60) {
      return "Good value - consider this store for most items";
    } else if (store.priceCompetitiveness >= 40) {
      return "Fair value - shop selectively here";
    } else {
      return "Consider alternatives for better value";
    }
  };

  // Analyze store data from receipts
  const analyzeStoreData = useMemo(() => {
    if (!receipts.length) return [];

    const storeMap = new Map<string, StoreInsight>();

    receipts.forEach((receipt) => {
      const storeName = receipt.store?.name || "Unknown Store";
      const existing = storeMap.get(storeName) || {
        storeName,
        totalSpent: 0,
        visitCount: 0,
        averageSpend: 0,
        lastVisit: "",
        savingsIdentified: 0,
        priceCompetitiveness: 0,
        topCategories: [],
        priceTrend: "stable" as const,
        recommendation: "",
      };

      existing.totalSpent += receipt.total;
      existing.visitCount += 1;
      existing.lastVisit =
        receipt.ts > existing.lastVisit ? receipt.ts : existing.lastVisit;

      storeMap.set(storeName, existing);
    });

    // Calculate derived metrics
    return Array.from(storeMap.values()).map((store) => ({
      ...store,
      averageSpend: store.totalSpent / store.visitCount,
      priceCompetitiveness: calculatePriceCompetitiveness(store),
      priceTrend: calculatePriceTrend(store, receipts),
      recommendation: generateRecommendation(store),
    }));
  }, [receipts]);

  // Analyze shopping patterns
  const analyzeShoppingPatterns = useMemo(() => {
    if (!receipts.length) return null;

    const dayCounts = new Map<string, number>();
    const timeCounts = new Map<string, number>();
    const itemFrequency = new Map<string, number>();
    let totalSpent = 0;

    receipts.forEach((receipt) => {
      const date = new Date(receipt.ts);
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      const time =
        date.getHours() < 12
          ? "Morning"
          : date.getHours() < 17
          ? "Afternoon"
          : "Evening";

      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      timeCounts.set(time, (timeCounts.get(time) || 0) + 1);
      totalSpent += receipt.total;
    });

    const mostFrequentDay =
      Array.from(dayCounts.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "Unknown";
    const mostFrequentTime =
      Array.from(timeCounts.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "Unknown";

    // Find preferred store (most visits)
    const storeVisits = new Map<string, number>();
    receipts.forEach((receipt) => {
      const storeName = receipt.store?.name || "Unknown Store";
      storeVisits.set(storeName, (storeVisits.get(storeName) || 0) + 1);
    });
    const preferredStore =
      Array.from(storeVisits.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "Unknown Store";

    const averageWeeklySpend = totalSpent / (receipts.length * 7); // Rough estimate

    // TODO: Extract top items from receipt items for better analytics
    // Currently, items are not available in the Receipt interface
    // This would require fetching items separately or extending the Receipt interface
    const topItems: Array<{ name: string; frequency: number }> = [];

    return {
      preferredStore,
      averageWeeklySpend,
      mostFrequentDay,
      mostFrequentTime,
      topItems,
    };
  }, [receipts]);

  // Fetch price comparisons from API
  const fetchPriceComparisons = async (itemName: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${
          API_CONFIG.honoApiUrl
        }/api/v1/receipts/price-comparison/${encodeURIComponent(itemName)}`
      );

      if (response.ok) {
        const data: PriceComparison = await response.json();
        setPriceComparisons((prev) => [...prev, data]);
      }
    } catch (error) {
      logger.error("Failed to fetch price comparison", error as Error, {
        itemName,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get best value store
  const getBestValueStore = useMemo(() => {
    if (!storeInsights.length) return null;
    return storeInsights.reduce((best, current) =>
      current.priceCompetitiveness > best.priceCompetitiveness ? current : best
    );
  }, [storeInsights]);

  // Get store spending breakdown
  const getStoreSpendingBreakdown = useMemo(() => {
    return storeInsights.map((store) => ({
      storeName: store.storeName,
      percentage:
        (store.totalSpent /
          storeInsights.reduce((sum, s) => sum + s.totalSpent, 0)) *
        BUSINESS_RULES.ACHIEVEMENTS.PROGRESS_PERCENTAGE_MULTIPLIER,
      totalSpent: store.totalSpent,
    }));
  }, [storeInsights]);

  // Update insights when analysis changes
  useEffect(() => {
    setStoreInsights(analyzeStoreData);
  }, [analyzeStoreData]);

  useEffect(() => {
    setShoppingPatterns(analyzeShoppingPatterns);
  }, [analyzeShoppingPatterns]);

  return {
    storeInsights,
    priceComparisons,
    shoppingPatterns,
    loading,
    fetchPriceComparisons,
    getBestValueStore,
    getStoreSpendingBreakdown,
  };
};
