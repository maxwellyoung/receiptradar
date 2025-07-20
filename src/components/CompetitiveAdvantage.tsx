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

interface CompetitiveAdvantageProps {
  title?: string;
  showDetails?: boolean;
  variant?: "compact" | "detailed" | "comparison";
}

export const CompetitiveAdvantage: React.FC<CompetitiveAdvantageProps> = ({
  title = "ReceiptRadar vs Competitors",
  showDetails = false,
  variant = "detailed",
}) => {
  const theme = useTheme<AppTheme>();
  const [expanded, setExpanded] = useState(showDetails);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const advantages = [
    {
      id: "complete-ecosystem",
      title: "Complete Savings Ecosystem",
      description:
        "The only app that combines pre-purchase planning with post-purchase analysis",
      icon: "sync",
      color: "#10B981",
      details: [
        "Pre-purchase: Find the best prices before you shop",
        "Post-purchase: Scan receipts to validate your savings",
        "Future planning: Get personalized recommendations",
      ],
    },
    {
      id: "real-data",
      title: "Real Receipt Data",
      description:
        "Prices from actual customer receipts, not estimated web scraping",
      icon: "receipt",
      color: "#3B82F6",
      details: [
        "99.2% accuracy from verified receipt data",
        "Live updates as customers scan receipts",
        "No outdated or estimated prices",
      ],
    },
    {
      id: "savings-validation",
      title: "Savings Validation",
      description:
        "Track actual savings vs. planned savings with receipt scanning",
      icon: "verified",
      color: "#F59E0B",
      details: [
        "Compare planned vs. actual spending",
        "Validate that you got the best deals",
        "Track your savings over time",
      ],
    },
    {
      id: "price-history",
      title: "Price History with Real Data",
      description:
        "Historical tracking based on actual purchases, not web estimates",
      icon: "trending-up",
      color: "#8B5CF6",
      details: [
        "Price trends from real purchase data",
        "Predictive insights for future savings",
        "Personalized price alerts based on your shopping",
      ],
    },
  ];

  const competitorComparison = [
    {
      feature: "Price Comparison",
      receiptRadar: "✅ Advanced with real data",
      grocer: "✅ Basic web scraping",
      groSave: "✅ Enhanced web scraping",
    },
    {
      feature: "Receipt Scanning",
      receiptRadar: "✅ Complete with analysis",
      grocer: "❌ Not available",
      groSave: "❌ Not available",
    },
    {
      feature: "Savings Validation",
      receiptRadar: "✅ Actual vs. planned",
      grocer: "❌ No validation",
      groSave: "❌ No validation",
    },
    {
      feature: "Price History",
      receiptRadar: "✅ Real purchase data",
      grocer: "✅ Web scraping data",
      groSave: "✅ Web scraping data",
    },
    {
      feature: "Complete Savings Loop",
      receiptRadar: "✅ Full ecosystem",
      grocer: "❌ Planning only",
      groSave: "❌ Planning only",
    },
  ];

  const handleFeaturePress = (featureId: string) => {
    setSelectedFeature(selectedFeature === featureId ? null : featureId);
  };

  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        <Text style={[styles.compactTitle, { color: theme.colors.primary }]}>
          Why Choose ReceiptRadar?
        </Text>
        <View style={styles.compactAdvantages}>
          {advantages.slice(0, 2).map((advantage) => (
            <View key={advantage.id} style={styles.compactAdvantage}>
              <MaterialIcons
                name={advantage.icon as any}
                size={20}
                color={advantage.color}
              />
              <Text style={styles.compactAdvantageText}>{advantage.title}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (variant === "comparison") {
    return (
      <View style={styles.comparisonContainer}>
        <Text style={[styles.comparisonTitle, { color: theme.colors.primary }]}>
          How We Compare
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonHeaderText}>Feature</Text>
              <Text
                style={[
                  styles.comparisonHeaderText,
                  { color: theme.colors.primary },
                ]}
              >
                ReceiptRadar
              </Text>
              <Text style={styles.comparisonHeaderText}>Grocer</Text>
              <Text style={styles.comparisonHeaderText}>GroSave</Text>
            </View>
            {competitorComparison.map((row, index) => (
              <View key={index} style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>{row.feature}</Text>
                <Text
                  style={[
                    styles.comparisonValue,
                    { color: theme.colors.primary },
                  ]}
                >
                  {row.receiptRadar}
                </Text>
                <Text style={styles.comparisonValue}>{row.grocer}</Text>
                <Text style={styles.comparisonValue}>{row.groSave}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          {title}
        </Text>
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={24}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <Animated.View style={styles.content}>
          {/* Unique Value Proposition */}
          <View style={styles.valueProposition}>
            <Text style={styles.valuePropositionTitle}>
              The Complete Savings Ecosystem
            </Text>
            <Text style={styles.valuePropositionText}>
              While other apps only help you plan purchases, ReceiptRadar is the
              only app that completes the savings loop by validating your actual
              savings through receipt scanning.
            </Text>
          </View>

          {/* Key Advantages */}
          <View style={styles.advantagesContainer}>
            {advantages.map((advantage) => (
              <TouchableOpacity
                key={advantage.id}
                style={[
                  styles.advantageCard,
                  { backgroundColor: theme.colors.surface },
                  selectedFeature === advantage.id && styles.selectedCard,
                ]}
                onPress={() => handleFeaturePress(advantage.id)}
                activeOpacity={0.8}
              >
                <View style={styles.advantageHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: advantage.color + "20" },
                    ]}
                  >
                    <MaterialIcons
                      name={advantage.icon as any}
                      size={24}
                      color={advantage.color}
                    />
                  </View>
                  <View style={styles.advantageText}>
                    <Text
                      style={[
                        styles.advantageTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {advantage.title}
                    </Text>
                    <Text
                      style={[
                        styles.advantageDescription,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {advantage.description}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={
                      selectedFeature === advantage.id
                        ? "expand-less"
                        : "expand-more"
                    }
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>

                {selectedFeature === advantage.id && (
                  <View style={styles.advantageDetails}>
                    {advantage.details.map((detail, index) => (
                      <View key={index} style={styles.detailItem}>
                        <MaterialIcons
                          name="check-circle"
                          size={16}
                          color={advantage.color}
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
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Competitive Summary */}
          <View style={styles.competitiveSummary}>
            <Text
              style={[styles.summaryTitle, { color: theme.colors.primary }]}
            >
              Why We're Different
            </Text>
            <View style={styles.summaryPoints}>
              <View style={styles.summaryPoint}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.summaryText}>
                  <Text style={{ fontWeight: "600" }}>Complete Solution:</Text>{" "}
                  Planning + Validation + Analysis
                </Text>
              </View>
              <View style={styles.summaryPoint}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.summaryText}>
                  <Text style={{ fontWeight: "600" }}>Real Data:</Text> Actual
                  receipts vs. web estimates
                </Text>
              </View>
              <View style={styles.summaryPoint}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.summaryText}>
                  <Text style={{ fontWeight: "600" }}>Savings Validation:</Text>{" "}
                  Prove you actually saved money
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  title: {
    ...typography.headline3,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  valueProposition: {
    backgroundColor: "#F0FDF4",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  valuePropositionTitle: {
    ...typography.headline1,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: spacing.sm,
  },
  valuePropositionText: {
    ...typography.body2,
    color: "#047857",
    lineHeight: 22,
  },
  advantagesContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  advantageCard: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  selectedCard: {
    ...shadows.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  advantageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  advantageText: {
    flex: 1,
  },
  advantageTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  advantageDescription: {
    ...typography.body2,
    lineHeight: 20,
  },
  advantageDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
  },
  competitiveSummary: {
    backgroundColor: "#F8FAFC",
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryTitle: {
    ...typography.headline1,
    fontWeight: "600",
    marginBottom: spacing.md,
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
    color: "#374151",
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  compactContainer: {
    padding: spacing.md,
  },
  compactTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  compactAdvantages: {
    gap: spacing.sm,
  },
  compactAdvantage: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactAdvantageText: {
    ...typography.body2,
    marginLeft: spacing.sm,
  },
  comparisonContainer: {
    padding: spacing.md,
  },
  comparisonTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  comparisonTable: {
    minWidth: 600,
  },
  comparisonHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  comparisonHeaderText: {
    ...typography.caption1,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  comparisonRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  comparisonFeature: {
    ...typography.caption1,
    fontWeight: "500",
    flex: 1,
  },
  comparisonValue: {
    ...typography.caption1,
    flex: 1,
    textAlign: "center",
  },
});
