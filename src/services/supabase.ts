// Import polyfills first to ensure compatibility, especially for structuredClone.
import "@/utils/polyfills";

import { createClient, Session, AuthChangeEvent } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPABASE_CONFIG } from "@/constants/supabase";
import { ReceiptOCRData } from "@/types/ocr";
import { handleAsyncError, logError } from "@/utils/error-handler";

import { logger } from "@/utils/logger";

// Create Supabase client
logger.database("Creating Supabase client", "init");
logger.debug("Supabase URL configured", { url: SUPABASE_CONFIG.url });

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

logger.database("Supabase client created successfully", "init");

// Auth service
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Provide more descriptive error messages
    if (error) {
      let userFriendlyMessage = error.message;

      if (error.message.includes("Invalid login credentials")) {
        userFriendlyMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes("Email not confirmed")) {
        userFriendlyMessage =
          "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes("Too many requests")) {
        userFriendlyMessage =
          "Too many login attempts. Please wait a few minutes before trying again.";
      } else if (error.message.includes("User not found")) {
        userFriendlyMessage =
          "No account found with this email address. Please check your email or create a new account.";
      }

      return {
        data,
        error: { ...error, message: userFriendlyMessage } as typeof error,
      };
    }

    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: __DEV__
        ? "receiptradar://reset-password"
        : "https://expo.dev/accounts/maxwellyoung/projects/receipt-worm",
    });
    return { data, error };
  },

  async updateUser(updates: { name?: string; password?: string }) {
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth state changes
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database service
export const dbService = {
  // Receipts
  async createReceipt(receiptData: {
    user_id: string;
    store_name: string;
    total_amount: number;
    date: string;
    image_url?: string;
    ocr_data?: ReceiptOCRData;
    savings_identified?: number;
    cashback_earned?: number;
  }) {
    const { data, error } = await supabase
      .from("receipts")
      .insert([receiptData])
      .select()
      .single();
    return { data, error };
  },

  async getReceipts(userId: string, searchTerm?: string, limit = 50) {
    if (searchTerm && searchTerm.length > 0) {
      const { data, error } = await supabase.rpc("search_receipts", {
        user_id_param: userId,
        search_term_param: searchTerm,
      });
      return { data, error };
    }

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getReceiptById(id: string) {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async updateReceipt(
    id: string,
    updates: Partial<{
      store_name?: string;
      total_amount?: number;
      date?: string;
      image_url?: string;
      ocr_data?: ReceiptOCRData;
      savings_identified?: number;
      cashback_earned?: number;
      is_verified?: boolean;
    }>
  ) {
    const { data, error } = await supabase
      .from("receipts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async deleteReceipt(id: string) {
    const { error } = await supabase.from("receipts").delete().eq("id", id);
    return { error };
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    return { data, error };
  },

  async createCategory(categoryData: {
    name: string;
    color?: string;
    icon?: string;
  }) {
    const { data, error } = await supabase
      .from("categories")
      .insert([categoryData])
      .select()
      .single();
    return { data, error };
  },

  // Seed default categories
  async seedCategories() {
    const defaultCategories = [
      { name: "Fresh Produce", color: "#4CAF50", icon: "local-florist" },
      { name: "Dairy", color: "#2196F3", icon: "local-drink" },
      { name: "Meat", color: "#F44336", icon: "restaurant" },
      { name: "Pantry", color: "#FF9800", icon: "kitchen" },
      { name: "Beverages", color: "#9C27B0", icon: "local-cafe" },
      { name: "Snacks", color: "#795548", icon: "cake" },
      { name: "Frozen", color: "#00BCD4", icon: "ac-unit" },
      { name: "Household", color: "#607D8B", icon: "home" },
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  },

  // Stores
  async getStores() {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("name");
    return { data, error };
  },

  async createStore(storeData: { name: string; location?: string }) {
    const { data, error } = await supabase
      .from("stores")
      .insert([storeData])
      .select()
      .single();
    return { data, error };
  },

  // Seed default stores
  async seedStores() {
    const defaultStores = [
      { name: "Countdown", location: "Auckland" },
      { name: "New World", location: "Auckland" },
      { name: "Pak'nSave", location: "Auckland" },
      { name: "Four Square", location: "Auckland" },
      { name: "Fresh Choice", location: "Auckland" },
      { name: "Super Value", location: "Auckland" },
    ];

    for (const store of defaultStores) {
      await this.createStore(store);
    }
  },

  // Analytics
  async getSpendingByMonth(userId: string, year: number) {
    const { data, error } = await supabase
      .from("receipts")
      .select("total_amount, date")
      .eq("user_id", userId)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);
    return { data, error };
  },

  async getSpendingByCategory(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const { data, error } = await supabase
      .from("receipts")
      .select("total_amount, category_id")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate);
    return { data, error };
  },

  // Get user savings summary from view
  async getUserSavingsSummary(userId: string) {
    const { data, error } = await supabase
      .from("user_savings_summary")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  // Get store price competition data
  async getStorePriceCompetition(itemName?: string) {
    let query = supabase.from("store_price_competition").select("*");

    if (itemName) {
      query = query.ilike("item_name", `%${itemName}%`);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Initialize database with sample data
  async initializeDatabase() {
    try {
      // Seed categories
      await this.seedCategories();

      // Seed stores
      await this.seedStores();

      return { success: true };
    } catch (error) {
      console.error("Error initializing database:", error);
      return { success: false, error };
    }
  },
};

// Storage service for images
export const storageService = {
  async uploadReceiptImage(
    imageUri: string,
    fileName: string,
    userId: string
  ): Promise<{ data: any; error: any }> {
    try {
      logger.info("Uploading receipt image", { fileName, userId });

      // Create file path
      const timestamp = Date.now();
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `receipts/${userId}/${timestamp}_${cleanFileName}`;

      // For React Native, we need to handle the image URI differently
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("receipt-images")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        logger.error("Image upload failed", { error: error.message, filePath });
        return { data: null, error };
      }

      logger.info("Image uploaded successfully", { filePath });
      return { data, error: null };
    } catch (error) {
      logger.error("Image upload error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { data: null, error: error as any };
    }
  },

  async getReceiptImageUrl(filePath: string) {
    try {
      const { data } = supabase.storage
        .from("receipt-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      logger.error("Failed to get image URL", { error, filePath });
      return null;
    }
  },

  async deleteReceiptImage(filePath: string) {
    try {
      const { error } = await supabase.storage
        .from("receipt-images")
        .remove([filePath]);

      if (error) {
        logger.error("Failed to delete image", { error, filePath });
      }

      return { error };
    } catch (error) {
      logger.error("Image deletion error", { error });
      return { error: error as Error };
    }
  },

  // Helper to extract file path from full URL
  getFilePathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split("/");
      const bucketIndex = urlParts.findIndex(
        (part) => part === "receipt-images"
      );
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        return urlParts.slice(bucketIndex + 1).join("/");
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Compress image before upload (optional optimization)
  async compressImage(
    imageUri: string,
    quality: number = 0.8
  ): Promise<string> {
    try {
      // This would require expo-image-manipulator
      // For now, return the original URI
      return imageUri;
    } catch (error) {
      logger.warn("Image compression failed, using original", { error });
      return imageUri;
    }
  },
};
