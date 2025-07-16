import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from "react-native-paper";

// Define the font config using Inter
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
    fontFamily: "Inter_700Bold",
    fontSize: 57,
    fontWeight: "700" as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 45,
    fontWeight: "600" as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: "Inter_500Medium",
    fontSize: 36,
    fontWeight: "500" as const,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 32,
    fontWeight: "600" as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: "Inter_500Medium",
    fontSize: 28,
    fontWeight: "500" as const,
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
    fontFamily: "Inter_500Medium",
    fontSize: 22,
    fontWeight: "500" as const,
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

// 1. Design Philosophy
// • Minimalist utility. Every pixel should serve a purpose.
// • Friendly surveillance. Data-driven, but disarmingly cute.
// • System-first aesthetic. Think iOS-native, not skeuomorphic parody.
// • Contrast & clarity. Embrace legibility over decoration.
// • Whimsy, precisely measured. The worm is your only indulgence.

// 2. Colour Palette (Light Mode)
const lightColors = {
  background: "#F9F9FB", // Even lighter off-white
  primary: "#FF3B30", // Tomato Red (for the worm, highlights)
  secondary: "#3A3A3C", // Near Black for text
  surface: "#FFFFFF", // For cards
  surfaceVariant: "#EEF2F5", // Notion-esque lavender grey-blue
  onSurface: "#1C1C1E",
  onSurfaceVariant: "#6b7280", // Muted grey for secondary text
  text: "#1C1C1E",
  accent: "#5E5CE6", // Vibrant Blue/Purple
  positive: "#30D158", // Emerald
  error: "#FF3B30",
  notification: "#FF9500",
};

// 3. Colour Palette (Dark Mode)
const darkColors = {
  background: "#161618", // Deeper dark background
  primary: "#FF453A", // Brighter Tomato Red
  secondary: "#E5E5EA", // Lighter gray for text/icons
  surface: "#232326", // Slightly lighter card background
  surfaceVariant: "#33373E", // Darker lavender grey-blue
  onSurface: "#FFFFFF",
  onSurfaceVariant: "#9ca3af", // Lighter muted grey
  text: "#FFFFFF",
  accent: "#6466F1", // Brighter Blue/Purple
  positive: "#32D74B", // Brighter Emerald
  error: "#FF453A",
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

// Refined spacing system inspired by systematic design
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  xxxxl: 96,
};

// Minimal border radius system
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Subtle shadow system inspired by Jony Ive's attention to light
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
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
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
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  // Special shadows
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
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Editorial typography system inspired by Michael Beirut
export const typography = {
  // Display styles - for hero content
  display1: {
    fontSize: 72,
    fontWeight: "200" as const,
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

  // Headline styles - for section titles
  headline1: {
    fontSize: 36,
    fontWeight: "300" as const,
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

  // Title styles - for card headers
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

  // Body styles - for content
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

  // Label styles - for UI elements
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

  // Caption styles - for secondary text
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

  // Special styles
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

// Refined animation system
export const animation = {
  duration: {
    fast: 200,
    normal: 400,
    slow: 600,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

// Layout constants
export const layout = {
  maxWidth: 1200,
  containerPadding: spacing.lg,
  sectionSpacing: spacing.xxl,
  cardSpacing: spacing.lg,
};
