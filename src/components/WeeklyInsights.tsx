import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import {
  Card,
  Text,
  Button,
  Chip,
  IconButton,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { useThemeContext } from "@/contexts/ThemeContext";

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  confidence: number;
}

export interface InsightData {
  totalSpent: number;
  itemCount: number;
  categories: { [key: string]: number };
  storeName: string;
  date: string;
  items: ReceiptItem[];
}

interface WeeklyInsightsProps {
  insightData: InsightData;
  onDismiss?: () => void;
}

interface Insight {
  id: string;
  type: "spending" | "category" | "trend" | "recommendation";
  title: string;
  description: string;
  icon: string;
  color: string;
  priority: number;
}

export function WeeklyInsights({
  insightData,
  onDismiss,
}: WeeklyInsightsProps) {
  const { theme } = useThemeContext();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);

  // Safety check for undefined insightData
  if (!insightData) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error" size={48} color="#FF6B35" />
          <Text style={styles.loadingText}>No data available</Text>
          <Text style={styles.loadingSubtext}>Please try again</Text>
        </View>
      </View>
    );
  }

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    generateInsights();

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [insightData]);

  const generateInsights = () => {
    setIsGenerating(true);

    // Simulate AI processing time
    setTimeout(() => {
      const generatedInsights: Insight[] = [];

      // Spending insight
      if (insightData.totalSpent > 0) {
        const spendingLevel = getSpendingLevel(insightData.totalSpent);
        generatedInsights.push({
          id: "spending",
          type: "spending",
          title: "Spending Overview",
          description: `You spent $${insightData.totalSpent.toFixed(2)} on ${
            insightData.itemCount
          } items. This is a ${spendingLevel} shopping trip.`,
          icon: "shopping-cart",
          color: "#007AFF",
          priority: 1,
        });
      }

      // Category insights
      const topCategories = Object.entries(insightData.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (topCategories.length > 0) {
        const [topCategory, topAmount] = topCategories[0];
        generatedInsights.push({
          id: "category",
          type: "category",
          title: "Top Category",
          description: `${topCategory} was your biggest expense at $${topAmount.toFixed(
            2
          )}. Consider if this aligns with your budget goals.`,
          icon: "category",
          color: "#34C759",
          priority: 2,
        });
      }

      // Trend insights
      if (insightData.itemCount > 5) {
        generatedInsights.push({
          id: "trend",
          type: "trend",
          title: "Bulk Shopping",
          description: `You bought ${insightData.itemCount} items - this looks like a major grocery run! Planning ahead can help with budgeting.`,
          icon: "trending-up",
          color: "#FF9500",
          priority: 3,
        });
      }

      // Recommendations
      const avgItemPrice = insightData.totalSpent / insightData.itemCount;
      if (avgItemPrice > 10) {
        generatedInsights.push({
          id: "recommendation",
          type: "recommendation",
          title: "Premium Items",
          description: `Average item price is $${avgItemPrice.toFixed(
            2
          )}. Consider generic alternatives for some items to save money.`,
          icon: "lightbulb",
          color: "#FF6B35",
          priority: 4,
        });
      }

      // Add generic insights if we don't have enough
      if (generatedInsights.length < 3) {
        generatedInsights.push({
          id: "general",
          type: "recommendation",
          title: "Smart Shopping",
          description:
            "Great job tracking your spending! Consider setting up budget alerts for future shopping trips.",
          icon: "star",
          color: "#AF52DE",
          priority: 5,
        });
      }

      setInsights(generatedInsights.sort((a, b) => a.priority - b.priority));
      setIsGenerating(false);
    }, 1500);
  };

  const getSpendingLevel = (amount: number): string => {
    if (amount < 30) return "small";
    if (amount < 80) return "moderate";
    if (amount < 150) return "large";
    return "major";
  };

  const getCategoryBreakdown = () => {
    return Object.entries(insightData.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const renderInsightCard = (insight: Insight, index: number) => (
    <Animated.View
      key={insight.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={[styles.insightCard, { borderLeftColor: insight.color }]}>
        <Card.Content>
          <View style={styles.insightHeader}>
            <View
              style={[styles.iconContainer, { backgroundColor: insight.color }]}
            >
              <MaterialIcons
                name={insight.icon as any}
                size={24}
                color="white"
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCategoryBreakdown = () => {
    const categories = getCategoryBreakdown();

    return (
      <Card style={styles.categoryCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryList}>
            {categories.map(([category, amount], index) => (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryAmount}>
                    ${amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${(amount / insightData.totalSpent) * 100}%`,
                        backgroundColor: getCategoryColor(index),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getCategoryColor = (index: number): string => {
    const colors = ["#007AFF", "#34C759", "#FF9500", "#FF6B35", "#AF52DE"];
    return colors[index % colors.length];
  };

  if (isGenerating) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <MaterialIcons name="psychology" size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Generating insights...</Text>
          <Text style={styles.loadingSubtext}>
            Analyzing your shopping patterns
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Insights</Text>
          <Text style={styles.subtitle}>
            {insightData.storeName} •{" "}
            {new Date(insightData.date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.summaryCards}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>
                ${insightData.totalSpent.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{insightData.itemCount}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Categories</Text>
              <Text style={styles.summaryValue}>
                {Object.keys(insightData.categories).length}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {insights.map((insight, index) => renderInsightCard(insight, index))}
        </View>

        {renderCategoryBreakdown()}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => {
              /* Navigate to trends */
            }}
            style={styles.actionButton}
            icon="trending-up"
          >
            View Trends
          </Button>

          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.actionButton}
          >
            Done
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.headline3,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  loadingSubtext: {
    ...typography.body2,
    color: "#666",
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    ...shadows.sm,
  },
  summaryLabel: {
    ...typography.caption1,
    color: "#666",
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.headline3,
    fontWeight: "600",
  },
  insightsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline3,
    marginBottom: spacing.md,
  },
  insightCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    lineHeight: 20,
  },
  categoryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {
    gap: spacing.xs,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryName: {
    ...typography.body2,
    fontWeight: "500",
  },
  categoryAmount: {
    ...typography.body2,
    fontWeight: "600",
  },
  categoryBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
