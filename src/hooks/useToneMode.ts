import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      console.error("Failed to load tone mode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setToneMode = async (mode: ToneMode) => {
    try {
      await AsyncStorage.setItem("@toneMode", mode);
      setToneModeState(mode);
    } catch (error) {
      console.error("Failed to save tone mode:", error);
    }
  };

  return {
    toneMode,
    setToneMode,
    isLoading,
  };
};
