import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

export interface PriceComparisonData {
  storeName: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceCount: number;
  lastUpdated: string;
  store?: {
    name: string;
    location?: string;
  };
}

export interface PriceHistoryData {
  price: number;
  date: string;
  store?: string;
}

export const useRealPriceComparison = (itemName: string) => {
  const { user } = useAuthContext();
  const [priceComparisons, setPriceComparisons] = useState<
    PriceComparisonData[]
  >([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceComparison = useCallback(async () => {
    if (!itemName || !user) {
      setPriceComparisons([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from local API first
      if (API_CONFIG.isDevelopment) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
          const response = await fetch(
            `${
              API_CONFIG.honoApiUrl
            }/api/v1/analytics/price-comparison/${encodeURIComponent(
              itemName
            )}`,
            {
              signal: controller.signal,
              headers: {
                Authorization: `Bearer ${user.id}`, // Using user ID as token for now
                "Content-Type": "application/json",
              },
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data: PriceComparisonData[] = await response.json();
            setPriceComparisons(data);
            logger.info(`Fetched real price comparison for ${itemName}`, {
              count: data.length,
            });
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          logger.warn(
            "Local API not available for price comparison, using fallback",
            { error: apiError }
          );
        }
      }

      // No fallback data - show empty state
      setPriceComparisons([]);
      logger.info(`No price comparison data available for ${itemName}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      logger.error("Price comparison failed", error as Error, { itemName });

      // No fallback data - show empty state
      setPriceComparisons([]);
    } finally {
      setLoading(false);
    }
  }, [itemName, user]);

  const fetchPriceHistory = useCallback(async () => {
    if (!itemName || !user) {
      setPriceHistory([]);
      return;
    }

    try {
      // Try to fetch from local API first
      if (API_CONFIG.isDevelopment) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(
            `${
              API_CONFIG.honoApiUrl
            }/api/v1/analytics/price-history/${encodeURIComponent(itemName)}`,
            {
              signal: controller.signal,
              headers: {
                Authorization: `Bearer ${user.id}`,
                "Content-Type": "application/json",
              },
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data: PriceHistoryData[] = await response.json();
            setPriceHistory(data);
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          logger.warn(
            "Local API not available for price history, using fallback"
          );
        }
      }

      // No fallback data - show empty state
      setPriceHistory([]);
    } catch (error) {
      logger.error("Price history failed", error as Error, { itemName });
      setPriceHistory([]);
    }
  }, [itemName, user]);

  useEffect(() => {
    fetchPriceComparison();
    fetchPriceHistory();
  }, [fetchPriceComparison, fetchPriceHistory]);

  const getBestPrice = useCallback(() => {
    if (priceComparisons.length === 0) return null;
    return priceComparisons[0]; // Already sorted by price
  }, [priceComparisons]);

  const getPriceTrend = useCallback(() => {
    if (priceHistory.length < 2) return "stable";

    const recentPrices = priceHistory.slice(-7).map((p) => p.price);
    const olderPrices = priceHistory.slice(-14, -7).map((p) => p.price);

    if (recentPrices.length === 0 || olderPrices.length === 0) return "stable";

    const recentAvg =
      recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const olderAvg =
      olderPrices.reduce((sum, price) => sum + price, 0) / olderPrices.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return "increasing";
    if (change < -5) return "decreasing";
    return "stable";
  }, [priceHistory]);

  const getPotentialSavings = useCallback(
    (currentPrice: number) => {
      const bestPrice = getBestPrice();
      if (!bestPrice) return 0;

      const savings = currentPrice - bestPrice.averagePrice;
      return Math.max(0, savings);
    },
    [getBestPrice]
  );

  return {
    priceComparisons,
    priceHistory,
    loading,
    error,
    getBestPrice,
    getPriceTrend,
    getPotentialSavings,
    refetch: fetchPriceComparison,
  };
};
