import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

export interface SpendingAnalytics {
  totalSpending: number;
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    count: number;
    color?: string;
    percentage: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    amount: number;
  }>;
  receiptCount: number;
  averageSpend: number;
}

export interface StoreAnalytics {
  storeName: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  averageSpend: number;
}

export interface SavingsAnalytics {
  totalSavings: number;
  totalCashback: number;
  totalSpent: number;
  savingsPercentage: number;
  receiptCount: number;
  averageSavings: number;
}

export const useRealAnalytics = () => {
  const { user } = useAuthContext();
  const [spendingAnalytics, setSpendingAnalytics] =
    useState<SpendingAnalytics | null>(null);
  const [storeAnalytics, setStoreAnalytics] = useState<StoreAnalytics[]>([]);
  const [savingsAnalytics, setSavingsAnalytics] =
    useState<SavingsAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpendingAnalytics = useCallback(async () => {
    if (!user) {
      setSpendingAnalytics(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from local API first
      if (API_CONFIG.isDevelopment) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(
            `${API_CONFIG.honoApiUrl}/api/v1/analytics/spending`,
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
            const data: SpendingAnalytics = await response.json();
            setSpendingAnalytics(data);
            logger.info("Fetched real spending analytics", {
              totalSpending: data.totalSpending,
              receiptCount: data.receiptCount,
            });
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          logger.warn(
            "Local API not available for spending analytics, using fallback"
          );
        }
      }

      // No fallback data - show empty state
      setSpendingAnalytics({
        totalSpending: 0,
        categoryBreakdown: [],
        weeklyTrends: [],
        receiptCount: 0,
        averageSpend: 0,
      });
      logger.info("No spending data available");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      logger.error("Spending analytics failed", error as Error);

      // No fallback data - show empty state
      setSpendingAnalytics({
        totalSpending: 0,
        categoryBreakdown: [],
        weeklyTrends: [],
        receiptCount: 0,
        averageSpend: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStoreAnalytics = useCallback(async () => {
    if (!user) {
      setStoreAnalytics([]);
      return;
    }

    try {
      // Try to fetch from local API first
      if (API_CONFIG.isDevelopment) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(
            `${API_CONFIG.honoApiUrl}/api/v1/analytics/stores`,
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
            const data: StoreAnalytics[] = await response.json();
            setStoreAnalytics(data);
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          logger.warn(
            "Local API not available for store analytics, using fallback"
          );
        }
      }

      // No fallback data - show empty state
      setStoreAnalytics([]);
    } catch (error) {
      logger.error("Store analytics failed", error as Error);
      setStoreAnalytics([]);
    }
  }, [user]);

  const fetchSavingsAnalytics = useCallback(async () => {
    if (!user) {
      setSavingsAnalytics(null);
      return;
    }

    try {
      // Try to fetch from local API first
      if (API_CONFIG.isDevelopment) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(
            `${API_CONFIG.honoApiUrl}/api/v1/analytics/savings`,
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
            const data: SavingsAnalytics = await response.json();
            setSavingsAnalytics(data);
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          logger.warn(
            "Local API not available for savings analytics, using fallback"
          );
        }
      }

      // No fallback data - show empty state
      setSavingsAnalytics(null);
    } catch (error) {
      logger.error("Savings analytics failed", error as Error);
      setSavingsAnalytics(null);
    }
  }, [user]);

  useEffect(() => {
    fetchSpendingAnalytics();
    fetchStoreAnalytics();
    fetchSavingsAnalytics();
  }, [fetchSpendingAnalytics, fetchStoreAnalytics, fetchSavingsAnalytics]);

  const getTopCategory = useCallback(() => {
    if (!spendingAnalytics?.categoryBreakdown.length) return null;
    return spendingAnalytics.categoryBreakdown[0];
  }, [spendingAnalytics]);

  const getTopStore = useCallback(() => {
    if (!storeAnalytics.length) return null;
    return storeAnalytics[0];
  }, [storeAnalytics]);

  const getWeeklySpendingTrend = useCallback(() => {
    if (!spendingAnalytics?.weeklyTrends.length) return "stable";

    const recentWeeks = spendingAnalytics.weeklyTrends.slice(-2);
    if (recentWeeks.length < 2) return "stable";

    const change =
      ((recentWeeks[1].amount - recentWeeks[0].amount) /
        recentWeeks[0].amount) *
      100;

    if (change > 10) return "increasing";
    if (change < -10) return "decreasing";
    return "stable";
  }, [spendingAnalytics]);

  return {
    spendingAnalytics,
    storeAnalytics,
    savingsAnalytics,
    loading,
    error,
    getTopCategory,
    getTopStore,
    getWeeklySpendingTrend,
    refetch: () => {
      fetchSpendingAnalytics();
      fetchStoreAnalytics();
      fetchSavingsAnalytics();
    },
  };
};
