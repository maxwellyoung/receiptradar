import {
  IReceiptParser,
  ParsedReceiptData,
  ParsedItem,
} from "./IReceiptParser";

export class FreshChoiceParser implements IReceiptParser {
  storeName = "Fresh Choice";
  location = "New Zealand";
  receiptFormat = "STANDARD";
  specialFeatures = ["grocery", "fresh-produce", "regional"];

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

    // Fresh Choice specific parsing logic
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

      // Parse items - Fresh Choice format typically has: Item Name $Price
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
    // Fresh Choice item format examples:
    // "Fresh Bananas $3.99"
    // "Fresh Choice Milk 2L $4.50"
    // "Local Apples $5.99"
    // "Fresh Choice Bread $2.99"

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
      "fresh choice",
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
    const lowerName = itemName.toLowerCase();

    // Fresh produce
    if (
      lowerName.includes("banana") ||
      lowerName.includes("apple") ||
      lowerName.includes("orange") ||
      lowerName.includes("tomato") ||
      lowerName.includes("lettuce") ||
      lowerName.includes("carrot") ||
      lowerName.includes("onion") ||
      lowerName.includes("potato") ||
      lowerName.includes("fresh") ||
      lowerName.includes("local")
    ) {
      return "fresh-produce";
    }

    // Dairy
    if (
      lowerName.includes("milk") ||
      lowerName.includes("cheese") ||
      lowerName.includes("yoghurt") ||
      lowerName.includes("butter") ||
      lowerName.includes("cream") ||
      lowerName.includes("egg")
    ) {
      return "dairy";
    }

    // Meat
    if (
      lowerName.includes("beef") ||
      lowerName.includes("chicken") ||
      lowerName.includes("pork") ||
      lowerName.includes("lamb") ||
      lowerName.includes("fish") ||
      lowerName.includes("salmon")
    ) {
      return "meat";
    }

    // Bread
    if (
      lowerName.includes("bread") ||
      lowerName.includes("roll") ||
      lowerName.includes("bun") ||
      lowerName.includes("toast")
    ) {
      return "bread";
    }

    // Grocery staples
    if (
      lowerName.includes("pasta") ||
      lowerName.includes("rice") ||
      lowerName.includes("cereal") ||
      lowerName.includes("coffee") ||
      lowerName.includes("tea") ||
      lowerName.includes("sugar") ||
      lowerName.includes("flour")
    ) {
      return "grocery";
    }

    // Fresh Choice brand
    if (lowerName.includes("fresh choice")) {
      return "fresh-choice-brand";
    }

    return "general";
  }

  canParse(receiptText: string): boolean {
    const lowerText = receiptText.toLowerCase();

    // Check for Fresh Choice specific identifiers
    const identifiers = ["fresh choice", "freshchoice"];

    return identifiers.some((identifier) => lowerText.includes(identifier));
  }
}
