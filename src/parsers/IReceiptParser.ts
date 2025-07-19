export interface ParsedItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
  confidence?: number;
}

export interface ParsedReceiptData {
  storeName: string;
  date: string | null;
  total: number;
  subtotal?: number;
  receiptNumber?: string;
  items: ParsedItem[];
}

export interface IReceiptParser {
  canParse?(receiptText: string): boolean;
  parse(text: string): Promise<ParsedReceiptData | null>;
}
