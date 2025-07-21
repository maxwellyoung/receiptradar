import { IReceiptParser, ParsedReceiptData } from "./IReceiptParser";
import { STORES, STORE_IDENTIFIERS } from "./stores";
import { CountdownParser } from "./CountdownParser";
import { NewWorldParser } from "./NewWorldParser";
import { PaknSaveParser } from "./PaknSaveParser";
import { FourSquareParser } from "./FourSquareParser";
import { MooreWilsonsParser } from "./MooreWilsonsParser";
import { WarehouseParser } from "./WarehouseParser";
import { FreshChoiceParser } from "./FreshChoiceParser";
import { logger } from "@/utils/logger";

export class ParserManager {
  private parsers: IReceiptParser[];

  constructor() {
    this.parsers = [
      new CountdownParser(),
      new NewWorldParser(),
      new PaknSaveParser(),
      new FourSquareParser(),
      new MooreWilsonsParser(),
      new WarehouseParser(),
      new FreshChoiceParser(),
    ];
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
      logger.info("Text does not appear to be a receipt.", {
        component: "ParserManager",
      });
      return null;
    }

    // Try store-specific parsers first
    for (const parser of this.parsers) {
      if (parser.canParse && parser.canParse(text)) {
        logger.info(`Using ${parser.constructor.name} for parsing`, {
          component: "ParserManager",
        });
        const result = await parser.parse(text);
        if (result) {
          return result;
        }
      }
    }

    // Fallback to store name detection
    const storeName = this.getStoreName(text);
    if (storeName) {
      logger.info(`Falling back to store name detection: ${storeName}`, {
        component: "ParserManager",
      });
      // Try to find a parser for this store
      for (const parser of this.parsers) {
        if (
          parser.constructor.name
            .toLowerCase()
            .includes(storeName.toLowerCase().replace(/\s+/g, ""))
        ) {
          const result = await parser.parse(text);
          if (result) {
            return result;
          }
        }
      }
    }

    logger.info("No suitable parser found, using fallback data", {
      component: "ParserManager",
    });
    return this.getFallbackResult();
  }

  private getFallbackResult(): ParsedReceiptData {
    return {
      storeName: "Unknown Store",
      date: new Date().toISOString().split("T")[0],
      total: 0,
      items: [],
    };
  }
}
