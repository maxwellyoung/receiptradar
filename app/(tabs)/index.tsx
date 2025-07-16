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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRadarMood } from "@/hooks/useRadarMood";
import { RadarMood, RadarWorm } from "@/components/RadarWorm";

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const listHeader = (
    <View>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Every Receipt Tells a Story
          </Text>
        </View>
        <Text
          variant="titleMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {greeting}
        </Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Search by store or item..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          icon="magnify"
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          inputStyle={{ color: theme.colors.onSurface }}
        />
      </View>
      <WeeklyInsights />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
            <View style={styles.emptyContainer}>
              <RadarWorm mood={mood} size="large" visible={true} />
              <Text
                style={[
                  styles.noReceiptsText,
                  { color: theme.colors.secondary },
                ]}
              >
                The worm sees nothing... yet 👁
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContentContainer}
          onRefresh={() => search("")}
          refreshing={loading}
        />
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          color={theme.colors.onPrimary}
          onPress={() => router.push("/modals/camera")}
          mode="flat"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 150, // Added padding for FAB and tab bar
  },
  header: {
    paddingTop: 24, // Reduced from 48
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    lineHeight: 24,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 0,
  },
  noReceiptsText: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    margin: 24, // Increased margin
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});
