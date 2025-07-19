import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, Card, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import ThreeJSWebView from "./ThreeJSWebView";

interface EffectConfig {
  name: string;
  effect: "particles" | "waves" | "floating" | "confetti";
  color: string;
  intensity: number;
  duration: number;
  description: string;
  icon: string;
}

const effectConfigs: EffectConfig[] = [
  {
    name: "Particle Burst",
    effect: "particles",
    color: "#4CAF50",
    intensity: 1.5,
    duration: 3000,
    description: "Floating particles that bounce around the screen",
    icon: "blur-on",
  },
  {
    name: "Wave Ripple",
    effect: "waves",
    color: "#2196F3",
    intensity: 1,
    duration: 4000,
    description: "Animated wave patterns that ripple across the screen",
    icon: "waves",
  },
  {
    name: "Floating Objects",
    effect: "floating",
    color: "#FF9800",
    intensity: 1.2,
    duration: 3500,
    description: "3D objects that float and rotate in space",
    icon: "3d-rotation",
  },
  {
    name: "Confetti Rain",
    effect: "confetti",
    color: "#E91E63",
    intensity: 2,
    duration: 2500,
    description: "Colorful confetti that falls from the top",
    icon: "celebration",
  },
  {
    name: "Green Particles",
    effect: "particles",
    color: "#4CAF50",
    intensity: 0.8,
    duration: 3000,
    description: "Subtle green particles for success states",
    icon: "eco",
  },
  {
    name: "Blue Waves",
    effect: "waves",
    color: "#2196F3",
    intensity: 0.6,
    duration: 5000,
    description: "Gentle blue waves for calming effects",
    icon: "water",
  },
];

export default function ThreeJSEffectsDemo() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeEffect, setActiveEffect] = useState<EffectConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEffectPress = (effect: EffectConfig) => {
    setActiveEffect(effect);
    setIsPlaying(true);

    // Auto-hide after duration
    setTimeout(() => {
      setIsPlaying(false);
      setActiveEffect(null);
    }, effect.duration);
  };

  const handleSuccessEffect = () => {
    const successEffect: EffectConfig = {
      name: "Success Celebration",
      effect: "confetti",
      color: "#4CAF50",
      intensity: 1.5,
      duration: 3000,
      description: "Celebrate successful actions",
      icon: "check-circle",
    };
    handleEffectPress(successEffect);
  };

  const handleSavingsEffect = () => {
    const savingsEffect: EffectConfig = {
      name: "Savings Found",
      effect: "particles",
      color: "#FFD700",
      intensity: 1.2,
      duration: 4000,
      description: "Golden particles for savings discoveries",
      icon: "savings",
    };
    handleEffectPress(savingsEffect);
  };

  const handleReceiptProcessed = () => {
    const receiptEffect: EffectConfig = {
      name: "Receipt Processed",
      effect: "floating",
      color: "#9C27B0",
      intensity: 1,
      duration: 3500,
      description: "Purple floating objects for receipt processing",
      icon: "receipt",
    };
    handleEffectPress(receiptEffect);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Three.js Effects Demo
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Fun screen effects for ReceiptRadar
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                onPress={handleSuccessEffect}
                style={styles.quickButton}
                icon="check-circle"
              >
                Success
              </Button>
              <Button
                mode="contained"
                onPress={handleSavingsEffect}
                style={styles.quickButton}
                icon="savings"
              >
                Savings
              </Button>
              <Button
                mode="contained"
                onPress={handleReceiptProcessed}
                style={styles.quickButton}
                icon="receipt"
              >
                Receipt
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Effect Library */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Effect Library
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Tap any effect to see it in action
            </Text>

            <View style={styles.effectsGrid}>
              {effectConfigs.map((effect, index) => (
                <Card
                  key={index}
                  style={styles.effectCard}
                  onPress={() => handleEffectPress(effect)}
                >
                  <Card.Content style={styles.effectContent}>
                    <MaterialIcons
                      name={effect.icon as any}
                      size={32}
                      color={effect.color}
                      style={styles.effectIcon}
                    />
                    <Text variant="titleMedium" style={styles.effectName}>
                      {effect.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.effectDescription}>
                      {effect.description}
                    </Text>
                    <View style={styles.effectMeta}>
                      <Text variant="labelSmall" style={styles.effectDuration}>
                        {effect.duration / 1000}s
                      </Text>
                      <View
                        style={[
                          styles.intensityBar,
                          { backgroundColor: theme.colors.outline },
                        ]}
                      >
                        <View
                          style={[
                            styles.intensityFill,
                            {
                              backgroundColor: effect.color,
                              width: `${(effect.intensity / 2) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Usage Examples */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Usage Examples
            </Text>

            <View style={styles.usageExamples}>
              <View style={styles.usageItem}>
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.usageText}>
                  <Text variant="titleMedium">Success States</Text>
                  <Text variant="bodySmall">
                    Use confetti for successful actions
                  </Text>
                </View>
              </View>

              <View style={styles.usageItem}>
                <MaterialIcons
                  name="savings"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.usageText}>
                  <Text variant="titleMedium">Savings Discovered</Text>
                  <Text variant="bodySmall">
                    Golden particles for price drops
                  </Text>
                </View>
              </View>

              <View style={styles.usageItem}>
                <MaterialIcons
                  name="receipt"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.usageText}>
                  <Text variant="titleMedium">Receipt Processed</Text>
                  <Text variant="bodySmall">
                    Floating objects for OCR completion
                  </Text>
                </View>
              </View>

              <View style={styles.usageItem}>
                <MaterialIcons
                  name="trending-up"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.usageText}>
                  <Text variant="titleMedium">Achievements</Text>
                  <Text variant="bodySmall">Wave effects for milestones</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Three.js WebView Overlay */}
      {isPlaying && activeEffect && (
        <ThreeJSWebView
          effect={activeEffect.effect}
          color={activeEffect.color}
          intensity={activeEffect.intensity}
          duration={activeEffect.duration}
          onLoad={() => console.log("Three.js effect loaded")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  effectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  effectCard: {
    width: "48%",
    marginBottom: 12,
  },
  effectContent: {
    alignItems: "center",
    padding: 12,
  },
  effectIcon: {
    marginBottom: 8,
  },
  effectName: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  effectDescription: {
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.7,
  },
  effectMeta: {
    alignItems: "center",
    width: "100%",
  },
  effectDuration: {
    marginBottom: 4,
  },
  intensityBar: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  intensityFill: {
    height: "100%",
    borderRadius: 2,
  },
  usageExamples: {
    marginTop: 8,
  },
  usageItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  usageText: {
    marginLeft: 12,
    flex: 1,
  },
});
