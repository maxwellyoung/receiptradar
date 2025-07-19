import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { DesignSystemShowcase } from "@/components/DesignSystemShowcase";
import {
  DesignSystemButton,
  ButtonExamples,
} from "@/components/DesignSystemButton";
import { DesignSystemCard, CardExamples } from "@/components/DesignSystemCard";
import { spacing, typography, shadows, borderRadius } from "@/constants/theme";
import { createContainerStyle, commonStyles } from "@/utils/designSystem";

export default function DesignSystemDemoScreen() {
  const theme = useTheme<AppTheme>();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <View
                style={[
                  styles.titleBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: theme.colors.onPrimary },
                  ]}
                />
              </View>
              <View style={styles.titleText}>
                <View style={styles.titleRow}>
                  <View style={styles.titleLine} />
                  <View style={styles.titleLine} />
                </View>
              </View>
            </View>

            <View style={styles.headerText}>
              <View style={styles.titlePlaceholder} />
              <View style={styles.subtitlePlaceholder} />
            </View>
          </View>
        </View>

        {/* Design System Showcase */}
        <View style={styles.section}>
          <DesignSystemShowcase title="ReceiptRadar Design System" />
        </View>

        {/* Button Examples */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitlePlaceholder} />
            <View style={styles.sectionSubtitlePlaceholder} />
          </View>
          <ButtonExamples />
        </View>

        {/* Card Examples */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitlePlaceholder} />
            <View style={styles.sectionSubtitlePlaceholder} />
          </View>
          <CardExamples />
        </View>

        {/* Color Palette */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitlePlaceholder} />
            <View style={styles.sectionSubtitlePlaceholder} />
          </View>
          <View style={styles.colorPalette}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.secondary },
              ]}
            />
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.positive },
              ]}
            />
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.error },
              ]}
            />
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.warning },
              ]}
            />
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.info },
              ]}
            />
          </View>
        </View>

        {/* Typography Scale */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitlePlaceholder} />
            <View style={styles.sectionSubtitlePlaceholder} />
          </View>
          <View style={styles.typographyScale}>
            <View style={styles.typographyItem}>
              <View style={styles.typographyLine} />
              <View style={styles.typographyLabel} />
            </View>
            <View style={styles.typographyItem}>
              <View style={styles.typographyLine} />
              <View style={styles.typographyLabel} />
            </View>
            <View style={styles.typographyItem}>
              <View style={styles.typographyLine} />
              <View style={styles.typographyLabel} />
            </View>
            <View style={styles.typographyItem}>
              <View style={styles.typographyLine} />
              <View style={styles.typographyLabel} />
            </View>
          </View>
        </View>

        {/* Spacing Scale */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitlePlaceholder} />
            <View style={styles.sectionSubtitlePlaceholder} />
          </View>
          <View style={styles.spacingScale}>
            <View style={[styles.spacingItem, { height: 8 }]} />
            <View style={[styles.spacingItem, { height: 16 }]} />
            <View style={[styles.spacingItem, { height: 24 }]} />
            <View style={[styles.spacingItem, { height: 32 }]} />
            <View style={[styles.spacingItem, { height: 48 }]} />
          </View>
        </View>

        {/* Interactive Elements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitlePlaceholder} />
            <View style={styles.sectionSubtitlePlaceholder} />
          </View>
          <View style={styles.interactiveElements}>
            <DesignSystemButton
              title="Primary Action"
              onPress={() => console.log("Primary action")}
              variant="primary"
              fullWidth
            />
            <DesignSystemButton
              title="Secondary Action"
              onPress={() => console.log("Secondary action")}
              variant="secondary"
              fullWidth
            />
            <DesignSystemCard
              title="Interactive Card"
              subtitle="Tap to see the design system in action"
              content="This card demonstrates the complete design system with proper typography, spacing, and color usage."
              onPress={() => console.log("Card interaction")}
              variant="elevated"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLine} />
            <View style={styles.footerText} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  titleBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  titleText: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  titleLine: {
    width: 20,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.xs,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  titlePlaceholder: {
    width: "80%",
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.xs,
  },
  subtitlePlaceholder: {
    width: "60%",
    height: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.xs,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  sectionTitlePlaceholder: {
    width: "40%",
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.xs,
  },
  sectionSubtitlePlaceholder: {
    width: "60%",
    height: 14,
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.xs,
  },
  colorPalette: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  typographyScale: {
    gap: spacing.md,
  },
  typographyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  typographyLine: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.xs,
  },
  typographyLabel: {
    width: 40,
    height: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.xs,
  },
  spacingScale: {
    gap: spacing.sm,
  },
  spacingItem: {
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.xs,
    width: "100%",
  },
  interactiveElements: {
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
  },
  footerContent: {
    alignItems: "center",
    gap: spacing.sm,
  },
  footerLine: {
    width: "30%",
    height: 2,
    backgroundColor: "#E0E0E0",
    borderRadius: borderRadius.xs,
  },
  footerText: {
    width: "50%",
    height: 14,
    backgroundColor: "#F0F0F0",
    borderRadius: borderRadius.xs,
  },
});
