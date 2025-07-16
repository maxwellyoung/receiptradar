import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Card, ProgressBar, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadarWorm, RadarMood } from "@/components/RadarWorm";
import { useThemeContext } from "@/contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";
import { AnimatePresence, MotiView } from "moti";

const moodExamples = [
  {
    mood: "calm" as RadarMood,
    title: "Calm",
    description: "Normal scan + under budget",
    spend: 45.67,
    categories: { Produce: 15.5, Dairy: 12.99, Grains: 17.18 },
  },
  {
    mood: "concerned" as RadarMood,
    title: "Concerned",
    description: "Over budget in Snacks / Convenience",
    spend: 78.9,
    categories: { Snacks: 35.0, Convenience: 25.5, Produce: 18.4 },
  },
  {
    mood: "dramatic" as RadarMood,
    title: "Dramatic",
    description: "Big spend + luxury items",
    spend: 245.67,
    categories: { Luxury: 180.0, Wine: 45.67, Cheese: 20.0 },
  },
  {
    mood: "zen" as RadarMood,
    title: "Zen",
    description: "Budget streak or low spend",
    spend: 12.5,
    categories: { Produce: 8.5, Grains: 4.0 },
  },
  {
    mood: "suspicious" as RadarMood,
    title: "Suspicious",
    description: "Duplicate receipt / sketchy item parse",
    spend: 89.99,
    categories: { Snacks: 90.0, Convenience: 0 },
  },
  {
    mood: "insightful" as RadarMood,
    title: "Insightful",
    description: "Weekly report / savings badge unlocked",
    spend: 67.8,
    categories: { Produce: 25.0, Dairy: 20.0, Grains: 22.8 },
    savings: 15.2,
  },
];

const relationshipLevels = [
  "Stranger",
  "Acquaintance",
  "Friend",
  "Trusted Advisor",
  "Best Friend",
  "Soulmate",
];

export default function RadarDemoScreen() {
  const { theme } = useThemeContext();
  const [selectedMood, setSelectedMood] = useState<RadarMood>("calm");
  const [interactionCount, setInteractionCount] = useState(0);

  const currentRelationshipLevel = Math.min(
    Math.floor(interactionCount / 2),
    relationshipLevels.length - 1
  );
  const progressToNextLevel = (interactionCount % 2) / 2;

  const currentExample = moodExamples.find((ex) => ex.mood === selectedMood);

  const handleRadarPress = () => {
    setInteractionCount((prev) => prev + 1);
    Alert.alert(
      `Interaction #${interactionCount + 1}`,
      "You poked the worm. It seems pleased."
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.headerTitle}>
            The Worm's World
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Your friendly grocery critic.
          </Text>
        </View>

        {/* Main Radar Display */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring" }}
          style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={styles.cardTitle}>
            {relationshipLevels[currentRelationshipLevel]}
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginBottom: spacing.md,
            }}
          >
            {interactionCount} interactions so far
          </Text>
          <ProgressBar
            progress={progressToNextLevel}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <RadarWorm
            mood={selectedMood}
            visible={true}
            size="large"
            interactive={true}
            onPress={handleRadarPress}
          />
        </MotiView>

        {/* Mood Selector */}
        <View style={styles.moodSelectorContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Worm Moods
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {moodExamples.map((example) => (
              <TouchableOpacity
                key={example.mood}
                style={[
                  styles.moodCard,
                  {
                    backgroundColor:
                      selectedMood === example.mood
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={() => setSelectedMood(example.mood)}
              >
                <RadarWorm mood={example.mood} size="small" visible={true} />
                <Text
                  variant="labelLarge"
                  style={[
                    styles.moodTitle,
                    {
                      color:
                        selectedMood === example.mood
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {example.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "700",
  },
  mainCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  cardTitle: {
    fontWeight: "600",
  },
  progressBar: {
    width: "80%",
    height: 8,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  moodSelectorContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  moodCard: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
  moodTitle: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
