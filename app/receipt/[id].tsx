import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  Button,
  IconButton,
  Divider,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useReceipts } from "@/hooks/useReceipts";
import { useAuthContext } from "@/contexts/AuthContext";
import { AppTheme } from "@/constants/theme";
import { formatCurrency } from "@/utils/formatters";
import { OCRItem } from "@/services/ocr";

interface ReceiptDetail {
  id: string;
  store_name: string;
  total_amount: number;
  date: string;
  image_url?: string;
  ocr_data?: {
    items: OCRItem[];
    subtotal?: number;
    tax?: number;
    receipt_number?: string;
    validation?: {
      is_valid: boolean;
      confidence_score: number;
      issues: string[];
    };
  };
  savings_identified?: number;
  cashback_earned?: number;
  created_at: string;
}

export default function ReceiptDetailScreen() {
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { getReceiptById, deleteReceipt } = useReceipts(user?.id || "");

  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReceipt();
    }
  }, [id]);

  const loadReceipt = async () => {
    if (!id) {
      setError("Invalid receipt ID");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getReceiptById(id);

      if (error) {
        setError(typeof error === "string" ? error : error.message);
        return;
      }

      if (data) {
        setReceipt(data);
      } else {
        setError("Receipt not found");
      }
    } catch (err) {
      setError("Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!id) {
      Alert.alert("Error", "Invalid receipt ID");
      return;
    }

    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteReceipt(id);
            if (error) {
              Alert.alert("Error", "Failed to delete receipt");
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      "Fresh Produce": "#4CAF50",
      Dairy: "#2196F3",
      Meat: "#F44336",
      Pantry: "#FF9800",
      Beverages: "#9C27B0",
      Snacks: "#795548",
      Frozen: "#00BCD4",
      Household: "#607D8B",
      Bakery: "#8BC34A",
    };
    return colors[category || ""] || "#9E9E9E";
  };

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{ color: "#f44336", marginBottom: 16 }}
          >
            Invalid receipt ID
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text variant="bodyLarge">Loading receipt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !receipt) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <MaterialIcons
            name="error-outline"
            size={48}
            color={theme.colors.error}
          />
          <Text
            variant="headlineSmall"
            style={{ color: theme.colors.error, marginTop: 16 }}
          >
            {error || "Receipt not found"}
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.onBackground}
            />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Receipt Details
          </Text>
          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            onPress={handleDelete}
          />
        </View>

        {/* Receipt Image */}
        {receipt.image_url && (
          <Card style={styles.imageCard}>
            <Card.Content>
              <Image
                source={{ uri: receipt.image_url }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            </Card.Content>
          </Card>
        )}

        {/* Receipt Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <MaterialIcons
                name="store"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge" style={styles.storeName}>
                {receipt.store_name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Date:</Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {new Date(receipt.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Total:</Text>
              <Text
                variant="headlineSmall"
                style={[styles.summaryValue, styles.totalAmount]}
              >
                {formatCurrency(receipt.total_amount)}
              </Text>
            </View>

            {receipt.ocr_data?.subtotal && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Subtotal:</Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {formatCurrency(receipt.ocr_data.subtotal)}
                </Text>
              </View>
            )}

            {receipt.ocr_data?.tax && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Tax:</Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {formatCurrency(receipt.ocr_data.tax)}
                </Text>
              </View>
            )}

            {receipt.ocr_data?.receipt_number && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Receipt #:</Text>
                <Text variant="bodyMedium" style={styles.summaryValue}>
                  {receipt.ocr_data.receipt_number}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Savings & Cashback */}
        {(receipt.savings_identified || receipt.cashback_earned) && (
          <Card style={styles.savingsCard}>
            <Card.Content>
              <View style={styles.savingsHeader}>
                <MaterialIcons name="savings" size={24} color="#10B981" />
                <Text variant="titleMedium" style={styles.savingsTitle}>
                  Savings & Rewards
                </Text>
              </View>

              {receipt.savings_identified && receipt.savings_identified > 0 && (
                <View style={styles.savingsRow}>
                  <Text variant="bodyMedium">Potential Savings:</Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.summaryValue, { color: "#10B981" }]}
                  >
                    {formatCurrency(receipt.savings_identified)}
                  </Text>
                </View>
              )}

              {receipt.cashback_earned && receipt.cashback_earned > 0 && (
                <View style={styles.savingsRow}>
                  <Text variant="bodyMedium">Cashback Earned:</Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.summaryValue, { color: "#10B981" }]}
                  >
                    {formatCurrency(receipt.cashback_earned)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Items List */}
        {receipt.ocr_data?.items && receipt.ocr_data.items.length > 0 && (
          <Card style={styles.itemsCard}>
            <Card.Content>
              <View style={styles.itemsHeader}>
                <MaterialIcons
                  name="list"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.itemsTitle}>
                  Items ({receipt.ocr_data.items.length})
                </Text>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              {receipt.ocr_data.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text variant="bodyMedium" style={styles.itemName}>
                      {item.name}
                    </Text>
                    {item.category && (
                      <Chip
                        mode="outlined"
                        style={[
                          styles.categoryChip,
                          { borderColor: getCategoryColor(item.category) },
                        ]}
                        textStyle={{
                          color: getCategoryColor(item.category),
                          fontSize: 12,
                        }}
                      >
                        {item.category}
                      </Chip>
                    )}
                  </View>
                  <View style={styles.itemPricing}>
                    <Text variant="bodyMedium" style={styles.itemPrice}>
                      {formatCurrency(item.price)}
                    </Text>
                    {item.quantity > 1 && (
                      <Text variant="bodySmall" style={styles.itemQuantity}>
                        × {item.quantity}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* OCR Validation Info */}
        {receipt.ocr_data?.validation && (
          <Card style={styles.validationCard}>
            <Card.Content>
              <View style={styles.validationHeader}>
                <MaterialIcons
                  name={
                    receipt.ocr_data.validation.is_valid
                      ? "check-circle"
                      : "warning"
                  }
                  size={20}
                  color={
                    receipt.ocr_data.validation.is_valid ? "#10B981" : "#F59E0B"
                  }
                />
                <Text variant="bodyMedium" style={styles.validationTitle}>
                  OCR Validation:{" "}
                  {receipt.ocr_data.validation.is_valid
                    ? "Valid"
                    : "Issues Found"}
                </Text>
              </View>

              {receipt.ocr_data.validation.issues &&
                receipt.ocr_data.validation.issues.length > 0 && (
                  <View style={styles.issuesList}>
                    {receipt.ocr_data.validation.issues.map(
                      (issue: string, index: number) => (
                        <Text
                          key={index}
                          variant="bodySmall"
                          style={styles.issueText}
                        >
                          • {issue}
                        </Text>
                      )
                    )}
                  </View>
                )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontWeight: "600",
  },
  imageCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  receiptImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    marginLeft: 8,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: "500",
  },
  totalAmount: {
    color: "#10B981",
    fontWeight: "700",
  },
  savingsCard: {
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  savingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  savingsTitle: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#10B981",
  },
  savingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemsTitle: {
    marginLeft: 8,
    fontWeight: "600",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontWeight: "500",
    marginBottom: 4,
  },
  categoryChip: {
    alignSelf: "flex-start",
    height: 24,
  },
  itemPricing: {
    alignItems: "flex-end",
  },
  itemPrice: {
    fontWeight: "600",
    fontSize: 16,
  },
  itemQuantity: {
    opacity: 0.7,
    marginTop: 2,
  },
  validationCard: {
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  validationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  validationTitle: {
    marginLeft: 8,
    fontWeight: "500",
  },
  issuesList: {
    marginTop: 8,
  },
  issueText: {
    opacity: 0.7,
    marginBottom: 2,
  },
});
