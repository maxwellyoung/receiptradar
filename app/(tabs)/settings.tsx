import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Button, Switch, useTheme, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

import { HolisticButton } from "@/components/HolisticDesignSystem";
import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";
import { useToneMode } from "@/hooks/useToneMode";
import { useReceipts } from "@/hooks/useReceipts";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { spacing, typography, shadows, borderRadius } from "@/constants/theme";
import { AppTheme } from "@/constants/theme";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface WormStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalReceipts: number;
  totalSpent: number;
  averagePerShop: number;
  biggestSave: number;
  weeklyStreak: number;
  title: string;
}

const calculateWormStats = (receipts: any[]): WormStats => {
  const totalReceipts = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const averagePerShop = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  // Mock stats for demo
  const level = Math.floor(totalReceipts / 5) + 1;
  const xp = (totalReceipts % 5) * 20;
  const xpToNext = 100;
  const biggestSave = 15.5; // Mock
  const weeklyStreak = 3; // Mock

  const titles = [
    "Receipt Rookie",
    "Scanning Apprentice",
    "Bargain Bloodhound",
    "Price Detective",
    "Savings Sage",
    "Receipt Master",
  ];

  const title = titles[Math.min(level - 1, titles.length - 1)];

  return {
    level,
    xp,
    xpToNext,
    totalReceipts,
    totalSpent,
    averagePerShop,
    biggestSave,
    weeklyStreak,
    title,
  };
};

const generateAchievements = (stats: WormStats): Achievement[] => [
  {
    id: "first-scan",
    title: "First Steps",
    description: "Scan your first receipt",
    icon: "📸",
    unlocked: stats.totalReceipts >= 1,
  },
  {
    id: "savings-master",
    title: "Savings Master",
    description: "Save $20 in a week",
    icon: "💰",
    unlocked: stats.biggestSave >= 20,
    progress: stats.biggestSave,
    maxProgress: 20,
  },
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Scan receipts for 7 days in a row",
    icon: "🔥",
    unlocked: stats.weeklyStreak >= 7,
    progress: stats.weeklyStreak,
    maxProgress: 7,
  },
  {
    id: "home-brand",
    title: "Home Brand Hero",
    description: "Swap 5 items to store brand",
    icon: "🏠",
    unlocked: false,
    progress: 2,
    maxProgress: 5,
  },
  {
    id: "budget-boss",
    title: "Budget Boss",
    description: "Stay under $50 for 3 shops",
    icon: "👑",
    unlocked: false,
    progress: 1,
    maxProgress: 3,
  },
  {
    id: "receipt-royalty",
    title: "Receipt Royalty",
    description: "Scan 50 receipts total",
    icon: "👑",
    unlocked: stats.totalReceipts >= 50,
    progress: stats.totalReceipts,
    maxProgress: 50,
  },
];

export default function WormProfileScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user, signOut } = useAuthContext();
  const { toneMode, setToneMode } = useToneMode();
  const { receipts } = useReceipts(user?.id ?? "");
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);

  const stats = calculateWormStats(receipts);
  const achievements = generateAchievements(stats);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleToneModeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setToneMode(toneMode === "gentle" ? "hard" : "gentle");
  };

  const getWormMood = (): string => {
    if (stats.level >= 5) return "insightful";
    if (stats.totalReceipts === 0) return "calm";
    if (stats.biggestSave > 10) return "zen";
    return "concerned";
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Worm Profile Header */}
        <View style={styles.header}>
          <RadarWorm
            mood={getWormMood() as any}
            size="large"
            visible={true}
            showSpeechBubble={true}
            animated={true}
            message={
              toneMode === "gentle"
                ? `Level ${stats.level} ${stats.title}! Keep up the great work! ✨`
                : `Level ${stats.level} ${stats.title}. Not terrible.`
            }
          />

          <View style={styles.profileInfo}>
            <HolisticText variant="headline.medium" style={styles.wormName}>
              {stats.title}
            </HolisticText>
            <HolisticText variant="body.medium" color="secondary">
              Level {stats.level} • {stats.totalReceipts} receipts scanned
            </HolisticText>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <HolisticCard variant="minimal" padding="medium">
            <View style={styles.xpHeader}>
              <HolisticText variant="title.medium">Experience</HolisticText>
              <HolisticText variant="body.medium" color="secondary">
                {stats.xp}/{stats.xpToNext} XP
              </HolisticText>
            </View>

            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpProgress,
                  { width: `${(stats.xp / stats.xpToNext) * 100}%` },
                ]}
              />
            </View>

            <HolisticText
              variant="body.small"
              color="secondary"
              style={styles.xpHint}
            >
              Scan more receipts to level up!
            </HolisticText>
          </HolisticCard>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <HolisticText variant="title.large" style={styles.sectionTitle}>
            Your Stats
          </HolisticText>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <HolisticText variant="title.medium" style={styles.statValue}>
                {stats.totalReceipts}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Receipts Scanned
              </HolisticText>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <HolisticText variant="title.medium" style={styles.statValue}>
                {formatCurrency(stats.totalSpent)}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Total Spent
              </HolisticText>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏪</Text>
              <HolisticText variant="title.medium" style={styles.statValue}>
                {formatCurrency(stats.averagePerShop)}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Avg per Shop
              </HolisticText>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <HolisticText variant="title.medium" style={styles.statValue}>
                {stats.weeklyStreak}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Week Streak
              </HolisticText>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <HolisticText variant="title.large" style={styles.sectionTitle}>
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </HolisticText>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View
                  style={[
                    styles.achievementIcon,
                    { opacity: achievement.unlocked ? 1 : 0.3 },
                  ]}
                >
                  <Text style={styles.achievementEmoji}>
                    {achievement.icon}
                  </Text>
                </View>

                <View style={styles.achievementContent}>
                  <HolisticText
                    variant="title.small"
                    style={[
                      styles.achievementTitle,
                      { opacity: achievement.unlocked ? 1 : 0.5 },
                    ]}
                  >
                    {achievement.title}
                  </HolisticText>

                  <HolisticText
                    variant="body.small"
                    color="secondary"
                    style={{ opacity: achievement.unlocked ? 1 : 0.5 }}
                  >
                    {achievement.description}
                  </HolisticText>

                  {achievement.progress !== undefined && (
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              (achievement.progress /
                                (achievement.maxProgress || 1)) *
                              100
                            }%`,
                            backgroundColor: achievement.unlocked
                              ? "#34C759"
                              : "#E0E0E0",
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <HolisticText variant="title.large" style={styles.sectionTitle}>
            Preferences
          </HolisticText>

          <HolisticCard variant="minimal" padding="medium">
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <HolisticText variant="title.medium">
                  Worm Personality
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  {toneMode === "gentle"
                    ? "Gentle and encouraging"
                    : "Direct and honest"}
                </HolisticText>
              </View>
              <TouchableOpacity onPress={handleToneModeToggle}>
                <View
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor:
                        toneMode === "gentle" ? "#34C759" : "#FF6B35",
                    },
                  ]}
                >
                  <Text style={styles.toggleText}>
                    {toneMode === "gentle" ? "Gentle" : "Hard"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <HolisticText variant="title.medium">
                  Notifications
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Price drops and weekly insights
                </HolisticText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={theme.colors.primary}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <HolisticText variant="title.medium">
                  Weekly Digest
                </HolisticText>
                <HolisticText variant="body.small" color="secondary">
                  Worm's weekly spending commentary
                </HolisticText>
              </View>
              <Switch
                value={weeklyDigestEnabled}
                onValueChange={setWeeklyDigestEnabled}
                color={theme.colors.primary}
              />
            </View>
          </HolisticCard>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <HolisticButton
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            size="medium"
            icon="🚪"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  wormName: {
    marginBottom: spacing.xs,
  },
  xpContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  xpBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  xpProgress: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 4,
  },
  xpHint: {
    textAlign: "center",
    fontStyle: "italic",
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  achievementsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  achievementsGrid: {
    gap: spacing.md,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  settingsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  toggleText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  signOutContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
