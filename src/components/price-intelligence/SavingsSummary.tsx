import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SavingsSummaryProps {
  totalSavings: number;
  opportunitiesCount: number;
  cashbackAvailable: number;
  formatCurrency: (amount: number) => string;
}

export const SavingsSummary: React.FC<SavingsSummaryProps> = ({
  totalSavings,
  opportunitiesCount,
  cashbackAvailable,
  formatCurrency,
}) => {
  return (
    <View style={[styles.summaryCard, { backgroundColor: "#10B981" }]}>
      <View style={styles.summaryHeader}>
        <Ionicons name="trending-up" size={24} color="white" />
        <Text style={styles.summaryTitle}>Potential Savings</Text>
      </View>

      <Text style={styles.savingsAmount}>{formatCurrency(totalSavings)}</Text>

      <Text style={styles.savingsSubtext}>
        {opportunitiesCount} items with better prices
      </Text>

      {cashbackAvailable > 0 && (
        <View style={styles.cashbackContainer}>
          <Ionicons name="gift-outline" size={16} color="white" />
          <Text style={styles.cashbackText}>
            +{formatCurrency(cashbackAvailable)} cashback available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  savingsAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  savingsSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  cashbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  cashbackText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
});
