import {
  IReceiptParser,
  ParsedReceiptData,
  ParsedItem,
} from "./IReceiptParser";
import { STORES } from "./stores";

export class NewWorldParser implements IReceiptParser {
  private storeName = STORES.NEW_WORLD;

  // New World-specific patterns
  private patterns = {
    // New World uses: ITEM NAME     $12.34 format (similar to Countdown but different layout)
    itemPattern: /^([A-Za-z\s&'-]{3,})\s+\$(\d+\.\d{2})$/,
    // Alternative: ITEM NAME     12.34 format (no $)
    itemPatternAlt: /^([A-Za-z\s&'-]{3,})\s+(\d+\.\d{2})$/,
    // Quantity pattern: 2 x ITEM NAME
    quantityPattern: /^(\d+)\s+x\s+(.+)$/,
    // Total patterns - New World often uses different wording
    totalPattern: /TOTAL\s+\$(\d+\.\d{2})/i,
    totalPatternAlt: /AMOUNT\s+DUE\s+\$(\d+\.\d{2})/i,
    subtotalPattern: /SUBTOTAL\s+\$(\d+\.\d{2})/i,
    // Date pattern: DD/MM/YYYY or DD-MM-YYYY
    datePattern: /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    // Receipt number: New World often uses different format
    receiptNumberPattern: /(?:RECEIPT|TXN)\s*#?\s*(\d{6,})/i,
  };

  canParse(receiptText: string): boolean {
    const lines = receiptText.split("\n");

    // Check for New World-specific indicators
    const newWorldIndicators = [
      "new world",
      "nw ",
      "new world supermarket",
      "new world fresh choice",
    ];

    const hasNewWorldIndicator = newWorldIndicators.some((indicator) =>
      receiptText.toLowerCase().includes(indicator)
    );

    // Check for New World's typical layout patterns
    const hasNewWorldLayout = lines.some(
      (line) =>
        this.patterns.itemPattern.test(line) ||
        this.patterns.itemPatternAlt.test(line)
    );

    return hasNewWorldIndicator || hasNewWorldLayout;
  }

  async parse(receiptText: string): Promise<ParsedReceiptData | null> {
    const lines = receiptText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const items: ParsedItem[] = [];
    let total = 0;
    let subtotal = 0;
    let date = "";
    let receiptNumber = "";

    for (const line of lines) {
      // Extract items
      const item = this.extractItem(line);
      if (item) {
        items.push(item);
        continue;
      }

      // Extract totals
      const totalMatch = line.match(this.patterns.totalPattern);
      if (totalMatch) {
        total = parseFloat(totalMatch[1]);
        continue;
      }

      const totalMatchAlt = line.match(this.patterns.totalPatternAlt);
      if (totalMatchAlt) {
        total = parseFloat(totalMatchAlt[1]);
        continue;
      }

      const subtotalMatch = line.match(this.patterns.subtotalPattern);
      if (subtotalMatch) {
        subtotal = parseFloat(subtotalMatch[1]);
        continue;
      }

      // Extract date
      const dateMatch = line.match(this.patterns.datePattern);
      if (dateMatch && !date) {
        const [, day, month, year] = dateMatch;
        date = `${year}-${month}-${day}`;
        continue;
      }

      // Extract receipt number
      const receiptMatch = line.match(this.patterns.receiptNumberPattern);
      if (receiptMatch && !receiptNumber) {
        receiptNumber = receiptMatch[1];
        continue;
      }
    }

    // If no total found, sum items
    if (total === 0 && items.length > 0) {
      total = items.reduce((sum, item) => sum + item.price, 0);
    }

    return {
      storeName: this.storeName,
      date: date || new Date().toISOString().split("T")[0],
      total,
      subtotal: subtotal || total,
      receiptNumber,
      items,
    };
  }

  private extractItem(line: string): ParsedItem | null {
    // Try quantity pattern first
    const quantityMatch = line.match(this.patterns.quantityPattern);
    if (quantityMatch) {
      const quantity = parseInt(quantityMatch[1]);
      const itemText = quantityMatch[2];

      // Extract price from the item text
      const priceMatch = itemText.match(/\$(\d+\.\d{2})/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const name = itemText.replace(/\$\d+\.\d{2}/, "").trim();

        return {
          name,
          price: price / quantity, // Price per unit
          quantity,
          category: this.categorizeItem(name),
          confidence: 0.9,
        };
      }
    }

    // Try standard item pattern
    const itemMatch = line.match(this.patterns.itemPattern);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const price = parseFloat(itemMatch[2]);

      return {
        name,
        price,
        quantity: 1,
        category: this.categorizeItem(name),
        confidence: 0.85,
      };
    }

    // Try alternative pattern (no $ symbol)
    const itemMatchAlt = line.match(this.patterns.itemPatternAlt);
    if (itemMatchAlt) {
      const name = itemMatchAlt[1].trim();
      const price = parseFloat(itemMatchAlt[2]);

      return {
        name,
        price,
        quantity: 1,
        category: this.categorizeItem(name),
        confidence: 0.8,
      };
    }

    return null;
  }

  private categorizeItem(name: string): string {
    const lowerName = name.toLowerCase();

    // New World-specific categories (they often have premium/organic items)
    const categories = {
      "Fresh Produce": [
        "apple",
        "banana",
        "tomato",
        "lettuce",
        "carrot",
        "onion",
        "potato",
        "avocado",
        "cucumber",
        "pepper",
        "broccoli",
        "cauliflower",
        "organic",
        "fresh",
      ],
      Dairy: [
        "milk",
        "cheese",
        "yogurt",
        "butter",
        "cream",
        "yoghurt",
        "cheddar",
        "mozzarella",
        "feta",
        "parmesan",
        "organic milk",
      ],
      Meat: [
        "beef",
        "chicken",
        "pork",
        "lamb",
        "steak",
        "mince",
        "sausage",
        "bacon",
        "ham",
        "turkey",
        "organic meat",
      ],
      Pantry: [
        "bread",
        "pasta",
        "rice",
        "flour",
        "sugar",
        "oil",
        "sauce",
        "soup",
        "cereal",
        "baking",
        "organic",
      ],
      Beverages: [
        "water",
        "juice",
        "soda",
        "beer",
        "wine",
        "coffee",
        "tea",
        "coke",
        "pepsi",
        "sparkling",
        "organic juice",
      ],
      Snacks: [
        "chips",
        "crackers",
        "nuts",
        "chocolate",
        "candy",
        "biscuits",
        "cookies",
        "popcorn",
        "organic snacks",
      ],
      Frozen: [
        "ice cream",
        "frozen",
        "pizza",
        "fries",
        "peas",
        "corn",
        "icecream",
      ],
      Household: [
        "toilet paper",
        "paper towel",
        "soap",
        "detergent",
        "cleaning",
        "tissue",
        "laundry",
      ],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerName.includes(keyword))) {
        return category;
      }
    }

    return "Other";
  }
}
