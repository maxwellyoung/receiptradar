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

  const fetchReceipts = useCallback(async () => {
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

      const appReceipts: Receipt[] = (data || []).map((dbReceipt: any) => ({
        id: dbReceipt.id,
        user_id: dbReceipt.user_id,
        store_id: dbReceipt.store_id,
        ts: dbReceipt.date,
        total: dbReceipt.total_amount,
        raw_url: dbReceipt.image_url || "",
        created_at: dbReceipt.created_at,
        store: {
          id: dbReceipt.store_id,
          name: dbReceipt.store_name,
          chain: "Unknown",
          lat: 0,
          lon: 0,
          created_at: "",
        },
      }));

      setState({
        receipts: appReceipts,
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
  }, [userId, searchTerm]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

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

  const getCategoryBreakdown = (): CategoryBreakdown => categoryBreakdown;

  const getSpendingAnalytics = (): SpendingAnalytics => {
    const totalSpent = state.receipts.reduce(
      (sum, receipt) => sum + receipt.total,
      0
    );
    // These fields also need re-evaluation
    const totalSavings = 0; // state.receipts.reduce(
    //   (sum, receipt) => sum + (receipt.savings_identified || 0),
    //   0
    // );
    const totalCashback = 0; // state.receipts.reduce(
    //   (sum, receipt) => sum + (receipt.cashback_earned || 0),
    //   0
    // );
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

  const getWeeklySpending = (weeks: number = 4) => {
    const weeklyData: { week: string; total: number }[] = [];
    const now = new Date();

    for (let i = 0; i < weeks; i++) {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - i * 7);
      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);

      const weekLabel = `${startOfWeek.getDate()}/${
        startOfWeek.getMonth() + 1
      }`;
      const weekTotal = state.receipts
        .filter((r) => {
          const receiptDate = new Date(r.ts);
          return receiptDate >= startOfWeek && receiptDate <= endOfWeek;
        })
        .reduce((sum, r) => sum + r.total, 0);

      weeklyData.unshift({ week: weekLabel, total: weekTotal });
    }

    return weeklyData;
  };

  const getSpendingByCategory = () => {
    return categoryBreakdown;
  };

  return {
    ...state,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    getReceiptById,
    refresh,
    clearError,
    search,
    // Analytics
    getTodaySpend,
    getCategoryBreakdown,
    getSpendingAnalytics,
    getWeeklySpending,
    getSpendingByCategory,
  };
};
