import {
  categorizeProduct,
  ProductCategory,
} from "@/constants/productCategories";
import { supabase } from "./supabase";

// Enhanced product image service with multiple sources and fallbacks
export class ProductImageService {
  // Primary image sources (high quality, reliable)
  private static readonly PRIMARY_IMAGES = {
    // Dairy Products
    milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
    cheese:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop&q=80",
    butter:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop&q=80",
    yoghurt:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop&q=80",
    eggs: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=300&h=300&fit=crop&q=80",

    // Fresh Produce
    banana:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&h=300&fit=crop&q=80",
    apple:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&q=80",
    tomato:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop&q=80",
    lettuce:
      "https://images.unsplash.com/photo-1622205313162-be1d5716a43b?w=300&h=300&fit=crop&q=80",
    carrot:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&q=80",
    onion:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&q=80",
    potato:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&q=80",
    avocado:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop&q=80",
    cucumber:
      "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=300&fit=crop&q=80",
    pepper:
      "https://images.unsplash.com/photo-1525607551316-5a9eeaab95ba?w=300&h=300&fit=crop&q=80",

    // Meat & Fish
    beef: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    chicken:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    fish: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    salmon:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    pork: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",

    // Bread & Bakery
    bread:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&q=80",
    croissant:
      "https://images.unsplash.com/photo-1555507036-ab794f4ade2a?w=300&h=300&fit=crop&q=80",
    muffin:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&q=80",
    cookie:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop&q=80",

    // Pantry Items
    pasta:
      "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=300&fit=crop&q=80",
    rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&q=80",
    cereal:
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=300&fit=crop&q=80",
    flour:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop&q=80",
    sugar:
      "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=300&h=300&fit=crop&q=80",

    // Beverages
    coffee:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop&q=80",
    tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&q=80",
    juice:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop&q=80",
    water:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop&q=80",
    beer: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",
    wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",

    // Snacks
    chips:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop&q=80",
    chocolate:
      "https://images.unsplash.com/photo-1548907040-4baa419d4274?w=300&h=300&fit=crop&q=80",
    nuts: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=300&fit=crop&q=80",
    popcorn:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&q=80",

    // Household
    "toilet-paper":
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&q=80",
    detergent:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    soap: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    shampoo:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    toothpaste:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",

    // Frozen
    "ice-cream":
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&q=80",
    pizza:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop&q=80",
    fries:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&q=80",
  };

  // Alternative image sources (Pexels)
  private static readonly ALTERNATIVE_IMAGES = {
    milk: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=300&h=300&fit=crop&q=80",
    bread:
      "https://images.pexels.com/photos/144569/pexels-photo-144569.jpeg?w=300&h=300&fit=crop&q=80",
    apple:
      "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?w=300&h=300&fit=crop&q=80",
    banana:
      "https://images.pexels.com/photos/47305/bananas-banana-yellow-fruit-47305.jpeg?w=300&h=300&fit=crop&q=80",
    cheese:
      "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?w=300&h=300&fit=crop&q=80",
    eggs: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?w=300&h=300&fit=crop&q=80",
    tomato:
      "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?w=300&h=300&fit=crop&q=80",
    carrot:
      "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?w=300&h=300&fit=crop&q=80",
    pasta:
      "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=300&h=300&fit=crop&q=80",
    rice: "https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?w=300&h=300&fit=crop&q=80",
  };

  // Brand-specific images
  private static readonly BRAND_IMAGES = {
    // New Zealand brands
    anchor:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
    mainland:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop&q=80",
    "tip-top":
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&q=80",
    vogels:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&q=80",
    sanitarium:
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=300&fit=crop&q=80",
    "weet-bix":
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=300&fit=crop&q=80",
    pams: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&q=80",
    countdown:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&q=80",
    woolworths:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&q=80",
    "fresh-choice":
      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=300&h=300&fit=crop&q=80",
  };

  // Get product image with intelligent fallbacks
  static async getProductImage(
    productName: string,
    size: "small" | "medium" | "large" = "medium"
  ): Promise<string> {
    const lowerName = productName.toLowerCase();

    // Size parameters
    const sizeParams = {
      small: "w=150&h=150",
      medium: "w=300&h=300",
      large: "w=400&h=400",
    };

    // 1. Try to get scraped image from database first
    try {
      const scrapedImage = await this.getScrapedProductImage(productName);
      if (scrapedImage) {
        return scrapedImage;
      }
    } catch (error) {
      console.warn(`Failed to get scraped image for ${productName}:`, error);
    }

    // 2. Try brand-specific images
    for (const [brand, imageUrl] of Object.entries(this.BRAND_IMAGES)) {
      if (lowerName.includes(brand)) {
        return this.addSizeParams(imageUrl, sizeParams[size]);
      }
    }

    // 3. Try exact keyword matches
    for (const [keyword, imageUrl] of Object.entries(this.PRIMARY_IMAGES)) {
      if (lowerName.includes(keyword)) {
        return this.addSizeParams(imageUrl, sizeParams[size]);
      }
    }

    // 4. Try alternative images
    for (const [keyword, imageUrl] of Object.entries(this.ALTERNATIVE_IMAGES)) {
      if (lowerName.includes(keyword)) {
        return this.addSizeParams(imageUrl, sizeParams[size]);
      }
    }

    // 5. Try partial matches
    const partialMatches = [
      { keywords: ["milk", "dairy"], image: this.PRIMARY_IMAGES.milk },
      {
        keywords: ["bread", "toast", "sandwich"],
        image: this.PRIMARY_IMAGES.bread,
      },
      { keywords: ["apple", "fruit"], image: this.PRIMARY_IMAGES.apple },
      { keywords: ["banana", "fruit"], image: this.PRIMARY_IMAGES.banana },
      {
        keywords: ["cheese", "cheddar", "mozzarella"],
        image: this.PRIMARY_IMAGES.cheese,
      },
      { keywords: ["egg", "eggs"], image: this.PRIMARY_IMAGES.eggs },
      { keywords: ["tomato", "tomatoes"], image: this.PRIMARY_IMAGES.tomato },
      { keywords: ["carrot", "carrots"], image: this.PRIMARY_IMAGES.carrot },
      {
        keywords: ["pasta", "spaghetti", "penne"],
        image: this.PRIMARY_IMAGES.pasta,
      },
      {
        keywords: ["rice", "white rice", "brown rice"],
        image: this.PRIMARY_IMAGES.rice,
      },
      { keywords: ["cereal", "breakfast"], image: this.PRIMARY_IMAGES.cereal },
      { keywords: ["coffee", "espresso"], image: this.PRIMARY_IMAGES.coffee },
      {
        keywords: ["tea", "green tea", "black tea"],
        image: this.PRIMARY_IMAGES.tea,
      },
      {
        keywords: ["juice", "orange juice", "apple juice"],
        image: this.PRIMARY_IMAGES.juice,
      },
      {
        keywords: ["water", "bottled water"],
        image: this.PRIMARY_IMAGES.water,
      },
      { keywords: ["beer", "lager", "ale"], image: this.PRIMARY_IMAGES.beer },
      {
        keywords: ["wine", "red wine", "white wine"],
        image: this.PRIMARY_IMAGES.wine,
      },
      { keywords: ["chips", "crisps"], image: this.PRIMARY_IMAGES.chips },
      {
        keywords: ["chocolate", "dark chocolate", "milk chocolate"],
        image: this.PRIMARY_IMAGES.chocolate,
      },
      {
        keywords: ["nuts", "almonds", "walnuts", "cashews"],
        image: this.PRIMARY_IMAGES.nuts,
      },
      { keywords: ["popcorn", "corn"], image: this.PRIMARY_IMAGES.popcorn },
      {
        keywords: ["toilet paper", "tissue"],
        image: this.PRIMARY_IMAGES["toilet-paper"],
      },
      {
        keywords: ["detergent", "laundry"],
        image: this.PRIMARY_IMAGES.detergent,
      },
      { keywords: ["soap", "hand soap"], image: this.PRIMARY_IMAGES.soap },
      { keywords: ["shampoo", "hair"], image: this.PRIMARY_IMAGES.shampoo },
      {
        keywords: ["toothpaste", "dental"],
        image: this.PRIMARY_IMAGES.toothpaste,
      },
      {
        keywords: ["ice cream", "icecream"],
        image: this.PRIMARY_IMAGES["ice-cream"],
      },
      { keywords: ["pizza", "frozen pizza"], image: this.PRIMARY_IMAGES.pizza },
      { keywords: ["fries", "chips"], image: this.PRIMARY_IMAGES.fries },
    ];

    for (const match of partialMatches) {
      if (match.keywords.some((keyword) => lowerName.includes(keyword))) {
        return this.addSizeParams(match.image, sizeParams[size]);
      }
    }

    // 6. Fallback to category image
    const category = categorizeProduct(productName);
    return this.addSizeParams(category.imageUrl, sizeParams[size]);
  }

  // Get scraped product image from database
  private static async getScrapedProductImage(
    productName: string
  ): Promise<string | null> {
    try {
      // First try to get from products table
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("image_url")
        .ilike("name", `%${productName}%`)
        .not("image_url", "is", null)
        .limit(1)
        .single();

      if (!productError && product?.image_url) {
        return product.image_url;
      }

      // If not found in products table, try price_history table
      const { data: priceData, error: priceError } = await supabase
        .from("price_history")
        .select("image_url")
        .ilike("item_name", `%${productName}%`)
        .not("image_url", "is", null)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (!priceError && priceData?.image_url) {
        return priceData.image_url;
      }

      return null;
    } catch (error) {
      console.warn("Error fetching scraped product image:", error);
      return null;
    }
  }

  // Get category image
  static getCategoryImage(
    categoryId: string,
    size: "small" | "medium" | "large" = "medium"
  ): string {
    const category = categorizeProduct(categoryId);
    const sizeParams = {
      small: "w=150&h=150",
      medium: "w=300&h=300",
      large: "w=400&h=400",
    };

    return this.addSizeParams(category.imageUrl, sizeParams[size]);
  }

  // Add size parameters to image URL
  private static addSizeParams(imageUrl: string, sizeParams: string): string {
    if (imageUrl.includes("?")) {
      return `${imageUrl}&${sizeParams}&fit=crop&q=80`;
    } else {
      return `${imageUrl}?${sizeParams}&fit=crop&q=80`;
    }
  }

  // Get product image with error handling
  static async getProductImageWithFallback(
    productName: string,
    size: "small" | "medium" | "large" = "medium"
  ): Promise<string> {
    try {
      const imageUrl = await this.getProductImage(productName, size);

      // Test if image loads successfully
      const response = await fetch(imageUrl, { method: "HEAD" });
      if (response.ok) {
        return imageUrl;
      }
    } catch (error) {
      console.warn(`Failed to load image for ${productName}:`, error);
    }

    // Return category fallback
    const category = categorizeProduct(productName);
    return this.addSizeParams(
      category.imageUrl,
      {
        small: "w=150&h=150",
        medium: "w=300&h=300",
        large: "w=400&h=400",
      }[size]
    );
  }

  // Get multiple product images for comparison
  static getProductImages(productName: string): {
    primary: string;
    alternative: string;
    category: string;
  } {
    const lowerName = productName.toLowerCase();

    let primary = "";
    let alternative = "";

    // Find primary image
    for (const [keyword, imageUrl] of Object.entries(this.PRIMARY_IMAGES)) {
      if (lowerName.includes(keyword)) {
        primary = imageUrl;
        break;
      }
    }

    // Find alternative image
    for (const [keyword, imageUrl] of Object.entries(this.ALTERNATIVE_IMAGES)) {
      if (lowerName.includes(keyword)) {
        alternative = imageUrl;
        break;
      }
    }

    const category = categorizeProduct(productName);

    return {
      primary: primary || category.imageUrl,
      alternative: alternative || category.imageUrl,
      category: category.imageUrl,
    };
  }
}

// Export convenience functions
export const getProductImage = (
  productName: string,
  size?: "small" | "medium" | "large"
) => ProductImageService.getProductImage(productName, size);

export const getCategoryImage = (
  categoryId: string,
  size?: "small" | "medium" | "large"
) => ProductImageService.getCategoryImage(categoryId, size);

export const getProductImageWithFallback = (
  productName: string,
  size?: "small" | "medium" | "large"
) => ProductImageService.getProductImageWithFallback(productName, size);
