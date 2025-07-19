import React from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { subDays, format, parseISO } from "date-fns";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";

export function WeeklyInsights() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading } = useReceipts(user?.id ?? "");

  const chartData = React.useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const dailyTotals: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayLabel = format(date, "EEE");
      labels.push(dayLabel);
      dailyTotals[dayLabel] = 0;
    }

    receipts.forEach((receipt) => {
      const dayLabel = format(parseISO(receipt.ts), "EEE");
      if (dailyTotals[dayLabel] !== undefined) {
        dailyTotals[dayLabel] += receipt.total;
      }
    });

    labels.forEach((label) => {
      data.push(dailyTotals[label] ?? 0);
    });

    return {
      labels,
      datasets: [{ data }],
    };
  }, [receipts]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: borderRadius.lg,
            ...shadows.sm,
          },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (receipts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: borderRadius.lg,
            ...shadows.sm,
          },
        ]}
      >
        <Text
          style={[typography.body1, { color: theme.colors.onSurfaceVariant }]}
        >
          No spending data for this week yet.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: borderRadius.lg,
          ...shadows.sm,
        },
      ]}
    >
      <Text
        style={[
          typography.title2,
          {
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.sm,
          },
        ]}
      >
        Last 7 Days
      </Text>
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - spacing.lg * 2}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.surfaceVariant,
          backgroundGradientFrom: theme.colors.surfaceVariant,
          backgroundGradientTo: theme.colors.surfaceVariant,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Use primary color
          labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
          style: {
            borderRadius: borderRadius.md,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: theme.colors.primary,
          },
        }}
        bezier
        style={{
          marginVertical: spacing.sm,
          borderRadius: borderRadius.md,
        }}
      />
      <View style={styles.footer}>
        <Text
          style={[
            typography.caption1,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Based on your spending in the last 7 days.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
  },
  footer: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
});
