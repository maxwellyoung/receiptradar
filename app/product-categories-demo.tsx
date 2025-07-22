import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, useTheme, Chip, Searchbar, Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import {
  getAllCategories,
  getCategoryById,
  ProductCategory,
} from "@/constants/productCategories";
import { getProductImage } from "@/services/ProductImageService";
import {
  AppTheme,
  spacing,
  typography,
  shadows,
  borderRadius,
} from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface DemoProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
  brand?: string;
  store?: string;
}

// Sample products for demo
const demoProducts: DemoProduct[] = [
  {
    id: "1",
    name: "Anchor Blue Milk 2L",
    price: 4.5,
    category: "dairy",
    description: "Fresh whole milk from New Zealand dairy farms",
    brand: "Anchor",
    store: "Countdown",
  },
  {
    id: "2",
    name: "Bananas 1kg",
    price: 3.99,
    category: "fresh-produce",
    description: "Fresh yellow bananas",
    brand: "Fresh",
    store: "New World",
  },
  {
    id: "3",
    name: "Beef Mince 500g",
    price: 12.99,
    category: "meat-seafood",
    description: "Premium beef mince",
    brand: "Fresh",
    store: "Pak'nSave",
  },
  {
    id: "4",
    name: "Vogel's Bread 700g",
    price: 5.99,
    category: "bread-bakery",
    description: "Wholegrain bread with seeds",
    brand: "Vogel's",
    store: "Countdown",
  },
  {
    id: "5",
    name: "Coca Cola 2L",
    price: 3.99,
    category: "beverages",
    description: "Classic Coca Cola",
    brand: "Coca Cola",
    store: "New World",
  },
  {
    id: "6",
    name: "Bluebird Original Chips 150g",
    price: 3.99,
    category: "snacks-confectionery",
    description: "Classic potato chips",
    brand: "Bluebird",
    store: "Pak'nSave",
  },
  {
    id: "7",
    name: "Tip Top Vanilla Ice Cream 2L",
    price: 8.99,
    category: "frozen-foods",
    description: "Creamy vanilla ice cream",
    brand: "Tip Top",
    store: "Countdown",
  },
  {
    id: "8",
    name: "Quilton Toilet Paper 12 Pack",
    price: 8.99,
    category: "household-cleaning",
    description: "3-ply toilet paper",
    brand: "Quilton",
    store: "The Warehouse",
  },
  {
    id: "9",
    name: "Head & Shoulders Shampoo 400ml",
    price: 8.99,
    category: "personal-care-health",
    description: "Anti-dandruff shampoo",
    brand: "Head & Shoulders",
    store: "Countdown",
  },
  {
    id: "10",
    name: "Huggies Nappies Size 4 40 Pack",
    price: 24.99,
    category: "baby-kids",
    description: "Comfortable baby nappies",
    brand: "Huggies",
    store: "New World",
  },
  {
    id: "11",
    name: "Whiskas Cat Food 1kg",
    price: 12.99,
    category: "pet-supplies",
    description: "Complete cat food",
    brand: "Whiskas",
    store: "Countdown",
  },
  {
    id: "12",
    name: "Corona Beer 6 Pack",
    price: 18.99,
    category: "alcohol-tobacco",
    description: "Mexican lager beer",
    brand: "Corona",
    store: "New World",
  },
  {
    id: "13",
    name: "Organic Bananas 1kg",
    price: 5.99,
    category: "organic-health",
    description: "Organic certified bananas",
    brand: "Organic",
    store: "Countdown",
  },
];

export default function ProductCategoriesDemo() {
  const theme = useTheme<AppTheme>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] =
    useState<DemoProduct[]>(demoProducts);
  const [productsWithImages, setProductsWithImages] = useState<DemoProduct[]>(
    []
  );

  const categories = getAllCategories();

  useEffect(() => {
    // Load images for products
    const loadProductImages = async () => {
      const productsWithImagesData = await Promise.all(
        demoProducts.map(async (product) => {
          try {
            const imageUrl = await getProductImage(product.name);
            return { ...product, image_url: imageUrl };
          } catch (error) {
            console.warn(`Failed to load image for ${product.name}:`, error);
            return product;
          }
        })
      );
      setProductsWithImages(productsWithImagesData);
    };

    loadProductImages();
  }, []);

  useEffect(() => {
    let filtered = productsWithImages;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, productsWithImages]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleProductPress = (product: DemoProduct) => {
    console.log("Product pressed:", product);
    // You can add navigation to product detail page here
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Product Categories Demo
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Enhanced categorization with better images
        </Text>
      </View>

      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.onSurfaceVariant}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          onPress={() => handleCategoryPress("all")}
          style={[
            styles.categoryChip,
            selectedCategory === "all" && {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryChipText,
              {
                color:
                  selectedCategory === "all"
                    ? theme.colors.onPrimary
                    : theme.colors.onSurface,
              },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && {
                backgroundColor: category.color,
              },
            ]}
          >
            <MaterialIcons
              name={category.icon as any}
              size={16}
              color={
                selectedCategory === category.id
                  ? theme.colors.onPrimary
                  : category.color
              }
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryChipText,
                {
                  color:
                    selectedCategory === category.id
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
              size="medium"
              showCategory={true}
              showBrand={true}
              showStore={true}
            />
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="search-off"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodyLarge"
              style={[
                styles.emptyText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              No products found
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.emptySubtext,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.statsContainer}>
        <Text
          variant="bodySmall"
          style={[styles.statsText, { color: theme.colors.onSurfaceVariant }]}
        >
          Showing {filteredProducts.length} of {demoProducts.length} products
        </Text>
        {selectedCategory && (
          <Text
            variant="bodySmall"
            style={[styles.statsText, { color: theme.colors.onSurfaceVariant }]}
          >
            Category: {getCategoryById(selectedCategory)?.name}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  subtitle: {
    lineHeight: 20,
  },
  searchbar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  categoriesContainer: {
    marginBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    minWidth: 80,
  },
  categoryIcon: {
    marginRight: spacing.xs,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    textAlign: "center",
  },
  statsContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
  },
  statsText: {
    textAlign: "center",
  },
});
