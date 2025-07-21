import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
  TouchableOpacity,
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
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";
import * as Haptics from "expo-haptics";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import {
  accessibilityUtils,
  announcementUtils,
  useScreenReader,
  useReducedMotion,
} from "@/utils/accessibility";
import { logger } from "@/utils/logger";

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
  accessibilityHint?: string;
  testID?: string;
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
  accessibilityHint,
  testID,
}: HolisticButtonProps) {
  const theme = useTheme<AppTheme>();
  const { isScreenReaderEnabled } = useScreenReader();
  const { isReduceMotionEnabled } = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      flexDirection: "row" as const,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
        };
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
          ...materialShadows.none,
        };
      case "minimal":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
          ...materialShadows.none,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      color:
        variant === "primary" || variant === "secondary"
          ? theme.colors.onPrimary
          : theme.colors.primary,
    };

    switch (size) {
      case "small":
        return { ...typography.label.medium, ...baseTextStyle };
      case "large":
        return { ...typography.title.medium, ...baseTextStyle };
      default:
        return { ...typography.body.medium, ...baseTextStyle };
    }
  };

  const getPaddingStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: spacing.medium,
          paddingVertical: spacing.small,
        };
      case "large":
        return {
          paddingHorizontal: spacing.xlarge,
          paddingVertical: spacing.large,
        };
      default:
        return {
          paddingHorizontal: spacing.large,
          paddingVertical: spacing.medium,
        };
    }
  };

  const handlePressIn = () => {
    if (disabled || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isReduceMotionEnabled) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (isScreenReaderEnabled) {
      announcementUtils.announceAction(title);
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    if (!isReduceMotionEnabled) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getPaddingStyle(),
        fullWidth && styles.fullWidth,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        isDisabled && styles.disabled,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={isDisabled}
      testID={testID}
      accessible={true}
      accessibilityLabel={loading ? `${title} loading` : title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <MaterialIcons
          name="hourglass-empty"
          size={20}
          color={getTextStyle().color}
          style={styles.loadingIcon}
        />
      ) : (
        <>
          {icon && (
            <MaterialIcons
              name={icon as any}
              size={20}
              color={getTextStyle().color}
              style={styles.leftIcon}
            />
          )}
          <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
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
  accessibilityLabel,
  accessibilityHint,
  testID,
}: HolisticCardProps) {
  const theme = useTheme<AppTheme>();
  const { isScreenReaderEnabled } = useScreenReader();
  const { isReduceMotionEnabled } = useReducedMotion();
  const [elevation] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.timing(elevation, {
          toValue: 1,
          duration: interactions.transitions.fast,
          useNativeDriver: false,
        }),
        Animated.timing(scaleValue, {
          toValue: interactions.press.scale,
          duration: interactions.press.duration,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (isScreenReaderEnabled && accessibilityLabel) {
      announcementUtils.announceAction(accessibilityLabel);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.parallel([
        Animated.timing(elevation, {
          toValue: 0,
          duration: interactions.transitions.fast,
          useNativeDriver: false,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: components.card.borderRadius,
      padding: components.card.padding[padding],
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          ...materialShadows.medium,
        };
      case "flat":
        return {
          ...baseStyle,
          ...materialShadows.none,
        };
      case "minimal":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
          ...materialShadows.none,
        };
      default:
        return {
          ...baseStyle,
          ...materialShadows.light,
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
                outputRange: [0, -4],
              }),
            },
            { scale: scaleValue },
          ],
        },
      ]}
    >
      <CardContainer
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={onPress && styles.pressable}
        testID={testID}
        accessible={true}
        accessibilityLabel={accessibilityLabel || "Card"}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: !onPress }}
      >
        {image && <View style={styles.cardImage}>{image}</View>}

        {title && (
          <Text
            style={[
              typography.title.medium,
              { color: theme.colors.onSurface, marginBottom: spacing.small },
            ]}
          >
            {title}
          </Text>
        )}

        {subtitle && (
          <Text
            style={[
              typography.body.medium,
              {
                color: theme.colors.onSurfaceVariant,
                marginBottom: spacing.small,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}

        {content && (
          <Text
            style={[
              typography.body.large,
              { color: theme.colors.onSurface, marginBottom: spacing.medium },
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
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
  accessibilityLabel,
  accessibilityHint,
  testID,
}: HolisticInputProps) {
  const theme = useTheme<AppTheme>();
  const { isScreenReaderEnabled } = useScreenReader();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: interactions.transitions.fast,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  useEffect(() => {
    Animated.timing(errorAnim, {
      toValue: error ? 1 : 0,
      duration: interactions.transitions.fast,
      useNativeDriver: false,
    }).start();
  }, [error, errorAnim]);

  const handleFocus = () => {
    setIsFocused(true);
    if (isScreenReaderEnabled && accessibilityLabel) {
      announcementUtils.announceAction(`${accessibilityLabel} focused`);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    if (isScreenReaderEnabled && accessibilityLabel) {
      announcementUtils.announceAction(`${text.length} characters entered`);
    }
  };

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
            ? theme.colors.primary
            : error
            ? theme.colors.error
            : theme.colors.outline,
          ...(isFocused ? materialShadows.subtle : materialShadows.none),
        };
      case "filled":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: "transparent",
          ...materialShadows.subtle,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderColor: isFocused
            ? theme.colors.primary
            : error
            ? theme.colors.error
            : theme.colors.outline,
          ...(isFocused ? materialShadows.light : materialShadows.subtle),
        };
    }
  };

  return (
    <View style={styles.inputContainer}>
      {label && (
        <HolisticText
          variant="label.medium"
          color="secondary"
          style={styles.inputLabel}
        >
          {label}
        </HolisticText>
      )}

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: error
              ? theme.colors.error
              : isFocused
              ? theme.colors.primary
              : theme.colors.outline,
            borderWidth: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 2],
            }),
            backgroundColor: disabled
              ? theme.colors.surfaceVariant
              : theme.colors.surface,
          },
        ]}
      >
        {icon && icon}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.onSurface,
              ...typography.body.large,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          testID={testID}
          accessible={true}
          accessibilityLabel={
            accessibilityLabel || label || placeholder || "Input field"
          }
          accessibilityHint={
            accessibilityHint || `Enter ${label || placeholder || "text"}`
          }
          accessibilityRole="text"
          accessibilityState={{ disabled }}
        />
      </Animated.View>

      {error && (
        <Animated.View
          style={[
            styles.errorContainer,
            {
              opacity: errorAnim,
            },
          ]}
        >
          <MaterialIcons
            name="error"
            size={16}
            color={theme.colors.error}
            style={styles.errorIcon}
          />
          <HolisticText
            variant="label.small"
            color="secondary"
            style={styles.errorText}
          >
            {error}
          </HolisticText>
        </Animated.View>
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
  accessibilityRole?: "header" | "text" | "link";
  accessibilityLabel?: string;
  testID?: string;
}

export function HolisticText({
  children,
  variant = "body.large",
  color = "primary",
  align = "left",
  weight,
  style,
  accessibilityRole = "text",
  accessibilityLabel,
  testID,
}: HolisticTextProps) {
  const theme = useTheme<AppTheme>();
  const { isScreenReaderEnabled } = useScreenReader();

  const getColor = () => {
    switch (color) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.secondary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getAccessibilityProps = () => {
    if (accessibilityRole === "header") {
      return accessibilityUtils.generateHeaderProps(
        accessibilityLabel ||
          (typeof children === "string" ? children : "Header"),
        1
      );
    }

    if (accessibilityRole === "link") {
      return accessibilityUtils.generateLinkProps(
        accessibilityLabel || (typeof children === "string" ? children : "Link")
      );
    }

    return accessibilityUtils.generateAccessibilityProps({
      label:
        accessibilityLabel ||
        (typeof children === "string" ? children : "Text"),
      role: "text",
    });
  };

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
    color: getColor(),
    textAlign: align,
    ...(weight && { fontWeight: weight }),
    ...style,
  };

  return (
    <Text style={textStyle} testID={testID}>
      {children}
    </Text>
  );
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
              onPress={() =>
                logger.info("Primary button pressed", {
                  component: "HolisticDesignSystem",
                })
              }
              variant="primary"
            />

            <HolisticButton
              title="Secondary Button"
              onPress={() =>
                logger.info("Secondary button pressed", {
                  component: "HolisticDesignSystem",
                })
              }
              variant="secondary"
            />

            <HolisticButton
              title="Outline Button"
              onPress={() =>
                logger.info("Outline button pressed", {
                  component: "HolisticDesignSystem",
                })
              }
              variant="outline"
            />

            <HolisticButton
              title="Ghost Button"
              onPress={() =>
                logger.info("Ghost button pressed", {
                  component: "HolisticDesignSystem",
                })
              }
              variant="ghost"
            />

            <HolisticButton
              title="Minimal Button"
              onPress={() =>
                logger.info("Minimal button pressed", {
                  component: "HolisticDesignSystem",
                })
              }
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
              onPress={() =>
                logger.info("Card pressed", {
                  component: "HolisticDesignSystem",
                })
              }
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

  inputLabel: {
    marginBottom: spacing.tiny,
  },

  inputWrapper: {
    borderRadius: 8,
    ...materialShadows.subtle,
  },

  input: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    minHeight: 48,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.tiny,
  },

  errorIcon: {
    marginRight: spacing.tiny,
  },

  errorText: {
    flex: 1,
  },

  button: {
    ...materialShadows.subtle,
  },

  buttonText: {
    fontWeight: "600",
  },

  fullWidth: {
    width: "100%",
  },

  disabled: {
    opacity: 0.5,
  },

  leftIcon: {
    marginRight: spacing.small,
  },

  rightIcon: {
    marginLeft: spacing.small,
  },

  loadingIcon: {
    marginRight: spacing.small,
  },
});
