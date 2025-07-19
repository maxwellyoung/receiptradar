import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Animated,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Text, FAB, useTheme, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReceiptCard } from "@/components/ReceiptCard";
import { WeeklyInsights } from "@/components/WeeklyInsights";
import { debounce } from "lodash";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRadarMood } from "@/hooks/useRadarMood";
import { RadarWorm } from "@/components/RadarWorm";
import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
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
  "Your grocery footprint, day by day.",
  "Every receipt is a chapter in your financial story.",
  "The patterns of your consumption are revealing.",
  "Mindful spending starts with seeing clearly.",
  "What does your spending say about you today?",
  "Uncovering the narrative in your numbers.",
  "Your financial habits, brought to light.",
];

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading, search } = useReceipts(user?.id ?? "");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const totalSpending = receipts.reduce(
    (acc, receipt) => acc + receipt.total,
    0
  );

  const { mood } = useRadarMood({ totalSpend: totalSpending });
  const [greeting, setGreeting] = useState("Your grocery footprint today.");

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
    <View>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text
            style={[typography.headline1, { color: theme.colors.onSurface }]}
          >
            Every Receipt Tells a Story
          </Text>
          <RadarWorm mood={mood} size="small" visible={true} />
        </View>
        <Text
          style={[
            typography.title1,
            {
              color: theme.colors.onSurfaceVariant,
              marginTop: spacing.sm,
            },
          ]}
        >
          {greeting}
        </Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Search by store or item..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: borderRadius.md,
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
      <WeeklyInsights />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ReceiptCard
              receipt={item}
              onPress={() => router.push(`/receipt/${item.id}`)}
            />
          )}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <EdgeCaseRenderer
              mood={mood}
              title="The worm sees nothing... yet 👁"
              message="Scan your first receipt to begin the gentle judgment."
            />
          }
          contentContainerStyle={[
            styles.listContentContainer,
            { paddingBottom: 88 + insets.bottom },
          ]}
          onRefresh={() => search("")}
          refreshing={loading}
        />
        <FAB
          style={[
            styles.fab,
            {
              backgroundColor: theme.colors.primary,
              bottom: spacing.lg + insets.bottom,
              ...shadows.floating,
            },
          ]}
          icon="camera"
          color={theme.colors.onPrimary}
          onPress={() => router.push("/modals/camera")}
          mode="flat"
          label="Scan Receipt"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 88, // Full tab bar height
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  searchBarContainer: {
    marginBottom: spacing.md,
  },
  searchBar: {
    elevation: 0, // Remove default elevation, use our shadow system
  },
  fab: {
    position: "absolute",
    margin: spacing.md,
    right: 0,
    borderRadius: borderRadius.full,
  },
});
