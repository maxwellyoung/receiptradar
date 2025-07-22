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
import { logger } from "@/utils/logger";

interface PriceInsight {
  id: string;
  type: "savings" | "warning" | "tip" | "comparison" | "trend";
  title: string;
  description: string;
  savings?: number;
  icon: string;
  color: string;
  priority: number;
  confidence: number;
  actionText?: string;
  actionUrl?: string;
}

interface StoreComparison {
  storeName: string;
  totalSpent: number;
  averageSpend: number;
  visitCount: number;
  priceCompetitiveness: number;
  savingsOpportunities: number;
  lastVisit: string;
}

interface SavingsOpportunity {
  itemName: string;
  currentPrice: number;
  bestPrice: number;
  savings: number;
  storeName: string;
  confidence: number;
  priceHistoryPoints: number;
}

interface EnhancedPriceIntelligenceProps {
  receiptItems: Array<{
    name: string;
    price: number;
    category?: string;
  }>;
  totalSpent: number;
  storeName?: string;
}

export function EnhancedPriceIntelligence({
  receiptItems,
  totalSpent,
  storeName,
}: EnhancedPriceIntelligenceProps) {
  const theme = useTheme<AppTheme>();
  const [insights, setInsights] = useState<PriceInsight[]>([]);
  const [storeComparisons, setStoreComparisons] = useState<StoreComparison[]>(
    []
  );
  const [savingsOpportunities, setSavingsOpportunities] = useState<
    SavingsOpportunity[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [showDetailedComparison, setShowDetailedComparison] = useState(false);

  useEffect(() => {
    analyzePrices();
  }, [receiptItems]);

  const analyzePrices = async () => {
    setIsAnalyzing(true);

    try {
      // Simulate comprehensive analysis
      setTimeout(() => {
        const generatedInsights: PriceInsight[] = [];
        const generatedComparisons: StoreComparison[] = [];
        const generatedOpportunities: SavingsOpportunity[] = [];

        // Calculate average item price
        const avgItemPrice = totalSpent / receiptItems.length;

        // Find expensive items and suggest alternatives
        const expensiveItems = receiptItems.filter(
          (item) => item.price > avgItemPrice * 1.5
        );

        if (expensiveItems.length > 0) {
          const mostExpensive = expensiveItems[0];
          const potentialSavings = mostExpensive.price * 0.25;

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
            confidence: 0.85,
            actionText: "Find Alternatives",
          });

          // Add savings opportunity
          generatedOpportunities.push({
            itemName: mostExpensive.name,
            currentPrice: mostExpensive.price,
            bestPrice: mostExpensive.price * 0.75,
            savings: potentialSavings,
            storeName: "Pak'nSave",
            confidence: 0.8,
            priceHistoryPoints: 12,
          });
        }

        // Store comparison analysis
        if (totalSpent > 50) {
          const estimatedSavings = totalSpent * 0.12;
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
            confidence: 0.75,
            actionText: "Compare Stores",
          });

          // Generate store comparisons
          const stores = [
            "Countdown",
            "Pak'nSave",
            "New World",
            "Fresh Choice",
          ];
          stores.forEach((store, index) => {
            generatedComparisons.push({
              storeName: store,
              totalSpent: totalSpent * (0.8 + index * 0.1),
              averageSpend: (totalSpent * (0.8 + index * 0.1)) / 3,
              visitCount: 3 + index,
              priceCompetitiveness: 85 - index * 15,
              savingsOpportunities: Math.floor(Math.random() * 5) + 1,
              lastVisit: new Date(
                Date.now() - Math.random() * 86400000 * 7
              ).toISOString(),
            });
          });
        }

        // Price trend analysis
        const priceTrend = Math.random() > 0.5 ? "increasing" : "decreasing";
        const trendSavings = totalSpent * 0.05;

        generatedInsights.push({
          id: "price-trend",
          type: "trend",
          title: "Price Trend Alert",
          description: `Prices for your items are ${priceTrend}. Consider ${
            priceTrend === "increasing"
              ? "stocking up"
              : "waiting for better deals"
          }.`,
          savings: trendSavings,
          icon: priceTrend === "increasing" ? "trending-up" : "trending-down",
          color: priceTrend === "increasing" ? "#EF4444" : "#10B981",
          priority: 3,
          confidence: 0.7,
          actionText: "View Trends",
        });

        // Add generic tip if not enough insights
        if (generatedInsights.length < 3) {
          generatedInsights.push({
            id: "general-tip",
            type: "tip",
            title: "Smart Shopping Tip",
            description:
              "Consider shopping on weekdays when stores often have better deals and less crowds.",
            icon: "calendar",
            color: "#FF9500",
            priority: 4,
            confidence: 0.9,
            actionText: "Learn More",
          });
        }

        setInsights(generatedInsights.sort((a, b) => a.priority - b.priority));
        setStoreComparisons(generatedComparisons);
        setSavingsOpportunities(generatedOpportunities);
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      logger.error("Price analysis failed", error as Error, {
        component: "EnhancedPriceIntelligence",
      });
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.6) return "#F59E0B";
    return "#EF4444";
  };

  const handleInsightAction = (insight: PriceInsight) => {
    setSelectedInsight(insight.id);

    switch (insight.type) {
      case "comparison":
        setShowDetailedComparison(true);
        break;
      case "savings":
        Alert.alert(
          "Savings Opportunity",
          "Navigate to price comparison to see detailed savings."
        );
        break;
      default:
        Alert.alert(insight.title, insight.description);
    }
  };

  const renderInsight = (insight: PriceInsight) => (
    <MotiView
      key={insight.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.insightCard}
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
              <View style={styles.insightTitleRow}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <View style={styles.confidenceBadge}>
                  <View
                    style={[
                      styles.confidenceDot,
                      {
                        backgroundColor: getConfidenceColor(insight.confidence),
                      },
                    ]}
                  />
                  <Text style={styles.confidenceText}>
                    {Math.round(insight.confidence * 100)}%
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.insightDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
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
                  Save {formatCurrency(insight.savings)}
                </Chip>
              )}
              {insight.actionText && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleInsightAction(insight)}
                >
                  <Text style={[styles.actionText, { color: insight.color }]}>
                    {insight.actionText}
                  </Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={16}
                    color={insight.color}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  const renderStoreComparison = (store: StoreComparison) => (
    <MotiView
      key={store.storeName}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <Card style={styles.storeCard}>
        <Card.Content>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>{store.storeName}</Text>
            <View style={styles.competitivenessContainer}>
              <ProgressBar
                progress={store.priceCompetitiveness / 100}
                color={getConfidenceColor(store.priceCompetitiveness / 100)}
                style={styles.competitivenessBar}
              />
              <Text style={styles.competitivenessText}>
                {store.priceCompetitiveness}% competitive
              </Text>
            </View>
          </View>

          <View style={styles.storeStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg. Spend</Text>
              <Text style={styles.statValue}>
                {formatCurrency(store.averageSpend)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Visits</Text>
              <Text style={styles.statValue}>{store.visitCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Savings</Text>
              <Text style={styles.statValue}>{store.savingsOpportunities}</Text>
            </View>
          </View>

          <View style={styles.storeFooter}>
            <Text style={styles.lastVisitText}>
              Last visit: {new Date(store.lastVisit).toLocaleDateString()}
            </Text>
            <TouchableOpacity style={styles.compareButton}>
              <Text style={styles.compareButtonText}>Compare Prices</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  const renderSavingsOpportunity = (opportunity: SavingsOpportunity) => (
    <MotiView
      key={opportunity.itemName}
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <Card style={styles.opportunityCard}>
        <Card.Content>
          <View style={styles.opportunityHeader}>
            <Text style={styles.opportunityItemName}>
              {opportunity.itemName}
            </Text>
            <View style={styles.confidenceBadge}>
              <View
                style={[
                  styles.confidenceDot,
                  {
                    backgroundColor: getConfidenceColor(opportunity.confidence),
                  },
                ]}
              />
              <Text style={styles.confidenceText}>
                {Math.round(opportunity.confidence * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.priceComparison}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Current</Text>
              <Text style={styles.currentPrice}>
                {formatCurrency(opportunity.currentPrice)}
              </Text>
            </View>

            <MaterialIcons name="arrow-forward" size={16} color="#6B7280" />

            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Best</Text>
              <Text style={styles.bestPrice}>
                {formatCurrency(opportunity.bestPrice)}
              </Text>
            </View>

            <View style={styles.savingsContainer}>
              <Text style={styles.savingsLabel}>Save</Text>
              <Text style={styles.savingsAmount}>
                {formatCurrency(opportunity.savings)}
              </Text>
            </View>
          </View>

          <View style={styles.opportunityFooter}>
            <Text style={styles.opportunityStoreName}>
              at {opportunity.storeName}
            </Text>
            <Text style={styles.historyPoints}>
              {opportunity.priceHistoryPoints} price points
            </Text>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
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
          <ActivityIndicator
            style={styles.loadingSpinner}
            color={theme.colors.primary}
          />
        </Card.Content>
      </Card>
    );
  }

  const totalPotentialSavings = insights.reduce(
    (sum, insight) => sum + (insight.savings || 0),
    0
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Insights Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        {insights.map(renderInsight)}
      </View>

      {/* Savings Summary */}
      {totalPotentialSavings > 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.section}
        >
          <Card style={styles.summaryCard}>
            <Card.Content style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Potential Savings</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(totalPotentialSavings)}
              </Text>
              <Text style={styles.summarySubtext}>
                Based on price comparisons and shopping tips
              </Text>
            </Card.Content>
          </Card>
        </MotiView>
      )}

      {/* Store Comparisons */}
      {showDetailedComparison && storeComparisons.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Store Comparisons</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setShowDetailedComparison(false)}
            />
          </View>
          {storeComparisons.map(renderStoreComparison)}
        </MotiView>
      )}

      {/* Savings Opportunities */}
      {savingsOpportunities.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Savings Opportunities</Text>
          {savingsOpportunities.map(renderSavingsOpportunity)}
        </MotiView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline3,
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  loadingSpinner: {
    marginTop: spacing.md,
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
  insightTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  insightTitle: {
    ...typography.headline1,
    flex: 1,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  confidenceText: {
    ...typography.caption1,
    color: "#6B7280",
    fontWeight: "600",
  },
  insightDescription: {
    ...typography.body2,
    color: "#666",
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  savingsChip: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  actionText: {
    ...typography.body2,
    fontWeight: "600",
    marginRight: spacing.xs,
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
  storeCard: {
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  storeHeader: {
    marginBottom: spacing.md,
  },
  storeName: {
    ...typography.headline2,
    marginBottom: spacing.sm,
  },
  competitivenessContainer: {
    marginBottom: spacing.sm,
  },
  competitivenessBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  competitivenessText: {
    ...typography.caption1,
    color: "#6B7280",
  },
  storeStats: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    backgroundColor: "#F9FAFB",
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xs,
  },
  statLabel: {
    ...typography.caption1,
    color: "#6B7280",
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.headline3,
    fontWeight: "600",
  },
  storeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastVisitText: {
    ...typography.caption1,
    color: "#6B7280",
  },
  compareButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  compareButtonText: {
    ...typography.body2,
    fontWeight: "600",
    color: "#007AFF",
  },
  opportunityCard: {
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  opportunityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  opportunityItemName: {
    ...typography.headline2,
    flex: 1,
    marginRight: spacing.sm,
  },
  priceComparison: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  priceItem: {
    alignItems: "center",
  },
  priceLabel: {
    ...typography.caption1,
    color: "#6B7280",
    marginBottom: spacing.xs,
  },
  currentPrice: {
    ...typography.headline3,
    fontWeight: "600",
    color: "#EF4444",
  },
  bestPrice: {
    ...typography.headline3,
    fontWeight: "600",
    color: "#10B981",
  },
  savingsContainer: {
    alignItems: "center",
  },
  savingsLabel: {
    ...typography.caption1,
    color: "#6B7280",
    marginBottom: spacing.xs,
  },
  savingsAmount: {
    ...typography.headline2,
    fontWeight: "bold",
    color: "#10B981",
  },
  opportunityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  opportunityStoreName: {
    ...typography.body2,
    color: "#6B7280",
  },
  historyPoints: {
    ...typography.caption1,
    color: "#9CA3AF",
  },
});
