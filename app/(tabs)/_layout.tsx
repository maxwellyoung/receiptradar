import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "@/contexts/ThemeContext";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";

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
          elevation: 0,
          paddingTop: 12,
          height: 90,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="script-text-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-arc"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="radar-demo"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-heart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="tune-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
