import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Assuming types are defined in a central place, e.g. src/types/index.ts
// For now, let's define them here.
interface SavingsOpportunity {
  item_name: string;
  current_price: number;
  best_price: number;
  savings: number;
  store_name: string;
  confidence: number;
  price_history_points: number;
}

interface PriceHistoryPoint {
  price: number;
  date: string;
  store_name: string;
  confidence: number;
}

interface SavingsOpportunitiesProps {
  opportunities: SavingsOpportunity[];
  getPriceHistory: (itemName: string) => void;
  formatCurrency: (amount: number) => string;
  getConfidenceColor: (confidence: number) => string;
}

export const SavingsOpportunities: React.FC<SavingsOpportunitiesProps> = ({
  opportunities,
  getPriceHistory,
  formatCurrency,
  getConfidenceColor,
}) => {
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <View style={styles.opportunitiesContainer}>
      <Text style={styles.sectionTitle}>Savings Opportunities</Text>

      {opportunities.map((opportunity, index) => (
        <TouchableOpacity
          key={index}
          style={styles.opportunityCard}
          onPress={() => getPriceHistory(opportunity.item_name)}
        >
          <View style={styles.opportunityHeader}>
            <Text style={styles.itemName} numberOfLines={2}>
              {opportunity.item_name}
            </Text>
            <View
              style={[
                styles.confidenceBadge,
                {
                  backgroundColor: getConfidenceColor(opportunity.confidence),
                },
              ]}
            >
              <Text style={styles.confidenceText}>
                {Math.round(opportunity.confidence * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.priceComparison}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Current</Text>
              <Text style={styles.currentPrice}>
                {formatCurrency(opportunity.current_price)}
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={16} color="#6B7280" />

            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Best</Text>
              <Text style={styles.bestPrice}>
                {formatCurrency(opportunity.best_price)}
              </Text>
            </View>

            <View style={styles.savingsContainer}>
              <Text style={styles.savingsLabel}>Save</Text>
              <Text style={styles.savingsAmount}>
                {formatCurrency(opportunity.savings)}
              </Text>
            </View>
          </View>

          <View style={styles.opportunityFooter}>
            <Text style={styles.storeName}>at {opportunity.store_name}</Text>
            <Text style={styles.historyPoints}>
              {opportunity.price_history_points} price points
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  opportunitiesContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  opportunityCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  opportunityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginRight: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  priceComparison: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceItem: {
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  bestPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  savingsContainer: {
    alignItems: "center",
  },
  savingsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  opportunityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeName: {
    fontSize: 14,
    color: "#6B7280",
  },
  historyPoints: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
