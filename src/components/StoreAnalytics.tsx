import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, useTheme, Card, Chip, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import {
  VictoryChart,
  VictoryBar,
  VictoryPie,
  VictoryAxis,
  VictoryLabel,
} from "victory-native";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";
import { RadarWorm } from "@/components/RadarWorm";

interface StoreAnalytics {
  storeName: string;
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  lastVisit: string;
  savingsIdentified: number;
  priceCompetitiveness: number; // 0-100 score
  topCategories: Array<{ name: string; amount: number }>;
}

interface StoreComparison {
  storeName: string;
  totalSpent: number;
  averageSpend: number;
  savingsIdentified: number;
  priceCompetitiveness: number;
}

export const StoreAnalytics: React.FC = () => {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts } = useReceipts(user?.id || "");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<StoreAnalytics[]>([]);
  const [comparison, setComparison] = useState<StoreComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (receipts.length > 0) {
      analyzeStoreData();
    }
  }, [receipts]);

  const analyzeStoreData = () => {
    const storeMap = new Map<string, StoreAnalytics>();

    receipts.forEach((receipt) => {
      const storeName = receipt.store?.name || "Unknown Store";
      const existing = storeMap.get(storeName) || {
        storeName,
        totalSpent: 0,
        visitCount: 0,
        averageSpend: 0,
        lastVisit: "",
        savingsIdentified: 0,
        priceCompetitiveness: 0,
        topCategories: [],
      };

      existing.totalSpent += receipt.total;
      existing.visitCount += 1;
      existing.savingsIdentified += 0; // TODO: Add savings tracking
      existing.lastVisit =
        receipt.ts > existing.lastVisit ? receipt.ts : existing.lastVisit;

      storeMap.set(storeName, existing);
    });

    // Calculate averages and competitiveness scores
    const analyticsArray = Array.from(storeMap.values()).map((store) => ({
      ...store,
      averageSpend: store.totalSpent / store.visitCount,
      priceCompetitiveness: calculatePriceCompetitiveness(store),
    }));

    setAnalytics(analyticsArray);
    setComparison(
      analyticsArray.map((store) => ({
        storeName: store.storeName,
        totalSpent: store.totalSpent,
        averageSpend: store.averageSpend,
        savingsIdentified: store.savingsIdentified,
        priceCompetitiveness: store.priceCompetitiveness,
      }))
    );
    setLoading(false);
  };

  const calculatePriceCompetitiveness = (store: StoreAnalytics): number => {
    // Simple algorithm: higher savings = more competitive
    const savingsRatio = store.savingsIdentified / store.totalSpent;
    return Math.min(100, Math.max(0, savingsRatio * 1000)); // Scale to 0-100
  };

  const getStoreIcon = (storeName: string) => {
    const name = storeName.toLowerCase();
    if (name.includes("countdown")) return "basket-outline";
    if (name.includes("new world")) return "leaf-outline";
    if (name.includes("pak")) return "bag-outline";
    if (name.includes("four square")) return "square-outline";
    return "storefront-outline";
  };

  const getCompetitivenessColor = (score: number) => {
    if (score >= 80) return theme.colors.positive;
    if (score >= 60) return theme.colors.tertiary;
    if (score >= 40) return theme.colors.error;
    return theme.colors.onSurfaceVariant;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <RadarWorm mood="insightful" size="large" visible />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Analyzing your shopping patterns...
        </Text>
      </View>
    );
  }

  if (analytics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <RadarWorm mood="suspicious" size="large" visible />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No store data yet
        </Text>
        <Text variant="bodyLarge" style={styles.emptySubtitle}>
          Scan some receipts to start tracking your supermarket spending.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Supermarket Analytics
        </Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Track your spending across stores
        </Text>
      </View>

      {/* Store Comparison Chart */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.section}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Store Comparison
        </Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <VictoryChart
              height={200}
              padding={{ top: 40, bottom: 40, left: 60, right: 40 }}
              domainPadding={{ x: 20 }}
            >
              <VictoryBar
                data={comparison.map((store) => ({
                  x: store.storeName,
                  y: store.averageSpend,
                }))}
                style={{
                  data: {
                    fill: theme.colors.primary,
                    width: 30,
                    borderRadius: 6,
                  },
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 },
                }}
              />
              <VictoryAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: {
                    fill: theme.colors.onSurfaceVariant,
                    fontSize: 10,
                    angle: -45,
                  },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: {
                    fill: theme.colors.onSurfaceVariant,
                    fontSize: 10,
                  },
                }}
                tickFormat={(t) => `$${t}`}
              />
            </VictoryChart>
          </Card.Content>
        </Card>
      </MotiView>

      {/* Store Cards */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 200 }}
        style={styles.section}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Your Stores
        </Text>
        {analytics.map((store, index) => (
          <TouchableOpacity
            key={store.storeName}
            onPress={() =>
              setSelectedStore(
                selectedStore === store.storeName ? null : store.storeName
              )
            }
            style={styles.storeCard}
          >
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <View style={styles.storeHeader}>
                  <View style={styles.storeInfo}>
                    <Ionicons
                      name={getStoreIcon(store.storeName) as any}
                      size={24}
                      color={theme.colors.primary}
                    />
                    <View style={styles.storeText}>
                      <Text variant="titleMedium" style={styles.storeName}>
                        {store.storeName}
                      </Text>
                      <Text variant="bodySmall" style={styles.storeMeta}>
                        {store.visitCount} visits • Last:{" "}
                        {new Date(store.lastVisit).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{
                      color: getCompetitivenessColor(
                        store.priceCompetitiveness
                      ),
                    }}
                    style={{
                      borderColor: getCompetitivenessColor(
                        store.priceCompetitiveness
                      ),
                    }}
                  >
                    {store.priceCompetitiveness.toFixed(0)}% competitive
                  </Chip>
                </View>

                <View style={styles.storeStats}>
                  <View style={styles.stat}>
                    <Text variant="labelSmall" style={styles.statLabel}>
                      Total Spent
                    </Text>
                    <Text variant="titleMedium" style={styles.statValue}>
                      {formatCurrency(store.totalSpent)}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text variant="labelSmall" style={styles.statLabel}>
                      Avg. Spend
                    </Text>
                    <Text variant="titleMedium" style={styles.statValue}>
                      {formatCurrency(store.averageSpend)}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text variant="labelSmall" style={styles.statLabel}>
                      Savings
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.statValue,
                        { color: theme.colors.positive },
                      ]}
                    >
                      {formatCurrency(store.savingsIdentified)}
                    </Text>
                  </View>
                </View>

                {selectedStore === store.storeName && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ type: "timing", duration: 300 }}
                    style={styles.expandedContent}
                  >
                    <View style={styles.detailedStats}>
                      <Text variant="titleSmall" style={styles.detailedTitle}>
                        Detailed Analysis
                      </Text>
                      <View style={styles.detailedGrid}>
                        <View style={styles.detailedStat}>
                          <Text variant="labelSmall">Best Value Score</Text>
                          <Text variant="bodyLarge">
                            {store.priceCompetitiveness >= 80
                              ? "Excellent"
                              : store.priceCompetitiveness >= 60
                              ? "Good"
                              : store.priceCompetitiveness >= 40
                              ? "Fair"
                              : "Poor"}
                          </Text>
                        </View>
                        <View style={styles.detailedStat}>
                          <Text variant="labelSmall">Savings Rate</Text>
                          <Text variant="bodyLarge">
                            {(
                              (store.savingsIdentified / store.totalSpent) *
                              100
                            ).toFixed(1)}
                            %
                          </Text>
                        </View>
                      </View>
                    </View>
                  </MotiView>
                )}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </MotiView>

      {/* Price Intelligence Summary */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 400 }}
        style={styles.section}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Price Intelligence
        </Text>
        <Card style={styles.intelligenceCard}>
          <Card.Content>
            <View style={styles.intelligenceHeader}>
              <Ionicons
                name="trending-up"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.intelligenceTitle}>
                Best Value Store
              </Text>
            </View>
            {(() => {
              const bestStore = analytics.reduce((best, current) =>
                current.priceCompetitiveness > best.priceCompetitiveness
                  ? current
                  : best
              );
              return (
                <View style={styles.bestStoreInfo}>
                  <Text variant="headlineSmall" style={styles.bestStoreName}>
                    {bestStore.storeName}
                  </Text>
                  <Text variant="bodyLarge" style={styles.bestStoreScore}>
                    {bestStore.priceCompetitiveness.toFixed(0)}% competitive
                    score
                  </Text>
                  <Text variant="bodyMedium" style={styles.bestStoreSavings}>
                    You've saved {formatCurrency(bestStore.savingsIdentified)}{" "}
                    here
                  </Text>
                </View>
              );
            })()}
          </Card.Content>
        </Card>
      </MotiView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#6B7280",
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    elevation: 2,
  },
  storeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    elevation: 2,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  storeName: {
    fontWeight: "600",
  },
  storeMeta: {
    color: "#6B7280",
    marginTop: 2,
  },
  storeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: "#6B7280",
    marginBottom: spacing.xs,
  },
  statValue: {
    fontWeight: "600",
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailedStats: {
    marginTop: spacing.sm,
  },
  detailedTitle: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  detailedGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailedStat: {
    flex: 1,
    alignItems: "center",
  },
  intelligenceCard: {
    marginHorizontal: spacing.lg,
    elevation: 2,
  },
  intelligenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  intelligenceTitle: {
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  bestStoreInfo: {
    alignItems: "center",
  },
  bestStoreName: {
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  bestStoreScore: {
    color: "#10B981",
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  bestStoreSavings: {
    color: "#6B7280",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.lg,
    color: "#6B7280",
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
    color: "#6B7280",
  },
});
