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
import { SafeAreaView } from "react-native-safe-area-context";
import { RadarWorm } from "./RadarWorm";
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
  type: "savings" | "trend" | "comparison" | "tip";
  title: string;
  message: string;
  value?: number;
  icon: string;
  color: string;
}

export const ReceiptScanningExperience: React.FC<{
  receiptData: any;
  photoUri: string;
  onViewReceipt: () => void;
  onScanAnother: () => void;
  onBackToHome: () => void;
}> = ({
  receiptData,
  photoUri,
  onViewReceipt,
  onScanAnother,
  onBackToHome,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [insights, setInsights] = useState<ReceiptInsight[]>([]);
  const [wormMood, setWormMood] = useState<any>("insightful");
  const [wormMessage, setWormMessage] = useState("");
  const [toneMode, setToneMode] = useState<"gentle" | "hard">("gentle");
  const [isSharing, setIsSharing] = useState(false);

  const router = useRouter();
  const { user } = useAuthContext();
  const { createReceipt } = useReceipts(user?.id || "");
  const { mood } = useRadarMood(receiptData?.total || 0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadToneMode();
    generateInsights();
    animateEntrance();
  }, []);

  const loadToneMode = async () => {
    try {
      const savedTone = await AsyncStorage.getItem("@toneMode");
      if (savedTone) {
        setToneMode(savedTone as "gentle" | "hard");
      }
    } catch (error) {
      console.error("Failed to load tone mode:", error);
    }
  };

  const generateInsights = () => {
    const totalSpent = receiptData?.total || 0;
    const items = receiptData?.items || [];

    const newInsights: ReceiptInsight[] = [];

    // Savings insight
    const potentialSavings = calculatePotentialSavings(items);
    if (potentialSavings > 0) {
      newInsights.push({
        type: "savings",
        title: "Potential Savings",
        message: `Could've saved $${potentialSavings.toFixed(
          2
        )} by switching stores`,
        value: potentialSavings,
        icon: "💰",
        color: "#4CAF50",
      });
    }

    // Price trend insight
    const priceTrends = analyzePriceTrends(items);
    if (priceTrends.length > 0) {
      newInsights.push({
        type: "trend",
        title: "Price Alert",
        message: `${priceTrends[0].name} is up ${priceTrends[0].increase}% this month`,
        value: priceTrends[0].increase,
        icon: "📈",
        color: "#FF9800",
      });
    }

    // Store comparison
    const storeComparison = compareStores(items);
    if (storeComparison) {
      newInsights.push({
        type: "comparison",
        title: "Store Comparison",
        message: `${
          storeComparison.betterStore
        } has better prices for ${storeComparison.items.join(", ")}`,
        icon: "🏪",
        color: "#2196F3",
      });
    }

    // Smart tip
    const tip = generateSmartTip(items, totalSpent);
    if (tip) {
      newInsights.push({
        type: "tip",
        title: "Smart Tip",
        message: tip,
        icon: "💡",
        color: "#9C27B0",
      });
    }

    setInsights(newInsights);
    updateWormMood(totalSpent, newInsights);
  };

  const calculatePotentialSavings = (items: ReceiptItem[]): number => {
    // Mock calculation - in real app, this would use price intelligence data
    return items.reduce((total, item) => {
      const savings = item.savings || 0;
      return total + savings;
    }, 0);
  };

  const analyzePriceTrends = (items: ReceiptItem[]): any[] => {
    // Mock price trend analysis
    return items.slice(0, 2).map((item) => ({
      name: item.name,
      increase: Math.floor(Math.random() * 15) + 5,
    }));
  };

  const compareStores = (items: ReceiptItem[]): any => {
    // Mock store comparison
    const stores = ["Countdown", "Pak'nSave", "New World"];
    return {
      betterStore: stores[Math.floor(Math.random() * stores.length)],
      items: items.slice(0, 2).map((item) => item.name),
    };
  };

  const generateSmartTip = (
    items: ReceiptItem[],
    totalSpent: number
  ): string => {
    const tips = [
      "Consider buying in bulk for items you use frequently",
      "Try the store brand for similar quality at lower prices",
      "Plan meals around weekly specials to maximize savings",
      "Use the store's loyalty program for additional discounts",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const updateWormMood = (totalSpent: number, insights: ReceiptInsight[]) => {
    let newMood = "calm";
    let message = "";

    if (totalSpent === 0) {
      newMood = "insightful";
      message = "Ready to start your spending story?";
    } else if (totalSpent < 30) {
      newMood = toneMode === "gentle" ? "zen" : "calm";
      message =
        toneMode === "gentle"
          ? "A modest day of consumption. The worm approves! 🌱"
          : "Not bad. Could be worse.";
    } else if (totalSpent < 80) {
      newMood = "calm";
      message =
        toneMode === "gentle"
          ? "Solid grocery game. Nothing to see here! ✨"
          : "Acceptable spending. Moving on.";
    } else if (totalSpent < 150) {
      newMood = toneMode === "gentle" ? "concerned" : "suspicious";
      message =
        toneMode === "gentle"
          ? "Someone's been shopping. Let's see what you got! 🛒"
          : "That's a lot of groceries. Hope you're feeding a family.";
    } else {
      newMood = toneMode === "gentle" ? "dramatic" : "dramatic";
      message =
        toneMode === "gentle"
          ? "Big spender alert! The worm is taking notes! 📝"
          : "Caviar? In this economy? 😱";
    }

    // Override with savings celebration
    const savingsInsight = insights.find((i) => i.type === "savings");
    if (savingsInsight && savingsInsight.value && savingsInsight.value > 5) {
      newMood = "insightful";
      message =
        toneMode === "gentle"
          ? `You saved $${savingsInsight.value.toFixed(
              2
            )} this week. Worm proud! 🎉`
          : `At least you saved $${savingsInsight.value.toFixed(
              2
            )}. Not terrible.`;
    }

    setWormMood(newMood);
    setWormMessage(message);
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSaveReceipt = async () => {
    try {
      if (user?.id && receiptData) {
        await createReceipt({
          ...receiptData,
          photo_uri: photoUri,
          user_id: user.id,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Failed to save receipt:", error);
      Alert.alert("Error", "Failed to save receipt. Please try again.");
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mock sharing - in real app, this would use native sharing
    setTimeout(() => {
      setIsSharing(false);
      Alert.alert("Shared!", "Your receipt reality has been shared! 📱");
    }, 1000);
  };

  const renderInsightCard = (insight: ReceiptInsight, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.insightCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <HolisticCard
        title={insight.title}
        content={insight.message}
        variant="elevated"
      >
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          {insight.value && (
            <HolisticText
              variant="title.medium"
              style={{ color: insight.color }}
            >
              ${insight.value.toFixed(2)}
            </HolisticText>
          )}
        </View>
      </HolisticCard>
    </Animated.View>
  );

  const renderReceiptSummary = () => (
    <View style={styles.summaryContainer}>
      <HolisticText variant="headline.medium" style={styles.totalSpent}>
        You spent ${receiptData?.total?.toFixed(2) || "0.00"}
      </HolisticText>

      <View style={styles.receiptDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="store" size={20} color="#666" />
          <HolisticText variant="body.medium" color="secondary">
            {receiptData?.store || "Unknown Store"}
          </HolisticText>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="shopping-cart" size={20} color="#666" />
          <HolisticText variant="body.medium" color="secondary">
            {receiptData?.items?.length || 0} items
          </HolisticText>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={20} color="#666" />
          <HolisticText variant="body.medium" color="secondary">
            {new Date().toLocaleDateString()}
          </HolisticText>
        </View>
      </View>
    </View>
  );

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
          {/* Worm Character */}
          <View style={styles.wormContainer}>
            <RadarWorm
              mood={wormMood}
              message={wormMessage}
              visible={true}
              size="large"
              showSpeechBubble={true}
              animated={true}
            />
          </View>

          <HolisticContainer padding="large">
            {/* Receipt Summary */}
            {renderReceiptSummary()}

            {/* Insights */}
            {insights.length > 0 && (
              <View style={styles.insightsContainer}>
                <HolisticText
                  variant="title.large"
                  style={styles.insightsTitle}
                >
                  Smart Insights
                </HolisticText>
                {insights.map((insight, index) =>
                  renderInsightCard(insight, index)
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <HolisticButton
                title="Save to Week"
                onPress={handleSaveReceipt}
                variant="primary"
                size="large"
                fullWidth
                icon={<MaterialIcons name="save" size={20} color="white" />}
              />

              <View style={styles.secondaryActions}>
                <HolisticButton
                  title="Share"
                  onPress={handleShare}
                  variant="outline"
                  size="medium"
                  loading={isSharing}
                  icon={
                    <MaterialIcons name="share" size={18} color="#007AFF" />
                  }
                />

                <HolisticButton
                  title="View Details"
                  onPress={onViewReceipt}
                  variant="ghost"
                  size="medium"
                  icon={<MaterialIcons name="receipt" size={18} color="#666" />}
                />
              </View>

              <HolisticButton
                title="Scan Another Receipt"
                onPress={onScanAnother}
                variant="minimal"
                size="medium"
                icon={
                  <MaterialIcons name="camera-alt" size={18} color="#666" />
                }
              />
            </View>
          </HolisticContainer>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

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
  wormContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  summaryContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  totalSpent: {
    textAlign: "center",
    marginBottom: 16,
  },
  receiptDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
  },
  insightsContainer: {
    marginBottom: 32,
  },
  insightsTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  insightCard: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  insightIcon: {
    fontSize: 24,
  },
  actionContainer: {
    gap: 16,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
});
