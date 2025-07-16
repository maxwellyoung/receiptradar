import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { Receipt } from "@/types";

interface ReceiptCardProps {
  receipt: Receipt;
  onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const theme = useTheme<AppTheme>();

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <Text variant="titleMedium">{receipt.store?.name ?? "Store"}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            {new Date(receipt.ts).toLocaleDateString()}
          </Text>
        </View>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
          ${receipt.total.toFixed(2)}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    // Add a subtle shadow based on theme later
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
});
