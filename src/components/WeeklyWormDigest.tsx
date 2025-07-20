import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HolisticButton } from "./HolisticDesignSystem";
import { HolisticText } from "./HolisticDesignSystem";
import { HolisticContainer } from "./HolisticDesignSystem";
import { HolisticCard } from "./HolisticDesignSystem";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";

import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface WeeklyInsight {
  type: "spending" | "savings" | "trend" | "challenge" | "achievement";
  title: string;
  message: string;
  value?: number;
  icon: string;
  color: string;
  action?: string;
  onAction?: () => void;
}

interface WeeklyStats {
  totalSpent: number;
  receiptsCount: number;
  averagePerReceipt: number;
  topCategories: string[];
  savingsOpportunities: number;
  weekOverWeekChange: number;
}

export const WeeklyWormDigest: React.FC<{
  isVisible: boolean;
  onDismiss: () => void;
  onScanReceipt: () => void;
}> = ({ isVisible, onDismiss, onScanReceipt }) => {
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  const [toneMode, setToneMode] = useState<"gentle" | "hard">("gentle");
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);

  const { user } = useAuthContext();
  const { receipts, loading } = useReceipts(user?.id || "");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isVisible) {
      loadToneMode();
      generateWeeklyStats();
      animateEntrance();
    }
  }, [isVisible, receipts]);

  const loadToneMode = async () => {
    try {
      const savedTone = await AsyncStorage.getItem("@toneMode");
      if (savedTone) {
        setToneMode(savedTone as "gentle" | "hard");
      }
    } catch (error) {
      console.error("Failed to load tone mode:", error);
    }
  };

  const generateWeeklyStats = () => {
    if (!receipts || receipts.length === 0) {
      setStats({
        totalSpent: 0,
        receiptsCount: 0,
        averagePerReceipt: 0,
        topCategories: [],
        savingsOpportunities: 0,
        weekOverWeekChange: 0,
      });
      return;
    }

    // Get receipts from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyReceipts = receipts.filter(
      (receipt) => new Date(receipt.created_at) >= oneWeekAgo
    );

    const totalSpent = weeklyReceipts.reduce(
      (sum, receipt) => sum + (receipt.total || 0),
      0
    );

    const averagePerReceipt = totalSpent / weeklyReceipts.length;

    // Real data from receipts
    const mockStats: WeeklyStats = {
      totalSpent,
      receiptsCount: weeklyReceipts.length,
      averagePerReceipt,
      topCategories: [], // Will be calculated from real data
      savingsOpportunities: 0, // Will be calculated from real data
      weekOverWeekChange: 0, // Will be calculated from real data
    };

    setStats(mockStats);
    generateInsights(mockStats);
  };

  const generateInsights = (stats: WeeklyStats) => {
    const newInsights: WeeklyInsight[] = [];

    // Spending insight
    if (stats.totalSpent > 0) {
      const spendingMessage =
        toneMode === "gentle"
          ? `You spent $${stats.totalSpent.toFixed(2)} this week across ${
              stats.receiptsCount
            } receipts. That's $${stats.averagePerReceipt.toFixed(2)} per trip!`
          : `$${stats.totalSpent.toFixed(
              2
            )} in one week. At least you're consistent.`;

      newInsights.push({
        type: "spending",
        title: "Weekly Spending",
        message: spendingMessage,
        value: stats.totalSpent,
        icon: "💰",
        color: "#4CAF50",
      });
    }

    // Savings opportunities
    if (stats.savingsOpportunities > 0) {
      newInsights.push({
        type: "savings",
        title: "Savings Opportunities",
        message: `You could save $${stats.savingsOpportunities.toFixed(
          2
        )} by switching stores for your top items`,
        value: stats.savingsOpportunities,
        icon: "🎯",
        color: "#FF9800",
        action: "View Opportunities",
        onAction: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Navigate to savings opportunities
        },
      });
    }

    // Week over week change
    if (stats.weekOverWeekChange !== 0) {
      const changeMessage =
        stats.weekOverWeekChange > 0
          ? toneMode === "gentle"
            ? `Spending is up ${Math.abs(
                stats.weekOverWeekChange
              )}% from last week. Maybe time to check the budget?`
            : `Spending up ${Math.abs(
                stats.weekOverWeekChange
              )}%. Inflation or impulse buying?`
          : toneMode === "gentle"
          ? `Great job! Spending is down ${Math.abs(
              stats.weekOverWeekChange
            )}% from last week!`
          : `Spending down ${Math.abs(
              stats.weekOverWeekChange
            )}%. Finally learning restraint?`;

      newInsights.push({
        type: "trend",
        title: "Week Over Week",
        message: changeMessage,
        value: stats.weekOverWeekChange,
        icon: stats.weekOverWeekChange > 0 ? "📈" : "📉",
        color: stats.weekOverWeekChange > 0 ? "#F44336" : "#4CAF50",
      });
    }

    // Challenge
    const challenges = [
      "Try a $50 grocery shop this week",
      "Buy only store brands for one shopping trip",
      "Plan meals for the entire week before shopping",
      "Use only cash for grocery shopping",
    ];

    const randomChallenge =
      challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);

    newInsights.push({
      type: "challenge",
      title: "Weekly Challenge",
      message: randomChallenge,
      icon: "🏆",
      color: "#9C27B0",
      action: "Accept Challenge",
      onAction: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Save challenge to AsyncStorage
        AsyncStorage.setItem("@currentChallenge", randomChallenge);
      },
    });

    // Achievement (if applicable)
    if (stats.weekOverWeekChange < -10) {
      newInsights.push({
        type: "achievement",
        title: "Achievement Unlocked!",
        message:
          toneMode === "gentle"
            ? "You're a savings superstar! Spending down significantly this week! 🌟"
            : "Well, well, well. Look who's finally learning to budget.",
        icon: "⭐",
        color: "#FFD700",
      });
    }

    setInsights(newInsights);
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderInsightCard = (insight: WeeklyInsight, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.insightCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <HolisticCard
        title={insight.title}
        content={insight.message}
        variant="elevated"
      >
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          {insight.value !== undefined && (
            <HolisticText
              variant="title.medium"
              style={{
                color: insight.color,
                fontWeight: insight.value > 0 ? "600" : "400",
              }}
            >
              {insight.value > 0 ? "+" : ""}
              {insight.value.toFixed(1)}%
            </HolisticText>
          )}
        </View>
        {insight.action && (
          <View style={styles.actionContainer}>
            <HolisticButton
              title={insight.action}
              onPress={insight.onAction || (() => {})}
              variant="outline"
              size="small"
            />
          </View>
        )}
      </HolisticCard>
    </Animated.View>
  );

  const renderStatsSummary = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <HolisticText variant="headline.medium" style={styles.statsTitle}>
          This Week's Summary
        </HolisticText>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${stats.totalSpent.toFixed(2)}</Text>
            <HolisticText variant="body.small" color="secondary">
              Total Spent
            </HolisticText>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.receiptsCount}</Text>
            <HolisticText variant="body.small" color="secondary">
              Receipts
            </HolisticText>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${stats.averagePerReceipt.toFixed(2)}
            </Text>
            <HolisticText variant="body.small" color="secondary">
              Average
            </HolisticText>
          </View>
        </View>
      </View>
    );
  };

  if (!isVisible) return null;

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
          <HolisticContainer padding="large">
            {/* Weekly Stats */}
            {renderStatsSummary()}

            {/* Insights */}
            {insights.length > 0 && (
              <View style={styles.insightsContainer}>
                <HolisticText
                  variant="title.large"
                  style={styles.insightsTitle}
                >
                  Weekly Insights
                </HolisticText>
                {insights.map((insight, index) =>
                  renderInsightCard(insight, index)
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <HolisticButton
                title="Scan New Receipt"
                onPress={onScanReceipt}
                variant="primary"
                size="large"
                fullWidth
                icon={
                  <MaterialIcons name="camera-alt" size={20} color="white" />
                }
              />

              <HolisticButton
                title="Close Digest"
                onPress={onDismiss}
                variant="ghost"
                size="medium"
                icon={<MaterialIcons name="close" size={18} color="#666" />}
              />
            </View>
          </HolisticContainer>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

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

  statsContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  statsTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  insightsContainer: {
    marginBottom: 32,
  },
  insightsTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  insightCard: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  insightIcon: {
    fontSize: 24,
  },
  actionContainer: {
    gap: 12,
  },
});
