import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@/utils/logger";

export type ToneMode = "gentle" | "hard" | "silly" | "wise";

interface UseToneModeReturn {
  toneMode: ToneMode;
  setToneMode: (mode: ToneMode) => Promise<void>;
  isLoading: boolean;
}

export const useToneMode = (): UseToneModeReturn => {
  const [toneMode, setToneModeState] = useState<ToneMode>("gentle");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToneMode();
  }, []);

  const loadToneMode = async () => {
    try {
      const savedTone = await AsyncStorage.getItem("@toneMode");
      if (
        savedTone &&
        ["gentle", "hard", "silly", "wise"].includes(savedTone)
      ) {
        setToneModeState(savedTone as ToneMode);
      }
    } catch (error) {
      logger.error("Failed to load tone mode", error as Error, {
        component: "useToneMode",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setToneMode = async (mode: ToneMode) => {
    try {
      await AsyncStorage.setItem("@toneMode", mode);
      setToneModeState(mode);
    } catch (error) {
      logger.error("Failed to save tone mode", error as Error, {
        component: "useToneMode",
      });
    }
  };

  return {
    toneMode,
    setToneMode,
    isLoading,
  };
};
