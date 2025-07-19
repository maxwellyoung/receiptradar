// This is the root layout for the entire app.
// It's the ideal place to load global styles, fonts, and polyfills.

// By importing a global polyfill here, we ensure that it's loaded
// before any other code in the app, which is critical for compatibility
// with older browsers or environments that don't support modern
// JavaScript features (like `structuredClone`).
import "@/utils/polyfills";

// The globalPolyfill now handles all necessary polyfills.
// This import is no longer needed.
// import "@/utils";

import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import {
  ThemeProvider as AppThemeProvider,
  useThemeContext as useAppThemeContext,
} from "@/contexts/ThemeContext";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingScreen } from "@/components/OnboardingScreen";

console.log("[LOG] app/_layout.tsx loaded");

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

console.log("📍 app/_layout.tsx: Top-level execution");

export default function RootLayout() {
  console.log("🎨 RootLayout: Rendering...");
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    console.log("🎨 RootLayout: Fonts not loaded, returning null");
    return null;
  }

  console.log("🎨 RootLayout: Fonts loaded, rendering providers");
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          <RootContent />
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootContent() {
  console.log("🎨 RootContent: Rendering...");
  const { theme } = useAppThemeContext();
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading || !user) return;

      try {
        const hasOnboarded = await AsyncStorage.getItem("@hasOnboarded");
        if (!hasOnboarded) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error("Failed to fetch onboarding status", e);
      }
    };

    checkOnboarding();
  }, [user, loading]);

  useEffect(() => {
    if (loading) return; // Wait until auth state is confirmed

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // If the user is not signed in and not in the auth group,
      // redirect them to the sign-in page.
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      // If the user is signed in and in the auth group,
      // redirect them to the main app.
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, router]);

  const handleOnboardingDismiss = async () => {
    try {
      await AsyncStorage.setItem("@hasOnboarded", "true");
      setShowOnboarding(false);
    } catch (e) {
      console.error("Failed to save onboarding status", e);
      // Still dismiss the screen even if storage fails
      setShowOnboarding(false);
    }
  };

  // Show a loading indicator while we check for a user
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Conditionally render the stack based on authentication state.
  // This ensures that the sign-in screen is visible when needed
  // and the main app is visible for authenticated users.
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modals/camera"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="receipt/[id]"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="receipt/processing"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="viral-demo" options={{ presentation: "modal" }} />
        </Stack>
        <OnboardingScreen
          isVisible={showOnboarding}
          onDismiss={handleOnboardingDismiss}
        />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
