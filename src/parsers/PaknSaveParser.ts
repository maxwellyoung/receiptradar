import { IReceiptParser, ParsedReceiptData } from "./IReceiptParser";
import { STORES } from "./stores";

export class PaknSaveParser implements IReceiptParser {
  private storeName = STORES.PAKNSAVE;

  async parse(text: string): Promise<ParsedReceiptData | null> {
    console.log(
      `Parsing with PaknSaveParser (not implemented) for text: ${text.substring(
        0,
        100
      )}...`
    );
    // Placeholder implementation
    return Promise.resolve(null);
  }
}
