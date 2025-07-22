import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { Receipt as DatabaseReceipt } from "@/types/database";
import { Receipt as AppReceipt } from "@/types";

type ReceiptCardReceipt = DatabaseReceipt & {
  store_name?: string;
  total_amount?: number;
  date?: string;
  savings_identified?: number;
  cashback_earned?: number;
};
import { formatCurrency } from "@/utils/formatters";
import { StoreLogo } from "@/components/StoreLogo";
import {
  spacing,
  typography,
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";
import * as Haptics from "expo-haptics";
import { logger } from "@/utils/logger";
import { BUSINESS_RULES } from "@/constants/business-rules";

const { width: screenWidth } = Dimensions.get("window");

interface ReceiptCardProps {
  receipt: ReceiptCardReceipt;
  onPress?: () => void;
  items?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onPress,
  items = [],
}) => {
  // Ensure items is always an array
  const safeItems = items || [];

  // Ensure receipt is valid
  if (!receipt) {
    console.log("ReceiptCard: receipt is null or undefined");
    return null;
  }

  const theme = useTheme<AppTheme>();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  // Runtime type checks for debugging
  if (!receipt || typeof receipt !== "object") {
    logger.error("ReceiptCard: receipt is not a valid object", undefined, {
      component: "ReceiptCard",
      receipt,
    });
    return null;
  }
  if (!Array.isArray(safeItems)) {
    logger.error("ReceiptCard: items is not an array", undefined, {
      component: "ReceiptCard",
      items: safeItems,
    });
  }

  const handlePressIn = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsPressed(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: interactions.press.scale,
          duration: interactions.press.duration,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 1,
          duration: interactions.transitions.fast,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      setIsPressed(false);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 0,
          duration: interactions.transitions.fast,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || typeof dateString !== "string") {
        return "Unknown date";
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / BUSINESS_RULES.TIME.ONE_DAY_MS);

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown date";
    }
  };

  // This function is no longer used since we're using StoreLogo component
  // const getStoreIcon = (storeName: string) => {
  //   const name = storeName.toLowerCase();
  //   if (name.includes("countdown")) return "shopping-cart";
  //   if (name.includes("new world")) return "store";
  //   if (name.includes("pak")) return "local-grocery-store";
  //   if (name.includes("four square")) return "local-convenience-store";
  //   return "receipt";
  // };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ scale: scaleAnim }],
          ...materialShadows.light,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateY: elevationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.storeInfo}>
              <StoreLogo
                storeName={receipt?.store_name || "Unknown Store"}
                size="small"
                variant="icon"
              />
              <View style={styles.storeDetails}>
                <Text
                  style={[styles.storeName, { color: theme.colors.onSurface }]}
                  numberOfLines={1}
                >
                  {receipt?.store_name || "Unknown Store"}
                </Text>
                <Text
                  style={[
                    styles.date,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {receipt?.date ? formatDate(receipt.date) : "Unknown date"}
                </Text>
              </View>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
                {formatCurrency(Number(receipt?.total_amount) || 0)}
              </Text>
            </View>
          </View>

          {/* Items Preview */}
          {safeItems.length > 0 ? (
            <View style={styles.itemsPreview}>
              <Text
                style={[
                  styles.itemsTitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {safeItems.length} item{safeItems.length !== 1 ? "s" : ""}
              </Text>
              <View style={styles.itemsList}>
                {safeItems.slice(0, 3).map((item, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.itemText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name || "Unknown item"}
                  </Text>
                ))}
                {safeItems.length > 3 ? (
                  <Text
                    style={[
                      styles.moreItems,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    +{safeItems.length - 3} more
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.metadata}>
              {receipt?.savings_identified && receipt.savings_identified > 0 ? (
                <View style={styles.savingsBadge}>
                  <MaterialIcons
                    name="trending-down"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.savingsText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Saved{" "}
                    {formatCurrency(Number(receipt.savings_identified) || 0)}
                  </Text>
                </View>
              ) : null}
            </View>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
    borderRadius: 16,
    overflow: "hidden",
  },
  touchable: {
    flex: 1,
  },
  content: {
    padding: spacing.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.small,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.small,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    ...typography.title.small,
    marginBottom: spacing.tiny,
  },
  date: {
    ...typography.body.small,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    ...typography.title.medium,
  },
  itemsPreview: {
    marginBottom: spacing.small,
  },
  itemsTitle: {
    ...typography.label.medium,
    marginBottom: spacing.tiny,
  },
  itemsList: {
    gap: spacing.tiny,
  },
  itemText: {
    ...typography.body.small,
  },
  moreItems: {
    ...typography.body.small,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metadata: {
    flex: 1,
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.tiny,
  },
  savingsText: {
    ...typography.label.small,
  },
});
