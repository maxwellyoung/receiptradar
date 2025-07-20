import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text, Card, Button, Chip, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { AppTheme } from "@/constants/theme";

interface PriceInsight {
  id: string;
  type: "savings" | "warning" | "tip" | "comparison";
  title: string;
  description: string;
  savings?: number;
  icon: string;
  color: string;
  priority: number;
}

interface PriceIntelligenceProps {
  receiptItems: Array<{
    name: string;
    price: number;
    category?: string;
  }>;
  totalSpent: number;
}

export function PriceIntelligence({
  receiptItems,
  totalSpent,
}: PriceIntelligenceProps) {
  const theme = useTheme<AppTheme>();
  const [insights, setInsights] = useState<PriceInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    analyzePrices();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [receiptItems]);

  const analyzePrices = () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const generatedInsights: PriceInsight[] = [];

      // Calculate average item price
      const avgItemPrice = totalSpent / receiptItems.length;

      // Find expensive items
      const expensiveItems = receiptItems.filter(
        (item) => item.price > avgItemPrice * 1.5
      );

      if (expensiveItems.length > 0) {
        const mostExpensive = expensiveItems[0];
        const potentialSavings = mostExpensive.price * 0.2; // Assume 20% savings with alternatives

        generatedInsights.push({
          id: "expensive-item",
          type: "warning",
          title: "Premium Item Alert",
          description: `${
            mostExpensive.name
          } cost $${mostExpensive.price.toFixed(
            2
          )}. Consider generic alternatives to save ~$${potentialSavings.toFixed(
            2
          )}.`,
          savings: potentialSavings,
          icon: "lightbulb",
          color: "#FF6B35",
          priority: 1,
        });
      }

      // Store comparison
      if (totalSpent > 100) {
        const estimatedSavings = totalSpent * 0.08; // Assume 8% savings at different store
        generatedInsights.push({
          id: "store-comparison",
          type: "comparison",
          title: "Store Comparison",
          description: `Similar items at Pak'nSave could save you ~$${estimatedSavings.toFixed(
            2
          )} on this trip.`,
          savings: estimatedSavings,
          icon: "store",
          color: "#007AFF",
          priority: 2,
        });
      }

      // Add generic tip if not enough insights
      if (generatedInsights.length < 2) {
        generatedInsights.push({
          id: "general-tip",
          type: "tip",
          title: "Smart Shopping Tip",
          description:
            "Consider shopping on weekdays when stores often have better deals and less crowds.",
          icon: "calendar",
          color: "#FF9500",
          priority: 3,
        });
      }

      setInsights(generatedInsights.sort((a, b) => a.priority - b.priority));
      setIsAnalyzing(false);
    }, 2000);
  };

  const renderInsight = (insight: PriceInsight) => (
    <Animated.View
      key={insight.id}
      style={[styles.insightCard, { opacity: fadeAnim }]}
    >
      <Card style={[styles.card, { borderLeftColor: insight.color }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.insightHeader}>
            <View
              style={[styles.iconContainer, { backgroundColor: insight.color }]}
            >
              <MaterialIcons
                name={insight.icon as any}
                size={20}
                color="white"
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
              {insight.savings && (
                <Chip
                  style={[
                    styles.savingsChip,
                    { backgroundColor: insight.color + "20" },
                  ]}
                  textStyle={{ color: insight.color, fontWeight: "600" }}
                >
                  Save ${insight.savings.toFixed(2)}
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  if (isAnalyzing) {
    return (
      <Card style={styles.loadingCard}>
        <Card.Content style={styles.loadingContent}>
          <MaterialIcons
            name="psychology"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingTitle}>Analyzing Prices...</Text>
          <Text style={styles.loadingSubtext}>
            The worm is comparing prices across stores
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const totalPotentialSavings = insights.reduce(
    (sum, insight) => sum + (insight.savings || 0),
    0
  );

  return (
    <View style={styles.container}>
      {insights.map(renderInsight)}

      {totalPotentialSavings > 0 && (
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Potential Savings</Text>
            <Text style={styles.summaryAmount}>
              ${totalPotentialSavings.toFixed(2)}
            </Text>
            <Text style={styles.summarySubtext}>
              Based on price comparisons and shopping tips
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  loadingCard: {
    ...shadows.sm,
  },
  loadingContent: {
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingTitle: {
    ...typography.headline3,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  loadingSubtext: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
  },
  insightCard: {
    marginBottom: spacing.md,
  },
  card: {
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  cardContent: {
    padding: spacing.lg,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...typography.headline1,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.body2,
    color: "#666",
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  savingsChip: {
    alignSelf: "flex-start",
  },
  summaryCard: {
    ...shadows.sm,
  },
  summaryContent: {
    alignItems: "center",
    padding: spacing.lg,
  },
  summaryTitle: {
    ...typography.headline3,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    ...typography.headline2,
    color: "#34C759",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
  },
});
