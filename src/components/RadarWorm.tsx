console.log("[LOG] src/components/RadarWorm.tsx loaded");
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme } from "@/constants/theme";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
    backgroundColor: "#F0F9F0",
    message: "Frugal — suspiciously so. The worm nods approvingly.",
    eyeStyle: "normal",
    accessory: "monocle",
    personality: "observant",
    gooeyness: 0.8,
    bounceIntensity: 0.6,
    gooSpeed: 0.8,
  },
  concerned: {
    emoji: "🤔",
    color: "#FF9500",
    backgroundColor: "#FFF8F0",
    message: "Those snack aisles... a siren's call to your wallet. Be strong.",
    eyeStyle: "narrow",
    accessory: "worried",
    personality: "cautious",
    gooeyness: 0.6,
    bounceIntensity: 0.4,
    gooSpeed: 0.6,
  },
  dramatic: {
    emoji: "😱",
    color: "#FF3B30",
    backgroundColor: "#FFF0F0",
    message: "BY THE GHOST OF ESCOFFIER, WHAT IS THIS?! I must lie down.",
    eyeStyle: "wide",
    accessory: "fainting",
    personality: "theatrical",
    gooeyness: 1.2,
    bounceIntensity: 1.0,
    gooSpeed: 1.2,
  },
  zen: {
    emoji: "🧘",
    color: "#AF52DE",
    backgroundColor: "#F8F0FF",
    message:
      "The receipt is blank. The wallet is full. The worm has reached nirvana.",
    eyeStyle: "closed",
    accessory: "lotus",
    personality: "peaceful",
    gooeyness: 0.4,
    bounceIntensity: 0.3,
    gooSpeed: 0.4,
  },
  suspicious: {
    emoji: "👀",
    color: "#FFCC00",
    backgroundColor: "#FFFDF0",
    message:
      "Three types of cheese? You're either building a cheese board or a cheese fort. The worm is watching.",
    eyeStyle: "squint",
    accessory: "magnifying",
    personality: "investigative",
    gooeyness: 0.9,
    bounceIntensity: 0.7,
    gooSpeed: 0.9,
  },
  insightful: {
    emoji: "✨",
    color: "#007AFF",
    backgroundColor: "#F0F8FF",
    message:
      "A masterclass in couponing. You've saved enough for... another, smaller cucumber. Bravo.",
    eyeStyle: "sparkle",
    accessory: "crown",
    personality: "proud",
    gooeyness: 1.0,
    bounceIntensity: 0.8,
    gooSpeed: 1.0,
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
  const theme = useTheme<AppTheme>();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const eyeAnim = useRef(new Animated.Value(1)).current;
  const speechAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const accessoryAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const squishAnim = useRef(new Animated.Value(1)).current;
  const stretchAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Full screen goo animations
  const gooSpreadAnim = useRef(new Animated.Value(0)).current;
  const gooOpacityAnim = useRef(new Animated.Value(0)).current;
  const gooBlobAnim = useRef(new Animated.Value(0)).current;
  const gooWaveAnim = useRef(new Animated.Value(0)).current;

  const [isPressed, setIsPressed] = useState(false);
  const [gooActive, setGooActive] = useState(false);

  // Pan gesture for dragging
  const pan = useRef(new Animated.ValueXY()).current;
  const lastPan = useRef({ x: 0, y: 0 });

  const config = moodConfig[mood] || moodConfig.calm;
  const customMessage =
    message || config.message || "The worm is processing...";

  // Big, gooey size calculations
  const sizeMap = {
    small: { worm: 140, segments: 8, speechWidth: 300 },
    medium: { worm: 180, segments: 10, speechWidth: 340 },
    large: { worm: 220, segments: 12, speechWidth: 380 },
  };
  const { worm: wormSize, segments, speechWidth } = sizeMap[size];
  const segmentSize = wormSize / segments;

  // Full screen goo effect
  useEffect(() => {
    if (!animated) return;

    // Continuous goo blob animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gooBlobAnim, {
          toValue: 1,
          duration: 4000 / config.gooSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(gooBlobAnim, {
          toValue: 0,
          duration: 4000 / config.gooSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Goo wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gooWaveAnim, {
          toValue: 1,
          duration: 3000 / config.gooSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(gooWaveAnim, {
          toValue: 0,
          duration: 3000 / config.gooSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [mood, animated, config.gooSpeed]);

  // Advanced gooey physics animation
  useEffect(() => {
    if (!animated) return;

    const gooeyLoop = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(squishAnim, {
            toValue: 1 + config.gooeyness * 0.4,
            duration: 2500 + config.gooeyness * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(squishAnim, {
            toValue: 1,
            duration: 2500 + config.gooeyness * 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(stretchAnim, {
            toValue: 1 - config.gooeyness * 0.3,
            duration: 2500 + config.gooeyness * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(stretchAnim, {
            toValue: 1,
            duration: 2500 + config.gooeyness * 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: config.bounceIntensity,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start(() => gooeyLoop());
    };

    gooeyLoop();
  }, [mood, animated, config.gooeyness, config.bounceIntensity]);

  // Characterful eye animations
  useEffect(() => {
    if (!animated) return;

    switch (config.eyeStyle) {
      case "wide":
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeAnim, {
              toValue: 1.5,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(eyeAnim, {
              toValue: 1,
              duration: 1800,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case "narrow":
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeAnim, {
              toValue: 0.5,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(eyeAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case "sparkle":
        Animated.loop(
          Animated.sequence([
            Animated.timing(eyeAnim, {
              toValue: 1.4,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(eyeAnim, {
              toValue: 0.6,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case "squint":
        eyeAnim.setValue(0.4);
        break;
      default:
        eyeAnim.setValue(1);
    }
  }, [mood, animated]);

  // Continuous wiggle animation
  useEffect(() => {
    if (!animated) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(wiggleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(wiggleAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animated]);

  // Entrance animation
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      Animated.spring(accessoryAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 6,
        delay: 500,
      }).start();

      if (showSpeechBubble) {
        setTimeout(() => {
          Animated.spring(speechAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }, 800);
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
    Animated.parallel([
      Animated.spring(pressAnim, {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 80,
        friction: 4,
      }),
      Animated.timing(squishAnim, {
        toValue: 1.6,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!interactive) return;

    setIsPressed(false);
    Animated.parallel([
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 4,
      }),
      Animated.spring(squishAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!interactive || !onPress) return;

    // Trigger full screen goo effect
    setGooActive(true);

    Animated.parallel([
      Animated.timing(gooSpreadAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(gooOpacityAnim, {
        toValue: 0.8,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Enhanced gooey press feedback
    Animated.sequence([
      Animated.parallel([
        Animated.timing(pressAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(squishAnim, {
          toValue: 1.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: config.bounceIntensity * 2,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(pressAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 5,
        }),
        Animated.spring(squishAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 5,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 5,
        }),
      ]),
    ]).start();

    // Retract goo after delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(gooSpreadAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(gooOpacityAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setGooActive(false);
      });
    }, 3000);

    onPress();
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastPan.current = {
        x: lastPan.current.x + event.nativeEvent.translationX,
        y: lastPan.current.y + event.nativeEvent.translationY,
      };

      // Enhanced spring back with gooey physics
      Animated.parallel([
        Animated.spring(pan.x, {
          toValue: 0,
          useNativeDriver: false,
          tension: 30,
          friction: 8,
        }),
        Animated.spring(pan.y, {
          toValue: 0,
          useNativeDriver: false,
          tension: 30,
          friction: 8,
        }),
      ]).start();

      // Enhanced gooey squish effect - run after pan animation completes
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(squishAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(squishAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 7,
          }),
        ]).start();
      }, 100);
    }
  };

  const renderAccessory = () => {
    const accessorySize = segmentSize * 1.0;

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
            <View
              style={[styles.monocle, { borderColor: theme.colors.onSurface }]}
            />
          </Animated.View>
        );
      case "crown":
        return (
          <Animated.View
            style={[
              styles.accessory,
              {
                width: accessorySize * 1.8,
                height: accessorySize,
                transform: [{ scale: accessoryAnim }],
              },
            ]}
          >
            <MaterialIcons
              name="star"
              size={accessorySize * 0.9}
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
              size={accessorySize * 0.9}
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
              size={accessorySize * 0.9}
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
              size={accessorySize * 0.9}
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
      {/* Full Screen Goo Effect */}
      {gooActive && (
        <Animated.View
          style={[
            styles.fullScreenGoo,
            {
              backgroundColor: config.color,
              opacity: gooOpacityAnim,
              transform: [
                {
                  scale: gooSpreadAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 3],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Animated goo blobs */}
          {Array.from({ length: 8 }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.gooBlob,
                {
                  backgroundColor: config.color,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: 100 + Math.random() * 200,
                  height: 100 + Math.random() * 200,
                  transform: [
                    {
                      scale: gooBlobAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                    {
                      rotate: gooBlobAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          `${index * 45}deg`,
                          `${index * 45 + 360}deg`,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}

          {/* Goo waves */}
          {Array.from({ length: 3 }).map((_, index) => (
            <Animated.View
              key={`wave-${index}`}
              style={[
                styles.gooWave,
                {
                  backgroundColor: config.color,
                  top: `${20 + index * 25}%`,
                  transform: [
                    {
                      translateX: gooWaveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-screenWidth, screenWidth],
                      }),
                    },
                    {
                      scaleY: gooWaveAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}

      {/* Speech bubble */}
      {showSpeechBubble && (
        <Animated.View
          style={[
            styles.speechBubble,
            {
              width: speechWidth,
              backgroundColor: theme.colors.surface,
              opacity: speechAnim,
              transform: [
                { scale: speechAnim },
                {
                  translateY: speechAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={[styles.speechText, { color: theme.colors.onSurface }]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {customMessage}
          </Text>
          <View
            style={[
              styles.speechTail,
              { borderTopColor: theme.colors.surface },
            ]}
          />
        </Animated.View>
      )}

      {/* Big Gooey Radar Worm */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={interactive}
      >
        <Animated.View
          style={[
            styles.wormContainer,
            {
              transform: [
                { scale: scaleAnim },
                { scale: pressAnim },
                { translateX: pan.x },
                { translateY: pan.y },
                {
                  rotate: wiggleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-4deg", "4deg"],
                  }),
                },
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.worm,
              {
                width: wormSize,
                height: segmentSize * 1.8,
              },
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={interactive ? 0.9 : 1}
            disabled={!interactive}
          >
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  width: wormSize * 1.2,
                  height: segmentSize * 2.2,
                  backgroundColor: config.color,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.3],
                  }),
                },
              ]}
            />

            {/* Gooey worm segments with advanced physics */}
            {Array.from({ length: segments }).map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.segment,
                  {
                    width: segmentSize,
                    height: segmentSize,
                    backgroundColor: config.color,
                    opacity: 1 - index * 0.03,
                    transform: [
                      { translateX: index * (segmentSize * 0.35) },
                      { scale: 1 - index * 0.015 },
                      {
                        scaleX: squishAnim.interpolate({
                          inputRange: [0.5, 2.0],
                          outputRange: [0.7, 1.4],
                        }),
                      },
                      {
                        scaleY: stretchAnim.interpolate({
                          inputRange: [0.5, 2.0],
                          outputRange: [1.3, 0.6],
                        }),
                      },
                      {
                        rotate: wiggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            `${-2 - index * 0.5}deg`,
                            `${2 + index * 0.5}deg`,
                          ],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}

            {/* Big expressive eyes */}
            <View style={[styles.eyes, { top: segmentSize * 0.4 }]}>
              <Animated.View
                style={[
                  styles.eye,
                  {
                    width: segmentSize * 0.3,
                    height: segmentSize * 0.3,
                    transform: [{ scale: eyeAnim }],
                    opacity: config.eyeStyle === "closed" ? 0.15 : 1,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.eye,
                  {
                    width: segmentSize * 0.3,
                    height: segmentSize * 0.3,
                    transform: [{ scale: eyeAnim }],
                    opacity: config.eyeStyle === "closed" ? 0.15 : 1,
                  },
                ]}
              />
            </View>

            {/* Accessories */}
            {renderAccessory()}

            {/* Receipt clip */}
            <View style={styles.receiptClip}>
              <MaterialIcons
                name="receipt"
                size={segmentSize * 0.6}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Mood indicator */}
      <View style={styles.moodIndicator}>
        <Text style={styles.moodEmoji}>{config.emoji || "🐛"}</Text>
        {totalSpend !== undefined && totalSpend !== null && (
          <Text
            style={[styles.spendText, { color: theme.colors.onSurfaceVariant }]}
          >
            ${totalSpend.toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingHorizontal: 48,
  },
  fullScreenGoo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  gooBlob: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.6,
  },
  gooWave: {
    position: "absolute",
    width: screenWidth * 2,
    height: 60,
    borderRadius: 30,
    opacity: 0.4,
  },
  speechBubble: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 28,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    position: "relative",
  },
  speechText: {
    fontSize: 17,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  speechTail: {
    position: "absolute",
    bottom: -12,
    left: "50%",
    marginLeft: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
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
  glowEffect: {
    position: "absolute",
    borderRadius: 50,
    zIndex: -1,
  },
  segment: {
    position: "absolute",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  eyes: {
    position: "absolute",
    flexDirection: "row",
    gap: 16,
    zIndex: 10,
  },
  eye: {
    backgroundColor: "#000",
    borderRadius: 50,
  },
  accessory: {
    position: "absolute",
    top: -20,
    right: -20,
    zIndex: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  monocle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    backgroundColor: "transparent",
  },
  receiptClip: {
    position: "absolute",
    bottom: -10,
    left: -10,
    zIndex: 5,
    opacity: 0.7,
  },
  moodIndicator: {
    marginTop: 24,
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  spendText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
