import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadarWorm, RadarMood } from "@/components/RadarWorm";
import { useThemeContext } from "@/contexts/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTheme, spacing } from "@/constants/theme";
import { MotiView } from "moti";
import { useReceipts } from "@/hooks/useReceipts";
import { useAuthContext } from "@/contexts/AuthContext";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

interface SpendingAnalytics {
  totalSpent: number;
  totalSavings: number;
  totalCashback: number;
  receiptCount: number;
  averageReceiptValue: number;
}

const moodZones: {
  mood: RadarMood;
  x: number;
  y: number;
  title: string;
  description: string;
}[] = [
  { mood: "calm", x: 0, y: 0, title: "Calm", description: "Just chillin'." },
  {
    mood: "concerned",
    x: 100,
    y: 50,
    title: "Concerned",
    description: "What's that?",
  },
  {
    mood: "dramatic",
    x: -100,
    y: 50,
    title: "Dramatic",
    description: "Oh the drama!",
  },
  { mood: "zen", x: 0, y: -100, title: "Zen", description: "In my own world." },
  {
    mood: "suspicious",
    x: 100,
    y: -50,
    title: "Suspicious",
    description: "I see you.",
  },
  {
    mood: "insightful",
    x: -100,
    y: -50,
    title: "Insightful",
    description: "I have an idea!",
  },
];

const moodAuras: Record<RadarMood, [string, string]> = {
  calm: ["#A1FFCE", "#FAFFD1"],
  concerned: ["#FFDDE1", "#EE9CA7"],
  dramatic: ["#FF9A9E", "#FAD0C4"],
  zen: ["#D4A4F7", "#B39DDB"],
  suspicious: ["#F6D365", "#FDA085"],
  insightful: ["#A8C0FF", "#3F2B96"],
};

const getWormTitle = (analytics: SpendingAnalytics) => {
  if (analytics.totalSavings > 50) {
    return { title: "Frugal Friend", icon: "hand-coin" as const };
  }
  if (analytics.averageReceiptValue > 100) {
    return { title: "Splurger", icon: "cash-multiple" as const };
  }
  if (analytics.averageReceiptValue < 20 && analytics.receiptCount > 5) {
    return { title: "Ascetic", icon: "leaf" as const };
  }
  if (analytics.receiptCount > 20 && analytics.totalSpent > 1000) {
    return { title: "Cart Curator", icon: "cart-heart" as const };
  }
  if (analytics.receiptCount > 50) {
    return { title: "Tinned Tomato Maximalist", icon: "food-variant" as const };
  }
  if (analytics.receiptCount > 10) {
    return { title: "Impulse Explorer", icon: "compass-rose" as const };
  }
  if (analytics.receiptCount > 5) {
    return { title: "Budget Buddha", icon: "meditation" as const };
  }
  if (analytics.receiptCount > 2) {
    return { title: "Chaos Eater", icon: "fire" as const };
  }
  return { title: "Novice Nibbler", icon: "food-apple-outline" as const };
};

export default function RadarDemoScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const [selectedMood, setSelectedMood] = useState<RadarMood>("calm");
  const { getSpendingAnalytics } = useReceipts(user?.id ?? "");
  const analytics = getSpendingAnalytics();
  const wormTitle = getWormTitle(analytics);

  const pan = useState(new Animated.ValueXY())[0];

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // Find the closest mood zone
      const { translationX, translationY } = event.nativeEvent;
      let closestMood: RadarMood = "calm";
      let minDistance = Infinity;

      moodZones.forEach((zone) => {
        const distance = Math.sqrt(
          Math.pow(zone.x - translationX, 2) +
            Math.pow(zone.y - translationY, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestMood = zone.mood;
        }
      });
      setSelectedMood(closestMood);

      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        useNativeDriver: false,
      }).start();
    }
  };

  const currentMoodInfo = moodZones.find((z) => z.mood === selectedMood);

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
            A sentient being's lair.
          </Text>
        </View>

        {/* Main Radar Display */}
        <LinearGradient
          colors={moodAuras[selectedMood]}
          style={styles.interactiveContainer}
        >
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={pan.getLayout()}>
              <RadarWorm
                mood={selectedMood}
                visible={true}
                size="large"
                interactive={true}
              />
            </Animated.View>
          </PanGestureHandler>

          <View style={styles.moodInfoContainer}>
            <Text style={styles.moodTitle}>{currentMoodInfo?.title}</Text>
            <Text style={styles.moodDescription}>
              {currentMoodInfo?.description}
            </Text>
          </View>
        </LinearGradient>

        {/* Worm Title */}
        <View style={styles.wormTitleContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Worm Title
          </Text>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}
          >
            <MaterialCommunityIcons
              name={wormTitle.icon}
              size={48}
              color={theme.colors.primary}
            />
            <Text
              variant="titleLarge"
              style={[styles.cardTitle, { marginTop: spacing.md }]}
            >
              {wormTitle.title}
            </Text>
          </MotiView>
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
    fontFamily: "Inter_700Bold",
  },
  interactiveContainer: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderRadius: 24,
  },
  moodInfoContainer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  moodTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
  },
  moodDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  wormTitleContainer: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  mainCard: {
    padding: spacing.lg,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowColor: "#000",
    shadowOffset: { height: 4, width: 0 },
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
  },
});
