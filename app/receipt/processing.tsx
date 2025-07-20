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

  // Animation values
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

    // Start subtle pulse animation
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

    // Cleanup function
    return () => {
      pulseLoop.stop();
    };

    if (photoUri) {
      processReceipt();
    }
  }, [photoUri]);

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

    let progressInterval: NodeJS.Timeout | undefined;

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

      // Clear progress interval and set progress to 60
      clearInterval(progressInterval);
      setProgress(60);

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

      // Check if the result is NOT a receipt
      if (parsed.validation && parsed.validation.is_valid === false) {
        setNotAReceipt(true);
        setProcessingComplete(true);
        setProgress(100);
        return;
      }

      // Step 5: Saving Data
      setCurrentStep(4);
      setProgress(95);

      // Upload image to Supabase storage
      let imageUrl = photoUri;
      if (user?.id) {
        try {
          const fileName = `receipt_${Date.now()}.jpg`;
          const { data: uploadData, error: uploadError } =
            await storageService.uploadReceiptImage(
              photoUri!,
              fileName,
              user.id
            );

          if (uploadError) {
            console.warn("Failed to upload image:", uploadError);
          } else {
            imageUrl = uploadData?.path || photoUri;
          }
        } catch (uploadError) {
          console.warn("Image upload failed:", uploadError);
        }
      }

      // Create receipt in database
      const receiptData = {
        user_id: user?.id || "",
        store_name: parsed.store_name || "Unknown Store",
        total_amount: parsed.total || 0,
        date: parsed.date || new Date().toISOString().split("T")[0],
        image_url: imageUrl,
        ocr_data: parsed,
        savings_identified: 0,
        cashback_earned: 0,
      };

      const { data: savedReceipt, error: saveError } = await createReceipt(
        receiptData
      );

      if (saveError) {
        console.error("Failed to save receipt:", saveError);
        setError("Failed to save receipt data");
        setProcessingComplete(true);
        return;
      }

      setReceiptData(savedReceipt);
      setProgress(100);
      setProcessingComplete(true);

      // Convert OCR items to ReceiptItem format for correction modal
      const itemsForCorrection: ReceiptItem[] = parsed.items.map(
        (item: any, index: number) => ({
          id: `item_${index}`,
          name: item.name || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          category: item.category || "Other",
          confidence: item.confidence || 0.5,
        })
      );

      setCorrectedItems(itemsForCorrection);

      // Show correction modal if we have items, otherwise go to success
      setTimeout(() => {
        if (itemsForCorrection.length > 0) {
          setShowCorrectionModal(true);
        } else {
          setShowViralFeatures(true);
          setShowConfetti(true);
        }
      }, 500);
    } catch (error) {
      console.error("Processing error:", error);
      setError("Failed to process receipt. Please try again.");
      setProcessingComplete(true);
    } finally {
      clearTimeout(overallTimeout);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    setShowViralFeatures(false);
  };

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

  const handleRetry = () => {
    // Go back to camera instead of restarting processing
    router.push("/modals/camera");
  };

  const handleTryAgain = () => {
    // Reset and try processing again
    setProcessingComplete(false);
    setProgress(0);
    setCurrentStep(0);
    setNotAReceipt(false);
    setShowViralFeatures(false);
    setShowCorrectionModal(false);
    setShowInsights(false);
    setError(null);
    processReceipt();
  };

  const handleCorrectionSave = (items: ReceiptItem[]) => {
    console.log("Correction saved:", items);
    setCorrectedItems(items);
    setShowCorrectionModal(false);

    // Only show insights if we have items
    if (items && items.length > 0) {
      setTimeout(() => {
        console.log("Showing insights with items:", items.length);
        setShowInsights(true);
      }, 300);
    } else {
      // If no items, go straight to success
      setTimeout(() => {
        console.log("No items, going to success screen");
        setShowViralFeatures(true);
        setShowConfetti(true);
      }, 300);
    }
  };

  const handleInsightsDismiss = () => {
    setShowInsights(false);

    // Show viral features after insights
    setTimeout(() => {
      setShowViralFeatures(true);
      setShowConfetti(true);
    }, 300);
  };

  const getInsightData = (): InsightData => {
    console.log("Getting insight data for items:", correctedItems?.length || 0);

    // Ensure we have valid data
    if (!correctedItems || correctedItems.length === 0) {
      console.log("No corrected items, returning default data");
      return {
        totalSpent: 0,
        itemCount: 0,
        categories: {},
        storeName: receiptData?.store_name || "Unknown Store",
        date: receiptData?.date || new Date().toISOString().split("T")[0],
        items: [],
      };
    }

    const categories = correctedItems.reduce((acc, item) => {
      const category = item.category || "Other";
      acc[category] = (acc[category] || 0) + item.price * item.quantity;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalSpent: correctedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      itemCount: correctedItems.length,
      categories,
      storeName: receiptData?.store_name || "Unknown Store",
      date: receiptData?.date || new Date().toISOString().split("T")[0],
      items: correctedItems,
    };
  };

  if (!photoUri) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={theme.colors.error} />
          <Text style={[typography.headline2, styles.errorTitle]}>
            No Photo
          </Text>
          <Text style={[typography.body1, styles.errorMessage]}>
            No photo was provided for processing.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push("/modals/camera")}
            style={styles.errorButton}
          >
            Take Photo
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
        {/* Processing State */}
        {!processingComplete && (
          <View style={styles.processingContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[typography.headline1, styles.title]}>
                Processing Receipt
              </Text>
              <Text style={[typography.body1, styles.subtitle]}>
                We're analyzing your receipt to extract all the details
              </Text>
            </View>

            {/* Progress Card */}
            <Card
              style={[
                styles.progressCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                {/* Current Step */}
                <View style={styles.currentStepContainer}>
                  <Animated.View
                    style={[
                      styles.stepIcon,
                      {
                        transform: [{ scale: pulseAnim }],
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={processingSteps[currentStep]?.icon as any}
                      size={32}
                      color={theme.colors.onPrimaryContainer}
                    />
                  </Animated.View>

                  <View style={styles.stepInfo}>
                    <Text style={[typography.title2, styles.stepName]}>
                      {processingSteps[currentStep]?.name}
                    </Text>
                    <Text style={[typography.body2, styles.stepDescription]}>
                      {processingSteps[currentStep]?.description}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          }),
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[typography.caption1, styles.progressText]}>
                    {Math.round(progress)}% complete
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Steps Overview */}
            <Card
              style={[
                styles.stepsCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text style={[typography.title3, styles.stepsTitle]}>
                  Processing Steps
                </Text>
                <View style={styles.stepsList}>
                  {processingSteps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepIndicator,
                          {
                            backgroundColor:
                              index < currentStep
                                ? theme.colors.positive
                                : index === currentStep
                                ? theme.colors.primary
                                : theme.colors.surfaceVariant,
                          },
                        ]}
                      >
                        {index < currentStep ? (
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={theme.colors.onPrimary}
                          />
                        ) : (
                          <Text
                            style={[
                              typography.caption1,
                              { color: theme.colors.onPrimary },
                            ]}
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          typography.body2,
                          styles.stepText,
                          {
                            color:
                              index <= currentStep
                                ? theme.colors.onSurface
                                : theme.colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {step.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Error State */}
        {processingComplete && error && (
          <View style={styles.errorContainer}>
            <MaterialIcons
              name="error-outline"
              size={64}
              color={theme.colors.error}
            />
            <Text style={[typography.headline2, styles.errorTitle]}>
              Processing Failed
            </Text>
            <Text style={[typography.body1, styles.errorMessage]}>{error}</Text>

            <View style={styles.errorButtons}>
              <Button
                mode="outlined"
                onPress={handleRetry}
                style={styles.errorButton}
                icon="camera"
              >
                Try Again
              </Button>
              <Button
                mode="contained"
                onPress={handleTryAgain}
                style={styles.errorButton}
                icon="refresh"
              >
                Retry Processing
              </Button>
            </View>
          </View>
        )}

        {/* Results State */}
        {processingComplete && notAReceipt && (
          <NotReceiptScreen
            onRetry={handleRetry}
            onViewReceipt={handleViewReceipt}
            onScanAnother={handleScanAnother}
            onBackToHome={handleBackToHome}
            onViewTrends={handleGoToTrends}
          />
        )}

        {processingComplete && receiptData && !notAReceipt && (
          <ReceiptScanningExperience
            receiptData={receiptData}
            onSave={handleViewReceipt}
          />
        )}
      </Animated.View>

      {/* Action buttons are now handled by ReceiptScanningExperience component */}

      {/* Viral Features */}
      {showViralFeatures && receiptData && processingComplete && (
        <ViralFeaturesManager
          totalSpend={receiptData.total_amount}
          categoryBreakdown={receiptData.ocr_data.items.reduce(
            (acc: any, item: any) => {
              acc[item.category] =
                (acc[item.category] || 0) + (item.amount || item.price || 0);
              return acc;
            },
            {}
          )}
          savingsAmount={12.5}
          weekNumber={1}
        />
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <ConfettiCannon
          count={120}
          origin={{ x: screenWidth / 2, y: 0 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={2500}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}

      {/* Correction Modal */}
      {correctedItems.length > 0 && (
        <CorrectionModal
          visible={showCorrectionModal}
          onDismiss={() => setShowCorrectionModal(false)}
          onSave={handleCorrectionSave}
          items={correctedItems}
          storeName={receiptData?.store_name}
          total={receiptData?.total_amount}
        />
      )}

      {/* Insights Modal */}
      {showInsights && correctedItems.length > 0 && (
        <WeeklyInsights
          insightData={getInsightData()}
          onDismiss={handleInsightsDismiss}
        />
      )}
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
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  progressCard: {
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  currentStepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    ...shadows.sm,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    marginBottom: spacing.xs,
  },
  stepDescription: {
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    opacity: 0.7,
  },
  stepsCard: {
    ...shadows.md,
  },
  stepsTitle: {
    marginBottom: spacing.md,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: spacing.xl,
    opacity: 0.7,
  },
  errorButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  errorButton: {
    flex: 1,
  },
  actions: {
    marginTop: "auto",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  actionButtonsContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    borderColor: "#D1D1D6",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  textButton: {
    marginTop: spacing.sm,
  },
  buttonLabel: {
    fontWeight: "600",
    fontSize: 16,
    color: "#FFFFFF",
  },
  secondaryButtonLabel: {
    fontWeight: "500",
    fontSize: 16,
    color: "#007AFF",
  },
  textButtonLabel: {
    fontWeight: "500",
    fontSize: 16,
    color: "#86868B",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
