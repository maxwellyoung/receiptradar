import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";
import { RadarWorm } from "@/components/RadarWorm";
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
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

export default function TrendsScreen() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { getWeeklySpending, getSpendingByCategory, getSpendingAnalytics } =
    useReceipts(user?.id || "");

  const weeklySpending = getWeeklySpending(4);
  const categories = Object.entries(getSpendingByCategory()).map(
    ([name, amount]) => ({ name, amount })
  );
  const analytics = getSpendingAnalytics();

  const averagePerWeek =
    weeklySpending.length > 0
      ? weeklySpending.reduce((sum, week) => sum + week.total, 0) /
        weeklySpending.length
      : 0;

  const chartData = weeklySpending.map((week, index) => ({
    x: week.week,
    y: week.total,
  }));

  const hasData = weeklySpending.length > 0;

  if (!hasData) {
    return (
      <SafeAreaView style={styles.container}>
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <VictoryChart height={250}>
            <VictoryLine
              data={chartData}
              style={{
                data: { stroke: theme.colors.primary, strokeWidth: 3 },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
            <VictoryScatter
              data={chartData}
              size={5}
              style={{ data: { fill: theme.colors.primary } }}
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

        <Section title="Category Breakdown">
          {(categories ?? []).map((category, index) => (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: index * 100 }}
              key={category.name}
              style={[
                styles.categoryItem,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text variant="bodyLarge">{category.name}</Text>
              <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
                ${(category.amount ?? 0).toFixed(2)}
              </Text>
            </MotiView>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
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
