import React, { useState, useEffect } from "react";
import { View, ScrollView, Animated, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import {
  HolisticButton,
  HolisticCard,
  HolisticContainer,
  HolisticText,
} from "@/components/HolisticDesignSystem";
import { CompetitiveAdvantage } from "@/components/CompetitiveAdvantage";

type ToneMode = "gentle" | "hard";

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [toneMode, setToneMode] = useState<ToneMode | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const router = useRouter();

  useEffect(() => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      return status === "granted";
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setHasPermission(false);
      return false;
    }
  };

  const handleToneModeSelect = async (mode: ToneMode) => {
    setToneMode(mode);
    // Store the user's preference
    try {
      await AsyncStorage.setItem("@toneMode", mode);
    } catch (error) {
      console.error("Failed to save tone mode preference:", error);
    }
  };

  const handlePermissionGrant = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem("@hasOnboarded", "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to ReceiptRadar",
      subtitle: "Your personal grocery spending companion",
      content: (
        <View style={styles.stepContent}>
          <HolisticText variant="body.large" style={styles.stepDescription}>
            We'll help you track groceries, spot waste, and save money with
            every receipt you scan.
          </HolisticText>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📸</Text>
              <HolisticText variant="body.medium">
                Scan receipts instantly
              </HolisticText>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🧠</Text>
              <HolisticText variant="body.medium">
                Get smart spending insights
              </HolisticText>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💰</Text>
              <HolisticText variant="body.medium">
                Find better deals automatically
              </HolisticText>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: "tone",
      title: "Choose Your Experience",
      subtitle: "How would you like ReceiptRadar to communicate with you?",
      content: (
        <View style={styles.stepContent}>
          <HolisticText variant="body.large" style={styles.stepDescription}>
            Select your preferred communication style for spending insights and
            recommendations.
          </HolisticText>

          <View style={styles.toneOptions}>
            <View style={styles.toneCard}>
              <HolisticCard
                title="🐣 Gentle Mode"
                subtitle="Be kind to me"
                content="Supportive, encouraging feedback that celebrates your wins and gently suggests improvements."
                variant={toneMode === "gentle" ? "elevated" : "default"}
                onPress={() => handleToneModeSelect("gentle")}
              />
            </View>

            <View style={styles.toneCard}>
              <HolisticCard
                title="🔥 Hard Mode"
                subtitle="Give it to me straight"
                content="Direct, honest feedback that tells you exactly what you need to hear about your spending."
                variant={toneMode === "hard" ? "elevated" : "default"}
                onPress={() => handleToneModeSelect("hard")}
              />
            </View>
          </View>
        </View>
      ),
    },
    {
      id: "permission",
      title: "Camera Access",
      subtitle: "To scan your receipts, we need camera permission",
      content: (
        <View style={styles.stepContent}>
          <HolisticText variant="body.large" style={styles.stepDescription}>
            We need access to your camera to scan receipts. Your photos are
            processed securely and never stored permanently.
          </HolisticText>

          <View style={styles.permissionInfo}>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>🔒</Text>
              <HolisticText variant="body.medium">
                Photos are processed securely
              </HolisticText>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>🗑️</Text>
              <HolisticText variant="body.medium">
                Never stored permanently
              </HolisticText>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>📱</Text>
              <HolisticText variant="body.medium">
                Only used for receipt scanning
              </HolisticText>
            </View>
          </View>

          <View style={styles.permissionButton}>
            <HolisticButton
              title="Grant Camera Permission"
              onPress={handlePermissionGrant}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </View>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>📱</Text>
            <Text style={styles.appName}>ReceiptRadar</Text>
          </View>

          {/* Step Content */}
          <HolisticContainer padding="large">
            <View style={styles.stepHeader}>
              <HolisticText variant="headline.medium" style={styles.stepTitle}>
                {currentStepData.title}
              </HolisticText>
              <HolisticText
                variant="body.large"
                color="secondary"
                style={styles.stepSubtitle}
              >
                {currentStepData.subtitle}
              </HolisticText>
            </View>

            {currentStepData.content}

            {/* Competitive Advantage - Show on first step */}
            {currentStep === 0 && (
              <View style={styles.competitiveSection}>
                <CompetitiveAdvantage
                  title="Why ReceiptRadar is Different"
                  showDetails={false}
                />
              </View>
            )}

            {/* Navigation */}
            <View style={styles.navigation}>
              {currentStep < steps.length - 1 ? (
                <HolisticButton
                  title="Continue"
                  onPress={() => setCurrentStep(currentStep + 1)}
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={currentStep === 1 && !toneMode}
                />
              ) : (
                <HolisticButton
                  title="Start Scanning"
                  onPress={handleCompleteOnboarding}
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                />
              )}

              {currentStep > 0 && (
                <View style={styles.backButton}>
                  <HolisticButton
                    title="Back"
                    onPress={() => setCurrentStep(currentStep - 1)}
                    variant="ghost"
                    size="medium"
                  />
                </View>
              )}
            </View>
          </HolisticContainer>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  stepTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    textAlign: "center",
  },
  stepContent: {
    marginBottom: 32,
  },
  stepDescription: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
    width: 32,
    textAlign: "center",
  },
  toneOptions: {
    gap: 16,
  },
  toneCard: {
    marginBottom: 0,
  },
  permissionInfo: {
    gap: 16,
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  permissionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  permissionButton: {
    marginTop: 16,
  },
  navigation: {
    gap: 12,
  },
  backButton: {
    marginTop: 8,
  },
  competitiveSection: {
    marginTop: 24,
  },
});
