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
import { spacing } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { ViralFeaturesManager } from "@/components/ViralFeaturesManager";
import { RadarWorm } from "@/components/RadarWorm";
import { NotReceiptScreen } from "@/components/NotReceiptScreen";
import { ReceiptSuccessScreen } from "@/components/ReceiptSuccessScreen";
import { ProcessingScreen } from "@/components/ProcessingScreen";
import { useRadarMood } from "@/hooks/useRadarMood";
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
}

const processingSteps: ProcessingStep[] = [
  {
    name: "Analyzing Image",
    description: "Detecting receipt boundaries",
    icon: "crop-free",
  },
  {
    name: "OCR Processing",
    description: "Extracting text and numbers",
    icon: "text-recognition",
  },
  {
    name: "Categorizing Items",
    description: "Organizing by product type",
    icon: "category",
  },
  {
    name: "Calculating Totals",
    description: "Summing up your spend",
    icon: "calculate",
  },
  {
    name: "Saving Data",
    description: "Storing receipt information",
    icon: "save",
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Radar mood calculation
  const radarMood = useRadarMood({
    receiptData,
    categoryBreakdown: receiptData?.ocr_data?.items?.reduce(
      (acc: any, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + (item.price || 0);
        return acc;
      },
      {}
    ),
    totalSpend: receiptData?.total_amount,
    isProcessing: !processingComplete,
    isError: false,
    isDuplicate: false,
  });

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
    Animated.loop(
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
    ).start();

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

  const processReceipt = async () => {
    try {
      // Step 1: Analyzing Image
      setCurrentStep(0);
      setProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: OCR Processing - This is where the real work happens
      setCurrentStep(1);
      setProgress(30);

      // Check if OCR service is available
      const isServiceHealthy = await ocrService.healthCheck();
      if (!isServiceHealthy) {
        console.warn("OCR service unavailable, using fallback");
      }

      const parsed = await ocrService.parseReceipt(photoUri!);

      // Step 3: Categorizing Items
      setCurrentStep(2);
      setProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 4: Calculating Totals
      setCurrentStep(3);
      setProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 300));

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

          if (uploadData && !uploadError) {
            imageUrl =
              (await storageService.getReceiptImageUrl(uploadData.path)) ||
              photoUri;
            console.log("Image uploaded successfully:", imageUrl);
          } else {
            console.warn("Image upload failed, using local URI:", uploadError);
          }
        } catch (error) {
          console.warn("Image upload error, using local URI:", error);
        }
      }

      // Map parsed data to expected format for createReceipt
      const fallbackDate = new Date().toISOString().slice(0, 10);
      const dateString =
        typeof parsed.date === "string" && parsed.date
          ? parsed.date
          : fallbackDate;

      const receiptToSave = {
        store_name: parsed.store_name || "Unknown Store",
        total_amount: parsed.total || 0,
        date: dateString,
        image_url: imageUrl,
        ocr_data: {
          items: parsed.items || [],
          subtotal: parsed.subtotal,
          tax: parsed.tax,
          receipt_number: parsed.receipt_number,
          validation: parsed.validation || {
            is_valid: true,
            confidence_score: 0.8,
            issues: [],
          },
          processing_time: parsed.processing_time,
        },
        savings_identified: 0,
        cashback_earned: 0,
      };

      setReceiptData(receiptToSave);

      // Save receipt to local database
      if (user?.id) {
        const { error } = await createReceipt(receiptToSave);
        if (error) {
          console.error("Failed to save receipt locally:", error);
        }
      }

      // In the background, save to OCR service for price intelligence
      ocrService.saveReceipt(receiptToSave).catch((error) => {
        console.error("Failed to save receipt to OCR service:", error);
      });

      setProgress(100);
      setProcessingComplete(true);

      // Show confetti after a short delay
      setTimeout(() => {
        setShowConfetti(true);
      }, 500);

      // Show viral features after confetti
      setTimeout(() => {
        setShowViralFeatures(true);
      }, 2000);
    } catch (error) {
      console.error("Error processing receipt:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process receipt. Please try again.",
        [{ text: "OK", onPress: handleRetry }]
      );
    }
  };

  const handleContinue = () => {
    setShowViralFeatures(false);
    processReceipt();
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
    router.push("/(tabs)");
  };

  const handleRetry = () => {
    setProcessingComplete(false);
    setProgress(0);
    setCurrentStep(0);
    setNotAReceipt(false);
    setShowViralFeatures(false);
    processReceipt();
  };

  if (!photoUri) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text>No photo provided</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <ProcessingScreen
            currentStep={currentStep}
            progress={progress}
            processingSteps={processingSteps}
          />
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
          <ReceiptSuccessScreen
            receiptData={receiptData}
            photoUri={photoUri}
            radarMood={radarMood}
            onViewReceipt={handleViewReceipt}
            onScanAnother={handleScanAnother}
            onBackToHome={handleBackToHome}
            onViewTrends={handleGoToTrends}
          />
        )}
      </Animated.View>

      {/* Action Buttons - Only show for successful receipts */}
      {processingComplete && receiptData && !notAReceipt && (
        <View style={styles.actions}>
          <View style={styles.actionButtonsContainer}>
            <Button
              mode="contained"
              onPress={handleViewReceipt}
              style={styles.primaryButton}
              labelStyle={styles.buttonLabel}
              icon="receipt"
            >
              View Receipt
            </Button>

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleScanAnother}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonLabel}
                icon="camera"
              >
                Scan Another
              </Button>

              <Button
                mode="outlined"
                onPress={handleGoToTrends}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonLabel}
                icon="chart-line"
              >
                View Trends
              </Button>
            </View>

            <Button
              mode="text"
              onPress={handleBackToHome}
              style={styles.textButton}
              labelStyle={styles.textButtonLabel}
              icon="home"
            >
              Back to Home
            </Button>
          </View>
        </View>
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  actions: {
    marginTop: "auto",
    paddingTop: 24,
    paddingBottom: 24,
  },
  actionButtonsContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  secondaryButton: {
    borderColor: "#D1D1D6",
    borderRadius: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  textButton: {
    marginTop: 8,
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
    gap: 12,
  },
});
