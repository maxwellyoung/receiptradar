export interface User {
  id: string;
  email: string;
  pro_until?: string;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  chain: string;
  lat: number;
  lon: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  size?: string;
  barcode?: string;
  storeId: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  created_at: string;
}

export interface UnitPrice {
  price: number;
  unit: string;
  perUnit: number;
  unitType: "weight" | "volume" | "count";
}

export interface Receipt {
  id: string;
  user_id: string;
  store_id: string;
  ts: string;
  total: number;
  raw_url: string;
  created_at: string;
  store?: Store;
}

export interface Item {
  id: string;
  receipt_id: string;
  name: string;
  canonical_sku: string;
  category: string;
  qty: number;
  price: number;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  weekly_cap: number;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  canonical_sku: string;
  ts: string;
  price: number;
  store_id: string;
  created_at: string;
}

export interface SpendData {
  date: string;
  total: number;
  categoryBreakdown: Record<string, number>;
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
}

export interface StoreSavings {
  store: Store;
  potentialSavings: number;
  alternativeItems: Item[];
}

export interface OCRResult {
  text: string;
  bbox: [number, number, number, number];
  confidence: number;
}

export interface ParsedReceipt {
  items: Item[];
  total: number;
  store: Store;
  timestamp: string;
}

export type TabParamList = {
  index: undefined;
  camera: undefined;
  trends: undefined;
  settings: undefined;
};

export type RootStackParamList = {
  "(tabs)": undefined;
  camera: undefined;
  "receipt/[id]": { id: string };
  settings: undefined;
};
