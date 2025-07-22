import React, { useState, useEffect } from "react";
import { View, Dimensions } from "react-native";
import { Text, ActivityIndicator, Card, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

interface ItemPriceInsightProps {
  itemName: string;
  currentPrice: number;
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

export function ItemPriceInsight({
  itemName,
  currentPrice,
}: ItemPriceInsightProps) {
  const [insight, setInsight] = useState<PriceInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const theme = useTheme();

  useEffect(() => {
    let isMounted = true;
    const fetchPriceHistory = async () => {
      if (!itemName) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `${
            API_CONFIG.honoApiUrl
          }/api/v1/receipts/price-history/${encodeURIComponent(itemName)}`
        );

        if (!isMounted) return;

        if (response.status === 404) {
          setInsight({
            message: "First time seeing this item!",
            icon: "info-outline",
            color: theme.colors.tertiary,
          });
          return;
        }

        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status} ${await response.text()}`
          );
        }

        const data: PriceHistory[] = await response.json();
        setHistory(data);
        generateInsight(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to fetch price history", error, { itemName });
        setInsight(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPriceHistory();
    return () => {
      isMounted = false;
    };
  }, [itemName, currentPrice]);

  const generateInsight = (data: PriceHistory[]) => {
    if (data.length === 0) {
      setInsight({
        message: "First time we've seen this item!",
        icon: "info-outline",
        color: theme.colors.tertiary,
      });
      return;
    }

    // Find the most recent purchase that isn't this one to compare against
    const otherPurchases = data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

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

    if (Math.abs(priceDiff) < 0.01) {
      setInsight({
        message: "Price is right at the average.",
        icon: "trending-flat",
        color: theme.colors.onSurfaceVariant,
      });
    } else if (priceDiff > 0) {
      setInsight({
        message: `Paid $${priceDiff.toFixed(2)} more than average`,
        icon: "trending-up",
        color: theme.colors.error,
      });
    } else if (priceDiff < 0) {
      setInsight({
        message: `Saved $${Math.abs(priceDiff).toFixed(2)} vs average!`,
        icon: "trending-down",
        color: "#22c55e",
      }); // Use a nice green
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="small"
        style={{ alignSelf: "center", paddingVertical: 12 }}
      />
    );
  }

  if (!insight) {
    return null; // Don't show anything if there's no insight or an error
  }

  // Define chart data and config inside the render body to access state/props
  const chartData = {
    labels: history
      .map((p) =>
        new Date(p.date).toLocaleDateString("en-NZ", {
          day: "numeric",
          month: "short",
        })
      )
      .reverse(),
    datasets: [
      {
        data: history.map((p) => p.price).reverse(),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#FFFFFF00", // Transparent
    backgroundGradientTo: "#FFFFFF00", // Transparent
    color: (opacity = 1) => insight.color,
    strokeWidth: 2,
    useShadowsForSmoothLine: true,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: insight.color,
    },
  };

  return (
    <Card
      style={{
        marginTop: 8,
        backgroundColor: insight.color + "1A",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: history.length > 1 ? 8 : 0,
          }}
        >
          <MaterialIcons name={insight.icon} size={18} color={insight.color} />
          <Text
            style={{
              marginLeft: 8,
              color: theme.colors.onSurface,
              flex: 1,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {insight.message}
          </Text>
        </View>
        {history.length > 1 && (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 90}
            height={80}
            chartConfig={chartConfig}
            withHorizontalLabels={false}
            withVerticalLabels={false}
            withInnerLines={false}
            withOuterLines={false}
            withShadow={false}
            bezier
            style={{ marginLeft: -16, paddingRight: 32, paddingBottom: 0 }}
          />
        )}
      </Card.Content>
    </Card>
  );
}
