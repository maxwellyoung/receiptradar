# ReceiptRadar Design System - Developer Guide

_How to implement legendary design principles in your components_

## Quick Start

### 1. Import Design Tokens

```typescript
import {
  spacing,
  borderRadius,
  shadows,
  typography,
  animation,
} from "@/constants/theme";
import {
  createCardStyle,
  createButtonStyle,
  createInputStyle,
  commonStyles,
} from "@/utils/designSystem";
```

### 2. Use in Components

```typescript
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, shadows } from "@/constants/theme";

const MyComponent = () => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={{ padding: spacing.lg, backgroundColor: theme.colors.background }}
    >
      <Text style={[typography.headline2, { color: theme.colors.onSurface }]}>
        My Component
      </Text>
      <Text
        style={[typography.body1, { color: theme.colors.onSurfaceVariant }]}
      >
        This follows the design system
      </Text>
    </View>
  );
};
```

## Design Principles in Practice

### 1. "Less, but better" (Dieter Rams)

**Before:**

```typescript
<View style={{
  padding: 20,
  margin: 15,
  borderRadius: 10,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}}>
```

**After:**

```typescript
<View style={[
  { backgroundColor: theme.colors.surface },
  commonStyles.card,
  shadows.card,
]}>
```

### 2. "Design is how it works" (Jony Ive)

**Before:**

```typescript
<Pressable style={{ backgroundColor: "blue", padding: 10 }}>
  <Text style={{ color: "white" }}>Button</Text>
</Pressable>
```

**After:**

```typescript
<Pressable style={createButtonStyle(theme, "primary", "medium")}>
  <Text style={[typography.label1, { color: theme.colors.onPrimary }]}>
    Button
  </Text>
</Pressable>
```

### 3. Editorial Clarity (Michael Beirut)

**Before:**

```typescript
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>
<Text style={{ fontSize: 16 }}>Content</Text>
<Text style={{ fontSize: 12, color: 'gray' }}>Caption</Text>
```

**After:**

```typescript
<Text style={[typography.headline2, { color: theme.colors.onSurface }]}>
  Title
</Text>
<Text style={[typography.body1, { color: theme.colors.onSurface }]}>
  Content
</Text>
<Text style={[typography.caption1, { color: theme.colors.onSurfaceVariant }]}>
  Caption
</Text>
```

## Component Patterns

### Card Component

```typescript
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { createCardStyle, spacing, typography } from "@/utils/designSystem";

interface CardProps {
  title: string;
  content: string;
  variant?: "default" | "elevated" | "flat";
}

export const Card = ({ title, content, variant = "default" }: CardProps) => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={createCardStyle(theme, variant)}>
      <Text style={[typography.title2, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      <Text
        style={[
          typography.body2,
          {
            color: theme.colors.onSurfaceVariant,
            marginTop: spacing.sm,
          },
        ]}
      >
        {content}
      </Text>
    </View>
  );
};
```

### Button Component

```typescript
import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { createButtonStyle, typography } from "@/utils/designSystem";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
}: ButtonProps) => {
  const theme = useTheme<AppTheme>();

  const buttonStyle = createButtonStyle(theme, variant, size);
  const textColor =
    variant === "outline" || variant === "ghost"
      ? theme.colors.primary
      : theme.colors.onPrimary;

  return (
    <Pressable
      style={[buttonStyle, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[typography.label1, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
};
```

### Input Component

```typescript
import React from "react";
import { TextInput, View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { createInputStyle, spacing, typography } from "@/utils/designSystem";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: "default" | "outlined" | "filled";
  error?: string;
}

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = "default",
  error,
}: InputProps) => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text
          style={[
            typography.label1,
            {
              color: theme.colors.onSurface,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          createInputStyle(theme, variant),
          { color: theme.colors.onSurface },
          error && { borderColor: theme.colors.error },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
      />
      {error && (
        <Text
          style={[
            typography.caption1,
            {
              color: theme.colors.error,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
```

## Layout Patterns

### Container Layout

```typescript
import React from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { createContainerStyle } from "@/utils/designSystem";

export const Container = ({ children, padding = "lg" }) => {
  const theme = useTheme<AppTheme>();

  return <View style={createContainerStyle(theme, padding)}>{children}</View>;
};
```

### Section Layout

```typescript
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { createSectionStyle, spacing, typography } from "@/utils/designSystem";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section = ({ title, children }: SectionProps) => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={createSectionStyle(theme)}>
      <Text
        style={[
          typography.headline2,
          {
            color: theme.colors.onSurface,
            marginBottom: spacing.lg,
          },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};
```

## Animation Patterns

### Fade In Animation

```typescript
import React, { useEffect } from "react";
import { Animated } from "react-native";
import { createAnimationStyle } from "@/utils/designSystem";

export const FadeInView = ({ children, delay = 0 }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const animation = createAnimationStyle("fadeIn");

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: animation.duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>{children}</Animated.View>
  );
};
```

### Slide Up Animation

```typescript
import React, { useEffect } from "react";
import { Animated } from "react-native";
import { createAnimationStyle } from "@/utils/designSystem";

export const SlideUpView = ({ children, delay = 0 }) => {
  const slideAnim = new Animated.Value(20);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const animation = createAnimationStyle("slideUp");

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: animation.duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};
```

## Color Usage Guidelines

### Semantic Colors

```typescript
import { getSemanticColor } from "@/utils/designSystem";

// Use semantic colors for status indicators
const statusColor = getSemanticColor(theme, "success"); // Green for success
const errorColor = getSemanticColor(theme, "error"); // Red for errors
const warningColor = getSemanticColor(theme, "warning"); // Orange for warnings
const infoColor = getSemanticColor(theme, "info"); // Blue for info
```

### Text Colors

```typescript
import { getTextColor } from "@/utils/designSystem";

// Use appropriate text colors
const primaryText = getTextColor(theme, "body"); // Main text
const secondaryText = getTextColor(theme, "caption"); // Secondary text
const accentText = getTextColor(theme, "primary"); // Accent text
const disabledText = getTextColor(theme, "disabled"); // Disabled text
```

## Accessibility Patterns

### Accessible Touch Targets

```typescript
import { createAccessibleStyle } from "@/utils/designSystem";

const accessibleButtonStyle = createAccessibleStyle(theme, false);
// Ensures minimum 44px touch target
```

### High Contrast Support

```typescript
import { createAccessibleStyle } from "@/utils/designSystem";

const highContrastStyle = createAccessibleStyle(theme, true);
// Adds focus indicators for high contrast mode
```

## Best Practices

### 1. Use Design Tokens Consistently

✅ **Good:**

```typescript
<View style={{ padding: spacing.lg }}>
  <Text style={typography.headline2}>Title</Text>
</View>
```

❌ **Avoid:**

```typescript
<View style={{ padding: 24 }}>
  <Text style={{ fontSize: 32, fontWeight: "300" }}>Title</Text>
</View>
```

### 2. Leverage Theme Colors

✅ **Good:**

```typescript
<Text style={{ color: theme.colors.onSurface }}>Content</Text>
```

❌ **Avoid:**

```typescript
<Text style={{ color: "#1A1A1A" }}>Content</Text>
```

### 3. Use Utility Functions

✅ **Good:**

```typescript
const cardStyle = createCardStyle(theme, "elevated");
```

❌ **Avoid:**

```typescript
const cardStyle = {
  backgroundColor: theme.colors.surface,
  borderRadius: 8,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
};
```

### 4. Maintain Typography Hierarchy

✅ **Good:**

```typescript
<Text style={typography.headline1}>Main Title</Text>
<Text style={typography.title1}>Section Title</Text>
<Text style={typography.body1}>Content</Text>
<Text style={typography.caption1}>Caption</Text>
```

❌ **Avoid:**

```typescript
<Text style={{ fontSize: 36 }}>Main Title</Text>
<Text style={{ fontSize: 24 }}>Section Title</Text>
<Text style={{ fontSize: 16 }}>Content</Text>
<Text style={{ fontSize: 12 }}>Caption</Text>
```

## Common Patterns

### List Item Pattern

```typescript
const ListItem = ({ title, subtitle, onPress }) => {
  const theme = useTheme<AppTheme>();

  return (
    <Pressable
      style={[
        commonStyles.row,
        commonStyles.spaceBetween,
        {
          padding: spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: borderRadius.sm,
          marginBottom: spacing.sm,
        },
      ]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.title3, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[typography.body2, { color: theme.colors.onSurfaceVariant }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
```

### Form Pattern

```typescript
const Form = ({ children }) => {
  const theme = useTheme<AppTheme>();

  return <View style={{ gap: spacing.lg }}>{children}</View>;
};

// Usage
<Form>
  <Input label="Name" placeholder="Enter your name" />
  <Input label="Email" placeholder="Enter your email" />
  <Button title="Submit" onPress={handleSubmit} />
</Form>;
```

## Testing Your Design

### Visual Testing

Use the `DesignSystemShowcase` component to verify your implementation:

```typescript
import { DesignSystemShowcase } from "@/components/DesignSystemShowcase";

// In your development screen
<DesignSystemShowcase title="My App Design System" />;
```

### Accessibility Testing

```typescript
// Test with different accessibility settings
const accessibleStyle = createAccessibleStyle(theme, true);
const normalStyle = createAccessibleStyle(theme, false);
```

## Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Theme Constants](../src/constants/theme.ts)
- [Design System Utilities](../src/utils/designSystem.ts)
- [Design System Showcase](../src/components/DesignSystemShowcase.tsx)

---

_Remember: Good design is invisible. When users notice the design, it's usually because something is wrong. Focus on functionality, clarity, and accessibility._
