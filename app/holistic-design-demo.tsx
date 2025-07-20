import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnhancedOnboardingScreen } from "@/components/EnhancedOnboardingScreen";
import { ReceiptScanningExperience } from "@/components/ReceiptScanningExperience";
import { WeeklyWormDigest } from "@/components/WeeklyWormDigest";
import { HolisticButton } from "@/components/HolisticDesignSystem";
import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticContainer } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import { RadarWorm } from "@/components/RadarWorm";
import { useToneMode } from "@/hooks/useToneMode";
import * as Haptics from "expo-haptics";

export default function HolisticDesignDemo() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReceiptExperience, setShowReceiptExperience] = useState(false);
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);
  const { toneMode, setToneMode } = useToneMode();

  // Mock receipt data for demo
  const mockReceiptData = {
    total: 132.74,
    store: "Countdown",
    items: [
      { name: "Milk", price: 4.5, quantity: 2, category: "Dairy" },
      { name: "Bread", price: 3.2, quantity: 1, category: "Bakery" },
      { name: "Cheese", price: 8.99, quantity: 1, category: "Dairy" },
      { name: "Apples", price: 5.99, quantity: 1, category: "Produce" },
      { name: "Chicken Breast", price: 12.99, quantity: 1, category: "Meat" },
    ],
    date: new Date().toISOString(),
  };

  const handleToneModeToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMode = toneMode === "gentle" ? "hard" : "gentle";
    await setToneMode(newMode);
    Alert.alert("Tone Mode Changed", `Switched to ${newMode} mode!`);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    Alert.alert("Onboarding Complete", "Welcome to ReceiptRadar! 🎉");
  };

  const handleReceiptComplete = () => {
    setShowReceiptExperience(false);
    Alert.alert("Receipt Saved", "Your receipt has been processed and saved!");
  };

  const handleWeeklyDigestDismiss = () => {
    setShowWeeklyDigest(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <HolisticContainer padding="large">
          {/* Header */}
          <View style={styles.header}>
            <HolisticText variant="headline.large" style={styles.title}>
              ReceiptRadar Demo
            </HolisticText>
            <HolisticText
              variant="body.large"
              color="secondary"
              style={styles.subtitle}
            >
              Experience the ideal user flow
            </HolisticText>
          </View>

          {/* Worm Character */}
          <View style={styles.wormContainer}>
            <RadarWorm
              mood="insightful"
              message="Welcome to the demo! Try out the different experiences below."
              visible={true}
              size="large"
              showSpeechBubble={true}
              animated={true}
            />
          </View>

          {/* Current Tone Mode */}
          <HolisticCard
            title="Current Tone Mode"
            subtitle={`Currently set to: ${toneMode} mode`}
            content={`The worm will communicate in ${
              toneMode === "gentle"
                ? "a supportive, encouraging way"
                : "a direct, honest way"
            }.`}
            variant="elevated"
          >
            <View style={styles.toneModeContainer}>
              <HolisticButton
                title={`Switch to ${
                  toneMode === "gentle" ? "Hard" : "Gentle"
                } Mode`}
                onPress={handleToneModeToggle}
                variant="outline"
                size="medium"
                icon={toneMode === "gentle" ? "🔥" : "🐣"}
              />
            </View>
          </HolisticCard>

          {/* Demo Options */}
          <View style={styles.demoSection}>
            <HolisticText variant="title.large" style={styles.sectionTitle}>
              Try the Experience
            </HolisticText>

            <View style={styles.demoOptions}>
              <HolisticCard
                title="Enhanced Onboarding"
                subtitle="Tone mode selection & camera permission"
                content="Experience the delightful onboarding flow with the worm character and tone mode selection."
                variant="default"
                onPress={() => setShowOnboarding(true)}
              />

              <HolisticCard
                title="Receipt Scanning Experience"
                subtitle="Instant insights & smart recommendations"
                content="See how the worm reacts to your spending and provides personalized insights."
                variant="default"
                onPress={() => setShowReceiptExperience(true)}
              />

              <HolisticCard
                title="Weekly Worm Digest"
                subtitle="Retention & engagement features"
                content="Explore the weekly insights, challenges, and achievements system."
                variant="default"
                onPress={() => setShowWeeklyDigest(true)}
              />
            </View>
          </View>

          {/* Features Overview */}
          <View style={styles.featuresSection}>
            <HolisticText variant="title.large" style={styles.sectionTitle}>
              Key Features
            </HolisticText>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <View style={styles.featureContent}>
                  <HolisticText variant="title.small">
                    Holistic Design System
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    Inspired by legendary designers like Jony Ive, Dieter Rams,
                    and others
                  </HolisticText>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🐛</Text>
                <View style={styles.featureContent}>
                  <HolisticText variant="title.small">
                    RadarWorm Character
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    Animated worm with personality-driven responses and gooey
                    physics
                  </HolisticText>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎭</Text>
                <View style={styles.featureContent}>
                  <HolisticText variant="title.small">
                    Tone Mode Selection
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    Choose between gentle (supportive) and hard (direct)
                    communication styles
                  </HolisticText>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💡</Text>
                <View style={styles.featureContent}>
                  <HolisticText variant="title.small">
                    Smart Insights
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    AI-powered spending analysis, savings opportunities, and
                    personalized tips
                  </HolisticText>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🏆</Text>
                <View style={styles.featureContent}>
                  <HolisticText variant="title.small">
                    Gamification
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    Weekly challenges, achievements, and retention-oriented
                    features
                  </HolisticText>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✨</Text>
                <View style={styles.featureContent}>
                  <HolisticText variant="title.small">
                    Delightful Interactions
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    Haptic feedback, smooth animations, and thoughtful
                    micro-interactions
                  </HolisticText>
                </View>
              </View>
            </View>
          </View>
        </HolisticContainer>
      </ScrollView>

      {/* Modals */}
      <EnhancedOnboardingScreen
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <ReceiptScanningExperience
        receiptData={mockReceiptData}
        photoUri="mock-photo-uri"
        onViewReceipt={() => {
          setShowReceiptExperience(false);
          Alert.alert("View Receipt", "Would navigate to receipt details");
        }}
        onScanAnother={() => {
          setShowReceiptExperience(false);
          Alert.alert("Scan Another", "Would open camera for new scan");
        }}
        onBackToHome={() => {
          setShowReceiptExperience(false);
          Alert.alert("Back to Home", "Would navigate to main dashboard");
        }}
      />

      <WeeklyWormDigest
        isVisible={showWeeklyDigest}
        onDismiss={handleWeeklyDigestDismiss}
        onScanReceipt={() => {
          setShowWeeklyDigest(false);
          Alert.alert("Scan Receipt", "Would open camera for new scan");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
  },
  wormContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  toneModeContainer: {
    marginTop: 16,
  },
  demoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  demoOptions: {
    gap: 16,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
    width: 32,
    textAlign: "center",
  },
  featureContent: {
    flex: 1,
  },
});
