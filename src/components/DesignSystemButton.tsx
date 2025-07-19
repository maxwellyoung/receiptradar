import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import {
  createButtonStyle,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "@/utils/designSystem";

interface DesignSystemButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  fullWidth?: boolean;
}

export function DesignSystemButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
}: DesignSystemButtonProps) {
  const theme = useTheme<AppTheme>();

  const buttonStyle = createButtonStyle(theme, variant, size);

  // Determine text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.onSecondary;
      default:
        return theme.colors.onPrimary;
    }
  };

  return (
    <Pressable
      style={[
        buttonStyle,
        fullWidth && { width: "100%" },
        disabled && { opacity: 0.5 },
        // Add subtle shadow for depth
        variant !== "ghost" && shadows.sm,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[typography.label1, { color: getTextColor() }]}>
        {title}
      </Text>
    </Pressable>
  );
}

// Example usage component
export function ButtonExamples() {
  const theme = useTheme<AppTheme>();

  return (
    <div style={{ padding: spacing.lg, gap: spacing.md }}>
      <DesignSystemButton
        title="Primary Button"
        onPress={() => console.log("Primary pressed")}
        variant="primary"
      />

      <DesignSystemButton
        title="Secondary Button"
        onPress={() => console.log("Secondary pressed")}
        variant="secondary"
      />

      <DesignSystemButton
        title="Outline Button"
        onPress={() => console.log("Outline pressed")}
        variant="outline"
      />

      <DesignSystemButton
        title="Ghost Button"
        onPress={() => console.log("Ghost pressed")}
        variant="ghost"
      />

      <DesignSystemButton
        title="Small Button"
        onPress={() => console.log("Small pressed")}
        size="small"
      />

      <DesignSystemButton
        title="Large Button"
        onPress={() => console.log("Large pressed")}
        size="large"
      />

      <DesignSystemButton
        title="Disabled Button"
        onPress={() => console.log("Disabled pressed")}
        disabled={true}
      />

      <DesignSystemButton
        title="Full Width Button"
        onPress={() => console.log("Full width pressed")}
        fullWidth={true}
      />
    </div>
  );
}
