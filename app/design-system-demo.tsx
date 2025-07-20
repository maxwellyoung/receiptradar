import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { AppTheme, spacing, typography } from "@/constants/theme";
import { HolisticDesignSystemShowcase } from "@/components/HolisticDesignSystem";
import { ImageDemo } from "@/components/ImageDemo";
import { SimpleImageTest } from "@/components/SimpleImageTest";
import { OfficialLogoDemo } from "@/components/OfficialLogoDemo";

export default function DesignSystemDemo() {
  const theme = useTheme<AppTheme>();

  return (
    <ScrollView style={styles.container}>
      <Text
        variant="headlineLarge"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        🎨 Design System Demo
      </Text>

      <Text
        variant="bodyLarge"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Showcasing ReceiptRadar's comprehensive design system and image
        components
      </Text>

      {/* Simple Image Test */}
      <SimpleImageTest />

      {/* Official Store Logos */}
      <OfficialLogoDemo />

      {/* Image Demo Section */}
      <ImageDemo />

      {/* Original Design System */}
      <HolisticDesignSystemShowcase />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
    ...typography.headline1,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
    ...typography.body1,
  },
});
