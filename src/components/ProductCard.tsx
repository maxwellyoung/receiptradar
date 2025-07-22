import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, Chip, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { ProductImage } from "./ProductImage";
import {
  getCategoryImage,
  getCategoryById,
} from "@/constants/productCategories";
import {
  AppTheme,
  spacing,
  typography,
  shadows,
  borderRadius,
} from "@/constants/theme";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    image_url?: string;
    description?: string;
    brand?: string;
    store?: string;
  };
  onPress?: () => void;
  showCategory?: boolean;
  showBrand?: boolean;
  showStore?: boolean;
  size?: "small" | "medium" | "large";
}

export function ProductCard({
  product,
  onPress,
  showCategory = true,
  showBrand = true,
  showStore = true,
  size = "medium",
}: ProductCardProps) {
  const theme = useTheme<AppTheme>();
  const category = getCategoryById(product.category);

  const cardStyles = {
    small: { width: 150, height: 200 },
    medium: { width: 200, height: 280 },
    large: { width: 250, height: 350 },
  };

  const imageSize = {
    small: "small" as const,
    medium: "medium" as const,
    large: "large" as const,
  };

  const textSize = {
    small: { fontSize: 12, lineHeight: 16 },
    medium: { fontSize: 14, lineHeight: 20 },
    large: { fontSize: 24, lineHeight: 32 },
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.container,
        cardStyles[size],
        { backgroundColor: theme.colors.surface },
        shadows.md,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card.Cover
        source={{
          uri: product.image_url || getCategoryImage(product.category),
        }}
        style={[styles.image, { height: cardStyles[size].width * 0.6 }]}
        resizeMode="cover"
      />

      <Card.Content style={styles.content}>
        <Text
          variant="titleSmall"
          style={[
            styles.productName,
            textSize[size],
            { color: theme.colors.onSurface },
          ]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <Text
          variant="titleMedium"
          style={[styles.price, { color: theme.colors.primary }]}
        >
          ${product.price.toFixed(2)}
        </Text>

        {showCategory && category && (
          <Chip
            icon={() => (
              <MaterialIcons
                name={category.icon as any}
                size={16}
                color={theme.colors.onPrimary}
              />
            )}
            style={[styles.categoryChip, { backgroundColor: category.color }]}
            textStyle={{ color: theme.colors.onPrimary }}
          >
            {category.name}
          </Chip>
        )}

        {showBrand && product.brand && (
          <Text
            variant="bodySmall"
            style={[styles.brand, { color: theme.colors.onSurfaceVariant }]}
          >
            {product.brand}
          </Text>
        )}

        {showStore && product.store && (
          <Text
            variant="bodySmall"
            style={[styles.store, { color: theme.colors.onSurfaceVariant }]}
          >
            {product.store}
          </Text>
        )}

        {product.description && (
          <Text
            variant="bodySmall"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
            numberOfLines={2}
          >
            {product.description}
          </Text>
        )}
      </Card.Content>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  image: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  content: {
    padding: spacing.sm,
    flex: 1,
  },
  productName: {
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  price: {
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  categoryChip: {
    alignSelf: "flex-start",
    marginBottom: spacing.xs,
  },
  brand: {
    marginBottom: spacing.xs,
  },
  store: {
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 16,
  },
});
