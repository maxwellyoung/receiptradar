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
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  ErrorBoundary,
  NetworkError,
  EmptyState,
} from "@/components/ErrorBoundary";
import { EnhancedRefreshControl } from "@/components/PullToRefresh";
import { OfflineIndicator, OfflineBanner } from "@/components/OfflineIndicator";
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
import { RealPricesShowcase } from "@/components/RealPricesShowcase";
import * as Haptics from "expo-haptics";
import {
  spacing,
  typography,
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";

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

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading, search, error } = useReceipts(user?.id ?? "");
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
  const [refreshing, setRefreshing] = useState(false);
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
    // Smooth fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: interactions.transitions.normal,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const handleScanReceipt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/modals/camera");
  };

  const handleViewInsights = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowWeeklyDigest(true);
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Retry loading receipts
    search("");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await search("");
      // Simulate some delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading skeleton while loading
  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top", "left", "right"]}
      >
        <LoadingSkeleton type="dashboard" />
      </SafeAreaView>
    );
  }

  // Show network error if there's an error
  if (error) {
    return <NetworkError onRetry={handleRetry} message={error} />;
  }

  // Simplified, editorial header
  const listHeader = (
    <View style={styles.listHeader}>
      {/* Clean Header - Editorial Hierarchy (Michael Beirut) */}
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

      {/* Primary Action - Clear and Focused (Dieter Rams) */}
      <View style={styles.primaryActionContainer}>
        <HolisticButton
          title="Scan Receipt"
          onPress={handleScanReceipt}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>

      {/* Essential Stats - Only if there's data (Benji Taylor) */}
      {receipts.length > 0 && (
        <View style={styles.statsContainer}>
          <HolisticCard variant="minimal" padding="medium">
            <View style={styles.statsRow}>
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
            onPress={handleViewInsights}
            variant="outline"
            size="medium"
            fullWidth
          />
        </View>
      )}
    </View>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top", "left", "right"]}
      >
        {/* Offline Indicator */}
        <OfflineIndicator onRetry={handleRetry} position="top" />

        <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
          {/* Clean Search Header - Better Placement */}
          <View style={styles.searchHeader}>
            <Searchbar
              placeholder="Search receipts..."
              onChangeText={onChangeSearch}
              value={searchQuery}
              style={[
                styles.searchBar,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  ...materialShadows.subtle,
                },
              ]}
              icon="magnify"
              iconColor={theme.colors.onSurfaceVariant}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              inputStyle={{
                color: theme.colors.onSurface,
                ...typography.body.large,
              }}
            />
          </View>

          <FlatList
            data={receipts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ReceiptCard
                receipt={{
                  id: item.id,
                  user_id: item.user_id,
                  store_name: item.store?.name || "",
                  total_amount: item.total,
                  date: item.ts,
                  image_url: item.raw_url,
                  created_at: item.created_at,
                  updated_at: item.created_at,
                }}
                onPress={() => router.push(`/receipt/${item.id}`)}
              />
            )}
            ListHeaderComponent={
              <View>
                {listHeader}
                <QuickSearchWidget compact />

                {/* Real Prices Section */}
                <View style={styles.realPricesSection}>
                  <HolisticText
                    variant="title.medium"
                    style={styles.sectionTitle}
                  >
                    Live Countdown Prices
                  </HolisticText>
                  <HolisticText
                    variant="body.small"
                    color="secondary"
                    style={styles.sectionSubtitle}
                  >
                    Real-time prices from your local Countdown store
                  </HolisticText>
                  <RealPricesShowcase />
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                icon="receipt"
                title="Start tracking your spending"
                message="Scan your first receipt to begin tracking your purchases and saving money."
                actionText="Scan Receipt"
                onAction={handleScanReceipt}
              />
            }
            contentContainerStyle={[
              styles.listContentContainer,
              { paddingBottom: spacing.xlarge },
            ]}
            refreshControl={
              <EnhancedRefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                title="Pull to refresh receipts"
              />
            }
          />
        </Animated.View>

        {/* Offline Banner */}
        <OfflineBanner
          message="No internet connection. Receipts may not sync properly."
          onRetry={handleRetry}
        />

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
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: spacing.large,
  },
  listHeader: {
    paddingBottom: spacing.large,
  },
  header: {
    alignItems: "center",
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.large,
  },
  mainTitle: {
    textAlign: "center",
    marginBottom: spacing.small,
  },
  subtitle: {
    textAlign: "center",
  },
  searchHeader: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  searchBar: {
    elevation: 0,
  },
  primaryActionContainer: {
    marginBottom: spacing.large,
  },
  statsContainer: {
    marginBottom: spacing.large,
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
    marginBottom: spacing.tiny,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  secondaryActionsContainer: {
    marginBottom: spacing.medium,
  },
  realPricesSection: {
    marginTop: spacing.large,
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    marginBottom: spacing.small,
    paddingHorizontal: spacing.large,
  },
  sectionSubtitle: {
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.large,
  },
});
