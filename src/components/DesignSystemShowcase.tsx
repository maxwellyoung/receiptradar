import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import {
  spacing,
  borderRadius,
  shadows,
  typography,
  animation,
  components,
} from "@/constants/theme";

interface DesignSystemShowcaseProps {
  title?: string;
}

export function DesignSystemShowcase({
  title = "Design System Showcase",
}: DesignSystemShowcaseProps) {
  const theme = useTheme<AppTheme>();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Hero Section - Inspired by Beirut's editorial hierarchy */}
      <View style={styles.hero}>
        <Text style={[typography.display3, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text
          style={[
            typography.body1,
            { color: theme.colors.onSurfaceVariant, marginTop: spacing.md },
          ]}
        >
          A comprehensive design system inspired by legendary designers
        </Text>
      </View>

      {/* Typography Section - Inspired by Kowalski's typography foundation */}
      <View style={styles.section}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.lg },
          ]}
        >
          Typography
        </Text>

        <View style={styles.typographyGrid}>
          <View style={styles.typographyItem}>
            <Text
              style={[typography.display1, { color: theme.colors.primary }]}
            >
              Display 1
            </Text>
            <Text
              style={[
                typography.caption1,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              72px • Extra Light • -3 letter-spacing
            </Text>
          </View>

          <View style={styles.typographyItem}>
            <Text
              style={[typography.headline1, { color: theme.colors.onSurface }]}
            >
              Headline 1
            </Text>
            <Text
              style={[
                typography.caption1,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              36px • Light • -1 letter-spacing
            </Text>
          </View>

          <View style={styles.typographyItem}>
            <Text
              style={[typography.title1, { color: theme.colors.onSurface }]}
            >
              Title 1
            </Text>
            <Text
              style={[
                typography.caption1,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              24px • Regular • 0 letter-spacing
            </Text>
          </View>

          <View style={styles.typographyItem}>
            <Text style={[typography.body1, { color: theme.colors.onSurface }]}>
              Body 1
            </Text>
            <Text
              style={[
                typography.caption1,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              16px • Regular • 0.15 letter-spacing
            </Text>
          </View>
        </View>
      </View>

      {/* Color System Section - Inspired by Rams' functional approach */}
      <View style={styles.section}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.lg },
          ]}
        >
          Color System
        </Text>

        <View style={styles.colorGrid}>
          <View style={styles.colorItem}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <Text
              style={[typography.label1, { color: theme.colors.onSurface }]}
            >
              Primary
            </Text>
            <Text
              style={[
                typography.caption2,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {theme.colors.primary}
            </Text>
          </View>

          <View style={styles.colorItem}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.secondary },
              ]}
            />
            <Text
              style={[typography.label1, { color: theme.colors.onSurface }]}
            >
              Secondary
            </Text>
            <Text
              style={[
                typography.caption2,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {theme.colors.secondary}
            </Text>
          </View>

          <View style={styles.colorItem}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.positive },
              ]}
            />
            <Text
              style={[typography.label1, { color: theme.colors.onSurface }]}
            >
              Positive
            </Text>
            <Text
              style={[
                typography.caption2,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {theme.colors.positive}
            </Text>
          </View>

          <View style={styles.colorItem}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.error },
              ]}
            />
            <Text
              style={[typography.label1, { color: theme.colors.onSurface }]}
            >
              Error
            </Text>
            <Text
              style={[
                typography.caption2,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {theme.colors.error}
            </Text>
          </View>
        </View>
      </View>

      {/* Spacing Section - Inspired by systematic design */}
      <View style={styles.section}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.lg },
          ]}
        >
          Spacing System
        </Text>

        <View style={styles.spacingGrid}>
          {Object.entries(spacing).map(([key, value]) => (
            <View key={key} style={styles.spacingItem}>
              <View
                style={[styles.spacingVisual, { width: value, height: value }]}
              />
              <Text
                style={[typography.label2, { color: theme.colors.onSurface }]}
              >
                {key}
              </Text>
              <Text
                style={[
                  typography.caption2,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {value}px
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Component Examples - Inspired by functional beauty */}
      <View style={styles.section}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.lg },
          ]}
        >
          Component Examples
        </Text>

        {/* Card Example */}
        <Card
          style={[
            styles.exampleCard,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: borderRadius.md,
              ...shadows.card,
            },
          ]}
        >
          <Card.Content style={{ padding: spacing.md }}>
            <Text
              style={[
                typography.title2,
                { color: theme.colors.onSurface, marginBottom: spacing.sm },
              ]}
            >
              Example Card
            </Text>
            <Text
              style={[
                typography.body2,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              This card demonstrates the design system's card styling with
              proper spacing, typography, and shadows.
            </Text>
          </Card.Content>
        </Card>

        {/* Button Examples */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.lg,
              },
            ]}
          >
            <Text
              style={[typography.label1, { color: theme.colors.onPrimary }]}
            >
              Primary
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.secondary,
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.lg,
              },
            ]}
          >
            <Text
              style={[typography.label1, { color: theme.colors.onSecondary }]}
            >
              Secondary
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Border Radius Section - Inspired by Ive's attention to detail */}
      <View style={styles.section}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.lg },
          ]}
        >
          Border Radius
        </Text>

        <View style={styles.borderRadiusGrid}>
          {Object.entries(borderRadius).map(([key, value]) => (
            <View key={key} style={styles.borderRadiusItem}>
              <View
                style={[
                  styles.borderRadiusVisual,
                  {
                    borderRadius: value,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <Text
                style={[typography.label2, { color: theme.colors.onSurface }]}
              >
                {key}
              </Text>
              <Text
                style={[
                  typography.caption2,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {value}px
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Shadow Examples - Inspired by material sensitivity */}
      <View style={styles.section}>
        <Text
          style={[
            typography.headline2,
            { color: theme.colors.onSurface, marginBottom: spacing.lg },
          ]}
        >
          Shadow System
        </Text>

        <View style={styles.shadowGrid}>
          {Object.entries(shadows)
            .slice(0, 6)
            .map(([key, shadow]) => (
              <View key={key} style={styles.shadowItem}>
                <View
                  style={[
                    styles.shadowVisual,
                    {
                      backgroundColor: theme.colors.surface,
                      borderRadius: borderRadius.md,
                      ...shadow,
                    },
                  ]}
                />
                <Text
                  style={[typography.label2, { color: theme.colors.onSurface }]}
                >
                  {key}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  hero: {
    marginBottom: spacing.xxl,
    alignItems: "center",
    textAlign: "center",
  },
  section: {
    marginBottom: spacing.xxl,
  },
  typographyGrid: {
    gap: spacing.lg,
  },
  typographyItem: {
    gap: spacing.xs,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  colorItem: {
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 80,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  spacingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  spacingItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  spacingVisual: {
    backgroundColor: "#007AFF",
    borderRadius: borderRadius.xs,
  },
  exampleCard: {
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  borderRadiusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  borderRadiusItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  borderRadiusVisual: {
    width: 60,
    height: 60,
  },
  shadowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  shadowItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  shadowVisual: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
