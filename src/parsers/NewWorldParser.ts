import { IReceiptParser, ParsedReceiptData } from "./IReceiptParser";
import { STORES } from "./stores";

export class NewWorldParser implements IReceiptParser {
  private storeName = STORES.NEW_WORLD;

  async parse(text: string): Promise<ParsedReceiptData | null> {
    console.log(
      `Parsing with NewWorldParser (not implemented) for text: ${text.substring(
        0,
        100
      )}...`
    );
    // Placeholder implementation
    return Promise.resolve(null);
  }
}
