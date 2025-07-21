import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { ReceiptCritter } from "./ReceiptCritter";
import { ConfettiBarcodeRain } from "./ConfettiBarcodeRain";
import { GroceryAura } from "./GroceryAura";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";

interface ViralFeaturesManagerProps {
  totalSpend?: number;
  categoryBreakdown?: Record<string, number>;
  savingsAmount?: number;
  weekNumber?: number;
  receiptData?: any;
  onContinue?: () => void;
  onViewReceipt?: () => void;
}

const BUTTON_BOUNCE_DURATION = 200;
const MASCOT_POP_DURATION = 400;
const MASCOT_SLIDE_DISTANCE = 60;
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const ViralFeaturesManager: React.FC<ViralFeaturesManagerProps> = ({
  totalSpend = 0,
  categoryBreakdown = {},
  savingsAmount = 0,
  weekNumber = 1,
  receiptData,
  onContinue,
  onViewReceipt,
}) => {
  const [showCritter, setShowCritter] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAura, setShowAura] = useState(false);
  const [critterDone, setCritterDone] = useState(false);
  const mascotAnim = React.useRef(new Animated.Value(0)).current;
  const buttonAnim = React.useRef(new Animated.Value(1)).current;
  const [step, setStep] = useState<"confetti" | "mascot" | "aura" | "done">(
    "confetti"
  );
  const mascotBounceAnim = useRef(new Animated.Value(0)).current;
  const auraRevealAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start entrance animations
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
    ]).start();

    if (step === "confetti") {
      setShowConfetti(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // Smoother transition - longer confetti duration
      setTimeout(() => {
        setShowConfetti(false);
        // Add a small delay before mascot appears
        setTimeout(() => {
          setStep("mascot");
        }, 200);
      }, 1500);
    } else if (step === "mascot") {
      setShowCritter(true);
      // Smoother spring animation
      Animated.spring(mascotBounceAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (step === "aura") {
      setShowAura(true);
      // Smoother aura reveal
      Animated.timing(auraRevealAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [step]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    // Smoother transition with longer delay
    setTimeout(() => {
      setShowCritter(true);
    }, 300);
  };

  const handleCritterShare = () => {
    // Share critter as GIF or image
    logger.info("Sharing critter", { component: "ViralFeaturesManager" });
  };

  const handleContinue = () => {
    if (step === "confetti") {
      setStep("mascot");
    } else if (step === "mascot") {
      setShowCritter(false);
      setStep("aura");
    } else if (step === "aura") {
      setShowAura(false);
      setStep("done");
    }
  };

  const handleCritterComplete = () => {
    setCritterDone(true);
    // Smoother transition to aura
    setTimeout(() => {
      setShowCritter(false);
      // Add a small delay before aura appears
      setTimeout(() => {
        setStep("aura");
      }, 150);
    }, 1200);
  };

  const handleButtonPress = () => {
    // Smoother button animation
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Add a small delay before continuing
    setTimeout(() => {
      handleContinue();
    }, 50);
  };

  return (
    <View style={styles.container}>
      {/* Receipt Critter Modal */}
      <Modal
        visible={showCritter}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setShowCritter(false)}
      >
        <View style={styles.background}>
          <Animated.View
            style={[
              styles.fullScreenModal,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.contentContainer}>
              <Animated.View
                style={{
                  transform: [
                    { scale: mascotAnim },
                    {
                      translateY: mascotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [MASCOT_SLIDE_DISTANCE, 0],
                      }),
                    },
                  ],
                  opacity: mascotAnim,
                }}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: mascotBounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <ReceiptCritter
                    totalSpend={totalSpend}
                    categoryBreakdown={categoryBreakdown}
                    onShare={handleCritterShare}
                    visible={showCritter}
                  />
                </Animated.View>
              </Animated.View>

              <View style={styles.textContainer}>
                <Text style={styles.critterTitle}>
                  🎉 You're a Grocery Genius! 🎉
                </Text>
                <Text style={styles.critterCopy}>
                  Your mascot is here to celebrate your mindful spending! Keep
                  up the amazing work with your budget.
                </Text>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleButtonPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Confetti Barcode Rain */}
      <ConfettiBarcodeRain
        visible={showConfetti}
        savingsAmount={savingsAmount}
        onComplete={handleConfettiComplete}
      />

      {/* Grocery Aura Modal */}
      <Modal
        visible={showAura}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAura(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: slideAnim }],
              },
            ]}
          >
            <View style={styles.modalBackground}>
              <Animated.View
                style={[styles.auraContainer, { opacity: auraRevealAnim }]}
              >
                <GroceryAura
                  categoryBreakdown={categoryBreakdown}
                  totalSpend={totalSpend}
                  weekNumber={weekNumber}
                />
              </Animated.View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={handleButtonPress}
                  style={styles.auraContinueButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.auraButtonContent}>
                    <Text style={styles.auraContinueButtonText}>Continue</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    pointerEvents: "box-none",
  },
  background: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  fullScreenModal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  critterTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  critterCopy: {
    fontSize: 16,
    color: "#86868B",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1001,
  },
  modalContent: {
    width: screenWidth - 40,
    maxHeight: screenHeight - 120,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  auraContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  auraContinueButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  auraButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  auraContinueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
