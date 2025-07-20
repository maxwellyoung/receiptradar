import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Animated,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Text, Button, useTheme, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReceiptCard } from "@/components/ReceiptCard";
import { WeeklyInsights } from "@/components/WeeklyInsights";
import { QuickSearchWidget } from "@/components/QuickSearchWidget";
import { debounce } from "lodash";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRadarMood } from "@/hooks/useRadarMood";
import { RadarWorm } from "@/components/RadarWorm";
import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
import { WeeklyWormDigest } from "@/components/WeeklyWormDigest";
import { useToneMode } from "@/hooks/useToneMode";
import { HolisticButton } from "@/components/HolisticDesignSystem";
import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import * as Haptics from "expo-haptics";

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

const WORM_GREETINGS = [
  "Here's what you really spent today.",
  "Your grocery impact, revealed.",
  "The numbers don't lie, but they do tell stories.",
  "Today's consumption chronicle.",
  "Your spending story, chapter by chapter.",
  "The receipts have spoken.",
  "Your financial footprint, one scan at a time.",
];

const getPersonalityGreeting = (
  totalSpending: number,
  mood: string,
  toneMode: "gentle" | "hard"
) => {
  if (totalSpending === 0) {
    return toneMode === "gentle"
      ? "Ready to start your spending story? ✨"
      : "No receipts yet. Let's see what you're made of.";
  }

  if (totalSpending < 30) {
    return toneMode === "gentle"
      ? "A modest day of consumption. The worm approves! 🌱"
      : "Not bad. Could be worse.";
  }

  if (totalSpending < 80) {
    return toneMode === "gentle"
      ? "Solid grocery game. Nothing to see here! ✨"
      : "Acceptable spending. Moving on.";
  }

  if (totalSpending < 150) {
    return toneMode === "gentle"
      ? "Someone's been shopping. Let's see what you got! 🛒"
      : "That's a lot of groceries. Hope you're feeding a family.";
  }

  return toneMode === "gentle"
    ? "Big spender alert! The worm is taking notes! 📝"
    : "Caviar? In this economy? 😱";
};

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading, search } = useReceipts(user?.id ?? "");
  const { toneMode } = useToneMode();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState("");
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);
  const insets = useSafeAreaInsets();

  const totalSpending = receipts.reduce(
    (acc, receipt) => acc + receipt.total,
    0
  );

  const { mood } = useRadarMood({ totalSpend: totalSpending });
  const [greeting, setGreeting] = useState(
    "Ready to start your spending story?"
  );

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

  useEffect(() => {
    setGreeting(getPersonalityGreeting(totalSpending, mood, toneMode));
  }, [totalSpending, mood, toneMode]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const listHeader = (
    <View style={styles.listHeader}>
      {/* Clean Header */}
      <View style={styles.header}>
        <HolisticText variant="headline.large" style={styles.mainTitle}>
          ReceiptRadar
        </HolisticText>

        <View style={styles.wormContainer}>
          <RadarWorm
            mood={mood}
            size="medium"
            visible={true}
            showSpeechBubble={true}
            animated={true}
          />
        </View>

        <HolisticText
          variant="body.large"
          color="secondary"
          style={styles.greeting}
        >
          {greeting}
        </HolisticText>
      </View>

      {/* Primary Action - Clean and Focused */}
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
          icon="📸"
        />
      </View>

      {/* Quick Stats - Only if there's data */}
      {receipts.length > 0 && (
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
                  {receipts.length}
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Receipts
                </HolisticText>
              </View>
            </View>
          </HolisticCard>
        </View>
      )}

      {/* Secondary Actions - Clean and Minimal */}
      {receipts.length > 0 && (
        <View style={styles.secondaryActionsContainer}>
          <HolisticButton
            title="Weekly Insights"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowWeeklyDigest(true);
            }}
            variant="outline"
            size="medium"
            fullWidth
            icon="📊"
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
                No receipts yet
              </HolisticText>
              <HolisticText
                variant="body.medium"
                color="secondary"
                style={styles.emptyMessage}
              >
                Scan your first receipt to start tracking your spending
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

      {/* Weekly Worm Digest Modal */}
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
    marginBottom: spacing.lg,
  },
  wormContainer: {
    marginBottom: spacing.lg,
  },
  greeting: {
    textAlign: "center",
    fontStyle: "italic",
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
  primaryButton: {
    borderRadius: borderRadius.lg,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
