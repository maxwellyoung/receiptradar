import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from "react-native-paper";

// Define the font config using Inter - inspired by modern typography principles
const fontConfig = {
  customVariant: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400" as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  // Ensure default is set for all variants
  default: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400" as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  // Mapping for react-native-paper components
  bodyLarge: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  displayLarge: {
    fontFamily: "Inter_200ExtraLight", // Inspired by Beirut's editorial typography
    fontSize: 57,
    fontWeight: "200" as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: "Inter_300Light",
    fontSize: 45,
    fontWeight: "300" as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 36,
    fontWeight: "400" as const,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: "Inter_300Light",
    fontSize: 32,
    fontWeight: "300" as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: "Inter_400Regular",
    fontSize: 28,
    fontWeight: "400" as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 24,
    fontWeight: "400" as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  labelLarge: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  titleLarge: {
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    fontWeight: "400" as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
};

// Design Philosophy inspired by legendary designers:
// • Jony Ive: "Design is not just what it looks like and feels like. Design is how it works."
// • Dieter Rams: "Less, but better" - functional, honest, long-lasting
// • Michael Beirut: Editorial clarity and purposeful hierarchy
// • Benji Taylor: Modern minimalism with thoughtful details
// • Mariana Castilho: Refined micro-interactions and human touch
// • Rauno Freiberg: Systematic design with clear visual language
// • Jason Yuan: Contemporary elegance through simplicity
// • MDS: Systematic approach with accessibility at core
// • Jordan Singer: Functional beauty in every interaction
// • Emil Kowalski: Typography as the foundation of design

// Enhanced Color Palette - Inspired by Dieter Rams' timeless approach
const lightColors = {
  // Core colors - inspired by Rams' functional design
  background: "#FAFAFA", // Pure, minimal background
  surface: "#FFFFFF", // Clean surface
  surfaceVariant: "#F5F5F5", // Subtle surface variation
  onSurface: "#1A1A1A", // High contrast text
  onSurfaceVariant: "#666666", // Secondary text with reduced contrast

  // Primary colors - inspired by Ive's attention to materials
  primary: "#007AFF", // Apple-inspired blue (functional, trustworthy)
  onPrimary: "#FFFFFF",
  primaryContainer: "#E3F2FD", // Subtle primary background
  onPrimaryContainer: "#0D47A1",

  // Secondary colors - inspired by Beirut's editorial approach
  secondary: "#FF6B35", // Warm accent (the worm's color)
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FFF3E0",
  onSecondaryContainer: "#E65100",

  // Semantic colors - inspired by systematic design
  positive: "#34C759", // Success green
  error: "#FF3B30", // Error red
  warning: "#FF9500", // Warning orange
  info: "#5AC8FA", // Info blue

  // Neutral colors - inspired by Kowalski's refined palette
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

  // Legacy support
  text: "#1A1A1A",
  accent: "#007AFF",
  notification: "#FF9500",
};

const darkColors = {
  // Core colors - maintaining Rams' functional approach
  background: "#121212", // Deep, rich background
  surface: "#1E1E1E", // Elevated surface
  surfaceVariant: "#2D2D2D", // Subtle surface variation
  onSurface: "#FFFFFF", // High contrast text
  onSurfaceVariant: "#B0B0B0", // Secondary text

  // Primary colors - maintaining Ive's material sensitivity
  primary: "#0A84FF", // Brighter blue for dark mode
  onPrimary: "#FFFFFF",
  primaryContainer: "#1A3A5F", // Darker primary background
  onPrimaryContainer: "#BBDEFB",

  // Secondary colors - maintaining Beirut's editorial clarity
  secondary: "#FF6B35", // Consistent worm color
  onSecondary: "#FFFFFF",
  secondaryContainer: "#4A2C1A", // Darker secondary background
  onSecondaryContainer: "#FFCC02",

  // Semantic colors - maintaining systematic approach
  positive: "#30D158", // Brighter success green
  error: "#FF453A", // Brighter error red
  warning: "#FF9F0A", // Brighter warning orange
  info: "#64D2FF", // Brighter info blue

  // Neutral colors - maintaining Kowalski's refined palette
  neutral: {
    50: "#121212",
    100: "#1E1E1E",
    200: "#2D2D2D",
    300: "#404040",
    400: "#5A5A5A",
    500: "#737373",
    600: "#8E8E93",
    700: "#AEAEB2",
    800: "#C7C7CC",
    900: "#FFFFFF",
  },

  // Legacy support
  text: "#FFFFFF",
  accent: "#0A84FF",
  notification: "#FF9F0A",
};

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
};

export type AppTheme = typeof lightTheme;

// Systematic spacing inspired by Rauno Freiberg's grid systems
export const spacing = {
  xxs: 2, // Micro spacing for fine adjustments
  xs: 4, // Small spacing for tight layouts
  sm: 8, // Standard spacing unit
  md: 16, // Base spacing unit (inspired by 8pt grid)
  lg: 24, // Comfortable spacing
  xl: 32, // Section spacing
  xxl: 48, // Large section spacing
  xxxl: 64, // Hero spacing
  xxxxl: 96, // Maximum spacing
};

// Refined border radius system inspired by Ive's attention to detail
export const borderRadius = {
  none: 0, // Sharp edges for technical elements
  xs: 2, // Subtle rounding
  sm: 4, // Standard rounding
  md: 8, // Comfortable rounding
  lg: 12, // Generous rounding
  xl: 16, // Large rounding
  xxl: 24, // Maximum rounding
  full: 9999, // Circular elements
};

// Enhanced shadow system inspired by Ive's material sensitivity
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
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
  // Backward compatibility
  subtle: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
};

// Editorial typography system inspired by Michael Beirut and Emil Kowalski
export const typography = {
  // Display styles - for hero content (inspired by Beirut's editorial work)
  display1: {
    fontSize: 72,
    fontWeight: "200" as const, // Extra light for elegance
    letterSpacing: -3,
    lineHeight: 80,
  },
  display2: {
    fontSize: 56,
    fontWeight: "200" as const,
    letterSpacing: -2,
    lineHeight: 64,
  },
  display3: {
    fontSize: 48,
    fontWeight: "200" as const,
    letterSpacing: -1.5,
    lineHeight: 56,
  },

  // Headline styles - for section titles (inspired by Kowalski's hierarchy)
  headline1: {
    fontSize: 36,
    fontWeight: "300" as const, // Light for elegance
    letterSpacing: -1,
    lineHeight: 44,
  },
  headline2: {
    fontSize: 32,
    fontWeight: "300" as const,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  headline3: {
    fontSize: 28,
    fontWeight: "300" as const,
    letterSpacing: -0.25,
    lineHeight: 36,
  },

  // Title styles - for card headers (inspired by systematic design)
  title1: {
    fontSize: 24,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  title2: {
    fontSize: 20,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  title3: {
    fontSize: 18,
    fontWeight: "500" as const,
    letterSpacing: 0,
    lineHeight: 24,
  },

  // Body styles - for content (inspired by functional design)
  body1: {
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: "400" as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },

  // Label styles - for UI elements (inspired by MDS)
  label1: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  label2: {
    fontSize: 12,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  // Caption styles - for secondary text (inspired by refined details)
  caption1: {
    fontSize: 12,
    fontWeight: "400" as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  // Special styles (inspired by editorial design)
  overline: {
    fontSize: 10,
    fontWeight: "500" as const,
    letterSpacing: 2,
    lineHeight: 16,
    textTransform: "uppercase" as const,
  },
  button: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
};

// Enhanced animation system inspired by Mariana Castilho's micro-interactions
export const animation = {
  duration: {
    instant: 100, // Immediate feedback
    fast: 200, // Quick transitions
    normal: 300, // Standard transitions
    slow: 500, // Deliberate animations
    slower: 700, // Complex animations
  },
  easing: {
    // Inspired by human-centered design
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    // Custom easings for specific interactions
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    smooth: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  },
  // Predefined animations for common interactions
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
  },
};

// Layout constants inspired by systematic design principles
export const layout = {
  maxWidth: 1200,
  containerPadding: spacing.lg,
  sectionSpacing: spacing.xxl,
  cardSpacing: spacing.lg,
  // Grid system inspired by systematic design
  grid: {
    columns: 12,
    gutter: spacing.md,
    margin: spacing.lg,
  },
  // Breakpoints for responsive design
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
};

// Component-specific design tokens inspired by functional design
export const components = {
  // Card design inspired by clean interfaces
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    shadow: shadows.card,
    backgroundColor: "surface",
  },
  // Button design inspired by functional beauty
  button: {
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  // Input design inspired by systematic approach
  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  // Navigation design inspired by clear hierarchy
  navigation: {
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: "surface",
  },
};

// Accessibility tokens inspired by inclusive design
export const accessibility = {
  // Minimum touch targets (inspired by human-centered design)
  minTouchTarget: 44,
  // Focus indicators
  focusRing: {
    width: 2,
    color: "primary",
    style: "solid",
  },
  // High contrast mode support
  highContrast: {
    enabled: true,
    threshold: 4.5, // WCAG AA standard
  },
};

// Export all design tokens for easy access
export const designTokens = {
  spacing,
  borderRadius,
  shadows,
  typography,
  animation,
  layout,
  components,
  accessibility,
};
