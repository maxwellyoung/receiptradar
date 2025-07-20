import { Product, Store, UnitPrice } from "@/types";

export interface ProductMatch {
  product: Product;
  confidence: number;
  matchType: "exact" | "fuzzy" | "barcode" | "manual";
}

export interface UnitPriceInfo {
  price: number;
  unit: string;
  perUnit: number;
  unitType: "weight" | "volume" | "count";
}

export interface ProductAlternative {
  product: Product;
  savings: number;
  reason: string;
}

export class ProductMatchingService {
  private static instance: ProductMatchingService;
  private productDatabase: Map<string, Product[]> = new Map();
  private barcodeMap: Map<string, Product> = new Map();
  private brandAliases: Map<string, string[]> = new Map();
  private unitConversions: Map<string, number> = new Map();

  private constructor() {
    this.initializeBrandAliases();
    this.initializeUnitConversions();
  }

  static getInstance(): ProductMatchingService {
    if (!ProductMatchingService.instance) {
      ProductMatchingService.instance = new ProductMatchingService();
    }
    return ProductMatchingService.instance;
  }

  /**
   * Normalize product name for better matching
   */
  normalizeProductName(name: string): string {
    let normalized = name.toLowerCase().trim();

    // Remove common packaging words
    normalized = normalized.replace(
      /\b(pack|packet|bottle|can|jar|box|bag)\b/g,
      ""
    );

    // Normalize brand names
    normalized = this.normalizeBrandNames(normalized);

    // Standardize units
    normalized = this.standardizeUnits(normalized);

    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, " ").trim();

    return normalized;
  }

  /**
   * Find equivalent products across stores
   */
  findEquivalentProducts(
    product: Product,
    stores: Store[] = []
  ): ProductMatch[] {
    const normalizedName = this.normalizeProductName(product.name);
    const matches: ProductMatch[] = [];

    // First try exact barcode match
    if (product.barcode) {
      const barcodeMatch = this.barcodeMap.get(product.barcode);
      if (barcodeMatch) {
        matches.push({
          product: barcodeMatch,
          confidence: 1.0,
          matchType: "barcode",
        });
      }
    }

    // Try fuzzy name matching
    const fuzzyMatches = this.findFuzzyMatches(normalizedName, stores);
    matches.push(...fuzzyMatches);

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate unit price for a product
   */
  calculateUnitPrice(product: Product): UnitPriceInfo | null {
    if (!product.price || !product.size) {
      return null;
    }

    const unitInfo = this.extractUnitInfo(product.size);
    if (!unitInfo) {
      return null;
    }

    const perUnit = product.price / unitInfo.amount;

    return {
      price: product.price,
      unit: unitInfo.unit,
      perUnit: perUnit,
      unitType: unitInfo.type,
    };
  }

  /**
   * Suggest alternative products
   */
  suggestAlternatives(
    product: Product,
    stores: Store[] = []
  ): ProductAlternative[] {
    const alternatives: ProductAlternative[] = [];
    const unitPrice = this.calculateUnitPrice(product);

    if (!unitPrice) {
      return alternatives;
    }

    // Find similar products
    const similarProducts = this.findSimilarProducts(product, stores);

    for (const similar of similarProducts) {
      const similarUnitPrice = this.calculateUnitPrice(similar);
      if (similarUnitPrice && similarUnitPrice.perUnit < unitPrice.perUnit) {
        const savings =
          (unitPrice.perUnit - similarUnitPrice.perUnit) * unitPrice.perUnit;
        alternatives.push({
          product: similar,
          savings: savings,
          reason: `Better value: ${similarUnitPrice.perUnit.toFixed(2)}/${
            similarUnitPrice.unit
          } vs ${unitPrice.perUnit.toFixed(2)}/${unitPrice.unit}`,
        });
      }
    }

    // Sort by savings
    return alternatives.sort((a, b) => b.savings - a.savings);
  }

  /**
   * Add product to database
   */
  addProduct(product: Product): void {
    const normalizedName = this.normalizeProductName(product.name);

    if (!this.productDatabase.has(normalizedName)) {
      this.productDatabase.set(normalizedName, []);
    }

    this.productDatabase.get(normalizedName)!.push(product);

    if (product.barcode) {
      this.barcodeMap.set(product.barcode, product);
    }
  }

  /**
   * Find best value products in a category
   */
  findBestValueProducts(category: string, stores: Store[] = []): Product[] {
    const products = this.getProductsByCategory(category, stores);
    const productsWithUnitPrice = products
      .map((product) => ({
        product,
        unitPrice: this.calculateUnitPrice(product),
      }))
      .filter((item) => item.unitPrice !== null)
      .sort((a, b) => a.unitPrice!.perUnit - b.unitPrice!.perUnit);

    return productsWithUnitPrice.map((item) => item.product);
  }

  /**
   * Compare products by unit price
   */
  compareByUnitPrice(products: Product[]): Product[] {
    return products
      .map((product) => ({
        product,
        unitPrice: this.calculateUnitPrice(product),
      }))
      .filter((item) => item.unitPrice !== null)
      .sort((a, b) => a.unitPrice!.perUnit - b.unitPrice!.perUnit)
      .map((item) => item.product);
  }

  // Private helper methods

  private initializeBrandAliases(): void {
    this.brandAliases.set("coca-cola", ["coke", "coca cola", "cocacola"]);
    this.brandAliases.set("pepsi", ["pepsi-cola", "pepsi cola"]);
    this.brandAliases.set("cadbury", ["cadburys"]);
    this.brandAliases.set("nestle", ["nestlé"]);
    this.brandAliases.set("kraft", ["kraft heinz"]);
    this.brandAliases.set("unilever", ["unilever nz"]);
    this.brandAliases.set("sanitarium", ["sanitarium nz"]);
    this.brandAliases.set("fonterra", ["anchor", "mainland"]);
    this.brandAliases.set("countdown", ["woolworths", "woolworths nz"]);
    this.brandAliases.set("new world", ["newworld", "new world nz"]);
    this.brandAliases.set("pak n save", ["paknsave", "pak n save nz"]);
  }

  private initializeUnitConversions(): void {
    // Weight conversions
    this.unitConversions.set("kg", 1000);
    this.unitConversions.set("g", 1);
    this.unitConversions.set("lb", 453.592);
    this.unitConversions.set("oz", 28.3495);

    // Volume conversions
    this.unitConversions.set("l", 1000);
    this.unitConversions.set("ml", 1);
    this.unitConversions.set("gal", 3785.41);
    this.unitConversions.set("fl oz", 29.5735);
  }

  private normalizeBrandNames(name: string): string {
    for (const [brand, aliases] of this.brandAliases) {
      for (const alias of aliases) {
        name = name.replace(new RegExp(`\\b${alias}\\b`, "gi"), brand);
      }
    }
    return name;
  }

  private standardizeUnits(name: string): string {
    // Standardize common unit patterns
    name = name.replace(/(\d+)\s*ml/gi, "$1ml");
    name = name.replace(/(\d+)\s*l/gi, "$1l");
    name = name.replace(/(\d+)\s*g/gi, "$1g");
    name = name.replace(/(\d+)\s*kg/gi, "$1kg");
    name = name.replace(/(\d+)\s*pack/gi, "$1pack");
    name = name.replace(/(\d+)\s*count/gi, "$1count");

    return name;
  }

  private findFuzzyMatches(
    normalizedName: string,
    stores: Store[]
  ): ProductMatch[] {
    const matches: ProductMatch[] = [];
    const threshold = 0.7; // Minimum similarity threshold

    for (const [name, products] of this.productDatabase) {
      const similarity = this.calculateSimilarity(normalizedName, name);

      if (similarity >= threshold) {
        for (const product of products) {
          // Filter by stores if specified
          if (
            stores.length === 0 ||
            stores.some((store) => store.id === product.storeId)
          ) {
            matches.push({
              product,
              confidence: similarity,
              matchType: "fuzzy",
            });
          }
        }
      }
    }

    return matches;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private extractUnitInfo(
    size: string
  ): {
    amount: number;
    unit: string;
    type: "weight" | "volume" | "count";
  } | null {
    // Common patterns for size extraction
    const patterns = [
      // Weight patterns
      { regex: /(\d+(?:\.\d+)?)\s*(kg|g|lb|oz)/i, type: "weight" as const },
      // Volume patterns
      { regex: /(\d+(?:\.\d+)?)\s*(l|ml|gal|fl oz)/i, type: "volume" as const },
      // Count patterns
      { regex: /(\d+)\s*(pack|count|piece|item)/i, type: "count" as const },
      // Generic number + unit
      { regex: /(\d+(?:\.\d+)?)\s*(\w+)/i, type: "count" as const },
    ];

    for (const pattern of patterns) {
      const match = size.match(pattern.regex);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          unit: match[2].toLowerCase(),
          type: pattern.type,
        };
      }
    }

    return null;
  }

  private findSimilarProducts(product: Product, stores: Store[]): Product[] {
    const normalizedName = this.normalizeProductName(product.name);
    const words = normalizedName.split(" ");
    const similar: Product[] = [];

    // Find products with similar keywords
    for (const [name, products] of this.productDatabase) {
      const nameWords = name.split(" ");
      const commonWords = words.filter((word) => nameWords.includes(word));

      if (commonWords.length >= Math.min(2, words.length - 1)) {
        for (const p of products) {
          if (
            p.id !== product.id &&
            (stores.length === 0 ||
              stores.some((store) => store.id === p.storeId))
          ) {
            similar.push(p);
          }
        }
      }
    }

    return similar;
  }

  private getProductsByCategory(category: string, stores: Store[]): Product[] {
    // This would typically query a database
    // For now, return empty array as placeholder
    return [];
  }
}

// Export singleton instance
export const productMatchingService = ProductMatchingService.getInstance();
