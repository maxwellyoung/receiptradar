import React, { useState } from "react";
import { View, Image, StyleSheet, Alert } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { AppTheme, spacing, borderRadius } from "@/constants/theme";

export function SimpleImageTest() {
  const theme = useTheme<AppTheme>();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const testImageUrl =
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop";

  const handleImageLoad = () => {
    console.log("✅ Image loaded successfully!");
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.log("❌ Image failed to load");
    setImageError(true);
    setImageLoaded(false);
  };

  const testNetwork = () => {
    Alert.alert("Network Test", `Testing image loading from: ${testImageUrl}`, [
      { text: "OK", onPress: () => console.log("Network test initiated") },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text
        variant="titleLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        🧪 Simple Image Test
      </Text>

      <Button mode="contained" onPress={testNetwork} style={styles.testButton}>
        Test Network Connection
      </Button>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: testImageUrl }}
          style={styles.testImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {imageLoaded && (
          <Text style={[styles.statusText, { color: theme.colors.primary }]}>
            ✅ Image loaded successfully!
          </Text>
        )}

        {imageError && (
          <Text style={[styles.statusText, { color: theme.colors.error }]}>
            ❌ Image failed to load
          </Text>
        )}

        {!imageLoaded && !imageError && (
          <Text
            style={[
              styles.statusText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Loading image...
          </Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
        >
          This tests basic image loading from Unsplash.
        </Text>
        <Text
          style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
        >
          If this works, the issue is with our image URLs or components.
        </Text>
        <Text
          style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
        >
          If this fails, it's a network or device issue.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  testButton: {
    marginBottom: spacing.lg,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  testImage: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  statusText: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
  infoContainer: {
    alignItems: "center",
  },
  infoText: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
});
