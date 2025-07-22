import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
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
import { logger } from "@/utils/logger";

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

  // Enhanced animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnimationsRef = useRef<Animated.Value[]>([]);

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
      logger.error("Failed to load tone mode", error as Error, {
        component: "WeeklyWormDigest",
      });
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

    // Initialize card animations
    cardAnimationsRef.current = newInsights.map(() => new Animated.Value(0));
  };

  const animateEntrance = () => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.98);
    headerScaleAnim.setValue(0.95);
    cardAnimationsRef.current.forEach((anim: Animated.Value) =>
      anim.setValue(0)
    );

    // Staggered entrance animation
    Animated.sequence([
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(headerScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.parallel([
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
      ]),
      // Staggered card animations
      Animated.stagger(
        100,
        cardAnimationsRef.current.map((anim: Animated.Value) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  };

  const renderInsightCard = (insight: WeeklyInsight, index: number) => {
    const cardAnim = cardAnimationsRef.current[index] || new Animated.Value(0);

    return (
      <Animated.View
        key={index}
        style={[
          styles.insightCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.insightCardInner}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconContainer}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
            </View>
            <View style={styles.insightContent}>
              <HolisticText variant="title.medium" style={styles.insightTitle}>
                {insight.title}
              </HolisticText>
              <HolisticText
                variant="body.medium"
                color="secondary"
                style={styles.insightMessage}
              >
                {insight.message}
              </HolisticText>
            </View>
            {insight.value !== undefined && (
              <View style={styles.insightValue}>
                <HolisticText
                  variant="title.large"
                  style={[styles.insightValueText, { color: insight.color }]}
                >
                  {insight.value > 0 ? "+" : ""}
                  {insight.value.toFixed(1)}%
                </HolisticText>
              </View>
            )}
          </View>
          {insight.action && (
            <View style={styles.insightAction}>
              <HolisticButton
                title={insight.action}
                onPress={insight.onAction || (() => {})}
                variant="outline"
                size="small"
              />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderStatsSummary = () => {
    if (!stats) return null;

    return (
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: headerScaleAnim }],
          },
        ]}
      >
        <View style={styles.statsHeader}>
          <HolisticText variant="headline.large" style={styles.statsTitle}>
            Weekly Digest
          </HolisticText>
          <HolisticText
            variant="body.large"
            color="secondary"
            style={styles.statsSubtitle}
          >
            Your spending insights for the past 7 days
          </HolisticText>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={24}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.statValue}>${stats.totalSpent.toFixed(2)}</Text>
            <HolisticText variant="body.small" color="secondary">
              Total Spent
            </HolisticText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="receipt" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>{stats.receiptsCount}</Text>
            <HolisticText variant="body.small" color="secondary">
              Receipts
            </HolisticText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="trending-up" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>
              ${stats.averagePerReceipt.toFixed(2)}
            </Text>
            <HolisticText variant="body.small" color="secondary">
              Average
            </HolisticText>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
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
            bounces={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
              {/* Weekly Stats */}
              {renderStatsSummary()}

              {/* Insights */}
              {insights.length > 0 && (
                <View style={styles.insightsContainer}>
                  <View style={styles.insightsHeader}>
                    <HolisticText
                      variant="headline.medium"
                      style={styles.insightsTitle}
                    >
                      Insights & Trends
                    </HolisticText>
                    <HolisticText
                      variant="body.medium"
                      color="secondary"
                      style={styles.insightsSubtitle}
                    >
                      Personalized recommendations based on your spending
                    </HolisticText>
                  </View>
                  <View style={styles.insightsList}>
                    {insights.map((insight, index) =>
                      renderInsightCard(insight, index)
                    )}
                  </View>
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
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    paddingHorizontal: 24,
  },
  statsContainer: {
    marginBottom: 48,
  },
  statsHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  statsTitle: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  statsSubtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  insightsContainer: {
    marginBottom: 48,
  },
  insightsHeader: {
    marginBottom: 24,
  },
  insightsTitle: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  insightsSubtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  insightsList: {
    gap: 16,
  },
  insightCard: {
    marginBottom: 0,
  },
  insightCardInner: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 20,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    marginBottom: 4,
    fontWeight: "500",
  },
  insightMessage: {
    lineHeight: 20,
  },
  insightValue: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  insightValueText: {
    fontWeight: "600",
  },
  insightAction: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  actionContainer: {
    marginBottom: 32,
  },
});
