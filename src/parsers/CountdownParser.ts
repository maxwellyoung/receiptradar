import {
  IReceiptParser,
  ParsedReceiptData,
  ParsedItem,
} from "./IReceiptParser";
import { STORES } from "./stores";

export class CountdownParser implements IReceiptParser {
  private storeName = STORES.COUNTDOWN;

  async parse(text: string): Promise<ParsedReceiptData | null> {
    const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
    const totalMatch = text.match(/TOTAL\s+\$?(\d+\.\d{2})/i);

    // A simpler regex for items to avoid character class issues.
    // Looks for lines starting with an uppercase letter, followed by characters, and ending in a price.
    const itemsMatch = [
      ...text.matchAll(/^([A-Z][A-Za-z\s.'&-]+?)\s{2,}(\d+\.\d{2})$/gm),
    ];

    const items: ParsedItem[] = itemsMatch
      .map((match) => {
        const name = match[1]?.trim().replace(/\s+/g, " ");
        const priceString = match[2];
        if (name && priceString) {
          const price = parseFloat(priceString);
          if (!isNaN(price)) {
            return { name, price, quantity: 1 };
          }
        }
        return null;
      })
      .filter((item): item is ParsedItem => item !== null);

    // Fallback for user's provided simpler regex if the main one fails
    if (items.length === 0) {
      const simpleItems = [...text.matchAll(/([A-Z\s]+)\s+\$?(\d+\.\d{2})/g)]
        .map(([, name, price]) => {
          if (name && price) {
            return { name: name.trim(), price: parseFloat(price), quantity: 1 };
          }
          return null;
        })
        .filter((item): item is ParsedItem => item !== null);
      items.push(...simpleItems);
    }

    return {
      storeName: this.storeName,
      date: dateMatch?.[0] ?? null,
      total: parseFloat(totalMatch?.[1] ?? "0"),
      items,
    };
  }
}
