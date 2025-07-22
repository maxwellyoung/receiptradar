import {
  IReceiptParser,
  ParsedReceiptData,
  ParsedItem,
} from "./IReceiptParser";

export class WarehouseParser implements IReceiptParser {
  storeName = "The Warehouse";
  location = "New Zealand";
  receiptFormat = "STANDARD";
  specialFeatures = ["general-merchandise", "grocery", "budget"];

  async parse(receiptText: string): Promise<ParsedReceiptData | null> {
    const lines = receiptText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const items: ParsedItem[] = [];
    let total = 0;
    let storeName = this.storeName;
    let date: string | null = new Date().toISOString();
    let receiptNumber: string | undefined;

    // The Warehouse specific parsing logic
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract receipt number
      if (
        line.includes("RECEIPT") ||
        line.includes("TXN") ||
        line.includes("TRANS")
      ) {
        const match = line.match(/(?:RECEIPT|TXN|TRANS)\s*#?\s*(\w+)/i);
        if (match) {
          receiptNumber = match[1];
        }
      }

      // Extract date
      if (
        line.includes("/") &&
        (line.includes("2024") || line.includes("2023"))
      ) {
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split("/");
          date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          ).toISOString();
        }
      }

      // Extract total amount
      if (
        line.includes("TOTAL") ||
        line.includes("AMOUNT DUE") ||
        line.includes("BALANCE")
      ) {
        const totalMatch = line.match(/\$?(\d+\.\d{2})/);
        if (totalMatch) {
          total = parseFloat(totalMatch[1]);
        }
      }

      // Parse items - The Warehouse format typically has: Item Name $Price
      // or Item Name @ $UnitPrice $TotalPrice
      const itemMatch = this.parseItemLine(line);
      if (itemMatch) {
        items.push(itemMatch);
      }
    }

    return {
      storeName,
      date,
      receiptNumber,
      total,
      items,
    };
  }

  private parseItemLine(line: string): ParsedItem | null {
    // The Warehouse item format examples:
    // "Pams Milk 2L $3.99"
    // "Warehouse Brand Pasta 500g $1.50"
    // "Fresh Bread $2.99"
    // "Toilet Paper 6pk $4.99"

    // Skip lines that are clearly not items
    if (this.isNonItemLine(line)) {
      return null;
    }

    // Try to match item with price at the end
    const priceMatch = line.match(/\$(\d+\.\d{2})$/);
    if (!priceMatch) {
      return null;
    }

    const price = parseFloat(priceMatch[1]);
    const itemName = line.replace(/\$(\d+\.\d{2})$/, "").trim();

    // Skip if item name is too short or looks like a total/subtotal
    if (itemName.length < 2 || this.isTotalLine(itemName)) {
      return null;
    }

    // Extract quantity and unit price if present
    let quantity = 1;
    let unitPrice = price;

    const quantityMatch = itemName.match(
      /(\d+(?:\.\d+)?)\s*(?:pk|pack|kg|g|ml|l|ea|each)\s*@\s*\$(\d+\.\d{2})/i
    );
    if (quantityMatch) {
      quantity = parseFloat(quantityMatch[1]);
      unitPrice = parseFloat(quantityMatch[2]);
    }

    // Clean up item name
    const cleanName = itemName
      .replace(
        /(\d+(?:\.\d+)?)\s*(?:pk|pack|kg|g|ml|l|ea|each)\s*@\s*\$(\d+\.\d{2})/i,
        ""
      )
      .trim();

    return {
      name: cleanName,
      price,
      quantity,
      category: this.categorizeItem(cleanName),
    };
  }

  private isNonItemLine(line: string): boolean {
    const nonItemKeywords = [
      "total",
      "subtotal",
      "tax",
      "gst",
      "receipt",
      "thank",
      "change",
      "cash",
      "card",
      "debit",
      "credit",
      "eftpos",
      "balance",
      "amount",
      "due",
      "warehouse",
      "ltd",
      "limited",
      "company",
      "store",
      "branch",
    ];

    const lowerLine = line.toLowerCase();
    return nonItemKeywords.some((keyword) => lowerLine.includes(keyword));
  }

  private isTotalLine(itemName: string): boolean {
    const totalKeywords = [
      "total",
      "subtotal",
      "tax",
      "gst",
      "amount",
      "due",
      "balance",
    ];
    const lowerName = itemName.toLowerCase();
    return totalKeywords.some((keyword) => lowerName.includes(keyword));
  }

  private categorizeItem(itemName: string): string {
    // Use the new comprehensive categorization system
    const { categorizeProduct } = require("@/constants/productCategories");
    const category = categorizeProduct(itemName);
    return category.id;
  }

  canParse(receiptText: string): boolean {
    const lowerText = receiptText.toLowerCase();

    // Check for The Warehouse specific identifiers
    const identifiers = [
      "warehouse",
      "the warehouse",
      "warehouse brand",
      "pams",
    ];

    return identifiers.some((identifier) => lowerText.includes(identifier));
  }
}
