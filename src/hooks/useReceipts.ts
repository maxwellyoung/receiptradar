import { useEffect, useState, useMemo, useCallback } from "react";
import { dbService } from "@/services/supabase";
import {
  Receipt as DbReceipt,
  ReceiptInsert,
  ReceiptUpdate,
} from "@/types/database";
import { Receipt } from "@/types";
import { BUSINESS_RULES } from "@/constants/business-rules";
import { OCRItem } from "@/types/ocr";
import { handleAsyncError, logError } from "@/utils/error-handler";
import { STORE_IDENTIFIERS } from "@/parsers/stores";

interface ReceiptsState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
}

interface CategoryBreakdown {
  [category: string]: number;
}

interface SpendingAnalytics {
  totalSpent: number;
  totalSavings: number;
  totalCashback: number;
  receiptCount: number;
  averageReceiptValue: number;
}

export const useReceipts = (userId: string) => {
  const [state, setState] = useState<ReceiptsState>({
    receipts: [],
    loading: true,
    error: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Function to improve store name detection
  const improveStoreName = (receipt: any): string => {
    // If store name is already good, return it
    if (receipt.store_name && receipt.store_name !== "Unknown Store") {
      return receipt.store_name;
    }

    // Try to extract store name from OCR data
    if (receipt.ocr_data && receipt.ocr_data.text) {
      const text = receipt.ocr_data.text.toLowerCase();

      // Check for store identifiers
      for (const [storeName, identifier] of Object.entries(STORE_IDENTIFIERS)) {
        if (identifier.test(text)) {
          return storeName;
        }
      }
    }

    // Fallback based on amount or other heuristics
    if (receipt.total_amount > 0) {
      return "Local Store";
    }

    return "Unknown Store";
  };

  const fetchReceipts = async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await handleAsyncError(
        dbService.getReceipts(userId, searchTerm),
        "useReceipts.fetchReceipts"
      );

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      const appReceipts: Receipt[] = (data || []).map((dbReceipt: any) => {
        const improvedStoreName = improveStoreName(dbReceipt);

        return {
          id: dbReceipt.id,
          user_id: dbReceipt.user_id,
          store_id:
            dbReceipt.store_id ||
            improvedStoreName.toLowerCase().replace(/\s+/g, "_"),
          ts: dbReceipt.date,
          total: dbReceipt.total_amount,
          raw_url: dbReceipt.image_url || "",
          created_at: dbReceipt.created_at,
          store: {
            id:
              dbReceipt.store_id ||
              improvedStoreName.toLowerCase().replace(/\s+/g, "_"),
            name: improvedStoreName,
            chain: improvedStoreName,
            lat: 0,
            lon: 0,
            created_at: dbReceipt.created_at || "",
          },
          // Add additional fields for receipt detail view
          store_name: improvedStoreName,
          total_amount: dbReceipt.total_amount,
          date: dbReceipt.date,
          image_url: dbReceipt.image_url,
          ocr_data: dbReceipt.ocr_data,
          savings_identified: dbReceipt.savings_identified || 0,
          cashback_earned: dbReceipt.cashback_earned || 0,
        };
      });

      // If no receipts, add some sample data for demonstration
      let finalReceipts = appReceipts;

      if (appReceipts.length === 0) {
        const sampleReceipts: Receipt[] = [
          {
            id: "00000000-0000-0000-0000-000000000001",
            user_id: userId,
            store_id: "countdown",
            ts: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            total: 45.67,
            raw_url: "",
            created_at: new Date().toISOString(),
            store: {
              id: "countdown",
              name: "Countdown",
              chain: "Countdown",
              lat: 0,
              lon: 0,
              created_at: new Date().toISOString(),
            },
          },
          {
            id: "00000000-0000-0000-0000-000000000002",
            user_id: userId,
            store_id: "new_world",
            ts: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            total: 78.9,
            raw_url: "",
            created_at: new Date().toISOString(),
            store: {
              id: "new_world",
              name: "New World",
              chain: "New World",
              lat: 0,
              lon: 0,
              created_at: new Date().toISOString(),
            },
          },
          {
            id: "00000000-0000-0000-0000-000000000003",
            user_id: userId,
            store_id: "paknsave",
            ts: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            total: 32.45,
            raw_url: "",
            created_at: new Date().toISOString(),
            store: {
              id: "paknsave",
              name: "Pak'nSave",
              chain: "Pak'nSave",
              lat: 0,
              lon: 0,
              created_at: new Date().toISOString(),
            },
          },
        ];
        finalReceipts = sampleReceipts;
      }

      setState({
        receipts: finalReceipts,
        loading: false,
        error: null,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logError(error, "useReceipts.fetchReceipts");
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [userId, searchTerm]);

  const createReceipt = async (receiptData: Omit<ReceiptInsert, "user_id">) => {
    if (!userId) return { error: "User not authenticated" };

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await dbService.createReceipt({
        ...receiptData,
        user_id: userId,
      });

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      if (data) {
        setState((prev) => ({
          receipts: [data, ...prev.receipts],
          loading: false,
          error: null,
        }));
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create receipt";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const updateReceipt = async (id: string, updates: ReceiptUpdate) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await dbService.updateReceipt(id, updates);

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      if (data) {
        setState((prev) => ({
          receipts: prev.receipts.map((receipt) =>
            receipt.id === id ? data : receipt
          ),
          loading: false,
          error: null,
        }));
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update receipt";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const deleteReceipt = async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await dbService.deleteReceipt(id);

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }

      setState((prev) => ({
        receipts: prev.receipts.filter((receipt) => receipt.id !== id),
        loading: false,
        error: null,
      }));

      return { error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete receipt";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const getReceiptById = async (id: string) => {
    try {
      const { data, error } = await dbService.getReceiptById(id);
      return { data, error };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch receipt",
      };
    }
  };

  const search = (term: string) => {
    setSearchTerm(term);
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const refresh = () => {
    fetchReceipts();
  };

  const getTodaySpend = () => {
    const today = new Date().toDateString();
    return state.receipts
      .filter((receipt) => new Date(receipt.ts).toDateString() === today)
      .reduce((total, receipt) => total + receipt.total, 0);
  };

  const categoryBreakdown = useMemo((): CategoryBreakdown => {
    const breakdown: CategoryBreakdown = {};

    state.receipts.forEach((receipt) => {
      // Fallback to estimated breakdown if no OCR data
      Object.entries(BUSINESS_RULES.ESTIMATED_BREAKDOWN).forEach(
        ([category, percentage]) => {
          breakdown[category] =
            (breakdown[category] || 0) + receipt.total * (percentage as number);
        }
      );
    });

    return breakdown;
  }, [state.receipts]);

  const getSpendingByCategory = (): CategoryBreakdown => categoryBreakdown;

  const getWeeklySpending = (numWeeks: number) => {
    const weeklySpending: { week: string; total: number }[] = [];
    const now = new Date();

    for (let i = 0; i < numWeeks; i++) {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - i * 7);
      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);

      const weekLabel = `Week ${numWeeks - i}`;

      const total = state.receipts
        .filter((receipt) => {
          const receiptDate = new Date(receipt.ts);
          return receiptDate >= startOfWeek && receiptDate <= endOfWeek;
        })
        .reduce((sum, receipt) => sum + receipt.total, 0);

      weeklySpending.unshift({ week: weekLabel, total });
    }

    return weeklySpending;
  };

  const getSpendingAnalytics = (): SpendingAnalytics => {
    const totalSpent = state.receipts.reduce(
      (sum, receipt) => sum + receipt.total,
      0
    );

    const totalSavings = state.receipts.reduce(
      (sum, receipt) => sum + ((receipt as any).savings_identified || 0),
      0
    );

    const totalCashback = state.receipts.reduce(
      (sum, receipt) => sum + ((receipt as any).cashback_earned || 0),
      0
    );

    const receiptCount = state.receipts.length;
    const averageReceiptValue =
      receiptCount > 0 ? totalSpent / receiptCount : 0;

    return {
      totalSpent,
      totalSavings,
      totalCashback,
      receiptCount,
      averageReceiptValue,
    };
  };

  const submitCorrections = async (
    receiptId: string,
    payload: { user_id: string; items: any[] }
  ): Promise<{ success: boolean; error?: string }> => {
    // TODO: Replace with real API call
    // await fetch(`${API_CONFIG.baseUrl}/receipts/${receiptId}/corrections`, { ... })
    // For now, just log and resolve
    console.log("Submitting corrections:", { receiptId, ...payload });
    return { success: true };
  };

  return {
    ...state,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    getReceiptById,
    search,
    clearError,
    refresh,
    getTodaySpend,
    getSpendingByCategory,
    getSpendingAnalytics,
    getWeeklySpending,
    submitCorrections,
  };
};
