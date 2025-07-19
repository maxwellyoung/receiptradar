console.log("[LOG] app/receipt/processing.tsx loaded");
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Image, Alert, Animated } from "react-native";
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
import { useRadarMood } from "@/hooks/useRadarMood";
import { useThemeContext } from "@/contexts/ThemeContext";
// @ts-ignore: No types for confetti cannon
import ConfettiCannon from "react-native-confetti-cannon";
import { ocrService } from "@/services/ocr";
import { storageService } from "@/services/supabase";
import { ParserManager } from "@/parsers/ParserManager";

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
    if (photoUri) {
      processReceipt();
    }
  }, [photoUri]);

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
          validation: parsed.validation,
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
        console.error("Failed to save receipt to backend:", error);
      });

      // Analyze savings opportunities in background
      if (parsed.items && parsed.items.length > 0) {
        ocrService
          .analyzeSavings(
            parsed.items,
            parsed.store_name?.toLowerCase().replace(/\s+/g, "_") || "unknown",
            user?.id || "anonymous"
          )
          .then((savingsAnalysis) => {
            if (savingsAnalysis.total_savings > 0) {
              setReceiptData((prev: any) => ({
                ...prev,
                savings_identified: savingsAnalysis.total_savings,
                cashback_earned: savingsAnalysis.cashback_available,
              }));
            }
          })
          .catch(console.error);
      }

      setProcessingComplete(true);
      setProgress(100);

      // Show viral features after a short delay
      setTimeout(() => {
        setShowViralFeatures(true);
      }, 1000);
    } catch (error) {
      console.error("Receipt processing error:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process receipt. Please try again.",
        [
          { text: "Retry", onPress: handleRetry },
          { text: "Cancel", onPress: () => router.back() },
        ]
      );
    }
  };

  const handleContinue = () => {
    setShowConfetti(true);
    setShowViralFeatures(false);
    router.replace("/(tabs)");
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setProgress(0);
    setProcessingComplete(false);
    setReceiptData(null);
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.lottieAnimation}>
          <MaterialIcons
            name="hourglass-empty"
            size={64}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="titleLarge" style={styles.processingText}>
          The worm is chewing...
        </Text>
        <ProgressBar
          progress={progress / 100}
          style={styles.progressBar}
          color={theme.colors.primary}
        />
      </View>

      {/* Receipt Image */}
      <Card style={styles.imageCard}>
        <Card.Content>
          <Image source={{ uri: photoUri }} style={styles.receiptImage} />
        </Card.Content>
      </Card>

      {/* Processing Progress */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <MaterialIcons
              name={processingSteps[currentStep]?.icon as any}
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={styles.stepTitle}>
              {processingSteps[currentStep]?.name}
            </Text>
          </View>

          <Text variant="bodyMedium" style={styles.stepDescription}>
            {processingSteps[currentStep]?.description}
          </Text>

          {/* Radar during processing */}
          {!processingComplete && (
            <RadarWorm
              mood={radarMood.mood}
              message={radarMood.message}
              visible={true}
              size="small"
              showSpeechBubble={radarMood.showSpeechBubble}
              animated={true}
            />
          )}

          <Text variant="bodySmall" style={styles.progressText}>
            {Math.round(progress)}% complete
          </Text>
        </Card.Content>
      </Card>

      {/* Results */}
      {processingComplete && notAReceipt && (
        <Card
          style={[
            styles.resultsCard,
            {
              borderColor: "#FFB300",
              borderWidth: 2,
              backgroundColor: "#FFF8E1",
            },
          ]}
        >
          <Card.Content>
            <View style={styles.resultsHeader}>
              <MaterialIcons
                name="sentiment-very-satisfied"
                size={28}
                color="#FFB300"
              />
              <Text variant="titleMedium" style={styles.resultsTitle}>
                Oops! Not a Receipt 🚀
              </Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                textAlign: "center",
                marginVertical: 12,
                color: "#FF9800",
                fontWeight: "700",
              }}
            >
              That looks fun, but it's not a receipt!
            </Text>
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                color: "#FF9800",
                marginBottom: 12,
              }}
            >
              Try scanning a real grocery receipt. (Cats, memes, and selfies are
              always welcome, but they won't help your budget!)
            </Text>
            <Button
              mode="contained"
              onPress={handleRetry}
              style={[styles.continueButton, { backgroundColor: "#FFB300" }]}
              contentStyle={styles.buttonContent}
              labelStyle={{ fontWeight: "700", fontSize: 18, color: "#fff" }}
            >
              Try Again
            </Button>
          </Card.Content>
        </Card>
      )}
      {processingComplete && receiptData && !notAReceipt && (
        <Card style={styles.resultsCard}>
          <Card.Content>
            <View style={styles.resultsHeader}>
              <MaterialIcons name="check-circle" size={24} color="#10B981" />
              <Text variant="titleMedium" style={styles.resultsTitle}>
                🎉 Receipt Zapped! 🎉
              </Text>
            </View>

            {/* Radar's Reaction */}
            <RadarWorm
              mood={radarMood.mood}
              message={radarMood.message}
              totalSpend={receiptData.total_amount}
              categoryBreakdown={receiptData.ocr_data?.items?.reduce(
                (acc: any, item: any) => {
                  acc[item.category] =
                    (acc[item.category] || 0) + (item.price || 0);
                  return acc;
                },
                {}
              )}
              visible={true}
              size="medium"
              showSpeechBubble={radarMood.showSpeechBubble}
              onPress={() => {
                // Optional: Add interaction like sharing or more details
                console.log("Radar was tapped!");
              }}
            />

            <View style={styles.resultsInfo}>
              <Text variant="bodyMedium">
                <Text style={{ fontWeight: "600" }}>Store:</Text>{" "}
                {receiptData.store_name}
              </Text>
              <Text variant="bodyMedium">
                <Text style={{ fontWeight: "600" }}>Total:</Text> $
                {receiptData.total_amount.toFixed(2)}
              </Text>
              <Text variant="bodyMedium">
                <Text style={{ fontWeight: "600" }}>Date:</Text>{" "}
                {receiptData.date}
              </Text>
            </View>
            <Text
              style={{
                marginTop: 16,
                fontSize: 16,
                color: "#10B981",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              You just outsmarted your grocery bill. 🎯
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {processingComplete ? (
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
            labelStyle={{ fontWeight: "700", fontSize: 18 }}
          >
            Dash away ➡️
          </Button>
        ) : (
          <Button
            mode="outlined"
            onPress={handleRetry}
            style={styles.retryButton}
            contentStyle={styles.buttonContent}
            disabled={!processingComplete}
          >
            Retry
          </Button>
        )}
      </View>

      {/* Viral Features */}
      {showViralFeatures && receiptData && (
        <ViralFeaturesManager
          totalSpend={receiptData.total_amount}
          categoryBreakdown={receiptData.ocr_data.items.reduce(
            (acc: any, item: any) => {
              acc[item.category] = (acc[item.category] || 0) + item.amount;
              return acc;
            },
            {}
          )}
          savingsAmount={12.5} // Mock savings
          weekNumber={1}
        />
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <ConfettiCannon
          count={120}
          origin={{ x: 200, y: 0 }}
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
    backgroundColor: "#F8FAFC",
    padding: spacing.md,
  },
  content: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  processingText: {
    marginTop: spacing.sm,
    fontFamily: "Inter_600SemiBold",
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: "700",
    textAlign: "center",
  },
  imageCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  progressCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  stepTitle: {
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  stepDescription: {
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  progressBar: {
    width: "80%",
    marginTop: spacing.md,
  },
  progressText: {
    textAlign: "center",
    opacity: 0.7,
  },
  resultsCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultsTitle: {
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  resultsInfo: {
    gap: spacing.xs,
  },
  actions: {
    marginTop: "auto",
  },
  continueButton: {
    borderRadius: 12,
  },
  retryButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
