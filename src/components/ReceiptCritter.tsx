import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface ReceiptCritterProps {
  totalSpend: number;
  categoryBreakdown: Record<string, number>;
  onShare?: () => void;
  visible: boolean;
}

const critterTypes = [
  { name: "Spendosaurus", emoji: "🦕", color: "#6FCF97" },
  { name: "Budget Bunny", emoji: "🐰", color: "#F2994A" },
  { name: "Savings Sloth", emoji: "🦥", color: "#9B51E0" },
  { name: "Receipt Raccoon", emoji: "🦝", color: "#2F80ED" },
  { name: "Grocery Giraffe", emoji: "🦒", color: "#F2C94C" },
];

export const ReceiptCritter: React.FC<ReceiptCritterProps> = ({
  totalSpend,
  categoryBreakdown,
  onShare,
  visible,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const eyeScaleAnim = useRef(new Animated.Value(1)).current;

  // Calculate critter size based on total spend
  const critterSize = Math.min(Math.max(totalSpend / 10, 60), 120);

  // Check if snacks are a high percentage (bulging eyes)
  const snacksPercentage =
    ((categoryBreakdown["Snacks"] || 0) / totalSpend) * 100;
  const hasBulgingEyes = snacksPercentage > 25;

  // Pick random critter
  const critterIndex = Math.floor(Math.random() * critterTypes.length);
  const critter = critterTypes[critterIndex]!;

  useEffect(() => {
    if (visible) {
      // Spawn animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Continuous bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Eye bulge animation if snacks are high
      if (hasBulgingEyes) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeScaleAnim, {
              toValue: 1.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(eyeScaleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, hasBulgingEyes]);

  const bounceTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }, { translateY: bounceTranslateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.critter,
          {
            width: critterSize,
            height: critterSize,
            backgroundColor: critter.color,
          },
        ]}
        onPress={onShare}
        activeOpacity={0.8}
      >
        <Text style={[styles.emoji, { fontSize: critterSize * 0.4 }]}>
          {critter.emoji}
        </Text>

        {/* Eyes */}
        <View style={styles.eyes}>
          <Animated.View
            style={[
              styles.eye,
              {
                transform: [{ scale: eyeScaleAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.eye,
              {
                transform: [{ scale: eyeScaleAnim }],
              },
            ]}
          />
        </View>

        {/* Name tag */}
        <View style={styles.nameTag}>
          <Text style={styles.nameText}>{critter.name}</Text>
          <Text style={styles.spendText}>${totalSpend.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      {/* Share hint */}
      <View style={styles.shareHint}>
        <MaterialIcons name="share" size={16} color="#666" />
        <Text style={styles.hintText}>Tap to share!</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  critter: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  emoji: {
    marginBottom: 8,
  },
  eyes: {
    position: "absolute",
    top: "25%",
    flexDirection: "row",
    gap: 8,
  },
  eye: {
    width: 8,
    height: 8,
    backgroundColor: "#000",
    borderRadius: 4,
  },
  nameTag: {
    position: "absolute",
    bottom: -30,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  nameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  spendText: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  shareHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    gap: 4,
  },
  hintText: {
    fontSize: 12,
    color: "#666",
  },
});
