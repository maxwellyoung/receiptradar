import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "react-native-paper";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

// TODO: Consolidate these types, they are duplicated or similar in PriceIntelligence.tsx
interface SavingsOpportunity {
  item_name: string;
  current_price: number;
  best_price: number;
  savings: number;
  store_name: string;
  confidence: number;
  price_history_points: number;
}

interface BasketAnalysis {
  total_savings: number;
  savings_opportunities: SavingsOpportunity[];
  store_recommendation?: string;
  cashback_available: number;
}

interface PriceHistoryPoint {
  price: number;
  date: string;
  store_name: string;
  confidence: number;
}

type PriceHistory = {
  price: number;
  date: string;
  store_name: string;
};

type PriceInsight = {
  message: string;
  icon: "trending-up" | "trending-down" | "trending-flat" | "info-outline";
  color: string;
};

export const usePriceIntelligence = (
  itemName: string,
  currentPrice: number
) => {
  const { user } = useAuthContext();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [insight, setInsight] = useState<PriceInsight | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (itemName && user) {
      analyzeSavings();
    }
  }, [itemName, user]);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!itemName) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${
            API_CONFIG.honoApiUrl
          }/api/v1/receipts/price-history/${encodeURIComponent(itemName)}`
        );

        if (response.status === 404) {
          setInsight({
            message: "First time seeing this item!",
            icon: "info-outline",
            color: theme.colors.tertiary,
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: PriceHistory[] = await response.json();
        setHistory(data);
        generateInsight(data);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to fetch price history", err, { itemName });
        setInsight(null); // Or set an error state
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [itemName, currentPrice]);

  const analyzeSavings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_OCR_URL}/analyze-savings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                name: itemName,
                price: currentPrice,
                quantity: 1,
                category: "",
              },
            ],
            store_id: "",
            user_id: user.id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        logger.error("Failed to analyze savings", undefined, {
          component: "usePriceIntelligence",
        });
      }
    } catch (error) {
      logger.error("Error analyzing savings", error as Error, {
        component: "usePriceIntelligence",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriceHistory = async (itemName: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_OCR_URL}/price-history/${encodeURIComponent(
          itemName
        )}?days=90`
      );

      if (response.ok) {
        const data = await response.json();
        setPriceHistory(data.price_history);
        setSelectedItem(itemName);
      }
    } catch (error) {
      logger.error("Error fetching price history", error as Error, {
        component: "usePriceIntelligence",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.6) return "#F59E0B";
    return "#EF4444";
  };

  const generateInsight = (data: PriceHistory[]) => {
    if (data.length === 0) {
      setInsight({
        message: "First time we've seen this item!",
        icon: "info-outline",
        color: theme.colors.tertiary,
      });
      return;
    }

    // Exclude current purchase for comparison
    const otherPurchases = data.filter((p) => p.price !== currentPrice);
    if (otherPurchases.length === 0) {
      setInsight({
        message: "Price is stable.",
        icon: "trending-flat",
        color: theme.colors.onSurfaceVariant,
      });
      return;
    }

    const avgPrice =
      otherPurchases.reduce((acc, p) => acc + p.price, 0) /
      otherPurchases.length;
    const priceDiff = currentPrice - avgPrice;

    if (priceDiff > 0) {
      setInsight({
        message: `Paid $${priceDiff.toFixed(2)} more than average`,
        icon: "trending-up",
        color: theme.colors.error,
      });
    } else if (priceDiff < 0) {
      setInsight({
        message: `Saved $${Math.abs(priceDiff).toFixed(2)} vs average!`,
        icon: "trending-down",
        color: "green",
      });
    } else {
      setInsight({
        message: "Price is right at the average.",
        icon: "trending-flat",
        color: theme.colors.onSurfaceVariant,
      });
    }
  };

  return {
    analysis,
    loading,
    selectedItem,
    priceHistory,
    insight,
    getPriceHistory,
    formatCurrency,
    getConfidenceColor,
    setSelectedItem,
  };
};
