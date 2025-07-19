import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { Text, useTheme, Button, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadarWorm, RadarMood } from "@/components/RadarWorm";
import { useThemeContext } from "@/contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme, spacing } from "@/constants/theme";
import { MotiView } from "moti";
import { useReceipts } from "@/hooks/useReceipts";
import { useAuthContext } from "@/contexts/AuthContext";
import { PanGestureHandler, State } from "react-native-gesture-handler";

interface SpendingAnalytics {
  totalSpent: number;
  totalSavings: number;
  totalCashback: number;
  receiptCount: number;
  averageReceiptValue: number;
}

const moodConfig: {
  mood: RadarMood;
  title: string;
  description: string;
  color: string;
  backgroundColor: string;
}[] = [
  {
    mood: "calm",
    title: "Calm",
    description: "Content and observant",
    color: "#34C759",
    backgroundColor: "#F0F9F0",
  },
  {
    mood: "concerned",
    title: "Concerned",
    description: "Worried about spending",
    color: "#FF9500",
    backgroundColor: "#FFF8F0",
  },
  {
    mood: "dramatic",
    title: "Dramatic",
    description: "Overwhelmed by choices",
    color: "#FF3B30",
    backgroundColor: "#FFF0F0",
  },
  {
    mood: "zen",
    title: "Zen",
    description: "At peace with decisions",
    color: "#AF52DE",
    backgroundColor: "#F8F0FF",
  },
  {
    mood: "suspicious",
    title: "Suspicious",
    description: "Investigating patterns",
    color: "#FFCC00",
    backgroundColor: "#FFFDF0",
  },
  {
    mood: "insightful",
    title: "Insightful",
    description: "Sharing wisdom",
    color: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
];

const getWormTitle = (analytics: SpendingAnalytics) => {
  if (analytics.totalSavings > 50) {
    return {
      title: "Frugal Friend",
      icon: "hand-coin" as const,
      description: "Master of savings",
    };
  }
  if (analytics.averageReceiptValue > 100) {
    return {
      title: "Splurger",
      icon: "cash-multiple" as const,
      description: "Loves to spend big",
    };
  }
  if (analytics.averageReceiptValue < 20 && analytics.receiptCount > 5) {
    return {
      title: "Ascetic",
      icon: "leaf" as const,
      description: "Minimalist at heart",
    };
  }
  if (analytics.receiptCount > 20 && analytics.totalSpent > 1000) {
    return {
      title: "Cart Curator",
      icon: "cart-heart" as const,
      description: "Dedicated shopper",
    };
  }
  if (analytics.receiptCount > 50) {
    return {
      title: "Tinned Tomato Maximalist",
      icon: "food-variant" as const,
      description: "Stockpile specialist",
    };
  }
  if (analytics.receiptCount > 10) {
    return {
      title: "Impulse Explorer",
      icon: "compass-rose" as const,
      description: "Adventurous buyer",
    };
  }
  if (analytics.receiptCount > 5) {
    return {
      title: "Budget Buddha",
      icon: "meditation" as const,
      description: "Mindful spender",
    };
  }
  if (analytics.receiptCount > 2) {
    return {
      title: "Chaos Eater",
      icon: "fire" as const,
      description: "Spontaneous shopper",
    };
  }
  return {
    title: "Novice Nibbler",
    icon: "food-apple-outline" as const,
    description: "Just getting started",
  };
};

export default function RadarDemoScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const [selectedMood, setSelectedMood] = useState<RadarMood>("calm");
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [isInteractive, setIsInteractive] = useState(true);
  const { getSpendingAnalytics } = useReceipts(user?.id ?? "");
  const analytics = getSpendingAnalytics();
  const wormTitle = getWormTitle(analytics);

  const currentMoodInfo = moodConfig.find((m) => m.mood === selectedMood);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="headlineLarge"
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Radar the Worm
          </Text>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: spacing.xs,
            }}
          >
            Your friendly grocery critic
          </Text>
        </View>

        {/* Main Radar Display */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 200 }}
          style={[
            styles.mainContainer,
            {
              backgroundColor:
                currentMoodInfo?.backgroundColor || theme.colors.surfaceVariant,
            },
          ]}
        >
          <RadarWorm
            mood={selectedMood}
            visible={true}
            size="large"
            interactive={isInteractive}
            showSpeechBubble={showSpeechBubble}
            onPress={() => console.log("Radar tapped!")}
          />

          <View style={styles.moodInfoContainer}>
            <Text
              style={[styles.moodTitle, { color: theme.colors.onBackground }]}
            >
              {currentMoodInfo?.title}
            </Text>
            <Text
              style={[
                styles.moodDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {currentMoodInfo?.description}
            </Text>
          </View>
        </MotiView>

        {/* Mood Selector */}
        <View style={styles.controlsSection}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Mood Selector
          </Text>
          <View style={styles.moodGrid}>
            {moodConfig.map((mood) => (
              <Chip
                key={mood.mood}
                selected={selectedMood === mood.mood}
                onPress={() => setSelectedMood(mood.mood)}
                style={[
                  styles.moodChip,
                  {
                    backgroundColor:
                      selectedMood === mood.mood
                        ? mood.color
                        : theme.colors.surfaceVariant,
                  },
                ]}
                textStyle={{
                  color:
                    selectedMood === mood.mood
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant,
                }}
              >
                {mood.title}
              </Chip>
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Controls
          </Text>
          <View style={styles.controlButtons}>
            <Button
              mode={showSpeechBubble ? "contained" : "outlined"}
              onPress={() => setShowSpeechBubble(!showSpeechBubble)}
              style={styles.controlButton}
              icon={showSpeechBubble ? "chat" : "chat-outline"}
            >
              Speech Bubble
            </Button>
            <Button
              mode={isInteractive ? "contained" : "outlined"}
              onPress={() => setIsInteractive(!isInteractive)}
              style={styles.controlButton}
              icon={
                isInteractive ? "hand-pointing-up" : "hand-pointing-up-outline"
              }
            >
              Draggable
            </Button>
          </View>
          <Text
            variant="bodySmall"
            style={[
              styles.controlHint,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {isInteractive
              ? "Try dragging the worm around!"
              : "Enable dragging to interact with the worm"}
          </Text>
        </View>

        {/* Worm Title */}
        <View style={styles.wormTitleContainer}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Your Worm Title
          </Text>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 400 }}
            style={[
              styles.titleCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <MaterialCommunityIcons
              name={wormTitle.icon}
              size={48}
              color={theme.colors.primary}
            />
            <Text
              variant="titleLarge"
              style={[
                styles.cardTitle,
                { color: theme.colors.onBackground, marginTop: spacing.md },
              ]}
            >
              {wormTitle.title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.cardDescription,
                { color: theme.colors.onSurfaceVariant, marginTop: spacing.xs },
              ]}
            >
              {wormTitle.description}
            </Text>
          </MotiView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                variant="headlineSmall"
                style={{ color: theme.colors.primary }}
              >
                {analytics.receiptCount}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Receipts
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                variant="headlineSmall"
                style={{ color: theme.colors.primary }}
              >
                ${analytics.totalSpent.toFixed(0)}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Total Spent
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                variant="headlineSmall"
                style={{ color: theme.colors.positive }}
              >
                ${analytics.totalSavings.toFixed(0)}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Saved
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    textAlign: "center",
    letterSpacing: -0.5,
  },
  mainContainer: {
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  moodInfoContainer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  moodDescription: {
    fontSize: 16,
    textAlign: "center",
  },
  controlsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  moodChip: {
    marginBottom: spacing.xs,
  },
  controlButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
  },
  controlHint: {
    textAlign: "center",
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  wormTitleContainer: {
    marginBottom: spacing.xl,
  },
  titleCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    textAlign: "center",
    fontWeight: "600",
  },
  cardDescription: {
    textAlign: "center",
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
});
