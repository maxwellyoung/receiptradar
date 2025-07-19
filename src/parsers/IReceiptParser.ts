export interface ParsedItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ParsedReceiptData {
  storeName: string;
  date: string | null;
  total: number;
  items: ParsedItem[];
}

export interface IReceiptParser {
  parse(text: string): Promise<ParsedReceiptData | null>;
}
