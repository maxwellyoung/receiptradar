import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import * as Haptics from "expo-haptics";

interface ConfettiBarcodeRainProps {
  visible: boolean;
  savingsAmount: number;
  onComplete?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const barcodeSymbols = ["▌", "▐", "█", "▄", "▀", "░", "▒", "▓"];
const dollarSymbols = ["$", "💵", "💰", "💸"];

export const ConfettiBarcodeRain: React.FC<ConfettiBarcodeRainProps> = ({
  visible,
  savingsAmount,
  onComplete,
}) => {
  const particles = useRef<Animated.Value[]>([]).current;
  const rotations = useRef<Animated.Value[]>([]).current;
  const scales = useRef<Animated.Value[]>([]).current;
  const opacities = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Create particles
      const particleCount = Math.min(Math.floor(savingsAmount / 5), 20);

      for (let i = 0; i < particleCount; i++) {
        particles[i] = new Animated.Value(0);
        rotations[i] = new Animated.Value(0);
        scales[i] = new Animated.Value(0);
        opacities[i] = new Animated.Value(1);

        // Animate particle falling
        Animated.parallel([
          Animated.timing(particles[i]!, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rotations[i]!, {
            toValue: 1,
            duration: 1500 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(scales[i]!, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();

        // Fade out near the end
        setTimeout(() => {
          Animated.timing(opacities[i]!, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 1500 + Math.random() * 500);
      }

      // Call onComplete after animation
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
  }, [visible, savingsAmount]);

  if (!visible) return null;

  const renderParticle = (index: number) => {
    const translateY = particles[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0, screenHeight + 100],
    });

    const translateX = particles[index]?.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        0,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 200,
      ],
    });

    const rotate = rotations[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    const scale = scales[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const opacity = opacities[index];

    // Choose symbol randomly
    const symbols = Math.random() > 0.5 ? barcodeSymbols : dollarSymbols;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    return (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            transform: [
              { translateY: translateY || 0 },
              { translateX: translateX || 0 },
              { rotate: rotate || "0deg" },
              { scale: scale || 0 },
            ],
            opacity: opacity || 1,
          },
        ]}
      >
        <Text style={styles.particleText}>{symbol}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((_, index) => renderParticle(index))}

      {/* Savings celebration text */}
      <Animated.View style={styles.celebrationText}>
        <Text style={styles.savingsText}>
          Saved ${savingsAmount.toFixed(2)}! 🎉
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: "absolute",
    top: -50,
  },
  particleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  celebrationText: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  savingsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
