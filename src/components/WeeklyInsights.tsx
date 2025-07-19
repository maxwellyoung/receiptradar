import React from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { subDays, format, parseISO } from "date-fns";

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
          { backgroundColor: theme.colors.surfaceVariant },
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
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Text>No spending data for this week yet.</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Text variant="titleMedium" style={styles.title}>
        Last 7 Days
      </Text>
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 48}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.surfaceVariant,
          backgroundGradientFrom: theme.colors.surfaceVariant,
          backgroundGradientTo: theme.colors.surfaceVariant,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(10, 132, 255, ${opacity})`,
          labelColor: (opacity = 1) => theme.colors.onSurfaceVariant,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#0A84FF",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Based on your spending in the last 7 days.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
  },
  title: {
    color: "#8A8A8E",
    marginBottom: 8,
  },
  footer: {
    marginTop: 8,
    alignItems: "center",
  },
  footerText: {
    color: "#8A8A8E",
  },
});
