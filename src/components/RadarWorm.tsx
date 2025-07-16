import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

export type RadarMood =
  | "calm"
  | "concerned"
  | "dramatic"
  | "zen"
  | "suspicious"
  | "insightful";

interface RadarWormProps {
  mood: RadarMood;
  message?: string;
  totalSpend?: number;
  categoryBreakdown?: Record<string, number>;
  onPress?: () => void;
  visible: boolean;
  size?: "small" | "medium" | "large";
  showSpeechBubble?: boolean;
  animated?: boolean;
  interactive?: boolean;
}

const moodConfig = {
  calm: {
    emoji: "🙂",
    color: "#34C759",
    message: "Frugal… suspiciously so. The worm nods.",
    eyeStyle: "normal",
    accessory: "monocle",
  },
  concerned: {
    emoji: "🤔",
    color: "#FF9500",
    message: "Those snack aisles... a siren's call to your wallet. Be strong.",
    eyeStyle: "narrow",
    accessory: "worried",
  },
  dramatic: {
    emoji: "😱",
    color: "#FF3B30",
    message: "BY THE GHOST OF ESCOFFIER, WHAT IS THIS?! I must lie down.",
    eyeStyle: "wide",
    accessory: "fainting",
  },
  zen: {
    emoji: "🧘",
    color: "#AF52DE",
    message:
      "The receipt is blank. The wallet is full. The worm has reached nirvana.",
    eyeStyle: "closed",
    accessory: "lotus",
  },
  suspicious: {
    emoji: "👀",
    color: "#FFCC00",
    message:
      "Three types of cheese? You're either building a cheese board or a cheese fort. The worm is watching.",
    eyeStyle: "squint",
    accessory: "magnifying",
  },
  insightful: {
    emoji: "✨",
    color: "#007AFF",
    message:
      "A masterclass in couponing. You've saved enough for... another, smaller cucumber. Bravo.",
    eyeStyle: "sparkle",
    accessory: "crown",
  },
};

export const RadarWorm: React.FC<RadarWormProps> = ({
  mood,
  message,
  totalSpend,
  categoryBreakdown,
  onPress,
  visible,
  size = "medium",
  showSpeechBubble = true,
  animated = true,
  interactive = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const eyeAnim = useRef(new Animated.Value(1)).current;
  const speechAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const accessoryAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  const config = moodConfig[mood];
  const customMessage = message || config.message;

  // Refined size calculations
  const sizeMap = {
    small: { worm: 48, segments: 3 },
    medium: { worm: 64, segments: 4 },
    large: { worm: 80, segments: 5 },
  };
  const { worm: wormSize, segments } = sizeMap[size];
  const segmentSize = wormSize / segments;

  // Characterful eye animations
  useEffect(() => {
    if (!animated) return;

    switch (config.eyeStyle) {
      case "wide":
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeAnim, {
              toValue: 1.3,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(eyeAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case "narrow":
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeAnim, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(eyeAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case "sparkle":
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeAnim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(eyeAnim, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case "squint":
        eyeAnim.setValue(0.5);
        break;
      default:
        eyeAnim.setValue(1);
    }
  }, [mood, animated]);

  // Characterful entrance animation
  useEffect(() => {
    if (visible) {
      // Pop out with personality
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Accessory animation
      Animated.spring(accessoryAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
        delay: 200,
      }).start();

      if (showSpeechBubble) {
        setTimeout(() => {
          Animated.spring(speechAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 90,
            friction: 7,
          }).start();
        }, 400);
      }
    } else {
      scaleAnim.setValue(0);
      speechAnim.setValue(0);
      accessoryAnim.setValue(0);
    }
  }, [visible, showSpeechBubble]);

  const handlePressIn = () => {
    if (!interactive) return;

    setIsPressed(true);
    Animated.spring(pressAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 200,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (!interactive) return;

    setIsPressed(false);
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 4,
    }).start();
  };

  const handlePress = () => {
    if (!interactive || !onPress) return;

    // Characterful press feedback
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 6,
      }),
    ]).start();

    onPress();
  };

  const renderAccessory = () => {
    const accessorySize = segmentSize * 0.4;

    switch (config.accessory) {
      case "monocle":
        return (
          <Animated.View
            style={[
              styles.accessory,
              {
                width: accessorySize,
                height: accessorySize,
                transform: [{ scale: accessoryAnim }],
              },
            ]}
          >
            <View style={styles.monocle} />
          </Animated.View>
        );
      case "crown":
        return (
          <Animated.View
            style={[
              styles.accessory,
              {
                width: accessorySize * 1.5,
                height: accessorySize,
                transform: [{ scale: accessoryAnim }],
              },
            ]}
          >
            <MaterialIcons
              name="star"
              size={accessorySize * 0.6}
              color="#FFD700"
            />
          </Animated.View>
        );
      case "magnifying":
        return (
          <Animated.View
            style={[
              styles.accessory,
              {
                width: accessorySize,
                height: accessorySize,
                transform: [{ scale: accessoryAnim }],
              },
            ]}
          >
            <MaterialIcons
              name="search"
              size={accessorySize * 0.6}
              color="#FFCC00"
            />
          </Animated.View>
        );
      case "lotus":
        return (
          <Animated.View
            style={[
              styles.accessory,
              {
                width: accessorySize,
                height: accessorySize,
                transform: [{ scale: accessoryAnim }],
              },
            ]}
          >
            <MaterialIcons
              name="spa"
              size={accessorySize * 0.6}
              color="#AF52DE"
            />
          </Animated.View>
        );
      case "fainting":
        return (
          <Animated.View
            style={[
              styles.accessory,
              {
                width: accessorySize,
                height: accessorySize,
                transform: [{ scale: accessoryAnim }],
              },
            ]}
          >
            <MaterialIcons
              name="favorite"
              size={accessorySize * 0.6}
              color="#FF3B30"
            />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Characterful speech bubble */}
      {showSpeechBubble && (
        <Animated.View
          style={[
            styles.speechBubble,
            {
              opacity: speechAnim,
              transform: [
                { scale: speechAnim },
                {
                  translateY: speechAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.speechText}>{customMessage}</Text>
          <View style={styles.speechTail} />
        </Animated.View>
      )}

      {/* Characterful Radar Worm */}
      <Animated.View
        style={[
          styles.wormContainer,
          {
            transform: [{ scale: scaleAnim }, { scale: pressAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.worm,
            {
              width: wormSize,
              height: segmentSize,
            },
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={interactive ? 0.9 : 1}
          disabled={!interactive}
        >
          {/* Characterful worm segments */}
          {Array.from({ length: segments }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: segmentSize,
                  height: segmentSize,
                  backgroundColor: config.color,
                  opacity: 1 - index * 0.06,
                  transform: [
                    { translateX: index * (segmentSize * 0.22) },
                    { scale: 1 - index * 0.02 },
                  ],
                },
              ]}
            />
          ))}

          {/* Characterful eyes */}
          <View style={[styles.eyes, { top: segmentSize * 0.25 }]}>
            <Animated.View
              style={[
                styles.eye,
                {
                  width: segmentSize * 0.14,
                  height: segmentSize * 0.14,
                  transform: [{ scale: eyeAnim }],
                  opacity: config.eyeStyle === "closed" ? 0.15 : 1,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.eye,
                {
                  width: segmentSize * 0.14,
                  height: segmentSize * 0.14,
                  transform: [{ scale: eyeAnim }],
                  opacity: config.eyeStyle === "closed" ? 0.15 : 1,
                },
              ]}
            />
          </View>

          {/* Characterful accessories */}
          {renderAccessory()}

          {/* Signature receipt clip */}
          <View style={styles.receiptClip}>
            <MaterialIcons
              name="receipt"
              size={segmentSize * 0.3}
              color="#666"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Characterful mood indicator */}
      <View style={styles.moodIndicator}>
        <Text style={styles.moodEmoji}>{config.emoji}</Text>
        {totalSpend && (
          <Text style={styles.spendText}>${totalSpend.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    paddingHorizontal: 32,
  },
  speechBubble: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  speechText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
  speechTail: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  wormContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  worm: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  segment: {
    position: "absolute",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  eyes: {
    position: "absolute",
    flexDirection: "row",
    gap: 6,
    zIndex: 10,
  },
  eye: {
    backgroundColor: "#000",
    borderRadius: 50,
  },
  accessory: {
    position: "absolute",
    top: -8,
    right: -8,
    zIndex: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  monocle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "transparent",
  },
  receiptClip: {
    position: "absolute",
    bottom: -4,
    left: -4,
    zIndex: 5,
    opacity: 0.6,
  },
  moodIndicator: {
    marginTop: 12,
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  spendText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
