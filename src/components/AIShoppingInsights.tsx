import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  useTheme,
  ActivityIndicator,
  ProgressBar,
} from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import {
  AppTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { API_CONFIG } from "@/constants/api";

interface PriceAnomaly {
  item: string;
  usual_price: number;
  current_price: number;
  difference: number;
  reasoning: string;
}

interface Substitution {
  expensive_item: string;
  cheaper_alternative: string;
  savings: number;
  confidence: number;
}

interface TimingRecommendation {
  item: string;
  best_day: string;
  best_store: string;
  reasoning: string;
}

interface StoreSwitching {
  current_store: string;
  better_store: string;
  potential_savings: number;
  items_to_switch: string[];
}

interface ShoppingInsights {
  price_anomalies: PriceAnomaly[];
  substitutions: Substitution[];
  timing_recommendations: TimingRecommendation[];
  store_switching: StoreSwitching[];
}

interface AIShoppingInsightsProps {
  userHistory: any[];
  currentBasket: any[];
  onInsightAction: (insight: any) => void;
}

export function AIShoppingInsights({
  userHistory,
  currentBasket,
  onInsightAction,
}: AIShoppingInsightsProps) {
  const theme = useTheme<AppTheme>();
  const [insights, setInsights] = useState<ShoppingInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  useEffect(() => {
    if (userHistory.length > 0 && currentBasket.length > 0) {
      generateInsights();
    }
  }, [userHistory, currentBasket]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/shopping-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_history: userHistory,
          current_basket: currentBasket,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      // Fallback to mock insights for demo
      setInsights(getMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const getMockInsights = (): ShoppingInsights => ({
    price_anomalies: [
      {
        item: "Milk 2L",
        usual_price: 4.5,
        current_price: 5.2,
        difference: 0.7,
        reasoning: "Price increased 15% from your usual store",
      },
    ],
    substitutions: [
      {
        expensive_item: "Premium Bread",
        cheaper_alternative: "Store Brand Bread",
        savings: 1.5,
        confidence: 0.85,
      },
    ],
    timing_recommendations: [
      {
        item: "Fresh Produce",
        best_day: "Wednesday",
        best_store: "Pak'nSave",
        reasoning: "Best deals on fresh produce mid-week",
      },
    ],
    store_switching: [
      {
        current_store: "Countdown",
        better_store: "Pak'nSave",
        potential_savings: 12.5,
        items_to_switch: ["Milk", "Bread", "Eggs"],
      },
    ],
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "price_anomaly":
        return "trending-up";
      case "substitution":
        return "swap-horiz";
      case "timing":
        return "schedule";
      case "store_switch":
        return "store";
      default:
        return "lightbulb";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "price_anomaly":
        return "#EF4444";
      case "substitution":
        return "#10B981";
      case "timing":
        return "#3B82F6";
      case "store_switch":
        return "#F59E0B";
      default:
        return theme.colors.primary;
    }
  };

  const renderPriceAnomaly = (anomaly: PriceAnomaly) => (
    <MotiView
      key={`anomaly-${anomaly.item}`}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600 }}
    >
      <Card style={[styles.insightCard, { borderLeftColor: "#EF4444" }]}>
        <Card.Content>
          <View style={styles.insightHeader}>
            <MaterialIcons name="trending-up" size={24} color="#EF4444" />
            <View style={styles.insightTitle}>
              <Text variant="titleMedium" style={{ color: "#EF4444" }}>
                Price Alert
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {anomaly.item}
              </Text>
            </View>
          </View>
          <View style={styles.priceComparison}>
            <Text variant="bodyMedium">
              Usual: {formatCurrency(anomaly.usual_price)}
            </Text>
            <Text variant="bodyMedium" style={{ color: "#EF4444" }}>
              Current: {formatCurrency(anomaly.current_price)}
            </Text>
            <Text variant="bodyMedium" style={{ color: "#EF4444" }}>
              +{formatCurrency(anomaly.difference)}
            </Text>
          </View>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
          >
            {anomaly.reasoning}
          </Text>
        </Card.Content>
      </Card>
    </MotiView>
  );

  const renderSubstitution = (sub: Substitution) => (
    <MotiView
      key={`sub-${sub.expensive_item}`}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 100 }}
    >
      <Card style={[styles.insightCard, { borderLeftColor: "#10B981" }]}>
        <Card.Content>
          <View style={styles.insightHeader}>
            <MaterialIcons name="swap-horiz" size={24} color="#10B981" />
            <View style={styles.insightTitle}>
              <Text variant="titleMedium" style={{ color: "#10B981" }}>
                Save Money
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Switch to cheaper alternative
              </Text>
            </View>
          </View>
          <View style={styles.substitutionDetails}>
            <Text variant="bodyMedium">
              Instead of:{" "}
              <Text style={{ fontWeight: "bold" }}>{sub.expensive_item}</Text>
            </Text>
            <Text variant="bodyMedium">
              Try:{" "}
              <Text style={{ fontWeight: "bold", color: "#10B981" }}>
                {sub.cheaper_alternative}
              </Text>
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: "#10B981", marginTop: 8 }}
            >
              Save {formatCurrency(sub.savings)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  const renderStoreSwitching = (switching: StoreSwitching) => (
    <MotiView
      key={`switch-${switching.current_store}`}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay: 200 }}
    >
      <Card style={[styles.insightCard, { borderLeftColor: "#F59E0B" }]}>
        <Card.Content>
          <View style={styles.insightHeader}>
            <MaterialIcons name="store" size={24} color="#F59E0B" />
            <View style={styles.insightTitle}>
              <Text variant="titleMedium" style={{ color: "#F59E0B" }}>
                Store Switch
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Better prices elsewhere
              </Text>
            </View>
          </View>
          <View style={styles.storeSwitchDetails}>
            <Text variant="bodyMedium">
              Switch from{" "}
              <Text style={{ fontWeight: "bold" }}>
                {switching.current_store}
              </Text>{" "}
              to{" "}
              <Text style={{ fontWeight: "bold", color: "#F59E0B" }}>
                {switching.better_store}
              </Text>
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: "#F59E0B", marginTop: 8 }}
            >
              Save {formatCurrency(switching.potential_savings)}
            </Text>
            <View style={styles.itemsToSwitch}>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Items to switch: {switching.items_to_switch.join(", ")}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          variant="bodyMedium"
          style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}
        >
          Analyzing your shopping patterns...
        </Text>
      </View>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons
          name="psychology"
          size={24}
          color={theme.colors.primary}
        />
        <Text
          variant="headlineSmall"
          style={{ marginLeft: 8, color: theme.colors.onSurface }}
        >
          AI Shopping Insights
        </Text>
      </View>

      {insights.price_anomalies.length > 0 && (
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, color: theme.colors.onSurface }}
          >
            Price Alerts
          </Text>
          {insights.price_anomalies.map(renderPriceAnomaly)}
        </View>
      )}

      {insights.substitutions.length > 0 && (
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, color: theme.colors.onSurface }}
          >
            Money-Saving Alternatives
          </Text>
          {insights.substitutions.map(renderSubstitution)}
        </View>
      )}

      {insights.store_switching.length > 0 && (
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, color: theme.colors.onSurface }}
          >
            Store Recommendations
          </Text>
          {insights.store_switching.map(renderStoreSwitching)}
        </View>
      )}

      {insights.timing_recommendations.length > 0 && (
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, color: theme.colors.onSurface }}
          >
            Timing Tips
          </Text>
          {insights.timing_recommendations.map((rec) => (
            <MotiView
              key={`timing-${rec.item}`}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 600, delay: 300 }}
            >
              <Card
                style={[styles.insightCard, { borderLeftColor: "#3B82F6" }]}
              >
                <Card.Content>
                  <View style={styles.insightHeader}>
                    <MaterialIcons name="schedule" size={24} color="#3B82F6" />
                    <View style={styles.insightTitle}>
                      <Text variant="titleMedium" style={{ color: "#3B82F6" }}>
                        Best Time to Buy
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        {rec.item}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                    Buy on{" "}
                    <Text style={{ fontWeight: "bold" }}>{rec.best_day}</Text>{" "}
                    at{" "}
                    <Text style={{ fontWeight: "bold", color: "#3B82F6" }}>
                      {rec.best_store}
                    </Text>
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                    }}
                  >
                    {rec.reasoning}
                  </Text>
                </Card.Content>
              </Card>
            </MotiView>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  insightCard: {
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  insightTitle: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  priceComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  substitutionDetails: {
    marginTop: spacing.xs,
  },
  storeSwitchDetails: {
    marginTop: spacing.xs,
  },
  itemsToSwitch: {
    marginTop: spacing.xs,
    padding: spacing.xs,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: borderRadius.sm,
  },
});
