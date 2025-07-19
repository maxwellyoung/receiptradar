import { useState, useCallback } from "react";

export type EffectType = "particles" | "waves" | "floating" | "confetti";

export interface EffectConfig {
  effect: EffectType;
  color?: string;
  intensity?: number;
  duration?: number;
}

export interface ThreeJSEffectsHook {
  isPlaying: boolean;
  activeEffect: EffectConfig | null;
  triggerEffect: (config: EffectConfig) => void;
  triggerSuccess: () => void;
  triggerSavings: () => void;
  triggerReceiptProcessed: () => void;
  triggerAchievement: () => void;
  triggerPriceDrop: () => void;
  triggerStreak: () => void;
  stopEffect: () => void;
}

// Predefined effect configurations
const EFFECT_PRESETS = {
  success: {
    effect: "confetti" as EffectType,
    color: "#4CAF50",
    intensity: 1.5,
    duration: 3000,
  },
  savings: {
    effect: "particles" as EffectType,
    color: "#FFD700",
    intensity: 1.2,
    duration: 4000,
  },
  receiptProcessed: {
    effect: "floating" as EffectType,
    color: "#9C27B0",
    intensity: 1,
    duration: 3500,
  },
  achievement: {
    effect: "waves" as EffectType,
    color: "#2196F3",
    intensity: 1.3,
    duration: 4500,
  },
  priceDrop: {
    effect: "particles" as EffectType,
    color: "#FF5722",
    intensity: 1.1,
    duration: 3000,
  },
  streak: {
    effect: "confetti" as EffectType,
    color: "#FF9800",
    intensity: 1.8,
    duration: 2500,
  },
};

export const useThreeJSEffects = (): ThreeJSEffectsHook => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectConfig | null>(null);

  const triggerEffect = useCallback((config: EffectConfig) => {
    setActiveEffect(config);
    setIsPlaying(true);

    // Auto-stop after duration
    setTimeout(() => {
      setIsPlaying(false);
      setActiveEffect(null);
    }, config.duration || 3000);
  }, []);

  const triggerSuccess = useCallback(() => {
    triggerEffect(EFFECT_PRESETS.success);
  }, [triggerEffect]);

  const triggerSavings = useCallback(() => {
    triggerEffect(EFFECT_PRESETS.savings);
  }, [triggerEffect]);

  const triggerReceiptProcessed = useCallback(() => {
    triggerEffect(EFFECT_PRESETS.receiptProcessed);
  }, [triggerEffect]);

  const triggerAchievement = useCallback(() => {
    triggerEffect(EFFECT_PRESETS.achievement);
  }, [triggerEffect]);

  const triggerPriceDrop = useCallback(() => {
    triggerEffect(EFFECT_PRESETS.priceDrop);
  }, [triggerEffect]);

  const triggerStreak = useCallback(() => {
    triggerEffect(EFFECT_PRESETS.streak);
  }, [triggerEffect]);

  const stopEffect = useCallback(() => {
    setIsPlaying(false);
    setActiveEffect(null);
  }, []);

  return {
    isPlaying,
    activeEffect,
    triggerEffect,
    triggerSuccess,
    triggerSavings,
    triggerReceiptProcessed,
    triggerAchievement,
    triggerPriceDrop,
    triggerStreak,
    stopEffect,
  };
};
