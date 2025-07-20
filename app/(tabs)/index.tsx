import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Animated,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Text, useTheme, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";
import { ReceiptCard } from "@/components/ReceiptCard";
import { WeeklyInsights } from "@/components/WeeklyInsights";
import { QuickSearchWidget } from "@/components/QuickSearchWidget";
import { debounce } from "lodash";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
import { WeeklyWormDigest } from "@/components/WeeklyWormDigest";
import { useToneMode } from "@/hooks/useToneMode";
import { HolisticButton } from "@/components/HolisticDesignSystem";
import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import * as Haptics from "expo-haptics";

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1d ago";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  return `${Math.floor(diffInDays / 30)}mo ago`;
};

import {
  spacing,
  typography,
  shadows,
  borderRadius,
  animation,
} from "@/constants/theme";
import {
  createContainerStyle,
  createAnimationStyle,
  commonStyles,
} from "@/utils/designSystem";

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading, search } = useReceipts(user?.id ?? "");
  const {
    spendingAnalytics,
    storeAnalytics,
    savingsAnalytics,
    loading: analyticsLoading,
    getTopCategory,
    getTopStore,
    getWeeklySpendingTrend,
  } = useRealAnalytics();
  const { toneMode } = useToneMode();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState("");
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);
  const insets = useSafeAreaInsets();

  // Use real analytics data when available, fallback to calculated data
  const totalSpending =
    spendingAnalytics?.totalSpending ||
    receipts.reduce((acc, receipt) => acc + receipt.total, 0);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      search(query);
    }, 300),
    [search]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    // Use design system animation
    const fadeInAnimation = createAnimationStyle("fadeIn");
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeInAnimation.duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const listHeader = (
    <View style={styles.listHeader}>
      {/* Clean Header - Editorial Hierarchy */}
      <View style={styles.header}>
        <HolisticText variant="headline.large" style={styles.mainTitle}>
          ReceiptRadar
        </HolisticText>

        <HolisticText
          variant="body.large"
          color="secondary"
          style={styles.subtitle}
        >
          Track your spending with clarity
        </HolisticText>
      </View>

      {/* Primary Action - Clear and Focused */}
      <View style={styles.primaryActionContainer}>
        <HolisticButton
          title="Scan Receipt"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/modals/camera");
          }}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>

      {/* Essential Stats - Only if there's data */}
      {(receipts.length > 0 || spendingAnalytics) && (
        <View style={styles.statsContainer}>
          <HolisticCard variant="minimal" padding="medium">
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <HolisticText variant="title.large" style={styles.statValue}>
                  ${totalSpending.toFixed(2)}
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Total Spent
                </HolisticText>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <HolisticText variant="title.large" style={styles.statValue}>
                  {spendingAnalytics?.receiptCount || receipts.length}
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Receipts
                </HolisticText>
              </View>

              {savingsAnalytics && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <HolisticText
                      variant="title.large"
                      style={styles.statValue}
                    >
                      ${savingsAnalytics.totalSavings.toFixed(2)}
                    </HolisticText>
                    <HolisticText variant="body.small" color="secondary">
                      Savings
                    </HolisticText>
                  </View>
                </>
              )}
            </View>
          </HolisticCard>
        </View>
      )}

      {/* Secondary Actions - Minimal and Purposeful */}
      {receipts.length > 0 && (
        <View style={styles.secondaryActionsContainer}>
          <HolisticButton
            title="View Insights"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowWeeklyDigest(true);
            }}
            variant="outline"
            size="medium"
            fullWidth
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
        {/* Clean Search Header */}
        <View style={styles.searchHeader}>
          <Searchbar
            placeholder="Search receipts..."
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: borderRadius.lg,
                ...shadows.sm,
              },
            ]}
            icon="magnify"
            iconColor={theme.colors.onSurfaceVariant}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            inputStyle={{
              color: theme.colors.onSurface,
              ...typography.body1,
            }}
          />
        </View>

        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ReceiptCard
              receipt={item}
              onPress={() => router.push(`/receipt/${item.id}`)}
            />
          )}
          ListHeaderComponent={
            <View>
              {listHeader}
              <QuickSearchWidget compact />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <HolisticText variant="title.large" style={styles.emptyTitle}>
                Start tracking your spending
              </HolisticText>
              <HolisticText
                variant="body.medium"
                color="secondary"
                style={styles.emptyMessage}
              >
                Scan your first receipt to begin
              </HolisticText>
            </View>
          }
          contentContainerStyle={[
            styles.listContentContainer,
            { paddingBottom: spacing.xl },
          ]}
          onRefresh={() => search("")}
          refreshing={loading}
        />
      </Animated.View>

      {/* Weekly Insights Modal */}
      <WeeklyWormDigest
        isVisible={showWeeklyDigest}
        onDismiss={() => setShowWeeklyDigest(false)}
        onScanReceipt={() => {
          setShowWeeklyDigest(false);
          router.push("/modals/camera");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: spacing.lg,
  },
  listHeader: {
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  mainTitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  searchHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBar: {
    elevation: 0,
  },
  primaryActionContainer: {
    marginBottom: spacing.lg,
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  secondaryActionsContainer: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    textAlign: "center",
  },
});
