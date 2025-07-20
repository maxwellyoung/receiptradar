import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Chip, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { AppTheme, spacing, typography, borderRadius } from "@/constants/theme";

interface CompetitiveAdvantageProps {
  title?: string;
  showDetails?: boolean;
}

export function CompetitiveAdvantage({
  title = "Why ReceiptRadar is Different",
  showDetails = false,
}: CompetitiveAdvantageProps) {
  const theme = useTheme<AppTheme>();

  const advantages = [
    {
      icon: "receipt",
      title: "Receipt-Based Intelligence",
      description: "Real prices from actual receipts, not web scraping",
      benefit: "99% accuracy vs 70% on web-based sites",
    },
    {
      icon: "schedule",
      title: "Real-Time Updates",
      description: "Instant price capture when you scan receipts",
      benefit: "No waiting for website updates",
    },
    {
      icon: "person",
      title: "Personal Shopping History",
      description: "Tracks your actual spending patterns",
      benefit: "Personalized insights and recommendations",
    },
    {
      icon: "family-restroom",
      title: "Household Management",
      description: "Share shopping data with family members",
      benefit: "Coordinated household budgeting",
    },
  ];

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {title}
        </Text>

        <View style={styles.advantagesContainer}>
          {advantages.map((advantage, index) => (
            <MotiView
              key={advantage.title}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
              style={styles.advantageItem}
            >
              <View style={styles.advantageHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <MaterialIcons
                    name={advantage.icon as any}
                    size={24}
                    color={theme.colors.onPrimaryContainer}
                  />
                </View>
                <View style={styles.advantageText}>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {advantage.title}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {advantage.description}
                  </Text>
                </View>
              </View>

              {showDetails && (
                <Chip
                  mode="outlined"
                  style={[
                    styles.benefitChip,
                    { borderColor: theme.colors.primary },
                  ]}
                  textStyle={{ color: theme.colors.primary }}
                >
                  {advantage.benefit}
                </Chip>
              )}
            </MotiView>
          ))}
        </View>

        {!showDetails && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 500 }}
            style={styles.comparisonNote}
          >
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
              }}
            >
              Unlike web-based price comparison sites, ReceiptRadar uses your
              actual receipt data for unmatched accuracy and personalization.
            </Text>
          </MotiView>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    borderRadius: borderRadius.lg,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: "center",
    ...typography.headline1,
  },
  advantagesContainer: {
    gap: spacing.md,
  },
  advantageItem: {
    gap: spacing.sm,
  },
  advantageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  advantageText: {
    flex: 1,
    gap: spacing.xs,
  },
  benefitChip: {
    alignSelf: "flex-start",
    marginLeft: 56, // Align with text content
  },
  comparisonNote: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
