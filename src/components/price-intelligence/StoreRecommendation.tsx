import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StoreRecommendationProps {
  storeRecommendation?: string;
}

export const StoreRecommendation: React.FC<StoreRecommendationProps> = ({
  storeRecommendation,
}) => {
  if (!storeRecommendation) {
    return null;
  }

  return (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Ionicons name="location-outline" size={20} color="#10B981" />
        <Text style={styles.recommendationTitle}>Store Recommendation</Text>
      </View>
      <Text style={styles.recommendationText}>
        Shop at {storeRecommendation} to save the most
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  recommendationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  recommendationText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
