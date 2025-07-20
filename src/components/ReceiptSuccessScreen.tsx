import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useThemeContext } from "@/contexts/ThemeContext";
import { spacing, borderRadius, shadows, typography } from "@/constants/theme";

import { useRouter } from "expo-router";
import { SimpleEffects } from "./SimpleEffects";
import { Card, Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface ReceiptSuccessScreenProps {
  receiptData: any;
  photoUri: string;
  radarMood: any;
  onViewReceipt: () => void;
  onScanAnother: () => void;
  onBackToHome: () => void;
  onViewTrends: () => void;
}

export const ReceiptSuccessScreen: React.FC<ReceiptSuccessScreenProps> = ({
  receiptData,
  photoUri,
  radarMood,
  onViewReceipt,
  onScanAnother,
  onBackToHome,
  onViewTrends,
}) => {
  const { theme } = useThemeContext();
  const router = useRouter();
  const [showEffects, setShowEffects] = useState(false);
  const [effectType, setEffectType] = useState<"confetti" | "particles">(
    "confetti"
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

    // Trigger receipt processed effect
    setTimeout(() => {
      setEffectType("confetti");
      setShowEffects(true);
    }, 1000);
  }, []);

  const handleViewReceipt = () => {
    if (receiptData?.id) {
      router.push(`/receipt/${receiptData.id}`);
    }
  };

  const handleScanAnother = () => {
    router.push("/modals/camera");
  };

  const handleGoToTrends = () => {
    router.push("/(tabs)/trends");
  };

  const handleBackToHome = () => {
    router.push("/(tabs)");
  };

  // Demo function to show correction flow
  const handleDemoCorrection = () => {
    // This would normally be triggered after OCR processing
    // For demo purposes, we'll simulate the flow
    console.log("Demo: Show correction modal");
  };

  return (
    <View style={styles.container}>
      <SimpleEffects
        visible={showEffects}
        effect={effectType}
        color="#FFD700"
        onComplete={() => setShowEffects(false)}
      />
      <Animated.View
        style={[
          styles.animatedContainer,
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
          {/* Success Header */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 200 }}
            style={styles.successHeader}
          >
            <View
              style={[
                styles.successIcon,
                { backgroundColor: theme.colors.positive },
              ]}
            >
              <MaterialIcons
                name="check-circle"
                size={32}
                color={theme.colors.onPrimary}
              />
            </View>
            <Text
              style={[styles.successTitle, { color: theme.colors.onSurface }]}
            >
              Receipt Processed
            </Text>
          </MotiView>

          {/* Receipt Image */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 300 }}
            style={styles.receiptContainer}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: photoUri }} style={styles.receiptImage} />
              <View
                style={[
                  styles.successOverlay,
                  { backgroundColor: theme.colors.positive + "CC" },
                ]}
              >
                <MaterialIcons
                  name="check"
                  size={24}
                  color={theme.colors.onPrimary}
                />
              </View>
            </View>
          </MotiView>

          {/* Receipt Details */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 400 }}
            style={[
              styles.detailsContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Store
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {receiptData.store_name}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Total
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.positive }]}
              >
                ${receiptData.total_amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Date
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {receiptData.date}
              </Text>
            </View>
          </MotiView>

          {/* Radar's Reaction */}

          {/* Success Message */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 600 }}
            style={styles.messageContainer}
          >
            <Text
              style={[styles.successMessage, { color: theme.colors.positive }]}
            >
              Receipt saved successfully
            </Text>
          </MotiView>
        </View>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 700 }}
          style={styles.actionsContainer}
        >
          {/* Primary Action */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleViewReceipt}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="receipt"
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
              View Receipt
            </Text>
          </TouchableOpacity>

          {/* Secondary Actions Row */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={handleScanAnother}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="camera"
                size={18}
                color={theme.colors.primary}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Scan Another
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={handleGoToTrends}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="trending-up"
                size={18}
                color={theme.colors.primary}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                View Trends
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tertiary Action */}
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleBackToHome}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="home"
              size={18}
              color={theme.colors.onSurfaceVariant}
              style={styles.buttonIcon}
            />
            <Text
              style={[
                styles.tertiaryButtonText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </MotiView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
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
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    ...shadows.sm,
  },
  successTitle: {
    ...typography.headline3,
    fontWeight: "600",
  },
  receiptContainer: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  receiptImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsContainer: {
    width: "100%",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body2,
    fontWeight: "500",
  },
  detailValue: {
    ...typography.body1,
    fontWeight: "600",
  },
  radarContainer: {
    marginBottom: spacing.lg,
  },
  messageContainer: {
    alignItems: "center",
  },
  successMessage: {
    ...typography.body1,
    fontWeight: "600",
    textAlign: "center",
  },
  actionsContainer: {
    width: "100%",
    maxWidth: 400,
    gap: spacing.md,
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
  secondaryActionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
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
    ...typography.label2,
    fontWeight: "500",
  },
  tertiaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tertiaryButtonText: {
    ...typography.body2,
    fontWeight: "500",
  },
});
