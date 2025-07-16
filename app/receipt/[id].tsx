import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text, Button, Card, Chip, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { spacing, shadows } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReceipts } from "@/hooks/useReceipts";
import { ViralFeaturesManager } from "@/components/ViralFeaturesManager";
import { ItemPriceInsight } from "@/components/ItemPriceInsight";

export default function ReceiptDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const { receipts, getReceiptById } = useReceipts(user?.id || "");

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showViralFeatures, setShowViralFeatures] = useState(false);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await getReceiptById(id);

      if (error) {
        console.error("Error loading receipt:", error);
        return;
      }

      if (data) {
        setReceipt(data);
      }
    } catch (error) {
      console.error("Error loading receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowViralFeatures(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    // Navigate to edit screen
    console.log("Edit receipt:", id);
  };

  const handleDelete = () => {
    // Show delete confirmation
    console.log("Delete receipt:", id);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Loading receipt...</Text>
      </SafeAreaView>
    );
  }

  if (!receipt) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Receipt not found</Text>
      </SafeAreaView>
    );
  }

  // Mock category breakdown for demo
  const categoryBreakdown = {
    "Fresh Produce": receipt.total_amount * 0.3,
    Dairy: receipt.total_amount * 0.2,
    Meat: receipt.total_amount * 0.25,
    Pantry: receipt.total_amount * 0.25,
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={handleBack}
            icon={({ size, color }) => (
              <MaterialIcons name="arrow-back" size={size} color="#8E8E93" />
            )}
            style={styles.backButton}
            labelStyle={styles.backButtonLabel}
          >
            Back
          </Button>
          <Text style={styles.title}>Receipt Details</Text>
          <View style={styles.headerActions}>
            <Button
              mode="text"
              onPress={handleEdit}
              icon={({ size, color }) => (
                <MaterialIcons name="edit" size={size} color="#8E8E93" />
              )}
              style={styles.actionButton}
            >
              {""}
            </Button>
            <Button
              mode="text"
              onPress={handleDelete}
              icon={({ size, color }) => (
                <MaterialIcons name="delete" size={size} color="#FF3B30" />
              )}
              style={styles.actionButton}
            >
              {""}
            </Button>
          </View>
        </View>

        {/* Receipt Image */}
        {receipt.image_url && (
          <Card style={[styles.imageCard, styles.shadowedCard]}>
            <Card.Content>
              <Image
                source={{ uri: receipt.image_url }}
                style={styles.receiptImage}
              />
            </Card.Content>
          </Card>
        )}

        {/* Receipt Info */}
        <Card style={[styles.infoCard, styles.shadowedCard]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Store</Text>
              <Text style={styles.infoValue}>{receipt.store_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(receipt.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={styles.infoTotal}>
                ${receipt.total_amount.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Items List */}
        {receipt.ocr_data?.items && (
          <Card style={[styles.categoryCard, styles.shadowedCard]}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Items</Text>
              {receipt.ocr_data.items.map((item: any, index: number) => (
                <View
                  key={`${item.name}-${index}`}
                  style={styles.itemContainer}
                >
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>
                  <ItemPriceInsight
                    itemName={item.name}
                    currentPrice={item.price}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Category Breakdown */}
        <Card style={[styles.categoryCard, styles.shadowedCard]}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Category Breakdown</Text>
            <View style={styles.categoryList}>
              {Object.entries(categoryBreakdown).map(([category, amount]) => (
                <View key={category} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryAmount}>
                    ${amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Share Section */}
        <Card style={[styles.shareCard, styles.shadowedCard]}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Share This Receipt</Text>
            <Text style={styles.shareDescription}>
              Create viral content from your grocery spending!
            </Text>
            <View style={styles.shareButtons}>
              <Button
                mode="contained"
                onPress={handleShare}
                style={styles.shareButton}
                contentStyle={styles.shareButtonContent}
                labelStyle={styles.shareButtonLabel}
                icon={({ size, color }) => (
                  <MaterialIcons
                    name="auto-awesome"
                    size={size}
                    color={color}
                  />
                )}
              >
                Create Viral Content
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      {/* Viral Features */}
      {showViralFeatures && (
        <ViralFeaturesManager
          totalSpend={receipt.total_amount}
          categoryBreakdown={categoryBreakdown}
          savingsAmount={8.5}
          weekNumber={1}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  backButton: {
    minWidth: 80,
    borderRadius: 8,
    paddingHorizontal: 0,
  },
  backButtonLabel: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "400",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    color: "#000",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    minWidth: 80,
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  actionButton: {
    borderRadius: 8,
    minWidth: 40,
  },
  imageCard: {
    marginBottom: spacing.xl,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 0,
    elevation: 0,
  },
  receiptImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    resizeMode: "cover",
  },
  infoCard: {
    marginBottom: spacing.xl,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 0,
    elevation: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  infoLabel: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "400",
  },
  infoValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    textAlign: "right",
  },
  infoTotal: {
    fontSize: 24,
    color: "#000",
    fontWeight: "300",
    textAlign: "right",
    letterSpacing: -0.5,
  },
  categoryCard: {
    marginBottom: spacing.xl,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 0,
    elevation: 0,
  },
  sectionLabel: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
    marginBottom: spacing.md,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  categoryName: {
    fontSize: 16,
    color: "#222",
    fontWeight: "400",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemContainer: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    flex: 1,
    marginRight: spacing.md,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
  },
  shareCard: {
    marginBottom: spacing.xl,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 0,
    elevation: 0,
  },
  shadowedCard: {
    ...shadows.subtle,
  },
  shareDescription: {
    marginBottom: spacing.md,
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "400",
  },
  shareButtons: {
    gap: spacing.sm,
  },
  shareButton: {
    borderRadius: 16,
    alignSelf: "stretch",
    ...shadows.medium,
  },
  shareButtonContent: {
    paddingVertical: spacing.lg,
  },
  shareButtonLabel: {
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0,
  },
});
