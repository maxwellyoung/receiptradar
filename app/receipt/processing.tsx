console.log("[LOG] app/receipt/processing.tsx loaded");
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text, Button, Card, ProgressBar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { ViralFeaturesManager } from "@/components/ViralFeaturesManager";
import {
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";

import { NotReceiptScreen } from "@/components/NotReceiptScreen";
import { ReceiptSuccessScreen } from "@/components/ReceiptSuccessScreen";
import { ReceiptScanningExperience } from "@/components/ReceiptScanningExperience";
import { CorrectionModal, ReceiptItem } from "@/components/CorrectionModal";
import { WeeklyInsights, InsightData } from "@/components/WeeklyInsights";

import { useThemeContext } from "@/contexts/ThemeContext";
// @ts-ignore: No types for confetti cannon
import ConfettiCannon from "react-native-confetti-cannon";
import { ocrService } from "@/services/ocr";
import { storageService } from "@/services/supabase";
import { ParserManager } from "@/parsers/ParserManager";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ProcessingStep {
  name: string;
  description: string;
  icon: string;
  duration: number;
  color: string;
}

const processingSteps: ProcessingStep[] = [
  {
    name: "Analyzing Image",
    description: "Detecting receipt boundaries and enhancing quality",
    icon: "crop-free",
    duration: 800,
    color: "#007AFF",
  },
  {
    name: "OCR Processing",
    description: "Extracting text and numbers from your receipt",
    icon: "text-recognition",
    duration: 1200,
    color: "#34C759",
  },
  {
    name: "Categorizing Items",
    description: "Organizing products by category",
    icon: "category",
    duration: 600,
    color: "#FF9500",
  },
  {
    name: "Calculating Totals",
    description: "Summing up your spending",
    icon: "calculate",
    duration: 400,
    color: "#AF52DE",
  },
  {
    name: "Saving Data",
    description: "Storing receipt information securely",
    icon: "save",
    duration: 500,
    color: "#FF6B35",
  },
];

export default function ReceiptProcessingScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { user } = useAuthContext();
  const { createReceipt } = useReceipts(user?.id || "");

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showViralFeatures, setShowViralFeatures] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notAReceipt, setNotAReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [correctedItems, setCorrectedItems] = useState<ReceiptItem[]>([]);

  // Enhanced animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start entrance animations with haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: interactions.transitions.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: interactions.transitions.normal,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: interactions.transitions.normal,
        useNativeDriver: true,
      }),
    ]).start();

    // Refined pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, []);

  // Animate progress bar with smooth transitions
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: interactions.transitions.fast,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Animate current step with haptic feedback
  useEffect(() => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.timing(stepAnim, {
      toValue: currentStep,
      duration: interactions.transitions.fast,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const processReceipt = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setCurrentStep(0);

    // Overall timeout for the entire processing
    const overallTimeout = setTimeout(() => {
      if (isProcessing) {
        setError("Processing took too long. Please try again.");
        setProcessingComplete(true);
        setIsProcessing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 30000); // 30 second overall timeout

    try {
      // Step 1: Analyzing Image
      setCurrentStep(0);
      setProgress(10);
      await new Promise((resolve) =>
        setTimeout(resolve, processingSteps[0].duration)
      );

      // Step 2: OCR Processing - This is where the real work happens
      setCurrentStep(1);
      setProgress(30);

      // Show progress during OCR processing
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 50) return prev + 2;
          return prev;
        });
      }, 500);

      // Upload image to storage
      const uploadResult = await storageService.uploadReceiptImage(
        photoUri,
        "receipt.jpg",
        user?.id || "anonymous"
      );

      if (uploadResult.error) {
        clearInterval(progressInterval);
        clearTimeout(overallTimeout);
        setError("Failed to upload image. Please try again.");
        setProcessingComplete(true);
        setIsProcessing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // Process with OCR
      const ocrResult = await ocrService.parseReceipt(photoUri);

      clearInterval(progressInterval);

      // Step 3: Categorizing Items
      setCurrentStep(2);
      setProgress(60);
      await new Promise((resolve) =>
        setTimeout(resolve, processingSteps[2].duration)
      );

      // Step 4: Calculating Totals
      setCurrentStep(3);
      setProgress(80);
      await new Promise((resolve) =>
        setTimeout(resolve, processingSteps[3].duration)
      );

      // Step 5: Saving Data
      setCurrentStep(4);
      setProgress(90);

      // Create receipt in database using OCR result directly
      const receiptResult = await createReceipt({
        store_name: ocrResult.store_name || "Unknown Store",
        total_amount: ocrResult.total || 0,
        date: new Date().toISOString(),
        image_url: uploadResult.data?.fullPath || "",
        ocr_data: ocrResult,
      });

      if (receiptResult.error) {
        clearTimeout(overallTimeout);
        setError("Failed to save receipt. Please try again.");
        setProcessingComplete(true);
        setIsProcessing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setProgress(100);
      await new Promise((resolve) =>
        setTimeout(resolve, processingSteps[4].duration)
      );

      // Success!
      clearTimeout(overallTimeout);
      setReceiptData({
        ...receiptResult.data,
        items: ocrResult.items || [],
      });
      setProcessingComplete(true);
      setIsProcessing(false);
      setShowConfetti(true);

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } catch (error) {
      clearTimeout(overallTimeout);
      console.error("Processing error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setProcessingComplete(true);
      setIsProcessing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Start processing when component mounts
  useEffect(() => {
    processReceipt();
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowViralFeatures(false);
    router.replace("/(tabs)");
  };

  const handleViewReceipt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/receipt/${receiptData.id}`);
  };

  const handleScanAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/modals/camera");
  };

  const handleGoToTrends = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)/trends");
  };

  const handleBackToHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setProcessingComplete(false);
    setProgress(0);
    setCurrentStep(0);
    processReceipt();
  };

  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotAReceipt(false);
    setError(null);
    setProcessingComplete(false);
    setProgress(0);
    setCurrentStep(0);
    processReceipt();
  };

  const handleCorrectionSave = (items: ReceiptItem[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCorrectedItems(items);
    setShowCorrectionModal(false);
    // Here you would typically update the receipt with corrected items
  };

  const handleInsightsDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInsights(false);
  };

  const getInsightData = (): InsightData => {
    return {
      totalSpent: receiptData?.total_amount || 0,
      savings: 0,
      weekNumber: 1,
    };
  };

  // Show different screens based on state
  if (notAReceipt) {
    return (
      <NotReceiptScreen
        onTryAgain={handleTryAgain}
        onGoBack={handleBackToHome}
      />
    );
  }

  if (processingComplete && receiptData && !showViralFeatures) {
    return (
      <ReceiptSuccessScreen
        receipt={receiptData}
        onViewReceipt={handleViewReceipt}
        onScanAnother={handleScanAnother}
        onViewTrends={handleGoToTrends}
        onCorrection={() => setShowCorrectionModal(true)}
      />
    );
  }

  if (showViralFeatures) {
    return (
      <ViralFeaturesManager
        receiptData={receiptData}
        onContinue={handleContinue}
        onViewReceipt={handleViewReceipt}
      />
    );
  }

  if (showCorrectionModal) {
    return (
      <CorrectionModal
        visible={showCorrectionModal}
        items={receiptData?.items || []}
        onSave={handleCorrectionSave}
        onCancel={() => setShowCorrectionModal(false)}
      />
    );
  }

  if (showInsights) {
    return (
      <WeeklyInsights
        insightData={getInsightData()}
        onDismiss={handleInsightsDismiss}
      />
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Processing Receipt
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Analyzing your purchase data
          </Text>
        </View>

        {/* Enhanced Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress / 100}
              color={
                processingSteps[currentStep]?.color || theme.colors.primary
              }
              style={[styles.progressBar, materialShadows.subtle]}
            />
            <Text
              style={[styles.progressText, { color: theme.colors.onSurface }]}
            >
              {progress}% Complete
            </Text>
          </View>
        </View>

        {/* Enhanced Current Step */}
        {currentStep < processingSteps.length && (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: stepAnim,
                transform: [{ scale: stepAnim }],
              },
            ]}
          >
            <Card
              style={[
                styles.stepCard,
                {
                  backgroundColor: theme.colors.surface,
                  ...materialShadows.medium,
                },
              ]}
            >
              <Card.Content style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Animated.View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor:
                          (processingSteps[currentStep]?.color ||
                            theme.colors.primary) + "15",
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={processingSteps[currentStep].icon as any}
                      size={32}
                      color={
                        processingSteps[currentStep]?.color ||
                        theme.colors.primary
                      }
                    />
                  </Animated.View>
                  <View style={styles.stepInfo}>
                    <Text
                      style={[
                        styles.stepName,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {processingSteps[currentStep].name}
                    </Text>
                    <Text
                      style={[
                        styles.stepDescription,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {processingSteps[currentStep].description}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}

        {/* Enhanced Error State */}
        {error && (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <MaterialIcons name="error" size={48} color={theme.colors.error} />
            <Text
              style={[styles.errorTitle, { color: theme.colors.onSurface }]}
            >
              Processing Error
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {error}
            </Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          </Animated.View>
        )}

        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: screenWidth / 2, y: screenHeight }}
            autoStart={true}
            colors={["#34C759", "#007AFF", "#FF6B35", "#AF52DE"]}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.headline2,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.body2,
    fontWeight: "600",
  },
  stepContainer: {
    marginBottom: spacing.lg,
  },
  stepCard: {
    borderRadius: borderRadius.lg,
  },
  stepContent: {
    padding: spacing.lg,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    ...typography.title2,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.body2,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    ...typography.title2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  errorMessage: {
    ...typography.body1,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
  },
});
