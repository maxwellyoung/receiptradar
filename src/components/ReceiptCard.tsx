import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
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
  if (name.includes("countdown")) return "store";
  if (name.includes("pak'n") || name.includes("paknsave"))
    return "local-grocery-store";
  if (name.includes("new world")) return "storefront";
  if (name.includes("four square")) return "local-convenience-store";
  if (name.includes("supermarket")) return "shopping-cart";
  if (name.includes("dairy")) return "local-dining";
  if (name.includes("pharmacy")) return "local-pharmacy";
  if (name.includes("liquor")) return "local-bar";
  return "store";
};

const getSpendingContext = (
  amount: number
): { label: string; color: string } => {
  if (amount < 20) return { label: "Small", color: "#34C759" };
  if (amount < 50) return { label: "Modest", color: "#007AFF" };
  if (amount < 100) return { label: "Regular", color: "#FF9500" };
  if (amount < 200) return { label: "Large", color: "#FF6B35" };
  return { label: "Major", color: "#AF52DE" };
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
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={storeIcon as any}
                size={20}
                color={theme.colors.primary}
              />
            </View>
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
            <View
              style={[
                styles.contextBadge,
                { backgroundColor: spendingContext.color + "15" },
              ]}
            >
              <Text
                style={[styles.contextText, { color: spendingContext.color }]}
              >
                {spendingContext.label}
              </Text>
            </View>
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  storeDetails: {
    flex: 1,
  },
  spendingContext: {
    alignSelf: "flex-start",
  },
  contextBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  contextText: {
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
