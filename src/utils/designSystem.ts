import { StyleSheet } from "react-native";
import { AppTheme } from "@/constants/theme";
import {
  spacing,
  borderRadius,
  shadows,
  typography,
  animation,
  components,
} from "@/constants/theme";

/**
 * Design System Utilities
 *
 * Inspired by:
 * - Dieter Rams: Systematic approach to design
 * - Jony Ive: Attention to materials and light
 * - Michael Beirut: Editorial clarity and hierarchy
 * - Benji Taylor: Modern minimalism
 * - Mariana Castilho: Refined micro-interactions
 * - Rauno Freiberg: Clear visual language
 * - Jason Yuan: Contemporary elegance
 * - MDS: Systematic design tokens
 * - Jordan Singer: Functional beauty
 * - Emil Kowalski: Typography foundation
 */

// Theme-aware color utilities
export const getColor = (
  theme: AppTheme,
  colorKey: keyof AppTheme["colors"]
) => {
  return theme.colors[colorKey];
};

// Typography utilities with theme integration
export const getTypographyStyle = (variant: keyof typeof typography) => {
  return typography[variant];
};

// Spacing utilities for consistent layouts
export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size];
};

// Border radius utilities
export const getBorderRadius = (size: keyof typeof borderRadius) => {
  return borderRadius[size];
};

// Shadow utilities with theme awareness
export const getShadow = (variant: keyof typeof shadows) => {
  return shadows[variant];
};

// Component style generators
export const createCardStyle = (
  theme: AppTheme,
  variant: "default" | "elevated" | "flat" = "default"
) => {
  const baseStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  };

  switch (variant) {
    case "elevated":
      return {
        ...baseStyle,
        ...shadows.card,
      };
    case "flat":
      return {
        ...baseStyle,
        ...shadows.none,
      };
    default:
      return {
        ...baseStyle,
        ...shadows.sm,
      };
  }
};

export const createButtonStyle = (
  theme: AppTheme,
  variant: "primary" | "secondary" | "outline" | "ghost" = "primary",
  size: "small" | "medium" | "large" = "medium"
) => {
  const sizeStyles = {
    small: {
      height: 36,
      paddingHorizontal: spacing.md,
      ...typography.label2,
    },
    medium: {
      height: 48,
      paddingHorizontal: spacing.lg,
      ...typography.label1,
    },
    large: {
      height: 56,
      paddingHorizontal: spacing.xl,
      ...typography.title3,
    },
  };

  const baseStyle = {
    borderRadius: borderRadius.sm,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...sizeStyles[size],
  };

  switch (variant) {
    case "secondary":
      return {
        ...baseStyle,
        backgroundColor: theme.colors.secondary,
      };
    case "outline":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.colors.primary,
      };
    case "ghost":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary,
      };
  }
};

export const createInputStyle = (
  theme: AppTheme,
  variant: "default" | "outlined" | "filled" = "default"
) => {
  const baseStyle = {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    ...typography.body1,
  };

  switch (variant) {
    case "outlined":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.colors.onSurfaceVariant,
      };
    case "filled":
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surfaceVariant,
        borderWidth: 0,
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.onSurfaceVariant,
      };
  }
};

// Layout utilities
export const createContainerStyle = (
  theme: AppTheme,
  padding: keyof typeof spacing = "lg",
  backgroundColor?: keyof AppTheme["colors"]
) => {
  return {
    flex: 1,
    padding: spacing[padding],
    backgroundColor: backgroundColor
      ? theme.colors[backgroundColor]
      : theme.colors.background,
  };
};

export const createSectionStyle = (
  theme: AppTheme,
  marginBottom: keyof typeof spacing = "xxl"
) => {
  return {
    marginBottom: spacing[marginBottom],
  };
};

// Animation utilities
export const createAnimationStyle = (
  type: keyof typeof animation.presets,
  duration?: keyof typeof animation.duration
) => {
  const preset = animation.presets[type];
  const animationDuration = duration
    ? animation.duration[duration]
    : preset.duration;

  return {
    ...preset,
    duration: animationDuration,
  };
};

// Responsive utilities
export const createResponsiveStyle = (
  breakpoint: keyof typeof import("@/constants/theme").layout.breakpoints,
  style: any
) => {
  // This would integrate with a responsive system
  // For now, return the style as-is
  return style;
};

// Accessibility utilities
export const createAccessibleStyle = (
  theme: AppTheme,
  isHighContrast: boolean = false
) => {
  const baseStyle = {
    minHeight: 44, // Minimum touch target
  };

  if (isHighContrast) {
    return {
      ...baseStyle,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    };
  }

  return baseStyle;
};

// Text color utilities
export const getTextColor = (
  theme: AppTheme,
  variant: "primary" | "secondary" | "body" | "caption" | "disabled" = "body"
) => {
  switch (variant) {
    case "primary":
      return theme.colors.primary;
    case "secondary":
      return theme.colors.secondary;
    case "caption":
      return theme.colors.onSurfaceVariant;
    case "disabled":
      return theme.colors.neutral?.[400] || theme.colors.onSurfaceVariant;
    default:
      return theme.colors.onSurface;
  }
};

// Semantic color utilities
export const getSemanticColor = (
  theme: AppTheme,
  semantic: "success" | "error" | "warning" | "info"
) => {
  switch (semantic) {
    case "success":
      return theme.colors.positive;
    case "error":
      return theme.colors.error;
    case "warning":
      return theme.colors.warning;
    case "info":
      return theme.colors.info;
  }
};

// Style composition utilities
export const composeStyles = (...styles: any[]) => {
  return StyleSheet.flatten(styles.filter(Boolean));
};

// Theme-aware style composition
export const createThemedStyle = (
  theme: AppTheme,
  baseStyle: any,
  themeOverrides?: Partial<AppTheme["colors"]>
) => {
  return {
    ...baseStyle,
    ...themeOverrides,
  };
};

// Design system validation utilities
export const validateDesignToken = (
  token: any,
  allowedValues: any[]
): boolean => {
  return allowedValues.includes(token);
};

// Export commonly used style combinations
export const commonStyles = {
  // Card styles
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },

  // Button styles
  button: {
    height: 48,
    borderRadius: borderRadius.sm,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Input styles
  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    fontSize: 16,
  },

  // Text styles
  text: {
    ...typography.body1,
  },

  // Layout styles
  container: {
    flex: 1,
    padding: spacing.lg,
  },

  // Section styles
  section: {
    marginBottom: spacing.xxl,
  },

  // Row styles
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },

  // Column styles
  column: {
    flexDirection: "column" as const,
  },

  // Center styles
  center: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  // Space between styles
  spaceBetween: {
    justifyContent: "space-between" as const,
  },

  // Gap styles
  gap: {
    gap: spacing.md,
  },

  // Gap small styles
  gapSmall: {
    gap: spacing.sm,
  },

  // Gap large styles
  gapLarge: {
    gap: spacing.lg,
  },
};

// Export the design tokens for direct access
export { spacing, borderRadius, shadows, typography, animation, components };
