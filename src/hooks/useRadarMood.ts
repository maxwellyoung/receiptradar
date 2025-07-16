import { useMemo } from "react";
import { RadarMood } from "@/components/RadarWorm";
import { ReceiptOCRData } from "@/types/ocr";
import { BUSINESS_RULES } from "@/constants/business-rules";

interface ReceiptData {
  total_amount: number;
  ocr_data?: ReceiptOCRData;
  date?: string;
}

interface UseRadarMoodProps {
  receiptData?: ReceiptData;
  categoryBreakdown?: Record<string, number>;
  totalSpend?: number;
  isProcessing?: boolean;
  isError?: boolean;
  isDuplicate?: boolean;
  weeklySavings?: number;
  budgetStreak?: number;
}

export const useRadarMood = ({
  receiptData,
  categoryBreakdown,
  totalSpend,
  isProcessing,
  isError,
  isDuplicate,
  weeklySavings,
  budgetStreak,
}: UseRadarMoodProps) => {
  return useMemo(() => {
    // Processing state
    if (isProcessing) {
      return {
        mood: "calm" as RadarMood,
        message: "Scanning your receipt...",
        showSpeechBubble: false,
      };
    }

    // Error state
    if (isError) {
      return {
        mood: "suspicious" as RadarMood,
        message: "Something's fishy with this receipt...",
        showSpeechBubble: true,
      };
    }

    // Duplicate receipt
    if (isDuplicate) {
      return {
        mood: "suspicious" as RadarMood,
        message: "Are you laundering groceries?",
        showSpeechBubble: true,
      };
    }

    // Weekly savings achievement
    if (weeklySavings && weeklySavings > 0) {
      return {
        mood: "insightful" as RadarMood,
        message: `You saved $${weeklySavings.toFixed(
          2
        )} this week. Worm proud.`,
        showSpeechBubble: true,
      };
    }

    // Budget streak
    if (
      budgetStreak &&
      budgetStreak >= BUSINESS_RULES.BUDGET_STREAK_THRESHOLD
    ) {
      return {
        mood: "zen" as RadarMood,
        message: `You are one with the pantry. ${budgetStreak} days strong!`,
        showSpeechBubble: true,
      };
    }

    // Analyze spending patterns
    if (receiptData && categoryBreakdown) {
      const total = receiptData.total_amount;
      const items = receiptData.ocr_data?.items || [];

      // Check for luxury items
      const hasLuxuryItems = items.some((item) =>
        BUSINESS_RULES.LUXURY_ITEMS.some((keyword) =>
          item.name?.toLowerCase().includes(keyword)
        )
      );

      if (
        hasLuxuryItems &&
        total > BUSINESS_RULES.SPENDING_THRESHOLDS.LUXURY_THRESHOLD
      ) {
        return {
          mood: "dramatic" as RadarMood,
          message: "Caviar? In this economy?",
          showSpeechBubble: true,
        };
      }

      // Check for high snack spending
      const snacksSpend = categoryBreakdown["Snacks"] || 0;
      const convenienceSpend = categoryBreakdown["Convenience"] || 0;
      const totalSnackSpend = snacksSpend + convenienceSpend;
      const snackPercentage = (totalSnackSpend / total) * 100;

      if (snackPercentage > BUSINESS_RULES.SNACK_THRESHOLD * 100) {
        return {
          mood: "concerned" as RadarMood,
          message: "Another chips binge, huh?",
          showSpeechBubble: true,
        };
      }

      // Check for very low spending (zen mode)
      if (total < BUSINESS_RULES.SPENDING_THRESHOLDS.LOW_SPEND) {
        return {
          mood: "zen" as RadarMood,
          message: "You are one with the pantry.",
          showSpeechBubble: true,
        };
      }

      // Check for suspicious patterns
      const duplicateItems = items.filter(
        (item, index, arr) =>
          arr.findIndex((i) => i.name === item.name) !== index
      );

      if (duplicateItems.length > BUSINESS_RULES.DUPLICATE_ITEMS_THRESHOLD) {
        return {
          mood: "suspicious" as RadarMood,
          message: "Are you laundering groceries?",
          showSpeechBubble: true,
        };
      }

      // Default calm state for normal spending
      return {
        mood: "calm" as RadarMood,
        message: "Looks like a tidy little shop.",
        showSpeechBubble: true,
      };
    }

    // Fallback for when we have total spend but no detailed breakdown
    if (totalSpend) {
      if (totalSpend > BUSINESS_RULES.SPENDING_THRESHOLDS.HIGH_SPEND) {
        return {
          mood: "dramatic" as RadarMood,
          message: "Big spender alert!",
          showSpeechBubble: true,
        };
      } else if (totalSpend < BUSINESS_RULES.SPENDING_THRESHOLDS.LOW_SPEND) {
        return {
          mood: "zen" as RadarMood,
          message: "You are one with the pantry.",
          showSpeechBubble: true,
        };
      } else {
        return {
          mood: "calm" as RadarMood,
          message: "Looks like a tidy little shop.",
          showSpeechBubble: true,
        };
      }
    }

    // Default state
    return {
      mood: "calm" as RadarMood,
      message: "Ready to scan some receipts!",
      showSpeechBubble: true,
    };
  }, [
    receiptData,
    categoryBreakdown,
    totalSpend,
    isProcessing,
    isError,
    isDuplicate,
    weeklySavings,
    budgetStreak,
  ]);
};
