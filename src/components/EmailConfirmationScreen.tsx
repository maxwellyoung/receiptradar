import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { spacing, borderRadius, shadows } from "@/constants/theme";
import { supabase } from "@/services/supabase";
import { useThemeContext } from "@/contexts/ThemeContext";
import { logger } from "@/utils/logger";

const { width: screenWidth } = Dimensions.get("window");

interface EmailConfirmationScreenProps {
  email: string;
  onEmailConfirmed?: () => void;
  onResendEmail?: () => void;
  onBackToSignIn?: () => void;
}

export const EmailConfirmationScreen: React.FC<
  EmailConfirmationScreenProps
> = ({ email, onEmailConfirmed, onResendEmail, onBackToSignIn }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { theme } = useThemeContext();

  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw error;
      }

      // Start countdown (60 seconds)
      setResendCountdown(60);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert(
        "Email Sent",
        "A new confirmation email has been sent to your inbox.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      logger.error("Resend email error", error as Error, {
        component: "EmailConfirmationScreen",
      });
      Alert.alert(
        "Error",
        error.message ||
          "Failed to resend confirmation email. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckEmail = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Check if user is confirmed
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (user?.email_confirmed_at) {
        onEmailConfirmed?.();
      } else {
        Alert.alert(
          "Email Not Confirmed",
          "Please check your email and click the confirmation link before continuing.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      logger.error("Check email error", error as Error, {
        component: "EmailConfirmationScreen",
      });
      Alert.alert("Error", "Failed to check email status. Please try again.");
    }
  };

  const styles = getStyles(theme);

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
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>We've sent a confirmation link to</Text>
          <Text style={styles.email}>{email}</Text>
        </MotiView>

        {/* Instructions Section */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 300 }}
          style={styles.instructions}
        >
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Open your email app and find the message from ReceiptRadar
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Click the "Confirm Email" button in the email
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Return to this app and tap "I've Confirmed My Email"
            </Text>
          </View>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 500 }}
          style={styles.actions}
        >
          {/* Primary Action */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCheckEmail}
            activeOpacity={0.8}
          >
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "timing", duration: 100 }}
              style={styles.buttonContent}
            >
              <Text style={styles.primaryButtonText}>
                I've Confirmed My Email
              </Text>
            </MotiView>
          </TouchableOpacity>

          {/* Resend Email Button */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (isResending || resendCountdown > 0) && styles.buttonDisabled,
            ]}
            onPress={handleResendEmail}
            disabled={isResending || resendCountdown > 0}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              {isResending
                ? "Sending..."
                : resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : "Resend Confirmation Email"}
            </Text>
          </TouchableOpacity>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToSignIn}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    header: {
      marginBottom: spacing.xxxl,
      alignItems: "center",
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    icon: {
      fontSize: 36,
    },
    title: {
      fontSize: 28,
      fontWeight: "300",
      textAlign: "center",
      marginBottom: spacing.sm,
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    email: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
      color: theme.colors.text,
    },
    instructions: {
      marginBottom: spacing.xxxl,
    },
    instructionItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.lg,
    },
    instructionNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      color: theme.colors.onPrimary,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 24,
      marginRight: spacing.md,
      marginTop: 2,
    },
    instructionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "400",
      color: theme.colors.onSurface,
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    actions: {
      width: "100%",
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    secondaryButton: {
      marginTop: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: "center",
    },
    buttonDisabled: {
      backgroundColor: theme.colors.surfaceDisabled,
    },
    buttonContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: 0.1,
    },
    secondaryButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    backButton: {
      marginTop: spacing.xl,
    },
    backButtonText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      fontWeight: "500",
    },
  });
