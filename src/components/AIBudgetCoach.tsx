import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  useTheme,
  ActivityIndicator,
  ProgressBar,
} from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import {
  AppTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { API_CONFIG } from "@/constants/api";

interface BudgetCoaching {
  weekly_analysis: string;
  spending_patterns: string[];
  savings_opportunities: string[];
  motivational_message: string;
  next_week_prediction: number;
  action_items: string[];
  progress_score: number;
}

interface UserSpendingData {
  total_spent: number;
  receipts_count: number;
  average_per_receipt: number;
  spending_by_category: Record<string, number>;
  spending_by_store: Record<string, number>;
  weekly_trend: number;
}

interface BudgetCoachProps {
  userData: UserSpendingData;
  toneMode: "gentle" | "direct";
  onActionItem: (action: string) => void;
}

export function AIBudgetCoach({
  userData,
  toneMode,
  onActionItem,
}: BudgetCoachProps) {
  const theme = useTheme<AppTheme>();
  const [coaching, setCoaching] = useState<BudgetCoaching | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    generateCoaching();
  }, [userData, toneMode]);

  const generateCoaching = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/budget-coaching`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_data: userData, tone_mode: toneMode }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setCoaching(data);
    } catch (error) {
      console.error("Failed to generate coaching:", error);
      // Fallback to mock coaching for demo
      setCoaching(getMockCoaching());
    } finally {
      setLoading(false);
    }
  };

  const getMockCoaching = (): BudgetCoaching => ({
    weekly_analysis:
      "You spent $156.80 this week, which is 12% higher than your average. Your spending on dairy and snacks increased significantly.",
    spending_patterns: [
      "You shop most frequently on weekends",
      "Countdown is your preferred store (70% of trips)",
      "Dairy products are your highest spending category",
    ],
    savings_opportunities: [
      "Switch to store brand dairy products to save $8-12/week",
      "Shop at Pak'nSave for bulk items to save $15-20/week",
      "Buy fresh produce on Wednesdays when prices are lowest",
    ],
    motivational_message:
      "You're making great progress! Small changes can lead to big savings over time.",
    next_week_prediction: 142.5,
    action_items: [
      "Try store brand milk instead of premium brands",
      "Plan your shopping list before going to the store",
      "Check Pak'nSave prices for your regular items",
    ],
    progress_score: 75,
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getToneIcon = () => {
    return toneMode === "gentle" ? "favorite" : "trending-up";
  };

  const getToneColor = () => {
    return toneMode === "gentle" ? "#EC4899" : "#F59E0B";
  };

  const handleActionItem = (action: string) => {
    setSelectedAction(action);
    onActionItem(action);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          variant="bodyMedium"
          style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}
        >
          Analyzing your spending patterns...
        </Text>
      </View>
    );
  }

  if (!coaching) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons
          name="psychology"
          size={24}
          color={theme.colors.primary}
        />
        <Text
          variant="headlineSmall"
          style={{ marginLeft: 8, color: theme.colors.onSurface }}
        >
          AI Budget Coach
        </Text>
        <View style={styles.toneIndicator}>
          <MaterialIcons
            name={getToneIcon()}
            size={16}
            color={getToneColor()}
          />
          <Text
            variant="bodySmall"
            style={{ marginLeft: 4, color: getToneColor() }}
          >
            {toneMode === "gentle" ? "Gentle" : "Direct"}
          </Text>
        </View>
      </View>

      {/* Progress Score */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 600 }}
      >
        <Card
          style={[
            styles.progressCard,
            { borderLeftColor: getProgressColor(coaching.progress_score) },
          ]}
        >
          <Card.Content>
            <View style={styles.progressHeader}>
              <MaterialIcons
                name="assessment"
                size={24}
                color={getProgressColor(coaching.progress_score)}
              />
              <View style={styles.progressTitle}>
                <Text
                  variant="titleMedium"
                  style={{ color: getProgressColor(coaching.progress_score) }}
                >
                  Your Progress Score
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Based on your spending patterns
                </Text>
              </View>
              <Text
                variant="headlineMedium"
                style={{ color: getProgressColor(coaching.progress_score) }}
              >
                {coaching.progress_score}%
              </Text>
            </View>
            <ProgressBar
              progress={coaching.progress_score / 100}
              color={getProgressColor(coaching.progress_score)}
              style={{ marginTop: spacing.sm }}
            />
          </Card.Content>
        </Card>
      </MotiView>

      {/* Weekly Analysis */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 100 }}
      >
        <Card style={styles.analysisCard}>
          <Card.Content>
            <View style={styles.analysisHeader}>
              <MaterialIcons
                name="analytics"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                variant="titleMedium"
                style={{ marginLeft: 8, color: theme.colors.onSurface }}
              >
                Weekly Analysis
              </Text>
            </View>
            <Text
              variant="bodyMedium"
              style={{ marginTop: spacing.sm, color: theme.colors.onSurface }}
            >
              {coaching.weekly_analysis}
            </Text>
          </Card.Content>
        </Card>
      </MotiView>

      {/* Spending Patterns */}
      {coaching.spending_patterns.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 200 }}
        >
          <Card style={styles.patternsCard}>
            <Card.Content>
              <View style={styles.patternsHeader}>
                <MaterialIcons name="timeline" size={24} color="#3B82F6" />
                <Text
                  variant="titleMedium"
                  style={{ marginLeft: 8, color: theme.colors.onSurface }}
                >
                  Your Patterns
                </Text>
              </View>
              {coaching.spending_patterns.map((pattern, index) => (
                <View key={index} style={styles.patternItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#3B82F6"
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ marginLeft: 8, color: theme.colors.onSurface }}
                  >
                    {pattern}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </MotiView>
      )}

      {/* Savings Opportunities */}
      {coaching.savings_opportunities.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
        >
          <Card style={styles.opportunitiesCard}>
            <Card.Content>
              <View style={styles.opportunitiesHeader}>
                <MaterialIcons name="savings" size={24} color="#10B981" />
                <Text
                  variant="titleMedium"
                  style={{ marginLeft: 8, color: theme.colors.onSurface }}
                >
                  Savings Opportunities
                </Text>
              </View>
              {coaching.savings_opportunities.map((opportunity, index) => (
                <View key={index} style={styles.opportunityItem}>
                  <MaterialIcons name="lightbulb" size={16} color="#10B981" />
                  <Text
                    variant="bodyMedium"
                    style={{ marginLeft: 8, color: theme.colors.onSurface }}
                  >
                    {opportunity}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </MotiView>
      )}

      {/* Motivational Message */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 400 }}
      >
        <Card
          style={[styles.motivationCard, { borderLeftColor: getToneColor() }]}
        >
          <Card.Content>
            <View style={styles.motivationHeader}>
              <MaterialIcons
                name={getToneIcon()}
                size={24}
                color={getToneColor()}
              />
              <Text
                variant="titleMedium"
                style={{ marginLeft: 8, color: getToneColor() }}
              >
                {toneMode === "gentle" ? "Encouragement" : "Motivation"}
              </Text>
            </View>
            <Text
              variant="bodyLarge"
              style={{ marginTop: spacing.sm, color: theme.colors.onSurface }}
            >
              {coaching.motivational_message}
            </Text>
          </Card.Content>
        </Card>
      </MotiView>

      {/* Action Items */}
      {coaching.action_items.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 500 }}
        >
          <Card style={styles.actionCard}>
            <Card.Content>
              <View style={styles.actionHeader}>
                <MaterialIcons name="assignment" size={24} color="#F59E0B" />
                <Text
                  variant="titleMedium"
                  style={{ marginLeft: 8, color: theme.colors.onSurface }}
                >
                  This Week's Actions
                </Text>
              </View>
              {coaching.action_items.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionItem,
                    selectedAction === action && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  onPress={() => handleActionItem(action)}
                >
                  <MaterialIcons
                    name="radio-button-unchecked"
                    size={16}
                    color="#F59E0B"
                  />
                  <Text
                    variant="bodyMedium"
                    style={{
                      marginLeft: 8,
                      color: theme.colors.onSurface,
                      flex: 1,
                    }}
                  >
                    {action}
                  </Text>
                  <IconButton
                    icon="chevron-right"
                    size={16}
                    onPress={() => handleActionItem(action)}
                  />
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        </MotiView>
      )}

      {/* Next Week Prediction */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 600 }}
      >
        <Card style={styles.predictionCard}>
          <Card.Content>
            <View style={styles.predictionHeader}>
              <MaterialIcons name="trending-down" size={24} color="#10B981" />
              <Text
                variant="titleMedium"
                style={{ marginLeft: 8, color: theme.colors.onSurface }}
              >
                Next Week Prediction
              </Text>
            </View>
            <Text
              variant="headlineMedium"
              style={{ color: "#10B981", marginTop: spacing.sm }}
            >
              {formatCurrency(coaching.next_week_prediction)}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              Based on your patterns and planned actions
            </Text>
          </Card.Content>
        </Card>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  toneIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: borderRadius.sm,
  },
  progressCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTitle: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  analysisCard: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  patternsCard: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  patternsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  patternItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  opportunitiesCard: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  opportunitiesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  opportunityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  motivationCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionCard: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  predictionCard: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
});
