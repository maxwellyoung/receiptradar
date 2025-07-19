import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Button, Card, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { spacing } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";

// Demo scenarios with different data
const demoScenarios = [
  {
    name: "Big Spender",
    totalSpend: 156.8,
    categoryBreakdown: {
      "Fresh Produce": 45.2,
      Meat: 67.5,
      Dairy: 23.1,
      Snacks: 21.0,
    },
    savingsAmount: 0,
    description: "High spend, lots of meat & produce",
  },
  {
    name: "Snack Attack",
    totalSpend: 89.45,
    categoryBreakdown: {
      Snacks: 45.2,
      Beverages: 23.15,
      "Fresh Produce": 12.1,
      Dairy: 9.0,
    },
    savingsAmount: 0,
    description: "Snacks dominate the basket",
  },
  {
    name: "Savings Hero",
    totalSpend: 67.3,
    categoryBreakdown: {
      "Fresh Produce": 25.4,
      Pantry: 22.9,
      Dairy: 19.0,
    },
    savingsAmount: 23.5,
    description: "Smart shopping with big savings",
  },
  {
    name: "Healthy Vibes",
    totalSpend: 112.75,
    categoryBreakdown: {
      "Fresh Produce": 58.3,
      Dairy: 28.45,
      Meat: 26.0,
    },
    savingsAmount: 8.25,
    description: "Fresh and healthy focus",
  },
];

export default function ViralDemoScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [showViralFeatures, setShowViralFeatures] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleScenarioPress = (index: number) => {
    setActiveScenario(index);
    setShowViralFeatures(true);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Mock share functionality - replace with actual share implementation
      Alert.alert(
        "Share ReceiptRadar",
        "Share feature coming soon! This will let you share your savings and insights with friends.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={handleBackToDashboard}
            icon="arrow-left"
            style={styles.backButton}
          >
            Back
          </Button>
          <Text variant="headlineMedium" style={styles.title}>
            Viral Demo
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Show off your savings
          </Text>
        </View>

        {/* Savings Showcase */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.savingsHeader}>
              <MaterialIcons
                name="savings"
                size={48}
                color={theme.colors.primary}
              />
              <Text variant="headlineLarge" style={styles.savingsAmount}>
                $127.50
              </Text>
              <Text variant="titleMedium" style={styles.savingsLabel}>
                Saved this month
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Share Options */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Share Your Success
            </Text>

            <View style={styles.shareOptions}>
              <Button
                mode="contained"
                onPress={handleShare}
                loading={isSharing}
                style={styles.shareButton}
                icon="share"
              >
                Share Savings
              </Button>

              <Button
                mode="outlined"
                onPress={() =>
                  Alert.alert("Coming Soon", "Social features coming soon!")
                }
                style={styles.shareButton}
                icon="camera"
              >
                Share Receipt
              </Button>

              <Button
                mode="outlined"
                onPress={() =>
                  Alert.alert("Coming Soon", "Challenge features coming soon!")
                }
                style={styles.shareButton}
                icon="emoji-events"
              >
                Challenge Friends
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Three.js Effects Demo */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Fun Screen Effects
            </Text>
            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Try out our Three.js WebView effects for celebrations and feedback
            </Text>

            <Button
              mode="contained"
              onPress={() => router.push("/threejs-effects-demo")}
              style={styles.shareButton}
              icon="animation"
            >
              Try Three.js Effects
            </Button>
          </Card.Content>
        </Card>

        {/* Viral Features */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Viral Features
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <MaterialIcons
                  name="trending-up"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Savings Streak</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Share your consecutive days of saving
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons
                  name="compare"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Store Comparison</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Show how much you saved by choosing different stores
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons
                  name="insights"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Spending Insights</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Share interesting patterns in your spending
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons
                  name="groups"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Group Challenges</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Compete with friends to save the most
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Mock Social Feed */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Social Feed Preview
            </Text>

            <View style={styles.socialFeed}>
              <View style={styles.feedItem}>
                <View style={styles.feedHeader}>
                  <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                    Sarah K.
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    2 hours ago
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ marginVertical: 8 }}>
                  Just saved $23.45 by shopping at Countdown instead of New
                  World! 🛒💰
                </Text>
                <View style={styles.feedStats}>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.primary }}
                  >
                    💰 $23.45 saved
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    📍 Countdown Mt Albert
                  </Text>
                </View>
              </View>

              <View style={styles.feedItem}>
                <View style={styles.feedHeader}>
                  <Text variant="titleMedium" style={{ fontWeight: "600" }}>
                    Mike R.
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    5 hours ago
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ marginVertical: 8 }}>
                  Week 3 of my savings challenge! Total saved: $156.80 🎯
                </Text>
                <View style={styles.feedStats}>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.primary }}
                  >
                    🎯 Week 3 Complete
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    💰 $156.80 total
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Viral Features Manager */}
      {showViralFeatures && activeScenario !== null && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Viral Features
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <MaterialIcons
                  name="trending-up"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Savings Streak</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Share your consecutive days of saving
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons
                  name="compare"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Store Comparison</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Show how much you saved by choosing different stores
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons
                  name="insights"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Spending Insights</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Share interesting patterns in your spending
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <MaterialIcons
                  name="groups"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.featureText}>
                  <Text variant="titleMedium">Group Challenges</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    Compete with friends to save the most
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  savingsHeader: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  savingsAmount: {
    fontWeight: "700",
    marginVertical: spacing.sm,
  },
  savingsLabel: {
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  sectionDescription: {
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  shareOptions: {
    gap: spacing.sm,
  },
  shareButton: {
    borderRadius: 8,
  },
  featureList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  socialFeed: {
    gap: spacing.md,
  },
  feedItem: {
    padding: spacing.md,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
});
