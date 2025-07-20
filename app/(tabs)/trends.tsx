import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Text, useTheme, Card, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import { spacing, typography, shadows, borderRadius } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

const TIME_PERIODS = [
  { id: "week", label: "This Week", icon: "calendar-week" },
  { id: "month", label: "This Month", icon: "calendar-month" },
  { id: "quarter", label: "This Quarter", icon: "calendar-blank" },
  { id: "year", label: "This Year", icon: "calendar" },
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
  const insets = useSafeAreaInsets();

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Animation values for delightful interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
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

    // Animate chart after a delay
    setTimeout(() => {
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, []);

  // Animate insights when shown
  useEffect(() => {
    if (showInsights) {
      Animated.timing(insightAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(insightAnim, {
        toValue: 0,
        duration: 200,
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
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleScanReceipt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/modals/camera");
  };

  const handleViewReceipts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/receipts");
  };

  // Calculate trends data
  const getTrendsData = () => {
    const now = new Date();
    const filteredReceipts = receipts.filter((receipt) => {
      const receiptDate = new Date(receipt.ts);
      const diffInDays =
        (now.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24);

      switch (selectedPeriod) {
        case "week":
          return diffInDays <= 7;
        case "month":
          return diffInDays <= 30;
        case "quarter":
          return diffInDays <= 90;
        case "year":
          return diffInDays <= 365;
        default:
          return true;
      }
    });

    const totalSpent = filteredReceipts.reduce(
      (sum, receipt) => sum + receipt.total,
      0
    );
    const averageSpend =
      filteredReceipts.length > 0 ? totalSpent / filteredReceipts.length : 0;

    // Mock category breakdown
    const categoryBreakdown = CATEGORIES.reduce((acc, category) => {
      acc[category] = Math.random() * totalSpent * 0.3;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalSpent,
      averageSpend,
      receiptCount: filteredReceipts.length,
      categoryBreakdown,
      topCategory:
        Object.entries(categoryBreakdown).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "Groceries",
    };
  };

  const trendsData = getTrendsData();

  const getInsightMessage = () => {
    if (trendsData.receiptCount === 0) {
      return "Start scanning receipts to see your spending trends";
    }

    if (trendsData.averageSpend < 50) {
      return "You're maintaining modest spending habits";
    }

    if (trendsData.averageSpend < 100) {
      return "Your spending is within reasonable limits";
    }

    return "Consider reviewing your spending patterns";
  };

  const getTopCategoryInsight = () => {
    const topAmount = trendsData.categoryBreakdown[trendsData.topCategory];
    const percentage = (topAmount / trendsData.totalSpent) * 100;

    if (percentage > 50) {
      return `${
        trendsData.topCategory
      } dominates your spending at ${percentage.toFixed(0)}%`;
    }

    return `${trendsData.topCategory} is your top spending category`;
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.headerTop}>
        <View>
          <HolisticText variant="headline.medium" style={styles.title}>
            Spending Trends
          </HolisticText>
          <HolisticText
            variant="body.medium"
            color="secondary"
            style={styles.subtitle}
          >
            {getInsightMessage()}
          </HolisticText>
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt}>
          <MaterialIcons name="camera-alt" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSelector}>
        <HolisticText variant="title.small" style={styles.periodTitle}>
          Time Period
        </HolisticText>
        <View style={styles.periodChips}>
          {TIME_PERIODS.map((period) => (
            <TouchableOpacity
              key={period.id}
              onPress={() => handlePeriodSelect(period.id)}
            >
              <Chip
                selected={selectedPeriod === period.id}
                onPress={() => handlePeriodSelect(period.id)}
                style={[
                  styles.periodChip,
                  selectedPeriod === period.id && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                textStyle={[
                  styles.periodChipText,
                  selectedPeriod === period.id && { color: "white" },
                ]}
              >
                {period.label}
              </Chip>
            </TouchableOpacity>
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
      <View style={styles.statsGrid}>
        <HolisticCard variant="minimal" padding="medium">
          <View style={styles.statCard}>
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={theme.colors.primary}
            />
            <HolisticText variant="title.large" style={styles.statValue}>
              ${trendsData.totalSpent.toFixed(0)}
            </HolisticText>
            <HolisticText variant="body.small" color="secondary">
              Total Spent
            </HolisticText>
          </View>
        </HolisticCard>

        <HolisticCard variant="minimal" padding="medium">
          <View style={styles.statCard}>
            <MaterialIcons
              name="receipt"
              size={24}
              color={theme.colors.primary}
            />
            <HolisticText variant="title.large" style={styles.statValue}>
              {trendsData.receiptCount}
            </HolisticText>
            <HolisticText variant="body.small" color="secondary">
              Receipts
            </HolisticText>
          </View>
        </HolisticCard>

        <HolisticCard variant="minimal" padding="medium">
          <View style={styles.statCard}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color={theme.colors.primary}
            />
            <HolisticText variant="title.large" style={styles.statValue}>
              ${trendsData.averageSpend.toFixed(0)}
            </HolisticText>
            <HolisticText variant="body.small" color="secondary">
              Average
            </HolisticText>
          </View>
        </HolisticCard>

        <HolisticCard variant="minimal" padding="medium">
          <View style={styles.statCard}>
            <MaterialIcons
              name="category"
              size={24}
              color={theme.colors.primary}
            />
            <HolisticText variant="title.large" style={styles.statValue}>
              {trendsData.topCategory}
            </HolisticText>
            <HolisticText variant="body.small" color="secondary">
              Top Category
            </HolisticText>
          </View>
        </HolisticCard>
      </View>
    </Animated.View>
  );

  const renderCategoryBreakdown = () => (
    <Animated.View
      style={[
        styles.categorySection,
        {
          opacity: chartAnim,
          transform: [{ scale: chartAnim }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <HolisticText variant="title.large" style={styles.sectionTitle}>
          Category Breakdown
        </HolisticText>
        <TouchableOpacity onPress={() => setShowInsights(!showInsights)}>
          <MaterialIcons
            name={showInsights ? "expand-less" : "expand-more"}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category) => {
          const amount = trendsData.categoryBreakdown[category];
          const percentage =
            trendsData.totalSpent > 0
              ? (amount / trendsData.totalSpent) * 100
              : 0;
          const isSelected = selectedCategory === category;

          return (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategorySelect(category)}
            >
              <View
                style={[
                  styles.categoryCard,
                  isSelected && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <HolisticCard variant="minimal" padding="medium">
                  <View style={styles.categoryContent}>
                    <HolisticText
                      variant="title.medium"
                      style={styles.categoryName}
                    >
                      {category}
                    </HolisticText>
                    <HolisticText
                      variant="title.large"
                      style={styles.categoryAmount}
                    >
                      ${amount.toFixed(0)}
                    </HolisticText>
                    <HolisticText variant="body.small" color="secondary">
                      {percentage.toFixed(0)}%
                    </HolisticText>
                  </View>
                </HolisticCard>
              </View>
            </TouchableOpacity>
          );
        })}
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
      <HolisticCard variant="minimal" padding="large">
        <View style={styles.insightsContent}>
          <MaterialIcons
            name="lightbulb"
            size={32}
            color={theme.colors.primary}
          />
          <HolisticText variant="title.medium" style={styles.insightTitle}>
            Spending Insights
          </HolisticText>
          <HolisticText
            variant="body.medium"
            color="secondary"
            style={styles.insightText}
          >
            {getTopCategoryInsight()}
          </HolisticText>
          <TouchableOpacity
            style={styles.viewReceiptsButton}
            onPress={handleViewReceipts}
          >
            <MaterialIcons name="receipt" size={20} color="white" />
            <Text style={styles.viewReceiptsText}>View All Receipts</Text>
          </TouchableOpacity>
        </View>
      </HolisticCard>
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
      <MaterialIcons
        name="trending-up"
        size={64}
        color={theme.colors.onSurfaceVariant}
      />
      <HolisticText variant="title.large" style={styles.emptyTitle}>
        No trends yet
      </HolisticText>
      <HolisticText
        variant="body.medium"
        color="secondary"
        style={styles.emptyMessage}
      >
        Scan some receipts to start seeing your spending patterns
      </HolisticText>
      <TouchableOpacity style={styles.emptyButton} onPress={handleScanReceipt}>
        <MaterialIcons name="camera-alt" size={20} color="white" />
        <Text style={styles.emptyButtonText}>Scan Receipt</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (receipts.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top", "left", "right"]}
      >
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderStatsCards()}
        {renderCategoryBreakdown()}
        {showInsights && renderInsights()}
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
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
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
  },
  periodChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  periodChip: {
    marginBottom: spacing.xs,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    alignItems: "center",
    minWidth: (screenWidth - spacing.lg * 3) / 2,
  },
  statValue: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  categorySection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  categoryCard: {
    minWidth: (screenWidth - spacing.lg * 3) / 2,
    borderRadius: borderRadius.lg,
  },
  categoryContent: {
    alignItems: "center",
  },
  categoryName: {
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  categoryAmount: {
    marginBottom: spacing.xs,
  },
  insightsSection: {
    marginBottom: spacing.lg,
  },
  insightsContent: {
    alignItems: "center",
  },
  insightTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  insightText: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  viewReceiptsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34C759",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  viewReceiptsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34C759",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
});
