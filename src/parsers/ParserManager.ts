import { IReceiptParser, ParsedReceiptData } from "./IReceiptParser";
import { STORES, STORE_IDENTIFIERS } from "./stores";
import { CountdownParser } from "./CountdownParser";
import { NewWorldParser } from "./NewWorldParser";
import { PaknSaveParser } from "./PaknSaveParser";
import { FourSquareParser } from "./FourSquareParser";

export class ParserManager {
  private parsers: { [key: string]: IReceiptParser };

  constructor() {
    this.parsers = {
      [STORES.COUNTDOWN]: new CountdownParser(),
      [STORES.NEW_WORLD]: new NewWorldParser(),
      [STORES.PAKNSAVE]: new PaknSaveParser(),
      [STORES.FOUR_SQUARE]: new FourSquareParser(),
    };
  }

  isReceipt(text: string): boolean {
    const hasMoney = /\$\d{1,3}(,?\d{3})*(\.\d{2})?/.test(text);
    const hasDate = /\b\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})\b/.test(text);
    const hasStore = Object.values(STORE_IDENTIFIERS).some((regex) =>
      regex.test(text)
    );
    return hasMoney && hasDate && hasStore;
  }

  getStoreName(text: string): string | null {
    for (const [storeName, identifier] of Object.entries(STORE_IDENTIFIERS)) {
      if (identifier.test(text)) {
        return storeName;
      }
    }
    return null;
  }

  async parse(text: string): Promise<ParsedReceiptData | null> {
    if (!this.isReceipt(text)) {
      // Here the worm can say "This is not a receipt. This is chaos."
      console.log("Text does not appear to be a receipt.");
      return null;
    }

    const storeName = this.getStoreName(text);
    if (storeName && this.parsers[storeName]) {
      const parser = this.parsers[storeName];
      return parser.parse(text);
    }

    console.log(`No parser found for store: ${storeName}`);
    // Potentially try a generic parser here in the future
    return null;
  }
}
