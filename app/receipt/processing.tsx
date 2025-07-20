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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ProcessingStep {
  name: string;
  description: string;
  icon: string;
  duration: number;
}

const processingSteps: ProcessingStep[] = [
  {
    name: "Analyzing Image",
    description: "Detecting receipt boundaries and enhancing quality",
    icon: "crop-free",
    duration: 800,
  },
  {
    name: "OCR Processing",
    description: "Extracting text and numbers from your receipt",
    icon: "text-recognition",
    duration: 1200,
  },
  {
    name: "Categorizing Items",
    description: "Organizing products by category",
    icon: "category",
    duration: 600,
  },
  {
    name: "Calculating Totals",
    description: "Summing up your spending",
    icon: "calculate",
    duration: 400,
  },
  {
    name: "Saving Data",
    description: "Storing receipt information securely",
    icon: "save",
    duration: 500,
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

  // Refined animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
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

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Animate current step
  useEffect(() => {
    Animated.timing(stepAnim, {
      toValue: currentStep,
      duration: 300,
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

      // Check if OCR service is available with timeout
      let isServiceHealthy = false;
      try {
        isServiceHealthy = await Promise.race([
          ocrService.healthCheck(),
          new Promise<boolean>(
            (resolve) => setTimeout(() => resolve(false), 5000) // 5 second timeout
          ),
        ]);
      } catch (error) {
        console.warn("OCR health check failed:", error);
        isServiceHealthy = false;
      }

      if (!isServiceHealthy) {
        console.warn("OCR service unavailable, using fallback");
      }

      // Parse receipt with timeout
      let parsed: any;
      try {
        parsed = await Promise.race([
          ocrService.parseReceipt(photoUri!),
          new Promise(
            (_, reject) =>
              setTimeout(
                () => reject(new Error("OCR processing timeout")),
                15000
              ) // 15 second timeout
          ),
        ]);
      } catch (error) {
        console.error("OCR processing failed:", error);
        // Use fallback data if OCR fails
        parsed = {
          store_name: "Unknown Store",
          total: 0,
          date: new Date().toISOString().split("T")[0],
          items: [],
          validation: {
            is_valid: true,
            confidence_score: 0.5,
            issues: ["OCR service unavailable"],
          },
          processing_time: 0,
        };
      }

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

      // Save to database
      try {
        const receipt = await createReceipt({
          store_name: parsed.store_name,
          total_amount: parsed.total,
          date: parsed.date,
          ocr_data: parsed,
        });

        setReceiptData(receipt);
        setProgress(100);
        setProcessingComplete(true);
        setShowConfetti(true);

        // Auto-hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);

        clearTimeout(overallTimeout);
      } catch (error) {
        console.error("Failed to save receipt:", error);
        setError("Failed to save receipt. Please try again.");
        setProcessingComplete(true);
      }
    } catch (error) {
      console.error("Processing error:", error);
      setError("An error occurred during processing. Please try again.");
      setProcessingComplete(true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (photoUri) {
      processReceipt();
    }
  }, [photoUri]);

  const handleContinue = () => {
    setShowViralFeatures(false);
    router.push("/");
  };

  const handleViewReceipt = () => {
    if (receiptData) {
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
    router.push("/");
  };

  const handleRetry = () => {
    setError(null);
    setProcessingComplete(false);
    setCurrentStep(0);
    setProgress(0);
    processReceipt();
  };

  const handleTryAgain = () => {
    setNotAReceipt(false);
    setError(null);
    setProcessingComplete(false);
    setCurrentStep(0);
    setProgress(0);
    processReceipt();
  };

  const handleCorrectionSave = (items: ReceiptItem[]) => {
    setCorrectedItems(items);
    setShowCorrectionModal(false);
    setShowInsights(true);
  };

  const handleInsightsDismiss = () => {
    setShowInsights(false);
    setShowViralFeatures(true);
  };

  const getInsightData = (): InsightData => {
    if (!receiptData) {
      return {
        totalSpent: 0,
        itemCount: 0,
        categories: {},
        storeName: "Unknown Store",
        date: new Date().toISOString().split("T")[0],
        items: [],
      };
    }

    const categories: { [key: string]: number } = {};
    receiptData.items?.forEach((item: any) => {
      const category = item.category || "Uncategorized";
      categories[category] = (categories[category] || 0) + item.price;
    });

    return {
      totalSpent: receiptData.total,
      itemCount: receiptData.items?.length || 0,
      categories,
      storeName: receiptData.store_name,
      date: receiptData.date,
      items: receiptData.items || [],
    };
  };

  if (notAReceipt) {
    return (
      <NotReceiptScreen
        onTryAgain={handleTryAgain}
        onGoBack={handleBackToHome}
      />
    );
  }

  if (
    processingComplete &&
    receiptData &&
    !showViralFeatures &&
    !showInsights
  ) {
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
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
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

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress / 100}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text
              style={[styles.progressText, { color: theme.colors.onSurface }]}
            >
              {progress}% Complete
            </Text>
          </View>
        </View>

        {/* Current Step */}
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
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Animated.View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor: theme.colors.primary + "15",
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={processingSteps[currentStep].icon as any}
                      size={32}
                      color={theme.colors.primary}
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

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
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
          </View>
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
    ...shadows.md,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    ...typography.headline3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  errorMessage: {
    ...typography.body1,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  retryButton: {
    borderRadius: borderRadius.md,
  },
});
