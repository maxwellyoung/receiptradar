import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { Card, Text, Button, IconButton, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { useThemeContext } from "@/contexts/ThemeContext";
import { PriceIntelligence } from "./PriceIntelligence";

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

      // Spending insight with clear analysis
      if (insightData.totalSpent > 0) {
        const spendingLevel = getSpendingLevel(insightData.totalSpent);
        const avgPerItem = insightData.totalSpent / insightData.itemCount;

        let spendingMessage = "";
        if (spendingLevel === "small") {
          spendingMessage = `A modest $${insightData.totalSpent.toFixed(
            2
          )} for ${insightData.itemCount} items. That's $${avgPerItem.toFixed(
            2
          )} per item - efficient shopping.`;
        } else if (spendingLevel === "moderate") {
          spendingMessage = `$${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. Solid grocery shopping at $${avgPerItem.toFixed(
            2
          )} per item.`;
        } else if (spendingLevel === "large") {
          spendingMessage = `$${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. That's $${avgPerItem.toFixed(
            2
          )} per item - substantial shopping trip.`;
        } else {
          spendingMessage = `$${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. At $${avgPerItem.toFixed(
            2
          )} per item, this represents significant spending.`;
        }

        generatedInsights.push({
          id: "spending",
          type: "spending",
          title: "Spending Analysis",
          description: spendingMessage,
          icon: "account-balance-wallet",
          color: "#007AFF",
          priority: 1,
        });
      } else {
        // Default insight for no spending data
        generatedInsights.push({
          id: "no-data",
          type: "recommendation",
          title: "Ready to Start",
          description:
            "Scan your first receipt to unlock personalized insights and spending analysis.",
          icon: "camera-alt",
          color: "#007AFF",
          priority: 1,
        });
      }

      // Category insights with clear analysis
      const topCategories = Object.entries(insightData.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (topCategories.length > 0) {
        const [topCategory, topAmount] = topCategories[0];
        const categoryPercentage = (topAmount / insightData.totalSpent) * 100;

        let categoryMessage = "";
        if (categoryPercentage > 50) {
          categoryMessage = `${topCategory} dominates your spending at $${topAmount.toFixed(
            2
          )} (${categoryPercentage.toFixed(
            0
          )}% of total). Consider diversifying your purchases.`;
        } else if (categoryPercentage > 30) {
          categoryMessage = `${topCategory} leads your spending at $${topAmount.toFixed(
            2
          )} (${categoryPercentage.toFixed(
            0
          )}% of total). Good category distribution.`;
        } else {
          categoryMessage = `${topCategory} tops your spending at $${topAmount.toFixed(
            2
          )} (${categoryPercentage.toFixed(
            0
          )}% of total). Well-balanced shopping pattern.`;
        }

        generatedInsights.push({
          id: "category",
          type: "category",
          title: "Category Breakdown",
          description: categoryMessage,
          icon: "category",
          color: "#34C759",
          priority: 2,
        });
      } else if (insightData.totalSpent > 0) {
        // Insight for when there's spending but no categories
        generatedInsights.push({
          id: "no-categories",
          type: "category",
          title: "Category Analysis",
          description:
            "Your items will be automatically categorized to help you understand your spending patterns.",
          icon: "category",
          color: "#34C759",
          priority: 2,
        });
      }

      // Add helpful generic insights
      if (generatedInsights.length < 2) {
        const helpfulInsights = [
          {
            title: "Smart Tracking",
            description:
              "Great job keeping track of your spending! Regular tracking helps build better financial habits.",
            icon: "star",
            color: "#AF52DE",
          },
          {
            title: "Financial Awareness",
            description:
              "Every receipt scan builds your financial story. Understanding your spending is the first step to better money management.",
            icon: "visibility",
            color: "#5856D6",
          },
          {
            title: "Data-Driven Decisions",
            description:
              "Your spending patterns are becoming clearer. Use this data to make informed purchasing decisions.",
            icon: "analytics",
            color: "#FF2D92",
          },
          {
            title: "Getting Started",
            description:
              "The first receipt is the beginning. Continue scanning to unlock more insights and track your progress.",
            icon: "trending-up",
            color: "#FF9500",
          },
        ];

        const randomInsight =
          helpfulInsights[Math.floor(Math.random() * helpfulInsights.length)];
        generatedInsights.push({
          id: "helpful",
          type: "recommendation",
          ...randomInsight,
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

  const renderInsightCard = (insight: Insight, index: number) => (
    <Animated.View
      key={insight.id}
      style={[
        styles.insightCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: borderRadius.lg,
            ...shadows.md,
          },
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.insightHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: insight.color + "15" },
              ]}
            >
              <MaterialIcons
                name={insight.icon as any}
                size={24}
                color={insight.color}
              />
            </View>
            <View style={styles.insightTitleContainer}>
              <Text
                style={[typography.title2, { color: theme.colors.onSurface }]}
              >
                {insight.title}
              </Text>
            </View>
          </View>

          <Text
            style={[
              typography.body1,
              { color: theme.colors.onSurfaceVariant, marginTop: spacing.sm },
            ]}
          >
            {insight.description}
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  if (isGenerating) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <MaterialIcons
            name="psychology"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Analyzing your spending...</Text>
          <Text style={styles.loadingSubtext}>
            Generating personalized insights
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.xs },
          ]}
        >
          Weekly Insights
        </Text>
        <Text
          style={[typography.body1, { color: theme.colors.onSurfaceVariant }]}
        >
          Your spending analysis for {insightData.date}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {insights.map((insight, index) => renderInsightCard(insight, index))}

        {/* Price Intelligence Section */}
        {insightData.totalSpent > 0 && insightData.items.length > 0 && (
          <View style={styles.priceIntelligenceSection}>
            <Text
              style={[
                typography.title2,
                { color: theme.colors.onSurface, marginBottom: spacing.md },
              ]}
            >
              Price Intelligence
            </Text>
            <PriceIntelligence
              totalSpent={insightData.totalSpent}
              receiptItems={insightData.items}
            />
          </View>
        )}
      </ScrollView>

      {onDismiss && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.dismissButton}
          >
            Close
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  insightCard: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    padding: spacing.lg,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  insightTitleContainer: {
    flex: 1,
  },
  priceIntelligenceSection: {
    marginTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  dismissButton: {
    borderRadius: borderRadius.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.title2,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  loadingSubtext: {
    ...typography.body1,
    textAlign: "center",
    opacity: 0.7,
  },
});
