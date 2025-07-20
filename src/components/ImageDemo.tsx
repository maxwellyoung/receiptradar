import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Card, useTheme, Button } from "react-native-paper";
import { StoreLogo } from "./StoreLogo";
import { ProductImage } from "./ProductImage";
import { AppTheme, spacing, typography, borderRadius } from "@/constants/theme";

export function ImageDemo() {
  const theme = useTheme<AppTheme>();
  const [showDebug, setShowDebug] = useState(false);

  const stores = [
    "Countdown",
    "New World",
    "Pak'nSave",
    "Four Square",
    "Moore Wilson's Fresh",
    "The Warehouse",
    "Fresh Choice",
  ];

  const products = [
    "Anchor Blue Milk 2L",
    "Mainland Tasty Cheese 500g",
    "Bananas 1kg",
    "Red Apples 1kg",
    "Beef Mince 500g",
    "Vogel's Bread 700g",
    "San Remo Pasta 500g",
    "Quilton Toilet Paper 12 Pack",
  ];

  const testImageLoading = () => {
    Alert.alert(
      "Image Test",
      "Testing image loading... Check console for errors",
      [{ text: "OK", onPress: () => console.log("Image test completed") }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text
        variant="headlineMedium"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        🏪 Store Logos & Product Images
      </Text>

      <Button
        mode="outlined"
        onPress={() => setShowDebug(!showDebug)}
        style={styles.debugButton}
      >
        {showDebug ? "Hide Debug" : "Show Debug"}
      </Button>

      {showDebug && (
        <Card
          style={[
            styles.debugCard,
            { backgroundColor: theme.colors.errorContainer },
          ]}
        >
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onErrorContainer }}
            >
              🔍 Debug Info
            </Text>
            <Text
              style={{
                color: theme.colors.onErrorContainer,
                marginTop: spacing.sm,
              }}
            >
              • Check if images are loading from URLs{"\n"}• Verify network
              connectivity{"\n"}• Look for console errors{"\n"}• Try the test
              button below
            </Text>
            <Button
              mode="contained"
              onPress={testImageLoading}
              style={{ marginTop: spacing.sm }}
            >
              Test Image Loading
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Store Logos Section */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Store Logos
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginBottom: spacing.md,
            }}
          >
            Professional store logos with fallback icons
          </Text>

          <View style={styles.logoGrid}>
            {stores.map((store, index) => (
              <View key={index} style={styles.logoItem}>
                <StoreLogo
                  storeName={store}
                  size="medium"
                  variant="icon"
                  showFallback={true}
                />
                <Text
                  style={[
                    styles.logoLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {store}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Product Images Section */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Product Images
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginBottom: spacing.md,
            }}
          >
            High-quality product images with smart fallbacks
          </Text>

          <View style={styles.productGrid}>
            {products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <ProductImage
                  productName={product}
                  size="medium"
                  showFallback={true}
                />
                <Text
                  style={[
                    styles.productLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {product}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Simple Test Section */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            🧪 Simple Image Test
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginBottom: spacing.md,
            }}
          >
            Testing basic image loading with a simple URL
          </Text>

          <View style={styles.testContainer}>
            <View
              style={[
                styles.testImage,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.onPrimaryContainer,
                  textAlign: "center",
                }}
              >
                Test Image Placeholder
              </Text>
            </View>
            <Text
              style={[
                styles.testLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              If you see this, basic rendering works
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Features Section */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            ✨ Image Features
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text
                style={[styles.featureIcon, { color: theme.colors.primary }]}
              >
                🎨
              </Text>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Professional Store Logos
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Real store logos with brand colors and fallback icons
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text
                style={[styles.featureIcon, { color: theme.colors.primary }]}
              >
                🖼️
              </Text>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  High-Quality Product Images
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Beautiful product photos from Unsplash with smart
                  categorization
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text
                style={[styles.featureIcon, { color: theme.colors.primary }]}
              >
                ⚡
              </Text>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Loading States & Fallbacks
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Smooth loading animations and graceful error handling
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text
                style={[styles.featureIcon, { color: theme.colors.primary }]}
              >
                🎯
              </Text>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Smart Product Matching
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Intelligent product name matching to find the right images
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text
                style={[styles.featureIcon, { color: theme.colors.primary }]}
              >
                🏪
              </Text>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Complete Store Coverage
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  All major NZ supermarkets: Countdown, New World, Pak'nSave,
                  Four Square, The Warehouse, Fresh Choice, Moore Wilson's
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.lg,
    ...typography.headline1,
  },
  debugButton: {
    marginBottom: spacing.md,
  },
  debugCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  section: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    ...typography.headline3,
  },
  logoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: spacing.md,
  },
  logoItem: {
    alignItems: "center",
    width: 80,
  },
  logoLabel: {
    marginTop: spacing.xs,
    textAlign: "center",
    ...typography.caption1,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: spacing.md,
  },
  productItem: {
    alignItems: "center",
    width: 100,
  },
  productLabel: {
    marginTop: spacing.xs,
    textAlign: "center",
    ...typography.caption1,
  },
  testContainer: {
    alignItems: "center",
    padding: spacing.lg,
  },
  testImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  testLabel: {
    textAlign: "center",
    ...typography.body2,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: spacing.xs,
    ...typography.title3,
  },
  featureDesc: {
    ...typography.body2,
  },
});
