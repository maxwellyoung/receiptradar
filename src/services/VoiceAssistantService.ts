import { Product, Store } from "@/types";
import { productMatchingService } from "./ProductMatchingService";

export interface VoiceCommand {
  type: "price_check" | "list_management" | "deal_search" | "store_comparison";
  query: string;
  confidence: number;
  entities: {
    product?: string;
    store?: string;
    action?: string;
    quantity?: number;
  };
}

export interface VoiceResponse {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
}

export class VoiceAssistantService {
  private static instance: VoiceAssistantService;
  private commandPatterns: Map<string, RegExp> = new Map();
  private storeAliases: Map<string, string> = new Map();

  private constructor() {
    this.initializeCommandPatterns();
    this.initializeStoreAliases();
  }

  static getInstance(): VoiceAssistantService {
    if (!VoiceAssistantService.instance) {
      VoiceAssistantService.instance = new VoiceAssistantService();
    }
    return VoiceAssistantService.instance;
  }

  /**
   * Process voice command and return response
   */
  async processCommand(command: string): Promise<VoiceResponse> {
    const normalizedCommand = command.toLowerCase().trim();
    const parsedCommand = this.parseCommand(normalizedCommand);

    if (!parsedCommand) {
      return {
        success: false,
        message:
          "I didn't understand that command. Try asking about prices or your shopping list.",
        suggestions: [
          "Where is the cheapest milk today?",
          "What's the price of bread at Countdown?",
          "Add milk to my shopping list",
          "Show me deals on vegetables",
        ],
      };
    }

    try {
      switch (parsedCommand.type) {
        case "price_check":
          return await this.handlePriceCheck(parsedCommand);
        case "list_management":
          return await this.handleListManagement(parsedCommand);
        case "deal_search":
          return await this.handleDealSearch(parsedCommand);
        case "store_comparison":
          return await this.handleStoreComparison(parsedCommand);
        default:
          return {
            success: false,
            message: "I'm not sure how to help with that yet.",
            suggestions: ["Try asking about prices or your shopping list"],
          };
      }
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I encountered an error. Please try again.",
        suggestions: ["Check your internet connection and try again"],
      };
    }
  }

  /**
   * Add item to shopping list via voice
   */
  addToShoppingList(item: string, quantity: number = 1): VoiceResponse {
    // This would integrate with the shopping list service
    const normalizedItem = this.normalizeProductName(item);

    return {
      success: true,
      message: `Added ${quantity} ${normalizedItem} to your shopping list.`,
      data: {
        item: normalizedItem,
        quantity: quantity,
        added: true,
      },
    };
  }

  /**
   * Check price of item via voice
   */
  async checkPrice(item: string, store?: string): Promise<VoiceResponse> {
    const normalizedItem = this.normalizeProductName(item);

    // Create a search product
    const searchProduct: Product = {
      id: "voice-search",
      name: normalizedItem,
      price: 0,
      storeId: store || "",
      created_at: new Date().toISOString(),
    };

    const matches =
      productMatchingService.findEquivalentProducts(searchProduct);

    if (matches.length === 0) {
      return {
        success: false,
        message: `I couldn't find ${normalizedItem} in our database.`,
        suggestions: [
          "Try a different product name",
          "Check the spelling",
          "Try a more generic term",
        ],
      };
    }

    const bestMatch = matches[0];
    const unitPrice = productMatchingService.calculateUnitPrice(
      bestMatch.product
    );

    let priceMessage = `${
      bestMatch.product.name
    } costs $${bestMatch.product.price.toFixed(2)}`;
    if (unitPrice) {
      priceMessage += ` (${unitPrice.perUnit.toFixed(2)} per ${
        unitPrice.unit
      })`;
    }
    priceMessage += ` at ${this.formatStoreName(bestMatch.product.storeId)}.`;

    if (matches.length > 1) {
      priceMessage += ` I found ${matches.length} similar products.`;
    }

    return {
      success: true,
      message: priceMessage,
      data: {
        product: bestMatch.product,
        matches: matches,
        unitPrice: unitPrice,
      },
      suggestions: [
        "Show me alternatives",
        "Compare prices across stores",
        "Add to shopping list",
      ],
    };
  }

  /**
   * Get shopping list via voice
   */
  getShoppingList(): VoiceResponse {
    // This would integrate with the actual shopping list service
    const mockList = [
      { item: "Milk", quantity: 2 },
      { item: "Bread", quantity: 1 },
      { item: "Eggs", quantity: 12 },
    ];

    if (mockList.length === 0) {
      return {
        success: true,
        message: "Your shopping list is empty.",
        suggestions: ["Add some items to get started"],
      };
    }

    const listText = mockList
      .map((item) => `${item.quantity} ${item.item}`)
      .join(", ");

    return {
      success: true,
      message: `Your shopping list has: ${listText}.`,
      data: {
        items: mockList,
        totalItems: mockList.length,
      },
      suggestions: [
        "Add more items",
        "Check prices for these items",
        "Find the best store for your list",
      ],
    };
  }

  /**
   * Search for deals via voice
   */
  async searchDeals(category: string): Promise<VoiceResponse> {
    // This would integrate with the deals service
    const mockDeals = [
      { product: "Fresh Vegetables", discount: "20% off", store: "Countdown" },
      { product: "Dairy Products", discount: "15% off", store: "New World" },
      { product: "Bakery Items", discount: "30% off", store: "Pak'nSave" },
    ];

    return {
      success: true,
      message: `I found ${
        mockDeals.length
      } great deals on ${category}: ${mockDeals
        .map((deal) => `${deal.product} ${deal.discount} at ${deal.store}`)
        .join(", ")}.`,
      data: {
        deals: mockDeals,
        category: category,
      },
      suggestions: [
        "Show me more details",
        "Add these to my shopping list",
        "Find similar deals",
      ],
    };
  }

  // Private helper methods

  private initializeCommandPatterns(): void {
    // Price check patterns
    this.commandPatterns.set(
      "price_check",
      /(?:what'?s?|how much|price|cost).*(?:of|for)\s+(.+?)(?:\s+at\s+(.+?))?\s*$/i
    );
    this.commandPatterns.set(
      "price_check_alt",
      /(?:where|which).*(?:cheapest|cheaper).*(.+?)(?:\s+today)?\s*$/i
    );

    // List management patterns
    this.commandPatterns.set(
      "add_to_list",
      /(?:add|put).*(.+?)(?:\s+to\s+(?:my\s+)?(?:shopping\s+)?list)/i
    );
    this.commandPatterns.set(
      "remove_from_list",
      /(?:remove|delete).*(.+?)(?:\s+from\s+(?:my\s+)?(?:shopping\s+)?list)/i
    );
    this.commandPatterns.set(
      "show_list",
      /(?:show|what'?s?|tell me).*(?:my\s+)?(?:shopping\s+)?list/i
    );

    // Deal search patterns
    this.commandPatterns.set(
      "deal_search",
      /(?:show|find|look for).*(?:deals|sales|offers).*(?:on|for)\s+(.+?)\s*$/i
    );
    this.commandPatterns.set(
      "deal_search_alt",
      /(?:any|are there).*(?:deals|sales).*(?:on|for)\s+(.+?)\s*$/i
    );

    // Store comparison patterns
    this.commandPatterns.set(
      "store_comparison",
      /(?:compare|which).*(?:store|shop).*(?:cheaper|better|cheapest).*(?:for|to buy)\s+(.+?)\s*$/i
    );
  }

  private initializeStoreAliases(): void {
    this.storeAliases.set("countdown", "countdown");
    this.storeAliases.set("new world", "new-world");
    this.storeAliases.set("pak n save", "pak-n-save");
    this.storeAliases.set("paknsave", "pak-n-save");
    this.storeAliases.set("woolworths", "countdown");
    this.storeAliases.set("supermarket", "");
  }

  private parseCommand(command: string): VoiceCommand | null {
    for (const [type, pattern] of this.commandPatterns) {
      const match = command.match(pattern);
      if (match) {
        return this.extractEntities(type, match, command);
      }
    }
    return null;
  }

  private extractEntities(
    type: string,
    match: RegExpMatchArray,
    originalCommand: string
  ): VoiceCommand {
    const entities: any = {};

    switch (type) {
      case "price_check":
        entities.product = match[1]?.trim();
        entities.store = this.normalizeStoreName(match[2]?.trim());
        break;
      case "price_check_alt":
        entities.product = match[1]?.trim();
        break;
      case "add_to_list":
        entities.product = match[1]?.trim();
        entities.action = "add";
        break;
      case "remove_from_list":
        entities.product = match[1]?.trim();
        entities.action = "remove";
        break;
      case "show_list":
        entities.action = "show";
        break;
      case "deal_search":
      case "deal_search_alt":
        entities.product = match[1]?.trim();
        break;
      case "store_comparison":
        entities.product = match[1]?.trim();
        break;
    }

    return {
      type: this.mapType(type),
      query: originalCommand,
      confidence: 0.9,
      entities,
    };
  }

  private mapType(patternType: string): VoiceCommand["type"] {
    if (patternType.startsWith("price_check")) return "price_check";
    if (
      patternType.startsWith("add_to_list") ||
      patternType.startsWith("remove_from_list") ||
      patternType.startsWith("show_list")
    )
      return "list_management";
    if (patternType.startsWith("deal_search")) return "deal_search";
    if (patternType.startsWith("store_comparison")) return "store_comparison";
    return "price_check";
  }

  private async handlePriceCheck(
    command: VoiceCommand
  ): Promise<VoiceResponse> {
    if (!command.entities.product) {
      return {
        success: false,
        message: "What product would you like me to check the price for?",
        suggestions: ["Milk", "Bread", "Eggs", "Bananas"],
      };
    }

    return await this.checkPrice(
      command.entities.product,
      command.entities.store
    );
  }

  private async handleListManagement(
    command: VoiceCommand
  ): Promise<VoiceResponse> {
    if (command.entities.action === "show") {
      return this.getShoppingList();
    }

    if (!command.entities.product) {
      return {
        success: false,
        message: "What would you like me to add to your shopping list?",
        suggestions: ["Milk", "Bread", "Eggs", "Bananas"],
      };
    }

    if (command.entities.action === "add") {
      return this.addToShoppingList(
        command.entities.product,
        command.entities.quantity || 1
      );
    }

    if (command.entities.action === "remove") {
      return {
        success: true,
        message: `Removed ${command.entities.product} from your shopping list.`,
        data: { removed: true, item: command.entities.product },
      };
    }

    return {
      success: false,
      message: "I'm not sure what you'd like me to do with your shopping list.",
      suggestions: ["Add items", "Remove items", "Show my list"],
    };
  }

  private async handleDealSearch(
    command: VoiceCommand
  ): Promise<VoiceResponse> {
    if (!command.entities.product) {
      return {
        success: false,
        message: "What category would you like me to search for deals in?",
        suggestions: ["Vegetables", "Dairy", "Bakery", "Meat"],
      };
    }

    return await this.searchDeals(command.entities.product);
  }

  private async handleStoreComparison(
    command: VoiceCommand
  ): Promise<VoiceResponse> {
    if (!command.entities.product) {
      return {
        success: false,
        message: "What product would you like me to compare across stores?",
        suggestions: ["Milk", "Bread", "Eggs", "Bananas"],
      };
    }

    const searchProduct: Product = {
      id: "voice-comparison",
      name: command.entities.product,
      price: 0,
      storeId: "",
      created_at: new Date().toISOString(),
    };

    const matches =
      productMatchingService.findEquivalentProducts(searchProduct);

    if (matches.length === 0) {
      return {
        success: false,
        message: `I couldn't find ${command.entities.product} to compare across stores.`,
        suggestions: ["Try a different product name", "Check the spelling"],
      };
    }

    const sortedMatches = matches.sort(
      (a, b) => a.product.price - b.product.price
    );
    const cheapest = sortedMatches[0];
    const mostExpensive = sortedMatches[sortedMatches.length - 1];
    const savings = mostExpensive.product.price - cheapest.product.price;

    let message = `For ${command.entities.product}, ${this.formatStoreName(
      cheapest.product.storeId
    )} has the best price at $${cheapest.product.price.toFixed(2)}.`;

    if (savings > 0) {
      message += ` You can save $${savings.toFixed(
        2
      )} compared to ${this.formatStoreName(mostExpensive.product.storeId)}.`;
    }

    return {
      success: true,
      message: message,
      data: {
        matches: sortedMatches,
        cheapest: cheapest,
        savings: savings,
      },
      suggestions: [
        "Show me all prices",
        "Add to shopping list",
        "Find similar products",
      ],
    };
  }

  private normalizeProductName(name: string): string {
    return name.toLowerCase().trim();
  }

  private normalizeStoreName(name: string): string {
    if (!name) return "";
    const normalized = name.toLowerCase().trim();
    return this.storeAliases.get(normalized) || normalized;
  }

  private formatStoreName(storeId: string): string {
    return storeId.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

// Export singleton instance
export const voiceAssistantService = VoiceAssistantService.getInstance();
