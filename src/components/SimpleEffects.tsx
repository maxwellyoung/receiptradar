import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Animated, Text } from "react-native";

const { width, height } = Dimensions.get("window");

interface SimpleEffectsProps {
  visible: boolean;
  effect: "confetti" | "particles";
  color: string;
  onComplete?: () => void;
}

export const SimpleEffects: React.FC<SimpleEffectsProps> = ({
  visible,
  effect,
  color,
  onComplete,
}) => {
  const [particles, setParticles] = useState<Animated.Value[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (visible && !isActive) {
      setIsActive(true);

      // Create particles
      const newParticles: Animated.Value[] = [];
      const particleCount = effect === "confetti" ? 50 : 40;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push(new Animated.Value(0));
      }

      setParticles(newParticles);

      // Animate particles
      const animations = newParticles.map((particle, index) => {
        const startX = Math.random() * width;
        const startY = effect === "confetti" ? -100 : Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 300;
        const endY =
          effect === "confetti"
            ? height + 150
            : startY + (Math.random() - 0.5) * 300;

        return Animated.parallel([
          Animated.timing(particle, {
            toValue: 1,
            duration: 4000 + Math.random() * 2000,
            delay: index * 30,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start(() => {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
      });
    }
  }, [visible, effect, color]);

  if (!visible || !isActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      {particles.map((particle, index) => {
        const startX = Math.random() * width;
        const startY = effect === "confetti" ? -100 : Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 300;
        const endY =
          effect === "confetti"
            ? height + 150
            : startY + (Math.random() - 0.5) * 300;

        const translateX = particle.interpolate({
          inputRange: [0, 1],
          outputRange: [startX, endX],
        });

        const translateY = particle.interpolate({
          inputRange: [0, 1],
          outputRange: [startY, endY],
        });

        const opacity = particle.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        });

        const scale = particle.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 1.2, 1, 0.8],
        });

        const rotate = particle.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });

        // Different particle shapes and sizes
        const particleSize =
          effect === "confetti"
            ? 6 + (index % 3) * 2 // 6, 8, or 10px for confetti
            : 4 + (index % 4) * 2; // 4, 6, 8, or 10px for particles

        const isSquare = effect === "confetti" && index % 3 === 0;
        const isDiamond = effect === "confetti" && index % 7 === 0;

        // Add some sparkle effect
        const sparkle = particle.interpolate({
          inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
          outputRange: [1, 1.3, 1, 1.3, 1, 0.8],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                backgroundColor:
                  effect === "confetti"
                    ? [
                        "#FFD700",
                        "#FF5722",
                        "#9C27B0",
                        "#2196F3",
                        "#4CAF50",
                        "#FF9800",
                        "#E91E63",
                      ][index % 7]
                    : color,
                width: particleSize,
                height: particleSize,
                borderRadius: isSquare ? 2 : particleSize / 2,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: Animated.multiply(scale, sparkle) },
                  { rotate },
                ],
                opacity,
                shadowColor:
                  effect === "confetti"
                    ? [
                        "#FFD700",
                        "#FF5722",
                        "#9C27B0",
                        "#2196F3",
                        "#4CAF50",
                        "#FF9800",
                        "#E91E63",
                      ][index % 7]
                    : color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.9,
                shadowRadius: 6,
                elevation: 8,
              },
            ]}
          />
        );
      })}

      {/* Debug info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          {effect}: {particles.length} particles
        </Text>
      </View>
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
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
  },
  debugInfo: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: "white",
    fontSize: 12,
  },
});
