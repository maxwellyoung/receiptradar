import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Defs, Stop, LinearGradient } from "react-native-svg";
import { Text, useTheme, SegmentedButtons } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";
import { RadarWorm } from "@/components/RadarWorm";
import { StoreAnalytics } from "@/components/StoreAnalytics";
import { PriceAlertSystem } from "@/components/PriceAlertSystem";
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryArea,
  VictoryBar,
  VictoryLabel,
} from "victory-native";
import { MotiView } from "moti";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: "timing", duration: 500 }}
    style={styles.section}
  >
    <Text variant="titleLarge" style={styles.sectionTitle}>
      {title}
    </Text>
    {children}
  </MotiView>
);

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => {
  const theme = useTheme<AppTheme>();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <Text
        variant="labelLarge"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {label}
      </Text>
      <Text
        variant="headlineMedium"
        style={{ color: color || theme.colors.onSurface }}
      >
        {value}
      </Text>
    </View>
  );
};

const CategorySpendingBar = ({
  category,
  amount,
  total,
  color,
  backgroundColor,
}: {
  category: string;
  amount: number;
  total: number;
  color: string;
  backgroundColor: string;
}) => {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={styles.categoryBarContainer}>
      <View style={styles.categoryBarText}>
        <Text variant="bodyLarge">{category}</Text>
        <Text variant="bodyLarge" style={{ color }}>
          ${amount.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor }]}>
        <MotiView
          from={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "timing", duration: 1000 }}
          style={[styles.progressBarFill, { backgroundColor: color }]}
        />
      </View>
    </View>
  );
};

export default function TrendsScreen() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { getWeeklySpending, getSpendingByCategory, getSpendingAnalytics } =
    useReceipts(user?.id || "");
  const [activeTab, setActiveTab] = useState("spending");

  const weeklySpending = getWeeklySpending(4);
  const categories = Object.entries(getSpendingByCategory()).map(
    ([name, amount]) => ({ name, amount: amount as number })
  );
  const analytics = getSpendingAnalytics();

  const totalCategorySpending = categories.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );

  const averagePerWeek =
    weeklySpending.length > 0
      ? weeklySpending.reduce((sum, week) => sum + week.total, 0) /
        weeklySpending.length
      : 0;

  const maxSpend = Math.max(...weeklySpending.map((week) => week.total));

  const chartData = weeklySpending.map((week, index) => ({
    x: week.week,
    y: week.total,
  }));

  const hasData = weeklySpending.length > 0;

  if (!hasData) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.emptyContainer}>
          <RadarWorm mood="suspicious" size="large" visible />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            The worm sees nothing... yet 👁
          </Text>
          <Text variant="bodyLarge" style={styles.emptySubtitle}>
            Scan some receipts to uncover your spending trends.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "stores":
        return <StoreAnalytics />;
      case "alerts":
        return <PriceAlertSystem />;
      default:
        return (
          <>
            <View style={styles.header}>
              <Text variant="displaySmall" style={styles.headerTitle}>
                Your Spending Story
              </Text>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                A look at your recent habits.
              </Text>
            </View>

            <Section title="This Month's Snapshot">
              <View style={styles.statsGrid}>
                <StatCard
                  label="Avg. Weekly Spend"
                  value={`$${averagePerWeek.toFixed(2)}`}
                />
                <StatCard
                  label="Total Savings"
                  value={`$${(analytics.totalSavings ?? 0).toFixed(2)}`}
                  color={theme.colors.positive}
                />
              </View>
            </Section>

            <Section title="Weekly Spending">
              <VictoryChart
                height={250}
                padding={{ top: 40, bottom: 40, left: 20, right: 20 }}
                domainPadding={{ x: 20 }}
              >
                <VictoryBar
                  data={chartData}
                  style={{
                    data: {
                      fill: ({ datum }) =>
                        datum.y > averagePerWeek * 1.2
                          ? theme.colors.error
                          : theme.colors.primary,
                      width: 25,
                      borderRadius: 6,
                    },
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 },
                  }}
                  labels={({ datum }) => (datum.y === maxSpend ? "🔥" : null)}
                  labelComponent={<VictoryLabel dy={-20} />}
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: "transparent" },
                    tickLabels: {
                      fill: theme.colors.onSurfaceVariant,
                      fontSize: 12,
                    },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: "transparent" },
                    tickLabels: { fill: "transparent" },
                  }}
                />
              </VictoryChart>
            </Section>

            {analytics.totalSavings > 0 && (
              <Section title="Savings Spotlight">
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: theme.colors.surface,
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text
                    variant="headlineSmall"
                    style={{ color: theme.colors.positive }}
                  >
                    You saved ${analytics.totalSavings.toFixed(2)}!
                  </Text>
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 8,
                    }}
                  >
                    That's enough for a fancy tub of hummus. The worm approves.
                  </Text>
                </View>
              </Section>
            )}

            <Section title="Category Breakdown">
              {categories.map((category, index) => (
                <CategorySpendingBar
                  key={category.name}
                  category={category.name}
                  amount={category.amount}
                  total={totalCategorySpending}
                  color={theme.colors.primary}
                  backgroundColor={theme.colors.surfaceVariant}
                />
              ))}
            </Section>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: "spending", label: "Spending" },
            { value: "stores", label: "Stores" },
            { value: "alerts", label: "Alerts" },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      {activeTab === "spending" ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderContent()}
        </ScrollView>
      ) : (
        renderContent()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontWeight: "700",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  categoryBarContainer: {
    marginBottom: spacing.md,
  },
  categoryBarText: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: borderRadius.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyTitle: {
    textAlign: "center",
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    textAlign: "center",
    marginTop: spacing.sm,
    color: "#6c757d",
  },
});
