import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import {
  Text,
  Searchbar,
  Card,
  Button,
  Chip,
  IconButton,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MotiView } from "moti";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStoreTracking } from "@/hooks/useStoreTracking";
import {
  AppTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { API_CONFIG } from "@/constants/api";

interface PriceComparison {
  itemName: string;
  currentPrice: number;
  bestPrice: number;
  savings: number;
  storeName: string;
  confidence: number;
  priceHistoryPoints: number;
  lastUpdated: string;
}

interface StorePrice {
  storeName: string;
  price: number;
  inStock: boolean;
  lastChecked: string;
}

interface QuickSearchResult {
  itemName: string;
  category: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  stores: StorePrice[];
  priceHistory: {
    date: string;
    price: number;
    store: string;
  }[];
}

const QUICK_SEARCH_SUGGESTIONS = [
  "washing powder",
  "milk",
  "bread",
  "eggs",
  "bananas",
  "chicken breast",
  "rice",
  "pasta",
  "cheese",
  "butter",
  "yoghurt",
  "cereal",
  "coffee",
  "toilet paper",
  "dish soap",
  "laundry detergent",
];

export default function PriceCompareScreen() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QuickSearchResult[]>([]);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.6) return "#F59E0B";
    return "#EF4444";
  };

  const handleQuickSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchQuery(query);
    setShowSuggestions(false);

    try {
      // Check if we're in development and API is available
      if (API_CONFIG.isDevelopment) {
        // Try to connect to local API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        try {
          const response = await fetch(
            `${
              API_CONFIG.honoApiUrl
            }/api/v1/price-search?q=${encodeURIComponent(query)}`,
            { signal: controller.signal }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data: QuickSearchResult[] = await response.json();
            setSearchResults(data);
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          // API is not available, fall through to mock data
          console.log("Local API not available, using mock data");
        }
      }

      // Fallback to mock data for demo
      setSearchResults(generateMockSearchResults(query));
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults(generateMockSearchResults(query));
    } finally {
      setLoading(false);
    }
  };

  const generateMockSearchResults = (query: string): QuickSearchResult[] => {
    const stores = ["Countdown", "Pak'nSave", "New World", "Fresh Choice"];
    const categories = [
      "Household",
      "Dairy",
      "Bakery",
      "Produce",
      "Meat",
      "Pantry",
    ];

    return [
      {
        itemName: query,
        category: categories[Math.floor(Math.random() * categories.length)],
        averagePrice: 8.5 + Math.random() * 12,
        priceRange: {
          min: 6.99,
          max: 15.99,
        },
        stores: stores.map((store, index) => ({
          storeName: store,
          price: 6.99 + index * 2.5 + Math.random() * 2,
          inStock: Math.random() > 0.1,
          lastChecked: new Date(
            Date.now() - Math.random() * 86400000
          ).toISOString(),
        })),
        priceHistory: Array.from({ length: 5 }, (_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString(),
          price: 7.5 + Math.random() * 8,
          store: stores[Math.floor(Math.random() * stores.length)],
        })),
      },
    ];
  };

  const handleItemSelect = (itemName: string) => {
    setSelectedItem(itemName);
    // Fetch detailed price comparison for this item
    fetchPriceComparison(itemName);
  };

  const fetchPriceComparison = async (itemName: string) => {
    try {
      // Check if we're in development and API is available
      if (API_CONFIG.isDevelopment) {
        // Try to connect to local API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        try {
          const response = await fetch(
            `${
              API_CONFIG.honoApiUrl
            }/api/v1/receipts/price-comparison/${encodeURIComponent(itemName)}`,
            { signal: controller.signal }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data: PriceComparison[] = await response.json();
            setPriceComparisons(data);
            return;
          }
        } catch (apiError) {
          clearTimeout(timeoutId);
          // API is not available, fall through to mock data
          console.log(
            "Local API not available, using mock data for price comparison"
          );
        }
      }

      // Generate mock comparison data
      setPriceComparisons(generateMockPriceComparisons(itemName));
    } catch (error) {
      console.error("Price comparison failed:", error);
      setPriceComparisons(generateMockPriceComparisons(itemName));
    }
  };

  const generateMockPriceComparisons = (
    itemName: string
  ): PriceComparison[] => {
    const stores = ["Countdown", "Pak'nSave", "New World", "Fresh Choice"];
    const basePrice = 8.5 + Math.random() * 12;

    return stores.map((store, index) => {
      const price = basePrice + index * 1.5 + Math.random() * 2;
      const bestPrice = Math.min(
        ...stores.map((_, i) => basePrice + i * 1.5 + Math.random() * 2)
      );

      return {
        itemName,
        currentPrice: price,
        bestPrice,
        savings: price - bestPrice,
        storeName: store,
        confidence: 0.7 + Math.random() * 0.3,
        priceHistoryPoints: 5 + Math.floor(Math.random() * 10),
        lastUpdated: new Date(
          Date.now() - Math.random() * 3600000
        ).toISOString(),
      };
    });
  };

  const renderQuickSearchSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleQuickSearch(item)}
    >
      <MaterialIcons
        name="search"
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: QuickSearchResult }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <Card style={styles.searchResultCard}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <View style={styles.resultInfo}>
              <Text style={styles.resultItemName}>{item.itemName}</Text>
              <Chip
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {item.category}
              </Chip>
            </View>
            <TouchableOpacity
              style={styles.compareButton}
              onPress={() => handleItemSelect(item.itemName)}
            >
              <MaterialIcons
                name="compare"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceOverview}>
            <View style={styles.priceStat}>
              <Text style={styles.priceLabel}>Average</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(item.averagePrice)}
              </Text>
            </View>
            <View style={styles.priceStat}>
              <Text style={styles.priceLabel}>Range</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(item.priceRange.min)} -{" "}
                {formatCurrency(item.priceRange.max)}
              </Text>
            </View>
          </View>

          <View style={styles.storePrices}>
            <Text style={styles.storePricesTitle}>Store Prices</Text>
            {item.stores.map((store, index) => (
              <View key={index} style={styles.storePriceRow}>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.storeName}</Text>
                  <Text style={styles.lastChecked}>
                    Updated {new Date(store.lastChecked).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.storePrice}>
                  <Text style={styles.storePriceValue}>
                    {formatCurrency(store.price)}
                  </Text>
                  {!store.inStock && (
                    <Chip
                      style={styles.outOfStockChip}
                      textStyle={styles.outOfStockText}
                    >
                      Out of Stock
                    </Chip>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  const renderPriceComparison = ({ item }: { item: PriceComparison }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <Card style={styles.comparisonCard}>
        <Card.Content>
          <View style={styles.comparisonCardHeader}>
            <View style={styles.comparisonStoreInfo}>
              <Text style={styles.storeName}>{item.storeName}</Text>
              <View style={styles.confidenceContainer}>
                <View
                  style={[
                    styles.confidenceIndicator,
                    { backgroundColor: getConfidenceColor(item.confidence) },
                  ]}
                />
                <Text style={styles.confidenceText}>
                  {Math.round(item.confidence * 100)}% confidence
                </Text>
              </View>
            </View>
            <View style={styles.priceComparison}>
              <Text style={styles.currentPrice}>
                {formatCurrency(item.currentPrice)}
              </Text>
              {item.savings > 0 && (
                <Text style={styles.savingsText}>
                  Save {formatCurrency(item.savings)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.comparisonDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Best Price:</Text>
              <Text style={styles.bestPrice}>
                {formatCurrency(item.bestPrice)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price History:</Text>
              <Text style={styles.detailValue}>
                {item.priceHistoryPoints} data points
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.lastUpdated).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.header}
        >
          <Text style={styles.title}>Price Compare</Text>
          <Text style={styles.subtitle}>
            Find the best deals across supermarkets
          </Text>
        </MotiView>

        {/* Search Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.searchSection}
        >
          <Searchbar
            placeholder="Search for items like 'washing powder'..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={() => handleQuickSearch(searchQuery)}
            onFocus={() => setShowSuggestions(true)}
            style={styles.searchBar}
            icon="magnify"
            iconColor={theme.colors.onSurfaceVariant}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            inputStyle={{ color: theme.colors.onSurface }}
          />

          {showSuggestions && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.suggestionsContainer}
            >
              <Text style={styles.suggestionsTitle}>Quick Search</Text>
              <FlatList
                data={QUICK_SEARCH_SUGGESTIONS}
                renderItem={renderQuickSearchSuggestion}
                keyExtractor={(item) => item}
                scrollEnabled={false}
                style={styles.suggestionsList}
              />
            </MotiView>
          )}
        </MotiView>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching for prices...</Text>
          </View>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 400 }}
            style={styles.resultsSection}
          >
            <Text style={styles.sectionTitle}>Search Results</Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.itemName}
              scrollEnabled={false}
              style={styles.resultsList}
            />
          </MotiView>
        )}

        {/* Price Comparisons */}
        {selectedItem && priceComparisons.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 600 }}
            style={styles.comparisonSection}
          >
            <View style={styles.comparisonSectionHeader}>
              <Text style={styles.sectionTitle}>
                Price Comparison: {selectedItem}
              </Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setSelectedItem(null)}
                style={styles.closeButton}
              />
            </View>
            <FlatList
              data={priceComparisons}
              renderItem={renderPriceComparison}
              keyExtractor={(item) => `${item.itemName}-${item.storeName}`}
              scrollEnabled={false}
              style={styles.comparisonList}
            />
          </MotiView>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchQuery && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            style={styles.emptyState}
          >
            <MaterialIcons
              name="search-off"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateMessage}>
              Try searching for a different item or check the quick search
              suggestions
            </Text>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.headline1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: "#666",
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    ...shadows.sm,
    borderRadius: borderRadius.lg,
  },
  suggestionsContainer: {
    marginTop: spacing.md,
    backgroundColor: "white",
    borderRadius: borderRadius.md,
    ...shadows.sm,
    overflow: "hidden",
  },
  suggestionsTitle: {
    ...typography.body2,
    fontWeight: "600",
    padding: spacing.md,
    paddingBottom: spacing.sm,
    color: "#666",
  },
  suggestionsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  suggestionText: {
    ...typography.body2,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body2,
    marginTop: spacing.md,
    color: "#666",
  },
  resultsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline3,
    marginBottom: spacing.md,
  },
  resultsList: {
    gap: spacing.md,
  },
  searchResultCard: {
    ...shadows.sm,
    borderRadius: borderRadius.lg,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultItemName: {
    ...typography.headline2,
    marginBottom: spacing.xs,
  },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
  },
  categoryChipText: {
    color: "#374151",
    fontSize: 12,
  },
  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#F3F4F6",
    borderRadius: borderRadius.md,
  },
  compareButtonText: {
    ...typography.body2,
    fontWeight: "600",
    marginLeft: spacing.xs,
    color: "#007AFF",
  },
  priceOverview: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  priceStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    backgroundColor: "#F9FAFB",
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xs,
  },
  priceLabel: {
    ...typography.caption1,
    color: "#6B7280",
    marginBottom: spacing.xs,
  },
  priceValue: {
    ...typography.headline3,
    fontWeight: "600",
  },
  storePrices: {
    marginTop: spacing.md,
  },
  storePricesTitle: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  storePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    ...typography.body2,
    fontWeight: "500",
  },
  lastChecked: {
    ...typography.caption1,
    color: "#6B7280",
    marginTop: spacing.xs,
  },
  storePrice: {
    alignItems: "flex-end",
  },
  storePriceValue: {
    ...typography.body2,
    fontWeight: "600",
  },
  outOfStockChip: {
    marginTop: spacing.xs,
    backgroundColor: "#FEE2E2",
  },
  outOfStockText: {
    color: "#DC2626",
    fontSize: 10,
  },
  comparisonSection: {
    marginBottom: spacing.lg,
  },
  comparisonSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  closeButton: {
    margin: 0,
  },
  comparisonList: {
    gap: spacing.md,
  },
  comparisonCard: {
    ...shadows.sm,
    borderRadius: borderRadius.lg,
  },
  comparisonCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  comparisonStoreInfo: {
    flex: 1,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  confidenceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  confidenceText: {
    ...typography.caption1,
    color: "#6B7280",
  },
  priceComparison: {
    alignItems: "flex-end",
  },
  currentPrice: {
    ...typography.headline3,
    fontWeight: "600",
  },
  savingsText: {
    ...typography.body2,
    color: "#10B981",
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  comparisonDetails: {
    marginTop: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.body2,
    color: "#6B7280",
  },
  bestPrice: {
    ...typography.body2,
    fontWeight: "600",
    color: "#10B981",
  },
  detailValue: {
    ...typography.body2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    ...typography.headline3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateMessage: {
    ...typography.body2,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
