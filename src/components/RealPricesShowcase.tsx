import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRealPrices, RealPrice } from "../hooks/useRealPrices";

export function RealPricesShowcase() {
  const {
    prices,
    stats,
    loading,
    error,
    searchProducts,
    getCategories,
    getCheapestProducts,
    getMostExpensiveProducts,
  } = useRealPrices();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading real price data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const categories = ["all", ...getCategories()];
  const filteredProducts = searchQuery
    ? searchProducts(searchQuery)
    : selectedCategory === "all"
    ? prices
    : prices.filter((p) => p.category === selectedCategory);

  const renderProduct = ({ item }: { item: RealPrice }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
      {item.volume && <Text style={styles.productVolume}>{item.volume}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Real Countdown Prices</Text>
          <Text style={styles.statsText}>
            {stats.totalProducts} products • {stats.categories} categories •
            Avg: ${stats.averagePrice.toFixed(2)}
          </Text>
          <Text style={styles.statsText}>
            Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Filter */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item && styles.categoryButtonTextActive,
              ]}
            >
              {item === "all" ? "All" : item}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSearchQuery("");
            setSelectedCategory("all");
          }}
        >
          <Text style={styles.actionButtonText}>Show All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            // This would show cheapest products
          }}
        >
          <Text style={styles.actionButtonText}>Cheapest</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts.slice(0, 50)} // Limit to first 50 for performance
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        style={styles.productsList}
        ListHeaderComponent={
          <Text style={styles.resultsText}>
            Showing {filteredProducts.length} products
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
    color: "#ff4444",
  },
  statsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  searchInput: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  categoryList: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
    padding: 16,
    paddingBottom: 8,
  },
  productsList: {
    flex: 1,
  },
  productCard: {
    backgroundColor: "#fff",
    margin: 4,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  productVolume: {
    fontSize: 12,
    color: "#999",
  },
});
