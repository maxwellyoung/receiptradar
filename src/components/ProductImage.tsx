import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { getProductImage } from "@/services/ProductImageService";
import { AppTheme, spacing, borderRadius } from "@/constants/theme";
import { logger } from "@/utils/logger";

interface ProductImageProps {
  productName: string;
  size?: "small" | "medium" | "large";
  style?: any;
  showFallback?: boolean;
}

const SIZES = {
  small: { width: 40, height: 40 },
  medium: { width: 80, height: 80 },
  large: { width: 120, height: 120 },
};

export function ProductImage({
  productName,
  size = "medium",
  style,
  showFallback = true,
}: ProductImageProps) {
  const theme = useTheme<AppTheme>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const dimensions = SIZES[size];

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const url = await getProductImage(productName, size);

        if (mounted) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          logger.error(`ProductImage error for: ${productName}`, undefined, {
            component: "ProductImage",
            productName,
            error,
          });
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [productName, size]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    logger.error(`ProductImage load error for: ${productName}`, undefined, {
      component: "ProductImage",
      productName,
      imageUrl,
    });
    setLoading(false);
    setError(true);
  };

  if (error && showFallback) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          dimensions,
          { backgroundColor: theme.colors.surfaceVariant },
          style,
        ]}
      >
        <MaterialIcons
          name="shopping-basket"
          size={dimensions.width * 0.4}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    );
  }

  if (!imageUrl) {
    return (
      <View
        style={[
          styles.loadingContainer,
          dimensions,
          { backgroundColor: theme.colors.surfaceVariant },
          style,
        ]}
      >
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, dimensions, style]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, dimensions]}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {loading && (
        <View style={[styles.loadingOverlay, dimensions]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  image: {
    borderRadius: borderRadius.sm,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.sm,
  },
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.sm,
  },
});
