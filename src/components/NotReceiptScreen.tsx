import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useThemeContext } from "@/contexts/ThemeContext";
import { spacing, borderRadius, shadows, typography } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface NotReceiptScreenProps {
  onTryAgain?: () => void;
  onGoBack?: () => void;
  onRetry?: () => void;
  onViewReceipt?: () => void;
  onScanAnother?: () => void;
  onBackToHome?: () => void;
  onViewTrends?: () => void;
}

export const NotReceiptScreen: React.FC<NotReceiptScreenProps> = ({
  onTryAgain,
  onGoBack,
  onRetry,
  onViewReceipt,
  onScanAnother,
  onBackToHome,
  onViewTrends,
}) => {
  const { theme } = useThemeContext();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        },
      ]}
    >
      {/* Main Content Card */}
      <View
        style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}
      >
        {/* Icon Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.iconContainer}
        >
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <MaterialIcons
              name="sentiment-satisfied-alt"
              size={48}
              color={theme.colors.primary}
            />
          </View>
        </MotiView>

        {/* Title Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
          style={styles.titleSection}
        >
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Not a Receipt
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            That's interesting, but it's not quite what we're looking for
          </Text>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 400 }}
          style={styles.descriptionContainer}
        >
          <Text
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            We're designed to scan grocery receipts and help you track your
            spending. Try scanning a receipt from your local supermarket or
            grocery store.
          </Text>
        </MotiView>

        {/* Primary Action */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 500 }}
          style={styles.primaryActionContainer}
        >
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onTryAgain || onRetry}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="camera-alt"
              size={20}
              color={theme.colors.onPrimary}
              style={styles.buttonIcon}
            />
            <Text
              style={[
                styles.primaryButtonText,
                { color: theme.colors.onPrimary },
              ]}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>

      {/* Secondary Actions */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 600 }}
        style={styles.secondaryActionsContainer}
      >
        {/* Main Secondary Action */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={onViewReceipt}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="receipt"
            size={20}
            color={theme.colors.primary}
            style={styles.buttonIcon}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: theme.colors.primary },
            ]}
          >
            View Receipt
          </Text>
        </TouchableOpacity>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={onScanAnother}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="camera"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.quickActionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Scan Another
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={onBackToHome}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="home"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.quickActionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Back to Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={onViewTrends}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="trending-up"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.quickActionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              View Trends
            </Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  mainCard: {
    width: "100%",
    maxWidth: 400,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headline2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  descriptionContainer: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body2,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryActionContainer: {
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  primaryButtonText: {
    ...typography.label1,
    fontWeight: "600",
  },
  secondaryActionsContainer: {
    width: "100%",
    maxWidth: 400,
    gap: spacing.md,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    ...shadows.sm,
  },
  secondaryButtonText: {
    ...typography.label1,
    fontWeight: "500",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.xs,
  },
  quickActionText: {
    ...typography.caption1,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
