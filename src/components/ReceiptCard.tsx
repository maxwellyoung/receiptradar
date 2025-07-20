import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, useTheme, Chip } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { Receipt } from "@/types";
import { spacing, borderRadius, shadows, typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

const getStoreIcon = (storeName: string): string => {
  const name = storeName.toLowerCase();
  if (name.includes("countdown")) return "🛒";
  if (name.includes("pak'n") || name.includes("paknsave")) return "🥬";
  if (name.includes("new world")) return "🌍";
  if (name.includes("four square")) return "🏪";
  if (name.includes("supermarket")) return "🛍️";
  if (name.includes("dairy")) return "🥛";
  if (name.includes("pharmacy")) return "💊";
  if (name.includes("liquor")) return "🍷";
  return "🛒";
};

const getSpendingContext = (
  amount: number
): { label: string; color: string; emoji: string } => {
  if (amount < 20) return { label: "Small", color: "#34C759", emoji: "🐹" };
  if (amount < 50) return { label: "Modest", color: "#007AFF", emoji: "😌" };
  if (amount < 100) return { label: "Regular", color: "#FF9500", emoji: "🛒" };
  if (amount < 200) return { label: "Big", color: "#FF6B35", emoji: "🛍️" };
  return { label: "Major", color: "#AF52DE", emoji: "👑" };
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const receiptDate = new Date(timestamp);
  const diffInHours =
    (now.getTime() - receiptDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return receiptDate.toLocaleDateString();
};

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const theme = useTheme<AppTheme>();
  const storeIcon = getStoreIcon(receipt.store?.name ?? "Store");
  const spendingContext = getSpendingContext(receipt.total);
  const timeAgo = getTimeAgo(receipt.ts);

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: borderRadius.md,
          ...shadows.card,
        },
      ]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.storeInfo}>
            <Text style={styles.storeIcon}>{storeIcon}</Text>
            <View style={styles.storeDetails}>
              <Text
                style={[
                  typography.title2,
                  { color: theme.colors.onSurface, marginBottom: spacing.xs },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {receipt.store?.name ?? "Store"}
              </Text>
              <Text
                style={[
                  typography.body2,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {timeAgo}
              </Text>
            </View>
          </View>

          <View style={styles.spendingContext}>
            <Chip
              icon={() => (
                <Text style={styles.chipEmoji}>{spendingContext.emoji}</Text>
              )}
              style={[
                styles.contextChip,
                { backgroundColor: spendingContext.color + "20" },
              ]}
              textStyle={[styles.chipText, { color: spendingContext.color }]}
            >
              {spendingContext.label}
            </Chip>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text
            style={[typography.headline3, { color: theme.colors.secondary }]}
          >
            ${receipt.total.toFixed(2)}
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minHeight: 80,
  },
  leftSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  storeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  storeDetails: {
    flex: 1,
  },
  spendingContext: {
    alignSelf: "flex-start",
  },
  contextChip: {
    height: 32,
    paddingHorizontal: spacing.sm,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 60,
  },
});
