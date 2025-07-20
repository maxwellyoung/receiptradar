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

      // Spending insight with personality
      if (insightData.totalSpent > 0) {
        const spendingLevel = getSpendingLevel(insightData.totalSpent);
        const avgPerItem = insightData.totalSpent / insightData.itemCount;

        let spendingMessage = "";
        if (spendingLevel === "small") {
          spendingMessage = `A tidy $${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. That's $${avgPerItem.toFixed(
            2
          )} per item - the worm is impressed with your restraint.`;
        } else if (spendingLevel === "moderate") {
          spendingMessage = `$${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. Solid grocery game at $${avgPerItem.toFixed(2)} per item.`;
        } else if (spendingLevel === "large") {
          spendingMessage = `$${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. That's $${avgPerItem.toFixed(
            2
          )} per item - someone's been shopping!`;
        } else {
          spendingMessage = `$${insightData.totalSpent.toFixed(2)} for ${
            insightData.itemCount
          } items. At $${avgPerItem.toFixed(
            2
          )} per item, the worm is taking notes on your lifestyle choices.`;
        }

        generatedInsights.push({
          id: "spending",
          type: "spending",
          title: "Spending Breakdown",
          description: spendingMessage,
          icon: "shopping-cart",
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

      // Category insights with personality
      const topCategories = Object.entries(insightData.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (topCategories.length > 0) {
        const [topCategory, topAmount] = topCategories[0];
        const categoryPercentage = (topAmount / insightData.totalSpent) * 100;

        let categoryMessage = "";
        if (categoryPercentage > 50) {
          categoryMessage = `${topCategory} dominates at $${topAmount.toFixed(
            2
          )} (${categoryPercentage.toFixed(
            0
          )}% of total). The worm wonders if you're a specialist.`;
        } else if (categoryPercentage > 30) {
          categoryMessage = `${topCategory} leads at $${topAmount.toFixed(
            2
          )} (${categoryPercentage.toFixed(
            0
          )}% of total). Good category management.`;
        } else {
          categoryMessage = `${topCategory} tops the list at $${topAmount.toFixed(
            2
          )} (${categoryPercentage.toFixed(
            0
          )}% of total). Well-balanced shopping.`;
        }

        generatedInsights.push({
          id: "category",
          type: "category",
          title: "Category Champion",
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

      // Add personality-driven generic insights
      if (generatedInsights.length < 2) {
        const randomInsights = [
          {
            title: "Smart Tracking",
            description:
              "Great job keeping tabs on your spending! The worm is taking notes on your financial mindfulness.",
            icon: "star",
            color: "#AF52DE",
          },
          {
            title: "Receipt Warrior",
            description:
              "Every scan builds your financial story. The worm appreciates your dedication to transparency.",
            icon: "shield",
            color: "#5856D6",
          },
          {
            title: "Data Enthusiast",
            description:
              "Your spending patterns are becoming clearer. The worm loves a good data story.",
            icon: "analytics",
            color: "#FF2D92",
          },
          {
            title: "Getting Started",
            description:
              "The first receipt is the hardest. Once you start scanning, insights will flow naturally.",
            icon: "trending-up",
            color: "#FF9500",
          },
        ];

        const randomInsight =
          randomInsights[Math.floor(Math.random() * randomInsights.length)];
        generatedInsights.push({
          id: "personality",
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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clean Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Insights</Text>
          <Text style={styles.subtitle}>
            {insightData.storeName} •{" "}
            {new Date(insightData.date).toLocaleDateString()}
          </Text>
        </View>

        {/* Compact Data Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryValue}>
                  ${insightData.totalSpent.toFixed(2)}
                </Text>
                <Text style={styles.summarySubtext}>
                  {insightData.itemCount > 0
                    ? `${insightData.itemCount} items • $${(
                        insightData.totalSpent / insightData.itemCount
                      ).toFixed(2)} avg`
                    : "No items yet"}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryColumn}>
                <Text style={styles.summaryLabel}>Categories</Text>
                <Text style={styles.summaryValue}>
                  {Object.keys(insightData.categories).length}
                </Text>
                <Text style={styles.summarySubtext}>
                  {Object.keys(insightData.categories).length > 0
                    ? "Tracked automatically"
                    : "Will appear as you scan"}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Compact Context - Only when meaningful */}
        {insightData.totalSpent > 0 && (
          <Card style={styles.contextCard}>
            <Card.Content style={styles.contextContent}>
              <Text style={styles.contextMessage}>
                {insightData.totalSpent < 30
                  ? "A modest shopping day. Well done."
                  : insightData.totalSpent < 80
                  ? "Solid grocery run. Nothing unusual here."
                  : insightData.totalSpent < 150
                  ? "Someone's been shopping. Let's see the details."
                  : "Big shopping day. The details are interesting."}
              </Text>
              {insightData.totalSpent > 150 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badge}>Big Spender</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Compact AI Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>AI Insights</Text>

          {insights.length > 0 ? (
            <View style={styles.insightsList}>
              {insights.map((insight, index) =>
                renderInsightCard(insight, index)
              )}
            </View>
          ) : (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Text style={styles.emptyStateTitle}>
                  {insightData.totalSpent > 0
                    ? "Analyzing..."
                    : "Ready to Start"}
                </Text>
                <Text style={styles.emptyStateMessage}>
                  {insightData.totalSpent > 0
                    ? "Your spending patterns are being analyzed. Insights will appear here."
                    : "Scan your first receipt to unlock personalized insights and spending analysis."}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Price Intelligence - Only if items exist */}
        {insightData.items.length > 0 && (
          <View style={styles.priceIntelligenceSection}>
            <Text style={styles.sectionTitle}>Price Analysis</Text>
            <PriceIntelligence
              receiptItems={insightData.items}
              totalSpent={insightData.totalSpent}
            />
          </View>
        )}

        {/* Clean Actions */}
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
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: "center",
  },
  title: {
    ...typography.headline3,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
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
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  summaryContent: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  summaryColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  summaryLabel: {
    ...typography.caption1,
    color: "#666",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  summaryValue: {
    ...typography.headline2,
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: spacing.lg,
  },
  summarySubtext: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
  },
  contextCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  contextContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  contextMessage: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  badgeContainer: {
    backgroundColor: "#f0f0f0",
    padding: spacing.sm,
    borderRadius: 16,
    ...typography.headline3,
    fontWeight: "600",
  },
  badge: {
    ...typography.headline3,
    fontWeight: "600",
  },
  insightsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  insightsTitle: {
    ...typography.headline3,
    marginBottom: spacing.lg,
    textAlign: "center",
    color: "#333",
  },
  insightsList: {
    padding: spacing.md,
  },
  emptyStateCard: {
    ...shadows.sm,
  },
  emptyStateContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyStateTitle: {
    ...typography.headline3,
    marginBottom: spacing.xs,
  },
  emptyStateMessage: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
  },
  priceIntelligenceSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline3,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  insightCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
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
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
