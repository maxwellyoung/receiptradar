import { IReceiptParser, ParsedReceiptData } from "./IReceiptParser";
import { STORES } from "./stores";

export class FourSquareParser implements IReceiptParser {
  private storeName = STORES.FOUR_SQUARE;

  async parse(text: string): Promise<ParsedReceiptData | null> {
    console.log(
      `Parsing with FourSquareParser (not implemented) for text: ${text.substring(
        0,
        100
      )}...`
    );
    // Placeholder implementation
    return Promise.resolve(null);
  }
}
