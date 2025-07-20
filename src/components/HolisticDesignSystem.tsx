import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
} from "react-native";
import {
  designTokens,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  components,
  layout,
} from "@/constants/holisticDesignSystem";

const { width: screenWidth } = Dimensions.get("window");

// ============================================================================
// HOLISTIC BUTTON COMPONENT (Jordan Singer + Functional Beauty)
// ============================================================================

interface HolisticButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "minimal";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function HolisticButton({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  icon,
  loading = false,
}: HolisticButtonProps) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.98,
      duration: animation.duration.instant,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: animation.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      height: components.button.height[size],
      paddingHorizontal: components.button.paddingHorizontal[size],
      borderRadius: components.button.borderRadius,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      flexDirection: "row" as const,
      gap: spacing.small,
      ...shadows.subtle,
    };

    switch (variant) {
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: colors.brand.secondary,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.brand.primary,
          ...shadows.none,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          ...shadows.none,
        };
      case "minimal":
        return {
          ...baseStyle,
          backgroundColor: colors.surface.secondary,
          ...shadows.none,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.brand.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return colors.brand.primary;
      case "minimal":
        return colors.content.primary;
      case "secondary":
        return colors.surface.primary;
      default:
        return colors.surface.primary;
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case "small":
        return typography.label.medium;
      case "large":
        return typography.title.small;
      default:
        return typography.label.large;
    }
  };

  return (
    <Animated.View
      style={[
        fullWidth && { width: "100%" },
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <Pressable
        style={[getButtonStyle(), disabled && { opacity: 0.5 }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {icon &&
          !loading &&
          (typeof icon === "string" ? (
            <Text style={[getTextStyle(), { color: getTextColor() }]}>
              {icon}
            </Text>
          ) : (
            icon
          ))}
        {loading ? (
          <View style={styles.loadingSpinner} />
        ) : (
          <Text style={[getTextStyle(), { color: getTextColor() }]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// HOLISTIC CARD COMPONENT (Benji Taylor + Modern Minimalism)
// ============================================================================

interface HolisticCardProps {
  title?: string;
  subtitle?: string;
  content?: string;
  children?: React.ReactNode;
  variant?: "default" | "elevated" | "flat" | "minimal";
  onPress?: () => void;
  padding?: "small" | "medium" | "large";
  image?: React.ReactNode;
  actions?: React.ReactNode;
}

export function HolisticCard({
  title,
  subtitle,
  content,
  children,
  variant = "default",
  onPress,
  padding = "medium",
  image,
  actions,
}: HolisticCardProps) {
  const [elevation] = useState(new Animated.Value(0));

  const handlePressIn = () => {
    if (onPress) {
      Animated.timing(elevation, {
        toValue: 1,
        duration: animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.timing(elevation, {
        toValue: 0,
        duration: animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface.primary,
      borderRadius: components.card.borderRadius,
      padding: components.card.padding[padding],
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          ...shadows.medium,
        };
      case "flat":
        return {
          ...baseStyle,
          ...shadows.none,
        };
      case "minimal":
        return {
          ...baseStyle,
          backgroundColor: colors.surface.secondary,
          ...shadows.none,
        };
      default:
        return {
          ...baseStyle,
          ...shadows.card,
        };
    }
  };

  const CardContainer = onPress ? Pressable : View;

  return (
    <Animated.View
      style={[
        getCardStyle(),
        {
          transform: [
            {
              translateY: elevation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -2],
              }),
            },
          ],
        },
      ]}
    >
      <CardContainer
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={onPress && styles.pressable}
      >
        {image && <View style={styles.cardImage}>{image}</View>}

        {title && (
          <Text
            style={[
              typography.title.medium,
              { color: colors.content.primary, marginBottom: spacing.small },
            ]}
          >
            {title}
          </Text>
        )}

        {subtitle && (
          <Text
            style={[
              typography.body.medium,
              { color: colors.content.secondary, marginBottom: spacing.small },
            ]}
          >
            {subtitle}
          </Text>
        )}

        {content && (
          <Text
            style={[
              typography.body.large,
              { color: colors.content.primary, marginBottom: spacing.medium },
            ]}
          >
            {content}
          </Text>
        )}

        {children}

        {actions && <View style={styles.cardActions}>{actions}</View>}
      </CardContainer>
    </Animated.View>
  );
}

// ============================================================================
// HOLISTIC INPUT COMPONENT (Dieter Rams + Functional Approach)
// ============================================================================

interface HolisticInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  variant?: "default" | "outlined" | "filled";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function HolisticInput({
  placeholder,
  value,
  onChangeText,
  variant = "default",
  size = "medium",
  disabled = false,
  error,
  label,
  icon,
}: HolisticInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = () => {
    const baseStyle = {
      height: components.input.height,
      paddingHorizontal: components.input.paddingHorizontal,
      borderRadius: components.input.borderRadius,
      borderWidth: components.input.borderWidth,
      fontSize: components.input.fontSize,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: spacing.small,
    };

    switch (variant) {
      case "outlined":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderColor: isFocused
            ? colors.brand.primary
            : error
            ? colors.semantic.error
            : colors.content.tertiary,
        };
      case "filled":
        return {
          ...baseStyle,
          backgroundColor: colors.surface.secondary,
          borderColor: "transparent",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.surface.primary,
          borderColor: isFocused
            ? colors.brand.primary
            : error
            ? colors.semantic.error
            : colors.content.tertiary,
        };
    }
  };

  return (
    <View style={styles.inputContainer}>
      {label && (
        <Text
          style={[
            typography.label.medium,
            { color: colors.content.secondary, marginBottom: spacing.tiny },
          ]}
        >
          {label}
        </Text>
      )}

      <View style={[getInputStyle(), disabled && { opacity: 0.5 }]}>
        {icon && icon}
        <TextInput
          style={[
            typography.body.large,
            { color: colors.content.primary, flex: 1 },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.content.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
        />
      </View>

      {error && (
        <Text
          style={[
            typography.body.small,
            { color: colors.semantic.error, marginTop: spacing.tiny },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ============================================================================
// HOLISTIC TYPOGRAPHY COMPONENT (Emil Kowalski + Typography Foundation)
// ============================================================================

interface HolisticTextProps {
  children: React.ReactNode;
  variant?:
    | "display.large"
    | "display.medium"
    | "display.small"
    | "headline.large"
    | "headline.medium"
    | "headline.small"
    | "title.large"
    | "title.medium"
    | "title.small"
    | "body.large"
    | "body.medium"
    | "body.small"
    | "label.large"
    | "label.medium"
    | "label.small"
    | "overline";
  color?: keyof typeof colors.content;
  align?: "left" | "center" | "right";
  weight?: "200" | "300" | "400" | "500" | "600" | "700";
  style?: any;
}

export function HolisticText({
  children,
  variant = "body.large",
  color = "primary",
  align = "left",
  weight,
  style,
}: HolisticTextProps) {
  const getTypographyStyle = () => {
    const [category, size] = variant.split(".");
    const categoryObj = typography[category as keyof typeof typography];
    if (categoryObj && typeof categoryObj === "object") {
      return categoryObj[size as keyof typeof categoryObj];
    }
    return typography.body.large; // fallback
  };

  const textStyle = {
    ...getTypographyStyle(),
    color: colors.content[color],
    textAlign: align,
    ...(weight && { fontWeight: weight }),
    ...style,
  };

  return <Text style={textStyle}>{children}</Text>;
}

// ============================================================================
// HOLISTIC LAYOUT COMPONENTS (Rauno Freiberg + Systematic Design)
// ============================================================================

interface HolisticContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  backgroundColor?: keyof typeof colors.surface;
  maxWidth?: number;
  center?: boolean;
}

export function HolisticContainer({
  children,
  padding = "large",
  backgroundColor = "primary",
  maxWidth = layout.maxWidth,
  center = false,
}: HolisticContainerProps) {
  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing[padding],
          backgroundColor: colors.surface[backgroundColor],
          maxWidth,
          alignSelf: center ? "center" : "stretch",
        },
      ]}
    >
      {children}
    </View>
  );
}

interface HolisticSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: keyof typeof spacing;
}

export function HolisticSection({
  children,
  title,
  subtitle,
  spacing: sectionSpacing = "xxlarge",
}: HolisticSectionProps) {
  return (
    <View style={[styles.section, { marginBottom: spacing[sectionSpacing] }]}>
      {title && (
        <View style={styles.sectionHeader}>
          <HolisticText variant="headline.medium" style={styles.sectionTitle}>
            {title}
          </HolisticText>
          {subtitle && (
            <HolisticText
              variant="body.medium"
              color="secondary"
              style={styles.sectionSubtitle}
            >
              {subtitle}
            </HolisticText>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

// ============================================================================
// HOLISTIC DESIGN SYSTEM SHOWCASE
// ============================================================================

export function HolisticDesignSystemShowcase() {
  const [inputValue, setInputValue] = useState("");

  return (
    <ScrollView style={styles.showcase}>
      <HolisticContainer>
        {/* Hero Section */}
        <HolisticSection
          title="Holistic Design System"
          subtitle="Inspired by legendary designers"
          spacing="xxxxlarge"
        >
          <HolisticText variant="display.small" style={styles.heroText}>
            Design is not just what it looks like and feels like.
          </HolisticText>
          <HolisticText variant="display.small" style={styles.heroText}>
            Design is how it works.
          </HolisticText>
          <HolisticText
            variant="body.large"
            color="secondary"
            style={styles.heroSubtext}
          >
            — Jony Ive
          </HolisticText>
        </HolisticSection>

        {/* Typography Section */}
        <HolisticSection
          title="Typography"
          subtitle="Emil Kowalski + Michael Beirut"
        >
          <View style={styles.typographyGrid}>
            <View style={styles.typographyItem}>
              <HolisticText variant="display.large">Display Large</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                72px • Extra Light • -3 letter-spacing
              </HolisticText>
            </View>

            <View style={styles.typographyItem}>
              <HolisticText variant="headline.large">
                Headline Large
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                36px • Light • -1 letter-spacing
              </HolisticText>
            </View>

            <View style={styles.typographyItem}>
              <HolisticText variant="title.large">Title Large</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                24px • Regular • 0 letter-spacing
              </HolisticText>
            </View>

            <View style={styles.typographyItem}>
              <HolisticText variant="body.large">Body Large</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                16px • Regular • 0.15 letter-spacing
              </HolisticText>
            </View>
          </View>
        </HolisticSection>

        {/* Color System Section */}
        <HolisticSection title="Color System" subtitle="Dieter Rams + Jony Ive">
          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: colors.brand.primary },
                ]}
              />
              <HolisticText variant="label.large">Primary</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                {colors.brand.primary}
              </HolisticText>
            </View>

            <View style={styles.colorItem}>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: colors.brand.secondary },
                ]}
              />
              <HolisticText variant="label.large">Secondary</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                {colors.brand.secondary}
              </HolisticText>
            </View>

            <View style={styles.colorItem}>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: colors.semantic.success },
                ]}
              />
              <HolisticText variant="label.large">Success</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                {colors.semantic.success}
              </HolisticText>
            </View>

            <View style={styles.colorItem}>
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: colors.semantic.error },
                ]}
              />
              <HolisticText variant="label.large">Error</HolisticText>
              <HolisticText variant="body.small" color="secondary">
                {colors.semantic.error}
              </HolisticText>
            </View>
          </View>
        </HolisticSection>

        {/* Button Section */}
        <HolisticSection
          title="Buttons"
          subtitle="Jordan Singer + Functional Beauty"
        >
          <View style={styles.buttonGrid}>
            <HolisticButton
              title="Primary Button"
              onPress={() => console.log("Primary pressed")}
              variant="primary"
            />

            <HolisticButton
              title="Secondary Button"
              onPress={() => console.log("Secondary pressed")}
              variant="secondary"
            />

            <HolisticButton
              title="Outline Button"
              onPress={() => console.log("Outline pressed")}
              variant="outline"
            />

            <HolisticButton
              title="Ghost Button"
              onPress={() => console.log("Ghost pressed")}
              variant="ghost"
            />

            <HolisticButton
              title="Minimal Button"
              onPress={() => console.log("Minimal pressed")}
              variant="minimal"
            />
          </View>
        </HolisticSection>

        {/* Card Section */}
        <HolisticSection
          title="Cards"
          subtitle="Benji Taylor + Modern Minimalism"
        >
          <View style={styles.cardGrid}>
            <HolisticCard
              title="Default Card"
              subtitle="With subtitle and content"
              content="This card demonstrates the default styling with proper typography hierarchy and spacing."
            />

            <HolisticCard
              title="Elevated Card"
              subtitle="With enhanced shadows"
              content="This card uses elevated styling for more visual prominence."
              variant="elevated"
            />

            <HolisticCard
              title="Minimal Card"
              subtitle="Clean and simple"
              content="This card uses minimal styling for a clean, uncluttered appearance."
              variant="minimal"
            />

            <HolisticCard
              title="Interactive Card"
              subtitle="Tap to interact"
              content="This card can be pressed and will respond to touch interactions."
              onPress={() => console.log("Card pressed")}
            />
          </View>
        </HolisticSection>

        {/* Input Section */}
        <HolisticSection
          title="Inputs"
          subtitle="Dieter Rams + Functional Approach"
        >
          <View style={styles.inputGrid}>
            <HolisticInput
              label="Default Input"
              placeholder="Enter text here"
              value={inputValue}
              onChangeText={setInputValue}
            />

            <HolisticInput
              label="Outlined Input"
              placeholder="Outlined style"
              variant="outlined"
            />

            <HolisticInput
              label="Filled Input"
              placeholder="Filled style"
              variant="filled"
            />

            <HolisticInput
              label="Input with Error"
              placeholder="Error state"
              error="This field is required"
            />
          </View>
        </HolisticSection>

        {/* Spacing Section */}
        <HolisticSection
          title="Spacing System"
          subtitle="Rauno Freiberg + Systematic Design"
        >
          <View style={styles.spacingGrid}>
            {Object.entries(spacing).map(([key, value]) => (
              <View key={key} style={styles.spacingItem}>
                <View
                  style={[
                    styles.spacingVisual,
                    { width: value, height: value },
                  ]}
                />
                <HolisticText variant="label.medium">{key}</HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  {value}px
                </HolisticText>
              </View>
            ))}
          </View>
        </HolisticSection>
      </HolisticContainer>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  showcase: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },

  container: {
    flex: 1,
  },

  section: {
    marginBottom: spacing.xxlarge,
  },

  sectionHeader: {
    marginBottom: spacing.large,
  },

  sectionTitle: {
    marginBottom: spacing.small,
  },

  sectionSubtitle: {
    marginBottom: spacing.medium,
  },

  heroText: {
    marginBottom: spacing.medium,
  },

  heroSubtext: {
    marginTop: spacing.large,
    fontStyle: "italic",
  },

  typographyGrid: {
    gap: spacing.large,
  },

  typographyItem: {
    gap: spacing.small,
  },

  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.large,
  },

  colorItem: {
    alignItems: "center",
    gap: spacing.small,
    minWidth: 100,
  },

  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.medium,
    ...shadows.small,
  },

  buttonGrid: {
    gap: spacing.medium,
  },

  cardGrid: {
    gap: spacing.large,
  },

  inputGrid: {
    gap: spacing.large,
  },

  spacingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.medium,
  },

  spacingItem: {
    alignItems: "center",
    gap: spacing.small,
  },

  spacingVisual: {
    backgroundColor: colors.brand.primary,
    borderRadius: borderRadius.tiny,
  },

  pressable: {
    // Add subtle feedback for pressable elements
  },

  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    borderTopColor: "currentColor",
  },

  cardImage: {
    marginBottom: spacing.medium,
  },

  cardActions: {
    marginTop: spacing.medium,
    flexDirection: "row",
    gap: spacing.small,
  },

  inputContainer: {
    gap: spacing.tiny,
  },
});
