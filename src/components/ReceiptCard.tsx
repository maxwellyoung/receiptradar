import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { Receipt } from "@/types";
import { spacing, borderRadius, shadows, typography } from "@/constants/theme";

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const theme = useTheme<AppTheme>();

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
        <View style={styles.info}>
          <Text
            style={[
              typography.title2,
              { color: theme.colors.onSurface, marginBottom: spacing.xs },
            ]}
          >
            {receipt.store?.name ?? "Store"}
          </Text>
          <Text
            style={[typography.body2, { color: theme.colors.onSurfaceVariant }]}
          >
            {new Date(receipt.ts).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[typography.headline3, { color: theme.colors.secondary }]}>
          ${receipt.total.toFixed(2)}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
});
