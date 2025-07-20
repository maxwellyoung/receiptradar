import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Switch, useTheme, Divider } from "react-native-paper";
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface UserStats {
  totalReceipts: number;
  totalSpent: number;
  averagePerShop: number;
  biggestSave: number;
  weeklyStreak: number;
  title: string;
}

const calculateUserStats = (receipts: any[]): UserStats => {
  const totalReceipts = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const averagePerShop = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  // Mock stats for demo
  const biggestSave = 15.5; // Mock
  const weeklyStreak = 3; // Mock

  const titles = [
    "Getting Started",
    "Regular Tracker",
    "Dedicated User",
    "Spending Analyst",
    "Financial Mindful",
    "Receipt Master",
  ];

  const titleIndex = Math.min(Math.floor(totalReceipts / 5), titles.length - 1);
  const title = titles[titleIndex];

  return {
    totalReceipts,
    totalSpent,
    averagePerShop,
    biggestSave,
    weeklyStreak,
    title,
  };
};

const generateAchievements = (stats: UserStats): Achievement[] => [
  {
    id: "first-scan",
    title: "First Steps",
    description: "Scan your first receipt",
    icon: "camera-alt",
    unlocked: stats.totalReceipts >= 1,
  },
  {
    id: "savings-master",
    title: "Savings Master",
    description: "Save $20 in a week",
    icon: "savings",
    unlocked: stats.biggestSave >= 20,
    progress: stats.biggestSave,
    maxProgress: 20,
  },
  {
    id: "streak-keeper",
    title: "Streak Keeper",
    description: "Scan receipts for 7 days in a row",
    icon: "local-fire-department",
    unlocked: stats.weeklyStreak >= 7,
    progress: stats.weeklyStreak,
    maxProgress: 7,
  },
  {
    id: "home-brand",
    title: "Smart Shopper",
    description: "Swap 5 items to store brand",
    icon: "home",
    unlocked: false,
    progress: 2,
    maxProgress: 5,
  },
  {
    id: "budget-boss",
    title: "Budget Conscious",
    description: "Stay under $50 for 3 shops",
    icon: "account-balance-wallet",
    unlocked: false,
    progress: 1,
    maxProgress: 3,
  },
  {
    id: "receipt-royalty",
    title: "Receipt Royalty",
    description: "Scan 50 receipts total",
    icon: "star",
    unlocked: stats.totalReceipts >= 50,
    progress: stats.totalReceipts,
    maxProgress: 50,
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user, signOut } = useAuthContext();
  const { toneMode, setToneMode } = useToneMode();
  const { receipts } = useReceipts(user?.id ?? "");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);

  const stats = calculateUserStats(receipts);
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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <HolisticText variant="headline.medium" style={styles.userTitle}>
              {stats.title}
            </HolisticText>
            <HolisticText variant="body.medium" color="secondary">
              {stats.totalReceipts} receipts scanned
            </HolisticText>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <HolisticText variant="title.large" style={styles.sectionTitle}>
            Your Stats
          </HolisticText>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons
                name="receipt"
                size={24}
                color={theme.colors.primary}
              />
              <HolisticText variant="title.medium" style={styles.statValue}>
                {stats.totalReceipts}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Receipts Scanned
              </HolisticText>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="account-balance-wallet"
                size={24}
                color={theme.colors.primary}
              />
              <HolisticText variant="title.medium" style={styles.statValue}>
                {formatCurrency(stats.totalSpent)}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Total Spent
              </HolisticText>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="store"
                size={24}
                color={theme.colors.primary}
              />
              <HolisticText variant="title.medium" style={styles.statValue}>
                {formatCurrency(stats.averagePerShop)}
              </HolisticText>
              <HolisticText variant="body.small" color="secondary">
                Avg per Shop
              </HolisticText>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="local-fire-department"
                size={24}
                color={theme.colors.primary}
              />
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
                  <MaterialIcons
                    name={achievement.icon as any}
                    size={24}
                    color={
                      achievement.unlocked
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
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
                <HolisticText variant="title.medium">App Tone</HolisticText>
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
                    {toneMode === "gentle" ? "Gentle" : "Direct"}
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
                  Weekly spending insights and trends
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
          />
        </View>
      </ScrollView>
    </View>
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
  },
  userTitle: {
    marginBottom: spacing.xs,
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
    backgroundColor: "white",
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  statValue: {
    marginTop: spacing.xs,
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
    backgroundColor: "white",
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
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
    overflow: "hidden",
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
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    marginVertical: spacing.sm,
  },
  signOutContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
});
