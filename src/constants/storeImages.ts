// Store Images and Branding Configuration
export interface StoreImageConfig {
  logo: string;
  icon: string;
  color: string;
  backgroundColor: string;
  description: string;
}

export const STORE_IMAGES: Record<string, StoreImageConfig> = {
  Countdown: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Countdown_logo.svg/1200px-Countdown_logo.svg.png",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Countdown_logo.svg/200px-Countdown_logo.svg.png",
    color: "#007AFF",
    backgroundColor: "#E3F2FD",
    description:
      "New Zealand's largest supermarket chain with competitive prices and wide selection",
  },
  "New World": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/New_World_logo.svg/1200px-New_World_logo.svg.png",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/New_World_logo.svg/200px-New_World_logo.svg.png",
    color: "#34C759",
    backgroundColor: "#E8F5E8",
    description:
      "Premium supermarket chain known for quality products and fresh produce",
  },
  "Pak'nSave": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Pak%27nSave_logo.svg/1200px-Pak%27nSave_logo.svg.png",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Pak%27nSave_logo.svg/200px-Pak%27nSave_logo.svg.png",
    color: "#FF9500",
    backgroundColor: "#FFF3E0",
    description:
      "Budget-friendly supermarket with bulk buying options and great deals",
  },
  "Four Square": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Four_Square_logo.svg/1200px-Four_Square_logo.svg.png",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Four_Square_logo.svg/200px-Four_Square_logo.svg.png",
    color: "#FF3B30",
    backgroundColor: "#FFEBEE",
    description:
      "Convenient neighborhood stores with essential groceries and local products",
  },
  "Moore Wilson's Fresh": {
    logo: "https://www.moorewilsons.co.nz/wp-content/uploads/2021/03/moore-wilsons-logo.png",
    icon: "https://www.moorewilsons.co.nz/wp-content/uploads/2021/03/moore-wilsons-icon.png",
    color: "#AF52DE",
    backgroundColor: "#F3E5F5",
    description:
      "Premium gourmet supermarket with specialty foods and fresh produce",
  },
  "The Warehouse": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/The_Warehouse_logo.svg/1200px-The_Warehouse_logo.svg.png",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/The_Warehouse_logo.svg/200px-The_Warehouse_logo.svg.png",
    color: "#FF9500",
    backgroundColor: "#FFF3E0",
    description:
      "General merchandise store with grocery section and household items",
  },
  "Fresh Choice": {
    logo: "https://www.freshchoice.co.nz/wp-content/uploads/2021/03/fresh-choice-logo.png",
    icon: "https://www.freshchoice.co.nz/wp-content/uploads/2021/03/fresh-choice-icon.png",
    color: "#FF3B30",
    backgroundColor: "#FFEBEE",
    description:
      "Regional supermarket chain with fresh produce and local products",
  },
};

// Product category images
export const PRODUCT_CATEGORY_IMAGES = {
  grocery:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  "fresh-produce":
    "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=300&fit=crop",
  dairy:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
  meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop",
  household:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  "personal-care":
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
  gourmet:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  premium:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  "general-merchandise":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  regional:
    "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=300&fit=crop",
  "fresh-choice-brand":
    "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=300&fit=crop",
  general:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
};

// Common product images
export const COMMON_PRODUCT_IMAGES = {
  milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  banana:
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&h=200&fit=crop",
  apple:
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop",
  cheese:
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop",
  eggs: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&h=200&fit=crop",
  pasta:
    "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=200&h=200&fit=crop",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop",
  cereal:
    "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=200&h=200&fit=crop",
  yoghurt:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop",
  butter:
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop",
  "toilet-paper":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop",
  detergent:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
  shampoo:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
  toothpaste:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
  beef: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
  chicken:
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
  fish: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
  tomato:
    "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop",
  lettuce:
    "https://images.unsplash.com/photo-1622205313162-be1d5716a43b?w=200&h=200&fit=crop",
  carrot:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop",
  onion:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
  potato:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
};

// Helper function to get product image
export const getProductImage = (productName: string): string => {
  const lowerName = productName.toLowerCase();

  // Check for exact matches first
  for (const [key, image] of Object.entries(COMMON_PRODUCT_IMAGES)) {
    if (lowerName.includes(key)) {
      return image;
    }
  }

  // Check for partial matches
  if (lowerName.includes("milk")) return COMMON_PRODUCT_IMAGES.milk;
  if (lowerName.includes("bread")) return COMMON_PRODUCT_IMAGES.bread;
  if (lowerName.includes("banana")) return COMMON_PRODUCT_IMAGES.banana;
  if (lowerName.includes("apple")) return COMMON_PRODUCT_IMAGES.apple;
  if (lowerName.includes("cheese")) return COMMON_PRODUCT_IMAGES.cheese;
  if (lowerName.includes("egg")) return COMMON_PRODUCT_IMAGES.eggs;
  if (lowerName.includes("pasta")) return COMMON_PRODUCT_IMAGES.pasta;
  if (lowerName.includes("rice")) return COMMON_PRODUCT_IMAGES.rice;
  if (lowerName.includes("cereal")) return COMMON_PRODUCT_IMAGES.cereal;
  if (lowerName.includes("yoghurt")) return COMMON_PRODUCT_IMAGES.yoghurt;
  if (lowerName.includes("butter")) return COMMON_PRODUCT_IMAGES.butter;
  if (lowerName.includes("toilet") || lowerName.includes("paper"))
    return COMMON_PRODUCT_IMAGES["toilet-paper"];
  if (lowerName.includes("detergent")) return COMMON_PRODUCT_IMAGES.detergent;
  if (lowerName.includes("shampoo")) return COMMON_PRODUCT_IMAGES.shampoo;
  if (lowerName.includes("toothpaste")) return COMMON_PRODUCT_IMAGES.toothpaste;
  if (lowerName.includes("beef")) return COMMON_PRODUCT_IMAGES.beef;
  if (lowerName.includes("chicken")) return COMMON_PRODUCT_IMAGES.chicken;
  if (lowerName.includes("fish") || lowerName.includes("salmon"))
    return COMMON_PRODUCT_IMAGES.fish;
  if (lowerName.includes("tomato")) return COMMON_PRODUCT_IMAGES.tomato;
  if (lowerName.includes("lettuce")) return COMMON_PRODUCT_IMAGES.lettuce;
  if (lowerName.includes("carrot")) return COMMON_PRODUCT_IMAGES.carrot;
  if (lowerName.includes("onion")) return COMMON_PRODUCT_IMAGES.onion;
  if (lowerName.includes("potato")) return COMMON_PRODUCT_IMAGES.potato;

  // Default grocery image
  return COMMON_PRODUCT_IMAGES.milk;
};

// Helper function to get store image
export const getStoreImage = (storeName: string): StoreImageConfig => {
  const lowerName = storeName.toLowerCase();

  // Direct key matching first (case-insensitive)
  for (const [key, config] of Object.entries(STORE_IMAGES)) {
    if (lowerName === key.toLowerCase()) {
      return config;
    }
  }

  // Partial matching for variations
  if (lowerName.includes("countdown")) return STORE_IMAGES["Countdown"];
  if (lowerName.includes("new world")) return STORE_IMAGES["New World"];
  if (
    lowerName.includes("pak'n'save") ||
    lowerName.includes("paknsave") ||
    lowerName.includes("pak n save") ||
    lowerName.includes("pak'nsave")
  )
    return STORE_IMAGES["Pak'nSave"];
  if (lowerName.includes("four square")) return STORE_IMAGES["Four Square"];
  if (lowerName.includes("moore wilson"))
    return STORE_IMAGES["Moore Wilson's Fresh"];
  if (lowerName.includes("warehouse")) return STORE_IMAGES["The Warehouse"];
  if (lowerName.includes("fresh choice")) return STORE_IMAGES["Fresh Choice"];

  // Default to Countdown
  return STORE_IMAGES["Countdown"];
};

// Helper function to get category image
export const getCategoryImage = (category: string): string => {
  return (
    PRODUCT_CATEGORY_IMAGES[category as keyof typeof PRODUCT_CATEGORY_IMAGES] ||
    PRODUCT_CATEGORY_IMAGES.general
  );
};
