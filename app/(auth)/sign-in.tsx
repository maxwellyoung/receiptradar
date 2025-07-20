import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";
import { AnimatePresence, MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { AppleSignInButton } from "@/components/AppleSignInButton";
import {
  lightTheme as theme,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function SignInScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuthContext();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (isSignUp && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLocalError(null);
    setLocalLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, email.split("@")[0] || "User");
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "An unexpected error occurred";
      setLocalError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAppleSuccess = () => {
    // onAuthSuccess is no longer needed, navigation is handled by AuthGuard
  };

  const handleAppleError = (error: any) => {
    console.error("Apple Sign-In error:", error);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await resetPassword(forgotPasswordEmail);
      Alert.alert(
        "Password Reset Sent",
        "Check your email for a password reset link. You can close this dialog and try signing in again once you've reset your password."
      );
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (err: any) {
      const errorMessage =
        err?.message || "Failed to send password reset email";
      Alert.alert("Error", errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 100 }}
          style={styles.header}
        >
          <Text style={styles.title}>
            {isSignUp ? "Create Account" : "Welcome"}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Begin your journey with ReceiptRadar"
              : "Sign in to continue"}
          </Text>
        </MotiView>

        {/* Form Section */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 300 }}
          style={styles.form}
        >
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "email" && styles.inputFocused,
              ]}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "password" && styles.inputFocused,
              ]}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
            />
            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Confirm Password Input */}
          <AnimatePresence>
            {isSignUp && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "timing", duration: 300 }}
                style={styles.inputContainer}
              >
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === "confirmPassword" && styles.inputFocused,
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
              </MotiView>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {localError && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: "timing", duration: 200 }}
                style={styles.errorContainer}
              >
                <Text style={styles.errorText}>{localError}</Text>
                {localError.includes("Invalid email or password") && (
                  <TouchableOpacity
                    style={styles.forgotPasswordLink}
                    onPress={() => setShowForgotPassword(true)}
                  >
                    <Text style={styles.forgotPasswordLinkText}>
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                )}
              </MotiView>
            )}
          </AnimatePresence>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              localLoading && styles.buttonDisabled,
            ]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleSubmit();
            }}
            disabled={localLoading}
            activeOpacity={0.8}
          >
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: localLoading ? 0.98 : 1 }}
              transition={{ type: "timing", duration: 100 }}
              style={styles.buttonContent}
            >
              <Text style={styles.primaryButtonText}>
                {localLoading
                  ? "Please wait..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </Text>
            </MotiView>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Apple Sign-In Button */}
          <AppleSignInButton
            onSuccess={handleAppleSuccess}
            onError={handleAppleError}
            style={styles.appleButton}
          />

          {/* Switch Mode Button */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsSignUp(!isSignUp);
              setLocalError(null);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text style={styles.switchButtonTextHighlight}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* Forgot Password Modal */}
        <Modal
          visible={showForgotPassword}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowForgotPassword(false);
            setForgotPasswordEmail("");
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail("");
              }}
            />
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                Enter your email address and we'll send you a password reset
                link.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                  }}
                  disabled={forgotPasswordLoading}
                >
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButtonPrimary,
                    forgotPasswordLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                >
                  <Text style={styles.modalButtonPrimaryText}>
                    {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                  </Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    paddingHorizontal: spacing.md - 1,
    paddingVertical: spacing.md - 1,
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outline,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  appleButton: {
    width: "100%",
    height: 50,
  },
  switchButton: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  switchButtonText: {
    color: theme.colors.onSurfaceVariant,
  },
  switchButtonTextHighlight: {
    color: theme.colors.primary,
    fontWeight: "bold",
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: "90%",
    maxWidth: 400,
    margin: spacing.lg,
    ...shadows.large,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceVariant,
    color: theme.colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonSecondaryText: {
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: "500",
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordLink: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  forgotPasswordLinkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
