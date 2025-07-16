import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";

export function WeeklyInsights() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { weeklyInsights, loading } = useReceipts(user?.id ?? "");

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>
          Calculating insights...
        </Text>
      </View>
    );
  }

  const { weeklyDelta, averageSpend, topSplurge } = weeklyInsights;

  const getTrend = () => {
    if (weeklyDelta === 0) {
      return {
        color: theme.colors.onSurfaceVariant,
        icon: "arrow-left-right",
        text: "Flatline detected. Grocery zen?",
      };
    }
    const isUp = weeklyDelta > 0;
    return {
      color: isUp ? theme.colors.error : theme.colors.positive,
      icon: isUp ? "arrow-top-right" : "arrow-bottom-left",
      text: `You spent ${Math.abs(weeklyDelta).toFixed(0)}% ${
        isUp ? "more" : "less"
      } than last week. ${isUp ? "Stay mindful." : "Nice work!"}`,
    };
  };

  const trend = getTrend();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <View style={styles.header}>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Your weekly brief
        </Text>
        <View style={[styles.pill, { backgroundColor: trend.color }]}>
          <MaterialCommunityIcons
            name={trend.icon}
            color={theme.colors.onPrimary}
            size={16}
          />
          <Text style={{ color: theme.colors.onPrimary, marginLeft: 4 }}>
            {Math.abs(weeklyDelta).toFixed(0)}%
          </Text>
        </View>
      </View>

      <Text
        variant="headlineLarge"
        style={[styles.mainInsight, { color: theme.colors.onSurface }]}
      >
        {trend.text}
      </Text>

      <View style={styles.grid}>
        <View style={styles.insightBox}>
          <Text variant="labelLarge" style={styles.boxLabel}>
            Avg. Daily Spend
          </Text>
          <Text variant="headlineMedium" style={styles.boxValue}>
            ${averageSpend.toFixed(2)}
          </Text>
        </View>
        <View style={styles.insightBox}>
          <Text variant="labelLarge" style={styles.boxLabel}>
            Top Indulgence
          </Text>
          <Text variant="headlineMedium" style={styles.boxValue}>
            {topSplurge.emoji} {topSplurge.item}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 230,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  mainInsight: {
    marginBottom: 20,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 36,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  insightBox: {
    flex: 1,
    alignItems: "flex-start",
  },
  boxLabel: {
    color: "#777",
    marginBottom: 4,
  },
  boxValue: {
    fontFamily: "Inter_500Medium",
  },
});
