import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";

interface CompleteSavingsEcosystemProps {
  variant?: "hero" | "detailed" | "compact";
  showAnimation?: boolean;
}

export const CompleteSavingsEcosystem: React.FC<
  CompleteSavingsEcosystemProps
> = ({ variant = "detailed", showAnimation = true }) => {
  const theme = useTheme<AppTheme>();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const savingsLoop = [
    {
      step: 1,
      title: "Plan Your Shopping",
      description: "Find the best prices across all stores before you shop",
      icon: "search",
      color: "#3B82F6",
      details: [
        "Compare prices across Countdown, New World, Pak'nSave",
        "Create optimized shopping lists",
        "Set price alerts for items you want",
        "Find the best store for your entire basket",
      ],
      action: "Start Planning",
    },
    {
      step: 2,
      title: "Shop Smart",
      description: "Use real-time price comparison while shopping",
      icon: "shopping-cart",
      color: "#10B981",
      details: [
        "Scan barcodes for instant price checks",
        "Get live price updates as you shop",
        "See price history to spot real deals",
        "Validate prices against your plan",
      ],
      action: "Shop Now",
    },
    {
      step: 3,
      title: "Scan & Validate",
      description: "Scan your receipt to validate your actual savings",
      icon: "receipt",
      color: "#F59E0B",
      details: [
        "OCR scanning extracts all purchase data",
        "Compare actual spending vs. planned spending",
        "Track your real savings over time",
        "Get insights on where you could save more",
      ],
      action: "Scan Receipt",
    },
    {
      step: 4,
      title: "Optimize & Save More",
      description: "Get personalized recommendations for future savings",
      icon: "trending-up",
      color: "#8B5CF6",
      details: [
        "AI-powered spending pattern analysis",
        "Personalized savings recommendations",
        "Budget optimization suggestions",
        "Predictive price alerts",
      ],
      action: "Get Insights",
    },
  ];

  const handleStepPress = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  if (variant === "hero") {
    return (
      <View style={styles.heroContainer}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: theme.colors.primary }]}>
            The Complete Savings Ecosystem
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            The only app that combines planning, shopping, validation, and
            optimization
          </Text>
          <View style={styles.heroSteps}>
            {savingsLoop.map((step, index) => (
              <View key={step.step} style={styles.heroStep}>
                <View
                  style={[
                    styles.heroStepIcon,
                    { backgroundColor: step.color + "20" },
                  ]}
                >
                  <MaterialIcons
                    name={step.icon as any}
                    size={24}
                    color={step.color}
                  />
                </View>
                <Text
                  style={[
                    styles.heroStepTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {step.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        <Text style={[styles.compactTitle, { color: theme.colors.primary }]}>
          Complete Savings Loop
        </Text>
        <View style={styles.compactLoop}>
          {savingsLoop.map((step, index) => (
            <View key={step.step} style={styles.compactStep}>
              <View
                style={[
                  styles.compactStepNumber,
                  { backgroundColor: step.color },
                ]}
              >
                <Text style={styles.compactStepNumberText}>{step.step}</Text>
              </View>
              <Text
                style={[
                  styles.compactStepTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                {step.title}
              </Text>
              {index < savingsLoop.length - 1 && (
                <MaterialIcons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Complete Savings Ecosystem
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Unlike other apps that only help you plan, ReceiptRadar completes the
          entire savings loop
        </Text>
      </View>

      <ScrollView
        style={styles.stepsContainer}
        showsVerticalScrollIndicator={false}
      >
        {savingsLoop.map((step, index) => (
          <TouchableOpacity
            key={step.step}
            style={[
              styles.stepCard,
              { backgroundColor: theme.colors.surface },
              expandedStep === step.step && styles.expandedCard,
            ]}
            onPress={() => handleStepPress(step.step)}
            activeOpacity={0.8}
          >
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberContainer}>
                <View
                  style={[styles.stepNumber, { backgroundColor: step.color }]}
                >
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View
                  style={[
                    styles.stepIconContainer,
                    { backgroundColor: step.color + "20" },
                  ]}
                >
                  <MaterialIcons
                    name={step.icon as any}
                    size={24}
                    color={step.color}
                  />
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[styles.stepTitle, { color: theme.colors.onSurface }]}
                >
                  {step.title}
                </Text>
                <Text
                  style={[
                    styles.stepDescription,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {step.description}
                </Text>
              </View>
              <MaterialIcons
                name={
                  expandedStep === step.step ? "expand-less" : "expand-more"
                }
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </View>

            {expandedStep === step.step && (
              <Animated.View style={styles.stepDetails}>
                <View style={styles.detailsList}>
                  {step.details.map((detail, detailIndex) => (
                    <View key={detailIndex} style={styles.detailItem}>
                      <MaterialIcons
                        name="check-circle"
                        size={16}
                        color={step.color}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {detail}
                      </Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: step.color }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>{step.action}</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {index < savingsLoop.length - 1 && (
              <View style={styles.stepConnector}>
                <MaterialIcons
                  name="arrow-downward"
                  size={24}
                  color={step.color}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <Text style={[styles.summaryTitle, { color: theme.colors.primary }]}>
          Why This Matters
        </Text>
        <View style={styles.summaryPoints}>
          <View style={styles.summaryPoint}>
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
            <Text
              style={[styles.summaryText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Complete Solution:</Text> No
              other app offers this full cycle
            </Text>
          </View>
          <View style={styles.summaryPoint}>
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
            <Text
              style={[styles.summaryText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Proven Savings:</Text>{" "}
              Validate that you actually saved money
            </Text>
          </View>
          <View style={styles.summaryPoint}>
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
            <Text
              style={[styles.summaryText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Continuous Improvement:</Text>{" "}
              Get smarter with every receipt
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  stepsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  expandedCard: {
    ...shadows.md,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumberContainer: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stepNumberText: {
    ...typography.body2,
    fontWeight: "700",
    color: "white",
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.body2,
    lineHeight: 20,
  },
  stepDetails: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  detailsList: {
    marginBottom: spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    ...typography.body2,
    fontWeight: "600",
    color: "white",
    marginRight: spacing.sm,
  },
  stepConnector: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  summary: {
    padding: spacing.lg,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  summaryTitle: {
    ...typography.headline1,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  summaryPoints: {
    gap: spacing.sm,
  },
  summaryPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  summaryText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  heroContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
    maxWidth: 400,
  },
  heroTitle: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  heroSteps: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  heroStep: {
    alignItems: "center",
    flex: 1,
  },
  heroStepIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  heroStepTitle: {
    ...typography.caption1,
    fontWeight: "600",
    textAlign: "center",
  },
  compactContainer: {
    padding: spacing.md,
  },
  compactTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  compactLoop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactStep: {
    alignItems: "center",
    flexDirection: "row",
  },
  compactStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.xs,
  },
  compactStepNumberText: {
    ...typography.caption2,
    fontWeight: "700",
    color: "white",
  },
  compactStepTitle: {
    ...typography.caption1,
    fontWeight: "500",
  },
});
