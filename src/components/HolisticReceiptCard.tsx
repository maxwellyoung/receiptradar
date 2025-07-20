import React, { useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import {
  HolisticCard,
  HolisticButton,
  HolisticText,
} from "./HolisticDesignSystem";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  animation,
} from "@/constants/holisticDesignSystem";

interface Receipt {
  id: string;
  store: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  category: string;
  paymentMethod: string;
}

interface HolisticReceiptCardProps {
  receipt: Receipt;
  onPress?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  variant?: "default" | "elevated" | "minimal";
  showActions?: boolean;
}

export function HolisticReceiptCard({
  receipt,
  onPress,
  onEdit,
  onShare,
  onDelete,
  variant = "default",
  showActions = true,
}: HolisticReceiptCardProps) {
  const [scaleValue] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  // Animation for press feedback (Mariana Castilho's human touch)
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleValue, {
      toValue: 0.98,
      duration: animation.duration.instant,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: animation.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  // Format currency (Dieter Rams' functional approach)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date (Michael Beirut's editorial clarity)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate savings if applicable (Jordan Singer's functional beauty)
  const calculateSavings = () => {
    // This would integrate with price intelligence
    return 0;
  };

  const savings = calculateSavings();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <HolisticCard
        variant={variant}
        onPress={onPress}
        padding="large"
        actions={
          showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <HolisticButton
                  title="Edit"
                  variant="outline"
                  size="small"
                  onPress={onEdit}
                />
              )}
              {onShare && (
                <HolisticButton
                  title="Share"
                  variant="ghost"
                  size="small"
                  onPress={onShare}
                />
              )}
              {onDelete && (
                <HolisticButton
                  title="Delete"
                  variant="ghost"
                  size="small"
                  onPress={onDelete}
                />
              )}
            </View>
          )
        }
      >
        {/* Header Section - Editorial hierarchy (Michael Beirut) */}
        <View style={styles.header}>
          <View style={styles.storeInfo}>
            <HolisticText variant="title.large" style={styles.storeName}>
              {receipt.store}
            </HolisticText>
            <HolisticText variant="body.medium" color="secondary">
              {formatDate(receipt.date)}
            </HolisticText>
          </View>

          {/* Total Amount - Typography foundation (Emil Kowalski) */}
          <View style={styles.totalContainer}>
            <HolisticText variant="headline.medium" style={styles.total}>
              {formatCurrency(receipt.total)}
            </HolisticText>
            {savings > 0 && (
              <HolisticText variant="body.small" style={styles.savings}>
                Saved {formatCurrency(savings)}
              </HolisticText>
            )}
          </View>
        </View>

        {/* Category Badge - Systematic design (Rauno Freiberg) */}
        <View style={styles.categoryContainer}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.brand.primary },
            ]}
          >
            <HolisticText variant="label.small" style={styles.categoryText}>
              {receipt.category}
            </HolisticText>
          </View>
        </View>

        {/* Items Preview - Functional approach (Dieter Rams) */}
        <View style={styles.itemsPreview}>
          {receipt.items.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <HolisticText variant="body.medium" style={styles.itemName}>
                {item.name}
              </HolisticText>
              <HolisticText variant="body.medium" color="secondary">
                {formatCurrency(item.price)}
              </HolisticText>
            </View>
          ))}
          {receipt.items.length > 3 && (
            <HolisticText variant="body.small" color="secondary">
              +{receipt.items.length - 3} more items
            </HolisticText>
          )}
        </View>

        {/* Payment Method - Material sensitivity (Jony Ive) */}
        <View style={styles.paymentMethod}>
          <HolisticText variant="body.small" color="secondary">
            Paid with {receipt.paymentMethod}
          </HolisticText>
        </View>
      </HolisticCard>
    </Animated.View>
  );
}

// Styles that embody the holistic design principles
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.large,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.medium,
  },

  storeInfo: {
    flex: 1,
    marginRight: spacing.medium,
  },

  storeName: {
    marginBottom: spacing.tiny,
  },

  totalContainer: {
    alignItems: "flex-end",
  },

  total: {
    color: colors.brand.primary,
  },

  savings: {
    color: colors.semantic.success,
    marginTop: spacing.tiny,
  },

  categoryContainer: {
    marginBottom: spacing.medium,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: borderRadius.small,
  },

  categoryText: {
    color: colors.surface.primary,
  },

  itemsPreview: {
    marginBottom: spacing.medium,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.small,
  },

  itemName: {
    flex: 1,
    marginRight: spacing.small,
  },

  paymentMethod: {
    borderTopWidth: 1,
    borderTopColor: colors.surface.secondary,
    paddingTop: spacing.medium,
  },

  actions: {
    flexDirection: "row",
    gap: spacing.small,
    justifyContent: "flex-end",
    marginTop: spacing.medium,
  },
});

// Example usage component
export function HolisticReceiptCardExample() {
  const sampleReceipt: Receipt = {
    id: "1",
    store: "Whole Foods Market",
    date: "2024-01-15",
    total: 127.43,
    items: [
      { name: "Organic Bananas", price: 4.99, quantity: 1 },
      { name: "Almond Milk", price: 5.49, quantity: 2 },
      { name: "Avocado", price: 2.99, quantity: 3 },
      { name: "Chicken Breast", price: 12.99, quantity: 1 },
      { name: "Quinoa", price: 8.99, quantity: 1 },
    ],
    category: "Groceries",
    paymentMethod: "Apple Pay",
  };

  return (
    <View style={{ padding: spacing.large }}>
      <HolisticReceiptCard
        receipt={sampleReceipt}
        onPress={() => console.log("Receipt pressed")}
        onEdit={() => console.log("Edit receipt")}
        onShare={() => console.log("Share receipt")}
        onDelete={() => console.log("Delete receipt")}
        variant="elevated"
      />
    </View>
  );
}
