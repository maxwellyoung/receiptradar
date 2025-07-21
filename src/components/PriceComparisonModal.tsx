import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Modal,
  Portal,
  Card,
  Button,
  Chip,
  IconButton,
  useTheme,
  ActivityIndicator,
  ProgressBar,
} from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import {
  AppTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { API_CONFIG } from "@/constants/api";
import { useRealPriceComparison } from "@/hooks/useRealPriceComparison";

const { width: screenWidth } = Dimensions.get("window");

interface PriceData {
  storeName: string;
  price: number;
  inStock: boolean;
  lastUpdated: string;
  confidence: number;
  priceHistory: {
    date: string;
    price: number;
  }[];
}

interface PriceComparisonModalProps {
  visible: boolean;
  onDismiss: () => void;
  itemName: string;
  currentPrice?: number;
  currentStore?: string;
}

export function PriceComparisonModal({
  visible,
  onDismiss,
  itemName,
  currentPrice,
  currentStore,
}: PriceComparisonModalProps) {
  const theme = useTheme<AppTheme>();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  const {
    priceComparisons,
    priceHistory,
    loading,
    error,
    getBestPrice,
    getPriceTrend,
    getPotentialSavings,
  } = useRealPriceComparison(itemName);

  useEffect(() => {
    // Price comparison data is automatically fetched by the hook
  }, [visible, itemName]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.6) return "#F59E0B";
    return "#EF4444";
  };

  const getWorstPrice = () => {
    if (priceComparisons.length === 0) return null;
    return priceComparisons.reduce((worst, current) =>
      current.averagePrice > worst.averagePrice ? current : worst
    );
  };

  const calculateSavings = (price: number) => {
    const bestPrice = getBestPrice();
    if (!bestPrice) return 0;
    return price - bestPrice.averagePrice;
  };

  const renderPriceCard = (data: PriceData, index: number) => {
    const isBestPrice =
      data && getBestPrice() && data.price === getBestPrice()?.price;
    const isWorstPrice =
      data && getWorstPrice() && data.price === getWorstPrice()?.price;
    const savings = calculateSavings(data.price);
    const isCurrentStore =
      currentStore &&
      data.storeName.toLowerCase().includes(currentStore.toLowerCase());

    return (
      <MotiView
        key={data.storeName}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: index * 100 }}
      >
        <Card
          style={[
            styles.priceCard,
            isBestPrice && styles.bestPriceCard,
            isCurrentStore && styles.currentStoreCard,
          ]}
        >
          <Card.Content>
            <View style={styles.priceCardHeader}>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{data.storeName}</Text>
                {isCurrentStore && (
                  <Chip
                    style={styles.currentStoreChip}
                    textStyle={styles.currentStoreChipText}
                  >
                    Current Store
                  </Chip>
                )}
                {isBestPrice && (
                  <Chip
                    style={styles.bestPriceChip}
                    textStyle={styles.bestPriceChipText}
                  >
                    Best Price
                  </Chip>
                )}
              </View>
              <View style={styles.priceInfo}>
                <Text
                  style={[
                    styles.priceValue,
                    isBestPrice && styles.bestPriceValue,
                    isWorstPrice && styles.worstPriceValue,
                  ]}
                >
                  {formatCurrency(data.price)}
                </Text>
                {savings > 0 && !isBestPrice && (
                  <Text style={styles.savingsText}>
                    Save {formatCurrency(savings)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.priceCardDetails}>
              <View style={styles.detailRow}>
                <View style={styles.confidenceContainer}>
                  <ProgressBar
                    progress={data.confidence}
                    color={getConfidenceColor(data.confidence)}
                    style={styles.confidenceBar}
                  />
                  <Text style={styles.confidenceText}>
                    {Math.round(data.confidence * 100)}% confidence
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stock Status:</Text>
                <View style={styles.stockStatus}>
                  <View
                    style={[
                      styles.stockIndicator,
                      { backgroundColor: data.inStock ? "#10B981" : "#EF4444" },
                    ]}
                  />
                  <Text style={styles.stockText}>
                    {data.inStock ? "In Stock" : "Out of Stock"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>
                  {new Date(data.lastUpdated).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewHistoryButton}
              onPress={() => {
                setSelectedStore(data.storeName);
                setShowPriceHistory(true);
              }}
            >
              <Text style={styles.viewHistoryText}>View Price History</Text>
              <MaterialIcons
                name="history"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </MotiView>
    );
  };

  const renderPriceHistory = () => {
    if (!selectedStore) return null;

    const storeData = priceComparisons.find(
      (data) => data.storeName === selectedStore
    );
    if (!storeData) return null;

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        style={styles.priceHistoryContainer}
      >
        <View style={styles.priceHistoryHeader}>
          <Text style={styles.priceHistoryTitle}>
            Price History: {selectedStore}
          </Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => setShowPriceHistory(false)}
          />
        </View>

        <ScrollView style={styles.priceHistoryList}>
          {storeData.priceHistory.map((point, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDate}>
                  {new Date(point.date).toLocaleDateString()}
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(point.date).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.historyPrice}>
                {formatCurrency(point.price)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </MotiView>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerInfo}>
              <MaterialIcons
                name="compare"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.modalTitle}>Price Comparison</Text>
            </View>
            <IconButton icon="close" size={24} onPress={onDismiss} />
          </View>

          <Text style={styles.itemName}>{itemName}</Text>

          {currentPrice && (
            <Card style={styles.currentPriceCard}>
              <Card.Content>
                <Text style={styles.currentPriceLabel}>Your Price</Text>
                <Text style={styles.currentPriceValue}>
                  {formatCurrency(currentPrice)}
                </Text>
                {currentStore && (
                  <Text style={styles.currentStoreText}>at {currentStore}</Text>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Fetching prices...</Text>
            </View>
          )}

          {/* Price Comparison */}
          {!loading && priceData.length > 0 && !showPriceHistory && (
            <ScrollView
              style={styles.priceList}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Store Prices</Text>
              {priceData.map((data, index) => renderPriceCard(data, index))}
            </ScrollView>
          )}

          {/* Price History */}
          {showPriceHistory && renderPriceHistory()}

          {/* Summary */}
          {!loading && priceData.length > 0 && !showPriceHistory && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 600 }}
              style={styles.summaryContainer}
            >
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={styles.summaryTitle}>Summary</Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryLabel}>Best Price</Text>
                      <Text style={styles.summaryValue}>
                        {getBestPrice()
                          ? formatCurrency(getBestPrice()!.price)
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryLabel}>Price Range</Text>
                      <Text style={styles.summaryValue}>
                        {getBestPrice() && getWorstPrice()
                          ? `${formatCurrency(
                              getBestPrice()!.price
                            )} - ${formatCurrency(getWorstPrice()!.price)}`
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryLabel}>Potential Savings</Text>
                      <Text style={styles.summaryValue}>
                        {currentPrice && getBestPrice()
                          ? formatCurrency(currentPrice - getBestPrice()!.price)
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </MotiView>
          )}
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    maxHeight: "90%",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    ...typography.headline2,
    marginLeft: spacing.sm,
  },
  itemName: {
    ...typography.headline3,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  currentPriceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  currentPriceLabel: {
    ...typography.body2,
    color: "#6B7280",
    marginBottom: spacing.xs,
  },
  currentPriceValue: {
    ...typography.headline2,
    color: "#007AFF",
    fontWeight: "600",
  },
  currentStoreText: {
    ...typography.body2,
    color: "#6B7280",
    marginTop: spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body2,
    marginTop: spacing.md,
    color: "#666",
  },
  priceList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline3,
    marginBottom: spacing.md,
  },
  priceCard: {
    ...shadows.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  bestPriceCard: {
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  currentStoreCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#F0F9FF",
  },
  priceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    ...typography.headline2,
    marginBottom: spacing.xs,
  },
  currentStoreChip: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    marginBottom: spacing.xs,
  },
  currentStoreChipText: {
    color: "white",
    fontSize: 10,
  },
  bestPriceChip: {
    alignSelf: "flex-start",
    backgroundColor: "#10B981",
  },
  bestPriceChipText: {
    color: "white",
    fontSize: 10,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceValue: {
    ...typography.headline2,
    fontWeight: "600",
  },
  bestPriceValue: {
    color: "#10B981",
  },
  worstPriceValue: {
    color: "#EF4444",
  },
  savingsText: {
    ...typography.body2,
    color: "#10B981",
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  priceCardDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  confidenceContainer: {
    flex: 1,
  },
  confidenceBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  confidenceText: {
    ...typography.caption1,
    color: "#6B7280",
  },
  detailLabel: {
    ...typography.body2,
    color: "#6B7280",
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  stockText: {
    ...typography.body2,
  },
  detailValue: {
    ...typography.body2,
  },
  viewHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    backgroundColor: "#F3F4F6",
    borderRadius: borderRadius.md,
  },
  viewHistoryText: {
    ...typography.body2,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: spacing.xs,
  },
  priceHistoryContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  priceHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  priceHistoryTitle: {
    ...typography.headline3,
  },
  priceHistoryList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    ...typography.body2,
    fontWeight: "500",
  },
  historyTime: {
    ...typography.caption1,
    color: "#6B7280",
  },
  historyPrice: {
    ...typography.body2,
    fontWeight: "600",
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  summaryCard: {
    ...shadows.sm,
  },
  summaryTitle: {
    ...typography.headline3,
    marginBottom: spacing.md,
  },
  summaryStats: {
    gap: spacing.md,
  },
  summaryStat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    ...typography.body2,
    color: "#6B7280",
  },
  summaryValue: {
    ...typography.body2,
    fontWeight: "600",
  },
});
