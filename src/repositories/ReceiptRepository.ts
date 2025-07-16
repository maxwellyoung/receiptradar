import { dbService } from "@/services/supabase";
import { Receipt, ReceiptInsert, ReceiptUpdate } from "@/types/database";
import { ReceiptOCRData } from "@/types/ocr";
import {
  handleAsyncError,
  logError,
  ErrorCode,
  createError,
} from "@/utils/error-handler";

export interface CategoryBreakdown {
  [category: string]: number;
}

export interface SpendingAnalytics {
  totalSpent: number;
  totalSavings: number;
  totalCashback: number;
  receiptCount: number;
  averageReceiptValue: number;
}

export interface WeeklySpendingData {
  week: string;
  amount: number;
  receiptCount: number;
}

export class ReceiptRepository {
  /**
   * Retrieves all receipts for a specific user, with optional pagination.
   * @param userId - The ID of the user whose receipts to fetch.
   * @param limit - The maximum number of receipts to return.
   * @returns A promise that resolves to an array of receipts.
   */
  async getReceipts(userId: string, limit = 50): Promise<Receipt[]> {
    try {
      const { data, error } = await handleAsyncError(
        dbService.getReceipts(userId, limit),
        "ReceiptRepository.getReceipts"
      );

      if (error) {
        throw createError(ErrorCode.DATABASE_ERROR, error.message, { userId });
      }

      return data || [];
    } catch (error) {
      logError(error, "ReceiptRepository.getReceipts");
      throw error;
    }
  }

  /**
   * Retrieves a single receipt by its unique ID.
   * @param id - The ID of the receipt to fetch.
   * @returns A promise that resolves to the receipt object or null if not found.
   */
  async getReceiptById(id: string): Promise<Receipt | null> {
    try {
      const { data, error } = await handleAsyncError(
        dbService.getReceiptById(id),
        "ReceiptRepository.getReceiptById"
      );

      if (error) {
        throw createError(ErrorCode.RESOURCE_NOT_FOUND, error.message, { id });
      }

      return data;
    } catch (error) {
      logError(error, "ReceiptRepository.getReceiptById");
      throw error;
    }
  }

  /**
   * Creates a new receipt in the database.
   * @param receiptData - The data for the new receipt.
   * @returns A promise that resolves to the newly created receipt.
   */
  async createReceipt(
    receiptData: Omit<ReceiptInsert, "id" | "created_at" | "updated_at">
  ): Promise<Receipt> {
    try {
      const { data, error } = await handleAsyncError(
        dbService.createReceipt(receiptData),
        "ReceiptRepository.createReceipt"
      );

      if (error) {
        throw createError(ErrorCode.DATABASE_ERROR, error.message, {
          receiptData,
        });
      }

      if (!data) {
        throw createError(ErrorCode.DATABASE_ERROR, "Failed to create receipt");
      }

      return data;
    } catch (error) {
      logError(error, "ReceiptRepository.createReceipt");
      throw error;
    }
  }

  /**
   * Updates an existing receipt with new data.
   * @param id - The ID of the receipt to update.
   * @param updates - An object containing the fields to update.
   * @returns A promise that resolves to the updated receipt.
   */
  async updateReceipt(id: string, updates: ReceiptUpdate): Promise<Receipt> {
    try {
      const { data, error } = await handleAsyncError(
        dbService.updateReceipt(id, updates),
        "ReceiptRepository.updateReceipt"
      );

      if (error) {
        throw createError(ErrorCode.DATABASE_ERROR, error.message, {
          id,
          updates,
        });
      }

      if (!data) {
        throw createError(ErrorCode.RESOURCE_NOT_FOUND, "Receipt not found", {
          id,
        });
      }

      return data;
    } catch (error) {
      logError(error, "ReceiptRepository.updateReceipt");
      throw error;
    }
  }

  /**
   * Deletes a receipt from the database.
   * @param id - The ID of the receipt to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  async deleteReceipt(id: string): Promise<void> {
    try {
      const { error } = await handleAsyncError(
        dbService.deleteReceipt(id),
        "ReceiptRepository.deleteReceipt"
      );

      if (error) {
        throw createError(ErrorCode.DATABASE_ERROR, error.message, { id });
      }
    } catch (error) {
      logError(error, "ReceiptRepository.deleteReceipt");
      throw error;
    }
  }

  /**
   * Calculates and returns spending analytics for a user.
   * @param userId - The ID of the user to analyze.
   * @returns A promise that resolves to an object with spending analytics.
   */
  async getSpendingAnalytics(userId: string): Promise<SpendingAnalytics> {
    try {
      const receipts = await this.getReceipts(userId);

      const totalSpent = receipts.reduce(
        (sum, receipt) => sum + receipt.total_amount,
        0
      );
      const totalSavings = receipts.reduce(
        (sum, receipt) => sum + (receipt.savings_identified || 0),
        0
      );
      const totalCashback = receipts.reduce(
        (sum, receipt) => sum + (receipt.cashback_earned || 0),
        0
      );
      const receiptCount = receipts.length;
      const averageReceiptValue =
        receiptCount > 0 ? totalSpent / receiptCount : 0;

      return {
        totalSpent,
        totalSavings,
        totalCashback,
        receiptCount,
        averageReceiptValue,
      };
    } catch (error) {
      logError(error, "ReceiptRepository.getSpendingAnalytics");
      throw error;
    }
  }

  /**
   * Calculates and returns a breakdown of spending by category.
   * @param userId - The ID of the user to analyze.
   * @returns A promise that resolves to an object representing the category breakdown.
   */
  async getCategoryBreakdown(userId: string): Promise<CategoryBreakdown> {
    try {
      const receipts = await this.getReceipts(userId);
      const breakdown: CategoryBreakdown = {};

      receipts.forEach((receipt) => {
        if (receipt.ocr_data?.items && Array.isArray(receipt.ocr_data.items)) {
          receipt.ocr_data.items.forEach((item) => {
            const category = item.category || "Uncategorized";
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            breakdown[category] = (breakdown[category] || 0) + itemTotal;
          });
        }
      });

      return breakdown;
    } catch (error) {
      logError(error, "ReceiptRepository.getCategoryBreakdown");
      throw error;
    }
  }

  /**
   * Retrieves weekly spending data for a user over a specified number of weeks.
   * @param userId - The ID of the user to analyze.
   * @param weeks - The number of past weeks to include in the analysis.
   * @returns A promise that resolves to an array of weekly spending data.
   */
  async getWeeklySpending(
    userId: string,
    weeks: number = 4
  ): Promise<WeeklySpendingData[]> {
    try {
      const receipts = await this.getReceipts(userId);
      const weeklyData: WeeklySpendingData[] = [];
      const today = new Date();

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekReceipts = receipts.filter((receipt) => {
          const receiptDate = new Date(receipt.date);
          return receiptDate >= weekStart && receiptDate <= weekEnd;
        });

        const weekSpending = weekReceipts.reduce(
          (sum, receipt) => sum + receipt.total_amount,
          0
        );

        weeklyData.push({
          week:
            weekStart.toISOString().split("T")[0] || weekStart.toDateString(),
          amount: weekSpending,
          receiptCount: weekReceipts.length,
        });
      }

      return weeklyData;
    } catch (error) {
      logError(error, "ReceiptRepository.getWeeklySpending");
      throw error;
    }
  }

  /**
   * Calculates the total amount spent by a user today.
   * @param userId - The ID of the user to analyze.
   * @returns A promise that resolves to the total amount spent today.
   */
  async getTodaySpending(userId: string): Promise<number> {
    try {
      const receipts = await this.getReceipts(userId);
      const today = new Date().toDateString();

      return receipts
        .filter((receipt) => new Date(receipt.date).toDateString() === today)
        .reduce((total, receipt) => total + receipt.total_amount, 0);
    } catch (error) {
      logError(error, "ReceiptRepository.getTodaySpending");
      throw error;
    }
  }
}

export const receiptRepository = new ReceiptRepository();
