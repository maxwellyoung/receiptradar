import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HolisticButton } from "./HolisticDesignSystem";
import { HolisticText } from "./HolisticDesignSystem";
import { HolisticContainer } from "./HolisticDesignSystem";
import { HolisticCard } from "./HolisticDesignSystem";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { useRadarMood } from "@/hooks/useRadarMood";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useToneMode } from "@/hooks/useToneMode";
import {
  spacing,
  typography,
  shadows,
  borderRadius,
  animation,
} from "@/constants/theme";
import { AppTheme } from "@/constants/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
  storePrice?: number;
  savings?: number;
}

interface ReceiptInsight {
  type: "savings" | "warning" | "tip" | "achievement";
  title: string;
  message: string;
  icon: string;
  color: string;
  savings?: number;
}

interface ReceiptScanningExperienceProps {
  receiptData: {
    total: number;
    store: string;
    items: ReceiptItem[];
    timestamp: string;
  };
  onSave: () => void;
  onShare?: () => void;
}

const getInstantInsight = (
  total: number,
  items: ReceiptItem[],
  toneMode: "gentle" | "hard" | "silly" | "wise"
): ReceiptInsight => {
  const avgItemPrice = total / items.length;
  const expensiveItems = items.filter(
    (item) => item.price > avgItemPrice * 1.5
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Spending analysis
  if (total < 30) {
    return {
      type: "achievement",
      title: "Modest Spender",
      message:
        toneMode === "gentle"
          ? "A restrained shopping trip! The worm is impressed with your discipline."
          : "Not bad. Could be worse.",
      icon: "🌱",
      color: "#6FCF97",
    };
  }

  if (total < 80) {
    return {
      type: "tip",
      title: "Solid Grocery Game",
      message:
        toneMode === "gentle"
          ? "Good balance of essentials. Nothing to see here!"
          : "Acceptable spending. Moving on.",
      icon: "✨",
      color: "#2F80ED",
    };
  }

  if (total < 150) {
    return {
      type: "warning",
      title: "Big Shopping Day",
      message:
        toneMode === "gentle"
          ? `You spent $${total.toFixed(2)} on ${totalItems} items. That's ${(
              total / totalItems
            ).toFixed(2)} per item!`
          : "That's a lot of groceries. Hope you're feeding a family.",
      icon: "🛒",
      color: "#F2994A",
    };
  }

  // High spending
  if (expensiveItems.length > 0) {
    const mostExpensive = expensiveItems[0];
    return {
      type: "warning",
      title: "Premium Alert",
      message:
        toneMode === "gentle"
          ? `${mostExpensive.name} cost $${mostExpensive.price.toFixed(
              2
            )}. Consider alternatives next time!`
          : "Caviar? In this economy? 😱",
      icon: "💎",
      color: "#EB5757",
      savings: mostExpensive.price * 0.3, // 30% potential savings
    };
  }

  return {
    type: "warning",
    title: "Big Spender",
    message:
      toneMode === "gentle"
        ? "The worm is taking notes on your spending habits!"
        : "Caviar? In this economy? 😱",
    icon: "📝",
    color: "#EB5757",
  };
};

const getShareMessage = (
  receiptData: any,
  insight: ReceiptInsight,
  toneMode: "gentle" | "hard" | "silly" | "wise"
): string => {
  const baseMessage = `Just spent $${receiptData.total.toFixed(2)} at ${
    receiptData.store
  }`;

  if (toneMode === "gentle") {
    return `${baseMessage} - ${insight.message} 🐛✨`;
  } else {
    return `${baseMessage} - ${insight.message} 🐛`;
  }
};

export function ReceiptScanningExperience({
  receiptData,
  onSave,
  onShare,
}: ReceiptScanningExperienceProps) {
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const { toneMode } = useToneMode();
  const [showInsight, setShowInsight] = useState(false);
  const [saved, setSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const insight = getInstantInsight(
    receiptData.total,
    receiptData.items,
    toneMode
  );

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Show insight after a brief delay
    const timer = setTimeout(() => {
      setShowInsight(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaved(true);
    onSave();

    // Navigate back after a brief delay
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const message = getShareMessage(receiptData, insight, toneMode);
      await Share.share({
        message,
        title: "ReceiptRadar",
      });
    } catch (error) {
      console.log("Share failed:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HolisticContainer padding="large">
            {/* Receipt Summary */}
            <View style={styles.receiptCard}>
              <HolisticCard variant="elevated" padding="large">
                <View style={styles.receiptHeader}>
                  <HolisticText variant="title.large" style={styles.storeName}>
                    {receiptData.store}
                  </HolisticText>
                  <HolisticText
                    variant="headline.large"
                    style={styles.totalAmount}
                  >
                    {formatCurrency(receiptData.total)}
                  </HolisticText>
                  <HolisticText variant="body.medium" color="secondary">
                    {receiptData.items.length} items •{" "}
                    {new Date(receiptData.timestamp).toLocaleDateString()}
                  </HolisticText>
                </View>

                {/* Instant Insight */}
                {showInsight && (
                  <Animated.View
                    style={[
                      styles.insightContainer,
                      {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.insightBadge,
                        { backgroundColor: insight.color + "20" },
                      ]}
                    >
                      <Text style={styles.insightIcon}>{insight.icon}</Text>
                      <View style={styles.insightContent}>
                        <HolisticText
                          variant="title.medium"
                          style={[
                            styles.insightTitle,
                            { color: insight.color },
                          ]}
                        >
                          {insight.title}
                        </HolisticText>
                        {insight.savings && (
                          <HolisticText
                            variant="body.medium"
                            style={styles.savingsText}
                          >
                            Potential savings: {formatCurrency(insight.savings)}
                          </HolisticText>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                )}

                {/* Top Items */}
                <View style={styles.itemsContainer}>
                  <HolisticText
                    variant="title.medium"
                    style={styles.itemsTitle}
                  >
                    Top Items
                  </HolisticText>
                  {receiptData.items.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <HolisticText
                        variant="body.medium"
                        style={styles.itemName}
                      >
                        {item.name}
                      </HolisticText>
                      <HolisticText
                        variant="body.medium"
                        style={styles.itemPrice}
                      >
                        {formatCurrency(item.price)}
                      </HolisticText>
                    </View>
                  ))}
                  {receiptData.items.length > 3 && (
                    <HolisticText
                      variant="body.small"
                      color="secondary"
                      style={styles.moreItems}
                    >
                      +{receiptData.items.length - 3} more items
                    </HolisticText>
                  )}
                </View>
              </HolisticCard>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <HolisticButton
                title={saved ? "Saved! 🎉" : "Save Receipt"}
                onPress={handleSave}
                variant="primary"
                size="large"
                fullWidth
                icon={saved ? "✅" : "💾"}
                disabled={saved}
              />

              <View style={styles.secondaryActions}>
                <HolisticButton
                  title="Share"
                  onPress={handleShare}
                  variant="outline"
                  size="medium"
                  icon="📤"
                />

                <HolisticButton
                  title="Compare Prices"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/(tabs)/price-compare");
                  }}
                  variant="ghost"
                  size="medium"
                  icon="📊"
                />
              </View>
            </View>
          </HolisticContainer>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  receiptCard: {
    marginBottom: 32,
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    marginBottom: 8,
  },
  totalAmount: {
    marginBottom: 8,
    color: "#2F80ED",
  },
  insightContainer: {
    marginBottom: 16,
  },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2F80ED",
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    marginBottom: 4,
  },
  savingsText: {
    color: "#34C759",
    fontWeight: "600",
  },
  itemsContainer: {
    marginTop: 16,
  },
  itemsTitle: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
  },
  itemPrice: {
    fontWeight: "600",
  },
  moreItems: {
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  actionContainer: {
    gap: 16,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
});
