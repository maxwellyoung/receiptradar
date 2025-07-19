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
        store_id:
          dbReceipt.store_id ||
          dbReceipt.store_name?.toLowerCase().replace(/\s+/g, "_"),
        ts: dbReceipt.date,
        total: dbReceipt.total_amount,
        raw_url: dbReceipt.image_url || "",
        created_at: dbReceipt.created_at,
        store: {
          id:
            dbReceipt.store_id ||
            dbReceipt.store_name?.toLowerCase().replace(/\s+/g, "_"),
          name: dbReceipt.store_name,
          chain: dbReceipt.store_name,
          lat: 0,
          lon: 0,
          created_at: dbReceipt.created_at || "",
        },
        // Add additional fields for receipt detail view
        store_name: dbReceipt.store_name,
        total_amount: dbReceipt.total_amount,
        date: dbReceipt.date,
        image_url: dbReceipt.image_url,
        ocr_data: dbReceipt.ocr_data,
        savings_identified: dbReceipt.savings_identified || 0,
        cashback_earned: dbReceipt.cashback_earned || 0,
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
  };
};
