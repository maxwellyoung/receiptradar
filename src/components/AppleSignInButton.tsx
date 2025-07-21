import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useThemeContext } from "@/contexts/ThemeContext";
import Constants from "expo-constants";
import { borderRadius, shadows } from "@/constants/theme";
import { logger } from "@/utils/logger";

interface AppleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  style?: any;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onSuccess,
  onError,
  style,
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithApple } = useAuthContext();
  const { theme } = useThemeContext();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    if (Platform.OS !== "ios") {
      setIsAvailable(false);
      return;
    }

    try {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      logger.error(
        "Error checking Apple authentication availability",
        error as Error,
        { component: "AppleSignInButton" }
      );
      setIsAvailable(false);
    } finally {
      // Ensure we always set a state to prevent infinite loading
      if (isAvailable === null) {
        setIsAvailable(false);
      }
    }
  };

  const handleAppleSignIn = async () => {
    if (!isAvailable) {
      Alert.alert("Error", "Apple Sign-In is not available on this device");
      return;
    }

    setIsLoading(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Check if we're in development mode
      const isDevelopment = __DEV__ || Constants.appOwnership === "expo";

      if (isDevelopment) {
        // Show warning for development mode
        Alert.alert(
          "Development Mode",
          "Apple Sign-In may not work in Expo Go. For full functionality, please create a development build.",
          [
            {
              text: "Try Anyway",
              onPress: async () => {
                try {
                  await signInWithApple();
                  onSuccess?.({});
                } catch (error: any) {
                  logger.error("Apple Sign-In error", error as Error, {
                    component: "AppleSignInButton",
                  });

                  if (error.message?.includes("Unacceptable audience")) {
                    Alert.alert(
                      "Development Build Required",
                      "Apple Sign-In requires a development build to work with Supabase. Please run: eas build --profile development --platform ios",
                      [{ text: "OK" }]
                    );
                  } else {
                    Alert.alert(
                      "Error",
                      "Failed to sign in with Apple. Please try again."
                    );
                  }

                  onError?.(error);
                }
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      } else {
        // Production mode - proceed normally
        await signInWithApple();
        onSuccess?.({});
      }
    } catch (error) {
      logger.error("Apple Sign-In error", error as Error, {
        component: "AppleSignInButton",
      });
      onError?.(error);

      if (
        error instanceof Error &&
        error.message?.includes("Unacceptable audience")
      ) {
        Alert.alert(
          "Configuration Issue",
          "Apple Sign-In is not properly configured. Please check your Supabase Apple provider settings.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to sign in with Apple. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: isLoading ? 0.98 : 1 }}
        transition={{ type: "timing", duration: 100 }}
        style={styles.buttonWrapper}
      >
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={borderRadius.sm}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.onSurfaceVariant,
            },
          ]}
          onPress={handleAppleSignIn}
        />
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  buttonWrapper: {
    width: "100%",
    ...shadows.xs,
  },
  button: {
    width: "100%",
    height: 48,
  },
});
