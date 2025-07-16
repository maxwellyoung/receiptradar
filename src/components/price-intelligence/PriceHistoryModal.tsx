import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PriceHistoryPoint {
  price: number;
  date: string;
  store_name: string;
  confidence: number;
}

interface PriceHistoryModalProps {
  selectedItem: string | null;
  priceHistory: PriceHistoryPoint[];
  formatCurrency: (amount: number) => string;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  selectedItem,
  priceHistory,
  formatCurrency,
  onClose,
}) => {
  if (!selectedItem || priceHistory.length === 0) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Price History: {selectedItem}</Text>
          <TouchableOpacity onPress={onClose}>
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
  );
};

const styles = StyleSheet.create({
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
