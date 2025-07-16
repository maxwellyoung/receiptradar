import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Card, Text } from "react-native-paper";
import { usePriceIntelligence } from "@/hooks/usePriceIntelligence";

import { SavingsSummary } from "./price-intelligence/SavingsSummary";
import { StoreRecommendation } from "./price-intelligence/StoreRecommendation";
import { SavingsOpportunities } from "./price-intelligence/SavingsOpportunities";
import { PriceHistoryModal } from "./price-intelligence/PriceHistoryModal";

interface PriceIntelligenceProps {
  itemName: string;
  currentPrice: number;
}

export const PriceIntelligence: React.FC<PriceIntelligenceProps> = ({
  itemName,
  currentPrice,
}) => {
  const {
    analysis,
    loading,
    selectedItem,
    priceHistory,
    insight,
    getPriceHistory,
    formatCurrency,
    getConfidenceColor,
    setSelectedItem,
  } = usePriceIntelligence(itemName, currentPrice);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics-outline" size={48} color="#6B7280" />
          <Text style={styles.loadingText}>Analyzing your basket...</Text>
        </View>
      </View>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SavingsSummary
        totalSavings={analysis.total_savings}
        opportunitiesCount={analysis.savings_opportunities.length}
        cashbackAvailable={analysis.cashback_available}
        formatCurrency={formatCurrency}
      />

      <StoreRecommendation
        storeRecommendation={analysis.store_recommendation}
      />

      <SavingsOpportunities
        opportunities={analysis.savings_opportunities}
        getPriceHistory={getPriceHistory}
        formatCurrency={formatCurrency}
        getConfidenceColor={getConfidenceColor}
      />

      <PriceHistoryModal
        selectedItem={selectedItem}
        priceHistory={priceHistory}
        formatCurrency={formatCurrency}
        onClose={() => setSelectedItem(null)}
      />

      {insight && (
        <Card
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            backgroundColor: insight.color + "1A",
          }}
        >
          <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons
              name={insight.icon}
              size={20}
              color={insight.color}
            />
            <Text
              variant="bodySmall"
              style={{ marginLeft: 8, color: insight.color, flex: 1 }}
            >
              {insight.message}
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
