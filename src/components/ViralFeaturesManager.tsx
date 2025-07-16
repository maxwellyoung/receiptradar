import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
} from "react-native";
import { ReceiptCritter } from "./ReceiptCritter";
import { ConfettiBarcodeRain } from "./ConfettiBarcodeRain";
import { GroceryAura } from "./GroceryAura";
import * as Haptics from "expo-haptics";

interface ViralFeaturesManagerProps {
  totalSpend: number;
  categoryBreakdown: Record<string, number>;
  savingsAmount?: number;
  weekNumber?: number;
}

const BUTTON_BOUNCE_DURATION = 200;
const MASCOT_POP_DURATION = 400;
const MASCOT_SLIDE_DISTANCE = 60;

export const ViralFeaturesManager: React.FC<ViralFeaturesManagerProps> = ({
  totalSpend,
  categoryBreakdown,
  savingsAmount = 0,
  weekNumber = 1,
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

  useEffect(() => {
    if (step === "confetti") {
      setShowConfetti(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        setShowConfetti(false);
        setStep("mascot");
      }, 1200);
    } else if (step === "mascot") {
      setShowCritter(true);
      Animated.spring(mascotBounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (step === "aura") {
      setShowAura(true);
      Animated.timing(auraRevealAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [step]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    setTimeout(() => {
      setShowCritter(true);
    }, 500);
  };

  const handleCritterShare = () => {
    // Share critter as GIF or image
    console.log("Sharing critter!");
  };

  const handleCritterContinue = async () => {
    // Animate button bounce
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 1.15,
        duration: BUTTON_BOUNCE_DURATION,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: BUTTON_BOUNCE_DURATION,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Play button sound here when sound file is available
    // Confetti burst (reuse ConfettiBarcodeRain or trigger parent confetti if needed)
    setTimeout(() => {
      setShowCritter(false);
      setCritterDone(true);
      setTimeout(() => {
        setShowAura(true);
      }, 500);
    }, BUTTON_BOUNCE_DURATION * 2);
  };

  const handleAuraShare = () => {
    setShowAura(false);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === "mascot") {
      setShowCritter(false);
      setTimeout(() => setStep("aura"), 400);
    } else if (step === "aura") {
      setShowAura(false);
      setTimeout(() => setStep("done"), 400);
    }
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
        <View style={styles.fullScreenModal}>
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
          <Text style={styles.critterCopy}>
            You're a grocery genius. Your mascot is here to celebrate your
            mindful spending!
          </Text>
          <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue ➡️</Text>
            </TouchableOpacity>
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
          <Animated.View style={{ opacity: auraRevealAnim }}>
            <GroceryAura
              categoryBreakdown={categoryBreakdown}
              totalSpend={totalSpend}
              weekNumber={weekNumber}
            />
            <TouchableOpacity
              onPress={handleContinue}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue ➡️</Text>
            </TouchableOpacity>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  critterCopy: {
    fontSize: 18,
    color: "#222",
    textAlign: "center",
    marginVertical: 24,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#10B981",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
