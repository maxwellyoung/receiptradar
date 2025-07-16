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
  const sortedCategories = Object.entries(categoryBreakdown)
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
  const auraIntensity = Math.min(totalSpend / 100, 1);

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
      console.log("Share cancelled or failed:", error);
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
                <Text style={styles.spendText}>${totalSpend.toFixed(2)}</Text>
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
                    <Text style={styles.categoryText}>{category}</Text>
                    <Text style={styles.categoryAmount}>
                      ${amount.toFixed(2)}
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
    padding: 20,
  },
  shotContainer: {
    width: screenWidth - 40,
    height: screenWidth - 40,
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
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    alignItems: "center",
    padding: 30,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  weekText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  auraInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  spendText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  categoryList: {
    width: "100%",
    marginBottom: 30,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  branding: {
    alignItems: "center",
    marginTop: 20,
  },
  brandText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563EB",
  },
  tagline: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  shareHint: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
  },
  hintText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 120,
    backgroundColor: "#fff",
    opacity: 0.18,
    width: "80%",
    height: "80%",
    alignSelf: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
  },
});
