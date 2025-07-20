/**
 * Holistic Design System
 *
 * A comprehensive design system that embodies the philosophies of legendary designers:
 *
 * • Jony Ive: "Design is not just what it looks like and feels like. Design is how it works."
 *   - Attention to materials and light
 *   - Functional beauty in every interaction
 *   - Seamless integration of form and function
 *
 * • Dieter Rams: "Less, but better" - functional, honest, long-lasting
 *   - Systematic approach to design
 *   - Honest use of materials
 *   - Long-lasting design solutions
 *
 * • Michael Beirut: Editorial clarity and purposeful hierarchy
 *   - Clear information hierarchy
 *   - Purposeful typography choices
 *   - Editorial thinking in digital spaces
 *
 * • Benji Taylor: Modern minimalism with thoughtful details
 *   - Clean, uncluttered interfaces
 *   - Thoughtful micro-interactions
 *   - Refined visual language
 *
 * • Mariana Castilho: Refined micro-interactions and human touch
 *   - Human-centered interactions
 *   - Subtle animations that serve purpose
 *   - Emotional connection through design
 *
 * • Rauno Freiberg: Systematic design with clear visual language
 *   - Consistent design patterns
 *   - Clear visual hierarchy
 *   - Systematic approach to components
 *
 * • Jason Yuan: Contemporary elegance through simplicity
 *   - Modern, clean aesthetics
 *   - Elegant simplicity
 *   - Contemporary design language
 *
 * • MDS (Material Design System): Systematic approach with accessibility at core
 *   - Accessibility-first design
 *   - Systematic component library
 *   - Inclusive design principles
 *
 * • Jordan Singer: Functional beauty in every interaction
 *   - Beautiful interactions that serve function
 *   - Thoughtful user experience
 *   - Elegant problem-solving
 *
 * • Emil Kowalski: Typography as the foundation of design
 *   - Typography-driven design
 *   - Clear reading hierarchy
 *   - Text as the primary design element
 */

import { Platform } from "react-native";

// ============================================================================
// CORE DESIGN PRINCIPLES
// ============================================================================

export const designPrinciples = {
  // Inspired by Dieter Rams' 10 principles
  functional: "Every element serves a clear purpose",
  honest: "Design reveals the true nature of the product",
  longLasting: "Design transcends trends and time",
  thorough: "No detail is too small to consider",
  environmentallyFriendly: "Design respects the environment",
  minimal: "Less, but better",

  // Inspired by Jony Ive's material sensitivity
  materialAware: "Design responds to the nature of materials",
  lightResponsive: "Design considers how light interacts",
  seamless: "Technology disappears into the experience",

  // Inspired by Beirut's editorial thinking
  hierarchical: "Clear information hierarchy guides users",
  purposeful: "Every design choice serves the content",
  editorial: "Design tells a story",

  // Inspired by human-centered design
  accessible: "Design works for everyone",
  inclusive: "Design considers diverse users",
  empathetic: "Design understands user needs",
};

// ============================================================================
// ENHANCED TYPOGRAPHY SYSTEM (Emil Kowalski + Michael Beirut)
// ============================================================================

export const typography = {
  // Display styles - Hero content (Beirut's editorial hierarchy)
  display: {
    large: {
      fontSize: 72,
      fontWeight: "200" as const,
      letterSpacing: -3,
      lineHeight: 80,
      fontFamily: Platform.OS === "ios" ? "Inter_200ExtraLight" : "Inter",
    },
    medium: {
      fontSize: 56,
      fontWeight: "200" as const,
      letterSpacing: -2,
      lineHeight: 64,
      fontFamily: Platform.OS === "ios" ? "Inter_200ExtraLight" : "Inter",
    },
    small: {
      fontSize: 48,
      fontWeight: "200" as const,
      letterSpacing: -1.5,
      lineHeight: 56,
      fontFamily: Platform.OS === "ios" ? "Inter_200ExtraLight" : "Inter",
    },
  },

  // Headline styles - Section titles (Kowalski's hierarchy)
  headline: {
    large: {
      fontSize: 36,
      fontWeight: "300" as const,
      letterSpacing: -1,
      lineHeight: 44,
      fontFamily: Platform.OS === "ios" ? "Inter_300Light" : "Inter",
    },
    medium: {
      fontSize: 32,
      fontWeight: "300" as const,
      letterSpacing: -0.5,
      lineHeight: 40,
      fontFamily: Platform.OS === "ios" ? "Inter_300Light" : "Inter",
    },
    small: {
      fontSize: 28,
      fontWeight: "300" as const,
      letterSpacing: -0.25,
      lineHeight: 36,
      fontFamily: Platform.OS === "ios" ? "Inter_300Light" : "Inter",
    },
  },

  // Title styles - Card headers (Systematic design)
  title: {
    large: {
      fontSize: 24,
      fontWeight: "400" as const,
      letterSpacing: 0,
      lineHeight: 32,
      fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : "Inter",
    },
    medium: {
      fontSize: 20,
      fontWeight: "400" as const,
      letterSpacing: 0,
      lineHeight: 28,
      fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : "Inter",
    },
    small: {
      fontSize: 18,
      fontWeight: "500" as const,
      letterSpacing: 0,
      lineHeight: 24,
      fontFamily: Platform.OS === "ios" ? "Inter_500Medium" : "Inter",
    },
  },

  // Body styles - Content (Functional design)
  body: {
    large: {
      fontSize: 16,
      fontWeight: "400" as const,
      letterSpacing: 0.15,
      lineHeight: 24,
      fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : "Inter",
    },
    medium: {
      fontSize: 14,
      fontWeight: "400" as const,
      letterSpacing: 0.25,
      lineHeight: 20,
      fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : "Inter",
    },
    small: {
      fontSize: 12,
      fontWeight: "400" as const,
      letterSpacing: 0.4,
      lineHeight: 16,
      fontFamily: Platform.OS === "ios" ? "Inter_400Regular" : "Inter",
    },
  },

  // Label styles - UI elements (MDS)
  label: {
    large: {
      fontSize: 14,
      fontWeight: "500" as const,
      letterSpacing: 0.1,
      lineHeight: 20,
      fontFamily: Platform.OS === "ios" ? "Inter_500Medium" : "Inter",
    },
    medium: {
      fontSize: 12,
      fontWeight: "500" as const,
      letterSpacing: 0.5,
      lineHeight: 16,
      fontFamily: Platform.OS === "ios" ? "Inter_500Medium" : "Inter",
    },
    small: {
      fontSize: 11,
      fontWeight: "500" as const,
      letterSpacing: 0.5,
      lineHeight: 14,
      fontFamily: Platform.OS === "ios" ? "Inter_500Medium" : "Inter",
    },
  },

  // Special styles (Editorial design)
  overline: {
    fontSize: 10,
    fontWeight: "500" as const,
    letterSpacing: 2,
    lineHeight: 16,
    textTransform: "uppercase" as const,
    fontFamily: Platform.OS === "ios" ? "Inter_500Medium" : "Inter",
  },
};

// ============================================================================
// COLOR SYSTEM (Dieter Rams + Jony Ive)
// ============================================================================

export const colors = {
  // Core colors - Functional approach (Rams)
  surface: {
    primary: "#FFFFFF",
    secondary: "#FAFAFA",
    tertiary: "#F5F5F5",
    quaternary: "#F0F0F0",
  },

  // Content colors - Editorial hierarchy (Beirut)
  content: {
    primary: "#1A1A1A",
    secondary: "#666666",
    tertiary: "#999999",
    disabled: "#CCCCCC",
  },

  // Brand colors - Material sensitivity (Ive)
  brand: {
    primary: "#007AFF", // Apple-inspired blue
    secondary: "#FF6B35", // Worm color
    accent: "#34C759", // Success green
  },

  // Semantic colors - Systematic approach
  semantic: {
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#5AC8FA",
  },

  // Neutral palette - Refined approach (Kowalski)
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // Dark mode colors
  dark: {
    surface: {
      primary: "#121212",
      secondary: "#1E1E1E",
      tertiary: "#2D2D2D",
      quaternary: "#404040",
    },
    content: {
      primary: "#FFFFFF",
      secondary: "#B0B0B0",
      tertiary: "#8E8E93",
      disabled: "#5A5A5A",
    },
    brand: {
      primary: "#0A84FF",
      secondary: "#FF6B35",
      accent: "#30D158",
    },
  },
};

// ============================================================================
// SPACING SYSTEM (Rauno Freiberg + Systematic Design)
// ============================================================================

export const spacing = {
  // Micro spacing for fine adjustments (Taylor's attention to detail)
  micro: 2,
  tiny: 4,
  small: 8,

  // Base spacing unit (8pt grid system)
  medium: 16,

  // Comfortable spacing
  large: 24,
  xlarge: 32,
  xxlarge: 48,

  // Hero spacing
  xxxlarge: 64,
  xxxxlarge: 96,
};

// ============================================================================
// BORDER RADIUS SYSTEM (Jony Ive + Material Sensitivity)
// ============================================================================

export const borderRadius = {
  // Sharp edges for technical elements (Rams' functional approach)
  none: 0,

  // Subtle rounding (Ive's attention to detail)
  tiny: 2,
  small: 4,
  medium: 8,

  // Comfortable rounding
  large: 12,
  xlarge: 16,
  xxlarge: 24,

  // Circular elements
  full: 9999,
};

// ============================================================================
// SHADOW SYSTEM (Jony Ive + Material Awareness)
// ============================================================================

export const shadows = {
  // No shadow for flat design
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle shadows (Ive's material sensitivity)
  subtle: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },

  // Standard shadows
  small: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  // Special shadows for specific use cases
  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ============================================================================
// ANIMATION SYSTEM (Mariana Castilho + Human Touch)
// ============================================================================

export const animation = {
  // Duration scale (Human-centered timing)
  duration: {
    instant: 100, // Immediate feedback
    fast: 200, // Quick transitions
    normal: 300, // Standard transitions
    slow: 500, // Deliberate animations
    slower: 700, // Complex animations
  },

  // Easing functions (Natural movement)
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",

    // Custom easings for specific interactions
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    smooth: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  },

  // Predefined animations (Castilho's micro-interactions)
  presets: {
    fadeIn: {
      opacity: [0, 1],
      duration: 300,
      easing: "ease-out",
    },

    slideUp: {
      transform: [{ translateY: [20, 0] }],
      opacity: [0, 1],
      duration: 300,
      easing: "ease-out",
    },

    scaleIn: {
      transform: [{ scale: [0.95, 1] }],
      opacity: [0, 1],
      duration: 200,
      easing: "ease-out",
    },

    // Button press animation (Singer's functional beauty)
    buttonPress: {
      transform: [{ scale: [1, 0.98] }],
      duration: 100,
      easing: "ease-out",
    },

    // Card hover animation (Yuan's contemporary elegance)
    cardHover: {
      transform: [{ translateY: [-2, 0] }],
      duration: 200,
      easing: "ease-out",
    },
  },
};

// ============================================================================
// LAYOUT SYSTEM (Systematic Design + Grid)
// ============================================================================

export const layout = {
  // Container constraints
  maxWidth: 1200,
  containerPadding: spacing.large,
  sectionSpacing: spacing.xxlarge,
  cardSpacing: spacing.large,

  // Grid system (Freiberg's systematic approach)
  grid: {
    columns: 12,
    gutter: spacing.medium,
    margin: spacing.large,
  },

  // Breakpoints for responsive design
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },

  // Component spacing
  componentSpacing: {
    compact: spacing.small,
    comfortable: spacing.medium,
    spacious: spacing.large,
  },
};

// ============================================================================
// COMPONENT TOKENS (MDS + Systematic Design)
// ============================================================================

export const components = {
  // Button design (Singer's functional beauty)
  button: {
    height: {
      small: 36,
      medium: 48,
      large: 56,
    },
    paddingHorizontal: {
      small: spacing.medium,
      medium: spacing.large,
      large: spacing.xlarge,
    },
    borderRadius: borderRadius.small,
    fontSize: typography.label.large.fontSize,
    fontWeight: typography.label.large.fontWeight,
  },

  // Card design (Taylor's modern minimalism)
  card: {
    padding: {
      small: spacing.small,
      medium: spacing.medium,
      large: spacing.large,
    },
    borderRadius: borderRadius.medium,
    shadow: shadows.card,
  },

  // Input design (Rams' functional approach)
  input: {
    height: 48,
    paddingHorizontal: spacing.medium,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    fontSize: typography.body.large.fontSize,
  },

  // Navigation design (Clear hierarchy)
  navigation: {
    height: 56,
    paddingHorizontal: spacing.medium,
  },

  // Modal design (Ive's material sensitivity)
  modal: {
    borderRadius: borderRadius.large,
    shadow: shadows.floating,
    padding: spacing.large,
  },
};

// ============================================================================
// ACCESSIBILITY TOKENS (MDS + Inclusive Design)
// ============================================================================

export const accessibility = {
  // Minimum touch targets (Human-centered design)
  minTouchTarget: 44,

  // Focus indicators
  focusRing: {
    width: 2,
    color: colors.brand.primary,
    style: "solid",
  },

  // High contrast mode support
  highContrast: {
    enabled: true,
    threshold: 4.5, // WCAG AA standard
  },

  // Typography scaling
  textScaling: {
    minScale: 0.8,
    maxScale: 2.0,
  },
};

// ============================================================================
// DESIGN TOKENS EXPORT
// ============================================================================

export const designTokens = {
  typography,
  colors,
  spacing,
  borderRadius,
  shadows,
  animation,
  layout,
  components,
  accessibility,
  designPrinciples,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createResponsiveValue = (
  mobile: any,
  tablet?: any,
  desktop?: any
) => {
  return {
    mobile,
    tablet: tablet || mobile,
    desktop: desktop || tablet || mobile,
  };
};

export const createThemedStyle = (
  theme: "light" | "dark",
  baseStyle: any,
  themeOverrides?: Partial<typeof colors>
) => {
  const themeColors = theme === "dark" ? colors.dark : colors;
  return {
    ...baseStyle,
    ...themeOverrides,
  };
};

export const validateDesignToken = (
  token: any,
  allowedValues: any[]
): boolean => {
  return allowedValues.includes(token);
};

// ============================================================================
// DESIGN SYSTEM CONFIGURATION
// ============================================================================

export const designSystemConfig = {
  name: "ReceiptRadar Holistic Design System",
  version: "1.0.0",
  description: "A comprehensive design system inspired by legendary designers",
  principles: designPrinciples,
  tokens: designTokens,
};

export default designTokens;

// ============================================================================
// ENHANCED DESIGN SYSTEM COMPONENTS (Phase 2 Improvements)
// ============================================================================

// Text handling utilities to fix cutoff issues
export const textStyles = {
  // For long text that should truncate
  truncate: {
    numberOfLines: 1,
    ellipsizeMode: "tail" as const,
  },

  // For text that should wrap
  wrap: {
    flexWrap: "wrap" as const,
    flexShrink: 1,
  },

  // For text that should be responsive
  responsive: {
    fontSize: 16,
    lineHeight: 24,
  },

  // For text that needs proper spacing
  spaced: {
    letterSpacing: 0.15,
    lineHeight: 1.5,
  },
};

// Enhanced shadows system with material awareness
export const materialShadows = {
  // Subtle shadows for cards (material-aware)
  subtle: {
    shadowColor: colors.content.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Light shadows for hover states
  light: {
    shadowColor: colors.content.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium shadows for elevated elements
  medium: {
    shadowColor: colors.content.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Strong shadows for modals
  strong: {
    shadowColor: colors.content.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  // No shadow for flat elements
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Interaction system with human touch
export const interactions = {
  // Haptic feedback for all interactions
  haptics: {
    light: "light" as const,
    medium: "medium" as const,
    heavy: "heavy" as const,
  },

  // Smooth press animations
  press: {
    scale: 0.98,
    duration: 100,
    easing: "easeOut" as const,
  },

  // Purposeful transitions
  transitions: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Animation presets
  animations: {
    fadeIn: {
      opacity: [0, 1],
      duration: 300,
    },
    slideUp: {
      transform: [{ translateY: [20, 0] }],
      opacity: [0, 1],
      duration: 300,
    },
    scaleIn: {
      transform: [{ scale: [0.9, 1] }],
      opacity: [0, 1],
      duration: 300,
    },
    buttonPress: {
      transform: [{ scale: [1, 0.98] }],
      duration: 100,
    },
  },
};

// Enhanced component styles for consistency
export const componentStyles = {
  // Dashboard layout styles
  dashboard: {
    header: {
      spacing: spacing.xxlarge,
      typography: typography.headline.large,
    },
    primaryAction: {
      marginBottom: spacing.large,
      fullWidth: true,
    },
    stats: {
      layout: "horizontal",
      spacing: spacing.medium,
      typography: typography.title.medium,
      minimal: true,
    },
    search: {
      marginBottom: spacing.medium,
      variant: "outlined",
    },
  },

  // Receipt card styles
  receiptCard: {
    layout: {
      padding: spacing.medium,
      spacing: spacing.small,
      borderRadius: borderRadius.medium,
    },
    typography: {
      storeName: typography.title.medium,
      date: typography.body.small,
      total: typography.title.large,
      items: typography.body.small,
    },
    elevation: materialShadows.subtle,
    interactions: {
      pressFeedback: true,
      hapticFeedback: interactions.haptics.light,
      animation: interactions.animations.buttonPress,
    },
  },

  // Processing screen styles
  processing: {
    progress: {
      animation: "smooth",
      color: colors.brand.primary,
      thickness: "medium",
      showPercentage: true,
    },
    steps: {
      layout: "vertical",
      spacing: spacing.medium,
      typography: typography.body.medium,
      icons: "material",
    },
    error: {
      icon: "error",
      typography: typography.title.medium,
      action: "retry",
      animation: "shake",
    },
  },
};
