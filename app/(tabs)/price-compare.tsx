import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
} from "react-native";
import {
  Text,
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
import { StoreLogo } from "@/components/StoreLogo";
import { PriceCompareAutocomplete } from "@/components/PriceCompareAutocomplete";
import { AppTheme } from "@/constants/theme";
import {
  spacing,
  typography,
  borderRadius,
  shadows,
  colors,
} from "@/constants/holisticDesignSystem";
import { API_CONFIG } from "@/constants/api";

interface PriceComparison {
  itemName: string;
  productDetails: {
    brand?: string;
    variety?: string;
    size: string;
    unit: string;
    unitPrice: number;
    packageType: "loose" | "prepackaged" | "bulk";
  };
  currentPrice: number;
  bestPrice: number;
  savings: number;
  storeName: string;
  confidence: number;
  priceHistoryPoints: number;
  lastUpdated: string;
  dataQuality: {
    matchConfidence: number;
    lastVerified: string;
    source: "receipt" | "api" | "manual";
  };
}

interface StorePrice {
  storeName: string;
  price: number;
  inStock: boolean;
  lastChecked: string;
  productDetails?: {
    brand?: string;
    size: string;
    unit: string;
    unitPrice: number;
  };
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
  productVarieties: {
    name: string;
    brand?: string;
    size: string;
    unit: string;
    averagePrice: number;
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [dataUpdateAnimation] = useState(new Animated.Value(1));

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.content.primary;
    if (confidence >= 0.6) return colors.content.secondary;
    return colors.content.tertiary;
  };

  const animateDataUpdate = () => {
    Animated.sequence([
      Animated.timing(dataUpdateAnimation, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(dataUpdateAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    handleQuickSearch(product.name);
  };

  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchQuery(query);

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
            animateDataUpdate();
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
      animateDataUpdate();
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults(generateMockSearchResults(query));
      animateDataUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = async (query: string) => {
    handleSearchSubmit(query);
  };

  const generateMockSearchResults = (query: string): QuickSearchResult[] => {
    const basePrice = 10 + Math.random() * 20;
    const getProductVarieties = (itemName: string) => {
      const varieties = [
        {
          name: `${itemName} 500g`,
          brand: "Generic",
          size: "500g",
          unit: "g",
          averagePrice: basePrice * 0.8,
        },
        {
          name: `${itemName} 1kg`,
          brand: "Premium",
          size: "1kg",
          unit: "kg",
          averagePrice: basePrice * 1.2,
        },
        {
          name: `${itemName} 2kg`,
          brand: "Value",
          size: "2kg",
          unit: "kg",
          averagePrice: basePrice * 1.8,
        },
      ];
      return varieties.slice(0, 2 + Math.floor(Math.random() * 2));
    };

    const stores = ["Countdown", "New World", "Pak'nSave", "Fresh Choice"];
    const mockStores = stores.map((store, index) => ({
      storeName: store,
      price: basePrice + (Math.random() - 0.5) * 5,
      inStock: Math.random() > 0.1,
      lastChecked: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000
      ).toISOString(),
      productDetails: {
        brand: Math.random() > 0.5 ? "Generic" : "Premium",
        size: "1kg",
        unit: "kg",
        unitPrice: basePrice + (Math.random() - 0.5) * 2,
      },
    }));

    const priceHistory = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      price: basePrice + (Math.random() - 0.5) * 3,
      store: stores[Math.floor(Math.random() * stores.length)],
    }));

    return [
      {
        itemName: query,
        category: "Groceries",
        averagePrice: basePrice,
        priceRange: {
          min: Math.min(...mockStores.map((s) => s.price)),
          max: Math.max(...mockStores.map((s) => s.price)),
        },
        stores: mockStores,
        priceHistory,
        productVarieties: getProductVarieties(query),
      },
    ];
  };

  const handleItemSelect = (itemName: string) => {
    setSelectedItem(itemName);
    fetchPriceComparison(itemName);
  };

  const fetchPriceComparison = async (itemName: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const comparisons = generateMockPriceComparisons(itemName);
      setPriceComparisons(comparisons);
    } catch (error) {
      console.error("Failed to fetch price comparison:", error);
      setPriceComparisons(generateMockPriceComparisons(itemName));
    } finally {
      setLoading(false);
    }
  };

  const generateMockPriceComparisons = (
    itemName: string
  ): PriceComparison[] => {
    const getProductDetails = (name: string) => {
      const details = {
        "chicken breast": {
          brand: "Free Range",
          variety: "Skinless",
          size: "1kg",
          unit: "kg",
          unitPrice: 12.98,
          packageType: "prepackaged" as const,
        },
        milk: {
          brand: "Anchor",
          variety: "Full Cream",
          size: "2L",
          unit: "L",
          unitPrice: 4.5,
          packageType: "prepackaged" as const,
        },
        bread: {
          brand: "Vogel's",
          variety: "Wholegrain",
          size: "700g",
          unit: "g",
          unitPrice: 3.2,
          packageType: "prepackaged" as const,
        },
        bananas: {
          brand: undefined,
          variety: "Cavendish",
          size: "1kg",
          unit: "kg",
          unitPrice: 3.5,
          packageType: "loose" as const,
        },
      };
      return (
        details[name.toLowerCase()] || {
          brand: "Generic",
          variety: "Standard",
          size: "1kg",
          unit: "kg",
          unitPrice: 10.0,
          packageType: "prepackaged" as const,
        }
      );
    };

    const stores = [
      { name: "Countdown", basePrice: 12.98 },
      { name: "New World", basePrice: 15.84 },
      { name: "Pak'nSave", basePrice: 13.58 },
      { name: "Fresh Choice", basePrice: 17.19 },
    ];

    return stores.map((store, index) => {
      const basePrice = store.basePrice;
      const currentPrice = basePrice + (Math.random() - 0.5) * 2;
      const bestPrice = Math.min(...stores.map((s) => s.basePrice));
      const savings = currentPrice - bestPrice;

      return {
        itemName,
        productDetails: getProductDetails(itemName),
        currentPrice,
        bestPrice,
        savings: savings > 0 ? savings : 0,
        storeName: store.name,
        confidence: 0.85 + Math.random() * 0.1,
        priceHistoryPoints: 15 + Math.floor(Math.random() * 20),
        lastUpdated: new Date(
          Date.now() - Math.random() * 24 * 60 * 60 * 1000
        ).toISOString(),
        dataQuality: {
          matchConfidence: 0.9 + Math.random() * 0.08,
          lastVerified: new Date(
            Date.now() - Math.random() * 12 * 60 * 60 * 1000
          ).toISOString(),
          source:
            Math.random() > 0.5 ? "receipt" : ("api" as "receipt" | "api"),
        },
      };
    });
  };

  const getStoreIcon = (storeName: string) => {
    const icons = {
      Countdown: "store",
      "New World": "store",
      "Pak'nSave": "shopping-cart",
      "Fresh Choice": "store",
    };
    return icons[storeName as keyof typeof icons] || "store";
  };

  const getDataFreshnessStatus = (lastChecked: string) => {
    const hours =
      (Date.now() - new Date(lastChecked).getTime()) / (1000 * 60 * 60);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSmartSummary = (item: QuickSearchResult) => {
    const bestPrice = Math.min(...item.stores.map((s) => s.price));
    const worstPrice = Math.max(...item.stores.map((s) => s.price));
    const savings = worstPrice - bestPrice;

    if (savings > 5) {
      return `Save up to ${formatCurrency(savings)} by shopping smart`;
    } else if (savings > 2) {
      return `Prices vary by ${formatCurrency(savings)} across stores`;
    } else {
      return "Prices are consistent across stores";
    }
  };

  const renderQuickSearchSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleQuickSearch(item)}
    >
      <MaterialIcons name="search" size={20} color={colors.content.tertiary} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: QuickSearchResult }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.searchResultCard}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <View style={styles.resultInfo}>
              <Text style={styles.resultItemName}>{item.itemName}</Text>
              <Text style={styles.priceSummary}>
                {formatCurrency(item.averagePrice)} avg •{" "}
                {formatCurrency(item.priceRange.min)}-
                {formatCurrency(item.priceRange.max)}
              </Text>
              <Text style={styles.storeSummary}>
                Across {item.stores.map((s) => s.storeName).join(", ")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.compareButton}
              onPress={() => handleItemSelect(item.itemName)}
            >
              <MaterialIcons
                name="compare-arrows"
                size={16}
                color={colors.brand.primary}
              />
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.smartSummaryCard}>
            <MaterialIcons
              name="lightbulb"
              size={20}
              color={colors.content.primary}
            />
            <Text style={styles.smartSummaryText}>{getSmartSummary(item)}</Text>
          </View>

          <View style={styles.storePrices}>
            {item.stores.slice(0, 3).map((store, index) => (
              <View key={store.storeName} style={styles.storePriceRow}>
                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <StoreLogo storeName={store.storeName} size="small" />
                    <Text style={styles.storeName}>{store.storeName}</Text>
                    <Text style={styles.freshnessStatus}>
                      {getDataFreshnessStatus(store.lastChecked)}
                    </Text>
                  </View>
                  <Text style={styles.lastChecked}>
                    {store.productDetails?.brand &&
                      `${store.productDetails.brand} • `}
                    {store.productDetails?.size}
                  </Text>
                </View>
                <View style={styles.storePrice}>
                  <Text style={styles.priceText}>
                    {formatCurrency(store.price)}
                  </Text>
                  <Text style={styles.unitText}>
                    per {store.productDetails?.unit}
                  </Text>
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
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.comparisonCard}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.comparisonHeader}>
            <View style={styles.storeInfo}>
              <View style={styles.storeHeader}>
                <StoreLogo storeName={item.storeName} size="medium" />
                <Text style={styles.storeName}>{item.storeName}</Text>
              </View>
              <Text style={styles.productDetails}>
                {item.productDetails.brand && `${item.productDetails.brand} • `}
                {item.productDetails.variety &&
                  `${item.productDetails.variety} • `}
                {item.productDetails.size}
              </Text>
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
              <Text style={styles.bestPriceText}>
                Best: {formatCurrency(item.bestPrice)}
              </Text>
            </View>
          </View>

          <View style={styles.comparisonDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Package Type:</Text>
              <Text style={styles.detailValue}>
                {item.productDetails.packageType}
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
      style={[styles.container, { backgroundColor: colors.surface.primary }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, spacing.large),
            paddingTop: spacing.medium,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
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

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.searchSection}
        >
          <PriceCompareAutocomplete
            onProductSelect={handleProductSelect}
            onSearchSubmit={handleSearchSubmit}
            placeholder="Search milk, bread, apples..."
            initialValue={searchQuery}
            variant="default"
          />

          {loading && (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="small" color={colors.content.primary} />
              <Text style={styles.searchLoadingText}>Searching...</Text>
            </View>
          )}
        </MotiView>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.content.primary} />
            <Text style={styles.loadingText}>Searching for prices...</Text>
          </View>
        )}

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
              color={colors.content.tertiary}
            />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateMessage}>
              Try searching for a different item or check the quick search
              suggestions
            </Text>
          </MotiView>
        )}

        {/* Quick Search Suggestions - Show when no search is active */}
        {!loading && searchResults.length === 0 && !searchQuery && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 300 }}
            style={styles.quickSearchSection}
          >
            <Text style={styles.sectionTitle}>Quick Search</Text>
            <FlatList
              data={QUICK_SEARCH_SUGGESTIONS}
              renderItem={renderQuickSearchSuggestion}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              style={styles.suggestionsList}
            />
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
    paddingHorizontal: spacing.large,
  },
  header: {
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.large,
  },
  title: {
    ...typography.headline.large,
    marginBottom: spacing.tiny,
    color: colors.content.primary,
  },
  subtitle: {
    ...typography.body.medium,
    color: colors.content.secondary,
  },
  searchSection: {
    marginBottom: spacing.large,
  },
  searchLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.small,
    marginTop: spacing.small,
  },
  searchLoadingText: {
    ...typography.body.medium,
    marginLeft: spacing.small,
    color: colors.content.secondary,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.xlarge,
  },
  loadingText: {
    ...typography.body.medium,
    marginTop: spacing.medium,
    color: colors.content.secondary,
  },
  resultsSection: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    ...typography.headline.medium,
    marginBottom: spacing.medium,
    color: colors.content.primary,
  },
  resultsList: {
    gap: spacing.medium,
  },
  searchResultCard: {
    marginBottom: spacing.medium,
  },
  card: {
    ...shadows.small,
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface.primary,
  },
  smartSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[100],
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.medium,
    borderLeftWidth: 3,
    borderLeftColor: colors.content.primary,
  },
  smartSummaryText: {
    ...typography.body.medium,
    color: colors.content.primary,
    marginLeft: spacing.small,
    flex: 1,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.medium,
  },
  resultInfo: {
    flex: 1,
  },
  resultItemName: {
    ...typography.title.large,
    marginBottom: spacing.tiny,
    color: colors.content.primary,
  },
  priceSummary: {
    ...typography.body.medium,
    color: colors.content.secondary,
  },
  storeSummary: {
    ...typography.body.small,
    color: colors.content.secondary,
  },
  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.content.primary,
  },
  compareButtonText: {
    ...typography.label.medium,
    marginLeft: spacing.tiny,
    color: colors.content.primary,
  },
  storePrices: {
    marginTop: spacing.medium,
  },
  storePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    marginBottom: spacing.tiny,
  },
  storeInfo: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: {
    ...typography.body.medium,
    fontWeight: "500",
    marginLeft: spacing.small,
    color: colors.content.primary,
  },
  freshnessStatus: {
    ...typography.body.small,
    color: colors.content.secondary,
    marginLeft: "auto",
  },
  lastChecked: {
    ...typography.body.small,
    color: colors.content.secondary,
    marginTop: spacing.tiny,
  },
  storePrice: {
    alignItems: "flex-end",
  },
  priceText: {
    ...typography.title.medium,
    fontWeight: "600",
    color: colors.content.primary,
  },
  unitText: {
    ...typography.body.small,
    color: colors.content.secondary,
  },
  comparisonSection: {
    marginBottom: spacing.large,
  },
  comparisonSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  closeButton: {
    margin: 0,
  },
  comparisonList: {
    gap: spacing.medium,
  },
  comparisonCard: {
    marginBottom: spacing.medium,
  },
  comparisonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.medium,
  },
  comparisonDetails: {
    marginTop: spacing.medium,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.tiny,
  },
  detailLabel: {
    ...typography.body.medium,
    color: colors.content.secondary,
  },
  detailValue: {
    ...typography.body.medium,
    color: colors.content.primary,
  },
  currentPrice: {
    ...typography.headline.small,
    fontWeight: "600",
    color: colors.content.primary,
  },
  savingsText: {
    ...typography.body.medium,
    color: colors.content.primary,
    fontWeight: "600",
    marginTop: spacing.tiny,
  },
  bestPriceText: {
    ...typography.body.small,
    color: colors.content.primary,
    fontWeight: "600",
    marginTop: spacing.tiny,
  },
  productDetails: {
    ...typography.body.small,
    color: colors.content.secondary,
    marginTop: spacing.tiny,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxlarge,
  },
  emptyStateTitle: {
    ...typography.headline.small,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
    color: colors.content.primary,
  },
  emptyStateMessage: {
    ...typography.body.medium,
    color: colors.content.secondary,
    textAlign: "center",
    paddingHorizontal: spacing.large,
  },
  quickSearchSection: {
    marginTop: spacing.large,
  },
  suggestionsList: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: borderRadius.small,
  },
  suggestionText: {
    ...typography.body.medium,
    marginLeft: spacing.small,
    color: colors.content.primary,
  },
  priceComparison: {
    alignItems: "flex-end",
  },
});
