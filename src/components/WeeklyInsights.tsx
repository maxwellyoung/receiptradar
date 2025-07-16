import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Mock data for insights - we'll replace this with real data later
const mockInsights = {
  weeklyDelta: -15.5, // -15.5% change from last week
  averageSpend: 45.78,
  topSplurge: {
    item: "Avocados",
    emoji: "🥑",
  },
};

export function WeeklyInsights() {
  const theme = useTheme<AppTheme>();
  const isUpTrend = mockInsights.weeklyDelta >= 0;

  const trendColor = isUpTrend ? theme.colors.error : theme.colors.positive;
  const trendIcon = isUpTrend ? "arrow-top-right" : "arrow-bottom-left";

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
        <View style={[styles.pill, { backgroundColor: trendColor }]}>
          <MaterialCommunityIcons
            name={trendIcon}
            color={theme.colors.onPrimary}
            size={16}
          />
          <Text style={{ color: theme.colors.onPrimary, marginLeft: 4 }}>
            {Math.abs(mockInsights.weeklyDelta)}%
          </Text>
        </View>
      </View>

      <Text
        variant="headlineLarge"
        style={[styles.mainInsight, { color: theme.colors.onSurface }]}
      >
        You spent {Math.abs(mockInsights.weeklyDelta)}%{" "}
        {isUpTrend ? "more" : "less"} than last week.
        {isUpTrend ? " Stay mindful!" : " Nice work!"}
      </Text>

      <View style={styles.grid}>
        <View style={styles.insightBox}>
          <Text variant="labelLarge" style={styles.boxLabel}>
            Avg. Daily Spend
          </Text>
          <Text variant="headlineMedium" style={styles.boxValue}>
            ${mockInsights.averageSpend.toFixed(2)}
          </Text>
        </View>
        <View style={styles.insightBox}>
          <Text variant="labelLarge" style={styles.boxLabel}>
            Top Indulgence
          </Text>
          <Text variant="headlineMedium" style={styles.boxValue}>
            {mockInsights.topSplurge.emoji} {mockInsights.topSplurge.item}
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
