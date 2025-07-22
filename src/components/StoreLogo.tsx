import React, { useState } from "react";
import { View, Image, StyleSheet, ActivityIndicator, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { getStoreImage } from "@/constants/storeImages";
import { AppTheme, spacing, borderRadius } from "@/constants/theme";
import { logger } from "@/utils/logger";
import { OfficialStoreLogo } from "./OfficialStoreLogo";

interface StoreLogoProps {
  storeName: string;
  size?: "small" | "medium" | "large";
  style?: any;
  showFallback?: boolean;
  variant?: "logo" | "icon";
}

const SIZES = {
  small: { width: 32, height: 32 },
  medium: { width: 48, height: 48 },
  large: { width: 64, height: 64 },
};

export function StoreLogo({
  storeName,
  size = "medium",
  style,
  showFallback = true,
  variant = "icon",
}: StoreLogoProps) {
  const theme = useTheme<AppTheme>();
  const dimensions = SIZES[size];
  const sizeValue = dimensions.width;

  // Check if we have an official logo for this store
  const lowerName = storeName.toLowerCase();
  const isUnknownStore = lowerName === "unknown store";
  const hasOfficialLogo =
    lowerName.includes("countdown") ||
    lowerName.includes("pak'n'save") ||
    lowerName.includes("paknsave") ||
    lowerName.includes("pak n save") ||
    lowerName.includes("pak'nsave") ||
    lowerName.includes("new world") ||
    lowerName.includes("warehouse") ||
    lowerName.includes("fresh choice");

  if (isUnknownStore) {
    return (
      <View style={[styles.fallbackContainer, dimensions, style]}>
        <MaterialIcons
          name="store"
          size={dimensions.width * 0.5}
          color={theme.colors.onSurfaceVariant}
        />
        <View style={{ marginTop: 4 }}>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
            Store not recognized
          </Text>
        </View>
      </View>
    );
  }

  // Use official logo if available
  if (hasOfficialLogo) {
    return (
      <View style={[styles.officialLogoContainer, dimensions, style]}>
        <OfficialStoreLogo
          storeName={storeName}
          size={sizeValue}
          showFallback={showFallback}
        />
      </View>
    );
  }

  // Fallback to original image-based approach for other stores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Double-check that we're not trying to load images for stores with official logos
  if (hasOfficialLogo) {
    return (
      <View style={[styles.officialLogoContainer, dimensions, style]}>
        <OfficialStoreLogo
          storeName={storeName}
          size={sizeValue}
          showFallback={showFallback}
        />
      </View>
    );
  }

  const storeConfig = getStoreImage(storeName);
  const imageUrl = variant === "logo" ? storeConfig.logo : storeConfig.icon;

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    logger.error(`StoreLogo image load error for: ${storeName}`, undefined, {
      component: "StoreLogo",
      storeName,
      imageUrl,
      variant,
      hasOfficialLogo,
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
          { backgroundColor: storeConfig.backgroundColor },
          style,
        ]}
      >
        <MaterialIcons
          name="store"
          size={dimensions.width * 0.5}
          color={storeConfig.color}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        dimensions,
        { backgroundColor: storeConfig.backgroundColor },
        style,
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, dimensions]}
        resizeMode="contain"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {loading && (
        <View style={[styles.loadingOverlay, dimensions]}>
          <ActivityIndicator size="small" color={storeConfig.color} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  officialLogoContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  container: {
    position: "relative",
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    borderRadius: borderRadius.md,
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
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
});
