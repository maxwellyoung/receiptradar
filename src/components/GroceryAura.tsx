import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Text } from "react-native-paper";
// import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";
import { logger } from "@/utils/logger";
import { useTheme } from "react-native-paper";

// Fallback share function since react-native-share might not be properly linked
const fallbackShare = async (uri: string, title: string, message: string) => {
  Alert.alert(
    "Share Feature",
    "Share functionality coming soon! This will let you share your grocery aura with friends.",
    [{ text: "OK" }]
  );
};

interface GroceryAuraProps {
  categoryBreakdown: Record<string, number>;
  totalSpend: number;
  weekNumber?: number;
}

const { width: screenWidth } = Dimensions.get("window");

// Category color mapping
const categoryColors: Record<string, string> = {
  "Fresh Produce": "#6FCF97", // Green
  Dairy: "#F2C94C", // Yellow
  Meat: "#EB5757", // Red
  Pantry: "#9B51E0", // Purple
  Snacks: "#F2994A", // Orange
  Beverages: "#2F80ED", // Blue
  Frozen: "#56CCF2", // Light Blue
  Bakery: "#F2C94C", // Yellow
  Household: "#A8E6CF", // Mint
  "Personal Care": "#FFB6C1", // Pink
};

export const GroceryAura: React.FC<GroceryAuraProps> = ({
  categoryBreakdown,
  totalSpend,
  weekNumber = 1,
}) => {
  const viewShotRef = useRef<ViewShot>(null);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for aura
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  // Shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  // Calculate dominant categories and their percentages
  const sortedCategories = Object.entries(categoryBreakdown || {})
    .filter(([, amount]) => amount && amount > 0 && !isNaN(amount))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Top 3 categories

  // Generate gradient colors based on categories
  const gradientColors =
    sortedCategories.length > 0
      ? sortedCategories.map(
          ([category]) => categoryColors[category] || "#6FCF97"
        )
      : ["#6FCF97", "#F2C94C", "#9B51E0"];

  // Calculate aura intensity based on total spend
  const auraIntensity = Math.min((totalSpend || 0) / 100, 1);

  const handleShare = async () => {
    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();

        await fallbackShare(
          uri,
          "My Grocery Aura This Week",
          `Check out my grocery aura for week ${weekNumber}! 🌈`
        );
      }
    } catch (error) {
      logger.info("Share cancelled or failed", {
        component: "GroceryAura",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const getAuraDescription = () => {
    const topCategory = sortedCategories[0]?.[0];
    const descriptions: Record<string, string> = {
      "Fresh Produce": "Fresh & Healthy Vibes 🌱",
      Dairy: "Creamy & Nourishing 🥛",
      Meat: "Protein Powerhouse 💪",
      Pantry: "Well-Stocked & Ready 📦",
      Snacks: "Treat Yourself Mode 🍿",
      Beverages: "Hydration Station 💧",
      Frozen: "Cool & Convenient ❄️",
      Bakery: "Fresh Baked Goodness 🥖",
      Household: "Home Sweet Home 🏠",
      "Personal Care": "Self-Care Queen 👑",
    };

    return descriptions[topCategory || ""] || "Balanced & Beautiful ✨";
  };

  // Format amount safely
  const formatAmount = (amount: number) => {
    if (!amount || isNaN(amount)) return "$0.00";
    return `$${amount.toFixed(2)}`;
  };

  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleShare} activeOpacity={0.9}>
        <ViewShot
          ref={viewShotRef}
          options={{
            format: "png",
            quality: 0.9,
            width: 1080,
            height: 1080,
          }}
          style={styles.shotContainer}
        >
          <View style={styles.auraCard}>
            {/* Background gradient */}
            <Animated.View
              style={[
                styles.gradient,
                {
                  opacity: 0.3 + auraIntensity * 0.4,
                  backgroundColor: gradientColors[0] || "#6FCF97",
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            {/* Aura rings */}
            <Animated.View
              style={[
                styles.auraRing,
                {
                  opacity: 0.6 + auraIntensity * 0.4,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View
              style={[
                styles.auraRing,
                {
                  opacity: 0.4 + auraIntensity * 0.3,
                  transform: [{ scale: 1.2 }],
                },
              ]}
            />
            <View
              style={[
                styles.auraRing,
                {
                  opacity: 0.2 + auraIntensity * 0.2,
                  transform: [{ scale: 1.4 }],
                },
              ]}
            />

            {/* Shimmer overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmer,
                {
                  opacity: 0.18,
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-screenWidth * 0.4, screenWidth * 0.4],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>My Grocery Aura</Text>
              <Text style={styles.weekText}>Week {weekNumber}</Text>

              <View style={styles.auraInfo}>
                <Text style={styles.description}>{getAuraDescription()}</Text>
                <Text style={styles.spendText}>{formatAmount(totalSpend)}</Text>
              </View>

              {/* Category breakdown */}
              <View style={styles.categoryList}>
                {sortedCategories.map(([category, amount], index) => (
                  <View key={category} style={styles.categoryItem}>
                    <View
                      style={[
                        styles.categoryDot,
                        {
                          backgroundColor:
                            categoryColors[category] || "#6FCF97",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {category}
                    </Text>
                    <Text
                      style={[
                        styles.categoryAmount,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {formatAmount(amount)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ReceiptRadar branding */}
              <View style={styles.branding}>
                <Text style={styles.brandText}>ReceiptRadar</Text>
                <Text style={styles.tagline}>Track • Save • Share</Text>
              </View>
            </View>
          </View>
        </ViewShot>
      </TouchableOpacity>

      {/* Share hint */}
      <View style={styles.shareHint}>
        <Text style={styles.hintText}>Tap to share your aura! ✨</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
    width: "100%",
    maxHeight: "100%",
  },
  shotContainer: {
    width: Math.min(screenWidth - 112, 400),
    height: Math.min(screenWidth - 112, 400),
    borderRadius: 20,
    overflow: "hidden",
  },
  auraCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  auraRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    alignItems: "center",
    padding: 24,
    zIndex: 1,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  weekText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  auraInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  spendText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
  },
  categoryList: {
    width: "100%",
    marginBottom: 24,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  branding: {
    alignItems: "center",
    marginTop: 16,
  },
  brandText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
  },
  tagline: {
    fontSize: 11,
    color: "#666",
    marginTop: 3,
  },
  shareHint: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
  },
  hintText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    backgroundColor: "#fff",
    opacity: 0.18,
    width: "80%",
    height: "80%",
    alignSelf: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
});
