import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "@/contexts/ThemeContext";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";
import { spacing, shadows } from "@/constants/theme";

// Debug logging to test file loading and imports
console.log("=== TAB LAYOUT DEBUG ===");
console.log("File loaded: app/(tabs)/_layout.tsx");
console.log("Testing import resolution...");
try {
  console.log("ThemeContext import:", typeof useThemeContext);
  console.log("AuthContext import:", typeof useAuthContext);
  console.log("MaterialCommunityIcons import:", typeof MaterialCommunityIcons);
} catch (error) {
  console.error("Import error:", error);
}
console.log("========================");

// Explicit type for tabBarIcon props
interface IconProps {
  color: string;
  size: number;
  focused?: boolean;
}

export default function TabLayout() {
  const { theme } = useThemeContext();
  const { loading } = useAuthContext();

  if (!theme || loading) {
    // Theme is not available yet, render a loading state or nothing.
    // This prevents the app from crashing.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Debug logging for tab bar
  console.log("=== TAB BAR DEBUG INFO ===");
  console.log("Tab bar height: 88px");
  console.log("Tab bar padding: 8px top, 8px bottom");
  console.log("Total tab bar space: 88 + 8 + 8 = 104px");
  console.log("========================");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          height: 88,
          ...shadows.lg, // Add subtle shadow to tab bar
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "clipboard-text" : "clipboard-text-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "chart-line" : "chart-line"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "map-marker" : "map-marker-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="price-compare"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "scale-balance" : "scale-balance"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "account-group" : "account-group-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size, focused }: IconProps) => (
            <MaterialCommunityIcons
              name={focused ? "cog" : "cog-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
