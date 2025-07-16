import React, { useState, useEffect } from "react";
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
      // Show progress steps while waiting for OCR
      for (let i = 0; i < processingSteps.length - 1; i++) {
        setCurrentStep(i);
        setProgress((i / (processingSteps.length - 1)) * 100);
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Call OCR backend for real parsing
      setCurrentStep(processingSteps.length - 2); // 'Calculating Totals'
      setProgress(90);
      const parsed = await ocrService.parseReceipt(photoUri!);

      // In the background, save the processed receipt to the remote server.
      // We don't need to wait for this to complete to show the user the results.
      ocrService.saveReceipt(parsed).catch((error) => {
        // If this fails, we don't want to block the user.
        // We'll just log the error for now. A more robust solution
        // might involve a background sync queue.
        console.error("Failed to save receipt to backend:", error);
      });

      // Check if the result is NOT a receipt
      if (parsed.validation && parsed.validation.is_valid === false) {
        setNotAReceipt(true);
        setProcessingComplete(true);
        setProgress(100);
        return;
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
        image_url: photoUri,
        ocr_data: {
          items: parsed.items || [],
          subtotal: parsed.subtotal,
          tax: parsed.tax,
          receipt_number: parsed.receipt_number,
          validation: parsed.validation,
          processing_time: parsed.processing_time,
        },
      };

      setReceiptData(receiptToSave);
      setProcessingComplete(true);
      setProgress(100);

      // Save receipt
      if (user?.id) {
        await createReceipt(receiptToSave);
      }

      // Show viral features after a short delay
      setTimeout(() => {
        setShowViralFeatures(true);
      }, 1000);
    } catch (error) {
      Alert.alert(
        "Processing Error",
        "Failed to process receipt. Please try again."
      );
      router.back();
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
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Processing Receipt
        </Text>
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

          <ProgressBar
            progress={progress / 100}
            style={styles.progressBar}
            color={theme.colors.primary}
          />

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
              You just outsmarted your grocery bill. ��
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
    marginBottom: spacing.sm,
    height: 8,
    borderRadius: 4,
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
