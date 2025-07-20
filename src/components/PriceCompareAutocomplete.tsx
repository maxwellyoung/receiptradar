import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";

interface ProductSuggestion {
  id: string;
  name: string;
  category: string;
  brand?: string;
  recentPrice?: number;
  storeCount: number;
  isRecent?: boolean;
  isPopular?: boolean;
}

interface PriceCompareAutocompleteProps {
  onProductSelect: (product: ProductSuggestion) => void;
  onSearchSubmit: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  variant?: "default" | "compact";
}

const { width } = Dimensions.get("window");

export const PriceCompareAutocomplete: React.FC<
  PriceCompareAutocompleteProps
> = ({
  onProductSelect,
  onSearchSubmit,
  placeholder = "Search for products...",
  initialValue = "",
  variant = "default",
}) => {
  const theme = useTheme<AppTheme>();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<ProductSuggestion[]>([]);
  const [popularProducts, setPopularProducts] = useState<ProductSuggestion[]>(
    []
  );

  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Mock data - in real app would come from API/database
  const mockProducts: ProductSuggestion[] = [
    {
      id: "1",
      name: "Milk 2L",
      category: "Dairy",
      brand: "Anchor",
      recentPrice: 4.5,
      storeCount: 3,
      isPopular: true,
    },
    {
      id: "2",
      name: "Bread White",
      category: "Bakery",
      brand: "Tip Top",
      recentPrice: 3.2,
      storeCount: 4,
      isPopular: true,
    },
    {
      id: "3",
      name: "Bananas 1kg",
      category: "Fruits",
      recentPrice: 3.99,
      storeCount: 5,
      isPopular: true,
    },
    {
      id: "4",
      name: "Chicken Breast",
      category: "Meat",
      brand: "Pams",
      recentPrice: 12.99,
      storeCount: 3,
    },
    {
      id: "5",
      name: "Eggs 12pk",
      category: "Dairy",
      brand: "Farm Fresh",
      recentPrice: 6.5,
      storeCount: 4,
    },
    {
      id: "6",
      name: "Tomatoes 500g",
      category: "Vegetables",
      recentPrice: 4.99,
      storeCount: 3,
    },
    {
      id: "7",
      name: "Rice 2kg",
      category: "Pantry",
      brand: "SunRice",
      recentPrice: 5.99,
      storeCount: 2,
    },
    {
      id: "8",
      name: "Cheese Cheddar",
      category: "Dairy",
      brand: "Mainland",
      recentPrice: 8.5,
      storeCount: 3,
    },
    {
      id: "9",
      name: "Apples 1kg",
      category: "Fruits",
      recentPrice: 5.99,
      storeCount: 4,
    },
    {
      id: "10",
      name: "Potatoes 2kg",
      category: "Vegetables",
      recentPrice: 4.5,
      storeCount: 3,
    },
    {
      id: "11",
      name: "Yogurt Natural",
      category: "Dairy",
      brand: "Puhoi Valley",
      recentPrice: 3.99,
      storeCount: 2,
    },
    {
      id: "12",
      name: "Pasta 500g",
      category: "Pantry",
      brand: "San Remo",
      recentPrice: 2.99,
      storeCount: 3,
    },
    {
      id: "13",
      name: "Beef Mince",
      category: "Meat",
      brand: "Pams",
      recentPrice: 15.99,
      storeCount: 2,
    },
    {
      id: "14",
      name: "Onions 1kg",
      category: "Vegetables",
      recentPrice: 2.99,
      storeCount: 4,
    },
    {
      id: "15",
      name: "Oranges 1kg",
      category: "Fruits",
      recentPrice: 4.5,
      storeCount: 3,
    },
  ];

  useEffect(() => {
    loadRecentSearches();
    loadPopularProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      generateSuggestions(searchQuery);
      setShowSuggestions(true);
      animateIn();
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadRecentSearches = () => {
    // Mock recent searches - in real app would come from local storage
    const recent = mockProducts.slice(0, 3).map((product) => ({
      ...product,
      isRecent: true,
    }));
    setRecentSearches(recent);
  };

  const loadPopularProducts = () => {
    const popular = mockProducts.filter((product) => product.isPopular);
    setPopularProducts(popular);
  };

  const generateSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = mockProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(lowerQuery);
      const brandMatch = product.brand?.toLowerCase().includes(lowerQuery);
      const categoryMatch = product.category.toLowerCase().includes(lowerQuery);
      return nameMatch || brandMatch || categoryMatch;
    });

    // Sort by relevance (exact matches first, then partial matches)
    const sorted = filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery))
        return -1;
      if (!aName.startsWith(lowerQuery) && bName.startsWith(lowerQuery))
        return 1;

      return aName.localeCompare(bName);
    });

    setSuggestions(sorted.slice(0, 8)); // Limit to 8 suggestions
  };

  const animateIn = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleProductSelect = (product: ProductSuggestion) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onProductSelect(product);

    // Add to recent searches
    const updatedRecent = [
      { ...product, isRecent: true },
      ...recentSearches.filter((item) => item.id !== product.id),
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const renderSuggestionItem = ({
    item,
    index,
  }: {
    item: ProductSuggestion;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { backgroundColor: theme.colors.surface },
        selectedIndex === index && {
          backgroundColor: theme.colors.primary + "10",
        },
      ]}
      onPress={() => handleProductSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.onSurface }]}>
            {item.name}
          </Text>
          {item.brand && (
            <Text
              style={[
                styles.productBrand,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.brand}
            </Text>
          )}
          <Text
            style={[
              styles.productCategory,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {item.category}
          </Text>
        </View>

        <View style={styles.productMeta}>
          {item.recentPrice && (
            <Text style={[styles.recentPrice, { color: theme.colors.primary }]}>
              ${item.recentPrice.toFixed(2)}
            </Text>
          )}
          <Text
            style={[
              styles.storeCount,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {item.storeCount} stores
          </Text>
          {item.isRecent && (
            <View
              style={[
                styles.recentBadge,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Text
                style={[styles.recentText, { color: theme.colors.primary }]}
              >
                Recent
              </Text>
            </View>
          )}
          {item.isPopular && (
            <View
              style={[
                styles.popularBadge,
                { backgroundColor: "#F59E0B" + "20" },
              ]}
            >
              <Text style={[styles.popularText, { color: "#F59E0B" }]}>
                Popular
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearches = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Recent Searches
      </Text>
      {recentSearches.map((item, index) => (
        <TouchableOpacity
          key={`recent-${item.id}`}
          style={[
            styles.suggestionItem,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => handleProductSelect(item)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="history"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
          <View style={styles.suggestionContent}>
            <Text
              style={[styles.productName, { color: theme.colors.onSurface }]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.productCategory,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.category}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPopularProducts = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Popular Products
      </Text>
      {popularProducts.map((item, index) => (
        <TouchableOpacity
          key={`popular-${item.id}`}
          style={[
            styles.suggestionItem,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => handleProductSelect(item)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="trending-up" size={20} color="#F59E0B" />
          <View style={styles.suggestionContent}>
            <Text
              style={[styles.productName, { color: theme.colors.onSurface }]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.productCategory,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.category}
            </Text>
          </View>
          {item.recentPrice && (
            <Text style={[styles.recentPrice, { color: theme.colors.primary }]}>
              ${item.recentPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    return (
      <Animated.View
        style={[
          styles.suggestionsContainer,
          {
            backgroundColor: theme.colors.surface,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {searchQuery.length > 0 ? (
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyState}>
            {recentSearches.length > 0 && renderRecentSearches()}
            {popularProducts.length > 0 && renderPopularProducts()}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        variant === "compact" && styles.compactContainer,
      ]}
    >
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.searchInputContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={theme.colors.onSurfaceVariant}
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: theme.colors.onSurface }]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => {
              setIsFocused(true);
              if (searchQuery.length === 0) {
                setShowSuggestions(true);
                animateIn();
              }
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding suggestions to allow for touch events
              setTimeout(() => {
                if (!isFocused) {
                  setShowSuggestions(false);
                  animateOut();
                }
              }, 150);
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <MaterialIcons
                name="close"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={[
              styles.searchButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSearchSubmit}
            activeOpacity={0.8}
          >
            <Text style={[styles.searchButtonText, { color: "white" }]}>
              Search
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {renderSuggestions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  compactContainer: {
    marginBottom: spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    ...shadows.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  searchButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  searchButtonText: {
    ...typography.body2,
    fontWeight: "600",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...shadows.lg,
    zIndex: 1001,
    elevation: 8,
  },
  suggestionsList: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestionContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body2,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  productBrand: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  productCategory: {
    ...typography.caption1,
    textTransform: "capitalize",
  },
  productMeta: {
    alignItems: "flex-end",
  },
  recentPrice: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  storeCount: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  recentBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recentText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  popularBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  emptyState: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
});
