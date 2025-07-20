import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import {
  productMatchingService,
  ProductMatch,
  UnitPriceInfo,
  ProductAlternative,
} from "@/services/ProductMatchingService";
import { Product } from "@/types";

interface AdvancedProductMatchingProps {
  variant?: "demo" | "full";
  onProductSelect?: (product: Product) => void;
}

export const AdvancedProductMatching: React.FC<
  AdvancedProductMatchingProps
> = ({ variant = "demo", onProductSelect }) => {
  const theme = useTheme<AppTheme>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [matches, setMatches] = useState<ProductMatch[]>([]);
  const [alternatives, setAlternatives] = useState<ProductAlternative[]>([]);

  // Demo data for showcase
  const demoProducts: Product[] = [
    {
      id: "1",
      name: "Anchor Milk 2L",
      price: 4.5,
      size: "2L",
      barcode: "9415007000000",
      storeId: "countdown",
      category: "Dairy",
      brand: "Anchor",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Anchor Milk 2L",
      price: 4.2,
      size: "2L",
      barcode: "9415007000000",
      storeId: "new-world",
      category: "Dairy",
      brand: "Anchor",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Anchor Milk 1L",
      price: 2.8,
      size: "1L",
      barcode: "9415007000001",
      storeId: "pak-n-save",
      category: "Dairy",
      brand: "Anchor",
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Countdown Milk 2L",
      price: 4.0,
      size: "2L",
      barcode: "9415007000002",
      storeId: "countdown",
      category: "Dairy",
      brand: "Countdown",
      created_at: new Date().toISOString(),
    },
  ];

  // Initialize demo data
  React.useEffect(() => {
    demoProducts.forEach((product) => {
      productMatchingService.addProduct(product);
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      const searchProduct: Product = {
        id: "search",
        name: query,
        price: 0,
        storeId: "",
        created_at: new Date().toISOString(),
      };

      const foundMatches =
        productMatchingService.findEquivalentProducts(searchProduct);
      setMatches(foundMatches);
    } else {
      setMatches([]);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    const foundAlternatives =
      productMatchingService.suggestAlternatives(product);
    setAlternatives(foundAlternatives);
    onProductSelect?.(product);
  };

  const renderUnitPrice = (product: Product) => {
    const unitPrice = productMatchingService.calculateUnitPrice(product);
    if (!unitPrice) return null;

    return (
      <View style={styles.unitPriceContainer}>
        <Text style={[styles.unitPriceText, { color: theme.colors.primary }]}>
          ${unitPrice.perUnit.toFixed(2)}/{unitPrice.unit}
        </Text>
        <Text
          style={[
            styles.unitPriceLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Unit Price
        </Text>
      </View>
    );
  };

  const renderProductCard = (product: Product, match?: ProductMatch) => {
    const isSelected = selectedProduct?.id === product.id;

    return (
      <TouchableOpacity
        key={product.id}
        style={[
          styles.productCard,
          { backgroundColor: theme.colors.surface },
          isSelected && styles.selectedProductCard,
        ]}
        onPress={() => handleProductSelect(product)}
        activeOpacity={0.8}
      >
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, { color: theme.colors.onSurface }]}
            >
              {product.name}
            </Text>
            <Text
              style={[
                styles.productBrand,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {product.brand} • {product.size}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text
              style={[styles.productPrice, { color: theme.colors.primary }]}
            >
              ${product.price.toFixed(2)}
            </Text>
            {match && (
              <View style={styles.matchIndicator}>
                <MaterialIcons
                  name={match.matchType === "barcode" ? "qr-code" : "search"}
                  size={16}
                  color={match.confidence > 0.9 ? "#10B981" : "#F59E0B"}
                />
                <Text
                  style={[
                    styles.matchText,
                    { color: match.confidence > 0.9 ? "#10B981" : "#F59E0B" },
                  ]}
                >
                  {Math.round(match.confidence * 100)}% match
                </Text>
              </View>
            )}
          </View>
        </View>

        {renderUnitPrice(product)}

        <View style={styles.storeInfo}>
          <MaterialIcons
            name="store"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[styles.storeName, { color: theme.colors.onSurfaceVariant }]}
          >
            {product.storeId
              .replace("-", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAlternatives = () => {
    if (alternatives.length === 0) return null;

    return (
      <View style={styles.alternativesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Better Value Alternatives
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {alternatives.map((alternative, index) => (
            <View key={index} style={styles.alternativeCard}>
              <Text
                style={[
                  styles.alternativeName,
                  { color: theme.colors.onSurface },
                ]}
              >
                {alternative.product.name}
              </Text>
              <Text
                style={[
                  styles.alternativePrice,
                  { color: theme.colors.primary },
                ]}
              >
                ${alternative.product.price.toFixed(2)}
              </Text>
              <Text style={[styles.alternativeSavings, { color: "#10B981" }]}>
                Save ${alternative.savings.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.alternativeReason,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {alternative.reason}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (variant === "demo") {
    return (
      <View style={styles.demoContainer}>
        <Text style={[styles.demoTitle, { color: theme.colors.primary }]}>
          Smart Product Matching
        </Text>
        <Text
          style={[
            styles.demoSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          AI-powered product matching across stores with unit price comparison
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="Search for a product..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <MaterialIcons name="search" size={24} color={theme.colors.primary} />
        </View>

        {matches.length > 0 && (
          <View style={styles.matchesSection}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              Found {matches.length} matches
            </Text>
            <ScrollView style={styles.matchesList}>
              {matches.map((match) => renderProductCard(match.product, match))}
            </ScrollView>
          </View>
        )}

        {renderAlternatives()}

        <View style={styles.featuresList}>
          <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
            Key Features
          </Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="auto-awesome" size={20} color="#10B981" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              AI-powered fuzzy matching for similar product names
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="calculate" size={20} color="#3B82F6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              Automatic unit price calculation and comparison
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              Smart alternative suggestions for better value
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Advanced Product Matching
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Find equivalent products across stores with intelligent matching
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={[
            styles.fullSearchInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline,
            },
          ]}
          placeholder="Enter product name or scan barcode..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={styles.content}>
        {matches.length > 0 && (
          <View style={styles.matchesSection}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              Product Matches ({matches.length})
            </Text>
            {matches.map((match) => renderProductCard(match.product, match))}
          </View>
        )}

        {renderAlternatives()}

        {selectedProduct && (
          <View style={styles.selectedProductSection}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              Selected Product Details
            </Text>
            <View
              style={[
                styles.selectedProductDetailsCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.selectedProductName,
                  { color: theme.colors.onSurface },
                ]}
              >
                {selectedProduct.name}
              </Text>
              <Text
                style={[
                  styles.selectedProductDetails,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Brand: {selectedProduct.brand} | Size: {selectedProduct.size} |
                Store: {selectedProduct.storeId}
              </Text>
              {renderUnitPrice(selectedProduct)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  fullSearchInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...typography.body1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  demoContainer: {
    padding: spacing.lg,
  },
  demoTitle: {
    ...typography.headline1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  demoSubtitle: {
    ...typography.body1,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    height: 48,
    ...typography.body1,
  },
  matchesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  matchesList: {
    maxHeight: 300,
  },
  productCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  selectedProductCard: {
    ...shadows.md,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  productBrand: {
    ...typography.caption1,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  productPrice: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchText: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  unitPriceContainer: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  unitPriceText: {
    ...typography.body2,
    fontWeight: "600",
  },
  unitPriceLabel: {
    ...typography.caption1,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeName: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  alternativesSection: {
    marginBottom: spacing.lg,
  },
  alternativeCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    minWidth: 150,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  alternativeName: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  alternativePrice: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  alternativeSavings: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  alternativeReason: {
    ...typography.caption1,
    lineHeight: 16,
  },
  featuresList: {
    marginTop: spacing.lg,
  },
  featuresTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
  },
  selectedProductSection: {
    marginTop: spacing.lg,
  },
  selectedProductDetailsCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  selectedProductName: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  selectedProductDetails: {
    ...typography.body2,
    marginBottom: spacing.md,
  },
});
