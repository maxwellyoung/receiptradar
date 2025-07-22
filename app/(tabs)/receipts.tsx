import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, useTheme, Chip, Searchbar } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { Receipt as DatabaseReceipt } from "@/types/database";

type ReceiptWithExtraFields = DatabaseReceipt & {
  store_name?: string;
  total_amount?: number;
  date?: string;
  savings_identified?: number;
  cashback_earned?: number;
};
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReceiptCard } from "@/components/ReceiptCard";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import { spacing, typography, shadows, borderRadius } from "@/constants/theme";

const FILTER_OPTIONS = [
  { id: "all", label: "All", icon: "receipt" },
  { id: "recent", label: "Recent", icon: "schedule" },
  { id: "high-spend", label: "High Spend", icon: "trending-up" },
  { id: "low-spend", label: "Low Spend", icon: "trending-down" },
];

const SORT_OPTIONS = [
  { id: "date-desc", label: "Newest First", icon: "sort" },
  { id: "date-asc", label: "Oldest First", icon: "sort" },
  { id: "amount-desc", label: "Highest Amount", icon: "sort" },
  { id: "amount-asc", label: "Lowest Amount", icon: "sort" },
];

export default function ReceiptsScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading, search, refresh, deleteReceipt } = useReceipts(
    user?.id ?? ""
  );
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Animation values for delightful interactions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate filter panel
  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilters]);

  // Animate list when data changes
  useEffect(() => {
    // Reset animation when receipts change
    listAnim.setValue(0);
    Animated.timing(listAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [receipts, listAnim]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    setIsRefreshing(false);
  };

  const handleFilterSelect = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
    setShowFilters(false);
  };

  const handleSortSelect = (sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortId);
    setShowFilters(false);
  };

  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
  };

  const handleReceiptPress = (receiptId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/receipt/${receiptId}`);
  };

  const handleScanNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/modals/camera");
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedReceipts(new Set());
  };

  const toggleReceiptSelection = (receiptId: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedReceipts.size === 0) return;

    Alert.alert(
      "Delete Receipts",
      `Are you sure you want to delete ${selectedReceipts.size} receipt${
        selectedReceipts.size > 1 ? "s" : ""
      }? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const deletePromises = Array.from(selectedReceipts).map((id) =>
              deleteReceipt(id)
            );
            await Promise.all(deletePromises);
            setSelectedReceipts(new Set());
            setIsSelectionMode(false);
            refresh();
          },
        },
      ]
    );
  };

  // Filter and sort receipts
  const filteredAndSortedReceipts = receipts
    .filter((receipt) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "recent") {
        const daysAgo =
          (Date.now() - new Date(receipt.ts).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      }
      if (selectedFilter === "high-spend") return receipt.total >= 100;
      if (selectedFilter === "low-spend") return receipt.total < 50;
      return true;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "date-desc":
          return new Date(b.ts).getTime() - new Date(a.ts).getTime();
        case "date-asc":
          return new Date(a.ts).getTime() - new Date(b.ts).getTime();
        case "amount-desc":
          return b.total - a.total;
        case "amount-asc":
          return a.total - b.total;
        default:
          return 0;
      }
    });

  const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
  const averageSpend = receipts.length > 0 ? totalSpent / receipts.length : 0;

  const getStatsMessage = () => {
    if (receipts.length === 0) return "Start tracking your spending";
    if (receipts.length === 1) return "Your first receipt tracked";
    if (receipts.length < 5) return "Building your spending history";
    if (averageSpend < 50) return "Consistent, modest spending";
    if (averageSpend < 100) return "Regular shopping patterns";
    return "Comprehensive spending overview";
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.headerTop}>
        <View>
          <HolisticText variant="headline.medium" style={styles.title}>
            {isSelectionMode
              ? `Selected (${selectedReceipts.size})`
              : "Receipts"}
          </HolisticText>
          <HolisticText
            variant="body.medium"
            color="secondary"
            style={styles.subtitle}
          >
            {isSelectionMode
              ? `${selectedReceipts.size} receipt${
                  selectedReceipts.size !== 1 ? "s" : ""
                } selected`
              : getStatsMessage()}
          </HolisticText>
        </View>
        <View style={styles.headerButtons}>
          {isSelectionMode ? (
            <>
              <TouchableOpacity
                style={[styles.headerButton, styles.deleteButton]}
                onPress={handleBulkDelete}
                disabled={selectedReceipts.size === 0}
              >
                <MaterialIcons name="delete" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleSelectionMode}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleSelectionMode}
              >
                <MaterialIcons name="select-all" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanNew}
              >
                <MaterialIcons name="camera-alt" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Stats Cards */}
      {receipts.length > 0 && (
        <View style={styles.statsContainer}>
          <HolisticCard variant="minimal" padding="medium">
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <HolisticText variant="title.large" style={styles.statValue}>
                  {receipts.length}
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Receipts
                </HolisticText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <HolisticText variant="title.large" style={styles.statValue}>
                  ${totalSpent.toFixed(0)}
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Total Spent
                </HolisticText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <HolisticText variant="title.large" style={styles.statValue}>
                  ${averageSpend.toFixed(0)}
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Average
                </HolisticText>
              </View>
            </View>
          </HolisticCard>
        </View>
      )}

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search receipts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          inputStyle={{
            color: theme.colors.onSurface,
            ...typography.body1,
          }}
        />
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <MaterialIcons
            name={showFilters ? "expand-less" : "expand-more"}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      <Animated.View
        style={[
          styles.filterPanel,
          {
            opacity: filterAnim,
            transform: [
              {
                translateY: filterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.filterSection}>
          <HolisticText variant="title.small" style={styles.filterTitle}>
            Filter by
          </HolisticText>
          <View style={styles.filterChips}>
            {FILTER_OPTIONS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => handleFilterSelect(filter.id)}
              >
                <Chip
                  selected={selectedFilter === filter.id}
                  onPress={() => handleFilterSelect(filter.id)}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.id && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedFilter === filter.id && { color: "white" },
                  ]}
                >
                  {filter.label}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <HolisticText variant="title.small" style={styles.filterTitle}>
            Sort by
          </HolisticText>
          <View style={styles.filterChips}>
            {SORT_OPTIONS.map((sort) => (
              <TouchableOpacity
                key={sort.id}
                onPress={() => handleSortSelect(sort.id)}
              >
                <Chip
                  selected={selectedSort === sort.id}
                  onPress={() => handleSortSelect(sort.id)}
                  style={[
                    styles.filterChip,
                    selectedSort === sort.id && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    selectedSort === sort.id && { color: "white" },
                  ]}
                >
                  {sort.label}
                </Chip>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MaterialIcons
        name="receipt"
        size={64}
        color={theme.colors.onSurfaceVariant}
      />
      <HolisticText variant="title.large" style={styles.emptyTitle}>
        {receipts.length === 0 ? "No receipts yet" : "No matching receipts"}
      </HolisticText>
      <HolisticText
        variant="body.medium"
        color="secondary"
        style={styles.emptyMessage}
      >
        {receipts.length === 0
          ? "Start by scanning your first receipt to track your spending"
          : "Try adjusting your search or filters to find what you're looking for"}
      </HolisticText>
      {receipts.length === 0 && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleScanNew}>
          <MaterialIcons name="camera-alt" size={20} color="white" />
          <Text style={styles.emptyButtonText}>Scan Receipt</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <FlatList
        data={filteredAndSortedReceipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: listAnim,
              transform: [
                {
                  translateY: listAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <ReceiptCard
              receipt={item as unknown as ReceiptWithExtraFields}
              onPress={() => handleReceiptPress(item.id.toString())}
              isSelectionMode={isSelectionMode}
              isSelected={selectedReceipts.has(item.id.toString())}
              onSelectionToggle={() =>
                toggleReceiptSelection(item.id.toString())
              }
            />
          </Animated.View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  statsCard: {
    borderRadius: borderRadius.lg,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    elevation: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  filterPanel: {
    marginBottom: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterTitle: {
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterChip: {
    marginBottom: spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34C759",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
});
