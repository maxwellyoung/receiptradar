import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/services/supabase";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import {
  lightTheme as theme,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);
  const params = useLocalSearchParams();

  // Check if we have a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session && !error) {
          setIsValidSession(true);
        } else {
          // If no session, try to get it from URL params
          const accessToken = params.access_token as string;
          if (accessToken) {
            const { data, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: "dummy",
              });

            if (data.session && !sessionError) {
              setIsValidSession(true);
            } else {
              setError(
                "Invalid or expired reset link. Please request a new password reset."
              );
            }
          } else {
            setError(
              "No valid session found. Please use the password reset link from your email."
            );
          }
        }
      } catch (err) {
        setError("Failed to validate reset session. Please try again.");
      }
    };

    checkSession();
  }, [params]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Success",
        "Password updated successfully! You can now sign in with your new password.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/sign-in"),
          },
        ]
      );
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update password";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800 }}
          style={styles.header}
        >
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 300 }}
          style={styles.form}
        >
          {!isValidSession ? (
            // Show error state when no valid session
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || "Loading..."}</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace("/(auth)/sign-in")}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Show password reset form when session is valid
            <>
              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your new password"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your new password"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Error Message */}
              {error && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  style={styles.errorContainer}
                >
                  <Text style={styles.errorText}>{error}</Text>
                </MotiView>
              )}

              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleResetPassword();
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Updating..." : "Update Password"}
                </Text>
              </TouchableOpacity>

              {/* Back to Sign In */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/(auth)/sign-in")}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </MotiView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.onBackground,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    color: theme.colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    ...shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surfaceDisabled,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: theme.colors.errorContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: theme.colors.onErrorContainer,
    textAlign: "center",
  },
});
