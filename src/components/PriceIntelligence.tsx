import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";
import { Card, useTheme } from "react-native-paper";
import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

interface SavingsOpportunity {
  item_name: string;
  current_price: number;
  best_price: number;
  savings: number;
  store_name: string;
  confidence: number;
  price_history_points: number;
}

interface BasketAnalysis {
  total_savings: number;
  savings_opportunities: SavingsOpportunity[];
  store_recommendation?: string;
  cashback_available: number;
}

interface PriceHistoryPoint {
  price: number;
  date: string;
  store_name: string;
  confidence: number;
}

interface PriceIntelligenceProps {
  itemName: string;
  currentPrice: number;
}

type PriceHistory = {
  price: number;
  date: string;
  store_name: string;
};

type PriceInsight = {
  message: string;
  icon: "trending-up" | "trending-down" | "trending-flat" | "info-outline";
  color: string;
};

export const PriceIntelligence: React.FC<PriceIntelligenceProps> = ({
  itemName,
  currentPrice,
}) => {
  const { user } = useAuthContext();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [insight, setInsight] = useState<PriceInsight | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (itemName && user) {
      analyzeSavings();
    }
  }, [itemName, user]);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!itemName) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${
            API_CONFIG.honoApiUrl
          }/api/v1/receipts/price-history/${encodeURIComponent(itemName)}`
        );

        if (response.status === 404) {
          setInsight({
            message: "First time seeing this item!",
            icon: "info-outline",
            color: theme.colors.tertiary,
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: PriceHistory[] = await response.json();
        setHistory(data);
        generateInsight(data);
      } catch (error) {
        logger.error("Failed to fetch price history", error, { itemName });
        setInsight(null); // Or set an error state
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [itemName, currentPrice]);

  const analyzeSavings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_OCR_URL}/analyze-savings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                name: itemName,
                price: currentPrice,
                quantity: 1,
                category: "",
              },
            ],
            store_id: "",
            user_id: user.id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        console.error("Failed to analyze savings");
      }
    } catch (error) {
      console.error("Error analyzing savings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceHistory = async (itemName: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_OCR_URL}/price-history/${encodeURIComponent(
          itemName
        )}?days=90`
      );

      if (response.ok) {
        const data = await response.json();
        setPriceHistory(data.price_history);
        setSelectedItem(itemName);
      }
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.6) return "#F59E0B";
    return "#EF4444";
  };

  const generateInsight = (data: PriceHistory[]) => {
    if (data.length === 0) {
      setInsight({
        message: "First time we've seen this item!",
        icon: "info-outline",
        color: theme.colors.tertiary,
      });
      return;
    }

    // Exclude current purchase for comparison
    const otherPurchases = data.filter((p) => p.price !== currentPrice);
    if (otherPurchases.length === 0) {
      setInsight({
        message: "Price is stable.",
        icon: "trending-flat",
        color: theme.colors.onSurfaceVariant,
      });
      return;
    }

    const avgPrice =
      otherPurchases.reduce((acc, p) => acc + p.price, 0) /
      otherPurchases.length;
    const priceDiff = currentPrice - avgPrice;

    if (priceDiff > 0) {
      setInsight({
        message: `Paid $${priceDiff.toFixed(2)} more than average`,
        icon: "trending-up",
        color: theme.colors.error,
      });
    } else if (priceDiff < 0) {
      setInsight({
        message: `Saved $${Math.abs(priceDiff).toFixed(2)} vs average!`,
        icon: "trending-down",
        color: "green",
      });
    } else {
      setInsight({
        message: "Price is right at the average.",
        icon: "trending-flat",
        color: theme.colors.onSurfaceVariant,
      });
    }
  };

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
      {/* Savings Summary */}
      <View style={[styles.summaryCard, { backgroundColor: "#10B981" }]}>
        <View style={styles.summaryHeader}>
          <Ionicons name="trending-up" size={24} color="white" />
          <Text style={styles.summaryTitle}>Potential Savings</Text>
        </View>

        <Text style={styles.savingsAmount}>
          {formatCurrency(analysis.total_savings)}
        </Text>

        <Text style={styles.savingsSubtext}>
          {analysis.savings_opportunities.length} items with better prices
        </Text>

        {analysis.cashback_available > 0 && (
          <View style={styles.cashbackContainer}>
            <Ionicons name="gift-outline" size={16} color="white" />
            <Text style={styles.cashbackText}>
              +{formatCurrency(analysis.cashback_available)} cashback available
            </Text>
          </View>
        )}
      </View>

      {/* Store Recommendation */}
      {analysis.store_recommendation && (
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="location-outline" size={20} color="#10B981" />
            <Text style={styles.recommendationTitle}>Store Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>
            Shop at {analysis.store_recommendation} to save the most
          </Text>
        </View>
      )}

      {/* Savings Opportunities */}
      {analysis.savings_opportunities.length > 0 && (
        <View style={styles.opportunitiesContainer}>
          <Text style={styles.sectionTitle}>Savings Opportunities</Text>

          {analysis.savings_opportunities.map((opportunity, index) => (
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
                      backgroundColor: getConfidenceColor(
                        opportunity.confidence
                      ),
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
                <Text style={styles.storeName}>
                  at {opportunity.store_name}
                </Text>
                <Text style={styles.historyPoints}>
                  {opportunity.price_history_points} price points
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Price History Modal */}
      {selectedItem && priceHistory.length > 0 && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Price History: {selectedItem}
              </Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {priceHistory.map((point, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>
                      {new Date(point.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historyStore}>{point.store_name}</Text>
                  </View>
                  <Text style={styles.historyPrice}>
                    {formatCurrency(point.price)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {insight && (
        <Card style={{ marginTop: 8, backgroundColor: insight.color + "1A" }}>
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  historyStore: {
    fontSize: 12,
    color: "#6B7280",
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
});
