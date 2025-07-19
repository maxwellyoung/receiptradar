import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import {
  createCardStyle,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
} from "@/utils/designSystem";

interface DesignSystemCardProps {
  title?: string;
  subtitle?: string;
  content?: string;
  children?: React.ReactNode;
  variant?: "default" | "elevated" | "flat";
  onPress?: () => void;
  showShadow?: boolean;
  padding?: "small" | "medium" | "large";
}

export function DesignSystemCard({
  title,
  subtitle,
  content,
  children,
  variant = "default",
  onPress,
  showShadow = true,
  padding = "medium",
}: DesignSystemCardProps) {
  const theme = useTheme<AppTheme>();

  const getPadding = () => {
    switch (padding) {
      case "small":
        return spacing.sm;
      case "large":
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  const cardStyle = createCardStyle(theme, variant);
  const containerStyle = {
    ...cardStyle,
    padding: getPadding(),
    ...(showShadow && shadows.card),
  };

  const CardContainer = onPress ? Pressable : View;

  return (
    <CardContainer
      style={[styles.container, containerStyle, onPress && styles.pressable]}
      onPress={onPress}
    >
      {title && (
        <Text
          style={[
            typography.title2,
            {
              color: theme.colors.onSurface,
              marginBottom: subtitle ? spacing.xs : spacing.sm,
            },
          ]}
        >
          {title}
        </Text>
      )}

      {subtitle && (
        <Text
          style={[
            typography.body2,
            {
              color: theme.colors.onSurfaceVariant,
              marginBottom: content || children ? spacing.sm : 0,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {content && (
        <Text style={[typography.body1, { color: theme.colors.onSurface }]}>
          {content}
        </Text>
      )}

      {children}
    </CardContainer>
  );
}

// Example usage components
export function CardExamples() {
  const theme = useTheme<AppTheme>();

  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      {/* Basic Card */}
      <DesignSystemCard
        title="Basic Card"
        subtitle="This is a subtitle"
        content="This is the main content of the card. It demonstrates the typography hierarchy and spacing system."
      />

      {/* Elevated Card */}
      <DesignSystemCard
        title="Elevated Card"
        subtitle="With more visual prominence"
        content="This card uses the elevated variant with enhanced shadows for more visual hierarchy."
        variant="elevated"
      />

      {/* Flat Card */}
      <DesignSystemCard
        title="Flat Card"
        subtitle="Minimal styling"
        content="This card uses the flat variant with no shadows for a more minimal appearance."
        variant="flat"
        showShadow={false}
      />

      {/* Pressable Card */}
      <DesignSystemCard
        title="Pressable Card"
        subtitle="Tap to interact"
        content="This card can be pressed and will respond to touch interactions."
        onPress={() => console.log("Card pressed")}
      />

      {/* Custom Content Card */}
      <DesignSystemCard title="Custom Content" subtitle="With custom children">
        <View
          style={[commonStyles.row, { gap: spacing.sm, marginTop: spacing.sm }]}
        >
          <View
            style={[styles.badge, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[typography.caption1, { color: theme.colors.onPrimary }]}
            >
              Tag 1
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: theme.colors.secondary }]}
          >
            <Text
              style={[typography.caption1, { color: theme.colors.onSecondary }]}
            >
              Tag 2
            </Text>
          </View>
        </View>
      </DesignSystemCard>

      {/* Small Padding Card */}
      <DesignSystemCard
        title="Compact Card"
        subtitle="With small padding"
        content="This card uses small padding for a more compact layout."
        padding="small"
      />

      {/* Large Padding Card */}
      <DesignSystemCard
        title="Spacious Card"
        subtitle="With large padding"
        content="This card uses large padding for a more spacious, comfortable layout."
        padding="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
  },
  pressable: {
    // Add subtle feedback for pressable cards
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
});
