import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Text, useTheme, Card, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import { HolisticButton } from "@/components/HolisticDesignSystem";
import { spacing, typography, shadows, borderRadius } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

const TIME_PERIODS = [
  { id: "week", label: "This Week", icon: "view-week" },
  { id: "month", label: "This Month", icon: "calendar-month" },
  { id: "quarter", label: "This Quarter", icon: "calendar-today" },
  { id: "year", label: "This Year", icon: "event" },
];

const CATEGORIES = [
  "Groceries",
  "Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Health",
  "Utilities",
  "Other",
];

export default function TrendsScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts } = useReceipts(user?.id ?? "");
  const {
    spendingAnalytics,
    storeAnalytics,
    savingsAnalytics,
    loading: analyticsLoading,
    getTopCategory,
    getTopStore,
    getWeeklySpendingTrend,
  } = useRealAnalytics();
  const insets = useSafeAreaInsets();

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(true);

  // Debug logging
  console.log("TrendsScreen render:", {
    receiptsLength: receipts?.length || 0,
    user: user?.id,
    analyticsLoading,
    selectedPeriod,
  });

  // Enhanced animation values for sophisticated interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnimationsRef = useRef<Animated.Value[]>([]);

  useEffect(() => {
    // Sophisticated entrance animations with staggered timing
    Animated.sequence([
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(headerScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Chart animation
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize card animations
    cardAnimationsRef.current = [1, 2, 3, 4].map(() => new Animated.Value(0));

    // Staggered card animations
    setTimeout(() => {
      Animated.stagger(
        150,
        cardAnimationsRef.current.map((anim: Animated.Value) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();
    }, 600);
  }, []);

  // Animate insights when shown
  useEffect(() => {
    if (showInsights) {
      Animated.timing(insightAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [showInsights]);

  const handlePeriodSelect = (periodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriod(periodId);
  };

  const handleCategorySelect = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleScanReceipt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/modals/camera");
  };

  const handleViewReceipts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/receipts");
  };

  const getTrendsData = () => {
    try {
      const now = new Date();
      let startDate = new Date();

      switch (selectedPeriod) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      const filteredReceipts = receipts.filter(
        (receipt) => new Date(receipt.created_at) >= startDate
      );

      const totalSpent = filteredReceipts.reduce(
        (sum, receipt) => sum + (receipt.total || 0),
        0
      );

      const averagePerReceipt =
        filteredReceipts.length > 0 ? totalSpent / filteredReceipts.length : 0;

      const weeklyTrend = getWeeklySpendingTrend() || "stable";

      // Convert string trend to numeric value for comparisons
      const weeklyTrendValue =
        weeklyTrend === "increasing"
          ? 1
          : weeklyTrend === "decreasing"
          ? -1
          : 0;

      return {
        totalSpent,
        receiptCount: filteredReceipts.length,
        averagePerReceipt,
        topCategory: getTopCategory()?.name || "N/A",
        topStore: getTopStore()?.storeName || "N/A",
        weeklyTrend: weeklyTrendValue,
      };
    } catch (error) {
      console.error("Error getting trends data:", error);
      return {
        totalSpent: 0,
        receiptCount: 0,
        averagePerReceipt: 0,
        topCategory: "N/A",
        topStore: "N/A",
        weeklyTrend: 0,
      };
    }
  };

  const trendsData = getTrendsData();

  const getInsightMessage = () => {
    if (trendsData.totalSpent === 0) {
      return "Start scanning receipts to see your spending patterns";
    }

    const periodLabel =
      TIME_PERIODS.find((p) => p.id === selectedPeriod)?.label || "This Month";

    if (trendsData.weeklyTrend > 0) {
      return `Spending is trending up ${periodLabel.toLowerCase()}. Consider reviewing your budget.`;
    } else if (trendsData.weeklyTrend < 0) {
      return `Great job! Spending is down ${periodLabel.toLowerCase()}. Keep up the good work!`;
    } else {
      return `Your spending is stable ${periodLabel.toLowerCase()}.`;
    }
  };

  const getTopCategoryInsight = () => {
    if (!trendsData.topCategory) {
      return "Scan more receipts to get personalized insights about your spending habits.";
    }

    return `Your top spending category is ${trendsData.topCategory}. Consider setting a budget for this category to better manage your expenses.`;
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ scale: headerScaleAnim }],
        },
      ]}
    >
      <View style={styles.headerTop}>
        <View style={styles.headerContent}>
          <HolisticText variant="headline.large" style={styles.title}>
            Insights & Trends
          </HolisticText>
          <HolisticText
            variant="body.large"
            color="secondary"
            style={styles.subtitle}
          >
            {getInsightMessage()}
          </HolisticText>
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanReceipt}
          activeOpacity={0.8}
        >
          <MaterialIcons name="camera-alt" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Refined Time Period Selector */}
      <View style={styles.periodSelector}>
        <HolisticText variant="title.medium" style={styles.periodTitle}>
          Time Period
        </HolisticText>
        <View style={styles.periodChips}>
          {TIME_PERIODS.map((period, index) => (
            <Animated.View
              key={period.id}
              style={{
                opacity:
                  cardAnimationsRef.current[index] || new Animated.Value(0),
                transform: [
                  {
                    translateY: (
                      cardAnimationsRef.current[index] || new Animated.Value(0)
                    ).interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={() => handlePeriodSelect(period.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.periodChip,
                    selectedPeriod === period.id && styles.periodChipSelected,
                  ]}
                >
                  <MaterialIcons
                    name={period.icon as any}
                    size={16}
                    color={
                      selectedPeriod === period.id
                        ? "white"
                        : theme.colors.onSurfaceVariant
                    }
                    style={styles.periodChipIcon}
                  />
                  <Text
                    style={[
                      styles.periodChipText,
                      selectedPeriod === period.id &&
                        styles.periodChipTextSelected,
                    ]}
                  >
                    {period.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStatsCards = () => (
    <Animated.View
      style={[
        styles.statsSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.statsHeader}>
        <HolisticText variant="headline.medium" style={styles.sectionTitle}>
          Summary
        </HolisticText>
        <HolisticText
          variant="body.medium"
          color="secondary"
          style={styles.sectionSubtitle}
        >
          Key metrics for your selected period
        </HolisticText>
      </View>

      <View style={styles.statsGrid}>
        <Animated.View
          style={[
            styles.statCard,
            {
              opacity: cardAnimationsRef.current[0] || new Animated.Value(0),
              transform: [
                {
                  translateY: (
                    cardAnimationsRef.current[0] || new Animated.Value(0)
                  ).interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statCardInner}>
            <View style={styles.statIconContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={24}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.statValue}>
              $
              {typeof trendsData.totalSpent === "number"
                ? trendsData.totalSpent.toFixed(0)
                : "0"}
            </Text>
            <HolisticText variant="body.small" color="secondary">
              Total Spent
            </HolisticText>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statCard,
            {
              opacity: cardAnimationsRef.current[1] || new Animated.Value(0),
              transform: [
                {
                  translateY: (
                    cardAnimationsRef.current[1] || new Animated.Value(0)
                  ).interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statCardInner}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="receipt" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{trendsData.receiptCount}</Text>
            <HolisticText variant="body.small" color="secondary">
              Receipts
            </HolisticText>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statCard,
            {
              opacity: cardAnimationsRef.current[2] || new Animated.Value(0),
              transform: [
                {
                  translateY: (
                    cardAnimationsRef.current[2] || new Animated.Value(0)
                  ).interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statCardInner}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="trending-up" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>
              ${trendsData.averagePerReceipt.toFixed(0)}
            </Text>
            <HolisticText variant="body.small" color="secondary">
              Average
            </HolisticText>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statCard,
            {
              opacity: cardAnimationsRef.current[3] || new Animated.Value(0),
              transform: [
                {
                  translateY: (
                    cardAnimationsRef.current[3] || new Animated.Value(0)
                  ).interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statCardInner}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="category" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.statValue}>
              {trendsData.topCategory || "N/A"}
            </Text>
            <HolisticText variant="body.small" color="secondary">
              Top Category
            </HolisticText>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderCategoryBreakdown = () => (
    <Animated.View
      style={[
        styles.categorySection,
        {
          opacity: chartAnim,
          transform: [
            {
              translateY: chartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View>
          <HolisticText variant="headline.medium" style={styles.sectionTitle}>
            Categories
          </HolisticText>
          <HolisticText
            variant="body.medium"
            color="secondary"
            style={styles.sectionSubtitle}
          >
            Your spending by category
          </HolisticText>
        </View>
      </View>

      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category, index) => (
          <TouchableOpacity
            key={category}
            onPress={() => handleCategorySelect(category)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryCard,
                selectedCategory === category && styles.categoryCardSelected,
              ]}
            >
              <HolisticText
                variant="title.medium"
                style={[
                  styles.categoryTitle,
                  selectedCategory === category && styles.categoryTitleSelected,
                ]}
              >
                {category}
              </HolisticText>
              <HolisticText
                variant="body.small"
                color="secondary"
                style={styles.categoryAmount}
              >
                $0.00
              </HolisticText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderInsights = () => (
    <Animated.View
      style={[
        styles.insightsSection,
        {
          opacity: insightAnim,
          transform: [
            {
              translateY: insightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.insightsHeader}>
        <HolisticText variant="headline.medium" style={styles.sectionTitle}>
          Personalized Insights
        </HolisticText>
        <HolisticText
          variant="body.medium"
          color="secondary"
          style={styles.sectionSubtitle}
        >
          AI-powered recommendations for your spending
        </HolisticText>
      </View>

      <View style={styles.insightsContent}>
        <View style={styles.insightCard}>
          <View style={styles.insightIconContainer}>
            <MaterialIcons
              name="lightbulb"
              size={32}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.insightTextContainer}>
            <HolisticText variant="title.medium" style={styles.insightTitle}>
              Spending Analysis
            </HolisticText>
            <HolisticText
              variant="body.medium"
              color="secondary"
              style={styles.insightText}
            >
              {getTopCategoryInsight()}
            </HolisticText>
          </View>
        </View>

        <HolisticButton
          title="View All Receipts"
          onPress={handleViewReceipts}
          variant="outline"
          size="medium"
          fullWidth
          icon={
            <MaterialIcons
              name="receipt"
              size={20}
              color={theme.colors.primary}
            />
          }
        />
      </View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <MaterialIcons
          name="trending-up"
          size={64}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
      <HolisticText variant="headline.medium" style={styles.emptyTitle}>
        No trends yet
      </HolisticText>
      <HolisticText
        variant="body.large"
        color="secondary"
        style={styles.emptyMessage}
      >
        Scan some receipts to start seeing your spending patterns and get
        personalized insights
      </HolisticText>
      <HolisticButton
        title="Scan Receipt"
        onPress={handleScanReceipt}
        variant="primary"
        size="large"
        icon={<MaterialIcons name="camera-alt" size={20} color="white" />}
      />
    </Animated.View>
  );

  if (receipts.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  // Add fallback rendering in case of any issues
  if (!trendsData) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
        />
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons
              name="trending-up"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
          <HolisticText variant="headline.medium" style={styles.emptyTitle}>
            {analyticsLoading ? "Loading insights..." : "No data available"}
          </HolisticText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {(() => {
          try {
            return (
              <>
                {renderHeader()}
                {renderStatsCards()}
                {renderCategoryBreakdown()}
                {renderInsights()}
              </>
            );
          } catch (error) {
            console.error("Error rendering trends content:", error);
            return (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialIcons
                    name="error"
                    size={64}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                <HolisticText
                  variant="headline.medium"
                  style={styles.emptyTitle}
                >
                  Something went wrong
                </HolisticText>
                <HolisticText
                  variant="body.large"
                  color="secondary"
                  style={styles.emptyMessage}
                >
                  Please try again later
                </HolisticText>
              </View>
            );
          }
        })()}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  periodSelector: {
    marginBottom: spacing.lg,
  },
  periodTitle: {
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  periodChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  periodChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  periodChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  periodChipIcon: {
    marginRight: spacing.xs,
  },
  periodChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  periodChipTextSelected: {
    color: "white",
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - spacing.lg * 3) / 2,
  },
  statCardInner: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: spacing.xs,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: (screenWidth - spacing.lg * 3) / 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  categoryCardSelected: {
    backgroundColor: "rgba(0,122,255,0.1)",
    borderColor: "#007AFF",
  },
  categoryTitle: {
    marginBottom: spacing.xs,
    textAlign: "center",
    fontWeight: "500",
  },
  categoryTitleSelected: {
    color: "#007AFF",
  },
  categoryAmount: {
    textAlign: "center",
  },
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightsHeader: {
    marginBottom: spacing.lg,
  },
  insightsContent: {
    gap: spacing.lg,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    flexShrink: 0,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    marginBottom: spacing.xs,
    fontWeight: "500",
  },
  insightText: {
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  emptyMessage: {
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});
