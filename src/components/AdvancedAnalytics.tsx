import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import {
  analyticsService,
  SpendingPattern,
  SavingsInsight,
  PricePrediction,
  SpendingReport,
  BudgetAnalysis,
  SeasonalTrend,
  StoreComparison,
} from "@/services/AnalyticsService";
import { logger } from "@/utils/logger";

interface AdvancedAnalyticsProps {
  variant?: "demo" | "full";
}

const { width } = Dimensions.get("window");

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  variant = "demo",
}) => {
  const theme = useTheme<AppTheme>();
  const [activeTab, setActiveTab] = useState<
    "insights" | "predictions" | "reports" | "budget" | "seasonal" | "stores"
  >("insights");
  const [insights, setInsights] = useState<SavingsInsight[]>([]);
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [report, setReport] = useState<SpendingReport | null>(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([]);
  const [storeComparison, setStoreComparison] = useState<StoreComparison[]>([]);

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const [
        insightsData,
        predictionsData,
        reportData,
        budgetData,
        seasonalData,
        storeData,
      ] = await Promise.all([
        analyticsService.getSavingsInsights("current-user"),
        analyticsService.getPricePredictions("current-user"),
        analyticsService.getSpendingReport("current-user"),
        analyticsService.getBudgetAnalysis("current-user", {
          Dairy: 100,
          Produce: 80,
          Meat: 150,
          Pantry: 120,
        }),
        analyticsService.getSeasonalTrends("current-user"),
        analyticsService.getStoreComparison("current-user"),
      ]);

      setInsights(insightsData);
      setPredictions(predictionsData);
      setReport(reportData);
      setBudgetAnalysis(budgetData);
      setSeasonalTrends(seasonalData);
      setStoreComparison(storeData);
    } catch (error) {
      logger.error("Error loading analytics data", error as Error, {
        component: "AdvancedAnalytics",
      });
    }
  };

  const renderInsightCard = (insight: SavingsInsight) => (
    <View
      key={insight.title}
      style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.insightHeader}>
        <MaterialIcons
          name={getInsightIcon(insight.type)}
          size={24}
          color={getInsightColor(insight.type)}
        />
        <View style={styles.insightInfo}>
          <Text
            style={[styles.insightTitle, { color: theme.colors.onSurface }]}
          >
            {insight.title}
          </Text>
          <Text
            style={[
              styles.insightDescription,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {insight.description}
          </Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(insight.priority) + "20" },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              { color: getPriorityColor(insight.priority) },
            ]}
          >
            {insight.priority}
          </Text>
        </View>
      </View>

      <View style={styles.insightMetrics}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
            ${insight.impact.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Potential Savings
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
            {(insight.confidence * 100).toFixed(0)}%
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Confidence
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPredictionCard = (prediction: PricePrediction) => (
    <View
      key={prediction.productId}
      style={[styles.predictionCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.predictionHeader}>
        <Text
          style={[styles.predictionProduct, { color: theme.colors.onSurface }]}
        >
          {prediction.productName}
        </Text>
        <View
          style={[
            styles.recommendationBadge,
            {
              backgroundColor:
                getRecommendationColor(prediction.recommendation) + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.recommendationText,
              {
                color: getRecommendationColor(prediction.recommendation),
              },
            ]}
          >
            {prediction.recommendation.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.predictionPricing}>
        <View style={styles.priceItem}>
          <Text
            style={[
              styles.priceLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Current
          </Text>
          <Text
            style={[styles.currentPrice, { color: theme.colors.onSurface }]}
          >
            ${prediction.currentPrice.toFixed(2)}
          </Text>
        </View>
        <MaterialIcons
          name="trending-up"
          size={20}
          color={theme.colors.primary}
        />
        <View style={styles.priceItem}>
          <Text
            style={[
              styles.priceLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Predicted
          </Text>
          <Text
            style={[
              styles.predictedPrice,
              {
                color:
                  prediction.predictedPrice > prediction.currentPrice
                    ? "#EF4444"
                    : "#10B981",
              },
            ]}
          >
            ${prediction.predictedPrice.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.predictionFactors}>
        <Text
          style={[
            styles.factorsTitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Factors:
        </Text>
        {prediction.factors.map((factor, index) => (
          <Text
            key={index}
            style={[styles.factorItem, { color: theme.colors.onSurface }]}
          >
            • {factor}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderReportCard = () => {
    if (!report) return null;

    return (
      <View
        style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.reportTitle, { color: theme.colors.primary }]}>
          {report.period.charAt(0).toUpperCase() + report.period.slice(1)}{" "}
          Report
        </Text>

        <View style={styles.reportMetrics}>
          <View style={styles.reportMetric}>
            <Text
              style={[styles.reportValue, { color: theme.colors.onSurface }]}
            >
              ${report.totalSpent.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.reportLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Spent
            </Text>
          </View>
          <View style={styles.reportMetric}>
            <Text style={[styles.reportValue, { color: "#10B981" }]}>
              ${report.totalSaved.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.reportLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Saved
            </Text>
          </View>
          <View style={styles.reportMetric}>
            <Text style={[styles.reportValue, { color: theme.colors.primary }]}>
              {report.savingsRate.toFixed(1)}%
            </Text>
            <Text
              style={[
                styles.reportLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Savings Rate
            </Text>
          </View>
        </View>

        <View style={styles.topCategories}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Top Categories
          </Text>
          {report.topCategories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text
                style={[styles.categoryName, { color: theme.colors.onSurface }]}
              >
                {category.category}
              </Text>
              <Text
                style={[
                  styles.categoryAmount,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                ${category.totalSpent.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.recommendations}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Recommendations
          </Text>
          {report.recommendations.map((rec, index) => (
            <Text
              key={index}
              style={[
                styles.recommendationItem,
                { color: theme.colors.onSurface },
              ]}
            >
              • {rec}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderBudgetCard = (budget: BudgetAnalysis) => (
    <View
      key={budget.category}
      style={[styles.budgetCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.budgetHeader}>
        <Text
          style={[styles.budgetCategory, { color: theme.colors.onSurface }]}
        >
          {budget.category}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(budget.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(budget.status) },
            ]}
          >
            {budget.status}
          </Text>
        </View>
      </View>

      <View style={styles.budgetProgress}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: getStatusColor(budget.status),
                width: `${Math.min(
                  (budget.actual / budget.budgeted) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          ${budget.actual.toFixed(2)} / ${budget.budgeted.toFixed(2)}
        </Text>
      </View>

      {budget.recommendations.length > 0 && (
        <View style={styles.budgetRecommendations}>
          {budget.recommendations.map((rec, index) => (
            <Text
              key={index}
              style={[
                styles.budgetRec,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              • {rec}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderSeasonalCard = (trend: SeasonalTrend) => (
    <View
      key={trend.category}
      style={[styles.seasonalCard, { backgroundColor: theme.colors.surface }]}
    >
      <Text
        style={[styles.seasonalCategory, { color: theme.colors.onSurface }]}
      >
        {trend.category}
      </Text>

      <View style={styles.seasonalInfo}>
        <View style={styles.seasonalItem}>
          <Text
            style={[
              styles.seasonalLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Peak Months:
          </Text>
          <Text
            style={[styles.seasonalValue, { color: theme.colors.onSurface }]}
          >
            {trend.peakMonths.map((m) => getMonthName(m)).join(", ")}
          </Text>
        </View>
        <View style={styles.seasonalItem}>
          <Text
            style={[
              styles.seasonalLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Best Buy Months:
          </Text>
          <Text
            style={[styles.seasonalValue, { color: theme.colors.onSurface }]}
          >
            {trend.lowMonths.map((m) => getMonthName(m)).join(", ")}
          </Text>
        </View>
      </View>

      <View style={styles.seasonalRecommendations}>
        {trend.recommendations.map((rec, index) => (
          <Text
            key={index}
            style={[
              styles.seasonalRec,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            • {rec}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderStoreCard = (store: StoreComparison) => (
    <View
      key={store.storeName}
      style={[styles.storeCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.storeHeader}>
        <Text style={[styles.storeName, { color: theme.colors.onSurface }]}>
          {store.storeName}
        </Text>
        <View
          style={[
            styles.recommendationBadge,
            {
              backgroundColor:
                getRecommendationColor(store.recommendation) + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.recommendationText,
              { color: getRecommendationColor(store.recommendation) },
            ]}
          >
            {store.recommendation.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.storeMetrics}>
        <View style={styles.storeMetric}>
          <Text style={[styles.storeValue, { color: theme.colors.onSurface }]}>
            ${store.averagePrice.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.storeLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Avg Price
          </Text>
        </View>
        <View style={styles.storeMetric}>
          <Text style={[styles.storeValue, { color: "#10B981" }]}>
            ${store.savingsOpportunity.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.storeLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Savings Opp.
          </Text>
        </View>
        <View style={styles.storeMetric}>
          <Text style={[styles.storeValue, { color: theme.colors.primary }]}>
            {store.productCount}
          </Text>
          <Text
            style={[
              styles.storeLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Products
          </Text>
        </View>
      </View>
    </View>
  );

  // Helper functions
  const getInsightIcon = (
    type: string
  ): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case "opportunity":
        return "trending-up";
      case "achievement":
        return "emoji-events";
      case "trend":
        return "analytics";
      case "recommendation":
        return "lightbulb";
      default:
        return "info";
    }
  };

  const getInsightColor = (type: string): string => {
    switch (type) {
      case "opportunity":
        return "#10B981";
      case "achievement":
        return "#F59E0B";
      case "trend":
        return "#3B82F6";
      case "recommendation":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case "buy":
        return "#10B981";
      case "wait":
        return "#F59E0B";
      case "stock-up":
        return "#EF4444";
      case "preferred":
        return "#10B981";
      case "avoid":
        return "#EF4444";
      case "selective":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "under":
        return "#10B981";
      case "over":
        return "#EF4444";
      case "on-track":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getMonthName = (month: number): string => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month];
  };

  if (variant === "demo") {
    return (
      <Animated.View
        style={[
          styles.demoContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.demoTitle, { color: theme.colors.primary }]}>
          Advanced Analytics
        </Text>
        <Text
          style={[
            styles.demoSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          AI-powered insights and predictive analytics
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: "insights", label: "Insights", icon: "lightbulb" },
            { key: "predictions", label: "Predictions", icon: "trending-up" },
            { key: "reports", label: "Reports", icon: "assessment" },
            { key: "budget", label: "Budget", icon: "account-balance-wallet" },
            { key: "seasonal", label: "Seasonal", icon: "calendar-today" },
            { key: "stores", label: "Stores", icon: "store" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && {
                  backgroundColor: theme.colors.primary + "20",
                },
              ]}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={tab.icon as any}
                size={20}
                color={
                  activeTab === tab.key
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === tab.key
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "insights" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Personalized Insights
              </Text>
              {insights.map(renderInsightCard)}
            </View>
          )}

          {activeTab === "predictions" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Price Predictions
              </Text>
              {predictions.map(renderPredictionCard)}
            </View>
          )}

          {activeTab === "reports" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Spending Reports
              </Text>
              {renderReportCard()}
            </View>
          )}

          {activeTab === "budget" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Budget Analysis
              </Text>
              {budgetAnalysis.map(renderBudgetCard)}
            </View>
          )}

          {activeTab === "seasonal" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Seasonal Trends
              </Text>
              {seasonalTrends.map(renderSeasonalCard)}
            </View>
          )}

          {activeTab === "stores" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Store Comparison
              </Text>
              {storeComparison.map(renderStoreCard)}
            </View>
          )}
        </ScrollView>

        {/* Features List */}
        <View style={styles.featuresList}>
          <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
            Analytics Benefits
          </Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="psychology" size={20} color="#8B5CF6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>AI Insights:</Text>{" "}
              Personalized recommendations based on your spending
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="trending-up" size={20} color="#10B981" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Price Predictions:</Text> Know
              when to buy with price forecasting
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="analytics" size={20} color="#3B82F6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Advanced Reports:</Text>{" "}
              Comprehensive spending analysis and trends
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="calendar-today" size={20} color="#F59E0B" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Seasonal Patterns:</Text>{" "}
              Optimize shopping based on seasonal trends
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Advanced Analytics
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          AI-powered insights and predictive analytics
        </Text>
      </View>

      <ScrollView style={styles.fullContent}>
        <Text
          style={[
            styles.placeholderText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Full advanced analytics implementation
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  fullContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  placeholderText: {
    ...typography.body1,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  demoContainer: {
    padding: spacing.lg,
  },
  demoTitle: {
    ...typography.headline1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  demoSubtitle: {
    ...typography.body1,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: "#F8FAFC",
    padding: spacing.xs,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: (width - spacing.lg * 2 - spacing.xs * 4) / 3,
  },
  tabLabel: {
    ...typography.caption1,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  contentArea: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  insightCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  insightInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  insightTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  insightDescription: {
    ...typography.body2,
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    ...typography.caption2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  insightMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption1,
  },
  predictionCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  predictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  predictionProduct: {
    ...typography.body1,
    fontWeight: "600",
    flex: 1,
  },
  recommendationBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recommendationText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  predictionPricing: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  priceItem: {
    alignItems: "center",
  },
  priceLabel: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  currentPrice: {
    ...typography.body1,
    fontWeight: "600",
  },
  predictedPrice: {
    ...typography.body1,
    fontWeight: "700",
  },
  predictionFactors: {
    marginTop: spacing.sm,
  },
  factorsTitle: {
    ...typography.caption1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  factorItem: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  reportCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  reportTitle: {
    ...typography.body1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  reportMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  reportMetric: {
    alignItems: "center",
  },
  reportValue: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  reportLabel: {
    ...typography.caption1,
  },
  topCategories: {
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  categoryName: {
    ...typography.body2,
  },
  categoryAmount: {
    ...typography.body2,
    fontWeight: "600",
  },
  recommendations: {
    marginTop: spacing.sm,
  },
  recommendationItem: {
    ...typography.body2,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  budgetCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  budgetCategory: {
    ...typography.body1,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  budgetProgress: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption1,
    textAlign: "right",
  },
  budgetRecommendations: {
    marginTop: spacing.sm,
  },
  budgetRec: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  seasonalCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  seasonalCategory: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  seasonalInfo: {
    marginBottom: spacing.sm,
  },
  seasonalItem: {
    marginBottom: spacing.xs,
  },
  seasonalLabel: {
    ...typography.caption1,
    fontWeight: "600",
  },
  seasonalValue: {
    ...typography.body2,
  },
  seasonalRecommendations: {
    marginTop: spacing.sm,
  },
  seasonalRec: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  storeCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  storeName: {
    ...typography.body1,
    fontWeight: "600",
  },
  storeMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  storeMetric: {
    alignItems: "center",
  },
  storeValue: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  storeLabel: {
    ...typography.caption1,
  },
  featuresList: {
    marginTop: spacing.lg,
  },
  featuresTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
