import { ReceiptOCRData } from "./ocr";

export interface UserPreferences {
  theme?: "light" | "dark" | "auto";
  notifications?: {
    email?: boolean;
    push?: boolean;
    weekly_summary?: boolean;
    price_alerts?: boolean;
  };
  privacy?: {
    share_analytics?: boolean;
    anonymize_data?: boolean;
  };
}

export interface Database {
  public: {
    Tables: {
      receipts: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          total_amount: number;
          date: string;
          image_url?: string;
          ocr_data?: ReceiptOCRData;
          category_id?: string;
          created_at: string;
          updated_at: string;
          store_id?: string;
          is_verified?: boolean;
          savings_identified?: number;
          cashback_earned?: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          total_amount: number;
          date: string;
          image_url?: string;
          ocr_data?: ReceiptOCRData;
          category_id?: string;
          created_at?: string;
          updated_at?: string;
          store_id?: string;
          is_verified?: boolean;
          savings_identified?: number;
          cashback_earned?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_name?: string;
          total_amount?: number;
          date?: string;
          image_url?: string;
          ocr_data?: ReceiptOCRData;
          category_id?: string;
          created_at?: string;
          updated_at?: string;
          store_id?: string;
          is_verified?: boolean;
          savings_identified?: number;
          cashback_earned?: number;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          is_premium?: boolean;
          premium_expires_at?: string;
          cashback_balance?: number;
          total_savings?: number;
          preferences?: UserPreferences;
          anonymized_id?: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          is_premium?: boolean;
          premium_expires_at?: string;
          cashback_balance?: number;
          total_savings?: number;
          preferences?: UserPreferences;
          anonymized_id?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          is_premium?: boolean;
          premium_expires_at?: string;
          cashback_balance?: number;
          total_savings?: number;
          preferences?: UserPreferences;
          anonymized_id?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          color?: string;
          icon?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          icon?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          icon?: string;
          created_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          location?: string;
          created_at: string;
          chain_name?: string;
          latitude?: number;
          longitude?: number;
          is_active?: boolean;
          price_tracking_enabled?: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string;
          created_at?: string;
          chain_name?: string;
          latitude?: number;
          longitude?: number;
          is_active?: boolean;
          price_tracking_enabled?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          created_at?: string;
          chain_name?: string;
          latitude?: number;
          longitude?: number;
          is_active?: boolean;
          price_tracking_enabled?: boolean;
        };
      };
      items: {
        Row: {
          id: string;
          receipt_id: string;
          name: string;
          price: number;
          quantity: number;
          category_id?: string;
          created_at: string;
          unit_price?: number;
          brand?: string;
          sku?: string;
          confidence_score?: number;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          name: string;
          price: number;
          quantity: number;
          category_id?: string;
          created_at?: string;
          unit_price?: number;
          brand?: string;
          sku?: string;
          confidence_score?: number;
        };
        Update: {
          id?: string;
          receipt_id?: string;
          name?: string;
          price?: number;
          quantity?: number;
          category_id?: string;
          created_at?: string;
          unit_price?: number;
          brand?: string;
          sku?: string;
          confidence_score?: number;
        };
      };
    };
    Views: {
      user_savings_summary: {
        Row: {
          id: string;
          email: string;
          receipt_count: number;
          total_spent: number;
          total_savings: number;
          total_cashback: number;
          avg_receipt_value: number;
        };
      };
      store_price_competition: {
        Row: {
          store_name: string;
          item_name: string;
          avg_price: number;
          min_price: number;
          max_price: number;
          price_points: number;
          date: string;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type aliases for easier use
export type Receipt = Database["public"]["Tables"]["receipts"]["Row"];
export type ReceiptInsert = Database["public"]["Tables"]["receipts"]["Insert"];
export type ReceiptUpdate = Database["public"]["Tables"]["receipts"]["Update"];

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type StoreInsert = Database["public"]["Tables"]["stores"]["Insert"];
export type StoreUpdate = Database["public"]["Tables"]["stores"]["Update"];

export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
export type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];

// View types
export type UserSavingsSummary =
  Database["public"]["Views"]["user_savings_summary"]["Row"];
export type StorePriceCompetition =
  Database["public"]["Views"]["store_price_competition"]["Row"];
